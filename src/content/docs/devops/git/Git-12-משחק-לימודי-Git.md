---
title: "משחק לימודי: אתגר Git"
category: DevOps/Git
part: 12/10
description: "משחק אינטראקטיבי ללימוד Git - חמישה מצבי משחק עם טיימר, לבבות, ניקוד ורצפים: קרב מהיר, ניחוש git status, השלמת פקודות, התאמת מושגים וסידור workflow."
---

חמישה מצבי משחק שבודקים היבטים שונים של Git - לא עוד חידון רב-ברירה, אלא משחק עם **טיימר**, **שלושה לבבות**, **מכפיל רצף** ו**שיא אישי** שנשמר בדפדפן. בסוף כל סבב תקבלו דירוג, ורשימת חזרה של בדיוק מה שפספסתם.

<div class="gg" id="gg" dir="rtl">
  <div class="gg-screen is-active" data-screen="menu">
    <div class="gg-hero">
      <div class="gg-hero-badge">Git</div>
      <div class="gg-hero-title">אתגר Git</div>
      <div class="gg-hero-sub">בחרו מצב משחק. יש לכם 3 לבבות - תשובה שגויה, טעות בהתאמה או נגמר הזמן עולים לב אחד.</div>
    </div>
    <div class="gg-modes" id="gg-modes"></div>
    <div class="gg-hero-foot">💡 טיפ: במצבי השאלות אפשר לענות עם המקשים <kbd>1</kbd>–<kbd>4</kbd> ולהתקדם עם <kbd>Enter</kbd>.</div>
  </div>
  <div class="gg-screen" data-screen="play">
    <div class="gg-hud">
      <button class="gg-quit" type="button" id="gg-quit">← יציאה</button>
      <div class="gg-mode-title" id="gg-mode-name"></div>
      <div class="gg-hud-stats">
        <span class="gg-lives" id="gg-lives"></span>
        <span class="gg-chip">ניקוד <b id="gg-score">0</b></span>
        <span class="gg-chip">רצף <b id="gg-streak">0</b></span>
      </div>
    </div>
    <div class="gg-progress"><i class="gg-progress-bar" id="gg-progress"></i></div>
    <div class="gg-timer-wrap" id="gg-timer-wrap"><i class="gg-timer-bar" id="gg-timer"></i></div>
    <div class="gg-stage" id="gg-stage"></div>
    <div class="gg-foot">
      <div class="gg-feedback" id="gg-feedback" aria-live="polite"></div>
      <button class="gg-btn gg-btn--primary gg-next" type="button" id="gg-next" hidden>הבא ←</button>
    </div>
  </div>
  <div class="gg-screen" data-screen="result">
    <div id="gg-result"></div>
    <div class="gg-result-actions">
      <button class="gg-btn gg-btn--primary" type="button" id="gg-again">שחק שוב</button>
      <button class="gg-btn" type="button" id="gg-menu">חזרה לתפריט</button>
    </div>
  </div>
</div>

<style>
.gg {
  border: 1px solid var(--sl-color-hairline);
  border-radius: 14px;
  background: var(--sl-color-bg-nav);
  padding: 1.1rem;
  margin: 1.5rem 0;
}

.gg-screen { display: none; }
.gg-screen.is-active { display: block; }

/* ---------- מסך תפריט ---------- */
.gg-hero { text-align: center; padding: 0.6rem 0 1.2rem; }

.gg-hero-badge {
  display: inline-block;
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 0.2rem 0.7rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--sl-color-accent) 22%, transparent);
  color: var(--sl-color-white);
  margin-bottom: 0.6rem;
}

.gg-hero-title {
  font-size: clamp(1.5rem, 4vw, 2.1rem);
  font-weight: 700;
  line-height: 1.2;
  color: var(--sl-color-white);
}

.gg-hero-sub {
  margin: 0.5rem auto 0;
  max-width: 46ch;
  font-size: 0.94rem;
  color: var(--sl-color-gray-3);
}

.gg-hero-foot {
  margin-top: 1rem;
  text-align: center;
  font-size: 0.85rem;
  color: var(--sl-color-gray-3);
}

.gg-modes { display: grid; gap: 0.7rem; }

.gg-mode {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  width: 100%;
  text-align: right;
  padding: 0.85rem 1rem;
  border: 1px solid var(--sl-color-hairline);
  border-radius: 12px;
  background: var(--sl-color-bg);
  color: var(--sl-color-text);
  font: inherit;
  cursor: pointer;
  transition: border-color 0.15s ease, background-color 0.15s ease, transform 0.15s ease;
}

.gg-mode:hover, .gg-mode:focus-visible {
  border-color: var(--sl-color-accent);
  background: var(--sl-color-gray-6);
  transform: translateY(-1px);
}

.gg-mode-icon { font-size: 1.7rem; line-height: 1; flex-shrink: 0; }
.gg-mode-body { display: flex; flex-direction: column; gap: 0.15rem; flex-grow: 1; }
.gg-mode-name { font-weight: 600; color: var(--sl-color-white); }
.gg-mode-desc { font-size: 0.86rem; color: var(--sl-color-gray-3); line-height: 1.45; }

.gg-mode-best {
  flex-shrink: 0;
  font-size: 0.78rem;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  background: var(--sl-color-gray-6);
  color: var(--sl-color-gray-2);
  white-space: nowrap;
}

/* ---------- HUD ---------- */
.gg-hud {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
  margin-bottom: 0.7rem;
}

.gg-quit {
  border: 1px solid var(--sl-color-hairline);
  background: var(--sl-color-bg);
  color: var(--sl-color-gray-2);
  border-radius: 8px;
  padding: 0.3rem 0.7rem;
  font: inherit;
  font-size: 0.83rem;
  cursor: pointer;
}

.gg-quit:hover { border-color: var(--sl-color-accent); }

.gg-mode-title { font-weight: 600; color: var(--sl-color-white); flex-grow: 1; }
.gg-hud-stats { display: flex; align-items: center; gap: 0.45rem; flex-wrap: wrap; }
.gg-lives { letter-spacing: 0.1em; font-size: 0.95rem; }
.gg-heart.is-lost { opacity: 0.45; }

.gg-chip {
  font-size: 0.8rem;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  background: var(--sl-color-gray-6);
  border: 1px solid var(--sl-color-hairline);
  color: var(--sl-color-gray-2);
  white-space: nowrap;
}

.gg-chip b { color: var(--sl-color-white); font-variant-numeric: tabular-nums; }

.gg-progress, .gg-timer-wrap {
  height: 6px;
  border-radius: 999px;
  background: var(--sl-color-gray-6);
  overflow: hidden;
  margin-bottom: 0.4rem;
}

.gg-progress-bar, .gg-timer-bar {
  display: block;
  height: 100%;
  width: 0;
  border-radius: 999px;
  background: var(--sl-color-accent);
}

.gg-progress-bar { transition: width 0.3s ease; }
.gg-timer-bar { background: var(--sl-color-green); }
.gg-timer-bar.is-low { background: var(--sl-color-red); }
.gg-timer-wrap[hidden] { display: none; }

/* ---------- שאלות ---------- */
.gg-stage { padding: 0.7rem 0 0; }
.gg-qnum { font-size: 0.8rem; color: var(--sl-color-gray-3); margin-bottom: 0.4rem; }

.gg-q {
  font-size: 1.02rem;
  font-weight: 600;
  line-height: 1.55;
  color: var(--sl-color-white);
  margin-bottom: 0.7rem;
}

.gg-code {
  direction: ltr;
  text-align: left;
  font-size: 0.82rem;
  line-height: 1.5;
  padding: 0.75rem 0.9rem;
  margin: 0 0 0.8rem;
  border: 1px solid var(--sl-color-hairline);
  border-radius: 10px;
  background: var(--sl-color-bg);
  overflow-x: auto;
  white-space: pre;
}

.gg-opts { display: grid; gap: 0.45rem; }

.gg-opt {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  width: 100%;
  text-align: right;
  padding: 0.6rem 0.8rem;
  border: 1px solid var(--sl-color-hairline);
  border-radius: 10px;
  background: var(--sl-color-bg);
  color: var(--sl-color-text);
  font: inherit;
  line-height: 1.5;
  cursor: pointer;
  transition: border-color 0.15s ease, background-color 0.15s ease;
}

.gg-opt:hover:not(:disabled) { border-color: var(--sl-color-accent); background: var(--sl-color-gray-6); }
.gg-opt:disabled { cursor: default; }

.gg-key {
  flex-shrink: 0;
  width: 1.5rem;
  height: 1.5rem;
  display: grid;
  place-items: center;
  border-radius: 6px;
  background: var(--sl-color-gray-6);
  color: var(--sl-color-gray-2);
  font-size: 0.78rem;
  font-weight: 600;
}

.gg-opt.is-right {
  border-color: var(--sl-color-green);
  background: color-mix(in srgb, var(--sl-color-green) 16%, var(--sl-color-bg));
}

.gg-opt.is-wrong {
  border-color: var(--sl-color-red);
  background: color-mix(in srgb, var(--sl-color-red) 16%, var(--sl-color-bg));
}

/* ---------- משוב ---------- */
.gg-foot { margin-top: 0.9rem; display: flex; flex-direction: column; gap: 0.7rem; }

.gg-feedback:not(:empty) {
  padding: 0.7rem 0.9rem;
  border-radius: 10px;
  border: 1px solid var(--sl-color-hairline);
  background: var(--sl-color-bg);
  font-size: 0.9rem;
}

.gg-feedback.is-right { border-color: var(--sl-color-green); }
.gg-feedback.is-wrong { border-color: var(--sl-color-red); }
.gg-fb-head { font-weight: 700; margin-bottom: 0.3rem; }
.gg-feedback.is-right .gg-fb-head { color: var(--sl-color-green-high, var(--sl-color-green)); }
.gg-feedback.is-wrong .gg-fb-head { color: var(--sl-color-red-high, var(--sl-color-red)); }
.gg-fb-why { color: var(--sl-color-gray-2); line-height: 1.6; }

.gg-btn {
  align-self: flex-start;
  padding: 0.5rem 1.2rem;
  border-radius: 9px;
  border: 1px solid var(--sl-color-hairline);
  background: var(--sl-color-bg);
  color: var(--sl-color-text);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

.gg-btn:hover { border-color: var(--sl-color-accent); }

.gg-btn--primary {
  background: var(--sl-color-accent);
  border-color: var(--sl-color-accent);
  color: var(--sl-color-white);
}

.gg-btn--primary:hover { background: var(--sl-color-accent-high, var(--sl-color-accent)); }

/* ---------- התאמת מושגים ---------- */
.gg-match { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.35fr); gap: 0.6rem; }
.gg-match-col { display: grid; gap: 0.45rem; align-content: start; }

.gg-mi {
  text-align: right;
  padding: 0.55rem 0.7rem;
  border: 1px solid var(--sl-color-hairline);
  border-radius: 10px;
  background: var(--sl-color-bg);
  color: var(--sl-color-text);
  font: inherit;
  font-size: 0.88rem;
  line-height: 1.45;
  cursor: pointer;
  transition: border-color 0.15s ease, background-color 0.15s ease;
}

.gg-mi code { direction: ltr; display: inline-block; font-size: 0.85em; }
.gg-mi:hover:not(:disabled) { border-color: var(--sl-color-accent); background: var(--sl-color-gray-6); }
.gg-mi.is-sel { border-color: var(--sl-color-accent); background: color-mix(in srgb, var(--sl-color-accent) 18%, var(--sl-color-bg)); }

.gg-mi.is-done {
  border-color: var(--sl-color-green);
  background: color-mix(in srgb, var(--sl-color-green) 14%, var(--sl-color-bg));
  opacity: 0.75;
  cursor: default;
}

/* ---------- סידור workflow ---------- */
.gg-picked {
  list-style: decimal;
  padding-inline-start: 1.6rem;
  margin: 0 0 0.8rem;
  display: grid;
  gap: 0.3rem;
  min-height: 0;
}

.gg-picked:empty { display: none; }

.gg-picked-item {
  padding: 0.35rem 0.6rem;
  border-radius: 8px;
  border: 1px solid var(--sl-color-green);
  background: color-mix(in srgb, var(--sl-color-green) 12%, var(--sl-color-bg));
  font-size: 0.88rem;
}

.gg-pool { display: grid; gap: 0.45rem; }

.gg-step {
  text-align: right;
  padding: 0.55rem 0.8rem;
  border: 1px dashed var(--sl-color-gray-4);
  border-radius: 10px;
  background: var(--sl-color-bg);
  color: var(--sl-color-text);
  font: inherit;
  font-size: 0.9rem;
  line-height: 1.45;
  cursor: pointer;
}

.gg-step:hover:not(:disabled) { border-color: var(--sl-color-accent); border-style: solid; }
.gg-step:disabled { opacity: 0.35; cursor: default; text-decoration: line-through; }

@keyframes gg-shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(5px); }
  75% { transform: translateX(-5px); }
}

.gg-shake { animation: gg-shake 0.3s ease; border-color: var(--sl-color-red) !important; }

/* ---------- מסך סיכום ---------- */
.gg-rank { text-align: center; padding: 0.8rem 0 1.1rem; }
.gg-rank-icon { display: block; font-size: 2.8rem; line-height: 1; }
.gg-rank-name { display: block; font-size: 1.35rem; font-weight: 700; color: var(--sl-color-white); margin-top: 0.35rem; }
.gg-rank-note { display: block; font-size: 0.9rem; color: var(--sl-color-gray-3); margin-top: 0.3rem; }

.gg-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(6.5rem, 1fr)); gap: 0.5rem; }

.gg-stat {
  text-align: center;
  padding: 0.6rem 0.4rem;
  border: 1px solid var(--sl-color-hairline);
  border-radius: 10px;
  background: var(--sl-color-bg);
}

.gg-stat-v { display: block; font-size: 1.3rem; font-weight: 700; color: var(--sl-color-white); font-variant-numeric: tabular-nums; }
.gg-stat-k { display: block; font-size: 0.78rem; color: var(--sl-color-gray-3); }

.gg-record {
  margin-top: 0.7rem;
  text-align: center;
  font-weight: 600;
  padding: 0.5rem;
  border-radius: 9px;
  background: color-mix(in srgb, var(--sl-color-accent) 16%, transparent);
}

.gg-record--muted { background: var(--sl-color-gray-6); font-weight: 400; color: var(--sl-color-gray-3); }
.gg-review { margin-top: 1.2rem; }
.gg-review-h { font-size: 1.02rem; margin: 0 0 0.6rem; }

.gg-review-item {
  padding: 0.75rem 0.9rem;
  margin-bottom: 0.6rem;
  border: 1px solid var(--sl-color-hairline);
  border-inline-start: 3px solid var(--sl-color-red);
  border-radius: 10px;
  background: var(--sl-color-bg);
  font-size: 0.9rem;
}

.gg-review-q { font-weight: 600; margin-bottom: 0.45rem; line-height: 1.5; }
.gg-review-a { margin-bottom: 0.4rem; line-height: 1.55; }
.gg-result-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 1.2rem; }

@media (max-width: 34rem) {
  .gg { padding: 0.8rem; }
  .gg-match { grid-template-columns: 1fr; }
  .gg-mode { flex-wrap: wrap; }
  .gg-mode-best { order: 3; }
}
</style>

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

  /* ============================================================
     מנוע המשחק
     ============================================================ */
  var $ = function (id) { return document.getElementById(id); };

  var els = {
    modes: $('gg-modes'),
    quit: $('gg-quit'),
    modeName: $('gg-mode-name'),
    lives: $('gg-lives'),
    score: $('gg-score'),
    streak: $('gg-streak'),
    progress: $('gg-progress'),
    timerWrap: $('gg-timer-wrap'),
    timer: $('gg-timer'),
    stage: $('gg-stage'),
    feedback: $('gg-feedback'),
    next: $('gg-next'),
    result: $('gg-result'),
    again: $('gg-again'),
    menuBtn: $('gg-menu')
  };

  var root = $('gg');
  var screens = {};
  Array.prototype.forEach.call(root.querySelectorAll('.gg-screen'), function (el) {
    screens[el.getAttribute('data-screen')] = el;
  });

  function showScreen(name) {
    Object.keys(screens).forEach(function (k) {
      screens[k].classList.toggle('is-active', k === name);
    });
  }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  function sampleN(arr, n) {
    var shuffled = shuffle(arr);
    return shuffled.slice(0, Math.min(n, shuffled.length));
  }

  function bestKey(modeKey) { return 'gg-best-' + modeKey; }

  function getBest(modeKey) {
    try {
      var raw = localStorage.getItem(bestKey(modeKey));
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  function setBest(modeKey, score) {
    try {
      var cur = getBest(modeKey);
      if (!cur || score > cur.score) {
        localStorage.setItem(bestKey(modeKey), JSON.stringify({ score: score }));
        return true;
      }
    } catch (e) { /* private mode / storage disabled - ignore */ }
    return false;
  }

  var state = null;

  function renderMenu() {
    els.modes.innerHTML = '';
    MODES.forEach(function (mode) {
      var best = getBest(mode.key);
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'gg-mode';
      btn.innerHTML =
        '<span class="gg-mode-icon">' + mode.icon + '</span>' +
        '<span class="gg-mode-body">' +
          '<span class="gg-mode-name">' + esc(mode.name) + '</span>' +
          '<span class="gg-mode-desc">' + esc(mode.desc) + '</span>' +
        '</span>' +
        (best ? '<span class="gg-mode-best">שיא: ' + best.score + '</span>' : '');
      btn.addEventListener('click', function () { startMode(mode); });
      els.modes.appendChild(btn);
    });
  }

  function startMode(mode) {
    var order = sampleN(mode.data.map(function (_, i) { return i; }), mode.sample);

    state = {
      mode: mode,
      order: order,
      qi: 0,
      score: 0,
      streak: 0,
      bestStreak: 0,
      lives: 3,
      wrongLog: [],
      answered: false,
      timerId: null,
      timeLimit: mode.time || 0,
      matchSel: null,
      matchDone: 0,
      orderPicked: []
    };

    els.modeName.textContent = mode.icon + ' ' + mode.name;
    updateHud();
    showScreen('play');
    renderStage();
  }

  function updateHud() {
    var hearts = '';
    for (var i = 0; i < 3; i++) {
      hearts += '<span class="gg-heart' + (i < state.lives ? '' : ' is-lost') + '">' + (i < state.lives ? '❤️' : '🖤') + '</span>';
    }
    els.lives.innerHTML = hearts;
    els.score.textContent = state.score;
    els.streak.textContent = state.streak;
  }

  function updateProgress() {
    var pct = state.order.length ? (state.qi / state.order.length) * 100 : 0;
    els.progress.style.width = pct + '%';
  }

  function clearTimer() {
    if (state.timerId) {
      clearInterval(state.timerId);
      state.timerId = null;
    }
  }

  function startTimer(onTimeout) {
    clearTimer();
    if (!state.timeLimit) {
      els.timerWrap.hidden = true;
      return;
    }
    els.timerWrap.hidden = false;
    els.timer.classList.remove('is-low');
    els.timer.style.width = '100%';
    var start = Date.now();
    var duration = state.timeLimit;
    state.timerId = setInterval(function () {
      var elapsed = Date.now() - start;
      var remaining = Math.max(0, duration - elapsed);
      var pct = (remaining / duration) * 100;
      els.timer.style.width = pct + '%';
      els.timer.classList.toggle('is-low', pct < 30);
      if (remaining <= 0) {
        clearTimer();
        onTimeout();
      }
    }, 100);
  }

  function setFeedback(kind, headText, whyHtml) {
    if (!headText) {
      els.feedback.className = 'gg-feedback';
      els.feedback.innerHTML = '';
      return;
    }
    els.feedback.className = 'gg-feedback is-' + kind;
    els.feedback.innerHTML =
      '<div class="gg-fb-head">' + esc(headText) + '</div>' +
      (whyHtml ? '<div class="gg-fb-why">' + whyHtml + '</div>' : '');
  }

  function renderStage() {
    updateProgress();
    setFeedback(null);
    els.next.hidden = true;
    els.stage.innerHTML = '';
    state.answered = false;

    var mode = state.mode;
    if (mode.type === 'quiz') renderQuiz();
    else if (mode.type === 'match') renderMatch();
    else if (mode.type === 'order') renderOrder();
  }

  /* ---------- מצבי שאלה (quiz) ---------- */
  function renderQuiz() {
    var mode = state.mode;
    var q = mode.data[state.order[state.qi]];
    var html = '<div class="gg-qnum">שאלה ' + (state.qi + 1) + ' מתוך ' + state.order.length + '</div>';
    if (mode.showCode && q.code) {
      html += '<pre class="gg-code">' + esc(q.code) + '</pre>';
    }
    html += '<div class="gg-q">' + q.q + '</div>';
    html += '<div class="gg-opts">';
    q.o.forEach(function (opt, i) {
      html += '<button type="button" class="gg-opt" data-i="' + i + '"><span class="gg-key">' + (i + 1) + '</span><span>' + opt + '</span></button>';
    });
    html += '</div>';
    els.stage.innerHTML = html;

    Array.prototype.forEach.call(els.stage.querySelectorAll('.gg-opt'), function (btn) {
      btn.addEventListener('click', function () {
        answerQuiz(parseInt(btn.getAttribute('data-i'), 10));
      });
    });

    startTimer(function () { answerQuiz(-1); });
  }

  function answerQuiz(idx) {
    if (state.answered) return;
    state.answered = true;
    clearTimer();

    var mode = state.mode;
    var q = mode.data[state.order[state.qi]];
    var correct = idx === q.a;
    var opts = els.stage.querySelectorAll('.gg-opt');

    Array.prototype.forEach.call(opts, function (btn) {
      var i = parseInt(btn.getAttribute('data-i'), 10);
      btn.disabled = true;
      if (i === q.a) btn.classList.add('is-right');
      else if (i === idx) btn.classList.add('is-wrong');
    });

    registerAnswer(correct, q.q.replace(/<[^>]+>/g, ''), q.o[q.a].replace(/<[^>]+>/g, ''), q.w, idx === -1);
  }

  /* ---------- מצב התאמה (match) ---------- */
  function renderMatch() {
    var mode = state.mode;
    var round = mode.data[state.order[state.qi]];
    state.matchSel = null;
    state.matchDone = 0;

    var leftOrder = shuffle(round.pairs.map(function (_, i) { return i; }));
    var rightOrder = shuffle(round.pairs.map(function (_, i) { return i; }));

    var html = '<div class="gg-qnum">סבב ' + (state.qi + 1) + ' מתוך ' + state.order.length + ' - ' + esc(round.title) + '</div>';
    html += '<div class="gg-q">בחרו פקודה/מושג, ואז את התיאור המתאים לו</div>';
    html += '<div class="gg-match">';
    html += '<div class="gg-match-col" id="gg-match-left">';
    leftOrder.forEach(function (pi) {
      html += '<button type="button" class="gg-mi" data-pi="' + pi + '" data-side="l">' + round.pairs[pi].l + '</button>';
    });
    html += '</div><div class="gg-match-col" id="gg-match-right">';
    rightOrder.forEach(function (pi) {
      html += '<button type="button" class="gg-mi" data-pi="' + pi + '" data-side="r">' + esc(round.pairs[pi].r) + '</button>';
    });
    html += '</div></div>';
    els.stage.innerHTML = html;

    Array.prototype.forEach.call(els.stage.querySelectorAll('.gg-mi'), function (btn) {
      btn.addEventListener('click', function () { handleMatchClick(btn, round); });
    });
  }

  function handleMatchClick(btn, round) {
    var side = btn.getAttribute('data-side');
    var pi = parseInt(btn.getAttribute('data-pi'), 10);

    if (side === 'l') {
      var prevSel = els.stage.querySelector('.gg-mi.is-sel');
      if (prevSel) prevSel.classList.remove('is-sel');
      state.matchSel = { btn: btn, pi: pi };
      btn.classList.add('is-sel');
      return;
    }

    // side === 'r'
    if (!state.matchSel) return;
    var leftBtn = state.matchSel.btn;
    var correct = state.matchSel.pi === pi;

    if (correct) {
      leftBtn.classList.remove('is-sel');
      leftBtn.classList.add('is-done');
      leftBtn.disabled = true;
      btn.classList.add('is-done');
      btn.disabled = true;
      state.matchSel = null;
      state.matchDone++;
      state.score += 60 + state.streak * 10;
      state.streak++;
      state.bestStreak = Math.max(state.bestStreak, state.streak);
      updateHud();

      if (state.matchDone >= round.pairs.length) {
        setFeedback('right', '🎉 הסבב הושלם!', 'התאמתם נכון את כל ' + round.pairs.length + ' הזוגות.');
        els.next.hidden = false;
      }
    } else {
      btn.classList.add('gg-shake');
      setTimeout(function () { btn.classList.remove('gg-shake'); }, 300);
      state.streak = 0;
      state.lives--;
      updateHud();
      if (checkGameOver()) return;
    }
  }

  /* ---------- מצב סידור (order) ---------- */
  function renderOrder() {
    var mode = state.mode;
    var round = mode.data[state.order[state.qi]];
    state.orderPicked = [];

    var poolOrder = shuffle(round.steps.map(function (_, i) { return i; }));

    var html = '<div class="gg-qnum">סבב ' + (state.qi + 1) + ' מתוך ' + state.order.length + ' - ' + esc(round.title) + '</div>';
    html += '<div class="gg-q">לחצו על השלבים לפי הסדר הנכון</div>';
    html += '<ol class="gg-picked" id="gg-order-picked"></ol>';
    html += '<div class="gg-pool" id="gg-order-pool">';
    poolOrder.forEach(function (si) {
      html += '<button type="button" class="gg-step" data-si="' + si + '">' + esc(round.steps[si]) + '</button>';
    });
    html += '</div>';
    els.stage.innerHTML = html;

    Array.prototype.forEach.call(els.stage.querySelectorAll('.gg-step'), function (btn) {
      btn.addEventListener('click', function () { handleOrderClick(btn, round); });
    });
  }

  function handleOrderClick(btn, round) {
    if (btn.disabled) return;
    var si = parseInt(btn.getAttribute('data-si'), 10);
    var expected = state.orderPicked.length;

    if (si === expected) {
      btn.disabled = true;
      state.orderPicked.push(si);
      var picked = $('gg-order-picked');
      var li = document.createElement('li');
      li.className = 'gg-picked-item';
      li.textContent = round.steps[si];
      picked.appendChild(li);

      state.score += 60 + state.streak * 10;
      state.streak++;
      state.bestStreak = Math.max(state.bestStreak, state.streak);
      updateHud();

      if (state.orderPicked.length >= round.steps.length) {
        setFeedback('right', '🎉 הרצף הושלם!', 'סידרתם נכון את כל ' + round.steps.length + ' השלבים.');
        els.next.hidden = false;
      }
    } else {
      btn.classList.add('gg-shake');
      setTimeout(function () { btn.classList.remove('gg-shake'); }, 300);
      state.streak = 0;
      state.lives--;
      updateHud();
      checkGameOver();
    }
  }

  /* ---------- לוגיקה משותפת ---------- */
  function registerAnswer(correct, questionText, correctText, whyHtml, timedOut) {
    if (correct) {
      state.score += 100 + state.streak * 20;
      state.streak++;
      state.bestStreak = Math.max(state.bestStreak, state.streak);
      setFeedback('right', '✅ נכון!', whyHtml);
    } else {
      state.streak = 0;
      state.lives--;
      setFeedback('wrong', timedOut ? '⏱️ נגמר הזמן' : '❌ לא נכון', 'התשובה הנכונה: ' + esc(correctText) + (whyHtml ? '<br>' + whyHtml : ''));
      state.wrongLog.push({ q: questionText, a: correctText, w: whyHtml });
    }
    updateHud();
    if (!checkGameOver()) {
      els.next.hidden = false;
    }
  }

  function checkGameOver() {
    if (state.lives <= 0) {
      clearTimer();
      setTimeout(function () { endGame(false); }, 700);
      return true;
    }
    return false;
  }

  function nextStep() {
    state.qi++;
    if (state.qi >= state.order.length) {
      endGame(true);
    } else {
      renderStage();
    }
  }

  function rankFor(finished) {
    if (!finished) {
      return { icon: '🔄', name: 'כדאי לחזור על החומר', note: 'נגמרו לכם הלבבות - אבל זה בדיוק מה שהמשחק נועד להראות. עברו שוב על ההסברים למטה ונסו שוב.' };
    }
    var lost = 3 - state.lives;
    if (lost === 0) return { icon: '🏆', name: 'מומחה Git', note: 'סבב מושלם בלי אף טעות. מרשים!' };
    if (lost === 1) return { icon: '💪', name: 'שולט היטב', note: 'כמעט מושלם - טעות אחת בלבד.' };
    return { icon: '📘', name: 'בדרך הנכונה', note: 'יש עוד קצת ללמוד, אבל הכיוון טוב.' };
  }

  function endGame(finished) {
    clearTimer();
    showScreen('result');
    var rank = rankFor(finished);
    var isNewBest = setBest(state.mode.key, state.score);
    var best = getBest(state.mode.key);

    var html = '<div class="gg-rank">' +
      '<span class="gg-rank-icon">' + rank.icon + '</span>' +
      '<span class="gg-rank-name">' + esc(rank.name) + '</span>' +
      '<span class="gg-rank-note">' + esc(rank.note) + '</span>' +
      '</div>';

    html += '<div class="gg-stats">' +
      '<div class="gg-stat"><span class="gg-stat-v">' + state.score + '</span><span class="gg-stat-k">ניקוד</span></div>' +
      '<div class="gg-stat"><span class="gg-stat-v">' + state.bestStreak + '</span><span class="gg-stat-k">רצף שיא</span></div>' +
      '<div class="gg-stat"><span class="gg-stat-v">' + state.lives + ' / 3</span><span class="gg-stat-k">לבבות שנותרו</span></div>' +
      '<div class="gg-stat"><span class="gg-stat-v">' + state.wrongLog.length + '</span><span class="gg-stat-k">טעויות</span></div>' +
      '</div>';

    if (isNewBest) {
      html += '<div class="gg-record">🎉 שיא חדש במצב הזה: ' + state.score + ' נקודות!</div>';
    } else if (best) {
      html += '<div class="gg-record gg-record--muted">השיא שלכם במצב הזה: ' + best.score + ' נקודות</div>';
    }

    if (state.wrongLog.length) {
      html += '<div class="gg-review"><h3 class="gg-review-h">מה כדאי לחזור עליו</h3>';
      state.wrongLog.forEach(function (item) {
        html += '<div class="gg-review-item">' +
          '<div class="gg-review-q">' + item.q + '</div>' +
          '<div class="gg-review-a">✔️ ' + esc(item.a) + '</div>' +
          (item.w ? '<div class="gg-review-a">' + item.w + '</div>' : '') +
          '</div>';
      });
      html += '</div>';
    }

    els.result.innerHTML = html;
  }

  /* ---------- מאזיני אירועים כלליים ---------- */
  els.next.addEventListener('click', nextStep);
  els.quit.addEventListener('click', function () { clearTimer(); showScreen('menu'); renderMenu(); });
  els.again.addEventListener('click', function () { startMode(state.mode); });
  els.menuBtn.addEventListener('click', function () { showScreen('menu'); renderMenu(); });

  document.addEventListener('keydown', function (e) {
    if (!screens.play.classList.contains('is-active')) return;
    if (!state || state.mode.type !== 'quiz') return;

    if (!state.answered && e.key >= '1' && e.key <= '9') {
      var idx = parseInt(e.key, 10) - 1;
      var opts = els.stage.querySelectorAll('.gg-opt');
      if (idx < opts.length) answerQuiz(idx);
    } else if (state.answered && e.key === 'Enter' && !els.next.hidden) {
      nextStep();
    }
  });

  renderMenu();
})();
</script>
