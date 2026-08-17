# מדריך 5: שילוב Jenkins עם Git, GitHub ו-Webhooks

## מבוא
שילוב Jenkins עם מערכת בקרת גרסאות הוא הבסיס לכל תהליך CI/CD. במדריך הזה נעבור על חיבור Jenkins ל-Git/GitHub/GitLab, הגדרת Webhooks להפעלה אוטומטית, ו-Multibranch Pipelines.

## הגדרת Job בסיסי עם Git

ב-Freestyle Job:
1. Source Code Management → Git
2. Repository URL: `https://github.com/myorg/myrepo.git`
3. Credentials: בוחרים מ-Credentials Store
4. Branch: `*/main`

ב-Pipeline (Jenkinsfile), ה-checkout נראה כך:

```groovy
pipeline {
    agent any
    stages {
        stage('Checkout') {
            steps {
                git branch: 'main',
                    credentialsId: 'github-ssh-key',
                    url: 'git@github.com:myorg/myrepo.git'
            }
        }
    }
}
```

או פשוט עם `checkout scm` כאשר ה-Pipeline מוגדר כ-"Pipeline script from SCM":

```groovy
stage('Checkout') {
    steps {
        checkout scm
    }
}
```

## הגדרת Credentials ל-Git

### SSH Key
1. Manage Jenkins → Credentials → System → Global credentials
2. Kind: "SSH Username with private key"
3. הדביקו את המפתח הפרטי

### Personal Access Token (GitHub)
1. Kind: "Username with password" או "Secret text"
2. Username: שם המשתמש ב-GitHub
3. Password: ה-PAT (Personal Access Token) עם הרשאות `repo` ו-`admin:repo_hook`

## הגדרת Webhook ב-GitHub להפעלה אוטומטית

1. ב-GitHub repo: Settings → Webhooks → Add webhook
2. Payload URL: `http://your-jenkins-url/github-webhook/`
3. Content type: `application/json`
4. Events: "Just the push event" או "Let me select individual events" (push, pull_request)

ב-Jenkins Job:
- Build Triggers → "GitHub hook trigger for GITScm polling"

## Multibranch Pipeline - הגדרה מלאה

Multibranch Pipeline סורק אוטומטית את כל ה-branches וה-PRs ב-repository, ויוצר job נפרד לכל אחד:

1. New Item → Multibranch Pipeline
2. Branch Sources → GitHub
3. Repository URL + Credentials
4. Behaviors: "Discover branches", "Discover pull requests from origin"
5. Scan Repository Triggers: "Periodically if not otherwise run" (למשל כל דקה) - או webhook

```groovy
// Jenkinsfile בשורש ה-repo, נטען אוטומטית לכל branch
pipeline {
    agent any
    stages {
        stage('Info') {
            steps {
                echo "Branch: ${env.BRANCH_NAME}"
                echo "Change ID (אם PR): ${env.CHANGE_ID}"
            }
        }
        stage('Build') {
            steps {
                sh './build.sh'
            }
        }
    }
}
```

## שימוש ב-GitHub Status Checks

```groovy
stage('Report Status') {
    steps {
        script {
            githubNotify(
                context: 'jenkins-ci',
                status: 'SUCCESS',
                description: 'כל הבדיקות עברו בהצלחה'
            )
        }
    }
}
```

## Polling כאלטרנטיבה ל-Webhooks (כשאין גישה מבחוץ)

```groovy
// בהגדרות ה-job, לא ב-Jenkinsfile:
// Build Triggers → Poll SCM
// Schedule: H/5 * * * *  (כל 5 דקות בערך)
```

טיפ: Polling פחות יעיל מ-webhooks (עומס מיותר, עיכוב עד לזיהוי שינוי), אבל שימושי כש-Jenkins נמצא מאחורי firewall ולא נגיש מהאינטרנט.

## GitLab Integration

```groovy
pipeline {
    agent any
    triggers {
        gitlab(triggerOnPush: true, triggerOnMergeRequest: true, branchFilterType: 'All')
    }
    stages {
        stage('Build') {
            steps {
                sh './build.sh'
            }
        }
    }
    post {
        success {
            updateGitlabCommitStatus name: 'build', state: 'success'
        }
        failure {
            updateGitlabCommitStatus name: 'build', state: 'failed'
        }
    }
}
```

## שימוש בתגיות Git (Tags) להפעלת release

```groovy
pipeline {
    agent any
    stages {
        stage('Release') {
            when {
                buildingTag()
            }
            steps {
                echo "בונה release עבור tag: ${env.TAG_NAME}"
                sh './release.sh'
            }
        }
    }
}
```

## פתרון בעיות נפוצות

| בעיה | פתרון |
|---|---|
| Webhook לא מגיע ל-Jenkins | בדקו firewall/NAT, ודאו URL נכון, בדקו "Recent Deliveries" ב-GitHub webhook settings |
| Permission denied (publickey) | ודאו שה-public key מוגדר ב-GitHub Deploy Keys/SSH Keys ומתאים ל-private key ב-Jenkins Credentials |
| Multibranch לא מזהה branches חדשים | הריצו "Scan Repository Now" ידנית, בדקו הרשאות ה-token |
| Job רץ פעמיים על כל push | ודאו שאין גם webhook וגם polling מוגדרים יחד |

## טיפים וטריקים
- השתמשו ב-Deploy Keys ייעודיים (read-only) ל-repos בודדים במקום SSH key גלובלי של המשתמש.
- ב-GitHub Organizations, עדיף "GitHub Organization" folder ב-Jenkins שסורק את כל ה-repos בארגון אוטומטית.
- `changeRequest()` בתוך `when` מזהה האם ה-build רץ על Pull Request.
- שילוב עם ngrok לבדיקת webhooks בסביבת פיתוח מקומית ללא IP ציבורי.

## קישורים לתיעוד רשמי
- Git Plugin: https://plugins.jenkins.io/git/
- GitHub Branch Source Plugin: https://plugins.jenkins.io/github-branch-source/
- Multibranch Pipeline: https://www.jenkins.io/doc/book/pipeline/multibranch/
- GitHub Webhooks Docs: https://docs.github.com/en/webhooks

## קישורי YouTube מומלצים
- Jenkins Tutorial (כולל הגדרת Git ו-webhooks): https://www.youtube.com/watch?v=6YZvp2GwT0A
- Jenkins Full Course: https://www.youtube.com/watch?v=MayMkFCkzj4

## שאלות ראיון עבודה בנושא Git/GitHub Integration

**ש: מה ההבדל בין Polling ל-Webhooks בהפעלת builds?**
ת: Polling הוא בדיקה תקופתית יזומה של Jenkins מול ה-repo (עומס מיותר, עיכוב). Webhook הוא push התראה מה-Git server ל-Jenkins ברגע שקורה אירוע - מיידי ויעיל יותר, אבל דורש ש-Jenkins יהיה נגיש מהאינטרנט.

**ש: איך מגדירים Jenkins להריץ build אוטומטית על כל Pull Request?**
ת: באמצעות Multibranch Pipeline או GitHub Organization folder, עם Behavior "Discover pull requests from origin/forks", יחד עם webhook או polling.

**ש: מה זה Multibranch Pipeline ומה היתרון שלו?**
ת: פיצ'ר שסורק אוטומטית repository ויוצר job נפרד לכל branch שמכיל Jenkinsfile - חוסך יצירת jobs ידנית לכל branch, ומנקה jobs אוטומטית כש-branch נמחק.

**ש: איך שומרים credentials של Git בצורה מאובטחת ב-Jenkins?**
ת: דרך Jenkins Credentials Store (מוצפן ב-JENKINS_HOME), עם scope מוגבל, לרוב SSH key ייעודי (Deploy Key) עם הרשאות read-only, ולא שימוש בפרטי המשתמש האישיים.

**ש: מה זה `env.CHANGE_ID` ומתי הוא זמין?**
ת: משתנה סביבה שזמין ב-Multibranch Pipeline כאשר ה-build רץ על Pull Request, מכיל את מספר ה-PR.
