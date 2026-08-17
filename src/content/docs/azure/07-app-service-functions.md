---
title: "Azure App Service, Azure Functions ו-Deployment Slots"
category: Azure
part: 7/10
---

## מה זה Azure App Service?

**Azure App Service** הוא שירות **PaaS** לאירוח אפליקציות Web, REST APIs ו-Mobile Backends, ללא צורך לנהל שרתים, מערכת הפעלה או Patching. App Service תומך במגוון שפות (.NET, Node.js, Python, Java, PHP, Ruby) וגם ב-Containers מותאמים אישית (Docker).

היתרון המרכזי מול Virtual Machines הוא ש-Azure מנהלת עבורכם את כל שכבת התשתית — Scaling, Load Balancing, SSL, Health Monitoring — ואתם מתמקדים אך ורק בקוד האפליקציה.

### עקרונות מפתח

- **App Service Plan** — קובע את משאבי החומרה (CPU/RAM) ואת מספר האינסטנסים; מספר אפליקציות יכולות לחלוק אותו Plan.
- **Deployment Slots** — סביבות נוספות (Staging, QA) תחת אותה אפליקציה, לפריסה בטוחה ללא Downtime.
- **Scale Up vs Scale Out** — הגדלת עוצמת המכונה (Up) לעומת הוספת אינסטנסים נוספים (Out).

## App Service Plans — Tiers

| Tier | תיאור | שימוש טיפוסי |
|---|---|---|
| **Free / Shared** | משאבים משותפים, מוגבל מאוד | פרויקטים לימודיים בלבד |
| **Basic** | Dedicated Compute, ללא Auto Scale | סביבות Dev/Test |
| **Standard** | Auto Scale, Deployment Slots (עד 5), Backup יומי | אפליקציות פרודקשן קטנות-בינוניות |
| **Premium** | ביצועים גבוהים יותר, עד 20 Slots, VNet Integration | אפליקציות פרודקשן קריטיות |
| **Isolated** | רץ בתוך App Service Environment (ASE) מבודד ברשת פרטית | דרישות Compliance/אבטחה גבוהות במיוחד |

```bash
# יצירת App Service Plan
az appservice plan create \
  --name asp-webapp-prod \
  --resource-group rg-webapp-prod-weu \
  --location westeurope \
  --sku P1v3 \
  --is-linux

# יצירת Web App על גבי ה-Plan (Node.js לדוגמה)
az webapp create \
  --resource-group rg-webapp-prod-weu \
  --plan asp-webapp-prod \
  --name webapp-espresso-prod \
  --runtime "NODE:20-lts"

# פריסת קוד מ-ZIP
az webapp deploy \
  --resource-group rg-webapp-prod-weu \
  --name webapp-espresso-prod \
  --src-path ./app.zip \
  --type zip

# הגדרת משתני סביבה (App Settings)
az webapp config appsettings set \
  --resource-group rg-webapp-prod-weu \
  --name webapp-espresso-prod \
  --settings NODE_ENV=production API_URL=https://api.internal.local
```

## Deployment Slots

**Deployment Slots** מאפשרים לאחסן מספר גרסאות (Staging, Production) של אותה אפליקציה תחת אותו App Service, כל אחת עם ה-Hostname וההגדרות שלה, ולבצע **Swap** ביניהן ללא Downtime.

```
┌─────────────────┐         Swap (URL-based)        ┌─────────────────┐
│  Staging Slot     │  ─────────────────────────────►  │  Production Slot  │
│  (גרסה חדשה)       │  ◄─────────────────────────────  │  (גרסה נוכחית)     │
│  v2.1.0            │        (בעת Rollback)             │  v2.0.0            │
└─────────────────┘                                    └─────────────────┘
```

היתרון המרכזי: לפני ה-Swap, Azure "מחמם" (Warm-up) את ה-Slot החדש כדי לוודא שהאפליקציה עולה כראוי — כך שהמשתמשים לעולם לא רואים אפליקציה שנכשלה באתחול.

```bash
# יצירת Deployment Slot בשם staging
az webapp deployment slot create \
  --resource-group rg-webapp-prod-weu \
  --name webapp-espresso-prod \
  --slot staging

# פריסת קוד חדש ל-Staging בלבד
az webapp deploy \
  --resource-group rg-webapp-prod-weu \
  --name webapp-espresso-prod \
  --slot staging \
  --src-path ./app-v2.1.0.zip \
  --type zip

# החלפה (Swap) בין Staging ל-Production
az webapp deployment slot swap \
  --resource-group rg-webapp-prod-weu \
  --name webapp-espresso-prod \
  --slot staging \
  --target-slot production

# Rollback מהיר - Swap חוזר אם התגלתה בעיה
az webapp deployment slot swap \
  --resource-group rg-webapp-prod-weu \
  --name webapp-espresso-prod \
  --slot production \
  --target-slot staging
```

> **טיפ קריטי:** ניתן להגדיר **Slot-specific Settings** (App Settings/Connection Strings שלא עוברים ב-Swap) — שימושי כשה-Staging Slot צריך להתחבר לבסיס נתונים אחר מזה של Production.

## Auto Scaling

```bash
az monitor autoscale create \
  --resource-group rg-webapp-prod-weu \
  --resource asp-webapp-prod \
  --resource-type Microsoft.Web/serverfarms \
  --name autoscale-webapp \
  --min-count 2 --max-count 10 --count 2

az monitor autoscale rule create \
  --resource-group rg-webapp-prod-weu \
  --autoscale-name autoscale-webapp \
  --condition "CpuPercentage > 70 avg 5m" \
  --scale out 1
```

## Azure Functions — Serverless Computing

**Azure Functions** הוא שירות **Serverless (FaaS - Function as a Service)** המריץ קטעי קוד בודדים ("Functions") בתגובה ל-**Triggers**, ללא צורך לנהל תשתית כלל. אתם משלמים רק על זמן הריצה בפועל (במודל Consumption).

### מודלי אירוח (Hosting Plans)

| Plan | תיאור | Cold Start | עלות |
|---|---|---|---|
| **Consumption** | Scale-to-zero אוטומטי, תשלום לפי הרצה | כן (עד כמה שניות) | הזולה ביותר לעומסים משתנים |
| **Premium** | תמיד "חם" (Pre-warmed instances), VNet Integration | לא | גבוהה יותר |
| **Dedicated (App Service Plan)** | רץ על אותו Plan כמו Web App רגיל | לא | לפי ה-Plan הקיים |
| **Container Apps / AKS** | הרצה כ-Container ב-Kubernetes | תלוי | גמיש |

### Triggers ו-Bindings נפוצים

| Trigger | מפעיל את הפונקציה כאשר... |
|---|---|
| **HTTP Trigger** | מתקבלת בקשת HTTP (REST API) |
| **Timer Trigger** | לפי לוח זמנים (CRON expression) |
| **Blob Trigger** | קובץ חדש/מעודכן נוסף ל-Blob Storage |
| **Queue Trigger** | הודעה חדשה נכנסת ל-Queue |
| **Event Grid / Event Hub Trigger** | אירוע מגיע משירות Messaging |
| **Cosmos DB Trigger** | שינוי במסמך ב-Cosmos DB (Change Feed) |

```javascript
// function.json + index.js - HTTP Trigger פשוט (Node.js, v4 model)
const { app } = require('@azure/functions');

app.http('helloWorld', {
    methods: ['GET', 'POST'],
    authLevel: 'function',
    handler: async (request, context) => {
        const name = request.query.get('name') || 'World';
        return { body: `Hello, ${name}!` };
    }
});
```

```json
// host.json - הגדרות גלובליות של Function App
{
  "version": "2.0",
  "logging": {
    "applicationInsights": {
      "samplingSettings": { "isEnabled": true }
    }
  },
  "functionTimeout": "00:05:00"
}
```

```bash
# יצירת Function App (Consumption Plan)
az functionapp create \
  --resource-group rg-webapp-prod-weu \
  --name func-espresso-orders \
  --storage-account stwebappprodweu \
  --consumption-plan-location westeurope \
  --runtime node \
  --runtime-version 20 \
  --functions-version 4

# פריסת קוד
func azure functionapp publish func-espresso-orders
```

## App Service לעומת Functions

| קריטריון | App Service | Azure Functions |
|---|---|---|
| **מודל תשלום** | לפי Plan (רץ תמיד) | לפי הרצה בפועל (Consumption) |
| **Scale-to-zero** | לא (אלא אם Stopped ידנית) | כן (ב-Consumption Plan) |
| **שימוש טיפוסי** | אפליקציות Web מלאות, APIs עם תעבורה קבועה | משימות אירוע-מונע (Event-driven), עומסים לא סדירים |
| **Cold Start** | לא רלוונטי (רץ תמיד) | קיים ב-Consumption, נעדר ב-Premium |
| **מגבלת זמן ריצה** | ללא הגבלה | 5-10 דקות בד"כ ב-Consumption (ניתן להארכה ב-Premium) |

## טיפים וטריקים

1. **תמיד השתמשו ב-Deployment Slots לפרודקשן** — Swap הוא הדרך הבטוחה ביותר לפרוס בלי Downtime ועם אפשרות Rollback מיידית.
2. **הפעילו Always On** ב-App Service (מחוץ ל-Free/Shared Tier) כדי למנוע "הרדמות" האפליקציה בזמן חוסר תעבורה:
   ```bash
   az webapp config set --resource-group rg-webapp-prod-weu --name webapp-espresso-prod --always-on true
   ```
3. **השתמשו ב-Managed Identity** (ראו מדריך 6) לגישה מ-App Service/Functions ל-Key Vault ול-Storage, במקום Connection Strings עם סודות.
4. **בחרו Premium Plan לפונקציות רגישות ל-Latency** — Cold Start ב-Consumption יכול להגיע לכמה שניות ולפגוע ב-SLA.
5. **עקבו אחר Application Insights** (ראו מדריך 9) מהיום הראשון — מספק Distributed Tracing מובנה לכל בקשה.

## שאלות נפוצות לתרגול עצמי

- מה ההבדל בין Scale Up ל-Scale Out ב-App Service?
- כיצד Deployment Slots מאפשרים פריסה ללא Downtime, ומה זה "Warm-up" לפני Swap?
- מתי תבחרו ב-Azure Functions על פני App Service רגיל?
- מה ההבדל בין Consumption Plan ל-Premium Plan בפונקציות, ומה זה Cold Start?

## קישורים חיצוניים

**תיעוד רשמי:**
- Azure App Service - תיעוד: https://learn.microsoft.com/en-us/azure/app-service/overview
- Deployment Slots: https://learn.microsoft.com/en-us/azure/app-service/deploy-staging-slots
- Azure Functions - תיעוד: https://learn.microsoft.com/en-us/azure/azure-functions/functions-overview

**סרטוני YouTube מומלצים:**
- John Savill's Technical Training - App Service & Functions: https://www.youtube.com/c/NTFAQGuy
- Adam Marczak - Azure Functions Explained: https://www.youtube.com/c/AdamMarczakAzureForEveryone
- freeCodeCamp - Serverless with Azure Functions: https://www.youtube.com/watch?v=NKEFWyqJ5XA

---
⬅️ המדריך הבא: [08-aks-kubernetes.md](/azure/08-aks-kubernetes/) — Azure Kubernetes Service (AKS), ארכיטקטורה ואינטגרציה עם ACR
