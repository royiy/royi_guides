---
title: "מדריך 13: משחק לימודי - אתגר Windows Server"
description: "משחק אינטראקטיבי ללימוד Windows Server - חמישה מצבי משחק עם טיימר, לבבות, ניקוד ורצפים: קרב מהיר, ניחוש פלט, השלמת פקודות PowerShell, התאמת מושגים וסידור תהליכי עבודה."
---

חמישה מצבי משחק שבודקים היבטים שונים של ניהול Windows Server - Active Directory, Group Policy, DNS/DHCP, הרשאות קבצים, Hyper-V, IIS וגיבויים. לא עוד חידון רב-ברירה, אלא משחק עם **טיימר**, **שלושה לבבות**, **מכפיל רצף** ו**שיא אישי** שנשמר בדפדפן. בסוף כל סבב תקבלו דירוג, ורשימת חזרה של בדיוק מה שפספסתם.


<div class="tg" id="tg" dir="rtl">
  <div class="tg-screen is-active" data-screen="menu">
    <div class="tg-hero">
      <div class="tg-hero-badge">Windows Server</div>
      <div class="tg-hero-title">אתגר Windows Server</div>
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

  /* ============================================================
     מצב 1 - קרב מהיר: שאלות ידע קצרות. o = אפשרויות, a = אינדקס נכון
     ============================================================ */
  var RAPID = [
    {
      q: 'מהו Domain Controller (DC)?',
      o: ['שרת שעליו מותקן AD DS, מחזיק עותק ממסד הנתונים של הדומיין ומאמת משתמשים', 'שרת קבצים משותף בלבד', 'שרת שמריץ רק DHCP', 'שרת שמריץ רק אתרי IIS'],
      a: 0,
      w: 'Domain Controller הוא השרת שמריץ את Active Directory Domain Services - הוא מחזיק את מסד הנתונים של הזהויות, מאמת התחברויות (Authentication) ואוכף מדיניות אבטחה בדומיין.'
    },
    {
      q: 'מהי המטרה העיקרית של OU (Organizational Unit)?',
      o: ['ארגון לוגי של אובייקטים ב-AD (משתמשים, מחשבים, קבוצות) וקישור Group Policy אליהם', 'יצירת דומיין נפרד לחלוטין', 'שכפול הסכימה בין יערות שונים', 'ניהול קבוצות הפצה (Distribution) בלבד'],
      a: 0,
      w: 'OU היא "התיקייה" שבתוכה מארגנים אובייקטים ב-AD לפי מבנה ארגוני או גאוגרפי. בניגוד לקבוצה, ל-OU אפשר לקשר GPO ולבצע Delegation של הרשאות ניהול.'
    },
    {
      q: 'כמה תפקידי FSMO (Flexible Single Master Operations) קיימים?',
      o: ['5', '3', '7', '2'],
      a: 0,
      w: 'חמישה תפקידים: Schema Master ו-Domain Naming Master (ברמת היער), ו-PDC Emulator, RID Master ו-Infrastructure Master (ברמת הדומיין). כל תפקיד מוחזק על ידי DC יחיד בכל רגע נתון.'
    },
    {
      q: 'מהו Global Catalog (GC)?',
      o: ['DC המחזיק אינדקס חלקי מכל האובייקטים בכל הדומיינים ביער, ומאפשר חיפושים ולוגין UPN חוצה-דומיינים', 'גיבוי מלא ויומי של AD', 'שרת שמנפיק תעודות SSL', 'רשימת ה-GPOs המקושרים לדומיין'],
      a: 0,
      w: 'ה-GC חיוני ביערות עם כמה דומיינים - הוא מאפשר לחפש אובייקט מכל מקום ביער בלי לפנות לכל דומיין בנפרד, ונדרש גם לתהליך הלוגין כשמשתמש מזוהה לפי UPN.'
    },
    {
      q: 'מה ההבדל בין Security Group ל-Distribution Group ב-AD?',
      o: ['Security Group אפשר להשתמש בה גם להענקת הרשאות (ACL) וגם לדיוור; Distribution Group רק לדיוור', 'אין שום הבדל בין השתיים', 'Distribution Group משמשת רק להרשאות NTFS', 'Security Group קיימת רק בסביבת Exchange'],
      a: 0,
      w: 'Security Group היא "שקית" שאפשר להוסיף לה הרשאות בקבצים, שיתופים או GPO, ואפשר גם לשלוח אליה מייל. Distribution Group משמשת אך ורק לרשימות תפוצה, ולא ניתן להעניק לה הרשאות.'
    },
    {
      q: 'מהי רשומת DNS מסוג SRV?',
      o: ['רשומה שמצביעה על שירות ספציפי (כמו LDAP), כוללת פורט ועדיפות - קריטית לאיתור Domain Controllers', 'רשומה שמתרגמת שם מחשב לכתובת IPv4', 'רשומת דואר אלקטרוני (Mail Exchange)', 'כינוי (Alias) לרשומת A קיימת'],
      a: 0,
      w: 'רשומות SRV (למשל <code>_ldap._tcp.dc._msdcs.corp.local</code>) הן הדרך שבה תחנות מאתרות שירותי AD ברשת - בלעדיהן תחנה לא תדע לאיזה Domain Controller לפנות.'
    },
    {
      q: 'מהי רשומת DNS מסוג PTR?',
      o: ['תרגום הפוך - מכתובת IP לשם המחשב, נמצאת ב-Reverse Lookup Zone', 'תרגום שם ל-IPv6', 'כינוי המצביע לרשומת A אחרת', 'רשומה המפרסמת שירות ברשת'],
      a: 0,
      w: 'בעוד רשומת A מתרגמת שם ל-IP, רשומת PTR עושה את הפעולה ההפוכה - שימושית לדוגמה בלוגים או בהזדהות שרתי דואר שבודקים "reverse DNS".'
    },
    {
      q: 'מהו DHCP Scope?',
      o: ['טווח כתובות IP שהשרת רשאי להקצות ללקוחות ברשת מסוימת, כולל אפשרויות כמו Gateway ו-DNS', 'רשימת שמות מחשבים מורשים בלבד', 'טבלת ניתוב (Routing Table)', 'מסד הנתונים של Active Directory'],
      a: 0,
      w: 'ה-Scope מגדיר טווח IP (למשל 192.168.1.100-200), משך Lease, ואפשרויות נלוות (Gateway, DNS Servers) שיישלחו אוטומטית לכל לקוח שמקבל כתובת מהשרת.'
    },
    {
      q: 'מה קורה כשיש התנגשות בין הרשאת NTFS להרשאת Share על אותו קובץ ברשת?',
      o: ['ההרשאה האפקטיבית היא המחמירה מבין השתיים (Most Restrictive Wins)', 'הרשאת Share תמיד גוברת על NTFS', 'הרשאת NTFS תמיד גוברת על Share', 'המשתמש מקבל אוטומטית Full Control'],
      a: 0,
      w: 'כשמשתמש ניגש לקובץ דרך שיתוף רשת, Windows בודק את שתי שכבות ההרשאה (Share ו-NTFS) ומיישם את המחמירה מביניהן - זו הסיבה שנהוג להשאיר את הרשאות ה-Share רחבות (Everyone: Full Control) ולשלוט בגישה בפועל דרך NTFS.'
    },
    {
      q: 'מה ההבדל בין הרשאת NTFS "Modify" להרשאת "Full Control"?',
      o: ['Modify מאפשרת קריאה/כתיבה/מחיקה אך לא שינוי הרשאות או בעלות; Full Control מאפשרת גם את זה', 'אין שום הבדל מעשי בין השתיים', 'Modify מיועדת רק לתיקיות ולא לקבצים', 'Full Control חוסמת אפשרות מחיקה'],
      a: 0,
      w: 'Full Control היא ההרשאה הרחבה ביותר - היא כוללת גם את היכולת לשנות הרשאות (ACL) ולשנות בעלות (Ownership), משהו ש-Modify לא מאפשרת. ברוב תרחישי העבודה השוטפת Modify מספיקה ובטוחה יותר.'
    },
    {
      q: 'מה משמעות ההגדרה Enforced על GPO?',
      o: ['ה-GPO לא ניתן לחסימה על ידי Block Inheritance ב-OU בנים, ותמיד גובר בקונפליקטים מול GPOs אחרים', 'ה-GPO מוחל רק על חשבונות מנהלים', 'ה-GPO נמחק אוטומטית אחרי יישום ראשון', 'ה-GPO מיושם פעם אחת בלבד ולא מתעדכן'],
      a: 0,
      w: 'GPO שמוגדר Enforced "שובר" את מנגנון ה-Block Inheritance ב-OU-ים תחתיו, ובנוסף מנצח בעימות הגדרות מול GPO אחר שאינו Enforced - שימושי למדיניות אבטחה קריטית שחייבת לחול תמיד.'
    },
    {
      q: 'מהו Block Inheritance ב-Group Policy?',
      o: ['הגדרה ברמת OU שמונעת הורשה של GPOs מ-OU הורה (למעט GPO שמוגדר Enforced)', 'ביטול GPO לצמיתות מתוך AD', 'חסימת גישת רשת לתחנה מסוימת', 'מניעת יצירת OU חדש תחת ה-OU הנוכחי'],
      a: 0,
      w: 'Block Inheritance מאפשר ל-OU "לסנן" מדיניות שמגיעה מלמעלה - שימושי כשיש OU עם דרישות שונות לחלוטין. עם זאת, GPO שמוגדר Enforced תמיד יעקוף חסימה כזו.'
    },
    {
      q: 'באיזה סדר מיושמת מדיניות קבוצתית לפי מודל LSDOU?',
      o: ['Local, Site, Domain, OU - כשה-GPO האחרון שמיושם (ברמת ה-OU) הוא בעל העדיפות הגבוהה ביותר בקונפליקט', 'OU, Domain, Site, Local - בסדר הפוך', 'הסדר אקראי בכל הפעלה מחדש', 'רק לפי סדר יצירת ה-GPO בזמן'],
      a: 0,
      w: 'מדיניות מקומית מיושמת ראשונה, ואז Site, Domain ולבסוף OU - וכל שכבה יכולה לדרוס את קודמתה. לכן GPO שמקושר ל-OU הקרוב ביותר לאובייקט הוא בעל ההשפעה החזקה ביותר (אלא אם יש Enforced ברמה גבוהה יותר).'
    },
    {
      q: 'מהו IIS Application Pool?',
      o: ['סביבת ריצה מבודדת (worker process) עבור אפליקציית ווב, המאפשרת בידוד תקלות בין אתרים שונים', 'תיקיית קבצי הלוג של השרת', 'רשימת המשתמשים המורשים לגשת לאתר', 'מסד הנתונים הפנימי של IIS'],
      a: 0,
      w: 'כל Application Pool רץ בתהליך (Process) נפרד. אם אתר אחד קורס או תוקע, זה לא משפיע על אתרים אחרים שרצים ב-Application Pool נפרד - עיקרון בידוד בסיסי בתכנון שרתי IIS.'
    },
    {
      q: 'מהו Hyper-V Checkpoint (Snapshot)?',
      o: ['תמונת מצב של VM בנקודת זמן מסוימת, המאפשרת לחזור אליה אם משהו משתבש', 'גיבוי מלא לקלטת (Tape)', 'שכפול קבוע ורציף של ה-VM לשרת אחר', 'העברה חיה (Live Migration) של VM'],
      a: 0,
      w: 'Checkpoint נלקח בדרך כלל לפני פעולה מסוכנת (כמו עדכון גדול) - אם משהו משתבש, אפשר "לחזור אחורה" בקלות. חשוב לזכור שזה לא תחליף לגיבוי אמיתי לטווח ארוך.'
    },
    {
      q: 'מהו System State בגיבוי Windows Server?',
      o: ['אוסף קבצים קריטיים לשחזור המערכת (רישום, Boot files, ומסד AD אם קיים)', 'רק תיקיית Documents של המשתמשים המקומיים', 'גיבוי מלא של כל הדיסקים כולל כל הנתונים', 'רשימת השירותים הרצים כרגע בזיכרון'],
      a: 0,
      w: 'System State הוא הבסיס לשחזור שרת אחרי תקלה - הוא כולל את הרישום (Registry), קבצי אתחול, ואם השרת הוא Domain Controller גם עותק ממסד הנתונים של AD (NTDS.dit).'
    }
  ];

  /* ============================================================
     מצב 2 - ניחוש פלט: פקודת PowerShell/מצב מערכת + מה קורה בפועל
     ============================================================ */
  var STATUS_GUESS = [
    {
      code: 'PS C:\\> Get-ADUser -Filter {Enabled -eq $false} | Measure-Object\n\nCount    : 4',
      q: 'מה עושה בפועל השילוב הזה של פקודות?',
      o: ['סופר כמה משתמשי AD מושבתים (Disabled) קיימים כרגע בדומיין', 'מוחק את כל המשתמשים המושבתים', 'מפעיל מחדש 4 משתמשים שהיו מושבתים', 'יוצר קבוצת אבטחה חדשה עם 4 חברים'],
      a: 0,
      w: '<code>Get-ADUser -Filter {Enabled -eq $false}</code> מחזירה את כל המשתמשים המושבתים, ו-<code>Measure-Object</code> רק סופר אותם - שתי הפקודות לא משנות שום דבר בפועל.'
    },
    {
      code: 'PS C:\\> dcdiag /test:dns\n...\n      TEST: DNS server: (test skipped)\n      ......................... srv-dc01 passed test DNS',
      q: 'מה בעצם בודקת הפקודה <code>dcdiag /test:dns</code>?',
      o: ['את תקינות תצורת ה-DNS על גבי ה-Domain Controller - רשומות SRV, sockets וקישוריות', 'מהירות הרשת הפיזית של השרת', 'תקינות הדיסקים בשרת', 'חיבור השרת לאינטרנט'],
      a: 0,
      w: 'dcdiag היא כלי האבחון המרכזי לבדיקת תקינות Domain Controller. הדגל <code>/test:dns</code> מתמקד ספציפית בבדיקת ה-DNS - קריטי כי בעיית DNS היא סיבה נפוצה מאוד לתקלות AD.'
    },
    {
      code: 'PS C:\\> Get-Service -Name DNS\n\nStatus   Name  DisplayName\n------   ----  -----------\nStopped  DNS   DNS Server',
      q: 'שירות ה-DNS מוצג כ-Stopped. מה המשמעות המעשית לרשת?',
      o: ['שרת ה-DNS לא יענה לשאילתות רזולוציית שמות, מה שעלול לפגוע קשות ב-AD ובתחנות', 'אין השפעה - השירות לא חיוני לתפקוד השרת', 'כל כתובות ה-IP ברשת יתאפסו אוטומטית', 'שרת ה-DHCP יפסיק להעניק כתובות'],
      a: 0,
      w: 'DNS הוא תשתית קריטית - תחנות משתמשות בו כדי לאתר Domain Controllers, שרתי קבצים ושירותים אחרים. אם השירות עצור, תחנות עלולות להיתקל בשגיאות התחברות לדומיין תוך זמן קצר.'
    },
    {
      code: 'PS C:\\> Get-DhcpServerv4Scope\n\nScopeId       Name  State     StartRange     EndRange\n-------       ----  -----     ----------     --------\n192.168.1.0   LAN   Inactive  192.168.1.100  192.168.1.200',
      q: 'ה-Scope מוצג כ-Inactive. מה קורה בפועל לרשת?',
      o: ['שרת ה-DHCP לא יחלק כתובות מהטווח הזה ללקוחות, גם שהוא מוגדר ותקין', 'הטווח פעיל אך רק עבור תחנות עם כתובת סטטית', 'כל הכתובות בטווח שמורות (Reserved) בלבד', 'זהו מצב שגיאה שדורש הסרה מלאה של ה-Scope'],
      a: 0,
      w: 'Scope שנוצר לא מופעל אוטומטית - צריך להריץ <code>Set-DhcpServerv4Scope -State Active</code> (או להפעיל דרך הממשק) כדי ששרת ה-DHCP באמת יתחיל לחלק כתובות ממנו.'
    },
    {
      code: 'PS C:\\> icacls C:\\Shared\\report.docx\n\nC:\\Shared\\report.docx CORP\\HR-Team:(F)\n                       CORP\\Domain Users:(R)',
      q: 'מה מייצגים ה-(F) וה-(R) בפלט של icacls?',
      o: ['F = Full Control, R = Read - קיצורי הרשאות NTFS עבור כל Trustee ברשימה', 'F = File, R = מציין תכונת Read-only בלבד על הקובץ', 'שני האותיות מייצגות תאריכי הגישה האחרונים', 'F = Folder, R = Root - סוג האובייקט בלבד'],
      a: 0,
      w: 'icacls מציג לכל Trustee (משתמש/קבוצה) את קיצור ההרשאה שהוענקה לו: F=Full, M=Modify, RX=Read&Execute, R=Read, W=Write - הבנת הקיצורים חיונית לניתוח מהיר של הרשאות בלי לפתוח GUI.'
    },
    {
      code: 'PS C:\\> Get-VM\n\nName          State    CPUUsage(%) MemoryAssigned(M)\n----          -----    ----------- -----------------\nSRV-FILE-02   Running  3           4096\nSRV-WEB-01    Off      0           0',
      q: 'מה ניתן להסיק בביטחון לגבי SRV-WEB-01 מתוך הפלט הזה?',
      o: ['ה-VM כבוי כרגע ולא צורך כלל משאבי CPU או זיכרון מה-Host', 'ה-VM נמחק לצמיתות מהשרת', 'ה-VM נמצא כרגע בתהליך שחזור מ-Checkpoint', 'ה-VM חסום על ידי כלל ב-Windows Firewall'],
      a: 0,
      w: 'עמודת ה-State מראה את מצב ההפעלה בפועל. VM ב-Off לא רץ ולכן לא צורך משאבים - הוא עדיין קיים על הדיסק ואפשר להפעיל אותו מחדש עם <code>Start-VM</code>.'
    },
    {
      code: 'PS C:\\> Test-NetConnection -ComputerName srv-dc01 -Port 389\n\nComputerName     : srv-dc01\nRemotePort       : 389\nTcpTestSucceeded : True',
      q: 'הבדיקה מול פורט 389 הצליחה. איזה שירות זה מאמת שזמין?',
      o: ['LDAP - תקשורת עם Active Directory', 'DNS', 'HTTP', 'RDP'],
      a: 0,
      w: 'פורט 389 הוא הפורט הסטנדרטי של LDAP - חלק חשוב מבדיקת קישוריות בין תחנה ל-Domain Controller. כדאי להכיר גם 53 (DNS), 3389 (RDP) ו-88 (Kerberos) לצורך אבחון דומה.'
    },
    {
      code: 'PS C:\\> Get-WindowsFeature -Name Web-Server\n\nDisplay Name         Name        Install State\n------------          ----        -------------\n[ ] Web Server (IIS)  Web-Server  Available',
      q: 'מה אומרים ה-[ ] הריק וה-"Available" יחד בפלט הזה?',
      o: ['התפקיד IIS אינו מותקן כרגע על השרת, אך אפשר להתקינו', 'התפקיד מותקן ופעיל במלואו', 'קיימת שגיאה בתהליך ההתקנה', 'התפקיד יוסר אוטומטית באתחול הבא'],
      a: 0,
      w: 'סימן [X] מציין תפקיד מותקן, ו-[ ] ריק מציין שהוא זמין להתקנה אך עדיין לא מותקן. כדי להתקין בפועל צריך להריץ <code>Install-WindowsFeature -Name Web-Server</code>.'
    },
    {
      code: 'PS C:\\> gpresult /r\n...\nApplied Group Policy Objects\n-----------------------------\n    Default Domain Policy\n    Restrict-USB-GPO',
      q: 'מה מציג בפועל הפלט הזה למי שהריץ את הפקודה?',
      o: ['רשימת ה-GPOs שבפועל הוחלו על המחשב/משתמש הנוכחי בהתחברות זו', 'רשימת כל ה-GPOs הקיימים בכל הדומיין', 'רשימת שגיאות התקנה בשרת', 'רשימת המשתמשים החברים בקבוצת ה-IT'],
      a: 0,
      w: '<code>gpresult /r</code> הוא כלי האבחון הבסיסי ביותר לבדיקת Group Policy - הוא מראה בדיוק אילו GPOs "ניצחו" והוחלו בפועל, מה שעוזר מאוד כשמדיניות לא מתנהגת כמצופה.'
    },
    {
      code: 'PS C:\\> New-ADUser -Name "Dana Cohen" -SamAccountName "danac" -Enabled $true\n\nNew-ADUser : The password does not meet the length, complexity, or\nhistory requirements of the domain.',
      q: 'מדוע הפקודה נכשלה למרות שהוזנו שם, SamAccountName והדגל Enabled?',
      o: ['לא סופקה סיסמה (<code>-AccountPassword</code>) בעת יצירת משתמש עם <code>-Enabled $true</code>, ומדיניות הדומיין דורשת סיסמה תקינה', 'השם "Dana Cohen" מכיל רווח שאסור בשם משתמש', 'ה-SamAccountName ארוך מדי עבור AD', 'חסר Path ל-OU בפקודה ולכן היא נכשלת'],
      a: 0,
      w: 'כדי ליצור משתמש מאופשר (Enabled) חובה לספק סיסמה שעומדת במדיניות הסיסמאות של הדומיין, למשל עם <code>-AccountPassword (ConvertTo-SecureString "P@ssw0rd!" -AsPlainText -Force)</code>. בלי סיסמה תקינה, AD חוסם את ההפעלה מטעמי אבטחה.'
    },
    {
      code: 'PS C:\\> Get-NetFirewallRule -DisplayName "Allow-RDP" | Select DisplayName, Enabled, Direction, Action\n\nDisplayName Enabled Direction Action\n----------- ------- --------- ------\nAllow-RDP   False   Inbound   Allow',
      q: 'מה המשמעות המעשית של Enabled : False בכלל חומת אש הזה?',
      o: ['הכלל קיים במערכת אך אינו פעיל, ולכן לא משפיע בפועל על תעבורת הרשת', 'RDP חסום לחלוטין ברמת המערכת ללא קשר לכלל הזה', 'הכלל יימחק אוטומטית בהפעלה הבאה של השרת', 'RDP פתוח לכל הכתובות ברשת ללא הגבלה'],
      a: 0,
      w: 'כלל Firewall מוגדר עם <code>Action: Allow</code> לא בהכרח פעיל - השדה <code>Enabled</code> קובע אם הכלל בכלל נאכף. כלל לא-מאופשר לא משפיע כלל, גם אם ההגדרות שלו נראות תקינות.'
    },
    {
      code: 'PS C:\\> wbadmin get versions\n\nBackup time: 8/25/2026 2:00 AM\nBackup target: E:\nVersion identifier: 08/25/2026-02:00\nCan recover: Volume(s), File(s), Application(s), Bare Metal Recovery, System State',
      q: 'מה מלמד אותנו הפלט על אפשרויות השחזור מתוך הגיבוי הזה?',
      o: ['ניתן לשחזר ממנו גם קבצים בודדים, גם Volume שלם וגם System State/Bare Metal Recovery', 'ניתן לשחזר רק קובץ בודד ותו לא', 'הגיבוי פגום ולא ניתן לביצוע שחזור כלל', 'הגיבוי מכיל רק את הגדרות הרשת של השרת'],
      a: 0,
      w: 'שורת "Can recover" מפרטת בדיוק אילו סוגי שחזור אפשריים מתוך גיבוי ספציפי - גיבוי שנוצר עם <code>-allCritical</code> בדרך כלל מאפשר גם שחזור מלא של השרת (Bare Metal) וגם שחזור נקודתי של קבצים.'
    },
    {
      code: 'PS C:\\> Resolve-DnsName -Name _ldap._tcp.dc._msdcs.corp.local -Type SRV\n\nName                             Type Priority Weight Port Target\n----                             ---- -------- ------ ---- ------\n_ldap._tcp.dc._msdcs.corp.local  SRV  0        100    389  srv-dc01.corp.local',
      q: 'מה השאילתה הזו בודקת בפועל, ולמה היא קריטית לתחנות בדומיין?',
      o: ['היא מאתרת אילו Domain Controllers מפרסמים שירות LDAP - תחנה שלא מקבלת מענה כאן לא תצליח להתחבר ל-AD', 'היא בודקת את מהירות חיבור האינטרנט של השרת', 'היא מציגה רשימה של מדפסות רשת זמינות', 'היא בודקת אך ורק את תקינות שירות ה-DHCP'],
      a: 0,
      w: 'זו אחת מבדיקות ה-DNS החשובות ביותר לאבחון תקלות AD - אם התחנה לא מקבלת תשובה לשאילתה כזו, סימן שהיא לא יכולה לאתר Domain Controller בכלל, וכל תהליכי הלוגין וההרשאות ייכשלו.'
    }
  ];

  /* ============================================================
     מצב 3 - השלמת פקודה: פקודת PowerShell עם חלק חסר
     ============================================================ */
  var CMD_COMPLETE = [
    {
      code: 'PS C:\\> New-ADUser -Name "Dana Cohen" -SamAccountName "danac" -___ $true',
      q: 'מה משלים את הפקודה כדי ליצור את המשתמש במצב מאופשר (לא Disabled)?',
      o: ['<code>-Enabled</code>', '<code>-Active</code>', '<code>-Unlock</code>', '<code>-Status</code>'],
      a: 0,
      w: 'כברירת מחדל <code>New-ADUser</code> יוצר משתמש מושבת. הדגל <code>-Enabled $true</code> מאפשר אותו מיד - בתנאי שסופקה גם סיסמה תקינה עם <code>-AccountPassword</code>.'
    },
    {
      code: 'PS C:\\> Get-ADUser -Filter {Name -___ "*Cohen*"}',
      q: 'מה משלים את הפקודה כדי לסנן משתמשים שהשם שלהם מכיל את המחרוזת "Cohen"?',
      o: ['<code>-like</code>', '<code>-eq</code>', '<code>-contains</code>', '<code>-in</code>'],
      a: 0,
      w: 'תחביר ה-<code>-Filter</code> ב-AD דומה לתחביר PowerShell רגיל - <code>-like</code> עם תווים כלליים (<code>*</code>) הוא הדרך הנפוצה לחיפוש התאמה חלקית בשם.'
    },
    {
      code: 'PS C:\\> New-DhcpServerv4Scope -Name "LAN" -StartRange 192.168.1.100 -EndRange 192.168.1.200 -___ 255.255.255.0',
      q: 'מה משלים את הפקודה ומגדיר את מסכת הרשת (Subnet Mask) של ה-Scope?',
      o: ['<code>-SubnetMask</code>', '<code>-Gateway</code>', '<code>-Prefix</code>', '<code>-Netmask</code>'],
      a: 0,
      w: '<code>-SubnetMask</code> הוא הפרמטר הנדרש כדי להגדיר את גודל הרשת עבור ה-Scope החדש. את כתובת ה-Gateway מגדירים בנפרד עם <code>Set-DhcpServerv4OptionValue -Router</code>.'
    },
    {
      code: 'PS C:\\> Add-DnsServerResourceRecordA -Name "web01" -ZoneName "corp.local" -___ 192.168.1.50',
      q: 'מה משלים את הפקודה כדי לקבוע את כתובת ה-IPv4 של רשומת ה-A החדשה?',
      o: ['<code>-IPv4Address</code>', '<code>-Address</code>', '<code>-Target</code>', '<code>-Value</code>'],
      a: 0,
      w: '<code>-IPv4Address</code> הוא הפרמטר הנדרש ביצירת רשומת A. לשם השוואה, ביצירת CNAME משתמשים בפרמטר <code>-HostNameAlias</code> במקום.'
    },
    {
      code: 'PS C:\\> icacls C:\\Shared\\report.docx /___ CORP\\HR-Team:F',
      q: 'מה משלים את הפקודה כדי להעניק הרשאת Full Control לקבוצה CORP\\HR-Team?',
      o: ['<code>grant</code>', '<code>add</code>', '<code>set</code>', '<code>allow</code>'],
      a: 0,
      w: '<code>icacls &lt;path&gt; /grant &lt;user&gt;:&lt;perm&gt;</code> הוא התחביר הנפוץ להענקת הרשאות NTFS משורת הפקודה. לביטול הרשאה משתמשים ב-<code>/remove</code>.'
    },
    {
      code: 'PS C:\\> Install-WindowsFeature -Name DNS -___',
      q: 'מה משלים את הפקודה כדי להתקין יחד עם התפקיד גם את כלי הניהול (GUI/PowerShell)?',
      o: ['<code>-IncludeManagementTools</code>', '<code>-WithTools</code>', '<code>-AddGUI</code>', '<code>-Full</code>'],
      a: 0,
      w: 'בלי <code>-IncludeManagementTools</code> התפקיד יותקן, אך כלי הניהול (כמו קונסולת DNS Manager או מודול ה-PowerShell המתאים) לא יותקנו יחד איתו - ותצטרכו להוסיף אותם בנפרד מאוחר יותר.'
    },
    {
      code: 'PS C:\\> New-VM -Name "SRV-TEST" -MemoryStartupBytes 2GB -___ 2 -NewVHDPath "D:\\VMs\\test.vhdx" -NewVHDSizeBytes 40GB',
      q: 'מה משלים את הפקודה כדי להגדיר את ה-VM כ-Generation 2 (מבוסס UEFI)?',
      o: ['<code>-Generation</code>', '<code>-Gen</code>', '<code>-BootType</code>', '<code>-Version</code>'],
      a: 0,
      w: '<code>-Generation 2</code> יוצר VM מבוסס UEFI עם Secure Boot וזמני אתחול מהירים יותר. בלי ציון הפרמטר, ברירת המחדל היא Generation 1 (BIOS legacy).'
    },
    {
      code: 'PS C:\\> Checkpoint-VM -Name "SRV-TEST" -___ "Before-Update"',
      q: 'מה משלים את הפקודה כדי לתת שם משמעותי לתמונת המצב שנוצרת?',
      o: ['<code>-SnapshotName</code>', '<code>-Name</code> (שוב)', '<code>-Label</code>', '<code>-Tag</code>'],
      a: 0,
      w: '<code>-SnapshotName</code> מוסיף תיאור קריא לתמונת המצב, כדי לזהות בקלות מאוחר יותר לאיזו נקודת זמן בדיוק כדאי לחזור.'
    },
    {
      code: 'PS C:\\> wbadmin start backup -backupTarget:E: -___ -quiet',
      q: 'מה משלים את הפקודה כדי לגבות בבת אחת את כל הכרכים הדרושים לשחזור מלא של השרת?',
      o: ['<code>-allCritical</code>', '<code>-include:C:</code> בלבד', '<code>-systemState</code> בלבד', '<code>-full</code>'],
      a: 0,
      w: '<code>-allCritical</code> מגבה אוטומטית את כל הכרכים הדרושים לשחזור מלא (Bare Metal Recovery), כולל System State - בלי צורך לפרט ידנית אילו כרכים קריטיים.'
    },
    {
      code: 'PS C:\\> New-NetFirewallRule -DisplayName "Allow-HTTP" -Direction Inbound -LocalPort 80 -Protocol TCP -Action ___',
      q: 'מה משלים את הפקודה כדי לאפשר את התעבורה הנכנסת בפורט 80 (במקום לחסום אותה)?',
      o: ['<code>Allow</code>', '<code>Permit</code>', '<code>Open</code>', '<code>Enable</code>'],
      a: 0,
      w: 'הערך <code>-Action Allow</code> (בניגוד ל-<code>Block</code>) קובע שהכלל מתיר את התעבורה התואמת, בהנחה שהכלל עצמו מאופשר (<code>Enabled</code>).'
    },
    {
      code: 'PS C:\\> Set-GPRegistryValue -Name "Restrict-USB-GPO" -Key "HKLM\\Software\\Policies\\Microsoft\\Windows\\RemovableStorageDevices" -ValueName "Deny_All" -___ 1 -Type DWord',
      q: 'מה משלים את הפקודה כדי לקבוע את הערך שיוגדר ברישום דרך ה-GPO?',
      o: ['<code>-Value</code>', '<code>-Data</code>', '<code>-Content</code>', '<code>-Set</code>'],
      a: 0,
      w: '<code>-Value</code> הוא הפרמטר שקובע את הערך המספרי או המחרוזתי שייכתב במפתח הרישום שצוין ב-<code>-Key</code>, בשילוב עם סוג הערך שמצוין ב-<code>-Type</code>.'
    },
    {
      code: 'PS C:\\> Move-ADObject -Identity "CN=Dana Cohen,OU=OldUsers,DC=corp,DC=local" -___ "OU=NewUsers,DC=corp,DC=local"',
      q: 'מה משלים את הפקודה כדי להעביר את האובייקט אל ה-OU החדש?',
      o: ['<code>-TargetPath</code>', '<code>-Destination</code>', '<code>-NewPath</code>', '<code>-MoveTo</code>'],
      a: 0,
      w: '<code>-TargetPath</code> מציין את ה-Distinguished Name של ה-OU שאליו יועבר האובייקט. הפקודה שומרת על שאר תכונות האובייקט ומעדכנת רק את מיקומו בעץ ה-AD.'
    },
    {
      code: 'PS C:\\> Add-DhcpServerv4Failover -ComputerName "DHCP01" -PartnerServer "DHCP02" -Name "LAN-Failover" -___ LoadBalance',
      q: 'מה משלים את הפקודה כדי לקבוע שה-Failover יעבוד במצב איזון עומסים בין שני השרתים?',
      o: ['<code>-Mode</code>', '<code>-Type</code>', '<code>-Balance</code>', '<code>-State</code>'],
      a: 0,
      w: 'הפרמטר <code>-Mode</code> קובע את סוג ה-Failover: <code>LoadBalance</code> (חלוקת עומס בין שני השרתים באחוזים) או <code>HotStandby</code> (שרת גיבוי פסיבי שנכנס לפעולה רק בעת תקלה).'
    }
  ];

  /* ============================================================
     מצב 4 - התאמת מושגים: סבבים של זוגות מונח/פקודה + תיאור
     ============================================================ */
  var MATCH_ROUNDS = [
    {
      title: 'מבנה ואובייקטים ב-Active Directory',
      pairs: [
        { l: 'Domain Controller', r: 'שרת שמריץ AD DS ומאמת משתמשים בדומיין' },
        { l: 'OU (Organizational Unit)', r: 'תיקייה לוגית לארגון אובייקטים וקישור GPO' },
        { l: 'Forest', r: 'האוסף הגדול ביותר של דומיינים החולק Schema ו-Global Catalog משותפים' },
        { l: 'FSMO Roles', r: 'חמישה תפקידים קריטיים המחולקים בין Domain Controllers' },
        { l: 'Global Catalog', r: 'DC המחזיק אינדקס חלקי מכל האובייקטים ביער, לחיפוש ולוגין מהיר' }
      ]
    },
    {
      title: 'מדיניות קבוצתית (GPO)',
      pairs: [
        { l: 'GPO (Group Policy Object)', r: 'אוסף הגדרות המוחל על משתמשים/מחשבים דרך AD' },
        { l: '<code>gpupdate /force</code>', r: 'מכריח רענון מיידי של מדיניות קבוצתית בתחנה' },
        { l: '<code>gpresult /r</code>', r: 'מציג אילו GPOs בפועל הוחלו על המחשב/משתמש הנוכחי' },
        { l: 'Block Inheritance', r: 'מונע הורשת GPOs מ-OU הורה (למעט GPO שמוגדר Enforced)' },
        { l: 'Loopback Processing', r: 'מיישם הגדרות משתמש לפי מיקום המחשב ולא לפי מיקום המשתמש' }
      ]
    },
    {
      title: 'שירותי DNS ו-DHCP',
      pairs: [
        { l: 'רשומת A', r: 'תרגום שם מחשב לכתובת IPv4' },
        { l: 'רשומת PTR', r: 'תרגום הפוך מכתובת IP לשם מחשב (Reverse Lookup)' },
        { l: 'רשומת SRV', r: 'מצביעה על שירות ספציפי (כמו LDAP), כולל פורט ועדיפות' },
        { l: 'DHCP Scope', r: 'טווח כתובות IP שהשרת מורשה להקצות ברשת מסוימת' },
        { l: 'DHCP Lease', r: 'משך הזמן שכתובת IP מוקצית ללקוח לפני שצריך לחדש אותה' }
      ]
    },
    {
      title: 'הרשאות קבצים ושיתופים',
      pairs: [
        { l: 'NTFS Permissions', r: 'הרשאות ברמת הדיסק/הקובץ עצמו, תקפות גם מקומית וגם מרחוק' },
        { l: 'Share Permissions', r: 'הרשאות ברמת השיתוף ברשת בלבד, לא משפיעות על גישה מקומית' },
        { l: 'Full Control', r: 'ההרשאה הרחבה ביותר, כוללת גם שינוי הרשאות ובעלות' },
        { l: '<code>icacls</code>', r: 'כלי שורת פקודה להצגה ועריכה של הרשאות NTFS' },
        { l: 'Most Restrictive Wins', r: 'העיקרון לפיו ההרשאה האפקטיבית היא המחמירה מבין NTFS ו-Share' }
      ]
    },
    {
      title: 'Hyper-V ו-IIS',
      pairs: [
        { l: 'Generation 2 VM', r: 'מכונה וירטואלית מבוססת UEFI, עם Secure Boot וזמני אתחול מהירים' },
        { l: 'Checkpoint', r: 'תמונת מצב של VM שמאפשרת חזרה אחורה בזמן' },
        { l: 'Virtual Switch (External)', r: 'מתג המחבר VMs לרשת הפיזית ולאינטרנט' },
        { l: 'Application Pool', r: 'סביבת ריצה מבודדת באתר IIS, מפרידה תקלות בין אפליקציות' },
        { l: 'Site Binding', r: 'ההגדרה שקושרת אתר IIS לכתובת IP, פורט ו-Host Header ספציפיים' }
      ]
    }
  ];

  /* ============================================================
     מצב 5 - סידור תהליך: סבבים של שלבים שצריך לסדר בסדר הנכון
     ============================================================ */
  var ORDER_ROUNDS = [
    {
      title: 'הקמת Domain Controller חדש בדומיין קיים',
      steps: [
        'הגדרת כתובת IP סטטית ושרת DNS ראשוני בשרת החדש',
        'התקנת התפקיד עם Install-WindowsFeature AD-Domain-Services',
        'הרצת Install-ADDSDomainController וציון שם הדומיין הקיים',
        'הזנת סיסמת DSRM (Directory Services Restore Mode) והמתנה להפעלה מחדש',
        'אימות תקינות ה-DC החדש עם dcdiag ו-Get-ADDomainController'
      ]
    },
    {
      title: 'הגדרת DHCP Failover בין שני שרתים',
      steps: [
        'התקנת תפקיד DHCP בשני השרתים והרשאתם (Authorize) ב-AD',
        'יצירת Scope תקין בשרת ה-DHCP הראשי עם New-DhcpServerv4Scope',
        'הפעלת (Activate) ה-Scope לאחר הגדרת הטווח וההגדרות הנלוות',
        'הרצת Add-DhcpServerv4Failover לקישור ה-Scope בין שני השרתים',
        'אימות שהסנכרון תקין ושה-Scope מופיע גם בשרת השני'
      ]
    },
    {
      title: 'יצירה ופריסה של GPO חדש',
      steps: [
        'פתיחת Group Policy Management Console (gpmc.msc)',
        'יצירת GPO חדש בעזרת New-GPO ומתן שם משמעותי',
        'עריכת ה-GPO והגדרת המדיניות הרצויה (Computer/User Configuration)',
        'קישור (Link) ה-GPO ל-OU הרלוונטי בעץ ה-AD',
        'הרצת gpupdate /force בתחנת בדיקה',
        'אימות ההחלה בפועל עם gpresult /r'
      ]
    },
    {
      title: 'יצירת VM חדשה ב-Hyper-V והתקנת מערכת הפעלה',
      steps: [
        'יצירת Virtual Switch מתאים עם New-VMSwitch (אם עדיין אין)',
        'יצירת ה-VM עם New-VM, כולל דיסק VHDX וכמות זיכרון',
        'חיבור קובץ ISO להתקנה עם Set-VMDvdDrive',
        'חיבור ה-VM ל-Virtual Switch עם Connect-VMNetworkAdapter',
        'הפעלת ה-VM עם Start-VM והתחברות דרך Hyper-V Manager',
        'התקנת מערכת ההפעלה והגדרות ראשוניות בתוך ה-VM'
      ]
    },
    {
      title: 'גיבוי ושחזור עם Windows Server Backup',
      steps: [
        'התקנת התכונה Windows-Server-Backup עם Install-WindowsFeature',
        'הגדרת יעד גיבוי (דיסק חיצוני או שיתוף רשת)',
        'הרצת wbadmin start backup עם -allCritical לביצוע גיבוי מלא',
        'בדיקת הצלחת הגיבוי עם wbadmin get versions',
        'במקרה תקלה, אתחול לסביבת שחזור והרצת wbadmin start systemstaterecovery'
      ]
    }
  ];

  /* ============================================================
     הגדרת מצבי המשחק
     ============================================================ */
  var MODES = [
    { key: 'rapid', icon: '⚡', name: 'קרב מהיר', desc: 'שאלות ידע כלליות על Windows Server - AD, GPO, DNS/DHCP, הרשאות, Hyper-V ועוד', type: 'quiz', data: RAPID, sample: 10, time: 20000 },
    { key: 'output', icon: '🔎', name: 'ניחוש פלט', desc: 'פקודת PowerShell או פלט מערכת - מה קורה בפועל?', type: 'quiz', data: STATUS_GUESS, sample: 8, time: 28000, showCode: true },
    { key: 'complete', icon: '🧩', name: 'השלמת פקודה', desc: 'פקודת PowerShell עם חלק חסר - בחרו מה משלים אותה נכון', type: 'quiz', data: CMD_COMPLETE, sample: 8, time: 28000, showCode: true },
    { key: 'match', icon: '🔗', name: 'התאמת מושגים', desc: 'התאימו כל מונח/פקודה בניהול Windows Server לתיאור הנכון שלו', type: 'match', data: MATCH_ROUNDS, sample: 3 },
    { key: 'order', icon: '📋', name: 'סידור תהליך', desc: 'סדרו את שלבי התהליך האדמיניסטרטיבי לפי הסדר הנכון', type: 'order', data: ORDER_ROUNDS, sample: 3 }
  ];

  window.TG_CONFIG = { gameId: "winsrv", modes: MODES };
})();
</script>

<script src="/scripts/topic-game.js"></script>
