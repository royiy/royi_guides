---
title: "Veeam ONE - ניטור, דוחות והתראות"
category: Veeam
part: 7/10
---

## מהו Veeam ONE?

**Veeam ONE** הוא רכיב נפרד (אך משתלב עם VBR) המספק ניטור מקיף, דוחות, לוחות מחוונים (Dashboards), התראות (Alerts), ותכנון קיבולת (Capacity Planning) עבור כל תשתית הגיבוי והוירטואליזציה.

## רכיבי Veeam ONE

1. **Veeam ONE Monitor** - ניטור בזמן אמת של תשתית הוירטואליזציה וגיבויים
2. **Veeam ONE Reporter** - יצירת דוחות מתוזמנים (PDF/Excel) ושליחתם במייל
3. **Veeam ONE Business View** - קטגוריזציה עסקית של עומסי עבודה (למשל לפי מחלקה/פרויקט לצורך Chargeback)

## התקנה וחיבור

```
1. התקינו Veeam ONE Server (יכול לחיות על אותו שרת כמו VBR בסביבות קטנות)
2. פתחו Veeam ONE Monitor Client
3. הוסיפו את vCenter/Hyper-V Server ואת Veeam Backup Server כ-Infrastructure Items
```

## דוגמאות ל-Alarms מוגדרים מראש (Predefined Alarms)

| Alarm | תיאור |
|---|---|
| Backup job failure | Job נכשל לחלוטין |
| Backup job status - RPO violation | הזמן מאז הגיבוי האחרון חרג מה-RPO המוגדר |
| Datastore space usage | דיסק המארח מתקרב לתפוסה מלאה |
| VM CPU/Memory overutilization | עומס גבוה על VM שעלול להשפיע על חלון הגיבוי |
| Repository free space | מקום פנוי בריפוזיטורי יורד מתחת לסף |

## דוגמת יצירת Alarm מותאם אישית

```
Configuration → Alarm Management → New Alarm
Name: "Repository below 15% free space"
Type: Backup Repository
Rule: Free space (%) < 15
Action: Send email to storage-team@company.com
```

## דוחות מרכזיים לשימוש ניהולי

- **Backup Job Summary Report** - תמונת מצב שבועית של כל ה-Jobs (הצלחות/כשלים)
- **RPO/RTO Compliance Report** - עמידה ביעדי SLA
- **License Usage Report** - ניצול רישיונות (חשוב לתקציב ולחידוש)
- **Infrastructure Assessment Report** - ניתוח בריאות תשתית הוירטואליזציה הכללית

## Security & Compliance Analyzer (רכיב מובנה ב-VBR)

בגרסאות עדכניות, VBR עצמו כולל בדיקת Best Practices מובנית:

```
Home → Security & Compliance Analyzer → Run Analyzer Now
```

הכלי בודק תצורה מול Best Practices מומלצים (למשל: האם MFA מופעל, האם Immutability מוגדר, האם ה-Backup Server מבודד ברשת נפרדת) ומספק ציון ודוח פעולות מתקנות.

## Threat Center - זיהוי איומי כופרה

```
Home → Threat Center
```

מציג "Blast Radius" - איזה עומסי עבודה נמצאים בסיכון, אילו נקודות שחזור "נקיות" (מאומתות ללא Malware), ומאפשר סריקת נקודות שחזור לפני שחזור בפועל (Malware Detection & Analysis).

## דוגמה: דוח שבועי אוטומטי במייל

```
Veeam ONE Reporter → Reports → Backup → Job Summary
→ Schedule → Weekly, Monday 07:00
→ Recipients: it-managers@company.com
→ Format: PDF
```

## ניטור מבוסס PowerShell - שאילתות שימושיות

```powershell
# בדיקת סטטוס כל ה-Jobs
Get-VBRJob | Select-Object Name, @{N="LastResult";E={$_.GetLastResult()}}

# בדיקת נקודות שחזור אחרונות לכל VM
Get-VBRBackup | ForEach-Object {
    $_.GetAllStorages() | Select-Object CreationTime, Backup
}

# בדיקת שטח פנוי בכל Repository
Get-VBRBackupRepository | Select-Object Name, 
    @{N="FreeGB";E={[math]::Round($_.GetContainer().CachedFreeSpace/1GB,2)}}
```

## אינטגרציה עם SIEM

Veeam ONE תומך בשליחת אירועים ל-SIEM (Splunk, QRadar, Microsoft Sentinel ואחרים) דרך Syslog - חשוב לארגונים עם דרישות אבטחה מחמירות שרוצים לזהות פעילות חשודה סביב תשתית הגיבוי (למשל ניסיון מחיקת גיבויים המעיד על תקיפת כופרה).

## טיפים מעשיים

1. **הגדירו התראות על כשלים חוזרים** (לא רק כשל בודד) כדי לצמצם "רעש" (alert fatigue).
2. **סקרו דוח RPO Compliance שבועית** - לא רק "האם ה-job רץ" אלא "האם עמדנו ב-SLA".
3. **חברו את Veeam ONE ל-SIEM הארגוני** לזיהוי מוקדם של תקיפות כופרה.
4. **השתמשו ב-Business View** כדי לתת לכל מחלקה תמונת מצב עצמאית של הגיבויים שלה.

## קישורים חיצוניים

### תיעוד רשמי
- מדריך Veeam ONE המלא: https://helpcenter.veeam.com/docs/one/deployment/overview.html
- מדריך Security & Compliance Analyzer: https://helpcenter.veeam.com/docs/vbr/userguide/security_compliance_analyzer.html
- Veeam Help Center הראשי (כלל המוצרים): https://helpcenter.veeam.com/

### YouTube
- ערוץ Veeam הרשמי (חיפוש "Veeam ONE"): https://www.youtube.com/channel/UC5YkxcYCG5b-fCcvHniW_ag
- פלייליסט "Veeam How To Series": https://www.youtube.com/playlist?list=PL0afnnnx_OVCdhlQvHDtQXtk-HGkX02zZ

---

**חזרה למדריך הקודם:** [06 - VEEAM עם VMware ו-Hyper-V](/veeam/06-vmware-hyperv/)
**המשך למדריך הבא:** [08 - פתרון בעיות נפוצות](/veeam/08-troubleshooting/)
