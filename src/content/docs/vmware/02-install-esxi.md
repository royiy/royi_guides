---
sidebar_position: 2
title: "מדריך 2 — התקנת ESXi והקמת Host"
---

# התקנת VMware ESXi

## מטרת המדריך

להתקין ESXi, להגדיר רשת ניהול ולהקים VM ראשונה.

## 1. דרישות בסיס

יש לבדוק:

- CPU תומך וירטואליזציה
- RAM
- Storage
- NICs
- תאימות חומרה לגרסה
- VT-x / AMD-V ב-BIOS/UEFI

## 2. תכנון כתובות

דוגמה:

```text
Hostname: esxi01.lab.local
IP:       192.168.10.11
Mask:     255.255.255.0
Gateway:  192.168.10.1
DNS:      192.168.10.10
```

## 3. התקנה

תהליך כללי:

1. אתחול מה-ISO.
2. בחירת דיסק התקנה.
3. אישור הסכם.
4. בחירת Keyboard.
5. הגדרת Root password.
6. התקנה.
7. אתחול.

## 4. הגדרת Management Network

לאחר האתחול נכנסים ל-DCUI ומגדירים:

- Management NIC
- VLAN
- IPv4
- Gateway
- DNS
- Hostname

## 5. ESXi Host Client

פותחים בדפדפן:

```text
https://ESXi-IP/ui
```

ומתחברים עם משתמש Root.

## 6. בדיקות

```bash
esxcli system hostname get
```

```bash
esxcli network nic list
```

```bash
esxcli network ip interface ipv4 get
```

## 7. יצירת VM

לדוגמה:

```text
Name: WIN01
CPU:  4 vCPU
RAM:  8 GB
Disk: 100 GB
Network: VM Network
```

## 8. VMware Tools

אחרי התקנת מערכת ההפעלה מתקינים VMware Tools כדי לשפר:

- ביצועים
- ניהול
- Shutdown/Restart
- Time synchronization
- מידע על Guest OS

## 9. תרגיל

הקימו:

```text
ESXi01
├── Windows Server
└── Ubuntu Server
```

בדקו:

- Ping
- CPU
- RAM
- Disk
- Network
- VMware Tools

## 10. קישורים

- [VMware Hands-on Labs](https://labs.hol.vmware.com/HOL/catalog/)
- [YouTube — Install VMware ESXi](https://www.youtube.com/results?search_query=install+VMware+ESXi)
