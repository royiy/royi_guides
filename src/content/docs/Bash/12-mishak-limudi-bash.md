---
title: "משחק לימודי: אתגר Bash"
category: Bash
part: 12/10
description: "משחק אינטראקטיבי ללימוד Bash Scripting - חמישה מצבי משחק עם טיימר, לבבות, ניקוד ורצפים: קרב מהיר, ניחוש פלט קוד, השלמת סקריפט, התאמת פקודות וסידור workflow."
---

חמישה מצבי משחק שבודקים היבטים שונים של Bash Scripting - לא עוד חידון רב-ברירה, אלא משחק עם **טיימר**, **שלושה לבבות**, **מכפיל רצף** ו**שיא אישי** שנשמר בדפדפן. בסוף כל סבב תקבלו דירוג, ורשימת חזרה של בדיוק מה שפספסתם.


<div class="tg" id="tg" dir="rtl">
  <div class="tg-screen is-active" data-screen="menu">
    <div class="tg-hero">
      <div class="tg-hero-badge">Bash</div>
      <div class="tg-hero-title">אתגר Bash</div>
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
      q: 'מה ההבדל בין <code>$var</code> לבין <code>${var}</code>?',
      o: ['שניהם מרחיבים את אותו המשתנה; הסוגריים המסולסלים נחוצים כדי להפריד את שם המשתנה מטקסט צמוד, למשל <code>${var}_suffix</code>', '<code>${var}</code> תמיד מהיר יותר בזמן ריצה', '<code>$var</code> עובד רק בתוך מרכאות כפולות', 'אין הבדל בשום מקרה, זה סתם סגנון כתיבה'],
      a: 0,
      w: '<code>${var}</code> שקול ל-<code>$var</code> בהרחבה רגילה, אבל הסוגריים חיוניים כשרוצים לצרף טקסט מיד אחרי שם המשתנה - בלעדיהם <code>$var_suffix</code> היה מתפרש כמשתנה בשם var_suffix שלא קיים.'
    },
    {
      q: 'מה ההבדל בין מרכאות בודדות למרכאות כפולות ב-Bash?',
      o: ['מרכאות כפולות מרחיבות משתנים ופקודות בתוכן; מרכאות בודדות שומרות הכל כטקסט מילולי, בלי הרחבה', 'מרכאות בודדות מרחיבות משתנים ואילו כפולות לא', 'אין הבדל מעשי בין השתיים', 'מרכאות כפולות אסורות סביב משתנים'],
      a: 0,
      w: 'בתוך מרכאות כפולות Bash מרחיב <code>$var</code>, <code>$(cmd)</code> ואפילו backticks. בתוך מרכאות בודדות הכל נשאר מילולי כפי שנכתב, כולל סימן ה-<code>$</code>.'
    },
    {
      q: 'למה חשוב לעטוף משתנה במרכאות כפולות, למשל <code>"$file"</code>?',
      o: ['כדי למנוע word splitting ו-glob expansion אם הערך מכיל רווחים או תווים מיוחדים', 'כי בלי מרכאות Bash לא מריץ בכלל את הפקודה', 'כדי להפוך את המשתנה לקבוע (read-only)', 'זה משפיע רק על מהירות הביצוע'],
      a: 0,
      w: 'בלי מרכאות, ערך עם רווחים (כמו "my file.txt") מתפצל למספר ארגומנטים נפרדים. <code>"$file"</code> שומר עליו כיחידה אחת ומונע גם הרחבת תווים כמו <code>*</code> בטעות.'
    },
    {
      q: 'מה ההבדל בין <code>[ ]</code> ל-<code>[[ ]]</code> בבדיקות תנאי?',
      o: ['<code>[[ ]]</code> הוא הרחבת Bash שתומכת ב-pattern matching ו-<code>&&</code>/<code>||</code> פנימיים בלי escaping; <code>[ ]</code> הוא POSIX test תואם sh', 'הם זהים לחלוטין בכל מקרה', '<code>[ ]</code> תומך ברגקס ואילו <code>[[ ]]</code> לא', '<code>[[ ]]</code> עובד רק בתוך פונקציות'],
      a: 0,
      w: '<code>[[ ]]</code> הוא keyword מובנה של Bash שמאפשר <code>==</code> עם glob patterns, <code>=~</code> לregex, ו-<code>&&</code>/<code>||</code> בפנים בלי escaping. <code>[ ]</code> הוא הפקודה test המסורתית, תואמת גם ל-sh.'
    },
    {
      q: 'מה מדפיס <code>echo $?</code> מיד אחרי פקודה שהצליחה?',
      o: ['0', '1', 'המילה "הצלחה"', 'תלוי לגמרי במערכת ההפעלה'],
      a: 0,
      w: 'exit code 0 מציין הצלחה. כל ערך אחר (1 עד 255) מציין כישלון או קוד שגיאה ספציפי.'
    },
    {
      q: 'איך בודקים בתנאי if שפקודה קודמת נכשלה?',
      o: ['<code>if [ $? -ne 0 ]; then ... fi</code>', '<code>if $? == fail; then</code>', '<code>if [ $status ]; then</code>', 'אי אפשר לבדוק זאת ב-Bash'],
      a: 0,
      w: '<code>$?</code> מכיל את קוד החזרה של הפקודה האחרונה. ערך שונה מ-0 מציין כישלון, ולכן <code>-ne 0</code> בודק זאת.'
    },
    {
      q: 'מה עושה <code>local x=5</code> בתוך פונקציה?',
      o: ['מגדיר משתנה שקיים רק בתוך הפונקציה, בלי לדרוס משתנה גלובלי באותו שם', 'הופך את x לקבוע (constant)', 'מייצא את x לתת-תהליכים', 'זהה לחלוטין ל-x=5 בלי הבדל'],
      a: 0,
      w: 'בלי <code>local</code>, כל משתנה בפונקציה הוא בברירת מחדל גלובלי ועלול לדרוס משתנה קיים באותו שם מחוץ לפונקציה.'
    },
    {
      q: 'איך פונקציה ב-Bash "מחזירה" ערך מספרי שאפשר לבדוק עם <code>$?</code>?',
      o: ['עם <code>return N</code> (0 עד 255) - נבדק ב-<code>$?</code> מיד אחרי הקריאה', 'עם <code>echo N</code> בלבד', 'עם <code>exit N</code> שמסיים את כל הסקריפט', 'פונקציות לא יכולות להחזיר ערכים'],
      a: 0,
      w: '<code>return</code> מגדיר exit code לפונקציה, כמו כל פקודה (0 עד 255). כדי "להחזיר" מחרוזת או ערך מורכב נהוג להשתמש ב-<code>echo</code> ולתפוס עם command substitution: <code>result=$(myfunc)</code>.'
    },
    {
      q: 'מה ההבדל בין <code>"$*"</code> ל-<code>"$@"</code>?',
      o: ['<code>"$@"</code> משמר כל ארגומנט כמילה נפרדת; <code>"$*"</code> ממזג את כולם למחרוזת אחת מופרדת ב-IFS', 'הם זהים לחלוטין בכל מצב', '<code>"$@"</code> עובד רק בתוך פונקציות', '<code>"$*"</code> תומך ביותר ארגומנטים'],
      a: 0,
      w: '<code>"$@"</code> (עם מרכאות) מתרחב לרשימת ארגומנטים נפרדים - השימוש הנפוץ בלולאות. <code>"$*"</code> ממזג את כולם למחרוזת יחידה עם ה-IFS כמפריד.'
    },
    {
      q: 'מה מייצגים <code>$0</code>, <code>$1</code>, <code>$2</code> בסקריפט?',
      o: ['<code>$0</code> שם הסקריפט, <code>$1</code> <code>$2</code> וכו\' הארגומנטים שהועברו אליו לפי סדר', '<code>$0</code> הוא תמיד ה-PID של הסקריפט', '<code>$1</code> הוא תמיד ערך ההחזרה האחרון', 'הם רלוונטיים רק בתוך פונקציות'],
      a: 0,
      w: '<code>$0</code> מכיל את שם/נתיב הסקריפט כפי שהורץ, ו-<code>$1</code>, <code>$2</code> הם הארגומנטים שהועברו אליו. <code>$#</code> מכיל את מספר הארגומנטים הכולל.'
    },
    {
      q: 'מה עושה <code>for i in {1..5}</code>?',
      o: ['רץ על טווח מספרים 1 עד 5 כולל, בעזרת brace expansion', 'רץ 5 פעמים בלי קשר לערך של i', 'יוצר מערך חדש בשם i', 'זו שגיאת תחביר ב-Bash'],
      a: 0,
      w: '<code>{1..5}</code> הוא brace expansion שמתבצע לפני הרצת הלולאה ומייצר את הרשימה 1 2 3 4 5. שימו לב: לא עובד עם משתנה כמו <code>{1..$n}</code> - לכך משתמשים ב-<code>seq</code> או בלולאת C-style.'
    },
    {
      q: 'איך מצהירים ומגדירים מערך (array) פשוט ב-Bash?',
      o: ['<code>arr=(dog cat fish)</code>', '<code>arr = [dog, cat, fish]</code>', '<code>array arr(dog cat fish)</code>', '<code>arr={dog,cat,fish}</code>'],
      a: 0,
      w: 'תחביר המערך הבסיסי הוא <code>name=(item1 item2 item3)</code>, בלי פסיקים ובלי סימן שוויון בין הסוגריים.'
    },
    {
      q: 'מה מחזיר <code>${#arr[@]}</code>?',
      o: ['את מספר האיברים במערך arr', 'את האיבר הראשון במערך', 'את האינדקס האחרון של המערך', 'שגיאת תחביר'],
      a: 0,
      w: '<code>${#arr[@]}</code> נותן את מספר האיברים הכולל. לעומת זאת <code>${#arr[0]}</code> נותן את אורך התו של האיבר הראשון בלבד, לא את גודל המערך.'
    },
    {
      q: 'מה עושה <code>set -u</code> בתחילת סקריפט?',
      o: ['גורם לשגיאה כשמשתמשים במשתנה שלא הוגדר, במקום להתייחס אליו כמחרוזת ריקה', 'עוצר את הסקריפט בכל שגיאה', 'מדפיס כל פקודה לפני הרצתה', 'מגביל את זמן הריצה של הסקריפט'],
      a: 0,
      w: '<code>set -u</code> (nounset) הופך שימוש במשתנה לא-מוגדר לשגיאה קטלנית, מה שעוזר לתפוס טעויות הקלדה בשם משתנה. משלימים אותו עם <code>set -e</code> (עצירה בשגיאה) ו-<code>set -o pipefail</code>.'
    },
    {
      q: 'מה ההבדל בין <code>$(command)</code> לבין backticks?',
      o: ['שקולים מבחינה פונקציונלית, אבל <code>$()</code> ניתן לקינון קל וקריא יותר', '<code>$()</code> רץ בתת-תהליך ו-backticks לא', 'backticks מהירים יותר בביצוע', 'רק אחד מהם תקין ב-Bash מודרני'],
      a: 0,
      w: 'שניהם מבצעים command substitution ומחזירים את הפלט של הפקודה. <code>$()</code> קריא יותר ותומך קינון פשוט כמו <code>$(cmd1 $(cmd2))</code>, בעוד backticks מקוננים דורשים escaping מסורבל.'
    },
    {
      q: 'מה מאפשר <code>case</code> שקשה יותר להשיג עם if-elif ארוך?',
      o: ['בדיקת ערך אחד מול כמה תבניות (patterns) כולל glob matching, בצורה קומפקטית', 'הרצת כל הבלוקים בו-זמנית', 'עבודה רק עם מספרים שלמים', 'התנהגות זהה בדיוק ל-switch ב-C בלי הבדלים'],
      a: 0,
      w: '<code>case $var in pattern1) ...;; pattern2) ...;; esac</code> תומכת ב-glob patterns (למשל <code>*.txt</code>) ובכמה תבניות מופרדות ב-<code>|</code> לאותו בלוק, מה שהופך אותה לקומפקטית יותר מ-if-elif ארוך לבדיקת ערכים מרובים.'
    },
    {
      q: 'מה קובע את קוד היציאה (exit code) של סקריפט שמסתיים בלי <code>exit</code> מפורש?',
      o: ['הוא נקבע לפי קוד ההחזרה של הפקודה האחרונה שהורצה בסקריפט', 'exit code תמיד יהיה 0', 'exit code תמיד יהיה 1', 'הסקריפט לא יכול להסתיים בלי exit מפורש'],
      a: 0,
      w: 'ללא <code>exit N</code> מפורש, exit code הסקריפט נקבע אוטומטית לפי <code>$?</code> של הפקודה האחרונה שהורצה בו.'
    }
  ];

  /* ============================================================
     מצב 2 - ניחוש פלט: קטע סקריפט Bash - מה יהיה הפלט שלו?
     ============================================================ */
  var CODE_OUTPUT = [
    {
      code: 'x=5\necho "$x"',
      q: 'מה יודפס?',
      o: ['5', 'x', '$x', 'שגיאת תחביר'],
      a: 0,
      w: '<code>"$x"</code> בתוך מרכאות כפולות מתרחב לערך המשתנה - 5.'
    },
    {
      code: "str='Hello $USER'\necho $str",
      q: 'מה יודפס (בהינחה שיש משתנה סביבה בשם USER)?',
      o: ['Hello $USER (מילולי, בלי הרחבה)', 'Hello ואז ערך המשתנה USER בפועל', 'שגיאת תחביר', 'שורה ריקה'],
      a: 0,
      w: 'מרכאות בודדות מונעות הרחבת משתנים - <code>$USER</code> נשאר מילולי בתוך str ולא מוחלף בערכו האמיתי.'
    },
    {
      code: 'for i in 1 2 3; do\n  echo "$i"\ndone',
      q: 'מה יודפס?',
      o: ['1, 2, 3 - כל אחד בשורה נפרדת', '1 2 3 בשורה אחת', 'רק 3', 'שגיאה - חסר done'],
      a: 0,
      w: '<code>echo</code> מדפיס כל איטרציה בשורה נפרדת - התוצאה היא שלוש שורות: 1, 2, 3.'
    },
    {
      code: 'count=0\nwhile [ $count -lt 3 ]; do\n  echo "run $count"\n  ((count++))\ndone',
      q: 'כמה פעמים תודפס השורה שמתחילה ב-"run"?',
      o: ['3 פעמים - run 0, run 1, run 2', '4 פעמים', 'פעם אחת בלבד', 'לולאה אינסופית'],
      a: 0,
      w: 'הלולאה בודקת <code>count -lt 3</code> בתחילת כל איטרציה: 0, 1, 2 עוברים (3 הרצות), וכש-count מגיע ל-3 התנאי כוזב והלולאה נעצרת.'
    },
    {
      code: 'arr=(a b c)\necho "${arr[1]}"',
      q: 'מה יודפס?',
      o: ['b', 'a', 'c', 'שגיאה - אינדקס לא קיים'],
      a: 0,
      w: 'מערכים ב-Bash מתחילים מאינדקס 0, כך ש-<code>${arr[1]}</code> הוא האיבר השני ברשימה - b.'
    },
    {
      code: 'function greet() {\n  local name=$1\n  echo "Hi $name"\n}\ngreet "Dana"',
      q: 'מה יודפס?',
      o: ['Hi Dana', 'Hi $1', 'Hi name', 'שגיאה - חסר return'],
      a: 0,
      w: '<code>$1</code> בתוך הפונקציה הוא הארגומנט הראשון שהועבר בקריאה - "Dana". <code>local name</code> מקבל את הערך ומשמש ב-echo.'
    },
    {
      code: 'num=10\nif [ $num -gt 5 ] && [ $num -lt 20 ]; then\n  echo "in range"\nelse\n  echo "out of range"\nfi',
      q: 'מה יודפס?',
      o: ['in range', 'out of range', 'שגיאת תחביר', 'שתי השורות יודפסו יחד'],
      a: 0,
      w: '10 גדול מ-5 וגם קטן מ-20 - שני התנאים אמת, ולכן ה-<code>&&</code> מאפשר כניסה לבלוק ה-if.'
    },
    {
      code: 'echo "start"\nfalse\necho "end"',
      q: 'איזה פלט יופיע (בלי set -e בתחילת הסקריפט)?',
      o: ['start ו-end - שתי השורות מודפסות', 'רק start', 'רק end', 'שגיאה שעוצרת את הסקריפט'],
      a: 0,
      w: 'בלי <code>set -e</code>, כישלון של פקודה (<code>false</code> מחזירה תמיד קוד חזרה 1) לא עוצר את הסקריפט - ההרצה ממשיכה לשורה הבאה כרגיל.'
    },
    {
      code: 'set -e\necho "start"\nfalse\necho "end"',
      q: 'מה קורה עכשיו, עם set -e בתחילת הסקריפט?',
      o: ['מודפס רק start, והסקריפט נעצר מיד אחרי כישלון false - end לא יודפס', 'מודפסות שתי השורות כרגיל', 'שגיאת תחביר על set -e', 'false לא נחשבת כישלון בכלל'],
      a: 0,
      w: '<code>set -e</code> גורם לסקריפט להיעצר מיד עם כישלון של כל פקודה (כאן <code>false</code>, שמחזירה קוד חזרה 1) - לכן "end" לא יודפס.'
    },
    {
      code: 'str="filename.tar.gz"\necho "${str%%.*}"',
      q: 'מה יודפס?',
      o: ['filename', 'filename.tar', 'gz', 'tar.gz'],
      a: 0,
      w: '<code>%%</code> מסיר את ההתאמה הארוכה ביותר מהסוף עד לנקודה הראשונה - נשאר רק filename.'
    },
    {
      code: 'echo "a b c" | awk \'{print $2}\'',
      q: 'מה יודפס?',
      o: ['b', 'a', 'a b c', 'שגיאה'],
      a: 0,
      w: 'awk מפצל כל שורה לעמודות לפי רווחים כברירת מחדל; <code>$2</code> הוא העמודה השנייה - b.'
    },
    {
      code: "echo 'one two three' | sed 's/two/2/'",
      q: 'מה יודפס?',
      o: ['one 2 three', 'one two three - בלי שינוי', 'one two 2', 'שגיאה'],
      a: 0,
      w: '<code>sed s/two/2/</code> מחליף את המופע הראשון של "two" ב-"2" בלבד - התוצאה: one 2 three.'
    },
    {
      code: 'for i in {1..3}; do\n  if [ $i -eq 2 ]; then\n    continue\n  fi\n  echo "num $i"\ndone',
      q: 'אילו שורות יודפסו?',
      o: ['num 1 ו-num 3 בלבד', 'num 1, num 2 ו-num 3', 'רק num 1', 'שגיאה'],
      a: 0,
      w: '<code>continue</code> מדלג על שאר הקוד באיטרציה כש-i שווה 2, כך ש-echo לא מורץ עבורו - יודפסו רק num 1 ו-num 3.'
    },
    {
      code: 'x="5"\ny="05"\nif [ "$x" -eq "$y" ]; then\n  echo "equal"\nelse\n  echo "not equal"\nfi',
      q: 'מה יודפס? (זכרו: -eq משווה מספרית)',
      o: ['equal', 'not equal', 'שגיאת תחביר', 'תלוי בלוקאל של המערכת'],
      a: 0,
      w: '<code>-eq</code> משווה כערכים מספריים, ולכן "5" ו-"05" שקולים מספרית (חמש), למרות שכמחרוזות הן שונות.'
    }
  ];

  /* ============================================================
     מצב 3 - השלמת סקריפט: קטע קוד עם ___ חסר, לבחור מה משלים אותו
     ============================================================ */
  var CMD_COMPLETE = [
    {
      code: 'if [ $age -ge 18 ]; then\n  echo "adult"\n___\n  echo "minor"\nfi',
      q: 'מה משלים את המבנה כדי להוסיף ענף חלופי כשהתנאי לא מתקיים?',
      o: ['<code>else</code>', '<code>elseif</code>', '<code>case</code>', '<code>default</code>'],
      a: 0,
      w: '<code>else</code> מריץ בלוק חלופי כשהתנאי הראשי כוזב. שימו לב: ב-Bash הצורה לענף נוסף היא <code>elif</code> ולא <code>elseif</code>.'
    },
    {
      code: 'for i in {1..5}; do\n  echo "$i"\n___',
      q: 'מה מסיים את בלוק לולאת ה-for?',
      o: ['<code>done</code>', '<code>end</code>', '<code>fi</code>', '<code>endfor</code>'],
      a: 0,
      w: 'לולאות for/while/until ב-Bash מסתיימות תמיד במילת המפתח <code>done</code>, בניגוד ל-if שמסתיים ב-<code>fi</code>.'
    },
    {
      code: 'count=1\n___ [ $count -le 3 ]; do\n  echo "$count"\n  ((count++))\ndone',
      q: 'מה משלים את תחילת לולאת while?',
      o: ['<code>while</code>', '<code>until</code>', '<code>for</code>', '<code>loop</code>'],
      a: 0,
      w: '<code>while [ תנאי ]; do ... done</code> מריצה את הבלוק כל עוד התנאי אמת - כאן כל עוד count קטן או שווה ל-3.'
    },
    {
      code: 'function add() {\n  ___ $(( $1 + $2 ))\n}\nresult=$(add 3 4)\necho "$result"',
      q: 'מה משלים את הפונקציה כדי ש-result יכיל את סכום הארגומנטים דרך command substitution?',
      o: ['<code>echo</code>', '<code>return</code>', '<code>exit</code>', '<code>print</code>'],
      a: 0,
      w: 'כדי "להחזיר" ערך מפונקציה שנתפס עם <code>$( )</code>, יש להדפיס אותו עם <code>echo</code> - הפלט הוא מה ש-command substitution תופס. <code>return</code> מוגבל לטווח 0-255 ומיועד ל-exit code בלבד, לא לערכים כלליים.'
    },
    {
      code: 'arr=(10 20 30)\necho "${arr[___]}"   # אמור להדפיס 30',
      q: 'מה משלים את הביטוי כדי להדפיס את האיבר האחרון (30)?',
      o: ['<code>2</code>', '<code>3</code>', '<code>-1</code>', '<code>last</code>'],
      a: 0,
      w: 'האינדקס האחרון של מערך בגודל 3 הוא 2 (האינדקסים הם 0, 1, 2). לשם השוואה: <code>${arr[-1]}</code> תקין ב-Bash 4.3 ומעלה ומחזיר גם הוא את האיבר האחרון, אבל האינדקס המספרי המפורש כאן הוא 2.'
    },
    {
      code: 'name="Dana"\ncase $name in\n  Dana|Dan)\n    echo "known"\n    ___\n  *)\n    echo "unknown"\n    ;;\nesac',
      q: 'מה משלים את סוף הבלוק הראשון ב-case?',
      o: ['<code>;;</code>', '<code>break</code>', '<code>done</code>', '<code>end</code>'],
      a: 0,
      w: 'כל ענף ב-case מסתיים ב-<code>;;</code> שמסמן ל-Bash לצאת מה-case בלי לבדוק את שאר התבניות, בדומה ל-break ב-switch של שפות אחרות.'
    },
    {
      code: 'file="report.txt"\nif [ ___ "$file" ]; then\n  echo "exists"\nfi',
      q: 'מה משלים את הבדיקה כדי לוודא שהקובץ קיים כקובץ רגיל?',
      o: ['<code>-f</code>', '<code>-d</code>', '<code>-x</code>', '<code>-z</code>'],
      a: 0,
      w: '<code>-f</code> בודק שהנתיב קיים והוא קובץ רגיל. <code>-d</code> בודק תיקייה, <code>-x</code> בודק הרשאת הרצה, ו-<code>-z</code> בודק מחרוזת ריקה.'
    },
    {
      code: 'total=0\nfor n in 1 2 3 4; do\n  total=$(( total ___ n ))\ndone\necho "$total"   # אמור להדפיס 10',
      q: 'מה משלים את הביטוי כדי שהתוצאה תהיה סכום המספרים?',
      o: ['<code>+</code>', '<code>-</code>', '<code>*</code>', '<code>/</code>'],
      a: 0,
      w: 'הצטברות סכום דורשת חיבור: total = total + n בכל איטרציה. עם <code>+</code> הפלט הסופי הוא 1+2+3+4 שווה 10.'
    },
    {
      code: 'while IFS= read -r line; do\n  echo "$line"\ndone ___ input.txt',
      q: 'מה משלים את הפקודה כדי לקרוא שורה-שורה מקובץ input.txt?',
      o: ['<code>&lt;</code>', '<code>&gt;</code>', '<code>|</code>', '<code>&lt;&lt;</code>'],
      a: 0,
      w: '<code>&lt;</code> מפנה (redirect) קובץ להיות ה-stdin של הלולאה, כך ש-read קוראת ממנו שורה-שורה. <code>&gt;</code> הייתה מפנה פלט, ו-<code>|</code> מחברת בין שתי פקודות בצנרת.'
    },
    {
      code: 'str="Hello World"\nif [[ $str ___ World* ]]; then\n  echo "match"\nfi',
      q: 'מה משלים את התנאי לבדיקת glob pattern matching בתוך [[ ]]?',
      o: ['<code>==</code>', '<code>-eq</code>', '<code>contains</code>', '<code>like</code>'],
      a: 0,
      w: 'בתוך <code>[[ ]]</code>, האופרטור <code>==</code> מבצע glob pattern matching (למשל <code>World*</code> תואם כל מחרוזת שמתחילה ב-World). <code>-eq</code> מיועד להשוואה מספרית בלבד.'
    },
    {
      code: 'echo "line1\\nline2\\nline3" | grep ___ "line2"',
      q: 'מה משלים את הפקודה כדי להציג רק את מספר השורות התואמות, בלי את תוכנן?',
      o: ['<code>-c</code>', '<code>-v</code>', '<code>-l</code>', '<code>-i</code>'],
      a: 0,
      w: '<code>-c</code> מדפיס ספירה של שורות תואמות בלבד. <code>-v</code> הופך את הסינון (מציג שורות שלא תואמות), ו-<code>-l</code> מדפיס רק שמות קבצים תואמים.'
    },
    {
      code: 'trap ___ EXIT\necho "doing work"',
      q: 'מה משלים את trap כדי שפונקציה בשם cleanup תרוץ אוטומטית ביציאה מהסקריפט?',
      o: ['<code>cleanup</code>', '<code>run cleanup</code>', '<code>call cleanup</code>', '<code>exec cleanup</code>'],
      a: 0,
      w: '<code>trap cleanup EXIT</code> רושם את הפונקציה cleanup להרצה אוטומטית כשהסקריפט מסתיים - בין אם בהצלחה, בכישלון, או אפילו ב-Ctrl+C. שימושי לניקוי קבצים זמניים.'
    },
    {
      code: 'set -___\nunset VAR\necho "$VAR"   # אמור לגרום לשגיאה ולעצור את הסקריפט',
      q: 'מה משלים את הדגל כדי שהסקריפט ייכשל על משתנה לא-מוגדר?',
      o: ['<code>u</code>', '<code>e</code>', '<code>x</code>', '<code>v</code>'],
      a: 0,
      w: '<code>set -u</code> (nounset) הופך שימוש במשתנה שלא הוגדר לשגיאה קטלנית. <code>set -e</code> עוצר על כישלון פקודה, ו-<code>set -x</code> מדפיס כל פקודה לפני הרצתה (debug trace).'
    }
  ];

  /* ============================================================
     מצב 4 - התאמת מושגים: סבבים של זוגות פקודה/מושג + תיאור
     ============================================================ */
  var MATCH_ROUNDS = [
    {
      title: 'חיפוש טקסט עם grep',
      pairs: [
        { l: '<code>grep -i "pattern" file</code>', r: 'חיפוש ללא הבחנה בין אותיות גדולות לקטנות (case-insensitive)' },
        { l: '<code>grep -v "pattern" file</code>', r: 'הצגת שורות שלא תואמות לתבנית' },
        { l: '<code>grep -r "pattern" dir/</code>', r: 'חיפוש רקורסיבי בכל הקבצים בתיקייה ותתי-התיקיות' },
        { l: '<code>grep -c "pattern" file</code>', r: 'הצגת ספירת שורות תואמות בלבד, בלי את תוכנן' },
        { l: '<code>grep -n "pattern" file</code>', r: 'הצגת מספר השורה לצד כל התאמה' }
      ]
    },
    {
      title: 'עריכת טקסט עם sed',
      pairs: [
        { l: "<code>sed 's/foo/bar/'</code>", r: 'החלפת המופע הראשון בלבד של foo ב-bar בכל שורה' },
        { l: "<code>sed 's/foo/bar/g'</code>", r: 'החלפת כל המופעים של foo ב-bar בכל שורה' },
        { l: "<code>sed -i 's/foo/bar/' file</code>", r: 'ביצוע ההחלפה בתוך הקובץ עצמו (in-place)' },
        { l: "<code>sed -n '2,4p' file</code>", r: 'הצגת שורות 2 עד 4 בלבד' },
        { l: "<code>sed '/pattern/d' file</code>", r: 'מחיקת כל השורות שמכילות את התבנית' }
      ]
    },
    {
      title: 'עיבוד עמודות עם awk',
      pairs: [
        { l: "<code>awk '{print $1}'</code>", r: 'הדפסת העמודה הראשונה בכל שורה' },
        { l: "<code>awk -F: '{print $1}'</code>", r: 'שימוש בתו נקודתיים כמפריד עמודות במקום רווח' },
        { l: "<code>awk 'NR==2'</code>", r: 'הצגת השורה השנייה בלבד, לפי מספר השורה' },
        { l: "<code>awk '{sum+=$1} END{print sum}'</code>", r: 'סכימת ערכי עמודה לאורך כל הקובץ והדפסת הסכום בסוף' },
        { l: "<code>awk -F',' '{print NF}'</code>", r: 'הדפסת מספר העמודות בכל שורה, לפי מפריד פסיק' }
      ]
    },
    {
      title: 'ניהול תהליכים ורקע',
      pairs: [
        { l: '<code>command &amp;</code>', r: 'הרצת הפקודה ברקע והחזרת שליטה מיידית ל-shell' },
        { l: '<code>jobs</code>', r: 'הצגת רשימת התהליכים הרצים ברקע בסשן הנוכחי' },
        { l: '<code>fg %1</code>', r: 'החזרת job מספר 1 מהרקע לחזית (foreground)' },
        { l: '<code>kill -9 &lt;pid&gt;</code>', r: 'שליחת סיגנל SIGKILL שמכריח את התהליך להיסגר מיד' },
        { l: '<code>nohup command &amp;</code>', r: 'הרצת פקודה ברקע שממשיכה לרוץ גם אחרי סגירת ה-terminal' }
      ]
    }
  ];

  /* ============================================================
     מצב 5 - סידור שלבים: סבבים של שלבים שצריך לסדר בסדר הנכון
     ============================================================ */
  var ORDER_ROUNDS = [
    {
      title: 'כתיבת סקריפט Bash תקין מאפס',
      steps: [
        'הוספת שורת shebang בתחילת הקובץ',
        'הוספת set -euo pipefail לעצירה בטוחה בשגיאות',
        'הגדרת משתנים ובדיקת הארגומנטים שהתקבלו',
        'כתיבת הלוגיקה הראשית - תנאים, לולאות ופונקציות',
        'מתן הרשאת הרצה לקובץ עם chmod',
        'הרצת הסקריפט ובדיקת קוד היציאה שלו'
      ]
    },
    {
      title: 'עיבוד קובץ לוג לאיתור שגיאות',
      steps: [
        'בדיקה שהקובץ קיים לפני שמנסים לקרוא ממנו',
        'קריאת הקובץ שורה-שורה בלולאת while נכונה',
        'סינון שורות שמכילות את המילה ERROR',
        'הגדלת משתנה מונה בכל התאמה שנמצאה',
        'הדפסת סיכום כולל של מספר השגיאות בסוף הריצה'
      ]
    },
    {
      title: 'כתיבת פונקציית debug עם טיפול בשגיאות',
      steps: [
        'הגדרת הפונקציה ומתן שם ברור לה',
        'הצהרת משתנים מקומיים בתוך הפונקציה',
        'בדיקת קוד ההחזרה של הפקודה שמורצת בפנים',
        'החזרת קוד שונה מאפס במקרה של כשל',
        'הוספת trap שמפעיל ניקוי משאבים ביציאה',
        'קריאה לפונקציה מהקוד הראשי והדפסת התוצאה'
      ]
    },
    {
      title: 'סקריפט deploy אוטומטי',
      steps: [
        'משיכת הגרסה העדכנית של הקוד',
        'הרצת בדיקות ו-lint לפני ההעברה לסביבה',
        'יצירת גיבוי לגרסה הנוכחית הרצה',
        'הרצת פקודת ההעברה בפועל של הקבצים החדשים',
        'בדיקת קוד היציאה של תהליך ההעברה',
        'רישום תוצאת ה-deploy ללוג ושליחת התראה'
      ]
    }
  ];

  /* ============================================================
     הגדרת מצבי המשחק
     ============================================================ */
  var MODES = [
    { key: 'rapid', icon: '⚡', name: 'קרב מהיר', desc: 'שאלות ידע כלליות על Bash - משתנים, תנאים, לולאות, פונקציות ומערכים. כמה תספיקו לפני שהזמן נגמר?', type: 'quiz', data: RAPID, sample: 8, time: 20000 },
    { key: 'output', icon: '🖥️', name: 'ניחוש פלט', desc: 'קטע סקריפט Bash - מה בדיוק יהיה הפלט שלו בטרמינל?', type: 'quiz', data: CODE_OUTPUT, sample: 8, time: 28000, showCode: true },
    { key: 'complete', icon: '🧩', name: 'השלמת סקריפט', desc: 'פקודה או סקריפט Bash עם חלק חסר - בחרו מה משלים אותו נכון', type: 'quiz', data: CMD_COMPLETE, sample: 8, time: 28000, showCode: true },
    { key: 'match', icon: '🔗', name: 'התאמת פקודות', desc: 'התאימו כל פקודת/מושג Bash לתיאור הנכון שלו', type: 'match', data: MATCH_ROUNDS, sample: 2 },
    { key: 'order', icon: '📋', name: 'סידור שלבים', desc: 'סדרו את שלבי כתיבת הסקריפט או התהליך לפי הסדר הנכון', type: 'order', data: ORDER_ROUNDS, sample: 2 }
  ];

  window.TG_CONFIG = { gameId: "bash", modes: MODES };
})();
</script>

<script src="/scripts/topic-game.js"></script>
