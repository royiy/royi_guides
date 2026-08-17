---
title: "מבוא ל-Azure, מודל השירותים ותשתית הענן"
category: Azure
part: 1/10
---

## מה זה Microsoft Azure?

Microsoft Azure הוא פלטפורמת הענן הציבורי (Public Cloud) של מיקרוסופט, המספקת מעל 200 שירותים שונים — החל מתשתית מחשוב וירטואלית (VMs), דרך בסיסי נתונים מנוהלים, שירותי AI ו-Machine Learning, ועד פתרונות Kubernetes, Serverless ו-DevOps. Azure הושק ב-2010 והוא כיום אחת משלוש פלטפורמות הענן המובילות בעולם, לצד AWS ו-Google Cloud (GCP).

Azure פועל במודל **Pay-as-you-go** — משלמים רק על מה שצורכים, בלי השקעה מראש בחומרה. הפלטפורמה מיועדת הן לחברות סטארט-אפ קטנות והן לארגונים גדולים (Enterprise), עם דגש חזק על אינטגרציה עם עולם המוצרים של מיקרוסופט — Windows Server, Active Directory, SQL Server, .NET ו-Microsoft 365.

### עקרונות מפתח

- **Elasticity (גמישות)** — יכולת להגדיל או להקטין משאבים בהתאם לביקוש בפועל, אוטומטית או ידנית.
- **Global footprint** — פריסה גלובלית של מרכזי נתונים (Data Centers) המאפשרת להריץ עומסי עבודה קרוב פיזית למשתמשי הקצה.
- **Shared Responsibility Model** — מיקרוסופט אחראית על אבטחת התשתית הפיזית וה-Cloud עצמו, והלקוח אחראי על אבטחת הנתונים, הזהויות וההגדרות בתוך המשאבים שלו — האחריות משתנה בהתאם למודל (IaaS/PaaS/SaaS).

## מודל השירותים: IaaS, PaaS, SaaS

אחד המושגים הבסיסיים ביותר בעולם הענן הוא רמת האחריות שהספק לוקח על עצמו לעומת מה שנשאר באחריות הלקוח:

```
On-Premises        IaaS              PaaS              SaaS
(משלכם)            (Infra as a       (Platform as       (Software as
                    Service)          a Service)         a Service)

+----------+       +----------+      +----------+       +----------+
|  Apps    |       |  Apps    |      |  Apps    |       |          |
+----------+       +----------+      +----------+       |          |
|  Data    |       |  Data    |      |  Data    |       |  הכל     |
+----------+       +----------+      +----------+       |  מנוהל   |
| Runtime  |       | Runtime  |      |          |       |  ע"י     |
+----------+       +----------+      | מנוהל    |       |  הספק    |
|   OS     |       |   OS     |      | ע"י Azure|       |          |
+----------+       +----------+      +----------+       +----------+
| Virtual. |       |          |      |          |       |          |
+----------+       | מנוהל    |      | מנוהל    |       |          |
| Servers  |       | ע"י Azure|      | ע"י Azure|       | מנוהל    |
+----------+       +----------+      +----------+       | ע"י Azure|
| Storage  |       |          |      |          |       |          |
+----------+       +----------+      +----------+       +----------+
| Network  |
+----------+
     ^                  ^                  ^                  ^
  אתם מנהלים        אתם מנהלים        אתם מנהלים        Azure מנהלת
  הכל               רק Apps/Data      רק Apps/Data       הכל, אתם
                     ו-Runtime         (הפלטפורמה         רק צורכים
                                       מנוהלת)
```

| מודל | דוגמאות ב-Azure | מי אחראי על מה |
|---|---|---|
| **IaaS** | Azure Virtual Machines, Azure Virtual Network, Managed Disks | Azure מנהלת את החומרה הפיזית והוירטואליזציה; אתם מנהלים OS, Patching, אפליקציות |
| **PaaS** | Azure App Service, Azure SQL Database, Azure Functions, AKS (חלקית) | Azure מנהלת את התשתית וה-Runtime; אתם מתמקדים רק בקוד ובנתונים |
| **SaaS** | Microsoft 365, Dynamics 365, Power BI | הכל מנוהל על ידי הספק — אתם רק צורכים את המוצר המוגמר |

## Regions ו-Availability Zones

**Region (אזור)** הוא אוסף מרכזי נתונים גאוגרפיים בעלי טווח רשת ייעודי, לדוגמה: `West Europe` (הולנד), `North Europe` (אירלנד), `East US`, `Israel Central`. בבחירת Region יש להתחשב ב:

- **קרבה גאוגרפית** ללקוחות — משפיעה על Latency.
- **עמידה ברגולציה** (Data Residency/Sovereignty) — לדוגמה חוקי פרטיות ישראליים או אירופיים (GDPR).
- **זמינות שירותים** — לא כל שירות זמין בכל Region.
- **עלויות** — מחירים משתנים בין Regions.

**Availability Zone (AZ)** הוא מרכז נתונים פיזי נפרד בתוך אותו Region, עם חשמל, קירור ורשת עצמאיים. Region "Availability Zone-enabled" מכיל בדרך כלל 3 Zones לפחות. פריסת משאבים על פני מספר Zones מגנה מפני כשל של מרכז נתונים שלם.

```
Region: Israel Central
┌─────────────────────────────────────────────┐
│                                               │
│   Zone 1          Zone 2          Zone 3     │
│  ┌───────┐       ┌───────┐       ┌───────┐   │
│  │  DC A  │       │  DC B  │       │  DC C  │  │
│  └───────┘       └───────┘       └───────┘   │
│                                               │
│   רשת בק-בון (Backbone) עם Latency נמוך      │
│   בין ה-Zones (<2ms)                          │
└─────────────────────────────────────────────┘
```

מושגים נוספים בהיררכיה:

| מושג | תיאור |
|---|---|
| **Region Pair** | כל Region מזווג ל-Region נוסף (בד"כ באותה גיאוגרפיה) לצורך Disaster Recovery, לדוגמה West Europe מזווג ל-North Europe |
| **Geography** | קבוצת Regions התואמת גבולות מדיניים/רגולטוריים (למשל "Europe", "United States") |
| **Sovereign Cloud** | ענן נפרד ומבודד לצרכים ריבוניים, כמו Azure China או Azure Government |

## דרכי גישה וניהול: Portal, CLI, PowerShell

### Azure Portal

ממשק Web גרפי בכתובת [portal.azure.com](https://portal.azure.com) — מתאים לחקירה ראשונית, הגדרות חד-פעמיות, ומעקב ויזואלי אחר משאבים. פחות מתאים לאוטומציה ו-Repeatable Deployments.

### Azure CLI

כלי שורת פקודה חוצה-פלטפורמות (Linux/macOS/Windows), כתוב ב-Python, ומתאים מאוד לסקריפטים ו-CI/CD. זו הדרך הנפוצה ביותר לניהול Azure מ-Terminal או מצינורות אוטומציה.

```bash
# התקנה (Ubuntu/Debian)
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# התחברות
az login

# בחירת Subscription פעיל
az account set --subscription "My-Subscription-Name"

# יצירת Resource Group
az group create --name rg-demo --location westeurope

# יצירת VM מהיר
az vm create \
  --resource-group rg-demo \
  --name vm-demo01 \
  --image Ubuntu2204 \
  --admin-username azureuser \
  --generate-ssh-keys \
  --size Standard_B2s

# רשימת כל ה-Resource Groups בהרשמה הנוכחית
az group list --output table
```

### Azure PowerShell (Az Module)

מודול PowerShell (`Az`) המספק גישה מלאה ל-API של Azure עם תחביר PowerShell native — נפוץ מאוד בסביבות שמגיעות מעולם Windows/Active Directory.

```powershell
# התקנת המודול
Install-Module -Name Az -AllowClobber -Scope CurrentUser

# התחברות
Connect-AzAccount

# בחירת Subscription
Set-AzContext -SubscriptionName "My-Subscription-Name"

# יצירת Resource Group
New-AzResourceGroup -Name "rg-demo" -Location "West Europe"

# רשימת כל ה-VMs
Get-AzVM | Format-Table Name, ResourceGroupName, Location
```

### Cloud Shell

סביבת Terminal מבוססת דפדפן (Bash או PowerShell) הזמינה ישירות מתוך ה-Portal, עם Azure CLI ו-Az PowerShell מותקנים מראש — שימושי לעבודה מהירה בלי צורך בהתקנה מקומית.

## טיפים וטריקים

1. **השתמשו ב-`--output table` או `-o table`** ב-Azure CLI לפלט קריא יותר מ-JSON:
   ```bash
   az vm list -o table
   ```
2. **תייגו (Tags) כל משאב** מהיום הראשון — זה קריטי לניהול עלויות ולזיהוי בעלות:
   ```bash
   az resource tag --tags Environment=Production Owner=DevOps --ids <resource-id>
   ```
3. **השתמשו ב-`az config`** כדי להגדיר ברירות מחדל ולקצר פקודות:
   ```bash
   az config set defaults.group=rg-demo defaults.location=westeurope
   ```
4. **בדקו את ה-Service Health וה-Azure Status Page** לפני שפותחים כרטיס תמיכה — לעיתים מדובר בבעיה גלובלית ידועה.
5. **הפעילו Azure Advisor** — כלי מובנה שנותן המלצות אוטומטיות לחיסכון בעלויות, שיפור ביצועים ואבטחה.

## שאלות נפוצות לתרגול עצמי

- מה ההבדל בין IaaS, PaaS ו-SaaS, ותנו דוגמה לכל אחד מתוך Azure?
- מה ההבדל בין Region ל-Availability Zone?
- מדוע חשוב לבחור Region Pair נכון עבור אסטרטגיית Disaster Recovery?
- אילו שלוש דרכים עיקריות קיימות לניהול משאבי Azure, ומתי הייתם משתמשים בכל אחת?

## קישורים חיצוניים

**תיעוד רשמי:**
- מבוא ל-Azure Fundamentals: https://learn.microsoft.com/en-us/training/paths/microsoft-azure-fundamentals-describe-cloud-concepts/
- Azure Regions ו-Availability Zones: https://learn.microsoft.com/en-us/azure/reliability/availability-zones-overview
- Azure CLI - תיעוד מלא: https://learn.microsoft.com/en-us/cli/azure/

**סרטוני YouTube מומלצים:**
- Adam Marczak - Azure for Everyone: https://www.youtube.com/c/AdamMarczakAzureForEveryone
- freeCodeCamp - Azure Full Course: https://www.youtube.com/watch?v=NKEFWyqJ5XA
- TechWorld with Nana - Azure Basics: https://www.youtube.com/c/TechWorldwithNana

---
⬅️ המדריך הבא: [02-resource-groups-arm-bicep.md](/azure/02-resource-groups-arm-bicep/) — Subscriptions, Resource Groups ו-Infrastructure as Code עם ARM ו-Bicep
