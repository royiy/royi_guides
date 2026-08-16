# מדריך 10: ניטור, לוגים וניהול עלויות (CloudWatch, CloudTrail, Billing)

## מבוא
כדי לנהל סביבת ענן בריאה ומאובטחת, חייבים לדעת מה קורה בתוכה: ביצועים, שגיאות, אבטחה, ומעקב אחרי הוצאות כספיות.

## מושגי מפתח
* **Amazon CloudWatch:** שירות הניטור המרכזי ב-AWS. אוסף מדדים (Metrics) כמו שימוש ב-CPU, אוגר לוגים (Logs) משרתים ולמבדות, ומאפשר הגדרת התראות (Alarms).
* **AWS CloudTrail:** שירות ביקורת (Audit) השומר תיעוד של כל קריאת API שנעשתה בחשבון (מי עשה, מה, מתי ומאיזה IP). קריטי לאבטחת מידע.
* **AWS Cost Explorer:** כלי ניתוח ויזואלי להצגת עלויות וחיזוי הוצאות לפי שירות או לפי תגיות (Tags).
* **AWS Budgets:** מאפשר להגדיר התראות למייל כשההוצאות חוצות רף מסוים.

## פקודות CLI נפוצות
### בסיסיות:
```bash
# קבלת מצב מדד (Metric) - לדוגמה CPU Utilization של שרת ספציפי
aws cloudwatch get-metric-statistics     --namespace AWS/EC2     --metric-name CPUUtilization     --dimensions Name=InstanceId,Value=i-1234567890abcdef0     --start-time 2023-10-01T00:00:00Z     --end-time 2023-10-01T01:00:00Z     --period 300     --statistics Average
```

### מתקדמות:
```bash
# חיפוש באירועי CloudTrail כדי לבדוק מי יצר שרת לאחרונה
aws cloudtrail lookup-events     --lookup-attributes AttributeKey=EventName,AttributeValue=RunInstances
```

## טיפים וטריקים
* **Billing Alarm:** הדבר הראשון שאתם חייבים לעשות בחשבון חדש הוא להגדיר Billing Alarm. קבלו אימייל ברגע שהחשבון עובר את ה-10$ כדי למנוע הפתעות כואבות בסוף החודש!
* **Tagging Strategy:** תייגו (Tags) את כל המשאבים שלכם לפי פרויקט, סביבה (Dev/Prod) או מחלקה. זה יאפשר לכם לסנן עלויות ב-Cost Explorer ולדעת מי אחראי על איזו הוצאה.

## שאלות ראיון עבודה נפוצות
1. **שאלה:** מה ההבדל העיקרי בין CloudWatch ל-CloudTrail?
   **תשובה:** CloudWatch מסתכל על "איך המערכת מתפקדת" (ביצועים, מדדים, לוגים אפליקטיביים). CloudTrail מסתכל על "מי עשה מה בחשבון" (תיעוד של קריאות ה-API מטעמי אבטחה ורגולציה).
2. **שאלה:** יש לכם התראה ב-CloudWatch שה-EC2 שלכם הגיע ל-90% RAM. האם Metric זה מגיע כברירת מחדל?
   **תשובה:** לא! CloudWatch מספק מדדי CPU, Disk ו-Network כברירת מחדל ב-EC2, אבל אינו יכול "לראות" לתוך מערכת ההפעלה כדי למדוד זיכרון (RAM). לשם כך יש להתקין CloudWatch Agent בתוך השרת.

## קישורים שימושיים
* [AWS CloudWatch Documentation](https://docs.aws.amazon.com/cloudwatch/)
* [YouTube: AWS Cost Optimization Tips](https://www.youtube.com/results?search_query=AWS+Cost+Optimization+Tips)
