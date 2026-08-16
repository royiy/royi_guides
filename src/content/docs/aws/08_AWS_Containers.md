---
title: "מדריך 8: קונטיינרים ב-AWS (ECS, EKS)"
description: "הרצה וניהול של Docker Containers בענן"
---

# מדריך 8: קונטיינרים ב-AWS (ECS, EKS, Fargate)

## מבוא
קונטיינרים (כמו Docker) אורזים אפליקציה ואת כל התלויות שלה יחד. AWS מספקת מספר שירותים חזקים לניהול קונטיינרים (Orchestration) בענן.

## מושגי מפתח
* **ECR (Elastic Container Registry):** שירות לאחסון ולניהול תמונות דוקר (Docker Images) בצורה מאובטחת, המקביל ל-Docker Hub.
* **ECS (Elastic Container Service):** שירות ניהול קונטיינרים ייעודי של AWS. נוח, קל להגדרה, ומשתלב מעולה עם שירותי AWS אחרים.
* **EKS (Elastic Kubernetes Service):** שירות קוברנטיס מנוהל ב-AWS. מתאים למי שרוצה להשתמש בסטנדרט התעשייה (K8s) וצריך מערכת מורכבת וגמישה.
* **AWS Fargate:** מנוע הרצה מסוג Serverless לקונטיינרים. מאפשר להריץ קונטיינרים ב-ECS או EKS מבלי לנהל את שרתי ה-EC2 שמתחת.

## פקודות CLI נפוצות
### בסיסיות (ECR):
```bash
# התחברות ל-ECR כדי לדחוף תמונות
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789012.dkr.ecr.us-east-1.amazonaws.com

# יצירת Repository חדש
aws ecr create-repository --repository-name my-app
```

### מתקדמות (EKS):
```bash
# עדכון הגדרות kubectl כדי להתחבר לקלאסטר ה-EKS
aws eks update-kubeconfig --region us-east-1 --name my-eks-cluster

# בדיקת צמתים (Nodes) בקלאסטר
kubectl get nodes
```

## טיפים וטריקים
* **ECS vs EKS:** אם האפליקציה פשוטה ואתם רוצים פתרון מהיר בתוך האקוסיסטם של AWS, בחרו ב-ECS. אם יש לכם צוות DevOps חזק ואתם צריכים תאימות למערכות אחרות (Multi-Cloud), בחרו ב-EKS.
* השתמשו ב-AWS Fargate כדי להימנע מניהול שרתים, עדכוני מערכת הפעלה וניהול Capacity.

## שאלות ראיון עבודה נפוצות
1. **שאלה:** מה ההבדל בין ECS עם מודל פריסה של EC2 לבין מודל Fargate?
   **תשובה:** ב-ECS עם EC2, אתם מנהלים את השרתים הפיזיים (Instances), צריכים לדאוג ל-Scaling שלהם ולעדכוני אבטחה. ב-Fargate, אמזון מנהלת את התשתית ואתם משלמים רק על ה-vCPU והזיכרון שהקונטיינר שלכם צורך.
2. **שאלה:** איך EKS מתממשק עם IAM ב-AWS?
   **תשובה:** דרך שירות שנקרא IRSA (IAM Roles for Service Accounts). הוא מאפשר לקשר Kubernetes Service Account ל-IAM Role ספציפי וכך להעניק הרשאות (כמו גישה ל-S3) לקונטיינר (Pod) בודד.

## קישורים שימושיים
* [AWS EKS Documentation](https://docs.aws.amazon.com/eks/)
* [YouTube: ECS vs EKS vs Fargate](https://www.youtube.com/results?search_query=ECS+vs+EKS+vs+Fargate)
