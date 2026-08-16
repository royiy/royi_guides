---
sidebar_position: 4
title: "מדריך 4: Providers, Resources ו-Data Sources"
---

## מה זה Provider?

**Provider** הוא פלאגין ש-Terraform מוריד ומשתמש בו כדי "לדבר" עם ה-API של שירות חיצוני - AWS, Azure, GCP, Kubernetes, GitHub, Datadog ואלפי שירותים נוספים. כל ה-providers הרשמיים והקהילתיים מפורסמים ב-[Terraform Registry](https://registry.terraform.io).

```hcl
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "eu-west-1"
}
```

### מספר קונפיגורציות לאותו provider (`alias`)

שימושי כשצריך לפרוס משאבים במספר regions/accounts באותה קונפיגורציה:

```hcl
provider "aws" {
  region = "eu-west-1"
  alias  = "ireland"
}

provider "aws" {
  region = "us-east-1"
  alias  = "virginia"
}

resource "aws_instance" "eu_server" {
  provider      = aws.ireland
  instance_type = "t3.micro"
}

resource "aws_instance" "us_server" {
  provider      = aws.virginia
  instance_type = "t3.micro"
}
```

---

## Version Constraints - אילוצי גרסה

```hcl
version = "5.31.0"   # גרסה מדויקת בלבד
version = ">= 5.0"    # 5.0 ומעלה
version = "~> 5.0"    # 5.x כלשהו (אבל לא 6.0) - הכי נפוץ
version = "~> 5.31.0" # רק תיקוני באגים בתוך 5.31.x
version = ">= 5.0, < 6.0"  # טווח מפורש
```

> **טיפ:** `~>` (pessimistic constraint operator) הוא הבחירה המומלצת ברוב הצוותים - מאפשר עדכוני minor/patch אוטומטיים אבל חוסם breaking changes של major version.

---

## Resource Blocks

זהו הבלוק המרכזי ביותר ב-Terraform - מתאר משאב יחיד שברצונכם ליצור ולנהל.

```hcl
resource "aws_instance" "web" {
  ami                    = "ami-0c55b159cbfafe1f0"
  instance_type          = "t3.micro"
  vpc_security_group_ids = [aws_security_group.web_sg.id]
  subnet_id              = aws_subnet.public.id

  tags = {
    Name = "web-server"
  }

  # Provisioner - הרצת סקריפט אחרי יצירה (שימוש מוגבל, ראו אזהרה למטה)
  provisioner "remote-exec" {
    inline = ["sudo apt update", "sudo apt install -y nginx"]
  }
}
```

תחביר כללי: `resource "<TYPE>" "<LOCAL_NAME>" { ... }`
- `TYPE` נקבע על ידי ה-provider (למשל `aws_instance`)
- `LOCAL_NAME` הוא שם שאתם בוחרים, ייחודי בתוך הקונפיגורציה

הפניה למשאב אחר: `aws_instance.web.id`, `aws_subnet.public.id` וכו'.

> **אזהרה על Provisioners:** HashiCorp עצמם ממליצים להימנע מ-provisioners ככל האפשר - הם "מוצא אחרון". עדיף להשתמש ב-`user_data` (AWS), custom images (Packer), או כלי configuration management ייעודי (Ansible) לאחר היצירה.

---

## Meta-Arguments - זמינים לכל resource

### `depends_on` - תלות מפורשת

Terraform בונה DAG (Directed Acyclic Graph) אוטומטית מהפניות בקוד, אבל לפעמים צריך תלות שאינה נראית מהקוד עצמו:

```hcl
resource "aws_iam_role_policy" "example" {
  # ...
}

resource "aws_instance" "web" {
  depends_on = [aws_iam_role_policy.example]
  # ...
}
```

### `lifecycle` - שליטה על מחזור חיים

```hcl
resource "aws_instance" "web" {
  # ...

  lifecycle {
    create_before_destroy = true   # יוצר משאב חדש לפני מחיקת הישן (Zero downtime)
    prevent_destroy        = true   # חוסם destroy בטעות למשאבים קריטיים
    ignore_changes          = [tags["LastModified"]]  # מתעלם משינויים בשדות מסוימים
  }
}
```

> **דוגמת שימוש ב-`prevent_destroy`:** מומלץ מאוד על משאבים כמו production databases:
```hcl
resource "aws_db_instance" "prod" {
  # ...
  lifecycle {
    prevent_destroy = true
  }
}
```

### `count` ו-`for_each`
(פורטו בהרחבה במדריך 3)

---

## Data Sources - שאילתת מידע קיים

בניגוד ל-`resource` שיוצר/מנהל משאב, `data` רק **קורא** מידע קיים - על משאב שנוצר על ידי מישהו/משהו אחר.

```hcl
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"]  # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }
}

resource "aws_instance" "web" {
  ami           = data.aws_ami.ubuntu.id   # שימוש בתוצאת ה-data source
  instance_type = "t3.micro"
}
```

דוגמאות נוספות נפוצות:
```hcl
# שליפת מידע על ה-account הנוכחי
data "aws_caller_identity" "current" {}

output "account_id" {
  value = data.aws_caller_identity.current.account_id
}

# שליפת VPC קיים לפי תגית
data "aws_vpc" "existing" {
  filter {
    name   = "tag:Name"
    values = ["production-vpc"]
  }
}
```

---

## Resource Behavior - איך Terraform מחליט מה לעשות

כאשר משנים שדה ב-resource, Terraform מסווג את הפעולה:

| סוג שינוי | מה קורה |
|---|---|
| **In-place update** | שדה שניתן לעדכן בלי ליצור מחדש (למשל `tags`) |
| **Destroy and Re-create** | שדה "immutable" בענן - Terraform ימחק ויצור מחדש (למשל שינוי `availability_zone` ב-EC2) |
| **New resource replaces old** | כשמשתמשים ב-`create_before_destroy` |

בדקו את זה תמיד ב-`terraform plan` - שימו לב לסימון `-/+` שמציין replace!

---

## Provider Requirements מתקדמים

### Multiple Providers מאותו סוג עם for_each

```hcl
provider "aws" {
  alias  = "region"
  region = each.key
  for_each = toset(["eu-west-1", "us-east-1"])
}
```//לתשומת לב: זהו syntax היפותטי להמחשה - בפועל providers לא תומכים ב-for_each ישירות, לכן יוצרים בלוק provider נפרד לכל region.

### Provider אמיתי - S3 buckets בכמה regions

```hcl
provider "aws" {
  alias  = "eu"
  region = "eu-west-1"
}
provider "aws" {
  alias  = "us"
  region = "us-east-1"
}

resource "aws_s3_bucket" "eu_bucket" {
  provider = aws.eu
  bucket   = "my-eu-bucket-2026"
}

resource "aws_s3_bucket" "us_bucket" {
  provider = aws.us
  bucket   = "my-us-bucket-2026"
}
```

---

## שאלות ראיון נפוצות

**1. מה ההבדל בין `resource` ל-`data`?**
`resource` יוצר, מעדכן ומוחק משאב שנמצא תחת ניהול Terraform; `data` רק קורא מידע קיים (בין אם נוצר ידנית, על ידי Terraform אחר, או שירות אחר) בלי לשנות אותו.

**2. מתי משתמשים ב-`depends_on` אם Terraform כבר בונה גרף תלויות אוטומטית?**
כאשר יש תלות "סמויה" שלא באה לידי ביטוי בהפניה ישירה בקוד - למשל, IAM policy שצריכה להתקיים לפני שמשאב מסוים ירוץ בהצלחה, אך אין הפניה ישירה בין השדות שלהם.

**3. מה עושה `create_before_destroy` ולמה זה חשוב?**
גורם ל-Terraform ליצור את המשאב החדש **לפני** מחיקת הישן, במקום ברירת המחדל (מחיקה ואז יצירה). זה קריטי למניעת downtime במשאבים כמו launch configurations, load balancer targets וכו'.

**4. מהו provider alias ומתי משתמשים בו?**
מנגנון להגדרת מספר קונפיגורציות שונות לאותו provider (למשל AWS בכמה regions או accounts) באותה קונפיגורציית Terraform.

**5. איך מוצאים AMI העדכני ביותר של Ubuntu בלי לעדכן ידנית?**
באמצעות `data "aws_ami"` עם `most_recent = true` וסינון לפי `owners` ו-`filter` על שם ה-image.

---

## קישורים חיצוניים

### תיעוד רשמי
- [Providers Overview](https://developer.hashicorp.com/terraform/language/providers)
- [Terraform Registry - חיפוש Providers ו-Modules](https://registry.terraform.io)
- [Resources - Resource Behavior](https://developer.hashicorp.com/terraform/language/resources/behavior)
- [Meta-Arguments: depends_on](https://developer.hashicorp.com/terraform/language/meta-arguments/depends_on)
- [Meta-Arguments: lifecycle](https://developer.hashicorp.com/terraform/language/meta-arguments/lifecycle)
- [Data Sources](https://developer.hashicorp.com/terraform/language/data-sources)

### סרטוני YouTube
- [Terraform Tutorial Full Course for Beginners (2026)](https://www.youtube.com/watch?v=Bzccj0jjRBM)
- [TechWorld with Nana - Terraform Course Overview](https://www.youtube.com/watch?v=m3cKkYXl-8o)

---

**במדריך הבא:** Terraform State לעומק - איך זה עובד, remote state, locking וניהול מתקדם.
