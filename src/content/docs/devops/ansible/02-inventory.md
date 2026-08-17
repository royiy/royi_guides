# מדריך 2: Inventory - ניהול שרתים וקבוצות

## מה זה Inventory?

ה-Inventory הוא הרשימה של כל השרתים (Hosts) שאנחנו רוצים לנהל עם Ansible, מקובצים לפי קטגוריות לוגיות (Groups). ניתן להגדיר Inventory בכמה פורמטים: **INI**, **YAML**, או **Dynamic Inventory** (סקריפט/פלאגין שמייצר את הרשימה בזמן ריצה, למשל מ-AWS/Azure).

## פורמט INI בסיסי

```ini
# inventory.ini

[webservers]
web1.example.com
web2.example.com ansible_host=192.168.1.20

[dbservers]
db1.example.com ansible_user=postgres
db2.example.com

[all:vars]
ansible_python_interpreter=/usr/bin/python3
```

הרצה מול קובץ זה:

```bash
ansible webservers -i inventory.ini -m ping
```

## פורמט YAML (מומלץ לפרויקטים גדולים)

```yaml
# inventory.yml
all:
  children:
    webservers:
      hosts:
        web1.example.com:
          ansible_host: 10.0.0.11
        web2.example.com:
          ansible_host: 10.0.0.12
      vars:
        http_port: 80
    dbservers:
      hosts:
        db1.example.com:
          ansible_host: 10.0.0.21
      vars:
        db_port: 5432
  vars:
    ansible_user: deploy
    ansible_ssh_private_key_file: ~/.ssh/id_rsa
```

## קבוצות מקוננות (Nested Groups)

ניתן לבנות היררכיה של קבוצות בעזרת `:children`:

```ini
[frontend]
web1.example.com
web2.example.com

[backend]
db1.example.com
cache1.example.com

[production:children]
frontend
backend

[production:vars]
env=prod
```

כעת אפשר להריץ על כל הפרודקשן בבת אחת:

```bash
ansible production -i inventory.ini -m ping
```

## דפוסי טווח (Ranges) לשרתים רבים

```ini
[webservers]
web[01:20].example.com

[dbservers]
db-[a:f].example.com
```

## משתני Host ו-Group

### משתני Host (Host Variables)

ניתן להגדיר ישירות בשורה:

```ini
web1.example.com ansible_host=10.0.0.5 ansible_port=2222 ansible_user=ubuntu
```

או בקבצים נפרדים בתיקיית `host_vars/`:

```
inventory/
├── inventory.ini
└── host_vars/
    └── web1.example.com.yml
```

תוכן `host_vars/web1.example.com.yml`:

```yaml
ansible_host: 10.0.0.5
app_version: "2.3.1"
nginx_workers: 4
```

### משתני Group (Group Variables)

בתיקיית `group_vars/`:

```
inventory/
├── inventory.ini
└── group_vars/
    ├── webservers.yml
    └── all.yml
```

תוכן `group_vars/webservers.yml`:

```yaml
http_port: 80
max_clients: 200
```

תוכן `group_vars/all.yml` (חל על כולם):

```yaml
ntp_server: pool.ntp.org
timezone: Asia/Jerusalem
```

## Dynamic Inventory - Inventory דינמי

בסביבות ענן (AWS, Azure, GCP) השרתים משתנים כל הזמן, ולכן משתמשים ב-Plugin שמייצר Inventory אוטומטית.

### דוגמה: AWS EC2 Dynamic Inventory

התקנת ה-Collection:

```bash
ansible-galaxy collection install amazon.aws
pip install boto3 botocore
```

קובץ `aws_ec2.yml`:

```yaml
plugin: amazon.aws.aws_ec2
regions:
  - us-east-1
  - eu-west-1
filters:
  tag:Environment: production
keyed_groups:
  - key: tags.Role
    prefix: role
compose:
  ansible_host: public_ip_address
```

הרצה:

```bash
ansible-inventory -i aws_ec2.yml --graph
ansible all -i aws_ec2.yml -m ping
```

### דוגמה: Azure Dynamic Inventory

```bash
ansible-galaxy collection install azure.azcollection
```

```yaml
# azure_rm.yml
plugin: azure.azcollection.azure_rm
include_vm_resource_groups:
  - my-resource-group
auth_source: auto
```

## בדיקת ה-Inventory

הצגת עץ ההיררכיה של ה-Inventory:

```bash
ansible-inventory -i inventory.ini --graph
```

פלט לדוגמה:

```
@all:
  |--@production:
  |  |--@frontend:
  |  |  |--web1.example.com
  |  |  |--web2.example.com
  |  |--@backend:
  |  |  |--db1.example.com
  |--@ungrouped:
```

הצגת כל המשתנים המחושבים לשרת ספציפי:

```bash
ansible-inventory -i inventory.ini --host web1.example.com
```

בדיקת אילו שרתים תואמים לתבנית מסוימת בלי להריץ כלום:

```bash
ansible webservers -i inventory.ini --list-hosts
```

## קבוצות מיוחדות מובנות

| קבוצה | תיאור |
|---|---|
| `all` | כל השרתים ב-Inventory |
| `ungrouped` | שרתים שלא שויכו לאף קבוצה מפורשת |
| `localhost` | ה-Control Node עצמו (בשימוש עם `connection: local`) |

## טיפים וטריקים

1. **הפרידו Inventory לפי סביבה** — `inventories/production/`, `inventories/staging/` — כדי למנוע הרצה בטעות על פרודקשן.
2. **השתמשו ב-`ansible_host` ולא בשם המארח כתובת** — כך תוכלו לתת שם קריא לשרת (למשל `web1`) בעוד ה-IP האמיתי מוגדר בנפרד.
3. **`group_vars/all.yml`** הוא המקום הטבעי למשתנים גלובליים כמו timezone, DNS servers וכו'.
4. **סדר עדיפויות משתנים** (מהחלש לחזק): `group_vars/all` → `group_vars/<group>` → `host_vars/<host>` → משתנים שהוגדרו ב-Playbook עצמו. חשוב לזכור סדר זה בזמן דיבוג "למה המשתנה לא מתעדכן".
5. בדקו Inventory מסובך עם `--graph` ו-`--list` לפני הרצה אמיתית.

## שאלות ראיון עבודה נפוצות

1. מה ההבדל בין Static Inventory ל-Dynamic Inventory, ומתי תבחרו בכל אחד?
2. כיצד Ansible פותר קונפליקט כאשר אותו משתנה מוגדר גם ב-`group_vars` וגם ב-`host_vars`?
3. איך תבנו Inventory עבור סביבת AWS עם מאות מכונות שמתעדכנות תדיר?
4. מה ההבדל בין `ansible_host` לבין שם המארח (hostname) ב-Inventory?
5. כיצד ניתן להריץ Playbook רק על תת-קבוצה מסוימת מתוך Group גדול (למשל, רק 5 שרתים מתוך 100)?

## קישורים חיצוניים

**תיעוד רשמי:**
- Building an inventory: https://docs.ansible.com/projects/ansible/latest/getting_started/get_started_inventory.html
- How to build inventory: https://docs.ansible.com/projects/ansible/latest/inventory_guide/intro_inventory.html

**סרטוני YouTube מומלצים:**
- TechWorld with Nana - Ansible (ערוץ עם פרקים על Inventory): https://www.youtube.com/channel/UCdngmbVKX1Tgre699-XLlUA
- Ansible Full Course - Simplilearn (כולל הסבר Inventory): https://www.youtube.com/watch?v=EcnqJbxBcM0

---
⬅️ [חזרה למדריך 1](./01-mavo-veyesodot.md) | ➡️ [המדריך הבא: 03-playbooks.md](./03-playbooks.md)
