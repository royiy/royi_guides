---
title: "שאלות ראיון עבודה מקיפות על SQL + טיפים כלליים"
category: SQL
part: 10/10
---

מדריך מסכם עם שאלות ראיון מדורגות לפי רמת קושי (Junior → Senior), כולל תשובות תמציתיות, ורשימת טיפים כלליים לעבודה יומיומית עם SQL ומסדי נתונים.

## שאלות בסיסיות (Junior)

**1. מה ההבדל בין SQL ל-DBMS?**
SQL היא שפת תקן לתקשורת עם מסדי נתונים רלציוניים. DBMS (Database Management System) היא התוכנה שמיישמת ומריצה את השפה - כמו PostgreSQL, MySQL או SQL Server.

**2. מה ההבדל בין `WHERE` ל-`HAVING`?**
`WHERE` מסנן שורות **לפני** קיבוץ (GROUP BY), ואינו יכול להשתמש בפונקציות אגרגציה. `HAVING` מסנן קבוצות **אחרי** ה-GROUP BY, ויכול להשתמש ב-`COUNT`, `SUM`, `AVG` וכו'.

**3. מה ההבדל בין `DELETE`, `TRUNCATE` ו-`DROP`?**
`DELETE` מוחק שורות ספציפיות (ניתן ל-Rollback, מפעיל Triggers). `TRUNCATE` מרוקן את כל הטבלה במהירות (לרוב לא ניתן ל-Rollback, לא מפעיל Triggers). `DROP` מוחק את הטבלה כולה כולל המבנה.

**4. מה ההבדל בין `PRIMARY KEY` ל-`UNIQUE`?**
טבלה יכולה להכיל `PRIMARY KEY` אחד בלבד (שגם אינו יכול להיות NULL), אך מספר עמודות `UNIQUE`. שניהם אוכפים ייחודיות ערכים.

**5. מהו NULL ואיך משווים אליו?**
NULL מייצג ערך לא ידוע/חסר. לא ניתן להשתמש ב-`= NULL`; יש להשתמש ב-`IS NULL` / `IS NOT NULL`.

**6. מה ההבדל בין `INNER JOIN` ל-`LEFT JOIN`?**
`INNER JOIN` מחזיר רק שורות עם התאמה בשתי הטבלאות. `LEFT JOIN` מחזיר את כל שורות הטבלה השמאלית, גם ללא התאמה (עם NULL בעמודות הימניות).

**7. מה זה Foreign Key?**
עמודה (או קבוצת עמודות) המפנה למפתח ראשי בטבלה אחרת, ואוכפת שהערך המצוין קיים בפועל בטבלה המקורית (Referential Integrity).

**8. מהו ההבדל בין `COUNT(*)` ל-`COUNT(column_name)`?**
`COUNT(*)` סופר את כל השורות (כולל שורות עם NULL בכל העמודות). `COUNT(column_name)` סופר רק שורות שבהן הערך בעמודה המסוימת אינו NULL.

## שאלות בינוניות (Mid-Level)

**9. מה ההבדל בין `UNION` ל-`UNION ALL`?**
`UNION` מאחד תוצאות משתי שאילתות ומסיר כפילויות (יקר יותר - דורש מיון/השוואה). `UNION ALL` מאחד ללא הסרת כפילויות (מהיר יותר).

**10. הסבירו את ה-ACID.**
Atomicity - הכל או כלום. Consistency - שמירה על תקינות הכללים. Isolation - עסקאות מקבילות לא רואות מצבי ביניים זו של זו. Durability - לאחר COMMIT השינוי נשמר גם בקריסת מערכת.

**11. מה זה Index, ומהו ה-Trade-off בשימוש בו?**
מבנה נתונים (בד"כ B-Tree) שמאיץ חיפוש נתונים. ה-Trade-off: מאיץ SELECT אך מאט INSERT/UPDATE/DELETE, כי המנוע צריך לתחזק גם את מבנה האינדקס.

**12. מה ההבדל בין Subquery ל-JOIN?**
Subquery היא שאילתה מקוננת בתוך שאילתה אחרת (יכולה להופיע ב-SELECT, WHERE, FROM). JOIN מחבר טבלאות "לרוחב" בשלב אחד. במקרים רבים ניתן להמיר Subquery ל-JOIN לביצועים טובים יותר, אך לא תמיד.

**13. מה זה CTE (Common Table Expression)?**
שאילתה זמנית מוגדרת עם `WITH`, המשמשת לפירוק שאילתות מורכבות לחלקים קריאים:
```sql
WITH high_earners AS (
    SELECT * FROM employees WHERE salary > 20000
)
SELECT department_id, COUNT(*) FROM high_earners GROUP BY department_id;
```

**14. מה ההבדל בין Window Function ל-GROUP BY?**
`GROUP BY` מצמצם את מספר השורות (שורה אחת לכל קבוצה). Window Function (`OVER()`) מחשב ערך אגרגטיבי **בלי** לצמצם שורות - כל שורה מקורית נשארת, עם עמודה נוספת:
```sql
SELECT employee_id, salary,
       AVG(salary) OVER (PARTITION BY department_id) AS dept_avg_salary
FROM employees;
```

**15. מהי הצורה הנורמלית השלישית (3NF) בקצרה?**
אין תלות טרנזיטיבית - עמודה לא-מפתח לא יכולה להיות תלויה בעמודה לא-מפתח אחרת; כל עמודה לא-מפתח תלויה ישירות במפתח הראשי בלבד.

**16. איך מונעים SQL Injection?**
שימוש ב-Parameterized Queries / Prepared Statements בלבד. לעולם לא לשרשר קלט משתמש ישירות למחרוזת SQL.

**17. מהי תוכנית ביצוע (Query Plan) ומה עושה EXPLAIN?**
`EXPLAIN` מציג כיצד המנוע מתכנן להריץ שאילתה בפועל - האם הוא משתמש באינדקס (Index Scan) או סורק את כל הטבלה (Seq Scan/Full Scan), וכמה שורות הוא צופה לעבד.

## שאלות מתקדמות (Senior)

**18. איך תתמודדו עם N+1 Query Problem?**
בעיה נפוצה ב-ORMs שבה כל שורה גורמת לשאילתה נוספת (למשל שליפת עובד ואז שאילתה נפרדת לכל department). הפתרון: `JOIN` מראש, `Eager Loading` ב-ORM, או שימוש ב-`IN` לטעינה מרוכזת.

**19. מה ההבדל בין Optimistic Locking ל-Pessimistic Locking?**
Pessimistic Locking נועל שורה בזמן קריאה (`SELECT ... FOR UPDATE`) ומונע גישה מקבילה. Optimistic Locking לא נועל, אלא בודק גרסה/timestamp בזמן העדכון ומבטל אם משהו השתנה בינתיים - מתאים לעומסי קריאה גבוהים עם עדכונים נדירים.

**20. הסבירו Deadlock וכיצד למנוע אותו.**
מצב שבו שתי עסקאות נועלות משאבים בסדר הפוך וממתינות זו לזו לנצח. המנוע מזהה ומבטל אוטומטית אחת מהעסקאות. מניעה: לגשת למשאבים תמיד באותו סדר עקבי (למשל תמיד לפי `employee_id` עולה), עסקאות קצרות ומהירות ככל האפשר.

**21. מה ההבדל בין Sharding ל-Partitioning?**
Partitioning מחלק טבלה גדולה לחלקים לוגיים **בתוך אותו מסד נתונים** (למשל לפי טווח תאריכים). Sharding מפזר נתונים על פני **מספר שרתי מסד נתונים נפרדים לגמרי**, כל אחד עם תת-קבוצה של הנתונים.

**22. איך תתכננו סכימה עבור Multi-Tenant SaaS?**
שלוש גישות עיקריות: (1) מסד נתונים נפרד לכל לקוח - בידוד מלא, תחזוקה יקרה; (2) Schema נפרד לכל לקוח באותו מסד - בידוד טוב, ניהול בינוני; (3) טבלאות משותפות עם עמודת `tenant_id` - הכי זול לתחזוקה, דורש משמעת קפדנית ב-WHERE כדי למנוע דליפת מידע בין לקוחות.

**23. מה זה Covering Index ומתי הוא משפר ביצועים?**
אינדקס שמכיל את כל העמודות הדרושות לשאילתה, כך שהמנוע לא צריך לגשת לטבלה המקורית כלל (Index-Only Scan) - משפר ביצועים משמעותית בשאילתות תכופות שמסננות ומחזירות עמודות ידועות מראש.

**24. איך תבצעו מיגרציית סכימה (Schema Migration) גדולה בלי Downtime?**
גישת Expand-Contract: (1) הוסיפו עמודה/טבלה חדשה בלי למחוק את הישנה; (2) עדכנו את האפליקציה לכתוב לשני המקומות; (3) גבו נתונים היסטוריים (Backfill); (4) העבירו קריאה לעמודה החדשה; (5) רק אז מחקו את הישנה - כל שלב Deploy נפרד וניתן לביטול (Rollback).

**25. מהו Two-Phase Commit (2PC), ומתי נדרש?**
פרוטוקול לשמירה על Atomicity בעסקה שחוצה מספר מסדי נתונים/שירותים נפרדים: שלב Prepare (כולם מאשרים מוכנות) ואז שלב Commit (כולם מבצעים בפועל). נדרש בארכיטקטורות Microservices עם עסקאות מבוזרות, אך יקר בביצועים - לרוב מוחלף ב-Saga Pattern במערכות מודרניות.

## סימולציית תרחיש (Scenario-Based) - נפוץ בראיונות Senior

> **שאלה:** "שאילתה שרצה מהר על סביבת הפיתוח לוקחת 30 שניות בפרודקשן על טבלה עם 50 מיליון שורות. איך תגשו לאבחון ופתרון הבעיה?"

**תשובה מומלצת:** להתחיל מ-`EXPLAIN ANALYZE` כדי לזהות אם יש Seq Scan במקום Index Scan. לבדוק אם קיים אינדקס מתאים על עמודות ה-WHERE/JOIN, ואם סדר העמודות באינדקס המורכב תואם את דפוס השאילתה. לבדוק אם יש Implicit Type Conversion שמונע שימוש באינדקס. לוודא שהסטטיסטיקה (`ANALYZE`) עדכנית. לשקול Partitioning אם הטבלה גדלה משמעותית. ולבסוף לבדוק אם ניתן לצמצם את כמות הנתונים הנסרקים באמצעות Denormalization/Materialized View לדוחות תכופים.

## רשימת טיפים וטריקים כלליים (Cheat Sheet)

### פקודות שימושיות לאבחון

```sql
-- PostgreSQL - שאילתות איטיות פעילות כרגע
SELECT pid, now() - query_start AS duration, query
FROM pg_stat_activity
WHERE state = 'active'
ORDER BY duration DESC;

-- PostgreSQL - גודל טבלאות
SELECT relname, pg_size_pretty(pg_total_relation_size(relid))
FROM pg_catalog.pg_statio_user_tables
ORDER BY pg_total_relation_size(relid) DESC;

-- MySQL - שאילתות איטיות (דורש Slow Query Log מופעל)
SHOW VARIABLES LIKE 'slow_query_log%';

-- MySQL - תהליכים פעילים
SHOW PROCESSLIST;
```

### עקרונות עבודה מומלצים

1. **תמיד תכננו סכימה לפני כתיבת קוד** — שינויי מבנה יקרים בפרודקשן, ובמיוחד בטבלאות גדולות.
2. **גיבוי לפני כל שינוי מבני משמעותי** — `ALTER TABLE` על טבלה גדולה יכול לנעול אותה לזמן ממושך; תמיד יש תוכנית Rollback.
3. **הימנעו מ-`SELECT *` בקוד פרודקשן** — ציינו עמודות במפורש, מטעמי ביצועים ותחזוקה.
4. **בדקו כל UPDATE/DELETE עם SELECT זהה קודם** — ודאו שה-WHERE מסנן בדיוק את מה שהתכוונתם.
5. **Parameterized Queries תמיד** — ההגנה החשובה ביותר מפני SQL Injection.
6. **אינדקסו לפי דפוסי שימוש אמיתיים** — לא כל עמודה זקוקה לאינדקס; מדדו לפני שמוסיפים.
7. **עקבו אחר Least Privilege** — לכל משתמש/אפליקציה רק ההרשאות הדרושות.
8. **תעדו Denormalization/Triggers מכוונים** — מפתח עתידי צריך להבין שזו החלטה, לא באג.
9. **בדקו שחזור גיבויים בפועל (Restore Drill)** — גיבוי שלא נבדק אינו גיבוי אמין.
10. **למדו לקרוא Query Plans** — `EXPLAIN`/`EXPLAIN ANALYZE` הם הכלי החשוב ביותר לאבחון ביצועים.

## קישורים חיצוניים

**תיעוד רשמי:**
- PostgreSQL Documentation המלא: https://www.postgresql.org/docs/current/
- MySQL Reference Manual: https://dev.mysql.com/doc/refman/8.0/en/
- W3Schools SQL (תרגול אינטראקטיבי): https://www.w3schools.com/sql/

**סרטוני YouTube מומלצים (הכנה לראיונות):**
- freeCodeCamp - SQL Full Course for Beginners: https://www.youtube.com/watch?v=HXV3zeQKqGY
- Programming with Mosh - SQL Tutorial: https://www.youtube.com/watch?v=7S_tz1z_5bA
- Socratica - SQL Databases (סדרה מלאה): https://www.youtube.com/watch?v=nWyyDHhTxYU
- Hussein Nasser - Database Engineering Deep Dives: https://www.youtube.com/watch?v=xUpaAtq0Xhc

---
⬅️ [חזרה למדריך 9](/sql/09-security-permissions/) | 🏠 [חזרה למדריך 1 - מבוא](/sql/01-mavo-le-databases/)

---

## אינדקס כל 10 המדריכים

1. [מבוא למסדי נתונים, RDBMS מול NoSQL ומנועים נפוצים](/sql/01-mavo-le-databases/)
2. [SQL בסיסי - SELECT, WHERE, ORDER BY ו-JOINs](/sql/02-select-where-join/)
3. [DDL - CREATE TABLE, טיפוסי נתונים ו-Constraints](/sql/03-ddl-tables-constraints/)
4. [DML - INSERT/UPDATE/DELETE, Transactions ו-ACID](/sql/04-dml-transactions/)
5. [Indexes, EXPLAIN ואופטימיזציית שאילתות](/sql/05-indexes-performance/)
6. [Normalization - 1NF, 2NF, 3NF ו-Denormalization](/sql/06-normalization/)
7. [Views, Stored Procedures, Functions ו-Triggers](/sql/07-views-procedures-triggers/)
8. [Backup & Recovery, Point-in-Time Recovery ו-Replication](/sql/08-backup-recovery/)
9. [ניהול הרשאות, GRANT/REVOKE ומניעת SQL Injection](/sql/09-security-permissions/)
10. [שאלות ראיון עבודה מקיפות על SQL + טיפים כלליים](/sql/10-שאלות-ראיון-sql/) (המדריך הנוכחי)
