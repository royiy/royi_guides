# מדריך 2: ניהול זהויות והרשאות (IAM - Identity and Access Management)

## מבוא
IAM הוא שירות שדרכו ניתן לנהל גישה מאובטחת למשאבי AWS. בעזרתו ניתן לקבוע "מי" יכול לגשת (Authentication) ו"למה" הוא יכול לגשת (Authorization).

## מושגי מפתח
* **Users:** משתמש פיזי או אפליקציה.
* **Groups:** קבוצה של משתמשים המקבלים הרשאות זהות.
* **Roles:** תפקיד שניתן לאמץ (Assume) על ידי משתמש, שירות (כמו EC2) או חשבון אחר, ולא דורש סיסמאות קבועות.
* **Policies:** מסמכי JSON המגדירים את ההרשאות בפועל (Allow/Deny).

## פקודות CLI נפוצות
### בסיסיות:
```bash
# יצירת משתמש חדש
aws iam create-user --user-name john-doe

# הוספת משתמש לקבוצה
aws iam add-user-to-group --user-name john-doe --group-name Developers
```

### מתקדמות:
```bash
# אימוץ תפקיד (Assume Role) - שימושי לסקריפטים
aws sts assume-role --role-arn arn:aws:iam::123456789012:role/MyRole --role-session-name MySession

# יצירת Policy מקובץ JSON מקומי
aws iam create-policy --policy-name MyCustomPolicy --policy-document file://policy.json
```

## טיפים וטריקים
* **Least Privilege:** תמיד תנו את ההרשאות המינימליות ההכרחיות לפעולה.
* **MFA (Multi-Factor Authentication):** חובה להפעיל עבור חשבון ה-Root ועבור כל המשתמשים הניהוליים.
* לעולם אל תשתמשו ב-Root Account לעבודה יומיומית!

## שאלות ראיון עבודה נפוצות
1. **שאלה:** מה ההבדל בין IAM Role ל-IAM User?
   **תשובה:** User מייצג ישות קבועה עם Credentials קבועים (סיסמה או Access Keys). Role מייצג הרשאות זמניות שניתן "לאמץ" על ידי שירותים (כמו EC2) או משתמשים, ללא Credentials קבועים, מה שהופך אותו למאובטח יותר.
2. **שאלה:** מה זה Policy Evaluation ב-AWS?
   **תשובה:** ברירת המחדל היא Deny. אם יש Allow מפורש זה יאפשר את הפעולה, אך אם יש Deny מפורש באחד מה-Policies, ה-Deny תמיד ינצח (Explicit Deny).

## קישורים שימושיים
* [AWS IAM Documentation](https://docs.aws.amazon.com/iam/)
* [YouTube: AWS IAM Tutorial](https://www.youtube.com/results?search_query=AWS+IAM+Tutorial)
