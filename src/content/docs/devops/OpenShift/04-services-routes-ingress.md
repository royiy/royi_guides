---
title: "Services, Routes, Ingress ורשתות"
category: DevOps/OpenShift
part: 4/10
---

## למה בכלל צריך Service?

לכל Pod יש כתובת IP משלו, אבל כתובת זו **אינה יציבה** - כאשר פוד קורס ונוצר מחדש, הוא מקבל IP חדש. ה-**Service** פותר את הבעיה: הוא מספק כתובת IP קבועה ושם DNS יציב שמצביעים תמיד על קבוצת הפודים החיים והבריאים (לפי selector).

## סוגי Service

### 1. ClusterIP (ברירת המחדל)
נגיש רק בתוך הקלאסטר.

```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-app-svc
spec:
  type: ClusterIP
  selector:
    app: my-web-app
  ports:
    - name: http
      port: 80
      targetPort: 8080
      protocol: TCP
```

### 2. NodePort
חושף את השירות דרך פורט קבוע (30000-32767) על כל node בקלאסטר.

```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-app-nodeport
spec:
  type: NodePort
  selector:
    app: my-web-app
  ports:
    - port: 80
      targetPort: 8080
      nodePort: 30080
```

### 3. LoadBalancer
דורש תמיכה מספק הענן (AWS ELB, Azure LB, GCP LB) ליצירת load balancer חיצוני אמיתי.

```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-app-lb
spec:
  type: LoadBalancer
  selector:
    app: my-web-app
  ports:
    - port: 80
      targetPort: 8080
```

### 4. Headless Service
בלי ClusterIP קבוע - שימושי ל-StatefulSets כדי לקבל DNS ישיר לכל פוד.

```yaml
apiVersion: v1
kind: Service
metadata:
  name: postgres-headless
spec:
  clusterIP: None
  selector:
    app: postgres
  ports:
    - port: 5432
```

### פקודות שימושיות

```bash
oc get svc
oc describe svc my-app-svc
oc get endpoints my-app-svc   # בודק אילו פודים בפועל מקושרים לשירות

# יצירה מהירה משורת הפקודה
oc expose deployment my-web-app --port=80 --target-port=8080 --name=my-app-svc
```

## Routes - הדרך של OpenShift לחשוף החוצה

**Route** הוא ה-resource הייחודי ל-OpenShift לחשיפת שירות פנימי לרשת החיצונית, מנוהל על ידי **HAProxy Router** שרץ כ-Operator בקלאסטר. Route תמיד "יושב" מעל Service קיים.

### Route בסיסי (HTTP)

```bash
oc expose service my-app-svc
oc get route my-app-svc
# מוציא URL אוטומטי בסגנון: my-app-svc-my-project.apps.mycluster.example.com
```

```yaml
apiVersion: route.openshift.io/v1
kind: Route
metadata:
  name: my-app-route
spec:
  host: my-app.apps.mycluster.example.com
  to:
    kind: Service
    name: my-app-svc
    weight: 100
  port:
    targetPort: http
```

### Route מאובטח (TLS/HTTPS)

```yaml
apiVersion: route.openshift.io/v1
kind: Route
metadata:
  name: my-app-secure-route
spec:
  host: my-app.apps.mycluster.example.com
  to:
    kind: Service
    name: my-app-svc
  tls:
    termination: edge                       # edge | passthrough | reencrypt
    insecureEdgeTerminationPolicy: Redirect  # מפנה אוטומטית HTTP -> HTTPS
```

**סוגי TLS Termination:**

| סוג | תיאור | שימוש |
|---|---|---|
| `edge` | ה-TLS מסתיים ב-Router, פנימה זה HTTP | הכי נפוץ, פשוט לניהול |
| `passthrough` | ה-TLS עובר עד לפוד עצמו | כשהאפליקציה צריכה לנהל TLS בעצמה |
| `reencrypt` | TLS מסתיים ב-Router, ואז נפתח מחדש TLS פנימי | דרישות אבטחה מחמירות (compliance) |

### Route עם פיצול תעבורה (Blue-Green / Canary)

```yaml
apiVersion: route.openshift.io/v1
kind: Route
metadata:
  name: canary-route
spec:
  host: my-app.apps.mycluster.example.com
  to:
    kind: Service
    name: my-app-v1
    weight: 90
  alternateBackends:
    - kind: Service
      name: my-app-v2
      weight: 10
```

זה מאפשר להעביר 10% מהתעבורה לגרסה חדשה (v2) ולבחון אותה לפני מעבר מלא - טכניקת **canary deployment**.

## Ingress - התקן הסטנדרטי של Kubernetes

מאז OpenShift 4, יש תמיכה מלאה גם ב-Ingress הסטנדרטי (לתאימות בין-פלטפורמית), שממופה אוטומטית ל-Route מאחורי הקלעים:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: my-app-ingress
  annotations:
    route.openshift.io/termination: edge
spec:
  rules:
    - host: my-app.apps.mycluster.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: my-app-svc
                port:
                  number: 80
```

> **מתי להשתמש במה?** אם הפרויקט שלכם צריך להיות פורטבילי בין OpenShift ל-Kubernetes וניל - השתמשו ב-Ingress. אם אתם ב-OpenShift בלבד ורוצים גישה לפיצ'רים מתקדמים (weighted routing, wildcard routes) - השתמשו ב-Route.

## NetworkPolicy - חסימת תעבורה בין פודים

כברירת מחדל כל הפודים בפרויקט יכולים לתקשר ביניהם. NetworkPolicy מגביל זאת:

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-only-frontend
spec:
  podSelector:
    matchLabels:
      app: backend
  policyTypes:
    - Ingress
  ingress:
    - from:
        - podSelector:
            matchLabels:
              app: frontend
      ports:
        - protocol: TCP
          port: 8080
---
# חסימת כל תעבורה נכנסת כברירת מחדל (deny-all)
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: deny-all
spec:
  podSelector: {}
  policyTypes:
    - Ingress
```

## דיאגרמת זרימת תעבורה

```
Internet
   │
   ▼
┌─────────────────────┐
│   HAProxy Router      │  (Route Operator)
└──────────┬───────────┘
           │  Route: my-app.apps.example.com
           ▼
┌─────────────────────┐
│      Service           │  ClusterIP: 172.30.x.x
└──────────┬───────────┘
           │  (load balancing פנימי לפי selector)
     ┌─────┼─────┐
     ▼     ▼     ▼
   Pod1  Pod2  Pod3
```

## אבחון בעיות רשת נפוצות

```bash
# האם ה-Service מוצא פודים?
oc get endpoints my-app-svc
# אם ריק - הבעיה ב-selector/labels

# בדיקת התאמת labels
oc get pods --show-labels
oc get svc my-app-svc -o yaml | grep -A3 selector

# בדיקה מתוך פוד אחר בקלאסטר
oc rsh other-pod
curl http://my-app-svc.my-project.svc.cluster.local

# בדיקת סטטוס ה-Route
oc get route my-app-route -o yaml
oc describe route my-app-route

# בדיקת NetworkPolicy שחוסמות
oc get networkpolicy
oc describe networkpolicy deny-all
```

## קישורים חיצוניים

### תיעוד רשמי
- Configuring routes - Networking - OpenShift Documentation: https://docs.redhat.com/en/documentation/openshift_container_platform/4.22
- מאגר GitHub של תיעוד OpenShift (Networking section): https://github.com/openshift/openshift-docs

### סרטוני יוטיוב מומלצים
- OpenShift: Beginner to Advanced (כולל Networking/Routes): https://www.youtube.com/watch?v=zVkw-qLp_H4
- Part 1: Red Hat OpenShift for Absolute Beginners: https://www.youtube.com/watch?v=Z_lTLUZxOBk

## טיפים וטריקים

1. **Route לא באמת "יודע" איזה פורט לפוד** - הוא מפנה תמיד ל-Service, אף פעם לא ישירות לפוד. אם `Service` שגוי, ה-Route "יעבוד" אבל יחזיר 503.
2. שם ה-host שנוצר אוטומטית ל-Route תלוי בקונפיגורציית ה-**Ingress Controller** (`*.apps.<cluster-domain>`), אפשר לשנות ל-domain מותאם אישית.
3. אם אתם רואים `503 Service Unavailable` מה-Router - קודם בדקו `oc get endpoints` (99% מהמקרים זו הסיבה).
4. שימוש ב-`insecureEdgeTerminationPolicy: Redirect` הוא best-practice אבטחה סטנדרטי - הפניה אוטומטית מ-HTTP ל-HTTPS.
5. אל תשכחו NetworkPolicy! ברירת המחדל הפתוחה לגמרי מסוכנת ל-production - הגדירו לפחות `deny-all` + כללי allow ספציפיים (Zero Trust).

---
**במדריך הבא:** BuildConfigs, ImageStreams, S2I ו-CI/CD ב-OpenShift.
