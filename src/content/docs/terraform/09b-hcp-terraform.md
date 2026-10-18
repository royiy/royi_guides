---
sidebar_position: 9.5
title: "מדריך 9.5: HCP Terraform (Terraform Cloud)"
description: "מדריך מלא ל-HCP Terraform: מבנה Organization ו-Workspaces, שלוש שיטות העבודה (CLI/VCS/API), הגירת state, Execution Modes, Variable Sets, Dynamic Provider Credentials, Sentinel ו-OPA, Private Registry והשוואה מול CI/CD עצמאי."
---

## מה זה HCP Terraform ולמה הוא קיים?

**HCP Terraform** הוא השירות המנוהל של HashiCorp שמריץ את Terraform עבורכם. זה אותו Terraform שאתם מכירים - אותו HCL, אותם providers - אבל ההרצה (`plan`/`apply`), ה-state, המשתנים וההיסטוריה יושבים בשירות מרוחק במקום על המחשב שלכם או ב-runner של ה-CI.

> **שינוי שם:** השירות נקרא בעבר **Terraform Cloud**, ומ-2024 שמו הרשמי הוא **HCP Terraform** (חלק מפלטפורמת HashiCorp Cloud Platform). בתיעוד ישן, בקורסים ובשאלות ראיון עדיין תיתקלו בשם הישן - מדובר באותו מוצר.

בלי שירות מנוהל, צוות שרוצה לעבוד נכון צריך לבנות בעצמו: backend עם נעילה (S3 + DynamoDB), pipeline שמריץ plan ב-PR, מנגנון אישורים, ניהול סודות, מדיניות אבטחה ו-audit trail. HCP Terraform נותן את כל אלה כשירות:

- **State מנוהל** - אחסון, הצפנה, נעילה אוטומטית והיסטוריית גרסאות
- **ריצות מרוחקות** - `plan` ו-`apply` רצים בסביבת ההרצה של HashiCorp, עם לוג מלא
- **אישורים ובקרה** - מי אישר, מתי, ועל סמך איזה plan
- **ניהול משתנים וסודות** מוצפנים ברמת workspace או ברמת הארגון
- **Policy as Code** - חסימת שינויים שמפרים מדיניות, לפני שהם קורים

---

## מבנה הישויות: Organization, Project, Workspace, Run

| ישות | מה זה | דוגמה |
|---|---|---|
| **Organization** | גבול החשבון - משתמשים, צוותים, חיוב ו-registry פרטי | `my-company` |
| **Project** | קיבוץ לוגי של workspaces, עם הרשאות משלו | `platform-networking` |
| **Workspace** | יחידת העבודה: קוד + משתנים + state + היסטוריית ריצות | `prod-network` |
| **Run** | הרצה בודדת: plan, אישור, apply, ולוג מלא | `run-9xK2...` |

> **מלכודת ראיון קלאסית:** "workspace" ב-HCP Terraform הוא **לא** אותו דבר כמו `terraform workspace` ב-CLI. ב-CLI מדובר במספר states לאותה תיקיית קוד; ב-HCP Terraform workspace הוא **פרויקט שלם** - קוד, משתנים, הרשאות, state והיסטוריה. מומלץ לחזור למדריך 7 להבהרה מלאה.

מוסכמת שמות נפוצה ל-workspaces: `<אפליקציה>-<סביבה>-<אזור>`, למשל `payments-prod-euw1`. עקביות כאן חוסכת הרבה כאב כשיש מאות workspaces.

---

## שלוש שיטות עבודה (Workflows)

| שיטה | מי מפעיל את ההרצה | מתי מתאים |
|---|---|---|
| **CLI-driven** | `terraform apply` מהמחשב או מה-CI, ההרצה עוברת לשרת | מעבר הדרגתי, צוותים שכבר רגילים ל-CLI |
| **VCS-driven** | push/PR ב-GitHub/GitLab/Bitbucket מפעיל ריצה אוטומטית | הסטנדרט לפרודקשן - GitOps מלא בלי לבנות pipeline |
| **API-driven** | קריאות API או ה-provider `tfe` מתוך pipeline קיים | כשיש כבר CI/CD מורכב שרוצים לשלב בו |

ב-**VCS-driven** מקבלים מיד את מה שרוב הצוותים בונים ידנית: PR פותח **Speculative Plan** (plan לתצוגה בלבד שאף פעם לא יריץ apply), התוצאה מופיעה כ-status check ב-PR, ואחרי merge נוצרת ריצה אמיתית שממתינה לאישור.

---

## חיבור פרויקט קיים ל-HCP Terraform

### 1. התחברות

```bash
terraform login           # פותח דפדפן, שומר token ב-~/.terraform.d/credentials.tfrc.json
```

ב-CI לא משתמשים ב-`terraform login` אלא במשתנה סביבה:

```bash
export TF_TOKEN_app_terraform_io="<team-or-user-token>"
```

### 2. הוספת בלוק `cloud`

```hcl
terraform {
  cloud {
    organization = "my-company"

    workspaces {
      name = "prod-network"
    }
  }
}
```

לעבודה מול כמה workspaces מאותו קוד משתמשים ב-`tags` במקום `name`:

```hcl
terraform {
  cloud {
    organization = "my-company"

    workspaces {
      tags = ["networking", "prod"]
    }
  }
}
```

> **שימו לב:** בתוך בלוק `cloud` אי אפשר להשתמש במשתנים או ב-interpolation - הערכים חייבים להיות ליטרלים. מותר להשאיר את הבלוק חלקי ולהשלים את הערכים ב-CI דרך משתני הסביבה `TF_CLOUD_ORGANIZATION`, `TF_CLOUD_PROJECT` ו-`TF_WORKSPACE`.

### 3. הגירת ה-state הקיים

```bash
terraform init            # מזהה את המעבר ומציע להעביר את ה-state הקיים
# או במפורש:
terraform init -migrate-state
```

Terraform ישאל אישור לפני שהוא מעתיק את ה-state ל-HCP Terraform. **לפני כל הגירה** - הורידו עותק גיבוי:

```bash
terraform state pull > backup-$(date +%F).tfstate
```

---

## Execution Mode - איפה הקוד באמת רץ

| מצב | מה קורה | מתי לבחור |
|---|---|---|
| **Remote** (ברירת מחדל) | ההרצה מתבצעת בסביבת HashiCorp; הלוג והמשתנים מנוהלים שם | רוב המקרים |
| **Local** | HCP Terraform משמש רק כאחסון state; ההרצה אצלכם | מעבר הדרגתי, או תלות בכלים מקומיים |
| **Agent** | agent שאתם מתקינים ברשת הפרטית מושך עבודה ומריץ אותה שם | משאבים ברשת סגורה ללא גישה מהאינטרנט |

**HCP Terraform Agents** הם התשובה לשאלה הנפוצה "איך שירות בענן יגיע ל-vSphere או ל-Kubernetes הפנימי שלנו?" - ה-agent יוצר חיבור **יוצא** בלבד אל השירות, כך שאין צורך לפתוח פורטים נכנסים לרשת הארגונית. התכונה זמינה בתוכניות בתשלום.

---

## משתנים, סודות ו-Variable Sets

בכל workspace יש שני סוגי משתנים:

- **Terraform variables** - נכנסים ל-`variable` שהוגדרו בקוד (שקול ל-`.tfvars`)
- **Environment variables** - משתני סביבה לתהליך ההרצה, למשל `AWS_REGION` או `TF_LOG`

כל משתנה ניתן לסימון כ-**Sensitive**: ברגע שסימנתם, הערך נכתב פעם אחת ולא ניתן לקריאה חזרה דרך ה-UI או ה-API - רק להחלפה.

**Variable Sets** מאפשרים להגדיר קבוצת משתנים פעם אחת ולשייך אותה לכמה workspaces (או לכל הארגון) - למשל פרטי חיבור לספק ענן או tags ארגוניים. במקום לעדכן 50 workspaces בנפרד, מעדכנים את ה-Variable Set.

```hcl
# דוגמה לניהול ה-workspace עצמו כקוד, עם ה-provider הרשמי tfe
resource "tfe_workspace" "prod_network" {
  name         = "prod-network"
  organization = "my-company"
  project_id   = tfe_project.platform.id

  vcs_repo {
    identifier     = "my-company/infra"
    branch         = "main"
    oauth_token_id = var.oauth_token_id
  }
}

resource "tfe_variable" "region" {
  key          = "AWS_REGION"
  value        = "eu-west-1"
  category     = "env"
  workspace_id = tfe_workspace.prod_network.id
}
```

---

## Dynamic Provider Credentials - להיפטר ממפתחות סטטיים

זו אחת הסיבות החזקות ביותר לעבור ל-HCP Terraform. במקום לשמור `AWS_ACCESS_KEY_ID` קבוע בתוך workspace, ההרצה מקבלת **זהות זמנית** מול ספק הענן באמצעות OIDC - בדיוק כמו ש-GitHub Actions עושה עם `id-token`.

```bash
# משתני סביבה ב-workspace, ללא שום מפתח קבוע
TFC_AWS_PROVIDER_AUTH = true
TFC_AWS_RUN_ROLE_ARN  = arn:aws:iam::123456789012:role/hcp-terraform-prod
```

בצד AWS מגדירים OIDC Identity Provider שסומך על `app.terraform.io`, ו-Trust Policy שמגבילה לפי ארגון, פרויקט ו-workspace. קיימות הגדרות מקבילות ל-Azure (`TFC_AZURE_PROVIDER_AUTH`), ל-GCP ול-Vault.

היתרון: אין סוד ארוך-טווח שאפשר לגנוב, וההרשאות מוגבלות ל-workspace הספציפי ולזמן ההרצה בלבד.

---

## State, שיתוף פלטים ו-Run Triggers

ה-state מנוהל אוטומטית - הצפנה במנוחה, נעילה בזמן ריצה, והיסטוריית גרסאות שממנה אפשר להוריד או לשחזר גרסה קודמת דרך ה-UI.

לשיתוף מידע בין workspaces יש שתי דרכים:

```hcl
# 1. המקור מפרסם output
output "vpc_id" {
  value = aws_vpc.main.id
}

# 2. הצרכן קורא אותו דרך tfe_outputs (ה-provider הרשמי)
data "tfe_outputs" "network" {
  organization = "my-company"
  workspace    = "prod-network"
}

resource "aws_instance" "app" {
  subnet_id = data.tfe_outputs.network.values.private_subnet_id
}
```

> ב-HCP Terraform יש **Remote State Sharing** ברמת הרשאות: workspace צריך להתיר במפורש למי מותר לקרוא את ה-outputs שלו. זה מונע מצב שבו כל צוות בארגון קורא את ה-state של הרשת.

**Run Triggers** מאפשרים שרשור אוטומטי: סיום מוצלח של `prod-network` יכול להפעיל ריצה ב-`prod-app` שתלוי בו - שרשרת פריסה בלי pipeline חיצוני.

---

## Policy as Code, עלויות וזיהוי Drift

**Sentinel** היא שפת המדיניות של HashiCorp, ו-HCP Terraform תומך גם ב-**OPA/Rego**. המדיניות נבדקת **בין ה-plan ל-apply**, כך שהפרה נחסמת לפני שהמשאב נוצר:

```python
# חסימת instance types יקרים בסביבות שאינן פרודקשן
import "tfplan/v2" as tfplan

allowed_types = ["t3.micro", "t3.small", "t3.medium"]

main = rule {
  all tfplan.resource_changes as _, rc {
    rc.type is not "aws_instance" or
      rc.change.after.instance_type in allowed_types
  }
}
```

רמות אכיפה: **advisory** (אזהרה בלבד), **soft-mandatory** (ניתן לעקיפה באישור מפורש) ו-**hard-mandatory** (חוסם תמיד).

בנוסף זמינים **Cost Estimation** - אומדן עלות חודשית לשינוי לפני אישור, ו-**Health Assessments** - סריקה תקופתית שמזהה **drift** (שינויים ידניים בענן) ומתריעה עליהם. שתי התכונות שייכות לתוכניות בתשלום.

---

## Private Registry ומודולים

לכל ארגון יש **Private Registry** משלו למודולים ול-providers פנימיים:

```hcl
module "vpc" {
  source  = "app.terraform.io/my-company/vpc/aws"
  version = "~> 3.2"

  cidr_block = "10.0.0.0/16"
}
```

המודול נרשם מ-repository ב-VCS, והגרסאות נגזרות מתגיות Git (`v3.2.0`). כך מקבלים ניהול גרסאות אמיתי למודולים פנימיים במקום `source = "git::..."` עם `ref` ידני.

בתוכניות בתשלום קיימים גם **No-Code Modules** - מודול שמישהו בארגון יכול להפעיל דרך טופס ב-UI בלי לכתוב שורת HCL, מה שמאפשר לתת לצוותי פיתוח "self-service" מבוקר.

---

## הרשאות, צוותים ו-Audit

- **Teams** - קבוצות משתמשים עם הרשאות ל-workspace או לפרויקט: `read`, `plan`, `write`, `admin`
- **SSO** - התחברות דרך ספק זהות ארגוני (SAML/OIDC), עם מיפוי קבוצות לצוותים
- **Audit Trail** - מי שינה משתנה, מי אישר ריצה ומתי; בתוכניות הגבוהות אפשר לייצא ל-SIEM
- **Tokens** - שלושה סוגים: User, Team (ל-CI) ו-Organization. ב-pipelines תמיד Team Token עם ההרשאה המינימלית

---

## HCP Terraform מול Terraform Enterprise מול CI/CD עצמאי

| שיקול | HCP Terraform | Terraform Enterprise | CI/CD עצמאי (Actions/GitLab) |
|---|---|---|---|
| אחסון | SaaS של HashiCorp | התקנה בתשתית שלכם | Backend שאתם מתחזקים (S3 וכו') |
| זמן הקמה | דקות | פרויקט תשתית | ימים עד שבועות |
| Policy as Code | מובנה (Sentinel/OPA) | מובנה | להוסיף בעצמכם (OPA/Checkov) |
| רשת סגורה | דרך Agents | טבעי | טבעי |
| עלות | לפי משאבים מנוהלים (RUM) | רישוי ארגוני | עלות ה-runners והתחזוקה |
| שליטה מלאה בתהליך | בינונית | גבוהה | הגבוהה ביותר |

מודל התמחור מבוסס **RUM - Resources Under Management**: סופרים משאבים מנוהלים, עם שכבה חינמית לפרויקטים קטנים (מאות משאבים) ותוכניות בתשלום מעליה. התנאים משתנים מעת לעת - בדקו את דף התמחור העדכני לפני החלטה ארגונית.

**Terraform Enterprise** הוא אותו מוצר כהתקנה עצמית (self-hosted) - רלוונטי לארגונים עם דרישות רגולטוריות שאוסרות state בענן ציבורי.

---

## מלכודות נפוצות וטיפים

1. **בלבול בין שני סוגי workspace** - הטעות הנפוצה ביותר. `terraform workspace` ב-CLI אינו קשור ל-workspaces של HCP Terraform, ובעבודה מול בלוק `cloud` אין בכלל טעם ב-CLI workspaces.
2. **`-var` ו-`.tfvars` מקומיים לא עוברים אוטומטית** - בהרצה מרוחקת, משתנים נלקחים מה-workspace. קובץ `terraform.tfvars` שנמצא ב-repo כן נטען, אבל `-var` מהמחשב שלכם עלול להתעלם בשקט.
3. **credentials של ספק הענן** - בהרצה מרוחקת המפתחות שעל המחשב שלכם לא זמינים. הגדירו אותם כ-Environment Variables ב-workspace, ועדיף Dynamic Provider Credentials.
4. **Speculative Plan אינו apply** - ריצה מ-PR לעולם לא תשנה תשתית; אל תחכו שהיא "תסיים לפרוס".
5. **אל תשאירו את ה-state הישן** - אחרי הגירה מוצלחת, מחקו או נעלו את ה-backend הקודם כדי שלא יעבדו מולו בטעות.
6. **נעילת גרסת Terraform ברמת ה-workspace** - הגדירו גרסה מפורשת, אחרת שדרוג של השירות עלול לשנות התנהגות באמצע ספרינט.
7. **נהלו את HCP Terraform עצמו כקוד** - עם ה-provider `tfe`, כך שיצירת workspace, משתנים והרשאות תעבור גם היא code review.

---

## פקודות ומשתני סביבה שימושיים

```bash
terraform login                  # התחברות ושמירת token מקומי
terraform logout                 # מחיקת ה-token
terraform init -migrate-state    # הגירת state קיים ל-HCP Terraform
terraform state pull > bak.json  # גיבוי ה-state לפני שינוי משמעותי
terraform apply -auto-approve    # ב-CLI-driven: מריץ בשרת, מאשר אוטומטית
```

```bash
# משתני סביבה נפוצים ב-CI
TF_TOKEN_app_terraform_io   # אימות מול השירות
TF_CLOUD_ORGANIZATION       # שם הארגון (חלופה לליטרל בבלוק cloud)
TF_WORKSPACE                # בחירת workspace דינמית
```

---

## שאלות ראיון נפוצות

<details class="qa">
<summary>1. מה ההבדל בין workspace ב-HCP Terraform לבין <code>terraform workspace</code> ב-CLI?</summary>

ב-CLI, workspace הוא מנגנון לניהול כמה קבצי state לאותה תיקיית קוד. ב-HCP Terraform, workspace הוא יחידת עבודה שלמה: קוד מקושר, משתנים, סודות, הרשאות, state והיסטוריית ריצות. בעבודה מול בלוק `cloud` אין למעשה שימוש ב-CLI workspaces.

</details>

<details class="qa">
<summary>2. מה ההבדל בין VCS-driven ל-CLI-driven workflow?</summary>

ב-VCS-driven, HCP Terraform מחובר ישירות ל-repository: PR מייצר Speculative Plan, ו-merge מייצר ריצה אמיתית - בלי שתכתבו pipeline. ב-CLI-driven אתם מפעילים `terraform apply` מהמחשב או מה-CI, וההרצה עצמה מתבצעת בשרת. VCS-driven הוא הסטנדרט לפרודקשן; CLI-driven נוח למעבר הדרגתי.

</details>

<details class="qa">
<summary>3. איך מעבירים פרויקט קיים עם backend של S3 ל-HCP Terraform?</summary>

מגבים את ה-state (`terraform state pull`), מחליפים את בלוק ה-`backend "s3"` בבלוק `cloud` עם הארגון וה-workspace, ומריצים `terraform init -migrate-state` ומאשרים את ההעברה. אחרי אימות ש-`terraform plan` נקי, נועלים או מוחקים את ה-bucket הישן כדי שלא יעבדו מולו בטעות.

</details>

<details class="qa">
<summary>4. מה זה Dynamic Provider Credentials ולמה זה עדיף על מפתחות סטטיים?</summary>

מנגנון שבו ההרצה מקבלת זהות זמנית מול ספק הענן דרך OIDC, במקום מפתח קבוע ששמור ב-workspace. אין סוד ארוך-טווח שאפשר לגנוב או לשכוח לסובב, וההרשאות מוגבלות ל-workspace מסוים ולזמן ההרצה בלבד. ב-AWS מגדירים זאת עם `TFC_AWS_PROVIDER_AUTH` ו-`TFC_AWS_RUN_ROLE_ARN` מול OIDC Provider שסומך על השירות.

</details>

<details class="qa">
<summary>5. מתי תבחרו ב-Execution Mode של Agent?</summary>

כשהמשאבים שצריך לנהל יושבים ברשת סגורה שאינה נגישה מהאינטרנט - vSphere, Kubernetes פנימי או מסד נתונים מבודד. ה-agent מותקן בתוך הרשת ופותח חיבור יוצא בלבד אל HCP Terraform, כך שאין צורך לפתוח פורטים נכנסים.

</details>

<details class="qa">
<summary>6. מה עושה Sentinel ומה ההבדל בין רמות האכיפה שלו?</summary>

Sentinel אוכפת מדיניות על ה-plan לפני ה-apply, כך שהפרה נחסמת לפני שהמשאב נוצר (למשל איסור על bucket ציבורי או על instance type יקר). שלוש רמות האכיפה: advisory - אזהרה בלבד; soft-mandatory - חוסם אך ניתן לעקיפה באישור מפורש; hard-mandatory - חוסם תמיד. קיימת גם תמיכה ב-OPA/Rego כחלופה.

</details>

<details class="qa">
<summary>7. מה ההבדל בין HCP Terraform ל-Terraform Enterprise?</summary>

אותו מוצר בשתי צורות אספקה: HCP Terraform הוא SaaS שמתארח אצל HashiCorp, ו-Terraform Enterprise הוא התקנה עצמית בתשתית של הארגון. בוחרים ב-Enterprise כשיש דרישה רגולטורית או מדיניות שאוסרת שמירת state ולוגים בענן ציבורי, במחיר תחזוקה ורישוי ארגוני.

</details>

---

## קישורים חיצוניים

### תיעוד רשמי
- [HCP Terraform Documentation](https://developer.hashicorp.com/terraform/cloud-docs)
- [בלוק cloud בתצורת Terraform](https://developer.hashicorp.com/terraform/language/terraform#terraform-cloud)
- [Dynamic Provider Credentials](https://developer.hashicorp.com/terraform/cloud-docs/workspaces/dynamic-provider-credentials)
- [Sentinel Policy as Code](https://developer.hashicorp.com/terraform/cloud-docs/policy-enforcement)
- [HCP Terraform Agents](https://developer.hashicorp.com/terraform/cloud-docs/agents)
- [tfe Provider - ניהול HCP Terraform כקוד](https://registry.terraform.io/providers/hashicorp/tfe/latest/docs)

### סרטוני YouTube
- [Terraform Tutorial Full Course for Beginners (2026)](https://www.youtube.com/watch?v=Bzccj0jjRBM)
- [TechWorld with Nana - Terraform Course Overview](https://www.youtube.com/watch?v=m3cKkYXl-8o)

---

**במדריך הבא:** שאלות ראיון עבודה מרוכזות + טיפים וטריקים מתקדמים.
