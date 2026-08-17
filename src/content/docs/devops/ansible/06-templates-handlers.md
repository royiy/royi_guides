---
title: "Templates (Jinja2) ו-Handlers מתקדם"
category: DevOps/Ansible
part: 6/10
---

## מה זה Jinja2?

Jinja2 הוא מנוע Templating בפייתון המשמש ב-Ansible ליצירת קבצים דינמיים המבוססים על משתנים, תנאים ולולאות. קבצי Template נשמרים בסיומת `.j2` ומעובדים על ידי מודול `template`.

## דוגמה בסיסית - קובץ Nginx דינמי

תוכן `templates/nginx.conf.j2`:

```nginx
server {
    listen {{ http_port }};
    server_name {{ server_name }};

    root {{ document_root }};

    location / {
        try_files $uri $uri/ =404;
    }

    {% if enable_ssl %}
    listen 443 ssl;
    ssl_certificate {{ ssl_cert_path }};
    ssl_certificate_key {{ ssl_key_path }};
    {% endif %}
}
```

שימוש ב-Playbook:

```yaml
- name: יצירת קובץ nginx מתבנית
  ansible.builtin.template:
    src: templates/nginx.conf.j2
    dest: /etc/nginx/sites-available/myapp.conf
    owner: root
    mode: '0644'
  vars:
    http_port: 80
    server_name: "myapp.example.com"
    document_root: "/var/www/myapp"
    enable_ssl: true
    ssl_cert_path: "/etc/ssl/certs/myapp.crt"
    ssl_key_path: "/etc/ssl/private/myapp.key"
  notify: reload nginx
```

## תנאים (If/Else) ב-Jinja2

```jinja
{% if environment == "production" %}
LOG_LEVEL=warning
{% elif environment == "staging" %}
LOG_LEVEL=info
{% else %}
LOG_LEVEL=debug
{% endif %}
```

## לולאות (For) ב-Jinja2

תוכן template ליצירת קובץ hosts דינמי:

```jinja
{% for host in groups['webservers'] %}
{{ hostvars[host]['ansible_host'] }} {{ host }}
{% endfor %}
```

לולאה עם אינדקס:

```jinja
{% for server in upstream_servers %}
server {{ server }} weight={{ loop.index }};
{% endfor %}
```

דוגמה מלאה - קובץ upstream ל-Load Balancer:

```nginx
upstream backend {
{% for server in groups['appservers'] %}
    server {{ hostvars[server]['ansible_host'] }}:8080 max_fails=3 fail_timeout=30s;
{% endfor %}
}
```

## Filters מתקדמים ב-Templates

```jinja
# המרת רשימה למחרוזת מופרדת בפסיקים
allowed_ips = {{ allowed_ip_list | join(',') }}

# ברירת מחדל אם המשתנה ריק
timeout = {{ request_timeout | default(30) }}

# המרה ל-JSON (שימושי לקבצי config בפורמט JSON)
{{ app_settings | to_nice_json }}

# בחירת ערך ייחודי מרשימה
unique_ports = {{ ports_list | unique | list }}

# מיון רשימה
sorted_hosts = {{ groups['all'] | sort }}

# פילטור לפי תנאי (selectattr)
prod_servers = {{ servers | selectattr('env', 'equalto', 'production') | list }}
```

## Magic Variables שימושיים בתוך Templates ו-Tasks

| משתנה | תיאור |
|---|---|
| `inventory_hostname` | שם המארח הנוכחי כפי שמופיע ב-Inventory |
| `groups` | מילון של כל הקבוצות והשרתים בהן |
| `hostvars` | גישה למשתני שרתים אחרים (`hostvars['web2']['ansible_host']`) |
| `group_names` | רשימת הקבוצות אליהן משתייך השרת הנוכחי |
| `ansible_play_hosts` | כל השרתים המשתתפים ב-Play הנוכחי |
| `playbook_dir` | הנתיב לתיקיית ה-Playbook |

דוגמה לשימוש ב-`hostvars`:

```yaml
- name: הצגת כתובת IP של שרת אחר
  ansible.builtin.debug:
    msg: "כתובת ה-DB היא {{ hostvars['db1.example.com']['ansible_host'] }}"
```

## Template ליצירת קובץ .env

תוכן `templates/app.env.j2`:

```jinja
# קובץ שנוצר אוטומטית - אין לערוך ידנית!
APP_NAME={{ app_name }}
APP_ENV={{ environment }}
DB_HOST={{ db_host }}
DB_PORT={{ db_port | default(5432) }}
{% if redis_enabled | default(false) %}
REDIS_URL=redis://{{ redis_host }}:{{ redis_port }}
{% endif %}
SECRET_KEY={{ vault_secret_key }}
```

## Handlers - הרחבה

Handler הוא Task מיוחד שרץ **רק פעם אחת** בסוף כל ה-Play (לא בכל פעם שמופעל!), ורק אם Task כלשהו קרא לו עם `notify` **וגם ביצע שינוי בפועל** (status changed).

### דוגמה מלאה

```yaml
---
- name: פריסת שרת אפליקציה
  hosts: appservers
  become: true
  tasks:
    - name: עדכון קובץ קונפיגורציה
      ansible.builtin.template:
        src: app.conf.j2
        dest: /etc/app/app.conf
      notify: restart app service

    - name: עדכון קובץ nginx
      ansible.builtin.template:
        src: nginx.conf.j2
        dest: /etc/nginx/sites-available/app.conf
      notify: reload nginx

    - name: וידוא שהקוד עדכני
      ansible.builtin.git:
        repo: 'https://github.com/example/app.git'
        dest: /opt/app
        version: main
      notify: restart app service

  handlers:
    - name: restart app service
      ansible.builtin.systemd:
        name: myapp
        state: restarted

    - name: reload nginx
      ansible.builtin.systemd:
        name: nginx
        state: reloaded
```

בדוגמה זו, אם גם ה-template וגם ה-git השתנו, ה-handler `restart app service` **ירוץ רק פעם אחת** בסוף - לא פעמיים!

### הרצת Handlers מיידית באמצע Play

לפעמים צריך שה-handler ירוץ **מיד** ולא בסוף. לשם כך:

```yaml
tasks:
  - name: עדכון קונפיגורציה קריטית
    ansible.builtin.template:
      src: critical.conf.j2
      dest: /etc/app/critical.conf
    notify: restart app now

  - name: force הרצת handlers עכשיו
    ansible.builtin.meta: flush_handlers

  - name: בדיקת health check אחרי הרסטארט
    ansible.builtin.uri:
      url: "http://localhost:8080/health"
      status_code: 200
```

### listen - קיבוץ Handlers מרובים תחת שם אחד

```yaml
handlers:
  - name: restart nginx
    ansible.builtin.service:
      name: nginx
      state: restarted
    listen: "web services changed"

  - name: restart php-fpm
    ansible.builtin.service:
      name: php-fpm
      state: restarted
    listen: "web services changed"

tasks:
  - name: עדכון הגדרות
    ansible.builtin.template:
      src: shared_config.j2
      dest: /etc/shared_config.conf
    notify: "web services changed"
```

## בדיקת Template בלי להריץ (validate)

```yaml
- name: בדיקת תקינות קובץ הגדרות nginx לפני החלה
  ansible.builtin.template:
    src: nginx.conf.j2
    dest: /etc/nginx/nginx.conf
    validate: '/usr/sbin/nginx -t -c %s'
```

## טיפים וטריקים

1. **`{% raw %}...{% endraw %}`** — עוטפים תוכן שלא רוצים ש-Jinja2 יעבד (למשל, קבצי Jinja עצמם או תבניות Prometheus):
   ```jinja
   {% raw %}
   {{ this_stays_literal }}
   {% endraw %}
   ```
2. **`validate`** במודול `template` מונע העלאת קובץ קונפיגורציה שבור לפרודקשן - תמיד השתמשו בו עבור nginx/apache/haproxy.
3. **Handlers רצים בסדר שהוגדרו ב-`handlers`**, לא בסדר שבו הם הופעלו (`notify`).
4. **`meta: flush_handlers`** שימושי כשצריך לוודא שהרסטארט קרה *לפני* Task הבא (כמו health check).
5. חתכו לוגיקה מורכבת מתוך ה-Template והעבירו אותה ל-`vars`/`set_fact` מראש - templates קריאים יותר כשהלוגיקה מינימלית.

## שאלות ראיון עבודה נפוצות

1. מה קורה אם 3 Tasks שונים קוראים ל-`notify` לאותו handler באותו Play?
2. איך גורמים ל-handler לרוץ מיד ולא לחכות לסוף ה-Play?
3. מה ההבדל בין `copy` ל-`template` מבחינת עיבוד תוכן?
4. מהו `validate` במודול `template`, ולמה הוא קריטי לקבצי קונפיגורציה של שרתי web?
5. איך משתמשים ב-`hostvars` כדי לגשת למשתנה של שרת אחר בזמן בניית קובץ load balancer?
6. מה עושה `listen` ב-handlers, ומתי כדאי להשתמש בו במקום `notify` ישיר?

## קישורים חיצוניים

**תיעוד רשמי:**
- Templating with Jinja2: https://docs.ansible.com/projects/ansible/latest/playbook_guide/playbooks_templating.html
- Handlers: running operations on change: https://docs.ansible.com/projects/ansible/latest/playbook_guide/playbooks_handlers.html

**סרטוני YouTube מומלצים:**
- Ansible Full Course | Zero to Hero (כולל Templates ו-Handlers): https://www.youtube.com/watch?v=lhFvMsy6VX8
- TechWorld with Nana - Ansible: https://www.youtube.com/channel/UCdngmbVKX1Tgre699-XLlUA

---
⬅️ [חזרה למדריך 5](./05-modules.md) | ➡️ [המדריך הבא: 07-roles.md](./07-roles.md)
