---
title: "שאלות חזרה מקיפות על כל סדרת ה-GCP"
category: GCP
part: 11/10
---

שאלות חזרה אינטראקטיביות על כל מה שלמדתם לאורך מדריכי ה-GCP (מבוא ו-gcloud CLI, Projects/IAM, Compute Engine, VPC Networking, Cloud Storage, GKE, Serverless, מסדי נתונים מנוהלים, ו-Cloud Monitoring/Logging). בחרו תשובה בכל שאלה ותקבלו מיד משוב האם היא נכונה, יחד עם הסבר.

<div id="quiz-score" class="quiz-score">ענית נכון על 0 מתוך 10</div>

<div class="quiz-card" data-answer="ג">
  <p class="quiz-question"><strong>1. כל Region ב-GCP מכיל לפחות כמה Zones?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. Zone אחד בלבד</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. 2 Zones</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. 3 Zones לפחות</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. 5 Zones לפחות</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> כל Region (למשל <code>europe-west3</code>) מכיל לפחות 3 Zones (מרכזי נתונים נפרדים). כלל האצבע לתכנון High Availability הוא לפרוס משאבים על פני כמה Zones באותו Region, ולשקול Multi-Region עבור Disaster Recovery.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>2. מהו הסדר הנכון של היררכיית המשאבים (Resource Hierarchy) ב-GCP, מהרמה הגבוהה ביותר ומטה?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. Project &lt;- Folder &lt;- Organization &lt;- Resource</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. Organization -&gt; Folder -&gt; Project -&gt; Resource</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. Resource -&gt; Project -&gt; Organization -&gt; Folder</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. Folder -&gt; Organization -&gt; Resource -&gt; Project</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> ההיררכיה היא Organization -&gt; Folder -&gt; Project -&gt; Resource, בדומה לעץ תיקיות. מדיניות IAM שמוגדרת ברמה גבוהה (למשל Organization) יורשת אוטומטית לכל הרמות מתחתיה, וניתן רק להוסיף הרשאות ברמה נמוכה יותר - לא לצמצם הרשאה שניתנה למעלה.</div>
</div>

<div class="quiz-card" data-answer="א">
  <p class="quiz-question"><strong>3. מהו המאפיין המרכזי של Preemptible/Spot VMs ב-Compute Engine?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. הנחה משמעותית (עד 91%) לעומת מחיר On-Demand, אך גוגל יכולה לכבות אותן בכל רגע בהתראה קצרה - מתאים ל-Batch Jobs</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. ביצועים גבוהים יותר משאר סוגי ה-VM באותו מחיר בדיוק</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. VM שרץ אך ורק על Machine Type ממשפחת M2/M3</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. מכונה שאי אפשר לחבר אליה דיסק Persistent</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> Spot/Preemptible VMs זולות משמעותית (עד 91% הנחה) אבל גוגל רשאית לכבות אותן בכל רגע בהתראה קצרה, ולכן הן מתאימות רק לעומסים שניתן להפריע להם, כמו Batch Processing או CI/CD Runners - ולא לשירותים קריטיים שדורשים זמינות רציפה.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>4. מה ההבדל המהותי בין VPC ב-GCP ל-VPC ב-AWS?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. אין הבדל, שני השירותים זהים לחלוטין</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. ב-GCP רשת VPC היא Global ויכולה לפרוש Subnets במספר Regions תחת אותה רשת לוגית בלי VPC Peering ביניהם, ואילו ב-AWS VPC הוא משאב Regional</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. ב-AWS VPC הוא Global וב-GCP הוא Regional</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. VPC ב-GCP לא תומך כלל ב-Firewall Rules</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> ב-GCP רשת VPC היא Global - אפשר לפרוש Subnets (שכל אחד מהם הוא משאב Regional) במספר Regions שונים תחת אותה VPC לוגית אחת, בלי VPC Peering בין Regions. ב-AWS לעומת זאת VPC הוא משאב Regional במהותו.</div>
</div>

<div class="quiz-card" data-answer="ד">
  <p class="quiz-question"><strong>5. מה המשמעות המעשית של כך ש-Firewall Rules ב-GCP הן Stateful?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. כל חוק Firewall חייב להיות מוגדר ברמת ה-Subnet ולא ברמת ה-VPC</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. אי אפשר להגדיר חוקי Deny כלל, רק Allow</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. חוקי Firewall נשמרים רק זמנית ונמחקים אוטומטית אחרי 24 שעות</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. אם חיבור נכנס אושר, התעבורה החוזרת (Response) מותרת אוטומטית, בלי צורך בכלל Egress נפרד עבורה</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> Firewall Rules ב-GCP הן Stateful - ברגע שחיבור נכנס (Ingress) אושר, גוגל עוקבת אחרי מצב החיבור והתעבורה החוזרת ממנו מותרת אוטומטית, בלי שצריך ליצור עבורה חוק Egress תואם בנפרד.</div>
</div>

<div class="quiz-card" data-answer="ג">
  <p class="quiz-question"><strong>6. איזו Storage Class ב-Cloud Storage מתאימה ביותר לנתונים שנגישים בממוצע פחות מפעם ברבעון?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. Standard</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. Nearline</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. Coldline</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. Regional</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> Coldline מיועדת לגישה נדירה - פחות מפעם ברבעון, עם Minimum Storage Duration של 90 יום. Nearline מתאימה לגישה פחות מפעם בחודש (30 יום מינימום), ו-Archive לגישה של פעם בשנה או פחות (365 יום מינימום). Regional הוא סוג Location ולא Storage Class.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>7. מה ההבדל המרכזי במודל התמחור בין GKE Standard ל-GKE Autopilot?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. שני המצבים מחייבים בדיוק אותו סכום, ללא הבדל</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. ב-Standard משלמים לפי ה-VM (Node) שרץ, ואילו ב-Autopilot משלמים לפי משאבי CPU/Memory/Storage שהוקצו בפועל ברמת ה-Pod</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. Autopilot מחויב אך ורק לפי מספר ה-Clusters, ללא קשר לעומס</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. Standard הוא Serverless לחלוטין וללא Nodes, בעוד Autopilot דורש ניהול Node Pools ידני</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> ב-GKE Standard אתם מנהלים את ה-Node Pools ומשלמים לפי ה-VM שרץ, גם אם לא מנוצל במלואו. ב-Autopilot גוגל מנהלת את שכבת ה-Nodes לחלוטין, והתמחור הוא לפי משאבי Pod בפועל (CPU/Memory/Storage), עם Best Practices לאבטחה שנאכפים אוטומטית.</div>
</div>

<div class="quiz-card" data-answer="א">
  <p class="quiz-question"><strong>8. מה ההבדל בין Cloud Run ל-Cloud Functions Gen1 מבחינת Concurrency?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. Cloud Run תומך בעד 1000 בקשות במקביל באותו Container Instance, בעוד Cloud Functions Gen1 מטפל בבקשה אחת בלבד בכל פעם למופע</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. שני השירותים מוגבלים לבקשה אחת בכל פעם למופע, ללא יוצא מן הכלל</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. Cloud Functions תומך ביותר בקשות במקביל מ-Cloud Run</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. Concurrency רלוונטי רק ל-Compute Engine ולא לשירותי Serverless</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> Cloud Run יכול לטפל בעד 1000 בקשות במקביל באותו Container Instance (בהנחה שהאפליקציה Thread-Safe), מה שהופך אותו ליעיל יותר לעומסים גבוהים. Cloud Functions Gen1 מטפל בבקשה אחת בלבד בכל פעם למופע - וכל בקשה נוספת גורמת ליצירת מופע חדש.</div>
</div>

<div class="quiz-card" data-answer="ג">
  <p class="quiz-question"><strong>9. באיזה מצב תבחרו ב-BigQuery על פני Cloud SQL?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. כשצריך לעבד עסקאות בזמן אמת כמו הזמנות ומלאי (OLTP)</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. כשצריך עדכונים תכופים ברמת שורה בודדת</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. כשצריך לנתח היקפי נתונים ענקיים לצורך Analytics ו-BI (OLAP), עם שאילתות Aggregation על מיליארדי שורות</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. BigQuery ו-Cloud SQL מתאימים תמיד לאותם תרחישים בדיוק</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> BigQuery הוא Data Warehouse בגישת OLAP, המיועד לניתוח היקפי נתונים ענקיים (Analytics, BI) עם ביצועים מעולים בשאילתות Aggregation על מיליארדי שורות, אך פחות מתאים לעדכונים תכופים ברמת שורה בודדת. Cloud SQL (OLTP) מיועד לעסקאות בזמן אמת כמו הזמנות ומלאי.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>10. לכמה זמן נשמרים לוגים ב-Cloud Logging כברירת מחדל, ולמה נדרש Log Sink?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. לצמיתות, ולכן Log Sink מיותר לחלוטין</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. 30 יום בלבד; Log Sink מנתב לוגים ליעד חיצוני (BigQuery/Cloud Storage/Pub/Sub) לצורך ארכיון ארוך טווח או ניתוח מעמיק</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. שנה שלמה, ו-Log Sink משמש רק למחיקת לוגים ישנים</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. שעה אחת בלבד, ולכן חובה לצפות בלוגים בזמן אמת בלבד</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> לוגים ב-Cloud Logging נשמרים כברירת מחדל רק 30 יום. Log Sink הוא חוק ניתוב שמעביר לוגים תואמי-פילטר ליעד חיצוני כמו BigQuery, Cloud Storage או Pub/Sub - נדרש כדי לאפשר ארכיון ארוך טווח או ניתוח מעמיק מעבר לחלון 30 הימים.</div>
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
