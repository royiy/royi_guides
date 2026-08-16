---
title: "מדריך 6: רשתות, תקשורת ו-Windows Firewall"
description: "תפיסות רשת, NIC Teaming וחומת האש של Windows."
---
# מדריך 6: רשתות, תקשורת ו-Windows Firewall 🌐🛡️

## מבוא
שרתי Windows הם לעיתים רבות הלב של התקשורת בארגון. יכולות הרשת של השרת כוללות לא רק כתובות IP וראוטינג (Routing) בסיסי, אלא מנגנונים לשיפור ביצועים כגון איחוד כרטיסי רשת (NIC Teaming), ניתוב מתקדם (RRAS), חומת אש מובנית וחזקה (Windows Defender Firewall with Advanced Security), ופתרונות VPN.

## תפיסות רשת בסיסיות לשרתים
*   **NIC Teaming (LBFO):** חיבור וירטואלי של שני כרטיסי רשת פיזיים או יותר לכרטיס לוגי אחד. מספק שתי מטרות:
    1. **שרידות (Failover):** אם כבל נקרע או מתג נופל, השרת ממשיך לעבוד דרך הכרטיס השני ללא ניתוק.
    2. **עומס (Load Balancing):** חלוקת העברת הנתונים על גבי שני הכרטיסים במקביל.
*   **Windows Defender Firewall Profiles:** לשרת יש 3 פרופילי רשת. 
    1. **Domain:** כשהשרת מחובר ל-DC ומזהה את רשת הארגון (מוגדר בד"כ עם חוקים מקלים).
    2. **Private:** רשת פרטית ללא דומיין, כגון רשת ביתית (יחסית מוגן).
    3. **Public:** רשת ציבורית כמו בית קפה או האינטרנט הפתוח (רמת החסימה הגבוהה ביותר).

## פקודות תקשורת שימושיות - PowerShell מתקדם
בעוד שכולם מכירים את `ping` ו-`ipconfig`, מנהל שרתים אמיתי משתמש בכלים מתקדמים:
```powershell
# בדיקת תקשורת הכוללת גם בדיקת פורט ספציפי (תחליף מצוין ל-Telnet)
Test-NetConnection -ComputerName srv-db-01 -Port 1433

# הצגת טבלת הניתוב (Routing Table) של השרת
Get-NetRoute | Format-Table -AutoSize

# פתיחת פורט ב-Firewall דרך שורת פקודה לאפליקציה מותאמת אישית
New-NetFirewallRule -DisplayName "Allow AppX Port 8080" -Direction Inbound -LocalPort 8080 -Protocol TCP -Action Allow

# יצירת NIC Team משני כרטיסי הרשת הקיימים
New-NetLbfoTeam -Name "ProductionTeam" -TeamMembers "Ethernet1","Ethernet2" -TeamingMode SwitchIndependent
```

## דוגמאות מפורטות לניהול חומת אש (Firewall)
**תרחיש: פתיחת השרת לניהול מרחוק דרך PING (ICMP)**
כברירת מחדל, שרת Windows טרי שומר על פרופיל שקט ולא מחזיר תשובות לבקשות Ping (Echo Request), מה שלעיתים מקשה על מוניטורינג ותמיכה.
1. פתחו את פאנל חומת האש המתקדם (`wf.msc`).
2. עברו ל- **Inbound Rules** (חוקים נכנסים).
3. חפשו ברשימה חוק קיים בשם: `File and Printer Sharing (Echo Request - ICMPv4-In)`.
4. תראו שיש שניים או שלושה חוקים כאלו (לפי הפרופילים השונים). קליק ימני על זה ששייך לפרופיל ה-Domain ובחרו **Enable Rule**.
5. כעת השרת יענה ל-Ping מתוך הרשת הארגונית בלבד, אך ימשיך לסנן Ping מרשת האינטרנט הפתוחה (Public).

## טיפים וטריקים 💡
*   **לעולם אל תכבו את ה-Firewall!** הרבה מנהלי רשת, כשמשהו לא עובד להם, מכבים את ה-Windows Firewall לחלוטין ואז שוכחים ממנו. זו פרצת אבטחה חמורה. אם תוכנה לא מתקשרת, השתמשו בכלי ה-Logging של ה-Firewall כדי לראות איזה פקט (Packet) נפל, ופתחו רק את הפורט הספציפי.
*   **IPv6:** אפילו אם אינכם משתמשים ב-IPv6 ברשת הארגונית, מיקרוסופט **לא ממליצה** לבטל אותו בכרטיס הרשת. שירותי ליבה רבים ב-Windows מצפים לנוכחותו, והשבתתו עלולה לגרום לתקלות שרת בלתי מוסברות.

## שאלות ראיון עבודה 🎯
1. **שאלה:** למה עדיף להשתמש ב- `Test-NetConnection` במקום ב-`Ping`?
   *תשובה:* ה-Ping משתמש בפרוטוקול ICMP. לעיתים קרובות Firewall יחסום בקשות ICMP אך השרת והאפליקציה כן פעילים. `Test-NetConnection` בתוספת הפורמטר `-Port` יבדוק אם פורט ספציפי (למשל 80 ל-Web או 3389 ל-RDP) עונה ב-TCP, וכך נותן תמונת מצב אמיתית של השירות.
2. **שאלה:** מה ההבדל בין TCP ל-UDP?
   *תשובה:* TCP הוא פרוטוקול אמין (Connection-Oriented). הוא מבצע לחיצת יד (Three-way handshake) ומוודא שכל חבילת נתונים הגיעה (מתאים ל-HTTP, שיתוף קבצים). UDP הוא פרוטוקול של "שגר ושכח" ללא וידוא הגעה, אך הוא מהיר הרבה יותר (מתאים לשידורי וידאו, VoIP, ושאילתות DNS קצרות).

## קישורים חיצוניים 🔗
*   [Windows Defender Firewall Documentation](https://learn.microsoft.com/en-us/windows/security/operating-system-security/network-security/windows-firewall/)
*   [יוטיוב: Windows Server NIC Teaming Guide](https://www.youtube.com/results?search_query=windows+server+nic+teaming+setup)
