---
sidebar_position: 13
title: "משחק לימודי: אתגר Terraform"
description: "משחק אינטראקטיבי ללימוד Terraform - חמישה מצבי משחק עם טיימר, לבבות, ניקוד ורצפים: קרב מהיר, ניחוש plan, השלמת קוד HCL, התאמת פקודות וסידור workflow."
---

חמישה מצבי משחק שבודקים היבטים שונים של Terraform - לא עוד חידון רב-ברירה, אלא משחק עם **טיימר**, **שלושה לבבות**, **מכפיל רצף** ו**שיא אישי** שנשמר בדפדפן. בסוף כל סבב תקבלו דירוג, ורשימת חזרה של בדיוק מה שפספסתם.

<div class="tfg" id="tfg" dir="rtl">
  <div class="tfg-screen is-active" data-screen="menu">
    <div class="tfg-hero">
      <div class="tfg-hero-badge">Terraform</div>
      <div class="tfg-hero-title">אתגר Terraform</div>
      <div class="tfg-hero-sub">בחרו מצב משחק. יש לכם 3 לבבות - תשובה שגויה, טעות בהתאמה או נגמר הזמן עולים לב אחד.</div>
    </div>
    <div class="tfg-modes" id="tfg-modes"></div>
    <div class="tfg-hero-foot">💡 טיפ: במצבי השאלות אפשר לענות עם המקשים <kbd>1</kbd>–<kbd>4</kbd> ולהתקדם עם <kbd>Enter</kbd>.</div>
  </div>
  <div class="tfg-screen" data-screen="play">
    <div class="tfg-hud">
      <button class="tfg-quit" type="button" id="tfg-quit">← יציאה</button>
      <div class="tfg-mode-title" id="tfg-mode-name"></div>
      <div class="tfg-hud-stats">
        <span class="tfg-lives" id="tfg-lives"></span>
        <span class="tfg-chip">ניקוד <b id="tfg-score">0</b></span>
        <span class="tfg-chip">רצף <b id="tfg-streak">0</b></span>
      </div>
    </div>
    <div class="tfg-progress"><i class="tfg-progress-bar" id="tfg-progress"></i></div>
    <div class="tfg-timer-wrap" id="tfg-timer-wrap"><i class="tfg-timer-bar" id="tfg-timer"></i></div>
    <div class="tfg-stage" id="tfg-stage"></div>
    <div class="tfg-foot">
      <div class="tfg-feedback" id="tfg-feedback" aria-live="polite"></div>
      <button class="tfg-btn tfg-btn--primary tfg-next" type="button" id="tfg-next" hidden>הבא ←</button>
    </div>
  </div>
  <div class="tfg-screen" data-screen="result">
    <div id="tfg-result"></div>
    <div class="tfg-result-actions">
      <button class="tfg-btn tfg-btn--primary" type="button" id="tfg-again">שחק שוב</button>
      <button class="tfg-btn" type="button" id="tfg-menu">חזרה לתפריט</button>
    </div>
  </div>
</div>

<style>
.tfg {
  border: 1px solid var(--sl-color-hairline);
  border-radius: 14px;
  background: var(--sl-color-bg-nav);
  padding: 1.1rem;
  margin: 1.5rem 0;
}

.tfg-screen { display: none; }
.tfg-screen.is-active { display: block; }

/* ---------- מסך תפריט ---------- */
.tfg-hero { text-align: center; padding: 0.6rem 0 1.2rem; }

.tfg-hero-badge {
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

.tfg-hero-title {
  font-size: clamp(1.5rem, 4vw, 2.1rem);
  font-weight: 700;
  line-height: 1.2;
  color: var(--sl-color-white);
}

.tfg-hero-sub {
  margin: 0.5rem auto 0;
  max-width: 46ch;
  font-size: 0.94rem;
  color: var(--sl-color-gray-3);
}

.tfg-hero-foot {
  margin-top: 1rem;
  text-align: center;
  font-size: 0.85rem;
  color: var(--sl-color-gray-3);
}

.tfg-modes { display: grid; gap: 0.7rem; }

.tfg-mode {
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

.tfg-mode:hover, .tfg-mode:focus-visible {
  border-color: var(--sl-color-accent);
  background: var(--sl-color-gray-6);
  transform: translateY(-1px);
}

.tfg-mode-icon { font-size: 1.7rem; line-height: 1; flex-shrink: 0; }
.tfg-mode-body { display: flex; flex-direction: column; gap: 0.15rem; flex-grow: 1; }
.tfg-mode-name { font-weight: 600; color: var(--sl-color-white); }
.tfg-mode-desc { font-size: 0.86rem; color: var(--sl-color-gray-3); line-height: 1.45; }

.tfg-mode-best {
  flex-shrink: 0;
  font-size: 0.78rem;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  background: var(--sl-color-gray-6);
  color: var(--sl-color-gray-2);
  white-space: nowrap;
}

/* ---------- HUD ---------- */
.tfg-hud {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
  margin-bottom: 0.7rem;
}

.tfg-quit {
  border: 1px solid var(--sl-color-hairline);
  background: var(--sl-color-bg);
  color: var(--sl-color-gray-2);
  border-radius: 8px;
  padding: 0.3rem 0.7rem;
  font: inherit;
  font-size: 0.83rem;
  cursor: pointer;
}

.tfg-quit:hover { border-color: var(--sl-color-accent); }

.tfg-mode-title { font-weight: 600; color: var(--sl-color-white); flex-grow: 1; }
.tfg-hud-stats { display: flex; align-items: center; gap: 0.45rem; flex-wrap: wrap; }
.tfg-lives { letter-spacing: 0.1em; font-size: 0.95rem; }
.tfg-heart.is-lost { opacity: 0.45; }

.tfg-chip {
  font-size: 0.8rem;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  background: var(--sl-color-gray-6);
  border: 1px solid var(--sl-color-hairline);
  color: var(--sl-color-gray-2);
  white-space: nowrap;
}

.tfg-chip b { color: var(--sl-color-white); font-variant-numeric: tabular-nums; }

.tfg-progress, .tfg-timer-wrap {
  height: 6px;
  border-radius: 999px;
  background: var(--sl-color-gray-6);
  overflow: hidden;
  margin-bottom: 0.4rem;
}

.tfg-progress-bar, .tfg-timer-bar {
  display: block;
  height: 100%;
  width: 0;
  border-radius: 999px;
  background: var(--sl-color-accent);
}

.tfg-progress-bar { transition: width 0.3s ease; }
.tfg-timer-bar { background: var(--sl-color-green); }
.tfg-timer-bar.is-low { background: var(--sl-color-red); }
.tfg-timer-wrap[hidden] { display: none; }

/* ---------- שאלות ---------- */
.tfg-stage { padding: 0.7rem 0 0; }
.tfg-qnum { font-size: 0.8rem; color: var(--sl-color-gray-3); margin-bottom: 0.4rem; }

.tfg-q {
  font-size: 1.02rem;
  font-weight: 600;
  line-height: 1.55;
  color: var(--sl-color-white);
  margin-bottom: 0.7rem;
}

.tfg-code {
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

.tfg-opts { display: grid; gap: 0.45rem; }

.tfg-opt {
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

.tfg-opt:hover:not(:disabled) { border-color: var(--sl-color-accent); background: var(--sl-color-gray-6); }
.tfg-opt:disabled { cursor: default; }

.tfg-key {
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

.tfg-opt.is-right {
  border-color: var(--sl-color-green);
  background: color-mix(in srgb, var(--sl-color-green) 16%, var(--sl-color-bg));
}

.tfg-opt.is-wrong {
  border-color: var(--sl-color-red);
  background: color-mix(in srgb, var(--sl-color-red) 16%, var(--sl-color-bg));
}

/* ---------- משוב ---------- */
.tfg-foot { margin-top: 0.9rem; display: flex; flex-direction: column; gap: 0.7rem; }

.tfg-feedback:not(:empty) {
  padding: 0.7rem 0.9rem;
  border-radius: 10px;
  border: 1px solid var(--sl-color-hairline);
  background: var(--sl-color-bg);
  font-size: 0.9rem;
}

.tfg-feedback.is-right { border-color: var(--sl-color-green); }
.tfg-feedback.is-wrong { border-color: var(--sl-color-red); }
.tfg-fb-head { font-weight: 700; margin-bottom: 0.3rem; }
.tfg-feedback.is-right .tfg-fb-head { color: var(--sl-color-green-high, var(--sl-color-green)); }
.tfg-feedback.is-wrong .tfg-fb-head { color: var(--sl-color-red-high, var(--sl-color-red)); }
.tfg-fb-why { color: var(--sl-color-gray-2); line-height: 1.6; }

.tfg-btn {
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

.tfg-btn:hover { border-color: var(--sl-color-accent); }

.tfg-btn--primary {
  background: var(--sl-color-accent);
  border-color: var(--sl-color-accent);
  color: var(--sl-color-white);
}

.tfg-btn--primary:hover { background: var(--sl-color-accent-high, var(--sl-color-accent)); }

/* ---------- התאמת פקודות ---------- */
.tfg-match { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.35fr); gap: 0.6rem; }
.tfg-match-col { display: grid; gap: 0.45rem; align-content: start; }

.tfg-mi {
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

.tfg-mi code { direction: ltr; display: inline-block; font-size: 0.85em; }
.tfg-mi:hover:not(:disabled) { border-color: var(--sl-color-accent); background: var(--sl-color-gray-6); }
.tfg-mi.is-sel { border-color: var(--sl-color-accent); background: color-mix(in srgb, var(--sl-color-accent) 18%, var(--sl-color-bg)); }

.tfg-mi.is-done {
  border-color: var(--sl-color-green);
  background: color-mix(in srgb, var(--sl-color-green) 14%, var(--sl-color-bg));
  opacity: 0.75;
  cursor: default;
}

/* ---------- סידור workflow ---------- */
.tfg-picked {
  list-style: decimal;
  padding-inline-start: 1.6rem;
  margin: 0 0 0.8rem;
  display: grid;
  gap: 0.3rem;
  min-height: 0;
}

.tfg-picked:empty { display: none; }

.tfg-picked-item {
  padding: 0.35rem 0.6rem;
  border-radius: 8px;
  border: 1px solid var(--sl-color-green);
  background: color-mix(in srgb, var(--sl-color-green) 12%, var(--sl-color-bg));
  font-size: 0.88rem;
}

.tfg-pool { display: grid; gap: 0.45rem; }

.tfg-step {
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

.tfg-step:hover:not(:disabled) { border-color: var(--sl-color-accent); border-style: solid; }
.tfg-step:disabled { opacity: 0.35; cursor: default; text-decoration: line-through; }

@keyframes tfg-shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(5px); }
  75% { transform: translateX(-5px); }
}

.tfg-shake { animation: tfg-shake 0.3s ease; border-color: var(--sl-color-red) !important; }

/* ---------- מסך סיכום ---------- */
.tfg-rank { text-align: center; padding: 0.8rem 0 1.1rem; }
.tfg-rank-icon { display: block; font-size: 2.8rem; line-height: 1; }
.tfg-rank-name { display: block; font-size: 1.35rem; font-weight: 700; color: var(--sl-color-white); margin-top: 0.35rem; }
.tfg-rank-note { display: block; font-size: 0.9rem; color: var(--sl-color-gray-3); margin-top: 0.3rem; }

.tfg-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(6.5rem, 1fr)); gap: 0.5rem; }

.tfg-stat {
  text-align: center;
  padding: 0.6rem 0.4rem;
  border: 1px solid var(--sl-color-hairline);
  border-radius: 10px;
  background: var(--sl-color-bg);
}

.tfg-stat-v { display: block; font-size: 1.3rem; font-weight: 700; color: var(--sl-color-white); font-variant-numeric: tabular-nums; }
.tfg-stat-k { display: block; font-size: 0.78rem; color: var(--sl-color-gray-3); }

.tfg-record {
  margin-top: 0.7rem;
  text-align: center;
  font-weight: 600;
  padding: 0.5rem;
  border-radius: 9px;
  background: color-mix(in srgb, var(--sl-color-accent) 16%, transparent);
}

.tfg-record--muted { background: var(--sl-color-gray-6); font-weight: 400; color: var(--sl-color-gray-3); }
.tfg-review { margin-top: 1.2rem; }
.tfg-review-h { font-size: 1.02rem; margin: 0 0 0.6rem; }

.tfg-review-item {
  padding: 0.75rem 0.9rem;
  margin-bottom: 0.6rem;
  border: 1px solid var(--sl-color-hairline);
  border-inline-start: 3px solid var(--sl-color-red);
  border-radius: 10px;
  background: var(--sl-color-bg);
  font-size: 0.9rem;
}

.tfg-review-q { font-weight: 600; margin-bottom: 0.45rem; line-height: 1.5; }
.tfg-review-a { margin-bottom: 0.4rem; line-height: 1.55; }
.tfg-result-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 1.2rem; }

@media (max-width: 34rem) {
  .tfg { padding: 0.8rem; }
  .tfg-match { grid-template-columns: 1fr; }
  .tfg-mode { flex-wrap: wrap; }
  .tfg-mode-best { order: 3; }
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
      q: 'איזו פקודה מורידה providers, מגדירה את ה-backend ומכינה את תיקיית <code>.terraform/</code>?',
      o: ['<code>terraform init</code>', '<code>terraform plan</code>', '<code>terraform validate</code>', '<code>terraform refresh</code>'],
      a: 0,
      w: '<code>init</code> היא הפקודה הראשונה בכל תיקיית עבודה. צריך להריץ אותה שוב בכל פעם שמוסיפים provider חדש, משנים את הגדרת ה-backend, או מוסיפים/מסירים module.'
    },
    {
      q: 'מה מסמן הסימן <code>~</code> בפלט של <code>terraform plan</code>?',
      o: ['עדכון במקום - update in-place', 'יצירת משאב חדש', 'מחיקת משאב', 'החלפה - destroy ואז create'],
      a: 0,
      w: 'ארבעת הסימנים: <code>+</code> יצירה, <code>-</code> מחיקה, <code>~</code> עדכון במקום, <code>-/+</code> החלפה (מחיקה ויצירה מחדש).'
    },
    {
      q: 'מה מסמן <code>-/+</code> בפלט של <code>terraform plan</code>?',
      o: ['החלפה - מחיקה ואז יצירה מחדש', 'עדכון במקום', 'אין שינוי בפועל', 'שינוי שם ב-state בלבד'],
      a: 0,
      w: 'זה הסימן שהכי חשוב לשים לב אליו לפני <code>apply</code> בפרודקשן - הוא אומר שהמשאב הקיים ייהרס ויקום מחדש (למשל שינוי <code>ami</code> ב-instance), על כל המשמעויות של downtime ואובדן נתונים.'
    },
    {
      q: 'איזו פקודה בודקת תקינות תחבירית וסמנטית של הקוד בלי לפנות לענן בכלל?',
      o: ['<code>terraform validate</code>', '<code>terraform plan</code>', '<code>terraform show</code>', '<code>terraform graph</code>'],
      a: 0,
      w: '<code>validate</code> זולה ומהירה ולא מצריכה credentials - לכן היא שלב CI מוקדם מושלם. <code>plan</code>, לעומתה, כן מדברת עם ה-provider ומרעננת state.'
    },
    {
      q: 'איזו פקודה פותחת REPL אינטראקטיבי לבדיקת expressions ופונקציות מובנות?',
      o: ['<code>terraform console</code>', '<code>terraform shell</code>', '<code>terraform repl</code>', '<code>terraform debug</code>'],
      a: 0,
      w: '<code>terraform console</code> היא הדרך הזולה לבדוק ביטוי מסובך (<code>for</code>, <code>merge</code>, <code>try</code>) לפני שמכניסים אותו לקוד.'
    },
    {
      q: 'מה שמו של קובץ ה-lock של Terraform, ומה ההמלצה הרשמית לגביו?',
      o: ['<code>.terraform.lock.hcl</code> - ומומלץ לכלול אותו בגיט', '<code>.terraform.lock.hcl</code> - ותמיד להוסיף ל-<code>.gitignore</code>', '<code>terraform.lock.json</code> - ומומלץ בגיט', '<code>.tflock</code> - נוצר רק ב-CI'],
      a: 0,
      w: 'בניגוד לאינטואיציה שקבצים שנוצרים אוטומטית שייכים ל-<code>.gitignore</code>, HashiCorp ממליצים לקומיט את קובץ ה-lock - הוא מבטיח שכל מפתח וכל ריצת CI ישתמשו באותן גרסאות provider מדויקות.'
    },
    {
      q: 'איזה קובץ ערכים נטען אוטומטית בלי לציין <code>-var-file</code>?',
      o: ['<code>terraform.tfvars</code>', '<code>values.tfvars</code>', '<code>vars.hcl</code>', '<code>default.tfvars</code>'],
      a: 0,
      w: 'נטענים אוטומטית: <code>terraform.tfvars</code>, <code>terraform.tfvars.json</code>, וכל <code>*.auto.tfvars</code> (לפי סדר אלפביתי). כל קובץ אחר דורש <code>-var-file</code> מפורש.'
    },
    {
      q: 'מה ה-prefix של משתני סביבה שמזינים ערכים למשתני Terraform?',
      o: ['<code>TF_VAR_</code>', '<code>TERRAFORM_</code>', '<code>TF_</code>', '<code>HCL_VAR_</code>'],
      a: 0,
      w: '<code>export TF_VAR_db_password="s3cr3t"</code> מזין את המשתנה <code>db_password</code>. זו הדרך המומלצת להזרים סודות ל-CI בלי לכתוב אותם לקובץ tfvars שעלול להגיע לגיט.'
    },
    {
      q: 'מה גובר כשגם <code>terraform.tfvars</code> וגם <code>-var</code> בשורת הפקודה מגדירים את אותו משתנה?',
      o: ['<code>-var</code> בשורת הפקודה', '<code>terraform.tfvars</code>', 'ה-<code>default</code> שבהגדרת המשתנה', 'Terraform נכשל בשגיאת התנגשות'],
      a: 0,
      w: 'סדר העדיפות מהגבוה לנמוך: <code>-var</code> / <code>-var-file</code> בשורת הפקודה, ואחריהם <code>*.auto.tfvars</code>, <code>terraform.tfvars</code>, משתני סביבה <code>TF_VAR_</code>, ולבסוף ה-<code>default</code>.'
    },
    {
      q: 'לאיזה טווח גרסאות שקול האילוץ <code>~&gt; 5.0</code>?',
      o: ['<code>&gt;= 5.0, &lt; 6.0</code>', '<code>= 5.0</code> בדיוק', '<code>&gt;= 5.0</code> ללא תקרה', '<code>&gt;= 5.0, &lt; 5.1</code>'],
      a: 0,
      w: 'האופרטור <code>~&gt;</code> ("pessimistic constraint") מאפשר עדכון רק ברכיב הימני ביותר שצוין. <code>~&gt; 5.0</code> פותח את כל 5.x וחוסם את 6.0, שבו עלולים להיות breaking changes.'
    },
    {
      q: 'לאיזה טווח שקול האילוץ <code>~&gt; 5.1.0</code>?',
      o: ['<code>&gt;= 5.1.0, &lt; 5.2.0</code>', '<code>&gt;= 5.1.0, &lt; 6.0.0</code>', 'גרסה 5.1.0 בדיוק בלבד', 'כל 5.x'],
      a: 0,
      w: 'נקודת מבחן קלאסית: ההתנהגות תלויה במספר הרכיבים שצוינו. עם שלושה רכיבים (<code>5.1.0</code>) רק ה-patch חופשי; עם שני רכיבים (<code>5.1</code>) גם ה-minor חופשי.'
    },
    {
      q: 'איזה meta-argument יציב יותר כשהרשימה עשויה להשתנות באמצע?',
      o: ['<code>for_each</code> - כל עותק מזוהה לפי מפתח קבוע', '<code>count</code> - אינדקסים מספריים יציבים יותר', 'השניים זהים לחלוטין בהתנהגות', '<code>depends_on</code>'],
      a: 0,
      w: 'עם <code>count</code> המשאבים מזוהים לפי אינדקס (<code>web[0]</code>, <code>web[1]</code>). הסרת איבר מהאמצע "מזיזה" את כל האינדקסים שאחריו ו-Terraform יציע destroy+create למשאבים שלא היו אמורים להשתנות. <code>for_each</code> מזהה לפי מפתח קבוע, ולכן רק המשאב שהוסר נפגע.'
    },
    {
      q: 'מה עושה <code>lifecycle { create_before_destroy = true }</code>?',
      o: ['יוצר את המשאב החדש לפני מחיקת הישן - מונע downtime', 'מוחק את הישן ורק אז יוצר את החדש', 'מונע כל שינוי עתידי במשאב', 'מסמן את המשאב כ-<code>sensitive</code>'],
      a: 0,
      w: 'ברירת המחדל של Terraform ב-Replacement היא destroy-then-create, שיוצרת חלון של חוסר שירות. הדגל הזה הופך את הסדר - קריטי למשאבים כמו launch templates, target groups וקונפיגורציות load balancer.'
    },
    {
      q: 'מה קורה כשמשאב עם <code>prevent_destroy = true</code> דורש Replacement?',
      o: ['ה-<code>apply</code> נכשל בשגיאה - הדגל חוסם כל מחיקה, גם כחלק מהחלפה', 'Terraform מתעלם מהדגל ומחליף כרגיל', 'Terraform מעדכן במקום במקום להחליף', 'Terraform מדלג על המשאב בשקט'],
      a: 0,
      w: 'זו מלכודת מוכרת: השילוב של <code>prevent_destroy</code> עם <code>create_before_destroy</code> נשמע הגיוני, אבל <code>prevent_destroy</code> חוסם מחיקה מכל סיבה - כולל המחיקה ה"בריאה" שבסוף תהליך החלפה. צריך להסיר אותו זמנית.'
    },
    {
      q: 'האם <code>sensitive = true</code> מגן על הסוד גם בתוך קובץ ה-state?',
      o: ['לא - ב-state הערך נשמר בטקסט גלוי; הדגל מסתיר רק את פלט ה-CLI', 'כן, הוא מצפין את הערך גם ב-state', 'כן, אבל רק כשה-backend הוא S3', 'הוא מוחק את הערך לגמרי מה-state'],
      a: 0,
      w: '<code>sensitive</code> הוא מנגנון <em>תצוגה</em> בלבד - הוא מונע דליפה ללוגים של טרמינל/CI. ה-state עדיין שומר את כל ה-attributes בטקסט גלוי, ולכן ההגנה האמיתית היא הצפנת ה-backend והרשאות least privilege אליו.'
    }
  ];

  /* ============================================================
     מצב 2 - ניחוש Plan: קטע קוד + מה יראה terraform plan
     ============================================================ */
  var PLAN_GUESS = [
    {
      code: 'resource "aws_instance" "web" {\n  ami           = "ami-0abcdef1234567890"\n  instance_type = "t3.small" # היה t3.micro\n}',
      q: 'שיניתם instance_type מ-t3.micro ל-t3.small. באיזה סימן זה יסומן ב-plan?',
      o: ['<code>~</code> עדכון במקום', '<code>+</code> יצירה', '<code>-</code> מחיקה', '<code>-/+</code> החלפה'],
      a: 0,
      w: 'שינוי instance_type על aws_instance אינו ForceNew - AWS תומכת בשינוי מסוג המכונה תוך שמירה על אותו ID (עם עצירה/הפעלה של המכונה), ולכן זהו עדכון במקום (<code>~</code>) ולא replace.'
    },
    {
      code: 'resource "aws_instance" "web" {\n  ami           = "ami-0new111222333" # היה ami-0old999888777\n  instance_type = "t3.micro"\n}',
      q: 'הפעם שיניתם את ה-ami. באיזה סימן זה יסומן?',
      o: ['<code>-/+</code> החלפה', '<code>~</code> עדכון במקום', '<code>+</code> יצירה בלבד', 'אין שינוי'],
      a: 0,
      w: 'בניגוד ל-instance_type, השדה <code>ami</code> הוא ForceNew - אי אפשר "להחליף תמונת מערכת" למכונה חיה, אז Terraform חייב להרוס וליצור מחדש.'
    },
    {
      code: 'resource "aws_instance" "web" {\n  ami           = "ami-123"\n  instance_type = "t3.micro"\n  tags = {\n    Owner = "devops-team" # שורה חדשה\n  }\n}',
      q: 'הוספתם בלוק tags חדש למשאב שכבר קיים ב-state. מה יקרה?',
      o: ['עדכון במקום (<code>~</code>) - המשאב כבר קיים, רק attribute מתווסף', 'יצירה של משאב חדש (<code>+</code>)', 'המשאב יימחק ויקום מחדש', 'שגיאה - אי אפשר להוסיף tags אחרי היצירה'],
      a: 0,
      w: 'הוספת attribute למשאב קיים היא עדכון רגיל. Terraform לא יוצר or מוחק את המשאב עצמו - רק מעדכן את השדה החדש.'
    },
    {
      code: 'resource "aws_instance" "web" {\n  count = 2 # היה 3\n  ami   = "ami-123"\n}',
      q: 'הקטנתם count מ-3 ל-2. מה Terraform יציע?',
      o: ['מחיקה (<code>-</code>) רק של <code>web[2]</code>, השאר ללא שינוי', 'מחיקת כל השלושה ויצירה מחדש של שניים', 'עדכון במקום של כל שלושת המשאבים', 'שגיאה - אי אפשר להקטין count'],
      a: 0,
      w: 'עם <code>count</code> המשאבים מזוהים לפי אינדקס. הקטנת המספר פשוט מוחקת את האינדקסים העודפים מהסוף (<code>web[2]</code>), בלי לגעת ב-<code>web[0]</code> וב-<code>web[1]</code>.'
    },
    {
      code: 'Plan: 3 to add, 1 to change, 2 to destroy.',
      q: 'כמה פעולות בסך הכול מתוכננות בשורת הסיכום הזו?',
      o: ['6', '4', '3', 'אי אפשר לדעת בלי apply'],
      a: 0,
      w: 'שלושת המספרים מתייחסים לפעולות נפרדות: 3+1+2=6. חשוב לזכור ש-Replacement (destroy+create של אותו משאב) נספר גם ב-"to add" וגם ב-"to destroy" - הוא לא מקבל קטגוריה נפרדת משלו.'
    },
    {
      code: 'data "aws_ami" "latest" {\n  most_recent = true\n  # ...filters...\n}\n\nresource "aws_instance" "web" {\n  ami = data.aws_ami.latest.id\n}',
      q: 'למה מומלץ להריץ <code>terraform plan -out=tfplan</code> ואז <code>terraform apply tfplan</code>, במקום סתם "apply"?',
      o: ['מבטיח ש-apply יבצע בדיוק את מה שנבדק ב-plan (כולל ערכי data sources), בלי race condition', 'זה תמיד מהיר יותר', 'זה חובה בכל סביבה', 'זה משנה את סדר היצירה'],
      a: 0,
      w: 'קובץ plan שמור "מקפיא" גם את ערכי ה-data sources. בלי קובץ שמור, apply רגיל קורא data sources וקונפיגורציית ענן מחדש - אם משהו השתנה בינתיים (כמו AMI חדש), התוצאה בפועל עלולה לסטות ממה שסקרתם.'
    },
    {
      code: '# terraform plan -refresh=false',
      q: 'מה עושה הדגל <code>-refresh=false</code>?',
      o: ['מדלג על בדיקת המצב האמיתי בענן מול ה-state, ומשתמש רק בערכים השמורים', 'מוחק את קובץ ה-state', 'מונע מ-plan ליצור משאבים חדשים', 'מרענן providers אוטומטית'],
      a: 0,
      w: 'שימושי להאצת plan בתשתית ענקית ב-CI, אבל מסוכן אם יש drift אמיתי בענן - אתם עלולים לתכנן על בסיס מידע לא מעודכן.'
    },
    {
      code: 'moved {\n  from = aws_instance.old_name\n  to   = aws_instance.new_name\n}',
      q: 'הוספתם בלוק moved כזה, והמשאב עצמו לא השתנה בפועל. מה יראה ה-plan?',
      o: ['"X will be moved to Y" - שינוי שם ב-state בלבד, בלי destroy/create', 'המשאב הישן יימחק והחדש ייווצר', 'שגיאת syntax', 'אין שום שינוי בפלט בכלל'],
      a: 0,
      w: 'בלוק <code>moved</code> (מ-Terraform 1.1) אומר ל-Terraform "זה אותו משאב, רק שיניתי לו שם/כתובת בקוד" - הוא ממפה מחדש ב-state בלי לגעת במשאב האמיתי בענן.'
    },
    {
      code: 'resource "aws_instance" "web" {\n  # ...\n  lifecycle {\n    ignore_changes = [tags]\n  }\n}',
      q: 'מישהו שינה tag ידנית בקונסולת AWS. מה יראה terraform plan אחרי זה?',
      o: ['לא יראה שום שינוי בשדה tags, גם אם הוא שונה בפועל', 'יתריע ששדה tags השתנה וידרוש עדכון', 'ימחק את המשאב', 'יכשל בשגיאת drift'],
      a: 0,
      w: '<code>ignore_changes</code> אומר ל-Terraform "אל תשווה את השדה הזה בכלל" - שינויים ידניים בו פשוט לא ייראו ב-plan, לטוב ולרע.'
    },
    {
      code: '# ~ resource "aws_launch_template" "app" {\n#     ~ image_id = "ami-old" -> "ami-new" # forces replacement\n# }',
      q: 'מה המשמעות של ההערה "# forces replacement" ליד שדה ספציפי?',
      o: ['שינוי הערך הספציפי הזה הוא הסיבה שכל המשאב יוחלף (destroy+create), לא רק השדה', 'שהשדה הזה בלבד יעודכן במקום', 'שיש קונפליקט ב-state שצריך לפתור', 'שהשדה deprecated ויוסר בגרסה הבאה'],
      a: 0,
      w: 'זו ההערה שהכי חשוב לחפש לפני apply בפרודקשן - היא מצביעה בדיוק על השדה ה"אשם" בכך שהמשאב כולו עומד להיהרס וליקום מחדש.'
    },
    {
      code: 'resource "aws_instance" "web" {\n  # ...\n}\n\n# בפלט plan:\n# + arn = (known after apply)',
      q: 'מתי plan מציג ערך "(known after apply)"?',
      o: ['כשהערך נקבע ע"י הענן/provider רק בזמן היצירה בפועל (כמו ARN או ID אוטומטי) ולא ניתן לחזות אותו מראש', 'כשיש שגיאה בקוד שצריך לתקן', 'רק במשאבים שמוגדרים עם count', 'כשחסר קובץ .terraform.lock.hcl'],
      a: 0,
      w: 'שדות שה-API של הענן מייצר (ARN, ID, IP דינמי) לא קיימים עדיין בזמן plan - Terraform מציג placeholder כדי לומר "זה יתמלא רק אחרי apply בפועל".'
    },
    {
      code: 'resource "aws_db_instance" "main" {\n  identifier              = "prod-db"\n  skip_final_snapshot     = false # היה true\n  final_snapshot_identifier = "prod-db-final"\n}',
      q: 'שיניתם skip_final_snapshot מ-true ל-false על מסד נתונים production. מה זה משפיע בזמן destroy עתידי?',
      o: ['destroy עתידי ייצור snapshot אחרון של המסד לפני המחיקה בפועל', 'זה לא משפיע על destroy בכלל', 'זה מונע destroy לחלוטין', 'זה מוחק snapshots קיימים'],
      a: 0,
      w: 'זה לא שינוי שרואים כ-Replacement, אבל הוא קריטי מבחינת בטיחות: כש-skip_final_snapshot=false, פקודת destroy עתידית תיצור גיבוי אחרון אוטומטית לפני שהיא הורסת את המסד.'
    }
  ];

  /* ============================================================
     מצב 3 - השלמת קוד HCL: קוד עם חלק חסר, לבחור מה משלים אותו
     ============================================================ */
  var HCL_COMPLETE = [
    {
      code: 'variable "environment" {\n  type    = string\n  ___\n  validation {\n    condition     = contains(["dev", "staging", "prod"], var.environment)\n    error_message = "Must be dev, staging, or prod."\n  }\n}',
      q: 'מה משלים את הקוד כך שלמשתנה יהיה ערך ברירת מחדל "dev"?',
      o: ['<code>default = "dev"</code>', '<code>value = "dev"</code>', '<code>init = "dev"</code>', '<code>set "dev"</code>'],
      a: 0,
      w: 'הארגומנט הנכון להגדרת ערך ברירת מחדל בבלוק <code>variable</code> הוא <code>default</code>.'
    },
    {
      code: 'resource "aws_instance" "web" {\n  count = 3\n  ami   = "ami-123"\n  tags = {\n    Name = "web-___"\n  }\n}',
      q: 'מה משלים את השם כך שכל instance יקבל שם ייחודי (web-0, web-1, web-2)?',
      o: ['<code>${count.index}</code>', '<code>${each.key}</code>', '<code>${terraform.index}</code>', '<code>${self.index}</code>'],
      a: 0,
      w: '<code>count.index</code> זמין רק בתוך משאב שמוגדר עם <code>count</code>. <code>each.key</code> הוא המקביל לכשמשתמשים ב-<code>for_each</code>.'
    },
    {
      code: 'resource "aws_instance" "web" {\n  for_each      = toset(["a", "b", "c"])\n  ami           = "ami-123"\n  instance_type = "t3.micro"\n  subnet_id     = ___\n}',
      q: 'בתוך בלוק עם for_each, איך ניגשים לערך הנוכחי באיטרציה?',
      o: ['<code>each.value</code>', '<code>each.index</code>', '<code>count.index</code>', '<code>this.value</code>'],
      a: 0,
      w: 'עם <code>for_each</code> יש שני משתנים זמינים: <code>each.key</code> (המפתח) ו-<code>each.value</code> (הערך). אין <code>each.index</code> - זו לא הסמנטיקה של for_each.'
    },
    {
      code: '___ {\n  instance_name = "web-server"\n}\n\noutput "full_name" {\n  value = local.instance_name\n}',
      q: 'איזו מילת מפתח פותחת את הבלוק שבו מגדירים instance_name?',
      o: ['<code>locals</code>', '<code>variable</code>', '<code>local</code>', '<code>const</code>'],
      a: 0,
      w: 'בלוק <code>locals</code> (ברבים) הוא שבו מגדירים ערכים מחושבים פנימיים. הגישה אליהם היא דרך <code>local.</code> (ביחיד) - הבדל שמבלבל המון מתחילים.'
    },
    {
      code: 'data "aws_ami" "ubuntu" {\n  most_recent = true\n  ___ {\n    name   = "name"\n    values = ["ubuntu/images/*"]\n  }\n}',
      q: 'איזו מילת מפתח משלימה את הבלוק לסינון תוצאות ה-data source?',
      o: ['<code>filter</code>', '<code>condition</code>', '<code>match</code>', '<code>where</code>'],
      a: 0,
      w: 'בלוקי <code>filter</code> (אפשר כמה) הם הדרך הסטנדרטית לצמצם תוצאות data source לפי שם, tag או attribute אחר.'
    },
    {
      code: 'resource "aws_security_group_rule" "https" {\n  ___\n  from_port         = 443\n  to_port           = 443\n  protocol          = "tcp"\n  cidr_blocks       = ["0.0.0.0/0"]\n  security_group_id = aws_security_group.web.id\n}',
      q: 'מה משלים כדי להגדיר שזהו כלל כניסה (ingress)?',
      o: ['<code>type = "ingress"</code>', '<code>direction = "ingress"</code>', '<code>ingress = true</code>', '<code>rule = "in"</code>'],
      a: 0,
      w: 'המשאב <code>aws_security_group_rule</code> מבחין בין ingress ל-egress דרך הארגומנט <code>type</code>.'
    },
    {
      code: 'resource "aws_instance" "web" {\n  ami           = "ami-123"\n  instance_type = "t3.micro"\n\n  ___ "ebs_block_device" {\n    for_each = var.extra_volumes\n    content {\n      device_name = each.key\n      volume_size = each.value\n    }\n  }\n}',
      q: 'איזו מילת מפתח מאפשרת ליצור מספר תת-בלוקים (ebs_block_device) באופן דינמי לפי משתנה?',
      o: ['<code>dynamic</code>', '<code>foreach</code>', '<code>repeat</code>', '<code>loop</code>'],
      a: 0,
      w: 'בלוק <code>dynamic "שם_הבלוק"</code> עם <code>for_each</code> ו-<code>content { }</code> בפנים הוא הדרך היחידה לייצר תת-בלוקים (nested blocks, לא ארגומנטים רגילים) דינמית.'
    },
    {
      code: 'terraform {\n  required_providers {\n    aws = {\n      source  = "hashicorp/aws"\n      ___ = "~> 5.0"\n    }\n  }\n}',
      q: 'מה משלים את בלוק ה-provider כדי להגביל את טווח הגרסה?',
      o: ['<code>version</code>', '<code>constraint</code>', '<code>release</code>', '<code>tag</code>'],
      a: 0,
      w: 'בתוך <code>required_providers</code>, כל provider מקבל <code>source</code> (מאיפה להוריד) ו-<code>version</code> (איזה טווח גרסאות מותר).'
    },
    {
      code: 'output "db_password" {\n  value     = random_password.db.result\n  ___ = true\n}',
      q: 'מה מונע מהסיסמה להופיע בפלט הטרמינל של plan/apply?',
      o: ['<code>sensitive</code>', '<code>hidden</code>', '<code>secret</code>', '<code>private</code>'],
      a: 0,
      w: '<code>sensitive = true</code> על output (או variable) מסתיר את הערך מה-CLI. חשוב לזכור: זו הגנת תצוגה בלבד, לא הצפנה של ה-state.'
    },
    {
      code: 'resource "aws_db_instance" "main" {\n  identifier = "prod-db"\n  # ...\n\n  lifecycle {\n    ___ = true\n  }\n}',
      q: 'מה משלים את הבלוק כדי למנוע בטעות מחיקה של המשאב (למשל דאטהבייס פרודקשן)?',
      o: ['<code>prevent_destroy</code>', '<code>protect</code>', '<code>no_delete</code>', '<code>immutable</code>'],
      a: 0,
      w: '<code>prevent_destroy = true</code> גורם ל-plan/apply להיכשל בשגיאה על כל ניסיון מחיקה של המשאב - כולל דרך destroy מלא. חשוב: הוא חוסם גם Replacement, לכן צריך להסיר אותו זמנית אם באמת רוצים להחליף.'
    },
    {
      code: 'variable "instance_count" {\n  type = number\n  ___ {\n    condition     = var.instance_count > 0 && var.instance_count <= 10\n    error_message = "Must be between 1 and 10."\n  }\n}',
      q: 'איזה בלוק מאפשר לאכוף כלל תקינות על ערך המשתנה כבר בזמן plan?',
      o: ['<code>validation</code>', '<code>check</code>', '<code>assert</code>', '<code>rule</code>'],
      a: 0,
      w: 'בלוק <code>validation</code> בתוך <code>variable</code> עוצר את הריצה מוקדם עם הודעת שגיאה ברורה, במקום לגלות בעיה רק אחרי apply כושל בענן.'
    },
    {
      code: 'import {\n  to = ___\n  id = "prod-db"\n}',
      q: 'מה משלים את בלוק ה-import (Terraform 1.5+) כדי לייבא משאב RDS קיים בשם "prod-db" לתוך ה-state כ-aws_db_instance.main?',
      o: ['<code>aws_db_instance.main</code>', '<code>"aws_db_instance.main"</code>', '<code>resource.aws_db_instance.main</code>', '<code>state.aws_db_instance.main</code>'],
      a: 0,
      w: 'הארגומנט <code>to</code> מקבל address של משאב (בלי מרכאות - זו הפניה, לא string), בעוד <code>id</code> הוא ה-identifier האמיתי בענן, ולכן כן במרכאות.'
    }
  ];

  /* ============================================================
     מצב 4 - התאמת פקודות: סבבים של זוגות פקודה + תיאור
     ============================================================ */
  var MATCH_ROUNDS = [
    {
      title: 'פקודות ליבה',
      pairs: [
        { l: '<code>terraform init</code>', r: 'מוריד providers/modules ומכינה את תיקיית העבודה' },
        { l: '<code>terraform plan</code>', r: 'מציגה תוכנית שינויים בלי לבצע אותם בפועל' },
        { l: '<code>terraform apply</code>', r: 'מבצעת בפועל את השינויים שתוכננו' },
        { l: '<code>terraform destroy</code>', r: 'מוחקת את כל המשאבים המנוהלים ב-state' },
        { l: '<code>terraform validate</code>', r: 'בודקת תקינות תחבירית וסמנטית בלי לגעת בענן' }
      ]
    },
    {
      title: 'ניהול State',
      pairs: [
        { l: '<code>terraform state list</code>', r: 'מציגה את כל המשאבים הרשומים ב-state' },
        { l: '<code>terraform state show</code>', r: 'מציגה את הפרטים המלאים של משאב ספציפי ב-state' },
        { l: '<code>terraform state mv</code>', r: 'מזיזה/משנה שם משאב בתוך ה-state בלי הרס ויצירה' },
        { l: '<code>terraform state rm</code>', r: 'מסירה משאב מה-state בלי למחוק אותו בפועל בענן' },
        { l: '<code>terraform import</code>', r: 'מכניסה משאב קיים בענן תחת ניהול Terraform' }
      ]
    },
    {
      title: 'Workspaces ותצוגה',
      pairs: [
        { l: '<code>terraform fmt</code>', r: 'מסדרת את פורמט הקוד לפי הסטנדרט הרשמי' },
        { l: '<code>terraform workspace list</code>', r: 'מציגה את כל ה-workspaces הקיימים' },
        { l: '<code>terraform workspace new</code>', r: 'יוצרת workspace חדש עם state נפרד משלו' },
        { l: '<code>terraform graph</code>', r: 'מייצרת גרף תלויות בין המשאבים בפורמט DOT' },
        { l: '<code>terraform output</code>', r: 'מציגה את ערכי ה-outputs שהוגדרו בקוד' }
      ]
    },
    {
      title: 'כלים מתקדמים ודיבוג',
      pairs: [
        { l: '<code>terraform console</code>', r: 'פותחת REPL אינטראקטיבי לבדיקת expressions' },
        { l: '<code>terraform apply -replace=...</code>', r: 'מכריחה הרס ויצירה מחדש של משאב ספציפי' },
        { l: '<code>terraform refresh</code> (חלק מ-plan)', r: 'מסנכרנת את ה-state מול המצב האמיתי בענן' },
        { l: '<code>terraform providers</code>', r: 'מציגה אילו providers נדרשים ומאיפה הם מגיעים' },
        { l: '<code>TF_LOG=DEBUG terraform apply</code>', r: 'מפעילה לוגים מפורטים לצורך דיבוג' }
      ]
    }
  ];

  /* ============================================================
     מצב 5 - סידור Workflow: סבבים של שלבים שצריך לסדר בסדר הנכון
     ============================================================ */
  var ORDER_ROUNDS = [
    {
      title: 'זרימת עבודה סטנדרטית - מקוד חדש עד production',
      steps: [
        'כתיבה/עדכון של קוד Terraform (קבצי .tf)',
        'הרצת terraform fmt לסידור הקוד',
        'הרצת terraform init (בפעם הראשונה, או אחרי שינוי providers/modules)',
        'הרצת terraform validate',
        'הרצת terraform plan וסקירת התוכנית',
        'הרצת terraform apply לאחר אישור',
        'commit ו-push של הקוד וקובץ ה-lock ל-Git'
      ]
    },
    {
      title: 'מעבר מ-state מקומי ל-remote backend',
      steps: [
        'הוספת בלוק backend (למשל S3) לקובץ terraform {}',
        'הרצת terraform init',
        'אישור ההודעה שמציעה להעתיק (migrate) את ה-state הקיים',
        'אימות שה-state הועתק בהצלחה עם terraform state list',
        'גיבוי/מחיקה של קובץ terraform.tfstate המקומי הישן'
      ]
    },
    {
      title: 'טיפול במשאב פגום עם -replace',
      steps: [
        'זיהוי שהמשאב במצב לא תקין (drift או קורפציה)',
        'הרצת terraform plan -replace="aws_instance.web"',
        'סקירת התוכנית לוודא שרק המשאב הרצוי יוחלף',
        'אישור terraform apply',
        'וידוא שהמשאב החדש בריא (health check)'
      ]
    },
    {
      title: 'פרסום Module חדש לשימוש חוזר',
      steps: [
        'חילוץ הקוד המשותף לתיקיית modules/ נפרדת',
        'הגדרת variables ו-outputs ברורים למודול',
        'הפניית root module לקרוא למודול עם source מקומי לבדיקה',
        'כתיבת README עם דוגמת שימוש',
        'פרסום ל-Git repo/registry עם git tag גרסה (semver)',
        'עדכון source בפרויקטים צורכים להפניה עם גרסה נעולה (?ref=vX.Y.Z)'
      ]
    }
  ];

  /* ============================================================
     הגדרת מצבי המשחק
     ============================================================ */
  var MODES = [
    { key: 'rapid', icon: '⚡', name: 'קרב מהיר', desc: 'שאלות ידע כלליות על Terraform - כמה תספיקו לפני שהזמן נגמר?', type: 'quiz', data: RAPID, sample: 8, time: 20000 },
    { key: 'plan', icon: '🔮', name: 'ניחוש Plan', desc: 'קטע קוד HCL - מה בדיוק terraform plan יראה?', type: 'quiz', data: PLAN_GUESS, sample: 8, time: 28000, showCode: true },
    { key: 'hcl', icon: '🧩', name: 'השלמת קוד HCL', desc: 'קוד עם חלק חסר - בחרו מה משלים אותו נכון', type: 'quiz', data: HCL_COMPLETE, sample: 8, time: 28000, showCode: true },
    { key: 'match', icon: '🔗', name: 'התאמת פקודות', desc: 'התאימו כל פקודת Terraform לתיאור הנכון שלה', type: 'match', data: MATCH_ROUNDS, sample: 2 },
    { key: 'order', icon: '📋', name: 'סידור Workflow', desc: 'סדרו את שלבי התהליך לפי הסדר הנכון', type: 'order', data: ORDER_ROUNDS, sample: 2 }
  ];

  /* ============================================================
     מנוע המשחק
     ============================================================ */
  var $ = function (id) { return document.getElementById(id); };

  var els = {
    modes: $('tfg-modes'),
    quit: $('tfg-quit'),
    modeName: $('tfg-mode-name'),
    lives: $('tfg-lives'),
    score: $('tfg-score'),
    streak: $('tfg-streak'),
    progress: $('tfg-progress'),
    timerWrap: $('tfg-timer-wrap'),
    timer: $('tfg-timer'),
    stage: $('tfg-stage'),
    feedback: $('tfg-feedback'),
    next: $('tfg-next'),
    result: $('tfg-result'),
    again: $('tfg-again'),
    menuBtn: $('tfg-menu')
  };

  var root = $('tfg');
  var screens = {};
  Array.prototype.forEach.call(root.querySelectorAll('.tfg-screen'), function (el) {
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

  function bestKey(modeKey) { return 'tfg-best-' + modeKey; }

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
      btn.className = 'tfg-mode';
      btn.innerHTML =
        '<span class="tfg-mode-icon">' + mode.icon + '</span>' +
        '<span class="tfg-mode-body">' +
          '<span class="tfg-mode-name">' + esc(mode.name) + '</span>' +
          '<span class="tfg-mode-desc">' + esc(mode.desc) + '</span>' +
        '</span>' +
        (best ? '<span class="tfg-mode-best">שיא: ' + best.score + '</span>' : '');
      btn.addEventListener('click', function () { startMode(mode); });
      els.modes.appendChild(btn);
    });
  }

  function startMode(mode) {
    var order;
    if (mode.type === 'quiz') {
      order = sampleN(mode.data.map(function (_, i) { return i; }), mode.sample);
    } else {
      order = sampleN(mode.data.map(function (_, i) { return i; }), mode.sample);
    }

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
      hearts += '<span class="tfg-heart' + (i < state.lives ? '' : ' is-lost') + '">' + (i < state.lives ? '❤️' : '🖤') + '</span>';
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
      els.feedback.className = 'tfg-feedback';
      els.feedback.innerHTML = '';
      return;
    }
    els.feedback.className = 'tfg-feedback is-' + kind;
    els.feedback.innerHTML =
      '<div class="tfg-fb-head">' + esc(headText) + '</div>' +
      (whyHtml ? '<div class="tfg-fb-why">' + whyHtml + '</div>' : '');
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
    var html = '<div class="tfg-qnum">שאלה ' + (state.qi + 1) + ' מתוך ' + state.order.length + '</div>';
    if (mode.showCode && q.code) {
      html += '<pre class="tfg-code">' + esc(q.code) + '</pre>';
    }
    html += '<div class="tfg-q">' + q.q + '</div>';
    html += '<div class="tfg-opts">';
    q.o.forEach(function (opt, i) {
      html += '<button type="button" class="tfg-opt" data-i="' + i + '"><span class="tfg-key">' + (i + 1) + '</span><span>' + opt + '</span></button>';
    });
    html += '</div>';
    els.stage.innerHTML = html;

    Array.prototype.forEach.call(els.stage.querySelectorAll('.tfg-opt'), function (btn) {
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
    var opts = els.stage.querySelectorAll('.tfg-opt');

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

    var html = '<div class="tfg-qnum">סבב ' + (state.qi + 1) + ' מתוך ' + state.order.length + ' - ' + esc(round.title) + '</div>';
    html += '<div class="tfg-q">בחרו פקודה, ואז את התיאור המתאים לה</div>';
    html += '<div class="tfg-match">';
    html += '<div class="tfg-match-col" id="tfg-match-left">';
    leftOrder.forEach(function (pi) {
      html += '<button type="button" class="tfg-mi" data-pi="' + pi + '" data-side="l">' + round.pairs[pi].l + '</button>';
    });
    html += '</div><div class="tfg-match-col" id="tfg-match-right">';
    rightOrder.forEach(function (pi) {
      html += '<button type="button" class="tfg-mi" data-pi="' + pi + '" data-side="r">' + esc(round.pairs[pi].r) + '</button>';
    });
    html += '</div></div>';
    els.stage.innerHTML = html;

    Array.prototype.forEach.call(els.stage.querySelectorAll('.tfg-mi'), function (btn) {
      btn.addEventListener('click', function () { handleMatchClick(btn, round); });
    });
  }

  function handleMatchClick(btn, round) {
    var side = btn.getAttribute('data-side');
    var pi = parseInt(btn.getAttribute('data-pi'), 10);

    if (side === 'l') {
      var prevSel = els.stage.querySelector('.tfg-mi.is-sel');
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
      btn.classList.add('tfg-shake');
      setTimeout(function () { btn.classList.remove('tfg-shake'); }, 300);
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

    var html = '<div class="tfg-qnum">סבב ' + (state.qi + 1) + ' מתוך ' + state.order.length + ' - ' + esc(round.title) + '</div>';
    html += '<div class="tfg-q">לחצו על השלבים לפי הסדר הנכון</div>';
    html += '<ol class="tfg-picked" id="tfg-order-picked"></ol>';
    html += '<div class="tfg-pool" id="tfg-order-pool">';
    poolOrder.forEach(function (si) {
      html += '<button type="button" class="tfg-step" data-si="' + si + '">' + esc(round.steps[si]) + '</button>';
    });
    html += '</div>';
    els.stage.innerHTML = html;

    Array.prototype.forEach.call(els.stage.querySelectorAll('.tfg-step'), function (btn) {
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
      var picked = $('tfg-order-picked');
      var li = document.createElement('li');
      li.className = 'tfg-picked-item';
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
      btn.classList.add('tfg-shake');
      setTimeout(function () { btn.classList.remove('tfg-shake'); }, 300);
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
    if (lost === 0) return { icon: '🏆', name: 'מומחה Terraform', note: 'סבב מושלם בלי אף טעות. מרשים!' };
    if (lost === 1) return { icon: '💪', name: 'שולט היטב', note: 'כמעט מושלם - טעות אחת בלבד.' };
    return { icon: '📘', name: 'בדרך הנכונה', note: 'יש עוד קצת ללמוד, אבל הכיוון טוב.' };
  }

  function endGame(finished) {
    clearTimer();
    showScreen('result');
    var rank = rankFor(finished);
    var isNewBest = setBest(state.mode.key, state.score);
    var best = getBest(state.mode.key);

    var html = '<div class="tfg-rank">' +
      '<span class="tfg-rank-icon">' + rank.icon + '</span>' +
      '<span class="tfg-rank-name">' + esc(rank.name) + '</span>' +
      '<span class="tfg-rank-note">' + esc(rank.note) + '</span>' +
      '</div>';

    html += '<div class="tfg-stats">' +
      '<div class="tfg-stat"><span class="tfg-stat-v">' + state.score + '</span><span class="tfg-stat-k">ניקוד</span></div>' +
      '<div class="tfg-stat"><span class="tfg-stat-v">' + state.bestStreak + '</span><span class="tfg-stat-k">רצף שיא</span></div>' +
      '<div class="tfg-stat"><span class="tfg-stat-v">' + state.lives + ' / 3</span><span class="tfg-stat-k">לבבות שנותרו</span></div>' +
      '<div class="tfg-stat"><span class="tfg-stat-v">' + state.wrongLog.length + '</span><span class="tfg-stat-k">טעויות</span></div>' +
      '</div>';

    if (isNewBest) {
      html += '<div class="tfg-record">🎉 שיא חדש במצב הזה: ' + state.score + ' נקודות!</div>';
    } else if (best) {
      html += '<div class="tfg-record tfg-record--muted">השיא שלכם במצב הזה: ' + best.score + ' נקודות</div>';
    }

    if (state.wrongLog.length) {
      html += '<div class="tfg-review"><h3 class="tfg-review-h">מה כדאי לחזור עליו</h3>';
      state.wrongLog.forEach(function (item) {
        html += '<div class="tfg-review-item">' +
          '<div class="tfg-review-q">' + item.q + '</div>' +
          '<div class="tfg-review-a">✔️ ' + esc(item.a) + '</div>' +
          (item.w ? '<div class="tfg-review-a">' + item.w + '</div>' : '') +
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
      var opts = els.stage.querySelectorAll('.tfg-opt');
      if (idx < opts.length) answerQuiz(idx);
    } else if (state.answered && e.key === 'Enter' && !els.next.hidden) {
      nextStep();
    }
  });

  renderMenu();
})();
</script>
