---
title: "Roles - ארגון קוד לשימוש חוזר"
category: DevOps/Ansible
part: 7/10
---

## מה זה Role?

Role הוא מבנה תיקיות סטנדרטי המארגן קוד Ansible (Tasks, Handlers, Templates, Variables, Files) ליחידה עצמאית וניתנת לשימוש חוזר. Roles הופכים Playbooks ענקיים לקוד מודולרי, קריא וניתן לתחזוקה.

## מבנה תיקיות סטנדרטי

```
roles/
└── nginx/
    ├── tasks/
    │   └── main.yml          # רשימת ה-Tasks המרכזית
    ├── handlers/
    │   └── main.yml          # Handlers של ה-Role
    ├── templates/
    │   └── nginx.conf.j2     # קבצי Jinja2
    ├── files/
    │   └── favicon.ico       # קבצים סטטיים להעתקה
    ├── vars/
    │   └── main.yml          # משתנים קבועים (עדיפות גבוהה)
    ├── defaults/
    │   └── main.yml          # ברירות מחדל (עדיפות נמוכה - ניתן לדרוס)
    ├── meta/
    │   └── main.yml          # תלויות ומטא-דאטה
    └── README.md
```

## יצירת Role חדש עם ansible-galaxy

```bash
ansible-galaxy init roles/nginx
```

פקודה זו יוצרת אוטומטית את כל מבנה התיקיות המומלץ.

## דוגמה מלאה - Role להתקנת nginx

### `roles/nginx/defaults/main.yml`

```yaml
---
nginx_http_port: 80
nginx_worker_processes: auto
nginx_worker_connections: 1024
nginx_server_name: "_"
```

### `roles/nginx/tasks/main.yml`

```yaml
---
- name: התקנת nginx
  ansible.builtin.apt:
    name: nginx
    state: present
    update_cache: true
  tags: [install]

- name: יצירת קובץ קונפיגורציה ראשי
  ansible.builtin.template:
    src: nginx.conf.j2
    dest: /etc/nginx/nginx.conf
    owner: root
    mode: '0644'
  notify: restart nginx
  tags: [config]

- name: וידוא ש-nginx פעיל
  ansible.builtin.service:
    name: nginx
    state: started
    enabled: true
  tags: [service]
```

### `roles/nginx/handlers/main.yml`

```yaml
---
- name: restart nginx
  ansible.builtin.service:
    name: nginx
    state: restarted
```

### `roles/nginx/templates/nginx.conf.j2`

```nginx
worker_processes {{ nginx_worker_processes }};

events {
    worker_connections {{ nginx_worker_connections }};
}

http {
    server {
        listen {{ nginx_http_port }};
        server_name {{ nginx_server_name }};
    }
}
```

### `roles/nginx/meta/main.yml`

```yaml
---
galaxy_info:
  author: your_name
  description: התקנה והגדרה בסיסית של nginx
  license: MIT
  min_ansible_version: "2.14"
  platforms:
    - name: Ubuntu
      versions: [focal, jammy]

dependencies: []
```

## שימוש ב-Role בתוך Playbook

```yaml
---
- name: פריסת שרת Web
  hosts: webservers
  become: true
  roles:
    - role: nginx
      vars:
        nginx_http_port: 8080
```

או בתחביר `import_role`/`include_role` בתוך tasks:

```yaml
tasks:
  - name: הרצת Role של nginx
    ansible.builtin.include_role:
      name: nginx
    vars:
      nginx_http_port: 8080
```

## הבדל בין import_role ל-include_role

| היבט | `import_role` | `include_role` |
|---|---|---|
| עיבוד | Static - בזמן ניתוח ה-Playbook | Dynamic - בזמן ריצה |
| שימוש עם `loop` | לא נתמך | נתמך |
| שימוש עם `when` | חל על כל ה-Tasks בבת אחת | נבדק לכל Task בנפרד |
| ביצועים | מהיר יותר | גמיש יותר |

## תלויות בין Roles (Dependencies)

ניתן להגדיר ב-`meta/main.yml` תלות ב-Role אחר שירוץ קודם אוטומטית:

```yaml
# roles/webapp/meta/main.yml
dependencies:
  - role: common
  - role: nginx
    vars:
      nginx_http_port: 80
```

## Roles מרובים בסדר מוגדר

```yaml
---
- name: פריסה מלאה
  hosts: webservers
  become: true
  roles:
    - common
    - nginx
    - { role: app_deploy, tags: ['deploy'] }
```

## Ansible Galaxy - שיתוף והורדת Roles מוכנים

חיפוש Role קיים:

```bash
ansible-galaxy search nginx
ansible-galaxy info geerlingguy.nginx
```

התקנת Role מ-Galaxy (הידוע ביותר - geerlingguy):

```bash
ansible-galaxy install geerlingguy.nginx
ansible-galaxy install geerlingguy.docker
ansible-galaxy install geerlingguy.mysql
```

### קובץ requirements.yml לניהול Roles מרובים

```yaml
# requirements.yml
roles:
  - name: geerlingguy.nginx
    version: "3.1.4"
  - name: geerlingguy.postgresql
    version: "3.5.2"

collections:
  - name: community.general
    version: ">=7.0.0"
  - name: amazon.aws
```

התקנה מהקובץ:

```bash
ansible-galaxy install -r requirements.yml
ansible-galaxy collection install -r requirements.yml
```

## מבנה פרויקט מומלץ (Best Practice)

```
my-ansible-project/
├── ansible.cfg
├── inventories/
│   ├── production/
│   │   ├── hosts.ini
│   │   └── group_vars/
│   └── staging/
│       ├── hosts.ini
│       └── group_vars/
├── roles/
│   ├── common/
│   ├── nginx/
│   ├── postgresql/
│   └── app_deploy/
├── playbooks/
│   ├── site.yml
│   ├── webservers.yml
│   └── dbservers.yml
├── requirements.yml
└── README.md
```

## Collections - הרמה הבאה מעל Roles

Collection היא חבילת הפצה המכילה Roles, Modules, Plugins ו-Playbooks יחד. לדוגמה:

```bash
ansible-galaxy collection install community.docker
ansible-galaxy collection install community.mysql
ansible-galaxy collection install ansible.posix
```

שימוש במודול מתוך Collection:

```yaml
- name: שימוש במודול מ-Collection
  community.mysql.mysql_db:
    name: myapp_db
    state: present
```

## טיפים וטריקים

1. **`defaults/main.yml` לעומת `vars/main.yml`** — שימו `defaults` לכל דבר שהמשתמש צפוי לדרוס (כמו פורט), ו-`vars` לדברים שלא אמורים להשתנות (כמו נתיבי מערכת).
2. **תעדו כל Role עם README.md** — כולל משתנים נתמכים, דוגמת שימוש, ותלויות.
3. **בדקו Role בבידוד** עם Playbook קטן ייעודי לפני שילוב במערכת גדולה.
4. **Tags בתוך Roles** מאפשרים הרצה חלקית - חיוני ב-Roles גדולים (`--tags install`).
5. **גרסאות (`version`) ב-`requirements.yml`** — תמיד נעלו גרסה ספציפית כדי למנוע "שבירה" בלתי צפויה מעדכון Role חיצוני.
6. שקלו כלי כמו **Molecule** לבדיקות אוטומטיות (Testing) של Roles לפני פרסום.

## שאלות ראיון עבודה נפוצות

1. מה ההבדל בין `roles/*/vars/main.yml` ל-`roles/*/defaults/main.yml`, ואיזה מהם עדיפות גבוהה יותר?
2. מה ההבדל בין `import_role` ל-`include_role`, ומתי תעדיפו כל אחד?
3. איך מגדירים תלות בין Role אחד לשני (Role Dependencies)?
4. מה ההבדל בין Role ל-Collection?
5. איך תבנו מבנה פרויקט Ansible לתמיכה במספר סביבות (production/staging) בלי לשכפל קוד?
6. מהם היתרונות של שימוש ב-Roles מוכנים מ-Galaxy (כמו geerlingguy) לעומת כתיבה מאפס?

## קישורים חיצוניים

**תיעוד רשמי:**
- Roles: https://docs.ansible.com/projects/ansible/latest/playbook_guide/playbooks_reuse_roles.html
- Ansible Galaxy: https://galaxy.ansible.com/
- Using collections: https://docs.ansible.com/projects/ansible/latest/collections_guide/index.html

**סרטוני YouTube מומלצים:**
- TechWorld with Nana - Ansible Roles: https://www.youtube.com/channel/UCdngmbVKX1Tgre699-XLlUA
- Ansible Full Course - Simplilearn (כולל Roles): https://www.youtube.com/watch?v=EcnqJbxBcM0

---
⬅️ [חזרה למדריך 6](./06-templates-handlers.md) | ➡️ [המדריך הבא: 08-vault-security.md](./08-vault-security.md)
