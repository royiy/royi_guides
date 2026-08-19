---
title: "מבחן אמריקאי - 10 שאלות על Git"
category: DevOps/Git
part: 11/10
---

מבחן אמריקאי אינטראקטיבי לבדיקה עצמית על כל מה שלמדתם לאורך מדריכי ה-Git (מבוא, ענפים ומיזוג, ביטול שינויים, Stash/Cherry-Pick, Remotes, Workflows, Internals, Hooks ואבטחה). בחרו תשובה בכל שאלה ותקבלו מיד משוב האם היא נכונה, יחד עם הסבר.

<div id="quiz-score" class="quiz-score">ענית נכון על 0 מתוך 10</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>1. מה ההבדל העיקרי בין <code>git fetch</code> ל-<code>git pull</code>?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. אין הבדל, אלו שני שמות לאותה פקודה</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. <code>fetch</code> מוריד עדכונים מה-remote בלי למזג אותם ל-branch הנוכחי, ו-<code>pull</code> מבצע <code>fetch</code> ואז <code>merge</code> (או <code>rebase</code>)</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. <code>pull</code> מוריד רק metadata, ו-<code>fetch</code> מוריד גם את הקבצים</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. <code>fetch</code> עובד רק על branch מרוחק, ו-<code>pull</code> עובד רק על branch מקומי</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> <code>fetch</code> רק מסנכרן את המידע מה-remote (מעדכן branches מרוחקים כמו <code>origin/main</code>) בלי לגעת ב-branch המקומי שעליו אתם עובדים. <code>pull</code> הוא בעצם <code>fetch</code> + <code>merge</code>/<code>rebase</code> אוטומטי לתוך ה-branch הנוכחי.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>2. פקודת ה-<code>git merge</code> מייצרת "Fast-Forward merge" מתי?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. תמיד, בכל מיזוג</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. כשה-branch המטרה לא התקדם כלל מאז שה-branch שממזגים ממנו נוצר, כך שאפשר פשוט להזיז את המצביע קדימה</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. כשיש קונפליקטים בין שני הענפים</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. רק כשמשתמשים בדגל <code>--squash</code></button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> Fast-Forward קורה כשאין "התפצלות" אמיתית - ה-branch שאליו ממזגים לא זז מאז שהסתעפו ממנו, אז Git פשוט מזיז את המצביע (pointer) קדימה בלי ליצור commit מיזוג ייעודי.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>3. מה עושה <code>git reset --hard HEAD~1</code>?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. מוחק את ה-commit האחרון מה-remote בלבד</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. מזיז את ה-branch אחורה ב-commit אחד, ומאפס גם את ה-staging area וגם את ה-working directory למצב של אותו commit (השינויים הולכים לאיבוד)</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. יוצר commit חדש שמבטל את השינויים של ה-commit האחרון, תוך שמירה על ההיסטוריה</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. מעביר את ה-commit האחרון ל-stash</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> <code>--hard</code> הוא המסוכן מבין דגלי ה-reset - הוא לא רק מזיז את ה-branch, אלא גם דורס את ה-staging area וה-working directory. שינויים לא-committed הולכים לאיבוד לצמיתות (אלא אם נשמרו ב-stash לפני כן).</div>
</div>

<div class="quiz-card" data-answer="א">
  <p class="quiz-question"><strong>4. מהו ההבדל המרכזי בין <code>git revert</code> ל-<code>git reset</code>?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. <code>revert</code> יוצר commit חדש שמבטל שינויים קודמים ושומר על ההיסטוריה, ואילו <code>reset</code> משנה/מוחק היסטוריה קיימת</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. <code>revert</code> עובד רק על branch מרוחק, ו-<code>reset</code> רק על branch מקומי</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. אין הבדל מעשי, שתי הפקודות שקולות</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. <code>reset</code> בטוח יותר לשימוש על branch משותף מ-<code>revert</code></button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> זו בדיוק הסיבה ש-<code>revert</code> בטוח לשימוש על branches משותפים/ציבוריים - הוא מוסיף commit חדש ולא מוחק/משנה כלום מההיסטוריה הקיימת. <code>reset</code> לעומת זאת יכול "למחוק" commits מההיסטוריה של ה-branch, מה שמסוכן אם כבר נדחפו ואחרים עובדים איתם.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>5. מתי משתמשים ב-<code>git stash</code>?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. כדי למחוק שינויים לצמיתות</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. כדי לשמור זמנית שינויים לא-committed (staged ולא-staged) בצד, ולחזור אליהם מאוחר יותר - למשל כשצריך לעבור branch באמצע עבודה</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. כדי ליצור branch חדש מה-commit הנוכחי</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. כדי לדחוף (push) שינויים ל-remote בלי commit</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> Stash הוא "מגירה" זמנית - שימושי כשצריך להחליף הקשר (למשל לעבור ל-branch אחר לתקן באג דחוף) בלי לעשות commit לעבודה חצי-מוגמרת.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>6. מה עושה <code>git cherry-pick &lt;commit-hash&gt;</code>?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. מוחק commit ספציפי מההיסטוריה של כל הענפים</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. לוקח את השינויים מ-commit ספציפי מ-branch אחר ומחיל אותם כ-commit חדש על ה-branch הנוכחי</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. יוצר tag חדש שמצביע על אותו commit</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. ממזג שני branches לגמרי</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> Cherry-pick מאפשר "לשאול" commit בודד מ-branch אחר בלי למזג את כל ה-branch - שימושי למשל כשצריך רק תיקון (hotfix) ספציפי אחד מ-branch פיתוח.</div>
</div>

<div class="quiz-card" data-answer="א">
  <p class="quiz-question"><strong>7. מהו ההבדל בין Merge ל-Rebase כאסטרטגיות שילוב היסטוריה?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. Merge יוצר commit מיזוג חדש ושומר על ההיסטוריה המקורית של שני הענפים; Rebase "משכתב" את ההיסטוריה ומניח מחדש את ה-commits שלך על גבי בסיס חדש, ויוצר היסטוריה ליניארית</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. Rebase תמיד מהיר יותר אך אסור לשימוש בשום מצב</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. Merge ו-Rebase מייצרים תמיד אותו hash של commit</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. Rebase משמש רק למחיקת branches</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> Merge שומר את ההיסטוריה המדויקת כפי שקרתה (כולל נקודות ההסתעפות), ואילו Rebase יוצר היסטוריה "נקייה" וליניארית - אבל משנה בפועל את ה-hashes של ה-commits, ולכן מסוכן לביצוע על branches ציבוריים ששותפים כבר משכו.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>8. מה מייצג ה-hash של commit ב-Git (SHA-1/SHA-256)?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. מספר סידורי עולה שה-server מקצה לכל commit</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. Checksum שמחושב מתוכן ה-commit (כולל snapshot של הקבצים, ה-parent, המחבר וההודעה) - כל שינוי קטן משנה את ה-hash לגמרי</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. שם המשתמש שיצר את ה-commit, מוצפן</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. מספר ה-branch שבו נוצר ה-commit</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> ה-hash הוא לא מספר סידורי, אלא checksum קריפטוגרפי שמבוסס על התוכן עצמו - זו הסיבה ששני commits לעולם לא יקבלו את אותו hash אלא אם התוכן שלהם (כולל parent) זהה לחלוטין, וזו גם הבסיס לכך ש-Git יכול לזהות שינוי/שיבוש בהיסטוריה.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>9. מהו Git Hook, ולמה ישמש למשל <code>pre-commit</code>?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. פקודת Git להורדת קבצים מה-remote</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. סקריפט שרץ אוטומטית בשלב מסוים במחזור החיים של Git (כמו לפני יצירת commit) - למשל להרצת linter או בדיקת סודות לפני שהקוד בכלל נכנס להיסטוריה</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. כינוי (alias) מקוצר לפקודת <code>git commit</code></button>
    <button class="quiz-option" type="button" data-choice="ד">ד. מנגנון להצפנת קבצים ב-repository</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> Hooks הם סקריפטים מקומיים (לרוב ב-<code>.git/hooks/</code>, או מנוהלים דרך כלים כמו Husky) שמופעלים אוטומטית באירועים מסוימים. <code>pre-commit</code> למשל רץ לפני שה-commit נוצר בפועל, ומאפשר "לתפוס" בעיות (פורמט, סודות, בדיקות) לפני שהן בכלל נכנסות להיסטוריה.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>10. אם דחפתם (push) בטעות סוד (API key) להיסטוריית Git ציבורית, מה הצעד הכי חשוב לבצע ראשון?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. למחוק את הקובץ מהקומיט האחרון עם <code>git rm</code> ולעשות push חדש</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. להחליף (rotate) את הסוד מיידית אצל הספק - כי ברגע שנחשף יש להתייחס אליו כ"שרוף" גם אם ינוקה מההיסטוריה</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. להפוך את ה-repository לפרטי ולסיים בכך</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. להתעלם, כי Git שומר הכל בהצפנה ואף אחד לא יכול לגשת להיסטוריה ישנה</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> ניקוי היסטוריה (עם <code>filter-repo</code>/BFG) חשוב כניקיון נוסף, אבל לא מספיק כפתרון עצמאי - ברגע שסוד נחשף (במיוחד ב-repository ציבורי) יש להניח שהוא כבר נצפה/נשמר במקומות אחרים (caches, forks, סורקים אוטומטיים), ולכן רוטציה מיידית של הסוד היא הצעד הקריטי הראשון.</div>
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
