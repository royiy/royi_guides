---
sidebar_position: 3
title: "VMware #3 — vCenter Server"
---

# VMware #3 — vCenter Server

> **הערת גרסאות:** VMware נמצאת כיום תחת Broadcom, ולכן שמות המוצרים והמעבדות משתנים עם הזמן. המדריכים מתמקדים בעקרונות vSphere/ESXi/vCenter שהם הבסיס, ובמקומות רלוונטיים מציינים גם את VCF.

## מטרת המדריך

להקים ולהבין vCenter, Inventory, Datacenter, Cluster, הרשאות ו-Events.

## 1. למה vCenter?

בלי vCenter:

```text
Admin → ESXi01
Admin → ESXi02
Admin → ESXi03
```

עם vCenter:

```text
Admin
  ↓
vCenter
  ├── ESXi01
  ├── ESXi02
  └── ESXi03
```

## 2. VCSA

vCenter Server Appliance הוא ה-appliance המרכזי לניהול vSphere.

## 3. תכנון DNS

לפני התקנה:

```text
vcenter01.lab.local → 192.168.10.20
esxi01.lab.local    → 192.168.10.11
esxi02.lab.local    → 192.168.10.12
```

DNS תקין חשוב מאוד.

## 4. תכנון Inventory

```text
vCenter
└── Datacenter
    └── Cluster
        ├── ESXi01
        └── ESXi02
```

## 5. הוספת Host

ב-vSphere Client:

1. Datacenter.
2. Cluster.
3. Add Host.
4. FQDN/IP.
5. Credentials.
6. Certificate.
7. Finish.

## 6. Roles

דוגמה:

```text
VMware-Admins → Administrator
Helpdesk       → Read Only
VM-Operators   → VM Operator
```

עיקרון חשוב: Least Privilege.

## 7. Tasks ו-Events

בעת תקלה:

```text
Object
 ↓
Monitor
 ├── Tasks
 ├── Events
 └── Performance
```

אל תסתפק בהודעת שגיאה כללית. בדוק מה קרה לפני התקלה.

## 8. תרגיל

הקם:

```text
vCenter
└── Lab
    └── Cluster01
        ├── ESXi01
        └── ESXi02
```

צור משתמש בעל הרשאות מוגבלות ובדוק מה הוא יכול לראות.

## 9. תרחיש תקלה

Host מופיע כ-Not Responding.

בדוק:

```text
DNS
 ↓
Management Network
 ↓
Gateway
 ↓
ESXi services
 ↓
vCenter Events
```

## 10. מעבדה רשמית

[Virtualization 101 — vCenter, Networking and Storage](https://labs.hol.vmware.com/HOL/catalog/lab/13928)

## 11. YouTube

[VMware vCenter Server Tutorial](https://www.youtube.com/results?search_query=VMware+vCenter+Server+tutorial)

## שאלות ראיון

1. למה צריך vCenter?
2. מהו VCSA?
3. מהו Datacenter ב-vCenter?
4. מהו Cluster?
5. איך היית פותר Host שהפך ל-Not Responding?
