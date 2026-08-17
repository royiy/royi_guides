---
title: "VPN ב-Check Point - Site-to-Site ו-Remote Access"
category: Check Point
part: 4/10
---

## סוגי VPN עיקריים

1. **Site-to-Site VPN** - חיבור מוצפן קבוע בין שני אתרים (למשל בין משרד ראשי לסניף, או בין הארגון לענן).
2. **Remote Access VPN** - חיבור עובדים ממחשב אישי/נייד לרשת הארגונית מרחוק (דרך VPN Client כמו Check Point Mobile / SecuRemote, או SSL VPN דרך דפדפן).

שני הסוגים משתמשים בפרוטוקול **IPsec** (בעיקר IKEv1/IKEv2), עם אופציה גם ל-SSL VPN עבור Remote Access.

## רכיבי IPsec VPN

- **IKE (Internet Key Exchange)** - פרוטוקול לניהול המפתחות וההתחברות ההתחלתית.
  - **Phase 1** - יוצר Secure Channel בין ה-Gateways (מבוסס אימות - Pre-Shared Key או Certificate, והצפנה כמו AES).
  - **Phase 2** - מקים את ה-IPsec SA (Security Association) בפועל שמצפין את התעבורה עצמה.
- **VPN Domain (Encryption Domain)** - הרשתות שמאחורי כל Gateway שרלוונטיות להצפנה (מה "מותר" לעבור ב-VPN).

## שלב 1: הגדרת Site-to-Site VPN

### א. יצירת אובייקטי Gateway
לכל צד (Peer) חייב להיות אובייקט Gateway ב-SmartConsole, עם IP חיצוני מוגדר ו-Topology תקינה.

### ב. הגדרת VPN Domain
בלשונית **Topology** של האובייקט, מגדירים איזה רשתות "מאחורי" הגייטווי הזה (למשל 192.168.1.0/24). זה קובע איזו תעבורה תיכנס לתוך המנהרה.

### ג. יצירת Community
Community הוא "קבוצת VPN" שמגדירה אילו Gateways מדברים ביניהם:

- **Meshed Community** - כל הגייטווים בקהילה מדברים אחד עם השני (טוב לרשתות Hub-Spoke-פחות, מספר אתרים שווים).
- **Star Community** - יש Hub מרכזי ו-Satellites שמדברים רק דרכו (טוב לארגונים עם Hub-and-Spoke).

```
Community: Site-to-Site-VPN (Meshed)
  Participating Gateways: HQ-GW, Branch-GW
  Encryption: IKEv2, AES-256, SHA-256
  Shared Secret / Certificate: <Pre-Shared Key>
```

### ד. כלל VPN ב-Rule Base

```
Source: HQ_Net -> Destination: Branch_Net -> VPN: Site-to-Site-VPN -> Service: Any -> Action: Accept
```

שימו לב לעמודת **VPN** בכלל - זו הדרך להגביל שהכלל יחול רק על תעבורה שעוברת דרך אותה Community.

## שלב 2: הגדרת Remote Access VPN

1. הפעלת **Mobile Access / IPsec VPN Blade** על הגייטווי.
2. הגדרת **Remote Access Community** (בד"כ נוצרת אוטומטית - "RemoteAccess").
3. הגדרת שיטת אימות למשתמשים - LDAP/AD, RADIUS, Certificates, או Multi-Factor.
4. הגדרת **Office Mode** - הקצאת IP וירטואלי למשתמש מרוחק מתוך Pool ייעודי.
5. התקנת **Check Point Mobile Client** / **SecuRemote** במחשב המשתמש, או שימוש ב-**SSL Network Extender** דרך דפדפן ללא Client.

```
Global Properties -> Remote Access -> Office Mode
  Allocate IP addresses from: 10.10.10.0/24 (VPN Pool)
```

## דוגמה: Debug ל-VPN

כלי מרכזי לאבחון תקלות VPN הוא `vpn debug`:

```bash
# הפעלת debug מפורט
vpn debug trunc
vpn debug on TDERROR_ALL_ALL=5

# נסו לבצע חיבור VPN, ואז:
vpn debug off

# צפייה בקובץ הלוג שנוצר
cat $FWDIR/log/ike.elg
```

כלי חשוב נוסף - `vpn tu` (VPN Tunnel Utility) לניהול ה-Tunnels בזמן אמת:

```bash
vpn tu
# תפריט אינטראקטיבי: הצגת כל ה-IKE SAs, מחיקת Tunnel ספציפי (Delete IPsec SA / IKE SA)
```

## בעיות נפוצות ופתרונן

| בעיה | סיבה אפשרית | פתרון |
|---|---|---|
| Phase 1 נכשל | אי-התאמה בהצפנה/Pre-Shared Key | לוודא זהות הגדרות ההצפנה בשני הצדדים |
| Phase 1 עובר, Phase 2 נכשל | VPN Domain לא תואם | לבדוק שהרשתות המוגדרות תואמות משני הצדדים |
| Tunnel קם אך אין תעבורה | כלל Rule Base חסר או NAT מפריע | לבדוק Rule Base + חוקי NAT שלא "יתפסו" תעבורת VPN |
| ניתוק תכוף | בעיית Routing או "Route-based VPN" לא מוגדר נכון | לבדוק Routing ולשקול VTI (Virtual Tunnel Interface) |

## Route-Based VPN (VTI)

לעומת Domain-Based VPN (המוגדר לפי VPN Domain), ניתן להגדיר **VTI - Virtual Tunnel Interface** שמתנהג כממשק רשת רגיל, ואז הניתוב (Routing) קובע איזו תעבורה עוברת במנהרה - גמיש הרבה יותר, במיוחד לאינטגרציה עם ראוטרים דינמיים (BGP/OSPF).

## טיפים וטריקים

- תמיד לוודא **סנכרון שעונים (NTP)** - IKE רגיש מאוד לפערי זמן בין הצדדים.
- ב-Troubleshooting של VPN, תמיד לבדוק קודם את **Phase 1** לפני שמתעסקים ב-Phase 2 - אם Phase 1 לא עובד, אין טעם לבדוק הלאה.
- השתמשו ב-**IKEView** (כלי GUI לניתוח קובצי ike.elg) - מקל מאוד על קריאת לוגים ארוכים.
- כשמדובר ב-Multiple Peers, שקלו Star Community כדי למנוע ניהול מסובך של Full Mesh.
- זכרו שכללי NAT יכולים "לתפוס" תעבורת VPN בטעות - יש להחריג רשתות VPN מ-Hide NAT הכללי (NAT Rule עם "No NAT" קודם לכלל ה-Hide הרחב).

## שאלות נפוצות לראיון עבודה בנושא זה

1. מה ההבדל בין Phase 1 ל-Phase 2 ב-IKE?
2. מה זה VPN Domain ולמה הוא חשוב?
3. הסבירו את ההבדל בין Meshed Community ל-Star Community.
4. מה ההבדל בין Domain-Based VPN ל-Route-Based VPN (VTI)?
5. מהו Office Mode ולמה הוא נדרש ב-Remote Access VPN?
6. איך הייתם מתחילים לאבחן תקלת VPN שלא עולה?
7. מה זה SSL Network Extender ומתי משתמשים בו?

## קישורים חיצוניים

- Site-to-Site VPN Admin Guide (רשמי): https://sc1.checkpoint.com/documents/
- Remote Access VPN Admin Guide (רשמי): https://sc1.checkpoint.com/documents/
- מאמרי SK על אבחון VPN (IKEView, vpn debug): https://support.checkpoint.com/
- CheckMates - שאלות ותשובות VPN: https://community.checkpoint.com/
- הדרכת VPN ביוטיוב: https://www.youtube.com/watch?v=RUyYR1jbmUI
- חיפוש נוסף ביוטיוב: https://www.youtube.com/results?search_query=Check+Point+Site+to+Site+VPN+tutorial
