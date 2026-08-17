---
title: "BigQuery, Cloud SQL ו-Firestore - מסדי נתונים מנוהלים"
category: GCP
part: 8/10
---

## סקירת מסדי הנתונים המנוהלים ב-GCP

GCP מציע מגוון רחב של מסדי נתונים מנוהלים, המכסים כל דפוס שימוש — מ-Data Warehouse ענק ל-Analytics, דרך מסד יחסי קלאסי, ועד NoSQL Document DB לאפליקציות Real-time. הבחירה הנכונה תלויה בעיקר בדפוס הגישה לנתונים (Transactional מול Analytical), במבנה הנתונים (מובנה/גמיש) ובקנה המידה הנדרש.

### עקרונות מפתח

- **OLTP לעומת OLAP** — Cloud SQL מיועד ל-Transactional Workloads (הזמנות, עסקאות, מלאי), בעוד BigQuery מיועד ל-Analytical Workloads (דוחות, ניתוחים על מיליארדי שורות).
- **Fully Managed** — בכל השירותים הללו גוגל מנהלת Patching, Backups, High Availability ו-Scaling (בדרגות שונות של אוטומציה).
- **Serverless Analytics** — BigQuery לא דורש הקצאת שרתים כלל; משלמים לפי כמות הנתונים שנסרקה בשאילתה (או לפי Slots שמורים).
- **NoSQL Flexibility** — Firestore מתאים לסכימות גמישות המשתנות לאורך זמן, בניגוד לטבלאות SQL נוקשות.

## טבלת השוואה מהירה

| שירות | סוג | מודל | שימוש עיקרי |
|---|---|---|---|
| **BigQuery** | Data Warehouse (OLAP) | Serverless, Columnar | Analytics, BI, Data Science על היקפי Petabytes |
| **Cloud SQL** | Relational (OLTP) | Managed MySQL/PostgreSQL/SQL Server | אפליקציות טרנזקציוניות קלאסיות |
| **Cloud Spanner** | Relational (OLTP) גלובלי | Horizontally Scalable + Strong Consistency | אפליקציות גלובליות בקנה מידה ענק |
| **Firestore** | NoSQL Document DB | Serverless, Real-time Sync | אפליקציות Mobile/Web, נתונים היררכיים גמישים |
| **Bigtable** | NoSQL Wide-Column | היקף עצום, Latency נמוך מאוד | IoT, Time-Series, Analytics בזמן אמת |
| **Memorystore** | In-Memory (Redis/Memcached) | Cache מנוהל | Session Storage, Caching Layer |

## BigQuery - ארכיטקטורה

```
   Data Sources: Cloud Storage | Pub/Sub | Cloud SQL | Streaming Inserts
                          |
                          v
   +----------------------------------------------------+
   |                    BigQuery                          |
   |  Dataset: sales_analytics                            |
   |    Table: orders (Partitioned by date, Clustered)     |
   |    Table: customers                                   |
   |    View: monthly_revenue (Query מתוזמנת)              |
   +----------------------------------------------------+
                          |
              SQL Query (Serverless, Columnar Storage)
                          |
                          v
              Looker Studio / BI Tools / Vertex AI
```

### שאילתות ופעולות בסיסיות

```bash
# יצירת Dataset
bq mk --location=EU sales_analytics

# יצירת טבלה עם Schema מוגדר, Partitioned ו-Clustered
bq mk --table \
  --schema=order_id:STRING,customer_id:STRING,amount:FLOAT,order_date:DATE \
  --time_partitioning_field=order_date \
  --clustering_fields=customer_id \
  sales_analytics.orders

# טעינת נתונים מ-Cloud Storage
bq load --source_format=CSV \
  --skip_leading_rows=1 \
  sales_analytics.orders \
  gs://espresso-prod-assets/orders/*.csv

# הרצת שאילתה
bq query --use_legacy_sql=false \
'SELECT customer_id, SUM(amount) as total_spent
 FROM `espresso-prod-2026.sales_analytics.orders`
 WHERE order_date >= "2026-01-01"
 GROUP BY customer_id
 ORDER BY total_spent DESC
 LIMIT 10'
```

### דוגמת Standard SQL מתקדמת עם Window Function

```sql
SELECT
  customer_id,
  order_date,
  amount,
  SUM(amount) OVER (
    PARTITION BY customer_id
    ORDER BY order_date
    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
  ) AS running_total
FROM `espresso-prod-2026.sales_analytics.orders`
```

## Cloud SQL

Cloud SQL תומך ב-MySQL, PostgreSQL ו-SQL Server, ומספק Automated Backups, Point-in-Time Recovery, High Availability (Regional) ו-Read Replicas.

```bash
# יצירת instance PostgreSQL עם High Availability
gcloud sql instances create espresso-prod-db \
  --database-version=POSTGRES_15 \
  --tier=db-custom-2-8192 \
  --region=europe-west3 \
  --availability-type=REGIONAL \
  --backup-start-time=02:00 \
  --enable-point-in-time-recovery

# יצירת מסד נתונים לוגי בתוך ה-Instance
gcloud sql databases create orders_db --instance=espresso-prod-db

# יצירת משתמש
gcloud sql users create app_user \
  --instance=espresso-prod-db \
  --password=SECRET_PASSWORD

# יצירת Read Replica להפחתת עומס קריאה
gcloud sql instances create espresso-prod-db-replica \
  --master-instance-name=espresso-prod-db \
  --tier=db-custom-2-8192 \
  --region=europe-west3

# חיבור דרך Cloud SQL Auth Proxy (מומלץ - ללא IP חשוף)
cloud-sql-proxy espresso-prod-2026:europe-west3:espresso-prod-db
```

## Firestore

Firestore הוא מסד נתונים NoSQL מבוסס Documents ו-Collections, עם סנכרון בזמן אמת (Real-time Listeners) - פופולרי מאוד לאפליקציות Mobile ו-Web.

```javascript
// דוגמה ב-Node.js SDK
const { Firestore } = require('@google-cloud/firestore');
const db = new Firestore();

// כתיבת מסמך
await db.collection('orders').doc('order123').set({
  customerId: 'cust456',
  amount: 149.90,
  status: 'pending',
  createdAt: Firestore.Timestamp.now(),
});

// שאילתה
const snapshot = await db.collection('orders')
  .where('status', '==', 'pending')
  .orderBy('createdAt', 'desc')
  .limit(10)
  .get();

snapshot.forEach(doc => console.log(doc.id, '=>', doc.data()));

// האזנה בזמן אמת (Real-time Listener)
db.collection('orders').where('status', '==', 'pending')
  .onSnapshot(snapshot => {
    snapshot.docChanges().forEach(change => {
      console.log(`שינוי מסוג ${change.type} במסמך ${change.doc.id}`);
    });
  });
```

```bash
# יצירת Firestore Database (מצב Native)
gcloud firestore databases create --location=eur3

# ייצוא גיבוי
gcloud firestore export gs://espresso-prod-assets/firestore-backups/
```

## טיפים וטריקים

1. **תכננו Partitioning ו-Clustering ב-BigQuery מהיום הראשון** — טבלה לא Partitioned שגדלה לטרה-בייטים תגרום לסריקות יקרות ואיטיות בכל שאילתה.
2. **השתמשו ב-Cloud SQL Auth Proxy** במקום לחשוף IP ציבורי למסד הנתונים — מצפין תעבורה ומטפל באימות IAM אוטומטית.
3. **הפעילו Query Cost Estimation ב-BigQuery** לפני הרצת שאילתות כבדות:
   ```bash
   bq query --dry_run --use_legacy_sql=false 'SELECT * FROM sales_analytics.orders'
   ```
4. **בחרו Firestore על פני Cloud SQL** כאשר הסכימה גמישה ומשתנה, או כשצריך סנכרון Real-time ישיר ל-Client (Mobile/Web) ללא Backend נוסף.
5. **הגדירו Automated Backups + Point-in-Time Recovery בכל Cloud SQL Instance** בפרודקשן — זו לא ברירת מחדל אוטומטית בכל התצורות.

## שאלות נפוצות לתרגול עצמי

- מה ההבדל המהותי בין OLTP ל-OLAP, ואיך זה מכתיב את הבחירה בין Cloud SQL ל-BigQuery?
- מדוע Partitioning ו-Clustering חשובים לביצועים ולעלות ב-BigQuery?
- מתי תבחרו Firestore על פני Cloud SQL עבור אפליקציית Mobile חדשה?
- מהו Cloud Spanner, ובמה הוא שונה מ-Cloud SQL מבחינת Scale ו-Consistency?

## קישורים חיצוניים

**תיעוד רשמי:**
- BigQuery Documentation: https://cloud.google.com/bigquery/docs
- Cloud SQL Documentation: https://cloud.google.com/sql/docs
- Firestore Documentation: https://cloud.google.com/firestore/docs

**סרטוני YouTube מומלצים:**
- Google Cloud Tech - BigQuery Fundamentals: https://www.youtube.com/c/googlecloudtech
- freeCodeCamp - GCP Databases Overview: https://www.youtube.com/watch?v=fZOz13joN0k
- TechWorld with Nana - Managed Databases Explained: https://www.youtube.com/c/TechWorldwithNana

---
⬅️ המדריך הבא: [09-monitoring-cloud-operations.md](/gcp/09-monitoring-cloud-operations/) — Cloud Monitoring, Cloud Logging ו-Alerting
