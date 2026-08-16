\---

sidebar\_position: 1
description: "מדריך מלא למתחילים: Hypervisor, ESXi, vSphere, vCenter, VM, Datastore, Cluster וארכיטקטורה."
---


> \*\*הערת גרסאות:\*\* VMware נמצאת כיום תחת Broadcom, ולכן שמות המוצרים והמעבדות משתנים עם הזמן. המדריכים מתמקדים בעקרונות vSphere/ESXi/vCenter שהם הבסיס, ובמקומות רלוונטיים מציינים גם את VCF.

## מה נלמד?

בסוף המדריך תוכל להסביר:

* מהי וירטואליזציה ולמה משתמשים בה.
* מה ההבדל בין Hypervisor Type 1 ו-Type 2.
* מהו ESXi ומהו vSphere.
* מהו vCenter.
* מהו Host, VM, Datastore ו-Cluster.
* איך vMotion, HA ו-DRS משתלבים יחד.
* איך לתכנן מעבדת VMware ביתית.

## 1\. לפני VMware — השרת הפיזי

שרת פיזי מספק ארבעה משאבים מרכזיים:

```text
                 Physical Server
        ┌────────────┼────────────┐
        │            │            │
       CPU          RAM        Storage
        │                         │
        └────────── Network ──────┘
```

בשרת ללא וירטואליזציה, מערכת ההפעלה מקבלת את המשאבים ישירות.

לדוגמה:

```text
Server 01 → Windows Server
Server 02 → SQL Server
Server 03 → Application
Server 04 → File Server
```

החיסרון: לעיתים כל שרת משתמש רק בחלק קטן מהחומרה.

## 2\. מהי וירטואליזציה?

Hypervisor מחלק משאבים פיזיים למכונות וירטואליות:

```text
Physical Server
       │
       ▼
     ESXi
       │
 ┌─────┼─────┬─────┐
 ▼     ▼     ▼     ▼
DC01  SQL01 APP01 WEB01
```

לכל VM יש:

* vCPU
* vRAM
* vDisk
* vNIC
* Virtual Hardware

## 3\. Type 1 לעומת Type 2

### Type 1

רץ ישירות על החומרה:

```text
Hardware
   ↓
Hypervisor
   ↓
VMs
```

דוגמאות: VMware ESXi, Microsoft Hyper-V.

### Type 2

רץ מעל מערכת הפעלה:

```text
Hardware
   ↓
Windows/Linux
   ↓
Hypervisor
   ↓
VMs
```

דוגמה: VMware Workstation.

## 4\. ESXi

ESXi הוא שכבת ה-Hypervisor שמריצה את המכונות.

```text
Hardware
   ↓
ESXi Host
   ├── VM01
   ├── VM02
   └── VM03
```

המונח **Host** מתייחס בדרך כלל לשרת שעליו מותקן ESXi.

## 5\. vSphere

vSphere הוא שם הפלטפורמה והאקוסיסטם של VMware לווירטואליזציה. במהלך העבודה תפגוש:

* ESXi
* vCenter
* vSphere Client
* vMotion
* HA
* DRS
* Storage
* Networking

## 6\. vCenter

vCenter מאפשר לנהל מספר Hosts במקום אחד:

```text
                     vCenter
                        │
             ┌──────────┼──────────┐
             ▼          ▼          ▼
          ESXi01     ESXi02     ESXi03
             │          │          │
            VMs        VMs        VMs
```

vCenter הוא רכיב קריטי כאשר רוצים להשתמש ביכולות Cluster כגון HA, DRS ו-vMotion.

## 7\. Datastore

VM מורכבת ממספר קבצים. חלקם נשמרים ב-Datastore:

```text
Datastore01
└── VM01
    ├── VM01.vmx
    ├── VM01.vmdk
    ├── VM01.nvram
    └── logs
```

## 8\. Cluster

Cluster הוא אוסף Hosts שעובדים יחד:

```text
Production-Cluster
├── ESXi01
├── ESXi02
└── ESXi03
```

זה הבסיס ל-HA ול-DRS.

## 9\. vMotion, HA ו-DRS במשפט אחד

**vMotion:** העברת VM פעילה בין Hosts.

**HA:** התאוששות מ-Host failure באמצעות הפעלה מחדש של VM על Host זמין.

**DRS:** ניהול ואיזון עומסים ומשאבים ב-Cluster.

## 10\. תכנון מעבדה

מעבדה קטנה:

```text
ESXi01
├── DC01
├── WIN01
└── LINUX01
```

מעבדה מתקדמת:

```text
                 vCenter
                    │
               LAB-Cluster
          ┌─────────┼─────────┐
          │         │         │
       ESXi01    ESXi02    ESXi03
          │         │         │
         VMs       VMs       VMs
                    │
              Shared Storage
```

## 11\. תרגיל

כתוב על דף:

1. מהו Host?
2. מהי VM?
3. למה צריך Datastore?
4. למה צריך vCenter?
5. מה יקרה אם Host נופל ב-Cluster עם HA?

## 12\. מעבדה רשמית

המעבדה **Virtualization 101** של VMware כוללת vCenter, Networking ו-Storage ומיועדת להתחלה.

[VMware Hands-on Labs — Virtualization 101](https://labs.hol.vmware.com/HOL/catalog/lab/13928)

## 13\. סרטוני YouTube

[VMware vSphere — Beginner](https://www.youtube.com/results?search_query=VMware+vSphere+ESXi+vCenter+beginner)

[VMware HA / DRS / vMotion](https://www.youtube.com/watch?v=JZHFefLs0RY)

## שאלות ראיון

1. מה ההבדל בין ESXi ל-vCenter?
2. מהו Hypervisor?
3. מהו Datastore?
4. מה ההבדל בין VM ל-Host?
5. מה עושה HA?
6. מה עושה DRS?
7. מה עושה vMotion?

## סיכום

היררכיית הבסיס:

```text
Physical Hardware
      ↓
     ESXi
      ↓
      VM
      ↓
Guest OS
      ↓
Applications
```

