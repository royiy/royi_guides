---
title: "Cloud Storage, Storage Classes ו-Access Control"
category: GCP
part: 5/10
---

## מה זה Cloud Storage?

Cloud Storage הוא שירות אחסון אובייקטים (Object Storage) של GCP, מקביל ל-S3 ב-AWS. הוא מיועד לאחסון קבצים בלתי מובנים בכל היקף — מגיבויים, קבצי מדיה, Data Lakes ועד אחסון סטטי לאתרים. בניגוד ל-Persistent Disk (Block Storage המחובר ל-VM), Cloud Storage הוא שירות **גלובלי ומבוזר**, נגיש דרך HTTP(S) API מכל מקום, ללא הגבלת קיבולת.

היחידה הבסיסית היא ה-**Bucket** — מיכל שמאחסן **Objects** (הקבצים עצמם). כל Object מזוהה על ידי מפתח (Key) ומכיל את הנתונים עצמם, Metadata, ו-Generation Number (לניהול גרסאות).

### עקרונות מפתח

- **Global Namespace** — שם ה-Bucket חייב להיות ייחודי גלובלית בכל GCP, לא רק בפרויקט שלכם.
- **Consistency** — Cloud Storage מספק Strong Consistency לכל הפעולות (קריאה אחרי כתיבה, רשימת אובייקטים) — לא Eventual Consistency.
- **Object Versioning** — ניתן להפעיל שמירת גרסאות היסטוריות של אובייקט בעת דריסה/מחיקה.
- **Location Types** — Bucket יכול להיות Regional (Zone בודד), Dual-Region (שני אזורים ספציפיים), או Multi-Region (יבשת שלמה).

## Storage Classes

| מחלקה | זמינות | עלות אחסון | עלות שליפה | שימוש מומלץ |
|---|---|---|---|---|
| **Standard** | גבוהה ביותר | הגבוהה ביותר | ללא עלות נוספת | גישה תכופה, אתרים, אפליקציות פעילות |
| **Nearline** | גבוהה | נמוכה יותר | קיימת | גישה פחות מפעם בחודש - גיבויים |
| **Coldline** | גבוהה | נמוכה מאוד | גבוהה יותר | גישה נדירה - פחות מפעם ברבעון |
| **Archive** | גבוהה | הנמוכה ביותר | הגבוהה ביותר | ארכיון לטווח ארוך - פעם בשנה או פחות |

לכל מחלקה יש **Minimum Storage Duration** (משך אחסון מינימלי לחיוב) — Nearline: 30 יום, Coldline: 90 יום, Archive: 365 יום. מחיקה מוקדמת עדיין תחויב עד תום התקופה.

## ארכיטקטורה ומודל גישה

```
   Bucket: espresso-prod-assets  (Location: EU multi-region)
   +--------------------------------------------------------+
   |                                                           |
   |  Object: logo.png       [Standard]     [Public Read]      |
   |  Object: backups/db.sql [Coldline]     [Private]          |
   |  Object: reports/q1.csv [Nearline]     [Signed URL only]  |
   |                                                           |
   +--------------------------------------------------------+
           |                          |
   Uniform Bucket-Level      Lifecycle Rules
   Access (IAM only)          (מעבר אוטומטי בין Classes / מחיקה)
```

| רכיב | תיאור |
|---|---|
| **Bucket** | מיכל האחסון, מוגדר ב-Location ו-Storage Class ברירת מחדל |
| **Object** | קובץ בודד + Metadata, מזוהה במפתח (Key) |
| **Access Control** | IAM (ברמת Bucket, מומלץ) או ACL (ברמת Object, Legacy) |
| **Lifecycle Rule** | מעבר אוטומטי בין Storage Classes או מחיקה לפי תנאים (גיל, גרסה) |
| **Signed URL** | קישור זמני עם הרשאה חתומה לגישה זמנית לאובייקט פרטי |

## פקודות gsutil / gcloud storage

### ניהול Buckets בסיסי

```bash
# יצירת Bucket (הפקודה המודרנית - gcloud storage)
gcloud storage buckets create gs://espresso-prod-assets \
  --location=EU \
  --default-storage-class=STANDARD \
  --uniform-bucket-level-access

# רשימת Buckets
gcloud storage buckets list

# העלאת קובץ
gcloud storage cp ./logo.png gs://espresso-prod-assets/logo.png

# העלאה רקורסיבית של תיקייה
gcloud storage cp -r ./website-assets gs://espresso-prod-assets/website/

# הורדת קובץ
gcloud storage cp gs://espresso-prod-assets/logo.png ./logo.png

# רשימת אובייקטים ב-Bucket
gcloud storage ls gs://espresso-prod-assets/

# מחיקת אובייקט
gcloud storage rm gs://espresso-prod-assets/old-file.png

# סנכרון תיקייה (כמו rsync)
gcloud storage rsync ./local-dir gs://espresso-prod-assets/remote-dir --recursive
```

### הגדרת Access Control

```bash
# מומלץ: Uniform Bucket-Level Access עם IAM
gcloud storage buckets add-iam-policy-binding gs://espresso-prod-assets \
  --member="allUsers" \
  --role="roles/storage.objectViewer"

# הענקת גישת כתיבה לחשבון שירות ספציפי
gcloud storage buckets add-iam-policy-binding gs://espresso-prod-assets \
  --member="serviceAccount:uploader@project.iam.gserviceaccount.com" \
  --role="roles/storage.objectCreator"

# יצירת Signed URL (תוקף שעה, לגישה פרטית זמנית)
gcloud storage sign-url gs://espresso-prod-assets/reports/q1.csv \
  --private-key-file=key.json \
  --duration=1h
```

### Lifecycle Rules

הגדרת מדיניות מעבר אוטומטי בין Storage Classes ומחיקה, בקובץ JSON:

```json
{
  "rule": [
    {
      "action": {"type": "SetStorageClass", "storageClass": "NEARLINE"},
      "condition": {"age": 30, "matchesStorageClass": ["STANDARD"]}
    },
    {
      "action": {"type": "SetStorageClass", "storageClass": "COLDLINE"},
      "condition": {"age": 90, "matchesStorageClass": ["NEARLINE"]}
    },
    {
      "action": {"type": "Delete"},
      "condition": {"age": 365, "matchesStorageClass": ["COLDLINE"]}
    }
  ]
}
```

```bash
gcloud storage buckets update gs://espresso-prod-assets \
  --lifecycle-file=lifecycle.json
```

### דוגמת Terraform

```hcl
resource "google_storage_bucket" "prod_assets" {
  name                        = "espresso-prod-assets"
  location                    = "EU"
  storage_class               = "STANDARD"
  uniform_bucket_level_access = true

  versioning {
    enabled = true
  }

  lifecycle_rule {
    condition {
      age                = 30
      matches_storage_class = ["STANDARD"]
    }
    action {
      type          = "SetStorageClass"
      storage_class = "NEARLINE"
    }
  }

  lifecycle_rule {
    condition {
      age = 365
    }
    action {
      type = "Delete"
    }
  }
}

resource "google_storage_bucket_iam_member" "public_read" {
  bucket = google_storage_bucket.prod_assets.name
  role   = "roles/storage.objectViewer"
  member = "allUsers"
}
```

## טיפים וטריקים

1. **תמיד הפעילו Uniform Bucket-Level Access** — מנהל הרשאות דרך IAM בלבד, ומונע בלבול/חורי אבטחה שנוצרים מ-ACLs ברמת Object.
2. **אל תעשו Bucket ציבורי (`allUsers`) בטעות** — בדקו תמיד עם Security Health Analytics ב-Security Command Center שאין Buckets חשופים שלא במתכוון.
3. **השתמשו ב-`gcloud storage rsync`** לגיבוי אוטומטי או Deploy של אתרים סטטיים במקום להעלות קובץ-קובץ.
4. **בחרו Location נכון** — Regional זול יותר ומהיר יותר אם כל הצריכה מקומית; Multi-Region עולה יותר אך מספק זמינות וקריאה גלובלית מהירה יותר.
5. **Object Lifecycle Management חוסך כסף אוטומטית** — הגדירו מדיניות ברירת מחדל על כל Bucket חדש בפרויקט כדי למנוע "שכחת נתונים ישנים" ב-Standard היקר.

## שאלות נפוצות לתרגול עצמי

- מה ההבדל בין Regional, Dual-Region ו-Multi-Region Buckets?
- מהו ה-Minimum Storage Duration ואיך הוא משפיע על עלות מחיקה מוקדמת?
- מדוע מומלץ Uniform Bucket-Level Access על פני ACLs ברמת Object?
- כיצד Signed URL מאפשר גישה זמנית מאובטחת ללא הפיכת Bucket לציבורי?

## קישורים חיצוניים

**תיעוד רשמי:**
- Cloud Storage Documentation: https://cloud.google.com/storage/docs
- Storage Classes: https://cloud.google.com/storage/docs/storage-classes
- Lifecycle Management: https://cloud.google.com/storage/docs/lifecycle

**סרטוני YouTube מומלצים:**
- Google Cloud Tech - Cloud Storage 101: https://www.youtube.com/c/googlecloudtech
- freeCodeCamp - GCP Storage Deep Dive: https://www.youtube.com/watch?v=fZOz13joN0k
- TechWorld with Nana - Object Storage Explained: https://www.youtube.com/c/TechWorldwithNana

---
⬅️ המדריך הבא: [06-gke-kubernetes.md](/gcp/06-gke-kubernetes/) — Google Kubernetes Engine, Autopilot ו-Standard
