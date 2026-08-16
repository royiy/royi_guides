---
sidebar_position: 3
title: "מדריך 3 — vCenter Server וניהול מרכזי"
---

# vCenter Server

## מטרת המדריך

להבין כיצד vCenter מנהל מספר Hosts ויוצר תשתית vSphere מרכזית.

## 1. למה צריך vCenter?

בלי vCenter:

```text
Admin
├── ESXi01
├── ESXi02
└── ESXi03
```

עם vCenter:

```text
             vCenter
                │
       ┌────────┼────────┐
       ▼        ▼        ▼
     ESXi01   ESXi02   ESXi03
```

## 2. VCSA

vCenter Server Appliance הוא appliance מבוסס Linux שמספק את שירותי vCenter.

## 3. היררכיית Inventory

```text
vCenter
└── Datacenter
    └── Cluster
        ├── ESXi01
        ├── ESXi02
        └── ESXi03
```

## 4. הוספת Host

ב-vSphere Client:

1. יצירת Datacenter.
2. יצירת Cluster.
3. Add Host.
4. הזנת FQDN/IP.
5. הזנת Credentials.
6. אישור Certificate.
7. סיום.

## 5. הרשאות

נלמד:

- Users
- Groups
- Roles
- Permissions
- Propagation

דוגמה:

```text
VMware-Admins → Administrator
Helpdesk       → Read Only
Backup         → Backup Role
```

## 6. Events ו-Tasks

כאשר מתרחשת תקלה, בודקים:

```text
VM
 └── Monitor
     ├── Tasks
     ├── Events
     └── Performance
```

## 7. תרגיל

הקימו:

```text
vCenter
└── Lab
    └── Cluster01
        ├── ESXi01
        └── ESXi02
```

## 8. קישורים

- [VMware Hands-on Labs](https://labs.hol.vmware.com/HOL/catalog/)
- [YouTube — VMware vCenter](https://www.youtube.com/results?search_query=VMware+vCenter+Server+tutorial)
