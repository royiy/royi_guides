# מדריך 8: ArgoCD + Helm / Kustomize – אינטגרציה מעמיקה

## שיטות ניהול מניפסטים ב-ArgoCD

ArgoCD תומך "מהקופסה" במספר "מנועי רינדור" (Config Management Tools):

1. **YAML גולמי** (Plain manifests)
2. **Helm**
3. **Kustomize**
4. **Jsonnet**
5. **Config Management Plugins (CMP)** – כלים מותאמים אישית

ה-`argocd-repo-server` מזהה אוטומטית איזה סוג להשתמש (למשל אם יש `Chart.yaml` – זה Helm; אם יש `kustomization.yaml` – זה Kustomize).

## Helm – שימוש בסיסי

### Application שמפנה ל-Chart בתוך Git Repo

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: my-app-helm
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/mycompany/charts.git
    targetRevision: main
    path: charts/my-app
    helm:
      releaseName: my-app
      valueFiles:
        - values.yaml
        - values-prod.yaml
      parameters:
        - name: image.tag
          value: "1.4.2"
        - name: replicaCount
          value: "3"
  destination:
    server: https://kubernetes.default.svc
    namespace: my-app-prod
```

### שימוש ב-Helm Repository חיצוני (לא Git)

```yaml
spec:
  source:
    repoURL: https://charts.bitnami.com/bitnami
    chart: redis
    targetRevision: 20.1.0
    helm:
      values: |
        architecture: standalone
        auth:
          enabled: true
          existingSecret: redis-auth
```

### Multiple Sources – Helm Chart + Values מ-Repo נפרד

תכונה שימושית מאוד: אפשר לשלב Chart אחד (למשל צד שלישי) עם קובץ Values שמגיע מ-Repo אחר לגמרי:

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: redis-with-external-values
  namespace: argocd
spec:
  project: default
  sources:
    - repoURL: https://charts.bitnami.com/bitnami
      chart: redis
      targetRevision: 20.1.0
      helm:
        valueFiles:
          - $values/redis/values-prod.yaml
    - repoURL: https://github.com/mycompany/gitops-values.git
      targetRevision: main
      ref: values
  destination:
    server: https://kubernetes.default.svc
    namespace: redis
```

השדה `ref: values` מגדיר "כינוי" למקור השני, ואז מפנים אליו עם `$values/...` בתוך ה-Chart הראשון.

### Helm Hooks מול ArgoCD Sync Hooks

⚠️ שימו לב: ArgoCD **לא** מריץ Helm Hooks (`helm.sh/hook`) כברירת מחדל באותו אופן ש-Helm עצמו היה מריץ. ArgoCD ממיר חלק מהם ל-Sync Hooks המקבילים שלו, אבל מומלץ להשתמש ישירות ב-`argocd.argoproj.io/hook` (ראו מדריך 6) לשליטה מלאה.

## Kustomize – שימוש בסיסי

### מבנה תיקיות טיפוסי

```
my-app/
├── base/
│   ├── deployment.yaml
│   ├── service.yaml
│   └── kustomization.yaml
└── overlays/
    ├── dev/
    │   ├── kustomization.yaml
    │   └── patch-replicas.yaml
    └── prod/
        ├── kustomization.yaml
        └── patch-replicas.yaml
```

`base/kustomization.yaml`:

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
resources:
  - deployment.yaml
  - service.yaml
```

`overlays/prod/kustomization.yaml`:

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
resources:
  - ../../base
patches:
  - path: patch-replicas.yaml
images:
  - name: my-app
    newTag: "1.4.2"
namePrefix: prod-
```

### Application שמפנה ל-Overlay

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: my-app-prod
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/mycompany/my-app.git
    targetRevision: main
    path: overlays/prod
  destination:
    server: https://kubernetes.default.svc
    namespace: my-app-prod
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
```

### שינוי Image Tag דינמית דרך ArgoCD (בלי לערוך kustomization.yaml)

```yaml
spec:
  source:
    path: overlays/prod
    kustomize:
      images:
        - my-app=myregistry/my-app:1.5.0
      namePrefix: prod-
```

זה שימושי מאוד לשילוב עם CI – פייפליין ה-CI יכול "לדרוס" את ה-Tag בלי לגעת בכלל בקבצי ה-Repo (למרות שבגישת GitOps טהורה, מומלץ עדיין לעדכן את ה-Git עצמו כדי לשמור על היסטוריה מלאה).

## Helm מול Kustomize – מתי להשתמש במה?

| קריטריון | Helm | Kustomize |
|---|---|---|
| Templating מורכב (loops, conditions) | ✅ חזק מאוד | ❌ מוגבל (strategic merge patches) |
| למידה למתחילים | ⚠️ תחביר Go Templates לא תמיד אינטואיטיבי | ✅ פשוט יותר, YAML טהור |
| שיתוף Charts ציבוריים (Bitnami, Prometheus וכו') | ✅ אקוסיסטם ענק | ❌ אין תקן דומה |
| ניהול Overlays בין סביבות | ⚠️ אפשרי עם values files, אבל פחות "נקי" | ✅ תוכנן בדיוק לזה |
| חתימה ואימות (Provenance) | ✅ תמיכה מובנית | ❌ אין |

**המלצה מעשית**: הרבה ארגונים בפועל משתמשים בשילוב – Helm ל-Charts של צד שלישי (כמו Redis, Prometheus, Ingress-Nginx), ו-Kustomize לניהול ה-Overlays הפנימיים של האפליקציות שלהם.

## Config Management Plugin (CMP) – למקרים מיוחדים

אם אתם משתמשים בכלי לא סטנדרטי (למשל `cdk8s`, `Tanka`, סקריפט Python מותאם), אפשר להגדיר Plugin:

```yaml
apiVersion: argoproj.io/v1alpha1
kind: ConfigManagementPlugin
metadata:
  name: cdk8s-plugin
spec:
  generate:
    command: ["sh", "-c"]
    args: ["cdk8s synth -o -"]
```

## דוגמה: בדיקת ה-Render לפני Commit (מקומית)

```bash
# Helm
helm template my-app charts/my-app -f values-prod.yaml

# Kustomize
kustomize build overlays/prod
```

תמיד כדאי להריץ את זה לוקאלית לפני ה-Push, כדי לתפוס טעויות תחביר מוקדם.

## קישורים חיצוניים

- 📖 [Argo CD – Helm](https://argo-cd.readthedocs.io/en/stable/user-guide/helm/)
- 📖 [Argo CD – Kustomize](https://argo-cd.readthedocs.io/en/stable/user-guide/kustomize/)
- 📖 [Argo CD – Multiple Sources](https://argo-cd.readthedocs.io/en/stable/user-guide/multiple_sources/)
- 💻 [Kustomize – אתר רשמי](https://kustomize.io/)
- 🎥 [חיפוש יוטיוב: "ArgoCD Helm vs Kustomize comparison"](https://www.youtube.com/results?search_query=argocd+helm+vs+kustomize+comparison)
- 🎥 [חיפוש יוטיוב: "ArgoCD multiple sources helm values"](https://www.youtube.com/results?search_query=argocd+multiple+sources+helm+values)

## מה הלאה?

במדריך הבא – Best Practices, טיפים וטריקים, ו-Troubleshooting מתקדם לבעיות נפוצות.
