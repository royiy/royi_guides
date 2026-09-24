---
title: "שאלות ראיון עבודה מקיפות על GCP + טיפים כלליים"
description: "25 שאלות ראיון עבודה על GCP מדורגות מ-Junior עד Senior עם תשובות, תרחיש סימולציה, וצ'קליסט פקודות gcloud ושגיאות נפוצות."
category: GCP
part: 10/10
---

מדריך מסכם עם שאלות ראיון מדורגות לפי רמת קושי (Junior → Senior) על Google Cloud Platform, כולל תשובות תמציתיות, תרחיש מבוסס-סימולציה, ורשימת טיפים כלליים לעבודה יומיומית ב-GCP.

## שאלות בסיסיות (Junior)

<details class="qa">
<summary>1. מה ההבדל בין Region ל-Zone ב-GCP?</summary>

Region הוא אזור גיאוגרפי (למשל `europe-west3`), המכיל לפחות 3 Zones (מרכזי נתונים נפרדים). משאב Zonal (כמו VM) חי בתוך Zone בודד; לתכנון High Availability פורסים על פני כמה Zones באותו Region.

</details>

<details class="qa">
<summary>2. מה ההיררכיה של המשאבים ב-GCP?</summary>

Organization → Folder → Project → Resource. מדיניות IAM שמוגדרת ברמה גבוהה יורשת אוטומטית לכל מה שמתחתיה.

</details>

<details class="qa">
<summary>3. מה ההבדל בין Basic Roles ל-Predefined Roles ב-IAM?</summary>

Basic Roles (Owner/Editor/Viewer) רחבים מאוד וחוצי-שירותים - לא מומלץ בפרודקשן. Predefined Roles ממוקדים לשירות ספציפי (למשל `roles/storage.objectViewer`) ותומכים בעיקרון Least Privilege.

</details>

<details class="qa">
<summary>4. מהו Service Account?</summary>

"משתמש" מיוחד המיועד לתהליכים ואפליקציות (לא לבני אדם), המאפשר ל-VM, פונקציה או Pipeline לבצע פעולות מול GCP APIs עם הרשאות מוגדרות.

</details>

<details class="qa">
<summary>5. מה ההבדל בין Compute Engine, Cloud Run ו-Cloud Functions?</summary>

Compute Engine הוא IaaS - VM מלא בשליטתכם. Cloud Run הוא Container as a Service Serverless - מריץ כל Docker Image. Cloud Functions הוא FaaS - פונקציה בודדת שרצה בתגובה לאירוע.

</details>

<details class="qa">
<summary>6. מהם Storage Classes ב-Cloud Storage?</summary>

Standard (גישה תכופה), Nearline (פחות מפעם בחודש), Coldline (פחות מפעם ברבעון), Archive (פחות מפעם בשנה) - ההבדל העיקרי הוא עלות אחסון מול עלות שליפה וזמינות.

</details>

<details class="qa">
<summary>7. מה זה gcloud CLI?</summary>

כלי שורת הפקודה הרשמי לניהול משאבי GCP - מאפשר ליצור, לעדכן ולמחוק כל משאב בפלטפורמה, כתחליף או השלמה ל-Console.

</details>

<details class="qa">
<summary>8. מה ההבדל בין VPC ב-GCP ל-VPC ב-AWS?</summary>

ב-GCP, VPC הוא משאב **Global** שיכול להכיל Subnets במספר Regions תחת אותה רשת לוגית - בלי VPC Peering ביניהם. ב-AWS, VPC הוא Regional במהותו.

</details>

## שאלות ברמה בינונית (Mid-Level)

<details class="qa">
<summary>9. הסבירו את ההבדל בין GKE Standard ל-GKE Autopilot.</summary>

ב-Standard אתם מנהלים את ה-Node Pools (Sizing, Scaling, תצורה) ומשלמים לפי VM. ב-Autopilot גוגל מנהלת את שכבת ה-Nodes לחלוטין, התמחור לפי Pod (CPU/Memory/Storage בפועל), וה-Best Practices לאבטחה נאכפים אוטומטית.

</details>

<details class="qa">
<summary>10. מהו Workload Identity ב-GKE ולמה הוא עדיף על מפתחות JSON?</summary>

מנגנון שמקשר בין Kubernetes Service Account ל-GCP Service Account ללא מפתחות סטטיים - מבטל את הצורך לאחסן Secrets בתוך ה-Cluster ומפחית סיכון דליפת אישורים.

</details>

<details class="qa">
<summary>11. מה ההבדל בין OLTP ל-OLAP, ואיך זה מכתיב את הבחירה בין Cloud SQL ל-BigQuery?</summary>

OLTP (Cloud SQL) מיועד לעסקאות בזמן אמת (הזמנות, מלאי). OLAP (BigQuery) מיועד לניתוח היקפי נתונים ענקיים (Analytics, BI) עם ביצועים מעולים בשאילתות Aggregation על מיליארדי שורות, אך פחות מתאים לעדכונים תכופים ברמת שורה בודדת.

</details>

<details class="qa">
<summary>12. מה זה Firewall Rule ב-GCP וכיצד הוא מסונן?</summary>

חוק Allow/Deny לתעבורה ברמת VPC (לא Subnet), מסונן לפי Network Tags, Service Account, או טווחי IP. הכללים Stateful - תגובה לחיבור מאושר מותרת אוטומטית.

</details>

<details class="qa">
<summary>13. מה ההבדל בין Cloud Functions ל-Cloud Run מבחינת Concurrency?</summary>

Cloud Functions Gen1 מטפל בבקשה אחת בכל פעם למופע. Cloud Run תומך בעד 1000 בקשות במקביל באותו Container Instance (בהנחה שהאפליקציה Thread-Safe), מה שהופך אותו ליעיל יותר לעומסים גבוהים.

</details>

<details class="qa">
<summary>14. איך פועל Autoscaling ב-Managed Instance Group?</summary>

מגדירים מדד יעד (CPU Utilization, Load Balancing Capacity, או Custom Metric), min/max replicas, ו-cooldown period. ה-Autoscaler בודק את המדד באופן שוטף ומתאים את מספר המופעים בהתאם.

</details>

<details class="qa">
<summary>15. מהו Log Sink ולמה הוא נחוץ?</summary>

חוק ניתוב לוגים מ-Cloud Logging ליעד חיצוני (BigQuery/Cloud Storage/Pub/Sub) - נדרש כי לוגים ב-Cloud Logging נשמרים כברירת מחדל רק 30 יום, וארכיון ארוך טווח או ניתוח מעמיק דורש הפניה החוצה.

</details>

<details class="qa">
<summary>16. מה ההבדל בין Regional Bucket ל-Multi-Region Bucket?</summary>

Regional זול יותר ומהיר לגישה ממקום קרוב גיאוגרפית. Multi-Region עולה יותר אך מספק זמינות גבוהה יותר וגישה מהירה מכל מקום ביבשת (למשל כל אירופה).

</details>

## שאלות מתקדמות (Senior)

<details class="qa">
<summary>17. איך תתכננו ארכיטקטורת Multi-Region עם High Availability ל-Cloud SQL?</summary>

שימוש ב-Regional Instance (Primary + Standby Zone שונה) להגנה מפני נפילת Zone, בשילוב Read Replicas ב-Region נוסף לקריאה מהירה ו-Disaster Recovery. Failover אוטומטי מנוהל ע"י GCP במקרה Regional Instance.

</details>

<details class="qa">
<summary>18. מה ההבדל בין VPC Peering ל-Shared VPC, ומתי תבחרו כל אחד?</summary>

VPC Peering מחבר שתי רשתות VPC נפרדות (כל אחת עם הבעלות והניהול שלה) - מתאים לחיבור בין ארגונים/פרויקטים עצמאיים. Shared VPC מאפשר לפרויקט "Host" לשתף Subnets עם פרויקטי "Service" מרובים תחת ניהול רשת מרכזי - מתאים לארגון גדול עם צוותי Dev מרובים שצריכים לחלוק תשתית רשת אחידה.

</details>

<details class="qa">
<summary>19. כיצד תעצבו אסטרטגיית CI/CD מאובטחת שמפרסת ל-Cloud Run/GKE מ-GitHub Actions בלי לשמור מפתחות JSON?</summary>

שימוש ב-Workload Identity Federation - מגדירים Identity Pool ו-Provider ב-GCP שסומכים על ה-OIDC Token שגוגל מנפיקה עבור GitHub Actions, מקשרים אותו ל-Service Account עם הרשאות מדויקות, וכך ה-Pipeline מקבל אסימון זמני בלי מפתח סטטי בכלל.

</details>

<details class="qa">
<summary>20. מה ההבדל בין Cloud Spanner ל-Cloud SQL, ומתי תבחרו ב-Spanner?</summary>

Cloud SQL הוא מסד יחסי קלאסי (MySQL/PostgreSQL) עם Scaling אנכי מוגבל. Cloud Spanner הוא מסד יחסי גלובלי הניתן ל-Horizontal Scaling עם Strong Consistency גם על פני Regions מרובים - מתאים לאפליקציות גלובליות בקנה מידה ענק (כמו מערכות פיננסיות רב-לאומיות) שדורשות גם עקביות חזקה וגם Scale אופקי.

</details>

<details class="qa">
<summary>21. איך תתכננו Partitioning ו-Clustering נכון ב-BigQuery לטבלת Events ענקית?</summary>

Partition לפי עמודת תאריך (`_PARTITIONTIME` או שדה DATE ייעודי) לצמצום סריקה לפי טווח זמן, ו-Clustering לפי עמודות שנשאלות בתדירות גבוהה ב-WHERE/GROUP BY (למשל `customer_id`) - משפר משמעותית ביצועים ומפחית עלות סריקה.

</details>

<details class="qa">
<summary>22. מה ההבדל בין Preemptible/Spot VM ל-Committed Use Discount, ומתי כל אחד מתאים?</summary>

Spot VM מספק הנחה עצומה (עד 91%) אך ניתן לכיבוי בכל רגע - מתאים לעומסים Fault-Tolerant כמו Batch Processing. Committed Use Discount מספק הנחה (עד 57%) בתמורה להתחייבות שימוש קבועה ל-1-3 שנים - מתאים לעומס Baseline יציב וידוע מראש.

</details>

<details class="qa">
<summary>23. איך תבצעו Canary Deployment ב-Cloud Run עם Rollback מהיר?</summary>

פורסים Revision חדש עם `--no-traffic` ו-`--tag=canary`, מנתבים אחוז קטן מהתעבורה (`update-traffic --to-tags=canary=10`) ובודקים מדדים ב-Cloud Monitoring. אם תקין - מגדילים הדרגתית ל-100%; אם יש בעיה - `update-traffic` בחזרה ל-Revision היציב הקודם תוך שניות, ללא Downtime.

</details>

<details class="qa">
<summary>24. מהי אסטרטגיית ה-Security Layering שתיישמו בפרויקט GCP חדש בארגון?</summary>

Organization Policies לאכיפת מדיניות רוחבית (מניעת IP ציבורי, אכיפת Domain-restricted sharing), IAM עם Least Privilege וקבוצות, VPC Service Controls להגבלת גישה ל-APIs מחוץ לגבול מוגדר, Uniform Bucket-Level Access בכל Storage, Binary Authorization ב-GKE לאכיפת אימג'ים חתומים בלבד, ו-Security Command Center לניטור מתמשך.

</details>

<details class="qa">
<summary>25. איך תתכננו Disaster Recovery בין שני Regions ל-GKE + Cloud SQL?</summary>

Cluster GKE כפול (Active-Active או Active-Passive) בשני Regions עם Global Load Balancer שמנתב לפי Health/Latency, Cloud SQL עם Cross-Region Read Replica שניתן לקדם ל-Primary במקרה כשל (Promotion), וגיבוי אוטומטי + Point-in-Time Recovery כרשת ביטחון נוספת. חשוב לתעד ולתרגל RTO/RPO בפועל, לא רק בתיאוריה.

</details>

## סימולציית תרחיש (Scenario-Based) - נפוץ בראיונות Senior

> **שאלה:** "יש לכם אפליקציה שרצה על GKE Standard, וב-Black Friday העומס קופץ פי 10 תוך דקות. המשתמשים מדווחים על Latency גבוה. איך תאבחנו ותפתרו את הבעיה בזמן אמת, ואיך הייתם מונעים אותה מראש?"

**תשובה מומלצת:** לאבחון בזמן אמת - בדיקת Cloud Monitoring לזיהוי צוואר הבקבוק (CPU/Memory על ה-Pods, Cluster Autoscaler שלא מספיק מהיר, או Node Pool שהגיע ל-max-nodes), בדיקת HPA (Horizontal Pod Autoscaler) שהוגדר נכון עם Target Utilization סביר, ובדיקת Load Balancer Backend Capacity. לפתרון מיידי - הגדלת max-nodes/max-replicas זמנית, הוספת Node Pool נוסף עם Machine Type חזק יותר. למניעה מראש - Load Testing מוקדם לקביעת Baseline נכון, מעבר ל-Cluster Autoscaler עם Node Auto-provisioning, שקילת GKE Autopilot לניהול Scale אוטומטי מלא, והגדרת Alerting Policies פרואקטיביות על מדדי Saturation לפני שהמשתמשים מרגישים בעיה.

## רשימת טיפים וטריקים כלליים (Cheat Sheet)

### gcloud CLI שימושי

```bash
# בדיקת פרויקט וחשבון פעילים
gcloud config list

# מעבר מהיר בין קונפיגורציות (חשבונות/פרויקטים שונים)
gcloud config configurations activate work-project

# פלט מובנה לסקריפטים
gcloud compute instances list --format="table(name,zone,status)"

# בדיקת הרשאות IAM אפקטיביות על פרויקט
gcloud projects get-iam-policy PROJECT_ID --format=json

# הרצת פקודה עם dry-run מחשבה (בדיקת syntax/פרמטרים)
gcloud compute instances create --help

# מעקב אחרי Logs בזמן אמת
gcloud logging tail "resource.type=cloud_run_revision"
```

### שגיאות נפוצות ופתרונן

| שגיאה | סיבה נפוצה | פתרון |
|---|---|---|
| `PERMISSION_DENIED` | IAM Role חסר או API לא מופעל | בדקו `gcloud services list --enabled` והרשאות IAM |
| `QUOTA_EXCEEDED` | חריגה ממכסת פרויקט (CPUs, IPs) | בקשו הגדלת Quota ב-Console או בחרו Region אחר |
| `RESOURCE_ALREADY_EXISTS` | שם Bucket/משאב לא ייחודי גלובלית | שנו שם - Bucket names גלובליים בכל GCP |
| Pod ב-`CrashLoopBackOff` | חוסר משאבים או שגיאת קונפיגורציה | `kubectl logs` + `kubectl describe pod` לאבחון |
| `Connection timed out` ל-VM | Firewall Rule חוסם או VM ללא External IP | בדקו Firewall Rules ו-Cloud NAT |

### עקרונות עבודה מומלצים

1. **Least Privilege תמיד** - התחילו מהרשאה מינימלית והרחיבו רק לפי צורך מוכח.
2. **Infrastructure as Code** - נהלו את כל המשאבים דרך Terraform, לא שינויים ידניים ב-Console.
3. **Workload Identity ולא מפתחות JSON** - בכל אינטגרציה בין GKE/CI-CD לבין GCP APIs.
4. **תייגו הכל (Labels)** - Project, Environment, Team, Cost-Center - חיוני למעקב עלויות ו-FinOps.
5. **תקציב והתראות** - הגדירו Budget Alerts בכל פרויקט כדי לא "להתעורר" עם חשבון מפתיע.
6. **גיבויים אוטומטיים** - Point-in-Time Recovery ב-Cloud SQL, Versioning ב-Cloud Storage, גיבוי סדיר ב-Firestore.
7. **Autopilot כברירת מחדל ב-GKE** - אלא אם יש צורך אמיתי בשליטה ברמת Node.
8. **Observability מהיום הראשון** - Dashboards + Alerting Policies על Golden Signals לכל שירות קריטי.
9. **בדקו עלויות באופן שוטף** - BigQuery Billing Export + Looker Studio לניתוח מגמות הוצאה.
10. **תרגלו Disaster Recovery בפועל** - RTO/RPO שלא נבדקו בתרגול הם רק תיאוריה.

## קישורים חיצוניים

**תיעוד רשמי:**
- Google Cloud Certification (Associate/Professional): https://cloud.google.com/certification
- Google Cloud Architecture Center: https://cloud.google.com/architecture
- Google Cloud Well-Architected Framework: https://cloud.google.com/architecture/framework

**סרטוני YouTube מומלצים (הכנה לראיונות):**
- Google Cloud Tech - Official Channel: https://www.youtube.com/c/googlecloudtech
- freeCodeCamp - Google Cloud Platform Full Course: https://www.youtube.com/watch?v=fZOz13joN0k
- TechWorld with Nana - GCP Certification Prep: https://www.youtube.com/c/TechWorldwithNana
- Simplilearn - GCP Interview Questions and Answers: https://www.youtube.com/watch?v=EcnqJbxBcM0

---
🏠 [חזרה למדריך 1 - מבוא ל-GCP](/gcp/01-mavo-le-gcp/)

---

## אינדקס כל 10 המדריכים

1. [מבוא ל-Google Cloud Platform, מודל שירותים ו-gcloud CLI](/gcp/01-mavo-le-gcp/)
2. [Projects, Organizations, Folders ו-IAM](/gcp/02-projects-iam-organization/)
3. [Compute Engine, Machine Types ו-Autoscaling](/gcp/03-compute-engine/)
4. [VPC Networks, Firewall Rules ו-Cloud Load Balancing](/gcp/04-vpc-networking/)
5. [Cloud Storage, Storage Classes ו-Access Control](/gcp/05-cloud-storage/)
6. [Google Kubernetes Engine (GKE) - ארכיטקטורה וניהול Clusters](/gcp/06-gke-kubernetes/)
7. [Cloud Functions ו-Cloud Run - סקירת Serverless](/gcp/07-serverless-functions-run/)
8. [BigQuery, Cloud SQL ו-Firestore - מסדי נתונים מנוהלים](/gcp/08-bigquery-managed-databases/)
9. [Cloud Monitoring, Cloud Logging ו-Alerting Policies](/gcp/09-monitoring-cloud-operations/)
10. [שאלות ראיון עבודה מקיפות על GCP + טיפים כלליים](/gcp/10-שאלות-ראיון-gcp/) (המדריך הנוכחי)
