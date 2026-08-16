<!-- מדריך PowerShell בעברית | נבנה ללמידה, תרגול והכנה לראיונות -->

# מדריך 02 — קבצים, תהליכים, Services, Registry ו-Event Logs

## מטרת המדריך
להפוך את PowerShell לארגז כלים יומיומי של System Administrator.

## 1. קבצים ותיקיות
```powershell
Get-ChildItem C:\Windows
Get-ChildItem C:\Windows -Directory
Get-ChildItem C:\Windows -File -Recurse -ErrorAction SilentlyContinue
```

יצירה:
```powershell
New-Item C:\Temp\Demo -ItemType Directory -Force
New-Item C:\Temp\Demo\test.txt -ItemType File -Force
```

העתקה והעברה:
```powershell
Copy-Item .\test.txt C:\Temp\Demo\
Move-Item .\test.txt C:\Temp\Demo\
```

מחיקה:
```powershell
Remove-Item C:\Temp\Demo\test.txt -Force
```

## 2. חיפוש קבצים
```powershell
Get-ChildItem C:\Logs -Recurse -File |
    Where-Object Length -gt 10MB |
    Sort-Object Length -Descending
```

חיפוש תוכן:
```powershell
Select-String -Path C:\Logs\*.log -Pattern "ERROR"
```

## 3. תהליכים
```powershell
Get-Process
Get-Process powershell
Get-Process | Sort-Object CPU -Descending | Select-Object -First 10
```

סיום תהליך:
```powershell
Stop-Process -Name notepad -Force
```

ראיון: הסבר למה `Stop-Process -Force` מסוכן יותר מסגירה רגילה.

## 4. Services
```powershell
Get-Service
Get-Service -Name Spooler
Start-Service Spooler
Stop-Service Spooler
Restart-Service Spooler
Set-Service Spooler -StartupType Automatic
```

מציאת שירותים שלא רצים:
```powershell
Get-Service | Where-Object Status -ne 'Running'
```

בדיקת תלות:
```powershell
Get-Service Spooler -DependentServices
Get-Service Spooler -RequiredServices
```

## 5. Registry Provider
PowerShell מאפשר גישה ל-Registry דרך Provider:

```powershell
Get-ChildItem HKLM:\SOFTWARE
Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion"
```

יצירת ערך:
```powershell
New-ItemProperty `
    -Path "HKCU:\Software\Demo" `
    -Name Enabled `
    -PropertyType DWord `
    -Value 1 `
    -Force
```

## 6. Event Logs
```powershell
Get-WinEvent -LogName System -MaxEvents 20
```

שגיאות:
```powershell
Get-WinEvent -FilterHashtable @{
    LogName = 'System'
    Level   = 2
} -MaxEvents 50
```

טווח זמן:
```powershell
$start = (Get-Date).AddHours(-2)

Get-WinEvent -FilterHashtable @{
    LogName   = 'Application'
    StartTime = $start
}
```

## 7. חיפוש לפי Provider
```powershell
Get-WinEvent -ListProvider * | Select-Object -First 20
```

## 8. Export של אירועים
```powershell
Get-WinEvent -FilterHashtable @{
    LogName = 'System'
    Level   = 2
} -MaxEvents 100 |
Export-Csv .\system-errors.csv -NoTypeInformation -Encoding UTF8
```

## 9. בדיקת Disk
```powershell
Get-Volume
Get-PSDrive -PSProvider FileSystem
```

ב-Windows Server:
```powershell
Get-CimInstance Win32_LogicalDisk -Filter "DriveType=3" |
    Select-Object DeviceID,
        @{N='SizeGB';E={[math]::Round($_.Size/1GB,2)}},
        @{N='FreeGB';E={[math]::Round($_.FreeSpace/1GB,2)}},
        @{N='FreePercent';E={[math]::Round($_.FreeSpace/$_.Size*100,1)}}
```

## 10. תרגיל Production
כתוב סקריפט שמאתר:
- דיסקים עם פחות מ-15% פנוי
- Services עצורים שה-StartupType שלהם Automatic
- 20 שגיאות אחרונות ב-System
- 10 תהליכים שצורכים CPU
- 10 תהליכים שצורכים Memory

החזר הכול כ-`PSCustomObject` וייצא ל-CSV.

## שאלות ראיון
1. איך תחקור Service שלא עולה?
2. איך תמצא Event Log רלוונטי?
3. מה ההבדל בין `Get-Process` לבין `Get-CimInstance Win32_Process`?
4. איך תמחק קבצים ישנים בצורה בטוחה?
5. למה `-Recurse -Force` צריך זהירות?

## טיפ חשוב
בפעולות מחיקה/שינוי השתמש קודם ב-WhatIf כאשר ה-Cmdlet תומך בכך:

```powershell
Remove-Item C:\Temp\*.log -WhatIf
```

לאחר אימות:
```powershell
Remove-Item C:\Temp\*.log
```


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



# הרחבה — Windows Administration מהיום-יום

## תרחיש — דיסק מלא

התראה אומרת:

```text
C: 96% Used
```

אל תעשה מיד:

```powershell
Remove-Item C:\Temp\* -Recurse -Force
```

קודם תמדוד.

```powershell
Get-CimInstance Win32_LogicalDisk -Filter "DeviceID='C:'" |
    Select-Object DeviceID,
        @{N='SizeGB';E={[math]::Round($_.Size/1GB,2)}},
        @{N='FreeGB';E={[math]::Round($_.FreeSpace/1GB,2)}}
```

מצא קבצים גדולים:

```powershell
Get-ChildItem C:\Logs -Recurse -File -ErrorAction SilentlyContinue |
    Sort-Object Length -Descending |
    Select-Object -First 30 FullName,
        @{N='SizeMB';E={[math]::Round($_.Length/1MB,2)}}
```

בדוק גם:

```powershell
Get-ChildItem C:\Windows\Temp -Recurse -File -ErrorAction SilentlyContinue
```

### לפני מחיקה

בדוק Retention, Backup, Application requirements ו-Change policy.

## תרחיש — Service נופל

```powershell
Get-Service MyApp
```

עבור ל-CIM:

```powershell
Get-CimInstance Win32_Service -Filter "Name='MyApp'" |
    Select-Object Name,State,StartMode,StartName,PathName
```

עכשיו בדוק Event Log:

```powershell
Get-WinEvent -FilterHashtable @{
    LogName='Application'
    StartTime=(Get-Date).AddHours(-2)
} -MaxEvents 100 |
Where-Object LevelDisplayName -eq 'Error' |
Select-Object TimeCreated,Id,ProviderName,Message
```

רק לאחר שיש תמונה, שקול:

```powershell
Restart-Service MyApp
```

## תרחיש — Process צורך CPU

```powershell
Get-Process |
    Sort-Object CPU -Descending |
    Select-Object -First 10 Name,Id,CPU
```

שאלות שצריך לשאול:

1. האם זה Process תקין?
2. האם ה-CPU גבוה לאורך זמן או רק Spike?
3. האם יש Scheduled Task?
4. האם יש Job?
5. האם Application Log מסביר?
6. האם DB backend עמוס?

## תרחיש — חיפוש ERROR בלוג

```powershell
Select-String `
    -Path C:\Apps\MyApp\Logs\*.log `
    -Pattern 'ERROR','Exception','Failed' `
    -SimpleMatch
```

חיפוש לפי שעה:

```powershell
$start = (Get-Date).AddHours(-1)

Get-ChildItem C:\Apps\MyApp\Logs\*.log |
    Select-String -Pattern 'ERROR'
```

## תרגיל

כתוב פונקציה:

```powershell
Get-WindowsHealth -ComputerName SRV01
```

שתחזיר:

```text
ComputerName
UptimeDays
CFreePercent
TopCPUProcess
TopMemoryProcess
StoppedAutomaticServices
RecentSystemErrors
```

