---
title: "Docker בפייפליינים של CI/CD"
category: DevOps/CI-CD
part: 6/10
---

## למה Docker כל כך מרכזי ב-CI/CD?

Docker פותר את הבעיה הקלאסית "זה עובד אצלי במחשב" – על ידי אריזת האפליקציה יחד עם כל תלויותיה לתוך **image** אחיד שרץ זהה בכל סביבה (dev, CI, staging, production).

עיקרון מפתח: **"Build Once, Run Anywhere"** – בונים image אחד ב-pipeline, ואז מעבירים (promote) את אותו image המדויק דרך כל הסביבות, במקום לבנות מחדש בכל שלב.

## Dockerfile בסיסי (Multi-Stage Build)

```dockerfile
# --- שלב הבנייה (Build Stage) ---
FROM node:20 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# --- שלב הריצה (Production Stage) ---
FROM node:20-alpine AS production
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
EXPOSE 3000
USER node
CMD ["node", "dist/main.js"]
```

**למה Multi-Stage?** ה-image הסופי לא מכיל כלי בנייה (compiler, devDependencies), רק את מה שצריך להרצה – כך ה-image קטן יותר, מאובטח יותר, ומהיר יותר לפרוס.

## שילוב Docker Build ב-Pipeline (GitHub Actions)

```yaml
jobs:
  docker-build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and Push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: |
            ghcr.io/myorg/myapp:${{ github.sha }}
            ghcr.io/myorg/myapp:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

## תיוג Images (Image Tagging Strategy)

| אסטרטגיה | דוגמה | שימוש |
|---|---|---|
| Git SHA | `myapp:a1b2c3d` | traceability מדויק לקוד |
| Semantic Version | `myapp:v2.3.1` | releases רשמיים |
| `latest` | `myapp:latest` | **לא מומלץ** לפרודקשן – לא ניתן לשחזור (reproducible) |
| Branch + SHA | `myapp:main-a1b2c3d` | זיהוי גם ענף וגם commit |

⚠️ **טעות נפוצה**: להשתמש רק ב-`latest` בפרודקשן – אין דרך לדעת איזו גרסת קוד רצה בפועל, ואי אפשר לבצע rollback מדויק.

## Docker Compose לבדיקות אינטגרציה ב-CI

```yaml
# docker-compose.test.yml
version: '3.8'
services:
  app:
    build: .
    depends_on:
      - postgres
    environment:
      DATABASE_URL: postgres://user:pass@postgres:5432/testdb
  postgres:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: testdb
```

```yaml
# ב-pipeline:
- run: docker compose -f docker-compose.test.yml up --abort-on-container-exit --exit-code-from app
```

## סריקת אבטחה ל-Images (Container Scanning)

```yaml
- name: Scan image with Trivy
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: 'ghcr.io/myorg/myapp:${{ github.sha }}'
    severity: 'CRITICAL,HIGH'
    exit-code: '1'
```

## טיפים וטריקים

1. **Layer Caching** – סדר את ה-`COPY` וה-`RUN` ב-Dockerfile כך שהשכבות שמשתנות הכי פחות (כמו `package.json`) יגיעו קודם, כדי למקסם ניצול cache.
2. **`.dockerignore`** – הוסף קובץ שמונע העתקת `node_modules`, `.git` וקבצים מיותרים ל-build context, מה שמאיץ build ומקטין image.
3. **Distroless / Alpine Images** – השתמש ב-images מינימליים ללא shell/כלים מיותרים כדי לצמצם משטח תקיפה.
4. **BuildKit Cache Mounts** – `RUN --mount=type=cache,target=/root/.npm npm ci` מאפשר cache חכם גם בין builds שונים לחלוטין.
5. **Registry נכון** – שקול Registry פרטי (ECR, GCR, Harbor, GHCR) עם סריקת פגיעויות מובנית.
6. **Non-root User** – תמיד הגדר `USER` שאינו root ב-Dockerfile מסיבות אבטחה.
7. **Immutable Tags** – ברגע שתייגת image עם SHA מסוים, אל תדרוס אותו – זה שובר traceability.

## שאלות ראיון עבודה נפוצות

**ש: למה Multi-Stage Build חשוב ב-CI/CD?**
ת: הוא מפריד בין סביבת הבנייה (עם compiler, devDependencies) לסביבת הריצה, כך ה-image הסופי קטן, נקי ומאובטח יותר – רק מה שצריך כדי להריץ את האפליקציה.

**ש: מהי אסטרטגיית התיוג הנכונה ל-Docker images בפייפליין CI/CD?**
ת: להשתמש ב-Git SHA (או semver לגרסאות רשמיות) כדי להבטיח traceability מדויק וreproducibility, ולהימנע מ-`latest` בלבד עבור deployments לפרודקשן.

**ש: מה זה "Build Once, Deploy Everywhere" ולמה זה עקרון חשוב?**
ת: בונים image אחד פעם אחת ב-pipeline, ומעבירים בדיוק אותו artifact (עם config שונה per environment) דרך staging ועד production – כדי להבטיח שמה שנבדק הוא בדיוק מה שרץ בפרודקשן.

**ש: איך מריצים בדיקות אינטגרציה שדורשות מסד נתונים בתוך CI?**
ת: באמצעות Docker Compose (או services מובנים ב-GitLab/GitHub Actions) שמרימים container של DB לצד האפליקציה, כך שהבדיקות רצות מול מסד אמיתי בסביבה מבודדת וזמנית.

**ש: מה ההבדל בין Container Scanning ל-SAST?**
ת: SAST (Static Application Security Testing) בודק את קוד המקור עצמו לפגיעויות. Container Scanning (כמו Trivy, Grype) בודק את שכבות ה-image המוכן – כולל תלויות מערכת ההפעלה וספריות – לפגיעויות ידועות (CVEs).

**ש: מה היתרון בשימוש ב-BuildKit / Docker Buildx בפייפליין?**
ת: תמיכה ב-cache mounts מתקדם, build מקבילי של שכבות, תמיכה ב-multi-platform builds (ARM/AMD64), ואינטגרציה עם cache מרוחק (כמו GitHub Actions cache) שמאיצה משמעותית זמני build.

## קישורים חיצוניים

**YouTube:**
- [Docker Tutorial – TechWorld with Nana](https://www.youtube.com/c/TechWorldwithNana)
- [Docker Multi-Stage Builds Explained](https://www.youtube.com/results?search_query=docker+multi+stage+builds+explained)
- [Docker Build Best Practices for CI/CD](https://www.youtube.com/results?search_query=docker+build+best+practices+cicd)

**דוקומנטציה:**
- [Docker Docs – Multi-Stage Builds](https://docs.docker.com/build/building/multi-stage/)
- [Docker Build Push Action (GitHub)](https://github.com/docker/build-push-action)
- [Trivy Vulnerability Scanner Docs](https://trivy.dev/)
- [Docker Best Practices](https://docs.docker.com/build/building/best-practices/)
