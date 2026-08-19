---
title: "שאלות חזרה על Veeam Backup & Replication"
category: Veeam
part: 11/10
---

שאלות חזרה אינטראקטיביות על כל מה שלמדתם לאורך סדרת מדריכי Veeam (מבוא וארכיטקטורה, התקנה ופריסה, Backup Jobs, Backup Copy וכלל 3-2-1-1-0, Replication ו-DR, VMware ו-Hyper-V, Veeam ONE, Troubleshooting, שאלות ראיון עבודה, וטיפים וטריקים). בחרו תשובה בכל שאלה ותקבלו מיד משוב האם היא נכונה, יחד עם הסבר.

<div id="quiz-score" class="quiz-score">ענית נכון על 0 מתוך 10</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>1. מהו התפקיד המרכזי של <code>Backup Proxy</code> בארכיטקטורת Veeam Backup &amp; Replication?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. מהווה את ממשק הניהול הראשי (קונסולה) שדרכו מגדירים jobs</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. מבצע את העברת הנתונים בפועל בין המקור ליעד - קריאת בלוקים, דחיסה ודה-דופליקציה ראשונית - ומקל את העומס משרת הגיבוי המרכזי</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. שומר את קבצי הגיבוי (VBK/VIB) בפועל על הדיסק</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. מריץ את מסד הנתונים של תצורת Veeam (PostgreSQL)</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> ה-Proxy "עושה את העבודה הקשה" בפועל - קריאת בלוקים, דחיסה ודה-דופליקציה ראשונית - ובכך מקל את העומס משרת הגיבוי המרכזי. ניתן לפרוס מספר Proxies לצורך scale-out וביצועים מקבילים.</div>
</div>

<div class="quiz-card" data-answer="א">
  <p class="quiz-question"><strong>2. מהי ההגבלה המרכזית של <code>Veeam Community Edition</code> (הגרסה החינמית)?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. ניתן להגן על עד 10 עומסי עבודה (VMs/שרתים/תחנות עבודה) בלבד</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. אין אפשרות ליצור יותר מ-job אחד בכלל</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. אין תמיכה ב-Application-Aware Processing כלל</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. ניתן להתקין אותה רק על Linux</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> גרסת ה-Community Edition היא גרסה חינמית המוגבלת לעד 10 עומסי עבודה (VMs/Servers/Workstations), ומהווה כלי מצוין ללימוד, תרגול, ואף הכנה לראיונות עבודה.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>3. מהי משמעות <strong>Synthetic Full</strong> בהגדרת Backup Job?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. גיבוי מלא אמיתי שנקרא מחדש מה-VM המקורי בכל לילה</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. יצירת קובץ גיבוי מלא "מלאכותי" מתוך קבצי הגיבוי הקיימים ברפוזיטורי, בלי לקרוא שוב את הנתונים מה-VM המקורי - כך חוסכים עומס על הסביבה המוגנת</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. גיבוי שמתבצע רק על דיסקים שהוחרגו (Exclusions)</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. שיטה אוטומטית למחיקת נקודות שחזור ישנות</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> Synthetic Full בונה קובץ גיבוי מלא חדש מתוך קבצי הגיבוי הקיימים בריפוזיטורי (Full + Incrementals), בלי לקרוא שוב את כל הנתונים מה-VM המקורי - זה חוסך עומס משמעותי על סביבת הייצור, בהשוואה ל-Active Full.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>4. כלל <strong>3-2-1-1-0</strong> שמקדמת Veeam כולל שני מספרי "1" - אחד מייצג עותק Off-site. למה מתייחס ה-"1" השני?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. לכך שמותר לשמור רק עותק אחד בלבד באופן כללי</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. לעותק אחד Offline / Air-gapped / Immutable, שלא ניתן לשינוי או מחיקה</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. לכך שמותר להשתמש בריפוזיטורי אחד בלבד בסביבה</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. לכך שנדרש Backup Proxy אחד בלבד לכל הסביבה</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> כלל 3-2-1-1-0 המורחב הוא: 3 עותקי נתונים, על 2 סוגי מדיה, עותק אחד Off-site, עותק אחד נוסף Offline/Air-gapped/Immutable, ו-0 שגיאות לאחר אימות שחזוריות. ה-Immutability מונע מחיקה או שינוי גם מחשבון עם הרשאות אדמין - הגנה קריטית מפני כופרה.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>5. מה ההבדל המרכזי בין <strong>Failover</strong> רגיל (בלתי מתוכנן) לבין <strong>Planned Failover</strong>?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. אין הבדל מעשי בין השניים</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. Failover רגיל הוא תגובה לכשל בלתי צפוי ועלול לגרום לאובדן נתונים קטן מאז נקודת ה-Replica האחרונה; Planned Failover הוא מעבר מבוקר שבו Veeam מבצע סנכרון אחרון לפני המעבר, כך שמובטח אפס אובדן נתונים</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. Planned Failover מתבצע רק על מכונות פיזיות, לא וירטואליות</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. Failover רגיל דורש Failback תוך דקה בדיוק, ואילו Planned Failover לא דורש Failback כלל</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> Failover הוא תגובה למקרה כשל בלתי צפוי - עלול לגרום לאובדן נתונים קטן מאז נקודת ה-Replica האחרונה. Planned Failover הוא מעבר מתוזמן ומבוקר (למשל תחזוקה) - Veeam מבצע סנכרון אחרון לפני המעבר כדי להבטיח אפס אובדן נתונים.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>6. מהו <code>CBT</code> (Changed Block Tracking) ב-VMware, ומהי המקבילה שלו ב-Hyper-V?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. CBT הוא מנגנון להצפנת דיסקים; אין לו מקבילה ב-Hyper-V</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. CBT מזהה אילו בלוקים בדיסק השתנו מאז הגיבוי הקודם, ומאפשר גיבוי אינקרמנטלי מהיר בלי לסרוק את כל הדיסק; המקבילה ב-Hyper-V נקראת <code>RCT</code> (Resilient Change Tracking)</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. CBT הוא שם נרדף ל-Transport Mode מסוג NBD</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. CBT רץ רק פעם אחת במהלך ההתקנה הראשונית ולא נדרש יותר</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> CBT הוא הבסיס לגיבויים אינקרמנטליים מהירים ב-VMware - הוא מזהה אילו בלוקים השתנו בלי לסרוק את כל הדיסק. אם ה-CBT "נשבר" (corrupted), Veeam יבצע Reset CBT וסריקה מלאה חד-פעמית. ב-Hyper-V המנגנון המקביל נקרא RCT.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>7. מהו <strong>Threat Center</strong> ב-Veeam?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. כלי לניהול רישוי (Licensing) בלבד</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. מסך שמציג "Blast Radius" - אילו עומסי עבודה נמצאים בסיכון, אילו נקודות שחזור "נקיות" (מאומתות ללא Malware), ומאפשר סריקת נקודות שחזור לפני שחזור בפועל</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. שירות שמבצע Backup Copy אוטומטי לענן בלבד</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. הכלי שמייצר אך ורק דוחות PDF שבועיים</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> Threat Center מציג "Blast Radius" - איזה עומסי עבודה נמצאים בסיכון, אילו נקודות שחזור נקיות ממאלוור, ומאפשר סריקת נקודות שחזור (Malware Detection & Analysis) לפני שמבצעים שחזור בפועל.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>8. מהו הכלי הייעודי לבדיקת שלמות (CRC) של קובצי גיבוי, בלי לבצע שחזור מלא?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. <code>Veeam ONE Reporter</code></button>
    <button class="quiz-option" type="button" data-choice="ב">ב. <code>Veeam Backup Validator</code> - כלי CLI שבודק את שלמות קובצי הגיבוי</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. <code>Security &amp; Compliance Analyzer</code></button>
    <button class="quiz-option" type="button" data-choice="ד">ד. <code>Sync-VBRBackupRepository</code></button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> Veeam Backup Validator הוא כלי CLI ייעודי שבודק את שלמות (CRC) קובצי הגיבוי ללא צורך בשחזור מלא - שימושי לאיתור קבצים פגומים מוקדם, לפני שהם הופכים לבעיה בזמן שחזור אמיתי.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>9. מהו <strong>Hardened Repository</strong> ב-Veeam?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. Repository שרץ אך ורק בענן Azure</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. Repository מבוסס Linux עם immutability ברמת מערכת הקבצים (XFS עם Immutable flag), SSH מושבת לאחר ההגדרה הראשונית, וכתיבה מסוג append-only - מונע גישה אפילו מ-root לשנות קבצים קיימים בטווח ה-Immutability</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. Repository שתומך רק ב-Tape Jobs</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. Repository שדורש הרשאות Domain Admin לצורך גישה יומיומית</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> Hardened Repository הוא Repository מבוסס Linux עם הגדרות אבטחה מחוזקות - immutability ברמת מערכת הקבצים (XFS), SSH מושבת לאחר ההגדרה הראשונית, ו-append-only writes, כך שאפילו חשבון root לא יכול לשנות קבצים קיימים בטווח ה-Immutability.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>10. מהי מטרת <strong>SureBackup Job</strong>?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. יצירת עותק נוסף של הגיבוי בענן, כמו Backup Copy Job</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. הרצת בדיקת שחזוריות אוטומטית - מפעיל VMs בסביבת Virtual Lab מבודדת ובודק Heartbeat/Ping/Application tests, כדי לענות בבטחון על השאלה האם הגיבויים באמת עובדים</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. מחיקה אוטומטית של נקודות שחזור ישנות שחרגו מה-Retention</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. הצפנת קובצי הגיבוי בריפוזיטורי</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> SureBackup הוא הכלי לאימות שחזוריות אוטומטי - הוא מפעיל את ה-VMs בסביבת Virtual Lab מבודדת (כולל Application Group של VMs תלויים) ומריץ בדיקות Heartbeat, Ping ו-Application, במקום להסתמך רק על "ה-Job הסתיים בהצלחה".</div>
</div>

<button type="button" id="quiz-reset-all" class="quiz-reset-all">אפס את כל המבחן</button>

<style>
.quiz-score {
  font-weight: 600;
  font-size: 1.05em;
  padding: 0.6rem 1rem;
  margin-bottom: 1.5rem;
  border-radius: 8px;
  background: var(--sl-color-gray-6);
  border: 1px solid var(--sl-color-hairline);
  position: sticky;
  top: 0.5rem;
  z-index: 1;
}

.quiz-card {
  border: 1px solid var(--sl-color-hairline);
  border-radius: 10px;
  padding: 1rem 1.25rem;
  margin: 1.25rem 0;
  background: var(--sl-color-bg-nav);
}

.quiz-question {
  margin-top: 0;
  margin-bottom: 0.75rem;
}

.quiz-options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.quiz-option {
  display: block;
  width: 100%;
  text-align: right;
  padding: 0.55rem 0.8rem;
  border-radius: 8px;
  border: 1px solid var(--sl-color-hairline);
  background: var(--sl-color-bg);
  color: var(--sl-color-text);
  cursor: pointer;
  font: inherit;
  line-height: 1.5;
  transition: background-color 0.15s ease, border-color 0.15s ease;
}

.quiz-option:hover:not(:disabled) {
  border-color: var(--sl-color-accent);
  background: var(--sl-color-gray-6);
}

.quiz-option:disabled {
  cursor: default;
}

.quiz-option--correct {
  border-color: var(--sl-color-green);
  background: color-mix(in srgb, var(--sl-color-green) 18%, var(--sl-color-bg));
  color: var(--sl-color-text);
}

.quiz-option--incorrect {
  border-color: var(--sl-color-red);
  background: color-mix(in srgb, var(--sl-color-red) 18%, var(--sl-color-bg));
  color: var(--sl-color-text);
}

.quiz-result {
  margin-top: 0.6rem;
  font-weight: 600;
  min-height: 1.2em;
}

.quiz-result--correct {
  color: var(--sl-color-green-high, var(--sl-color-green));
}

.quiz-result--incorrect {
  color: var(--sl-color-red-high, var(--sl-color-red));
}

.quiz-explain {
  display: none;
  margin-top: 0.6rem;
  padding: 0.7rem 0.9rem;
  border-radius: 8px;
  background: var(--sl-color-gray-6);
  font-size: 0.92em;
}

.quiz-card--answered .quiz-explain {
  display: block;
}

.quiz-reset-all {
  margin-top: 0.5rem;
  padding: 0.5rem 1.2rem;
  border-radius: 8px;
  border: 1px solid var(--sl-color-hairline);
  background: var(--sl-color-bg-nav);
  color: var(--sl-color-text);
  cursor: pointer;
  font: inherit;
}

.quiz-reset-all:hover {
  border-color: var(--sl-color-accent);
}
</style>

<script>
(function () {
  function initQuiz() {
    var cards = document.querySelectorAll('.quiz-card');
    var scoreEl = document.getElementById('quiz-score');
    var resetAllBtn = document.getElementById('quiz-reset-all');

    function updateScore() {
      if (!scoreEl) return;
      var correctCount = document.querySelectorAll('.quiz-card--answered[data-was-correct="true"]').length;
      scoreEl.textContent = 'ענית נכון על ' + correctCount + ' מתוך ' + cards.length;
    }

    function answerCard(card, chosenBtn) {
      var correct = card.getAttribute('data-answer');
      var chosen = chosenBtn.getAttribute('data-choice');
      var isCorrect = chosen === correct;

      card.classList.add('quiz-card--answered');
      card.setAttribute('data-was-correct', isCorrect ? 'true' : 'false');

      var options = card.querySelectorAll('.quiz-option');
      options.forEach(function (opt) {
        opt.disabled = true;
        if (opt.getAttribute('data-choice') === correct) {
          opt.classList.add('quiz-option--correct');
        } else if (opt === chosenBtn) {
          opt.classList.add('quiz-option--incorrect');
        }
      });

      var result = card.querySelector('.quiz-result');
      if (result) {
        result.textContent = isCorrect ? '✅ נכון!' : '❌ לא נכון - התשובה הנכונה מסומנת בירוק.';
        result.classList.remove('quiz-result--correct', 'quiz-result--incorrect');
        result.classList.add(isCorrect ? 'quiz-result--correct' : 'quiz-result--incorrect');
      }

      updateScore();
    }

    function resetCard(card) {
      card.classList.remove('quiz-card--answered');
      card.removeAttribute('data-was-correct');
      var options = card.querySelectorAll('.quiz-option');
      options.forEach(function (opt) {
        opt.disabled = false;
        opt.classList.remove('quiz-option--correct', 'quiz-option--incorrect');
      });
      var result = card.querySelector('.quiz-result');
      if (result) {
        result.textContent = '';
        result.classList.remove('quiz-result--correct', 'quiz-result--incorrect');
      }
    }

    cards.forEach(function (card) {
      card.querySelectorAll('.quiz-option').forEach(function (btn) {
        btn.addEventListener('click', function () {
          if (card.classList.contains('quiz-card--answered')) return;
          answerCard(card, btn);
        });
      });
    });

    if (resetAllBtn) {
      resetAllBtn.addEventListener('click', function () {
        cards.forEach(resetCard);
        updateScore();
      });
    }

    updateScore();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initQuiz);
  } else {
    initQuiz();
  }
})();
</script>
