---
sidebar_position: 2
title: "מדריך 2: Terraform CLI Workflow ופקודות חיוניות"
---

## מבוא

ב-Terraform CLI יש עשרות פקודות, אך ב-90% מהזמן תשתמשו רק בקומץ פקודות ליבה. המדריך הזה עובר על כולן לעומק, כולל flags שימושיים, דוגמאות פלט ותרחישי שימוש.

---

## `terraform init`

מאתחל את תיקיית העבודה: מוריד providers, מגדיר backend, ומכין את תיקיית `.terraform/`.

```bash
terraform init
```

פלטים נפוצים:
```
Initializing the backend...
Initializing provider plugins...
- Finding hashicorp/aws versions matching "~> 5.0"...
- Installing hashicorp/aws v5.31.0...

Terraform has been successfully initialized!
```

### Flags שימושיים
```bash
terraform init -upgrade          # שדרוג providers לגרסה החדשה המותרת
terraform init -reconfigure      # התעלמות מהגדרות backend קיימות
terraform init -migrate-state    # מעבר בין backends עם העברת state
terraform init -backend-config="bucket=my-tf-state"  # הזרקת ערכי backend דינמית
```

> **מתי צריך להריץ שוב `init`?** בכל פעם שמוסיפים provider חדש, משנים את הגדרת ה-backend, או מוסיפים/מסירים module.

---

## `terraform validate`

בודק תקינות תחבירית וסמנטית של הקוד **בלי** לגעת בענן.

```bash
terraform validate
```

```
Success! The configuration is valid.
```

זו פקודה מצוינת לשלב CI מוקדם - זולה ומהירה.

---

## `terraform fmt`

מעצב את הקוד לפי הסטנדרט הרשמי (רווחים, יישור `=`).

```bash
terraform fmt              # מעצב את התיקייה הנוכחית
terraform fmt -recursive   # כולל תת-תיקיות
terraform fmt -check       # רק בודק, לא משנה (טוב ל-CI)
terraform fmt -diff        # מציג את ההבדלים
```

> **טיפ:** הוסיפו `terraform fmt -check -recursive` כ-pre-commit hook או שלב CI כדי לאכוף עיצוב אחיד בצוות.

---

## `terraform plan`

מחשב ומציג execution plan - מה ישתנה בלי לבצע דבר בפועל.

```bash
terraform plan
```

סימנים בפלט:
- `+` יצירה (create)
- `-` מחיקה (destroy)
- `~` עדכון (update in-place)
- `-/+` החלפה (destroy + create מחדש)

```
Terraform will perform the following actions:

  # aws_instance.web will be created
  + resource "aws_instance" "web" {
      + ami           = "ami-0c55b159cbfafe1f0"
      + instance_type = "t2.micro"
      ...
    }

Plan: 1 to add, 0 to change, 0 to destroy.
```

### Flags שימושיים
```bash
terraform plan -out=tfplan             # שמירת התוכנית לקובץ בשביל apply עקבי
terraform plan -var="instance_type=t3.micro"   # דריסת משתנה מה-CLI
terraform plan -var-file="prod.tfvars"         # טעינת קובץ ערכים ספציפי
terraform plan -target=aws_instance.web        # התמקדות במשאב בודד (זהירות!)
terraform plan -destroy                        # תצוגה מקדימה של destroy
```

> **טיפ קריטי לראיונות:** `-target` שימושי לדיבוג אבל **מסוכן** בסביבת פרודקשן כי הוא עלול להשאיר את ה-state לא מסונכרן עם שאר התלויות. תמיד תריצו `plan` מלא אחריו כדי לוודא שהכל תקין.

---

## `terraform apply`

מבצע את השינויים בפועל.

```bash
terraform apply
```

יבקש אישור ידני (`yes`) אלא אם משתמשים ב:
```bash
terraform apply -auto-approve       # ללא אישור ידני - שמור ל-CI/CD בלבד!
terraform apply tfplan              # הרצת plan שמור מראש (הכי בטוח)
terraform apply -var="env=staging"
```

### למה עדיף `plan -out` ואז `apply tfplan`?
כי בין ה-`plan` ל-`apply` יכול לחלוף זמן, ומצב הענן עלול להשתנות. שמירת התוכנית לקובץ ואז הרצתה מבטיחה שאתם מיישמים **בדיוק** את מה שביקרתם.

---

## `terraform destroy`

מוחק את כל המשאבים המנוהלים בקונפיגורציה.

```bash
terraform destroy
terraform destroy -target=aws_instance.web   # מחיקת משאב בודד בלבד
terraform destroy -auto-approve              # זהירות מירבית!
```

> **אזהרה:** `destroy` הוא בלתי הפיך עבור רוב המשאבים בענן (מחיקת דאטהבייס = אובדן נתונים). תמיד ודאו backups לפני שימוש בפרודקשן.

---

## `terraform show`

מציג את ה-state הנוכחי או קובץ plan בפורמט קריא.

```bash
terraform show
terraform show tfplan
terraform show -json tfplan | jq   # פלט JSON לעיבוד אוטומטי (CI, סקריפטים)
```

---

## `terraform output`

מציג את ה-outputs שהוגדרו.

```bash
terraform output                  # כל ה-outputs
terraform output instance_ip      # ערך ספציפי
terraform output -json            # JSON - שימושי לשילוב עם סקריפטים אחרים
terraform output -raw instance_ip # ערך גולמי בלי מרכאות, טוב לצנרת shell
```

---

## `terraform console`

REPL אינטראקטיבי לבדיקת expressions ו-functions.

```bash
terraform console
> upper("hello")
"HELLO"
> [for s in ["a","b","c"] : upper(s)]
[
  "A",
  "B",
  "C",
]
```

זהו כלי מעולה לדיבוג ביטויים מסובכים לפני שמכניסים אותם לקוד.

---

## `terraform graph`

מייצר ייצוג DOT של גרף התלויות בין המשאבים - שימושי להבנת סדר היצירה.

```bash
terraform graph | dot -Tsvg > graph.svg
```

---

## `terraform workspace`

ניהול workspaces (נרחיב במדריך נפרד):
```bash
terraform workspace list
terraform workspace new staging
terraform workspace select prod
```

---

## `terraform import`

מייבא משאב קיים בענן ל-state, בלי ליצור אותו מחדש.

```bash
terraform import aws_instance.web i-1234567890abcdef0
```

> **חשוב:** `import` רק מכניס ל-state - עדיין צריך לכתוב ידנית את בלוק ה-`resource` המתאים בקוד. ב-Terraform 1.5+ יש אלטרנטיבה מודרנית - בלוק `import` בקוד:

```hcl
import {
  to = aws_instance.web
  id = "i-1234567890abcdef0"
}
```

ואז ריצת `terraform plan -generate-config-out=generated.tf` שיוצר אוטומטית את הקוד המתאים!

---

## `terraform state`

פקודות ניהול state מתקדמות (נעמיק במדריך 5):
```bash
terraform state list                          # רשימת כל המשאבים ב-state
terraform state show aws_instance.web         # פרטי משאב בודד
terraform state mv aws_instance.web aws_instance.web2   # שינוי שם ב-state
terraform state rm aws_instance.web           # הסרה מה-state בלי מחיקה בענן
```

---

## `terraform taint` / `-replace` (מודרני יותר)

מסמן משאב להחלפה כפויה בהרצה הבאה:

```bash
# הדרך המודרנית (Terraform 0.15.2+):
terraform apply -replace="aws_instance.web"

# הדרך הישנה (deprecated):
terraform taint aws_instance.web
```

שימושי כשמשאב "שבור" (למשל VM תקוע) וצריך ליצור אותו מחדש בלי לשנות קוד.

---

## תרחיש מלא - Workflow טיפוסי

```bash
# 1. אתחול פרויקט חדש
terraform init

# 2. בדיקת תקינות ועיצוב
terraform fmt -recursive
terraform validate

# 3. תכנון עם שמירה לקובץ
terraform plan -out=tfplan

# 4. סקירה ואישור ב-CI/PR

# 5. יישום
terraform apply tfplan

# 6. בדיקת פלטים
terraform output
```

---

## שאלות ראיון נפוצות

**1. מה ההבדל בין `plan` ל-`apply`?**
`plan` מחשב ומציג את השינויים הצפויים ללא ביצוע בפועל; `apply` מבצע את השינויים בפועל (ולרוב מריץ `plan` פנימי לפני כן).

**2. מה קורה אם `apply` נכשל באמצע הרצה?**
Terraform שומר state חלקי - המשאבים שכבר נוצרו נשמרים ב-state, וההרצה הבאה תנסה להשלים מהנקודה שבה נעצר. לכן חשוב תמיד להריץ שוב `plan`/`apply` לאחר כישלון ולא להשאיר את הסביבה ב"מצב ביניים".

**3. למה `-target` נחשב אנטי-פטרן?**
כי הוא מתעלם מגרף התלויות המלא ועלול ליצור מצב state לא עקבי. משתמשים בו רק לדיבוג נקודתי, ולאחריו חובה להריץ `plan` מלא.

**4. איך מריצים Terraform באופן לא-אינטראקטיבי ב-CI/CD?**
```bash
terraform init -input=false
terraform plan -input=false -out=tfplan
terraform apply -input=false -auto-approve tfplan
```

---

## קישורים חיצוניים

### תיעוד רשמי
- [Terraform CLI Documentation](https://developer.hashicorp.com/terraform/cli)
- [terraform state commands](https://developer.hashicorp.com/terraform/cli/commands/state)
- [Import - generate config](https://developer.hashicorp.com/terraform/language/import)

### סרטוני YouTube
- [TechWorld with Nana - Terraform commands](https://www.youtube.com/watch?v=m3cKkYXl-8o)
- [Terraform Tutorial Full Course for Beginners (2026)](https://www.youtube.com/watch?v=Bzccj0jjRBM)

---

**במדריך הבא:** שפת HCL - משתנים, פלטים, locals וכל טיפוסי הנתונים.
