---
title: "Firewalls, NAT/PAT ו-Security Zones"
category: Networking
part: 7/10
---

## מה זה Firewall?

Firewall הוא מכשיר (או תוכנה) המבצע בקרת גישה על תעבורת רשת, לפי מדיניות אבטחה (Security Policy) מוגדרת מראש - "מה מותר לעבור ומה חסום". Firewall יכול לפעול ברמת Layer 3/4 (בדיקת IP/Port בלבד) או ברמת Layer 7 (בדיקת תוכן האפליקציה עצמה), ומהווה את קו ההגנה הראשון בכל ארכיטקטורת רשת ארגונית.

קיימים שני סוגי Firewall עיקריים מבחינת אופן העבודה: **Stateless** (בודק כל חבילה בנפרד, ללא זיכרון של חיבורים קודמים) ו-**Stateful** (עוקב אחרי מצב החיבור המלא ומקבל החלטות בהתאם להקשר).

### עקרונות מפתח

- **ACL (Access Control List)** — רשימת חוקים המגדירה איזו תעבורה מותרת/חסומה, לפי כתובת מקור/יעד, פורט ופרוטוקול.
- **Stateful Inspection** — מעקב אחרי מצב חיבורי TCP/UDP (Connection Table) כדי לזהות תעבורה שהיא חלק מחיבור לגיטימי שכבר אושר.
- **Default Deny** — עיקרון אבטחה בסיסי: לחסום הכל כברירת מחדל, ולפתוח רק את מה שמותר במפורש.

## Stateless Firewall לעומת Stateful Firewall

```
Stateless Firewall (בדיקה נקודתית, ללא זיכרון):

  Packet 1: Src 8.8.8.8:80 -> Dst 192.168.1.10:51342  [ACK]
       |
       v
  בודק רק: "האם כלל מרשה תעבורה מ-8.8.8.8 בפורט 80?"
  (לא יודע אם זו תגובה לבקשה לגיטימית שיצאה מהרשת הפנימית!)


Stateful Firewall (בדיקה עם הקשר מלא):

  Packet 0 (יוצא): Src 192.168.1.10:51342 -> Dst 8.8.8.8:80 [SYN]
       |
       v
  נרשם ב-Connection Table: (192.168.1.10:51342 <-> 8.8.8.8:80) = ESTABLISHED
       |
       v
  Packet 1 (נכנס): Src 8.8.8.8:80 -> Dst 192.168.1.10:51342 [SYN-ACK]
       |
       v
  בודק מול Connection Table --> תואם לחיבור קיים --> מותר אוטומטית
```

| היבט | Stateless | Stateful |
|---|---|---|
| ביצועים | מהיר יותר (אין זיכרון מצב) | דורש משאבים לניהול Connection Table |
| אבטחה | פחות מדויק, דורש כללים מפורשים בשני הכיוונים | מדויק - מזהה תעבורה חוזרת אוטומטית |
| דוגמאות | ACL בסיסי ב-Router | Firewall ארגוני (Cisco ASA, Palo Alto, pfSense) |
| שכבה | בעיקר Layer 3/4 | Layer 3/4, ומודרניים (NGFW) גם Layer 7 |

## NAT - Network Address Translation

NAT הוא מנגנון שמאפשר "לתרגם" כתובות IP פרטיות (RFC 1918) לכתובת IP ציבורית (ולהפך), ומאפשר לרשת שלמה לגשת לאינטרנט דרך כתובת ציבורית יחידה (או מספר מצומצם). NAT נועד במקור לפתור את מחסור כתובות ה-IPv4, אך גם מספק שכבת הסתרה/אבטחה בסיסית לרשת הפנימית.

### סוגי NAT

| סוג NAT | תיאור | שימוש טיפוסי |
|---|---|---|
| **Static NAT** | מיפוי קבוע 1-ל-1 בין IP פרטי ל-IP ציבורי | פרסום שרת פנימי (Web Server) לאינטרנט |
| **Dynamic NAT** | מיפוי מתוך מאגר (Pool) כתובות ציבוריות, לפי דרישה | ארגונים עם מספר כתובות ציבוריות זמינות |
| **PAT (Port Address Translation)** | מספר כתובות פרטיות משותפות לכתובת ציבורית אחת, מבחין ביניהן לפי פורט | הגישה הנפוצה ביותר - ברירת המחדל ברוב הבתים/משרדים (נקרא גם NAT Overload) |

### דוגמת PAT בפועל

```
רשת פנימית (LAN)                    Router/Firewall (NAT)              אינטרנט
192.168.1.10:51342  ---\                                          
192.168.1.11:60123  ----\--> [NAT Translation Table] --> 203.0.113.5:xxxxx --> 8.8.8.8
192.168.1.12:44521  ---/

טבלת NAT (Translation Table):
+-------------------+------------------+-------------------+
| Inside Local       | Inside Global    | Outside            |
+-------------------+------------------+-------------------+
| 192.168.1.10:51342 | 203.0.113.5:1024 | 8.8.8.8:80          |
| 192.168.1.11:60123 | 203.0.113.5:1025 | 142.250.185.78:443  |
| 192.168.1.12:44521 | 203.0.113.5:1026 | 172.217.16.14:443   |
+-------------------+------------------+-------------------+
```

כל מכשיר פנימי מקבל את אותה כתובת IP ציבורית יוצאת (`203.0.113.5`), אך פורט המקור שונה עבור כל חיבור - כך ה-Router "זוכר" לאיזה מכשיר פנימי להחזיר כל תשובה נכנסת.

### הגדרת NAT/PAT - דוגמה ב-Cisco IOS

```
! הגדרת ממשק פנימי וחיצוני
interface GigabitEthernet0/0
 ip address 192.168.1.1 255.255.255.0
 ip nat inside
!
interface GigabitEthernet0/1
 ip address 203.0.113.5 255.255.255.252
 ip nat outside
!
! PAT - כל הרשת הפנימית משתפת את כתובת הממשק החיצוני
access-list 1 permit 192.168.1.0 0.0.0.255
ip nat inside source list 1 interface GigabitEthernet0/1 overload
!
! Static NAT - פרסום שרת פנימי (Port Forwarding)
ip nat inside source static tcp 192.168.1.100 443 203.0.113.5 443
```

## Security Zones - חלוקה לאזורי אבטחה

Firewall-ים ארגוניים מתקדמים (Palo Alto, Fortinet, Cisco ASA) עובדים לפי מודל **Security Zones** - חלוקת הרשת לאזורים לוגיים בעלי רמת אמון (Trust Level) שונה, כאשר תעבורה בין אזורים חייבת לעבור בדיקה מפורשת מול מדיניות (Policy).

```
+-------------+        +--------------+        +-------------+
|  UNTRUST     |------->|   FIREWALL   |------->|   TRUST      |
|  (אינטרנט)   |        | (Policy Enforcement) |  (רשת פנימית)|
+-------------+        +--------------+        +-------------+
                              |
                              v
                        +-----------+
                        |    DMZ     |
                        | (שרתים     |
                        |  ציבוריים) |
                        +-----------+
```

| אזור (Zone) | רמת אמון | תוכן טיפוסי |
|---|---|---|
| **Untrust (Outside)** | הכי נמוכה | האינטרנט הציבורי |
| **DMZ (Demilitarized Zone)** | בינונית | שרתים הנגישים גם מהאינטרנט (Web, Mail, DNS ציבורי) |
| **Trust (Inside)** | הכי גבוהה | תחנות עבודה, שרתים פנימיים רגישים |

**עיקרון מפתח:** תעבורה מ-DMZ פנימה ל-Trust Zone צריכה להיות מוגבלת מאוד - כך שגם אם שרת ב-DMZ נפרץ, התוקף לא יכול לנוע בקלות לרשת הפנימית (עיקרון ה-**Defense in Depth**).

## פקודות ובדיקות שימושיות

```bash
# לינוקס - הצגת חוקי iptables (Firewall מובנה)
sudo iptables -L -v -n

# בדיקת חיבור פתוח דרך Firewall
telnet target-server 443
nc -zv target-server 443

# Windows Firewall - הצגת חוקים
netsh advfirewall firewall show rule name=all

# בדיקת NAT Table (Cisco IOS)
show ip nat translations
show ip nat statistics
```

## טיפים וטריקים

1. **תמיד עבדו לפי עיקרון Default Deny** — חסמו הכל כברירת מחדל ופתחו רק פורטים/פרוטוקולים נחוצים במפורש (Whitelist ולא Blacklist).
2. **NGFW (Next-Generation Firewall) בודק גם Layer 7** — מזהה אפליקציות ספציפיות (לא רק פורטים), מבצע Deep Packet Inspection ו-IPS/IDS משולב.
3. **אל תשימו שרתים ציבוריים ישירות ב-Trust Zone** — תמיד השתמשו ב-DMZ עבור שרתים הנגישים מהאינטרנט.
4. **PAT הוא ברירת המחדל בפועל ברוב הרשתות הביתיות/עסקיות הקטנות** — בגלל מחסור בכתובות IPv4 ציבוריות, כמעט כל רשת ביתית משתמשת ב-PAT (NAT Overload).
5. **תעדו כל כלל Firewall עם סיבה עסקית** — כללים "יתומים" ללא תיעוד נוטים להישאר לנצח ולהפוך לחור אבטחה עם הזמן.

## שאלות נפוצות לתרגול עצמי

- מה ההבדל בין Stateless Firewall ל-Stateful Firewall?
- מה ההבדל בין Static NAT, Dynamic NAT ו-PAT?
- הסבירו איך PAT מבחין בין חיבורים שונים כשלכולם אותה כתובת IP ציבורית.
- מה זה DMZ ולמה הוא חשוב בארכיטקטורת אבטחה?
- מה ההבדל בין Firewall מסורתי ל-NGFW (Next-Generation Firewall)?

## קישורים חיצוניים

**תיעוד רשמי:**
- IETF RFC 3022 - Traditional IP Network Address Translator (NAT): https://datatracker.ietf.org/doc/html/rfc3022
- Cloudflare Learning Center - What is a Firewall: https://www.cloudflare.com/learning/security/what-is-a-firewall/
- Cisco Networking Academy - Firewall Technologies: https://www.netacad.com/courses/networking

**סרטוני YouTube מומלצים:**
- NetworkChuck - Firewalls Explained: https://www.youtube.com/watch?v=kDEX1HXybrU
- PowerCert Animated Videos - NAT Explained: https://www.youtube.com/watch?v=FTUV0t6JaDA
- Practical Networking - Stateful vs Stateless Firewalls: https://www.youtube.com/watch?v=SFEqUuKW3sM

---
⬅️ המדריך הבא: [08-load-balancing.md](/networking/08-load-balancing/) — Load Balancing, שיטות ו-Health Checks
