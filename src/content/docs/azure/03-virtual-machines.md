---
title: "Azure Virtual Machines, Availability Sets/Zones ו-VM Scale Sets"
category: Azure
part: 3/10
---

## מה זה Azure Virtual Machine?

**Azure Virtual Machine (VM)** הוא שירות IaaS המספק מכונה וירטואלית מלאה — CPU, זיכרון, דיסקים ורשת — הרצה על תשתית וירטואליזציה (Hyper-V) בתוך מרכזי הנתונים של Azure. VM מעניק שליטה מלאה על מערכת ההפעלה (Windows או Linux), ולכן מתאים לעומסי עבודה הדורשים התאמה אישית מלאה, תוכנות Legacy, או Migration ישיר מסביבת On-Premises ("Lift and Shift").

### רכיבי ליבה של VM

| רכיב | תיאור |
|---|---|
| **Image** | תבנית מערכת ההפעלה (Marketplace, Custom Image, או Shared Image Gallery) |
| **Size (SKU)** | הגדרת החומרה — מספר vCPUs, זיכרון, ביצועי דיסק ורשת |
| **OS Disk** | הדיסק הראשי המכיל את מערכת ההפעלה — מבוסס Managed Disk |
| **Data Disk(s)** | דיסקים נוספים לאחסון נתונים, ניתן לצרף/לנתק בזמן ריצה |
| **NIC (Network Interface)** | כרטיס הרשת המקשר את ה-VM ל-VNet/Subnet |
| **Public IP** (אופציונלי) | כתובת IP נגישה מהאינטרנט |
| **NSG** | חוקי Firewall ברמת NIC או Subnet |

## גדלי VM (VM Sizes) נפוצים

Azure מציעה עשרות משפחות VM Sizes, כל אחת מותאמת לעומס עבודה אחר:

| משפחה | ייעוד | דוגמה |
|---|---|---|
| **B-series (Burstable)** | עומסים לא רציפים, סביבות Dev/Test, אתרים קטנים | `Standard_B2s` (2 vCPU, 4GB RAM) |
| **D-series (General Purpose)** | עומסי עבודה כלליים מאוזנים | `Standard_D4s_v5` (4 vCPU, 16GB RAM) |
| **E-series (Memory Optimized)** | בסיסי נתונים, In-Memory Caching | `Standard_E8s_v5` (8 vCPU, 64GB RAM) |
| **F-series (Compute Optimized)** | עיבוד אינטנסיבי, Batch Processing | `Standard_F8s_v2` |
| **N-series (GPU)** | Machine Learning, Rendering, AI Training | `Standard_NC6s_v3` |
| **L-series (Storage Optimized)** | בסיסי נתונים גדולים, NoSQL | `Standard_L8s_v3` |

```bash
# רשימת כל הגדלים הזמינים ב-Region מסוים
az vm list-sizes --location westeurope --output table

# בדיקת מחיר משוער (דרך Azure Retail Prices API או Azure Pricing Calculator)
```

## יצירת VM עם Azure CLI

```bash
az vm create \
  --resource-group rg-webapp-prod-weu \
  --name vm-web01 \
  --image Ubuntu2204 \
  --size Standard_D2s_v5 \
  --admin-username azureuser \
  --generate-ssh-keys \
  --vnet-name vnet-prod \
  --subnet subnet-web \
  --nsg nsg-web \
  --public-ip-sku Standard \
  --zone 1

# הפעלה/עצירה/הקצאה מחדש
az vm start --resource-group rg-webapp-prod-weu --name vm-web01
az vm deallocate --resource-group rg-webapp-prod-weu --name vm-web01
az vm resize --resource-group rg-webapp-prod-weu --name vm-web01 --size Standard_D4s_v5
```

> **טיפ חשוב:** `az vm stop` בלבד מכבה את המכונה אך **ממשיך לחייב** אתכם על משאבי החומרה המוקצים. יש להשתמש ב-`az vm deallocate` כדי לשחרר את המשאבים ולהפסיק חיוב מלא.

## Availability Sets

**Availability Set** הוא קיבוץ לוגי של VMs בתוך אותו Data Center, המבטיח פיזור על פני חומרה שונה כדי להגן מפני כשלים חומרתיים ותחזוקה מתוכננת:

- **Fault Domains** — קבוצות חומרה (Rack) נפרדות, עם חשמל ורשת עצמאיים (בד"כ 2-3 Fault Domains).
- **Update Domains** — קבוצות עדכון המבטיחות שלא כל ה-VMs יעברו Reboot/Patching בו-זמנית (עד 20 Update Domains).

```bash
az vm availability-set create \
  --resource-group rg-webapp-prod-weu \
  --name avset-web \
  --platform-fault-domain-count 3 \
  --platform-update-domain-count 5

az vm create --resource-group rg-webapp-prod-weu --name vm-web01 \
  --availability-set avset-web --image Ubuntu2204 --generate-ssh-keys
```

## Availability Zones

בעוד Availability Set מגן מפני כשל *בתוך* מרכז נתונים אחד, **Availability Zone** מפזר VMs בין **מרכזי נתונים פיזיים נפרדים** באותו Region — הגנה חזקה משמעותית, כולל מפני אירועים כמו הפסקת חשמל אזורית או שריפה במרכז נתונים בודד.

```
Region: West Europe
┌───────────────┬───────────────┬───────────────┐
│    Zone 1      │    Zone 2      │    Zone 3      │
│  ┌─────────┐  │  ┌─────────┐  │  ┌─────────┐  │
│  │ vm-web01 │  │  │ vm-web02 │  │  │ vm-web03 │  │
│  └─────────┘  │  └─────────┘  │  └─────────┘  │
│                │                │                │
└───────────────┴───────────────┴───────────────┘
        SLA: 99.99% (מול 99.95% ל-Availability Set)
```

```bash
az vm create --resource-group rg-webapp-prod-weu --name vm-web01 \
  --image Ubuntu2204 --zone 1 --generate-ssh-keys

az vm create --resource-group rg-webapp-prod-weu --name vm-web02 \
  --image Ubuntu2204 --zone 2 --generate-ssh-keys
```

> **חשוב לזכור:** לא ניתן לשלב Availability Set ו-Availability Zone לאותו VM — יש לבחור אסטרטגיה אחת. וגם — Availability Set ו-Zones לא מגנים מפני כשל ברמת האפליקציה, רק מפני כשל תשתיתי.

## Virtual Machine Scale Sets (VMSS)

**VMSS** הוא שירות המאפשר ליצור ולנהל **צי שלם** של VMs זהים, עם יכולת **Auto Scaling** אוטומטי בהתאם למדדים (CPU, זיכרון, אורך תור וכו'). זהו הבסיס לארכיטקטורות Stateless גמישות, ולעיתים משמש גם כתשתית מתחת ל-AKS.

```bash
az vmss create \
  --resource-group rg-webapp-prod-weu \
  --name vmss-web \
  --image Ubuntu2204 \
  --instance-count 3 \
  --vm-sku Standard_D2s_v5 \
  --admin-username azureuser \
  --generate-ssh-keys \
  --zones 1 2 3 \
  --load-balancer lb-web \
  --upgrade-policy-mode Automatic

# הגדרת חוקי Auto Scale לפי ניצול CPU
az monitor autoscale create \
  --resource-group rg-webapp-prod-weu \
  --resource vmss-web \
  --resource-type Microsoft.Compute/virtualMachineScaleSets \
  --name autoscale-web \
  --min-count 2 --max-count 10 --count 3

az monitor autoscale rule create \
  --resource-group rg-webapp-prod-weu \
  --autoscale-name autoscale-web \
  --condition "Percentage CPU > 75 avg 10m" \
  --scale out 2
```

| מאפיין | Availability Set | Availability Zone | VMSS |
|---|---|---|---|
| **מגן מפני** | כשל חומרה/עדכון בתוך DC | כשל DC שלם | שניהם + Auto Scaling |
| **SLA** | 99.95% | 99.99% | תלוי בהגדרה |
| **Scaling** | ידני | ידני | אוטומטי (Auto Scale) |
| **שימוש טיפוסי** | אפליקציות ותיקות, DB Cluster | עומסים קריטיים בסביבת פרודקשן | Web Farms, Microservices |

## Managed Disks

מאז 2017 כל דיסק חדש ב-Azure הוא **Managed Disk** כברירת מחדל — מיקרוסופט מנהלת את חשבון האחסון מאחורי הקלעים, כך שלא צריך לדאוג ל-Storage Account בעצמכם. סוגי ביצועים:

| סוג | תיאור | שימוש טיפוסי |
|---|---|---|
| **Standard HDD** | אחסון מגנטי זול | Backup, Archival |
| **Standard SSD** | SSD בסיסי לעומסים קלים | Web Servers קטנים |
| **Premium SSD** | ביצועים גבוהים, Low Latency | Production Databases |
| **Ultra Disk** | ביצועים קיצוניים, IOPS/Throughput מתכווננים בנפרד | SAP HANA, בסיסי נתונים קריטיים |

## טיפים וטריקים

1. **תמיד השתמשו ב-`deallocate` ולא `stop` בלבד** לחיסכון אמיתי בעלויות כשה-VM לא בשימוש.
2. **הפעילו Azure Hybrid Benefit** אם יש לכם רישיונות Windows Server/SQL קיימים — חוסך עד 40% מעלות ה-Compute.
3. **השתמשו ב-Spot VMs** לעומסים שניתן להפריע להם (Batch, CI/CD Runners) — הנחה של עד 90% במחיר, אך המכונה יכולה להתפנות בהתראה קצרה:
   ```bash
   az vm create --priority Spot --eviction-policy Deallocate --max-price -1 ...
   ```
4. **בדקו Quota לפני פריסה מסיבית** — לכל Subscription יש מכסת vCPUs לפי Region ומשפחת VM:
   ```bash
   az vm list-usage --location westeurope --output table
   ```
5. **השתמשו ב-Boot Diagnostics** לפתרון בעיות אתחול, במיוחד ב-VMs חדשים שלא עולים כראוי.

## שאלות נפוצות לתרגול עצמי

- מה ההבדל בין Availability Set ל-Availability Zone, ומתי תבחרו בכל אחד?
- מדוע `az vm stop` לבדו לא מספיק כדי להפסיק חיוב על VM?
- כיצד VMSS מאפשר Auto Scaling, ומה ההבדל בינו לבין Availability Set רגיל?
- מהם ההבדלים בין Standard HDD, Standard SSD, Premium SSD ו-Ultra Disk?

## קישורים חיצוניים

**תיעוד רשמי:**
- Azure Virtual Machines - תיעוד: https://learn.microsoft.com/en-us/azure/virtual-machines/
- Availability Sets ו-Zones: https://learn.microsoft.com/en-us/azure/reliability/availability-zones-overview
- Virtual Machine Scale Sets: https://learn.microsoft.com/en-us/azure/virtual-machine-scale-sets/overview

**סרטוני YouTube מומלצים:**
- John Savill's Technical Training - Azure VMs Deep Dive: https://www.youtube.com/c/NTFAQGuy
- Adam Marczak - Azure Virtual Machines Explained: https://www.youtube.com/c/AdamMarczakAzureForEveryone
- freeCodeCamp - Azure Compute Services: https://www.youtube.com/watch?v=NKEFWyqJ5XA

---
⬅️ המדריך הבא: [04-virtual-network.md](/azure/04-virtual-network/) — Azure Virtual Network, Subnets, NSG ו-Peering
