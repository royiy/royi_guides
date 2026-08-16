---
title: "Helm - מנהל החבילות של Kubernetes"
category: DevOps/Kubernetes
part: 6/10
---

## תוכן עניינים
1. [מה זה Helm ולמה צריך אותו](#מה-זה-helm)
2. [מושגי יסוד: Chart, Release, Repository](#מושגי-יסוד)
3. [התקנה ושימוש בסיסי](#התקנה-ושימוש]
4. [מבנה של Chart](#מבנה-chart)
5. [בניית Chart משלכם - דוגמה מלאה](#בניית-chart)
6. [Values ו-Templating](#values)
7. [ניהול גרסאות ו-Rollback](#ניהול-גרסאות)
8. [Helm Hooks](#hooks)
9. [פקודות helm שימושיות](#פקודות)
10. [טיפים וטריקים](#טיפים)
11. [שאלות ראיון עבודה](#שאלות)
12. [קישורים חיצוניים](#קישורים)

---

## מה זה Helm ולמה צריך אותו {#מה-זה-helm}

דמיינו שאתם רוצים להתקין אפליקציה מורכבת כמו **Prometheus** או **Elasticsearch** בקלאסטר - זה עלול לדרוש עשרות קבצי YAML: Deployments, Services, ConfigMaps, RBAC, PVCs ועוד, כולם עם ערכים תלויי-סביבה (namespace, גודל אחסון, מספר replicas...).

**Helm** הוא "מנהל החבילות" (package manager) של Kubernetes - כמו `apt` באובונטו או `npm` ב-Node.js, אבל לאפליקציות קוברנטיס. הוא פותר שלוש בעיות מרכזיות:

1. **תבניתיות (Templating)** - כתיבת YAML פעם אחת עם משתנים, במקום להעתיק-להדביק לכל סביבה.
2. **חבילה (Packaging)** - אריזת כל קבצי ה-YAML הקשורים כ"חבילה" אחת ניתנת להפצה.
3. **ניהול מחזור חיים** - התקנה, שדרוג, וחשוב מאוד - **rollback** קל בפקודה אחת.

---

## מושגי יסוד: Chart, Release, Repository {#מושגי-יסוד}

- **Chart** - חבילת Helm - אוסף קבצים שמתארים משאב קוברנטיס קשור (בערך כמו חבילת npm).
- **Release** - מופע (instance) מותקן של Chart בקלאסטר. אפשר להתקין את אותו Chart כמה פעמים עם שמות release שונים (למשל `nginx-dev`, `nginx-prod`).
- **Repository** - שרת שבו מתארחים Charts (דומה ל-npm registry או ל-Docker Hub).

---

## התקנה ושימוש בסיסי {#התקנה-ושימוש}

```bash
# התקנת Helm (macOS)
brew install helm

# הוספת repository פופולרי (Bitnami)
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update

# חיפוש Chart
helm search repo nginx

# התקנת Chart - יוצר Release חדש בשם "my-nginx"
helm install my-nginx bitnami/nginx

# הצגת כל ה-Releases המותקנים
helm list

# הצגת המשאבים שנוצרו
kubectl get all -l app.kubernetes.io/instance=my-nginx
```

---

## מבנה של Chart {#מבנה-chart}

```
mychart/
├── Chart.yaml          # מטא-דאטה: שם, גרסה, תיאור
├── values.yaml          # ערכי ברירת מחדל שאפשר לדרוס
├── charts/               # תלויות (sub-charts)
├── templates/            # קבצי YAML כתבניות Go template
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── configmap.yaml
│   ├── _helpers.tpl      # פונקציות עזר משותפות
│   └── NOTES.txt         # הודעה שמוצגת אחרי התקנה
└── .helmignore
```

---

## בניית Chart משלכם - דוגמה מלאה {#בניית-chart}

```bash
# יצירת Chart חדש מ-scaffold
helm create mychart
```

### Chart.yaml
```yaml
apiVersion: v2
name: mychart
description: A Helm chart for my web application
version: 0.1.0        # גרסת ה-Chart עצמו
appVersion: "1.0.0"    # גרסת האפליקציה שהוא עוטף
```

### values.yaml
```yaml
replicaCount: 2

image:
  repository: myapp/webapp
  tag: "1.0"
  pullPolicy: IfNotPresent

service:
  type: ClusterIP
  port: 80

resources:
  requests:
    cpu: 100m
    memory: 128Mi
  limits:
    cpu: 250m
    memory: 256Mi
```

### templates/deployment.yaml
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ .Release.Name }}-webapp
  labels:
    app: {{ .Release.Name }}
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
        - name: webapp
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
          imagePullPolicy: {{ .Values.image.pullPolicy }}
          ports:
            - containerPort: 8080
          resources:
            {{- toYaml .Values.resources | nindent 12 }}
```

### templates/service.yaml
```yaml
apiVersion: v1
kind: Service
metadata:
  name: {{ .Release.Name }}-webapp-svc
spec:
  type: {{ .Values.service.type }}
  selector:
    app: {{ .Release.Name }}
  ports:
    - port: {{ .Values.service.port }}
      targetPort: 8080
```

```bash
# בדיקת התבניות בלי להתקין בפועל (dry-run מקומי, מציג את ה-YAML הסופי)
helm template mychart/

# בדיקת תקינות
helm lint mychart/

# התקנה בפועל
helm install my-release ./mychart

# התקנה עם override של ערכים ספציפיים
helm install my-release ./mychart --set replicaCount=5 --set image.tag=2.0

# התקנה עם קובץ values נפרד לסביבת פרודקשן
helm install my-release ./mychart -f values-production.yaml
```

---

## Values ו-Templating {#values}

Helm משתמש במנוע התבניות של Go (Go templates), עם תוספות שימושיות מ-**Sprig**:

```yaml
# תנאים
{{- if .Values.ingress.enabled }}
apiVersion: networking.k8s.io/v1
kind: Ingress
...
{{- end }}

# לולאות
{{- range .Values.environments }}
- name: {{ . }}
{{- end }}

# ערך ברירת מחדל אם לא הוגדר
image: {{ .Values.image.tag | default "latest" }}

# הכללת קובץ תבנית משותף
{{ include "mychart.labels" . }}
```

---

## ניהול גרסאות ו-Rollback {#ניהול-גרסאות}

```bash
# שדרוג Release קיים (עם ערכים חדשים)
helm upgrade my-release ./mychart --set image.tag=2.1

# שדרוג, וגם התקנה אם עוד לא קיים
helm upgrade --install my-release ./mychart

# היסטוריית גרסאות
helm history my-release

# חזרה לגרסה קודמת - בפקודה אחת!
helm rollback my-release 1

# הסרת Release לגמרי
helm uninstall my-release
```

---

## Helm Hooks {#hooks}

Hooks מאפשרים להריץ פעולות בנקודות ספציפיות במחזור החיים - למשל migration למסד נתונים לפני שדרוג:

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: db-migration
  annotations:
    "helm.sh/hook": pre-upgrade,pre-install
    "helm.sh/hook-weight": "0"
    "helm.sh/hook-delete-policy": hook-succeeded
spec:
  template:
    spec:
      containers:
        - name: migrate
          image: myapp/migrate:1.0
          command: ["./migrate.sh"]
      restartPolicy: Never
```

---

## פקודות helm שימושיות {#פקודות}

```bash
# הצגת ה-values בפועל של Release מותקן
helm get values my-release

# הצגת כל ה-manifest שנוצר בפועל
helm get manifest my-release

# בדיקת מה ישתנה בלי להריץ בפועל
helm diff upgrade my-release ./mychart   # דורש plugin: helm-diff

# ארזת Chart להפצה
helm package mychart/

# חיפוש Charts ב-Artifact Hub
helm search hub wordpress
```

---

## טיפים וטריקים {#טיפים}

1. **`helm template` הוא חבר שלכם** - תמיד תריצו לפני `helm install` כדי לראות בדיוק איזה YAML ייווצר, ולתפוס טעויות templating מוקדם.
2. **`--dry-run --debug`** ב-`helm install`/`upgrade` מדמה את הפעולה מול השרת בלי ליצור בפועל.
3. **הפרידו values לפי סביבה** - `values.yaml` (ברירת מחדל), `values-dev.yaml`, `values-prod.yaml`, ותמיד ידעו בדיוק אילו ערכים שונים בין סביבות.
4. **helm-diff plugin** - כלי חובה לפני `upgrade` בפרודקשן, כדי לראות בדיוק מה ישתנה.
5. **גרסת Chart ≠ גרסת אפליקציה** - `version` ב-Chart.yaml היא גרסת ה-Chart עצמו (המבנה), ו-`appVersion` היא גרסת התוכנה שהוא עוטף - אל תתבלבלו ביניהם.
6. **Umbrella Charts** - לאפליקציות מורכבות עם כמה שירותים, אפשר ליצור Chart "הורה" שמכיל sub-charts כתלויות ב-`charts/`.

---

## שאלות ראיון עבודה {#שאלות}

**ש: מה זה Helm ומה הבעיה שהוא פותר?**
ת: Helm הוא מנהל חבילות ל-Kubernetes שמאפשר לארוז אוספי YAML קשורים כ-Chart אחד עם templating (משתנים), במקום לכתוב ולנהל ידנית עשרות קבצי YAML לכל סביבה. הוא גם מספק ניהול מחזור חיים מלא - install, upgrade, rollback.

**ש: מה ההבדל בין Chart ל-Release?**
ת: Chart הוא החבילה עצמה (התבנית) - כמו קוד מקור. Release הוא מופע מותקן ומוגדר בפועל של Chart בקלאסטר, עם שם ייחודי משלו - אפשר להתקין את אותו Chart כמה פעמים כ-Releases נפרדים.

**ש: איך מבצעים rollback ב-Helm?**
ת: `helm rollback <release-name> <revision-number>` - Helm שומר היסטוריית revisions אוטומטית לכל Release, כך שאפשר לחזור לכל גרסה קודמת בפקודה אחת.

**ש: מה ההבדל בין `helm install` ל-`helm upgrade --install`?**
ת: `helm install` נכשל אם ה-Release כבר קיים. `helm upgrade --install` הוא idempotent - יתקין אם לא קיים, ויעדכן אם כן קיים. זה מומלץ מאוד לשימוש בפייפליינים אוטומטיים של CI/CD.

**ש: מה זה Helm Hook ולמה משתמשים בו?**
ת: מנגנון שמאפשר להריץ משאבים (בדרך כלל Jobs) בנקודות מוגדרות במחזור החיים של Release, כמו pre-install או pre-upgrade - שימושי למשל להרצת migrations למסד נתונים לפני עדכון האפליקציה עצמה.

**ש: איך אפשר לדרוס ערכים ב-Chart בלי לערוך את values.yaml הראשי?**
ת: אפשר להעביר `--set key=value` בשורת הפקודה, או קובץ values נפרד עם `-f values-custom.yaml` - הערכים החדשים מתמזגים (merge) מעל ברירות המחדל.

---

## קישורים חיצוניים {#קישורים}

### תיעוד רשמי
- Helm - תיעוד רשמי: https://helm.sh/docs/
- Chart Template Guide: https://helm.sh/docs/chart_template_guide/getting_started/
- Artifact Hub (חיפוש Charts): https://artifacthub.io/

### סרטוני YouTube
- TechWorld with Nana - Helm Package Manager Explained: https://www.youtube.com/c/techworldwithnana
- פלייליסט קורס מלא: https://www.youtube.com/playlist?list=PLy7NrYWoggjziYQIDorlXjTvvwweTYoNC

---

**הקודם:** [מדריך 5 - אחסון](./05-storage-volumes.md) | **הבא:** [מדריך 7 - RBAC ואבטחה](./07-rbac-security.md)
