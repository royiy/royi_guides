---
title: "מדריך 2: ניהול Active Directory Domain Services"
description: "הבנת AD, ניהול אובייקטים, קבוצות, הרשאות ותפקידי FSMO."
---

## מבוא
Active Directory (או בקיצור AD) הוא שירות ניהול התשתיות, הזהויות וההרשאות של מיקרוסופט. הוא משמש כ"ספר טלפונים" ומרכז בקרת אבטחה של הארגון. שרת שעליו מותקן AD נקרא **Domain Controller (DC)**.
ב-AD אנו מנהלים אובייקטים כגון: משתמשים, מחשבים, קבוצות (Groups), ומאורגנים בתוך יחידות ארגוניות (Organizational Units - OUs).

## מושגי יסוד ומבנה ה-AD
*   **Domain:** אוסף של אובייקטים המנוהלים תחת אותו מסד נתונים וחולקים חוקי אבטחה משותפים (למשל `corp.local`).
*   **Tree & Forest:** "עץ" הוא אוסף של דומיינים החולקים Name Space רציף. "יער" (Forest) הוא האוסף הגדול ביותר של עצים החולקים סכמה (Schema) ו-Global Catalog משותפים.
*   **OU (Organizational Unit):** התיקייה שבה מאורגנים האובייקטים. ל-OU ניתן לקשר Group Policy (GPO) וניתן לבצע אליה Delegation (האצלת סמכויות).
*   **FSMO Roles (Flexible Single Master Operations):** 5 תפקידים קריטיים שרק DC אחד (או יותר) מחזיק בכל רגע נתון. (Schema Master, Domain Naming Master, PDC Emulator, RID Master, Infrastructure Master).

## פקודות PowerShell לניהול שוטף
כדי לעבוד עם AD ב-PowerShell, יש לוודא שהמודול מותקן (באמצעות התקנת RSAT).
```powershell
# חיפוש משתמש לפי שם
Get-ADUser -Filter {Name -like "*Cohen*"} -Properties *

# יצירת משתמש חדש
New-ADUser -Name "Yossi Levi" -SamAccountName "yossil" -GivenName "Yossi" -Surname "Levi" -UserPrincipalName "yossil@corp.local" -Path "OU=Users,OU=TelAviv,DC=corp,DC=local" -Enabled $true

# הוספת משתמש לקבוצת אבטחה
Add-ADGroupMember -Identity "IT-Admins" -Members "yossil"

# נעילת מחשב / חיפוש מחשבים לא פעילים ב-90 יום האחרונים
Search-ADAccount -AccountInactive -TimeSpan 90.00:00:00 -ComputersOnly
```

## דוגמאות מפורטות לניהול הרשאות
**Delegation of Control (האצלת סמכויות):**
נניח שיש לכם מחלקת Helpdesk ואתם רוצים לתת להם הרשאה **רק** לאפס סיסמאות למשתמשים, מבלי לתת להם הרשאות Domain Admin (שזה מסוכן!).
1. פתחו את ממשק הניהול של AD - לחיצה על התחל והקלדת `dsa.msc` (Active Directory Users and Computers).
2. קליק ימני על ה-OU הרלוונטי (למשל `OU=StandardUsers`) ובחרו **Delegate Control**.
3. באשף, הוסיפו את קבוצת "Helpdesk-Team".
4. במסך הבא בחרו במשימה: "Reset user passwords and force password change at next logon".
5. סיום. כעת לצוות התמיכה יש הרשאה כירורגית בדיוק למה שהם צריכים, על פי עקרון ההרשאה הפחותה (Principle of Least Privilege).

## טיפים וטריקים 💡
*   **Active Directory Recycle Bin:** הפיצ'ר הכי חשוב שתפעילו! כברירת מחדל הוא כבוי. אם תמחקו משתמש או OU בטעות, סל המיחזור יאפשר לשחזר אותם עם כל ההרשאות. מפעילים זאת דרך ה-Active Directory Administrative Center (dsac.exe).
*   **שימוש ב-LAPS:** לעולם אל תשתמשו באותה סיסמת Local Administrator בכל המחשבים בארגון. התקינו LAPS (Local Administrator Password Solution) דרך ה-AD כדי לסנכרן סיסמה אקראית לכל מחשב בנפרד.

## שאלות ראיון עבודה 🎯
1. **שאלה:** מהו ה-PDC Emulator (חלק מ-FSMO)?
   *תשובה:* ה-PDC אחראי על מספר דברים קריטיים: סנכרון שעון (Time Sync) מול כל שאר השרתים והמחשבים בדומיין, ניהול שינויי סיסמאות ונעילת חשבונות ברחבי הדומיין, ועדכוני GPO.
2. **שאלה:** מהו Global Catalog (GC)?
   *תשובה:* ה-GC הוא מסד נתונים חלקי לקריאה בלבד (Read-Only) שמכיל עותק של כל האובייקטים מכל הדומיינים באותו Forest. הוא מאפשר לבצע חיפוש אובייקטים מהיר בכל היער ומאפשר תהליכי התחברות (Logon) בסביבות מרובות דומיינים על ידי חיפוש חברויות בקבוצות יוניברסליות.
3. **שאלה:** מחקנו OU בטעות וה-Recycle bin כבוי. מה הפתרון?
   *תשובה:* שחזור מסובך שנקרא Authoritative Restore מתוך גיבוי System State ב-Directory Services Restore Mode (DSRM). לכן חובה להפעיל סל מיחזור!

## קישורים חיצוניים 🔗
*   [מיקרוסופט: מושגי יסוד ב-AD](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/active-directory-domain-services)
*   [יוטיוב: Understanding Active Directory and Group Policy](https://www.youtube.com/results?search_query=understanding+active+directory)
