---
title: "מבוא ל-Google Cloud Platform, מודל שירותים ו-gcloud CLI"
category: GCP
part: 1/10
---

## מה זה Google Cloud Platform?

Google Cloud Platform (GCP) הוא פלטפורמת הענן הציבורי של גוגל, המספקת תשתיות מחשוב, אחסון, רשת, בינה מלאכותית וכלי פיתוח כשירות מקוון (On-Demand). GCP נבנה על אותה תשתית פיזית שגוגל משתמשת בה עבור השירותים הפנימיים שלה — כמו Search, Gmail ו-YouTube — כולל רשת הסיבים הפרטית העצומה שמחברת בין מרכזי הנתונים ברחבי העולם.

בניגוד למודל המסורתי של רכישת שרתים פיזיים (CapEx), GCP פועל במודל **Pay-as-you-go** — משלמים רק על מה שצורכים, בפועל, לרוב לפי שנייה או דקה. זה מאפשר לארגונים להימנע מהשקעה מראש בתשתית ולהתאים את הצריכה בזמן אמת לביקוש.

GCP מתחרה ישירות מול AWS ו-Azure, ומתבלט בעיקר בשלושה תחומים: **Data Analytics ו-Big Data** (בזכות BigQuery), **Kubernetes ו-Containers** (גוגל היא הממציאה של Kubernetes ומפעילה את GKE), ו-**Machine Learning/AI** (Vertex AI, TPUs ייעודיים).

### עקרונות מפתח

- **Global Infrastructure** — רשת עולמית של Regions ו-Zones המחוברת ברשת סיבים אופטית פרטית של גוגל, ולא באינטרנט הציבורי.
- **Resource Hierarchy** — כל משאב ב-GCP שייך למבנה היררכי (Organization → Folder → Project → Resource) המשמש לניהול הרשאות ומדיניות.
- **APIs-first** — כל שירות ב-GCP חשוף כ-REST API; ה-Console וה-CLI הם למעשה "מעטפות" סביב אותם APIs.
- **Shared Responsibility Model** — גוגל אחראית על אבטחת התשתית הפיזית (Security **of** the Cloud), הלקוח אחראי על אבטחת הנתונים, ה-IAM וההגדרות (Security **in** the Cloud).

## מודל השירותים: IaaS, PaaS, SaaS

```
+--------------------------------------------------------------+
|                     On-Premises                              |
|  Applications | Data | Runtime | Middleware | O/S | Virt |    |
|  Servers | Storage | Networking  --> אתה מנהל הכל             |
+--------------------------------------------------------------+

+--------------------------------------------------------------+
|                IaaS  (Compute Engine)                         |
|  Applications | Data | Runtime | Middleware  --> אתה           |
|  O/S | Virtualization | Servers | Storage | Networking --> GCP |
+--------------------------------------------------------------+

+--------------------------------------------------------------+
|                PaaS  (App Engine / Cloud Run / GKE Autopilot) |
|  Applications | Data  --> אתה                                 |
|  Runtime | Middleware | O/S | Virt | Servers | Storage --> GCP|
+--------------------------------------------------------------+

+--------------------------------------------------------------+
|                SaaS  (Google Workspace, BigQuery)              |
|  הכל מנוהל ע"י גוגל, אתה רק צורך את השירות                     |
+--------------------------------------------------------------+
```

| מודל | דוגמאות ב-GCP | מה אתה מנהל |
|---|---|---|
| **IaaS** | Compute Engine, Cloud Storage, VPC | מערכת הפעלה, אפליקציה, תצורה |
| **PaaS** | App Engine, Cloud Run, Cloud Functions, GKE Autopilot | קוד ולוגיקה עסקית בלבד |
| **SaaS** | BigQuery, Google Workspace | כלום — רק צריכת השירות |

## Regions, Zones ו-Global Infrastructure

GCP מחלק את התשתית הפיזית שלו להיררכיה גיאוגרפית:

- **Region** — אזור גיאוגרפי עצמאי (למשל `us-central1`, `europe-west3`, `me-west1` — תל אביב). כל Region מכיל לפחות 3 Zones.
- **Zone** — מרכז נתונים בודד (Data Center) בתוך Region, לדוגמה `europe-west3-a`. משאבים "Zonal" (כמו VM בודד) חיים בתוך Zone אחד.
- **Multi-Region** — היקף רחב עוד יותר, המשתרע על פני מספר Regions (משמש בעיקר לאחסון כמו Cloud Storage).

```
Multi-Region (EU)
 └── Region: europe-west3 (פרנקפורט)
       ├── Zone: europe-west3-a
       ├── Zone: europe-west3-b
       └── Zone: europe-west3-c
 └── Region: me-west1 (תל אביב)
       ├── Zone: me-west1-a
       ├── Zone: me-west1-b
       └── Zone: me-west1-c
```

**כלל אצבע לתכנון High Availability**: פרוס משאבים על פני מספר Zones באותו Region (להגנה מפני נפילת Zone בודד), ושקול Multi-Region עבור Disaster Recovery בין אזורים גיאוגרפיים שונים.

## gcloud CLI ו-Console

### התקנת gcloud CLI

```bash
# Linux/macOS - הורדה והתקנה
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
gcloud init
```

```powershell
# Windows - הורדת המתקין
# https://cloud.google.com/sdk/docs/install
gcloud init
```

### אימות והגדרה ראשונית

```bash
# התחברות עם חשבון גוגל
gcloud auth login

# הגדרת פרויקט ברירת מחדל
gcloud config set project my-project-id

# הגדרת Region/Zone ברירת מחדל
gcloud config set compute/region europe-west3
gcloud config set compute/zone europe-west3-a

# צפייה בהגדרות הנוכחיות
gcloud config list

# רשימת חשבונות מחוברים
gcloud auth list
```

### פקודות בסיסיות לתפעול יומיומי

```bash
# רשימת פרויקטים זמינים
gcloud projects list

# רשימת שירותים (APIs) פעילים בפרויקט
gcloud services list --enabled

# הפעלת API ספציפי
gcloud services enable compute.googleapis.com

# רשימת מכונות VM בפרויקט
gcloud compute instances list

# מידע גרסה ורכיבים מותקנים
gcloud version
gcloud components update
```

### Cloud Shell

לצד ה-CLI המקומי, גוגל מספקת **Cloud Shell** — מכונה וירטואלית זמנית עם 5GB אחסון קבוע, שכוללת gcloud, kubectl, Terraform ועוד מותקנים מראש, נגישה ישירות מהדפדפן דרך ה-Console. שימושי מאוד לעבודה מהירה בלי להתקין דבר מקומית.

## טיפים וטריקים

1. **השתמשו ב-`--format`** כדי לקבל פלט מובנה (JSON/YAML/טבלה) לצורך סקריפטים:
   ```bash
   gcloud compute instances list --format="table(name,zone,status)"
   gcloud compute instances describe my-vm --format=json
   ```
2. **`gcloud config configurations`** מאפשר לנהל כמה "פרופילים" (פרויקטים/חשבונות שונים) במקביל:
   ```bash
   gcloud config configurations create work-project
   gcloud config configurations activate work-project
   ```
3. **תמיד בדקו איזה Project פעיל** לפני הרצת פקודות הרסניות — טעות פרויקט היא אחת הטעויות הנפוצות ביותר:
   ```bash
   gcloud config get-value project
   ```
4. **`--dry-run` לא קיים בכל הפקודות**, אך ניתן להשתמש ב-`gcloud ... --help` כדי לבדוק פרמטרים לפני הרצה בסביבת פרודקשן.
5. **Cloud Console Mobile App** קיים לניטור מהיר של משאבים וקבלת התראות בזמן אמת מהנייד.

## שאלות נפוצות לתרגול עצמי

- מה ההבדל בין Region ל-Zone, ואיך זה משפיע על תכנון High Availability?
- מהם שלושת מודלי השירות (IaaS/PaaS/SaaS) ואיפה כל שירות ב-GCP נכנס?
- מהו ה-Shared Responsibility Model וכיצד הוא משתנה בין IaaS ל-SaaS?
- אילו פקודות gcloud תשתמשו כדי לבדוק את הפרויקט וההגדרות הפעילות כרגע?

## קישורים חיצוניים

**תיעוד רשמי:**
- Google Cloud Documentation Overview: https://cloud.google.com/docs/overview
- gcloud CLI Reference: https://cloud.google.com/sdk/gcloud/reference
- Google Cloud Regions and Zones: https://cloud.google.com/compute/docs/regions-zones

**סרטוני YouTube מומלצים:**
- ערוץ Google Cloud Tech (סדרת "GCP Essentials"): https://www.youtube.com/c/googlecloudtech
- Google Cloud Platform Full Course - freeCodeCamp: https://www.youtube.com/watch?v=fZOz13joN0k
- TechWorld with Nana - GCP Basics: https://www.youtube.com/c/TechWorldwithNana

---
⬅️ המדריך הבא: [02-projects-iam-organization.md](/gcp/02-projects-iam-organization/) — Projects, Organizations, Folders ו-IAM
