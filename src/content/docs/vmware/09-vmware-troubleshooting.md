---
sidebar_position: 9
title: "VMware #9 — Troubleshooting מעשי"
description: "מתודולוגיית איתור תקלות ב-vSphere: תרחישי VM איטי, Storage latency, בעיות רשת ו-vMotion שנכשל, בעזרת esxtop, esxcli ו-vmkping."
---

## שיטת העבודה

```text
Symptom
  ↓
Scope
  ↓
Evidence
  ↓
Hypothesis
  ↓
Test
  ↓
Root Cause
  ↓
Fix
  ↓
Validation
  ↓
Documentation
```

## 1. VM איטית

### אל תתחיל מלהוסיף CPU.

בדוק:

```text
Guest
 ↓
CPU Ready
 ↓
Memory Pressure
 ↓
Disk Latency
 ↓
Network
 ↓
Snapshots
```

### דוגמה

```text
CPU Usage       = 22%
CPU Ready       = High
Disk Latency    = Normal
Memory Pressure = Normal
```

הממצא המרכזי הוא CPU contention.

## 2. Storage latency

אם ה-Guest איטית:

```text
Guest Disk
 ↓
Virtual SCSI
 ↓
VMDK
 ↓
Datastore
 ↓
Path
 ↓
SAN/NAS
 ↓
Physical Storage
```

בודקים את כל השרשרת.

## 3. Network

```text
Guest
 ↓
vNIC
 ↓
Port Group
 ↓
vSwitch/vDS
 ↓
vmnic
 ↓
Switch
 ↓
VLAN
 ↓
Gateway
```

כל תקלה בשכבה יכולה ליצור אותו סימפטום: "אין Network".

## 4. esxtop

```bash
esxtop
```

למד לעבור בין:

- CPU
- Memory
- Disk
- Network

המעבדה הרשמית של VMware מתרגלת את ארבעת התחומים האלה וגם שמירת Statistics ל-CSV. citeturn0search0

## 5. vmkping

```bash
vmkping 192.168.30.12
```

בדיקה שימושית ל-VMkernel networking.

## 6. esxcli

```bash
esxcli network nic list
```

```bash
esxcli network ip interface ipv4 get
```

## 7. vim-cmd

לצפייה ב-VMs:

```bash
vim-cmd vmsvc/getallvms
```

## 8. תרחיש — vMotion נכשל

### Step 1

```bash
vmkping <destination-vmotion-ip>
```

### Step 2

בדוק VLAN.

### Step 3

בדוק MTU.

### Step 4

בדוק CPU/EVC.

### Step 5

בדוק Datastore.

### Step 6

בדוק Destination Port Group.

### Step 7

בדוק Events.

## 9. תרחיש — Datastore מלא

```text
Capacity = 100%
```

אל תתחיל ממחיקה אקראית.

בצע:

```text
Identify largest objects
 ↓
Check snapshots
 ↓
Check old files
 ↓
Check ISO
 ↓
Check backup jobs
 ↓
Create safe cleanup plan
 ↓
Validate
```

## 10. תרגיל מסכם

צור שלוש תקלות במעבדה:

1. VLAN שגוי.
2. Snapshot גדול.
3. vMotion Network לא תקין.

לכל תקלה כתוב:

- Symptom
- Evidence
- Root Cause
- Fix
- Validation

## 11. שאלות ראיון

<details class="qa">
<summary>1. איך תחקור VM איטית?</summary>

מפרידים בין השכבות: CPU (בעיקר `%RDY` ב-esxtop ו-CPU Ready), זיכרון (Ballooning/Swapping, `%SWPWT`), אחסון (DAVG/KAVG/GAVG) ורשת (packet loss, dropped). במקביל בודקים בתוך מערכת ההפעלה מה צורך משאבים, ואם יש snapshots ישנים או Limit שהוגדר על המכונה. רק אחרי שמזהים את השכבה — משנים משהו.

</details>

<details class="qa">
<summary>2. איך תבדוק Storage?</summary>

ב-esxtop במסך הדיסק בודקים DAVG (המערך), KAVG (תורים ב-kernel) ו-GAVG (מה שה-VM חווה). בודקים גם מצב Multipathing, תפוסת ה-Datastore, snapshots שגדלים ו-latency בצד מערך האחסון עצמו. אירועי `SCSI sense` בלוג `vmkernel.log` הם רמז חזק לבעיית נתיב או LUN.

</details>

<details class="qa">
<summary>3. איך תבדוק Network?</summary>

בודקים את סטטיסטיקות ה-NIC וה-Port Group (dropped packets), את ה-uplinks והמצב שלהם, `vmkping` מהממשק הרלוונטי (כולל בדיקת MTU עם `-d -s 8972`), הגדרות VLAN מול המתג הפיזי, ומדיניות teaming/failover. אם רק חלק מהמכונות מושפעות — מחפשים מה משותף להן (Port Group, uplink, Host).

</details>

<details class="qa">
<summary>4. מהו CPU Ready?</summary>

הזמן שבו ה-VM הייתה מוכנה לרוץ והמתינה ל-CPU פיזי. הוא נמדד ב-esxtop כ-`%RDY` — ערך גבוה משמעותו תחרות על המעבד: יותר מדי vCPUs למכונה, Host עמוס מדי או יחס overcommit אגרסיבי.

</details>

<details class="qa">
<summary>5. מה עושה esxtop?</summary>

כלי ניטור בזמן אמת שרץ בשורת הפקודה של ה-Host ומציג צריכת CPU (`c`), זיכרון (`m`), דיסק (`d`/`u`) ורשת (`n`) ברמת ה-Host, ה-VM וה-world. הוא הכלי המהיר ביותר לאבחון צוואר בקבוק, ואפשר גם להריץ אותו במצב batch כדי לאסוף נתונים לניתוח מאוחר יותר.

</details>

<details class="qa">
<summary>6. מה עושה vmkping?</summary>

שולח ping מממשק VMkernel ספציפי של ה-Host, כך שבודקים את מסלול ה-vMotion או האחסון עצמו ולא את רשת הניהול. עם `-d -s 8972` בודקים גם שה-Jumbo Frames עוברים ללא פיצול לאורך כל המסלול.

</details>

<details class="qa">
<summary>7. איך תחקור vMotion?</summary>

מוודאים שרשת ה-vMotion מוגדרת ותקינה בשני ה-Hosts (`vmkping` בין ממשקי ה-vMotion), שה-Datastore משותף ונגיש, שאין אי-התאמת CPU (EVC), שאין התקנים מחוברים למכונה (ISO מקומי, USB) ושאין כללי DRS או חוסר משאבים ביעד. הודעת השגיאה ב-Recent Tasks בדרך כלל מצביעה ישירות על הסיבה.

</details>

<details class="qa">
<summary>8. למה לא מוחקים VMDK ידנית?</summary>

כי דיסק וירטואלי מורכב מכמה קבצים (descriptor + flat/delta) ולעיתים הוא חלק משרשרת snapshots — מחיקה ידנית של קובץ אחד שוברת את השרשרת ומשאירה מכונה שלא ניתן להדליק. הדרך הנכונה היא דרך vCenter (Edit Settings / Delete from Disk), שמטפל בכל הקבצים ובקישורים ביניהם.

</details>

