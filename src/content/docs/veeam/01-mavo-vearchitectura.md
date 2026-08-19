---
title: "מבוא ל-Veeam Backup & Replication וארכיטקטורה"
category: Veeam
part: 1/10
---

## מה זה Veeam?

Veeam Backup & Replication (בקיצור **VBR**) הוא מנוע הגיבוי וההתאוששות המרכזי של **Veeam Data Platform**. המוצר מגן על עומסי עבודה וירטואליים, פיזיים וענניים, ומספק שחזורים מהירים ונקיים באמצעות Instant Recovery, אחסון immutable (בלתי ניתן לשינוי), בקרת הרשאות מבוססת תפקידים (RBAC) ודיווח שעומד בדרישות ביקורת (audit).

מוצר זה תומך בסביבות VMware vSphere, Microsoft Hyper-V, Nutanix AHV, מכונות פיזיות (Windows/Linux/macOS), עומסי ענן (AWS, Azure, GCP), NAS/קבצים, מסדי נתונים (SQL, Oracle, PostgreSQL, SAP HANA) ועוד.

## למה חשוב להכיר את Veeam?

Veeam היא אחת מפלטפורמות הגיבוי וה-DR (Disaster Recovery) הנפוצות ביותר בעולם הארגוני. ידע ב-Veeam נדרש כמעט בכל תפקיד של מנהל מערכות (SysAdmin), מהנדס תשתיות, ו-DevOps, IT.

## רכיבי הליבה של הארכיטקטורה

### 1. Veeam Backup Server
השרת המרכזי שמריץ את שירותי הניהול (Veeam Backup Service, Catalog Service וכו'), מתזמן ג'ובים, ושומר את מסד הנתונים של התצורה (PostgreSQL כברירת מחדל בגרסאות החדשות).

### 2. Backup & Replication Console
ממשק הניהול - יכול להיות מותקן על אותו שרת או על תחנת עבודה נפרדת שמתחברת לשרת הגיבוי. קיים גם **Veeam Web UI** לניהול מהדפדפן.

### 3. Backup Proxy
רכיב שמבצע את העברת הנתונים בפועל בין המקור (Source) ליעד (Target). ה-Proxy "עושה את העבודה הקשה" - קריאת בלוקים, דחיסה, דה-דופליקציה ראשונית - ומקל את העומס משרת הגיבוי המרכזי. ניתן לפרוס מספר Proxies לצורך scale-out וביצועים מקבילים.

### 4. Backup Repository
המקום שבו נשמרים קבצי הגיבוי בפועל (VBK, VIB, VRB). יכול להיות:
- Windows/Linux Server עם דיסק מקומי
- Shared Folder (SMB/NFS)
- Deduplicating Storage Appliance (למשל ExaGrid, HPE StoreOnce)
- Object Storage (S3, Azure Blob, S3-compatible) - כולל תמיכה ב-Immutability
- Scale-Out Backup Repository (SOBR) - איחוד כמה repositories לאחסון רב-שכבתי (Performance Tier + Capacity Tier + Archive Tier)

### 5. Guest Interaction Proxy
מסייע בתקשורת עם מערכת ההפעלה הפנימית של המכונה המגובה, לצורך גיבוי אפליקטיבי (Application-Aware Processing) ו-Guest File Indexing.

### 6. WAN Accelerator
רכיב אופציונלי שמאיץ ומדחיס תעבורת נתונים בין שני אתרים מרוחקים (למשל בעת Backup Copy Job בין Data Center לענן).

### 7. Mount Server
אחראי על "הרכבת" (mounting) תוכן הגיבוי לצורך שחזורים גרנולריים (קבצים בודדים, אובייקטים בתוך אפליקציות).

## תרשים זרימה כללי (High-Level)

```
[VM / Server / Cloud Workload]
        │
        ▼
 [Backup Proxy] ── קריאה, דחיסה, דה-דופליקציה
        │
        ▼
 [Backup Repository / SOBR] ── שמירת קבצי VBK/VIB
        │
        ▼
 [Backup Copy Job] ──► Repository שני / Cloud / Tape (כלל 3-2-1)
```

## סוגי קבצי גיבוי

| סיומת | הסבר |
|---|---|
| `.VBK` | Veeam Backup Full - קובץ גיבוי מלא |
| `.VIB` | Veeam Incremental Backup - שינויים בלבד מאז הגיבוי הקודם |
| `.VRB` | Veeam Reversed incremental Backup - שיטת שרשור הפוכה |
| `.VBM` | Veeam Backup Meta - קובץ מטא-דאטה של ה-job |
| `.VLB` | Veeam Log Backup - גיבוי לוגים (למשל SQL Transaction Logs) |

## דוגמה מעשית: תרחיש פריסה טיפוסי בארגון בינוני

1. שרת Veeam Backup Server מותקן על VM ייעודי (Windows Server 2022).
2. שני Backup Proxies מותקנים - אחד ליד קלאסטר vSphere הראשי, אחד ליד קלאסטר ה-DR.
3. Scale-Out Backup Repository מוגדר עם Performance Tier מקומי (NAS מהיר) ו-Capacity Tier מבוסס S3 immutable בענן.
4. Backup Jobs רצים בלילה על כל שרתי הייצור.
5. Backup Copy Job מעביר עותק שני ל-Capacity Tier מדי יום (יישום כלל 3-2-1-1-0).

## שאלות נפוצות (FAQ)

**ש: האם אפשר להתקין את כל הרכיבים על 
שרת אחד?**
ת: כן, בסביבות קטנות ניתן להריץ הכול (Backup Server + Proxy + Repository) על שרת יחיד, אך בסביבות בינוניות-גדולות מומלץ להפריד לצורכי ביצועים וזמינות.

**ש: מהו Veeam Community Edition?**

גרסה חינמית עם עד 10 מכונות, מצוינת ללימוד ותרגול.

## קישורים חיצוניים

### תיעוד רשמי
- Veeam Help Center (כלל התיעוד הטכני): https://helpcenter.veeam.com/
- מדריך המשתמש הרשמי ל-VBR: https://helpcenter.veeam.com/docs/vbr/userguide/overview.html
- דף המוצר הרשמי: https://www.veeam.com/products/veeam-data-platform/backup-recovery.html
- הורדת המוצר (כולל גרסת Community): https://www.veeam.com/backup-replication-download.html

### YouTube
- ערוץ היוטיוב הרשמי של Veeam: https://www.youtube.com/channel/UC5YkxcYCG5b-fCcvHniW_ag
- פלייליסט "Veeam How To Series": https://www.youtube.com/playlist?list=PL0afnnnx_OVCdhlQvHDtQXtk-HGkX02zZ
- קורס מלא ל-Veeam Backup and Replication 12: https://www.youtube.com/playlist?list=PLeqch-0_f39EbG5MsJfuX9DMDuQYdea-1

---

**המשך למדריך הבא:** [02 - התקנה ופריסה](/veeam/02-hatkana-perisa/)
