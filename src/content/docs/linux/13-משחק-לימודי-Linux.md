---
sidebar_position: 13
title: "מדריך 13: משחק לימודי - אתגר Linux"
description: "משחק לימודי אינטראקטיבי עם 5 מצבים - קרב מהיר, ניחוש פלט, השלמת פקודה, התאמת מושגים וסידור תהליכים - עם טיימר, לבבות, מכפיל רצף ושיא אישי."
---

חמישה מצבי משחק שבודקים היבטים שונים של עבודה עם לינוקס - לא עוד חידון רב-ברירה, אלא משחק עם **טיימר**, **שלושה לבבות**, **מכפיל רצף** ו**שיא אישי** שנשמר בדפדפן. בסוף כל סבב תקבלו דירוג, ורשימת חזרה של בדיוק מה שפספסתם.


<div class="tg" id="tg" dir="rtl">
  <div class="tg-screen is-active" data-screen="menu">
    <div class="tg-hero">
      <div class="tg-hero-badge">Linux</div>
      <div class="tg-hero-title">אתגר Linux</div>
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
      q: 'מה מציגה הפקודה <code>pwd</code>?',
      o: ['את הנתיב המלא של התיקייה הנוכחית', 'רשימת קבצים בתיקייה הנוכחית', 'את מזהה המשתמש הנוכחי', 'את גרסת מערכת ההפעלה'],
      a: 0,
      w: '<code>pwd</code> (Print Working Directory) מציגה את הנתיב המלא של התיקייה שבה אתם נמצאים כרגע - לא נוגעת בקבצים, רק מציגה מיקום.'
    },
    {
      q: 'איזו פקודה מציגה את כל הקבצים בתיקייה, כולל קבצים נסתרים ופרטים מלאים?',
      o: ['<code>ls -la</code>', '<code>ls</code>', '<code>cd -la</code>', '<code>dir -la</code>'],
      a: 0,
      w: '<code>-l</code> מוסיף תצוגה מפורטת (הרשאות, בעלים, גודל), ו-<code>-a</code> מציג גם קבצים נסתרים (שמתחילים בנקודה).'
    },
    {
      q: 'מה ההבדל בין <code>cp</code> ל-<code>cp -r</code>?',
      o: ['<code>-r</code> מעתיקה תיקיות רקורסיבית כולל כל התוכן; בלי <code>-r</code> אפשר להעתיק רק קבצים בודדים', '<code>-r</code> מוחקת את המקור אחרי ההעתקה', 'אין הבדל מעשי ביניהן', '<code>-r</code> מעתיקה רק קבצים נסתרים'],
      a: 0,
      w: 'ניסיון להעתיק תיקייה בלי <code>-r</code> (או <code>-R</code>) יחזיר שגיאה - הדגל הרקורסיבי הכרחי כדי לרדת לכל תת-התיקיות.'
    },
    {
      q: 'מה ההבדל בין <code>&gt;</code> ל-<code>&gt;&gt;</code> בהפניית פלט?',
      o: ['<code>&gt;</code> דורס את הקובץ, <code>&gt;&gt;</code> מוסיפה לסופו', '<code>&gt;</code> מוסיפה, <code>&gt;&gt;</code> דורסת', 'שני הסימנים דורסים את הקובץ', 'שני הסימנים מוסיפים לקובץ'],
      a: 0,
      w: '<code>echo "x" &gt; file</code> מוחק כל תוכן קודם ושותל רק את "x". <code>echo "y" &gt;&gt; file</code> מוסיפה שורה חדשה בסוף בלי לפגוע במה שכבר קיים.'
    },
    {
      q: 'מה עושה <code>grep -r "TODO" .</code>?',
      o: ['מחפשת רקורסיבית את המחרוזת "TODO" בכל הקבצים מהתיקייה הנוכחית ומטה', 'מוחקת את כל השורות שמכילות "TODO"', 'מחליפה כל מופע של "TODO" ב-"DONE"', 'מציגה רק את שמות הקבצים בלי תוכן'],
      a: 0,
      w: '<code>-r</code> (recursive) גורם ל-<code>grep</code> לרדת לכל תת-התיקיות. בלי דגלים נוספים היא מציגה גם את שם הקובץ וגם את השורה התואמת.'
    },
    {
      q: 'מה מייצג הערך המספרי <code>644</code> בפקודת <code>chmod</code>?',
      o: ['<code>rw-r--r--</code> - הבעלים קורא וכותב, קבוצה ואחרים רק קוראים', '<code>rwxr-xr-x</code> - הרשאת הרצה לכולם', '<code>rw-rw-rw-</code> - כתיבה לכולם', '<code>r--r--r--</code> - קריאה בלבד לכולם'],
      a: 0,
      w: '<code>6=rw-</code>, <code>4=r--</code>. לכן <code>644</code> = בעלים <code>rw-</code>, קבוצה <code>r--</code>, אחרים <code>r--</code> - הגדרת ברירת המחדל הטיפוסית לקבצים רגילים.'
    },
    {
      q: 'מה עושה <code>chown user:group file.txt</code>?',
      o: ['משנה גם את הבעלים וגם את הקבוצה של הקובץ', 'משנה רק הרשאות קריאה/כתיבה', 'יוצר משתמש וקבוצה חדשים', 'משנה את שם הקובץ'],
      a: 0,
      w: 'הפורמט <code>owner:group</code> מעדכן את שני השדות בפעולה אחת. אפשר גם לשנות רק אחד מהם, למשל <code>chown :group file.txt</code>.'
    },
    {
      q: 'מה ההבדל בין <code>useradd</code> ל-<code>usermod</code>?',
      o: ['<code>useradd</code> יוצרת משתמש חדש, <code>usermod</code> עורכת משתמש קיים', 'הן פקודות זהות לחלוטין', '<code>usermod</code> יוצרת משתמש, <code>useradd</code> עורכת אותו', '<code>useradd</code> משמשת רק לקבוצות'],
      a: 0,
      w: '<code>sudo useradd -m john</code> יוצרת חשבון חדש. כדי לשנות משתמש קיים - shell, קבוצות, נעילה - משתמשים ב-<code>usermod</code>.'
    },
    {
      q: 'מה עושה <code>sudo usermod -aG sudo john</code>?',
      o: ['מוסיפה את john לקבוצת sudo, מבלי להסיר אותו מקבוצות אחרות שהוא כבר חבר בהן', 'מחליפה את כל הקבוצות של john בקבוצת sudo בלבד', 'מוחקת את john מקבוצת sudo', 'יוצרת קבוצה חדשה בשם sudo'],
      a: 0,
      w: 'הדגל <code>-aG</code> (append + Groups) קריטי: <code>-G</code> לבד היה **מחליף** את כל הקבוצות המשניות. <code>-a</code> מבטיח שרק מוסיפים.'
    },
    {
      q: 'מה מציגה הפקודה <code>ps aux</code>?',
      o: ['רשימה סטטית של כל התהליכים הרצים במערכת, עם משתמש, PID, ניצול CPU וזיכרון', 'רק תהליכים ששייכים ל-root', 'רק תהליכי רקע', 'תוכן קובצי לוג'],
      a: 0,
      w: '<code>a</code>=כל המשתמשים, <code>u</code>=פורמט מפורט (משתמש, %CPU, %MEM), <code>x</code>=כולל תהליכים בלי טרמינל מחובר.'
    },
    {
      q: 'מה ההבדל בין <code>kill -15</code> ל-<code>kill -9</code>?',
      o: ['<code>-15</code> (SIGTERM) מבקש מהתהליך להיסגר בצורה מסודרת; <code>-9</code> (SIGKILL) הורג מיידית בלי אפשרות ניקוי משאבים', 'שני הסיגנלים זהים לגמרי', '<code>-9</code> עדין יותר מ-<code>-15</code>', '<code>-15</code> תמיד נכשל על תהליכים תקועים'],
      a: 0,
      w: '<code>SIGTERM</code> ניתן "לתפוס" בקוד ולנקות משאבים לפני יציאה. <code>SIGKILL</code> לא ניתן לתפיסה - התהליך נעלם מיידית, ולכן הוא מוצא אחרון.'
    },
    {
      q: 'מה עושה <code>sudo systemctl enable nginx</code> בלי <code>start</code>?',
      o: ['קובעת שהשירות יעלה אוטומטית באתחול הבא, בלי להפעיל אותו כעת', 'מפעילה את השירות מיד', 'מוחקת את השירות מהמערכת', 'רק בודקת את הסטטוס הנוכחי'],
      a: 0,
      w: '<code>enable</code> יוצרת קישור סימבולי ל-target המתאים לצורך boot עתידי. כדי שהשירות ירוץ **עכשיו** צריך גם <code>start</code> (או <code>enable --now</code> בפעולה אחת).'
    },
    {
      q: 'איזו פקודה מציגה כתובות IP וממשקי רשת בכלי המודרני?',
      o: ['<code>ip addr show</code> (או <code>ip a</code>)', '<code>ifup</code>', '<code>netcfg</code>', '<code>route -a</code>'],
      a: 0,
      w: '<code>ip</code> הוא הכלי המודרני שמחליף את <code>ifconfig</code> הישן. <code>ip addr show</code> מציגה את כל הממשקים וכתובות ה-IP שלהם.'
    },
    {
      q: 'מה עושה <code>ping -c 4 google.com</code>?',
      o: ['שולחת בדיוק 4 בקשות ping ועוצרת אוטומטית', 'שולחת ping ללא הפסקה עד <kbd>Ctrl+C</kbd>', 'בודקת רק רזולוציית DNS בלי לשלוח חבילות', 'מודדת את מהירות ההורדה מהאתר'],
      a: 0,
      w: 'בלי <code>-c</code>, <code>ping</code> ממשיכה לרוץ עד שעוצרים אותה ידנית. <code>-c 4</code> מגביל אותה ל-4 ניסיונות ואז מסכמת סטטיסטיקה.'
    },
    {
      q: 'מה ההבדל בין <code>man ls</code> ל-<code>ls --help</code>?',
      o: ['<code>man</code> פותח עמוד תיעוד מלא בעורך פנימי, <code>--help</code> מדפיס סיכום קצר ישירות לטרמינל', 'שתי הפקודות זהות לחלוטין', '<code>--help</code> פותח דפדפן אינטרנט', '<code>man</code> עובד רק עבור המשתמש root'],
      a: 0,
      w: '<code>man</code> מציג תיעוד מקיף עם דוגמאות והסברים, בעוד <code>--help</code> נותן רשימת דגלים מקוצרת - מהיר יותר לבדיקה נקודתית.'
    },
    {
      q: 'מה עושה <code>tar -czvf archive.tar.gz folder/</code>?',
      o: ['יוצרת ארכיון דחוס (gzip) מתוכן התיקייה folder', 'מחלצת ארכיון קיים לתיקייה folder', 'מוחקת את התיקייה folder אחרי דחיסתה', 'מעתיקה קבצים בלי לדחוס אותם'],
      a: 0,
      w: '<code>c</code>=create, <code>z</code>=gzip, <code>v</code>=verbose (מציג התקדמות), <code>f</code>=שם קובץ היעד. לחילוץ משתמשים ב-<code>x</code> במקום <code>c</code>.'
    },
    {
      q: 'מה ההבדל בין <code>df -h</code> ל-<code>du -sh</code>?',
      o: ['<code>df</code> מציגה שימוש בדיסק ברמת כל מערכת הקבצים/partition, ו-<code>du</code> מציגה גודל תיקייה או קובץ ספציפי', 'שתי הפקודות מציגות בדיוק אותו מידע', '<code>du</code> מציגה שימוש בזיכרון RAM, לא בדיסק', '<code>df</code> עובדת רק על תיקיית הבית'],
      a: 0,
      w: '<code>df -h</code> (disk free) נותנת תמונה כללית של כל ה-partitions. <code>du -sh /path</code> (disk usage, summarized) מודדת כמה מקום תופסת תיקייה ספציפית.'
    }
  ];

  /* ============================================================
     מצב 2 - ניחוש פלט: קטע פקודה/פלט אמיתי + מה בדיוק זה אומר
     ============================================================ */
  var OUTPUT_GUESS = [
    {
      code: '$ ls -l deploy.sh\n-rwxr-xr-- 1 dana devs 4096 Jan 10 09:00 deploy.sh',
      q: 'מי יכול להריץ (execute) את <code>deploy.sh</code> לפי ההרשאות המוצגות?',
      o: ['הבעלים dana וגם חברי קבוצת devs - אך לא אחרים', 'כל משתמש במערכת', 'רק הבעלים dana', 'אף אחד - אין הרשאת הרצה כלל'],
      a: 0,
      w: 'פירוק <code>rwxr-xr--</code>: בעלים <code>rwx</code> (הכל, כולל הרצה), קבוצה <code>r-x</code> (קריאה+הרצה, בלי כתיבה), אחרים <code>r--</code> (קריאה בלבד, בלי הרצה).'
    },
    {
      code: '$ ps aux\nUSER  PID  %CPU %MEM STAT START TIME COMMAND\nweb  4521  0.0  0.0    Z 10:02 0:00 [worker] <defunct>',
      q: 'מה אומר ה-STAT ‏<code>Z</code> בשורה הזו על התהליך?',
      o: ['זהו zombie process - הוא סיים לרוץ אך רשומתו עדיין קיימת כי ה-parent לא "אסף" את קוד היציאה', 'זהו תהליך רץ פעיל כרגע (running)', 'זהו תהליך שהושהה זמנית בלחיצת Ctrl+Z', 'זהו תהליך שרץ בהרשאות root בלבד'],
      a: 0,
      w: '<code>Z</code>=zombie ו-<code>&lt;defunct&gt;</code> בשם התהליך מאשרים זאת. הפתרון האמיתי הוא לתקן את ה-parent process, לא "להרוג" את ה-zombie (הוא כבר מת).'
    },
    {
      code: '$ chmod 750 script.sh\n$ ls -l script.sh',
      q: 'אילו הרשאות יוצגו לאחר הרצת <code>chmod 750</code>?',
      o: ['<code>rwxr-x---</code> - בעלים: הכל; קבוצה: קריאה+הרצה; אחרים: כלום', '<code>rwxrwx---</code> - בעלים וקבוצה עם הרשאה מלאה', '<code>rw-r-----</code> - בלי הרשאת הרצה בכלל', '<code>r-xr-x---</code> - בעלים בלי הרשאת כתיבה'],
      a: 0,
      w: '<code>7=rwx</code>, <code>5=r-x</code>, <code>0=---</code>. כלומר בעלים מקבל שליטה מלאה, הקבוצה יכולה לקרוא ולהריץ, ואחרים לא מקבלים כלום.'
    },
    {
      code: '$ sudo systemctl status nginx\n● nginx.service - A high performance web server\n   Loaded: loaded (/etc/systemd/system/nginx.service; enabled)\n   Active: active (running) since Mon 09:00:00',
      q: 'מה ההבדל בין "enabled" בשורת Loaded לבין "active (running)" בשורת Active?',
      o: ['"enabled" אומר שהשירות מוגדר לעלות אוטומטית באתחול; "active" אומר שהוא רץ בפועל כרגע - אלו שני מצבים בלתי-תלויים', 'שתי המילים מתארות בדיוק את אותו מצב', '"enabled" אומר שהשירות רץ כעת, ו-"active" מתייחס להפעלה עתידית', 'השירות "enabled" תמיד גם "active" באופן אוטומטי'],
      a: 0,
      w: 'שירות יכול להיות <code>enabled</code> אך לא <code>active</code> (למשל קרס), או <code>active</code> בלי להיות <code>enabled</code> (הופעל ידנית ולא יעלה שוב אחרי reboot).'
    },
    {
      code: '$ df -h\nFilesystem   Size  Used Avail Use% Mounted on\n/dev/sda1     50G   47G  2.1G  96% /',
      q: 'מה מעיד הפלט הזה על מצב הדיסק?',
      o: ['הדיסק כמעט מלא - 96% מנוצל ורק 2.1G פנויים, כדאי לפעול לפני שהוא מתמלא לגמרי', 'יש עדיין המון מקום פנוי בדיסק', 'ה-partition לא מחובר (unmounted)', 'מדובר בבעיית זיכרון RAM ולא בבעיית דיסק'],
      a: 0,
      w: 'העמודה <code>Use%</code> ו-<code>Avail</code> הן האינדיקטור המרכזי לבריאות דיסק - 96% ניצול הוא איתות אדום שדורש טיפול (ניקוי לוגים ישנים, הרחבת נפח וכו\').'
    },
    {
      code: '$ free -h\n              total  used  free shared buff/cache available\nMem:           16Gi  12Gi 500Mi  200Mi      3.3Gi      3.5Gi',
      q: 'למה עמודת "available" חשובה יותר מ-"free" כדי לדעת כמה זיכרון פנוי באמת יש?',
      o: ['"available" כוללת גם זיכרון buff/cache שהמערכת יכולה לשחרר מיידית לתהליכים, ולכן משקפת יותר טוב את הזיכרון הפנוי בפועל', '"free" ו-"available" תמיד זהות במערכות לינוקס', '"available" מציגה רק זיכרון וירטואלי מנותק מהחומרה', '"free" כוללת swap ו-"available" לא כוללת'],
      a: 0,
      w: 'לינוקס משתמש בזיכרון פנוי לצורכי cache כדי לזרז I/O. עמודת "free" הגולמית (500Mi כאן) נראית נמוכה, אבל "available" (3.5Gi) מציגה מה שבאמת אפשר להקצות לתהליך חדש.'
    },
    {
      code: '$ sudo ss -tulpn | grep :80\ntcp LISTEN 0 511 0.0.0.0:80 0.0.0.0:* users:(("nginx",pid=1234,fd=6))',
      q: 'מה אפשר ללמוד מהשורה הזו?',
      o: ['תהליך nginx עם PID 1234 מאזין (LISTEN) על פורט 80 בכל הממשקים', 'פורט 80 סגור ולא בשימוש', 'nginx לא רץ כרגע במערכת', 'מדובר בחיבור established בין שני שרתים'],
      a: 0,
      w: 'העמודה הראשונה <code>LISTEN</code> אומרת שמישהו מאזין לחיבורים נכנסים. <code>0.0.0.0:80</code> = פורט 80 בכל הכתובות המקומיות, ו-<code>users:(("nginx",pid=1234,...))</code> מזהה בדיוק מי מחזיק בפורט.'
    },
    {
      code: '$ crontab -l\n0 3 * * * /opt/scripts/backup.sh',
      q: 'מתי בדיוק תרוץ המשימה המתוזמנת הזו?',
      o: ['כל יום בשעה 03:00 בלילה', 'כל שעה עגולה, 24 פעמים ביום', 'פעם בשבוע, בכל יום ראשון', 'כל 3 דקות'],
      a: 0,
      w: 'הפורמט הוא <code>דקה שעה יום-בחודש חודש יום-בשבוע</code>. <code>0 3 * * *</code> = דקה 0, שעה 3, בכל יום בחודש, בכל חודש, בכל יום בשבוע - כלומר כל יום ב-3:00.'
    },
    {
      code: '$ id john\nuid=1001(john) gid=1001(john) groups=1001(john),27(sudo),1002(devs)',
      q: 'מה אפשר להסיק על המשתמש john מהפלט הזה?',
      o: ['ל-john יש קבוצה ראשית משלו, וגם חברות בקבוצות המשניות sudo ו-devs - כלומר יש לו גם הרשאות מנהל', 'ל-john אין שום קבוצה משויכת', 'john שייך רק לקבוצת root', 'הפקודה <code>id</code> מציגה רק את שם המשתמש בלי פרטים נוספים'],
      a: 0,
      w: '<code>gid</code> היא הקבוצה הראשית, ו-<code>groups</code> מציגה את כל הקבוצות שהמשתמש חבר בהן - כולל <code>sudo</code>, שמעניקה הרשאות הרצה כ-root דרך <code>sudo</code>.'
    },
    {
      code: '$ history | tail -5\n 501  cd /var/log\n 502  ls -la\n 503  sudo systemctl restart nginx\n 504  tail -f nginx/error.log\n 505  history',
      q: 'איך תריצו שוב את הפקודה שמספרה 503, בלי להקליד אותה מחדש?',
      o: ['<code>!503</code>', '<code>history -r 503</code>', '<code>re 503</code>', '<code>bash 503</code>'],
      a: 0,
      w: 'סימן הקריאה <code>!</code> ואחריו מספר מריץ מחדש את הפקודה המתאימה מההיסטוריה. <code>!!</code> (בלי מספר) מריצה תמיד את הפקודה האחרונה.'
    },
    {
      code: '$ ls -ld /shared/project\ndrwxrwsr-x 2 dana devs 4096 Jan 1 10:00 /shared/project',
      q: 'מה מציין ה-<code>s</code> במקום ה-<code>x</code> בהרשאות הקבוצה (<code>rws</code>)?',
      o: ['מדובר ב-SGID על התיקייה - כל קובץ חדש שייווצר בתוכה יירש אוטומטית את קבוצת התיקייה (devs)', 'זו שגיאת תצוגה, אין לכך משמעות מיוחדת', 'מדובר ב-SUID שגורם לתיקייה לרוץ בהרשאות הבעלים', 'התיקייה נעולה לחלוטין ואי אפשר לגשת אליה'],
      a: 0,
      w: 'ה-<code>d</code> בתחילת השורה מציין תיקייה, ו-<code>s</code> בביט ה-execute של הקבוצה מסמן SGID - שימושי מאוד לתיקיות שיתוף שבהן כמה משתמשים צריכים ליצור קבצים באותה קבוצה.'
    },
    {
      code: '$ journalctl -u nginx --since "1 hour ago" -p err',
      q: 'מה בדיוק מציגה הפקודה הזו?',
      o: ['שגיאות (רמת err ומעלה) של שירות nginx, מהשעה האחרונה בלבד', 'את כל הלוגים של המערכת כולה מאז ההפעלה האחרונה', 'רק אזהרות (warnings) בלי הגבלת זמן', 'סטטוס נוכחי בלבד, בלי שום לוג'],
      a: 0,
      w: '<code>-u nginx</code> מסננת לפי שירות ספציפי, <code>--since</code> מגבילה לטווח זמן, ו-<code>-p err</code> מציגה רק הודעות ברמת חומרה error ומעלה - שילוב מדויק לדיבוג מהיר.'
    }
  ];

  /* ============================================================
     מצב 3 - השלמת פקודה: פקודת shell עם חלק חסר, לבחור מה משלים אותה
     ============================================================ */
  var CMD_COMPLETE = [
    {
      code: '$ chmod ___ script.sh',
      q: 'מה משלים את הפקודה כדי לתת לבעלים הרשאה מלאה, ולקבוצה ולאחרים רק קריאה והרצה (<code>rwxr-xr-x</code>)?',
      o: ['<code>755</code>', '<code>777</code>', '<code>644</code>', '<code>700</code>'],
      a: 0,
      w: '<code>7=rwx</code> לבעלים, <code>5=r-x</code> לקבוצה, <code>5=r-x</code> לאחרים - שילוב טיפוסי לסקריפטים שצריכים לרוץ אצל כולם אך להיערך רק ע"י הבעלים.'
    },
    {
      code: '$ find /var/log -name "___" -mtime -7',
      q: 'מה משלים את הדפוס כדי למצוא את כל קבצי הלוג (<code>.log</code>) ששונו ב-7 הימים האחרונים?',
      o: ['<code>*.log</code>', '<code>*.txt</code>', '<code>log*</code> בלי גרשיים', '<code>/log/</code>'],
      a: 0,
      w: 'גרשיים סביב התבנית חשובים כדי שה-shell לא ינסה להרחיב את ה-<code>*</code> בעצמו לפני שהוא מגיע ל-<code>find</code>. <code>*.log</code> תואמת כל קובץ שמסתיים ב-".log".'
    },
    {
      code: '$ grep -___ "error" app.log',
      q: 'מה משלים את הדגל כדי לספור כמה שורות מכילות "error", בלי להציג את השורות עצמן?',
      o: ['<code>c</code>', '<code>v</code>', '<code>i</code>', '<code>l</code>'],
      a: 0,
      w: '<code>-c</code> (count) מדפיסה רק מספר. <code>-v</code> הופכת את ההתאמה (invert), <code>-i</code> מתעלמת מרישיות, <code>-l</code> מציגה רק שמות קבצים תואמים.'
    },
    {
      code: '$ tar -___ archive.tar.gz',
      q: 'מה משלים את הפקודה כדי לחלץ (extract) ארכיון <code>.tar.gz</code> קיים?',
      o: ['<code>xzvf</code>', '<code>czvf</code>', '<code>tvf</code>', '<code>rvf</code>'],
      a: 0,
      w: '<code>x</code>=extract (בניגוד ל-<code>c</code>=create), <code>z</code>=gzip, <code>v</code>=verbose, <code>f</code>=שם קובץ הארכיון. <code>t</code> רק מציגה תוכן בלי לחלץ.'
    },
    {
      code: '$ sudo usermod -___ sudo john',
      q: 'מה משלים את הפקודה כדי להוסיף את john לקבוצת sudo, בלי להסיר אותו מקבוצות קיימות?',
      o: ['<code>aG</code>', '<code>G</code>', '<code>a</code>', '<code>g</code>'],
      a: 0,
      w: '<code>-G</code> לבד **מחליף** את כל הקבוצות המשניות. <code>-aG</code> (append + Groups) מוסיפה קבוצה חדשה בלי לפגוע בקיימות - שילוב שכדאי לזכור תמיד.'
    },
    {
      code: '$ sudo systemctl ___ --now nginx',
      q: 'מה משלים את הפקודה כדי להפעיל את nginx כעת, וגם להבטיח שיעלה אוטומטית באתחול הבא - בפעולה אחת?',
      o: ['<code>enable</code>', '<code>start</code>', '<code>status</code>', '<code>reload</code>'],
      a: 0,
      w: '<code>enable --now</code> משלבת שני צעדים: יצירת הקישור הסימבולי לצורך boot עתידי (מה ש-<code>enable</code> עושה) והפעלה מיידית (מה ש-<code>start</code> עושה בנפרד).'
    },
    {
      code: '$ kill -___ 4521',
      q: 'מה משלים את הפקודה כדי לשלוח לתהליך 4521 סיגנל הריגה מיידית (SIGKILL)?',
      o: ['<code>9</code>', '<code>1</code>', '<code>15</code>', '<code>2</code>'],
      a: 0,
      w: '<code>9</code>=SIGKILL (הריגה מיידית, לא ניתן לתפוס). <code>1</code>=SIGHUP (טעינת קונפיגורציה מחדש), <code>15</code>=SIGTERM (בקשת סיום מנומסת), <code>2</code>=SIGINT (כמו Ctrl+C).'
    },
    {
      code: '$ ps aux | ___ nginx',
      q: 'מה משלים את הפקודה כדי לסנן ולהציג רק את השורות שמכילות "nginx" מתוך פלט <code>ps</code>?',
      o: ['<code>grep</code>', '<code>find</code>', '<code>sort</code>', '<code>uniq</code>'],
      a: 0,
      w: 'צנרת נפוצה מאוד: <code>ps aux</code> מדפיסה את כל התהליכים, ו-<code>grep nginx</code> מסננת רק את השורות הרלוונטיות. חלופה מודרנית: <code>pgrep -l nginx</code>.'
    },
    {
      code: '$ journalctl -u nginx ___',
      q: 'מה משלים את הפקודה כדי לעקוב בזמן אמת אחרי לוגים חדשים (כמו <code>tail -f</code>)?',
      o: ['<code>-f</code>', '<code>-b</code>', '<code>-x</code>', '<code>-l</code>'],
      a: 0,
      w: '<code>-f</code> (follow) משאירה את הפקודה פתוחה ומדפיסה כל שורת לוג חדשה מיד כשהיא נכתבת - שימושי מאוד לצפייה חיה בזמן דיבוג.'
    },
    {
      code: '$ chown ___ www-data:www-data /var/www/html',
      q: 'מה משלים את הפקודה כדי להחיל את שינוי הבעלות רקורסיבית על כל הקבצים בתיקייה?',
      o: ['<code>-R</code>', '<code>-r</code>', '<code>-a</code>', '<code>-f</code>'],
      a: 0,
      w: 'ב-<code>chown</code> (בניגוד ל-<code>cp</code>) הדגל הרקורסיבי הוא <code>-R</code> גדולה. בלעדיו רק התיקייה עצמה תשתנה, לא הקבצים בתוכה.'
    },
    {
      code: '$ crontab -___',
      q: 'מה משלים את הפקודה כדי לפתוח לעריכה את משימות ה-cron של המשתמש הנוכחי?',
      o: ['<code>e</code>', '<code>l</code>', '<code>r</code>', '<code>f</code>'],
      a: 0,
      w: '<code>-e</code> (edit) פותחת את קובץ ה-crontab בעורך ברירת המחדל. <code>-l</code> רק מציגה (list) בלי לערוך, ו-<code>-r</code> מוחקת את כל המשימות המתוזמנות.'
    },
    {
      code: '$ sudo ss -___ | grep :443',
      q: 'מה משלים את הדגלים כדי להציג את כל הפורטים המאזינים (TCP+UDP) עם שם התהליך ומספרו, בפורמט מספרי?',
      o: ['<code>tulpn</code>', '<code>la</code>', '<code>x</code>', '<code>h</code>'],
      a: 0,
      w: '<code>t</code>=TCP, <code>u</code>=UDP, <code>l</code>=listening בלבד, <code>p</code>=מציג את שם התהליך וה-PID, <code>n</code>=כתובות ופורטים מספריים במקום resolve איטי.'
    },
    {
      code: '$ ln -___ /opt/app/releases/v2 /opt/app/current',
      q: 'מה משלים את הפקודה כדי ליצור קישור סימבולי (symlink) בשם current שמצביע לגרסה v2?',
      o: ['<code>s</code>', '<code>h</code>', '<code>L</code>', '<code>sym</code>'],
      a: 0,
      w: '<code>ln -s target link_name</code> יוצרת קישור סימבולי - שיטה נפוצה לניהול "current release" בפריסות (deployments) שמצביע תמיד על הגרסה הפעילה.'
    }
  ];

  /* ============================================================
     מצב 4 - התאמת מושגים: סבבים של זוגות פקודה/מושג + תיאור
     ============================================================ */
  var MATCH_ROUNDS = [
    {
      title: 'ניווט וקבצים בסיסי',
      pairs: [
        { l: '<code>pwd</code>', r: 'מציגה את הנתיב המלא של התיקייה הנוכחית' },
        { l: '<code>ls -la</code>', r: 'מציגה את כל הקבצים בתיקייה, כולל נסתרים, עם פרטים מלאים' },
        { l: '<code>find</code>', r: 'מחפשת קבצים לפי שם, גודל, תאריך שינוי ועוד קריטריונים' },
        { l: '<code>grep -r</code>', r: 'מחפשת מחרוזת טקסט בתוך קבצים, רקורסיבית בכל תת-התיקיות' },
        { l: '<code>tail -f</code>', r: 'עוקבת בזמן אמת אחרי שורות חדשות שנוספות לקובץ' }
      ]
    },
    {
      title: 'הרשאות ובעלות',
      pairs: [
        { l: '<code>chmod 755</code>', r: 'נותנת לבעלים הרשאה מלאה, ולקבוצה ולאחרים קריאה והרצה בלבד' },
        { l: '<code>chown user:group</code>', r: 'משנה גם את הבעלים וגם את הקבוצה של קובץ בפעולה אחת' },
        { l: '<code>umask</code>', r: 'קובעת אילו הרשאות יורדות אוטומטית מקבצים ותיקיות חדשים' },
        { l: 'SUID', r: 'גורם לתוכנית לרוץ בהרשאות הבעלים שלה, ולא בהרשאות מי שהריץ אותה' },
        { l: 'Sticky Bit', r: 'מונע ממשתמשים למחוק קבצים של אחרים בתיקייה משותפת כמו /tmp' }
      ]
    },
    {
      title: 'משתמשים, קבוצות ותהליכים',
      pairs: [
        { l: '<code>useradd -m</code>', r: 'יוצרת משתמש חדש כולל תיקיית home' },
        { l: '<code>usermod -aG</code>', r: 'מוסיפה משתמש לקבוצה נוספת בלי להסיר אותו מקבוצות קיימות' },
        { l: '<code>ps aux</code>', r: 'מציגה רשימה סטטית של כל התהליכים הרצים במערכת' },
        { l: '<code>kill -15</code>', r: 'מבקשת מתהליך להיסגר בצורה מסודרת (SIGTERM)' },
        { l: '<code>nice -n 10</code>', r: 'מריצה תהליך חדש בעדיפות מופחתת מול תהליכים אחרים' }
      ]
    },
    {
      title: 'systemd ורשת',
      pairs: [
        { l: '<code>systemctl enable</code>', r: 'קובעת שהשירות יעלה אוטומטית באתחול הבא של המערכת' },
        { l: '<code>journalctl -u</code>', r: 'מציגה את הלוגים של שירות ספציפי דרך systemd' },
        { l: '<code>ip addr show</code>', r: 'מציגה כתובות IP וממשקי רשת בכלי המודרני' },
        { l: '<code>ss -tulpn</code>', r: 'מציגה את כל הפורטים הפתוחים והתהליכים שמאזינים עליהם' },
        { l: '<code>crontab -e</code>', r: 'פותחת לעריכה את משימות התזמון התקופתיות של המשתמש הנוכחי' }
      ]
    }
  ];

  /* ============================================================
     מצב 5 - סידור תהליך: סבבים של שלבים שצריך לסדר בסדר הנכון
     ============================================================ */
  var ORDER_ROUNDS = [
    {
      title: 'יצירת משתמש חדש עם הרשאות sudo',
      steps: [
        'הרצת sudo useradd -m john ליצירת המשתמש ותיקיית home',
        'הרצת sudo passwd john להגדרת סיסמה למשתמש החדש',
        'הרצת sudo usermod -aG sudo john להוספתו לקבוצת ההרשאות המנהליות',
        'בדיקת חברות בקבוצות עם groups john',
        'התחברות כ-john ווידוא שאפשר להריץ sudo whoami בהצלחה'
      ]
    },
    {
      title: 'הגדרת שירות systemd חדש והפעלתו',
      steps: [
        'יצירת קובץ unit ב-/etc/systemd/system/myapp.service עם ExecStart מתאים',
        'הרצת sudo systemctl daemon-reload לטעינת ההגדרה החדשה',
        'הרצת sudo systemctl start myapp להפעלה ראשונית',
        'בדיקת systemctl status myapp לוודא שהשירות פעיל בלי שגיאות',
        'הרצת sudo systemctl enable myapp כדי שיעלה אוטומטית באתחול הבא'
      ]
    },
    {
      title: 'אבחון שירות שנכשל בהפעלה',
      steps: [
        'הרצת systemctl status servicename לקבלת סיכום ראשוני של השגיאה',
        'הרצת journalctl -u servicename -xe לצפייה בלוגים המפורטים',
        'זיהוי הגורם לשגיאה - למשל קובץ קונפיגורציה שגוי או פורט תפוס',
        'תיקון הבעיה בעריכת קובץ ה-service או הקונפיגורציה הרלוונטית',
        'הרצת sudo systemctl daemon-reload אם קובץ ה-unit עצמו השתנה',
        'הרצת sudo systemctl restart servicename ואימות מחדש עם status'
      ]
    },
    {
      title: 'תיקון הרשאות קובץ רגישות בצורה בטוחה',
      steps: [
        'בדיקת ההרשאות הנוכחיות עם ls -l file.txt',
        'זיהוי מה בדיוק חסר - למשל הרשאת הרצה לבעלים',
        'הרצת chmod עם הערך המתאים (למשל chmod u+x file.txt)',
        'וידוא שהבעלים והקבוצה נכונים עם chown אם צריך',
        'הרצה חוזרת של ls -l לאימות שההרשאות תוקנו כראוי'
      ]
    },
    {
      title: 'אבחון בעיית פורט תפוס לפני הפעלת שירות',
      steps: [
        'ניסיון להפעיל שירות עם systemctl start וקבלת שגיאת "port already in use"',
        'הרצת sudo ss -tulpn | grep :PORT לזיהוי מי מחזיק בפורט',
        'זיהוי ה-PID והתהליך התופס את הפורט מתוך הפלט',
        'עצירת התהליך המיותר עם kill, או עצירת השירות הכפול',
        'הרצה חוזרת של systemctl start ווידוא הצלחה עם status'
      ]
    }
  ];

  /* ============================================================
     הגדרת מצבי המשחק
     ============================================================ */
  var MODES = [
    { key: 'rapid', icon: '⚡', name: 'קרב מהיר', desc: 'שאלות ידע כלליות על לינוקס - פקודות, הרשאות, תהליכים ועוד', type: 'quiz', data: RAPID, sample: 10, time: 20000 },
    { key: 'output', icon: '🔎', name: 'ניחוש פלט', desc: 'פקודה או פלט לינוקס אמיתי - מה בדיוק זה אומר?', type: 'quiz', data: OUTPUT_GUESS, sample: 8, time: 28000, showCode: true },
    { key: 'cmd', icon: '🧩', name: 'השלמת פקודה', desc: 'פקודת shell עם חלק חסר - בחרו מה משלים אותה נכון', type: 'quiz', data: CMD_COMPLETE, sample: 8, time: 28000, showCode: true },
    { key: 'match', icon: '🔗', name: 'התאמת מושגים', desc: 'התאימו כל פקודה/מושג לינוקס לתיאור הנכון שלו', type: 'match', data: MATCH_ROUNDS, sample: 2 },
    { key: 'order', icon: '📋', name: 'סידור תהליך', desc: 'סדרו את שלבי התהליך המערכתי לפי הסדר הנכון', type: 'order', data: ORDER_ROUNDS, sample: 2 }
  ];

  window.TG_CONFIG = { gameId: "linux", modes: MODES };
})();
</script>

<script src="/scripts/topic-game.js"></script>
