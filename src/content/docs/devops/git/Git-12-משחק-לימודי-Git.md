---
title: "משחק לימודי: אתגר Git"
category: DevOps/Git
part: 12/10
description: "משחק אינטראקטיבי ללימוד Git - חמישה מצבי משחק עם טיימר, לבבות, ניקוד ורצפים: קרב מהיר, ניחוש git status, השלמת פקודות, התאמת מושגים וסידור workflow."
---

חמישה מצבי משחק שבודקים היבטים שונים של Git - לא עוד חידון רב-ברירה, אלא משחק עם **טיימר**, **שלושה לבבות**, **מכפיל רצף** ו**שיא אישי** שנשמר בדפדפן. בסוף כל סבב תקבלו דירוג, ורשימת חזרה של בדיוק מה שפספסתם.


<div class="tg" id="tg" dir="rtl">
  <div class="tg-screen is-active" data-screen="menu">
    <div class="tg-hero">
      <div class="tg-hero-badge">Git</div>
      <div class="tg-hero-title">אתגר Git</div>
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
      q: 'איזו פקודה מעבירה שינויים מה-Working Directory אל ה-Staging Area?',
      o: ['<code>git add</code>', '<code>git commit</code>', '<code>git push</code>', '<code>git stage</code>'],
      a: 0,
      w: '<code>git add</code> מסמן קבצים שישולבו ב-commit הבא. הקבצים עצמם עדיין לא נשמרו בהיסטוריה - לשם כך צריך <code>git commit</code>.'
    },
    {
      q: 'מה ההבדל העיקרי בין <code>git fetch</code> ל-<code>git pull</code>?',
      o: ['<code>fetch</code> מוריד עדכונים בלי למזג, ו-<code>pull</code> = fetch + merge', '<code>fetch</code> מוריד גם קבצים ו-<code>pull</code> רק metadata', 'אין הבדל, אלו כינויים לאותה פקודה', '<code>pull</code> עובד רק על branch מרוחק'],
      a: 0,
      w: '<code>fetch</code> מעדכן את ה-branches המרוחקים (למשל <code>origin/main</code>) בלי לגעת ב-branch המקומי. <code>pull</code> הוא <code>fetch</code> ואז <code>merge</code> (או <code>rebase</code>) אוטומטי.'
    },
    {
      q: 'מה עושה <code>git status</code>?',
      o: ['מציגה אילו קבצים שונו, ב-staging ואילו untracked, בלי לשנות דבר', 'שולחת שינויים לענף מרוחק', 'מוחקת שינויים לא-שמורים', 'יוצרת commit חדש'],
      a: 0,
      w: '<code>git status</code> היא פקודת מידע בלבד - לא נוגעת בקבצים, רק מציגה את המצב הנוכחי של Working Directory ו-Staging Area מול ה-commit האחרון.'
    },
    {
      q: 'איזו פקודה יוצרת ומחליפה ל-branch חדש בפעולה אחת?',
      o: ['<code>git checkout -b &lt;name&gt;</code> (או <code>git switch -c &lt;name&gt;</code>)', '<code>git branch &lt;name&gt;</code>', '<code>git merge &lt;name&gt;</code>', '<code>git clone -b &lt;name&gt;</code>'],
      a: 0,
      w: '<code>git branch</code> רק יוצרת ענף בלי לעבור אליו. הדגל <code>-b</code> ב-<code>checkout</code> (או <code>-c</code> ב-<code>switch</code> המודרנית יותר) עושה את שני הצעדים יחד.'
    },
    {
      q: 'מה עושה <code>git log --oneline --graph</code>?',
      o: ['מציגה היסטוריית commits בשורה אחת לכל commit, עם ייצוג גרפי של ענפים ומיזוגים', 'מוחקת ענפים ישנים', 'מציגה רק את ה-commit האחרון', 'משווה בין שני branches בלבד'],
      a: 0,
      w: 'שילוב פופולרי לסקירה מהירה: <code>--oneline</code> מקצר כל commit לשורה, ו-<code>--graph</code> מצייר קווי ASCII שממחישים היכן ענפים התפצלו והתמזגו.'
    },
    {
      q: 'מה שומר קובץ <code>.gitignore</code>?',
      o: ['רשימת קבצים/תיקיות ש-Git יתעלם מהם ולא יציע להוסיף ל-staging', 'רשימת ה-commits האחרונים', 'את פרטי ה-remote', 'את היסטוריית ה-branches'],
      a: 0,
      w: 'קבצים כמו <code>node_modules/</code>, <code>.env</code> או קבצי build לא אמורים להיכנס להיסטוריה - <code>.gitignore</code> מונע מ-<code>git status</code>/<code>git add .</code> לראות אותם בכלל.'
    },
    {
      q: 'מה ההבדל בין <code>git merge</code> ל-<code>git rebase</code>?',
      o: ['<code>merge</code> יוצר commit מיזוג ושומר את שתי ההיסטוריות; <code>rebase</code> "מעביר" את הקומיטים שלכם על גבי base חדש ויוצר היסטוריה לינארית', 'הן פקודות זהות לחלוטין', '<code>rebase</code> תמיד בטוח יותר על branches משותפים', '<code>merge</code> משנה SHA-ים של commits קיימים'],
      a: 0,
      w: '<code>merge</code> משמר את ההיסטוריה האמיתית (כולל ה-fork), בעוד <code>rebase</code> כותב מחדש commits (SHA חדש לכל אחד) כדי לקבל קו ישר - ולכן מסוכן על branches ששותפים אחרים כבר משכו.'
    },
    {
      q: 'מה עושה <code>git stash</code> בלי ארגומנטים?',
      o: ['שומר זמנית שינויים לא-שמורים בצד ומחזיר את ה-working directory למצב נקי', 'מוחק את כל השינויים לצמיתות', 'יוצר commit חדש', 'דוחף שינויים לענף מרוחק'],
      a: 0,
      w: 'שימושי כשצריך לעבור branch מהר בלי לאבד עבודה באמצע. השינויים נשמרים במחסנית שאפשר להחזיר עם <code>git stash pop</code>.'
    },
    {
      q: 'מה ההבדל בין <code>git reset --soft</code> ל-<code>git reset --hard</code>?',
      o: ['<code>--soft</code> משאיר שינויים ב-staging, <code>--hard</code> מוחק גם מה-working directory', '<code>--soft</code> מוחק commits מהענף המרוחק', 'אין הבדל מעשי', '<code>--hard</code> בטוח יותר כי הוא לא הפיך'],
      a: 0,
      w: '<code>--soft</code> מזיז רק את מצביע ה-HEAD ומשאיר את השינויים ב-staging. <code>--hard</code> הוא המסוכן מבין השלושה - הוא דורס גם את ה-working directory, וכל שינוי לא-commit-ד נעלם.'
    },
    {
      q: 'מה עושה <code>git cherry-pick &lt;commit&gt;</code>?',
      o: ['מיישם commit ספציפי מ-branch אחר על הענף הנוכחי, בלי למזג את כל הענף', 'מוחק commit מההיסטוריה', 'משכפל branch שלם', 'משווה בין שני commits'],
      a: 0,
      w: 'שימושי כשצריך רק תיקון בודד (למשל hotfix) מענף אחר, בלי לגרור את כל שאר השינויים שבו.'
    },
    {
      q: 'מה מייצג HEAD ב-Git?',
      o: ['מצביע לענף/commit הנוכחי שעליו אתם עומדים', 'המחבר של ה-commit הראשון', 'שם ברירת המחדל של ה-remote', 'קובץ הקונפיגורציה הראשי'],
      a: 0,
      w: 'ברוב המקרים HEAD מצביע על ענף (למשל <code>main</code>), שבתורו מצביע על ה-commit האחרון בו. "detached HEAD" קורה כש-HEAD מצביע ישירות על commit ולא על ענף.'
    },
    {
      q: 'איזו פקודה מציגה את השינויים שעדיין לא נכנסו ל-staging?',
      o: ['<code>git diff</code>', '<code>git diff --staged</code>', '<code>git log -p</code>', '<code>git show</code>'],
      a: 0,
      w: '<code>git diff</code> ללא ארגומנטים משווה working directory מול staging. <code>git diff --staged</code> (או <code>--cached</code>) משווה staging מול ה-commit האחרון.'
    },
    {
      q: 'מה עושה <code>git commit --amend</code>?',
      o: ['משנה את ה-commit האחרון (הודעה ו/או תוכן) במקום ליצור commit חדש', 'מוחק את כל ההיסטוריה', 'דוחף מחדש לענף מרוחק', 'יוצר branch חדש מה-commit האחרון'],
      a: 0,
      w: 'שימושי לתיקון typo בהודעת commit או להוספת קובץ ששכחתם - אבל מייצר SHA חדש, ולכן אסור להשתמש בו אחרי push על commit ששותפים כבר משכו.'
    },
    {
      q: 'מה עושה <code>git tag</code>?',
      o: ['מסמן commit ספציפי בשם קבוע (למשל גרסה), בדרך כלל לא זז לעולם', 'יוצר branch חדש', 'מוחק קבצים לא רצויים', 'מציג את רשימת ה-remotes'],
      a: 0,
      w: 'טאגים משמשים בעיקר לסימון גרסאות (<code>v1.0.0</code>). בניגוד לענף, טאג לא מתקדם אוטומטית עם commits חדשים.'
    },
    {
      q: 'מה מטרת קובץ <code>.git/config</code> ופקודת <code>git config</code>?',
      o: ['הגדרת הגדרות Git ברמת repo/global/system - כמו שם משתמש, אימייל ו-aliases', 'שמירת היסטוריית ה-commits', 'רשימת קבצי .gitignore', 'ניהול Pull Requests'],
      a: 0,
      w: '<code>git config --global user.name "..."</code> ו-<code>user.email "..."</code> הן מהפקודות הראשונות שמריצים אחרי התקנת Git - הן קובעות מי "המחבר" שיוצג בכל commit.'
    }
  ];

  /* ============================================================
     מצב 2 - ניחוש פלט: פקודה/מצב + מה יראה git status / git log / git diff
     ============================================================ */
  var STATUS_GUESS = [
    {
      code: '$ echo "changed" >> README.md\n$ git status',
      q: 'שיניתם קובץ שכבר עוקב אחריו Git, בלי להריץ <code>add</code>. תחת איזו כותרת הוא יופיע?',
      o: ['"Changes not staged for commit"', '"Changes to be committed"', '"Untracked files"', 'הקובץ לא יופיע כלל'],
      a: 0,
      w: 'קובץ ששונה אבל טרם נוסף ל-staging מופיע תחת "Changes not staged for commit" - הוא כן tracked, אבל השינוי החדש עדיין לא סומן ל-commit הבא.'
    },
    {
      code: '$ touch notes.txt\n$ git status',
      q: 'יצרתם קובץ חדש שמעולם לא היה חלק מה-repo. תחת איזו כותרת הוא יופיע?',
      o: ['"Untracked files"', '"Changes not staged for commit"', '"Changes to be committed"', 'שגיאה - Git חוסם קבצים חדשים'],
      a: 0,
      w: 'קובץ שה-repo לא מכיר בכלל (לא הופיע באף commit קודם) מסווג כ-untracked - Git לא עוקב אחריו עד שתריצו <code>git add</code>.'
    },
    {
      code: '$ git add config.yml\n$ git status',
      q: 'הרצתם <code>git add</code> על קובץ ששונה. תחת איזו כותרת הוא יופיע עכשיו?',
      o: ['"Changes to be committed"', '"Untracked files"', '"Changes not staged for commit"', 'הוא ייעלם מהרשימה'],
      a: 0,
      w: 'ברגע שקובץ נכנס ל-staging הוא עובר לקטגוריית "Changes to be committed" - זה בדיוק מה ש-<code>git commit</code> הבא ישמור בהיסטוריה.'
    },
    {
      code: '$ git add file.txt\n$ echo "more" >> file.txt\n$ git status',
      q: 'הוספתם קובץ ל-staging, ואז שיניתם אותו שוב בלי להריץ add נוסף. מה יראה status?',
      o: ['הקובץ יופיע בשתי הכותרות בו-זמנית - staged וגם not-staged', 'רק "Changes to be committed"', 'רק "Changes not staged for commit"', 'שגיאת קונפליקט'],
      a: 0,
      w: 'Git עוקב אחרי staging ו-working directory בנפרד. הגרסה שנוספה ל-staging נשארת שם; השינוי הנוסף שאחריה מופיע כ-not-staged - עד שתריצו <code>add</code> שוב.'
    },
    {
      code: '$ git checkout -b feature/login\n$ git status',
      q: 'עברתם לענף חדש נקי בלי שינויים כלל. מה status יציג?',
      o: ['"On branch feature/login" + "nothing to commit, working tree clean"', 'שגיאה - branch ריק אסור', 'רשימת כל הקבצים כ-untracked', 'רשימת כל ה-commits'],
      a: 0,
      w: 'ענף חדש שנוצר מ-commit קיים מתחיל תמיד "נקי" - אין שום הבדל בינו לבין נקודת המוצא עד שמישהו יבצע שינוי.'
    },
    {
      code: '$ git diff --stat',
      q: 'מה מציגה <code>git diff --stat</code> בהשוואה ל-<code>git diff</code> רגילה?',
      o: ['סיכום קצר - כמה שורות שונו בכל קובץ, בלי להציג את התוכן המלא', 'רק את שמות הקבצים בלי מספרים', 'diff מלא + היסטוריית commits', 'רק קבצים שנמחקו'],
      a: 0,
      w: '<code>--stat</code> נותן תמונת מצב מהירה (למשל <code>file.js | 12 +++++---</code>) - שימושי כשרוצים לדעת "כמה השתנה" בלי לגלול על diff ארוך.'
    },
    {
      code: 'commit abc123\nAuthor: Dana <dana@x.com>\nDate: ...\n\n    Fix login bug\n\n$ git log --author="Dana"',
      q: 'מה עושה הדגל <code>--author</code> ב-<code>git log</code>?',
      o: ['מסנן ומציג רק commits שנכתבו על ידי מחבר תואם לתבנית', 'משנה את שם המחבר בהיסטוריה', 'מציג רק commits ללא מחבר', 'ממזג commits לפי מחבר'],
      a: 0,
      w: 'שימושי כשרוצים לראות רק את התרומה של מפתח מסוים לפרויקט, במיוחד בשילוב עם <code>--oneline</code> לתמצות.'
    },
    {
      code: '$ git branch\n* main\n  feature/api\n  bugfix/typo',
      q: 'מה מסמן הכוכבית (<code>*</code>) ליד <code>main</code> בפלט של <code>git branch</code>?',
      o: ['זהו הענף הנוכחי שעליו HEAD מצביע כרגע', 'הענף האחרון שנוצר', 'הענף היחיד שקיים ב-remote', 'הענף שיש בו הכי הרבה commits'],
      a: 0,
      w: '<code>git branch</code> ללא ארגומנטים מציגה את כל הענפים המקומיים, והכוכבית מסמנת תמיד את הענף שאתם "עליו" כרגע - זה שאליו HEAD מפנה.'
    },
    {
      code: '$ git status\nOn branch main\nYour branch is ahead of \'origin/main\' by 2 commits.\n  (use "git push" to publish your local commits)',
      q: 'מה אומרת ההודעה "ahead by 2 commits"?',
      o: ['יש 2 commits מקומיים שעדיין לא נדחפו (push) לענף המרוחק', 'ה-remote מכיל 2 commits שאין לכם', 'יש 2 קבצים בקונפליקט', 'צריך למשוך (pull) 2 commits'],
      a: 0,
      w: '"ahead" אומר שהמקומי התקדם יותר מה-remote שהוא עוקב אחריו. ההפך, "behind", היה אומר שצריך <code>pull</code> כדי להדביק פערים.'
    },
    {
      code: '$ git merge feature/x\nAuto-merging file.js\nCONFLICT (content): Merge conflict in file.js\nAutomatic merge failed; fix conflicts and then commit the result.',
      q: 'מה status יציג עבור file.js מיד אחרי הודעת קונפליקט כזו?',
      o: ['"Unmerged paths" - file.js מסומן כקובץ עם קונפליקט שצריך לפתור ידנית', '"Changes to be committed" - הכל כבר נפתר אוטומטית', '"Untracked files"', 'הקובץ ייעלם מה-status'],
      a: 0,
      w: 'כשיש קונפליקט, Git עוצר את המיזוג ומסמן את הקבצים הרלוונטיים תחת "Unmerged paths" - צריך לערוך אותם ידנית, להסיר את סימוני <code>&lt;&lt;&lt;&lt;&lt;&lt;&lt;</code>, ואז <code>git add</code> + <code>commit</code>.'
    },
    {
      code: '$ git log --oneline -3\na1b2c3d Fix typo in docs\ne4f5g6h Add login endpoint\ni7j8k9l Initial commit',
      q: 'מה עושה הדגל <code>-3</code> (או <code>-n 3</code>) ב-<code>git log</code>?',
      o: ['מגביל את הפלט ל-3 ה-commits האחרונים בלבד', 'מציג רק commits עם 3 קבצים ומעלה', 'מציג commits מ-3 הענפים האחרונים', 'מוחק את 3 ה-commits האחרונים'],
      a: 0,
      w: 'זה דגל נפוץ מאוד לסקירה מהירה בלי להציף את הטרמינל בכל ההיסטוריה - שקול לכתוב <code>-n 3</code> במפורש.'
    },
    {
      code: '$ git stash list\nstash@{0}: WIP on main: a1b2c3d Add feature\nstash@{1}: WIP on bugfix: e4f5g6h Fix bug',
      q: 'איך מחזירים ספציפית את <code>stash@{1}</code> (ולא את האחרון)?',
      o: ['<code>git stash pop stash@{1}</code> (או <code>apply</code>)', '<code>git stash pop</code> בלבד תמיד מחזירה את הישן ביותר', '<code>git stash restore 1</code>', 'אי אפשר לבחור stash ספציפי'],
      a: 0,
      w: 'בלי לציין מזהה, <code>pop</code>/<code>apply</code> פועלים תמיד על <code>stash@{0}</code> - האחרון שנוסף. כדי לבחור stash ישן יותר צריך לציין את המזהה המלא כפי שמופיע ב-<code>stash list</code>.'
    },
    {
      code: '$ git rebase main\nCONFLICT (content): Merge conflict in app.js\nerror: could not apply e4f5g6h... Update app.js',
      q: 'קרה קונפליקט באמצע rebase. מה שלוש האפשרויות העומדות בפניכם?',
      o: ['לפתור את הקונפליקט + <code>git rebase --continue</code>, או <code>--skip</code>, או <code>--abort</code> לביטול מלא', 'רק <code>git merge --abort</code> אפשרי', 'חובה למחוק את הענף ולהתחיל מחדש', 'Git פותר קונפליקטים ב-rebase אוטומטית תמיד'],
      a: 0,
      w: 'בניגוד ל-merge (קונפליקט אחד גדול), ב-rebase כל commit מיושם בנפרד - אפשר לפתור ולהמשיך (<code>--continue</code>), לדלג על ה-commit הבעייתי (<code>--skip</code>), או לוותר ולחזור למצב שלפני ה-rebase (<code>--abort</code>).'
    }
  ];

  /* ============================================================
     מצב 3 - השלמת פקודה: פקודה עם חלק חסר, לבחור מה משלים אותה
     ============================================================ */
  var CMD_COMPLETE = [
    {
      code: '$ git ___ -m "Fix login bug"',
      q: 'מה משלים את הפקודה ליצירת commit חדש עם הודעה?',
      o: ['<code>commit</code>', '<code>add</code>', '<code>save</code>', '<code>push</code>'],
      a: 0,
      w: '<code>git commit -m "..."</code> שומר את מה שנמצא ב-staging כ-snapshot חדש בהיסטוריה, עם ההודעה שצוינה.'
    },
    {
      code: '$ git add ___',
      q: 'מה משלים את הפקודה כדי להוסיף את כל הקבצים ששונו (כולל תיקיות) ל-staging?',
      o: ['<code>.</code>', '<code>*</code>', '<code>--all-files</code>', '<code>-r</code>'],
      a: 0,
      w: '<code>git add .</code> מוסיף את כל השינויים בתיקייה הנוכחית ומטה. הרחבה: <code>git add -A</code> מוסיפה מכל ה-repo, כולל מחיקות מחוץ לתיקייה הנוכחית.'
    },
    {
      code: '$ git branch ___ old-name new-name',
      q: 'מה משלים את הפקודה לשינוי שם ענף מ-old-name ל-new-name?',
      o: ['<code>-m</code>', '<code>-d</code>', '<code>-r</code>', '<code>-c</code>'],
      a: 0,
      w: '<code>-m</code> (move) משנה שם ענף. <code>-c</code> יוצר עותק תחת שם חדש בלי למחוק את המקור, ו-<code>-d</code> מוחק ענף שכבר מוזג.'
    },
    {
      code: '$ git push ___ origin main',
      q: 'מה משלים את הפקודה כדי לדחוף ולהגדיר את origin/main כ-upstream של הענף המקומי בפעם הראשונה?',
      o: ['<code>-u</code> (או <code>--set-upstream</code>)', '<code>-f</code>', '<code>--all</code>', '<code>--tags</code>'],
      a: 0,
      w: 'אחרי <code>push -u origin main</code> פעם אחת, כל <code>git push</code>/<code>git pull</code> עתידי בענף הזה יידע אוטומטית לאיזה remote branch להתחבר, בלי לציין שוב.'
    },
    {
      code: '$ git log --___',
      q: 'איזה דגל הופך את פלט git log לתמציתי - שורה אחת לכל commit?',
      o: ['<code>--oneline</code>', '<code>--short</code>', '<code>--compact</code>', '<code>--summary</code>'],
      a: 0,
      w: '<code>--oneline</code> מציג SHA מקוצר + הודעת commit בשורה אחת, לרוב בשילוב עם <code>--graph</code> ו-<code>--all</code> לתצוגה ויזואלית של כל הענפים.'
    },
    {
      code: '$ git reset ___ HEAD~1',
      q: 'מה משלים את הפקודה כדי לבטל את ה-commit האחרון, אך להשאיר את השינויים שלו ב-staging (מוכנים ל-commit מחדש)?',
      o: ['<code>--soft</code>', '<code>--hard</code>', '<code>--mixed</code>', '<code>--keep</code>'],
      a: 0,
      w: '<code>--soft</code> מזיז רק את מצביע ה-branch אחורה, בלי לגעת ב-staging או ב-working directory - השינויים "חוזרים" מוכנים ל-commit חדש. ברירת המחדל (בלי דגל) היא <code>--mixed</code>, שגם מרוקנת את ה-staging.'
    },
    {
      code: '$ git checkout ___ -- file.txt',
      q: 'מה משלים את הפקודה כדי לשחזר קובץ למצב שהיה בו ב-commit מסוים (למשל <code>a1b2c3d</code>)?',
      o: ['<code>a1b2c3d</code>', '<code>--restore</code>', '<code>HEAD++</code>', '<code>--force</code>'],
      a: 0,
      w: '<code>git checkout &lt;commit&gt; -- &lt;file&gt;</code> מעתיק את גרסת הקובץ מה-commit שצוין אל ה-working directory (וגם ה-staging), בלי לזוז מהענף הנוכחי. הפקודה המודרנית המקבילה היא <code>git restore --source=&lt;commit&gt; file.txt</code>.'
    },
    {
      code: '$ git remote ___ origin https://github.com/user/repo.git',
      q: 'מה משלים את הפקודה כדי להוסיף remote חדש בשם origin?',
      o: ['<code>add</code>', '<code>set</code>', '<code>new</code>', '<code>create</code>'],
      a: 0,
      w: '<code>git remote add &lt;name&gt; &lt;url&gt;</code> רושם remote חדש. כדי לשנות URL של remote קיים משתמשים ב-<code>git remote set-url</code>.'
    },
    {
      code: '$ git diff ___',
      q: 'מה משלים את הפקודה כדי להשוות את הקבצים שכבר נמצאים ב-staging מול ה-commit האחרון?',
      o: ['<code>--staged</code> (או <code>--cached</code>)', '<code>--all</code>', '<code>HEAD~1</code>', '<code>--commit</code>'],
      a: 0,
      w: '<code>git diff</code> בלי דגלים משווה working directory מול staging. <code>--staged</code>/<code>--cached</code> משווה staging מול ה-commit האחרון - בדיוק מה שעומד להיכנס ל-commit הבא.'
    },
    {
      code: '$ git fetch ___',
      q: 'מה משלים את הפקודה כדי למחוק מקומית מעקב אחר branches מרוחקים שנמחקו ב-remote?',
      o: ['<code>--prune</code>', '<code>--all</code>', '<code>--force</code>', '<code>--tags</code>'],
      a: 0,
      w: '<code>git fetch --prune</code> מנקה branches מרוחקים (למשל <code>origin/old-feature</code>) שכבר נמחקו בפועל ב-remote, כדי ש-<code>git branch -a</code> יציג רשימה מדויקת.'
    },
    {
      code: '$ git commit --___',
      q: 'מה משלים את הפקודה כדי לתקן את הודעת ה-commit האחרון בלי ליצור commit חדש?',
      o: ['<code>amend</code>', '<code>fix</code>', '<code>edit</code>', '<code>rewrite</code>'],
      a: 0,
      w: '<code>git commit --amend</code> פותח עורך להודעת ה-commit האחרון (ואפשר גם להוסיף אליו קבצים ל-staging לפני כן) - יוצר SHA חדש במקום הישן.'
    },
    {
      code: '$ git tag ___ v1.2.0 -m "Release 1.2.0"',
      q: 'מה משלים את הפקודה כדי ליצור טאג annotated (עם הודעה ומטא-דאטה) ולא lightweight?',
      o: ['<code>-a</code>', '<code>-m</code> בלבד מספיק', '<code>--full</code>', '<code>-v</code>'],
      a: 0,
      w: 'טאג ללא <code>-a</code> הוא lightweight - רק מצביע בשם. הדגל <code>-a</code> יוצר אובייקט Git מלא עם מחבר, תאריך והודעה, וזה המומלץ לגרסאות רשמיות.'
    },
    {
      code: '$ git log --grep="___"',
      q: 'מה מחפשת <code>git log --grep</code>?',
      o: ['מחרוזת בתוך הודעות ה-commit', 'שם קובץ', 'שם מחבר בלבד', 'hash של commit'],
      a: 0,
      w: '<code>--grep</code> מסנן לפי תוכן הודעת ה-commit - שימושי לחיפוש commits הקשורים למשל למספר טיקט מסוים.'
    }
  ];

  /* ============================================================
     מצב 4 - התאמת מושגים: סבבים של זוגות פקודה/מושג + תיאור
     ============================================================ */
  var MATCH_ROUNDS = [
    {
      title: 'פקודות ליבה',
      pairs: [
        { l: '<code>git init</code>', r: 'יוצרת repository חדש בתיקייה הנוכחית' },
        { l: '<code>git clone</code>', r: 'מעתיקה repository קיים מה-remote למחשב המקומי' },
        { l: '<code>git add</code>', r: 'מעבירה שינויים מה-working directory ל-staging' },
        { l: '<code>git commit</code>', r: 'שומרת snapshot של ה-staging כחלק קבוע בהיסטוריה' },
        { l: '<code>git status</code>', r: 'מציגה את מצב הקבצים ללא ביצוע שינוי כלשהו' }
      ]
    },
    {
      title: 'ענפים ומיזוג',
      pairs: [
        { l: '<code>git branch</code>', r: 'מציגה/יוצרת/מוחקת ענפים' },
        { l: '<code>git checkout</code> / <code>git switch</code>', r: 'עוברת לענף אחר או ל-commit ספציפי' },
        { l: '<code>git merge</code>', r: 'משלבת שינויים מענף אחד לענף הנוכחי, עם commit מיזוג' },
        { l: '<code>git rebase</code>', r: 'כותבת מחדש commits על גבי base חדש, ליצירת היסטוריה לינארית' },
        { l: 'Fast-forward merge', r: 'מיזוג בלי commit מיוחד - פשוט מזיזים את מצביע הענף קדימה' }
      ]
    },
    {
      title: 'עבודה עם Remote',
      pairs: [
        { l: '<code>git fetch</code>', r: 'מוריד עדכונים מה-remote בלי למזג אותם' },
        { l: '<code>git pull</code>', r: 'שקול ל-fetch ואז merge (או rebase) לענף הנוכחי' },
        { l: '<code>git push</code>', r: 'שולחת commits מקומיים לענף המרוחק' },
        { l: '<code>origin</code>', r: 'השם הסטנדרטי של ה-remote הראשי שממנו שוכפל ה-repo' },
        { l: '<code>git remote -v</code>', r: 'מציגה את רשימת ה-remotes וכתובות ה-URL שלהם' }
      ]
    },
    {
      title: 'ביטול ותיקון שינויים',
      pairs: [
        { l: '<code>git stash</code>', r: 'שומרת שינויים לא-שמורים בצד באופן זמני' },
        { l: '<code>git reset --hard</code>', r: 'מוחקת שינויים גם ב-staging וגם ב-working directory' },
        { l: '<code>git revert</code>', r: 'יוצרת commit חדש שמבטל commit קודם, בלי לשכתב היסטוריה' },
        { l: '<code>git cherry-pick</code>', r: 'מיישמת commit בודד מענף אחר על הענף הנוכחי' },
        { l: '<code>git commit --amend</code>', r: 'מתקנת את ה-commit האחרון במקום ליצור חדש' }
      ]
    }
  ];

  /* ============================================================
     מצב 5 - סידור Workflow: סבבים של שלבים שצריך לסדר בסדר הנכון
     ============================================================ */
  var ORDER_ROUNDS = [
    {
      title: 'זרימת עבודה בסיסית - משינוי קוד ועד ל-remote',
      steps: [
        'עריכת קבצים בתיקיית הפרויקט',
        'הרצת git status לבדיקת מה שונה',
        'הרצת git add על הקבצים הרלוונטיים',
        'הרצת git commit -m עם הודעה ברורה',
        'הרצת git push לענף המרוחק'
      ]
    },
    {
      title: 'עבודה עם feature branch עד למיזוג ל-main',
      steps: [
        'הרצת git checkout -b feature/x מ-main מעודכן',
        'ביצוע שינויים ו-commits על הענף החדש',
        'הרצת git push -u origin feature/x',
        'פתיחת Pull Request וקבלת code review',
        'מיזוג ה-PR לתוך main',
        'מחיקת הענף feature/x מקומית ומרוחק'
      ]
    },
    {
      title: 'טיפול בקונפליקט מיזוג',
      steps: [
        'הרצת git merge שמסתיימת בהודעת CONFLICT',
        'הרצת git status לזיהוי הקבצים הבעייתיים',
        'פתיחת הקבצים ועריכה ידנית של סימוני &lt;&lt;&lt;&lt;&lt;&lt;&lt;/=======/&gt;&gt;&gt;&gt;&gt;&gt;&gt;',
        'הרצת git add על הקבצים שנפתרו',
        'הרצת git commit לסיום המיזוג'
      ]
    },
    {
      title: 'שחזור עבודה זמנית עם stash תוך כדי מעבר ענפים',
      steps: [
        'עבודה על שינויים לא-שמורים בענף הנוכחי',
        'קבלת בקשה דחופה לעבור לענף אחר - הרצת git stash',
        'מעבר לענף האחר עם git checkout ותיקון הבעיה הדחופה',
        'חזרה לענף המקורי עם git checkout',
        'הרצת git stash pop להחזרת השינויים השמורים'
      ]
    }
  ];

  /* ============================================================
     הגדרת מצבי המשחק
     ============================================================ */
  var MODES = [
    { key: 'rapid', icon: '⚡', name: 'קרב מהיר', desc: 'שאלות ידע כלליות על Git - כמה תספיקו לפני שהזמן נגמר?', type: 'quiz', data: RAPID, sample: 8, time: 20000 },
    { key: 'status', icon: '🔎', name: 'ניחוש פלט', desc: 'פקודה או מצב Git - מה בדיוק status/log/diff יראו?', type: 'quiz', data: STATUS_GUESS, sample: 8, time: 28000, showCode: true },
    { key: 'cmd', icon: '🧩', name: 'השלמת פקודה', desc: 'פקודת Git עם חלק חסר - בחרו מה משלים אותה נכון', type: 'quiz', data: CMD_COMPLETE, sample: 8, time: 28000, showCode: true },
    { key: 'match', icon: '🔗', name: 'התאמת מושגים', desc: 'התאימו כל פקודת/מושג Git לתיאור הנכון שלו', type: 'match', data: MATCH_ROUNDS, sample: 2 },
    { key: 'order', icon: '📋', name: 'סידור Workflow', desc: 'סדרו את שלבי התהליך לפי הסדר הנכון', type: 'order', data: ORDER_ROUNDS, sample: 2 }
  ];

  window.TG_CONFIG = { gameId: "git", modes: MODES };
})();
</script>

<script src="/scripts/topic-game.js"></script>
