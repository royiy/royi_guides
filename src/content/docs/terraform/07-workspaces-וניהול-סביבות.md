---
sidebar_position: 7
title: "מדריך 7: Workspaces וניהול סביבות מרובות"
---

# מדריך 7: Workspaces וניהול סביבות מרובות

## מה זה Workspace?

**Terraform Workspace** הוא מנגנון המאפשר לנהל **מספר מופעי state נפרדים** לאותה קונפיגורציית קוד. כל workspace מקבל קובץ state עצמאי, כך שאותו קוד יכול "לשרת" סביבות שונות (dev, staging, prod) בלי לשכפל את כל הקבצים.

> **הבהרה חשובה לראיונות:** יש **שני** מושגים שנקראים "workspace" ב-Terraform, וזה מבלבל רבים:
> 1. **CLI Workspaces** (הנושא של מדריך זה) - מנגנון local/backend לניהול מספר states
> 2. **HCP Terraform (Terraform Cloud) Workspaces** - מושג שונה לגמרי, שם "workspace" = פרויקט שלם עם קוד, משתנים, היסטוריית הרצות

---

## פקודות בסיסיות

```bash
terraform workspace list           # מציג את כל ה-workspaces, * מסמן את הפעיל
terraform workspace new staging    # יצירת workspace חדש
terraform workspace select prod    # מעבר ל-workspace קיים
terraform workspace show           # הצגת שם ה-workspace הפעיל
terraform workspace delete staging # מחיקת workspace (רק אם ריק מ-state!)
```

פלט לדוגמה:
```
$ terraform workspace list
  default
* dev
  staging
  prod
```

---

## שימוש ב-`terraform.workspace` בקוד

```hcl
locals {
  instance_size = {
    dev     = "t3.micro"
    staging = "t3.small"
    prod    = "m5.large"
  }
}

resource "aws_instance" "web" {
  instance_type = local.instance_size[terraform.workspace]

  tags = {
    Name        = "web-${terraform.workspace}"
    Environment = terraform.workspace
  }
}
```

עם workspace `dev` פעיל, המשאב ייקרא `web-dev` ויהיה `t3.micro`. במעבר ל-`prod`, אותו קוד בדיוק ייצור `web-prod` בגודל `m5.large` - וב-state **נפרד לגמרי**.

---

## איפה ה-state של כל Workspace נשמר?

### עם Local Backend
```
terraform.tfstate.d/
├── dev/
│   └── terraform.tfstate
├── staging/
│   └── terraform.tfstate
└── prod/
    └── terraform.tfstate
```

### עם S3 Backend
Terraform מוסיף אוטומטית prefix עם שם ה-workspace לנתיב שהגדרתם:
```hcl
terraform {
  backend "s3" {
    bucket = "my-tf-state"
    key    = "app/terraform.tfstate"
    region = "eu-west-1"
  }
}
```
ה-state בפועל יישמר תחת:
```
env:/dev/app/terraform.tfstate
env:/staging/app/terraform.tfstate
env:/prod/app/terraform.tfstate
```

---

## Workspaces לעומת Directory Separation - הדילמה המרכזית

זו אחת השאלות הכי נפוצות בראיונות. יש שתי גישות מרכזיות לניהול סביבות מרובות:

### גישה א': CLI Workspaces (workspace אחד לכל סביבה)
```bash
terraform workspace select prod
terraform apply
```

**יתרונות:** DRY - קוד אחד בלבד, אין כפילות.
**חסרונות:**
- כל הסביבות חולקות backend config זהה - אין הפרדת credentials/access control
- קל בטעות "לשכוח" באיזה workspace אתם נמצאים ולהריץ apply על prod בטעות!
- לא מתאים כשסביבות שונות דורשות תשתית מהותית שונה (לא רק גדלים שונים)

### גישה ב': הפרדת תיקיות (מומלצת יותר לפרודקשן)
```
environments/
├── dev/
│   ├── main.tf
│   └── backend.tf   # backend נפרד, אולי אפילו AWS account נפרד
├── staging/
│   ├── main.tf
│   └── backend.tf
└── prod/
    ├── main.tf
    └── backend.tf
```
כל תיקייה קוראת לאותם modules משותפים, אבל עם backend, credentials ומשתנים נפרדים לחלוטין.

**יתרונות:**
- הפרדה מלאה - אי אפשר "בטעות" לגעת בפרודקשן דרך dev
- ניתן לתת הרשאות IAM שונות לכל סביבה
- קל יותר להריץ pipeline נפרד לכל סביבה

**חסרונות:** קצת יותר קוד boilerplate (אבל modules פותרים את זה).

> **המלצת HashiCorp הרשמית:** [State: Workspaces](https://developer.hashicorp.com/terraform/language/state/workspaces) מציינים במפורש: *"Workspaces are not appropriate for system decomposition or deployments requiring separate credentials and access controls"* - כלומר workspaces לא מיועדים להפרדה בין סביבות עם דרישות אבטחה/גישה שונות. לרוב הארגונים בפרודקשן, **הפרדת תיקיות היא הגישה המומלצת** לסביבות prod/staging/dev.

---

## דוגמה מלאה - שימוש נכון ב-workspaces לפיצ'רים זמניים

Workspaces דווקא מתאימים היטב לתרחיש אחר: **סביבות בדיקה זמניות** (למשל, per-PR preview environments):

```bash
# ב-CI, לכל pull request:
terraform workspace new pr-1234
terraform apply -auto-approve
# ... בדיקות ...
terraform destroy -auto-approve
terraform workspace select default
terraform workspace delete pr-1234
```

זהו שימוש אידיאלי כי כל הסביבות הזמניות זהות באופיין (רק שונות בזמן קיום), ואין דרישת הפרדת credentials.

---

## דפוס נפוץ: משתני tfvars לפי סביבה

גם ללא workspaces, נהוג להפריד קבצי ערכים:

```bash
terraform apply -var-file="envs/dev.tfvars"
terraform apply -var-file="envs/prod.tfvars"
```

```
envs/
├── dev.tfvars
├── staging.tfvars
└── prod.tfvars
```

`prod.tfvars`:
```hcl
instance_type = "m5.large"
instance_count = 3
enable_monitoring = true
```

`dev.tfvars`:
```hcl
instance_type = "t3.micro"
instance_count = 1
enable_monitoring = false
```

---

## שאלות ראיון נפוצות

**1. מה ההבדל בין CLI workspace ל-Terraform Cloud workspace?**
CLI workspace הוא מנגנון מקומי/backend לניהול מספר states לאותה קונפיגורציה. Terraform Cloud workspace הוא ישות שלמה בפלטפורמת HCP Terraform - כולל קוד, משתנים, היסטוריית ריצות ו-state, בדומה יותר ל"פרויקט" נפרד.

**2. מתי תמליצו על workspaces ומתי על הפרדת תיקיות?**
Workspaces מתאימים לסביבות זמניות/דומות (per-PR, בדיקות) שלא דורשות הפרדת credentials. הפרדת תיקיות מומלצת לסביבות פרודקשן קבועות (dev/staging/prod) שדורשות בקרת גישה נפרדת ומניעת טעויות אנוש.

**3. מהו הסיכון המרכזי בשימוש ב-workspaces לניהול prod/dev?**
טעות אנוש - שכחה לבדוק באיזה workspace נמצאים לפני `apply`, מה שעלול לגרום להרצת שינויים על הסביבה הלא נכונה. מומלץ להוסיף בדיקות אוטומטיות ב-CI (`terraform workspace show`) לפני apply.

**4. איפה נשמר ה-state של כל workspace ב-S3 backend?**
תחת prefix `env:/<workspace_name>/` בנוסף לנתיב ה-key שהוגדר.

---

## קישורים חיצוניים

### תיעוד רשמי
- [State: Workspaces](https://developer.hashicorp.com/terraform/language/state/workspaces)
- [terraform workspace CLI](https://developer.hashicorp.com/terraform/cli/commands/workspace)
- [Remote State Storage](https://developer.hashicorp.com/terraform/language/state/remote)

### סרטוני YouTube
- [TechWorld with Nana - Terraform Course Overview](https://www.youtube.com/watch?v=m3cKkYXl-8o)
- [15 Advanced Terraform Interview Questions](https://www.youtube.com/watch?v=G-GvFFpqVy4)

---

**במדריך הבא:** Best Practices ואבטחה - ניהול סודות, מניעת דליפות, ו-code review לתשתית.
