---
sidebar_position: 9
title: "VMware #9 — Troubleshooting מעשי"
---

# VMware #9 — Troubleshooting מעשי

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

1. איך תחקור VM איטית?
2. איך תבדוק Storage?
3. איך תבדוק Network?
4. מהו CPU Ready?
5. מה עושה esxtop?
6. מה עושה vmkping?
7. איך תחקור vMotion?
8. למה לא מוחקים VMDK ידנית?
