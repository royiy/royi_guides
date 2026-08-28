---
sidebar_position: 12
title: "מדריך 12 — משחק לימודי: אתגר PowerShell"
---

<!-- מדריך PowerShell בעברית | נבנה ללמידה, תרגול והכנה לראיונות -->

חמישה מצבי משחק שבודקים היבטים שונים של PowerShell - לא עוד חידון רב-ברירה, אלא משחק עם **טיימר**, **שלושה לבבות**, **מכפיל רצף** ו**שיא אישי** שנשמר בדפדפן. בסוף כל סבב תקבלו דירוג, ורשימת חזרה של בדיוק מה שפספסתם.


<div class="tg" id="tg" dir="rtl">
  <div class="tg-screen is-active" data-screen="menu">
    <div class="tg-hero">
      <div class="tg-hero-badge">PowerShell</div>
      <div class="tg-hero-title">אתגר PowerShell</div>
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
      q: 'מהי מוסכמת השם הבסיסית של כל cmdlet ב-PowerShell?',
      o: ['<code>Verb-Noun</code> (למשל <code>Get-Service</code>)', '<code>Noun-Verb</code> (למשל <code>Service-Get</code>)', 'camelCase חופשי לבחירת המפתח', 'אין מוסכמה קבועה - כל מפתח בוחר כרצונו'],
      a: 0,
      w: 'כל cmdlet בנוי מפועל מאושר ומ-noun ביחיד, מחוברים במקף - כמו <code>Get-Service</code> או <code>Start-Process</code>. המוסכמה הזו הופכת את השמות לצפויים ונחשפים דרך <code>Get-Command</code>.'
    },
    {
      q: 'איזו פקודה מציגה את רשימת הפעלים (Verbs) המאושרים לשימוש בשמות cmdlets?',
      o: ['<code>Get-Verb</code>', '<code>Get-Command</code>', '<code>Get-Help</code>', '<code>Get-Member</code>'],
      a: 0,
      w: '<code>Get-Verb</code> מציגה את רשימת הפעלים התקניים (Get, Set, New, Remove, Start, Stop ועוד) שמומלץ להשתמש בהם כדי לשמור על עקביות בכתיבת cmdlets ופונקציות.'
    },
    {
      q: 'מה ההבדל המרכזי בין PowerShell לבין shells מסורתיים כמו CMD?',
      o: ['PowerShell מעביר אובייקטים (.NET) בין פקודות ב-pipeline, ולא רק טקסט', 'אין הבדל אמיתי בין השניים', 'CMD תומך ב-pipeline של אובייקטים ו-PowerShell לא', 'PowerShell פועל רק על Linux'],
      a: 0,
      w: 'ב-CMD פלט הוא תמיד טקסט שצריך לפרסר. ב-PowerShell כל פקודה מחזירה אובייקטים אמיתיים עם properties ו-methods, שאפשר להעביר הלאה ב-pipeline בלי לפרק מחרוזות.'
    },
    {
      q: 'מה עושה הסימן <code>|</code> (pipe) ב-PowerShell?',
      o: ['מעביר את הפלט (האובייקטים) של פקודה אחת כקלט לפקודה הבאה', 'מבצע הערה (comment) בשורת קוד', 'משווה בין שני ערכים', 'מפצל פקודה אחת לשתי שורות'],
      a: 0,
      w: 'ה-pipe מחבר פקודות: הפלט של הפקודה שמשמאל לו הופך לקלט של הפקודה שמימין - למשל <code>Get-Process | Sort-Object CPU</code>.'
    },
    {
      q: 'איזו פקודה בודקת אילו properties ו-methods יש לאובייקט שמתקבל מ-pipeline?',
      o: ['<code>Get-Member</code>', '<code>Get-Object</code>', '<code>Get-Property</code>', '<code>Get-Type</code>'],
      a: 0,
      w: '<code>Get-Member</code> (בקיצור <code>gm</code>) חושפת בדיוק אילו properties ו-methods קיימים על אובייקט - כלי הכרחי כשלא בטוחים מה חוזר מ-cmdlet מסוים.'
    },
    {
      q: 'איך יוצרים משתנה חדש בשם <code>$name</code> עם הערך "Royi"?',
      o: ['<code>$name = "Royi"</code>', '<code>var name = "Royi"</code>', '<code>let name = "Royi"</code>', '<code>set name "Royi"</code>'],
      a: 0,
      w: 'כל משתנה ב-PowerShell מתחיל ב-<code>$</code>, וההגדרה היא פשוט השמה עם <code>=</code> - אין צורך להצהיר על טיפוס מראש (typing דינמי).'
    },
    {
      q: 'מה מחזירה הפקודה <code>$PSVersionTable.PSVersion</code>?',
      o: ['את גרסת ה-PowerShell המותקנת בסביבה הנוכחית', 'את גרסת מערכת ההפעלה Windows', 'את גרסת .NET Framework בלבד', 'שגיאה - אין פרמטר כזה'],
      a: 0,
      w: '<code>$PSVersionTable</code> הוא משתנה מובנה עם מידע על הסביבה - כולל <code>PSVersion</code> ו-<code>PSEdition</code> (Desktop מול Core), שימושי לבדוק תאימות לפני הרצת סקריפט.'
    },
    {
      q: 'מהי הדרך הפשוטה ליצור array עם שלושה מספרים?',
      o: ['<code>$arr = 1,2,3</code> (או <code>@(1,2,3)</code>)', '<code>$arr = [1,2,3]</code>', '<code>$arr = array(1,2,3)</code>', '<code>$arr = {1,2,3}</code>'],
      a: 0,
      w: 'פסיקים בין ערכים יוצרים array אוטומטית. <code>@(...)</code> הוא הסימון המפורש ל-array, ושימושי במיוחד כשרוצים להבטיח array גם עם איבר יחיד או ריק.'
    },
    {
      q: 'איך ניגשים לערך לפי מפתח בתוך <code>hashtable</code> בשם <code>$h</code>?',
      o: ['<code>$h["key"]</code> או <code>$h.key</code>', '<code>$h->key</code>', '<code>$h::key</code>', '<code>$h(key)</code>'],
      a: 0,
      w: 'hashtable ב-PowerShell (<code>@{ }</code>) תומך גם בגישה בסגנון מערך אסוציאטיבי <code>$h["key"]</code> וגם בגישת נקודה <code>$h.key</code> - שתיהן שקולות.'
    },
    {
      q: 'מה תפקיד בלוק <code>try / catch</code> ב-PowerShell?',
      o: ['לתפוס שגיאות terminating שקורות בתוך ה-try ולהריץ טיפול מותאם ב-catch', 'למנוע לחלוטין הרצת קוד', 'לחזור על אותו קוד עד שיצליח', 'זהה לחלוטין למבנה if/else'],
      a: 0,
      w: '<code>try/catch</code> עוצר את זרימת הקוד הרגילה כשקורית שגיאה terminating בתוך ה-try, ומעביר שליטה לבלוק ה-catch - כך אפשר לרשום, להתריע או להמשיך בצורה מבוקרת.'
    },
    {
      q: 'מה חייב לקרות כדי ש-catch יתפוס שגיאה מ-cmdlet שברירת המחדל שלו היא "non-terminating"?',
      o: ['להוסיף <code>-ErrorAction Stop</code> לפקודה, כדי להפוך את השגיאה ל-terminating', 'אין צורך בכלום - catch תופס הכל אוטומטית', 'להשתמש ב-<code>finally</code> במקום <code>catch</code>', 'להריץ את הפקודה פעמיים'],
      a: 0,
      w: 'רוב שגיאות ה-cmdlets הן non-terminating כברירת מחדל - הן נכתבות ל-error stream אבל הריצה ממשיכה. <code>-ErrorAction Stop</code> הופך אותן ל-terminating כדי ש-<code>catch</code> יוכל לתפוס אותן בכלל.'
    },
    {
      q: 'מה מחזיר <code>$_.Exception.Message</code> בתוך בלוק catch?',
      o: ['את תיאור השגיאה (הודעת החריגה) שקרתה', 'את מספר השורה שבה הקוד נכשל', 'את שם המשתמש שהריץ את הסקריפט', 'את משך זמן הריצה של הפקודה'],
      a: 0,
      w: 'בתוך <code>catch</code>, המשתנה האוטומטי <code>$_</code> (או <code>$PSItem</code>) מייצג את אובייקט השגיאה שנתפס, ו-<code>Exception.Message</code> הוא תיאור הטקסט שלה.'
    },
    {
      q: 'מהי הפקודה הבסיסית להרצת קוד מרחוק על שרת אחד או יותר?',
      o: ['<code>Invoke-Command</code>', '<code>Start-Remote</code>', '<code>Connect-Server</code>', '<code>Enter-Remote</code>'],
      a: 0,
      w: '<code>Invoke-Command -ComputerName ... -ScriptBlock { ... }</code> מריצה בלוק קוד בפועל על המחשב/השרת המרוחק ומחזירה את התוצאה למחשב המקומי.'
    },
    {
      q: 'מה כדאי לבדוק לפני שימוש ב-PowerShell Remoting מול שרת חדש?',
      o: ['שהשירות WinRM מופעל ונגיש, למשל עם <code>Test-WSMan</code>', 'שיש חיבור לאינטרנט', 'שהמשתמש הוא Domain Admin', 'שום דבר - זה עובד תמיד out of the box'],
      a: 0,
      w: 'Remoting מבוסס על WinRM שמאזין בדרך כלל על פורט 5985 (HTTP) או 5986 (HTTPS). <code>Test-WSMan</code> או <code>Test-NetConnection -Port 5985</code> מוודאים שהשירות פעיל ונגיש לפני שמנסים <code>Invoke-Command</code>.'
    },
    {
      q: 'מה עושה הפרמטר <code>-ErrorAction SilentlyContinue</code>?',
      o: ['מדכא את הצגת השגיאה וממשיך בהרצת הסקריפט', 'עוצר את הסקריפט מיידית', 'הופך שגיאה רגילה לשגיאה חמורה (terminating)', 'כותב את השגיאה אוטומטית לקובץ log'],
      a: 0,
      w: '<code>SilentlyContinue</code> שימושי כשידוע מראש ששגיאה מסוימת אפשרית ולא קריטית (למשל קובץ שאולי לא קיים) - הריצה ממשיכה בלי להציג את השגיאה למשתמש.'
    },
    {
      q: 'מה ההבדל בין <code>Write-Output</code> ל-<code>Write-Host</code>?',
      o: ['<code>Write-Output</code> מחזיר אובייקט ל-pipeline שניתן ללכוד ולהעביר הלאה; <code>Write-Host</code> כותב ישירות למסך בלבד', 'אין הבדל מעשי בין השניים', '<code>Write-Host</code> תמיד מהיר משמעותית', '<code>Write-Output</code> לא ניתן לשימוש בתוך סקריפטים'],
      a: 0,
      w: 'פלט מ-<code>Write-Host</code> הולך ישירות לקונסולה ולא ניתן ללכידה או להעברה ב-pipeline, ולכן הוא מתאים רק להודעות תצוגה. <code>Write-Output</code> (או פשוט השארת ערך ללא הצבה) הוא מה שבאמת מזרים נתונים לפקודה הבאה.'
    }
  ];

  /* ============================================================
     מצב 2 - ניחוש פלט: קטע קוד PowerShell + מה יהיה הפלט/מה קורה בפועל
     ============================================================ */
  var OUTPUT_GUESS = [
    {
      code: '$x = "5"\n$y = 3\n$x + $y',
      q: 'מה יהיה הפלט של השורה האחרונה?',
      o: ['<code>"53"</code> - קונקטנציה של מחרוזות, כי הצד השמאלי הוא string', '<code>8</code> - חיבור מספרי רגיל', 'שגיאה - אי אפשר לחבר string למספר', '<code>0</code>'],
      a: 0,
      w: 'כשהאופרנד השמאלי של <code>+</code> הוא string, PowerShell מבצע קונקטנציה ולא חיבור מספרי - גם אם האופרנד הימני הוא מספר. <code>3 + "5"</code> (בסדר הפוך) דווקא כן יחזיר <code>8</code>, כי אז השמאלי הוא int.'
    },
    {
      code: 'Get-Process notepad | Stop-Process',
      q: 'מה קורה בהרצת השורה הזו (בהנחה שיש תהליכי notepad פתוחים)?',
      o: ['תהליכי notepad מאותרים ומועברים ב-pipeline אל <code>Stop-Process</code> שמסיימת אותם', 'מודפסת רשימת התהליכים בלבד, בלי לסגור כלום', 'נפתח תהליך notepad חדש', 'שגיאה - אי אפשר לצנרר אובייקטי process'],
      a: 0,
      w: '<code>Get-Process</code> מחזירה אובייקטי Process, ו-<code>Stop-Process</code> יודעת לקבל אותם ישירות דרך ה-pipeline (ParameterBinding לפי property) ולסגור את התהליכים המתאימים.'
    },
    {
      code: '$services = Get-Service\n$services.Count',
      q: 'מה יחזיר <code>$services.Count</code>?',
      o: ['את מספר האובייקטים (Services) שהוחזרו מ-<code>Get-Service</code>', 'תמיד את הערך 1', 'שגיאה - ל-Get-Service אין collection', 'את שם השירות הראשון בלבד'],
      a: 0,
      w: '<code>Get-Service</code> ללא פרמטרים מחזירה collection של כל השירותים במערכת, ול-collection יש property בשם <code>Count</code> שמציג כמה איברים יש בה.'
    },
    {
      code: '1..5 | ForEach-Object { $_ * 2 }',
      q: 'מה יהיה הפלט?',
      o: ['<code>2 4 6 8 10</code> - כל מספר בטווח מוכפל ב-2', '<code>1 2 3 4 5</code> ללא שינוי', 'שגיאה - <code>$_</code> אינו מוגדר', '<code>10</code> בלבד (סכום הכפלות)'],
      a: 0,
      w: '<code>1..5</code> יוצר טווח מספרים, ו-<code>$_</code> בתוך <code>ForEach-Object</code> מייצג בכל איטרציה את הפריט הנוכחי שעובר ב-pipeline - כך שכל מספר מוכפל בנפרד.'
    },
    {
      code: 'try {\n    Get-Item "C:\\NoSuchFile.txt" -ErrorAction Stop\n} catch {\n    "נתפס: $($_.Exception.Message)"\n}',
      q: 'מה קורה כאן אם הקובץ לא קיים בפועל?',
      o: ['השגיאה נתפסת בבלוק <code>catch</code>, ומודפסת הודעה מותאמת אישית עם פרטי השגיאה', 'הסקריפט קורס לגמרי בלי הודעה', 'שום דבר לא קורה - <code>-ErrorAction Stop</code> מדכא שגיאות', '<code>catch</code> לא ירוץ כי אין <code>try</code> תואם'],
      a: 0,
      w: '<code>-ErrorAction Stop</code> הופך את השגיאה (שברירת המחדל שלה non-terminating) ל-terminating, כך שהיא "נופלת" לבלוק <code>catch</code> במקום רק להידפס ל-error stream ולהמשיך הלאה.'
    },
    {
      code: 'Get-Service | Where-Object Status -eq \'Running\' | Select-Object Name',
      q: 'מה יהיה הפלט?',
      o: ['רשימת שמות (Name) בלבד של שירותים שה-Status שלהם Running', 'כל השירותים במערכת בלי שום סינון', 'שירות בודד תמיד', 'שגיאה - <code>Where-Object</code> דורש scriptblock מלא בסוגריים מסולסלים'],
      a: 0,
      w: 'מאז PowerShell 3.0 אפשר לכתוב <code>Where-Object</code> בתחביר מקוצר (property-comparison) בלי <code>{ $_.Status -eq ... }</code> מלא. <code>Select-Object Name</code> אז מצמצם את הפלט לעמודת Name בלבד.'
    },
    {
      code: 'function Get-Double($n) { return $n * 2 }\nGet-Double 5',
      q: 'מה יהיה הפלט?',
      o: ['<code>10</code>', '<code>5</code>', 'שגיאה - חובה להצהיר <code>[int]$n</code> מראש', '<code>25</code>'],
      a: 0,
      w: 'הפונקציה מקבלת ארגומנט positional ראשון כ-<code>$n</code> (גם בלי הצהרת טיפוס), ומחזירה את הכפלתו ב-2. הקריאה <code>Get-Double 5</code> שקולה ל-<code>Get-Double -n 5</code>.'
    },
    {
      code: '$arr = @(1,2,3)\n$arr += 4\n$arr',
      q: 'מה יהיה הפלט?',
      o: ['<code>1 2 3 4</code> - נוצר array חדש עם כל 4 האיברים', 'שגיאה - אי אפשר להוסיף איבר ל-array', '<code>1 2 3</code> בלבד - ה-4 לא נוסף בפועל', '<code>4</code> בלבד'],
      a: 0,
      w: 'arrays ב-.NET הם בגודל קבוע - <code>+=</code> לא "מוסיף" לאותו array בפועל, אלא יוצר array חדש עם התוכן הישן + הערך החדש ומצביע את <code>$arr</code> אליו. עבור הוספות רבות עדיף <code>System.Collections.Generic.List</code>.'
    },
    {
      code: '"Hello" -eq "hello"',
      q: 'מה יהיה הפלט?',
      o: ['<code>True</code> - כי <code>-eq</code> על מחרוזות הוא case-insensitive כברירת מחדל', '<code>False</code>', 'שגיאה - אי אפשר להשוות מחרוזות עם רישיות שונה', '<code>"Hello"</code>'],
      a: 0,
      w: 'אופרטורי השוואה כמו <code>-eq</code>, <code>-like</code>, <code>-match</code> אינם מבחינים בין רישיות כברירת מחדל. כדי לאכוף רגישות לרישיות משתמשים בגרסה עם קידומת <code>c</code>, כמו <code>-ceq</code>.'
    },
    {
      code: 'Get-Content C:\\numbers.txt | Measure-Object -Line',
      q: 'מה מציגה הפקודה הזו?',
      o: ['אובייקט עם מספר השורות (<code>Lines</code>) בקובץ', 'את תוכן הקובץ בלבד, בלי עיבוד', 'את הממוצע של המספרים שבקובץ', 'שגיאה - <code>Measure-Object</code> לא עובד עם pipeline'],
      a: 0,
      w: '<code>Measure-Object -Line</code> סופר כמה שורות עברו ב-pipeline ומחזירה אובייקט עם property בשם <code>Lines</code>. לחישוב סטטיסטי על מספרים משתמשים ב-<code>-Sum</code>/<code>-Average</code> וכדומה.'
    },
    {
      code: '$name = $null\nif ($name) { "יש ערך" } else { "אין ערך" }',
      q: 'מה יהיה הפלט?',
      o: ['<code>"אין ערך"</code> - כי <code>$null</code> מוערך כ-false בתנאי', '<code>"יש ערך"</code>', 'שגיאה - אי אפשר לבדוק <code>$null</code> בתנאי if', '<code>"0"</code>'],
      a: 0,
      w: 'ב-boolean context, <code>$null</code>, מחרוזת ריקה, 0 ומערך ריק כולם מוערכים כ-<code>$false</code>. לכן הענף שרץ הוא ה-<code>else</code>.'
    },
    {
      code: 'Invoke-Command -ComputerName SRV01 -ScriptBlock { Get-Date }',
      q: 'מה קורה בהרצה הזו (בהנחה ש-Remoting מוגדר תקין מול SRV01)?',
      o: ['בלוק הקוד רץ בפועל על השרת SRV01, והתוצאה (התאריך שם) חוזרת למחשב המקומי', 'הבלוק רץ על המחשב המקומי בלבד, כאילו לא צוין -ComputerName', 'נוצר קובץ חדש בשם SRV01', 'שגיאה תמיד - אי אפשר להריץ Get-Date מרחוק'],
      a: 0,
      w: '<code>Invoke-Command -ComputerName</code> פותחת חיבור WinRM לשרת המרוחק, מריצה שם את ה-ScriptBlock במלואו, ומחזירה את תוצאת ההרצה (כולל מטא-דאטה כמו <code>PSComputerName</code>) בחזרה למחשב הקורא.'
    },
    {
      code: '"abc" | Get-Member -MemberType Method',
      q: 'מה מציגה הפקודה הזו?',
      o: ['את רשימת ה-methods הזמינים על אובייקט מסוג string (כמו <code>ToUpper</code>, <code>Substring</code>)', 'את התוכן של המחרוזת "abc"', 'שגיאה - מחרוזות אינן אובייקטים ב-PowerShell', 'רק את שם הטיפוס (<code>System.String</code>) בלי פרטים נוספים'],
      a: 0,
      w: 'הכל ב-PowerShell הוא אובייקט .NET - גם מחרוזת. <code>Get-Member -MemberType Method</code> מסנן ומציג רק את ה-methods (בניגוד ל-properties) הזמינים על אותו טיפוס.'
    }
  ];

  /* ============================================================
     מצב 3 - השלמת קוד: קטע קוד PowerShell עם חלק חסר (___)
     ============================================================ */
  var CMD_COMPLETE = [
    {
      code: '$x ___ "hello"',
      q: 'מה משלים את השורה כדי להגדיר משתנה בשם <code>$x</code> עם הערך "hello"?',
      o: ['<code>=</code>', '<code>==</code>', '<code>-></code>', '<code>:=</code>'],
      a: 0,
      w: 'השמת ערך למשתנה ב-PowerShell נעשית עם סימן <code>=</code> יחיד, בדיוק כמו בשפות תכנות רבות אחרות.'
    },
    {
      code: 'Get-Process ___ Stop-Process',
      q: 'מה משלים את הפקודה כדי להעביר את הפלט של <code>Get-Process</code> כקלט ל-<code>Stop-Process</code>?',
      o: ['<code>|</code>', '<code>;</code>', '<code>&amp;&amp;</code>', '<code>&gt;&gt;</code>'],
      a: 0,
      w: 'ה-pipe (<code>|</code>) הוא המנגנון הבסיסי להעברת אובייקטים בין פקודות ב-PowerShell.'
    },
    {
      code: 'function Get-Square {\n    param(\n        [Parameter(___)]\n        [int]$Number\n    )\n    return $Number * $Number\n}',
      q: 'מה משלים את התכונה כדי להפוך את הפרמטר <code>$Number</code> לפרמטר חובה?',
      o: ['<code>Mandatory</code>', '<code>Required</code>', '<code>Force</code>', '<code>NotNull</code>'],
      a: 0,
      w: '<code>[Parameter(Mandatory)]</code> (או <code>Mandatory=$true</code>) גורם ל-PowerShell לבקש את הערך אינטראקטיבית אם לא סופק, או לזרוק שגיאה ברורה - במקום להמשיך עם ערך ריק.'
    },
    {
      code: 'try {\n    Remove-Item "C:\\temp\\file.txt" -ErrorAction Stop\n}\n___ {\n    Write-Warning "מחיקה נכשלה"\n}',
      q: 'מה משלים את מבנה הטיפול בשגיאות?',
      o: ['<code>catch</code>', '<code>except</code>', '<code>error</code>', '<code>on</code>'],
      a: 0,
      w: 'המילה השמורה לתפיסת שגיאה אחרי בלוק <code>try</code> ב-PowerShell היא <code>catch</code> (בדומה ל-C#/Java, ולא <code>except</code> כמו ב-Python).'
    },
    {
      code: 'Get-Service | Where-Object { $_.Status ___ \'Stopped\' }',
      q: 'מה משלים את התנאי כדי לסנן שירותים שהסטטוס שלהם שווה בדיוק ל-Stopped?',
      o: ['<code>-eq</code>', '<code>-equal</code>', '<code>==</code>', '<code>is</code>'],
      a: 0,
      w: 'PowerShell משתמש באופרטורים מבוססי מקף כמו <code>-eq</code>, <code>-ne</code>, <code>-gt</code>, <code>-lt</code> להשוואות - לא בסימנים כמו <code>==</code> מוכרים משפות אחרות.'
    },
    {
      code: '$servers = "SRV01","SRV02"\n___ ($s in $servers) { Write-Host $s }',
      q: 'מה משלים את הלולאה שעוברת על כל איבר במערך <code>$servers</code>?',
      o: ['<code>foreach</code>', '<code>for</code>', '<code>while</code>', '<code>each</code>'],
      a: 0,
      w: '<code>foreach ($item in $collection) { ... }</code> היא הצורה הסטנדרטית לעבור על כל איברי collection ב-PowerShell.'
    },
    {
      code: 'Get-ADUser -Filter ___ -Properties PasswordNeverExpires',
      q: 'מה משלים את הפקודה כדי להביא את כל המשתמשים ב-Active Directory בלי סינון ספציפי?',
      o: ['<code>*</code>', '<code>All</code>', '<code>-All</code>', '<code>Everyone</code>'],
      a: 0,
      w: '<code>-Filter *</code> ב-<code>Get-ADUser</code> מחזיר את כל האובייקטים מסוג משתמש, ללא תנאי סינון. לסינון ממוקד משתמשים בביטוי כמו <code>-Filter \'Enabled -eq $true\'</code>.'
    },
    {
      code: 'Import-Module ___',
      q: 'מה משלים את הפקודה כדי לטעון את המודול שמאפשר עבודה עם Active Directory (כמו <code>Get-ADUser</code>)?',
      o: ['<code>ActiveDirectory</code>', '<code>AD</code>', '<code>ADModule</code>', '<code>DomainServices</code>'],
      a: 0,
      w: 'המודול הרשמי (חלק מ-RSAT) נקרא <code>ActiveDirectory</code>. אחרי טעינתו עם <code>Import-Module ActiveDirectory</code> נחשפים כל ה-cmdlets בעלי הקידומת AD, כמו <code>Get-ADUser</code> ו-<code>New-ADUser</code>.'
    },
    {
      code: 'function Get-ServerHealth {\n    [CmdletBinding()]\n    param(\n        [Parameter(Mandatory, ValueFromPipeline)]\n        [string[]]$ComputerName\n    )\n    ___ {\n        foreach ($computer in $ComputerName) {\n            Test-Connection $computer -Count 1 -Quiet\n        }\n    }\n}',
      q: 'איזה בלוק צריך להשלים כדי שהפונקציה תעבד כל פריט שמגיע דרך ה-pipeline בנפרד?',
      o: ['<code>process</code>', '<code>begin</code>', '<code>end</code>', '<code>run</code>'],
      a: 0,
      w: 'בלוק <code>process</code> רץ פעם אחת עבור כל פריט שמגיע דרך ה-pipeline כש-<code>ValueFromPipeline</code> מוגדר. <code>begin</code> רץ פעם אחת בהתחלה, ו-<code>end</code> פעם אחת בסוף.'
    },
    {
      code: '$result = Invoke-Command -ComputerName SRV01 ___ { Get-Service Spooler }',
      q: 'מה משלים את הפקודה כדי להעביר את בלוק הקוד שירוץ על השרת המרוחק?',
      o: ['<code>-ScriptBlock</code>', '<code>-Command</code>', '<code>-Block</code>', '<code>-Script</code>'],
      a: 0,
      w: 'הפרמטר <code>-ScriptBlock</code> מקבל את הקוד (בתוך <code>{ }</code>) שירוץ בפועל על המחשב המרוחק דרך <code>Invoke-Command</code>.'
    },
    {
      code: '"hello world"___ToUpper()',
      q: 'מה משלים את הקוד כדי לקרוא ל-method שהופך את המחרוזת לאותיות גדולות?',
      o: ['<code>.</code> (נקודה)', '<code>::</code>', '<code>-></code>', '<code>|</code>'],
      a: 0,
      w: 'קריאה ל-method של אובייקט נעשית עם נקודה - <code>"hello world".ToUpper()</code>. שתי נקודתיים (<code>::</code>) משמשות לקריאה ל-static methods של מחלקת .NET, לא של instance.'
    },
    {
      code: 'Test-NetConnection SERVER01 -Port 5985 -InformationLevel ___',
      q: 'מה משלים את הפקודה כדי לקבל תוצאה מקוצרת (True/False בלבד) במקום דוח מלא?',
      o: ['<code>Quiet</code>', '<code>Short</code>', '<code>Minimal</code>', '<code>Silent</code>'],
      a: 0,
      w: '<code>-InformationLevel Quiet</code> גורם ל-<code>Test-NetConnection</code> להחזיר רק ערך בוליאני שמציין אם הבדיקה הצליחה, במקום דוח מפורט על כל שלבי הבדיקה.'
    },
    {
      code: '$h = @{ Name = "Royi"; Role = "Admin" }\n$h___Name',
      q: 'מה משלים את הגישה לערך של המפתח <code>Name</code> בתוך ה-hashtable <code>$h</code>?',
      o: ['<code>.</code> (נקודה) - <code>$h.Name</code>', '<code>-></code>', '<code>::</code>', 'רק <code>["Name"]</code>, אין תחביר עם נקודה'],
      a: 0,
      w: 'hashtable ב-PowerShell תומך גם בגישת נקודה (<code>$h.Name</code>) וגם בסוגריים מרובעים (<code>$h["Name"]</code>) - שתי הצורות תקינות ושקולות.'
    }
  ];

  /* ============================================================
     מצב 4 - התאמת מושגים: סבבים של זוגות cmdlet/מושג + תיאור
     ============================================================ */
  var MATCH_ROUNDS = [
    {
      title: 'פקודות גילוי ובסיס',
      pairs: [
        { l: '<code>Get-Command</code>', r: 'מאתרת cmdlets, functions ופקודות זמינות במערכת' },
        { l: '<code>Get-Help</code>', r: 'מציגה תיעוד ודוגמאות שימוש לפקודה' },
        { l: '<code>Get-Member</code>', r: 'מציגה את המאפיינים (Properties) והפעולות (Methods) של אובייקט' },
        { l: '<code>Get-Verb</code>', r: 'מציגה את רשימת הפעלים המאושרים לשמות cmdlets' },
        { l: '<code>$PSVersionTable</code>', r: 'משתנה מובנה שמציג את גרסת PowerShell המותקנת' }
      ]
    },
    {
      title: 'קבצים, תהליכים ו-Services',
      pairs: [
        { l: '<code>Get-ChildItem</code>', r: 'מציגה קבצים ותיקיות בנתיב נתון' },
        { l: '<code>Get-Process</code>', r: 'מציגה תהליכים רצים במערכת' },
        { l: '<code>Stop-Process</code>', r: 'מסיימת תהליך רץ לפי שם או מזהה' },
        { l: '<code>Get-Service</code>', r: 'מציגה את השירותים (Services) במערכת ואת הסטטוס שלהם' },
        { l: '<code>Select-String</code>', r: 'מחפשת תבנית טקסט בתוך תוכן קבצים' }
      ]
    },
    {
      title: 'Error Handling ו-Remoting',
      pairs: [
        { l: '<code>try / catch / finally</code>', r: 'מבנה לתפיסת שגיאות וטיפול בהן בצורה מבוקרת' },
        { l: '<code>-ErrorAction Stop</code>', r: 'הופך שגיאה רגילה לשגיאת terminating שניתן לתפוס ב-catch' },
        { l: '<code>Invoke-Command</code>', r: 'מריצה קוד מרחוק על שרת אחד או יותר' },
        { l: '<code>Test-WSMan</code>', r: 'בודקת האם שירות WinRM זמין ומגיב על שרת מסוים' },
        { l: '<code>$_.Exception.Message</code>', r: 'מחזירה את תיאור השגיאה הנוכחית בתוך בלוק catch' }
      ]
    },
    {
      title: 'Objects, Pipeline ו-Variables',
      pairs: [
        { l: '<code>Where-Object</code>', r: 'מסננת אובייקטים שעוברים ב-pipeline לפי תנאי' },
        { l: '<code>Select-Object</code>', r: 'בוחרת מאפיינים ספציפיים מתוך אובייקט, או מגבילה כמות תוצאות' },
        { l: '<code>Sort-Object</code>', r: 'ממיינת אובייקטים לפי מאפיין מסוים' },
        { l: '<code>ForEach-Object</code>', r: 'מריצה בלוק קוד על כל אובייקט שעובר ב-pipeline' },
        { l: '<code>[pscustomobject]</code>', r: 'יוצר אובייקט מותאם אישית עם מאפיינים שמוגדרים מראש' }
      ]
    }
  ];

  /* ============================================================
     מצב 5 - סידור שלבים: סבבים של שלבים שצריך לסדר בסדר הנכון
     ============================================================ */
  var ORDER_ROUNDS = [
    {
      title: 'כתיבת function בסיסית מאפס ועד הרצה',
      steps: [
        'פתיחת קובץ סקריפט חדש (.ps1) בעורך',
        'הגדרת הפונקציה עם function Get-Something { ... }',
        'הוספת בלוק param() עם הפרמטרים הנדרשים',
        'כתיבת הלוגיקה בגוף הפונקציה',
        'שמירת הקובץ והרצתו (dot-sourcing) עם . .\\script.ps1',
        'קריאה לפונקציה עם הפרמטרים המתאימים'
      ]
    },
    {
      title: 'בניית Advanced Function עם CmdletBinding ו-Pipeline',
      steps: [
        'הוספת [CmdletBinding()] מעל param()',
        'הגדרת פרמטר עם [Parameter(Mandatory, ValueFromPipeline)]',
        'הוספת בלוק begin { } לאתחול משתנים',
        'הוספת בלוק process { } לטיפול בכל פריט שמגיע מה-pipeline',
        'הוספת בלוק end { } לסיכום או פלט סופי',
        'בדיקת הפונקציה עם ערכים שמגיעים דרך pipe'
      ]
    },
    {
      title: 'טיפול בשגיאות בסקריפט Production',
      steps: [
        'עטיפת הקוד הרגיש בבלוק try',
        'הוספת -ErrorAction Stop לפקודות שצריך לתפוס את השגיאה שלהן',
        'כתיבת בלוק catch עם טיפול או רישום מתאים',
        'שימוש ב-$_.Exception.Message להצגת פרטי השגיאה',
        'הוספת בלוק finally לניקוי משאבים שתמיד צריך לרוץ'
      ]
    },
    {
      title: 'בניית module ואריזתו לשימוש חוזר',
      steps: [
        'יצירת תיקייה בשם המודול עם קובץ .psm1 בתוכה',
        'כתיבת הפונקציות הרצויות בתוך קובץ ה-.psm1',
        'שימוש ב-Export-ModuleMember כדי לחשוף רק את הפונקציות הרצויות',
        'הוספת קובץ manifest (.psd1) עם New-ModuleManifest',
        'מיקום התיקייה באחד מנתיבי $env:PSModulePath',
        'טעינת המודול עם Import-Module ושימוש בפונקציות שלו'
      ]
    },
    {
      title: 'אבחון והרצת פקודה מרוחקת על שרת',
      steps: [
        'בדיקת זמינות השרת ברשת עם Test-Connection',
        'בדיקת שירות WinRM עם Test-WSMan או Test-NetConnection -Port 5985',
        'יצירת session מרוחק עם New-PSSession (או שימוש ישיר ב-Invoke-Command)',
        'הרצת בלוק קוד מרחוק עם Invoke-Command -ScriptBlock',
        'קבלת התוצאות חזרה למחשב המקומי וניתוחן',
        'סגירת ה-session עם Remove-PSSession כדי לשחרר משאבים'
      ]
    }
  ];

  /* ============================================================
     הגדרת מצבי המשחק
     ============================================================ */
  var MODES = [
    { key: 'rapid', icon: '⚡', name: 'קרב מהיר', desc: 'שאלות ידע כלליות על PowerShell - כמה תספיקו לפני שהזמן נגמר?', type: 'quiz', data: RAPID, sample: 8, time: 20000 },
    { key: 'output', icon: '🔎', name: 'ניחוש פלט', desc: 'קטע קוד PowerShell - מה בדיוק יהיה הפלט או מה יקרה בפועל?', type: 'quiz', data: OUTPUT_GUESS, sample: 8, time: 28000, showCode: true },
    { key: 'cmd', icon: '🧩', name: 'השלמת קוד', desc: 'קוד PowerShell עם חלק חסר - בחרו מה משלים אותו נכון', type: 'quiz', data: CMD_COMPLETE, sample: 8, time: 28000, showCode: true },
    { key: 'match', icon: '🔗', name: 'התאמת מושגים', desc: 'התאימו כל cmdlet/מושג PowerShell לתיאור הנכון שלו', type: 'match', data: MATCH_ROUNDS, sample: 2 },
    { key: 'order', icon: '📋', name: 'סידור שלבים', desc: 'סדרו את שלבי הבנייה/התהליך לפי הסדר הנכון', type: 'order', data: ORDER_ROUNDS, sample: 2 }
  ];

  window.TG_CONFIG = { gameId: "powershell", modes: MODES };
})();
</script>

<script src="/scripts/topic-game.js"></script>
