---
title: "משחק לימודי: אתגר GCP"
category: GCP
part: 13/10
description: "משחק אינטראקטיבי ללימוד GCP - חמישה מצבי משחק עם טיימר, לבבות, ניקוד ורצפים: קרב מהיר, ניחוש התנהגות שירות, השלמת gcloud/YAML, התאמת שירותים וסידור תהליך."
---

חמישה מצבי משחק שבודקים היבטים שונים של GCP - Projects/IAM, Compute Engine, VPC, Cloud Storage, GKE, Serverless ו-BigQuery - לא עוד חידון רב-ברירה, אלא משחק עם **טיימר**, **שלושה לבבות**, **מכפיל רצף** ו**שיא אישי** שנשמר בדפדפן. בסוף כל סבב תקבלו דירוג, ורשימת חזרה של בדיוק מה שפספסתם.


<div class="tg" id="tg" dir="rtl">
  <div class="tg-screen is-active" data-screen="menu">
    <div class="tg-hero">
      <div class="tg-hero-badge">GCP</div>
      <div class="tg-hero-title">אתגר GCP</div>
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
      q: 'מהו סדר ה-Resource Hierarchy הנכון ב-GCP, מהרמה הגבוהה ביותר לנמוכה?',
      o: ['Organization → Folder → Project → Resource', 'Project → Organization → Folder → Resource', 'Folder → Organization → Project → Resource', 'Resource → Project → Folder → Organization'],
      a: 0,
      w: 'ההיררכיה משמשת לניהול הרשאות ומדיניות בירושה: מדיניות שהוגדרה ב-Organization חלה אוטומטית על כל ה-Folders וה-Projects שמתחתיה.'
    },
    {
      q: 'מה תפקידו של IAM Role ב-GCP?',
      o: ['אוסף הרשאות (permissions) שמוענק ל-Identity על משאב מסוים', 'שם ה-Project הפעיל', 'סוג של Firewall Rule', 'תבנית ל-VM'],
      a: 0,
      w: 'IAM Binding מקשר בין Identity (משתמש/Service Account/Group) ל-Role על גבי Resource מסוים. Role הוא רק אוסף ה-permissions - ה-Binding הוא מה שבפועל מעניק אותם.'
    },
    {
      q: 'מה ההבדל בין Custom Role ל-Predefined Role ב-IAM?',
      o: ['Predefined מנוהל ומעודכן ע"י גוגל; Custom נבנה ידנית עם permissions בודדים לפי צורך', 'אין הבדל מעשי ביניהם', 'Custom Role זמין רק ל-Organization Admin', 'Predefined Role לא ניתן להקצאה ל-Service Account'],
      a: 0,
      w: 'Predefined Roles (כמו <code>roles/editor</code>) נוחים אך לעיתים רחבים מדי. Custom Roles מאפשרים עקרון Least Privilege מדויק, אך דורשים תחזוקה עצמאית כשמתווספים permissions חדשים.'
    },
    {
      q: 'מהו Service Account ב-GCP?',
      o: ['חשבון זהות מיוחד לתהליכים/אפליקציות (לא בני אדם) לביצוע קריאות API', 'חשבון ה-Billing הראשי של הארגון', 'משתמש אנושי עם הרשאות Admin', 'שם נרדף ל-Project ID'],
      a: 0,
      w: 'Service Accounts משמשים VMs, פונקציות ושירותים אחרים כדי לאמת מול GCP APIs בלי חשבון משתמש אנושי - עדיף Workload Identity על פני מפתחות JSON סטטיים.'
    },
    {
      q: 'איזו משפחת Machine Types ב-Compute Engine מותאמת ל-Workloads עתירי זיכרון?',
      o: ['<code>M</code> (Memory-optimized)', '<code>N</code> (General-purpose)', '<code>C</code> (Compute-optimized)', '<code>E2</code> (Cost-optimized)'],
      a: 0,
      w: 'משפחת <code>M</code> מיועדת למסדי נתונים בזיכרון וניתוחים כבדים (כמו SAP HANA). לעומתה, <code>C</code> מתאימה ל-CPU אינטנסיבי ו-<code>N</code> היא ברירת המחדל המאוזנת.'
    },
    {
      q: 'מהי Preemptible/Spot VM?',
      o: ['מכונה זולה משמעותית שגוגל עלולה לכבות בהתראה קצרה', 'מכונה עם SLA גבוה יותר מ-VM רגיל', 'VM שרץ רק בתוך VPC פרטי', 'מכונה שאי אפשר לחבר אליה דיסק חיצוני'],
      a: 0,
      w: 'Spot VMs מציעות עד 91% הנחה, אך גוגל יכולה לעצור אותן כמעט בכל רגע - מתאימות ל-Batch Jobs ועומסים שניתן להפריע להם ולחדש אותם.'
    },
    {
      q: 'מה תפקידו של Instance Template ב-Compute Engine?',
      o: ['תבנית שמגדירה תצורת VM (Machine Type, Image, Disk) לשכפול עקבי ב-Managed Instance Group', 'קובץ הרשאות IAM', 'רשומת DNS פנימית', 'סוג של Firewall Rule'],
      a: 0,
      w: 'Instance Template משמש כבסיס ל-Managed Instance Group (MIG), שמאפשר Autoscaling ו-Self-healing על בסיס תצורה עקבית וזהה בכל מופע.'
    },
    {
      q: 'מהי VPC ב-GCP, ובמה היא שונה מ-VPC ב-AWS?',
      o: ['רשת וירטואלית שברירת המחדל שלה היא Global - Subnets יכולים לפרוש על פני Regions שונים', 'רשת שמוגבלת תמיד ל-Zone בודד', 'שירות Firewall בלבד ולא רשת שלמה', 'רכיב שקיים רק בפרויקטי Shared VPC'],
      a: 0,
      w: 'בניגוד ל-AWS שבו VPC מוגבל ל-Region, ב-GCP VPC הוא משאב Global וה-Subnets בתוכו הם ברמת Region - כך אפשר לפרוש רשת אחת על פני העולם.'
    },
    {
      q: 'מה ההבדל בין Firewall Rule ל-Route ב-VPC?',
      o: ['Firewall Rule קובע מה מותר לעבור; Route קובע לאן התעבורה מנותבת', 'שניהם עושים בדיוק אותו דבר', 'Route קובע הרשאות ו-Firewall קובע ניתוב', 'Firewall Rule חל רק על תעבורה יוצאת'],
      a: 0,
      w: 'Firewall Rules ב-VPC פועלים ברמת ה-Instance (Stateful) ומחליטים allow/deny. Routes קובעים את הנתיב שהחבילה תעבור בו כדי להגיע ליעד.'
    },
    {
      q: 'מהו Cloud NAT ולמה הוא משמש?',
      o: ['מאפשר ל-VMs ללא IP חיצוני לגשת לאינטרנט, בלי לחשוף אותם עם כתובת ציבורית נכנסת', 'שירות לניהול DNS פנימי', 'מסד נתונים ל-Session State', 'Load Balancer ברמת L7'],
      a: 0,
      w: 'Cloud NAT מספק גישה יוצאת (Outbound) לאינטרנט למכונות פרטיות, תוך שמירה על כך שאין להן כתובת IP ציבורית שניתן לתקוף ישירות מבחוץ.'
    },
    {
      q: 'איזו מחלקת אחסון ב-Cloud Storage הכי זולה, אך עם עלות Retrieval גבוהה ומינימום שמירה ארוך?',
      o: ['<code>Archive</code>', '<code>Standard</code>', '<code>Nearline</code>', '<code>Coldline</code>'],
      a: 0,
      w: '<code>Archive</code> מיועדת לנתונים שכמעט לא ניגעים בהם (גיבויים ארוכי טווח) - הזולה ביותר לאחסון, אך עם עלות שליפה גבוהה ומינימום שמירה של 365 יום.'
    },
    {
      q: 'מה ההבדל בין <code>Nearline</code> ל-<code>Coldline</code> ב-Cloud Storage?',
      o: ['Nearline למינימום שמירה של 30 יום, Coldline למינימום 90 יום - עם עלות אחסון/שליפה שונה בהתאם', 'אין הבדל, זה כינוי כפול לאותה מחלקה', 'Coldline מיועד רק לקבצים קטנים מ-1MB', 'Nearline לא תומך ב-Versioning'],
      a: 0,
      w: 'שתי המחלקות מיועדות לגישה נדירה - Nearline לגישה של פעם בחודש בערך, Coldline לגישה נדירה עוד יותר (רבעונית) עם עלות אחסון נמוכה יותר אך שליפה יקרה יותר.'
    },
    {
      q: 'מה עושה Lifecycle Rule ב-Cloud Storage Bucket?',
      o: ['מעביר או מוחק אובייקטים אוטומטית לפי גיל/תנאים, למשל מ-Standard ל-Archive אחרי 90 יום', 'מגדיר הרשאות IAM על ה-Bucket', 'קובע את ה-Region של ה-Bucket', 'מפעיל גיבוי אוטומטי ל-BigQuery'],
      a: 0,
      w: 'Lifecycle Rules חוסכות עלויות בלי מעורבות ידנית - למשל מעבר אוטומטי ל-Coldline אחרי 90 יום, ומחיקה סופית אחרי שנה.'
    },
    {
      q: 'מהו GKE Autopilot לעומת GKE Standard?',
      o: ['ב-Autopilot גוגל מנהלת את ה-Nodes לחלוטין ומתמחרת לפי Pod; ב-Standard אתם מנהלים Node Pools', 'Autopilot תומך רק ב-Stateless Workloads', 'Standard זול תמיד יותר מ-Autopilot', 'Autopilot לא תומך ב-Namespaces'],
      a: 0,
      w: 'Autopilot מסיר את התפעול של ה-Nodes ומחייב לפי משאבים בפועל שהוקצו ל-Pod. Standard נותן שליטה מלאה (GPU מיוחד, DaemonSets) במחיר של יותר תפעול.'
    },
    {
      q: 'מהו Node Pool ב-GKE?',
      o: ['קבוצת Nodes עם אותה תצורה (Machine Type, Disk, Labels) בתוך Cluster', 'רשימת Namespaces פעילים', 'מאגר של Secrets משותפים', 'שם נרדף ל-Cluster עצמו'],
      a: 0,
      w: 'Node Pools מאפשרים להריץ Workloads שונים על חומרה שונה (למשל Pool עם GPU ו-Pool רגיל) באותו Cluster בו-זמנית.'
    },
    {
      q: 'מהו Workload Identity ב-GKE?',
      o: ['מנגנון שמקשר Kubernetes Service Account ל-GCP Service Account בלי מפתחות JSON סטטיים', 'תעודת TLS לתקשורת בין Pods', 'שירות לניהול DNS פנימי ב-Cluster', 'רכיב Networking ל-Load Balancing בין Pods'],
      a: 0,
      w: 'Workload Identity הוא הדרך המומלצת לאמת Pods מול GCP APIs - מחליף את הצורך להטמיע ולסובב מפתחות JSON סטטיים בתוך ה-Cluster.'
    },
    {
      q: 'מתי עדיף Cloud Run על פני Cloud Functions?',
      o: ['כשיש כבר קונטיינר שלם (כל שפה/תלות) ולא רק פונקציה בודדת בשפה נתמכת', 'Cloud Run תמיד זול יותר', 'Cloud Functions תומך ב-HTTP ו-Cloud Run לא', 'אין הבדל מעשי ביניהם'],
      a: 0,
      w: 'Cloud Run מריץ כל קונטיינר (Docker Image) עם כל שפה/תלות, ומתאים ל-Microservices מלאים. Cloud Functions מתמקד בפונקציה בודדת המגיבה לאירוע, בשפות נתמכות בלבד.'
    },
    {
      q: 'מהו מודל התמחור המרכזי של Cloud Run ו-Cloud Functions?',
      o: ['תשלום לפי בקשות בפועל וזמן ריצה (Scale to Zero כשאין תעבורה)', 'תשלום חודשי קבוע ללא תלות בשימוש', 'תשלום לפי מספר ה-VMs שהוקצו מראש', 'תשלום חד פעמי בעת הפריסה בלבד'],
      a: 0,
      w: 'שני השירותים הם Serverless אמיתי - כשאין בקשות נכנסות, ה-Instance יורד לאפס (Scale to Zero) ואין חיוב, בניגוד ל-Compute Engine שמחייב כל עוד ה-VM רץ.'
    },
    {
      q: 'מהו מודל התמחור הבסיסי של BigQuery ל-Queries?',
      o: ['תשלום לפי כמות הנתונים שנסרקה בשאילתה (On-Demand), או לפי Slots שמורים', 'תשלום קבוע חודשי בלבד ללא קשר לשימוש', 'תשלום לפי מספר המשתמשים המחוברים', 'תשלום לפי מספר הטבלאות ב-Dataset'],
      a: 0,
      w: 'במודל On-Demand משלמים לפי בייטים שנסרקו בפועל - לכן Partitioning ו-Clustering שמצמצמים סריקה מפחיתים משמעותית עלות. חלופה היא רכישת Slots קבועים מראש.'
    },
    {
      q: 'למה משמש Partitioning בטבלת BigQuery?',
      o: ['מחלק את הטבלה לחלקים (למשל לפי תאריך) כך ששאילתה תסרוק רק את החלק הרלוונטי', 'מצפין את הנתונים בטבלה', 'יוצר גיבוי אוטומטי של הטבלה', 'ממזג בין כמה טבלאות לטבלה אחת'],
      a: 0,
      w: 'שאילתה עם פילטר על עמודת ה-Partition (בדרך כלל תאריך) סורקת רק את המחיצות הרלוונטיות במקום את כל הטבלה - חיסכון משמעותי בעלות ובזמן.'
    }
  ];

  /* ============================================================
     מצב 2 - ניחוש פלט: פקודת gcloud/YAML + מה קורה בפועל
     ============================================================ */
  var STATUS_GUESS = [
    {
      code: '$ gcloud config set project my-project-id\n$ gcloud compute instances list',
      q: 'מה תעשה הפקודה השנייה אחרי שהוגדר Project ברירת מחדל?',
      o: ['תציג את כל מכונות ה-VM בפרויקט my-project-id בלבד', 'תציג VMs מכל הפרויקטים שהמשתמש מחובר אליהם', 'תיצור VM חדש', 'תחזיר שגיאה כי לא צוין Zone'],
      a: 0,
      w: 'לאחר <code>gcloud config set project</code>, כל פקודה עתידית פועלת מול אותו Project כברירת מחדל, בלי לציין <code>--project</code> בכל קריאה.'
    },
    {
      code: '$ gcloud projects add-iam-policy-binding my-project \\\n  --member="user:dana@company.com" \\\n  --role="roles/viewer"',
      q: 'מה תוצאת הפקודה הזו?',
      o: ['הענקת Role viewer למשתמש dana ברמת ה-Project my-project', 'יצירת משתמש חדש בשם dana', 'מחיקת כל ההרשאות של dana בפרויקט', 'הגדרת dana כ-Billing Admin'],
      a: 0,
      w: '<code>add-iam-policy-binding</code> מוסיף Binding חדש - כאן זה מעניק ל-dana את roles/viewer, שמאפשר צפייה בלבד (ללא עריכה) במשאבי הפרויקט.'
    },
    {
      code: '$ gcloud compute instances create my-vm \\\n  --machine-type=e2-medium \\\n  --preemptible',
      q: 'מה המשמעות של הדגל <code>--preemptible</code> כאן?',
      o: ['ה-VM ירוץ במחיר מוזל אך גוגל עלולה לכבות אותו בכל רגע', 'ה-VM יקבל SLA גבוה יותר משאר המכונות', 'ה-VM לא יחויב בכלל', 'ה-VM ייפרס אוטומטית במספר Zones'],
      a: 0,
      w: '<code>--preemptible</code> (או <code>--provisioning-model=SPOT</code> בגרסה החדשה) מפחית עלות משמעותית, בתמורה לסיכון שהמכונה תיכבה בהתראה קצרה של כ-30 שניות.'
    },
    {
      code: '$ gcloud compute firewall-rules create allow-ssh \\\n  --network=my-vpc \\\n  --allow=tcp:22 \\\n  --source-ranges=0.0.0.0/0',
      q: 'מה הבעיה האבטחתית הבולטת בכלל הזה?',
      o: ['<code>source-ranges=0.0.0.0/0</code> פותח SSH לכל כתובת IP באינטרנט', 'הפקודה תיכשל כי חסר Target Tag', 'הכלל חוסם את כל התעבורה במקום לאפשר', 'TCP 22 אינו פורט חוקי ב-GCP'],
      a: 0,
      w: 'פתיחת פורט 22 ל-<code>0.0.0.0/0</code> חושפת SSH לכל האינטרנט. עדיף להגביל ל-IP ranges ספציפיים או להשתמש ב-Identity-Aware Proxy (IAP) לגישה מאובטחת.'
    },
    {
      code: '$ gsutil mb -c standard -l europe-west3 gs://espresso-assets\n$ gsutil ls',
      q: 'מה תעשה הפקודה הראשונה?',
      o: ['תיצור Bucket חדש בשם espresso-assets, ב-Region europe-west3, מחלקת Standard', 'תמחק Bucket קיים', 'תעלה קובץ מקומי ל-Bucket', 'תציג את תוכן ה-Bucket'],
      a: 0,
      w: '<code>gsutil mb</code> (make bucket) יוצר Bucket חדש. <code>-c</code> קובע מחלקת אחסון (Storage Class) ו-<code>-l</code> קובע מיקום (Location/Region).'
    },
    {
      code: '$ gsutil lifecycle set lifecycle.json gs://espresso-assets',
      q: 'קובץ <code>lifecycle.json</code> מגדיר מעבר ל-Coldline אחרי 90 יום. מה קורה לאחר הרצת הפקודה?',
      o: ['גוגל תעביר אוטומטית אובייקטים ישנים מ-90 יום ל-Coldline, בלי מעורבות ידנית נוספת', 'הפקודה רק מדפיסה את התוכן של lifecycle.json', 'כל האובייקטים הקיימים יימחקו מיידית', 'ה-Bucket ייהפך לפרטי (Private) בלבד'],
      a: 0,
      w: 'Lifecycle Rules פועלות ברקע כל יום ובודקות אילו אובייקטים עומדים בתנאי (כאן: גיל 90+ יום) ומבצעות עליהם את הפעולה שהוגדרה - כאן מעבר למחלקת Coldline הזולה יותר.'
    },
    {
      code: '$ gcloud container clusters create espresso-cluster \\\n  --num-nodes=3 \\\n  --zone=europe-west3-a',
      q: 'מה סוג ה-Cluster שנוצר כברירת מחדל בפקודה הזו?',
      o: ['GKE Standard Zonal - 3 Nodes ב-Zone בודד', 'GKE Autopilot אוטומטית', 'Cluster Regional הפרוס על פני 3 Zones', 'רק Control Plane בלי Nodes כלל'],
      a: 0,
      w: 'ללא ציון <code>--region</code> או <code>--autopilot</code>, ברירת המחדל היא Cluster Zonal במצב Standard - ה-Control Plane וה-Nodes מוגבלים ל-Zone שצוין.'
    },
    {
      code: '$ kubectl get pods -n production\nNAME              READY   STATUS             RESTARTS   AGE\napi-7d9f-abc12    0/1     ImagePullBackOff   0          2m',
      q: 'מה משמעות הסטטוס <code>ImagePullBackOff</code>?',
      o: ['Kubernetes לא מצליח למשוך (pull) את ה-Image של הקונטיינר - שם שגוי, Registry לא נגיש או חסרות הרשאות', 'ה-Pod רץ בהצלחה אך איטי', 'ה-Node אזל לו הזיכרון', 'ה-Deployment נמחק בטעות'],
      a: 0,
      w: 'הבעיה השכיחה ביותר: שם Image שגוי/tag לא קיים, Registry פרטי בלי הרשאות משיכה מתאימות (למשל Workload Identity לא מוגדר), או בעיית רשת ל-Registry.'
    },
    {
      code: '$ gcloud run deploy my-service \\\n  --image=gcr.io/my-project/my-app \\\n  --no-allow-unauthenticated',
      q: 'מה המשמעות של <code>--no-allow-unauthenticated</code> בפריסת Cloud Run?',
      o: ['רק קריאות עם אימות IAM תקף (לא ציבוריות) יוכלו לגשת לשירות', 'השירות לא ייפרס בכלל', 'השירות ייחשף כ-HTTPS בלבד ללא HTTP', 'השירות יידרש להשתמש ב-Custom Domain'],
      a: 0,
      w: 'ברירת המחדל של Cloud Run היא לדרוש אימות. <code>--allow-unauthenticated</code> הופך את השירות לציבורי; ללא הדגל (או עם <code>--no-...</code>) רק קוראים עם Identity Token תקף יגיעו.'
    },
    {
      code: '$ bq query --use_legacy_sql=false \\\n  \'SELECT COUNT(*) FROM `my-project.sales.orders` WHERE order_date >= "2026-01-01"\'',
      q: 'איזה גורם קובע כאן כמה תשלמו על השאילתה (במודל On-Demand)?',
      o: ['כמות הבייטים שנסרקה בפועל בעמודות הרלוונטיות של הטבלה', 'זמן הריצה של השאילתה בשניות', 'מספר השורות שהוחזרו בתוצאה', 'מספר המשתמשים שהריצו את השאילתה'],
      a: 0,
      w: 'BigQuery במודל On-Demand מחייב לפי נפח הנתונים שנסרק - אם הטבלה מחולקת (Partitioned) לפי <code>order_date</code>, הפילטר בשאילתה יצמצם משמעותית את הסריקה והעלות.'
    },
    {
      code: '$ gcloud auth application-default login',
      q: 'למה משמשת פקודה זו, בהבדל מ-<code>gcloud auth login</code>?',
      o: ['מגדירה credentials מקומיים ש-SDKs/ספריות קוד (לא ה-CLI) ישתמשו בהם באופן אוטומטי', 'מתחברת לחשבון Console בדפדפן', 'מפעילה API ספציפי בפרויקט', 'יוצרת Service Account חדש'],
      a: 0,
      w: '<code>auth login</code> מאמת את המשתמש עבור gcloud CLI עצמו. <code>auth application-default login</code> יוצר Application Default Credentials שקוד (Python/Node/Go SDKs) קורא אוטומטית בסביבת פיתוח מקומית.'
    },
    {
      code: '$ gcloud compute instances describe my-vm \\\n  --zone=europe-west3-a \\\n  --format="value(status)"',
      q: 'מה תפקיד <code>--format="value(status)"</code> בפקודה?',
      o: ['מדפיס רק את הערך של שדה status, בלי שאר המידע והעיצוב', 'משנה את הסטטוס של ה-VM בפועל', 'מציג רק VMs במצב RUNNING', 'יוצר קובץ פלט חדש בדיסק'],
      a: 0,
      w: 'הדגל <code>--format</code> עם <code>value(...)</code> מדפיס ערך שדה בודד בלי JSON/YAML מלא - שימושי מאוד בסקריפטים שצריכים לבדוק תנאי (למשל <code>if [ "$STATUS" = "RUNNING" ]</code>).'
    }
  ];

  /* ============================================================
     מצב 3 - השלמת פקודה: gcloud/YAML עם חלק חסר
     ============================================================ */
  var CMD_COMPLETE = [
    {
      code: '$ gcloud config ___ project my-project-id',
      q: 'מה משלים את הפקודה כדי להגדיר Project ברירת מחדל?',
      o: ['<code>set</code>', '<code>create</code>', '<code>update</code>', '<code>add</code>'],
      a: 0,
      w: '<code>gcloud config set project &lt;id&gt;</code> קובע את ה-Project הפעיל, כך שאין צורך לציין <code>--project</code> בכל פקודה עתידית.'
    },
    {
      code: '$ gcloud projects ___-iam-policy-binding my-project \\\n  --member="user:dana@company.com" --role="roles/editor"',
      q: 'מה משלים את הפקודה כדי להעניק Role חדש למשתמש?',
      o: ['<code>add</code>', '<code>remove</code>', '<code>create</code>', '<code>set</code>'],
      a: 0,
      w: '<code>add-iam-policy-binding</code> מוסיף Binding חדש למדיניות ה-IAM. הפעולה ההפוכה היא <code>remove-iam-policy-binding</code>.'
    },
    {
      code: '$ gcloud compute instances create my-vm \\\n  --___=e2-medium \\\n  --zone=europe-west3-a',
      q: 'איזה דגל קובע את כמות ה-CPU/RAM של ה-VM?',
      o: ['<code>machine-type</code>', '<code>instance-type</code>', '<code>size</code>', '<code>flavor</code>'],
      a: 0,
      w: '<code>--machine-type</code> קובע את משפחת וגודל המכונה (למשל <code>e2-medium</code>, <code>n2-standard-4</code>) - זה שקול ל-Instance Type ב-AWS.'
    },
    {
      code: '$ gcloud compute firewall-rules create allow-internal \\\n  --network=my-vpc \\\n  --___=tcp:0-65535,udp:0-65535,icmp \\\n  --source-ranges=10.0.0.0/8',
      q: 'איזה דגל קובע אילו פרוטוקולים/פורטים מותרים בכלל ה-Firewall?',
      o: ['<code>allow</code>', '<code>permit</code>', '<code>ports</code>', '<code>rules</code>'],
      a: 0,
      w: '<code>--allow</code> מגדיר את הפרוטוקולים והפורטים המותרים (למשל <code>tcp:22</code> או <code>tcp:0-65535</code> לכל הפורטים). ההפך, חסימה מפורשת, נעשה עם <code>gcloud compute firewall-rules create ... --action=DENY</code>.'
    },
    {
      code: '$ gsutil ___ -c standard -l europe-west3 gs://espresso-backups',
      q: 'מה משלים את הפקודה ליצירת Bucket חדש?',
      o: ['<code>mb</code>', '<code>create</code>', '<code>new</code>', '<code>init</code>'],
      a: 0,
      w: '<code>gsutil mb</code> (make bucket) יוצר Bucket. <code>-c</code> קובע Storage Class ו-<code>-l</code> קובע Location.'
    },
    {
      code: '$ gsutil ___ gs://espresso-assets/**',
      q: 'מה משלים את הפקודה כדי להעתיק את כל תוכן ה-Bucket לתיקייה מקומית בשם <code>./local-backup</code>?',
      o: ['<code>cp -r</code> (עם היעד <code>./local-backup</code>)', '<code>mv</code>', '<code>rsync -d</code> בלבד ללא יעד', '<code>ls -r</code>'],
      a: 0,
      w: '<code>gsutil cp -r gs://bucket/** ./local-backup</code> מעתיק רקורסיבית. לסנכרון דו-כיווני עדיף <code>gsutil rsync -r</code>, ששומר רק על ההבדלים.'
    },
    {
      code: '$ gcloud container clusters create espresso-cluster \\\n  --___ \\\n  --region=europe-west3',
      q: 'איזה דגל הופך את ה-Cluster ל-Autopilot במקום Standard?',
      o: ['<code>autopilot</code>', '<code>managed-nodes</code>', '<code>serverless</code>', '<code>auto-scale</code>'],
      a: 0,
      w: '<code>--autopilot</code> יוצר Cluster בו גוגל מנהלת את ה-Nodes לחלוטין ומחייבת לפי משאבי Pod בפועל, במקום דגם ה-Node Pools הידני של Standard.'
    },
    {
      code: '$ kubectl ___ deployment/api --replicas=5',
      q: 'מה משלים את הפקודה כדי להגדיל את מספר ה-Pods הרצים ל-5?',
      o: ['<code>scale</code>', '<code>resize</code>', '<code>expand</code>', '<code>update</code>'],
      a: 0,
      w: '<code>kubectl scale deployment/&lt;name&gt; --replicas=N</code> משנה מיידית את מספר ה-Pods הרצוי. לגישה אוטומטית לפי עומס, יש להגדיר Horizontal Pod Autoscaler (HPA).'
    },
    {
      code: '$ gcloud run deploy my-service \\\n  --image=gcr.io/my-project/my-app \\\n  --___=europe-west3',
      q: 'איזה דגל קובע את ה-Region שבו ייפרס שירות Cloud Run?',
      o: ['<code>region</code>', '<code>zone</code>', '<code>location</code>', '<code>area</code>'],
      a: 0,
      w: 'Cloud Run הוא שירות Regional (לא Zonal ולא Global) - <code>--region</code> קובע היכן ירוץ ה-Service, ומשפיע גם על Latency למשתמשים.'
    },
    {
      code: '$ gcloud functions deploy my-function \\\n  --runtime=nodejs20 \\\n  --trigger-___=my-topic',
      q: 'מה משלים את הפקודה כדי להפעיל את הפונקציה בתגובה להודעת Pub/Sub?',
      o: ['<code>topic</code>', '<code>event</code>', '<code>source</code>', '<code>queue</code>'],
      a: 0,
      w: '<code>--trigger-topic</code> מקשר את הפונקציה ל-Pub/Sub Topic ספציפי - כל הודעה חדשה שם תפעיל ריצה חדשה של הפונקציה. לחלופין יש <code>--trigger-http</code> להפעלה דרך בקשת HTTP.'
    },
    {
      code: '$ bq ___ my_dataset.orders schema.json',
      q: 'מה משלים את הפקודה כדי ליצור טבלה חדשה ב-BigQuery מקובץ סכמה?',
      o: ['<code>mk --table</code>', '<code>create</code>', '<code>new</code>', '<code>load</code>'],
      a: 0,
      w: '<code>bq mk --table my_dataset.orders schema.json</code> יוצר טבלה ריקה עם הסכמה שהוגדרה. לטעינת נתונים לתוך טבלה קיימת/חדשה משתמשים ב-<code>bq load</code>.'
    },
    {
      code: '$ bq query --use_legacy_sql=false \\\n  \'SELECT * FROM `sales.orders` ___ BY order_date DESC LIMIT 10\'',
      q: 'מה משלים את שאילתת ה-SQL כדי למיין תוצאות מהחדש לישן?',
      o: ['<code>ORDER</code>', '<code>SORT</code>', '<code>GROUP</code>', '<code>ARRANGE</code>'],
      a: 0,
      w: '<code>ORDER BY order_date DESC</code> ממיין את התוצאות מהערך הגבוה ביותר (התאריך המאוחר ביותר) לנמוך - תחביר SQL סטנדרטי, לא ייחודי ל-BigQuery.'
    }
  ];

  /* ============================================================
     מצב 4 - התאמת מושגים: סבבים של זוגות מונח/פקודה + תיאור
     ============================================================ */
  var MATCH_ROUNDS = [
    {
      title: 'Projects, IAM ומבנה משאבים',
      pairs: [
        { l: '<code>gcloud config set project</code>', r: 'קובע את ה-Project הפעיל לכל הפקודות הבאות' },
        { l: 'Resource Hierarchy', r: 'מבנה היררכי Organization → Folder → Project → Resource לניהול מדיניות' },
        { l: 'IAM Role', r: 'אוסף permissions שניתן להעניק ל-Identity' },
        { l: 'Service Account', r: 'זהות לתהליכים ואפליקציות, לא לבני אדם' },
        { l: 'Least Privilege', r: 'עקרון שלפיו מעניקים רק את ההרשאות המינימליות הנדרשות' }
      ]
    },
    {
      title: 'Compute Engine ו-VPC',
      pairs: [
        { l: 'Machine Type', r: 'קובע כמות ה-vCPU וה-RAM של ה-VM' },
        { l: 'Preemptible/Spot VM', r: 'מכונה זולה שגוגל עלולה לכבות בהתראה קצרה' },
        { l: 'Persistent Disk', r: 'אחסון בלוקים הנפרד מה-VM ושורד את מחיקתו' },
        { l: 'VPC', r: 'רשת וירטואלית Global שה-Subnets בה מוגדרים ברמת Region' },
        { l: 'Cloud NAT', r: 'מאפשר גישה יוצאת לאינטרנט ל-VMs ללא IP ציבורי' }
      ]
    },
    {
      title: 'Cloud Storage ו-GKE',
      pairs: [
        { l: '<code>Standard</code> Storage Class', r: 'לגישה תכופה, העלות אחסון הגבוהה ביותר מבין המחלקות' },
        { l: '<code>Archive</code> Storage Class', r: 'הזולה ביותר לאחסון, מינימום 365 יום ועלות שליפה גבוהה' },
        { l: 'Lifecycle Rule', r: 'מעביר/מוחק אובייקטים אוטומטית לפי גיל או תנאי' },
        { l: 'GKE Node Pool', r: 'קבוצת Nodes עם תצורה זהה בתוך Cluster' },
        { l: 'Workload Identity', r: 'מקשר Kubernetes Service Account ל-GCP Service Account בלי מפתחות סטטיים' }
      ]
    },
    {
      title: 'Serverless ו-BigQuery',
      pairs: [
        { l: 'Cloud Run', r: 'מריץ כל קונטיינר, מתומחר לפי בקשות עם Scale to Zero' },
        { l: 'Cloud Functions', r: 'מריץ פונקציה בודדת בתגובה לאירוע (HTTP, Pub/Sub וכו׳)' },
        { l: 'BigQuery Partitioning', r: 'מחלק טבלה לחלקים (למשל לפי תאריך) לצמצום נפח הסריקה' },
        { l: 'BigQuery On-Demand Pricing', r: 'תשלום לפי כמות הבייטים שנסרקו בשאילתה' },
        { l: 'Cloud SQL', r: 'מסד נתונים יחסי מנוהל (MySQL/PostgreSQL/SQL Server) ל-OLTP' }
      ]
    }
  ];

  /* ============================================================
     מצב 5 - סידור Workflow: סבבים של שלבים שצריך לסדר בסדר הנכון
     ============================================================ */
  var ORDER_ROUNDS = [
    {
      title: 'הקמת פרויקט חדש והרשאת משתמש',
      steps: [
        'הרצת gcloud projects create ליצירת Project חדש',
        'הרצת gcloud config set project כדי להפוך אותו לפעיל',
        'הפעלת ה-APIs הנדרשים עם gcloud services enable',
        'הענקת Role למשתמש עם gcloud projects add-iam-policy-binding',
        'אימות ההרשאות עם gcloud projects get-iam-policy'
      ]
    },
    {
      title: 'פריסת VM עם Compute Engine עד לגישה מאובטחת',
      steps: [
        'יצירת VPC ו-Subnet ייעודיים עם gcloud compute networks create',
        'הגדרת Firewall Rule מוגבל (למשל רק IAP) לגישת SSH',
        'יצירת VM עם gcloud compute instances create ומשפחת Machine Type מתאימה',
        'התחברות אליו עם gcloud compute ssh',
        'התקנת והרצת האפליקציה על ה-VM'
      ]
    },
    {
      title: 'פריסת אפליקציה ל-GKE',
      steps: [
        'יצירת Cluster עם gcloud container clusters create',
        'התחברות ל-Cluster עם gcloud container clusters get-credentials',
        'בניית Image ודחיפתו ל-Artifact Registry',
        'יצירת Deployment עם kubectl apply על קובץ YAML',
        'חשיפת השירות עם Service מסוג LoadBalancer',
        'בדיקת סטטוס הריצה עם kubectl get pods'
      ]
    },
    {
      title: 'ניתוח נתונים ב-BigQuery מקצה לקצה',
      steps: [
        'יצירת Dataset עם bq mk my_dataset',
        'טעינת נתונים מ-Cloud Storage עם bq load',
        'הרצת שאילתת בדיקה עם bq query כדי לוודא תקינות הסכמה',
        'הגדרת Partitioning/Clustering לטבלה לצמצום עלויות שאילתה',
        'יצירת View מתוזמן לדוחות חוזרים',
        'הגדרת הרשאות IAM על ה-Dataset למשתמשי BI'
      ]
    }
  ];

  /* ============================================================
     הגדרת מצבי המשחק
     ============================================================ */
  var MODES = [
    { key: 'rapid', icon: '⚡', name: 'קרב מהיר', desc: 'שאלות ידע כלליות על GCP - כמה תספיקו לפני שהזמן נגמר?', type: 'quiz', data: RAPID, sample: 8, time: 20000 },
    { key: 'behavior', icon: '🔮', name: 'ניחוש התנהגות', desc: 'פקודת gcloud/YAML - מה בדיוק קורה בפועל?', type: 'quiz', data: STATUS_GUESS, sample: 8, time: 28000, showCode: true },
    { key: 'complete', icon: '🧩', name: 'השלמת קוד', desc: 'פקודת gcloud/gsutil/bq עם חלק חסר - בחרו מה משלים אותה נכון', type: 'quiz', data: CMD_COMPLETE, sample: 8, time: 28000, showCode: true },
    { key: 'match', icon: '🔗', name: 'התאמת מושגים', desc: 'התאימו כל מונח/פקודת GCP לתיאור הנכון שלו', type: 'match', data: MATCH_ROUNDS, sample: 2 },
    { key: 'order', icon: '📋', name: 'סידור Workflow', desc: 'סדרו את שלבי התהליך לפי הסדר הנכון', type: 'order', data: ORDER_ROUNDS, sample: 2 }
  ];

  window.TG_CONFIG = { gameId: "gcp", modes: MODES };
})();
</script>

<script src="/scripts/topic-game.js"></script>
