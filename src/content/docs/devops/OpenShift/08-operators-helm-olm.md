# מדריך 8: Operators, Helm ו-OLM (Operator Lifecycle Manager)

## מה זה Operator?

Operator הוא דפוס תכנון (pattern) שמרחיב את Kubernetes API כדי לנהל אפליקציה מורכבת **כאילו יש לה מנהל מערכת אנושי אוטומטי**. הוא עוקב אחרי מצב היעד הרצוי (Desired State) ופועל כל הזמן להתאים את המצב בפועל אליו (Reconciliation Loop) - כולל התקנה, שדרוגים, גיבויים, ותיקון תקלות אוטומטי.

### דוגמה מוחשית - Operator למסד נתונים PostgreSQL

בלי Operator: אתם צריכים לכתוב Deployment, PVC, Service, ConfigMap, לנהל גיבויים ידנית, לטפל בכשלים ידנית.

עם Operator (למשל `postgresql-operator`): אתם פשוט יוצרים משאב custom:

```yaml
apiVersion: postgresql.example.com/v1
kind: PostgresCluster
metadata:
  name: my-database
spec:
  replicas: 3
  version: "15"
  storage: 20Gi
  backupSchedule: "0 2 * * *"
```

וה-Operator עצמו יוצר, מנהל, מנטר, ומתקן אוטומטית את כל התשתית הנדרשת.

## CRD - Custom Resource Definition

Operator מבוסס תמיד על **CRD** - הגדרה שמלמדת את ה-Kubernetes API "type" חדש (כמו `PostgresCluster` בדוגמה למעלה).

```bash
# רשימת כל ה-CRDs בקלאסטר
oc get crd

# חיפוש CRD ספציפי
oc get crd | grep postgres

# פרטי CRD
oc explain postgrescluster.spec
```

## OLM - Operator Lifecycle Manager

OLM הוא המנגנון שמנהל את **מחזור החיים** של ה-Operators עצמם - התקנה, שדרוג, תלויות, והרשאות. הוא ניתן לגישה דרך **OperatorHub** בקונסולה הגרפית או דרך CLI.

### מבנה OLM

- **CatalogSource** - "חנות אפליקציות" של Operators זמינים.
- **Subscription** - "מנוי" להתקנה + עדכונים אוטומטיים של Operator מסוים.
- **InstallPlan** - תוכנית התקנה בפועל (שאושרה ידנית או אוטומטית).
- **ClusterServiceVersion (CSV)** - "המניפסט" של גרסת Operator ספציפית שמותקנת.

### התקנת Operator דרך CLI

```yaml
apiVersion: operators.coreos.com/v1alpha1
kind: Subscription
metadata:
  name: postgresql-operator
  namespace: openshift-operators
spec:
  channel: stable
  name: postgresql-operator
  source: redhat-operators
  sourceNamespace: openshift-marketplace
  installPlanApproval: Automatic   # או Manual לשליטה מלאה על עדכונים
```

```bash
oc apply -f subscription.yaml

# מעקב אחר סטטוס ההתקנה
oc get subscription postgresql-operator -n openshift-operators
oc get csv -n openshift-operators
oc get installplan -n openshift-operators
```

### Operators פופולריים ב-OpenShift

| Operator | תפקיד |
|---|---|
| OpenShift GitOps | ניהול GitOps מבוסס Argo CD |
| OpenShift Pipelines | CI/CD מבוסס Tekton |
| OpenShift Service Mesh | Istio-based service mesh |
| OpenShift Data Foundation | אחסון מבוסס Ceph |
| OpenShift Logging | אגרגציית לוגים (Loki/Elasticsearch) |
| OpenShift Monitoring | Prometheus + Grafana + Alertmanager |
| Red Hat OpenShift AI | פלטפורמת MLOps |
| Crunchy PostgreSQL Operator | ניהול PostgreSQL ברמת production |
| Strimzi Kafka Operator | ניהול קלאסטרי Kafka |

## Helm ב-OpenShift

Helm הוא package manager סטנדרטי של Kubernetes, שעובד גם ב-OpenShift ללא הבדל.

### התקנת Helm CLI

```bash
curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3
chmod +x get_helm.sh
./get_helm.sh
```

### שימוש בסיסי

```bash
# הוספת repository
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update

# חיפוש chart
helm search repo postgresql

# התקנת chart
helm install my-release bitnami/postgresql \
  --namespace my-app \
  --set auth.postgresPassword=secretpass \
  --set primary.persistence.size=10Gi

# עדכון release
helm upgrade my-release bitnami/postgresql --set primary.persistence.size=20Gi

# rollback
helm rollback my-release 1

# מחיקה
helm uninstall my-release

# רשימת releases מותקנים
helm list -n my-app
```

### בניית Helm Chart מותאם אישית

```
my-chart/
├── Chart.yaml
├── values.yaml
├── templates/
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── route.yaml
│   └── _helpers.tpl
```

```yaml
# Chart.yaml
apiVersion: v2
name: my-app
description: My OpenShift application Helm chart
version: 1.0.0
appVersion: "1.0.0"
```

```yaml
# templates/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ .Release.Name }}-app
spec:
  replicas: {{ .Values.replicaCount }}
  selector:
    matchLabels:
      app: {{ .Release.Name }}
  template:
    metadata:
      labels:
        app: {{ .Release.Name }}
    spec:
      containers:
        - name: app
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
          resources:
            {{- toYaml .Values.resources | nindent 12 }}
```

```bash
helm install my-app ./my-chart --set replicaCount=3
helm template my-app ./my-chart   # תצוגה מקדימה של ה-YAML שייווצר
helm lint ./my-chart              # בדיקת תקינות
```

## Helm vs Operator - מתי מה?

| היבט | Helm | Operator |
|---|---|---|
| מטרה | פריסה חד-פעמית של אפליקציה | ניהול מתמשך + reconciliation |
| לוגיקה תפעולית מתקדמת (backup, upgrade אוטומטי) | לא | כן |
| מורכבות פיתוח | נמוכה יחסית (templates) | גבוהה (Go/Ansible/Java operator) |
| מתאים ל | פריסות "set and forget" | אפליקציות stateful מורכבות (DB, message queues) |

## כתיבת Operator פשוט (Operator SDK)

```bash
# התקנת operator-sdk
operator-sdk init --domain example.com --repo github.com/example/my-operator

# יצירת API + Controller
operator-sdk create api --group apps --version v1alpha1 --kind MyApp --resource --controller

# בנייה ופריסה
make docker-build docker-push IMG=quay.io/example/my-operator:v1
make deploy IMG=quay.io/example/my-operator:v1
```

## קישורים חיצוניים

### תיעוד רשמי
- Understanding Operators - OpenShift Documentation: https://docs.redhat.com/en/documentation/openshift_container_platform/4.22
- Deploy Helm charts - OpenShift Container Platform 4.14: https://docs.redhat.com/en/documentation/openshift_container_platform/4.14/html/about/welcome-index
- OperatorHub - Red Hat Ecosystem Catalog: https://developers.redhat.com/products/openshift/getting-started

### סרטוני יוטיוב מומלצים
- OpenShift: Beginner to Advanced Complete Course (כולל Operators): https://www.youtube.com/watch?v=zVkw-qLp_H4
- Fundamentals of Red Hat OpenShift for Developers: https://www.coursera.org/learn/fundamentals-of-red-hat-openshift-for-developers

## טיפים וטריקים

1. **`installPlanApproval: Manual`** מומלץ ב-production - מאפשר לבדוק כל שדרוג Operator לפני שהוא מוחל, במקום עדכון אוטומטי בלתי צפוי.
2. לפני שכותבים Operator בעצמכם - בדקו קודם ב-**OperatorHub** אם כבר קיים Operator מוכן לצורך שלכם (Red Hat, Community, ISV).
3. `oc get events -n openshift-operators --sort-by='.lastTimestamp'` - הדרך הכי טובה לאבחן למה Operator "תקוע" בהתקנה.
4. שילוב Helm בתוך GitOps (Argo CD) הוא פרקטיקה נפוצה מאוד - Argo CD תומך native ב-Helm charts כ-source.
5. Operators "capability level" - Red Hat מדרגת Operators בסולם 1-5 (Basic Install עד Auto Pilot) - בדקו את הרמה לפני שתסמכו על תפעול אוטומטי מלא.

---
**במדריך הבא:** Monitoring, Logging, Troubleshooting ו-Autoscaling.
