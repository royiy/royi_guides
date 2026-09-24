---
sidebar_position: 5
title: "VMware #5 — Storage לעומק: VMFS, NFS, iSCSI ו-Performance"
description: "השוואת VMFS, NFS ו-iSCSI, Multipathing, מדדי ביצועי Storage כמו Latency ו-IOPS, Thin Provisioning, ניהול Snapshots וטיפול ב-Datastore מלא."
---

## 1. איך VM נשמרת?

```text
VM
├── Configuration
├── Virtual Disk
├── NVRAM
├── Logs
└── Snapshot files
        │
        ▼
    Datastore
```

## 2. Local לעומת Shared Storage

### Local

```text
ESXi01
└── Local Datastore
```

### Shared

```text
              Storage
             /       \
          ESXi01    ESXi02
             \       /
              Datastore
```

Shared Storage מאפשר תרחישים מסוימים של Cluster ו-Mobility.

## 3. VMFS

VMFS הוא File System של VMware עבור Datastores מבוססי Block.

```text
Storage Array
     │
    LUN
     │
   VMFS
     │
   Datastore
```

## 4. NFS

```text
ESXi
  │
Ethernet
  │
NAS
  │
NFS
  │
Datastore
```

## 5. iSCSI

```text
ESXi
 │
VMkernel
 │
IP Network
 │
iSCSI Target
 │
LUN
 │
Datastore
```

## 6. Multipathing

```text
                Storage
               /       \
          Path A       Path B
             \         /
                ESXi
```

אם Path אחד נופל, ניתן להמשיך דרך Path אחר בהתאם לתכנון ולמדיניות.

## 7. Storage Performance

המדדים המרכזיים:

- Latency
- IOPS
- Throughput
- Queue
- Read/Write
- Outstanding I/O

### כלל חשוב

VM איטית ≠ בהכרח CPU.

לדוגמה:

```text
CPU Usage: 25%
CPU Ready: Low
Storage Latency: High
```

במקרה כזה Storage חשוד יותר מ-CPU.

## 8. Thin Provisioning

דוגמה:

```text
VMDK = 500 GB
Actual Data = 80 GB
```

Thin יכול לחסוך מקום, אך יוצר סיכון אם ה-Storage הפיזי מתמלא.

## 9. Datastore 99%

```text
Datastore01
████████████████████ 99%
```

בדוק:

```text
Snapshots
ISO
Old VMDKs
Logs
Orphaned files
Thin disks
```

**לעולם אל תמחק VMDK ידנית בלי להבין את הקשרים והמצב של ה-VM.**

## 10. Snapshot

Snapshot יכול ליצור Delta files.

```text
Base VMDK
   │
Snapshot
   │
Delta
   │
Guest Writes
```

Snapshots לטווח ארוך עלולים ליצור בעיות Capacity ו-Performance.

## 11. תרגיל

בנה:

```text
Storage
├── Datastore01
└── Datastore02
```

העבר VM בין Datastores ובדוק Tasks.

## 12. תרחיש תקלה

Datastore התמלא.

עבוד:

```text
Capacity
 ↓
Largest Files
 ↓
Snapshots
 ↓
Unused ISO
 ↓
Old VM files
 ↓
Backup interactions
 ↓
Cleanup plan
```

## 13. Performance Lab

VMware Hands-on Labs מציעה מעבדת Performance שמתרגלת esxtop וניתוח CPU, Memory, Storage ו-Network. citeturn0search0

[VMware Hands-on Labs](https://labs.hol.vmware.com/HOL/catalog/)

## 14. שאלות ראיון

<details class="qa">
<summary>1. מהו Datastore?</summary>

מאגר אחסון לוגי שבו נשמרים קבצי ה-VM — VMDK, VMX, snapshots ולוגים. הוא יושב על VMFS (אחסון בלוקי: FC, iSCSI, מקומי) או על NFS. Datastore משותף בין Hosts הוא תנאי ליכולות קלאסטר כמו vMotion ו-HA.

</details>

<details class="qa">
<summary>2. VMFS מול NFS?</summary>

VMFS היא מערכת קבצים אשכולית של VMware על LUN בלוקי — ESXi מנהל את הנעילות ואת הבלוקים בעצמו, ותומך ב-RDM וב-VMFS-only features. NFS הוא אחסון מבוסס קבצים שבו שרת האחסון מנהל את מערכת הקבצים, ההגדרה פשוטה יותר ואין צורך ב-LUN masking. שניהם נתמכים במלואם; הבחירה תלויה בתשתית ובהעדפת צוות האחסון.

</details>

<details class="qa">
<summary>3. מהו LUN?</summary>

Logical Unit Number — יחידת אחסון בלוקית שמוצגת מה-SAN ל-Host דרך FC או iSCSI. ה-Host רואה אותה כדיסק, ועליה נוצרת מערכת הקבצים VMFS שהופכת אותה ל-Datastore.

</details>

<details class="qa">
<summary>4. מהו iSCSI?</summary>

פרוטוקול שמעביר פקודות SCSI מעל רשת TCP/IP, כלומר אחסון בלוקי על גבי Ethernet רגיל — ללא צורך ב-Fibre Channel ייעודי. ב-ESXi מגדירים Software iSCSI Adapter, מקשרים אותו ל-VMkernel ports ייעודיים, ומוסיפים את ה-Target. מומלץ רשת/VLAN נפרדת, ורצוי Jumbo Frames ו-Multipathing.

</details>

<details class="qa">
<summary>5. למה צריך Multipathing?</summary>

כדי שיהיה יותר ממסלול פיזי אחד בין ה-Host לאחסון — HBA, מתג או בקר שנופלים לא מנתקים את ה-Datastore. מעבר ליתירות, מדיניות כמו Round Robin מחלקת את ה-I/O בין המסלולים ומשפרת ביצועים.

</details>

<details class="qa">
<summary>6. מה הסיכון ב-Thin Provisioning?</summary>

הקצאת יתר (overcommit): סכום הדיסקים המוקצים גדול מהמקום הפיזי, וכשהמכונות מתמלאות ה-Datastore עלול להתמלא לגמרי — מצב שמקפיא מכונות באופן מיידי. לכן חובה ניטור והתרעות על תפוסה, מעקב אחרי snapshots שגדלים, ותכנון מרווח פנוי.

</details>

<details class="qa">
<summary>7. למה Snapshot אינו Backup?</summary>

כי Snapshot הוא שרשרת דלתא שנשענת על הדיסק המקורי ויושבת על אותו Datastore — אם ה-Datastore או ה-VM נפגעים, גם הוא אבד. בנוסף snapshots ישנים תופסים מקום וגורמים לירידת ביצועים חמורה. גיבוי אמיתי הוא עותק נפרד, במיקום נפרד, שניתן לשחזר ממנו לנקודת זמן.

</details>

<details class="qa">
<summary>8. איך תחקור Storage latency?</summary>

מתחילים ב-esxtop במסך הדיסק (`u`/`d`) ובודקים את `DAVG` (זמן במערך האחסון), `KAVG` (זמן ב-kernel — ערך גבוה מרמז על queueing) ו-`GAVG` (מה שה-VM חווה בפועל). ערכים מעל ~20ms ב-DAVG מצביעים על בעיה בצד האחסון. משם בודקים Multipathing, queue depth, עומס על ה-LUN ו-snapshots ישנים.

</details>

