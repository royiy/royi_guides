---
title: "משחק לימודי: אתגר SQL"
category: SQL
part: 12/10
description: "משחק אינטראקטיבי ללימוד SQL - חמישה מצבי משחק עם טיימר, לבבות, ניקוד ורצפים: קרב מהיר, ניחוש פלט שאילתה, השלמת שאילתה, התאמת מושגים וסידור תהליכים."
---

חמישה מצבי משחק שבודקים היבטים שונים של SQL - SELECT/JOIN, Transactions ו-ACID, אינדקסים וביצועים, נורמליזציה, Constraints ו-Views/Procedures/Triggers - לא עוד חידון רב-ברירה, אלא משחק עם **טיימר**, **שלושה לבבות**, **מכפיל רצף** ו**שיא אישי** שנשמר בדפדפן. בסוף כל סבב תקבלו דירוג, ורשימת חזרה של בדיוק מה שפספסתם.


<div class="tg" id="tg" dir="rtl">
  <div class="tg-screen is-active" data-screen="menu">
    <div class="tg-hero">
      <div class="tg-hero-badge">SQL</div>
      <div class="tg-hero-title">אתגר SQL</div>
      <div class="tg-hero-sub">בחרו מצב משחק. יש לכם 3 לבבות - תשובה שגויה, טעות בהתאמה או נגמר הזמן עולים לב אחד.</div>
    </div>
    <div class="tg-modes" id="tg-modes"></div>
    <div class="tg-hero-foot">💡 טיפ: במצבי השאלות אפשר לענות עם המקשים <kbd>1</kbd>–<kbd>4</kbd> ולהתקדם עם <kbd>Enter</kbd>.</div>
  </div>
  <div class="tg-screen" data-screen="play">
    <div class="tg-hud">
      <button class="tg-quit" type="button" id="tg-quit">← יציאה</button>
      <div class="tg-mode-title" id="tg-mode-name"></div>
      <div class="tg-hud-stats">
        <span class="tg-lives" id="tg-lives"></span>
        <span class="tg-chip">ניקוד <b id="tg-score">0</b></span>
        <span class="tg-chip">רצף <b id="tg-streak">0</b></span>
      </div>
    </div>
    <div class="tg-progress"><i class="tg-progress-bar" id="tg-progress"></i></div>
    <div class="tg-timer-wrap" id="tg-timer-wrap"><i class="tg-timer-bar" id="tg-timer"></i></div>
    <div class="tg-stage" id="tg-stage"></div>
    <div class="tg-foot">
      <div class="tg-feedback" id="tg-feedback" aria-live="polite"></div>
      <button class="tg-btn tg-btn--primary tg-next" type="button" id="tg-next" hidden>הבא ←</button>
    </div>
  </div>
  <div class="tg-screen" data-screen="result">
    <div id="tg-result"></div>
    <div class="tg-result-actions">
      <button class="tg-btn tg-btn--primary" type="button" id="tg-again">שחק שוב</button>
      <button class="tg-btn" type="button" id="tg-menu">חזרה לתפריט</button>
    </div>
  </div>
</div>

<link rel="stylesheet" href="/styles/topic-game.css">

<script>
(function () {
  'use strict';

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /* ============================================================
     מצב 1 - קרב מהיר: שאלות ידע קצרות. o = אפשרויות, a = אינדקס נכון
     ============================================================ */
  var RAPID = [
    {
      q: 'מה ההבדל העיקרי בין <code>INNER JOIN</code> ל-<code>LEFT JOIN</code>?',
      o: ['<code>INNER JOIN</code> מחזיר רק שורות עם התאמה בשתי הטבלאות; <code>LEFT JOIN</code> מחזיר גם שורות מהטבלה השמאלית ללא התאמה (עם NULL)', 'שני הסוגים תמיד מחזירים בדיוק אותה תוצאה', '<code>LEFT JOIN</code> תמיד מהיר יותר מ-<code>INNER JOIN</code>', '<code>INNER JOIN</code> תומך רק בשתי טבלאות ו-<code>LEFT JOIN</code> בשלוש ומעלה'],
      a: 0,
      w: '<code>INNER JOIN</code> "מוציא לפועל" רק שורות שיש להן זוג בשני הצדדים. <code>LEFT JOIN</code> שומר על כל שורות הטבלה השמאלית, וממלא NULL בעמודות הימנית כשאין התאמה.'
    },
    {
      q: 'מה מחזירה <code>FULL OUTER JOIN</code>?',
      o: ['את כל השורות משתי הטבלאות, עם NULL בעמודות שאין להן התאמה בצד השני', 'רק שורות עם התאמה בשתי הטבלאות', 'רק שורות מהטבלה השמאלית', 'מכפלה קרטזית של כל השורות'],
      a: 0,
      w: '<code>FULL OUTER JOIN</code> משלבת את ההתנהגות של <code>LEFT JOIN</code> ו-<code>RIGHT JOIN</code> יחד - כל שורה משני הצדדים מופיעה, עם NULL במקום שאין התאמה.'
    },
    {
      q: 'מה עושה <code>CROSS JOIN</code>?',
      o: ['יוצרת מכפלה קרטזית - כל שילוב אפשרי בין שורות שתי הטבלאות', 'מחזירה רק שורות עם ערך זהה בעמודת המפתח', 'מוחקת שורות כפולות', 'ממזגת שתי טבלאות לעמודה אחת'],
      a: 0,
      w: 'ללא תנאי <code>ON</code>, <code>CROSS JOIN</code> בין טבלה עם 3 שורות לטבלה עם 4 שורות מייצרת 12 שורות תוצאה - כל שילוב אפשרי.'
    },
    {
      q: 'מהו <code>SELF JOIN</code>?',
      o: ['טבלה שמצטרפת לעצמה, שימושי למשל למציאת היררכיית מנהלים-עובדים', 'JOIN בין שתי טבלאות זהות בשם אך שונות בתוכן', 'JOIN שרץ פעם אחת בלבד לכל session', 'סוג של Materialized View'],
      a: 0,
      w: 'ב-<code>SELF JOIN</code> אותה טבלה מופיעה פעמיים בשאילתה תחת שני Aliases שונים, כדי להשוות שורות בתוך אותה טבלה זו לזו.'
    },
    {
      q: 'מה מייצגת האות A במושג ACID?',
      o: ['Atomicity - עסקה מתבצעת כולה או לא מתבצעת כלל', 'Availability - זמינות המסד בכל רגע', 'Access - בקרת גישה למסד', 'Aggregation - איחוד נתונים מכמה טבלאות'],
      a: 0,
      w: 'Atomicity מבטיחה שכל הפעולות בתוך עסקה נחשבות ליחידה אחת בלתי-ניתנת לפיצול - אם חלק נכשל, כל השאר מתבטל אוטומטית.'
    },
    {
      q: 'מה עושה <code>COMMIT</code>?',
      o: ['שומר לצמיתות את כל השינויים שבוצעו מתחילת ה-Transaction', 'מבטל את כל השינויים שבוצעו מתחילת ה-Transaction', 'יוצר Transaction חדש', 'נועל את הטבלה למשתמשים אחרים לצמיתות'],
      a: 0,
      w: 'לפני <code>COMMIT</code> השינויים גלויים בדרך כלל רק בתוך ה-Session שביצע אותם. אחרי <code>COMMIT</code> הם נכתבים לצמיתות והופכים גלויים לכל חיבור אחר.'
    },
    {
      q: 'מה עושה <code>ROLLBACK</code>?',
      o: ['מבטל את כל השינויים שבוצעו מתחילת ה-Transaction (או מ-Savepoint)', 'שומר את השינויים לצמיתות', 'יוצר גיבוי מלא של הטבלה', 'מוחק את הטבלה כולה'],
      a: 0,
      w: '<code>ROLLBACK</code> מחזיר את המסד למצב שהיה בו לפני תחילת העסקה - שימושי כשמתגלה שגיאה או תנאי לא תקין באמצע רצף פעולות.'
    },
    {
      q: 'מה מבטיחה תכונת ה-Isolation ב-ACID?',
      o: ['עסקאות מקבילות לא רואות זו את התוצאות החלקיות של זו, כל עוד לא בוצע COMMIT', 'עסקאות רצות תמיד ברצף, אף פעם לא במקביל', 'כל עסקה מבודדת בשרת נפרד', 'נתונים בין טבלאות שונות מבודדים זה מזה תמיד'],
      a: 0,
      w: 'רמת ה-Isolation קובעת עד כמה עסקה אחת "רואה" שינויים לא-מאושרים (uncommitted) של עסקה מקבילה אחרת - זה טווח שבין ביצועים לעקביות.'
    },
    {
      q: 'מהו Primary Key?',
      o: ['עמודה (או צירוף עמודות) שמזהה שורה בצורה ייחודית בטבלה, ואינה יכולה להכיל NULL', 'כל עמודה שיש לה אינדקס', 'עמודה שמפנה לטבלה אחרת', 'עמודה שמוגדרת כברירת מחדל בלבד'],
      a: 0,
      w: 'לכל טבלה יכול להיות Primary Key אחד בלבד (אך יכול להיות מורכב מכמה עמודות). הוא גם אוכף ייחודיות וגם אוסר ערכי NULL.'
    },
    {
      q: 'מהו Foreign Key?',
      o: ['עמודה שמפנה למפתח ראשי (או ייחודי) בטבלה אחרת, ושומרת על תקינות הקשר ביניהן', 'עמודה שמוגדרת כברירת מחדל בלבד', 'אינדקס שנוצר אוטומטית על כל עמודה', 'עמודה שערכה מחושב אוטומטית מנוסחה'],
      a: 0,
      w: 'Foreign Key מונע הכנסת ערך שאין לו שורה תואמת בטבלת האב (Referential Integrity), ומאפשר גם להגדיר התנהגות כמו <code>ON DELETE CASCADE</code>.'
    },
    {
      q: 'מה ההבדל בין אילוץ <code>UNIQUE</code> ל-<code>PRIMARY KEY</code>?',
      o: ['<code>UNIQUE</code> אוכף ערכים ייחודיים, אך ברוב המנועים מאפשר גם ערך NULL אחד או יותר - בניגוד ל-<code>PRIMARY KEY</code>', 'אין שום הבדל מעשי ביניהם', '<code>UNIQUE</code> תמיד מהיר יותר מ-<code>PRIMARY KEY</code>', 'לטבלה יכולים להיות כמה אילוצי <code>PRIMARY KEY</code> אך רק <code>UNIQUE</code> אחד'],
      a: 0,
      w: 'ניתן להגדיר כמה אילוצי <code>UNIQUE</code> בטבלה אחת (למשל גם על email וגם על מספר תעודת זהות), אך <code>PRIMARY KEY</code> יכול להיות רק אחד לכל טבלה.'
    },
    {
      q: 'מהו Covering Index?',
      o: ['אינדקס שמכיל את כל העמודות הדרושות לשאילתה, כך שהמנוע לא צריך לגשת לטבלה המקורית כלל', 'אינדקס שמכסה את כל הטבלאות במסד הנתונים', 'אינדקס שמוגדר על כל העמודות בטבלה', 'אינדקס שרץ אוטומטית לפני כל שאילתה'],
      a: 0,
      w: 'כשכל העמודות שה-SELECT צריך (כולל תנאי הסינון) קיימות בתוך האינדקס עצמו, המנוע יכול "לענות" מהאינדקס בלבד - בלי לקרוא את שורת הטבלה המלאה.'
    },
    {
      q: 'מדוע סדר העמודות באינדקס מורכב (Composite Index) חשוב?',
      o: ['אינדקס על (a, b) יעיל לסינון לפי a בלבד או לפי a ו-b יחד, אך לא יעיל לסינון רק לפי b', 'סדר העמודות משפיע רק על שם האינדקס', 'אינדקס מורכב תמיד יעיל לכל סדר סינון אפשרי', 'סדר העמודות משפיע רק על מהירות ה-INSERT'],
      a: 0,
      w: 'מבנה B-Tree ממיין קודם לפי העמודה הראשונה באינדקס. חיפוש שמתחיל מהעמודה השנייה בלבד לא יכול לנצל את המיון הזה בצורה יעילה.'
    },
    {
      q: 'מהי הדרישה המרכזית של 1NF (הצורה הנורמלית הראשונה)?',
      o: ['כל תא בטבלה מכיל ערך אטומי יחיד, ללא רשימות או ערכים מרובים בתוך תא בודד', 'כל עמודה חייבת להיות Foreign Key', 'לטבלה מותר להיות רק Primary Key מורכב', 'אסור להשתמש בעמודות מסוג טקסט'],
      a: 0,
      w: 'עמודה כמו phone_numbers שמכילה "050-111,052-222" בתא אחד מפרה 1NF - הפתרון הוא לפרק אותה לטבלת בת נפרדת עם שורה לכל מספר טלפון.'
    },
    {
      q: 'מהי תלות טרנזיטיבית (Transitive Dependency), שאותה 3NF מסירה?',
      o: ['עמודה לא-מפתח תלויה בעמודה לא-מפתח אחרת, ולא ישירות במפתח הראשי', 'עמודה תלויה רק בחלק מהמפתח המורכב', 'שתי טבלאות תלויות זו בזו במעגל', 'עמודה תלויה בערך שהוגדר בטבלה אחרת לגמרי'],
      a: 0,
      w: 'לדוגמה: אם department_location תלוי ב-department_id ולא ישירות ב-employee_id, יש תלות טרנזיטיבית - הפתרון הוא להפריד את פרטי המחלקה לטבלה עצמאית.'
    },
    {
      q: 'מהו View, בהבדל מ-Materialized View?',
      o: ['View מריץ מחדש את שאילתת ה-SELECT בכל פנייה; Materialized View שומר תוצאה קבועה על הדיסק וזקוק לרענון מפורש', 'שניהם שומרים תוצאה קבועה על הדיסק', 'View הוא טבלה רגילה עם שם אחר בלבד', 'Materialized View מתעדכן אוטומטית בזמן אמת בכל מנוע'],
      a: 0,
      w: 'View רגיל תמיד "טרי" כי הוא מריץ את השאילתה מחדש, אך יקר יותר חישובית. Materialized View מהיר לקריאה אך דורש <code>REFRESH MATERIALIZED VIEW</code> כדי להתעדכן.'
    },
    {
      q: 'מתי רץ Trigger?',
      o: ['אוטומטית, בתגובה לאירוע INSERT/UPDATE/DELETE על טבלה - בלי קריאה מפורשת', 'רק כשמריצים אותו ידנית עם CALL', 'פעם אחת בלבד, מיד עם היצירה שלו', 'רק כשמריצים COMMIT'],
      a: 0,
      w: 'Trigger מוגדר לרוץ BEFORE או AFTER אירוע DML מסוים - שימושי ל-Audit Trail, אכיפת כללי עסק, וסנכרון נתונים בלי לשנות את קוד האפליקציה.'
    },
    {
      q: 'מה ההבדל המרכזי בין Stored Procedure ל-Function?',
      o: ['Function חייבת להחזיר ערך וניתנת לשימוש בתוך SELECT; Procedure לא חייבת להחזיר ערך ונקראת עם CALL', 'אין הבדל מעשי, אלו שמות נרדפים', 'Procedure ניתנת לשימוש בתוך SELECT, Function לא', 'Function לא יכולה לקבל פרמטרים'],
      a: 0,
      w: 'לדוגמה, <code>SELECT get_employee_full_name(1)</code> אפשרי כי זו Function, אבל אי אפשר לשלב Procedure באותה צורה בתוך שאילתה.'
    },
    {
      q: 'מה עושה <code>GRANT</code>?',
      o: ['מעניקה הרשאה למשתמש או לתפקיד לבצע פעולה מסוימת (כמו SELECT או INSERT) על אובייקט במסד', 'שוללת הרשאה ממשתמש', 'יוצרת משתמש חדש במסד', 'מוחקת אובייקט מהמסד'],
      a: 0,
      w: 'הפעולה ההפוכה היא <code>REVOKE</code>, ששוללת הרשאה שכבר הוענקה. שילוב נכון של GRANT/REVOKE מיישם עקרון הרשאות מינימליות (Least Privilege).'
    }
  ];

  /* ============================================================
     מצב 2 - ניחוש פלט: קטע שאילתת SQL + מה יהיה הפלט/מה קורה בפועל
     ============================================================ */
  var GUESS_OUTPUT = [
    {
      code: 'SELECT e.name, d.department_name\nFROM employees e\nINNER JOIN departments d ON e.department_id = d.department_id;',
      q: 'לעובד מסוים <code>department_id</code> הוא NULL. האם השורה שלו תופיע בתוצאה?',
      o: ['לא - <code>INNER JOIN</code> מחזיר רק שורות עם התאמה בשתי הטבלאות, ו-NULL לא תואם דבר', 'כן, עם NULL בעמודת department_name', 'רק אם יש ORDER BY בסוף השאילתה', 'השאילתה תיכשל עם שגיאה'],
      a: 0,
      w: 'בלי מחלקה תואמת, אין "זוג" לשורה הזו - <code>INNER JOIN</code> פשוט משמיט אותה מהתוצאה. כדי לכלול גם עובדים כאלה יש להשתמש ב-<code>LEFT JOIN</code>.'
    },
    {
      code: 'SELECT e.name, d.department_name\nFROM employees e\nLEFT JOIN departments d ON e.department_id = d.department_id;',
      q: 'מה יקרה לעובד עם <code>department_id</code> שאין לו התאמה בטבלת departments?',
      o: ['השורה תופיע בתוצאה, עם NULL בעמודת department_name', 'השורה לא תופיע בתוצאה כלל', 'השאילתה תיכשל עם שגיאת FOREIGN KEY', 'department_name יוצג כמחרוזת ריקה בלבד'],
      a: 0,
      w: '<code>LEFT JOIN</code> תמיד שומר על כל שורות הטבלה השמאלית (employees), וממלא NULL בעמודות מהטבלה הימנית כשאין התאמה.'
    },
    {
      code: 'BEGIN;\nUPDATE accounts SET balance = balance - 100 WHERE account_id = 1;\nROLLBACK;',
      q: 'מה תהיה יתרת החשבון אחרי הרצת הקוד הזה?',
      o: ['היתרה תישאר כפי שהייתה לפני ה-UPDATE - השינוי בוטל לחלוטין', 'היתרה תרד ב-100, כי UPDATE כבר בוצע', 'המסד יחזיר שגיאה כי אין COMMIT', 'היתרה תרד ב-100 רק ב-Session הנוכחי'],
      a: 0,
      w: '<code>ROLLBACK</code> מבטל את כל הפעולות שבוצעו מאז <code>BEGIN</code> - כאילו ה-UPDATE מעולם לא קרה. זו בדיוק תכונת ה-Atomicity ב-ACID.'
    },
    {
      code: 'BEGIN;\nUPDATE accounts SET balance = balance - 100 WHERE account_id = 1;\nCOMMIT;\nSELECT balance FROM accounts WHERE account_id = 1;',
      q: 'מה תחזיר שאילתת ה-SELECT האחרונה?',
      o: ['את היתרה המעודכנת - השינוי נשמר לצמיתות אחרי COMMIT', 'את היתרה המקורית, כי SELECT לא רואה שינויים מאותה עסקה', 'שגיאה, כי לא ניתן להריץ SELECT אחרי COMMIT', 'ערך NULL, כי החשבון "ננעל"'],
      a: 0,
      w: 'אחרי <code>COMMIT</code> השינוי הופך קבוע וגלוי לכל שאילתה עתידית, כולל ב-Sessions אחרים - זו בדיוק תכונת ה-Durability.'
    },
    {
      code: 'CREATE TABLE t (id INT PRIMARY KEY);\nINSERT INTO t VALUES (1);\nINSERT INTO t VALUES (1);',
      q: 'מה יקרה בהרצת ה-INSERT השני?',
      o: ['שגיאה - הפרת אילוץ PRIMARY KEY בגלל ערך כפול', 'השורה תיכנס בהצלחה, כי PRIMARY KEY לא בודק כפילויות', 'השורה הראשונה תימחק ותוחלף בשנייה', 'המסד יתעלם מה-INSERT השני בשקט'],
      a: 0,
      w: '<code>PRIMARY KEY</code> אוכף ייחודיות באופן קשיח - ניסיון להכניס ערך שכבר קיים בעמודת המפתח נכשל עם שגיאת אילוץ, וה-INSERT השני לא מתבצע.'
    },
    {
      code: 'DELETE FROM employees;',
      q: 'מה יקרה אם מריצים את הפקודה הזו בלי תנאי WHERE?',
      o: ['כל השורות בטבלה יימחקו', 'תופיע שגיאה, כי DELETE ללא WHERE אסור', 'רק השורה הראשונה תימחק', 'הפעולה תדרוש אישור נוסף מהמנוע לפני ביצוע'],
      a: 0,
      w: 'בניגוד ל-DDL כמו <code>TRUNCATE</code> או <code>DROP</code>, <code>DELETE</code> ללא WHERE הוא DML רגיל - אבל התוצאה זהה: כל השורות נמחקות, שורה אחר שורה.'
    },
    {
      code: 'SELECT department_id, AVG(salary)\nFROM employees\nGROUP BY department_id\nHAVING AVG(salary) > 15000;',
      q: 'מתי בדיוק מתבצע הסינון של <code>HAVING</code> ביחס ל-<code>GROUP BY</code>?',
      o: ['אחרי שהשורות כבר קובצו לפי department_id - HAVING מסנן על תוצאת האגרגציה', 'לפני GROUP BY, בדיוק כמו WHERE', 'HAVING ו-GROUP BY מתבצעים תמיד בו-זמנית', 'HAVING מסנן רק שורות בודדות, לא קבוצות'],
      a: 0,
      w: 'סדר הביצוע הלוגי הוא FROM → WHERE → GROUP BY → HAVING → SELECT. לכן HAVING יכול להתייחס לפונקציית אגרגציה כמו AVG(salary), בניגוד ל-WHERE.'
    },
    {
      code: '-- 999 אינו קיים בטבלת employees, ויש אילוץ FOREIGN KEY על employee_id\nINSERT INTO orders (employee_id, total_amount)\nVALUES (999, 500);',
      q: 'מה יקרה בהרצת ה-INSERT הזה?',
      o: ['שגיאה - הפרת אילוץ FOREIGN KEY, כי אין שורה תואמת בטבלת employees', 'השורה תיכנס בהצלחה עם employee_id ריק', 'המנוע ייצור אוטומטית עובד חדש עם מזהה 999', 'ה-FOREIGN KEY יתעלם מהערך הלא-תקין'],
      a: 0,
      w: 'זה בדיוק תפקידו של Foreign Key - למנוע הכנסת ערך שאין לו שורת אב תואמת, ולשמור על תקינות (Referential Integrity) בין הטבלאות.'
    },
    {
      code: 'SELECT * FROM employees WHERE department_id = NULL;',
      q: 'כמה שורות תחזיר השאילתה הזו, גם אם באמת יש עובדים שערך department_id שלהם הוא NULL?',
      o: ['אפס שורות - השוואה עם <code>= NULL</code> לעולם לא נכונה, יש להשתמש ב-<code>IS NULL</code>', 'את כל השורות עם department_id ריק, כצפוי', 'את כל השורות בטבלה', 'שגיאת תחביר, כי אסור לכתוב NULL אחרי סימן שוויון'],
      a: 0,
      w: 'ב-SQL, NULL מייצג "ערך לא ידוע" - כל השוואה איתו (כולל <code>= NULL</code>) מחזירה UNKNOWN, לא TRUE. הדרך הנכונה לבדוק היא <code>WHERE department_id IS NULL</code>.'
    },
    {
      code: 'SELECT department_id FROM employees\nUNION\nSELECT department_id FROM archived_employees;',
      q: 'מה עושה <code>UNION</code> (ללא ALL) בין שתי תוצאות השאילתה?',
      o: ['מאחדת את התוצאות ומסירה שורות כפולות אוטומטית', 'מאחדת את התוצאות ושומרת גם כפילויות', 'מריצה את שתי השאילתות במקביל בלי לאחד', 'מחזירה שגיאה אם למספר העמודות אין התאמה מדויקת בשם'],
      a: 0,
      w: '<code>UNION</code> מבצע בפועל השוואה ומיון להסרת כפילויות, ולכן יקר יותר חישובית מ-<code>UNION ALL</code>. חשוב: שתי השאילתות חייבות להחזיר אותו מספר עמודות ובאותם טיפוסים תואמים.'
    },
    {
      code: 'SELECT department_id FROM employees\nUNION ALL\nSELECT department_id FROM archived_employees;',
      q: 'מה ההבדל מ-<code>UNION</code> הרגיל בדוגמה הקודמת?',
      o: ['כל השורות משתי השאילתות נשמרות, כולל כפילויות - בלי סינון', 'UNION ALL מוסיף מיון אלפביתי לתוצאה', 'UNION ALL עובד רק על טבלה אחת בכל פעם', 'אין הבדל בפועל, רק בביצועים'],
      a: 0,
      w: '<code>UNION ALL</code> פשוט מצרף את שתי התוצאות זו לזו בלי לבדוק כפילויות - מהיר יותר, ומתאים כשידוע מראש שאין חפיפה או שכפילויות רצויות.'
    },
    {
      code: 'CREATE TRIGGER trg_audit\nAFTER UPDATE ON employees\nFOR EACH ROW\nEXECUTE FUNCTION log_change();\n\nUPDATE employees SET salary = salary * 1.1 WHERE employee_id = 1;',
      q: 'מתי בדיוק ירוץ קוד ה-Trigger, ביחס ל-UPDATE?',
      o: ['אוטומטית מיד אחרי הרצת ה-UPDATE, בלי צורך לקרוא לו במפורש', 'רק אם מריצים גם CALL trg_audit באופן ידני', 'רק בפעם הראשונה שהטבלה מתעדכנת אחרי היצירה', 'רק אם מוסיפים COMMIT מיד אחרי'],
      a: 0,
      w: 'Trigger מוגדר עם AFTER UPDATE, כך שהמנוע מפעיל אותו אוטומטית בכל פעם שמתבצע UPDATE על הטבלה - זה בדיוק ההבדל בינו לבין Stored Procedure שדורש קריאה מפורשת.'
    },
    {
      code: 'CREATE INDEX idx_orders_emp ON orders(employee_id);\n-- הטבלה כוללת מיליוני שורות\nINSERT INTO orders (employee_id, total_amount) VALUES (5, 200);',
      q: 'מה ההשפעה של קיום האינדקס על ביצועי ה-INSERT הזה, בהשוואה למצב בלי אינדקס?',
      o: ['ה-INSERT יהיה מעט איטי יותר, כי המנוע צריך לעדכן גם את מבנה האינדקס בנוסף לטבלה', 'ה-INSERT יהיה מהיר יותר בזכות האינדקס', 'אין שום השפעה על INSERT, אינדקסים משפיעים רק על SELECT', 'ה-INSERT ייכשל כי יש אינדקס על הטבלה'],
      a: 0,
      w: 'זה ה-Trade-off המרכזי של אינדקסים: הם מאיצים קריאה (SELECT) אך מאטים כתיבה (INSERT/UPDATE/DELETE), כי כל שינוי בטבלה דורש עדכון מקביל של מבנה האינדקס.'
    },
    {
      code: 'SELECT employee_id, first_name\nFROM employees\nWHERE salary IN (SELECT salary FROM employees WHERE department_id = 1);',
      q: 'מה יקרה אם תת-השאילתה בתוך ה-IN מחזירה כמה ערכי שכר שונים?',
      o: ['זה תקין לגמרי - אופרטור IN מקבל רשימת ערכים מרובים מתת-שאילתה', 'שגיאה, כי תת-שאילתה חייבת להחזיר ערך יחיד', 'רק הערך הראשון מהתוצאה ייבדק', 'השאילתה תתעלם מהתנאי ותחזיר את כל השורות'],
      a: 0,
      w: 'בניגוד לאופרטור <code>=</code> שדורש בדיוק ערך יחיד מתת-השאילתה (אחרת שגיאה), <code>IN</code> נבנה במיוחד לקבל רשימה של אפס ערכים ומעלה.'
    }
  ];

  /* ============================================================
     מצב 3 - השלמת שאילתה: קטע SQL עם ___ חסר, לבחור מה משלים אותו
     ============================================================ */
  var CMD_COMPLETE = [
    {
      code: 'SELECT ___ department_id FROM employees;',
      q: 'מה משלים את הפקודה כדי להחזיר רק ערכים ייחודיים של department_id?',
      o: ['<code>DISTINCT</code>', '<code>UNIQUE</code>', '<code>ONLY</code>', '<code>DIFFERENT</code>'],
      a: 0,
      w: '<code>SELECT DISTINCT</code> מסנן שורות כפולות מתוצאת השאילתה, כך שכל ערך department_id יופיע פעם אחת בלבד.'
    },
    {
      code: 'SELECT *\nFROM employees e\n___ JOIN departments d ON e.department_id = d.department_id;',
      q: 'מה משלים את השאילתה כך שיוחזרו רק עובדים ששייכים למחלקה קיימת?',
      o: ['<code>INNER</code>', '<code>OUTER</code>', '<code>FULL</code>', '<code>SELF</code>'],
      a: 0,
      w: '<code>INNER JOIN</code> מחזיר רק שורות שיש להן התאמה בשתי הטבלאות - בדיוק עובדים עם department_id שקיים בפועל בטבלת departments.'
    },
    {
      code: 'SELECT department_id, COUNT(*)\nFROM employees\nGROUP BY department_id\n___ COUNT(*) > 5;',
      q: 'מה משלים את השאילתה כדי לסנן ולהציג רק מחלקות עם יותר מ-5 עובדים?',
      o: ['<code>HAVING</code>', '<code>WHERE</code>', '<code>FILTER</code>', '<code>AND</code>'],
      a: 0,
      w: '<code>WHERE</code> לא יכול לסנן לפי תוצאת פונקציית אגרגציה כמו COUNT(*), כי הוא רץ לפני שהקיבוץ נעשה. <code>HAVING</code> נועד בדיוק לזה.'
    },
    {
      code: 'CREATE TABLE departments (\n    department_id INT ___,\n    department_name VARCHAR(100)\n);',
      q: 'מה משלים את הגדרת העמודה כך ש-department_id יהיה מפתח ראשי?',
      o: ['<code>PRIMARY KEY</code>', '<code>FOREIGN KEY</code>', '<code>UNIQUE INDEX</code>', '<code>AUTO KEY</code>'],
      a: 0,
      w: '<code>PRIMARY KEY</code> מגדיר את העמודה כמזהה ייחודי של השורה - אוכף ייחודיות ואוסר NULL בעמודה הזו.'
    },
    {
      code: 'ALTER TABLE employees\n___ COLUMN phone VARCHAR(20);',
      q: 'מה משלים את הפקודה כדי להוסיף עמודה חדשה לטבלה קיימת?',
      o: ['<code>ADD</code>', '<code>CREATE</code>', '<code>INSERT</code>', '<code>NEW</code>'],
      a: 0,
      w: '<code>ALTER TABLE ... ADD COLUMN</code> היא פקודת DDL להרחבת מבנה טבלה קיימת, בלי לגעת בנתונים הקיימים בה.'
    },
    {
      code: 'CREATE TABLE orders (\n    order_id     INT PRIMARY KEY,\n    employee_id  INT,\n    FOREIGN KEY (employee_id) ___ employees(employee_id)\n);',
      q: 'מה משלים את הגדרת ה-Foreign Key כך שיפנה לטבלת employees?',
      o: ['<code>REFERENCES</code>', '<code>POINTS TO</code>', '<code>LINKS</code>', '<code>FROM</code>'],
      a: 0,
      w: '<code>FOREIGN KEY (col) REFERENCES table(col)</code> הוא התחביר הסטנדרטי שקושר עמודה בטבלת הבן למפתח בטבלת האב.'
    },
    {
      code: 'CREATE ___ idx_emp_dept ON employees(department_id);',
      q: 'מה משלים את הפקודה ליצירת אינדקס חדש על עמודת department_id?',
      o: ['<code>INDEX</code>', '<code>KEY</code>', '<code>CONSTRAINT</code>', '<code>VIEW</code>'],
      a: 0,
      w: '<code>CREATE INDEX idx_name ON table(column)</code> יוצר אינדקס חדש שמאיץ חיפוש לפי העמודה הזו, על חשבון מעט האטה ב-INSERT/UPDATE/DELETE.'
    },
    {
      code: '___;\nUPDATE accounts SET balance = balance - 100 WHERE account_id = 1;\nCOMMIT;',
      q: 'מה משלים את השורה הראשונה כדי לפתוח עסקה מפורשת לפני ה-UPDATE?',
      o: ['<code>BEGIN</code> (או <code>START TRANSACTION</code>)', '<code>OPEN</code>', '<code>TRANSACT</code>', '<code>LOCK TABLE</code>'],
      a: 0,
      w: '<code>BEGIN</code> (או <code>START TRANSACTION</code>, תלוי במנוע) פותח עסקה מפורשת - כל הפעולות עד ה-COMMIT או ROLLBACK הבא נחשבות יחידה אחת.'
    },
    {
      code: 'UPDATE employees\nSET salary = salary * 1.1\n___ department_id = 1;',
      q: 'מה משלים את הפקודה כך שהעדכון יחול רק על עובדי מחלקה 1?',
      o: ['<code>WHERE</code>', '<code>HAVING</code>', '<code>FILTER</code>', '<code>WHEN</code>'],
      a: 0,
      w: 'בלי <code>WHERE</code>, ה-UPDATE היה מעלה את השכר של כל העובדים בטבלה - <code>WHERE</code> מגביל את הפעולה לשורות התואמות בלבד.'
    },
    {
      code: 'CREATE ___ employee_department_view AS\nSELECT e.first_name, d.department_name\nFROM employees e\nJOIN departments d ON e.department_id = d.department_id;',
      q: 'מה משלים את הפקודה ליצירת תצוגה שמורה (וירטואלית) על בסיס השאילתה?',
      o: ['<code>VIEW</code>', '<code>TABLE</code>', '<code>QUERY</code>', '<code>SNAPSHOT</code>'],
      a: 0,
      w: '<code>CREATE VIEW name AS SELECT ...</code> שומרת את שאילתת ה-SELECT תחת שם, ומאפשרת להשתמש בה בעתיד כמו בטבלה רגילה.'
    },
    {
      code: 'GRANT SELECT ON employees\n___ analyst_role;',
      q: 'מה משלים את הפקודה כדי להעניק את ההרשאה לתפקיד analyst_role?',
      o: ['<code>TO</code>', '<code>FOR</code>', '<code>ON</code>', '<code>AS</code>'],
      a: 0,
      w: '<code>GRANT permission ON object TO role/user</code> הוא התחביר הסטנדרטי להענקת הרשאות - כאן ניתנת הרשאת קריאה בלבד על טבלת employees.'
    },
    {
      code: 'CREATE TRIGGER trg_salary_audit\n___ UPDATE ON employees\nFOR EACH ROW\nEXECUTE FUNCTION log_salary_change();',
      q: 'מה משלים את הפקודה כדי שהטריגר ירוץ אחרי כל UPDATE (ולא לפני)?',
      o: ['<code>AFTER</code>', '<code>BEFORE</code>', '<code>DURING</code>', '<code>ON</code>'],
      a: 0,
      w: '<code>AFTER UPDATE</code> מריץ את הטריגר אחרי שהעדכון כבר בוצע בפועל - שימושי ל-Audit Trail שרושם את הערך החדש שכבר נשמר.'
    },
    {
      code: 'CREATE TABLE employees (\n    employee_id INT PRIMARY KEY,\n    email       VARCHAR(100) ___\n);',
      q: 'מה משלים את הגדרת עמודת email כך שלא יתקבלו שני עובדים עם אותה כתובת, אך NULL עדיין יתאפשר?',
      o: ['<code>UNIQUE</code>', '<code>PRIMARY KEY</code>', '<code>NOT NULL</code>', '<code>INDEXED</code>'],
      a: 0,
      w: 'אילוץ <code>UNIQUE</code> אוכף ייחודיות בלי לאסור NULL לגמרי, בניגוד ל-PRIMARY KEY שגם אוכף ייחודיות וגם אוסר NULL באופן מוחלט.'
    }
  ];

  /* ============================================================
     מצב 4 - התאמת מושגים: סבבים של זוגות מונח/פקודה + תיאור
     ============================================================ */
  var MATCH_ROUNDS = [
    {
      title: 'פקודות SQL בסיסיות',
      pairs: [
        { l: '<code>SELECT</code>', r: 'שולפת נתונים מטבלה אחת או יותר' },
        { l: '<code>INSERT</code>', r: 'מוסיפה שורה או שורות חדשות לטבלה' },
        { l: '<code>UPDATE</code>', r: 'משנה ערכים בשורות קיימות בטבלה' },
        { l: '<code>DELETE</code>', r: 'מוחקת שורות קיימות מטבלה' },
        { l: '<code>CREATE TABLE</code>', r: 'מגדירה מבנה חדש של טבלה - עמודות וטיפוסים' }
      ]
    },
    {
      title: 'סוגי JOIN',
      pairs: [
        { l: '<code>INNER JOIN</code>', r: 'רק שורות שיש להן התאמה בשתי הטבלאות' },
        { l: '<code>LEFT JOIN</code>', r: 'כל שורות הטבלה השמאלית, עם NULL היכן שאין התאמה' },
        { l: '<code>RIGHT JOIN</code>', r: 'כל שורות הטבלה הימנית, עם NULL היכן שאין התאמה' },
        { l: '<code>FULL OUTER JOIN</code>', r: 'כל השורות משתי הטבלאות, עם NULL היכן שאין התאמה בצד השני' },
        { l: '<code>CROSS JOIN</code>', r: 'מכפלה קרטזית - כל שילוב אפשרי בין שורות שתי הטבלאות' }
      ]
    },
    {
      title: 'Transactions ו-ACID',
      pairs: [
        { l: 'Atomicity', r: 'העסקה מתבצעת כולה או לא מתבצעת כלל' },
        { l: 'Consistency', r: 'המסד עובר ממצב תקין אחד לאחר, בלי להפר אילוצים' },
        { l: 'Isolation', r: 'עסקאות מקבילות לא רואות תוצאות חלקיות זו של זו' },
        { l: 'Durability', r: 'שינוי שעבר COMMIT נשמר גם אחרי קריסת המערכת' },
        { l: '<code>ROLLBACK</code>', r: 'מבטל את כל השינויים שבוצעו מתחילת העסקה' }
      ]
    },
    {
      title: 'Constraints ומפתחות',
      pairs: [
        { l: '<code>PRIMARY KEY</code>', r: 'מזהה כל שורה בצורה ייחודית, ואוסר ערך NULL' },
        { l: '<code>FOREIGN KEY</code>', r: 'שומר על קשר תקין לעמודת מפתח בטבלה אחרת' },
        { l: '<code>UNIQUE</code>', r: 'אוכף ערכים ייחודיים, אך מאפשר NULL' },
        { l: '<code>NOT NULL</code>', r: 'אוסר על השארת העמודה ריקה בכל שורה' },
        { l: '<code>CHECK</code>', r: 'אוכף תנאי לוגי מותאם אישית על ערכי העמודה' }
      ]
    },
    {
      title: 'Views, Procedures ו-Triggers',
      pairs: [
        { l: 'View', r: 'שאילתת SELECT שמורה, מתנהגת כמו טבלה וירטואלית' },
        { l: 'Materialized View', r: 'תוצאה שמורה בפועל על הדיסק, זקוקה לרענון מפורש' },
        { l: 'Stored Procedure', r: 'בלוק קוד SQL שמור במסד, מורץ עם CALL' },
        { l: 'Function', r: 'מחזירה ערך וניתנת לשימוש בתוך שאילתת SELECT' },
        { l: 'Trigger', r: 'קוד שרץ אוטומטית בתגובה לאירוע INSERT/UPDATE/DELETE' }
      ]
    }
  ];

  /* ============================================================
     מצב 5 - סידור תהליך: סבבים של שלבים שצריך לסדר בסדר הנכון
     ============================================================ */
  var ORDER_ROUNDS = [
    {
      title: 'נורמליזציה של טבלה לא מנורמלת',
      steps: [
        'זיהוי טבלה עם כפילויות נתונים וערכים מרובים בתא בודד',
        'פירוק ערכים מרובים בתא לשורה נפרדת עבור כל ערך - עמידה ב-1NF',
        'הפרדת עמודות שתלויות רק בחלק מהמפתח המורכב לטבלה נפרדת - עמידה ב-2NF',
        'הסרת תלות טרנזיטיבית בין עמודות לא-מפתח לטבלה עצמאית - עמידה ב-3NF',
        'הוספת Foreign Key בין הטבלאות החדשות כדי לשמר את הקשר המקורי'
      ]
    },
    {
      title: 'ביצוע Transaction עם בדיקת תקינות ו-Rollback אפשרי',
      steps: [
        'הרצת BEGIN לפתיחת עסקה מפורשת',
        'ביצוע UPDATE להפחתת סכום מיתרת חשבון המקור',
        'ביצוע UPDATE להוספת אותו סכום ליתרת חשבון היעד',
        'בדיקה שהיתרה החדשה בחשבון המקור אינה שלילית',
        'הרצת COMMIT אם הבדיקה תקינה, או ROLLBACK אם התגלתה בעיה'
      ]
    },
    {
      title: 'יצירת טבלאות עם קשר Foreign Key ואינדקס לביצועים',
      steps: [
        'הרצת CREATE TABLE לטבלת האב עם עמודת PRIMARY KEY',
        'הרצת CREATE TABLE לטבלת הבן עם עמודת Foreign Key',
        'הוספת אילוץ FOREIGN KEY שמפנה לטבלת האב',
        'הרצת INSERT לנתוני בדיקה בשתי הטבלאות',
        'יצירת אינדקס על עמודת ה-Foreign Key לשיפור ביצועי JOIN עתידיים'
      ]
    },
    {
      title: 'אבחון ואופטימיזציה של שאילתה איטית',
      steps: [
        'זיהוי שאילתה שרצה לאט באופן חריג בפרודקשן',
        'הרצת EXPLAIN לבדיקת תוכנית הביצוע שהמנוע בחר',
        'איתור Full Table Scan במקום שימוש באינדקס קיים',
        'יצירת אינדקס מתאים על עמודת הסינון או עמודת ה-JOIN',
        'הרצה חוזרת של EXPLAIN לאימות שהאינדקס נבחר בפועל בתוכנית החדשה'
      ]
    }
  ];

  /* ============================================================
     הגדרת מצבי המשחק
     ============================================================ */
  var MODES = [
    { key: 'rapid', icon: '⚡', name: 'קרב מהיר', desc: 'שאלות ידע כלליות על SQL - כמה תספיקו לפני שהזמן נגמר?', type: 'quiz', data: RAPID, sample: 8, time: 20000 },
    { key: 'guess', icon: '🔎', name: 'ניחוש פלט', desc: 'קטע שאילתת SQL - מה בדיוק יהיה הפלט או מה יקרה בפועל?', type: 'quiz', data: GUESS_OUTPUT, sample: 8, time: 30000, showCode: true },
    { key: 'complete', icon: '🧩', name: 'השלמת שאילתה', desc: 'שאילתת SQL עם חלק חסר - בחרו מה משלים אותה נכון', type: 'quiz', data: CMD_COMPLETE, sample: 8, time: 28000, showCode: true },
    { key: 'match', icon: '🔗', name: 'התאמת מושגים', desc: 'התאימו כל מונח/פקודת SQL לתיאור הנכון שלו', type: 'match', data: MATCH_ROUNDS, sample: 2 },
    { key: 'order', icon: '📋', name: 'סידור תהליך', desc: 'סדרו את שלבי התהליך לפי הסדר הנכון', type: 'order', data: ORDER_ROUNDS, sample: 2 }
  ];

  window.TG_CONFIG = { gameId: "sql", modes: MODES };
})();
</script>

<script src="/scripts/topic-game.js"></script>
