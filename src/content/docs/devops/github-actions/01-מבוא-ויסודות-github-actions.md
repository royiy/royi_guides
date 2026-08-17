---
title: "מבוא ויסודות ל-GitHub Actions"
category: DevOps/GitHub Actions
part: 1/10
---

## מה זה GitHub Actions

**GitHub Actions** היא פלטפורמת אוטומציה ו-CI/CD (Continuous Integration / Continuous Deployment) שמובנית ישירות בתוך GitHub. המשמעות היא שאין צורך בכלי חיצוני (כמו Jenkins, CircleCI או Travis CI) כדי להריץ בדיקות, לבנות את הקוד, ולפרוס אותו לסביבות שונות - הכול קורה בתוך אותו הריפוזיטורי שבו הקוד נמצא.

הרעיון המרכזי הוא **אוטומציה מבוססת אירועים (event-driven automation)**: כל פעולה שקורית ב-GitHub - push, פתיחת Pull Request, יצירת issue, לחיצה על כפתור, ואפילו שעון (cron) - יכולה "להפעיל" (trigger) תהליך אוטומטי שמוגדר מראש בקובץ YAML.

דוגמאות שימוש נפוצות:

- הרצת בדיקות אוטומטיות (unit tests, integration tests) בכל push או Pull Request
- בנייה (build) של אפליקציה ובדיקה שהיא מתקמפלת
- פריסה (deployment) אוטומטית לשרתים, ל-AWS, Azure, GCP, Vercel, Netlify ועוד
- בדיקות איכות קוד (linting, formatting, security scanning)
- ניהול אוטומטי של issues ו-Pull Requests (למשל, הוספת תוויות אוטומטית)
- שליחת התראות ל-Slack, Discord או מייל
- יצירת release אוטומטי ופרסום חבילות ל-npm, PyPI, Docker Hub

## המושגים המרכזיים

כדי להבין GitHub Actions לעומק צריך להכיר חמישה מושגי יסוד:

| מושג | הסבר |
|---|---|
| **Workflow** | תהליך אוטומטי שמוגדר בקובץ YAML בתיקיית `.github/workflows/`. זהו "המעטפת" הכוללת שמכילה את כל התהליך. |
| **Event** | אירוע שמפעיל workflow - למשל `push`, `pull_request`, `schedule`, `workflow_dispatch`. |
| **Job** | קבוצת שלבים (steps) שרצה על אותו runner. Workflow אחד יכול להכיל כמה jobs, שרצים במקביל (ברירת מחדל) או בזה אחר זה (עם `needs`). |
| **Step** | פעולה בודדת בתוך job - יכולה להיות פקודת shell (`run`) או שימוש ב-Action מוכן (`uses`). |
| **Action** | יחידת קוד ניתנת לשימוש חוזר שמבצעת משימה ספציפית - למשל `actions/checkout` שמושך את הקוד מהריפו. |
| **Runner** | המכונה (וירטואלית או פיזית) שבפועל מריצה את ה-jobs. |

תרשים זרימה פשוט:

```
Event (push) --> Workflow (ci.yml) --> Job (build) --> Steps (checkout, install, test)
                                    --> Job (deploy) --> Steps (build, upload, deploy)
```

## מבנה תיקיות ותחביר בסיסי

כל קובצי ה-workflow חייבים להיות בתיקייה:

```
.github/workflows/
```

בשורש הריפוזיטורי. כל קובץ הוא YAML (`.yml` או `.yaml`) ומייצג workflow נפרד. אפשר להחזיק כמה קבצי workflow באותו ריפו - למשל אחד ל-CI, אחד ל-deployment, ואחד לניהול issues.

מבנה תיקיות לדוגמה:

```
my-project/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       ├── deploy.yml
│       └── stale-issues.yml
├── src/
├── tests/
└── README.md
```

## ה-Workflow הראשון שלכם

הנה דוגמת Workflow פשוטה שרצה בכל push לענף `main`, ומדפיסה "Hello World":

```yaml
# .github/workflows/hello-world.yml
name: Hello World Workflow

on:
  push:
    branches: [main]

jobs:
  greet:
    runs-on: ubuntu-latest
    steps:
      - name: הדפסת הודעת שלום
        run: echo "שלום עולם מתוך GitHub Actions!"

      - name: הצגת פרטי הריצה
        run: |
          echo "הריפו: ${{ github.repository }}"
          echo "הענף: ${{ github.ref }}"
          echo "מי הפעיל: ${{ github.actor }}"
```

הסבר שורה-שורה:

- `name` - שם ה-workflow שמופיע בטאב Actions ב-GitHub.
- `on` - מגדיר את האירוע (או האירועים) שמפעילים את ה-workflow. כאן זה `push` לענף `main` בלבד.
- `jobs` - מפה של jobs. כאן יש job בודד בשם `greet`.
- `runs-on` - איזה runner להשתמש. `ubuntu-latest` היא האופציה הנפוצה ביותר.
- `steps` - רשימת הפעולות שיתבצעו בסדר. כל step יכול להיות `run` (פקודת shell) או `uses` (Action מוכן).

דוגמה מעט יותר ריאליסטית - Workflow שבודק פרויקט Node.js:

```yaml
# .github/workflows/node-ci.yml
name: Node.js CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  build-and-test:
    runs-on: ubuntu-latest

    steps:
      - name: משיכת הקוד מהריפו
        uses: actions/checkout@v4

      - name: הגדרת Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: התקנת תלויות
        run: npm ci

      - name: הרצת linting
        run: npm run lint

      - name: הרצת בדיקות
        run: npm test

      - name: בניית הפרויקט
        run: npm run build
```

שימו לב לשימוש ב-`actions/checkout@v4` - כמעט כל workflow מתחיל בשלב הזה, כי ה-runner מתחיל עם מכונה ריקה לגמרי, וצריך "למשוך" את הקוד מהריפו אליו במפורש.

## GitHub-hosted מול Self-hosted runners

GitHub Actions תומך בשני סוגי runners:

**GitHub-hosted runners** - מכונות וירטואליות שמנוהלות לחלוטין על ידי GitHub. אין צורך בתחזוקה, הן נמחקות אחרי כל ריצה (ephemeral), וזמינות במגוון מערכות הפעלה:

```yaml
jobs:
  test-matrix:
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/checkout@v4
      - run: echo "רץ על ${{ matrix.os }}"
```

**Self-hosted runners** - מכונה שאתם מנהלים בעצמכם (בענן, on-prem, או אפילו מחשב אישי) ומחברים ל-GitHub. שימושי כאשר צריך חומרה מיוחדת (GPU), רשת פרטית, או שליטה מלאה על הסביבה:

```yaml
jobs:
  deploy-internal:
    runs-on: self-hosted
    steps:
      - uses: actions/checkout@v4
      - run: ./deploy-internal.sh
```

## למה GitHub Actions ולא כלי אחר

יתרונות מרכזיים לעומת Jenkins, CircleCI, Travis CI ודומיהם:

1. **אינטגרציה מובנית** - אין צורך לחבר שירות חיצוני, לנהל webhooks בעצמכם או להתקין שרת נפרד.
2. **Marketplace עצום** - אלפי Actions מוכנים לשימוש חוזר (ניתן לראות בפירוט במדריך 5).
3. **YAML פשוט וקריא** - קונפיגורציה כקוד (configuration as code) שנשמרת יחד עם הפרויקט.
4. **חינמי לפרויקטים ציבוריים** - ריצות ללא הגבלה (בכפוף למדיניות שימוש הוגן) בריפוזיטוריז ציבוריים.
5. **מטריצות מובנות** - הרצת אותה משימה על כמה גרסאות/מערכות הפעלה במקביל בלי לשכפל קוד.

## טיפים וטריקים

1. **תמיד נעלו גרסה של Actions** - השתמשו ב-`actions/checkout@v4` ולא סתם `actions/checkout@main`, כדי למנוע שינויים בלתי צפויים.

2. **בדקו workflow syntax לפני push** - השתמשו בכלי כמו [actionlint](https://github.com/rhysd/actionlint) כדי לתפוס שגיאות תחביר לפני שדוחפים לריפו.

3. **שימוש ב-`workflow_dispatch` לבדיקות ידניות**:
   ```yaml
   on:
     workflow_dispatch:
       inputs:
         environment:
           description: 'סביבת יעד'
           required: true
           default: 'staging'
   ```
   זה מאפשר להריץ workflow ידנית מהממשק של GitHub, עם פרמטרים מותאמים אישית.

4. **שם ברור לכל step** - שדה `name` בכל step הופך את הלוגים לקריאים הרבה יותר כאשר בודקים כישלון.

5. **שימוש ב-`continue-on-error`** לצעדים לא קריטיים:
   ```yaml
   - name: הרצת בדיקה ניסיונית
     run: npm run experimental-test
     continue-on-error: true
   ```

6. **הגבלת הרשאות ברירת מחדל** - הוסיפו `permissions` בראש הקובץ כדי להגביל את מה ש-`GITHUB_TOKEN` יכול לעשות (עוד על כך במדריך האבטחה).

## שאלות ראיון עבודה

**1. מה זה GitHub Actions ולמה משתמשים בו?**
פלטפורמת CI/CD ואוטומציה מובנית ב-GitHub, שמאפשרת להריץ תהליכים אוטומטיים (בנייה, בדיקות, פריסה) בתגובה לאירועים בריפוזיטורי, ללא צורך בכלי חיצוני.

**2. מהם חמשת המושגים המרכזיים ב-GitHub Actions?**
Workflow, Event, Job, Step, Action - ו-Runner בתור המכונה שמריצה את הכול.

**3. איפה שומרים קובצי workflow בריפו?**
בתיקייה `.github/workflows/`, כקבצי YAML.

**4. מה ההבדל בין `run` ל-`uses` בתוך step?**
`run` מריץ פקודת shell ישירה, בעוד `uses` מפעיל Action מוכן (שיכול להיות מ-Marketplace, מריפו אחר, או local).

**5. מה זה GitHub-hosted runner ומתי כדאי להשתמש ב-self-hosted?**
GitHub-hosted הוא runner מנוהל על ידי GitHub, נקי ואפמרי בכל ריצה. Self-hosted משמש כשצריך חומרה מיוחדת, גישה לרשת פנימית, או שליטה מלאה בסביבה.

**6. האם jobs באותו workflow רצים במקביל או בזה אחר זה?**
כברירת מחדל, כל ה-jobs רצים במקביל, אלא אם משתמשים במילת המפתח `needs` כדי ליצור תלות ביניהם.

**7. מה חשיבות שלב `actions/checkout` בתחילת כמעט כל workflow?**
ה-runner מתחיל עם סביבה ריקה, ולכן צריך במפורש "למשוך" את קוד הריפו לתוכה כדי לעבוד איתו.

**8. מה ההבדל בין `push` ל-`pull_request` כטריגר?**
`push` מופעל כשיש דחיפת קוד לענף מסוים; `pull_request` מופעל בפעולות על Pull Request (פתיחה, עדכון וכו') ורץ בהקשר ממוזג (merge context) עם הרשאות מוגבלות יותר, במיוחד מ-forks.

**9. איך מריצים workflow באופן ידני?**
באמצעות טריגר `workflow_dispatch`, שמאפשר גם להגדיר פרמטרי קלט (`inputs`) שמוזנים דרך ממשק GitHub או ה-API.

**10. מה זה matrix strategy ולמה הוא שימושי? (הרחבה במדריך 6)**
מאפשר להריץ אותו job עם קומבינציות שונות של משתנים (למשל מערכות הפעלה וגרסאות שפה) ללא שכפול קוד.

## קישורים חיצוניים

### תיעוד רשמי (GitHub Docs)
- [Understanding GitHub Actions - מדריך יסודות רשמי](https://docs.github.com/articles/getting-started-with-github-actions)
- [Quickstart for GitHub Actions](https://docs.github.com/en/actions/writing-workflows/quickstart)
- [דף הבית של תיעוד GitHub Actions](https://docs.github.com/en/actions)

### סרטוני יוטיוב מומלצים
- [GitHub Actions Tutorial | From Zero to Hero in 90 minutes](https://www.youtube.com/watch?v=TLB5MY9BBa4) - כולל Environments, Secrets, Runners ועוד
- [How to use GitHub Actions | GitHub for Beginners](https://www.youtube.com/watch?v=BQrohJ3PT7I) - מהערוץ הרשמי של GitHub
- [GitHub Actions Tutorial for Beginners 2026 - Episode 1](https://www.youtube.com/watch?v=q9AY_kZmbVs) - Workflow ראשון תוך 13 דקות
- [Complete GitHub Actions Course - From BEGINNER to PRO](https://www.youtube.com/watch?v=Xwpi0ITkL3U) - קורס מקיף

---

**במדריך הבא (מדריך 2):** נצלול לעומק לתחביר Workflow המלא ולכל סוגי הטריגרים (Events) הזמינים - מ-`push` ו-`pull_request` ועד `schedule` ו-`workflow_call`.
