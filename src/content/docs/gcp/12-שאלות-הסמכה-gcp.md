---
title: "שאלות קשות ברמת הסמכה (GCP Associate Cloud Engineer)"
category: GCP
part: 12/10
---

מבחן אינטראקטיבי ברמת קושי גבוהה, בסגנון שאלות הסמכת **Google Cloud Certified – Associate Cloud Engineer** (עם גוון של Professional Cloud Architect בשאלות המורכבות ביותר) - בניגוד למבחן החזרה הכללי בפרק הקודם, כאן כל שאלה בודקת נקודה עדינה ומטעה שדורשת הבנה אמיתית של מנגנוני הפנים של GCP (IAM Inheritance, רשתות, Storage Classes, סוגי חישוב ועוד), לא רק שינון. בחרו תשובה ותקבלו מיד משוב עם הסבר מפורט.

<div id="quiz-score" class="quiz-score">ענית נכון על 0 מתוך 10</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>1. הגדרתם ב-Organization בינדינג IAM שמעניק ל-Group מסוים תפקיד <code>roles/viewer</code>. מנהל של Project ספציפי מתחת לאותו Organization רוצה למנוע מאותה קבוצה כל גישה לפרויקט שלו, פשוט על ידי כך שהוא לא מוסיף לה שום Role ברמת הפרויקט. האם זה יעבוד?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. כן - כל בינדינג ברמה נמוכה יותר גובר אוטומטית על בינדינג שהוגדר ברמה גבוהה יותר בהיררכיה</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. לא - הרשאת IAM שניתנה ברמה גבוהה (Organization/Folder) יורשת אוטומטית לכל מה שמתחתיה, ואי אפשר "לצמצם" אותה סתם על ידי אי-הוספת Role ברמה נמוכה יותר; כדי לחסום זאת במפורש נדרש שימוש בפיצ'ר ייעודי בשם IAM Deny Policy</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. כן, אבל רק אם המנהל של הפרויקט מחזיק בתפקיד <code>roles/owner</code></button>
    <button class="quiz-option" type="button" data-choice="ד">ד. ההרשאה מתאפסת אוטומטית בכל מעבר בין Folder ל-Project</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> זו אחת הנקודות המבלבלות ביותר במבחן ה-ACE - מדיניות IAM ב-GCP היא Additive בלבד לאורך ההיררכיה. הרשאה שניתנה ב-Organization או ב-Folder ממשיכה לחול על כל ה-Projects וה-Resources מתחתיה בלי קשר למה שמוגדר (או לא מוגדר) ברמה הנמוכה יותר. אי-הוספת Role ברמת הפרויקט לא "מבטלת" הרשאה שכבר ניתנה למעלה. הדרך היחידה לחסום במפורש גישה שניתנה ברמה גבוהה יותר היא שימוש ב-IAM Deny Policies - מנגנון נפרד מ-Allow Policies הרגילות.</div>
</div>

<div class="quiz-card" data-answer="ג">
  <p class="quiz-question"><strong>2. צוות פיתוח בנה שירות HTTP סטטלס בקונטיינר יחיד, עם תעבורה שמשתנה בחדות במהלך היום ולעיתים יורדת לאפס בלילה. הצוות רוצה למזער תקורת תפעול (בלי לנהל שרתים או Clusters) ולשלם רק על זמן עיבוד בפועל. מה הפתרון המתאים ביותר?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. Compute Engine עם Managed Instance Group ו-Autoscaling מבוסס CPU</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. GKE Standard עם Horizontal Pod Autoscaler ומספר Node מינימלי קבוע</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. Cloud Run - שירות Serverless מנוהל לחלוטין להרצת קונטיינרים, שתומך ב-Scale to Zero וגובה תשלום לפי זמן עיבוד בפועל בלבד, בלי צורך בניהול Clusters או VMs כלל</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. Compute Engine עם VM יחיד קבוע שרץ 24/7 בגודל מקסימלי כדי לספוג את שיא התעבורה</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> כשהדרישה היא מזעור תקורת ניהול תשתית לצד תשלום אך ורק על שימוש בפועל (כולל ירידה לאפס), Cloud Run הוא הבחירה הטבעית - אין VMs לנהל, אין Cluster לתחזק, וההרשאות/הרשת מוגדרות ברמת השירות. GKE מתאים כשצריך שליטה עדינה יותר באורקסטרציה (למשל מספר קונטיינרים מתואמים, StatefulSets, רשתות מורכבות), ו-Compute Engine מתאים כשצריך שליטה מלאה על מערכת ההפעלה או עומסים שלא מתאימים לקונטיינרים.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>3. הגדרתם VPC Peering בין Project A ל-Project B, וגם VPC Peering נפרד בין Project B ל-Project C. האם משאב ב-Project A יכול לתקשר עם משאב ב-Project C דרך הרשת הפרטית, בזכות ה-Peering המשותף עם B?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. כן - VPC Peering הוא Transitive: אם A מחובר ל-B ו-B מחובר ל-C, אז A מגיע אוטומטית גם ל-C</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. לא - VPC Peering הוא Non-Transitive: כל Peering הוא קשר ישיר בין שתי רשתות בלבד, ו-A ו-C לא יכולים לתקשר זה עם זה דרך B; כדי לחבר אותם צריך Peering ישיר נוסף ביניהם, או לעבור למודל אחר כמו Shared VPC</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. כן, אך רק אם שלושת הפרויקטים משתייכים לאותו Organization</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. לא ניתן להגדיר יותר מ-VPC Peering אחד לכל פרויקט בכלל</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> אי-הטרנזיטיביות (Non-Transitivity) של VPC Peering היא אחת השאלות הקלאסיות במבחן ה-ACE. בניגוד ל-Shared VPC (שבו פרויקט מארח אחד מספק רשת ותת-רשתות משותפות למספר Service Projects תחת ניהול מרכזי), VPC Peering מחבר כל פעם רק שני VPCs נפרדים באופן ישיר, וכל רשת שומרת על ניהול עצמאי משלה. אם צריך שכל הפרויקטים יתקשרו ביניהם דרך רשת מרכזית אחת, הפתרון הנכון הוא Shared VPC ולא שרשרת של Peerings.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>4. מהן ה-Implied Firewall Rules שקיימות אוטומטית בכל VPC גם ללא הגדרת אף Rule מפורש, ומה משמעות מספר Priority נמוך יותר?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. כל תעבורה נכנסת ויוצאת חסומה כברירת מחדל, ו-Priority גבוה יותר במספר תמיד גובר על Priority נמוך</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. קיימת Implied Allow לתעבורה יוצאת (Egress) ו-Implied Deny לתעבורה נכנסת (Ingress), שתיהן ב-Priority הנמוך ביותר האפשרי (65535); ככל שמספר ה-Priority של Rule מפורש נמוך יותר, כך הוא נאכף קודם וגובר על Rule עם מספר גבוה יותר</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. יש Implied Allow גם לתעבורה נכנסת וגם יוצאת, ולכן אין צורך להגדיר Firewall Rules כלל בפרויקט חדש</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. ה-Priority נקבע אוטומטית לפי סדר יצירת ה-Rule בקונסולה ולא ניתן לשנות אותו לעולם</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> בכל VPC קיימות שתי Implied Rules שאי אפשר למחוק: Allow לכל תעבורה יוצאת (Egress) ו-Deny לכל תעבורה נכנסת (Ingress), שתיהן ב-Priority 65535 - העדיפות הנמוכה ביותר האפשרית. משמעות זה שכל Rule מפורש שתגדירו (ברירת מחדל Priority 1000, טווח אפשרי 0-65535) יגבר עליהן. חשוב לזכור שב-Firewall Rules, ככל שהמספר נמוך יותר כך העדיפות גבוהה יותר - בדיוק הפוך מהאינטואיציה הראשונית של רבים.</div>
</div>

<div class="quiz-card" data-answer="ג">
  <p class="quiz-question"><strong>5. העליתם קובץ ל-Bucket תחת Storage Class מסוג Coldline, ומחקתם אותו לאחר 20 יום בלבד. מה ההשלכה מבחינת חיוב?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. לא תחויבו כלל, כי המחיקה מתבצעת באופן מיידי בענן</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. תחויבו רק על 20 הימים שבהם הקובץ אכן היה קיים בפועל, ולא יותר</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. ל-Coldline יש Minimum Storage Duration של 90 יום - מחיקה או שינוי Storage Class לפני שחלפו 90 יום עדיין גוררים חיוב עבור יתרת הימים עד ל-90, גם אם הקובץ כבר לא קיים בפועל ב-Bucket</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. Coldline אוסר לחלוטין מחיקת אובייקטים לפני שחלפו 365 יום</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> ל-Storage Classes שאינם Standard יש Minimum Storage Duration: 30 יום ל-Nearline, 90 יום ל-Coldline, ו-365 יום ל-Archive. מחיקה, החלפת תוכן, או שינוי Storage Class של אובייקט לפני שחלף פרק הזמן המינימלי גוררים חיוב על יתרת הימים עד לסף, גם אם הנתונים כבר לא קיימים בפועל. זו נקודה קריטית בתכנון מדיניות Lifecycle - מעבר מוקדם מדי בין Classes עלול לייקר את העלות במקום לחסוך.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>6. אפליקציית E-commerce צריכה לבצע עסקאות תכופות (יצירת הזמנה, עדכון מלאי) בזמן אמת עם Consistency חזקה ברמת שורה בודדת, ובמקביל צוות ה-BI רוצה להריץ שאילתות אנליטיות מורכבות על מיליארדי רשומות היסטוריות. מה השילוב הנכון?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. BigQuery לשני הצרכים גם יחד - גם לעסקאות התכופות וגם לאנליטיקה, כי הוא מותאם לכל סוגי העומסים באותה מידה</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. Cloud SQL (מסד רלציוני מנוהל, מותאם OLTP) עבור העסקאות התכופות ברמת שורה, ו-BigQuery (מחסן נתונים טורי, Serverless, מותאם OLAP) עבור השאילתות האנליטיות על נפחי נתונים גדולים - תבנית נפוצה היא Streaming/ETL מ-Cloud SQL אל BigQuery</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. Cloud SQL לשני הצרכים גם יחד, כי הוא תומך בעומסי אנליטיקה כבדים באותה יעילות כמו BigQuery</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. אין הבדל מהותי בין Cloud SQL ל-BigQuery - שניהם מתאימים באותה מידה לכל סוג עומס</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> Cloud SQL הוא מסד נתונים רלציוני מנוהל (MySQL/PostgreSQL/SQL Server) המותאם לעומסי OLTP - עסקאות תכופות, קצרות, ברמת שורה בודדת, עם Consistency חזקה. BigQuery הוא מחסן נתונים טורי (Columnar) ו-Serverless המותאם לעומסי OLAP - סריקות מסיביות על נפחי נתונים עצומים, לא לעדכוני שורה בודדת בתדירות גבוהה. ניסיון להשתמש ב-BigQuery כתחליף למסד OLTP תכוף-עדכונים ייתקל במגבלות DML וגם יהיה יקר ואיטי יחסית לצורך הזה.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>7. יצרתם VM חדש ב-Compute Engine ולא בחרתם Service Account ייעודי, כך שהמערכת שייכה לו את ה-Default Compute Engine Service Account. מהו הסיכון האבטחתי המרכזי הכרוך בכך שרבים מפספסים?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. ל-Default Service Account אין שום הרשאות, ולכן ה-VM כלל לא יוכל לגשת ל-GCP APIs</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. ה-Default Service Account מקבל היסטורית תפקיד <code>roles/editor</code> רחב על הפרויקט כברירת מחדל, כך שכל תהליך שרץ על ה-VM (וכל מי שמצליח להריץ קוד או להתחבר אליו) עלול לרשת הרשאות רחבות בהרבה ממה שהתהליך צריך בפועל</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. Default Service Account תקף ל-24 שעות בלבד ולאחר מכן מתבטל אוטומטית מעצמו</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. אי אפשר להשתמש כלל ב-VM עם Default Service Account לצורך קריאה ל-GCP APIs</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> זו נקודת אבטחה שמופיעה שוב ושוב במבחן - ה-Default Service Account שנוצר אוטומטית לפרויקט זוכה היסטורית ל-<code>roles/editor</code>, תפקיד רחב מאוד. אם VM (או שירות אחר) פועל עם ה-SA הזה בלי לצמצם את ה-Scopes וההרשאות, כל פרצת אבטחה באפליקציה עלולה להעניק לתוקף הרשאות עריכה נרחבות בפרויקט כולו. Best Practice מקובל הוא ליצור User-managed Service Account ייעודי עם הרשאות מינימליות לכל עומס עבודה, ולהימנע משימוש ב-Default Service Account בסביבת פרודקשן.</div>
</div>

<div class="quiz-card" data-answer="א">
  <p class="quiz-question"><strong>8. מה ההבדל המרכזי מבחינת מגבלת זמן ריצה בין Preemptible VM ה"ישן" ל-Spot VM החדש יותר, ומה משותף לשניהם?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. ל-Preemptible VM יש הגבלת ריצה מקסימלית של 24 שעות רצופות שלאחריהן הוא מסתיים אוטומטית, בעוד ל-Spot VM אין הגבלת 24 שעות קבועה - אך שניהם עדיין עלולים להיפסק בכל רגע ע"י Google עם התראה של כ-30 שניות בלבד, וללא SLA זמינות</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. לשניהם יש בדיוק אותה הגבלה של 24 שעות ריצה, ואין שום הבדל מעשי ביניהם</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. Spot VM מובטח לרוץ ברציפות ללא כל הפרעה כל עוד משלמים עליו את המחיר המלא (On-Demand)</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. Preemptible VM תומך ב-Live Migration בין שרתים פיזיים, בניגוד ל-Spot VM שאינו תומך בכך</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> Preemptible VMs (הדגם המקורי) מוגבלים תמיד ל-24 שעות ריצה רצופות ומסתיימים אוטומטית בתום הזמן הזה, בנוסף לאפשרות שיופסקו מוקדם יותר. Spot VMs (הדגם המודרני) הסירו את מגבלת ה-24 השעות הקבועה, אך עדיין ניתנים להפסקה בכל רגע לפי צרכי הקיבולת של Google, עם התראה קצרה של כ-30 שניות בלבד, ושניהם ללא SLA זמינות ובלי Live Migration. שני הדגמים מתאימים לעומסי Batch/Fault-Tolerant בלבד, לא לעומסים רציפים קריטיים.</div>
</div>

<div class="quiz-card" data-answer="א">
  <p class="quiz-question"><strong>9. מהי מגבלה מרכזית שכדאי לדעת לגבי Custom IAM Roles ב-GCP?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. ניתן לכלול ב-Custom Role רק הרשאות (Permissions) שמסומנות כתומכות ביצירת Custom Roles - לא כל ה-Permissions הקיימים בשירותי GCP השונים זמינים לשימוש בתפקיד מותאם אישית</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. Custom Role יכול לכלול אך ורק הרשאות קריאה (Viewer), ולעולם לא הרשאות כתיבה או מחיקה</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. אי אפשר ליצור יותר מ-Custom Role אחד בודד לכל Project</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. Custom Roles זמינים אך ורק ברמת Organization, ולא ניתן ליצור אותם ברמת Project</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> בניגוד לתפיסה נפוצה, לא כל Permission שקיים ב-GCP זמין לשימוש בתוך Custom Role - Google מסמנת כל Permission כתומך או לא-תומך ביצירת תפקידים מותאמים אישית, ורשימת ההרשאות הזמינות משתנה בין השירותים. Basic Roles (Owner/Editor/Viewer) נשארים רחבים מדי לפרודקשן, Predefined Roles מכסים את רוב הצרכים המדויקים לכל שירות, ו-Custom Roles מאפשרים דיוק מירבי - אך רק בתוך מסגרת ההרשאות שגוגל אישרה לכך, וניתן ליצור אותם הן ברמת Project והן ברמת Organization.</div>
</div>

<div class="quiz-card" data-answer="ג">
  <p class="quiz-question"><strong>10. אפליקציה עם משתמשים גלובליים פרוסה ב-Backend Services בכמה Regions שונים (למשל <code>us-central1</code> ו-<code>europe-west3</code>). אתם רוצים שכל משתמש יגיע אוטומטית ל-Backend הקרוב אליו גיאוגרפית, תחת כתובת IP אחת גלובלית. איזה סוג Load Balancer מתאים?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. Regional External Load Balancer, שכן הוא היחיד שתומך ב-Backends הפרוסים במספר Regions שונים</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. Internal TCP/UDP Load Balancer, כי הוא היחיד שתומך בכתובת Anycast IP</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. Global External HTTP(S) Load Balancer - משתמש בכתובת Anycast IP גלובלית אחת ומנתב כל בקשה ל-Backend הקרוב ביותר מבין ה-Regions השונים דרך רשת השדרה הגלובלית של Google; לעומתו Load Balancer אזורי (Regional) מוגבל מטבעו ל-Region בודד</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. אין שום הבדל מעשי בין Load Balancer גלובלי לאזורי ב-GCP - שניהם תומכים באותה מידה במספר Regions</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> Global External HTTP(S) Load Balancer מוקצה כתובת Anycast IP אחת גלובלית, ומאפשר לנתב כל בקשה נכנסת אל ה-Backend הקרוב ביותר מבין כמה Regions, תוך ניצול רשת השדרה הפרטית של Google להאצת התעבורה. לעומתו, Load Balancers אזוריים (כמו Regional Network Load Balancer או Internal Load Balancer) פועלים בתוך Region בודד בלבד, ואינם מתאימים כפתרון יחיד לפריסה גלובלית מרובת אזורים.</div>
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
