---
title: "Ansible Vault - ניהול סודות ואבטחה"
description: "הצפנה ופענוח של סודות עם Ansible Vault - יצירה, עריכה, encrypt_string, ניהול מספר Vault IDs לסביבות שונות, ושיטת vars.yml+vault.yml ל-Best Practices."
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

<details class="qa">
<summary>1. מה ההבדל בין <code>ansible-vault encrypt</code> ל-<code>ansible-vault encrypt_string</code>?</summary>

`encrypt` מצפין **קובץ שלם** — הקובץ כולו הופך לבלוק מוצפן ואי אפשר לקרוא אותו ב-diff. `encrypt_string` מצפין **ערך בודד** ומחזיר בלוק שאפשר להדביק בתוך קובץ YAML רגיל, כך ששאר הקובץ נשאר קריא ב-Git וב-code review.

</details>

<details class="qa">
<summary>2. איך מנהלים סיסמאות Vault שונות לסביבות production ו-staging באותו Repository?</summary>

עם Vault IDs: מצפינים עם `--vault-id prod@prompt` ו-`--vault-id staging@prompt`, ומריצים עם ה-ID המתאים (או עם כמה `--vault-id` יחד). כך לצוות שיש לו רק את סיסמת ה-staging אין גישה לסודות הפרודקשן, למרות ששניהם יושבים באותו repository.

</details>

<details class="qa">
<summary>3. מהי שיטת ה-vars.yml + vault.yml, ולמה היא עדיפה על הצפנת כל קובץ המשתנים?</summary>

מחזיקים קובץ `vars.yml` גלוי שבו כל המשתנים, כשהערכים הרגישים מפנים למשתנה מתוך `vault.yml` מוצפן (למשל `db_password: "{{ vault_db_password }}"`). היתרון: רואים ב-Git אילו משתנים קיימים ומה השתנה, בלי לחשוף את הערכים עצמם — בניגוד להצפנת הקובץ כולו, שבה כל diff הוא בלוק בינארי חסר משמעות.

</details>

<details class="qa">
<summary>4. איך תשלבו Ansible Vault בתהליך CI/CD מבלי לשמור סיסמאות בקוד?</summary>

שומרים את סיסמת ה-Vault כ-secret של מערכת ה-CI (GitHub Actions Secrets, GitLab CI Variables), כותבים אותה בזמן הריצה לקובץ זמני והעברה עם `--vault-password-file`, ומוחקים בסיום. אפשרות מתקדמת יותר: סקריפט `--vault-password-file` שמושך את הסיסמה מ-secrets manager (Vault של HashiCorp, AWS Secrets Manager).

</details>

<details class="qa">
<summary>5. מה עושה <code>no_log: true</code> ולמה הוא לא תחליף ל-Vault?</summary>

הוא מסתיר את הפלט של המשימה מהלוג ומ-`-v`, כדי שסיסמה לא תודפס למסך או ל-CI. הוא לא מצפין כלום — הערך עדיין יושב בקוד או במשתנה בטקסט גלוי. Vault מגן על הסוד **במנוחה** (ב-Git), ו-`no_log` מגן עליו רק **בתצוגה**; צריך את שניהם.

</details>

<details class="qa">
<summary>6. איך מבצעים סיבוב (rotation) של סיסמת Vault בלי לאבד גישה לסודות הקיימים?</summary>

עם `ansible-vault rekey` — הפקודה מפענחת עם הסיסמה הישנה ומצפינה מחדש עם החדשה, על כל הקבצים הרלוונטיים. חשוב לעשות זאת ב-branch נפרד, לוודא שכל הקבצים עברו rekey, לעדכן את הסיסמה בכל מקום שמשתמש בה (CI, מפתחים) ורק אז למזג.

</details>

## קישורים חיצוניים

**תיעוד רשמי:**
- Protecting sensitive data with Ansible vault: https://docs.ansible.com/projects/ansible/latest/vault_guide/vault.html
- Keep secret data in encrypted files: https://docs.ansible.com/projects/ansible/latest/vault_guide/vault_encrypting_content.html

**סרטוני YouTube מומלצים:**
- Ansible Full Course - Simplilearn (כולל התייחסות לניהול סודות): https://www.youtube.com/watch?v=EcnqJbxBcM0
- TechWorld with Nana - Ansible: https://www.youtube.com/channel/UCdngmbVKX1Tgre699-XLlUA

---
⬅️ [חזרה למדריך 7](/devops/ansible/07-roles/) | ➡️ [המדריך הבא: 09-advanced-devops.md](/devops/ansible/09-advanced-devops/)
