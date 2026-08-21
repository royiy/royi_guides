---
title: "שאלות קשות ברמת הסמכה (Azure Administrator AZ-104)"
category: Azure
part: 12/10
---

מבחן אינטראקטיבי ברמת קושי גבוהה, בסגנון שאלות הסמכת **Microsoft Certified: Azure Administrator Associate (AZ-104)** - בניגוד למבחן החזרה הכללי בפרק הקודם, כאן כל שאלה בודקת נקודה עדינה ומטעה שדורשת הבנה אמיתית של מנגנוני הפנים של Azure (RBAC מול Policy, Redundancy, Peering, NSG, Autoscale ועוד), לא רק שינון. בחרו תשובה ותקבלו מיד משוב עם הסבר מפורט.

<div id="quiz-score" class="quiz-score">ענית נכון על 0 מתוך 10</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>1. מהו ההבדל התפקודי המרכזי בין Azure RBAC לבין Azure Policy?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. RBAC קובע אילו כללי תאימות (compliance) חלים על משאבים, בעוד Policy קובע מי יכול לגשת למשאבים</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. RBAC קובע מי (User/Group/Service Principal) יכול לבצע אילו פעולות (Actions) על משאבים - שאלת "מי מורשה לעשות מה"; Azure Policy אוכף כללים על תכונות/הגדרות של המשאבים עצמם (למשל "רק SKU מסוים", "חובה תיוג") ללא קשר להרשאות המשתמש - שאלת "האם המשאב תואם לכללים", ועלול לחסום יצירת משאב גם למשתמש עם הרשאת RBAC מלאה אם הוא לא תואם למדיניות</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. שני המנגנונים עושים בדיוק אותו דבר, ומשתמשים בהם לסירוגין</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. RBAC פועל רק ברמת Subscription, ואילו Policy פועל רק ברמת Resource Group</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> RBAC (Role-Based Access Control) עוסק ב-Authorization - מי מורשה לבצע אילו פעולות על אילו משאבים, לפי הקצאת תפקידים (Owner, Contributor, Reader ותפקידים מותאמים אישית) בהיררכיית Management Group/Subscription/Resource Group/Resource. Azure Policy הוא מנגנון נפרד לחלוטין שאוכף חוקי תאימות (Compliance) על תכונות המשאבים עצמם - למשל חסימת יצירת משאבים באזור לא מאושר, חיוב תיוג, או הגבלת SKU - וזה קורה ללא קשר לשאלה אם למשתמש יש הרשאת RBAC מלאה. אפשר להיות Owner מלא ועדיין להיחסם על ידי Policy אם המשאב שמנסים ליצור אינו תואם למדיניות.</div>
</div>

<div class="quiz-card" data-answer="ג">
  <p class="quiz-question"><strong>2. מהו ההבדל בין GRS ל-RA-GRS ב-Azure Storage Account Redundancy?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. אין הבדל בפועל, שני השמות מתארים בדיוק את אותו מנגנון שכפול</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. GRS משכפל סינכרונית בין שלושה Availability Zones באותו Region; RA-GRS משכפל סינכרונית בין שני Regions מרוחקים</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. שני האפשרויות משכפלות א-סינכרונית (Async) עותק נוסף ל-Region משני מרוחק גיאוגרפית; ההבדל הוא ש-RA-GRS מוסיף Read Access - אפשרות לקרוא ישירות מהעותק המשני דרך endpoint ייעודי (secondary), בעוד שב-GRS רגיל העותק המשני אינו נגיש לקריאה כלל, אלא רק במקרה של Failover יזום על ידי מיקרוסופט</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. RA-GRS זול יותר מ-GRS מכיוון שהוא לא כולל שכפול ל-Region משני</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> LRS משכפל שלושה עותקים בתוך datacenter בודד. ZRS משכפל סינכרונית בין שלושה Availability Zones באותו Region. GRS מוסיף על גבי LRS שכפול א-סינכרוני לעותק ב-Region משני מרוחק (Paired Region) - אך העותק המשני נגיש רק אחרי Failover. RA-GRS (Read-Access GRS) הוא בדיוק כמו GRS, עם תוספת אחת קריטית: אפשרות לקרוא מהעותק המשני בכל רגע נתון דרך endpoint נפרד (למשל <code>accountname-secondary.blob.core.windows.net</code>), בלי לחכות ל-Failover. זו בדיוק הנקודה העדינה שנבחנת לרוב במבחן.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>3. יש שלושה VNets: A מחובר ב-Peering ל-B, ו-B מחובר ב-Peering ל-C. האם משאב ב-A יכול לתקשר עם משאב ב-C דרך שרשרת ה-Peering, מבלי להגדיר דבר נוסף?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. כן, תמיד - VNet Peering הוא Transitive מטבעו והתעבורה עוברת דרך B אוטומטית</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. לא - VNet Peering אינו Transitive מעצם טבעו: כדי ש-A יגיע ל-C יש ליצור Peering ישיר בין A ל-C, או לבנות טופולוגיית Hub-Spoke עם רכיב ניתוב מרכזי (כגון Azure Firewall/NVA) שדרכו עוברת התעבורה</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. כן, אבל רק אם שלושת ה-VNets נמצאים באותו Subscription בדיוק</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. כן, אבל רק אם לכל משאב מוגדרת כתובת Public IP</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> אחד המכשולים הנפוצים ביותר במבחן - VNet Peering אינו Transitive: העובדה ש-A מחובר ל-B, ו-B מחובר ל-C, לא נותנת ל-A שום נתיב אוטומטי אל C. כדי לחבר את A ל-C צריך Peering ישיר נוסף בין השניים, או לתכנן ארכיטקטורת Hub-Spoke שבה כל ה-Spokes מנתבים דרך רכיב מרכזי (NVA/Azure Firewall) ב-Hub באמצעות User Defined Routes. שימו לב שגם Gateway Transit (שיתוף VPN/ExpressRoute Gateway של ה-Hub עם Spokes) הוא יכולת נפרדת ולא פותר את חוסר ה-Transitivity בין Peering-ים רגילים.</div>
</div>

<div class="quiz-card" data-answer="ג">
  <p class="quiz-question"><strong>4. ב-NSG מוגדר כלל Inbound עם Priority 100 שחוסם (Deny) תעבורה מכתובת IP מסוימת, וכלל נוסף עם Priority 200 שמתיר (Allow) תעבורה מאותה כתובת בדיוק. איזה כלל ייכנס בפועל לתוקף?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. הכלל עם מספר ה-Priority הגבוה יותר (200, ה-Allow) מנצח תמיד</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. שני הכללים מתבצעים במקביל, וזה יוצר קונפליקט שגורם ל-NSG להיכשל</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. הכלל עם ה-Priority (100, ה-Deny) מנצח - ב-NSG הכללים מוערכים בסדר עולה לפי מספר ה-Priority (טווח 100-4096), כאשר מספר נמוך יותר משמעו עדיפות גבוהה יותר, וברגע שנמצאה התאמה ראשונה ההערכה נעצרת ושאר הכללים מתעלמים</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. Azure בוחר אקראית איזה משני הכללים להחיל בכל בקשה</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> ב-Network Security Group מספר ה-Priority קובע סדר עדיפות הפוך אינטואיטיבית למי שלא מכיר: ככל שהמספר נמוך יותר, כך העדיפות גבוהה יותר. הכללים מוערכים לפי סדר עולה, וברגע שנמצאה התאמה ראשונה (Match) ההערכה נפסקת - שאר הכללים, כולל כאלה עם Priority גבוה יותר שאולי היו מתירים, כלל לא נבדקים. בנוסף, חשוב לזכור שקיימים כללי ברירת מחדל (Default Rules) במספרי Priority גבוהים מאוד (65000 ומעלה) שמתירים תעבורה בתוך ה-VNet ומ-Load Balancer, וחוסמים כל תעבורה אחרת מבחוץ (DenyAllInbound) - ואי אפשר למחוק אותם, רק לעקוף אותם עם כללים מותאמים אישית בעדיפות נמוכה יותר (מספר קטן יותר).</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>5. מהו תפקידו של ה-Cooldown Period בהגדרת Autoscale ל-Virtual Machine Scale Set, ומדוע חשוב להגדיר אותו נכון?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. Cooldown Period קובע את המספר המקסימלי של Instances שה-Scale Set יכול להכיל בכל רגע נתון</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. Cooldown Period הוא פרק הזמן שלאחר כל פעולת Scale (in או out) שבמהלכו Autoscale לא יבצע פעולת Scale נוספת - הוא נועד למנוע "Flapping" (הוספה והסרה חוזרת ונשנית של Instances עקב מדדים שעדיין לא התייצבו) ולתת למטריקות זמן להשתקף במלואן אחרי השינוי בכמות המכונות</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. Cooldown Period הוא הזמן שלוקח למכונה חדשה לעלות ולהתחיל לקבל תעבורה, וערכו קבוע ואינו ניתן לשינוי</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. Cooldown Period רלוונטי אך ורק לכללי Scale-in, ואינו משפיע כלל על כללי Scale-out</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> כשמגדירים כללי Autoscale מבוססי Metrics (למשל CPU Average מעל/מתחת לסף מסוים), ה-Cooldown Period (ברירת מחדל 5 דקות) מונע מהמנגנון לבצע פעולת Scale נוספת מיד אחרי הפעולה הקודמת, כדי לתת למדדים זמן "להתייצב" בהתאם למספר המכונות החדש. בלי Cooldown מספיק, ייתכן מצב של Flapping - הוספת מכונות בגלל עומס, ואז הסרתן כמעט מיד כי הממוצע צנח זמנית, וחוזר חלילה - מה שפוגע ביציבות ובעלות.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>6. מהו ההבדל המרכזי בין Azure AD Roles (Microsoft Entra ID Roles, כמו Global Administrator) לבין Azure RBAC Roles (כמו Owner/Contributor)?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. שני סוגי התפקידים חלים בדיוק על אותו Scope, ואפשר להשתמש בהם לסירוגין</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. Azure AD Roles שולטים על ניהול משאבי ה-Directory עצמו ברמת ה-Tenant - משתמשים, קבוצות, Applications, Domains, Licenses; Azure RBAC Roles שולטים על ניהול משאבי Azure (VMs, Storage, Networking) בהיררכיית Management Groups/Subscriptions/Resource Groups/Resources - אלה שתי מערכות הרשאות נפרדות, ותפקיד Global Administrator ב-Azure AD אינו מעניק אוטומטית הרשאות RBAC על משאבי Azure</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. Azure RBAC שולט אך ורק על Microsoft 365, בעוד Azure AD Roles שולט אך ורק על תשתית ה-VMs</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. Global Administrator ב-Azure AD מקבל אוטומטית הרשאת Owner על כל המשאבים בכל המנויים בארגון, ללא כל הגדרה נוספת</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> זו נקודה שמבלבלת רבים - Global Administrator הוא תפקיד עוצמתי בתוך Microsoft Entra ID (ניהול משתמשים, קבוצות, אפליקציות, הגדרות Tenant), אבל הוא <strong>לא</strong> מעניק כברירת מחדל שום הרשאת Azure RBAC על מנויים ומשאבי Azure בפועל. קיימת אפשרות ייעודית ("Access management for Azure resources" בהגדרות Entra ID) שבה Global Administrator יכול להעלות את עצמו זמנית לתפקיד User Access Administrator ברמת ה-Root Management Group - אך זו פעולה מפורשת וידנית, לא הרשאה אוטומטית.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>7. מוגדרת נעילת <code>CanNotDelete</code> ברמת Resource Group. משתמש בעל הרשאת Owner מלאה על אותו Resource Group מנסה למחוק Storage Account שבתוכו. מה קורה בפועל?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. המחיקה תצליח, כי הרשאת Owner מאפשרת לעקוף כל נעילה קיימת</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. המחיקה תיחסם - נעילות (Resource Locks) פועלות בנפרד לחלוטין ממערכת ה-RBAC ואינן מושפעות ממנה; גם למשתמש עם Owner מלא אין דרך לעקוף Lock מבלי להסיר אותו קודם, ונדרשת לכך הרשאה ייעודית (<code>Microsoft.Authorization/locks/delete</code>). נעילה שהוגדרה ברמת Resource Group (או ברמת Management Group) עוברת בירושה (Inherit) לכל המשאבים שתחתיה</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. המחיקה תצליח, אך רק לאחר אישור ידני של צוות Microsoft Support</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. Resource Locks חלים רק על משאבי Virtual Machines, ואינם רלוונטיים כלל לשירותי Storage</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> נעילות (<code>CanNotDelete</code>/<code>ReadOnly</code>) הן שכבת הגנה נוספת ונפרדת מ-RBAC - הן חלות ללא קשר לרמת ההרשאה של המשתמש, וגם Owner לא יכול למחוק משאב נעול מבלי להסיר קודם את ה-Lock עצמו (פעולה שדורשת הרשאה ספציפית להסרת נעילות). נעילות מוגדרות ברמת Management Group, Subscription או Resource Group עוברות בירושה אוטומטית לכל המשאבים תחתיהן בהיררכיה, כך שאפשר לאכוף מדיניות הגנה רחבה מנקודה אחת מרכזית.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>8. מהי אחת ההגבלות הקריטיות שחשוב לדעת לגבי Recovery Services Vault לפני שמנסים למחוק אותו?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. מחיקת Vault מוחקת אוטומטית ומיידית את כל נקודות השחזור (Recovery Points) הקיימות בו, גם אם הן עדיין בתוך תקופת ה-Retention המוגדרת</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. לא ניתן למחוק Recovery Services Vault שיש בו פריטים מוגנים (למשל VMs עם Backup פעיל) או נקודות שחזור קיימות - יש להסיר תחילה את הגנת ה-Backup מכל הפריטים ולמחוק את נקודות השחזור עצמן (בכפוף למדיניות Soft Delete שעשויה לשמור אותן זמנית) לפני שהמערכת מאפשרת למחוק את ה-Vault</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. שינוי מדיניות ה-Retention ב-Vault מוחק מיידית ורטרואקטיבית את כל נקודות השחזור הישנות שלא תואמות למדיניות החדשה</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. Recovery Services Vault תומך אך ורק בגיבוי Virtual Machines, ואינו יכול לגבות SQL Server, Azure Files או שרתי Backup נוספים</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> Recovery Services Vault שומר מדיניות Retention לנקודות שחזור לפי הגדרה מראש, אך לא ניתן פשוט למחוק Vault שמכיל פריטים מוגנים - חייבים תחילה לעצור את ה-Backup ולמחוק את נתוני הגיבוי (Delete Backup Data) עבור כל פריט. בנוסף, תכונת Soft Delete (מופעלת כברירת מחדל) שומרת נקודות שחזור זמנית גם אחרי מחיקה מפורשת, כדי להגן מפני מחיקה בזדון או בטעות - כך שגם תהליך "מחיקת" הגיבוי אינו מיידי לחלוטין.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>9. מהו ההבדל בין Availability Set ל-Availability Zone מבחינת ההגנה שכל אחד מהם מספק?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. Availability Set מגן מפני כשל של Region שלם; Availability Zone מגן רק מפני כשל של Rack בודד בתוך שרת אחד</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. Availability Set מפזר VMs בין Fault Domains (עד 3, מדפי חשמל/רשת/קירור נפרדים) ו-Update Domains (עד 20, קבוצות תחזוקה מתוזמנת) - הכל בתוך מרכז נתונים בודד; Availability Zone מפזר משאבים בין מרכזי נתונים פיזיים נפרדים לגמרי (עם חשמל/קירור/רשת עצמאיים) בתוך אותו Region, ולכן מגן גם מפני כשל של מרכז נתונים שלם - רמת חוסן גבוהה משמעותית יותר</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. שני המושגים זהים לחלוטין ומחליפים זה את זה בכל תרחיש</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. Availability Zone הוא מושג ישן שהוחלף לחלוטין ב-Availability Set בגרסאות עדכניות של Azure</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> Availability Set הוא מבנה לוגי בתוך מרכז נתונים בודד: הוא מפזר VMs בין Fault Domains כדי להגן מפני כשל חומרה משותף (רשת/חשמל) ובין Update Domains כדי שלא כל המכונות יעברו תחזוקה/Reboot בו-זמנית - אך אינו מגן מפני כשל של מרכז הנתונים כולו. Availability Zones הן מרכזי נתונים פיזיים ונפרדים לגמרי בתוך אותו Region, כל אחד עם תשתית חשמל/קירור/רשת עצמאית - ולכן פריסה על פני Zones מגנה גם מפני כשל DC שלם, ומספקת SLA גבוה יותר מ-Availability Set.</div>
</div>

<div class="quiz-card" data-answer="א">
  <p class="quiz-question"><strong>10. מהו ההבדל המרכזי בין Azure Monitor Metrics לבין Azure Monitor Logs (Log Analytics)?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. Metrics הם נתונים מספריים בטור-זמן (Time-Series) הנאספים בתדירות גבוהה ונשמרים לתקופה קצרה יחסית (בדרך כלל עד 93 יום כברירת מחדל), מתאימים לניטור כמעט בזמן אמת ולהתראות מהירות בעלות נמוכה; Logs נשמרים ב-Log Analytics Workspace, נשלפים בשפת השאילתות KQL (Kusto Query Language), תומכים בנתונים מובנים ולא-מובנים כאחד, מאפשרים ניתוח מורכב לאורך תקופת Retention ניתנת להגדרה - אך בדרך כלל יקרים ואיטיים יותר יחסית ל-Metrics</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. Metrics ו-Logs הם שני שמות שונים לאותו מאגר נתונים בדיוק, ואין שום הבדל מעשי ביניהם</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. Logs נשמרים תמיד למשך 93 יום קבועים בלבד, ואין אפשרות לשנות זאת</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. Metrics תומכים בשפת השאילתות KQL, בעוד Logs אינם תומכים בשום שפת שאילתות</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> Metrics ב-Azure Monitor הם ערכים מספריים קלים המתעדכנים בתדירות גבוהה (למשל כל דקה), אידיאליים להתראות מהירות ולתצוגת מגמות בזמן כמעט אמיתי, ונשמרים לתקופה קצובה מובנית (כ-93 יום). Logs, לעומת זאת, נאספים ל-Log Analytics Workspace ונשאלים בשפת KQL העוצמתית - הם מתאימים לחקירות מעמיקות, קורלציה בין מקורות נתונים שונים (VMs, אפליקציות, רשת) וניתוח היסטורי ארוך טווח, עם אפשרות להגדיר Retention מותאם אישית (עד שנים), אך בדרך כלל בעלות גבוהה יותר ובזמן תגובה איטי יותר מ-Metrics.</div>
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
