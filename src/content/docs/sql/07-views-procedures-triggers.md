---
title: "Views, Stored Procedures, Functions ו-Triggers"
category: SQL
part: 7/10
---

## מה זה Views, Stored Procedures ו-Triggers?

מעבר לשאילתות SQL רגילות, מסדי נתונים רלציוניים מאפשרים לעטוף לוגיקה בתוך המסד עצמו - כדי לשפר קריאות, אבטחה וביצועים, ולהימנע מכפילות קוד בין אפליקציות שונות שניגשות לאותו מסד.

- **View** — שאילתת SELECT "שמורה" שמתנהגת כמו טבלה וירטואלית.
- **Stored Procedure** — בלוק קוד SQL שמורה בתוך המסד, ניתן להרצה עם פרמטרים.
- **Function** — דומה ל-Procedure, אך מחזירה ערך וניתנת לשימוש בתוך שאילתות SELECT.
- **Trigger** — קוד שרץ **אוטומטית** בתגובה לאירוע (INSERT/UPDATE/DELETE) בטבלה.

### עקרונות מפתח

- **הפשטה (Abstraction)** — View יכול להסתיר מבנה מורכב (JOINs רבים) מאחורי ממשק פשוט של SELECT.
- **אבטחה (Security)** — ניתן לתת למשתמש הרשאה על View בלבד, בלי לחשוף לו את הטבלאות הבסיסיות.
- **Encapsulation** — Stored Procedures מרכזים לוגיקת עסקים במקום אחד, נגיש מכל שפת תכנות שמתחברת למסד.

## Views - תצוגות

```sql
-- View בסיסי - מסכם מידע משתי טבלאות
CREATE VIEW employee_department_view AS
SELECT
    e.employee_id,
    e.first_name,
    e.last_name,
    e.salary,
    d.department_name,
    d.location
FROM employees e
JOIN departments d ON e.department_id = d.department_id;

-- שימוש כמו בטבלה רגילה
SELECT * FROM employee_department_view WHERE location = 'תל אביב';

-- View עם אגרגציה
CREATE VIEW department_salary_summary AS
SELECT
    d.department_name,
    COUNT(e.employee_id) AS employee_count,
    AVG(e.salary) AS avg_salary,
    SUM(e.salary) AS total_salary
FROM departments d
LEFT JOIN employees e ON e.department_id = d.department_id
GROUP BY d.department_name;

-- עדכון/מחיקת View
DROP VIEW IF EXISTS employee_department_view;
CREATE OR REPLACE VIEW employee_department_view AS ... -- PostgreSQL
```

### Materialized View - View עם נתונים "קפואים" בפועל

בניגוד ל-View רגיל (שמריץ את השאילתה מחדש בכל פנייה), **Materialized View** שומר את התוצאה בפועל על הדיסק, וזקוק לרענון מפורש:

```sql
CREATE MATERIALIZED VIEW mv_department_summary AS
SELECT department_id, COUNT(*) AS employee_count, AVG(salary) AS avg_salary
FROM employees
GROUP BY department_id;

REFRESH MATERIALIZED VIEW mv_department_summary;
```

## Stored Procedures

```sql
-- PostgreSQL - שימוש ב-PL/pgSQL
CREATE OR REPLACE PROCEDURE give_raise(p_employee_id INT, p_percent DECIMAL)
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE employees
    SET salary = salary * (1 + p_percent / 100)
    WHERE employee_id = p_employee_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'עובד עם מזהה % לא נמצא', p_employee_id;
    END IF;
END;
$$;

-- הרצה
CALL give_raise(1, 10);
```

```sql
-- MySQL
DELIMITER //
CREATE PROCEDURE GiveRaise(IN p_employee_id INT, IN p_percent DECIMAL(5,2))
BEGIN
    UPDATE employees
    SET salary = salary * (1 + p_percent / 100)
    WHERE employee_id = p_employee_id;
END //
DELIMITER ;

CALL GiveRaise(1, 10);
```

## Functions - פונקציות

```sql
-- PostgreSQL - פונקציה שמחזירה ערך יחיד, ניתנת לשימוש בתוך SELECT
CREATE OR REPLACE FUNCTION get_employee_full_name(p_employee_id INT)
RETURNS VARCHAR
LANGUAGE plpgsql
AS $$
DECLARE
    v_full_name VARCHAR;
BEGIN
    SELECT first_name || ' ' || last_name INTO v_full_name
    FROM employees
    WHERE employee_id = p_employee_id;

    RETURN v_full_name;
END;
$$;

-- שימוש בתוך שאילתה
SELECT employee_id, get_employee_full_name(employee_id) AS full_name
FROM employees;

-- פונקציה שמחזירה טבלה שלמה (Table-Valued Function)
CREATE OR REPLACE FUNCTION get_high_earners(p_min_salary DECIMAL)
RETURNS TABLE (employee_id INT, full_name VARCHAR, salary DECIMAL)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT e.employee_id, e.first_name || ' ' || e.last_name, e.salary
    FROM employees e
    WHERE e.salary > p_min_salary;
END;
$$;

SELECT * FROM get_high_earners(20000);
```

| השוואה | Procedure | Function |
|---|---|---|
| החזרת ערך | לא חייבת (יכולה להיות void) | חייבת להחזיר ערך/טבלה |
| שימוש בתוך SELECT | לא ניתן | כן |
| קריאה | `CALL proc_name(...)` | `SELECT func_name(...)` |
| ביצוע Transaction עצמאי | כן (COMMIT/ROLLBACK בתוכה) | לא (בד"כ) |

## Triggers - טריגרים

Trigger מריץ קוד אוטומטית לפני/אחרי אירוע DML על טבלה - שימושי ל-Audit Trail, אכיפת כללי עסק, וסנכרון נתונים.

```sql
-- PostgreSQL: קודם פונקציה, אח"כ טריגר שקורא לה
CREATE OR REPLACE FUNCTION log_salary_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.salary <> OLD.salary THEN
        INSERT INTO salary_audit (employee_id, old_salary, new_salary, changed_at)
        VALUES (OLD.employee_id, OLD.salary, NEW.salary, NOW());
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_salary_audit
AFTER UPDATE ON employees
FOR EACH ROW
EXECUTE FUNCTION log_salary_change();
```

```sql
-- MySQL - תחביר דומה, ללא צורך בפונקציה נפרדת
DELIMITER //
CREATE TRIGGER trg_salary_audit
AFTER UPDATE ON employees
FOR EACH ROW
BEGIN
    IF NEW.salary <> OLD.salary THEN
        INSERT INTO salary_audit (employee_id, old_salary, new_salary, changed_at)
        VALUES (OLD.employee_id, OLD.salary, NEW.salary, NOW());
    END IF;
END //
DELIMITER ;
```

טבלת סוגי טריגרים נפוצים:

| עיתוי | אירוע | דוגמת שימוש |
|---|---|---|
| `BEFORE INSERT` | לפני הוספת שורה | ולידציה, מילוי ערכי ברירת מחדל |
| `AFTER INSERT` | אחרי הוספת שורה | עדכון טבלת סטטיסטיקה, שליחת התראה |
| `BEFORE UPDATE` | לפני עדכון שורה | מניעת שינוי לא חוקי |
| `AFTER UPDATE` | אחרי עדכון שורה | Audit Log |
| `BEFORE DELETE` / `AFTER DELETE` | לפני/אחרי מחיקה | Soft Delete, ארכוב |

## טיפים וטריקים

1. **השתמשו ב-Views להפשטת שאילתות מורכבות** — כשאותו JOIN מסובך חוזר בכמה מקומות בקוד, הפכו אותו ל-View קריא.
2. **הגבילו הרשאות דרך Views** — תנו למשתמשים גישה ל-View בלבד (בלי לחשוף עמודות רגישות כמו salary), במקום לטבלה המקורית.
3. **אל תגזימו עם Triggers** — טריגרים "שקטים" ומרובים הופכים דיבוג לסיוט (התנהגות שלא רואים בקוד האפליקציה). תעדו כל Trigger בבירור.
4. **העדיפו Functions על פני לוגיקה כפולה באפליקציה** — אם כמה שירותים שונים (Java, Python, Node) צריכים את אותו חישוב, Function במסד מבטיחה עקביות.
5. **זהירות מ-Recursive Triggers** — טריגר שמעדכן טבלה שיש עליה טריגר נוסף עלול ליצור לולאה אינסופית; בדקו את סדר ההרצה בתיעוד המנוע.

## שאלות נפוצות לתרגול עצמי

- מה ההבדל המרכזי בין View רגיל ל-Materialized View?
- מתי תבחרו ב-Stored Procedure ומתי ב-Function?
- כיצד ניתן להשתמש ב-Trigger למימוש Audit Trail?
- מהם הסיכונים בשימוש מוגזם ב-Triggers?

## קישורים חיצוניים

**תיעוד רשמי:**
- PostgreSQL - Views: https://www.postgresql.org/docs/current/sql-createview.html
- PostgreSQL - Trigger Behavior: https://www.postgresql.org/docs/current/trigger-definition.html
- MySQL - Stored Procedures: https://dev.mysql.com/doc/refman/8.0/en/stored-programs-defining.html

**סרטוני YouTube מומלצים:**
- freeCodeCamp - SQL Full Course: https://www.youtube.com/watch?v=HXV3zeQKqGY
- Programming with Mosh - Stored Procedures: https://www.youtube.com/watch?v=7S_tz1z_5bA
- Socratica - SQL Views and Triggers: https://www.youtube.com/watch?v=svsp6ludPnk

---
⬅️ המדריך הבא: [08-backup-recovery.md](/sql/08-backup-recovery/) — Backup & Recovery, Point-in-Time Recovery ו-Replication
