---
title: "Pods, Deployments ו-ReplicaSets"
category: DevOps/Kubernetes
part: 2/10
---

## תוכן עניינים
1. [מהו Pod](#מהו-pod)
2. [דוגמת YAML ל-Pod](#pod-yaml)
3. [ReplicaSet](#replicaset)
4. [Deployment](#deployment)
5. [אסטרטגיות עדכון (Update Strategies)](#אסטרטגיות-עדכון)
6. [Health Checks - Liveness, Readiness, Startup Probes](#health-checks)
7. [Resource Requests & Limits](#resources)
8. [פקודות kubectl שימושיות](#פקודות)
9. [טיפים וטריקים](#טיפים)
10. [שאלות ראיון עבודה](#שאלות)
11. [קישורים חיצוניים](#קישורים)

---

## מהו Pod {#מהו-pod}

**Pod** הוא יחידת הפריסה (deployment unit) הקטנה ביותר ב-Kubernetes. חשוב להבין: Pod **אינו** קונטיינר - הוא "עטיפה" (wrapper) שיכולה להכיל קונטיינר אחד או יותר, שחולקים:

- **רשת** משותפת (אותה כתובת IP ו-localhost)
- **אחסון** משותף (Volumes)
- **מחזור חיים** משותף (נוצרים ומתים יחד)

ברוב המקרים Pod מכיל קונטיינר יחיד, אבל דפוס נפוץ הוא **Sidecar Container** - למשל קונטיינר ראשי של האפליקציה + קונטיינר "עוזר" ללוגים או ל-proxy (כמו Envoy ב-Istio).

### למה לא להריץ Pods ישירות בפרודקשן?

Pod "עצמאי" (bare Pod) שנוצר ישירות - אם הוא קורס, **אף אחד לא יקים אותו מחדש**. לכן כמעט אף פעם לא יוצרים Pods ישירות, אלא דרך **Controller** כמו Deployment, שאחראי לוודא שתמיד יש את מספר העותקים הרצוי.

---

## דוגמת YAML ל-Pod {#pod-yaml}

```yaml
# pod.yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx-pod
  labels:
    app: nginx
    tier: frontend
spec:
  containers:
    - name: nginx
      image: nginx:1.27-alpine
      ports:
        - containerPort: 80
      resources:
        requests:
          cpu: "100m"
          memory: "64Mi"
        limits:
          cpu: "250m"
          memory: "128Mi"
```

```bash
kubectl apply -f pod.yaml
kubectl get pods
kubectl describe pod nginx-pod
kubectl logs nginx-pod
kubectl delete -f pod.yaml
```

### Pod עם כמה קונטיינרים (Multi-Container Pod)

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-with-sidecar
spec:
  containers:
    - name: main-app
      image: myapp:1.0
      ports:
        - containerPort: 8080
    - name: log-sidecar
      image: busybox
      command: ["sh", "-c", "tail -f /var/log/app.log"]
      volumeMounts:
        - name: shared-logs
          mountPath: /var/log
  volumes:
    - name: shared-logs
      emptyDir: {}
```

---

## ReplicaSet {#replicaset}

**ReplicaSet** מטרתו לוודא שתמיד רץ מספר מוגדר מראש (`replicas`) של עותקי Pod זהים. הוא משתמש ב-`selector` (מבוסס Labels) כדי "לדעת" אילו Pods הוא אחראי עליהם.

```yaml
# replicaset.yaml
apiVersion: apps/v1
kind: ReplicaSet
metadata:
  name: nginx-rs
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
        - name: nginx
          image: nginx:1.27-alpine
          ports:
            - containerPort: 80
```

**חשוב לדעת:** כמעט אף פעם לא יוצרים ReplicaSet ישירות! זהו רכיב "פנימי" שנוצר ומנוהל אוטומטית על ידי Deployment. תמיד עדיף Deployment.

---

## Deployment {#deployment}

**Deployment** הוא הרכיב הכי נפוץ בעבודה יומיומית עם Kubernetes לניהול אפליקציות stateless. הוא מוסיף מעל ReplicaSet יכולות של:

- **Rolling Updates** - עדכון גרסה בלי downtime
- **Rollback** - חזרה אחורה לגרסה קודמת בפקודה אחת
- **היסטוריית שינויים** (revision history)

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
  labels:
    app: nginx
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1        # כמה Pods נוספים מותר ליצור בזמן העדכון
      maxUnavailable: 1  # כמה Pods מותר שיהיו לא זמינים בזמן העדכון
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
        - name: nginx
          image: nginx:1.27-alpine
          ports:
            - containerPort: 80
          resources:
            requests:
              cpu: "100m"
              memory: "64Mi"
            limits:
              cpu: "200m"
              memory: "128Mi"
          readinessProbe:
            httpGet:
              path: /
              port: 80
            initialDelaySeconds: 5
            periodSeconds: 10
          livenessProbe:
            httpGet:
              path: /
              port: 80
            initialDelaySeconds: 15
            periodSeconds: 20
```

```bash
# יצירה/עדכון
kubectl apply -f deployment.yaml

# הצגת ה-Deployments
kubectl get deployments

# עדכון image בפקודה ישירה (בלי לערוך YAML)
kubectl set image deployment/nginx-deployment nginx=nginx:1.28-alpine

# מעקב אחר ה-rollout בזמן אמת
kubectl rollout status deployment/nginx-deployment

# היסטוריית גרסאות
kubectl rollout history deployment/nginx-deployment

# חזרה לגרסה הקודמת
kubectl rollout undo deployment/nginx-deployment

# חזרה לגרסה ספציפית
kubectl rollout undo deployment/nginx-deployment --to-revision=2

# הרחבה/כיווץ מספר עותקים (Scaling)
kubectl scale deployment nginx-deployment --replicas=5
```

---

## אסטרטגיות עדכון (Update Strategies) {#אסטרטגיות-עדכון}

### 1. RollingUpdate (ברירת מחדל)
מעדכן Pods בהדרגה, אחד-אחד (או לפי `maxSurge`/`maxUnavailable`), כדי לשמור על זמינות מלאה.

### 2. Recreate
הורג את כל ה-Pods הישנים ורק אז יוצר חדשים - יש downtime, אבל שימושי כשלא ניתן להריץ שתי גרסאות במקביל (למשל migration של DB).

```yaml
spec:
  strategy:
    type: Recreate
```

### 3. Blue-Green ו-Canary (לא native, אך נפוצים)
אלו דפוסים שממומשים באמצעות שני Deployments נפרדים + שינוי ה-Service selector (Blue-Green), או עם Ingress/Service Mesh לניתוב אחוז קטן מהתעבורה לגרסה החדשה (Canary). כלים כמו Argo Rollouts או Flagger מספקים תמיכה מובנית.

---

## Health Checks - Liveness, Readiness, Startup Probes {#health-checks}

```yaml
containers:
  - name: myapp
    image: myapp:1.0
    livenessProbe:      # האם הקונטיינר "חי"? אם נכשל - kubelet יהרוג ויפעיל מחדש
      httpGet:
        path: /healthz
        port: 8080
      initialDelaySeconds: 10
      periodSeconds: 10
      failureThreshold: 3
    readinessProbe:      # האם הקונטיינר "מוכן" לקבל תעבורה? אם נכשל - מוסר מה-Service
      httpGet:
        path: /ready
        port: 8080
      initialDelaySeconds: 5
      periodSeconds: 5
    startupProbe:        # לאפליקציות שאיטיות בעלייה - חוסם את שתי הבדיקות האחרות עד שמצליח
      httpGet:
        path: /startup
        port: 8080
      failureThreshold: 30
      periodSeconds: 10
```

**ההבדל המהותי:**
- **Liveness נכשל** → הקונטיינר מופעל מחדש (restart)
- **Readiness נכשל** → הקונטיינר נשאר רץ, אבל מוסר זמנית מרשימת ה-Endpoints של ה-Service (לא מקבל תעבורה)

---

## Resource Requests & Limits {#resources}

```yaml
resources:
  requests:      # מה ה-Pod "מבקש" - ה-Scheduler ישבץ רק ל-Node עם משאבים פנויים אלו
    cpu: "250m"       # 250 מילי-ליבה = רבע ליבה
    memory: "256Mi"
  limits:        # התקרה המקסימלית שהקונטיינר יכול לצרוך
    cpu: "500m"
    memory: "512Mi"
```

- חריגה מ-**memory limit** → הקונטיינר נהרג (OOMKilled)
- חריגה מ-**CPU limit** → הקונטיינר לא נהרג, אלא "מוחנק" (throttled)

---

## פקודות kubectl שימושיות {#פקודות}

```bash
# יצירת Deployment ישירות מ-CLI (בלי YAML)
kubectl create deployment webapp --image=nginx:1.27-alpine --replicas=3

# הצגת Pods עם מידע מורחב (Node, IP)
kubectl get pods -o wide

# כניסה לתוך קונטיינר רץ (shell אינטראקטיבי)
kubectl exec -it nginx-pod -- /bin/sh

# העתקת קבצים מ/אל Pod
kubectl cp nginx-pod:/etc/nginx/nginx.conf ./nginx.conf

# מחיקת Pod (ה-Deployment יצור חדש אוטומטית!)
kubectl delete pod nginx-pod

# צפייה באירועים (events) בקלאסטר - קריטי לדיבאג
kubectl get events --sort-by='.lastTimestamp'

# מחיקת כל ה-Pods לפי label
kubectl delete pods -l app=nginx
```

---

## טיפים וטריקים {#טיפים}

1. **תמיד השתמשו ב-Deployment ולא ב-Pod עצמאי** - גם לבדיקות מהירות, כי זה לא הרבה יותר קוד וחוסך כאב ראש.
2. **הגדירו requests/limits תמיד** - Pod בלי resources יכול "לחנוק" Nodes שלמים ולגרום לבעיות בלתי צפויות.
3. **readinessProbe הוא לא אופציונלי** - בלעדיו, Kubernetes ישלח תעבורה ל-Pod גם אם הוא עדיין לא מוכן (למשל בזמן טעינת cache).
4. **שימוש ב-`kubectl rollout status`** לפני שממשיכים בפייפליין CI/CD, כדי לוודא שהעדכון הצליח לפני מעבר לצעד הבא.
5. **CrashLoopBackOff?** - תמיד תתחילו מ-`kubectl describe pod` ו-`kubectl logs --previous` (הלוגים מהריצה שקרסה).
6. **maxSurge=0** שימושי כשאין לכם משאבים ל-Pod נוסף בזמן העדכון, אבל דורש `maxUnavailable` גדול מ-0.

---

## שאלות ראיון עבודה {#שאלות}

**ש: מה ההבדל בין Pod, ReplicaSet ו-Deployment?**
ת: Pod הוא יחידת הריצה הבסיסית. ReplicaSet מוודא שרץ מספר קבוע של עותקי Pod. Deployment הוא שכבה מעל ReplicaSet שמוסיפה rolling updates, rollback והיסטוריית גרסאות - וזהו הרכיב שבו כמעט תמיד עובדים בפועל.

**ש: מה קורה כשמוחקים Pod שנוצר על ידי Deployment?**
ת: ה-ReplicaSet שמנוהל על ידי ה-Deployment מזהה שיש פחות Pods מהרצוי, ומיד יוצר Pod חדש כדי לחזור למספר ה-replicas המוגדר.

**ש: מה ההבדל בין livenessProbe ל-readinessProbe?**
ת: livenessProbe בודק אם הקונטיינר בכלל "חי" - כישלון גורם להפעלה מחדש. readinessProbe בודק אם הוא "מוכן לקבל תעבורה" - כישלון רק מסיר אותו זמנית מה-Service בלי להרוג אותו.

**ש: מה ההבדל בין requests ל-limits?**
ת: requests הם המשאבים שה-Scheduler מבטיח שיהיו זמינים כשמשבץ Pod ל-Node. limits הם התקרה המקסימלית - חריגה ב-CPU גורמת ל-throttling, וחריגה ב-memory גורמת ל-OOMKill.

**ש: איך מבצעים rollback לגרסה קודמת של Deployment?**
ת: `kubectl rollout undo deployment/<name>`, ואפשר גם לחזור לגרסה ספציפית עם `--to-revision=N`, בהתבסס על ההיסטוריה שנשמרת אוטומטית.

**ש: מהו Multi-Container Pod ומתי משתמשים בו?**
ת: Pod שמכיל כמה קונטיינרים שחולקים רשת ואחסון. נפוץ בדפוס Sidecar - למשל קונטיינר ראשי + proxy רשת (Envoy), אגרגטור לוגים, או Init Container שמכין את הסביבה לפני עליית האפליקציה הראשית.

**ש: מה ההבדל בין maxSurge ל-maxUnavailable ב-RollingUpdate?**
ת: maxSurge קובע כמה Pods נוספים (מעבר למספר הרצוי) מותר ליצור זמנית בזמן העדכון. maxUnavailable קובע כמה Pods מותר שיהיו לא זמינים בו-זמנית בזמן העדכון.

---

## קישורים חיצוניים {#קישורים}

### תיעוד רשמי
- Pods: https://kubernetes.io/docs/concepts/workloads/pods/
- Deployments: https://kubernetes.io/docs/concepts/workloads/controllers/deployment/
- ReplicaSet: https://kubernetes.io/docs/concepts/workloads/controllers/replicaset/
- Probes (Liveness/Readiness/Startup): https://kubernetes.io/docs/concepts/configuration/liveness-readiness-startup-probes/
- Resource Management: https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/

### סרטוני YouTube
- TechWorld with Nana - Deployments & ReplicaSets: https://www.youtube.com/c/techworldwithnana
- freeCodeCamp - Kubernetes Full Course: https://www.youtube.com/watch?v=d6WC5n9G_sM

---

**הקודם:** [מדריך 1 - מבוא וארכיטקטורה](/devops/kubernetes/01-mavo-vearchitectura/) | **הבא:** [מדריך 3 - Services ו-Networking](/devops/kubernetes/03-services-networking/)
