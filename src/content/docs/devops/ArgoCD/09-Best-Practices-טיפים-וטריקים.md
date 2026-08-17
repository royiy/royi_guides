# מדריך 9: Best Practices, טיפים וטריקים, Troubleshooting

## App of Apps Pattern

דפוס ניהול נפוץ מאוד: Application "שורש" (Root App) שכל מה שהוא עושה הוא ליצור עוד Applications:

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: root-app
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/mycompany/gitops-repo.git
    targetRevision: main
    path: argocd-apps
  destination:
    server: https://kubernetes.default.svc
    namespace: argocd
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
```

כאשר בתיקייה `argocd-apps/` יושבים קבצי YAML נוספים, כל אחד מגדיר `Application` בפני עצמו (billing-app.yaml, frontend-app.yaml וכו'). כך ניתן "לבוטסטרפ" (Bootstrap) Cluster שלם ממקור אחד. כיום, בהרבה מקרים עדיף להשתמש ב-ApplicationSet במקום, אבל App of Apps עדיין שימושי לתרחישים פשוטים יותר.

## מבנה Repository מומלץ – Mono-repo מול Multi-repo

| גישה | יתרונות | חסרונות |
|---|---|---|
| **Mono-repo** (Repo אחד לכל התשתית) | קל לראות את כל התמונה, PR אחד יכול לשנות כמה שירותים | Repo יכול להיות גדול, יותר קונפליקטים בין צוותים |
| **Multi-repo** (Repo נפרד לכל שירות/צוות) | בידוד טוב, כל צוות שולט ב-Repo שלו | קשה יותר לראות שינויים cross-service, יותר תחזוקה |

הרבה ארגונים מאמצים **גישה היברידית**: Repo נפרד לכל אפליקציה (קוד + Dockerfile + Helm Chart), ו-Repo נפרד ל"gitops-config" שמכיל רק את הגדרות ה-Deploy (Values, Overlays) – כך שינוי Config לא דורש Build מחדש.

## הפרדת Repo של קוד מ-Repo של Config (חשוב מאוד!)

**אנטי-פטרן נפוץ**: לשים את קובצי ה-Kubernetes Manifests באותו Repo כמו קוד האפליקציה, ולתת ל-CI לעדכן אותם ישירות (Commit אוטומטי חזרה לאותו Repo). זה עובד, אבל עלול ליצור לולאות Trigger מיותרות ובלבול.

**Best Practice**: Repo נפרד ("gitops" / "deploy" repo) שרק ה-CI Pipeline (או Bot) מעדכן אוטומטית עם ה-Image Tag החדש, בעוד מפתחים ממשיכים לעבוד ב-Repo של הקוד בלי נגיעה בקונפיג הפריסה.

## Image Updater – עדכון Tags אוטומטי

הכלי [Argo CD Image Updater](https://argocd-image-updater.readthedocs.io/) בודק Registry (Docker Hub, ECR, GCR) לגרסאות חדשות של Image, ומעדכן את ה-Git (או ישירות את ה-Application) אוטומטית:

```yaml
metadata:
  annotations:
    argocd-image-updater.argoproj.io/image-list: myapp=myregistry/myapp
    argocd-image-updater.argoproj.io/myapp.update-strategy: semver
    argocd-image-updater.argoproj.io/write-back-method: git
```

## Notifications – התראות ל-Slack

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: argocd-notifications-cm
  namespace: argocd
data:
  service.slack: |
    token: $slack-token

  trigger.on-sync-failed: |
    - when: app.status.operationState.phase in ['Error', 'Failed']
      send: [slack-sync-failed]

  template.slack-sync-failed: |
    message: |
      ⚠️ Sync נכשל עבור {{.app.metadata.name}}!
      פרטים: {{.app.status.operationState.message}}

  subscriptions: |
    - recipients:
        - slack-devops-alerts
      triggers:
        - on-sync-failed
```

## טיפים כלליים לביצועים (Performance)

1. **הגדילו Replicas ל-repo-server** אם יש הרבה Applications – זה בדרך כלל הצוואר בקבוק הראשון.
2. **הפעילו Manifest Caching** – ArgoCD כבר עושה זאת כברירת מחדל דרך Redis, ודאו ש-Redis לא underprovisioned.
3. **השתמשו ב-`ApplyOutOfSyncOnly=true`** כדי לא לעבד מחדש משאבים שלא השתנו.
4. **הימנעו מ-Wildcard Repos גדולים מדי** – Monorepo ענק עם אלפי קבצים מאט את ה-Git Clone וה-Render.
5. **הגדירו `.argocdignore`** בדומה ל-`.gitignore` כדי למנוע סריקת קבצים לא רלוונטיים.

## Troubleshooting נפוץ

### Application תקוע ב-`Progressing`

```bash
argocd app get my-app
kubectl describe deployment my-app -n my-namespace
kubectl get events -n my-namespace --sort-by='.lastTimestamp'
```
לרוב הסיבה: Pod לא עולה (ImagePullBackOff, CrashLoopBackOff, Readiness Probe נכשל).

### `ComparisonError` – Repo Server לא מצליח לרנדר

```bash
kubectl logs -n argocd deploy/argocd-repo-server --tail=200
```
סיבות נפוצות: שגיאת Syntax ב-Helm/Kustomize, Chart.yaml חסר, גישה ל-Git נכשלת (SSH Key / Token פג תוקף).

### Sync נתקע (Stuck) בלי להתקדם

```bash
argocd app sync my-app --force
```
לפעמים עוזר גם:
```bash
argocd app terminate-op my-app   # מבטל Operation תקוע
```

### "OutOfSync" למרות שהכל נראה זהה

לרוב זה קורה בגלל:
- Defaults שמזריקים Controllers/Admission Webhooks (כמו `imagePullPolicy` שמתווסף אוטומטית).
- שדות שמוזרקים ב-Runtime (כמו `resourceVersion`, Timestamps).
- פתרון: הגדירו `ignoreDifferences`:

```yaml
spec:
  ignoreDifferences:
    - group: apps
      kind: Deployment
      jsonPointers:
        - /spec/replicas   # למשל אם HPA שולט ב-replicas
    - group: ""
      kind: ConfigMap
      jqPathExpressions:
        - .data.timestamp
```

### גישה ל-Repo פרטי נכשלת (`authentication required`)

```bash
argocd repo add https://github.com/mycompany/private-repo.git \
  --username git \
  --password <PAT_TOKEN>
```
או עם SSH:
```bash
argocd repo add git@github.com:mycompany/private-repo.git \
  --ssh-private-key-path ~/.ssh/id_rsa
```

## Dry-Run לפני Production

```bash
argocd app sync my-app --dry-run
```

מציג בדיוק מה ישתנה בלי לבצע בפועל.

## שימוש ב-`argocd app diff` ב-CI כ-Gate

הרבה צוותים מריצים `argocd app diff` כחלק מ-Pull Request Check, כדי להראות ל-Reviewer בדיוק מה ישתנה ב-Cluster לפני שה-PR ממוזג.

## אבטחת ה-`argocd-server` עצמו

- הפעילו TLS אמיתי (לא Self-Signed) ב-Production.
- הגבילו גישה ל-UI/API רק דרך VPN או IP Allowlist במידת הצורך.
- הפכו `admin` ללא זמין לאחר הגדרת SSO (`accounts.admin.enabled: "false"`).
- הפעילו Audit Logging.

## קישורים חיצוניים

- 📖 [Argo CD – Best Practices](https://argo-cd.readthedocs.io/en/stable/user-guide/best_practices/)
- 📖 [Argo CD – Troubleshooting Guide](https://argo-cd.readthedocs.io/en/stable/faq/)
- 💻 [Argo CD Image Updater](https://argocd-image-updater.readthedocs.io/)
- 📖 [Argo CD – Notifications](https://argo-cd.readthedocs.io/en/stable/operator-manual/notifications/)
- 🎥 [חיפוש יוטיוב: "ArgoCD best practices production"](https://www.youtube.com/results?search_query=argocd+best+practices+production)
- 🎥 [חיפוש יוטיוב: "ArgoCD troubleshooting common issues"](https://www.youtube.com/results?search_query=argocd+troubleshooting+common+issues)

## מה הלאה?

המדריך האחרון בסדרה מרכז שאלות ראיון עבודה נפוצות על ArgoCD, עם תשובות מפורטות.
