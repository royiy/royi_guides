---
title: "שאלות חזרה"
category: Fortinet
part: 11/10
---

שאלות חזרה אינטראקטיביות על כל מה שלמדתם לאורך מדריכי ה-Fortinet/FortiGate (מבוא ל-Fortinet, התקנה והגדרה ראשונית, Security Policies, VPN, NAT ו-Routing, High Availability, FortiAnalyzer/FortiManager, UTM/IPS/Web Filtering/Antivirus, Troubleshooting ו-CLI, ושאלות ראיון). בחרו תשובה בכל שאלה ותקבלו מיד משוב האם היא נכונה, יחד עם הסבר.

<div id="quiz-score" class="quiz-score">ענית נכון על 0 מתוך 10</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>1. מהו ה-SPU (Security Processing Unit) ב-FortiGate?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. תוכנת ניהול מרכזית לכל מכשירי ה-Fortinet ברשת</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. שבב ייעודי של Fortinet שמאיץ בחומרה פעולות הצפנה/פענוח ובדיקת תוכן, מה שנותן ל-FortiGate ביצועים גבוהים גם כשמפעילים הרבה מנועי בדיקה בו-זמנית</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. פרוטוקול הסנכרון בין שני מכשירים בקלאסטר HA</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. שם נוסף ל-FortiOS, מערכת ההפעלה של FortiGate</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> ה-SPU הוא שבב חומרה ייעודי שמאיץ פעולות כבדות (הצפנה, בדיקת תוכן) ברמת החומרה, בניגוד לפתרונות תוכנה טהורים - זה מה שמאפשר ל-FortiGate כ-NGFW להריץ הרבה מנועי בדיקה (IPS, AV, Web Filter) יחד בלי לפגוע קשות בביצועים.</div>
</div>

<div class="quiz-card" data-answer="א">
  <p class="quiz-question"><strong>2. מהי כתובת ה-IP וממשק ברירת המחדל לגישה ראשונית ל-GUI של מכשיר FortiGate פיזי חדש?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. ממשק <code>port1</code> פועל כ-DHCP Server בכתובת <code>192.168.1.99</code>, ואפשר לגשת אליו דרך <code>https://192.168.1.99</code></button>
    <button class="quiz-option" type="button" data-choice="ב">ב. יש להגדיר כתובת IP ידנית לפני כל גישה, אין ברירת מחדל</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. הגישה הראשונית אפשרית רק דרך Console בפורט סיריאלי, ללא GUI</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. כתובת ברירת המחדל היא <code>10.0.0.1</code> על ממשק <code>port2</code></button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> ברירת המחדל של רוב מכשירי FortiGate היא ממשק <code>port1</code>/mgmt המוגדר כ-DHCP Server בכתובת <code>192.168.1.99</code>, כך שאפשר להתחבר ישירות בכבל, לקבל IP אוטומטית ולגשת ל-GUI עם שם המשתמש <code>admin</code> וסיסמה ריקה (שחייבים להחליף מיד).</div>
</div>

<div class="quiz-card" data-answer="ג">
  <p class="quiz-question"><strong>3. איך FortiGate בודק חבילת מידע מול טבלת ה-Security Policies?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. מלמטה למעלה, וכל הכללים המתאימים מיושמים במקביל</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. לפי סדר יצירת ה-Policy בזמן (הישן ביותר קודם)</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. מלמעלה למטה, וברגע שנמצאת התאמה ראשונה היא מיושמת ואין המשך בדיקה של השורות הבאות - לכן סדר השורות קריטי</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. אקראית, בהתאם לעומס הרגעי על המכשיר</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> Policy נבדק מלמעלה למטה, וברגע שנמצאת התאמה ראשונה - היא מיושמת ואין המשך בדיקה. לכן חוק האצבע הוא "ספציפי למעלה, כללי למטה": כלל רחב (<code>all</code>/<code>all</code>) בראש הרשימה "יבלע" תעבורה שהייתה אמורה להגיע לכללים הספציפיים מתחתיו.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>4. ב-IPsec VPN, מה ההבדל בין Phase 1 ל-Phase 2?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. Phase 1 מגדיר את ה-Policy, ו-Phase 2 מגדיר את ה-NAT</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. Phase 1 (IKE) מקים תעלה מאובטחת בין ה-Gateways עם אימות הדדי והסכמה על הצפנה, ו-Phase 2 (IPsec SA) מגדיר אילו רשתות/Subnets עוברות בתעלה ואת פרמטרי הצפנת התעבורה עצמה</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. Phase 1 רץ רק ב-SSL VPN, ו-Phase 2 רץ רק ב-Site-to-Site</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. אין הבדל מהותי, שני השלבים מבצעים בדיוק אותה פעולה כגיבוי אחד לשני</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> Phase 1 (IKE) מקים את ה"תעלה" המאובטחת הראשונית בין שני ה-Gateways, כולל אימות הדדי (PSK או תעודות) והסכמה על אלגוריתמי הצפנה. Phase 2 (IPsec SA) מגדיר מה בדיוק עובר בתעלה (ה-Subnets) ואת הפרמטרים להצפנת התעבורה בפועל. אם ה-Proposals לא תואמים בין הצדדים, התעלה כלל לא עולה.</div>
</div>

<div class="quiz-card" data-answer="ד">
  <p class="quiz-question"><strong>5. כדי לחשוף שרת פנימי (למשל שרת Web) לגישה מהאינטרנט ב-FortiGate, באיזה מנגנון NAT משתמשים?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. Source NAT (SNAT) רגיל בלבד</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. Central SNAT Table</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. IP Pool מסוג <code>overload</code></button>
    <button class="quiz-option" type="button" data-choice="ד">ד. Virtual IP (VIP) - Destination NAT (DNAT) שממפה כתובת/פורט חיצוניים לכתובת/פורט הפנימיים של השרת</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> כדי לחשוף שרת פנימי לאינטרנט משתמשים ב-Virtual IP (VIP), שהוא Destination NAT - מגדירים <code>extip</code>/<code>extport</code> חיצוניים ו-<code>mappedip</code>/<code>mappedport</code> פנימיים. ב-Policy עצמו, ה-<code>dstaddr</code> מפנה לאובייקט ה-VIP ולא ל-IP הפנימי ישירות.</div>
</div>

<div class="quiz-card" data-answer="א">
  <p class="quiz-question"><strong>6. מהו מצב "Split-Brain" בקלאסטר HA של FortiGate, וכיצד נמנעים ממנו?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. מצב שבו שני החברים בקלאסטר "חושבים" ששניהם Primary בו-זמנית (בד"כ בגלל אובדן Heartbeat) - נמנע ע"י שימוש בכמה נתיבי Heartbeat (רדונדנטיות) ובדיקות תקינות תדירות</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. מצב שבו שני המכשירים כבויים בו-זמנית - נמנע ע"י גיבוי חשמלי (UPS) בלבד</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. מצב שבו הקונפיגורציה בין שני המכשירים שונה - נמנע ע"י כיבוי אוטומטי של ה-Secondary</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. מצב תקין שבו שני המכשירים מעבדים תעבורה יחד ב-Active-Active</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> Split-Brain הוא מצב שבו שני חברי הקלאסטר מאבדים את ה-Heartbeat ביניהם וכל אחד "חושב" שהוא ה-Primary - מצב שעלול לגרום לבעיות רשת חמורות. נמנעים ממנו בעזרת מספר נתיבי סנכרון (Heartbeat) ובדיקות תקינות תדירות. חשוב לזכור גם ש-HA לא מגן מפני תקלה לוגית כמו Policy שגוי, כי הקונפיגורציה מסונכרנת בין שני החברים.</div>
</div>

<div class="quiz-card" data-answer="ג">
  <p class="quiz-question"><strong>7. מה ההבדל העיקרי בין FortiManager ל-FortiAnalyzer?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. שני המוצרים זהים לחלוטין ומשמשים כגיבוי זה לזה</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. FortiManager אוסף לוגים ומנתח אירועי אבטחה, ו-FortiAnalyzer דוחף קונפיגורציה למכשירים</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. FortiManager מנהל קונפיגורציה מרכזית (Policy Package, Provisioning), ואילו FortiAnalyzer אוסף לוגים, מייצר דוחות ומאפשר חקירת אירועים (FortiView)</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. FortiManager מיועד רק ל-SSL VPN, ו-FortiAnalyzer רק ל-IPsec VPN</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> תשובה קצרה שחוזרת גם כשאלת ראיון נפוצה: FortiManager = קונפיגורציה (Policy Package שנדחף למספר FortiGate-ים בבת אחת, מחולק ל-ADOM-ים), FortiAnalyzer = לוגים ואנליטיקה (דוחות, FortiView, Event Handlers להתראות).</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>8. למה נדרש SSL Inspection (Deep Inspection) ב-FortiGate, ומה המשמעות הפרקטית שלו?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. הוא נדרש רק לתעבורת FTP, ואין לו השפעה על תחנות הקצה</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. מכיוון שרוב התעבורה היום מוצפנת (HTTPS), FortiGate צריך "לפתוח" את ההצפנה, לבדוק את התוכן (IPS/AV/Web Filter) ולהצפין מחדש - וזה דורש התקנת תעודת ה-CA של FortiGate בתחנות הקצה, אחרת יופיעו אזהרות תעודה</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. הוא מבטל את הצורך ב-Web Filtering ו-Application Control</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. הוא פועל אוטומטית בלי שום קונפיגורציה או תעודה נדרשת</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> כדי שמנועי IPS/AV/Web Filter יוכלו לבדוק תעבורת HTTPS מוצפנת בכלל, נדרש SSL Inspection (Deep Inspection) - FortiGate "פותח" את ההצפנה, בודק את התוכן ומצפין מחדש עם תעודת ה-CA שלו (<code>Fortinet_CA_SSL</code>). אם התעודה לא מותקנת בתחנות הקצה, המשתמשים יקבלו אזהרות תעודה לא מהימנה בדפדפן.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>9. איזו פקודת CLI ב-FortiGate מאפשרת "ללכוד" תעבורה בזמן אמת בסגנון tcpdump, בלי כלים חיצוניים?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. <code>get system status</code></button>
    <button class="quiz-option" type="button" data-choice="ב">ב. <code>diagnose sniffer packet</code></button>
    <button class="quiz-option" type="button" data-choice="ג">ג. <code>execute backup config</code></button>
    <button class="quiz-option" type="button" data-choice="ד">ד. <code>config firewall policy</code></button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> <code>diagnose sniffer packet</code> (למשל <code>diagnose sniffer packet any 'host 192.168.10.50 and port 443' 4</code>) מאפשר ללכוד תעבורה ישירות ב-CLI, כמו tcpdump, וזהו כמעט תמיד הצעד הראשון הנכון בפתרון תקלות - הוא מראה מה בפועל מגיע/יוצא מהמכשיר. כלי חזק נוסף לבעיות Policy/NAT מורכבות הוא <code>diagnose debug flow</code>.</div>
</div>

<div class="quiz-card" data-answer="ד">
  <p class="quiz-question"><strong>10. איזו רמת הסמכת NSE (Network Security Expert) של Fortinet נחשבת המבוקשת ביותר לתפקידי Network/Security Engineer?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. NSE 1</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. NSE 8</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. NSE 7</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. NSE 4 (FortiGate Security + Infrastructure)</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> מסלול ה-NSE נע מ-1 עד 8: NSE 1-3 הן הסמכות מודעות בסיסיות וחינמיות, NSE 4 (FortiGate Security + Infrastructure) היא ההסמכה המבוקשת ביותר לתפקידי Network/Security Engineer וכוללת בחינה אמיתית, NSE 5-7 הן התמחויות מתקדמות, ו-NSE 8 היא הרמה הגבוהה ביותר למומחים בכירים.</div>
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
