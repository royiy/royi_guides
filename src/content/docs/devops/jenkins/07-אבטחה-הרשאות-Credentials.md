# מדריך 7: אבטחה, הרשאות וניהול Credentials ב-Jenkins

## מבוא
Jenkins הוא לרוב מערכת בעלת גישה רחבה - לקוד המקור, ל-secrets, לתשתית production. אבטחה לא נכונה של Jenkins היא אחד הווקטורים הנפוצים ביותר לתקיפות אספקת שרשרת (supply chain). במדריך הזה נכסה RBAC, ניהול credentials, ו-hardening.

## הפעלת Security (אם עדיין לא מופעל)
Manage Jenkins → Security → Configure Global Security:
- Enable security: ✅
- Security Realm: Jenkins own user database (או LDAP/SAML/OAuth בארגונים)
- Authorization: Matrix-based או Role-Based (דורש plugin)

## Role-Based Access Control (RBAC)

התקנת **Role-based Authorization Strategy plugin**, ואז:

1. Manage Jenkins → Manage and Assign Roles → Manage Roles
2. יוצרים roles ברמת Global (למשל `admin`, `developer`, `viewer`)
3. יוצרים roles ברמת Item/Project (למשל הרשאות ספציפיות ל-folder מסוים)
4. Manage and Assign Roles → Assign Roles - משייכים משתמשים/קבוצות ל-roles

דוגמה למבנה roles טיפוסי:

| Role | הרשאות |
|---|---|
| `admin` | Overall/Administer - גישה מלאה |
| `developer` | Job/Build, Job/Read, Job/Workspace |
| `viewer` | Job/Read בלבד |
| `release-manager` | Job/Build על folder "production/*" בלבד |

## ניהול Credentials

Jenkins שומר credentials מוצפנים ב-`JENKINS_HOME/credentials.xml` (מוצפן עם master key ב-`secrets/`).

### סוגי Credentials נפוצים
- **Username with password** - למשל Docker Registry, Nexus
- **SSH Username with private key** - ל-Git
- **Secret text** - API tokens, webhook secrets
- **Secret file** - קבצי kubeconfig, certificates
- **Certificate** - PKCS#12

### שימוש ב-Credentials ב-Pipeline

```groovy
pipeline {
    agent any
    stages {
        stage('Deploy') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'aws-creds',
                        usernameVariable: 'AWS_ACCESS_KEY_ID',
                        passwordVariable: 'AWS_SECRET_ACCESS_KEY'
                    ),
                    string(credentialsId: 'slack-webhook', variable: 'SLACK_URL'),
                    file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG')
                ]) {
                    sh '''
                        aws s3 cp dist/ s3://my-bucket/ --recursive
                        kubectl apply -f deployment.yaml
                    '''
                }
            }
        }
    }
}
```

### Scoping Credentials
- **Global** - זמין לכל ה-jobs (להימנע כשאפשר)
- **System** - רק לתצורת Jenkins עצמה
- **Folder-level** - זמין רק ל-jobs בתוך folder מסוים (best practice בסביבות multi-team)

```groovy
// דוגמה: הגדרת credentials ברמת folder דרך JCasC
folder-credentials:
  domain: "production"
  scope: FOLDER
```

## Secrets Masking ו-שגיאות נפוצות

⚠️ **טעות נפוצה**: שימוש ב-string interpolation שגורם לחשיפת secret בלוג:

```groovy
// רע - הסוד עלול להיחשף בפקודות shell מורכבות
sh "curl -H 'Authorization: Bearer ${env.MY_SECRET}' https://api.example.com"
```

```groovy
// טוב יותר - שימוש במשתנה סביבה במקום אינטרפולציה ישירה
withCredentials([string(credentialsId: 'api-token', variable: 'TOKEN')]) {
    sh 'curl -H "Authorization: Bearer $TOKEN" https://api.example.com'
}
```

Jenkins ימסך (mask) אוטומטית ערכי credentials בלוג - אבל רק אם הם מוזרקים כמשתני סביבה נכונים, לא כשהם משורשרים (concatenated) לפני השימוש.

## Script Security ו-Sandbox

Pipelines מ-source control ("Pipeline from SCM") רצים ב-Groovy Sandbox כברירת מחדל, שמגביל שימוש בפעולות מסוכנות (כמו גישה ל-filesystem ישירות דרך Groovy, לא דרך `sh`/`bat`).

- אם script דורש הרשאות מיוחדות (whitelisting), מנהל צריך לאשר ב-**In-process Script Approval** (Manage Jenkins → Script Approval).
- מומלץ **לא** לתת ל-admin לאשר סקריפטים בעיוורון - לבדוק כל approval.

## Audit ו-Logging

- **Audit Trail plugin** - עוקב אחרי שינויי תצורה, מי הריץ מה
- לוגי build עצמם נשמרים תחת `JENKINS_HOME/jobs/<job-name>/builds/<number>/log`

## Hardening Checklist

- [ ] אין Anonymous access עם הרשאות build/read
- [ ] CSRF Protection מופעל (Manage Jenkins → Security)
- [ ] Agent → Master Access Control מוגבל (Manage Jenkins → Security)
- [ ] Jenkins לא רץ כ-root
- [ ] גישה ל-Script Console (`/script`) מוגבלת ל-admins בלבד
- [ ] HTTPS מול Jenkins (reverse proxy עם TLS)
- [ ] Credentials scoped ל-folder ולא global כשאפשר
- [ ] Plugins מעודכנים באופן קבוע (בדיקת CVEs)
- [ ] גיבויים מוצפנים ל-JENKINS_HOME
- [ ] הגבלת מי יכול ליצור/לערוך Jenkinsfile ב-repos רגישים

## דוגמה: Matrix-based Security דרך JCasC

```yaml
jenkins:
  authorizationStrategy:
    globalMatrix:
      permissions:
        - "Overall/Administer:admin"
        - "Overall/Read:authenticated"
        - "Job/Build:developers"
        - "Job/Read:developers"
```

## טיפים וטריקים
- אף פעם לא לשים secrets בקוד ה-Jenkinsfile או ב-environment variables גלויים - תמיד דרך Credentials Store.
- הפרידו בין credentials ל-dev/staging/production - אל תשתמשו באותו token לכל הסביבות.
- הגבילו מי יכול לגשת ל-`Script Console` - זו למעשה יכולת הרצת קוד שרירותי על ה-master.
- סיבבו (rotate) API tokens ו-SSH keys באופן תקופתי.
- שקלו Vault (HashiCorp) לניהול secrets דינמי במקום Jenkins Credentials Store הסטטי, בסביבות גדולות.

## קישורים לתיעוד רשמי
- Jenkins Security Overview: https://www.jenkins.io/doc/book/security/
- Managing Credentials: https://www.jenkins.io/doc/book/using/using-credentials/
- Role-based Authorization Strategy: https://plugins.jenkins.io/role-strategy/
- Script Security Plugin: https://plugins.jenkins.io/script-security/

## קישורי YouTube מומלצים
- Jenkins Full Course (כולל פרק אבטחה): https://www.youtube.com/watch?v=MayMkFCkzj4
- Jenkins Tutorial for Beginners: https://www.youtube.com/watch?v=Lxd6JMMxuwo

## שאלות ראיון עבודה בנושא אבטחה ב-Jenkins

**ש: איך הייתם מגנים על secrets בתוך Jenkins Pipeline?**
ת: שימוש ב-Credentials Store המובנה עם `withCredentials`, הימנעות מ-interpolation ישיר של secrets ל-shell strings, scoping credentials ברמת folder, וסיבוב (rotation) תקופתי של tokens.

**ש: מה זה Groovy Sandbox ולמה הוא חשוב?**
ת: מנגנון הגנה שמריץ Scripted Pipeline/script בלוקים בסביבה מוגבלת שחוסמת קריאות מסוכנות ל-Java/Groovy APIs. פעולות שאינן ב-whitelist דורשות אישור מפורש ב-Script Approval, כדי למנוע הרצת קוד זדוני דרך pipeline.

**ש: מה ההבדל בין Matrix-based ל-Role-based Authorization?**
ת: Matrix-based מגדיר הרשאות ישירות למשתמשים/קבוצות ברמה גלובלית או per-project. Role-based (plugin נוסף) מוסיף שכבת abstraction של "roles" הניתנים להקצאה, מה שמקל על ניהול הרשאות בארגונים גדולים עם משתמשים רבים.

**ש: למה מסוכן להריץ Jenkins עם Anonymous read/build permissions?**
ת: זה חושף מידע רגיש (קוד, לוגים, קונפיגורציה) לכל מי שיש לו גישת רשת ל-Jenkins, ועלול לאפשר לתוקף להריץ builds/scripts שרירותיים - פוטנציאל לפריצה מלאה של השרת ותשתיות מחוברות.

**ש: איך מגבילים גישה ל-Script Console ב-Jenkins ולמה זה קריטי?**
ת: מגבילים דרך authorization strategy כך שרק admins מורשים יגיעו ל-`/script` endpoint. Script Console מריץ קוד Groovy שרירותי ישירות על ה-master JVM עם הרשאות מלאות - זו למעשה יכולת RCE (Remote Code Execution) מובנית שצריך להגן עליה בקפידה.

**ש: מהם ה-scope levels האפשריים ל-Credential ב-Jenkins ומתי משתמשים בכל אחד?**
ת: Global (זמין לכל ה-Jenkins, פחות מומלץ), System (רק לתצורת Jenkins core), ו-Folder/Item-level (הכי מומלץ בארגונים - מגביל credentials ל-jobs ספציפיים, מה שמקטין blast radius אם job מסוים נפרץ).
