---
title: "שאלות חזרה"
category: DevOps/Kubernetes
part: 11/10
---

שאלות חזרה אינטראקטיביות על כל מה שלמדתם לאורך מדריכי ה-Kubernetes (ארכיטקטורה, Pods/Deployments, Services ו-Networking, ConfigMaps/Secrets, אחסון ו-Volumes, Helm, RBAC ואבטחה, Ingress, Monitoring/Logging, וטיפים לפתרון תקלות). בחרו תשובה בכל שאלה ותקבלו מיד משוב האם היא נכונה, יחד עם הסבר.

<div id="quiz-score" class="quiz-score">ענית נכון על 0 מתוך 10</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>1. מהו תפקידו של <code>etcd</code> ברכיב ה-Control Plane, ומה מיוחד בו?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. שרת proxy שמנתב תעבורת רשת בין Pods שונים בקלאסטר</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. מסד נתונים מסוג key-value מבוזר ששומר את <strong>כל</strong> מצב הקלאסטר (Pods, Services, Secrets וכו') - "מקור האמת היחיד"</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. הסוכן שרץ על כל Worker Node ומוודא שהקונטיינרים אכן רצים</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. כלי שורת הפקודה שדרכו שולחים בקשות ל-API Server</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> <code>etcd</code> הוא מסד הנתונים המבוזר ששומר את כל מצב הקלאסטר, ולכן הוא "מקור האמת היחיד". גיבוי של <code>etcd</code> הוא בפועל גיבוי של כל הקלאסטר - אם הוא קורס לחלוטין בלי גיבוי, הקלאסטר "שוכח" את כל ההגדרות שלו.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>2. ב-Deployment עם אסטרטגיית <code>RollingUpdate</code>, מה קובע השדה <code>maxUnavailable</code>?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. כמה Pods נוספים, מעבר למספר הרצוי, מותר ליצור זמנית בזמן העדכון</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. כמה Pods מותר שיהיו לא זמינים בו-זמנית במהלך העדכון</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. כמה שניות להמתין בין עדכון Pod אחד למשנהו</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. כמה revisions ישמרו בהיסטוריית ה-rollout</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> <code>maxUnavailable</code> קובע כמה Pods מותר שיהיו לא זמינים בו-זמנית בזמן העדכון, ואילו <code>maxSurge</code> קובע כמה Pods נוספים (מעבר לכמות הרצויה) מותר ליצור זמנית - שני השדות יחד שומרים על זמינות במהלך ה-rolling update.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>3. איזה סוג Service פותח פורט קבוע (בטווח 30000-32767 כברירת מחדל) על <strong>כל</strong> Node בקלאסטר?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. ClusterIP</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. NodePort</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. LoadBalancer</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. ExternalName</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> NodePort פותח פורט קבוע על כל Node בקלאסטר, כך שאפשר לגשת לשירות דרך <code>&lt;NodeIP&gt;:&lt;NodePort&gt;</code>. ClusterIP נגיש רק בתוך הקלאסטר, LoadBalancer מבקש Load Balancer אמיתי מספק הענן, ו-ExternalName רק ממפה שם DNS פנימי לשם DNS חיצוני בלי load balancing כלל.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>4. האם Secret ב-Kubernetes מוצפן כברירת מחדל כשהוא נשמר ב-etcd?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. כן, כל Secret מוצפן אוטומטית ב-AES-256 בתוך etcd</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. לא - הוא רק מקודד ב-Base64 (שזה קידוד, לא הצפנה), וכדי להצפין באמת צריך להפעיל Encryption at Rest בנפרד</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. רק Secrets מסוג <code>kubernetes.io/tls</code> מוצפנים אוטומטית, כל השאר לא</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. כן, אבל רק אם הוא נוצר עם <code>stringData</code> ולא עם <code>data</code></button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> כברירת מחדל Kubernetes לא מצפין Secrets ב-etcd - הם נשמרים שם רק מקודדים ב-Base64, שזה בעצם טקסט גלוי הניתן לפענוח בקלות. כדי לאבטח בפועל צריך להפעיל Encryption at Rest, להגביל גישה עם RBAC, ולעיתים להשתמש בפתרון חיצוני כמו Vault.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>5. למה משתמשים ב-StatefulSet במקום Deployment רגיל, למשל למסד נתונים מבוזר כמו Cassandra?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. כי StatefulSet מהיר יותר בהרצת קונטיינרים מ-Deployment</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. כי הוא מספק שמות/זהות רשת יציבים (<code>pod-0</code>, <code>pod-1</code>...), סדר עלייה/כיבוי צפוי, ו-PVC נפרד וקבוע לכל Pod דרך <code>volumeClaimTemplates</code></button>
    <button class="quiz-option" type="button" data-choice="ג">ג. כי אי אפשר להגדיר <code>resources.requests/limits</code> בתוך Deployment</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. כי StatefulSet לא תומך בכלל ב-Volumes, ולכן פשוט יותר לניהול</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> Deployment רגיל מתאים לאפליקציות stateless שבהן כל ה-Pods זהים וניתנים להחלפה. StatefulSet נועד לאפליקציות stateful מבוזרות שצריכות זהות יציבה, סדר הפעלה/כיבוי צפוי, ואחסון ייחודי שנשמר גם אחרי restart - בדיוק מה שדרוש למסד נתונים מבוזר.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>6. מה ההבדל בין <code>Chart</code> ל-<code>Release</code> ב-Helm?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. Chart הוא מופע מותקן בקלאסטר, ו-Release הוא התבנית/החבילה עצמה</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. Chart הוא החבילה/התבנית עצמה, ו-Release הוא מופע מותקן בפועל של אותו Chart בקלאסטר, עם שם ייחודי משלו</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. אין הבדל מעשי - אלו שני שמות לאותו אובייקט</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. Chart יכול לרוץ רק ב-namespace <code>default</code>, ו-Release יכול לרוץ בכל namespace</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> Chart הוא החבילה עצמה (כמו קוד מקור/תבנית), ו-Release הוא מופע מותקן ומוגדר בפועל של אותו Chart בקלאסטר. אפשר להתקין את אותו Chart כמה פעמים עם שמות Release שונים - למשל <code>nginx-dev</code> ו-<code>nginx-prod</code>.</div>
</div>

<div class="quiz-card" data-answer="א">
  <p class="quiz-question"><strong>7. מה ההבדל בין <code>Role</code> ל-<code>ClusterRole</code> ב-RBAC?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. Role מוגבל ל-namespace יחיד; ClusterRole תקף בכל הקלאסטר ויכול להעניק גישה גם למשאבים שאינם משויכים ל-namespace, כמו Nodes</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. ClusterRole מוגבל ל-namespace יחיד, ו-Role תקף לכל הקלאסטר כולו</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. Role מיועד רק ל-ServiceAccounts, ו-ClusterRole מיועד רק למשתמשים אנושיים</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. אין הבדל מעשי בין השניים, רק בשם האובייקט</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> Role מוגבל ל-namespace יחיד ומגדיר הרשאות על משאבים בתוכו. ClusterRole תקף בכל הקלאסטר, ויכול גם להעניק גישה למשאבים שאינם משויכים ל-namespace כלל, כמו Nodes או PersistentVolumes.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>8. למה יצירת אובייקט <code>Ingress</code> בלבד, בלי שום דבר נוסף, לא עושה כלום בפועל?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. כי חייבים ליצור גם Service מסוג LoadBalancer באותו namespace</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. כי Kubernetes לא כולל Ingress Controller מובנה - צריך להתקין אחד בנפרד (כמו NGINX Ingress Controller) שיישם את חוקי הניתוב בפועל</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. כי Ingress חייב תמיד להגדיר TLS כדי לפעול בכלל</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. כי Ingress נתמך רק בגרסאות בתשלום של Kubernetes</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> אובייקט Ingress הוא רק "הצהרה" על כללי ניתוב רצויים. Kubernetes לא מגיע עם Ingress Controller מובנה, כך שצריך להתקין אחד (למשל NGINX Ingress Controller, Traefik או AWS Load Balancer Controller) שקורא את אובייקטי ה-Ingress ומתרגם אותם לחוקי routing בפועל - אחרת שום תעבורה לא תנותב.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>9. למה DaemonSet הוא הדפוס המקובל להרצת אוסף לוגים כמו Fluent Bit בקלאסטר?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. כי DaemonSet תומך אוטומטית ב-rolling update, בניגוד ל-Deployment</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. כי צריך בדיוק instance אחד של אוסף הלוגים שרץ על <strong>כל</strong> Node בקלאסטר, כדי לקרוא את קבצי הלוג המקומיים שלו</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. כי רק DaemonSet יכול להשתמש ב-<code>hostPath</code> Volume</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. כי DaemonSet רץ אך ורק ב-namespace <code>kube-system</code></button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> DaemonSet מבטיח שרץ בדיוק Pod אחד של הרכיב על כל Node בקלאסטר - בדיוק מה שדרוש לאוסף לוגים (כמו Fluent Bit/Promtail) שצריך לקרוא את קבצי הלוג המקומיים בכל Node, בניגוד ל-Deployment שלא מבטיח הפצה אחידה כזו.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>10. Pod נמצא במצב <code>CrashLoopBackOff</code>. מהם שני הצעדים הראשונים והחשובים ביותר לפי ה-workflow לפתרון תקלות?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. למחוק מיד את ה-Pod וליצור אותו מחדש, בלי לבדוק שום דבר נוסף</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. <code>kubectl describe pod</code> כדי לבדוק events, ו-<code>kubectl logs &lt;pod&gt; --previous</code> כדי לראות את הלוגים מהריצה שקרסה</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. להגדיל מיידית את מספר ה-replicas ב-Deployment</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. לבדוק את קובץ ה-<code>kubeconfig</code> המקומי במחשב</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> ה-workflow השיטתי מתחיל תמיד ב-<code>kubectl describe pod</code> (Events בתחתית התוצאה כמעט תמיד מכילים את התשובה) ואז <code>kubectl logs --previous</code> לראות את הלוגים מהריצה שקרסה - זה מאפשר לזהות אם מדובר בבעיית קונפיגורציה, health check מוקדם מדי, OOMKilled, או crash אמיתי בקוד.</div>
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
