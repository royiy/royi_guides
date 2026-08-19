---
sidebar_position: 11
title: "VMware #11 — שאלות חזרה"
---

שאלות חזרה אינטראקטיביות על כל מה שלמדתם לאורך סדרת מדריכי ה-VMware (וירטואליזציה ו-ESXi, vCenter, Networking, Storage, vMotion/DRS, HA, ניהול VMs, Troubleshooting ו-PowerCLI/Performance). בחרו תשובה בכל שאלה ותקבלו מיד משוב האם היא נכונה, יחד עם הסבר.

<div id="quiz-score" class="quiz-score">ענית נכון על 0 מתוך 10</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>1. מה ההבדל בין Hypervisor מסוג Type 1 לסוג Type 2?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. אין הבדל מעשי, זהו רק הבדל בשיווק בין יצרנים</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. Type 1 רץ ישירות על החומרה (למשל VMware ESXi), ואילו Type 2 רץ מעל מערכת הפעלה קיימת (למשל VMware Workstation)</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. Type 1 מיועד רק למחשבים אישיים, ו-Type 2 רק לשרתים</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. Type 2 מהיר תמיד יותר כי הוא מדלג על מערכת ההפעלה</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> Type 1 (כמו ESXi או Hyper-V) יושב ישירות על החומרה: <code>Hardware → Hypervisor → VMs</code>. Type 2 (כמו VMware Workstation) יושב מעל מערכת הפעלה קיימת: <code>Hardware → Windows/Linux → Hypervisor → VMs</code>.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>2. מהו ה-DCUI (Direct Console User Interface) בהתקנת ESXi, ולמה משתמשים בו?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. ממשק ניהול מבוסס דפדפן שנפתח בכתובת <code>https://&lt;IP&gt;/ui</code></button>
    <button class="quiz-option" type="button" data-choice="ב">ב. המסך שמופיע בקונסולת ה-Host מיד לאחר האתחול, שדרכו ניתן להגדיר Management Network, VLAN, IPv4, DNS, Hostname ולבצע Restart Management Agents</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. כלי CLI מרוחק לניהול vCenter בלבד</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. תוסף ל-PowerCLI לניהול Snapshots</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> לאחר אתחול ה-Host מגיעים למסך ה-DCUI, ומשם אפשר להגדיר את פרטי ה-Management Network (VLAN, IPv4, DNS, Hostname) ואף להפעיל מחדש את Management Agents - עוד לפני שיש גישה ל-ESXi Host Client דרך הדפדפן.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>3. מהו העיקרון החשוב שמוזכר במדריך vCenter ביחס להגדרת Roles?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. יש להעניק לכל המשתמשים הרשאת Administrator כדי למנוע תקלות עתידיות</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. עיקרון ה-Least Privilege - להעניק לכל תפקיד רק את ההרשאות הנחוצות לו, למשל Helpdesk מקבל Read Only ו-VM-Operators מקבל VM Operator בלבד</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. אין צורך בהרשאות מדורגות ב-vCenter, מספיק משתמש משותף אחד</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. הרשאות ב-vCenter ניתנות רק ברמת Datacenter, ולא ניתן להגדיר אותן ברמת Cluster</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> המדריך מציג דוגמה של VMware-Admins עם Administrator, Helpdesk עם Read Only ו-VM-Operators עם VM Operator, ומדגיש שהעיקרון המנחה הוא Least Privilege - כל תפקיד מקבל רק את ההרשאה הנחוצה לו.</div>
</div>

<div class="quiz-card" data-answer="א">
  <p class="quiz-question"><strong>4. מהו ההבדל בין Standard vSwitch (vSS) ל-Distributed Switch (vDS)?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. vSS מוגדר ומנוהל בנפרד על כל Host, ואילו vDS מנוהל באופן מרכזי דרך vCenter עבור מספר Hosts יחד - שימושי כשיש הרבה Hosts ורוצים אחידות תצורה ו-Port Groups מרכזיים</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. vDS זמין רק בגרסה החינמית של ESXi, ו-vSS דורש רישוי vCenter</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. אין הבדל טכני בין השניים, ההבדל הוא רק בשם המוצג בממשק</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. vSS תומך ב-VLAN, ואילו vDS אינו תומך ב-VLAN כלל</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> vDS (Distributed Switch) מאפשר ניהול Networking מרכזי דרך vCenter עבור מספר Hosts בו-זמנית, בניגוד ל-vSwitch רגיל שמוגדר בנפרד על כל Host. vDS שימושי כשיש הרבה Hosts, רוצים אחידות תצורה, Port Groups מרכזיים ותכונות Networking מתקדמות.</div>
</div>

<div class="quiz-card" data-answer="א">
  <p class="quiz-question"><strong>5. מהו ההבדל המרכזי בין VMFS ל-NFS כ-Datastore, לפי מדריך ה-Storage?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. VMFS הוא File System של VMware עבור Datastores מבוססי Block (למשל דרך LUN בהתקן Storage), ואילו NFS הוא Datastore המחובר דרך פרוטוקול קבצים ברשת Ethernet אל NAS</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. VMFS עובד רק עם Local Storage, ואילו NFS עובד רק עם Shared Storage</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. NFS מהיר תמיד יותר מ-VMFS, בכל תרחיש אפשרי</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. VMFS ו-NFS הם שני שמות שונים לאותו פרוטוקול בדיוק</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> VMFS מבוסס על שרשרת <code>Storage Array → LUN → VMFS → Datastore</code>, כלומר Storage מבוסס Block. NFS לעומת זאת מבוסס על שרשרת <code>ESXi → Ethernet → NAS → NFS → Datastore</code>, כלומר גישה דרך פרוטוקול קבצים ברשת.</div>
</div>

<div class="quiz-card" data-answer="א">
  <p class="quiz-question"><strong>6. מהו ההבדל בין DRS Affinity Rule ל-Anti-Affinity Rule?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. Affinity Rule דואג ש-VMs יופעלו יחד על אותו Host (למשל APP01 ו-APP02), ואילו Anti-Affinity Rule מפריד VMs לענפים/Hosts שונים (למשל DC01 ו-DC02) כדי להקטין Single Point of Failure</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. שני הכללים עושים בדיוק את אותו הדבר, ההבדל הוא רק בשם</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. Anti-Affinity זמין רק עבור Templates, ולא עבור VMs פעילות</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. Affinity Rule משפיע רק על Storage, ואינו קשור ל-Compute כלל</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> Affinity שומר VMs יחד על אותו Host, ואילו Anti-Affinity מפריד VMs (למשל שני Domain Controllers) ל-Hosts שונים בדיוק כדי להקטין את הסיכון ש-Host בודד שנופל יפיל את שניהם יחד.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>7. לפי מדריך ה-HA, מהו תפקידו של Admission Control?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. לבדוק הרשאות משתמשים לפני חיבור ל-vCenter</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. לוודא שה-Cluster לא צורך את כל ה-Capacity שלו, כך שתישאר יכולת להתאושש (Restart של VMs) גם אחרי כשל Host, בהתאם למדיניות שנבחרה</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. להעביר VM פעילה בין Hosts בלי downtime</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. לבדוק תאימות CPU בין Hosts לפני ביצוע vMotion</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> Admission Control שומר Capacity רזרבי ב-Cluster כדי שבמקרה של כשל Host יהיה עדיין מקום להפעיל מחדש (Restart) את ה-VMs שהיו עליו - זה שונה מ-vMotion (מיגרציה חיה) ומ-EVC (תאימות CPU).</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>8. למה חשוב לזכור ש-"Snapshot אינו Backup"?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. כי Snapshot שומר רק את הגדרות ה-CPU של ה-VM, ולא את תוכן הדיסק</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. כי Snapshot יוצר Delta files שמתעדים שינויים מעל ה-Base VMDK, וכשהוא נשאר פתוח לאורך זמן הוא עלול לפגוע ב-Performance וב-Capacity - ואינו תחליף לפתרון גיבוי אמיתי</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. כי לא ניתן בכלל למחוק Snapshot לאחר שנוצר</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. כי Snapshot מתבצע רק ברמת vCenter כולו, ולא ברמת VM בודדת</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> Snapshot בונה שרשרת <code>Base VMDK → Snapshot → Delta → Guest Writes</code>. ככל שהוא נשאר פתוח יותר זמן כך ה-Delta גדל, מה שעלול לפגוע בביצועים ובנפח הפנוי - ולכן יש לבצע ניקוי Snapshots דרך vSphere ולא להסתמך עליו כפתרון גיבוי.</div>
</div>

<div class="quiz-card" data-answer="ג">
  <p class="quiz-question"><strong>9. VM מדווחת כ"איטית", ונמדדו הנתונים הבאים: CPU Usage = 22%, CPU Ready = High, Disk Latency = Normal, Memory Pressure = Normal. מהו הממצא הסביר על פי שיטת ה-Troubleshooting?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. יש להוסיף מיד עוד vCPU ל-VM, מכיוון שה-CPU Usage נמוך מדי</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. הבעיה היא ב-Storage, כי Disk Latency הוא תמיד הגורם הראשון שיש לחשוד בו</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. למרות ש-CPU Usage נמוך, ה-CPU Ready הגבוה מצביע על CPU contention - ה-VM ממתינה למשאב CPU שאינו זמין לה בפועל</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. אין מספיק נתונים כדי להסיק מסקנה כלשהי במקרה הזה</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> זהו בדיוק התרחיש מהמדריך: CPU Usage נמוך (22%) לא מוכיח שאין בעיית CPU. כש-CPU Ready גבוה, זה מסמן שה-VM מוכנה לרוץ אך ממתינה למשאב CPU - כלומר CPU contention, ולא בעיית Storage או Memory.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>10. מה עושה הפקודה <code>Connect-VIServer vcenter01.lab.local</code> ב-PowerCLI?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. יוצרת VM חדשה בשם <code>vcenter01</code></button>
    <button class="quiz-option" type="button" data-choice="ב">ב. מתחברת ל-vCenter Server בשם שצוין, כצעד ראשון והכרחי לפני הרצת פקודות ניהול נוספות כמו <code>Get-VMHost</code> או <code>Get-VM</code></button>
    <button class="quiz-option" type="button" data-choice="ג">ג. מתקינה ESXi על שרת מרוחק</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. מבצעת Snapshot לכל ה-VMs במערכת בבת אחת</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> <code>Connect-VIServer</code> הוא פקודת ההתחברות הבסיסית של PowerCLI ל-vCenter (או ל-Host בודד). רק לאחר חיבור מוצלח אפשר להריץ פקודות כמו <code>Get-VMHost</code>, <code>Get-VM</code>, <code>Get-Datastore</code> או <code>Start-VM</code>.</div>
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
