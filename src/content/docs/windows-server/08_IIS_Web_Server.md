---
title: "מדריך 8: ניהול שרת אינטרנט IIS"
description: "הקמת שרת Web, ניהול Application Pools והגדרות SSL/SNI."
---
# מדריך 8: ניהול שרת אינטרנט IIS 🌐

## מבוא
IIS (Internet Information Services) הוא שרת ה-Web המובנה של Windows Server. הוא מאפשר אירוח אתרי אינטרנט, אפליקציות רשת המבוססות על ASP.NET, ושירותי FTP.
IIS מבוסס על אדריכלות שמאפשרת אירוח מספר עצום של אתרים על אותו שרת פיזי באמצעות הפרדה וירטואלית.

## מושגים אדריכליים ב-IIS
*   **Site (אתר):** המיכל הלוגי שמחזיק את הגדרות האתר (נתיב התיקייה בדיסק, הגדרות הלוגים).
*   **Binding:** אומר ל-IIS כיצד לנתב תעבורה נכנסת לאתר הספציפי על בסיס 3 פרמטרים: פרוטוקול (HTTP/HTTPS), כתובת IP ופורט, ושם דומיין (Host Name). 
*   **Application Pool:** "בריכת" משאבים (Proccess שנקרא `w3wp.exe`). כל אתר יושב בתוך App Pool. זהו לב המערכת. הוא מבודד את האתר משאר האתרים. אם אתר ב-App Pool מסוים קורס, האתרים ב-App Pools אחרים לא מושפעים כלל.

## פקודות ניהול והגדרות
בעוד שניתן לנהל את IIS דרך ממשק ה-IIS Manager הגרפי (`inetmgr`), פקודות PowerShell חוסכות זמן רב. יש לייבא את המודול המתאים קודם:
```powershell
Import-Module WebAdministration

# יצירת Application Pool חדש
New-WebAppPool -Name "FinanceAppPool"

# הקמת אתר חדש ושיוכו ל-App Pool
New-Website -Name "FinanceSite" -PhysicalPath "C:\inetpub\FinanceSite" -ApplicationPool "FinanceAppPool" -Port 80 -Force

# ריסט מוחלט ומהיר לכל שירות ה-IIS בשרת (שימושי במקרים קיצוניים של תקיעת השירות)
iisreset
```

## דוגמאות מפורטות לניהול IIS
**תרחיש: הגדרת תעודת SSL ומנגנון SNI.**
נניח שיש לנו שרת עם כתובת IP אחת בודדת (למשל 10.0.0.50), ואנחנו רוצים לארח עליו 3 אתרים שונים שכולם עובדים בתקשורת מוצפנת ומאובטחת (HTTPS בפורט 443).
בעבר, כל אתר HTTPS היה חייב כתובת IP משלו. כיום משתמשים ב- **SNI (Server Name Indication)**:
1. ייבאו את תעודות ה-SSL דרך מסך ה-Server Certificates ב-IIS.
2. בחרו באתר הראשון וקליק ימני -> **Bindings**.
3. הוסיפו Binding מסוג HTTPS ופורט 443. 
4. תחת שדה Host Name, הזינו את ה-URL של האתר (למשל `app1.corp.local`).
5. **קריטי:** סמנו את התיבה "Require Server Name Indication".
6. בחרו למטה את תעודת ה-SSL הרלוונטית.
7. חזרו על הפעולה לשאר האתרים באותו פורט בדיוק. ה-IIS יידע לנתב את התעבורה לאתר ולתעודה הנכונים בזכות שם ה-Host שהקלדתם.

## טיפים וטריקים 💡
*   **מיקום קבצי האתר:** אל תארחו את קבצי האתר בתיקיית הבסיס המקורית (`C:\inetpub\wwwroot`). צרו תת-תיקיות או לחלופין מקמו את האתרים בכונן אחר (למשל `D:\Websites`) על מנת למנוע התמלאות של כונן מערכת ההפעלה מקבצי לוגים ומשתמשים.
*   **הרשאות:** כשאתם יוצרים אתר, מי שבאמת ניגש לקבצים בדיסק (NTFS) הוא היוזר שמריץ את ה-Application Pool (לרוב נראה ככה: `IIS AppPool\YourAppPoolName`). ודאו שיש לו הרשאות קריאה בתיקייה!

## שאלות ראיון עבודה 🎯
1. **שאלה:** מהו Application Pool ולמה הוא כל כך חשוב?
   *תשובה:* ה-App Pool מריץ את התהליך ברקע עבור אתרים. הוא מבטיח בידוד מוחלט (Isolation). אם נשים מספר אתרים של לקוחות שונים ב-App Pools נפרדים, קריסת קוד באתר של לקוח א' או דליפת זיכרון שם לא תשפיע על לקוח ב'. בנוסף, זה מאפשר הפעלת אתרים עם זהויות (Service Accounts) שונות ברשת לקבלת הרשאות מסד נתונים ספציפיות.
2. **שאלה:** מה מסמל קוד שגיאה של HTTP 500 לעומת HTTP 403?
   *תשובה:* קוד **500 Internal Server Error** מצביע על שגיאה או קריסה בשרת עצמו (לרוב בקוד האפליקציה, הגדרות קובץ `web.config` לא תקינות, או מסד נתונים לא זמין). קוד **403 Forbidden** אומר שהשרת תקין, אך למשתמש אין הרשאות לגשת לעמוד הספציפי או לספרייה.

## קישורים חיצוניים 🔗
*   [המדריך הרשמי של מיקרוסופט לארכיטקטורת IIS](https://learn.microsoft.com/en-us/iis/get-started/introduction-to-iis/introduction-to-iis-architecture)
*   [יוטיוב: How to Setup IIS Web Server and Host a Website](https://www.youtube.com/results?search_query=setup+iis+web+server+windows+server)
