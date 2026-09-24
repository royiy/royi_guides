---
title: "Variables ו-Facts"
description: "דרכי הגדרת משתנים ב-Ansible, סדר העדיפויות (Precedence) המלא ביניהם, איסוף Facts אוטומטי מהשרת, set_fact, פילטרי Jinja2 ו-vars_prompt."
category: DevOps/Ansible
part: 4/10
---

## מה זה משתנה (Variable) ב-Ansible?

משתנים מאפשרים להתאים אישית התנהגות של Playbooks לפי סביבה, שרת, או תרחיש. Ansible תומך במגוון רחב של מקורות משתנים ובסדר עדיפויות ברור ביניהם (Precedence).

## הגדרת משתנים - דרכים שונות

### 1. בתוך ה-Playbook עצמו

```yaml
- name: Play עם משתנים
  hosts: webservers
  vars:
    app_name: myapp
    app_port: 8080
  tasks:
    - name: הצגת שם האפליקציה
      ansible.builtin.debug:
        msg: "מריצים את {{ app_name }} על פורט {{ app_port }}"
```

### 2. מקובץ חיצוני (vars_files)

```yaml
- name: Play עם קובץ משתנים
  hosts: webservers
  vars_files:
    - vars/app_config.yml
  tasks:
    - ansible.builtin.debug:
        var: app_name
```

תוכן `vars/app_config.yml`:

```yaml
app_name: myapp
app_version: "3.2.1"
db_host: db1.internal.example.com
```

### 3. group_vars / host_vars

ראו הרחבה במדריך 2 (Inventory).

### 4. שורת הפקודה (Extra Vars) - עדיפות הכי גבוהה

```bash
ansible-playbook site.yml -e "app_version=2.0.0"
ansible-playbook site.yml -e "@vars/production.yml"
```

### 5. Registered Variables (מתוצאת Task)

```yaml
- name: קבלת תאריך נוכחי בשרת
  ansible.builtin.command: date +%Y-%m-%d
  register: server_date

- name: הצגת התאריך
  ansible.builtin.debug:
    msg: "התאריך בשרת הוא {{ server_date.stdout }}"
```

## סדר עדיפויות (Variable Precedence) - מהחלש לחזק

Ansible קובע איזה ערך "מנצח" כאשר אותו משתנה מוגדר במספר מקומות. סדר מקוצר (מהנמוך לגבוה):

1. הגדרות ברירת מחדל של Role (`defaults/main.yml`)
2. משתני Inventory (`group_vars/all`)
3. משתני Inventory ספציפיים לקבוצה (`group_vars/<group>`)
4. משתני Inventory ספציפיים ל-Host (`host_vars/<host>`)
5. Facts שנאספו מהשרת
6. משתני `vars` בתוך ה-Playbook
7. `vars_files` שנטענו
8. `vars_prompt`
9. `set_fact` בזמן ריצה
10. `register`
11. משתני Role (`vars/main.yml` בתוך Role) - עדיפות גבוהה יותר מ-defaults
12. **Extra Vars (`-e` בשורת הפקודה) - העדיפות הגבוהה ביותר תמיד**

> טיפ לזכירה: `-e` תמיד מנצח את הכול, ולכן זהו המקום הטוב ביותר לדרוס משתנים בזמן פריסה (Deploy) ספציפית.

## Facts - מידע אוטומטי על השרת

כברירת מחדל, בתחילת כל Play, Ansible אוסף מידע מפורט על השרת (Facts) - מערכת הפעלה, זיכרון, רשת, דיסקים ועוד.

```yaml
- name: הצגת עובדות בסיסיות
  hosts: all
  tasks:
    - name: הצגת מערכת ההפעלה
      ansible.builtin.debug:
        msg: "מערכת ההפעלה: {{ ansible_facts['distribution'] }} {{ ansible_facts['distribution_version'] }}"

    - name: הצגת כתובת IP
      ansible.builtin.debug:
        msg: "כתובת IP: {{ ansible_facts['default_ipv4']['address'] }}"

    - name: הצגת כמות זיכרון
      ansible.builtin.debug:
        msg: "זיכרון כולל: {{ ansible_facts['memtotal_mb'] }} MB"
```

### דוגמאות ל-Facts שימושיים

| Fact | תיאור | דוגמת ערך |
|---|---|---|
| `ansible_facts['distribution']` | שם הפצת לינוקס | `Ubuntu` |
| `ansible_facts['distribution_version']` | גרסת הפצה | `22.04` |
| `ansible_facts['os_family']` | משפחת מערכת ההפעלה | `Debian`, `RedHat` |
| `ansible_facts['hostname']` | שם המארח | `web1` |
| `ansible_facts['default_ipv4']['address']` | כתובת IP ראשית | `10.0.0.5` |
| `ansible_facts['memtotal_mb']` | סה"כ זיכרון RAM (MB) | `8192` |
| `ansible_facts['processor_vcpus']` | מספר ליבות וירטואליות | `4` |
| `ansible_facts['architecture']` | ארכיטקטורת מעבד | `x86_64` |
| `ansible_facts['mounts']` | רשימת נקודות עגינה (disks) | list |

### ביטול איסוף Facts (לביצועים)

אם לא צריך Facts, כדאי לבטל את האיסוף כדי לחסוך זמן:

```yaml
- name: Play מהיר בלי facts
  hosts: webservers
  gather_facts: false
  tasks:
    - name: פעולה שלא תלויה ב-facts
      ansible.builtin.copy:
        src: file.txt
        dest: /tmp/file.txt
```

### איסוף Facts ידני (setup module)

```bash
ansible web1.example.com -i inventory.ini -m setup
```

איסוף רק Facts ספציפיים עם פילטר:

```bash
ansible web1.example.com -i inventory.ini -m setup -a "filter=ansible_distribution*"
```

## set_fact - יצירת משתנה דינמי בזמן ריצה

```yaml
- name: חישוב משתנה דינמי
  hosts: all
  tasks:
    - name: קביעת סביבה לפי hostname
      ansible.builtin.set_fact:
        environment_type: "{{ 'production' if 'prod' in ansible_facts['hostname'] else 'staging' }}"

    - name: שימוש במשתנה החדש
      ansible.builtin.debug:
        var: environment_type
```

## Jinja2 Filters שימושיים על משתנים

```yaml
- name: דוגמאות פילטרים
  ansible.builtin.debug:
    msg:
      - "{{ app_name | upper }}"                     # הופך לאותיות גדולות
      - "{{ app_version | default('1.0.0') }}"        # ברירת מחדל אם המשתנה לא מוגדר
      - "{{ my_list | length }}"                      # אורך רשימה
      - "{{ my_list | join(', ') }}"                  # חיבור רשימה למחרוזת
      - "{{ my_dict | to_json }}"                     # המרה ל-JSON
      - "{{ '  trim me  ' | trim }}"                  # הסרת רווחים
      - "{{ 100 | random }}"                          # מספר רנדומלי עד 100
```

## vars_prompt - שאילת המשתמש בזמן ריצה

```yaml
- name: Play עם שאלה אינטראקטיבית
  hosts: all
  vars_prompt:
    - name: confirm_deploy
      prompt: "האם אתה בטוח שברצונך לפרוס לפרודקשן? (yes/no)"
      private: false
  tasks:
    - name: עצירה אם לא אושר
      ansible.builtin.fail:
        msg: "הפריסה בוטלה על ידי המשתמש"
      when: confirm_deploy != "yes"
```

## טיפים וטריקים

1. **תמיד השתמשו ב-`default()`** למשתנים שאינם חובה, כדי למנוע שגיאות "variable is undefined".
2. **`ansible_facts` הוא מילון (dict)** — עדיף לגשת דרך `ansible_facts['distribution']` ולא דרך המשתנה הישן `ansible_distribution` (deprecated בגרסאות חדשות).
3. **חסכו זמן ריצה** ב-Playbooks גדולים על ידי `gather_facts: false` כאשר אין צורך במידע השרת.
4. **`ansible-inventory --host <name>`** מציג לכם את כל המשתנים המחושבים לשרת מסוים - כלי דיבוג מצוין.
5. השתמשו ב-**`no_log: true`** על Tasks שמכילים סיסמאות או מידע רגיש, כדי שלא יופיעו בלוגים:
   ```yaml
   - name: יצירת סיסמה
     ansible.builtin.user:
       name: admin
       password: "{{ admin_password | password_hash('sha512') }}"
     no_log: true
   ```

## שאלות ראיון עבודה נפוצות

<details class="qa">
<summary>1. הסבירו את סדר העדיפויות (Precedence) של משתנים ב-Ansible - מה מנצח את מה?</summary>

מהנמוך לגבוה (בקירוב): `role defaults` → משתני inventory (`group_vars/all` → `group_vars` ספציפי → `host_vars`) → `vars` ב-Play → `vars_files` → `set_fact`/`register` → `role vars` → משתני Task → ולבסוף `-e` (extra vars) שגובר על הכול. הכלל לזכור: `defaults` הוא החלש ביותר, `-e` הוא החזק ביותר.

</details>

<details class="qa">
<summary>2. מה ההבדל בין <code>vars</code>, <code>vars_files</code> ו-<code>vars_prompt</code>?</summary>

`vars` מגדיר משתנים ישירות בתוך ה-Play; `vars_files` טוען אותם מקובץ חיצוני (נוח להפרדה בין קוד לקונפיגורציה, וגם לקבצים מוצפנים ב-Vault); `vars_prompt` מבקש את הערך מהמשתמש בזמן ההרצה — מתאים לערך חד-פעמי או רגיש שלא רוצים לשמור בקובץ.

</details>

<details class="qa">
<summary>3. איך אוספים Facts רק על תת-קבוצה ספציפית מה-Facts הכלליים (למשל, רק מידע רשת)?</summary>

עם `gather_subset`, למשל `gather_facts: true` בתוספת `gather_subset: ["network"]`, או ישירות במודול: `ansible.builtin.setup: gather_subset=network`. אפשר גם לשלול תת-קבוצות עם `!` (כמו `["!hardware"]`) כדי לקצר את זמן האיסוף.

</details>

<details class="qa">
<summary>4. מתי כדאי לבטל <code>gather_facts</code> ומה המחיר של כך?</summary>

כשה-Playbook לא משתמש בעובדות המערכת והמהירות חשובה — למשל משימת ping/deploy קצרה על מאות שרתים. המחיר: כל המשתנים האוטומטיים (`ansible_os_family`, `ansible_hostname`, כתובות IP וכו׳) לא יהיו זמינים, וכל `when` שמסתמך עליהם ייכשל. פשרה נפוצה: להשאיר `gather_facts: false` ולהריץ `setup` נקודתית רק היכן שצריך.

</details>

<details class="qa">
<summary>5. מהו ההבדל בין <code>register</code> ל-<code>set_fact</code>?</summary>

`register` שומר את **תוצאת הרצת ה-Task** (כולל `rc`, `stdout`, `changed`) במשתנה, ו-`set_fact` יוצר משתנה חדש עם ערך שאתם מחשבים בעצמכם. שניהם חיים ברמת המארח לאורך ה-Play, אבל `set_fact` מתאים לערך נגזר ("הגרסה שהחלטנו להתקין") ו-`register` לבדיקה של מה שקרה בפועל.

</details>

<details class="qa">
<summary>6. איך תבטיחו שסיסמה לא תופיע בלוג ההרצה (verbose output)?</summary>

מוסיפים `no_log: true` למשימה שמטפלת בערך הרגיש — כך Ansible מסתיר את הפלט שלה. בנוסף שומרים את הסוד עצמו ב-Ansible Vault או ב-secrets manager חיצוני, כי `no_log` מסתיר תצוגה בלבד ולא מצפין דבר.

</details>

## קישורים חיצוניים

**תיעוד רשמי:**
- Using Variables: https://docs.ansible.com/projects/ansible/latest/playbook_guide/playbooks_variables.html
- Discovering variables: facts and magic variables: https://docs.ansible.com/projects/ansible/latest/reference_appendices/special_variables.html

**סרטוני YouTube מומלצים:**
- Ansible Full Course - Simplilearn (כולל הסבר Variables ו-Facts): https://www.youtube.com/watch?v=EcnqJbxBcM0
- Ansible Online Course Part 1 - KnowledgeHut: https://www.youtube.com/watch?v=WQ6KRSkh0rM

---
⬅️ [חזרה למדריך 3](/devops/ansible/03-playbooks/) | ➡️ [המדריך הבא: 05-modules.md](/devops/ansible/05-modules/)
