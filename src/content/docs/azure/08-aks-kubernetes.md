---
title: "Azure Kubernetes Service (AKS) - ארכיטקטורה ואינטגרציה עם ACR"
category: Azure
part: 8/10
---

## מה זה Azure Kubernetes Service?

**Azure Kubernetes Service (AKS)** הוא שירות Kubernetes מנוהל של Azure — מיקרוסופט מנהלת עבורכם את **Control Plane** (API Server, etcd, Scheduler, Controller Manager) **בחינם**, ואתם משלמים רק על ה-**Worker Nodes** (VMs) שמריצים את העומסים בפועל.

AKS חוסך את המורכבות התפעולית העצומה של הקמת קלאסטר Kubernetes מאפס (Bootstrap, אבטחת etcd, שדרוגי גרסה של ה-Control Plane), ומאפשר להתמקד בפריסת אפליקציות בלבד.

### עקרונות מפתח

- **Managed Control Plane** — Azure אחראית על זמינות, שדרוגים ותיקוני אבטחה של ה-Control Plane.
- **Node Pools** — קבוצות VMs נפרדות בתוך אותו קלאסטר, כל אחת עם VM Size וקונפיגורציה משלה.
- **Integration עמוקה עם Azure** — AKS משתלב טבעית עם Entra ID, ACR, Azure Monitor, Load Balancer, Managed Disks ו-VNet.

## ארכיטקטורת AKS

```
                     Azure-Managed (חינם)
              ┌───────────────────────────────┐
              │        Control Plane           │
              │  API Server │ etcd │ Scheduler │
              └───────────────┬───────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
┌───────▼────────┐  ┌────────▼───────┐  ┌──────────▼──────┐
│  System Node    │  │  User Node      │  │  User Node       │
│  Pool           │  │  Pool (app-1)   │  │  Pool (app-2 GPU)│
│  (kube-system)  │  │                │  │                  │
│  Standard_D2s   │  │  Standard_D4s   │  │  Standard_NC6s   │
└────────────────┘  └────────────────┘  └──────────────────┘
        אתם משלמים רק על ה-Node Pools (Worker VMs)
```

| רכיב | תיאור |
|---|---|
| **System Node Pool** | מריץ Pods קריטיים למערכת (`kube-system`, `coredns`, `metrics-server`); מומלץ שלא להריץ עליו אפליקציות |
| **User Node Pool** | מיועד לעומסי העבודה שלכם; ניתן ליצור מספר Pools עם VM Sizes שונים (רגיל, GPU, Spot) |
| **Virtual Node / Node Autoprovisioning** | הרחבת קיבולת אלסטית דרך Azure Container Instances או אוטומציית provisioning |
| **kubelet Identity** | Managed Identity המשמשת את הקלאסטר לגישה למשאבי Azure אחרים |

## יצירת קלאסטר AKS

```bash
# יצירת קלאסטר AKS בסיסי עם Managed Identity
az aks create \
  --resource-group rg-aks-prod-weu \
  --name aks-espresso-prod \
  --location westeurope \
  --node-count 3 \
  --node-vm-size Standard_D4s_v5 \
  --enable-managed-identity \
  --network-plugin azure \
  --enable-addons monitoring \
  --generate-ssh-keys \
  --zones 1 2 3

# חיבור kubectl לקלאסטר
az aks get-credentials --resource-group rg-aks-prod-weu --name aks-espresso-prod

# בדיקת החיבור
kubectl get nodes

# הוספת Node Pool נוסף (למשל ל-Spot Instances)
az aks nodepool add \
  --resource-group rg-aks-prod-weu \
  --cluster-name aks-espresso-prod \
  --name spotpool \
  --priority Spot \
  --eviction-policy Delete \
  --spot-max-price -1 \
  --node-count 2 \
  --node-vm-size Standard_D4s_v5 \
  --labels workload=batch
```

## Cluster Autoscaler

```bash
az aks nodepool update \
  --resource-group rg-aks-prod-weu \
  --cluster-name aks-espresso-prod \
  --name nodepool1 \
  --enable-cluster-autoscaler \
  --min-count 2 \
  --max-count 10
```

## אינטגרציה עם Azure Container Registry (ACR)

**ACR** הוא רישום Docker Images פרטי של Azure — מקביל ל-Docker Hub, אך מנוהל בתוך הענן שלכם, עם אינטגרציית אבטחה ו-RBAC מלאה מול Entra ID.

```bash
# יצירת ACR
az acr create \
  --resource-group rg-aks-prod-weu \
  --name acrespressoclub \
  --sku Standard \
  --admin-enabled false

# Build ו-Push של Image ישירות ב-ACR (ללא Docker מקומי)
az acr build \
  --registry acrespressoclub \
  --image orders-api:v1.2.0 \
  .

# חיבור AKS ל-ACR - מעניק הרשאת AcrPull אוטומטית ל-Managed Identity של הקלאסטר
az aks update \
  --resource-group rg-aks-prod-weu \
  --name aks-espresso-prod \
  --attach-acr acrespressoclub
```

```
┌──────────────┐   docker push   ┌──────────────┐   AcrPull role   ┌──────────────┐
│  CI Pipeline   │ ───────────────►  │  ACR           │ ◄─────────────────  │  AKS Cluster   │
│  (Build/Test)  │                  │ acrespressoclub│    (Managed Identity)  │ Pulls Images   │
└──────────────┘                  └──────────────┘                    └──────────────┘
```

לאחר החיבור (`--attach-acr`), Pods בקלאסטר יכולים למשוך Images מ-ACR **ללא Secrets** (`imagePullSecrets`) כלל — ההרשאה מתבצעת דרך Managed Identity ברמת ה-Node.

```yaml
# deployment.yaml - שימוש ב-Image מ-ACR
apiVersion: apps/v1
kind: Deployment
metadata:
  name: orders-api
  namespace: production
spec:
  replicas: 3
  selector:
    matchLabels:
      app: orders-api
  template:
    metadata:
      labels:
        app: orders-api
    spec:
      containers:
        - name: orders-api
          image: acrespressoclub.azurecr.io/orders-api:v1.2.0
          ports:
            - containerPort: 8080
          resources:
            requests:
              cpu: "250m"
              memory: "256Mi"
            limits:
              cpu: "500m"
              memory: "512Mi"
```

## Networking ב-AKS

| מודל | תיאור |
|---|---|
| **Kubenet** | פשוט יותר, IPs ל-Pods מוקצים מטווח נפרד מה-VNet (NAT פנימי) |
| **Azure CNI** | כל Pod מקבל IP אמיתי מה-VNet — אינטגרציה מלאה עם NSG, Peering ו-Private Endpoints, אך "צורך" יותר כתובות IP |
| **Azure CNI Overlay** | שילוב — Pods מקבלים IP מטווח Overlay נפרד, פחות צריכה של כתובות VNet תוך שמירת יתרונות CNI |

## אבטחה: RBAC וזהויות ב-AKS

```bash
# הפעלת Entra ID Integration + Azure RBAC לניהול הרשאות Kubernetes
az aks create \
  --resource-group rg-aks-prod-weu \
  --name aks-espresso-prod \
  --enable-aad \
  --enable-azure-rbac \
  --aad-admin-group-object-ids <group-id>

# הענקת הרשאה ל-namespace ספציפי דרך Azure RBAC
az role assignment create \
  --assignee <user-or-group-id> \
  --role "Azure Kubernetes Service RBAC Reader" \
  --scope "/subscriptions/<sub-id>/resourceGroups/rg-aks-prod-weu/providers/Microsoft.ContainerService/managedClusters/aks-espresso-prod"
```

**Workload Identity** (יורש את Pod Identity הישן) מאפשרת ל-Pods ספציפיים לקבל Managed Identity משלהם, ללגשת לשירותי Azure אחרים (Key Vault, Storage) ללא Secrets:

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: orders-api-sa
  namespace: production
  annotations:
    azure.workload.identity/client-id: "<managed-identity-client-id>"
```

## שדרוג גרסאות (Upgrade)

```bash
# בדיקת גרסאות זמינות לשדרוג
az aks get-upgrades --resource-group rg-aks-prod-weu --name aks-espresso-prod --output table

# שדרוג Control Plane וכל ה-Node Pools
az aks upgrade --resource-group rg-aks-prod-weu --name aks-espresso-prod --kubernetes-version 1.30.0

# שדרוג Node Pool בודד עם Surge (Rolling Update ללא Downtime)
az aks nodepool update \
  --resource-group rg-aks-prod-weu \
  --cluster-name aks-espresso-prod \
  --name nodepool1 \
  --max-surge 33%
```

## טיפים וטריקים

1. **הפרידו System Node Pool מ-User Node Pools** — מונע מצב שבו עומס אפליקציה "חונק" רכיבי מערכת קריטיים כמו CoreDNS.
2. **השתמשו ב-`az aks update --attach-acr`** במקום ליצור `imagePullSecrets` ידניים — פחות סודות לניהול ופחות תחזוקה.
3. **הפעילו Azure Policy for AKS** לאכיפת Best Practices (למשל חסימת Images מ-Registries לא מאושרים).
4. **תזמנו Maintenance Windows** לשדרוגים אוטומטיים, כדי שלא יתרחשו בשעות עומס:
   ```bash
   az aks maintenanceconfiguration add -g rg-aks-prod-weu --cluster-name aks-espresso-prod -n default --weekday Sunday --start-hour 2
   ```
5. **השתמשו ב-Spot Node Pools** לעומסי Batch/CI לחיסכון משמעותי בעלויות, בשילוב Taints/Tolerations כדי למנוע ריצת אפליקציות קריטיות שם.

## שאלות נפוצות לתרגול עצמי

- מה ההבדל בין Control Plane ל-Node Pools מבחינת עלות ואחריות ניהול?
- כיצד AKS מתחבר ל-ACR ללא Image Pull Secrets ידניים?
- מה ההבדל בין Kubenet ל-Azure CNI ברמת הקצאת IP ל-Pods?
- מה זה Workload Identity ולמה הוא עדיף על שיטות ישנות יותר לגישת Pods למשאבי Azure?

## קישורים חיצוניים

**תיעוד רשמי:**
- Azure Kubernetes Service - תיעוד: https://learn.microsoft.com/en-us/azure/aks/what-is-aks
- AKS Networking Concepts: https://learn.microsoft.com/en-us/azure/aks/concepts-network
- Azure Container Registry: https://learn.microsoft.com/en-us/azure/container-registry/container-registry-intro

**סרטוני YouTube מומלצים:**
- TechWorld with Nana - AKS Crash Course: https://www.youtube.com/c/TechWorldwithNana
- John Savill's Technical Training - AKS Deep Dive: https://www.youtube.com/c/NTFAQGuy
- Adam Marczak - Azure Kubernetes Service Explained: https://www.youtube.com/c/AdamMarczakAzureForEveryone

---
⬅️ המדריך הבא: [09-monitoring-azure-monitor.md](/azure/09-monitoring-azure-monitor/) — Azure Monitor, Log Analytics, Application Insights ו-Alerts
