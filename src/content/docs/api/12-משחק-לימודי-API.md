---
title: "משחק לימודי: אתגר API"
category: API
part: 12/10
description: "משחק אינטראקטיבי ללימוד עולם ה-API - חמישה מצבי משחק עם טיימר, לבבות, ניקוד ורצפים: קרב מהיר, ניחוש קוד תגובה HTTP, השלמת בקשה/הגדרה, התאמת מושגים וסידור תהליך."
---

חמישה מצבי משחק שבודקים היבטים שונים של עולם ה-API - לא עוד חידון רב-ברירה, אלא משחק עם **טיימר**, **שלושה לבבות**, **מכפיל רצף** ו**שיא אישי** שנשמר בדפדפן. בסוף כל סבב תקבלו דירוג, ורשימת חזרה של בדיוק מה שפספסתם.


<div class="tg" id="tg" dir="rtl">
  <div class="tg-screen is-active" data-screen="menu">
    <div class="tg-hero">
      <div class="tg-hero-badge">API</div>
      <div class="tg-hero-title">אתגר API</div>
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
      q: 'מי הגדיר את סגנון הארכיטקטורה REST, ובאיזה הקשר?',
      o: ['רוי פילדינג (Roy Fielding), בעבודת הדוקטורט שלו משנת 2000', 'טים ברנרס-לי (Tim Berners-Lee), כחלק מהגדרת HTML', 'ועדת התקינה W3C', 'חברת Facebook, כשפיתחה את GraphQL ב-2012'],
      a: 0,
      w: 'REST (Representational State Transfer) הוגדר לראשונה על ידי רוי פילדינג בעבודת הדוקטורט שלו, כתיאור לסגנון ארכיטקטורה - לא כתקן פורמלי מחייב.'
    },
    {
      q: 'מהי המשמעות של Idempotent בהקשר של HTTP Methods?',
      o: ['הרצה חוזרת של אותה בקשה נותנת תמיד את אותה תוצאה בשרת', 'הבקשה לא משנה מצב בשרת כלל (read-only)', 'הבקשה חייבת לכלול Body', 'הבקשה מוצפנת תמיד ב-TLS'],
      a: 0,
      w: '<code>PUT</code> ו-<code>DELETE</code> הן דוגמאות ל-Methods אידמפוטנטיות - שליחת אותה בקשה פעם אחת או חמש פעמים משאירה את השרת באותו מצב סופי. <code>POST</code> לרוב אינה אידמפוטנטית.'
    },
    {
      q: 'אילו שתי Methods הבאות נחשבות Safe (לא משנות מצב בשרת)?',
      o: ['<code>GET</code> ו-<code>HEAD</code>', '<code>POST</code> ו-<code>PUT</code>', '<code>DELETE</code> ו-<code>PATCH</code>', '<code>PUT</code> ו-<code>DELETE</code>'],
      a: 0,
      w: 'Safe אומר שהבקשה היא read-only ולא אמורה לשנות מצב בשרת. <code>GET</code>, <code>HEAD</code> ו-<code>OPTIONS</code> הן Safe; <code>POST</code>, <code>PUT</code>, <code>PATCH</code> ו-<code>DELETE</code> משנות מצב ולכן לא.'
    },
    {
      q: 'מה ההבדל העיקרי בין <code>PUT</code> ל-<code>PATCH</code>?',
      o: ['<code>PUT</code> מבצע עדכון מלא של המשאב (יש לשלוח את כל השדות), <code>PATCH</code> מעדכן רק חלקית', 'אין הבדל מעשי בין השניים', '<code>PUT</code> משמש רק ליצירת משאבים חדשים', '<code>PATCH</code> הוא היחיד שדורש אימות'],
      a: 0,
      w: 'עם <code>PUT</code>, אם לא שולחים שדה מסוים הוא עלול "להיעלם" (כי זו החלפה מלאה). <code>PATCH</code> נועד בדיוק למקרה שרוצים לשנות רק שדה אחד או שניים.'
    },
    {
      q: 'מה ההבדל בין <code>401 Unauthorized</code> ל-<code>403 Forbidden</code>?',
      o: ['401 = חסר אימות או אימות שגוי ("מי אתה?"), 403 = מזוהה אבל אין הרשאה ("אתה לא רשאי")', '401 ו-403 זהים לחלוטין מבחינת המשמעות', '401 מוחזר רק על <code>POST</code>, 403 רק על <code>GET</code>', '403 תמיד מצביע על ניסיון תקיפה'],
      a: 0,
      w: 'זו שאלת ראיון קלאסית: 401 אומר "אני לא יודע מי אתה" (בעיית Authentication), ואילו 403 אומר "אני יודע מי אתה, אבל אתה לא מורשה" (בעיית Authorization).'
    },
    {
      q: 'איזה status code הכי מתאים להחזיר בעקבות <code>POST</code> שיצר משאב חדש בהצלחה?',
      o: ['<code>201 Created</code>', '<code>200 OK</code>', '<code>204 No Content</code>', '<code>202 Accepted</code>'],
      a: 0,
      w: '<code>201 Created</code> מלווה בדרך כלל ב-Header בשם <code>Location</code> שמצביע על ה-URI של המשאב החדש שנוצר.'
    },
    {
      q: 'מה משמעות <code>429 Too Many Requests</code>, ואיזה Header נהוג לצרף אליו?',
      o: ['חריגה ממכסת Rate Limit; מצרפים <code>Retry-After</code> שמציין כמה זמן לחכות', 'שגיאת שרת פנימית; מצרפים <code>X-Error-Code</code>', 'בעיית הרשאה; מצרפים <code>WWW-Authenticate</code> בלבד', 'הבקשה נחסמה סופית ואי אפשר לנסות שוב לעולם'],
      a: 0,
      w: '<code>Retry-After</code> עוזר ללקוח לדעת בדיוק מתי כדאי לנסות שוב, במקום לנחש או להציף את השרת בעוד ניסיונות.'
    },
    {
      q: 'משלושה חלקים מורכב JWT (JSON Web Token)?',
      o: ['Header, Payload ו-Signature - מופרדים בנקודות', 'Header, Body ו-Footer', 'Client ID, Client Secret ו-Scope', 'Issuer, Audience ו-Expiration בלבד'],
      a: 0,
      w: 'ה-Signature הוא זה שמבטיח שהטוקן לא זויף. חשוב לזכור: ה-Payload רק מקודד ב-Base64 ולא מוצפן - אסור לשים בו מידע רגיש.'
    },
    {
      q: 'למה JWT נחשב Stateless?',
      o: ['השרת לא צריך לשמור את הטוקן ב-DB, רק לוודא את החתימה שלו', 'הטוקן נשמר תמיד ב-Cookie', 'הטוקן מתחדש אוטומטית בכל בקשה', 'אין לו זמן תפוגה בכלל'],
      a: 0,
      w: 'זה ההבדל המרכזי מ-Session-based Authentication, שהיא Stateful - שם השרת חייב לזכור את המצב (בזיכרון/DB/Redis) עבור כל משתמש מחובר.'
    },
    {
      q: 'מהי המטרה העיקרית של OAuth 2.0?',
      o: ['תקן לאצילת הרשאות - מאפשר לאפליקציה לגשת למשאבים בשם המשתמש בלי לראות את הסיסמה שלו', 'שיטת הצפנה של גוף הבקשה', 'פרוטוקול להעברת קבצים בין שרתים', 'תחליף מלא ל-HTTPS'],
      a: 0,
      w: 'דוגמה קלאסית: "התחבר עם Google". האפליקציה מקבלת access token שמאפשר לה לפעול בשם המשתמש, בלי שהסיסמה שלו עוברת דרכה בכלל.'
    },
    {
      q: 'מהו החיסרון המרכזי של אימות באמצעות API Key סטטי?',
      o: ['אין לו בדרך כלל תפוגה מובנית, קשה לשלוט בהרשאות עדינות, ואם דלף - חייבים לבטל ידנית', 'הוא תמיד מוצפן ולכן איטי מדי לשימוש', 'אי אפשר להשתמש בו בתקשורת server-to-server', 'הוא חלק מתקן HTTP הרשמי ולכן קשיח מדי'],
      a: 0,
      w: 'API Key מתאים בעיקר לתקשורת server-to-server, ולא לחשיפה בצד לקוח/דפדפן - בדיוק בגלל שקשה לשלוט בו ברמת פירוט גבוהה.'
    },
    {
      q: 'מהי מטרת Idempotency Key שנשלח בבקשת <code>POST</code>?',
      o: ['לאפשר לשרת לזהות בקשות כפולות (בגלל retry ברשת) ולא ליצור משאב כפול', 'להצפין את גוף הבקשה', 'להחליף את הצורך באימות (Authentication)', 'לקבוע את גרסת ה-API'],
      a: 0,
      w: 'שימושי מאוד ב-APIs של תשלומים: אם בקשת תשלום נשלחת פעמיים בגלל בעיית רשת, השרת מזהה את אותו מפתח ומחזיר את התוצאה השמורה - בלי לחייב פעמיים.'
    },
    {
      q: 'מה היתרון של Cursor-based Pagination על פני Page-based Pagination?',
      o: ['יציבה יותר ב-datasets גדולים ומשתנים, מונעת דילוג או כפילות של פריטים', 'היא תמיד מהירה יותר מבחינת רוחב פס', 'היא היחידה שתומכת בפורמט JSON', 'היא מאפשרת "לקפוץ" ישירות לעמוד מספר 5'],
      a: 0,
      w: 'כשנתונים נוספים או נמחקים באמצע הרשימה, Page/Offset עלולים לדלג על פריטים או להציג כפילויות. Cursor-based עמיד יותר למצב הזה, אך פחות אינטואיטיבי (אי אפשר "לקפוץ לעמוד 5").'
    },
    {
      q: 'מה מאפיין את Level 2 במודל הבשלות של Richardson (Richardson Maturity Model)?',
      o: ['שימוש נכון ב-HTTP Methods ו-Status Codes - הרמה שבה נמצאים רוב ה-APIs "RESTful" בתעשייה', 'endpoint יחיד ו-method יחיד בסגנון RPC', 'הוספת HATEOAS מלא לכל תשובה', 'שימוש בלעדי ב-GraphQL'],
      a: 0,
      w: 'Level 0 הוא RPC-style עם endpoint יחיד, Level 1 מוסיף resources שונים, Level 2 מוסיף שימוש נכון ב-Methods/Status Codes, ו-Level 3 (הנדיר ביותר בפועל) מוסיף HATEOAS מלא.'
    },
    {
      q: 'מהי שיטת ה-Versioning הפרקטית והנפוצה ביותר ברוב הפרויקטים?',
      o: ['Versioning ב-URL, למשל <code>/v1/users</code> ו-<code>/v2/users</code>', 'Versioning רק דרך Query Parameter', 'ללא Versioning בכלל, לעולם', 'Versioning רק בגוף הבקשה (Body)'],
      a: 0,
      w: 'Versioning ב-URL "פחות טהור" מבחינה תיאורטית של REST, אבל פשוט, ברור וקל לתעד - ולכן הוא הנפוץ ביותר בפועל בתעשייה.'
    },
    {
      q: 'מה ההבדל המרכזי בין REST ל-GraphQL מבחינת endpoints ושליטה בנתונים?',
      o: ['ב-REST יש לרוב endpoint לכל משאב; ב-GraphQL יש endpoint יחיד וה-לקוח קובע בדיוק אילו שדות לקבל', 'GraphQL תמיד מהיר יותר טכנית מ-REST', 'REST לא תומך כלל בפורמט JSON', 'GraphQL לא יכול לבצע פעולות כתיבה (Mutation)'],
      a: 0,
      w: 'GraphQL נועד לפתור בעיות Over-fetching ו-Under-fetching שקיימות ב-REST, במחיר מורכבות נוספת (במיוחד סביב caching).'
    },
    {
      q: 'מהי BOLA (Broken Object Level Authorization), ולמה היא מדורגת ראשונה ב-OWASP API Security Top 10?',
      o: ['משתמש מזוהה יכול לגשת לנתונים ששייכים למשתמש אחר, כי השרת לא בודק בעלות (ownership) על המשאב', 'הזרקת קוד SQL דרך שדה טקסט חופשי', 'שימוש בסיסמה חלשה מדי', 'חוסר הצפנה ב-HTTPS'],
      a: 0,
      w: 'זו הפגיעות הנפוצה ביותר ב-APIs: השרת בודק אימות (מי אתה) אבל שוכח לבדוק הרשאה על המשאב הספציפי (האם ההזמנה הזו באמת שלך).'
    },
    {
      q: 'מה עושה Header בשם <code>ETag</code>, ואיך הוא קשור ל-<code>304 Not Modified</code>?',
      o: ['הוא "טביעת אצבע" של המשאב; אם הלקוח שולח אותו ב-<code>If-None-Match</code> והמשאב לא השתנה, השרת מחזיר 304 בלי גוף תשובה', 'הוא מזהה ייחודי של המשתמש המחובר', 'הוא שם ה-Method שהתבצע בבקשה', 'הוא שווה תמיד לתאריך תפוגת הטוקן'],
      a: 0,
      w: 'זה חוסך bandwidth משמעותית - השרת לא צריך לשלוח שוב את כל הגוף אם שום דבר לא השתנה מאז הבקשה הקודמת.'
    }
  ];

  /* ============================================================
     מצב 2 - ניתוח בקשה/תשובה: קטע HTTP/קוד + מה יקרה או מה הבעיה
     ============================================================ */
  var REQUEST_ANALYSIS = [
    {
      code: 'PUT /v1/users/42 HTTP/1.1\nContent-Type: application/json\n\n{"age": 31}',
      q: 'שלחתם <code>PUT</code> עם רק שדה <code>age</code>, כשלמשתמש יש גם <code>name</code> ו-<code>email</code> קיימים. מה עלול לקרות?',
      o: ['לפי סמנטיקת <code>PUT</code> (עדכון מלא), שדות שלא נשלחו עלולים להימחק/להתאפס - עדיף <code>PATCH</code> לעדכון חלקי', 'שום דבר, <code>PUT</code> תמיד משמר שדות קיימים אוטומטית', 'הבקשה תיכשל תמיד עם <code>400</code>', '<code>PUT</code> מתעלם משדות חסרים ולא נוגע במשאב'],
      a: 0,
      w: '<code>PUT</code> מייצג "שימו את כל המשאב הזה במקום הישן". אם שרת ממומש נכון לפי הסמנטיקה, שדות שלא נשלחו עלולים "להיעלם". <code>PATCH</code> מיועד בדיוק למקרה של עדכון שדה בודד.'
    },
    {
      code: 'DELETE /v1/orders/501 HTTP/1.1\nAuthorization: Bearer TOKEN123',
      q: 'מחקתם הזמנה בהצלחה. איזה status code סביר ביותר שהשרת יחזיר, ומה יהיה בגוף התשובה?',
      o: ['<code>204 No Content</code>, בדרך כלל בלי גוף תשובה בכלל', '<code>201 Created</code>, עם פרטי ההזמנה שנמחקה', '<code>404 Not Found</code>, כי המשאב כבר לא קיים', '<code>100 Continue</code>'],
      a: 0,
      w: '204 מתאים במיוחד ל-DELETE מוצלח - הפעולה הצליחה ואין תוכן רלוונטי להחזיר. לעיתים משתמשים גם ב-200 אם רוצים להחזיר מידע על המשאב שנמחק.'
    },
    {
      code: '{\n  "sub": "user_42",\n  "role": "admin",\n  "creditCard": "4111-1111-1111-1111",\n  "exp": 1735693200\n}',
      q: 'זהו Payload מפוענח של JWT. מה הבעיה האבטחתית המרכזית כאן?',
      o: ['ה-Payload רק מקודד ב-Base64 ולא מוצפן - מספר כרטיס האשראי גלוי לכל מי שמפענח את הטוקן', 'שדה <code>exp</code> חייב להיות מחרוזת ולא מספר', 'אסור בשום מקרה לכלול <code>role</code> בטוקן', 'הטוקן קצר מדי ולכן לא בטוח'],
      a: 0,
      w: 'כל אחד יכול לפענח את ה-Payload של JWT (הוא רק Base64, לא הצפנה) - לכן אסור לשים בו מידע רגיש כמו מספרי כרטיס אשראי או סיסמאות.'
    },
    {
      code: 'app.get("/orders/:id", authenticate, async (req, res) => {\n  const order = await Order.findById(req.params.id);\n  res.json(order);\n});',
      q: 'מה הפגיעות האבטחתית העיקרית בקוד הזה?',
      o: ['BOLA - אין בדיקה שההזמנה שייכת למשתמש המחובר (<code>req.user.id</code>), כל משתמש מזוהה יכול לראות הזמנות של אחרים', 'חוסר וולידציית קלט על <code>req.params.id</code> בלבד', 'שכחו להוסיף <code>Content-Type</code> Header', 'הפונקציה לא <code>async</code>'],
      a: 0,
      w: 'ה-Middleware <code>authenticate</code> בודק רק מי המשתמש, אבל הקוד לא בודק אם ה-<code>order</code> שנמצא שייך לו. התיקון: להשוות <code>order.userId !== req.user.id</code> ולהחזיר 404 אם לא תואם.'
    },
    {
      code: 'app.use(cors({\n  origin: "*",\n  credentials: true\n}));',
      q: 'מה הבעיה בקונפיגורציית ה-CORS הזו?',
      o: ['שילוב של <code>origin: "*"</code> עם <code>credentials: true</code> מסוכן, ולרוב אף נחסם ע"י דפדפנים', 'CORS לא רלוונטי כלל לבקשות מדפדפן', '<code>origin</code> חייב להיות מערך ריק כברירת מחדל', '<code>credentials: true</code> אסור להשתמש בו לעולם'],
      a: 0,
      w: 'כשעובדים עם cookies/session (<code>credentials: true</code>), צריך לציין רשימת domains מוגדרת ב-<code>origin</code> - לא wildcard פתוח לכולם.'
    },
    {
      code: 'const query = `SELECT * FROM users WHERE email = \'${email}\'`;\ndb.query(query);',
      q: 'מה הסיכון בקוד הזה, ואיך פותרים אותו נכון?',
      o: ['פגיע ל-SQL Injection; הפתרון הוא Parameterized Query (למשל <code>db.query("... WHERE email = ?", [email])</code>)', 'שום סיכון, זו הדרך הרגילה לעבוד מול DB', 'הבעיה היא רק חוסר <code>try/catch</code>', 'הבעיה היא שהשאילתה לא <code>async</code>'],
      a: 0,
      w: 'בניית שאילתות ע"י שרשור מחרוזות מאפשרת לתוקף להזריק קוד SQL זדוני דרך הקלט. יש להשתמש תמיד ב-ORM או ב-parameterized queries.'
    },
    {
      code: 'HTTP/1.1 429 Too Many Requests\nRetry-After: 300\nX-RateLimit-Remaining: 0',
      q: 'מה אמורה אפליקציית הלקוח לעשות כשהיא מקבלת תשובה כזו?',
      o: ['להמתין לפחות 300 שניות (או עד הזמן שצוין) לפני שהיא מנסה לשלוח בקשה נוספת', 'לנסות שוב מיד בלולאה עד שהבקשה תצליח', 'להחליף את ה-<code>Authorization</code> Header ולנסות שוב', 'להתעלם מה-Header ולהמשיך כרגיל'],
      a: 0,
      w: 'התעלמות מ-<code>Retry-After</code> וניסיונות חוזרים מיידיים רק מחמירים את העומס על השרת ומאריכים את זמן החסימה בפועל.'
    },
    {
      code: 'GET /users/42 HTTP/1.1\nIf-None-Match: "a1b2c3d4"\n\nHTTP/1.1 304 Not Modified',
      q: 'מה קרה כאן, ולמה זה חוסך משאבים?',
      o: ['ה-ETag של המשאב לא השתנה מאז הבקשה הקודמת, אז השרת החזיר 304 בלי לשלוח שוב את כל גוף התשובה', 'המשתמש לא קיים בכלל', 'הבקשה נחסמה בגלל Rate Limiting', 'השרת דורש אימות מחדש'],
      a: 0,
      w: 'זהו Conditional Request קלאסי - הלקוח "מציג" את ה-ETag שכבר יש לו, והשרת רק מאשר שהוא עדיין תקף, בלי לבזבז bandwidth על שליחת הנתונים שוב.'
    },
    {
      code: 'app.use("/v1", (req, res, next) => {\n  res.set("Deprecation", "true");\n  res.set("Sunset", "Sat, 31 Dec 2026 23:59:59 GMT");\n  next();\n});',
      q: 'מה המשמעות של ה-Middleware הזה עבור לקוחות שעדיין קוראים ל-v1?',
      o: ['הוא מתריע ללקוחות (בעזרת Headers) שגרסת v1 מיושנת ותפסיק לעבוד בתאריך ה-Sunset שצוין', 'הוא חוסם באופן מיידי כל בקשה ל-v1', 'הוא מוחק אוטומטית את הענף v1 מהקוד', 'הוא מפנה (redirect) כל בקשה ל-v2 בלי הודעה'],
      a: 0,
      w: '<code>Deprecation</code> ו-<code>Sunset</code> הם דרך תקנית (RFC 8594) לתקשר ללקוחות שהגרסה בדרך החוצה, בלי לשבור אותם באופן מיידי.'
    },
    {
      code: 'query {\n  user(id: 42) {\n    name\n    orders(limit: 5) {\n      id\n      total\n    }\n  }\n}',
      q: 'מה יחזיר GraphQL בתשובה לשאילתה הזו, בהשוואה למה שהיה קורה ב-REST?',
      o: ['בדיוק את השדות שביקשתם (name + עד 5 הזמנות עם id/total) בקריאה יחידה - ב-REST זה היה דורש כנראה 2 קריאות נפרדות ועוד שדות מיותרים', 'שגיאה, כי GraphQL לא תומך בשאילתות מקוננות', 'את כל השדות של המשתמש, כולל כאלה שלא ביקשתם', 'רשימה של כל המשתמשים במערכת'],
      a: 0,
      w: 'זה בדיוק הפתרון של GraphQL לבעיות Over-fetching (יותר מדי שדות) ו-Under-fetching (יותר מדי קריאות נפרדות) שקיימות ב-REST.'
    },
    {
      code: 'Cache-Control: private, no-cache',
      q: 'מה אומר ה-Header הזה על אופן ה-caching של התשובה?',
      o: ['התשובה ספציפית ללקוח (לא לשיתוף, למשל ב-CDN) וחייבת revalidation מול השרת לפני שימוש חוזר', 'אסור לשמור את התשובה בשום מקום, אפילו לא רגע אחד', 'התשובה יכולה להישמר בכל CDN ציבורי למשך שעה', 'ה-Header לא משפיע על caching בכלל, רק על אבטחה'],
      a: 0,
      w: '<code>private</code> אומר "רק ה-cache של הלקוח הספציפי הזה, לא cache משותף". <code>no-cache</code> לא אומר "בלי caching בכלל" אלא "אסור להשתמש בעותק שמור בלי לבדוק קודם מול השרת".'
    },
    {
      code: "responses:\n  '200':\n    description: רשימת משתמשים\n  '401':\n    description: חסר אימות",
      q: 'זהו קטע מקובץ OpenAPI. מה תפקידו העיקרי?',
      o: ['מתעד באופן פורמלי אילו status codes ה-endpoint מחזיר ובאיזה מצב, כחלק מהחוזה (Contract) של ה-API', 'הוא קוד שרץ בפועל ומחזיר את התשובות האלה', 'הוא קובץ בדיקות (Test) שרץ ב-CI', 'הוא קובץ הרשאות (Access Control List)'],
      a: 0,
      w: 'קובץ OpenAPI הוא תיעוד פורמלי - הוא לא קוד שרץ, אלא "חוזה" שמתאר מה ה-API אמור לעשות. אפשר להשוות אותו להתנהגות בפועל דרך Contract Tests.'
    },
    {
      code: 'pm.test("Status code is 200", function () {\n    pm.response.to.have.status(200);\n});',
      q: 'היכן בדרך כלל משתמשים בקטע קוד כזה, ומה מטרתו?',
      o: ['בלשונית Tests של בקשה ב-Postman, כדי לוודא אוטומטית שהתשובה בפועל תואמת לציפייה', 'זהו קוד שרץ בצד השרת בכל בקשה נכנסת', 'זהו חלק מקובץ OpenAPI', 'זהו קוד שמייצר טוקן JWT'],
      a: 0,
      w: 'Postman מאפשר לצרף Test Scripts לכל בקשה, ולהריץ אותם אוטומטית (כולל דרך Newman ב-CI/CD) כדי לוודא שהתשובה בפועל תקינה.'
    }
  ];

  /* ============================================================
     מצב 3 - השלמת קוד: endpoint/header/קטע קוד עם חלק חסר
     ============================================================ */
  var FILL_BLANK = [
    {
      code: "$ curl -X ___ https://api.example.com/v1/users/42 \\\n  -d '{\"age\": 31}'",
      q: 'איזה HTTP Method הכי מתאים לעדכון שדה בודד (<code>age</code>) במשתמש קיים?',
      o: ['<code>PATCH</code>', '<code>PUT</code>', '<code>POST</code>', '<code>GET</code>'],
      a: 0,
      w: '<code>PATCH</code> נועד בדיוק לעדכון חלקי - שולחים רק את השדה שרוצים לשנות, בניגוד ל-<code>PUT</code> שדורש שליחת המשאב המלא.'
    },
    {
      code: 'Authorization: ___ eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      q: 'מה משלים את ה-Header כדי לציין שמדובר בטוקן מסוג Bearer?',
      o: ['<code>Bearer</code>', '<code>Basic</code>', '<code>Token</code>', '<code>API-Key</code>'],
      a: 0,
      w: '<code>Bearer</code> הוא הסכימה הנפוצה ביותר עבור JWT ושאר Access Tokens. <code>Basic</code> משמש לשם משתמש+סיסמה מקודדים ב-Base64.'
    },
    {
      code: 'HTTP/1.1 ___ Created',
      q: 'איזה קוד סטטוס משלים תשובה זו, אחרי <code>POST</code> מוצלח שיצר משאב חדש?',
      o: ['<code>201</code>', '<code>200</code>', '<code>202</code>', '<code>204</code>'],
      a: 0,
      w: '<code>201 Created</code> הוא הסטטוס הסטנדרטי אחרי יצירת משאב, לרוב יחד עם Header <code>Location</code> שמצביע על ה-URI החדש.'
    },
    {
      code: 'HTTP/1.1 ___ No Content',
      q: 'איזה קוד סטטוס משלים תשובה זו, הנפוצה אחרי <code>DELETE</code> מוצלח בלי גוף תשובה?',
      o: ['<code>204</code>', '<code>200</code>', '<code>201</code>', '<code>202</code>'],
      a: 0,
      w: '<code>204</code> אומר "הצלחה, אבל אין תוכן להחזיר" - מתאים מאוד למחיקה שלא מחזירה נתונים.'
    },
    {
      code: 'GET /products?___=-price,name',
      q: 'מה משלים את שם ה-query parameter כדי למיין תוצאות (יורד לפי price, ואז לפי name)?',
      o: ['<code>sort</code>', '<code>order</code>', '<code>filter</code>', '<code>sequence</code>'],
      a: 0,
      w: 'הסימן <code>-</code> לפני שם השדה מציין מיון יורד. זו מוסכמה נפוצה מאוד ב-REST APIs לתמיכה במיון גמיש.'
    },
    {
      code: 'GET /___/users',
      q: 'מה משלים את הנתיב כדי לבצע Versioning נפוץ ופשוט דרך ה-URL (גרסה ראשונה)?',
      o: ['<code>v1</code>', '<code>version-one</code>', '<code>api</code>', '<code>latest</code>'],
      a: 0,
      w: 'Versioning ב-URL בפורמט <code>/v1/</code>, <code>/v2/</code> וכו\' הוא הפרקטי והנפוץ ביותר - פשוט לתעד ולבדוק בדפדפן.'
    },
    {
      code: 'curl -X POST https://oauth2.googleapis.com/token \\\n  -d "code=AUTH_CODE" \\\n  -d "grant_type=___"',
      q: 'מה משלים את סוג ה-Grant הנכון בשלב החלפת authorization code בטוקן?',
      o: ['<code>authorization_code</code>', '<code>client_credentials</code>', '<code>refresh_token</code>', '<code>implicit</code>'],
      a: 0,
      w: 'זהו שלב 5 בזרימת Authorization Code של OAuth 2.0 - החלפת הקוד שהתקבל בשלב הקודם ב-access token אמיתי.'
    },
    {
      code: 'const token = jwt.sign(\n  payload,\n  process.env.JWT_SECRET,\n  { ___: "1h" }\n);',
      q: 'מה משלים את האופציה שקובעת שהטוקן יפוג תוקף בעוד שעה?',
      o: ['<code>expiresIn</code>', '<code>ttl</code>', '<code>duration</code>', '<code>maxAge</code>'],
      a: 0,
      w: 'בספריית <code>jsonwebtoken</code> ב-Node.js, <code>expiresIn</code> קובעת את זמן התפוגה של הטוקן - חשוב לשמור אותו קצר יחסית מטעמי אבטחה.'
    },
    {
      code: 'Cache-Control: ___, max-age=3600',
      q: 'מה משלים את ההנחיה כדי לאפשר שמירת התשובה גם ב-caches משותפים (כמו CDN)?',
      o: ['<code>public</code>', '<code>private</code>', '<code>no-store</code>', '<code>no-cache</code>'],
      a: 0,
      w: '<code>public</code> מתיר שמירה גם בשרתי ביניים משותפים כמו CDN. <code>private</code> מגביל את השמירה רק ל-cache של הלקוח הספציפי.'
    },
    {
      code: 'If-None-___: "a1b2c3d4"',
      q: 'מה משלים את שם ה-Header שהלקוח שולח כדי לבדוק אם ה-ETag של המשאב השתנה?',
      o: ['<code>Match</code>', '<code>Modified</code>', '<code>Change</code>', '<code>Version</code>'],
      a: 0,
      w: '<code>If-None-Match</code> משווה את ה-ETag שהלקוח מחזיק מול הגרסה הנוכחית בשרת - אם הם זהים, מוחזר <code>304 Not Modified</code>.'
    },
    {
      code: 'app.use("/v1/", ___({\n  windowMs: 15 * 60 * 1000,\n  max: 100\n}));',
      q: 'מה משלים את קריאת ה-middleware שמגביל את מספר הבקשות ללקוח בחלון זמן נתון?',
      o: ['<code>rateLimit</code>', '<code>cors</code>', '<code>helmet</code>', '<code>bodyParser</code>'],
      a: 0,
      w: 'הדוגמה מבוססת על החבילה הפופולרית <code>express-rate-limit</code> - מגדירים חלון זמן (<code>windowMs</code>) ומספר בקשות מקסימלי (<code>max</code>).'
    },
    {
      code: 'const createUserSchema = z.object({\n  email: z.string().___()\n});',
      q: 'מה משלים את הוולידציה שמוודאת שהשדה <code>email</code> הוא כתובת אימייל תקינה?',
      o: ['<code>email</code>', '<code>isEmail</code>', '<code>validate</code>', '<code>format</code>'],
      a: 0,
      w: 'בספריית <code>zod</code>, השרשור <code>z.string().email()</code> מוודא שהמחרוזת שהתקבלה תואמת פורמט של כתובת אימייל.'
    },
    {
      code: 'securitySchemes:\n  bearerAuth:\n    type: ___\n    scheme: bearer',
      q: 'מה משלים את ה-type הנכון בהגדרת סכימת אימות מסוג Bearer Token ב-OpenAPI?',
      o: ['<code>http</code>', '<code>apiKey</code>', '<code>oauth2</code>', '<code>openIdConnect</code>'],
      a: 0,
      w: 'ב-OpenAPI, סכימות אימות מבוססות Header <code>Authorization</code> (כמו Bearer ו-Basic) מוגדרות תחת <code>type: http</code>, עם <code>scheme</code> שמפרט את סוג הטוקן.'
    }
  ];

  /* ============================================================
     מצב 4 - התאמת מושגים: סבבים של זוגות מונח/מנגנון + תיאור
     ============================================================ */
  var MATCH_ROUNDS = [
    {
      title: 'HTTP Methods',
      pairs: [
        { l: '<code>GET</code>', r: 'קבלת משאב - Safe ואידמפוטנטי' },
        { l: '<code>POST</code>', r: 'יצירת משאב חדש - לא אידמפוטנטי' },
        { l: '<code>PUT</code>', r: 'עדכון מלא של משאב - מחליף את כולו' },
        { l: '<code>PATCH</code>', r: 'עדכון חלקי של משאב' },
        { l: '<code>DELETE</code>', r: 'מחיקת משאב - אידמפוטנטי' }
      ]
    },
    {
      title: 'קודי סטטוס',
      pairs: [
        { l: '<code>201 Created</code>', r: 'משאב חדש נוצר בהצלחה, בעקבות POST' },
        { l: '<code>204 No Content</code>', r: 'הצלחה בלי גוף תשובה, נפוץ אחרי DELETE' },
        { l: '<code>401 Unauthorized</code>', r: 'חסר אימות או אימות שגוי' },
        { l: '<code>403 Forbidden</code>', r: 'מזוהה, אבל אין הרשאה לפעולה' },
        { l: '<code>429 Too Many Requests</code>', r: 'חריגה ממכסת Rate Limit' }
      ]
    },
    {
      title: 'שיטות אימות',
      pairs: [
        { l: 'API Key', r: 'מפתח סטטי ב-Header, מתאים בעיקר ל-Server-to-Server' },
        { l: 'JWT', r: 'טוקן חתום Stateless, מורכב מ-Header.Payload.Signature' },
        { l: 'OAuth 2.0', r: 'תקן לאצילת הרשאות בלי לחשוף סיסמה ("Login with Google")' },
        { l: 'Session/Cookie', r: 'Stateful - השרת שומר את המצב בזיכרון/DB' },
        { l: 'Basic Authentication', r: 'שם משתמש וסיסמה מקודדים ב-Base64, חייב HTTPS' }
      ]
    },
    {
      title: 'תכנון, אבטחה וביצועים',
      pairs: [
        { l: 'Idempotency Key', r: 'מונע יצירת משאב כפול כתוצאה מ-retry על POST' },
        { l: 'BOLA', r: 'משתמש ניגש לנתונים ששייכים למשתמש אחר, בגלל חוסר בדיקת ownership' },
        { l: 'ETag', r: 'טביעת אצבע של המשאב, מאפשרת 304 Not Modified' },
        { l: 'Cursor-based Pagination', r: 'עדיפה על page-based בדאטה גדול ומשתנה' },
        { l: 'Richardson Maturity Model - Level 2', r: 'שימוש נכון ב-HTTP Methods ו-Status Codes' }
      ]
    },
    {
      title: 'GraphQL ותיעוד',
      pairs: [
        { l: 'Query', r: 'פעולת קריאת נתונים ב-GraphQL' },
        { l: 'Mutation', r: 'פעולת שינוי מצב ב-GraphQL, מקבילה ל-POST/PUT/DELETE' },
        { l: 'בעיית N+1', r: 'resolver שולח שאילתה נפרדת לכל פריט ברשימה, נפתר עם DataLoader' },
        { l: 'OpenAPI', r: 'תקן פורמלי לתיאור REST APIs בקובץ YAML/JSON' },
        { l: 'Swagger UI', r: 'מייצר תיעוד אינטראקטיבי מקובץ ה-OpenAPI' }
      ]
    }
  ];

  /* ============================================================
     מצב 5 - סידור תהליך: סבבים של שלבים שצריך לסדר בסדר הנכון
     ============================================================ */
  var ORDER_ROUNDS = [
    {
      title: 'תכנון API מ-Design-First ועד פרסום',
      steps: [
        'הגדרת ה-endpoints והמשאבים הנדרשים',
        'כתיבת קובץ OpenAPI/Swagger מלא (Design-First)',
        'קבלת פידבק מצוותים אחרים ובניית Mock Server',
        'מימוש הקוד בפועל לפי הספציפיקציה',
        'כתיבת בדיקות (Unit/Integration/Contract) מול ה-Schema',
        'פרסום התיעוד האינטראקטיבי (Swagger UI) לצוותים'
      ]
    },
    {
      title: 'זרימת OAuth 2.0 Authorization Code',
      steps: [
        'המשתמש לוחץ "התחבר עם Google" באפליקציה',
        'האפליקציה מפנה את המשתמש לדף ההתחברות של הספק',
        'המשתמש מתחבר ומאשר הרשאות',
        'הספק מפנה חזרה לאפליקציה עם authorization code',
        'האפליקציה (בצד השרת) מחליפה את הקוד ב-access token',
        'האפליקציה משתמשת ב-access token כדי לגשת ל-API בשם המשתמש'
      ]
    },
    {
      title: 'מעבר הדרגתי בין גרסאות API',
      steps: [
        'השקת v2 במקביל ל-v1 הקיימת',
        'סימון v1 כ-Deprecated והוספת Headers Deprecation/Sunset',
        'שליחת הודעה ללקוחות רשומים על המעבר הנדרש',
        'תקופת מעבר של כמה חודשים בה שתי הגרסאות פעילות',
        'ניטור התעבורה שעדיין מגיעה ל-v1',
        'כיבוי v1 כשהתעבורה נמוכה מספיק או שהתאריך המובטח הגיע'
      ]
    },
    {
      title: 'טיפול בבקשת POST עם Idempotency Key',
      steps: [
        'הלקוח מייצר מזהה ייחודי (Idempotency Key)',
        'הלקוח שולח בקשת POST עם Header בשם Idempotency-Key',
        'השרת בודק אם כבר טיפל בבקשה עם אותו מפתח בעבר',
        'אם לא - השרת מבצע את הפעולה ושומר את התוצאה לפי המפתח',
        'אם מגיעה בקשה כפולה עם אותו מפתח (למשל retry) - השרת מחזיר את התוצאה השמורה בלי לפעול שוב'
      ]
    },
    {
      title: 'תגובה לבקשה שנחסמת ע"י Rate Limiting',
      steps: [
        'הלקוח שולח בקשות בקצב שחורג מהמכסה המותרת',
        'השרת מזהה חריגה וכולל Headers כמו X-RateLimit-Remaining: 0',
        'השרת מחזיר 429 Too Many Requests עם Header Retry-After',
        'הלקוח קורא את הזמן שצוין ב-Retry-After וממתין בהתאם',
        'הלקוח שולח מחדש את הבקשה לאחר הזמן שצוין'
      ]
    }
  ];

  /* ============================================================
     הגדרת מצבי המשחק
     ============================================================ */
  var MODES = [
    { key: 'rapid', icon: '⚡', name: 'קרב מהיר', desc: 'שאלות ידע כלליות על API, REST ו-HTTP - כמה תספיקו לפני שהזמן נגמר?', type: 'quiz', data: RAPID, sample: 8, time: 20000 },
    { key: 'analysis', icon: '🔎', name: 'ניתוח בקשה', desc: 'קטע HTTP request/response או קוד - מה יקרה, ומה הבעיה?', type: 'quiz', data: REQUEST_ANALYSIS, sample: 8, time: 28000, showCode: true },
    { key: 'fill', icon: '🧩', name: 'השלמת קוד', desc: 'Endpoint, Header או קטע קוד עם חלק חסר - בחרו מה משלים אותו נכון', type: 'quiz', data: FILL_BLANK, sample: 8, time: 28000, showCode: true },
    { key: 'match', icon: '🔗', name: 'התאמת מושגים', desc: 'התאימו כל מונח/מנגנון API לתיאור הנכון שלו', type: 'match', data: MATCH_ROUNDS, sample: 2 },
    { key: 'order', icon: '📋', name: 'סידור תהליך', desc: 'סדרו את שלבי התהליך לפי הסדר הנכון', type: 'order', data: ORDER_ROUNDS, sample: 2 }
  ];

  window.TG_CONFIG = { gameId: "api", modes: MODES };
})();
</script>

<script src="/scripts/topic-game.js"></script>
