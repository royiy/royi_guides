---
title: "מדריך 12: שאלות קשות ברמת הסמכה (AWS Solutions Architect)"
description: "מבחן אמריקאי אינטראקטיבי ברמת הסמכת AWS Certified Solutions Architect – Associate (SAA-C03), עם שאלות עדינות ומטעות"
---

מבחן אינטראקטיבי ברמת קושי גבוהה, בסגנון שאלות הסמכת <strong>AWS Certified Solutions Architect – Associate (SAA-C03)</strong> - בניגוד למבחן החזרה הכללי בפרק הקודם, כאן כל שאלה בודקת נקודה עדינה ומטעה שדורשת הבנה אמיתית של מנגנוני הפנים של AWS (S3 Lifecycle, IAM Evaluation Logic, VPC Networking, High Availability ועוד), לא רק שינון. בחרו תשובה ותקבלו מיד משוב עם הסבר מפורט.

<div id="quiz-score" class="quiz-score">ענית נכון על 0 מתוך 10</div>

<div class="quiz-card" data-answer="ג">
  <p class="quiz-question"><strong>1. חברה שומרת קבצי לוג ב-<code>S3 Standard</code> וזקוקה להם לעיתים רחוקות אחרי 30 יום, אך כשהיא כן צריכה אותם - היא חייבת שליפה מיידית (לא כמו Glacier). מה מדיניות ה-<code>Lifecycle</code> הנכונה ביותר לחיסכון בעלויות מבלי לפגוע בזמינות המיידית?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. מעבר ל-<code>S3 Glacier Deep Archive</code> אחרי 30 יום, כי הוא הזול ביותר</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. השארה ב-<code>S3 Standard</code> לצמיתות, כי מעבר class כלשהו תמיד פוגע בזמינות המיידית</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. מעבר ל-<code>S3 Standard-IA</code> (Infrequent Access) אחרי 30 יום - עדיין שליפה מיידית (milliseconds) כמו Standard, אך בעלות אחסון נמוכה משמעותית, כל עוד השליפות אכן נדירות (יש עלות שליפה ומינימום 30 יום/128KB לאובייקט)</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. מעבר ל-<code>S3 One Zone-IA</code> בלבד, כי הוא תמיד עדיף על Standard-IA מבחינת עלות וזמינות גם יחד</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> <code>S3 Standard-IA</code> נועד בדיוק למקרה הזה - נתונים שנגישים לעיתים רחוקות אך דורשים שליפה מיידית באותה latency כמו Standard, במחיר אחסון נמוך יותר (בתמורה לעלות שליפה נוספת ומינימום חיוב לאובייקט/משך זמן). <code>Glacier Deep Archive</code> פסול כי השליפה ממנו לוקחת שעות, לא מיידית. <code>One Zone-IA</code> זול יותר אבל נשמר ב-AZ בודד בלבד - פחות עמיד לאסון מ-Standard-IA שנשמר על פני מספר AZs, כך שהוא לא "עדיף תמיד". השארה ב-Standard לצמיתות מבזבזת כסף מיותר על נתונים שכמעט ולא נגישים.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>2. למשתמש IAM יש <code>Identity-based Policy</code> עם <code>Allow</code> מפורש לפעולת <code>s3:GetObject</code>, אבל הוא פועל תחת <code>Permissions Boundary</code> שמגדירה הרשאות מקסימליות שלא כוללות את הפעולה הזו כלל. מה תהיה התוצאה בפועל?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. הפעולה תותר, כי <code>Allow</code> מפורש ב-Identity-based Policy תמיד מנצח כל מגבלה אחרת</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. הפעולה תיחסם - <code>Permissions Boundary</code> קובעת את תקרת ההרשאות המקסימלית האפשרית; רק פעולות שמותרות גם ב-Identity-based Policy וגם בתוך גבולות ה-Boundary מתבצעות בפועל (חיתוך, לא איחוד)</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. Permissions Boundary משפיעה רק על משתמשי Root, לא על משתמשי IAM רגילים</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. יתקבל שגיאת קונפיגורציה ו-AWS ידחה את שמירת ה-Policy מלכתחילה</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> <code>Permissions Boundary</code> היא מדיניות מסוג מתקדם שמגדירה תקרה מקסימלית להרשאות של Entity (User/Role) - היא לא מעניקה הרשאות בעצמה, אלא רק מצמצמת את מה שההרשאות בפועל יכולות לכלול. הרשאה אפקטיבית מתקבלת רק מהחיתוך בין מה שה-Identity-based Policy מתירה לבין מה שה-Boundary מתירה. גם אם יש <code>Allow</code> מפורש ב-Policy הרגילה, אם הפעולה לא נכללת בתוך ה-Boundary - היא תיחסם. זה נפרד לחלוטין מ-<code>Deny</code> מפורש, אבל מבחינת התוצאה הסופית - שתיהן יכולות לחסום פעולה שנראית "מותרת" על פניו.</div>
</div>

<div class="quiz-card" data-answer="ג">
  <p class="quiz-question"><strong>3. לחברה יש שלוש VPCs (A, B, C) המחוברות זו לזו באמצעות <code>VPC Peering</code> בלבד: A-B ו-B-C. מדוע תעבורה מ-VPC A לא יכולה להגיע ל-VPC C דרך B, ומה הפתרון המומלץ כשיש הרבה VPCs שצריכות להתחבר זו לזו?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. אין שום בעיה - VPC Peering הוא טרנזיטיבי במלואו, A יכול להגיע ל-C דרך B ללא כל שינוי</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. הבעיה היא רק ב-Security Groups; אחרי תיקון החוקים A יגיע ל-C ישירות דרך B</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. VPC Peering אינו טרנזיטיבי - חייבים Peering ישיר בין A ל-C, וכשמדובר בהרבה VPCs פתרון קנה-מידה הוא <code>AWS Transit Gateway</code> כרכזת מרכזית (hub) שמחברת את כל ה-VPCs דרכה ללא צורך ב-Peering מלא (mesh) בין כולן</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. יש להגדיר Internet Gateway משותף לשלוש ה-VPCs כדי לפתור את זה</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> חוק בסיסי וקריטי למבחן: <code>VPC Peering</code> הוא אינו-טרנזיטיבי (non-transitive) - Peering בין A ל-B ובין B ל-C לא מאפשר ל-A "לעבור" דרך B כדי להגיע ל-C. הפתרון עם מספר קטן של VPCs הוא ליצור Peering ישיר בין כל זוג (מבנה Full Mesh), אך זה לא מתרחב יפה (n*(n-1)/2 חיבורים). כשיש הרבה VPCs, הפתרון המומלץ הוא <code>Transit Gateway</code> - רכיב hub-and-spoke מרכזי שכל VPC מתחבר אליו פעם אחת, ומאפשר תעבורה טרנזיטיבית בין כולן דרך נקודה אחת מנוהלת.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>4. אפליקציה סובלת מעומס קריאה גבוה על מסד נתונים RDS, וגם דורשת Failover אוטומטי מהיר במקרה של תקלה. הצוות הגדיר <code>Multi-AZ Deployment</code> בלבד וציפה שזה יפתור גם את בעיית העומס. מדוע זו טעות, ומה ההבדל הקריטי מ-<code>Read Replica</code>?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. אין הבדל בפועל - Multi-AZ ו-Read Replica שניהם משרתים תעבורת קריאה נוספת באותה מידה בדיוק</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. ה-Standby Instance ב-Multi-AZ משמש אך ורק לצורכי זמינות/Failover ואינו זמין לקריאה בזמן שגרתי (הסנכרון הוא סינכרוני); <code>Read Replica</code> הוא לעומת זאת עותק נוסף (סנכרון א-סינכרוני) שכן ניתן להפנות אליו שאילתות קריאה כדי לפזר עומס, אך הוא לא Failover Target אוטומטי כברירת מחדל</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. Multi-AZ תמיד משפר ביצועי קריאה יותר מ-Read Replica כי הוא סינכרוני</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. Read Replica יכול לשמש רק באותו Region כמו מסד הנתונים המקורי, לעולם לא Cross-Region</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> נקודת בלבול קלאסית במבחן. <code>Multi-AZ</code> נועד לזמינות גבוהה בלבד - יש עותק Standby ב-AZ אחר עם רפליקציה סינכרונית, אך הוא אינו ניתן לשאילתות קריאה בזמן שגרתי ולא עוזר לביצועים. <code>Read Replica</code> נועד לביצועים/סקיילינג של קריאה - עותק א-סינכרוני שניתן להפנות אליו קריאות, ואפשר להקים גם Cross-Region. חשוב: <code>Read Replica</code> ניתן לקדם (promote) ידנית למסד עצמאי במקרה חירום, אך הוא לא Failover אוטומטי מובנה כמו Standby של Multi-AZ. לכן הפתרון הנכון לשני הצרכים גם יחד הוא שילוב של Multi-AZ (לזמינות) + Read Replica אחד או יותר (לביצועי קריאה).</div>
</div>

<div class="quiz-card" data-answer="א">
  <p class="quiz-question"><strong>5. אפליקציה צריכה לבדוק תוכן בקשות HTTP (למשל path-based routing לפי URL) ולנתב אותן לקבוצות שרתים שונות, ובנוסף אפליקציה שנייה זקוקה ל-Load Balancer שתומך במיליוני בקשות בשנייה עם latency נמוך ביותר עבור פרוטוקול TCP גולמי. איזה שילוב נכון?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. <code>Application Load Balancer (ALB)</code> לניתוב מבוסס-תוכן ב-Layer 7 (path/host-based routing); <code>Network Load Balancer (NLB)</code> לביצועי Layer 4 קיצוניים עם latency נמוך וכתובת IP סטטית</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. <code>Gateway Load Balancer</code> לשני המקרים גם יחד, כי הוא מחליף באופן מלא את ALB ו-NLB</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. <code>NLB</code> לניתוב מבוסס-תוכן, ו-<code>ALB</code> לביצועי Layer 4</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. אין הבדל מעשי בין הסוגים, ובחירה ביניהם היא רק עניין של מחיר</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> <code>ALB</code> פועל ב-Layer 7 ומבין תוכן HTTP/HTTPS - מתאים לניתוב מבוסס path/host/header, מיקרו-שירותים ו-container-based routing. <code>NLB</code> פועל ב-Layer 4 (TCP/UDP), נותן latency מינימלי, יכולת לעמוד במיליוני בקשות, וכתובת IP סטטית לכל AZ - מתאים לעומסים קיצוניים או כשדרושה כתובת IP קבועה. <code>Gateway Load Balancer</code> הוא מוצר שונה לחלוטין - הוא לא מחליף ALB/NLB, אלא משמש לפריסת מכשירי אבטחה של צד שלישי (firewalls/IDS/IPS) בצורה שקופה בנתיב התעבורה, ופועל ב-Layer 3 עם פרוטוקול GENEVE.</div>
</div>

<div class="quiz-card" data-answer="ג">
  <p class="quiz-question"><strong>6. עומס על אפליקציה עולה ויורד בצורה הדרגתית וצפויה יחסית, ורוצים ש-<code>Auto Scaling Group</code> ישמור אוטומטית על ניצול CPU ממוצע של כ-50% בכל רגע נתון, ללא צורך בהגדרת רף כניסה/יציאה ידני. איזו מדיניות Scaling מתאימה ביותר, ובמה היא שונה מ-<code>Step Scaling</code>?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. <code>Simple Scaling</code>, כי הוא היחיד שתומך במטריקות CPU</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. <code>Step Scaling</code>, כי הוא היחיד שמגיב לשינויים הדרגתיים בעומס</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. <code>Target Tracking Scaling</code> - מגדירים יעד מספרי (למשל 50% CPU) ו-Auto Scaling מחשב ומכוון אוטומטית כמה instances נדרשים כדי לשמור על היעד, בדומה ללולאת Thermostat; לעומת זאת <code>Step Scaling</code> דורש הגדרה ידנית של סטים/צעדים (למשל: "אם CPU מעל 70% הוסף 2, אם מעל 90% הוסף 4") לפי גודל חריגה מסף מוגדר מראש</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. אין הבדל מהותי בין שתי המדיניות - שתיהן דורשות בדיוק אותה כמות הגדרות ידניות</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> <code>Target Tracking</code> הוא הבחירה הפשוטה והנפוצה ביותר כשרוצים לשמור מטריקה סביב ערך יעד - AWS מנהל בעצמו את חישוב הכמות הנדרשת של instances דרך CloudWatch Alarms שנוצרים אוטומטית מאחורי הקלעים. <code>Step Scaling</code> נותן שליטה עדינה ומדורגת יותר (כמה instances להוסיף/להסיר בהתאם לגודל החריגה מהסף), אך דורש מהמשתמש להגדיר ידנית את הצעדים/סטים והסיפים עצמם - מתאים כשרוצים תגובה לא-ליניארית מותאמת אישית, לא כברירת מחדל הפשוטה ביותר.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>7. צוות מנסה להגדיר <code>S3 Cross-Region Replication (CRR)</code> בין שני Buckets, אך הכללים לא נשמרים ו-AWS מציגה שגיאה. מה התנאי המוקדם ההכרחי ביותר שכנראה חסר?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. שני ה-buckets חייבים להיות באותו Region בדיוק, אחרת CRR לא אפשרי מיסודו</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. חובה להפעיל <code>Versioning</code> גם על ה-bucket המקור וגם על ה-bucket היעד - ללא Versioning מופעל בשניהם, CRR לא ניתן להגדרה כלל</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. שני ה-buckets חייבים בהכרח להיות תחת אותו חשבון AWS, לעולם לא Cross-Account</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. חובה להצפין את שני ה-buckets עם אותו מפתח KMS בדיוק כתנאי טכני הכרחי ל-CRR</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> תנאי סף שממש נבדק במבחן - <code>Versioning</code> חייב להיות מופעל הן ב-bucket המקור והן ב-bucket היעד לפני שניתן בכלל להגדיר <code>Cross-Region Replication</code> (או Same-Region Replication). ה-buckets דווקא חייבים להיות ב-Regions שונים ב-CRR (זה כל הרעיון), ה-CRR כן תומך גם ב-Cross-Account, והצפנה עם KMS אפשרית אך היא לא חובה ולא חייבת להיות עם אותו מפתח - יש הגדרות replication ייעודיות למקרה שרוצים להצפין את היעד עם מפתח KMS שונה.</div>
</div>

<div class="quiz-card" data-answer="ד">
  <p class="quiz-question"><strong>8. חברה דורשת RTO (Recovery Time Objective) של דקות בודדות ו-RPO (Recovery Point Objective) נמוך מאוד למערכת קריטית, אך התקציב מוגבל ולא מאפשר תשתית פעילה-מלאה בשני Regions בו-זמנית. איזו אסטרטגיית Disaster Recovery הכי מתאימה?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. <code>Backup and Restore</code> - הכי זול, אך RTO שלה נמדד לרוב בשעות, לא מתאים לדרישה של דקות בודדות</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. <code>Multi-Site Active/Active</code> - מתאים לדרישת ה-RTO/RPO, אך זו האסטרטגיה היקרה ביותר שדורשת תשתית מלאה פעילה בשני Regions בו-זמנית, בניגוד לאילוץ התקציב</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. אין פתרון ביניים אפשרי - חייבים לבחור בין Backup and Restore הזול ל-Multi-Site היקר בלבד</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. <code>Warm Standby</code> - גרסה מוקטנת אך פעילה של הסביבה רצה כל הזמן ב-Region המשני (למשל עם פחות instances/קיבולת מוקטנת), כך שבזמן כשל ניתן להגדיל אותה במהירות (Scale Up) ולבצע Failover תוך דקות - פשרה טובה בין עלות ל-RTO/RPO ביחס ל-Pilot Light ול-Multi-Site</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> ארבע האסטרטגיות במבחן מדורגות בסקאלה של עלות מול מהירות התאוששות: <code>Backup and Restore</code> (הכי זול, RTO/RPO הכי גבוהים - שעות), <code>Pilot Light</code> (רק "הליבה" - למשל מסד נתונים משוכפל - רצה ב-Region המשני, שאר השירותים מוקמים רק בזמן כשל, RTO של עשרות דקות), <code>Warm Standby</code> (גרסה מוקטנת אך פעילה ומוכנה לתעבורה חלקית, ניתן להגדיל מהר, RTO של דקות), ו-<code>Multi-Site Active/Active</code> (שתי סביבות מלאות פעילות, RTO/RPO כמעט אפסי, אך היקר ביותר). מכיוון שהדרישה היא RTO של דקות עם תקציב מוגבל (לא מאפשר Active/Active מלא), <code>Warm Standby</code> הוא הפשרה המתאימה.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>9. פונקציית Lambda מוגדרת בתוך VPC פרטי (כדי לגשת למסד נתונים RDS פרטי), והצוות מבחין בעלייה משמעותית ב-Cold Start וזמני אתחול. מה ההסבר הנכון ביותר, ומה השתפר בשנים האחרונות בנושא הזה?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. Lambda בתוך VPC לעולם לא יכולה לגשת לאינטרנט או לשירותי AWS אחרים כלל, ללא יוצא מן הכלל</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. חיבור Lambda ל-VPC דורש יצירת ENI (Elastic Network Interface) המקושר ל-Subnet, מה שהיסטורית הוסיף latency משמעותי ל-Cold Start; AWS שיפרה זאת משמעותית עם מודל שיתוף ENI חוצה-הפעלות (Hyperplane ENI), כך שברוב המקרים כיום ההשפעה על Cold Start קטנה בהרבה מבעבר - אך גישה לאינטרנט הציבורי עדיין דורשת NAT Gateway ב-Subnet פרטי</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. Cold Start קורה אך ורק בפונקציות שאינן בתוך VPC כלל, ומעולם לא בפונקציות VPC</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. הפתרון היחיד ל-Cold Start הוא הגדלת ה-Timeout של הפונקציה למקסימום האפשרי</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> נקודה שהשתנתה עם הזמן וממש נבדקת - בעבר, כל הפעלה חדשה של Lambda בתוך VPC יצרה ENI חדש, מה שהוסיף עשרות שניות ל-Cold Start. AWS שדרגה את הארכיטקטורה למודל משותף (Hyperplane) שמאפשר לשתף ENIs בין הפעלות, מה שצמצם דרמטית את ההשפעה. עדיין נכון ש-Lambda בתוך Subnet פרטי דורשת <code>NAT Gateway</code> כדי לגשת לאינטרנט הציבורי או לשירותי AWS ציבוריים (או לחלופין VPC Endpoints לשירותי AWS ספציפיים). <code>Timeout</code> לא קשור בכלל לזמן ה-Cold Start - הוא רק מגדיר מתי הביצוע נחתך.</div>
</div>

<div class="quiz-card" data-answer="ג">
  <p class="quiz-question"><strong>10. מנהל רשת קבע חוק ב-<code>Network ACL</code> החוסם תעבורת inbound מכתובת IP מסוימת, אך אותה כתובת עדיין מצליחה להגיע לשרתים ב-Subnet, כי ה-<code>Security Group</code> של השרתים מתיר את זה. מדוע זה קורה, ומה ההבדל המבני בין השניים?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. זו תקלה - NACL תמיד גובר על Security Group ללא יוצא מן הכלל</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. Security Groups ו-NACLs הם בדיוק אותו מנגנון בשם אחר, ולכן אין הבדל בתוצאה</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. שתי השכבות נבדקות במקביל ושתיהן חייבות להתיר את התעבורה - אך כאן כנראה החוק שנקבע ב-NACL לא באמת חוסם בפועל (למשל בגלל מספר סדר חוק גבוה יותר מחוק Allow אחר, שכן NACL הוא stateless ונבדק לפי מספרי כלל מהנמוך לגבוה); בנוסף, Security Group הוא stateful (תעבורת תגובה מותרת אוטומטית) בעוד NACL הוא stateless (חובה להתיר גם inbound וגם outbound explicitly, כולל פורטים אפמריים)</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. Security Group תקף רק ברמת ה-VPC כולה, בעוד NACL תקף רק ברמת instance בודד</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> תעבורה לתוך Subnet חייבת לעבור גם את ה-<code>NACL</code> (ברמת ה-Subnet) וגם את ה-<code>Security Group</code> (ברמת ה-ENI/instance) - שתי השכבות פועלות יחד, לא כתחליף זו לזו. ה-NACL הוא <strong>stateless</strong> ונבדק לפי סדר מספרי של כללים (מהנמוך לגבוה, העצירה בהתאמה הראשונה) - כלל Allow עם מספר נמוך יותר מכלל ה-Deny שהוגדר יכול "לנצח" בפועל אם לא סודר נכון, ובנוסף יש להתיר גם כיוון outbound (כולל טווח פורטים אפמריים) כי אין זיכרון מצב. ה-Security Group לעומת זאת הוא <strong>stateful</strong> - די להתיר inbound, ותעבורת התגובה תותר אוטומטית ללא כלל outbound מתאים. חשוב לדעת ש-Security Group תמיד רק Allow (אין בו Deny מפורש), בעוד NACL תומך גם ב-Allow וגם ב-Deny מפורש.</div>
</div>

<button type="button" id="quiz-reset-all" class="quiz-reset-all">אפס את כל המבחן</button>

<style>
.quiz-score {
  font-weight: 600;
  font-size: 1.05em;
  padding: 0.6rem 1rem;
  margin-bottom: 1.5rem;
  border-radius: 8px;
  background: var(--sl-color-gray-6);
  border: 1px solid var(--sl-color-hairline);
  position: sticky;
  top: 0.5rem;
  z-index: 1;
}

.quiz-card {
  border: 1px solid var(--sl-color-hairline);
  border-radius: 10px;
  padding: 1rem 1.25rem;
  margin: 1.25rem 0;
  background: var(--sl-color-bg-nav);
}

.quiz-question {
  margin-top: 0;
  margin-bottom: 0.75rem;
}

.quiz-options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.quiz-option {
  display: block;
  width: 100%;
  text-align: right;
  padding: 0.55rem 0.8rem;
  border-radius: 8px;
  border: 1px solid var(--sl-color-hairline);
  background: var(--sl-color-bg);
  color: var(--sl-color-text);
  cursor: pointer;
  font: inherit;
  line-height: 1.5;
  transition: background-color 0.15s ease, border-color 0.15s ease;
}

.quiz-option:hover:not(:disabled) {
  border-color: var(--sl-color-accent);
  background: var(--sl-color-gray-6);
}

.quiz-option:disabled {
  cursor: default;
}

.quiz-option--correct {
  border-color: var(--sl-color-green);
  background: color-mix(in srgb, var(--sl-color-green) 18%, var(--sl-color-bg));
  color: var(--sl-color-text);
}

.quiz-option--incorrect {
  border-color: var(--sl-color-red);
  background: color-mix(in srgb, var(--sl-color-red) 18%, var(--sl-color-bg));
  color: var(--sl-color-text);
}

.quiz-result {
  margin-top: 0.6rem;
  font-weight: 600;
  min-height: 1.2em;
}

.quiz-result--correct {
  color: var(--sl-color-green-high, var(--sl-color-green));
}

.quiz-result--incorrect {
  color: var(--sl-color-red-high, var(--sl-color-red));
}

.quiz-explain {
  display: none;
  margin-top: 0.6rem;
  padding: 0.7rem 0.9rem;
  border-radius: 8px;
  background: var(--sl-color-gray-6);
  font-size: 0.92em;
}

.quiz-card--answered .quiz-explain {
  display: block;
}

.quiz-reset-all {
  margin-top: 0.5rem;
  padding: 0.5rem 1.2rem;
  border-radius: 8px;
  border: 1px solid var(--sl-color-hairline);
  background: var(--sl-color-bg-nav);
  color: var(--sl-color-text);
  cursor: pointer;
  font: inherit;
}

.quiz-reset-all:hover {
  border-color: var(--sl-color-accent);
}
</style>

<script>
(function () {
  function initQuiz() {
    var cards = document.querySelectorAll('.quiz-card');
    var scoreEl = document.getElementById('quiz-score');
    var resetAllBtn = document.getElementById('quiz-reset-all');

    function updateScore() {
      if (!scoreEl) return;
      var correctCount = document.querySelectorAll('.quiz-card--answered[data-was-correct="true"]').length;
      scoreEl.textContent = 'ענית נכון על ' + correctCount + ' מתוך ' + cards.length;
    }

    function answerCard(card, chosenBtn) {
      var correct = card.getAttribute('data-answer');
      var chosen = chosenBtn.getAttribute('data-choice');
      var isCorrect = chosen === correct;

      card.classList.add('quiz-card--answered');
      card.setAttribute('data-was-correct', isCorrect ? 'true' : 'false');

      var options = card.querySelectorAll('.quiz-option');
      options.forEach(function (opt) {
        opt.disabled = true;
        if (opt.getAttribute('data-choice') === correct) {
          opt.classList.add('quiz-option--correct');
        } else if (opt === chosenBtn) {
          opt.classList.add('quiz-option--incorrect');
        }
      });

      var result = card.querySelector('.quiz-result');
      if (result) {
        result.textContent = isCorrect ? '✅ נכון!' : '❌ לא נכון - התשובה הנכונה מסומנת בירוק.';
        result.classList.remove('quiz-result--correct', 'quiz-result--incorrect');
        result.classList.add(isCorrect ? 'quiz-result--correct' : 'quiz-result--incorrect');
      }

      updateScore();
    }

    function resetCard(card) {
      card.classList.remove('quiz-card--answered');
      card.removeAttribute('data-was-correct');
      var options = card.querySelectorAll('.quiz-option');
      options.forEach(function (opt) {
        opt.disabled = false;
        opt.classList.remove('quiz-option--correct', 'quiz-option--incorrect');
      });
      var result = card.querySelector('.quiz-result');
      if (result) {
        result.textContent = '';
        result.classList.remove('quiz-result--correct', 'quiz-result--incorrect');
      }
    }

    cards.forEach(function (card) {
      card.querySelectorAll('.quiz-option').forEach(function (btn) {
        btn.addEventListener('click', function () {
          if (card.classList.contains('quiz-card--answered')) return;
          answerCard(card, btn);
        });
      });
    });

    if (resetAllBtn) {
      resetAllBtn.addEventListener('click', function () {
        cards.forEach(resetCard);
        updateScore();
      });
    }

    updateScore();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initQuiz);
  } else {
    initQuiz();
  }
})();
</script>
