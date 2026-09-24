---
sidebar_position: 6
title: "VMware #6 — Cluster, vMotion ו-DRS לעומק"
description: "איך vMotion ו-Storage vMotion עובדים בפועל, בניית Cluster, כללי DRS Affinity ו-Anti-Affinity, תפקיד EVC ותחקור כשל vMotion."
---

## 1. Cluster

```text
Production Cluster
├── ESXi01
├── ESXi02
└── ESXi03
```

Cluster מאפשר יכולות משותפות כגון HA ו-DRS.

## 2. vMotion — מה באמת קורה?

בפשטות:

```text
VM Memory
   │
   ▼
Pre-copy
   │
Dirty Pages
   │
   ▼
Final Switchover
   │
   ▼
VM continues on destination
```

העברה חיה תלויה בתאימות CPU, Networking, Storage וביכולות הסביבה.

## 3. VMkernel עבור vMotion

תכנון:

```text
VLAN 30
192.168.30.0/24

ESXi01 vmk1 → 192.168.30.11
ESXi02 vmk1 → 192.168.30.12
```

בדיקה:

```bash
vmkping 192.168.30.12
```

## 4. Checklist לפני vMotion

- [ ] שני Hosts ב-vCenter
- [ ] vMotion VMkernel
- [ ] Network connectivity
- [ ] MTU תקין
- [ ] CPU compatibility
- [ ] EVC במידת הצורך
- [ ] Datastore/Storage נגיש
- [ ] Port Group קיים ביעד
- [ ] הרשאות/Features מתאימים

## 5. Storage vMotion

```text
VM01
 │
 ├── Compute → ESXi01
 │
 └── Disk → Datastore02
```

Compute ו-Storage הם שני ממדים שונים.

## 6. DRS

DRS מסתכל על עומסים ומשאבים בתוך Cluster.

```text
ESXi01 20%
ESXi02 90%
ESXi03 30%
```

בהתאם למדיניות, המערכת יכולה להמליץ או לבצע Migration.

## 7. DRS Rules

תרחישים:

### Affinity

VMs יחד.

```text
APP01 + APP02
      ↓
Same Host
```

### Anti-Affinity

להפריד VMs:

```text
DC01 → ESXi01
DC02 → ESXi02
```

זה שימושי כדי להקטין Single Point of Failure.

## 8. EVC

EVC מסייע ל-CPU compatibility בין Hosts עם דורות שונים, בהתאם לתמיכה ולמגבלות.

## 9. תרגיל

בנה:

```text
Cluster01
├── ESXi01
│   ├── VM01
│   └── VM02
└── ESXi02
    ├── VM03
    └── VM04
```

בצע:

1. vMotion.
2. בדוק Events.
3. הפעל DRS.
4. בדוק Recommendations.
5. בדוק Rules.

## 10. תרחיש תקלה

vMotion נכשל.

### סימפטום

```text
Migration failed
```

### תהליך

```text
vMotion VMkernel
 ↓
vmkping
 ↓
MTU
 ↓
CPU/EVC
 ↓
Datastore
 ↓
Port Group
 ↓
Events
```

## 11. שאלות ראיון

<details class="qa">
<summary>1. מה קורה בזמן vMotion?</summary>

ה-Host היעד מקבל מכונה "ריקה", זיכרון ה-VM מועתק אליו ברקע בכמה סבבים (pre-copy) בזמן שהמכונה ממשיכה לרוץ, ובסוף יש הקפאה קצרצרה (switchover) שבה מועברים הדפים האחרונים ומצב המעבד — ואז המכונה ממשיכה לרוץ על ה-Host החדש. הדיסק נשאר במקומו ב-Datastore המשותף.

</details>

<details class="qa">
<summary>2. מה ההבדל בין vMotion ל-Storage vMotion?</summary>

vMotion מעביר את **החישוב** — המכונה עוברת ל-Host אחר, הדיסק נשאר. Storage vMotion מעביר את **הקבצים** — ה-VMDK עובר ל-Datastore אחר בזמן שהמכונה רצה על אותו Host. אפשר גם לשלב את שניהם (Cross-Host vMotion / XvMotion).

</details>

<details class="qa">
<summary>3. מה עושה DRS?</summary>

מנטר את העומס (CPU וזיכרון) על ה-Hosts בקלאסטר ומבצע או ממליץ על vMotion כדי לאזן. הוא גם בוחר את ה-Host המתאים בהפעלת VM חדשה, ומכבד כללי Affinity/Anti-Affinity. רמת האוטומציה נעה בין המלצות בלבד ל-Fully Automated.

</details>

<details class="qa">
<summary>4. מהו EVC?</summary>

Enhanced vMotion Compatibility — מסכה שמציגה לכל המכונות בקלאסטר מערכת פקודות (CPU baseline) אחידה, כך שאפשר לבצע vMotion גם בין Hosts עם דורות מעבד שונים. בלעדיו ההעברה תיחסם בגלל אי-התאמת תכונות CPU. מומלץ להפעיל מראש — הפעלה בדיעבד עשויה לדרוש כיבוי מכונות.

</details>

<details class="qa">
<summary>5. מהו DRS Rule?</summary>

כלל שמגביל את שיקול הדעת של DRS במיקום מכונות: Affinity (השאר יחד), Anti-Affinity (הפרד), או VM-Host rules ("should"/"must") שמצמידות מכונות לקבוצת Hosts — למשל מטעמי רישוי או קרבה לאחסון.

</details>

<details class="qa">
<summary>6. למה Anti-Affinity שימושי?</summary>

כדי ששני שרתים שאמורים לגבות זה את זה — שני בקרי דומיין, שני צמתים בקלאסטר SQL, שני שרתי Web מאחורי Load Balancer — לא ירוצו על אותו Host פיזי. כך כשל חומרה בודד לא מפיל את שני העותקים בבת אחת.

</details>

