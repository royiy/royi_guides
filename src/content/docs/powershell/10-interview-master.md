<!-- מדריך PowerShell בעברית | נבנה ללמידה, תרגול והכנה לראיונות -->

# מדריך 10 — מאגר שאלות ראיון PowerShell ל-System / Cloud Administrator

## איך להשתמש במדריך
מומלץ לענות בקול. תשובה טובה בראיון אינה רק "הפקודה היא X". מנהל מערכות רוצה לשמוע גם:
- למה בחרת בפקודה?
- מה הסיכון?
- איך תבדוק לפני שינוי?
- איך תטפל בשגיאה?
- איך תתעד?
- איך תבצע Rollback?

# חלק א — שאלות בסיס

## 1. מה זה PowerShell?
PowerShell הוא shell ושפת scripting לאוטומציה וניהול. הוא עובד עם Objects ולכן Pipeline יכול להעביר מידע מובנה בין פקודות.

## 2. מה זה Cmdlet?
פקודה ייעודית של PowerShell, בדרך כלל בשם Verb-Noun, לדוגמה:
```powershell
Get-Service
Get-Process
Get-ADUser
```

## 3. מה עושה Get-Member?
```powershell
Get-Process | Get-Member
```
מציג Type, Properties, Methods ועוד.

## 4. מה עושה Get-Help?
```powershell
Get-Help Get-Service -Examples
```

## 5. Pipeline
```powershell
Get-Service |
    Where-Object Status -eq 'Running' |
    Select-Object Name,Status
```

# חלק ב — שאלות ביניים

## 6. `ForEach-Object` מול `foreach`
`foreach` הוא מבנה שפה. `ForEach-Object` הוא Cmdlet שעובד מצוין עם Pipeline. ההבדלים חשובים בביצועים ובאופן הזרמת הנתונים.

## 7. `Where-Object` מול `Filter`
`Where-Object` מסנן לאחר קבלת האובייקטים. כאשר Cmdlet תומך בשרת-side/provider-side filtering, לעיתים עדיף להשתמש בפרמטר Filter כדי להפחית נתונים שהוחזרו.

## 8. למה לא להשתמש ב-Format-Table לפני Export-Csv?
כי Format-* מייצר אובייקטי formatting ולא את מבנה הנתונים המקורי.

לא:
```powershell
Get-Service | Format-Table | Export-Csv report.csv
```

כן:
```powershell
Get-Service |
    Select-Object Name,Status |
    Export-Csv report.csv -NoTypeInformation
```

## 9. מה זה `[PSCustomObject]`?
דרך נוחה ליצור Object עם Properties מוגדרים:
```powershell
[pscustomobject]@{
    Server = "SRV01"
    Status = "OK"
}
```

# חלק ג — שאלות System Administrator

## 10. שרת לא מגיב. מה תבדוק?
```powershell
Test-Connection SRV01 -Count 2
Test-NetConnection SRV01 -Port 3389
Test-WSMan SRV01
Resolve-DnsName SRV01
```
לאחר מכן: Hypervisor/Cloud, firewall, event logs, services, application.

## 11. Service לא עולה
```powershell
Get-Service MyService
Get-Service MyService | Select-Object *
```
בדוק:
- Dependencies
- Account
- Path
- Permissions
- Event Viewer
- Application logs
- Disk
- Network dependencies

## 12. Disk מלא
```powershell
Get-CimInstance Win32_LogicalDisk -Filter "DriveType=3"
```
ואז:
```powershell
Get-ChildItem C:\ -Recurse -File -ErrorAction SilentlyContinue |
    Sort-Object Length -Descending |
    Select-Object -First 20 FullName,Length
```

## 13. משתמש לא מצליח להתחבר ל-AD
בדוק:
```powershell
Get-ADUser username -Properties *
Search-ADAccount -LockedOut
```
לאחר מכן DNS, זמן, DC, replication ו-logs.

# חלק ד — שאלות PowerShell מתקדמות

## 14. מה זה Scope?
Scope קובע היכן משתנה/פונקציה זמינים.

## 15. מה זה Splatting?
```powershell
$params = @{
    ComputerName = "SRV01"
    ErrorAction  = "Stop"
}

Invoke-Command @params -ScriptBlock {
    hostname
}
```

יתרון: קוד קריא, נוח לדינמיות ול-debugging.

## 16. מה זה Advanced Function?
פונקציה שמשתמשת ב-`[CmdletBinding()]` ויכולה לקבל common parameters, pipeline binding ועוד.

## 17. WhatIf
```powershell
Remove-Item C:\Temp\*.log -WhatIf
```
מטרתו לבדוק מה היה מתבצע לפני שינוי אמיתי.

## 18. ErrorAction Stop
```powershell
try {
    Get-Item C:\missing.txt -ErrorAction Stop
}
catch {
    $_.Exception.Message
}
```

# חלק ה — תרחישי ראיון

## 19. "כתוב סקריפט שמוצא שרתים עם פחות מ-10% Disk"
```powershell
$servers = "SRV01","SRV02","SRV03"

foreach ($server in $servers) {
    try {
        Invoke-Command -ComputerName $server -ErrorAction Stop -ScriptBlock {
            Get-CimInstance Win32_LogicalDisk -Filter "DriveType=3" |
                ForEach-Object {
                    [pscustomobject]@{
                        ComputerName = $env:COMPUTERNAME
                        Drive = $_.DeviceID
                        FreePercent = [math]::Round($_.FreeSpace/$_.Size*100,1)
                    }
                }
        }
    }
    catch {
        [pscustomobject]@{
            ComputerName = $server
            Drive = $null
            FreePercent = $null
            Error = $_.Exception.Message
        }
    }
}
```

## 20. "איך תנהל 500 שרתים?"
תשובה:
- Inventory מסודר
- Parallelism מבוקר
- ThrottleLimit
- Timeouts
- Retry strategy
- Logging
- Central reporting
- Least privilege
- Avoid unnecessary remote sessions

## 21. "סקריפט רץ 30 דקות. מה תעשה?"
לא מתחילים באופטימיזציה אקראית.
1. Measure.
2. Identify bottleneck.
3. Count API calls.
4. Check unnecessary loops.
5. Replace repeated lookups with cache.
6. Use server-side filters.
7. Consider controlled parallelism.
8. Measure again.

## 22. "איך תשמור סודות?"
לא בקוד. השתמש במנגנון secret מתאים: SecretManagement, Key Vault, managed identity, IAM role או פתרון ארגוני אחר.

# חלק ו — שאלות Trick

## 23. למה `Write-Host` בעייתי בדוחות?
`Write-Host` מיועד לתצוגה למשתמש ולא לזרימת נתונים. אם רוצים להעביר נתונים ל-Pipeline, החזר Object.

## 24. למה `Format-Table` לא מתאים לאוטומציה?
כי הוא שכבת תצוגה.

## 25. למה `+=` יכול להיות איטי?
במערכים הוא עלול לגרום ליצירה/העתקה חוזרת. עבור כמויות גדולות שקול List.

## 26. האם Ping מצליח אומר שהשרת תקין?
לא. Ping בודק ICMP. אפליקציה יכולה להיות down בעוד Ping תקין.

## 27. האם Port 443 פתוח אומר שהאתר עובד?
לא. צריך HTTP/TLS/Application validation.

# חלק ז — שאלות Cloud

## 28. איך תבצע Cloud Inventory?
להתחבר באמצעות מודול/API, לשלוף משאבים, לבחור Properties, לייצא ל-CSV/JSON ולשמור Timestamp.

## 29. איך תמנע מחיקה של Production?
Tags/Resource Groups/Scopes, deny policies כאשר מתאים, Allow-list, WhatIf, approval ו-RBAC.

## 30. איך תבנה Automation בטוח?
- Least privilege
- Input validation
- Dry run
- Logging
- Retry
- Idempotency
- Alerting
- Rollback
- Secrets management

# חלק ח — משימת בית לדוגמה

כתוב `Invoke-EnvironmentHealthCheck.ps1` שמקבל:
```powershell
param(
    [string[]]$ComputerName,
    [int]$DiskThreshold = 15
)
```

הסקריפט צריך להחזיר לכל שרת:
- Ping
- WinRM
- OS
- Uptime
- Disk free %
- Spooler
- Windows Update
- 5 Errors אחרונים
- זמן ביצוע
- Error אם נכשל

לייצא:
```text
EnvironmentHealth.csv
EnvironmentHealth.json
EnvironmentHealth.log
```

## Bonus
הוסף:
- `-Verbose`
- `-WhatIf`
- `-Credential`
- `-ThrottleLimit`
- Retry
- Pester tests

# Cheat Sheet לראיון

```powershell
# Discovery
Get-Command
Get-Help
Get-Member
Get-Verb

# Processes
Get-Process
Stop-Process

# Services
Get-Service
Restart-Service

# Files
Get-ChildItem
Get-Content
Set-Content
Copy-Item
Remove-Item

# Events
Get-WinEvent

# Network
Test-Connection
Test-NetConnection
Resolve-DnsName
Invoke-WebRequest
Invoke-RestMethod

# Remoting
Test-WSMan
Invoke-Command
Enter-PSSession
New-PSSession

# AD
Get-ADUser
Get-ADGroup
Get-ADComputer
Get-ADDomainController
Get-ADReplicationFailure

# Exchange
Connect-ExchangeOnline
Get-EXOMailbox

# Entra
Connect-MgGraph
Get-MgUser

# Azure
Connect-AzAccount
Get-AzVM
Get-AzResource

# Output
Select-Object
Where-Object
Sort-Object
Export-Csv
ConvertTo-Json
```

## מקורות
- PowerShell documentation: https://learn.microsoft.com/en-us/powershell/
- Discover PowerShell: https://learn.microsoft.com/en-us/powershell/scripting/discover-powershell
- PowerShell 101: https://learn.microsoft.com/en-us/powershell/scripting/learn/ps101/00-introduction
- System administration samples: https://learn.microsoft.com/en-us/powershell/scripting/samples/sample-scripts-for-administration
- Entra PowerShell: https://learn.microsoft.com/en-us/powershell/entra-powershell/
- YouTube PowerShell search: https://www.youtube.com/results?search_query=PowerShell+interview+questions



# הרחבה — תרחישי ראיון ברמת System / Cloud Administrator

## תרחיש ראיון 1 — "השרת איטי"

תשובה לדוגמה:

> קודם אני מגדיר מה איטי — Login, Application, RDP או כל המערכת. אני בודק CPU, Memory, Disk, Network ו-Event Logs. אם מדובר באפליקציה, אני מפריד בין Client, Network, IIS/Application ו-Database. אני מודד לפני שינוי ולא עושה Restart כתגובה ראשונה.

## תרחיש ראיון 2 — "משתמש לא מצליח להתחבר"

```powershell
Get-ADUser username -Properties *
```

אני בודק:
- Enabled
- LockedOut
- PasswordExpired
- PasswordLastSet
- DC
- DNS
- Time
- GPO
- Event Logs

אם LockedOut, אני מחפש את מקור הנעילה ולא רק עושה Unlock.

## תרחיש ראיון 3 — "Application לא נגישה"

```powershell
Resolve-DnsName app01
Test-NetConnection app01 -Port 443
curl.exe -v https://app01/
```

אני מתקדם שכבה-שכבה.

## תרחיש ראיון 4 — "PowerShell Remoting לא עובד"

```powershell
Resolve-DnsName SRV01
Test-NetConnection SRV01 -Port 5985
Test-WSMan SRV01
Invoke-Command SRV01 { hostname }
```

אם יש Access Denied אני עובר להרשאות/Authentication. אם יש Timeout אני עובר ל-Network/Firewall/WinRM.

## תרחיש ראיון 5 — "יש 500 שרתים"

אני לא מריץ 500 פעולות ללא שליטה.

אני משתמש:
- Inventory
- ThrottleLimit
- Batching
- Retry
- Timeout
- Logging
- Error Report
- Central Output

## תרחיש ראיון 6 — "איך תכתוב סקריפט Production?"

התשובה:

```text
Parameters
Validation
Logging
Error Handling
WhatIf
Idempotency
Least Privilege
Output Objects
Exit Codes
Documentation
Testing
Rollback
```

## תרחיש ראיון 7 — "למה try/catch לא תפס?"

אני בודק האם מדובר ב-Non-terminating Error. במקרה הצורך:

```powershell
try {
    Get-Item C:\missing.txt -ErrorAction Stop
}
catch {
    Write-Error $_.Exception.Message
}
```

Microsoft מציינת במפורש ש-Non-terminating Errors אינם מפעילים `catch` כברירת מחדל, וש-`-ErrorAction Stop` יכול להסלים אותם ל-Terminating Error. citeturn0search1

## תרחיש ראיון 8 — "איך תעשה Bulk AD Change?"

```text
CSV
 ↓
Import
 ↓
Validation
 ↓
Preview
 ↓
Approval
 ↓
Change
 ↓
Verification
 ↓
Report
```

## תרחיש ראיון 9 — "Script לוקח שעה"

אני לא ישר מוסיף Parallelism.

אני מודד:

```powershell
Measure-Command {
    .\MyScript.ps1
}
```

ואז בודק:
- מספר Queries.
- מספר API Calls.
- `Properties *`.
- Loops.
- Repeated lookups.
- Serialization.
- Network latency.

## תרחיש ראיון 10 — "איך אתה לומד טכנולוגיה חדשה?"

תשובה חזקה:

> אני מתחיל בתיעוד הרשמי, בונה Lab קטן, מריץ תרחישים בסיסיים, ואז תרחיש Troubleshooting. לאחר מכן אני הופך את מה שלמדתי ל-Script קטן ומתעד אותו. רק אחרי שאני מבין את ההתנהגות אני מכניס אותו לאוטומציה Production.

## 20 שאלות שעליך לדעת לענות עליהן

1. מה ההבדל בין PowerShell 5.1 ל-7?
2. מהו Pipeline?
3. מה עושה Get-Member?
4. מה ההבדל בין Where ל-Select?
5. למה לא עושים Format-Table לפני Export?
6. מהו PSCustomObject?
7. מהו Splatting?
8. מהו Advanced Function?
9. מה זה Scope?
10. מה ההבדל בין try/catch ל-ErrorAction?
11. מה זה Remoting?
12. מה זה WinRM?
13. איך תחקור DNS?
14. איך תחקור Port?
15. איך תחקור Service?
16. איך תחקור AD Replication?
17. איך תעשה Bulk Change בטוח?
18. איך תשמור Secrets?
19. איך תבצע Cloud Inventory?
20. איך תהפוך Script לכלי Production?

## שאלת "מכירה עצמית" בראיון

אם שואלים:

> "למה אתה מתאים לתפקיד?"

תשובה אפשרית:

> אני מגיע מרקע של System Administration ומביא גישה של Troubleshooting ואוטומציה. אני לא רואה PowerShell רק ככלי להרצת פקודות, אלא ככלי לבניית תהליכים חוזרים, דוחות ופתרונות שניתן לתחזק. כשיש תקלה אני קודם אוסף Evidence, מפריד בין שכבות, מודד ורק אז משנה. בענן אני מיישם את אותה גישה על Azure/AWS/GCP — Inventory, Automation, Security ו-Logging.

## משימת בית מומלצת

בנה Repository:

```text
PowerShell-Admin-Toolkit/
│
├── Modules/
│   └── Company.ServerTools/
│
├── Scripts/
│   ├── Get-ServerHealth.ps1
│   ├── Test-WebEndpoint.ps1
│   ├── Get-ADReport.ps1
│   └── Get-CloudInventory.ps1
│
├── Tests/
│
├── Reports/
│
└── README.md
```

לכל Script:
- Synopsis
- Parameters
- Examples
- Error Handling
- Logging
- Output Objects
- Exit Codes
- Test
- README

זה כבר יכול לשמש כפרויקט Portfolio לראיון.

