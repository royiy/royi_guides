---
title: "שאלות חזרה"
category: DevOps/Helm
part: 11/10
---

שאלות חזרה אינטראקטיביות על כל מה שלמדתם לאורך מדריכי ה-Helm (מבוא וארכיטקטורה, התקנה והגדרה, מבנה Chart, מנוע Templates ו-Values, Repositories, Hooks, Dependencies ו-Subcharts, ניהול Releases, וטיפים ו-Best Practices). בחרו תשובה בכל שאלה ותקבלו מיד משוב האם היא נכונה, יחד עם הסבר.

<div id="quiz-score" class="quiz-score">ענית נכון על 0 מתוך 10</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>1. מהו השינוי המרכזי בין Helm 2 ל-Helm 3?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. הוספת תמיכה ב-namespaces, שלא הייתה קיימת קודם</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. הסרת Tiller (רכיב שרת שרץ בתוך הקלאסטר עם הרשאות רחבות) - מעכשיו ה-CLI פועל ישירות מול Kubernetes API עם ההרשאות של המשתמש (RBAC רגיל)</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. מעבר מהגדרת Charts ב-YAML להגדרתם ב-JSON</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. חובה להירשם לחשבון בתשלום כדי להתקין Charts</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> Helm 2 השתמש ב-Tiller, רכיב שרת שרץ בתוך הקלאסטר וקיבל לעיתים הרשאות <code>cluster-admin</code> - בעיית אבטחה משמעותית. Helm 3 הסיר את Tiller לחלוטין, ומידע ה-releases נשמר כ-Secrets בתוך ה-namespace הרלוונטי (במקום ConfigMaps ב-<code>kube-system</code>), לצד שיפורים נוספים כמו איחוד <code>requirements.yaml</code> לתוך <code>Chart.yaml</code> ותמיכה ב-Library Charts.</div>
</div>

<div class="quiz-card" data-answer="א">
  <p class="quiz-question"><strong>2. איך מתקינים plugin ל-Helm, ולשם מה משמש ה-plugin הפופולרי <code>helm-diff</code>?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. עם <code>helm plugin install &lt;כתובת-repo&gt;</code>; <code>helm-diff</code> מציג בדיוק אילו שדות ישתנו לפני ביצוע <code>upgrade</code> בפועל</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. plugins מותקנים רק דרך <code>apt</code>/<code>brew</code> ברמת מערכת ההפעלה; <code>helm-diff</code> מבצע גיבוי אוטומטי של בסיס הנתונים לפני מחיקת release</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. אין עוד מנגנון plugins ב-Helm 3 - הוא הוסר יחד עם Tiller</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. <code>helm-diff</code> הוא כלי להצפנת secrets בקובץ <code>values.yaml</code> בלבד</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> Helm תומך במערכת plugins להרחבת פונקציונליות, המותקנת באמצעות <code>helm plugin install</code> עם כתובת ה-repository (למשל <code>https://github.com/databus23/helm-diff</code>). בלי <code>helm-diff</code> אתם "עיוורים" לגבי מה בדיוק ישתנה בקלאסטר בעת <code>upgrade</code> - ולכן מומלץ מאוד להריץ אותו לפני כל שדרוג בסביבת production.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>3. מה ההבדל בין השדות <code>version</code> ל-<code>appVersion</code> בקובץ <code>Chart.yaml</code>?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. אין הבדל מעשי, אלו שני שמות לאותו שדה</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. <code>version</code> היא גרסת ה-Chart עצמו (מתעדכנת בכל שינוי במבנה/templates, לפי SemVer), ואילו <code>appVersion</code> היא גרסת האפליקציה שה-Chart פורס (למשל גרסת nginx או PostgreSQL)</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. השדה <code>version</code> קיים רק ב-Library Charts</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. <code>appVersion</code> נקבע אוטומטית לפי תאריך ההתקנה ולא ניתן לקבוע אותו ידנית</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> <code>version</code> עוקב אחרי גרסת ה-Chart (ה"מתכון") עצמו, בעוד <code>appVersion</code> רק מתעד איזו גרסת אפליקציה ה-Chart פורס כרגע - השניים יכולים להתקדם בקצב שונה לגמרי (למשל Chart בגרסה 3.2.0 שמפעיל אפליקציה בגרסה 1.16.0).</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>4. מה ההבדל בין <code>include</code> ל-<code>template</code> בתוך templates של Helm?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. <code>template</code> מהיר יותר בביצוע, ו-<code>include</code> מיועד רק למחרוזות קצרות</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. <code>include</code> מחזיר את הפלט כמחרוזת שניתן "לצנרר" (pipe) לפונקציות נוספות כמו <code>nindent</code>, ואילו <code>template</code> פשוט מדפיס את הפלט ישירות ולא ניתן לשלב אותו בצינור פקודות</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. אין הבדל מעשי בין השניים, וניתן להשתמש בהם לסירוגין</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. <code>include</code> עובד רק בתוך קובץ <code>_helpers.tpl</code> עצמו</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> בזכות היכולת לצנרר את הפלט (למשל <code>{{ include "my-app.labels" . | nindent 4 }}</code>), <code>include</code> הוא כמעט תמיד הבחירה המומלצת על פני <code>template</code>, שלא תומך בפעולה כזו.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>5. מהו OCI Registry בהקשר של Helm, ומאיזו גרסה הוא נתמך במלואו כברירת מחדל?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. פורמט קובץ ייחודי לדחיסת Charts, נתמך כבר מ-Helm 2</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. תקן שמאפשר לאחסן Charts באותו רישום כמו images של Docker (למשל דרך <code>oci://</code>), נתמך במלואו כברירת מחדל מאז Helm 3.8</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. שרת proxy ייעודי המשמש רק כ-cache מקומי ל-Artifact Hub</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. תחליף מלא ל-<code>kubectl</code> להתקנת אובייקטי Kubernetes</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> מאז Helm 3.8 אין צורך יותר ב-feature flag כדי להשתמש ב-OCI. זהו כיום ה"סטנדרט המומלץ" כי הוא מאחד את ניהול ה-images וה-Charts תחת אותה תשתית (Container Registry), עם RBAC וסריקות אבטחה אחידות.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>6. מה קורה אם Job שמוגדר כ-hook מסוג <code>pre-install</code> נכשל?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. Helm מתעלם מהכישלון וממשיך להתקין את שאר משאבי ה-Chart כרגיל</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. Helm עוצר את תהליך ה-install כולו ומדווח על כישלון - משאבי ה-Chart הרגילים לא נוצרים</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. ה-Hook מנסה שוב אוטומטית עד להצלחה, ללא הגבלת זמן</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. רק ה-namespace שבו רץ ה-Hook נמחק, וההתקנה ממשיכה בשאר ה-namespaces</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> משאבי Hook אינם חלק מה-release ה"רגיל" (לא נכללים ב-<code>helm get manifest</code>), ואם הם נכשלים - Helm יעצור מיידית את כל תהליך ה-install/upgrade וידווח על כישלון, בלי ליצור את שאר המשאבים.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>7. למה משמש קובץ <code>Chart.lock</code> ומתי הוא נוצר?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. הוא נכתב ידנית על ידי המפתח כדי לחסום שינויים עתידיים ב-<code>Chart.yaml</code></button>
    <button class="quiz-option" type="button" data-choice="ב">ב. הוא נוצר אוטומטית לאחר <code>helm dependency update</code>, ומנעל את הגרסאות המדויקות של התלויות שהורדו - כדי להבטיח build עקבי, בדומה ל-<code>package-lock.json</code> ב-npm</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. הוא מכיל את כל ה-secrets המוצפנים של ה-release</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. הוא נדרש אך ורק ב-Library Charts, ואין לו שימוש ב-Application Charts</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> לאחר <code>helm dependency update</code> נוצרים גם <code>Chart.lock</code> וגם תיקיית <code>charts/</code> עם קבצי ה-<code>.tgz</code> של התלויות. מומלץ שלא לשים את <code>charts/*.tgz</code> ב-<code>.gitignore</code>, אלא להריץ <code>helm dependency update</code> מחדש בכל build של CI/CD כדי לקבל תוצאה עקבית לפי ה-lock file.</div>
</div>

<div class="quiz-card" data-answer="ד">
  <p class="quiz-question"><strong>8. מהו סדר העדיפויות הנכון של מקורות Values ב-Helm, מהעדיפות הנמוכה ביותר לגבוהה ביותר?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. <code>--set</code>, קבצי <code>-f</code>, ואז <code>values.yaml</code> של ה-Chart (ברירת המחדל מנצחת הכל)</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. קבצי <code>-f</code> תמיד מנצחים את הכל, כולל <code>--set</code></button>
    <button class="quiz-option" type="button" data-choice="ג">ג. Values של subcharts תמיד גוברים על אלו של ה-Chart הראשי, ללא תלות בסדר ההזנה</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. <code>values.yaml</code> בתוך ה-Chart (ברירת מחדל) &lt; values של subcharts &lt; קבצי <code>-f values-X.yaml</code> (האחרון מנצח) &lt; <code>--set</code> (עדיפות הכי גבוהה)</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> זהו סדר עדיפויות חשוב מאוד לזכור: קודם ברירות המחדל המובנות ב-Chart, ואז values של subcharts, ואז קבצי <code>-f</code> (מי שהוגדר אחרון בשורת הפקודה מנצח קודמים), ולבסוף <code>--set</code> שמנצח את כולם - לדוגמה <code>helm install my-release ./chart -f a.yaml -f b.yaml --set key=override</code> מסתיים עם הערך מ-<code>--set</code>.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>9. למה משתמשים ב-<code>--set-string</code> במקום <code>--set</code> רגיל, למשל בעת העברת <code>image.tag=1.20</code>?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. <code>--set-string</code> מהיר יותר בביצוע מבחינת ביצועים</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. <code>--set-string</code> מבטיח שהערך יישמר כמחרוזת (string) ולא יומר בטעות לטיפוס אחר - למשל "1.20" עלול להתפרש כערך עשרוני <code>1.2</code> אם משתמשים ב-<code>--set</code> רגיל</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. <code>--set-string</code> עובד אך ורק עם ערכי boolean כמו <code>true</code>/<code>false</code></button>
    <button class="quiz-option" type="button" data-choice="ד">ד. אין הבדל בין השניים - זהו כינוי (alias) היסטורי בלבד</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> Helm מנסה לנחש את הטיפוס של ערכים שמועברים דרך <code>--set</code>, ולכן תגית גרסה כמו <code>1.20</code> עלולה "להיחתך" ל-<code>1.2</code> כי היא מתפרשת כמספר עשרוני. <code>--set-string</code> כופה טיפוס מחרוזת ומונע את הבעיה.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>10. איך Helm מתייחס ל-Custom Resource Definitions (CRDs) שממוקמים בתיקיית <code>crds/</code>?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. הם מטופלים בדיוק כמו template רגיל בתיקיית <code>templates/</code>, כולל תמיכה מלאה בתחביר <code>{{ }}</code></button>
    <button class="quiz-option" type="button" data-choice="ב">ב. הם מותקנים לפני שאר ה-templates, אינם עוברים דרך מנוע ה-templating (אי אפשר להשתמש בהם ב-<code>{{ }}</code>), ו-Helm לא מוחק ולא משדרג אותם אוטומטית ב-<code>upgrade</code>/<code>uninstall</code></button>
    <button class="quiz-option" type="button" data-choice="ג">ג. הם נמחקים אוטומטית בכל <code>helm uninstall</code> כדי לשמור על ניקיון הקלאסטר</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. Helm דורש repository נפרד וייעודי אך ורק עבור CRDs</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> ל-CRDs יש טיפול מיוחד ב-Helm: הם מוצבים בתיקיית <code>crds/</code> נפרדת, מותקנים ראשונים לפני שאר המשאבים, אינם מתערבבים עם מנוע ה-templating הרגיל, ואינם נמחקים או משודרגים אוטומטית - כדי למנוע מחיקה בטעות של CRDs שמשאבים קריטיים בקלאסטר תלויים בהם.</div>
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
