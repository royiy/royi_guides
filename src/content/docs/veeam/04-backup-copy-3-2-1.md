---
title: "Backup Copy Jobs וכלל 3-2-1-1-0"
category: Veeam
part: 4/10
---

## כלל 3-2-1-1-0 - הבסיס לאסטרטגיית גיבוי נכונה

Veeam מקדמת גרסה מורחבת של כלל הגיבוי הקלאסי:

- **3** - לפחות 3 עותקים של הנתונים
- **2** - על 2 סוגי מדיה שונים (למשל דיסק + טייפ, או דיסק + אובייקט)
- **1** - עותק אחד מחוץ לאתר (Off-site)
- **1** - עותק אחד Offline / Air-gapped / Immutable (לא ניתן לשינוי/מחיקה)
- **0** - אפס שגיאות באימות השחזור (Zero errors after recoverability verification)

## מה זה Backup Copy Job?

בעוד ש-Backup Job יוצר עותק ראשון בריפוזיטורי המקומי, **Backup Copy Job** מעתיק (או ליתר דיוק - מסנכרן שינויים) גיבויים קיימים ליעד שני, שיכול להיות:
- Repository מקומי אחר
- אתר מרוחק (Remote Site) עם Veeam Backup Server נוסף
- אחסון אובייקטים בענן (S3, Azure Blob, Wasabi וכו')
- ספריית Tape

חשוב להבין: Backup Copy Job **לא** קורא מחדש מה-VM המקורי, אלא מעתיק את קבצי הגיבוי הקיימים - מה שחוסך עומס על הסביבה המוגנת.

## יצירת Backup Copy Job - שלב אחר שלב

```
Home → Copy Job → Virtual Machine

1. בחרו שם: "OffSite-Copy-PROD"
2. הוסיפו את ה-Backup Jobs או VMs שמהם רוצים להעתיק
3. הגדירו יעד: Target Repository (מקומי/מרוחק/ענן)
4. הגדירו Copy Interval: "Immediate" (סנכרון תמידי) או "Periodically" (חלון זמן מוגדר)
5. הגדירו GFS Retention ליעד (למשל 4 שבועיים + 12 חודשים + 7 שנים)
```

## דוגמה: Backup Copy לאובייקט S3 עם Immutability

```
Backup Infrastructure → Backup Repositories → Add Repository → Object Storage → Amazon S3

הגדרות:
- Bucket: my-veeam-immutable-bucket
- Make recent backups immutable for: 14 days
- Region: eu-west-1
```

לאחר יצירת ה-Repository, מוסיפים אותו כיעד ב-Backup Copy Job. ה-Immutability מונע מכל גורם (כולל תוקף עם הרשאות אדמין) למחוק או לשנות את הקבצים בטווח הזמן שהוגדר - הגנה קריטית מפני תקיפות כופרה (Ransomware).

## Health Check ו-GFS Compact

```powershell
# בדיקת בריאות ריפוזיטורי דרך PowerShell
Sync-VBRBackupRepository -Repository (Get-VBRBackupRepository -Name "S3-Immutable")
```

מומלץ להפעיל **Storage-Level Corruption Guard** (בדיקת CRC אוטומטית פעם בשבוע) כדי לזהות קבצים פגומים לפני שהם הופכים לבעיה בזמן שחזור אמיתי.

## אסטרטגיית 3-2-1-1-0 בפועל - דוגמה מלאה

| עותק | מיקום | סוג | Immutable? |
|---|---|---|---|
| 1 (מקור) | Repository מקומי (SOBR Performance Tier) | Disk | לא |
| 2 | S3 Capacity Tier (SOBR Offload) | Object Storage | כן (14 יום) |
| 3 | Backup Copy Job לאתר DR מרוחק | Disk מרוחק | לא |
| Air-gap | Tape Job חודשי | LTO Tape | כן (Physical Air-gap) |

## Tape Jobs - שילוב טייפ באסטרטגיה

```
Home → Tape Job → Backup to Tape
→ בחרו מקור (Backup Job קיים)
→ בחרו Media Pool
→ הגדירו GFS Media Set (Weekly/Monthly/Yearly)
```

טייפ עדיין נחשב לפתרון Air-gap אמין ביותר מכיוון שברגע שהקלטת מוצאת מהספרייה, אין לה חיבור רשתי כלל.

## טיפים מעשיים

1. **אל תסתמכו על עותק אחד בלבד**, גם אם הוא immutable - תמיד שאפו למספר סוגי מדיה.
2. **בדקו את זמן ה-RPO/RTO** הנדרש עסקית לפני קביעת תדירות Backup Copy.
3. **וודאו רוחב פס** מספק לפני הגדרת Copy Interval "Immediate" לאתר מרוחק.
4. **תזמנו Backup Copy אחרי סיום Backup Job הראשי**, כדי לא ליצור תחרות על משאבים.

## שאלות נפוצות

**ש: מה ההבדל בין Backup Copy Job ל-Replication Job?**
ת: Backup Copy מעתיק **קבצי גיבוי** (VBK/VIB) ליעד נוסף לצורך שמירה ארוכת טווח; Replication יוצר **VM חי** שניתן להפעיל מיידית (Failover) במקרה אסון.

**ש: האם ניתן להריץ Backup Copy Job ישירות מה-Capacity Tier של SOBR?**
ת: לא מומלץ - עדיף להריץ מה-Performance Tier המקומי כדי לחסוך עלויות Egress מהענן.

## קישורים חיצוניים

### תיעוד רשמי
- מדריך Backup Copy Jobs: https://helpcenter.veeam.com/docs/vbr/userguide/backup_copy.html
- מדריך Object Storage ו-Immutability: https://helpcenter.veeam.com/docs/vbr/userguide/object_storage_repository.html
- מדריך Tape Jobs: https://helpcenter.veeam.com/docs/vbr/userguide/tape_jobs.html

### YouTube
- הסבר על כלל 3-2-1 ו-Backup Copy: https://www.youtube.com/watch?v=vPduVHLMRvc
- ערוץ Veeam הרשמי - נושאי Immutability וענן: https://www.youtube.com/channel/UC5YkxcYCG5b-fCcvHniW_ag

---

**חזרה למדריך הקודם:** [03 - Backup Jobs](/veeam/03-backup-jobs/)
**המשך למדריך הבא:** [05 - Replication ו-DR](/veeam/05-replication-dr/)
