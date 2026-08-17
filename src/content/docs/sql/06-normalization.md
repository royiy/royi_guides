---
title: "Normalization - 1NF, 2NF, 3NF ו-Denormalization"
category: SQL
part: 6/10
---

## מה זה Normalization?

Normalization (נורמליזציה) הוא תהליך מובנה לארגון עמודות וטבלאות במסד נתונים רלציוני, שמטרתו לצמצם כפילות נתונים (Redundancy) ולמנוע אנומליות עדכון (Update Anomalies). התהליך מחולק ל"צורות נורמליות" (Normal Forms) - כל צורה בונה על הקודמת ומוסיפה כלל נוסף.

הרעיון המרכזי: כל פיסת מידע צריכה "לגור" במקום אחד בלבד. אם פרט מסוים (כמו שם מחלקה) חוזר על עצמו בכמה שורות, כל עדכון דורש שינוי בכמה מקומות בו-זמנית - וזו מתכון לחוסר עקביות.

### שלוש אנומליות עדכון קלאסיות

- **Insertion Anomaly** — לא ניתן להוסיף נתון (למשל מחלקה חדשה) בלי שיהיה לפחות עובד אחד בה.
- **Update Anomaly** — עדכון פרט (כמו מיקום מחלקה) דורש שינוי בכל שורה שמכילה אותו, ואם שוכחים שורה - נוצרת אי-עקביות.
- **Deletion Anomaly** — מחיקת השורה האחרונה של מחלקה מוחקת בטעות גם את המידע על המחלקה עצמה.

## דוגמה לטבלה לא מנורמלת

```
employees_denormalized
+----+-------+------------+---------------+----------+
| id | name  | department | dept_location | project  |
+----+-------+------------+---------------+----------+
| 1  | דנה   | פיתוח      | תל אביב       | Alpha    |
| 2  | דנה   | פיתוח      | תל אביב       | Beta     |
| 3  | יוסי  | שיווק      | חיפה          | Gamma    |
+----+-------+------------+---------------+----------+
```

הבעיות: שם המחלקה והמיקום שלה חוזרים על עצמם (שורה 1 ו-2), ואם דנה עוברת לעוד פרויקט, כל הפרטים על "פיתוח" ו-"תל אביב" נכתבים שוב.

## Normal Forms (צורות נורמליות)

### 1NF - Normal Form הראשונה

**דרישה**: כל תא בטבלה מכיל ערך אטומי (יחיד), ללא רשימות/ערכים מרובים בתא בודד, ולכל שורה יש מפתח ייחודי.

```sql
-- לא עומד ב-1NF: עמודה מכילה רשימת ערכים
CREATE TABLE employees_bad (
    employee_id INT PRIMARY KEY,
    name        VARCHAR(50),
    phone_numbers VARCHAR(200) -- '050-1111111, 052-2222222'
);

-- תיקון ל-1NF: פירוק לטבלה נפרדת
CREATE TABLE employee_phones (
    employee_id INT,
    phone       VARCHAR(20),
    PRIMARY KEY (employee_id, phone),
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id)
);
```

### 2NF - Normal Form השנייה

**דרישה**: עומד ב-1NF, וכל עמודה לא-מפתח תלויה ב**מפתח המלא** (רלוונטי בעיקר כשיש מפתח מורכב - Composite Key). אין תלות חלקית (Partial Dependency).

```sql
-- לא עומד ב-2NF: מפתח מורכב (order_id, product_id), אך product_name תלוי רק ב-product_id
CREATE TABLE order_items_bad (
    order_id     INT,
    product_id   INT,
    product_name VARCHAR(100), -- תלוי רק ב-product_id, לא בכל המפתח
    quantity     INT,
    PRIMARY KEY (order_id, product_id)
);

-- תיקון ל-2NF: פירוק product_name לטבלה נפרדת
CREATE TABLE products (
    product_id   INT PRIMARY KEY,
    product_name VARCHAR(100)
);

CREATE TABLE order_items (
    order_id   INT,
    product_id INT,
    quantity   INT,
    PRIMARY KEY (order_id, product_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);
```

### 3NF - Normal Form השלישית

**דרישה**: עומד ב-2NF, ואין תלות טרנזיטיבית (Transitive Dependency) - עמודה לא-מפתח לא תלויה בעמודה לא-מפתח אחרת.

```sql
-- לא עומד ב-3NF: department_location תלוי ב-department_id, לא ישירות במפתח employee_id
CREATE TABLE employees_bad (
    employee_id       INT PRIMARY KEY,
    name              VARCHAR(50),
    department_id     INT,
    department_name   VARCHAR(100), -- תלוי ב-department_id
    department_location VARCHAR(100) -- תלוי ב-department_id
);

-- תיקון ל-3NF: הפרדת departments לטבלה עצמאית
CREATE TABLE departments (
    department_id   INT PRIMARY KEY,
    department_name VARCHAR(100),
    location        VARCHAR(100)
);

CREATE TABLE employees (
    employee_id   INT PRIMARY KEY,
    name          VARCHAR(50),
    department_id INT,
    FOREIGN KEY (department_id) REFERENCES departments(department_id)
);
```

טבלת סיכום:

| צורה | דרישה מרכזית | פותר בעיה |
|---|---|---|
| **1NF** | ערכים אטומיים, ללא רשימות בתא | חזרתיות בתוך תא בודד |
| **2NF** | ללא תלות חלקית במפתח מורכב | כפילות בגלל מפתח מורכב |
| **3NF** | ללא תלות טרנזיטיבית | כפילות דרך עמודה לא-מפתח אחרת |
| **BCNF** (מתקדם) | גרסה מחמירה יותר של 3NF | חריגים נדירים ב-3NF |

## Denormalization - מתי לשבור נורמליזציה בכוונה

נורמליזציה מלאה (3NF ומעלה) מונעת כפילות, אך "מפזרת" את המידע בין טבלאות רבות ומחייבת JOINs רבים לכל שאילתה - מה שעלול לפגוע בביצועים בעומסי קריאה גבוהים (Read-Heavy).

**Denormalization** היא החלטה מכוונת לשלב חזרה מידע מיותר (Redundant) לטובת ביצועים - נפוץ מאוד במערכות Data Warehouse/BI ובאפליקציות עם עומס קריאה עצום.

```sql
-- דוגמה: הוספת עמודת סכום מוזמנות שנצברה (Denormalized) על טבלת employees
-- כדי להימנע מ-JOIN + SUM בכל שאילתת דוח
ALTER TABLE employees ADD COLUMN total_sales_ytd DECIMAL(12,2) DEFAULT 0;

-- עדכון העמודה מתבצע דרך Trigger או Batch Job, לא בזמן אמת מה-JOIN
UPDATE employees e
SET total_sales_ytd = (
    SELECT COALESCE(SUM(total_amount), 0)
    FROM orders o
    WHERE o.employee_id = e.employee_id
      AND EXTRACT(YEAR FROM o.order_date) = EXTRACT(YEAR FROM CURRENT_DATE)
);
```

### מתי לשקול Denormalization

- דוחות/Dashboards עם קריאה תכופה מאוד ורגישות נמוכה לעדכון מיידי (eventual consistency מספיק).
- מערכות Data Warehouse עם סכמת **Star Schema** (טבלת עובדות + טבלאות מימד שטוחות בכוונה).
- שדות מחושבים (Computed/Materialized) שיקרים לחשב בכל שאילתה (כמו סכומים מצטברים).
- שימוש ב-**Materialized View** כדי לקבל ביצועי Denormalization בלי לוותר על מקור אמת מנורמל:
  ```sql
  CREATE MATERIALIZED VIEW mv_employee_sales AS
  SELECT e.employee_id, e.first_name, SUM(o.total_amount) AS total_sales
  FROM employees e
  JOIN orders o ON o.employee_id = e.employee_id
  GROUP BY e.employee_id, e.first_name;

  REFRESH MATERIALIZED VIEW mv_employee_sales;
  ```

## טיפים וטריקים

1. **תכננו ב-3NF כברירת מחדל** — התחילו תמיד מסכימה מנורמלת, ובצעו Denormalization מודע ומתועד רק כשמדדי ביצועים בפועל מצדיקים זאת.
2. **אל תבצעו Denormalization "כי אולי יהיה מהר יותר"** — מדדו קודם עם `EXPLAIN ANALYZE`; לעיתים אינדקס טוב פותר את הבעיה בלי לוותר על נורמליזציה.
3. **Materialized Views הם פשרה טובה** — מספקים ביצועי קריאה כמו טבלה שטוחה, תוך שמירה על מקור אמת מנורמל בטבלאות הבסיס.
4. **תעדו כל Denormalization במפורש** — מפתח שיגלה עמודה כפולה בעתיד צריך להבין שזו החלטה מכוונת ולא באג.
5. **שימו לב לעדכון נתונים כפולים** — אם Denormalization מיושמת ידנית (לא דרך View), חובה מנגנון (Trigger/Batch Job) לשמור על סנכרון בין המקורות.

## שאלות נפוצות לתרגול עצמי

- מה ההבדל בין תלות חלקית (2NF) לתלות טרנזיטיבית (3NF)?
- תנו דוגמה לטבלה שעומדת ב-1NF אך לא ב-2NF.
- מתי כדאי לבצע Denormalization מכוון, ומהם הסיכונים?
- מהו Materialized View וכיצד הוא מאפשר "את שני העולמות"?

## קישורים חיצוניים

**תיעוד רשמי:**
- PostgreSQL - Materialized Views: https://www.postgresql.org/docs/current/rules-materializedviews.html
- MySQL - Normalization Guide: https://dev.mysql.com/doc/workbench/en/wb-migration-database-normalization-explained-1nf.html
- W3Schools - Database Normalization: https://www.w3schools.com/sql/sql_ref_keys.asp

**סרטוני YouTube מומלצים:**
- freeCodeCamp - Database Normalization: https://www.youtube.com/watch?v=GFQqRUjnRkE
- Programming with Mosh - Database Design: https://www.youtube.com/watch?v=ztHopE5Wnpc
- Socratica - Normal Forms: https://www.youtube.com/watch?v=UrYLYV7WSHM

---
⬅️ המדריך הבא: [07-views-procedures-triggers.md](/sql/07-views-procedures-triggers/) — Views, Stored Procedures, Functions ו-Triggers
