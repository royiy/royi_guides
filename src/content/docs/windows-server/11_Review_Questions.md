---
title: "מדריך 11: שאלות חזרה"
description: "מבחן אמריקאי אינטראקטיבי לחזרה על כל נושאי סדרת Windows Server."
---

מבחן חזרה אינטראקטיבי המסכם את כל סדרת מדריכי Windows Server - התקנה ובסיס, Active Directory, Group Policy, DNS ו-DHCP, שרתי קבצים והרשאות, רשתות ו-Firewall, PowerShell, IIS, Hyper-V, ואבטחה וגיבוי. בחרו תשובה בכל שאלה ותקבלו מיד משוב האם היא נכונה, יחד עם הסבר.

<div id="quiz-score" class="quiz-score">ענית נכון על 0 מתוך 10</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>1. מהו היתרון המרכזי של התקנת Windows Server במצב <code>Server Core</code> לעומת <code>Desktop Experience</code> (GUI)?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. ממשק גרפי נוח יותר לניהול יומיומי</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. שטח תקיפה (Attack Surface) מצומצם בהרבה, פחות עדכונים ופחות צריכת משאבים</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. תמיכה בלעדית בהתקנת Active Directory, שלא קיימת בגרסת ה-GUI</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. התקנה איטית יותר אך עם יציבות גבוהה יותר</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> <code>Server Core</code> מותקן ללא ממשק גרפי (שורת פקודה בלבד, מנוהל למשל דרך <code>sconfig</code>), מה שמצמצם משמעותית את שטח התקיפה, מקטין את מספר העדכונים והפעולות מחדש הנדרשות, וחוסך משאבי RAM ו-CPU בהשוואה ל-Desktop Experience.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>2. מהו תפקידו של ה-<code>PDC Emulator</code>, אחד מחמשת תפקידי ה-FSMO ב-Active Directory?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. מנהל בלעדית את סל המיחזור (Recycle Bin) של ה-AD</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. אחראי בין היתר על סנכרון שעון (Time Sync) בדומיין, ניהול שינויי סיסמאות ונעילת חשבונות</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. שרת ה-DNS היחיד המורשה בכל ה-Forest</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. מסד נתונים לקריאה בלבד עם עותק מלא של כל האובייקטים בכל הדומיינים</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> ה-PDC Emulator אחראי על סנכרון שעון (Time Sync) מול כל שאר השרתים והמחשבים בדומיין, ניהול שינויי סיסמאות ונעילת חשבונות ברחבי הדומיין, ועדכוני GPO. תשובה ד' מתארת בפועל את ה-Global Catalog, שהוא בכלל מסד נתונים <strong>חלקי</strong> (Read-Only) ולא מלא.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>3. לפי סדר החלת ה-GPO (LSDOU), יש GPO ברמת הדומיין שמגדיר רקע שולחן עבודה אחד, ו-GPO ברמת ה-OU שמגדיר רקע אחר - ואף אחד מהם לא מסומן כ-<code>Enforced</code>. מי מנצח?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. הדומיין תמיד מנצח ללא קשר להגדרות ה-OU</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. ה-OU מנצח, כי הוא הרמה האחרונה שמיושמת בסדר LSDOU וקרובה יותר לאובייקט</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. שני ה-GPOs מתבטלים ולא תוחל אף הגדרת רקע</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. המשתמש נשאל ובוחר בעצמו איזו הגדרה תחול</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> סדר ההחלה הוא LSDOU - Local, Site, Domain, OU. ההגדרה האחרונה שמיושמת (ברמת ה-OU) דורסת הגדרות קודמות במקרה של התנגשות, כל עוד לא סומן <code>Enforced</code> ברמה גבוהה יותר.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>4. מהם ארבעת השלבים בתהליך <code>DORA</code> של קבלת כתובת IP מ-DHCP?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. Delete, Offer, Renew, Ack - תהליך מחיקה וחידוש כתובות ישנות</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. Discover, Offer, Request, Acknowledge - הלקוח מחפש שרת DHCP, מקבל הצעה, מבקש אישור, ומקבל אישור סופי</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. פרוטוקול הצפנה שמגן על תעבורת ה-DHCP ברשת</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. שיטת ההגדרה של DHCP Reservation לפי כתובת MAC</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> DORA הוא Discover (הלקוח משדר Broadcast בחיפוש שרת DHCP), Offer (השרת מציע כתובת), Request (הלקוח מבקש לאשר את הכתובת המוצעת) ו-Acknowledge (השרת מאשר ושומר את הרישום).</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>5. למשתמש יש הרשאת Share של <code>Full Control</code> על תיקייה משותפת, אך הרשאת NTFS של <code>Read</code> בלבד על אותה תיקייה בדיסק. מה תהיה ההרשאה בפועל בגישה מרחוק?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. Full Control, כי הרשאת ה-Share תמיד גוברת על הרשאת ה-NTFS</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. Read בלבד - ההרשאה המגבילה ביותר (Most Restrictive) מבין השתיים היא זו שתנצח</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. המערכת תחסום גישה לחלוטין בגלל הסתירה בין ההרשאות</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. ההרשאה משתנה אקראית בכל התחברות מחדש</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> בגישה מרחוק לתיקייה משותפת נבדקות גם הרשאות ה-Share וגם הרשאות ה-NTFS, וההרשאה המגבילה ביותר היא זו שקובעת בפועל. לכן Full Control ב-Share מול Read ב-NTFS יסתכם ביכולת קריאה בלבד.</div>
</div>

<div class="quiz-card" data-answer="ג">
  <p class="quiz-question"><strong>6. מדוע מומלץ להשתמש ב-<code>Test-NetConnection -ComputerName srv-db-01 -Port 1433</code> במקום ב-<code>ping</code> רגיל, כדי לבדוק אם שירות מסוים זמין על שרת מרוחק?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. Test-NetConnection מהיר משמעותית יותר מ-ping מבחינת זמן תגובה</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. ping פועל רק ברשתות IPv6 ואינו תומך ב-IPv4</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. ping משתמש ב-ICMP שנחסם לעיתים קרובות ע"י Firewall גם כשהשירות עצמו פעיל, בעוד Test-NetConnection -Port בודק חיבור TCP בפועל אל הפורט הספציפי</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. Test-NetConnection אינו דורש הרשאות מנהל בעוד ping כן</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> Firewall יכול לחסום בקשות ICMP (עליהן מבוסס ping) גם כשהשרת והאפליקציה פעילים לגמרי. <code>Test-NetConnection</code> עם <code>-Port</code> בודק חיבור TCP אמיתי לפורט הרלוונטי (למשל 1433 ל-SQL), ולכן נותן תמונת מצב אמינה יותר של זמינות השירות בפועל.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>7. מהי התבנית המבנית שלפיה בנויות פקודות (Cmdlets) ב-PowerShell?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. Noun-Verb, למשל <code>Process-Get</code></button>
    <button class="quiz-option" type="button" data-choice="ב">ב. Verb-Noun (פועל-שם עצם), למשל <code>Get-Process</code> או <code>Stop-Service</code></button>
    <button class="quiz-option" type="button" data-choice="ג">ג. שם חופשי לחלוטין ללא מוסכמת מבנה קבועה</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. תמיד עם הקידומת <code>Win-</code> בתחילת הפקודה</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> Cmdlets ב-PowerShell בנויים תמיד בתצורת <code>Verb-Noun</code>, כמו <code>Get-Process</code>, <code>Stop-Service</code> ו-<code>New-Item</code>, מה שמקנה עקביות ומאפשר חיפוש פקודות לפי מילת מפתח עם <code>Get-Command</code>.</div>
</div>

<div class="quiz-card" data-answer="ג">
  <p class="quiz-question"><strong>8. מדוע חשוב להפריד אתרים שונים ל-<code>Application Pool</code> נפרד לכל אתר ב-IIS?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. זו דרישה טכנית מוחלטת - לא ניתן טכנית להריץ שני אתרים באותו App Pool</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. זה משפר אך ורק את מהירות הטעינה הראשונית של דפי האתר</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. זה מספק בידוד (Isolation) - קריסה או דליפת זיכרון באתר אחד לא משפיעה על אתרים באחרים</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. App Pool נדרש אך ורק עבור אתרים המשתמשים ב-HTTPS</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> ה-Application Pool הוא תהליך (<code>w3wp.exe</code>) שמבודד את האתר משאר האתרים בשרת. אם אתר ב-App Pool מסוים קורס, האתרים ב-App Pools אחרים ממשיכים לפעול כרגיל ללא השפעה.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>9. מדוע <code>Checkpoint</code> (Snapshot) במכונה וירטואלית ב-Hyper-V אינו תחליף לגיבוי אמיתי?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. Checkpoint אינו שומר כלל את מצב הדיסק של המכונה</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. Checkpoint יוצר קובץ דיסק שינויים (AVHDX) שגדל ללא שליטה אם משאירים אותו זמן רב, ופוגע בביצועים ובשטח האחסון</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. Checkpoint פועל אך ורק על מכונות מסוג Generation 1</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. יצירת Checkpoint מוחקת אוטומטית את המכונה הווירטואלית המקורית</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> Checkpoint פתוח לאורך זמן גורם למערכת לכתוב לקובץ דיסק שינויים (Differencing Disk בפורמט AVHDX) שגדל ללא שליטה, פוגע ב-IOPS ובביצועי הדיסק, ועלול לכלות את שטח האחסון ולרסק את השרת המארח. לכן יש למזג (Merge) Checkpoints מיד עם סיום הצורך בהם.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>10. מהו חוק ה-3-2-1 בגיבויים ארגוניים?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. 3 גיבויים מלאים, 2 גיבויים תוספתיים ו-1 גיבוי דיפרנציאלי בכל שבוע</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. 3 עותקים של המידע (המקור + 2 גיבויים), ב-2 סוגי מדיות שונות, כשעותק אחד (1) נמצא מחוץ לאתר הפיזי</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. גיבוי כל 3 שעות, שמירה על 2 שרתים במקביל, ומחיקה לאחר חודש (1)</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. נדרשים 3 מנהלים לאשר כל שחזור, ב-2 שלבי אימות, תוך יום (1) אחד</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> חוק 3-2-1 הוא חוק הזהב בגיבויים: 3 עותקים של המידע (המקור ועוד 2 גיבויים), על 2 סוגי מדיות שונות (למשל NAS מקומי וגם קלטות/דיסקים חיצוניים), כאשר עותק 1 מוחזק מחוץ לאתר הפיזי (Offsite) כך שאסון פיזי במשרד לא יפגע בכל הגיבויים יחד.</div>
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
