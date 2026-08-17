---
title: "מבוא לרשתות תקשורת, מודל OSI ומודל TCP/IP"
category: Networking
part: 1/10
---

## מה זה רשת תקשורת?

רשת תקשורת (Network) היא אוסף של מכשירים (מחשבים, שרתים, Router-ים, Switch-ים) המחוברים ביניהם ומסוגלים להעביר מידע זה לזה. כל תקשורת ברשת, מהפעולה הפשוטה ביותר (פתיחת אתר) ועד למערכות מורכבות (Kubernetes Cluster מבוזר), מתבססת על אותם עקרונות יסוד: **כתובות (Addressing)**, **ניתוב (Routing)** ו**פרוטוקולים (Protocols)** — שפות מוסכמות שמאפשרות למכשירים שונים "לדבר" זו עם זו.

כדי להתמודד עם המורכבות העצומה של תקשורת רשתות, פותחו שני מודלים תיאורטיים המחלקים את תהליך התקשורת לשכבות (Layers): **מודל OSI** בן 7 השכבות, ו**מודל TCP/IP** המעשי יותר בן 4 השכבות. מודלים אלו הם הבסיס לכל דיון מקצועי ברשתות — כשמהנדס אומר "הבעיה בשכבה 3" או "זו בעיית Layer 7", הוא מתייחס ישירות למודלים הללו.

### עקרונות מפתח

- **Encapsulation (עטיפה)** — כל שכבה מוסיפה כותרת (Header) משלה לנתונים לפני שהיא מעבירה אותם לשכבה שמתחתיה. בצד המקבל מתבצע התהליך ההפוך (Decapsulation).
- **Protocol (פרוטוקול)** — קבוצת כללים מוסכמת המגדירה איך מכשירים מתקשרים (למשל TCP, HTTP, DNS).
- **Peer-to-Peer Communication** — כל שכבה "מדברת" באופן לוגי עם השכבה המקבילה לה במכשיר היעד, גם אם בפועל הנתונים עוברים דרך כל השכבות.

## מודל OSI - 7 השכבות

מודל OSI (Open Systems Interconnection) פותח על ידי ISO בשנת 1984 כמודל תיאורטי-אוניברסלי. הוא לא מיושם ישירות ברשת האינטרנט, אך משמש ככלי חינוכי ואבחוני מצוין.

```
Layer 7 | Application  |  HTTP, FTP, DNS, SMTP           |  "מה המשתמש רואה"
Layer 6 | Presentation |  SSL/TLS, JPEG, Encryption       |  פורמט והצפנה
Layer 5 | Session      |  NetBIOS, RPC, Sockets          |  ניהול חיבורים/סשנים
Layer 4 | Transport    |  TCP, UDP                        |  אמינות, פורטים
Layer 3 | Network      |  IP, ICMP, Routing              |  כתובות IP, ניתוב
Layer 2 | Data Link    |  Ethernet, MAC, Switches         |  כתובות MAC, מסגור
Layer 1 | Physical     |  כבלים, סיבים, Wi-Fi, ביטים      |  העברת סיגנל חשמלי/אור
```

טבלת פירוט מלאה עם דוגמאות ורכיבי ליבה:

| שכבה | שם | יחידת מידע (PDU) | דוגמאות פרוטוקולים | רכיבים טיפוסיים |
|---|---|---|---|---|
| 7 | Application | Data | HTTP, HTTPS, FTP, DNS, SMTP, SSH | דפדפן, שרת Web |
| 6 | Presentation | Data | TLS/SSL, JPEG, ASCII, Encryption | ספריות הצפנה |
| 5 | Session | Data | NetBIOS, RPC, PPTP | ניהול Sessions |
| 4 | Transport | Segment (TCP) / Datagram (UDP) | TCP, UDP | Firewall (Stateful) |
| 3 | Network | Packet | IP, ICMP, IPSec, OSPF, BGP | Router |
| 2 | Data Link | Frame | Ethernet, ARP, PPP, 802.1Q (VLAN) | Switch, Network Card |
| 1 | Physical | Bits | Ethernet cable, Fiber, Wi-Fi (802.11) | כבלים, HUB, Antenna |

**טריק זכירה מקובל (מלמעלה למטה):** "All People Seem To Need Data Processing" (Application, Presentation, Session, Transport, Network, Data Link, Physical).

## מודל TCP/IP - 4 השכבות (המודל המעשי)

מודל TCP/IP הוא המודל שבפועל מיישם את האינטרנט כולו. הוא פשוט יותר ומאגד מספר שכבות OSI לשכבה אחת:

```
+---------------------------+     מקביל ל-OSI Layers
| Application               |     7 + 6 + 5  (Application/Presentation/Session)
+---------------------------+
| Transport                 |     4  (Transport)
+---------------------------+
| Internet                  |     3  (Network)
+---------------------------+
| Network Access (Link)     |     2 + 1  (Data Link + Physical)
+---------------------------+
```

טבלת השוואה בין המודלים:

| TCP/IP Layer | OSI Layers מקבילות | פרוטוקולים עיקריים |
|---|---|---|
| Application | Application, Presentation, Session | HTTP, HTTPS, DNS, SSH, FTP, SMTP |
| Transport | Transport | TCP, UDP |
| Internet | Network | IP, ICMP, ARP |
| Network Access | Data Link, Physical | Ethernet, Wi-Fi, PPP |

### מדוע יש שני מודלים?

- **OSI** נועד להיות מודל תיאורטי מקיף שמסייע בהבנה ואבחון בעיות ("באיזו שכבה הבעיה?").
- **TCP/IP** הוא המודל שבו תוכנן ומומש בפועל פרוטוקול האינטרנט (IP), ולכן הוא זה שמשמש בפועל ביישום.
- בראיונות עבודה ובעבודה יומיומית, מהנדסי רשת "חושבים" לרוב במונחי OSI (למשל "Layer 2 issue" = בעיית Switching, "Layer 3 issue" = בעיית Routing) אך מדברים על פרוטוקולים בפועל שהם חלק ממודל TCP/IP.

## תהליך ה-Encapsulation בפועל

בואו נעקוב אחרי חבילת מידע ("שלום") שנשלחת מהדפדפן שלכם לשרת אינטרנט:

```
Application  :  "GET /index.html HTTP/1.1"                       (Data)
Transport    :  [TCP Header: Src Port 51342, Dst Port 443] + Data (Segment)
Internet     :  [IP Header: Src 192.168.1.10, Dst 172.217.16.14] + Segment (Packet)
Network Acc. :  [Ethernet Header: Src MAC, Dst MAC] + Packet + [FCS]  (Frame)
Physical     :  01001101010111... (סיביות המועברות פיזית בכבל/אוויר)
```

בצד המקבל מתבצע התהליך ההפוך בדיוק - כל שכבה "מקלפת" את הכותרת השייכת לה ומעבירה את השאר הלאה, עד שהאפליקציה מקבלת את המידע הגולמי.

## כלים לאבחון ובדיקה בסיסית

```bash
# בדיקת קישוריות בסיסית (Layer 3)
ping 8.8.8.8

# מעקב אחרי המסלול שהחבילה עוברת בין Router-ים
traceroute 8.8.8.8      # לינוקס/macOS
tracert 8.8.8.8         # Windows

# הצגת ממשקי הרשת וכתובות ה-IP במחשב
ip addr show            # לינוקס
ipconfig /all           # Windows

# הצגת טבלת ה-ARP (מיפוי IP ל-MAC, Layer 2/3)
arp -a
```

פלט לדוגמה מ-`traceroute`:

```
traceroute to 8.8.8.8 (8.8.8.8), 30 hops max
 1  192.168.1.1 (192.168.1.1)  1.203 ms
 2  10.0.0.1 (10.0.0.1)  8.412 ms
 3  72.14.215.85 (72.14.215.85)  14.887 ms
 4  8.8.8.8 (8.8.8.8)  15.203 ms
```

## טיפים וטריקים

1. **תמיד מיפו את הבעיה לשכבה** — "אין קישוריות בכלל" עשוי להיות Layer 1 (כבל מנותק), "יש IP אבל אין גישה לאתר" עשוי להיות Layer 3 (Routing) או Layer 7 (DNS/Firewall).
2. **השתמשו במודל TCP/IP לדיבור מעשי, ובמודל OSI לאבחון שיטתי** — זו הגישה הנהוגה בפועל בתעשייה.
3. **זכרו: Switch עובד בעיקר ב-Layer 2 (MAC), Router עובד ב-Layer 3 (IP)** — הבנה זו היא הבסיס לכל דיון בארכיטקטורת רשת.
4. **Firewall מודרני (NGFW) פועל גם ב-Layer 7** — בניגוד ל-Firewall קלאסי שפעל רק ב-Layer 3/4, פיירוולים מודרניים בודקים גם את תוכן האפליקציה.

## שאלות נפוצות לתרגול עצמי

- מהן 7 שכבות מודל ה-OSI, לפי הסדר, מהשכבה הפיזית ועד לשכבת האפליקציה?
- כיצד ממופות שכבות ה-OSI לתוך 4 שכבות מודל ה-TCP/IP?
- מה ההבדל בין Segment, Packet ו-Frame?
- באיזו שכבה עובד Switch ובאיזו שכבה עובד Router?
- מה קורה בתהליך ה-Encapsulation כאשר חבילה עוברת משכבת Application ועד לשכבה הפיזית?

## קישורים חיצוניים

**תיעוד רשמי:**
- Cisco Networking Academy - OSI Model: https://www.netacad.com/courses/networking
- IETF RFC 1122 - Requirements for Internet Hosts: https://datatracker.ietf.org/doc/html/rfc1122
- Cloudflare Learning Center - What is the OSI Model: https://www.cloudflare.com/learning/ddos/glossary/open-systems-interconnection-model-osi/

**סרטוני YouTube מומלצים:**
- NetworkChuck - OSI Model Explained: https://www.youtube.com/watch?v=vv4y_uOneC0
- PowerCert Animated Videos - OSI Model: https://www.youtube.com/watch?v=Ilk7UXzV_Qc
- Practical Networking - TCP/IP Model: https://www.youtube.com/watch?v=HKKzcvzsvsE

---
⬅️ המדריך הבא: [02-ip-addressing-subnetting.md](/networking/02-ip-addressing-subnetting/) — כתובות IP, Subnetting ו-CIDR
