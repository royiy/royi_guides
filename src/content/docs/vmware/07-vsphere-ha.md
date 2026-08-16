---
sidebar_position: 7
title: "מדריך 7 — VMware HA לעומק"
---

# VMware HA

## מטרת המדריך

להבין מה קורה כאשר ESXi Host נכשל ואיך vSphere HA מסייע להפעיל מחדש VMs.

## 1. לפני הכשל

```text
Cluster
├── ESXi01
│   ├── VM01
│   └── VM02
└── ESXi02
    └── VM03
```

## 2. ESXi01 נופל

```text
ESXi01
   X
   │
   ▼
HA detects failure
   │
   ▼
VM01 + VM02
   │
   ▼
Restart on ESXi02
```

## 3. מושגים

- HA Cluster
- Host Monitoring
- Admission Control
- Isolation
- Heartbeat
- Datastore Heartbeat
- VM Monitoring
- Host failure
- Network partition

## 4. Admission Control

Admission Control נועד לשמור מספיק משאבים כדי שה-Cluster יוכל להתמודד עם כשל בהתאם למדיניות שהוגדרה.

## 5. Isolation

חשוב להבין את ההבדל בין:

- Host failure
- Host isolation
- Network partition

## 6. תרגיל מעשי

מעבדה:

```text
Cluster01
├── ESXi01
│   └── DC01
└── ESXi02
    └── APP01
```

הפעילו HA.

לאחר מכן, בתנאי מעבדה מבוקרים:

1. הפעילו VM.
2. בדקו שה-VM רצה על ESXi01.
3. דימו כשל של ESXi01.
4. בדקו את ESXi02.
5. בדקו Events.
6. בדקו שה-VM הופעלה מחדש.

## 7. שאלות לראיון

- מה ההבדל בין HA ל-vMotion?
- האם HA מעביר VM בזמן אמת?
- מהו Admission Control?
- מהו Host Isolation?
- מהו Datastore Heartbeat?

## 8. קישורים

- [VMware Hands-on Labs](https://labs.hol.vmware.com/HOL/catalog/)
- [YouTube — vSphere HA](https://www.youtube.com/results?search_query=VMware+vSphere+HA+tutorial)
