---
sidebar_position: 1
title: "מדריך 1 — וירטואליזציה ו-VMware מהבסיס"
---

# וירטואליזציה ו-VMware מהבסיס

## מטרת המדריך

במדריך הזה נבין מהי וירטואליזציה, מהו Hypervisor, ומה ההבדל בין ESXi, vSphere ו-vCenter.

## 1. מהי וירטואליזציה?

בשרת פיזי רגיל מערכת ההפעלה משתמשת ישירות במשאבי החומרה.

```text
שרת פיזי
├── CPU
├── RAM
├── Storage
└── Network
      │
      ▼
   Windows / Linux
```

בוירטואליזציה מוסיפים שכבת Hypervisor:

```text
Physical Server
       │
       ▼
     ESXi
       │
 ┌─────┼─────┐
 ▼     ▼     ▼
 VM01  VM02  VM03
```

כל VM מקבלת CPU, RAM, דיסק ורשת וירטואליים.

## 2. Type 1 מול Type 2

### Type 1

Hypervisor שרץ ישירות על החומרה.

דוגמאות:

- VMware ESXi
- Microsoft Hyper-V
- Xen

### Type 2

Hypervisor שרץ מעל מערכת הפעלה.

דוגמאות:

- VMware Workstation
- Oracle VirtualBox

## 3. מהו ESXi?

ESXi הוא ה-Hypervisor של VMware.

הוא מותקן על שרת פיזי ומאפשר להריץ עליו מכונות וירטואליות.

```text
Physical Server
      │
      ▼
     ESXi
      │
 ┌────┼────┐
 ▼    ▼    ▼
DC01 SQL01 WEB01
```

## 4. מהו vSphere?

vSphere הוא פלטפורמת הווירטואליזציה של VMware.

בפועל עובדים עם רכיבים כמו:

- ESXi
- vCenter
- vSphere Client
- vSphere HA
- vSphere DRS
- vMotion

## 5. מהו vCenter?

vCenter מאפשר לנהל מספר שרתי ESXi ממקום מרכזי.

```text
             vCenter
                │
       ┌────────┼────────┐
       ▼        ▼        ▼
     ESXi01   ESXi02   ESXi03
       │        │        │
      VMs      VMs      VMs
```

## 6. מושגים בסיסיים

| מושג | הסבר |
|---|---|
| Host | שרת ESXi |
| VM | מכונה וירטואלית |
| Datastore | מקום אחסון ל-VMs |
| Cluster | קבוצת Hosts |
| vMotion | העברת VM בין Hosts |
| HA | הפעלה מחדש של VM במקרה של כשל Host |
| DRS | איזון משאבים בין Hosts |
| Snapshot | נקודת מצב של VM |
| Template | תבנית ליצירת VMs |

## 7. תרגיל

תכננו מעבדה:

```text
ESXi01
├── DC01
├── WIN01
├── Ubuntu01
└── TestVM
```

ענו:

1. כמה CPU צריך לכל VM?
2. כמה RAM?
3. איפה יישמרו הדיסקים?
4. איך ה-VMs יתקשרו ביניהן?

## 8. קישורים וסרטונים

- [VMware Hands-on Labs](https://labs.hol.vmware.com/HOL/catalog/)
- [YouTube — VMware vSphere basics](https://www.youtube.com/results?search_query=VMware+vSphere+ESXi+vCenter+basics)

## סיכום

אחרי המדריך הזה צריך להבין את ההיררכיה:

```text
Physical Server
      ↓
     ESXi
      ↓
      VM
      ↓
Windows / Linux / Application
```
