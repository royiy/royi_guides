# מדריך 1: מבוא ל-Ansible, ארכיטקטורה והתקנה

## מה זה Ansible?

Ansible הוא כלי אוטומציה בקוד פתוח (Open Source) המשמש לניהול תצורה (Configuration Management), פריסת תוכנה (Deployment) ותזמור (Orchestration) של מערכות IT. הכלי נכתב ב-Python ונרכש על ידי Red Hat בשנת 2015.

היתרון המרכזי של Ansible לעומת כלים מתחרים כמו Puppet ו-Chef הוא **Agentless** — כלומר אין צורך להתקין תוכנת סוכן (Agent) על השרתים המנוהלים. Ansible מתחבר לשרתים דרך **SSH** (בלינוקס) או **WinRM** (בווינדוס), מעביר מודולים בפייתון, מריץ אותם, ומוחק אותם בסיום.

### עקרונות מפתח

- **Idempotency (אידמפוטנטיות)** — הרצה חוזרת של אותה פעולה תמיד תביא לאותה תוצאה סופית, גם אם המערכת כבר במצב הרצוי. Ansible לא יבצע שינוי מיותר אם הדבר כבר קיים.
- **Declarative (הצהרתי)** — אתה מתאר את המצב הרצוי (State), ולא את שלבי הביצוע. לדוגמה: "וודא שחבילת nginx מותקנת" ולא "הרץ apt install nginx".
- **Push-based** — בניגוד ל-Puppet/Chef שהם Pull-based (הסוכן מושך תצורה משרת מרכזי), ב-Ansible ה-Control Node "דוחף" את הפקודות לשרתי היעד.

## ארכיטקטורה

```
+------------------+         SSH / WinRM        +------------------+
|                  |  -------------------------> |                  |
|   Control Node   |                              |   Managed Node   |
| (בו מותקן Ansible)|  <------------------------- |  (שרת מנוהל)     |
|                  |         תוצאות ופלט          |                  |
+------------------+                              +------------------+
        |
        | קורא מ:
        v
  +--------------+     +-----------+     +---------+     +--------+
  |  Inventory   |     | Playbooks |     | Modules |     | Plugins|
  +--------------+     +-----------+     +---------+     +--------+
```

רכיבי הליבה:

| רכיב | תיאור |
|---|---|
| **Control Node** | המחשב/שרת שבו מותקן Ansible ומריצים ממנו את הפקודות |
| **Managed Node** | השרת המנוהל (נקרא גם Host) |
| **Inventory** | קובץ (או מקור דינמי) המגדיר אילו שרתים מנוהלים ואיך מקובצים |
| **Playbook** | קובץ YAML המתאר את רצף המשימות (Tasks) לביצוע |
| **Module** | יחידת קוד (בד"כ Python) המבצעת פעולה ספציפית (כמו התקנת חבילה) |
| **Role** | מבנה תיקיות מאורגן לארגון קוד Ansible לשימוש חוזר |
| **Collection** | חבילה המכילה Modules, Roles, Plugins יחד להפצה דרך Galaxy |
| **Plugin** | קוד המרחיב את היכולות הליבה (connection, callback, filter וכו') |

## התקנה

### Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install -y software-properties-common
sudo add-apt-repository --yes --update ppa:ansible/ansible
sudo apt install -y ansible
```

### RHEL / CentOS / Rocky Linux

```bash
sudo dnf install -y epel-release
sudo dnf install -y ansible
```

### דרך pip (מומלץ למי שרוצה גרסה עדכנית ומבודדת)

```bash
python3 -m venv ansible-venv
source ansible-venv/bin/activate
pip install --upgrade pip
pip install ansible
```

### macOS

```bash
brew install ansible
```

### בדיקת ההתקנה

```bash
ansible --version
```

פלט לדוגמה:

```
ansible [core 2.17.1]
  config file = /etc/ansible/ansible.cfg
  configured module search path = ['/home/user/.ansible/plugins/modules']
  python version = 3.11.4
```

## הפעלת הפקודה הראשונה (Ad-Hoc Command)

לפני כתיבת Playbook, ניתן להריץ פקודות בודדות ("Ad-Hoc") לבדיקת קישוריות:

```bash
ansible all -i inventory.ini -m ping
```

פלט מוצלח:

```
web1.example.com | SUCCESS => {
    "ansible_facts": {
        "discovered_interpreter_python": "/usr/bin/python3"
    },
    "changed": false,
    "ping": "pong"
}
```

דוגמה נוספת — הרצת פקודת shell על כל השרתים:

```bash
ansible all -i inventory.ini -m command -a "uptime"
```

ועדכון חבילות עם הרשאות sudo (become):

```bash
ansible webservers -i inventory.ini -m apt -a "name=nginx state=present" --become
```

## קובץ קונפיגורציה ansible.cfg

Ansible קורא הגדרות מסדר עדיפויות (מהגבוה לנמוך):

1. משתנה סביבה `ANSIBLE_CONFIG`
2. `./ansible.cfg` בתיקייה הנוכחית
3. `~/.ansible.cfg` בתיקיית הבית
4. `/etc/ansible/ansible.cfg`

דוגמה לקובץ `ansible.cfg` בסיסי:

```ini
[defaults]
inventory = ./inventory.ini
remote_user = ubuntu
host_key_checking = False
retry_files_enabled = False
forks = 20

[privilege_escalation]
become = True
become_method = sudo
become_user = root
become_ask_pass = False
```

## טיפים וטריקים

1. **תמיד השתמשו ב-`--check` (Dry Run)** לפני הרצה בפרודקשן:
   ```bash
   ansible-playbook site.yml --check --diff
   ```
2. **הפעילו `-v` עד `-vvvv`** לדיבוג מפורט של בעיות חיבור:
   ```bash
   ansible-playbook site.yml -vvv
   ```
3. **בטלו host key checking בסביבות בדיקה בלבד** (לא בפרודקשן!) על ידי `host_key_checking = False`.
4. **ansible-config**: להצגת כל ההגדרות הפעילות:
   ```bash
   ansible-config dump --only-changed
   ```
5. השתמשו ב-`ansible-doc` כדי לקבל תיעוד מודול ישירות מהטרמינל, בלי לצאת מה-CLI:
   ```bash
   ansible-doc apt
   ```

## שאלות נפוצות לתרגול עצמי

- מהי המשמעות של Agentless ומה היתרון האבטחתי שלו?
- מה ההבדל בין Push-based ל-Pull-based בניהול תצורה?
- אילו פרוטוקולים Ansible משתמש כדי להתחבר לשרתי לינוקס ולשרתי Windows בהתאמה?
- מהי אידמפוטנטיות ולמה היא קריטית בכלי אוטומציה?

## קישורים חיצוניים

**תיעוד רשמי:**
- מבוא ל-Ansible: https://docs.ansible.com/projects/ansible/latest/getting_started/introduction.html
- מדריך התקנה רשמי: https://docs.ansible.com/projects/ansible/latest/installation_guide/index.html
- Getting Started מלא: https://docs.ansible.com/projects/ansible/latest/getting_started/index.html

**סרטוני YouTube מומלצים:**
- ערוץ TechWorld with Nana (מכיל סדרה שלמה על Ansible): https://www.youtube.com/channel/UCdngmbVKX1Tgre699-XLlUA
- Ansible Full Course - Simplilearn: https://www.youtube.com/watch?v=EcnqJbxBcM0
- Ansible Full Course - Edureka: https://www.youtube.com/watch?v=9Ua2b06oAr4
- Ansible Course for Beginners (שעה אחת, תמציתי): https://www.youtube.com/watch?v=s4cXrNEDYiw

---
⬅️ המדריך הבא: [02-inventory.md](./02-inventory.md) — ניהול Inventory וקבוצות שרתים
