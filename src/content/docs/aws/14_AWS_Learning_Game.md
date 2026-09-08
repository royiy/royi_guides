---
title: "משחק לימודי: אתגר AWS"
description: "משחק אינטראקטיבי ללימוד AWS - חמישה מצבי משחק עם טיימר, לבבות, ניקוד ורצפים: קרב מהיר, ניחוש התנהגות שירות, השלמת CLI/IAM, התאמת שירותים וסידור תהליך."
---

חמישה מצבי משחק שבודקים היבטים שונים של AWS - IAM, EC2, VPC, S3, מסדי נתונים, Lambda, קונטיינרים ו-CloudFormation - לא עוד חידון רב-ברירה, אלא משחק עם **טיימר**, **שלושה לבבות**, **מכפיל רצף** ו**שיא אישי** שנשמר בדפדפן. בסוף כל סבב תקבלו דירוג, ורשימת חזרה של בדיוק מה שפספסתם.


<div class="tg" id="tg" dir="rtl">
  <div class="tg-screen is-active" data-screen="menu">
    <div class="tg-hero">
      <div class="tg-hero-badge">AWS</div>
      <div class="tg-hero-title">אתגר AWS</div>
      <div class="tg-hero-sub">בחרו מצב משחק. יש לכם 3 לבבות - תשובה שגויה, טעות בהתאמה או נגמר הזמן עולים לב אחד.</div>
    </div>
    <div class="tg-modes" id="tg-modes"></div>
    <div class="tg-hero-foot">💡 טיפ: במצבי השאלות אפשר לענות עם המקשים <kbd>1</kbd>–<kbd>4</kbd> ולהתקדם עם <kbd>Enter</kbd>.</div>
  </div>
  <div class="tg-screen" data-screen="play">
    <div class="tg-hud">
      <button class="tg-quit" type="button" id="tg-quit">← יציאה</button>
      <div class="tg-mode-title" id="tg-mode-name"></div>
      <div class="tg-hud-stats">
        <span class="tg-lives" id="tg-lives"></span>
        <span class="tg-chip">ניקוד <b id="tg-score">0</b></span>
        <span class="tg-chip">רצף <b id="tg-streak">0</b></span>
      </div>
    </div>
    <div class="tg-progress"><i class="tg-progress-bar" id="tg-progress"></i></div>
    <div class="tg-timer-wrap" id="tg-timer-wrap"><i class="tg-timer-bar" id="tg-timer"></i></div>
    <div class="tg-stage" id="tg-stage"></div>
    <div class="tg-foot">
      <div class="tg-feedback" id="tg-feedback" aria-live="polite"></div>
      <button class="tg-btn tg-btn--primary tg-next" type="button" id="tg-next" hidden>הבא ←</button>
    </div>
  </div>
  <div class="tg-screen" data-screen="result">
    <div id="tg-result"></div>
    <div class="tg-result-actions">
      <button class="tg-btn tg-btn--primary" type="button" id="tg-again">שחק שוב</button>
      <button class="tg-btn" type="button" id="tg-menu">חזרה לתפריט</button>
    </div>
  </div>
</div>

<link rel="stylesheet" href="/styles/topic-game.css">

<script>
(function () {
  'use strict';

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /* ============================================================
     מצב 1 - קרב מהיר: שאלות ידע קצרות. o = אפשרויות, a = אינדקס נכון
     ============================================================ */
  var RAPID = [
    {
      q: 'מה ההבדל העיקרי בין IAM User ל-IAM Role?',
      o: ['ל-User יש credentials קבועים; Role מאומץ (assume) זמנית ומספק הרשאות זמניות בלי סיסמה/מפתח קבוע', 'אין הבדל, אלו שני שמות לאותו מושג', 'Role תמיד שייך למשתמש יחיד ולא ניתן לשיתוף', 'User יכול לשמש רק שירותי AWS, לא בני אדם'],
      a: 0,
      w: 'IAM User מתאים לזהות קבועה (אדם/אפליקציה) עם מפתחות גישה. IAM Role לא מחזיק credentials קבועים - הוא "מאומץ" (assumed) על ידי משתמש, שירות (כמו EC2) או חשבון אחר, ומקבל credentials זמניים דרך STS.'
    },
    {
      q: 'ממה מורכבת הצהרה (Statement) בסיסית ב-IAM Policy?',
      o: ['Effect, Action, Resource (ולעיתים Condition)', 'Name, Owner, Region', 'User, Password, Token', 'Bucket, Key, ACL'],
      a: 0,
      w: 'כל Statement ב-IAM Policy מגדיר Effect (Allow/Deny), Action (אילו פעולות API), Resource (על אילו משאבים) ולעיתים Condition (תנאים נוספים כמו IP או MFA).'
    },
    {
      q: 'מה קורה כשיש Explicit Deny אחד וגם Allow אחד עבור אותה פעולה באותו הקשר?',
      o: ['ה-Deny תמיד מנצח - זו ברירת המחדל הבטוחה של הערכת מדיניות ב-AWS', 'ה-Allow מנצח כי הוא ספציפי יותר', 'AWS דוחה את שתי המדיניות ומחזיר שגיאה', 'האחרונה שנוצרה כרונולוגית מנצחת'],
      a: 0,
      w: 'לוגיקת ההערכה של IAM: ברירת מחדל Implicit Deny, ואז נבדקים כל ה-Allow/Deny הרלוונטיים (מ-Identity, Resource ו-Permission Boundaries) - כל Explicit Deny אחד מספיק כדי לחסום, גם אם יש Allow במקום אחר.'
    },
    {
      q: 'מהו ההבדל בין On-Demand ל-Spot Instances?',
      o: ['On-Demand משלמים לפי שעה/שנייה בלי התחייבות; Spot מנצל קיבולת פנויה במחיר מוזל אך AWS יכולה לקחת אותו חזרה בהתראה קצרה', 'Spot יקר יותר אך מובטח לתמיד', 'On-Demand דורש התחייבות ל-3 שנים', 'אין הבדל תמחורי בין השניים'],
      a: 0,
      w: 'Spot Instances יכולים לחסוך עד 90% ממחיר On-Demand, אבל AWS רשאית להפסיק אותם (עם התראה של כ-2 דקות) כשהיא צריכה את הקיבולת בחזרה - מתאים לעומסים שניתן להפריע להם (batch, CI, worker nodes).'
    },
    {
      q: 'לאיזה סוג עומס מתאימות משפחות instance מסוג T (למשל t3.micro)?',
      o: ['עומסים burstable עם צריכת CPU נמוכה רוב הזמן ופרצי ביקוש מזדמנים', 'עומסי חישוב אינטנסיביים קבועים (HPC)', 'עומסי זיכרון ענקיים (in-memory databases)', 'אחסון בלבד ללא compute'],
      a: 0,
      w: 'משפחת T משתמשת במנגנון CPU Credits - מתאימה לשרתי אתרים קטנים, סביבות פיתוח או microservices עם עומס לא קבוע. לעומס קבוע וגבוה עדיף M (כללי) או C (חישובי).'
    },
    {
      q: 'מה ההבדל העיקרי בין Security Group ל-Network ACL?',
      o: ['Security Group הוא stateful (מתיר תשובה אוטומטית) ופועל ברמת instance; NACL הוא stateless ופועל ברמת subnet', 'הם זהים לחלוטין בתפקוד', 'NACL תומך רק בכללי Allow, Security Group רק ב-Deny', 'Security Group פועל ברמת VPC שלם'],
      a: 0,
      w: 'Security Group שומר "state" - אם התיר תעבורה יוצאת, התשובה הנכנסת מותרת אוטומטית. NACL הוא stateless (צריך כלל נפרד לכל כיוון), ומאפשר גם כללי Deny מפורשים, בניגוד ל-Security Group שתומך רק ב-Allow.'
    },
    {
      q: 'מה מבדיל Subnet ציבורי מ-Subnet פרטי ב-VPC?',
      o: ['ל-Subnet ציבורי יש route בטבלת הניתוב שמצביע ל-Internet Gateway; לפרטי אין', 'Subnet ציבורי חייב CIDR /24 בדיוק', 'Subnet פרטי לא יכול להכיל EC2 Instances', 'אין הבדל טכני, זה רק תיוג'],
      a: 0,
      w: 'ההגדרה בפועל היא ניתובית: אם ל-Route Table של ה-subnet יש route ל-Internet Gateway (0.0.0.0/0 -> igw-xxxx), הוא ציבורי. subnet פרטי בדרך כלל יוצא לאינטרנט (אם בכלל) דרך NAT Gateway שיושב ב-subnet ציבורי.'
    },
    {
      q: 'מה מטרתו של NAT Gateway?',
      o: ['לאפשר למשאבים ב-subnet פרטי גישה יוצאת לאינטרנט, בלי לאפשר תעבורה נכנסת יזומה מבחוץ', 'לחסום את כל התעבורה היוצאת מה-VPC', 'להחליף Security Groups', 'לשמש כ-load balancer בין AZ-ים'],
      a: 0,
      w: 'שרתים ב-subnet פרטי (למשל שרתי אפליקציה) לרוב צריכים לצאת החוצה (עדכוני חבילות, קריאות API) בלי להיות נגישים ישירות מהאינטרנט. NAT Gateway יושב ב-subnet ציבורי ומתווך את התעבורה היוצאת בלבד.'
    },
    {
      q: 'מהו ההבדל העיקרי בין S3 Standard ל-S3 Glacier?',
      o: ['Standard מיועד לגישה תכופה עם זמינות מיידית; Glacier זול משמעותית אך מיועד לארכיון עם זמן שחזור (retrieval) של דקות עד שעות', 'Glacier מהיר יותר לגישה שוטפת', 'אין הבדל במחיר, רק בשם', 'Standard מיועד רק לקבצים מתחת ל-1MB'],
      a: 0,
      w: 'מחלקות האחסון ב-S3 נבדלות בעיקר לפי תדירות גישה ועלות: Standard לגישה שוטפת, Intelligent-Tiering מזיז אובייקטים אוטומטית לפי דפוס גישה, ו-Glacier/Glacier Deep Archive לארכיון זול לטווח ארוך עם עיכוב בשחזור.'
    },
    {
      q: 'מה עושה S3 Versioning כשמופעל על bucket?',
      o: ['שומר גרסה חדשה לכל overwrite/delete של אובייקט, כך שאפשר לשחזר גרסאות קודמות', 'דוחס אוטומטית קבצים ישנים', 'מגביל את מספר האובייקטים בבאקט', 'מונע מחיקה לצמיתות בכל מקרה'],
      a: 0,
      w: 'כשמופעל Versioning, מחיקת אובייקט לא מוחקת אותו בפועל אלא מוסיפה "delete marker", וכל שינוי יוצר version-id חדש - מגן מפני מחיקה/דריסה בטעות, אך דורש ניהול lifecycle כדי לא להצטבר לעלות מיותרת.'
    },
    {
      q: 'מה ההבדל בין RDS Multi-AZ ל-Read Replica?',
      o: ['Multi-AZ הוא standby סינכרוני להתאוששות מכשל (לא לקריאה); Read Replica הוא עותק א-סינכרוני שמשמש להרחבת עומסי קריאה', 'הם אותו מנגנון בשם שונה', 'Read Replica תמיד באותו AZ כמו ה-primary', 'Multi-AZ משמש רק לגיבוי ידני'],
      a: 0,
      w: 'Multi-AZ שומר replica standby ב-AZ אחר עם replication סינכרוני, ו-AWS מבצעת failover אוטומטי אליו בעת כשל - אבל אי אפשר לקרוא ממנו ישירות. Read Replica (יכול להיות גם cross-region) מיועד להוריד עומס קריאה מה-primary, עם replication א-סינכרוני.'
    },
    {
      q: 'מתי עדיף DynamoDB על פני RDS?',
      o: ['כשצריך latency נמוך וקבוע בקנה מידה מסיבי, עם סכימה גמישה (NoSQL) ולא שאילתות רלציוניות מורכבות', 'כשצריך JOIN מורכבים בין טבלאות רבות', 'כשצריך תמיכה מלאה ב-SQL סטנדרטי', 'כשהאפליקציה דורשת טרנזקציות מרובות-טבלאות מורכבות בסגנון בנקאי מלא'],
      a: 0,
      w: 'DynamoDB הוא מסד נתונים NoSQL managed שמתאים לעומסים עם latency צפוי במיליוני בקשות בשנייה, לפי מפתח (key-value/document) - לא ל-JOIN-ים או שאילתות אנליטיות מורכבות שבהן RDS (או Redshift) עדיפים.'
    },
    {
      q: 'מהם שני סוגי המפתחות האפשריים בטבלת DynamoDB?',
      o: ['Partition Key בלבד, או Partition Key + Sort Key (מפתח מורכב)', 'Primary Key ו-Foreign Key כמו במסד רלציוני', 'Public Key ו-Private Key', 'Row Key ו-Column Key'],
      a: 0,
      w: 'מפתח פשוט מבוסס Partition Key בלבד (קובע לאן הנתונים מפוזרים פיזית). מפתח מורכב מוסיף Sort Key, שמאפשר לאחסן ולשלוף כמה פריטים תחת אותו Partition Key, ממוינים לפי ה-Sort Key.'
    },
    {
      q: 'מה מפעיל (trigger) הרצת Lambda function?',
      o: ['אירועים ממקורות שונים כמו API Gateway, S3, DynamoDB Streams, EventBridge ועוד - Lambda היא event-driven', 'רק לחיצת כפתור ידנית בקונסולה', 'רק תזמון קבוע כמו cron בלבד', 'רק קריאות SSH ישירות לשרת'],
      a: 0,
      w: 'Lambda פועלת במודל event-driven: ניתן לחבר אותה למגוון רחב של event sources - בקשת HTTP דרך API Gateway, קובץ חדש ב-S3, שינוי ב-DynamoDB, הודעת SQS/SNS, טיימר ב-EventBridge ועוד.'
    },
    {
      q: 'מהו "Cold Start" ב-Lambda?',
      o: ['השהיה נוספת כשמופע חדש של הפונקציה מאותחל לראשונה (או אחרי חוסר פעילות), לעומת קריאה חמה למופע קיים', 'תקלה שקורה רק כשהפונקציה נכשלת', 'הזמן שלוקח למחוק פונקציה', 'מצב שבו הפונקציה מוקפאת לצמיתות'],
      a: 0,
      w: 'כשאין מופע "חם" זמין, AWS צריכה להקצות סביבת ריצה חדשה, לטעון את הקוד ולאתחל אותו - זה מוסיף latency. Provisioned Concurrency היא אחת הדרכים להקטין את התופעה עבור עומסים רגישים לזמן תגובה.'
    },
    {
      q: 'מה ההבדל העיקרי בין ECS ל-EKS?',
      o: ['ECS הוא אורקסטרטור קונטיינרים פרופריטרי ופשוט של AWS; EKS הוא Kubernetes מנוהל, תואם לאקוסיסטם ה-K8s הסטנדרטי', 'EKS זול תמיד יותר מ-ECS', 'ECS תומך רק ב-Windows Containers', 'אין הבדל, EKS הוא רק שם שיווקי ל-ECS'],
      a: 0,
      w: 'ECS משתמש במושגים ייחודיים ל-AWS (Task Definition, Service, Cluster) והוא פשוט יותר להתחלה. EKS מריץ Kubernetes אמיתי - מתאים לצוותים שכבר מכירים K8s או צריכים ניידות (portability) בין עננים.'
    },
    {
      q: 'מה ההבדל בין launch type EC2 ל-Fargate ב-ECS/EKS?',
      o: ['ב-EC2 launch type אתם מנהלים את שרתי ה-worker בעצמכם; Fargate הוא serverless - AWS מריצה את הקונטיינרים בלי שתנהלו אינסטנסים', 'Fargate תומך רק בקונטיינר יחיד לכל אשכול', 'EC2 launch type זול תמיד יותר מ-Fargate', 'אין הבדל תפעולי בין השניים'],
      a: 0,
      w: 'עם launch type מסוג EC2 אתם אחראים על patching, scaling וניהול מארחי ה-worker. Fargate מסיר את השכבה הזו לגמרי - משלמים לפי vCPU/זיכרון שהקונטיינר צורך בפועל, בלי לגעת בתשתית מתחתיו.'
    },
    {
      q: 'מהו CloudFormation Stack?',
      o: ['אוסף משאבי AWS שמוגדרים בתבנית אחת (YAML/JSON) ומנוהלים יחד - יצירה, עדכון ומחיקה כיחידה', 'שם נרדף ל-VPC', 'קונטיינר Docker בודד', 'רשימת הרשאות IAM בלבד'],
      a: 0,
      w: 'Stack הוא היחידה הבסיסית בניהול CloudFormation - כל המשאבים שמוגדרים בתבנית נוצרים, מתעדכנים או נמחקים יחד. אם עדכון נכשל באמצע, CloudFormation מבצע rollback אוטומטי לפי ברירת מחדל.'
    },
    {
      q: 'מהו Auto Scaling Group (ASG)?',
      o: ['קבוצה שמנהלת אוטומטית מספר instances לפי ביקוש/מדיניות, כולל החלפת instances שנכשלו', 'שירות לניהול IAM Roles', 'סוג של Load Balancer', 'שירות לגיבוי מסדי נתונים בלבד'],
      a: 0,
      w: 'ASG שומר על מספר instances רצוי (בין min ל-max), מוסיף/מוריד instances לפי מדיניות scaling (למשל לפי ניצול CPU), ומחליף אוטומטית instances שנכשלו ב-health check - בסיס לגמישות (elasticity) וזמינות גבוהה.'
    }
  ];

  /* ============================================================
     מצב 2 - ניחוש קוד/פקודה: קטע policy JSON / CLI / Terraform + מה קורה
     ============================================================ */
  var STATUS_GUESS = [
    {
      code: '{\n  "Effect": "Allow",\n  "Action": "s3:GetObject",\n  "Resource": "arn:aws:s3:::my-bucket/*"\n}',
      q: 'מה בדיוק מתירה הצהרת IAM Policy זו?',
      o: ['קריאת אובייקטים (הורדה) מתוך my-bucket בלבד - לא כתיבה, מחיקה או ניהול הבאקט עצמו', 'גישה מלאה (הכל) לכל הבאקטים בחשבון', 'יצירת buckets חדשים בלבד', 'מחיקת האובייקטים בבאקט'],
      a: 0,
      w: '<code>s3:GetObject</code> מתיר קריאה בלבד של אובייקטים קיימים. ה-Resource מסתיים ב-<code>/*</code> כך שההרשאה חלה על האובייקטים בתוך הבאקט, לא על הבאקט עצמו (שהיה דורש <code>arn:aws:s3:::my-bucket</code> ללא הסיומת).'
    },
    {
      code: '{\n  "Statement": [\n    { "Effect": "Allow", "Action": "*", "Resource": "*" },\n    { "Effect": "Deny", "Action": "s3:DeleteBucket", "Resource": "*" }\n  ]\n}',
      q: 'למשתמש עם המדיניות הזו יש גם Allow "*" וגם Deny על s3:DeleteBucket. מה בפועל יקרה אם ינסה למחוק באקט?',
      o: ['הפעולה תיחסם - Explicit Deny תמיד גובר על Allow, גם אם ה-Allow רחב יותר', 'הפעולה תצליח כי ה-Allow הוגדר קודם', 'AWS תזרוק שגיאת קונפליקט מדיניות', 'המחיקה תצליח באופן חלקי בלבד'],
      a: 0,
      w: 'בהערכת IAM, Explicit Deny תמיד מנצח כל Allow מתחרה - בלי קשר לסדר ההצהרות או לרוחב ההרשאה. זה בדיוק הדפוס שמשתמשים בו כדי ליצור "חריגים" (guardrails) בתוך מדיניות רחבה.'
    },
    {
      code: '$ aws s3 sync ./dist s3://my-site-bucket --delete',
      q: 'מה עושה הפקודה הזו, ובפרט הדגל <code>--delete</code>?',
      o: ['מעלה/מעדכנת קבצים מ-dist לבאקט, ומוחקת מהבאקט קבצים שאינם קיימים יותר ב-dist המקומי', 'מוחקת את כל הבאקט ואת תוכנו', 'מורידה קבצים מהבאקט אל dist המקומי', 'רק בודקת הבדלים בלי לבצע שינוי כלשהו'],
      a: 0,
      w: '<code>aws s3 sync</code> משווה בין המקור ליעד ומעתיק רק הבדלים (יעיל יותר מ-<code>cp --recursive</code>). <code>--delete</code> מוסיף שלב נוסף - כל קובץ שקיים ביעד אך לא במקור נמחק, כדי לשמור סנכרון מלא (נפוץ ב-deploy לאתרים סטטיים).'
    },
    {
      code: '$ aws ec2 run-instances --image-id ami-0abcdef1234567890 \\\n  --instance-type t3.micro --count 3',
      q: 'כמה instances תפעיל הפקודה הזו, ומאיזה AMI?',
      o: ['3 מופעים חדשים, כולם מבוססים על אותו AMI שצוין', 'instance יחיד בלבד', '3 AMIs חדשים ייווצרו', 'הפקודה תיכשל כי --count לא נתמך'],
      a: 0,
      w: '<code>--count 3</code> מבקש מ-AWS להריץ שלושה instances זהים מאותה תמונת בסיס (AMI) ומאותו סוג instance - שימושי כשצריך להעלות כמה מופעים זהים בבת אחת.'
    },
    {
      code: 'inbound rule: TCP 22, source 0.0.0.0/0',
      q: 'כלל כניסה (inbound) זה ב-Security Group - מה המשמעות האבטחתית שלו?',
      o: ['מאפשר גישת SSH (פורט 22) מכל כתובת IP באינטרנט - סיכון אבטחה משמעותי אם לא נדרש בכוונה', 'חוסם לחלוטין גישת SSH', 'מאפשר גישה רק ממשתמשים מאומתים ב-IAM', 'משפיע רק על תעבורה יוצאת (outbound)'],
      a: 0,
      w: '<code>0.0.0.0/0</code> מייצג "כל כתובת IPv4" - פתיחת פורט 22 (SSH) לעולם כולו היא פרקטיקה מסוכנת. עדיף להגביל ל-IP/CIDR ספציפי, או לגשת דרך Bastion/Session Manager במקום לחשוף SSH ישירות.'
    },
    {
      code: 'resource "aws_instance" "web" {\n  ami           = "ami-0abcdef1234567890"\n  instance_type = "t3.micro"\n  count         = 2\n}',
      q: 'מה תיצור טרפורם כשתריצו apply על הבלוק הזה?',
      o: ['שני משאבי EC2 instance נפרדים, מאותו AMI וסוג instance', 'משאב instance יחיד עם 2 vCPU', 'שני AMIs חדשים', 'שגיאת syntax כי count לא תקין ב-resource'],
      a: 0,
      w: 'הפרמטר <code>count = 2</code> ב-Terraform יוצר שני מופעים של אותו resource block (<code>aws_instance.web[0]</code> ו-<code>aws_instance.web[1]</code>) - דרך נפוצה ליצור כמה משאבים זהים בלי לשכפל קוד.'
    },
    {
      code: 'resource "aws_s3_bucket_versioning" "b" {\n  bucket = aws_s3_bucket.data.id\n  versioning_configuration {\n    status = "Enabled"\n  }\n}',
      q: 'מה משיג הבלוק הזה ב-Terraform?',
      o: ['מפעיל Versioning על הבאקט data - כל שינוי/מחיקה של אובייקט ישמור גרסה קודמת', 'מוחק את כל הגרסאות הקיימות בבאקט', 'הופך את הבאקט לציבורי', 'מגדיר lifecycle rule למחיקת אובייקטים ישנים'],
      a: 0,
      w: 'זהו הבלוק הייעודי (בגרסאות עדכניות של ה-provider) להפעלת Versioning על באקט S3 קיים - הוא מפריד את הגדרת ה-versioning מהגדרת הבאקט עצמו, בהתאם לפירוק הישויות המודרני של ה-provider.'
    },
    {
      code: '$ aws iam attach-role-policy \\\n  --role-name ec2-s3-reader \\\n  --policy-arn arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess',
      q: 'מה עושה הפקודה הזו?',
      o: ['מצרפת (attach) מדיניות מנוהלת (Managed Policy) לקריאה בלבד מ-S3 אל ה-Role הקיים ec2-s3-reader', 'יוצרת Role חדש בשם ec2-s3-reader', 'מוחקת את ה-Role ec2-s3-reader', 'נותנת ל-Role גישת כתיבה מלאה ל-S3'],
      a: 0,
      w: '<code>attach-role-policy</code> מקשר Managed Policy קיים (כאן - policy מוכן מראש של AWS, <code>AmazonS3ReadOnlyAccess</code>) ל-Role שכבר קיים. יש להריץ קודם <code>create-role</code> כדי שה-Role יתקיים בכלל.'
    },
    {
      code: 'Resources:\n  MyBucket:\n    Type: AWS::S3::Bucket\n    Properties:\n      BucketName: my-app-logs',
      q: 'מה יקרה כשתפרסו (deploy) את תבנית ה-CloudFormation הזו?',
      o: ['ייווצר משאב S3 Bucket חדש בשם my-app-logs', 'ייווצר EC2 Instance עם דיסק בשם my-app-logs', 'התבנית תיכשל כי חסר VersionId', 'ייווצר IAM Role עם הרשאות לבאקט'],
      a: 0,
      w: '<code>Type: AWS::S3::Bucket</code> מגדיר משאב מסוג S3 Bucket. <code>Properties.BucketName</code> קובע שם קבוע - שימו לב ששם באקט חייב להיות ייחודי גלובלית בכל AWS, לא רק בחשבון שלכם.'
    },
    {
      code: 'Lambda config: Timeout = 3s\nFunction body: calls an external API that responds in ~5s',
      q: 'מה יקרה כשהפונקציה תרוץ עם ההגדרות האלה?',
      o: ['ה-invocation ייכשל עם שגיאת Timeout אחרי 3 שניות, לפני שהתשובה מה-API החיצוני מגיעה', 'AWS תאריך אוטומטית את ה-timeout ל-5 שניות', 'הפונקציה תרוץ לנצח עד שתעצרו אותה ידנית', 'הבקשה החיצונית תבוטל אך הפונקציה תסיים בהצלחה'],
      a: 0,
      w: 'Timeout ב-Lambda הוא גבול קשיח (עד 15 דקות מקסימום) - אם הריצה לא מסתיימת בזמן הזה, AWS עוצרת אותה בכוח ומחזירה שגיאה. ערך ברירת המחדל הוא 3 שניות בלבד, ולכן נפוץ לשכוח להגדיל אותו לקריאות API חיצוניות איטיות.'
    },
    {
      code: '$ aws dynamodb put-item \\\n  --table-name Users \\\n  --item \'{"UserId": {"S": "u1"}, "Name": {"S": "Dana"}}\'',
      q: 'מה עושה הפקודה הזו אם כבר קיים פריט עם UserId=u1?',
      o: ['הפריט הקיים יידרס (overwrite) לחלוטין בערכים החדשים', 'הפקודה תיכשל עם שגיאת כפילות', 'ייווצר פריט נוסף עם אותו מפתח', 'רק השדה Name יתעדכן, שאר השדות יישמרו'],
      a: 0,
      w: '<code>put-item</code> ב-DynamoDB הוא פעולת "כתוב את כל הפריט" - אם קיים כבר פריט עם אותו Partition Key הוא נדרס במלואו. כדי לעדכן שדה ספציפי בלי לדרוס את השאר צריך <code>update-item</code>.'
    },
    {
      code: 'VPC CIDR: 10.0.0.0/16\nSubnet CIDR: 10.0.1.0/24',
      q: 'בערך כמה כתובות IP פרטיות ניתן להקצות בתוך ה-subnet הזה בפועל?',
      o: ['כ-251 (256 פחות 5 כתובות שמורות ל-AWS)', 'בדיוק 256', '65,536 כמו ה-VPC כולו', 'רק 24 כתובות'],
      a: 0,
      w: 'טווח /24 מכיל 256 כתובות, אבל AWS שומרת תמיד 5 כתובות בכל subnet (רשת, VPC router, DNS, עתידי, broadcast) - כך שנשארות כ-251 כתובות שמישות בפועל להקצאה למשאבים.'
    },
    {
      code: '$ aws autoscaling put-scaling-policy \\\n  --auto-scaling-group-name web-asg \\\n  --policy-type TargetTrackingScaling \\\n  --target-tracking-configuration \'{"TargetValue":50.0,"PredefinedMetricSpecification":{"PredefinedMetricType":"ASGAverageCPUUtilization"}}\'',
      q: 'מה תעשה מדיניות ה-scaling הזו בפועל?',
      o: ['תוסיף/תוריד instances באופן דינמי כדי לשמור ניצול CPU ממוצע קרוב ל-50%', 'תגביל את ה-ASG למקסימום 50 instances', 'תפעיל scaling רק פעם ב-50 דקות', 'תמחק instances שהגיעו לגיל 50 ימים'],
      a: 0,
      w: 'TargetTrackingScaling עובד כמו תרמוסטט - הוא בוחר אוטומטית מתי ובכמה להוסיף/להוריד instances כדי לשמור את המדד שנבחר (כאן ניצול CPU ממוצע) קרוב ליעד שהוגדר, בלי שתצטרכו להגדיר ידנית סף עליון/תחתון.'
    }
  ];

  /* ============================================================
     מצב 3 - השלמת פקודה: פקודת CLI / policy / config עם חלק חסר
     ============================================================ */
  var CMD_COMPLETE = [
    {
      code: '$ aws s3 ___ s3://my-new-bucket',
      q: 'מה משלים את הפקודה כדי ליצור באקט S3 חדש?',
      o: ['<code>mb</code>', '<code>create</code>', '<code>new</code>', '<code>init</code>'],
      a: 0,
      w: '<code>aws s3 mb</code> (make bucket) יוצר באקט חדש. שימו לב ששם באקט חייב להיות ייחודי גלובלית בכל AWS - לא רק בחשבון שלכם.'
    },
    {
      code: '{\n  "Effect": "___",\n  "Action": "ec2:TerminateInstances",\n  "Resource": "*"\n}',
      q: 'מה משלים את ה-Statement כדי לחסום מפורשות מחיקת instances (גם אם יש Allow רחב במקום אחר)?',
      o: ['<code>Deny</code>', '<code>Allow</code>', '<code>Block</code>', '<code>Restrict</code>'],
      a: 0,
      w: 'ל-Effect יש רק שני ערכים אפשריים: <code>Allow</code> או <code>Deny</code>. Explicit Deny מנצח כל Allow מתחרה - זו הדרך הנכונה ליצור "חריג" בתוך הרשאה רחבה יותר.'
    },
    {
      code: '$ aws iam create-role \\\n  --role-name my-role \\\n  --___ file://trust-policy.json',
      q: 'מה משלים את הפקודה ליצירת Role חדש, כשקובץ trust-policy.json מגדיר מי רשאי לאמץ (assume) אותו?',
      o: ['<code>assume-role-policy-document</code>', '<code>permissions-policy</code>', '<code>trust-file</code>', '<code>policy-arn</code>'],
      a: 0,
      w: 'כל Role חייב Trust Policy (מסמך אמון) שמגדיר מי רשאי לאמץ אותו - שירות, חשבון אחר או משתמש. זה נפרד לגמרי מה-Permissions Policy שמגדיר מה מותר לעשות אחרי האימוץ, ומצורף בנפרד עם <code>attach-role-policy</code>.'
    },
    {
      code: '$ aws lambda ___ --function-name my-func --payload \'{"key":"value"}\' out.json',
      q: 'מה משלים את הפקודה כדי להריץ (לקרוא ל-) פונקציית Lambda באופן ידני מה-CLI?',
      o: ['<code>invoke</code>', '<code>run</code>', '<code>execute</code>', '<code>call</code>'],
      a: 0,
      w: '<code>aws lambda invoke</code> מריצה את הפונקציה עם ה-payload שצוין ושומרת את התשובה בקובץ הפלט (<code>out.json</code>) - שימושי לבדיקות ידניות בלי לחכות לאירוע אמיתי.'
    },
    {
      code: '$ aws dynamodb ___ \\\n  --table-name Users \\\n  --key \'{"UserId": {"S": "u1"}}\'',
      q: 'מה משלים את הפקודה כדי לשלוף פריט בודד לפי מפתח מדויק (לא חיפוש)?',
      o: ['<code>get-item</code>', '<code>query</code>', '<code>scan</code>', '<code>select</code>'],
      a: 0,
      w: '<code>get-item</code> שולף פריט בודד לפי מפתח מדויק - היעיל ביותר. <code>query</code> מיועד לחיפוש לפי Partition Key (וטווח Sort Key), ו-<code>scan</code> עובר על הטבלה כולה - יקר ואיטי יחסית.'
    },
    {
      code: '$ aws cloudformation ___ \\\n  --stack-name my-stack \\\n  --template-body file://template.yaml',
      q: 'מה משלים את הפקודה כדי ליצור Stack חדש מתבנית מקומית?',
      o: ['<code>create-stack</code>', '<code>deploy-stack</code>', '<code>new-stack</code>', '<code>run-stack</code>'],
      a: 0,
      w: '<code>create-stack</code> מתחיל יצירת Stack חדש. לעדכון Stack קיים משתמשים ב-<code>update-stack</code>, ול-workflow נוח יותר (שמזהה אוטומטית אם ליצור או לעדכן) יש את <code>aws cloudformation deploy</code>.'
    },
    {
      code: 'inbound rule: TCP 443, source ___',
      q: 'מה משלים את הכלל כדי לאפשר גישת HTTPS מכל כתובת באינטרנט (IPv4)?',
      o: ['<code>0.0.0.0/0</code>', '<code>127.0.0.1/32</code>', '<code>10.0.0.0/8</code>', '<code>localhost</code>'],
      a: 0,
      w: '<code>0.0.0.0/0</code> מייצג את כל טווח כתובות ה-IPv4 - הפתיחה הסטנדרטית לפורט 443 (HTTPS) עבור שרת אתר ציבורי. לגישה פנימית בלבד היו משתמשים ב-CIDR פרטי כמו <code>10.0.0.0/8</code>.'
    },
    {
      code: '$ aws s3 sync ./dist s3://my-site --___',
      q: 'מה משלים את הפקודה כדי למחוק ביעד קבצים שכבר לא קיימים במקור המקומי?',
      o: ['<code>delete</code>', '<code>force</code>', '<code>clean</code>', '<code>prune</code>'],
      a: 0,
      w: 'ללא <code>--delete</code>, <code>sync</code> רק מעלה/מעדכן קבצים אך אף פעם לא מוחק מהיעד - כך שקבצים ישנים שהוסרו מה-build המקומי יישארו בבאקט לנצח אלא אם מציינים את הדגל הזה.'
    },
    {
      code: '$ aws ec2 run-instances --image-id ami-0abc123 --___  t3.micro',
      q: 'מה משלים את הפקודה כדי לציין את סוג ה-instance שיופעל?',
      o: ['<code>instance-type</code>', '<code>size</code>', '<code>type</code>', '<code>flavor</code>'],
      a: 0,
      w: '<code>--instance-type</code> קובע את משפחת/גודל ה-instance (למשל <code>t3.micro</code>, <code>m5.large</code>) - קובע כמה vCPU, זיכרון וביצועי רשת יוקצו למופע.'
    },
    {
      code: '{\n  "Effect": "Allow",\n  "Action": "s3:GetObject",\n  "Resource": "arn:aws:s3:::my-bucket___"\n}',
      q: 'מה משלים את ה-ARN כדי שההרשאה תחול על כל האובייקטים בתוך my-bucket (ולא על הבאקט עצמו)?',
      o: ['<code>/*</code>', '<code>/**</code>', '<code>:*</code>', '<code>-objects</code>'],
      a: 0,
      w: 'ARN בצורת <code>arn:aws:s3:::bucket-name</code> (בלי סיומת) מתייחס לבאקט עצמו (למשל לפעולות כמו ListBucket). הוספת <code>/*</code> מרחיבה את ההרשאה לכל האובייקטים בתוכו - שני ה-ARN-ים נדרשים לרוב יחד עבור מדיניות S3 מלאה.'
    },
    {
      code: '$ aws ___',
      q: 'מה משלים את הפקודה כדי להגדיר אינטראקטיבית access key, secret key, region ברירת מחדל ו-output format עבור ה-CLI?',
      o: ['<code>configure</code>', '<code>setup</code>', '<code>init</code>', '<code>login</code>'],
      a: 0,
      w: '<code>aws configure</code> שואל ברצף ארבע שאלות (Access Key ID, Secret Access Key, Default region, Default output format) ושומר אותן ב-<code>~/.aws/credentials</code> וב-<code>~/.aws/config</code>.'
    },
    {
      code: '$ aws sts ___ \\\n  --role-arn arn:aws:iam::111122223333:role/cross-account \\\n  --role-session-name my-session',
      q: 'מה משלים את הפקודה כדי לקבל credentials זמניים לאימוץ Role בחשבון אחר?',
      o: ['<code>assume-role</code>', '<code>get-role</code>', '<code>switch-role</code>', '<code>impersonate</code>'],
      a: 0,
      w: '<code>aws sts assume-role</code> מחזיר AccessKeyId, SecretAccessKey ו-SessionToken זמניים (בדרך כלל תקפים לשעה) - הבסיס לגישה חוצת-חשבונות (cross-account) ולתפקידים שמאמצים בני אדם או שירותים אחרים.'
    },
    {
      code: 'resource "aws_s3_bucket" "data" {\n  ___ = "my-terraform-bucket"\n}',
      q: 'מה משלים את הבלוק ב-Terraform כדי לקבוע את שם הבאקט?',
      o: ['<code>bucket</code>', '<code>name</code>', '<code>bucket_name</code>', '<code>id</code>'],
      a: 0,
      w: 'בפרובידר aws_s3_bucket משתמשים בשדה <code>bucket</code> כדי לקבוע את שם הבאקט הייחודי גלובלית. שימו לב שזה שונה מ-resource types אחרים ב-Terraform שבהם משתמשים בשם <code>name</code> רגיל.'
    }
  ];

  /* ============================================================
     מצב 4 - התאמת מושגים: סבבים של זוגות שירות/מושג + תיאור
     ============================================================ */
  var MATCH_ROUNDS = [
    {
      title: 'זהות, חישוב וגמישות',
      pairs: [
        { l: '<code>IAM</code>', r: 'ניהול משתמשים, קבוצות, תפקידים והרשאות גישה למשאבי AWS' },
        { l: '<code>EC2</code>', r: 'שרתים וירטואליים (instances) עם שליטה מלאה על מערכת ההפעלה' },
        { l: '<code>Lambda</code>', r: 'הרצת קוד ללא ניהול שרתים, בתשלום לפי זמן ריצה בפועל (serverless)' },
        { l: 'Auto Scaling Group', r: 'שומר אוטומטית על מספר instances רצוי ומחליף כאלה שנכשלו' },
        { l: 'Elastic Beanstalk', r: 'פלטפורמת PaaS שמריצה, מנטרת וסקיילת אפליקציה מקוד שמעלים, בלי לנהל תשתית ידנית' }
      ]
    },
    {
      title: 'רשת (VPC)',
      pairs: [
        { l: '<code>VPC</code>', r: 'רשת וירטואלית פרטית ומבודדת בענן, שבתוכה מוגדרים כל שאר משאבי הרשת' },
        { l: 'Subnet ציבורי', r: 'תת-רשת עם route ישיר ל-Internet Gateway' },
        { l: 'Internet Gateway', r: 'הרכיב שמחבר VPC לאינטרנט ומאפשר תעבורה דו-כיוונית ציבורית' },
        { l: 'NAT Gateway', r: 'מאפשר יציאה לאינטרנט ממשאבים בסאבנט פרטי, בלי לחשוף אותם לתעבורה נכנסת' },
        { l: 'Security Group', r: 'חומת אש stateful ברמת instance - שולטת בתעבורה נכנסת/יוצאת' }
      ]
    },
    {
      title: 'אחסון ומסדי נתונים',
      pairs: [
        { l: '<code>S3</code>', r: 'אחסון אובייקטים (Object Storage) בקנה מידה כמעט אינסופי, נגיש דרך API/HTTP' },
        { l: '<code>EBS</code>', r: 'כונן בלוקים (Block Storage) וירטואלי המחובר ל-EC2 instance יחיד' },
        { l: '<code>EFS</code>', r: 'מערכת קבצים משותפת (NFS) שיכולה להתחבר למספר instances במקביל' },
        { l: '<code>RDS</code>', r: 'מסד נתונים רלציוני מנוהל (MySQL, PostgreSQL ועוד) עם גיבויים ו-patching אוטומטיים' },
        { l: '<code>DynamoDB</code>', r: 'מסד נתונים NoSQL מנוהל במלואו, לביצועים קבועים בקנה מידה מסיבי' }
      ]
    },
    {
      title: 'קונטיינרים, IaC וניטור',
      pairs: [
        { l: '<code>ECS</code>', r: 'שירות אורקסטרציית קונטיינרים פרופריטרי של AWS' },
        { l: '<code>EKS</code>', r: 'שירות Kubernetes מנוהל, תואם לאקוסיסטם K8s הסטנדרטי' },
        { l: '<code>Fargate</code>', r: 'הרצת קונטיינרים ללא ניהול שרתי worker בעצמכם (serverless compute)' },
        { l: 'CloudFormation', r: 'הגדרת ופריסת תשתית AWS כקוד (IaC) דרך תבניות YAML/JSON' },
        { l: 'CloudWatch', r: 'איסוף מטריקות, לוגים והתראות (alarms) על משאבי AWS' }
      ]
    }
  ];

  /* ============================================================
     מצב 5 - סידור תהליכים: סבבים של שלבים שצריך לסדר בסדר הנכון
     ============================================================ */
  var ORDER_ROUNDS = [
    {
      title: 'הקמת VPC מאפס עם גישה לאינטרנט',
      steps: [
        'יצירת VPC עם טווח CIDR (למשל 10.0.0.0/16)',
        'יצירת Subnet ציבורי ו-Subnet פרטי בתוך ה-VPC',
        'יצירת Internet Gateway וחיבורו ל-VPC',
        'הוספת route בטבלת הניתוב של הסאבנט הציבורי אל ה-Internet Gateway',
        'יצירת NAT Gateway בסאבנט הציבורי עבור יציאת הסאבנט הפרטי לאינטרנט',
        'הגדרת Security Groups למשאבים שיוקמו בתוך ה-VPC'
      ]
    },
    {
      title: 'פריסת Lambda function חדשה עם חשיפה דרך API',
      steps: [
        'כתיבת קוד הפונקציה והגדרת handler',
        'יצירת IAM Role עם Trust Policy שמאפשרת ל-Lambda לאמץ אותו',
        'צירוף Permissions Policy מינימלית (least privilege) ל-Role',
        'יצירת פונקציית Lambda והעלאת הקוד תוך שיוך ה-Role',
        'חיבור הפונקציה ל-API Gateway כ-trigger',
        'בדיקה ידנית עם aws lambda invoke לפני חשיפה לציבור'
      ]
    },
    {
      title: 'ארכיטקטורת זמינות גבוהה (High Availability) עם ALB ו-Auto Scaling',
      steps: [
        'פריסת instances/AMI זהים בלפחות שני Availability Zones שונים',
        'יצירת Target Group שמצביע על ה-instances',
        'יצירת Application Load Balancer (ALB) ציבורי שמפזר תעבורה ל-Target Group',
        'הגדרת Health Checks ב-ALB לזיהוי instances לא תקינים',
        'יצירת Auto Scaling Group שמנהל את מספר ה-instances לפי מדיניות scaling',
        'קישור ה-ASG ל-Target Group כדי שמופעים חדשים יצטרפו אוטומטית לאיזון העומסים'
      ]
    },
    {
      title: 'מתן גישה מ-EC2 ל-S3 בצורה מאובטחת (בלי מפתחות קבועים)',
      steps: [
        'יצירת IAM Policy עם ההרשאות המדויקות הנדרשות (למשל s3:GetObject על באקט ספציפי)',
        'יצירת IAM Role עם Trust Policy שמתירה לשירות EC2 לאמץ אותו',
        'צירוף ה-Policy אל ה-Role שנוצר',
        'יצירת Instance Profile ושיוך ה-Role אליו',
        'הצמדת ה-Instance Profile ל-EC2 instance (בזמן יצירה או launch מחדש)',
        'אימות שהאפליקציה על ה-instance מקבלת credentials זמניים אוטומטית דרך metadata service, בלי מפתחות קשיחים בקוד'
      ]
    }
  ];

  /* ============================================================
     הגדרת מצבי המשחק
     ============================================================ */
  var MODES = [
    { key: 'rapid', icon: '⚡', name: 'קרב מהיר', desc: 'שאלות ידע כלליות על AWS - כמה תספיקו לפני שהזמן נגמר?', type: 'quiz', data: RAPID, sample: 8, time: 20000 },
    { key: 'status', icon: '🔎', name: 'ניחוש קוד/פקודה', desc: 'קטע IAM policy, פקודת CLI או Terraform - מה בדיוק קורה בפועל?', type: 'quiz', data: STATUS_GUESS, sample: 8, time: 28000, showCode: true },
    { key: 'cmd', icon: '🧩', name: 'השלמת פקודה', desc: 'פקודת AWS CLI, policy או קטע Terraform עם חלק חסר - בחרו מה משלים אותה נכון', type: 'quiz', data: CMD_COMPLETE, sample: 8, time: 28000, showCode: true },
    { key: 'match', icon: '🔗', name: 'התאמת שירותים', desc: 'התאימו כל שירות/מושג AWS לתיאור הנכון שלו', type: 'match', data: MATCH_ROUNDS, sample: 2 },
    { key: 'order', icon: '📋', name: 'סידור תהליכים', desc: 'סדרו את שלבי הקמת התשתית לפי הסדר הנכון', type: 'order', data: ORDER_ROUNDS, sample: 2 }
  ];

  window.TG_CONFIG = { gameId: "aws", modes: MODES };
})();
</script>

<script src="/scripts/topic-game.js"></script>
