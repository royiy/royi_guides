---
title: "שאלות ראיון עבודה מקיפות על Azure + טיפים כלליים"
description: "אוסף שאלות ראיון עבודה על Azure בדרגות Junior, Mid-Level ו-Senior עם תשובות תמציתיות, וטיפים כלליים לעבודה יומיומית."
category: Azure
part: 10/10
---

מדריך מסכם עם שאלות ראיון מדורגות לפי רמת קושי (Junior → Senior), כולל תשובות תמציתיות, ורשימת טיפים כלליים לעבודה יומיומית עם Azure.

## שאלות בסיסיות (Junior)

<details class="qa">
<summary>1. מה ההבדל בין IaaS, PaaS ו-SaaS?</summary>

IaaS (למשל Azure VMs) — אתם מנהלים OS ומעלה; Azure מנהלת רק חומרה ווירטואליזציה. PaaS (למשל App Service) — Azure מנהלת גם את ה-Runtime, אתם רק דואגים לקוד ולנתונים. SaaS (למשל Microsoft 365) — הכל מנוהל, אתם רק צורכים את המוצר.

</details>

<details class="qa">
<summary>2. מה ההבדל בין Region ל-Availability Zone?</summary>

Region הוא אזור גאוגרפי (למשל West Europe). Availability Zone הוא מרכז נתונים פיזי נפרד *בתוך* Region, עם חשמל/קירור/רשת עצמאיים — פריסה על פני Zones מגנה מפני כשל DC שלם.

</details>

<details class="qa">
<summary>3. מה זה Resource Group?</summary>

קיבוץ לוגי של משאבי Azure החולקים Lifecycle משותף — מחיקת Resource Group מוחקת את כל תוכנו. משמש לארגון, ניהול הרשאות ותיוג עלויות.

</details>

<details class="qa">
<summary>4. מה ההבדל בין Subscription ל-Resource Group?</summary>

Subscription הוא גבול חיוב ומכסות עליון; Resource Group הוא קיבוץ לוגי בתוך Subscription. Subscription אחד יכול להכיל מספר רב של Resource Groups.

</details>

<details class="qa">
<summary>5. מה זה Azure Resource Manager (ARM)?</summary>

שכבת הניהול המרכזית שדרכה עוברות כל הפעולות ב-Azure (Portal/CLI/PowerShell/SDK) — אחראית על אימות, RBAC, Tagging ו-Dependency Management בין משאבים.

</details>

<details class="qa">
<summary>6. מה ההבדל בין ARM Templates ל-Bicep?</summary>

ARM Templates הם JSON דקלרטיבי, מפורט ומסורבל. Bicep הוא DSL חדש יותר שמתקמפל ל-ARM JSON מאחורי הקלעים, עם תחביר קצר, Type Safety ו-Modules.

</details>

<details class="qa">
<summary>7. מה זה Storage Account ואילו שירותים הוא מכיל?</summary>

מיכל עליון לשירותי אחסון של Azure: Blob, File, Queue ו-Table Storage, כולם תחת Namespace ייחודי גלובלית.

</details>

<details class="qa">
<summary>8. מה ההבדל בין Managed Disk ל-Storage Account רגיל?</summary>

Managed Disk הוא דיסק המשמש VM, שמנוהל אוטומטית על ידי Azure (מאז 2017) ללא צורך לנהל Storage Account בעצמכם עבורו.

</details>

<details class="qa">
<summary>9. מה זה NSG (Network Security Group)?</summary>

Firewall מבוזר ברמת Layer 3/4 עם רשימת חוקי Allow/Deny, שניתן לצרף ל-Subnet או ל-Network Interface.

</details>

<details class="qa">
<summary>10. מה ההבדל בין <code>az vm stop</code> ל-<code>az vm deallocate</code>?</summary>

`stop` מכבה את המכונה אך ממשיך לחייב על המשאבים המוקצים. `deallocate` משחרר את המשאבים לגמרי ומפסיק חיוב Compute.

</details>

## שאלות ברמת ביניים (Mid-Level)

<details class="qa">
<summary>11. הסבירו את ה-4 רמות ה-Redundancy באחסון (LRS/ZRS/GRS/GZRS).</summary>

LRS — 3 עותקים באותו Data Center (מגן מפני כשל דיסק/רק). ZRS — 3 עותקים בין Availability Zones (מגן מפני כשל DC). GRS — שכפול ל-Region משני (מגן מפני אסון אזורי, לא נגיש לקריאה כברירת מחדל). GZRS — שילוב ZRS ראשי + LRS משני, ההגנה הגבוהה ביותר. RA-GRS/RA-GZRS מוסיפים גישת קריאה ל-Region המשני.

</details>

<details class="qa">
<summary>12. מה ההבדל בין Availability Set ל-VM Scale Set?</summary>

Availability Set מפזר VMs קבועים בין Fault/Update Domains בתוך DC, ללא Scaling אוטומטי. VMSS מנהל צי VMs זהים עם Auto Scaling אוטומטי לפי מדדים, ותומך גם ב-Availability Zones.

</details>

<details class="qa">
<summary>13. מה ההבדל בין Managed Identity ל-Service Principal?</summary>

Managed Identity מנוהלת אוטומטית על ידי Azure עבור משאב ספציפי, ללא סודות בכלל — עדיפה תמיד בתוך Azure. Service Principal נדרש כשהמקור אינו משאב Azure (CI/CD חיצוני כמו GitHub Actions/Jenkins), ודורש ניהול Secret/Certificate.

</details>

<details class="qa">
<summary>14. מה ההבדל בין System-Assigned ל-User-Assigned Managed Identity?</summary>

System-Assigned נוצרת ונמחקת יחד עם Lifecycle של המשאב הספציפי. User-Assigned היא משאב עצמאי שניתן לשייך למספר משאבים במקביל, וממשיכה להתקיים גם אם משאב אחד נמחק.

</details>

<details class="qa">
<summary>15. מה זה VNet Peering, ולמה הוא Non-Transitive?</summary>

מחבר שני VNets דרך רשת ה-Backbone הפרטית של מיקרוסופט, ללא אינטרנט ציבורי. Non-Transitive אומר שאם A מחובר ל-B ו-B מחובר ל-C, A לא יכול "לדבר" עם C ישירות דרך B — נדרש Peering ישיר או ארכיטקטורת Hub-and-Spoke עם Routing מפורש.

</details>

<details class="qa">
<summary>16. מהם Deployment Slots וכיצד Swap עובד?</summary>

סביבות נוספות (Staging וכו') תחת אותה App Service, המאפשרות פריסה ללא Downtime. לפני Swap, Azure "מחממת" את ה-Slot החדש (Warm-up) לפני שהיא מפנה אליו את התעבורה, כדי למנוע חשיפת אפליקציה שנכשלה באתחול.

</details>

<details class="qa">
<summary>17. מה ההבדל בין Azure Functions Consumption Plan ל-Premium Plan?</summary>

Consumption הוא Scale-to-zero עם תשלום לפי הרצה בפועל, אך סובל מ-Cold Start. Premium שומר Instances "חמים" מראש (Pre-warmed) ותומך ב-VNet Integration, ללא Cold Start, אך יקר יותר.

</details>

<details class="qa">
<summary>18. מה ההבדל בין App Service ל-Azure Functions מבחינת מודל שימוש?</summary>

App Service מתאים לאפליקציות Web עם תעבורה קבועה/רציפה. Functions מתאים למשימות Event-driven, עומסים לא סדירים, ותשלום לפי שימוש בפועל.

</details>

<details class="qa">
<summary>19. מה ההבדל בין Kubenet ל-Azure CNI ב-AKS?</summary>

Kubenet מקצה IPs ל-Pods מטווח נפרד מה-VNet (עם NAT פנימי), פשוט יותר וחסכוני ב-IP. Azure CNI מקצה IP אמיתי מה-VNet לכל Pod — אינטגרציה מלאה עם NSG/Peering/Private Endpoints, אך "צורך" יותר כתובות.

</details>

<details class="qa">
<summary>20. איך AKS מתחבר ל-ACR ללא Image Pull Secrets ידניים?</summary>

דרך `az aks update --attach-acr` — Azure מעניקה אוטומטית תפקיד `AcrPull` ל-Managed Identity של הקלאסטר, כך ש-Nodes יכולים למשוך Images ללא Secrets מוגדרים ידנית.

</details>

## שאלות מתקדמות (Senior)

<details class="qa">
<summary>21. תארו ארכיטקטורת Hub-and-Spoke ומדוע היא נפוצה בארגונים גדולים.</summary>

VNet מרכזי ("Hub") מכיל שירותים משותפים (Firewall, VPN/ExpressRoute Gateway, DNS מרכזי), ו-VNets נוספים ("Spokes") לכל צוות/אפליקציה, מחוברים ל-Hub דרך Peering. זה מרכז ניהול אבטחה ורשת, ומאפשר לצוותים לעבוד באופן עצמאי תוך שמירה על Governance מרכזי. Non-Transitivity נפתרת בד"כ עם NVA (Network Virtual Appliance) או Azure Firewall ב-Hub עם UDRs מתאימים.

</details>

<details class="qa">
<summary>22. איך הייתם מתכננים אסטרטגיית Disaster Recovery בין Regions?</summary>

שילוב Region Pair, GRS/GZRS לאחסון, Azure Site Recovery ל-VMs, Traffic Manager/Front Door לניתוב תעבורה, ותכנון RTO/RPO ברור לכל שכבה (Compute/Data/Network) — כולל תרגול Failover תקופתי, לא רק תיעוד תיאורטי.

</details>

<details class="qa">
<summary>23. מה ההבדל בין Azure Policy ל-RBAC, ומתי משתמשים בכל אחד?</summary>

RBAC קובע **מי** יכול לעשות **מה** (הרשאות). Azure Policy קובע **אילו הגדרות מותרות** במשאבים עצמם (למשל "כל Storage Account חייב TLS 1.2+", או "אסור ליצור VM מחוץ ל-West Europe") — נאכף ללא תלות בהרשאות המשתמש שיוצר את המשאב.

</details>

<details class="qa">
<summary>24. איך תבנו Pipeline CI/CD מאובטח לפריסת Bicep/Terraform ל-Azure?</summary>

Service Principal ייעודי עם הרשאות מצומצמות (Least Privilege) בסקופ Resource Group ספציפי, שימוש ב-OIDC/Workload Identity Federation במקום Client Secret (כשניתן), הרצת `what-if`/`plan` כ-Gate לפני Apply, אישור ידני (Manual Approval) לסביבת Production, וסריקת IaC עם כלים כמו Checkov/PSRule.

</details>

<details class="qa">
<summary>25. מהו Workload Identity ב-AKS, ומדוע הוא עדיף על שיטות קודמות?</summary>

מנגנון שמאפשר ל-Pod ספציפי (דרך ServiceAccount מסומן) לקבל Managed Identity ייעודית לגישה למשאבי Azure (Key Vault, Storage) ללא Secrets בכלל. עדיף על AAD Pod Identity הישן (deprecated) כי הוא מבוסס על סטנדרט OIDC Federation, יציב יותר ואינו דורש DaemonSet נוסף בקלאסטר.

</details>

<details class="qa">
<summary>26. איך תממשו Zero Trust הלכה למעשה ב-Azure?</summary>

שילוב: Conditional Access עם MFA חובה, PIM (Privileged Identity Management) להרשאות Just-In-Time לתפקידים רגישים, Managed Identities במקום Secrets, Private Endpoints לשירותי PaaS, Network Segmentation עם NSG/Azure Firewall, וניטור מתמשך דרך Microsoft Defender for Cloud.

</details>

<details class="qa">
<summary>27. מה ההבדל בין Azure Monitor Metric Alert ל-Log Alert (Scheduled Query), ומתי תבחרו בכל אחד?</summary>

Metric Alert מהיר, זול, ומתאים למדדים מספריים בזמן אמת (CPU, Latency). Log Alert (מבוסס KQL) גמיש יותר, מאפשר לוגיקה מורכבת (Join בין מספר מקורות, אגרגציות מותאמות), אך עם עיכוב מסוים (Query Frequency) ועלות גבוהה יותר.

</details>

<details class="qa">
<summary>28. תארו תרחיש שבו Diagnostic Settings לא הוגדרו על משאב קריטי, ומה ההשלכה בזמן תקרית.</summary>

בלי Diagnostic Setting, Logs מסוימים (למשל AppServiceHTTPLogs) פשוט לא נשמרים ב-Log Analytics — כשמתרחשת תקרית, אין נתונים היסטוריים לחקירה (Root Cause Analysis), ולכן יש להגדיר Diagnostic Settings **מראש** על כל משאב קריטי, לא בדיעבד.

</details>

<details class="qa">
<summary>29. איך תתכננו מבנה Resource Groups ו-Naming Convention לארגון עם עשרות צוותים?</summary>

מוסכמת שם קבועה (`rg-<app>-<env>-<region>`), הפרדת Subscriptions לפי סביבה או יחידה עסקית, שימוש ב-Management Groups לאכיפת Policy אחידה, תיוג חובה (`Environment`, `Owner`, `CostCenter`) דרך Azure Policy, ו-Resource Locks על משאבים קריטיים כנגד מחיקה בטעות.

</details>

<details class="qa">
<summary>30. סימולציית תרחיש: אפליקציה ב-AKS מדווחת על Latency גבוה בשעות עומס. איך הייתם מאבחנים?</summary>

תשובה מומלצת: להתחיל מ-Application Insights Application Map לזיהוי ה-Dependency האיטי (DB? שירות חיצוני?), לבדוק KQL על `AppRequests`/`AppDependencies` לפילוח לפי endpoint, לבדוק Cluster Autoscaler ו-HPA (האם ה-Pods מספיקים לעומס?), לבדוק ניצול Node Pool (CPU/Memory Throttling), ולבדוק אם יש Network Bottleneck (NSG/Azure CNI IP exhaustion). המפתח הוא גישה שיטתית משכבת האפליקציה ועד התשתית, לא ניחוש.

</details>

## רשימת טיפים וטריקים כלליים (Cheat Sheet)

### CLI שימושי

```bash
# הצגת ה-Subscription הפעיל הנוכחי
az account show --output table

# רשימת כל ה-Subscriptions הזמינים
az account list --output table

# הגדרת ברירות מחדל כדי לקצר פקודות
az config set defaults.group=rg-demo defaults.location=westeurope

# תצוגה מקדימה של שינויי IaC לפני פריסה
az deployment group what-if --resource-group rg-demo --template-file main.bicep

# חיפוש כל המשאבים לפי Tag
az resource list --tag Environment=Production --output table

# בדיקת עלויות מצטברות בחודש הנוכחי
az consumption usage list --output table
```

### שגיאות/תקלות נפוצות ופתרונן

| תקלה | סיבה נפוצה | פתרון |
|---|---|---|
| `AuthorizationFailed` | הרשאת RBAC חסרה בסקופ הנכון | בדקו `az role assignment list --scope <scope>` |
| VM לא נגיש ב-SSH | NSG חוסם פורט 22, או Public IP חסר | בדקו NSG rules ו-Network Watcher IP Flow Verify |
| Storage Account name תפוס | שם Storage Account חייב להיות ייחודי **גלובלית** | שנו את השם, בדקו זמינות עם `az storage account check-name` |
| Deployment נכשל עם "Conflict" | משאב שכבר קיים עם הגדרות שונות, או Resource Lock | הריצו `what-if`, בדקו Locks עם `az lock list` |
| AKS Pod תקוע ב-`ImagePullBackOff` | ACR לא מחובר, או Image לא קיים | בדקו `az aks check-acr` ו-`az acr repository list` |
| Function לא מגיב (Cold Start ארוך) | Consumption Plan עם עומס נמוך | שקלו Premium Plan או Always Ready Instances |

### עקרונות עבודה מומלצים

1. **תייגו כל משאב מהיום הראשון** — `Environment`, `Owner`, `CostCenter` — קריטי לניהול עלויות וזיהוי בעלות בארגון גדול.
2. **Least Privilege תמיד** — הרשאת RBAC מצומצמת ביותר, בסקופ הצר ביותר האפשרי.
3. **Managed Identity על פני Secrets** בכל מקום שאפשר — פחות סודות = פחות משטח תקיפה.
4. **IaC לכל דבר** (Bicep/Terraform) — בלי שינויים ידניים ("ClickOps") בסביבת פרודקשן.
5. **`what-if`/`plan` לפני כל Apply** — רשת ביטחון בסיסית שחוסכת טעויות יקרות.
6. **הגדירו Diagnostic Settings ו-Alerts מראש** — לא אחרי התקרית הראשונה.
7. **תכננו Naming Convention ו-Resource Group Structure** לפני שיוצרים משאב ראשון, לא בדיעבד.
8. **Resource Locks על משאבים קריטיים** — הגנה זולה ויעילה נגד מחיקה בטעות.
9. **בדקו Azure Advisor באופן קבוע** — המלצות חינמיות לחיסכון בעלויות, אבטחה וביצועים.
10. **תרגלו Disaster Recovery בפועל** — תוכנית DR שלא נבדקה היא בגדר תיאוריה בלבד.

## קישורים חיצוניים

**תיעוד רשמי:**
- Azure Fundamentals Learning Path: https://learn.microsoft.com/en-us/training/paths/microsoft-azure-fundamentals-describe-cloud-concepts/
- Azure Well-Architected Framework: https://learn.microsoft.com/en-us/azure/well-architected/
- Azure Architecture Center: https://learn.microsoft.com/en-us/azure/architecture/

**סרטוני YouTube מומלצים (הכנה לראיונות):**
- John Savill's Technical Training - AZ-104/AZ-305 Prep: https://www.youtube.com/c/NTFAQGuy
- Adam Marczak - Azure for Everyone (ערוץ מקיף לכל הנושאים): https://www.youtube.com/c/AdamMarczakAzureForEveryone
- freeCodeCamp - Azure Full Course for Beginners: https://www.youtube.com/watch?v=NKEFWyqJ5XA
- TechWorld with Nana - Azure Basics: https://www.youtube.com/c/TechWorldwithNana

---
🏠 חזרה למדריך הראשון: [01-mavo-le-azure.md](/azure/01-mavo-le-azure/) — מבוא ל-Azure, מודל השירותים ותשתית הענן

---

## אינדקס כל 10 המדריכים

1. [מבוא ל-Azure, מודל השירותים ותשתית הענן](/azure/01-mavo-le-azure/)
2. [Subscriptions, Resource Groups ו-Infrastructure as Code עם ARM ו-Bicep](/azure/02-resource-groups-arm-bicep/)
3. [Azure Virtual Machines, Availability Sets/Zones ו-VM Scale Sets](/azure/03-virtual-machines/)
4. [Azure Virtual Network (VNet), Subnets, NSG ו-Peering](/azure/04-virtual-network/)
5. [Storage Accounts, Blob/File/Queue/Table ו-Redundancy](/azure/05-storage-accounts/)
6. [Microsoft Entra ID, RBAC, Managed Identities ו-Service Principals](/azure/06-azure-ad-entra-iam/)
7. [Azure App Service, Azure Functions ו-Deployment Slots](/azure/07-app-service-functions/)
8. [Azure Kubernetes Service (AKS) - ארכיטקטורה ואינטגרציה עם ACR](/azure/08-aks-kubernetes/)
9. [Azure Monitor, Log Analytics, Application Insights ו-Alerts](/azure/09-monitoring-azure-monitor/)
10. [שאלות ראיון עבודה מקיפות על Azure + טיפים כלליים](/azure/10-שאלות-ראיון-azure/) (המדריך הנוכחי)
