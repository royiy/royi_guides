# מדריך 8: אוטומציית בדיקות (Testing) בפייפליין CI/CD

## פירמידת הבדיקות (Test Pyramid)

```
        /\
       /E2E\          <- מעטות, איטיות, יקרות, שבריריות
      /------\
     /Integr. \       <- כמות בינונית
    /----------\
   /  Unit Tests \    <- הרבה, מהירות, זולות
  /----------------\
```

**עיקרון**: רוב הבדיקות צריכות להיות Unit Tests (מהירות ומבודדות), פחות Integration Tests, ומעט מאוד E2E Tests (איטיות ויקרות אך בודקות את הזרימה המלאה).

## סוגי בדיקות ב-Pipeline

| סוג בדיקה | מה בודק | כלים נפוצים | שלב מומלץ |
|---|---|---|---|
| Unit Test | פונקציה/מחלקה בודדת, מבודדת | Jest, JUnit, PyTest, xUnit | מוקדם, בכל commit |
| Integration Test | אינטגרציה בין רכיבים (DB, API) | Testcontainers, Supertest | אחרי unit |
| Static Analysis / Lint | סגנון קוד, שגיאות פוטנציאליות | ESLint, Pylint, Checkstyle | הכי מוקדם |
| Security (SAST) | פגיעויות בקוד המקור | SonarQube, Semgrep, Snyk Code | מוקדם |
| Contract Test | תאימות API בין שירותים | Pact | לפני integration |
| E2E Test | זרימת משתמש מלאה בדפדפן | Cypress, Playwright, Selenium | לפני deploy לפרודקשן |
| Performance/Load Test | עומס וזמני תגובה | k6, JMeter, Gatling | לפני release גדול |
| Container Scan | פגיעויות ב-Docker image | Trivy, Grype | אחרי build |

## דוגמה: Pipeline עם שכבות בדיקה מרובות

```yaml
name: Test Pipeline
on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run lint

  unit-tests:
    runs-on: ubuntu-latest
    needs: lint
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run test:unit -- --coverage
      - uses: codecov/codecov-action@v4

  integration-tests:
    runs-on: ubuntu-latest
    needs: lint
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run test:integration
        env:
          DATABASE_URL: postgres://postgres:test@localhost:5432/postgres

  e2e-tests:
    runs-on: ubuntu-latest
    needs: [unit-tests, integration-tests]
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

## דוגמת בדיקת Unit (Jest)

```javascript
// sum.test.js
const sum = require('./sum');

test('adds 1 + 2 to equal 3', () => {
  expect(sum(1, 2)).toBe(3);
});
```

## דוגמת בדיקת E2E (Playwright)

```javascript
import { test, expect } from '@playwright/test';

test('user can log in', async ({ page }) => {
  await page.goto('https://staging.myapp.com/login');
  await page.fill('#email', 'test@example.com');
  await page.fill('#password', 'password123');
  await page.click('button[type="submit"]');
  await expect(page.locator('.welcome-message')).toBeVisible();
});
```

## Code Coverage Gate (חסימת Merge אם כיסוי נמוך)

```yaml
- name: Check coverage threshold
  run: |
    COVERAGE=$(npm run test:coverage --silent | grep "All files" | awk '{print $4}' | tr -d '%')
    if (( $(echo "$COVERAGE < 80" | bc -l) )); then
      echo "Coverage $COVERAGE% is below threshold of 80%"
      exit 1
    fi
```

## טיפים וטריקים

1. **הרץ בדיקות מהירות קודם (Fail Fast)** – lint ו-unit tests לפני integration/E2E שאיטיים יותר.
2. **Testcontainers** – הרצת מסדי נתונים/שירותים אמיתיים בקונטיינרים זמניים לבדיקות integration, במקום mocks לא מדויקים.
3. **Flaky Tests** – בדיקות שנכשלות לסירוגין הן אויב מספר 1 של אמון בפייפליין; טפל בהן מיד או סמן אותן (`@flaky`) לבידוד עד תיקון.
4. **Parallel Test Execution** – פצל בדיקות E2E למספר workers כדי לקצר זמן ריצה.
5. **Test Retry עם זהירות** – retry אוטומטי (פעם אחת) לבדיקות E2E יכול לעזור עם flakiness רשתי, אך אל תשתמש בו כדי "להסתיר" bugs אמיתיים.
6. **Snapshot רק כשרלוונטי** – Snapshot testing שימושי ל-UI components אך יכול להפוך לרעש אם לא מתוחזק.
7. **Shift-Left Security** – הרץ SAST/dependency scanning (`npm audit`, `Snyk`) כבר ב-PR, לא רק לפני production.

## שאלות ראיון עבודה נפוצות

**ש: מהי פירמידת הבדיקות (Test Pyramid) ולמה היא חשובה לתכנון Pipeline?**
ת: מודל שממליץ על הרבה Unit Tests זולים ומהירים בבסיס, פחות Integration Tests באמצע, ומעט E2E Tests יקרים ואיטיים בראש. זה מנחה איך לבנות pipeline יעיל – רוב הפידבק מגיע מהר משכבת ה-unit, וה-E2E האיטי רץ רק כשצריך.

**ש: מה זה Flaky Test וכיצד מתמודדים איתו בפייפליין CI/CD?**
ת: בדיקה שנכשלת לפעמים בלי שינוי בקוד – בדרך כלל בגלל race conditions, תלות בזמן, או תלות ברשת. מתמודדים על ידי בידוד/תיוג הבדיקה, תיקון שורש הבעיה, ולעיתים retry מוגבל, אבל לא כפתרון קבוע כי זה פוגע באמינות ה-pipeline.

**ש: מה ההבדל בין Unit Test ל-Integration Test?**
ת: Unit Test בודק יחידת קוד בודדת (פונקציה, מחלקה) במבודד, לרוב עם mocks לתלויות חיצוניות. Integration Test בודק אינטגרציה אמיתית בין רכיבים – למשל קריאה אמיתית למסד נתונים.

**ש: מה זה Code Coverage ומהי המגבלה שלו כמדד איכות?**
ת: אחוז הקוד שמכוסה על ידי בדיקות. המגבלה: כיסוי גבוה לא מבטיח שהבדיקות בודקות תרחישים משמעותיים – ניתן להגיע ל-100% כיסוי עם assertions חלשות. יש להשתמש בו כאינדיקטור, לא כמטרה יחידה.

**ש: איך אתה מריץ בדיקות שדורשות מסד נתונים אמיתי בתוך pipeline מבלי לפגוע בסביבת פרודקשן?**
ת: באמצעות services זמניים בתוך ה-CI job (למשל Postgres container ב-GitHub Actions/GitLab CI) או Testcontainers שמריצים מסד נתונים אמיתי בתוך container מבודד וזמני שנהרס בסוף ה-job.

**ש: מתי היית מוסיף Contract Testing (כמו Pact) לפייפליין?**
ת: בארכיטקטורת microservices, כדי לוודא ששינוי ב-API של שירות אחד לא שובר שירותים אחרים שתלויים בו – ללא צורך בהרצת כל השירותים יחד ב-E2E מלא.

## קישורים חיצוניים

**YouTube:**
- [Test Automation in CI/CD Explained](https://www.youtube.com/results?search_query=test+automation+in+cicd+pipeline)
- [Playwright Full Course](https://www.youtube.com/results?search_query=playwright+full+course)
- [Testcontainers Tutorial](https://www.youtube.com/results?search_query=testcontainers+tutorial)

**דוקומנטציה:**
- [Playwright Docs](https://playwright.dev/docs/intro)
- [Testcontainers Docs](https://testcontainers.com/)
- [Martin Fowler – Test Pyramid](https://martinfowler.com/bliki/TestPyramid.html)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
