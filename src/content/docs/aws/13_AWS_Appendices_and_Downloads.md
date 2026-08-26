---
title: "נספחים והורדת המדריך המלא"
description: "הורדת מדריך AWS SAA-C03 המלא כקובץ PDF, יחד עם נספחים: מילון מונחים, טבלאות שירותים, cheat sheet של AWS CLI, פורטים נפוצים ופרטי מבחן ההסמכה"
---

עמוד זה מרכז את החומרים הנלווים למדריכי ה-AWS: קובץ PDF להורדה עם כל המדריכים במסמך אחד, ולאחריו שמונה נספחים לעיון מהיר - מילון מונחים, טבלאות השוואה, פקודות CLI נפוצות, פורטים, מודל האחריות המשותפת ופרטי מבחן ההסמכה.

## הורדת המדריך המלא

<a class="download-card" href="/downloads/aws-saa-c03-full-guide.pdf" download>
  <span class="download-card-icon">📄</span>
  <span class="download-card-text">
    <strong class="download-card-title">מדריך AWS SAA-C03 המלא - PDF</strong>
    <span class="download-card-meta">כל מדריכי ה-AWS במסמך אחד · PDF · \u200E1.6 MB</span>
  </span>
  <span class="download-card-action">הורדה ⬇️</span>
</a>

הקובץ מיועד לקריאה במסך, להדפסה ולעיון offline לקראת המבחן. שימו לב שגרסת האתר היא זו שמתעדכנת - אם עברו מספר חודשים מאז ההורדה, כדאי להוריד שוב או לבדוק את העמודים באתר.

## מפת המדריכים

| # | מדריך | נושאים מרכזיים |
|---|---|---|
| 1 | [מבוא ל-AWS ותשתית גלובלית](/aws/01_aws_introduction_and_global_infrastructure/) | Regions, Availability Zones, Edge Locations |
| 2 | [ניהול זהויות והרשאות (IAM)](/aws/02_aws_iam_and_security/) | Users, Groups, Roles, Policies, MFA |
| 3 | [ניהול שרתים וחישוב (EC2)](/aws/03_aws_ec2_and_compute/) | Instance Types, AMI, EBS, Auto Scaling |
| 4 | [תקשורת ורשתות (VPC)](/aws/04_aws_networking_vpc/) | Subnets, Route Tables, IGW, NAT, SG/NACL |
| 5 | [שירותי אחסון (S3, EBS, EFS)](/aws/05_aws_storage_s3/) | Buckets, Storage Classes, Lifecycle, Versioning |
| 6 | [מסדי נתונים (RDS, DynamoDB)](/aws/06_aws_databases/) | RDS, Aurora, DynamoDB, ElastiCache |
| 7 | [מחשוב ללא שרת (Serverless)](/aws/07_aws_serverless_lambda/) | Lambda, API Gateway, Event-driven |
| 8 | [קונטיינרים ב-AWS (ECS, EKS)](/aws/08_aws_containers/) | ECS, EKS, Fargate, ECR |
| 9 | [תשתית כקוד (IaC)](/aws/09_aws_infrastructure_as_code/) | CloudFormation, CDK, Terraform |
| 10 | [ניטור, לוגים וניהול עלויות](/aws/10_aws_monitoring_and_management/) | CloudWatch, CloudTrail, Config, Cost |
| 11 | [שאלות חזרה](/aws/11_aws_review_questions/) | מבחן אמריקאי על כל החומר |
| 12 | [שאלות קשות ברמת הסמכה](/aws/12_aws_certification_questions/) | שאלות מטעות בסגנון SAA-C03 |
| — | [אתרי תרגול למבחן](/aws/aws-exam/) | כלים חיצוניים לתרגול שאלות |

## נספח א' - מילון מונחים

| מונח | פירוש | הסבר |
|---|---|---|
| **AZ** | Availability Zone | מרכז נתונים אחד או יותר בתוך Region, עם חשמל, רשת וקישוריות עצמאיים |
| **AMI** | Amazon Machine Image | תבנית (תמונת דיסק) שממנה מוקם EC2 Instance |
| **EBS** | Elastic Block Store | דיסק בלוק מתמשך (persistent) המחובר ל-Instance בודד באותו AZ |
| **EFS** | Elastic File System | מערכת קבצים משותפת (NFS) שמספר Instances יכולים למונטס במקביל |
| **ELB / ALB / NLB** | Elastic / Application / Network Load Balancer | מאזני עומסים: ALB בשכבה 7 (HTTP/S), NLB בשכבה 4 (TCP/UDP) |
| **ASG** | Auto Scaling Group | קבוצת Instances שמתרחבת ומצטמצמת אוטומטית לפי מטריקות |
| **IGW** | Internet Gateway | שער יציאה לאינטרנט עבור VPC (דו-כיווני, לתתי-רשת ציבוריות) |
| **NAT Gateway** | Network Address Translation | מאפשר לתתי-רשת פרטיות לצאת לאינטרנט בלי להיות נגישות מבחוץ |
| **SG** | Security Group | חומת אש ברמת ה-Instance, stateful, כללי Allow בלבד |
| **NACL** | Network Access Control List | חומת אש ברמת ה-Subnet, stateless, תומכת ב-Allow וב-Deny |
| **VPC Endpoint** | — | חיבור פרטי משירותי AWS ל-VPC בלי לעבור באינטרנט |
| **IaC** | Infrastructure as Code | ניהול תשתית בקוד גרסאי (CloudFormation, CDK, Terraform) |
| **STS** | Security Token Service | הנפקת credentials זמניים, בסיס למנגנון Assume Role |
| **KMS** | Key Management Service | ניהול מפתחות הצפנה מנוהלים להצפנת נתונים בשירותי AWS |
| **RTO / RPO** | Recovery Time / Point Objective | זמן ההתאוששות המקסימלי / כמות הנתונים המקסימלית שניתן לאבד |
| **TCO** | Total Cost of Ownership | עלות הבעלות הכוללת, כולל תשתית, תחזוקה וכוח אדם |

## נספח ב' - שירותי AWS מרכזיים לפי קטגוריה

| קטגוריה | שירותים | למה משמש |
|---|---|---|
| **חישוב** | EC2, Lambda, Fargate, Batch, Lightsail | הרצת קוד ומכונות - ממכונה וירטואלית מלאה ועד פונקציה חסרת שרת |
| **אחסון** | S3, EBS, EFS, FSx, Storage Gateway, Glacier | אחסון אובייקטים, בלוקים, קבצים וארכיון קר |
| **מסדי נתונים** | RDS, Aurora, DynamoDB, ElastiCache, Redshift, DocumentDB | רלציוני, NoSQL, מטמון בזיכרון ו-Data Warehouse |
| **רשתות** | VPC, Route 53, CloudFront, API Gateway, Direct Connect, Transit Gateway | רשת פרטית, DNS, CDN, וקישוריות היברידית |
| **קונטיינרים** | ECS, EKS, ECR, App Runner | תזמור קונטיינרים ורג'יסטרי תמונות |
| **אבטחה וזהות** | IAM, Organizations, KMS, Secrets Manager, WAF, Shield, GuardDuty | הרשאות, הצפנה, סודות, והגנה מפני התקפות |
| **ניטור וניהול** | CloudWatch, CloudTrail, Config, Systems Manager, Trusted Advisor | מטריקות, לוגים, audit trail, ותאימות |
| **תשתית כקוד** | CloudFormation, CDK, Service Catalog | הקמת סביבות מקוד באופן חוזר ואוטומטי |
| **אינטגרציה** | SQS, SNS, EventBridge, Step Functions, Kinesis | תורים, התראות, אירועים, וזרימות עבודה |
| **עלויות** | Cost Explorer, Budgets, Cost and Usage Report, Compute Optimizer | מעקב, תחזית ואופטימיזציה של הוצאות |

## נספח ג' - Cheat Sheet של AWS CLI

### זהות והגדרות

```bash
# הגדרת פרופיל ומפתחות גישה
aws configure

# בדיקה מי אני בפועל (Account ID, ARN של המשתמש/Role)
aws sts get-caller-identity

# עבודה מול פרופיל ואזור ספציפיים
aws s3 ls --profile production --region eu-west-1
```

### EC2

```bash
# רשימת Instances עם שם, מזהה ומצב בטבלה קריאה
aws ec2 describe-instances \
  --query "Reservations[].Instances[].{ID:InstanceId,State:State.Name,Type:InstanceType}" \
  --output table

# הפעלה, עצירה וכיבוי מוחלט
aws ec2 start-instances  --instance-ids i-1234567890abcdef0
aws ec2 stop-instances   --instance-ids i-1234567890abcdef0
aws ec2 terminate-instances --instance-ids i-1234567890abcdef0

# רשימת Security Groups ב-VPC מסוים
aws ec2 describe-security-groups --filters "Name=vpc-id,Values=vpc-abc12345"
```

### S3

```bash
# רשימת buckets ורשימת אובייקטים עם גדלים
aws s3 ls
aws s3 ls s3://my-bucket/logs/ --human-readable --summarize

# העלאה, הורדה וסינכרון תיקייה שלמה
aws s3 cp ./report.pdf s3://my-bucket/docs/
aws s3 sync ./site s3://my-bucket --delete

# הפעלת Versioning על bucket
aws s3api put-bucket-versioning --bucket my-bucket \
  --versioning-configuration Status=Enabled
```

### IAM

```bash
# מי המשתמשים והתפקידים בחשבון
aws iam list-users --query "Users[].UserName"
aws iam list-roles --query "Roles[].RoleName"

# אילו policies מחוברות למשתמש
aws iam list-attached-user-policies --user-name developer

# קבלת credentials זמניים דרך Assume Role
aws sts assume-role \
  --role-arn arn:aws:iam::123456789012:role/DeployRole \
  --role-session-name deploy-session
```

### Lambda, CloudWatch ועלויות

```bash
# רשימת פונקציות והרצה ידנית
aws lambda list-functions --query "Functions[].FunctionName"
aws lambda invoke --function-name my-func --payload '{"key":"value"}' out.json

# מעקב אחרי לוגים בזמן אמת
aws logs tail /aws/lambda/my-func --follow

# עלות בפילוח לפי שירות לחודש מסוים
aws ce get-cost-and-usage \
  --time-period Start=2026-08-01,End=2026-09-01 \
  --granularity MONTHLY --metrics "UnblendedCost" \
  --group-by Type=DIMENSION,Key=SERVICE
```

## נספח ד' - פורטים נפוצים ב-Security Groups

| פורט | פרוטוקול | שירות | הערות |
|---|---|---|---|
| 22 | TCP | SSH | גישה ל-Linux. עדיף להגביל ל-IP ארגוני או להשתמש ב-Session Manager |
| 3389 | TCP | RDP | גישה ל-Windows. אין לפתוח ל-`0.0.0.0/0` |
| 80 | TCP | HTTP | תעבורת web לא מוצפנת, בדרך כלל מנותבת ל-443 |
| 443 | TCP | HTTPS | תעבורת web מוצפנת - הפורט היחיד שראוי לפתוח לעולם |
| 3306 | TCP | MySQL / Aurora MySQL | לפתוח רק ל-SG של שרתי האפליקציה, לא לאינטרנט |
| 5432 | TCP | PostgreSQL | כנ"ל |
| 1433 | TCP | SQL Server | כנ"ל |
| 6379 | TCP | Redis (ElastiCache) | פנימי בלבד, בתוך ה-VPC |
| 2049 | TCP | NFS (EFS) | נדרש בין ה-Instances ל-Mount Targets |
| 53 | TCP/UDP | DNS | Route 53 Resolver, בעיקר בסביבות היברידיות |
| 123 | UDP | NTP | סינכרון שעון |

## נספח ה' - השוואת מחלקות אחסון S3

| מחלקה | זמינות (AZs) | זמן שליפה | מתאים ל | הערות עלות |
|---|---|---|---|---|
| **S3 Standard** | ≥3 | מיידי (ms) | נתונים חמים בשימוש תכוף | עלות אחסון גבוהה, ללא עלות שליפה |
| **S3 Intelligent-Tiering** | ≥3 | מיידי (ms) | תבנית גישה לא צפויה | מעביר שכבות אוטומטית, עמלת ניטור לאובייקט |
| **S3 Standard-IA** | ≥3 | מיידי (ms) | גישה נדירה אך דחופה | אחסון זול, יש עלות שליפה, מינימום 30 יום |
| **S3 One Zone-IA** | 1 | מיידי (ms) | נתונים ניתנים לשחזור | ~20% זול מ-Standard-IA, אבוד אם ה-AZ נופל |
| **S3 Glacier Instant Retrieval** | ≥3 | מיידי (ms) | ארכיון עם גישה מדי פעם | מינימום 90 יום |
| **S3 Glacier Flexible Retrieval** | ≥3 | דקות עד שעות | גיבויים וארכיון | מינימום 90 יום |
| **S3 Glacier Deep Archive** | ≥3 | 12 שעות ומעלה | שמירה רגולטורית לשנים | הזול ביותר, מינימום 180 יום |

## נספח ו' - מודל האחריות המשותפת

| האחריות של AWS ("אבטחת הענן") | האחריות שלכם ("אבטחה בענן") |
|---|---|
| אבטחה פיזית של מרכזי הנתונים | הגדרת IAM, מפתחות והרשאות |
| חומרה, רשת גלובלית ותשתית הווירטואליזציה | הצפנת נתונים ב-rest וב-transit ובחירת מפתחות |
| Managed Services: תיקוני אבטחה למנוע (למשל RDS, Lambda) | קונפיגורציית Security Groups, NACLs ו-VPC |
| זמינות התשתית והעמידה ב-SLA | עדכוני מערכת הפעלה ואפליקציה ב-EC2 |
| הפרדה לוגית בין לקוחות | סיווג הנתונים, גיבויים ותוכנית התאוששות |

הכלל המנחה: **AWS מאבטח את התשתית, אתם מאבטחים את מה שאתם מריצים ומגדירים עליה**. במעבר מ-EC2 ל-Managed Service ומשם ל-Serverless, חלק גדל מהאחריות התפעולית עובר ל-AWS - אבל האחריות על ההרשאות והנתונים תמיד נשארת אצלכם.

## נספח ז' - פרטי מבחן SAA-C03

| פרמטר | ערך |
|---|---|
| שם ההסמכה | AWS Certified Solutions Architect – Associate |
| קוד המבחן | SAA-C03 |
| מספר שאלות | 65 (מתוכן 15 שאלות שאינן מנוקדות) |
| משך המבחן | 130 דקות |
| ציון עובר | 720 מתוך 1000 |
| סוגי שאלות | Multiple Choice (תשובה אחת) ו-Multiple Response (יותר מאחת) |
| מיקום | מרכז בחינות (Pearson VUE) או מבחן מפוקח מהבית |
| תוקף | 3 שנים |
| שפה | אנגלית וכן שפות נוספות (עברית אינה זמינה) |

חלוקת התחומים במבחן:

| תחום | נושא | משקל |
|---|---|---|
| 1 | Design Secure Architectures | 30% |
| 2 | Design Resilient Architectures | 26% |
| 3 | Design High-Performing Architectures | 24% |
| 4 | Design Cost-Optimized Architectures | 20% |

:::note
פרטי המבחן, המשקלים והמחיר משתנים מעת לעת. לפני הרשמה כדאי לאמת מול ה-Exam Guide הרשמי המקושר בנספח ח'.
:::

## נספח ח' - קישורים ומקורות רשמיים

### מסמכי הסמכה

* [AWS Certified Solutions Architect – Associate - עמוד ההסמכה](https://aws.amazon.com/certification/certified-solutions-architect-associate/)
* [Exam Guide רשמי (PDF)](https://d1.awsstatic.com/training-and-certification/docs-sa-assoc/AWS-Certified-Solutions-Architect-Associate_Exam-Guide.pdf)
* [שאלות דוגמה רשמיות](https://d1.awsstatic.com/training-and-certification/docs-sa-assoc/AWS-Certified-Solutions-Architect-Associate_Sample-Questions.pdf)
* [AWS Skill Builder - קורסים ומבחני תרגול](https://skillbuilder.aws/)

### דוקומנטציה וארכיטקטורה

* [AWS Documentation - כל השירותים](https://docs.aws.amazon.com/)
* [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
* [AWS Architecture Center - ארכיטקטורות ייחוס](https://aws.amazon.com/architecture/)
* [AWS Service Health Dashboard](https://health.aws.amazon.com/health/status)

### כלים מעשיים

* [AWS Pricing Calculator - חישוב עלויות](https://calculator.aws/)
* [IAM Policy Simulator - בדיקת הרשאות](https://policysim.aws.amazon.com/)
* [AWS CLI Command Reference](https://docs.aws.amazon.com/cli/latest/reference/)
* [AWS Free Tier - מה חינמי ולכמה זמן](https://aws.amazon.com/free/)
