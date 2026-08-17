# מדריך 2: תחביר Workflow מלא וכל סוגי הטריגרים (Events)

> מדריך 2 מתוך 10 בסדרת המדריכים המקיפה ל-GitHub Actions בעברית.

## תוכן עניינים

1. [מבנה מלא של קובץ Workflow](#מבנה-מלא-של-קובץ-workflow)
2. [כל סוגי הטריגרים (on)](#כל-סוגי-הטריגרים-on)
3. [סינון לפי ענפים, תגיות ונתיבים](#סינון-לפי-ענפים-תגיות-ונתיבים)
4. [Expressions וקונטקסטים (${{ }})](#expressions-וקונטקסטים)
5. [תנאים (if) בשלבים ובג'ובים](#תנאים-if-בשלבים-ובגובים)
6. [Concurrency - שליטה בריצות מקבילות](#concurrency---שליטה-בריצות-מקבילות)
7. [טיפים וטריקים](#טיפים-וטריקים)
8. [שאלות ראיון עבודה](#שאלות-ראיון-עבודה)
9. [קישורים חיצוניים](#קישורים-חיצוניים)

---

## מבנה מלא של קובץ Workflow

הנה כל השדות האפשריים ברמת ה-workflow (לא כולם חובה):

```yaml
name: CI Pipeline מלא                 # שם ה-workflow

run-name: הרצת CI עבור ${{ github.actor }}   # שם דינמי לכל ריצה ספציפית

on: [push, pull_request]              # אירועים שמפעילים את ה-workflow

permissions:                          # הרשאות ברירת מחדל ל-GITHUB_TOKEN
  contents: read
  pull-requests: write

env:                                  # משתני סביבה גלובליים לכל ה-workflow
  NODE_ENV: production

defaults:                             # ערכי ברירת מחדל לכל השלבים
  run:
    shell: bash
    working-directory: ./app

concurrency:                          # שליטה בריצות מקבילות
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  build:
    name: בנייה ובדיקות
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@v4
      - run: echo "בונה את הפרויקט"
```

## כל סוגי הטריגרים (on)

### טריגרים מבוססי Git

```yaml
on:
  push:
    branches: [main, 'release/**']
  pull_request:
    branches: [main]
    types: [opened, synchronize, reopened, ready_for_review]
```

### טריגר לפי לוח זמנים (cron)

```yaml
on:
  schedule:
    - cron: '0 3 * * *'   # כל יום ב-03:00 UTC
```

חשוב לזכור: זמן ה-cron תמיד ב-UTC, וייתכן עיכוב של כמה דקות בהרצה בפועל בזמני עומס גבוה ב-GitHub.

### טריגר ידני (workflow_dispatch)

```yaml
on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'לאיזו סביבה לפרוס'
        required: true
        type: choice
        options: [staging, production]
      debug:
        description: 'הפעלת מצב דיבאג'
        required: false
        type: boolean
        default: false
```

בשלב מאוחר יותר ב-workflow ניתן לגשת לערכים האלה דרך `${{ github.event.inputs.environment }}` או `${{ inputs.environment }}`.

### טריגר בין workflows (workflow_call, workflow_run)

```yaml
# reusable workflow שנקרא מ-workflow אחר
on:
  workflow_call:
    inputs:
      environment:
        required: true
        type: string
    secrets:
      DEPLOY_TOKEN:
        required: true
```

```yaml
# הפעלה אחרי שworkflow אחר הסתיים
on:
  workflow_run:
    workflows: ["CI Pipeline"]
    types: [completed]
    branches: [main]
```

### טריגרים נוספים על אירועי GitHub

```yaml
on:
  issues:
    types: [opened, labeled]
  issue_comment:
    types: [created]
  release:
    types: [published]
  fork:
  watch:
    types: [started]
  repository_dispatch:
    types: [custom-event]
```

`repository_dispatch` מאפשר להפעיל workflow באמצעות קריאת REST API חיצונית - שימושי לאינטגרציה עם מערכות צד שלישי.

## סינון לפי ענפים, תגיות ונתיבים

```yaml
on:
  push:
    branches:
      - main
      - 'feature/**'
    branches-ignore:
      - 'experimental/**'
    tags:
      - 'v*.*.*'
    paths:
      - 'src/**'
      - '!src/**/*.md'   # התעלמות מקבצי מארקדאון
```

טיפ מעשי: אם ל-`push` ול-`branches-ignore` יש התנגשות, `branches` ו-`branches-ignore` לא ניתנים לשימוש יחד באותו אירוע - צריך לבחור אחד מהשניים.

## Expressions וקונטקסטים

GitHub Actions מספק "קונטקסטים" (contexts) - אובייקטים עם מידע על הריצה הנוכחית, שנגישים באמצעות `${{ }}`:

```yaml
steps:
  - name: הדפסת מידע מהקונטקסטים
    run: |
      echo "Actor: ${{ github.actor }}"
      echo "Event name: ${{ github.event_name }}"
      echo "SHA: ${{ github.sha }}"
      echo "Runner OS: ${{ runner.os }}"
      echo "Job status: ${{ job.status }}"
```

הקונטקסטים המרכזיים: `github`, `env`, `vars`, `job`, `steps`, `runner`, `secrets`, `strategy`, `matrix`, `needs`, `inputs`.

פונקציות שימושיות בביטויים:

```yaml
if: contains(github.event.head_commit.message, '[skip ci]') == false
if: startsWith(github.ref, 'refs/tags/')
if: success() && github.event_name == 'push'
if: failure()
if: always()
```

## תנאים (if) בשלבים ובג'ובים

```yaml
jobs:
  deploy:
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    runs-on: ubuntu-latest
    steps:
      - name: פריסה לפרודקשן
        if: success()
        run: ./deploy.sh

      - name: שליחת התראה במקרה כישלון
        if: failure()
        run: ./notify-failure.sh

      - name: ניקוי - תמיד רץ
        if: always()
        run: ./cleanup.sh
```

חשוב: `jobs.<job_id>.if` מוערך **לפני** ש-`strategy.matrix` מוחל, ואילו `steps.if` מוערך בזמן ריצת ה-job עצמו.

## Concurrency - שליטה בריצות מקבילות

מונע כפילות ריצות (למשל אם עושים כמה push מהירים ברצף):

```yaml
concurrency:
  group: deploy-${{ github.ref }}
  cancel-in-progress: true
```

כך, אם מתבצע push חדש בזמן שריצה קודמת עדיין רצה על אותו ענף, הריצה הישנה תבוטל אוטומטית לטובת החדשה - חוסך זמן ומשאבים.

## טיפים וטריקים

1. **שילוב `paths` ו-`paths-ignore` חוסך הרצות מיותרות**: אם רק קובץ README השתנה, אין טעם להריץ CI מלא.

2. **`[skip ci]` בהודעת commit** - GitHub Actions מזהה אוטומטית מחרוזות כמו `[skip ci]` או `[ci skip]` בהודעת ה-commit, ומדלג על הרצת ה-workflow.

3. **שימוש ב-`run-name` דינמי** לזיהוי מהיר בהיסטוריית הריצות:
   ```yaml
   run-name: פריסה ל-${{ inputs.environment }} על ידי ${{ github.actor }}
   ```

4. **הימנעות מ-`pull_request_target` ללא זהירות** - טריגר זה רץ עם הרשאות של הענף הבסיסי (base) גם עבור PR מ-fork, ולכן טעון אבטחתית אם משלבים אותו עם checkout של קוד ה-PR עצמו (מורחב במדריך האבטחה).

5. **`timeout-minutes` בכל job** - מומלץ להגדיר timeout סביר (למשל 10-20 דקות) כדי למנוע job "תקוע" שצורך שעות ריצה מיותרות.

6. **בדיקת ה-event payload המלא** - אפשר לגשת ל-`github.event` ולקבל את כל ה-JSON payload של האירוע, כולל שדות ספציפיים כמו `github.event.pull_request.number`.

## שאלות ראיון עבודה

**1. מה ההבדל בין `push` ל-`pull_request_target`?**
`pull_request` רץ בהקשר הממוזג עם הרשאות מוגבלות (במיוחד מ-forks, ללא גישה ל-secrets). `pull_request_target` רץ עם הרשאות מלאות של הענף הבסיסי, גם על PR מ-fork - ולכן דורש זהירות רבה.

**2. איך מריצים workflow פעם ביום בשעה קבועה?**
באמצעות טריגר `schedule` עם ביטוי cron, למשל `cron: '0 3 * * *'`.

**3. מה זה `workflow_dispatch` ולמה הוא שימושי?**
טריגר שמאפשר הפעלה ידנית של workflow דרך ממשק GitHub או ה-API, עם אפשרות להזין פרמטרים מותאמים אישית (`inputs`).

**4. איך מונעים הרצה כפולה של אותו workflow כשעושים כמה push ברצף?**
באמצעות `concurrency` עם `group` ו-`cancel-in-progress: true`.

**5. מה ההבדל בין `workflow_call` ל-`workflow_run`?**
`workflow_call` הופך workflow ל"פונקציה" שניתן לקרוא לה מתוך workflow אחר עם `uses`. `workflow_run` מפעיל workflow כתגובה לסיום ריצה של workflow אחר, לרוב לצורך שרשור תהליכים.

**6. איך מדלגים על הרצת CI לקומיט מסוים?**
הוספת `[skip ci]` (או וריאציות דומות) בהודעת ה-commit.

**7. מה ההבדל בין `if: success()`, `if: failure()` ו-`if: always()`?**
`success()` (ברירת המחדל) רץ רק אם כל השלבים הקודמים הצליחו; `failure()` רץ רק אם משהו נכשל; `always()` רץ תמיד, ללא קשר לתוצאה - שימושי לניקוי או התראות.

**8. איך מגבילים workflow לרוץ רק כשמשנים קבצים בתיקייה מסוימת?**
באמצעות `paths` (או `paths-ignore`) תחת הגדרת ה-`push`/`pull_request`.

**9. מה זה קונטקסט (context) ב-GitHub Actions?**
אובייקט מובנה שנגיש דרך `${{ }}` ומכיל מידע על הריצה - כמו `github`, `env`, `runner`, `job`, `steps`, `matrix`.

**10. מה קורה אם `jobs.<job_id>.if` מחזיר false?**
ה-job כולו מדולג (לא נכשל), ומופיע כ-"Skipped" בממשק.

## קישורים חיצוניים

### תיעוד רשמי (GitHub Docs)
- [Workflow syntax for GitHub Actions - הרפרנס המלא](https://docs.github.com/actions/using-workflows/workflow-syntax-for-github-actions)
- [Events that trigger workflows - כל סוגי הטריגרים](https://docs.github.com/actions/using-workflows/events-that-trigger-workflows)
- [Quickstart for GitHub Actions](https://docs.github.com/en/actions/writing-workflows/quickstart)

### סרטוני יוטיוב מומלצים
- [GitHub Actions: The Full Course - Learn by Doing! (פלייליסט)](https://youtube.com/playlist?list=PLArH6NjfKsUhvGHrpag7SuPumMzQRhUKY)
- [Complete GitHub Actions Course - From BEGINNER to PRO](https://www.youtube.com/watch?v=Xwpi0ITkL3U)
- [GitHub Actions Tutorial | From Zero to Hero in 90 minutes](https://www.youtube.com/watch?v=TLB5MY9BBa4)

---

**במדריך הבא (מדריך 3):** נעמיק ב-Jobs, Steps ו-Runners - כולל תלויות בין jobs (`needs`), שיתוף נתונים בין steps, ועבודה עם runners שונים.
