---
title: "DDL - CREATE TABLE, טיפוסי נתונים ו-Constraints"
category: SQL
part: 3/10
---

## מה זה DDL?

DDL (Data Definition Language) הוא תת-קבוצה של פקודות SQL המשמשות להגדרת ולשינוי המבנה (Schema) של מסד הנתונים - יצירה, שינוי ומחיקה של טבלאות, אינדקסים וסכימות. הפקודות המרכזיות הן `CREATE`, `ALTER` ו-`DROP`. בניגוד ל-DML (שמטפל בנתונים עצמם), DDL עוסק במבנה - ובמנועים רבים פעולות DDL מבצעות **Commit אוטומטי** (לא ניתן לבצע Rollback עליהן באותה קלות כמו DML).

### עקרונות מפתח

- **Schema-First Design** — תכנון מבנה הטבלאות מראש, כולל טיפוסים ומגבלות, מונע בעיות תקינות נתונים בעתיד.
- **Constraint (מגבלה)** — כלל שהמסד אוכף אוטומטית על הנתונים (למשל "שכר לא יכול להיות שלילי").
- **Idempotent DDL** — שימוש ב-`IF NOT EXISTS` / `IF EXISTS` מונע שגיאות בהרצות חוזרות של סקריפטים.

## טיפוסי נתונים נפוצים (Data Types)

| קטגוריה | PostgreSQL | MySQL | SQL Server | הערות |
|---|---|---|---|---|
| מספר שלם | `INTEGER`, `BIGINT` | `INT`, `BIGINT` | `INT`, `BIGINT` | טווח לפי גודל |
| מספר עשרוני מדויק | `NUMERIC(p,s)` | `DECIMAL(p,s)` | `DECIMAL(p,s)` | מומלץ לכסף |
| מחרוזת קצרה | `VARCHAR(n)` | `VARCHAR(n)` | `VARCHAR(n)`/`NVARCHAR(n)` | אורך משתנה |
| מחרוזת ארוכה | `TEXT` | `TEXT` | `VARCHAR(MAX)` | ללא הגבלת אורך משמעותית |
| תאריך | `DATE` | `DATE` | `DATE` | ללא שעה |
| תאריך+שעה | `TIMESTAMP` | `DATETIME` | `DATETIME2` | עם דיוק שברירי |
| בוליאני | `BOOLEAN` | `TINYINT(1)` | `BIT` | MySQL אין BOOLEAN אמיתי |
| JSON | `JSONB`/`JSON` | `JSON` | `NVARCHAR` + פונקציות JSON | JSONB ב-PostgreSQL עם אינדוקס |
| UUID | `UUID` | `CHAR(36)` | `UNIQUEIDENTIFIER` | מזהה ייחודי גלובלי |

## CREATE TABLE - יצירת טבלה

```sql
CREATE TABLE departments (
    department_id   SERIAL PRIMARY KEY,             -- PostgreSQL: auto-increment
    department_name VARCHAR(100) NOT NULL UNIQUE,
    location        VARCHAR(100),
    budget          DECIMAL(12,2) CHECK (budget >= 0)
);

CREATE TABLE employees (
    employee_id     SERIAL PRIMARY KEY,
    first_name      VARCHAR(50)  NOT NULL,
    last_name       VARCHAR(50)  NOT NULL,
    email           VARCHAR(100) NOT NULL UNIQUE,
    hire_date        DATE NOT NULL DEFAULT CURRENT_DATE,
    salary          DECIMAL(10,2) CHECK (salary > 0),
    department_id   INT,
    manager_id       INT,
    CONSTRAINT fk_department
        FOREIGN KEY (department_id) REFERENCES departments(department_id)
        ON DELETE SET NULL,
    CONSTRAINT fk_manager
        FOREIGN KEY (manager_id) REFERENCES employees(employee_id)
);

CREATE TABLE orders (
    order_id        SERIAL PRIMARY KEY,
    customer_name   VARCHAR(100) NOT NULL,
    order_date      DATE DEFAULT CURRENT_DATE,
    total_amount    DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
    employee_id     INT REFERENCES employees(employee_id)
);
```

הערה: ב-MySQL משתמשים ב-`AUTO_INCREMENT` במקום `SERIAL`, וב-SQL Server ב-`IDENTITY(1,1)`.

```sql
-- MySQL
CREATE TABLE departments (
    department_id INT AUTO_INCREMENT PRIMARY KEY,
    department_name VARCHAR(100) NOT NULL
);

-- SQL Server
CREATE TABLE departments (
    department_id INT IDENTITY(1,1) PRIMARY KEY,
    department_name VARCHAR(100) NOT NULL
);
```

## Constraints - סוגי המגבלות המרכזיים

| Constraint | תפקיד | דוגמה |
|---|---|---|
| **PRIMARY KEY** | מזהה ייחודי לכל שורה, לא יכול להיות NULL | `employee_id INT PRIMARY KEY` |
| **FOREIGN KEY** | מבטיח שהערך קיים בטבלה אחרת (שמירת Referential Integrity) | `FOREIGN KEY (dept_id) REFERENCES departments(id)` |
| **UNIQUE** | מונע ערכים כפולים בעמודה | `email VARCHAR(100) UNIQUE` |
| **NOT NULL** | מחייב ערך בעמודה | `first_name VARCHAR(50) NOT NULL` |
| **CHECK** | אוכף תנאי לוגי על הערך | `CHECK (salary > 0)` |
| **DEFAULT** | ערך ברירת מחדל כשלא סופק ערך | `hire_date DATE DEFAULT CURRENT_DATE` |

### פעולות ON DELETE / ON UPDATE ל-Foreign Key

```sql
-- CASCADE: מחיקת מחלקה תמחק גם את העובדים בה
FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE CASCADE

-- SET NULL: מחיקת מחלקה תשאיר את העובד עם department_id = NULL
FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE SET NULL

-- RESTRICT (ברירת מחדל ברוב המנועים): מונע מחיקת מחלקה שיש לה עובדים
FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE RESTRICT
```

## ALTER TABLE - שינוי מבנה טבלה קיימת

```sql
-- הוספת עמודה
ALTER TABLE employees ADD COLUMN phone VARCHAR(20);

-- שינוי טיפוס עמודה
ALTER TABLE employees ALTER COLUMN salary TYPE DECIMAL(12,2); -- PostgreSQL
ALTER TABLE employees MODIFY COLUMN salary DECIMAL(12,2);      -- MySQL

-- הוספת Constraint לטבלה קיימת
ALTER TABLE employees ADD CONSTRAINT chk_salary CHECK (salary > 0);

-- מחיקת עמודה
ALTER TABLE employees DROP COLUMN phone;

-- שינוי שם עמודה
ALTER TABLE employees RENAME COLUMN phone TO mobile_phone;

-- מחיקת Constraint
ALTER TABLE employees DROP CONSTRAINT chk_salary;
```

## DROP ו-TRUNCATE

```sql
-- מחיקת טבלה כולל המבנה (בלתי הפיך ללא Backup)
DROP TABLE IF EXISTS temp_table;

-- ריקון כל השורות בטבלה, שמירה על המבנה (מהיר מ-DELETE, לא ניתן ל-Rollback ברוב המנועים)
TRUNCATE TABLE audit_log;
```

## טיפים וטריקים

1. **תמיד הוסיפו `IF NOT EXISTS` / `IF EXISTS`** בסקריפטים לפריסה (Deployment) — מונע כשלון בהרצה חוזרת:
   ```sql
   CREATE TABLE IF NOT EXISTS employees (...);
   DROP TABLE IF EXISTS old_table;
   ```
2. **תנו שמות מפורשים ל-Constraints** (`CONSTRAINT fk_department FOREIGN KEY ...`) — מקל מאוד על דיבוג שגיאות ומחיקה עתידית, במקום שם אוטומטי לא קריא.
3. **השתמשו ב-`CHECK` לאכיפת כללי עסק פשוטים** — עדיף לתפוס בעיית נתונים במסד מאשר לגלות אותה בקוד האפליקציה.
4. **היזהרו מ-`ON DELETE CASCADE`** — נוח אך מסוכן; מחיקה בטעות עלולה "לגלוש" ולמחוק נתונים קשורים רבים. שקלו `RESTRICT` או Soft Delete (עמודת `is_deleted`) בטבלאות קריטיות.
5. **הריצו DDL בסביבת Staging לפני Production** — במיוחד `ALTER TABLE` על טבלאות גדולות, שעלול לנעול (Lock) את הטבלה לזמן ממושך.

## שאלות נפוצות לתרגול עצמי

- מה ההבדל בין `DELETE`, `TRUNCATE` ו-`DROP`?
- מהו ההבדל בין `PRIMARY KEY` ל-`UNIQUE`?
- מה קורה כשמנסים למחוק שורה בטבלת `departments` שיש לה עובדים תלויים ללא `ON DELETE` מוגדר?
- כיצד תוסיפו Constraint חדש לטבלה קיימת שכבר מכילה נתונים שאינם תואמים לו?

## קישורים חיצוניים

**תיעוד רשמי:**
- PostgreSQL - CREATE TABLE: https://www.postgresql.org/docs/current/sql-createtable.html
- MySQL - Constraints: https://dev.mysql.com/doc/refman/8.0/en/constraints.html
- W3Schools SQL Constraints: https://www.w3schools.com/sql/sql_constraints.asp

**סרטוני YouTube מומלצים:**
- freeCodeCamp - SQL Full Course: https://www.youtube.com/watch?v=HXV3zeQKqGY
- Programming with Mosh - Database Design: https://www.youtube.com/watch?v=ztHopE5Wnpc
- Socratica - SQL Constraints: https://www.youtube.com/watch?v=EI44ap_kBLc

---
⬅️ המדריך הבא: [04-dml-transactions.md](/sql/04-dml-transactions/) — DML: INSERT/UPDATE/DELETE, Transactions ו-ACID
