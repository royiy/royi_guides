---
title: "Sync Policies, Sync Hooks ו-Health Checks"
category: DevOps/ArgoCD
part: 6/10
---

## Sync Policies – הבדלים בין האופציות

```yaml
syncPolicy:
  automated:
    prune: true       # מוחק משאבים שהוסרו מ-Git
    selfHeal: true     # מתקן Drift אוטומטית
    allowEmpty: false  # לא מאפשר Sync ל-Application "ריק" (בטיחות)
  syncOptions:
    - CreateNamespace=true
    - PrunePropagationPolicy=foreground
    - PruneLast=true
    - ApplyOutOfSyncOnly=true
    - Validate=false
  retry:
    limit: 5
    backoff:
      duration: 5s
      factor: 2
      maxDuration: 3m
```

### הסבר לכל אופציה

| אופציה | מה היא עושה |
|---|---|
| `prune` | מאפשר מחיקה אוטומטית של משאבים שהוסרו מה-Repo |
| `selfHeal` | אם מישהו עשה שינוי ידני ב-Cluster – ArgoCD יחזיר את המצב למה שכתוב ב-Git |
| `allowEmpty` | בברירת מחדל `false` – מונע מצב שבו Application "מתרוקן" בטעות (למשל אם הנתיב ב-Git נמחק) |
| `CreateNamespace=true` | יוצר את ה-Namespace אם לא קיים |
| `PrunePropagationPolicy` | קובע איך Kubernetes ימחק אובייקטים תלויים (foreground/background/orphan) |
| `PruneLast=true` | מבצע Prune *אחרי* שכל שאר המשאבים הצליחו להסתנכרן – מונע מצב ביניים שבור |
| `ApplyOutOfSyncOnly=true` | מסנכרן רק משאבים שבאמת השתנו – מייעל ומקטין את ה-Load |
| `Validate=false` | מדלג על ולידציית Schema של Kubernetes – שימושי ל-CRDs מותאמים |

## Retry Strategy

בעולם אמיתי, Sync יכול להיכשל זמנית (למשל בגלל Webhook Admission Controller עמוס). ה-`retry` מגדיר Exponential Backoff – החל מ-5 שניות, מכפיל פי 2 בכל ניסיון, עד מקסימום 3 דקות, עד 5 ניסיונות.

## Sync Hooks – מה זה?

Hooks מאפשרים להריץ פעולות (בדרך כלל Kubernetes Jobs) **לפני**, **אחרי**, או **במקום** שלב מסוים בתהליך ה-Sync. שימושי מאוד ל-Database Migrations, בדיקות Smoke Test, ניקוי משאבים ישנים ועוד.

### סוגי Hooks

| Hook | מתי רץ |
|---|---|
| `PreSync` | לפני שמתחיל ה-Sync בפועל |
| `Sync` | במקביל לשלב ה-Sync הרגיל (נדיר יחסית) |
| `PostSync` | אחרי שכל המשאבים הגיעו למצב Healthy |
| `SyncFail` | אם ה-Sync נכשל |

### דוגמה: PreSync Hook עבור Database Migration

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: db-migrate
  annotations:
    argocd.argoproj.io/hook: PreSync
    argocd.argoproj.io/hook-delete-policy: HookSucceeded
spec:
  template:
    spec:
      containers:
        - name: migrate
          image: mycompany/billing-service:1.4.2
          command: ["./migrate.sh"]
      restartPolicy: Never
  backoffLimit: 2
```

### הסבר `hook-delete-policy`

| ערך | התנהגות |
|---|---|
| `HookSucceeded` | מוחק את ה-Job אחרי שהצליח |
| `HookFailed` | מוחק את ה-Job אחרי שנכשל |
| `BeforeHookCreation` | מוחק את ה-Job הקודם *לפני* יצירת חדש (מונע התנגשות שמות) |

### דוגמה: PostSync Hook – Smoke Test

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: smoke-test
  annotations:
    argocd.argoproj.io/hook: PostSync
    argocd.argoproj.io/hook-delete-policy: HookSucceeded, HookFailed
spec:
  template:
    spec:
      containers:
        - name: smoke-test
          image: curlimages/curl:8.10.1
          command: ["curl", "-f", "http://billing-service:8080/healthz"]
      restartPolicy: Never
```

### דוגמה: SyncFail Hook – שליחת התראה

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: notify-failure
  annotations:
    argocd.argoproj.io/hook: SyncFail
spec:
  template:
    spec:
      containers:
        - name: notify
          image: curlimages/curl:8.10.1
          command:
            - curl
            - -X
            - POST
            - -d
            - '{"text":"Sync נכשל בסביבת Production!"}'
            - $(SLACK_WEBHOOK_URL)
      restartPolicy: Never
```

## Sync Waves – שליטה על סדר הפריסה

לפעמים חשוב שמשאבים מסוימים יעלו לפני אחרים (למשל CRD לפני CR שמשתמש בו, או Database לפני ה-Backend). זה נעשה עם `sync-wave`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres
  annotations:
    argocd.argoproj.io/sync-wave: "0"   # רץ ראשון
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  annotations:
    argocd.argoproj.io/sync-wave: "1"   # רץ אחרי postgres
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
  annotations:
    argocd.argoproj.io/sync-wave: "2"   # רץ אחרון
```

מספרים נמוכים יותר רצים קודם. ArgoCD ממתין שכל המשאבים ב-Wave מסוים יגיעו ל-Healthy לפני שהוא ממשיך ל-Wave הבא.

## Health Checks – איך ArgoCD קובע "Healthy"?

ArgoCD כולל Health Checks מובנים לרוב סוגי המשאבים הנפוצים (Deployment, StatefulSet, Ingress, Job, PVC וכו'). לדוגמה, עבור Deployment הוא בודק ש-`status.availableReplicas == spec.replicas`.

### Custom Health Check (עבור CRDs)

לפעמים יש CRD מותאם אישית (למשל מ-Operator חיצוני) ש-ArgoCD לא יודע איך לבדוק. פותרים זאת ב-ConfigMap `argocd-cm` עם קוד Lua:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: argocd-cm
  namespace: argocd
data:
  resource.customizations.health.mycompany.io_DatabaseCluster: |
    hs = {}
    if obj.status ~= nil then
      if obj.status.phase == "Running" then
        hs.status = "Healthy"
        hs.message = "Database is running"
        return hs
      end
      if obj.status.phase == "Failed" then
        hs.status = "Degraded"
        hs.message = "Database failed"
        return hs
      end
    end
    hs.status = "Progressing"
    hs.message = "Waiting for database status"
    return hs
```

## דוגמה מלאה: Application עם Waves + Hooks

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: billing-service
  namespace: argocd
spec:
  project: team-billing
  source:
    repoURL: https://github.com/mycompany/billing-service.git
    targetRevision: main
    path: k8s/overlays/prod
  destination:
    server: https://kubernetes.default.svc
    namespace: billing-prod
  syncPolicy:
    automated:
      prune: true
      selfHeal: false   # ב-Production לפעמים מעדיפים לא selfHeal אוטומטי
    syncOptions:
      - PruneLast=true
      - ApplyOutOfSyncOnly=true
    retry:
      limit: 5
      backoff:
        duration: 5s
        factor: 2
        maxDuration: 3m
```

## טיפ מקצועי

בסביבות Production רגישות (כמו Billing, Payments), מקובל להשאיר `selfHeal: false` ולדרוש אישור ידני ל-Sync (Manual Approval), במיוחד אם משלבים את זה עם Sync Windows וגם עם מערכת אישורים (למשל דרך Slack Approval Bot).

## קישורים חיצוניים

- 📖 [Argo CD – Sync Phases and Waves](https://argo-cd.readthedocs.io/en/stable/user-guide/sync-waves/)
- 📖 [Argo CD – Resource Hooks](https://argo-cd.readthedocs.io/en/stable/user-guide/resource_hooks/)
- 📖 [Argo CD – Health Assessment](https://argo-cd.readthedocs.io/en/stable/operator-manual/health/)
- 🎥 [חיפוש יוטיוב: "ArgoCD sync waves and hooks tutorial"](https://www.youtube.com/results?search_query=argocd+sync+waves+and+hooks+tutorial)
- 🎥 [חיפוש יוטיוב: "ArgoCD custom health check Lua"](https://www.youtube.com/results?search_query=argocd+custom+health+check+lua)

## מה הלאה?

במדריך הבא נלמד על ApplicationSets ופריסה למספר Clusters במקביל.
