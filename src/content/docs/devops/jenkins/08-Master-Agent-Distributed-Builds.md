# מדריך 8: ארכיטקטורת Master/Agent (Controller/Agent) ו-Distributed Builds

## מבוא
בסביבות production אמיתיות, כמעט אף פעם לא מריצים builds ישירות על ה-Jenkins master (היום נקרא "Controller"). במקום זאת, משתמשים בארכיטקטורת Controller-Agent כדי לפזר עומס, לתמוך במגוון פלטפורמות, ולבודד builds.

## מונחים חשובים
- **Controller (לשעבר Master)** - המוח של Jenkins: UI, scheduling, ניהול תצורה
- **Agent (לשעבר Slave/Node)** - מכונה שמריצה את ה-builds בפועל
- **Executor** - "חריץ" (slot) על agent שיכול להריץ build אחד בו-זמנית
- **Label** - תגית שמשייכת agent ליכולות מסוימות (למשל `linux`, `docker`, `gpu`)

## למה לא להריץ הכל על ה-Controller?
1. **ביצועים** - הControlller אחראי על UI ו-scheduling, לא כדאי להעמיס עליו builds כבדים
2. **בידוד** - כל build צריך סביבה נקייה, לא לזהם את ה-controller
3. **סקיילביליות** - אפשר להוסיף agents לפי דרישה
4. **גיוון פלטפורמות** - agents שונים ל-Windows/Linux/macOS/ARM

## חיבור Agent דרך SSH

1. Manage Jenkins → Nodes → New Node
2. שם, סוג: "Permanent Agent"
3. Remote root directory: `/home/jenkins/agent`
4. Labels: `linux docker`
5. Launch method: "Launch agents via SSH"
6. Host, Credentials (SSH key)

```bash
# על מכונת ה-agent - הכנה
sudo useradd -m jenkins
sudo mkdir -p /home/jenkins/agent
sudo chown jenkins:jenkins /home/jenkins/agent
```

## חיבור Agent דרך JNLP (Java Web Start)

שימושי כש-Jenkins לא יכול ליזום חיבור SSH ל-agent (למשל agent מאחורי NAT):

```bash
# על מכונת ה-agent
java -jar agent.jar -url http://jenkins-controller:8080/ \
  -secret <SECRET_FROM_JENKINS_UI> \
  -name "my-agent-1" \
  -workDir "/home/jenkins/agent"
```

## Agent דינמי עם Docker

```groovy
pipeline {
    agent {
        label 'docker-capable'
    }
    stages {
        stage('Build') {
            agent {
                docker {
                    image 'maven:3.9-eclipse-temurin-17'
                    label 'docker-capable'
                }
            }
            steps {
                sh 'mvn clean package'
            }
        }
    }
}
```

## Agents אפמריים ב-Kubernetes (הכי נפוץ כיום ב-cloud)

```yaml
# Jenkins Cloud configuration (Kubernetes plugin)
apiVersion: v1
kind: Pod
metadata:
  labels:
    jenkins: agent
spec:
  containers:
  - name: jnlp
    image: jenkins/inbound-agent:latest
  - name: nodejs
    image: node:20
    command: ['cat']
    tty: true
```

ב-Jenkinsfile:
```groovy
pipeline {
    agent {
        kubernetes {
            label 'nodejs-agent'
            defaultContainer 'nodejs'
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

יתרון מרכזי: כל build מקבל Pod נקי חדש שנמחק בסוף - אין "זיהום" בין builds, וה-scaling אוטומטי לגמרי (autoscaling של ה-cluster).

## שימוש ב-Labels לבחירת Agent הנכון

```groovy
pipeline {
    agent { label 'windows && vs2022' }
    stages {
        stage('Build .NET') {
            steps {
                bat 'msbuild MyApp.sln'
            }
        }
    }
}
```

ניתן לשלב labels עם ביטויים לוגיים: `linux && docker`, `windows || macos`.

## הגדרת מספר Executors

- Manage Jenkins → Nodes → [Agent Name] → Configure
- "# of executors" - קובע כמה builds יכולים לרוץ בו-זמנית על אותו agent

טיפ: אל תגדירו יותר מדי executors על agent אחד אם ה-builds צורכים הרבה CPU/RAM - עלול לגרום ל-resource contention ולתוצאות לא יציבות.

## Node Provisioning אוטומטי (Cloud Agents)

Plugins שמאפשרים ליצור agents "לפי דרישה":
- **Amazon EC2 Plugin** - יוצר/מוחק EC2 instances לפי עומס builds
- **Kubernetes Plugin** - יוצר Pods לפי דרישה (הכי פופולרי היום)
- **Azure VM Agents Plugin**
- **Docker Plugin** - יוצר containers כ-agents

## מוניטורינג Agents

```groovy
// בדיקת סטטוס agent מתוך script
Jenkins.instance.computers.each { computer ->
    println "${computer.name}: ${computer.isOnline() ? 'online' : 'offline'}"
}
```
(מריצים דרך Script Console - Manage Jenkins → Script Console)

## פתרון בעיות נפוצות

| בעיה | פתרון |
|---|---|
| Agent לא מתחבר (SSH) | בדקו network/firewall, ואת ה-host key fingerprint |
| Build תקוע "Waiting for next available executor" | אין agents פנויים עם ה-label הנדרש - בדקו labels או הוסיפו agents |
| Agent מתנתק תדיר | בדקו יציבות רשת, timeout settings, משאבי מערכת (OOM) |
| קבצים "נעלמים" בין builds | ודאו ש-workspace לא משותף בין jobs שונים ללא צורך |

## טיפים וטריקים
- ב-cloud, השתמשו ב-Kubernetes plugin עם ephemeral agents - זה חוסך עלויות (agent קיים רק בזמן ה-build) ומבטיח סביבה נקייה.
- תייגו agents בבירור לפי יכולות (`gpu`, `docker`, `high-memory`) כדי לנתב builds לחומרה המתאימה.
- שקלו controller נפרד מ-agents תמיד - אל תריצו builds ישירות על ה-controller אפילו בסביבת פיתוח קטנה, כדי להרגיל את עצמכם לפרקטיקה הנכונה.
- נטרו executors מנוצלים ב-100% לאורך זמן - סימן שצריך להוסיף קיבולת (capacity).

## קישורים לתיעוד רשמי
- Distributed Builds: https://www.jenkins.io/doc/book/scaling/architecting-for-scale/
- Using Agents: https://www.jenkins.io/doc/book/using/using-agents/
- Kubernetes Plugin: https://plugins.jenkins.io/kubernetes/

## קישורי YouTube מומלצים
- Jenkins Full Course (ארכיטקטורה): https://www.youtube.com/watch?v=MayMkFCkzj4
- Jenkins Tutorial for Beginners: https://www.youtube.com/watch?v=Lxd6JMMxuwo

## שאלות ראיון עבודה בנושא Master/Agent Architecture

**ש: למה לא כדאי להריץ builds ישירות על ה-Jenkins controller?**
ת: הcontroller אחראי על UI, scheduling, וניהול כל המערכת - הרצת builds כבדים עליו עלולה להאט את כל Jenkins עבור כל המשתמשים, וגם חושפת סיכון אבטחה (build script רץ עם גישה לאותה מכונה שמריצה את כל Jenkins).

**ש: מה ההבדל בין agent סטטי (permanent) לבין agent דינמי (ephemeral)?**
ת: Agent סטטי הוא מכונה קבועה שמחוברת תמיד (למשל דרך SSH), בעוד agent דינמי (למשל Kubernetes Pod) נוצר רק כשיש build ונמחק בסופו - מה שנותן ניצול משאבים יעיל יותר, בידוד מלא, וסקיילביליות אוטומטית.

**ש: מה זה Label ב-Jenkins ואיך משתמשים בו?**
ת: תגית שמשויכת ל-agent ומתארת את יכולותיו (מערכת הפעלה, כלים מותקנים, חומרה). ב-Pipeline, `agent { label 'linux && docker' }` מבטיח שה-build ירוץ רק על agent שתואם את הביטוי הלוגי.

**ש: מה זה Executor וכמה כדאי להגדיר על agent אחד?**
ת: Executor הוא "חריץ" שמריץ build אחד בו-זמנית. כמות ה-executors צריכה להתאים למשאבי החומרה (CPU/RAM) של ה-agent - יותר מדי executors גורם ל-resource contention ותוצאות לא אמינות.

**ש: איך Jenkins מתמודד עם עומסים משתנים (scaling) בסביבת cloud?**
ת: באמצעות cloud plugins (Kubernetes, EC2, Azure VM Agents) שיוצרים agents לפי דרישה - כשיש builds ממתינים נוצרים agents חדשים, וכשאין עומס הם נמחקים, מה שחוסך עלויות ומספק אלסטיות.
