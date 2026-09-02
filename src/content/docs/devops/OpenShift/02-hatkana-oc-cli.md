---
title: "התקנה, oc CLI וניהול פרויקטים ומשתמשים"
description: "התקנת כלי ה-oc במערכות השונות, התחברות לקלאסטר, ניהול Projects וקווטות משאבים, הרשאות משתמשים בסיסיות ופקודות oc יומיומיות כולל oc explain."
category: DevOps/OpenShift
part: 2/10
---

## התקנת ה-CLI (oc)

### macOS
```bash
brew install openshift-cli
# או הורדה ידנית:
curl -LO https://mirror.openshift.com/pub/openshift-v4/clients/ocp/stable/openshift-client-mac.tar.gz
tar xvf openshift-client-mac.tar.gz
sudo mv oc kubectl /usr/local/bin/
```

### Linux
```bash
curl -LO https://mirror.openshift.com/pub/openshift-v4/clients/ocp/stable/openshift-client-linux.tar.gz
tar xvf openshift-client-linux.tar.gz
sudo mv oc kubectl /usr/local/bin/
oc version --client
```

### Windows (PowerShell + Chocolatey)
```powershell
choco install openshift-cli
```

> טיפ: תמיד ניתן להוריד את גרסת ה-CLI התואמת בדיוק לגרסת הקלאסטר שלכם ישירות מהקונסולה הגרפית: לחצו על סמל שאלה (?) בפינה הימנית העליונה > **Command Line Tools**.

## התחברות לקלאסטר

```bash
# התחברות עם משתמש וסיסמה
oc login https://api.mycluster.example.com:6443 -u myuser -p mypassword

# התחברות עם טוקן (מומלץ בסביבות CI/CD)
oc login --token=sha256~xxxxxxxxxxxxxxxxxxxxx --server=https://api.mycluster.example.com:6443

# התעלמות משגיאות תעודה (רק לסביבות פיתוח!)
oc login https://api.mycluster.example.com:6443 -u myuser -p mypassword --insecure-skip-tls-verify=true

# בדיקת מי אני מחובר כרגע
oc whoami
oc whoami --show-server
oc whoami -t   # מציג את הטוקן הנוכחי
```

## ניהול Projects (Namespaces)

```bash
# יצירת פרויקט חדש
oc new-project my-app --display-name="My Application" --description="Demo project"

# מעבר בין פרויקטים
oc project my-app
oc project default

# רשימת כל הפרויקטים שיש לי גישה אליהם
oc get projects
oc projects

# מחיקת פרויקט
oc delete project my-app

# צפייה בפרויקט הנוכחי
oc project
```

### קווטות ומגבלות משאבים (ResourceQuota / LimitRange)

```yaml
# resource-quota.yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: demo-quota
  namespace: my-app
spec:
  hard:
    requests.cpu: "4"
    requests.memory: 8Gi
    limits.cpu: "8"
    limits.memory: 16Gi
    pods: "20"
```

```bash
oc apply -f resource-quota.yaml
oc describe quota demo-quota -n my-app
```

## ניהול משתמשים והרשאות בסיסי

```bash
# רשימת משתמשים בקלאסטר (דורש הרשאות אדמין)
oc get users
oc get identities

# הענקת תפקיד (Role) למשתמש בפרויקט מסוים
oc adm policy add-role-to-user edit jdoe -n my-app
oc adm policy add-role-to-user view jdoe -n my-app
oc adm policy add-role-to-user admin jdoe -n my-app

# הענקת תפקיד cluster-admin (זהירות!)
oc adm policy add-cluster-role-to-user cluster-admin jdoe

# בדיקה מי יכול לבצע פעולה מסוימת
oc adm policy who-can create pods -n my-app
oc adm policy who-can delete deployments -n my-app
```

## פקודות ניהול בסיסיות שכל DevOps חייב להכיר

```bash
# הצגת כל המשאבים בפרויקט הנוכחי
oc get all

# הצגה עם פרטים נוספים (IP, node וכו')
oc get pods -o wide

# תיאור מפורט של משאב (הדרך #1 לאבחון בעיות!)
oc describe pod my-pod-xyz

# יומני לוג (logs) של פוד
oc logs my-pod-xyz
oc logs -f my-pod-xyz          # מעקב חי (follow)
oc logs my-pod-xyz -c my-container  # עם מספר קונטיינרים בפוד
oc logs my-pod-xyz --previous  # לוגים מהריצה הקודמת (אחרי קריסה)

# כניסה לתוך קונטיינר רץ (shell)
oc rsh my-pod-xyz
oc exec -it my-pod-xyz -- /bin/bash

# העתקת קבצים מ/אל פוד
oc cp my-pod-xyz:/app/config.yaml ./config.yaml
oc cp ./local-file.txt my-pod-xyz:/tmp/

# port-forward לבדיקה מקומית
oc port-forward my-pod-xyz 8080:80

# עריכה חיה של משאב (פותח עורך טקסט)
oc edit deployment my-app

# מחיקת משאב
oc delete pod my-pod-xyz
oc delete -f manifest.yaml

# ייצוא משאב קיים ל-YAML (שימושי מאוד ללימוד!)
oc get deployment my-app -o yaml
oc get deployment my-app -o yaml --export  # בגרסאות ישנות
```

## oc explain - הכלי הכי לא-מוערך

```bash
# מסביר את כל השדות האפשריים במשאב מסוים
oc explain pod
oc explain pod.spec.containers
oc explain deployment.spec.strategy
```

## דוגמה מלאה: זרימת עבודה טיפוסית ביום-יום

```bash
# 1. התחברות
oc login https://api.mycluster.example.com:6443 -u developer

# 2. יצירת/מעבר לפרויקט
oc new-project team-a-dev

# 3. פריסת אפליקציה מתמונה קיימת
oc new-app nginx:latest --name=my-nginx

# 4. חשיפה החוצה
oc expose service my-nginx

# 5. בדיקת הסטטוס
oc get pods -w      # -w = watch, מתעדכן חי
oc status

# 6. בדיקת ה-URL שנוצר
oc get route my-nginx

# 7. בדיקת לוגים במקרה של בעיה
oc logs -f deployment/my-nginx

# 8. ניקוי בסוף העבודה
oc delete all -l app=my-nginx
```

## Auto-completion (חוסך המון זמן!)

```bash
# Bash
echo 'source <(oc completion bash)' >> ~/.bashrc

# Zsh
echo 'source <(oc completion zsh)' >> ~/.zshrc
```

## קישורים חיצוניים

### תיעוד רשמי
- CLI Tools - Getting started with the OpenShift CLI: https://docs.redhat.com/en/documentation/openshift_container_platform/4.22
- מדריך התקנה רשמי (GitHub docs): https://github.com/openshift/openshift-docs
- Red Hat OpenShift essentials - קישורים מרוכזים: https://docs.redhat.com/en/essentials/openshift

### סרטוני יוטיוב מומלצים
- Red Hat OpenShift Installation Step by Step Guide (SNO): https://www.youtube.com/watch?v=K30USMxTAa0
- Getting Started with Red Hat OpenShift: https://www.youtube.com/watch?v=hnYDrVl-Mzw
- OpenShift Interaktives 1x1 für Einsteiger (בסיס + CLI): https://www.youtube.com/watch?v=R_qAZh9Emu0

## טיפים וטריקים

1. **תמיד תשתמשו ב-`-o wide`** כשמריצים `oc get pods` כדי לראות מיד על איזה node כל פוד רץ - חוסך שלב אבחון שלם.
2. **`oc get events --sort-by='.lastTimestamp'`** - מציג את כל האירועים האחרונים בפרויקט לפי זמן, מעולה לאבחון מהיר.
3. השתמשו ב-**alias** לקיצור עבודה יומיומית: `alias k=oc` (אבל היזהרו שלא תתבלבלו עם kubectl אמיתי בפרויקטים אחרים).
4. `oc get pods --field-selector=status.phase=Running` - סינון פודים לפי סטטוס.
5. `watch oc get pods` (בלינוקס/מאק) - מרענן את הפלט כל 2 שניות בלי `-w`, שימושי כשרוצים לראות גם פקודות אחרות במקביל.

---
**במדריך הבא:** Pods, Deployments, DeploymentConfigs ו-ReplicaSets לעומק.
