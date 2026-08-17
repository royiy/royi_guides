---
title: "VPN, IPSec ויסודות הצפנה (TLS/SSL)"
category: Networking
part: 9/10
---

## מה זה VPN?

VPN (Virtual Private Network) הוא מנגנון היוצר "מנהרה" מוצפנת (Tunnel) מעל רשת ציבורית (בדרך כלל האינטרנט), המאפשרת תקשורת פרטית ומאובטחת בין שני צדדים - כאילו הם מחוברים ישירות לאותה רשת פרטית פיזית. VPN משמש הן לחיבור בין ארגונים/סניפים (**Site-to-Site**) והן לחיבור עובד בודד מרחוק לרשת הארגונית (**Remote Access / Client VPN**).

הבסיס הטכני של כל VPN הוא שילוב של **Encapsulation** (עטיפת התעבורה המקורית בתוך פרוטוקול תקשורת) ו-**Encryption** (הצפנת התוכן כך שגם אם מישהו יירט את התעבורה, הוא לא יוכל לקרוא אותה).

### עקרונות מפתח

- **Tunnel (מנהרה)** — הערוץ הלוגי המוצפן שדרכו עוברת התעבורה בין שני קצוות ה-VPN.
- **Encryption (הצפנה)** — הפיכת מידע קריא (Plaintext) למידע לא קריא (Ciphertext) ללא המפתח המתאים.
- **Authentication** — וידוא זהות הצדדים המתקשרים לפני הקמת המנהרה.
- **Key Exchange** — תהליך שבו שני הצדדים מסכימים על מפתח הצפנה משותף, ללא צורך לשלוח אותו בגלוי.

## Site-to-Site VPN לעומת Client VPN

```
Site-to-Site VPN:

  משרד תל אביב                                    משרד ניו יורק
  Network: 192.168.1.0/24                         Network: 192.168.2.0/24
        |                                                |
      Router/Firewall  <====== IPSec Tunnel ======>  Router/Firewall
      (VPN Gateway)         (מעל האינטרנט הציבורי)    (VPN Gateway)


Client VPN (Remote Access):

  עובד מהבית                                       רשת ארגונית
  Laptop (VPN Client)  <====== TLS/IPSec Tunnel ======>  VPN Gateway
                              (מעל האינטרנט הציבורי)      192.168.1.0/24
```

| היבט | Site-to-Site VPN | Client VPN (Remote Access) |
|---|---|---|
| מטרה | חיבור קבוע בין שני מיקומים/רשתות | חיבור זמני של משתמש בודד לרשת |
| הגדרה | קבועה על ה-Gateway בכל צד | תוכנת Client על מחשב/נייד המשתמש |
| דוגמאות פרוטוקול | IPSec (IKEv2) | OpenVPN, IPSec, WireGuard, SSL VPN |
| שימוש טיפוסי | חיבור בין סניפים, DR site, Cloud VPC | עובדים מרחוק, Contractors |

## IPSec - Internet Protocol Security

IPSec הוא Suite (מארז) פרוטוקולים המספק אבטחה ברמת **Layer 3**, ומשמש בעיקר ל-Site-to-Site VPN. הוא פועל בשני שלבים עיקריים:

```
IKE Phase 1 (הקמת ערוץ מאובטח לניהול)
        |
        v
  משא ומתן על: אלגוריתם הצפנה, Hash, קבוצת Diffie-Hellman, Authentication
        |
        v
IKE Phase 2 (הקמת ה-Tunnel בפועל להעברת נתונים)
        |
        v
  יצירת IPSec SA (Security Association) - המפתחות בפועל להצפנת התעבורה
        |
        v
  העברת נתונים מוצפנים דרך ESP (Encapsulating Security Payload)
```

### רכיבי ליבה של IPSec

| רכיב | תיאור |
|---|---|
| **IKE (Internet Key Exchange)** | פרוטוקול לניהול המשא ומתן על מפתחות הצפנה (IKEv1/IKEv2) |
| **AH (Authentication Header)** | מספק אימות ושלמות מידע (Integrity), ללא הצפנת התוכן עצמו |
| **ESP (Encapsulating Security Payload)** | מספק גם הצפנה וגם אימות - הנפוץ ביותר בפועל |
| **SA (Security Association)** | "הסכם" בין שני הצדדים על אלגוריתמי הצפנה, מפתחות ותוקף |
| **Transport Mode** | מצפין רק את ה-Payload, שומר את ה-IP Header המקורי - שימוש בין Host ל-Host |
| **Tunnel Mode** | מצפין את כל החבילה המקורית (כולל Header) ועוטף ב-IP Header חדש - שימוש ב-Site-to-Site VPN |

### דוגמת הגדרת IPSec Tunnel - Cisco IOS (מקוצר)

```
crypto isakmp policy 10
 encryption aes 256
 hash sha256
 authentication pre-share
 group 14

crypto isakmp key MySecretKey123 address 203.0.113.50

crypto ipsec transform-set MY-SET esp-aes 256 esp-sha256-hmac

crypto map MY-VPN-MAP 10 ipsec-isakmp
 set peer 203.0.113.50
 set transform-set MY-SET
 match address 100

interface GigabitEthernet0/1
 crypto map MY-VPN-MAP
```

## TLS/SSL - הצפנה ברמת Transport/Application

TLS (Transport Layer Security), הממשיך של SSL (Secure Sockets Layer שהיה מוגדר כבלתי בטוח כיום), מספק הצפנה ואימות עבור תעבורה ברמת אפליקציה - הבסיס של **HTTPS**. TLS פועל "מעל" TCP ו"מתחת" לפרוטוקול האפליקציה (כמו HTTP).

### תהליך ה-TLS Handshake (מקוצר, TLS 1.2)

```
Client                                              Server
  |                                                     |
  |------------ ClientHello (גרסאות/Ciphers נתמכים) --->|
  |                                                     |
  |<----------- ServerHello + Certificate --------------|
  |             (תעודת SSL + מפתח ציבורי)                |
  |                                                     |
  |------------ Key Exchange (מפתח סשן מוצפן) ---------->|
  |                                                     |
  |<===== Finished - תקשורת מוצפנת בשני הכיוונים ========>|
```

בגרסת **TLS 1.3** (המודרנית) ה-Handshake התייעל משמעותית ל-**1-RTT** (Round Trip אחד בלבד) לעומת 2-RTT ב-TLS 1.2, מה שמקצר משמעותית את זמן ההקמה.

## הצפנה סימטרית לעומת א-סימטרית

| היבט | הצפנה סימטרית (Symmetric) | הצפנה א-סימטרית (Asymmetric) |
|---|---|---|
| מפתחות | מפתח יחיד משותף להצפנה ופענוח | זוג מפתחות - ציבורי (Public) ופרטי (Private) |
| מהירות | מהירה מאוד | איטית משמעותית (חישובית כבדה) |
| דוגמאות אלגוריתמים | AES, 3DES, ChaCha20 | RSA, ECC, Diffie-Hellman |
| שימוש טיפוסי | הצפנת נפח מידע גדול (Bulk Encryption) | חילופי מפתחות, חתימות דיגיטליות, אימות תעודות |

### כיצד TLS משלב את שניהם (בפועל)

```
1. Asymmetric Encryption (RSA/ECC) --> משמש להחלפה בטוחה של "מפתח סשן" זמני
                                        (וגם לאימות זהות השרת דרך התעודה - Certificate)

2. Symmetric Encryption (AES) --> משמש בפועל להצפנת כל התעבורה בסשן,
                                    כי הוא הרבה יותר מהיר מהצפנה א-סימטרית
```

זהו העיקרון שבבסיס כל תקשורת HTTPS מודרנית: א-סימטרי לאימות וקביעת מפתח משותף, סימטרי לביצועים בפועל.

## פקודות ובדיקות שימושיות

```bash
# בדיקת תעודת SSL של אתר
openssl s_client -connect example.com:443 -showcerts

# בדיקת גרסת TLS נתמכת בשרת
nmap --script ssl-enum-ciphers -p 443 example.com

# בדיקת חיבור VPN (לינוקס - IPSec עם strongSwan)
sudo ipsec status
sudo ipsec statusall

# בדיקת תוקף תעודת SSL בקצרה
curl -vI https://example.com 2>&1 | grep -A 3 "SSL certificate"
```

פלט לדוגמה מ-`openssl s_client`:

```
subject=CN=example.com
issuer=C=US, O=Let's Encrypt, CN=R3
notBefore=Jun 1 00:00:00 2026 GMT
notAfter=Aug 30 23:59:59 2026 GMT
Verify return code: 0 (ok)
```

## טיפים וטריקים

1. **העדיפו WireGuard כשאפשר** — פרוטוקול VPN מודרני, קליל וקל להגדרה, עם ביצועים גבוהים משמעותית מ-IPSec/OpenVPN המסורתיים.
2. **בדקו תמיד תוקף תעודות SSL באופן פרואקטיבי** — תעודה שפגה היא אחת הסיבות הנפוצות ביותר להשבתות (Outages) בפרודקשן; שקלו חידוש אוטומטי (Let's Encrypt + Certbot).
3. **בטלו תמיכה ב-TLS 1.0/1.1 ו-SSL בכלל** — פרוטוקולים אלו נחשבים לא בטוחים ופגיעים (POODLE, BEAST); השתמשו רק ב-TLS 1.2 ומעלה.
4. **AES-256 הוא תקן זהב להצפנה סימטרית כיום** — הן ב-IPSec והן ב-TLS, זהו הבחירה המומלצת לרוב הארגונים.
5. **Perfect Forward Secrecy (PFS)** — ודאו ש-VPN/TLS מוגדרים עם PFS (למשל דרך Diffie-Hellman Ephemeral), כך שגם אם מפתח פרטי ייחשף בעתיד, שיחות עבר לא ניתנות לפענוח רטרואקטיבית.

## שאלות נפוצות לתרגול עצמי

- מה ההבדל בין Site-to-Site VPN ל-Client VPN, ומתי משתמשים בכל אחד?
- הסבירו את שני שלבי IKE ב-IPSec (Phase 1 ו-Phase 2).
- מה ההבדל בין Transport Mode ל-Tunnel Mode ב-IPSec?
- מה ההבדל בין הצפנה סימטרית לא-סימטרית, ואיך TLS משלב בין השתיים?
- מה זה TLS Handshake, ומה השתפר בין TLS 1.2 ל-TLS 1.3?

## קישורים חיצוניים

**תיעוד רשמי:**
- IETF RFC 6071 - IPsec and IKE Document Roadmap: https://datatracker.ietf.org/doc/html/rfc6071
- IETF RFC 8446 - TLS 1.3: https://datatracker.ietf.org/doc/html/rfc8446
- Cloudflare Learning Center - What is a VPN: https://www.cloudflare.com/learning/access-management/what-is-a-vpn/

**סרטוני YouTube מומלצים:**
- NetworkChuck - VPN Explained: https://www.youtube.com/watch?v=R0KyU2y_Opw
- PowerCert Animated Videos - SSL/TLS Explained: https://www.youtube.com/watch?v=j9QmMEWmcfo
- Practical Networking - IPSec Explained: https://www.youtube.com/watch?v=Uv1TQZWtmZE

---
⬅️ המדריך הבא: [10-שאלות-ראיון-networking.md](/networking/10-שאלות-ראיון-networking/) — שאלות ראיון עבודה מקיפות על Networking
