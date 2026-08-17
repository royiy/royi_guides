---
title: "Helm Hooks — הרצת פעולות בנקודות זמן מוגדרות"
category: DevOps/Helm
part: 6/10
---

## מהם Hooks?

Hooks מאפשרים להתערב בשלבים שונים של מחזור חיי ה-release (install, upgrade, rollback, delete) ולהריץ משאבי Kubernetes (בדרך כלל `Job` או `Pod`) בנקודת זמן ספציפית — למשל **לפני** התקנה, **אחרי** שדרוג, וכו'.

זה שימושי מאוד עבור:
- הרצת **migrations** של בסיס נתונים לפני עדכון גרסת האפליקציה
- **גיבוי (backup)** לפני מחיקת release
- בדיקות **smoke tests** אחרי התקנה
- ניקוי (cleanup) לפני מחיקה

## סוגי Hooks זמינים

| Hook | מתי מופעל |
|---|---|
| `pre-install` | לפני יצירת templates, אחרי רינדור |
| `post-install` | אחרי שכל המשאבים הותקנו |
| `pre-delete` | לפני מחיקת משאבים בקשה ל-`helm uninstall` |
| `post-delete` | אחרי שכל המשאבים נמחקו |
| `pre-upgrade` | לפני שדרוג |
| `post-upgrade` | אחרי שדרוג |
| `pre-rollback` | לפני rollback |
| `post-rollback` | אחרי rollback |
| `test` | כשמריצים `helm test` |

## דוגמה: Job למיגרציית בסיס נתונים לפני עדכון (`pre-upgrade`)

```yaml
# templates/db-migration-job.yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: {{ .Release.Name }}-db-migration
  annotations:
    "helm.sh/hook": pre-upgrade,pre-install
    "helm.sh/hook-weight": "-5"
    "helm.sh/hook-delete-policy": before-hook-creation,hook-succeeded
spec:
  backoffLimit: 3
  template:
    spec:
      restartPolicy: Never
      containers:
        - name: migration
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
          command: ["python", "manage.py", "migrate"]
          envFrom:
            - secretRef:
                name: {{ .Release.Name }}-db-secret
```

### הסבר על ה-Annotations:

- **`helm.sh/hook`** — קובע לאיזה שלב(ים) ה-Job שייך. אפשר לרשום כמה בפסיקים: `pre-upgrade,pre-install`
- **`helm.sh/hook-weight`** — קובע **סדר הרצה** בין hooks מרובים באותו שלב. ערכים נמוכים יותר רצים ראשונים (יכול להיות שלילי!)
- **`helm.sh/hook-delete-policy`** — מתי למחוק את משאב ה-hook:
  - `before-hook-creation` — מוחק הרצה קודמת לפני יצירת חדשה (ברירת מחדל)
  - `hook-succeeded` — מוחק אחרי הצלחה
  - `hook-failed` — מוחק אחרי כישלון

## דוגמה: Post-Install Smoke Test

```yaml
# templates/tests/smoke-test.yaml
apiVersion: v1
kind: Pod
metadata:
  name: {{ .Release.Name }}-smoke-test
  annotations:
    "helm.sh/hook": test
spec:
  containers:
    - name: smoke-test
      image: curlimages/curl:latest
      command:
        - curl
        - --fail
        - "http://{{ .Release.Name }}-service:{{ .Values.service.port }}/health"
  restartPolicy: Never
```

הרצה:

```bash
helm test my-release
```

פלט לדוגמה:
```
NAME: my-release
LAST DEPLOYED: ...
STATUS: deployed
TEST SUITE:     my-release-smoke-test
Last Started:   ...
Last Completed: ...
Phase:          Succeeded
```

## דוגמה: Pre-Delete Backup

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: {{ .Release.Name }}-backup
  annotations:
    "helm.sh/hook": pre-delete
    "helm.sh/hook-weight": "0"
    "helm.sh/hook-delete-policy": hook-succeeded
spec:
  template:
    spec:
      restartPolicy: Never
      containers:
        - name: backup
          image: postgres:15
          command:
            - sh
            - -c
            - "pg_dump -h $DB_HOST -U $DB_USER $DB_NAME > /backup/dump-$(date +%s).sql"
```

## חשוב להבין: Hooks אינם חלק מה-release הרגיל

זו נקודה קריטית שנשאלת לעיתים בראיונות:

> משאבי Hook **אינם מנוהלים** על ידי Helm כחלק מה-release ה"רגיל". הם לא נכללים ב-`helm get manifest`, לא נמחקים אוטומטית ב-`helm uninstall` (אלא אם מוגדר hook-delete-policy מתאים), ואם ה-Job נכשל — Helm **יעצור** את התהליך (install/upgrade) וידווח על כישלון.

## Weight וסדר הרצה - דוגמה מורכבת

```yaml
# Hook A - ירוץ ראשון (weight נמוך יותר)
metadata:
  annotations:
    "helm.sh/hook": pre-install
    "helm.sh/hook-weight": "-10"
---
# Hook B - ירוץ שני
metadata:
  annotations:
    "helm.sh/hook": pre-install
    "helm.sh/hook-weight": "0"
---
# Hook C - ירוץ אחרון
metadata:
  annotations:
    "helm.sh/hook": pre-install
    "helm.sh/hook-weight": "10"
```

## Debugging Hooks

```bash
# צפייה ב-Jobs/Pods שנוצרו כ-hooks (לא נמחקים אוטומטית תמיד)
kubectl get jobs -l "app.kubernetes.io/managed-by=Helm"

# לוגים של hook Job שנכשל
kubectl logs job/my-release-db-migration

# אם hook תקוע - אפשר למחוק ידנית ולנסות שוב
kubectl delete job my-release-db-migration
helm upgrade my-release ./my-chart
```

## מקרה שימוש נפוץ: Helm Hooks מול init Containers

שאלה שעולה הרבה: **מתי להשתמש ב-Hook ומתי ב-init container?**

| | Helm Hook (Job) | Init Container |
|---|---|---|
| שייך ל-release | לא (עצמאי) | כן (חלק מה-Pod) |
| רץ פעם אחת ל-release | כן | רץ בכל הפעלה מחדש של Pod |
| מתאים ל | migrations, backups, בדיקות חד-פעמיות | הכנת סביבה לפני התחלת container ראשי (כמו wait-for-db) |

## מקורות ולמידה נוספת

### דוקומנטציה רשמית
- 📘 [Helm Hooks - Official Documentation](https://helm.sh/docs/topics/charts_hooks/)
- 📘 [Chart Tests](https://helm.sh/docs/topics/chart_tests/)

### סרטוני יוטיוב מומלצים
- 🎥 [Helm Hooks Explained - חיפוש ביוטיוב](https://www.youtube.com/results?search_query=helm+hooks+explained+tutorial)
- 🎥 [Database Migrations with Helm Hooks - חיפוש ביוטיוב](https://www.youtube.com/results?search_query=database+migration+helm+hooks+kubernetes)

## שאלות לחזרה עצמית

1. מה קורה אם Job שמוגדר כ-`pre-install` hook נכשל?
2. איך קובעים סדר הרצה בין כמה hooks באותו שלב?
3. האם משאבי hook נמחקים אוטומטית ב-`helm uninstall`?
4. מתי כדאי להשתמש ב-Helm Hook לעומת init container?

---
**המדריך הקודם:** [מדריך 5 - Repositories](/devops/helm/05-repositories/)
**המשך למדריך הבא:** [מדריך 7 - Dependencies ו-Subcharts](/devops/helm/07-dependencies-subcharts/)
