---
title: "Dependencies ו-Subcharts ב-Helm"
category: DevOps/Helm
part: 7/10
---

## מהי תלות (Dependency) ב-Helm?

לעיתים קרובות אפליקציה שלכם דורשת גם רכיבי תשתית נלווים — בסיס נתונים, cache, message queue וכו'. במקום לכתוב את ה-templates של PostgreSQL בעצמכם, אפשר להצהיר על תלות ב-Chart מוכן (למשל של Bitnami) ו-Helm יתקין את שניהם יחד כ-release אחד.

## הגדרת תלויות ב-`Chart.yaml`

```yaml
apiVersion: v2
name: my-app
version: 1.0.0

dependencies:
  - name: postgresql
    version: "13.2.24"
    repository: "https://charts.bitnami.com/bitnami"
    condition: postgresql.enabled
    tags:
      - database

  - name: redis
    version: "18.6.1"
    repository: "https://charts.bitnami.com/bitnami"
    condition: redis.enabled
    alias: cache
```

### שדות חשובים:

- **`condition`** — נתיב ב-`values.yaml` שקובע האם התלות תיפרס (Boolean)
- **`tags`** — קבוצת תגיות לשליטה על כמה תלויות יחד
- **`alias`** — שם חלופי לתלות (שימושי כשרוצים להתקין את אותו chart פעמיים, למשל שני מופעי Redis)

## הורדת התלויות בפועל

```bash
# מוריד את התלויות המוגדרות ל-charts/ כקבצי .tgz
helm dependency update ./my-app

# רק בונה Chart.lock בלי להוריד (בדיקת עקביות)
helm dependency build ./my-app

# רשימת תלויות ומצבן
helm dependency list ./my-app
```

לאחר `helm dependency update`, נוצר קובץ `Chart.lock` (מקביל ל-`package-lock.json`) שמנעל את הגרסאות המדויקות שהורדו, ותיקיית `charts/` מתמלאת בקבצי `.tgz`:

```
my-app/
├── Chart.yaml
├── Chart.lock          # נוצר אוטומטית!
├── values.yaml
├── charts/              # נוצר אוטומטית!
│   ├── postgresql-13.2.24.tgz
│   └── redis-18.6.1.tgz
└── templates/
```

> **טיפ חשוב:** מומלץ **לא** לשים `charts/*.tgz` ב-`.gitignore`, אלא להריץ `helm dependency update` שוב בכל CI/CD build — כך תמיד מקבלים build עקבי מבוסס `Chart.lock`.

## שליטה בערכי התלות דרך `values.yaml` ההורה

כדי להעביר ערכים ל-subchart, משתמשים בשם ה-chart (או ה-`alias`) כמפתח עליון:

```yaml
# values.yaml של ה-Chart הראשי (my-app)
postgresql:
  enabled: true
  auth:
    username: myuser
    password: mypassword
    database: mydb
  primary:
    persistence:
      size: 10Gi

cache:  # זה ה-alias שהגדרנו לעיל עבור redis
  enabled: true
  architecture: standalone
```

כל שדה תחת `postgresql:` יעבור אוטומטית ל-subchart של PostgreSQL, בדיוק כאילו הגדרתם אותו ב-`values.yaml` שלו עצמו.

## ערכים משותפים (Global Values)

לפעמים רוצים שערך מסוים יהיה זמין גם ל-Chart הראשי וגם לכל ה-subcharts — לשם כך יש את `global`:

```yaml
# values.yaml
global:
  imageRegistry: my-private-registry.com
  storageClass: fast-ssd

postgresql:
  enabled: true
  # postgresql יראה גם את .Values.global.storageClass אוטומטית
```

בתוך template של subchart (או Chart ראשי) ניתן לגשת עם:

```yaml
image: {{ .Values.global.imageRegistry }}/my-image:latest
```

**חוקי Global Values חשובים:**
- `global` מוגדר פעם אחת ומועבר **מלמעלה למטה** לכל ה-subcharts (לא ההפך)
- אם subchart מגדיר גם הוא `global` משלו, הוא ימוזג (merge) עם ה-global מההורה

## Subcharts כתיקיות מקומיות (במקום repository מרוחק)

אפשר גם לשים subchart ידנית בתיקיית `charts/` בלי להשתמש ב-repository מרוחק:

```
my-app/
├── Chart.yaml
├── values.yaml
├── charts/
│   └── my-internal-lib/    # subchart מקומי, לא ארוז!
│       ├── Chart.yaml
│       ├── values.yaml
│       └── templates/
└── templates/
```

זה שימושי לתלויות פנים-ארגוניות שלא רוצים לפרסם ל-repository ציבורי.

## Library Charts כתלות

Library Chart (ראינו במדריך 3) הוא סוג מיוחד של תלות שמספק רק helpers, ללא release עצמאי:

```yaml
# Chart.yaml של my-app
dependencies:
  - name: common
    version: "2.x.x"
    repository: "https://charts.bitnami.com/bitnami"
```

שימוש בפונקציה מה-library chart:

```yaml
metadata:
  labels:
    {{- include "common.labels.standard" . | nindent 4 }}
```

## Condition ו-Tags בפועל: בקרה על תלויות מרובות

```yaml
# Chart.yaml
dependencies:
  - name: postgresql
    condition: postgresql.enabled
    tags: [database]
  - name: mysql
    condition: mysql.enabled
    tags: [database]
```

```bash
# הפעלת subchart ספציפי דרך --set
helm install my-app ./my-app --set postgresql.enabled=true --set mysql.enabled=false

# הפעלה/כיבוי לפי tag כולל
helm install my-app ./my-app --set tags.database=false
```

## דוגמה מלאה: אפליקציה + PostgreSQL + Redis

```yaml
# Chart.yaml
apiVersion: v2
name: fullstack-app
version: 1.0.0
dependencies:
  - name: postgresql
    version: "13.2.24"
    repository: "https://charts.bitnami.com/bitnami"
    condition: postgresql.enabled
  - name: redis
    version: "18.6.1"
    repository: "https://charts.bitnami.com/bitnami"
    condition: redis.enabled
```

```yaml
# values.yaml
postgresql:
  enabled: true
  auth:
    postgresPassword: "changeme"
    database: "appdb"

redis:
  enabled: true
  auth:
    enabled: false

# ערכים לאפליקציה שלנו עצמה
image:
  repository: mycompany/fullstack-app
  tag: "1.2.3"
replicaCount: 3
```

בתוך `templates/deployment.yaml` של ה-Chart הראשי, אפשר להתייחס לשם ה-service שנוצר על ידי ה-subchart (בהתאם למוסכמת השמות של Bitnami — לרוב `{{ .Release.Name }}-postgresql`):

```yaml
env:
  - name: DATABASE_HOST
    value: "{{ .Release.Name }}-postgresql"
  - name: REDIS_HOST
    value: "{{ .Release.Name }}-redis-master"
```

התקנה:
```bash
helm dependency update ./fullstack-app
helm install my-release ./fullstack-app
```

## מקורות ולמידה נוספת

### דוקומנטציה רשמית
- 📘 [Chart Dependencies - Official Docs](https://helm.sh/docs/helm/helm_dependency/)
- 📘 [Subcharts and Global Values](https://helm.sh/docs/chart_template_guide/subcharts_and_globals/)
- 📘 [Bitnami Common Library Chart](https://github.com/bitnami/charts/tree/main/bitnami/common)

### סרטוני יוטיוב מומלצים
- 🎥 [Helm Subcharts and Dependencies - חיפוש ביוטיוב](https://www.youtube.com/results?search_query=helm+subcharts+dependencies+tutorial)
- 🎥 [Helm Global Values Explained - חיפוש ביוטיוב](https://www.youtube.com/results?search_query=helm+global+values+explained)

## שאלות לחזרה עצמית

1. מה ההבדל בין `helm dependency update` ל-`helm dependency build`?
2. איך מעבירים ערכים ל-subchart מסוים דרך ה-`values.yaml` של ה-Chart הראשי?
3. מה תפקיד ה-`global` ב-values, ואיך הכיוון של ההעברה (למי מועבר למי)?
4. למה חשוב קובץ `Chart.lock`?

---
**המדריך הקודם:** [מדריך 6 - Hooks](./06-hooks.md)
**המשך למדריך הבא:** [מדריך 8 - ניהול Releases](./08-release-management.md)
