---
title: "שאלות חזרה"
category: DevOps/Ansible
part: 11/10
---

שאלות חזרה אינטראקטיביות על כל מה שלמדתם לאורך מדריכי ה-Ansible (מבוא וארכיטקטורה, Inventory, Playbooks, Variables ו-Facts, Modules, Templates ו-Handlers, Roles, Vault ואבטחה, CI/CD ו-AWX, ושאלות ראיון עבודה). בחרו תשובה בכל שאלה ותקבלו מיד משוב האם היא נכונה, יחד עם הסבר.

<div id="quiz-score" class="quiz-score">ענית נכון על 0 מתוך 10</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>1. מהי הסיבה המרכזית לכך ש-Ansible מכונה כלי <code>Agentless</code>?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. הוא פועל רק על שרתי לינוקס ולא תומך ב-Windows בכלל</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. אין צורך להתקין תוכנת סוכן (Agent) על השרתים המנוהלים - Ansible מתחבר דרך <code>SSH</code>/<code>WinRM</code>, מעביר מודולים, מריץ אותם ומוחק אותם בסיום</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. הוא רץ אך ורק בתוך קונטיינרים של Docker</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. הוא דורש התקנת סוכן רק על ה-Control Node ולא על השרתים המנוהלים</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> בניגוד לכלים כמו Puppet ו-Chef שדורשים סוכן מותקן על כל שרת מנוהל, Ansible מתחבר ישירות דרך <code>SSH</code> (לינוקס) או <code>WinRM</code> (Windows), מעתיק מודול פייתון, מריץ אותו ומנקה אחריו - בלי תהליך קבוע שרץ ברקע על השרת המנוהל.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>2. מהו סדר העדיפויות הנכון (מהחלש לחזק) בין מקורות המשתנים הבאים ב-Inventory?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. <code>host_vars/&lt;host&gt;</code> → <code>group_vars/&lt;group&gt;</code> → <code>group_vars/all</code></button>
    <button class="quiz-option" type="button" data-choice="ב">ב. <code>group_vars/all</code> → <code>group_vars/&lt;group&gt;</code> → <code>host_vars/&lt;host&gt;</code></button>
    <button class="quiz-option" type="button" data-choice="ג">ג. שלושתם שווים בעדיפות תמיד, וה-Ansible בוחר לפי סדר אלפביתי</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. <code>group_vars/&lt;group&gt;</code> תמיד גובר על <code>host_vars</code></button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> הסדר הוא מהכללי לספציפי: קודם <code>group_vars/all</code> (חל על כולם), אחריו <code>group_vars/&lt;group&gt;</code> (ספציפי לקבוצה), ולבסוף <code>host_vars/&lt;host&gt;</code> - שהוא הכי ספציפי ולכן מנצח את שניהם.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>3. מתי Handler ב-Ansible בפועל ירוץ בסוף ה-Play?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. תמיד, בכל הרצת Play, גם אם אף Task לא השתנה</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. רק אם Task כלשהו קרא לו באמצעות <code>notify</code>, וגם ביצע שינוי בפועל (סטטוס <code>changed</code>)</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. רק אם הוגדר לו <code>tags</code> תואם לזה שהוזן בשורת הפקודה</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. Handlers תמיד רצים לפני כל שאר ה-Tasks ב-Play</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> Handler הוא Task מיוחד שרץ רק פעם אחת, בסוף ה-Play, ורק בתנאי שמישהו קרא לו עם <code>notify</code> וגם ביצע שינוי אמיתי. אם כמה Tasks שונים קוראים לאותו Handler באותו Play, הוא עדיין ירוץ פעם אחת בלבד.</div>
</div>

<div class="quiz-card" data-answer="ג">
  <p class="quiz-question"><strong>4. מה נכון לגבי Extra Vars (הדגל <code>-e</code> בשורת הפקודה) בסדר העדיפויות של משתנים ב-Ansible?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. יש להם את העדיפות הנמוכה ביותר מכל מקורות המשתנים</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. הם שווים בעדיפות בדיוק ל-<code>group_vars/all</code></button>
    <button class="quiz-option" type="button" data-choice="ג">ג. יש להם את העדיפות הגבוהה ביותר מכל מקורות המשתנים - הם תמיד "מנצחים"</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. הם רלוונטיים רק בתוך <code>vars_prompt</code></button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> בשרשרת סדר העדיפויות של משתנים ב-Ansible, <code>-e</code> (Extra Vars) בשורת הפקודה נמצא תמיד בראש - הוא מנצח role defaults, group_vars, host_vars, facts, vars בתוך ה-Playbook, ואפילו <code>register</code>/<code>set_fact</code>. זו הסיבה שהוא המקום הטבעי לדרוס משתנה בזמן פריסה ספציפית.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>5. מה ההבדל המרכזי בין מודול <code>command</code> למודול <code>shell</code> ב-Ansible?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. אין הבדל מעשי בין השניים</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. <code>command</code> לא עובר דרך shell של המערכת ולכן לא תומך ב-pipes/redirects/משתני סביבה, בעוד <code>shell</code> כן עובר דרך <code>/bin/sh</code> ותומך בכל תחביר shell רגיל</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. <code>shell</code> פועל רק על שרתי Windows ו-<code>command</code> רק על לינוקס</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. <code>command</code> הוא Idempotent מטבעו, ואילו <code>shell</code> תמיד ידווח על שינוי</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> <code>command</code> נחשב הבטוח מבין השניים כי הוא לא עובר דרך shell של המערכת - אין תמיכה ב-pipes (<code>|</code>), redirects (<code>&gt;</code>) או הרחבת משתני סביבה. <code>shell</code> עובר דרך <code>/bin/sh</code> ותומך בכל התחביר, אבל שניהם פחות idempotent ממודול ייעודי, ולכן מומלץ להעדיף מודול ספציפי כשקיים.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>6. מהי הסיומת המקובלת לקבצי Template ב-Ansible, ואיזה מודול מעבד אותם?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. <code>.yml</code>, מעובד על ידי מודול <code>copy</code></button>
    <button class="quiz-option" type="button" data-choice="ב">ב. <code>.j2</code>, מעובד באמצעות מנוע Jinja2 על ידי מודול <code>template</code></button>
    <button class="quiz-option" type="button" data-choice="ג">ג. <code>.tpl</code>, מעובד על ידי מודול <code>file</code></button>
    <button class="quiz-option" type="button" data-choice="ד">ד. <code>.conf</code>, מעובד על ידי מודול <code>lineinfile</code></button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> קבצי Template נשמרים בסיומת <code>.j2</code> ומכילים תחביר Jinja2 (משתנים כמו <code>{{ http_port }}</code>, תנאים <code>{% if %}</code> ולולאות <code>{% for %}</code>). מודול <code>ansible.builtin.template</code> מעבד את הקובץ ומייצר ממנו קובץ סופי בשרת המנוהל, בניגוד ל-<code>copy</code> שמעתיק תוכן כמו שהוא בלי עיבוד.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>7. מה ההבדל בין <code>import_role</code> ל-<code>include_role</code>?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. אין הבדל מעשי, שני התחבירים זהים לגמרי בהתנהגותם</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. <code>import_role</code> הוא Static ומעובד בזמן ניתוח ה-Playbook (לא תומך ב-<code>loop</code>), ואילו <code>include_role</code> הוא Dynamic ומעובד בזמן ריצה (תומך ב-<code>loop</code>, ו-<code>when</code> נבדק לכל Task בנפרד)</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. <code>import_role</code> עובד רק עם Roles שהותקנו מ-Ansible Galaxy</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. <code>include_role</code> לא תומך ב-<code>vars</code> בכלל</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> <code>import_role</code> הוא סטטי - Ansible "משטח" אותו בזמן ניתוח ה-Playbook, לפני ההרצה בפועל, ולכן הוא מהיר יותר אך לא תומך ב-<code>loop</code>, ותנאי <code>when</code> חל על כל ה-Tasks בבת אחת. <code>include_role</code> הוא דינמי - מעובד בזמן ריצה, גמיש יותר, ותומך ב-<code>loop</code> ו-<code>when</code> שמוערך בנפרד לכל Task.</div>
</div>

<div class="quiz-card" data-answer="א">
  <p class="quiz-question"><strong>8. מה ההבדל בין <code>ansible-vault encrypt</code> לבין <code>ansible-vault encrypt_string</code>?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. <code>encrypt</code> מצפין קובץ YAML שלם, ואילו <code>encrypt_string</code> מצפין ערך בודד שאפשר להדביק ישירות בתוך קובץ <code>vars</code> רגיל שאינו מוצפן כולו</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. <code>encrypt_string</code> יכול להצפין רק סיסמאות, ו-<code>encrypt</code> יכול להצפין רק מפתחות API</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. אין הבדל מעשי בין הפקודות, שתיהן מייצרות בדיוק את אותו פלט</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. <code>encrypt</code> עובד רק כנגד Managed Nodes של Windows</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> <code>ansible-vault encrypt</code> הופך קובץ שלם למוצפן (לא ניתן לקרוא ממנו כלום בלי לפענח). <code>ansible-vault encrypt_string</code> מצפין רק ערך בודד ומחזיר בלוק <code>!vault |</code> שניתן להדביק בתוך קובץ YAML רגיל (למשל <code>group_vars/production.yml</code>) - כך שאר הקובץ נשאר קריא, ורק המשתנה הרגיש מוצפן.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>9. מהי מטרת הפרמטר <code>serial</code> בהגדרת Play, ולמה הוא חשוב בפריסות Production?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. הוא קובע כמה פעמים להריץ את אותו Task ברצף על אותו שרת</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. הוא מגביל את מספר השרתים שמתעדכנים בו-זמנית בכל "גל", ומאפשר פריסת Rolling Deployment עם Zero Downtime</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. הוא מבטל את איסוף ה-Facts כדי לזרז את ההרצה</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. הוא מגדיר את הסדר שבו Roles מרובים ירוצו בתוך Play</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> <code>serial</code> (למשל <code>serial: 2</code>) גורם ל-Ansible לעדכן רק תת-קבוצה מוגדרת של שרתים בכל פעם, במקום את כולם בבת אחת. בשילוב עם הוצאה/החזרה מ-Load Balancer ו-Health Check אחרי כל עדכון, זהו הבסיס לאסטרטגיית Rolling Deployment ללא downtime.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>10. מה עושים <code>run_once: true</code> ו-<code>delegate_to</code> יחד ב-Task שרץ בתוך Playbook על 50 שרתים?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. הם גורמים למשימה לרוץ במקביל על כל 50 השרתים בבת אחת</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. <code>run_once</code> מוודא שהמשימה תרוץ פעם אחת בלבד (במקום על כל שרת בנפרד), ו-<code>delegate_to</code> מפנה את ההרצה בפועל לשרת ספציפי אחר, למשל שרת ה-DB הראשון ברשימה</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. הם מוחקים את קובץ ה-Inventory לאחר ההרצה</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. הם משמשים רק בתוך קבצים מוצפני Vault</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> תרחיש נפוץ הוא הרצת migration למסד נתונים פעם אחת בלבד גם כשה-Play מוגדר על עשרות שרתי אפליקציה: <code>run_once: true</code> מונע הרצה כפולה, ו-<code>delegate_to: "{{ groups['dbservers'][0] }}"</code> מפנה את ההרצה בפועל לשרת ה-DB המתאים במקום לשרת שממנו יזמה המשימה.</div>
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
