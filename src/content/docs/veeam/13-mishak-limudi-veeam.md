---
title: "משחק לימודי: אתגר Veeam"
category: Veeam
part: 13/10
description: "משחק אינטראקטיבי ללימוד Veeam Backup & Replication - חמישה מצבי משחק עם טיימר, לבבות, ניקוד ורצפים: קרב מהיר, ניחוש התנהגות Job, השלמת קונפיגורציה, התאמת מושגים וסידור תהליך."
---

חמישה מצבי משחק שבודקים היבטים שונים של Veeam Backup & Replication - ארכיטקטורה, Backup Jobs, כלל 3-2-1-1-0, Replication ו-Failover, VMware/Hyper-V, Veeam ONE ו-Troubleshooting. לא עוד חידון רב-ברירה, אלא משחק עם **טיימר**, **שלושה לבבות**, **מכפיל רצף** ו**שיא אישי** שנשמר בדפדפן. בסוף כל סבב תקבלו דירוג, ורשימת חזרה של בדיוק מה שפספסתם.

<div class="tg" id="tg" dir="rtl">
  <div class="tg-screen is-active" data-screen="menu">
    <div class="tg-hero">
      <div class="tg-hero-badge">Veeam</div>
      <div class="tg-hero-title">אתגר Veeam</div>
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
      q: 'איזה סוג Backup Job יוצר בכל ריצה עותק מלא חדש של ה-VM, ללא תלות בגיבויים קודמים?',
      o: ['<code>Active Full</code>', '<code>Incremental</code>', '<code>Reverse Incremental</code>', '<code>Synthetic Full</code>'],
      a: 0,
      w: '<code>Active Full</code> קורא את כל הדאטה מחדש מה-VM עצמו ויוצר קובץ VBK מלא חדש - יקר יותר ב-I/O וב-זמן, אך לא תלוי בשרשרת גיבויים קודמת.'
    },
    {
      q: 'מהו Synthetic Full, ובמה הוא שונה מ-Active Full?',
      o: ['נבנה מקבצי VBK+VIB קיימים במאגר, בלי לגעת שוב ב-VM המקורי', 'זהה לחלוטין ל-Active Full מבחינת עומס', 'תמיד רץ על VM כבוי בלבד', 'אינו נתמך יותר בגרסאות עדכניות'],
      a: 0,
      w: 'Synthetic Full "מרכיב" קובץ מלא חדש מתוך הגיבויים הקיימים במאגר עצמו (מיזוג נתונים), ולכן חוסך את עומס הקריאה מה-VM/production storage - יעיל יותר מ-Active Full ברוב המקרים.'
    },
    {
      q: 'מה ההבדל המרכזי בין <code>Incremental</code> ל-<code>Reverse Incremental</code>?',
      o: ['ב-Reverse Incremental, קובץ ה-VBK תמיד מייצג את המצב העדכני ביותר; ב-Incremental הוא מייצג את הגיבוי המלא הראשון', 'אין הבדל מעשי בין השניים', 'Reverse Incremental לא תומך ב-VMware', 'Incremental תמיד יותר איטי'],
      a: 0,
      w: 'ב-Incremental השרשרת גדלה קדימה (VBK ואז VIB מצטברים). ב-Reverse Incremental, כל ריצה "ממזגת" את השינויים החדשים לתוך ה-VBK עצמו ויוצרת VRB הפוך - כך שה-VBK תמיד הכי עדכני, מה שמקצר restore אך מאריך את זמן ה-job.'
    },
    {
      q: 'מה משמעות "3-2-1-1-0" בכלל הגיבוי המורחב של Veeam?',
      o: ['3 עותקים, 2 סוגי מדיה, 1 עותק offsite, 1 עותק immutable/offline, 0 שגיאות באימות', '3 גיבויים ביום, 2 מאגרים, 1 שרת, 1 רשת, 0 downtime', '3 ימי retention, 2 jobs, 1 proxy, 1 repository, 0 עלות', 'מספר גרסאות Veeam מותקנות'],
      a: 0,
      w: 'הכלל המקורי 3-2-1 (3 עותקי דאטה, 2 סוגי מדיה שונים, 1 עותק מחוץ לאתר) הורחב על ידי Veeam ל-3-2-1-1-0: עוד "1" עבור עותק immutable או air-gapped/offline, ו"0" עבור אימות שהגיבויים תקינים וללא שגיאות (SureBackup).'
    },
    {
      q: 'מהו Immutable Repository, ואיך הוא מגן מפני ransomware?',
      o: ['מאגר שבו קבצי גיבוי לא ניתנים למחיקה/שינוי לפרק זמן מוגדר, גם על ידי מנהל מערכת', 'מאגר שרץ רק על Tape', 'מאגר שמוצפן אוטומטית ב-AES-256', 'מאגר שסונכרן בזמן אמת ל-Cloud'],
      a: 0,
      w: 'Immutability (על S3 Object Lock, מאגר Linux hardened repository, או Capacity Tier immutable) נועל את הגיבויים למשך תקופה מוגדרת - גם תוקף עם הרשאות מלאות, כולל תוקף שהשתלט על ה-VBR server, לא יכול למחוק אותם לפני תום התקופה.'
    },
    {
      q: 'מה עושה Instant VM Recovery?',
      o: ['מריץ VM ישירות מתוך קובץ הגיבוי (VBK/VIB) דרך NFS/vPower, ללא צורך בשחזור מלא קודם', 'משחזר קובץ בודד מתוך ה-VM', 'מבצע Failover ל-Replica באתר DR', 'מייצא את ה-VM לפורמט OVF'],
      a: 0,
      w: 'Instant VM Recovery מעלה את ה-VM "on the fly" ישירות מהגיבוי הדחוס, כשה-hypervisor ניגש אליו דרך NFS datastore זמני - מקצר drastically את זמן ה-downtime (Storage vMotion אח"כ מעביר את הדאטה למקום קבוע).'
    },
    {
      q: 'מהי המטרה של Replication ב-Veeam, בהשוואה ל-Backup רגיל?',
      o: ['לשמור VM "חם" ומעודכן באתר DR נפרד, מוכן ל-Failover מהיר', 'לדחוס את קבצי הגיבוי', 'להריץ SureBackup אוטומטי', 'לייצא נתונים לפורמט CSV'],
      a: 0,
      w: 'Replication יוצר ומעדכן עותק VM מלא (לא קובץ גיבוי) על hypervisor באתר יעד, כולל שרשרת restore points משלו - מיועד ל-RTO קצר מאוד דרך Failover, בניגוד ל-Backup שדורש שחזור.'
    },
    {
      q: 'מה ההבדל בין Failover ל-Failback ב-Veeam Replication?',
      o: ['Failover מפעיל את ה-Replica באתר DR במקום המקור; Failback מחזיר את העומס חזרה למקור המקורי (או חדש) אחרי שהתאושש', 'שני המונחים זהים לחלוטין', 'Failback הוא רק לצורך בדיקה, לא לפרודקשן', 'Failover דורש כיבוי ידני של המקור מראש תמיד'],
      a: 0,
      w: 'Failover הוא מעבר לעבודה מה-Replica בזמן תקלה. Failback הוא התהליך ההפוך: לאחר שהאתר המקורי (או שרת חדש) מוכן, Veeam מסנכרן את השינויים שנוצרו על ה-Replica בזמן ה-Failover בחזרה, ומעביר את העומס חזרה.'
    },
    {
      q: 'מהו Veeam ONE, ותפקידו העיקרי בסביבה?',
      o: ['פלטפורמת ניטור, דוחות והתראות על תשתית הגיבוי והוירטואליזציה', 'תחליף מלא ל-Veeam Backup & Replication', 'כלי לניהול Tape בלבד', 'מנוע ה-deduplication של המאגרים'],
      a: 0,
      w: 'Veeam ONE מספק ניטור בזמן אמת, דוחות (Compliance, Capacity Planning) והתראות פרואקטיביות - למשל על jobs שנכשלים, מאגרים שמתמלאים, או VMs ללא הגנה (Backup Coverage).'
    },
    {
      q: 'מהו SureBackup, ולמה הוא חיוני ל"0" בכלל 3-2-1-1-0?',
      o: ['מריץ אוטומטית VM מתוך הגיבוי בסביבת בידוד (Virtual Lab) כדי לוודא שהוא באמת ניתן לשחזור', 'מצפין את קובץ הגיבוי', 'מוחק גיבויים ישנים אוטומטית', 'מבצע דחיסה נוספת על VBK'],
      a: 0,
      w: 'SureBackup מבצע Recovery Verification אוטומטי - מעלה VM מהגיבוי בסביבה מבודדת (Virtual Lab), מריץ בדיקות (heartbeat, ping, אפליקציה), ומוודא שהגיבוי לא רק "קיים" אלא גם באמת שמיש - זה ה"0 שגיאות" בכלל המורחב.'
    },
    {
      q: 'מה תפקידו של Backup Proxy בארכיטקטורת Veeam?',
      o: ['מבצע את עיבוד הדאטה בפועל (קריאה מה-source, דחיסה, deduplication) ומעביר אותו למאגר', 'מאחסן את קבצי הגיבוי הסופיים', 'מריץ רק את הממשק הגרפי לניהול', 'אחראי בלעדית על תזמון jobs'],
      a: 0,
      w: 'ה-Proxy הוא "כוח העיבוד" - הוא זה שקורא את הדאטה מה-VM (דרך Direct SAN, Hot-Add או NBD), מבצע compression/dedup, ושולח לתוך ה-Repository. אפשר לפרוס כמה Proxies במקביל להגדלת throughput.'
    },
    {
      q: 'מה תפקידו של Backup Repository, ומה ההבדל מ-SOBR (Scale-Out Backup Repository)?',
      o: ['Repository הוא יעד אחסון בודד לקבצי גיבוי; SOBR מאחד כמה Repositories ליחידת אחסון לוגית אחת עם extents ו-Capacity Tier', 'הם מונחים זהים לחלוטין', 'SOBR הוא רק לגיבויי Tape', 'Repository תמיד חייב להיות באותו datacenter כמו ה-Proxy'],
      a: 0,
      w: 'Repository בודד הוא יעד פיזי/לוגי אחד (Windows/Linux server, share, deduplication appliance). SOBR מקבץ כמה Repositories (extents) לפול אחסון אחד עם מדיניות Performance/Capacity Tier, ומאפשר גם Object Storage (S3, Azure Blob) כ-tier נוסף.'
    },
    {
      q: 'מה קורה כברירת מחדל כש-Backup Job נכשל (Job Fails) בגלל תקלת רשת זמנית?',
      o: ['Veeam מבצע ניסיונות חוזרים (Retry) אוטומטיים לפי מספר הפעמים שהוגדר ב-job', 'ה-job נמחק אוטומטית', 'הגיבוי הקודם נמחק', 'ה-VM כולו מושבת'],
      a: 0,
      w: 'לכל Job יש הגדרת Retry (ברירת מחדל: כמה ניסיונות ובאיזה מרווח). כשל זמני (כמו ניתוק רשת קצר) יגרום ל-Veeam לנסות שוב אוטומטית לפני שהוא מסמן את ה-job כ-Failed סופית.'
    },
    {
      q: 'מהו Application-Aware Processing (Application-Aware Image Processing) ב-Veeam?',
      o: ['שימוש ב-VSS (או תוסף מקביל) כדי לגבות אפליקציות כמו SQL/Exchange/AD במצב עקבי מבחינת טרנזקציות', 'תכונה שמדחיסה את ה-VM לפני הגיבוי', 'הגדרת רשת ייעודית ל-Proxy', 'מנגנון להצפנת traffic בין Proxy ל-Repository'],
      a: 0,
      w: 'Application-Aware Processing מפעיל VSS בתוך ה-Guest OS כדי להביא אפליקציות transactional (SQL Server, Exchange, Active Directory) למצב עקבי (application-consistent) לפני צילום ה-snapshot, ומאפשר truncate של transaction logs לאחר גיבוי מוצלח.'
    }
  ];

  /* ============================================================
     מצב 2 - ניחוש התנהגות Job: תיאור קונפיגורציה + מה יקרה בפועל
     ============================================================ */
  var BEHAVIOR = [
    {
      code: 'Backup Job: "SQL-Prod"\nBackup type: Reverse Incremental\nRetention: 14 restore points\nRepository free space: מלא כמעט לגמרי',
      q: 'ה-Job הזה רץ כל לילה בהצלחה, אבל בלילה הנוכחי אין מספיק מקום פנוי למיזוג (merge) של ה-Reverse Incremental. מה יקרה?',
      o: ['ה-Job ייכשל בשגיאת חוסר מקום - Reverse Incremental דורש שטח פנוי זמני נוסף לביצוע ה-merge', 'Veeam ימחק אוטומטית restore points ישנים כדי לפנות מקום', 'ה-Job יעבור אוטומטית ל-Incremental במקום', 'אין השפעה - Reverse Incremental לא צריך שטח פנוי נוסף'],
      a: 0,
      w: 'Reverse Incremental דורש שטח פנוי זמני (בערך בגודל ה-changed blocks) לביצוע ה-merge של ה-VRB לתוך ה-VBK. כשאין מספיק מקום פנוי, ה-job נכשל - זו הסיבה שמומלץ להשאיר לפחות 10-15% שטח פנוי במאגר.'
    },
    {
      code: 'Backup Job Retention Policy:\nRestore points to keep: 7\nGFS: Weekly - 4, Monthly - 12\nBackup mode: Incremental (Forever Forward Incremental)',
      q: 'עברו 8 ימים מאז תחילת ה-Job, וכעת יש 8 restore points יומיים. מה יקרה בריצה הבאה?',
      o: ['ה-restore point היומי הישן ביותר יעבור "מיזוג קדימה" (merge forward) לתוך ה-VBK, ומספר הנקודות היומיות יישאר 7', 'כל 8 הנקודות יימחקו ותתחיל שרשרת חדשה', 'ה-Job ייכשל כי חרג ממכסת ה-retention', 'הנקודה הישנה ביותר תישמר לצמיתות כ-GFS'],
      a: 0,
      w: 'ב-Forever Forward Incremental, כשמגיעים למספר ה-restore points המוגדר, הנקודה הישנה ביותר "נספגת" (מוזגת) לתוך ה-VBK הראשי כדי לשמור על 7 נקודות בדיוק - מלבד נקודות ה-GFS (שבועי/חודשי) שנשמרות בנפרד לפי המדיניות שלהן.'
    },
    {
      code: 'Backup Copy Job:\nSource: "VM-Backup" (Repository A, אתר ראשי)\nTarget: Repository B (אתר משני, offsite)\nSimplified interval: כל 4 שעות\nGFS: לא מוגדר',
      q: 'מה קורה אם ה-Backup Job המקורי (Source) עדיין באמצע ריצה כשמגיע הזמן ל-sync interval של ה-Backup Copy?',
      o: ['ה-Backup Copy ימתין וידלג לחלון הבא אם המקור לא הגיע ל-restore point חדש ויציב', 'הוא יעתיק חלקית את הנתונים הלא-גמורים', 'ה-Backup Job המקורי ייעצר כדי לפנות מקום ל-Copy', 'שני ה-jobs ירוצו במקביל על אותו קובץ VBK'],
      a: 0,
      w: 'Backup Copy Job עובד מול restore points קיימים ושלמים בלבד - הוא סורק את ה-source repository, ואם אין restore point חדש שהושלם במלואו מאז הסנכרון האחרון, הוא פשוט ממתין לחלון הבא במקום להעתיק דאטה לא עקבי.'
    },
    {
      code: 'Replication Job:\nRPO: כל 4 שעות\nNetwork traffic throttling: מוגדר\nTarget host: כמעט ללא שטח פנוי בדאטהסטור',
      q: 'ה-Replication Job מנסה לרוץ אך הדאטהסטור ביעד כמעט מלא. מה ההשפעה על ה-RPO בפועל?',
      o: ['ה-job ייכשל ולא ייווצר replica-point חדש, כך שה-RPO בפועל יחרוג מ-4 שעות עד לפתרון בעיית השטח', 'Veeam ידחוס אוטומטית את ה-replica הקיים כדי לפנות מקום', 'ה-RPO יישאר עומד גם אם ה-job נכשל', 'ה-job יעבור אוטומטית ל-thin provisioning'],
      a: 0,
      w: 'RPO הוא יעד תיאורטי - הוא תקף רק אם ה-jobs באמת מצליחים לרוץ בזמן. כשל טכני (חוסר שטח, בעיית רשת) גורם לפער בפועל בין ה-restore points, ולכן חובה לנטר (למשל דרך Veeam ONE) שה-jobs אכן עומדים ב-RPO המוגדר ולא רק "מוגדרים" עליו.'
    },
    {
      code: 'Backup Job: "File-Server"\nEncryption: מופעל, סיסמה הוגדרה בזמן יצירת ה-Job\nהסיסמה אבדה, ולא נשמרה ב-Veeam Backup Enterprise Manager',
      q: 'מה קורה כשמנסים לשחזר מגיבוי מוצפן ללא הסיסמה הנכונה, וגם ללא Enterprise Manager עם password loss protection?',
      o: ['השחזור בלתי אפשרי - אין דלת אחורית (backdoor) לפענוח ללא הסיסמה או ה-key שנשמר ב-Enterprise Manager', 'Veeam Support יכולים לספק מפתח שחזור universal', 'ניתן לשחזר רק את ה-metadata בלי הדאטה', 'ההצפנה מתבטלת אוטומטית אחרי 30 יום'],
      a: 0,
      w: 'ההצפנה של Veeam (AES-256) לא כוללת backdoor - Enterprise Manager שומר עותק של מפתחות ההצפנה בדיוק כדי למנוע מצב כזה (Password Loss Protection). בלי זה, איבוד הסיסמה = איבוד גישה לגיבוי לצמיתות.'
    },
    {
      code: 'Backup Job עם Health Check מופעל (Storage-level corruption guard)\nריצה שבועית של בדיקת תקינות בלוקים על קובצי הגיבוי',
      q: 'בבדיקה השבועית מתגלה בלוק פגום בקובץ VBK ישן. מה Veeam עושה?',
      o: ['מסמן את הבעיה ומריץ Active Full אוטומטי (או לפי מדיניות) כדי ליצור שרשרת תקינה חדשה', 'מוחק את כל שרשרת הגיבוי מיד', 'מתעלם מהבעיה עד לניסיון restore בפועל', 'משחזר את הבלוק הפגום מ-Replica אוטומטית'],
      a: 0,
      w: 'Health Check (חלק מ-Storage-Level Corruption Guard) סורק periodically את קבצי הגיבוי לאיתור corruption. כשמתגלה בעיה, Veeam מתריע ובד"כ מפעיל Active Full בריצה הבאה כדי "לרפא" את השרשרת - זיהוי מוקדם לפני שצריך את הגיבוי בפועל.'
    },
    {
      code: 'SOBR (Scale-Out Backup Repository)\nPolicy: Move mode, Operational Restore Window = 7 ימים\nCapacity Tier: S3 Immutable מוגדר',
      q: 'לאחר 7 ימים, מה קורה לנתונים הישנים ב-Performance Tier?',
      o: ['הם עוברים (Move) אוטומטית ל-Capacity Tier (S3) ונמחקים מה-Performance Tier המקומי', 'הם מוכפלים - נשארים גם מקומית וגם ב-S3', 'הם נמחקים לצמיתות ללא גיבוי', 'המדיניות לא משפיעה על נתונים קיימים, רק על חדשים'],
      a: 0,
      w: 'ב-Move mode, ברגע שחלף ה-Operational Restore Window (כאן: 7 ימים), הבלוקים הישנים עוברים פיזית ל-Capacity Tier (Object Storage) ומפונים מה-Performance Tier - זה שונה מ-Copy mode שבו נשמר גם עותק מקומי.'
    },
    {
      code: 'Backup Job מוגדר עם 2 Backup Proxies, שניהם עם Transport Mode: Direct SAN Access\nאחד מהם איבד גישה ל-SAN fabric',
      q: 'מה יקרה ל-job כשה-Proxy הפגום מנסה לעבד VM?',
      o: ['Veeam יזהה כשל ב-Direct SAN ויעבור אוטומטית ל-fallback mode (למשל Network/NBD) לאותו VM, אם הוגדר Failover', 'כל ה-job ייכשל מיידית ללא כל ניסיון נוסף', 'ה-Proxy השני ייקח את כל העומס אוטומטית ללא כל עיכוב', 'ה-VM יידלג לצמיתות מכל הגיבויים העתידיים'],
      a: 0,
      w: 'Veeam תומך ב-Failover בין Transport Modes - אם Direct SAN Access לא זמין (בעיית fabric/permissions), הוא יכול ליפול אוטומטית ל-Virtual Appliance (Hot-Add) או Network mode, בהתאם להגדרות ה-Proxy, כדי שה-job עדיין יצליח (אם כי לאט יותר).'
    }
  ];

  /* ============================================================
     מצב 3 - השלמת קונפיגורציה: PowerShell cmdlets עם ___ חסר
     ============================================================ */
  var COMPLETE = [
    {
      code: 'Connect-VBRServer -Server "vbr01.corp.local"\n$repo = ___ -Name "Repo-Main"\nGet-VBRJob | Where {$_.GetLastResult() -eq "Failed"}',
      q: 'איזה cmdlet מחזיר אובייקט Repository לפי שם?',
      o: ['<code>Get-VBRBackupRepository</code>', '<code>Get-VBRRepositoryInfo</code>', '<code>Find-VBRRepository</code>', '<code>Get-VBRStorage</code>'],
      a: 0,
      w: '<code>Get-VBRBackupRepository -Name "..."</code> הוא ה-cmdlet הסטנדרטי לשליפת אובייקט Repository, לשימוש בהמשך עם cmdlets נוספים כמו יצירת Job חדש.'
    },
    {
      code: '$job = Get-VBRJob -Name "SQL-Prod"\n___ -Job $job\nStart-Sleep -Seconds 5\nGet-VBRJob -Name "SQL-Prod" | Select Name, LastResult',
      q: 'איזה cmdlet מפעיל (מריץ) job קיים באופן מיידי דרך PowerShell?',
      o: ['<code>Start-VBRJob</code>', '<code>Run-VBRJob</code>', '<code>Invoke-VBRJob</code>', '<code>Enable-VBRJob</code>'],
      a: 0,
      w: '<code>Start-VBRJob -Job $job</code> מפעיל את ה-job מיידית (מקביל ללחיצה על "Start" בממשק), בניגוד ל-<code>Enable-VBRJob</code> שרק מפעיל מחדש תזמון שהושבת.'
    },
    {
      code: '$repo = Get-VBRBackupRepository -Name "Repo-Main"\nNew-VBRBackupJob -Name "New-Web-Job" -Entity $vm ___ $repo',
      q: 'איזה פרמטר מקשר את ה-Repository שנבחר ל-Job החדש שנוצר?',
      o: ['<code>-BackupRepository</code>', '<code>-TargetRepo</code>', '<code>-Storage</code>', '<code>-Destination</code>'],
      a: 0,
      w: 'הפרמטר הרשמי ב-<code>New-VBRBackupJob</code> הוא <code>-BackupRepository</code>, שמקבל את אובייקט ה-Repository שהוחזר מ-<code>Get-VBRBackupRepository</code>.'
    },
    {
      code: '$job = Get-VBRJob -Name "File-Server"\n$options = $job.GetOptions()\n$options.BackupStorageOptions.RetentionPointsToKeep = 21\n___ -Job $job -Options $options',
      q: 'איזה cmdlet שומר (מיישם) שינויים על אובייקט ה-options שהוחזר מ-<code>GetOptions()</code>?',
      o: ['<code>Set-VBRJobOptions</code>', '<code>Update-VBRJob</code>', '<code>Save-VBROptions</code>', '<code>Apply-VBRJob</code>'],
      a: 0,
      w: '<code>Set-VBRJobOptions -Job $job -Options $options</code> הוא הדפוס הסטנדרטי לשינוי הגדרות job דרך PowerShell: קוראים options, משנים property, ואז שומרים חזרה.'
    },
    {
      code: '$repJob = Get-VBRJob -Name "Rep-To-DR"\n$vm = Find-VBRViEntity -Name "web01"\n___ -Job $repJob -Entity $vm -Reason "Planned DR test"',
      q: 'איזה cmdlet מבצע Failover ל-VM ספציפי בתוך Replication Job?',
      o: ['<code>Start-VBRFailover</code>', '<code>Invoke-VBRReplicaFailover</code>', '<code>Start-VBRReplicaFailover</code>', '<code>Switch-VBRJob</code>'],
      a: 2,
      w: '<code>Start-VBRReplicaFailover</code> הוא ה-cmdlet הרשמי להפעלת Failover על replica ספציפי - הוא מקבל את אובייקט ה-VM (Replica) ואת סיבת ה-failover לתיעוד.'
    },
    {
      code: '$restorePoint = Get-VBRBackup -Name "SQL-Prod" | Get-VBRRestorePoint | Select -First 1\n___ -RestorePoint $restorePoint -Server $targetHost',
      q: 'איזה cmdlet מפעיל Instant VM Recovery מתוך restore point נתון?',
      o: ['<code>Start-VBRInstantRecovery</code>', '<code>Start-VBRQuickRestore</code>', '<code>Restore-VBRInstant</code>', '<code>Mount-VBRRestorePoint</code>'],
      a: 0,
      w: '<code>Start-VBRInstantRecovery</code> מקבל restore point ומעלה ממנו VM מיידית דרך NFS, בדיוק כפי שקורה בממשק הגרפי תחת Instant VM Recovery.'
    },
    {
      code: 'Get-VBRJob -Name "VM-Backup" | ___ -FullBackup',
      q: 'איזה פרמטר/cmdlet מכריח את הריצה הבאה של ה-job להיות Active Full, גם אם מוגדר Incremental?',
      o: ['<code>Start-VBRJob</code>', '<code>Enable-VBRJob</code>', '<code>Set-VBRJobAdvancedSettings</code>', '<code>New-VBRFullBackup</code>'],
      a: 0,
      w: '<code>Start-VBRJob -FullBackup</code> מכריח ריצה יזומה של Active Full (bypass), ללא צורך לשנות את סוג ה-backup הקבוע שמוגדר ב-job עצמו.'
    },
    {
      code: '$job = Get-VBRJob -Name "SureBackup-Test"\n___ -Job $job\nGet-VBRSessionResult -Job $job',
      q: 'איזה cmdlet מריץ SureBackup job לצורך אימות שחזור אוטומטי?',
      o: ['<code>Start-VBRJob</code>', '<code>Start-VBRSureBackup</code>', '<code>Invoke-VBRSureBackupJob</code>', '<code>Test-VBRBackup</code>'],
      a: 0,
      w: 'SureBackup jobs הם בסופו של דבר אובייקט Job רגיל ב-Veeam - מריצים אותם עם אותו <code>Start-VBRJob</code> הכללי, בדיוק כמו Backup Job או Replication Job רגיל.'
    },
    {
      code: '$repo = Get-VBRBackupRepository -Name "SOBR-Main"\nGet-VBRRepositoryExtent -Repository $repo | ___ Select FriendlyPath, FreeSpace',
      q: 'איזה תו PowerShell סטנדרטי צריך להשלים לפני <code>Select</code> כדי להעביר את הפלט הלאה (pipeline)?',
      o: ['<code>|</code>', '<code>&gt;</code>', '<code>&amp;&amp;</code>', '<code>-&gt;</code>'],
      a: 0,
      w: 'ב-PowerShell, כמו ב-Veeam PowerShell module המבוסס עליו, מעבירים אובייקטים בין cmdlets עם pipe <code>|</code> - זה מאפשר לשרשר <code>Get-VBRRepositoryExtent</code> ישירות ל-<code>Select</code> לצורך תצוגה מסוננת.'
    },
    {
      code: 'Get-VBRComputerBackupJob -Name "Laptop-Backup" | ___',
      q: 'איזה cmdlet מוחק job לגמרי מהקונפיגורציה (ולא רק משבית אותו)?',
      o: ['<code>Remove-VBRJob</code>', '<code>Disable-VBRJob</code>', '<code>Delete-VBRJob</code>', '<code>Clear-VBRJob</code>'],
      a: 0,
      w: '<code>Remove-VBRJob</code> מוחק את הגדרת ה-job לצמיתות מהקונפיגורציה. <code>Disable-VBRJob</code> לעומת זאת רק עוצר את התזמון העתידי בלי למחוק את ה-job או את הגיבויים הקיימים שלו.'
    },
    {
      code: '$session = Get-VBRBackupSession -Name "SQL-Prod*" | Sort CreationTime -Descending | Select -First 1\n$session | ___',
      q: 'איזה cmdlet מציג את יומן הפעולות המפורט (task log) של סשן גיבוי ספציפי?',
      o: ['<code>Get-VBRTaskSession</code>', '<code>Show-VBRSessionLog</code>', '<code>Get-VBRSessionLog</code>', '<code>Export-VBRLog</code>'],
      a: 0,
      w: '<code>Get-VBRTaskSession</code> מחזיר את רמת הפירוט הבאה - את המשימות הבודדות (per-VM) בתוך סשן, כולל שגיאות ספציפיות שקרו בכל אחת, חיוני ל-troubleshooting של job שנכשל.'
    },
    {
      code: 'Get-VBRBackupRepository -ScaleOut -Name "SOBR-Main" | ___ -Object "Capacity Tier"',
      q: 'איזה cmdlet מפעיל Capacity Tier (offload ל-Object Storage) על SOBR קיים?',
      o: ['<code>Enable-VBRSOBRCapacityTier</code>', '<code>Set-VBRRepositoryExtent</code>', '<code>Start-VBRCapacityTier</code>', '<code>Add-VBRCapacityTier</code>'],
      a: 0,
      w: '<code>Enable-VBRSOBRCapacityTier</code> הוא ה-cmdlet הייעודי להפעלת שכבת ה-Capacity Tier על SOBR, אחרי שכבר הוגדר חיבור ל-Object Storage (S3/Azure Blob/וכו׳) עם <code>Add-VBRAmazonS3Repository</code> או מקבילו.'
    }
  ];

  /* ============================================================
     מצב 4 - התאמת מושגים: סבבים של זוגות מושג + תיאור
     ============================================================ */
  var MATCH_ROUNDS = [
    {
      title: 'סוגי Backup Jobs',
      pairs: [
        { l: 'Full Backup', r: 'עותק מלא ועצמאי של כל הדאטה, ללא תלות בגיבויים אחרים' },
        { l: 'Incremental', r: 'שומר רק את הבלוקים שהשתנו מאז הגיבוי הקודם' },
        { l: 'Reverse Incremental', r: 'ממזג כל ריצה חדשה לתוך ה-VBK, כך שהוא תמיד המצב העדכני ביותר' },
        { l: 'Synthetic Full', r: 'נבנה ממיזוג גיבויים קיימים במאגר, בלי לגעת שוב ב-VM המקורי' },
        { l: 'Backup Copy Job', r: 'מעתיק restore points קיימים ליעד נוסף (למשל offsite) ללא עומס נוסף על ה-production' }
      ]
    },
    {
      title: 'Replication ו-DR',
      pairs: [
        { l: 'RPO (Recovery Point Objective)', r: 'כמות המידע המרבית שמותר לאבד, נמדדת בזמן מאז הגיבוי/רפליקציה האחרונים' },
        { l: 'RTO (Recovery Time Objective)', r: 'הזמן המרבי המותר לחזרה לפעילות אחרי אירוע' },
        { l: 'Failover', r: 'מעבר עבודה מיידי מה-VM המקורי ל-Replica באתר DR' },
        { l: 'Failback', r: 'החזרת העומס מה-Replica בחזרה למקור המקורי או לשרת חדש' },
        { l: 'Planned Failover', r: 'מעבר מבוקר ומתוזמן ל-Replica, לרוב לצורך תחזוקה או בדיקה, ללא אובדן נתונים' }
      ]
    },
    {
      title: 'רכיבי ארכיטקטורה',
      pairs: [
        { l: 'Backup Server (VBR)', r: 'שרת הניהול המרכזי - מתזמן jobs, מנהל קטלוג ומחזיק את מסד הנתונים הקונפיגורטיבי' },
        { l: 'Backup Proxy', r: 'מבצע את עיבוד הדאטה בפועל: קריאה, דחיסה ו-deduplication' },
        { l: 'Backup Repository', r: 'יעד האחסון הפיזי/לוגי לקבצי הגיבוי' },
        { l: 'SOBR (Scale-Out Backup Repository)', r: 'מאחד כמה Repositories ליחידת אחסון לוגית אחת עם Performance ו-Capacity Tier' },
        { l: 'WAN Accelerator', r: 'מאיץ ומצמצם תעבורת רשת בין אתרים על ידי caching ודחיסה מתקדמת' }
      ]
    },
    {
      title: 'Veeam ONE וניטור',
      pairs: [
        { l: 'Veeam ONE Monitor', r: 'ניטור בזמן אמת של בריאות תשתית הגיבוי והוירטואליזציה' },
        { l: 'Veeam ONE Reporter', r: 'מפיק דוחות תקופתיים - Capacity Planning, Compliance ו-Chargeback' },
        { l: 'Business View', r: 'מסווג VMs ואובייקטים לקטגוריות עסקיות לצורך ניתוח ודיווח ממוקד' },
        { l: 'Alarm (Veeam ONE)', r: 'התראה מותאמת אישית שמופעלת כשמדד חוצה סף מוגדר מראש (למשל job נכשל)' },
        { l: 'Backup Coverage Report', r: 'מזהה VMs שאינם מוגנים באף Backup Job קיים' }
      ]
    }
  ];

  /* ============================================================
     מצב 5 - סידור תהליך: סבבים של שלבים שצריך לסדר בסדר הנכון
     ============================================================ */
  var ORDER_ROUNDS = [
    {
      title: 'הקמת Backup Job חדש מאפס עד ריצה מוצלחת',
      steps: [
        'התקנת/רישום Backup Proxy וחיבורו ל-Backup Server',
        'הגדרת Backup Repository (או SOBR) כיעד לאחסון',
        'יצירת Backup Job חדש ובחירת ה-VMs להגנה',
        'הגדרת סוג הגיבוי (Incremental/Reverse Incremental) ומדיניות Retention',
        'הפעלת Application-Aware Processing עבור VMs עם אפליקציות טרנזקציוניות',
        'הרצה ידנית ראשונה (Full) ובדיקת הצלחה בלוג',
        'הגדרת תזמון אוטומטי (Schedule) להמשך ריצות'
      ]
    },
    {
      title: 'ביצוע Failover ל-Replica בזמן אמת (DR)',
      steps: [
        'זיהוי תקלה באתר הראשי המחייבת מעבר לאתר DR',
        'בדיקת מצב ה-Replica ותאריך ה-restore point האחרון התקין',
        'הפעלת Failover על ה-VM/VMs הרלוונטיים דרך Veeam Console',
        'אימות שה-Replica עלה ותקין (רשת, שירותים, אפליקציה)',
        'עדכון DNS/Load Balancer להפניית תעבורה ל-Replica',
        'לאחר תיקון האתר הראשי - ביצוע Failback חזרה'
      ]
    },
    {
      title: 'שחזור VM בודד עם Instant Recovery',
      steps: [
        'איתור ה-restore point המתאים בקטלוג הגיבויים',
        'הפעלת Instant VM Recovery ובחירת יעד ה-hypervisor',
        'המתנה לעליית ה-VM דרך NFS datastore זמני',
        'בדיקת תקינות ה-VM (רשת, שירותים, נתונים)',
        'ביצוע Storage vMotion (Quick Migration) להעברת הדאטה למקום קבוע',
        'ניתוק ה-datastore הזמני ואישור סיום השחזור'
      ]
    },
    {
      title: 'חקירת Job שנכשל (Troubleshooting)',
      steps: [
        'בדיקת ה-Session Log הכללי לזיהוי שלב הכשל (VSS, Proxy, Repository, רשת)',
        'בדיקת Task Session הספציפי לכל VM שנכשל בתוך ה-job',
        'אימות קישוריות Proxy-to-Repository ו-Proxy-to-Source',
        'בדיקת שטח פנוי במאגר ומצב ה-Health Check',
        'תיקון הבעיה שאותרה (רשת/הרשאות/שטח/VSS)',
        'הרצה חוזרת ידנית של ה-job לאימות הפתרון'
      ]
    }
  ];

  /* ============================================================
     הגדרת מצבי המשחק
     ============================================================ */
  var MODES = [
    { key: 'rapid', icon: '⚡', name: 'קרב מהיר', desc: 'שאלות ידע כלליות על Veeam - כמה תספיקו לפני שהזמן נגמר?', type: 'quiz', data: RAPID, sample: 8, time: 20000 },
    { key: 'behavior', icon: '🔮', name: 'ניחוש התנהגות Job', desc: 'תיאור קונפיגורציה - מה יקרה בפועל?', type: 'quiz', data: BEHAVIOR, sample: 8, time: 28000, showCode: true },
    { key: 'complete', icon: '🧩', name: 'השלמת קונפיגורציה', desc: 'קטע PowerShell עם חלק חסר - בחרו מה משלים אותו נכון', type: 'quiz', data: COMPLETE, sample: 8, time: 28000, showCode: true },
    { key: 'match', icon: '🔗', name: 'התאמת מושגים', desc: 'התאימו כל מושג Veeam לתיאור הנכון שלו', type: 'match', data: MATCH_ROUNDS, sample: 2 },
    { key: 'order', icon: '📋', name: 'סידור תהליך', desc: 'סדרו את שלבי התהליך לפי הסדר הנכון', type: 'order', data: ORDER_ROUNDS, sample: 2 }
  ];

  window.TG_CONFIG = { gameId: "veeam", modes: MODES };
})();
</script>

<script src="/scripts/topic-game.js"></script>
