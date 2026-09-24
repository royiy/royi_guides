---
title: "שאלות ראיון עבודה מקיפות + טיפים וטריקים"
description: "אוסף שאלות ראיון עבודה על Ansible לרמות Junior עד Senior עם תשובות תמציתיות, תרחיש Scenario-Based, טבלת שגיאות נפוצות ורשימת טיפים לעבודה יומיומית."
category: DevOps/Ansible
part: 10/10
---

מדריך מסכם עם שאלות ראיון מדורגות לפי רמת קושי (Junior → Senior), כולל תשובות תמציתיות, ורשימת טיפים כלליים לעבודה יומיומית עם Ansible.

## שאלות בסיסיות (Junior)

<details class="qa">
<summary>1. מה זה Ansible ומה ההבדל בינו לבין Puppet/Chef?</summary>

Ansible הוא כלי אוטומציה Agentless המשתמש ב-SSH, מבוסס Push, ונכתב ב-YAML (הצהרתי). Puppet ו-Chef הם Agent-based, מבוססי Pull, ודורשים שפת DSL ייעודית (Ruby-based).

</details>

<details class="qa">
<summary>2. מהי אידמפוטנטיות (Idempotency)?</summary>

עיקרון לפיו הרצה חוזרת של אותה פעולה תמיד מביאה לאותה תוצאה סופית, ללא שינוי נוסף אם המערכת כבר במצב הרצוי. לדוגמה, הרצת `apt: name=nginx state=present` פעמיים לא תתקין את nginx פעמיים.

</details>

<details class="qa">
<summary>3. מה ההבדל בין Playbook ל-Ad-Hoc Command?</summary>

Ad-Hoc command היא פקודה בודדת חד-פעמית (`ansible all -m ping`), בעוד Playbook הוא קובץ YAML עם רצף Tasks מובנה, הניתן לשמירה, גרסאות ושימוש חוזר.

</details>

<details class="qa">
<summary>4. מה זה Inventory?</summary>

קובץ (או מקור דינמי) המפרט את השרתים המנוהלים וקיבוצם לקבוצות לוגיות.

</details>

<details class="qa">
<summary>5. מה ההבדל בין <code>command</code> ל-<code>shell</code> module?</summary>

`command` לא עובר דרך shell של המערכת (בטוח יותר, לא תומך ב-pipes/redirects/env vars), בעוד `shell` כן עובר דרך `/bin/sh` ותומך בכל התחביר של shell רגיל.

</details>

<details class="qa">
<summary>6. מה עושה הדגל <code>--check</code>?</summary>

מריץ Playbook ב-Dry Run — מציג מה *היה* משתנה בלי לבצע שינוי בפועל.

</details>

<details class="qa">
<summary>7. מהם Facts?</summary>

מידע אוטומטי שנאסף על השרת המנוהל בתחילת כל Play (OS, IP, זיכרון, דיסקים וכו') דרך מודול `setup`.

</details>

## שאלות בינוניות (Mid-Level)

<details class="qa">
<summary>8. הסבירו את סדר העדיפויות (Precedence) של משתנים ב-Ansible.</summary>

מהחלש לחזק בקצרה: role defaults → group_vars/all → group_vars/<group> → host_vars → facts → play vars → vars_files → set_fact/register → role vars → **extra vars (`-e`)** תמיד מנצחים.

</details>

<details class="qa">
<summary>9. מה ההבדל בין <code>include</code> ל-<code>import</code> (בכלליות)?</summary>

`import_*` הוא Static — מעובד ב"זמן קומפילציה" של ה-Playbook, לפני ההרצה. `include_*` הוא Dynamic — מעובד בזמן ריצה, ולכן תומך ב-`loop` ו-`when` שמוערך per-task.

</details>

<details class="qa">
<summary>10. מהם Handlers ומתי הם רצים בפועל?</summary>

Tasks מיוחדים שרצים רק פעם אחת, בסוף ה-Play, ורק אם Task שקרא ל-`notify` **גם ביצע שינוי בפועל** (status "changed").

</details>

<details class="qa">
<summary>11. איך מריצים Task פעם אחת בלבד גם אם ה-Playbook רץ על 50 שרתים?</summary>

```yaml
- name: הרצת migration פעם אחת
  ansible.builtin.command: /opt/app/migrate.sh
  run_once: true
  delegate_to: "{{ groups['dbservers'][0] }}"
```

</details>

<details class="qa">
<summary>12. מה זה <code>delegate_to</code>?</summary>

מאפשר להריץ Task על שרת אחר מזה שמוגדר ב-`hosts`, למשל להריץ פעולה על ה-Load Balancer בזמן שמעדכנים שרת Web.

</details>

<details class="qa">
<summary>13. איך מבטלים איסוף Facts ולמה זה משפר ביצועים?</summary>

`gather_facts: false` — חוסך את זמן ה-SSH connection הנוסף הנדרש לאיסוף מידע מקיף על כל שרת, שימושי כאשר ה-Playbook לא תלוי במידע זה.

</details>

<details class="qa">
<summary>14. מה זה Ansible Vault ואיך הוא עובד?</summary>

כלי הצפנה מובנה (AES256) לקבצי YAML/משתנים רגישים, המאפשר שמירתם ב-Git בבטחה. פענוח קורה רק בזמן ריצה עם סיסמה/קובץ סיסמה.

</details>

<details class="qa">
<summary>15. מה ההבדל בין Role ל-Collection?</summary>

Role הוא יחידת ארגון קוד בודדת (Tasks+Templates+Vars). Collection היא חבילת הפצה שיכולה להכיל מספר Roles, Modules, Plugins ו-Playbooks יחד, מותקנת דרך Ansible Galaxy.

</details>

## שאלות מתקדמות (Senior)

<details class="qa">
<summary>16. איך תבנו אסטרטגיית Rolling Deployment עם Zero Downtime?</summary>

שילוב של `serial` (עדכון תת-קבוצה בכל פעם), `max_fail_percentage`, הוצאת שרת מה-Load Balancer לפני עדכון, Health Check אחרי, והחזרה ל-LB רק בהצלחה.

</details>

<details class="qa">
<summary>17. מה ההבדל בין אסטרטגיית <code>linear</code>, <code>free</code> ו-<code>host_pinned</code>?</summary>

`linear` (ברירת מחדל) מסנכרן את כל השרתים בכל Task. `free` נותן לכל שרת להתקדם בקצב שלו ללא סנכרון. `host_pinned` דומה ל-free אך שומר worker קבוע לכל שרת (יעיל בזיכרון).

</details>

<details class="qa">
<summary>18. איך מטפלים בכישלון חלקי (Partial Failure) בפריסה על מספר שרתים?</summary>

שילוב `max_fail_percentage`, `any_errors_fatal`, ו-`block/rescue/always` לטיפול נקודתי, יחד עם מנגנון rollback (Git revert / previous release symlink).

</details>

<details class="qa">
<summary>19. מהו Execution Environment ולמה השימוש בו הכרחי בסביבות Enterprise?</summary>

קונטיינר Docker/Podman שמכיל את כל תלויות ה-Runtime (Python, Collections) הנדרשות להרצת Playbook, מבטיח שהרצה מה-CI תהיה זהה בדיוק להרצה מסביבת פיתוח - פותר בעיות "עובד אצלי במחשב".

</details>

<details class="qa">
<summary>20. איך תבנו Dynamic Inventory לענן היברידי (AWS + Azure יחד)?</summary>

שימוש במספר Inventory Plugins בו-זמנית בתוך תיקיית inventory (למשל `aws_ec2.yml` ו-`azure_rm.yml`), Ansible ימזג אוטומטית את התוצאות מכל הקבצים בתיקייה.

</details>

<details class="qa">
<summary>21. איך תבטיחו שסודות לא נחשפים בלוגים גם כשמשתמשים ב-<code>shell</code>/<code>command</code> המכילים סיסמה כפרמטר?</summary>

`no_log: true` על ה-Task הספציפי, יחד עם הימנעות מהעברת סיסמה כפרמטר command-line גלוי (עדיף environment variable או stdin).

</details>

<details class="qa">
<summary>22. מה ההבדל בין <code>ansible.cfg</code> ברמת פרויקט לזה שברמת מערכת (<code>/etc/ansible/ansible.cfg</code>)?</summary>

Ansible טוען קונפיגורציה לפי סדר עדיפויות: `ANSIBLE_CONFIG` env var → `./ansible.cfg` (בתיקייה מהם מריצים) → `~/.ansible.cfg` → `/etc/ansible/ansible.cfg`. קובץ פרויקט מאפשר לכל Repository הגדרות עצמאיות בלי להשפיע על שאר המערכת.

</details>

<details class="qa">
<summary>23. כיצד תבצעו Testing אוטומטי ל-Roles לפני מיזוג ל-main?</summary>

שילוב `ansible-lint` לבדיקת סטייל וטעויות נפוצות, ו-**Molecule** להרצת ה-Role בפועל בתוך קונטיינר/VM ובדיקת מצב סופי (verify) - הכל כ-Gate ב-CI Pipeline.

</details>

<details class="qa">
<summary>24. מה קורה כאשר Task נכשל באמצע Play על 100 שרתים - איך Ansible מתנהג?</summary>

כברירת מחדל Ansible מסמן את השרת שנכשל כ-"failed" ומוציא אותו מהמשך ה-Play (שאר ה-Tasks על אותו שרת יידלגו), אך ממשיך להריץ על שאר השרתים, אלא אם הוגדר `any_errors_fatal: true` שעוצר את כולם מיידית.

</details>

<details class="qa">
<summary>25. איך תבנו Playbook שמתאים גם ל-Ubuntu וגם ל-RHEL בלי כפילות קוד?</summary>

שימוש במודול `package` הגנרי, או `when: ansible_facts['os_family'] == "Debian"` לבחירת מודול ספציפי, לעיתים בשילוב עם `vars_files` דינמיים בהתאם ל-`ansible_facts['os_family']` (`include_vars: "{{ ansible_facts['os_family'] }}.yml"`).

</details>

## סימולציית תרחיש (Scenario-Based) - נפוץ בראיונות Senior

> **שאלה:** "יש לך Playbook שרץ על 50 שרתי Production. באמצע הריצה, שרת אחד נופל בגלל timeout ברשת. מה קורה, ואיך היית מעצב את ה-Playbook כדי שזה לא יעצור את כל התהליך?"

**תשובה מומלצת:** להסביר את ברירת המחדל (שאר השרתים ממשיכים), ואז להציע שיפורים: `max_fail_percentage` לקבוע סף סבילות, `serial` לפריסה הדרגתית עם בדיקות ביניים, `block/rescue` לניסיון תיקון עצמי (retry logic), ותיעוד/Notification (Slack/Email) על כשלון ספציפי דרך handler ייעודי.

## רשימת טיפים וטריקים כלליים (Cheat Sheet)

### CLI שימושי

```bash
# בדיקת syntax בלבד
ansible-playbook site.yml --syntax-check

# רשימת כל ה-Tasks בלי הרצה
ansible-playbook site.yml --list-tasks

# רשימת כל השרתים שיושפעו
ansible-playbook site.yml --list-hosts

# הרצה על שרת יחיד בלבד
ansible-playbook site.yml --limit web1.example.com

# הרצה שלב אחר שלב (אינטראקטיבי)
ansible-playbook site.yml --step

# התחלה מ-Task מסוים (המשך אחרי כשלון)
ansible-playbook site.yml --start-at-task="restart nginx"

# הרצה מחדש רק על שרתים שנכשלו בהרצה הקודמת
ansible-playbook site.yml --limit @site.retry
```

### שגיאות נפוצות ופתרונן

| שגיאה | סיבה נפוצה | פתרון |
|---|---|---|
| `UNREACHABLE` | בעיית SSH/רשת | בדקו `ansible_host`, מפתחות SSH, `ansible_port` |
| `variable is undefined` | משתנה לא הוגדר בהקשר הנוכחי | השתמשו ב-`default()` או בדקו precedence |
| `MODULE FAILURE` | חוסר בספריות Python בצד המנוהל | בדקו `ansible_python_interpreter` |
| Task תמיד `changed` | שימוש ב-`command`/`shell` שאינם idempotent | הגדירו `changed_when` מדויק או עברו למודול ייעודי |
| Handler לא רץ | Task לא סימן `changed` בפועל | בדקו את תנאי ההפעלה של ה-Task שקורא ל-notify |

### עקרונות עבודה מומלצים

1. **תמיד `name`** לכל Task ו-Play - פלט קריא = דיבוג מהיר.
2. **גרסה (Version Control) לכל דבר** - Playbooks, Roles, ואפילו `requirements.yml` עם גרסאות נעולות.
3. **סביבות נפרדות** - Inventory נפרד ל-production/staging, לעולם לא לשתף.
4. **בדקו לפני שאתם מפעילים** - `--check --diff` הוא רשת ביטחון קריטית.
5. **אבטחה ראשונה** - Vault לכל סוד, `no_log` לכל Task רגיש, SSH keys ולא סיסמאות.
6. **מודולריות** - Roles קטנים וממוקדים עדיפים על Playbook ענק אחד.
7. **Idempotency קודם כל** - אם אתם משתמשים ב-`shell`/`command`, שאלו את עצמכם "האם יש מודול ייעודי לזה?"
8. **תיעוד** - README לכל Role עם דוגמאות שימוש ורשימת משתנים נתמכים.
9. **CI/CD מוקדם** - `ansible-lint` ו-Molecule כ-Gate כבר משלב מוקדם בפרויקט, לא בדיעבד.
10. **מדדו ביצועים** - `pipelining`, `forks`, ו-`fact_caching` יכולים לחתוך זמני ריצה משמעותית בפרויקטים גדולים.

## קישורים חיצוניים

**תיעוד רשמי:**
- Ansible Getting Started המלא: https://docs.ansible.com/projects/ansible/latest/getting_started/index.html
- Best Practices הרשמי: https://docs.ansible.com/projects/ansible/latest/tips_tricks/ansible_tips_tricks.html
- FAQ רשמי: https://docs.ansible.com/projects/ansible/latest/reference_appendices/faq.html

**סרטוני YouTube מומלצים (הכנה לראיונות):**
- Ansible Full Course - Simplilearn: https://www.youtube.com/watch?v=EcnqJbxBcM0
- Ansible Full Course - Edureka: https://www.youtube.com/watch?v=9Ua2b06oAr4
- Ansible Full Course | Zero to Hero (8 שעות מקיף): https://www.youtube.com/watch?v=lhFvMsy6VX8
- Ansible Course for Beginners (סיכום מהיר בשעה): https://www.youtube.com/watch?v=s4cXrNEDYiw
- TechWorld with Nana - ערוץ DevOps מוביל הכולל סדרת Ansible מלאה: https://www.youtube.com/channel/UCdngmbVKX1Tgre699-XLlUA

---
⬅️ [חזרה למדריך 9](/devops/ansible/09-advanced-devops/) | 🏠 [חזרה למדריך 1 - מבוא](/devops/ansible/01-mavo-veyesodot/)

---

## אינדקס כל 10 המדריכים

1. [מבוא ל-Ansible, ארכיטקטורה והתקנה](/devops/ansible/01-mavo-veyesodot/)
2. [Inventory - ניהול שרתים וקבוצות](/devops/ansible/02-inventory/)
3. [Playbooks - כתיבה ומבנה](/devops/ansible/03-playbooks/)
4. [Variables ו-Facts](/devops/ansible/04-variables-facts/)
5. [מודולים נפוצים](/devops/ansible/05-modules/)
6. [Templates (Jinja2) ו-Handlers](/devops/ansible/06-templates-handlers/)
7. [Roles - ארגון קוד לשימוש חוזר](/devops/ansible/07-roles/)
8. [Ansible Vault - ניהול סודות ואבטחה](/devops/ansible/08-vault-security/)
9. [Ansible ב-DevOps - CI/CD, AWX/Tower](/devops/ansible/09-advanced-devops/)
10. [שאלות ראיון עבודה מקיפות + טיפים וטריקים](/devops/ansible/10-interview-questions/) (המדריך הנוכחי)
