---
title: "Ansible Vault - ניהול סודות ואבטחה"
category: DevOps/Ansible
part: 8/10
---

## מה זה Ansible Vault?

Ansible Vault הוא כלי מובנה להצפנת מידע רגיש - סיסמאות, מפתחות API, תעודות SSL - כדי שניתן יהיה לשמור אותם ב-Git בבטחה, בלי לחשוף מידע רגיש בטקסט גלוי.

## יצירת קובץ מוצפן

```bash
ansible-vault create secrets.yml
```

הפקודה תבקש סיסמה (Vault Password) ותפתח עורך טקסט. תוכן לדוגמה:

```yaml
db_password: "SuperSecretPass123!"
api_key: "sk-abc123xyz789"
aws_secret_access_key: "wJalrXUtnFEMI/K7MDENG"
```

## הצפנת קובץ קיים

```bash
ansible-vault encrypt vars/production_secrets.yml
```

## פענוח (Decrypt) קובץ

```bash
ansible-vault decrypt secrets.yml
```

## צפייה בתוכן בלי לפענח לצמיתות

```bash
ansible-vault view secrets.yml
```

## עריכת קובץ מוצפן

```bash
ansible-vault edit secrets.yml
```

## שינוי סיסמת Vault

```bash
ansible-vault rekey secrets.yml
```

## הצפנת ערך בודד (Encrypt String)

שימושי כאשר רוצים להצפין רק משתנה אחד בתוך קובץ YAML רגיל, ולא קובץ שלם:

```bash
ansible-vault encrypt_string 'MySecretPassword123' --name 'db_password'
```

פלט:

```yaml
db_password: !vault |
          $ANSIBLE_VAULT;1.1;AES256
          66386439653236336462626566653063336164663966303231363934653561363...
          3961626533626166653136353334396137656631353937343739313436653832
```

ניתן להדביק את הפלט הזה ישירות בתוך `group_vars/production.yml` הרגיל.

## הרצת Playbook עם קבצים מוצפנים

### דרך 1: הזנת סיסמה ידנית

```bash
ansible-playbook site.yml --ask-vault-pass
```

### דרך 2: קובץ סיסמה (Vault Password File)

```bash
echo "MyVaultPassword" > ~/.vault_pass.txt
chmod 600 ~/.vault_pass.txt

ansible-playbook site.yml --vault-password-file ~/.vault_pass.txt
```

**חשוב:** אל תשמרו את קובץ הסיסמה עצמו ב-Git! הוסיפו אותו ל-`.gitignore`.

### דרך 3: הגדרה קבועה ב-ansible.cfg

```ini
[defaults]
vault_password_file = ~/.vault_pass.txt
```

## מספר Vault IDs (מומלץ לפרויקטים עם כמה סביבות)

ניתן להשתמש בסיסמאות שונות עבור production ו-staging:

```bash
ansible-vault encrypt --vault-id production@prompt vars/prod_secrets.yml
ansible-vault encrypt --vault-id staging@prompt vars/staging_secrets.yml
```

הרצה עם שני Vault IDs:

```bash
ansible-playbook site.yml \
  --vault-id production@~/.vault_pass_prod.txt \
  --vault-id staging@~/.vault_pass_staging.txt
```

## שימוש במשתנים מוצפנים ב-Playbook

```yaml
---
- name: פריסה עם סודות
  hosts: dbservers
  become: true
  vars_files:
    - vars/secrets.yml   # קובץ מוצפן!
  tasks:
    - name: יצירת משתמש DB
      community.mysql.mysql_user:
        name: app_user
        password: "{{ db_password }}"
        priv: "myapp_db.*:ALL"
        state: present
```

## Best Practices לניהול סודות

1. **לעולם אל תשמרו סיסמאות בטקסט גלוי** בקוד המקור, אפילו לא בפרויקט פרטי.
2. **הפרידו קובץ Vault לכל סביבה** - `vault_production.yml`, `vault_staging.yml`.
3. **שלבו Vault עם מבנה `vars.yml` + `vault.yml`** - דוגמה נפוצה:

```yaml
# group_vars/production/vars.yml (גלוי - לא מוצפן)
db_password: "{{ vault_db_password }}"
api_key: "{{ vault_api_key }}"
```

```yaml
# group_vars/production/vault.yml (מוצפן!)
vault_db_password: "SuperSecretPass123!"
vault_api_key: "sk-abc123xyz789"
```

היתרון: ה-Playbook תמיד קורא ל-`db_password` (שם קריא), בעוד הערך האמיתי מגיע ממשתנה מוצפן. כך ניתן לראות בקלות אילו משתנים רגישים גם בלי לפענח את הקובץ.

4. **CI/CD** — אחסנו את סיסמת ה-Vault כ-Secret ב-Jenkins/GitLab CI/GitHub Actions, ולא כקובץ בדיסק.
5. **סיבוב סיסמאות (Rotation)** — השתמשו ב-`ansible-vault rekey` בעת חילופי צוות או חשד לדליפה.

## no_log - הסתרת פלט רגיש בלוגים

גם עם Vault, אם Task מדפיס משתנה רגיש (`debug`), הוא עלול להופיע בלוג:

```yaml
- name: יצירת משתמש עם סיסמה
  ansible.builtin.user:
    name: admin
    password: "{{ vault_admin_password | password_hash('sha512') }}"
  no_log: true    # מונע הדפסת הפרמטרים ללוג
```

## אינטגרציה עם HashiCorp Vault (מתקדם)

לארגונים גדולים, לעיתים עדיף להשתמש ב-HashiCorp Vault החיצוני במקום Ansible Vault:

```bash
ansible-galaxy collection install community.hashi_vault
```

```yaml
- name: קבלת סוד מ-HashiCorp Vault
  ansible.builtin.set_fact:
    db_password: "{{ lookup('community.hashi_vault.hashi_vault', 'secret=secret/data/myapp:password') }}"
```

## בדיקת אבטחה נוספת - lockdown SSH

```yaml
- name: הקשחת גישת SSH
  ansible.builtin.lineinfile:
    path: /etc/ssh/sshd_config
    regexp: "{{ item.regexp }}"
    line: "{{ item.line }}"
  loop:
    - { regexp: '^PermitRootLogin', line: 'PermitRootLogin no' }
    - { regexp: '^PasswordAuthentication', line: 'PasswordAuthentication no' }
    - { regexp: '^X11Forwarding', line: 'X11Forwarding no' }
  notify: restart sshd
```

## טיפים וטריקים

1. **`.gitignore` תמיד יכלול** את קבצי הסיסמה (`.vault_pass.txt`) ואת קבצי `*.retry`.
2. **בדקו לפני commit** שקובץ לא מוצפן בטעות: `ansible-vault view file.yml` ייכשל אם הקובץ לא מוצפן (סימן טוב לבדיקה הפוכה - ודאו שדווקא כן מוצפן).
3. **שימוש ב-`--vault-id`** מאפשר צוותים שונים לנהל סיסמאות נפרדות לסביבות שונות באותו Repository.
4. **הריצו `ansible-vault view`** בסקריפט CI לוודא שהקובץ אכן מוצפן לפני push (מניעת דליפות בטעות).
5. שקלו העברת ניהול סודות מתקדם ל-**HashiCorp Vault** או **AWS Secrets Manager** בסביבות ארגוניות גדולות.

## שאלות ראיון עבודה נפוצות

1. מה ההבדל בין `ansible-vault encrypt` ל-`ansible-vault encrypt_string`?
2. איך מנהלים סיסמאות Vault שונות לסביבות production ו-staging באותו Repository?
3. מהי שיטת ה-vars.yml + vault.yml, ולמה היא עדיפה על הצפנת כל קובץ המשתנים?
4. איך תשלבו Ansible Vault בתהליך CI/CD מבלי לשמור סיסמאות בקוד?
5. מה עושה `no_log: true` ולמה הוא לא תחליף ל-Vault?
6. איך מבצעים סיבוב (rotation) של סיסמת Vault בלי לאבד גישה לסודות הקיימים?

## קישורים חיצוניים

**תיעוד רשמי:**
- Protecting sensitive data with Ansible vault: https://docs.ansible.com/projects/ansible/latest/vault_guide/vault.html
- Keep secret data in encrypted files: https://docs.ansible.com/projects/ansible/latest/vault_guide/vault_encrypting_content.html

**סרטוני YouTube מומלצים:**
- Ansible Full Course - Simplilearn (כולל התייחסות לניהול סודות): https://www.youtube.com/watch?v=EcnqJbxBcM0
- TechWorld with Nana - Ansible: https://www.youtube.com/channel/UCdngmbVKX1Tgre699-XLlUA

---
⬅️ [חזרה למדריך 7](/devops/ansible/07-roles/) | ➡️ [המדריך הבא: 09-advanced-devops.md](/devops/ansible/09-advanced-devops/)
