---
title: "שאלות חזרה אינטראקטיביות על כל מדריכי Azure"
category: Azure
part: 11/10
---

שאלות חזרה אינטראקטיביות על כל מה שלמדתם לאורך מדריכי ה-Azure (מבוא ומודל השירותים, Resource Groups ו-Infrastructure as Code, Virtual Machines, Virtual Network, Storage Accounts, Microsoft Entra ID ו-RBAC, App Service ו-Functions, AKS, ו-Azure Monitor). בחרו תשובה בכל שאלה ותקבלו מיד משוב האם היא נכונה, יחד עם הסבר.

<div id="quiz-score" class="quiz-score">ענית נכון על 0 מתוך 10</div>

<div class="quiz-card" data-answer="ג">
  <p class="quiz-question"><strong>1. במודל <code>PaaS</code> (לדוגמה Azure App Service), מי אחראי על ניהול ה-Runtime של האפליקציה?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. הלקוח בלבד, בדיוק כמו ב-IaaS</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. אף אחד - Runtime לא קיים במודל PaaS</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. Azure מנהלת את ה-Runtime (וגם את ה-OS והוירטואליזציה), והלקוח מתמקד רק ב-Apps וב-Data</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. מיקרוסופט תומכת (Support) בלבד, אך הלקוח מתקין ומעדכן את ה-Runtime בעצמו</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> בטבלת מודל האחריות, ב-PaaS (כמו App Service, Azure SQL Database, Functions) Azure מנהלת את התשתית וה-Runtime, והלקוח מתמקד רק בקוד ובנתונים - לעומת IaaS שבו הלקוח מנהל גם OS ו-Runtime בעצמו.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>2. מהו ההבדל בין <code>Region</code> ל-<code>Availability Zone</code> ב-Azure?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. הם מונחים זהים לחלוטין</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. Region הוא אוסף מרכזי נתונים גאוגרפי רחב; Availability Zone הוא מרכז נתונים פיזי נפרד עם חשמל, קירור ורשת עצמאיים, בתוך אותו Region</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. Availability Zone הוא שם נרדף ל-Region Pair</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. Region נמצא תמיד בתוך Availability Zone אחת בלבד</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> Region (כמו West Europe או Israel Central) הוא אוסף מרכזי נתונים גאוגרפי, ובד"כ מכיל לפחות 3 Availability Zones - כל אחת מרכז נתונים פיזי נפרד עם חשמל/קירור/רשת עצמאיים, כך שפריסה על פני מספר Zones מגנה מפני כשל של מרכז נתונים שלם.</div>
</div>

<div class="quiz-card" data-answer="א">
  <p class="quiz-question"><strong>3. מה קורה בפועל כשמפרסים קובץ <code>.bicep</code> עם <code>az deployment group create</code>?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. הקובץ מתקמפל (Transpile) אוטומטית ל-ARM JSON בזמן הפריסה, ללא שרת ביניים או מנוע נפרד</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. Bicep רץ ישירות מול Azure ללא כל קשר לפורמט ARM</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. Bicep נשלח קודם ל-GitHub לצורך בדיקת Syntax, ורק אז ל-Azure</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. יש להמיר ידנית את הקובץ ל-JSON לפני כל פריסה</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> Bicep הוא "Syntactic Sugar" מעל ARM Templates - קובץ ה-<code>.bicep</code> מתקמפל אוטומטית ל-ARM JSON בזמן הפריסה, בלי שרת ביניים ובלי Overhead. אפשר גם להמיר ידנית לבדיקה עם <code>az bicep build</code>, אך זה לא נדרש לפריסה רגילה.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>4. מדוע <code>az vm stop</code> לבדו לא מספיק כדי להפסיק לגמרי את החיוב על VM?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. כי הוא מוחק את ה-VM לצמיתות</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. כי הוא רק מכבה את המכונה, אך ממשיך לחייב על משאבי החומרה המוקצים - יש להשתמש ב-<code>az vm deallocate</code> כדי לשחרר אותם</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. כי הוא מנתק את ה-VM מה-VNet לצמיתות</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. הוא כן מספיק, ואין הבדל בין שתי הפקודות</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> <code>az vm stop</code> מכבה את המכונה אך ממשיך לחייב אתכם על משאבי החומרה המוקצים. יש להשתמש ב-<code>az vm deallocate</code> כדי לשחרר את המשאבים ולהפסיק חיוב Compute מלא.</div>
</div>

<div class="quiz-card" data-answer="ג">
  <p class="quiz-question"><strong>5. למה הכוונה ב-"<code>Non-Transitive</code>" בהקשר של <code>VNet Peering</code>?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. שלא ניתן ליצור Peering בין VNets בשני Regions שונים</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. שכל Peering חייב לעבור דרך האינטרנט הציבורי</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. שאם VNet A מחובר ל-VNet B, ו-B מחובר ל-VNet C, זה לא אומר ש-A יכול לתקשר עם C ישירות</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. שאסור לחבר יותר משני VNets בסך הכל באותו Subscription</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> VNet Peering הוא Non-Transitive - אם A מחובר ל-B ו-B מחובר ל-C, זה לא אומר ש-A יכול לדבר עם C ישירות. כדי לפתור זאת בונים ארכיטקטורת Hub-and-Spoke עם NVA/Azure Firewall ו-Routing (UDR) מתאים.</div>
</div>

<div class="quiz-card" data-answer="ד">
  <p class="quiz-question"><strong>6. ב-<code>Storage Account</code> עם רמת Redundancy <code>GRS</code> (Geo Redundant Storage), האם ניתן לקרוא נתונים ישירות מה-Region המשני?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. כן, תמיד, ללא כל הגדרה נוספת</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. לא, אף פעם, גם לא לאחר Failover רשמי</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. רק אם משדרגים ל-ZRS</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. לא כברירת מחדל - צריך להפעיל <code>RA-GRS</code> (Read-Access GRS) כדי לקרוא דרך endpoint משני, עוד לפני Failover רשמי</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> ב-GRS הנתונים ב-Region המשני אינם נגישים לקריאה כברירת מחדל - רק אם מפעילים RA-GRS ניתן לקרוא אותם ישירות דרך endpoint משני (בעל הסיומת <code>-secondary</code>), עוד לפני שמתבצע Failover רשמי.</div>
</div>

<div class="quiz-card" data-answer="א">
  <p class="quiz-question"><strong>7. מתי עדיף להשתמש ב-<code>Managed Identity</code> ומתי ב-<code>Service Principal</code>?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. Managed Identity תמיד עדיף כשעובדים בתוך Azure (VM, App Service, AKS וכו') כי אין סודות לנהל; Service Principal נדרש כשהמקור אינו משאב Azure, כמו CI/CD חיצוני (GitHub Actions, Jenkins)</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. שתי השיטות שקולות לגמרי ואין הבדל מעשי</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. Service Principal מתאים רק למשתמשים אנושיים, ו-Managed Identity רק לאפליקציות</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. Managed Identity דורש תמיד ניהול Client Secret ידני, בעוד Service Principal לא</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> Managed Identity מנוהלת אוטומטית על ידי Azure ללא צורך באחסון סודות בכלל, ולכן עדיפה תמיד כשהעבודה מתבצעת בתוך Azure. Service Principal נדרש כשהמקור אינו משאב Azure - למשל צינור CI/CD חיצוני - ודורש ניהול Client Secret או Certificate.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>8. מה קורה ב-Azure App Service רגע לפני שמבצעים <code>Swap</code> בין Deployment Slot ל-Production?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. Azure מוחקת את ה-Slot הישן באופן מיידי</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. Azure "מחממת" (Warm-up) את ה-Slot החדש כדי לוודא שהאפליקציה עולה כראוי, כך שהמשתמשים לא רואים אפליקציה שנכשלה באתחול</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. כל ה-App Settings וה-Connection Strings נמחקים אוטומטית</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. ה-App Service Plan עובר שדרוג אוטומטי ל-Tier גבוה יותר</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> לפני ה-Swap, Azure מבצעת Warm-up ל-Slot החדש כדי לוודא שהאפליקציה עולה כראוי, כך שהמשתמשים לעולם לא רואים אפליקציה שנכשלה באתחול. זה מה שמאפשר פריסה ללא Downtime, עם אפשרות Rollback מהיר על ידי Swap חוזר.</div>
</div>

<div class="quiz-card" data-answer="ג">
  <p class="quiz-question"><strong>9. על מה בדיוק משלמים ב-<code>Azure Kubernetes Service (AKS)</code>?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. רק על ה-Control Plane (API Server, etcd, Scheduler)</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. על Control Plane ו-Node Pools בשווה</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. Azure מנהלת את ה-Control Plane בחינם, ומשלמים רק על ה-Worker Nodes (VMs) ב-Node Pools שמריצים את העומסים בפועל</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. אין תשלום כלל על AKS, רק על ACR</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> מיקרוסופט מנהלת את ה-Control Plane (API Server, etcd, Scheduler, Controller Manager) בחינם, ומשלמים רק על ה-Worker Nodes (VMs) שברשימת ה-Node Pools ומריצים את העומסים בפועל. חיבור ל-ACR עם <code>--attach-acr</code> מעניק הרשאת AcrPull אוטומטית ל-Managed Identity של הקלאסטר, ללא <code>imagePullSecrets</code> ידניים.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>10. מה תפקידה של <code>Diagnostic Setting</code> ב-Azure Monitor, ומה קורה אם לא מגדירים אותה?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. היא אופציונלית לחלוטין ואין לה השפעה על שמירת Logs</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. היא קובעת אילו Logs/Metrics ממשאב נשלחים ולאן (כמו Log Analytics); בלעדיה רוב ה-Logs פשוט לא נשמרים לטווח ארוך, ואין נתונים לחקירת תקרית בדיעבד</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. היא מחליפה לגמרי את הצורך ב-Application Insights</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. היא רלוונטית רק ל-Metric Alerts ולא ל-Log Alerts</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> כדי לשלוח Logs ממשאב Azure ל-Log Analytics יש להגדיר Diagnostic Setting - ללא הגדרה זו רוב ה-Logs (כמו AppServiceHTTPLogs) פשוט לא נשמרים, ולכן כשמתרחשת תקרית אין נתונים היסטוריים לחקירה (Root Cause Analysis). לכן מומלץ להגדיר Diagnostic Settings על כל משאב מהיום הראשון, לא בדיעבד.</div>
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
