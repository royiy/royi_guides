---
sidebar_position: 1
title: "מדריך 1: מבוא ויסודות Terraform"
---

## מה זה Terraform?

Terraform הוא כלי **Infrastructure as Code (IaC)** בקוד פתוח שפותח על ידי חברת HashiCorp. הוא מאפשר לכם להגדיר תשתית ענן (ומקומית) בקבצי תצורה קריאים לבני אדם, ליצור גרסאות, לשתף אותם עם הצוות ולנהל את מחזור החיים המלא של התשתית - יצירה, עדכון ומחיקה - בצורה עקבית וניתנת לחיזוי.

במקום ללחוץ על כפתורים בקונסולת AWS/Azure/GCP, אתם כותבים קוד שמתאר **מה** אתם רוצים שיהיה קיים (declarative), ו-Terraform דואג ל**איך** להגיע לשם.

### למה זה טוב?

Terraform הפך לכלי סטנדרטי בתפקידי DevOps, Cloud Engineer, SRE ו-Platform Engineer. כמעט כל ראיון בתחומים האלה כולל שאלות על Terraform - מהיסודות ועד תרחישים מורכבים של ניהול state, מודולים ו-CI/CD.

---

## עקרון ה-Declarative לעומת Imperative

**Imperative (איך לעשות):**
```bash
aws ec2 run-instances --image-id ami-12345 --instance-type t2.micro
# אח"כ צריך לזכור למחוק, לעדכן ידנית וכו'
```

**Declarative (מה אני רוצה):**
```hcl
resource "aws_instance" "web" {
  ami           = "ami-12345"
  instance_type = "t2.micro"
}
```

Terraform משווה את המצב הרצוי (הקוד שלכם) מול המצב בפועל (מה שקיים בענן, מתועד ב-state) ומחשב את השינויים הנדרשים - זה נקרא **diff-based reconciliation**.

---

## שלושת שלבי ה-Workflow הבסיסי

1. **Write** - כותבים קובצי `.tf` המתארים את התשתית הרצויה
2. **Plan** - Terraform מציג "תוכנית" - מה ישתנה (Create/Update/Destroy)
3. **Apply** - מריצים בפועל את השינויים לאחר אישור

```
Write (.tf files) → terraform plan → review → terraform apply → Infrastructure
```

---

## התקנת Terraform

### macOS (Homebrew)
```bash
brew tap hashicorp/tap
brew install hashicorp/tap/terraform
```

### Linux (Debian/Ubuntu)
```bash
wget -O- https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list
sudo apt update && sudo apt install terraform
```

### Linux (RHEL/Amazon Linux)
```bash
sudo yum install -y yum-utils shadow-utils
sudo yum-config-manager --add-repo https://rpm.releases.hashicorp.com/AmazonLinux/hashicorp.repo
sudo yum install terraform
```

### וידוא ההתקנה
```bash
terraform -version
```

> **טיפ מקצועי:** מומלץ להשתמש ב-[tfenv](https://github.com/tfutils/tfenv) לניהול מספר גרסאות Terraform במקביל - כמו `nvm` ל-Node.js. זה קריטי כשעובדים על כמה פרויקטים עם דרישות גרסה שונות.

---

## הפרויקט הראשון שלכם - Hello World

צרו קובץ `main.tf`:

```hcl
terraform {
  required_providers {
    local = {
      source  = "hashicorp/local"
      version = "~> 2.4"
    }
  }
}

resource "local_file" "hello" {
  filename = "${path.module}/hello.txt"
  content  = "שלום עולם מ-Terraform!"
}
```

הרצה:
```bash
terraform init    # מוריד את ה-provider
terraform plan    # מציג מה ייווצר
terraform apply   # יוצר בפועל
```

תוצאה: קובץ `hello.txt` עם התוכן שהגדרתם. זו הדגמה טובה כי היא לא דורשת חשבון ענן.

---

## מבנה קבצים סטנדרטי בפרויקט Terraform

```
my-project/
├── main.tf          # ההגדרות העיקריות (resources)
├── variables.tf      # הגדרת משתני קלט
├── outputs.tf         # ערכי פלט
├── providers.tf       # הגדרת providers ו-backend
├── terraform.tfvars   # ערכים בפועל למשתנים (לא לשתף בגיט אם רגיש!)
├── versions.tf        # אילוצי גרסאות
└── modules/
    └── vpc/
        ├── main.tf
        ├── variables.tf
        └── outputs.tf
```

זהו המבנה שה-[Standard Module Structure](https://developer.hashicorp.com/terraform/language/modules/develop/structure) הרשמי ממליץ עליו.

---

## מושגי יסוד שחובה להכיר

| מושג | הסבר קצר |
|---|---|
| **Provider** | פלאגין שמאפשר ל-Terraform "לדבר" עם API של שירות (AWS, Azure, GCP, Kubernetes...) |
| **Resource** | רכיב תשתית בודד שאתם רוצים ליצור/לנהל (VM, Bucket, VPC...) |
| **Data Source** | שאילתת מידע על משאב קיים שלא נוצר על ידי הקונפיגורציה הזו |
| **State** | קובץ JSON ששומר את המיפוי בין ההגדרות שלכם למשאבים בפועל |
| **Module** | אוסף קבצי `.tf` הניתן לשימוש חוזר |
| **Variable** | פרמטר קלט לקונפיגורציה |
| **Output** | ערך פלט שהקונפיגורציה חושפת החוצה |
| **Backend** | היכן ה-state נשמר (מקומי, S3, Terraform Cloud...) |
| **Workspace** | מנגנון להפרדת מספר מופעי state לאותה קונפיגורציה |
| **Plan/Apply/Destroy** | שלושת הפעולות המרכזיות במחזור החיים |

---

## שאלות ראיון נפוצות על הפרק הזה

**1. מה ההבדל בין Terraform ל-Ansible/Chef/Puppet?**
Terraform מתמחה ב-**provisioning** (יצירת תשתית - VMs, רשתות, בסיסי נתונים), בעוד Ansible/Chef/Puppet מתמחים ב-**configuration management** (התקנת תוכנה והגדרתה בתוך שרתים קיימים). Terraform הוא declarative ו-immutable-oriented; Ansible הוא לרוב procedural.

**2. למה Terraform הוא "declarative"?**
כי מגדירים את המצב הסופי הרצוי, לא את הצעדים להגיע אליו. Terraform מחשב את ה-execution plan בעצמו על סמך גרף התלויות (DAG) בין המשאבים.

**3. מה זה Idempotency ולמה זה קריטי ל-Terraform?**
הרצה חוזרת של `terraform apply` על אותו קוד לא אמורה לשנות דבר אם כלום לא השתנה בפועל - זו תכונת idempotency. היא מבטיחה עקביות והיא הבסיס לכך שאפשר להריץ את אותו קוד שוב ושוב בבטחה.

**4. מה קורה אם מוחקים ידנית משאב מהענן בלי לעדכן את הקוד?**
נוצר "drift" - פער בין ה-state לבין המציאות. בפעם הבאה ש-`terraform plan` ירוץ, הוא יזהה שהמשאב לא קיים ויציע ליצור אותו מחדש.

---

## טעויות נפוצות של מתחילים

- **הרצת `terraform apply` בלי לקרוא את ה-`plan`** - זה כמו לעשות `git push --force` בלי להסתכל על מה שדוחפים.
- **בלבול בין `provider` (הפלאגין) ל-`resource` (המשאב עצמו)**.
- **אי-שימוש ב-`.gitignore`** - קבצי state ו-`.terraform/` לא צריכים להיכנס ל-Git.
- **התעלמות מגרסאות** - לא לנעוץ (pin) גרסת provider עלול לגרום להתנהגות לא צפויה בעתיד.

צרו קובץ `.gitignore` בסיסי:
```
.terraform/
*.tfstate
*.tfstate.backup
*.tfvars
crash.log
```

---

## קישורים חיצוניים

### תיעוד רשמי
- [What is Terraform - מבוא רשמי](https://developer.hashicorp.com/terraform/intro)
- [Terraform Documentation Home](https://developer.hashicorp.com/terraform/docs)
- [מדריך התקנה רשמי](https://developer.hashicorp.com/terraform/install)
- [Terraform Tutorials Library](https://developer.hashicorp.com/terraform/tutorials)
- [Standard Module Structure](https://developer.hashicorp.com/terraform/language/modules/develop/structure)

### סרטוני YouTube
- [Terraform Tutorial Full Course for Beginners (2026)](https://www.youtube.com/watch?v=Bzccj0jjRBM)
- [TechWorld with Nana - Terraform Course Overview](https://www.youtube.com/watch?v=m3cKkYXl-8o)

---

**במדריך הבא:** נעמיק ב-CLI Workflow - `init`, `plan`, `apply`, `destroy`, `fmt`, `validate` ועוד פקודות חיוניות.
