# מדריך 6: Modules - קוד לשימוש חוזר

## מה זה Module?

**Module** הוא אוסף קבצי `.tf` הממוקמים יחד בתיקייה אחת, שיכולים לכלול resources, variables, outputs ואפילו modules נוספים בתוכם. כל קונפיגורציית Terraform היא בעצמה module - נקרא **root module**. כשקוראים ל-module אחר מתוך הקוד, הוא נקרא **child module**.

מודולים הם הכלי המרכזי ליצירת קוד ניתן לשימוש חוזר, עקבי, ונבדק - בדיוק כמו פונקציות/מחלקות בשפות תכנות רגילות.

---

## מבנה מודול טיפוסי

```
modules/vpc/
├── main.tf        # ההגדרות עצמן
├── variables.tf    # קלטים
├── outputs.tf      # פלטים
├── versions.tf     # אילוצי גרסה
└── README.md       # תיעוד
```

### `modules/vpc/variables.tf`
```hcl
variable "cidr_block" {
  description = "טווח ה-CIDR של ה-VPC"
  type        = string
}

variable "environment" {
  description = "שם הסביבה"
  type        = string
}

variable "availability_zones" {
  description = "רשימת availability zones"
  type        = list(string)
  default     = ["eu-west-1a", "eu-west-1b"]
}
```

### `modules/vpc/main.tf`
```hcl
resource "aws_vpc" "this" {
  cidr_block = var.cidr_block
  tags = {
    Name        = "${var.environment}-vpc"
    Environment = var.environment
  }
}

resource "aws_subnet" "public" {
  count             = length(var.availability_zones)
  vpc_id            = aws_vpc.this.id
  cidr_block        = cidrsubnet(var.cidr_block, 8, count.index)
  availability_zone = var.availability_zones[count.index]

  tags = {
    Name = "${var.environment}-public-${count.index}"
  }
}
```

### `modules/vpc/outputs.tf`
```hcl
output "vpc_id" {
  description = "מזהה ה-VPC שנוצר"
  value       = aws_vpc.this.id
}

output "public_subnet_ids" {
  description = "מזהי ה-subnets הציבוריים"
  value       = aws_subnet.public[*].id
}
```

---

## קריאה למודול (Module Call)

```hcl
module "network" {
  source = "./modules/vpc"

  cidr_block         = "10.0.0.0/16"
  environment        = "prod"
  availability_zones = ["eu-west-1a", "eu-west-1b", "eu-west-1c"]
}

resource "aws_instance" "web" {
  subnet_id = module.network.public_subnet_ids[0]
}
```

לאחר הוספת/שינוי `module` block, **תמיד** יש להריץ `terraform init` שוב.

---

## מקורות (Sources) אפשריים למודול

```hcl
# תיקייה מקומית
source = "./modules/vpc"

# Terraform Registry הרשמי
source  = "terraform-aws-modules/vpc/aws"
version = "~> 5.0"

# GitHub
source = "github.com/hashicorp/example-module"
source = "git::https://github.com/hashicorp/example.git?ref=v1.2.0"

# S3
source = "s3::https://s3-eu-west-1.amazonaws.com/my-bucket/module.zip"

# Private Registry (Terraform Cloud/Enterprise)
source = "app.terraform.io/my-org/vpc/aws"
```

> **טיפ:** תמיד נעצו (pin) גרסה ל-modules חיצוניים עם `?ref=v1.2.0` (Git) או `version = "..."` (Registry) - אחרת עדכון לא צפוי במודול חיצוני עלול לשבור לכם את התשתית בפתאומיות.

---

## Meta-arguments עם Modules

### `for_each` על מודול - פריסת אותו מודול מספר פעמים

```hcl
module "vpc" {
  for_each   = toset(["dev", "staging", "prod"])
  source     = "./modules/vpc"
  cidr_block = "10.${index(["dev","staging","prod"], each.key)}.0.0/16"
  environment = each.key
}

# גישה לפלט:
output "prod_vpc_id" {
  value = module.vpc["prod"].vpc_id
}
```

### `count` על מודול
```hcl
module "server" {
  count  = 3
  source = "./modules/ec2"
  name   = "server-${count.index}"
}
```

### `providers` - העברת provider ספציפי למודול
```hcl
module "eu_resources" {
  source = "./modules/network"
  providers = {
    aws = aws.eu_west
  }
}
```

### `depends_on` על מודול
```hcl
module "app" {
  source     = "./modules/app"
  depends_on = [module.network]
}
```

---

## Terraform Registry - מודולים ציבוריים מוכנים

ה-[Terraform Registry](https://registry.terraform.io) מכיל אלפי מודולים בדוקים וקהילתיים. לדוגמה, מודול VPC פופולרי מאוד ל-AWS:

```hcl
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"

  name = "my-vpc"
  cidr = "10.0.0.0/16"

  azs             = ["eu-west-1a", "eu-west-1b", "eu-west-1c"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]

  enable_nat_gateway = true
  enable_vpn_gateway = false
}
```

> **טיפ מקצועי:** לפני כתיבת מודול משלכם - בדקו אם קיים מודול מוכר ומתוחזק ב-Registry. זה חוסך זמן פיתוח ובדיקות רבות, אבל תמיד קראו את הקוד לפני שסומכים עליו בפרודקשן!

---

## Composition - הרכבת מודולים זה בתוך זה

מודול יכול לקרוא למודולים נוספים - כך בונים ארכיטקטורות מורכבות משכבות פשוטות:

```
modules/
├── vpc/          # שכבה בסיסית - רשת
├── security/     # תלוי ב-vpc
└── app-stack/    # מודול "מרוכב" שקורא ל-vpc + security + compute
    └── main.tf
        module "vpc" { source = "../vpc" }
        module "security" { source = "../security"; vpc_id = module.vpc.vpc_id }
        module "compute" { source = "../compute"; subnet_ids = module.vpc.subnet_ids }
```

---

## Best Practices לכתיבת מודולים

1. **תמיד** לתעד `variables` ו-`outputs` עם `description`
2. שימוש ב-`type` מפורש (לא לסמוך על inference)
3. לא לכלול `provider` block בתוך מודול משותף (מחייבים את הקורא להגדיר provider משלו)
4. שם קבצים עקבי: `main.tf`, `variables.tf`, `outputs.tf`, `versions.tf`
5. הימנעות מ-modules שהם "עטיפה דקה" מדי סביב resource בודד (thin wrapper) - HashiCorp ממליצים במפורש נגד זה, אלא אם יש ערך מוסף אמיתי (ולידציה, ברירות מחדל)
6. שימוש ב-Semantic Versioning (`v1.2.0`) לגרסאות מודול

### דוגמה ל-`versions.tf` בתוך מודול
```hcl
terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.0"
    }
  }
}
```

---

## בדיקת מודולים - `terraform test`

מגרסה 1.6 יש framework מובנה לבדיקות יחידה למודולים:

```hcl
# tests/vpc.tftest.hcl
run "vpc_creates_correct_cidr" {
  command = plan

  variables {
    cidr_block  = "10.0.0.0/16"
    environment = "test"
  }

  assert {
    condition     = aws_vpc.this.cidr_block == "10.0.0.0/16"
    error_message = "ה-CIDR של ה-VPC לא תואם את הצפוי"
  }
}
```

```bash
terraform test
```

---

## שאלות ראיון נפוצות

**1. מה ההבדל בין root module ל-child module?**
Root module הוא ה-`.tf` files בתיקיית העבודה הראשית שמריצים עליה `terraform apply`. Child module הוא כל module שנקרא באמצעות בלוק `module` - יכול להיות מקומי או חיצוני.

**2. למה לא כדאי לכלול `provider` block בתוך מודול משותף?**
כי זה "נועל" את המודול לקונפיגורציית provider ספציפית (region, credentials) ומונע גמישות מהצוותים שמשתמשים בו. עדיף להעביר providers מבחוץ עם ה-meta-argument `providers`.

**3. מה קורה אם משנים את ה-`source` של מודול?**
חובה להריץ `terraform init` (או `init -upgrade`) שוב כדי ש-Terraform יוריד/יעדכן את הקוד המקומי של המודול.

**4. איך פורסים את אותו מודול פעמיים עם קונפיגורציה שונה?**
עם `for_each` (מפתחות ייחודיים, מומלץ) או `count` (אינדקס מספרי) על בלוק ה-`module`.

**5. מה השיקולים כשבוחרים בין מודול מה-Registy הציבורי לכתיבת מודול משלכם?**
זמן פיתוח מול שליטה מלאה; בדיקות קהילתיות מול דרישות ספציפיות לארגון; תחזוקה שוטפת מול תלות בפרויקט חיצוני. לרוב, עדיף להתחיל ממודול ציבורי בדוק ולעטוף אותו במודול פנימי אם צריך התאמות ספציפיות.

---

## קישורים חיצוניים

### תיעוד רשמי
- [Modules Overview](https://developer.hashicorp.com/terraform/language/modules)
- [module Block Reference](https://developer.hashicorp.com/terraform/language/block/module)
- [Calling Modules (Syntax)](https://developer.hashicorp.com/terraform/language/modules/syntax)
- [Developing Modules](https://developer.hashicorp.com/terraform/language/modules/develop)
- [Standard Module Structure](https://developer.hashicorp.com/terraform/language/modules/develop/structure)
- [Terraform Registry - חיפוש מודולים](https://registry.terraform.io)

### סרטוני YouTube
- [TechWorld with Nana - Terraform Course Overview (כולל פרק Modules)](https://www.youtube.com/watch?v=m3cKkYXl-8o)
- [Terraform Tutorial Full Course for Beginners (2026)](https://www.youtube.com/watch?v=Bzccj0jjRBM)

---

**במדריך הבא:** Workspaces וניהול סביבות מרובות (dev/staging/prod).
