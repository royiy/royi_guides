# מדריך 4: GitHub Actions – מדריך מלא

## מה זה GitHub Actions?

פלטפורמת CI/CD מובנית בתוך GitHub, המאפשרת להריץ workflows אוטומטיים בתגובה לאירועים ברפוזיטורי (push, PR, issue, schedule ועוד). מוגדרת בקבצי YAML תחת `.github/workflows/`.

## מושגי יסוד

- **Workflow** – קובץ YAML שמגדיר תהליך אוטומטי שלם.
- **Event** – טריגר שמפעיל workflow (push, pull_request, schedule, workflow_dispatch).
- **Job** – קבוצת steps שרצה על runner אחד. Jobs שונים רצים במקביל כברירת מחדל (אלא אם יש `needs`).
- **Step** – פקודה בודדת או שימוש ב-Action מוכן.
- **Action** – יחידת קוד לשימוש חוזר (למשל `actions/checkout@v4`).
- **Runner** – המכונה שמריצה את ה-job (GitHub-hosted או self-hosted).

## דוגמה בסיסית

```yaml
name: CI
on:
  push:
    branches: [main]
  pull_request:

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
      - run: npm test
```

## Pipeline מתקדם: Build, Test, Docker Push, Deploy

```yaml
name: Full CI/CD Pipeline
on:
  push:
    branches: [main]
    tags: ['v*']

env:
  IMAGE_NAME: ghcr.io/myorg/myapp

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
      - run: npm ci
      - run: npm test

  build-and-push:
    needs: test
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v4
      - name: Log in to GHCR
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          push: true
          tags: ${{ env.IMAGE_NAME }}:${{ github.sha }}

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Deploy to Kubernetes
        run: |
          kubectl set image deployment/myapp \
            myapp=${{ env.IMAGE_NAME }}:${{ github.sha }} -n production
```

### הסבר על `strategy.matrix` (Matrix Builds)

מריץ את אותו job כמה פעמים עם משתנים שונים (גרסאות שפה, מערכות הפעלה) במקביל – חוסך זמן ומעלה כיסוי בדיקות.

### הסבר על `needs`

יוצר תלות בין jobs – `deploy` ירוץ רק אחרי ש-`build-and-push` הצליח, וזה רק אחרי ש-`test` הצליח.

### הסבר על `environment`

מאפשר להגדיר Environment ב-GitHub עם protection rules (למשל דרישת אישור ידני, secrets ייעודיים לסביבה).

## GitHub Secrets

```yaml
steps:
  - name: Deploy
    env:
      API_KEY: ${{ secrets.API_KEY }}
    run: ./deploy.sh
```

סודות מוגדרים תחת Settings -> Secrets and variables -> Actions, ולעולם לא מודפסים ב-logs (GitHub מסתיר אוטומטית ערכים תואמים).

## Reusable Workflows

```yaml
# .github/workflows/reusable-build.yml
on:
  workflow_call:
    inputs:
      node-version:
        type: string
        default: '20'
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ inputs.node-version }}
      - run: npm ci && npm run build
```

```yaml
# workflow אחר קורא לו:
jobs:
  call-build:
    uses: ./.github/workflows/reusable-build.yml
    with:
      node-version: '18'
```

## Custom Composite Action

```yaml
# .github/actions/setup-project/action.yml
name: 'Setup Project'
runs:
  using: 'composite'
  steps:
    - uses: actions/setup-node@v4
      with:
        node-version: '20'
    - run: npm ci
      shell: bash
```

## טיפים וטריקים

1. **Caching** – השתמש ב-`cache: npm` בתוך `setup-node`, או ב-`actions/cache` לתלויות אחרות – חוסך דקות בכל run.
2. **Concurrency** – בטל runs ישנים אוטומטית כשיש push חדש לאותו PR:
```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```
3. **`GITHUB_TOKEN` אוטומטי** – GitHub מזריק טוקן זמני אוטומטי לכל workflow, אין צורך ביצירת PAT לפעולות בסיסיות.
4. **Job Summary** – השתמש ב-`$GITHUB_STEP_SUMMARY` כדי להציג דוחות יפים בעמוד ה-Actions.
5. **Self-Hosted Runners** – לעבודות כבדות (GPU, hardware ייעודי) או דרישות רשת פנימית.
6. **`workflow_dispatch`** – מאפשר הרצה ידנית עם פרמטרים מותאמים אישית מה-UI.

## שאלות ראיון עבודה נפוצות

**ש: מה ההבדל בין Job ל-Step ב-GitHub Actions?**
ת: Job הוא יחידת עבודה שרצה על runner נפרד (יכול לרוץ במקביל ל-jobs אחרים); Step הוא פקודה בודדת בתוך job, שרץ ברצף על אותו runner ומשתף filesystem.

**ש: איך מריצים jobs במקביל מול ברצף?**
ת: כברירת מחדל כל ה-jobs רצים במקביל; כדי ליצור סדר יש להשתמש במפתח `needs: [job-name]`.

**ש: מה זה Reusable Workflow ואיך הוא שונה מ-Composite Action?**
ת: Reusable Workflow (`workflow_call`) מאפשר לקרוא לworkflow שלם עם jobs מרובים ממקום אחר. Composite Action מאגד סדרת steps ליחידה אחת לשימוש בתוך job בודד. Reusable Workflows גמישים יותר לתרחישים מורכבים.

**ש: איך מנהלים secrets שונים לסביבות שונות (staging/production)?**
ת: באמצעות GitHub Environments – כל environment יכול להחזיק סטים משלו של secrets ו-variables, וגם protection rules כמו required reviewers.

**ש: מה זה `GITHUB_TOKEN` ואיך הוא שונה מ-Personal Access Token?**
ת: `GITHUB_TOKEN` הוא טוקן זמני שנוצר אוטומטית לכל הרצת workflow עם הרשאות מוגבלות לאותו repo, ונמחק בסיום הריצה. PAT הוא טוקן קבוע שהמשתמש יוצר ידנית עם הרשאות רחבות יותר.

**ש: איך אתה מונע הרצה מיותרת (redundant) כשמשתמש דוחף כמה commits מהר?**
ת: באמצעות `concurrency` group עם `cancel-in-progress: true`, כדי לבטל את הריצה הישנה ולהתחיל בחדשה.

## קישורים חיצוניים

**YouTube:**
- [GitHub Actions Tutorial – TechWorld with Nana](https://www.classcentral.com/course/youtube-github-actions-tutorial-basic-concepts-and-ci-cd-pipeline-with-docker-108868)
- [GitHub Actions Full Course for Beginners](https://www.youtube.com/results?search_query=github+actions+full+course)

**דוקומנטציה:**
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Workflow Syntax Reference](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [GitHub Marketplace – Actions](https://github.com/marketplace?type=actions)
- [Reusable Workflows Docs](https://docs.github.com/en/actions/using-workflows/reusing-workflows)
