---
title: "מדריך 9: תשתית כקוד (IaC)"
description: "אוטומציה וניהול משאבים דרך CloudFormation ו-CDK"
---

# מדריך 9: תשתית כקוד (IaC - CloudFormation & CDK)

## מבוא
במקום להקים שרתים ורשתות דרך ממשק המשתמש (ClickOps), Infrastructure as Code (IaC) מאפשר כתיבת קבצי תצורה שדרכם מייצרים, מעדכנים ומוחקים משאבים בצורה אוטומטית וניתנת לשחזור.

## מושגי מפתח
* **AWS CloudFormation:** השירות המובנה של AWS לכתיבת תשתית. משתמש בקבצי JSON או YAML.
* **Stack:** אוסף משאבים של CloudFormation שנוצרים ומנוהלים יחד כקבוצה אחת.
* **AWS CDK (Cloud Development Kit):** כלי מתקדם המאפשר להגדיר תשתית בענן באמצעות שפות תכנות אמיתיות (TypeScript, Python, Java) במקום YAML, אשר הופך מאחורי הקלעים ל-CloudFormation.
* **Terraform:** כלי צד-שלישי פופולרי מאוד של HashiCorp לניהול תשתית ב-AWS (ובעננים אחרים).

## פקודות CLI נפוצות
### CloudFormation:
```bash
# יצירת Stack חדש מקובץ YAML
aws cloudformation create-stack --stack-name my-network-stack --template-body file://vpc-template.yaml

# מחיקת Stack (מוחק את כל המשאבים שהוגדרו בו!)
aws cloudformation delete-stack --stack-name my-network-stack
```

### AWS CDK:
```bash
# פריסת התשתית של פרויקט CDK לענן
cdk deploy

# השוואת קוד ה-CDK המקומי למצב הקיים בענן (Dry Run)
cdk diff
```

## טיפים וטריקים
* **Change Sets:** לפני שאתם מעדכנים Stack ב-CloudFormation בסביבת יצור, תמיד צרו Change Set. זה מראה לכם בדיוק אילו משאבים עומדים להיווצר, להשתנות או להמחק.
* לעולם (אבל לעולם!) אל תשנו ידנית דרך ה-Console משאבים שנוצרו על ידי CloudFormation או Terraform. הדבר ייצור Drift ועלול לשבור את התשתית.

## שאלות ראיון עבודה נפוצות
1. **שאלה:** מהו CloudFormation Drift ואיך מתמודדים איתו?
   **תשובה:** Drift מתרחש כאשר משאב שנוהל על ידי CF שונה באופן ידני מחוץ ל-CF (למשל פתיחת פורט ב-Security Group מהקונסול). ניתן לגלות זאת על ידי הרצת Drift Detection דרך הקונסול, ויש לתקן את קוד ה-YAML כך שיתאים למצב החדש או להחזיר את המצב הידני לקדמותו.
2. **שאלה:** למה שחברה תבחר ב-Terraform על פני CloudFormation?
   **תשובה:** טרפורם עובד מעולה בסביבות Multi-Cloud (AWS + GCP/Azure). בנוסף, טרפורם מציע מנגנון State עוצמתי וסינטקס (HCL) שחלק מוצאים כקריא יותר מ-YAML ארוך של CF.

## קישורים שימושיים
* [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
* [YouTube: AWS CDK Tutorial](https://www.youtube.com/results?search_query=AWS+CDK+Crash+Course)
