---
title: "Playbooks - כתיבה ומבנה"
category: DevOps/Ansible
part: 3/10
---

## מה זה Playbook?

Playbook הוא קובץ YAML המתאר רצף של **Plays**, כאשר כל Play מגדיר קבוצת שרתים (hosts) ורשימת **Tasks** להרצה עליהם. זהו "מתכון האוטומציה" המרכזי ב-Ansible.

## מבנה בסיסי

```yaml
---
- name: התקנה והגדרה של שרת Web
  hosts: webservers
  become: true
  vars:
    http_port: 80
  tasks:
    - name: התקנת nginx
      ansible.builtin.apt:
        name: nginx
        state: present
        update_cache: true

    - name: הפעלת השירות nginx
      ansible.builtin.service:
        name: nginx
        state: started
        enabled: true

    - name: וידוא שקובץ index.html קיים
      ansible.builtin.copy:
        content: "<h1>שלום מ-Ansible</h1>"
        dest: /var/www/html/index.html
```

הרצה:

```bash
ansible-playbook -i inventory.ini site.yml
```

## אלמנטים מרכזיים של Play

| מפתח | תיאור |
|---|---|
| `name` | שם קריא לתיאור ה-Play/Task (מומלץ תמיד!) |
| `hosts` | קבוצה/שרת מה-Inventory להרצה |
| `become` | האם להעלות הרשאות (sudo) |
| `become_user` | לאיזה משתמש לעלות הרשאות (ברירת מחדל: root) |
| `vars` | משתנים מקומיים ל-Play |
| `vars_files` | טעינת משתנים מקובץ חיצוני |
| `tasks` | רשימת המשימות להרצה |
| `handlers` | משימות שרצות רק כשמופעל `notify` |
| `roles` | רשימת Roles להרצה |
| `gather_facts` | האם לאסוף מידע (Facts) על השרת לפני ההרצה |

## מספר Plays בקובץ אחד

```yaml
---
- name: הגדרת שרתי Web
  hosts: webservers
  become: true
  tasks:
    - name: התקנת nginx
      ansible.builtin.apt:
        name: nginx
        state: present

- name: הגדרת שרתי DB
  hosts: dbservers
  become: true
  tasks:
    - name: התקנת PostgreSQL
      ansible.builtin.apt:
        name: postgresql
        state: present
```

## Task - היחידה הבסיסית

כל Task קורא למודול אחד. תחביר מודרני (מומלץ) משתמש ב-Fully Qualified Collection Name (FQCN):

```yaml
- name: יצירת משתמש deploy
  ansible.builtin.user:
    name: deploy
    shell: /bin/bash
    groups: sudo
    append: true
```

## תנאים - When

```yaml
- name: התקנת nginx רק באובונטו
  ansible.builtin.apt:
    name: nginx
    state: present
  when: ansible_facts['distribution'] == "Ubuntu"

- name: הפעלת firewalld רק ב-RHEL/CentOS
  ansible.builtin.service:
    name: firewalld
    state: started
  when:
    - ansible_facts['os_family'] == "RedHat"
    - ansible_facts['distribution_major_version'] | int >= 8
```

## לולאות - Loop

```yaml
- name: התקנת מספר חבילות
  ansible.builtin.apt:
    name: "{{ item }}"
    state: present
  loop:
    - git
    - curl
    - vim
    - htop

- name: יצירת כמה משתמשים עם מאפיינים שונים
  ansible.builtin.user:
    name: "{{ item.name }}"
    groups: "{{ item.groups }}"
  loop:
    - { name: 'alice', groups: 'admin' }
    - { name: 'bob', groups: 'developers' }
```

לולאה עם `loop` ומילון (dict) בעזרת `dict2items`:

```yaml
- name: יצירת קבצי קונפיגורציה מרובים
  ansible.builtin.template:
    src: "{{ item.key }}.j2"
    dest: "/etc/app/{{ item.key }}.conf"
  loop: "{{ configs | dict2items }}"
```

## Blocks - קיבוץ Tasks וטיפול בשגיאות

```yaml
- name: התקנה עם טיפול בשגיאות
  block:
    - name: התקנת חבילה קריטית
      ansible.builtin.apt:
        name: postgresql
        state: present

    - name: הפעלת שירות
      ansible.builtin.service:
        name: postgresql
        state: started

  rescue:
    - name: שליחת התראה על כישלון
      ansible.builtin.debug:
        msg: "ההתקנה נכשלה! שולח התראה לצוות"

  always:
    - name: לוג סטטוס
      ansible.builtin.debug:
        msg: "בלוק ההתקנה הסתיים - הצליח או נכשל"
```

## Handlers - הפעלה מותנית

Handler רץ רק פעם אחת בסוף ה-Play, ורק אם הופעל (`notify`) על ידי Task שבצע שינוי בפועל:

```yaml
tasks:
  - name: עדכון קובץ קונפיגורציה של nginx
    ansible.builtin.template:
      src: nginx.conf.j2
      dest: /etc/nginx/nginx.conf
    notify: הפעלה מחדש של nginx

handlers:
  - name: הפעלה מחדש של nginx
    ansible.builtin.service:
      name: nginx
      state: restarted
```

## Tags - הרצה חלקית של Playbook

```yaml
tasks:
  - name: התקנת nginx
    ansible.builtin.apt:
      name: nginx
      state: present
    tags:
      - install

  - name: הגדרת firewall
    ansible.builtin.ufw:
      rule: allow
      port: '80'
    tags:
      - security
      - firewall
```

הרצה עם tag ספציפי בלבד:

```bash
ansible-playbook site.yml --tags "firewall"
ansible-playbook site.yml --skip-tags "install"
```

## Register - שמירת תוצאת Task

```yaml
- name: בדיקת סטטוס שירות
  ansible.builtin.command: systemctl status nginx
  register: nginx_status
  ignore_errors: true

- name: הצגת התוצאה
  ansible.builtin.debug:
    var: nginx_status.stdout
```

## Handlers מרובים ו-listen

```yaml
handlers:
  - name: restart nginx
    ansible.builtin.service:
      name: nginx
      state: restarted
    listen: "restart web services"

  - name: restart php-fpm
    ansible.builtin.service:
      name: php-fpm
      state: restarted
    listen: "restart web services"

tasks:
  - name: עדכון קונפיגורציה
    ansible.builtin.template:
      src: app.conf.j2
      dest: /etc/app.conf
    notify: "restart web services"
```

## דגלים שימושיים בהרצת ansible-playbook

```bash
# הרצה יבשה - בלי לבצע שינויים אמיתיים
ansible-playbook site.yml --check

# הרצה יבשה עם הצגת ה-diff
ansible-playbook site.yml --check --diff

# הרצה על שרת בודד מתוך קבוצה
ansible-playbook site.yml --limit web1.example.com

# התחלה מ-task מסוים (שימושי בדיבוג)
ansible-playbook site.yml --start-at-task="הגדרת firewall"

# ציון משתנים דרך שורת הפקודה
ansible-playbook site.yml -e "app_version=2.1.0"

# בדיקת תחביר בלבד ללא הרצה
ansible-playbook site.yml --syntax-check

# רשימת כל המשימות ב-Playbook (בלי להריץ)
ansible-playbook site.yml --list-tasks
```

## טיפים וטריקים

1. **תמיד תנו `name` לכל Task** — זה הופך את הפלט לקריא ומקל מאוד על דיבוג.
2. **השתמשו ב-FQCN** (`ansible.builtin.apt` ולא סתם `apt`) — מונע התנגשויות שמות בין Collections שונות.
3. **`--check --diff` הוא חבר הכי טוב שלכם** לפני הרצה על פרודקשן.
4. **הפרידו Playbooks גדולים** — במקום קובץ ענק אחד, השתמשו ב-`import_playbook` כדי לחלק לקבצים קטנים וממוקדים.
5. **`--step`** מאפשר לעבור Task-by-Task באופן אינטראקטיבי, שימושי מאוד לדיבוג:
   ```bash
   ansible-playbook site.yml --step
   ```
6. הימנעו משימוש מוגזם במודול `command`/`shell` — כמעט תמיד יש מודול ייעודי (idempotent) עבור מה שאתם צריכים.

## שאלות ראיון עבודה נפוצות

1. מה ההבדל בין `tasks` ל-`handlers`, ומתי ה-handler בפועל לא ירוץ?
2. הסבירו את ההבדל בין `block/rescue/always` לבין try/except בשפות תכנות רגילות.
3. מה קורה אם יש שני Tasks שקוראים ל-`notify` לאותו handler באותו Play?
4. איך מריצים רק חלק מ-Playbook על סמך Tags, ומה ההבדל בין `--tags` ל-`--skip-tags`?
5. מהי אידמפוטנטיות בהקשר Task ב-Ansible, ואיך מודול `command` שובר את זה בהשוואה למודול ייעודי?
6. מה ההבדל בין `gather_facts: true` ל-`gather_facts: false` והשפעתו על זמן ריצה?

## קישורים חיצוניים

**תיעוד רשמי:**
- Creating a playbook: https://docs.ansible.com/projects/ansible/latest/getting_started/get_started_playbook.html
- Working With Playbooks: https://docs.ansible.com/projects/ansible/latest/playbook_guide/playbooks_intro.html

**סרטוני YouTube מומלצים:**
- Ansible Full Course - Simplilearn (הסבר מעמיק על Playbooks): https://www.youtube.com/watch?v=EcnqJbxBcM0
- Ansible Full Course | Zero to Hero: https://www.youtube.com/watch?v=lhFvMsy6VX8
- Ansible Course for Beginners (שעה אחת): https://www.youtube.com/watch?v=s4cXrNEDYiw

---
⬅️ [חזרה למדריך 2](/devops/ansible/02-inventory/) | ➡️ [המדריך הבא: 04-variables-facts.md](/devops/ansible/04-variables-facts/)
