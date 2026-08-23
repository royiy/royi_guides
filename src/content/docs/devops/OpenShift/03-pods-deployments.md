# מדריך 3: Pods, Deployments, DeploymentConfigs ו-ReplicaSets

## מה זה Pod?

Pod הוא היחידה הקטנה ביותר שניתן לפרוס ב-OpenShift/Kubernetes. הוא עוטף קונטיינר אחד או יותר שחולקים:
- מרחב רשת (network namespace) משותף - כל הקונטיינרים בפוד מדברים דרך `localhost`.
- אחסון (volumes) משותף.
- מחזור חיים (lifecycle) משותף - כשהפוד מת, כל הקונטיינרים בו מתים.

### דוגמת Pod בסיסי

```yaml
# simple-pod.yaml
apiVersion: v1
kind: Pod
metadata:
  name: hello-pod
  labels:
    app: hello
spec:
  containers:
    - name: hello-container
      image: registry.access.redhat.com/ubi9/ubi:latest
      command: ["/bin/sh", "-c"]
      args: ["echo Hello from OpenShift && sleep 3600"]
      resources:
        requests:
          cpu: "100m"
          memory: "128Mi"
        limits:
          cpu: "500m"
          memory: "256Mi"
      ports:
        - containerPort: 8080
```

```bash
oc apply -f simple-pod.yaml
oc get pod hello-pod
oc describe pod hello-pod
```

**חשוב:** בפרקטיקה כמעט אף פעם לא יוצרים Pod ישירות! תמיד עובדים דרך Deployment שינהל אותו, כי Pod עצמאי לא מתאושש אוטומטית אם הוא קורס.

## Deployment (הסטנדרט המומלץ כיום)

Deployment הוא ה-resource הסטנדרטי של Kubernetes לניהול אפליקציות stateless. הוא יוצר ומנהל ReplicaSet, שבתורו יוצר ומנהל את הפודים בפועל.

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-web-app
  labels:
    app: my-web-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: my-web-app
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1
      maxSurge: 1
  template:
    metadata:
      labels:
        app: my-web-app
    spec:
      containers:
        - name: web
          image: quay.io/example/my-web-app:v1.2.0
          ports:
            - containerPort: 8080
          env:
            - name: ENVIRONMENT
              value: "production"
          resources:
            requests:
              cpu: "250m"
              memory: "256Mi"
            limits:
              cpu: "1"
              memory: "512Mi"
          readinessProbe:
            httpGet:
              path: /healthz/ready
              port: 8080
            initialDelaySeconds: 5
            periodSeconds: 10
          livenessProbe:
            httpGet:
              path: /healthz/live
              port: 8080
            initialDelaySeconds: 15
            periodSeconds: 20
```

```bash
oc apply -f deployment.yaml

# הגדלת/הקטנת מספר עותקים
oc scale deployment my-web-app --replicas=5

# עדכון תמונה (rolling update)
oc set image deployment/my-web-app web=quay.io/example/my-web-app:v1.3.0

# צפייה בהיסטוריית שינויים
oc rollout history deployment/my-web-app

# מעקב אחר rollout חי
oc rollout status deployment/my-web-app

# חזרה לגרסה קודמת (rollback)
oc rollout undo deployment/my-web-app
oc rollout undo deployment/my-web-app --to-revision=2

# הפסקה זמנית של עדכונים (למשל בזמן שינויים מרובים)
oc rollout pause deployment/my-web-app
oc rollout resume deployment/my-web-app
```

## DeploymentConfig - ה-Resource הייחודי ל-OpenShift (Legacy)

לפני ש-Kubernetes הציג Deployment, ל-OpenShift כבר היה מנגנון דומה בשם **DeploymentConfig (DC)**. עדיין נתקלים בו בקוד legacy רב, אז חשוב להכיר את ההבדלים:

| היבט | Deployment | DeploymentConfig |
|---|---|---|
| Native ל | Kubernetes | OpenShift בלבד |
| ניהול | ReplicaSet | ReplicationController |
| Trigger אוטומטי מ-ImageStream | לא (צריך CI חיצוני) | כן, מובנה! |
| Hooks (pre/post deploy) | לא קיים | קיים (lifecycle hooks) |
| אסטרטגיות פריסה | RollingUpdate, Recreate | Rolling, Recreate, Custom |
| המלצת Red Hat כיום | **כן, מומלץ** | Deprecated - לא מומלץ לפרויקטים חדשים |

```yaml
# deploymentconfig.yaml (לצורך הכרות בלבד)
apiVersion: apps.openshift.io/v1
kind: DeploymentConfig
metadata:
  name: my-legacy-app
spec:
  replicas: 2
  selector:
    app: my-legacy-app
  triggers:
    - type: ConfigChange
    - type: ImageChange
      imageChangeParams:
        automatic: true
        containerNames:
          - my-legacy-app
        from:
          kind: ImageStreamTag
          name: my-legacy-app:latest
  strategy:
    type: Rolling
  template:
    metadata:
      labels:
        app: my-legacy-app
    spec:
      containers:
        - name: my-legacy-app
          image: my-legacy-app:latest
```

> **המלצה מקצועית:** לפרויקטים חדשים - השתמשו תמיד ב-**Deployment** הרגיל, לא ב-DeploymentConfig. Red Hat עצמה ממליצה על כך משנת 2019 ואילך.

## StatefulSet - כשצריך זהות קבועה

לאפליקציות stateful (מסדי נתונים, Kafka, וכו') שדורשות שם קבוע, אחסון קבוע וסדר עלייה מוגדר:

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres-db
spec:
  serviceName: "postgres"
  replicas: 3
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
        - name: postgres
          image: registry.redhat.io/rhel9/postgresql-15:latest
          volumeMounts:
            - name: data
              mountPath: /var/lib/pgsql/data
  volumeClaimTemplates:
    - metadata:
        name: data
      spec:
        accessModes: ["ReadWriteOnce"]
        resources:
          requests:
            storage: 10Gi
```

## DaemonSet - פוד אחד על כל node

לרכיבים כמו log collectors, monitoring agents:

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: log-collector
spec:
  selector:
    matchLabels:
      app: log-collector
  template:
    metadata:
      labels:
        app: log-collector
    spec:
      containers:
        - name: collector
          image: quay.io/example/fluentd:latest
```

## Jobs ו-CronJobs

```yaml
# job.yaml - הרצה חד-פעמית
apiVersion: batch/v1
kind: Job
metadata:
  name: db-migration
spec:
  backoffLimit: 3
  template:
    spec:
      restartPolicy: Never
      containers:
        - name: migrate
          image: quay.io/example/migrator:latest
          command: ["./migrate.sh"]
---
# cronjob.yaml - הרצה מתוזמנת
apiVersion: batch/v1
kind: CronJob
metadata:
  name: nightly-backup
spec:
  schedule: "0 2 * * *"     # כל לילה ב-02:00
  jobTemplate:
    spec:
      template:
        spec:
          restartPolicy: OnFailure
          containers:
            - name: backup
              image: quay.io/example/backup-tool:latest
```

## אבחון בעיות בפודים - הזרימה הנכונה

```bash
# שלב 1: מה הסטטוס?
oc get pods

# שלב 2: אירועים ופרטים
oc describe pod my-pod-xyz
# חפשו בסוף הפלט את מקטע "Events" - שם רוב הרמזים

# שלב 3: לוגים
oc logs my-pod-xyz
oc logs my-pod-xyz --previous   # אם היה restart

# שלב 4: כניסה לתוך קונטיינר debug אם הפוד לא רץ בכלל
oc debug pod/my-pod-xyz

# שלב 5: אם יש בעיית תלות/סקדולינג
oc get events --sort-by='.lastTimestamp' | grep my-pod-xyz
```

### מצבים נפוצים ופתרונם

| מצב (Status) | סיבה אופיינית | פתרון |
|---|---|---|
| `Pending` | אין מספיק משאבים בקלאסטר / בעיית scheduling | `oc describe pod` לבדוק Events, לבדוק ResourceQuota |
| `ImagePullBackOff` | תמונה לא קיימת / אין הרשאות pull | לבדוק שם התמונה, secret ל-registry |
| `CrashLoopBackOff` | האפליקציה קורסת בעלייה | `oc logs --previous`, לבדוק liveness probe |
| `OOMKilled` | חריגה ממגבלת זיכרון | להגדיל `resources.limits.memory` |
| `CreateContainerConfigError` | ConfigMap/Secret חסר | לוודא שה-ConfigMap/Secret קיים בפרויקט |

## קישורים חיצוניים

### תיעוד רשמי
- Working with pods - Building Applications: https://docs.redhat.com/en/documentation/openshift_container_platform/4.22
- What is a DeploymentConfig - Red Hat Documentation: https://docs.redhat.com/en/documentation/openshift_container_platform/4.22

### סרטוני יוטיוב מומלצים
- Fundamentals of Red Hat OpenShift for Developers (Coursera - כולל Deployments): https://www.coursera.org/learn/fundamentals-of-red-hat-openshift-for-developers
- OpenShift for the Absolute Beginners: https://www.udemy.com/course/learn-openshift/

## טיפים וטריקים

1. **תמיד הגדירו `resources.requests` ו-`limits`** - בלעדיהם ה-scheduler לא יכול לקבל החלטות טובות, ואתם חשופים ל-OOMKill או ל-"noisy neighbor".
2. **readinessProbe ≠ livenessProbe** - readiness קובע אם הפוד יקבל תעבורה, liveness קובע אם צריך להפעיל restart. בלבול ביניהם גורם ל-restart loops מיותרים.
3. השתמשו ב-`maxUnavailable: 0` ב-RollingUpdate כשאתם צריכים zero-downtime מוחלט (במחיר של דרישת משאבים גבוהה יותר בזמן ה-rollout).
4. `oc rollout history deployment/my-app --revision=3` - מציג בדיוק מה השתנה בגרסה ספציפית.
5. הימנעו מ-DeploymentConfig בקוד חדש - הוא deprecated וללא roadmap עתידי.

---
**במדריך הבא:** Services, Routes, Ingress ורשתות ב-OpenShift.
