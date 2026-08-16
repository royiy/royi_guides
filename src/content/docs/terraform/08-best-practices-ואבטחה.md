---
sidebar_position: 8
title: "מדריך 8: Best Practices ואבטחה ב-Terraform"
---

# מדריך 8: Best Practices ואבטחה ב-Terraform

## 1. ניהול סודות (Secrets)

### הבעיה
קובץ ה-state שומר **את כל** ה-attributes של המשאבים - כולל כאלה שמכילים סודות (סיסמאות DB, מפתחות API) - **בטקסט גלוי**, גם אם סימנתם אותם `sensitive = true` בקוד (זה רק מסתיר מהפלט, לא מהקובץ עצמו).

### פתרונות מומלצים

**א. לעולם אל תכתבו secrets ישירות בקוד:**
```hcl
# רע מאוד! ❌
resource "aws_db_instance" "main" {
  password = "SuperSecret123!"
}
```

**ב. השתמשו במנהלי סודות ייעודיים:**
```hcl
# טוב! ✅ - שליפה מ-AWS Secrets Manager
data "aws_secretsmanager_secret_version" "db_password" {
  secret_id = "prod/db/password"
}

resource "aws_db_instance" "main" {
  password = data.aws_secretsmanager_secret_version.db_password.secret_string
}
```

**ג. אינטגרציה עם HashiCorp Vault:**
```hcl
provider "vault" {
  address = "https://vault.example.com"
}

data "vault_kv_secret_v2" "db" {
  mount = "secret"
  name  = "prod/database"
}

resource "aws_db_instance" "main" {
  password = data.vault_kv_secret_v2.db.data["password"]
}
```

**ד. הצפינו את ה-state עצמו** (encryption at rest ב-S3/GCS + KMS), והגבילו הרשאות גישה ל-bucket עם IAM מדויק (least privilege).

**ה. משתני סביבה במקום קבצים:**
```bash
export TF_VAR_db_password="$(vault kv get -field=password secret/db)"
```

---

## 2. עקרון Least Privilege ל-IAM

הענקת הרשאות מינימליות בלבד ל-role שמריץ Terraform. לדוגמה, ב-CI/CD אל תשתמשו ב-`AdministratorAccess` - הגדירו policy ממוקד:

```hcl
data "aws_iam_policy_document" "terraform_ci" {
  statement {
    effect    = "Allow"
    actions   = ["ec2:Describe*", "ec2:RunInstances", "ec2:TerminateInstances"]
    resources = ["*"]
  }
  # ... ממשיכים רק עם הפעולות הנדרשות בפועל
}
```

---

## 3. סריקת קוד לפני apply (Static Analysis / Policy as Code)

### כלים מובילים לסריקת אבטחה
- **[tfsec](https://github.com/aquasecurity/tfsec)** / **[Trivy](https://github.com/aquasecurity/trivy)** - סורק חולשות אבטחה סטטי
- **[Checkov](https://github.com/bridgecrewio/checkov)** - סריקת compliance ואבטחה (Bridgecrew)
- **[terrascan](https://github.com/tenable/terrascan)** - סריקת policy-as-code
- **[OPA (Open Policy Agent)](https://www.openpolicyagent.org/)** / **Sentinel** (Terraform Cloud) - אכיפת policies ארגוניות

דוגמת שילוב ב-CI:
```bash
tfsec .
checkov -d .
```

דוגמת ממצא טיפוסי:
```
Result #1 HIGH Security group allows unrestricted ingress
  aws_security_group.web[8-15]

  8  | resource "aws_security_group" "web" {
  9  |   ingress {
 10  |     from_port   = 22
 11  |     to_port     = 22
 12  |     cidr_blocks = ["0.0.0.0/0"]   # ❌ SSH פתוח לעולם!
 13  |   }
```

---

## 4. State ו-Backend מאובטחים

```hcl
terraform {
  backend "s3" {
    bucket         = "my-company-terraform-state"
    key            = "prod/terraform.tfstate"
    region         = "eu-west-1"
    encrypt        = true                     # הצפנה בענן
    dynamodb_table = "terraform-locks"         # מניעת מירוצים
    kms_key_id     = "arn:aws:kms:eu-west-1:123456789012:key/abcd..."
  }
}
```

- הפעילו S3 Bucket Versioning (שחזור מגרסאות קודמות של state)
- חסמו public access ל-bucket
- הגבילו IAM access רק לתפקידי CI/CD ומהנדסים מורשים

---

## 5. עיצוב ואיכות קוד

```bash
terraform fmt -recursive -check   # אכיפת עיצוב אחיד
terraform validate                # בדיקת תקינות
```

השתמשו ב-[**tflint**](https://github.com/terraform-linters/tflint) לזיהוי בעיות שה-`validate` הרשמי לא תופס - שמות משתנים לא בשימוש, טיפוסים שגויים, קונבנציות AWS ספציפיות:

```bash
tflint --init
tflint
```

---

## 6. אמנת שמות (Naming Conventions)

```hcl
# עקבי, תיאורי, עם underscore
resource "aws_instance" "web_server" { ... }     # ✅
resource "aws_instance" "WebServer" { ... }       # ❌ לא עקבי
resource "aws_instance" "instance1" { ... }        # ❌ לא תיאורי

# תגיות סטנדרטיות לכל משאב
locals {
  common_tags = {
    Environment = var.environment
    Project     = var.project_name
    ManagedBy   = "terraform"
    Owner       = var.team_name
    CostCenter  = var.cost_center
  }
}
```

---

## 7. Pre-commit Hooks

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/antonbabenko/pre-commit-terraform
    rev: v1.88.0
    hooks:
      - id: terraform_fmt
      - id: terraform_validate
      - id: terraform_tflint
      - id: terraform_tfsec
      - id: terraform_docs   # יוצר תיעוד אוטומטי!
```

`terraform-docs` יוצר README אוטומטית עם טבלת variables/outputs מתוך הקוד עצמו - חוסך תחזוקה כפולה.

---

## 8. פיצול תשתית ל-Blast Radius קטן

אל תשימו את **כל** התשתית של הארגון בקונפיגורציה אחת ענקית עם state אחד. אם `apply` ישבור משהו, אתם רוצים שהנזק יהיה מוגבל.

```
❌ מונוליט:               ✅ מפוצל לפי שכבה/domain:
infra/                     infra/
└── main.tf                ├── network/
    (הכל בקובץ אחד,        ├── security/
     state אחד ענק)        ├── database/
                            └── compute/
```

---

## 9. Immutable Infrastructure ו-`create_before_destroy`

העדיפו יצירת משאבים חדשים על עדכון in-place כשמדובר במשאבים קריטיים (Launch Templates, AMIs):

```hcl
resource "aws_launch_template" "app" {
  name_prefix = "app-"
  image_id    = var.ami_id

  lifecycle {
    create_before_destroy = true
  }
}
```

---

## 10. הימנעות משגיאות נפוצות

| טעות | למה זה בעייתי | הפתרון |
|---|---|---|
| שכחת `.gitignore` ל-state | דליפת סודות ל-Git history | `.gitignore` מקיף + `git-secrets` |
| שימוש ב-`-target` בפרודקשן | state לא עקבי | להשתמש רק לדיבוג, ואז `plan` מלא |
| Hardcoding ערכי סביבה | קוד לא ניתן לשימוש חוזר | `variables` + `tfvars` |
| אין code review לתשתית | שינויים מסוכנים חומקים | PR + `plan` אוטומטי בתגובה |
| שימוש ב-`latest`/ללא version pinning | breaking changes בלתי צפויים | `version = "~> 5.0"` תמיד |
| `count` על רשימות דינמיות | destroy/recreate לא רצוי | `for_each` עם מפתחות יציבים |

---

## 11. תבנית `.gitignore` מומלצת

```gitignore
# Terraform
**/.terraform/*
*.tfstate
*.tfstate.*
crash.log
crash.*.log
*.tfvars
*.tfvars.json
override.tf
override.tf.json
*_override.tf
*_override.tf.json
.terraformrc
terraform.rc
.terraform.lock.hcl   # יש ויכוח בקהילה - חלק ממליצים לכלול אותו בגיט!
```

> **הערה על `.terraform.lock.hcl`:** בניגוד לאינטואיציה, HashiCorp **ממליצים** לכלול את קובץ ה-lock בגיט (להסיר אותו מה-`.gitignore`) - כדי להבטיח שכל חברי הצוות ו-CI ישתמשו באותן גרסאות providers מדויקות.

---

## שאלות ראיון נפוצות

**1. איך הייתם מנהלים secrets ב-Terraform בצורה בטוחה?**
לעולם לא hardcode בקוד. שימוש במנהלי סודות ייעודיים (Vault, AWS Secrets Manager) עם data sources, הצפנת ה-state עצמו, והגבלת גישה ל-backend עם IAM מדויק.

**2. למה חשוב לסרוק קוד Terraform עם כלים כמו tfsec/Checkov לפני apply?**
כדי לזהות בעיות אבטחה (security groups פתוחים, buckets ציבוריים, הצפנה חסרה) לפני שהן מגיעות לפרודקשן - "shift left" על אבטחה.

**3. מה זה "Blast Radius" ואיך מקטינים אותו בארכיטקטורת Terraform?**
היקף הנזק הפוטנציאלי משגיאה. מקטינים על ידי פיצול לקונפיגורציות/state נפרדים לפי domain (network/database/compute) במקום monolith אחד ענק.

**4. האם `.terraform.lock.hcl` צריך להיכנס לגיט?**
כן! זה בניגוד לאינטואיציה הראשונית, אבל נחוץ כדי להבטיח עקביות גרסאות providers בין כל חברי הצוות ו-CI.

**5. איך אוכפים policy ארגוני (למשל "כל bucket חייב להיות מוצפן") ב-CI?**
עם Policy as Code - Sentinel (Terraform Cloud) או Open Policy Agent (OPA) שבודקים את ה-plan מול חוקים לפני שמאשרים apply.

---

## קישורים חיצוניים

### תיעוד רשמי וכלים
- [Style Guide - HashiCorp](https://developer.hashicorp.com/terraform/language/style)
- [tfsec - GitHub](https://github.com/aquasecurity/tfsec)
- [Checkov - GitHub](https://github.com/bridgecrewio/checkov)
- [tflint - GitHub](https://github.com/terraform-linters/tflint)
- [terraform-docs - GitHub](https://github.com/terraform-docs/terraform-docs)
- [Open Policy Agent](https://www.openpolicyagent.org/)

### סרטוני YouTube
- [15 Advanced Terraform Interview Questions: Security & Best Practices](https://www.youtube.com/watch?v=G-GvFFpqVy4)
- [TechWorld with Nana - Terraform Course Overview](https://www.youtube.com/watch?v=m3cKkYXl-8o)

---

**במדריך הבא:** CI/CD עם Terraform - GitHub Actions, GitLab CI ואוטומציה מלאה.
