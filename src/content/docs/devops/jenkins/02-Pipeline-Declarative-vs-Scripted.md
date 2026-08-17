---
title: "Jenkins Pipeline - Declarative מול Scripted"
category: DevOps/Jenkins
part: 2/10
---

## מבוא
Pipeline הוא הפיצ'ר המרכזי המודרני של Jenkins - דרך להגדיר את כל תהליך ה-CI/CD כקוד (Pipeline-as-Code), בדרך כלל בקובץ בשם `Jenkinsfile` שנשמר יחד עם קוד הפרויקט ב-Git.

יש שני סוגי syntax:
1. **Declarative Pipeline** - syntax מובנה, קריא יותר, מומלץ לרוב המקרים
2. **Scripted Pipeline** - Groovy מלא, גמיש יותר אך מורכב יותר

## Declarative Pipeline - מבנה בסיסי

```groovy
pipeline {
    agent any

    environment {
        APP_ENV = 'production'
        VERSION = "1.0.${BUILD_NUMBER}"
    }

    options {
        timeout(time: 30, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
        disableConcurrentBuilds()
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build') {
            steps {
                sh 'mvn clean compile'
            }
        }

        stage('Test') {
            steps {
                sh 'mvn test'
            }
            post {
                always {
                    junit '**/target/surefire-reports/*.xml'
                }
            }
        }

        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                sh './deploy.sh'
            }
        }
    }

    post {
        success {
            echo 'הבילד הצליח!'
        }
        failure {
            mail to: 'team@example.com',
                 subject: "Build נכשל: ${env.JOB_NAME}",
                 body: "בדקו את ${env.BUILD_URL}"
        }
        always {
            cleanWs()
        }
    }
}
```

## Scripted Pipeline - מבנה בסיסי

```groovy
node {
    def version

    stage('Checkout') {
        checkout scm
        version = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
    }

    stage('Build') {
        try {
            sh 'mvn clean compile'
        } catch (Exception e) {
            currentBuild.result = 'FAILURE'
            throw e
        }
    }

    stage('Test') {
        parallel(
            "Unit Tests": {
                sh 'mvn test'
            },
            "Integration Tests": {
                sh 'mvn verify -P integration'
            }
        )
    }

    stage('Deploy') {
        if (env.BRANCH_NAME == 'main') {
            sh "./deploy.sh ${version}"
        } else {
            echo 'מדלגים על deploy - לא branch main'
        }
    }
}
```

## טבלת השוואה

| קריטריון | Declarative | Scripted |
|---|---|---|
| קריאות | גבוהה, structure קבוע | דורש ידע ב-Groovy |
| גמישות | מוגבלת (אך ניתן עם `script {}`) | מלאה |
| Validation | נבדק לפני ריצה (syntax linting) | נבדק תוך כדי ריצה |
| Restart מ-stage מסוים | נתמך | לא נתמך |
| מומלץ למתחילים | כן | פחות |
| שילוב Groovy מותאם | דרך בלוק `script { }` | טבעי בכל מקום |

## שילוב Scripted בתוך Declarative

```groovy
pipeline {
    agent any
    stages {
        stage('Custom Logic') {
            steps {
                script {
                    def branches = ['main', 'develop']
                    if (branches.contains(env.BRANCH_NAME)) {
                        echo "Branch ${env.BRANCH_NAME} מאושר ל-deploy"
                    }
                    for (int i = 0; i < 3; i++) {
                        echo "ניסיון מספר ${i}"
                    }
                }
            }
        }
    }
}
```

## Parallel Stages ב-Declarative

```groovy
stage('Parallel Tests') {
    parallel {
        stage('Unit') {
            steps { sh 'npm run test:unit' }
        }
        stage('Lint') {
            steps { sh 'npm run lint' }
        }
        stage('E2E') {
            steps { sh 'npm run test:e2e' }
        }
    }
}
```

## Matrix Builds (בדיקה על כמה קונפיגורציות)

```groovy
pipeline {
    agent any
    stages {
        stage('Matrix Build') {
            matrix {
                axes {
                    axis {
                        name 'PLATFORM'
                        values 'linux', 'windows', 'mac'
                    }
                    axis {
                        name 'NODE_VERSION'
                        values '18', '20'
                    }
                }
                stages {
                    stage('Test') {
                        steps {
                            echo "בודק על ${PLATFORM} עם Node ${NODE_VERSION}"
                        }
                    }
                }
            }
        }
    }
}
```

## טיפים וטריקים
- השתמשו ב-**Blue Ocean** או ב-Replay כדי לבדוק שינויים ב-Pipeline לפני commit.
- `input` step מאפשר אישור ידני באמצע pipeline (למשל לפני deploy ל-production):
  ```groovy
  stage('Approval') {
      steps {
          input message: 'לאשר deploy לפרודקשן?', ok: 'כן, המשך'
      }
  }
  ```
- הימנעו מלוגיקה כבדה מדי ב-`script {}` - עדיף להעביר ל-Shared Library.
- תמיד השתמשו ב-`options { timeout() }` כדי למנוע builds תקועים לנצח.
- Declarative Pipeline נבדק עם Jenkins Pipeline Linter לפני ריצה - אפשר להריץ מה-CLI:
  ```bash
  curl -X POST -F "jenkinsfile=<Jenkinsfile" http://localhost:8080/pipeline-model-converter/validate
  ```

## קישורים לתיעוד רשמי
- Getting Started with Pipeline: https://www.jenkins.io/doc/book/pipeline/getting-started/
- Pipeline Syntax המלא: https://www.jenkins.io/doc/book/pipeline/syntax/
- Steps Reference: https://www.jenkins.io/doc/pipeline/steps/

## קישורי YouTube מומלצים
- Learn Jenkins by Building a CI/CD Pipeline (freeCodeCamp): https://www.youtube.com/watch?v=6YZvp2GwT0A
- Jenkins Full Course (Simplilearn): https://www.youtube.com/watch?v=MayMkFCkzj4
- Jenkins In One Shot: https://www.youtube.com/watch?v=4-AAGjFuRK4

## שאלות ראיון עבודה בנושא Pipelines

**ש: מה ההבדל המרכזי בין Declarative ל-Scripted Pipeline?**
ת: Declarative הוא syntax מובנה עם structure קבוע (`pipeline { agent {} stages {} }`), קריא ופשוט יותר, עם validation מובנה. Scripted הוא Groovy מלא בתוך בלוק `node {}`, גמיש יותר אך דורש ידע תכנותי מעמיק.

**ש: איך מריצים שני stages במקביל ב-Jenkins?**
ת: ב-Declarative באמצעות בלוק `parallel {}` בתוך stage, וב-Scripted באמצעות פונקציית `parallel()` עם map של closures.

**ש: מה זה `agent` ואילו סוגים קיימים?**
ת: `agent` מגדיר איפה ה-pipeline (או stage ספציפי) ירוץ. אפשרויות: `any`, `none`, `label 'my-label'`, `docker { image 'node:20' }`, `kubernetes { ... }`.

**ש: מה תפקיד בלוק `post` ואילו conditions קיימים בו?**
ת: מריץ פעולות אחרי סיום ה-pipeline/stage. Conditions: `always`, `success`, `failure`, `unstable`, `changed`, `aborted`, `cleanup`.

**ש: מהו Jenkinsfile ולמה חשוב לשמור אותו ב-source control?**
ת: קובץ טקסט שמגדיר את ה-Pipeline כקוד. שמירתו ב-Git מאפשרת גרסאות, code review, ו-single source of truth לתהליך ה-CI/CD, בהתאם לעקרון "Pipeline as Code".

**ש: איך אפשר להריץ אישור ידני (manual approval) בתוך pipeline?**
ת: באמצעות ה-step `input`, שמעצור את ה-pipeline וממתין לאישור אנושי דרך ה-UI, לרוב עם `timeout` כדי למנוע המתנה אינסופית.

**ש: מה זה Matrix build ומתי משתמשים בו?**
ת: מאפשר להריץ אותם stages על קומבינציות שונות של פרמטרים (למשל מערכות הפעלה וגרסאות שפה) - שימושי לבדיקות תאימות (cross-platform testing).
