---
title: "GitLab CI/CD – מדריך מלא"
category: DevOps/CI-CD
part: 5/10
---

## מה זה GitLab CI/CD?

מערכת CI/CD מובנית בתוך GitLab, המוגדרת בקובץ יחיד בשורש הפרויקט: `.gitlab-ci.yml`. GitLab Runner הוא הרכיב שמריץ את העבודה בפועל (יכול להיות shared runner של GitLab.com, או self-hosted).

## מושגי יסוד

- **Pipeline** – ריצה שלמה, מורכבת מ-Stages.
- **Stage** – שלב לוגי (build, test, deploy) – כל ה-jobs באותו stage רצים במקביל.
- **Job** – יחידת עבודה בודדת בתוך stage.
- **Runner** – ה-agent שמריץ את ה-jobs (Shared / Group / Project runner).
- **Artifact** – קבצים שנשמרים בין jobs/stages (למשל build output).

## דוגמה בסיסית

```yaml
stages:
  - build
  - test
  - deploy

build-job:
  stage: build
  image: node:20
  script:
    - npm ci
    - npm run build
  artifacts:
    paths:
      - dist/

test-job:
  stage: test
  image: node:20
  script:
    - npm ci
    - npm test

deploy-job:
  stage: deploy
  image: alpine
  script:
    - echo "Deploying..."
  only:
    - main
```

## Pipeline מתקדם: Docker Build + Kubernetes Deploy

```yaml
variables:
  DOCKER_IMAGE: registry.gitlab.com/myorg/myapp

stages:
  - test
  - build
  - deploy

unit-tests:
  stage: test
  image: python:3.12
  script:
    - pip install -r requirements.txt
    - pytest --cov=app tests/
  coverage: '/TOTAL.*\s+(\d+%)/'

build-image:
  stage: build
  image: docker:24
  services:
    - docker:24-dind
  script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
    - docker build -t $DOCKER_IMAGE:$CI_COMMIT_SHA .
    - docker push $DOCKER_IMAGE:$CI_COMMIT_SHA
  rules:
    - if: '$CI_COMMIT_BRANCH == "main"'

deploy-staging:
  stage: deploy
  image: bitnami/kubectl:latest
  script:
    - kubectl set image deployment/myapp myapp=$DOCKER_IMAGE:$CI_COMMIT_SHA -n staging
  environment:
    name: staging
    url: https://staging.myapp.com
  rules:
    - if: '$CI_COMMIT_BRANCH == "main"'

deploy-production:
  stage: deploy
  image: bitnami/kubectl:latest
  script:
    - kubectl set image deployment/myapp myapp=$DOCKER_IMAGE:$CI_COMMIT_SHA -n production
  environment:
    name: production
    url: https://myapp.com
  when: manual
  rules:
    - if: '$CI_COMMIT_BRANCH == "main"'
```

### `rules` מול `only/except`

`rules` הוא הסינטקס המודרני והגמיש יותר לקביעה מתי job ירוץ (לעומת `only`/`except` הישן). ניתן לשלב תנאים מרובים, `changes` (לפי קבצים ששונו), ו-`when: manual`.

## Include – שיתוף קונפיגורציה בין פרויקטים

```yaml
include:
  - project: 'myorg/ci-templates'
    file: '/templates/docker-build.yml'
  - local: '.gitlab/ci/test.yml'
  - template: 'Security/SAST.gitlab-ci.yml'
```

## CI/CD Variables ו-Secrets

```yaml
deploy:
  script:
    - echo "Deploying with token"
  variables:
    DEPLOY_ENV: "production"
```

סודות אמיתיים (API keys, passwords) מוגדרים ב-Settings -> CI/CD -> Variables, עם אפשרות "Masked" (מוסתר מה-logs) ו-"Protected" (זמין רק ל-branches/tags מוגנים).

## טיפים וטריקים

1. **DAG עם `needs`** – במקום להמתין לכל ה-stage הקודם, `needs` מאפשר ל-job להתחיל ברגע שה-job הספציפי שהוא תלוי בו הסתיים – מקצר משמעותית זמן pipeline.
```yaml
deploy:
  needs: ["build-image"]
```
2. **Cache בין Pipelines** – שימוש ב-`cache:` עם key חכם (למשל `package-lock.json`) חוסך זמן התקנת תלויות.
3. **Docker-in-Docker (dind)** – נדרש כדי לבנות Docker images בתוך job שרץ הוא עצמו בקונטיינר.
4. **Merge Request Pipelines** – הרץ pipeline מיוחד רק כשנפתח MR, עם השוואה ל-target branch.
5. **Multi-project Pipelines** – טריגר pipeline בפרויקט אחר מתוך פרויקט נוכחי (שימושי בארכיטקטורת microservices).
6. **GitLab Auto DevOps** – פיצ'ר שיוצר pipeline מלא אוטומטית (build, test, security scan, deploy) עם מינימום קונפיגורציה.

## שאלות ראיון עבודה נפוצות

**ש: מה ההבדל בין Stage ל-Job ב-GitLab CI?**
ת: Stage הוא קבוצה לוגית (למשל "test"); כל ה-jobs באותו stage רצים במקביל כברירת מחדל. Stages עצמם רצים בסדר – stage הבא מתחיל רק אחרי שכל ה-jobs ב-stage הנוכחי הצליחו.

**ש: מה זה GitLab Runner ואילו סוגים קיימים?**
ת: התוכנה שמריצה את ה-jobs בפועל. יש Shared Runners (מנוהלים ע"י GitLab, זמינים לכל פרויקט), Group Runners (לקבוצת פרויקטים), ו-Project/Specific Runners (ייעודיים לפרויקט אחד, לרוב self-hosted לצרכים מיוחדים כמו GPU).

**ש: מהו `needs` וכיצד הוא משפר ביצועים?**
ת: הוא מאפשר להגדיר Directed Acyclic Graph (DAG) בין jobs במקום תלות ליניארית ב-stages; job יכול להתחיל ברגע שהתלות הספציפית שלו הסתיימה, במקום להמתין לכל ה-stage הקודם.

**ש: איך מריצים Docker build בתוך GitLab CI job?**
ת: באמצעות שירות Docker-in-Docker (`docker:24-dind`) כ-service, יחד עם image של `docker` עצמו, ו-login לרג'יסטרי דרך משתני `CI_REGISTRY_*` המובנים.

**ש: מה ההבדל בין `rules` ל-`only/except`?**
ת: `rules` הוא syntax חדש, גמיש וקריא יותר, התומך בתנאים מורכבים (`if`, `changes`, `exists`) ומחליף לחלוטין את `only/except` הישן שכיום deprecated.

**ש: איך מגדירים deploy שדורש אישור ידני לפרודקשן?**
ת: על ידי `when: manual` בתוך ה-job, כך שה-pipeline עוצר ומחכה שמישהו ילחץ "play" ב-UI כדי להמשיך.

## קישורים חיצוניים

**YouTube:**
- [GitLab CI/CD Full Course – Zero to Hero](https://www.youtube.com/watch?v=Typ9U6k6g5s)
- [GitLab CI/CD Tutorial for Beginners [Crash Course]](https://www.youtube.com/watch?v=qP8kir2GUgo)

**דוקומנטציה:**
- [GitLab CI/CD Docs](https://docs.gitlab.com/ee/ci/)
- [.gitlab-ci.yml Reference](https://docs.gitlab.com/ee/ci/yaml/)
- [GitLab Auto DevOps](https://docs.gitlab.com/ee/topics/autodevops/)
- [GitLab CI/CD Variables](https://docs.gitlab.com/ee/ci/variables/)
