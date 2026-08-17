---
title: "VPN ב-Fortinet — IPsec ו-SSL VPN"
category: Fortinet
part: 4/10
---

## שני סוגי ה-VPN העיקריים ב-FortiGate

1. **IPsec VPN** — בעיקר לחיבור Site-to-Site (בין שני משרדים/סניפים) אך גם לחיבורי Remote Access (עם FortiClient)
2. **SSL VPN** — בעיקר לחיבור Remote Access (משתמשים מהבית/בנסיעות) דרך דפדפן או FortiClient

## IPsec VPN — מושגי יסוד

IPsec בנוי משני שלבים (Phases):

- **Phase 1 (IKE)** — הקמת "תעלה" מאובטחת בין שני ה-Gateways, כוללת אימות הדדי (Pre-shared Key או תעודות) והסכמה על אלגוריתמי הצפנה
- **Phase 2 (IPsec SA)** — הגדרת מה בדיוק עובר בתעלה (הרשתות/Subnets) והפרמטרים להצפנת התעבורה עצמה

גרסאות IKE: **IKEv1** (ישן יותר) ו-**IKEv2** (מומלץ כיום — יותר יציב ומהיר ב-Rekey).

## דוגמה: הקמת Site-to-Site IPsec VPN (מצב Route-Based / VTI)

בצד FortiGate A (סניף 1):

```bash
# שלב 1: הגדרת Phase 1
config vpn ipsec phase1-interface
    edit "VPN_to_Branch2"
        set interface "port1"
        set ike-version 2
        set peertype any
        set net-device disable
        set proposal aes256-sha256
        set remote-gw 198.51.100.20
        set psksecret "SuperSecretPSK123!"
    next
end

# שלב 2: הגדרת Phase 2
config vpn ipsec phase2-interface
    edit "VPN_to_Branch2_P2"
        set phase1name "VPN_to_Branch2"
        set proposal aes256-sha256
        set src-subnet 192.168.10.0 255.255.255.0
        set dst-subnet 192.168.20.0 255.255.255.0
    next
end

# שלב 3: הגדרת ניתוב לרשת המרוחקת דרך ממשק ה-VPN
config router static
    edit 5
        set dst 192.168.20.0 255.255.255.0
        set device "VPN_to_Branch2"
    next
end

# שלב 4: Policy דו-כיווני (LAN <-> VPN)
config firewall policy
    edit 30
        set name "LAN-to-Branch2"
        set srcintf "port2"
        set dstintf "VPN_to_Branch2"
        set srcaddr "LAN_SUBNET"
        set dstaddr "Branch2_SUBNET"
        set action accept
        set schedule "always"
        set service "ALL"
    next
    edit 31
        set name "Branch2-to-LAN"
        set srcintf "VPN_to_Branch2"
        set dstintf "port2"
        set srcaddr "Branch2_SUBNET"
        set dstaddr "LAN_SUBNET"
        set action accept
        set schedule "always"
        set service "ALL"
    next
end
```

ב-FortiGate B (סניף 2) יש להגדיר תצורה סימטרית עם ה-`remote-gw` וה-subnets ההפוכים.

## SSL VPN — Remote Access למשתמשים

SSL VPN מאפשר לעובדים להתחבר מרחוק דרך יציאת HTTPS (בד"כ פורט 443 או פורט ייעודי כמו 10443).

### דוגמת קונפיגורציה בסיסית:

```bash
# הגדרת Portal ל-SSL VPN
config vpn ssl web portal
    edit "full-access"
        set tunnel-mode enable
        set ip-pools "SSLVPN_TUNNEL_ADDR1"
    next
end

# הגדרת ה-Settings הגלובליים
config vpn ssl settings
    set servercert "Fortinet_Factory"
    set tunnel-ip-pools "SSLVPN_TUNNEL_ADDR1"
    set port 10443
    set source-interface "port1"
    set source-address "all"
    set default-portal "full-access"
end

# הגדרת קבוצת משתמשים שמורשים להתחבר
config user group
    edit "SSLVPN_Users"
        set member "john.doe" "jane.smith"
    next
end

# Policy שמאפשר ל-SSL VPN לגשת לרשת הפנימית
config firewall policy
    edit 40
        set name "SSLVPN-to-LAN"
        set srcintf "ssl.root"
        set dstintf "port2"
        set srcaddr "all"
        set dstaddr "LAN_SUBNET"
        set action accept
        set schedule "always"
        set service "ALL"
        set groups "SSLVPN_Users"
        set nat enable
    next
end
```

לאחר מכן המשתמש מתחבר דרך אפליקציית **FortiClient** או דרך דפדפן (Web Mode) בכתובת:

```
https://<WAN-IP>:10443
```

## אבטחת VPN — Best Practices

- להעדיף **IKEv2** על פני IKEv1
- להשתמש ב-Certificate-based Authentication במקום PSK כאשר אפשר (בפרט ב-SSL VPN וב-Site-to-Site רגישים)
- להפעיל **2FA/MFA** על SSL VPN (למשל FortiToken או אינטגרציה עם RADIUS/Duo)
- **חשוב במיוחד:** בשנים האחרונות היו מספר חולשות אבטחה (CVE) משמעותיות ב-SSL VPN של FortiGate — יש לוודא תמיד קושחה מעודכנת ולעקוב אחר FortiGuard PSIRT Advisories
- להגביל את ה-SSL VPN רק ל-IP-ים/מדינות מוכרות כשאפשר, ולנטר לוגים של ניסיונות התחברות

## דוגמת פקודות אבחון ל-VPN

```bash
# מצב תעלות IPsec פעילות
get vpn ipsec tunnel summary

# פרטים מלאים על תעלה ספציפית
diagnose vpn ike gateway list

# משתמשי SSL VPN מחוברים כרגע
get vpn ssl monitor
```

## קישורים חיצוניים

- 📘 תיעוד רשמי — IPsec VPN: https://docs.fortinet.com/document/fortigate/latest/administration-guide/633254/ipsec-vpn
- 📘 תיעוד רשמי — SSL VPN: https://docs.fortinet.com/document/fortigate/latest/administration-guide/365777/ssl-vpn
- 📘 FortiGuard PSIRT Advisories (עדכוני אבטחה/CVE): https://www.fortiguard.com/psirt
- 🎥 YouTube חיפוש מומלץ: `FortiGate site to site IPsec VPN configuration`
- 🎥 YouTube חיפוש מומלץ: `FortiGate SSL VPN setup FortiClient`

## טיפים וטריקים

- כשתעלת IPsec לא עולה — לבדוק ראשית ש-Phase 1 מצליח לפני שבודקים Phase 2 (`diagnose vpn ike gateway list` מראה את מצב ה-IKE)
- בעיה נפוצה: אי-התאמה ב-Proposals (הצפנה/Hash) בין שני הצדדים — חייבים להיות זהים בדיוק בשני ה-Gateways
- זכרו שב-Route-Based VPN (VTI) התעלה מופיעה כממשק רשת רגיל — צריך גם Static Route וגם Policy, לא מספיק רק להגדיר את ה-VPN עצמו
- ל-SSL VPN מומלץ מאוד להחליף את הפורט מברירת המחדל (443) ולחסום גישה מ-"all" — צמצום משטח התקיפה
