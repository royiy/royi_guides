---
sidebar_position: 9
title: "מדריך 9 — VMware Troubleshooting"
---

# VMware Troubleshooting

## מטרת המדריך

ללמוד לפתור תקלות בצורה שיטתית במקום לנחש.

## 1. שיטת עבודה

```text
Problem
  ↓
Collect Data
  ↓
Check Logs
  ↓
Check Network
  ↓
Check Storage
  ↓
Check CPU/RAM
  ↓
Root Cause
  ↓
Fix
  ↓
Verify
```

## 2. VM לא נדלקת

בדקו:

- Power state
- Datastore
- Disk
- VMX
- Locks
- Permissions
- ISO
- Host resources

## 3. VM איטית

בדקו:

```text
CPU
Memory
CPU Ready
Disk Latency
IOPS
Network
Snapshots
Guest OS
```

## 4. Datastore מלא

```text
Datastore
████████████████████ 99%
```

חפשו:

- Snapshots
- ISO
- Old VMDKs
- Logs
- Thin provisioning
- קבצים שנשארו אחרי מחיקות

## 5. vMotion נכשל

בדקו:

```text
CPU compatibility
vMotion VMkernel
Network
Datastore
EVC
Permissions
Licensing/features
```

## 6. כלים חשובים

```bash
esxtop
```

```bash
vmkping 192.168.30.12
```

```bash
esxcli network nic list
```

```bash
vim-cmd vmsvc/getallvms
```

## 7. Logs

בפתרון תקלות חשוב לזהות:

- מתי התקלה התחילה
- מה השתנה
- האם התקלה חוזרת
- אילו Events הופיעו
- אילו Hosts/VMs מושפעים

## 8. תרגילי Troubleshooting

### תרגיל A

VM לא מקבלת Network.

### תרגיל B

Datastore כמעט מלא.

### תרגיל C

vMotion נכשל.

### תרגיל D

VM איטית למרות CPU usage נמוך.

### תרגיל E

HA לא הפעיל מחדש VM.

## 9. קישורים

- [VMware Hands-on Labs](https://labs.hol.vmware.com/HOL/catalog/)
- [YouTube — VMware Troubleshooting](https://www.youtube.com/results?search_query=VMware+vSphere+troubleshooting)
