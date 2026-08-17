---
title: "Cloud Monitoring, Cloud Logging ו-Alerting Policies"
category: GCP
part: 9/10
---

## מה זה Cloud Operations Suite?

Cloud Operations Suite (בעבר Stackdriver) הוא המארז המאוחד של GCP לניטור, לוגים, מעקב (Tracing) ופרופיילינג. שני הרכיבים המרכזיים שבו הם **Cloud Monitoring** (מדדים, Dashboards, Alerting) ו-**Cloud Logging** (איסוף, חיפוש וניתוח לוגים). כל משאב ב-GCP — VM, Cluster, Function, Load Balancer — שולח אוטומטית מדדים ולוגים בסיסיים לשני השירותים הללו, ללא הגדרה נוספת.

המטרה המרכזית של השירותים הללו היא לספק **Observability** מלאה: לדעת לא רק *ש*-קרתה תקלה, אלא *למה* היא קרתה ו*איך* למנוע אותה בעתיד.

### עקרונות מפתח

- **Three Pillars of Observability** — Metrics (מדדים כמותיים לאורך זמן), Logs (רשומות אירועים מפורטות), Traces (מעקב אחר בקשה בודדת בין שירותים).
- **Log Sinks** — ניתוב לוגים מ-Cloud Logging ליעדים חיצוניים (BigQuery, Cloud Storage, Pub/Sub) לצורך ארכיון או ניתוח ארוך טווח.
- **SLO/SLI** — Service Level Indicator (מדד בפועל, כמו Latency) ו-Service Level Objective (יעד, כמו "99.9% מהבקשות מתחת ל-300ms") — כלים לניהול אמינות מבוסס-נתונים.
- **Uptime Checks** — בדיקות זמינות פרואקטיביות ממיקומים גיאוגרפיים שונים, בלי תלות ב-Agent על השרת.

## ארכיטקטורה

```
   VM / GKE Pod / Cloud Run / Cloud Function
              |                    |
        (Metrics אוטומטיים)   (Logs אוטומטיים - stdout/stderr)
              |                    |
              v                    v
   +--------------------+   +--------------------+
   |  Cloud Monitoring   |   |   Cloud Logging     |
   |  - Metrics Explorer |   |   - Logs Explorer    |
   |  - Dashboards       |   |   - Log-based Metrics|
   |  - Alerting Policies|   |   - Log Sinks -----> BigQuery / GCS / Pub/Sub
   +--------------------+   +--------------------+
              |
     Notification Channels: Email, Slack, PagerDuty, SMS, Webhook
```

| רכיב | תיאור |
|---|---|
| **Metric** | סדרת נתונים מספרית לאורך זמן (CPU%, Request Count, Latency) |
| **Dashboard** | תצוגה חזותית מותאמת של מספר מדדים יחד |
| **Alerting Policy** | תנאי המוגדר על מדד, שכאשר מתקיים - שולח התראה |
| **Notification Channel** | ערוץ קבלת התראה (Email, SMS, Slack, PagerDuty, Webhook) |
| **Log Sink** | חוק ניתוב לוגים תואמי-פילטר ליעד חיצוני |
| **Log-based Metric** | מדד מספרי שנוצר אוטומטית מספירת/ניתוח לוגים תואמי-תבנית |

## Cloud Logging - עבודה יומיומית

### חיפוש לוגים

```bash
# צפייה בלוגים אחרונים של שירות ספציפי
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=api-service" \
  --limit=50 --format=json

# סינון לוגי שגיאה בלבד מ-GKE
gcloud logging read "resource.type=k8s_container AND severity>=ERROR" \
  --limit=20

# לוגים מתוך טווח זמן ספציפי
gcloud logging read 'timestamp>="2026-08-17T00:00:00Z" AND severity=ERROR' --limit=100
```

### כתיבת לוג מותאם מתוך אפליקציה (Python)

```python
import google.cloud.logging

client = google.cloud.logging.Client()
client.setup_logging()

import logging
logging.info("הזמנה חדשה נקלטה", extra={"json_fields": {"order_id": "ORD-1001"}})
logging.error("כשל בעיבוד תשלום", extra={"json_fields": {"order_id": "ORD-1002"}})
```

### יצירת Log Sink לארכיון ב-BigQuery

```bash
gcloud logging sinks create archive-to-bigquery \
  bigquery.googleapis.com/projects/espresso-prod-2026/datasets/logs_archive \
  --log-filter="resource.type=cloud_run_revision"

# הענקת הרשאת כתיבה ל-Service Account שנוצר עבור ה-Sink
SINK_SA=$(gcloud logging sinks describe archive-to-bigquery --format="value(writerIdentity)")
bq add-iam-policy-binding \
  --member="$SINK_SA" \
  --role="roles/bigquery.dataEditor" \
  logs_archive
```

### Log-based Metric

```bash
gcloud logging metrics create payment_failures \
  --description="ספירת כשלי תשלום" \
  --log-filter='resource.type="cloud_run_revision" AND jsonPayload.message="כשל בעיבוד תשלום"'
```

## Cloud Monitoring - Alerting Policies

### יצירת Alerting Policy דרך YAML

```yaml
# high-cpu-alert.yaml
displayName: "CPU גבוה ב-Compute Engine"
combiner: OR
conditions:
  - displayName: "CPU מעל 85% למשך 5 דקות"
    conditionThreshold:
      filter: >
        resource.type="gce_instance"
        AND metric.type="compute.googleapis.com/instance/cpu/utilization"
      comparison: COMPARISON_GT
      thresholdValue: 0.85
      duration: 300s
      aggregations:
        - alignmentPeriod: 60s
          perSeriesAligner: ALIGN_MEAN
notificationChannels:
  - "projects/espresso-prod-2026/notificationChannels/1234567890"
alertStrategy:
  autoClose: 1800s
```

```bash
gcloud alpha monitoring policies create --policy-from-file=high-cpu-alert.yaml

# רשימת מדיניות התראה קיימת
gcloud alpha monitoring policies list
```

### יצירת Notification Channel (Slack לדוגמה)

```bash
gcloud alpha monitoring channels create \
  --display-name="DevOps Slack Alerts" \
  --type=slack \
  --channel-labels=channel_name=#alerts-prod
```

### Uptime Check

```bash
gcloud monitoring uptime create espresso-web-uptime \
  --resource-type=uptime-url \
  --resource-labels=host=www.espresso-club.co.il \
  --period=1 \
  --timeout=10 \
  --path=/health
```

### דוגמת Terraform ל-Alerting Policy

```hcl
resource "google_monitoring_alert_policy" "high_cpu" {
  display_name = "CPU גבוה ב-Compute Engine"
  combiner      = "OR"

  conditions {
    display_name = "CPU מעל 85%"
    condition_threshold {
      filter          = "resource.type=\"gce_instance\" AND metric.type=\"compute.googleapis.com/instance/cpu/utilization\""
      comparison      = "COMPARISON_GT"
      threshold_value = 0.85
      duration        = "300s"

      aggregations {
        alignment_period   = "60s"
        per_series_aligner = "ALIGN_MEAN"
      }
    }
  }

  notification_channels = [google_monitoring_notification_channel.slack.id]
}

resource "google_monitoring_notification_channel" "slack" {
  display_name = "DevOps Slack Alerts"
  type         = "slack"

  labels = {
    channel_name = "#alerts-prod"
  }
}
```

## טיפים וטריקים

1. **השתמשו ב-Log-based Metrics** להפוך אירועי לוג תדירים לגרפים ולתשתית התראה, בלי לשנות קוד אפליקציה.
2. **הגדירו Log Sinks ל-BigQuery מיד בהקמת פרויקט** — לוגים ב-Cloud Logging נשמרים כברירת מחדל רק 30 יום; ארכיון ל-BigQuery/GCS נדרש לשמירה ארוכת טווח ולניתוח.
3. **בנו Dashboard אחד לכל שירות קריטי** הכולל Golden Signals: Latency, Traffic, Errors, Saturation (עקרון SRE Google).
4. **הימנעו מ"Alert Fatigue"** — הגדירו Threshold ו-Duration שמונעים התראות שווא (למשל דרישה ל-5 דקות רצופות מעל סף, לא Spike רגעי).
5. **חברו Notification Channels למספר ערוצים** (Email + Slack + PagerDuty) לתקריות קריטיות, כדי להבטיח שאף התראה לא תפוספס.

## שאלות נפוצות לתרגול עצמי

- מהם שלושת עמודי ה-Observability (Metrics, Logs, Traces) ומה תפקיד כל אחד?
- מדוע נדרש Log Sink אם רוצים לשמור לוגים מעבר ל-30 יום?
- מהו Log-based Metric וכיצד הוא מאפשר Alerting על תוכן לוגים ולא רק על מדדי מערכת?
- כיצד הייתם מגדירים Alerting Policy שמונע "רעש" מ-Spikes רגעיים אך תופס בעיות מתמשכות אמיתיות?

## קישורים חיצוניים

**תיעוד רשמי:**
- Cloud Monitoring Documentation: https://cloud.google.com/monitoring/docs
- Cloud Logging Documentation: https://cloud.google.com/logging/docs
- Alerting Overview: https://cloud.google.com/monitoring/alerts

**סרטוני YouTube מומלצים:**
- Google Cloud Tech - Operations Suite Overview: https://www.youtube.com/c/googlecloudtech
- freeCodeCamp - GCP Monitoring & Logging: https://www.youtube.com/watch?v=fZOz13joN0k
- TechWorld with Nana - Observability Explained: https://www.youtube.com/c/TechWorldwithNana

---
⬅️ המדריך הבא: [10-שאלות-ראיון-gcp.md](/gcp/10-שאלות-ראיון-gcp/) — שאלות ראיון עבודה מקיפות על GCP
