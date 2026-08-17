---
title: "Switching, MAC Address Table ו-VLANs"
category: Networking
part: 6/10
---

## מה זה Switch ואיך הוא עובד?

Switch הוא מכשיר רשת הפועל ב-**Layer 2** של מודל ה-OSI, ותפקידו להעביר מסגרות מידע (Frames) בין מכשירים באותה רשת מקומית (LAN) על סמך **כתובות MAC (Media Access Control)** - מזהה חומרה ייחודי הצרוב בכל כרטיס רשת (בפורמט כמו `00:1A:2B:3C:4D:5E`).

בניגוד ל-Hub (מכשיר ישן שמעביר כל תעבורה לכל הפורטים - Broadcast תמידי), Switch "לומד" אילו מכשירים מחוברים לאילו פורטים, ומעביר תעבורה **רק** לפורט הרלוונטי - מה שמייעל משמעותית את הרשת ומפחית התנגשויות (Collisions).

### עקרונות מפתח

- **MAC Address Table (CAM Table)** — טבלה שה-Switch בונה ומעדכן דינמית, ממפה כתובת MAC לפורט הפיזי שממנו היא נראתה.
- **Flooding** — כאשר Switch לא מכיר את כתובת ה-MAC היעד, הוא שולח את המסגרת לכל הפורטים (למעט זה שממנו התקבלה).
- **Broadcast Domain** — קבוצת מכשירים שמקבלת הודעות Broadcast מכל מכשיר בקבוצה; VLAN הוא הדרך המרכזית לחלק Broadcast Domain אחד למספר תת-דומיינים.

## איך נבנית טבלת ה-MAC Address

Switch לומד את מיקום המכשירים ברשת על ידי בדיקת כתובת המקור (Source MAC) של כל Frame שמגיע אליו:

```
Frame מגיע לפורט Fa0/1 עם Source MAC: AA:AA:AA:AA:AA:AA
        |
        v
Switch רושם בטבלה: AA:AA:AA:AA:AA:AA --> Fa0/1
        |
        v
בודק Destination MAC של ה-Frame:
  - אם קיים בטבלה --> שולח ישירות לפורט המתאים (Unicast חכם)
  - אם לא קיים בטבלה --> Flooding לכל הפורטים חוץ מהמקור
```

דוגמת טבלת MAC Address:

| VLAN | MAC Address | Port | Type |
|---|---|---|---|
| 1 | AA:AA:AA:AA:AA:AA | Fa0/1 | Dynamic |
| 1 | BB:BB:BB:BB:BB:BB | Fa0/2 | Dynamic |
| 10 | CC:CC:CC:CC:CC:CC | Fa0/3 | Dynamic |
| 1 | DD:DD:DD:DD:DD:DD | Gi0/1 | Static |

פקודה להצגת הטבלה ב-Cisco IOS:

```
Switch# show mac address-table
          Mac Address Table
-------------------------------------------
Vlan    Mac Address       Type        Ports
----    -----------       --------    -----
   1    aaaa.aaaa.aaaa    DYNAMIC     Fa0/1
   1    bbbb.bbbb.bbbb    DYNAMIC     Fa0/2
  10    cccc.cccc.cccc    DYNAMIC     Fa0/3
```

## VLAN - Virtual LAN

VLAN הוא מנגנון המאפשר לחלק Switch פיזי אחד (או מספר Switch-ים מקושרים) למספר **רשתות לוגיות (Broadcast Domains) נפרדות**, כאילו היו מכשירים פיזיים נבדלים לגמרי - למרות שהם משתמשים באותה תשתית פיזית. זהו אחד הכלים החשובים ביותר בתכנון רשתות ארגוניות.

### למה צריך VLANs?

- **הפרדה ואבטחה** — מחלקת כספים ומחלקת פיתוח יכולות לשבת על אותו Switch פיזי אך להיות מופרדות לחלוטין ברמה הלוגית.
- **צמצום Broadcast Domain** — רשת גדולה אחת עם הרבה Broadcast traffic פוגעת בביצועים; חלוקה ל-VLANs מקטינה כל Broadcast Domain.
- **גמישות ארגונית** — ניתן לשייך מכשירים לאותו VLAN גם אם הם ממוקמים פיזית בקומות/בניינים שונים.

### דוגמת תכנון VLAN טיפוסי במשרד

| VLAN ID | שם | Subnet | שימוש |
|---|---|---|---|
| 10 | Management | 192.168.10.0/24 | ניהול Switch-ים ו-Router-ים |
| 20 | Employees | 192.168.20.0/24 | מחשבי עובדים |
| 30 | Servers | 192.168.30.0/24 | שרתים פנימיים |
| 40 | Guest-WiFi | 192.168.40.0/24 | רשת אורחים (מבודדת) |
| 99 | Native/Unused | - | VLAN "מת" לפורטים לא בשימוש (הגנה) |

## Trunking - 802.1Q

כאשר יש יותר מ-VLAN אחד וצריך להעביר תעבורה של מספר VLANs דרך קישור יחיד (למשל בין שני Switch-ים, או ל-Router), משתמשים ב-**Trunk Port** עם תיוג **802.1Q** - כל Frame מקבל תג (Tag) בן 4 בתים המציין לאיזה VLAN הוא שייך.

```
+------------+                                    +------------+
|  Switch A   |  ============ Trunk (802.1Q) ===== |  Switch B   |
|             |     נושא VLAN 10, 20, 30, 40        |             |
+------------+                                    +------------+
     |                                                   |
  Access Port                                       Access Port
  VLAN 20                                            VLAN 20
     |                                                   |
  מחשב עובד                                          מחשב עובד
```

מבנה Frame עם תג 802.1Q:

```
+-------------+-----+------+------+---------+-----+
| Dst MAC     | Src MAC | 802.1Q Tag (4 bytes) | Type | Data | FCS |
+-------------+-----+------+------+---------+-----+
                          |
                          +-- TPID (0x8100) + Priority + VLAN ID (12 bits)
```

VLAN ID תופס 12 סיביות בתג, ולכן קיימים 4096 VLANs אפשריים תיאורטית (0-4095), כאשר VLAN 1 הוא ברירת המחדל (Default VLAN) ו-VLAN 0/4095 שמורים.

### הגדרת VLAN ו-Trunk - דוגמה ב-Cisco IOS

```
! יצירת VLANs
Switch(config)# vlan 10
Switch(config-vlan)# name Management
Switch(config-vlan)# exit
Switch(config)# vlan 20
Switch(config-vlan)# name Employees
Switch(config-vlan)# exit

! הגדרת Access Port (מכשיר קצה בודד, VLAN יחיד)
Switch(config)# interface FastEthernet0/1
Switch(config-if)# switchport mode access
Switch(config-if)# switchport access vlan 20

! הגדרת Trunk Port (בין Switch-ים)
Switch(config)# interface GigabitEthernet0/1
Switch(config-if)# switchport mode trunk
Switch(config-if)# switchport trunk allowed vlan 10,20,30,40
```

### Access Port לעומת Trunk Port

| מאפיין | Access Port | Trunk Port |
|---|---|---|
| מספר VLANs | אחד בלבד | מספר VLANs (עם תיוג) |
| תיוג Frame | ללא תג | עם תג 802.1Q |
| שימוש טיפוסי | חיבור מחשב/מדפסת | חיבור בין Switch-ים, ל-Router, ל-Firewall |

## Inter-VLAN Routing

מאחר ו-VLANs מפרידים בין Broadcast Domains, תקשורת **בין** VLANs שונים דורשת Layer 3 (Routing) - בדרך כלל דרך **Router-on-a-Stick** (Router אחד עם Sub-interfaces לכל VLAN) או **L3 Switch** עם **SVI (Switch Virtual Interface)** לכל VLAN.

```
interface Vlan10
 ip address 192.168.10.1 255.255.255.0
!
interface Vlan20
 ip address 192.168.20.1 255.255.255.0
!
ip routing
```

## פקודות אבחון שימושיות

```
Switch# show vlan brief
Switch# show interfaces trunk
Switch# show mac address-table dynamic
Switch# show interfaces FastEthernet0/1 switchport
```

## טיפים וטריקים

1. **תמיד שנו את ה-Native VLAN מברירת המחדל (VLAN 1)** — VLAN 1 חשוף להתקפות מסוג VLAN Hopping; מומלץ לייעד VLAN לא בשימוש (כמו 99) כ-Native VLAN.
2. **פורטים לא בשימוש - שייכו ל-VLAN "מת" (Unused/Black Hole)** — מונע חיבור לא מורשה של מכשיר שיקבל גישה מלאה ל-VLAN רגיל.
3. **הגבילו VLANs על Trunk לפי הצורך בפועל** — השתמשו ב-`switchport trunk allowed vlan` כדי לא להעביר VLANs מיותרים ולצמצם עומס Broadcast.
4. **STP (Spanning Tree Protocol)** — כאשר יש כמה Switch-ים מחוברים במעגל (Redundancy), STP מונע לולאות Layer 2 (Broadcast Storm) על ידי חסימת קישורים מיותרים באופן אוטומטי.
5. **VLAN לא מספיק לאבטחה בפני עצמו** — הפרדת VLAN היא כלי ארגוני-לוגי, אך אבטחה אמיתית בין VLANs דורשת גם ACL/Firewall Rules בין ה-Subnets.

## שאלות נפוצות לתרגול עצמי

- מה ההבדל בין Hub, Switch ו-Router מבחינת שכבת ה-OSI שבה כל אחד פועל?
- איך Switch בונה ומעדכן את ה-MAC Address Table?
- מה זה VLAN ולמה משתמשים בו ברשתות ארגוניות?
- הסבירו את מנגנון ה-802.1Q Tagging ומה ההבדל בין Access Port ל-Trunk Port.
- כיצד מתבצעת תקשורת בין שני VLANs שונים (Inter-VLAN Routing)?

## קישורים חיצוניים

**תיעוד רשמי:**
- IEEE 802.1Q Standard: https://standards.ieee.org/ieee/802.1Q/6844/
- Cisco Networking Academy - Switching Concepts: https://www.netacad.com/courses/networking
- Cisco - VLAN Configuration Guide: https://www.cisco.com/c/en/us/support/docs/lan-switching/vlan/10023-3.html

**סרטוני YouTube מומלצים:**
- NetworkChuck - VLANs Explained: https://www.youtube.com/watch?v=6yAeUcMhz5o
- PowerCert Animated Videos - VLAN Explained: https://www.youtube.com/watch?v=vfSU8dtGngQ
- Practical Networking - Switching and VLANs: https://www.youtube.com/watch?v=6vB7iVi7d1M

---
⬅️ המדריך הבא: [07-firewalls-nat.md](/networking/07-firewalls-nat/) — Firewalls, NAT/PAT ו-Security Zones
