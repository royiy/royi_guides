---
title: "מדריך 5: שירותי אחסון (S3, EBS, EFS)"
description: "הבדלים בין סוגי האחסון השונים בענן ואיך לעבוד איתם"
---

## מבוא
AWS מציעה מגוון שירותי אחסון, כל אחד מתאים למקרה שימוש (Use Case) שונה. S3 עבור Object Storage, EBS עבור Block Storage (כוננים לשרתים), ו-EFS עבור File Storage משותף.

## מושגי מפתח
* **Amazon S3:** אחסון אובייקטים אינסופי, זול, מאובטח ובעל זמינות של 99.999999999%. מצוין לתמונות, גיבויים וקבצי אתרים.
* **S3 Storage Classes:** מחלקות אחסון כמו Standard, Intelligent-Tiering, Glacier (לארכיון קר וזול).
* **EBS (Elastic Block Store):** כונן קשיח וירטואלי המחובר ל-EC2 Instance יחיד.
* **EFS (Elastic File System):** מערכת קבצים מנוהלת בסגנון NFS שיכולה להתחבר למספר שרתי EC2 במקביל.

## פקודות CLI נפוצות (במיוחד ל-S3)
### בסיסיות:
```bash
# יצירת Bucket (דלי) חדש
aws s3 mb s3://my-awesome-hebrew-bucket

# העלאת קובץ ל-S3
aws s3 cp my-file.txt s3://my-awesome-hebrew-bucket/
```

### מתקדמות:
```bash
# סנכרון תיקייה שלמה לענן (מצוין לגיבויים או העלאת אתר סטטי)
aws s3 sync ./my-local-folder s3://my-awesome-hebrew-bucket/ --delete

# יצירת URL זמני (Presigned URL) להורדת קובץ ללא הרשאות (תקף ל-3600 שניות)
aws s3 presign s3://my-awesome-hebrew-bucket/my-file.txt --expires-in 3600
```

## טיפים וטריקים
* **S3 Versioning:** תמיד תדליקו Versioning ב-Buckets שלכם כדי למנוע מחיקה בשוגג או דריסה של קבצים (Ransomware protection).
* **Lifecycle Policies:** הגדירו חוקים אוטומטיים שמעבירים קבצים ישנים ל-S3 Glacier כדי לחסוך בעלויות אחסון בצורה דרסטית.

## שאלות ראיון עבודה נפוצות
1. **שאלה:** מה ההבדל העיקרי בין EBS ל-EFS?
   **תשובה:** EBS יכול להיות מחובר לשרת (EC2) אחד בלבד באותו זמן (למעט מקרים ספציפיים ב-io2), ונמצא ב-AZ ספציפי. EFS מאפשר חיבור של אלפי שרתים בו זמנית מכל ה-AZs באותו Region, ומתנהג כמו תיקיית רשת.
2. **שאלה:** איך ניתן להבטיח שקבצים ב-S3 לא יימחקו לעולם לתקופה מסוימת (למשל מסיבות רגולציה)?
   **תשובה:** באמצעות S3 Object Lock המאפשר כתיבה חד-פעמית וקריאה מרובה (WORM).

## קישורים שימושיים
* [Amazon S3 Documentation](https://docs.aws.amazon.com/s3/)
* [YouTube: S3 vs EBS vs EFS](https://www.youtube.com/results?search_query=S3+vs+EBS+vs+EFS)
