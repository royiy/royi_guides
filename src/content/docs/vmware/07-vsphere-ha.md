---
sidebar_position: 7
title: "VMware #7 — vSphere HA לעומק: Failure, Isolation ו-Admission Control"
---

# VMware #7 — vSphere HA לעומק

## 1. מטרת HA

HA נועד לסייע בהתאוששות ממצב שבו Host נכשל, באמצעות הפעלה מחדש של VMs על Hosts אחרים ב-Cluster.

```text
Before:
ESXi01 → VM01 VM02
ESXi02 → VM03

ESXi01 FAILURE

After:
ESXi02 → VM03 VM01 VM02
```

## 2. HA אינו vMotion

| Feature | מה עושה |
|---|---|
| vMotion | Migration חי |
| HA | Restart לאחר כשל |
| DRS | איזון משאבים |

## 3. Failure Detection

HA צריך להבחין בין:

```text
Host Failure
Host Isolation
Network Partition
```

אלו תרחישים שונים עם השלכות שונות.

## 4. Admission Control

Admission Control מוודא שה-Cluster לא יצרוך את כל ה-Capacity כך שלא תישאר יכולת להתאושש בהתאם למדיניות שנבחרה.

דוגמה רעיונית:

```text
Total Capacity
████████████████████
Reserved for Failure
████
Available
████████████████
```

## 5. Restart Priority

VMs שונות יכולות להיות בעלות חשיבות שונה.

לדוגמה:

```text
Critical:
DC01
SQL01

Normal:
APP01

Low:
TEST01
```

הגדרות בפועל צריכות להתאים לתכנון העסקי.

## 6. Datastore Heartbeat

בסביבה מתאימה, Datastore Heartbeats יכולים לספק מידע נוסף לגבי מצב Hosts כאשר קיימת בעיית תקשורת.

## 7. VM Monitoring

VM Monitoring יכול לזהות מצב שבו Guest/VM אינה מגיבה ולהפעיל מנגנוני התאוששות בהתאם לתצורה ולתמיכה.

## 8. מעבדת HA

### טופולוגיה

```text
Cluster01
├── ESXi01
│   └── DC01
└── ESXi02
    └── APP01
```

### תרגיל

1. הפעל HA.
2. ודא שה-VM על ESXi01.
3. תעד את המצב.
4. בסביבת Lab בלבד, דמה כשל Host.
5. בדוק Events.
6. בדוק Restart.
7. תעד זמן התאוששות.

**אין לבצע Fault Injection כזה ב-Production.**

## 9. תחקור HA

כאשר VM לא הופעלה מחדש:

```text
HA Status
 ↓
Host State
 ↓
Admission Control
 ↓
Datastore
 ↓
Network
 ↓
VM Configuration
 ↓
Events
```

## 10. שאלות ראיון

1. האם HA עושה vMotion?
2. מהו Admission Control?
3. מה ההבדל בין Host Failure ל-Isolation?
4. למה Shared Storage עשוי להיות חשוב?
5. מהו Restart Priority?
6. איך תחקור VM שלא התאוששה?

## 11. מעבדות

[VMware Hands-on Labs](https://labs.hol.vmware.com/HOL/catalog/)

[YouTube — vSphere HA](https://www.youtube.com/results?search_query=VMware+vSphere+HA+deep+dive)
