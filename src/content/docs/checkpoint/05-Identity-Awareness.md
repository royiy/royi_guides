---
title: "Identity Awareness - אכיפה לפי משתמש ולא רק IP"
category: Check Point
part: 5/10
---

## למה צריך Identity Awareness?

בארגון מודרני, כתובת IP לא באמת מזהה "מי" משתמש ברשת - עם DHCP, VPN, ומחשבים ניידים, אותו IP יכול לשמש אנשים שונים בזמנים שונים. **Identity Awareness (IDA)** מאפשר לבנות כללי מדיניות המבוססים על **זהות המשתמש או הקבוצה** (למשל "צוות הנהלת חשבונות" מ-Active Directory) ולא רק על כתובת רשת.

## שיטות זיהוי (Identity Sources)

Check Point תומך במספר שיטות לזיהוי משתמשים, וניתן לשלב כמה יחד:

1. **AD Query** - השיטה הנפוצה ביותר, "Agentless". הגייטווי קורא את לוגי האבטחה (Security Event Logs) של Domain Controller-ים ב-Active Directory ומזהה חיבורי Login/Logoff, ללא כל התקנה בתחנות הקצה.
2. **Browser-Based Authentication** - Captive Portal שמבקש מהמשתמש להזין שם משתמש וסיסמה בדפדפן.
3. **Identity Agent** - תוכנה שמותקנת על תחנת הקצה (Full Agent / Light Agent) ומדווחת זהות ישירות לגייטווי - מדויק יותר מ-AD Query.
4. **Terminal Servers Agent** - עבור סביבות Terminal/Citrix בהן כמה משתמשים חולקים אותו IP.
5. **Identity Collector** - כלי חיצוני (מותקן על שרת נפרד) שאוסף מידע מ-AD/Radius/Syslog ומעביר לגייטווי - שימושי בסביבות Distributed גדולות.
6. **RADIUS Accounting** - קבלת מידע זהות מ-NAC/RADIUS Server חיצוני.

## הגדרת AD Query - שלב אחר שלב

1. הפעלת Blade **Identity Awareness** על הגייטווי ב-SmartConsole.
2. באשף ההפעלה, בוחרים ב-**AD Query** כמקור זיהוי.
3. הגדרת חיבור ל-Active Directory - Domain, DC Servers, פרטי חשבון שירות (Service Account) עם הרשאות קריאה מספקות (Read logs).
4. הגדרת **Directory Access** - ה-Gateway צריך גישה לקרוא Event Logs מה-DC-ים (בד"כ פורט WMI/135 ו-RPC).

```bash
# בדיקת סטטוס AD Query בגייטווי
pdp connections
# בדיקת סטטוס שירות ה-PDP (Policy Decision Point)
cpstat pdp
```

## בניית מדיניות עם אובייקטי משתמש

לאחר שה-IDA פעיל, ניתן ליצור **Access Role** - אובייקט מדיניות המשלב:

- **Networks** - איזה רשת/מיקום.
- **Users** - משתמש/קבוצת AD ספציפית.
- **Machines** - מכשיר ספציפי (בשילוב עם Machine Awareness).

דוגמת כלל עם Access Role:

```
Rule: Finance_Team_Access
Source: AR_Finance_Group (Access Role: Group=Finance, Network=Any)
Destination: Finance_Servers
Service: HTTPS, SQL
Action: Accept
Track: Log
```

## Identity Sharing בין Gateways

בסביבה עם כמה גייטווים, אפשר להגדיר **Identity Sharing** - גייטווי אחד (למשל זה שמבצע AD Query) משתף את מידע הזהות עם גייטווים אחרים דרך API פנימי, כדי לא לבצע Query כפול ולשמור על ביצועים.

## דוגמה מעשית מלאה

תרחיש: רוצים לאפשר גישה לשרת פיננסי רק לחברי קבוצת AD "Finance", ולחסום את כל השאר, גם אם הם ברשת הפנימית.

```
1. הפעלת Identity Awareness Blade + AD Query מוגדר מול DC בכתובת 192.168.1.5
2. יצירת Access Role: "Finance-AR" -> Users: Finance (AD Group)
3. Rule 1: Source=Finance-AR, Dest=Finance_Server, Service=HTTPS -> Accept
4. Rule 2 (מתחת): Source=Any, Dest=Finance_Server, Service=Any -> Drop
```

## טיפים וטריקים

- **AD Query הוא Agentless אבל לא מיידי** - יש עיכוב קצר (כמה שניות עד דקה) עד שהגייטווי "רואה" Login חדש - חשוב להסביר את זה למשתמשים/מנהלים שמצפים לזמינות מיידית.
- כשה-AD Query "נתקע" ולא מזהה משתמשים, לרוב הבעיה היא **הרשאות Service Account** לא מספקות, או חסימת פורטים (WMI/RPC) בין הגייטווי ל-DC.
- שילוב **Identity Agent** נדרש בסביבות עם Terminal Servers, VPN מרובה משתמשים על אותו IP, או כשצריך זיהוי מדויק ומיידי יותר.
- כלי אבחון מרכזי: `pdp` command group (`pdp connections`, `pdp monitor all`).
- זכרו שכללי Identity Awareness צריכים להיות **מעל** כללים כלליים יותר ב-Rule Base (סדר!).

## שאלות נפוצות לראיון עבודה בנושא זה

1. מה ההבדל בין AD Query ל-Identity Agent? מתי תבחרו בכל אחד?
2. מהו Access Role וכיצד הוא שונה מ-Network Object רגיל?
3. איך פותרים מצב שבו AD Query לא מזהה משתמשים בכלל?
4. מה זה Identity Sharing ולמה הוא נחוץ בסביבה מרובת Gateways?
5. איזה שיטת זיהוי הייתם ממליצים לסביבת Terminal Server משותפת ולמה?
6. מהם פרוטוקולי התקשורת הנדרשים בין הגייטווי ל-Domain Controller ב-AD Query?

## קישורים חיצוניים

- Identity Awareness Admin Guide (רשמי): https://sc1.checkpoint.com/documents/
- מאמרי SK על AD Query ופתרון תקלות: https://support.checkpoint.com/
- CheckMates - דיוני Identity Awareness: https://community.checkpoint.com/
- הדרכת Identity Awareness ביוטיוב: https://www.youtube.com/playlist?list=PL4Jm1LJEII4b-aoZQ5SltYgzRMPkRPn1u
- חיפוש נוסף ביוטיוב: https://www.youtube.com/results?search_query=Check+Point+Identity+Awareness+AD+Query+tutorial
