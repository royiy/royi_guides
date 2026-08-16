---
title: "Infrastructure as Code – Terraform ב-CI/CD"
category: DevOps/CI-CD
part: 9/10
---

## מה זה Infrastructure as Code (IaC)?

במקום להגדיר תשתית (שרתים, רשתות, מסדי נתונים) ידנית דרך UI/CLI, מגדירים אותה כקוד (קבצי `.tf`), שומרים ב-Git, ומריצים דרך pipeline. זה נותן לתשתית את אותם יתרונות שקוד רגיל מקבל: גרסאות, code review, שחזור, ואוטומציה.

## מושגי יסוד ב-Terraform

- **Provider** – פלאגין שמתקשר עם ספק ענן (AWS, Azure, GCP, Kubernetes).
- **Resource** – רכיב תשתית בודד (VM, bucket, database).
- **State** – קובץ שממפה בין הקוד למצב האמיתי בענן (`terraform.tfstate`).
- **Plan** – תצוגה מקדימה של שינויים לפני החלה בפועל.
- **Apply** – החלת השינויים בפועל.
- **Module** – יחידת קוד לשימוש חוזר (כמו function בתכנות).

## דוגמה בסיסית

```hcl
# main.tf
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  backend "s3" {
    bucket = "my-terraform-state"
    key    = "prod/terraform.tfstate"
    region = "us-east-1"
  }
}

provider "aws" {
  region = "us-east-1"
}

resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.micro"

  tags = {
    Name        = "web-server"
    Environment = var.environment
  }
}

variable "environment" {
  type    = string
  default = "staging"
}
```

## שילוב Terraform ב-Pipeline (GitHub Actions)

```yaml
name: Terraform CI/CD
on:
  pull_request:
    paths: ['infra/**']
  push:
    branches: [main]
    paths: ['infra/**']

jobs:
  terraform:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: infra
    steps:
      - uses: actions/checkout@v4

      - uses: hashicorp/setup-terraform@v3

      - name: Terraform Init
        run: terraform init

      - name: Terraform Format Check
        run: terraform fmt -check

      - name: Terraform Validate
        run: terraform validate

      - name: Terraform Plan
        id: plan
        run: terraform plan -no-color -out=tfplan
        continue-on-error: true

      - name: Comment Plan on PR
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: 'Terraform Plan output posted here'
            })

      - name: Terraform Apply
        if: github.ref == 'refs/heads/main' && github.event_name == 'push'
        run: terraform apply -auto-approve tfplan
```

## עקרון "Plan on PR, Apply on Merge"

הזרימה הנפוצה והבטוחה ביותר:
1. פותחים PR עם שינוי ב-Terraform.
2. ה-CI מריץ `terraform plan` ומפרסם את התוצאה כתגובה ב-PR – כל מי שסוקר את ה-PR רואה בדיוק אילו משאבים ישתנו/יימחקו/ייווצרו.
3. אחרי אישור ומיזוג ל-`main`, ה-CI מריץ `terraform apply` אוטומטית (או עם אישור ידני נוסף לפרודקשן).

## Remote State ו-State Locking

```hcl
terraform {
  backend "s3" {
    bucket         = "my-terraform-state"
    key            = "prod/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-locks"  # מונע ריצות מקבילות שדורסות state
    encrypt        = true
  }
}
```

**חשוב מאוד**: ה-state חייב להיות מרוחק (S3, Terraform Cloud, Azure Blob) ולא מקומי, כדי שכל הרצת CI תתחיל מאותו מצב אמת, ועם lock כדי למנוע התנגשויות בין הרצות מקבילות.

## Modules לשימוש חוזר

```hcl
module "vpc" {
  source = "./modules/vpc"
  cidr_block  = "10.0.0.0/16"
  environment = "production"
}

module "eks_cluster" {
  source          = "./modules/eks"
  vpc_id          = module.vpc.vpc_id
  cluster_name    = "myapp-prod"
}
```

## Workspaces – ניהול מספר סביבות

```bash
terraform workspace new staging
terraform workspace new production
terraform workspace select staging
terraform apply -var-file=staging.tfvars
```

## טיפים וטריקים

1. **תמיד `plan` לפני `apply`, ותמיד סקירה אנושית** – במיוחד לפני `apply` בפרודקשן, אל תבצע auto-apply עיוור.
2. **State מרוחק + Locking** – חובה בכל צוות (S3+DynamoDB, Terraform Cloud, Azure Storage).
3. **`terraform fmt` ו-`validate`** – הרץ תמיד ב-CI לפני plan, לתפוס שגיאות syntax מוקדם.
4. **`tflint` ו-`checkov`/`tfsec`** – כלי סטטי אנליזה שתופסים בעיות אבטחה בתשתית (כמו S3 bucket ציבורי) לפני apply.
5. **Least Privilege ל-CI** – ל-service account/role שמריץ Terraform ב-CI צריך להיות רק את ההרשאות המינימליות הנדרשות.
6. **Drift Detection** – הרץ `terraform plan` מתוזמן (nightly) כדי לזהות "drift" – שינויים שנעשו ידנית מחוץ ל-Terraform.
7. **Separate State per Environment** – state נפרד ל-staging ול-production מונע ש-`apply` בטעות ישפיע על הסביבה הלא נכונה.

## שאלות ראיון עבודה נפוצות

**ש: מה זה Terraform State ולמה חשוב לשמור אותו remote?**
ת: קובץ שממפה בין הגדרות הקוד למצב האמיתי בענן. Remote state (למשל S3) מאפשר לצוות שלם ולפייפליין לעבוד מול אותו מקור אמת יחיד, עם locking שמונע התנגשויות בין הרצות מקבילות.

**ש: מהי הזרימה המומלצת של Terraform בתוך CI/CD?**
ת: "Plan on PR, Apply on Merge" – מריצים `terraform plan` אוטומטית בכל PR ומציגים את התוצאה לסקירה, ומריצים `terraform apply` רק אחרי מיזוג ל-main, לרוב עם אישור ידני נוסף לפרודקשן.

**ש: מה ההבדל בין Terraform Module ל-Workspace?**
ת: Module הוא יחידת קוד לשימוש חוזר (כמו function) – אריזת קבוצת resources. Workspace הוא מנגנון לניהול מספר instances של אותה תצורה (למשל staging/production) עם state נפרד לכל אחד, תוך שימוש באותו קוד.

**ש: איך תמנע מצב שבו שני הרצות CI במקביל דורסות state אחת את השנייה?**
ת: באמצעות State Locking (למשל DynamoDB table עם S3 backend, או lock מובנה ב-Terraform Cloud) – מונע מריצת `apply` שנייה להתחיל לפני שהראשונה הסתיימה ושחררה את הנעילה.

**ש: איך משלבים סריקת אבטחה לתשתית (IaC Security) ב-pipeline?**
ת: הוספת שלב עם כלים כמו `tfsec` או `checkov` שסורקים את קבצי ה-`.tf` לפני `apply`, ותופסים בעיות כמו S3 buckets פתוחים לציבור, security groups רחבים מדי, או הצפנה חסרה.

**ש: מה הסיכון ב-auto-apply ללא אישור אנושי, ומתי בכל זאת מקובל?**
ת: הסיכון הוא מחיקה/שינוי בלתי צפוי של תשתית קריטית ללא ביקורת. מקובל ל-auto-apply בסביבות לא-קריטיות (dev/sandbox) או כשיש בדיקות אוטומטיות חזקות מאוד ו-blast radius מוגבל.

## קישורים חיצוניים

**YouTube:**
- [Terraform Course – TechWorld with Nana](https://courseflix.net/source/techworld-with-nana)
- [Terraform Full Course for Beginners](https://www.youtube.com/results?search_query=terraform+full+course+for+beginners)
- [Terraform CI/CD Pipeline with GitHub Actions](https://www.youtube.com/results?search_query=terraform+cicd+pipeline+github+actions)

**דוקומנטציה:**
- [Terraform Official Docs](https://developer.hashicorp.com/terraform/docs)
- [Terraform Best Practices](https://developer.hashicorp.com/terraform/language)
- [tfsec (Security Scanner)](https://aquasecurity.github.io/tfsec/)
- [Terraform GitHub Actions Integration](https://developer.hashicorp.com/terraform/tutorials/automation/github-actions)
