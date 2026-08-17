---
title: "Subscriptions, Resource Groups ו-Infrastructure as Code עם ARM ו-Bicep"
category: Azure
part: 2/10
---

## היררכיית הניהול ב-Azure

לפני שיוצרים משאב ראשון, חשוב להבין את מבנה ההיררכיה הארגונית של Azure — היא קובעת איך מבודדים סביבות, איך מנהלים חיוב (Billing), ואיך אוכפים מדיניות ואבטחה:

```
Microsoft Entra ID Tenant (הארגון)
        │
        ▼
  Management Groups   (קיבוץ Subscriptions לצורך Policy/RBAC)
        │
        ▼
    Subscriptions      (יחידת חיוב וגבול הרשאות עליון)
        │
        ▼
  Resource Groups       (קיבוץ לוגי של משאבים)
        │
        ▼
      Resources         (VM, Storage Account, VNet וכו')
```

| רמה | תיאור |
|---|---|
| **Tenant** | מופע ייעודי של Microsoft Entra ID (Azure AD) המייצג ארגון אחד; כל המשתמשים והקבוצות חיים בתוכו |
| **Management Group** | שכבת ארגון מעל Subscriptions — מאפשרת להחיל Policy ו-RBAC על קבוצת Subscriptions בבת אחת (עד 6 רמות עומק) |
| **Subscription** | גבול חיוב, מכסות (Quotas) וגבול הרשאות עליון; לרוב מפרידים Subscriptions לפי סביבה (Prod/Dev) או יחידה עסקית |
| **Resource Group** | "תיקייה" לוגית לקיבוץ משאבים המנוהלים יחד (Lifecycle משותף) — לרוב לפי אפליקציה או סביבה |
| **Resource** | המשאב עצמו — VM, Storage Account, SQL Database וכו' |

### עקרונות מפתח לתכנון Resource Groups

- **Lifecycle משותף** — כל המשאבים ב-RG אמורים "לחיות ולמות ביחד". מחיקת RG מוחקת את כל תוכנו.
- **Region לא חייב להיות אחיד** — Resource Group עצמו נמצא ב-Region מסוים (למטא-דאטה), אך המשאבים בתוכו יכולים להיות בכל Region.
- **אסטרטגיית תיוג** — נהוג לתת שם לפי מוסכמה כמו `rg-<app>-<env>-<region>`, לדוגמה `rg-webapp-prod-weu`.

```bash
az group create --name rg-webapp-prod-weu --location westeurope --tags Environment=Production Owner=DevOpsTeam
```

## Azure Resource Manager (ARM)

**ARM** הוא שכבת הניהול (Management Layer) שדרכה עוברות *כל* הפעולות ב-Azure — בין אם דרך Portal, CLI, PowerShell או SDK. ARM אחראי על:

- אימות בקשות (Authentication/Authorization דרך RBAC).
- עקביות (כל הבקשות עוברות דרך אותו API אחיד, ולכן פעולה מה-Portal זהה בתוצאה לפעולה מ-CLI).
- ניהול תלויות בין משאבים (Dependency Graph) בפריסות.
- Tagging, Policy Enforcement ו-Locking (מניעת מחיקה/שינוי בטעות).

```
CLI / PowerShell / Portal / SDK / REST
                │
                ▼
      Azure Resource Manager (ARM)
                │
      ┌─────────┼─────────┐
      ▼         ▼         ▼
   Compute   Storage   Networking   ... Resource Providers
```

## Infrastructure as Code: ARM Templates

**ARM Templates** הם קבצי JSON המתארים משאבים בצורה **דקלרטיבית** (מה רוצים שיהיה, לא איך להגיע לשם). זהו הפורמט "הנייטיבי" ביותר של Azure — כל כלי IaC אחר (כולל Bicep) בסופו של דבר מתורגם ל-ARM JSON מאחורי הקלעים.

```json
{
  "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",
  "contentVersion": "1.0.0.0",
  "parameters": {
    "storageAccountName": {
      "type": "string",
      "metadata": { "description": "שם Storage Account ייחודי גלובלית" }
    },
    "location": {
      "type": "string",
      "defaultValue": "westeurope"
    }
  },
  "resources": [
    {
      "type": "Microsoft.Storage/storageAccounts",
      "apiVersion": "2023-01-01",
      "name": "[parameters('storageAccountName')]",
      "location": "[parameters('location')]",
      "sku": { "name": "Standard_LRS" },
      "kind": "StorageV2",
      "properties": { "accessTier": "Hot" }
    }
  ]
}
```

החיסרון המרכזי של ARM JSON הוא **Verbosity** — קבצים ארוכים, תחביר מסורבל (`[parameters('x')]`), וקושי בקריאה. זו הסיבה המרכזית שמיקרוסופט פיתחה את Bicep.

## Infrastructure as Code: Bicep

**Bicep** היא שפת DSL (Domain-Specific Language) חדשה יותר של מיקרוסופט, המשמשת כ-"Syntactic Sugar" מעל ARM Templates. קובץ `.bicep` מתקמפל (transpile) אוטומטית ל-ARM JSON בזמן הפריסה — אין שרת ביניים, אין Overhead, ואין צורך במנוע נפרד.

### יתרונות Bicep לעומת ARM JSON

- **תחביר קצר ונקי בהרבה** — פחות Boilerplate, קריאות טובה יותר.
- **Type Safety ו-IntelliSense** — תמיכה מלאה ב-VS Code עם Autocomplete בזמן אמת.
- **Modules** — פירוק לקבצים לשימוש חוזר, בדומה ל-Terraform Modules.
- **What-If** — תצוגה מקדימה של שינויים לפני פריסה בפועל.

### דוגמת קוד Bicep מלאה

```bicep
// main.bicep
param location string = resourceGroup().location
param storageAccountName string
param environmentName string = 'dev'

var skuName = environmentName == 'prod' ? 'Standard_GRS' : 'Standard_LRS'

resource storageAccount 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: storageAccountName
  location: location
  sku: {
    name: skuName
  }
  kind: 'StorageV2'
  properties: {
    accessTier: 'Hot'
    minimumTlsVersion: 'TLS1_2'
    allowBlobPublicAccess: false
  }
  tags: {
    Environment: environmentName
    ManagedBy: 'Bicep'
  }
}

resource blobService 'Microsoft.Storage/storageAccounts/blobServices@2023-01-01' = {
  parent: storageAccount
  name: 'default'
}

resource container 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-01-01' = {
  parent: blobService
  name: 'app-data'
  properties: {
    publicAccess: 'None'
  }
}

output storageAccountId string = storageAccount.id
output primaryEndpoint string = storageAccount.properties.primaryEndpoints.blob
```

### פריסת קובץ Bicep

```bash
# בדיקה מה ישתנה, בלי לבצע בפועל (What-If)
az deployment group what-if \
  --resource-group rg-webapp-prod-weu \
  --template-file main.bicep \
  --parameters storageAccountName=stwebappprodweu environmentName=prod

# פריסה בפועל
az deployment group create \
  --resource-group rg-webapp-prod-weu \
  --template-file main.bicep \
  --parameters storageAccountName=stwebappprodweu environmentName=prod

# המרה ידנית מ-Bicep ל-ARM JSON (לצורך בדיקה)
az bicep build --file main.bicep
```

### Bicep Modules — שימוש חוזר בקוד

```bicep
// modules/vnet.bicep
param location string
param vnetName string
param addressPrefix string = '10.0.0.0/16'

resource vnet 'Microsoft.Network/virtualNetworks@2023-09-01' = {
  name: vnetName
  location: location
  properties: {
    addressSpace: {
      addressPrefixes: [addressPrefix]
    }
  }
}

output vnetId string = vnet.id
```

```bicep
// main.bicep
module network 'modules/vnet.bicep' = {
  name: 'networkDeployment'
  params: {
    location: resourceGroup().location
    vnetName: 'vnet-prod-weu'
  }
}
```

## Deployment Scopes

ARM/Bicep תומכים בפריסה בארבע רמות היררכיה שונות:

| Scope | פקודת CLI | שימוש טיפוסי |
|---|---|---|
| **Resource Group** | `az deployment group create` | רוב הפריסות היומיומיות |
| **Subscription** | `az deployment sub create` | יצירת Resource Groups עצמם, Policy ברמת Subscription |
| **Management Group** | `az deployment mg create` | Policy Governance ארגוני רחב |
| **Tenant** | `az deployment tenant create` | הגדרות גלובליות נדירות (Root-level Policy) |

## טיפים וטריקים

1. **תמיד הריצו `what-if` לפני `create`** בסביבת פרודקשן — זה חוסך טעויות יקרות:
   ```bash
   az deployment group what-if --resource-group rg-prod --template-file main.bicep
   ```
2. **השתמשו ב-`az group export`** כדי לייצא תבנית ARM ממשאבים קיימים — שימושי לתיעוד או ל-Reverse Engineering:
   ```bash
   az group export --name rg-demo > exported-template.json
   ```
3. **נעלו Resource Groups קריטיים** נגד מחיקה בטעות עם Resource Locks:
   ```bash
   az lock create --name DoNotDelete --resource-group rg-prod --lock-type CanNotDelete
   ```
4. **הפרידו Subscriptions לפי סביבה** (Dev/Staging/Prod) ולא רק לפי Resource Group — זה נותן גבול הרשאות וחיוב אמיתי, לא רק לוגי.
5. **השתמשו ב-Bicep Linter** (מובנה ב-VS Code Extension) לתפיסת שגיאות לפני הפריסה.

## שאלות נפוצות לתרגול עצמי

- מה ההבדל בין Subscription ל-Resource Group, ומה קובע את גבול המחיקה המשותפת?
- למה Bicep עדיף על ARM JSON, ומה קורה "מאחורי הקלעים" כשמפרסים קובץ Bicep?
- מהם ה-4 Deployment Scopes האפשריים ב-Azure Resource Manager?
- כיצד `what-if` יכול למנוע פריסה שגויה בפרודקשן?

## קישורים חיצוניים

**תיעוד רשמי:**
- Bicep - תיעוד מלא: https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/overview
- ARM Templates Overview: https://learn.microsoft.com/en-us/azure/azure-resource-manager/templates/overview
- Resource Groups Best Practices: https://learn.microsoft.com/en-us/azure/azure-resource-manager/management/manage-resource-groups-portal

**סרטוני YouTube מומלצים:**
- Adam Marczak - Bicep Crash Course: https://www.youtube.com/c/AdamMarczakAzureForEveryone
- freeCodeCamp - Azure Bicep Full Course: https://www.youtube.com/watch?v=s4c1kThTvW4
- John Savill's Technical Training - Bicep Deep Dive: https://www.youtube.com/c/NTFAQGuy

---
⬅️ המדריך הבא: [03-virtual-machines.md](/azure/03-virtual-machines/) — Azure Virtual Machines, Availability Sets/Zones ו-VM Scale Sets
