# מדריך 3: מבנה Helm Chart ויצירת Chart ראשון

## יצירת Chart חדש

הדרך הקלה ביותר להתחיל היא עם הפקודה `helm create`, שיוצרת שלד (scaffold) בסיסי:

```bash
helm create my-app
```

זה יוצר את מבנה התיקיות הבא:

```
my-app/
├── Chart.yaml           # מטא-דאטה על ה-Chart
├── values.yaml          # ערכי ברירת מחדל
├── charts/              # תלויות (subcharts)
├── templates/           # תבניות YAML של Kubernetes
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── ingress.yaml
│   ├── serviceaccount.yaml
│   ├── hpa.yaml
│   ├── NOTES.txt        # טקסט שמוצג למשתמש אחרי התקנה
│   ├── _helpers.tpl     # פונקציות עזר (partials) לשימוש חוזר
│   └── tests/
│       └── test-connection.yaml
└── .helmignore          # קבצים שיש להתעלם מהם באריזה
```

## הסבר על כל קובץ

### Chart.yaml — כרטיס הביקור של ה-Chart

```yaml
apiVersion: v2
name: my-app
description: A Helm chart for my application
type: application
version: 0.1.0        # גרסת ה-Chart עצמו (SemVer)
appVersion: "1.16.0"   # גרסת האפליקציה שה-Chart פורס

keywords:
  - web
  - backend
home: https://example.com
sources:
  - https://github.com/example/my-app
maintainers:
  - name: Israel Israeli
    email: israel@example.com

dependencies:
  - name: postgresql
    version: "12.x.x"
    repository: "https://charts.bitnami.com/bitnami"
    condition: postgresql.enabled
```

**נקודות חשובות:**
- `version` — גרסת ה-**Chart** עצמו (מתעדכן בכל שינוי במבנה/templates)
- `appVersion` — גרסת ה-**אפליקציה** שהוא פורס (למשל גרסת nginx, PostgreSQL וכו')
- `type` יכול להיות `application` (ברירת מחדל) או `library` (Chart שהוא רק ספריית helpers, בלי release עצמאי)

### values.yaml — ערכי ברירת מחדל

```yaml
replicaCount: 2

image:
  repository: nginx
  pullPolicy: IfNotPresent
  tag: ""  # אם ריק, ישתמש ב-appVersion מ-Chart.yaml

service:
  type: ClusterIP
  port: 80

resources:
  limits:
    cpu: 200m
    memory: 256Mi
  requests:
    cpu: 100m
    memory: 128Mi

ingress:
  enabled: false
  className: "nginx"
  hosts:
    - host: myapp.example.com
      paths:
        - path: /
          pathType: Prefix

autoscaling:
  enabled: false
  minReplicas: 1
  maxReplicas: 5
  targetCPUUtilizationPercentage: 80
```

## אריזה, בדיקה והתקנה

```bash
# בדיקת תקינות ה-Chart (חובה לפני כל commit!)
helm lint ./my-app

# הצגת המניפסטים המרונדרים (rendered) בלי להתקין בפועל
helm template my-app ./my-app

# בדיקה "יבשה" מול קלאסטר אמיתי (dry-run)
helm install my-app ./my-app --dry-run --debug

# התקנה בפועל
helm install my-app ./my-app --namespace my-ns --create-namespace

# אריזה לקובץ .tgz להפצה
helm package ./my-app
# יוצר: my-app-0.1.0.tgz
```

## דוגמה מלאה: Chart מותאם אישית לאפליקציית API פשוטה

בואו ניצור Chart מאפס בלי ה-scaffold המלא, כדי להבין את הבסיס:

```
simple-api/
├── Chart.yaml
├── values.yaml
└── templates/
    ├── deployment.yaml
    └── service.yaml
```

**Chart.yaml:**
```yaml
apiVersion: v2
name: simple-api
description: A simple API chart
type: application
version: 1.0.0
appVersion: "1.0"
```

**values.yaml:**
```yaml
replicaCount: 3
image:
  repository: myregistry/simple-api
  tag: "1.0.0"
port: 8080
```

**templates/deployment.yaml:**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ .Release.Name }}-simple-api
spec:
  replicas: {{ .Values.replicaCount }}
  selector:
    matchLabels:
      app: {{ .Release.Name }}-simple-api
  template:
    metadata:
      labels:
        app: {{ .Release.Name }}-simple-api
    spec:
      containers:
        - name: simple-api
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
          ports:
            - containerPort: {{ .Values.port }}
```

**templates/service.yaml:**
```yaml
apiVersion: v1
kind: Service
metadata:
  name: {{ .Release.Name }}-simple-api
spec:
  selector:
    app: {{ .Release.Name }}-simple-api
  ports:
    - port: {{ .Values.port }}
      targetPort: {{ .Values.port }}
```

התקנה:
```bash
helm install my-release ./simple-api
```

## סוגי Charts: Application מול Library

### Library Chart

Chart שאין לו templates שיוצרים משאבים בעצמו — הוא רק אוסף פונקציות עזר (helpers) לשימוש חוזר על ידי charts אחרים:

```yaml
# Chart.yaml
apiVersion: v2
name: common-lib
type: library
version: 1.0.0
```

Charts אחרים יכולים להשתמש בו כתלות ולקרוא ל-templates המשותפים דרך `include`.

## `.helmignore`

בדומה ל-`.gitignore`, קובץ זה קובע אילו קבצים לא ייכללו כשאורזים את ה-Chart:

```
.DS_Store
.git/
.gitignore
*.swp
*.bak
*.tmp
.vscode/
```

## מקורות ולמידה נוספת

### דוקומנטציה רשמית
- 📘 [Charts - Official Documentation](https://helm.sh/docs/topics/charts/)
- 📘 [The Chart.yaml File](https://helm.sh/docs/topics/charts/#the-chartyaml-file)
- 📘 [Chart Template Guide](https://helm.sh/docs/chart_template_guide/getting_started/)
- 📘 [Library Charts](https://helm.sh/docs/topics/library_charts/)

### סרטוני יוטיוב מומלצים
- 🎥 [Helm Chart Structure Explained - חיפוש ביוטיוב](https://www.youtube.com/results?search_query=helm+chart+structure+explained+tutorial)
- 🎥 [Creating Your First Helm Chart - חיפוש ביוטיוב](https://www.youtube.com/results?search_query=creating+your+first+helm+chart)

## שאלות לחזרה עצמית

1. מה ההבדל בין `version` ל-`appVersion` בקובץ `Chart.yaml`?
2. מה תפקידה של תיקיית `templates/`?
3. מתי משתמשים ב-Library Chart ולא ב-Application Chart?
4. איזו פקודה משתמשים בה כדי לבדוק שגיאות תחביר ב-Chart לפני התקנה?

---
**המדריך הקודם:** [מדריך 2 - התקנה והגדרה](./02-hatkana-vehagdara.md)
**המשך למדריך הבא:** [מדריך 4 - Templates ו-Values](./04-templates-values.md)
