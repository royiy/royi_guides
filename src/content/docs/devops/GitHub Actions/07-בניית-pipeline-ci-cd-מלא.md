# מדריך 7: בניית Pipeline מלא של CI/CD

> מדריך 7 מתוך 10 בסדרת המדריכים המקיפה ל-GitHub Actions בעברית.

## תוכן עניינים

1. [עקרונות ה-CI/CD](#עקרונות-ה-cicd)
2. [שלב 1: Continuous Integration (CI)](#שלב-1-continuous-integration-ci)
3. [שלב 2: Continuous Delivery/Deployment (CD)](#שלב-2-continuous-deliverydeployment-cd)
4. [Pipeline מלא: Node.js לפרודקשן](#pipeline-מלא-nodejs-לפרודקשן)
5. [אסטרטגיות פריסה: Staging → Production](#אסטרטגיות-פריסה-staging--production)
6. [Reusable Workflows לצמצום כפילות](#reusable-workflows-לצמצום-כפילות)
7. [Rollback אוטומטי במקרה כישלון](#rollback-אוטומטי-במקרה-כישלון)
8. [טיפים וטריקים](#טיפים-וטריקים)
9. [שאלות ראיון עבודה](#שאלות-ראיון-עבודה)
10. [קישורים חיצוניים](#קישורים-חיצוניים)

---

## עקרונות ה-CI/CD

- **Continuous Integration (CI)** - כל שינוי קוד עובר אוטומטית בנייה ובדיקות, כדי לתפוס בעיות מוקדם ככל האפשר.
- **Continuous Delivery** - הקוד תמיד נמצא במצב "ניתן לפריסה", אך הפריסה בפועל דורשת אישור ידני.
- **Continuous Deployment** - כל שינוי שעובר את כל הבדיקות נפרס אוטומטית לפרודקשן, ללא התערבות אנושית.

GitHub Actions תומך בכל שלושת הגישות - הבחירה תלויה ברמת הבשלות והביטחון של הצוות בתהליכי הבדיקה.

## שלב 1: Continuous Integration (CI)

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint

  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20, 22]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      - run: npm ci
      - run: npm test -- --coverage

  build:
    runs-on: ubuntu-latest
    needs: [lint, test]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with:
          name: production-build
          path: dist/
```

## שלב 2: Continuous Delivery/Deployment (CD)

```yaml
name: CD

on:
  workflow_run:
    workflows: ["CI"]
    types: [completed]
    branches: [main]

jobs:
  deploy-staging:
    if: github.event.workflow_run.conclusion == 'success'
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v4
      - name: הורדת תוצרי בנייה
        uses: actions/download-artifact@v4
        with:
          name: production-build
          github-token: ${{ secrets.GITHUB_TOKEN }}
          run-id: ${{ github.event.workflow_run.id }}
      - run: ./deploy-to-staging.sh

  deploy-production:
    needs: deploy-staging
    runs-on: ubuntu-latest
    environment: production   # דורש אישור ידני, ראו מדריך 4
    steps:
      - run: ./deploy-to-production.sh
```

## Pipeline מלא: Node.js לפרודקשן

דוגמה מקיפה שמשלבת הכול בקובץ workflow אחד - בנייה, בדיקות, Docker, ופריסה מדורגת:

```yaml
name: Full CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

permissions:
  contents: read
  packages: write

env:
  IMAGE_NAME: myorg/myapp

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm test

  build-and-push:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    outputs:
      image-tag: ${{ steps.meta.outputs.tag }}
    steps:
      - uses: actions/checkout@v4

      - id: meta
        run: echo "tag=${{ github.sha }}" >> "$GITHUB_OUTPUT"

      - uses: docker/setup-buildx-action@v3

      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: בניה ודחיפה ל-GitHub Container Registry
        uses: docker/build-push-action@v6
        with:
          context: .
          push: true
          tags: |
            ghcr.io/${{ env.IMAGE_NAME }}:${{ steps.meta.outputs.tag }}
            ghcr.io/${{ env.IMAGE_NAME }}:latest

  deploy-staging:
    needs: build-and-push
    runs-on: ubuntu-latest
    environment:
      name: staging
      url: https://staging.myapp.com
    steps:
      - name: פריסה לסביבת staging
        run: |
          echo "פורס תמונה ghcr.io/${{ env.IMAGE_NAME }}:${{ needs.build-and-push.outputs.image-tag }} ל-staging"
          # פקודת פריסה בפועל תלויה בפלטפורמה (kubectl, ssh, וכו')

  smoke-test-staging:
    needs: deploy-staging
    runs-on: ubuntu-latest
    steps:
      - name: בדיקת עשן על staging
        run: curl -f https://staging.myapp.com/health

  deploy-production:
    needs: smoke-test-staging
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://myapp.com
    steps:
      - name: פריסה לפרודקשן
        run: |
          echo "פורס תמונה ghcr.io/${{ env.IMAGE_NAME }}:${{ needs.build-and-push.outputs.image-tag }} לפרודקשן"
```

תרשים הזרימה של ה-Pipeline הזה:

```
test ──> build-and-push ──> deploy-staging ──> smoke-test-staging ──> deploy-production
```

## אסטרטגיות פריסה: Staging → Production

הגישה המומלצת ביותר היא **הדרגתיות** (progressive deployment):

1. **CI על כל PR** - בדיקות ולינטינג בלבד, בלי פריסה.
2. **פריסה אוטומטית ל-staging** בכל merge ל-`main`.
3. **בדיקות עשן (smoke tests)** על staging - וידוא שהשירות עונה, endpoints קריטיים עובדים.
4. **אישור ידני (או אוטומטי, תלוי ברמת הבשלות) לפרודקשן** דרך `environment: production` עם required reviewers.
5. **מוניטורינג אחרי פריסה** - התראה אוטומטית אם ה-error rate עולה.

## Reusable Workflows לצמצום כפילות

כאשר יש כמה ריפוזיטוריז עם pipeline דומה, אפשר להגדיר workflow אחד לשימוש חוזר:

```yaml
# .github/workflows/reusable-deploy.yml
name: Reusable Deploy

on:
  workflow_call:
    inputs:
      environment:
        required: true
        type: string
      image-tag:
        required: true
        type: string
    secrets:
      DEPLOY_TOKEN:
        required: true

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: ${{ inputs.environment }}
    steps:
      - run: ./deploy.sh --tag ${{ inputs.image-tag }}
        env:
          TOKEN: ${{ secrets.DEPLOY_TOKEN }}
```

וקריאה אליו מ-workflow אחר:

```yaml
jobs:
  call-deploy-staging:
    uses: ./.github/workflows/reusable-deploy.yml
    with:
      environment: staging
      image-tag: ${{ github.sha }}
    secrets:
      DEPLOY_TOKEN: ${{ secrets.STAGING_DEPLOY_TOKEN }}
```

## Rollback אוטומטי במקרה כישלון

```yaml
jobs:
  deploy-production:
    runs-on: ubuntu-latest
    environment: production
    steps:
      - id: deploy
        run: ./deploy.sh
        continue-on-error: true

      - name: בדיקת תקינות אחרי פריסה
        id: health-check
        if: steps.deploy.outcome == 'success'
        run: curl -f https://myapp.com/health
        continue-on-error: true

      - name: Rollback אוטומטי במקרה כישלון
        if: steps.deploy.outcome == 'failure' || steps.health-check.outcome == 'failure'
        run: ./rollback.sh
```

## טיפים וטריקים

1. **הפרדה בין CI ל-CD כשני workflows נפרדים** - מקל על תחזוקה ומאפשר להריץ CD גם ידנית במידת הצורך.

2. **תמיד הריצו smoke test אחרי פריסה** - אפילו בדיקה בסיסית ל-`/health` endpoint תופסת שגיאות פריסה קריטיות מוקדם.

3. **שימוש ב-`environment.url`** - מציג לינק ישיר לסביבה בממשק GitHub, נוח מאוד לביקורת מהירה.

4. **תיוג תמונות Docker עם git SHA, לא רק `latest`** - מאפשר rollback מדויק לגרסה ספציפית.

5. **הימנעות מ-deployment ישיר מ-PR** - פריסה לפרודקשן צריכה לקרות רק אחרי merge ל-`main`, לעולם לא מ-PR פתוח.

6. **תיעוד כל פריסה** - שקלו הוספת שלב שיוצר release note אוטומטי או רושם את הפריסה בכלי ניטור.

## שאלות ראיון עבודה

**1. מה ההבדל בין Continuous Delivery ל-Continuous Deployment?**
ב-Continuous Delivery הקוד תמיד "מוכן" לפריסה אך דורש אישור ידני; ב-Continuous Deployment הפריסה קורית אוטומטית לגמרי, ללא התערבות אנושית, לאחר שכל הבדיקות עוברות.

**2. איך בונים Pipeline שמריץ CI על כל PR אך פורס רק מ-main?**
משתמשים בטריגר `pull_request` לבדיקות בלבד, ומגבילים את jobs הפריסה בתנאי `if: github.ref == 'refs/heads/main'` או ע"י triggers נפרדים (`push` ל-main בלבד).

**3. למה כדאי לתייג תמונת Docker עם git SHA ולא רק `latest`?**
כדי לאפשר מעקב מדויק ו-rollback לגרסה קודמת ספציפית - עם `latest` בלבד אין דרך לדעת בדיוק איזה קוד רץ בפועל.

**4. מה זה smoke test ולמה משלבים אותו אחרי deploy ל-staging?**
בדיקה מהירה ובסיסית (למשל endpoint `/health`) שמוודאת שהשירות עלה ועובד לפני שממשיכים לשלב הבא ב-pipeline (כמו פריסה לפרודקשן).

**5. איך אפשר לממש rollback אוטומטי ב-GitHub Actions?**
באמצעות `continue-on-error: true` בשלב הפריסה ובדיקת התקינות, ולאחר מכן `if: steps.<id>.outcome == 'failure'` שמפעיל סקריפט rollback.

**6. מה זה reusable workflow ואיך הוא מצמצם כפילות?**
Workflow שמוגדר עם `on: workflow_call` וניתן "לקרוא" אליו מ-workflows אחרים (גם בריפוזיטוריז שונים), במקום להעתיק את אותה לוגיקה בכמה מקומות.

**7. מה ההבדל בין הפעלת CD דרך `workflow_run` לבין הרצתו כחלק מאותו workflow כמו CI?**
`workflow_run` מפריד לחלוטין בין ה-workflows ומאפשר CD לרוץ רק לאחר סיום מוצלח מובהק של CI, כולל גישה שונה ל-permissions; שילוב הכול באותו workflow פשוט יותר לתחזוקה אך פחות גמיש בהפרדת אחריות.

**8. איך מוודאים שפריסה לפרודקשן מחייבת אישור אנושי לפני ביצוע?**
באמצעות `environment: production` עם "required reviewers" מוגדרים בהגדרות ה-Environment בממשק GitHub.

**9. מה הסיכון בפריסה ישירה מ-Pull Request לפני merge?**
קוד לא סקור (unreviewed) עלול להגיע לפרודקשן, ובנוסף PR מ-fork חיצוני עלול לא לקבל גישה נדרשת ל-secrets, מה שעלול לגרום להתנהגות בלתי צפויה.

**10. מהם השלבים הטיפוסיים ב-pipeline מלא מקוד ועד פרודקשן?**
Lint → Test → Build → Push image → Deploy to staging → Smoke test → Manual approval → Deploy to production.

## קישורים חיצוניים

### תיעוד רשמי (GitHub Docs)
- [Reuse workflows](https://docs.github.com/en/actions/how-tos/reuse-automations/reuse-workflows)
- [Workflow syntax for GitHub Actions](https://docs.github.com/actions/using-workflows/workflow-syntax-for-github-actions)
- [Events that trigger workflows](https://docs.github.com/actions/using-workflows/events-that-trigger-workflows)

### סרטוני יוטיוב מומלצים
- [GitHub Actions Tutorial | From Zero to Hero in 90 minutes](https://www.youtube.com/watch?v=TLB5MY9BBa4)
- [Complete GitHub Actions Course - From BEGINNER to PRO](https://www.youtube.com/watch?v=Xwpi0ITkL3U)
- [GitHub Actions: For Absolute Beginners](https://www.youtube.com/watch?v=Y4lEVoOeKT8)

---

**במדריך הבא (מדריך 8):** נעבור לעבודה עם Docker ו-Containers ב-GitHub Actions - מבנייה ועד פרסום ל-registries שונים.
