# מדריך 6: מסדי נתונים (RDS, DynamoDB)

## מבוא
במקום לנהל מסדי נתונים באופן ידני על שרתים (התקנה, עדכונים, גיבויים), AWS מציעה שירותים מנוהלים (Managed Services) למסדי נתונים רלציוניים (SQL) ו-NoSQL.

## מושגי מפתח
* **Amazon RDS:** שירות מסדי נתונים רלציוניים התומך ב-MySQL, PostgreSQL, MariaDB, Oracle ו-SQL Server.
* **Amazon Aurora:** מנוע DB שפותח על ידי AWS, תואם MySQL ו-PostgreSQL, מהיר פי 5 ויקר קצת יותר, אבל בנוי לענן עם יכולות Scaling מתקדמות.
* **Amazon DynamoDB:** מסד נתונים NoSQL מהיר במיוחד (Serverless, Key-Value), בעל זמני תגובה של מילי-שניות בודדות.
* **Multi-AZ:** פריסת ה-DB למספר אזורי זמינות לקבלת יתירות. אם השרת הראשי קורס, שרת הגיבוי נכנס לפעולה אוטומטית.

## פקודות CLI נפוצות
### בסיסיות:
```bash
# יצירת טבלה ב-DynamoDB
aws dynamodb create-table     --table-name Users     --attribute-definitions AttributeName=UserId,AttributeType=S     --key-schema AttributeName=UserId,KeyType=HASH     --billing-mode PAY_PER_REQUEST
```

### מתקדמות:
```bash
# יצירת סנאפשוט (גיבוי ידני) למסד נתונים ב-RDS
aws rds create-db-snapshot --db-instance-identifier my-prod-db --db-snapshot-identifier my-db-backup-01

# סריקה ושליפת נתונים מ-DynamoDB
aws dynamodb scan --table-name Users
```

## טיפים וטריקים
* **Read Replicas:** אם ה-DB שלכם (RDS) סובל מעומס קריאות עקב דוחות או חיפושים, צרו Read Replicas (העתקים לקריאה בלבד) והפנו את כל הקריאות אליהם כדי לשחרר עומס מה-DB הראשי.
* ב-DynamoDB, תמיד העדיפו On-Demand Billing (Pay per request) עבור עומסים לא צפויים, ו-Provisioned רק כאשר העומס קבוע וידוע מראש.

## שאלות ראיון עבודה נפוצות
1. **שאלה:** מה ההבדל ב-RDS בין Multi-AZ ל-Read Replica?
   **תשובה:** Multi-AZ משמש ל-High Availability (Disaster Recovery). זהו גיבוי סינכרוני שלא ניתן לקרוא ממנו ביומיום. Read Replica משמש לשיפור ביצועים (Scaling) לקריאות, והוא אסינכרוני.
2. **שאלה:** האם DynamoDB מתאים לשמירת נתונים עם קשרים מורכבים ושאילתות JOIN?
   **תשובה:** לא! DynamoDB הוא NoSQL ולא תומך ב-JOIN. לקשרים מורכבים כדאי לבחור ב-RDS (SQL).

## קישורים שימושיים
* [AWS RDS Documentation](https://docs.aws.amazon.com/rds/)
* [YouTube: AWS Databases Overview](https://www.youtube.com/results?search_query=AWS+RDS+vs+DynamoDB)
