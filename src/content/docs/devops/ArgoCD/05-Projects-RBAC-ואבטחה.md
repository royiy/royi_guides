# מדריך 5: ArgoCD Projects, RBAC ואבטחה

## למה צריך Projects?

אם יש לכם ריבוי צוותים (Multi-tenancy) שכולם משתמשים באותו ArgoCD instance, אתם לא רוצים שצוות A יוכל לגעת ב-Applications של צוות B, או לפרוס ל-Cluster/Namespace שהוא לא אמור לגעת בו. `AppProject` הוא ה-CRD שמגדיר את הגבולות האלה.

## מבנה AppProject בסיסי

```yaml
apiVersion: argoproj.io/v1alpha1
kind: AppProject
metadata:
  name: team-billing
  namespace: argocd
spec:
  description: "פרויקט עבור צוות ה-Billing"

  # מאיפה מותר למשוך קוד
  sourceRepos:
    - https://github.com/mycompany/billing-service.git
    - https://github.com/mycompany/billing-shared-charts.git

  # לאן מותר לפרוס (Cluster + Namespace)
  destinations:
    - server: https://kubernetes.default.svc
      namespace: billing-dev
    - server: https://kubernetes.default.svc
      namespace: billing-staging
    # שימו לב: בכוונה לא כללנו billing-prod כאן

  # אילו סוגי משאבים מותר ליצור
  clusterResourceWhitelist:
    - group: ''
      kind: Namespace
  namespaceResourceBlacklist:
    - group: ''
      kind: ResourceQuota
    - group: ''
      kind: LimitRange

  roles:
    - name: developer
      description: "הרשאות פיתוח בסיסיות"
      policies:
        - p, proj:team-billing:developer, applications, get, team-billing/*, allow
        - p, proj:team-billing:developer, applications, sync, team-billing/*, allow
      groups:
        - mycompany:billing-developers   # קבוצת SSO
```

### הסבר על השדות המרכזיים

| שדה | תפקיד |
|---|---|
| `sourceRepos` | רשימת ה-Git Repos המורשים לפרויקט הזה בלבד |
| `destinations` | שילובי Cluster+Namespace מותרים |
| `clusterResourceWhitelist` | אילו משאבים ברמת Cluster (לא Namespace) מותר ליצור – ברירת מחדל: כלום |
| `namespaceResourceBlacklist` | משאבים אסורים ברמת Namespace |
| `roles` | תפקידים עם מדיניות RBAC ספציפית לפרויקט |

## RBAC ברמת המערכת (Global RBAC)

זה שונה מ-Project Roles – זו מדיניות שחלה על כל ArgoCD instance, ומוגדרת ב-ConfigMap `argocd-rbac-cm`:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: argocd-rbac-cm
  namespace: argocd
data:
  policy.default: role:readonly

  policy.csv: |
    p, role:admin, applications, *, */*, allow
    p, role:admin, clusters, *, *, allow
    p, role:admin, repositories, *, *, allow

    p, role:ci-bot, applications, sync, */*, allow
    p, role:ci-bot, applications, get, */*, allow

    g, mycompany:platform-team, role:admin
    g, mycompany:billing-developers, role:ci-bot
```

### הסבר תחביר Policy (מבוסס Casbin)

```
p, <subject>, <resource>, <action>, <object>, <effect>
```

- `p, role:ci-bot, applications, sync, */*, allow` – לתפקיד `ci-bot` מותר (`allow`) לבצע `sync` על `applications` בכל Project ובכל Application (`*/*`).
- שורות שמתחילות ב-`g` (group mapping) – ממפות קבוצת SSO/משתמש לתפקיד.

### Resources ו-Actions נפוצים

| Resource | Actions אפשריים |
|---|---|
| `applications` | get, create, update, delete, sync, action, override |
| `clusters` | get, create, update, delete |
| `repositories` | get, create, update, delete |
| `certificates` | get, create, update, delete |
| `projects` | get, create, update, delete |
| `accounts` | get, update |

## חיבור SSO (דוגמה עם GitHub OAuth דרך Dex)

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: argocd-cm
  namespace: argocd
data:
  url: https://argocd.mycompany.com
  dex.config: |
    connectors:
      - type: github
        id: github
        name: GitHub
        config:
          clientID: $dex.github.clientID
          clientSecret: $dex.github.clientSecret
          orgs:
            - name: mycompany
```

יש להוסיף גם Secret עם `dex.github.clientID` ו-`dex.github.clientSecret`.

## ניהול משתמשים מקומיים (Local Accounts)

לפעמים רוצים משתמש מקומי לצורך Automation (למשל CI Pipeline):

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: argocd-cm
  namespace: argocd
data:
  accounts.ci-bot: apiKey
  accounts.ci-bot.enabled: "true"
```

יצירת Token API עבור המשתמש:

```bash
argocd account generate-token --account ci-bot
```

הטוקן הזה משמש בפייפליינים (למשל ב-GitHub Actions) לביצוע `argocd app sync` ללא צורך ב-Username/Password.

## עקרון ה-Least Privilege

כלל אצבע: כל צוות מקבל Project נפרד, עם:

- גישה רק ל-Repos שלו.
- גישה רק ל-Namespaces שלו (ולא ל-Production אלא אם באמת צריך).
- תפקיד (`role`) עם הרשאות מינימליות – לרוב `get` + `sync`, בלי `delete` ל-Junior Devs.

## דוגמה: הגבלת Sync Windows (חלונות זמן לסנכרון)

אפשר להגביל מתי בכלל מותר לבצע Sync (למשל לא לאפשר Deploy אוטומטי בסוף שבוע):

```yaml
apiVersion: argoproj.io/v1alpha1
kind: AppProject
metadata:
  name: team-billing
  namespace: argocd
spec:
  syncWindows:
    - kind: deny
      schedule: '0 18 * * 5'     # יום שישי 18:00
      duration: 60h              # עד יום ראשון בבוקר
      applications:
        - '*'
      manualSync: false
```

## Secrets – ניהול נכון

ArgoCD **לא** אמור להחזיק Secrets גולמיים ב-Git. השיטות המקובלות:

- **Sealed Secrets** (Bitnami) – מצפינים את ה-Secret לפני ה-Commit.
- **External Secrets Operator** – מושך Secrets מ-AWS Secrets Manager / Vault / GCP Secret Manager בזמן ריצה.
- **SOPS** – הצפנה ברמת קובץ, עם אינטגרציה ל-ArgoCD דרך Plugin.

## קישורים חיצוניים

- 📖 [Argo CD – RBAC Configuration](https://argo-cd.readthedocs.io/en/stable/operator-manual/rbac/)
- 📖 [Argo CD – Projects](https://argo-cd.readthedocs.io/en/stable/user-guide/projects/)
- 📖 [Argo CD – SSO Configuration](https://argo-cd.readthedocs.io/en/stable/operator-manual/user-management/)
- 💻 [Sealed Secrets – GitHub](https://github.com/bitnami-labs/sealed-secrets)
- 💻 [External Secrets Operator – GitHub](https://github.com/external-secrets/external-secrets)
- 🎥 [חיפוש יוטיוב: "ArgoCD RBAC and projects explained"](https://www.youtube.com/results?search_query=argocd+rbac+and+projects+explained)
- 🎥 [חיפוש יוטיוב: "ArgoCD SSO GitHub OAuth setup"](https://www.youtube.com/results?search_query=argocd+sso+github+oauth+setup)

## מה הלאה?

במדריך הבא נעמיק ב-Sync Policies, Sync Hooks (PreSync/PostSync) ו-Health Checks מותאמים אישית.
