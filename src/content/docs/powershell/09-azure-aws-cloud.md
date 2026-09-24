---
sidebar_position: 9
title: "מדריך 09 — PowerShell לענן: Azure, AWS ו-GCP"
description: "אוטומציה וניהול משאבי ענן עם מודולי Az, AWS Tools ו-gcloud - Inventory, Tags, אבטחת Secrets וניהול מרובה Subscriptions."
---

<!-- מדריך PowerShell בעברית | נבנה ללמידה, תרגול והכנה לראיונות -->

## 1. עיקרון
PowerShell בענן הוא לא רק "עוד CLI". הוא מאפשר אוטומציה, Inventory, Reporting, Governance ו-Remediation.

## 2. Azure
מודול:
```powershell
Install-Module Az -Scope CurrentUser
```

Login:
```powershell
Connect-AzAccount
```

Subscriptions:
```powershell
Get-AzSubscription
```

בחירה:
```powershell
Set-AzContext -SubscriptionId "SUBSCRIPTION-ID"
```

VMs:
```powershell
Get-AzVM
```

Resource Groups:
```powershell
Get-AzResourceGroup
```

## 3. Azure Inventory
```powershell
Get-AzResource |
    Select-Object Name,ResourceType,ResourceGroupName,Location |
    Export-Csv .\azure-inventory.csv -NoTypeInformation
```

## 4. Tags
```powershell
Get-AzResource |
    Where-Object Tags |
    Select-Object Name,ResourceType,Tags
```

## 5. AWS
AWS Tools for PowerShell:
https://aws.amazon.com/powershell/

דוגמה:
```powershell
Install-Module AWS.Tools.Installer
Install-AWSToolsModule AWS.Tools.EC2 -CleanUp
```

Credential configuration תלויה בארגון. עדיף IAM Roles / SSO / federation ולא מפתחות hard-coded.

EC2:
```powershell
Get-EC2Instance
```

S3:
```powershell
Get-S3Bucket
```

## 6. GCP
ל-GCP יש Cloud SDK וניתן לשלב PowerShell עם `gcloud`.

```powershell
gcloud auth login
gcloud projects list
gcloud compute instances list
```

הרעיון החשוב: PowerShell יכול לשמש orchestration layer גם כאשר כלי הענן הוא CLI.

## 7. Cloud automation
דוגמה עקרונית:
```powershell
$servers = Get-AzVM

foreach ($server in $servers) {
    [pscustomobject]@{
        Name     = $server.Name
        Resource = $server.ResourceGroupName
        Location = $server.Location
    }
}
```

## 8. Cloud Security
לעולם אל תעשה:
```powershell
$accessKey = "AKIA..."
$secret = "..."
```

עדיף:
- Managed Identity
- IAM Role
- Workload Identity
- Federated credentials
- Secret store
- Key Vault
- AWS Secrets Manager / SSM לפי תרחיש

## 9. תרגיל ראיון
"ביקשו ממך לעצור את כל ה-VMs בלילה. איך תעשה?"

תשובה מקצועית:
1. Define scope.
2. Exclude production/tag protected resources.
3. Dry-run.
4. Approval.
5. Logging.
6. Idempotency.
7. Scheduling.
8. Monitoring.
9. Rollback/start procedure.

## שאלות ראיון
<details class="qa">
<summary>1. Azure PowerShell מול Azure CLI?</summary>

Azure PowerShell (מודול `Az`) מחזיר אובייקטים ומשתלב טבעית בסקריפטים של PowerShell — נוח למי שכבר עובד בסביבת Windows/PowerShell. Azure CLI (`az`) הוא כלי חוצה-פלטפורמות שמחזיר JSON, פופולרי בפייפליינים ובתיעוד של מיקרוסופט. שניהם פונים לאותו ARM API; הבחירה היא בעיקר סגנונית וארגונית — העיקר לשמור על עקביות בצוות.

</details>

<details class="qa">
<summary>2. איך תמנע hard-coded secrets?</summary>

לא שומרים סיסמאות בקוד או ב-Git: משתמשים ב-Managed Identity כשרצים בתוך Azure, ב-Key Vault / AWS Secrets Manager לשליפת סודות בזמן ריצה, ב-secrets של מערכת ה-CI, וב-`SecretManagement`/`SecretStore` של PowerShell בתחנה המקומית. בנוסף מוסיפים סריקת secrets ל-repository כדי לתפוס טעויות.

</details>

<details class="qa">
<summary>3. מה זה Managed Identity?</summary>

זהות שמנוהלת ע"י Azure ומוצמדת למשאב (VM, Function, App Service), שבאמצעותה המשאב מקבל token ל-Azure AD בלי שום סוד שמאוחסן בקוד. נותנים לזהות הרשאות RBAC למה שהיא צריכה, וה-token מתחדש אוטומטית — זה הפתרון המועדף לאוטומציה בענן, במקום Service Principal עם סיסמה.

</details>

<details class="qa">
<summary>4. איך תנהל כמה subscriptions?</summary>

ב-`Az` שולפים את הרשימה עם `Get-AzSubscription` ומחליפים הקשר עם `Set-AzContext -SubscriptionId ...`, או עובדים עם `Az.Context` ופרופילים נפרדים. בסקריפט inventory עוברים בלולאה על כל ה-subscriptions ומוסיפים לכל רשומה את שם ה-subscription, כדי שהפלט יהיה חד-משמעי.

</details>

<details class="qa">
<summary>5. איך תבצע inventory של 1,000 resources?</summary>

משתמשים ב-Azure Resource Graph (`Search-AzGraph`) שמריץ שאילתה אחת על פני subscriptions רבים ומחזיר תוצאות במהירות, במקום לולאה של אלפי קריאות API. מייצאים את התוצאה ל-CSV/JSON עם השדות החשובים (שם, סוג, קבוצת משאבים, אזור, tags), ומתזמנים את הריצה כדי לקבל תמונת מצב עדכנית.

</details>

<details class="qa">
<summary>6. איך תתמודד עם API throttling?</summary>

מזהים את קודי 429/503 ומיישמים retry עם exponential backoff (עדיף לכבד את הכותרת `Retry-After`), מקטינים מקביליות, מאחדים קריאות (Resource Graph, batch APIs) ומשתמשים בסינון בצד השרת כדי למשוך פחות נתונים. בנוסף שומרים תוצאות ב-cache במקום לשאול שוב ושוב את אותו מידע.

</details>

<details class="qa">
<summary>7. מה ההבדל בין automation לבין orchestration?</summary>

Automation היא הפיכת משימה בודדת לאוטומטית — סקריפט שיוצר משתמש או מגבה מסד נתונים. Orchestration היא ניהול של כמה משימות כאלה כתהליך אחד: סדר הרצה, תנאים, טיפול בכשלים, retry ודיווח — למשל פייפליין שמריץ פריסה, בודק בריאות ומבצע rollback. במילים אחרות: automation היא "הפעולה", orchestration היא "התהליך".

</details>

## מקורות מומלצים

### Microsoft Learn
- https://learn.microsoft.com/en-us/powershell/
- https://learn.microsoft.com/en-us/powershell/scripting/discover-powershell
- https://learn.microsoft.com/en-us/powershell/scripting/learn/ps101/00-introduction
- https://learn.microsoft.com/en-us/powershell/scripting/samples/sample-scripts-for-administration
- https://learn.microsoft.com/en-us/powershell/gallery/
- https://learn.microsoft.com/en-us/powershell/module/

### YouTube
- PowerShell / Microsoft: https://www.youtube.com/@Microsoft
- Microsoft Mechanics: https://www.youtube.com/@MicrosoftMechanics
- Search: PowerShell tutorials: https://www.youtube.com/results?search_query=PowerShell+tutorial
- Search: PowerShell for administrators: https://www.youtube.com/results?search_query=PowerShell+for+system+administrators
- Search: PowerShell interview questions: https://www.youtube.com/results?search_query=PowerShell+interview+questions

# הרחבה — Cloud Automation מהיום-יום

## תרחיש — Azure Inventory

```powershell
Connect-AzAccount

Get-AzResource |
    Select-Object Name,ResourceType,ResourceGroupName,Location
```

שמור:

```powershell
Get-AzResource |
    Select-Object Name,ResourceType,ResourceGroupName,Location |
    Export-Csv C:\Reports\AzureInventory.csv -NoTypeInformation
```

## תרחיש — Production לפי Tags

```powershell
Get-AzResource |
    Where-Object {
        $_.Tags.Environment -eq 'Production'
    } |
    Select-Object Name,ResourceType,ResourceGroupName,Tags
```

לפני שינוי, בנה Allow-list.

## תרחיש — "תעצור את כל ה-VMs בלילה"

לא מתחילים:

```powershell
Get-AzVM | Stop-AzVM
```

קודם:
1. Define Production.
2. Exclude critical systems.
3. Preview.
4. Approval.
5. Execute.
6. Verify.
7. Keep startup procedure.

## AWS

```powershell
Get-EC2Instance |
    Select-Object -ExpandProperty Instances |
    Select-Object InstanceId,InstanceType,PrivateIpAddress,State
```

S3:

```powershell
Get-S3Bucket
```

## GCP + PowerShell

```powershell
gcloud compute instances list --format=json |
    ConvertFrom-Json |
    Select-Object name,status,zone
```

זה תרחיש חשוב: PowerShell לא חייב להחליף את כל כלי הענן. הוא יכול להיות שכבת Orchestration שמחברת CLI/API/CSV/REST.

## תרחיש — Secret נמצא ב-Git

אם מצאת Credential:
1. אל תסתפק במחיקה מהקובץ.
2. Rotate/Revoke.
3. בדוק שימוש.
4. בדוק Git history.
5. העבר ל-Secret Store.
6. הוסף Secret Scanning.
7. תעד.

## שאלת ראיון

**איך תנהל 5 Azure Subscriptions?**

```powershell
Get-AzSubscription
```

ואז:

```powershell
Set-AzContext -SubscriptionId 'SUBSCRIPTION-ID'
```

במערכת אמיתית אני מוסיף Scope ברור, Naming/Tags, RBAC, Logging ו-Guardrails.

