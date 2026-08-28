---
title: "משחק לימודי: אתגר Docker"
category: DevOps/Docker
part: 13/10
description: "משחק אינטראקטיבי ללימוד Docker - חמישה מצבי משחק עם טיימר, לבבות, ניקוד ורצפים: קרב מהיר, ניחוש קוד, השלמת פקודות, התאמת מושגים וסידור workflow."
---

חמישה מצבי משחק שבודקים היבטים שונים של Docker - לא עוד חידון רב-ברירה, אלא משחק עם **טיימר**, **שלושה לבבות**, **מכפיל רצף** ו**שיא אישי** שנשמר בדפדפן. בסוף כל סבב תקבלו דירוג, ורשימת חזרה של בדיוק מה שפספסתם.


<div class="tg" id="tg" dir="rtl">
  <div class="tg-screen is-active" data-screen="menu">
    <div class="tg-hero">
      <div class="tg-hero-badge">Docker</div>
      <div class="tg-hero-title">אתגר Docker</div>
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
      q: 'מה ההבדל העיקרי בין Image ל-Container?',
      o: ['Image הוא תבנית read-only; Container הוא מופע רץ שלה', 'אין הבדל, אלו כינויים לאותו דבר', 'Container הוא תבנית; Image הוא מופע רץ', 'Image רץ רק בענן, Container רק מקומית'],
      a: 0,
      w: 'Image הוא "מתכון" קריא בלבד לבניית קונטיינר. Container הוא מופע רץ בפועל של Image, עם שכבת כתיבה (writable layer) משלו מעליו.'
    },
    {
      q: 'איזו הוראת Dockerfile חייבת (כמעט תמיד) להיות הראשונה בקובץ?',
      o: ['<code>FROM</code>', '<code>RUN</code>', '<code>CMD</code>', '<code>COPY</code>'],
      a: 0,
      w: '<code>FROM</code> קובעת את ה-image הבסיסי שעליו נבנות כל שאר ההוראות. אפשר להקדים לה רק <code>ARG</code> לצורך פרמטרים שמשמשים את ה-FROM עצמה.'
    },
    {
      q: 'מה ההבדל בין Volume ל-Bind Mount?',
      o: ['Volume מנוהל לגמרי על ידי Docker (תחת <code>/var/lib/docker/volumes</code>); Bind Mount מצביע לנתיב שרירותי במארח', 'אין הבדל מעשי בין השניים', 'Bind Mount עובד רק ב-Windows', 'Volume נמחק אוטומטית עם הקונטיינר תמיד'],
      a: 0,
      w: 'Volume הוא מנגנון האחסון המומלץ - Docker מנהל אותו במלואו ואפשר לגבות/להעביר בקלות. Bind Mount ממפה תיקייה קיימת במארח (שימושי לפיתוח, פחות מבודד ומומלץ לפרודקשן).'
    },
    {
      q: 'מה עושה <code>docker-compose.yml</code> בבסיסו?',
      o: ['מגדיר ומריץ אפליקציה מרובת-קונטיינרים דרך קובץ YAML אחד', 'בונה image בודד בלבד', 'מחליף לגמרי את Docker Engine', 'מריץ קונטיינרים רק במצב interactive'],
      a: 0,
      w: 'Docker Compose מאפשר להגדיר כמה שירותים (services), הרשתות והנפחים שלהם בקובץ YAML אחד ולהרים את כולם יחד עם <code>docker compose up</code>.'
    },
    {
      q: 'מהו ברירת המחדל של Networking Mode כשמריצים קונטיינר עם <code>docker run</code> בלי דגלים?',
      o: ['<code>bridge</code>', '<code>host</code>', '<code>none</code>', '<code>overlay</code>'],
      a: 0,
      w: 'ברירת המחדל היא רשת <code>bridge</code> - כל קונטיינר מקבל כתובת IP פנימית ברשת מבודדת, ומתקשר עם המארח דרך NAT ומיפוי פורטים (<code>-p</code>).'
    },
    {
      q: 'מה עושה Layer Caching בבנייה של Docker?',
      o: ['Docker משתמש מחדש בשכבות שלא השתנו, כדי לזרז build חוזר', 'Docker שומר גיבוי מלא של כל הקונטיינרים', 'זהו מנגנון דחיסה של images בלבד', 'זה מונע מ-Docker לבנות images בכלל'],
      a: 0,
      w: 'כל הוראה ב-Dockerfile יוצרת שכבה. אם שכבה (וההקשר שמוביל אליה) לא השתנתה, Docker משתמש בעותק שנשמר ב-cache במקום להריץ אותה מחדש - ולכן סדר ההוראות משפיע ישירות על מהירות ה-build.'
    },
    {
      q: 'מה ההבדל בין <code>docker stop</code> ל-<code>docker kill</code>?',
      o: ['<code>stop</code> שולח SIGTERM ומחכה לכיבוי מסודר לפני SIGKILL; <code>kill</code> שולח SIGKILL מיידית', 'אין הבדל, שתיהן זהות', '<code>kill</code> מוחק גם את ה-image', '<code>stop</code> עובד רק על קונטיינרים שרצים ברקע'],
      a: 0,
      w: '<code>docker stop</code> נותן לתהליך הזדמנות להיסגר בצורה מסודרת (ברירת מחדל 10 שניות) לפני שהוא כופה SIGKILL. <code>docker kill</code> מסיים את התהליך מיידית בלי חסד.'
    },
    {
      q: 'מה עושה <code>docker exec -it &lt;container&gt; bash</code>?',
      o: ['פותח shell אינטראקטיבי בתוך קונטיינר שכבר רץ', 'יוצר קונטיינר חדש מ-image בסיס bash', 'עוצר את הקונטיינר ופותח לוג', 'בונה image חדש עם bash מותקן'],
      a: 0,
      w: '<code>-i</code> (interactive) ו-<code>-t</code> (pseudo-TTY) יחד מאפשרים session terminal אינטראקטיבי בתוך קונטיינר קיים - שימושי לדיבוג בלי לעצור את הקונטיינר.'
    },
    {
      q: 'מהי המטרה העיקרית של Multi-stage Build?',
      o: ['להקטין את גודל ה-image הסופי על ידי הפרדת שלב הבנייה משלב ההרצה', 'להריץ כמה קונטיינרים במקביל', 'לאפשר בנייה על כמה שרתים בו-זמנית', 'להוסיף שכבות אבטחה נוספות אוטומטית'],
      a: 0,
      w: 'ב-multi-stage מגדירים כמה שלבי <code>FROM</code>, כשרק הקבצים שמעתיקים במפורש עם <code>COPY --from=</code> עוברים ל-image הסופי - כלי build, קוד מקור ותלויות פיתוח נשארים מאחור.'
    },
    {
      q: 'מה עושה <code>docker system prune</code>?',
      o: ['מנקה containers שהופסקו, networks לא בשימוש, images יתומים ו-build cache', 'מוחק את Docker Engine כולו', 'עוצר את כל הקונטיינרים הרצים', 'מוחק volumes תמיד, גם אם הם בשימוש'],
      a: 0,
      w: 'פקודת ניקוי כללית שמפנה מקום דיסק. חשוב: היא לא מוחקת volumes כברירת מחדל - לשם כך צריך להוסיף במפורש את הדגל <code>--volumes</code>.'
    },
    {
      q: 'מה ההבדל בין <code>CMD</code> ל-<code>ENTRYPOINT</code> ב-Dockerfile?',
      o: ['<code>CMD</code> ניתן לדריסה מלאה בזמן <code>docker run</code>; <code>ENTRYPOINT</code> קבוע (אלא אם דורסים במפורש)', 'הן פקודות זהות לחלוטין', '<code>ENTRYPOINT</code> רץ רק בזמן build, <code>CMD</code> רק בזמן run', 'אפשר להגדיר רק אחת מהן בקובץ אחד'],
      a: 0,
      w: 'כשמשלבים את שתיהן, <code>ENTRYPOINT</code> הוא הפקודה הקבועה ו-<code>CMD</code> מספק ארגומנטים ברירת מחדל שאפשר להחליף בשורת הפקודה של <code>docker run</code>.'
    },
    {
      q: 'למה בדרך כלל עדיף image בסיס מבוסס <code>alpine</code>?',
      o: ['הוא קטן משמעותית בגודלו, מה שמקטין את ה-image הסופי ומאיץ pull/push', 'הוא היחיד שתומך ב-Docker Compose', 'הוא היחיד שתומך ב-multi-stage build', 'הוא מריץ קונטיינרים מהר יותר תמיד ללא קשר לגודל'],
      a: 0,
      w: 'Alpine מבוסס musl libc וכולל רק את המינימום ההכרחי - image בגודל מגה-בייטים בודדים במקום עשרות/מאות מגה-בייט של distro מלא כמו Ubuntu.'
    },
    {
      q: 'מה עושה קובץ <code>.dockerignore</code>?',
      o: ['מונע מקבצים/תיקיות להיכנס להקשר הבנייה (build context) שנשלח ל-Docker daemon', 'מונע מ-Docker להתעלם מהוראות מסוימות ב-Dockerfile', 'רשימת images שאסור להשתמש בהם', 'קובץ קונפיגורציה של Docker Compose'],
      a: 0,
      w: 'בדומה ל-<code>.gitignore</code>, מונע העתקת <code>node_modules</code>, <code>.git</code>, סודות וכו\' לתוך ה-build context - חוסך זמן בנייה ומונע דליפת מידע רגיש ל-image.'
    },
    {
      q: 'מה תפקידו של Docker Registry (כמו Docker Hub)?',
      o: ['אחסון והפצה של Images, כולל push/pull ביניהם למחשבים אחרים', 'הרצת קונטיינרים בענן במקום מקומית', 'ניהול networking בין קונטיינרים', 'תחליף מלא ל-Docker Compose'],
      a: 0,
      w: 'Registry הוא שרת שמאחסן Images בגרסאות (tags) שונות. Docker Hub הוא Registry ציבורי; ארגונים רבים מריצים גם Registry פרטי (למשל ECR, GCR, Harbor) לצרכי אבטחה ובקרה.'
    },
    {
      q: 'מה עושה הדגל <code>-d</code> בפקודת <code>docker run -d</code>?',
      o: ['מריץ את הקונטיינר ברקע (detached mode), בלי לתפוס את הטרמינל', 'מוחק את הקונטיינר מיד אחרי סיום', 'מריץ את הקונטיינר במצב debug', 'מוריד image חדש מה-registry'],
      a: 0,
      w: 'בלי <code>-d</code> הקונטיינר רץ בחזית (foreground) ותופס את הטרמינל. עם <code>-d</code> הוא רץ ברקע ומחזיר מיד את שליטת השורת פקודה, שימושי לשירותים ארוכי-טווח.'
    },
    {
      q: 'למה חשוב להגדיר <code>USER</code> לא-root ב-Dockerfile?',
      o: ['מפחית סיכון אבטחה - אם תוקף פורץ לתהליך בתוך הקונטיינר, הוא לא מקבל הרשאות root', 'זה חובה כדי שהקונטיינר יעלה בכלל', 'זה משפר ביצועים משמעותית', 'זה היחיד שמאפשר networking'],
      a: 0,
      w: 'כברירת מחדל קונטיינרים רצים כ-root, מה שמגדיל את משטח התקיפה (בעיקר אם יש container escape). הגדרת <code>USER</code> לא-privileged היא Best Practice בסיסי לאבטחת קונטיינרים.'
    }
  ];

  /* ============================================================
     מצב 2 - ניחוש קוד: קטע Dockerfile/docker-compose.yml + מה קורה בבנייה/ריצה
     ============================================================ */
  var STATUS_GUESS = [
    {
      code: 'FROM node:20-alpine\nWORKDIR /app\nCOPY . .\nRUN npm install\nCMD ["node", "server.js"]',
      q: 'מה הבעיה העיקרית בסדר ההוראות הזה מבחינת Layer Caching?',
      o: ['<code>COPY . .</code> לפני <code>npm install</code> גורם להתקנה מחדש של כל התלויות בכל שינוי קוד, גם הקטן ביותר', 'אין בעיה, הסדר לא משנה בכלל', 'חסר <code>EXPOSE</code> ולכן הבנייה תיכשל', '<code>WORKDIR</code> חייב להיות אחרי <code>COPY</code>'],
      a: 0,
      w: 'כל שינוי בקבצי הקוד משנה את השכבה שיוצר <code>COPY . .</code>, ומבטל את ה-cache של כל השכבות שאחריו - כולל <code>npm install</code>. הסדר הנכון: להעתיק קודם <code>package.json</code>, להתקין, ורק אז להעתיק את שאר הקוד.'
    },
    {
      code: 'FROM golang:1.22 AS builder\nWORKDIR /src\nCOPY . .\nRUN go build -o /app\n\nFROM alpine:3.19\nCOPY --from=builder /app /app\nENTRYPOINT ["/app"]',
      q: 'האם image הבסיס <code>golang:1.22</code> (עם כל כלי הפיתוח) יהיה חלק מה-image הסופי שנוצר כאן?',
      a: 0,
      o: ['לא - זהו multi-stage build; רק הקובץ שהועתק במפורש עם <code>COPY --from=builder</code> מגיע ל-image הסופי המבוסס alpine', 'כן - כל שכבות ה-golang image נשארות ב-image הסופי', 'רק אם לא מוחקים אותו ידנית בסוף', 'זה תלוי בגודל האפליקציה שנבנתה'],
      w: 'ה-image הסופי בנוי מהשלב האחרון בלבד (<code>FROM alpine:3.19</code>). שלב ה-builder עם כל סביבת Go המלאה (מאות MB) נזרק לגמרי - רק הבינארי הקומפל שהועתק במפורש נשאר.'
    },
    {
      code: 'FROM nginx:alpine\nEXPOSE 8080\n\n$ docker run -d nginx-custom',
      q: 'האם <code>EXPOSE 8080</code> ב-Dockerfile מספיק כדי לגשת לקונטיינר מהמארח בפורט 8080?',
      o: ['לא - <code>EXPOSE</code> הוא תיעוד בלבד; צריך גם <code>-p 8080:8080</code> בזמן <code>docker run</code> כדי למפות בפועל', 'כן, זה פותח את הפורט אוטומטית תמיד', 'רק אם מריצים עם <code>--network host</code>', 'רק אם ה-image מבוסס alpine'],
      a: 0,
      w: '<code>EXPOSE</code> משמש בעיקר לתיעוד (ולתקשורת בין קונטיינרים באותה רשת). כדי לפתוח גישה מהמארח חייבים למפות פורט מפורשות עם הדגל <code>-p</code> (או <code>--publish</code>) ב-<code>docker run</code>.'
    },
    {
      code: 'services:\n  web:\n    build: .\n    depends_on:\n      - db\n  db:\n    image: postgres:16',
      q: 'האם <code>depends_on</code> כאן מבטיח ש-PostgreSQL כבר מוכן לקבל חיבורים לפני ש-web עולה?',
      o: ['לא - הוא רק מבטיח שהקונטיינר db התחיל לרוץ, לא שהשירות בתוכו מוכן; צריך healthcheck + condition: service_healthy', 'כן, זו בדיוק המטרה של depends_on בברירת מחדל', 'לא רלוונטי - depends_on משפיע רק על סדר המחיקה', 'כן, אבל רק בגרסת Compose 1'],
      a: 0,
      w: 'depends_on הבסיסי בודק רק שהקונטיינר "רץ", לא שהאפליקציה שבתוכו סיימה אתחול. פתרון: להוסיף <code>healthcheck</code> ל-db ולהשתמש ב-<code>depends_on: db: condition: service_healthy</code>.'
    },
    {
      code: '$ docker build -t myapp:1.0 .\n$ docker build -t myapp:1.0 .\n(ללא שינוי בקבצים בין שתי ההרצות)',
      q: 'מה יקרה בהרצה השנייה של אותה פקודת build, כשכלום לא השתנה?',
      o: ['Docker ישתמש ב-cache עבור כל השכבות ויסיים כמעט מיידית', 'Docker יסרב לבנות שוב image עם אותו tag', 'הבנייה תיכשל כי ה-tag כבר קיים', 'Docker ימחק את ה-image הישן ויבנה זהה מאפס תמיד'],
      a: 0,
      w: 'ללא שינוי בהקשר הבנייה או בהוראות, ה-checksum של כל שכבה זהה ל-build הקודם - Docker משתמש ב-cache לכל שכבה ומדלג על ריצה מחדש, כמעט ללא זמן המתנה.'
    },
    {
      code: 'FROM node:20-alpine\nWORKDIR /app\nVOLUME /app/data\nCMD ["node", "server.js"]\n\n$ docker run --rm myapp',
      q: 'הקונטיינר כתב קבצים ל-<code>/app/data</code> ואז יצא (עם <code>--rm</code>). מה קורה לנתונים שנכתבו שם?',
      o: ['ה-volume האנונימי שנוצר אוטומטית נשאר קיים ב-Docker גם אחרי מחיקת הקונטיינר (אלא אם מנקים אותו ידנית)', 'הנתונים נמחקים מיד יחד עם הקונטיינר', 'הנתונים נשמרים בתוך ה-image המקורי', 'לא ניתן לכתוב לנתיב שמוגדר כ-VOLUME'],
      a: 0,
      w: 'הוראת <code>VOLUME</code> ב-Dockerfile יוצרת volume אנונימי אם לא צוין אחד מפורשות. <code>--rm</code> מוחק את הקונטיינר עצמו, אך ה-volume עצמו (עם המידע) נשאר קיים במערכת עד שינוקה ידנית - ולכן חשוב להשתמש ב-volume בעל שם לניהול מסודר.'
    },
    {
      code: 'FROM ubuntu:22.04\nRUN apt-get update\nRUN apt-get install -y curl\nRUN apt-get install -y vim\nRUN rm -rf /var/lib/apt/lists/*',
      q: 'האם ההוראה האחרונה (<code>rm -rf /var/lib/apt/lists/*</code>) בשכבה נפרדת אכן מקטינה את גודל ה-image הסופי?',
      o: ['לא באמת - כל שכבה קודמת נשמרת בהיסטוריית ה-image, כך שהקבצים שנמחקו עדיין תופסים מקום בשכבות הקודמות', 'כן, זה מקטין את הגודל הכולל תמיד', 'רק אם משתמשים ב-alpine כ-image בסיס', 'זה משפיע רק על זמן הבנייה, לא על הגודל'],
      a: 0,
      w: 'שכבות Docker הן immutable ומצטברות - מחיקת קבצים בשכבה חדשה רק "מסתירה" אותם מתצוגת ה-filesystem הסופי, אבל הם עדיין תופסים מקום בשכבות הקודמות בהיסטוריה. כדי לחסוך מקום בפועל צריך לצרף את ההתקנה והניקוי לאותה פקודת <code>RUN</code> (עם <code>&amp;&amp;</code>).'
    },
    {
      code: 'services:\n  app:\n    build: .\n    networks:\n      - net1\n  cache:\n    image: redis:7\n    networks:\n      - net2\nnetworks:\n  net1:\n  net2:',
      q: 'האם השירות <code>app</code> יכול לתקשר ישירות עם <code>cache</code> לפי ההגדרה הזו?',
      o: ['לא - הם על רשתות Compose נפרדות (net1 ו-net2) שלא חולקות ביניהן, אז אין קישוריות ביניהם כברירת מחדל', 'כן, כל שירותי Compose מתקשרים אוטומטית ללא תלות ברשתות', 'רק אם שניהם מריצים על אותו host port', 'רק אם יש depends_on ביניהם'],
      a: 0,
      w: 'Docker Compose מבודד שירותים לפי הרשתות שהוגדרו להם. כדי ש-app ו-cache יתקשרו, שניהם צריכים לחלוק לפחות רשת אחת משותפת (למשל להוסיף את שניהם ל-net1).'
    },
    {
      code: 'docker run -d -p 3000:3000 --name web myapp\ndocker run -d -p 3000:3000 --name web2 myapp',
      q: 'מה יקרה כשמריצים את הפקודה השנייה בזמן שהראשונה עדיין רצה?',
      o: ['שגיאה - פורט 3000 במארח כבר תפוס על ידי הקונטיינר הראשון', 'שני הקונטיינרים ירוצו במקביל על אותו פורט בהצלחה', 'הקונטיינר הראשון ייעצר אוטומטית', 'Docker ימפה אוטומטית לפורט פנוי אחר'],
      a: 0,
      w: 'לא ניתן למפות שני קונטיינרים לאותו פורט במארח בו-זמנית - תתקבל שגיאת "port is already allocated". הפתרון: למפות לפורטים שונים במארח, למשל <code>-p 3001:3000</code>.'
    },
    {
      code: 'FROM python:3.12-slim\nWORKDIR /app\nCOPY requirements.txt .\nRUN pip install -r requirements.txt\nCOPY . .\nCMD ["python", "app.py"]\n\n(שינוי קטן בקובץ app.py, requirements.txt לא השתנה)',
      q: 'בבנייה חוזרת אחרי שינוי ב-<code>app.py</code> בלבד, אילו שכבות ישתמשו ב-cache?',
      o: ['כל השכבות עד ואחרי <code>COPY requirements.txt .</code> ו-<code>pip install</code> ישתמשו ב-cache; רק <code>COPY . .</code> ומה שאחריה ירוצו מחדש', 'שום שכבה לא תשתמש ב-cache', 'כל השכבות ירוצו מחדש כולל pip install', 'רק שכבת ה-FROM תשתמש ב-cache'],
      a: 0,
      w: 'זה בדיוק היתרון של הפרדת <code>COPY requirements.txt</code> מ-<code>COPY . .</code>: מכיוון ש-requirements.txt לא השתנה, Docker משתמש ב-cache של ההתקנה, וריצה מחדש קורית רק החל מהשכבה שבה app.py משתנה.'
    },
    {
      code: 'docker compose down\n(ללא -v)',
      q: 'האם <code>docker compose down</code> ללא הדגל <code>-v</code> מוחק גם volumes בעלי שם שהוגדרו ב-<code>docker-compose.yml</code>?',
      o: ['לא - volumes בעלי שם נשארים; רק קונטיינרים ורשתות שנוצרו על ידי Compose נמחקים', 'כן, כל volume נמחק תמיד', 'זה תלוי בגרסת Compose בלבד', 'זה מוחק רק volumes אנונימיים אבל לא containers'],
      a: 0,
      w: '<code>down</code> עוצר ומוחק קונטיינרים ורשתות. volumes נשמרים כברירת מחדל כדי לא לאבד נתונים בטעות - צריך להוסיף במפורש <code>-v</code> כדי למחוק גם אותם.'
    },
    {
      code: 'FROM node:20\nCOPY . .\nRUN npm install\nUSER node\nRUN npm run build\nCMD ["node", "dist/server.js"]',
      q: 'מה עלולה להיות הבעיה בסדר ההוראות הזה סביב <code>USER node</code>?',
      o: ['אם למשתמש <code>node</code> אין הרשאות כתיבה לקבצים שנוצרו קודם על ידי root (למשל תוצרי build), פקודת <code>npm run build</code> עלולה להיכשל עם שגיאת הרשאות', 'אין שום בעיה, הכל תקין', '<code>USER</code> חייב תמיד להיות ההוראה הראשונה בקובץ', '<code>CMD</code> לא יכול לבוא אחרי <code>USER</code>'],
      a: 0,
      w: 'כל הפעולות שקרו לפני <code>USER node</code> (כולל <code>COPY</code> ו-<code>npm install</code>) בוצעו כ-root. אם <code>npm run build</code> אחרי מעבר למשתמש הלא-פריבילגי צריך לכתוב לקבצים/תיקיות שבבעלות root, תתקבל שגיאת הרשאות - צריך לוודא בעלות נכונה (<code>chown</code>) לפני מעבר המשתמש.'
    }
  ];

  /* ============================================================
     מצב 3 - השלמת פקודה: Dockerfile/docker CLI עם חלק חסר
     ============================================================ */
  var CMD_COMPLETE = [
    {
      code: '$ docker ___ -t myapp:1.0 .',
      q: 'מה משלים את הפקודה לבניית image חדש מ-Dockerfile בתיקייה הנוכחית?',
      o: ['<code>build</code>', '<code>run</code>', '<code>create</code>', '<code>compose</code>'],
      a: 0,
      w: '<code>docker build -t &lt;name&gt;:&lt;tag&gt; &lt;context&gt;</code> קורא ל-Dockerfile בתיקיית ה-context (כאן <code>.</code>) ובונה ממנו image חדש.'
    },
    {
      code: '$ docker run ___ 8080:80 nginx',
      q: 'מה משלים את הפקודה כדי למפות פורט 8080 במארח לפורט 80 בקונטיינר?',
      o: ['<code>-p</code>', '<code>-e</code>', '<code>-v</code>', '<code>-P</code>'],
      a: 0,
      w: '<code>-p host:container</code> (או <code>--publish</code>) יוצר מיפוי פורט מפורש. הדגל <code>-P</code> (גדול) שונה - הוא ממפה כל הפורטים ש-EXPOSE הגדיר, לפורטים אקראיים.'
    },
    {
      code: '$ docker run -d -v my-data:___ postgres:16',
      q: 'מה משלים את הפקודה כדי לחבר volume בשם my-data לתיקיית הנתונים של Postgres בתוך הקונטיינר?',
      o: ['<code>/var/lib/postgresql/data</code>', '<code>/data</code>', '<code>/</code>', '<code>./data</code>'],
      a: 0,
      w: 'בתחביר <code>-v source:target</code>, ה-target הוא הנתיב בתוך הקונטיינר. עבור image הרשמי של Postgres, נתיב אחסון הנתונים הוא <code>/var/lib/postgresql/data</code>.'
    },
    {
      code: 'FROM node:20-alpine AS build\nWORKDIR /app\nRUN npm run build\n\nFROM nginx:alpine\n___ /app/dist /usr/share/nginx/html',
      q: 'מה משלים את ההוראה כדי להעתיק את תוצר הבנייה משלב build לשלב הסופי?',
      o: ['<code>COPY --from=build</code>', '<code>COPY --to=build</code>', '<code>RUN --from=build</code>', '<code>ADD --stage=build</code>'],
      a: 0,
      w: '<code>COPY --from=&lt;stage-name&gt;</code> היא התחביר הייעודי להעתקת קבצים משלב build מוקדם אל שלב מאוחר יותר ב-multi-stage build.'
    },
    {
      code: '$ docker ___ -f docker-compose.yml -f docker-compose.prod.yml up -d',
      q: 'איזו פקודה משלבת כמה קבצי Compose ומריצה אותם יחד?',
      o: ['<code>compose</code>', '<code>run</code>', '<code>build</code>', '<code>stack</code>'],
      a: 0,
      w: '<code>docker compose -f file1 -f file2 up -d</code> ממזג את הקבצים לפי הסדר שצוין (הקובץ המאוחר יכול לדרוס ערכים מהקובץ הקודם) - שימושי להפרדת dev/prod.'
    },
    {
      code: '$ docker build --___ -t myapp:1.0 .',
      q: 'מה משלים את הפקודה כדי לבנות מחדש בלי להשתמש בשום cache קיים?',
      o: ['<code>no-cache</code>', '<code>force</code>', '<code>fresh</code>', '<code>clean</code>'],
      a: 0,
      w: '<code>--no-cache</code> מכריח בנייה מלאה מאפס של כל השכבות, שימושי לדיבוג בעיות cache חשודות או לוודא שה-image לגמרי עדכני.'
    },
    {
      code: '$ docker exec ___ mycontainer bash',
      q: 'מה משלים את הפקודה כדי לפתוח shell אינטראקטיבי בתוך קונטיינר רץ?',
      o: ['<code>-it</code>', '<code>-d</code>', '<code>-p</code>', '<code>-v</code>'],
      a: 0,
      w: '<code>-i</code> משאיר את stdin פתוח ו-<code>-t</code> מקצה pseudo-TTY - יחד הם מאפשרים session terminal אינטראקטיבי ונוח לעבודה.'
    },
    {
      code: 'FROM golang:1.22 ___ builder\nWORKDIR /src',
      q: 'מה משלים את ההוראה כדי לתת שם לשלב הזה לצורך שימוש עתידי ב-multi-stage build?',
      o: ['<code>AS</code>', '<code>NAME</code>', '<code>STAGE</code>', '<code>LABEL</code>'],
      a: 0,
      w: '<code>FROM &lt;image&gt; AS &lt;name&gt;</code> נותן כינוי לשלב, שאפשר להפנות אליו מאוחר יותר עם <code>COPY --from=&lt;name&gt;</code>.'
    },
    {
      code: '$ docker network ___ my-net',
      q: 'מה משלים את הפקודה כדי ליצור רשת Docker חדשה בשם my-net?',
      o: ['<code>create</code>', '<code>new</code>', '<code>add</code>', '<code>init</code>'],
      a: 0,
      w: '<code>docker network create my-net</code> יוצרת רשת חדשה (ברירת מחדל: bridge driver) שאפשר לחבר אליה קונטיינרים עם <code>--network my-net</code>.'
    },
    {
      code: 'services:\n  web:\n    build: .\n    ___:\n      - db\nservices:\n  db:\n    image: postgres:16',
      q: 'מה משלים בקובץ docker-compose.yml כדי לקבוע שהשירות web עולה אחרי db?',
      o: ['<code>depends_on</code>', '<code>links</code>', '<code>requires</code>', '<code>after</code>'],
      a: 0,
      w: '<code>depends_on</code> קובע סדר עלייה בין שירותים. לבדיקת מוכנות אמיתית (לא רק שהקונטיינר רץ) יש לשלב <code>condition: service_healthy</code> עם healthcheck.'
    },
    {
      code: '$ docker run --rm -it -v $(pwd):___  node:20 bash',
      q: 'מה משלים את הפקודה כדי לחבר את התיקייה הנוכחית במארח לנתיב <code>/app</code> בתוך הקונטיינר?',
      o: ['<code>/app</code>', '<code>.</code>', '<code>./app</code>', '<code>~/app</code>'],
      a: 0,
      w: 'בתחביר <code>-v host_path:container_path</code>, החלק אחרי הנקודתיים הוא הנתיב בתוך הקונטיינר. <code>$(pwd):/app</code> יוצר bind mount שממפה את התיקייה הנוכחית לנתיב <code>/app</code> בתוך הקונטיינר.'
    },
    {
      code: 'HEALTHCHECK --interval=30s --timeout=3s --retries=3 \\\n  ___ curl -f http://localhost:3000/health || exit 1',
      q: 'מה משלים את הוראת ה-HEALTHCHECK, שמציין את סוג הבדיקה שיש להריץ?',
      o: ['<code>CMD</code>', '<code>RUN</code>', '<code>TEST</code>', '<code>CHECK</code>'],
      a: 0,
      w: '<code>HEALTHCHECK ... CMD &lt;command&gt;</code> מגדיר את הפקודה שתרוץ מחזורית בתוך הקונטיינר כדי לקבוע אם הוא "בריא" - שימושי מאוד בשילוב עם <code>depends_on: condition: service_healthy</code> ב-Compose.'
    }
  ];

  /* ============================================================
     מצב 4 - התאמת מושגים: סבבים של זוגות מושג/מונח + תיאור
     ============================================================ */
  var MATCH_ROUNDS = [
    {
      title: 'מושגי יסוד',
      pairs: [
        { l: 'Image', r: 'תבנית read-only שמכילה אפליקציה, תלויות והגדרות' },
        { l: 'Container', r: 'מופע רץ של Image, עם שכבת כתיבה משלו' },
        { l: 'Dockerfile', r: 'קובץ טקסט עם הוראות איך לבנות Image' },
        { l: 'Docker Engine', r: 'השירות (daemon) שבונה Images ומריץ Containers' },
        { l: 'Registry', r: 'שרת שמאחסן ומפיץ Images (למשל Docker Hub)' }
      ]
    },
    {
      title: 'הוראות Dockerfile',
      pairs: [
        { l: '<code>FROM</code>', r: 'קובעת את ה-image הבסיסי לבנייה' },
        { l: '<code>COPY</code>', r: 'מעתיקה קבצים מהמארח אל תוך ה-image' },
        { l: '<code>RUN</code>', r: 'מריצה פקודה בזמן הבנייה ויוצרת שכבה חדשה' },
        { l: '<code>CMD</code>', r: 'פקודת ברירת מחדל שאפשר לדרוס בזמן ריצה' },
        { l: '<code>EXPOSE</code>', r: 'מתעדת איזה פורט הקונטיינר מאזין עליו' }
      ]
    },
    {
      title: 'אחסון ורשת',
      pairs: [
        { l: 'Volume', r: 'אחסון קבוע מנוהל לחלוטין על ידי Docker' },
        { l: 'Bind Mount', r: 'חיבור לנתיב שרירותי קיים במערכת המארח' },
        { l: 'Bridge Network', r: 'רשת ברירת המחדל המבודדת שבה קונטיינרים מקבלים IP פנימי' },
        { l: 'Host Network', r: 'הקונטיינר משתמש ישירות במחסנית הרשת של המארח, בלי בידוד' },
        { l: '<code>-p 8080:80</code>', r: 'מיפוי פורט 8080 במארח לפורט 80 בקונטיינר' }
      ]
    },
    {
      title: 'Docker Compose ותפעול',
      pairs: [
        { l: '<code>docker compose up -d</code>', r: 'מרימה את כל השירותים המוגדרים ב-YAML, ברקע' },
        { l: '<code>docker compose down</code>', r: 'עוצרת ומוחקת קונטיינרים ורשתות (לא volumes כברירת מחדל)' },
        { l: 'depends_on + healthcheck', r: 'ממתין ששירות באמת מוכן, לא רק שהקונטיינר רץ' },
        { l: '<code>docker logs -f</code>', r: 'מציגה לוגים של קונטיינר בזמן אמת' },
        { l: '<code>docker system prune</code>', r: 'מנקה resources לא בשימוש (containers, images, networks)' }
      ]
    }
  ];

  /* ============================================================
     מצב 5 - סידור Workflow: סבבים של שלבים שצריך לסדר בסדר הנכון
     ============================================================ */
  var ORDER_ROUNDS = [
    {
      title: 'בנייה והרצה בסיסית מ-Dockerfile',
      steps: [
        'כתיבת Dockerfile עם הוראות FROM, COPY, RUN ו-CMD',
        'הרצת docker build -t myapp:1.0 . לבניית ה-image',
        'הרצת docker images לוודא שה-image נוצר בהצלחה',
        'הרצת docker run -d -p 3000:3000 myapp:1.0 להפעלת קונטיינר',
        'הרצת docker ps לוודא שהקונטיינר רץ ובריא'
      ]
    },
    {
      title: 'Multi-stage build ל-production ועד push ל-Registry',
      steps: [
        'כתיבת Dockerfile עם שלב builder (FROM ... AS builder) שמריץ build',
        'הוספת שלב סופי מבוסס image קליל (למשל alpine) עם COPY --from=builder',
        'הרצת docker build -t myapp:1.0 . לבניית ה-image הרזה',
        'תיוג ה-image לרישום המרוחק עם docker tag myapp:1.0 registry.example.com/myapp:1.0',
        'התחברות לרישום עם docker login',
        'דחיפת ה-image עם docker push registry.example.com/myapp:1.0'
      ]
    },
    {
      title: 'הרמת סטאק מלא עם Docker Compose',
      steps: [
        'כתיבת docker-compose.yml עם שירותי web, db ו-networks/volumes',
        'הוספת healthcheck לשירות db כדי לזהות מוכנות אמיתית',
        'הרצת docker compose config לאימות תקינות ה-YAML',
        'הרצת docker compose up -d --build להרמת כל הסטאק',
        'הרצת docker compose logs -f לצפייה בלוגים ואימות עלייה תקינה',
        'הרצת docker compose down -v לניקוי מלא בסיום העבודה'
      ]
    },
    {
      title: 'דיבוג קונטיינר שלא עולה כמצופה',
      steps: [
        'הרצת docker ps -a לזיהוי שהקונטיינר יצא (Exited) ולא רץ',
        'הרצת docker logs &lt;container&gt; לבדיקת פלט השגיאה האחרון',
        'הרצת docker inspect &lt;container&gt; לבדיקת קונפיגורציה מלאה (env, mounts, network)',
        'הרצת docker run -it --entrypoint bash &lt;image&gt; לפתיחת shell לצורך חקירה ידנית',
        'תיקון הבעיה (בקוד, ב-Dockerfile או בקונפיגורציה) ובנייה מחדש עם docker build'
      ]
    }
  ];

  /* ============================================================
     הגדרת מצבי המשחק
     ============================================================ */
  var MODES = [
    { key: 'rapid', icon: '⚡', name: 'קרב מהיר', desc: 'שאלות ידע כלליות על Docker - כמה תספיקו לפני שהזמן נגמר?', type: 'quiz', data: RAPID, sample: 8, time: 20000 },
    { key: 'status', icon: '🔎', name: 'ניחוש קוד', desc: 'קטע Dockerfile או docker-compose.yml - מה בדיוק יקרה בבנייה או בריצה?', type: 'quiz', data: STATUS_GUESS, sample: 8, time: 28000, showCode: true },
    { key: 'cmd', icon: '🧩', name: 'השלמת פקודה', desc: 'פקודת Docker CLI או הוראת Dockerfile עם חלק חסר - בחרו מה משלים אותה נכון', type: 'quiz', data: CMD_COMPLETE, sample: 8, time: 28000, showCode: true },
    { key: 'match', icon: '🔗', name: 'התאמת מושגים', desc: 'התאימו כל מונח/פקודת Docker לתיאור הנכון שלו', type: 'match', data: MATCH_ROUNDS, sample: 2 },
    { key: 'order', icon: '📋', name: 'סידור Workflow', desc: 'סדרו את שלבי התהליך לפי הסדר הנכון', type: 'order', data: ORDER_ROUNDS, sample: 2 }
  ];

  window.TG_CONFIG = { gameId: "docker", modes: MODES };
})();
</script>

<script src="/scripts/topic-game.js"></script>
