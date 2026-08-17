# מדריך 8: עבודה עם Docker ו-Containers ב-GitHub Actions

> מדריך 8 מתוך 10 בסדרת המדריכים המקיפה ל-GitHub Actions בעברית.

## תוכן עניינים

1. [שני שימושים שונים ב-Docker ב-Actions](#שני-שימושים-שונים-ב-docker-ב-actions)
2. [בניית ודחיפת Docker Image](#בניית-ודחיפת-docker-image)
3. [רישום ל-registries שונים](#רישום-ל-registries-שונים)
4. [הרצת Job בתוך Container](#הרצת-job-בתוך-container)
5. [Service Containers - מסדי נתונים לבדיקות](#service-containers---מסדי-נתונים-לבדיקות)
6. [Multi-stage build ו-Caching של שכבות](#multi-stage-build-ו-caching-של-שכבות)
7. [Multi-architecture builds](#multi-architecture-builds)
8. [טיפים וטריקים](#טיפים-וטריקים)
9. [שאלות ראיון עבודה](#שאלות-ראיון-עבודה)
10. [קישורים חיצוניים](#קישורים-חיצוניים)

---

## שני שימושים שונים ב-Docker ב-Actions

חשוב להבחין בין שני שימושים שונים לחלוטין של Docker בהקשר של GitHub Actions:

1. **בניית ופרסום Docker images** כחלק מה-pipeline (הנפוץ ביותר) - למשל בניית image של האפליקציה ופרסום ל-Docker Hub / GHCR.
2. **הרצת steps או jobs בתוך container** - שימוש ב-Docker כסביבת ריצה (runtime environment) ל-workflow עצמו.

## בניית ודחיפת Docker Image

הדרך הסטנדרטית והמומלצת ביותר משתמשת ב-Actions הרשמיים של Docker:

```yaml
name: Docker Build and Push

on:
  push:
    branches: [main]
    tags: ['v*']

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    steps:
      - name: משיכת קוד
        uses: actions/checkout@v4

      - name: הגדרת Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: התחברות ל-Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ vars.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      - name: חילוץ מטא-דאטה (tags, labels) אוטומטי
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: myorg/myapp
          tags: |
            type=ref,event=branch
            type=semver,pattern={{version}}
            type=sha

      - name: בניה ודחיפה
        uses: docker/build-push-action@v6
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

## רישום ל-registries שונים

### Docker Hub

```yaml
- uses: docker/login-action@v3
  with:
    username: ${{ vars.DOCKERHUB_USERNAME }}
    password: ${{ secrets.DOCKERHUB_TOKEN }}
```

### GitHub Container Registry (GHCR) - ללא הגדרת secret נוסף

```yaml
permissions:
  packages: write
  contents: read

steps:
  - uses: docker/login-action@v3
    with:
      registry: ghcr.io
      username: ${{ github.actor }}
      password: ${{ secrets.GITHUB_TOKEN }}

  - uses: docker/build-push-action@v6
    with:
      push: true
      tags: ghcr.io/${{ github.repository }}:latest
```

היתרון של GHCR: אין צורך ב-secret נפרד כלל, כי `GITHUB_TOKEN` המובנה מספק גישה מספקת (בכפוף להרשאות `packages: write`).

### AWS ECR

```yaml
- uses: aws-actions/configure-aws-credentials@v4
  with:
    role-to-assume: arn:aws:iam::123456789012:role/github-actions-ecr
    aws-region: eu-central-1

- id: ecr-login
  uses: aws-actions/amazon-ecr-login@v2

- uses: docker/build-push-action@v6
  with:
    push: true
    tags: ${{ steps.ecr-login.outputs.registry }}/myapp:latest
```

## הרצת Job בתוך Container

במקום להריץ ישירות על ה-VM (`ubuntu-latest`), אפשר "לעטוף" job שלם בתוך container, לשליטה מדויקת בסביבת הריצה:

```yaml
jobs:
  test-in-python-container:
    runs-on: ubuntu-latest
    container:
      image: python:3.12-slim
      env:
        DATABASE_URL: postgres://user:pass@postgres:5432/testdb
      options: --cpus 2 --memory 4g
    steps:
      - uses: actions/checkout@v4
      - run: pip install -r requirements.txt
      - run: pytest
```

זה שימושי מאוד כאשר צריך גרסה מדויקת של שפה/כלים שלא זמינה כברירת מחדל ב-runner, או כדי להבטיח עקביות מלאה בין סביבת הפיתוח המקומית ל-CI.

## Service Containers - מסדי נתונים לבדיקות

Service containers מריצים תלויות נלוות (מסד נתונים, cache, message queue) **לצד** ה-job הראשי, ברשת פנימית משותפת:

```yaml
jobs:
  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_USER: testuser
          POSTGRES_PASSWORD: testpass
          POSTGRES_DB: testdb
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

      redis:
        image: redis:7
        ports:
          - 6379:6379

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - name: הרצת בדיקות אינטגרציה
        run: npm run test:integration
        env:
          DATABASE_URL: postgres://testuser:testpass@localhost:5432/testdb
          REDIS_URL: redis://localhost:6379
```

שימו לב ל-`options` עם `--health-cmd` - זה מבטיח שה-job ימתין עד שה-service באמת "בריא" ומוכן, לפני שהבדיקות מתחילות.

## Multi-stage build ו-Caching של שכבות

Dockerfile לדוגמה עם multi-stage build:

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
CMD ["node", "dist/index.js"]
```

ו-workflow עם caching של שכבות Docker באמצעות GitHub Actions cache backend (`type=gha`):

```yaml
- uses: docker/build-push-action@v6
  with:
    context: .
    push: true
    tags: myapp:latest
    cache-from: type=gha
    cache-to: type=gha,mode=max
```

זה מאיץ משמעותית ריצות חוזרות, כי שכבות Docker שלא השתנו נשלפות מהקאש במקום להיבנות מחדש.

## Multi-architecture builds

```yaml
jobs:
  build-multi-arch:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: docker/setup-qemu-action@v3   # אמולציה לארכיטקטורות שונות

      - uses: docker/setup-buildx-action@v3

      - uses: docker/login-action@v3
        with:
          username: ${{ vars.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      - uses: docker/build-push-action@v6
        with:
          context: .
          platforms: linux/amd64,linux/arm64
          push: true
          tags: myorg/myapp:latest
```

בנייה יחידה שיוצרת manifest רב-ארכיטקטורתי, כך שהמשתמשים מקבלים אוטומטית את הגרסה המתאימה למחשב שלהם (Intel/AMD או ARM).

## טיפים וטריקים

1. **תמיד השתמשו ב-`docker/build-push-action` הרשמי** במקום `docker build && docker push` ידני - הוא כולל caching מובנה ותמיכה ב-multi-platform.

2. **`cache-from: type=gha` חוסך זמן בנייה משמעותי** - שכבות Docker שלא השתנו לא נבנות מחדש בכל ריצה.

3. **שימוש ב-`.dockerignore`** - חיוני כדי לא לגרור קבצים מיותרים (node_modules, .git) לתוך ה-build context, מה שמאט את הבנייה.

4. **הימנעות מהרצה כ-root בתוך container** - הוסיפו `USER node` (או משתמש לא-root מתאים) ב-Dockerfile מטעמי אבטחה.

5. **בדיקת תקינות של service containers עם `--health-cmd`** - מונע race condition שבו הבדיקות מתחילות לפני שהמסד נתונים באמת מוכן.

6. **סריקת אבטחה ל-images** - שקלו הוספת `docker/scout-action` או `aquasecurity/trivy-action` לזיהוי חולשות ידועות בתמונה שנבנתה.

## שאלות ראיון עבודה

**1. מה ההבדל בין `container:` ברמת job לבין `services:`?**
`container:` גורם לכל ה-job לרוץ בתוך אותו container; `services:` מריץ containers נוספים **לצד** ה-job (למשל מסד נתונים), נגישים ברשת פנימית משותפת, בעוד ה-job עצמו רץ ישירות על ה-runner (או container אחר).

**2. למה כדאי להשתמש ב-GHCR (GitHub Container Registry) במקום Docker Hub?**
GHCR מאפשר אינטגרציה מלאה עם `GITHUB_TOKEN` המובנה, ללא צורך ביצירת secret נפרד וניהול הרשאות חיצוני - ומקיים בקרת גישה משולבת עם הרשאות הריפו.

**3. מה עושה `docker/setup-qemu-action` בהקשר של multi-architecture builds?**
מתקין אמולטורים שמאפשרים ל-runner (שהוא לרוב amd64) לבנות תמונות עבור ארכיטקטורות אחרות, כמו arm64, ללא צורך במכונה פיזית מאותה ארכיטקטורה.

**4. איך מוודאים ש-job לא מתחיל לרוץ בדיקות לפני שה-service container (כמו PostgreSQL) מוכן?**
באמצעות health checks בהגדרת ה-`options` של ה-service (כמו `--health-cmd pg_isready`), שגורמים ל-runner להמתין עד שה-container "בריא" לפני שהצעדים מתחילים לרוץ.

**5. מהו multi-stage build ב-Docker ולמה הוא שימושי ב-CI/CD?**
טכניקה שבה ה-Dockerfile מכיל כמה שלבי בנייה (stages), כאשר רק הפלט הסופי (למשל dist/ ו-node_modules הנחוצים) מועתק לתמונה הסופית - מה שמקטין משמעותית את גודל ה-image הסופי ומשפר אבטחה.

**6. מה זה `cache-from: type=gha` ו-`cache-to: type=gha`?**
מנגנון caching של שכבות Docker שמשתמש ב-GitHub Actions cache backend, כדי לצמצם זמן בנייה חוזר על ידי שימוש חוזר בשכבות שלא השתנו בין ריצות.

**7. איך פורסים תמונת Docker אחת לכמה ארכיטקטורות (amd64 ו-arm64) בו-זמנית?**
באמצעות `docker/build-push-action` עם הפרמטר `platforms: linux/amd64,linux/arm64` בשילוב עם `docker/setup-qemu-action` ו-`docker/setup-buildx-action`.

**8. מה החשיבות של `.dockerignore` בהקשר של ביצועי CI?**
מונע העתקת קבצים לא נחוצים (כמו `.git`, `node_modules` מקומי) ל-build context, מה שמקצר את זמן העברת הקונטקסט ל-Docker daemon ומזרז את הבנייה.

**9. למה לא מומלץ להריץ תהליכים בתוך container כ-root?**
מטעמי אבטחה - אם ה-container נפרץ, הרצה כ-root מעניקה לתוקף הרשאות רחבות יותר בתוך הסביבה. יש להגדיר משתמש ייעודי לא-privileged ב-Dockerfile.

**10. מה ההבדל בין בניית image "רגילה" ל-build עם BuildKit/Buildx?**
Buildx (מבוסס BuildKit) תומך ב-caching מתקדם, בנייה מקבילית של שכבות, multi-platform builds, ואינטגרציה טובה יותר עם GitHub Actions cache - לעומת ה-Docker builder הישן שאינו תומך בכל אלה.

## קישורים חיצוניים

### תיעוד רשמי (GitHub Docs)
- [Workflow syntax for GitHub Actions - כולל container ו-services](https://docs.github.com/actions/using-workflows/workflow-syntax-for-github-actions)
- [Dependency caching reference](https://docs.github.com/en/actions/reference/workflows-and-actions/dependency-caching)

### סרטוני יוטיוב מומלצים
- [GitHub Actions Tutorial | From Zero to Hero in 90 minutes](https://www.youtube.com/watch?v=TLB5MY9BBa4) - כולל דוגמת Docker מלאה
- [Complete GitHub Actions Course - From BEGINNER to PRO](https://www.youtube.com/watch?v=Xwpi0ITkL3U)

---

**במדריך הבא (מדריך 9):** נלמד ליצור Custom Actions משלכם - JavaScript Actions, Docker Actions, ו-Composite Actions.
