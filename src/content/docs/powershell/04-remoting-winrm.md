---
sidebar_position: 4
title: "מדריך 04 — PowerShell Remoting, WinRM ו-ניהול מרחוק"
---

<!-- מדריך PowerShell בעברית | נבנה ללמידה, תרגול והכנה לראיונות -->

## 1. למה Remoting חשוב?
System Administrator לא אמור להתחבר ידנית לכל שרת. Remoting מאפשר לבצע בדיקות ופעולות על שרתים מרחוק.

## 2. בדיקת WinRM
```powershell
Test-WSMan SERVER01
```

בדיקת פורט:
```powershell
Test-NetConnection SERVER01 -Port 5985
Test-NetConnection SERVER01 -Port 5986
```

## 3. Invoke-Command
```powershell
Invoke-Command -ComputerName SERVER01 -ScriptBlock {
    hostname
    Get-Date
    Get-Service Spooler
}
```

מספר שרתים:
```powershell
$servers = "SRV01","SRV02","SRV03"

Invoke-Command -ComputerName $servers -ScriptBlock {
    [pscustomobject]@{
        ComputerName = $env:COMPUTERNAME
        Uptime = (Get-CimInstance Win32_OperatingSystem).LastBootUpTime
    }
}
```

## 4. משתנים בתוך Remote Script
```powershell
$name = "Spooler"

Invoke-Command -ComputerName SRV01 -ScriptBlock {
    Get-Service -Name $using:name
}
```

## 5. PSSession
```powershell
$session = New-PSSession -ComputerName SRV01

Invoke-Command -Session $session -ScriptBlock {
    Get-ComputerInfo
}

Remove-PSSession $session
```

## 6. העברת קבצים
```powershell
$s = New-PSSession SRV01

Copy-Item .\script.ps1 -Destination C:\Temp\script.ps1 -ToSession $s
Copy-Item C:\Temp\output.log -FromSession $s -Destination .\output.log

Remove-PSSession $s
```

## 7. Credential
```powershell
$cred = Get-Credential

Invoke-Command -ComputerName SRV01 -Credential $cred -ScriptBlock {
    whoami
}
```

## 8. סשן מתמשך
```powershell
$session = New-PSSession -ComputerName SRV01

Invoke-Command -Session $session -ScriptBlock {
    $env:COMPUTERNAME
}

Invoke-Command -Session $session -ScriptBlock {
    Get-Service
}
```

## 9. עבודה עם 100 שרתים
אל תתחיל אוטומטית מ-100 במקביל. השתמש ב-ThrottleLimit כאשר מתאים:

```powershell
Invoke-Command `
    -ComputerName $servers `
    -ThrottleLimit 10 `
    -ScriptBlock {
        Get-CimInstance Win32_OperatingSystem
    }
```

## 10. Error handling
```powershell
Invoke-Command -ComputerName $servers -ErrorAction Stop -ScriptBlock {
    Get-Service Spooler
}
```

אבל אם רוצים להמשיך בין שרתים:

```powershell
foreach ($server in $servers) {
    try {
        Invoke-Command -ComputerName $server -ErrorAction Stop -ScriptBlock {
            hostname
        }
    }
    catch {
        [pscustomobject]@{
            Server = $server
            Error  = $_.Exception.Message
        }
    }
}
```

## 11. JEA
Just Enough Administration מאפשר לצמצם הרשאות ולהגדיר מה מנהל יכול לבצע מרחוק. זה נושא מצוין לראיון מתקדם.

## 12. Troubleshooting
סדר בדיקה מומלץ:
```powershell
Resolve-DnsName SRV01
Test-NetConnection SRV01 -Port 5985
Test-WSMan SRV01
```

אם יש בעיית הרשאות:
```powershell
whoami
whoami /groups
```

## שאלות ראיון
1. מה ההבדל בין `Enter-PSSession` ל-`Invoke-Command`?
2. מתי תשתמש ב-PSSession?
3. מה ההבדל בין 5985 ל-5986?
4. מה זה WinRM?
5. מה הסיכונים של פתיחת Remoting לרשת לא אמינה?
6. איך תנהל 500 שרתים בלי להציף אותם?
7. איך תאסוף תוצאות מכל השרתים גם כשחלקם Offline?

## תרגיל
כתוב סקריפט:
- מקבל CSV עם ServerName
- בודק DNS
- בודק 5985
- מנסה Remoting
- מחזיר Status, Error ו-Time
- מייצא CSV


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



# הרחבה — Remoting בתרחישים של System Administrator

## תרחיש 1 — "אני לא מצליח להתחבר ב-PowerShell"

סדר בדיקות:

```powershell
Resolve-DnsName SRV01
```

```powershell
Test-NetConnection SRV01 -Port 5985
```

```powershell
Test-WSMan SRV01
```

ואז:

```powershell
Invoke-Command SRV01 -ScriptBlock {
    hostname
}
```

כך אתה מפריד:

```text
DNS
 ↓
TCP
 ↓
WinRM
 ↓
Authentication
 ↓
Authorization
 ↓
Command
```

Microsoft ממליצה על גישה שכבתית דומה ב-Troubleshooting של Remoting, כולל בדיקת WinRM, הרשאות, Ports ו-Timeouts. citeturn0search2

## תרחיש 2 — בדיקת 50 שרתים

```powershell
$servers = Get-Content .\servers.txt

$result = Invoke-Command `
    -ComputerName $servers `
    -ThrottleLimit 10 `
    -ErrorAction SilentlyContinue `
    -ScriptBlock {
        [pscustomobject]@{
            Server = $env:COMPUTERNAME
            OS = (Get-CimInstance Win32_OperatingSystem).Caption
            Spooler = (Get-Service Spooler).Status
        }
    }
```

## תרחיש 3 — צריך כמה פעולות על אותו שרת

```powershell
$s = New-PSSession SRV01

Invoke-Command -Session $s -ScriptBlock {
    Get-Date
}

Invoke-Command -Session $s -ScriptBlock {
    Get-Service Spooler
}

Invoke-Command -Session $s -ScriptBlock {
    Get-Volume
}

Remove-PSSession $s
```

## תרחיש 4 — משתנה מקומי בתוך Remote Session

```powershell
$serviceName = 'Spooler'

Invoke-Command SRV01 -ScriptBlock {
    Get-Service $using:serviceName
}
```

`$using:` חשוב מאוד בראיונות.

## תרחיש 5 — Copy Script לשרת

```powershell
$s = New-PSSession SRV01

Copy-Item .\HealthCheck.ps1 `
    -Destination C:\Temp\HealthCheck.ps1 `
    -ToSession $s

Remove-PSSession $s
```

## שאלה לראיון

**למה לא להריץ 500 Commands במקביל?**

כי הבעיה יכולה להיות לא ה-Client אלא WinRM, DC, Network, API או השרתים עצמם. משתמשים ב-Throttle/Batching ובודקים עומס.

