---
sidebar_position: 5
title: "מדריך 5 — VMware Storage: Datastore, VMFS, NFS ו-iSCSI"
---

# VMware Storage

## מטרת המדריך

להבין היכן VMs נשמרות ואיך ESXi מתחבר לאחסון.

## 1. סוגי אחסון

- Local Storage
- VMFS
- NFS
- iSCSI
- Fibre Channel
- SAN
- NAS

## 2. Datastore

Datastore הוא המקום שבו נשמרים קבצי ה-VM.

דוגמה:

```text
Datastore01
├── VM01
│   ├── VM01.vmx
│   └── VM01.vmdk
├── VM02
└── VM03
```

## 3. VMFS

VMware File System מיועד לאחסון VMs בסביבת vSphere.

## 4. NFS

ESXi יכול להתחבר ל-NFS datastore שמסופק על ידי NAS/Storage.

## 5. iSCSI

```text
ESXi
 │
 ▼
iSCSI Network
 │
 ▼
Storage Array
 │
 ▼
LUN
 │
 ▼
Datastore
```

## 6. Multipathing

בסביבה ארגונית כדאי לתכנן מספר נתיבים בין Host לאחסון.

```text
ESXi
├── Path A ── Storage
└── Path B ── Storage
```

## 7. תרחיש תקלה

Datastore מלא:

```text
Datastore01
███████████████████ 99%
```

בודקים:

- Snapshots
- ISO files
- Old VMDK
- Logs
- Thin disks
- Backup leftovers

## 8. תרגיל

צרו Datastore ובדקו:

- Capacity
- Free Space
- Files
- Performance
- Hosts connected

## 9. קישורים

- [VMware Hands-on Labs](https://labs.hol.vmware.com/HOL/catalog/)
- [YouTube — VMware Storage](https://www.youtube.com/results?search_query=VMware+vSphere+storage+VMFS+NFS+iSCSI)
