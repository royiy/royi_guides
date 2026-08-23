---
title: "Monitoring, Logging, Troubleshooting ו-Autoscaling"
category: DevOps/OpenShift
part: 9/10
---

# מדריך 9: Monitoring, Logging, Troubleshooting ו-Autoscaling

## Monitoring - הערימה המובנית

OpenShift מגיע עם ערימת monitoring מובנית ומופעלת כברירת מחדל (**Cluster Monitoring Operator**), המבוססת על:
- **Prometheus** - איסוף מטריקות ו-time-series database.
- **Alertmanager** - ניהול והפצת התראות.
- **Grafana / OpenShift Console dashboards** - ויזואליזציה.
- **Thanos** - אחסון ארוך טווח (retention מורחב).

### גישה למוניטורינג

```bash
# בקונסולה הגרפית: Observe > Metrics / Dashboards / Alerting
# או ישירות מה-CLI:

oc get pods -n openshift-monitoring

# הרצת שאילתת PromQL ידנית (למשל: CPU usage לפי namespace)
oc exec -n openshift-monitoring prometheus-k8s-0 -- \
  promtool query instant http://localhost:9090 'sum(rate(container_cpu_usage_seconds_total[5m])) by (namespace)'
```

### הגדרת Monitoring למרחב-שמות של אפליקציה (User Workload Monitoring)

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: cluster-monitoring-config
  namespace: openshift-monitoring
data:
  config.yaml: |
    enableUserWorkload: true
```

זה מפעיל Prometheus נוסף שסורק אוטומטית `ServiceMonitor`/`PodMonitor` שהמשתמשים יוצרים בפרויקטים שלהם:

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: my-app-monitor
  namespace: my-app
spec:
  selector:
    matchLabels:
      app: my-app
  endpoints:
    - port: metrics
      interval: 30s
      path: /metrics
```

### PromQL - דוגמאות שאילתות שימושיות

```promql
# שימוש CPU לפי פוד
sum(rate(container_cpu_usage_seconds_total{namespace="my-app"}[5m])) by (pod)

# שימוש זיכרון לפי פוד
sum(container_memory_working_set_bytes{namespace="my-app"}) by (pod)

# מספר restarts של פודים בשעה האחרונה
increase(kube_pod_container_status_restarts_total{namespace="my-app"}[1h])

# אחוז שגיאות HTTP 5xx
sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m])) * 100
```

### הגדרת Alert מותאם אישית

```yaml
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: my-app-alerts
  namespace: my-app
spec:
  groups:
    - name: my-app.rules
      rules:
        - alert: HighErrorRate
          expr: |
            sum(rate(http_requests_total{status=~"5..", namespace="my-app"}[5m]))
            / sum(rate(http_requests_total{namespace="my-app"}[5m])) > 0.05
          for: 5m
          labels:
            severity: critical
          annotations:
            summary: "אחוז שגיאות 5xx גבוה ({{ $value | humanizePercentage }})"
```

## Logging

Red Hat ממליצה על **OpenShift Logging Operator** (מבוסס Loki כברירת מחדל בגרסאות עדכניות, Elasticsearch בעבר) לאיסוף וריכוז לוגים.

```bash
# לוגים בסיסיים של פוד בודד
oc logs -f my-pod

# לוגים של כל הפודים תחת deployment
oc logs -f deployment/my-app --all-containers=true

# לוגים ממספר פודים בו-זמנית (עם label selector)
oc logs -l app=my-app -f --max-log-requests=10

# חיפוש בלוגים (בשילוב עם grep)
oc logs my-pod | grep ERROR

# לוגים היסטוריים (30 דקות אחרונות)
oc logs my-pod --since=30m
```

### שאילתת LogQL (Loki) - דוגמה

```logql
{namespace="my-app", app="my-web-app"} |= "ERROR" | json | line_format "{{.message}}"
```

## Troubleshooting - זרימת עבודה מובנית

### שלב 1: מצב כללי של הקלאסטר

```bash
oc get nodes
oc get co   # ClusterOperators - חשוב לבדוק שהכל Available=True
oc adm top nodes    # ניצול CPU/Memory לפי node
oc adm top pods -n my-app --sort-by=cpu
```

### שלב 2: אבחון פוד ספציפי

```bash
oc get pod my-pod -o wide
oc describe pod my-pod
oc logs my-pod --previous
oc get events -n my-app --sort-by='.lastTimestamp'
```

### שלב 3: debug interactive

```bash
# יוצר פוד debug זהה לפוד הבעייתי, עם shell פתוח
oc debug pod/my-pod

# debug node שלם (בעיות network/disk ברמת ה-host)
oc debug node/worker-01

# בדיקת must-gather (איסוף מידע מלא לתמיכת Red Hat)
oc adm must-gather
```

### שלב 4: בעיות ביצועים

```bash
# חיתוך משאבים מוקצים מול בפועל
oc describe node worker-01 | grep -A5 "Allocated resources"

# בדיקת HPA (אם קיים)
oc get hpa -n my-app

# בדיקת PodDisruptionBudget שעלול לחסום עדכונים
oc get pdb -n my-app
```

## Autoscaling

### HPA - Horizontal Pod Autoscaler

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: my-app-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: my-app
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
oc apply -f hpa.yaml
oc get hpa my-app-hpa -w
oc describe hpa my-app-hpa
```

### VPA - Vertical Pod Autoscaler

מתאים משאבים (CPU/memory requests) אוטומטית לפי צריכה בפועל, במקום מספר עותקים:

```yaml
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: my-app-vpa
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: my-app
  updatePolicy:
    updateMode: "Auto"   # או "Off" למצב "recommendation only"
```

### Cluster Autoscaler - הוספת/הסרת nodes

```yaml
apiVersion: autoscaling.openshift.io/v1
kind: ClusterAutoscaler
metadata:
  name: default
spec:
  resourceLimits:
    maxNodesTotal: 24
  scaleDown:
    enabled: true
    delayAfterAdd: 10m
    unneededTime: 10m
```

## דוגמה מלאה: זרימת אבחון תקלת production

```bash
# 1. משתמש מדווח שהאתר איטי - נבדוק ברמת האשכול
oc get co | grep -v "True.*False.*False"

# 2. בדיקת ניצול משאבים
oc adm top pods -n my-app --sort-by=memory

# 3. בדיקה אם HPA כבר מגיב
oc get hpa -n my-app

# 4. אם פודים מתים (OOMKilled) - בדיקת לוגים
oc get pods -n my-app | grep -v Running
oc describe pod <problem-pod> -n my-app | grep -A5 "Last State"

# 5. בדיקת מטריקות Prometheus
# Observe > Metrics בקונסולה, שאילתה: rate(container_cpu_usage_seconds_total{namespace="my-app"}[5m])

# 6. פתרון זמני מיידי: scale up ידני
oc scale deployment my-app --replicas=8 -n my-app
```

## קישורים חיצוניים

### תיעוד רשמי
- Monitoring overview - OpenShift Container Platform Documentation: https://docs.redhat.com/en/documentation/openshift_container_platform/4.22
- About OpenShift Logging - Red Hat Documentation: https://docs.redhat.com/en/documentation/openshift_container_platform/4.22
- Automatically scaling pods with the horizontal pod autoscaler: https://docs.redhat.com/en/documentation/openshift_container_platform/4.22

### סרטוני יוטיוב מומלצים
- Red Hat OpenShift Administration EX280 - Operational Cluster Management: https://www.oreilly.com/library/view/red-hat-openshift/9780137441938/
- OpenShift: Beginner to Advanced Complete Course: https://www.youtube.com/watch?v=zVkw-qLp_H4

## טיפים וטריקים

1. **תמיד תתחילו אבחון מ-`oc get co`** (ClusterOperators) - אם משהו ברמת הקלאסטר לא בריא, זה יגרום לתופעות מוזרות בכל האפליקציות.
2. `oc adm must-gather` הוא הכלי הרשמי לפני פתיחת קריאת תמיכה ל-Red Hat - הוא אוסף logs, configs ו-metadata רלוונטיים אוטומטית.
3. הגדירו **תמיד** גם `minReplicas >= 2` ב-HPA לצורך high-availability, גם אם הביקוש נמוך.
4. שלבו HPA + PodDisruptionBudget יחד - אחרת עדכון node (drain) עלול להוריד את כל הפודים בבת אחת.
5. `--sort-by=cpu` / `--sort-by=memory` ב-`oc adm top pods` חוסך המון זמן במציאת "החשוד המיידי" בבעיית ביצועים.

---
**במדריך הבא (האחרון):** שאלות ראיון עבודה מקיפות ב-OpenShift + טיפים כלליים.
