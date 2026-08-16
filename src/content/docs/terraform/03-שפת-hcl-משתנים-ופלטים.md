---
sidebar_position: 3
title: "מדריך 3: שפת HCL - משתנים, פלטים ו-Locals"
---

# מדריך 3: שפת HCL - משתנים, פלטים ו-Locals

## מה זה HCL?

**HCL (HashiCorp Configuration Language)** היא שפת התצורה של Terraform - שפה declarative, קריאה לבני אדם, עם תמיכה גם ב-JSON כפורמט חלופי. היא בנויה מ**בלוקים** (blocks), **ארגומנטים** (arguments) ו**ביטויים** (expressions).

```hcl
<BLOCK_TYPE> "<LABEL1>" "<LABEL2>" {
  <ARGUMENT> = <VALUE>
}
```

---

## טיפוסי נתונים ב-HCL

| טיפוס | דוגמה |
|---|---|
| `string` | `"hello"` |
| `number` | `42`, `3.14` |
| `bool` | `true`, `false` |
| `list(type)` | `["a", "b", "c"]` |
| `set(type)` | `toset(["a", "b"])` |
| `map(type)` | `{ key = "value" }` |
| `object({...})` | `{ name = string, age = number }` |
| `tuple([...])` | `["a", 1, true]` |
| `null` | ערך ריק |

---

## משתני קלט - `variable`

משתנים הם הדרך להפוך קונפיגורציה לגמישה וניתנת לשימוש חוזר.

```hcl
variable "instance_type" {
  description = "סוג ה-EC2 instance"
  type        = string
  default     = "t3.micro"
}

variable "environment" {
  description = "שם הסביבה (dev/staging/prod)"
  type        = string

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "environment חייב להיות אחד מ: dev, staging, prod."
  }
}

variable "tags" {
  description = "תגיות משותפות לכל המשאבים"
  type        = map(string)
  default     = {}
}

variable "db_password" {
  description = "סיסמת בסיס הנתונים"
  type        = string
  sensitive   = true    # מסתיר את הערך מפלט plan/apply
}
```

שימוש במשתנה בקוד:
```hcl
resource "aws_instance" "web" {
  instance_type = var.instance_type
  tags          = var.tags
}
```

### דרכים להזין ערכים למשתנים (לפי סדר עדיפות - הגבוה גובר)

1. `-var` בשורת הפקודה: `terraform apply -var="instance_type=t3.large"`
2. `-var-file`: `terraform apply -var-file="prod.tfvars"`
3. קובץ `terraform.tfvars` (נטען אוטומטית!)
4. קבצי `*.auto.tfvars` (גם נטענים אוטומטית, לפי סדר אלפביתי)
5. משתני סביבה: `TF_VAR_instance_type=t3.large`
6. ה-`default` בהגדרת המשתנה עצמה

דוגמת `terraform.tfvars`:
```hcl
instance_type = "t3.large"
environment   = "prod"
tags = {
  Team    = "platform"
  Project = "checkout-service"
}
```

דוגמת משתנה סביבה:
```bash
export TF_VAR_db_password="s3cr3t!"
terraform apply
```

> **טיפ אבטחה:** לעולם אל תשמרו סודות ב-`terraform.tfvars` בגיט. השתמשו במשתני סביבה, ב-Vault, או ב-AWS Secrets Manager עם `data source` ייעודי.

---

## פלטי יציאה - `output`

חושפים ערכים מהקונפיגורציה - שימושי גם ל-CI/CD וגם לשיתוף בין מודולים.

```hcl
output "instance_public_ip" {
  description = "כתובת ה-IP הציבורית של השרת"
  value       = aws_instance.web.public_ip
}

output "db_connection_string" {
  value     = "postgres://${aws_db_instance.main.username}:${var.db_password}@${aws_db_instance.main.endpoint}"
  sensitive = true   # מוסתר בפלט הרגיל של terraform apply
}
```

צפייה בפלטים:
```bash
terraform output
terraform output -json | jq '.instance_public_ip.value'
```

---

## `locals` - ערכים מחושבים פנימיים

בניגוד ל-`variable` (קלט חיצוני), `locals` הם ערכים שמחושבים **בתוך** הקונפיגורציה - נוחים לצמצום כפילות קוד.

```hcl
locals {
  common_tags = {
    Environment = var.environment
    ManagedBy   = "terraform"
    Project     = var.project_name
  }

  instance_name = "${var.project_name}-${var.environment}-web"

  # locals יכולים להשתמש בביטויים מורכבים
  is_production = var.environment == "prod"
  instance_count = local.is_production ? 3 : 1
}

resource "aws_instance" "web" {
  count = local.instance_count
  tags  = merge(local.common_tags, { Name = "${local.instance_name}-${count.index}" })
}
```

---

## אינטרפולציה ופונקציות מובנות

Terraform כולל עשרות פונקציות מובנות (built-in functions) - **אי אפשר** לכתוב פונקציות משלכם ב-HCL, רק להשתמש בקיימות.

### פונקציות מחרוזת (String)
```hcl
upper("hello")           # "HELLO"
lower("HELLO")           # "hello"
trimspace("  hi  ")      # "hi"
join("-", ["a","b","c"]) # "a-b-c"
split(",", "a,b,c")      # ["a","b","c"]
format("web-%02d", 3)    # "web-03"
substr("hello", 0, 3)    # "hel"
replace("hello", "l", "L") # "heLLo"
```

### פונקציות אוסף (Collection)
```hcl
length(["a","b","c"])    # 3
concat([1,2], [3,4])     # [1,2,3,4]
merge({a=1}, {b=2})      # {a=1, b=2}
contains(["a","b"], "a") # true
keys({a=1, b=2})         # ["a","b"]
values({a=1, b=2})       # [1,2]
flatten([[1,2],[3,4]])   # [1,2,3,4]
distinct([1,1,2,3])      # [1,2,3]
```

### פונקציות מספר ותנאי
```hcl
max(5, 10, 3)             # 10
min(5, 10, 3)             # 3
ceil(4.1)                 # 5
coalesce(null, null, "x") # "x" - הערך הראשון שאינו null
try(var.optional, "default")  # מנסה ומחזיר ברירת מחדל אם נכשל
```

### פונקציות תאריך/הצפנה
```hcl
timestamp()
uuid()
sha256("hello")
base64encode("hello")
```

---

## Conditional Expressions (Ternary)

```hcl
instance_type = var.environment == "prod" ? "m5.large" : "t3.micro"
```

## `for` Expressions

```hcl
# יצירת רשימה חדשה
[for s in var.subnets : upper(s)]

# יצירת מפה חדשה
{for k, v in var.tags : k => upper(v)}

# עם תנאי סינון
[for s in var.subnets : s if length(s) > 5]
```

## `for_each` ו-`count` - יצירת מספר עותקים

```hcl
# count - פשוט, מבוסס אינדקס
resource "aws_instance" "web" {
  count         = 3
  instance_type = "t3.micro"
  tags          = { Name = "web-${count.index}" }
}

# for_each - מומלץ יותר, מבוסס מפתח (יציב יותר בשינויים)
resource "aws_instance" "web" {
  for_each      = toset(["frontend", "backend", "worker"])
  instance_type = "t3.micro"
  tags          = { Name = "web-${each.key}" }
}
```

> **טיפ קריטי לראיונות:** ההבדל המרכזי הוא שכש-`count` והרשימה משתנה (מסירים פריט מהאמצע), Terraform "מזיז" את כל האינדקסים שאחריו ועלול להרוס וליצור מחדש משאבים שלא היו אמורים להשתנות! `for_each` עם מפתחות ייחודיים (string/map) פותר את הבעיה כי כל עותק מזוהה לפי מפתח קבוע, לא לפי מיקום.

---

## Heredoc Strings - טקסט מרובה שורות

```hcl
resource "aws_iam_policy" "example" {
  policy = <<-EOF
  {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Action": "s3:GetObject",
        "Resource": "*"
      }
    ]
  }
  EOF
}
```

---

## שאלות ראיון נפוצות

**1. מה ההבדל בין `variable` ל-`local`?**
`variable` הוא קלט חיצוני שניתן להזין מבחוץ (CLI, קובץ, env var); `local` הוא ערך מחושב פנימית בקוד ולא ניתן לדריסה מבחוץ.

**2. מה ההבדל בין `count` ל-`for_each`?**
`count` יוצר משאבים לפי אינדקס מספרי (0, 1, 2...) - רגיש לשינויי סדר ברשימה. `for_each` יוצר משאבים לפי מפתח (מ-set או map) - יציב יותר כי כל עותק מזוהה ייחודית ולא לפי מיקום.

**3. מתי ישתמשו ב-`sensitive = true`?**
כאשר משתנה או output מכיל מידע רגיש (סיסמאות, טוקנים, מפתחות). Terraform יסתיר את הערך מפלטי `plan`/`apply`/`output` הרגילים (אך הוא עדיין נשמר בטקסט גלוי בקובץ ה-state עצמו - חשוב להכיר את המגבלה הזו!).

**4. איך אוכפים ולידציה על ערך משתנה?**
עם בלוק `validation` בתוך `variable`, שמכיל `condition` ו-`error_message`.

**5. האם אפשר לכתוב פונקציות מותאמות אישית ב-Terraform?**
לא - HCL תומך רק בפונקציות מובנות. עבור לוגיקה מותאמת אישית משתמשים ב-modules, external data source, או Terraform providers מותאמים.

---

## קישורים חיצוניים

### תיעוד רשמי
- [Input Variables](https://developer.hashicorp.com/terraform/language/values/variables)
- [Output Values](https://developer.hashicorp.com/terraform/language/values/outputs)
- [Local Values](https://developer.hashicorp.com/terraform/language/values/locals)
- [Built-in Functions Reference](https://developer.hashicorp.com/terraform/language/functions)
- [Expressions](https://developer.hashicorp.com/terraform/language/expressions)

### סרטוני YouTube
- [Terraform Tutorial Full Course for Beginners (2026)](https://www.youtube.com/watch?v=Bzccj0jjRBM)
- [TechWorld with Nana - Terraform Course Overview](https://www.youtube.com/watch?v=m3cKkYXl-8o)

---

**במדריך הבא:** Resources, Providers ו-Data Sources - איך Terraform מדבר עם הענן בפועל.
