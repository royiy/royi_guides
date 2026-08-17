---
title: "ניהול Releases — Install, Upgrade, Rollback, Uninstall"
category: DevOps/Helm
part: 8/10
---

## מחזור החיים של Release

```
helm install  ──►  helm upgrade  ──►  helm upgrade  ──►  helm rollback  ──►  helm uninstall
   (rev 1)          (rev 2)            (rev 3)            (חזרה ל-rev 2)      (מחיקה)
```

כל פעולת `install` או `upgrade` יוצרת **revision** (מהדורה) חדשה, ו-Helm שומר היסטוריה מלאה של כל השינויים ב-release.

## התקנה (Install)

```bash
# התקנה בסיסית
helm install my-release ./my-chart

# עם namespace ייעודי (ויצירתו אם לא קיים)
helm install my-release ./my-chart --namespace production --create-namespace

# עם override של ערכים בודדים
helm install my-release ./my-chart --set replicaCount=5 --set image.tag=2.0.0

# עם קובץ values מותאם
helm install my-release ./my-chart -f values-production.yaml

# שילוב כמה קבצי values (הימני ביותר מנצח בקונפליקטים)
helm install my-release ./my-chart -f values.yaml -f values-prod.yaml --set image.tag=2.0.1

# מ-repository מרוחק
helm install my-nginx bitnami/nginx --version 15.4.0

# עם timeout מותאם (למקרה של pull איטי / readiness ארוך)
helm install my-release ./my-chart --timeout 10m

# atomic - אם ההתקנה נכשלת, מבצע rollback אוטומטי
helm install my-release ./my-chart --atomic
```

### סדר עדיפויות של Values (חשוב מאוד לזכור!)

מהעדיפות הנמוכה ביותר לגבוהה ביותר:

1. `values.yaml` בתוך ה-Chart (ברירת מחדל)
2. Values של subchart (parent > child במיזוג, אך child override על subchart שלו עצמו)
3. קבצי `-f values-X.yaml` לפי סדר (האחרון מנצח)
4. `--set` (עדיפות הכי גבוהה)

```bash
helm install my-release ./chart -f a.yaml -f b.yaml --set key=override
# b.yaml מנצח את a.yaml, ו-"--set" מנצח את שניהם
```

## שדרוג (Upgrade)

```bash
# שדרוג רגיל
helm upgrade my-release ./my-chart

# עם --install: יתקין אם לא קיים, ישדרג אם קיים (מצוין ל-CI/CD!)
helm upgrade --install my-release ./my-chart -f values.yaml

# תצוגה מקדימה של ה-diff (דורש helm-diff plugin)
helm diff upgrade my-release ./my-chart -f values.yaml

# שמירת ה-values הקודמים ומיזוגם עם חדשים
helm upgrade my-release ./my-chart --reuse-values --set image.tag=2.1.0

# atomic upgrade - rollback אוטומטי בכישלון
helm upgrade my-release ./my-chart --atomic --timeout 5m

# הגבלת מספר revisions שנשמרים בהיסטוריה (ברירת מחדל: 10 האחרונים)
helm upgrade my-release ./my-chart --history-max 20
```

### `--force` באפגרייד

```bash
helm upgrade my-release ./my-chart --force
```

מבצע מחיקה ויצירה מחדש (`delete` + `create`) של משאבים שלא ניתן לעדכן ב-`patch` רגיל (למשל שינוי ב-selector immutable). **שימוש זהיר** — עלול לגרום ל-downtime!

## היסטוריה ו-Rollback

```bash
# צפייה בהיסטוריה מלאה
helm history my-release
```

פלט לדוגמה:
```
REVISION  UPDATED                   STATUS      CHART             APP VERSION  DESCRIPTION
1         Mon Jan 12 10:00:00 2026  superseded  my-chart-1.0.0    1.0          Install complete
2         Mon Jan 12 11:30:00 2026  superseded  my-chart-1.1.0    1.1          Upgrade complete
3         Mon Jan 12 14:15:00 2026  deployed    my-chart-1.2.0    1.2          Upgrade complete
```

```bash
# rollback לגרסה קודמת (revision 2)
helm rollback my-release 2

# rollback עם timeout
helm rollback my-release 2 --timeout 5m

# rollback ל-revision הקודם ביותר (0 = הקודם)
helm rollback my-release 0
```

> **חשוב:** rollback עצמו יוצר **revision חדש** בהיסטוריה (למשל revision 4 שמכיל את התוכן של revision 2) — הוא **לא** "מוחק" את ה-revisions שביניהם.

## מחיקה (Uninstall)

```bash
# מחיקה רגילה
helm uninstall my-release

# שמירת ההיסטוריה (למקרה שרוצים להתקין שוב ולראות revisions קודמים)
helm uninstall my-release --keep-history

# עם namespace ספציפי
helm uninstall my-release --namespace production
```

## בדיקת סטטוס ומידע

```bash
# סטטוס נוכחי
helm status my-release

# כל ה-releases בכל ה-namespaces
helm list --all-namespaces

# releases שנכשלו
helm list --failed

# ערכי values בפועל של release מותקן
helm get values my-release

# כל הערכים כולל אלה שמוגדרים כברירת מחדל (לא רק overrides)
helm get values my-release --all

# המניפסט המלא שהותקן בפועל
helm get manifest my-release

# NOTES.txt שהוצג בהתקנה
helm get notes my-release

# הכל ביחד
helm get all my-release
```

## Namespaces ו-Multi-tenancy

```bash
# התקנה תמיד לתוך namespace מפורש
helm install my-release ./my-chart -n team-a --create-namespace

# רשימת releases ב-namespace ספציפי בלבד
helm list -n team-a

# רשימת releases בכל ה-namespaces (שימושי כ-admin)
helm list -A
```

## אסטרטגיית עדכון בטוחה (Best Practice ל-Production)

```bash
# 1. בדוק diff לפני
helm diff upgrade my-release ./my-chart -f values-prod.yaml

# 2. dry-run מלא
helm upgrade my-release ./my-chart -f values-prod.yaml --dry-run --debug

# 3. עדכון אמיתי עם atomic ו-wait
helm upgrade my-release ./my-chart \
  -f values-prod.yaml \
  --atomic \
  --wait \
  --timeout 10m \
  --history-max 15

# 4. וידוא סטטוס
helm status my-release
kubectl rollout status deployment/my-release
```

## `--wait` ו-`--wait-for-jobs`

```bash
helm install my-release ./my-chart --wait --wait-for-jobs --timeout 5m
```

- `--wait` — Helm ימתין שכל ה-Pods, PVCs ו-Services יהיו במצב "ready" לפני שהפקודה תסתיים בהצלחה
- `--wait-for-jobs` — כנ"ל, אך ממתין גם להשלמת Jobs (כולל hooks)

## מקורות ולמידה נוספת

### דוקומנטציה רשמית
- 📘 [Helm Install Command](https://helm.sh/docs/helm/helm_install/)
- 📘 [Helm Upgrade Command](https://helm.sh/docs/helm/helm_upgrade/)
- 📘 [Helm Rollback Command](https://helm.sh/docs/helm/helm_rollback/)
- 📘 [Values Files](https://helm.sh/docs/chart_template_guide/values_files/)

### סרטוני יוטיוב מומלצים
- 🎥 [Helm Upgrade and Rollback Explained - חיפוש ביוטיוב](https://www.youtube.com/results?search_query=helm+upgrade+rollback+explained+tutorial)
- 🎥 [Helm Release Management Best Practices - חיפוש ביוטיוב](https://www.youtube.com/results?search_query=helm+release+management+best+practices)

## שאלות לחזרה עצמית

1. מהו סדר העדיפויות בין `--set`, `-f values.yaml` וברירות המחדל?
2. מה עושה rollback בפועל להיסטוריית ה-revisions?
3. מתי נדרש להשתמש ב-`--force` באפגרייד, ומה הסיכון בכך?
4. מה ההבדל בין `--wait` ל-`--wait-for-jobs`?

---
**המדריך הקודם:** [מדריך 7 - Dependencies ו-Subcharts](/devops/helm/07-dependencies-subcharts/)
**המשך למדריך הבא:** [מדריך 9 - טיפים, טריקים ו-Best Practices](/devops/helm/09-tips-tricks-best-practices/)
