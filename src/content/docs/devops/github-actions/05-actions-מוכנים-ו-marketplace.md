---
title: "Actions מוכנים ו-GitHub Marketplace"
category: DevOps/GitHub Actions
part: 5/10
---

## מה זה GitHub Marketplace

GitHub Marketplace הוא קטלוג ציבורי עצום של אלפי Actions מוכנים לשימוש, שנוצרו הן על ידי GitHub עצמה (תחת הארגון `actions/`) והן על ידי הקהילה וחברות צד שלישי (Docker, AWS, Slack, Codecov ועוד רבים אחרים).

במקום לכתוב מאפס לוגיקה לכל משימה נפוצה - שליחת הודעת Slack, פרסום ל-npm, סריקת אבטחה, יצירת release - פשוט "מרכיבים" Actions קיימים ב-workflow, כמו לגו.

ניתן לגלוש בקטלוג בכתובת `github.com/marketplace?type=actions`.

## Actions חיוניים שכל מפתח צריך להכיר

### ניהול קוד וסביבה

```yaml
- uses: actions/checkout@v4          # משיכת הקוד מהריפו
  with:
    fetch-depth: 0                    # 0 = כל ההיסטוריה, ברירת מחדל = 1 (shallow)

- uses: actions/setup-node@v4         # התקנת Node.js
  with:
    node-version: '20'
    cache: 'npm'

- uses: actions/setup-python@v5       # התקנת Python
  with:
    python-version: '3.12'
    cache: 'pip'

- uses: actions/setup-java@v4         # התקנת Java
  with:
    distribution: 'temurin'
    java-version: '21'

- uses: actions/cache@v4              # קאשינג ידני של תלויות
  with:
    path: ~/.npm
    key: npm-${{ hashFiles('package-lock.json') }}
```

### עבודה עם Artifacts ו-API

```yaml
- uses: actions/upload-artifact@v4
  with:
    name: build-output
    path: dist/

- uses: actions/download-artifact@v4
  with:
    name: build-output

- uses: actions/github-script@v7      # הרצת קוד JS מול GitHub API
  with:
    script: |
      console.log(context.repo)
```

### Docker ו-Containers

```yaml
- uses: docker/setup-buildx-action@v3
- uses: docker/login-action@v3
  with:
    username: ${{ vars.DOCKER_USERNAME }}
    password: ${{ secrets.DOCKER_PASSWORD }}
- uses: docker/build-push-action@v6
  with:
    push: true
    tags: myorg/myapp:latest
```

### אבטחה ואיכות קוד

```yaml
- uses: github/codeql-action/analyze@v3   # סריקת אבטחה סטטית
- uses: codecov/codecov-action@v4         # דיווח כיסוי בדיקות
  with:
    token: ${{ secrets.CODECOV_TOKEN }}
```

### התראות ואינטגרציות

```yaml
- uses: slackapi/slack-github-action@v2
  with:
    payload: |
      {"text": "הפריסה הושלמה בהצלחה! ✅"}
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

## איך לבחור Action בבטחה

בהתחשב בכך ש-`uses` מריץ קוד של צד שלישי בתוך ה-workflow שלכם (עם גישה פוטנציאלית ל-secrets), חשוב לבדוק כמה דברים לפני שסומכים על Action:

1. **מספר הכוכבים (stars) והשימוש** - Action עם עשרות אלפי משתמשים סביר יותר שנבדק ותוחזק היטב.
2. **תדירות עדכונים** - מתי הייתה ה-commit האחרונה? Action נטוש עלול להכיל פרצות לא מתוקנות.
3. **מקור מהימן** - Actions תחת הארגונים `actions/`, `docker/`, `github/` נחשבים למקור ראשוני מהימן.
4. **בדיקת קוד המקור** - במיוחד עבור Actions פחות מוכרים, שווה לעיין בקוד עצמו (בפרט אם זה JavaScript action - קל לקרוא).
5. **נעילה לגרסה מדויקת** - עדיף `@v4` (טאג) או אפילו commit SHA מלא לביטחון מרבי, ולא `@main`.

```yaml
# פחות בטוח - יכול להשתנות בכל רגע
- uses: some-org/some-action@main

# בטוח יותר - טאג גרסה
- uses: some-org/some-action@v2

# הכי בטוח - commit SHA מוצמד
- uses: some-org/some-action@a1b2c3d4e5f6...
```

## דרכי שימוש שונות ב-uses

```yaml
steps:
  # Action מה-Marketplace (ריפו ציבורי)
  - uses: actions/checkout@v4

  # Action מריפו פרטי אחר בארגון (דורש הרשאות מתאימות)
  - uses: my-org/private-action-repo@v1

  # Action מקומי - נמצא באותו ריפו
  - uses: ./.github/actions/my-local-action

  # Action מתוך Docker image ציבורי
  - uses: docker://alpine:3.19
    with:
      args: echo "רץ בתוך קונטיינר Alpine"

  # תת-תיקייה בתוך ריפו (מונו-ריפו של actions)
  - uses: actions/aws/ec2@main
```

## דוגמת CI מלאה עם Actions מה-Marketplace

```yaml
name: CI מלא עם Actions מה-Marketplace

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-test-report:
    runs-on: ubuntu-latest
    steps:
      - name: משיכת קוד
        uses: actions/checkout@v4

      - name: הגדרת Node.js עם קאשינג
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: התקנת תלויות
        run: npm ci

      - name: הרצת בדיקות עם דוח כיסוי
        run: npm test -- --coverage

      - name: העלאת דוח כיסוי ל-Codecov
        uses: codecov/codecov-action@v4
        with:
          token: ${{ secrets.CODECOV_TOKEN }}

      - name: בנייה
        run: npm run build

      - name: העלאת תוצרי בנייה
        uses: actions/upload-artifact@v4
        with:
          name: production-build
          path: dist/

      - name: הודעת Slack על הצלחה
        if: success()
        uses: slackapi/slack-github-action@v2
        with:
          payload: |
            {"text": "✅ ה-build עבר בהצלחה ב-${{ github.repository }}"}
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

## טיפים וטריקים

1. **Dependabot לעדכון Actions אוטומטי** - הוסיפו ל-`.github/dependabot.yml`:
   ```yaml
   version: 2
   updates:
     - package-ecosystem: "github-actions"
       directory: "/"
       schedule:
         interval: "weekly"
   ```
   כך תקבלו PR אוטומטי בכל פעם ש-Action שבשימוש מתעדכן.

2. **שימוש ב-`actions/cache` חוסך זמן משמעותי** - במיוחד עבור תלויות כבדות (node_modules, pip packages, Maven/.m2).

3. **הימנעות מ-Actions "כבדים מדי" למשימות פשוטות** - לפעמים שורת `run: curl ...` פשוטה עדיפה על התקנת Action שלם.

4. **בדיקת ה-`action.yml`** - לפני שימוש ב-Action לא מוכר, פתחו את קובץ `action.yml` בריפו שלו וראו בדיוק אילו `inputs`, `outputs` ו-`permissions` הוא דורש.

5. **שילוב Actions עם Composite Action מותאם אישית** - אם אתם חוזרים על אותה קומבינציית Actions בכמה workflows, שקלו לעטוף אותה ב-Composite Action משלכם (מורחב במדריך 9).

## שאלות ראיון עבודה

**1. מה זה GitHub Marketplace?**
קטלוג ציבורי של אלפי Actions מוכנים לשימוש חוזר, שנוצרו על ידי GitHub, חברות צד שלישי, והקהילה.

**2. למה חשוב לנעול Action לגרסה ספציפית ולא להשתמש ב-`@main`?**
כי `@main` יכול להשתנות בכל רגע - כולל שינויים לא צפויים או פגיעים - בעוד שגרסה נעולה (טאג או commit SHA) מבטיחה יציבות וחזרתיות (reproducibility).

**3. מהי הדרך הבטוחה ביותר לנעול Action?**
הצמדה ל-commit SHA מלא, ולא רק טאג גרסה - כי טאגים תיאורטית ניתנים לשינוי (אם כי זה נחשב לפרקטיקה גרועה מצד המפרסם).

**4. מה ההבדל בין `uses: actions/checkout@v4` ל-`uses: ./.github/actions/my-action`?**
הראשון מושך Action מריפו חיצוני ב-GitHub (public או private נגיש); השני מפעיל Action מקומי שמוגדר בתוך אותו ריפו.

**5. איך אפשר להריץ Action שמבוסס על Docker image ציבורי ישירות, בלי לעטוף אותו כ-Action רשמי?**
באמצעות `uses: docker://<image>:<tag>`.

**6. מהם שיקולי האבטחה המרכזיים לפני שימוש ב-Action של צד שלישי?**
פופולריות ואמינות המקור, תדירות עדכונים, בדיקת קוד המקור, ובחירת נעילת גרסה בטוחה - כי Action רץ עם גישה פוטנציאלית ל-secrets ולריפו.

**7. מה זה Dependabot ואיך הוא קשור ל-GitHub Actions?**
כלי שמנטר תלויות (כולל Actions) ופותח PR אוטומטי כשיש גרסה חדשה - ניתן להגדיר אקוסיסטם `github-actions` לעדכון אוטומטי של Actions בשימוש.

**8. מה ההבדל בין `actions/cache` לבין `cache: 'npm'` בתוך `actions/setup-node`?**
`setup-node` עם `cache: 'npm'` הוא קיצור דרך מובנה שמנהל קאשינג אוטומטי לתלויות npm; `actions/cache` הוא Action כללי יותר שניתן להתאים לכל סוג קאש (Python, Maven, Gradle, custom paths וכו').

**9. מה קורה אם Action שאתם משתמשים בו מוסר או מתעדכן בצורה פורצת (breaking change)?**
אם אתם נעולים לגרסה ספציפית (כמו `@v4`), ה-workflow שלכם ימשיך לעבוד כרגיל עד שתחליטו לשדרג במודע. זו הסיבה המרכזית לנעילת גרסאות.

**10. תנו דוגמה למקרה שבו כדאי לכתוב `run: curl ...` פשוט במקום להשתמש ב-Action ייעודי.**
כאשר המשימה פשוטה מספיק (למשל שליחת webhook בודד) - הוספת Action שלם עם כל התלויות שלו עלולה להאט את הריצה ולהוסיף סיכון אבטחתי מיותר, בעוד ש-`curl` בשורה אחת עושה בדיוק את מה שצריך.

## קישורים חיצוניים

### תיעוד רשמי (GitHub Docs)
- [Workflow syntax for GitHub Actions - כולל `uses`](https://docs.github.com/actions/using-workflows/workflow-syntax-for-github-actions)
- [Dependency caching reference](https://docs.github.com/en/actions/reference/workflows-and-actions/dependency-caching)
- [דף הבית של תיעוד GitHub Actions](https://docs.github.com/en/actions)

### סרטוני יוטיוב מומלצים
- [Complete GitHub Actions Course - From BEGINNER to PRO](https://www.youtube.com/watch?v=Xwpi0ITkL3U)
- [GitHub Actions: For Absolute Beginners](https://www.youtube.com/watch?v=Y4lEVoOeKT8)

---

**במדריך הבא (מדריך 6):** נלמד על Matrix Strategy - איך להריץ אותו job על כמה מערכות הפעלה, גרסאות שפה, וקונפיגורציות במקביל.
