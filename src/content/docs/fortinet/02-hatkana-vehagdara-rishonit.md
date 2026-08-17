---
title: "התקנה והגדרה ראשונית של FortiGate"
category: Fortinet
part: 2/10
---

## אפשרויות התקנה

יש שלוש דרכים עיקריות לעבוד עם FortiGate:

1. **חומרה פיזית (Appliance)** — מכשיר FortiGate פיזי (למשל FortiGate 60F, 100F, 200F)
2. **FortiGate-VM** — גרסה וירטואלית להרצה על VMware ESXi, Hyper-V, KVM, AWS, Azure, GCP
3. **סימולציה ללימוד** — הרצת FortiGate-VM על GNS3 / EVE-NG / VMware Workstation לצורך תרגול בבית

## חיבור ראשוני למכשיר פיזי

ברירת המחדל של רוב מכשירי FortiGate:

- ממשק **port1** (או mgmt) מוגדר כ-DHCP Server בכתובת `192.168.1.99`
- אפשר להתחבר אליו ישירות בכבל רשת מהמחשב, לקבל IP אוטומטית, ולגשת ל-GUI דרך:

```
https://192.168.1.99
```

- שם משתמש ברירת מחדל: `admin`
- סיסמה ברירת מחדל: ריקה (Fortinet דורשת הגדרת סיסמה חדשה כבר בכניסה הראשונה — Best Practice אבטחתי)

לחיבור דרך Console (כבל סיריאלי/USB):

```bash
# הגדרות חיבור טיפוסיות (בתוכנת PuTTY / Tera Term)
Baud rate: 9600
Data bits: 8
Parity: None
Stop bits: 1
```

## אשף ההתקנה הראשוני (Setup Wizard)

בגישה הראשונה ל-GUI, FortiGate מציג אשף שמבקש:

1. שם מכשיר (Hostname)
2. שינוי סיסמת admin
3. הגדרת אזור זמן
4. רישום למכשיר (FortiCare Registration) — נדרש לקבלת עדכוני תוכנה, חתימות IPS/AV, ותמיכה

## הגדרת ממשקים (Interfaces) בסיסית

דוגמה: הגדרת port1 כממשק WAN עם IP סטטי, ו-port2 כממשק LAN:

```bash
config system interface
    edit "port1"
        set alias "WAN"
        set mode static
        set ip 203.0.113.10 255.255.255.0
        set allowaccess ping https ssh
    next
    edit "port2"
        set alias "LAN"
        set mode static
        set ip 192.168.10.1 255.255.255.0
        set allowaccess ping https ssh
    next
end
```

**הסבר על `allowaccess`:** קובע אילו פרוטוקולי ניהול מותר להשתמש דרך הממשק הזה (https, ssh, ping, http, snmp, fgfm...). כלל אצבע חשוב באבטחה: **לא** להשאיר `https`/`ssh` פתוחים על ממשק ה-WAN הפונה לאינטרנט!

## הגדרת Default Route (ברירת מחדל)

```bash
config router static
    edit 1
        set gateway 203.0.113.1
        set device "port1"
    next
end
```

## הגדרת DNS

```bash
config system dns
    set primary 8.8.8.8
    set secondary 1.1.1.1
end
```

## יצירת Zone ומדיניות ברירת מחדל ל-Internet Access

לאחר הגדרת הממשקים, יש ליצור מדיניות (Policy) שמאפשרת גישה מה-LAN ל-WAN עם NAT:

```bash
config firewall policy
    edit 1
        set name "LAN-to-WAN"
        set srcintf "port2"
        set dstintf "port1"
        set srcaddr "all"
        set dstaddr "all"
        set action accept
        set schedule "always"
        set service "ALL"
        set nat enable
    next
end
```

⚠️ בדוגמה זו ה-Policy פתוח מדי (`all`/`ALL`) — זה מתאים ללמידה ראשונית בלבד. במדריך 3 נלמד לבנות מדיניות מבוקרת ומאובטחת יותר.

## עדכון קושחה (Firmware Upgrade)

חשוב מאוד לעבוד תמיד עם קושחה עדכנית ויציבה. תהליך טיפוסי:

1. גיבוי קונפיגורציה: `System > Backup` (או `execute backup config` ב-CLI)
2. הורדת קובץ הקושחה מ-FortiCare/Fortinet Support Portal
3. העלאה דרך `System > Firmware`
4. **חשוב:** לעלות גרסה-אחרי-גרסה לפי טבלת Upgrade Path הרשמית ולא לדלג ישר לגרסה חדשה מדי

```bash
# גיבוי קונפיגורציה דרך CLI
execute backup config flash mybackup.conf
```

## High Availability מהיר (אזכור)

אם מתקינים שני מכשירים כזוג HA, יש להגדיר זאת *לפני* שמכניסים מדיניות מורכבת — נרחיב על כך במדריך 6.

## קישורים חיצוניים

- 📘 FortiGate Cookbook — Basic Configuration: https://cookbook.fortinet.com/
- 📘 FortiOS Administration Guide — Getting Started: https://docs.fortinet.com/product/fortigate/
- 🎥 YouTube חיפוש מומלץ: `FortiGate initial setup wizard tutorial`
- 🎥 YouTube חיפוש מומלץ: `FortiGate CLI basic configuration`

## טיפים וטריקים

- תמיד לגבות קונפיגורציה **לפני** כל שינוי משמעותי (`execute backup config`)
- להשתמש ב-`show full-configuration` ב-CLI כדי לראות את כל הקונפיגורציה כולל ערכי ברירת מחדל (לעומת `show` שמראה רק שינויים)
- לרשום את המכשיר תמיד ל-FortiCare מיד עם ההתקנה — בלי רישום לא מקבלים עדכוני IPS/AV
- לשנות את סיסמת admin הדיפולטיבית מיד, ולהגביל את ה-Trusted Hosts שיכולים לגשת לניהול

---
*המשך במדריך הבא: ניהול מדיניות אבטחה (Security Policies) ב-FortiGate*
