---
title: "משחק לימודי: אתגר Check Point"
category: Check Point
part: 13/10
description: "משחק אינטראקטיבי ללימוד Check Point - חמישה מצבי משחק עם טיימר, לבבות, ניקוד ורצפים: קרב מהיר, ניתוח מדיניות ולוגים, השלמת פקודות CLI, התאמת מושגים וסידור תהליכים."
---

חמישה מצבי משחק שבודקים היבטים שונים של Check Point - ארכיטקטורה, מדיניות אבטחה ו-NAT, VPN, Identity Awareness, Threat Prevention ו-ClusterXL. לא עוד חידון רב-ברירה, אלא משחק עם **טיימר**, **שלושה לבבות**, **מכפיל רצף** ו**שיא אישי** שנשמר בדפדפן. בסוף כל סבב תקבלו דירוג, ורשימת חזרה של בדיוק מה שפספסתם.


<div class="tg" id="tg" dir="rtl">
  <div class="tg-screen is-active" data-screen="menu">
    <div class="tg-hero">
      <div class="tg-hero-badge">Check Point</div>
      <div class="tg-hero-title">אתגר Check Point</div>
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
      q: 'מהם שלושת הרכיבים המרכזיים בארכיטקטורת Check Point?',
      o: ['SmartConsole, Security Management Server (SMS) ו-Security Gateway', 'Gaia, Clish ו-Expert Mode', 'Quantum, CloudGuard ו-Harmony', 'IPS, Anti-Bot ו-Anti-Virus'],
      a: 0,
      w: 'זו ארכיטקטורת שלוש השכבות - SmartConsole הוא ה-GUI, ה-SMS הוא "המוח" ששומר מדיניות ולוגים, וה-Gateway הוא זה שאוכף בפועל את המדיניות בתעבורה.'
    },
    {
      q: 'על איזו מערכת הפעלה רצים Security Gateway ו-Security Management Server?',
      o: ['Gaia - מערכת ייעודית מבוססת לינוקס', 'Windows Server בלבד', 'Cisco IOS', 'macOS Server'],
      a: 0,
      w: 'Gaia היא מערכת ההפעלה הייעודית של Check Point, עם ממשק WebUI וגם שורת פקודות (Clish) ומעליה Expert Mode לגישה מלאה ל-Bash.'
    },
    {
      q: 'מהי Stateful Inspection?',
      o: ['שמירת טבלת חיבורים (State Table) שמתירה אוטומטית תעבורה חוזרת של session מוכר', 'בדיקת כל חבילה בנפרד ללא זיכרון של חיבורים קודמים', 'הצפנת כל התעבורה ברשת', 'זיהוי משתמשים לפי כתובת IP בלבד'],
      a: 0,
      w: 'בניגוד ל-Packet Filtering הישן, Stateful Inspection זוכרת את מצב כל חיבור - כך שחבילת תשובה לחיבור שכבר אושר לא צריכה כלל נפרד משלה.'
    },
    {
      q: 'מהו תפקידו של SIC (Secure Internal Communication)?',
      o: ['ערוץ תקשורת מוצפן ומאומת (מבוסס תעודות) בין ה-Management לגייטווי, נדרש לצורך Install Policy', 'פרוטוקול הצפנת VPN בין שני גייטווים', 'מנגנון סנכרון State בין חברי קלאסטר', 'שיטת זיהוי משתמשים ב-Identity Awareness'],
      a: 0,
      w: 'בלי SIC תקין, ה-Management לא יכול לדחוף מדיניות חדשה לגייטווי או למשוך ממנו לוגים - זו אחת מתקלות ה-Setup הנפוצות ביותר.'
    },
    {
      q: 'כיצד נבדקת ה-Rule Base כשמגיעה חבילת תעבורה?',
      o: ['מלמעלה למטה, וכלל ההתאמה הראשון שנמצא הוא זה שנאכף - הבדיקה לא ממשיכה הלאה', 'מלמטה למעלה, כלל אחרון קובע', 'לפי סדר אלפביתי של שמות הכללים', 'כל הכללים המתאימים נאכפים במקביל'],
      a: 0,
      w: 'זהו העיקרון החשוב ביותר בבניית מדיניות - כלל רחב מדי בראש הטבלה עלול "לבלוע" כללים ספציפיים יותר שמתחתיו.'
    },
    {
      q: 'מהו תפקידו של Cleanup Rule?',
      o: ['הכלל האחרון בטבלה - חוסם ורושם ללוג כל תעבורה שלא הותאמה לאף כלל קודם (Default Deny)', 'הכלל הראשון שמאפשר גישה ניהולית לגייטווי', 'כלל שמוחק לוגים ישנים באופן אוטומטי', 'כלל שמנקה כללי NAT לא בשימוש'],
      a: 0,
      w: 'זהו יישום של עקרון Least Privilege - כל מה שלא אושר במפורש נחסם כברירת מחדל, וגם נרשם ללוג לצורך מעקב.'
    },
    {
      q: 'מה ההבדל בין Action: Drop ל-Action: Reject באכיפת כלל?',
      o: ['Drop משמיד את החבילה בשקט; Reject שולח בחזרה RST/ICMP Unreachable', 'שני הפעולות זהות לחלוטין', 'Reject חוסם רק תעבורת TCP, Drop חוסם הכל', 'Drop רושם ללוג תמיד, Reject אף פעם לא'],
      a: 0,
      w: 'Drop "שותק" - השולח לא מקבל שום תגובה וממתין לטיים-אאוט. Reject מודיע לצד השני באופן מיידי שהחיבור נדחה.'
    },
    {
      q: 'מה עושה Hide NAT?',
      o: ['מסתיר רשת שלמה מאחורי כתובת IP אחת (בד"כ Gateway) - שימושי לגישה יוצאת', 'מבצע מיפוי אחד-לאחד קבוע בין כתובת פנימית לחיצונית', 'מבטל את כל כללי ה-NAT הקיימים', 'מצפין את התעבורה היוצאת'],
      a: 0,
      w: 'Hide NAT מתאים לתעבורה יוצאת מרשת פנימית שלמה לאינטרנט - כל המחשבים "נראים" מבחוץ כאילו הם ה-Gateway IP.'
    },
    {
      q: 'מה ההבדל בין Automatic NAT ל-Manual NAT?',
      o: ['Automatic מוגדר ישירות על לשונית NAT של האובייקט; Manual נכתב ידנית ב-NAT Rule Base לשליטה מדויקת יותר', 'Automatic עובד רק על שרתים, Manual רק על רשתות', 'אין הבדל מעשי בין השניים', 'Manual NAT דורש רישוי נפרד'],
      a: 0,
      w: 'Automatic NAT נוח ומהיר להגדרה בסיסית. Manual NAT נדרש כשצריך תנאים מורכבים יותר, כמו NAT מותנה לפי Source ספציפי או שירות מסוים בלבד.'
    },
    {
      q: 'מהו VPN Domain (Encryption Domain)?',
      o: ['הרשתות שמאחורי הגייטווי שרלוונטיות להצפנה - קובע איזו תעבורה תיכנס למנהרה', 'רשימת המשתמשים המורשים להתחבר ב-Remote Access', 'טווח כתובות ה-Office Mode', 'שם ה-Community של ה-VPN'],
      a: 0,
      w: 'VPN Domain מוגדר בלשונית Topology של אובייקט הגייטווי, וקובע אילו כתובות "מותרות" לעבור דרך המנהרה המוצפנת.'
    },
    {
      q: 'מה ההבדל בין Phase 1 ל-Phase 2 ב-IKE?',
      o: ['Phase 1 בונה ערוץ מאובטח ומבצע אימות בין הגייטווים; Phase 2 מקים את ה-IPsec SA שמצפין בפועל את התעבורה', 'Phase 1 ו-Phase 2 מתבצעים תמיד במקביל', 'Phase 2 מתבצע רק ב-Remote Access VPN', 'Phase 1 אחראי על הצפנת הנתונים עצמם'],
      a: 0,
      w: 'בטיפול בתקלות VPN תמיד בודקים קודם את Phase 1 - אם הוא נכשל (למשל אי-התאמה בהצפנה או Pre-Shared Key שגוי), אין טעם לבדוק את Phase 2.'
    },
    {
      q: 'מה ההבדל בין Meshed Community ל-Star Community ב-VPN?',
      o: ['ב-Meshed כל הגייטווים מדברים ישירות זה עם זה; ב-Star יש Hub מרכזי וה-Satellites מדברים רק דרכו', 'Star Community תומך רק בשני גייטווים', 'Meshed מוגבל ל-Remote Access VPN בלבד', 'אין הבדל בפועל, רק בשם'],
      a: 0,
      w: 'Meshed מתאים למספר קטן יחסית של אתרים שווים. Star (Hub-and-Spoke) מתאים לארגונים עם משרד ראשי מרכזי ועשרות סניפים.'
    },
    {
      q: 'מהי שיטת הזיהוי הנפוצה ביותר ב-Identity Awareness?',
      o: ['AD Query - שיטה Agentless שקוראת לוגי אבטחה מ-Domain Controller', 'Identity Agent המותקן על כל תחנת קצה', 'Captive Portal בלבד', 'RADIUS Accounting בלבד'],
      a: 0,
      w: 'AD Query פופולרי כי אינו דורש שום התקנה בתחנות הקצה - הגייטווי קורא את אירועי ה-Login/Logoff ישירות מה-DC.'
    },
    {
      q: 'מהו Access Role ב-Check Point?',
      o: ['אובייקט מדיניות המשלב רשת, משתמש/קבוצת AD ולעיתים מכשיר ספציפי', 'שם נוסף ל-Network Object רגיל', 'רשימת ה-Administrators המורשים ב-SmartConsole', 'אובייקט NAT מיוחד'],
      a: 0,
      w: 'Access Role מאפשר לבנות כללי Rule Base המבוססים על זהות ולא רק על כתובת IP - למשל גישה שמוגבלת לקבוצת "Finance" בלבד.'
    },
    {
      q: 'מה ההבדל בין IPS ל-Anti-Bot?',
      o: ['IPS חוסם ניצול פרצות (Exploits) לפי חתימות; Anti-Bot מזהה תקשורת של מכשירים נגועים עם שרתי C&C', 'שני ה-Blades זהים ומיותר להפעיל את שניהם', 'Anti-Bot פועל רק על תעבורת מייל', 'IPS פועל רק על תעבורה מוצפנת'],
      a: 0,
      w: 'IPS מתמקד במניעת חדירה בזמן אמת (Exploit), בעוד Anti-Bot מתמקד בזיהוי מכשירים שכבר נדבקו ומנסים "לדווח" לתוקף.'
    },
    {
      q: 'מה ההבדל בין Threat Emulation ל-Threat Extraction?',
      o: ['Emulation מריץ קובץ חשוד ב-Sandbox לבדיקת התנהגות; Extraction מנקה את הקובץ מאלמנטים פעילים ומעביר גרסה נקייה מיידית', 'שתי הטכנולוגיות פועלות רק על תעבורת HTTPS', 'Extraction דורש חומרה נפרדת תמיד', 'Emulation ו-Extraction הן אותה טכנולוגיה בשם אחר'],
      a: 0,
      w: 'Emulation "תופס" תוכנה זדונית לא-מוכרת דרך הרצה מבודדת (Zero-Day). Extraction (CDR) לא מנסה לזהות - הוא פשוט מסיר מאקרואים וסקריפטים ומעביר קובץ נקי מיד.'
    },
    {
      q: 'מה ההבדל בין High Availability Mode ל-Load Sharing Mode ב-ClusterXL?',
      o: ['ב-HA חבר אחד Active והשני Standby; ב-Load Sharing שני החברים פעילים בו-זמנית ומחלקים עומס', 'Load Sharing תומך רק בשני חברים בקלאסטר', 'HA לא תומך ב-Failover אוטומטי', 'אין הבדל מבחינת Sync'],
      a: 0,
      w: 'HA פשוט יותר לניהול ונפוץ יותר בפועל. Load Sharing (Multicast/Unicast) נבחר כשצריך ביצועים גבוהים יותר משני החברים בו-זמנית.'
    },
    {
      q: 'מדוע חייב Sync Interface להיות ברשת נפרדת מתעבורת ה-Production?',
      o: ['כדי לאפשר סנכרון State Table אמין ומהיר בין חברי הקלאסטר, בלי להתחרות על רוחב פס עם תעבורת המשתמשים', 'זו רק המלצה ולא דרישה קריטית', 'כדי לעמוד בדרישות רישוי בלבד', 'כי Sync Interface לא יכול להתחבר לאותו Switch כלל'],
      a: 0,
      w: 'שיתוף VLAN בין Sync לתעבורת Production עלול לגרום לעומס על ה-Sync ולבעיות ייצוב חמורות בזמן Failover.'
    }
  ];

  /* ============================================================
     מצב 2 - ניתוח מדיניות ולוגים: קטע Rule Base / לוג / פלט CLI
     ומה קורה בפועל
     ============================================================ */
  var POLICY_LOG = [
    {
      code: 'Rule 1: LAN_Out -> Internal_Net -> Any -> Any -> HTTP,HTTPS,DNS -> Accept -> Log\nRule 2: Cleanup  -> Any -> Any -> Any -> Any -> Drop -> Log',
      q: 'משתמש ברשת הפנימית מנסה לגשת החוצה בשירות SSH (פורט 22). איזה כלל יתפוס את התעבורה?',
      o: ['Rule 2 (Cleanup) - כי SSH לא נכלל ברשימת השירותים של Rule 1', 'Rule 1 - כי המקור והיעד תואמים', 'שני הכללים יתאימו בו-זמנית', 'התעבורה תעבור אוטומטית בלי לעבור אף כלל'],
      a: 0,
      w: 'הבדיקה עוברת מלמעלה למטה. Rule 1 מוגבל לשירותי HTTP/HTTPS/DNS בלבד, כך ש-SSH לא Match וממשיך עד ל-Cleanup Rule שחוסם ורושם כל תעבורה שלא הותאמה.'
    },
    {
      code: 'Object: Internal_Net (192.168.1.0/24)\nNAT Tab:\n  Add Automatic Address Translation Rules: V\n  Translation Method: Hide\n  Hide behind: Gateway IP (10.0.0.10)',
      q: 'מחשב בכתובת 192.168.1.55 גולש לאתר חיצוני. מה יראה השרת החיצוני ככתובת המקור של הבקשה?',
      o: ['10.0.0.10 - כתובת ה-Gateway שמאחוריה מוסתרת הרשת', '192.168.1.55 - הכתובת הפנימית המקורית', 'כתובת אקראית מתוך Pool כתובות ציבוריות', 'NAT לא יחול כי לא הוגדר כלל ידני'],
      a: 0,
      w: 'זהו Hide NAT אוטומטי - כל הרשת הפנימית "מוסתרת" מבחוץ מאחורי כתובת ה-Gateway היחידה שהוגדרה כ-Hide behind.'
    },
    {
      code: 'Time: 10:42:13 | Src: 192.168.1.20 | Dst: 8.8.8.8 | Service: dns_udp\nAction: Drop | Rule: 5 (Cleanup) | Blade: Firewall',
      q: 'מה משמעות שורת הלוג הזו?',
      o: ['פנייה ל-DNS חיצוני נחסמה כי לא הותאמה לאף כלל מלבד ה-Cleanup Rule', 'זהו אירוע שזוהה ע"י ה-IPS Blade', 'תעבורת VPN שנכשלה בשלב Phase 2', 'כלל NAT שנכשל בביצוע התרגום'],
      a: 0,
      w: 'שדה ה-Rule ו-Blade בלוג הם המפתח לאבחון: Rule 5 עם השם "Cleanup" ו-Blade "Firewall" מצביעים בבירור על חסימת ברירת מחדל, לא על הפרעה מ-Blade אחר.'
    },
    {
      code: 'Cluster Mode: High Availability (Active Up)\n\nID  Name    State\n1   FW-A    Active\n2   FW-B    Standby',
      q: 'מה מלמד הפלט הזה על מצב הקלאסטר כרגע?',
      o: ['FW-A אוכף את התעבורה כרגיל, ו-FW-B ממתין ומוכן לבצע Failover אם FW-A ייפול', 'שני החברים פעילים בו-זמנית ומחלקים עומס', 'הקלאסטר נמצא במצב תקלה שדורש טיפול מיידי', 'אין כלל תעבורה עוברת דרך הקלאסטר'],
      a: 0,
      w: 'זהו פלט תקין לחלוטין של קלאסטר ב-High Availability Mode - חבר אחד Active וחבר שני Standby, בדיוק כפי שצריך להיות.'
    },
    {
      code: '$ fw tab -t connections -s\nHOST      TABLE NAME    #VALS   PEAK    LIMIT\nlocalhost connections   182300  195000  200000',
      q: 'מה מעיד הפלט הזה על מצב הגייטווי?',
      o: ['טבלת החיבורים קרובה מאוד ל-Limit המוגדר - סימן אזהרה מוקדם לבעיות ביצועים או מתקפת DoS', 'אין שום חיבור פעיל כרגע בגייטווי', 'הגייטווי בטוח נמצא במצב תקלה', 'הפלט מציג נתוני NAT ולא חיבורים'],
      a: 0,
      w: 'כש-#VALS מתקרב ל-LIMIT, כל חיבור נוסף עלול להידחות. זהו אחד הסימנים הראשונים לבדוק כשיש דיווח על בעיות חיבוריות כלליות.'
    },
    {
      code: 'IKE: Phase 1 completed successfully.\nIKE: Phase 2 - No proposal chosen.',
      q: 'לפי הפלט הזה, מה כנראה הבעיה בהקמת ה-VPN?',
      o: ['אי-התאמה בהגדרות ה-VPN Domain או ההצפנה בשלב Phase 2, בעוד ש-Phase 1 (האימות הראשוני) הצליח', 'ה-Pre-Shared Key שגוי משני הצדדים', 'אין כלל בעיה - זו התנהגות תקינה של הקמת Tunnel', 'בעיית שרת DNS מונעת את הקמת ה-Tunnel'],
      a: 0,
      w: 'מכיוון ש-Phase 1 (האחראי על אימות והצפנת הערוץ הראשוני) הצליח, הבעיה כנראה בהגדרות ה-IPsec SA עצמו - למשל VPN Domain שלא תואם בין הצדדים.'
    },
    {
      code: 'Source: HQ_Net -> Destination: Branch_Net -> VPN: Site-to-Site-VPN -> Service: Any -> Action: Accept\n(ה-Community "Site-to-Site-VPN" טרם הוגדרה בפועל בין שני הגייטווים)',
      q: 'תעבורה מ-HQ_Net ל-Branch_Net מגיעה לכלל הזה, אך ה-Community המצוין עדיין לא כולל את שני הגייטווים בפועל. מה יקרה?',
      o: ['הכלל לא יתאים כי עמודת ה-VPN דורשת שהתעבורה תעבור דרך Community קיימת - התעבורה תמשיך לכלל הבא (בד"כ Cleanup)', 'התעבורה תותר כרגיל כי Source ו-Destination תואמים', 'המדיניות כולה לא תותקן על הגייטווי', 'יתבצע NAT אוטומטי במקום בדיקת VPN'],
      a: 0,
      w: 'עמודת VPN בכלל היא תנאי נוסף להתאמה, לא רק Source/Destination/Service. בלי Community תקינה בין הצדדים, הכלל פשוט לא Match.'
    },
    {
      code: '$ pdp connections\nNo identity found for 192.168.1.44',
      q: 'משתמש בכתובת 192.168.1.44 מתלונן שכללי Identity Awareness לא חלים עליו. מה הפלט הזה מרמז?',
      o: ['הגייטווי עדיין לא זיהה את המשתמש - כדאי לבדוק הרשאות Service Account וחיבור ל-DC (WMI/RPC)', 'יש בעיית רישוי (License) בגייטווי', 'המשתמש נחסם במפורש ב-Cleanup Rule', 'ה-VPN לא עלה כרגע'],
      a: 0,
      w: 'תקלה נפוצה ב-AD Query היא הרשאות Service Account לא מספקות או חסימת פורטי WMI/RPC בין הגייטווי ל-Domain Controller.'
    },
    {
      code: 'Blade: IPS | Signature: "SQL Injection Attempt" | Severity: High\nAction: Detect | Src: 203.0.113.5 | Dst: 10.0.0.20',
      q: 'מה חשוב להבין מכך שהפעולה שנרשמה היא Action: Detect במקרה הזה?',
      o: ['התעבורה נרשמה ללוג בלבד ולא נחסמה בפועל, למרות שזוהה ניסיון SQL Injection', 'התעבורה נחסמה אוטומטית ברגע הזיהוי', 'זו התראה כוזבת (False Positive) בוודאות', 'החתימה כבויה לגמרי ולא באמת פעלה'],
      a: 0,
      w: 'Detect שונה מ-Prevent - החתימה זיהתה את התבנית הזדונית ורשמה אותה ללוג, אך לא חסמה את התעבורה בפועל. חשוב לוודא שחתימות קריטיות מוגדרות ב-Prevent.'
    },
    {
      code: '$ fw tab -t fwx_alloc -s\nHOST      TABLE NAME   #VALS   PEAK   LIMIT\nlocalhost fwx_alloc    512     900    50000',
      q: 'מה בודקת בפועל הפקודה שהניבה את הפלט הזה?',
      o: ['שימוש נוכחי בטבלת הקצאות ה-NAT (Hide NAT Ports) בגייטווי', 'טבלת ה-Routing של הגייטווי', 'טבלת ה-IKE/IPsec SAs הפעילים', 'טבלת כללי ה-Rule Base'],
      a: 0,
      w: 'טבלת fwx_alloc משמשת למעקב אחר הקצאות פורטים ב-Hide NAT - שימושית כשחוקרים תקלות חיבוריות בזמן עומס גבוה של חיבורים יוצאים.'
    },
    {
      code: 'Rule 1: Any -> Any -> Any -> Any -> Accept -> Log   (הכלל הראשון בטבלה)\nRule 2: Admin_Access -> Gateway -> Any -> SSH -> Accept -> Log\nRule 3: Cleanup -> Any -> Any -> Any -> Drop -> Log',
      q: 'מה הבעיה החמורה במדיניות הזו?',
      o: ['Rule 1 הרחב מדי "בולע" את כל התעבורה ומייתר בפועל את שאר הכללים, כולל את ה-Cleanup Rule', 'אין בעיה - זו מדיניות תקנית לגמרי', 'ה-Cleanup Rule אמור להיות תמיד ראשון בטבלה', 'חובה שיהיה כלל אחד בלבד בכל מדיניות'],
      a: 0,
      w: 'מאחר שהבדיקה נעצרת בהתאמה הראשונה, Any/Any/Any/Accept בראש הטבלה מתיר בפועל את כל התעבורה - שאר הכללים, כולל אבטחה קריטית, לעולם לא ייבדקו.'
    },
    {
      code: 'blade:"Anti Bot" AND severity:Critical AND action:Detect',
      q: 'מה מציג חיפוש SmartLog כזה?',
      o: ['אירועי Anti-Bot בחומרה קריטית שרק זוהו ונרשמו ללוג, ולא נחסמו בפועל', 'אירועי Anti-Bot שנחסמו בהצלחה', 'אירועי IPS בלבד ללא קשר ל-Anti-Bot', 'כל האירועים מה-24 השעות האחרונות בלי קשר לחומרה'],
      a: 0,
      w: 'שילוב שלושת התנאים מסנן במדויק: Blade ספציפי, רמת חומרה גבוהה, ופעולה שהיא Detect ולא Prevent - שימושי לאיתור מקרים שדורשים בדיקה ידנית.'
    },
    {
      code: '$ cpstat fw\nProduct name: VPN-1 & FireWall-1\nPolicy name: Standard_Policy\nInterfaces: 4',
      q: 'איזה מידע מרכזי אפשר להסיק מהפלט הזה?',
      o: ['שם המדיניות המותקנת כרגע בפועל על הגייטווי הוא Standard_Policy', 'מספר הכללים הכולל במדיניות', 'זמן ה-Failover האחרון בקלאסטר', 'גרסת חתימות ה-IPS המותקנת'],
      a: 0,
      w: '<code>cpstat fw</code> נותן תמונת מצב מהירה של ה-Firewall Blade, כולל שם המדיניות המותקנת בפועל - שימושי לוודא שהותקנה המדיניות הנכונה.'
    }
  ];

  /* ============================================================
     מצב 3 - השלמת פקודת CLI: פקודה עם חלק חסר, לבחור מה משלים אותה
     ============================================================ */
  var CMD_COMPLETE = [
    {
      code: '$ ___',
      q: 'איזו פקודה בגייטווי פותחת תפריט אינטראקטיבי לניהול הגדרות כמו SIC, רישוי וממשקי רשת?',
      o: ['<code>cpconfig</code>', '<code>clish</code>', '<code>expert</code>', '<code>cpstat</code>'],
      a: 0,
      w: '<code>cpconfig</code> הוא תפריט הקונפיגורציה המרכזי בגייטווי - כולל בין השאר את האפשרות לאפס SIC, לבדוק רישיונות ולנהל הגדרות ליבה.'
    },
    {
      code: '$ ___ -t connections -s',
      q: 'מה משלים את הפקודה כדי להציג את מצב טבלת ה-Connections בזמן אמת?',
      o: ['<code>fw tab</code>', '<code>fw ctl</code>', '<code>cphaprob</code>', '<code>cpstat</code>'],
      a: 0,
      w: '<code>fw tab -t connections -s</code> מציגה סטטיסטיקת שימוש בטבלת ה-State - כמות חיבורים נוכחית, שיא (Peak) ותקרה (Limit).'
    },
    {
      code: '$ fw ctl ___',
      q: 'מה משלים את הפקודה כדי להציג מידע מפורט על Kernel Memory, Connections Table ו-Fragments?',
      o: ['<code>pstat</code>', '<code>zdebug</code>', '<code>get</code>', '<code>multik</code>'],
      a: 0,
      w: '<code>fw ctl pstat</code> הוא כלי מפתח לניטור בריאות הגייטווי - נותן תמונה מלאה של שימוש בזיכרון ליבה ובטבלאות פנימיות.'
    },
    {
      code: '$ cphaprob ___',
      q: 'מה משלים את הפקודה כדי להציג את מצב הקלאסטר וה-Member הפעיל?',
      o: ['<code>state</code>', '<code>syncstat</code>', '<code>list</code>', '<code>-a if</code>'],
      a: 0,
      w: '<code>cphaprob state</code> היא הפקודה הראשונה שמריצים לבדיקת מצב הקלאסטר - מציגה מי Active ומי Standby (או שני החברים פעילים ב-Load Sharing).'
    },
    {
      code: '$ clusterXL_admin ___',
      q: 'מה משלים את הפקודה כדי להוריד את החבר הנוכחי מ-Active ל-Down, לצורך תחזוקה מבוקרת?',
      o: ['<code>down</code>', '<code>stop</code>', '<code>disable</code>', '<code>freeze</code>'],
      a: 0,
      w: '<code>clusterXL_admin down</code> מבצע Failover מבוקר לפני עדכון תוכנה, כדי לא לתת לכשל "לקרות" בטבעיות. אחרי סיום התחזוקה משתמשים ב-<code>clusterXL_admin up</code>.'
    },
    {
      code: '$ vpn ___',
      q: 'מה משלים את הפקודה כדי לפתוח כלי אינטראקטיבי לניהול Tunnels - הצגה ומחיקה של IKE/IPsec SAs?',
      o: ['<code>tu</code>', '<code>debug</code>', '<code>tunnels</code>', '<code>sa</code>'],
      a: 0,
      w: '<code>vpn tu</code> (VPN Tunnel Utility) פותח תפריט לניהול ה-Tunnels בזמן אמת, כולל מחיקת IKE SA או IPsec SA ספציפי בעת אבחון תקלות.'
    },
    {
      code: '$ pdp ___',
      q: 'מה משלים את הפקודה כדי להציג את החיבורים המזוהים כרגע ע"י Identity Awareness?',
      o: ['<code>connections</code>', '<code>monitor</code>', '<code>status</code>', '<code>identify</code>'],
      a: 0,
      w: '<code>pdp connections</code> מציגה את החיבורים שזוהו ע"י מנגנון ה-PDP (Policy Decision Point), כולל המשתמשים המשויכים אליהם.'
    },
    {
      code: '$ cplic ___',
      q: 'מה משלים את הפקודה כדי להציג את פרטי הרישיונות המותקנים על המערכת?',
      o: ['<code>print</code>', '<code>check</code>', '<code>status</code>', '<code>get</code>'],
      a: 0,
      w: '<code>cplic print</code> מציגה את כל הרישיונות המותקנים - לרוב הצעד הראשון בבדיקת תקלות "מוזרות" שמתגלות כבעיית רישוי שפג תוקף.'
    },
    {
      code: '$ fw log ___',
      q: 'מה משלים את הפקודה כדי לצפות בלוג בזמן אמת (Follow) ישירות מהגייטווי?',
      o: ['<code>-f</code>', '<code>-n</code>', '<code>-t</code>', '<code>-r</code>'],
      a: 0,
      w: '<code>fw log -f</code> עוקבת אחרי קובץ הלוג הנוכחי ומציגה כניסות חדשות בזמן אמת, בדומה ל-<code>tail -f</code>.'
    },
    {
      code: '$ cp_log_export ___',
      q: 'מה משלים את הפקודה כדי להפעיל מחדש את שירות ייצוא הלוגים ל-SIEM חיצוני, לאחר שינוי הגדרות?',
      o: ['<code>restart</code>', '<code>reload</code>', '<code>apply</code>', '<code>sync</code>'],
      a: 0,
      w: '<code>cp_log_export restart</code> נדרש כדי שהגדרות חדשות (כמו יעד Syslog חדש) ייכנסו לתוקף בפועל.'
    },
    {
      code: '$ cpstat ___',
      q: 'מה משלים את הפקודה כדי להציג מידע ספציפי על ה-Firewall Blade, כולל שם המדיניות המותקנת?',
      o: ['<code>fw</code>', '<code>os</code>', '<code>ip</code>', '<code>vpn</code>'],
      a: 0,
      w: '<code>cpstat fw</code> נותן תמונת מצב ממוקדת של ה-Firewall Blade - כולל שם המדיניות המותקנת ומספר הממשקים.'
    },
    {
      code: '$ cat $FWDIR/log/___',
      q: 'מה משלים את הנתיב כדי לצפות בקובץ הלוג המפורט של תהליכי IKE, לאחר הפעלת vpn debug?',
      o: ['<code>ike.elg</code>', '<code>fw.elg</code>', '<code>cpwd.elg</code>', '<code>vpnd.log</code>'],
      a: 0,
      w: 'קובץ <code>ike.elg</code> מכיל את פלט ה-debug המפורט של תהליכי IKE, ונוח לנתח אותו גם דרך הכלי הגרפי IKEView.'
    },
    {
      code: '$ expert\n(עובדים ב-Bash מלא)\n$ ___',
      q: 'מה מקלידים ב-Expert Mode (Bash) כדי לחזור בחזרה ל-Gaia Clish?',
      o: ['<code>clish</code>', '<code>exit</code>', '<code>expert off</code>', '<code>gaia</code>'],
      a: 0,
      w: 'המעבר בין המצבים ב-Gaia הוא סימטרי: <code>expert</code> עובר מ-Clish ל-Bash, ו-<code>clish</code> חוזר בחזרה לשורת הפקודות המובנית.'
    },
    {
      code: '$ cphaprob ___ if',
      q: 'מה משלים את הפקודה כדי להציג פירוט מלא על מצב כל ממשק ברמת הקלאסטר?',
      o: ['<code>-a</code>', '<code>-l</code>', '<code>-v</code>', '<code>-s</code>'],
      a: 0,
      w: '<code>cphaprob -a if</code> נותן פירוט על כל הממשקים המנוטרים בקלאסטר - טוב במיוחד לאבחון בעיות Interface ספציפיות שגורמות ל-Failover לא צפוי.'
    }
  ];

  /* ============================================================
     מצב 4 - התאמת מושגים: סבבים של זוגות מונח/פקודה + תיאור
     ============================================================ */
  var MATCH_ROUNDS = [
    {
      title: 'ארכיטקטורה ורכיבי ליבה',
      pairs: [
        { l: 'SmartConsole', r: 'תוכנת הניהול הגרפית (GUI) שדרכה בונים מדיניות ומנהלים אובייקטים' },
        { l: 'Security Management Server (SMS)', r: 'שומר את מסד הנתונים, המדיניות והלוגים, ומבצע Install Policy' },
        { l: 'Security Gateway', r: 'השרת שאוכף בפועל את המדיניות בתעבורת הרשת' },
        { l: 'Gaia', r: 'מערכת ההפעלה הייעודית (מבוססת לינוקס) עליה רצים Gateway ו-Management' },
        { l: 'SIC', r: 'ערוץ תקשורת מוצפן ומאומת בין ה-Management לגייטווי' }
      ]
    },
    {
      title: 'מדיניות אבטחה ו-NAT',
      pairs: [
        { l: 'Stealth Rule', r: 'חוסם גישה ישירה לגייטווי עצמו, מלבד תעבורת ניהול' },
        { l: 'Cleanup Rule', r: 'הכלל האחרון בטבלה - חוסם ורושם כל תעבורה שלא הותאמה' },
        { l: 'Hide NAT', r: 'מסתיר רשת שלמה מאחורי כתובת IP אחת' },
        { l: 'Static NAT', r: 'מיפוי אחד-לאחד קבוע בין כתובת פנימית לחיצונית' },
        { l: 'Implied Rules', r: 'כללים מרומזים שרצים אוטומטית לפני ה-Rule Base הגלוי' }
      ]
    },
    {
      title: 'VPN',
      pairs: [
        { l: 'Phase 1 (IKE)', r: 'יוצר ערוץ מאובטח ומבצע אימות בין הגייטווים' },
        { l: 'Phase 2 (IKE)', r: 'מקים את ה-IPsec SA שמצפין בפועל את התעבורה' },
        { l: 'VPN Domain', r: 'הרשתות שמאחורי הגייטווי הרלוונטיות להצפנה' },
        { l: 'Meshed Community', r: 'כל הגייטווים בקהילה מדברים ישירות אחד עם השני' },
        { l: 'VTI (Route-Based VPN)', r: 'ממשק וירטואלי שמאפשר לניתוב לקבוע איזו תעבורה עוברת במנהרה' }
      ]
    },
    {
      title: 'Identity Awareness ו-Threat Prevention',
      pairs: [
        { l: 'AD Query', r: 'שיטת זיהוי Agentless המבוססת על קריאת לוגי אבטחה מ-Domain Controller' },
        { l: 'Access Role', r: 'אובייקט מדיניות המשלב רשת, משתמש ומכשיר' },
        { l: 'IPS', r: 'חסימת ניצול פרצות מבוססת חתימות בזמן אמת' },
        { l: 'Threat Emulation', r: 'הרצת קבצים חשודים בסביבת Sandbox מבודדת' },
        { l: 'Threat Extraction', r: 'ניקוי קובץ מאלמנטים פעילים לפני שהוא מגיע למשתמש' }
      ]
    },
    {
      title: 'ClusterXL וניטור',
      pairs: [
        { l: 'High Availability Mode', r: 'חבר אחד Active והשני Standby בכל רגע נתון' },
        { l: 'Load Sharing Mode', r: 'שני החברים פעילים בו-זמנית ומחלקים עומס' },
        { l: 'CCP', r: 'פרוטוקול ה-Heartbeat בין חברי הקלאסטר' },
        { l: 'SmartLog', r: 'מנוע חיפוש מהיר ומבוסס אינדוקס בלוגים' },
        { l: 'SmartEvent', r: 'שכבת קורלציה שהופכת לוגים בודדים לאירועי אבטחה משמעותיים' }
      ]
    }
  ];

  /* ============================================================
     מצב 5 - סידור תהליך: סבבים של שלבים שצריך לסדר בסדר הנכון
     ============================================================ */
  var ORDER_ROUNDS = [
    {
      title: 'בניית מדיניות אבטחה חדשה מאפס',
      steps: [
        'פתיחת SmartConsole והתחברות ל-Security Management Server',
        'יצירת אובייקטי רשת/מארח רלוונטיים (Network Objects)',
        'הוספת כללי Accept ספציפיים לפי צורך העסק',
        'הוספת Stealth Rule ו-Cleanup Rule בתחתית הטבלה',
        'הרצת Install Policy על הגייטווי הרלוונטי',
        'אימות בלוגים (Logs & Monitor) שהתעבורה נאכפת כצפוי'
      ]
    },
    {
      title: 'הקמת VPN Site-to-Site בין שני אתרים',
      steps: [
        'יצירת אובייקטי Gateway לשני הצדדים עם IP חיצוני ו-Topology תקינה',
        'הגדרת VPN Domain (Encryption Domain) בלשונית Topology בכל אובייקט',
        'יצירת VPN Community (Meshed/Star) והוספת שני הגייטווים כחברים',
        'הגדרת שיטת אימות (Pre-Shared Key או Certificate) והצפנה משותפת',
        'הוספת כלל ב-Rule Base עם עמודת VPN המצביעה על ה-Community',
        'הרצת Install Policy ובדיקת עליית ה-Tunnel עם vpn tu'
      ]
    },
    {
      title: 'אבחון תקלת VPN שלא עולה',
      steps: [
        'בדיקת חיבוריות בסיסית וסנכרון שעונים (NTP) בין הגייטווים',
        'הפעלת vpn debug on לאיסוף מידע מפורט',
        'ניסיון יזום להקים את ה-Tunnel ובדיקת קובץ ike.elg',
        'בדיקה האם Phase 1 (אימות/הצפנה) הצליח',
        'בדיקה האם Phase 2 נכשל עקב אי-התאמה ב-VPN Domain',
        'כיבוי ה-debug עם vpn debug off ותיקון ההגדרה שנמצאה שגויה'
      ]
    },
    {
      title: 'ביצוע Failover מבוקר לתחזוקת קלאסטר',
      steps: [
        'בדיקת מצב הקלאסטר הנוכחי עם cphaprob state',
        'וידוא שה-Standby תקין ומוכן לקבל את התעבורה',
        'הרצת clusterXL_admin down על החבר הפעיל שרוצים לעדכן',
        'אימות שהחבר השני הפך ל-Active ותעבורה ממשיכה לזרום',
        'ביצוע העדכון/התחזוקה על החבר שהוצא מהשירות',
        'הרצת clusterXL_admin up להחזרתו לקלאסטר'
      ]
    },
    {
      title: 'הגדרת Identity Awareness עם AD Query',
      steps: [
        'הפעלת Identity Awareness Blade על הגייטווי ב-SmartConsole',
        'בחירת AD Query כמקור הזיהוי באשף ההפעלה',
        'הגדרת חיבור ל-Active Directory וחשבון שירות עם הרשאות קריאה',
        'יצירת אובייקט Access Role המשלב קבוצת AD רלוונטית',
        'הוספת כלל ב-Rule Base עם ה-Access Role כ-Source',
        'הרצת Install Policy ובדיקת זיהוי עם pdp connections'
      ]
    }
  ];

  /* ============================================================
     הגדרת מצבי המשחק
     ============================================================ */
  var MODES = [
    { key: 'rapid', icon: '⚡', name: 'קרב מהיר', desc: 'שאלות ידע כלליות על Check Point - כמה תספיקו לפני שהזמן נגמר?', type: 'quiz', data: RAPID, sample: 8, time: 20000 },
    { key: 'policy_log', icon: '🧾', name: 'ניתוח מדיניות ולוגים', desc: 'קטע מדיניות, לוג או פלט CLI - מה קורה בפועל?', type: 'quiz', data: POLICY_LOG, sample: 8, time: 28000, showCode: true },
    { key: 'cmd', icon: '🧩', name: 'השלמת פקודת CLI', desc: 'פקודת Check Point עם חלק חסר - בחרו מה משלים אותה נכון', type: 'quiz', data: CMD_COMPLETE, sample: 8, time: 28000, showCode: true },
    { key: 'match', icon: '🔗', name: 'התאמת מושגים', desc: 'התאימו כל מונח/פקודת Check Point לתיאור הנכון שלו', type: 'match', data: MATCH_ROUNDS, sample: 2 },
    { key: 'order', icon: '📋', name: 'סידור תהליך', desc: 'סדרו את שלבי התהליך לפי הסדר הנכון', type: 'order', data: ORDER_ROUNDS, sample: 2 }
  ];

  window.TG_CONFIG = { gameId: "checkpoint", modes: MODES };
})();
</script>

<script src="/scripts/topic-game.js"></script>
