---
title: "VPC Networks, Firewall Rules ו-Cloud Load Balancing"
category: GCP
part: 4/10
---

## מה זה VPC ב-GCP?

Virtual Private Cloud (VPC) הוא הרשת הפרטית והמבודדת של המשאבים שלכם ב-GCP. בניגוד ל-AWS שבו VPC הוא משאב Regional, ב-**GCP רשת VPC היא Global** — יכולה לפרוש Subnets במספר Regions תחת אותה רשת לוגית אחת, מבלי צורך ב-VPC Peering בין Regions שונים.

כל Subnet, לעומת זאת, הוא משאב **Regional** — מוגדר בטווח IP (CIDR) בתוך Region ספציפי, ומשאבים בתוכו יכולים להיפרש על פני מספר Zones.

### עקרונות מפתח

- **Auto Mode vs Custom Mode VPC** — ברשת Auto Mode, גוגל יוצרת אוטומטית Subnet אחד בכל Region עם טווח IP קבוע מראש; ב-Custom Mode (מומלץ לפרודקשן) אתם שולטים בטווחי ה-IP ובאילו Regions ליצור Subnets.
- **Firewall Rules הם Stateful** — אם חיבור נכנס אושר, התעבורה החוזרת (Response) מותרת אוטומטית ללא צורך בכלל יוצא נפרד.
- **Firewall Rules הן ברמת ה-VPC ולא ה-Subnet** — חלות על כל הרשת, ומסוננות לפי Tags, Service Accounts או טווחי IP.
- **Private Google Access** — מאפשר ל-VM ללא IP חיצוני לגשת ל-Google APIs (כמו Cloud Storage) דרך רשת גוגל הפנימית.

## ארכיטקטורה של רשת VPC

```
                     VPC Network: "espresso-prod-vpc"  (Global)
    +----------------------------------------------------------------+
    |                                                                  |
    |   Subnet: europe-west3     Subnet: us-central1                  |
    |   10.0.1.0/24               10.0.2.0/24                          |
    |   +----------------+        +----------------+                  |
    |   |  VM: web-1     |        |  VM: worker-1  |                  |
    |   |  VM: web-2     |        |  VM: worker-2  |                  |
    |   +----------------+        +----------------+                  |
    |                                                                  |
    +----------------------------------------------------------------+
                |                              |
        Firewall Rules (Global, מסוננות לפי Tags)
                |                              |
        [allow-http]  [allow-ssh]      [allow-internal]

    VPC Peering  <-->  VPC אחר (למשל shared-services-vpc)
```

| רכיב | תיאור |
|---|---|
| **VPC Network** | הרשת הלוגית הגלובלית, מכילה Subnets, Routes ו-Firewall Rules |
| **Subnet** | טווח IP Regional בתוך VPC |
| **Firewall Rule** | חוק Allow/Deny לתעבורה נכנסת (Ingress) או יוצאת (Egress), מסונן לפי Tags/SA/IP |
| **Route** | הגדרת ניתוב תעבורה (ברירת מחדל, Peering, VPN) |
| **VPC Peering** | חיבור פרטי בין שתי VPC (גם בין פרויקטים/ארגונים שונים), ללא IP ציבורי |
| **Cloud NAT** | מאפשר ל-VM ללא IP חיצוני לגשת לאינטרנט יוצא, בלי לחשוף אותו לתעבורה נכנסת |
| **Cloud Load Balancing** | איזון עומסים גלובלי/רגיונלי בין Layer 4 ל-Layer 7 |

## יצירת VPC, Subnet ו-Firewall Rules

```bash
# יצירת VPC במצב Custom (מומלץ)
gcloud compute networks create espresso-prod-vpc --subnet-mode=custom

# יצירת Subnet ב-Region ספציפי
gcloud compute networks subnets create subnet-europe \
  --network=espresso-prod-vpc \
  --region=europe-west3 \
  --range=10.0.1.0/24 \
  --enable-private-ip-google-access

# הוספת Subnet נוסף ב-Region אחר, תחת אותה VPC
gcloud compute networks subnets create subnet-us \
  --network=espresso-prod-vpc \
  --region=us-central1 \
  --range=10.0.2.0/24
```

### Firewall Rules

```bash
# איפשור SSH מכתובות IP ספציפיות בלבד (לא מהאינטרנט הכללי)
gcloud compute firewall-rules create allow-ssh-from-office \
  --network=espresso-prod-vpc \
  --direction=INGRESS \
  --action=ALLOW \
  --rules=tcp:22 \
  --source-ranges=203.0.113.0/24 \
  --target-tags=ssh-allowed

# איפשור HTTP/HTTPS מכל מקום, רק ל-VMs עם Tag מתאים
gcloud compute firewall-rules create allow-http-https \
  --network=espresso-prod-vpc \
  --direction=INGRESS \
  --action=ALLOW \
  --rules=tcp:80,tcp:443 \
  --source-ranges=0.0.0.0/0 \
  --target-tags=http-server,https-server

# איפשור תעבורה פנימית בין כל המשאבים ב-VPC (Internal Traffic)
gcloud compute firewall-rules create allow-internal \
  --network=espresso-prod-vpc \
  --direction=INGRESS \
  --action=ALLOW \
  --rules=tcp:0-65535,udp:0-65535,icmp \
  --source-ranges=10.0.0.0/8

# חסימה מפורשת (Deny) בעדיפות גבוהה יותר (מספר נמוך = עדיפות גבוהה)
gcloud compute firewall-rules create deny-all-egress-external \
  --network=espresso-prod-vpc \
  --direction=EGRESS \
  --action=DENY \
  --rules=all \
  --destination-ranges=0.0.0.0/0 \
  --priority=1000
```

### Cloud NAT (גישה יוצאת ל-VMs ללא IP חיצוני)

```bash
gcloud compute routers create nat-router \
  --network=espresso-prod-vpc \
  --region=europe-west3

gcloud compute routers nats create nat-config \
  --router=nat-router \
  --region=europe-west3 \
  --nat-all-subnet-ip-ranges \
  --auto-allocate-nat-external-ips
```

### VPC Peering

```bash
gcloud compute networks peerings create peer-to-shared \
  --network=espresso-prod-vpc \
  --peer-network=shared-services-vpc \
  --peer-project=shared-services-project
```

## Cloud Load Balancing

GCP מציע כמה סוגי Load Balancers, לפי Layer ומודל תעבורה:

| סוג | Layer | היקף | שימוש עיקרי |
|---|---|---|---|
| **Global External HTTP(S) LB** | L7 | Global | אתרי אינטרנט, REST APIs |
| **External TCP/SSL Proxy** | L4 | Global | תעבורת TCP לא-HTTP |
| **Regional External LB** | L4 | Regional | תעבורה רגיונלית פשוטה |
| **Internal HTTP(S) LB** | L7 | Regional | מיקרו-שירותים פנימיים |
| **Internal TCP/UDP LB** | L4 | Regional | איזון עומסים פנימי בין שירותים |

### יצירת Global HTTP(S) Load Balancer (בסיסי)

```bash
# 1. יצירת Health Check
gcloud compute health-checks create http web-health-check --port=80

# 2. יצירת Backend Service וקישור MIG
gcloud compute backend-services create web-backend-service \
  --protocol=HTTP --health-checks=web-health-check --global

gcloud compute backend-services add-backend web-backend-service \
  --instance-group=web-mig \
  --instance-group-zone=europe-west3-a \
  --global

# 3. URL Map, Target Proxy ו-Forwarding Rule
gcloud compute url-maps create web-url-map --default-service=web-backend-service

gcloud compute target-http-proxies create web-http-proxy --url-map=web-url-map

gcloud compute forwarding-rules create web-forwarding-rule \
  --global --target-http-proxy=web-http-proxy --ports=80
```

## טיפים וטריקים

1. **תמיד השתמשו ב-Custom Mode VPC בפרודקשן** — Auto Mode מייצר טווחי IP שעלולים להתנגש עם רשתות אחרות שתצטרכו לחבר בעתיד.
2. **הגבילו Firewall Rules לפי Service Account** ולא רק Tags — יותר מאובטח כי Tags ניתנים לשינוי, בעוד Service Account מחייב הרשאת IAM:
   ```bash
   gcloud compute firewall-rules create allow-from-sa \
     --network=espresso-prod-vpc --action=ALLOW --rules=tcp:443 \
     --target-service-accounts=web-sa@project.iam.gserviceaccount.com
   ```
3. **`gcloud compute firewall-rules list --format="table(name,network,direction,priority,sourceRanges.list())"`** נותן תמונה מהירה של כל החוקים ועדיפויותיהם.
4. **השתמשו ב-Firewall Insights** (בקונסולה) לזיהוי חוקים שאף פעם לא הופעלו (Shadowed Rules) — לניקוי תקופתי.
5. **VPC Flow Logs** מאפשרים ניתוח תעבורה מפורט לצורך אבטחה וניפוי תקלות רשת — הפעילו אותם ב-Subnet קריטיים.

## שאלות נפוצות לתרגול עצמי

- מה ההבדל המהותי בין VPC ב-GCP ל-VPC ב-AWS מבחינת ההיקף הגיאוגרפי?
- מדוע Firewall Rules ב-GCP הן Stateful ומה המשמעות המעשית לכתיבת חוקים?
- מתי תבחרו ב-VPC Peering ומתי ב-Shared VPC?
- מה ההבדל בין Global Load Balancer ל-Regional Load Balancer, ומתי כדאי כל אחד?

## קישורים חיצוניים

**תיעוד רשמי:**
- VPC Documentation: https://cloud.google.com/vpc/docs
- Firewall Rules Overview: https://cloud.google.com/firewall/docs/firewalls
- Cloud Load Balancing Overview: https://cloud.google.com/load-balancing/docs/load-balancing-overview

**סרטוני YouTube מומלצים:**
- Google Cloud Tech - Networking 101: https://www.youtube.com/c/googlecloudtech
- freeCodeCamp - GCP Networking Deep Dive: https://www.youtube.com/watch?v=fZOz13joN0k
- TechWorld with Nana - Load Balancing Explained: https://www.youtube.com/c/TechWorldwithNana

---
⬅️ המדריך הבא: [05-cloud-storage.md](/gcp/05-cloud-storage/) — Cloud Storage, Storage Classes ו-Access Control
