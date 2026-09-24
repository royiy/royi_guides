---
sidebar_position: 2
title: "VMware #2 — התקנת ESXi והקמת Host"
description: "מדריך שלב-אחר-שלב להתקנת ESXi: תכנון רשת, בדיקת חומרה, תהליך ההתקנה, הגדרת DCUI ויצירת VM ראשונה."
---

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

<details class="qa">
<summary>1. מה ההבדל בין ESXi ל-VM?</summary>

ESXi היא מערכת ההפעלה (Hypervisor) שמותקנת על הברזל ומנהלת את החומרה. VM היא מכונה וירטואלית שרצה מעל ESXi ומקבלת ממנו CPU, זיכרון, דיסק ורשת וירטואליים. ESXi הוא "המארח", ה-VM היא "האורחת".

</details>

<details class="qa">
<summary>2. למה צריך Management Network?</summary>

זו הרשת (VMkernel port עם תפקיד Management) שדרכה מתחברים ל-Host — vCenter, ה-Host Client, SSH ותקשורת ה-HA agents. בלעדיה ה-Host מנותק ניהולית גם אם המכונות עליו ממשיכות לרוץ, ולכן מקובל לתת לה יתירות (שני NICs) ולהפריד אותה מתעבורת vMotion ואחסון.

</details>

<details class="qa">
<summary>3. מה עושה vmkping?</summary>

שולח ping מתוך ממשק ה-VMkernel של ה-Host (ולא מרשת הניהול הכללית), כך שאפשר לבדוק קישוריות אמיתית של vMotion, iSCSI או NFS. עם `vmkping -I vmk1 -d -s 8972 <ip>` בודקים גם Jumbo Frames — ללא פירוק חבילה — כדי לאמת שה-MTU מוגדר נכון לאורך כל המסלול.

</details>

<details class="qa">
<summary>4. מהו VMkernel?</summary>

ממשק רשת וירטואלי של ה-Host עצמו (vmk0, vmk1...), שדרכו עוברת תעבורת התשתית: Management, vMotion, iSCSI/NFS, Fault Tolerance ו-vSAN. לכל שירות מקובל להקצות VMkernel נפרד, ברשת/VLAN ייעודית, כדי למנוע תחרות על רוחב פס.

</details>

<details class="qa">
<summary>5. מה חשוב לבדוק לפני התקנת ESXi?</summary>

תאימות החומרה ב-VMware Compatibility Guide (שרת, HBA, NIC), קושחה ודרייברים מעודכנים, תכנון דיסק ההתקנה, הגדרות רשת ו-VLAN, וכן DNS ו-NTP תקינים — שניהם קריטיים ל-vCenter, לתעודות ול-Kerberos. כדאי גם לתכנן מראש שמות, כתובות IP סטטיות ויתירות ל-NICs.

</details>

