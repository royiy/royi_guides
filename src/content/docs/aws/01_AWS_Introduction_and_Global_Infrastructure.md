---
title: "מדריך 1: מבוא ל-AWS ותשתית גלובלית"
description: "היכרות עם אזורים (Regions) ו-Availability Zones"
---

## מבוא
אמזון ווב סרוויסז (AWS) היא פלטפורמת הענן המובילה בעולם, המציעה מעל 200 שירותים מלאים ממרכזי נתונים ברחבי העולם. במדריך זה נכיר את התשתית הגלובלית של AWS.

## מושגי מפתח
* **Region (אזור):** מיקום גיאוגרפי פיזי בעולם בו ל-AWS יש מספר קבוצות של מרכזי נתונים.
* **Availability Zone (AZ):** מרכז נתונים אחד או יותר בתוך Region, עם מתח, רשת וקישוריות נפרדים ויתירים.
* **Edge Locations:** נקודות קצה המשמשות לשירותי CDN (כמו CloudFront) כדי להגיש תוכן למשתמשים במהירות.

## פקודות CLI נפוצות
### בסיסיות:
```bash
# הגדרת סביבת העבודה והפרופיל
aws configure

# בדיקת זהות המשתמש הנוכחי
aws sts get-caller-identity
```

### מתקדמות:
```bash
# רשימת כל האזורים (Regions) הזמינים
aws ec2 describe-regions --query "Regions[].RegionName" --output text

# רשימת AZs בתוך אזור ספציפי
aws ec2 describe-availability-zones --region us-east-1
```

## טיפים וטריקים
* **בחירת Region:** תמיד תבחרו את האזור הקרוב ביותר ללקוחות שלכם כדי להקטין Latency, אך בדקו גם מחירי שירותים (יש הבדלים בין אזורים).
* **יתירות (High Availability):** תמיד תפרסו את המערכת שלכם על פני לפחות 2 Availability Zones כדי לשרוד נפילה של דאטה סנטר שלם.

## שאלות ראיון עבודה נפוצות
1. **שאלה:** מה ההבדל בין Region ל-Availability Zone?
   **תשובה:** Region הוא אזור גיאוגרפי שלם, בעוד ש-AZ הוא דאטה-סנטר (או קבוצה שלהם) בתוך אותו Region. אזור תמיד מכיל לפחות 2 AZs.
2. **שאלה:** למה משמש שירות Edge Location?
   **תשובה:** בעיקר ל-Caching (מטמון) של תוכן קרוב למשתמש הקצה דרך Amazon CloudFront, וכן ל-Route53.

## קישורים שימושיים
* [AWS Global Infrastructure - דוקומנטציה רשמית](https://aws.amazon.com/about-aws/global-infrastructure/)
* [YouTube: AWS Global Infrastructure Explained](https://www.youtube.com/results?search_query=AWS+Global+Infrastructure+Explained)
