---
title: "מדריך 4: שירותי DNS ו-DHCP"
description: "הגדרת וניהול שירותי הליבה של הרשת DNS ו-DHCP."
---
# מדריך 4: שירותי DNS ו-DHCP ב-Windows Server 🌐

## מבוא
שירותי הליבה של הרשת נשענים על DHCP (המחלק כתובות IP) ו-DNS (המתרגם שמות למספרים ולהיפך).
*   **DHCP (Dynamic Host Configuration Protocol):** שירות שמעניק כתובות IP לתחנות ולמכשירים באופן אוטומטי לזמן מוגבל (Lease).
*   **DNS (Domain Name System):** ספר הטלפונים של הרשת. ללא DNS תקין, ה-Active Directory פשוט לא יעבוד, שכן תחנות לא יוכלו לאתר את ה-Domain Controller.

## פקודות ומושגים - בסיסי ומתקדם
### תהליך ה-DHCP - DORA:
1. **D**iscover: הלקוח צועק ברשת (Broadcast) "האם יש כאן שרת DHCP?".
2. **O**ffer: השרת משיב עם הצעת כתובת IP.
3. **R**equest: הלקוח מבקש לאשר את קבלת הכתובת הספציפית.
4. **A**cknowledge: השרת מאשר, שומר את הרישום אצלו ושולח פרטים נוספים (DNS, Gateway).

### סוגי רשומות DNS:
*   **A (Host):** תרגום שם ל-IPv4.
*   **AAAA:** תרגום שם ל-IPv6.
*   **CNAME (Alias):** כינוי המצביע לרשומת A קיימת (למשל `www` יצביע ל-`web-server01`).
*   **MX:** רשומת דואר (Mail Exchange).
*   **PTR (Pointer):** תרגום הפוך (Reverse) - מכתובת IP לשם המחשב.

### פקודות בדיקה ותחזוקה:
```cmd
:: שחרור וחידוש כתובת ה-IP בתחנת הלקוח
ipconfig /release
ipconfig /renew

:: מחיקת המטמון של ה-DNS המקומי של המחשב כדי למשוך עדכונים מיד
ipconfig /flushdns

:: בדיקת תרגום DNS
nslookup www.google.com

:: PowerShell: ביצוע שאילתת DNS מתקדמת
Resolve-DnsName -Name _ldap._tcp.dc._msdcs.corp.local -Type SRV
```

## דוגמאות מפורטות
**תרחיש: הגדרת שרידות ל-DHCP (DHCP Failover)**
כדי למנוע מצב שבו שרת DHCP נופל ותחנות לא מקבלות כתובת:
1. הקימו שני שרתי Windows Server עם התפקיד DHCP.
2. באחד מהם, צרו Scope (טווח כתובות, למשל 192.168.10.100-200).
3. קליק ימני על ה-Scope ובחרו **Configure Failover**.
4. בחרו את שרת ה-DHCP השני כשותף.
5. בחרו בתצורה:
   *   **Load Balance:** חלוקת העומס (למשל 50/50).
   *   **Hot Standby:** שרת אחד עובד ונותן 100% מהכתובות, והשני נמצא בהמתנה ונכנס לפעולה רק במקרה של קריסת הראשון.

## טיפים וטריקים 💡
*   **DHCP Reservations:** אם יש לכם מדפסות רשת, הדרך הטובה ביותר היא לתת להן כתובת IP מתוך ה-DHCP Reservation על ידי ציון ה-MAC Address של המדפסת. כך היא תמיד תקבל את אותה כתובת מהשרת ותהיה מנוהלת במרכז אחד ללא צורך בהגדרת IP סטטי במדפסת עצמה.
*   **DNS Scavenging:** ודאו שאתם מפעילים Aging & Scavenging בשרת ה-DNS. זה מנגנון קריטי שמוחק אוטומטית רשומות DNS ישנות של מחשבים שכבר לא קיימים ברשת, מה שמונע התנגשויות (IP Conflict) ובלאגן ב-DNS.

## שאלות ראיון עבודה 🎯
1. **שאלה:** מה ההבדל בין רשומת Forward Lookup Zone ל-Reverse Lookup Zone?
   *תשובה:* Forward מתרגם שם לכתובת IP (למשל `PC1.corp.local` יחזיר `10.0.0.5`). Reverse מתרגם כתובת IP חזרה לשם (למשל `10.0.0.5` יחזיר `PC1`).
2. **שאלה:** מחשב מקבל כתובת מתחילה ב- `169.254.x.x`. מה זה אומר?
   *תשובה:* זוהי כתובת APIPA (Automatic Private IP Addressing). זה אומר שהמחשב הוגדר לחיפוש שרת DHCP, לא קיבל תשובה (לרוב בגלל בעיית רשת או שהשרת נפל), והקצה לעצמו כתובת אוטומטית שלא מאפשרת גלישה חיצונית אלא רק תקשורת פנימית מוגבלת מאוד.
3. **שאלה:** מה זה DNS Forwarder?
   *תשובה:* הגדרה בשרת ה-DNS הפנימי, שאומרת לשרת: "אם קיבלת בקשה לתרגם כתובת שאתה לא מכיר (למשל אתר אינטרנט כמו youtube.com), הפנה את הבקשה לשרת DNS חיצוני כמו 8.8.8.8 כדי שיביא את התשובה".

## קישורים חיצוניים 🔗
*   [מיקרוסופט: כיצד עובד DNS](https://learn.microsoft.com/en-us/windows-server/networking/dns/dns-top)
*   [יוטיוב: DORA Process & DHCP Concepts](https://www.youtube.com/results?search_query=dhcp+dora+process)
