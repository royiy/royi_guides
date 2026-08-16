<!-- מדריך PowerShell בעברית | נבנה ללמידה, תרגול והכנה לראיונות -->

# מדריך 03 — Active Directory, Domain Controllers ומשתמשים

## מטרת המדריך
PowerShell עבור System Administrator בסביבת Active Directory.

> הערה: יש להתקין את RSAT / ActiveDirectory module בסביבה שבה משתמשים בפקודות AD.

## 1. טעינת המודול
```powershell
Import-Module ActiveDirectory
Get-Command -Module ActiveDirectory
```

## 2. משתמשים
```powershell
Get-ADUser -Filter *
Get-ADUser -Identity royi
Get-ADUser -Identity royi -Properties *
```

משתמשים פעילים:
```powershell
Get-ADUser -Filter 'Enabled -eq $true' |
    Select-Object Name, SamAccountName
```

משתמשים עם PasswordNeverExpires:
```powershell
Get-ADUser -Filter * -Properties PasswordNeverExpires |
    Where-Object PasswordNeverExpires
```

## 3. יצירת משתמש
```powershell
New-ADUser `
    -Name "Test User" `
    -SamAccountName "test.user" `
    -UserPrincipalName "test.user@example.local" `
    -Path "OU=Users,DC=example,DC=local" `
    -Enabled $false
```

אחרי יצירה אפשר להגדיר סיסמה:

```powershell
$pwd = Read-Host "Password" -AsSecureString
Set-ADAccountPassword -Identity test.user -NewPassword $pwd
Enable-ADAccount -Identity test.user
```

## 4. Disable / Enable
```powershell
Disable-ADAccount -Identity test.user
Enable-ADAccount -Identity test.user
Unlock-ADAccount -Identity test.user
```

## 5. קבוצות
```powershell
Get-ADGroup -Filter *
Get-ADGroupMember "Domain Admins"
Add-ADGroupMember "Helpdesk" -Members test.user
Remove-ADGroupMember "Helpdesk" -Members test.user
```

## 6. מחשבים
```powershell
Get-ADComputer -Filter *
Get-ADComputer -Filter 'OperatingSystem -like "*Server*"'
```

מחשבים שלא התחברו מזמן:
```powershell
Get-ADComputer -Filter * -Properties LastLogonDate |
    Where-Object LastLogonDate -lt (Get-Date).AddDays(-90) |
    Select-Object Name, LastLogonDate
```

## 7. חיפוש לפי OU
```powershell
Get-ADUser -SearchBase "OU=Users,DC=example,DC=local" -Filter *
```

## 8. Export משתמשים
```powershell
Get-ADUser -Filter * -Properties Department,Title,LastLogonDate |
    Select-Object Name,SamAccountName,Department,Title,LastLogonDate |
    Export-Csv .\users.csv -NoTypeInformation -Encoding UTF8
```

## 9. שינוי Attribute
```powershell
Set-ADUser -Identity test.user -Department "IT"
Set-ADUser -Identity test.user -Title "System Administrator"
```

## 10. Password expiration
```powershell
Get-ADUser test.user -Properties PasswordExpired,PasswordLastSet |
    Select-Object SamAccountName,PasswordExpired,PasswordLastSet
```

## 11. Domain Controllers
```powershell
Get-ADDomainController -Filter *
```

בדיקות בסיסיות:
```powershell
Get-ADDomain
Get-ADForest
Get-ADReplicationFailure -Scope Forest
```

## 12. Replication
```powershell
Get-ADReplicationPartnerMetadata -Target * -Scope Forest
Get-ADReplicationFailure -Target * -Scope Forest
```

## 13. DNS / DC troubleshooting
שילוב PowerShell עם כלים קיימים:

```powershell
Resolve-DnsName dc01.example.local
Test-NetConnection dc01 -Port 389
Test-NetConnection dc01 -Port 445
Test-NetConnection dc01 -Port 53
```

## 14. תרגיל ראיון
"יש משתמש שלא מצליח להתחבר. איך תחקור?"

תשובה חזקה:
1. בודק האם החשבון Enabled.
2. בודק LockedOut.
3. בודק PasswordExpired / PasswordLastSet.
4. בודק איזה DC קיבל את הלוגון.
5. בודק DNS.
6. בודק זמן וסנכרון.
7. בודק Event Logs.
8. בודק GPO רק לאחר שהבסיס תקין.

## שאלות ראיון
### מה ההבדל בין `Get-ADUser -Filter *` לבין `Get-ADUser -LDAPFilter`?
Filter הוא מנגנון סינון של המודול; LDAPFilter מאפשר ביטוי LDAP. בסביבות גדולות חשוב להבין ביצועים והיכן הסינון מתבצע.

### איך תמצא משתמשים ללא Logon במשך 90 יום?
```powershell
Get-ADUser -Filter * -Properties LastLogonDate |
    Where-Object LastLogonDate -lt (Get-Date).AddDays(-90)
```

### האם LastLogonDate מדויק לחלוטין?
לא. זה ערך משוכפל/מקורב. כאשר צריך דיוק מלא יש להבין את `lastLogon` מול DCs ואת מנגנון הרפליקציה.

## טיפים
- אל תבצע Bulk changes לפני Export/Backup מתאים.
- הוסף `-WhatIf` כאשר נתמך.
- בדוק OU לפני פעולות.
- השתמש ב-`-SearchBase` כדי לצמצם עומס.
- לפעולות רגישות דרוש אישור ושמור Audit.


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



# הרחבה — Active Directory בתרחישים אמיתיים

## תרחיש 1 — משתמש לא מצליח להתחבר

```powershell
Get-ADUser username -Properties Enabled,LockedOut,PasswordExpired,PasswordLastSet
```

אם LockedOut:

```powershell
Unlock-ADAccount username
```

אבל אל תסיים כאן.

שאלת ה-System Administrator היא:

> למה הוא ננעל?

בדוק:
- מחשב ישן.
- Outlook עם Password ישן.
- Service Account.
- Scheduled Task.
- Mapped Drive.
- Mobile device.
- Application עם Credential שמור.

## תרחיש 2 — עובד חדש

CSV:

```text
FirstName,LastName,Username,Department
David,Cohen,dcohen,IT
```

קריאה:

```powershell
$users = Import-Csv .\new-users.csv
```

לפני יצירה:

```powershell
$users | Format-Table
```

בדיקת קיום:

```powershell
foreach ($user in $users) {
    $exists = Get-ADUser -Filter "SamAccountName -eq '$($user.Username)'"

    if ($exists) {
        Write-Warning "$($user.Username) already exists"
    }
}
```

רק אחרי Validation מבצעים `New-ADUser`.

## תרחיש 3 — משתמשים שלא נראו 90 יום

```powershell
$oldDate = (Get-Date).AddDays(-90)

Get-ADUser -Filter * -Properties LastLogonDate |
    Where-Object {
        $_.LastLogonDate -and $_.LastLogonDate -lt $oldDate
    } |
    Select-Object Name,SamAccountName,LastLogonDate
```

ייצא לפני שינוי:

```powershell
... | Export-Csv .\stale-users.csv -NoTypeInformation
```

לא מוחקים מיד. קודם Disable/Review לפי Policy.

## תרחיש 4 — Replication

```powershell
Get-ADReplicationFailure -Scope Forest
```

וגם:

```powershell
repadmin /replsummary
repadmin /showrepl
```

אם יש בעיה, בדוק:

```powershell
Resolve-DnsName dc01.domain.local
Test-NetConnection dc01 -Port 389
Test-NetConnection dc01 -Port 88
Test-NetConnection dc01 -Port 445
```

זכור: AD Troubleshooting הוא שילוב של AD + DNS + Kerberos + Network + Time.

## תרגיל ראיון

"יש 4 DCs, משתמש שונה ב-DC אחד ולא רואים את השינוי ב-DC אחר."

תשובה:

1. בדיקת Replication.
2. בדיקת DNS.
3. בדיקת Sites/Services.
4. בדיקת Network.
5. בדיקת Time.
6. בדיקת Event Logs.
7. `repadmin`.

