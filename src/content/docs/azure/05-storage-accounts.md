---
title: "Storage Accounts, Blob/File/Queue/Table ו-Redundancy"
category: Azure
part: 5/10
---

## מה זה Azure Storage Account?

**Storage Account** הוא המיכל (Container) העליון לכל שירותי האחסון של Azure — מספק Namespace ייחודי גלובלית (`<account-name>.blob.core.windows.net` וכו') שדרכו ניגשים לנתונים באמצעות HTTP/HTTPS או SDK. תחת Storage Account אחד ניתן להריץ מספר שירותי אחסון שונים במקביל.

### שירותי האחסון העיקריים

| שירות | סוג נתונים | שימוש טיפוסי |
|---|---|---|
| **Blob Storage** | אובייקטים לא-מובנים (קבצים, תמונות, וידאו, Backups) | אחסון קבצים, Data Lake, אירוח תוכן סטטי |
| **File Storage (Azure Files)** | שיתופי קבצים דרך SMB/NFS | תיקיות רשת משותפות, Lift-and-Shift של File Servers |
| **Queue Storage** | הודעות טקסט לתקשורת אסינכרונית בין רכיבים | Decoupling בין מיקרו-שירותים |
| **Table Storage** | NoSQL Key-Value פשוט | נתונים מובנים בקנה מידה גדול, ללא צורך ב-SQL מלא |
| **Disk Storage** | דיסקים מנוהלים ל-VMs | OS/Data Disks (ראו מדריך VMs) |

## Blob Storage לעומק

Blob Storage מאורגן ב-3 רמות: **Storage Account → Container → Blob**. קיימים שלושה סוגי Blob:

- **Block Blob** — אחסון קבצים כלליים (תמונות, מסמכים, וידאו) — הנפוץ ביותר.
- **Append Blob** — מותאם לצירוף נתונים (Append-only), למשל קבצי Log.
- **Page Blob** — מותאם לגישה רנדומלית, משמש לדיסקים וירטואליים (VHD).

```bash
# יצירת Storage Account
az storage account create \
  --name stwebappprodweu \
  --resource-group rg-webapp-prod-weu \
  --location westeurope \
  --sku Standard_LRS \
  --kind StorageV2 \
  --access-tier Hot \
  --min-tls-version TLS1_2 \
  --allow-blob-public-access false

# יצירת Container
az storage container create \
  --account-name stwebappprodweu \
  --name app-data \
  --auth-mode login

# העלאת קובץ
az storage blob upload \
  --account-name stwebappprodweu \
  --container-name app-data \
  --name reports/2026-08.csv \
  --file ./local-report.csv \
  --auth-mode login

# הפקת SAS Token זמני (7 ימים, קריאה בלבד)
az storage container generate-sas \
  --account-name stwebappprodweu \
  --name app-data \
  --permissions r \
  --expiry 2026-08-24T00:00:00Z \
  --https-only
```

## Access Tiers (רמות גישה)

Blob Storage מציע שלוש רמות עלות/ביצועים, המאפשרות אופטימיזציה כלכלית לפי תדירות הגישה בפועל לנתונים:

| Tier | עלות אחסון | עלות גישה/הורדה | Latency | שימוש טיפוסי |
|---|---|---|---|---|
| **Hot** | גבוהה | נמוכה | מיידי | נתונים בשימוש שוטף |
| **Cool** | בינונית | גבוהה יותר | מיידי | נתונים בגישה נדירה (חודש+) |
| **Cold** | נמוכה | גבוהה | מיידי | גישה נדירה מאוד (90 יום+) |
| **Archive** | הזולה ביותר | הגבוהה ביותר | **שעות** (Rehydration נדרש) | Backups ארוכי טווח, Compliance |

```bash
# שינוי Access Tier לבלוב בודד
az storage blob set-tier \
  --account-name stwebappprodweu \
  --container-name app-data \
  --name old-report.csv \
  --tier Archive

# מדיניות Lifecycle Management אוטומטית - העברה ל-Cool אחרי 30 יום, מחיקה אחרי שנה
az storage account management-policy create \
  --account-name stwebappprodweu \
  --resource-group rg-webapp-prod-weu \
  --policy @lifecycle-policy.json
```

```json
{
  "rules": [
    {
      "name": "MoveToCoolThenDelete",
      "type": "Lifecycle",
      "definition": {
        "filters": { "blobTypes": ["blockBlob"] },
        "actions": {
          "baseBlob": {
            "tierToCool": { "daysAfterModificationGreaterThan": 30 },
            "tierToArchive": { "daysAfterModificationGreaterThan": 90 },
            "delete": { "daysAfterModificationGreaterThan": 365 }
          }
        }
      }
    }
  ]
}
```

## Redundancy — אפשרויות שכפול נתונים

זהו אחד הנושאים המבוקשים ביותר בראיונות עבודה על Azure Storage. הבחירה נעה בין עלות לרמת ההגנה מפני כשלים:

```
LRS  (Locally Redundant Storage)
┌──────────────────────────────┐
│  Data Center אחד               │
│  3 עותקים בתוך אותו DC          │
└──────────────────────────────┘
        מגן מפני: כשל דיסק/רק

ZRS  (Zone Redundant Storage)
┌────────┬────────┬────────┐
│ Zone 1  │ Zone 2  │ Zone 3  │
│ עותק     │ עותק     │ עותק     │
└────────┴────────┴────────┘
        מגן מפני: כשל Data Center שלם

GRS  (Geo Redundant Storage)
┌──────────────────┐      ┌──────────────────┐
│  Region ראשי       │ ──►  │  Region משני       │
│  LRS (3 עותקים)     │      │  LRS (3 עותקים)     │
└──────────────────┘      └──────────────────┘
        מגן מפני: אסון אזורי שלם (Region-wide disaster)

GZRS (Geo-Zone Redundant Storage)
        שילוב של ZRS ב-Region הראשי + Replication ל-Region משני
        ההגנה הגבוהה ביותר הזמינה
```

| סוג | עותקים | הגנה | זמינות (SLA לקריאה) | עלות יחסית |
|---|---|---|---|---|
| **LRS** | 3 באותו DC | כשל דיסק/רק בודד | 99.9% | הזולה ביותר |
| **ZRS** | 3 בין Zones | כשל DC שלם | 99.9%–99.99% | בינונית |
| **GRS** | 6 (3+3 בשני Regions) | אסון אזורי | 99.9% (99.99% ל-RA-GRS) | גבוהה |
| **GZRS** | 6 (ZRS ראשי + LRS משני) | הגנה מקסימלית | הגבוהה ביותר | הגבוהה ביותר |

> **הבחנה חשובה לראיון:** ב-GRS, הנתונים ב-Region המשני **אינם נגישים לקריאה** כברירת מחדל — רק אם מפעילים **RA-GRS** (Read-Access GRS) ניתן לקרוא אותם ישירות דרך endpoint משני (`-secondary`), עוד לפני Failover רשמי.

```bash
# יצירת Storage Account עם GZRS ו-RA (Read Access)
az storage account create \
  --name stwebappprodweu \
  --resource-group rg-webapp-prod-weu \
  --sku Standard_RAGZRS \
  --kind StorageV2
```

## Azure Files ו-Queue Storage

```bash
# יצירת שיתוף קבצים (SMB)
az storage share-rm create \
  --storage-account stwebappprodweu \
  --resource-group rg-webapp-prod-weu \
  --name shared-config \
  --quota 100

# חיבור מ-Windows: net use Z: \\stwebappprodweu.file.core.windows.net\shared-config

# יצירת תור הודעות
az storage queue create \
  --account-name stwebappprodweu \
  --name order-processing \
  --auth-mode login

# הכנסת הודעה לתור
az storage message put \
  --account-name stwebappprodweu \
  --queue-name order-processing \
  --content "OrderId=12345" \
  --auth-mode login
```

## אבטחה גישה — שיטות Authentication

| שיטה | תיאור | המלצה |
|---|---|---|
| **Microsoft Entra ID (RBAC)** | הרשאות מבוססות זהות, ללא מפתחות | **מומלץ** — הסטנדרט המודרני |
| **Shared Key** | מפתח חשבון מלא (Storage Account Key) | להימנע — הרשאה גורפת מסוכנת |
| **SAS Token** | טוקן זמני עם הרשאות מוגבלות (זמן, פעולות, IP) | שימושי לגישה זמנית/צד ג' |
| **Anonymous Public Access** | גישה פתוחה ללא Auth | לחסום כברירת מחדל, להפעיל רק לצורך ספציפי (CDN וכו') |

## טיפים וטריקים

1. **חסמו Public Blob Access ברמת Storage Account** כברירת מחדל, ואפשרו רק ל-Containers ספציפיים שבאמת צריכים זאת.
2. **השתמשו ב-Immutable Storage (WORM)** לנתוני Compliance — מונע מחיקה/שינוי אפילו על ידי מנהל מערכת.
3. **הפעילו Soft Delete על Blobs ו-Containers** — הגנה מפני מחיקה בטעות, עם חלון שחזור מוגדר:
   ```bash
   az storage account blob-service-properties update --account-name stwebappprodweu --enable-delete-retention true --delete-retention-days 14
   ```
4. **בדקו את מגבלת ה-IOPS/Throughput** של ה-Tier שנבחר לפני שמריצים עומס אינטנסיבי — Standard מוגבל משמעותית לעומת Premium.
5. **השתמשו ב-`az storage account show-usage`** לניטור מכסות ברמת Subscription.

## שאלות נפוצות לתרגול עצמי

- מה ההבדל בין LRS, ZRS, GRS ו-GZRS מבחינת הגנה ועלות?
- מה ההבדל בין GRS ל-RA-GRS?
- באילו מצבים תבחרו ב-Archive Tier, ומה המחיר של החזרת נתונים משם (Rehydration)?
- מה ההבדל בין Block Blob, Append Blob ו-Page Blob?

## קישורים חיצוניים

**תיעוד רשמי:**
- Azure Storage - תיעוד כללי: https://learn.microsoft.com/en-us/azure/storage/common/storage-introduction
- Blob Storage Access Tiers: https://learn.microsoft.com/en-us/azure/storage/blobs/access-tiers-overview
- Storage Redundancy: https://learn.microsoft.com/en-us/azure/storage/common/storage-redundancy

**סרטוני YouTube מומלצים:**
- John Savill's Technical Training - Azure Storage Deep Dive: https://www.youtube.com/c/NTFAQGuy
- Adam Marczak - Azure Storage Explained: https://www.youtube.com/c/AdamMarczakAzureForEveryone
- freeCodeCamp - Azure Storage Services: https://www.youtube.com/watch?v=NKEFWyqJ5XA

---
⬅️ המדריך הבא: [06-azure-ad-entra-iam.md](/azure/06-azure-ad-entra-iam/) — Microsoft Entra ID, RBAC, Managed Identities ו-Service Principals
