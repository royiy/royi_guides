<!-- מדריך PowerShell בעברית | נבנה ללמידה, תרגול והכנה לראיונות -->

# מדריך 08 — Microsoft 365, Exchange Online ו-Microsoft Entra עם PowerShell

## 1. למה זה חשוב?
בסביבת System/Cloud Administrator, PowerShell מאפשר לבצע פעולות Bulk, Auditing ו-Troubleshooting שאינן יעילות דרך GUI.

## 2. Microsoft Graph / Entra
Microsoft Entra PowerShell הוא כלי ממוקד לניהול משאבי Entra ומבוסס על Microsoft Graph PowerShell SDK.

תיעוד:
https://learn.microsoft.com/en-us/powershell/entra-powershell/

## 3. התקנת מודול
דוגמה כללית:
```powershell
Install-Module Microsoft.Graph -Scope CurrentUser
```

בדיקה:
```powershell
Get-InstalledModule Microsoft.Graph
```

## 4. חיבור
```powershell
Connect-MgGraph -Scopes "User.Read.All"
```

בדוק Context:
```powershell
Get-MgContext
```

## 5. משתמשים
```powershell
Get-MgUser -Top 20
```

שדות:
```powershell
Get-MgUser -Top 20 -Property Id,DisplayName,UserPrincipalName,AccountEnabled |
    Select-Object DisplayName,UserPrincipalName,AccountEnabled
```

## 6. קבוצות
```powershell
Get-MgGroup -Top 20
```

## 7. Exchange Online
התקנה:
```powershell
Install-Module ExchangeOnlineManagement
```

חיבור:
```powershell
Connect-ExchangeOnline
```

בדיקה:
```powershell
Get-ConnectionInformation
```

## 8. Mailbox
```powershell
Get-EXOMailbox -ResultSize 20
```

חיפוש:
```powershell
Get-EXOMailbox -Identity user@example.com
```

Properties:
```powershell
Get-EXOMailbox -Identity user@example.com |
    Format-List DisplayName,PrimarySmtpAddress,RecipientTypeDetails
```

## 9. Mail flow
פקודות ויכולות משתנות לפי מודול/גרסה, לכן בייצור תמיד בדוק `Get-Help` וגרסת המודול.

## 10. Bulk report
```powershell
Get-EXOMailbox -ResultSize Unlimited |
    Select-Object DisplayName,PrimarySmtpAddress,RecipientTypeDetails |
    Export-Csv .\mailboxes.csv -NoTypeInformation -Encoding UTF8
```

## 11. Exchange troubleshooting
סדר:
1. האם המשתמש קיים?
2. האם יש Mailbox?
3. מה RecipientTypeDetails?
4. האם הכתובת נכונה?
5. האם יש בעיית Authentication?
6. Hybrid? בדוק RemoteMailbox / Sync.
7. בדוק Message Trace / headers.
8. בדוק Connectors אם רלוונטי.

## 12. Security
אל תשמור:
```powershell
$password = "P@ssword123"
```

העדף Authentication מודרני, Managed Identity/Certificate/App Registration לפי התרחיש, או SecureString רק במקרים שבהם הוא באמת מתאים.

## שאלות ראיון
1. איך תאתר משתמשים ללא MFA?
2. איך תוציא רשימת Mailboxes ל-CSV?
3. מה ההבדל בין Microsoft Graph לבין Exchange Online PowerShell?
4. איך תחקור Mail Flow?
5. מה הסיכון בהרצת Bulk command עם `-ResultSize Unlimited`?
6. איך תעבוד עם הרשאות Least Privilege?

## תרגיל
בנה דוח יומי:
- UserPrincipalName
- Enabled
- License information
- Mailbox
- Primary SMTP
- Last sign-in כאשר הנתון/הרשאות מאפשרים
- Export CSV


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



# הרחבה — Microsoft 365 / Exchange בתרחישים יום-יומיים

## תרחיש — משתמש לא מקבל Mail

שלב 1:

```powershell
Get-EXOMailbox user@example.com
```

בדוק:

```powershell
Get-EXOMailbox user@example.com |
    Format-List DisplayName,PrimarySmtpAddress,RecipientTypeDetails
```

אחר כך:
- Aliases.
- Message Trace.
- Connectors.
- MX.
- Hybrid.
- Outlook.
- Headers.

אל תעשה Password Reset כשאין שום אינדיקציה לבעיה ב-Authentication.

## תרחיש — 500 Mailboxes לדוח

```powershell
Get-EXOMailbox -ResultSize Unlimited |
    Select-Object DisplayName,PrimarySmtpAddress,RecipientTypeDetails |
    Export-Csv C:\Reports\Mailboxes.csv -NoTypeInformation -Encoding UTF8
```

## תרחיש — Entra Users

```powershell
Connect-MgGraph -Scopes "User.Read.All"

Get-MgUser -All |
    Select-Object DisplayName,UserPrincipalName,AccountEnabled
```

משתמשים Disabled:

```powershell
Get-MgUser -All |
    Where-Object AccountEnabled -eq $false |
    Select-Object DisplayName,UserPrincipalName
```

## תרחיש — Bulk

קבל CSV:

```powershell
$users = Import-Csv .\users.csv
```

לפני שינוי:

```powershell
$users | Format-Table
```

לאחר מכן פעולה עם `try/catch`, Output ו-Error report.

## תרחיש — Hybrid

שאלות:

```text
איפה המשתמש נוצר?
מה Source of Authority?
האם הוא Synced?
איפה מנוהלים ה-Attributes?
מה RecipientTypeDetails?
```

ב-Hybrid חשוב להבין שה-GUI של Exchange Online לא תמיד הוא המקום שבו צריך לבצע את השינוי.

## שאלות ראיון

**איך תחקור Mail שלא מגיע?**

אני בודק את האובייקט, כתובת היעד, Message Trace, DNS/MX, Connectors, Hybrid ו-Headers.

**למה Bulk PowerShell עדיף לפעמים על GUI?**

Repeatability, Audit, Reporting ויכולת לטפל במאות Objects בצורה עקבית.

