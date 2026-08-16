<!-- מדריך PowerShell בעברית | נבנה ללמידה, תרגול והכנה לראיונות -->

# מדריך 01 — PowerShell מהבסיס עד עבודה מקצועית

## למי המדריך מתאים?
למי שרוצה לעבור מעבודה ידנית ב-Windows Server לעבודה אוטומטית, חוזרת ומתועדת. המטרה אינה לזכור מאות פקודות, אלא להבין איך למצוא פקודה, איך להבין אובייקט, איך לחבר פקודות ב-Pipeline ואיך לכתוב סקריפט שאפשר להפעיל בבטחה.

## 1. מה זה PowerShell?
PowerShell הוא גם shell וגם שפת סקריפטים. בניגוד ל-CMD, הוא עובד בראש ובראשונה עם אובייקטים ולא רק עם טקסט. לכן אפשר להעביר אובייקט מפקודה אחת לאחרת בלי לפרק פלט טקסט.

```powershell
Get-Process
Get-Service
Get-ComputerInfo
```

בדיקת גרסה:

```powershell
$PSVersionTable
$PSVersionTable.PSVersion
```

## 2. PowerShell 5.1 לעומת PowerShell 7
בסביבת Windows ארגונית עדיין תפגוש הרבה PowerShell 5.1, במיוחד במודולים ישנים ובשרתים. PowerShell 7 הוא מודרני ורב-פלטפורמי.

בדוק תמיד מה באמת רץ:

```powershell
$PSVersionTable.PSEdition
$PSVersionTable.PSVersion
```

טיפ ראיון: אל תגיד ש-"PowerShell 7 מחליף תמיד את 5.1". תשובה טובה יותר: "אני בודק תאימות מודולים, Cmdlets, Authentication ודרישות האפליקציה לפני מעבר."

## 3. גילוי פקודות
ארבע הפקודות החשובות ביותר ללמידה עצמאית:

```powershell
Get-Command
Get-Help
Get-Member
Get-Verb
```

דוגמאות:

```powershell
Get-Command *Service*
Get-Command -Verb Get
Get-Help Get-Service
Get-Help Get-Service -Examples
Get-Help Get-Service -Detailed
Get-Help Get-Service -Full
```

חיפוש לפי noun:

```powershell
Get-Command -Noun Process
```

## 4. Pipeline
ה-Pipeline הוא אחד הדברים החשובים ביותר ב-PowerShell.

```powershell
Get-Service | Where-Object Status -eq 'Running'
```

עוד דוגמה:

```powershell
Get-Process |
    Sort-Object CPU -Descending |
    Select-Object -First 10 Name, Id, CPU
```

## 5. להבין אובייקטים
במקום לנחש שמות Properties:

```powershell
Get-Service | Get-Member
```

או:

```powershell
$service = Get-Service -Name Spooler
$service | Get-Member
```

לאחר שמצאת Property:

```powershell
$service.Status
$service.DisplayName
$service.Name
```

## 6. Select-Object, Where-Object, Sort-Object
```powershell
Get-Service |
    Where-Object Status -eq 'Stopped' |
    Sort-Object DisplayName |
    Select-Object Name, DisplayName, Status
```

## 7. משתנים
```powershell
$name = "Server01"
$count = 10
$servers = @("SRV01","SRV02","SRV03")
```

בדיקה:

```powershell
$name.GetType().FullName
$servers.GetType().FullName
```

## 8. מערכים ו-Hashtable
```powershell
$users = @("alice","bob","charlie")

$config = @{
    Server = "SRV01"
    Port   = 443
    Enabled = $true
}

$config.Server
$config["Port"]
```

## 9. תנאים
```powershell
if ($service.Status -eq 'Running') {
    "השירות פעיל"
}
elseif ($service.Status -eq 'Stopped') {
    "השירות עצור"
}
else {
    "מצב אחר"
}
```

## 10. לולאות
```powershell
foreach ($server in $servers) {
    Write-Host "בודק $server"
}
```

Pipeline:

```powershell
$servers | ForEach-Object {
    Test-Connection -ComputerName $_ -Count 1 -Quiet
}
```

## 11. פונקציות
```powershell
function Test-ServerOnline {
    param(
        [Parameter(Mandatory)]
        [string]$ComputerName
    )

    Test-Connection -ComputerName $ComputerName -Count 1 -Quiet
}

Test-ServerOnline -ComputerName SRV01
```

## 12. פרמטרים טובים
במקום להקשיח ערכים בתוך סקריפט:

```powershell
param(
    [Parameter(Mandatory)]
    [string]$ComputerName,

    [int]$TimeoutSeconds = 5
)
```

## 13. Help ו-Comment-Based Help
```powershell
function Get-ServerHealth {
<#
.SYNOPSIS
בודק זמינות בסיסית של שרת.

.PARAMETER ComputerName
שם השרת.

.EXAMPLE
Get-ServerHealth -ComputerName SRV01
#>
    param(
        [Parameter(Mandatory)]
        [string]$ComputerName
    )

    [pscustomobject]@{
        ComputerName = $ComputerName
        Online       = Test-Connection $ComputerName -Count 1 -Quiet
    }
}
```

## 14. יצירת Object מסודר
```powershell
[pscustomobject]@{
    Server = $env:COMPUTERNAME
    Time   = Get-Date
    User   = $env:USERNAME
}
```

## 15. CSV / JSON
```powershell
Get-Service | Export-Csv .\services.csv -NoTypeInformation -Encoding UTF8
Import-Csv .\services.csv

Get-ComputerInfo | ConvertTo-Json -Depth 3 | Set-Content .\computer.json -Encoding UTF8
```

## 16. עבודה עם קבצים
```powershell
Get-ChildItem C:\Temp
Get-ChildItem C:\Temp -File -Recurse
Get-ChildItem C:\Temp -Filter *.log
Get-Content C:\Temp\app.log -Tail 100
Set-Content C:\Temp\test.txt "Hello"
Add-Content C:\Temp\test.txt "Second line"
```

## 17. Regex בסיסי
```powershell
"server01" -match '^server\d+$'
"Admin@example.com" -match '^[^@]+@[^@]+\.[^@]+$'
```

## 18. תרגיל
בנה סקריפט שמקבל רשימת שרתים ומחזיר:
- שם שרת
- Ping
- גרסת Windows
- זמן אתחול
- נפח דיסק פנוי
- מצב השירות Windows Update

## שאלות ראיון
### שאלה: מה ההבדל בין `Where-Object` לבין `Select-Object`?
`Where-Object` מסנן אובייקטים. `Select-Object` בוחר או יוצר Properties.

### שאלה: למה `Get-Member` חשוב?
כי הוא מאפשר לראות את סוג האובייקט, ה-Properties וה-Methods במקום לנחש.

### שאלה: מה היתרון של Pipeline?
אפשר להעביר אובייקטים בין פקודות ולבצע עיבוד מדורג.

### שאלה: מה ההבדל בין `$null`, מחרוזת ריקה ו-`$false`?
אלה ערכים שונים. צריך להכיר את סוג הנתון ואת ההתנהגות שלהם בתנאים.

## טיפים וטריקים
1. השתמש ב-Tab Completion.
2. השתמש ב-`Get-Help -Examples`.
3. אל תעשה `Format-Table` באמצע Pipeline שאתה רוצה להמשיך לעבד.
4. שמור נתונים כאובייקטים עד שלב התצוגה.
5. השתמש ב-`[pscustomobject]` לדוחות.
6. העדף `-Filter` של Cmdlet כאשר קיים, במיוחד בחיפושים גדולים.
7. בדוק `$ErrorActionPreference` ואל תסתיר שגיאות בלי סיבה.
8. אל תכניס סיסמאות בתוך `.ps1`.


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



# הרחבה — עבודה מהיום-יום של System Administrator

## תרחיש 1 — "השרת איטי"

כשמקבלים טלפון על שרת איטי, אל תתחיל מיד ב-Restart.

### שלב 1 — מי השרת ומה השעה?

```powershell
hostname
Get-Date
$env:COMPUTERNAME
$env:USERNAME
```

### שלב 2 — CPU

```powershell
Get-Process |
    Sort-Object CPU -Descending |
    Select-Object -First 10 Name,Id,CPU
```

### שלב 3 — Memory

```powershell
Get-Process |
    Sort-Object WorkingSet64 -Descending |
    Select-Object -First 10 Name,Id,
        @{N='MemoryGB';E={[math]::Round($_.WorkingSet64/1GB,2)}}
```

### שלב 4 — Disk

```powershell
Get-CimInstance Win32_LogicalDisk -Filter "DriveType=3" |
    Select-Object DeviceID,
        @{N='SizeGB';E={[math]::Round($_.Size/1GB,2)}},
        @{N='FreeGB';E={[math]::Round($_.FreeSpace/1GB,2)}},
        @{N='FreePercent';E={[math]::Round($_.FreeSpace/$_.Size*100,1)}}
```

### שלב 5 — Event Logs

```powershell
Get-WinEvent -FilterHashtable @{
    LogName='System'
    Level=2
} -MaxEvents 30 |
Select-Object TimeCreated,Id,ProviderName,Message
```

המטרה היא להגיע ל-Root Cause ולא רק "לעשות משהו".

## תרחיש 2 — "תן לי את כל ה-Services שלא רצים"

```powershell
Get-CimInstance Win32_Service |
    Where-Object {
        $_.StartMode -eq 'Auto' -and $_.State -ne 'Running'
    } |
    Select-Object Name,DisplayName,State,StartMode,StartName
```

שדרוג:

```powershell
$result = Get-CimInstance Win32_Service |
    Where-Object {
        $_.StartMode -eq 'Auto' -and $_.State -ne 'Running'
    } |
    Select-Object PSComputerName,Name,DisplayName,State,StartMode

$result | Export-Csv C:\Reports\StoppedAutoServices.csv -NoTypeInformation
```

## תרחיש 3 — "יש לי 30 שרתים"

```powershell
$servers = Get-Content C:\Scripts\servers.txt

foreach ($server in $servers) {
    [pscustomobject]@{
        Server = $server
        Online = Test-Connection $server -Count 1 -Quiet
    }
}
```

אחר כך:

```powershell
$result |
    Sort-Object Online,Server |
    Export-Csv C:\Reports\ServerAvailability.csv -NoTypeInformation
```

## טיפ חשוב

אל תנסה לזכור כל Cmdlet. זכור את תהליך העבודה:

```text
Get-Command
   ↓
Get-Help
   ↓
Get-Member
   ↓
Test
   ↓
Script
   ↓
Log
   ↓
Report
```

## תרגיל מעשי

בנה `Get-MorningHealth.ps1` שמקבל:

```powershell
param(
    [string[]]$ComputerName
)
```

ומחזיר:

- Server
- Ping
- OS
- LastBoot
- DiskFreePercent
- Spooler
- WinRM
- Error

---

# הרחבה לראיון

**מראיין:** "איך אתה מתחיל ללמוד Cmdlet שאתה לא מכיר?"

**תשובה טובה:**

> אני משתמש ב-Get-Command כדי למצוא Cmdlet מתאים, Get-Help עם Examples כדי להבין שימוש, Get-Member כדי להבין את האובייקט, ואז בודק בסביבת Test לפני שאני מכניס את זה לסקריפט Production.

