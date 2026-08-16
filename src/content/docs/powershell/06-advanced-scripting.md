<!-- מדריך PowerShell בעברית | נבנה ללמידה, תרגול והכנה לראיונות -->

# מדריך 06 — PowerShell מתקדם: Functions, Modules, Objects, Classes ו-Pipeline

## 1. פונקציות Advanced
```powershell
function Get-ServerHealth {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory, ValueFromPipeline)]
        [string[]]$ComputerName
    )

    process {
        foreach ($computer in $ComputerName) {
            [pscustomobject]@{
                ComputerName = $computer
                Online = Test-Connection $computer -Count 1 -Quiet
            }
        }
    }
}
```

Pipeline:
```powershell
"SRV01","SRV02" | Get-ServerHealth
```

## 2. Begin / Process / End
```powershell
function Convert-ToReport {
    begin {
        $results = [System.Collections.Generic.List[object]]::new()
    }

    process {
        $results.Add([pscustomobject]@{
            Name = $_
        })
    }

    end {
        $results
    }
}
```

## 3. Parameter sets
```powershell
function Get-Target {
    [CmdletBinding(DefaultParameterSetName='Computer')]
    param(
        [Parameter(Mandatory, ParameterSetName='Computer')]
        [string]$ComputerName,

        [Parameter(Mandatory, ParameterSetName='IP')]
        [ipaddress]$IPAddress
    )
}
```

## 4. Dynamic / calculated properties
```powershell
Get-CimInstance Win32_OperatingSystem |
    Select-Object CSName,
        @{Name='UptimeHours';Expression={
            ((Get-Date) - $_.LastBootUpTime).TotalHours
        }}
```

## 5. Hash tables לעומת PSCustomObject
Hashtable:
```powershell
$config = @{
    Name = "App"
    Port = 443
}
```

Object:
```powershell
$obj = [pscustomobject]@{
    Name = "App"
    Port = 443
}
```

הראשון מתאים מאוד ל-lookup/config. השני מצוין לנתוני Output.

## 6. Modules
מבנה:
```text
MyModule    MyModule.psd1
    MyModule.psm1
    Public    Private```

בדיקה:
```powershell
Get-Module -ListAvailable
Get-Module
Import-Module MyModule
Get-Command -Module MyModule
```

## 7. Module Manifest
```powershell
New-ModuleManifest -Path .\MyModule.psd1
```

## 8. Scope
```powershell
$global:Demo = "Global"
$script:Demo = "Script"
$local:Demo = "Local"
```

טיפ: שימוש מופרז ב-global scope הוא סימן לקוד שקשה לתחזק.

## 9. Classes
```powershell
class ServerResult {
    [string]$ComputerName
    [bool]$Online

    ServerResult([string]$ComputerName, [bool]$Online) {
        $this.ComputerName = $ComputerName
        $this.Online = $Online
    }
}

[ServerResult]::new("SRV01",$true)
```

## 10. .NET
```powershell
[System.IO.Path]::GetExtension("C:\Temp\file.log")
[System.DateTime]::Now
```

## 11. Performance
לא מומלץ:
```powershell
$array = @()
foreach ($item in $items) {
    $array += $item
}
```

עדיף:
```powershell
$list = [System.Collections.Generic.List[object]]::new()

foreach ($item in $items) {
    $list.Add($item)
}
```

## 12. Parallelism ב-PowerShell 7
בגרסאות מתאימות:
```powershell
$servers | ForEach-Object -Parallel {
    Test-Connection $_ -Count 1 -Quiet
} -ThrottleLimit 10
```

שים לב: Parallelism לא תמיד מהיר יותר. אם צוואר הבקבוק הוא DB/API/Network, הגדלת concurrency יכולה דווקא להרע.

## 13. Jobs
```powershell
$job = Start-Job {
    Get-Process
}

Get-Job
Wait-Job $job
Receive-Job $job
Remove-Job $job
```

## שאלות ראיון
1. מה ההבדל בין Function ל-Filter?
2. למה להשתמש ב-Advanced Function?
3. מה זה PipelineBinding?
4. מה זה Scope?
5. מתי להשתמש ב-Job ומתי ב-Parallel?
6. מה ההבדל בין Object ל-Hashtable?
7. איך תבנה Module ארגוני?

## תרגיל מתקדם
בנה Module בשם `Company.ServerTools` עם:
- `Get-ServerHealth`
- `Test-ServerPorts`
- `Get-ServerDisk`
- `Get-ServerEvents`
- Help לכל Function
- Pester tests
- README
- Versioning


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



# הרחבה — Advanced PowerShell מהחיים

## תרחיש — בניית כלי פנימי

במקום 5 Scripts:

```text
check-server.ps1
check-disk.ps1
check-service.ps1
check-port.ps1
check-events.ps1
```

בנה Module:

```text
Company.ServerTools
```

עם:

```powershell
Get-ServerHealth
Get-ServerDisk
Test-ServerPort
Get-ServerEvents
```

ואז Admin חדש לומד 4 פקודות במקום 20 Scripts.

## Advanced Function

```powershell
function Test-ServerPort {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory,ValueFromPipeline)]
        [string[]]$ComputerName,

        [int]$Port = 443
    )

    process {
        foreach ($server in $ComputerName) {
            [pscustomobject]@{
                Server = $server
                Port = $Port
                Open = Test-NetConnection `
                    -ComputerName $server `
                    -Port $Port `
                    -InformationLevel Quiet
            }
        }
    }
}
```

שימוש:

```powershell
'APP01','APP02','APP03' | Test-ServerPort -Port 443
```

## Splatting

תרחיש: Script עם 10 Parameters.

```powershell
$params = @{
    ComputerName = 'SRV01'
    Credential = $cred
    ErrorAction = 'Stop'
    ThrottleLimit = 10
}

Invoke-Command @params -ScriptBlock {
    hostname
}
```

## Performance

מדוד:

```powershell
Measure-Command {
    Get-ADUser -Filter *
}
```

ואז השווה:

```powershell
Measure-Command {
    Get-ADUser -Filter * -Properties Department
}
```

אל תבקש `-Properties *` אם אתה צריך רק שני שדות.

## תרחיש — API גדול

אם API מחזיר 100,000 Objects, עדיף:
- Filter בצד השרת.
- Pagination.
- Cache.
- Batch.
- Retry.
- Throttle.

לא:

```powershell
Get-Everything | Where-Object ...
```

אם אפשר לצמצם כבר ב-API.

## Parallelism

PowerShell 7:

```powershell
$servers | ForEach-Object -Parallel {
    Test-NetConnection $_ -Port 443 -InformationLevel Quiet
} -ThrottleLimit 10
```

אל תבחר `1000` רק כי זה אפשרי. בדוק את צוואר הבקבוק.

## שאלת ראיון

"Script רץ 40 דקות. מה תעשה?"

תשובה טובה:

1. Measure.
2. Identify bottleneck.
3. Check number of network/API calls.
4. Check unnecessary Properties.
5. Check loops.
6. Add server-side filtering.
7. Consider controlled parallelism.
8. Measure again.

