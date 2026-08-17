# מדריך 3: Jenkinsfile - דוגמאות מעשיות מקצה לקצה

## מבוא
במדריך הזה נעבור על דוגמאות Jenkinsfile מלאות ומעשיות לפרויקטים מסוגים שונים: Node.js, Java/Maven, Python, ו-Multibranch Pipeline. המטרה - לתת template שאפשר לקחת ולהתאים ישירות.

## דוגמה 1: פרויקט Node.js מלא

```groovy
pipeline {
    agent {
        docker {
            image 'node:20-alpine'
            args '-v /tmp:/tmp'
        }
    }

    environment {
        NPM_CONFIG_CACHE = '/tmp/.npm'
        CI = 'true'
    }

    stages {
        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Lint') {
            steps {
                sh 'npm run lint'
            }
        }

        stage('Test') {
            steps {
                sh 'npm test -- --coverage'
            }
            post {
                always {
                    junit 'reports/junit.xml'
                    publishHTML(target: [
                        reportDir: 'coverage',
                        reportFiles: 'index.html',
                        reportName: 'Coverage Report'
                    ])
                }
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Publish Artifact') {
            steps {
                archiveArtifacts artifacts: 'dist/**/*', fingerprint: true
            }
        }
    }
}
```

## דוגמה 2: פרויקט Java עם Maven

```groovy
pipeline {
    agent any

    tools {
        maven 'Maven-3.9'
        jdk 'JDK-17'
    }

    stages {
        stage('Build & Unit Test') {
            steps {
                sh 'mvn -B clean verify'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('MySonarServer') {
                    sh 'mvn sonar:sonar'
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Package & Push to Nexus') {
            steps {
                sh 'mvn deploy -DskipTests'
            }
        }
    }

    post {
        always {
            junit '**/target/surefire-reports/*.xml'
            archiveArtifacts artifacts: '**/target/*.jar'
        }
    }
}
```

## דוגמה 3: פרויקט Python עם venv

```groovy
pipeline {
    agent any

    stages {
        stage('Setup venv') {
            steps {
                sh '''
                    python3 -m venv venv
                    . venv/bin/activate
                    pip install -r requirements.txt
                '''
            }
        }

        stage('Test') {
            steps {
                sh '''
                    . venv/bin/activate
                    pytest --junitxml=results.xml --cov=app
                '''
            }
            post {
                always {
                    junit 'results.xml'
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                sh 'docker build -t myapp:${BUILD_NUMBER} .'
            }
        }
    }
}
```

## דוגמה 4: Multibranch Pipeline עם לוגיקה תלוית-branch

```groovy
pipeline {
    agent any

    stages {
        stage('Build') {
            steps {
                sh './build.sh'
            }
        }

        stage('Deploy to Staging') {
            when {
                branch 'develop'
            }
            steps {
                sh './deploy.sh staging'
            }
        }

        stage('Deploy to Production') {
            when {
                allOf {
                    branch 'main'
                    not { changeRequest() }
                }
            }
            steps {
                input message: 'לאשר deploy לפרודקשן?'
                sh './deploy.sh production'
            }
        }

        stage('PR Validation') {
            when {
                changeRequest()
            }
            steps {
                echo "בודק Pull Request #${env.CHANGE_ID} מ-${env.CHANGE_AUTHOR}"
                sh './run-pr-checks.sh'
            }
        }
    }
}
```

## דוגמה 5: שימוש ב-Parameters

```groovy
pipeline {
    agent any

    parameters {
        choice(name: 'ENVIRONMENT', choices: ['dev', 'staging', 'prod'], description: 'לאיזו סביבה לפרוס')
        string(name: 'VERSION', defaultValue: 'latest', description: 'גרסה לפריסה')
        booleanParam(name: 'RUN_TESTS', defaultValue: true, description: 'להריץ בדיקות?')
    }

    stages {
        stage('Test') {
            when {
                expression { params.RUN_TESTS == true }
            }
            steps {
                sh 'npm test'
            }
        }

        stage('Deploy') {
            steps {
                echo "פורס גרסה ${params.VERSION} לסביבת ${params.ENVIRONMENT}"
                sh "./deploy.sh ${params.ENVIRONMENT} ${params.VERSION}"
            }
        }
    }
}
```

## דוגמה 6: Retry ו-Error Handling

```groovy
stage('Flaky Network Call') {
    steps {
        retry(3) {
            sh 'curl -f https://api.example.com/health'
        }
    }
}

stage('Handle Failure Gracefully') {
    steps {
        script {
            try {
                sh './risky-operation.sh'
            } catch (err) {
                echo "הפעולה נכשלה: ${err.getMessage()}"
                currentBuild.result = 'UNSTABLE'
            }
        }
    }
}
```

## טיפים וטריקים
- השתמשו ב-`sh returnStatus: true` כאשר לא רוצים שכשל בפקודה יעצור את כל ה-pipeline מיד.
- `stash`/`unstash` שימושיים להעברת קבצים בין stages שרצים על agents שונים.
- `credentials()` binding מונע חשיפת סודות בלוגים - תמיד עדיף על hardcoding.
- בדקו syntax עם ה-Jenkinsfile linter לפני push, כדי לא לבזבז זמן build.
- `environment {}` block יכול לכלול גם credentials:
  ```groovy
  environment {
      DOCKER_CREDS = credentials('dockerhub-creds')
  }
  ```

## קישורים לתיעוד רשמי
- Pipeline Examples רשמיים: https://www.jenkins.io/doc/pipeline/examples/
- Jenkinsfile - Getting Started: https://www.jenkins.io/doc/book/pipeline/getting-started/
- Using a Jenkinsfile: https://www.jenkins.io/doc/book/pipeline/jenkinsfile/

## קישורי YouTube מומלצים
- CI/CD in Production with Jenkins - 17 שעות קורס מלא (freeCodeCamp): חפשו בערוץ freeCodeCamp.org
- Jenkins Tutorial for Beginners: https://www.youtube.com/watch?v=Lxd6JMMxuwo
- Jenkins Full Course: https://www.youtube.com/watch?v=4-AAGjFuRK4

## שאלות ראיון עבודה בנושא Jenkinsfile

**ש: איך מעבירים secrets ל-pipeline בלי לחשוף אותם בלוגים?**
ת: באמצעות Jenkins Credentials Store ו-`credentials()` binding או `withCredentials`, כך ש-Jenkins מסווה (masks) אוטומטית את הערך בפלט הלוגים.

**ש: מה ההבדל בין `sh` עם ו-בלי `returnStatus`?**
ת: כברירת מחדל `sh` זורק exception וממשיך את ה-pipeline ל-failure אם ה-exit code שונה מ-0. עם `returnStatus: true`, ה-step מחזיר את קוד היציאה כערך ולא עוצר את ה-pipeline, מה שמאפשר טיפול מותאם בשגיאות.

**ש: מה זה `stash` ו-`unstash` ולמה משתמשים בהם?**
ת: מאפשרים לשמור זמנית קבצים מ-workspace אחד ולשחזר אותם ב-stage/agent אחר באותו pipeline run - שימושי כשה-build רץ על agent אחד וה-deploy על agent אחר.

**ש: איך בונים לוגיקה שרצה רק על branch מסוים?**
ת: באמצעות בלוק `when { branch 'main' }` או תנאים מורכבים יותר עם `allOf`/`anyOf`/`not`.

**ש: מה תפקיד ה-directive `parameters` ב-Declarative Pipeline?**
ת: מגדיר פרמטרים שהמשתמש יכול להזין בזמן הרצת ה-build (string, choice, boolean וכו'), נגישים דרך `params.NAME`.

**ש: איך מטפלים בקריאת רשת שלא תמיד מצליחה (flaky)?**
ת: באמצעות ה-step `retry(N) { ... }` שמנסה שוב את הבלוק עד N פעמים לפני שנכשל סופית.
