---
title: "Monitoring ו-Logging ב-Kubernetes"
category: DevOps/Kubernetes
part: 9/10
---

## תוכן עניינים
1. [למה ניטור בקוברנטיס שונה ומורכב יותר](#למה-שונה)
2. [Metrics Server - ניטור בסיסי](#metrics-server)
3. [Prometheus - ארכיטקטורה ועקרונות](#prometheus)
4. [דוגמת ServiceMonitor](#servicemonitor)
5. [Grafana - ויזואליזציה](#grafana)
6. [Horizontal Pod Autoscaler (HPA) מבוסס metrics](#hpa)
7. [Logging - איסוף לוגים מרוכז](#logging)
8. [Liveness/Readiness כחלק מהניטור](#probes-monitoring)
9. [פקודות kubectl שימושיות](#פקודות)
10. [טיפים וטריקים](#טיפים)
11. [שאלות ראיון עבודה](#שאלות)
12. [קישורים חיצוניים](#קישורים)

---

## למה ניטור בקוברנטיס שונה ומורכב יותר {#למה-שונה}

בסביבה מסורתית יש לכם כמה שרתים קבועים לניטור. בקוברנטיס:

- **Pods הם ephemeral** - נוצרים ונעלמים כל הזמן (scaling, עדכונים, קריסות) - צריך שיטת ניטור שמתמודדת עם "יעדים" (targets) דינמיים.
- **ריבוי שכבות** - צריך לנטר גם ברמת התשתית (Nodes), גם ברמת Kubernetes עצמו (Pods, Deployments), וגם ברמת האפליקציה.
- **Service Discovery** - כלי הניטור צריך "לגלות" אוטומטית Pods חדשים בלי קונפיגורציה ידנית.

הפתרון הסטנדרטי בתעשייה כיום: **Prometheus** לאיסוף metrics, **Grafana** לוויזואליזציה, ו-stack ייעודי ללוגים (EFK/Loki).

---

## Metrics Server - ניטור בסיסי {#metrics-server}

**Metrics Server** הוא רכיב קל-משקל שאוסף מדדי CPU/Memory בסיסיים מכל Node ו-Pod, ומאפשר פקודות בסיסיות כמו `kubectl top`, וגם הוא הבסיס ל-HPA. **הוא לא מהווה פתרון ניטור מלא** - אין בו היסטוריה, אין alerting, אין dashboards.

```bash
# התקנה
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# שימוש
kubectl top nodes
kubectl top pods
kubectl top pods -n production --sort-by=memory
```

---

## Prometheus - ארכיטקטורה ועקרונות {#prometheus}

Prometheus הוא פרויקט CNCF (ה-graduated project השני אחרי Kubernetes עצמו) לאיסוף וניתוח metrics. עקרונות מפתח:

- **Pull-based** - Prometheus **שולף** (scrape) מדדים מהאפליקציות ברווחי זמן קבועים, בניגוד לרוב הכלים שדוחפים (push) נתונים.
- **PromQL** - שפת שאילתות ייעודית לחיפוש וניתוח מדדים לאורך זמן.
- **Time-series data** - כל מדד נשמר עם timestamp, מה שמאפשר גרפים והתראות מבוססי מגמה.

### התקנה עם Helm (kube-prometheus-stack)

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm install monitoring prometheus-community/kube-prometheus-stack \
  --namespace monitoring --create-namespace
```

זה מתקין בבת אחת: Prometheus, Grafana, Alertmanager, ו-exporters נדרשים.

### חשיפת metrics מהאפליקציה שלכם

האפליקציה צריכה לחשוף endpoint (בדרך כלל `/metrics`) בפורמט Prometheus. יש ספריות client רשמיות לכל שפה עיקרית (Go, Python, Java, Node.js).

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
spec:
  template:
    metadata:
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "8080"
        prometheus.io/path: "/metrics"
    spec:
      containers:
        - name: myapp
          image: myapp:1.0
          ports:
            - containerPort: 8080
```

---

## דוגמת ServiceMonitor {#servicemonitor}

כשעובדים עם Prometheus Operator (מגיע עם kube-prometheus-stack), במקום annotations משתמשים ב-CRD ייעודי:

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: myapp-monitor
  namespace: monitoring
  labels:
    release: monitoring
spec:
  selector:
    matchLabels:
      app: myapp
  endpoints:
    - port: metrics
      interval: 30s
      path: /metrics
  namespaceSelector:
    matchNames:
      - production
```

### דוגמת שאילתת PromQL בסיסית

```promql
# אחוז שימוש CPU ממוצע לפי Pod ב-5 דקות אחרונות
rate(container_cpu_usage_seconds_total{namespace="production"}[5m])

# Pods שנכשלו בבדיקת בריאות
kube_pod_status_ready{condition="false"}

# מספר restarts לכל container
kube_pod_container_status_restarts_total
```

---

## Grafana - ויזואליזציה {#grafana}

Grafana מציג את הנתונים שנאספו ב-Prometheus כ-dashboards גרפיים. יש dashboards מוכנים ומעולים לקוברנטיס בקהילה (Grafana Labs מציעה גלריה שלמה).

```bash
# גישה זמנית ל-Grafana (בסביבת פיתוח)
kubectl port-forward -n monitoring svc/monitoring-grafana 3000:80

# סיסמת admin ברירת מחדל (מ-kube-prometheus-stack)
kubectl get secret -n monitoring monitoring-grafana \
  -o jsonpath="{.data.admin-password}" | base64 -d
```

---

## Horizontal Pod Autoscaler (HPA) מבוסס metrics {#hpa}

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: myapp-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: myapp
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
```

```bash
kubectl apply -f hpa.yaml
kubectl get hpa
kubectl describe hpa myapp-hpa
```

**הערה:** ל-HPA מבוסס CPU/Memory מספיק Metrics Server. ל-scaling מבוסס מדדים מותאמים אישית (custom metrics, כמו אורך תור) צריך **Prometheus Adapter** שמחבר בין Prometheus ל-Kubernetes Metrics API.

---

## Logging - איסוף לוגים מרוכז {#logging}

בברירת מחדל, `kubectl logs <pod>` קורא לוגים ישירות מה-Node, אבל **אם ה-Pod נמחק, הלוגים אבדים לצמיתות**. לכן בפרודקשן תמיד צריך פתרון ריכוזי:

### דפוס נפוץ: EFK Stack (Elasticsearch + Fluentd/Fluent Bit + Kibana)
```
כל Node → Fluent Bit (DaemonSet, אוסף לוגים) → Elasticsearch (אחסון וחיפוש) → Kibana (ויזואליזציה)
```

### דפוס חלופי פופולרי ומקובל היום: Loki Stack (Grafana Loki)
```
כל Node → Promtail (DaemonSet) → Loki (אחסון יעיל, אינדקס רק על labels) → Grafana (אותו כלי כמו ל-metrics!)
```

### דוגמת DaemonSet לאיסוף לוגים (Fluent Bit)
```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: fluent-bit
  namespace: logging
spec:
  selector:
    matchLabels:
      app: fluent-bit
  template:
    metadata:
      labels:
        app: fluent-bit
    spec:
      containers:
        - name: fluent-bit
          image: fluent/fluent-bit:3.0
          volumeMounts:
            - name: varlog
              mountPath: /var/log
      volumes:
        - name: varlog
          hostPath:
            path: /var/log
```

**למה דווקא DaemonSet?** כי צריך **בדיוק instance אחד** של אוסף הלוגים על **כל** Node בקלאסטר - זה בדיוק המקרה שלשמו נועד DaemonSet.

---

## Liveness/Readiness כחלק מהניטור {#probes-monitoring}

חשוב לזכור: ה-Probes (מדריך 2) הן חלק אינטגרלי מהניטור - הן מה שנותן ל-Kubernetes עצמו יכולת "self-healing" אוטומטית, עוד לפני שבן אדם בכלל רואה alert.

---

## פקודות kubectl שימושיות {#פקודות}

```bash
# ניטור בסיסי של משאבים
kubectl top nodes
kubectl top pods -A

# לוגים - כולל multi-container ו-previous crash
kubectl logs <pod> -c <container-name>
kubectl logs <pod> --previous
kubectl logs -l app=myapp --all-containers --prefix

# צפייה חיה בלוגים (כמו tail -f)
kubectl logs -f <pod>

# events - קריטי לניטור מצבים חריגים
kubectl get events --sort-by='.lastTimestamp' -A

# מצב HPA בזמן אמת
kubectl get hpa -w
```

---

## טיפים וטריקים {#טיפים}

1. **`kubectl top` לא מספיק לפרודקשן** - הוא רק snapshot נוכחי, בלי היסטוריה. חובה Prometheus+Grafana לניטור אמיתי.
2. **תמיד שמרו לוגים מחוץ לקלאסטר** - Pod שנמחק מוחק את הלוגים שלו; פתרון ריכוזי הוא לא "נחמד להיות", אלא חובה.
3. **התראות (Alerting) חשובות מדשבורדים** - dashboard יפה שאף אחד לא מסתכל עליו לא שווה הרבה; הגדירו Alertmanager עם ערוצי Slack/PagerDuty.
4. **RED / USE Method** - מסגרות מוכרות למדדים: RED (Rate, Errors, Duration) לשירותים, USE (Utilization, Saturation, Errors) למשאבים.
5. **תייגו metrics לפי namespace/team** - כשיש הרבה צוותים, labels עקביים ב-Prometheus מונעים כאוס ב-dashboards.
6. **Loki חוסך עלויות** - כי הוא לא מאנדקס את תוכן הלוג המלא (בניגוד ל-Elasticsearch), רק metadata/labels - הרבה יותר זול לתפעל בקנה מידה גדול.

---

## שאלות ראיון עבודה {#שאלות}

**ש: מה ההבדל בין Metrics Server ל-Prometheus?**
ת: Metrics Server הוא רכיב קל-משקל שאוסף רק CPU/Memory נוכחיים, בלי היסטוריה - משמש בעיקר עבור `kubectl top` ו-HPA בסיסי. Prometheus הוא מערכת ניטור מלאה עם time-series database, שפת שאילתות (PromQL), והתראות - מתאים לניטור production אמיתי.

**ש: איך Prometheus אוסף מדדים - push או pull?**
ת: Pull - Prometheus שולף (scrape) מדדים מ-endpoints שהאפליקציות חושפות (בדרך כלל `/metrics`) ברווחי זמן קבועים. זה שונה מרוב מערכות הניטור המסורתיות שמבוססות על push.

**ש: למה חייבים פתרון ריכוזי ללוגים, ולא מספיק `kubectl logs`?**
ת: כי לוגים של Pod נשמרים רק כל עוד ה-Pod (או ה-Node) קיים - ברגע שה-Pod נמחק (למשל אחרי קריסה או deployment), הלוגים אבדים לצמיתות. פתרון ריכוזי (EFK/Loki) שולח לוגים למקום מרוכז חיצוני שנשאר גם אחרי מחיקת ה-Pod.

**ש: מה ההבדל בין livenessProbe להתראות ניטור (alerting)?**
ת: livenessProbe הוא מנגנון self-healing אוטומטי ברמת Kubernetes עצמו - אם הוא נכשל, ה-Pod מופעל מחדש אוטומטית בלי מעורבות אדם. alerting (למשל דרך Alertmanager) מתריע לבני אדם על מצבים חריגים שדורשים תשומת לב או החלטה, ולא בהכרח ניתנים לתיקון אוטומטי.

**ש: מדוע DaemonSet הוא הדפוס המקובל לאיסוף לוגים?**
ת: כי צריך בדיוק instance אחד של אוסף לוגים (כמו Fluent Bit) שרץ על **כל** Node בקלאסטר כדי לקרוא את קבצי הלוג המקומיים שלו - זו בדיוק ההגדרה של DaemonSet, בניגוד ל-Deployment שלא מבטיח הפצה אחידה כזו על פני Nodes.

**ש: מה זה HPA ואיך הוא קשור לניטור?**
ת: Horizontal Pod Autoscaler מגדיל/מקטין אוטומטית את מספר ה-replicas של Deployment בהתאם למדדים (CPU, Memory, או custom metrics) - הוא תלוי לחלוטין בזמינות מדדים עדכניים, בין אם דרך Metrics Server (בסיסי) או Prometheus Adapter (מדדים מותאמים אישית).

---

## קישורים חיצוניים {#קישורים}

### תיעוד רשמי
- Kubernetes Metrics API: https://kubernetes.io/docs/tasks/debug/debug-cluster/resource-metrics-pipeline/
- Prometheus - תיעוד רשמי: https://prometheus.io/docs/introduction/overview/
- Horizontal Pod Autoscaling: https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/
- Grafana Loki: https://grafana.com/docs/loki/latest/
- kube-prometheus-stack (Helm chart): https://github.com/prometheus-community/helm-charts/tree/main/charts/kube-prometheus-stack

### סרטוני YouTube
- TechWorld with Nana - Prometheus Monitoring Crash Course: https://www.youtube.com/c/techworldwithnana
- freeCodeCamp - Kubernetes Full Course: https://www.youtube.com/watch?v=d6WC5n9G_sM

---

**הקודם:** [מדריך 8 - Ingress](./08-ingress.md) | **הבא:** [מדריך 10 - שאלות ראיון עבודה וטיפים](./10-interview-questions-tips.md)
