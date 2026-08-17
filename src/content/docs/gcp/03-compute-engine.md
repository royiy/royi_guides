---
title: "Compute Engine, Machine Types ו-Autoscaling"
category: GCP
part: 3/10
---

## מה זה Compute Engine?

Compute Engine (GCE) הוא שירות ה-IaaS המרכזי של GCP, המספק מכונות וירטואליות (VM) הרצות על גבי תשתית הענן של גוגל. הוא מעניק שליטה מלאה במערכת ההפעלה, בהתקנות ובתצורה — בדומה ל-EC2 ב-AWS. Compute Engine מתאים לעומסי עבודה מסורתיים (אפליקציות Legacy, מסדי נתונים בניהול עצמי, HPC) שאינם מתאימים למודל Serverless.

VM ב-Compute Engine מוגדר על ידי כמה מרכיבים עיקריים: **Machine Type** (כמות ה-CPU וה-RAM), **Boot Disk** (דיסק מערכת ההפעלה), **Image** (תבנית מערכת ההפעלה), ו-**Network** (הרשת אליה ה-VM מחובר).

### עקרונות מפתח

- **Persistent Disks** — אחסון בלוקים (Block Storage) הנפרד מה-VM עצמו, שורד גם אם ה-VM נמחק (אלא אם הוגדר אחרת).
- **Preemptible/Spot VMs** — מכונות זולות משמעותית (עד 91% הנחה) שגוגל יכולה לכבות בכל רגע בהתראה קצרה — מתאים ל-Batch Jobs ועומסים שניתן להפריע להם.
- **Live Migration** — GCP מעביר VM רץ בין שרתים פיזיים בתחזוקה מתוכננת, ללא כיבוי (בניגוד ל-Reboot הכרחי בספקים אחרים).
- **Custom Machine Types** — ניתן להגדיר בדיוק כמה vCPUs וזיכרון צריך, ולא רק לבחור מתוך גדלים קבועים מראש.

## ארכיטקטורה ומשפחות Machine Types

```
                    +--------------------------+
                    |     Compute Engine VM     |
                    |--------------------------|
                    |  Machine Type (vCPU/RAM)  |
                    |  Boot Disk (Persistent)   |
                    |  Network Interface (VPC)  |
                    |  Metadata / Startup Script|
                    |  Service Account           |
                    +--------------------------+
                            |
              +-------------+--------------+
              |                            |
      Instance Template            Instance Group
   (תבנית שכפול VM)          (MIG - קבוצת מופעים)
```

| משפחה | מיועד ל- | דוגמת Machine Type |
|---|---|---|
| **E2** | עומסים כלליים, חסכוני בעלות | `e2-medium`, `e2-standard-4` |
| **N2 / N2D** | עומסים כלליים, ביצועים גבוהים יותר | `n2-standard-8` |
| **C2 / C3** | Compute-Optimized - HPC, Gaming | `c2-standard-16` |
| **M2 / M3** | Memory-Optimized - SAP HANA, In-Memory DB | `m2-ultramem-208` |
| **A2 / A3** | GPU-Optimized - Machine Learning, AI Training | `a2-highgpu-1g` |

## יצירה וניהול VM דרך gcloud

### יצירת VM בודד

```bash
gcloud compute instances create web-server-1 \
  --zone=europe-west3-a \
  --machine-type=e2-medium \
  --image-family=debian-12 \
  --image-project=debian-cloud \
  --boot-disk-size=20GB \
  --boot-disk-type=pd-ssd \
  --tags=http-server,https-server \
  --metadata=startup-script='#! /bin/bash
    apt-get update
    apt-get install -y nginx
    systemctl start nginx'
```

### פקודות ניהול בסיסיות

```bash
# רשימת מופעים
gcloud compute instances list

# עצירה / הפעלה מחדש / מחיקה
gcloud compute instances stop web-server-1 --zone=europe-west3-a
gcloud compute instances start web-server-1 --zone=europe-west3-a
gcloud compute instances delete web-server-1 --zone=europe-west3-a

# חיבור SSH ישירות דרך gcloud (מטפל במפתחות אוטומטית)
gcloud compute ssh web-server-1 --zone=europe-west3-a

# שינוי Machine Type (דורש עצירה קודם)
gcloud compute instances stop web-server-1 --zone=europe-west3-a
gcloud compute instances set-machine-type web-server-1 \
  --zone=europe-west3-a --machine-type=e2-standard-4
```

### Instance Templates ו-Managed Instance Groups (MIG)

Instance Group מאפשר לנהל אוסף VMs זהים כיחידה אחת — עם Autoscaling, Auto-healing, ו-Rolling Updates. תחילה יוצרים **Instance Template**, ולאחר מכן MIG המבוסס עליו.

```bash
# יצירת Instance Template
gcloud compute instance-templates create web-template \
  --machine-type=e2-medium \
  --image-family=debian-12 \
  --image-project=debian-cloud \
  --tags=http-server \
  --metadata=startup-script='#! /bin/bash
    apt-get update && apt-get install -y nginx
    systemctl start nginx'

# יצירת Managed Instance Group מבוסס Template
gcloud compute instance-groups managed create web-mig \
  --base-instance-name=web \
  --template=web-template \
  --size=2 \
  --zone=europe-west3-a
```

### הגדרת Autoscaling

```bash
gcloud compute instance-groups managed set-autoscaling web-mig \
  --zone=europe-west3-a \
  --max-num-replicas=10 \
  --min-num-replicas=2 \
  --target-cpu-utilization=0.6 \
  --cool-down-period=90
```

Autoscaler בודק את המדד שהוגדר (ברירת מחדל: CPU Utilization, אך אפשר גם Load Balancing Serving Capacity או Custom Metrics מ-Cloud Monitoring) ומתאים את מספר המופעים בין ה-min/max שהוגדרו.

### דוגמת Terraform ל-MIG עם Autoscaling

```hcl
resource "google_compute_instance_template" "web" {
  name         = "web-template"
  machine_type = "e2-medium"

  disk {
    source_image = "debian-cloud/debian-12"
    auto_delete   = true
    boot          = true
  }

  network_interface {
    network = "default"
  }

  metadata_startup_script = <<-EOT
    apt-get update
    apt-get install -y nginx
    systemctl start nginx
  EOT
}

resource "google_compute_instance_group_manager" "web_mig" {
  name               = "web-mig"
  base_instance_name = "web"
  zone               = "europe-west3-a"
  target_size        = 2

  version {
    instance_template = google_compute_instance_template.web.id
  }
}

resource "google_compute_autoscaler" "web_autoscaler" {
  name   = "web-autoscaler"
  zone   = "europe-west3-a"
  target = google_compute_instance_group_manager.web_mig.id

  autoscaling_policy {
    max_replicas    = 10
    min_replicas    = 2
    cooldown_period = 90

    cpu_utilization {
      target = 0.6
    }
  }
}
```

## טיפים וטריקים

1. **השתמשו ב-Spot VMs לעומסים שניתן להפריע** (Batch Processing, CI/CD Runners) לחסכון של עד 91% בעלות:
   ```bash
   gcloud compute instances create batch-worker \
     --provisioning-model=SPOT \
     --instance-termination-action=STOP \
     --machine-type=e2-standard-4
   ```
2. **תמיד השתמשו ב-Startup Scripts או Instance Templates** ולא בהתקנות ידניות — כדי לשמור על Infrastructure as Code ולאפשר שחזור מהיר.
3. **בדקו Committed Use Discounts (CUD)** אם יש לכם עומס יציב וצפוי לטווח ארוך — הנחה של עד 57% לעומת On-Demand.
4. **`gcloud compute instances describe`** שימושי לדיבוג מהיר של תצורת VM קיים:
   ```bash
   gcloud compute instances describe web-server-1 --zone=europe-west3-a --format=yaml
   ```
5. **הגדירו Health Checks על MIG** כדי לאפשר Auto-healing — אם VM נכשל ב-Health Check, ה-MIG יחליף אותו אוטומטית.

## שאלות נפוצות לתרגול עצמי

- מה ההבדל בין Standard VM ל-Preemptible/Spot VM, ומתי כדאי להשתמש בכל אחד?
- מהו Instance Template, ולמה הוא נדרש לפני יצירת Managed Instance Group?
- אילו מדדים ניתן להשתמש בהם כבסיס ל-Autoscaling Policy?
- מה קורה ל-Persistent Disk כאשר VM נמחק?

## קישורים חיצוניים

**תיעוד רשמי:**
- Compute Engine Documentation: https://cloud.google.com/compute/docs
- Machine Families Resource: https://cloud.google.com/compute/docs/machine-resource
- Managed Instance Groups: https://cloud.google.com/compute/docs/instance-groups

**סרטוני YouTube מומלצים:**
- Google Cloud Tech - Compute Engine 101: https://www.youtube.com/c/googlecloudtech
- freeCodeCamp - GCP Compute Engine Tutorial: https://www.youtube.com/watch?v=fZOz13joN0k
- TechWorld with Nana - VM Deep Dive: https://www.youtube.com/c/TechWorldwithNana

---
⬅️ המדריך הבא: [04-vpc-networking.md](/gcp/04-vpc-networking/) — VPC Networks, Firewall Rules ו-Load Balancing
