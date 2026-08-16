---
sidebar_position: 4
title: "מדריך 4 — VMware Networking: vSwitch, Port Groups ו-VLAN"
---

# VMware Networking

## מטרת המדריך

להבין כיצד VM מתחברת מהרשת הווירטואלית עד הסוויץ' הפיזי.

## 1. הזרימה

```text
VM
 ↓
vNIC
 ↓
Port Group
 ↓
vSwitch
 ↓
vmnic
 ↓
Physical Switch
 ↓
VLAN
```

## 2. vSphere Standard Switch

רכיבים:

- vSwitch
- Port Group
- Uplink
- Physical NIC

## 3. דוגמה

```text
ESXi01
│
├── vmnic0
└── vmnic1
      │
      ▼
    vSwitch0
      │
 ┌────┼─────┐
 ▼    ▼     ▼
Mgmt Servers vMotion
```

## 4. VLAN

דוגמה:

```text
VLAN 10 → Management
VLAN 20 → Servers
VLAN 30 → vMotion
VLAN 40 → Storage
VLAN 50 → Backup
```

## 5. vSphere Distributed Switch

vDS מאפשר ניהול מרכזי של רשת Hosts באמצעות vCenter.

## 6. תרחיש תקלה

VM לא מצליחה להגיע לשרת אחר.

בדקו לפי הסדר:

```text
VM
↓
vNIC
↓
Port Group
↓
VLAN
↓
vSwitch
↓
vmnic
↓
Physical Switch
↓
Gateway
```

## 7. vmkping

לדוגמה:

```bash
vmkping 192.168.30.12
```

## 8. תרגיל

צרו:

```text
VLAN 10 → Management
VLAN 20 → VM Network
VLAN 30 → vMotion
```

בדקו שכל רשת עובדת בנפרד.

## 9. קישורים

- [VMware Hands-on Labs](https://labs.hol.vmware.com/HOL/catalog/)
- [YouTube — VMware Networking](https://www.youtube.com/results?search_query=VMware+vSphere+networking+vSwitch+vDS+VLAN)
