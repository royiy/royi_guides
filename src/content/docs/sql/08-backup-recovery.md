---
title: "Backup & Recovery, Point-in-Time Recovery ו-Replication"
category: SQL
part: 8/10
---

## למה גיבוי הוא הדבר הכי חשוב שתעשו כ-DBA/מפתח

אין "כמעט אף פעם לא נכשל" - כוננים נשברים, מישהו מריץ `DELETE` בלי `WHERE`, גרסת אפליקציה פגומה מוחקת נתונים, או שרת שלם קורס. אסטרטגיית גיבוי ושחזור טובה היא הביטוח שמבדיל בין "תקלה מעצבנת" ל"אסון עסקי". חוק הזהב: **גיבוי שלא נבדק בשחזור בפועל אינו גיבוי אמין**.

### עקרונות מפתח

- **RPO (Recovery Point Objective)** — כמה נתונים מקסימלית מותר לאבד (למשל "עד 15 דקות אחורה").
- **RTO (Recovery Time Objective)** — כמה זמן מקסימלי מותר שהמערכת תהיה למטה עד לשחזור מלא.
- **Full Backup** — גיבוי מלא של כל המסד נתונים בנקודת זמן מסוימת.
- **Incremental/Differential Backup** — גיבוי רק של השינויים מאז הגיבוי הקודם (מהיר יותר, קטן יותר).

## סוגי גיבויים

| סוג | מה נשמר | זמן גיבוי | זמן שחזור |
|---|---|---|---|
| **Full Backup** | כל הנתונים | ארוך | קצר יחסית (שחזור ישיר) |
| **Incremental** | רק שינויים מאז הגיבוי האחרון (מלא/incremental) | קצר | ארוך (צריך לשרשר כל הגיבויים) |
| **Differential** | כל השינויים מאז הגיבוי המלא האחרון | בינוני | בינוני (Full + Differential אחרון בלבד) |
| **Logical Backup** (`pg_dump`/`mysqldump`) | ייצוא SQL קריא של הסכמה+נתונים | תלוי בגודל | איטי לטבלאות ענקיות, אך גמיש (בין גרסאות) |
| **Physical Backup** | קבצי הדיסק הגולמיים של המסד | מהיר | מהיר, אך תלוי גרסת מנוע זהה |

## גיבוי לוגי - pg_dump / mysqldump

```bash
# PostgreSQL - גיבוי מלא של מסד נתונים בודד לקובץ SQL
pg_dump -h localhost -U postgres -d company_db -F c -f company_db_backup.dump

# שחזור
pg_restore -h localhost -U postgres -d company_db_restored company_db_backup.dump

# גיבוי כל המסדים בשרת (כולל roles/permissions)
pg_dumpall -h localhost -U postgres -f full_cluster_backup.sql
```

```bash
# MySQL - גיבוי מלא
mysqldump -u root -p --single-transaction --routines --triggers company_db > company_db_backup.sql

# שחזור
mysql -u root -p company_db_restored < company_db_backup.sql
```

```bash
# SQL Server - גיבוי מלא ב-T-SQL
BACKUP DATABASE company_db
TO DISK = 'C:\Backups\company_db_full.bak'
WITH FORMAT, COMPRESSION;

-- שחזור
RESTORE DATABASE company_db_restored
FROM DISK = 'C:\Backups\company_db_full.bak'
WITH MOVE 'company_db' TO 'C:\Data\company_db_restored.mdf',
     MOVE 'company_db_log' TO 'C:\Data\company_db_restored.ldf';
```

## Point-in-Time Recovery (PITR)

PITR מאפשר לשחזר את המסד לרגע מדויק בעבר (למשל "רגע לפני שמישהו הריץ DELETE שגוי ב-14:32"), ולא רק לנקודת הגיבוי המלא האחרונה. המנגנון מתבסס על שילוב של **גיבוי מלא** + **לוג עסקאות רציף** (Transaction Log / WAL).

```
Full Backup (00:00)  --->  WAL/Binlog רציף  --->  נקודת התקלה (14:32)  --->  עכשיו
      |                          |                        |
      +---- שחזור הגיבוי המלא ---+                        |
                                 +--- הרצת הלוג עד 14:31:59 -+
```

```sql
-- PostgreSQL - הגדרת archive_mode ב-postgresql.conf לצורך PITR
-- postgresql.conf:
-- wal_level = replica
-- archive_mode = on
-- archive_command = 'cp %p /archive/%f'

-- שחזור ל-PITR - recovery.signal + postgresql.conf
-- recovery_target_time = '2026-08-17 14:31:59'
```

```sql
-- SQL Server - שחזור לנקודת זמן מדויקת (דורש Full + Log Backups)
RESTORE DATABASE company_db
FROM DISK = 'C:\Backups\company_db_full.bak'
WITH NORECOVERY;

RESTORE LOG company_db
FROM DISK = 'C:\Backups\company_db_log.trn'
WITH STOPAT = '2026-08-17T14:31:59', RECOVERY;
```

MySQL מבצע PITR באמצעות שחזור מגיבוי מלא ולאחר מכן "הרצה חוזרת" (Replay) של ה-**Binary Log** עד לנקודת הזמן הרצויה, בעזרת הכלי `mysqlbinlog`:

```bash
mysqlbinlog --stop-datetime="2026-08-17 14:31:59" mysql-bin.000123 | mysql -u root -p company_db
```

## Replication - שכפול בסיסי

Replication מעתיק נתונים משרת **Primary** (Master) לשרת/י **Replica** (Standby/Slave) אחד או יותר - לצורכי זמינות גבוהה (High Availability), פיזור עומס קריאה (Read Scaling), ואסטרטגיית Disaster Recovery.

```
+-------------+         Replication Stream        +-------------+
|   Primary   |  --------------------------------> |   Replica   |
| (Read+Write)|                                    | (Read-Only) |
+-------------+                                    +-------------+
                                                          |
                                                    +-------------+
                                                    | Replica 2   |
                                                    | (Read-Only) |
                                                    +-------------+
```

| מודל | תיאור |
|---|---|
| **Synchronous Replication** | ה-Primary ממתין לאישור מה-Replica לפני COMMIT - RPO=0 אך פוגע בביצועים |
| **Asynchronous Replication** | ה-Primary לא ממתין - ביצועים מהירים יותר, אך יש סיכון אובדן שינויים אחרונים |
| **Streaming Replication** (PostgreSQL) | שידור רציף של WAL Records מה-Primary ל-Replica |
| **Binlog Replication** (MySQL) | שידור Binary Log לצורך שחזור פעולות בצד ה-Replica |

```sql
-- בדיקת סטטוס Replication ב-PostgreSQL (מהצד Primary)
SELECT client_addr, state, sent_lsn, replay_lsn
FROM pg_stat_replication;

-- MySQL - בדיקת סטטוס בצד ה-Replica
SHOW REPLICA STATUS\G   -- MySQL 8.0.22+
SHOW SLAVE STATUS\G     -- גרסאות ישנות יותר
```

## טיפים וטריקים

1. **בדקו שחזור בפועל באופן תקופתי (Restore Drill)** — גיבוי שאף פעם לא נבדק בשחזור עלול להתגלות כפגום דווקא כשהוא נחוץ ביותר.
2. **הגדירו RPO/RTO מפורשים לכל מערכת** — לא כל מערכת דורשת PITR של דקה אחת; מערכות פחות קריטיות יכולות להסתפק בגיבוי יומי מלא.
3. **שמרו גיבויים במיקום נפרד פיזית (Off-site/Cloud)** — עיקרון 3-2-1: 3 עותקים, על 2 סוגי מדיה שונים, 1 מהם מחוץ לאתר.
4. **אל תסתמכו רק על Replication כגיבוי** — Replication מגן מפני כשל חומרה, אך `DELETE` שגוי משוכפל מיידית גם ל-Replica! חובה גיבוי אמיתי (Snapshot/Dump) בנוסף.
5. **תעדו ותרגלו את תהליך ה-DR (Disaster Recovery) המלא** — כולל זמן שחזור בפועל, כדי שה-RTO המחושב יהיה מציאותי ולא תיאורטי.

## שאלות נפוצות לתרגול עצמי

- מה ההבדל בין RPO ל-RTO?
- מדוע Replication אינו תחליף לגיבוי אמיתי?
- כיצד מתבצע Point-in-Time Recovery, ואילו רכיבים נדרשים לכך?
- מה ההבדל בין Synchronous ל-Asynchronous Replication, ומה ה-Trade-off?

## קישורים חיצוניים

**תיעוד רשמי:**
- PostgreSQL - Continuous Archiving and PITR: https://www.postgresql.org/docs/current/continuous-archiving.html
- MySQL - Backup and Recovery: https://dev.mysql.com/doc/refman/8.0/en/backup-and-recovery.html
- SQL Server - Backup and Restore: https://learn.microsoft.com/en-us/sql/relational-databases/backup-restore/backup-and-restore-of-sql-server-databases

**סרטוני YouTube מומלצים:**
- Hussein Nasser - Database Backup Strategies: https://www.youtube.com/watch?v=z2z4mVdkeW8
- freeCodeCamp - SQL Full Course: https://www.youtube.com/watch?v=HXV3zeQKqGY
- TechWorld with Nana - Database Replication Explained: https://www.youtube.com/watch?v=BxHb4NgFF5o

---
⬅️ המדריך הבא: [09-security-permissions.md](/sql/09-security-permissions/) — ניהול הרשאות, GRANT/REVOKE ומניעת SQL Injection
