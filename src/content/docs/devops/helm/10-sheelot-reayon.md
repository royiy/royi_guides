# מדריך 10: שאלות ראיון עבודה על Helm — עם תשובות מלאות

מדריך זה מרכז שאלות שנשאלות בפועל בראיונות עבודה לתפקידי DevOps, SRE, Platform Engineer ו-Kubernetes Administrator, ברמות קושי שונות.

---

## חלק א': שאלות בסיסיות (Junior)

### 1. מה זה Helm ולמה משתמשים בו?

**תשובה:** Helm הוא מנהל החבילות (Package Manager) הרשמי של Kubernetes, המנוהל תחת CNCF. הוא פותר בעיות של שכפול YAML, ניהול גרסאות, שיתוף חבילות מוכנות (Charts) וניהול תלויות בין רכיבים.

### 2. מה ההבדל בין Chart, Release ו-Repository?

**תשובה:**
- **Chart** — חבילת templates + מטא-דאטה, "מתכון" להתקנה
- **Release** — מופע מותקן בפועל של Chart בקלאסטר, עם שם ייחודי
- **Repository** — מקום (HTTP server / OCI registry) שבו Charts מאוחסנים ומופצים

### 3. מה ההבדל בין Helm 2 ל-Helm 3?

**תשובה:** השינוי המרכזי הוא **הסרת Tiller** — רכיב שרת שרץ בתוך הקלאסטר ב-Helm 2 והיווה סיכון אבטחה (בעל הרשאות רחבות מדי, לרוב cluster-admin). ב-Helm 3, ה-CLI פועל ישירות מול Kubernetes API עם ההרשאות של המשתמש (RBAC רגיל). שינויים נוספים: מידע release נשמר כ-Secrets (במקום ConfigMaps), הוחלף `requirements.yaml` ב-dependencies בתוך `Chart.yaml`, נוספה תמיכה ב-Library Charts, ותמיכה מלאה ב-OCI registries.

### 4. מה זה `values.yaml`?

**תשובה:** קובץ YAML שמכיל את הפרמטרים הניתנים להתאמה אישית של Chart — ברירות מחדל שניתן לדרוס (override) בזמן install/upgrade דרך `--set` או `-f`.

### 5. איך מתקינים Chart?

```bash
helm install my-release ./my-chart
# או מ-repository:
helm install my-release bitnami/nginx
```

### 6. מהי הפקודה לבדוק שגיאות ב-Chart לפני התקנה?

**תשובה:** `helm lint ./my-chart` בודק תחביר ומוסכמות, ו-`helm template ./my-chart --debug` מרנדר את התוצאה הסופית לבדיקה ידנית.

---

## חלק ב': שאלות ברמת ביניים (Mid-Level)

### 7. הסבירו את סדר העדיפות בין מקורות ערכים שונים ב-Helm.

**תשובה:** מהעדיפות הנמוכה לגבוהה:
1. `values.yaml` המובנה ב-Chart
2. `values.yaml` של subcharts
3. קבצי `-f` (בסדר שהוזנו — האחרון גובר)
4. דגלי `--set` (עדיפות עליונה)

### 8. מה ההבדל בין `helm template` ל-`helm install --dry-run`?

**תשובה:** `helm template` מרנדר את ה-Chart **לחלוטין מקומית**, ללא צורך בקלאסטר זמין כלל. `helm install --dry-run` מתקשר בפועל עם ה-Kubernetes API Server (כדי לבדוק תקינות סכימה, webhooks וכו') אך לא יוצר בפועל את המשאבים.

### 9. מה קורה אם `pre-install` hook נכשל?

**תשובה:** Helm יעצור את תהליך ה-install/upgrade כולו וידווח על כישלון. המשאבים הרגילים (שאינם hooks) לא ייווצרו.

### 10. איך מעבירים ערכים ל-subchart?

**תשובה:** דרך מפתח עליון ב-`values.yaml` של ה-Chart ההורה, בשם ה-subchart (או ה-alias שלו):
```yaml
postgresql:
  auth:
    password: mypassword
```

### 11. מה ההבדל בין `include` ל-`template` בתוך templates של Helm?

**תשובה:** `include` מחזיר מחרוזת שאפשר "לצנרר" (pipe) לפונקציות נוספות כמו `nindent`, בעוד ש-`template` פשוט מדפיס את הפלט ישירות ולא ניתן לשלב אותו בצינור פקודות. לכן `include` הוא הבחירה המומלצת כמעט תמיד.

### 12. הסבירו מה זה `global` values.

**תשובה:** מפתח מיוחד ב-values שמאפשר להעביר ערך אחד שיהיה נגיש הן ל-Chart הראשי והן לכל ה-subcharts שלו, ללא צורך להגדיר אותו מחדש בכל אחד. עובר מלמעלה למטה (מה-Chart ההורה אל ה-subcharts).

### 13. מה זה `Chart.lock` ולמה הוא נוצר?

**תשובה:** קובץ שנוצר אוטומטית לאחר `helm dependency update`, המנעל את הגרסאות המדויקות של התלויות שהורדו — מבטיח build עקבי ורפרודוקטיבי, בדומה ל-`package-lock.json` ב-npm.

### 14. מה ההבדל בין `helm upgrade` רגיל ל-`helm upgrade --install`?

**תשובה:** `--install` יבצע install אם ה-release עדיין לא קיים, ו-upgrade אם כן קיים. שימושי מאוד ב-pipelines של CI/CD כדי לא להצטרך לבדוק תנאי מראש.

### 15. מה עושה `--atomic`?

**תשובה:** אם ה-install/upgrade נכשל, Helm יבצע אוטומטית rollback (או ניקוי מלא אם זו התקנה ראשונה), כדי להימנע מ-release שנשאר ב-state שבור באמצע.

---

## חלק ג': שאלות מתקדמות (Senior / Architecture)

### 16. מה ההבדל בין Helm Hook ל-init container, ומתי הייתם בוחרים בכל אחד?

**תשובה:** Hook הוא משאב עצמאי (בדרך כלל Job) שרץ **פעם אחת** בנקודת זמן מסוימת במחזור חיי ה-release (כמו pre-upgrade migration), ואינו קשור למחזור החיים של Pod ספציפי. init container הוא חלק אינטגרלי מה-Pod עצמו ורץ **בכל פעם שה-Pod עולה מחדש** — מתאים למשימות כמו המתנה לזמינות תלות (wait-for-db).

### 17. איך הייתם מעצבים אסטרטגיית ניהול Secrets ב-Helm Charts עבור ארגון גדול?

**תשובה:** נקודות מפתח לתשובה טובה:
- אין לשמור סודות בטקסט גלוי ב-`values.yaml` שנמצא ב-Git
- אפשרויות: `helm-secrets` + SOPS (הצפנה ב-Git), External Secrets Operator (משיכה מ-Vault/AWS Secrets Manager בזמן ריצה), Sealed Secrets (הצפנה אסימטרית שרק ה-controller בקלאסטר יכול לפענח)
- יש להפריד בין Chart (קוד) לבין Secrets (קונפיגורציה סודית) — Chart לא אמור להכיל ערכי סוד קבועים

### 18. הסבירו איך תבנו pipeline CI/CD מלא להפצת Helm Charts.

**תשובה:** תשובה טובה תכלול:
1. `helm lint` על כל commit/PR
2. `helm template` + כלי בדיקה (kubeval, kubesec, checkov) כדי לוודא תקינות מניפסטים
3. `chart-testing (ct)` להרצת בדיקות אינטגרציה על קלאסטר זמני (kind)
4. בניית גרסה (SemVer) לפי Git tag
5. `helm package` + `helm push` ל-OCI registry או `chart-releaser` ל-GitHub Pages
6. אינטגרציה עם GitOps (ArgoCD/FluxCD) שמסנכרן אוטומטית לקלאסטרים בהתאם לשינויים ב-Git

### 19. איך Helm מתמודד עם Custom Resource Definitions (CRDs)?

**תשובה:** ל-CRDs יש טיפול מיוחד — הם מוצבים בתיקיית `crds/` נפרדת (לא `templates/`), מותקנים **לפני** שאר ה-templates, **אינם** מתערבבים עם מנוע ה-templating הרגיל (לא ניתן להשתמש ב-`{{ }}` בתוכם), ו-Helm **לא מוחק ולא משדרג** אותם אוטומטית ב-`upgrade`/`uninstall` — יש לנהל אותם ידנית או עם כלים ייעודיים, כדי למנוע מחיקה בטעות של CRDs שעליהם תלויים משאבים קריטיים בקלאסטר.

### 20. מהם היתרונות של אחסון Charts ב-OCI Registry לעומת HTTP repository מסורתי?

**תשובה:** איחוד תשתית ניהול (אותו רישום ל-images ול-charts), שימוש ב-RBAC ואימות אחיד, סריקות אבטחה אוטומטיות שכבר קיימות ברוב ה-registries, ותמיכה טבעית ב-CI/CD tools מודרניים. זהו כיום ה-**standard המומלץ** על ידי קהילת Helm.

### 21. מה ההבדל בין `helm rollback` לבין פשוט להריץ `helm upgrade` עם ה-values הישנים?

**תשובה:** `helm rollback` משחזר **את כל המצב** של revision קודם — כולל templates, values, ומטא-דאטה — במדויק כפי שהיו, ויוצר revision חדש בהיסטוריה שמכיל את התוכן ההוא. הרצת `upgrade` ידנית עם values ישנים עלולה לפספס שינויים ב-Chart עצמו (למשל אם ה-Chart שונה בינתיים).

### 22. איך הייתם מטפלים בתרחיש שבו `helm upgrade` נתקע (stuck) במצב "pending-upgrade"?

**תשובה:** מצב זה קורה בדרך כלל כשתהליך קודם נכשל/הופסק (Ctrl+C, timeout) והשאיר release ב-state ביניים. פתרונות:
```bash
# בדיקת הסטטוס
helm status my-release

# אם תקוע - rollback לrevision היציב הקודם
helm rollback my-release <last-good-revision>

# אם אין revision תקין - שימוש בפלאגין helm-mapkubeapis או תיקון ידני ב-Secret
kubectl get secret -l "owner=helm,name=my-release"
```
מונעים זאת מראש עם `--atomic` ו-`--timeout` מוגדר נכון.

### 23. מהי ה-Strategy הנכונה להתמודד עם Immutable Fields בזמן upgrade?

**תשובה:** שדות מסוימים ב-Kubernetes (כמו `spec.selector` ב-Deployment, או `clusterIP` ב-Service) הם immutable ולא ניתנים לעדכון ב-PATCH רגיל. Helm ינסה patch רגיל ויכשל. הפתרון: שימוש ב-`--force` (עם זהירות — גורם למחיקה-ויצירה-מחדש, עלול ליצור downtime), או תכנון מראש כך שהשדות הבעייתיים לא ישתנו בין revisions (למשל, שימוש ב-selector קבוע ולא דינמי).

---

## חלק ד': שאלות תרחיש (Scenario-Based)

### 24. "פרסתם עדכון גרסה, וה-Pods נכנסו ל-CrashLoopBackOff. מה הצעדים שלכם?"

**תשובה מומלצת:**
```bash
# 1. בדיקת סטטוס וlogs
kubectl get pods
kubectl logs <pod-name> --previous
kubectl describe pod <pod-name>

# 2. rollback מיידי אם production מושפע
helm rollback my-release <previous-good-revision>

# 3. חקירה של השינוי הבעייתי
helm diff revision my-release <good-rev> <bad-rev>

# 4. תיקון ה-Chart/values ובדיקה בסביבת staging לפני ניסיון נוסף
```

### 25. "יש לכם 50 מיקרו-שירותים, כל אחד עם Helm chart דומה מאוד. איך תמנעו שכפול קוד?"

**תשובה מומלצת:** יצירת **Library Chart** משותף (`common-lib`) עם helpers לתבניות חוזרות (labels, selectors, deployment template גנרי), ולכל שירות Chart דק שרק מגדיר values ומצהיר על תלות ב-library chart. בנוסף, שימוש ב-templating tools כמו Helmfile לניהול הפצה מרוכזת של הרבה releases יחד.

---

## טבלת סיכום: מושגים שחובה לדעת לראיון

| מושג | הסבר קצר |
|---|---|
| Tiller | רכיב שרת שהוסר ב-Helm 3 (בעיית אבטחה) |
| Chart | חבילת templates |
| Release | מופע מותקן |
| Values | פרמטרים להתאמה |
| Hooks | פעולות בנקודות זמן במחזור חיים |
| Subchart | תלות פנימית / חיצונית |
| Global Values | ערכים משותפים בין Chart ל-subcharts |
| Library Chart | Chart ללא release עצמאי, רק helpers |
| OCI Registry | תקן חדש לאחסון Charts |
| Chart.lock | נעילת גרסאות תלויות |
| Atomic | rollback אוטומטי בכישלון |
| SemVer | ניהול גרסאות MAJOR.MINOR.PATCH |

## מקורות ולמידה נוספת

### דוקומנטציה רשמית
- 📘 [Helm Official Documentation](https://helm.sh/docs/)
- 📘 [Helm FAQ](https://helm.sh/docs/faq/changes_since_helm2/)
- 📘 [CNCF Helm Glossary](https://helm.sh/docs/glossary/)

### סרטוני יוטיוב מומלצים
- 🎥 [Helm Interview Questions and Answers - חיפוש ביוטיוב](https://www.youtube.com/results?search_query=helm+kubernetes+interview+questions+and+answers)
- 🎥 [Kubernetes and Helm DevOps Interview Prep - חיפוש ביוטיוב](https://www.youtube.com/results?search_query=kubernetes+helm+devops+interview+preparation)
- 🎥 [Top Helm Mistakes Interviewers Ask About - חיפוש ביוטיוב](https://www.youtube.com/results?search_query=helm+common+interview+mistakes+kubernetes)

## טיפ אחרון להצלחה בראיון

בראיונות ברמת Senior, לרוב לא בודקים רק "מה זה X" אלא **"למה בחרת בפתרון הזה ולא באחר"**. תרגלו להסביר **trade-offs**: מתי Hook ולא init container, מתי OCI registry ולא HTTP repo, מתי `--force` שווה את הסיכון, ומתי עדיף GitOps על פני helm CLI ידני.

---
**המדריך הקודם:** [מדריך 9 - טיפים וטריקים](./09-tips-tricks-best-practices.md)
**חזרה למדריך הראשון:** [מדריך 1 - מבוא ל-Helm](./01-mavo-le-helm.md)
