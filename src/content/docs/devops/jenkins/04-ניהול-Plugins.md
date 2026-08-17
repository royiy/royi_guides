---
title: "ניהול Plugins ותוספים חיוניים ב-Jenkins"
category: DevOps/Jenkins
part: 4/10
---

## מבוא
אחד הכוחות הגדולים של Jenkins הוא מערכת ה-Plugins העשירה שלו - יש מעל 1800 plugins רשמיים. במדריך הזה נעבור על ניהול plugins, איך להתקין/לעדכן/להסיר, ורשימת plugins חיוניים לכל סביבת עבודה.

## ניהול Plugins דרך ה-UI
1. Manage Jenkins → Plugins
2. לשונית "Available plugins" - חיפוש והתקנה
3. לשונית "Installed plugins" - צפייה בגרסאות מותקנות
4. לשונית "Updates" - עדכונים זמינים

## ניהול Plugins דרך CLI (jenkins-plugin-cli)

```bash
# בתוך Docker image מותאם אישית
jenkins-plugin-cli --plugins \
    git:latest \
    workflow-aggregator:latest \
    docker-workflow:latest \
    blueocean:latest \
    credentials-binding:latest
```

## Dockerfile מותאם עם plugins מוגדרים מראש

```dockerfile
FROM jenkins/jenkins:lts-jdk17

COPY plugins.txt /usr/share/jenkins/ref/plugins.txt
RUN jenkins-plugin-cli --plugin-file /usr/share/jenkins/ref/plugins.txt
```

קובץ `plugins.txt`:
```
git:5.2.1
workflow-aggregator:596.v8c21c963d92d
docker-workflow:563.vd5d2e5c4007f
blueocean:1.27.11
credentials-binding:523.vd859a_4b_122e6
pipeline-utility-steps:2.16.1
timestamper:1.25
ansicolor:1.0.4
sonar:2.17.2
```

טיפ: תמיד נעלו (pin) גרסאות ב-production כדי למנוע שינויים לא צפויים בעדכונים.

## Plugins חיוניים לפי קטגוריה

### CI/CD Core
- **Pipeline (workflow-aggregator)** - הבסיס לכל Pipeline
- **Git plugin** - אינטגרציה עם Git repositories
- **GitHub / GitHub Branch Source** - Webhooks, PR triggers
- **Blue Ocean** - UI מודרני יותר לפייפליינים

### Build & Test
- **Docker Pipeline** - הרצת steps בתוך containers
- **JUnit** - פרסום דוחות בדיקה
- **Pipeline Utility Steps** - `readJSON`, `readYaml`, `zip`, `unzip`

### אבטחה וניהול
- **Credentials Binding** - שימוש בטוח ב-secrets
- **Role-based Authorization Strategy** - RBAC
- **Matrix Authorization Strategy** - הרשאות דקות
- **OWASP Dependency-Check** - סריקת פגיעויות

### Code Quality
- **SonarQube Scanner** - ניתוח איכות קוד
- **Warnings Next Generation** - איתור warnings בקוד

### Notifications
- **Slack Notification** - שליחת עדכוני build ל-Slack
- **Email Extension (Email-ext)** - אימיילים מותאמים אישית

### תשתית
- **Kubernetes plugin** - הרצת agents דינמיים ב-K8s
- **Amazon EC2 plugin** - agents דינמיים ב-AWS
- **Configuration as Code (JCasC)** - ניהול תצורה כקוד

## דוגמת שימוש ב-Slack Notification plugin

```groovy
pipeline {
    agent any
    stages {
        stage('Build') {
            steps {
                sh 'make build'
            }
        }
    }
    post {
        success {
            slackSend(
                channel: '#ci-cd',
                color: 'good',
                message: "✅ Build הצליח: ${env.JOB_NAME} #${env.BUILD_NUMBER}"
            )
        }
        failure {
            slackSend(
                channel: '#ci-cd',
                color: 'danger',
                message: "❌ Build נכשל: ${env.JOB_NAME} #${env.BUILD_NUMBER} - ${env.BUILD_URL}"
            )
        }
    }
}
```

## דוגמת שימוש ב-Pipeline Utility Steps

```groovy
stage('Read Config') {
    steps {
        script {
            def config = readJSON file: 'config.json'
            echo "סביבה: ${config.environment}"

            def yamlData = readYaml file: 'values.yaml'
            echo "Replicas: ${yamlData.replicaCount}"
        }
    }
}
```

## Configuration as Code (JCasC) - דוגמה

```yaml
jenkins:
  systemMessage: "Jenkins מנוהל דרך Configuration as Code"
  numExecutors: 4
  securityRealm:
    local:
      allowsSignup: false
      users:
        - id: admin
          password: ${JENKINS_ADMIN_PASSWORD}

credentials:
  system:
    domainCredentials:
      - credentials:
          - usernamePassword:
              scope: GLOBAL
              id: github-creds
              username: ${GITHUB_USER}
              password: ${GITHUB_TOKEN}
```

## עדכון Plugins בבטחה

1. תמיד גבו את JENKINS_HOME לפני עדכון גדול
2. בדקו בסביבת staging לפני production
3. עדכנו plugins אחד-אחד או בקבוצות קטנות, לא הכל בבת אחת
4. קראו את ה-changelog של כל plugin
5. השתמשו ב-`jenkins-plugin-cli --list` כדי לראות תלויות (dependencies)

## פתרון בעיות נפוצות
- **Plugin לא נטען אחרי עדכון**: בדקו תאימות ל-Jenkins core version הנוכחי.
- **קונפליקט תלויות בין plugins**: השתמשו ב-"Installed Plugins" screen כדי לראות אילו plugins תלויים אחד בשני.
- **Plugin גורם ל-Jenkins לא לעלות**: הפעילו Jenkins עם `-Djenkins.install.runSetupWizard=false` ובדקו לוגים, או מחקו את קובץ ה-`.jpi`/`.hpi` הבעייתי מ-`$JENKINS_HOME/plugins`.

## טיפים וטריקים
- Blue Ocean הוא UI חלופי ולא תחליף מלא ל-classic UI - לרוב ה-DevOps modern עובד ישירות עם Jenkinsfile ולא עם ה-UI.
- אל תתקינו plugins "כי אולי יעזרו" - כל plugin מוסיף attack surface ותחזוקה.
- בדקו את מספר ההתקנות וה-health score של plugin לפני שמתקינים (מופיע ב-Plugin Manager).

## קישורים לתיעוד רשמי
- Managing Plugins: https://www.jenkins.io/doc/book/managing/plugins/
- רשימת כל ה-Plugins: https://plugins.jenkins.io/
- Configuration as Code Plugin: https://www.jenkins.io/projects/jcasc/

## קישורי YouTube מומלצים
- Jenkins Full Course (כולל פרק plugins): https://www.youtube.com/watch?v=6YZvp2GwT0A
- Jenkins Tutorial For Beginners: https://www.youtube.com/watch?v=MayMkFCkzj4

## שאלות ראיון עבודה בנושא Plugins

**ש: איך הייתם מנהלים plugins בסביבת Jenkins שרצה ב-Docker ב-production?**
ת: באמצעות Dockerfile מותאם עם `plugins.txt` שמכיל גרסאות נעולות (pinned versions), ולא התקנה ידנית דרך ה-UI, כדי לשמור על עקביות ו-reproducibility.

**ש: מה ההבדל בין Blue Ocean ל-classic Jenkins UI?**
ת: Blue Ocean מספק ממשק ויזואלי מודרני יותר להצגת pipelines עם גרפים ברורים, בעוד ה-classic UI הוא הממשק המסורתי. שניהם מציגים את אותם builds אך Blue Ocean מציע חוויית משתמש טובה יותר לדיבוג pipelines.

**ש: איך מטפלים בקונפליקט תלויות בין plugins?**
ת: בודקים את דף ה-dependencies של כל plugin ב-plugins.jenkins.io, מעדכנים plugins תלויים יחד, ובודקים ב-staging environment לפני production.

**ש: מהו Jenkins Configuration as Code (JCasC) ולמה הוא חשוב?**
ת: Plugin שמאפשר להגדיר את כל תצורת Jenkins (משתמשים, credentials, plugins, agents) בקובץ YAML, מה שהופך את ההגדרה לגרסתית (version-controlled), משוחזרת (reproducible) ואוטומטית.

**ש: איך הייתם מוודאים שעדכון plugin לא ישבור production?**
ת: גיבוי מלא, בדיקה בסביבת staging זהה, קריאת release notes, ועדכון הדרגתי (canary) ולא כל ה-plugins בבת אחת.
