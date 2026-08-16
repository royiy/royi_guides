# מדריך 9: CI/CD עם Terraform

## למה אוטומציה קריטית?

הרצת Terraform ידנית מהמחשב האישי (`terraform apply` בלוקאל) היא אנטי-פטרן בסביבות פרודקשן:
- אין audit trail ברור של מי הריץ מה ומתי
- credentials רגישים על מחשבים אישיים
- אין code review חובה לפני שינויים בתשתית
- קל לשכוח `plan` לפני `apply`

הפתרון: **GitOps** - כל שינוי תשתית עובר דרך Pull Request, מקבל `plan` אוטומטי לביקורת, ורק לאחר merge/אישור מבוצע `apply` דרך CI/CD.

---

## תבנית GitOps טיפוסית

```
1. מפתח פותח PR עם שינוי ב-.tf files
2. CI מריץ אוטומטית:
   - terraform fmt -check
   - terraform validate
   - tfsec / checkov (סריקת אבטחה)
   - terraform plan → מצורף כתגובה ל-PR
3. Code review אנושי + אישור (approval)
4. Merge ל-main
5. CI מריץ terraform apply אוטומטית (או עם gate ידני לפרודקשן)
```

---

## דוגמה מלאה - GitHub Actions

`.github/workflows/terraform.yml`:

```yaml
name: 'Terraform CI/CD'

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

permissions:
  contents: read
  pull-requests: write
  id-token: write   # ל-OIDC authentication

jobs:
  terraform:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./infra

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: "1.9.0"

      # אימות מול AWS ללא credentials מאוחסנים - OIDC
      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::123456789012:role/github-actions-terraform
          aws-region: eu-west-1

      - name: Terraform Format Check
        run: terraform fmt -check -recursive

      - name: Terraform Init
        run: terraform init -input=false

      - name: Terraform Validate
        run: terraform validate

      - name: Security Scan (tfsec)
        uses: aquasecurity/tfsec-action@v1.0.3

      - name: Terraform Plan
        id: plan
        run: terraform plan -input=false -no-color -out=tfplan
        continue-on-error: true

      - name: Comment PR with Plan
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v7
        with:
          script: |
            const output = `#### Terraform Plan 📖
            \`\`\`
            ${{ steps.plan.outputs.stdout }}
            \`\`\``;
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: output
            });

      - name: Terraform Apply
        if: github.ref == 'refs/heads/main' && github.event_name == 'push'
        run: terraform apply -auto-approve -input=false tfplan
```

> **טיפ אבטחה קריטי:** שימו לב לשימוש ב-**OIDC** (`aws-actions/configure-aws-credentials` עם `role-to-assume`) במקום אחסון `AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY` כ-secrets. OIDC מאפשר ל-GitHub Actions "להתחזות" ל-IAM Role זמנית, בלי סודות ארוכי טווח בכלל - הסטנדרט המומלץ כיום.

---

## דוגמה - GitLab CI

`.gitlab-ci.yml`:

```yaml
stages:
  - validate
  - plan
  - apply

variables:
  TF_ROOT: ${CI_PROJECT_DIR}/infra
  TF_VERSION: "1.9.0"

before_script:
  - cd ${TF_ROOT}
  - terraform init -input=false

validate:
  stage: validate
  script:
    - terraform fmt -check -recursive
    - terraform validate

plan:
  stage: plan
  script:
    - terraform plan -out=tfplan
  artifacts:
    paths:
      - ${TF_ROOT}/tfplan
    expire_in: 1 hour
  only:
    - merge_requests

apply:
  stage: apply
  script:
    - terraform apply -auto-approve tfplan
  dependencies:
    - plan
  when: manual   # דורש אישור ידני בפרודקשן!
  only:
    - main
```

> **טיפ:** `when: manual` על שלב ה-apply לפרודקשן הוא best practice נפוץ - נותן "gate" אנושי אחרון גם כשהכל אוטומטי.

---

## אסטרטגיית סביבות ב-Pipeline

```yaml
# דוגמה עם matrix לכמה סביבות
apply-dev:
  script:
    - terraform apply -var-file="envs/dev.tfvars" -auto-approve
  only:
    - develop

apply-prod:
  script:
    - terraform apply -var-file="envs/prod.tfvars" -auto-approve
  when: manual
  only:
    - main
```

---

## HCP Terraform (Terraform Cloud) - אלטרנטיבה מנוהלת

במקום לבנות CI/CD מאפס, ניתן להשתמש ב-HCP Terraform - שירות מנוהל של HashiCorp הכולל:
- ריצות `plan`/`apply` מנוהלות עם UI
- ניהול state מובנה עם locking
- Sentinel Policy as Code
- אינטגרציה ישירה עם GitHub/GitLab (VCS-driven workflow)
- ניהול משתנים וסודות מוצפנים

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

---

## Drift Detection אוטומטי ב-CI

הריצו `plan` מתוזמן (cron) על main כדי לזהות drift שקרה מחוץ ל-Terraform:

```yaml
# GitHub Actions - scheduled drift check
on:
  schedule:
    - cron: '0 8 * * *'   # כל בוקר בשעה 8

jobs:
  drift-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: hashicorp/setup-terraform@v3
      - run: terraform init
      - run: terraform plan -detailed-exitcode
        # exit code 0 = אין שינויים, 2 = יש drift, 1 = שגיאה
```

`-detailed-exitcode` מחזיר קוד יציאה שונה בהתאם למצב - שימושי מאוד להתראות אוטומטיות ב-Slack/PagerDuty כשמתגלה drift.

---

## Terragrunt - שכבת אוטומציה נוספת (אופציונלי)

עבור ארגונים גדולים עם הרבה קונפיגורציות דומות, [Terragrunt](https://terragrunt.gruntwork.io/) הוא wrapper פופולרי שמוסיף DRY לניהול backend/providers/dependencies בין קונפיגורציות מרובות. שווה להכיר את הקיום שלו לראיונות ברמה בכירה, גם אם לא חובה להשתמש בו.

---

## שאלות ראיון נפוצות

**1. למה עדיף להריץ Terraform דרך CI/CD ולא ידנית?**
Audit trail, code review חובה, אבטחת credentials (OIDC במקום secrets סטטיים), עקביות בין ריצות, ומניעת "זה עבד אצלי במחשב".

**2. מה זה OIDC ולמה הוא עדיף על שמירת AWS keys ב-CI secrets?**
OpenID Connect מאפשר ל-CI (למשל GitHub Actions) לקבל טוקן זמני ולהתחזות ל-IAM Role בלי לאחסן credentials ארוכי טווח בכלל - מפחית משמעותית את משטח התקיפה.

**3. איך הייתם בונים gate אישור ידני לפני apply בפרודקשן?**
עם `when: manual` (GitLab), `environment protection rules` (GitHub Actions), או approval policies מובנות ב-HCP Terraform.

**4. מה זה `-detailed-exitcode` ולמה הוא שימושי ב-CI?**
דגל שגורם ל-`terraform plan` להחזיר קוד יציאה שונה בהתאם למצב (0=אין שינוי, 2=יש שינוי, 1=שגיאה) - מאפשר לוגיקת CI לזהות ולהתריע על drift אוטומטית.

**5. מה ההבדל בין lint/validate בשלב ה-PR לבין apply בשלב ה-merge?**
`validate`/`fmt`/סריקות אבטחה רצים על כל PR כדי לתפוס בעיות מוקדם וזול; `apply` רץ רק לאחר merge (או עם gate ידני) כדי להבטיח שרק קוד שעבר review משפיע בפועל על תשתית אמיתית.

---

## קישורים חיצוניים

### תיעוד רשמי
- [HCP Terraform - Overview](https://developer.hashicorp.com/terraform/cloud-docs)
- [setup-terraform GitHub Action](https://github.com/hashicorp/setup-terraform)
- [Terraform Tutorials - Automation](https://developer.hashicorp.com/terraform/tutorials)

### סרטוני YouTube
- [Terraform Tutorial Full Course for Beginners (2026)](https://www.youtube.com/watch?v=Bzccj0jjRBM)
- [TechWorld with Nana - Terraform Course Overview](https://www.youtube.com/watch?v=m3cKkYXl-8o)

---

**במדריך הבא (והאחרון):** שאלות ראיון עבודה מרוכזות + טיפים וטריקים מתקדמים.
