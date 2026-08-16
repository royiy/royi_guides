# מדריך 7: RBAC ואבטחה ב-Kubernetes

## תוכן עניינים
1. [שלושת שלבי הבקשה: Authentication, Authorization, Admission Control](#שלושת-שלבים)
2. [RBAC - מושגי יסוד](#rbac-יסוד)
3. [Role ו-RoleBinding](#role-rolebinding)
4. [ClusterRole ו-ClusterRoleBinding](#clusterrole)
5. [ServiceAccounts](#serviceaccounts)
6. [Pod Security Standards](#pod-security)
7. [SecurityContext](#securitycontext)
8. [עקרונות אבטחה נוספים](#עקרונות-נוספים)
9. [פקודות kubectl שימושיות](#פקודות)
10. [טיפים וטריקים](#טיפים)
11. [שאלות ראיון עבודה](#שאלות)
12. [קישורים חיצוניים](#קישורים)

---

## שלושת שלבי הבקשה: Authentication, Authorization, Admission Control {#שלושת-שלבים}

כל בקשה שמגיעה ל-`kube-apiserver` עוברת שלושה שלבים בזה אחר זה:

```
בקשה נכנסת → 1. Authentication → 2. Authorization (RBAC) → 3. Admission Control → מבוצע בפועל
              "מי אתה?"          "מה מותר לך?"              "בדיקות/שינויים נוספים"
```

1. **Authentication** - זיהוי "מי" שולח את הבקשה: משתמש אנושי (דרך certificate, OIDC token) או ServiceAccount (דרך token).
2. **Authorization** - בדיקה האם למשתמש/ServiceAccount המזוהה **מותר** לבצע את הפעולה המבוקשת. השיטה הנפוצה והמומלצת: **RBAC** (Role-Based Access Control).
3. **Admission Control** - שלב אחרון של בדיקות/שינויים אוטומטיים (למשל הזרקת sidecar, אכיפת Pod Security Standards, Webhook מותאם אישית).

זהו המדריך הזה מתמקד בעיקר בשלב ה-Authorization דרך RBAC, ובאבטחת Pods.

---

## RBAC - מושגי יסוד {#rbac-יסוד}

RBAC בנוי מארבעה סוגי אובייקטים:

| אובייקט | תחום | תפקיד |
|---|---|---|
| `Role` | Namespace יחיד | מגדיר **אילו פעולות** (verbs) מותרות על **אילו משאבים** |
| `ClusterRole` | כל הקלאסטר | כמו Role, אבל לא מוגבל ל-namespace אחד |
| `RoleBinding` | Namespace יחיד | מקשר Role (או ClusterRole) ל**מי** (subject) בתוך namespace |
| `ClusterRoleBinding` | כל הקלאסטר | מקשר ClusterRole למשתמש/ServiceAccount ברמת הקלאסטר כולו |

---

## Role ו-RoleBinding {#role-rolebinding}

### דוגמה: הרשאת קריאה בלבד ל-Pods ב-namespace "dev"

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: dev
  name: pod-reader
rules:
  - apiGroups: [""]           # "" = core API group
    resources: ["pods"]
    verbs: ["get", "watch", "list"]
```

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: read-pods-binding
  namespace: dev
subjects:
  - kind: User
    name: dana@company.com
    apiGroup: rbac.authorization.k8s.io
  - kind: ServiceAccount
    name: ci-pipeline-sa
    namespace: dev
roleRef:
  kind: Role
  name: pod-reader
  apiGroup: rbac.authorization.k8s.io
```

### דוגמה מורכבת יותר - CI/CD pipeline שיכול לנהל Deployments

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: dev
  name: deployment-manager
rules:
  - apiGroups: ["apps"]
    resources: ["deployments", "replicasets"]
    verbs: ["get", "list", "watch", "create", "update", "patch", "delete"]
  - apiGroups: [""]
    resources: ["pods", "pods/log"]
    verbs: ["get", "list", "watch"]
```

---

## ClusterRole ו-ClusterRoleBinding {#clusterrole}

שימושי כשצריך הרשאה בכל הקלאסטר, או על משאבים שאינם משויכים ל-namespace כלל (כמו Nodes, PersistentVolumes).

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: node-viewer
rules:
  - apiGroups: [""]
    resources: ["nodes"]
    verbs: ["get", "list", "watch"]
```

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: node-viewer-binding
subjects:
  - kind: Group
    name: sre-team
    apiGroup: rbac.authorization.k8s.io
roleRef:
  kind: ClusterRole
  name: node-viewer
  apiGroup: rbac.authorization.k8s.io
```

**חשוב:** אפשר גם לקשר ClusterRole דרך RoleBinding (לא רק ClusterRoleBinding) - במקרה כזה ההרשאה תקפה רק ב-namespace הספציפי של ה-RoleBinding, למרות שה-ClusterRole "רחב" יותר. זו דרך נוחה לשימוש חוזר ב-ClusterRoles מוגדרים מראש בהיקף מצומצם.

---

## ServiceAccounts {#serviceaccounts}

כל Pod רץ תחת **ServiceAccount** - זהות שמשמשת לאימות מול ה-API Server מתוך הקלאסטר עצמו (למשל אפליקציה שצריכה ליצור Pods נוספים, או להריץ `kubectl` מתוכה). אם לא מוגדר במפורש, Pod משתמש ב-`default` ServiceAccount של ה-namespace שלו.

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: ci-pipeline-sa
  namespace: dev
```

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ci-runner
spec:
  template:
    spec:
      serviceAccountName: ci-pipeline-sa
      automountServiceAccountToken: true   # ברירת מחדל true
      containers:
        - name: runner
          image: myci/runner:1.0
```

**עיקרון אבטחה חשוב:** לרוב ה-Pods **לא צריכים** גישה ל-API של Kubernetes בכלל. אם אין צורך אמיתי, כדאי להגדיר `automountServiceAccountToken: false` כדי לצמצם משטח תקיפה.

---

## Pod Security Standards {#pod-security}

Kubernetes מגדיר שלוש רמות מדיניות אבטחה סטנדרטיות (מחליפות את ה-PodSecurityPolicy הישן שהוסר):

| רמה | תיאור |
|---|---|
| **Privileged** | ללא הגבלות - לשימוש רק ל-workloads מערכתיים מהימנים |
| **Baseline** | מונע escalation ידועה של הרשאות, אך גמיש יחסית |
| **Restricted** | הכי מחמיר - עקרון least-privilege, מתאים לרוב האפליקציות |

אוכפים אותן ברמת Namespace עם labels:

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: production
  labels:
    pod-security.kubernetes.io/enforce: restricted
    pod-security.kubernetes.io/audit: restricted
    pod-security.kubernetes.io/warn: restricted
```

---

## SecurityContext {#securitycontext}

מגדיר הרשאות אבטחה ברמת Pod או קונטיינר בודד:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: secure-pod
spec:
  securityContext:            # ברמת Pod - חל על כל הקונטיינרים
    runAsNonRoot: true
    runAsUser: 1000
    fsGroup: 2000
  containers:
    - name: app
      image: myapp:1.0
      securityContext:        # ברמת קונטיינר - דורס את ברמת ה-Pod
        allowPrivilegeEscalation: false
        readOnlyRootFilesystem: true
        capabilities:
          drop:
            - ALL
```

**שדות מפתח:**
- `runAsNonRoot: true` - מונע הרצה כ-root בתוך הקונטיינר
- `readOnlyRootFilesystem: true` - מערכת קבצים לקריאה בלבד (חוץ מ-Volumes מפורשים)
- `allowPrivilegeEscalation: false` - מונע קבלת הרשאות גבוהות יותר מתהליך ההורה
- `capabilities.drop: [ALL]` - מסיר את כל ה-Linux capabilities, מוסיפים רק מה שצריך עם `add`

---

## עקרונות אבטחה נוספים {#עקרונות-נוספים}

- **Least Privilege** - תמיד תנו את מינימום ההרשאות הנדרש, לא יותר.
- **Image Scanning** - סרקו images לפני deploy (Trivy, Grype) לאיתור פגיעויות ידועות.
- **Network Policies** - הגבילו תעבורה בין Pods (ראו מדריך 3).
- **Secrets Management** - ראו מדריך 4 - אל תשמרו סודות בגלוי.
- **Audit Logging** - הפעילו לוגים של פעולות רגישות ב-API Server למעקב ובקרה.
- **אל תשתמשו ב-`cluster-admin`** למשתמשים/שירותים רגילים - זו הרשאת-על שמעניקה שליטה מלאה בקלאסטר.

---

## פקודות kubectl שימושיות {#פקודות}

```bash
# בדיקה האם למשתמש הנוכחי מותר לבצע פעולה
kubectl auth can-i create deployments --namespace=dev
kubectl auth can-i delete pods --as=dana@company.com -n dev

# הצגת כל ה-Roles/ClusterRoles
kubectl get roles -n dev
kubectl get clusterroles

# הצגת bindings
kubectl get rolebindings -n dev
kubectl get clusterrolebindings

# מידע מפורט על Role
kubectl describe role pod-reader -n dev

# יצירת ServiceAccount ישירות מ-CLI
kubectl create serviceaccount ci-pipeline-sa -n dev

# קבלת token זמני של ServiceAccount (לבדיקות)
kubectl create token ci-pipeline-sa -n dev
```

---

## טיפים וטריקים {#טיפים}

1. **`kubectl auth can-i` הוא הכלי הראשון לדיבאג בעיות הרשאה** - במקום לנחש למה בקשה נכשלת עם "Forbidden".
2. **ClusterRoles מוגדרים מראש** - Kubernetes מגיע עם ClusterRoles שימושיים כמו `view`, `edit`, `admin`, `cluster-admin` - לרוב עדיף להשתמש בהם או להרחיב אותם, במקום להמציא Role מאפס.
3. **אל תשכחו ServiceAccount tokens** - כל token שנוצר נשאר תקף עד שמבוטל; רוטציה סדירה חשובה בסביבות רגישות.
4. **בדקו `automountServiceAccountToken`** - הרבה Pods מקבלים token אוטומטית בלי שבאמת צריכים אותו, מה שמגדיל את משטח התקיפה במקרה של פריצה לקונטיינר.
5. **Namespace-scoped Role > ClusterRole** כשאפשר - עקרון least-privilege אומר להגביל תמיד לתחום הכי צר האפשרי.

---

## שאלות ראיון עבודה {#שאלות}

**ש: מה ההבדל בין Authentication ל-Authorization ב-Kubernetes?**
ת: Authentication מזהה "מי" שולח את הבקשה (משתמש, ServiceAccount). Authorization (בעיקר דרך RBAC) קובע האם לזהות המאומתת הזו מותר לבצע את הפעולה המבוקשת על המשאב המבוקש.

**ש: מה ההבדל בין Role ל-ClusterRole?**
ת: Role מוגבל ל-namespace יחיד ומגדיר הרשאות על משאבים בתוכו. ClusterRole תקף בכל הקלאסטר, ויכול גם להעניק גישה למשאבים שאינם משויכים ל-namespace (כמו Nodes או PersistentVolumes).

**ש: מה ההבדל בין RoleBinding ל-ClusterRoleBinding?**
ת: RoleBinding מקשר Role (או ClusterRole) לזהות בתוך namespace ספציפי בלבד. ClusterRoleBinding מקשר ClusterRole לזהות ברמת הקלאסטר כולו - ההרשאה תקפה בכל ה-namespaces.

**ש: מהו ServiceAccount ומתי משתמשים בו?**
ת: זהות שמאפשרת ל-Pod לאמת את עצמו מול ה-API Server. משתמשים בו כשאפליקציה בתוך הקלאסטר צריכה לבצע קריאות ל-Kubernetes API עצמו - למשל אופרטור, כלי CI/CD, או controller מותאם אישית.

**ש: מה זה עקרון least-privilege, ואיך מיישמים אותו ב-Kubernetes?**
ת: העיקרון שכל זהות (משתמש, ServiceAccount) צריכה לקבל רק את ההרשאות המינימליות הנדרשות לה, ולא יותר. מיישמים דרך Roles מדויקים במקום ClusterRoles רחבים, הימנעות מ-cluster-admin לגורמים לא-מנהליים, וכיבוי automountServiceAccountToken כשלא נדרש.

**ש: מהו SecurityContext ואילו הגדרות חשובות בו?**
ת: אובייקט שמגדיר הרשאות אבטחה ברמת Pod או קונטיינר, כמו `runAsNonRoot`, `readOnlyRootFilesystem`, `allowPrivilegeEscalation: false` ו-`capabilities.drop: [ALL]` - כולם עוזרים למזער את הנזק הפוטנציאלי אם קונטיינר נפרץ.

---

## קישורים חיצוניים {#קישורים}

### תיעוד רשמי
- Using RBAC Authorization: https://kubernetes.io/docs/reference/access-authn-authz/rbac/
- Managing Service Accounts: https://kubernetes.io/docs/reference/access-authn-authz/service-accounts-admin/
- Pod Security Standards: https://kubernetes.io/docs/concepts/security/pod-security-standards/
- Configure a Security Context for a Pod: https://kubernetes.io/docs/tasks/configure-pod-container/security-context/

### סרטוני YouTube
- TechWorld with Nana - RBAC Explained: https://www.youtube.com/c/techworldwithnana
- CKA Course המלא: https://www.youtube.com/playlist?list=PLy7NrYWoggjziYQIDorlXjTvvwweTYoNC

---

**הקודם:** [מדריך 6 - Helm](./06-helm.md) | **הבא:** [מדריך 8 - Ingress](./08-ingress.md)
