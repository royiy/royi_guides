# מדריך 3: ארכיטקטורה ורכיבים של ArgoCD

## סקירה כללית

ArgoCD בנוי מכמה רכיבים (Microservices) שרצים כ-Pods בתוך ה-Namespace `argocd`. הבנת התפקיד של כל רכיב חשובה מאוד גם לצורך Troubleshooting וגם לראיונות עבודה.

## הרכיבים המרכזיים

### 1. `argocd-server` (API Server)

- זהו ה-Gateway המרכזי – חושף gRPC/REST API, ומשמש גם את ה-Web UI.
- אחראי על אימות משתמשים (Authentication), הרשאות (RBAC), וניהול Sessions.
- כל בקשה מה-CLI (`argocd`) או מה-UI עוברת דרכו.

### 2. `argocd-repo-server`

- אחראי לשכפל (Clone) ולנהל Cache של Git Repositories.
- מריץ את "מנועי הרינדור" – כלומר מייצר את המניפסטים הסופיים מתוך:
  - קבצי YAML גולמיים
  - Helm Charts (`helm template`)
  - Kustomize (`kustomize build`)
  - Jsonnet
  - Plugins מותאמים אישית (Config Management Plugins)
- לא מחזיק State לגבי ה-Cluster – רק אחראי על "מה כתוב ב-Git".

### 3. `argocd-application-controller`

- ה"מוח" האמיתי של ArgoCD.
- רץ בלולאה (Control Loop) שכל הזמן משווה בין:
  - **Desired State** (המניפסטים שמגיעים מה-repo-server)
  - **Live State** (המצב בפועל ב-Cluster, נקרא ממטמון של Kubernetes API)
- מזהה הבדלים (Diff), מעדכן את שדה ה-`status.sync` וה-`status.health` על ה-Application object.
- מבצע בפועל את פעולת ה-`kubectl apply` כשיש Sync (אוטומטי או ידני).

### 4. `argocd-dex-server`

- רכיב אימות (Authentication) שמבוסס על [Dex](https://dexidp.io/) – מאפשר OIDC / SSO מול ספקים חיצוניים (GitHub, GitLab, Google, Okta, LDAP וכו').
- לא חובה להשתמש בו אם עובדים עם Local Users או SSO חיצוני שמוגדר ישירות.

### 5. `argocd-redis`

- Cache פנימי – משמש לשמירת תוצאות ביניים (כמו Live State) כדי להקטין עומס על ה-Kubernetes API Server.

### 6. `argocd-notifications-controller` (אופציונלי)

- שולח התראות (Slack, Email, Webhook) על אירועים כמו Sync הצליח/נכשל, Health השתנה וכו'.

### 7. `argocd-applicationset-controller` (אופציונלי אך נפוץ מאוד)

- מנהל את ה-CRD `ApplicationSet`, שמאפשר ליצור עשרות/מאות Applications באופן דינמי (למשל: Application אחד לכל Cluster, או לכל תיקייה ב-Repo). נרחיב במדריך 7.

## דיאגרמת זרימה (טקסטואלית)

```
[Git Repository] 
      │
      ▼
[argocd-repo-server]  ──render──▶  Kubernetes Manifests (YAML)
      │
      ▼
[argocd-application-controller] ──compare──▶ [Kubernetes API / Live Cluster]
      │
      ▼
   Sync (kubectl apply) ──▶ [Cluster State מתעדכן]
      │
      ▼
[argocd-server (API+UI)] ◀── משתמשים צופים/מפעילים Sync דרך UI/CLI
```

## CRDs מרכזיים

| CRD | תפקיד |
|---|---|
| `Application` | מייצג אפליקציה בודדת – Source + Destination + SyncPolicy |
| `AppProject` | קבוצת הרשאות/גבולות סביב מספר Applications |
| `ApplicationSet` | "מפעל" ליצירת Applications רבים אוטומטית |

## Namespace-scoped vs Cluster-scoped Install

ArgoCD יכול לרוץ בשתי צורות:

- **Cluster-wide** – ArgoCD יכול לפרוס לכל Namespace/Cluster שמוגדר אליו.
- **Namespace-scoped** – מוגבל ל-Namespace אחד בלבד (שימושי לריבוי-דיירים / Multi-tenancy, כשכל צוות מקבל instance נפרד).

## איך ArgoCD "יודע" שיש Drift?

ה-`application-controller` מריץ לולאת Reconciliation (בדרך כלל כל 3 דקות כברירת מחדל, ניתן לשנות ב-`timeout.reconciliation`), וגם מאזין ל-Watch Events מה-Kubernetes API בזמן אמת. כשמתגלה הבדל בין Git ל-Live:

- ה-Application מסומן כ-`OutOfSync`.
- אם מוגדר `selfHeal: true` – מתבצע Sync אוטומטי מיידי.
- אם לא – מחכה לאישור ידני (או ל-Sync המתוזמן הבא).

## דוגמה: בדיקת סטטוס הרכיבים בפועל

```bash
kubectl get pods -n argocd -o wide
kubectl get deployments -n argocd
kubectl logs -n argocd deploy/argocd-application-controller --tail=100
kubectl logs -n argocd deploy/argocd-repo-server --tail=100
```

## דוגמה: הגדלת Resources לרכיבים (Production)

```yaml
# ב-values.yaml של Helm Chart
controller:
  resources:
    requests:
      cpu: 500m
      memory: 512Mi
    limits:
      cpu: "1"
      memory: 1Gi

repoServer:
  replicas: 2
  resources:
    requests:
      cpu: 250m
      memory: 256Mi
```

## טיפ: כשיש הרבה Applications (100+)

- הגדילו את מספר ה-Replicas של `argocd-repo-server` (הוא ה-Bottleneck הכי נפוץ, כי כל Render עובר דרכו).
- שקלו Sharding של ה-`application-controller` (ArgoCD תומך ב-Sharding מבוסס Cluster כדי לפזר עומס בין כמה Instances של הבקר).
- הפעילו `ARGOCD_APPLICATION_CONTROLLER_REPLICAS` יחד עם אסטרטגיית Sharding מתאימה.

## קישורים חיצוניים

- 📖 [Argo CD Architecture Overview](https://argo-cd.readthedocs.io/en/stable/operator-manual/architecture/)
- 📖 [Dex – OIDC Provider](https://dexidp.io/)
- 💻 [ApplicationSet Controller – GitHub](https://github.com/argoproj/applicationset)
- 🎥 [חיפוש יוטיוב: "ArgoCD architecture deep dive"](https://www.youtube.com/results?search_query=argocd+architecture+deep+dive)
- 🎥 [חיפוש יוטיוב: "ArgoCD application controller explained"](https://www.youtube.com/results?search_query=argocd+application+controller+explained)

## מה הלאה?

במדריך הבא ניצור Application ראשונה שלכם בפועל, נבין את מבנה ה-YAML לעומק, ונבצע Sync ראשון.
