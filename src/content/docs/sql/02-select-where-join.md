---
title: "SQL בסיסי - SELECT, WHERE, ORDER BY ו-JOINs"
category: SQL
part: 2/10
---

## שאילתת SELECT הבסיסית

הפקודה `SELECT` היא ליבת השפה - היא מאפשרת לשלוף נתונים מטבלה אחת או יותר. המבנה הכללי הוא:

```sql
SELECT column1, column2
FROM table_name
WHERE condition
ORDER BY column1;
```

סדר הכתיבה (SELECT ... FROM ... WHERE ... ORDER BY) אינו זהה לסדר הביצוע בפועל של המנוע. מנוע ה-SQL מבצע לוגית קודם `FROM`, אחר כך `WHERE`, לאחר מכן `GROUP BY`/`HAVING`, ורק בסוף `SELECT` ו-`ORDER BY`. הבנת סדר הביצוע הזה חשובה מאוד כדי להבין למה אי אפשר להשתמש ב-Alias שהוגדר ב-SELECT בתוך WHERE.

### עקרונות מפתח

- **`SELECT *`** — שולף את כל העמודות; נוח לבדיקות אך לא מומלץ בקוד פרודקשן (פגיעה בביצועים ותחזוקה).
- **`DISTINCT`** — מסנן שורות כפולות מתוצאת השאילתה.
- **`ALIAS` (כינוי)** — שם זמני לעמודה או לטבלה, באמצעות `AS`, לשיפור קריאות.
- **`LIMIT` / `TOP` / `FETCH`** — הגבלת מספר השורות המוחזרות (תחביר שונה לפי מנוע).

## שאילתות SELECT בסיסיות

```sql
-- שליפת כל העובדים
SELECT * FROM employees;

-- שליפת עמודות ספציפיות עם Alias
SELECT
    first_name AS "שם פרטי",
    last_name  AS "שם משפחה",
    salary
FROM employees;

-- ערכים ייחודיים
SELECT DISTINCT department_id FROM employees;

-- הגבלת תוצאות
SELECT * FROM employees ORDER BY salary DESC LIMIT 5;      -- PostgreSQL / MySQL
SELECT TOP 5 * FROM employees ORDER BY salary DESC;          -- SQL Server
```

## סינון עם WHERE

`WHERE` מסנן שורות לפי תנאי לוגי, לפני שנעשית קבוצתיות או מיון.

```sql
-- תנאי פשוט
SELECT * FROM employees WHERE department_id = 3;

-- אופרטורים לוגיים
SELECT * FROM employees
WHERE salary > 15000 AND department_id IN (1, 2, 3);

-- טווח ערכים
SELECT * FROM employees WHERE hire_date BETWEEN '2020-01-01' AND '2023-12-31';

-- חיפוש טקסטואלי (LIKE)
SELECT * FROM employees WHERE email LIKE '%@company.com';
SELECT * FROM employees WHERE first_name LIKE 'ד%'; -- מתחיל באות ד'

-- ערכים חסרים
SELECT * FROM employees WHERE department_id IS NULL;

-- שלילה
SELECT * FROM employees WHERE NOT department_id = 5;
```

## מיון עם ORDER BY

```sql
-- מיון עולה (ברירת מחדל)
SELECT * FROM employees ORDER BY salary;

-- מיון יורד
SELECT * FROM employees ORDER BY salary DESC;

-- מיון לפי מספר עמודות
SELECT * FROM employees ORDER BY department_id ASC, salary DESC;
```

## JOINs - חיבור בין טבלאות

JOIN מאפשר לשלב נתונים משתי טבלאות (או יותר) על סמך עמודה משותפת - בדרך כלל Primary Key מול Foreign Key.

```
employees                          departments
+----+-------+------+       +----+-----------+
| id | name  | dept |       | id | dept_name |
+----+-------+------+       +----+-----------+
| 1  | דנה   |  1   |  <--> | 1  | פיתוח     |
| 2  | יוסי  |  2   |       | 2  | שיווק     |
| 3  | מאיה  | NULL |       | 3  | כספים     |
+----+-------+------+       +----+-----------+
```

| סוג JOIN | מה הוא מחזיר |
|---|---|
| **INNER JOIN** | רק שורות שיש להן התאמה בשתי הטבלאות |
| **LEFT JOIN** | כל שורות הטבלה השמאלית + התאמות מהימנית (NULL אם אין) |
| **RIGHT JOIN** | כל שורות הטבלה הימנית + התאמות מהשמאלית (NULL אם אין) |
| **FULL OUTER JOIN** | כל השורות משתי הטבלאות, עם NULL היכן שאין התאמה |
| **CROSS JOIN** | מכפלה קרטזית - כל שילוב אפשרי בין השורות |
| **SELF JOIN** | טבלה מצטרפת לעצמה (למשל היררכיית מנהלים) |

### דוגמאות מעשיות

```sql
-- INNER JOIN - רק עובדים ששייכים למחלקה קיימת
SELECT e.first_name, e.last_name, d.department_name
FROM employees e
INNER JOIN departments d ON e.department_id = d.department_id;

-- LEFT JOIN - כל העובדים, גם אלו ללא מחלקה (department_id IS NULL)
SELECT e.first_name, d.department_name
FROM employees e
LEFT JOIN departments d ON e.department_id = d.department_id;

-- RIGHT JOIN - כל המחלקות, גם אלו ללא עובדים
SELECT e.first_name, d.department_name
FROM employees e
RIGHT JOIN departments d ON e.department_id = d.department_id;

-- FULL OUTER JOIN - כל השורות משני הצדדים (לא נתמך ב-MySQL ישירות, אפשר עם UNION)
SELECT e.first_name, d.department_name
FROM employees e
FULL OUTER JOIN departments d ON e.department_id = d.department_id;

-- JOIN בין 3 טבלאות - עובדים, מחלקות והזמנות שטיפלו בהן
SELECT e.first_name, d.department_name, o.order_id, o.total_amount
FROM employees e
JOIN departments d ON e.department_id = d.department_id
JOIN orders o ON o.employee_id = e.employee_id
WHERE o.total_amount > 1000
ORDER BY o.total_amount DESC;

-- SELF JOIN - מציאת עובדים באותה מחלקה
SELECT e1.first_name AS employee1, e2.first_name AS employee2, e1.department_id
FROM employees e1
JOIN employees e2 ON e1.department_id = e2.department_id AND e1.employee_id < e2.employee_id;
```

## טיפים וטריקים

1. **תמיד השתמשו ב-Alias בטבלאות ב-JOIN** — משפר קריאות ומונע עמימות כששתי הטבלאות חולקות שם עמודה זהה (`e.department_id` לעומת `d.department_id`).
2. **הימנעו מ-`SELECT *` בקוד פרודקשן** — פגיעה בביצועים, וקוד שביר אם מבנה הטבלה משתנה. תמיד ציינו עמודות במפורש.
3. **זכרו את סדר הביצוע הלוגי** — `FROM` → `WHERE` → `GROUP BY` → `HAVING` → `SELECT` → `ORDER BY`. זה מסביר למה אי אפשר לסנן ב-WHERE לפי Alias שהוגדר ב-SELECT.
4. **בדקו LEFT JOIN עם WHERE בזהירות** — הוספת תנאי WHERE על עמודה מהטבלה הימנית (למשל `d.location = 'תל אביב'`) עלולה "להפוך" LEFT JOIN ל-INNER JOIN בפועל, כי שורות עם NULL ייפסלו:
   ```sql
   -- הפתרון: להעביר את התנאי ל-ON ולא ל-WHERE
   SELECT e.first_name, d.department_name
   FROM employees e
   LEFT JOIN departments d ON e.department_id = d.department_id AND d.location = 'תל אביב';
   ```
5. **`COALESCE`** שימושי מאוד להצגת ערך ברירת מחדל במקום NULL:
   ```sql
   SELECT first_name, COALESCE(department_id, 0) AS dept
   FROM employees;
   ```

## שאלות נפוצות לתרגול עצמי

- מה ההבדל בין INNER JOIN ל-LEFT JOIN, ומתי תבחרו בכל אחד?
- מדוע הוספת תנאי WHERE על הטבלה הימנית ב-LEFT JOIN עלולה לשנות את התוצאה?
- מהו סדר הביצוע הלוגי של שאילתת SELECT?
- כיצד תממשו FULL OUTER JOIN במנוע שלא תומך בו ישירות (כמו MySQL)?

## קישורים חיצוניים

**תיעוד רשמי:**
- PostgreSQL - SELECT: https://www.postgresql.org/docs/current/sql-select.html
- MySQL - JOIN Syntax: https://dev.mysql.com/doc/refman/8.0/en/join.html
- W3Schools SQL JOIN: https://www.w3schools.com/sql/sql_join.asp

**סרטוני YouTube מומלצים:**
- freeCodeCamp - SQL Full Course: https://www.youtube.com/watch?v=HXV3zeQKqGY
- Programming with Mosh - SQL JOINs Explained: https://www.youtube.com/watch?v=9yeOJ0ZMUYw
- Socratica - SQL JOINs: https://www.youtube.com/watch?v=9yeOJ0ZMUYw

---
⬅️ המדריך הבא: [03-ddl-tables-constraints.md](/sql/03-ddl-tables-constraints/) — DDL: CREATE TABLE, טיפוסי נתונים ו-Constraints
