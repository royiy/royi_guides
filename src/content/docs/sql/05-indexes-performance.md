---
title: "Indexes, EXPLAIN ואופטימיזציית שאילתות"
category: SQL
part: 5/10
---

## מה זה Index ולמה הוא קריטי לביצועים?

Index (אינדקס) הוא מבנה נתונים נוסף שהמנוע שומר לצד הטבלה, המאפשר לו למצוא שורות ללא צורך לסרוק את כל הטבלה (Full Table Scan). ניתן לחשוב על אינדקס כמו אינדקס בסוף ספר - במקום לדפדף דף-דף בחיפוש מילה, קופצים ישירות לעמוד הרלוונטי.

בלי אינדקס מתאים, שאילתה שמסננת שורה בודדת מתוך טבלה עם מיליון רשומות תצטרך לקרוא את כל המיליון שורות. עם אינדקס מתאים, אותה שאילתה יכולה לרוץ בזמן לוגריתמי במקום ליניארי.

### עקרונות מפתח

- **Trade-off (פשרה)** — אינדקס מאיץ קריאה (SELECT) אך מאט כתיבה (INSERT/UPDATE/DELETE), כי המנוע צריך לעדכן גם את מבנה האינדקס.
- **Selectivity (סלקטיביות)** — עמודה עם ערכים ייחודיים רבים (כמו email) מתאימה יותר לאינדקס מעמודה עם מעט ערכים ייחודיים (כמו is_active בוליאני).
- **Covering Index** — אינדקס שמכיל את כל העמודות הדרושות לשאילתה, כך שהמנוע לא צריך לגשת לטבלה המקורית כלל.

## מבנה B-Tree

רוב האינדקסים (בכל המנועים המרכזיים) מבוססים על מבנה **B-Tree** (Balanced Tree) - עץ מאוזן המאפשר חיפוש, הוספה ומחיקה בזמן `O(log n)`.

```
                  [ 50 ]
                /        \
          [ 20 ]          [ 80 ]
         /      \         /      \
     [ 5,10 ] [ 25,40 ] [60,70] [90,99]
```

בכל צומת יש מספר ערכי מפתח, והעץ מאוזן כך שהעומק (ומספר הקפיצות הדרושות למציאת ערך) נשאר קטן גם עבור מיליוני רשומות. לחיפוש שוויון (`=`) וטווח (`BETWEEN`, `>`, `<`) B-Tree יעיל מאוד; לחיפוש טקסט חופשי (`LIKE '%word%'`) יש צורך במבני נתונים אחרים כמו **GIN**/**GiST** ב-PostgreSQL או **Full-Text Index** ב-MySQL.

## יצירת אינדקסים

```sql
-- אינדקס בסיסי על עמודה בודדת
CREATE INDEX idx_employees_department_id ON employees(department_id);

-- אינדקס ייחודי (גם אוכף UNIQUE וגם מאיץ חיפוש)
CREATE UNIQUE INDEX idx_employees_email ON employees(email);

-- אינדקס מורכב (Composite Index) - חשוב סדר העמודות!
CREATE INDEX idx_orders_emp_date ON orders(employee_id, order_date);

-- אינדקס חלקי (Partial Index) - PostgreSQL - רק על שורות רלוונטיות
CREATE INDEX idx_active_high_earners ON employees(salary) WHERE salary > 20000;

-- מחיקת אינדקס
DROP INDEX idx_employees_department_id;
```

**כלל אצבע לאינדקס מורכב**: סדר העמודות משנה. אינדקס על `(employee_id, order_date)` יעיל לשאילתה שמסננת לפי `employee_id` בלבד או לפי שניהם, אך **לא** יעיל לשאילתה שמסננת רק לפי `order_date`.

## EXPLAIN / Query Plans

`EXPLAIN` מציג את **תוכנית הביצוע** שהמנוע בחר להריץ עבור שאילתה - האם הוא משתמש באינדקס, איזה סוג JOIN הוא מבצע, וכמה שורות הוא צופה לסרוק.

```sql
EXPLAIN SELECT * FROM employees WHERE department_id = 3;

-- לקבלת זמני ריצה בפועל (מריץ את השאילתה בפועל!)
EXPLAIN ANALYZE SELECT * FROM employees WHERE department_id = 3;
```

פלט לדוגמה (PostgreSQL) - ללא אינדקס:

```
Seq Scan on employees  (cost=0.00..2100.00 rows=500 width=64)
  Filter: (department_id = 3)
```

פלט לדוגמה - עם אינדקס מתאים:

```
Index Scan using idx_employees_department_id on employees  (cost=0.29..8.31 rows=500 width=64)
  Index Cond: (department_id = 3)
```

`Seq Scan` (Sequential/Full Table Scan) פירושו שהמנוע סרק את כל הטבלה - לרוב סימן אזהרה על טבלה גדולה. `Index Scan` פירושו שהמנוע השתמש באינדקס בהצלחה. ב-MySQL משתמשים ב-`EXPLAIN` (ללא ANALYZE בגרסאות ישנות) ומקבלים עמודת `type` שבה `ALL` = Full Scan ו-`ref`/`range`/`const` = שימוש באינדקס.

## שאילתות איטיות - דוגמאות לבעיות נפוצות

```sql
-- בעיה: פונקציה על העמודה מונעת שימוש באינדקס
SELECT * FROM employees WHERE LOWER(email) = 'dana@company.com'; -- לא ישתמש באינדקס רגיל על email

-- פתרון: אינדקס פונקציונלי (PostgreSQL)
CREATE INDEX idx_employees_email_lower ON employees(LOWER(email));

-- בעיה: LIKE עם % בהתחלה לא יכול להשתמש ב-B-Tree Index
SELECT * FROM employees WHERE email LIKE '%company.com'; -- Full Scan

-- אך LIKE עם % בסוף כן יכול להשתמש באינדקס
SELECT * FROM employees WHERE email LIKE 'dana%'; -- יכול להשתמש באינדקס

-- בעיה: השוואת טיפוסים לא תואמים (Implicit Conversion)
SELECT * FROM employees WHERE employee_id = '5'; -- '5' כמחרוזת עלול לגרום ל-Cast מיותר
```

## טבלת סיכום - סוגי אינדקסים

| סוג אינדקס | מתאים ל- | מנועים |
|---|---|---|
| **B-Tree** (ברירת מחדל) | שוויון, טווחים, מיון | כולם |
| **Hash** | שוויון בלבד, מהיר מאוד | PostgreSQL, MySQL (Memory engine) |
| **GIN** | JSON, Arrays, Full-Text Search | PostgreSQL |
| **GiST** | נתונים גיאומטריים, טווחים מורכבים | PostgreSQL |
| **Full-Text Index** | חיפוש טקסט חופשי | MySQL, SQL Server |
| **Columnstore** | שאילתות אנליטיות על עמודות רבות | SQL Server, מנועי OLAP |

## טיפים וטריקים

1. **אינדקסו לפי דפוסי שימוש בפועל, לא ניחוש** — השתמשו ב-`pg_stat_user_indexes` (PostgreSQL) או ב-Slow Query Log (MySQL) כדי לזהות שאילתות איטיות שחוזרות על עצמן.
2. **אל תאינדקסו כל עמודה** — כל אינדקס מוסיף עלות כתיבה ותחזוקה; אינדקסו לפי עמודות ב-WHERE, JOIN ו-ORDER BY שמופיעות בפועל בשאילתות תכופות.
3. **בדקו `EXPLAIN ANALYZE` לפני ואחרי הוספת אינדקס** — ודאו שהמנוע באמת משתמש בו (לפעמים ה-Query Planner מעדיף Full Scan גם עם אינדקס קיים, אם הטבלה קטנה).
4. **שקלו Composite Index על פי סדר השימוש הנפוץ ביותר** — עמודת ה-Equality (=) תמיד צריכה לבוא לפני עמודת ה-Range (>, <, BETWEEN) באינדקס מורכב.
5. **תחזקו את הסטטיסטיקה** — הריצו `ANALYZE` (PostgreSQL) או `ANALYZE TABLE` (MySQL) לאחר שינויים מסיביים בנתונים, כדי שה-Query Planner יקבל החלטות מדויקות.

## שאלות נפוצות לתרגול עצמי

- מה ה-Trade-off המרכזי בשימוש באינדקסים?
- מדוע `LIKE '%word%'` לא יכול להשתמש באינדקס B-Tree רגיל?
- מה ההבדל בין `Seq Scan` ל-`Index Scan` בפלט EXPLAIN?
- מדוע סדר העמודות משנה באינדקס מורכב (Composite Index)?

## קישורים חיצוניים

**תיעוד רשמי:**
- PostgreSQL - Indexes: https://www.postgresql.org/docs/current/indexes.html
- MySQL - EXPLAIN Output Format: https://dev.mysql.com/doc/refman/8.0/en/explain-output.html
- Use The Index, Luke (מדריך אינדקסים מקיף וחינמי): https://use-the-index-luke.com/

**סרטוני YouTube מומלצים:**
- freeCodeCamp - SQL Indexing: https://www.youtube.com/watch?v=fsG1XaZEa78
- Hussein Nasser - Database Indexing: https://www.youtube.com/watch?v=-qNSXK7s7_w
- Programming with Mosh - SQL Performance: https://www.youtube.com/watch?v=7S_tz1z_5bA

---
⬅️ המדריך הבא: [06-normalization.md](/sql/06-normalization/) — Normalization, Denormalization ומתי לשבור נורמליזציה
