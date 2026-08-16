---
sidebar_position: 5
title: "VMware #5 — Storage לעומק: VMFS, NFS, iSCSI ו-Performance"
---

# VMware #5 — Storage לעומק

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

1. מהו Datastore?
2. VMFS מול NFS?
3. מהו LUN?
4. מהו iSCSI?
5. למה צריך Multipathing?
6. מה הסיכון ב-Thin Provisioning?
7. למה Snapshot אינו Backup?
8. איך תחקור Storage latency?
