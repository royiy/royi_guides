---
title: "Azure Virtual Network (VNet), Subnets, NSG ו-Peering"
category: Azure
part: 4/10
---

## מה זה Azure Virtual Network?

**Azure Virtual Network (VNet)** הוא רכיב הרשת הבסיסי והחשוב ביותר ב-Azure — סביבת רשת פרטית ומבודדת לוגית, שבתוכה משאבים (VMs, App Service עם VNet Integration, AKS וכו') יכולים לתקשר ביניהם, עם האינטרנט, ועם רשתות On-Premises. VNet דומה מבחינה קונספטואלית ל-VPC ב-AWS.

VNet מוגדר בטווח כתובות פרטי (CIDR), לדוגמה `10.0.0.0/16`, ולאחר מכן מחולק ל-**Subnets** קטנים יותר — כל אחד עם טווח כתובות משלו.

### עקרונות מפתח

- **VNet מוגבל ל-Region בודד** — לא ניתן לפרוש VNet אחד על פני מספר Regions (לצורך זה משתמשים ב-VNet Peering או VPN Gateway).
- **בידוד לוגי מלא** — VNets שונים מבודדים זה מזה כברירת מחדל, גם אם הם באותו Subscription.
- **DNS מובנה** — Azure מספקת שרת DNS פנימי (Azure-provided DNS) לפתרון שמות בין משאבים בתוך ה-VNet, עם אפשרות להגדיר DNS Server מותאם אישית.

## ארכיטקטורת VNet ו-Subnets

```
VNet: vnet-prod-weu (10.0.0.0/16)
┌───────────────────────────────────────────────────┐
│                                                     │
│  Subnet: subnet-web (10.0.1.0/24)                  │
│  ┌─────────┐  ┌─────────┐                          │
│  │ vm-web01 │  │ vm-web02 │      NSG: nsg-web        │
│  └─────────┘  └─────────┘                          │
│                                                     │
│  Subnet: subnet-app (10.0.2.0/24)                  │
│  ┌─────────┐  ┌─────────┐                          │
│  │ vm-app01 │  │ vm-app02 │      NSG: nsg-app        │
│  └─────────┘  └─────────┘                          │
│                                                     │
│  Subnet: subnet-data (10.0.3.0/24)                 │
│  ┌─────────┐                                       │
│  │ SQL MI   │                    NSG: nsg-data       │
│  └─────────┘                                       │
│                                                     │
│  Subnet: GatewaySubnet (10.0.255.0/27)              │
│  (שמור לשימוש VPN/ExpressRoute Gateway בלבד)         │
└───────────────────────────────────────────────────┘
```

| רכיב | תיאור |
|---|---|
| **Address Space** | טווח ה-IP הכולל של ה-VNet, בפורמט CIDR |
| **Subnet** | חלוקה פנימית של ה-VNet, לרוב לפי שכבת אפליקציה (Web/App/Data) |
| **NSG** | חוקי Firewall ברמת Subnet או NIC |
| **Route Table (UDR)** | חוקי ניתוב מותאמים אישית (User Defined Routes) |
| **Service Endpoint / Private Endpoint** | חיבור פרטי מה-VNet לשירותי PaaS (Storage, SQL) ללא מעבר באינטרנט הציבורי |

### יצירת VNet ו-Subnets עם Azure CLI

```bash
az network vnet create \
  --resource-group rg-webapp-prod-weu \
  --name vnet-prod-weu \
  --address-prefix 10.0.0.0/16 \
  --subnet-name subnet-web \
  --subnet-prefix 10.0.1.0/24

az network vnet subnet create \
  --resource-group rg-webapp-prod-weu \
  --vnet-name vnet-prod-weu \
  --name subnet-app \
  --address-prefix 10.0.2.0/24

az network vnet subnet create \
  --resource-group rg-webapp-prod-weu \
  --vnet-name vnet-prod-weu \
  --name subnet-data \
  --address-prefix 10.0.3.0/24
```

> **שים לב:** Azure שומרת לעצמה 5 כתובות ראשונות בכל Subnet (לדוגמה ב-`10.0.1.0/24`: הרשת עצמה, Gateway, שתי כתובות DNS ו-Broadcast) — לכן `/24` נותן בפועל 251 כתובות שמישות ולא 256.

## Network Security Groups (NSG)

**NSG** הוא Firewall מבוזר ברמת Layer 3/4, המכיל רשימת חוקי Allow/Deny לתעבורה נכנסת (Inbound) ויוצאת (Outbound). ניתן לצרף NSG הן ל-Subnet והן ל-Network Interface בודד — כשמצורף לשניהם, שני החוקים מוערכים (evaluated) ברצף.

### מבנה חוק NSG

| שדה | תיאור | דוגמה |
|---|---|---|
| **Priority** | מספר בין 100-4096, נמוך יותר = עדיפות גבוהה יותר | 100 |
| **Source/Destination** | IP, CIDR, Tag (כמו `Internet`, `VirtualNetwork`) או Application Security Group | `Internet` |
| **Port** | פורט או טווח | `443` |
| **Protocol** | TCP/UDP/ICMP/Any | `TCP` |
| **Action** | Allow / Deny | `Allow` |

```bash
az network nsg create --resource-group rg-webapp-prod-weu --name nsg-web

# חוק לאפשר HTTPS מהאינטרנט
az network nsg rule create \
  --resource-group rg-webapp-prod-weu \
  --nsg-name nsg-web \
  --name Allow-HTTPS \
  --priority 100 \
  --direction Inbound \
  --access Allow \
  --protocol Tcp \
  --source-address-prefixes Internet \
  --destination-port-ranges 443

# חוק לחסום את כל שאר התעבורה הנכנסת (בד"כ קיים כברירת מחדל בעדיפות נמוכה)
az network nsg rule create \
  --resource-group rg-webapp-prod-weu \
  --nsg-name nsg-web \
  --name Deny-All-Inbound \
  --priority 4096 \
  --direction Inbound \
  --access Deny \
  --protocol '*' \
  --source-address-prefixes '*' \
  --destination-port-ranges '*'

# צירוף NSG ל-Subnet
az network vnet subnet update \
  --resource-group rg-webapp-prod-weu \
  --vnet-name vnet-prod-weu \
  --name subnet-web \
  --network-security-group nsg-web
```

Azure מגדיר גם **Default Security Rules** שלא ניתן למחוק (אך ניתן לעקוף עם חוק בעדיפות גבוהה יותר):

- `AllowVnetInBound` / `AllowVnetOutBound` — תעבורה בין משאבים באותו VNet מותרת כברירת מחדל.
- `AllowAzureLoadBalancerInBound` — תעבורת Health Probe מ-Load Balancer.
- `DenyAllInBound` — כל תעבורה נכנסת אחרת נחסמת כברירת מחדל (עדיפות 65500).

## VNet Peering

**VNet Peering** מחבר שני VNets (באותו Region או Regions שונים — Global Peering) כך שהם יכולים לתקשר ביניהם דרך רשת ה-Backbone של Microsoft, **ללא** מעבר באינטרנט הציבורי, ובלי צורך ב-VPN Gateway.

```
VNet A (10.0.0.0/16)  <---- Peering ---->  VNet B (10.1.0.0/16)
   (Hub - שירותים משותפים)                  (Spoke - אפליקציה)
```

### מאפייני Peering חשובים

- **Non-Transitive** — אם A מחובר ל-B, ו-B מחובר ל-C, זה **לא** אומר ש-A יכול לדבר עם C ישירות (אלא אם קיים Hub-and-Spoke עם NVA/Routing).
- **טווחי IP לא יכולים להתנגש** — שני VNets עם Overlapping Address Space לא ניתן לחבר ב-Peering.
- **Low Latency, High Bandwidth** — התעבורה עוברת ברשת הפיזית של מיקרוסופט, לא באינטרנט.

```bash
az network vnet peering create \
  --name peer-hub-to-spoke \
  --resource-group rg-network \
  --vnet-name vnet-hub \
  --remote-vnet vnet-spoke \
  --allow-vnet-access

az network vnet peering create \
  --name peer-spoke-to-hub \
  --resource-group rg-network \
  --vnet-name vnet-spoke \
  --remote-vnet vnet-hub \
  --allow-vnet-access
```

### ארכיטקטורת Hub-and-Spoke

תבנית נפוצה בארגונים גדולים — VNet מרכזי ("Hub") מכיל שירותים משותפים (Firewall, VPN Gateway, DNS), ו-VNets נוספים ("Spokes") לכל אפליקציה/צוות, כולם מחוברים ל-Hub דרך Peering:

```
                    ┌──────────────┐
                    │   Hub VNet    │
                    │ Firewall/VPN  │
                    └───┬──────┬───┘
              Peering   │      │   Peering
                 ┌───────┘      └───────┐
        ┌────────▼───────┐   ┌─────────▼──────┐
        │  Spoke VNet 1   │   │  Spoke VNet 2   │
        │  (App Team A)   │   │  (App Team B)   │
        └────────────────┘   └────────────────┘
```

## טיפים וטריקים

1. **תכננו CIDR מראש בזהירות** — טווחי כתובות חופפים בין VNets ימנעו Peering בעתיד; השתמשו במסמך IPAM ארגוני.
2. **השתמשו ב-Application Security Groups (ASG)** במקום IP קשיחים בחוקי NSG — מאפשר לקבץ VMs לפי תפקיד לוגי (Web/App/DB).
3. **הפעילו NSG Flow Logs** לניטור וניתוח תעבורה בפועל, קריטי לחקירת אירועי אבטחה:
   ```bash
   az network watcher flow-log create --location westeurope --nsg nsg-web --name flowlog-web --storage-account stlogsweu
   ```
4. **בדקו קישוריות עם Azure Network Watcher > IP Flow Verify** לפני שאתם מבזבזים זמן על Debug ידני.
5. **השתמשו ב-Private Endpoints** עבור שירותי PaaS (Storage, SQL, Key Vault) כדי למנוע חשיפה לאינטרנט הציבורי לחלוטין.

## שאלות נפוצות לתרגול עצמי

- מדוע VNet מוגבל ל-Region בודד, ואיך מחברים בין VNets ב-Regions שונים?
- מה זה Non-Transitive Peering, ואיך פותרים את הבעיה בארכיטקטורת Hub-and-Spoke?
- מהם ה-Default Security Rules הקיימים בכל NSG, וכיצד עוקפים אותם?
- מה ההבדל בין Service Endpoint ל-Private Endpoint?

## קישורים חיצוניים

**תיעוד רשמי:**
- Azure Virtual Network - תיעוד: https://learn.microsoft.com/en-us/azure/virtual-network/virtual-networks-overview
- Network Security Groups: https://learn.microsoft.com/en-us/azure/virtual-network/network-security-groups-overview
- VNet Peering: https://learn.microsoft.com/en-us/azure/virtual-network/virtual-network-peering-overview

**סרטוני YouTube מומלצים:**
- John Savill's Technical Training - Azure Networking Deep Dive: https://www.youtube.com/c/NTFAQGuy
- Adam Marczak - Azure Virtual Network Explained: https://www.youtube.com/c/AdamMarczakAzureForEveryone
- TechWorld with Nana - Networking Fundamentals: https://www.youtube.com/c/TechWorldwithNana

---
⬅️ המדריך הבא: [05-storage-accounts.md](/azure/05-storage-accounts/) — Storage Accounts, Blob/File/Queue/Table ו-Redundancy
