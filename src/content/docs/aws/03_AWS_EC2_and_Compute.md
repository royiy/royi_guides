# מדריך 3: ניהול שרתים וחישוב (EC2 - Elastic Compute Cloud)

## מבוא
Amazon EC2 מאפשר השכרת שרתים וירטואליים (Instances) בענן. זהו שירות הליבה של עולם ה-IaaS (Infrastructure as a Service) ב-AWS.

## מושגי מפתח
* **AMI (Amazon Machine Image):** התבנית שממנה נוצר השרת (מערכת הפעלה, תוכנות מותקנות מראש).
* **Instance Type:** סוג החומרה של השרת (לדוגמה `t3.micro` המספק מעבד וזיכרון בסיסיים).
* **Security Group:** חומת האש (Firewall) הווירטואלית ברמת ה-Instance. מגדיר אילו פורטים פתוחים.
* **Key Pair:** מפתחות SSH (Public/Private) להתחברות מאובטחת לשרת.

## פקודות CLI נפוצות
### בסיסיות:
```bash
# הרצת שרת חדש
aws ec2 run-instances --image-id ami-0abcdef1234567890 --count 1 --instance-type t2.micro --key-name MyKeyPair --security-group-ids sg-903004f8

# כיבוי שרת
aws ec2 stop-instances --instance-ids i-1234567890abcdef0
```

### מתקדמות:
```bash
# סינון שרתים שפועלים כרגע
aws ec2 describe-instances --filters "Name=instance-state-name,Values=running" --query "Reservations[].Instances[].InstanceId"

# שינוי גודל של שרת (חובה לכבות קודם)
aws ec2 modify-instance-attribute --instance-id i-1234567890abcdef0 --instance-type "{"Value": "m5.large"}"
```

## טיפים וטריקים
* **Spot Instances:** אם יש לכם משימות שיכולות להפסיק באמצע (כמו עיבוד נתונים), השתמשו ב-Spot Instances כדי לחסוך עד 90% בעלויות!
* **Termination Protection:** הפעילו הגנה מפני מחיקה בטעות עבור שרתי Production.

## שאלות ראיון עבודה נפוצות
1. **שאלה:** מה קורה לנתונים על ה-Instance Store כשהשרת נכבה?
   **תשובה:** הנתונים ב-Instance Store נמחקים לחלוטין. זהו אחסון זמני (Ephemeral). לאחסון קבוע יש להשתמש ב-EBS.
2. **שאלה:** איך ניתן להתחבר לשרת ללא מפתח SSH?
   **תשובה:** באמצעות AWS Systems Manager Session Manager (SSM). זה בטוח יותר ואינו דורש פתיחת פורט 22 ב-Security Group.

## קישורים שימושיים
* [AWS EC2 Documentation](https://docs.aws.amazon.com/ec2/)
* [YouTube: AWS EC2 Tutorial](https://www.youtube.com/results?search_query=AWS+EC2+Tutorial+for+beginners)
