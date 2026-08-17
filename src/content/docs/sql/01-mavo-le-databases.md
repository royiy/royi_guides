---
title: "מבוא למסדי נתונים, RDBMS מול NoSQL ומנועים נפוצים"
category: SQL
part: 1/10
---

## מה זה מסד נתונים?

מסד נתונים (Database) הוא אוסף מאורגן של מידע, המאוחסן ומנוהל בצורה המאפשרת גישה, עדכון וניתוח יעילים. במקום לשמור נתונים בקבצי טקסט או Excel, מסדי נתונים מספקים מנגנונים לשמירה על **תקינות הנתונים (Integrity)**, **ביצועים (Performance)** בקנה מידה גדול, **בקרת גישה (Access Control)** ו**עמידות בפני תקלות (Durability)**.

מערכת ניהול מסד הנתונים (DBMS - Database Management System) היא התוכנה שמתווכת בין המשתמש/האפליקציה לבין הנתונים בפועל על הדיסק. היא אחראית על הרצת שאילתות (Queries), ניהול Transactions, אכיפת הרשאות, ואופטימיזציה של ביצועים.

SQL (Structured Query Language) היא שפת התקן לתקשורת עם מסדי נתונים רלציוניים (RDBMS). היא פותחה בשנות ה-70 ב-IBM, ומאז הפכה לשפה הנפוצה ביותר בעולם לניהול נתונים מובנים - כמעט כל מנוע מסד נתונים רלציוני תומך בגרסה כלשהי של תקן ה-SQL (ANSI SQL).

### עקרונות מפתח

- **Schema (סכימה)** — ההגדרה המבנית של הנתונים: טבלאות, עמודות, טיפוסים ויחסים ביניהם.
- **Table (טבלה)** — יחידת האחסון הבסיסית ב-RDBMS, המורכבת משורות (Rows/Records) ועמודות (Columns/Fields).
- **Primary Key** — עמודה (או צירוף עמודות) המזהה שורה בצורה ייחודית בטבלה.
- **Relationship (יחס)** — קשר בין טבלאות, לרוב באמצעות Foreign Key, המאפשר לחבר נתונים ממספר טבלאות.
- **Query (שאילתה)** — פקודה שמבקשת, משנה או יוצרת נתונים במסד הנתונים.

## Relational (RDBMS) לעומת NoSQL

מסדי נתונים רלציוניים (RDBMS) מארגנים מידע בטבלאות עם סכימה קשיחה (Schema-on-Write) ותומכים ב-**JOIN** בין טבלאות ובעסקאות (Transactions) עם תכונות **ACID**. מסדי NoSQL, לעומת זאת, מוותרים לרוב על סכימה קשיחה או על JOINs, בתמורה לגמישות, קנה מידה אופקי (Horizontal Scaling) פשוט יותר, וביצועים גבוהים במקרי שימוש ספציפיים.

```
+---------------------------+          +----------------------------+
|          RDBMS            |          |           NoSQL             |
|----------------------------|          |----------------------------|
| טבלאות + שורות + עמודות    |          | Documents / Key-Value /     |
| Schema קשיח מראש           |          | Wide-Column / Graph          |
| JOIN בין טבלאות            |          | לרוב ללא JOIN מובנה          |
| ACID Transactions          |          | BASE (Eventually Consistent)|
| Scale Vertically (בעיקר)   |          | Scale Horizontally בקלות     |
+---------------------------+          +----------------------------+
```

טבלת השוואה מורחבת:

| קריטריון | RDBMS | NoSQL |
|---|---|---|
| מודל נתונים | טבלאות עם סכימה קבועה | מסמכים (Document), Key-Value, Column-family, Graph |
| שפת שאילתות | SQL (תקן אחיד יחסית) | משתנה לפי מנוע (לדוגמה MongoDB Query Language) |
| עסקאות | ACID מובנה ומחייב | לרוב BASE, חלק תומכים ACID חלקי (למשל MongoDB 4+) |
| קנה מידה | Vertical Scaling בעיקר, Sharding מורכב | Horizontal Scaling טבעי ופשוט יותר |
| קשרים בין נתונים | JOIN מובנה ויעיל | לרוב Denormalization או Embedding |
| דוגמאות מנועים | MySQL, PostgreSQL, SQL Server, Oracle | MongoDB, Redis, Cassandra, DynamoDB, Neo4j |
| מתי להשתמש | נתונים מובנים עם קשרים מורכבים, דרישת עקביות חזקה | נתונים לא מובנים/משתנים, קנה מידה עצום, כתיבה מהירה |

## מנועי RDBMS נפוצים

| מנוע | חברה/קהילה | מאפיינים בולטים |
|---|---|---|
| **MySQL** | Oracle (קוד פתוח) | פופולרי מאוד באתרי אינטרנט (WordPress, LAMP Stack), מהיר לקריאה |
| **PostgreSQL** | קהילת קוד פתוח | עשיר בתכונות, תומך JSON, GIS, Full-Text Search, מוגדר כ"הכי תקני" ל-SQL |
| **SQL Server** | Microsoft | אינטגרציה טובה עם עולם Windows/.NET, כלי ניהול חזקים (SSMS) |
| **Oracle Database** | Oracle | Enterprise-grade, ביצועים גבוהים בקנה מידה ענק, יקר יחסית |
| **SQLite** | קוד פתוח | מסד נתונים מוטבע (Embedded) ללא שרת נפרד, קובץ יחיד |

## דוגמת סכימה - מסד הנתונים לאורך המדריכים

לאורך כל סדרת המדריכים נשתמש בסכימה עקבית של חברה עם עובדים, מחלקות והזמנות:

```sql
-- טבלת מחלקות
CREATE TABLE departments (
    department_id   INT PRIMARY KEY,
    department_name VARCHAR(100) NOT NULL,
    location        VARCHAR(100)
);

-- טבלת עובדים
CREATE TABLE employees (
    employee_id     INT PRIMARY KEY,
    first_name      VARCHAR(50) NOT NULL,
    last_name       VARCHAR(50) NOT NULL,
    email           VARCHAR(100) UNIQUE,
    hire_date       DATE,
    salary          DECIMAL(10,2),
    department_id   INT,
    FOREIGN KEY (department_id) REFERENCES departments(department_id)
);

-- טבלת הזמנות
CREATE TABLE orders (
    order_id        INT PRIMARY KEY,
    customer_name   VARCHAR(100),
    order_date      DATE,
    total_amount    DECIMAL(10,2),
    employee_id     INT,
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id)
);
```

בדיקה מהירה שהכל נוצר כמצופה:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'; -- PostgreSQL; ב-MySQL: table_schema = DATABASE()
```

## התחברות למסד נתונים - דוגמאות מהירות

```bash
# PostgreSQL - psql CLI
psql -h localhost -U postgres -d company_db

# MySQL CLI
mysql -h localhost -u root -p company_db

# SQL Server - sqlcmd
sqlcmd -S localhost -U sa -P 'YourPassword' -d company_db
```

## טיפים וטריקים

1. **בחרו את המנוע לפי הצורך, לא לפי פופולריות** — PostgreSQL מתאים לרוב מקרי השימוש הכלליים, MySQL מהיר לקריאה עתירת נפח, SQL Server טבעי בסביבות Microsoft.
2. **תמיד תכננו את הסכימה לפני כתיבת קוד** — שינויי מבנה (Migrations) בפרודקשן יקרים יותר משינוי בשלב התכנון.
3. **השתמשו בכלי GUI לחקירה ראשונית** — pgAdmin (PostgreSQL), MySQL Workbench, Azure Data Studio (SQL Server) מאיצים עבודה יומיומית.
4. **הכירו את ה-`information_schema`** — תקן ANSI המאפשר לשאול מטא-דאטה (טבלאות, עמודות, מפתחות) בצורה אחידה כמעט בכל מנוע:
   ```sql
   SELECT column_name, data_type
   FROM information_schema.columns
   WHERE table_name = 'employees';
   ```
5. **אל תפחדו מ-NoSQL כשמתאים** — לעיתים שילוב (Polyglot Persistence) של RDBMS למידע טרנזקציוני ו-NoSQL למידע לא מובנה הוא הפתרון הנכון.

## שאלות נפוצות לתרגול עצמי

- מהם ההבדלים המרכזיים בין RDBMS ל-NoSQL, ומתי תבחרו בכל אחד?
- מהי משמעות ה-Schema-on-Write לעומת Schema-on-Read?
- אילו ארבעה מודלים עיקריים קיימים בעולם ה-NoSQL?
- מדוע SQL נחשבת לשפה "תקנית" (Standard) גם כשכל מנוע מוסיף הרחבות משלו?

## קישורים חיצוניים

**תיעוד רשמי:**
- PostgreSQL Documentation: https://www.postgresql.org/docs/current/tutorial-concepts.html
- MySQL Reference Manual: https://dev.mysql.com/doc/refman/8.0/en/what-is-mysql.html
- W3Schools SQL Intro: https://www.w3schools.com/sql/sql_intro.asp

**סרטוני YouTube מומלצים:**
- freeCodeCamp - SQL Full Course for Beginners: https://www.youtube.com/watch?v=HXV3zeQKqGY
- Programming with Mosh - SQL Tutorial: https://www.youtube.com/watch?v=7S_tz1z_5bA
- Socratica - SQL Databases: https://www.youtube.com/watch?v=nWyyDHhTxYU

---
⬅️ המדריך הבא: [02-select-where-join.md](/sql/02-select-where-join/) — SQL בסיסי: SELECT, WHERE, ORDER BY ו-JOINs
