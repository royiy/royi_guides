---
title: "יצירה וניהול של Backup Jobs"
category: Veeam
part: 3/10
---

## מהו Backup Job?

Backup Job הוא ההגדרה המרכזית שאומרת ל-Veeam **מה** לגבות, **לאן**, **מתי**, ו**באיזו שיטה**. זהו אובייקט התצורה החשוב ביותר במערכת.

## סוגי Jobs עיקריים

| סוג Job | מטרה |
|---|---|
| **Backup Job** | גיבוי image-level רגיל של VM/שרת |
| **Backup Copy Job** | העתקת גיבויים קיימים ליעד נוסף (יישום 3-2-1) |
| **Replication Job** | יצירת עותק "חי" (Replica) של VM לצורך Failover מהיר |
| **Agent Backup Job** | גיבוי מכונות פיזיות דרך Veeam Agent |
| **File Backup Job** | גיבוי שיתופי קבצים (NAS) |
| **SureBackup Job** | בדיקת שחזוריות אוטומטית בסביבת בידוד |
| **Configuration Backup** | גיבוי תצורת שרת ה-Veeam עצמו |

## יצירת Backup Job - שלב אחר שלב (VMware vSphere לדוגמה)

### שלב 1: פתיחת האשף
```
Home → Backup Job → Virtual Machine → VMware vSphere
```

### שלב 2: בחירת שם ואובייקטים
- תנו שם משמעותי, למשל: `PROD-Servers-Daily`
- לחצו **Add** ובחרו VMs, Folders, Resource Pools, Tags או Clusters שלמים

### שלב 3: הגדרת Exclusions (החרגות)
ניתן להחריג דיסקים ספציפיים בתוך VM (למשל דיסק D: עם קבצי לוג זמניים) כדי לחסוך מקום.

### שלב 4: בחירת Repository ומדיניות שמירה
```
Backup Repository: [שם ה-Repository/SOBR]
Retention Policy: 14 restore points
```

### שלב 5: הגדרת Advanced Settings
- **Backup Mode**: Incremental / Reverse Incremental
- **Synthetic Full**: יצירת גיבוי מלא "מלאכותי" מבלי לקרוא שוב מה-VM המקורי (חוסך עומס)
- **Active Full**: גיבוי מלא אמיתי בתדירות מוגדרת (למשל פעם בחודש)
- **GFS (Grandfather-Father-Son)**: שמירת עותקים שבועיים/חודשיים/שנתיים לטווח ארוך

### שלב 6: Application-Aware Processing
מפעילים עבור שרתי Active Directory, SQL, Exchange, Oracle - כדי לקבל גיבוי "consistent" ברמת האפליקציה (כולל טיפול ב-VSS ו-Transaction Logs).

### שלב 7: תזמון (Schedule)
```
Run automatically → Daily at 22:00
```

## דוגמת קובץ תצורה (PowerShell - Veeam PowerShell Module)

```powershell
# חיבור לשרת הגיבוי
Connect-VBRServer -Server localhost

# יצירת Backup Job בסיסי
$repo = Get-VBRBackupRepository -Name "Repo-Main"
$vm = Find-VBRViEntity -Name "WebServer01"

Add-VBRViBackupJob -Name "WebServer01-Backup" `
    -Entity $vm `
    -BackupRepository $repo `
    -Description "גיבוי יומי לשרת web"

# הפעלת ה-Job מיידית
Start-VBRJob -Job (Get-VBRJob -Name "WebServer01-Backup")
```

## Retention Policy - הסבר מעמיק

מדיניות השמירה קובעת כמה נקודות שחזור (Restore Points) יישמרו:

- **Simple Retention**: מספר קבוע (למשל 14 restore points אחרונים)
- **GFS Retention**: משלב שמירה יומית + שבועית (Weekly Full) + חודשית + שנתית

דוגמה טיפוסית לארגון:
```
יומי: 14 restore points
שבועי: 4 שבועות (Full כל יום שישי)
חודשי: 12 חודשים
שנתי: 7 שנים (לצרכי compliance)
```

## Backup Chain - איך זה עובד בפועל

```
[Full - VBK] → [Incremental - VIB] → [Incremental - VIB] → ...
```

בשיטת **Forever Forward Incremental**, ה-Full נשאר קבוע וכל ה-Incrementals נוספים אליו, כאשר הישן ביותר מוזג פנימה (Merge) כשעוברים את מכסת השמירה.

בשיטת **Reverse Incremental**, ה-VBK תמיד מייצג את המצב העדכני ביותר, ונקודות היסטוריות נשמרות כ-VRB (הפוכות).

## טיפים מעשיים

1. **הפרידו Jobs לפי SLA** - שרתים קריטיים (Tier 1) בג'וב נפרד עם תדירות גבוהה יותר משרתים משניים.
2. **הגבילו Concurrent Tasks** לפי חומרת ה-Proxy כדי למנוע צוואר בקבוק.
3. **השתמשו ב-Backup Job Chaining** (Job A מפעיל את Job B בסיומו) לתזמון תלוי-אירועים.
4. **בדקו Health Check** תקופתי של קובצי הגיבוי (SOBR/Repository Health Check) כדי לוודא שאין קבצים פגומים.

## בעיות נפוצות ופתרונן

| בעיה | פתרון אפשרי |
|---|---|
| Job נכשל עם "Failed to create VM snapshot" | בדקו מקום פנוי בדטהסטור, גרסת VMware Tools, ותפוסת snapshots ישנים |
| Job איטי מהצפוי | בדקו Transport Mode (Hot-Add/NBD), רשת, ומספר Proxies |
| שגיאת "Client error: Access is denied" ב-Application-Aware | בדקו הרשאות חשבון הגיבוי ב-Guest OS ו-VSS |

## קישורים חיצוניים

### תיעוד רשמי
- מדריך Backup Jobs מלא: https://helpcenter.veeam.com/docs/vbr/userguide/backup_job.html
- Veeam PowerShell Reference: https://helpcenter.veeam.com/docs/vbr/powershell/overview.html
- REST API Reference Map: https://www.veeam.com/products/veeam-data-platform/backup-recovery/resources.html

### YouTube
- יצירת Backup Job - וידאו הדרכה: https://www.youtube.com/watch?v=V7VZBzUoXw8
- קורס מלא Veeam 12 (כולל Backup Jobs): https://www.youtube.com/playlist?list=PLeqch-0_f39EbG5MsJfuX9DMDuQYdea-1

---

**חזרה למדריך הקודם:** [02 - התקנה ופריסה](/veeam/02-hatkana-perisa/)
**המשך למדריך הבא:** [04 - Backup Copy וכלל 3-2-1](/veeam/04-backup-copy-3-2-1/)
