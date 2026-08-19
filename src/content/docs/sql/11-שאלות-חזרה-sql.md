---
title: "שאלות חזרה מקיפות על SQL"
category: SQL
part: 11/10
---

שאלות חזרה אינטראקטיביות על כל מה שלמדתם לאורך סדרת מדריכי ה-SQL (מבוא ו-RDBMS מול NoSQL, SELECT/WHERE/JOIN, DDL ו-Constraints, DML ו-Transactions, Indexes וביצועים, Normalization, Views/Procedures/Triggers, Backup ו-Recovery, והרשאות ואבטחה). בחרו תשובה בכל שאלה ותקבלו מיד משוב האם היא נכונה, יחד עם הסבר.

<div id="quiz-score" class="quiz-score">ענית נכון על 0 מתוך 10</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>1. מהו ההבדל המרכזי בין RDBMS ל-NoSQL מבחינת עסקאות?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. RDBMS תומך רק בקריאה, NoSQL רק בכתיבה</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. RDBMS מבוסס על תכונות <strong>ACID</strong> מובנות ומחייבות, בעוד NoSQL בדרך כלל מסתמך על מודל <strong>BASE</strong> (Eventually Consistent)</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. NoSQL תמיד מהיר יותר מ-RDBMS בכל תרחיש</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. אין הבדל, שניהם תומכים תמיד ב-JOIN מובנה</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> מסדי נתונים רלציוניים (RDBMS) מארגנים מידע בטבלאות עם Schema קשיח ותומכים ב-JOIN ובעסקאות עם תכונות ACID מלאות. מסדי NoSQL מוותרים לרוב על סכימה קשיחה או JOINs בתמורה לגמישות וקנה מידה אופקי, ומסתפקים במודל BASE.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>2. מדוע הוספת תנאי WHERE על עמודה מהטבלה הימנית ב-LEFT JOIN עלולה להפוך אותו בפועל ל-INNER JOIN?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. כי LEFT JOIN לא תומך ב-WHERE כלל</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. כי שורות עם NULL בעמודה הימנית (ללא התאמה) ייפסלו על ידי תנאי ה-WHERE, ולכן בפועל נשארות רק שורות עם התאמה אמיתית בשתי הטבלאות</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. כי WHERE משנה את הסדר הפיזי של הטבלאות ב-JOIN</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. כי זו התנהגות ספציפית ל-MySQL בלבד</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> תנאי WHERE מסנן שורות אחרי שה-JOIN בוצע, כך שכל שורה עם NULL בעמודה הימנית (שהגיעה מ-LEFT JOIN ללא התאמה) תיפסל על ידי תנאי כמו <code>d.location = 'תל אביב'</code>. הפתרון הוא להעביר את התנאי הזה ל-ON ולא ל-WHERE.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>3. מה ההבדל בין DELETE, TRUNCATE ו-DROP?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. שלושתם מבצעים בדיוק אותה פעולה, רק בתחביר שונה</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. <code>DELETE</code> מוחק שורות ספציפיות (ניתן ל-Rollback, מפעיל Triggers), <code>TRUNCATE</code> מרוקן את כל הטבלה במהירות (לרוב לא ניתן ל-Rollback, לא מפעיל Triggers), ו-<code>DROP</code> מוחק את הטבלה כולה כולל המבנה</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. <code>TRUNCATE</code> מוחק רק עמודה בודדת מהטבלה</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. <code>DROP</code> הוא היחיד מבין השלוש שניתן לבטל בעזרת Rollback</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> DELETE הוא פקודת DML הפועלת על שורות ומפעילה Triggers, וניתנת ל-Rollback בתוך Transaction. TRUNCATE וDROP הן פעולות DDL שברוב המנועים מבצעות Commit אוטומטי ואינן ניתנות ל-Rollback באותה קלות.</div>
</div>

<div class="quiz-card" data-answer="ג">
  <p class="quiz-question"><strong>4. מה עושה <code>ROLLBACK TO SAVEPOINT</code> בתוך Transaction?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. מבטל את כל העסקה כולה מההתחלה</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. מבצע COMMIT מיידי לכל השינויים שנעשו עד כה בעסקה</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. מבטל רק את השינויים שבוצעו מאז אותו Savepoint ואילך, תוך שמירה על שינויים קודמים בעסקה</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. יוצר משתמש חדש במסד הנתונים</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> Savepoint מאפשר לבטל חלק מהעסקה בלבד. לדוגמה, אם בוצעו INSERT ואז SAVEPOINT ואז UPDATE שגוי, ROLLBACK TO SAVEPOINT מבטל רק את ה-UPDATE, וה-INSERT נשאר בתוקף עד ל-COMMIT הסופי.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>5. יש אינדקס מורכב (Composite Index) על העמודות <code>(employee_id, order_date)</code>. לאיזו שאילתה האינדקס הזה יעיל?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. שאילתה שמסננת רק לפי <code>order_date</code></button>
    <button class="quiz-option" type="button" data-choice="ב">ב. שאילתה שמסננת לפי <code>employee_id</code> בלבד, או לפי <code>employee_id</code> ו-<code>order_date</code> יחד</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. האינדקס לא יעיל לאף שאילתה בכלל</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. רק לשאילתות שמכילות ORDER BY על עמודה שלישית שאינה קיימת באינדקס</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> בכלל אצבע לאינדקס מורכב, סדר העמודות משנה. אינדקס על <code>(employee_id, order_date)</code> יעיל לשאילתה שמסננת לפי <code>employee_id</code> בלבד או לפי שניהם, אך לא יעיל לשאילתה שמסננת רק לפי <code>order_date</code>.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>6. מהי הדרישה המרכזית של 3NF (הצורה הנורמלית השלישית)?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. כל תא בטבלה חייב להכיל רשימת ערכים מרובים</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. אסור שתהיה תלות טרנזיטיבית - עמודה לא-מפתח לא יכולה להיות תלויה בעמודה לא-מפתח אחרת, אלא רק במפתח הראשי</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. חובה שלכל טבלה יהיה מפתח מורכב (Composite Key)</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. אסור להשתמש בכלל ב-Foreign Key</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> 3NF דורש עמידה ב-2NF, וכן היעדר תלות טרנזיטיבית. דוגמה קלאסית: אם עמודת <code>department_name</code> תלויה ב-<code>department_id</code> ולא ישירות ב-<code>employee_id</code>, יש לפרק אותה לטבלת <code>departments</code> נפרדת.</div>
</div>

<div class="quiz-card" data-answer="א">
  <p class="quiz-question"><strong>7. מה ההבדל בין View רגיל ל-Materialized View?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. View רגיל מריץ את השאילתה מחדש בכל פנייה, ואילו Materialized View שומר את התוצאה בפועל על הדיסק ודורש רענון מפורש (<code>REFRESH MATERIALIZED VIEW</code>)</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. View רגיל תמיד מהיר יותר מ-Materialized View</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. Materialized View אינו יכול להכיל JOIN או אגרגציה</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. אין הבדל מעשי בין השניים</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> View רגיל הוא שאילתת SELECT "שמורה" שמתבצעת מחדש בכל פנייה. Materialized View שומר את התוצאה בפועל, ומספק ביצועי קריאה כמו טבלה שטוחה - אך זקוק ל-REFRESH מפורש כדי לשקף שינויים בנתונים.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>8. מה משמעות ה-RPO (Recovery Point Objective)?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. משך הזמן המקסימלי שהמערכת יכולה להיות למטה עד לשחזור מלא</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. כמות הנתונים המקסימלית שמותר לאבד, במונחי זמן (למשל "עד 15 דקות אחורה")</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. מספר הגיבויים המלאים שיש לשמור בכל רגע נתון</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. שם השרת שאליו משוחזר הגיבוי</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> RPO מגדיר כמה נתונים מקסימלית מותר לאבד. RTO (Recovery Time Objective), לעומת זאת, מגדיר כמה זמן מקסימלי מותר שהמערכת תהיה למטה עד לשחזור מלא. שניהם יחד קובעים את אסטרטגיית הגיבוי המתאימה, כולל הצורך ב-Point-in-Time Recovery.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>9. מהי ההגנה האמיתית והמרכזית מפני SQL Injection?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. הצפנת כל הטבלאות במסד הנתונים</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. שימוש ב-Parameterized Queries (Prepared Statements) במקום שרשור קלט משתמש ישירות למחרוזת SQL</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. חסימת כל גישה חיצונית לשרת מסד הנתונים</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. שימוש ב-<code>SELECT *</code> בכל שאילתה</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> הפתרון האמיתי היחיד הוא לעולם לא לשרשר קלט משתמש ישירות לתוך מחרוזת SQL, אלא להשתמש בפרמטרים (Placeholders) שהמנוע מטפל בהם בנפרד מהקוד עצמו. Escaping ידני ו-Least Privilege הן שכבות הגנה משלימות, אך לא תחליף לכך.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>10. מה ההבדל בין Window Function (עם <code>OVER()</code>) ל-GROUP BY?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. אין הבדל, שניהם מייצרים תמיד בדיוק את אותה תוצאה</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. <code>GROUP BY</code> מצמצם את מספר השורות לשורה אחת לכל קבוצה, ואילו Window Function מחשב ערך אגרגטיבי בלי לצמצם שורות - כל שורה מקורית נשארת עם עמודה נוספת</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. Window Function עובד רק במנוע MySQL</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. <code>GROUP BY</code> לא יכול לשמש יחד עם <code>COUNT</code> או <code>AVG</code></button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> לדוגמה, <code>SELECT employee_id, salary, AVG(salary) OVER (PARTITION BY department_id) AS dept_avg_salary FROM employees;</code> מחזיר שורה לכל עובד עם הממוצע של המחלקה שלו לצידה, בעוד ש-GROUP BY היה מחזיר שורה אחת בלבד לכל מחלקה.</div>
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
