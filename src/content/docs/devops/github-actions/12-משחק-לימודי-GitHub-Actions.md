---
title: "משחק לימודי: אתגר GitHub Actions"
category: DevOps/GitHub Actions
part: 12/10
description: "משחק אינטראקטיבי ללימוד GitHub Actions - חמישה מצבי משחק עם טיימר, לבבות, ניקוד ורצפים: קרב מהיר, ניחוש התנהגות workflow, השלמת YAML, התאמת מושגים וסידור workflow."
---

חמישה מצבי משחק שבודקים היבטים שונים של GitHub Actions - לא עוד חידון רב-ברירה, אלא משחק עם **טיימר**, **שלושה לבבות**, **מכפיל רצף** ו**שיא אישי** שנשמר בדפדפן. בסוף כל סבב תקבלו דירוג, ורשימת חזרה של בדיוק מה שפספסתם.


<div class="tg" id="tg" dir="rtl">
  <div class="tg-screen is-active" data-screen="menu">
    <div class="tg-hero">
      <div class="tg-hero-badge">GitHub Actions</div>
      <div class="tg-hero-title">אתגר GitHub Actions</div>
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
      q: 'מה ההבדל בין <code>on: push</code> לבין <code>on: pull_request</code> כטריגר להרצת workflow?',
      o: ['<code>push</code> מופעל בכל דחיפת commits לענף (גם בלי PR), ו-<code>pull_request</code> מופעל בפתיחה/עדכון של Pull Request', 'אין הבדל, אלו כינויים לאותו טריגר', '<code>push</code> עובד רק על הענף main', '<code>pull_request</code> דורש תמיד אישור ידני לפני שירוץ'],
      a: 0,
      w: '<code>push</code> מגיב לדחיפת commits ישירות לענף, בעוד <code>pull_request</code> מגיב לאירועים סביב PR (פתיחה, עדכון, סגירה) - שני טריגרים נפרדים שיכולים לחיות זה לצד זה באותו workflow.'
    },
    {
      q: 'מה עושה הטריגר <code>workflow_dispatch</code>?',
      o: ['מאפשר הפעלה ידנית של ה-workflow דרך ממשק GitHub או ה-API, לרוב עם inputs מותאמים אישית', 'מפעיל את ה-workflow אוטומטית בכל push', 'מפעיל את ה-workflow רק לפי לוח זמנים (cron)', 'מבטל workflows שרצים כרגע'],
      a: 0,
      w: '<code>workflow_dispatch</code> מוסיף כפתור "Run workflow" בטאב Actions, ומאפשר גם להריץ דרך REST API - שימושי לפעולות שרוצים לשלוט בהן ידנית, כמו deployment.'
    },
    {
      q: 'כמה jobs רצים במקביל כברירת מחדל כשאין <code>needs</code> ביניהם?',
      o: ['כל ה-jobs רצים במקביל, עד למגבלת המקביליות של החשבון', 'תמיד job אחד בכל פעם, לפי סדר כתיבה', 'רק שני jobs יכולים לרוץ במקביל', 'jobs רצים במקביל רק אם יש להם runs-on זהה'],
      a: 0,
      w: 'ללא <code>needs</code> מפורש, GitHub מריץ את כל ה-jobs באותו workflow במקביל ככל האפשר - <code>needs</code> הוא הדרך היחידה ליצור תלות וסדר ריצה.'
    },
    {
      q: 'מה עושה <code>needs: [build, test]</code> בהגדרת job?',
      o: ['גורם ל-job להמתין שה-jobs build ו-test יסתיימו בהצלחה לפני שהוא מתחיל', 'מריץ את build ו-test בתוך ה-job הנוכחי', 'מוחק את ה-jobs build ו-test', 'מדלג על ה-job הנוכחי אם build ו-test קיימים'],
      a: 0,
      w: '<code>needs</code> יוצר גרף תלויות בין jobs - ה-job שמגדיר אותו לא יתחיל עד שכל ה-jobs שברשימה יסתיימו בהצלחה (success).'
    },
    {
      q: 'מה ההבדל בין <code>run</code> ל-<code>uses</code> בתוך step?',
      o: ['<code>run</code> מריץ פקודת shell ישירה; <code>uses</code> מפעיל Action מוכן (ממארקטפלייס, מריפו אחר, או מקומי)', '<code>run</code> מפעיל Action מוכן, ו-<code>uses</code> מריץ פקודת shell', 'שתיהן זהות לחלוטין', '<code>uses</code> עובד רק על self-hosted runners'],
      a: 0,
      w: 'כל step חייב להשתמש באחד מהשניים: <code>run</code> להרצת פקודות (bash, PowerShell וכו\'), או <code>uses</code> להפעלת Action ארוז מראש.'
    },
    {
      q: 'מה ההבדל העיקרי בין <code>secrets</code> ל-<code>vars</code>?',
      o: ['<code>secrets</code> מוצפנים ומוסתרים בלוגים למידע רגיש; <code>vars</code> הם ערכי קונפיגורציה גלויים ולא רגישים', 'אין הבדל מעשי בין השניים', '<code>vars</code> זמינים רק ב-self-hosted runners', '<code>secrets</code> נגישים גם ל-workflows מ-fork חיצוני'],
      a: 0,
      w: 'הכלל: כל דבר שאסור שייראה בלוג הוא <code>secrets.NAME</code>; כל דבר אחר שהוא קונפיגורציה גלויה (שם סביבה, URL) הוא <code>vars.NAME</code>.'
    },
    {
      q: 'מה זה <code>GITHUB_TOKEN</code>?',
      o: ['טוקן אוטומטי שנוצר לכל הרצת workflow, לגישה מבוקרת ל-API של הריפו, בלי צורך ליצור secret ידני', 'סיסמת המשתמש שהפעיל את ה-workflow', 'טוקן קבוע שצריך ליצור פעם אחת ולשמור כ-secret', 'משתנה סביבה שמכיל את שם ה-runner'],
      a: 0,
      w: 'GitHub יוצר <code>GITHUB_TOKEN</code> אוטומטית בתחילת כל הרצה, עם הרשאות שנקבעות לפי <code>permissions</code>, ומבטל אותו בסיום הריצה.'
    },
    {
      q: 'מה תפקיד <code>actions/checkout</code> בתחילת רוב ה-jobs?',
      o: ['מושך את קוד הריפו אל תוך ה-runner כדי שהשלבים הבאים יוכלו לעבוד עליו', 'בודק שהקוד עומד בתקן lint', 'יוצר commit חדש בריפו', 'מוחק קבצים זמניים מה-runner'],
      a: 0,
      w: 'runner מתחיל כמכונה נקייה לגמרי בלי קוד - <code>actions/checkout</code> הוא כמעט תמיד ה-step הראשון, כי בלעדיו אין גישה לקבצי הפרויקט.'
    },
    {
      q: 'כיצד מציינים באיזו גרסה של Action להשתמש בשדה <code>uses</code>?',
      o: ['לפי tag/ref אחרי <code>@</code> - למשל <code>actions/checkout@v4</code> (אפשר גם SHA ספציפי)', 'הגרסה נבחרת אוטומטית ל-latest תמיד', 'בקובץ נפרד בשם version.yml', 'רק לפי מספר גרסה בלי סימן @'],
      a: 0,
      w: 'ה-@ אחרי שם ה-Action מציין ref - tag (<code>v4</code>), branch, או SHA מדויק. נעילה ל-SHA מומלצת ל-Actions צד שלישי מטעמי אבטחה (מונעת שינוי שקט של הקוד).'
    },
    {
      q: 'מה מטרת <code>strategy.matrix</code> ב-job?',
      o: ['להריץ את אותו job כמה פעמים עם קומבינציות פרמטרים שונות (למשל גרסאות שפה/מערכות הפעלה) בלי לשכפל קוד', 'להריץ jobs שונים ברצף קבוע', 'להגביל job לפלטפורמה אחת בלבד', 'ליצור תלות בין jobs'],
      a: 0,
      w: 'במקום להעתיק-להדביק job עבור כל קומבינציה, מגדירים משתנים תחת <code>matrix</code> ו-GitHub יוצר אוטומטית job נפרד לכל שילוב אפשרי.'
    },
    {
      q: 'מה ברירת המחדל של <code>fail-fast</code> במטריצה?',
      o: ['<code>true</code> - ברגע שקומבינציה אחת נכשלת, GitHub מבטל את שאר הקומבינציות הרצות', '<code>false</code> - כל הקומבינציות תמיד רצות עד הסוף', 'אין ברירת מחדל, חובה להגדיר במפורש', '<code>true</code>, אך רק עבור runners מסוג ubuntu'],
      a: 0,
      w: 'ברירת המחדל <code>fail-fast: true</code> חוסכת זמן ומשאבים - אבל לפעמים רוצים לראות את כל התוצאות (למשל בבדיקות תאימות), ואז מגדירים <code>fail-fast: false</code>.'
    },
    {
      q: 'מהם שלושת סוגי ה-Custom Actions?',
      o: ['Composite (YAML בלבד), JavaScript (Node.js), ו-Docker (container)', 'Basic, Advanced, ו-Enterprise', 'Public, Private, ו-Internal', 'Sync, Async, ו-Scheduled'],
      a: 0,
      w: 'Composite עוטף steps קיימים בלי קוד תוכנית; JavaScript רץ ישירות על ה-runner והכי מהיר; Docker אורז את הלוגיקה בתוך container, גמיש אך איטי יותר ומוגבל ל-Linux.'
    },
    {
      q: 'מה מטרת <code>actions/upload-artifact</code> ו-<code>actions/download-artifact</code>?',
      o: ['לשתף קבצים בין jobs שונים, או לשמור פלט (build/reports) גם אחרי סיום ה-workflow', 'להעלות את קוד המקור ל-GitHub Marketplace', 'ליצור release חדש אוטומטית', 'לגבות את כל הריפו לענן'],
      a: 0,
      w: 'jobs שונים לא חולקים מערכת קבצים - artifacts הם המנגנון להעביר תוצרים (למשל build) בין jobs, ואפשר גם להוריד אותם ידנית מדף ה-run בממשק.'
    },
    {
      q: 'מתי כדאי להשתמש ב-<code>environment: production</code> בהגדרת job?',
      o: ['כשרוצים להחיל secrets/variables ברמת סביבה, ואפשר לדרוש אישור ידני (protection rules) לפני ריצה', 'רק כדי לתעד את שם הסביבה בממשק, בלי השפעה בפועל', 'זהו שדה חובה בכל job, גם ללא deployment', 'כדי להריץ את ה-job על מספר סביבות במקביל'],
      a: 0,
      w: '<code>environment</code> מקשר את ה-job ל-secrets/variables שהוגדרו ברמת סביבה, ומאפשר להוסיף Required Reviewers - צעד אישור אנושי לפני שה-deployment ממשיך.'
    },
    {
      q: 'מה עושה <code>concurrency</code> עם <code>cancel-in-progress: true</code>?',
      o: ['מבטל ריצה קודמת של אותה קבוצת concurrency כשמתחילה ריצה חדשה', 'מונע לחלוטין הרצה מקבילה של כל workflows בריפו', 'מבטל את ה-workflow הנוכחי אם הוא נכשל', 'מגביל את מספר ה-runners הזמינים'],
      a: 0,
      w: 'שימושי בעיקר ב-deployments: אם דוחפים שני commits ברצף לאותו ענף, הריצה הישנה מתבטלת אוטומטית לטובת החדשה - אין טעם לפרוס גרסה ישנה יותר.'
    },
    {
      q: 'מה זה reusable workflow (עם <code>on: workflow_call</code>)?',
      o: ['workflow שניתן "לקרוא" אליו מ-workflow אחר, כדי לשתף לוגיקה בין ריפוזיטוריז/workflows שונים', 'workflow שרץ אוטומטית בכל קריאת API', 'workflow שאפשר להריץ רק פעם אחת בכל ריפו', 'כינוי נוסף ל-composite action'],
      a: 0,
      w: 'workflow עם טריגר <code>workflow_call</code> נקרא כמו step: <code>uses: ./.github/workflows/ci.yml</code> - מונע שכפול קוד בין כמה workflows או ריפוזיטוריז.'
    },
    {
      q: 'מה תפקיד השדה <code>permissions</code> בקובץ workflow?',
      o: ['קובע אילו הרשאות יהיו ל-<code>GITHUB_TOKEN</code> באותה ריצה, לפי עקרון least privilege', 'קובע אילו משתמשים מורשים להריץ את ה-workflow', 'קובע אילו secrets נגישים ל-workflow', 'קובע על אילו runners מותר להריץ את ה-job'],
      a: 0,
      w: 'ברירת המחדל נדיבה יחסית; הגדרת <code>permissions</code> מפורשת (למשל <code>contents: read</code>) מצמצמת את מה ש-<code>GITHUB_TOKEN</code> יכול לעשות אם הוא ייחשף בטעות.'
    }
  ];

  /* ============================================================
     מצב 2 - ניחוש התנהגות: קטע YAML + מה קורה בפועל בהרצה
     ============================================================ */
  var BEHAVIOR_GUESS = [
    {
      code: 'on:\n  push:\n    branches: [main]',
      q: 'אתם עובדים על הענף <code>feature/login</code> ומריצים <code>git push</code>. האם ה-workflow ירוץ?',
      o: ['לא ירוץ - הטריגר מוגדר רק לענפים שתואמים ל-<code>main</code>', 'כן ירוץ - <code>push</code> מפעיל בכל ענף ללא תלות ב-branches', 'ירוץ, אבל רק אם יש גם pull_request פתוח', 'שגיאת syntax - חובה להוסיף גם pull_request'],
      a: 0,
      w: '<code>branches</code> מסנן לאילו ענפים הטריגר מגיב. push לענף אחר לא יפעיל workflow זה כלל, אלא אם ייפתח PR שיתאים לטריגר נפרד.'
    },
    {
      code: 'on:\n  pull_request:\n    types: [closed]\njobs:\n  notify:\n    if: github.event.pull_request.merged == true\n    runs-on: ubuntu-latest',
      q: 'מתי בדיוק job זה ירוץ בפועל?',
      o: ['רק כאשר ה-PR נסגר עם מיזוג בפועל (merged) - סגירה בלי מיזוג לא תפעיל אותו', 'בכל סגירה של PR, גם בלי מיזוג', 'בכל push חדש לתוך ה-PR', 'ה-job לעולם לא ירוץ כי types ו-if לא יכולים להשתלב'],
      a: 0,
      w: '<code>types: [closed]</code> מתאים גם לסגירה בלי מיזוג. ה-<code>if</code> מוסיף תנאי נוסף שבודק את <code>github.event.pull_request.merged</code> - רק שילוב של שניהם מבטיח הרצה אך ורק במיזוג בפועל.'
    },
    {
      code: 'strategy:\n  fail-fast: true\n  matrix:\n    node: [16, 18, 20]',
      q: 'הקומבינציה עם node 16 נכשלת מוקדם. מה יקרה לקומבינציות 18 ו-20?',
      o: ['GitHub מבטל אותן מיידית ברגע שזוהה כשל בקומבינציה הראשונה', 'הן ימשיכו לרוץ עד הסוף ללא קשר לכשל', 'הן יתחילו לרוץ מחדש רק עם node 16', 'ה-workflow כולו יימחק מהריפו'],
      a: 0,
      w: '<code>fail-fast: true</code> (ברירת המחדל) מבטל את כל שאר הקומבינציות במטריצה ברגע שאחת מהן נכשלת. כדי לראות את כל התוצאות בכל זאת יש להגדיר <code>fail-fast: false</code>.'
    },
    {
      code: 'steps:\n  - name: בדיקת lint\n    run: npm run lint\n    continue-on-error: true\n  - name: הרצת בדיקות\n    run: npm test',
      q: 'שלב ה-lint נכשל (קוד יציאה שונה מ-0). מה יקרה להמשך ה-job?',
      o: ['השלב הבא (npm test) ירוץ בכל זאת, וה-job בסופו יסומן כמוצלח למרות כשל ה-lint', 'ה-job כולו ייעצר מיד ולא ירוץ npm test', 'ה-workflow כולו יימחק', 'lint ירוץ שוב אוטומטית עד שיצליח'],
      a: 0,
      w: '<code>continue-on-error: true</code> הופך כשל בשלב ספציפי ל"לא חוסם" - ה-step מסומן כנכשל בלוג, אך ה-job ממשיך לשלבים הבאים ונחשב מוצלח בסך הכול.'
    },
    {
      code: "on:\n  schedule:\n    - cron: '0 3 * * *'",
      q: 'מה משמעות ביטוי ה-cron הזה?',
      o: ['הרצה כל יום בשעה 03:00 UTC', 'הרצה כל שעה שלישית מתחילת החודש', 'הרצה פעם בשבוע ביום שלישי', 'הרצה כל 3 דקות'],
      a: 0,
      w: 'פורמט cron הוא דקה שעה יום-בחודש חודש יום-בשבוע. <code>0 3 * * *</code> = דקה 0, שעה 3, כל יום/חודש/יום-בשבוע - כלומר כל יום ב-03:00 UTC בדיוק.'
    },
    {
      code: 'env:\n  NODE_ENV: production\njobs:\n  build:\n    runs-on: ubuntu-latest\n    env:\n      NODE_ENV: development\n    steps:\n      - run: echo $NODE_ENV',
      q: 'מה יודפס בפועל בהרצת ה-step?',
      o: ['development - הגדרת env ברמת ה-job דורסת את ההגדרה ברמת ה-workflow', 'production - ההגדרה הגלובלית תמיד גוברת', 'שגיאה - אסור להגדיר את אותו משתנה פעמיים', 'שני הערכים יודפסו ברצף'],
      a: 0,
      w: 'משתני env נקבעים לפי היררכיה workflow -> job -> step, כאשר הגדרה ברמה ספציפית יותר (קרובה יותר ל-step) דורסת הגדרה כללית יותר.'
    },
    {
      code: '- uses: actions/checkout@v4',
      q: 'ללא הגדרת <code>fetch-depth</code>, כמה היסטוריית git נמשכת כברירת מחדל?',
      o: ['רק commit אחד (shallow clone, עומק 1)', 'כל ההיסטוריה המלאה של הריפו', '10 commits אחרונים בלבד', 'רק הענף main, בלי שאר הענפים'],
      a: 0,
      w: 'ברירת המחדל היא <code>fetch-depth: 1</code> - clone רדוד למהירות מרבית. כשצריך היסטוריה מלאה (למשל ל-<code>git log</code> או tags), יש להגדיר <code>fetch-depth: 0</code>.'
    },
    {
      code: '- name: יצירת גרסה\n  id: version\n  run: echo "value=1.2.3" >> "$GITHUB_OUTPUT"\n- name: שימוש בגרסה\n  run: echo "הגרסה: ${{ steps.version.outputs.value }}"',
      q: 'מה התנאי ההכרחי כדי שה-step השני יוכל לגשת לערך value מה-step הראשון?',
      o: ['לתת ל-step הראשון מזהה עם <code>id</code>, ואז לגשת דרך <code>steps.&lt;id&gt;.outputs.&lt;name&gt;</code>', 'מספיק ששני ה-steps יהיו באותו job, בלי צורך ב-id', 'צריך שם משתנה env גלובלי זהה בין השניים', 'אין דרך להעביר ערכים בין steps שונים'],
      a: 0,
      w: 'כדי לגשת לפלט של step אחר צריך שני דברים: לכתוב אותו לקובץ <code>GITHUB_OUTPUT</code> בפורמט <code>key=value</code>, ולתת ל-step <code>id</code> ייחודי - ואז לגשת אליו כ-<code>steps.&lt;id&gt;.outputs.&lt;key&gt;</code>.'
    },
    {
      code: 'name: CI\non: pull_request\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - run: echo "${{ secrets.API_KEY }}"',
      q: 'ה-PR הזה נפתח מ-fork חיצוני (לא מהריפו המקורי). מה יקרה עם <code>secrets.API_KEY</code>?',
      o: ['הערך יהיה ריק/לא זמין - secrets לא נחשפים ל-workflows שרצים על PR מ-fork חיצוני', 'הערך יוצג כרגיל בלוג', 'ה-workflow כולו ייכשל עם שגיאת קומפילציה', 'ה-secret יוצג אך בצורה מוצפנת'],
      a: 0,
      w: 'מטעמי אבטחה, GitHub לא חושף repository secrets (למעט <code>GITHUB_TOKEN</code> המוגבל) ל-workflows שהופעלו מ-<code>pull_request</code> שמקורו ב-fork חיצוני, כדי למנוע גניבת secrets על ידי קוד זדוני.'
    },
    {
      code: 'concurrency:\n  group: deploy-${{ github.ref }}\n  cancel-in-progress: true',
      q: 'נדחפים שני push-ים מהירים ברצף לאותו ענף, וכל אחד מפעיל את אותו workflow. מה יקרה?',
      o: ['הריצה הראשונה תבוטל ברגע שהריצה השנייה מתחילה, כי שתיהן חולקות אותה קבוצת concurrency', 'שתי הריצות ירוצו במקביל עד הסוף', 'הריצה השנייה תמתין בתור עד שהראשונה תסתיים', 'רק הריצה הראשונה תתבצע בפועל, השנייה תיחסם לצמיתות'],
      a: 0,
      w: '<code>cancel-in-progress: true</code> גורם לכל ריצה חדשה באותה קבוצת <code>group</code> לבטל ריצה קודמת שעדיין רצה - שימושי בעיקר כדי לא לפרוס גרסה ישנה כשמגיע push חדש.'
    },
    {
      code: 'jobs:\n  deploy:\n    runs-on: ubuntu-latest\n    timeout-minutes: 5\n    steps:\n      - run: sleep 600',
      q: 'מה יקרה ל-job הזה?',
      o: ['ה-job יבוטל אוטומטית אחרי 5 דקות ויסומן ככושל, גם אם הפקודה עדיין רצה', 'הפקודה תמשיך לרוץ עד שתסתיים בעצמה (600 שניות)', 'timeout-minutes משפיע רק על jobs עם matrix', 'ה-workflow ידלג על ה-step הזה בלבד'],
      a: 0,
      w: '<code>timeout-minutes</code> קובע גבול זמן מקסימלי ל-job. כשהזמן חולף, GitHub מבטל את ה-job בכוח ומסמן אותו ככושל, ללא קשר למה שהיה קורה בעתיד.'
    },
    {
      code: 'jobs:\n  build:\n    runs-on: ubuntu-latest\n    steps: [...]\n  test:\n    needs: build\n    if: false\n    runs-on: ubuntu-latest\n    steps: [...]\n  deploy:\n    needs: test\n    runs-on: ubuntu-latest',
      q: 'ל-test יש <code>if: false</code> - הוא תמיד מדולג. מה יקרה ל-deploy שתלוי בו דרך needs?',
      o: ['deploy יידלג גם הוא (skipped), כי ה-job שהוא תלוי בו לא רץ בפועל', 'deploy ירוץ כרגיל, כי needs לא מושפע מ-if', 'deploy ייכשל עם שגיאת תלות', 'test ירוץ בכל זאת כי needs גובר על if'],
      a: 0,
      w: 'כשה-job שתלויים בו מדולג, ברירת המחדל היא שגם ה-jobs שתלויים בו דרך <code>needs</code> מדולגים - התנאי הבלתי-מפורש הוא <code>success()</code> של ה-needs, ו-skipped אינו success.'
    }
  ];

  /* ============================================================
     מצב 3 - השלמת Workflow YAML: קטע עם ___ חסר
     ============================================================ */
  var YAML_COMPLETE = [
    {
      code: 'on:\n  ___:\n    branches: [main]',
      q: 'מה משלים את הטריגר כדי שה-workflow ירוץ בכל push לענף main?',
      o: ['<code>push</code>', '<code>pull_request</code>', '<code>schedule</code>', '<code>workflow_dispatch</code>'],
      a: 0,
      w: '<code>push</code> הוא הטריגר הבסיסי ביותר - מפעיל workflow בכל דחיפת commits לענף שתואם את הסינון ב-<code>branches</code>.'
    },
    {
      code: 'jobs:\n  build:\n    ___: ubuntu-latest\n    steps: [...]',
      q: 'מה משלים את השדה שקובע על איזו מערכת הפעלה ה-job ירוץ?',
      o: ['<code>runs-on</code>', '<code>runs-at</code>', '<code>platform</code>', '<code>os</code>'],
      a: 0,
      w: '<code>runs-on</code> קובע את סוג ה-runner - למשל <code>ubuntu-latest</code>, <code>windows-latest</code>, <code>macos-latest</code>, או תווית של self-hosted runner.'
    },
    {
      code: 'jobs:\n  deploy:\n    ___: [build, test]\n    runs-on: ubuntu-latest',
      q: 'מה משלים את השדה שגורם ל-deploy להמתין ש-build ו-test יסתיימו קודם?',
      o: ['<code>needs</code>', '<code>depends-on</code>', '<code>after</code>', '<code>wait-for</code>'],
      a: 0,
      w: '<code>needs</code> מגדיר תלות בין jobs - ה-job ימתין שכל ה-jobs שברשימה יסתיימו בהצלחה לפני שיתחיל.'
    },
    {
      code: 'steps:\n  - ___: actions/checkout@v4',
      q: 'מה משלים את השדה שמפעיל Action מוכן (בניגוד לפקודת shell)?',
      o: ['<code>uses</code>', '<code>run</code>', '<code>call</code>', '<code>action</code>'],
      a: 0,
      w: '<code>uses</code> מפנה ל-Action קיים (ממארקטפלייס, ריפו אחר, או תיקייה מקומית), לפי <code>owner/repo@ref</code>.'
    },
    {
      code: "- name: התקנת Node.js\n  uses: actions/setup-node@v4\n  with:\n    node-version: ___",
      q: 'מה משלים את הערך כדי להתקין Node.js גרסה 20?',
      o: ["<code>'20'</code>", '<code>v20</code>', '<code>node20</code>', '<code>20.x.x</code>'],
      a: 0,
      w: '<code>node-version</code> מקבל את מספר הגרסה כמחרוזת, לרוב <code>\'20\'</code> (או <code>\'20.x\'</code> לגרסת minor האחרונה) - <code>actions/setup-node</code> מוריד ומתקין את הגרסה המתאימה.'
    },
    {
      code: '- name: פריסה\n  run: ./deploy.sh\n  env:\n    DEPLOY_TOKEN: ${{ ___.DEPLOY_TOKEN }}',
      q: 'מה משלים את הביטוי כדי לגשת לערך רגיש שהוגדר כ-secret?',
      o: ['<code>secrets</code>', '<code>vars</code>', '<code>env</code>', '<code>github</code>'],
      a: 0,
      w: '<code>secrets.&lt;NAME&gt;</code> הוא ההקשר (context) הייעודי לגישה לערכים רגישים שהוגדרו ב-Settings -&gt; Secrets and variables. לערכים לא-רגישים משתמשים ב-<code>vars.&lt;NAME&gt;</code>.'
    },
    {
      code: 'strategy:\n  matrix:\n    node: [18, 20, 22]\n  ___: false',
      q: 'מה משלים את השדה כדי שכשל בקומבינציה אחת לא יבטל את שאר קומבינציות המטריצה?',
      o: ['<code>fail-fast</code>', '<code>continue-on-error</code>', '<code>stop-on-fail</code>', '<code>strict</code>'],
      a: 0,
      w: '<code>fail-fast: false</code> (ברירת המחדל היא <code>true</code>) גורם לכל קומבינציות המטריצה להמשיך לרוץ עד הסוף גם אם קומבינציה אחת נכשלת.'
    },
    {
      code: "deploy:\n  runs-on: ubuntu-latest\n  ___: github.ref == 'refs/heads/main'",
      q: 'מה משלים את השדה שמריץ את ה-job רק כשהתנאי מתקיים?',
      o: ['<code>if</code>', '<code>when</code>', '<code>condition</code>', '<code>only-if</code>'],
      a: 0,
      w: '<code>if</code> מקבל ביטוי (לרוב בתוך <code>${{ }}</code>) שמוערך לפני הרצת ה-job/step - אם התוצאה false, ה-job מדולג.'
    },
    {
      code: '- name: יצירת פלט\n  id: build\n  run: echo "path=./dist" >> "$___"',
      q: 'מה משלים את שם משתנה הסביבה שאליו כותבים כדי להגדיר output של step?',
      o: ['<code>GITHUB_OUTPUT</code>', '<code>GITHUB_ENV</code>', '<code>GITHUB_STATE</code>', '<code>GITHUB_PATH</code>'],
      a: 0,
      w: '<code>GITHUB_OUTPUT</code> הוא קובץ זמני שה-runner חושף כמשתנה סביבה; כתיבה אליו בפורמט <code>key=value</code> מגדירה output שאפשר לגשת אליו דרך <code>steps.&lt;id&gt;.outputs.&lt;key&gt;</code>.'
    },
    {
      code: 'permissions:\n  contents: ___\n  pull-requests: write',
      q: 'מה משלים את ההרשאה כדי לאפשר רק קריאה מתוכן הריפו (בלי כתיבה)?',
      o: ['<code>read</code>', '<code>write</code>', '<code>none</code>', '<code>read-only</code>'],
      a: 0,
      w: 'ההרשאות האפשריות לכל scope הן <code>read</code>, <code>write</code> או <code>none</code>. <code>contents: read</code> מספיק ל-checkout רגיל, בעוד <code>pull-requests: write</code> נחוץ למשל להוספת תגובות אוטומטיות ל-PR.'
    },
    {
      code: "on:\n  schedule:\n    - cron: '___'",
      q: 'מה משלים את ביטוי ה-cron כדי להריץ את ה-workflow כל יום ב-00:00 UTC?',
      o: ["<code>'0 0 * * *'</code>", "<code>'0 0 0 0 0'</code>", "<code>'* 0 * * *'</code>", "<code>'0 24 * * *'</code>"],
      a: 0,
      w: 'פורמט cron: דקה שעה יום-בחודש חודש יום-בשבוע. <code>0 0 * * *</code> = דקה 0, שעה 0, כל יום/חודש/יום-בשבוע - כלומר חצות UTC בכל יום.'
    },
    {
      code: '- name: העלאת תוצרי בנייה\n  uses: actions/upload-artifact@v4\n  with:\n    name: build-output\n    ___: ./dist',
      q: 'מה משלים את השדה שמציין איזו תיקייה/קובץ להעלות כ-artifact?',
      o: ['<code>path</code>', '<code>source</code>', '<code>dir</code>', '<code>from</code>'],
      a: 0,
      w: '<code>path</code> מציין את הנתיב (קובץ או תיקייה) שייארז ויועלה כ-artifact, וניתן להורידו אחר כך עם <code>actions/download-artifact</code> או מממשק ה-workflow run.'
    },
    {
      code: 'jobs:\n  reusable:\n    ___:\n      inputs:\n        environment:\n          required: true\n          type: string',
      q: 'מה משלים את הטריגר שהופך workflow לניתן-לקריאה מ-workflow אחר (reusable workflow)?',
      o: ['<code>workflow_call</code>', '<code>workflow_dispatch</code>', '<code>repository_dispatch</code>', '<code>workflow_run</code>'],
      a: 0,
      w: '<code>workflow_call</code> הוא הטריגר הייעודי ל-reusable workflows - מאפשר ל-workflow אחר לקרוא אליו עם <code>uses: ./.github/workflows/x.yml</code> ולהעביר inputs/secrets.'
    }
  ];

  /* ============================================================
     מצב 4 - התאמת מושגים: סבבים של זוגות מושג + תיאור
     ============================================================ */
  var MATCH_ROUNDS = [
    {
      title: 'מושגי יסוד',
      pairs: [
        { l: 'Workflow', r: 'תהליך אוטומטי שמוגדר בקובץ YAML בתיקיית <code>.github/workflows/</code>' },
        { l: 'Event', r: 'אירוע שמפעיל workflow - למשל <code>push</code> או <code>pull_request</code>' },
        { l: 'Job', r: 'קבוצת steps שרצה על אותו runner' },
        { l: 'Step', r: 'פעולה בודדת בתוך job - פקודת <code>run</code> או Action עם <code>uses</code>' },
        { l: 'Runner', r: 'המכונה (וירטואלית או פיזית) שבפועל מריצה את ה-jobs' }
      ]
    },
    {
      title: 'טריגרים (on)',
      pairs: [
        { l: '<code>push</code>', r: 'מפעיל workflow בכל דחיפת commits לענף תואם' },
        { l: '<code>pull_request</code>', r: 'מפעיל workflow בפתיחה/עדכון של Pull Request' },
        { l: '<code>workflow_dispatch</code>', r: 'מאפשר הפעלה ידנית דרך ממשק GitHub או ה-API' },
        { l: '<code>schedule</code>', r: 'מפעיל workflow לפי לוח זמנים בפורמט cron, תמיד ב-UTC' },
        { l: '<code>workflow_call</code>', r: 'הופך את ה-workflow לניתן-לקריאה מ-workflow אחר (reusable)' }
      ]
    },
    {
      title: 'Secrets, Variables וסביבות',
      pairs: [
        { l: '<code>secrets.NAME</code>', r: 'גישה לערך רגיש מוצפן, מוסתר אוטומטית בלוגים' },
        { l: '<code>vars.NAME</code>', r: 'גישה לערך קונפיגורציה לא-רגיש, גלוי בלוגים' },
        { l: '<code>GITHUB_TOKEN</code>', r: 'טוקן זמני שנוצר אוטומטית לכל הרצה, לגישה מבוקרת ל-API של הריפו' },
        { l: '<code>environment:</code>', r: 'מפעיל secrets/variables ברמת סביבה, ויכול לדרוש אישור ידני' },
        { l: 'Organization secret', r: 'זמין לכל הריפוזיטוריז בארגון (או רשימה מוגדרת), לניהול ריכוזי' }
      ]
    },
    {
      title: 'Matrix, בקרת ריצה ו-Custom Actions',
      pairs: [
        { l: '<code>strategy.matrix</code>', r: 'מריץ את אותו job עם קומבינציות פרמטרים שונות' },
        { l: '<code>fail-fast</code>', r: 'קובע אם כשל בקומבינציה אחת מבטל את שאר קומבינציות המטריצה' },
        { l: '<code>continue-on-error</code>', r: 'מאפשר ל-step להיכשל בלי לעצור את שאר ה-job' },
        { l: 'Composite Action', r: 'Action שנכתב כ-YAML בלבד, עוטף כמה steps קיימים' },
        { l: '<code>action.yml</code>', r: 'קובץ המטא-דאטה החובה של כל Custom Action - inputs, outputs ו-runs' }
      ]
    }
  ];

  /* ============================================================
     מצב 5 - סידור Workflow: סבבים של שלבים שצריך לסדר בסדר הנכון
     ============================================================ */
  var ORDER_ROUNDS = [
    {
      title: 'בניית CI/CD workflow מלא - מ-push ועד פריסה',
      steps: [
        'יצירת קובץ workflow תחת .github/workflows/ci.yml עם טריגר on: push',
        'הוספת job שמריץ actions/checkout למשיכת הקוד',
        'התקנת תלויות עם actions/setup-node והרצת npm ci',
        'הרצת בדיקות (npm test) ועצירה אם נכשלו',
        'בניית הפרויקט (npm run build) והעלאת התוצרים כ-artifact',
        'פריסה לסביבת production ב-job נפרד שמצביע עם needs על ה-job הקודם'
      ]
    },
    {
      title: 'הוספת Secret ושימוש בו בבטחה',
      steps: [
        'יצירת ה-secret בממשק GitHub תחת Settings -> Secrets and variables -> Actions',
        'הפניה לערך ב-workflow דרך ${{ secrets.NAME }}',
        'העברתו כמשתנה סביבה לשלב ספציפי עם env',
        'שימוש בו בתוך פקודת ה-run בלי להדפיס אותו ללוג',
        'וידוא שה-secret לא נחשף ל-workflows שרצים על PR מ-fork חיצוני'
      ]
    },
    {
      title: 'איתור ותיקון כשל ב-workflow',
      steps: [
        'קבלת התראה שה-workflow נכשל (אייקון אדום בטאב Actions)',
        'פתיחת ה-run הספציפי וצפייה בלוג של ה-job שנכשל',
        'שחזור הבעיה מקומית - הרצת אותה פקודה בסביבת הפיתוח',
        'תיקון הקוד או קובץ ה-workflow עצמו',
        'דחיפת commit חדש עם התיקון לענף',
        'מעקב אחרי ההרצה החדשה שמופעלת אוטומטית ואישור שהיא עוברת בהצלחה'
      ]
    },
    {
      title: 'יצירת Custom Composite Action ושימוש בו',
      steps: [
        'יצירת תיקייה ייעודית, למשל .github/actions/setup-project',
        'כתיבת קובץ action.yml עם inputs, outputs והגדרת runs.using: composite',
        'הוספת רשימת steps בתוך ה-action - שילוב של run ו-uses',
        'הפניה ל-Action מהתיקייה המקומית ב-workflow עם uses: ./.github/actions/setup-project',
        'בדיקת ה-Action בהרצה אמיתית ווידוא שה-outputs מגיעים כראוי'
      ]
    }
  ];

  /* ============================================================
     הגדרת מצבי המשחק
     ============================================================ */
  var MODES = [
    { key: 'rapid', icon: '⚡', name: 'קרב מהיר', desc: 'שאלות ידע כלליות על GitHub Actions - כמה תספיקו לפני שהזמן נגמר?', type: 'quiz', data: RAPID, sample: 10, time: 20000 },
    { key: 'behavior', icon: '🔎', name: 'ניחוש התנהגות', desc: 'קטע workflow YAML - מה בדיוק יקרה כשהוא ירוץ?', type: 'quiz', data: BEHAVIOR_GUESS, sample: 8, time: 30000, showCode: true },
    { key: 'yaml', icon: '🧩', name: 'השלמת Workflow', desc: 'קובץ workflow עם חלק חסר - בחרו מה משלים אותו נכון', type: 'quiz', data: YAML_COMPLETE, sample: 8, time: 28000, showCode: true },
    { key: 'match', icon: '🔗', name: 'התאמת מושגים', desc: 'התאימו כל מושג/שדה ב-GitHub Actions לתיאור הנכון שלו', type: 'match', data: MATCH_ROUNDS, sample: 2 },
    { key: 'order', icon: '📋', name: 'סידור Workflow', desc: 'סדרו את שלבי התהליך לפי הסדר הנכון', type: 'order', data: ORDER_ROUNDS, sample: 2 }
  ];

  window.TG_CONFIG = { gameId: "ghactions", modes: MODES };
})();
</script>

<script src="/scripts/topic-game.js"></script>
