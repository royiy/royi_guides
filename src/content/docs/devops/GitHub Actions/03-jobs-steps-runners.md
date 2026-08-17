# מדריך 3: Jobs, Steps ו-Runners לעומק

> מדריך 3 מתוך 10 בסדרת המדריכים המקיפה ל-GitHub Actions בעברית.

## תוכן עניינים

1. [מהו Job וכיצד הוא פועל](#מהו-job-וכיצד-הוא-פועל)
2. [תלות בין Jobs עם needs](#תלות-בין-jobs-עם-needs)
3. [שיתוף נתונים בין Jobs - Outputs](#שיתוף-נתונים-בין-jobs---outputs)
4. [Steps - run מול uses](#steps---run-מול-uses)
5. [שיתוף נתונים בין Steps באותו Job](#שיתוף-נתונים-בין-steps-באותו-job)
6. [Artifacts - העברת קבצים בין Jobs](#artifacts---העברת-קבצים-בין-jobs)
7. [עומק בנושא Runners](#עומק-בנושא-runners)
8. [טיפים וטריקים](#טיפים-וטריקים)
9. [שאלות ראיון עבודה](#שאלות-ראיון-עבודה)
10. [קישורים חיצוניים](#קישורים-חיצוניים)

---

## מהו Job וכיצד הוא פועל

Job הוא יחידת עבודה שרצה **על runner אחד**, במכונה נקייה שמוקמת (provisioned) במיוחד לריצה הזו. כל ה-steps בתוך אותו job חולקים את אותה מערכת קבצים וזיכרון - אבל jobs שונים באותו workflow **לא** חולקים מערכת קבצים, אלא אם משתמשים ב-artifacts או cache.

```yaml
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm run lint

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm test

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm run build
```

בדוגמה הזו, שלושת ה-jobs (`lint`, `test`, `build`) **רצים במקביל** כברירת מחדל, כי אין ביניהם שום תלות מוגדרת.

## תלות בין Jobs עם needs

כאשר יש סדר לוגי הכרחי (למשל: קודם build, אחר כך deploy), משתמשים ב-`needs`:

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm run build

  test:
    runs-on: ubuntu-latest
    needs: build
    steps:
      - run: npm test

  deploy:
    runs-on: ubuntu-latest
    needs: [build, test]     # מחכה לשני ה-jobs האלה
    if: github.ref == 'refs/heads/main'
    steps:
      - run: ./deploy.sh
```

תרשים תלות (dependency graph) שנוצר:

```
build ──> test ──> deploy
  └──────────────────┘
```

אם `build` נכשל, גם `test` ו-`deploy` **לא ירוצו כלל** - אלא אם מוסיפים `if: always()` או `if: needs.build.result == 'failure'` באופן מפורש כדי לטפל בכישלון.

## שיתוף נתונים בין Jobs - Outputs

כדי להעביר ערך מ-job אחד למשנהו, צריך להגדיר outputs ברמת ה-job וברמת ה-step:

```yaml
jobs:
  set-version:
    runs-on: ubuntu-latest
    outputs:
      version: ${{ steps.get-version.outputs.version }}
    steps:
      - id: get-version
        run: echo "version=1.4.2" >> "$GITHUB_OUTPUT"

  use-version:
    runs-on: ubuntu-latest
    needs: set-version
    steps:
      - run: echo "הגרסה שהתקבלה היא ${{ needs.set-version.outputs.version }}"
```

הערה חשובה: `>> "$GITHUB_OUTPUT"` הוא התחביר העדכני להגדרת outputs (התחביר הישן `::set-output name=...` הוצא משימוש מטעמי אבטחה).

## Steps - run מול uses

כל step הוא אחד משני הסוגים:

**`run`** - מריץ פקודת shell (או PowerShell, Python וכו', בהתאם ל-`shell:`):

```yaml
steps:
  - name: הרצת פקודה מרובת שורות
    run: |
      echo "שלב 1"
      npm install
      echo "שלב 2 הושלם"
    shell: bash
```

**`uses`** - מפעיל Action קיים (מ-Marketplace, מריפו אחר, או local path):

```yaml
steps:
  - name: משיכת קוד
    uses: actions/checkout@v4
    with:
      fetch-depth: 0   # משיכת כל היסטוריית ה-git ולא רק הקומיט האחרון

  - name: שימוש ב-Action מקומי
    uses: ./.github/actions/my-custom-action
```

## שיתוף נתונים בין Steps באותו Job

בתוך אותו job אפשר להשתמש ב-`id` ו-`outputs`:

```yaml
steps:
  - name: יצירת מזהה ייחודי
    id: gen-id
    run: echo "build_id=$(date +%s)" >> "$GITHUB_OUTPUT"

  - name: שימוש בערך שנוצר
    run: echo "מזהה הבנייה הוא ${{ steps.gen-id.outputs.build_id }}"
```

וגם משתני סביבה לכל שאר ה-job דרך `$GITHUB_ENV`:

```yaml
steps:
  - name: הגדרת משתנה סביבה לכל שאר השלבים
    run: echo "APP_VERSION=2.0.1" >> "$GITHUB_ENV"

  - name: שימוש במשתנה
    run: echo "הגרסה: $APP_VERSION"
```

## Artifacts - העברת קבצים בין Jobs

בעוד ש-outputs מעבירים מחרוזות קטנות, **artifacts** מעבירים קבצים שלמים (build output, לוגים, תמונות דוח בדיקות וכו') בין jobs:

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm run build
      - name: העלאת תוצרי הבנייה
        uses: actions/upload-artifact@v4
        with:
          name: dist-files
          path: dist/
          retention-days: 5

  deploy:
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: הורדת תוצרי הבנייה
        uses: actions/download-artifact@v4
        with:
          name: dist-files
          path: dist/
      - run: ls -la dist/
      - run: ./deploy.sh
```

## עומק בנושא Runners

### תגי runners נפוצים

```yaml
runs-on: ubuntu-latest    # Ubuntu (הכי נפוץ, הכי מהיר להקצאה)
runs-on: ubuntu-22.04     # גרסה ספציפית
runs-on: windows-latest
runs-on: macos-latest
runs-on: macos-14         # Apple Silicon
```

### Container jobs - הרצת job בתוך קונטיינר Docker

```yaml
jobs:
  test-in-container:
    runs-on: ubuntu-latest
    container:
      image: node:20-alpine
      env:
        NODE_ENV: test
      options: --cpus 2
    steps:
      - uses: actions/checkout@v4
      - run: npm test
```

### Self-hosted runners עם labels מותאמים

```yaml
jobs:
  gpu-training:
    runs-on: [self-hosted, linux, gpu]
    steps:
      - run: python train_model.py
```

## טיפים וטריקים

1. **`fail-fast: false` במטריצה** מונע ביטול אוטומטי של שאר הריצות במטריצה כשאחת נכשלת - שימושי כדי לראות את כל התוצאות (מורחב במדריך 6).

2. **`needs.<job_id>.result`** מאפשר תגובה מדויקת למצב של job קודם:
   ```yaml
   if: needs.build.result == 'success'
   ```

3. **צמצום זמן ריצה עם jobs מקבילים** - במקום job אחד עם 10 דקות עבודה טורית, פצלו למספר jobs עצמאיים שרצים במקביל.

4. **שימוש ב-`working-directory`** כאשר הפרויקט הוא monorepo:
   ```yaml
   steps:
     - run: npm ci
       working-directory: ./packages/frontend
   ```

5. **הימנעות מ-Artifacts גדולים מדי** - הם נצרכים משטח אחסון ומשפיעים על מכסת השימוש; הגדירו `retention-days` קצר לתוצרי ביניים זמניים.

6. **`environment` ברמת job** לצורך אישורים ידניים (approval gates) לפני deployment:
   ```yaml
   jobs:
     deploy-production:
       runs-on: ubuntu-latest
       environment: production   # יכול לדרוש אישור ידני מוגדר מראש
       steps:
         - run: ./deploy.sh
   ```

## שאלות ראיון עבודה

**1. האם jobs שונים חולקים מערכת קבצים באותה ריצת workflow?**
לא. כל job רץ על runner נפרד לגמרי. כדי להעביר קבצים בין jobs צריך להשתמש ב-artifacts (upload/download), ולערכים טקסטואליים - ב-outputs.

**2. מה ההבדל בין `outputs` ל-`artifacts`?**
Outputs מיועדים לערכים טקסטואליים קצרים (מחרוזות, מספרים) שמועברים בין steps או jobs. Artifacts מיועדים להעברת קבצים שלמים (תוצרי build, דוחות, לוגים).

**3. איך גורמים ל-job לרוץ רק אחרי שjob אחר הצליח?**
באמצעות `needs: <job_id>`, ובאופן דיפולטיבי ה-job לא ירוץ אם ה-job שממנו הוא תלוי נכשל.

**4. מה זה `$GITHUB_OUTPUT` ולמה הוא החליף את `::set-output`?**
זהו קובץ מיוחד שאליו כותבים ערכי output בפורמט `key=value`. הוא החליף את התחביר הישן `::set-output` מטעמי אבטחה - כדי למנוע command injection דרך פלט לוגים.

**5. איך מריצים job בתוך קונטיינר Docker ולא ישירות על ה-VM?**
באמצעות מפתח `container` ברמת ה-job, עם ציון `image` (ואופציונלית `env`, `options`, `volumes`).

**6. מה קורה אם job A נכשל ו-job B תלוי בו עם needs?**
Job B ידולג אוטומטית (Skipped), אלא אם מגדירים במפורש `if: always()` או תנאי אחר שמאפשר ריצה גם במקרה כישלון.

**7. איך מגדירים אישור ידני (manual approval) לפני פריסה לפרודקשן?**
באמצעות `environment` ברמת ה-job, בשילוב עם הגדרת "required reviewers" בהגדרות ה-Environment בממשק GitHub.

**8. מה ההבדל בין self-hosted runner עם label בודד למספר labels?**
כשמגדירים `runs-on: [self-hosted, linux, gpu]`, ה-runner חייב להיות מתויג בכל ה-labels האלה יחד כדי שה-job ישתבץ אליו.

**9. איך מעבירים משתנה בין שני steps באותו job?**
באמצעות כתיבה ל-`$GITHUB_ENV` בשלב הראשון (למשתני סביבה לכל שאר ה-job), או `$GITHUB_OUTPUT` עם `id` בשלב הראשון וקריאה דרך `steps.<id>.outputs.<name>`.

**10. מה קורה ל-artifacts אחרי כמה זמן?**
הם נמחקים אוטומטית לפי `retention-days` (ברירת מחדל בדרך כלל 90 יום, ניתן לשינוי), אלא אם מוגדר אחרת.

## קישורים חיצוניים

### תיעוד רשמי (GitHub Docs)
- [Workflow syntax for GitHub Actions](https://docs.github.com/actions/using-workflows/workflow-syntax-for-github-actions)
- [Dependency caching reference](https://docs.github.com/en/actions/reference/workflows-and-actions/dependency-caching)
- [דף הבית של תיעוד GitHub Actions](https://docs.github.com/en/actions)

### סרטוני יוטיוב מומלצים
- [GitHub Actions Tutorial | From Zero to Hero in 90 minutes](https://www.youtube.com/watch?v=TLB5MY9BBa4) - כולל דוגמאות מפורטות ל-Runners
- [GitHub Actions: For Absolute Beginners](https://www.youtube.com/watch?v=Y4lEVoOeKT8) - כולל labs מעשיים

---

**במדריך הבא (מדריך 4):** ניכנס לעומק לניהול Secrets ומשתני סביבה - כולל רמות שונות (repository, environment, organization) ואבטחה בסיסית.
