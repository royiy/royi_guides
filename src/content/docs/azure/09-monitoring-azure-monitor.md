---
title: "Azure Monitor, Log Analytics, Application Insights ו-Alerts"
category: Azure
part: 9/10
---

## מה זה Azure Monitor?

**Azure Monitor** הוא פלטפורמת הניטור המרכזית והמאוחדת של Azure — אוספת, מנתחת ומגיבה לנתוני טלמטריה (Metrics, Logs, Traces) מכל שירותי הענן, מאפליקציות, ומתשתיות On-Premises היברידיות. זהו "שם המטרייה" הכולל את כל שאר הכלים שנסקור במדריך זה.

### עקרונות מפתח

- **Metrics (מדדים)** — נתונים מספריים בזמן אמת (CPU%, Requests/sec, Latency) — קלים ומהירים לשאילתה, אך עם רזולוציית פירוט מוגבלת.
- **Logs (יומנים)** — נתונים טקסטואליים/מובנים המאוחסנים ב-**Log Analytics Workspace** ונשאלים בשפת **KQL** (Kusto Query Language) — עשירים בפירוט, מאפשרים ניתוח מורכב.
- **Traces** — מעקב אחר בקשה בודדת דרך כל שכבות המערכת (Distributed Tracing), נאסף בעיקר על ידי Application Insights.

## ארכיטקטורת Azure Monitor

```
                    מקורות נתונים
   ┌──────────┬──────────┬──────────┬──────────┐
   │  Azure    │  אפליקציות │  VMs /     │  On-Prem   │
   │  Resources│  (App     │  Containers│  (Hybrid)  │
   │           │  Insights)│           │           │
   └────┬─────┴────┬─────┴────┬─────┴────┬─────┘
        │           │           │           │
        ▼           ▼           ▼           ▼
  ┌──────────────────────────────────────────────┐
  │              Azure Monitor Platform             │
  │  ┌────────────────┐   ┌────────────────────┐  │
  │  │  Metrics DB      │   │  Log Analytics       │  │
  │  │  (Time-Series)   │   │  Workspace (KQL)      │  │
  │  └────────────────┘   └────────────────────┘  │
  └───────┬──────────────────────┬─────────────────┘
          ▼                      ▼
   ┌────────────┐        ┌────────────────┐
   │  Alerts      │        │  Dashboards /   │
   │  (Actions)   │        │  Workbooks      │
   └────────────┘        └────────────────┘
```

| רכיב | תיאור |
|---|---|
| **Log Analytics Workspace** | מאגר מרכזי לאחסון ולשאילתת Logs מכל המקורות |
| **Application Insights** | APM (Application Performance Monitoring) לאפליקציות — Traces, Dependencies, Exceptions |
| **Metrics Explorer** | כלי ויזואלי לחקירת מדדים בזמן אמת |
| **Alerts** | חוקים המפעילים פעולה (התראה/Webhook/Auto-heal) כשתנאי מסוים מתקיים |
| **Workbooks** | דוחות אינטראקטיביים המשלבים Logs, Metrics וטקסט |
| **Diagnostic Settings** | הגדרה שקובעת אילו Logs/Metrics ממשאב נשלחים ולאן (Log Analytics, Storage, Event Hub) |

## Log Analytics ו-KQL

**Log Analytics Workspace** הוא מסד הנתונים שבו נשמרים כל ה-Logs. השאילתות מתבצעות ב-**KQL (Kusto Query Language)** — שפה עוצמתית דמוית SQL אך מותאמת לניתוח נתוני טלמטריה בקנה מידה גדול.

```bash
# יצירת Log Analytics Workspace
az monitor log-analytics workspace create \
  --resource-group rg-monitoring \
  --workspace-name law-espresso-prod \
  --location westeurope \
  --retention-time 90

# חיבור VM לשליחת Logs ל-Workspace (דרך Azure Monitor Agent)
az monitor data-collection rule create \
  --resource-group rg-monitoring \
  --name dcr-vm-logs \
  --data-flows '[{"streams":["Microsoft-Syslog"],"destinations":["law-destination"]}]'
```

### דוגמאות שאילתות KQL

```kql
// כל ה-Errors ב-24 השעות האחרונות, מסודר לפי זמן
AppExceptions
| where TimeGenerated > ago(24h)
| where SeverityLevel == "Error"
| order by TimeGenerated desc
| project TimeGenerated, Message, OuterMessage, Cloud_RoleName

// ניתוח קצב שגיאות HTTP 5xx לפי endpoint
AppRequests
| where TimeGenerated > ago(1h)
| where ResultCode startswith "5"
| summarize ErrorCount = count() by Name, ResultCode
| order by ErrorCount desc

// זיהוי VMs עם ניצול CPU חריג
Perf
| where ObjectName == "Processor" and CounterName == "% Processor Time"
| where TimeGenerated > ago(1h)
| summarize AvgCPU = avg(CounterValue) by Computer
| where AvgCPU > 85
| order by AvgCPU desc

// חיפוש ניסיונות התחברות כושלים (Security)
SigninLogs
| where ResultType != "0"
| where TimeGenerated > ago(7d)
| summarize FailedAttempts = count() by UserPrincipalName, IPAddress
| where FailedAttempts > 5
| order by FailedAttempts desc
```

## Application Insights — APM לאפליקציות

**Application Insights** הוא רכיב Azure Monitor המתמחה בניטור אפליקציות — עוקב אוטומטית אחר בקשות HTTP, קריאות לבסיסי נתונים, תלויות חיצוניות (Dependencies), חריגות (Exceptions) וביצועים, ומאפשר **Distributed Tracing** מלא בין מיקרו-שירותים.

```bash
# יצירת Application Insights resource
az monitor app-insights component create \
  --app appinsights-espresso-api \
  --resource-group rg-monitoring \
  --location westeurope \
  --application-type web \
  --workspace law-espresso-prod
```

```javascript
// Node.js - הטמעת Application Insights SDK
const appInsights = require('applicationinsights');
appInsights.setup('<INSTRUMENTATION_KEY>')
  .setAutoDependencyCorrelation(true)
  .setAutoCollectRequests(true)
  .setAutoCollectExceptions(true)
  .setSendLiveMetrics(true)
  .start();

const client = appInsights.defaultClient;
client.trackEvent({ name: "OrderPlaced", properties: { orderId: "12345" } });
client.trackException({ exception: new Error("Payment failed") });
```

### מדדי ה-Four Golden Signals (מומלץ לעקוב עליהם תמיד)

| Signal | מה זה מודד | דוגמת שאילתה |
|---|---|---|
| **Latency** | זמן תגובה | `AppRequests \| summarize avg(DurationMs)` |
| **Traffic** | כמות בקשות | `AppRequests \| summarize count() by bin(TimeGenerated, 5m)` |
| **Errors** | שיעור כשלים | `AppRequests \| where Success == false` |
| **Saturation** | ניצול משאבים | `Perf \| where CounterName == "% Processor Time"` |

## Alerts — התראות

Azure Monitor Alerts מאפשרים להגדיר תנאים (על בסיס Metrics או תוצאות שאילתת Log) שכשמתקיימים, מפעילים **Action Group** — קבוצת פעולות תגובה (מייל, SMS, Webhook, Logic App, Auto-scale, Auto-heal).

```bash
# יצירת Action Group - התראה במייל וב-Teams Webhook
az monitor action-group create \
  --resource-group rg-monitoring \
  --name ag-devops-oncall \
  --short-name oncall \
  --email-receivers name=DevOpsTeam email=devops@espresso-club.co.il \
  --webhook-receivers name=TeamsWebhook uri=https://outlook.office.com/webhook/<...>

# Metric Alert - CPU מעל 90% ל-15 דקות
az monitor metrics alert create \
  --resource-group rg-monitoring \
  --name alert-high-cpu \
  --scopes "/subscriptions/<sub-id>/resourceGroups/rg-webapp-prod-weu/providers/Microsoft.Compute/virtualMachines/vm-web01" \
  --condition "avg Percentage CPU > 90" \
  --window-size 15m \
  --evaluation-frequency 5m \
  --action ag-devops-oncall \
  --severity 2

# Log Alert - מבוסס שאילתת KQL (למשל: יותר מ-10 Exceptions בחלון של 5 דקות)
az monitor scheduled-query create \
  --resource-group rg-monitoring \
  --name alert-high-error-rate \
  --scopes "/subscriptions/<sub-id>/resourceGroups/rg-monitoring/providers/microsoft.operationalinsights/workspaces/law-espresso-prod" \
  --condition "count 'AppExceptions | where TimeGenerated > ago(5m)' > 10" \
  --window-size 5m \
  --evaluation-frequency 5m \
  --action-groups ag-devops-oncall
```

| רמת חומרה (Severity) | תיאור |
|---|---|
| **Sev 0** | קריטי — פגיעה מלאה בשירות |
| **Sev 1** | חמור — פגיעה משמעותית בחלק מהמשתמשים |
| **Sev 2** | אזהרה — בעיה בינונית, דורשת בדיקה |
| **Sev 3** | מידע — אירוע לתיעוד, לא דחוף |
| **Sev 4** | Verbose — לצרכי Debug בלבד |

## Diagnostic Settings

כדי לשלוח Logs ממשאב Azure ל-Log Analytics, יש להגדיר **Diagnostic Setting** — ללא הגדרה זו, רוב ה-Logs לא נשמרים לטווח ארוך:

```bash
az monitor diagnostic-settings create \
  --resource "/subscriptions/<sub-id>/resourceGroups/rg-webapp-prod-weu/providers/Microsoft.Web/sites/webapp-espresso-prod" \
  --name diag-webapp \
  --workspace law-espresso-prod \
  --logs '[{"category":"AppServiceHTTPLogs","enabled":true},{"category":"AppServiceConsoleLogs","enabled":true}]' \
  --metrics '[{"category":"AllMetrics","enabled":true}]'
```

## טיפים וטריקים

1. **הגדירו Diagnostic Settings על כל משאב מהיום הראשון** — Logs שלא הוגדרו לשליחה, פשוט לא קיימים כשתצטרכו אותם בדיעבד.
2. **השתמשו ב-Workbooks** לבניית דשבורדים משותפים לצוות — הרבה יותר גמישים מ-Dashboard רגיל ב-Portal.
3. **הגדירו Action Groups לפי חומרה** — לא כל Alert צריך להעיר את התורן ב-3 בלילה; שמרו SMS/טלפון ל-Sev 0/1 בלבד.
4. **בדקו את עלות Log Analytics Retention** — ימי שמירה ארוכים (מעבר ל-30-90 יום) יכולים להתייקר משמעותית; שקלו Archive Tier לנתונים ישנים.
5. **השתמשו ב-Application Map** ב-Application Insights לזיהוי ויזואלי מהיר של Bottlenecks בין מיקרו-שירותים.

## שאלות נפוצות לתרגול עצמי

- מה ההבדל בין Metrics ל-Logs ב-Azure Monitor, ומתי תשתמשו בכל אחד?
- מהם ה-Four Golden Signals, ואיך הייתם מנטרים אותם עבור API בפרודקשן?
- מה תפקידו של Diagnostic Setting, ומה קורה אם לא מגדירים אותו?
- מה ההבדל בין Metric Alert ל-Log Alert (Scheduled Query)?

## קישורים חיצוניים

**תיעוד רשמי:**
- Azure Monitor - תיעוד: https://learn.microsoft.com/en-us/azure/azure-monitor/overview
- KQL - מדריך שפה: https://learn.microsoft.com/en-us/azure/data-explorer/kusto/query/
- Application Insights - תיעוד: https://learn.microsoft.com/en-us/azure/azure-monitor/app/app-insights-overview

**סרטוני YouTube מומלצים:**
- John Savill's Technical Training - Azure Monitor Deep Dive: https://www.youtube.com/c/NTFAQGuy
- Adam Marczak - Azure Monitor & Log Analytics Explained: https://www.youtube.com/c/AdamMarczakAzureForEveryone
- freeCodeCamp - KQL for Beginners: https://www.youtube.com/watch?v=NKEFWyqJ5XA

---
⬅️ המדריך הבא: [10-שאלות-ראיון-azure.md](/azure/10-שאלות-ראיון-azure/) — שאלות ראיון עבודה מקיפות על Azure וטיפים כלליים
