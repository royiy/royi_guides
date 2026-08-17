---
title: "Jenkins ו-Docker - אינטגרציה מלאה"
category: DevOps/Jenkins
part: 6/10
---

## מבוא
שילוב Jenkins עם Docker הוא סטנדרט בתעשייה כיום - הן להרצת agents/build environments עקביים, והן לבניית ופריסת images. במדריך הזה נכסה את כל הדרכים לשלב בין השניים.

## הרצת Build בתוך Container (Docker Pipeline Plugin)

```groovy
pipeline {
    agent {
        docker {
            image 'node:20-alpine'
            args '-u root:root'
        }
    }
    stages {
        stage('Build') {
            steps {
                sh 'npm ci && npm run build'
            }
        }
    }
}
```

## שימוש ב-Docker שונה לכל Stage

```groovy
pipeline {
    agent none
    stages {
        stage('Build Frontend') {
            agent {
                docker { image 'node:20-alpine' }
            }
            steps {
                sh 'npm run build'
            }
        }
        stage('Build Backend') {
            agent {
                docker { image 'golang:1.22' }
            }
            steps {
                sh 'go build ./...'
            }
        }
        stage('Run Python Tests') {
            agent {
                docker { image 'python:3.12-slim' }
            }
            steps {
                sh 'pip install -r requirements.txt && pytest'
            }
        }
    }
}
```

## בניית Docker Image ודחיפה ל-Registry

```groovy
pipeline {
    agent any

    environment {
        DOCKERHUB_CREDS = credentials('dockerhub-creds')
        IMAGE_NAME = 'myorg/myapp'
    }

    stages {
        stage('Build Image') {
            steps {
                script {
                    dockerImage = docker.build("${IMAGE_NAME}:${env.BUILD_NUMBER}")
                }
            }
        }

        stage('Test Image') {
            steps {
                sh "docker run --rm ${IMAGE_NAME}:${env.BUILD_NUMBER} npm test"
            }
        }

        stage('Push to Registry') {
            steps {
                script {
                    docker.withRegistry('https://registry.hub.docker.com', 'dockerhub-creds') {
                        dockerImage.push("${env.BUILD_NUMBER}")
                        dockerImage.push('latest')
                    }
                }
            }
        }
    }

    post {
        always {
            sh "docker rmi ${IMAGE_NAME}:${env.BUILD_NUMBER} || true"
        }
    }
}
```

## שימוש ב-sh פשוט לבניה ודחיפה (חלופה בלי הפלוגין המיוחד)

```groovy
stage('Build & Push') {
    steps {
        withCredentials([usernamePassword(
            credentialsId: 'dockerhub-creds',
            usernameVariable: 'DOCKER_USER',
            passwordVariable: 'DOCKER_PASS'
        )]) {
            sh '''
                echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
                docker build -t myorg/myapp:${BUILD_NUMBER} .
                docker push myorg/myapp:${BUILD_NUMBER}
            '''
        }
    }
}
```

## Jenkins Agent כ-Docker Container דינמי (Kubernetes Plugin)

```groovy
pipeline {
    agent {
        kubernetes {
            yaml '''
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: maven
    image: maven:3.9-eclipse-temurin-17
    command:
    - cat
    tty: true
  - name: docker
    image: docker:24-dind
    securityContext:
      privileged: true
'''
        }
    }
    stages {
        stage('Build') {
            steps {
                container('maven') {
                    sh 'mvn clean package'
                }
            }
        }
        stage('Docker Build') {
            steps {
                container('docker') {
                    sh 'docker build -t myapp:latest .'
                }
            }
        }
    }
}
```

## Docker-in-Docker (DinD) מול Docker socket mounting

**אופציה 1 - שיתוף ה-Docker socket של ה-host (מומלץ יותר, פשוט וקל):**
```bash
docker run -d \
  -v /var/run/docker.sock:/var/run/docker.sock \
  jenkins/jenkins:lts
```
יתרון: מהיר, לא צריך privileged mode.
חיסרון: containers שנוצרים "אחים" ל-container של Jenkins, לא "ילדים" שלו - יש לזה השלכות אבטחה (המשתמש בתוך Jenkins יכול לשלוט בכל ה-Docker daemon של ה-host).

**אופציה 2 - Docker-in-Docker אמיתי (dind):**
```groovy
agent {
    docker {
        image 'docker:24-dind'
        args '--privileged'
    }
}
```
יתרון: בידוד טוב יותר. חיסרון: דורש `--privileged`, ולפעמים בעיות ביצועים ו-caching.

## דוגמה מלאה: Multi-stage Dockerfile לבנייה יעילה

```dockerfile
# Dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
```

ב-Jenkinsfile:
```groovy
stage('Build & Push Multi-stage Image') {
    steps {
        sh 'docker build -t myorg/myapp:${BUILD_NUMBER} .'
    }
}
```

## ניקוי Images ישנים (חשוב מאוד ל-disk space)

```groovy
post {
    always {
        sh '''
            docker image prune -f
            docker images "myorg/myapp" --format "{{.Tag}}" | tail -n +6 | xargs -I {} docker rmi myorg/myapp:{} || true
        '''
    }
}
```

## טיפים וטריקים
- תמיד תייגו images עם `${BUILD_NUMBER}` או git commit hash, לא רק `latest` - כדי שיהיה traceability מלא.
- השתמשו ב-`.dockerignore` כדי להאיץ build context ולמנוע חשיפת קבצים רגישים.
- שקלו BuildKit (`DOCKER_BUILDKIT=1`) לביצועים משופרים ו-cache mounts.
- אם ה-agent הוא container זמני, שימו לב ל-file permissions - לעיתים צריך `args '-u root:root'`.
- נקו images ישנים באופן קבוע כדי למנוע אזלת disk space על ה-Jenkins agents.

## פתרון בעיות נפוצות

| בעיה | פתרון |
|---|---|
| "permission denied" בגישה ל-docker.sock | הוסיפו את משתמש jenkins לקבוצת docker: `usermod -aG docker jenkins` |
| Build תקוע/איטי מאוד | בדקו cache ל-layers, שקלו BuildKit |
| Disk מתמלא מ-images ישנים | הוסיפו `docker system prune` מתוזמן |
| "Cannot connect to Docker daemon" בתוך container | ודאו mount נכון של socket או שימוש ב-dind |

## קישורים לתיעוד רשמי
- Docker Pipeline Plugin: https://www.jenkins.io/doc/book/pipeline/docker/
- Kubernetes Plugin: https://plugins.jenkins.io/kubernetes/
- Using Docker with Pipeline (Guided Tour): https://www.jenkins.io/doc/book/pipeline/docker/

## קישורי YouTube מומלצים
- Jenkins Tutorial - Deploy with Docker + Linux (freeCodeCamp): https://www.youtube.com/watch?v=6YZvp2GwT0A
- Jenkins Full Course (Simplilearn): https://www.youtube.com/watch?v=MayMkFCkzj4

## שאלות ראיון עבודה בנושא Jenkins ו-Docker

**ש: מה ההבדל בין שיתוף docker.sock לבין Docker-in-Docker אמיתי?**
ת: שיתוף socket מריץ containers "אחים" ל-Jenkins על ה-host daemon עצמו - פשוט ומהיר אבל עם השלכות אבטחה (גישה מלאה ל-daemon). DinD אמיתי מריץ Docker daemon נפרד בתוך container, עם בידוד טוב יותר אך דורש privileged mode ולעיתים בעיות ביצועים.

**ש: איך הייתם מנקים images ישנים כדי לא למלא את הדיסק?**
ת: הוספת stage או job מתוזמן שמריץ `docker image prune` ומגביל את מספר הגרסאות השמורות לכל image, בנוסף ל-`post { always { ... } }` בכל pipeline לניקוי images שנוצרו בבילד הנוכחי.

**ש: מה היתרון בשימוש ב-Kubernetes plugin להרצת Jenkins agents?**
ת: מאפשר agents דינמיים ואפמריים (ephemeral) שנוצרים per-build ונמחקים אחרי, מה שנותן scaling אלסטי, בידוד מלא בין builds, וניצול משאבים יעיל יותר מאשר agents סטטיים.

**ש: איך מבטיחים שה-image שנבנה זהה ל-image שנבדק ונפרס?**
ת: על ידי תיוג ה-image בבנייה אחת (למשל עם commit hash), והשימוש באותו tag בכל שלבי הבדיקה והפריסה, ללא re-build בין השלבים ("build once, deploy everywhere").

**ש: מהו Multi-stage Dockerfile ולמה הוא שימושי ב-CI?**
ת: מאפשר להשתמש בכמה שלבי build ב-Dockerfile אחד (למשל build עם כלים כבדים, ואז runtime image קליל) - מקטין את גודל ה-image הסופי ומשפר אבטחה על ידי הסרת כלי build מיותרים מה-production image.
