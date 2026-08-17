---
title: "ניהול הרשאות, GRANT/REVOKE ומניעת SQL Injection"
category: SQL
part: 9/10
---

## למה אבטחת מסד נתונים קריטית

מסד הנתונים הוא לרוב המקום הרגיש ביותר במערכת - הוא מכיל את כל הנתונים העסקיים, כולל מידע רגיש כמו סיסמאות (מוצפנות), פרטי לקוחות ותשלומים. אבטחה נכונה מורכבת משתי שכבות עיקריות: **ניהול הרשאות (Access Control)** בתוך המסד עצמו, ו**מניעת התקפות** כמו SQL Injection מכיוון האפליקציה.

### עקרונות מפתח

- **Principle of Least Privilege** — כל משתמש/אפליקציה מקבלים רק את ההרשאות המינימליות הנדרשות לתפקידם, לא יותר.
- **Role-Based Access Control (RBAC)** — קיבוץ הרשאות ל-Roles לוגיים (כמו `readonly`, `app_writer`) במקום ניהול פרטני לכל משתמש.
- **Defense in Depth** — שכבות הגנה מרובות (הרשאות DB + Parameterized Queries + Firewall) כדי שכשל בשכבה אחת לא יחשוף את כל המערכת.

## ניהול משתמשים והרשאות - GRANT / REVOKE

```sql
-- יצירת משתמש חדש (PostgreSQL)
CREATE USER app_reader WITH PASSWORD 'StrongP@ssw0rd!';
CREATE USER app_writer WITH PASSWORD 'AnotherStr0ngP@ss!';

-- הענקת הרשאת קריאה בלבד
GRANT SELECT ON employees, departments TO app_reader;

-- הענקת הרשאות קריאה/כתיבה
GRANT SELECT, INSERT, UPDATE ON employees TO app_writer;

-- הענקת הרשאה על כל הטבלאות בסכימה (שימושי, אך היזהרו!)
GRANT SELECT ON ALL TABLES IN SCHEMA public TO app_reader;

-- שלילת הרשאה
REVOKE INSERT, UPDATE ON employees FROM app_writer;

-- מחיקת כל ההרשאות של משתמש
REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM app_reader;
```

```sql
-- MySQL - תחביר דומה
CREATE USER 'app_reader'@'%' IDENTIFIED BY 'StrongP@ssw0rd!';
GRANT SELECT ON company_db.* TO 'app_reader'@'%';
FLUSH PRIVILEGES;

REVOKE SELECT ON company_db.* FROM 'app_reader'@'%';
```

## Roles - ניהול הרשאות בקנה מידה

במקום להעניק הרשאות פרטניות לכל משתמש, נהוג ליצור **Roles** (תפקידים לוגיים) עם קבוצת הרשאות מוגדרת, ולשייך משתמשים אליהם:

```sql
-- PostgreSQL - יצירת Role ושיוך משתמשים
CREATE ROLE readonly_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_role;

CREATE ROLE app_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON employees, orders TO app_role;

-- שיוך משתמש ל-Role
GRANT readonly_role TO app_reader;
GRANT app_role TO app_writer;

-- הצגת הרשאות של Role
SELECT grantee, table_name, privilege_type
FROM information_schema.role_table_grants
WHERE grantee = 'readonly_role';
```

```sql
-- SQL Server - Roles מובנים ברמת מסד נתונים
CREATE ROLE readonly_role;
GRANT SELECT ON SCHEMA::dbo TO readonly_role;
ALTER ROLE readonly_role ADD MEMBER app_reader;

-- Roles מובנים שימושיים ב-SQL Server
-- db_datareader, db_datawriter, db_owner
ALTER ROLE db_datareader ADD MEMBER app_reader;
```

## SQL Injection - ההתקפה הנפוצה ביותר על מסדי נתונים

**SQL Injection** היא התקפה שבה תוקף מזריק קוד SQL זדוני דרך קלט משתמש (טופס, פרמטר URL וכו'), במטרה לשנות את משמעות השאילתה המקורית.

### דוגמה להתקפה - קוד פגיע

```python
# פגיע! שרשור מחרוזות ישיר - אל תעשו את זה!
username = request.form['username']  # קלט: ' OR '1'='1
query = f"SELECT * FROM users WHERE username = '{username}' AND password = '{password}'"
# השאילתה בפועל: SELECT * FROM users WHERE username = '' OR '1'='1' AND password = '...'
# מחזירה את כל המשתמשים - עוקף לחלוטין את האימות!
```

דוגמה קיצונית יותר - מחיקת טבלה שלמה:

```
קלט זדוני: '; DROP TABLE employees; --
שאילתה שנוצרת: SELECT * FROM employees WHERE last_name = ''; DROP TABLE employees; --'
```

### ההגנה: Parameterized Queries (Prepared Statements)

הפתרון האמיתי היחיד הוא **לעולם לא לשרשר קלט משתמש ישירות לתוך מחרוזת SQL**. יש להשתמש בפרמטרים (Placeholders) שהמנוע מטפל בהם בנפרד מהקוד עצמו:

```python
# בטוח - Parameterized Query (Python + psycopg2)
cursor.execute(
    "SELECT * FROM users WHERE username = %s AND password = %s",
    (username, password)
)
```

```java
// בטוח - Java + JDBC PreparedStatement
String sql = "SELECT * FROM users WHERE username = ? AND password = ?";
PreparedStatement stmt = connection.prepareStatement(sql);
stmt.setString(1, username);
stmt.setString(2, password);
```

```javascript
// בטוח - Node.js + node-postgres
await pool.query('SELECT * FROM users WHERE username = $1 AND password = $2', [username, password]);
```

```sql
-- בטוח גם ברמת Stored Procedure - הפרמטרים לא "נכנסים" כטקסט חופשי
CREATE OR REPLACE FUNCTION authenticate_user(p_username VARCHAR, p_password_hash VARCHAR)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    v_count INT;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM users
    WHERE username = p_username AND password_hash = p_password_hash;

    RETURN v_count > 0;
END;
$$;
```

## שכבות הגנה נוספות

| שכבה | תיאור |
|---|---|
| **Parameterized Queries** | ההגנה המרכזית והחשובה ביותר - אף פעם לא לשרשר קלט גולמי |
| **Least Privilege** | חשבון האפליקציה מקבל רק את ההרשאות הנדרשות (לא `db_owner`/`root`) |
| **Input Validation** | בדיקת פורמט קלט (טווח, אורך, Regex) לפני שהוא מגיע למסד |
| **Escaping** (כפתרון משני בלבד) | בריחת תווים מיוחדים - פחות אמין מ-Parameterized Queries |
| **Web Application Firewall (WAF)** | שכבת הגנה נוספת שמזהה תבניות התקפה נפוצות |
| **הצפנת נתונים רגישים** | הצפנה In-Transit (TLS) ו-At-Rest (Encryption at Rest) |
| **הפרדת סביבות** | משתמש נפרד ל-Production/Staging, ללא שימוש חוזר בסיסמאות |

## טיפים וטריקים

1. **לעולם אל תריצו את האפליקציה עם משתמש `root`/`postgres`/`sa`** — צרו משתמש ייעודי עם הרשאות מצומצמות בדיוק למה שהאפליקציה צריכה.
2. **בדקו הרשאות תקופתית** — משתמשים שעזבו את הפרויקט או שינו תפקיד עלולים להשאיר הרשאות "יתומות" מסוכנות:
   ```sql
   SELECT grantee, table_name, privilege_type
   FROM information_schema.table_privileges
   WHERE table_schema = 'public';
   ```
3. **אל תסמכו אף פעם על Escaping ידני** — תמיד השתמשו ב-Parameterized Queries/ORM עם Prepared Statements מובנים.
4. **הצפינו סיסמאות עם Hashing חד-כיווני חזק** (bcrypt, Argon2) - **לעולם לא** לשמור סיסמה כטקסט גלוי או אפילו כ-MD5/SHA1 בלבד.
5. **הריצו סריקות אבטחה אוטומטיות** — כלים כמו `sqlmap` (לבדיקת חוסן, לא להתקפה!) יכולים לעזור לזהות פגיעויות SQL Injection לפני שתוקף אמיתי ימצא אותן.

## שאלות נפוצות לתרגול עצמי

- מדוע Parameterized Queries הן ההגנה האמיתית היחידה מפני SQL Injection?
- מה ההבדל בין GRANT ברמת טבלה ל-GRANT דרך Role?
- מהו עיקרון ה-Least Privilege וכיצד הוא מיושם בהקשר של חשבון אפליקציה?
- תנו דוגמה לשאילתה פגיעה ל-SQL Injection, והראו כיצד להפוך אותה לבטוחה.

## קישורים חיצוניים

**תיעוד רשמי:**
- PostgreSQL - GRANT: https://www.postgresql.org/docs/current/sql-grant.html
- MySQL - Privilege System: https://dev.mysql.com/doc/refman/8.0/en/privilege-system.html
- OWASP - SQL Injection Prevention Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html

**סרטוני YouTube מומלצים:**
- Computerphile - SQL Injection Explained: https://www.youtube.com/watch?v=ciNHn38EyRc
- freeCodeCamp - SQL Full Course: https://www.youtube.com/watch?v=HXV3zeQKqGY
- Hussein Nasser - Database Security: https://www.youtube.com/watch?v=xUpaAtq0Xhc

---
⬅️ המדריך הבא: [10-שאלות-ראיון-sql.md](/sql/10-שאלות-ראיון-sql/) — שאלות ראיון עבודה מקיפות על SQL
