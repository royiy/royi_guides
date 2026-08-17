---
title: "שאלות ראיון עבודה מקיפות על Networking + טיפים"
category: Networking
part: 10/10
---

מדריך מסכם עם שאלות ראיון מדורגות לפי רמת קושי (Junior → Senior), הכוללות תשובות תמציתיות על כל הנושאים שנסקרו בסדרה, וכן רשימת טיפים כלליים לעבודה יומיומית עם רשתות תקשורת.

## שאלות בסיסיות (Junior)

**1. מה ההבדל בין מודל OSI למודל TCP/IP?**
OSI הוא מודל תיאורטי בן 7 שכבות ששימושי בעיקר לאבחון ולימוד. TCP/IP הוא מודל מעשי בן 4 שכבות שבפועל מיישם את האינטרנט. TCP/IP מאגד את שכבות ה-Application/Presentation/Session של OSI לשכבה אחת.

**2. מה ההבדל בין TCP ל-UDP?**
TCP הוא פרוטוקול Connection-Oriented, אמין (מבצע Retransmission, Ordering, Flow Control) אך איטי יותר. UDP הוא Connectionless, מהיר יותר אך ללא הבטחת הגעה או סדר - מתאים ל-Streaming/VoIP/DNS.

**3. מהי כתובת IP ומהי Subnet Mask?**
כתובת IP היא מזהה לוגי של מכשיר ברשת. Subnet Mask מגדירה אילו סיביות בכתובת שייכות לחלק הרשת (Network) ואילו לחלק המארח (Host).

**4. מה זה Default Gateway?**
כתובת ה-Router שאליו נשלחת כל תעבורה שהיעד שלה נמצא מחוץ לרשת המקומית.

**5. מה ההבדל בין Switch ל-Router?**
Switch פועל ב-Layer 2 ומעביר תעבורה בתוך אותה רשת מקומית לפי כתובות MAC. Router פועל ב-Layer 3 ומקשר בין רשתות שונות לפי כתובות IP.

**6. מה זה DNS ולמה הוא נחוץ?**
מערכת המתרגמת שמות דומיין קריאים (`google.com`) לכתובות IP. ללא DNS, משתמשים היו צריכים לזכור כתובות IP במקום שמות אתרים.

**7. מה זה DHCP ומה תפקידו?**
פרוטוקול המקצה אוטומטית הגדרות רשת (IP, Subnet, Gateway, DNS) למכשירים, ללא צורך בהגדרה ידנית.

**8. מהו VLAN?**
מנגנון המפריד רשת פיזית אחת למספר Broadcast Domains לוגיים נפרדים, לצורך אבטחה, ארגון וביצועים.

**9. מה זה Firewall?**
מכשיר/תוכנה שמבצע בקרת גישה על תעבורת רשת, לפי מדיניות אבטחה מוגדרת מראש - קובע מה מותר לעבור ומה חסום.

**10. מה זה NAT?**
מנגנון המתרגם כתובות IP פרטיות לכתובת IP ציבורית (ולהפך), מאפשר לרשת שלמה לגשת לאינטרנט דרך כתובת ציבורית אחת או מעטות.

## שאלות בינוניות (Mid-Level)

**11. הסבירו את תהליך ה-DORA ב-DHCP.**
Discover (הלקוח משדר בקשה) → Offer (השרת מציע כתובת) → Request (הלקוח מבקש רשמית) → Ack (השרת מאשר סופית). כל השלבים הראשונים הם Broadcast.

**12. איך Router מחליט לאיזה מסלול לשלוח חבילה כשיש כמה רשומות מתאימות בטבלת הניתוב?**
לפי עקרון ה-Longest Prefix Match - הרשומה עם ה-Prefix (CIDR) הספציפי ביותר מנצחת, גם אם קיימת רשומה כללית יותר (כמו Default Route).

**13. מה זה Administrative Distance ולמה הוא חשוב?**
ערך המדרג את מהימנות מקור המידע לניתוב (Static=1, OSPF=110, RIP=120 וכו') - כאשר יש מספר מקורות לאותו יעד, ה-Router בוחר לפי ה-AD הנמוך ביותר.

**14. מה ההבדל בין Static Routing ל-Dynamic Routing?**
Static מוגדר ידנית ולא מתעדכן אוטומטית בשינויים ברשת - מתאים לרשתות קטנות ויציבות. Dynamic (OSPF/BGP) מתעדכן אוטומטית ומתאים לרשתות גדולות ומשתנות, אך צורך יותר משאבים.

**15. מה ההבדל בין רשומת A ל-CNAME ב-DNS?**
A ממפה שם דומיין ישירות לכתובת IPv4. CNAME הוא Alias - מפנה משם דומיין אחד לשם דומיין אחר (שבתורו יפתר ל-IP).

**16. מה זה 802.1Q Trunking?**
תקן לתיוג (Tagging) Frames עם מזהה VLAN, המאפשר להעביר תעבורה של מספר VLANs דרך קישור פיזי יחיד (Trunk Port) בין Switch-ים.

**17. מה ההבדל בין Stateful Firewall ל-Stateless Firewall?**
Stateful עוקב אחרי מצב החיבור המלא (Connection Table) ומזהה תעבורה חוזרת של חיבור לגיטימי אוטומטית. Stateless בודק כל חבילה בנפרד ללא זיכרון הקשר, ודורש כללים מפורשים בשני הכיוונים.

**18. מה ההבדל בין Static NAT, Dynamic NAT ו-PAT?**
Static NAT הוא מיפוי קבוע 1-ל-1. Dynamic NAT מקצה מתוך מאגר כתובות ציבוריות לפי דרישה. PAT (הנפוץ ביותר) משתף כתובת ציבורית יחידה בין מספר מכשירים פנימיים, ומבחין ביניהם לפי מספרי פורט.

**19. מה ההבדל בין Load Balancer מסוג L4 ל-L7?**
L4 מקבל החלטת ניתוב לפי IP/Port בלבד, מהיר יותר. L7 מבין את תוכן הבקשה (URL, Headers, Cookies) ויכול לבצע ניתוב חכם (Path-based routing) וגם SSL Termination.

**20. מה ההבדל בין הצפנה סימטרית לא-סימטרית, וכיצד TLS משלב ביניהן?**
סימטרית (AES) משתמשת במפתח יחיד, מהירה מאוד. א-סימטרית (RSA/ECC) משתמשת בזוג מפתחות (ציבורי/פרטי), איטית אך מאפשרת אימות. TLS משתמש בא-סימטרי כדי לאמת ולהחליף מפתח סשן בבטחה, ואז עובר להצפנה סימטרית מהירה לכל התעבורה בפועל.

## שאלות מתקדמות (Senior)

**21. איך תתכננו VLSM עבור רשת עם דרישות שונות במחלקות שונות?**
מזהים את הדרישה המקסימלית של Hosts בכל תת-רשת, בוחרים את ה-CIDR הקטן ביותר שמספק מספיק כתובות (כולל Network+Broadcast), ומקצים תת-רשתות בסדר יורד של גודל כדי למנוע חפיפות ולנצל את מרחב הכתובות ביעילות מקסימלית.

**22. מה ההבדל בין OSPF ל-BGP, ומתי משתמשים בכל אחד?**
OSPF הוא פרוטוקול Link-State פנים-ארגוני (IGP), מתאים לרשת פנימית/Datacenter ובוחר מסלול לפי Cost. BGP הוא פרוטוקול Path-Vector בין ארגונים/Autonomous Systems (EGP) - "פרוטוקול האינטרנט" - ומקבל החלטות מבוססות מדיניות (Policy) ולא רק מסלול קצר ביותר.

**23. הסבירו כיצד עובד DHCP Relay וכאשר יש צורך בו.**
מכיוון ש-DHCP Discover הוא Broadcast שלא עובר דרך Router, כאשר שרת ה-DHCP נמצא ב-Subnet אחר, מגדירים DHCP Relay Agent (בד"כ `ip helper-address` על ה-Router/L3 Switch) שמעביר את הבקשה כ-Unicast לשרת המרוחק ומחזיר את התשובה ללקוח.

**24. איך תעצבו ארכיטקטורת Security Zones (Trust/DMZ/Untrust) לשרת Web הפונה לציבור עם בסיס נתונים פנימי?**
שרת ה-Web ב-DMZ (נגיש מ-Untrust בפורט 443 בלבד), חוקי Firewall מגבילים מאוד את התעבורה מ-DMZ ל-Trust (רק לפורט DB הספציפי מהשרת הספציפי), ובסיס הנתונים עצמו יושב עמוק ב-Trust Zone ולעולם לא חשוף ישירות לאינטרנט.

**25. מה ההבדל בין Transport Mode ל-Tunnel Mode ב-IPSec, ומתי משתמשים בכל אחד?**
Transport Mode מצפין רק את ה-Payload ושומר את ה-IP Header המקורי - שימוש בתקשורת Host-to-Host. Tunnel Mode מצפין את כל החבילה המקורית ועוטף אותה ב-IP Header חדש - השימוש הסטנדרטי ב-Site-to-Site VPN בין Gateways.

**26. איך תבנו אסטרטגיית Health Check אמינה ל-Load Balancer בסביבת Microservices?**
Endpoint ייעודי (`/health` או `/readyz`) שבודק תלויות קריטיות בפועל (חיבור DB, Cache) ולא רק שהשרת מגיב ל-TCP, עם הפרדה בין Liveness (השרת חי) ל-Readiness (השרת מוכן לקבל תעבורה), Interval/Timeout/Threshold מכוילים לפי אופי העומס.

**27. מה הסיכון האבטחתי ב-VLAN Hopping וכיצד מונעים אותו?**
תוקף יכול לנצל תגי 802.1Q כפולים (Double Tagging) או Switch Spoofing כדי לגשת ל-VLAN שאינו מורשה אליו. מניעה: שינוי ה-Native VLAN מברירת המחדל (VLAN 1), ביטול DTP (Dynamic Trunking Protocol) אוטומטי בפורטים לא נחוצים, והגבלת VLANs מורשים על כל Trunk לפי הצורך בפועל.

**28. הסבירו Perfect Forward Secrecy (PFS) ולמה הוא קריטי בהגדרת VPN/TLS מודרני.**
PFS מבטיח שכל סשן מקבל מפתח הצפנה זמני ייחודי (דרך Diffie-Hellman Ephemeral), כך שגם אם מפתח פרטי ארוך-טווח ייחשף בעתיד, לא ניתן לפענח רטרואקטיבית תעבורה שהוקלטה בעבר.

**29. איך תאבחנו בעיית קישוריות בין שני שרתים שנמצאים ב-VLANs שונים, כאשר Ping לא עובר?**
בודקים בסדר: (1) הגדרת Inter-VLAN Routing תקינה (SVI/Router-on-a-Stick), (2) חוקי Firewall/ACL בין ה-Subnets, (3) טבלת הניתוב בשני הצדדים, (4) הגדרות VLAN/Trunk נכונות בין ה-Switch-ים, (5) MTU ותקינות פיזית של הקישור.

**30. מה ההבדל בין BGP eBGP ל-iBGP, ומתי כל אחד רלוונטי?**
eBGP (External BGP) פועל בין AS-ים שונים (Administrative Distance=20), משמש לחיבור בין ארגונים/ספקים. iBGP (Internal BGP) פועל בין Router-ים בתוך אותו AS (AD=200), נדרש כדי להפיץ מידע BGP חיצוני לכל הרשת הפנימית בלי לאבד מידע.

## סימולציית תרחיש (Scenario-Based) - נפוץ בראיונות Senior

> **שאלה:** "משתמשים במשרד מדווחים שהאינטרנט 'איטי' ולפעמים 'לא עובד בכלל'. איך תגשו לאבחון הבעיה שיטתית, שכבה אחר שכבה?"

**תשובה מומלצת:** להתחיל מלמטה למעלה לפי מודל OSI - Layer 1 (בדיקת חיבור פיזי, נוריות על ה-Switch), Layer 2 (בדיקת VLAN, MAC Address Table, Broadcast Storms/STP), Layer 3 (בדיקת IP, Default Gateway, `ping`/`traceroute` לזיהוי היכן נעצרת התעבורה), Layer 4-7 (בדיקת DNS, בדיקת Firewall/NAT, בדיקת עומס על Load Balancer/שרתים). חשוב גם לבדוק אם הבעיה מקומית (subnet ספציפי) או גלובלית (כל הרשת), ולבדוק ניטור (Bandwidth Utilization) כדי לזהות צוואר בקבוק.

## רשימת טיפים וטריקים כלליים (Cheat Sheet)

### פקודות אבחון חיוניות

```bash
# בדיקת קישוריות בסיסית
ping 8.8.8.8

# מעקב מסלול
traceroute 8.8.8.8      # לינוקס/macOS
tracert 8.8.8.8         # Windows

# הצגת ממשקי רשת וכתובות IP
ip addr show            # לינוקס
ipconfig /all           # Windows

# הצגת טבלת ניתוב
ip route show           # לינוקס
route print              # Windows

# DNS lookup
dig example.com
nslookup example.com

# בדיקת פורט פתוח
nc -zv target-host 443
telnet target-host 443

# הצגת חיבורים פעילים ופורטים מאזינים
ss -tulnp               # לינוקס (מודרני)
netstat -tulnp           # לינוקס (ישן)
netstat -ano             # Windows
```

### שיטת אבחון מומלצת - "Bottom-Up" לפי OSI

| שכבה | מה בודקים | פקודה/כלי |
|---|---|---|
| Layer 1 | חיבור פיזי, נוריות Link | בדיקה חזותית, `ethtool` |
| Layer 2 | MAC Table, VLAN, STP | `show mac address-table`, `show vlan` |
| Layer 3 | IP, Routing, Gateway | `ping`, `traceroute`, `ip route` |
| Layer 4 | פורטים, Firewall | `nc`, `telnet`, `iptables -L` |
| Layer 7 | DNS, HTTP, Application | `dig`, `curl -v`, `nslookup` |

### עקרונות עבודה מומלצים

1. **תמיד תעדו שינויי תצורה** - כל שינוי ב-Firewall/Routing/VLAN חייב Change Log ברור.
2. **Default Deny תמיד** - חסמו הכל כברירת מחדל, פתחו רק מה שנחוץ במפורש.
3. **תכננו כתובות IP מראש (IP Addressing Plan)** - הימנעו מבזבוז מרחב כתובות והשאירו מקום לצמיחה עתידית.
4. **גבו קונפיגורציה של כל מכשיר קריטי (Router/Switch/Firewall)** - Backup אוטומטי ותכוף.
5. **נטרו Bandwidth ו-Latency באופן שוטף** - כלים כמו SNMP/NetFlow מזהים בעיות לפני שהן הופכות לתקלה.
6. **השתמשו ב-Redundancy בכל שכבה קריטית** - HSRP/VRRP ל-Gateway, STP ל-Switching, Multiple Uplinks לספקי אינטרנט.
7. **אבטחה בשכבות (Defense in Depth)** - Firewall, Segmentation (VLAN/Subnet), הצפנה (TLS/IPSec) - לא מסתמכים על מנגנון הגנה יחיד.
8. **בדקו תמיד Health Check אמיתי** - וודאו שהוא בודק את המצב האפליקטיבי בפועל, לא רק "השרת מגיב".
9. **תעדו IP Addressing ו-VLAN Mapping** - טבלה ברורה של כל VLAN/Subnet ומטרתו חוסכת שעות אבחון בעתיד.
10. **למדו לקרוא Packet Capture (Wireshark/tcpdump)** - הכלי החזק ביותר לאבחון עומק כאשר כלים ברמה גבוהה לא מספיקים.

## קישורים חיצוניים

**תיעוד רשמי:**
- Cisco Networking Academy (קורסים מלאים + Packet Tracer): https://www.netacad.com/courses/networking
- Cloudflare Learning Center - Networking Fundamentals: https://www.cloudflare.com/learning/network-layer/what-is-a-network-layer/
- IETF RFC Index (כל תקני הרשת הרשמיים): https://www.rfc-editor.org/

**סרטוני YouTube מומלצים (הכנה לראיונות):**
- NetworkChuck - Networking Full Course: https://www.youtube.com/watch?v=qiQR5rTSshw
- PowerCert Animated Videos - Networking Fundamentals: https://www.youtube.com/watch?v=e5DEVa9eSN0
- Practical Networking - Networking Basics Full Playlist: https://www.youtube.com/watch?v=rL8RSFQG8do

---
🏠 [חזרה למדריך 1 - מבוא לרשתות תקשורת](/networking/01-mavo-le-networking-osi-tcpip/)

---

## אינדקס כל 10 המדריכים

1. [מבוא לרשתות תקשורת, מודל OSI ומודל TCP/IP](/networking/01-mavo-le-networking-osi-tcpip/)
2. [כתובות IP, Subnetting ו-CIDR](/networking/02-ip-addressing-subnetting/)
3. [יסודות Routing וטבלאות ניתוב](/networking/03-routing-basics/)
4. [DNS - ארכיטקטורה, סוגי רשומות ופקודות אבחון](/networking/04-dns/)
5. [DHCP - תהליך DORA, DHCP Relay והגדרת שרת](/networking/05-dhcp/)
6. [Switching, MAC Address Table ו-VLANs](/networking/06-switching-vlan/)
7. [Firewalls, NAT/PAT ו-Security Zones](/networking/07-firewalls-nat/)
8. [Load Balancing - שיטות, L4/L7 ו-Health Checks](/networking/08-load-balancing/)
9. [VPN, IPSec ויסודות הצפנה (TLS/SSL)](/networking/09-vpn-encryption-basics/)
10. [שאלות ראיון עבודה מקיפות על Networking + טיפים](/networking/10-שאלות-ראיון-networking/) (המדריך הנוכחי)
