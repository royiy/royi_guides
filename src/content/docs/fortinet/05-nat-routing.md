---
title: "NAT ו-Routing ב-FortiGate"
category: Fortinet
part: 5/10
---

## סוגי NAT ב-FortiGate

### 1. Source NAT (SNAT) — יציאה לאינטרנט

זהו ה-NAT הנפוץ ביותר: הפיכת כתובות פרטיות (LAN) לכתובת ציבורית אחת (WAN) ביציאה לאינטרנט.

**Firewall Policy NAT (הפשוט ביותר):**

```bash
config firewall policy
    edit 10
        set name "LAN-to-Internet"
        set srcintf "port2"
        set dstintf "port1"
        set srcaddr "LAN_SUBNET"
        set dstaddr "all"
        set action accept
        set schedule "always"
        set service "ALL"
        set nat enable
        # שימוש בכתובת ה-IP של port1 (ברירת מחדל - Dynamic IP Pool)
    next
end
```

### 2. IP Pool — שליטה בכתובת המקור

כאשר יש יותר מ-IP ציבורי אחד, ניתן להגדיר Pool ספציפי:

```bash
config firewall ippool
    edit "Outbound_Pool"
        set startip 203.0.113.50
        set endip 203.0.113.55
        set type overload
    next
end

config firewall policy
    edit 10
        ...
        set nat enable
        set ippool enable
        set poolname "Outbound_Pool"
    next
end
```

סוגי Pool נפוצים: `overload` (רבים-לרבים, כמו PAT רגיל), `one-to-one`, `fixed-port-range`.

### 3. Destination NAT (DNAT) — Virtual IP (VIP)

כדי לחשוף שרת פנימי (למשל שרת Web) לאינטרנט, משתמשים ב-**Virtual IP**:

```bash
config firewall vip
    edit "VIP_WebServer"
        set extip 203.0.113.10
        set extintf "port1"
        set portforward enable
        set mappedip "10.0.5.20"
        set extport 443
        set mappedport 443
    next
end

config firewall policy
    edit 50
        set name "Internet-to-WebServer"
        set srcintf "port1"
        set dstintf "port3"
        set srcaddr "all"
        set dstaddr "VIP_WebServer"
        set action accept
        set schedule "always"
        set service "HTTPS"
        set nat disable
    next
end
```

⚠️ שימו לב: ה-`dstaddr` ב-Policy מפנה ל-**VIP object** (לא ל-IP הפנימי ישירות), וה-`dstintf` הוא הממשק שמוביל לשרת עצמו.

## Central SNAT — שליטה גרעינית יותר

לחלופה מתקדמת יותר מ-NAT ברמת ה-Policy, יש **Central SNAT Table** שמאפשרת להפריד לוגיקת NAT מלוגיקת האבטחה:

```bash
config system settings
    set central-nat enable
end

config firewall central-snat-map
    edit 1
        set srcintf "port2"
        set dstintf "port1"
        set orig-addr "LAN_SUBNET"
        set dst-addr "all"
        set nat-ippool "Outbound_Pool"
    next
end
```

## Routing — ניתוב סטטי ודינמי

### Static Routing

```bash
config router static
    edit 1
        set dst 0.0.0.0 0.0.0.0
        set gateway 203.0.113.1
        set device "port1"
    next
    edit 2
        set dst 10.99.0.0 255.255.0.0
        set gateway 192.168.10.254
        set device "port2"
        set distance 10
    next
end
```

פרמטרים חשובים: `distance` (Administrative Distance — כשיש כמה מסלולים לאותו יעד, הנמוך ביותר מנצח), `priority` (בין routes באותו distance).

### Policy-Based Routing (PBR)

לפעמים רוצים לנתב תעבורה לפי קריטריונים נוספים (לא רק יעד), למשל: כל התעבורה מ-VLAN מסוים תצא דרך ספק אינטרנט ספציפי:

```bash
config router policy
    edit 1
        set input-device "port2"
        set src "192.168.10.0" "255.255.255.0"
        set dst "0.0.0.0" "0.0.0.0"
        set output-device "port4"
        set gateway 198.51.100.1
    next
end
```

### Dynamic Routing — OSPF לדוגמה

```bash
config router ospf
    set router-id 1.1.1.1
    config area
        edit 0.0.0.0
        next
    end
    config network
        edit 1
            set prefix 192.168.10.0 255.255.255.0
            set area 0.0.0.0
        next
    end
end
```

FortiGate תומך גם ב-**BGP** ו-**RIP**, נפוצים בעיקר בסביבות Data Center ו-Service Provider.

## SD-WAN — ניתוב חכם בין מספר קווי אינטרנט

FortiGate כולל מנוע SD-WAN מובנה המאפשר לשלב כמה ספקי אינטרנט (MPLS, Fiber, LTE) ולנתב תעבורה על סמך ביצועים בזמן אמת (Latency, Jitter, Packet Loss) — לדוגמה, תעבורת VoIP תמיד תלך בקו עם ה-Latency הכי נמוך.

```bash
config system sdwan
    set status enable
    config zone
        edit "virtual-wan-link"
        next
    end
    config members
        edit 1
            set interface "port1"
            set gateway 203.0.113.1
        next
        edit 2
            set interface "port4"
            set gateway 198.51.100.1
        next
    end
    config health-check
        edit "Google-DNS"
            set server "8.8.8.8"
            set members 1 2
        next
    end
end
```

## קישורים חיצוניים

- 📘 תיעוד רשמי — NAT: https://docs.fortinet.com/document/fortigate/latest/administration-guide/954635/nat
- 📘 תיעוד רשמי — Routing: https://docs.fortinet.com/document/fortigate/latest/administration-guide/475424/routing
- 📘 תיעוד רשמי — SD-WAN: https://docs.fortinet.com/document/fortigate/latest/administration-guide/954635/sd-wan
- 🎥 YouTube חיפוש מומלץ: `FortiGate VIP virtual IP DNAT tutorial`
- 🎥 YouTube חיפוש מומלץ: `FortiGate SD-WAN configuration example`

## טיפים וטריקים

- `diagnose firewall iprope lookup` וכלי `Policy Lookup` ב-GUI עוזרים להבין דרך איזה Policy/NAT עוברת תעבורה מסוימת
- כשמדובר ב-VIP, זכרו שברירת המחדל (`portforward disable`) ממפה את **כל** הפורטים — לרוב עדיף `portforward enable` עם פורט ספציפי לביטחון
- שימוש ב-`get router info routing-table all` מציג את טבלת הניתוב המלאה (כולל מסלולים מ-static, ospf, bgp, connected)
- Central SNAT מומלץ בסביבות מורכבות עם הרבה חוקי NAT, כי הוא מפריד את הלוגיקה ומקל על תחזוקה
