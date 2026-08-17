---
title: "אבטחת רשת מתקדמת — UTM, IPS, Web Filtering, Antivirus"
category: Fortinet
part: 8/10
---

## מה זה UTM?

**UTM (Unified Threat Management)** הוא המונח המתאר את מכלול מנועי הבדיקה שרצים "מעל" הפיירוול הבסיסי ב-FortiGate ובודקים את **תוכן** התעבורה (Layer 7), לא רק את הכותרות (Layer 3/4). אלו נקראים ב-FortiOS **Security Profiles**.

## Antivirus Profile

בודק קבצים העוברים ברשת (הורדות, מיילים, קבצים ב-HTTP/FTP/SMTP) מול מסד נתוני חתימות ותיקוני AI (FortiGuard AI-based detection).

```bash
config antivirus profile
    edit "strict-av"
        set feature-set flow
        config http
            set av-scan block
        end
        config ftp
            set av-scan block
        end
        set nac-quar-log enable
    next
end
```

שני מצבי סריקה עיקריים: **Flow-based** (מהיר, מתאים לרוב הסביבות) ו-**Proxy-based** (בדיקה מעמיקה יותר אך עם overhead גבוה יותר — לרוב לתרחישים רגישים).

## IPS (Intrusion Prevention System)

מזהה תבניות תקיפה ידועות (חתימות) בתעבורה — למשל ניסיון ניצול חולשה (Exploit) בשירות מסוים.

```bash
config ips sensor
    edit "custom-ips"
        set comment "IPS profile - servers"
        config entries
            edit 1
                set severity high critical
                set action block
                set log enable
        end
    next
end
```

**רמות Action אפשריות לחתימה:** `pass`, `block`, `reset`, `default` (לפי המלצת Fortinet לחתימה הספציפית).

## Web Filtering

חוסם/מבקר גישה לאתרים לפי **קטגוריות** (FortiGuard Web Filtering Categories: Malware, Phishing, Gambling, Social Media וכו') או לפי URL ספציפיים.

```bash
config webfilter profile
    edit "corp-web-filter"
        config ftgd-wf
            config filters
                edit 1
                    set category 26   ;# Malicious Websites
                    set action block
                next
                edit 2
                    set category 7    ;# Gambling
                    set action block
                next
                edit 3
                    set category 23   ;# Social Networking
                    set action monitor
                next
            end
        end
    next
end
```

`action monitor` שימושי כדי "לראות" תעבורה מבלי לחסום אותה בפועל — טוב לשלב בדיקה לפני אכיפה.

## Application Control

בניגוד ל-Firewall רגיל שמזהה תעבורה לפי פורט, Application Control מזהה **אפליקציות בפועל** (למשל: TeamViewer, BitTorrent, Zoom, Facebook) גם אם הן "מתחזות" לפורט 443 רגיל.

```bash
config application list
    edit "block-p2p-remote"
        config entries
            edit 1
                set category 4   ;# P2P
                set action block
            next
            edit 2
                set application 15832  ;# TeamViewer (example ID)
                set action block
            next
        end
    next
end
```

## SSL Inspection — תנאי הכרחי לבדיקת HTTPS

היום כמעט כל התעבורה מוצפנת (HTTPS), ולכן כדי ש-IPS/AV/Web Filter יוכלו לבדוק אותה בכלל, נדרש **SSL Inspection** (Deep Inspection) — FortiGate "פותח" את ההצפנה, בודק את התוכן, ומצפין מחדש.

```bash
config firewall ssl-ssh-profile
    edit "deep-inspection"
        set caname "Fortinet_CA_SSL"
        config https
            set ports 443
            set status deep-inspection
        end
    next
end
```

⚠️ הערה חשובה: Deep Inspection דורש התקנת תעודת ה-CA של FortiGate (`Fortinet_CA_SSL`) על כל תחנות הקצה, אחרת המשתמשים יקבלו אזהרות תעודה לא מהימנה בדפדפן. יש גם שיקולי פרטיות/רגולציה (למשל בנקאות/בריאות) שלעיתים מחייבים "Certificate Inspection" קל יותר (בודק רק את התעודה, לא את התוכן) במקום Deep Inspection מלא.

## חיבור כל ה-Profiles ל-Policy אחד

```bash
config firewall policy
    edit 100
        set name "LAN-Secure-Internet"
        set srcintf "port2"
        set dstintf "port1"
        set srcaddr "LAN_SUBNET"
        set dstaddr "all"
        set action accept
        set schedule "always"
        set service "ALL"
        set nat enable
        set utm-status enable
        set av-profile "strict-av"
        set ips-sensor "custom-ips"
        set webfilter-profile "corp-web-filter"
        set application-list "block-p2p-remote"
        set ssl-ssh-profile "deep-inspection"
        set logtraffic all
    next
end
```

## FortiGuard — מקור העדכונים

כל מנועי ה-UTM (AV signatures, IPS signatures, Web Categories) מתעדכנים דרך שירות **FortiGuard**, שדורש רישיון תקף ורישום המכשיר. ניתן לבדוק סטטוס עדכונים:

```bash
diagnose autoupdate versions
execute update-now
```

## קישורים חיצוניים

- 📘 תיעוד רשמי — Security Profiles: https://docs.fortinet.com/document/fortigate/latest/administration-guide/954446/security-profiles
- 📘 FortiGuard Labs (מידע על איומים ועדכונים): https://www.fortiguard.com/
- 🎥 YouTube חיפוש מומלץ: `FortiGate SSL deep inspection tutorial`
- 🎥 YouTube חיפוש מומלץ: `FortiGate IPS application control configuration`

## טיפים וטריקים

- להתחיל תמיד עם `action monitor` ב-Web Filter/App Control לפני אכיפה מלאה — כדי לראות מה בכלל עובר ולא "לשבור" שירותים קריטיים בהפתעה
- Deep Inspection יכול "לשבור" אתרים שמשתמשים ב-Certificate Pinning (כמו חלק מהאפליקציות הבנקאיות/ה-mobile) — לעיתים נדרש Exempt ידני לדומיינים כאלה
- שאלת ראיון נפוצה: "מה ההבדל בין Flow-based ל-Proxy-based inspection?" — Flow בודק "תוך כדי תנועה" (פחות latency, פחות עומק), Proxy אוסף את כל האובייקט לפני שמחליט (יותר מדויק, יותר latency)
- לבדוק ביצועים (CPU/Memory) אחרי הפעלת UTM מלא — מנועי בדיקה כבדים (במיוחד Proxy-based + Deep Inspection) יכולים להעמיס משמעותית על מכשירים חלשים
