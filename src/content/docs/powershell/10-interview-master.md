---
sidebar_position: 10
title: "מדריך 10 — מאגר שאלות ראיון PowerShell ל-System / Cloud Administrator"
description: "מאגר מקיף של שאלות ותשובות לראיון עבודה - בסיס, Remoting, Error Handling, AD, ענן ותרחישי Troubleshooting אמיתיים, כולל Cheat Sheet לפקודות."
---

<!-- מדריך PowerShell בעברית | נבנה ללמידה, תרגול והכנה לראיונות -->

## איך להשתמש במדריך
מומלץ לענות בקול. תשובה טובה בראיון אינה רק "הפקודה היא X". מנהל מערכות רוצה לשמוע גם:
- למה בחרת בפקודה?
- מה הסיכון?
- איך תבדוק לפני שינוי?
- איך תטפל בשגיאה?
- איך תתעד?
- איך תבצע Rollback?

# חלק א — שאלות בסיס

<details class="qa">
<summary>1. מה זה PowerShell?</summary>

PowerShell הוא shell ושפת scripting לאוטומציה וניהול. הוא עובד עם Objects ולכן Pipeline יכול להעביר מידע מובנה בין פקודות.

</details>

<details class="qa">
<summary>2. מה זה Cmdlet?</summary>

פקודה ייעודית של PowerShell, בדרך כלל בשם Verb-Noun, לדוגמה:
```powershell
Get-Service
Get-Process
Get-ADUser
```

</details>

<details class="qa">
<summary>3. מה עושה Get-Member?</summary>

```powershell
Get-Process | Get-Member
```
מציג Type, Properties, Methods ועוד.

</details>

<details class="qa">
<summary>4. מה עושה Get-Help?</summary>

```powershell
Get-Help Get-Service -Examples
```

</details>

<details class="qa">
<summary>5. Pipeline</summary>

```powershell
Get-Service |
    Where-Object Status -eq 'Running' |
    Select-Object Name,Status
```

</details>

# חלק ב — שאלות ביניים

<details class="qa">
<summary>6. <code>ForEach-Object</code> מול <code>foreach</code></summary>

`foreach` הוא מבנה שפה. `ForEach-Object` הוא Cmdlet שעובד מצוין עם Pipeline. ההבדלים חשובים בביצועים ובאופן הזרמת הנתונים.

</details>

<details class="qa">
<summary>7. <code>Where-Object</code> מול <code>Filter</code></summary>

`Where-Object` מסנן לאחר קבלת האובייקטים. כאשר Cmdlet תומך בשרת-side/provider-side filtering, לעיתים עדיף להשתמש בפרמטר Filter כדי להפחית נתונים שהוחזרו.

</details>

<details class="qa">
<summary>8. למה לא להשתמש ב-Format-Table לפני Export-Csv?</summary>

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

</details>

<details class="qa">
<summary>9. מה זה <code>[PSCustomObject]</code>?</summary>

דרך נוחה ליצור Object עם Properties מוגדרים:
```powershell
[pscustomobject]@{
    Server = "SRV01"
    Status = "OK"
}
```

</details>

# חלק ג — שאלות System Administrator

<details class="qa">
<summary>10. שרת לא מגיב. מה תבדוק?</summary>

```powershell
Test-Connection SRV01 -Count 2
Test-NetConnection SRV01 -Port 3389
Test-WSMan SRV01
Resolve-DnsName SRV01
```
לאחר מכן: Hypervisor/Cloud, firewall, event logs, services, application.

</details>

<details class="qa">
<summary>11. Service לא עולה</summary>

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

</details>

<details class="qa">
<summary>12. Disk מלא</summary>

```powershell
Get-CimInstance Win32_LogicalDisk -Filter "DriveType=3"
```
ואז:
```powershell
Get-ChildItem C:\ -Recurse -File -ErrorAction SilentlyContinue |
    Sort-Object Length -Descending |
    Select-Object -First 20 FullName,Length
```

</details>

<details class="qa">
<summary>13. משתמש לא מצליח להתחבר ל-AD</summary>

בדוק:
```powershell
Get-ADUser username -Properties *
Search-ADAccount -LockedOut
```
לאחר מכן DNS, זמן, DC, replication ו-logs.

</details>

# חלק ד — שאלות PowerShell מתקדמות

<details class="qa">
<summary>14. מה זה Scope?</summary>

Scope קובע היכן משתנה/פונקציה זמינים.

</details>

<details class="qa">
<summary>15. מה זה Splatting?</summary>

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

</details>

<details class="qa">
<summary>16. מה זה Advanced Function?</summary>

פונקציה שמשתמשת ב-`[CmdletBinding()]` ויכולה לקבל common parameters, pipeline binding ועוד.

</details>

<details class="qa">
<summary>17. WhatIf</summary>

```powershell
Remove-Item C:\Temp\*.log -WhatIf
```
מטרתו לבדוק מה היה מתבצע לפני שינוי אמיתי.

</details>

<details class="qa">
<summary>18. ErrorAction Stop</summary>

```powershell
try {
    Get-Item C:\missing.txt -ErrorAction Stop
}
catch {
    $_.Exception.Message
}
```

</details>

# חלק ה — תרחישי ראיון

<details class="qa">
<summary>19. "כתוב סקריפט שמוצא שרתים עם פחות מ-10% Disk"</summary>

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

</details>

<details class="qa">
<summary>20. "איך תנהל 500 שרתים?"</summary>

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

</details>

<details class="qa">
<summary>21. "סקריפט רץ 30 דקות. מה תעשה?"</summary>

לא מתחילים באופטימיזציה אקראית.
1. Measure.
2. Identify bottleneck.
3. Count API calls.
4. Check unnecessary loops.
5. Replace repeated lookups with cache.
6. Use server-side filters.
7. Consider controlled parallelism.
8. Measure again.

</details>

<details class="qa">
<summary>22. "איך תשמור סודות?"</summary>

לא בקוד. השתמש במנגנון secret מתאים: SecretManagement, Key Vault, managed identity, IAM role או פתרון ארגוני אחר.

</details>

# חלק ו — שאלות Trick

<details class="qa">
<summary>23. למה <code>Write-Host</code> בעייתי בדוחות?</summary>

`Write-Host` מיועד לתצוגה למשתמש ולא לזרימת נתונים. אם רוצים להעביר נתונים ל-Pipeline, החזר Object.

</details>

<details class="qa">
<summary>24. למה <code>Format-Table</code> לא מתאים לאוטומציה?</summary>

כי הוא שכבת תצוגה.

</details>

<details class="qa">
<summary>25. למה <code>+=</code> יכול להיות איטי?</summary>

במערכים הוא עלול לגרום ליצירה/העתקה חוזרת. עבור כמויות גדולות שקול List.

</details>

<details class="qa">
<summary>26. האם Ping מצליח אומר שהשרת תקין?</summary>

לא. Ping בודק ICMP. אפליקציה יכולה להיות down בעוד Ping תקין.

</details>

<details class="qa">
<summary>27. האם Port 443 פתוח אומר שהאתר עובד?</summary>

לא. צריך HTTP/TLS/Application validation.

</details>

# חלק ז — שאלות Cloud

<details class="qa">
<summary>28. איך תבצע Cloud Inventory?</summary>

להתחבר באמצעות מודול/API, לשלוף משאבים, לבחור Properties, לייצא ל-CSV/JSON ולשמור Timestamp.

</details>

<details class="qa">
<summary>29. איך תמנע מחיקה של Production?</summary>

Tags/Resource Groups/Scopes, deny policies כאשר מתאים, Allow-list, WhatIf, approval ו-RBAC.

</details>

<details class="qa">
<summary>30. איך תבנה Automation בטוח?</summary>

- Least privilege
- Input validation
- Dry run
- Logging
- Retry
- Idempotency
- Alerting
- Rollback
- Secrets management

</details>

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

<details class="qa">
<summary>1. מה ההבדל בין PowerShell 5.1 ל-7?</summary>

5.1 הוא Windows PowerShell, מבוסס .NET Framework, מגיע מובנה בחלונות ונשאר לתאימות עם מודולים ישנים. 7 הוא PowerShell (Core), מבוסס .NET, חוצה-פלטפורמות ומתעדכן — עם אופרטורים כמו `??` ו-`?:`, `ForEach-Object -Parallel`, טיפול שגיאות משופר ו-`Test-Json`. בפועל מתקינים את 7 לצד 5.1 ומשתמשים ב-`-UseWindowsPowerShell` למודולים שעדיין לא נתמכים.

</details>

<details class="qa">
<summary>2. מהו Pipeline?</summary>

מנגנון שמעביר **אובייקטים** (ולא טקסט) מ-cmdlet אחד לשני, כך ש-`Get-Service | Where-Object Status -eq "Running" | Select-Object Name` עובד על מאפיינים אמיתיים. זה ההבדל המהותי מ-shell קלאסי, שבו כל שלב מפרסר מחדש מחרוזות.

</details>

<details class="qa">
<summary>3. מה עושה Get-Member?</summary>

מציג את הטיפוס של האובייקט ואת כל ה-Properties וה-Methods שלו — `Get-Process | Get-Member`. זה הכלי הראשון כשלא יודעים "מה יש בידיים", ובזכותו יודעים לפי איזה שדה לסנן או למיין במקום לנחש.

</details>

<details class="qa">
<summary>4. מה ההבדל בין Where ל-Select?</summary>

`Where-Object` מסנן **שורות** — אילו אובייקטים ימשיכו בצינור. `Select-Object` בוחר **עמודות** (Properties) או מגביל כמות (`-First`, `-Last`, `-Unique`). בקיצור: Where = אילו אובייקטים, Select = אילו שדות.

</details>

<details class="qa">
<summary>5. למה לא עושים Format-Table לפני Export?</summary>

כי `Format-*` הופך אובייקטים לאובייקטי עיצוב (formatting records), ולכן `Export-Csv` יקבל שדות כמו `ClassId2e4f51ef...` במקום הנתונים. הכלל: `Format-*` תמיד אחרון, ורק לצפייה במסך.

</details>

<details class="qa">
<summary>6. מהו PSCustomObject?</summary>

אובייקט שאתם בונים בעצמכם עם שדות מוגדרים:

```powershell
[PSCustomObject]@{ Server = $name; Status = $status; CheckedAt = Get-Date }
```

כך הפלט של הסקריפט הוא נתונים מובנים שאפשר למיין, לסנן ולייצא ל-CSV — במקום מחרוזות טקסט שצריך לפרסר.

</details>

<details class="qa">
<summary>7. מהו Splatting?</summary>

העברת פרמטרים ל-cmdlet דרך hashtable במקום שורה ארוכה:

```powershell
$params = @{ Name = "Spooler"; ComputerName = $srv; ErrorAction = "Stop" }
Get-Service @params
```

זה מקצר שורות, מאפשר לבנות פרמטרים לפי תנאי, ומשפר מאוד את קריאות הקוד.

</details>

<details class="qa">
<summary>8. מהו Advanced Function?</summary>

פונקציה שמתנהגת כמו cmdlet אמיתי: מכריזה `[CmdletBinding()]`, מקבלת פרמטרים עם ולידציה, תומכת ב-`-Verbose`, `-WhatIf` ו-`-Confirm` (דרך `SupportsShouldProcess`), ויכולה לקבל קלט מה-Pipeline. זה ההבדל בין סקריפט אישי לכלי שאפשר לתת לצוות.

</details>

<details class="qa">
<summary>9. מה זה Scope?</summary>

תחום החיים של משתנה — `Global`, `Script`, `Local` ו-`Private`. משתנה שנוצר בתוך פונקציה אינו קיים מחוצה לה, ושינוי של משתנה חיצוני מתוך פונקציה דורש הפניה מפורשת (`$script:x`). הבנה של Scope מונעת באגים שבהם "המשתנה פתאום ריק".

</details>

<details class="qa">
<summary>10. מה ההבדל בין try/catch ל-ErrorAction?</summary>

`-ErrorAction` קובע איך ה-cmdlet מגיב לשגיאה (`Continue`, `SilentlyContinue`, `Stop`), ו-`try/catch` תופס שגיאות **מפסיקות** בלבד. לכן הצירוף הנכון הוא `-ErrorAction Stop` בתוך `try` — בלעדיו שגיאה לא-מפסיקה תדלג על ה-`catch` והקוד ימשיך כאילו הכול תקין.

</details>

<details class="qa">
<summary>11. מה זה Remoting?</summary>

הרצת פקודות PowerShell על מחשבים מרוחקים דרך WinRM — `Invoke-Command` להרצה מקבילה על שרתים רבים, `Enter-PSSession` לעבודה אינטראקטיבית. התוצאות חוזרות כאובייקטים, כך שאפשר לעבד אותן מקומית.

</details>

<details class="qa">
<summary>12. מה זה WinRM?</summary>

השירות שמממש את פרוטוקול WS-Management ומאפשר את ה-Remoting. הוא מאזין ב-5985 (HTTP) או 5986 (HTTPS), מבצע אימות מול הדומיין, ומופעל עם `Enable-PSRemoting`. בדיקת זמינות מהירה: `Test-WSMan <server>`.

</details>

<details class="qa">
<summary>13. איך תחקור DNS?</summary>

מתחילים ב-`Resolve-DnsName <name>` ומשווים מול שרת ספציפי עם `-Server`, בודקים את הגדרות הלקוח (`Get-DnsClientServerAddress`) ומנקים cache (`Clear-DnsClientCache`) כדי לשלול תוצאה ישנה. בצד השרת בודקים את הרשומה עצמה ואת ה-Forwarders.

</details>

<details class="qa">
<summary>14. איך תחקור Port?</summary>

`Test-NetConnection <host> -Port 443` נותן גם מענה ICMP, גם בדיקת TCP וגם את המסלול. אם הפורט סגור בודקים מי מאזין בצד השרת (`Get-NetTCPConnection -State Listen`), את חוקי ה-Firewall ואת הנתיב ברשת.

</details>

<details class="qa">
<summary>15. איך תחקור Service?</summary>

`Get-Service` למצב, `Get-CimInstance Win32_Service` לחשבון ההרצה ול-StartMode, ולוג המערכת (`Get-WinEvent`) לסיבת הכשל. אחר כך בודקים תלות בשירותים אחרים, הרשאות לנתיב והאם סיסמת חשבון השירות פגה.

</details>

<details class="qa">
<summary>16. איך תחקור AD Replication?</summary>

מריצים `repadmin /replsummary` ו-`repadmin /showrepl` לאיתור שותפי רפליקציה כושלים, או `Get-ADReplicationFailure` ו-`Get-ADReplicationPartnerMetadata` ב-PowerShell. במקביל בודקים DNS, סנכרון שעון (Kerberos רגיש להפרש זמנים) וקישוריות בין האתרים.

</details>

<details class="qa">
<summary>17. איך תעשה Bulk Change בטוח?</summary>

קודם שולפים ושומרים את הרשימה המדויקת שעליה עובדים, מריצים עם `-WhatIf` ובודקים את הפלט, מבצעים על קבוצת פיילוט קטנה, מתעדים ללוג כל שינוי ושומרים snapshot של המצב הקודם לצורך rollback — ורק אז מריצים על כולם, רצוי באצוות.

</details>

<details class="qa">
<summary>18. איך תשמור Secrets?</summary>

לא בקוד ולא ב-Git. בתחנה מקומית: מודול `SecretManagement` עם `SecretStore`. בארגון: Azure Key Vault / AWS Secrets Manager. באוטומציה בענן: Managed Identity בלי סוד כלל. ב-CI: secrets של מערכת ה-CI, ותמיד עם `no_log`/הסתרה כדי שלא יודפסו ללוג.

</details>

<details class="qa">
<summary>19. איך תבצע Cloud Inventory?</summary>

שולפים דרך ה-API של הספק — למשל `Search-AzGraph` ב-Azure או `Get-EC2Instance`/AWS Tools ב-AWS — עוברים על כל ה-subscriptions/accounts, בונים `[PSCustomObject]` אחיד עם השדות החשובים (שם, סוג, אזור, tags, בעלים) ומייצאים ל-CSV. מתזמנים ריצה קבועה כדי לעקוב אחרי שינויים ולזהות משאבים יתומים.

</details>

<details class="qa">
<summary>20. איך תהפוך Script לכלי Production?</summary>

הופכים אותו ל-Advanced Function עם פרמטרים וולידציה, מוסיפים `SupportsShouldProcess` (`-WhatIf`), טיפול שגיאות עם `try/catch` ו-`-ErrorAction Stop`, לוגים ו-Exit Codes ברורים, `Write-Verbose` במקום `Write-Host`, תיעוד `Get-Help` ובדיקות (Pester) — ורק אז מכניסים לתזמון או לפייפליין.

</details>

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

