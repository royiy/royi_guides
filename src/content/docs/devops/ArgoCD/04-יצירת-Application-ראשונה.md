---
title: "יצירת Application ראשונה – מדריך מעשי מלא"
category: DevOps/ArgoCD
part: 4/10
---

## הכנה: Repo לדוגמה

נשתמש ב-Repo הרשמי לדוגמאות של Argo: [argocd-example-apps](https://github.com/argoproj/argocd-example-apps).

## דרך 1: יצירת Application דרך ה-CLI

```bash
argocd app create guestbook \
  --repo https://github.com/argoproj/argocd-example-apps.git \
  --path guestbook \
  --dest-server https://kubernetes.default.svc \
  --dest-namespace default
```

הסבר על הפרמטרים:

- `--repo` – כתובת ה-Git Repo.
- `--path` – הנתיב בתוך ה-Repo שבו נמצאים המניפסטים.
- `--dest-server` – כתובת ה-API Server של Cluster היעד. `https://kubernetes.default.svc` = ה-Cluster המקומי שבו ArgoCD עצמו רץ.
- `--dest-namespace` – ה-Namespace שאליו נפרוס.

## דרך 2: יצירת Application דרך YAML (מומלץ – זה בעצמו GitOps!)

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: guestbook
  namespace: argocd
  finalizers:
    - resources-finalizer.argocd.argoproj.io
spec:
  project: default
  source:
    repoURL: https://github.com/argoproj/argocd-example-apps.git
    targetRevision: HEAD
    path: guestbook
  destination:
    server: https://kubernetes.default.svc
    namespace: default
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
      - CreateNamespace=true
```

שמרו כ-`guestbook-app.yaml` והריצו:

```bash
kubectl apply -f guestbook-app.yaml -n argocd
```

### הסבר לשדה `finalizers`

הוספת `resources-finalizer.argocd.argoproj.io` גורמת לכך שכאשר מוחקים את ה-Application object, ArgoCD ימחק גם את כל המשאבים שהוא יצר ב-Cluster (Cascade Delete). בלי זה, מחיקת ה-Application תשאיר את המשאבים "יתומים" ב-Cluster.

### הסבר לשדה `syncOptions`

- `CreateNamespace=true` – ייצור את ה-Namespace אוטומטית אם הוא לא קיים.
- אופציות נוספות נפוצות: `PrunePropagationPolicy=foreground`, `PruneLast=true`, `ApplyOutOfSyncOnly=true`.

## דרך 3: יצירת Application דרך ה-UI

1. לחצו על **+ NEW APP** בממשק.
2. מלאו:
   - **Application Name**: guestbook
   - **Project**: default
   - **Sync Policy**: Manual (בהתחלה)
   - **Repository URL**: https://github.com/argoproj/argocd-example-apps.git
   - **Path**: guestbook
   - **Cluster URL**: https://kubernetes.default.svc
   - **Namespace**: default
3. לחצו **Create**.

## צפייה במצב ה-Application

```bash
argocd app get guestbook
```

פלט לדוגמה (מקוצר):

```
Name:               argocd/guestbook
Project:            default
Server:             https://kubernetes.default.svc
Namespace:          default
Sync Status:        OutOfSync
Health Status:      Missing
```

## ביצוע Sync ראשון

### דרך CLI

```bash
argocd app sync guestbook
```

### דרך UI

לחצו על כפתור **SYNC** הכחול הגדול, אשרו את המשאבים לסנכרון, ולחצו **Synchronize**.

לאחר מספר שניות, הסטטוס אמור להשתנות ל:

```
Sync Status:        Synced
Health Status:      Healthy
```

## בדיקה שהכל עבד ב-Cluster

```bash
kubectl get pods -n default
kubectl get svc -n default
```

## הבנת ה-Diff לפני Sync

לפני שמאשרים Sync, כדאי תמיד לבדוק מה בדיוק ישתנה:

```bash
argocd app diff guestbook
```

זה מציג Diff בסגנון git – מה קיים ב-Live לעומת מה שיהיה אחרי Sync.

## History ו-Rollback

ArgoCD שומר היסטוריית Sync-ים:

```bash
argocd app history guestbook
```

פלט לדוגמה:

```
ID  DATE                           REVISION
0   2026-08-10 10:15:32 +0300 IDT  a1b2c3d
1   2026-08-11 14:02:11 +0300 IDT  d4e5f6a
```

Rollback לגרסה קודמת:

```bash
argocd app rollback guestbook 0
```

⚠️ שימו לב: Rollback דרך ArgoCD משנה רק את המצב ב-Cluster זמנית. אם Automated Sync פעיל, ArgoCD יחזיר את המצב לגרסה העדכנית ב-Git בפעם הבאה שירוץ Reconciliation! ה-Rollback ה"נכון" ב-GitOps האמיתי הוא **Git Revert** על ה-commit הבעייתי.

## דוגמה: Application עם Helm Chart כמקור

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: nginx-ingress
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://kubernetes.github.io/ingress-nginx
    chart: ingress-nginx
    targetRevision: 4.11.2
    helm:
      values: |
        controller:
          replicaCount: 2
          service:
            type: LoadBalancer
  destination:
    server: https://kubernetes.default.svc
    namespace: ingress-nginx
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
      - CreateNamespace=true
```

שימו לב ש-`repoURL` כאן הוא Helm Repository (לא Git), ולכן משתמשים בשדה `chart` בנוסף.

## מחיקת Application

```bash
argocd app delete guestbook
```

או:

```bash
kubectl delete application guestbook -n argocd
```

עם ה-`finalizer` שהוספנו, פעולה זו תמחק גם את כל משאבי ה-Cluster שנוצרו על ידי ה-Application.

## טעויות נפוצות של מתחילים

1. **לשכוח `targetRevision`** – אם לא מוגדר, ArgoCD ישתמש ב-`HEAD`, מה שעלול להוביל לחוסר עקביות בין סביבות.
2. **לתת ל-`automated.selfHeal` לרוץ על Production בלי Alerting** – אם יש Bug במניפסט, הוא "יתקן את עצמו" חזרה כל הזמן.
3. **לא להגדיר `CreateNamespace=true`** ואז ה-Sync נכשל כי ה-Namespace לא קיים.
4. **לבלבל בין Sync Status ל-Health Status** – Application יכול להיות `Synced` אבל `Degraded` (למשל אם ה-Pod קורס בלולאה).

## קישורים חיצוניים

- 📖 [Argo CD – Application Definition Reference](https://argo-cd.readthedocs.io/en/stable/operator-manual/application.yaml/)
- 📖 [Argo CD – Sync Options](https://argo-cd.readthedocs.io/en/stable/user-guide/sync_options/)
- 💻 [Repo הדוגמאות הרשמי](https://github.com/argoproj/argocd-example-apps)
- 🎥 [חיפוש יוטיוב: "ArgoCD create first application tutorial"](https://www.youtube.com/results?search_query=argocd+create+first+application+tutorial)
- 🎥 [חיפוש יוטיוב: "ArgoCD sync and rollback demo"](https://www.youtube.com/results?search_query=argocd+sync+and+rollback+demo)

## מה הלאה?

במדריך הבא נדבר על Projects, RBAC והרשאות – איך לתת לכל צוות גישה רק למה שמותר לו.
