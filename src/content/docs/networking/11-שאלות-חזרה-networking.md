---
title: "שאלות חזרה מקיפות על מדריכי ה-Networking"
category: Networking
part: 11/10
---

שאלות חזרה אינטראקטיביות על כל מה שלמדתם לאורך סדרת מדריכי ה-Networking (OSI/TCP-IP, כתובות IP ו-Subnetting, Routing, DNS, DHCP, Switching ו-VLANs, Firewalls ו-NAT, Load Balancing, ו-VPN/הצפנה). בחרו תשובה בכל שאלה ותקבלו מיד משוב האם היא נכונה, יחד עם הסבר.

<div id="quiz-score" class="quiz-score">ענית נכון על 0 מתוך 10</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>1. לפי מודל TCP/IP (4 השכבות), אילו שכבות OSI מאוחדות תחת שכבת ה-Application?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. Application בלבד</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. Application, Presentation ו-Session</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. Application ו-Transport</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. כל 7 שכבות ה-OSI</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> מודל TCP/IP המעשי מאגד את שכבות ה-Application, Presentation ו-Session של מודל OSI לשכבת Application אחת, לצד שכבות Transport, Internet ו-Network Access. זו הסיבה שהמודל המעשי מכיל רק 4 שכבות לעומת 7 ב-OSI.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>2. מהי כתובת ה-Broadcast של תת-הרשת <code>192.168.10.64/26</code>?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. <code>192.168.10.126</code></button>
    <button class="quiz-option" type="button" data-choice="ב">ב. <code>192.168.10.127</code></button>
    <button class="quiz-option" type="button" data-choice="ג">ג. <code>192.168.10.63</code></button>
    <button class="quiz-option" type="button" data-choice="ד">ד. <code>192.168.10.255</code></button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> ברשת /26 יש 64 כתובות בכל תת-רשת. עבור <code>192.168.10.64/26</code> טווח ה-Hosts הוא <code>.65</code> עד <code>.126</code>, וכתובת ה-Broadcast (הכתובת האחרונה בטווח) היא <code>192.168.10.127</code>.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>3. ל-Router יש שתי רשומות בטבלת הניתוב: <code>10.0.0.0/8</code> ו-<code>10.5.0.0/16</code>. חבילה מיועדת ל-<code>10.5.5.5</code> - לפי איזו רשומה היא תנותב?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. <code>10.0.0.0/8</code>, כי היא הכללית יותר ותמיד מנצחת</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. <code>10.5.0.0/16</code>, לפי עקרון ה-Longest Prefix Match</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. לשתי הרשומות במקביל (Load Balancing אוטומטי)</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. החבילה תיזרק כי קיימת יותר מהתאמה אחת</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> Router תמיד בוחר את ההתאמה הספציפית ביותר (Prefix הארוך ביותר) בטבלת הניתוב - עקרון ה-Longest Prefix Match. במקרה הזה <code>/16</code> ספציפי יותר מ-<code>/8</code>, ולכן הוא ינצח גם אם קיים גם Default Route כללי יותר.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>4. מהו תפקידו של ה-TTL (Time To Live) ברשומת DNS?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. הזמן המרבי שחבילת IP יכולה להתקיים ברשת לפני שהיא נזרקת ב-Router</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. משך הזמן (בשניות) שבו רשומת ה-DNS נשמרת ב-Cache לפני שנדרש חיפוש מחדש מול השרת</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. משך הזמן שלוקח ל-Recursive Resolver לבצע Iterative Query מול שרת ה-Root</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. משך התוקף של תעודת ה-SSL הקשורה לדומיין</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> TTL ב-DNS קובע כמה זמן רשומה נשמרת ב-Cache אצל ה-Resolver או הלקוח לפני שהיא נדרשת מחדש מהשרת המקורי. לכן נהוג להוריד את ה-TTL מראש (למשל ל-300 שניות) לפני שינוי מתוכנן, כדי שהשינוי יתפשט מהר יותר.</div>
</div>

<div class="quiz-card" data-answer="א">
  <p class="quiz-question"><strong>5. מהו הסדר הנכון של 4 שלבי תהליך ה-DORA ב-DHCP?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. Discover, Offer, Request, Ack</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. Discover, Request, Offer, Ack</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. Offer, Discover, Ack, Request</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. Request, Discover, Offer, Ack</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> DORA הוא ראשי התיבות של תהליך קבלת ה-IP: הלקוח משדר <strong>D</strong>iscover (Broadcast), השרת עונה עם <strong>O</strong>ffer, הלקוח שולח <strong>R</strong>equest רשמי (גם הוא Broadcast, כדי שכל השרתים ידעו איזו הצעה נבחרה), והשרת הנבחר מאשר עם <strong>A</strong>ck.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>6. מה תפקידו של Trunk Port עם תיוג 802.1Q?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. לחבר מכשיר קצה בודד (מחשב/מדפסת) לרשת ב-VLAN יחיד</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. להעביר תעבורה של מספר VLANs דרך קישור פיזי יחיד בין Switch-ים (או ל-Router), כשכל Frame מתויג במזהה ה-VLAN שלו</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. לחסום לחלוטין תעבורת Broadcast ברשת</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. להמיר כתובות MAC לכתובות IP</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> Access Port משויך ל-VLAN יחיד וללא תיוג, ומשמש לחיבור מכשירי קצה. Trunk Port, לעומת זאת, נושא תעבורה של מספר VLANs בו-זמנית על אותו קישור פיזי, כאשר כל Frame מקבל תג 802.1Q (4 בתים, כולל VLAN ID בן 12 סיביות) שמזהה לאיזה VLAN הוא שייך.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>7. מה ההבדל המרכזי בין Firewall מסוג Stateless לבין Stateful?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. Stateless עוקב אחרי מצב החיבור המלא (Connection Table), ו-Stateful בודק כל חבילה בנפרד</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. Stateful עוקב אחרי מצב החיבור (Connection Table) ומזהה אוטומטית תעבורה שהיא חלק מחיבור לגיטימי שכבר אושר, בעוד Stateless בודק כל חבילה בנפרד ללא זיכרון הקשר</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. אין הבדל מעשי בין השניים</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. Stateless עובד רק ב-Layer 7, ו-Stateful רק ב-Layer 3</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> Firewall מסוג Stateful שומר Connection Table שמתעד חיבורים שכבר אושרו, ולכן מזהה אוטומטית שתגובה נכנסת (כמו SYN-ACK) שייכת לחיבור יוצא לגיטימי. Stateless בודק כל חבילה בנפרד ללא זיכרון, ולכן דורש כללים מפורשים בשני הכיוונים.</div>
</div>

<div class="quiz-card" data-answer="ג">
  <p class="quiz-question"><strong>8. מהו PAT (Port Address Translation), השיטה הנפוצה ביותר ברשתות ביתיות/עסקיות קטנות?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. מיפוי קבוע 1-ל-1 בין כתובת IP פרטית לכתובת IP ציבורית</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. הקצאת כתובת ציבורית ממאגר (Pool) לפי דרישה, כתובת שונה לכל מכשיר</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. שיתוף כתובת IP ציבורית אחת בין מספר מכשירים פנימיים, תוך הבחנה ביניהם לפי מספרי פורט</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. חסימה מוחלטת של כל תעבורה יוצאת מהרשת הפנימית לאינטרנט</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> PAT (הידוע גם כ-NAT Overload) מאפשר למספר מכשירים פנימיים לשתף כתובת IP ציבורית יחידה - ה-Router מבחין ביניהם לפי מספר הפורט הייחודי שהוקצה לכל חיבור בטבלת ה-NAT. זו ברירת המחדל בפועל כמעט בכל רשת ביתית ועסקית קטנה, בגלל מחסור בכתובות IPv4 ציבוריות.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>9. מה ההבדל בין Load Balancer מסוג L4 ל-L7?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. L4 מקבל החלטת ניתוב לפי תוכן ה-URL וה-Headers; L7 לפי IP/Port בלבד</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. L4 מקבל החלטת ניתוב לפי IP/Port בלבד (מהיר יותר); L7 מבין את תוכן הבקשה (URL, Headers, Cookies) ויכול לבצע ניתוב חכם וגם SSL Termination</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. L4 ו-L7 זהים לחלוטין מבחינת היכולות שלהם</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. L7 עובד רק עם UDP, ו-L4 עובד רק עם TCP</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> L4 Load Balancer (כמו AWS NLB) פועל בשכבת Transport ומחליט לפי IP/Port בלבד, ולכן מהיר מאוד אך "עיוור" לתוכן. L7 Load Balancer (כמו AWS ALB או NGINX) פועל בשכבת Application, מבין URL/Headers/Cookies, ומאפשר ניתוב מבוסס-נתיב (Path-based routing) וגם SSL Termination.</div>
</div>

<div class="quiz-card" data-answer="א">
  <p class="quiz-question"><strong>10. מה ההבדל בין Transport Mode ל-Tunnel Mode ב-IPSec?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. Transport Mode מצפין רק את ה-Payload ושומר את ה-IP Header המקורי (שימוש בין Host ל-Host); Tunnel Mode מצפין את כל החבילה המקורית ועוטף אותה ב-IP Header חדש (השימוש הסטנדרטי ב-Site-to-Site VPN)</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. שני המצבים זהים לחלוטין, ההבדל הוא רק בשם</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. Transport Mode משמש אך ורק ל-Client VPN, ו-Tunnel Mode אך ורק לחיבורי TLS</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. Tunnel Mode כלל לא מצפין נתונים, רק Transport Mode מצפין</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> Transport Mode מצפין רק את תוכן החבילה (Payload) ומשאיר את ה-IP Header המקורי גלוי - מתאים לתקשורת ישירה בין שני Hosts. Tunnel Mode עוטף את כל החבילה המקורית (כולל ה-Header) בתוך IP Header חדש - זהו המצב הסטנדרטי המשמש ב-Site-to-Site VPN בין שני Gateways.</div>
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
