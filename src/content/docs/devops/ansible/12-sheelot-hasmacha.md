---
title: "שאלות קשות ברמת הסמכה (Red Hat EX294)"
category: DevOps/Ansible
part: 12/10
---

מבחן אינטראקטיבי ברמת קושי גבוהה, בסגנון שאלות הסמכת **Red Hat Certified Specialist in Ansible Automation (EX294)** - בניגוד למבחן החזרה הכללי בפרק הקודם, כאן כל שאלה בודקת נקודה עדינה ומטעה שדורשת הבנה אמיתית של מנגנוני הפנים של Ansible (סדר עדיפות משתנים, Handlers, Blocks, Vault ועוד), לא רק שינון. בחרו תשובה ותקבלו מיד משוב עם הסבר מפורט.

<div id="quiz-score" class="quiz-score">ענית נכון על 0 מתוך 10</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>1. מגדירים את אותו משתנה גם בקובץ <code>roles/webserver/vars/main.yml</code> (לא <code>defaults</code>!) וגם דרך <code>-e "http_port=9090"</code> בשורת הפקודה. איזה ערך ינצח בפועל?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. הערך מ-<code>roles/webserver/vars/main.yml</code> ינצח, כי קובצי <code>vars</code> של Role (בניגוד ל-<code>defaults</code>) נמצאים גבוה מאוד בשרשרת העדיפות</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. הערך מה-<code>-e</code> ינצח בכל מקרה - Extra Vars נמצאים תמיד בראש שרשרת העדיפות המוחלטת, גבוה יותר מכל <code>vars</code> אחר, כולל <code>vars</code> של Role שאינם <code>defaults</code></button>
    <button class="quiz-option" type="button" data-choice="ג">ג. Ansible יזרוק שגיאת קונפליקט ויעצור את הריצה</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. שני הערכים ימוזגו למחרוזת אחת</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> זו מלכודת קלאסית - נכון ש-<code>roles/&lt;role&gt;/vars/main.yml</code> נמצא גבוה מאוד בשרשרת העדיפות (גבוה יותר אפילו מ-<code>vars</code> ברמת ה-Play), ולכן רבים חושבים בטעות שהוא יכול "לנצח" גם Extra Vars. אבל <code>-e</code> בשורת הפקודה הוא תמיד המנצח המוחלט בכל שרשרת סדר העדיפות של Ansible, ללא יוצא מן הכלל - זו בדיוק הסיבה שמשתמשים בו כדי לדרוס כל דבר אחר בזמן פריסה חד-פעמית.</div>
</div>

<div class="quiz-card" data-answer="ג">
  <p class="quiz-question"><strong>2. Task כלשהו קורא ל-<code>notify: restart nginx</code> ומדווח <code>changed</code>. Task אחר, שרץ אחריו באותו Play, נכשל (<code>failed</code>) לפני שה-Play הגיע לשלב הרצת ה-Handlers. מה קורה ל-Handler שהופעל, בהגדרות ברירת המחדל?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. ה-Handler ירוץ מיד, לפני ה-Task שנכשל, כי הוא כבר קיבל <code>notify</code></button>
    <button class="quiz-option" type="button" data-choice="ב">ב. ה-Handler ירוץ בכל מקרה בסוף ה-Play, גם אם ה-Host נכשל בדרך</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. ה-Handler <strong>לא</strong> ירוץ עבור אותו Host - Ansible עוצר את הריצה על Host שנכשל לפני שהגיע לשלב הרצת ה-Handlers, אלא אם מגדירים במפורש <code>force_handlers: true</code></button>
    <button class="quiz-option" type="button" data-choice="ד">ד. ה-Handler ירוץ אוטומטית בהרצה הבאה של ה-Playbook</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> Handlers שהופעלו עם <code>notify</code> ממתינים ורצים רק בסוף ה-Play (או בנקודת <code>meta: flush_handlers</code> מפורשת). אם Host נכשל ב-Task כלשהו לפני שהגיעו לשלב הזה, ברירת המחדל של Ansible היא לעצור לחלוטין את הריצה עבור אותו Host - כולל דילוג על ה-Handlers שהמתינו לו. כדי לוודא שהם ירוצו בכל זאת (למשל כדי לא להשאיר שירות עם קונפיגורציה חלקית בלי restart), צריך להגדיר <code>force_handlers: true</code> ברמת ה-Play, ב-<code>ansible.cfg</code>, או עם הדגל <code>--force-handlers</code>.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>3. Task רץ בלולאה על רשימת שרתי אפליקציה כדי לעדכן קובץ קונפיגורציה של HAProxy עבור כל שרת, אבל עם <code>delegate_to: loadbalancer</code>. למה בדיוק דרוש כאן <code>delegate_to</code>?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. כדי שהלולאה תרוץ מהר יותר במקביל על כל שרתי האפליקציה</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. כי הפעולה בפועל (עריכת קובץ הקונפיגורציה של HAProxy) צריכה להתבצע פיזית על שרת ה-Load Balancer, גם כשהלולאה עוברת על נתוני שרתי האפליקציה - בלי <code>delegate_to</code>, כל איטרציה הייתה מנסה לערוך את הקובץ על שרת האפליקציה עצמו, לא על ה-Load Balancer</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. כדי להריץ את המשימה פעם אחת בלבד במקום פעם לכל שרת בלולאה</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. <code>delegate_to</code> נדרש תמיד כשמשתמשים ב-<code>loop</code>, ללא קשר לתוכן המשימה</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> זהו דפוס שימוש נפוץ מאוד ב-EX294 - כשה-Play רץ מול קבוצת שרתי אפליקציה, אבל צריך לעדכן קובץ שיושב על שרת אחר (ה-Load Balancer) בהתאם לנתונים של כל איטרציה בלולאה (למשל כתובת ה-IP של כל שרת). <code>delegate_to</code> מפנה את ההרצה בפועל של אותו Task הספציפי לשרת אחר, בעוד המשתנים של הלולאה (<code>item</code>) עדיין מגיעים מההקשר המקורי. שימו לב שבניגוד ל-<code>run_once</code>, כאן המשימה עדיין רצה פעם אחת לכל איבר בלולאה - רק היעד בפועל שונה.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>4. למה Dynamic Inventory (למשל Plugin כמו <code>amazon.aws.aws_ec2</code>) נחשב הכרחי בסביבות ענן עם Auto Scaling, בניגוד ל-Inventory סטטי (קובץ <code>ini</code>/<code>yaml</code> קבוע)?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. Dynamic Inventory תמיד מהיר יותר בהרצה מ-Inventory סטטי</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. Dynamic Inventory שואל את ה-API של הענן בזמן אמת ומחזיר את רשימת המכונות הפעילות ברגע ההרצה, כך שהוא משקף אוטומטית מכונות שנוספו/הוסרו על ידי Auto Scaling - Inventory סטטי דורש עדכון ידני בכל שינוי, ולכן עלול להצביע על מכונות שכבר לא קיימות או לפספס חדשות</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. Inventory סטטי לא תומך בכלל ב-<code>group_vars</code> או <code>host_vars</code></button>
    <button class="quiz-option" type="button" data-choice="ד">ד. Dynamic Inventory לא דורש חיבור רשת בזמן ההרצה</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> ביסודות הענן, מכונות עולות ויורדות באופן דינמי (Auto Scaling Groups, Spot Instances וכו'), כך שכל רשימה סטטית "קופאת" ומתיישנת כמעט מיד. Inventory Plugin דינמי מתחבר ל-API של ספק הענן בכל הרצה, שולף את המכונות הפעילות בפועל לפי תגיות/פילטרים שהגדרתם, ובונה את קבוצות ה-Inventory אוטומטית - כך שאין צורך לתחזק ידנית רשימת IP-ים שמתעדכנת כל הזמן.</div>
</div>

<div class="quiz-card" data-answer="ג">
  <p class="quiz-question"><strong>5. בתוך קובץ Template בסיומת <code>.j2</code>, מה ההבדל התפקודי בין <code>{{ variable_name }}</code> לבין <code>{% if condition %} ... {% endif %}</code>?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. אין הבדל, שתי הצורות זהות לחלוטין בתחביר Jinja2</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. <code>{% %}</code> משמש רק להערות בתוך הקובץ, ו-<code>{{ }}</code> משמש להכל</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. <code>{{ }}</code> הוא Expression - הוא מציג (מדפיס) את הערך המחושב לתוך הקובץ הסופי; <code>{% %}</code> הוא Statement - משמש ללוגיקת בקרה (תנאים, לולאות) שעצמה לא מודפסת לפלט</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. <code>{% %}</code> תקף רק בתוך <code>tasks</code>, ו-<code>{{ }}</code> תקף רק בתוך Templates</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> בתחביר Jinja2, סוגריים כפולים <code>{{ }}</code> משמשים להערכת ולהדפסת ערך (Expression) - למשל <code>{{ ansible_hostname }}</code> יודפס כפי שהוא לתוך הקובץ הסופי. הסימון <code>{% %}</code> משמש למבני בקרה (Statements) כמו <code>{% for host in groups['web'] %}</code> או <code>{% if env == "prod" %}</code> - הלוגיקה עצמה לא מודפסת, רק התוצאה של מה שבתוכה. חשוב לזכור בנוסף: בתוך תנאי <code>when:</code> ב-Playbook לא כותבים <code>{{ }}</code> סביב הביטוי, כי ההקשר שם כבר מוערך כ-Jinja2 מטבעו.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>6. מריצים <code>ansible.builtin.command: /usr/bin/create_report.sh</code> ללא כל פרמטר נוסף. מדוע Task כזה שובר בפועל את עקרון ה-Idempotency, גם אם הסקריפט עצמו לא משנה שום דבר בהרצה השנייה?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. מודול <code>command</code> תמיד נכשל (<code>failed</code>) בהרצה חוזרת</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. מודול <code>command</code> (וכך גם <code>shell</code>) לא יודע לבדוק את מצב המערכת מראש - הוא פשוט מריץ את הפקודה בכל פעם ומדווח <code>changed</code> תמיד, אלא אם מוסיפים <code>creates</code>/<code>removes</code> כדי לדלג על הרצה חוזרת, או <code>changed_when</code> כדי לשלוט ידנית בדיווח</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. Idempotency רלוונטי רק למודולים שעובדים עם קבצים, לא לסקריפטים</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. הבעיה תיפתר אוטומטית אם מוסיפים <code>become: true</code></button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> מודולים ייעודיים כמו <code>ansible.builtin.package</code> או <code>ansible.builtin.service</code> בודקים בעצמם את מצב המערכת ומדווחים <code>changed</code> רק כשבאמת בוצע שינוי. לעומת זאת <code>command</code>/<code>shell</code> "טיפשים" מבחינה הזו - הם מריצים את הפקודה שוב בכל פעם ומדווחים <code>changed</code> ללא קשר לתוצאה בפועל. כדי להחזיר Idempotency אמיתי משתמשים בפרמטר <code>creates</code> (דלג אם קובץ מסוים כבר קיים) או <code>removes</code>, ולחלופין <code>changed_when</code> כדי להגדיר ידנית מתי לדווח שינוי לפי הפלט של הפקודה.</div>
</div>

<div class="quiz-card" data-answer="ד">
  <p class="quiz-question"><strong>7. בתוך <code>block</code>, ה-Task הראשון מוגדר עם <code>ignore_errors: true</code> ונכשל בפועל. מה קורה לסעיף ה-<code>rescue</code> של אותו Block?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. ה-<code>rescue</code> ירוץ תמיד כשיש כשל בתוך <code>block</code>, ללא קשר ל-<code>ignore_errors</code></button>
    <button class="quiz-option" type="button" data-choice="ב">ב. ה-<code>rescue</code> ירוץ רק אם גם הוא מוגדר עם <code>ignore_errors: true</code></button>
    <button class="quiz-option" type="button" data-choice="ג">ג. Ansible יזרוק שגיאת תחביר, כי אי אפשר לשלב <code>ignore_errors</code> בתוך <code>block</code> עם <code>rescue</code></button>
    <button class="quiz-option" type="button" data-choice="ד">ד. ה-<code>rescue</code> <strong>לא</strong> ירוץ - <code>ignore_errors: true</code> גורם ל-Ansible להתייחס למשימה כאילו לא נכשלה מבחינת זרימת הבקרה, ולכן ה-Block כולו לא נחשב "נכשל" ולא מפעיל את סעיף ה-<code>rescue</code></button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> נקודה עדינה שרבים מפספסים - <code>rescue</code> מופעל רק כשמשימה בתוך ה-<code>block</code> נכשלת בפועל מבחינת Ansible. <code>ignore_errors: true</code> אומר בדיוק ל-Ansible "אל תתייחס לכשל הזה כאל כשל" - ולכן ה-Play ממשיך כרגיל, ואף אחד מה-<code>rescue</code> לא מופעל, בדיוק כאילו המשימה הצליחה. אם רוצים גם לתעד את הכשל וגם להפעיל <code>rescue</code>, לא שמים <code>ignore_errors</code> על אותו Task.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>8. קובץ <code>group_vars/production.yml</code> הוא ברובו טקסט גלוי, ורק ערך אחד בתוכו מוצפן באמצעות <code>ansible-vault encrypt_string</code> (מופיע כבלוק <code>!vault |</code>). מה נדרש כדי להריץ Playbook שמשתמש בקובץ הזה, גם אם ה-Task הספציפי שמשתמש במשתנה המוצפן בכלל לא מופעל בהרצה הנוכחית (למשל בגלל <code>when</code> שקרי)?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. שום דבר מיוחד - כל עוד המשתנה המוצפן לא בשימוש בפועל, אין צורך בסיסמת Vault</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. עדיין נדרשת סיסמת ה-Vault (<code>--ask-vault-pass</code> או <code>--vault-password-file</code>) - Ansible חייב לפענח כל ערך <code>!vault</code> כבר בשלב טעינת/ניתוח קובץ ה-YAML, לפני שהוא בכלל יודע אילו Tasks ירוצו בפועל</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. Ansible ידלג אוטומטית על פענוח הערך אם הוא לא בשימוש</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. חובה קודם להריץ <code>ansible-vault decrypt</code> על הקובץ כדי שה-Playbook יעבוד בכלל</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> פענוח ערכי <code>!vault</code> קורה בשלב טעינת ה-YAML עצמו (Parsing), הרבה לפני ששלב הבחירה איזה Tasks ירוצו לפי <code>when</code> בכלל מתרחש. כלומר גם אם המשתנה המוצפן "לא בשימוש" בהרצה הספציפית, Ansible עדיין חייב לפענח אותו רק כדי לטעון את הקובץ בהצלחה - ולכן סיסמת ה-Vault תמיד נדרשת ברגע שיש ולו ערך מוצפן אחד בקבצים שנטענים, בלי קשר לשימוש בפועל.</div>
</div>

<div class="quiz-card" data-answer="ג">
  <p class="quiz-question"><strong>9. מהו ההבדל בסדר העדיפויות בין <code>roles/myrole/defaults/main.yml</code> לבין <code>roles/myrole/vars/main.yml</code> באותו Role בדיוק?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. אין הבדל בעדיפות - שניהם נטענים באותה רמה בדיוק, וההבדל הוא רק קוסמטי בשם התיקייה</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. <code>vars/main.yml</code> תמיד נמוך יותר בעדיפות מ-<code>defaults/main.yml</code>, בדיוק כדי לאפשר ל-<code>defaults</code> לדרוס אותו בקלות</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. <code>defaults/main.yml</code> נמצא בעדיפות הנמוכה ביותר מכל מקורות המשתנים ב-Ansible (נועד להיות "ברירת מחדל" שקל לדרוס), ואילו <code>vars/main.yml</code> נמצא גבוה מאוד בשרשרת - גבוה אפילו מ-<code>vars</code> שמוגדרים ברמת ה-Play עצמו</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. שניהם לא רלוונטיים אם יש <code>group_vars</code> מוגדר ל-Host</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> זו נקודה שמופיעה חוזרת ונשנית במבחני EX294 - <code>defaults/main.yml</code> מיועד בדיוק לכך שיהיה קל לדרוס אותו (הוא בעדיפות הנמוכה ביותר מכל מקור משתנים קיים ב-Ansible), ולכן מתאים לערכי ברירת מחדל סבירים ל-Role. לעומת זאת <code>vars/main.yml</code> של אותו Role נמצא גבוה משמעותית בשרשרת העדיפות - גבוה אפילו מ-<code>vars</code> שמוגדר ישירות בגוף ה-Play - ולכן מתאים לערכים "פנימיים" ל-Role שלא רוצים שמשתמש חיצוני ידרוס בקלות (רק Extra Vars או פרמטרים שהועברו ישירות ל-Role יגברו עליו).</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>10. מה עושה ההגדרה <code>serial: [1, 5, "20%"]</code> ברמת Play שרץ מול 50 שרתים?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. שגיאת תחביר - <code>serial</code> יכול לקבל רק מספר בודד או אחוז בודד, לא רשימה</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. Rolling Update מדורג: קודם שרת אחד בלבד (גל ראשון), אחר כך 5 שרתים (גל שני), ולאחר מכן 20% מהשרתים הנותרים בכל גל נוסף - דפוס נפוץ ל-Canary Deployment שמתחיל זהיר ומאיץ בהדרגה</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. תמיד 26 שרתים בו-זמנית (1+5+20)</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. הרשימה קובעת סדר עדיפות בין שלוש קבוצות Inventory שונות בשם זהה</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> <code>serial</code> יכול לקבל גם רשימה של גדלי אצווה, ולא רק מספר קבוע אחד. Ansible עובר על הרשימה גל אחר גל - גל ראשון בגודל האיבר הראשון, גל שני בגודל האיבר השני, וכן הלאה; אם השרתים לא נגמרו והרשימה כן, הערך האחרון ברשימה חוזר על עצמו לכל שאר הגלים. זו הדרך המקובלת לממש Canary Deployment - להתחיל עם שרת בודד כדי לוודא שההרצה תקינה, ורק אז להגדיל בהדרגה את קצב הפריסה.</div>
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
