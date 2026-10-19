---
title: "אבטחה - RBAC, SCC, ServiceAccounts ו-Secrets"
description: "מודל האבטחה של OpenShift: הרשאות RBAC (Role/RoleBinding), מגבלות SCC על הרצת קונטיינרים, ServiceAccounts, ניהול Secrets ו-Certificates פנימיים."
category: DevOps/OpenShift
part: 7/10
---

## RBAC - Role-Based Access Control

RBAC קובע **מי** (משתמש/ServiceAccount) יכול לעשות **מה** (get/list/create/delete) על **אילו** משאבים (pods, deployments, secrets).

### ארבעת אבני היסוד

1. **Role** - רשימת הרשאות בתוך namespace ספציפי.
2. **ClusterRole** - רשימת הרשאות ברמת הקלאסטר כולו (או namespace-scoped אבל reusable).
3. **RoleBinding** - מקשר Role/ClusterRole למשתמש/קבוצה/ServiceAccount בתוך namespace ספציפי.
4. **ClusterRoleBinding** - מקשר ClusterRole ברמת הקלאסטר כולו.

### דוגמה: Role מותאם אישית

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: pod-reader
  namespace: my-app
rules:
  - apiGroups: [""]
    resources: ["pods", "pods/log"]
    verbs: ["get", "list", "watch"]
  - apiGroups: ["apps"]
    resources: ["deployments"]
    verbs: ["get", "list"]
```

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: read-pods-binding
  namespace: my-app
subjects:
  - kind: User
    name: jdoe
    apiGroup: rbac.authorization.k8s.io
  - kind: ServiceAccount
    name: my-app-sa
    namespace: my-app
roleRef:
  kind: Role
  name: pod-reader
  apiGroup: rbac.authorization.k8s.io
```

### פקודות RBAC מהירות

```bash
# תפקידי ברירת המחדל המובנים: view, edit, admin, cluster-admin
oc adm policy add-role-to-user view jdoe -n my-app
oc adm policy add-role-to-user edit jdoe -n my-app
oc adm policy add-role-to-user admin jdoe -n my-app

# הענקת הרשאה לקבוצה שלמה
oc adm policy add-role-to-group edit devops-team -n my-app

# הסרת הרשאה
oc adm policy remove-role-from-user edit jdoe -n my-app

# בדיקה מי יכול לבצע פעולה
oc adm policy who-can delete pods -n my-app
oc adm policy who-can create secrets -n my-app

# בדיקה אם אני יכול לבצע פעולה (self)
oc auth can-i create deployments -n my-app
oc auth can-i delete secrets --all-namespaces
```

### טבלת תפקידי ברירת המחדל

| תפקיד | הרשאות |
|---|---|
| `view` | קריאה בלבד (רוב המשאבים, לא Secrets) |
| `edit` | יצירה/עריכה/מחיקה של רוב המשאבים, לא RBAC |
| `admin` | הכל בתוך ה-namespace, כולל ניהול הרשאות |
| `cluster-admin` | שליטה מלאה בכל הקלאסטר - **להעניק בזהירות רבה!** |

## SCC - Security Context Constraints

**SCC הוא ייחודי ל-OpenShift** (אין ב-Kubernetes וניל, הוא מקביל ל-Pod Security Admission אבל מחמיר וגמיש יותר). SCC קובע אילו הרשאות אבטחה מותרות לפוד: האם יכול לרוץ כ-root, אילו capabilities לינוקס מותרות, אילו volumes מותרים.

### SCC המובנים העיקריים

| SCC | תיאור |
|---|---|
| `restricted-v2` | ברירת המחדל לכל משתמש רגיל - **חייב** UID רנדומלי, לא root |
| `nonroot-v2` | מאפשר UID קבוע כל עוד הוא לא 0 |
| `anyuid` | מאפשר לרוץ עם כל UID כולל root (0) - צריך הרשאה מפורשת |
| `privileged` | הרשאות מלאות, כולל גישה לרכיבי host - למשתמשי אדמין/אינפרה בלבד |
| `hostnetwork` | גישה לרשת ה-host ישירות |

```bash
# בדיקה איזה SCC משויך לפוד
oc get pod my-pod -o yaml | grep openshift.io/scc

# רשימת כל ה-SCC בקלאסטר
oc get scc

# פרטים על SCC ספציפי
oc describe scc restricted-v2

# הענקת SCC ל-ServiceAccount (לדוגמה, כשאפליקציה חייבת root)
oc adm policy add-scc-to-user anyuid -z my-app-sa -n my-app
```

### למה זה משנה? דוגמת שגיאה נפוצה

```
Error creating: pods "my-pod" is forbidden: unable to validate against
any security context constraint: [provider "restricted-v2": .spec.containers[0].
securityContext.runAsUser: Invalid value: 0: must be in the ranged allocation]
```

זו השגיאה הכי נפוצה למי שבא מ-Docker רגיל - התמונה שלכם מנסה לרוץ כ-root (UID 0), אבל SCC ברירת המחדל `restricted-v2` אוסר זאת. **הפתרון הנכון:** לתקן את ה-Dockerfile לרוץ עם USER לא-root, ולא להעניק `anyuid` (זה security anti-pattern).

```dockerfile
# Dockerfile שתומך ב-restricted SCC (best practice)
FROM registry.access.redhat.com/ubi9/ubi-minimal
RUN useradd -u 1001 appuser
USER 1001
COPY --chown=1001:0 . /app
CMD ["/app/start.sh"]
```

## ServiceAccounts

כל פוד רץ תחת ServiceAccount (ברירת מחדל: `default`). זהו "המשתמש" של האפליקציה מול ה-API.

```bash
oc create serviceaccount my-app-sa

# צירוף ServiceAccount ל-Deployment
oc set serviceaccount deployment/my-app my-app-sa
```

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  template:
    spec:
      serviceAccountName: my-app-sa
      containers:
        - name: app
          image: my-app:latest
```

**עקרון Least Privilege:** תמיד יצרו ServiceAccount ייעודי לכל אפליקציה, אל תשתמשו ב-`default` - כך אתם יכולים להעניק בדיוק את ההרשאות שנדרשות ולא יותר.

## Secrets

```bash
# יצירת Secret מ-literal values
oc create secret generic db-credentials \
  --from-literal=username=admin \
  --from-literal=password='SuperSecretPass123!'

# יצירת Secret מקובץ
oc create secret generic tls-cert \
  --from-file=tls.crt=./server.crt \
  --from-file=tls.key=./server.key

# Secret ל-Docker registry (pull images פרטיים)
oc create secret docker-registry my-registry-secret \
  --docker-server=quay.io \
  --docker-username=myuser \
  --docker-password=mypassword \
  --docker-email=me@example.com
```

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: db-credentials
type: Opaque
stringData:            # השדה stringData מאפשר טקסט רגיל (מוצפן אוטומטית ל-base64)
  username: admin
  password: "SuperSecretPass123!"
```

### שימוש ב-Secret כמשתני סביבה

```yaml
containers:
  - name: app
    envFrom:
      - secretRef:
          name: db-credentials
    # או משתנה בודד:
    env:
      - name: DB_PASSWORD
        valueFrom:
          secretKeyRef:
            name: db-credentials
            key: password
```

### שימוש ב-Secret כ-Volume (מומלץ יותר לאבטחה)

```yaml
volumes:
  - name: secret-volume
    secret:
      secretName: db-credentials
containers:
  - name: app
    volumeMounts:
      - name: secret-volume
        mountPath: "/etc/secrets"
        readOnly: true
```

> **אבטחה:** Secrets ב-OpenShift מקודדים ב-base64 בלבד (לא מוצפנים כברירת מחדל!) ב-etcd, אלא אם מפעילים **etcd encryption at rest**. לניהול secrets ארגוני שקול על שימוש ב-**External Secrets Operator** או **HashiCorp Vault**.

## ניהול Certificates (TLS) לרישום פנימי

```bash
# הצגת ה-CA הפנימי של הקלאסטר
oc get secret -n openshift-ingress-operator router-ca -o jsonpath='{.data.tls\.crt}' | base64 -d
```

## קישורים חיצוניים

### תיעוד רשמי
- Managing security context constraints - Authentication - OpenShift: https://docs.redhat.com/en/documentation/openshift_container_platform/4.22
- Using RBAC to define and apply permissions - OpenShift Documentation: https://docs.redhat.com/en/documentation/openshift_container_platform/4.22

### סרטוני יוטיוב מומלצים
- Red Hat OpenShift Administration Complete Video Course (EX280 - כולל RBAC/SCC): https://www.oreilly.com/library/view/red-hat-openshift/9780137441938/
- OpenShift for the Absolute Beginners (כולל Security hardening): https://www.udemy.com/course/learn-openshift/

## טיפים וטריקים

1. **לעולם אל תעניקו `cluster-admin` "כדי שיעבוד"** - זו הדרך הכי מהירה לחור אבטחה חמור. חפשו את ה-Role המדויק הנדרש.
2. אם תמונה דורשת `anyuid` או `privileged` - זה דגל אדום, בדקו האם אפשר לתקן את ה-Dockerfile במקום.
3. `oc get rolebindings,clusterrolebindings -A -o wide` - סקירה מהירה של כל ההרשאות בקלאסטר, שימושי לאודיט אבטחה.
4. תמיד תשתמשו ב-`oc auth can-i` **לפני** שאתם מריצים פעולה מסוכנת, כדי לבדוק שיש לכם באמת הרשאה (ולא לגלות זאת אחרי חצי עבודה).
5. הימנעו משימוש ב-`--from-literal` בקוד CI/CD גלוי - שימוש ב-secret manager חיצוני (Vault, External Secrets Operator) מונע חשיפת סיסמאות בהיסטוריית git/logs.

---
**במדריך הבא:** Operators, Helm ו-OLM (Operator Lifecycle Manager).
