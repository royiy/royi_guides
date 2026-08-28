---
title: "משחק לימודי: אתגר Azure"
category: Azure
part: 13/10
description: "משחק אינטראקטיבי ללימוד Azure - חמישה מצבי משחק עם טיימר, לבבות, ניקוד ורצפים: קרב מהיר, ניחוש פלט CLI/Bicep, השלמת פקודות, התאמת מושגים וסידור תהליכי פריסה."
---

חמישה מצבי משחק שבודקים היבטים שונים של Azure - Resource Groups, ARM/Bicep, VMs, רשתות, אחסון, Entra ID/RBAC, App Service ו-AKS. לא עוד חידון רב-ברירה, אלא משחק עם **טיימר**, **שלושה לבבות**, **מכפיל רצף** ו**שיא אישי** שנשמר בדפדפן. בסוף כל סבב תקבלו דירוג, ורשימת חזרה של בדיוק מה שפספסתם.


<div class="tg" id="tg" dir="rtl">
  <div class="tg-screen is-active" data-screen="menu">
    <div class="tg-hero">
      <div class="tg-hero-badge">Azure</div>
      <div class="tg-hero-title">אתגר Azure</div>
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
      q: 'מה זה Resource Group ב-Azure?',
      o: ['מכל לוגי שמאגד משאבי Azure הקשורים זה לזה, לניהול, פריסה וחיוב משותפים', 'שם נרדף ל-Subscription', 'קבוצת משתמשים ב-Entra ID', 'סוג של Virtual Network'],
      a: 0,
      w: 'Resource Group הוא יחידת הארגון הבסיסית ב-Azure - כל משאב (VM, Storage, VNet וכו׳) חייב להשתייך לבדיוק Resource Group אחד, שמאפשר ניהול מחזור חיים, הרשאות ותיוג משותפים.'
    },
    {
      q: 'מה זה ARM Template?',
      o: ['קובץ JSON המתאר משאבי Azure והגדרותיהם בצורה הצהרתית (Infrastructure as Code)', 'סקריפט PowerShell להתקנת אפליקציות', 'קובץ קונפיגורציה של VNet בלבד', 'כלי ניטור של Azure Monitor'],
      a: 0,
      w: 'Azure Resource Manager (ARM) Template הוא קובץ JSON הצהרתי - מתארים "מה" רוצים שיהיה קיים, ו-Azure דואג ל"איך". זהו הפורמט הבסיסי שעליו Bicep מתקמפל.'
    },
    {
      q: 'מה היחס בין Bicep ל-ARM Template?',
      o: ['Bicep הוא שפה הצהרתית תמציתית יותר שמתקמפלת ל-ARM JSON בזמן הפריסה', 'Bicep מחליף לגמרי את Azure Resource Manager', 'Bicep הוא כלי ניטור בלבד', 'אין קשר בין השניים'],
      a: 0,
      w: 'Bicep הוא DSL (Domain-Specific Language) שנוצר על ידי מיקרוסופט כתחליף קריא יותר ל-ARM JSON המסורבל. בזמן <code>az deployment group create</code> הוא מתורגם (transpiled) אוטומטית ל-ARM JSON.'
    },
    {
      q: 'איזו משפחת VM Sizes מיועדת לעומסים לא-רציפים (Burstable) כמו סביבות Dev/Test?',
      o: ['B-series', 'D-series', 'E-series', 'N-series'],
      a: 0,
      w: 'B-series (Burstable) צוברות "קרדיט CPU" בזמן שקט ומאפשרות התפרצות ביצועים בזמן עומס - זולות ומתאימות לעומסים לא-קבועים. D-series היא General Purpose, E-series ל-Memory Optimized, ו-N-series ל-GPU.'
    },
    {
      q: 'מה זה Virtual Network (VNet) ב-Azure?',
      o: ['רשת פרטית מבודדת לוגית בענן Azure, שבה ניתן להריץ משאבים ולשלוט בתעבורה', 'שירות DNS גלובלי', 'סוג של Load Balancer', 'קבוצת הרשאות RBAC'],
      a: 0,
      w: 'VNet הוא היסוד לרשת בענן Azure - מאפשר לחלק לרשתות משנה (Subnets), להגדיר טווחי כתובות IP פרטיים, ולשלוט בתעבורה נכנסת/יוצאת בעזרת NSG ו-Route Tables.'
    },
    {
      q: 'מה תפקיד ה-Subnet בתוך VNet?',
      o: ['חלוקה לוגית של טווח הכתובות של ה-VNet לתת-רשתות נפרדות, כל אחת עם מדיניות משלה', 'הצפנת תעבורה בין VNets', 'ניהול משתמשים ב-Entra ID', 'שירות גיבוי אוטומטי'],
      a: 0,
      w: 'Subnet מאפשר לפצל VNet לאזורים נפרדים (למשל web-subnet, db-subnet), כל אחד עם NSG, Route Table ותפקיד משלו - שיטה נפוצה להפרדת שכבות (Tiers) של אפליקציה.'
    },
    {
      q: 'מה עושה NSG (Network Security Group)?',
      o: ['מסנן תעבורה נכנסת/יוצאת לפי כללי Allow/Deny, ברמת Subnet או NIC', 'מנהל הרשאות RBAC למשתמשים', 'מבצע איזון עומסים בין VMs', 'מצפין דיסקים מנוהלים'],
      a: 0,
      w: 'NSG הוא Firewall ברמת רשת - אוסף כללים ממוינים לפי Priority, שכל אחד מגדיר Source/Destination/Port/Protocol ופעולת Allow או Deny. ניתן לשייך אותו ל-Subnet ו/או ל-NIC בו-זמנית.'
    },
    {
      q: 'מהן שכבות הגישה (Access Tiers) הנפוצות ב-Blob Storage?',
      o: ['Hot, Cool, Archive - לפי תדירות הגישה הצפויה לנתונים', 'Basic, Standard, Premium בלבד', 'Public, Private, Shared', 'Read, Write, Admin'],
      a: 0,
      w: 'Hot מתאים לנתונים בגישה תכופה (עלות אחסון גבוהה, עלות גישה נמוכה), Cool לנתונים בגישה נדירה (30+ יום), ו-Archive לארכוב ארוך-טווח בעלות אחסון מינימלית אך עם זמן שחזור של שעות.'
    },
    {
      q: 'מה זה Microsoft Entra ID (לשעבר Azure AD)?',
      o: ['שירות ניהול זהויות והרשאות (IAM) בענן, המטפל באימות והרשאה של משתמשים ואפליקציות', 'שירות Windows Server Active Directory מקומי', 'כלי לניהול Resource Groups', 'שירות גיבוי VMs'],
      a: 0,
      w: 'Entra ID הוא רכיב הליבה של אימות (Authentication) והרשאה (Authorization) ב-Azure - מבוסס פרוטוקולים מודרניים כמו OAuth 2.0 ו-OpenID Connect, בשונה מ-AD DS המסורתי המקומי.'
    },
    {
      q: 'מה סדר ה-Scope ב-Azure RBAC, מהרחב לצר ביותר?',
      o: ['Management Group → Subscription → Resource Group → Resource', 'Resource → Resource Group → Subscription → Management Group', 'Subscription → Management Group → Resource → Resource Group', 'Tenant → Resource → Resource Group'],
      a: 0,
      w: 'הרשאה שמוקצית ב-Scope רחב (למשל Subscription) יורשת אוטומטית לכל מה שמתחתיו. עדיף להקצות הרשאות ב-Scope הצר ביותר האפשרי (עקרון Least Privilege).'
    },
    {
      q: 'מה ההבדל בין תפקיד Contributor לתפקיד Owner ב-Azure RBAC?',
      o: ['Contributor יכול ליצור/לערוך/למחוק משאבים אך לא לנהל הרשאות RBAC; Owner יכול גם את זה', 'אין הבדל בין השניים', 'Owner יכול רק לצפות במשאבים', 'Contributor הוא תפקיד ברמת Tenant בלבד'],
      a: 0,
      w: 'זהו אחד ההבדלים החשובים ביותר בתפקידים המובנים: Contributor מקבל שליטה מלאה על ניהול משאבים, אבל לא יכול להעניק או לשלול הרשאות לאחרים - זו סמכות ייחודית ל-Owner (או ל-User Access Administrator).'
    },
    {
      q: 'מה זה Managed Identity ב-Azure?',
      o: ['זהות שמנוהלת אוטומטית על ידי Azure עבור משאב (כמו VM או App Service), ללא צורך לנהל credentials ידנית', 'שם משתמש קבוע שכל המפתחים חולקים', 'סוג של Resource Group', 'כלי לניהול תגיות (Tags)'],
      a: 0,
      w: 'Managed Identity פותרת את הבעיה של אחסון סודות (credentials) בקוד או בקונפיגורציה - המשאב מקבל זהות ב-Entra ID שמנוהלת ומתחדשת אוטומטית על ידי Azure, ומשמשת לאימות מול שירותים אחרים.'
    },
    {
      q: 'מה זה Azure App Service?',
      o: ['שירות PaaS מנוהל להרצת אפליקציות ווב, ללא צורך לנהל שרתים או מערכת הפעלה', 'שירות IaaS להרצת VMs בלבד', 'שירות ניהול DNS', 'כלי לניטור לוגים בלבד'],
      a: 0,
      w: 'App Service מנהל עבורכם את שכבת התשתית, המדרגיות (Scaling) והתשתית הבסיסית - אתם מתמקדים רק בפריסת הקוד (.NET, Node.js, Python, Java, PHP ועוד).'
    },
    {
      q: 'מה מייחד את Azure Functions כמודל Serverless?',
      o: ['תשלום לפי זמן ריצה בפועל (Consumption Plan), עם התאמת קיבולת אוטומטית ואפס תחזוקת שרתים', 'צריך להקצות VM ייעודי לכל פונקציה', 'רץ רק בתוך AKS', 'דורש ניהול ידני של Load Balancer'],
      a: 0,
      w: 'ב-Consumption Plan אתם משלמים רק על זמן הריצה בפועל ומספר ההפעלות - כשאין תעבורה, אין עלות (ואף אין מופע רץ). זהו ההבדל המרכזי מ-App Service הרגיל, שדורש Plan קבוע.'
    },
    {
      q: 'מה ה-Control Plane של AKS ומי מנהל אותו?',
      o: ['API Server, etcd, Scheduler ו-Controller Manager - מנוהל על ידי Azure ולרוב ללא עלות', 'ה-Worker Nodes שהלקוח מנהל בעצמו', 'שירות נפרד שנקרא Azure Container Instances', 'רכיב שרץ רק בתוך ה-VNet של הלקוח'],
      a: 0,
      w: 'ב-AKS, Azure מנהלת את כל רכיבי ה-Control Plane (זמינות, שדרוגים, אבטחה) - הלקוח אחראי רק על ה-Node Pools (ה-VMs שמריצים את ה-Pods בפועל) ומשלם רק עליהם.'
    },
    {
      q: 'מה זה Storage Redundancy מסוג GRS (Geo-Redundant Storage)?',
      o: ['שכפול הנתונים גם באזור (Region) משני מרוחק גיאוגרפית, להגנה מפני כשל אזורי שלם', 'שכפול בתוך אותו Data Center בלבד', 'גיבוי ידני חד-פעמי', 'הצפנה נוספת של הנתונים'],
      a: 0,
      w: 'GRS משכפל את הנתונים לאזור מזווג מרוחק (Paired Region), כך שגם אם אזור שלם נופל, הנתונים עדיין קיימים. זאת לעומת LRS (שכפול מקומי בלבד) ו-ZRS (שכפול בין אזורי זמינות באותו Region).'
    }
  ];

  /* ============================================================
     מצב 2 - ניחוש פלט: קטע Bicep/ARM/CLI + מה קורה בפועל
     ============================================================ */
  var CODE_GUESS = [
    {
      code: '$ az group create --name rg-demo --location westeurope',
      q: 'מה תוצאת הפקודה הזו?',
      o: ['נוצר Resource Group חדש בשם rg-demo באזור westeurope, ריק ממשאבים', 'נוצר VM חדש', 'נוצר Subscription חדש', 'הפקודה נכשלת כי חסר --sku'],
      a: 0,
      w: '<code>az group create</code> יוצרת מכל לוגי ריק (Resource Group) - שלב מקדים כמעט לכל פריסה, מכיוון שכל משאב חייב להשתייך ל-Resource Group.'
    },
    {
      code: 'resource storageAcc \'Microsoft.Storage/storageAccounts@2023-01-01\' = {\n  name: \'stdemoacct001\'\n  location: resourceGroup().location\n  sku: { name: \'Standard_LRS\' }\n  kind: \'StorageV2\'\n}',
      q: 'מה עושה בלוק ה-Bicep הזה בזמן פריסה?',
      o: ['יוצר Storage Account חדש עם שכפול מקומי (LRS) באותו Region של ה-Resource Group', 'מוחק Storage Account קיים', 'יוצר Virtual Network', 'רק מציג תצוגה מקדימה בלי ליצור דבר'],
      a: 0,
      w: '<code>resourceGroup().location</code> שואב את ה-location מה-Resource Group שאליו מפרסים, כך שלא צריך לקבע אותו ידנית. <code>Standard_LRS</code> הוא שכפול מקומי בלבד (זול ביותר, בלי הגנה גיאוגרפית).'
    },
    {
      code: '$ az vm create \\\n  --resource-group rg-web \\\n  --name vm-web01 \\\n  --image Ubuntu2204 \\\n  --size Standard_B1s \\\n  --generate-ssh-keys',
      q: 'מה קורה עם צמד המפתחות (SSH keys) בפקודה הזו?',
      a: 0,
      o: ['אם אין כבר מפתחות SSH מקומיים, Azure CLI ייצר זוג חדש ויציב את הציבורי על ה-VM', 'הפקודה תיכשל כי חסרה סיסמה', 'ייווצר משתמש עם סיסמה בלבד, ללא SSH', 'המפתחות נוצרים אך לא משויכים ל-VM'],
      w: '<code>--generate-ssh-keys</code> חוסך שלב ידני - אם אין כבר מפתח ב-<code>~/.ssh</code>, ה-CLI יוצר זוג RSA חדש ומשייך את המפתח הציבורי ל-VM אוטומטית לצורך אימות SSH.'
    },
    {
      code: '$ az network nsg rule create \\\n  --resource-group rg-web \\\n  --nsg-name nsg-web \\\n  --name allow-ssh \\\n  --priority 100 \\\n  --access Allow \\\n  --protocol Tcp \\\n  --destination-port-ranges 22',
      q: 'קיים גם כלל <code>deny-all-inbound</code> עם Priority 4096 באותו NSG. איזה כלל "ינצח" עבור תעבורת SSH נכנסת?',
      o: ['allow-ssh (Priority 100) - Priority נמוך יותר נבדק ומיושם ראשון', 'deny-all-inbound - כי כללי Deny תמיד קודמים', 'שני הכללים יתנגשו ותתקבל שגיאה', 'תלוי בסדר היצירה בזמן, לא ב-Priority'],
      a: 0,
      w: 'ב-NSG, Priority נמוך יותר = עדיפות גבוהה יותר (נבדק ראשון). ברגע שכלל תואם נמצא, העיבוד נעצר - לכן allow-ssh עם 100 חוסם את deny-all עם 4096.'
    },
    {
      code: '$ az storage account create \\\n  --name stdemoacct001 \\\n  --resource-group rg-demo \\\n  --sku Standard_ZRS \\\n  --kind StorageV2',
      q: 'מה מבטיח SKU מסוג Standard_ZRS?',
      o: ['שכפול סינכרוני בין 3 אזורי זמינות (Availability Zones) שונים באותו Region', 'שכפול לאזור גיאוגרפי מרוחק', 'הצפנת נתונים ברמת קובץ', 'ביצועי SSD ברמת Premium'],
      a: 0,
      w: 'ZRS (Zone-Redundant Storage) מגן מפני כשל של Availability Zone שלם בתוך אותו Region - שונה מ-GRS שמגן מפני כשל Region שלם, ומ-LRS שמגן רק מפני כשל דיסק/שרת בודד.'
    },
    {
      code: '$ az role assignment create \\\n  --assignee dana@company.com \\\n  --role "Reader" \\\n  --scope /subscriptions/xxx/resourceGroups/rg-prod',
      q: 'איזו גישה תקבל דנה אחרי ריצת הפקודה?',
      o: ['צפייה בלבד בכל המשאבים בתוך rg-prod, ללא יכולת לשנות דבר', 'שליטה מלאה כולל מחיקה בכל ה-Subscription', 'גישה רק למשאב בודד שתציין בנפרד', 'הרשאה לנהל הקצאות RBAC נוספות'],
      a: 0,
      w: 'תפקיד Reader מוקצה כאן ב-Scope של Resource Group ספציפי (rg-prod) - דנה תוכל לצפות במשאבים בתוכו בלבד, בלי יכולת עריכה ובלי גישה ל-Resource Groups אחרים.'
    },
    {
      code: 'param location string = resourceGroup().location\nparam skuName string = \'B1\'\n\nresource plan \'Microsoft.Web/serverfarms@2022-09-01\' = {\n  name: \'plan-web-demo\'\n  location: location\n  sku: { name: skuName }\n}',
      q: 'אם מפרסים את קובץ ה-Bicep הזה בלי לספק ערך ל-skuName, מה יקרה?',
      o: ['הפריסה תשתמש בערך ברירת המחדל B1 שהוגדר ב-param', 'הפריסה תיכשל כי הפרמטר חובה', 'ייווצר App Service Plan ללא SKU', 'ייווצר שני Plans - אחד עם ברירת מחדל ואחד ריק'],
      a: 0,
      w: 'כשלפרמטר ב-Bicep יש ערך ברירת מחדל (<code>= \'B1\'</code>), הוא הופך לאופציונלי - אם לא מסופק ערך אחר בזמן הפריסה, Azure ישתמש בערך שהוגדר.'
    },
    {
      code: '$ az webapp deployment slot swap \\\n  --resource-group rg-web \\\n  --name app-demo \\\n  --slot staging \\\n  --target-slot production',
      q: 'מה קורה בפועל בפעולת Swap בין Deployment Slots?',
      o: ['תוכן ה-staging וה-production מתחלפים באופן כמעט מיידי, ללא downtime', 'הקוד ב-staging נמחק ומועתק ל-production', 'production יורד לתחזוקה למשך כמה דקות', 'רק ה-URL מוחלף, הקוד נשאר באותו slot'],
      a: 0,
      w: 'Swap הוא מנגנון Blue-Green Deployment מובנה של App Service - הוא מחליף את הקונטיינרים/הגדרות בין ה-slots (כולל warm-up), כך שהמעבר לגרסה חדשה כמעט ללא זמן השבתה, וניתן לבטל (swap back) בקלות.'
    },
    {
      code: '$ az aks scale \\\n  --resource-group rg-aks \\\n  --name aks-demo \\\n  --node-count 5 \\\n  --nodepool-name userpool',
      q: 'מה משתנה בקלאסטר AKS אחרי הרצת הפקודה?',
      o: ['מספר ה-Nodes (VMs) ב-node pool בשם userpool משתנה ל-5', 'מספר ה-Pods בקלאסטר משתנה ל-5', 'גרסת Kubernetes של הקלאסטר מתעדכנת', 'נוצר node pool חדש בשם userpool'],
      a: 0,
      w: '<code>az aks scale</code> משנה ידנית את כמות ה-Worker Nodes בתוך node pool קיים וספציפי - שונה מ-Horizontal Pod Autoscaler שמתאים את מספר ה-Pods בתוך ה-Nodes הקיימים.'
    },
    {
      code: 'output storageEndpoint string = storageAcc.properties.primaryEndpoints.blob',
      q: 'מה תפקיד ה-output הזה בקובץ Bicep?',
      o: ['חושף ערך (כתובת ה-Blob endpoint) שניתן להשתמש בו לאחר הפריסה, למשל בסקריפט CI/CD', 'יוצר Storage Account נוסף', 'מגדיר פרמטר קלט חובה', 'מוחק את המשאב storageAcc בסיום'],
      a: 0,
      w: 'בלוקי <code>output</code> ב-Bicep מחזירים ערכים החוצה בסיום הפריסה - שימושי כדי להעביר מידע (URLs, IDs, connection strings) לשלב הבא בצינור ה-CI/CD בלי לחפש אותו ידנית בפורטל.'
    },
    {
      code: '$ az deployment group create \\\n  --resource-group rg-demo \\\n  --template-file main.bicep \\\n  --parameters environment=prod',
      q: 'מה קורה אם main.bicep מכיל משאב עם שם זהה למשאב שכבר קיים ב-rg-demo?',
      o: ['ARM מבצע Incremental Deployment כברירת מחדל - המשאב הקיים מתעדכן לפי ההגדרה החדשה, בלי למחוק משאבים אחרים', 'הפריסה נכשלת אוטומטית בגלל התנגשות שמות', 'המשאב הישן נמחק ונוצר חדש עם ID אחר', 'כל שאר המשאבים ב-Resource Group נמחקים'],
      a: 0,
      w: 'מצב ברירת המחדל של פריסות ARM/Bicep הוא Incremental - משאבים שמוגדרים בקובץ מתעדכנים או נוצרים, ומשאבים קיימים שלא מוזכרים בקובץ נשארים כמות שהם (בניגוד למצב Complete שמוחק מה שלא מוגדר).'
    },
    {
      code: '$ az functionapp create \\\n  --resource-group rg-func \\\n  --name func-demo-001 \\\n  --consumption-plan-location westeurope \\\n  --runtime node \\\n  --storage-account stdemofunc',
      q: 'מדוע פקודה זו דורשת גם Storage Account קיים?',
      o: ['Azure Functions משתמש ב-Storage Account פנימי לניהול טריגרים, לוגים ומצב ריצה (state)', 'ה-Storage Account הוא רק מקום לאחסן קוד המקור', 'זו דרישה שרירותית שאין לה שימוש בפועל', 'ה-Storage Account מחליף את ה-Consumption Plan'],
      a: 0,
      w: 'לכל Function App נדרש Storage Account שאיתו הוא עובד מאחורי הקלעים - לניהול Triggers (כמו Timer/Queue), נעילות (locks) בזמן Scale-out, ולוגים תפעוליים.'
    },
    {
      code: 'resource nsgRule \'Microsoft.Network/networkSecurityGroups/securityRules@2023-05-01\' = {\n  name: \'deny-rdp\'\n  parent: nsg\n  properties: {\n    priority: 200\n    access: \'Deny\'\n    direction: \'Inbound\'\n    protocol: \'Tcp\'\n    destinationPortRange: \'3389\'\n    sourceAddressPrefix: \'*\'\n    destinationAddressPrefix: \'*\'\n  }\n}',
      q: 'מה משיג הכלל הזה בפועל?',
      o: ['חוסם כל תעבורת RDP (פורט 3389) נכנסת מכל מקור, ל-Subnet/NIC שאליו ה-NSG משויך', 'פותח גישת RDP חופשית לכולם', 'חוסם רק תעבורת SSH', 'משפיע רק על תעבורה יוצאת (Outbound)'],
      a: 0,
      w: '<code>direction: \'Inbound\'</code> + <code>access: \'Deny\'</code> על פורט 3389 (RDP) עם <code>sourceAddressPrefix: \'*\'</code> חוסם כל ניסיון חיבור RDP נכנס מכל כתובת - נהוג להוסיף מעליו כלל Allow ספציפי ל-IP מהימן בלבד, ב-Priority נמוך יותר.'
    }
  ];

  /* ============================================================
     מצב 3 - השלמת פקודה: az CLI / Bicep עם חלק חסר
     ============================================================ */
  var CMD_COMPLETE = [
    {
      code: '$ az group create --name rg-demo --___ westeurope',
      q: 'מה משלים את הפקודה כדי לציין את האזור (Region) של ה-Resource Group?',
      o: ['<code>location</code>', '<code>region</code>', '<code>zone</code>', '<code>place</code>'],
      a: 0,
      w: '<code>--location</code> (או <code>-l</code>) מציין את האזור שבו יישמר ה-Metadata של ה-Resource Group - שים לב שזה לא בהכרח קובע היכן ייווצרו כל המשאבים בתוכו.'
    },
    {
      code: '$ az vm create --resource-group rg-web --name vm01 --image Ubuntu2204 --___ Standard_D2s_v5',
      q: 'מה משלים את הפקודה כדי לקבוע את גודל החומרה של ה-VM?',
      o: ['<code>--size</code>', '<code>--sku</code>', '<code>--type</code>', '<code>--vm-size</code>'],
      a: 0,
      w: 'הדגל הנכון ב-<code>az vm create</code> הוא <code>--size</code> (למשל <code>Standard_D2s_v5</code>). שים לב שב-<code>az storage account create</code> הדגל המקביל נקרא <code>--sku</code>.'
    },
    {
      code: '$ az network vnet subnet create \\\n  --resource-group rg-net \\\n  --vnet-name vnet-main \\\n  --name subnet-web \\\n  --___ 10.0.1.0/24',
      q: 'מה משלים את הפקודה כדי להגדיר את טווח הכתובות של ה-Subnet?',
      o: ['<code>--address-prefixes</code>', '<code>--cidr</code>', '<code>--ip-range</code>', '<code>--subnet-mask</code>'],
      a: 0,
      w: '<code>--address-prefixes</code> מקבל את טווח ה-CIDR של ה-Subnet - הוא חייב להיות תת-קבוצה של טווח הכתובות של ה-VNet ההורה, ולא לחפוף ל-Subnets אחרים.'
    },
    {
      code: '$ az network nsg rule create \\\n  --resource-group rg-net \\\n  --nsg-name nsg-web \\\n  --name allow-https \\\n  --___ 110 \\\n  --access Allow \\\n  --destination-port-ranges 443',
      q: 'מה משלים את הפקודה כדי לקבוע את סדר העדיפות של הכלל?',
      o: ['<code>--priority</code>', '<code>--order</code>', '<code>--rank</code>', '<code>--index</code>'],
      a: 0,
      w: '<code>--priority</code> מקבל ערך בין 100 ל-4096 - ככל שהמספר נמוך יותר, הכלל נבדק קודם. חשוב לתכנן מרווחים (100, 110, 120...) כדי להשאיר מקום להוספת כללים בעתיד.'
    },
    {
      code: '$ az storage account create \\\n  --name stdemoacct \\\n  --resource-group rg-demo \\\n  --___ Standard_GRS',
      q: 'מה משלים את הפקודה כדי לקבוע את סוג השכפול (Redundancy) של ה-Storage Account?',
      o: ['<code>--sku</code>', '<code>--tier</code>', '<code>--replication</code>', '<code>--redundancy</code>'],
      a: 0,
      w: 'ב-<code>az storage account create</code>, סוג השכפול נקבע דרך <code>--sku</code> (למשל <code>Standard_LRS</code>, <code>Standard_GRS</code>, <code>Standard_ZRS</code>, <code>Premium_LRS</code>).'
    },
    {
      code: '$ az role assignment create \\\n  --assignee dana@company.com \\\n  --role "Contributor" \\\n  --___ /subscriptions/xxx/resourceGroups/rg-prod',
      q: 'מה משלים את הפקודה כדי לקבוע את הגבול (Scope) שעליו חל התפקיד?',
      o: ['<code>--scope</code>', '<code>--target</code>', '<code>--boundary</code>', '<code>--resource</code>'],
      a: 0,
      w: '<code>--scope</code> מקבל את ה-Resource ID המלא (Management Group / Subscription / Resource Group / Resource בודד) שעליו תחול ההרשאה - ללא Scope ההקצאה תיפול על כל ה-Subscription.'
    },
    {
      code: '$ az webapp create \\\n  --resource-group rg-web \\\n  --plan plan-web \\\n  --name app-demo \\\n  --___ "NODE:18-lts"',
      q: 'מה משלים את הפקודה כדי לקבוע את סביבת הריצה (Runtime Stack) של ה-Web App?',
      o: ['<code>--runtime</code>', '<code>--stack</code>', '<code>--language</code>', '<code>--framework</code>'],
      a: 0,
      w: '<code>--runtime</code> קובע את מחסנית הטכנולוגיה שבה App Service ירוץ (Node, .NET, Python, Java וכו׳), בכפוף למה שה-App Service Plan (OS ו-Tier) תומך בו.'
    },
    {
      code: '$ az functionapp create \\\n  --resource-group rg-func \\\n  --name func-demo \\\n  --___ westeurope \\\n  --runtime python \\\n  --storage-account stdemofunc',
      q: 'מה משלים את הפקודה כדי ליצור Function App במודל תשלום-לפי-שימוש (Consumption)?',
      o: ['<code>--consumption-plan-location</code>', '<code>--serverless-location</code>', '<code>--plan-location</code>', '<code>--location</code> בלבד'],
      a: 0,
      w: '<code>--consumption-plan-location</code> יוצר Function App במודל Consumption (Serverless אמיתי, ללא עלות בזמן חוסר תעבורה). לעומת זאת, <code>--plan</code> יקשר לתוכנית Premium/App Service קיימת עם עלות קבועה.'
    },
    {
      code: '$ az aks create \\\n  --resource-group rg-aks \\\n  --name aks-demo \\\n  --node-count 3 \\\n  --___',
      q: 'מה משלים את הפקודה כדי שהקלאסטר ישתמש בזהות מנוהלת לגישה למשאבי Azure, במקום Service Principal ידני?',
      o: ['<code>--enable-managed-identity</code>', '<code>--use-identity</code>', '<code>--service-principal auto</code>', '<code>--identity-type</code>'],
      a: 0,
      w: '<code>--enable-managed-identity</code> (ברירת המחדל בגרסאות עדכניות) חוסך את הצורך ליצור ולסובב Service Principal ידני - AKS מקבל זהות ב-Entra ID שמתחדשת אוטומטית לגישה למשאבים כמו ACR ו-Load Balancer.'
    },
    {
      code: '$ az aks get-credentials \\\n  --resource-group rg-aks \\\n  --name aks-demo \\\n  --___',
      q: 'מה משלים את הפקודה כדי לשלב את פרטי ההתחברות לקלאסטר לתוך קובץ ה-kubeconfig הקיים, בלי לדרוס אותו?',
      o: ['ברירת המחדל כבר עושה merge לתוך <code>~/.kube/config</code>; אין צורך בדגל נוסף', '<code>--overwrite</code>', '<code>--merge</code>', '<code>--append-only</code>'],
      a: 0,
      w: '<code>az aks get-credentials</code> ממזג (merge) את הקונטקסט החדש לתוך <code>~/.kube/config</code> הקיים כברירת מחדל, ומאפשר לעבור בין קלאסטרים עם <code>kubectl config use-context</code>. הדגל <code>--overwrite-existing</code> קיים רק כדי לדרוס קונטקסט בשם זהה שכבר קיים.'
    },
    {
      code: 'param ___ string\nparam skuName string = \'B1\'',
      q: 'מה משלים את השורה הראשונה כדי להגדיר פרמטר קלט בשם location מסוג מחרוזת, ללא ערך ברירת מחדל (חובה בזמן הפריסה)?',
      o: ['<code>location</code>', '<code>location = \'\'</code>', '<code>var location</code>', '<code>output location</code>'],
      a: 0,
      w: 'התחביר הבסיסי הוא <code>param &lt;name&gt; &lt;type&gt;</code>. בלי סימן <code>=</code> וערך ברירת מחדל, הפרמטר הופך לחובה - חייבים לספק ערך בזמן <code>az deployment group create --parameters</code>.'
    },
    {
      code: '$ az deployment group create \\\n  --resource-group rg-demo \\\n  --___ main.bicep \\\n  --parameters environment=prod',
      q: 'מה משלים את הפקודה כדי לציין את קובץ ה-Bicep שיש לפרוס?',
      o: ['<code>--template-file</code>', '<code>--bicep-file</code>', '<code>--source</code>', '<code>--file</code>'],
      a: 0,
      w: '<code>--template-file</code> מקבל נתיב לקובץ <code>.bicep</code> (או <code>.json</code> עבור ARM). ה-CLI מזהה את הסיומת ומתרגם Bicep ל-ARM JSON אוטומטית לפני שליחת הבקשה ל-Resource Manager.'
    },
    {
      code: '$ az deployment group create \\\n  --resource-group rg-demo \\\n  --template-file main.bicep \\\n  --___',
      q: 'מה משלים את הפקודה כדי להריץ תצוגה מקדימה (Preview) של מה שישתנה, בלי לבצע את הפריסה בפועל?',
      o: ['<code>what-if</code>', '<code>--dry-run</code>', '<code>--preview</code>', '<code>--validate-only</code>'],
      a: 0,
      w: '<code>az deployment group what-if</code> (או הדגל <code>--confirm-with-what-if</code>) מציג בדיוק אילו משאבים ייווצרו, ישתנו או יימחקו - שלב מומלץ לפני פריסה לסביבת Production, במיוחד תחת פריסה מסוג Complete.'
    }
  ];

  /* ============================================================
     מצב 4 - התאמת מושגים: סבבים של זוגות מושג/שירות + תיאור
     ============================================================ */
  var MATCH_ROUNDS = [
    {
      title: 'יסודות ופריסה (IaC)',
      pairs: [
        { l: '<code>Resource Group</code>', r: 'מכל לוגי שמאגד משאבי Azure לניהול, פריסה וחיוב משותפים' },
        { l: '<code>Subscription</code>', r: 'גבול חיוב וגבול הרשאות ברמה הגבוהה, מכיל Resource Groups רבים' },
        { l: 'ARM Template', r: 'קובץ JSON הצהרתי המתאר משאבי Azure (Infrastructure as Code)' },
        { l: 'Bicep', r: 'שפה תמציתית שמתקמפלת ל-ARM JSON בזמן הפריסה' },
        { l: 'Tag', r: 'זוג מפתח-ערך שמסומן על משאב, לצורך סיווג, חיפוש וניתוח עלויות' }
      ]
    },
    {
      title: 'רשת (Networking)',
      pairs: [
        { l: 'Virtual Network (VNet)', r: 'רשת פרטית מבודדת לוגית בענן Azure' },
        { l: 'Subnet', r: 'חלוקה לוגית של VNet לתת-רשת עם מדיניות משלה' },
        { l: 'NSG', r: 'Firewall ברמת רשת עם כללי Allow/Deny לפי Priority' },
        { l: 'Public IP', r: 'כתובת IP נגישה מהאינטרנט, המשויכת למשאב ספציפי' },
        { l: 'Load Balancer', r: 'מפזר תעבורת רשת בין מספר instances לזמינות ומדרגיות' }
      ]
    },
    {
      title: 'חישוב וזהויות',
      pairs: [
        { l: 'Virtual Machine (VM)', r: 'שירות IaaS המספק מכונה וירטואלית עם שליטה מלאה על ה-OS' },
        { l: 'App Service', r: 'שירות PaaS להרצת אפליקציות ווב ללא ניהול שרתים' },
        { l: 'AKS', r: 'שירות Kubernetes מנוהל, עם Control Plane בניהול Azure' },
        { l: 'Managed Identity', r: 'זהות שמנוהלת אוטומטית על ידי Azure עבור משאב, ללא credentials ידניים' },
        { l: 'Service Principal', r: 'זהות ייעודית לאפליקציה/סקריפט לאימות מול Azure, מנוהלת ידנית' }
      ]
    },
    {
      title: 'אחסון וניטור',
      pairs: [
        { l: 'Storage Account', r: 'שירות אחסון מרכזי התומך ב-Blob, File, Queue ו-Table' },
        { l: 'Hot Tier', r: 'שכבת גישה לנתונים הנדרשים בתדירות גבוהה' },
        { l: 'GRS', r: 'שכפול נתונים לאזור גיאוגרפי מרוחק, להגנה מפני כשל אזורי שלם' },
        { l: 'Azure Monitor', r: 'שירות מרכזי לאיסוף מטריקות, לוגים והתראות על משאבי Azure' },
        { l: 'Log Analytics Workspace', r: 'מאגר בו נשמרים ונשאלים לוגים שנאספו על ידי Azure Monitor' }
      ]
    }
  ];

  /* ============================================================
     מצב 5 - סידור תהליך: סבבים של שלבים לסידור בסדר הנכון
     ============================================================ */
  var ORDER_ROUNDS = [
    {
      title: 'פריסת VM מאפס עד חיבור מוצלח',
      steps: [
        'יצירת Resource Group באמצעות az group create',
        'יצירת VNet ו-Subnet לחיבור ה-VM',
        'הגדרת NSG עם כלל Allow לפורט הנדרש (למשל SSH/RDP)',
        'יצירת ה-VM עם az vm create ושיוכו ל-Subnet וה-NSG',
        'התחברות ל-VM דרך ה-Public IP שהתקבל'
      ]
    },
    {
      title: 'פריסת Web App עם App Service',
      steps: [
        'יצירת Resource Group ל-Web App',
        'יצירת App Service Plan עם az appservice plan create',
        'יצירת ה-Web App עצמו עם az webapp create ושיוכו ל-Plan',
        'הגדרת מקור הפריסה (GitHub Actions / Local Git / Container)',
        'פריסת הקוד לאפליקציה',
        'בדיקת האפליקציה בכתובת ה-URL הציבורית שנוצרה אוטומטית'
      ]
    },
    {
      title: 'הקמת קלאסטר AKS ופריסת אפליקציה',
      steps: [
        'יצירת Resource Group וקלאסטר AKS עם Managed Identity',
        'יצירת ACR (Azure Container Registry) ושיוכו לקלאסטר עם az aks update --attach-acr',
        'שליפת פרטי התחברות עם az aks get-credentials',
        'בניית ה-Image ודחיפתו ל-ACR',
        'הרצת kubectl apply עם קובצי ה-Manifest של האפליקציה',
        'בדיקת סטטוס ה-Pods עם kubectl get pods'
      ]
    },
    {
      title: 'הענקת הרשאת RBAC למשתמש על משאב ספציפי',
      steps: [
        'זיהוי ה-Security Principal שצריך לקבל גישה (משתמש/קבוצה/Service Principal)',
        'קביעת ה-Scope המדויק שאליו תוגבל ההרשאה (Resource Group או משאב בודד)',
        'בחירת התפקיד (Role) המתאים ביותר לפי עקרון Least Privilege',
        'הרצת az role assignment create עם assignee, role ו-scope',
        'אימות ההקצאה באמצעות az role assignment list'
      ]
    }
  ];

  /* ============================================================
     הגדרת מצבי המשחק
     ============================================================ */
  var MODES = [
    { key: 'rapid', icon: '⚡', name: 'קרב מהיר', desc: 'שאלות ידע כלליות על Azure - כמה תספיקו לפני שהזמן נגמר?', type: 'quiz', data: RAPID, sample: 8, time: 20000 },
    { key: 'code', icon: '🔎', name: 'ניחוש פלט', desc: 'קטע Bicep/ARM/CLI - מה קורה בפועל בזמן הפריסה?', type: 'quiz', data: CODE_GUESS, sample: 8, time: 28000, showCode: true },
    { key: 'cmd', icon: '🧩', name: 'השלמת פקודה', desc: 'פקודת az CLI או Bicep עם חלק חסר - בחרו מה משלים אותה נכון', type: 'quiz', data: CMD_COMPLETE, sample: 8, time: 28000, showCode: true },
    { key: 'match', icon: '🔗', name: 'התאמת מושגים', desc: 'התאימו כל שירות/מושג Azure לתיאור הנכון שלו', type: 'match', data: MATCH_ROUNDS, sample: 2 },
    { key: 'order', icon: '📋', name: 'סידור תהליך', desc: 'סדרו את שלבי הפריסה או ההגדרה לפי הסדר הנכון', type: 'order', data: ORDER_ROUNDS, sample: 2 }
  ];

  window.TG_CONFIG = { gameId: "azure", modes: MODES };
})();
</script>

<script src="/scripts/topic-game.js"></script>
