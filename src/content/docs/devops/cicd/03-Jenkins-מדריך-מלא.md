# מדריך 3: Jenkins – מדריך מלא

## מה זה Jenkins?

Jenkins הוא שרת אוטומציה open-source, אחד הכלים הוותיקים והנפוצים ביותר לבניית CI/CD pipelines. הוא רץ כשרת (עצמאי, לרוב על JVM), תומך במאות plugins, ומאפשר בניית pipelines מורכבים בעזרת קוד (Jenkinsfile) בשפת Groovy.

## ארכיטקטורה בסיסית

- **Controller (Master)** – השרת המרכזי שמנהל jobs, UI, ותזמון.
- **Agents (Nodes/Slaves)** – מכונות (פיזיות, VM, containers) שמריצות את העבודה בפועל. מאפשר הרצה מקבילית ופיזור עומסים.
- **Executors** – "סלוטים" על כל agent שמריצים build בו-זמנית.

```
Controller ──> Agent 1 (Linux, Docker)
           ──> Agent 2 (Windows)
           ──> Agent 3 (Kubernetes Pod, dynamic)
```

## התקנה מהירה עם Docker

```bash
docker run -d \
  --name jenkins \
  -p 8080:8080 -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  jenkins/jenkins:lts
```

לאחר ההרצה, גשו ל-`http://localhost:8080` וקבלו את הסיסמה הראשונית:

```bash
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

## Jenkinsfile – Declarative Pipeline

```groovy
pipeline {
    agent any

    environment {
        DOCKER_IMAGE = "myapp:${env.BUILD_NUMBER}"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        stage('Build') {
            steps {
                sh 'mvn clean package -DskipTests'
            }
        }
        stage('Test') {
            steps {
                sh 'mvn test'
            }
            post {
                always {
                    junit 'target/surefire-reports/*.xml'
                }
            }
        }
        stage('Build Docker Image') {
            steps {
                sh "docker build -t ${DOCKER_IMAGE} ."
            }
        }
        stage('Deploy to Staging') {
            when {
                branch 'main'
            }
            steps {
                sh "kubectl set image deployment/myapp myapp=${DOCKER_IMAGE} -n staging"
            }
        }
    }

    post {
        failure {
            slackSend(channel: '#alerts', message: "Build failed: ${env.BUILD_URL}")
        }
        success {
            echo 'Pipeline finished successfully!'
        }
    }
}
```

## Jenkinsfile – Scripted Pipeline (גישה ישנה יותר, גמישה יותר)

```groovy
node {
    stage('Checkout') {
        checkout scm
    }
    stage('Build') {
        sh 'npm install && npm run build'
    }
    stage('Test') {
        try {
            sh 'npm test'
        } catch (err) {
            currentBuild.result = 'UNSTABLE'
        }
    }
}
```

## Jenkins Agents דינמיים על Kubernetes

```groovy
pipeline {
    agent {
        kubernetes {
            yaml """
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: maven
    image: maven:3.9-eclipse-temurin-17
    command: ['cat']
    tty: true
"""
        }
    }
    stages {
        stage('Build') {
            steps {
                container('maven') {
                    sh 'mvn -B clean package'
                }
            }
        }
    }
}
```

## Plugins חשובים

| Plugin | שימוש |
|---|---|
| Pipeline | הרצת Jenkinsfile |
| Git / GitHub Integration | חיבור ל-repos ו-webhooks |
| Blue Ocean | UI מודרני לצפייה ב-pipelines |
| Credentials Binding | ניהול סודות מאובטח |
| Kubernetes | הרצת agents דינמיים כ-Pods |
| SonarQube Scanner | ניתוח איכות קוד |
| Slack Notification | התראות |

## טיפים וטריקים

1. **השתמש ב-Shared Libraries** – קוד Groovy משותף (`vars/*.groovy`) כדי לא לחזור על אותה לוגיקה בכל Jenkinsfile.
2. **Credentials Binding** – לעולם אל תכתוב סודות ב-Jenkinsfile; השתמש ב-`withCredentials`.
3. **Parallel Stages** – הרץ בדיקות שונות במקביל עם בלוק `parallel`.
4. **Timeout ו-Retry** – עטוף שלבים לא יציבים (כמו deploy לרשת חיצונית) ב-`timeout` ו-`retry`.
5. **Ephemeral Agents** – השתמש ב-Kubernetes/Docker agents שנוצרים ונהרסים לכל build, כדי למנוע "זיהום סביבה" בין builds.
6. **Blue Ocean** – ממשק ויזואלי הרבה יותר נוח מה-UI הקלאסי לצפייה בפייפליינים.

```groovy
stage('Parallel Tests') {
    parallel {
        stage('Unit Tests') {
            steps { sh 'npm run test:unit' }
        }
        stage('Lint') {
            steps { sh 'npm run lint' }
        }
        stage('Security Scan') {
            steps { sh 'npm audit' }
        }
    }
}
```

## שאלות ראיון עבודה נפוצות

**ש: מה ההבדל בין Declarative ל-Scripted Pipeline ב-Jenkins?**
ת: Declarative הוא syntax מובנה ומחמיר יותר (`pipeline { stages { ... } }`), קל יותר לקריאה ולתחזוקה. Scripted הוא Groovy גמיש לחלוטין, נותן שליטה מלאה אך מסובך יותר ודורש ידע ב-Groovy.

**ש: מה זה Jenkins Agent ולמה צריך כמה?**
ת: Agent הוא מכונה שמריצה את העבודה בפועל. שימוש בכמה agents מאפשר הרצה מקבילית, בידוד סביבות (למשל agent עם Windows לעומת Linux), וסקיילינג אופקי.

**ש: איך מנהלים סודות (secrets) ב-Jenkins בצורה בטוחה?**
ת: דרך Jenkins Credentials Store, ושימוש בבלוק `withCredentials` שמזריק את הסוד כמשתנה סביבה בלבד לזמן הריצה של השלב, מבלי לחשוף אותו ב-logs.

**ש: מה זה Jenkins Shared Library ולמה זה שימושי?**
ת: מנגנון שמאפשר להגדיר פונקציות/steps משותפים בריפוזיטורי נפרד ולייבא אותם לכל Jenkinsfile, כדי למנוע כפילות קוד בין פרויקטים רבים.

**ש: איך תבנה Pipeline שממתין לאישור ידני לפני deploy לפרודקשן?**
ת: באמצעות ה-step `input` בתוך stage, שעוצר את ה-pipeline וממתין לאישור אדם דרך ה-UI, לרוב עם timeout מוגדר.

```groovy
stage('Approve Production Deploy') {
    steps {
        input message: 'Deploy to production?', ok: 'Deploy'
    }
}
```

## קישורים חיצוניים

**YouTube:**
- [Jenkins Tutorial – TechWorld with Nana (Install Jenkins)](https://www.youtube.com/c/TechWorldwithNana)
- [Jenkins Pipeline Tutorial for Beginners](https://www.youtube.com/results?search_query=jenkins+pipeline+tutorial+for+beginners)
- [Jenkins Shared Library Explained](https://www.youtube.com/results?search_query=jenkins+shared+library+explained)

**דוקומנטציה:**
- [Jenkins Official Docs](https://www.jenkins.io/doc/)
- [Pipeline Syntax Reference](https://www.jenkins.io/doc/book/pipeline/syntax/)
- [Jenkins Kubernetes Plugin](https://plugins.jenkins.io/kubernetes/)
- [Jenkins Shared Libraries Docs](https://www.jenkins.io/doc/book/pipeline/shared-libraries/)
