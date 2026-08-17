---
title: "Cloud Functions ו-Cloud Run - סקירת Serverless ב-GCP"
category: GCP
part: 7/10
---

## מה זה Serverless ב-GCP?

Serverless הוא מודל שבו הפיתוח מתמקד רק בקוד עצמו — הענן מנהל את כל שכבת התשתית, ה-Scaling (כולל Scale-to-Zero), ה-Patching והזמינות. GCP מציע שני שירותי Serverless מרכזיים המשלימים זה את זה: **Cloud Functions** ו-**Cloud Run**.

- **Cloud Functions** — Function as a Service (FaaS). מריצים פונקציה בודדת (Event-driven) בתגובה לטריגר — HTTP Request, הודעת Pub/Sub, קובץ חדש ב-Cloud Storage וכו'.
- **Cloud Run** — Container as a Service. מריצים כל Container (Docker Image) שמאזין ל-HTTP, ללא צורך בניהול Cluster כלל. גמיש הרבה יותר מ-Cloud Functions כי אין הגבלה לשפת תכנות בודדת או ל-Runtime מסוים.

### עקרונות מפתח

- **Scale-to-Zero** — כאשר אין בקשות נכנסות, מספר המופעים יורד ל-0 ואין חיוב כלל (למעט Cloud Run עם Minimum Instances מוגדר).
- **Event-Driven Architecture** — הקוד מגיב לאירועים (Events) במקום לרוץ ברצף מתמיד — מתאים לעיבוד אסינכרוני, Webhooks, ETL קליל.
- **Concurrency** — Cloud Run יכול לטפל בכמה בקשות במקביל באותו Container Instance (עד 1000 בקשות), בעוד Cloud Functions (Gen 1) מטפל בבקשה אחת בכל פעם למופע.
- **Cold Start** — זמן האתחול הראשוני של מופע חדש; ניתן לצמצם עם Minimum Instances.

## ארכיטקטורה - Event-Driven

```
                     +--------------------+
   HTTP Request ---->|                    |
                      |   Cloud Run /      |----> Response
   Pub/Sub Message -->|   Cloud Functions  |
                      |                    |----> כתיבה ל-Firestore/BigQuery
   Storage Event ----->|                    |
                      +--------------------+
                              |
                       Auto Scale 0 -> N
                       (לפי עומס נכנס בפועל)
```

| רכיב | תיאור |
|---|---|
| **Trigger** | האירוע שמפעיל את הפונקציה/השירות (HTTP, Pub/Sub, Storage, Firestore, Scheduler) |
| **Revision** | (Cloud Run) גרסה מוצפנת ובלתי-משתנה של פריסה; ניתן לפצל תעבורה בין Revisions |
| **Container Image** | (Cloud Run) תמונת Docker המכילה את האפליקציה |
| **Source Code** | (Cloud Functions) קוד המקור שנפרס ישירות, ללא Dockerfile |
| **Eventarc** | שירות אחיד לניתוב אירועים ממקורות שונים אל Cloud Run/Functions |

## Cloud Functions

### פריסת פונקציה מבוססת HTTP (Python)

```python
# main.py
import functions_framework

@functions_framework.http
def hello_espresso(request):
    request_json = request.get_json(silent=True)
    name = request_json.get("name", "World") if request_json else "World"
    return f"Hello, {name}! Brewed with GCP Cloud Functions."
```

```bash
gcloud functions deploy hello-espresso \
  --gen2 \
  --runtime=python312 \
  --region=europe-west3 \
  --source=. \
  --entry-point=hello_espresso \
  --trigger-http \
  --allow-unauthenticated
```

### פונקציה מבוססת אירוע - Cloud Storage Trigger

```python
import functions_framework

@functions_framework.cloud_event
def process_new_file(cloud_event):
    data = cloud_event.data
    bucket = data["bucket"]
    file_name = data["name"]
    print(f"קובץ חדש התקבל: {file_name} ב-Bucket {bucket}")
    # לוגיקת עיבוד - resize תמונה, סריקת וירוסים, וכו'
```

```bash
gcloud functions deploy process-new-file \
  --gen2 \
  --runtime=python312 \
  --region=europe-west3 \
  --source=. \
  --entry-point=process_new_file \
  --trigger-event-filters="type=google.cloud.storage.object.v1.finalized" \
  --trigger-event-filters="bucket=espresso-prod-assets"
```

## Cloud Run

### Dockerfile בסיסי לשירות Node.js

```dockerfile
FROM node:20-slim
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
ENV PORT=8080
EXPOSE 8080
CMD ["node", "server.js"]
```

### בנייה ופריסה

```bash
# בניית האימג' ודחיפה ל-Artifact Registry
gcloud builds submit --tag europe-west3-docker.pkg.dev/espresso-prod-2026/web/api-service:v1

# פריסה ל-Cloud Run
gcloud run deploy api-service \
  --image=europe-west3-docker.pkg.dev/espresso-prod-2026/web/api-service:v1 \
  --region=europe-west3 \
  --platform=managed \
  --allow-unauthenticated \
  --memory=512Mi \
  --cpu=1 \
  --min-instances=0 \
  --max-instances=20 \
  --concurrency=80
```

### פיצול תעבורה בין Revisions (Canary Deployment)

```bash
# פריסת גרסה חדשה בלי לנתב אליה תעבורה מיידית
gcloud run deploy api-service \
  --image=europe-west3-docker.pkg.dev/espresso-prod-2026/web/api-service:v2 \
  --region=europe-west3 \
  --no-traffic \
  --tag=canary

# ניתוב 10% מהתעבורה ל-Revision החדש
gcloud run services update-traffic api-service \
  --region=europe-west3 \
  --to-tags=canary=10
```

### דוגמת Terraform ל-Cloud Run

```hcl
resource "google_cloud_run_v2_service" "api_service" {
  name     = "api-service"
  location = "europe-west3"

  template {
    scaling {
      min_instance_count = 0
      max_instance_count = 20
    }

    containers {
      image = "europe-west3-docker.pkg.dev/espresso-prod-2026/web/api-service:v1"

      resources {
        limits = {
          cpu    = "1"
          memory = "512Mi"
        }
      }
    }
  }
}

resource "google_cloud_run_v2_service_iam_member" "public_invoker" {
  location = google_cloud_run_v2_service.api_service.location
  name     = google_cloud_run_v2_service.api_service.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}
```

## Cloud Functions לעומת Cloud Run - מתי לבחור מה?

| קריטריון | Cloud Functions | Cloud Run |
|---|---|---|
| **יחידת הפריסה** | פונקציה בודדת | Container שלם |
| **שפות נתמכות** | רשימה סגורה (Python, Node, Go, Java...) | כל שפה שרצה ב-Container |
| **Concurrency למופע** | 1 (Gen1) / מוגדר (Gen2) | עד 1000 בקשות במקביל |
| **מתאים ל-** | Webhooks קטנים, Glue Code, תגובה לאירוע יחיד | APIs מלאים, מיקרו-שירותים, אפליקציות Web |
| **שליטה בסביבה** | מוגבלת | מלאה (כל מה שניתן להריץ ב-Container) |

## טיפים וטריקים

1. **השתמשו ב-Cloud Run כברירת מחדל** לרוב עומסי ה-Serverless — הוא גמיש יותר ותומך בכל שפה, ונחשב לממשק "עתיד" ה-Serverless של גוגל (גם Cloud Functions Gen2 רץ בפועל על גבי Cloud Run).
2. **הימנעו מ-Cold Start בשירותים קריטיים** על ידי הגדרת `--min-instances=1` ומעלה (עלות קבועה נוספת, אך זמן תגובה עקבי).
3. **בדקו Concurrency בקפידה** — Container לא Thread-Safe עלול לקרוס תחת בקשות מקבילות; התאימו את `--concurrency` ליכולת האפליקציה בפועל.
4. **השתמשו ב-Eventarc** לחיבור אחיד של אירועים ממקורות שונים (Audit Logs, Pub/Sub, Storage) אל Cloud Run, במקום טריגרים ייעודיים לכל מקור.
5. **נעלו הרשאות עם `--no-allow-unauthenticated`** ושילוב IAM Invoker Role לשירותים פנימיים שלא צריכים להיות חשופים לציבור.

## שאלות נפוצות לתרגול עצמי

- מתי תבחרו ב-Cloud Functions ומתי ב-Cloud Run עבור אותה דרישה עסקית?
- מה המשמעות של Scale-to-Zero, ואיך ניתן למנוע Cold Start בשירות קריטי?
- מהי Concurrency ב-Cloud Run, ומה קורה אם האפליקציה שלכם לא Thread-Safe?
- מהו Eventarc ואיזו בעיה הוא פותר בארכיטקטורת Event-Driven?

## קישורים חיצוניים

**תיעוד רשמי:**
- Cloud Run Documentation: https://cloud.google.com/run/docs
- Cloud Functions Documentation: https://cloud.google.com/functions/docs
- Eventarc Overview: https://cloud.google.com/eventarc/docs

**סרטוני YouTube מומלצים:**
- Google Cloud Tech - Cloud Run Explained: https://www.youtube.com/c/googlecloudtech
- freeCodeCamp - Serverless on GCP: https://www.youtube.com/watch?v=fZOz13joN0k
- TechWorld with Nana - Cloud Functions vs Cloud Run: https://www.youtube.com/c/TechWorldwithNana

---
⬅️ המדריך הבא: [08-bigquery-managed-databases.md](/gcp/08-bigquery-managed-databases/) — BigQuery, Cloud SQL ו-Firestore
