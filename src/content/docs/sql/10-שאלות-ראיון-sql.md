---
title: "שאלות ראיון עבודה מקיפות על SQL + טיפים כלליים"
description: "אוסף שאלות ראיון עבודה על SQL מדורגות מרמת Junior עד Senior עם תשובות תמציתיות, בנושאי JOIN, Transactions, אינדקסים ועוד, לצד טיפים כלליים לעבודה יומיומית."
category: SQL
part: 10/10
---

מדריך מסכם עם שאלות ראיון מדורגות לפי רמת קושי (Junior → Senior), כולל תשובות תמציתיות, ורשימת טיפים כלליים לעבודה יומיומית עם SQL ומסדי נתונים.

## שאלות בסיסיות (Junior)

<details class="qa">
<summary>1. מה ההבדל בין SQL ל-DBMS?</summary>

SQL היא שפת תקן לתקשורת עם מסדי נתונים רלציוניים. DBMS (Database Management System) היא התוכנה שמיישמת ומריצה את השפה - כמו PostgreSQL, MySQL או SQL Server.

</details>

<details class="qa">
<summary>2. מה ההבדל בין <code>WHERE</code> ל-<code>HAVING</code>?</summary>

`WHERE` מסנן שורות **לפני** קיבוץ (GROUP BY), ואינו יכול להשתמש בפונקציות אגרגציה. `HAVING` מסנן קבוצות **אחרי** ה-GROUP BY, ויכול להשתמש ב-`COUNT`, `SUM`, `AVG` וכו'.

</details>

<details class="qa">
<summary>3. מה ההבדל בין <code>DELETE</code>, <code>TRUNCATE</code> ו-<code>DROP</code>?</summary>

`DELETE` מוחק שורות ספציפיות (ניתן ל-Rollback, מפעיל Triggers). `TRUNCATE` מרוקן את כל הטבלה במהירות (לרוב לא ניתן ל-Rollback, לא מפעיל Triggers). `DROP` מוחק את הטבלה כולה כולל המבנה.

</details>

<details class="qa">
<summary>4. מה ההבדל בין <code>PRIMARY KEY</code> ל-<code>UNIQUE</code>?</summary>

טבלה יכולה להכיל `PRIMARY KEY` אחד בלבד (שגם אינו יכול להיות NULL), אך מספר עמודות `UNIQUE`. שניהם אוכפים ייחודיות ערכים.

</details>

<details class="qa">
<summary>5. מהו NULL ואיך משווים אליו?</summary>

NULL מייצג ערך לא ידוע/חסר. לא ניתן להשתמש ב-`= NULL`; יש להשתמש ב-`IS NULL` / `IS NOT NULL`.

</details>

<details class="qa">
<summary>6. מה ההבדל בין <code>INNER JOIN</code> ל-<code>LEFT JOIN</code>?</summary>

`INNER JOIN` מחזיר רק שורות עם התאמה בשתי הטבלאות. `LEFT JOIN` מחזיר את כל שורות הטבלה השמאלית, גם ללא התאמה (עם NULL בעמודות הימניות).

</details>

<details class="qa">
<summary>7. מה זה Foreign Key?</summary>

עמודה (או קבוצת עמודות) המפנה למפתח ראשי בטבלה אחרת, ואוכפת שהערך המצוין קיים בפועל בטבלה המקורית (Referential Integrity).

</details>

<details class="qa">
<summary>8. מהו ההבדל בין <code>COUNT(*)</code> ל-<code>COUNT(column_name)</code>?</summary>

`COUNT(*)` סופר את כל השורות (כולל שורות עם NULL בכל העמודות). `COUNT(column_name)` סופר רק שורות שבהן הערך בעמודה המסוימת אינו NULL.

</details>

## שאלות בינוניות (Mid-Level)

<details class="qa">
<summary>9. מה ההבדל בין <code>UNION</code> ל-<code>UNION ALL</code>?</summary>

`UNION` מאחד תוצאות משתי שאילתות ומסיר כפילויות (יקר יותר - דורש מיון/השוואה). `UNION ALL` מאחד ללא הסרת כפילויות (מהיר יותר).

</details>

<details class="qa">
<summary>10. הסבירו את ה-ACID.</summary>

Atomicity - הכל או כלום. Consistency - שמירה על תקינות הכללים. Isolation - עסקאות מקבילות לא רואות מצבי ביניים זו של זו. Durability - לאחר COMMIT השינוי נשמר גם בקריסת מערכת.

</details>

<details class="qa">
<summary>11. מה זה Index, ומהו ה-Trade-off בשימוש בו?</summary>

מבנה נתונים (בד"כ B-Tree) שמאיץ חיפוש נתונים. ה-Trade-off: מאיץ SELECT אך מאט INSERT/UPDATE/DELETE, כי המנוע צריך לתחזק גם את מבנה האינדקס.

</details>

<details class="qa">
<summary>12. מה ההבדל בין Subquery ל-JOIN?</summary>

Subquery היא שאילתה מקוננת בתוך שאילתה אחרת (יכולה להופיע ב-SELECT, WHERE, FROM). JOIN מחבר טבלאות "לרוחב" בשלב אחד. במקרים רבים ניתן להמיר Subquery ל-JOIN לביצועים טובים יותר, אך לא תמיד.

</details>

<details class="qa">
<summary>13. מה זה CTE (Common Table Expression)?</summary>

שאילתה זמנית מוגדרת עם `WITH`, המשמשת לפירוק שאילתות מורכבות לחלקים קריאים:
```sql
WITH high_earners AS (
    SELECT * FROM employees WHERE salary > 20000
)
SELECT department_id, COUNT(*) FROM high_earners GROUP BY department_id;
```

</details>

<details class="qa">
<summary>14. מה ההבדל בין Window Function ל-GROUP BY?</summary>

`GROUP BY` מצמצם את מספר השורות (שורה אחת לכל קבוצה). Window Function (`OVER()`) מחשב ערך אגרגטיבי **בלי** לצמצם שורות - כל שורה מקורית נשארת, עם עמודה נוספת:
```sql
SELECT employee_id, salary,
       AVG(salary) OVER (PARTITION BY department_id) AS dept_avg_salary
FROM employees;
```

</details>

<details class="qa">
<summary>15. מהי הצורה הנורמלית השלישית (3NF) בקצרה?</summary>

אין תלות טרנזיטיבית - עמודה לא-מפתח לא יכולה להיות תלויה בעמודה לא-מפתח אחרת; כל עמודה לא-מפתח תלויה ישירות במפתח הראשי בלבד.

</details>

<details class="qa">
<summary>16. איך מונעים SQL Injection?</summary>

שימוש ב-Parameterized Queries / Prepared Statements בלבד. לעולם לא לשרשר קלט משתמש ישירות למחרוזת SQL.

</details>

<details class="qa">
<summary>17. מהי תוכנית ביצוע (Query Plan) ומה עושה EXPLAIN?</summary>

`EXPLAIN` מציג כיצד המנוע מתכנן להריץ שאילתה בפועל - האם הוא משתמש באינדקס (Index Scan) או סורק את כל הטבלה (Seq Scan/Full Scan), וכמה שורות הוא צופה לעבד.

</details>

## שאלות מתקדמות (Senior)

<details class="qa">
<summary>18. איך תתמודדו עם N+1 Query Problem?</summary>

בעיה נפוצה ב-ORMs שבה כל שורה גורמת לשאילתה נוספת (למשל שליפת עובד ואז שאילתה נפרדת לכל department). הפתרון: `JOIN` מראש, `Eager Loading` ב-ORM, או שימוש ב-`IN` לטעינה מרוכזת.

</details>

<details class="qa">
<summary>19. מה ההבדל בין Optimistic Locking ל-Pessimistic Locking?</summary>

Pessimistic Locking נועל שורה בזמן קריאה (`SELECT ... FOR UPDATE`) ומונע גישה מקבילה. Optimistic Locking לא נועל, אלא בודק גרסה/timestamp בזמן העדכון ומבטל אם משהו השתנה בינתיים - מתאים לעומסי קריאה גבוהים עם עדכונים נדירים.

</details>

<details class="qa">
<summary>20. הסבירו Deadlock וכיצד למנוע אותו.</summary>

מצב שבו שתי עסקאות נועלות משאבים בסדר הפוך וממתינות זו לזו לנצח. המנוע מזהה ומבטל אוטומטית אחת מהעסקאות. מניעה: לגשת למשאבים תמיד באותו סדר עקבי (למשל תמיד לפי `employee_id` עולה), עסקאות קצרות ומהירות ככל האפשר.

</details>

<details class="qa">
<summary>21. מה ההבדל בין Sharding ל-Partitioning?</summary>

Partitioning מחלק טבלה גדולה לחלקים לוגיים **בתוך אותו מסד נתונים** (למשל לפי טווח תאריכים). Sharding מפזר נתונים על פני **מספר שרתי מסד נתונים נפרדים לגמרי**, כל אחד עם תת-קבוצה של הנתונים.

</details>

<details class="qa">
<summary>22. איך תתכננו סכימה עבור Multi-Tenant SaaS?</summary>

שלוש גישות עיקריות: (1) מסד נתונים נפרד לכל לקוח - בידוד מלא, תחזוקה יקרה; (2) Schema נפרד לכל לקוח באותו מסד - בידוד טוב, ניהול בינוני; (3) טבלאות משותפות עם עמודת `tenant_id` - הכי זול לתחזוקה, דורש משמעת קפדנית ב-WHERE כדי למנוע דליפת מידע בין לקוחות.

</details>

<details class="qa">
<summary>23. מה זה Covering Index ומתי הוא משפר ביצועים?</summary>

אינדקס שמכיל את כל העמודות הדרושות לשאילתה, כך שהמנוע לא צריך לגשת לטבלה המקורית כלל (Index-Only Scan) - משפר ביצועים משמעותית בשאילתות תכופות שמסננות ומחזירות עמודות ידועות מראש.

</details>

<details class="qa">
<summary>24. איך תבצעו מיגרציית סכימה (Schema Migration) גדולה בלי Downtime?</summary>

גישת Expand-Contract: (1) הוסיפו עמודה/טבלה חדשה בלי למחוק את הישנה; (2) עדכנו את האפליקציה לכתוב לשני המקומות; (3) גבו נתונים היסטוריים (Backfill); (4) העבירו קריאה לעמודה החדשה; (5) רק אז מחקו את הישנה - כל שלב Deploy נפרד וניתן לביטול (Rollback).

</details>

<details class="qa">
<summary>25. מהו Two-Phase Commit (2PC), ומתי נדרש?</summary>

פרוטוקול לשמירה על Atomicity בעסקה שחוצה מספר מסדי נתונים/שירותים נפרדים: שלב Prepare (כולם מאשרים מוכנות) ואז שלב Commit (כולם מבצעים בפועל). נדרש בארכיטקטורות Microservices עם עסקאות מבוזרות, אך יקר בביצועים - לרוב מוחלף ב-Saga Pattern במערכות מודרניות.

</details>

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

-- ב-MySQL: איתור שאילתות איטיות (דורש Slow Query Log מופעל)
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
