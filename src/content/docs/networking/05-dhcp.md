---
title: "DHCP - תהליך DORA, DHCP Relay והגדרת שרת"
category: Networking
part: 5/10
---

## מה זה DHCP?

DHCP (Dynamic Host Configuration Protocol) הוא פרוטוקול המאפשר הקצאה **אוטומטית** של הגדרות רשת למכשירים - כתובת IP, Subnet Mask, Default Gateway, שרתי DNS ועוד - ללא צורך בהגדרה ידנית על כל מכשיר בנפרד. DHCP חוסך זמן ניהולי עצום ומונע התנגשויות כתובות IP (כאשר שני מכשירים מקבלים בטעות אותה כתובת).

DHCP עובד בשכבת Application, מעל UDP, כאשר השרת מאזין בפורט **67** והלקוח בפורט **68**. הפרוטוקול מבוסס על שידור (Broadcast) ברשת המקומית, מה שמעלה שאלה מעניינת: כיצד לקוח ברשת אחת מקבל שירות משרת DHCP שנמצא ברשת אחרת? התשובה היא מנגנון **DHCP Relay**.

### עקרונות מפתח

- **DHCP Lease** — "שכירות" זמנית של כתובת IP למכשיר, לתקופה מוגדרת (Lease Time).
- **DHCP Scope (Pool)** — טווח הכתובות שהשרת מוסמך להקצות ממנו.
- **DHCP Reservation** — הקצאת כתובת IP קבועה למכשיר ספציפי (לפי כתובת MAC) בתוך ה-Scope.
- **DHCP Relay Agent** — מכשיר (בדרך כלל Router) שמעביר בקשות DHCP בין רשתות שונות (Subnets).

## תהליך DORA - ליבת פרוטוקול DHCP

תהליך קבלת כתובת IP חדשה מתבצע ב-4 שלבים, הידועים בראשי התיבות **DORA**:

```
   Client                                    DHCP Server
     |                                             |
     |  1. DHCP DISCOVER (Broadcast)               |
     |--------------------------------------------->|
     |                                             |
     |  2. DHCP OFFER (הצעת IP + הגדרות)            |
     |<---------------------------------------------|
     |                                             |
     |  3. DHCP REQUEST (בקשה רשמית לקבל את ההצעה)  |
     |--------------------------------------------->|
     |                                             |
     |  4. DHCP ACK (אישור והקצאה סופית)            |
     |<---------------------------------------------|
     |                                             |
```

### פירוט 4 השלבים

| שלב | שם | תיאור | סוג שידור |
|---|---|---|---|
| 1 | **Discover** | הלקוח משדר בקשה כללית: "האם יש שרת DHCP שיכול לתת לי IP?" | Broadcast |
| 2 | **Offer** | שרת DHCP (אחד או יותר) עונה עם הצעת כתובת IP והגדרות | Broadcast/Unicast |
| 3 | **Request** | הלקוח בוחר הצעה אחת (בד"כ הראשונה) ומבקש אותה רשמית מכל השרתים | Broadcast |
| 4 | **Ack** | השרת שנבחר מאשר את ההקצאה ("Acknowledge") ושולח את כל פרטי ההגדרה הסופיים | Broadcast/Unicast |

לאחר תהליך ה-DORA, הלקוח מקבל: כתובת IP, Subnet Mask, Default Gateway, כתובות שרתי DNS, ולעיתים גם הגדרות נוספות (כמו NTP Server, Domain Name).

### חידוש ה-Lease (Renewal)

כאשר עובר **50% מזמן ה-Lease**, הלקוח מנסה לחדש את הכתובת ישירות מול השרת המקורי (Unicast Request, ללא Discover מחדש). אם זה נכשל, בעוד **87.5%** מהזמן הלקוח ינסה Broadcast לכל שרת זמין (Rebinding).

## DHCP Relay - כאשר השרת נמצא ברשת אחרת

מאחר שהודעות DHCP DISCOVER הן Broadcast, הן **לא עוברות דרך Router** כברירת מחדל (Router חוסם Broadcast traffic בין רשתות). לכן, אם שרת ה-DHCP נמצא ב-Subnet אחר מזה של הלקוח, יש להגדיר **DHCP Relay Agent** (בדרך כלל על ה-Router/L3 Switch) שיעביר את הבקשה כ-Unicast לשרת המרוחק.

```
   Subnet A (VLAN 10)                    Subnet B (VLAN 20)
   Client                                DHCP Server
   192.168.10.5                          192.168.20.10
     |                                        |
     | DISCOVER (Broadcast)                   |
     v                                        |
   Router / L3 Switch                         |
   (DHCP Relay Agent)                         |
   192.168.10.1                               |
     |------ Unicast Forward --------------->|
     |         (מוסיף גם ip helper-address)   |
     |<----------------------------------------|
     |  OFFER מוחזר ללקוח                     |
```

הגדרה טיפוסית ב-Router מבוסס Cisco IOS:

```
interface Vlan10
 ip address 192.168.10.1 255.255.255.0
 ip helper-address 192.168.20.10
```

הפקודה `ip helper-address` מגדירה שכל Broadcast traffic מסוג DHCP (וגם כמה שירותים אחרים כמו TFTP) המגיע מ-VLAN 10 יועבר כ-Unicast לכתובת שרת ה-DHCP.

## הגדרת שרת DHCP - דוגמה (ISC DHCP Server בלינוקס)

קובץ קונפיגורציה טיפוסי `/etc/dhcp/dhcpd.conf`:

```
default-lease-time 86400;      # 24 שעות
max-lease-time 172800;         # 48 שעות

subnet 192.168.10.0 netmask 255.255.255.0 {
  range 192.168.10.100 192.168.10.200;
  option routers 192.168.10.1;
  option domain-name-servers 8.8.8.8, 8.8.4.4;
  option domain-name "example.local";
  option broadcast-address 192.168.10.255;
}

# DHCP Reservation - הקצאה קבועה לפי MAC
host printer-office {
  hardware ethernet 00:1A:2B:3C:4D:5E;
  fixed-address 192.168.10.50;
}
```

הפעלה ובדיקת סטטוס בלינוקס:

```bash
sudo systemctl restart isc-dhcp-server
sudo systemctl status isc-dhcp-server

# מעקב אחר לוגים בזמן אמת
sudo journalctl -u isc-dhcp-server -f
```

## פקודות אבחון שימושיות

```bash
# לינוקס - שחרור וחידוש כתובת IP
sudo dhclient -r eth0     # Release
sudo dhclient eth0        # Renew

# Windows - שחרור וחידוש
ipconfig /release
ipconfig /renew

# הצגת פרטי ה-Lease הנוכחי
ipconfig /all             # Windows
cat /var/lib/dhcp/dhclient.leases    # לינוקס
```

פלט לדוגמה מ-`ipconfig /all` בווינדוס:

```
Ethernet adapter Ethernet:
   DHCP Enabled. . . . . . . . . . : Yes
   IPv4 Address. . . . . . . . . . : 192.168.10.150
   Subnet Mask . . . . . . . . . . : 255.255.255.0
   Lease Obtained. . . . . . . . . : Monday, August 17, 2026 08:00:00 AM
   Lease Expires . . . . . . . . . : Tuesday, August 18, 2026 08:00:00 AM
   Default Gateway . . . . . . . . : 192.168.10.1
   DHCP Server . . . . . . . . . . : 192.168.10.1
```

## טיפים וטריקים

1. **APIPA (169.254.x.x)** — אם מכשיר Windows לא מצליח לקבל תגובה משרת DHCP, הוא ייתן לעצמו כתובת אוטומטית מטווח `169.254.0.0/16` (Automatic Private IP Addressing) - סימן ברור לבעיית תקשורת עם שרת ה-DHCP.
2. **הימנעו מחפיפת Scopes** — אם יש כמה שרתי DHCP באותה רשת, ודאו שהטווחים לא חופפים כדי למנוע התנגשויות כתובות.
3. **תמיד השאירו מרווח ל-Static/Reservation** — נהוג להקצות טווח קטן יותר מסך הרשת ל-DHCP Pool ולהשאיר כתובות מחוץ לטווח למכשירים עם IP סטטי (שרתים, מדפסות, Router).
4. **DHCP Failover/Redundancy** — בסביבות Production מומלץ להגדיר שני שרתי DHCP (Primary/Secondary) עם Split Scope או DHCP Failover כדי למנוע Single Point of Failure.
5. **תעדו את ה-Lease Time בהתאם לסוג הרשת** — רשת עם הרבה מכשירים ניידים (אורחים, Wi-Fi ציבורי) מרוויחה מ-Lease Time קצר, בעוד רשת יציבה (משרד) יכולה להסתפק ב-Lease ארוך יותר.

## שאלות נפוצות לתרגול עצמי

- הסבירו את 4 שלבי תהליך ה-DORA לפי הסדר.
- למה DHCP Discover הוא Broadcast, ומה הבעיה שזה יוצר ברשתות מרובות Subnets?
- מהי כתובת ה-APIPA ומתי מכשיר מקבל אותה?
- מה תפקידו של `ip helper-address` בהגדרת Router?
- מה ההבדל בין DHCP Lease רגיל ל-DHCP Reservation?

## קישורים חיצוניים

**תיעוד רשמי:**
- IETF RFC 2131 - Dynamic Host Configuration Protocol: https://datatracker.ietf.org/doc/html/rfc2131
- Cisco Networking Academy - DHCP: https://www.netacad.com/courses/networking
- ISC DHCP Server Documentation: https://www.isc.org/dhcp/

**סרטוני YouTube מומלצים:**
- NetworkChuck - How DHCP Works: https://www.youtube.com/watch?v=e61LlXQonsU
- PowerCert Animated Videos - DHCP Explained: https://www.youtube.com/watch?v=e-kAhFhOULs
- Practical Networking - DHCP Relay: https://www.youtube.com/watch?v=IsPKqQFOrDw

---
⬅️ המדריך הבא: [06-switching-vlan.md](/networking/06-switching-vlan/) — Switching, MAC Address Table ו-VLANs
