---
title: "Matrix Strategy ובדיקות מקבילות"
category: DevOps/GitHub Actions
part: 6/10
---

## מהו Matrix Strategy

לעיתים קרובות רוצים להריץ את **אותו job** עם קומבינציות שונות של פרמטרים - למשל לבדוק את הקוד על Node.js גרסה 18, 20 ו-22, על אובונטו, ווינדוס ומאק. במקום לכתוב 9 jobs נפרדים (3 גרסאות × 3 מערכות הפעלה), Matrix Strategy יוצר את כל הקומבינציות אוטומטית מהגדרה יחידה.

## מטריצה בסיסית

```yaml
jobs:
  test:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        node-version: [18, 20, 22]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
      - run: npm ci
      - run: npm test
```

ה-workflow הזה ייצור **9 jobs נפרדים** (3 × 3), כל אחד רץ במקביל (עד למגבלת המקביליות של החשבון), עם הקומבינציה המתאימה שלו:

```
ubuntu-latest  + node 18
ubuntu-latest  + node 20
ubuntu-latest  + node 22
windows-latest + node 18
windows-latest + node 20
windows-latest + node 22
macos-latest   + node 18
macos-latest   + node 20
macos-latest   + node 22
```

## Include ו-Exclude

**`exclude`** - הסרת קומבינציות ספציפיות מהמטריצה:

```yaml
strategy:
  matrix:
    os: [ubuntu-latest, windows-latest, macos-latest]
    node-version: [18, 20, 22]
    exclude:
      - os: macos-latest
        node-version: 18    # לא בודקים Node 18 על macOS
      - os: windows-latest
        node-version: 22    # לא בודקים Node 22 על Windows
```

**`include`** - הוספת קומבינציות נוספות, או הוספת ערכים נוספים לקומבינציה קיימת:

```yaml
strategy:
  matrix:
    os: [ubuntu-latest]
    node-version: [20]
    include:
      # הוספת שדה נוסף לקומבינציה קיימת
      - os: ubuntu-latest
        node-version: 20
        experimental: true
      # הוספת קומבינציה חדשה לגמרי, לא מכפלה של os/node-version
      - os: macos-14
        node-version: 22
        arch: arm64
```

## שליטה בקצב הריצה

`max-parallel` מגביל כמה jobs מהמטריצה ירוצו בו-זמנית - שימושי כאשר יש הגבלת runners זמינים, או כדי לא להעמיס על שירות חיצוני (כמו מסד נתונים משותף בבדיקות):

```yaml
strategy:
  max-parallel: 2
  matrix:
    shard: [1, 2, 3, 4, 5, 6]
```

## fail-fast וההשלכות שלו

כברירת מחדל, `fail-fast: true` - כלומר אם קומבינציה אחת נכשלת, **כל שאר הקומבינציות במטריצה מבוטלות מיידית**. זה חוסך זמן ריצה, אבל לפעמים לא רוצים את זה - למשל אם אתם רוצים לראות בדיוק אילו מערכות הפעלה נכשלות ואילו לא:

```yaml
strategy:
  fail-fast: false   # ממשיך להריץ את כל הקומבינציות גם אם אחת נכשלה
  matrix:
    os: [ubuntu-latest, windows-latest, macos-latest]
```

טבלת החלטה מהירה:

| מצב | fail-fast |
|---|---|
| רוצים משוב מהיר, לא אכפת לדעת סטטוס כל קומבינציה | `true` (ברירת מחדל) |
| רוצים לראות תמונה מלאה של כל הקומבינציות, גם אם חלקן נכשלות | `false` |

## מטריצה דינמית מתוך JSON

לעיתים המטריצה עצמה תלויה בלוגיקה שרצה בזמן אמת (למשל, רשימת שירותים ב-monorepo שהשתנו). ניתן ליצור אותה דינמית ב-job אחד, ולהעביר אותה ל-job הבא דרך outputs עם `fromJSON`:

```yaml
jobs:
  generate-matrix:
    runs-on: ubuntu-latest
    outputs:
      matrix: ${{ steps.set-matrix.outputs.matrix }}
    steps:
      - id: set-matrix
        run: |
          echo 'matrix={"service":["auth","billing","notifications"]}' >> "$GITHUB_OUTPUT"

  test-services:
    needs: generate-matrix
    runs-on: ubuntu-latest
    strategy:
      matrix: ${{ fromJSON(needs.generate-matrix.outputs.matrix) }}
    steps:
      - run: echo "בודק את השירות ${{ matrix.service }}"
```

## מטריצה מרובת ממדים - דוגמה מקיפה

Docker build למספר ארכיטקטורות:

```yaml
name: Docker Multi-Arch Build

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        platform: [linux/amd64, linux/arm64]
    steps:
      - uses: actions/checkout@v4

      - uses: docker/setup-qemu-action@v3

      - uses: docker/setup-buildx-action@v3

      - name: בנייה עבור ${{ matrix.platform }}
        uses: docker/build-push-action@v6
        with:
          platforms: ${{ matrix.platform }}
          push: false
          tags: myapp:${{ github.sha }}
```

## טיפים וטריקים

1. **מגבלת 256 jobs למטריצה** - GitHub מגביל מטריצה בודדת ל-256 קומבינציות מקסימום. אם צריך יותר, פצלו לכמה workflows או השתמשו במטריצה דינמית עם סינון.

2. **שימוש ב-`matrix.<key>` לזיהוי בשם job** - הוסיפו `name` דינמי לג'וב כדי לזהות בקלות איזו קומבינציה נכשלה:
   ```yaml
   jobs:
     test:
       name: בדיקה על ${{ matrix.os }} עם Node ${{ matrix.node-version }}
   ```

3. **`strategy.job-index`** נגיש לזיהוי אינדקס הקומבינציה הנוכחית - שימושי ל-sharding של בדיקות.

4. **שילוב מטריצה עם `continue-on-error` לבדיקות ניסיוניות**:
   ```yaml
   strategy:
     matrix:
       node-version: [18, 20, 22-nightly]
       include:
         - node-version: 22-nightly
           experimental: true
   steps:
     - continue-on-error: ${{ matrix.experimental == true }}
       run: npm test
   ```

5. **Sharding בדיקות כבדות** - פצלו סוויטת בדיקות ענקית לכמה chunks עם מטריצה, כדי לצמצם זמן ריצה כולל:
   ```yaml
   strategy:
     matrix:
       shard: [1, 2, 3, 4]
   steps:
     - run: npm test -- --shard=${{ matrix.shard }}/4
   ```

## שאלות ראיון עבודה

**1. מה זה matrix strategy ומתי כדאי להשתמש בו?**
מנגנון שיוצר אוטומטית מספר jobs מתוך קומבינציות של משתנים (כמו מערכת הפעלה וגרסת שפה), במקום לכתוב job נפרד לכל קומבינציה ידנית.

**2. מה ההבדל בין `include` ל-`exclude` במטריצה?**
`exclude` מסיר קומבינציות ספציפיות מהמכפלה הקרטזית שנוצרת; `include` מוסיף קומבינציות נוספות, כולל כאלה שלא נוצרות אוטומטית מהמכפלה, או מוסיף שדה נוסף לקומבינציה קיימת.

**3. מה המשמעות של `fail-fast: true` (ברירת המחדל)?**
אם קומבינציה אחת במטריצה נכשלת, GitHub Actions מבטל מיידית את שאר הקומבינציות שעדיין רצות.

**4. מהי המגבלה המקסימלית של jobs שמטריצה בודדת יכולה ליצור?**
256 jobs לכל היותר, ממטריצה בודדת בתוך workflow אחד.

**5. איך יוצרים מטריצה דינמית שלא ידועה מראש בזמן כתיבת ה-YAML?**
מייצרים JSON בשלב מוקדם יותר (job נפרד), מייצאים אותו כ-output, ומשתמשים ב-`fromJSON(needs.<job>.outputs.<name>)` בהגדרת ה-`strategy.matrix` של ה-job הבא.

**6. מה זה `max-parallel` ולמה זה שימושי?**
מגביל כמה jobs מהמטריצה ירוצו בו-זמנית - שימושי כדי לא להעמיס על משאבים חיצוניים משותפים (כמו מסד נתונים) או להתאים למגבלת runners.

**7. איך אפשר לפצל (shard) סוויטת בדיקות גדולה בין כמה מכונות?**
באמצעות מטריצה עם ערכי shard (למשל 1 עד 4), כאשר כל job מריץ רק חלק מהבדיקות לפי הפרמטר שהתקבל, מה שמקצר את זמן הריצה הכולל.

**8. מה קורה אם רוצים לראות תוצאה מלאה של כל הקומבינציות במטריצה, גם אם חלקן נכשלות?**
מגדירים `fail-fast: false`, כך שכל הקומבינציות ימשיכו לרוץ עד הסוף ללא קשר לכישלונות בקומבינציות אחרות.

**9. האם ניתן לשלב `matrix` עם `needs` בין jobs?**
כן - job עם matrix strategy יכול להיות תלוי (`needs`) ב-job אחר, ואף להשתמש בפלט שלו כדי לבנות את המטריצה עצמה.

**10. תנו דוגמה מעשית לשימוש ב-`include` להוספת שדה בודד לקומבינציה ספציפית.**
למשל, סימון קומבינציה מסוימת (Node גרסת nightly) כניסיונית באמצעות שדה `experimental: true`, ולאחר מכן שימוש ב-`continue-on-error: ${{ matrix.experimental == true }}` כדי לא להכשיל את כל ה-workflow בגללה.

## קישורים חיצוניים

### תיעוד רשמי (GitHub Docs)
- [Running variations of jobs in a workflow - התיעוד הרשמי המלא על Matrix](https://docs.github.com/actions/writing-workflows/choosing-what-your-workflow-does/running-variations-of-jobs-in-a-workflow)
- [Workflow syntax for GitHub Actions](https://docs.github.com/actions/using-workflows/workflow-syntax-for-github-actions)

### סרטוני יוטיוב מומלצים
- [GitHub Actions Tutorial | From Zero to Hero in 90 minutes](https://www.youtube.com/watch?v=TLB5MY9BBa4)
- [Complete GitHub Actions Course - From BEGINNER to PRO](https://www.youtube.com/watch?v=Xwpi0ITkL3U)

---

**במדריך הבא (מדריך 7):** נבנה Pipeline מלא של CI/CD - מבנייה, דרך בדיקות, ועד פריסה אוטומטית לפרודקשן.
