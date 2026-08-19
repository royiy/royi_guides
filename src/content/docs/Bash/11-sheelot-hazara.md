---
title: "שאלות חזרה ב-Bash"
category: Bash
part: 11/10
---

שאלות חזרה אינטראקטיביות על כל מה שלמדתם לאורך מדריכי ה-Bash Scripting (יסודות ותחביר, משתנים, תנאים, לולאות, פונקציות, מערכים, מחרוזות ו-Regex, קבצים ו-I/O, ניהול תהליכים, ודיבוג ו-Best Practices). בחרו תשובה בכל שאלה ותקבלו מיד משוב האם היא נכונה, יחד עם הסבר.

<div id="quiz-score" class="quiz-score">ענית נכון על 0 מתוך 10</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>1. מה ההבדל בין הרצת סקריפט עם <code>./script.sh</code> לבין <code>source script.sh</code>?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. אין שום הבדל, שתי הצורות זהות לחלוטין</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. <code>./script.sh</code> מריץ את הסקריפט בתת-תהליך (subshell) נפרד, כך ששינויי משתנים לא ישפיעו על ה-shell הנוכחי; <code>source script.sh</code> מריץ אותו באותו תהליך shell, כך ששינויים במשתנים או ב-cd נשארים בתוקף</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. <code>source</code> דורש חובה <code>chmod +x</code> ואילו <code>./script.sh</code> לא</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. <code>./script.sh</code> עובד רק עם shebang מסוג <code>#!/usr/bin/env bash</code></button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> הרצה עם <code>./script.sh</code> (או <code>bash script.sh</code>) פותחת תהליך-בן נפרד, כך שכל שינוי במשתנים או בתיקיית העבודה נעלם כשהסקריפט מסתיים. <code>source script.sh</code> (או <code>. script.sh</code>) מריץ את הפקודות באותו shell הנוכחי, ולכן שינויים כאלה נשארים בתוקף גם אחרי הסיום.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>2. למה חשוב לעטוף משתנים במרכאות כפולות, כמו <code>"$file"</code>, בסקריפטי Bash?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. זו רק מוסכמת סגנון קוד, ואין לה שום השפעה על ההתנהגות בפועל</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. כדי למנוע Word Splitting ו-Globbing לא רצויים - למשל <code>rm $file</code> עם <code>file="my file.txt"</code> ינסה למחוק שני קבצים בנפרד ("my" ו-"file.txt"), בעוד <code>rm "$file"</code> יטפל בזה כקובץ אחד</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. מרכאות כפולות הופכות אוטומטית את המשתנה למשתנה סביבה (export)</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. מרכאות נדרשות רק כאשר משתמשים ב-<code>declare -i</code></button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> ערך משתנה שאינו במרכאות עובר Word Splitting לפי IFS וגם Globbing, ולכן ערכים עם רווחים או תווים מיוחדים עלולים להתפצל למספר "מילים" בטעות. עטיפה במרכאות כפולות שומרת על הערך כיחידה אחת.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>3. מה ההבדל המרכזי בין <code>[ ]</code> ל-<code>[[ ]]</code> בבדיקות תנאים ב-Bash?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. <code>[ ]</code> הוא keyword מובנה של Bash, ואילו <code>[[ ]]</code> הוא פקודה חיצונית</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. <code>[[ ]]</code> הוא bash extension - בטוח יותר מול משתנים ריקים, תומך ב-pattern matching עם <code>==</code> וב-regex עם <code>=~</code>, וגם ב-<code>&amp;&amp;</code>/<code>||</code> ישירות בפנים; <code>[ ]</code> הוא POSIX test ישן יותר וזהיר יותר בדרישות quoting</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. <code>[ ]</code> תומך ב-regex מלא (PCRE), ואילו <code>[[ ]]</code> לא תומך ב-regex כלל</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. אין ביניהם שום הבדל בפועל בשום מקרה</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> <code>[[ ]]</code> הוא הרחבה מודרנית של Bash - הוא לא נופל כשמשתנה ריק (למשל <code>[[ $var == x ]]</code> תקין גם אם <code>var</code> ריק), תומך ב-wildcards עם <code>==</code> וב-regex עם <code>=~</code>, ומאפשר <code>&amp;&amp;</code>/<code>||</code> בתוך אותם סוגריים. <code>[ ]</code> הוא ה-POSIX test הישן, ודורש עטיפת משתנים במרכאות כדי לא להישבר.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>4. מה הבעיה בכתיבת <code>for line in $(cat file.txt)</code> לעומת <code>while IFS= read -r line; do ... done &lt; file.txt</code>?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. אין שום בעיה, שתי הצורות שקולות לחלוטין</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. הצורה עם <code>for</code> מבצעת word splitting לפי IFS, כך שכל מילה (לא שורה!) הופכת לאיטרציה נפרדת, ועוברת גם glob expansion; <code>while IFS= read -r line</code> קוראת כל שורה כראוי, גם עם רווחים</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. <code>for line in $(cat file.txt)</code> עובד רק על קבצים קטנים מ-1MB</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. <code>while read</code> תמיד איטית משמעותית יותר ולכן אינה מומלצת</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> <code>$(cat file.txt)</code> מוחזר כמחרוזת אחת שעוברת word splitting - כל "מילה" (מופרדת ברווח/טאב/newline) הופכת לאיטרציה נפרדת בלולאה, מה שהורס שורות עם רווחים. הדרך הנכונה לקרוא קובץ שורה-שורה היא <code>while IFS= read -r line; do ... done &lt; file.txt</code>.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>5. איך פונקציה ב-Bash "מחזירה" ערך טקסטואלי (ולא רק exit code)?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. עם <code>return "some text"</code></button>
    <button class="quiz-option" type="button" data-choice="ב">ב. <code>return</code> מוגבל לערכי exit code בין 0 ל-255 בלבד; כדי "להחזיר" טקסט או מספר גדול, משתמשים ב-<code>echo</code> בתוך הפונקציה ותופסים את הפלט עם command substitution, למשל <code>result=$(my_func)</code></button>
    <button class="quiz-option" type="button" data-choice="ג">ג. עם <code>exit "some text"</code></button>
    <button class="quiz-option" type="button" data-choice="ד">ד. משתני <code>local</code> בתוך הפונקציה מוחזרים אוטומטית החוצה</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> ל-Bash אין מנגנון return value אמיתי לטיפוסים כלליים כמו בשפות תכנות אחרות - <code>return</code> מוגבל למספרים 0-255 (בעצם exit code). כדי "להחזיר" טקסט או מספר, כותבים אותו עם <code>echo</code> ותופסים אותו בקריאה עם <code>$( )</code>.</div>
</div>

<div class="quiz-card" data-answer="א">
  <p class="quiz-question"><strong>6. מה נדרש כדי ליצור מערך אסוציאטיבי (dictionary) ב-Bash, ומה ההבדל בין <code>${arr[@]}</code> ל-<code>${arr[*]}</code>?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. משתמשים ב-<code>declare -A</code> מראש; כשמצוטטים, <code>"${arr[@]}"</code> מרחיב לכל איבר כמילה נפרדת, בעוד <code>"${arr[*]}"</code> מאחד את כל האיברים למחרוזת אחת מופרדת בתו הראשון של IFS</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. משתמשים ב-<code>declare -i</code>; אין כל הבדל בין <code>[@]</code> ל-<code>[*]</code></button>
    <button class="quiz-option" type="button" data-choice="ג">ג. מערכים אסוציאטיביים אינם נתמכים כלל ב-Bash</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. <code>declare -A</code> נדרש רק במערכים אינדקסיים רגילים, ולא באסוציאטיביים</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> מערך אסוציאטיבי דורש <code>declare -A name</code> מראש (נתמך מ-Bash 4 ואילך), ולאחר מכן <code>name[key]=value</code>. לגבי ההרחבה: <code>"${arr[@]}"</code> שומר כל איבר כרכיב נפרד ברשימה, בעוד <code>"${arr[*]}"</code> מאחד את כולם למחרוזת אחת - בדיוק כמו ההבדל בין <code>"$@"</code> ל-<code>"$*"</code>.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>7. מה ההבדל בין <code>${str/foo/bar}</code> ל-<code>${str//foo/bar}</code>?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. אין הבדל, שתי הצורות מחליפות את כל המופעים במחרוזת</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. <code>${str/foo/bar}</code> מחליף רק את המופע הראשון של <code>foo</code>, ואילו <code>${str//foo/bar}</code> (עם <code>//</code> כפול) מחליף את <strong>כל</strong> המופעים במחרוזת</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. <code>${str/foo/bar}</code> עובד רק על ערכים מספריים</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. <code>//</code> כפול משמש רק להסרת prefix, לא להחלפה</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> זו טבלת ה-parameter expansion להחלפה: הצורה עם קו נטוי בודד מחליפה רק את המופע הראשון של הדפוס, בעוד הצורה עם קו נטוי כפול (<code>//</code>) מחליפה את כל המופעים במחרוזת - בדיוק כמו ההבדל בין <code>#</code> ל-<code>##</code> (הקצר ביותר מול הארוך ביותר) בהסרת prefix/suffix.</div>
</div>

<div class="quiz-card" data-answer="א">
  <p class="quiz-question"><strong>8. מדוע <code>command &gt; file.txt 2&gt;&amp;1</code> מפנה גם את stderr לקובץ, בעוד <code>command 2&gt;&amp;1 &gt; file.txt</code> לא?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. הפניות מתבצעות משמאל לימין: ב-<code>&gt; file.txt 2&gt;&amp;1</code> קודם stdout מופנה לקובץ, ואז stderr "מצביע" לאותו מקום; ב-<code>2&gt;&amp;1 &gt; file.txt</code> קודם stderr מופנה למקום שאליו stdout מצביע כרגע (המסך), ורק אז stdout מופנה לקובץ - כך ש-stderr נשאר על המסך</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. שני הביטויים שקולים לחלוטין תמיד</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. <code>2&gt;&amp;1</code> חייב להופיע רק בתחילת שורת הפקודה</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. ההבדל קיים רק במערכות macOS ולא בלינוקס</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> Bash מעבד הפניות פלט לפי הסדר שהן מופיעות בשורה, משמאל לימין. הסדר הנכון להפניית שני הזרמים לאותו קובץ הוא תמיד קודם <code>&gt; file.txt</code> ואז <code>2&gt;&amp;1</code>, אחרת stderr יישאר מכוון למסך.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>9. מה ההבדל בין SIGTERM ל-SIGKILL, ומה תפקידו של <code>trap</code>?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. SIGTERM ו-SIGKILL זהים לגמרי; <code>trap</code> הוא כינוי (alias) לפקודת <code>kill</code></button>
    <button class="quiz-option" type="button" data-choice="ב">ב. SIGTERM (15) הוא בקשה "מנומסת" לסיום שהתהליך יכול לתפוס ולנקות משאבים לפניה; SIGKILL (9) הוא סיום כפוי שלא ניתן לתפוס, לחסום או להתעלם ממנו; <code>trap</code> מאפשר להריץ קוד כתגובה לאות מסוים (או ל-EXIT)</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. SIGKILL ניתן לתפיסה עם <code>trap</code>, ואילו SIGTERM לא ניתן לתפיסה</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. <code>trap</code> משמש אך ורק לניהול תהליכי רקע יחד עם <code>wait</code></button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> SIGTERM (15) הוא ברירת המחדל של <code>kill</code> - בקשה שהתהליך יכול לתפוס עם <code>trap</code> ולבצע ניקוי לפניה. SIGKILL (9) הורג את התהליך ברמת מערכת ההפעלה ולא ניתן לחסום או לתפוס בשום צורה. <code>trap</code> שימושי במיוחד עם <code>EXIT</code>, כדי להריץ קוד ניקוי תמיד בסיום הסקריפט.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>10. מה עושה <code>set -euo pipefail</code> בתחילת סקריפט Bash?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. מפעיל trace mode שמדפיס כל פקודה לפני הרצתה (כמו <code>set -x</code>)</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. <code>-e</code> עוצר את הסקריפט מיד עם כישלון פקודה, <code>-u</code> הופך שימוש במשתנה לא מוגדר לשגיאה, ו-<code>-o pipefail</code> גורם לכל pipe שלם להיכשל אם שלב כלשהו בו נכשל (לא רק הפקודה האחרונה) - יחד הם "strict mode" שמונע המשך ריצה שקטה עם באגים</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. מבצע בדיקת תחביר בלבד, בלי להריץ את הסקריפט בפועל (כמו <code>bash -n</code>)</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. מריץ אוטומטית <code>shellcheck</code> על הסקריפט לפני ההרצה</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> זהו ה-"strict mode" המומלץ לכל סקריפט production: <code>-e</code> עוצר בכל שגיאה, <code>-u</code> תופס שימוש במשתנים לא מוגדרים, ו-<code>-o pipefail</code> מוודא שכישלון בכל שלב בתוך pipe (לא רק בפקודה האחרונה) נחשב לכישלון של כל השרשרת. חשוב לזכור ש-<code>-e</code> יש לו מגבלות (למשל בתוך תנאי <code>if</code>).</div>
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
