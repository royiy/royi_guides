---
sidebar_position: 11
title: "מדריך 11 — שאלות חזרה על כל סדרת PowerShell"
---

<!-- מדריך PowerShell בעברית | נבנה ללמידה, תרגול והכנה לראיונות -->

שאלות חזרה אינטראקטיביות על כל מה שלמדתם לאורך סדרת מדריכי ה-PowerShell (בסיס ו-Pipeline, קבצים/תהליכים/Services, Active Directory, Remoting ו-WinRM, Error Handling, סקריפטים מתקדמים, רשתות, Microsoft 365/Exchange/Entra, ענן ומאגר הראיון). בחרו תשובה בכל שאלה ותקבלו מיד משוב האם היא נכונה, יחד עם הסבר.

<div id="quiz-score" class="quiz-score">ענית נכון על 0 מתוך 10</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>1. לפי מדריך 01, מהו ההבדל המרכזי בין PowerShell לבין CMD?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. אין הבדל אמיתי בין השניים</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. PowerShell עובד בראש ובראשונה עם אובייקטים ולא רק עם טקסט, ולכן אפשר להעביר אובייקט מפקודה אחת לאחרת ב-Pipeline בלי לפרק פלט טקסט</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. CMD מהיר יותר בכל מצב</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. PowerShell פועל אך ורק על Linux</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> ההבדל הבסיסי ביותר הוא שה-Pipeline של PowerShell מעביר אובייקטים מלאים (עם Properties ו-Methods) בין פקודות, בעוד CMD מעביר טקסט גולמי בלבד שצריך "לפרסר" בעצמכם.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>2. לפי מדריך 02 (תרחיש "דיסק מלא"), למה מומלץ להריץ קודם <code>Remove-Item C:\Temp\*.log -WhatIf</code> לפני מחיקה בפועל?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. כי בלי WhatIf הפקודה כלל לא רצה</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. כדי לראות מה היה נמחק, בלי לבצע בפועל את הפעולה, ולוודא לפני שינוי אמיתי</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. כי WhatIf משחזר אוטומטית קבצים שנמחקו בטעות</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. כי WhatIf מגדיל את מהירות המחיקה</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> <code>-WhatIf</code> מדמה את הפעולה ומראה מה היה קורה, בלי לשנות בפועל שום דבר. המדריך מדגיש שבפעולות מחיקה/שינוי כדאי להשתמש בו קודם לבדיקה, ורק אחר כך להריץ בלי הדגל לביצוע אמיתי.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>3. לפי מדריך 03 (Active Directory), מה הבעיה שצוינה לגבי הערך <code>LastLogonDate</code>?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. הוא תמיד מציג <code>$null</code> עבור כל המשתמשים</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. הוא ערך משוכפל/מקורב ולא מדויק לחלוטין - לדיוק מלא יש להבין את <code>lastLogon</code> מול ה-DCs השונים ואת מנגנון הרפליקציה</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. הוא זמין רק למחשבים (Computers) ולא למשתמשים</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. הוא מתעדכן רק פעם בשנה</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> המדריך מציין במפורש שהתשובה לשאלה "האם LastLogonDate מדויק לחלוטין?" היא לא - זהו ערך משוכפל/מקורב, ולדיוק אמיתי צריך להשוות <code>lastLogon</code> מול מספר Domain Controllers.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>4. לפי מדריך 04 (Remoting), מה עושה התחילית <code>$using:</code> בתוך <code>ScriptBlock</code> של <code>Invoke-Command</code>, כמו ב-<code>Get-Service -Name $using:name</code>?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. יוצרת PSSession חדש אוטומטית עבור כל שרת</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. מאפשרת להעביר ערך של משתנה שהוגדר מקומית (בצד ה-Client) פנימה אל תוך ה-ScriptBlock שרץ על השרת המרוחק</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. מבטלת את הצורך לספק Credential</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. מגבילה את הרצת הפקודה לשרת מקומי בלבד</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> בלי <code>$using:</code>, משתנה שהוגדר בצד ה-Client (למשל <code>$name = "Spooler"</code>) לא יהיה מוכר בתוך ה-ScriptBlock שמופעל בהקשר של השרת המרוחק. המדריך מדגיש ש-<code>$using:</code> חשוב מאוד בראיונות עבודה.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>5. לפי מדריך 05, למה בלוק <code>try { Get-Item C:\DoesNotExist.txt } catch { "Caught" }</code> עלול "לא לתפוס" את השגיאה בפועל?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. כי <code>try/catch</code> לא נתמך בכלל ב-PowerShell</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. כי מדובר כברירת מחדל בשגיאה Non-terminating, ורק הוספת <code>-ErrorAction Stop</code> הופכת אותה ל-Terminating Error שנתפסת ב-<code>catch</code></button>
    <button class="quiz-option" type="button" data-choice="ג">ג. כי צריך הרשאות Administrator כדי להשתמש ב-<code>try/catch</code></button>
    <button class="quiz-option" type="button" data-choice="ד">ד. כי <code>Get-Item</code> אף פעם לא מחזירה שגיאה, רק <code>$null</code></button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> המדריך מסביר שלא כל שגיאה היא terminating error, וכדי ש-<code>catch</code> יתפוס אותה יש צורך לרוב ב-<code>-ErrorAction Stop</code> על הפקודה הרלוונטית - בלעדיו הביצוע פשוט ממשיך הלאה.</div>
</div>

<div class="quiz-card" data-answer="א">
  <p class="quiz-question"><strong>6. לפי מדריך 06, למה בניית מערך גדול בלולאה בעזרת <code>$array += $item</code> נחשבת לא יעילה, ומה האלטרנטיבה המומלצת?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. כל <code>+=</code> יוצר בפועל מערך חדש ומעתיק אליו את כל האיברים הקודמים; עדיף להשתמש ב-<code>[System.Collections.Generic.List[object]]</code> עם המתודה <code>Add</code></button>
    <button class="quiz-option" type="button" data-choice="ב">ב. אי אפשר בכלל להוסיף איברים למערך לאחר יצירתו</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. <code>+=</code> עובד רק על Hashtable ולא על מערכים</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. האלטרנטיבה המומלצת היא שימוש ב-<code>Format-Table</code> בתוך הלולאה</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> המדריך מציג בדיוק את ההשוואה הזו: <code>$array += $item</code> "לא מומלץ" כי הוא יוצר עותק חדש של המערך בכל איטרציה, לעומת <code>[System.Collections.Generic.List[object]]::new()</code> עם <code>.Add()</code> שמסומן כ"עדיף" מבחינת ביצועים.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>7. לפי מדריך 07, אם <code>Test-NetConnection SQL01 -Port 1433</code> מחזיר <code>True</code>, מה זה כן ולא מוכיח?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. זה מוכיח גם שה-SQL Query מהיר, שה-Login עובד ושה-DB בריא</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. זה מוכיח רק שיש TCP connectivity לפורט - זה לא אומר שה-Query מהיר, שה-Login עובד, שה-DB בריא או שהאפליקציה תקינה</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. זה מוכיח שה-Firewall כבוי לגמרי בשרת</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. זה מייתר את הצורך לבדוק DNS ו-HTTP בהמשך</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> המדריך מדגיש שוב ושוב את עקרון ה-Troubleshooting השכבתי: DNS → TCP → TLS → HTTP → Application. תוצאת True מ-<code>Test-NetConnection</code> מאשרת רק את שכבת ה-TCP, ואינה מוכיחה שהשכבות שמעליה (Query, Login, בריאות ה-DB) תקינות.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>8. לפי מדריך 08, מהו ההבדל בין Microsoft Graph PowerShell (<code>Connect-MgGraph</code>/<code>Get-MgUser</code>) לבין Exchange Online Management (<code>Connect-ExchangeOnline</code>/<code>Get-EXOMailbox</code>)?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. אין הבדל, אלו שני שמות לאותו מודול בדיוק</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. Microsoft Graph משמש לניהול משאבי Entra (כמו משתמשים וקבוצות), בעוד Exchange Online Management מיועד ספציפית לניהול Mailboxes ומייל ב-Exchange Online</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. Exchange Online Management עובד אך ורק על שרתי Exchange On-Prem</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. Microsoft Graph מיועד רק לניהול משאבי AWS</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> המדריך מציג את שני המודולים בנפרד: <code>Get-MgUser</code>/<code>Get-MgGroup</code> דרך Microsoft Graph לניהול משתמשים וקבוצות ב-Entra, ו-<code>Get-EXOMailbox</code> דרך <code>ExchangeOnlineManagement</code> לניהול תיבות דואר וזרימת מייל.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>9. לפי מדריך 09, מהי הגישה המומלצת במקום לשמור בקוד <code>$accessKey = "AKIA..."</code>?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. להצפין את המפתח ב-Base64 ולהשאיר אותו בקובץ הסקריפט</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. להשתמש ב-Managed Identity, IAM Role, Workload Identity, Federated credentials, Secret store או Key Vault במקום Secrets מוטבעים בקוד</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. לשמור את המפתח בהערה (Comment) בראש הסקריפט</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. אין בכך בעיה כל עוד ה-Repository ציבורי</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> המדריך קובע במפורש "לעולם אל תעשה" לגבי מפתחות מוטבעים בקוד, ומציג כתחליף Managed Identity, IAM Role, Workload Identity, Federated credentials, Secret store, Key Vault או AWS Secrets Manager/SSM לפי התרחיש.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>10. לפי מדריך 10 (מאגר שאלות ראיון), למה לא מומלץ להריץ <code>Get-Service | Format-Table | Export-Csv report.csv</code>?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. כי <code>Format-Table</code> עוצר לגמרי את ריצת ה-Pipeline</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. כי פקודות <code>Format-*</code> מייצרות אובייקטי formatting לתצוגה בלבד ולא את מבנה הנתונים המקורי, כך שה-CSV לא ייצא את הנתונים כראוי</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. כי <code>Export-Csv</code> לא תומך בכלל בקבלת קלט מ-Pipeline</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. כי חובה להריץ קודם <code>Sort-Object</code> לפני כל <code>Export-Csv</code></button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> המדריך מציג את זה כשאלת "Trick": יש להשתמש ב-<code>Select-Object Name,Status</code> ואז <code>Export-Csv -NoTypeInformation</code>, ולא ב-<code>Format-Table</code> שהוא שכבת תצוגה בלבד ואינו מתאים לאוטומציה או ליצוא נתונים.</div>
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
