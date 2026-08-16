---
sidebar_position: 5
title: "מדריך 05 — Error Handling, Debugging, Logging וכתיבת סקריפטים Production"
---

<!-- מדריך PowerShell בעברית | נבנה ללמידה, תרגול והכנה לראיונות -->

## 1. למה שגיאות הן חלק מהקוד?
סקריפט Production צריך להניח שדברים ייכשלו:
- שרת לא זמין
- הרשאה חסרה
- קובץ לא קיים
- API מחזיר שגיאה
- Module לא מותקן
- Timeout
- נתון לא תקין

## 2. try/catch/finally
```powershell
try {
    Get-Item C:\DoesNotExist.txt -ErrorAction Stop
}
catch {
    Write-Error "הפעולה נכשלה: $($_.Exception.Message)"
}
finally {
    Write-Verbose "סיום"
}
```

## 3. ErrorAction
```powershell
Get-Service UnknownService -ErrorAction SilentlyContinue
```

אפשרויות נפוצות:
- Continue
- SilentlyContinue
- Stop
- Ignore
- Inquire

ב-Production, אם רוצים לתפוס שגיאה ב-catch, בדרך כלל צריך `-ErrorAction Stop` בפעולה הרלוונטית.

## 4. `$Error`
```powershell
$Error[0]
$Error[0].Exception
$Error.Count
```

## 5. Logging
```powershell
$log = "C:\Logs\script.log"

"$(Get-Date -Format s) START" | Add-Content $log
"$(Get-Date -Format s) Checking server" | Add-Content $log
```

פונקציה:

```powershell
function Write-Log {
    param(
        [string]$Message,
        [ValidateSet('INFO','WARN','ERROR')]
        [string]$Level = 'INFO'
    )

    $line = "{0} [{1}] {2}" -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'), $Level, $Message
    Add-Content -Path $log -Value $line
}
```

## 6. Start-Transcript
```powershell
Start-Transcript -Path C:\Logs\session.txt

# פעולות

Stop-Transcript
```

## 7. Set-StrictMode
```powershell
Set-StrictMode -Version Latest
```

זה עוזר לזהות טעויות כמו שימוש במשתנה שלא הוגדר או גישה בעייתית לאובייקט.

## 8. בדיקות קלט
```powershell
param(
    [Parameter(Mandatory)]
    [ValidateNotNullOrEmpty()]
    [string]$ComputerName
)
```

עוד:
```powershell
[ValidateSet('Start','Stop','Restart')]
[string]$Action
```

## 9. Return codes
בסקריפטים שמשולבים עם Scheduler/Automation חשוב להחזיר קוד יציאה מתאים:

```powershell
if ($success) {
    exit 0
}
else {
    exit 1
}
```

## 10. WhatIf / ShouldProcess
לפעולות מסוכנות כדאי לתכנן תמיכה ב-WhatIf:

```powershell
function Remove-DemoFile {
    [CmdletBinding(SupportsShouldProcess)]
    param(
        [Parameter(Mandatory)]
        [string]$Path
    )

    if ($PSCmdlet.ShouldProcess($Path, "מחיקה")) {
        Remove-Item $Path -Force
    }
}
```

שימוש:
```powershell
Remove-DemoFile -Path C:\Temp\old.log -WhatIf
```

## 11. Debugging
אפשר להשתמש ב:
```powershell
Set-PSBreakpoint -Command Get-Service
Get-PSBreakpoint
Remove-PSBreakpoint *
```

וגם ב-VS Code עם הרחבת PowerShell.

## 12. Pester
בדיקות יחידה:

```powershell
Describe "Get-ServerHealth" {
    It "מחזיר ComputerName" {
        $result = Get-ServerHealth -ComputerName SRV01
        $result.ComputerName | Should -Be "SRV01"
    }
}
```

## 13. שאלות ראיון
### למה `-ErrorAction Stop` חשוב?
כי לא כל שגיאה היא terminating error. כדי ש-`catch` יתפוס שגיאה מסוימת צריך לעיתים להפוך אותה ל-terminating error.

### איך תכתוב סקריפט בטוח?
- Validation
- Logging
- Error handling
- WhatIf
- Least privilege
- Idempotency
- Exit codes
- Tests
- Documentation

## 14. Idempotency
סקריפט אידמפוטנטי יכול לרוץ שוב בלי לגרום נזק או לשנות שוב ושוב משהו שכבר תקין.

דוגמה:
```powershell
if ((Get-Service Spooler).StartType -ne 'Automatic') {
    Set-Service Spooler -StartupType Automatic
}
```

## תרגיל
כתוב Script שמתקין/מגדיר Service:
- אם לא קיים — דיווח
- אם קיים — בדיקה
- אם StartupType לא נכון — שינוי
- אם לא רץ — Start
- בכל שלב Logging
- במקרה כשל — Error ברור
- `-WhatIf` לפני שינוי


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



# הרחבה — Error Handling כמו בסביבת Production

## תרחיש — 100 שרתים, 7 לא זמינים

סקריפט לא צריך להפסיק בגלל שרת אחד.

```powershell
$results = foreach ($server in $servers) {
    try {
        $os = Invoke-Command $server -ErrorAction Stop -ScriptBlock {
            Get-CimInstance Win32_OperatingSystem
        }

        [pscustomobject]@{
            Server = $server
            Status = 'OK'
            OS = $os.Caption
            Error = $null
        }
    }
    catch {
        [pscustomobject]@{
            Server = $server
            Status = 'FAILED'
            OS = $null
            Error = $_.Exception.Message
        }
    }
}
```

כך בסוף אתה מקבל גם Success וגם Failure.

## תרחיש — למה catch לא עובד?

```powershell
try {
    Get-Item C:\DoesNotExist.txt
}
catch {
    "Caught"
}
```

אם השגיאה אינה Terminating, ייתכן שה-`catch` לא יתבצע.

לכן:

```powershell
try {
    Get-Item C:\DoesNotExist.txt -ErrorAction Stop
}
catch {
    "Caught: $($_.Exception.Message)"
}
```

Microsoft מתעדת את ההבדל בין Non-terminating ו-Terminating errors ואת התפקיד של `-ErrorAction Stop`. citeturn0search1

## Logging

```powershell
$log = "C:\Logs\script.log"

function Write-Log {
    param(
        [string]$Message,
        [string]$Level = 'INFO'
    )

    $line = "{0} [{1}] {2}" -f `
        (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'),
        $Level,
        $Message

    Add-Content -Path $log -Value $line
}
```

## תרחיש — Scheduled Task

אם הסקריפט רץ כל לילה ב-02:00, אתה חייב לדעת:

```text
מתי התחיל?
מה עשה?
על איזה שרת נכשל?
מה הייתה השגיאה?
כמה זמן לקח?
מה היה Exit Code?
```

לכן:

```powershell
Start-Transcript -Path C:\Logs\Nightly.txt
```

או Logger מסודר.

## Exit Codes

```powershell
if ($failed -eq 0) {
    exit 0
}

exit 1
```

כך Scheduler/Monitoring יכול לדעת שהסקריפט נכשל.

## תרגיל

כתוב סקריפט שמבצע פעולה על 20 שרתים ומייצר:

```text
Results.csv
Errors.csv
Execution.log
```

