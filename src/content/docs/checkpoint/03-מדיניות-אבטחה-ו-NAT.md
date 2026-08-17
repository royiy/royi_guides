---
title: "מדיניות אבטחה (Security Policy) ו-NAT"
category: Check Point
part: 3/10
---

## מבנה ה-Rule Base

מדיניות האבטחה ב-Check Point בנויה כטבלה של כללים (Rules), הנבדקת **מלמעלה למטה**, כאשר החבילה מבוצעת (Match) לפי הכלל הראשון שמתאים לה - ולא ממשיכה הלאה.

מבנה כלל טיפוסי:

| Source | Destination | VPN | Service | Action | Track | Install On |
|---|---|---|---|---|---|---|
| Internal_Net | Any | Any Traffic | Any | Accept | Log | Policy Targets |

- **Source/Destination** - אובייקטים של רשתות, מארחים, קבוצות משתמשים.
- **Service** - פרוטוקול/פורט (HTTP, HTTPS, SSH, קבוצת שירותים מותאמת).
- **Action** - Accept / Drop / Reject (ההבדל: Drop משמיד את החבילה בשקט, Reject שולח RST/ICMP unreachable בחזרה).
- **Track** - Log / Alert / None.
- **Install On** - על אילו Gateways הכלל יותקן (בסביבת Multi-Gateway).

## כלל הזהב: Cleanup Rule ו-Stealth Rule

כמעט בכל מדיניות תקנית תמצאו שני כללים חשובים בסוף:

1. **Stealth Rule** - חוסם גישה ישירה ל-Gateway עצמו (מלבד ניהול), כדי שהגייטווי לא יהיה "נראה" לתעבורה רגילה.
2. **Cleanup Rule** - הכלל האחרון בטבלה, `Any/Any/Any -> Drop` עם Log, שתופס כל מה שלא הותאם לכללים הקודמים (Default Deny). זהו עקרון אבטחה בסיסי - **Deny by Default**.

```
Rule 1: Stealth  -> Any -> Gateway_Object -> Any -> Drop -> Log
Rule 2 (בסוף):    Any -> Any -> Any -> Drop -> Log    (Cleanup Rule)
```

## Implied Rules (כללים מרומזים)

Check Point כוללת כללים "נסתרים" שרצים אוטומטית לפני ה-Rule Base הגלוי (למשל אפשור ICMP, אפשור תקשורת בין רכיבי הניהול). ניתן לראות/להפעיל/לכבות אותם דרך:

`Menu -> Global Properties -> Firewall -> Implied Rules`

טיפ: ב-Production מומלץ **לכבות** את רוב ה-Implied Rules ולהגדיר אותם במפורש ב-Rule Base, לצורך שקיפות וניתוב מדויק (למשל למקם Log נכון).

## Layers ו-Policy Packages

ב-Check Point ניתן לבנות מדיניות במבנה **Layered** - כלומר כמה שכבות (Layers) עצמאיות (Network Layer, Application Layer וכו') שכל אחת נבדקת בנפרד. זה מאפשר Segmentation וניהול הרשאות עדין יותר (למשל צוות שונה מנהל שכבת Application Control).

## NAT - Network Address Translation

Check Point תומך בשני סוגי NAT עיקריים:

### 1. Automatic NAT
מוגדר ישירות על אובייקט (Host/Network) בלשונית NAT שלו:

- **Hide NAT** - הסתרת רשת שלמה מאחורי IP אחד (בד"כ Gateway IP) - שימושי לגישה יוצאת לאינטרנט.
- **Static NAT** - מיפוי אחד-לאחד בין IP פנימי ל-IP חיצוני - שימושי לשרתים (Web/Mail) שצריכים להיות נגישים מבחוץ.

### 2. Manual NAT
כלל NAT שנכתב ידנית ב-NAT Rule Base, נותן שליטה מלאה יותר (למשל NAT מותנה לפי Source ספציפי, או NAT עם שירות מסוים בלבד).

דוגמה לכלל Manual NAT (Static NAT לשרת Web פנימי):

| Original Source | Original Destination | Original Service | Translated Source | Translated Destination | Translated Service |
|---|---|---|---|---|---|
| Any | Public_IP_1.2.3.4 | HTTP | = Original | Web_Server_192.168.1.10 | = Original |

## דוגמה מעשית: כלל Hide NAT לרשת פנימית

```
Object: Internal_Net (192.168.1.0/24)
NAT Tab:
  Add Automatic Address Translation Rules: V
  Translation Method: Hide
  Hide behind: Gateway IP (10.0.0.10)
```

זה ייצור אוטומטית שורה ב-NAT Rule Base שממירה את כל התעבורה היוצאת מ-192.168.1.0/24 להיראות כאילו מגיעה מ-10.0.0.10.

## Object Categories חשובים

- **Network Objects** - Host, Network, Address Range, Group.
- **Services** - TCP/UDP, קבוצות שירותים (Service Groups).
- **Users** - אינטגרציה עם AD/LDAP (ראו מדריך 5 - Identity Awareness).
- **Application Categories** - עבור Application Control Blade.

## דוגמה: מדיניות מלאה בסיסית ל-Lab

```
Rule 1: LAN_Out    -> Internal_Net -> Any -> Any -> HTTP,HTTPS,DNS -> Accept -> Log
Rule 2: Admin_Access -> Admin_PC   -> Gateway -> Any -> SSH,HTTPS -> Accept -> Log
Rule 3: Stealth     -> Any        -> Gateway -> Any -> Any -> Drop -> Log
Rule 4: Cleanup     -> Any        -> Any     -> Any -> Any -> Drop -> Log
```

## טיפים וטריקים

- **סדר הכללים קריטי** - כלל רחב מדי בראש הטבלה "יבלע" כללים ספציפיים יותר שמתחתיו. תמיד לשים כללים ספציפיים למעלה, כלליים למטה.
- השתמשו ב-**Section Titles** (קיפולי כותרת) בטבלה כדי לארגן כללים לפי נושא (VPN, Management, DMZ וכו') - עוזר מאוד בתחזוקה.
- הימנעו מ-"Any" רחב מדי ב-Source/Destination בכללי Accept - זהו הבסיס לעקרון **Least Privilege**.
- כלי מצוין לניתוח Rule Base ואיתור כללים לא בשימוש: **Rule Base Analysis** ב-SmartConsole.
- בדיקת Hit Count (כמה פעמים כלל "נדרך") עוזרת לזהות כללים מיותרים או "צל" (Shadowed Rules).

```bash
# בדיקת NAT Table בגייטווי בזמן אמת
fw tab -t fwx_alloc -s
```

## שאלות נפוצות לראיון עבודה בנושא זה

1. מה ההבדל בין Drop ל-Reject?
2. מהו Cleanup Rule ולמה הוא תמיד אחרון?
3. הסבירו את ההבדל בין Hide NAT ל-Static NAT ותנו דוגמת שימוש לכל אחד.
4. מה ההבדל בין Automatic NAT ל-Manual NAT?
5. מה זה Stealth Rule ולמה הוא חשוב?
6. איך סדר הכללים משפיע על אכיפת המדיניות בפועל?
7. מהם Implied Rules ומתי הייתם בוחרים לכבות אותם?

## קישורים חיצוניים

- Security Management Admin Guide (רשמי): https://sc1.checkpoint.com/documents/
- מאמרי SK על NAT ו-Rule Base: https://support.checkpoint.com/
- CheckMates - דיוני Best Practices למדיניות: https://community.checkpoint.com/
- וידאו הדרכה בנושא Policy ו-NAT ביוטיוב: https://www.youtube.com/watch?v=RUyYR1jbmUI
- חיפוש ממוקד ביוטיוב: https://www.youtube.com/results?search_query=Check+Point+NAT+security+policy+tutorial
