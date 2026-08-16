<!-- מדריך PowerShell בעברית | נבנה ללמידה, תרגול והכנה לראיונות -->

# מדריך 09 — PowerShell לענן: Azure, AWS ו-GCP

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
1. Azure PowerShell מול Azure CLI?
2. איך תמנע hard-coded secrets?
3. מה זה Managed Identity?
4. איך תנהל כמה subscriptions?
5. איך תבצע inventory של 1,000 resources?
6. איך תתמודד עם API throttling?
7. מה ההבדל בין automation לבין orchestration?


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

