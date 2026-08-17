---
title: "DNS - ארכיטקטורה, סוגי רשומות ופקודות אבחון"
category: Networking
part: 4/10
---

## מה זה DNS?

DNS (Domain Name System) הוא "ספר הטלפונים של האינטרנט" - מערכת המתרגמת שמות דומיין קריאים לבני אדם (כמו `google.com`) לכתובות IP שהמחשבים משתמשים בהן בפועל לתקשורת (כמו `142.250.185.78`). ללא DNS, היינו צריכים לזכור כתובות IP במקום שמות דומיין עבור כל אתר שאנו רוצים לגלוש אליו.

DNS עובד בשכבת **Application (Layer 7)**, ומשתמש בעיקר בפרוטוקול **UDP בפורט 53** (עבור שאילתות רגילות) ו-**TCP בפורט 53** (עבור העברות אזור/Zone Transfer או תגובות גדולות מ-512 בתים). המערכת מבוזרת (Distributed) ומדורגת (Hierarchical) - אין שרת DNS יחיד שמכיר את כל האינטרנט, אלא רשת עצומה של שרתים המחולקים לפי תחומי אחריות.

### עקרונות מפתח

- **Zone (אזור)** — חלק מהמרחב השמי (Namespace) שעליו שרת DNS מסוים אחראי.
- **Authoritative Server** — שרת שיש לו את המידע "המקורי" (Source of Truth) עבור דומיין מסוים.
- **Recursive Resolver** — שרת (בדרך כלל של ה-ISP או ציבורי כמו 8.8.8.8) שמבצע את כל תהליך החיפוש עבור הלקוח.
- **TTL (Time To Live)** — משך הזמן (בשניות) שבו רשומת DNS נשמרת ב-Cache לפני שנדרש חיפוש מחדש.

## ארכיטקטורת DNS ההיררכית

```
                         "." (Root Servers)
                              |
        +---------------------+---------------------+
        |                     |                      |
     .com TLD              .il TLD                .org TLD
     (Verisign)          (ISOC-IL)              (PIR)
        |                     |
   example.com          example.co.il
   (Authoritative NS)   (Authoritative NS)
```

תהליך חיפוש מלא (Recursive Query) עבור `www.example.com`:

```
1. Client -----> Recursive Resolver (8.8.8.8): "מה ה-IP של www.example.com?"
2. Resolver -----> Root Server: "מי אחראי על .com?"
3. Root Server -----> Resolver: "פנה ל-TLD Server של .com"
4. Resolver -----> TLD Server (.com): "מי אחראי על example.com?"
5. TLD Server -----> Resolver: "פנה ל-Authoritative NS של example.com"
6. Resolver -----> Authoritative NS: "מה ה-IP של www.example.com?"
7. Authoritative NS -----> Resolver: "93.184.216.34"
8. Resolver -----> Client: "93.184.216.34" (ונשמר גם ב-Cache לפי ה-TTL)
```

## סוגי רשומות DNS (Record Types)

| סוג רשומה | תפקיד | דוגמה |
|---|---|---|
| **A** | מיפוי שם דומיין לכתובת IPv4 | `example.com. IN A 93.184.216.34` |
| **AAAA** | מיפוי שם דומיין לכתובת IPv6 | `example.com. IN AAAA 2606:2800:220:1:...` |
| **CNAME** | Alias - הפניה משם דומיין אחד לשם אחר | `www.example.com. IN CNAME example.com.` |
| **MX** | שרת מייל אחראי לדומיין (עם Priority) | `example.com. IN MX 10 mail.example.com.` |
| **TXT** | מידע טקסטואלי חופשי (SPF, DKIM, אימות דומיין) | `example.com. IN TXT "v=spf1 include:_spf.google.com ~all"` |
| **NS** | שרתי השם הסמכותיים (Authoritative) של הדומיין | `example.com. IN NS ns1.example.com.` |
| **PTR** | Reverse DNS - מיפוי IP חזרה לשם דומיין | `34.216.184.93.in-addr.arpa. IN PTR example.com.` |
| **SOA** | Start of Authority - מידע ניהולי על ה-Zone (Serial, Refresh, TTL) | `example.com. IN SOA ns1.example.com. admin.example.com. ...` |
| **SRV** | מיקום שירות ספציפי (פורט + host), לדוגמה עבור SIP/LDAP | `_sip._tcp.example.com. IN SRV 10 5 5060 sipserver.example.com.` |

## פקודות מעשיות לאבחון DNS

### nslookup (זמין ב-Windows ולינוקס)

```bash
nslookup google.com
```

פלט לדוגמה:

```
Server:  8.8.8.8
Address: 8.8.8.8#53

Non-authoritative answer:
Name:    google.com
Address: 142.250.185.78
```

שאילתת רשומה ספציפית:

```bash
nslookup -type=MX gmail.com
```

```
gmail.com    mail exchanger = 5 gmail-smtp-in.l.google.com.
gmail.com    mail exchanger = 10 alt1.gmail-smtp-in.l.google.com.
```

### dig (כלי מפורט יותר, לינוקס/macOS)

```bash
dig example.com A
```

פלט לדוגמה:

```
;; QUESTION SECTION:
;example.com.                  IN      A

;; ANSWER SECTION:
example.com.            86400  IN      A       93.184.216.34

;; Query time: 24 msec
;; SERVER: 8.8.8.8#53(8.8.8.8)
```

דוגמאות שימושיות נוספות ב-`dig`:

```bash
# שאילתה ישירה לשרת DNS ספציפי (עוקף את ה-Resolver המקומי)
dig @8.8.8.8 example.com

# מעקב מלא אחרי כל תהליך ה-Resolution ההיררכי (מ-Root ועד Authoritative)
dig +trace example.com

# בקשת רשומת MX בלבד
dig example.com MX +short

# Reverse DNS lookup (PTR)
dig -x 8.8.8.8

# ניקוי DNS Cache מקומי (Windows)
ipconfig /flushdns
```

## הבחנה בין Recursive ל-Iterative Query

| סוג שאילתה | תיאור |
|---|---|
| **Recursive** | הלקוח מבקש מהשרת "תביא לי תשובה סופית" - השרת עצמו מבצע את כל שרשרת החיפושים |
| **Iterative** | השרת מחזיר את התשובה הטובה ביותר שיש לו, או מפנה ("Referral") לשרת אחר - הלקוח (או ה-Resolver) ממשיך לשאול |

Recursive Resolvers (כמו 8.8.8.8 של גוגל, או 1.1.1.1 של Cloudflare) מבצעים בעצמם Iterative queries מול Root/TLD/Authoritative servers, ומחזירים ללקוח תשובה Recursive מלאה.

## טיפים וטריקים

1. **TTL נמוך לפני שינוי מתוכנן** — לפני מעבר שרתים או שינוי כתובת IP, הורידו את ה-TTL מראש (למשל ל-300 שניות) כדי שהשינוי יתפשט מהר יותר ברשת.
2. **`dig +trace` הוא כלי אבחון מצוין** — מראה בדיוק היכן בשרשרת ה-Resolution יש בעיה (Root/TLD/Authoritative).
3. **CNAME לא יכול "לשבת" יחד עם רשומות אחרות באותו שם** — לדוגמה, לא ניתן להגדיר גם CNAME וגם TXT לאותו hostname (מגבלה בתקן ה-DNS).
4. **בדקו SPF/DKIM/DMARC (רשומות TXT) בבעיות דואר** — רוב בעיות ה-"Spam" או דחיית מיילים נובעות מהגדרת TXT records שגויה.
5. **`nslookup`/`dig` ללא ציון שרת משתמשים ב-Resolver המוגדר במערכת** — לבדיקה "נקייה" תמיד ציינו שרת ספציפי (`dig @8.8.8.8 ...`) כדי לוודא שאתם לא רואים תוצאה מ-Cache מקומי.

## שאלות נפוצות לתרגול עצמי

- מה ההבדל בין Recursive Resolver ל-Authoritative Server?
- הסבירו את תהליך ה-DNS Resolution המלא עבור `www.example.com` מרגע הבקשה ועד קבלת ה-IP.
- מה ההבדל בין רשומת A ל-CNAME, ומתי משתמשים בכל אחת?
- מה תפקידו של TTL ב-DNS, ומה הטרייד-אוף בין TTL גבוה לנמוך?
- מה ההבדל בין `nslookup` ל-`dig`, ומתי הייתם משתמשים ב-`dig +trace`?

## קישורים חיצוניים

**תיעוד רשמי:**
- IETF RFC 1035 - Domain Names, Implementation and Specification: https://datatracker.ietf.org/doc/html/rfc1035
- Cloudflare Learning Center - What is DNS: https://www.cloudflare.com/learning/dns/what-is-dns/
- Cisco Networking Academy - DNS: https://www.netacad.com/courses/networking

**סרטוני YouTube מומלצים:**
- NetworkChuck - How DNS Works: https://www.youtube.com/watch?v=Wj0od2ag5sk
- PowerCert Animated Videos - DNS Explained: https://www.youtube.com/watch?v=mpQZVYPuDGU
- Practical Networking - dig Command Tutorial: https://www.youtube.com/watch?v=5swW-a2Us0k

---
⬅️ המדריך הבא: [05-dhcp.md](/networking/05-dhcp/) — DHCP, תהליך DORA והגדרת שרת DHCP
