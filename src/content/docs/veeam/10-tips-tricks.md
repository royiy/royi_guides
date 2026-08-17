---
title: "טיפים, טריקים ופרקטיקות מומלצות (Best Practices)"
category: Veeam
part: 10/10
---

## אבטחה - "3-2-1-1-0 זה לא מספיק בלי הגנת גישה"

1. **בודדו את שרת ה-Veeam ברשת נפרדת** (VLAN ייעודי) עם גישה מוגבלת בלבד.
2. **הפעילו MFA** על הקונסולה וה-Veeam Web UI.
3. **השתמשו ב-4-Eyes Authorization** למחיקת גיבויים/שינויי Retention קריטיים - דורש אישור משתמש שני.
4. **אל תחברו את שרת ה-Veeam לדומיין הראשי** אם אפשרי, או לפחות השתמשו ב-Restricted Admin Mode כדי למנוע מקרה שבו תוקף שמשתלט על ה-DC משתלט אוטומטית גם על הגיבויים.
5. **הפעילו SecureRestore** - סריקת Antivirus/Malware אוטומטית על תוכן הגיבוי לפני שחזור בפועל.

```
Restore → Entire VM → Secure Restore → Enable malware scan before restore
```

## ביצועים - טיפים לגיבוי מהיר יותר

1. **בדקו את ה"Bottleneck" בסטטיסטיקת ה-Job** - Veeam מציג בדיוק איפה צוואר הבקבוק (Source/Proxy/Network/Target) בכל ריצה.
2. **השתמשו ב-Per-VM Backup Files** ב-SOBR - מאפשר ריבוי streams מקבילים במקום קובץ אחד גדול.
3. **כוונו את Compression Level** - `Optimal` הוא בדרך כלל האיזון הטוב ביותר בין CPU לגודל קובץ; `Extreme` שווה רק אם רוחב הפס הוא צוואר הבקבוק.
4. **אל תשכפלו deduplication מיותר** - אם ה-Repository כבר עושה דה-דופליקציה בחומרה (למשל ExaGrid), הגדירו את Veeam ל-"Dedupe-friendly" Compression.

```
Storage → Advanced → Storage compatibility settings
→ "Decompress backup data blocks before storing" (למכשירי Dedup חיצוניים)
```

## אוטומציה עם PowerShell

### דוגמה: סקריפט לבדיקה יומית של סטטוס כל ה-Jobs ושליחת התראה
```powershell
Connect-VBRServer -Server localhost

$failedJobs = Get-VBRJob | Where-Object {
    $_.GetLastResult() -eq "Failed"
}

if ($failedJobs) {
    $body = $failedJobs.Name -join "`n"
    Send-MailMessage -To "admin@company.com" -From "veeam@company.com" `
        -Subject "Veeam: Jobs שנכשלו הלילה" -Body $body -SmtpServer "smtp.company.com"
}
```

### דוגמה: יצירת Backup Job דרך PowerShell לצורך פריסה מהירה (Automation/IaC-style)
```powershell
$vm = Find-VBRViEntity -Name "NewServer01"
$repo = Get-VBRBackupRepository -Name "Main-Repo"

$job = Add-VBRViBackupJob -Name "NewServer01-Auto" -Entity $vm -BackupRepository $repo
Set-VBRJobSchedule -Job $job -Daily -At "23:00"
```

## REST API - אינטגרציה מודרנית

Veeam חושף REST API מלא (מוחלף בהדרגה עם PowerShell לצורך אוטומציה מבוססת CI/CD):

```bash
# דוגמה כללית לקריאת סטטוס jobs דרך REST API (דורש Bearer Token)
curl -X GET "https://veeam-server:9419/api/v1/jobs/states" \
  -H "Authorization: Bearer <token>" \
  -H "accept: application/json"
```

## טיפים לחיסכון בעלויות אחסון

1. **הגדירו Synthetic Full** במקום Active Full - חוסך משמעותית ברוחב פס ובעומס על סביבת הייצור.
2. **החריגו קבצי Swap/Page/Temp** מתוך ה-VM (Exclude Disks/Files) כשהדבר רלוונטי.
3. **בדקו את Retention Policy תקופתית** - לא כל שרת צריך GFS שנתי של 7 שנים.
4. **שקלו Archive Tier** (Glacier-class) לגיבויים ישנים שנשמרים רק לצרכי Compliance ולא לשחזור מהיר.

## Checklist לפני "לילה שקט" (Production Readiness)

- [ ] כל ה-Jobs Critical מוגדרים עם Alert על כשל
- [ ] Configuration Backup של שרת ה-Veeam עצמו מוגדר ורץ (Encryption מופעל!)
- [ ] Immutability מוגדר על לפחות repository אחד
- [ ] Test Failover בוצע בשלושת החודשים האחרונים
- [ ] License לא עומד לפוג בקרוב
- [ ] SureBackup Job רץ תקופתית לאימות שחזוריות אוטומטי

## SureBackup - אימות שחזוריות אוטומטי

```
Home → SureBackup Job
1. בחרו Virtual Lab (סביבת רשת מבודדת)
2. בחרו Application Group (VMs תלויים, למשל DC + SQL)
3. הגדירו בדיקות: Heartbeat test, Ping test, Application test (script מותאם)
4. תזמנו ריצה שבועית
```

זהו הכלי החזק ביותר לענות בבטחון על השאלה "האם הגיבויים שלנו באמת עובדים?" - במקום להסתמך רק על "ה-Job הסתיים בהצלחה".

## טעויות נפוצות שכדאי להימנע מהן

1. **לבדוק רק "Success" בלוג** בלי לבדוק אזהרות (Warnings) - לעיתים Job "מצליח עם אזהרות" שמסתירות בעיה אמיתית.
2. **לא לתעד Runbook ל-DR** - במקרה אמת, אף אחד לא זוכר את כל הצעדים בזיכרון.
3. **להסתמך על Replica יחיד ללא Backup** - Replica לא שומר היסטוריה ארוכה, לא תחליף לגיבוי.
4. **לשכוח לגבות את שרת ה-Veeam עצמו** (Configuration Backup) - אם הוא נופל, איבדתם את "המפה" לכל הגיבויים.
5. **להתעלם מ-License Alerts** עד הרגע האחרון - חידוש דחוף עלול לגרום להשבתת Jobs.

## קישורים חיצוניים

### תיעוד רשמי
- Veeam Best Practices Guide (קהילתי, מעודכן): https://bp.veeam.com/
- PowerShell Reference המלא: https://helpcenter.veeam.com/docs/vbr/powershell/overview.html
- REST API Reference: https://www.veeam.com/products/veeam-data-platform/backup-recovery/resources.html

### YouTube
- ערוץ Veeam הרשמי (טיפים וטריקים): https://www.youtube.com/channel/UC5YkxcYCG5b-fCcvHniW_ag
- פלייליסט How To Series: https://www.youtube.com/playlist?list=PL0afnnnx_OVCdhlQvHDtQXtk-HGkX02zZ
- קורס מלא Veeam 12: https://www.youtube.com/playlist?list=PLeqch-0_f39EbG5MsJfuX9DMDuQYdea-1

---

**חזרה למדריך הקודם:** [09 - שאלות ראיון עבודה](/veeam/09-interview-questions/)
**חזרה למדריך הראשון:** [01 - מבוא וארכיטקטורה](/veeam/01-mavo-vearchitectura/)
