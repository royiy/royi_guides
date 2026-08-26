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
</script>
