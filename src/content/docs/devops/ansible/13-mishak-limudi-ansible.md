---
title: "משחק לימודי: אתגר Ansible"
category: DevOps/Ansible
part: 13/10
description: "משחק אינטראקטיבי ללימוד Ansible - חמישה מצבי משחק עם טיימר, לבבות, ניקוד ורצפים: קרב מהיר, ניחוש תוצאת הרצה, השלמת פקודה/YAML, התאמת מושגים וסידור תהליך."
---

חמישה מצבי משחק שבודקים היבטים שונים של Ansible - Inventory, Playbooks, Modules, Variables/Facts, Handlers, Roles ו-Vault. לא עוד חידון רב-ברירה, אלא משחק עם **טיימר**, **שלושה לבבות**, **מכפיל רצף** ו**שיא אישי** שנשמר בדפדפן. בסוף כל סבב תקבלו דירוג, ורשימת חזרה של בדיוק מה שפספסתם.


<div class="tg" id="tg" dir="rtl">
  <div class="tg-screen is-active" data-screen="menu">
    <div class="tg-hero">
      <div class="tg-hero-badge">Ansible</div>
      <div class="tg-hero-title">אתגר Ansible</div>
      <div class="tg-hero-sub">בחרו מצב משחק. יש לכם 3 לבבות - תשובה שגויה, טעות בהתאמה או נגמר הזמן עולים לב אחד.</div>
    </div>
    <div class="tg-modes" id="tg-modes"></div>
    <div class="tg-hero-foot">💡 טיפ: במצבי השאלות אפשר לענות עם המקשים <kbd>1</kbd>–<kbd>4</kbd> ולהתקדם עם <kbd>Enter</kbd>.</div>
  </div>
  <div class="tg-screen" data-screen="play">
    <div class="tg-hud">
      <button class="tg-quit" type="button" id="tg-quit">← יציאה</button>
      <div class="tg-mode-title" id="tg-mode-name"></div>
      <div class="tg-hud-stats">
        <span class="tg-lives" id="tg-lives"></span>
        <span class="tg-chip">ניקוד <b id="tg-score">0</b></span>
        <span class="tg-chip">רצף <b id="tg-streak">0</b></span>
      </div>
    </div>
    <div class="tg-progress"><i class="tg-progress-bar" id="tg-progress"></i></div>
    <div class="tg-timer-wrap" id="tg-timer-wrap"><i class="tg-timer-bar" id="tg-timer"></i></div>
    <div class="tg-stage" id="tg-stage"></div>
    <div class="tg-foot">
      <div class="tg-feedback" id="tg-feedback" aria-live="polite"></div>
      <button class="tg-btn tg-btn--primary tg-next" type="button" id="tg-next" hidden>הבא ←</button>
    </div>
  </div>
  <div class="tg-screen" data-screen="result">
    <div id="tg-result"></div>
    <div class="tg-result-actions">
      <button class="tg-btn tg-btn--primary" type="button" id="tg-again">שחק שוב</button>
      <button class="tg-btn" type="button" id="tg-menu">חזרה לתפריט</button>
    </div>
  </div>
</div>

<link rel="stylesheet" href="/styles/topic-game.css">

<script>
(function () {
  'use strict';

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /* ============================================================
     מצב 1 - קרב מהיר: שאלות ידע קצרות. o = אפשרויות, a = אינדקס נכון
     ============================================================ */
  var RAPID = [
    {
      q: 'מה ההבדל העיקרי בין Ansible לכלים כמו Puppet או Chef מבחינת ארכיטקטורה?',
      o: ['Ansible הוא Agentless ומתחבר ב-SSH/WinRM, בלי צורך בסוכן מותקן על השרת המנוהל', 'Ansible דורש התקנת Agent על כל שרת מנוהל', 'אין הבדל ארכיטקטוני בין הכלים', 'Ansible עובד רק מול שרתי Windows'],
      a: 0,
      w: 'היתרון המרכזי של Ansible הוא <b>Agentless</b> - הוא מתחבר ישירות דרך SSH (לינוקס) או WinRM (Windows), מעביר מודולים, מריץ ומוחק אותם - בלי תהליך רקע קבוע על השרת המנוהל.'
    },
    {
      q: 'מהי אידמפוטנטיות (Idempotency) ב-Ansible?',
      o: ['הרצה חוזרת של אותה פעולה תמיד מביאה לאותה תוצאה סופית, בלי לבצע שינוי מיותר אם המצב הרצוי כבר קיים', 'כל הרצה חוזרת מבצעת את הפעולה מחדש מאפס', 'תכונה שקיימת רק במודול <code>command</code>', 'מנגנון לניהול גרסאות Playbook'],
      a: 0,
      w: 'זהו עיקרון היסוד של Ansible: אם השרת כבר במצב הרצוי (למשל nginx כבר מותקן), הרצה חוזרת של אותו Task תדווח <code>ok</code> ולא <code>changed</code> - בלי לבצע שוב את הפעולה בפועל.'
    },
    {
      q: 'מהו קובץ ה-Inventory?',
      o: ['רשימת השרתים (Hosts) המנוהלים, מקובצים לקבוצות לוגיות (Groups)', 'קובץ ה-YAML המתאר את רצף המשימות להרצה', 'קובץ הקונפיגורציה הראשי ansible.cfg', 'רשימת המודולים הזמינים להתקנה'],
      a: 0,
      w: 'ה-Inventory הוא "רשימת המטרות" של Ansible - אילו שרתים קיימים ואיך הם מקובצים (למשל <code>webservers</code>, <code>dbservers</code>). ניתן לכתוב אותו כ-INI, YAML, או להפיק אותו דינמית מענן כמו AWS.'
    },
    {
      q: 'מה ההבדל בין <code>group_vars</code> ל-<code>host_vars</code>?',
      o: ['<code>group_vars</code> מגדיר משתנים לכל שרתי קבוצה; <code>host_vars</code> מגדיר משתנים לשרת ספציפי בלבד', 'אלו שני שמות לאותו מנגנון בדיוק', '<code>host_vars</code> חל על כל השרתים, <code>group_vars</code> רק על שרת יחיד', 'שניהם עובדים רק בפורמט INI'],
      a: 0,
      w: '<code>group_vars/webservers.yml</code> חל על כל השרתים בקבוצת webservers, בעוד <code>host_vars/web1.example.com.yml</code> חל רק על שרת ספציפי אחד - ומקבל עדיפות גבוהה יותר במקרה של התנגשות.'
    },
    {
      q: 'מהו Playbook?',
      o: ['קובץ YAML המתאר רצף של Plays, כאשר כל Play מגדיר hosts ורשימת Tasks להרצה', 'קובץ INI המכיל רק את רשימת השרתים', 'סקריפט Python שרץ ישירות על השרת המנוהל', 'שם נרדף למודול בודד כמו <code>apt</code>'],
      a: 0,
      w: 'Playbook הוא "מתכון האוטומציה" המרכזי - קובץ YAML עם רשימת Plays, וכל Play מגדיר על אילו hosts להריץ ואילו Tasks לבצע עליהם.'
    },
    {
      q: 'מה עושה <code>gather_facts</code> בתחילת Play?',
      o: ['אוסף מידע אוטומטי על השרת המנוהל (מערכת הפעלה, IP, זיכרון) לפני הרצת ה-Tasks', 'מוחק את כל השרתים שאינם זמינים מה-Inventory', 'מריץ בדיקת syntax על ה-Playbook', 'מצפין את כל המשתנים הרגישים'],
      a: 0,
      w: 'כברירת מחדל Ansible אוסף Facts (כמו <code>ansible_facts[\'distribution\']</code>) בתחילת כל Play - מידע ששימושי לתנאים (<code>when</code>) ולתבניות. אפשר לבטל עם <code>gather_facts: false</code> לחיסכון בזמן.'
    },
    {
      q: 'מתי Handler בפועל ירוץ?',
      o: ['רק פעם אחת, בסוף ה-Play, ורק אם Task כלשהו קרא לו עם <code>notify</code> וגם ביצע שינוי בפועל', 'בכל פעם שמופיע <code>notify</code> באיזשהו Task', 'מיד כשמגיעים אליו בקובץ ה-YAML', 'רק אם מריצים עם הדגל <code>--force-handlers</code>'],
      a: 0,
      w: 'גם אם כמה Tasks שונים קוראים ל-<code>notify</code> לאותו handler באותו Play, הוא ירוץ פעם אחת בלבד בסוף ה-Play - ורק אם לפחות אחד מה-Tasks שקרא לו דיווח <code>changed</code>.'
    },
    {
      q: 'מה ההבדל בין <code>vars</code> ל-<code>vars_files</code> ב-Play?',
      o: ['<code>vars</code> מגדיר משתנים ישירות בתוך ה-Playbook; <code>vars_files</code> טוען אותם מקובץ YAML חיצוני', '<code>vars_files</code> עובד רק עם קבצי Vault מוצפנים', 'אין הבדל מעשי בין השניים', '<code>vars</code> יכול להגדיר רק מספרים, לא מחרוזות'],
      a: 0,
      w: '<code>vars</code> נוח למשתנים קטנים ומקומיים לתוך אותו קובץ, בעוד <code>vars_files</code> שימושי כשרוצים להפריד קונפיגורציה ארוכה (כמו <code>vars/app_config.yml</code>) לקובץ נפרד וניתן לשימוש חוזר.'
    },
    {
      q: 'מהו FQCN (Fully Qualified Collection Name)?',
      o: ['שם מלא של מודול שכולל את שם ה-Collection, למשל <code>ansible.builtin.apt</code>, שמונע התנגשויות שמות', 'קיצור למספר גרסת Ansible', 'שם הקובץ הראשי של כל Role', 'פורמט הצפנה של Ansible Vault'],
      a: 0,
      w: 'שימוש ב-FQCN במקום סתם <code>apt</code> הוא Best Practice מודרני - הוא מבטיח בבירור מאיזו Collection המודול מגיע, וחשוב כשמותקנות כמה Collections שמכילות מודולים בעלי שם דומה.'
    },
    {
      q: 'מה עושה הדגל <code>--check</code> בהרצת <code>ansible-playbook</code>?',
      o: ['מריץ "יבש" (Dry Run) בלי לבצע שינויים בפועל בשרתים, רק מדמה מה היה קורה', 'מריץ בדיקת syntax בלבד ולא מתחבר לשרתים כלל', 'מוחק את כל השינויים הקודמים שבוצעו', 'מריץ את ה-Playbook פעמיים לבדיקת אידמפוטנטיות'],
      a: 0,
      w: '<code>--check</code> הוא כלי קריטי לפני הרצה על פרודקשן - הוא מדמה את ההרצה ומדווח אילו Tasks היו משנים משהו, בלי לגעת בפועל בשרתים. שילוב נפוץ הוא <code>--check --diff</code> להצגת השינוי המדויק.'
    },
    {
      q: 'מהו Role ולמה משתמשים בו?',
      o: ['מבנה תיקיות סטנדרטי לארגון קוד Ansible (tasks, handlers, templates, vars) ליחידה עצמאית לשימוש חוזר', 'קובץ בודד שמכיל את כל ה-Inventory', 'שם אחר ל-Playbook יחיד', 'מודול מיוחד לניהול הרשאות משתמשים בלבד'],
      a: 0,
      w: 'Role הופך Playbooks ענקיים לקוד מודולרי וקריא - כל Role (למשל <code>nginx</code>) מכיל את כל מה שצריך: Tasks, Handlers, Templates, ברירות מחדל, ואפשר להשתמש בו חוזר בפרויקטים שונים.'
    },
    {
      q: 'מה ההבדל בין <code>defaults/main.yml</code> ל-<code>vars/main.yml</code> בתוך Role?',
      o: ['<code>defaults</code> הם ברירות מחדל בעדיפות נמוכה שקל לדרוס; <code>vars</code> הם בעדיפות גבוהה יותר ופחות מיועדים לדריסה', '<code>vars/main.yml</code> תמיד מוצפן אוטומטית', 'אין שום הבדל בעדיפות בין השניים', '<code>defaults</code> תומך רק במספרים, <code>vars</code> תומך בכל סוג נתון'],
      a: 0,
      w: 'שימו <code>defaults</code> לכל דבר שהמשתמש צפוי לדרוס בקלות (כמו פורט), ו-<code>vars</code> לדברים שלא אמורים להשתנות (כמו נתיבי מערכת) - <code>vars/main.yml</code> גובר על <code>defaults/main.yml</code> בסדר העדיפויות.'
    },
    {
      q: 'מהו Ansible Vault?',
      o: ['כלי מובנה להצפנת מידע רגיש (סיסמאות, מפתחות API) כדי שניתן יהיה לשמור אותו בבטחה ב-Git', 'שירות ענן חיצוני לאחסון Playbooks', 'מודול לניהול firewall בלבד', 'מנגנון לגיבוי אוטומטי של ה-Inventory'],
      a: 0,
      w: 'Vault מצפין קבצי YAML שלמים או ערכים בודדים (<code>encrypt_string</code>), כך שאפשר לשמור סודות בבטחה ב-Repository בלי לחשוף אותם בטקסט גלוי.'
    },
    {
      q: 'מה עושה <code>loop</code> ב-Task?',
      o: ['מריץ את אותו Task פעם אחת עבור כל פריט ברשימה שסופקה', 'מריץ את כל ה-Playbook מספר פעמים', 'יוצר לולאה אינסופית עד לתנאי עצירה', 'מגדיר לכמה שרתים במקביל (forks) להריץ'],
      a: 0,
      w: 'למשל <code>loop: [git, curl, vim]</code> יגרום ל-Task להתבצע 3 פעמים - פעם אחת עבור כל ערך, כאשר הערך הנוכחי זמין דרך <code>{{ item }}</code>.'
    },
    {
      q: 'מה ההבדל בין מודול <code>command</code> למודול <code>shell</code>?',
      o: ['<code>command</code> מריץ פקודה ישירות בלי shell (בטוח יותר); <code>shell</code> מריץ דרך shell ותומך בצינורות (pipes) והפניות (<code>|</code>, <code>&gt;</code>)', 'הם בדיוק אותו מודול תחת שני שמות', '<code>shell</code> הוא idempotent, <code>command</code> לא', '<code>command</code> עובד רק על Windows'],
      a: 0,
      w: '<code>command</code> עדיף כברירת מחדל כי הוא לא עובר דרך shell (פחות חשוף להזרקת פקודות), אבל אם צריך pipes/redirects/משתני סביבה חייבים להשתמש ב-<code>shell</code>.'
    },
    {
      q: 'מה עושה <code>register</code> ב-Task?',
      o: ['שומר את תוצאת ההרצה של Task במשתנה, לשימוש ב-Tasks הבאים באותו Play', 'רושם את ה-Task ביומן ה-Git', 'מגדיר משתנה קבוע לכל ה-Inventory', 'יוצר גיבוי אוטומטי של הקובץ שהשתנה'],
      a: 0,
      w: '<code>register: result</code> שומר פרטים כמו <code>stdout</code>, <code>rc</code> ו-<code>changed</code> במשתנה <code>result</code>, שניתן להשתמש בו בהמשך ה-Play (למשל בתנאי <code>when</code> או ב-<code>debug</code>).'
    }
  ];

  /* ============================================================
     מצב 2 - ניחוש תוצאת הרצה: קטע Playbook YAML + מה יקרה בהרצה
     ============================================================ */
  var RUN_GUESS = [
    {
      code: '- name: התקנת nginx\n  ansible.builtin.apt:\n    name: nginx\n    state: present',
      q: 'הרצתם את ה-Task הזה פעמיים ברציפות על אותו שרת, כשבפעם הראשונה nginx לא היה מותקן. מה יקרה בהרצה השנייה?',
      o: ['ההרצה השנייה תדווח <code>ok</code> (changed: false) - nginx כבר מותקן, לא מתבצע שינוי נוסף', 'nginx יותקן מחדש בכל הרצה, גם אם כבר מותקן', 'ההרצה השנייה תיכשל כי nginx כבר קיים', 'הפעולה תסיר את nginx ותתקין אותו מחדש'],
      a: 0,
      w: 'זו אידמפוטנטיות במלוא הדרה: מודול <code>apt</code> בודק קודם אם החבילה כבר במצב <code>present</code>, וברגע שכן - הוא לא נוגע במערכת ומדווח <code>ok</code> בלבד.'
    },
    {
      code: '- name: התקנת nginx רק באובונטו\n  ansible.builtin.apt:\n    name: nginx\n    state: present\n  when: ansible_facts[\'distribution\'] == "Ubuntu"',
      q: 'הרצתם Playbook זה מול שרת עם <code>ansible_facts[\'distribution\']</code> השווה ל-"CentOS". מה יקרה ל-Task?',
      o: ['ה-Task ידלג (<code>skipped</code>) על השרת, כי התנאי ב-<code>when</code> לא מתקיים', 'ה-Task ירוץ בכל מקרה, כי <code>apt</code> מותקן על כל מערכת הפעלה', 'ה-Playbook כולו יעצור בשגיאה', 'ה-Task ירוץ אך ידווח על כישלון (failed)'],
      a: 0,
      w: 'תנאי <code>when</code> שלא מתקיים גורם ל-Ansible לדלג על ה-Task לחלוטין עבור אותו שרת - הוא מסומן <code>skipped</code> בפלט, לא <code>failed</code> ולא <code>changed</code>.'
    },
    {
      code: 'tasks:\n  - name: עדכון קובץ קונפיגורציה\n    ansible.builtin.template:\n      src: nginx.conf.j2\n      dest: /etc/nginx/nginx.conf\n    notify: restart nginx\n\nhandlers:\n  - name: restart nginx\n    ansible.builtin.service:\n      name: nginx\n      state: restarted',
      q: 'הרצתם את ה-Playbook פעמיים ברצף, ובהרצה השנייה קובץ ה-conf שנוצר זהה לחלוטין לקודם (אין שינוי). האם ה-handler <code>restart nginx</code> ירוץ בהרצה השנייה?',
      o: ['לא - handler מופעל רק אם ה-Task שקרא לו דיווח <code>changed</code>, ובהרצה השנייה אין שינוי', 'כן - handler תמיד רץ בכל הרצה, בלי קשר לשינוי', 'כן, אבל רק אם מוסיפים <code>--force-handlers</code>', 'לא ניתן לדעת בלי להריץ בפועל'],
      a: 0,
      w: '<code>notify</code> "מסמן" handler להרצה, אבל הוא בפועל ירוץ רק אם לפחות Task אחד שקרא לו דיווח שינוי אמיתי. קובץ זהה = <code>template</code> מדווח <code>ok</code>, ולכן ה-handler לא מופעל.'
    },
    {
      code: '- name: התקנת חבילות\n  ansible.builtin.apt:\n    name: "{{ item }}"\n    state: present\n  loop:\n    - git\n    - curl\n    - vim',
      q: 'כמה פעמים ה-Task הזה ירוץ בפועל (כמה שורות תוצאה יופיעו בלוג) עבור שרת יחיד?',
      o: ['3 פעמים - פעם אחת לכל פריט ברשימת ה-<code>loop</code> (git, curl, vim)', 'פעם אחת בלבד, עם כל שלוש החבילות יחד', '0 פעמים, כי <code>loop</code> דורש משתנה נפרד לכל פריט', '9 פעמים - 3 חבילות כפול 3 ניסיונות ברירת מחדל'],
      a: 0,
      w: '<code>loop</code> מריץ את אותו Task פעם נפרדת לכל ערך ברשימה, כאשר <code>{{ item }}</code> מקבל בכל איטרציה את הערך המתאים - כאן 3 איטרציות, שלוש שורות תוצאה נפרדות.'
    },
    {
      code: '- block:\n    - name: התקנת חבילה קריטית\n      ansible.builtin.apt:\n        name: nonexistent-package-xyz\n        state: present\n  rescue:\n    - name: שליחת התראה\n      ansible.builtin.debug:\n        msg: "ההתקנה נכשלה!"',
      q: 'החבילה <code>nonexistent-package-xyz</code> לא קיימת במאגר, וההתקנה נכשלת. מה יקרה בפועל?',
      o: ['ה-Task ב-<code>block</code> ייכשל, ה-<code>rescue</code> ירוץ במקום להפסיק את כל ה-Play, ותוצג ההודעה "ההתקנה נכשלה!"', 'כל ה-Playbook יעצור מיד בלי להריץ שום דבר נוסף', 'ה-<code>rescue</code> ירוץ בכל מקרה, גם אם ההתקנה מצליחה', 'Ansible ינסה להתקין את החבילה שוב אוטומטית 3 פעמים'],
      a: 0,
      w: '<code>block/rescue</code> מתנהג כמו try/except - כישלון בתוך ה-block "נתפס" על ידי ה-rescue, וה-Play ממשיך לרוץ הלאה במקום לעצור לגמרי כמו שהיה קורה בלי rescue.'
    },
    {
      code: '- hosts: dbservers\n  vars_files:\n    - vars/secrets.yml   # מוצפן ב-Vault\n  tasks:\n    - name: יצירת משתמש DB\n      community.mysql.mysql_user:\n        name: app_user\n        password: "{{ db_password }}"',
      q: 'מריצים <code>ansible-playbook site.yml</code> בלי <code>--ask-vault-pass</code> ובלי <code>vault_password_file</code> מוגדר ב-<code>ansible.cfg</code>. מה יקרה?',
      o: ['ההרצה תיכשל עם שגיאת פענוח (Vault password לא סופקה) - Ansible לא יכול לטעון את secrets.yml', 'ה-Playbook ירוץ בהצלחה עם db_password ריק', 'הקובץ יפוענח אוטומטית ללא סיסמה', 'ה-task יידלג בשקט (skipped)'],
      a: 0,
      w: 'קובץ מוצפן ב-Vault דורש סיסמה כדי להיטען כ-<code>vars_files</code>. בלי לספק אותה (<code>--ask-vault-pass</code> או <code>--vault-password-file</code>), ההרצה נכשלת מיד עם שגיאת "Attempting to decrypt".'
    },
    {
      code: '- name: בדיקת קובץ קיים\n  ansible.builtin.stat:\n    path: /opt/app/.installed\n  register: installed_check\n\n- name: הרצת סקריפט התקנה\n  ansible.builtin.command: /opt/app/install.sh\n  when: not installed_check.stat.exists',
      q: 'הקובץ <code>/opt/app/.installed</code> כבר קיים בשרת. מה יקרה ל-Task השני?',
      o: ['ה-Task ידלג (<code>skipped</code>), כי <code>installed_check.stat.exists</code> הוא <code>true</code> ולכן <code>not ...</code> הופך ל-<code>false</code>', 'ה-Task ירוץ בכל מקרה, כי <code>register</code> לא משפיע על <code>when</code>', 'ה-Playbook ייכשל בשגיאת תחביר', 'הקובץ .installed יימחק אוטומטית לפני ההרצה'],
      a: 0,
      w: 'מודול <code>stat</code> בודק אם קובץ קיים ושומר את התוצאה תחת <code>installed_check.stat.exists</code>. כשזה <code>true</code>, התנאי <code>not installed_check.stat.exists</code> שווה <code>false</code> וה-Task השני מדולג.'
    },
    {
      code: 'tasks:\n  - name: התקנת nginx\n    ansible.builtin.apt:\n      name: nginx\n      state: present\n    tags: [install]\n  - name: הגדרת firewall\n    community.general.ufw:\n      rule: allow\n      port: \'80\'\n    tags: [security]',
      q: 'מריצים <code>ansible-playbook site.yml --tags "security"</code>. אילו Tasks ירוצו בפועל?',
      o: ['רק "הגדרת firewall" (tag security) - "התקנת nginx" (tag install) ידלג', 'שני ה-Tasks ירוצו כרגיל, כי --tags רק מוסיף מידע לפלט', 'רק "התקנת nginx" ירוץ, כי הוא מופיע ראשון', 'אף Task לא ירוץ, כי לא הוגדר tag בשם "all"'],
      a: 0,
      w: '<code>--tags</code> מסנן ומריץ רק Tasks עם ה-tag שצוין (או שאין להם tags כלל). כאן רק "הגדרת firewall" תואם ל-<code>security</code>, ולכן רק הוא ירוץ.'
    },
    {
      code: '$ ansible-playbook site.yml --check --diff',
      q: 'מה ההשפעה בפועל של הדגלים <code>--check --diff</code> על השרתים?',
      o: ['שום שינוי אמיתי לא מתבצע בשרתים - Ansible רק מציג מה היה משתנה (Dry Run + diff מפורט)', 'ה-Playbook רץ באופן מלא, ורק לאחר מכן מציג דוח שינויים', '--check מבצע את השינויים אך --diff מבטל אותם בחזרה', 'הפקודה דורשת אישור ידני נפרד לכל Task'],
      a: 0,
      w: '<code>--check</code> מריץ סימולציה בלבד בלי לגעת בשרתים, ו-<code>--diff</code> מוסיף תצוגת שינוי מפורטת (למשל שורות שהיו משתנות בקובץ) - שילוב סטנדרטי לפני הרצה על פרודקשן.'
    },
    {
      code: '- name: הרצת פקודה שעלולה להיכשל\n  ansible.builtin.command: /opt/scripts/cleanup.sh\n  ignore_errors: true\n\n- name: המשך ריצה\n  ansible.builtin.debug:\n    msg: "ממשיכים גם אם הניקוי נכשל"',
      q: 'סקריפט <code>cleanup.sh</code> נכשל (exit code שונה מ-0). מה יקרה להמשך ה-Play?',
      o: ['ה-Play ימשיך ל-Task הבא בזכות <code>ignore_errors: true</code>, אך ה-Task הראשון עדיין יסומן <code>failed</code> בסיכום', 'כל ה-Play יעצור מיד, כי <code>command</code> תמיד עוצר על כישלון', 'ה-Task הראשון "יתוקן" אוטומטית ולא יסומן ככישלון כלל', 'ignore_errors מדלג על ה-Task השני גם כן'],
      a: 0,
      w: '<code>ignore_errors: true</code> מונע מכישלון Task מסוים לעצור את כל ה-Play - ההרצה ממשיכה, אך הכישלון עדיין נרשם ומופיע בסיכום הסופי (recap) בצבע אדום.'
    },
    {
      code: '- name: פריסה הדרגתית\n  hosts: webservers\n  serial: 2\n  tasks:\n    - name: עדכון קוד\n      ansible.builtin.git:\n        repo: \'https://github.com/example/app.git\'\n        dest: /opt/app\n        version: main',
      q: 'קבוצת <code>webservers</code> מכילה 6 שרתים. כמה שרתים יעודכנו בו-זמנית בכל "גל" של ההרצה?',
      o: ['2 שרתים בו-זמנית בכל גל (Batch) - <code>serial: 2</code> מריץ את כל ה-Play על 2 שרתים לפני שעובר לשניים הבאים', 'כל 6 השרתים בו-זמנית, כי <code>serial</code> לא משפיע על מקביליות', 'שרת אחד בכל פעם בלבד, בלי קשר לערך שהוגדר', '3 גלים של 6 שרתים כל אחד'],
      a: 0,
      w: '<code>serial</code> שולט על פריסה הדרגתית (Rolling Deployment) - עם <code>serial: 2</code> מתוך 6 שרתים, ה-Play ירוץ במלואו על 2 השרתים הראשונים, ורק אז יעבור לזוג הבא, וכן הלאה.'
    },
    {
      code: '- name: הקשחת SSH\n  ansible.builtin.lineinfile:\n    path: /etc/ssh/sshd_config\n    regexp: \'^PermitRootLogin\'\n    line: \'PermitRootLogin no\'',
      q: 'הרצתם את ה-Task הזה פעמיים ברציפות, כשבפעם הראשונה השורה השתנתה בהצלחה. מה יראה הפלט בהרצה השנייה?',
      o: ['<code>ok</code> (changed: false) - <code>lineinfile</code> רואה שהשורה כבר תואמת בדיוק למבוקש ולא נוגע בקובץ שוב', '<code>changed: true</code> בכל הרצה, כי <code>lineinfile</code> תמיד כותב מחדש את הקובץ', 'שגיאה, כי אי אפשר להריץ <code>lineinfile</code> פעמיים על אותו קובץ', 'הקובץ יימחק ויכתב מחדש מאפס'],
      a: 0,
      w: '<code>lineinfile</code> הוא מודול אידמפוטנטי קלאסי - הוא בודק אם השורה התואמת ל-<code>regexp</code> כבר זהה ל-<code>line</code> המבוקש, ואם כן לא נוגע בקובץ כלל בהרצה החוזרת.'
    }
  ];

  /* ============================================================
     מצב 3 - השלמת Playbook / CLI: קטע עם חלק חסר (___)
     ============================================================ */
  var CMD_COMPLETE = [
    {
      code: '$ ansible all -i inventory.ini -m ___',
      q: 'מה משלים את הפקודה לבדיקת קישוריות בסיסית לכל השרתים ב-Inventory?',
      o: ['<code>ping</code>', '<code>setup</code>', '<code>command</code>', '<code>debug</code>'],
      a: 0,
      w: 'מודול <code>ping</code> (לא ping ברשת - מודול Ansible ייעודי) בודק שאפשר להתחבר לשרת ולהריץ עליו קוד Python, ומחזיר <code>pong</code> בהצלחה.'
    },
    {
      code: '- name: התקנת nginx\n  ansible.builtin.apt:\n    name: nginx\n    state: ___',
      q: 'מה משלים את <code>state</code> כדי לוודא שהחבילה מותקנת (בכל גרסה קיימת), בלי לאלץ עדכון לגרסה החדשה ביותר?',
      o: ['<code>present</code>', '<code>latest</code>', '<code>installed_only</code>', '<code>enabled</code>'],
      a: 0,
      w: '<code>present</code> מוודא שהחבילה מותקנת בכלשהי גרסה. <code>latest</code> לעומת זאת יעדכן את החבילה בכל הרצה אם קיימת גרסה חדשה יותר - וזה עלול לגרום ל-<code>changed</code> מיותר.'
    },
    {
      code: '$ ansible-playbook site.yml ___',
      q: 'מה משלים את הפקודה כדי להריץ רק על שרת בודד (<code>web1.example.com</code>) מתוך קבוצה גדולה יותר?',
      o: ['<code>--limit web1.example.com</code>', '<code>--hosts web1.example.com</code>', '<code>--only web1.example.com</code>', '<code>--filter web1.example.com</code>'],
      a: 0,
      w: '<code>--limit</code> מצמצם את ההרצה לתת-קבוצה מתוך ה-<code>hosts</code> שמוגדרים ב-Play, בלי לשנות את ה-Playbook עצמו - שימושי לבדיקה על שרת אחד לפני הרצה מלאה.'
    },
    {
      code: 'tasks:\n  - name: עדכון קובץ קונפיגורציה\n    ansible.builtin.template:\n      src: nginx.conf.j2\n      dest: /etc/nginx/nginx.conf\n    ___: restart nginx',
      q: 'מה משלים את ה-Task כדי להפעיל handler בשם <code>restart nginx</code> רק אם בוצע שינוי בפועל?',
      o: ['<code>notify</code>', '<code>register</code>', '<code>listen</code>', '<code>tags</code>'],
      a: 0,
      w: '<code>notify</code> "מודיע" לשם ה-handler שיש להריץ אותו בסוף ה-Play - אבל זה יקרה בפועל רק אם ה-Task הזה דיווח <code>changed</code>.'
    },
    {
      code: '$ ansible-vault ___ secrets.yml',
      q: 'מה משלים את הפקודה כדי לצפות בתוכן קובץ מוצפן, בלי לפענח אותו לצמיתות בדיסק?',
      o: ['<code>view</code>', '<code>decrypt</code>', '<code>edit</code>', '<code>show</code>'],
      a: 0,
      w: '<code>ansible-vault view</code> מציג את התוכן המפוענח זמנית במסך בלבד. לעומת זאת <code>decrypt</code> כותב את הקובץ בחזרה כטקסט גלוי על הדיסק - סיכון אבטחה אם שוכחים להצפין מחדש.'
    },
    {
      code: '- name: יצירת מספר משתמשים\n  ansible.builtin.user:\n    name: "{{ item }}"\n  ___:\n    - alice\n    - bob\n    - carol',
      q: 'מה משלים את ה-Task כדי להריץ אותו פעם אחת לכל שם ברשימה?',
      o: ['<code>loop</code>', '<code>with</code>', '<code>each</code>', '<code>foreach</code>'],
      a: 0,
      w: '<code>loop</code> הוא התחביר המודרני המומלץ לאיטרציה על רשימה - עבור כל ערך, ה-Task רץ מחדש כאשר <code>{{ item }}</code> מקבל את הערך הנוכחי.'
    },
    {
      code: '$ ansible-playbook site.yml --vault-password-file ___',
      q: 'מה משלים את הפקודה נכון כדי להצביע על קובץ המכיל את סיסמת ה-Vault?',
      o: ['<code>~/.vault_pass.txt</code>', '<code>--ask-vault-pass</code>', '<code>vault.yml</code>', '<code>secrets.yml</code>'],
      a: 0,
      w: '<code>--vault-password-file</code> מקבל נתיב לקובץ טקסט המכיל את הסיסמה עצמה (לא את הקובץ המוצפן!) - שימושי לאוטומציה ב-CI/CD בלי הזנה ידנית.'
    },
    {
      code: '- name: פריסת שרת Web\n  hosts: webservers\n  ___:\n    - nginx\n    - app_deploy',
      q: 'מה משלים את ה-Play כדי להריץ עליו Roles בשם <code>nginx</code> ו-<code>app_deploy</code>?',
      o: ['<code>roles</code>', '<code>tasks</code>', '<code>includes</code>', '<code>imports</code>'],
      a: 0,
      w: '<code>roles</code> ברמת ה-Play מריץ אוטומטית את כל ה-Tasks, Handlers ומשתני ה-Defaults של כל Role שצוין, לפי הסדר שהם רשומים ברשימה.'
    },
    {
      code: '[production:___]\nfrontend\nbackend',
      q: 'מה משלים את קובץ ה-Inventory (INI) כדי להגדיר ש-<code>production</code> מכיל את הקבוצות <code>frontend</code> ו-<code>backend</code>?',
      o: ['<code>children</code>', '<code>vars</code>', '<code>hosts</code>', '<code>group</code>'],
      a: 0,
      w: '<code>[production:children]</code> יוצר קבוצת-על שמאגדת קבוצות אחרות - כך אפשר להריץ <code>ansible production</code> ולפעול על כל השרתים מ-frontend ו-backend גם יחד.'
    },
    {
      code: '- name: וידוא ש-nginx פעיל ועולה אוטומטית\n  ansible.builtin.service:\n    name: nginx\n    state: started\n    ___: true',
      q: 'מה משלים את ה-Task כדי שהשירות גם יופעל אוטומטית עם אתחול השרת (boot)?',
      o: ['<code>enabled</code>', '<code>autostart</code>', '<code>boot</code>', '<code>persist</code>'],
      a: 0,
      w: '<code>state: started</code> מוודא שהשירות פעיל *כרגע*, ואילו <code>enabled: true</code> מוודא שהוא גם יעלה אוטומטית אחרי restart לשרת - שני היבטים נפרדים.'
    },
    {
      code: '$ ansible-galaxy ___ roles/nginx',
      q: 'מה משלים את הפקודה כדי ליצור מבנה תיקיות סטנדרטי חדש ל-Role בשם nginx?',
      o: ['<code>init</code>', '<code>create</code>', '<code>new</code>', '<code>install</code>'],
      a: 0,
      w: '<code>ansible-galaxy init roles/nginx</code> יוצר אוטומטית את כל תיקיות ה-Role המומלצות: <code>tasks/</code>, <code>handlers/</code>, <code>templates/</code>, <code>defaults/</code>, <code>vars/</code>, <code>meta/</code> ועוד.'
    },
    {
      code: '- name: הרצת סקריפט התקנה רק אם עוד לא הותקן\n  ansible.builtin.command: /opt/myapp/install.sh\n  args:\n    ___: /opt/myapp/.installed',
      q: 'מה משלים את ה-<code>args</code> כדי להריץ את הפקודה רק אם הקובץ <code>/opt/myapp/.installed</code> עדיין לא קיים?',
      o: ['<code>creates</code>', '<code>unless</code>', '<code>removes</code>', '<code>exists</code>'],
      a: 0,
      w: '<code>creates</code> הופך Task מבוסס <code>command</code> לאידמפוטנטי - Ansible בודק אם הקובץ שצוין כבר קיים, ואם כן מדלג על הרצת הפקודה ומדווח <code>ok</code> במקום להריץ אותה שוב.'
    }
  ];

  /* ============================================================
     מצב 4 - התאמת מושגים: סבבים של זוגות מונח + תיאור
     ============================================================ */
  var MATCH_ROUNDS = [
    {
      title: 'רכיבי ליבה',
      pairs: [
        { l: 'Inventory', r: 'רשימת השרתים המנוהלים, מקובצים לקבוצות לוגיות' },
        { l: 'Playbook', r: 'קובץ YAML שמתאר רצף Plays, כל אחד עם hosts ו-Tasks' },
        { l: 'Module', r: 'יחידת קוד שמבצעת פעולה ספציפית אחת, כמו התקנת חבילה' },
        { l: 'Role', r: 'מבנה תיקיות סטנדרטי לארגון קוד Ansible לשימוש חוזר' },
        { l: 'Collection', r: 'חבילה שמכילה Modules, Roles ו-Plugins יחד להפצה דרך Galaxy' }
      ]
    },
    {
      title: 'מפתחות ברמת Task',
      pairs: [
        { l: '<code>when</code>', r: 'תנאי שקובע אם ה-Task ירוץ בכלל על אותו שרת' },
        { l: '<code>loop</code>', r: 'מריץ את אותו Task פעם אחת לכל פריט ברשימה' },
        { l: '<code>notify</code>', r: 'מפעיל handler בסוף ה-Play, רק אם היה שינוי בפועל' },
        { l: '<code>register</code>', r: 'שומר את תוצאת ה-Task במשתנה לשימוש בהמשך' },
        { l: '<code>tags</code>', r: 'מאפשר להריץ רק חלק מה-Playbook לפי שם מוגדר מראש' }
      ]
    },
    {
      title: 'Vault ואבטחה',
      pairs: [
        { l: '<code>ansible-vault encrypt</code>', r: 'מצפין קובץ קיים במלואו' },
        { l: '<code>ansible-vault encrypt_string</code>', r: 'מצפין ערך בודד, בלי להצפין קובץ שלם' },
        { l: '<code>--ask-vault-pass</code>', r: 'מבקש הזנת סיסמת Vault ידנית בזמן ההרצה' },
        { l: '<code>no_log: true</code>', r: 'מסתיר פלט רגיש של Task מהלוג' },
        { l: '<code>vault_password_file</code>', r: 'קובץ המכיל את סיסמת ה-Vault, לשימוש אוטומטי בהרצה' }
      ]
    },
    {
      title: 'Roles ומבנה תיקיות',
      pairs: [
        { l: '<code>defaults/main.yml</code>', r: 'ברירות מחדל בעדיפות נמוכה, קל לדרוס' },
        { l: '<code>vars/main.yml</code>', r: 'משתנים קבועים בעדיפות גבוהה יותר מ-defaults' },
        { l: '<code>handlers/main.yml</code>', r: 'הגדרת ה-handlers של ה-Role' },
        { l: '<code>meta/main.yml</code>', r: 'מטא-דאטה ותלויות (dependencies) בין Roles' },
        { l: '<code>templates/</code>', r: 'קבצי Jinja2 (סיומת .j2) לבניית תוכן דינמי' }
      ]
    }
  ];

  /* ============================================================
     מצב 5 - סידור תהליך: סבבים של שלבים שצריך לסדר בסדר הנכון
     ============================================================ */
  var ORDER_ROUNDS = [
    {
      title: 'בניית Role חדש מאפס ועד הרצה',
      steps: [
        'הרצת ansible-galaxy init roles/nginx ליצירת מבנה התיקיות הסטנדרטי',
        'הגדרת ברירות מחדל ב-roles/nginx/defaults/main.yml',
        'כתיבת ה-Tasks ב-roles/nginx/tasks/main.yml',
        'הוספת handler להפעלה מחדש ב-roles/nginx/handlers/main.yml',
        'הפעלת ה-Role מתוך Playbook עם roles: - nginx',
        'הרצת ansible-playbook עם --check לבדיקה לפני הרצה אמיתית'
      ]
    },
    {
      title: 'מחזור חיים בסיסי - משינוי קוד ועד פרודקשן',
      steps: [
        'עריכת קובץ ה-Playbook או ה-Role',
        'הרצת ansible-playbook --syntax-check לבדיקת תחביר YAML',
        'הרצת ansible-playbook --check --diff (Dry Run) מול סביבת בדיקה',
        'הרצה אמיתית מול סביבת staging',
        'הרצה אמיתית מול production עם --limit לקבוצה ספציפית'
      ]
    },
    {
      title: 'טיפול בסודות עם Ansible Vault',
      steps: [
        'יצירת קובץ סודות עם ansible-vault create vars/secrets.yml',
        'הזנת ערכים רגישים (סיסמאות, מפתחות API) בעורך שנפתח',
        'שמירת הקובץ המוצפן ב-Git - בטוח, כי הוא כבר מוצפן',
        'הפניה למשתנים מתוך secrets.yml דרך vars_files ב-Playbook',
        'הרצת ansible-playbook עם --ask-vault-pass או --vault-password-file'
      ]
    },
    {
      title: 'אבחון ותיקון Playbook שנכשל',
      steps: [
        'הרצת ansible-playbook --syntax-check לוודא שאין שגיאת YAML',
        'הרצת ansible-playbook --check --diff לצפייה מוקדמת בשינויים הצפויים',
        'איתור ה-Task שנכשל לפי הפלט האדום בטרמינל',
        'הרצה חוזרת עם -vvv לקבלת פלט דיבוג מפורט',
        'תיקון ה-Task ובדיקה חוזרת עם --start-at-task מה-Task הבעייתי',
        'הרצה מלאה סופית בלי --check לביצוע השינוי בפועל'
      ]
    }
  ];

  /* ============================================================
     הגדרת מצבי המשחק
     ============================================================ */
  var MODES = [
    { key: 'rapid', icon: '⚡', name: 'קרב מהיר', desc: 'שאלות ידע כלליות על Ansible - כמה תספיקו לפני שהזמן נגמר?', type: 'quiz', data: RAPID, sample: 8, time: 20000 },
    { key: 'run', icon: '🔎', name: 'ניחוש תוצאת הרצה', desc: 'קטע Playbook - מה בדיוק יקרה כשמריצים אותו?', type: 'quiz', data: RUN_GUESS, sample: 8, time: 28000, showCode: true },
    { key: 'cmd', icon: '🧩', name: 'השלמת פקודה', desc: 'קטע YAML או פקודת ansible עם חלק חסר - בחרו מה משלים אותו נכון', type: 'quiz', data: CMD_COMPLETE, sample: 8, time: 28000, showCode: true },
    { key: 'match', icon: '🔗', name: 'התאמת מושגים', desc: 'התאימו כל מונח/פקודת Ansible לתיאור הנכון שלו', type: 'match', data: MATCH_ROUNDS, sample: 2 },
    { key: 'order', icon: '📋', name: 'סידור תהליך', desc: 'סדרו את שלבי התהליך לפי הסדר הנכון', type: 'order', data: ORDER_ROUNDS, sample: 2 }
  ];

  window.TG_CONFIG = { gameId: "ansible", modes: MODES };
})();
</script>

<script src="/scripts/topic-game.js"></script>
