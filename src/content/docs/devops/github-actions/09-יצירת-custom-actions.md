---
title: "יצירת Custom Actions - JavaScript, Docker ו-Composite"
category: DevOps/GitHub Actions
part: 9/10
---

## שלושת סוגי ה-Custom Actions

כאשר Actions קיימים ב-Marketplace לא מספיקים, ניתן לבנות Action מותאם אישית. יש שלושה סוגים:

| סוג | שפה | מהירות | פלטפורמות | מתי להשתמש |
|---|---|---|---|---|
| **Composite** | YAML בלבד | מהיר | כל הפלטפורמות | עטיפת כמה steps קיימים ללוגיקה אחת ניתנת לשימוש חוזר |
| **JavaScript** | Node.js | הכי מהיר | Linux, Windows, macOS | לוגיקה מותאמת אישית שרצה ישירות על ה-runner |
| **Docker** | כל שפה (בתוך container) | איטי יותר (בניית image) | Linux בלבד | כשצריך תלויות מערכת ספציפיות או סביבה מבודדת |

## קובץ action.yml - המטא-דאטה המשותפת

כל Action, מכל סוג, חייב קובץ `action.yml` (או `action.yaml`) בשורש התיקייה שלו:

```yaml
# action.yml
name: 'Greeting Action'
description: 'מברך משתמש בשמו ומחזיר מספר אקראי'
author: 'שמכם כאן'

inputs:
  who-to-greet:
    description: 'למי לברך'
    required: true
    default: 'עולם'

outputs:
  random-number:
    description: 'מספר אקראי שנוצר'

runs:
  using: 'node20'   # או 'composite' / 'docker'
  main: 'index.js'

branding:
  icon: 'smile'
  color: 'green'
```

## Composite Action - השילוב הפשוט ביותר

Composite Action עוטף כמה steps קיימים (בין אם `run` או `uses`) לכדי יחידה אחת ניתנת לשימוש חוזר. אין צורך לכתוב קוד תוכנית - רק YAML.

מבנה תיקיות:

```
.github/actions/setup-project/
├── action.yml
```

```yaml
# .github/actions/setup-project/action.yml
name: 'Setup Project'
description: 'מתקין Node.js, תלויות, ומריץ בדיקה בסיסית'

inputs:
  node-version:
    description: 'גרסת Node.js'
    required: false
    default: '20'

runs:
  using: 'composite'
  steps:
    - name: הגדרת Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ inputs.node-version }}
        cache: 'npm'

    - name: התקנת תלויות
      shell: bash
      run: npm ci

    - name: בדיקת תקינות בסיסית
      shell: bash
      run: npm run lint
```

שימוש ב-Action המקומי מ-workflow:

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: ./.github/actions/setup-project
        with:
          node-version: '22'
      - run: npm run build
```

שימו לב: ב-Composite Action, כל step עם `run` **חייב** לציין `shell:` במפורש - זה לא אופציונלי כמו ב-workflow רגיל.

## JavaScript Action - מהיר וחוצה פלטפורמות

מבנה תיקיות:

```
my-js-action/
├── action.yml
├── index.js
├── package.json
└── node_modules/    (או dist מקומפל עם ncc)
```

```yaml
# action.yml
name: 'Greeting Action'
description: 'מברך משתמש'
inputs:
  who-to-greet:
    description: 'למי לברך'
    required: true
    default: 'עולם'
outputs:
  random-number:
    description: 'מספר אקראי'
runs:
  using: 'node20'
  main: 'index.js'
```

```javascript
// index.js
const core = require('@actions/core');

try {
  const nameToGreet = core.getInput('who-to-greet');
  console.log(`שלום, ${nameToGreet}!`);

  const randomNumber = Math.floor(Math.random() * 100);
  core.setOutput('random-number', randomNumber.toString());

  // כתיבת סיכום שיוצג בממשק GitHub
  core.summary
    .addHeading('תוצאת ה-Action')
    .addRaw(`ברכה נשלחה ל: ${nameToGreet}`)
    .write();
} catch (error) {
  core.setFailed(error.message);
}
```

```json
// package.json
{
  "name": "greeting-action",
  "version": "1.0.0",
  "main": "index.js",
  "dependencies": {
    "@actions/core": "^1.10.1"
  }
}
```

לפני פרסום, יש לארוז את כל התלויות לקובץ בודד באמצעות `@vercel/ncc`, כדי שלא יהיה צורך להתקין `node_modules` בכל ריצה:

```bash
npm install -g @vercel/ncc
ncc build index.js -o dist
```

ואז ב-`action.yml` מפנים ל-`dist/index.js` במקום `index.js`.

## Docker Action - שליטה מלאה בסביבה

מבנה תיקיות:

```
my-docker-action/
├── action.yml
├── Dockerfile
└── entrypoint.sh
```

```yaml
# action.yml
name: 'Custom Linter Action'
description: 'מריץ כלי linting מותאם אישית בתוך container'
inputs:
  target-dir:
    description: 'התיקייה שתיבדק'
    required: true
    default: '.'
runs:
  using: 'docker'
  image: 'Dockerfile'
  args:
    - ${{ inputs.target-dir }}
```

```dockerfile
# Dockerfile
FROM alpine:3.19
RUN apk add --no-cache bash
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
```

```bash
#!/bin/bash
# entrypoint.sh
set -e
TARGET_DIR="$1"
echo "בודק את התיקייה: $TARGET_DIR"
find "$TARGET_DIR" -name "*.sh" -exec shellcheck {} \;
```

## השוואה בין שלושת הסוגים

```yaml
# דוגמה: אותה פונקציונליות בשלוש הגישות

# 1. Composite - רק עוטף Actions/פקודות קיימים
runs:
  using: 'composite'
  steps:
    - run: echo "פשוט ומהיר"
      shell: bash

# 2. JavaScript - לוגיקה מותאמת, ריצה ישירה על ה-runner
runs:
  using: 'node20'
  main: 'index.js'

# 3. Docker - סביבה מבודדת עם תלויות מערכת ייחודיות
runs:
  using: 'docker'
  image: 'Dockerfile'
```

**מתי לבחור מה:**

- **Composite** - כשרוצים רק לצמצם כפילות קוד YAML בין workflows, בלי לוגיקה מורכבת.
- **JavaScript** - כשצריך לוגיקה מותאמת (קריאות API, עיבוד נתונים), עם ביצועים טובים ותמיכה בכל הפלטפורמות.
- **Docker** - כשצריך כלים/ספריות מערכת ספציפיים (כמו כלי CLI חיצוני), או שפה שאינה JavaScript.

## פרסום Action ל-Marketplace

כדי לפרסם Action ל-GitHub Marketplace:

1. ודאו שהריפו ציבורי ומכיל `action.yml` בשורש.
2. הוסיפו `README.md` ברור עם דוגמאות שימוש.
3. תייגו release (למשל `v1.0.0`).
4. בעמוד ה-release, סמנו "Publish this Action to the GitHub Marketplace".
5. מומלץ גם לתחזק תגית major נעה (`v1`) שמצביעה תמיד על הגרסה היציבה האחרונה בתוך אותה major, כך שמשתמשים יכולים לכתוב `uses: my-org/my-action@v1` ולקבל תיקוני באגים אוטומטית.

## טיפים וטריקים

1. **תמיד ארזו JavaScript Actions עם `ncc`** - זה מונע צורך להתקין `node_modules` בכל ריצה, מה שמאיץ משמעותית את הביצועים.

2. **שימוש ב-`@actions/core` ו-`@actions/github`** - חבילות הטולקיט הרשמיות של GitHub לכתיבת JavaScript Actions, כוללות פונקציות ל-inputs/outputs, logging, וגישה נוחה ל-API.

3. **בדיקת Actions מקומית לפני פרסום** - עם `uses: ./.github/actions/my-action` ניתן לבדוק Action בתוך אותו ריפו לפני שמפרסמים אותו כריפו נפרד.

4. **שמרו על תגית major נעה (`v1`)** - הרגל נפוץ ב-Marketplace הוא לתחזק גם `v1.2.3` וגם `v1` (שמצביע תמיד על הגרסה האחרונה תחת major 1), כדי לתת גמישות למשתמשים.

5. **תיעוד ה-`inputs`/`outputs` בבירור** - כל שדה ב-`action.yml` צריך `description` ברור, כי זה מה שמופיע ב-Marketplace ובכלי autocomplete.

6. **הוספת branding** - שדה `branding` עם `icon` ו-`color` הופך את ה-Action להיראות מקצועי יותר ב-Marketplace.

## שאלות ראיון עבודה

**1. מהם שלושת סוגי ה-Custom Actions הקיימים ב-GitHub Actions?**
Composite Actions (YAML בלבד), JavaScript Actions (Node.js), ו-Docker Actions (container מותאם אישית).

**2. מה ההבדל העיקרי בין JavaScript Action ל-Docker Action מבחינת ביצועים ותמיכה בפלטפורמות?**
JavaScript Actions רצים ישירות על ה-runner ותומכים בכל מערכות ההפעלה (Linux, Windows, macOS) עם ביצועים מהירים; Docker Actions דורשים בניית image (איטי יותר) ותומכים ב-Linux בלבד.

**3. איזה קובץ חובה לכל Custom Action, מכל סוג?**
קובץ `action.yml` (או `action.yaml`) בשורש תיקיית ה-Action, המגדיר `name`, `description`, `inputs`, `outputs`, ו-`runs`.

**4. למה חייבים לציין `shell:` בכל step בתוך Composite Action, בניגוד ל-workflow רגיל?**
כי Composite Action אינו נקשר אוטומטית לברירת מחדל של shell מהקשר ה-runner החיצוני, ולכן חייבים להגדיר אותו במפורש בכל step שמריץ פקודה.

**5. מה תפקידה של חבילת `@actions/core` ב-JavaScript Actions?**
מספקת פונקציות שירות לגישה ל-inputs, כתיבת outputs, לוגים בפורמט מיוחד, וסימון הצלחה/כישלון של ה-Action.

**6. למה מומלץ לארוז JavaScript Action עם `ncc` לפני פרסום?**
כדי לאגד את כל התלויות (כולל `node_modules`) לקובץ JavaScript בודד, כך שלא צריך להתקין תלויות בזמן ריצה - מה שמקצר משמעותית את זמן ההרצה ומונע בעיות תאימות.

**7. מתי כדאי לבחור Docker Action על פני JavaScript Action?**
כאשר ה-Action תלוי בכלים או ספריות מערכת ספציפיות שאינן זמינות כברירת מחדל, או כשרוצים לכתוב את הלוגיקה בשפה שאינה JavaScript (Python, Go, Rust וכו').

**8. מה ההבדל בין תגית `v1.2.3` לתגית נעה `v1`?**
`v1.2.3` היא גרסה מדויקת וקבועה; `v1` היא תגית שהמפרסם מעדכן ידנית להצביע תמיד על הגרסה היציבה האחרונה תחת ה-major הזה, כך שמשתמשים שמצמידים ל-`v1` מקבלים תיקוני באגים אוטומטית בלי לשנות את ה-workflow שלהם.

**9. איך בודקים Custom Action לפני שמפרסמים אותו כריפו נפרד ב-Marketplace?**
משתמשים בו מ-workflow באותו ריפו עם `uses: ./.github/actions/<שם-התיקייה>`, מבלי צורך בריפו נפרד או פרסום רשמי.

**10. מה זה `branding` בקובץ action.yml ולמה הוא רלוונטי?**
שדה אופציונלי שמגדיר אייקון וצבע לייצוג ה-Action בממשק GitHub Marketplace - משפר את המראה המקצועי אך אינו משפיע על הפונקציונליות.

## קישורים חיצוניים

### תיעוד רשמי (GitHub Docs)
- [About custom actions - סקירה כללית של שלושת הסוגים](https://docs.github.com/en/actions/concepts/workflows-and-actions/custom-actions)
- [Creating a composite action - מדריך רשמי](https://docs.github.com/en/actions/sharing-automations/creating-actions/creating-a-composite-action)

### סרטוני יוטיוב מומלצים
- [E5 - GitHub Actions: Write custom Javascript & Docker actions](https://www.youtube.com/watch?v=W-1Zf8lrdxU) - מדריך ידידותי למתחילים
- [Ultimate Guide to GitHub Composite Actions (Complete Walkthrough!)](https://www.youtube.com/watch?v=w8ZALhqoHgs)

---

**במדריך הבא (מדריך 10) - האחרון בסדרה:** אבטחה, Debugging, Best Practices מתקדמים, וריכוז מקיף של שאלות ראיון עבודה נוספות.
