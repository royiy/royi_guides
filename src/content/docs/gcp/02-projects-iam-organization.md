---
title: "Projects, Organizations, Folders ו-IAM"
category: GCP
part: 2/10
---

## היררכיית המשאבים (Resource Hierarchy)

כל משאב ב-GCP — מכונה וירטואלית, Bucket, מסד נתונים — שייך למבנה היררכי שמטרתו לרכז ניהול הרשאות, מדיניות ותקציב. ההיררכיה מזכירה עץ תיקיות במערכת קבצים: מדיניות (Policy) שמוגדרת ברמה גבוהה **יורשת** אוטומטית לכל הרמות שמתחתיה.

- **Organization** — הצומת העליון ביותר, מייצג את החברה כולה. נוצר אוטומטית כאשר יש חשבון Google Workspace / Cloud Identity מקושר.
- **Folder** — קיבוץ לוגי של Projects (למשל לפי מחלקה, סביבה, או צוות). ניתן לקנן Folders בתוך Folders.
- **Project** — יחידת הבידוד הבסיסית ב-GCP. כל משאב חייב לשייך לפרויקט אחד. כולל Project ID (ייחודי גלובלית), Project Name ו-Project Number.
- **Resource** — המשאב עצמו (VM, Bucket, Dataset וכו').

### עקרונות מפתח

- **Policy Inheritance** — מדיניות IAM שמוגדרת ב-Organization חלה על כל ה-Folders וה-Projects מתחתיה, אלא אם נדרסת ברמה נמוכה יותר (אך אי אפשר "לצמצם" הרשאה שניתנה למעלה — ניתן רק להוסיף).
- **Project כיחידת חיוב ובידוד** — Billing, Quotas, ו-API activation מנוהלים ברמת הפרויקט.
- **Least Privilege** — עקרון אבטחה מרכזי: לתת לכל Identity רק את ההרשאות המינימליות הנדרשות לביצוע תפקידו.

## ארכיטקטורה של IAM

```
Organization: espresso-club.co.il
│
├── Folder: Production
│   ├── Project: prod-web-app
│   └── Project: prod-data-pipeline
│
├── Folder: Development
│   ├── Project: dev-web-app
│   └── Project: dev-sandbox
│
└── Folder: Shared-Services
    └── Project: shared-networking

IAM Policy Binding:
  Member (מי)  +  Role (מה מותר)  =  על Resource (איפה)

  user:dana@company.com   +  roles/editor       @  Project: prod-web-app
  group:devops@company.com +  roles/owner        @  Folder: Development
  serviceAccount:sa@...    +  roles/storage.admin @  Project: prod-data-pipeline
```

| רכיב | תיאור |
|---|---|
| **Member (Principal)** | מי מבצע את הפעולה — משתמש, קבוצה, Service Account, או Domain |
| **Role** | אוסף הרשאות (Permissions) — לדוגמה `roles/compute.viewer` |
| **Permission** | פעולה בודדת בפורמט `service.resource.verb` (למשל `compute.instances.list`) |
| **Policy** | קישור בין Member ל-Role על Resource מסוים (IAM Policy Binding) |
| **Condition** | תנאי אופציונלי המגביל מתי ה-Binding תקף (IP, זמן, Tag) |

### שלושת סוגי ה-Roles

| סוג Role | תיאור | דוגמה |
|---|---|---|
| **Basic (Primitive)** | הרשאות רחבות מדורות ה-GCP הראשונות — Owner/Editor/Viewer | `roles/owner`, `roles/editor`, `roles/viewer` |
| **Predefined** | תפרים מוכנים לכל שירות, מדויקים יותר | `roles/compute.instanceAdmin.v1`, `roles/storage.objectViewer` |
| **Custom** | Role מותאם אישית שאתה מגדיר בעצמך עם רשימת Permissions ספציפית | `roles/customComputeOperator` |

## עבודה עם Projects ו-IAM דרך gcloud

### ניהול Projects

```bash
# יצירת פרויקט חדש
gcloud projects create espresso-prod-2026 --name="Espresso Prod" \
  --organization=123456789012

# רשימת פרויקטים
gcloud projects list

# קישור פרויקט לחשבון חיוב (Billing Account)
gcloud billing projects link espresso-prod-2026 \
  --billing-account=012345-6789AB-CDEF01

# מחיקת פרויקט (יש חלון של 30 יום לשחזור)
gcloud projects delete espresso-prod-2026
```

### הענקת והסרת הרשאות IAM

```bash
# הענקת Role למשתמש ברמת הפרויקט
gcloud projects add-iam-policy-binding espresso-prod-2026 \
  --member="user:dana@espresso-club.co.il" \
  --role="roles/compute.admin"

# הענקת Role לקבוצה
gcloud projects add-iam-policy-binding espresso-prod-2026 \
  --member="group:devops-team@espresso-club.co.il" \
  --role="roles/editor"

# הסרת הרשאה
gcloud projects remove-iam-policy-binding espresso-prod-2026 \
  --member="user:dana@espresso-club.co.il" \
  --role="roles/compute.admin"

# צפייה במדיניות ה-IAM המלאה של פרויקט
gcloud projects get-iam-policy espresso-prod-2026 --format=json
```

### Custom Role

```bash
gcloud iam roles create customStorageOperator \
  --project=espresso-prod-2026 \
  --title="Custom Storage Operator" \
  --description="יכול לקרוא ולכתוב ל-Storage, אך לא למחוק Buckets" \
  --permissions=storage.objects.get,storage.objects.create,storage.objects.list \
  --stage=GA
```

### Service Accounts

Service Account (SA) הוא "משתמש" מיוחד המיועד לתהליכים ואפליקציות ולא לבני אדם. VM, פונקציה ב-Cloud Functions או Pipeline ב-CI/CD משתמשים ב-SA כדי לבצע פעולות מול GCP APIs.

```bash
# יצירת Service Account
gcloud iam service-accounts create ci-cd-deployer \
  --display-name="CI/CD Deployer SA"

# הענקת Role ל-Service Account
gcloud projects add-iam-policy-binding espresso-prod-2026 \
  --member="serviceAccount:ci-cd-deployer@espresso-prod-2026.iam.gserviceaccount.com" \
  --role="roles/run.admin"

# יצירת מפתח JSON (לשימוש מחוץ ל-GCP, כמו GitHub Actions)
gcloud iam service-accounts keys create key.json \
  --iam-account=ci-cd-deployer@espresso-prod-2026.iam.gserviceaccount.com

# רשימת Service Accounts בפרויקט
gcloud iam service-accounts list
```

### דוגמת Terraform ל-IAM Binding

```hcl
resource "google_project_iam_member" "devops_editor" {
  project = "espresso-prod-2026"
  role    = "roles/editor"
  member  = "group:devops-team@espresso-club.co.il"
}

resource "google_service_account" "ci_cd" {
  account_id   = "ci-cd-deployer"
  display_name = "CI/CD Deployer SA"
}

resource "google_project_iam_member" "ci_cd_run_admin" {
  project = "espresso-prod-2026"
  role    = "roles/run.admin"
  member  = "serviceAccount:${google_service_account.ci_cd.email}"
}
```

## טיפים וטריקים

1. **הימנעו מ-Basic Roles (Owner/Editor/Viewer) בפרודקשן** — הם רחבים מדי; העדיפו Predefined או Custom Roles לפי עיקרון Least Privilege.
2. **השתמשו ב-Groups ולא במשתמשים בודדים** להענקת הרשאות — קל יותר לתחזק ולבצע Onboarding/Offboarding.
3. **אל תיצרו מפתחות JSON ל-Service Accounts כשלא חייבים** — העדיפו Workload Identity Federation לחיבור מ-CI/CD חיצוני (GitHub Actions, GitLab) בלי מפתחות סטטיים כלל.
4. **בדקו הרשאות אפקטיביות** עם `gcloud projects get-iam-policy` או כלי ה-Policy Analyzer ב-Console כדי לזהות הרשאות מיותרות.
5. **IAM Conditions** מאפשרים הגבלת הרשאה לפי זמן או תנאי — שימושי למתן גישה זמנית (Just-in-Time Access):
   ```bash
   gcloud projects add-iam-policy-binding espresso-prod-2026 \
     --member="user:temp-contractor@espresso-club.co.il" \
     --role="roles/viewer" \
     --condition='expression=request.time < timestamp("2026-09-01T00:00:00Z"),title=temp-access'
   ```

## שאלות נפוצות לתרגול עצמי

- מה ההבדל בין Organization, Folder ו-Project, ואיך זה משפיע על הורשת מדיניות?
- מה ההבדל בין Basic, Predefined ו-Custom Roles?
- מדוע Service Account נחשב "משתמש" ולא רק הגדרת הרשאה?
- מהי Workload Identity Federation ולמה עדיף להשתמש בה על פני מפתחות JSON?

## קישורים חיצוניים

**תיעוד רשמי:**
- Resource Hierarchy: https://cloud.google.com/resource-manager/docs/cloud-platform-resource-hierarchy
- IAM Overview: https://cloud.google.com/iam/docs/overview
- Service Accounts: https://cloud.google.com/iam/docs/service-account-overview

**סרטוני YouTube מומלצים:**
- Google Cloud Tech - IAM Fundamentals: https://www.youtube.com/c/googlecloudtech
- freeCodeCamp - GCP IAM Deep Dive: https://www.youtube.com/watch?v=fZOz13joN0k
- TechWorld with Nana - Cloud IAM Explained: https://www.youtube.com/c/TechWorldwithNana

---
⬅️ המדריך הבא: [03-compute-engine.md](/gcp/03-compute-engine/) — Compute Engine, Machine Types ו-Autoscaling
