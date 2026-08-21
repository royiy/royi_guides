---
sidebar_position: 12
title: "VMware #12 — שאלות קשות ברמת הסמכה (VCP-DCV)"
---

מבחן אינטראקטיבי ברמת קושי גבוהה, בסגנון שאלות הסמכת **VMware Certified Professional – Data Center Virtualization (VCP-DCV)** - בניגוד למבחן החזרה הכללי בפרק הקודם, כאן כל שאלה בודקת נקודה עדינה ומטעה שדורשת הבנה אמיתית של מנגנוני הפנים של vSphere (HA, DRS, vSAN, Networking, Storage ועוד), לא רק שינון. בחרו תשובה ותקבלו מיד משוב עם הסבר מפורט.

<div id="quiz-score" class="quiz-score">ענית נכון על 0 מתוך 10</div>

<div class="quiz-card" data-answer="ג">
  <p class="quiz-question"><strong>1. מהו ההבדל המרכזי בין מדיניות Admission Control מסוג <code>Cluster Resource Percentage</code> לבין <code>Slot Policy</code> ב-vSphere HA?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. אין הבדל מעשי - שתי המדיניות מחשבות תמיד את אותה כמות משאבים שמורים</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. <code>Slot Policy</code> מיועדת רק ל-clusters עם פחות משלושה Hosts, ואילו <code>Percentage</code> מיועדת ל-clusters גדולים בלבד</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. <code>Slot Policy</code> מחשבת "סלוט" בגודל אחיד לפי ה-VM עם ה-Reservation הגבוה ביותר (CPU/Memory), כך שכל ה-VMs "עגולים" לסלוט הזה - מה שעלול לבזבז משאבים ב-clusters לא הומוגניים; <code>Percentage</code> שומרת אחוז קבוע מסך משאבי ה-cluster ומתחשבת בגודל האמיתי של כל VM</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. <code>Percentage</code> מתאימה רק כאשר מוגדר Dedicated Failover Host, ואילו <code>Slot Policy</code> לא תומכת בכך כלל</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> ב-<code>Slot Policy</code>, HA מחשב גודל "סלוט" בודד לפי ה-Reservation הגבוה ביותר שהוגדר לכל VM ב-cluster (אם אין Reservation, נלקח ערך ברירת מחדל קטן). כל VM "תופס" סלוט שלם אחד, גם אם בפועל הוא צריך הרבה פחות - ולכן VM יחיד עם Reservation גבוה במיוחד יכול "לנפח" את גודל הסלוט ולצמצם דרמטית את מספר הסלוטים הפנויים ב-cluster (תופעה הידועה כ-"Slot Size Fragmentation"). לעומת זאת, <code>Cluster Resource Percentage</code> פשוט שומרת אחוז קבוע (למשל 25%) מכלל ה-CPU/Memory של ה-cluster לצורך Failover, ומתחשבת בצריכה האמיתית של כל VM - לכן היא בדרך כלל מדויקת ויעילה יותר ב-clusters עם VMs בגדלים שונים.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>2. מוגדר DRS Affinity Rule מסוג VM-VM עם הערך <code>Must run on hosts in group</code> (Required), אך בשלב מסוים כל ה-Hosts בקבוצה נכנסים ל-Maintenance Mode או נכשלים. מה יקרה ל-VMs המושפעים?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. DRS יתעלם באופן זמני מהכלל וירוץ את ה-VMs על Host אחר כלשהו כדי לשמור על זמינות</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. מדובר בכלל "מחייב" (Required/Must) - DRS ו-HA לעולם לא יפרו אותו, ולכן ה-VMs לא יופעלו מחדש על Host מחוץ לקבוצה, גם אם המשמעות היא שהם יישארו כבויים</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. הכלל מתבטל אוטומטית ברגע שאין Host זמין בקבוצה</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. vCenter ימחק את ה-VMs מהאשכול באופן אוטומטי</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> ההבדל הקריטי בין כללי <code>Should</code> (העדפה) לבין כללי <code>Must</code> (Required) הוא שכללי <code>Should</code> ניתנים להפרה בנסיבות חריגות (למשל כדי לשמור על זמינות VM), בעוד כללי <code>Must</code> נאכפים באופן מוחלט - הן על ידי DRS והן על ידי HA - ולעולם לא מופרים, אפילו במחיר של השבתת ה-VM. זו הסיבה שב-VMware ממליצים בזהירות רבה על שימוש בכללי Required, ורק כשיש סיבה עסקית/רישוי מחייבת (למשל הפרדת רישוי חובה בין VMs).</div>
</div>

<div class="quiz-card" data-answer="ד">
  <p class="quiz-question"><strong>3. אילו מהמשפטים הבאים לגבי דרישות ה-Storage ל-vMotion רגיל (ללא Storage vMotion) הוא הנכון ביותר?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. vMotion רגיל דורש בהכרח Shared Storage בין ה-Hosts, ולכן אף פעם אינו אפשרי עם Local Storage בלבד</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. vMotion רגיל תמיד מעביר גם את קבצי הדיסק של ה-VM, ולכן אינו זקוק כלל לחיבור רשת בין ה-Hosts</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. vMotion רגיל אפשרי רק בין Hosts המחוברים לאותו vCenter ולאותו Datastore בו-זמנית, ואין לכך שום חלופה</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. באמצעות vMotion ללא Shared Storage (הידוע גם כ-Unified vMotion, המשלב את מנגנוני Storage vMotion), ניתן להעביר VM חי גם כאשר הדיסקים יושבים על Local Storage - אך זהו תרחיש שונה מ-vMotion ה"קלאסי" שדורש Shared Storage כדי להעביר רק את מצב הזיכרון/המעבד</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> vMotion ה"קלאסי" מעביר רק את מצב הזיכרון, ה-CPU וה-Device State של ה-VM בין Hosts, ומניח שה-VM נשאר על אותו Datastore המשותף (Shared Storage) לשני ה-Hosts. עם זאת, מאז vSphere 5.1 קיימת יכולת המשלבת את מנגנוני vMotion ו-Storage vMotion יחד (לעיתים מכונה "vMotion without shared storage"), המאפשרת גם להעביר VM שדיסקיו יושבים על Local Storage - במקרה כזה גם הדיסקים "עוברים" את הרשת אל ה-Host היעד. חשוב להבדיל בין שני התרחישים: ל-HA (בניגוד ל-vMotion הקלאסי) יש דרישה מובנית ל-Shared Storage או vSAN, כי הפעלה מחדש של VM לאחר כשל Host מחייבת שהדיסקים יהיו נגישים גם ל-Host החדש.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>4. ב-vSAN, מוגדרים 3 Fault Domains עם Failures To Tolerate (FTT) = 1 במדיניות RAID-1 (Mirroring). מה המשמעות המעשית מבחינת עמידות בפני כשל?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. vSAN יכול לשרוד כשל בו-זמני של שני Fault Domains שלמים מבלי לאבד גישה לנתונים</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. הנתונים משוכפלים לשני Fault Domains שונים (2 עותקים) בתוספת רכיב Witness בשלישי, כך שהאשכול יכול לשרוד כשל של Fault Domain אחד בלבד (או Host בודד בתוכו) מבלי לאבד גישה לנתונים</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. FTT=1 דורש לפחות 5 Fault Domains כדי לפעול בכלל</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. Fault Domains משפיעים רק על ביצועים ואינם קשורים כלל לעמידות בפני כשל</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> Fault Domains ב-vSAN מאפשרים להגדיר קיבוץ לוגי של Hosts (למשל לפי Rack פיזי), כך ש-vSAN יפזר את העותקים המשוכפלים בין Fault Domains שונים ולא רק בין Hosts בודדים - זה מגן גם מפני כשל של Rack שלם (כגון אובדן חשמל או Switch משותף). עם FTT=1 ומדיניות RAID-1, vSAN שומר 2 עותקי נתונים זהים בשני Fault Domains שונים, בתוספת רכיב Witness (קוורום) בשלישי כדי למנוע Split-Brain. המשמעות: האשכול שורד כשל של Fault Domain אחד בלבד (FTT=1 = יכולת לשרוד כשל בודד); כדי לשרוד שני כשלים בו-זמנית יש צורך ב-FTT=2, שדורש לפחות 5 Fault Domains.</div>
</div>

<div class="quiz-card" data-answer="ג">
  <p class="quiz-question"><strong>5. מהו היתרון הארכיטקטוני המרכזי של Distributed Switch (VDS) על פני Standard Switch (VSS) שנבחן לרוב במבחן ההסמכה?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. VDS תמיד מהיר יותר בביצועי רשת גולמיים (Throughput) מ-VSS באותו חומרה</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. VDS זמין בכל רמות הרישוי של vSphere, ואילו VSS דורש רישוי Enterprise Plus</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. VDS מספק ניהול מרוכז ברמת ה-vCenter (Data Plane מבוזר אך Control/Management Plane מרכזי) לכל ה-Hosts באשכול, ומאפשר תכונות מתקדמות כמו Network I/O Control, Port Mirroring ו-LACP - בעוד VSS מוגדר ומנוהל בנפרד על כל Host</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. VSS תומך ב-vMotion, ואילו VDS אינו תומך בכך כלל</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> ב-VSS כל Host מנהל את הגדרות הרשת שלו (Port Groups, VLANs, Teaming) באופן עצמאי לחלוטין - כל שינוי חייב להתבצע (או לפחות להיות מסונכרן ידנית/בסקריפט) על כל Host בנפרד, מה שיוצר סיכון לאי-עקביות. VDS, לעומת זאת, מוגדר פעם אחת ברמת vCenter ומופץ אוטומטית לכל ה-Hosts המצורפים אליו, ומאפשר יכולות שלא קיימות ב-VSS כלל: Network I/O Control (הקצאת רוחב פס לפי סוגי תעבורה), Port Mirroring, NetFlow, ו-LACP מובנה. שים לב ש-VDS דורש רישוי Enterprise Plus (או מקביל), ולא ההפך.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>6. שני VMs באותו Resource Pool מתחרים על CPU בזמן מחסור במשאבים (Contention) ברמת ה-Host. ל-VM1 יש <code>Shares</code> גבוה משמעותית מ-VM2, אך שניהם ללא Reservation או Limit. מה יקרה?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. שני ה-VMs יקבלו תמיד בדיוק אותה כמות CPU, כי Shares משפיעים רק כאשר יש Reservation מוגדר</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. VM1 יקבל נתח גדול יותר יחסית ממשאבי ה-CPU בזמן התחרות בפועל, ביחס ישר ליחס ה-Shares בין השניים; אך אם אין כלל מחסור (Contention) - שני ה-VMs יכולים לקבל כמה CPU שהם דורשים ללא הגבלה</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. Shares משפיעים על עדיפות בזמן הפעלה (Boot) בלבד, ואינם משפיעים על הקצאת CPU בזמן ריצה</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. VM עם Shares גבוה יותר יקבל תמיד CPU בלתי מוגבל, ללא קשר למצב שאר ה-VMs באשכול</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> נקודה קריטית שנבחנת לעיתים קרובות: <code>Shares</code> קובעים עדיפות יחסית ופועלים <strong>רק</strong> כאשר יש בפועל תחרות (Contention) על משאב מוגבל - הם קובעים את היחס שלפיו מחולק המשאב המחסור בין הצדדים המתחרים. <code>Reservation</code> מבטיחה כמות מינימלית מובטחת של משאב גם בתחרות, ו-<code>Limit</code> קובעת תקרה מקסימלית שלא ניתן לחצות גם כשיש עודף משאבים פנויים. כאשר אין מחסור בפועל, VMs יכולים לצרוך משאבים מעבר לחלק היחסי שלהם לפי Shares - ה-Shares "נכנסים לתמונה" רק ברגע שהמשאב הופך למוגבל.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>7. מדוע Snapshot שנשאר פעיל לאורך זמן ארוך (ימים/שבועות) על VM עם עומס כתיבה גבוה לדיסק נחשב מסוכן לביצועים ולקיבולת האחסון?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. Snapshot מקפיא את ה-VM לחלוטין כל עוד הוא קיים, כך שאין בכלל כתיבה נוספת לדיסק</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. לאחר יצירת Snapshot, כל כתיבה חדשה מופנית לקובץ Delta (מבוסס redo-log) ולא לדיסק הבסיס - ככל שעובר זמן רב יותר, קובץ ה-Delta גדל ומצטבר לשרשרת ארוכה של Snapshots, מה שמאט קריאות/כתיבות (בשל הצורך לעבור בשרשרת) ועלול לצרוך שטח אחסון גדול עד לגלישה מלאה (Datastore Full) בעת ניסיון Consolidate</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. Snapshot מוחק אוטומטית קבצים ישנים מהדיסק הבסיס כדי לפנות מקום</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. אין שום השפעה על ביצועים - Snapshots משפיעים אך ורק על זמן ה-Boot של ה-VM</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> ברגע שנוצר Snapshot, הדיסק הבסיס (Base Disk) הופך לקריאה-בלבד וכל כתיבה חדשה מנותבת לקובץ Delta נפרד. ככל שה-Snapshot חי זמן רב יותר עם כתיבה מתמשכת, קובץ ה-Delta גדל בהתמדה (ולעיתים נוצרת שרשרת של כמה Snapshots זה על גבי זה) - מה שגורם ל-I/O Overhead משמעותי, שכן קריאה עשויה להצטרך לעבור דרך כמה שכבות בשרשרת עד שהיא מוצאת את הבלוק המבוקש. בנוסף, אם קובץ ה-Delta גדל עד שהוא ממלא את ה-Datastore, פעולת מחיקת ה-Snapshot (Consolidate) עלולה להיכשל בעצמה. משום כך VMware ממליצה במפורש לא להשאיר Snapshots פעילים מעבר לזמן קצר (שעות ספורות, ולא ימים).</div>
</div>

<div class="quiz-card" data-answer="ג">
  <p class="quiz-question"><strong>8. מהו תפקידו של ה-Platform Services Controller (PSC) בארכיטקטורת vCenter Server (בגרסאות שבהן הוא רכיב נפרד/מובחן), ומה ההבדל בין Embedded ל-External?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. PSC אחראי אך ורק על אחסון קבצי Log של vCenter, ואין לו קשר לאימות משתמשים</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. PSC הוא רכיב המיועד לניהול רישיונות בלבד, וההבדל בין Embedded ל-External הוא רק מיקום קובץ הרישיון</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. PSC מרכז שירותי תשתית כגון Single Sign-On (SSO), ניהול תעודות (VMCA) ורישוי; במצב Embedded הוא יושב על אותו שרת כמו vCenter (מומלץ כברירת מחדל בגרסאות מודרניות), ואילו במצב External הוא רץ כשרת נפרד שיכול לשרת כמה vCenters (טופולוגיה שדורשת תכנון קפדני, ונתמכת רק בגרסאות ישנות יותר)</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. PSC הוחלף לגמרי בגרסאות ישנות של vCenter על ידי vCenter Server Appliance, וב-vCenter מודרני הוא אינו קיים ולא היה קיים אף פעם</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> ה-PSC ריכז שירותי תשתית משותפים: Single Sign-On (SSO), ניהול תעודות דרך VMware Certificate Authority (VMCA), ורישוי. בטופולוגיית External PSC, אפשר היה להריץ PSC בודד שמשרת כמה vCenter Servers (שימושי בפריסות רב-אתריות גדולות), אך זה הוסיף מורכבות תפעולית ונקודת כשל פוטנציאלית. משום כך, כבר משנים אחדות VMware הפכה את Embedded PSC (שבו שירותי ה-PSC רצים באותו Node כמו vCenter עצמו) לארכיטקטורה המומלצת והיחידה הנתמכת בגרסאות חדשות, וטופולוגיית External PSC הופסקה (Deprecated/Removed) בגרסאות מודרניות של vSphere.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>9. מה המטרה המרכזית של Enhanced vMotion Compatibility (EVC), ומתי חובה להפעיל אותו?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. EVC נועד להאיץ את מהירות ה-vMotion באמצעות דחיסת נתונים ברשת, וכדאי להפעיל אותו תמיד ללא תלות בחומרה</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. EVC "מיישר" (Masks) את סט הפקודות (Instruction Set) של ה-CPU שנחשף ל-VMs לרמה המשותפת הנמוכה ביותר בין כל ה-Hosts באשכול, כדי לאפשר vMotion חי בין Hosts עם דורות מעבדים שונים (Heterogeneous Cluster) - חובה כאשר משלבים באשכול Hosts עם מעבדים מדורות/יצרנים שונים ורוצים לשמר יכולת vMotion חלקה ביניהם</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. EVC נדרש רק כאשר כל ה-Hosts באשכול זהים לחלוטין מבחינת דור המעבד</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. EVC הוא תכונה של vSAN בלבד ואין לה קשר ל-vMotion או ל-DRS</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> vMotion חי דורש שסט הפקודות של ה-CPU שנחשף לגסט (Guest) יהיה תואם בין Host המקור ל-Host היעד - אחרת ה-Migration עלול להיכשל או לגרום לקריסת ה-Guest OS שמצפה לפקודות מעבד שאינן קיימות ביעד. EVC פותר זאת על ידי הגבלת (Masking) הפיצ'רים שנחשפים ל-VMs לקבוצת המשותף הנמוך ביותר בין כל דורות המעבדים באשכול, כך שמבחינת ה-VM כל ה-Hosts "נראים" עם אותו סט פקודות בסיסי. EVC נדרש בפועל כשמשלבים Hosts עם דורות מעבד שונים (למשל דור ישן יחד עם דור חדש יותר) באותו Cluster ורוצים לאפשר vMotion (וב-DRS אוטומטי) בין כולם ללא מגבלות תאימות.</div>
</div>

<div class="quiz-card" data-answer="ג">
  <p class="quiz-question"><strong>10. מהו ההבדל המרכזי במנגנון ה-Locking (נעילה) בין Datastore מסוג VMFS לבין Datastore מסוג NFS, שרלוונטי בעיקר בתרחישי גישה משותפת של כמה Hosts לאותו קובץ VM?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. אין שום הבדל - שני סוגי ה-Datastore משתמשים באותו מנגנון נעילה בדיוק, המנוהל אך ורק על ידי ה-Guest OS</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. VMFS משתמש בנעילה ברמת ה-NFS Server בלבד, ואילו NFS משתמש ב-SCSI Reservations</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. VMFS הוא מערכת קבצים cluster-aware שמנהלת נעילות On-Disk (היסטורית מבוססות SCSI Reservations, ובגרסאות מודרניות בעיקר Atomic Test and Set/ATS) כדי למנוע כתיבה בו-זמנית לאותו קובץ מכמה Hosts; NFS (v3) לעומת זאת מסתמך על ה-NFS Server החיצוני לניהול הנעילה מחוץ למערכת הקבצים של ESXi (בעזרת קובצי lock ייעודיים), כך שהאמינות תלויה במימוש ובתמיכה של ה-NFS Server עצמו</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. NFS תמיד מהיר יותר מ-VMFS מכיוון שהוא לא משתמש בשום מנגנון נעילה כלל</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> VMFS הוא מערכת קבצים cluster-aware שנועדה מלכתחילה לאפשר לכמה Hosts לגשת בו-זמנית לאותו Datastore (בלוקים משותפים) תוך מניעת התנגשויות כתיבה - היא עושה זאת באמצעות נעילות On-Disk, שהתבססו היסטורית על SCSI Reservations (נעילת ה-LUN כולו לפרק זמן קצר) ובגרסאות מודרניות יותר על ATS (Atomic Test and Set), מנגנון נעילה ברמת הבלוק הבודד שיעיל וסקלבילי הרבה יותר. לעומת זאת, ב-NFS (גרסה 3, הנפוצה ביותר בפריסות vSphere) ה-ESXi Host אינו מנהל בעצמו נעילה ברמת מערכת הקבצים - הוא מסתמך על ה-NFS Server החיצוני שינהל זאת (למשל באמצעות קובצי .lock ייעודיים), ולכן העקביות והאמינות תלויות במימוש הספציפי של אותו שרת NFS.</div>
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
