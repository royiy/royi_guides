---
sidebar_position: 13
title: "VMware #13 — משחק לימודי: אתגר VMware"
description: "משחק אינטראקטיבי ללימוד VMware vSphere - חמישה מצבי משחק עם טיימר, לבבות, ניקוד ורצפים: קרב מהיר, ניחוש PowerCLI, השלמת פקודות, התאמת מושגים וסידור תהליכים."
---

חמישה מצבי משחק שבודקים היבטים שונים של ESXi, vCenter ו-vSphere - לא עוד חידון רב-ברירה, אלא משחק עם **טיימר**, **שלושה לבבות**, **מכפיל רצף** ו**שיא אישי** שנשמר בדפדפן. בסוף כל סבב תקבלו דירוג, ורשימת חזרה של בדיוק מה שפספסתם.

<div class="tg" id="tg" dir="rtl">
  <div class="tg-screen is-active" data-screen="menu">
    <div class="tg-hero">
      <div class="tg-hero-badge">VMware</div>
      <div class="tg-hero-title">אתגר VMware</div>
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
      q: 'מהו ESXi?',
      o: ['Hypervisor מסוג Type 1 שמותקן ישירות על החומרה (Bare Metal), בלי מערכת הפעלה מתווכת', 'תוכנת ניהול מרכזית ל-vCenter', 'מערכת קבצים ל-Datastore', 'פרוטוקול תקשורת בין Hosts'],
      a: 0,
      w: 'ESXi הוא ה-Hypervisor של VMware - הוא רץ ישירות מעל החומרה הפיזית (Type 1), בניגוד ל-Type 2 (כמו VMware Workstation) שרץ מעל מערכת הפעלה קיימת.'
    },
    {
      q: 'מה תפקידו של vCenter Server בסביבת vSphere?',
      o: ['ניהול מרכזי של מספר Hosts, Clusters ו-VMs ממקום אחד, כולל תכונות כמו vMotion, DRS ו-HA', 'הרצת VMs בפועל במקום ESXi', 'החלפה מלאה ל-ESXi על כל Host', 'שירות גיבוי בלבד'],
      a: 0,
      w: 'vCenter הוא שכבת הניהול המרכזית - בלעדיו כל ESXi Host מנוהל בנפרד, ולא ניתן להפעיל תכונות ברמת Cluster כמו vMotion, DRS ו-HA.'
    },
    {
      q: 'מהו VMFS?',
      o: ['מערכת קבצים קלאסטרית (Clustered File System) של VMware לאחסון VMs על אחסון בלוקים משותף', 'פרוטוקול רשת ל-vMotion', 'סוג של vSwitch', 'כלי לניטור ביצועים'],
      a: 0,
      w: 'VMFS מאפשר למספר ESXi Hosts לגשת בו-זמנית לאותו Datastore (למשל על SAN/iSCSI) עם נעילות ברמת קובץ, כך שכמה Hosts יכולים להריץ VMs מאותו אחסון משותף.'
    },
    {
      q: 'מה ההבדל בין Standard vSwitch (vSS) ל-Distributed Switch (vDS)?',
      o: ['vSS מוגדר ומנוהל בנפרד בכל Host; vDS מנוהל מרכזית מ-vCenter ומשותף לכל ה-Hosts ב-Cluster', 'אין הבדל מעשי בין השניים', 'vSS תומך רק ב-iSCSI ו-vDS רק ב-NFS', 'vDS זמין רק בגרסת ESXi החינמית'],
      a: 0,
      w: 'vDS חוסך זמן ומונע אי-התאמות קונפיגורציה - שינוי מוגדר פעם אחת ב-vCenter ומתפשט אוטומטית לכל ה-Hosts המחוברים אליו.'
    },
    {
      q: 'מהו vMotion?',
      o: ['העברה חיה (Live Migration) של VM רץ מ-Host אחד לאחר, ללא Downtime', 'העתקת VM לגיבוי', 'שינוי גודל דיסק תוך כדי ריצה', 'שחזור VM מ-Snapshot'],
      a: 0,
      w: 'vMotion מעביר את מצב הזיכרון וה-CPU של VM חי בין Hosts (בדרך כלל דרך VMkernel network ייעודי), כשהמשתמשים כמעט ולא מרגישים בהעברה.'
    },
    {
      q: 'מה עושה DRS (Distributed Resource Scheduler)?',
      o: ['מאזן אוטומטית עומסי CPU/Memory בין Hosts ב-Cluster, ומזיז VMs (vMotion) לפי הצורך', 'מגן מפני כשל Host', 'מנהל הרשאות משתמשים', 'מבצע גיבויים אוטומטיים'],
      a: 0,
      w: 'DRS מנטר ניצול משאבים ב-Cluster ומזיז VMs (vMotion) בין Hosts כדי לאזן עומס - הוא יכול לפעול במצב Manual, Partially Automated או Fully Automated.'
    },
    {
      q: 'מה עושה vSphere HA (High Availability)?',
      o: ['מפעיל מחדש VMs על Host אחר ב-Cluster אם ה-Host המקורי נכשל', 'מבצע Load Balancing שוטף בין Hosts', 'מעביר VM חי בלי Downtime', 'יוצר עותק גיבוי מלא ל-VM'],
      a: 0,
      w: 'HA לא מונעת Downtime - היא מזהה כשל Host ומפעילה מחדש (Restart, לא Live Migration) את ה-VMs שהיו עליו, על Host פעיל אחר ב-Cluster.'
    },
    {
      q: 'מהו Admission Control ב-HA?',
      o: ['מנגנון ששומר משאבים ברזרבה ב-Cluster, כדי להבטיח שיהיה מקום להפעיל מחדש VMs אחרי כשל Host', 'רכיב אבטחה שמונע כניסת VMs חדשים', 'כלי לניהול הרשאות משתמשים', 'מנגנון גיבוי אוטומטי'],
      a: 0,
      w: 'Admission Control "שומר" נתח משאבים (למשל לפי Slot Policy או Percentage) כדי שאם Host ייכשל, יהיו מספיק CPU/Memory פנויים ב-Hosts הנותרים כדי להפעיל מחדש את כל ה-VMs.'
    },
    {
      q: 'מהו Snapshot ב-VM?',
      o: ['תמונת מצב של דיסק וזיכרון VM בנקודת זמן מסוימת, שמאפשרת חזרה אחורה - אך אינה תחליף לגיבוי', 'עותק גיבוי מלא ומוצפן', 'תהליך שכפול VM חדש', 'תצורת רשת קבועה ל-VM'],
      a: 0,
      w: 'Snapshot יוצר Delta Disk ששומר שינויים החל מרגע הצילום. הוא שימושי לבדיקות זמניות (כמו לפני עדכון), אבל Snapshots רבים או ישנים פוגעים בביצועים ואינם תחליף לפתרון גיבוי אמיתי.'
    },
    {
      q: 'מה עושה Storage vMotion?',
      o: ['מעביר את קבצי הדיסק של VM רץ בין Datastores שונים, ללא Downtime', 'מעביר VM בין Hosts', 'משכפל VM לצורך גיבוי', 'משנה את גודל ה-RAM המוקצה ל-VM'],
      a: 0,
      w: 'בעוד vMotion רגיל מעביר Compute (Host), Storage vMotion מעביר את קבצי ה-VM (VMDK וכו׳) בין Datastores תוך כדי ריצה - שימושי לפני תחזוקת אחסון או לאיזון קיבולת.'
    },
    {
      q: 'מהו Resource Pool?',
      o: ['חלוקה לוגית של משאבי CPU/Memory בתוך Host או Cluster, המאפשרת הקצאת Shares/Limits/Reservations לקבוצות VMs', 'סוג של Datastore', 'רכיב רשת ל-vMotion', 'תיקיית אחסון ל-Templates'],
      a: 0,
      w: 'Resource Pools מאפשרים לחלק משאבים היררכית - למשל להקצות עדיפות גבוהה יותר לסביבת Production לעומת Test, בלי להגדיר הגבלות על כל VM בנפרד.'
    },
    {
      q: 'מהו VMkernel Port/Adapter?',
      o: ['ממשק רשת ברמת ה-Host המשמש לתעבורת ניהול, vMotion, iSCSI/NFS או Fault Tolerance - לא לתעבורת VMs', 'כרטיס רשת וירטואלי בתוך VM', 'פרוטוקול אבטחה', 'רכיב אחסון פיזי'],
      a: 0,
      w: 'VMkernel Adapters הם הממשקים ש-ESXi עצמו (לא ה-VMs) משתמש בהם - למשל vmk0 לניהול, vmk1 ל-vMotion, vmk2 ל-iSCSI וכו׳, כל אחד יכול לשבת ב-VLAN/vSwitch נפרד.'
    },
    {
      q: 'מה תפקיד DRS Affinity Rules?',
      o: ['להגדיר כללים כמו "שני VMs תמיד יחד" (Affinity) או "אף פעם לא ביחד" (Anti-Affinity) על אותו Host', 'לקבוע איזה VM יקבל עדיפות ב-vMotion בלבד', 'להגביל גישת רשת בין VMs', 'לנעול VM על Datastore מסוים'],
      a: 0,
      w: 'כלל Anti-Affinity שימושי למשל לשני Nodes של אותו Cluster אפליקטיבי (כמו שני Web Servers), כדי ש-DRS לא יריץ את שניהם על אותו Host פיזי ויפגע בזמינות אם ה-Host ייפול.'
    },
    {
      q: 'מהו vSAN?',
      o: ['פתרון Software-Defined Storage של VMware שמאחד דיסקים מקומיים מכמה ESXi Hosts לאחסון משותף אחד', 'פרוטוקול לחיבור SAN חיצוני בלבד', 'כלי ניטור רשת', 'מנגנון גיבוי מובנה ל-vCenter'],
      a: 0,
      w: 'vSAN הופך אחסון מקומי (SSD/HDD) בכל Host ב-Cluster לאחסון מבוזר ומשותף, בלי צורך ב-SAN חיצוני נפרד - עם רמות הגנה מוגדרות (FTT) שקובעות כמה כשלים אפשר לספוג.'
    },
    {
      q: 'מהו Content Library ב-vCenter?',
      o: ['מאגר מרכזי לשיתוף Templates, ISO-ים ו-vApps בין vCenters שונים או Datacenters', 'תיקיית לוגים של vCenter', 'רשימת המשתמשים המורשים', 'מסד הנתונים הפנימי של vCenter'],
      a: 0,
      w: 'Content Library מאפשר לפרסם תוכן (כמו VM Template) פעם אחת ולסנכרן אותו אוטומטית לכמה vCenters/אתרים - נוח לארגונים עם כמה מיקומים.'
    },
    {
      q: 'מהי PowerCLI?',
      o: ['מודול PowerShell רשמי של VMware לניהול ואוטומציה של vSphere דרך שורת פקודה/סקריפטים', 'ממשק גרפי חלופי ל-vCenter', 'שפת תכנות ייעודית ל-ESXi בלבד', 'כלי ניטור ביצועים חיצוני'],
      a: 0,
      w: 'PowerCLI מאפשר לבצע כל פעולה שאפשר בממשק ה-Web של vCenter (וגם כאלה שאי אפשר) דרך פקודות PowerShell - קריטי לאוטומציה בסביבות גדולות.'
    },
    {
      q: 'מהו EVC (Enhanced vMotion Compatibility)?',
      o: ['מנגנון שמסתיר יכולות CPU מתקדמות ומיישר Baseline בין Hosts עם מעבדים שונים, כדי לאפשר vMotion ביניהם', 'כלי הצפנה ל-vMotion', 'תכונת אבטחה שמונעת גישת רשת לא מורשית', 'מנגנון גיבוי ל-CPU'],
      a: 0,
      w: 'ללא EVC, vMotion בין Hosts עם דורות מעבד שונים עלול להיכשל בגלל חוסר תאימות ב-CPU Instruction Sets. EVC מגדיר "מכנה משותף" ברמת Cluster כדי לאפשר תאימות.'
    }
  ];

  /* ============================================================
     מצב 2 - ניחוש PowerCLI/מצב: קטע קוד/תרחיש + מה קורה בפועל
     ============================================================ */
  var STATUS_GUESS = [
    {
      code: '$ Get-VM -Name "web01" | Get-Snapshot',
      q: 'הרצתם את הפקודה הזו וקיבלתם רשימה עם 3 Snapshots, אחד מהם ישן משמעותית מהשאר. מה נכון להסיק?',
      o: ['סביר שיש Snapshots שנשכחו ולא הוסרו - כדאי לבדוק צורך ולהריץ <code>Remove-Snapshot</code> לפני שהם פוגעים בביצועים ובנפח האחסון', 'זה מצב תקין תמיד ואין צורך לפעול', 'Snapshot ישן נמחק אוטומטית על ידי vCenter', 'יש לבצע מיד Reboot ל-vCenter'],
      a: 0,
      w: 'Snapshots שמצטברים לאורך זמן מגדילים Delta Disks, מאטים I/O ועלולים למלא Datastore. מומלץ לנטר ולמחוק Snapshots לא נחוצים באופן קבוע.'
    },
    {
      code: '$ Move-VM -VM "app02" -Destination (Get-VMHost "esxi03.lab.local")',
      q: 'איזו פעולה הפקודה הזו מבצעת בפועל?',
      o: ['vMotion של VM רץ מה-Host הנוכחי אל esxi03.lab.local', 'מחיקת ה-VM והתקנה מחדש', 'יצירת Clone חדש של ה-VM', 'שינוי ה-Datastore של ה-VM בלבד'],
      a: 0,
      w: '<code>Move-VM</code> עם פרמטר <code>-Destination</code> שמקבל Host (ולא Datastore) מבצע Live Migration - שקול ל-vMotion מהממשק הגרפי.'
    },
    {
      code: '$ Get-Cluster "Production" | Get-VMHost | Where-Object {$_.ConnectionState -eq "Maintenance"}',
      q: 'מה מחזירה הפקודה הזו?',
      o: ['רשימת ה-Hosts בקלאסטר "Production" שנמצאים כרגע במצב Maintenance Mode', 'רשימת כל ה-VMs שכבויים בקלאסטר', 'רשימת Snapshots פעילים', 'רשימת Datastores מלאים'],
      a: 0,
      w: '<code>Get-VMHost</code> מחזיר את כל ה-Hosts בקלאסטר, ו-<code>Where-Object</code> מסנן רק את אלה עם <code>ConnectionState</code> השווה ל-Maintenance - כלומר Hosts שהוצאו זמנית משירות VMs.'
    },
    {
      code: '$ Get-Datastore | Sort-Object -Property FreeSpaceGB',
      q: 'מה תראה תחילת הפלט של הפקודה הזו?',
      o: ['ה-Datastore עם הכי מעט שטח פנוי יופיע ראשון', 'ה-Datastore הגדול ביותר בקיבולת כוללת יופיע ראשון', 'רק Datastores מסוג NFS יוצגו', 'הפקודה תמחק Datastores ריקים'],
      a: 0,
      w: '<code>Sort-Object</code> ללא <code>-Descending</code> ממיין בסדר עולה - כך שה-Datastore עם הכי פחות שטח פנוי (שהכי דחוף לטפל בו) מופיע ראשון ברשימה.'
    },
    {
      code: '$ Set-VM -VM "db01" -MemoryGB 32 -Confirm:$false',
      q: 'מה קורה כשמריצים פקודה כזו על VM שרץ כרגע (Powered On)?',
      o: ['אם ה-Guest OS וה-VM Hardware תומכים ב-Hot Add Memory, השינוי יחול בלי לכבות; אחרת יידרש Reboot לפני שהזיכרון החדש ייכנס לתוקף', 'השינוי תמיד חל מיידית ללא תנאים', 'הפקודה תיכשל תמיד על VM רץ', 'ה-VM יימחק ויוקם מחדש עם הזיכרון החדש'],
      a: 0,
      w: 'Hot Add הוא Feature אופציונלי שצריך להיות מופעל מראש ב-VM (ותומך במערכת ההפעלה) - בלעדיו שינוי RAM/CPU דורש כיבוי והדלקה מחדש של ה-VM.'
    },
    {
      code: '$ Get-VMHost "esxi02" | Get-VMHostNetworkAdapter -VMKernel',
      q: 'מה הפקודה הזו מציגה?',
      o: ['את כל ממשקי ה-VMkernel (vmk0, vmk1...) המוגדרים ב-Host, כולל אלה המשמשים לניהול, vMotion או אחסון', 'את כל ה-VMs הרצים על ה-Host', 'את רשימת כרטיסי הרשת הפיזיים בלבד', 'את הגדרות ה-Firewall של ה-Host'],
      a: 0,
      w: 'הדגל <code>-VMKernel</code> מסנן רק את ממשקי ה-VMkernel של ה-Host עצמו - לא כרטיסי רשת של VMs, ולא ה-Physical Uplinks (pNICs).'
    },
    {
      code: '$ New-Snapshot -VM "web01" -Name "Before-Patch" -Memory:$true -Quiesce:$false',
      q: 'מה המשמעות של הדגל <code>-Memory:$true</code> בפקודה הזו?',
      o: ['הצילום כולל גם את מצב הזיכרון (RAM) של ה-VM, כך שאפשר לשחזר למצב "רץ" בדיוק - אך זה מאריך את זמן יצירת ה-Snapshot', 'הצילום כולל רק את הדיסק בלי מצב זיכרון', 'הפקודה תמחק את הזיכרון הנוכחי', 'הדגל לא משפיע על Snapshots של VMs רצים'],
      a: 0,
      w: 'Snapshot עם Memory כולל Dump של ה-RAM, כך שכשמשחזרים ל-Snapshot ה-VM "מתעורר" בדיוק באותו מצב ריצה - לעומת Snapshot בלי Memory, שמצריך אתחול מחדש של ה-Guest OS בשחזור.'
    },
    {
      code: '$ Get-Cluster "Prod" | Get-DrsRecommendation',
      q: 'מתי בעיקר תראו פלט (המלצות) מהפקודה הזו?',
      o: ['כאשר DRS מוגדר במצב Manual או Partially Automated, ויש חוסר איזון בעומס בין ה-Hosts בקלאסטר', 'רק כאשר Host נופל לגמרי', 'רק כאשר יש קונפליקט רשת', 'הפקודה תמיד ריקה במצב Fully Automated'],
      a: 0,
      w: 'ב-Fully Automated, DRS מבצע את ה-vMotion-ים בעצמו בלי לחכות לאישור, ולכן פחות סביר לראות המלצות ממתינות. ב-Manual/Partially Automated הן ממתינות לאישור אדם.'
    },
    {
      code: '$ Get-VM | Get-Snapshot | Where-Object {$_.Created -lt (Get-Date).AddDays(-7)}',
      q: 'מה הפקודה הזו מזהה?',
      o: ['את כל ה-Snapshots בסביבה שנוצרו לפני יותר משבוע - מועמדים טובים לבדיקה ומחיקה', 'VMs שלא הופעלו יותר משבוע', 'Datastores שלא עודכנו שבוע', 'משתמשים שלא התחברו שבוע'],
      a: 0,
      w: 'שילוב שימושי ל-Housekeeping: מוצא Snapshots "זקנים" בכל הסביבה שעלולים להיות שנשכחו, ולגרום לבעיות ביצועים ונפח אם לא יטופלו.'
    },
    {
      code: '$ Get-VMHost "esxi04" | Set-VMHost -State Maintenance',
      q: 'מה קורה ל-VMs שרצים על esxi04 ברגע שהפקודה הזו מתבצעת (ובקלאסטר מופעל DRS Fully Automated)?',
      o: ['DRS יזיז אותם אוטומטית באמצעות vMotion ל-Hosts אחרים בקלאסטר לפני שה-Host נכנס למצב Maintenance', 'כל ה-VMs יכבו באופן מיידי', 'ה-VMs יימחקו', 'הפקודה תיכשל אם יש VMs רצים'],
      a: 0,
      w: 'כניסה ל-Maintenance Mode בקלאסטר עם DRS Fully Automated מפעילה פינוי אוטומטי (Evacuation) - DRS מבצע vMotion לכל ה-VMs לפני שה-Host נכנס בפועל לתחזוקה.'
    },
    {
      code: '$ Get-VM "web01" | Get-HardDisk | Where-Object {$_.Persistence -eq "IndependentPersistent"}',
      q: 'מה מייחד דיסק במצב Independent Persistent?',
      o: ['הדיסק אינו מושפע מ-Snapshots בכלל - שינויים בו נשמרים תמיד ישירות, גם אם מבצעים Snapshot ל-VM', 'הדיסק נמחק אוטומטית בכיבוי', 'הדיסק משותף בין כמה VMs בו-זמנית', 'הדיסק מוצפן כברירת מחדל'],
      a: 0,
      w: 'דיסקים כאלה שימושיים למשל לקבצי לוג שרוצים לשמר גם אחרי Revert ל-Snapshot ישן - הם "יוצאים" ממנגנון ה-Snapshot לגמרי.'
    },
    {
      code: '$ Connect-VIServer -Server vcenter.lab.local -Force\nWARNING: Invalid certificate...',
      q: 'מדוע מתקבלת אזהרת Invalid Certificate בהתחברות?',
      o: ['ה-vCenter משתמש בתעודת SSL עצמית (Self-Signed) או לא מהימנה, ו-PowerCLI לא הוגדר להתעלם מבדיקת התעודה', 'הסיסמה שגויה', 'המשתמש לא קיים ב-vCenter', 'הרשת בין המחשב ל-vCenter חסומה לגמרי'],
      a: 0,
      w: 'ניתן להשתיק את האזהרה עם <code>Set-PowerCLIConfiguration -InvalidCertificateAction Ignore</code> (מקובל במעבדות), אך בסביבת Production מומלץ להתקין תעודה חתומה כראוי במקום להתעלם מהבעיה.'
    },
    {
      code: '$ Get-VM | Where-Object {$_.PowerState -eq "PoweredOff"} | Remove-VM -DeletePermanently',
      q: 'מה תוצאת הפקודה הזו על כל VM כבוי בסביבה?',
      o: ['מחיקה מיידית ובלתי הפיכה של ה-VM וקבצי הדיסק שלו מה-Datastore - יש להריץ בזהירות רבה', 'רק כיבוי נוסף של VMs שכבר כבויים', 'הפקודה תשאל אישור לכל VM בנפרד תמיד', 'רק הסרה מהאינוונטורי, הקבצים נשארים'],
      a: 0,
      w: '<code>-DeletePermanently</code> מוחק גם את קבצי ה-VMDK מהדיסק, בניגוד להסרה רגילה מהאינוונטורי (<code>Remove-VM</code> בלבד) שרק "שוכחת" את ה-VM אך משאירה את הקבצים. פייפ רחב כזה למחיקה מסוכן - כדאי לבדוק תמיד קודם עם <code>-WhatIf</code>.'
    }
  ];

  /* ============================================================
     מצב 3 - השלמת פקודת PowerCLI: פקודה עם חלק חסר, לבחור מה משלים אותה
     ============================================================ */
  var CMD_COMPLETE = [
    {
      code: '$ ___ -Server vcenter.lab.local -User administrator@vsphere.local',
      q: 'מה משלים את הפקודה כדי להתחבר ל-vCenter מ-PowerCLI?',
      o: ['<code>Connect-VIServer</code>', '<code>New-VIServer</code>', '<code>Open-VIServer</code>', '<code>Start-VIServer</code>'],
      a: 0,
      w: '<code>Connect-VIServer</code> היא נקודת הכניסה הראשונה בכל סקריפט PowerCLI - היא פותחת Session מול vCenter (או ESXi ישירות) ומאמתת משתמש.'
    },
    {
      code: '$ Get-VM -Name "web01" | ___ -Name "Before-Update"',
      q: 'מה משלים את הפקודה כדי ליצור Snapshot חדש ל-VM?',
      o: ['<code>New-Snapshot</code>', '<code>Add-Snapshot</code>', '<code>Create-Snapshot</code>', '<code>Set-Snapshot</code>'],
      a: 0,
      w: '<code>New-Snapshot</code> יוצר Snapshot חדש; אפשר להוסיף לו <code>-Memory</code> ו-<code>-Quiesce</code> לפי הצורך.'
    },
    {
      code: '$ Get-VM -Name "app02" | ___ -Destination esxi05.lab.local',
      q: 'מה משלים את הפקודה לביצוע vMotion של VM ל-Host אחר?',
      o: ['<code>Move-VM</code>', '<code>Migrate-VM</code>', '<code>Set-VMHost</code>', '<code>Copy-VM</code>'],
      a: 0,
      w: '<code>Move-VM</code> עם פרמטר <code>-Destination</code> שמצביע על Host מבצע vMotion. עם <code>-Datastore</code> במקום הוא יבצע Storage vMotion.'
    },
    {
      code: '$ Get-Datastore | ___ -Property FreeSpaceGB -Descending',
      q: 'מה משלים את הפקודה כדי למיין Datastores מהכי פנוי לפחות פנוי?',
      o: ['<code>Sort-Object</code>', '<code>Group-Object</code>', '<code>Select-Object</code>', '<code>Where-Object</code>'],
      a: 0,
      w: '<code>Sort-Object -Property FreeSpaceGB -Descending</code> ממיין מהערך הגדול ביותר לקטן ביותר - שימושי לזיהוי מהיר של ה-Datastore הכי פנוי לפני Deploy.'
    },
    {
      code: '$ Get-VM | Get-Snapshot | ___ -Confirm:$false',
      q: 'מה משלים את הפקודה כדי למחוק את כל ה-Snapshots שנמצאו?',
      o: ['<code>Remove-Snapshot</code>', '<code>Delete-Snapshot</code>', '<code>Clear-Snapshot</code>', '<code>Drop-Snapshot</code>'],
      a: 0,
      w: '<code>Remove-Snapshot</code> מוחקת Snapshot ומאחדת (Consolidate) את השינויים שנצברו ב-Delta Disk בחזרה לדיסק הבסיס. <code>-Confirm:$false</code> מדלג על אישור אינטראקטיבי - שימושי בסקריפטים אוטומטיים.'
    },
    {
      code: '$ New-VM -Name "web03" -___ "web-template" -VMHost esxi02.lab.local',
      q: 'מה משלים את הפקודה כדי ליצור VM חדש מתוך Template קיים?',
      o: ['<code>-Template</code>', '<code>-Clone</code>', '<code>-Source</code>', '<code>-Base</code>'],
      a: 0,
      w: '<code>-Template</code> מקבל שם או אובייקט של Template קיים, ומשתמש בו כבסיס ליצירת VM חדש - הדרך המהירה והעקבית ביותר לפרוס VMs.'
    },
    {
      code: '$ Get-VMHost "esxi06" | ___ -State Maintenance',
      q: 'מה משלים את הפקודה כדי להעביר Host למצב תחזוקה?',
      o: ['<code>Set-VMHost</code>', '<code>Enter-VMHost</code>', '<code>Start-Maintenance</code>', '<code>Set-Cluster</code>'],
      a: 0,
      w: '<code>Set-VMHost -State Maintenance</code> מכניס Host ל-Maintenance Mode. עם <code>-Evacuate</code> אפשר לוודא שגם VMs יפונו (רלוונטי אם DRS לא Fully Automated).'
    },
    {
      code: '$ Get-Cluster "Prod" | ___ -HAEnabled:$true -DrsEnabled:$true',
      q: 'מה משלים את הפקודה כדי להפעיל HA ו-DRS על קלאסטר קיים?',
      o: ['<code>Set-Cluster</code>', '<code>New-Cluster</code>', '<code>Enable-Cluster</code>', '<code>Update-Cluster</code>'],
      a: 0,
      w: '<code>Set-Cluster</code> משנה הגדרות של קלאסטר קיים, כולל הפעלת/כיבוי HA ו-DRS. ליצירת קלאסטר חדש משתמשים ב-<code>New-Cluster</code>.'
    },
    {
      code: '$ Get-VM -Name "db01" | ___ -MemoryGB 16 -NumCpu 4 -Confirm:$false',
      q: 'מה משלים את הפקודה כדי לשנות משאבי CPU/Memory של VM קיים?',
      o: ['<code>Set-VM</code>', '<code>Update-VM</code>', '<code>Resize-VM</code>', '<code>Edit-VM</code>'],
      a: 0,
      w: '<code>Set-VM</code> משמש לשינוי מגוון רחב של הגדרות VM קיים - כולל זיכרון, מספר vCPUs, שם ועוד.'
    },
    {
      code: '$ New-VMHostNetworkAdapter -VMHost esxi03 -VirtualSwitch $vSwitch -___ -IP 10.0.20.13 -SubnetMask 255.255.255.0',
      q: 'מה משלים את הפקודה כדי ליצור ממשק VMkernel (ולא Port Group רגיל ל-VMs)?',
      o: ['<code>-VMKernel</code>', '<code>-Standard</code>', '<code>-Physical</code>', '<code>-Uplink</code>'],
      a: 0,
      w: 'הדגל <code>-VMKernel</code> (יחד עם ציון ה-vSwitch) יוצר ממשק VMkernel חדש - זה סוג הממשק המשמש ל-vMotion, ניהול, iSCSI וכו׳, בשונה מ-Port Group רגיל של VMs.'
    },
    {
      code: '$ Get-VMHost "esxi02" | Get-VMHostNetworkAdapter -___',
      q: 'מה משלים את הפקודה כדי להציג רק ממשקי VMkernel (ולא NICs פיזיים)?',
      o: ['<code>VMKernel</code>', '<code>Physical</code>', '<code>Virtual</code>', '<code>Management</code>'],
      a: 0,
      w: 'הדגל <code>-VMKernel</code> מסנן להצגת רק ה-VMkernel Ports (vmk0, vmk1...) של ה-Host, בלי ה-Physical Uplinks.'
    },
    {
      code: '$ Set-PowerCLIConfiguration -InvalidCertificateAction ___ -Confirm:$false',
      q: 'מה משלים את הפקודה כדי לגרום ל-PowerCLI להתעלם מתעודות SSL לא-חתומות (מקובל בסביבת מעבדה בלבד)?',
      o: ['<code>Ignore</code>', '<code>Block</code>', '<code>Prompt</code>', '<code>Reject</code>'],
      a: 0,
      w: 'ברירת המחדל היא <code>Prompt</code> (שאלה בכל פעם). <code>Ignore</code> משתיק את האזהרה - נוח למעבדות עם Self-Signed Certificates, אך לא מומלץ בסביבת Production.'
    },
    {
      code: '$ Get-VIEvent -Start (Get-Date).AddHours(-2) -___ 100',
      q: 'מה משלים את הפקודה כדי להגביל את מספר האירועים המוחזרים ל-100?',
      o: ['<code>-MaxSamples</code>', '<code>-Limit</code>', '<code>-Top</code>', '<code>-Count</code>'],
      a: 0,
      w: '<code>Get-VIEvent</code> משמש לשליפת אירועים/לוגים מ-vCenter, ו-<code>-MaxSamples</code> קובע את המספר המרבי של רשומות שיוחזרו - שימושי כדי לא להציף את הפלט.'
    }
  ];

  /* ============================================================
     מצב 4 - התאמת מושגים: סבבים של זוגות מושג/פקודה + תיאור
     ============================================================ */
  var MATCH_ROUNDS = [
    {
      title: 'רכיבי ליבה',
      pairs: [
        { l: 'ESXi', r: 'Hypervisor מסוג Type 1 שמותקן ישירות על החומרה' },
        { l: 'vCenter Server', r: 'שכבת ניהול מרכזית למספר Hosts ו-Clusters' },
        { l: 'Datastore', r: 'מיקום אחסון (VMFS/NFS/vSAN) לקבצי VMs' },
        { l: 'Cluster', r: 'קבוצת ESXi Hosts המנוהלים יחד ומשתפים תכונות כמו HA/DRS' },
        { l: 'VMDK', r: 'קובץ שמייצג את הדיסק הוירטואלי של VM' }
      ]
    },
    {
      title: 'רשת (Networking)',
      pairs: [
        { l: 'vSwitch (vSS)', r: 'מתג וירטואלי המוגדר ומנוהל בנפרד בכל Host' },
        { l: 'Distributed Switch (vDS)', r: 'מתג וירטואלי מרכזי המנוהל מ-vCenter ומשותף בין Hosts' },
        { l: 'Port Group', r: 'הגדרת VLAN/מדיניות עבור קבוצת יציאות ברמת ה-Switch' },
        { l: 'VMkernel Adapter', r: 'ממשק המשמש את ה-Host עצמו (ניהול, vMotion, אחסון)' },
        { l: 'NIC Teaming', r: 'צירוף כמה כרטיסי רשת פיזיים יחד לזמינות ורוחב פס' }
      ]
    },
    {
      title: 'אחסון (Storage)',
      pairs: [
        { l: 'VMFS', r: 'מערכת קבצים קלאסטרית של VMware לאחסון בלוקים משותף' },
        { l: 'NFS Datastore', r: 'אחסון מבוסס קובץ המחובר דרך פרוטוקול NFS' },
        { l: 'vSAN', r: 'אחסון מבוזר Software-Defined המורכב מדיסקים מקומיים ב-Hosts' },
        { l: 'RDM', r: 'מיפוי ישיר של LUN פיזי ל-VM בלי לעבור דרך VMFS' },
        { l: 'Datastore Cluster', r: 'קיבוץ כמה Datastores יחד לאיזון עומס אוטומטי (Storage DRS)' }
      ]
    },
    {
      title: 'זמינות וביצועים (HA/DRS/vMotion)',
      pairs: [
        { l: 'vMotion', r: 'העברה חיה של VM רץ בין Hosts בלי Downtime' },
        { l: 'Storage vMotion', r: 'העברה חיה של קבצי VM בין Datastores' },
        { l: 'DRS', r: 'איזון אוטומטי של עומסים בין Hosts בקלאסטר' },
        { l: 'vSphere HA', r: 'הפעלה מחדש אוטומטית של VMs אחרי כשל Host' },
        { l: 'Admission Control', r: 'שמירת משאבים ברזרבה כדי להבטיח קיבולת התאוששות' }
      ]
    },
    {
      title: 'PowerCLI ואוטומציה',
      pairs: [
        { l: '<code>Connect-VIServer</code>', r: 'יצירת Session מול vCenter/ESXi מתוך PowerCLI' },
        { l: '<code>Get-VM</code>', r: 'שליפת אובייקטי VM לפי שם/תבנית/מיקום' },
        { l: '<code>New-Snapshot</code>', r: 'יצירת Snapshot חדש ל-VM' },
        { l: '<code>Move-VM</code>', r: 'ביצוע vMotion (או Storage vMotion) בסקריפט' },
        { l: '<code>Set-VM</code>', r: 'שינוי הגדרות VM קיים (זיכרון, CPU ועוד)' }
      ]
    }
  ];

  /* ============================================================
     מצב 5 - סידור תהליכים: סבבים של שלבים שצריך לסדר בסדר הנכון
     ============================================================ */
  var ORDER_ROUNDS = [
    {
      title: 'התקנת ESXi וחיבורו ל-vCenter מאפס',
      steps: [
        'התקנת ESXi על השרת הפיזי מתוך ISO/USB',
        'הגדרת רשת הניהול (Management Network) - IP, Subnet, DNS',
        'הגדרת סיסמת root וגישה ל-DCUI/Web Client',
        'חיבור ה-Host ל-vCenter Server (Add Host)',
        'יצירת/חיבור Datastore לאחסון VMs',
        'יצירת VM ראשון על ה-Host'
      ]
    },
    {
      title: 'הקמת Cluster עם HA ו-DRS מאפס',
      steps: [
        'יצירת Cluster חדש תחת Datacenter ב-vCenter',
        'הוספת ESXi Hosts קיימים לתוך ה-Cluster',
        'הגדרת רשת משותפת (vDS) ו-VMkernel ל-vMotion בין כל ה-Hosts',
        'הפעלת DRS וקביעת רמת האוטומציה (Automation Level)',
        'הפעלת HA והגדרת Admission Control',
        'בדיקת תקינות עם כיבוי VM או ניתוק Host מבוקר'
      ]
    },
    {
      title: 'ביצוע Live vMotion בין שני Hosts',
      steps: [
        'וידוא תאימות CPU/EVC בין ה-Hosts המקור והיעד',
        'וידוא שיש VMkernel ייעודי ל-vMotion בשני ה-Hosts באותו Subnet',
        'וידוא שה-VM ניגש ל-Datastore המשותף לשני ה-Hosts (או ביצוע Storage vMotion קודם)',
        'הרצת Move-VM עם בחירת ה-Host היעד',
        'מעקב אחר התקדמות ה-Migration עד לסיום',
        'אימות שה-VM רץ כעת על ה-Host החדש ללא הפרעה למשתמשים'
      ]
    },
    {
      title: 'טיפול נכון ב-Snapshot - מיצירה עד מחיקה',
      steps: [
        'תיעוד הסיבה ליצירת ה-Snapshot (למשל לפני עדכון/Patch)',
        'יצירת Snapshot עם שם ותיאור ברורים (New-Snapshot)',
        'ביצוע השינוי המתוכנן (עדכון, שינוי קונפיגורציה)',
        'בדיקה שהשינוי הצליח ושה-VM תקין',
        'מחיקת ה-Snapshot (Remove-Snapshot) כדי לאחד את ה-Delta Disk בחזרה',
        'מעקב שה-Consolidation הושלם בהצלחה בלי שגיאות'
      ]
    },
    {
      title: 'אבחון בעיית ביצועים ב-VM',
      steps: [
        'בדיקת ניצול CPU/Memory/Disk/Network של ה-VM ב-vCenter/PowerCLI',
        'השוואת הביצועים מול ה-Host שעליו ה-VM רץ (Contention/Ready Time)',
        'בדיקת Snapshots פעילים שעלולים להאט I/O',
        'בדיקת עומס כללי על ה-Datastore/Cluster (חוסר איזון DRS)',
        'יישום פתרון (vMotion לאיזון עומס, הסרת Snapshots, הגדלת משאבים)',
        'מעקב אחרי המדדים לאימות שהבעיה נפתרה'
      ]
    }
  ];

  /* ============================================================
     הגדרת מצבי המשחק
     ============================================================ */
  var MODES = [
    { key: 'rapid', icon: '⚡', name: 'קרב מהיר', desc: 'שאלות ידע כלליות על VMware vSphere - כמה תספיקו לפני שהזמן נגמר?', type: 'quiz', data: RAPID, sample: 8, time: 20000 },
    { key: 'status', icon: '🔎', name: 'ניחוש PowerCLI', desc: 'קטע קוד או תרחיש ב-vSphere - מה בדיוק קורה או מוצג?', type: 'quiz', data: STATUS_GUESS, sample: 8, time: 28000, showCode: true },
    { key: 'cmd', icon: '🧩', name: 'השלמת פקודה', desc: 'פקודת PowerCLI עם חלק חסר - בחרו מה משלים אותה נכון', type: 'quiz', data: CMD_COMPLETE, sample: 8, time: 28000, showCode: true },
    { key: 'match', icon: '🔗', name: 'התאמת מושגים', desc: 'התאימו כל מושג/פקודת VMware לתיאור הנכון שלו', type: 'match', data: MATCH_ROUNDS, sample: 2 },
    { key: 'order', icon: '📋', name: 'סידור תהליכים', desc: 'סדרו את שלבי התהליך לפי הסדר הנכון', type: 'order', data: ORDER_ROUNDS, sample: 2 }
  ];

  window.TG_CONFIG = { gameId: "vmware", modes: MODES };
})();
</script>

<script src="/scripts/topic-game.js"></script>
