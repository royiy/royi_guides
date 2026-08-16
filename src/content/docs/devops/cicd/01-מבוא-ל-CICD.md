# מדריך 1: מבוא ל-CI/CD – מושגי יסוד

## מה זה CI/CD?

**CI (Continuous Integration – אינטגרציה רציפה)** הוא תהליך שבו מפתחים משלבים (merge) קוד לענף משותף (בדרך כלל `main`) לעיתים קרובות – כמה פעמים ביום. בכל שילוב כזה, מריצים אוטומטית:
- בנייה (Build) של הקוד
- בדיקות יחידה (Unit Tests)
- בדיקות סטטיות (Linting, Static Analysis)

המטרה: לתפוס באגים ובעיות אינטגרציה מוקדם ככל האפשר, ולא לחכות "לרגע האינטגרציה הגדול" בסוף הפרויקט.

**CD** יכול להתפרש בשתי דרכים:
- **Continuous Delivery (מסירה רציפה)** – כל שינוי שעובר את שלב ה-CI מוכן לפריסה, אך הפריסה בפועל לסביבת הפרודקשן דורשת אישור ידני (Manual Approval).
- **Continuous Deployment (פריסה רציפה)** – כל שינוי שעובר את כל שלבי הבדיקה נפרס אוטומטית לפרודקשן, ללא התערבות אדם.

## למה זה חשוב?

1. **מהירות** – שחרור פיצ'רים ותיקוני באגים תוך דקות במקום שבועות.
2. **איכות** – בדיקות אוטומטיות רצות על כל שינוי, כך שבאגים נתפסים מיד.
3. **צמצום סיכון** – שינויים קטנים ותכופים קלים יותר לניפוי (debug) משחרור ענק חד-פעמי.
4. **שקיפות** – כל הצוות רואה את מצב הבנייה (build status) בזמן אמת.

## אנטומיה של Pipeline טיפוסי

```
קוד -> Push ל-Git -> Trigger -> Build -> Test -> Package -> Deploy to Staging -> בדיקות נוספות -> Deploy to Production
```

### שלבים נפוצים (Stages)

| שלב | תיאור | דוגמה לכלים |
|---|---|---|
| Checkout | משיכת הקוד מה-Repository | Git |
| Build | קומפילציה/בנייה של האפליקציה | Maven, Gradle, npm, webpack |
| Unit Test | בדיקות יחידה | JUnit, Jest, PyTest |
| Static Analysis | סריקת קוד לאיכות ואבטחה | SonarQube, ESLint |
| Package | יצירת ארטיפקט (jar, docker image) | Docker, npm pack |
| Deploy to Staging | פריסה לסביבת בדיקות | Kubernetes, Ansible |
| Integration/E2E Tests | בדיקות מקצה לקצה | Selenium, Cypress, Playwright |
| Deploy to Production | פריסה לסביבת ייצור | ArgoCD, Spinnaker, Helm |

## דוגמה מינימלית – GitHub Actions

```yaml
name: CI Pipeline
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
      - run: npm test
```

## עקרונות מפתח (Best Practices)

- **Fail Fast** – הרץ קודם את הבדיקות המהירות (lint, unit tests) לפני בדיקות איטיות (E2E).
- **Idempotency** – ה-pipeline צריך לתת תוצאה זהה בכל הרצה עם אותו קלט.
- **Pipeline as Code** – הגדרת ה-pipeline צריכה לשבת בקוד (YAML) בתוך ה-repo, לא בהגדרות UI ידניות.
- **Artifact Once, Deploy Everywhere** – בנה ארטיפקט (למשל Docker image) פעם אחת, והשתמש בו בכל הסביבות (dev/staging/prod) כדי להבטיח עקביות.
- **Secrets Management** – לעולם לא לשמור סודות (API keys, passwords) בקוד; להשתמש ב-Secret Managers (Vault, AWS Secrets Manager, GitHub Secrets).

## טיפים וטריקים

1. **Cache תלויות** – שמירת cache של `node_modules`/`.m2`/`pip` מקצרת זמני build משמעותית.
2. **Parallel Jobs** – הרץ בדיקות שונות (unit, lint, security scan) במקביל ולא בסדרה.
3. **Matrix Builds** – בדוק את הקוד על מספר גרסאות (Node 18/20, Python 3.10/3.11) במקביל.
4. **Branch Protection Rules** – אל תאפשר מיזוג ל-`main` בלי שה-CI עבר בהצלחה.
5. **Notifications** – חבר Slack/Teams ל-pipeline כדי לקבל התראות על כשלים מיידית.

## שאלות ראיון עבודה נפוצות

**ש: מה ההבדל בין Continuous Delivery ל-Continuous Deployment?**
ת: ב-Delivery יש אישור ידני לפני הפריסה לפרודקשן, ואילו ב-Deployment הפריסה אוטומטית לחלוטין ללא מגע יד אדם, בתנאי שכל הבדיקות עברו.

**ש: מהו "Pipeline as Code" ולמה זה חשוב?**
ת: הגדרת שלבי ה-CI/CD כקובץ קוד (למשל `Jenkinsfile` או `.github/workflows/*.yml`) שנשמר יחד עם הקוד ב-Git. זה מאפשר גרסאות, code review על השינויים בפייפליין עצמו, ושחזור קל.

**ש: מהם היתרונות של CI/CD מבחינת עסקית?**
ת: זמן שחרור (time-to-market) מהיר יותר, פחות באגים בפרודקשן, יכולת rollback מהירה, ושיפור שיתוף הפעולה בין Dev ל-Ops.

**ש: מה זה "Shift Left" בהקשר של CI/CD?**
ת: הזזת בדיקות (איכות, אבטחה) לשלב מוקדם ככל האפשר בתהליך הפיתוח, כדי לתפוס בעיות מוקדם וזול יותר.

**ש: תאר תרחיש שבו pipeline נכשל – איך היית מנפה (debug) אותו?**
ת: בדיקת ה-logs של השלב שנכשל, שחזור מקומי (local reproduction) של הפקודה שנכשלה, בדיקת גרסאות תלויות, ווידוא שאין הבדל סביבתי (env vars, secrets) בין המקומי ל-CI.

## קישורים חיצוניים

**YouTube:**
- [CI/CD Full Course – Simplilearn](https://www.youtube.com/watch?v=h9K1NnqwUvE)
- [ערוץ TechWorld with Nana – DevOps & CI/CD](https://www.youtube.com/c/TechWorldwithNana)
- [CI/CD Tutorials Playlist](https://www.youtube.com/playlist?list=PLy7NrYWoggjzSIlwxeBbcgfAdYoxCIrM2)

**דוקומנטציה:**
- [Atlassian – CI/CD Explained](https://www.atlassian.com/continuous-delivery/continuous-integration)
- [Red Hat – What is CI/CD?](https://www.redhat.com/en/topics/devops/what-is-ci-cd)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
