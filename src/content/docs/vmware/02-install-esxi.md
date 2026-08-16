---
sidebar_position: 2
title: "VMware #2 — התקנת ESXi והקמת Host"
---

# VMware #2 — התקנת ESXi והקמת Host

> **הערת גרסאות:** VMware נמצאת כיום תחת Broadcom, ולכן שמות המוצרים והמעבדות משתנים עם הזמן. המדריכים מתמקדים בעקרונות vSphere/ESXi/vCenter שהם הבסיס, ובמקומות רלוונטיים מציינים גם את VCF.

## מטרת המדריך

להתקין ESXi, להגדיר Management Network, לבצע בדיקות בסיס וליצור VM ראשונה.

## 1. תכנון

דוגמה:

```text
Hostname : esxi01.lab.local
IP       : 192.168.10.11
Mask     : 255.255.255.0
Gateway  : 192.168.10.1
DNS      : 192.168.10.10
VLAN     : 10
```

## 2. בדיקת חומרה

בדוק מראש:

- CPU תואם.
- Virtualization Technology מופעל.
- RAM מספיק.
- דיסק מערכת.
- NICs תואמים.
- RAID/HBA אם קיים.
- Firmware עדכני ותואם.

בסביבת ייצור מומלץ לבדוק Compatibility Guide לפני התקנה.

## 3. BIOS/UEFI

חפש הגדרות כגון:

```text
Intel VT-x
Intel VT-d
AMD-V
IOMMU
SR-IOV
```

אין להפעיל הגדרות מתקדמות בלי להבין את מטרתן ואת התמיכה בחומרה.

## 4. התקנת ESXi

זרימת ההתקנה:

```text
Boot ISO
  ↓
Select Disk
  ↓
Keyboard
  ↓
Root Password
  ↓
Install
  ↓
Reboot
```

## 5. DCUI

לאחר האתחול תגיע למסך Direct Console User Interface.

משם ניתן להגדיר:

- Management Network
- VLAN
- IPv4
- DNS
- Hostname
- Restart Management Agents

## 6. ESXi Host Client

פתח:

```text
https://192.168.10.11/ui
```

לאחר ההתחברות בדוק:

- Host summary
- CPU
- Memory
- Storage
- Networking
- VMs

## 7. בדיקות CLI

### Hostname

```bash
esxcli system hostname get
```

### NICs

```bash
esxcli network nic list
```

### כתובות VMkernel

```bash
esxcli network ip interface ipv4 get
```

### בדיקת רשת

```bash
vmkping 192.168.10.1
```

## 8. יצירת VM

דוגמה:

```text
Name      : WIN01
CPU       : 4 vCPU
Memory    : 8 GB
Disk      : 100 GB
Network   : VM Network
ISO       : Windows Server
```

## 9. VMware Tools

אחרי התקנת Guest OS בדוק שה-Tools במצב תקין. הם מספקים אינטגרציה חשובה בין ה-Guest ל-Hypervisor.

## 10. בדיקות לאחר התקנה

Checklist:

- [ ] Hostname נכון
- [ ] IP סטטי
- [ ] DNS תקין
- [ ] NTP מתוכנן
- [ ] Management Network עובד
- [ ] Storage זמין
- [ ] NICs מזוהים
- [ ] VM עולה
- [ ] VMware Tools תקינים

## 11. תרחיש תקלה

**אין Ping ל-ESXi.**

עבוד בסדר:

```text
Physical Link
 ↓
NIC
 ↓
vSwitch
 ↓
VMkernel
 ↓
VLAN
 ↓
Switch Port
 ↓
Gateway
```

## 12. מעבדה

הקם Host אחד ושתי VMs:

```text
ESXi01
├── DC01
└── Ubuntu01
```

בדוק תקשורת בין שתי המכונות.

## 13. קישורים

[VMware Hands-on Labs](https://labs.hol.vmware.com/HOL/catalog/)

[YouTube — ESXi Installation](https://www.youtube.com/results?search_query=VMware+ESXi+installation+tutorial)

## שאלות ראיון

1. מה ההבדל בין ESXi ל-VM?
2. למה צריך Management Network?
3. מה עושה vmkping?
4. מהו VMkernel?
5. מה חשוב לבדוק לפני התקנת ESXi?
