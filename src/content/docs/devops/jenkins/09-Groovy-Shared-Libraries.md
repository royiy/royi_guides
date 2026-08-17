# מדריך 9: Groovy Scripting ו-Shared Libraries ב-Jenkins

## מבוא
כש-Jenkinsfiles מתחילים לחזור על עצמם בין פרויקטים, הפתרון הוא **Shared Libraries** - קוד Groovy משותף שנטען לתוך כל pipeline. זה מאפשר DRY (Don't Repeat Yourself) ברמת ארגון שלם.

## מבנה תיקיות של Shared Library

```
(root)
├── vars/
│   ├── buildApp.groovy
│   ├── deployToK8s.groovy
│   └── notifySlack.groovy
├── src/
│   └── com/
│       └── mycompany/
│           └── PipelineUtils.groovy
└── resources/
    └── com/
        └── mycompany/
            └── config-template.yaml
```

- **vars/** - global variables/functions, נגישות ישירות כ-steps ב-Jenkinsfile
- **src/** - קוד Groovy מלא (classes), נגיש דרך `import`
- **resources/** - קבצים סטטיים שנטענים עם `libraryResource`

## הגדרת Shared Library ב-Jenkins

Manage Jenkins → System → Global Pipeline Libraries:
- Name: `my-shared-lib`
- Default version: `main`
- Retrieval method: Modern SCM → Git → `https://github.com/myorg/jenkins-shared-lib.git`

## דוגמה: vars/buildApp.groovy

```groovy
// vars/buildApp.groovy
def call(Map config = [:]) {
    def language = config.language ?: 'node'
    def version = config.version ?: 'latest'

    pipeline {
        agent any
        stages {
            stage('Build') {
                steps {
                    script {
                        if (language == 'node') {
                            sh 'npm ci && npm run build'
                        } else if (language == 'java') {
                            sh 'mvn clean package'
                        } else {
                            error "שפה לא נתמכת: ${language}"
                        }
                    }
                }
            }
        }
    }
}
```

שימוש ב-Jenkinsfile:
```groovy
@Library('my-shared-lib') _

buildApp(language: 'node', version: '20')
```

## דוגמה: vars/notifySlack.groovy

```groovy
// vars/notifySlack.groovy
def call(String status, String channel = '#ci-cd') {
    def color = status == 'SUCCESS' ? 'good' : 'danger'
    def emoji = status == 'SUCCESS' ? '✅' : '❌'

    slackSend(
        channel: channel,
        color: color,
        message: "${emoji} ${env.JOB_NAME} #${env.BUILD_NUMBER} - ${status}\n${env.BUILD_URL}"
    )
}
```

שימוש:
```groovy
@Library('my-shared-lib') _

pipeline {
    agent any
    stages {
        stage('Build') {
            steps { sh 'make build' }
        }
    }
    post {
        success { notifySlack('SUCCESS') }
        failure { notifySlack('FAILURE') }
    }
}
```

## דוגמה: src/ עם Class מלאה

```groovy
// src/com/mycompany/DeploymentHelper.groovy
package com.mycompany

class DeploymentHelper implements Serializable {
    def steps

    DeploymentHelper(steps) {
        this.steps = steps
    }

    def deployToEnvironment(String env, String version) {
        steps.echo "פורס גרסה ${version} לסביבת ${env}"
        steps.sh "kubectl set image deployment/myapp myapp=myorg/myapp:${version} -n ${env}"
        steps.sh "kubectl rollout status deployment/myapp -n ${env} --timeout=120s"
    }

    def validateEnvironment(String env) {
        def allowed = ['dev', 'staging', 'production']
        if (!allowed.contains(env)) {
            steps.error "סביבה לא חוקית: ${env}"
        }
    }
}
```

שימוש ב-Jenkinsfile:
```groovy
@Library('my-shared-lib') _
import com.mycompany.DeploymentHelper

pipeline {
    agent any
    stages {
        stage('Deploy') {
            steps {
                script {
                    def helper = new DeploymentHelper(this)
                    helper.validateEnvironment(params.ENVIRONMENT)
                    helper.deployToEnvironment(params.ENVIRONMENT, params.VERSION)
                }
            }
        }
    }
}
```

## שימוש ב-resources/

```groovy
// vars/loadConfig.groovy
def call(String envName) {
    def configText = libraryResource "com/mycompany/config-${envName}.yaml"
    return readYaml text: configText
}
```

## טעינת Library דינמית (Dynamic Loading)

```groovy
library identifier: 'my-shared-lib@main', retriever: modernSCM(
    [$class: 'GitSCMSource', remote: 'https://github.com/myorg/jenkins-shared-lib.git']
)

buildApp(language: 'java')
```

## Groovy Scripting - יסודות שימושיים

```groovy
// עבודה עם Lists ו-Maps
def environments = ['dev', 'staging', 'prod']
environments.each { env ->
    echo "בודק סביבה: ${env}"
}

def config = [
    name: 'myapp',
    replicas: 3,
    env: [DB_HOST: 'db.internal', LOG_LEVEL: 'info']
]
echo "אפליקציה: ${config.name}, replicas: ${config.replicas}"

// String manipulation
def branch = env.BRANCH_NAME ?: 'unknown'
def safeTag = branch.replaceAll('[^a-zA-Z0-9._-]', '-').toLowerCase()

// Closures כפרמטרים
def retryWithBackoff(int attempts, Closure body) {
    for (int i = 0; i < attempts; i++) {
        try {
            return body()
        } catch (Exception e) {
            if (i == attempts - 1) throw e
            sleep(time: (i + 1) * 5, unit: 'SECONDS')
        }
    }
}

retryWithBackoff(3) {
    sh 'curl -f https://api.example.com/health'
}
```

## בדיקות (Unit Testing) ל-Shared Library

```groovy
// test/groovy/BuildAppTest.groovy - עם JenkinsPipelineUnit
import com.lesfurets.jenkins.unit.BasePipelineTest
import org.junit.Test
import static org.junit.Assert.assertTrue

class BuildAppTest extends BasePipelineTest {
    @Test
    void "buildApp runs npm for node language"() {
        def script = loadScript('vars/buildApp.groovy')
        script.call(language: 'node')
        assertJobStatusSuccess()
    }
}
```

## טיפים וטריקים
- שמרו על `Serializable` בכל class ב-`src/` - Jenkins Pipeline משתמש ב-CPS (Continuation Passing Style) ודורש serialization.
- אל תשתמשו ב-`@NonCPS` אלא אם ממש נדרש (בעיקר לפעולות כבדות כמו sort/collect מורכבים) - זה משבש checkpoint/resume.
- תעדו כל `vars/*.groovy` עם קובץ `.txt` תואם (למשל `buildApp.txt`) שמופיע כ-help ב-UI.
- בדקו Shared Libraries עם JenkinsPipelineUnit לפני שמפיצים אותן לכל הארגון.
- השתמשו ב-versioning (`@Library('my-lib@v2.0')`) כדי לא לשבור pipelines קיימים כשמעדכנים את ה-library.

## קישורים לתיעוד רשמי
- Shared Libraries: https://www.jenkins.io/doc/book/pipeline/shared-libraries/
- Groovy Language Documentation: https://groovy-lang.org/documentation.html
- Pipeline CPS Method Mismatches: https://www.jenkins.io/doc/book/pipeline/cps-method-mismatches/

## קישורי YouTube מומלצים
- Jenkins Full Course (כולל Groovy): https://www.youtube.com/watch?v=6YZvp2GwT0A
- Jenkins Tutorial for Beginners: https://www.youtube.com/watch?v=MayMkFCkzj4

## שאלות ראיון עבודה בנושא Groovy ו-Shared Libraries

**ש: מה ההבדל בין תיקיית `vars/` לתיקיית `src/` ב-Shared Library?**
ת: `vars/` מכיל global variables/steps שנגישים ישירות מ-Jenkinsfile כפונקציות (כמו step מובנה). `src/` מכיל Groovy classes מלאים שנטענים עם `import` - מתאים ללוגיקה מורכבת יותר עם state ו-OOP.

**ש: למה classes ב-Shared Library צריכים להיות `Serializable`?**
ת: Jenkins Pipeline משתמש ב-CPS (Continuation Passing Style) כדי לאפשר עצירה והמשך (pause/resume) של pipelines - למשל אחרי restart של Jenkins. אובייקטים שאינם serializable ישברו את היכולת הזו.

**ש: מה תפקיד ה-annotation `@NonCPS` ומתי משתמשים בו?**
ת: מסמן method שירוץ כ-Groovy רגיל בלי CPS transformation - שימושי לפעולות מורכבות כמו sort/collect שה-CPS transformation יכולה לשבש, אבל משבש checkpoint/resume ולכן משתמשים בו בזהירות ורק כשצריך.

**ש: איך בודקים Shared Library לפני שמפיצים אותה לכל הארגון?**
ת: עם ספריית JenkinsPipelineUnit שמאפשרת להריץ unit tests על `vars/*.groovy` כמו קוד Groovy/Java רגיל, בלי צורך ב-Jenkins server אמיתי.

**ש: מה היתרון המרכזי של Shared Libraries בארגון עם הרבה צוותים?**
ת: DRY - מרכזת לוגיקה משותפת (build, deploy, notifications, validation) במקום אחד שכל הצוותים משתמשים בו, כך שתיקון/שיפור נעשה פעם אחת ומשפיע על כל ה-pipelines, במקום כפילות קוד בעשרות Jenkinsfiles.

**ש: איך שולטים בגרסה של Shared Library שנטענת ב-pipeline מסוים?**
ת: באמצעות `@Library('my-lib@v2.0')` שמצביע על tag/branch ספציפי, מה שמאפשר לעדכן library מבלי לשבור pipelines שעדיין תלויים בגרסה ישנה יותר.
