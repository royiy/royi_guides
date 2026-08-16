---
title: "מדריך 7: מחשוב ללא שרת (Serverless)"
description: "פיתוח אפליקציות באמצעות AWS Lambda ו-API Gateway"
---

# מדריך 7: מחשוב ללא שרת (Serverless - Lambda, API Gateway)

## מבוא
ארכיטקטורת Serverless מאפשרת לכם להריץ קוד ולנהל אפליקציות מבלי לנהל שרתים כלל. אתם משלמים רק על זמן הריצה בפועל, עד רמת המילי-שנייה.

## מושגי מפתח
* **AWS Lambda:** שירות המריץ קוד (Python, Node.js, Java ועוד) בתגובה לאירועים (Triggers) כמו העלאת קובץ ל-S3, קריאה ב-API, או תזמון (Cron).
* **API Gateway:** שירות ליצירה, פרסום וניהול של APIs (REST, HTTP, WebSocket) שניתן לחבר ישירות ל-Lambda.
* **Cold Start:** העיכוב שנוצר כאשר פונקציית למבדה מופעלת בפעם הראשונה (או לאחר זמן רב שלא הופעלה) כי AWS צריכה להקצות קונטיינר חדש מאחורי הקלעים.

## פקודות CLI נפוצות (שימוש ב-SAM CLI מומלץ)
### בסיסיות:
```bash
# הפעלת פונקציית למבדה ישירות מה-CLI
aws lambda invoke --function-name MyHelloWorldFunction --payload '{"key": "value"}' response.json
cat response.json
```

### מתקדמות (AWS SAM - Serverless Application Model):
```bash
# אתחול פרויקט סרברלס חדש
sam init

# בניית הפרויקט
sam build

# פריסה (Deployment) ל-AWS
sam deploy --guided
```

## טיפים וטריקים
* **התמודדות עם Cold Starts:** אם האפליקציה שלכם רגישה לזמני תגובה, השתמשו ב-Provisioned Concurrency ששומר את הפונקציות "חמות" ומוכנות לפעולה.
* שמרו את פונקציות הלמבדה שלכם קטנות ככל האפשר, ויבאו רק את הספריות הספציפיות שאתם צריכים כדי לשפר את זמן העלייה של הפונקציה.

## שאלות ראיון עבודה נפוצות
1. **שאלה:** מה מגבלת זמן הריצה המקסימלית של פונקציית AWS Lambda?
   **תשובה:** 15 דקות. אם משימה לוקחת יותר מזה, יש להשתמש ב-ECS או AWS Step Functions.
2. **שאלה:** איך ניתן לשמור State (מידע מתמשך) בין ריצות של למבדה?
   **תשובה:** למבדה היא Stateless לחלוטין. יש לשמור מידע במסד נתונים חיצוני כמו DynamoDB, או ב-S3, או ב-ElastiCache.

## קישורים שימושיים
* [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)
* [YouTube: AWS Serverless Tutorial](https://www.youtube.com/results?search_query=AWS+Serverless+API+Gateway+Lambda)
