---
sidebar_position: 9.6
title: "מדריך 9.6: Terragrunt - DRY בתשתית מרובת סביבות"
description: "מדריך מלא ל-Terragrunt: הבעיה שהוא פותר, מבנה תיקיות וקובץ root, יצירת backend ו-providers אוטומטית, include ו-inputs, תלויות בין יחידות עם dependency ו-mock_outputs, הרצה על כל העץ עם run --all, hooks, ניהול סודות, והשוואה מול workspaces ו-HCP Terraform."
---

## איזו בעיה Terragrunt בא לפתור?

נניח שיש לכם שלוש סביבות - dev, staging ו-prod - ובכל אחת אותם רכיבים: רשת, מסד נתונים ואפליקציה. אם תפרידו לתיקיות, כמו שהומלץ במדריך 7, תגלו שבכל תיקייה חוזר שוב ושוב אותו קוד שאינו באמת ייחודי לסביבה:

- בלוק `backend` כמעט זהה, שנבדל רק במפתח שבו נשמר ה-state
- בלוק `provider` עם אותו אזור, אותם tags ואותה גרסה
- בלוק `required_providers` עם אותן גרסאות נעוצות
- אותן הפניות לאותם מודולים, רק עם ערכים שונים

**Terragrunt** הוא כלי קוד פתוח של Gruntwork שעוטף את Terraform ומייצר את החלקים החוזרים האלה אוטומטית. במקום לשכפל, מגדירים אותם **פעם אחת** בקובץ הורה, וכל תיקיית סביבה יורשת ממנו ומוסיפה רק את מה שבאמת שונה.

> חשוב להבין: Terragrunt לא מחליף את Terraform ולא משנה את שפת HCL. הוא מריץ את Terraform מתחת למכסה המנוע, אחרי שהוא ייצר עבורו את קבצי התצורה החסרים. הוא תומך גם ב-OpenTofu בתור המנוע שמתחת.

---

## מתי זה מוצדק, ומתי לא

| מתאים | פחות מתאים |
|---|---|
| כמה סביבות עם אותם רכיבים | פרויקט יחיד עם סביבה אחת |
| עשרות תיקיות שחולקות backend ו-providers | צוות קטן עם שתי תיקיות |
| צורך בסדר הרצה בין רכיבים תלויים | תשתית שטוחה בלי תלויות |
| רצון להריץ פקודה אחת על עץ שלם | הרצה ידנית נקודתית |

החיסרון העיקרי הוא שכבה נוספת: כלי נוסף להתקין ולשדרג, שגיאות שמגיעות משתי רמות, וידע שהצוות צריך לרכוש. בפרויקט קטן התקורה הזו לא משתלמת.

---

## התקנה והרצה ראשונה

```bash
# התקנה במק
brew install terragrunt

# או ניהול גרסאות לצד Terraform עצמו
asdf plugin add terragrunt
asdf install terragrunt latest

terragrunt --version
```

Terragrunt מצפה למצוא את Terraform או OpenTofu ב-PATH. כל פקודה מוכרת עובדת דרכו באותו אופן:

```bash
terragrunt init
terragrunt plan
terragrunt apply
```

---

## מבנה תיקיות טיפוסי

```
infra/
├── root.hcl                 # ההגדרות המשותפות לכל הסביבות
├── dev/
│   ├── env.hcl              # ערכים ברמת הסביבה
│   ├── network/
│   │   └── terragrunt.hcl
│   └── app/
│       └── terragrunt.hcl
├── staging/
│   └── ...
└── prod/
    └── ...
```

כל תיקייה שיש בה `terragrunt.hcl` נקראת **unit** - יחידת פריסה עם state משלה. התיקיות האלה לא מכילות קוד Terraform כלל; הן רק מצביעות על מודול ומעבירות לו ערכים.

---

## קובץ ה-root - backend ו-providers פעם אחת

```hcl
# root.hcl - נמצא בשורש ונקרא על ידי כל היחידות שמתחתיו
remote_state {
  backend = "s3"

  generate = {
    path      = "backend.tf"
    if_exists = "overwrite_terragrunt"
  }

  config = {
    bucket         = "my-company-tfstate"
    # המפתח נגזר מהנתיב של היחידה, כך שלכל אחת יש state נפרד משלה
    key            = "${path_relative_to_include()}/terraform.tfstate"
    region         = "eu-west-1"
    encrypt        = true
    dynamodb_table = "terraform-locks"
  }
}

# יצירת קובץ providers.tf בכל יחידה, במקום לשכפל אותו ידנית
generate "provider" {
  path      = "provider.tf"
  if_exists = "overwrite_terragrunt"
  contents  = <<EOF
provider "aws" {
  region = "eu-west-1"

  default_tags {
    tags = {
      ManagedBy = "Terragrunt"
    }
  }
}
EOF
}
```

`path_relative_to_include()` מחזיר את הנתיב היחסי של היחידה מתוך תיקיית ה-root - למשל `prod/network` - ולכן המפתח של ה-state ייחודי לכל יחידה בלי שתכתבו אותו ידנית אף פעם.

---

## יחידה בודדת - include, source ו-inputs

```hcl
# prod/network/terragrunt.hcl
include "root" {
  path = find_in_parent_folders("root.hcl")
}

terraform {
  # הפניה למודול חיצוני, עם נעילת גרסה מפורשת
  source = "git::git@github.com:my-company/tf-modules.git//vpc?ref=v1.4.0"
}

inputs = {
  cidr_block  = "10.0.0.0/16"
  environment = "prod"
  az_count    = 3
}
```

שלושת החלקים: `include` יורש את הגדרות ה-root, `terraform.source` קובע איזה מודול להריץ ובאיזו גרסה, ו-`inputs` הוא מה שהיה מגיע מקובץ `terraform.tfvars`.

> בגרסאות ישנות היה נהוג לקרוא לקובץ השורש `terragrunt.hcl` ולכתוב `find_in_parent_folders()` בלי פרמטר. בגרסאות החדשות מומלץ לתת לו שם מפורש כמו `root.hcl` - כך ברור מה קובץ הורה ומה יחידה, ואין בלבול בין השניים.

### ירושה בשכבות

אפשר לשלב כמה רמות: ערכים משותפים לכל הארגון ב-`root.hcl`, וערכים ברמת הסביבה בקובץ נפרד:

```hcl
# dev/env.hcl
locals {
  environment   = "dev"
  instance_type = "t3.small"
}
```

```hcl
# dev/app/terragrunt.hcl
locals {
  env = read_terragrunt_config(find_in_parent_folders("env.hcl")).locals
}

inputs = {
  environment   = local.env.environment
  instance_type = local.env.instance_type
}
```

---

## תלויות בין יחידות

זו אחת הסיבות החזקות ביותר לאמץ את הכלי. יחידה אחת יכולה לצרוך פלטים של יחידה אחרת, ו-Terragrunt דואג לסדר ההרצה:

```hcl
# prod/app/terragrunt.hcl
dependency "network" {
  config_path = "../network"

  # ערכים מדומים, כדי ש-plan יעבוד עוד לפני שהרשת נוצרה בפועל
  mock_outputs = {
    vpc_id     = "vpc-00000000"
    subnet_ids = ["subnet-0000", "subnet-1111"]
  }

  mock_outputs_allowed_terraform_commands = ["validate", "plan"]
}

inputs = {
  vpc_id     = dependency.network.outputs.vpc_id
  subnet_ids = dependency.network.outputs.subnet_ids
}
```

בלי Terragrunt הייתם צריכים `terraform_remote_state` ידני בכל יחידה, ולזכור בעצמכם מה להריץ קודם. כאן התלות מוצהרת פעם אחת, והיא גם זו שבונה את גרף ההרצה.

---

## הרצה על עץ שלם

```bash
# הרצת plan על כל היחידות מתחת לתיקייה הנוכחית, לפי סדר התלויות
terragrunt run --all plan

terragrunt run --all apply
```

Terragrunt בונה DAG מתוך בלוקי ה-`dependency`, מריץ במקביל כל מה שאפשר, וממתין היכן שיש תלות. בגרסאות קודמות הפקודה נקראה `run-all` ולפני כן `apply-all`, ובתיעוד ישן עדיין תראו את השמות האלה.

> **זהירות בפרודקשן:** `run --all apply` יכול לשנות עשרות יחידות בפקודה אחת, וה-plan המצטבר ארוך מכדי לקרוא אותו ברצינות. נהוג להריץ `run --all plan` לצורך סקירה, ולבצע `apply` ליחידה אחת בכל פעם - או להגביל את ההרצה לתיקייה מסוימת.

---

## Hooks - פעולות לפני ואחרי

```hcl
terraform {
  source = "../../modules/app"

  before_hook "fmt_check" {
    commands = ["plan", "apply"]
    execute  = ["terraform", "fmt", "-check", "-recursive"]
  }

  after_hook "notify" {
    commands     = ["apply"]
    execute      = ["./scripts/notify-slack.sh"]
    run_on_error = false
  }
}
```

שימושים נפוצים: בדיקת פורמט, סריקת אבטחה לפני apply, או שליחת התראה בסיום. יש גם `error_hook` שרץ רק כשהפקודה נכשלת.

---

## ערכים דינמיים וסודות

```hcl
locals {
  # קריאת משתנה סביבה, עם ברירת מחדל אם הוא לא הוגדר
  aws_region = get_env("AWS_REGION", "eu-west-1")

  # פענוח קובץ סודות מוצפן ב-SOPS בזמן ההרצה
  secrets = yamldecode(sops_decrypt_file("secrets.enc.yaml"))
}

inputs = {
  region      = local.aws_region
  db_password = local.secrets.db_password
}
```

כך הסוד נשאר מוצפן ב-Git ומפוענח רק בזמן ההרצה, אצל מי שיש לו מפתח. חשוב לזכור שהערך עדיין ייכתב ל-state, ולכן ה-state עצמו חייב להיות מוצפן ומוגבל בהרשאות.

---

## Terragrunt מול החלופות

| גישה | מה היא פותרת | מה המחיר |
|---|---|---|
| **CLI Workspaces** | state נפרד לאותו קוד | אותו backend ואותן הרשאות לכולם |
| **הפרדת תיקיות בלבד** | הפרדה מלאה בין סביבות | שכפול של backend ו-providers בכל תיקייה |
| **Terragrunt** | מבטל את השכפול, מנהל תלויות וסדר הרצה | כלי נוסף לתחזק וללמוד |
| **HCP Terraform** | ריצות מנוהלות, מדיניות, הרשאות | שירות חיצוני, ותמחור לפי משאבים |

השניים האחרונים אינם סותרים: אפשר להריץ Terragrunt בתוך pipeline שעובד מול HCP Terraform. כדאי גם לעקוב אחרי **Terraform Stacks** ואחרי מנגנון ה-Stacks של Terragrunt עצמו - שניהם מנסים לפתור את אותה בעיית ריבוי היחידות בצורה מובנית.

---

## מלכודות נפוצות וטיפים

1. **נעילת גרסאות של מודולים** - תמיד `?ref=v1.4.0` ולא ענף. בלי זה, שינוי במודול המשותף ישנה את התשתית בהרצה הבאה בלי שנגעתם בכלום.
2. **הוסיפו `.terragrunt-cache` ל-gitignore** - שם Terragrunt מוריד את המודולים ומריץ אותם בפועל. כשמשהו מתנהג מוזר, מחיקת התיקייה הזו פותרת הפתעות רבות.
3. **`mock_outputs` הם לתכנון בלבד** - הגבילו אותם ל-`validate` ול-`plan`. אחרת תגלו ערך מדומה שדלף ל-apply אמיתי.
4. **שמרו על יחידות קטנות** - היתרון של סדר הרצה אוטומטי נעלם אם כל סביבה היא יחידה ענקית אחת.
5. **נעלו גם את גרסת Terragrunt עצמו** בקובץ `.tool-versions` או בתמונת ה-CI, אחרת מפתחים שונים יקבלו התנהגות שונה.
6. **דיבוג** - `terragrunt render-json` מראה את התצורה הסופית אחרי כל הירושות וההחלפות, והוא הכלי הראשון כשהערך שהגיע למודול אינו מה שציפיתם.
7. **אל תערבבו בין הקבצים** - קובץ ההורה מגדיר הגדרות משותפות, קובץ היחידה מצביע על מודול. יחידה שמכילה גם קוד Terraform רגיל היא סימן שמשהו התפספס בתכנון.

---

## פקודות שימושיות

```bash
terragrunt init                      # אתחול היחידה הנוכחית
terragrunt plan                      # תוכנית ליחידה אחת
terragrunt apply                     # החלה של יחידה אחת
terragrunt run --all plan            # תוכנית לכל העץ, לפי סדר התלויות
terragrunt run --all apply           # החלה של כל העץ - בזהירות רבה
terragrunt output                    # הצגת הפלטים של היחידה
terragrunt render-json               # התצורה הסופית אחרי ירושה - לדיבוג
terragrunt hcl fmt                   # עיצוב קבצי hcl של Terragrunt
terragrunt catalog                   # עיון במודולים הזמינים בארגון
terragrunt scaffold <module-url>     # יצירת שלד ליחידה חדשה מתוך מודול
```

---

## שאלות ראיון נפוצות

<details class="qa">
<summary>1. מה Terragrunt מוסיף על Terraform, ולמה בכלל צריך אותו?</summary>

הוא עוטף את Terraform ומייצר אוטומטית את החלקים שחוזרים בכל תיקיית סביבה - בלוק ה-backend, ה-providers והגרסאות - כך שמגדירים אותם פעם אחת בקובץ הורה. בנוסף הוא מנהל תלויות בין יחידות ומאפשר להריץ פקודה אחת על עץ שלם לפי סדר נכון. הוא אינו מחליף את Terraform ואינו משנה את שפת HCL.

</details>

<details class="qa">
<summary>2. איך מוודאים שלכל יחידה יש קובץ state נפרד בלי לכתוב אותו ידנית?</summary>

בבלוק `remote_state` שבקובץ ההורה, קובעים את המפתח לפי `path_relative_to_include()`. הפונקציה מחזירה את הנתיב היחסי של היחידה מתוך תיקיית ה-root, למשל `prod/network`, ולכן המפתח ייחודי לכל יחידה ונגזר ממבנה התיקיות עצמו.

</details>

<details class="qa">
<summary>3. מה ההבדל בין <code>dependency</code> ל-<code>terraform_remote_state</code>?</summary>

`terraform_remote_state` הוא data source של Terraform שקורא state של קונפיגורציה אחרת, אבל אינו יודע דבר על סדר ההרצה - אתם אחראים להריץ קודם את מה שצריך. בלוק `dependency` של Terragrunt גם קורא את הפלטים וגם מצהיר על התלות, ולכן הוא זה שבונה את גרף ההרצה של `run --all`.

</details>

<details class="qa">
<summary>4. למה צריך <code>mock_outputs</code> ומה הסכנה בהם?</summary>

כשיחידה תלויה ביחידה שעדיין לא נוצרה, אין פלטים לקרוא ו-`plan` נכשל. `mock_outputs` מספקים ערכים מדומים כדי שהתכנון יעבור. הסכנה היא שערך מדומה יגיע ל-apply אמיתי וייצור משאב שמצביע לשום מקום, ולכן מגבילים אותם עם `mock_outputs_allowed_terraform_commands` ל-`validate` ול-`plan` בלבד.

</details>

<details class="qa">
<summary>5. מה הסיכון ב-<code>run --all apply</code> בסביבת פרודקשן?</summary>

פקודה אחת יכולה לשנות עשרות יחידות יחד, וה-plan המצטבר ארוך מכדי שמישהו באמת יקרא אותו לפני האישור. הנוהג המקובל הוא להשתמש ב-`run --all plan` לסקירה רחבה, ולבצע `apply` ליחידה אחת בכל פעם או להגביל את ההרצה לתיקייה מסוימת.

</details>

<details class="qa">
<summary>6. איך מונעים מצב שבו שינוי במודול משותף משנה תשתית בלי שנגעתם בה?</summary>

נועלים גרסה מפורשת ב-`source`, למשל `?ref=v1.4.0`, במקום להצביע על ענף. כך שדרוג המודול הוא שינוי מכוון בקוד שעובר code review, ולא תופעת לוואי של merge במאגר אחר.

</details>

<details class="qa">
<summary>7. מתי דווקא לא הייתם מכניסים Terragrunt לפרויקט?</summary>

בפרויקט קטן עם סביבה אחת או שתיים ובלי תלויות בין רכיבים, התקורה גדולה מהתועלת: כלי נוסף לתחזק ולשדרג, שגיאות שמגיעות משתי שכבות, ועקומת למידה לצוות. גם כשהארגון כבר עובד ב-HCP Terraform ומנהל שם ריצות ומדיניות, כדאי לבדוק אם המנגנונים המובנים שם מספיקים לפני שמוסיפים שכבה.

</details>

---

## קישורים חיצוניים

### תיעוד רשמי
- [Terragrunt Documentation](https://terragrunt.gruntwork.io/docs/)
- [Quick Start](https://terragrunt.gruntwork.io/docs/getting-started/quick-start/)
- [Built-in Functions](https://terragrunt.gruntwork.io/docs/reference/built-in-functions/)
- [Terragrunt Configuration Blocks](https://terragrunt.gruntwork.io/docs/reference/config-blocks-and-attributes/)
- [GitHub - gruntwork-io/terragrunt](https://github.com/gruntwork-io/terragrunt)

### סרטוני YouTube
- [Terraform Tutorial Full Course for Beginners (2026)](https://www.youtube.com/watch?v=Bzccj0jjRBM)
- [TechWorld with Nana - Terraform Course Overview](https://www.youtube.com/watch?v=m3cKkYXl-8o)

---

**במדריך הבא:** שאלות ראיון עבודה מרוכזות + טיפים וטריקים מתקדמים.
