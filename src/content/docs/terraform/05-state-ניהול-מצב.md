---
sidebar_position: 5
title: "מדריך 5: Terraform State לעומק"
description: "מה זה קובץ ה-state ולמה הוא קיים, Local לעומת Remote state, נעילת state, פקודות terraform state, זיהוי drift ושיתוף מידע עם terraform_remote_state."
---

## מה זה State ולמה הוא קיים?

**Terraform State** הוא קובץ JSON (בדרך כלל `terraform.tfstate`) שבו Terraform שומר את המיפוי בין המשאבים שהוגדרו בקוד לבין המשאבים בפועל בענן. זהו "מקור האמת" שמאפשר ל-Terraform לדעת:

1. אילו משאבים כבר קיימים ומנוהלים על ידו
2. מהם המזהים (IDs) שלהם בפועל בענן
3. מה הערכים העדכניים של כל attribute
4. מהם יחסי התלות ביניהם

בלי state, Terraform היה צריך לסרוק את **כל** הענן בכל הרצה כדי להבין מה קיים - זה גם איטי מאוד וגם לא מספיק (איך תדעו איזה משאב "שלכם" מול משאב שנוצר ידנית?).

```json
{
  "version": 4,
  "terraform_version": "1.9.0",
  "resources": [
    {
      "type": "aws_instance",
      "name": "web",
      "instances": [
        {
          "attributes": {
            "id": "i-0abcd1234efgh5678",
            "instance_type": "t3.micro",
            "public_ip": "54.12.34.56"
          }
        }
      ]
    }
  ]
}
```

> **חשוב לזכור:** קובץ ה-state עלול להכיל מידע רגיש בטקסט גלוי (סיסמאות, מפתחות פרטיים וכו') גם אם סימנתם אותם כ-`sensitive` בקוד! לכן חובה להגן עליו כמו על סוד.

---

## Local State לעומת Remote State

### Local State (ברירת מחדל)
נשמר כקובץ `terraform.tfstate` בתיקיית העבודה המקומית. **בעייתי לעבודת צוות**:
- שני אנשים שמריצים `apply` במקביל עלולים לשבור זה את זה
- אין backup אוטומטי
- הקובץ עלול להישכח מחוץ ל-`.gitignore` ולהידלף

### Remote State (מומלץ לכל פרויקט אמיתי)
נשמר בשירות מרוחק - S3, Azure Blob, GCS, Terraform Cloud, Consul ועוד.

```hcl
terraform {
  backend "s3" {
    bucket         = "my-company-terraform-state"
    key            = "prod/network/terraform.tfstate"
    region         = "eu-west-1"
    dynamodb_table = "terraform-locks"   # נעילה שמונעת הרצות מקבילות
    encrypt        = true
  }
}
```

יתרונות:
- **שיתוף בין הצוות** - כולם עובדים מול אותו state
- **State Locking** - מונע הרצות מקבילות שיפגעו זו בזו
- **Versioning/Backup** - S3 versioning שומר היסטוריה
- **הצפנה** - Encryption at rest

> **טיפ קריטי:** ב-AWS, נהוג להשתמש ב-S3 יחד עם DynamoDB לצורך locking. ב-Terraform 1.10+ ניתן גם להשתמש ב-native S3 locking (מבוסס Conditional Writes) בלי DynamoDB בכלל - כדאי לבדוק את התיעוד העדכני לגרסה שלכם.

---

## State Locking - נעילה שמונעת הרצות מקבילות

כששני אנשים מריצים `apply` על אותו state באותו הרגע, שתי ההרצות קוראות את אותו מצב התחלתי וכל אחת כותבת מעל השנייה. התוצאה היא קובץ state שלא מתאר נכון את מה שקיים בענן - מצב שקשה מאוד לתקן, ושנקרא באנגלית **state corruption**.

כדי למנוע את זה, Terraform נועל את ה-state בתחילת כל פעולה שכותבת אליו, ומשחרר את הנעילה בסיומה. הרצה שנייה שמנסה להתחיל בינתיים פשוט לא תתחיל, ותציג את ההודעה הזו:

```
Error: Error acquiring the state lock

Lock Info:
  ID:        a1b2c3d4-...
  Path:      prod/network/terraform.tfstate
  Operation: OperationTypeApply
  Who:       dana@laptop
  Created:   2026-08-16 10:23:11
```

ההודעה מספרת מי מחזיק בנעילה, איזו פעולה הוא מריץ ומתי היא התחילה. מהשדות האלה אפשר להבין אם באמת יש הרצה פעילה של מישהו אחר, או שנשארה נעילה יתומה מתהליך שקרס.

הנעילה עצמה אינה חלק מקובץ ה-state אלא מהשירות שמאחסן אותו, ולכן היא תלויה ב-backend שבחרתם. אלה שתומכים בנעילה אוטומטית:

- **S3 יחד עם DynamoDB** - הנפוץ ביותר ב-AWS. מגרסה 1.10 אפשר גם בלי טבלת DynamoDB
- **HCP Terraform** - הנעילה מובנית ולא צריך להגדיר כלום
- **Azure Blob Storage** - מבוסס מנגנון lease של האחסון
- **GCS** - נעילה מובנית

אם ברור לכם שאין הרצה פעילה אחרת, למשל כי התהליך שהחזיק בנעילה קרס, אפשר לשחרר אותה ידנית:

```bash
terraform force-unlock <LOCK_ID>
```

> **אזהרה:** `force-unlock` הוא פעולה מסוכנת - השתמשו בה רק כשבטוחים שאין הרצה פעילה אחרת, אחרת אתם עלולים לגרום ל-corruption אמיתי.

---

## פקודות `terraform state` המרכזיות

```bash
# רשימת כל המשאבים המנוהלים
terraform state list

# פרטים מלאים על משאב ספציפי
terraform state show aws_instance.web

# שינוי כתובת משאב ב-state (למשל אחרי refactor בקוד)
terraform state mv aws_instance.web aws_instance.web_server

# הסרת משאב מה-state בלי למחוק אותו בענן בפועל!
terraform state rm aws_instance.web

# הורדת עותק מקומי של ה-remote state
terraform state pull > backup.tfstate

# העלאת state מקומי בחזרה (מסוכן - שימוש נדיר וזהיר)
terraform state push backup.tfstate

# החלפת provider ב-state (למשל מעבר מ-registry אחד לאחר)
terraform state replace-provider hashicorp/aws registry.example.com/mycompany/aws
```

### דוגמת שימוש ב-`state mv` - Refactoring בלי הרס משאבים

נניח ששיניתם שם משאב בקוד מ-`web` ל-`app_server`. בלי `state mv`, Terraform יראה בזה מחיקה של המשאב הישן ויצירה של משאב חדש במקומו - כלומר השבתה אמיתית של השירות.

במקום זה, מעדכנים את הכתובת בתוך ה-state:

```bash
terraform state mv aws_instance.web aws_instance.app_server
```

עכשיו ה-state "יודע" שזה אותו משאב פיזי, רק בשם אחר בקוד - אין destroy/create.

---

## Drift Detection - כשהמציאות לא תואמת את ה-state

**Drift** קורה כשמישהו משנה משאב ידנית (בקונסולה, ב-CLI ישיר) בלי דרך Terraform. בהרצת `plan` הבאה, Terraform יזהה את ההבדל ויציע "לתקן" בחזרה למצב שבקוד.

```bash
terraform plan -refresh-only    # רק מרענן ומראה drift, בלי לשנות משהו
terraform apply -refresh-only   # מעדכן את ה-state כדי שיתאים למציאות (בלי לשנות תשתית)
```

> **טיפ לראיונות:** יש שני פתרונות ל-drift - או להחזיר את התשתית לתאום עם הקוד (`terraform apply` רגיל), או לעדכן את הקוד כך שישקף את המצב האמיתי (ואז `refresh-only` לעדכן את ה-state).

---

## `terraform_remote_state` - שיתוף מידע בין קונפיגורציות

מאפשר לקונפיגורציה אחת לקרוא outputs מ-state של קונפיגורציה אחרת - שימושי כדי לפצל תשתית גדולה למספר "שכבות" (network / compute / app).

```hcl
data "terraform_remote_state" "network" {
  backend = "s3"
  config = {
    bucket = "my-company-terraform-state"
    key    = "prod/network/terraform.tfstate"
    region = "eu-west-1"
  }
}

resource "aws_instance" "web" {
  subnet_id = data.terraform_remote_state.network.outputs.public_subnet_id
}
```

> **טיפ ארכיטקטוני:** HashiCorp ממליצים כיום להשתמש ב-data sources ייעודיים (כמו `data "aws_ssm_parameter"`) לשיתוף מידע מפורש במקום `terraform_remote_state`, כדי לאפשר בקרות גישה נפרדות בין ה-state הרגיש לבין המידע המשותף.

---

## מבנה תיקיות רב-שכבתי טיפוסי

```
infra/
├── network/
│   ├── main.tf
│   └── backend.tf   # key = "prod/network/terraform.tfstate"
├── database/
│   ├── main.tf
│   └── backend.tf   # key = "prod/database/terraform.tfstate"
└── compute/
    ├── main.tf
    └── backend.tf   # key = "prod/compute/terraform.tfstate"
```

כל שכבה מנהלת state נפרד - זה מקטין blast radius (אם משהו נשבר בשכבת compute, network ו-database לא נפגעים).

---

## שאלות ראיון נפוצות

<details class="qa">
<summary>1. מה זה Terraform state ולמה הוא קריטי?</summary>

קובץ JSON ששומר מיפוי בין הקונפיגורציה למשאבים בפועל בענן, כולל attributes, IDs ותלויות. בלעדיו Terraform לא יכול לדעת מה כבר קיים ומה צריך ליצור/לעדכן/למחוק.

</details>

<details class="qa">
<summary>2. מה ההבדל בין local state ל-remote state, ומתי משתמשים בכל אחד?</summary>

Local state מתאים ללימוד/פרויקטים אישיים קטנים. Remote state הכרחי לעבודת צוות - מאפשר שיתוף, locking, backup והצפנה.

</details>

<details class="qa">
<summary>3. מה זה state locking ואיך הוא מונע בעיות?</summary>

מנגנון שמונע משני תהליכים להריץ `apply`/`plan` על אותו state בו-זמנית, כדי למנוע corruption. מיושם בעזרת DynamoDB (S3 backend), lease מנגנונים (Azure), או native ב-Terraform Cloud.

</details>

<details class="qa">
<summary>4. איך מטפלים ב-state drift?</summary>

מזהים אותו עם `terraform plan` (או `-refresh-only` לפירוט מדויק יותר), ואז מחליטים: או להריץ `apply` כדי להחזיר לתאום עם הקוד, או לעדכן את הקוד כך שישקף את המציאות ואז `apply -refresh-only`.

</details>

<details class="qa">
<summary>5. מה ההבדל בין <code>terraform state rm</code> ל-<code>terraform destroy</code>?</summary>

`state rm` מסיר משאב מה-state **בלי** למחוק אותו בפועל בענן - הוא ממשיך להתקיים אבל Terraform מפסיק לנהל אותו. `destroy` מוחק את המשאב בפועל.

</details>

<details class="qa">
<summary>6. איך הייתם מפצלים state גדול לחלקים קטנים יותר?</summary>

על ידי חלוקה לשכבות לוגיות (network/database/compute) עם backend נפרד לכל אחת, ושימוש ב-`terraform_remote_state` או data sources ייעודיים לשיתוף מידע ביניהן.

</details>

---

## קישורים חיצוניים

### תיעוד רשמי
- [State - Overview](https://developer.hashicorp.com/terraform/language/state)
- [Remote State Storage](https://developer.hashicorp.com/terraform/language/state/remote)
- [terraform_remote_state Data Source](https://developer.hashicorp.com/terraform/language/state/remote-state-data)
- [terraform state CLI commands](https://developer.hashicorp.com/terraform/cli/commands/state)
- [State: Workspaces](https://developer.hashicorp.com/terraform/language/state/workspaces)

### סרטוני YouTube
- [15 Advanced Terraform Interview Questions: State Management, Drift & Modules](https://www.youtube.com/watch?v=G-GvFFpqVy4)
- [TechWorld with Nana - Terraform Course Overview](https://www.youtube.com/watch?v=m3cKkYXl-8o)

---

**במדריך הבא:** Modules - יצירת קוד לשימוש חוזר, מבנה, ורג'יסטרי ציבורי.
