---
title: "מדריך 4: תקשורת ורשתות (VPC)"
description: "יצירת רשתות פרטיות וירטואליות, ניתובים ואבטחת רשת"
---

# מדריך 4: תקשורת ורשתות (VPC - Virtual Private Cloud)

## מבוא
Amazon VPC מאפשר לכם להקים רשת וירטואלית פרטית משלכם בתוך הענן של AWS. כאן תשלטו בכתובות ה-IP, רשתות המשנה (Subnets), וניתוב התקשורת.

## מושגי מפתח
* **Subnet:** חלוקה לוגית של רשת ה-VPC לפי אזורי זמינות (AZ).
  * *Public Subnet:* מחובר לאינטרנט דרך Internet Gateway.
  * *Private Subnet:* אין גישה ישירה לאינטרנט.
* **Internet Gateway (IGW):** הרכיב שמאפשר תקשורת בין ה-VPC לאינטרנט.
* **NAT Gateway:** מאפשר לשרתים ברשת פרטית לגשת לאינטרנט (למשל לצורך עדכונים) מבלי לקבל תקשורת נכנסת מהאינטרנט.
* **Route Table:** טבלת ניתוב הקובעת לאן התעבורה תזרום מכל Subnet.

## פקודות CLI נפוצות
### בסיסיות:
```bash
# יצירת VPC חדש עם בלוק CIDR
aws ec2 create-vpc --cidr-block 10.0.0.0/16

# יצירת Subnet בתוך ה-VPC
aws ec2 create-subnet --vpc-id vpc-0a1b2c3d --cidr-block 10.0.1.0/24
```

### מתקדמות:
```bash
# יצירת Internet Gateway וחיבורו ל-VPC
aws ec2 create-internet-gateway
aws ec2 attach-internet-gateway --vpc-id vpc-0a1b2c3d --internet-gateway-id igw-0123456789

# הגדרת ניתוב לאינטרנט בטבלת הניתוב
aws ec2 create-route --route-table-id rtb-22574640 --destination-cidr-block 0.0.0.0/0 --gateway-id igw-0123456789
```

## טיפים וטריקים
* תמיד השאירו מקום ב-CIDR שלכם ואל תשתמשו בכתובות החופפות לרשתות הארגוניות שלכם (On-Premises), כדי שתוכלו לחבר ביניהן בהמשך באמצעות VPN או Direct Connect.
* VPC Endpoints: השתמשו בהם כדי לגשת לשירותי AWS (כמו S3 או DynamoDB) מבלי לצאת לאינטרנט הציבורי, משפר אבטחה וחוסך בעלויות NAT.

## שאלות ראיון עבודה נפוצות
1. **שאלה:** מה ההבדל בין Security Group ל-NACL (Network Access Control List)?
   **תשובה:** Security Group עובד ברמת ה-Instance, הוא Stateful (אם תעבורה נכנסת מותרת, התשובה תעבור אוטומטית). NACL עובד ברמת ה-Subnet, הוא Stateless (יש להגדיר חוקים גם לנכנס וגם ליוצא בנפרד).
2. **שאלה:** יש לכם שרת ב-Private Subnet שצריך לגשת ל-S3. איך תעשו זאת בדרך המאובטחת ביותר?
   **תשובה:** ניצור VPC Gateway Endpoint עבור S3 בתוך ה-VPC שלנו, ונוסיף נתיב אליו ב-Route Table של ה-Private Subnet.

## קישורים שימושיים
* [AWS VPC Documentation](https://docs.aws.amazon.com/vpc/)
* [YouTube: AWS VPC Architecture](https://www.youtube.com/results?search_query=AWS+VPC+Explained)
