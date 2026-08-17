---
title: "DML - INSERT/UPDATE/DELETE, Transactions ו-ACID"
category: SQL
part: 4/10
---

## מה זה DML?

DML (Data Manipulation Language) היא תת-קבוצת פקודות SQL העוסקות בשינוי הנתונים עצמם בתוך הטבלאות - להבדיל מ-DDL שעוסק במבנה. הפקודות המרכזיות הן `INSERT`, `UPDATE`, `DELETE` ולעיתים גם `SELECT` (שנחשבת DQL - Data Query Language, אך לרוב משויכת ל-DML בהקשר כללי).

פעולות DML, בניגוד לרוב פעולות ה-DDL, ניתנות ל-**Rollback** במסגרת Transaction - כלומר אפשר "לבטל" אותן אם עדיין לא בוצע `COMMIT`.

### עקרונות מפתח

- **Transaction (עסקה)** — יחידת עבודה אחת או יותר המבוצעות יחד כ"הכל או כלום".
- **COMMIT** — שמירת קבועה של כל השינויים שבוצעו בעסקה.
- **ROLLBACK** — ביטול כל השינויים שבוצעו מאז תחילת העסקה (או מאז Savepoint).
- **ACID** — ארבע תכונות שמבטיחות אמינות של עסקאות: Atomicity, Consistency, Isolation, Durability.

## INSERT - הוספת נתונים

```sql
-- הוספת שורה בודדת עם ציון עמודות
INSERT INTO departments (department_id, department_name, location)
VALUES (1, 'פיתוח', 'תל אביב');

-- הוספת מספר שורות בפעולה אחת
INSERT INTO employees (employee_id, first_name, last_name, email, salary, department_id)
VALUES
    (1, 'דנה', 'כהן', 'dana@company.com', 18000, 1),
    (2, 'יוסי', 'לוי', 'yossi@company.com', 15500, 2),
    (3, 'מאיה', 'ברק', 'maya@company.com', 22000, 1);

-- הוספה מתוך שאילתת SELECT (INSERT ... SELECT)
INSERT INTO high_earners (employee_id, full_name, salary)
SELECT employee_id, first_name || ' ' || last_name, salary
FROM employees
WHERE salary > 20000;
```

## UPDATE - עדכון נתונים

```sql
-- עדכון שורה בודדת
UPDATE employees
SET salary = salary * 1.10
WHERE employee_id = 1;

-- עדכון מותנה על מספר שורות
UPDATE employees
SET department_id = 3
WHERE department_id = 1 AND hire_date < '2022-01-01';

-- עדכון עם JOIN (תחביר PostgreSQL)
UPDATE employees e
SET salary = salary * 1.05
FROM departments d
WHERE e.department_id = d.department_id
  AND d.department_name = 'פיתוח';

-- עדכון עם JOIN (תחביר MySQL)
UPDATE employees e
JOIN departments d ON e.department_id = d.department_id
SET e.salary = e.salary * 1.05
WHERE d.department_name = 'פיתוח';
```

**אזהרה קריטית**: `UPDATE` ללא `WHERE` יעדכן **את כל** השורות בטבלה. תמיד בדקו את תנאי ה-WHERE עם `SELECT` זהה לפני הרצת UPDATE בפרודקשן.

## DELETE - מחיקת נתונים

```sql
-- מחיקת שורות ספציפיות
DELETE FROM employees WHERE department_id IS NULL;

-- מחיקה עם תת-שאילתה
DELETE FROM orders
WHERE employee_id IN (SELECT employee_id FROM employees WHERE salary < 5000);
```

**אזהרה קריטית**: `DELETE` ללא `WHERE` ימחק את **כל** השורות בטבלה (אך בשונה מ-`TRUNCATE`, ניתן לבטל ב-Rollback אם עדיין בתוך Transaction).

## Transactions - עסקאות

Transaction מקבצת מספר פעולות DML לכדי יחידה אחת בלתי ניתנת לחלוקה. אם פעולה כלשהי בתוך העסקה נכשלת, ניתן לבטל את כולן יחד.

```sql
BEGIN; -- או START TRANSACTION ב-MySQL

UPDATE employees SET salary = salary - 1000 WHERE employee_id = 1;
UPDATE employees SET salary = salary + 1000 WHERE employee_id = 2;

-- אם הכל תקין:
COMMIT;

-- אם משהו השתבש:
-- ROLLBACK;
```

### שימוש ב-SAVEPOINT

Savepoint מאפשר לבטל חלק מהעסקה בלבד, בלי לבטל את כולה:

```sql
BEGIN;

INSERT INTO orders (order_id, customer_name, total_amount, employee_id)
VALUES (101, 'לקוח א', 5000, 1);

SAVEPOINT before_risky_update;

UPDATE orders SET total_amount = total_amount * 2 WHERE order_id = 101;

-- אם ההחלטה הזו שגויה, נבטל רק אותה:
ROLLBACK TO SAVEPOINT before_risky_update;

COMMIT; -- ה-INSERT נשמר, ה-UPDATE השגוי בוטל
```

## ACID - ארבעת עמודי התווך

| עיקרון | משמעות | דוגמה |
|---|---|---|
| **Atomicity (אטומיות)** | כל הפעולות בעסקה מתבצעות יחד, או שאף אחת לא מתבצעת | העברת כסף בין חשבונות - חיוב וזיכוי חייבים לקרות ביחד |
| **Consistency (עקביות)** | העסקה מעבירה את המסד ממצב תקין אחד לאחר, תוך אכיפת כל ה-Constraints | לא ניתן להשאיר Foreign Key "תלוי באוויר" |
| **Isolation (בידוד)** | עסקאות מקבילות לא "רואות" מצבי ביניים זו של זו | שני משתמשים שקוראים/כותבים באותו רגע לא יתנגשו בצורה בלתי צפויה |
| **Durability (עמידות)** | ברגע שבוצע COMMIT, השינוי נשמר גם אם המערכת קורסת מיד לאחר מכן | כתיבה ל-Write-Ahead Log לפני אישור ה-COMMIT ללקוח |

### רמות בידוד (Isolation Levels)

| רמה | מונע Dirty Read | מונע Non-Repeatable Read | מונע Phantom Read |
|---|---|---|---|
| READ UNCOMMITTED | לא | לא | לא |
| READ COMMITTED (ברירת מחדל ב-PostgreSQL/SQL Server) | כן | לא | לא |
| REPEATABLE READ (ברירת מחדל ב-MySQL) | כן | כן | לא |
| SERIALIZABLE | כן | כן | כן |

```sql
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
BEGIN;
-- ...פעולות...
COMMIT;
```

## טיפים וטריקים

1. **תמיד הריצו SELECT עם אותו WHERE לפני UPDATE/DELETE** — לוודא שהתנאי מסנן בדיוק את השורות המיועדות:
   ```sql
   SELECT * FROM employees WHERE department_id = 1 AND hire_date < '2022-01-01';
   -- רק אחרי בדיקה חזותית, הריצו UPDATE/DELETE עם אותו WHERE
   ```
2. **עטפו פעולות קריטיות מרובות ב-Transaction מפורש** — לא להסתמך על Autocommit כשמדובר בכמה פעולות תלויות זו בזו.
3. **השתמשו ב-`RETURNING`** (PostgreSQL) כדי לקבל את השורות שהושפעו ישירות בתגובה ל-INSERT/UPDATE/DELETE:
   ```sql
   UPDATE employees SET salary = salary * 1.1 WHERE employee_id = 1 RETURNING *;
   ```
4. **זהירות מ-Deadlocks** — כשעסקאות מרובות נועלות משאבים בסדר הפוך, המנוע יזהה ויבטל אחת מהן אוטומטית; תכננו את סדר העדכונים (למשל תמיד לפי `employee_id` עולה) כדי להימנע מכך.
5. **בחרו רמת Isolation מתאימה למקרה השימוש** — `SERIALIZABLE` הכי בטוח אך הכי איטי; `READ COMMITTED` מספיק לרוב האפליקציות.

## שאלות נפוצות לתרגול עצמי

- מהי המשמעות של כל אחת מארבע תכונות ה-ACID?
- מה ההבדל בין `ROLLBACK` מלא ל-`ROLLBACK TO SAVEPOINT`?
- מהו Dirty Read, ואיזו רמת Isolation מונעת אותו?
- למה מסוכן להריץ `DELETE FROM table_name;` ללא WHERE, וכיצד למנוע טעות כזו?

## קישורים חיצוניים

**תיעוד רשמי:**
- PostgreSQL - Transactions: https://www.postgresql.org/docs/current/tutorial-transactions.html
- MySQL - Transaction Isolation Levels: https://dev.mysql.com/doc/refman/8.0/en/innodb-transaction-isolation-levels.html
- W3Schools SQL Transactions: https://www.w3schools.com/sql/sql_ref_transactions.asp

**סרטוני YouTube מומלצים:**
- freeCodeCamp - SQL Full Course: https://www.youtube.com/watch?v=HXV3zeQKqGY
- Programming with Mosh - SQL Transactions: https://www.youtube.com/watch?v=7S_tz1z_5bA
- Socratica - SQL Transactions: https://www.youtube.com/watch?v=n0Qvzqe6bDA

---
⬅️ המדריך הבא: [05-indexes-performance.md](/sql/05-indexes-performance/) — Indexes, EXPLAIN ואופטימיזציית שאילתות
