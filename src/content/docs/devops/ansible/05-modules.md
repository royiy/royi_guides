---
title: "מודולים נפוצים (Modules)"
category: DevOps/Ansible
part: 5/10
---

## מה זה מודול?

מודול הוא יחידת קוד (בד"כ Python) שמבצעת פעולה ספציפית ואחת - התקנת חבילה, יצירת קובץ, ניהול שירות וכו'. Ansible מגיע עם אלפי מודולים מובנים (`ansible.builtin`) ומודולים נוספים דרך Collections.

בדיקת תיעוד מודול ישירות מהטרמינל:

```bash
ansible-doc ansible.builtin.apt
ansible-doc -l | grep docker    # חיפוש מודולים הקשורים ל-docker
```

## ניהול חבילות (Package Management)

### apt (Debian/Ubuntu)

```yaml
- name: התקנת חבילה בודדת
  ansible.builtin.apt:
    name: nginx
    state: present
    update_cache: true

- name: התקנת מספר חבילות
  ansible.builtin.apt:
    name:
      - git
      - curl
      - vim
    state: latest

- name: הסרת חבילה
  ansible.builtin.apt:
    name: apache2
    state: absent
    purge: true

- name: עדכון כל המערכת
  ansible.builtin.apt:
    upgrade: dist
    update_cache: true
```

### yum/dnf (RHEL/CentOS/Rocky)

```yaml
- name: התקנת חבילה ב-RHEL
  ansible.builtin.dnf:
    name: httpd
    state: present

- name: התקנה מקבוצת חבילות
  ansible.builtin.dnf:
    name: "@Development Tools"
    state: present
```

### package (חוצה פלטפורמות)

```yaml
- name: התקנה גנרית ללא תלות ב-OS
  ansible.builtin.package:
    name: git
    state: present
```

## ניהול קבצים

### file - יצירה/מחיקה של קבצים ותיקיות

```yaml
- name: יצירת תיקייה
  ansible.builtin.file:
    path: /opt/myapp
    state: directory
    mode: '0755'
    owner: deploy
    group: deploy

- name: יצירת קישור סימבולי
  ansible.builtin.file:
    src: /opt/myapp/current
    dest: /opt/myapp/releases/latest
    state: link

- name: מחיקת קובץ
  ansible.builtin.file:
    path: /tmp/old_file.txt
    state: absent
```

### copy - העתקת קבצים

```yaml
- name: העתקת קובץ מקומי לשרת מרוחק
  ansible.builtin.copy:
    src: files/app.conf
    dest: /etc/app/app.conf
    owner: root
    group: root
    mode: '0644'
    backup: true

- name: יצירת קובץ מתוכן inline
  ansible.builtin.copy:
    content: |
      # קובץ שנוצר על ידי Ansible
      APP_ENV=production
    dest: /etc/app/env.conf
```

### template - קבצים דינמיים עם Jinja2

```yaml
- name: יצירת קובץ קונפיגורציה מתבנית
  ansible.builtin.template:
    src: templates/nginx.conf.j2
    dest: /etc/nginx/sites-available/myapp.conf
    owner: root
    mode: '0644'
  notify: reload nginx
```

### lineinfile - עריכת שורה בקובץ קיים

```yaml
- name: הוספת/עדכון שורה בקובץ
  ansible.builtin.lineinfile:
    path: /etc/ssh/sshd_config
    regexp: '^PermitRootLogin'
    line: 'PermitRootLogin no'
    state: present
  notify: restart sshd

- name: וידוא שורה לא קיימת
  ansible.builtin.lineinfile:
    path: /etc/hosts
    regexp: '.*old-server.*'
    state: absent
```

### blockinfile - הוספת בלוק שלם לקובץ

```yaml
- name: הוספת בלוק קונפיגורציה
  ansible.builtin.blockinfile:
    path: /etc/nginx/nginx.conf
    marker: "# {mark} ANSIBLE MANAGED BLOCK - rate limiting"
    block: |
      limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
      limit_req zone=api burst=20;
```

## ניהול שירותים (Services)

```yaml
- name: הפעלת שירות והגדרתו לעלות אוטומטית
  ansible.builtin.service:
    name: nginx
    state: started
    enabled: true

- name: הפעלה מחדש של שירות
  ansible.builtin.service:
    name: postgresql
    state: restarted

- name: שימוש ב-systemd המתקדם יותר
  ansible.builtin.systemd:
    name: docker
    state: started
    enabled: true
    daemon_reload: true
```

## ניהול משתמשים וקבוצות

```yaml
- name: יצירת קבוצה
  ansible.builtin.group:
    name: developers
    gid: 2000
    state: present

- name: יצירת משתמש
  ansible.builtin.user:
    name: deploy
    comment: "Deploy User"
    shell: /bin/bash
    groups: developers,sudo
    append: true
    create_home: true
    password: "{{ 'MySecretPass123' | password_hash('sha512') }}"

- name: הוספת מפתח SSH ציבורי
  ansible.builtin.authorized_key:
    user: deploy
    state: present
    key: "{{ lookup('file', 'files/deploy_key.pub') }}"
```

## הרצת פקודות (זהירות - פחות idempotent)

```yaml
- name: הרצת פקודה עם command (בטוח יותר משל shell)
  ansible.builtin.command: /usr/bin/make install
  args:
    chdir: /opt/myapp/src
  changed_when: false

- name: הרצת פקודה עם pipes/redirects (דורש shell)
  ansible.builtin.shell: "cat /var/log/app.log | grep ERROR | wc -l"
  register: error_count

- name: הרצה מותנית - רק אם קובץ לא קיים
  ansible.builtin.command: /opt/myapp/install.sh
  args:
    creates: /opt/myapp/.installed
```

> **טיפ:** תמיד עדיפים `command`/`shell` כמוצא אחרון בלבד. חפשו קודם מודול ייעודי - הוא לרוב Idempotent ובטוח יותר.

## ניהול Firewall

```yaml
- name: פתיחת פורט ב-UFW (Ubuntu)
  community.general.ufw:
    rule: allow
    port: '443'
    proto: tcp

- name: פתיחת פורט ב-firewalld (RHEL)
  ansible.posix.firewalld:
    service: https
    permanent: true
    state: enabled
    immediate: true
```

## עבודה עם Git

```yaml
- name: שכפול/עדכון repository
  ansible.builtin.git:
    repo: 'https://github.com/example/myapp.git'
    dest: /opt/myapp
    version: main
    force: true
```

## Cron Jobs

```yaml
- name: יצירת cron job
  ansible.builtin.cron:
    name: "גיבוי יומי של מסד הנתונים"
    minute: "0"
    hour: "3"
    job: "/opt/scripts/backup_db.sh >> /var/log/backup.log 2>&1"
```

## Wait / Timeout

```yaml
- name: המתנה לפתיחת פורט לפני המשך
  ansible.builtin.wait_for:
    host: "{{ inventory_hostname }}"
    port: 5432
    delay: 5
    timeout: 60
```

## מודולים לענן (דוגמת AWS EC2)

```yaml
- name: הקמת מכונת EC2
  amazon.aws.ec2_instance:
    name: "web-server-{{ item }}"
    instance_type: t3.micro
    image_id: ami-0abcdef1234567890
    region: us-east-1
    tags:
      Environment: production
  loop: "{{ range(1, 4) | list }}"
```

## עבודה עם Docker

```yaml
- name: הרצת קונטיינר Docker
  community.docker.docker_container:
    name: myapp
    image: myapp:latest
    state: started
    restart_policy: always
    ports:
      - "8080:80"
    env:
      APP_ENV: production
```

## טבלת מודולים שימושיים לסיכום מהיר

| קטגוריה | מודול | שימוש |
|---|---|---|
| חבילות | `apt`, `dnf`, `yum`, `package` | התקנת/הסרת תוכנה |
| קבצים | `file`, `copy`, `template`, `lineinfile`, `blockinfile` | ניהול קבצים ותוכן |
| שירותים | `service`, `systemd` | הפעלה/עצירה/enable |
| משתמשים | `user`, `group`, `authorized_key` | ניהול הרשאות משתמשים |
| רשת | `firewalld`, `ufw`, `wait_for` | פורטים וחומת אש |
| גרסאות | `git` | ניהול קוד מ-repositories |
| תזמון | `cron` | משימות מתוזמנות |
| דיבוג | `debug`, `assert`, `fail` | הודעות ובדיקות |
| קונטיינרים | `docker_container`, `docker_image` | Docker |
| ענן | `ec2_instance`, `azure_rm_virtualmachine` | ניהול תשתית ענן |

## טיפים וטריקים

1. **`ansible-doc <module>`** הוא הכלי הכי מהיר לבדוק אילו פרמטרים מודול תומך, בלי לצאת מהטרמינל.
2. **השתמשו במודול ולא ב-shell** — כמעט תמיד יש מודול ש"יודע" לבדוק אם השינוי כבר קיים (idempotent), בעוד `shell`/`command` תמיד "ירוצו" ויסמנו `changed`.
3. **`changed_when: false`** שימושי כאשר אתם מריצים פקודת בדיקה בלבד (read-only) עם `command`, כדי שלא יסומן כ"שינוי" מיותר.
4. **גבו קבצים לפני שינוי** עם `backup: true` במודולי `copy`/`template`/`lineinfile`.
5. חפשו מודולים נוספים דרך Ansible Galaxy עבור שירותים ספציפיים (Kubernetes, Terraform, VMware וכו').

## שאלות ראיון עבודה נפוצות

1. מה ההבדל בין מודול `command` למודול `shell`, ומתי תבחרו בכל אחד?
2. למה מודול ייעודי (כמו `apt`) עדיף על שימוש ב-`shell` להתקנת חבילה?
3. הסבירו את ההבדל בין `service` ל-`systemd` module.
4. איך תוודאו שקובץ קיים רק אם הוא לא קיים כבר, בלי לדרוס אותו כל הרצה?
5. מה עושה הפרמטר `creates` במודול `command`?
6. כיצד תריצו Task רק פעם אחת גם אם ה-Playbook רץ על 50 שרתים (למשל להרצת migration)?

## קישורים חיצוניים

**תיעוד רשמי:**
- רשימת כל המודולים המובנים (Collection Index): https://docs.ansible.com/projects/ansible/latest/collections/ansible/builtin/index.html
- Introduction to modules: https://docs.ansible.com/projects/ansible/latest/module_plugin_guide/modules_intro.html

**סרטוני YouTube מומלצים:**
- TechWorld with Nana - Ansible Modules & Collections: https://www.youtube.com/channel/UCdngmbVKX1Tgre699-XLlUA
- Ansible Full Course - Edureka (כולל דוגמאות מודולים): https://www.youtube.com/watch?v=9Ua2b06oAr4

---
⬅️ [חזרה למדריך 4](./04-variables-facts.md) | ➡️ [המדריך הבא: 06-templates-handlers.md](./06-templates-handlers.md)
