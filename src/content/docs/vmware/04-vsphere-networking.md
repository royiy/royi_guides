---
sidebar_position: 4
title: "VMware #4 — Networking לעומק: vSwitch, vDS, VLAN ו-VMkernel"
description: "צלילה לעומק ברשת vSphere: vSwitch מול vDS, Port Groups, VLAN, VMkernel adapters, NIC Teaming ותהליך שיטתי לאיתור תקלת רשת ב-VM."
---

## מטרת המדריך

זהו אחד הפרקים החשובים ביותר לאיש System/Virtualization. המטרה היא להגיע למצב שבו אפשר לעקוב אחרי Packet מה-VM ועד ה-Switch הפיזי.

> **כלל:** כאשר Network לא עובד, לא מדלגים שכבות. עוברים שכבה-שכבה.

## 1. הארכיטקטורה המלאה

```text
Guest OS
   │
   ▼
vNIC
   │
   ▼
Port Group
   │
   ▼
vSwitch / vDS
   │
   ▼
VMkernel / Physical Uplink
   │
   ▼
vmnic0 / vmnic1
   │
   ▼
Physical Switch
   │
   ▼
VLAN
   │
   ▼
Router / Firewall
```

### 📸 צילום מסך מומלץ

`images/vmware/networking/01-packet-flow.png`

צילום של vSphere Client → Host → Configure → Networking, עם סימון:

1. vmnic
2. vSwitch/vDS
3. Port Group
4. VMkernel

## 2. Standard vSwitch

דוגמה:

```text
                 vSwitch0
        ┌──────────┼──────────┐
        │          │          │
   Management   VM Network   vMotion
        │          │          │
      vmk0        vNIC       vmk1
        │
     vmnic0
```

## 3. Port Group

Port Group הוא המקום שבו VM או שירות VMkernel מתחברים ל-L2 network.

דוגמה:

```text
Port Group: PG-Servers
VLAN: 20
```

כל VM שמחוברת ל-PG-Servers תשלח Traffic בהתאם לתצורה ול-VLAN של אותה רשת.

## 4. VLAN

תכנון לדוגמה:

| VLAN | שימוש | Subnet |
|---:|---|---|
| 10 | Management | 192.168.10.0/24 |
| 20 | Servers | 192.168.20.0/24 |
| 30 | vMotion | 192.168.30.0/24 |
| 40 | Storage | 192.168.40.0/24 |
| 50 | Backup | 192.168.50.0/24 |

### תכנון נכון

אל תשתמש באותה רשת לכל השירותים רק כי "זה עובד".

לדוגמה:

```text
Management ── VLAN 10
vMotion    ── VLAN 30
Storage    ── VLAN 40
Backup     ── VLAN 50
```

## 5. VMkernel

VMkernel adapters משמשים שירותים של ESXi.

דוגמה:

```text
vmk0 → Management
vmk1 → vMotion
vmk2 → Storage
```

בדיקה:

```bash
esxcli network ip interface ipv4 get
```

## 6. vmkping

בדיקת קישוריות מ-ESXi:

```bash
vmkping 192.168.30.12
```

לבדיקת MTU:

```bash
vmkping -d -s 8972 192.168.30.12
```

הערך מתאים רק כאשר Jumbo Frames מתוכננים ומוגדרים מקצה לקצה.

## 7. vDS

Distributed Switch מאפשר ניהול Networking מרכזי עבור Hosts.

```text
                  vCenter
                     │
                   vDS
             ┌───────┼───────┐
             │       │       │
          ESXi01  ESXi02  ESXi03
             │       │       │
           vmnic   vmnic   vmnic
```

### מתי vDS שימושי?

- הרבה Hosts
- אחידות תצורה
- Port Groups מרכזיים
- תכונות Networking מתקדמות

## 8. NIC Teaming

דוגמה:

```text
           vSwitch
           /     \
      vmnic0     vmnic1
        │           │
        └────┬──────┘
             ▼
       Physical Switch
```

חשוב לוודא התאמה בין מדיניות ה-ESXi לבין הגדרות הסוויץ'.

## 9. Troubleshooting — VM לא מקבלת Network

### שלב 1 — Guest

```powershell
ipconfig /all
```

או Linux:

```bash
ip addr
ip route
```

### שלב 2 — VM

בדוק:

- vNIC מחובר?
- Connected?
- Port Group נכון?
- VLAN נכון?

### שלב 3 — ESXi

```bash
esxcli network nic list
```

### שלב 4 — Physical Switch

בדוק:

- Link
- VLAN
- Trunk/Access
- Allowed VLANs
- MTU
- LACP אם בשימוש

## 10. תרחיש מעבדה

### תרחיש

VM01 נמצאת ב-VLAN 20.

```text
VM01
192.168.20.10
   │
PG-Servers
   │
VLAN 20
   │
Switch
   │
Gateway 192.168.20.1
```

שבור בכוונה את Port Group VLAN ID ובדוק את הסימפטום.

לאחר מכן החזר את הערך הנכון.

## 11. שאלות ראיון

<details class="qa">
<summary>1. מה ההבדל בין vSwitch ל-Port Group?</summary>

vSwitch הוא המתג הווירטואלי עצמו, שמחובר לכרטיסי הרשת הפיזיים (uplinks). Port Group הוא הגדרה לוגית **בתוך** ה-vSwitch, שקובעת לקבוצת פורטים מאפיינים משותפים — VLAN ID, מדיניות אבטחה, teaming ו-failover. מכונות מתחברות ל-Port Group, לא ישירות ל-vSwitch.

</details>

<details class="qa">
<summary>2. מהו VMkernel?</summary>

ממשק רשת של ה-Host עצמו (vmk0, vmk1...) שמשמש לתעבורת תשתית — Management, vMotion, iSCSI/NFS, FT ו-vSAN. לכל שירות מקצים VMkernel משלו ב-VLAN ייעודי, כדי להפריד תעבורות ולמנוע תחרות על רוחב פס.

</details>

<details class="qa">
<summary>3. מה ההבדל בין vSS ל-vDS?</summary>

vSphere Standard Switch (vSS) מוגדר בנפרד על כל Host — פשוט, אך מועד לטעויות עקביות בין שרתים. vSphere Distributed Switch (vDS) מוגדר פעם אחת ברמת vCenter ומוחל על כל ה-Hosts בקלאסטר, ומוסיף יכולות כמו NIOC, Port Mirroring, NetFlow ו-LACP. vDS דורש רישוי מתאים.

</details>

<details class="qa">
<summary>4. מהו VLAN?</summary>

הפרדה לוגית של רשת פיזית אחת לכמה רשתות שכבה-2 נפרדות, לפי תגיות 802.1Q. בסביבת vSphere מגדירים VLAN ID ברמת ה-Port Group (מצב VST), וכך אותו כבל פיזי נושא תעבורה של ניהול, vMotion, אחסון וייצור — בבידוד מלא ביניהן.

</details>

<details class="qa">
<summary>5. למה משתמשים ב-vmkping?</summary>

כי הוא בודק קישוריות מתוך ממשק ה-VMkernel הספציפי — כלומר בדיוק מהמסלול שבו עוברת תעבורת vMotion או האחסון, ולא מרשת הניהול. `vmkping -I vmk1 <ip>` מאמת שהשכבה הזו באמת מגיעה ליעד.

</details>

<details class="qa">
<summary>6. איך תבדוק MTU?</summary>

שולחים חבילה בגודל מלא עם דגל "אל תפרק": `vmkping -I vmk1 -d -s 8972 <ip>` (8972 בתים + 28 כותרת = 9000). אם זה נכשל אבל ping רגיל עובד — ה-Jumbo Frames לא מוגדרים לכל אורך המסלול: צריך MTU 9000 ב-VMkernel, ב-vSwitch **וגם** במתגים הפיזיים.

</details>

<details class="qa">
<summary>7. מה ההבדל בין Access ל-Trunk?</summary>

פורט Access במתג הפיזי נושא VLAN אחד בלבד ומעביר תעבורה ללא תגית. פורט Trunk נושא כמה VLANs עם תגיות 802.1Q. ב-vSphere, כשמגדירים VLAN ID ב-Port Groups, הפורט הפיזי מול ה-Host צריך להיות Trunk שמרשה את אותם VLANs.

</details>

<details class="qa">
<summary>8. למה כדאי להפריד vMotion מ-Management?</summary>

כי vMotion מייצר פרצי תעבורה כבדים שיכולים להרעיב את רשת הניהול — ואובדן תקשורת ניהול גורר Host שמופיע Not Responding ואף תגובת HA מיותרת. הפרדה ל-VMkernel נפרד וב-VLAN ייעודי (ורצוי uplinks נפרדים) שומרת על יציבות הניהול ועל ביצועי ההעברה.

</details>

## 12. מעבדות רשמיות

VMware Hands-on Labs כוללת מעבדת Virtualization 101 עם vCenter, Networking ו-Storage. citeturn0search0

[VMware Hands-on Labs](https://labs.hol.vmware.com/HOL/catalog/)

## 13. סרטונים

[YouTube — VMware vSphere Networking](https://www.youtube.com/results?search_query=VMware+vSphere+networking+vSwitch+vDS+VLAN)
