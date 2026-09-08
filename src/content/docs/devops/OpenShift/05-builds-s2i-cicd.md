---
title: "BuildConfigs, ImageStreams, S2I ו-CI/CD"
description: "מנגנון הבנייה המובנה ב-OpenShift: ImageStream, בנייה ללא Dockerfile באמצעות S2I, אסטרטגיית Docker, Pipelines מבוססי Tekton ו-Webhooks מ-Git."
category: DevOps/OpenShift
part: 5/10
---

## מבוא - מה ייחודי ב-OpenShift בתחום ה-Build?

בעוד ש-Kubernetes וניל לא כולל שום מנגנון build (צריך Jenkins/GitLab CI חיצוני שיוצר את התמונה ודוחף ל-registry), ל-OpenShift יש מנגנון **build מובנה בתוך הקלאסטר עצמו**: BuildConfig, ImageStream, ו-S2I (Source-to-Image).

## ImageStream - "Git for Images"

ImageStream הוא abstraction ייחודי ל-OpenShift שעוקב אחרי תגיות (tags) של תמונות ומאפשר triggers אוטומטיים כשתמונה חדשה מגיעה.

```yaml
apiVersion: image.openshift.io/v1
kind: ImageStream
metadata:
  name: my-app
spec:
  lookupPolicy:
    local: false
```

```bash
oc get is
oc get imagestream my-app
oc describe imagestream my-app

# ייבוא תמונה חיצונית ל-ImageStream פנימי
oc import-image my-app --from=quay.io/example/my-app:latest --confirm

# תיוג תמונה
oc tag my-app:latest my-app:stable
```

היתרון המרכזי: כל דבר שמצביע על `ImageStreamTag` (כמו DeploymentConfig) יכול לקבל **trigger אוטומטי** כשהתמונה משתנה - אין צורך ב-webhook חיצוני.

## S2I (Source-to-Image) - בנייה בלי Dockerfile

S2I לוקח קוד מקור (מ-Git) ו**builder image** (למשל Python, Node.js, Java) ומייצר תמונת container מוכנה - בלי שאתם צריכים לכתוב Dockerfile בכלל!

### דוגמה: פריסת אפליקציית Node.js ישירות מ-Git

```bash
oc new-app nodejs:18~https://github.com/example/my-node-app.git --name=my-node-app

# צפייה בתהליך ה-build
oc logs -f bc/my-node-app

# חשיפה החוצה
oc expose svc/my-node-app
```

הפקודה הזו עשתה בפועל:
1. יצרה `ImageStream` בשם `my-node-app`
2. יצרה `BuildConfig` שמריץ S2I מ-Git
3. יצרה `DeploymentConfig`/`Deployment`
4. יצרה `Service`

### BuildConfig מפורט (S2I)

```yaml
apiVersion: build.openshift.io/v1
kind: BuildConfig
metadata:
  name: my-node-app
spec:
  source:
    type: Git
    git:
      uri: "https://github.com/example/my-node-app.git"
      ref: "main"
    contextDir: "/"
  strategy:
    type: Source
    sourceStrategy:
      from:
        kind: ImageStreamTag
        namespace: openshift
        name: "nodejs:18-ubi9"
      env:
        - name: NPM_MIRROR
          value: "https://registry.npmjs.org"
  output:
    to:
      kind: ImageStreamTag
      name: "my-node-app:latest"
  triggers:
    - type: ConfigChange
    - type: ImageChange
    - type: GitHub
      github:
        secret: "webhook-secret-abc123"
```

## Docker/Container Strategy - בנייה מ-Dockerfile

אם יש לכם Dockerfile מוכן:

```yaml
apiVersion: build.openshift.io/v1
kind: BuildConfig
metadata:
  name: my-app-docker
spec:
  source:
    type: Git
    git:
      uri: "https://github.com/example/my-app.git"
    dockerfile: |
      FROM registry.access.redhat.com/ubi9/ubi-minimal
      COPY . /app
      CMD ["/app/start.sh"]
  strategy:
    type: Docker
    dockerOptions:
      noCache: true
  output:
    to:
      kind: ImageStreamTag
      name: "my-app-docker:latest"
```

```bash
# הרצה ידנית של build
oc start-build my-app-docker

# הרצה עם מעקב לוגים חי
oc start-build my-app-docker --follow

# ביטול build רץ
oc cancel-build my-app-docker-3

# רשימת כל ה-builds ההיסטוריים
oc get builds
```

## Pipeline Strategy (Tekton / OpenShift Pipelines)

עבור CI/CD מתקדם, Red Hat ממליצה על **OpenShift Pipelines** (מבוסס Tekton) - Operator ייעודי:

```yaml
apiVersion: tekton.dev/v1
kind: Pipeline
metadata:
  name: build-and-deploy
spec:
  params:
    - name: git-url
    - name: image-name
  tasks:
    - name: fetch-source
      taskRef:
        name: git-clone
      params:
        - name: url
          value: $(params.git-url)
    - name: build-image
      taskRef:
        name: buildah
      runAfter: ["fetch-source"]
      params:
        - name: IMAGE
          value: $(params.image-name)
    - name: deploy
      taskRef:
        name: openshift-client
      runAfter: ["build-image"]
```

```bash
# התקנת ה-Operator (דרך CLI, בד"כ עושים דרך OperatorHub בקונסולה)
oc get csv -n openshift-operators | grep pipelines

# הרצת pipeline
tkn pipeline start build-and-deploy \
  -p git-url=https://github.com/example/my-app.git \
  -p image-name=image-registry.openshift-image-registry.svc:5000/my-project/my-app

# מעקב אחרי pipelinerun
tkn pipelinerun logs -f
```

## Webhooks - הפעלה אוטומטית מ-Git Push

```bash
# קבלת ה-URL של ה-webhook עבור GitHub
oc describe bc my-node-app | grep -A2 Webhook

# דוגמת URL:
# https://api.mycluster.example.com:6443/apis/build.openshift.io/v1/namespaces/my-project/buildconfigs/my-node-app/webhooks/<secret>/github
```

יש להוסיף URL זה כ-Webhook בהגדרות ה-repository ב-GitHub/GitLab, כדי שכל `git push` יפעיל build אוטומטי.

## דיאגרמת זרימה מלאה: מקוד ל-production

```
Git Push
   │
   ▼
Webhook Trigger
   │
   ▼
┌─────────────────┐
│   BuildConfig      │  (S2I / Docker / Pipeline)
└────────┬─────────┘
         │ בונה תמונה
         ▼
┌─────────────────┐
│   ImageStream      │  (נשמר ב-internal registry)
└────────┬─────────┘
         │ trigger אוטומטי
         ▼
┌─────────────────┐
│  Deployment /       │
│  DeploymentConfig    │
└────────┬─────────┘
         │
         ▼
     Pods חדשים רצים
```

## קישורים חיצוניים

### תיעוד רשמי
- Understanding image builds - Builds - OpenShift Documentation: https://docs.redhat.com/en/documentation/openshift_container_platform/4.22
- Source-to-Image (S2I) build - Red Hat Documentation: https://docs.redhat.com/en/documentation/openshift_container_platform/4.22
- OpenShift Pipelines (Tekton) - Red Hat Developer: https://developers.redhat.com/products/openshift/getting-started

### סרטוני יוטיוב מומלצים
- OpenShift: Beginner to Advanced Complete Course (כולל builds): https://www.youtube.com/watch?v=zVkw-qLp_H4
- Red Hat OpenShift Administration EX280 (כולל build strategies): https://www.oreilly.com/library/view/red-hat-openshift/9780137441938/

## טיפים וטריקים

1. **`oc new-app` הוא כלי מדהים ללמידה מהירה**, אבל ב-production כתבו תמיד YAML מפורש (declarative) שיישמר ב-Git - לא תסמכו על מה ש-`new-app` יוצר "מאחורי הקלעים".
2. אם ה-build נכשל - **תמיד תתחילו מ-`oc logs -f bc/<name>`**, שם רואים בדיוק באיזה שלב (fetch/assemble/run) זה נכשל.
3. S2I תומך ב-**incremental builds** - אפשר להאיץ build ע"י שימוש מחדש בתלויות (כמו node_modules) מה-build הקודם, על ידי `incremental: true` בהגדרת ה-sourceStrategy.
4. עבור monorepos, השתמשו ב-`contextDir` כדי לציין תיקיית משנה ספציפית לבנייה.
5. Pipeline (Tekton) הוא הבחירה המומלצת ל-CI/CD מודרני ב-OpenShift - S2I/BuildConfig נחשבים כיום לגישה "פשוטה יותר" אך פחות גמישה מ-Pipelines מלאים.

---
**במדריך הבא:** אחסון - PV, PVC, StorageClasses ו-CSI.
