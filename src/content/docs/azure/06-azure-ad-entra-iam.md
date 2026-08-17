---
title: "Microsoft Entra ID, RBAC, Managed Identities ו-Service Principals"
category: Azure
part: 6/10
---

## מה זה Microsoft Entra ID?

**Microsoft Entra ID** (השם הנוכחי של **Azure Active Directory / Azure AD**, החל מ-2023) הוא שירות ניהול הזהויות וההרשאות (Identity and Access Management — IAM) של מיקרוסופט בענן. זהו רכיב הליבה שדרכו כל אימות (Authentication) והרשאה (Authorization) ב-Azure עוברים — משתמשים, אפליקציות ומכונות כאחד.

חשוב להבחין: **Microsoft Entra ID אינו זהה ל-Windows Server Active Directory (AD DS)** המסורתי — Entra ID הוא שירות מבוסס-ענן, פרוטוקולים מודרניים (OAuth 2.0, OpenID Connect, SAML), ואינו תומך ב-LDAP/Kerberos ישירות (לצורך זה קיים **Microsoft Entra Domain Services**).

### עקרונות מפתח

- **Tenant** — מופע ייעודי אחד של Entra ID המייצג ארגון; לכל Subscription יש בדיוק Tenant אחד מקושר.
- **Identity** — יכולה להיות **User** (משתמש אנושי), **Group** (קבוצה), **Service Principal** (זהות לאפליקציה) או **Managed Identity** (זהות מנוהלת למשאב Azure).
- **Zero Trust** — עיקרון אבטחה מרכזי: "לעולם אל תסמוך, תמיד תאמת" — כל בקשה מאומתת ומורשית מחדש, ללא הנחת אמון מובנית מבוססת מיקום רשת.

## Azure RBAC (Role-Based Access Control)

**RBAC** הוא מנגנון ההרשאות המרכזי ב-Azure, הקובע **מי** (Identity) יכול לבצע **מה** (Role) **על מה** (Scope).

```
                    Assignment
   Security Principal ────────────► Role Definition
   (User/Group/SP/MI)                (מה מותר לעשות)
            │                              
            │        על Scope מסוים:
            ▼
   Management Group > Subscription > Resource Group > Resource
```

### שלושת מרכיבי ה-RBAC

| מרכיב | תיאור |
|---|---|
| **Security Principal** | מי מבקש גישה — User, Group, Service Principal, Managed Identity |
| **Role Definition** | אוסף הרשאות (Permissions) — למשל "מה שמותר לקרוא/לכתוב/למחוק" |
| **Scope** | הגבול שעליו חל התפקיד — Management Group / Subscription / Resource Group / Resource בודד |

### תפקידים מובנים (Built-in Roles) נפוצים

| תפקיד | הרשאות |
|---|---|
| **Owner** | שליטה מלאה, כולל ניהול הרשאות (RBAC) |
| **Contributor** | יצירה/עריכה/מחיקה של משאבים, **ללא** יכולת לנהל הרשאות |
| **Reader** | צפייה בלבד, ללא יכולת שינוי |
| **User Access Administrator** | ניהול הרשאות RBAC בלבד, ללא יכולת לגעת במשאבים עצמם |

```bash
# הענקת תפקיד Contributor למשתמש ברמת Resource Group
az role assignment create \
  --assignee "user@espresso-club.co.il" \
  --role "Contributor" \
  --scope "/subscriptions/<sub-id>/resourceGroups/rg-webapp-prod-weu"

# צפייה בכל ה-Role Assignments הקיימים
az role assignment list --scope "/subscriptions/<sub-id>/resourceGroups/rg-webapp-prod-weu" --output table

# יצירת Custom Role (תפקיד מותאם אישית)
az role definition create --role-definition '{
  "Name": "Storage Reader Only",
  "Description": "קריאה בלבד מ-Storage Accounts",
  "Actions": [
    "Microsoft.Storage/storageAccounts/read",
    "Microsoft.Storage/storageAccounts/listkeys/action"
  ],
  "NotActions": [],
  "AssignableScopes": ["/subscriptions/<sub-id>"]
}'
```

> **עקרון Least Privilege:** תמיד להעניק את התפקיד המצומצם ביותר הנדרש, ובסקופ הצר ביותר האפשרי (Resource ספציפי > Resource Group > Subscription), במקום להעניק Owner ברמת Subscription "כדי שיעבוד".

## Service Principals

**Service Principal (SP)** הוא "זהות אפליקציה" — מייצג אפליקציה, סקריפט או שירות (ולא משתמש אנושי) שצריך להתחבר ל-Azure ולבצע פעולות, למשל צינור CI/CD המפרס משאבים.

```
App Registration (הגדרת האפליקציה ב-Entra ID)
        │
        ▼
Service Principal  (המופע המקומי בטננט המשמש להרשאות)
        │
        ├── Client ID (Application ID)
        ├── Tenant ID
        └── Client Secret / Certificate  (אימות)
```

```bash
# יצירת Service Principal עם תפקיד Contributor על Resource Group ספציפי
az ad sp create-for-rbac \
  --name "sp-github-actions-deploy" \
  --role Contributor \
  --scopes "/subscriptions/<sub-id>/resourceGroups/rg-webapp-prod-weu"

# הפלט מכיל: appId, password (client secret), tenant - לשמור ב-Secret Manager/GitHub Secrets!
```

```json
{
  "appId": "11111111-2222-3333-4444-555555555555",
  "displayName": "sp-github-actions-deploy",
  "password": "*** (client secret - לא נראה שוב) ***",
  "tenant": "66666666-7777-8888-9999-000000000000"
}
```

### שימוש ב-GitHub Actions

```yaml
# .github/workflows/deploy.yml
- name: Azure Login
  uses: azure/login@v2
  with:
    client-id: ${{ secrets.AZURE_CLIENT_ID }}
    tenant-id: ${{ secrets.AZURE_TENANT_ID }}
    subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
```

## Managed Identities — הדרך המומלצת ביותר

**Managed Identity (MI)** היא זהות המנוהלת אוטומטית על ידי Azure עבור משאב מסוים (VM, App Service, Function, AKS Pod וכו') — **ללא צורך באחסון סודות (Secrets/Passwords) בכלל**. Azure מטפל ברוטציה ובניהול המפתחות מאחורי הקלעים לחלוטין.

| סוג | תיאור |
|---|---|
| **System-Assigned** | נוצרת ונקשרת אוטומטית ל-Lifecycle של המשאב הספציפי; נמחקת יחד עם המשאב |
| **User-Assigned** | נוצרת כמשאב עצמאי, ניתן לשייך למספר משאבים במקביל, וחיה גם אם המשאב נמחק |

```bash
# הפעלת System-Assigned Managed Identity על VM קיים
az vm identity assign --resource-group rg-webapp-prod-weu --name vm-web01

# יצירת User-Assigned Managed Identity עצמאית
az identity create --resource-group rg-webapp-prod-weu --name id-shared-app

# הענקת הרשאת קריאה מ-Key Vault ל-Managed Identity
az role assignment create \
  --assignee <principal-id-of-managed-identity> \
  --role "Key Vault Secrets User" \
  --scope "/subscriptions/<sub-id>/resourceGroups/rg-webapp-prod-weu/providers/Microsoft.KeyVault/vaults/kv-prod"
```

```csharp
// דוגמת קוד .NET - שימוש ב-Managed Identity לגישה ל-Key Vault, ללא סודות בקוד
var client = new SecretClient(
    new Uri("https://kv-prod.vault.azure.net/"),
    new DefaultAzureCredential());
KeyVaultSecret secret = await client.GetSecretAsync("db-connection-string");
```

> **טיפ לראיון עבודה:** שאלה קלאסית היא "מתי תשתמשו ב-Managed Identity ומתי ב-Service Principal?" — התשובה: Managed Identity תמיד עדיף **כשעובדים בתוך Azure** (VM עד AKS), כי אין סודות לנהל בכלל. Service Principal נדרש כש**המקור אינו משאב Azure** — למשל CI/CD חיצוני (GitHub Actions, Jenkins) או אפליקציה מחוץ לענן.

## Conditional Access ו-MFA

**Conditional Access** מאפשר להגדיר מדיניות גישה דינמית לפי הקשר — לדוגמה "דרוש MFA אם ההתחברות מגיעה ממדינה לא מוכרת", או "חסום גישה ממכשירים לא-מנוהלים". זהו אחד הכלים המרכזיים למימוש Zero Trust בפועל.

```bash
# דוגמה (מבוצע בעיקר דרך Portal/Graph API, לא CLI מלא):
# מדיניות: דרוש MFA לכל הכניסות מנהלי Subscription
az ad conditional-access policy list  # דורש הרשאות Graph API מתאימות
```

## טיפים וטריקים

1. **העדיפו תמיד Managed Identity על Service Principal** כשהעבודה מתבצעת בתוך Azure — פחות סודות לניהול = פחות סיכון אבטחה.
2. **הימנעו לגמרי משימוש ב-Owner ברמת Subscription** לצוותי פיתוח — השתמשו בתפקידים ממוקדים יותר.
3. **סבבו (Rotate) Client Secrets של Service Principals** באופן קבוע, ושקלו Certificate-based Authentication במקום Secret.
4. **בדקו Access Reviews תקופתיים** — מנגנון מובנה ב-Entra ID לבדיקה תקופתית שהרשאות עדיין רלוונטיות ולא "נשכחו".
5. **השתמשו ב-PIM (Privileged Identity Management)** להרשאות זמניות (Just-In-Time) לתפקידים רגישים כמו Global Administrator.

## שאלות נפוצות לתרגול עצמי

- מה ההבדל בין Microsoft Entra ID ל-Windows Server Active Directory המסורתי?
- מהם שלושת המרכיבים של הענקת הרשאה ב-Azure RBAC?
- מתי תשתמשו ב-Managed Identity ומתי ב-Service Principal?
- מה ההבדל בין System-Assigned ל-User-Assigned Managed Identity?

## קישורים חיצוניים

**תיעוד רשמי:**
- Microsoft Entra ID - תיעוד: https://learn.microsoft.com/en-us/entra/fundamentals/whatis
- Azure RBAC - תיעוד מלא: https://learn.microsoft.com/en-us/azure/role-based-access-control/overview
- Managed Identities: https://learn.microsoft.com/en-us/entra/identity/managed-identities-azure-resources/overview

**סרטוני YouTube מומלצים:**
- John Savill's Technical Training - Entra ID Deep Dive: https://www.youtube.com/c/NTFAQGuy
- Adam Marczak - Azure RBAC Explained: https://www.youtube.com/c/AdamMarczakAzureForEveryone
- freeCodeCamp - Azure Identity and Security: https://www.youtube.com/watch?v=NKEFWyqJ5XA

---
⬅️ המדריך הבא: [07-app-service-functions.md](/azure/07-app-service-functions/) — Azure App Service, Azure Functions ו-Deployment Slots
