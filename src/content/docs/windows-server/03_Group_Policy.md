---
title: "מדריך 3: ניהול Group Policy (GPO)"
description: "ניהול פוליסות ארגוניות באמצעות GPO ב-Windows Server."
---
# מדריך 3: ניהול Group Policy (GPO) 📜

## מבוא
Group Policy הוא כלי העוצמה של ה-Active Directory. הוא מאפשר למנהלי רשת לאכוף הגדרות, מדיניות אבטחה, התקנת תוכנות, הוספת מדפסות והגבלות על כל מחשבי הארגון באופן אוטומטי ממרכז אחד. הגדרות המדיניות נקראות GPOs (Group Policy Objects).
GPO מחולק לשניים: 
1. **Computer Configuration:** הגדרות החלות על המחשב עצמו (ללא קשר למי מתחבר אליו) - מוחלות בזמן הפעלת המחשב (Boot).
2. **User Configuration:** הגדרות החלות על המשתמש - מוחלות בזמן שהמשתמש מבצע Logon.

## פקודות ומושגים - בסיסי ומתקדם
*   **LSDOU:** סדר החלת ה-GPO על המחשב. L (Local) -> S (Site) -> D (Domain) -> OU (Organizational Unit). האחרון שמיושם (OU) דורס הגדרות קודמות במקרה של התנגשות.
*   **Enforced:** הגדרה על GPO ברמה העליונה שמכריחה אותו להיות מיושם, ולא מאפשרת ל-GPO ברמות נמוכות יותר לדרוס אותו.
*   **Block Inheritance:** הגדרה שניתן לשים על OU מסוים כדי לחסום הורשה של פוליסות מהרמות שמעליו (למעט אלה שהוגדרו כ-Enforced).

### פקודות חשובות ב-Command Line / PowerShell
```cmd
:: רענון ואכיפת GPO באופן מיידי על המחשב המקומי (ללא המתנה ל-90 דקות ברירת מחדל)
gpupdate /force

:: יצירת דו"ח של כל הפוליסות שחלו על המשתמש והמחשב הספציפי, ושמירתו כקובץ HTML לקריאה קלה
gpresult /h C:\temp\gpo_report.html

:: מציאת הסיבה לכך שפוליסה נחסמה (RSOP - Resultant Set of Policy) דרך ממשק גרפי (ישן אך שימושי)
rsop.msc
```

## דוגמאות מפורטות לניהול מדיניות
**תרחיש: מיפוי כונן רשת למשתמשי הנהלת חשבונות בלבד (Group Policy Preferences)**
במקום לכתוב סקריפטים מורכבים ב-Logon, משתמשים ב-Preferences:
1. פתחו את Group Policy Management Console (`gpmc.msc`).
2. צרו GPO חדש בשם "Map-Finance-Drive" וקשרו אותו ל-OU של משתמשי הכספים.
3. בצעו Edit ל-GPO ונווטו ל: `User Configuration -> Preferences -> Windows Settings -> Drive Maps`.
4. קליק ימני -> New -> Mapped Drive. הזינו את נתיב הרשת (למשל `\\fs01\finance`), בחרו אות כונן (למשל `Z:`).
5. בלשונית ה-Common, סמנו "Item-level targeting" וקבעו שהכונן ימופה רק אם המשתמש חבר בקבוצת האבטחה "Finance-Group".

## טיפים וטריקים 💡
*   **הגדרות מתנגשות:** לעולם אל תשנו את ה-`Default Domain Policy` ואת ה-`Default Domain Controllers Policy` מעבר להגדרות סיסמה (Password Policies). צרו תמיד GPOs חדשים וייעודיים לכל משימה.
*   **WMI Filtering:** מאפשר להתנות החלת GPO לפי חומרה. למשל, תוכלו ליצור פילטר WMI שמחיל פוליסה *אך ורק* על מחשבים ניידים (Laptop) או על גרסת Windows ספציפית (Windows 11 בלבד).
*   **זמני רענון:** כברירת מחדל, GPO מתרענן בתחנות העבודה כל 90 דקות (עם סטייה אקראית של 30 דקות). 

## שאלות ראיון עבודה 🎯
1. **שאלה:** מה זה Loopback Processing?
   *תשובה:* כלי המאפשר להחיל User Configuration על בסיס ה-OU שבו נמצא *המחשב*, ללא קשר באיזה OU נמצא המשתמש. שימושי מאוד במחשבי מעבדה/קיוסק (Kiosk) או שרתי Terminal, שבהם נרצה מדיניות משתמש מחמירה עבור מי שמתחבר לאותו מחשב ספציפי. מצב זה יכול לפעול כ-Merge או Replace.
2. **שאלה:** יש לנו GPO ברמת הדומיין שמגדיר רקע לשולחן עבודה, ו-GPO ברמת ה-OU שמשנה את הרקע לתמונה אחרת. מי מנצח?
   *תשובה:* ה-OU מנצח, כי הוא קרוב יותר לאובייקט בתהליך ההחלה (LSDOU). 
3. **שאלה:** מה יקרה אם על ה-GPO של הדומיין סומן Enforced?
   *תשובה:* ה-Enforced מנצח כל תחרות. ההגדרה ברמת הדומיין תדרוס את ה-OU ותיאכף.

## קישורים חיצוניים 🔗
*   [Group Policy Best Practices](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/manage/group-policy/group-policy-best-practices)
*   [יוטיוב: Group Policy Masterclass](https://www.youtube.com/results?search_query=windows+server+group+policy+tutorial)
