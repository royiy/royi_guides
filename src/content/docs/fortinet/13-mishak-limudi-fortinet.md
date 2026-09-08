---
title: "משחק לימודי: אתגר Fortinet"
category: Fortinet
part: 13/10
description: "משחק אינטראקטיבי ללימוד Fortinet/FortiGate - חמישה מצבי משחק עם טיימר, לבבות, ניקוד ורצפים: קרב מהיר, ניחוש מדיניות/קונפיגורציה, השלמת פקודות CLI, התאמת מושגים וסידור תהליכים."
---

חמישה מצבי משחק שבודקים היבטים שונים של FortiGate ו-FortiOS - ארכיטקטורה, Security Policies, VPN, NAT/Routing, HA, UTM ועוד - לא עוד חידון רב-ברירה, אלא משחק עם **טיימר**, **שלושה לבבות**, **מכפיל רצף** ו**שיא אישי** שנשמר בדפדפן. בסוף כל סבב תקבלו דירוג, ורשימת חזרה של בדיוק מה שפספסתם.


<div class="tg" id="tg" dir="rtl">
  <div class="tg-screen is-active" data-screen="menu">
    <div class="tg-hero">
      <div class="tg-hero-badge">Fortinet</div>
      <div class="tg-hero-title">אתגר Fortinet</div>
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
      q: 'מה זה FortiGate?',
      o: ['פיירוול מסוג Next-Generation Firewall (NGFW) של Fortinet', 'תוכנת אנטי-וירוס בלבד', 'מתג רשת (Switch) מנוהל', 'שירות ענן לגיבוי נתונים'],
      a: 0,
      w: 'FortiGate הוא פיירוול NGFW הכולל Firewall, IPS, Antivirus, Web Filtering, VPN, SD-WAN ועוד - הכל תחת מנוע בדיקה אחד.'
    },
    {
      q: 'איך נקראת מערכת ההפעלה שרצה על מכשירי FortiGate?',
      o: ['FortiOS', 'FortiKernel', 'FortiLinux', 'FGOS'],
      a: 0,
      w: 'FortiOS היא מערכת ההפעלה הייעודית שרצה על כל מכשירי FortiGate, חומרתיים ווירטואליים כאחד, וניתנת לניהול דרך GUI או CLI.'
    },
    {
      q: 'איך נקרא השבב הייעודי של Fortinet שמאיץ הצפנה ובדיקת תוכן ברמת החומרה?',
      o: ['SPU (Security Processing Unit)', 'GPU', 'TPM', 'ASIC-FW'],
      a: 0,
      w: 'ה-SPU מאיץ פעולות הצפנה/פענוח ובדיקת תוכן ברמת החומרה, ונותן ל-FortiGate ביצועים גבוהים גם כשמפעילים הרבה מנועי UTM בו-זמנית.'
    },
    {
      q: 'מהו סדר הבדיקה של Firewall Policies ב-FortiGate?',
      o: ['מלמעלה למטה, וברגע שנמצאת התאמה ראשונה היא מיושמת', 'מלמטה למעלה תמיד', 'לפי סדר אלפביתי של השם', 'כל ה-Policies נבדקות תמיד ומצטברות'],
      a: 0,
      w: 'הבדיקה נעשית מלמעלה למטה, וברגע שנמצאה התאמה ראשונה - היא מיושמת ואין המשך בדיקה. לכן סדר השורות קריטי, ומומלץ ספציפי למעלה וכללי למטה.'
    },
    {
      q: 'מה קורה כברירת מחדל לתעבורה שלא תואמת אף Policy מפורש?',
      o: ['היא נחסמת ע"י Implicit Deny בסוף רשימת ה-Policies', 'היא מותרת אוטומטית (Allow All)', 'היא מועברת ל-Quarantine', 'FortiGate קורס'],
      a: 0,
      w: 'ל-FortiGate יש תמיד "Implicit Deny" בסוף הרשימה. עם זאת מומלץ להוסיף גם Deny מפורש עם Logging, כי ה-Implicit Deny לא תמיד נרשם בלוגים כברירת מחדל.'
    },
    {
      q: 'מהם שני שלבי (Phases) הקמת תעלת IPsec VPN?',
      o: ['Phase 1 (IKE) להקמת תעלה מאובטחת, ו-Phase 2 (IPsec SA) להגדרת התעבורה עצמה', 'Phase 1 להצפנה, Phase 2 לאימות בלבד', 'רק Phase אחד קיים ב-IPsec', 'Phase 1 ל-Routing, Phase 2 ל-NAT'],
      a: 0,
      w: 'Phase 1 (IKE) מקימה תעלה מאובטחת בין שני ה-Gateways עם אימות הדדי והסכמה על הצפנה. Phase 2 (IPsec SA) מגדירה אילו רשתות עוברות בתעלה ואיך מוצפנת התעבורה עצמה.'
    },
    {
      q: 'מה עדיף להשתמש - IKEv1 או IKEv2?',
      o: ['IKEv2 - יציב ומהיר יותר ב-Rekey', 'IKEv1 - תמיד המומלץ כיום', 'אין הבדל בין השניים', 'תלוי רק בגרסת Windows של הלקוח'],
      a: 0,
      w: 'IKEv2 הוא הגרסה המודרנית והמומלצת - יציבה יותר, תומכת טוב יותר ב-MOBIKE (ניוד רשת) ומהירה יותר בתהליך ה-Rekey מול IKEv1 הישן יותר.'
    },
    {
      q: 'למה בעיקר משמש SSL VPN ב-FortiGate?',
      o: ['Remote Access למשתמשים המתחברים דרך דפדפן או FortiClient', 'חיבור Site-to-Site בין שני סניפים בלבד', 'ניתוב דינמי בין ראוטרים', 'סנכרון בין שני מכשירי HA'],
      a: 0,
      w: 'SSL VPN מיועד בעיקר לחיבורי Remote Access - עובדים מהבית או בנסיעות מתחברים דרך HTTPS (פורט 443 או פורט ייעודי) עם דפדפן או אפליקציית FortiClient.'
    },
    {
      q: 'מה תפקיד ה-Virtual IP (VIP) ב-FortiGate?',
      o: ['לבצע Destination NAT ולחשוף שרת פנימי לאינטרנט', 'ליצור תעלת VPN בין סניפים', 'לנהל משתמשים מול Active Directory', 'לסנכרן קונפיגורציה בין שני מכשירים ב-HA'],
      a: 0,
      w: 'VIP מגדיר מיפוי בין כתובת IP ציבורית (extip) לכתובת פנימית (mappedip), כך שאפשר לחשוף שרת פנימי (למשל שרת Web) החוצה לאינטרנט - זהו למעשה DNAT.'
    },
    {
      q: 'מה תפקיד השדה distance (Administrative Distance) ב-Static Route?',
      o: ['קובע איזה מסלול מנצח כשיש כמה מסלולים אפשריים לאותו יעד - הנמוך ביותר מנצח', 'קובע את מהירות הקו בפועל', 'קובע את מספר ה-hops המקסימלי', 'משמש רק ב-BGP ולא ב-Static Routing'],
      a: 0,
      w: 'כשקיימים כמה מקורות מידע לאותו יעד (סטטי, OSPF, BGP וכו׳), ה-distance הנמוך ביותר קובע איזה מסלול ייכנס בפועל לטבלת הניתוב הפעילה.'
    },
    {
      q: 'מהו הפרוטוקול שעליו מבוסס מנגנון ה-HA (Clustering) של FortiGate?',
      o: ['FGCP - FortiGate Clustering Protocol', 'VRRP בלבד', 'HSRP של סיסקו', 'STP - Spanning Tree Protocol'],
      a: 0,
      w: 'FGCP הוא הפרוטוקול הייעודי של Fortinet לניהול קלאסטר HA - הוא אחראי על Heartbeat, סנכרון קונפיגורציה וסנכרון Session-ים בין החברים.'
    },
    {
      q: 'מהו מצב ה-HA הנפוץ ביותר, שבו מכשיר אחד מעבד תעבורה והשני בהמתנה?',
      o: ['Active-Passive (A-P)', 'Active-Active (A-A)', 'Standby-Standby', 'Cluster-Mesh'],
      a: 0,
      w: 'ב-Active-Passive, ה-Primary מעבד את כל התעבורה וה-Secondary מסתנכרן איתו כל הזמן ומוכן להשתלט (Failover) תוך שניות אם ה-Primary נופל.'
    },
    {
      q: 'מה ההבדל בין IPS ל-Antivirus Profile?',
      o: ['IPS מזהה תבניות תקיפה (חתימות Exploit) בתעבורה, AV בודק קבצים שעוברים ברשת', 'הם אותו מנוע בדיוק תחת שם שונה', 'IPS בודק רק קבצים, AV בודק רק פורטים', 'AV רץ רק על SSL VPN ולא על תעבורה רגילה'],
      a: 0,
      w: 'IPS מתמקד בזיהוי ניסיונות ניצול חולשות (Exploits) בתעבורת הרשת עצמה, בעוד AV סורק קבצים שעוברים דרך הפיירוול (הורדות, מיילים, FTP) מול מסד חתימות.'
    },
    {
      q: 'למה נדרש SSL Inspection (Deep Inspection) ב-UTM?',
      o: ['כדי ש-IPS/AV/Web Filter יוכלו לבדוק תוכן תעבורת HTTPS מוצפנת', 'כדי להאיץ את מהירות הגלישה', 'כדי ליצור תעלות VPN חדשות', 'כדי לבצע NAT על תעבורה יוצאת'],
      a: 0,
      w: 'רוב התעבורה כיום מוצפנת (HTTPS). בלי SSL Inspection, מנועי ה-UTM "עיוורים" לתוכן. Deep Inspection פותח את ההצפנה זמנית, בודק, ומצפין מחדש - מה שדורש התקנת תעודת CA בתחנות הקצה.'
    },
    {
      q: 'מה תפקיד שירות FortiGuard?',
      o: ['מספק עדכוני חתימות ומידע איומים למנועי ה-UTM (AV, IPS, Web Filter)', 'מנהל את ה-HA Cluster', 'מבצע את ה-Routing הדינמי', 'משמש רק לניהול משתמשי SSL VPN'],
      a: 0,
      w: 'FortiGuard הוא שירות המנוי שדרכו FortiGate מקבל עדכונים שוטפים - חתימות אנטי-וירוס, חתימות IPS וקטגוריות Web Filtering, ודורש רישיון תקף ורישום המכשיר.'
    },
    {
      q: 'מה מאפשר SD-WAN ב-FortiGate?',
      o: ['ניתוב חכם בין כמה קווי אינטרנט לפי ביצועים בזמן אמת (Latency, Jitter, Packet Loss)', 'הצפנת תעבורה בין שני משתמשים בלבד', 'ניהול משתמשי VPN מרוחקים', 'סנכרון קונפיגורציה בין FortiGate ו-FortiManager'],
      a: 0,
      w: 'SD-WAN משלב כמה ספקי אינטרנט (למשל MPLS ו-Fiber) ומנתב תעבורה דינמית על סמך מדדי ביצועים בזמן אמת - כך ש-VoIP למשל תמיד יעבור בקו עם ה-Latency הנמוך ביותר.'
    },
    {
      q: 'מה תפקיד FortiAnalyzer בארכיטקטורת Fortinet?',
      o: ['ריכוז לוגים, דוחות ואנליטיקה ממכשירי FortiGate', 'ניהול מרכזי של קונפיגורציית כמה FortiGate', 'הגנת נקודת קצה (Endpoint)', 'הגנה על אפליקציות Web (WAF)'],
      a: 0,
      w: 'FortiAnalyzer אוסף ומרכז לוגים ממכשירי FortiGate שונים, ומאפשר דוחות, אנליטיקה וחקירת אירועי אבטחה מרוכזת - בעוד FortiManager אחראי על ניהול קונפיגורציה מרכזי.'
    }
  ];

  /* ============================================================
     מצב 2 - ניחוש קונפיגורציה: קטע Policy/Config, ומה קורה בפועל
     ============================================================ */
  var STATUS_GUESS = [
    {
      code: 'config firewall policy\n    edit 10\n        set srcintf "port2"\n        set dstintf "port1"\n        set srcaddr "LAN_SUBNET"\n        set dstaddr "all"\n        set action accept\n        set service "WEB_SERVICES"\n        set nat enable\n    next\nend',
      q: 'ל-Policy הזה אין את השורה <code>set schedule "always"</code>. מה קורה בפועל בהרצת קונפיגורציה כזו?',
      o: ['הפקודה תיכשל / הרשומה תישאר לא תקינה - schedule הוא שדה חובה ב-Policy', 'ה-Policy ירוץ כרגיל 24/7 בכל מקרה', 'ה-Policy יחסום הכל אוטומטית', 'FortiGate ימיר את זה ל-Deny אוטומטית'],
      a: 0,
      w: 'schedule הוא שדה חובה בכל Firewall Policy - הוא קובע מתי ה-Policy בתוקף. בלעדיו ה-Policy לא שלם ולא יעבוד כראוי; ברוב המקרים משתמשים ב-<code>"always"</code> אם אין הגבלת זמן.'
    },
    {
      code: 'config firewall policy\n    edit 5\n        set srcaddr "all"\n        set dstaddr "all"\n        set action accept\n        set schedule "always"\n        set service "ALL"\n    next\nend\n\nconfig firewall policy\n    edit 10\n        set srcaddr "LAN_SUBNET"\n        set dstaddr "HR_Server"\n        set action deny\n        set schedule "always"\n        set service "HTTPS"\n    next\nend',
      q: 'שני ה-Policies מוגדרים בסדר הזה (5 לפני 10, וב-FortiOS הסדר בטבלה נקבע לפי מיקום ולא לפי מספר ה-ID). בהנחה ש-Policy 5 מוצג ראשון בטבלה - מה קורה לתעבורה מ-LAN ל-HR_Server?',
      o: ['היא תותר (Accept) כי Policy 5 הרחב תופס אותה קודם, ו-Policy 10 החוסם לעולם לא ייבדק', 'היא תיחסם כי Deny תמיד גובר על Accept', 'FortiGate יבצע בדיקה של שני ה-Policies ויחסום', 'תתקבל שגיאת קונפליקט קונפיגורציה'],
      a: 0,
      w: 'Policy נבדק מלמעלה למטה, וברגע שנמצאת התאמה ראשונה - היא מיושמת ואין המשך בדיקה. Policy 5 הרחב (all/all/ALL) יתפוס את כל התעבורה כולל זו שיועדה ל-Policy 10, שלעולם לא תגיע אליו. זו בדיוק הסיבה ש"ספציפי למעלה, כללי למטה" הוא חוק ברזל.'
    },
    {
      code: 'config vpn ipsec phase1-interface\n    edit "VPN_to_Branch2"\n        set interface "port1"\n        set ike-version 2\n        set proposal aes256-sha256\n        set remote-gw 198.51.100.20\n        set psksecret "SuperSecretPSK123!"\n    next\nend',
      q: 'הוגדר Phase 1 בלבד, בלי Phase 2 ובלי Policy. מה המצב בפועל?',
      o: ['ניתן יהיה להקים IKE SA (המשא ומתן הראשוני), אך לא תעבור תעבורת מידע דרך התעלה', 'התעלה תעבוד באופן מלא כרגיל', 'FortiGate יתעלם לחלוטין מהקונפיגורציה', 'התעבורה תעבור אוטומטית ללא NAT'],
      a: 0,
      w: 'Phase 1 בלבד מקים רק את "הצינור" המאובטח בין ה-Gateways (IKE SA). כדי שתעבורת מידע אמיתית תעבור, נדרשים גם Phase 2 (מגדיר אילו subnets עוברים בתעלה) וגם Firewall Policy שמתיר את התעבורה דרך ממשק ה-VPN.'
    },
    {
      code: 'config firewall vip\n    edit "VIP_WebServer"\n        set extip 203.0.113.10\n        set extintf "port1"\n        set mappedip "10.0.5.20"\n        set extport 443\n        set mappedport 443\n    next\nend',
      q: 'חסרה שורה <code>set portforward enable</code>. מה ההשלכה?',
      a: 0,
      o: ['ברירת המחדל היא portforward disable, שממפה את כל הפורטים ולא רק 443 - פחות מאובטח', 'ה-VIP לא יעבוד כלל בלי השורה הזו', 'תעבורה תיחסם אוטומטית לכל הפורטים', '443 ימופה אך שאר הפורטים ינותבו ל-Deny'],
      w: 'ללא <code>portforward enable</code>, ה-VIP ממפה את כל הפורטים מה-extip אל ה-mappedip (port forwarding כבוי = מיפוי מלא של הכתובת). לביטחון עדיף כמעט תמיד להפעיל <code>portforward enable</code> עם פורט ספציפי בלבד.'
    },
    {
      code: 'config firewall policy\n    edit 50\n        set srcaddr "all"\n        set dstaddr "VIP_WebServer"\n        set action accept\n        set service "HTTPS"\n        set nat disable\n    next\nend',
      q: 'ה-Policy הזה מגדיר גישה מהאינטרנט ל-VIP_WebServer עם <code>nat disable</code>. למה זה נכון במקרה של DNAT דרך VIP?',
      o: ['ה-NAT (מיפוי הכתובות) כבר מתבצע ברמת אובייקט ה-VIP עצמו, כך שאין צורך ב-Source NAT נוסף ב-Policy', 'זו טעות - חובה להפעיל nat enable תמיד', 'nat disable חוסם את כל התעבורה', 'זה רלוונטי רק ל-Site-to-Site VPN'],
      a: 0,
      w: 'כשמשתמשים ב-VIP (Destination NAT), מיפוי הכתובות כבר מוגדר באובייקט ה-VIP עצמו. ה-<code>nat</code> ב-Policy מתייחס ל-Source NAT (הסתרת כתובת המקור) - שבד"כ לא רצוי כשמדובר בגישה נכנסת מהאינטרנט לשרת פנימי.'
    },
    {
      code: 'config system ha\n    set group-id 10\n    set mode a-p\n    set password "HA_Sync_Password123"\n    set hbdev "port10" 50\n    set priority 200\nend',
      q: 'מכשיר A מוגדר עם <code>priority 200</code>. במכשיר B מוגדר <code>priority 100</code> עם אותם group-id ו-password. איזה מכשיר יהפוך ל-Primary?',
      o: ['מכשיר A - ה-priority הגבוה יותר מנצח', 'מכשיר B - ה-priority הנמוך יותר מנצח', 'תמיד המכשיר שהופעל ראשון, ללא קשר ל-priority', 'לא ניתן לקבוע - זה אקראי'],
      a: 0,
      w: 'ב-FGCP, ה-priority הגבוה יותר קובע איזה מכשיר יהיה ה-Primary (בהנחה ש-override מופעל). מכשיר A עם 200 ינצח את מכשיר B עם 100.'
    },
    {
      code: 'config system ha\n    set group-id 10\n    set mode a-p\n    set password "Password1"\n    set hbdev "port10" 50\nend',
      q: 'מכשיר B מוגדר עם group-id זהה אך <code>set password "Password2"</code> (סיסמה שונה מהמכשיר השני). מה יקרה?',
      o: ['הקלאסטר לא יוקם - הסיסמאות חייבות להיות זהות בדיוק בשני הצדדים', 'הקלאסטר יוקם אך ללא סנכרון קונפיגורציה', 'המכשיר עם הסיסמה הארוכה יותר ינצח', 'FortiGate יתקן את זה אוטומטית'],
      a: 0,
      w: 'ה-password בקונפיגורציית HA הוא סיסמת סנכרון שחייבת להיות זהה במדויק בשני (או כל) המכשירים בקלאסטר, בדיוק כמו group-id - אחרת הם לא "יראו" זה את זה כחברי אותו קלאסטר.'
    },
    {
      code: 'config ips sensor\n    edit "custom-ips"\n        config entries\n            edit 1\n                set severity high critical\n                set action block\n        end\n    next\nend\n\nconfig firewall policy\n    edit 100\n        ...\n        set utm-status enable\n    next\nend',
      q: 'הוגדר ips-sensor "custom-ips" אך ל-Policy לא נוספה השורה <code>set ips-sensor "custom-ips"</code>. מה יקרה בפועל?',
      o: ['ה-IPS sensor לא ייאכף על התעבורה של אותו Policy - הוא לא "מחובר" אליו', 'ה-Policy ישתמש אוטומטית בכל sensor שקיים במערכת', 'FortiGate יחסום הכל כברירת מחדל עד שיוגדר sensor', 'הגדרת ה-sensor תוחל גלובלית על כל ה-Policies'],
      a: 0,
      w: 'הגדרת Security Profile (IPS/AV/Web Filter וכו׳) כשלעצמה לא מספיקה - צריך גם לצרף אותה במפורש ל-Policy הרלוונטי (למשל <code>set ips-sensor "custom-ips"</code>), גם כש-<code>utm-status</code> מופעל.'
    },
    {
      code: 'config webfilter profile\n    edit "corp-web-filter"\n        config ftgd-wf\n            config filters\n                edit 3\n                    set category 23\n                    set action monitor\n                next\n            end\n        end\n    next\nend',
      q: 'קטגוריה 23 (Social Networking) מוגדרת עם <code>action monitor</code>. מה קורה בפועל לגלישה של משתמש לאתר ברשת חברתית?',
      o: ['הגלישה תותר ותירשם בלוגים, בלי לחסום בפועל', 'הגלישה תיחסם לחלוטין', 'המשתמש יקבל אזהרה שדורשת אישור ידני', 'הקטגוריה תתעלם מהתעבורה ולא תירשם כלל'],
      a: 0,
      w: '<code>action monitor</code> מאפשר לראות ולתעד תעבורה בלוגים בלי לחסום אותה בפועל - שימושי כשלב ביניים לפני מעבר ל-<code>block</code> מלא, כדי לבדוק את ההשפעה לפני אכיפה.'
    },
    {
      code: 'config firewall ssl-ssh-profile\n    edit "deep-inspection"\n        config https\n            set ports 443\n            set status deep-inspection\n        end\n    next\nend',
      q: 'הופעל deep-inspection על תעבורת HTTPS, אך תעודת ה-CA (Fortinet_CA_SSL) לא הותקנה בתחנות הקצה. מה יקרה בגלישת המשתמשים?',
      o: ['הדפדפנים יציגו אזהרת "תעודה לא מהימנה" כי FortiGate "פותח" ומחתים מחדש את החיבור', 'הגלישה תיחסם אוטומטית לחלוטין', 'FortiGate יעקוף את הבעיה ויתקין את התעודה אוטומטית בכל תחנה', 'התעבורה תעבור בלי שום שינוי בהתנהגות'],
      a: 0,
      w: 'ב-Deep Inspection, FortiGate מנפיק תעודה חדשה "בשם" האתר, חתומה ע"י ה-CA הפנימי שלו. אם התעודה הזו לא מותקנת כ-Trusted בתחנות הקצה, הדפדפן לא מזהה אותה ומציג אזהרת אבטחה.'
    },
    {
      code: 'config router static\n    edit 1\n        set dst 0.0.0.0 0.0.0.0\n        set gateway 203.0.113.1\n        set device "port1"\n    next\n    edit 2\n        set dst 0.0.0.0 0.0.0.0\n        set gateway 198.51.100.1\n        set device "port4"\n        set distance 5\n    next\nend',
      q: 'שני מסלולי ברירת מחדל (0.0.0.0/0) מוגדרים - הראשון עם distance ברירת מחדל (10), השני עם <code>distance 5</code>. איזה מסלול ייכנס לטבלת הניתוב הפעילה?',
      o: ['המסלול דרך port4 (distance 5) - ה-distance הנמוך יותר מנצח', 'המסלול דרך port1 (distance 10) - הוא הוגדר ראשון', 'שני המסלולים ייכנסו ויתבצע load balancing שווה תמיד', 'FortiGate יסרב לקונפיגורציה כשגיאה'],
      a: 0,
      w: 'Administrative Distance קובע איזה מסלול "אמין" יותר כשיש כמה אפשרויות לאותו יעד - הנמוך ביותר מנצח ונכנס לטבלת הניתוב הפעילה, גם אם הוגדר אחרי המסלול השני.'
    },
    {
      code: 'config firewall address\n    edit "SRV_WebApp01"\n        set subnet 10.0.5.20 255.255.255.255\n    next\nend\n\nconfig firewall policy\n    edit 20\n        set dstaddr "SRV_WebApp01"\n        ...\n    next\nend',
      q: 'מאוחר יותר משנים את ה-IP של השרת ל-10.0.5.30 ומעדכנים רק את אובייקט ה-Address (לא את ה-Policy עצמו). מה קורה ל-Policy 20?',
      o: ['הוא ממשיך לעבוד כרגיל מול הכתובת החדשה - בזכות השימוש באובייקט Address ולא ב-IP ישיר', 'ה-Policy מפסיק לעבוד ודורש עדכון ידני', 'נוצר קונפליקט קונפיגורציה', 'ה-Policy עובר אוטומטית ל-Deny'],
      a: 0,
      w: 'זהו בדיוק היתרון המרכזי של שימוש ב-Address Objects: כל ה-Policies שמפנים לאובייקט מתעדכנים אוטומטית כשמעדכנים את האובייקט עצמו במקום אחד - בלי לחפש ולתקן כל Policy בנפרד.'
    }
  ];

  /* ============================================================
     מצב 3 - השלמת פקודת CLI: פקודה עם חלק חסר, לבחור מה משלים אותה
     ============================================================ */
  var CMD_COMPLETE = [
    {
      code: 'config firewall ___\n    edit 10\n        set srcintf "port2"\n        set dstintf "port1"\n        set action accept\n    next\nend',
      q: 'מה משלים את הפקודה ליצירה/עריכה של מדיניות אבטחה (Firewall Policy)?',
      o: ['<code>policy</code>', '<code>address</code>', '<code>vip</code>', '<code>service</code>'],
      a: 0,
      w: '<code>config firewall policy</code> הוא ה-context המרכזי לניהול ה-Security Policies - הליבה של כל קונפיגורציית FortiGate.'
    },
    {
      code: 'config firewall policy\n    edit 10\n        ...\n        set action ___\n    next\nend',
      q: 'מה משלים את הפקודה כדי לאפשר את התעבורה שתואמת ל-Policy הזה?',
      o: ['<code>accept</code>', '<code>allow</code>', '<code>permit</code>', '<code>pass</code>'],
      a: 0,
      w: 'ב-FortiOS ערך ה-action לאישור תעבורה הוא <code>accept</code> (לא allow/permit כמו בפלטפורמות אחרות). הערך ההפוך הוא <code>deny</code>.'
    },
    {
      code: 'config firewall policy\n    edit 10\n        ...\n        set nat ___\n    next\nend',
      q: 'מה משלים את הפקודה כדי להפעיל NAT על תעבורה שעוברת דרך ה-Policy?',
      o: ['<code>enable</code>', '<code>on</code>', '<code>active</code>', '<code>true</code>'],
      a: 0,
      w: 'שדות בוליאניים ב-FortiOS משתמשים בערכים <code>enable</code>/<code>disable</code> - לא <code>on/off</code> או <code>true/false</code> כמו בפלטפורמות אחרות.'
    },
    {
      code: 'config vpn ipsec phase1-interface\n    edit "VPN_to_Branch2"\n        set ike-version 2\n        set ___ 198.51.100.20\n    next\nend',
      q: 'מה משלים את הפקודה כדי להגדיר את כתובת ה-Gateway המרוחק בצד השני של תעלת IPsec?',
      o: ['<code>remote-gw</code>', '<code>peer-ip</code>', '<code>dst-gateway</code>', '<code>tunnel-ip</code>'],
      a: 0,
      w: '<code>set remote-gw</code> מגדיר את כתובת ה-IP הציבורית של ה-FortiGate (או Gateway אחר) בצד השני של תעלת ה-IPsec, כדי שהמשא ומתן על Phase 1 יוכל להתחיל.'
    },
    {
      code: 'config vpn ipsec phase2-interface\n    edit "VPN_to_Branch2_P2"\n        set ___ "VPN_to_Branch2"\n        set src-subnet 192.168.10.0 255.255.255.0\n        set dst-subnet 192.168.20.0 255.255.255.0\n    next\nend',
      q: 'מה משלים את הפקודה כדי לקשר את ה-Phase 2 הזה ל-Phase 1 המתאים?',
      o: ['<code>phase1name</code>', '<code>parent</code>', '<code>interface</code>', '<code>linkto</code>'],
      a: 0,
      w: '<code>set phase1name</code> מציין לאיזה Phase 1 Interface שייך ה-Phase 2 - כך FortiGate יודע תחת איזו תעלה מוצפנת להחיל את ה-subnets שהוגדרו.'
    },
    {
      code: 'config vpn ssl settings\n    set ___ 10443\n    set source-interface "port1"\nend',
      q: 'מה משלים את הפקודה כדי להגדיר את פורט ה-TCP שדרכו משתמשים מתחברים ל-SSL VPN?',
      o: ['<code>port</code>', '<code>tcp-port</code>', '<code>listen-port</code>', '<code>vpn-port</code>'],
      a: 0,
      w: '<code>set port</code> תחת <code>config vpn ssl settings</code> קובע את הפורט להתחברות ל-Portal (ברירת מחדל 443, מומלץ להחליף לפורט ייעודי כמו 10443 מטעמי אבטחה).'
    },
    {
      code: 'config firewall vip\n    edit "VIP_WebServer"\n        set extip 203.0.113.10\n        set ___ "10.0.5.20"\n        set extport 443\n        set mappedport 443\n    next\nend',
      q: 'מה משלים את הפקודה כדי להגדיר את כתובת ה-IP הפנימית שאליה מתבצע ה-DNAT?',
      o: ['<code>mappedip</code>', '<code>internal-ip</code>', '<code>dstip</code>', '<code>target-ip</code>'],
      a: 0,
      w: '<code>set mappedip</code> מגדיר את הכתובת הפנימית (הפרטית) של השרת בפועל, אליה FortiGate מתרגם את התעבורה שמגיעה ל-extip הציבורי.'
    },
    {
      code: 'config router static\n    edit 1\n        set dst 0.0.0.0 0.0.0.0\n        set gateway 203.0.113.1\n        set ___ 20\n    next\nend',
      q: 'מה משלים את הפקודה כדי לתת למסלול הזה עדיפות נמוכה יותר (Administrative Distance גבוה יותר מברירת המחדל)?',
      o: ['<code>distance</code>', '<code>metric</code>', '<code>priority</code>', '<code>weight</code>'],
      a: 0,
      w: '<code>set distance</code> קובע את ה-Administrative Distance של המסלול. ערך גבוה יותר אומר עדיפות נמוכה יותר מול מסלולים מתחרים לאותו יעד.'
    },
    {
      code: 'config firewall ippool\n    edit "Outbound_Pool"\n        set startip 203.0.113.50\n        set endip 203.0.113.55\n        set type ___\n    next\nend',
      q: 'מה משלים את הפקודה כדי להגדיר IP Pool בסגנון "רבים-לרבים" (כמו PAT רגיל)?',
      o: ['<code>overload</code>', '<code>one-to-one</code>', '<code>fixed-port-range</code>', '<code>port-block-allocation</code>'],
      a: 0,
      w: '<code>overload</code> הוא הסוג הנפוץ ביותר - מספר מקורות פנימיים משתפים מאגר כתובות ציבוריות, בדומה ל-PAT מסורתי. סוגים אחרים כמו <code>one-to-one</code> מתאימים לתרחישים ספציפיים יותר.'
    },
    {
      code: 'config system ha\n    set group-id 10\n    set mode ___\n    set password "HA_Sync_Password123"\nend',
      q: 'מה משלים את הפקודה כדי להגדיר קלאסטר HA במצב Active-Passive?',
      o: ['<code>a-p</code>', '<code>active-passive</code>', '<code>ap</code>', '<code>standby</code>'],
      a: 0,
      w: 'הערך התקני ב-FortiOS למצב Active-Passive הוא <code>a-p</code> (הערך המקביל ל-Active-Active הוא <code>a-a</code>).'
    },
    {
      code: 'config system ha\n    set group-id 10\n    set mode a-p\n    set ___ "port10" 50\nend',
      q: 'מה משלים את הפקודה כדי להגדיר את ממשק ה-Heartbeat לסנכרון בין חברי הקלאסטר?',
      o: ['<code>hbdev</code>', '<code>sync-interface</code>', '<code>heartbeat-port</code>', '<code>cluster-link</code>'],
      a: 0,
      w: '<code>set hbdev</code> מגדיר את ממשק (או ממשקי) ה-Heartbeat שדרכם חברי הקלאסטר בודקים תקינות זה של זה ומסנכרנים session-ים וקונפיגורציה.'
    },
    {
      code: 'config ips sensor\n    edit "custom-ips"\n        config entries\n            edit 1\n                set severity high critical\n                set ___ block\n        end\n    next\nend',
      q: 'מה משלים את הפקודה כדי לקבוע שחתימות ברמת חומרה high/critical ייחסמו?',
      o: ['<code>action</code>', '<code>response</code>', '<code>mode</code>', '<code>result</code>'],
      a: 0,
      w: '<code>set action</code> ב-IPS entry קובע מה יקרה כשחתימה מתאימה מתגלה. הערכים הנפוצים הם <code>pass</code>, <code>block</code>, <code>reset</code> ו-<code>default</code>.'
    },
    {
      code: '$ ___ system ha status',
      q: 'איזו פקודת CLI (get/show/diagnose) מציגה את סטטוס קלאסטר ה-HA הנוכחי?',
      o: ['<code>get</code>', '<code>show</code>', '<code>edit</code>', '<code>config</code>'],
      a: 0,
      w: '<code>get system ha status</code> מציגה מידע תפעולי בזמן אמת (מי Primary, מצב הסנכרון). <code>show</code> לעומת זאת מציג את הקונפיגורציה השמורה, ולא סטטוס חי.'
    },
    {
      code: 'config webfilter profile\n    edit "corp-web-filter"\n        config ftgd-wf\n            config filters\n                edit 1\n                    set category 26\n                    set ___ block\n                next\n            end\n        end\n    next\nend',
      q: 'מה משלים את הפקודה כדי לחסום גישה לקטגוריית ה-Web Filtering שהוגדרה (26 - Malicious Websites)?',
      o: ['<code>action</code>', '<code>set-block</code>', '<code>policy</code>', '<code>rule</code>'],
      a: 0,
      w: '<code>set action</code> בתוך <code>config filters</code> קובע איך FortiGate מתייחס לתעבורה מקטגוריה זו - למשל <code>block</code>, <code>monitor</code> או <code>allow</code>.'
    }
  ];

  /* ============================================================
     מצב 4 - התאמת מושגים: סבבים של זוגות מושג/פקודה + תיאור
     ============================================================ */
  var MATCH_ROUNDS = [
    {
      title: 'ארכיטקטורה ומוצרים',
      pairs: [
        { l: 'FortiGate', r: 'הפיירוול המרכזי (NGFW) של Fortinet' },
        { l: 'FortiOS', r: 'מערכת ההפעלה שרצה על כל מכשירי FortiGate' },
        { l: 'FortiManager', r: 'ניהול קונפיגורציה מרכזי למספר מכשירי FortiGate' },
        { l: 'FortiAnalyzer', r: 'ריכוז לוגים, דוחות ואנליטיקה מכמה מכשירים' },
        { l: 'Security Fabric', r: 'מערך מוצרי Fortinet שמדברים ביניהם ליצירת הגנה אחודה' }
      ]
    },
    {
      title: 'Security Policies ו-NAT',
      pairs: [
        { l: '<code>config firewall policy</code>', r: 'ה-context המרכזי להגדרת מדיניות אבטחה' },
        { l: 'Implicit Deny', r: 'חסימה אוטומטית של תעבורה שלא תואמת אף Policy מפורש' },
        { l: 'Address Object', r: 'אובייקט בשם קבוע במקום כתיבת IP חופשי ב-Policy' },
        { l: 'Virtual IP (VIP)', r: 'מיפוי Destination NAT מכתובת ציבורית לשרת פנימי' },
        { l: 'IP Pool', r: 'מאגר כתובות ציבוריות המשמש ל-Source NAT יוצא' }
      ]
    },
    {
      title: 'VPN',
      pairs: [
        { l: 'IPsec VPN', r: 'בעיקר לחיבור Site-to-Site בין סניפים/משרדים' },
        { l: 'SSL VPN', r: 'בעיקר לחיבור Remote Access של משתמשים בודדים' },
        { l: 'Phase 1 (IKE)', r: 'הקמת תעלה מאובטחת עם אימות הדדי בין שני ה-Gateways' },
        { l: 'Phase 2 (IPsec SA)', r: 'הגדרת ה-subnets והפרמטרים להצפנת התעבורה עצמה' },
        { l: 'FortiClient', r: 'אפליקציית קצה המשמשת בין השאר כ-VPN client' }
      ]
    },
    {
      title: 'UTM ו-HA',
      pairs: [
        { l: 'IPS', r: 'זיהוי וחסימת התקפות לפי חתימות ידועות' },
        { l: 'Web Filtering', r: 'בקרת גישה לאתרים לפי קטגוריות FortiGuard' },
        { l: 'SSL Inspection', r: 'פתיחת הצפנת HTTPS זמנית כדי לבדוק תוכן' },
        { l: 'FGCP', r: 'הפרוטוקול שמנהל את קלאסטר ה-HA של FortiGate' },
        { l: 'Active-Passive HA', r: 'מכשיר אחד מעבד תעבורה, השני בהמתנה ומוכן ל-Failover' }
      ]
    }
  ];

  /* ============================================================
     מצב 5 - סידור תהליך: סבבים של שלבים שצריך לסדר בסדר הנכון
     ============================================================ */
  var ORDER_ROUNDS = [
    {
      title: 'הקמת Security Policy מבוקרת (במקום allow-all)',
      steps: [
        'יצירת Address Object לרשת המקור (config firewall address)',
        'יצירת Service Group לשירותים הרלוונטיים (למשל HTTP/HTTPS)',
        'יצירת ה-Policy עצמו עם srcintf/dstintf/srcaddr/dstaddr ו-action accept',
        'הפעלת nat ו-Security Profiles (ips-sensor, av-profile, webfilter-profile) על ה-Policy',
        'הוספת Policy חוסם מפורש (Deny-All) בסוף הרשימה עם logtraffic all'
      ]
    },
    {
      title: 'הקמת Site-to-Site IPsec VPN בין שני סניפים',
      steps: [
        'הגדרת Phase 1 (IKE) עם remote-gw ו-psksecret בשני הצדדים',
        'הגדרת Phase 2 (IPsec SA) עם src-subnet ו-dst-subnet מתאימים',
        'הוספת Static Route שמנתב את הרשת המרוחקת דרך ממשק ה-VPN',
        'יצירת Firewall Policy דו-כיווני בין ה-LAN לממשק ה-VPN',
        'בדיקת מצב התעלה עם get vpn ipsec tunnel summary ו-diagnose vpn ike gateway list'
      ]
    },
    {
      title: 'הקמת HA Cluster במצב Active-Passive',
      steps: [
        'ווידוא ששני המכשירים מאותו דגם ואותה גרסת FortiOS בדיוק',
        'חיבור כבל ייעודי בין שני המכשירים לממשק ה-Heartbeat',
        'הגדרת group-id, group-name ו-password זהים בשני המכשירים תחת config system ha',
        'הגדרת priority שונה בכל מכשיר כדי לקבוע מי יהיה Primary',
        'בדיקת סטטוס הקלאסטר וסנכרון עם get system ha status ו-diagnose sys ha checksum cluster'
      ]
    },
    {
      title: 'הפעלת UTM מלא (AV, IPS, Web Filter) על תעבורה יוצאת',
      steps: [
        'הגדרת Antivirus Profile עם av-scan block ל-HTTP/FTP',
        'הגדרת IPS Sensor עם action block לחתימות high/critical',
        'הגדרת Web Filter Profile עם קטגוריות חסומות/מנוטרות',
        'הגדרת SSL-SSH Profile עם deep-inspection והתקנת תעודת ה-CA בתחנות הקצה',
        'צירוף כל ה-Profiles ל-Firewall Policy הרלוונטי והפעלת utm-status enable'
      ]
    }
  ];

  /* ============================================================
     הגדרת מצבי המשחק
     ============================================================ */
  var MODES = [
    { key: 'rapid', icon: '⚡', name: 'קרב מהיר', desc: 'שאלות ידע כלליות על Fortinet/FortiGate - כמה תספיקו לפני שהזמן נגמר?', type: 'quiz', data: RAPID, sample: 8, time: 20000 },
    { key: 'status', icon: '🔎', name: 'ניחוש קונפיגורציה', desc: 'קטע Policy או קונפיגורציה - מה בדיוק קורה בפועל?', type: 'quiz', data: STATUS_GUESS, sample: 8, time: 28000, showCode: true },
    { key: 'cmd', icon: '🧩', name: 'השלמת פקודת CLI', desc: 'פקודת FortiOS עם חלק חסר - בחרו מה משלים אותה נכון', type: 'quiz', data: CMD_COMPLETE, sample: 8, time: 28000, showCode: true },
    { key: 'match', icon: '🔗', name: 'התאמת מושגים', desc: 'התאימו כל מושג/פקודה של Fortinet לתיאור הנכון שלו', type: 'match', data: MATCH_ROUNDS, sample: 2 },
    { key: 'order', icon: '📋', name: 'סידור תהליך', desc: 'סדרו את שלבי התהליך לפי הסדר הנכון', type: 'order', data: ORDER_ROUNDS, sample: 2 }
  ];

  window.TG_CONFIG = { gameId: "fortinet", modes: MODES };
})();
</script>

<script src="/scripts/topic-game.js"></script>
