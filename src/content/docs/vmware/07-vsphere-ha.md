---
sidebar_position: 7
title: "VMware #7 — vSphere HA לעומק: Failure, Isolation ו-Admission Control"
description: "מנגנוני vSphere HA: זיהוי Host Failure מול Isolation, מדיניות Admission Control, סדרי עדיפות להפעלה מחדש ותחקור VM שלא התאוששה."
---

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

<details class="qa">
<summary>1. האם HA עושה vMotion?</summary>

לא. HA **מפעיל מחדש** מכונות על Host אחר אחרי כשל — יש זמן השבתה של דקות ספורות עד שמערכת ההפעלה עולה. vMotion הוא העברה חיה ומתוכננת של מכונה שרצה, והוא שייך ל-DRS ולתחזוקה, לא לתרחיש הכשל.

</details>

<details class="qa">
<summary>2. מהו Admission Control?</summary>

מנגנון שמונע הפעלת מכונות נוספות אם לא יישארו מספיק משאבים פנויים כדי להפעיל מחדש את כל המכונות בעת כשל Host. מגדירים אותו לפי אחוז משאבים שמור, לפי מספר Hosts שמותר שייכשלו או לפי Failover Host ייעודי. ביטולו "מרוויח" משאבים בטווח הקצר אבל עלול לגרום ל-HA להיכשל בדיוק ברגע האמת.

</details>

<details class="qa">
<summary>3. מה ההבדל בין Host Failure ל-Isolation?</summary>

Host Failure הוא כשל אמיתי — ה-Host מת ואינו מגיב ל-heartbeats ולא ל-Datastore heartbeating. Isolation הוא מצב שבו ה-Host חי וממשיך להריץ VMs אבל מנותק מרשת הניהול. ההבחנה חשובה כדי לא להפעיל מחדש מכונות שעדיין רצות (split-brain), ולכן מגדירים Isolation Response ומסתמכים גם על heartbeat דרך ה-Datastore.

</details>

<details class="qa">
<summary>4. למה Shared Storage עשוי להיות חשוב?</summary>

כי כדי ש-Host אחר יוכל להפעיל מכונה שנפלה, הוא צריך גישה לקבצי ה-VMDK שלה. אחסון משותף (או vSAN) הוא התנאי ל-HA, ל-vMotion ול-DRS; בלי זה כל מכונה כבולה ל-Host שעליו הדיסק שלה יושב.

</details>

<details class="qa">
<summary>5. מהו Restart Priority?</summary>

הגדרה לכל VM שקובעת את סדר ההפעלה מחדש אחרי כשל (Highest / High / Medium / Low / Disabled). כך מוודאים שתשתיות קודמות — בקר דומיין, DNS, מסד נתונים — יעלו לפני שרתי האפליקציה שתלויים בהן.

</details>

<details class="qa">
<summary>6. איך תחקור VM שלא התאוששה?</summary>

בודקים את ה-Events והלוג `fdm.log` ב-Hosts, אם ה-HA agent במצב תקין, אם היו מספיק משאבים (Admission Control), אם ה-VM נמצאת על Datastore משותף ונגישה מה-Host השני, אם קיימים כללי Affinity שמונעים מיקום, והאם ה-Restart Priority הוגדר ל-Disabled. בנוסף בודקים אם המכונה בכלל עלתה אך נכשלה ברמת מערכת ההפעלה.

</details>

## 11. מעבדות

[VMware Hands-on Labs](https://labs.hol.vmware.com/HOL/catalog/)

[YouTube — vSphere HA](https://www.youtube.com/results?search_query=VMware+vSphere+HA+deep+dive)
