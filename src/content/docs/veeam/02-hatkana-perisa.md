---
title: "התקנה ופריסה של Veeam Backup & Replication"
category: Veeam
part: 2/10
---

## דרישות מערכת בסיסיות

לפני התקנה יש לוודא עמידה בדרישות (הדרישות המדויקות משתנות בין גרסאות, ולכן תמיד יש לבדוק את עמוד ה-System Requirements העדכני בעמוד ה-Help Center):

- **מערכת הפעלה לשרת הגיבוי**: Windows Server (גרסה נתמכת עדכנית, לרוב 2 הגרסאות האחרונות בלבד)
- **מסד נתונים**: PostgreSQL (מותקן אוטומטית כברירת מחדל) או Microsoft SQL Server קיים
- **זיכרון**: מינימום 8GB RAM לסביבות קטנות, מומלץ 16GB+ לסביבות בינוניות
- **רשת**: גישה ל-vCenter/ESXi, ל-Repository, ולמכונות המגובות (פורטים 6160-6172, 2500-3300 לפי הצורך)
- **הרשאות**: חשבון Domain/Local Admin להתקנה

## שלבי התקנה - שלב אחר שלב

### שלב 1: הכנה
1. הורידו את קובץ ה-ISO/EXE מהאתר הרשמי.
2. ודאו חיבור אינטרנט לצורך רישוי (License) - או הכינו קובץ רישיון offline.
3. גבו את מסד הנתונים אם זו שדרוג של התקנה קיימת.

### שלב 2: הרצת ה-Setup Wizard
```
1. הריצו את VeeamBackup&Replication_Setup.exe כמנהל (Run as Administrator)
2. בחרו "Install" תחת Veeam Backup & Replication
3. אשרו את הסכם הרישיון (EULA)
4. בחרו/אשרו את תיקיית ההתקנה
```

### שלב 3: הגדרת מסד הנתונים
- ברירת המחדל היא PostgreSQL מקומי - Setup Wizard יתקין אותו אוטומטית.
- לחלופין ניתן להצביע על SQL Server קיים (Instance Name, Authentication).

### שלב 4: חשבון שירות (Service Account)
מומלץ ליצור חשבון שירות ייעודי בדומיין (למשל `DOMAIN\svc_veeam`) עם הרשאות Local Admin על שרת הגיבוי, ולא להשתמש בחשבון אישי.

### שלב 5: סיום והפעלה ראשונית
לאחר סיום ההתקנה, פתחו את הקונסולה, הזינו רישיון (License Key) או המשיכו עם Community Edition.

## דוגמה: התקנת גרסת Community Edition (חינמית) לצורכי לימוד

```powershell
# הורדה מהאתר הרשמי (קישור למטה)
# הרצת ההתקנה במצב שקט (Silent Install) - דוגמה כללית:
VeeamBackup&Replication_Setup.exe /accepteula /silent /log="C:\install.log"
```

> טיפ: גרסת ה-Community Edition מוגבלת לעד 10 עומסי עבודה (VMs/Servers/Workstations) ומהווה כלי מצוין לתרגול לפני ראיונות עבודה.

## פריסת Backup Proxy

1. פתחו את הקונסולה → **Backup Infrastructure** → **Backup Proxies** → **Add VMware Proxy** (או Hyper-V בהתאם).
2. בחרו שרת קיים או הוסיפו שרת חדש (Managed Server).
3. הגדירו את מספר ה-Concurrent Tasks (משימות מקבילות) בהתאם לחומרה (כלל אצבע: מספר ליבות CPU חלקי 2).
4. בחרו את שיטת Transport Mode: `Direct Storage Access`, `Virtual Appliance (Hot-Add)` או `Network (NBD)`.

## פריסת Backup Repository

```
Backup Infrastructure → Backup Repositories → Add Repository
→ בחרו סוג: Direct attached storage / Network attached storage / Deduplicating storage / Object storage
→ הגדירו נתיב, מכסת שטח (capacity), הגבלת משימות מקבילות
```

### דוגמת הגדרת Scale-Out Backup Repository (SOBR)
```
1. הגדירו לפחות Extent אחד (Repository רגיל) כ-Performance Tier
2. הוסיפו Object Storage (S3/Azure Blob) כ-Capacity Tier
3. הגדירו מדיניות Offload (למשל אחרי 7 ימים) והפעילו Immutability אם הענן תומך
```

## שדרוג (Upgrade) גרסה

1. תמיד קראו את ה-Release Notes וה-Upgrade Checklist הרשמיים לפני שדרוג.
2. גבו את מסד הנתונים (Configuration Backup) לפני כל שדרוג.
3. שדרגו קודם את Backup Server, לאחר מכן Proxies, Repositories, ולבסוף Agents/Enterprise Manager.
4. בדקו תאימות עם Proxy/Repository ישנים לפני שדרוג מלא בסביבת ייצור.

## טעויות נפוצות בהתקנה

- **התקנה על שרת עם משאבים חלשים מדי** - גורמת לביצועי גיבוי איטיים.
- **שימוש בחשבון אישי כ-Service Account** - בעיה כשהעובד עוזב או משנה סיסמה.
- **אי-הפרדה בין Backup Server ל-Repository הראשי** - במקרה כשל בשרת, אין גישה נוחה לגיבויים.
- **התעלמות מדרישות פתיחת פורטים** - גורם לכשלים ב-jobs עם הודעות timeout מעורפלות.

## קישורים חיצוניים

### תיעוד רשמי
- דרישות מערכת עדכניות: https://helpcenter.veeam.com/docs/vbr/userguide/system_requirements.html
- מדריך התקנה מלא (User Guide): https://helpcenter.veeam.com/docs/vbr/userguide/overview.html
- הורדת המוצר: https://www.veeam.com/backup-replication-download.html
- Release Notes של הגרסה העדכנית: https://helpcenter.veeam.com/rn/veeam_backup_13_1_release_notes.html

### YouTube
- מדריך התקנה מלא (וידאו): https://www.youtube.com/watch?v=ZU2Vgczc_fk
- התקנת Veeam בחינם (Community Edition): https://www.youtube.com/watch?v=tf8IahEtrqY
- Setup, Backup, Restore - Community Edition: https://www.youtube.com/watch?v=cHrjcD9bNM0

---

**חזרה למדריך הקודם:** [01 - מבוא וארכיטקטורה](/veeam/01-mavo-vearchitectura/)
**המשך למדריך הבא:** [03 - Backup Jobs](/veeam/03-backup-jobs/)
