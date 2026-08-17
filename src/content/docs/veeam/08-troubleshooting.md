---
title: "פתרון בעיות נפוצות (Troubleshooting)"
category: Veeam
part: 8/10
---

## מתודולוגיית אבחון כללית

1. **בדקו את ה-Job Log** - לחיצה ימנית על ה-Job → History → לחיצה כפולה על הריצה הכושלת
2. **בדקו לוגים מקומיים** בשרת: `C:\ProgramData\Veeam\Backup\`
3. **בדקו קישוריות רשת** בין Backup Server, Proxy, Repository, ו-Guest
4. **בדקו משאבי מערכת** (CPU, RAM, דיסק) בכל רכיב מעורב
5. **חפשו את קוד השגיאה המדויק** בתיעוד הרשמי או ב-Veeam Community Forums

## בעיות נפוצות ופתרונות

### 1. "Failed to create VM snapshot" / "Error: Cannot create a quiesced snapshot"

**סיבות אפשריות:**
- אין מספיק שטח פנוי בדטהסטור
- Snapshots ישנים שכבר קיימים על ה-VM (לא מ-Veeam)
- VMware Tools לא מעודכן

**פתרון:**
```
1. בדקו Snapshot Manager ב-vSphere - מחקו snapshots תקועים ישנים
2. ודאו שטח פנוי >20% בדטהסטור
3. עדכנו VMware Tools לגרסה עדכנית
```

### 2. "Client error: Failed to process RPC" / בעיית תקשורת עם Proxy

**סיבות אפשריות:**
- פורטים חסומים ב-Firewall
- שירות Veeam Data Mover לא רץ על ה-Proxy

**פתרון:**
```powershell
# בדיקת שירותים על ה-Proxy
Get-Service | Where-Object {$_.Name -like "*Veeam*"}
# הפעלה מחדש של השירות הרלוונטי
Restart-Service VeeamTransportSvc
```

### 3. Job איטי משמעותית מהרגיל

**רשימת בדיקה:**
- בדקו Transport Mode - האם עברתם ל-NBD בטעות (הכי איטי)?
- בדקו האם יש Proxy נוסף שניתן להוסיף למקביליות
- בדקו רשת - Latency גבוה בין Proxy ל-Repository
- בדקו האם Deduplication/Compression Level מוגדר גבוה מדי ביחס לחומרת השרת

### 4. "Out of free disk space" ב-Repository

**פתרון:**
```
1. בדקו Retention Policy - האם ניתן לקצר?
2. הפעילו Synthetic Full במקום Active Full כדי לחסוך מקום
3. שקלו הוספת Extent נוסף ל-SOBR (Scale-Out Backup Repository)
4. בדקו אם יש Backup Copy Jobs ישנים שמחזיקים גיבויים "יתומים"
```

### 5. Application-Aware Processing נכשל (VSS Errors)

**סיבות אפשריות:**
- שירותי VSS לא רצים בתוך ה-Guest
- הרשאות לא מספיקות לחשבון הגיבוי
- אנטי-וירוס חוסם תהליכי VSS

**פתרון:**
```cmd
:: הרצה בתוך ה-Guest OS לבדיקת מצב VSS
vssadmin list writers
:: חיפוש writers במצב "Error" ותיקון השירות הרלוונטי
```

### 6. CBT/RCT "Corrupted" - גיבוי הופך פתאום לאיטי מאוד

זהו לא באג אלא מנגנון הגנה - Veeam מזהה חוסר עקביות ב-Changed Block Tracking ומבצע סריקה מלאה (Full read) חד פעמית. אחרי הריצה הבאה זה יחזור לקצב רגיל.

### 7. "License Expired" או חריגה ממכסת Sockets/Instances

```
Help → License Information → בדקו תוקף ותפוסה
→ במידת הצורך פנו ל-Veeam / הספק לחידוש
```

### 8. שגיאות בזמן Restore - "Unable to mount"

**פתרון:**
```
1. ודאו ש-Mount Server פועל ונגיש
2. בדקו הרשאות על תיקיית ה-Restore Cache
3. נסו לבצע Extract במקום Mount אם הבעיה נמשכת
```

## כלי אבחון מובנים

### Export Logs
```
Main Menu → Help → Support Information → Export Logs
```
מייצא חבילת לוגים מקיפה שניתן לשלוח לתמיכה של Veeam.

### Veeam Backup Validator
כלי CLI שבודק את שלמות קובצי הגיבוי (CRC) ללא צורך בשחזור מלא:
```cmd
"C:\Program Files\Veeam\Backup and Replication\Backup\Veeam.Backup.Validator.exe" /file:"D:\Backups\Job1.vbm"
```

## שיטת עבודה מומלצת לפתרון בעיות בסביבת ייצור

1. שחזרו אירוע דומה בסביבת Lab/Test אם ניתן
2. בידקו האם השינוי האחרון (עדכון גרסה, שינוי רשת) קרה לפני שהבעיה החלה
3. תעדו כל שינוי תצורה (Change Management) - זה מקצר מאוד את זמן האבחון הבא
4. אם התקלה חוזרת - פתחו Case מול Veeam Support עם Log Export מוכן מראש

## קישורים חיצוניים

### תיעוד רשמי
- Veeam Knowledge Base (מאמרי פתרון בעיות): https://www.veeam.com/kb-search.html
- Veeam Community Forums: https://forums.veeam.com/
- מדריך Logs ומיקומם: https://helpcenter.veeam.com/docs/vbr/userguide/log_files.html

### YouTube
- ערוץ Veeam הרשמי - סרטוני Troubleshooting: https://www.youtube.com/channel/UC5YkxcYCG5b-fCcvHniW_ag
- פלייליסט How To Series: https://www.youtube.com/playlist?list=PL0afnnnx_OVCdhlQvHDtQXtk-HGkX02zZ

---

**חזרה למדריך הקודם:** [07 - Veeam ONE, ניטור ודוחות](/veeam/07-monitoring-veeam-one/)
**המשך למדריך הבא:** [09 - שאלות ראיון עבודה](/veeam/09-interview-questions/)
