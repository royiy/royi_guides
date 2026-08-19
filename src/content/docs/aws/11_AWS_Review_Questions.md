---
title: "מדריך 11: שאלות חזרה"
description: "מבחן אמריקאי אינטראקטיבי לחזרה על כל מדריכי ה-AWS"
---

שאלות חזרה אינטראקטיביות על כל מה שלמדתם לאורך מדריכי ה-AWS (תשתית גלובלית, IAM, EC2, VPC, אחסון, מסדי נתונים, Serverless, קונטיינרים, תשתית כקוד, וניטור ועלויות). בחרו תשובה בכל שאלה ותקבלו מיד משוב האם היא נכונה, יחד עם הסבר.

<div id="quiz-score" class="quiz-score">ענית נכון על 0 מתוך 10</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>1. מהו ההבדל בין Region ל-Availability Zone (AZ) בתשתית הגלובלית של AWS?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. אין הבדל, אלו שני מונחים לאותו דבר בדיוק</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. Region הוא אזור גיאוגרפי שלם המכיל תמיד לפחות 2 AZs, כשכל AZ הוא מרכז נתונים אחד או יותר עם חשמל, רשת וקישוריות עצמאיים</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. AZ הוא רשת <code>Edge Locations</code> להפצת תוכן מהיר למשתמשי קצה דרך CloudFront</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. Region הוא רכיב פנימי בתוך AZ בודד</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> Region הוא אזור גיאוגרפי שלם, בעוד ש-AZ הוא דאטה-סנטר (או קבוצה כזו) בתוך אותו Region, עם מתח, רשת וקישוריות נפרדים ויתירים. אזור תמיד מכיל לפחות 2 AZs, ומומלץ לפרוס מערכת על פני לפחות 2 מהם כדי לשרוד נפילה של דאטה סנטר שלם.</div>
</div>

<div class="quiz-card" data-answer="ג">
  <p class="quiz-question"><strong>2. כיצד AWS IAM מכריע איזו הרשאה תקפה, כאשר יש גם <code>Allow</code> וגם <code>Deny</code> מפורש עבור אותה פעולה?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. ה-<code>Allow</code> תמיד מנצח, ללא יוצא מן הכלל</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. ברירת המחדל היא <code>Allow</code>, אלא אם הוגדר אחרת במפורש</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. ברירת המחדל היא <code>Deny</code>, אך <code>Deny</code> מפורש באחד מה-Policies תמיד ינצח - גם אם קיים <code>Allow</code> מפורש במקום אחר</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. ההרשאה שנוצרה כרונולוגית אחרונה היא זו שתקפה</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> ברירת המחדל ב-IAM היא Deny. אם יש Allow מפורש זה יאפשר את הפעולה, אך אם יש Deny מפורש באחד מה-Policies הרלוונטיים, ה-Deny המפורש תמיד ינצח - זו הסיבה שחשוב לתת הרשאות לפי עקרון Least Privilege.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>3. מה קורה לנתונים ב-<code>Instance Store</code> של שרת EC2 כשהשרת נכבה, ומהי הדרך המאובטחת ביותר להתחבר לשרת בלי מפתח SSH?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. הנתונים נשמרים לצמיתות; מתחברים דרך פתיחת פורט 22 לכולם ב-Security Group</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. הנתונים נמחקים לחלוטין כי זהו אחסון זמני (Ephemeral); ניתן להתחבר בבטחה באמצעות AWS Systems Manager Session Manager (SSM), בלי לפתוח פורט 22</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. הנתונים עוברים אוטומטית ל-S3 Glacier; מתחברים רק דרך VPC Peering</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. הנתונים נשמרים על גבי ה-AMI המקורי ומתחברים מחדש דרכו</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> נתונים ב-Instance Store הם זמניים (Ephemeral) ונמחקים כשהשרת נכבה - לאחסון קבוע יש להשתמש ב-EBS. להתחברות בלי מפתח SSH ובלי לפתוח פורט 22 ב-Security Group, משתמשים ב-AWS Systems Manager Session Manager (SSM), שיטה בטוחה יותר.</div>
</div>

<div class="quiz-card" data-answer="ג">
  <p class="quiz-question"><strong>4. מה ההבדל בין Security Group ל-NACL (Network Access Control List) ב-Amazon VPC?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. שניהם עובדים באותה רמה (Subnet) ומתנהגים באותו אופן בדיוק</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. Security Group הוא Stateless וברמת ה-Subnet, ואילו NACL הוא Stateful וברמת ה-Instance</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. Security Group עובד ברמת ה-Instance והוא Stateful (תעבורה נכנסת מותרת חוזרת אוטומטית), ואילו NACL עובד ברמת ה-Subnet והוא Stateless (חובה להגדיר חוקים גם לנכנס וגם ליוצא)</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. NACL רלוונטי רק ל-Private Subnet, ו-Security Group רלוונטי רק ל-Public Subnet</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> Security Group עובד ברמת ה-Instance והוא Stateful - אם תעבורה נכנסת מותרת, התשובה תעבור אוטומטית. NACL עובד ברמת ה-Subnet והוא Stateless, ולכן יש להגדיר בו חוקים בנפרד גם לתעבורה נכנסת וגם ליוצאת.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>5. מה ההבדל העיקרי בין Amazon EBS ל-Amazon EFS?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. EBS ו-EFS זהים מבחינה טכנית, ההבדל הוא רק בשם המסחרי</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. EBS יכול להיות מחובר ל-Instance אחד בלבד באותו זמן ונמצא ב-AZ ספציפי, ואילו EFS מאפשר חיבור בו-זמני של אלפי שרתים מכל ה-AZs באותו Region</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. EFS הוא Object Storage המיועד לגיבויים בלבד, ואילו EBS מיועד לשיתוף קבצים בין שרתים</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. EBS מוגבל לתמונות וקבצים סטטיים בלבד, ו-EFS מיועד לכונן קשיח יחיד</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> EBS הוא כונן וירטואלי (Block Storage) המחובר ל-EC2 Instance יחיד ונמצא ב-AZ ספציפי (למעט מקרים ספציפיים ב-io2). EFS הוא מערכת קבצים מנוהלת בסגנון NFS שמתנהגת כמו תיקיית רשת ומאפשרת חיבור של אלפי שרתי EC2 בו-זמנית מכל ה-AZs באותו Region.</div>
</div>

<div class="quiz-card" data-answer="ג">
  <p class="quiz-question"><strong>6. מה ההבדל בין Multi-AZ ל-Read Replica באמזון RDS?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. שניהם משמשים אך ורק לשיפור ביצועי כתיבה של מסד הנתונים</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. Multi-AZ הוא עותק אסינכרוני שממנו אפשר לקרוא ביומיום, ו-Read Replica הוא גיבוי סינכרוני לשעת חירום בלבד</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. Multi-AZ משמש ל-High Availability וזהו גיבוי סינכרוני שלא ניתן לקרוא ממנו ביומיום, ואילו Read Replica הוא עותק אסינכרוני שמיועד לשיפור ביצועי קריאה</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. Multi-AZ זמין רק ב-DynamoDB, ו-Read Replica זמין רק ב-RDS</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> Multi-AZ משמש ל-High Availability (Disaster Recovery) - זהו גיבוי סינכרוני שלא ניתן לקרוא ממנו ביומיום. Read Replica משמש לשיפור ביצועים (Scaling) לקריאות, והוא אסינכרוני. שימו לב שגם DynamoDB (NoSQL) לא תומך בשאילתות JOIN מורכבות, ולכך מתאים RDS.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>7. מהי מגבלת זמן הריצה המקסימלית של פונקציית AWS Lambda בודדת, ומה עושים אם המשימה ארוכה יותר?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. אין מגבלת זמן כלל, Lambda יכולה לרוץ ללא הגבלה</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. 15 דקות; למשימות ארוכות יותר יש להשתמש בשירותים כמו ECS או AWS Step Functions</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. 5 דקות; למשימות ארוכות יותר מפצלים אותן ל-100 פונקציות למבדה מקבילות</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. שעה אחת, וניתן להאריך זאת רק באמצעות Provisioned Concurrency</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> מגבלת זמן הריצה המקסימלית של פונקציית Lambda היא 15 דקות. אם משימה לוקחת יותר מכך, יש להשתמש בשירותים כמו ECS או AWS Step Functions. חשוב לזכור גם ש-Lambda היא Stateless לחלוטין - יש לשמור מידע מתמשך במסד נתונים חיצוני כמו DynamoDB, ב-S3, או ב-ElastiCache.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>8. מהו AWS Fargate, ואיך IRSA (IAM Roles for Service Accounts) קשור ל-EKS?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. Fargate הוא מסד נתונים NoSQL, ו-IRSA הוא כלי לניטור לוגים</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. Fargate הוא מנוע הרצה מסוג Serverless לקונטיינרים, שמאפשר להריץ אותם ב-ECS או EKS מבלי לנהל את שרתי ה-EC2 שמתחת, ו-IRSA מקשר Kubernetes Service Account ל-IAM Role ספציפי כדי להעניק הרשאות ל-Pod בודד</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. Fargate הוא כלי CI/CD לבניית תמונות Docker, ו-IRSA משמש רק לניהול VPC</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. Fargate מחליף לחלוטין את הצורך ב-ECR, ו-IRSA הוא פרוטוקול הצפנה לתעבורת רשת</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> AWS Fargate הוא מנוע הרצה Serverless לקונטיינרים, המאפשר להריץ קונטיינרים ב-ECS או EKS מבלי לנהל את שרתי ה-EC2 שמתחת. IRSA מאפשר לקשר Kubernetes Service Account ל-IAM Role ספציפי, וכך להעניק הרשאות (כמו גישה ל-S3) לקונטיינר (Pod) בודד ב-EKS.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>9. מהו CloudFormation Drift, ולמה חלק מהחברות בוחרות ב-Terraform על פני CloudFormation?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. Drift הוא מצב בו Stack נמחק אוטומטית; Terraform נבחר כי הוא זמין רק בענן AWS</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. Drift מתרחש כששינוי ידני מחוץ ל-CloudFormation (למשל דרך הקונסול) גורם למשאב לסטות מהתצורה המוגדרת בקוד; Terraform נבחר בין היתר בזכות תמיכה טובה בסביבות Multi-Cloud ומנגנון State עוצמתי</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. Drift הוא שם נרדף ל-Change Set; Terraform תמיד חינמי ו-CloudFormation תמיד בתשלום</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. Drift קורה רק ב-AWS CDK, ו-Terraform בכלל לא תומך ב-AWS</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> Drift מתרחש כאשר משאב שנוהל על ידי CloudFormation שונה באופן ידני מחוץ לו (למשל פתיחת פורט ב-Security Group מהקונסול) - אפשר לגלות זאת עם Drift Detection. Terraform נבחר לעיתים כי הוא עובד מעולה בסביבות Multi-Cloud (AWS + GCP/Azure), ומציע מנגנון State עוצמתי וסינטקס (HCL) שחלק מוצאים כקריא יותר מ-YAML ארוך.</div>
</div>

<div class="quiz-card" data-answer="ג">
  <p class="quiz-question"><strong>10. מה ההבדל בין Amazon CloudWatch ל-AWS CloudTrail, והאם CloudWatch מציג כברירת מחדל את ניצול הזיכרון (RAM) של שרת EC2?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. CloudWatch ו-CloudTrail הם אותו שירות בשני שמות; RAM מוצג תמיד כברירת מחדל</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. CloudTrail מנטר ביצועים ומדדים כמו CPU, ואילו CloudWatch מתעד קריאות API מטעמי אבטחה; RAM לא מוצג לעולם בשום דרך</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. CloudWatch מסתכל על ביצועי המערכת (מדדים, לוגים, התראות) ו-CloudTrail מתעד מי עשה מה בחשבון (קריאות API); RAM אינו מדד ברירת מחדל ב-EC2 ודורש התקנת CloudWatch Agent בתוך השרת</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. CloudWatch משמש רק לניהול תקציב, ו-CloudTrail משמש רק לניטור CPU</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> CloudWatch מסתכל על "איך המערכת מתפקדת" (ביצועים, מדדים, לוגים), ואילו CloudTrail מסתכל על "מי עשה מה בחשבון" (תיעוד קריאות API מטעמי אבטחה ורגולציה). CloudWatch מספק כברירת מחדל מדדי CPU, Disk ו-Network ב-EC2, אך אינו יכול "לראות" לתוך מערכת ההפעלה כדי למדוד RAM - לשם כך יש להתקין CloudWatch Agent בתוך השרת.</div>
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
