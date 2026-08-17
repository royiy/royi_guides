---
title: "Ansible ב-DevOps - CI/CD, AWX/Tower ופרקטיקות מתקדמות"
category: DevOps/Ansible
part: 9/10
---

## Ansible בתהליכי CI/CD

Ansible משתלב בקלות בכלי CI/CD כמו Jenkins, GitLab CI ו-GitHub Actions, ומאפשר אוטומציה מלאה של תהליך הבנייה, הבדיקה והפריסה (Build-Test-Deploy).

### דוגמה: GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy with Ansible

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Install Ansible
        run: pip install ansible

      - name: Setup SSH key
        run: |
          mkdir -p ~/.ssh
          echo "${{ secrets.SSH_PRIVATE_KEY }}" > ~/.ssh/deploy_key
          chmod 600 ~/.ssh/deploy_key

      - name: Setup Vault password
        run: echo "${{ secrets.VAULT_PASSWORD }}" > .vault_pass.txt

      - name: Run Ansible Playbook
        run: |
          ansible-playbook -i inventories/production/hosts.ini \
            playbooks/deploy.yml \
            --private-key ~/.ssh/deploy_key \
            --vault-password-file .vault_pass.txt
```

### דוגמה: GitLab CI Pipeline

```yaml
# .gitlab-ci.yml
stages:
  - lint
  - deploy

lint:
  stage: lint
  image: python:3.11
  script:
    - pip install ansible ansible-lint
    - ansible-lint playbooks/

deploy_production:
  stage: deploy
  image: python:3.11
  script:
    - pip install ansible
    - echo "$VAULT_PASSWORD" > .vault_pass.txt
    - ansible-playbook -i inventories/production/hosts.ini playbooks/deploy.yml --vault-password-file .vault_pass.txt
  only:
    - main
  environment:
    name: production
```

### דוגמה: Jenkins Pipeline (Declarative)

```groovy
pipeline {
    agent any
    stages {
        stage('Lint') {
            steps {
                sh 'ansible-lint playbooks/'
            }
        }
        stage('Deploy to Staging') {
            steps {
                sh '''
                    ansible-playbook -i inventories/staging/hosts.ini \
                    playbooks/deploy.yml --vault-password-file /secure/vault_pass.txt
                '''
            }
        }
        stage('Approval') {
            steps {
                input message: 'האם לפרוס לפרודקשן?'
            }
        }
        stage('Deploy to Production') {
            steps {
                sh '''
                    ansible-playbook -i inventories/production/hosts.ini \
                    playbooks/deploy.yml --vault-password-file /secure/vault_pass.txt
                '''
            }
        }
    }
}
```

## AWX / Ansible Automation Platform (Tower)

**AWX** הוא הפרויקט הקוד-פתוח שעליו מבוסס **Red Hat Ansible Automation Platform** (בעבר Ansible Tower). זהו ממשק Web מלא לניהול Playbooks, Inventories, Credentials ותזמון הרצות, עם RBAC (ניהול הרשאות), לוגים מרכזיים ו-API מלא.

### יתרונות עיקריים של AWX/Tower

- **ממשק גרפי (Web UI)** להרצת Playbooks ללא צורך בגישת CLI ישירה.
- **RBAC** - ניהול הרשאות מדויק: מי יכול להריץ מה, על אילו שרתים.
- **Job Templates** - הגדרת "תבניות הרצה" מוכנות מראש (Playbook + Inventory + Credentials).
- **Scheduling** - הרצה מתוזמנת (Cron-like) של Playbooks.
- **Surveys** - טפסים אינטראקטיביים לפני הרצה (איסוף פרמטרים מהמשתמש).
- **Notifications** - שילוב עם Slack, Email, PagerDuty בעת הצלחה/כישלון.
- **REST API** - הפעלת הרצות מתוך מערכות אחרות (Jenkins, ServiceNow וכו').

### התקנת AWX (בקצרה, בעזרת Docker Compose / Kubernetes Operator)

```bash
git clone https://github.com/ansible/awx.git
cd awx/tools/docker-compose
make docker-compose-build
docker-compose up -d
```

לרוב מומלץ להתקין AWX על Kubernetes באמצעות **AWX Operator**:

```bash
kubectl apply -f https://raw.githubusercontent.com/ansible/awx-operator/devel/deploy/awx-operator.yaml
```

## Execution Environments

Execution Environment (EE) הוא קונטיינר Docker/Podman המכיל את כל התלויות הנדרשות להרצת Playbook (Python, Collections, dependencies) - מבטיח עקביות בין סביבות שונות.

```bash
ansible-builder build -t my-custom-ee:latest -f execution-environment.yml
```

דוגמה ל-`execution-environment.yml`:

```yaml
version: 3
images:
  base_image:
    name: quay.io/ansible/ansible-runner:latest
dependencies:
  galaxy: requirements.yml
  python: requirements.txt
```

## Testing עם Molecule

**Molecule** הוא כלי בדיקות אוטומטיות ל-Roles, המריץ Playbooks בתוך קונטיינרים/VMs ובודק שהתוצאה תואמת ציפיות.

```bash
pip install molecule molecule-plugins[docker]
molecule init scenario -r roles/nginx -d docker
```

מבנה בדיקה בסיסי:

```
roles/nginx/molecule/default/
├── molecule.yml
├── converge.yml
└── verify.yml
```

הרצת הבדיקה:

```bash
cd roles/nginx
molecule test
```

## Ansible Lint - בדיקת איכות קוד

```bash
pip install ansible-lint
ansible-lint playbooks/site.yml
```

דוגמה לקובץ `.ansible-lint` להתאמת חוקים:

```yaml
skip_list:
  - yaml[line-length]
  - experimental
```

## אסטרטגיות Rolling Deployment (Zero Downtime)

```yaml
---
- name: פריסה עם Rolling Update
  hosts: webservers
  serial: 2          # מעדכן 2 שרתים בכל פעם
  max_fail_percentage: 25
  tasks:
    - name: הוצאת שרת מה-Load Balancer
      ansible.builtin.uri:
        url: "http://lb.example.com/api/disable/{{ inventory_hostname }}"
        method: POST

    - name: עדכון הקוד
      ansible.builtin.git:
        repo: 'https://github.com/example/app.git'
        dest: /opt/app
        version: "{{ deploy_version }}"

    - name: הפעלה מחדש של השירות
      ansible.builtin.systemd:
        name: myapp
        state: restarted

    - name: בדיקת Health Check
      ansible.builtin.uri:
        url: "http://localhost:8080/health"
        status_code: 200
      retries: 5
      delay: 10

    - name: החזרת שרת ל-Load Balancer
      ansible.builtin.uri:
        url: "http://lb.example.com/api/enable/{{ inventory_hostname }}"
        method: POST
```

## Strategy Plugins - שליטה בסדר הביצוע

```yaml
- name: Play עם free strategy (כל שרת מתקדם בקצב שלו)
  hosts: all
  strategy: free
  tasks:
    - name: משימה ארוכה
      ansible.builtin.command: /opt/long_running_task.sh
```

השוואה בין אסטרטגיות:

| Strategy | תיאור |
|---|---|
| `linear` (ברירת מחדל) | כל השרתים מבצעים Task אחד יחד לפני המעבר לבא |
| `free` | כל שרת מתקדם בקצב שלו, ללא סנכרון |
| `host_pinned` | כמו free, אך שומר עובד (worker) קבוע לכל שרת |

## Performance Tuning - האצת ריצה

```ini
# ansible.cfg
[defaults]
forks = 50                      # מספר שרתים מקבילים
gathering = smart               # cache facts חכם
fact_caching = jsonfile
fact_caching_connection = /tmp/ansible_facts_cache
fact_caching_timeout = 86400

[ssh_connection]
pipelining = True                # מפחית מספר חיבורי SSH
control_path = /tmp/ansible-ssh-%%h-%%p-%%r
```

## טיפים וטריקים

1. **`--diff --check`** ב-CI כשלב "Plan" לפני "Apply" בפועל, בדומה לזרימת עבודה של Terraform.
2. **`ansible-lint`** כ-Gate חובה ב-CI - מונע push של קוד ברמה נמוכה.
3. **AWX/Tower Job Templates** מאפשרים לתת לצוותי DevOps/Support הרשאה מוגבלת להריץ Playbooks ספציפיים בלבד, בלי גישה ל-SSH ישירה.
4. **`serial`** קריטי לפריסות Zero-Downtime - אל תעדכנו את כל השרתים בבת אחת בפרודקשן.
5. **Execution Environments** פותרים את בעיית "עובד אצלי במחשב" בין ה-Control Node של מפתח לזה של ה-CI.
6. הפעילו **`pipelining = True`** להאצה משמעותית בזמן ריצה (עד פי 2 מהירות במקרים מסוימים).

## שאלות ראיון עבודה נפוצות

1. מה זה AWX וההבדל בינו לבין Ansible Automation Platform (Tower)?
2. איך תשלבו Ansible Vault בתוך pipeline של GitLab CI/GitHub Actions מבלי לחשוף סיסמאות?
3. מה ההבדל בין אסטרטגיית `linear` ל-`free`, ומתי תבחרו בכל אחת?
4. מה זה `serial` ב-Playbook ולמה הוא קריטי לפריסות Production?
5. מה זה Execution Environment ולמה הוא פתרון עדיף על התקנת תלויות ישירות על ה-Control Node?
6. איך תבנו תהליך Rolling Deployment עם בדיקות Health Check אוטומטיות ו-rollback במקרה כשלון?
7. מהו Molecule ולמה הוא חשוב לבדיקת Roles לפני שילוב בפרודקשן?

## קישורים חיצוניים

**תיעוד רשמי:**
- Ansible Automation Platform: https://docs.ansible.com/projects/ansible/latest/getting_started/index.html
- AWX Project (GitHub): https://github.com/ansible/awx
- Ansible Lint Documentation: https://ansible.readthedocs.io/projects/lint/

**סרטוני YouTube מומלצים:**
- TechWorld with Nana - Ansible (כולל אינטגרציית CI/CD): https://www.youtube.com/channel/UCdngmbVKX1Tgre699-XLlUA
- Ansible Full Course | Zero to Hero (8 שעות, כולל נושאים מתקדמים): https://www.youtube.com/watch?v=lhFvMsy6VX8
- Ansible Full Course - Edureka: https://www.youtube.com/watch?v=9Ua2b06oAr4

---
⬅️ [חזרה למדריך 8](/devops/ansible/08-vault-security/) | ➡️ [המדריך הבא: 10-interview-questions.md](/devops/ansible/10-interview-questions/)
