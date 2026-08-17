---
title: "Google Kubernetes Engine (GKE) - ארכיטקטורה וניהול Clusters"
category: GCP
part: 6/10
---

## מה זה GKE?

Google Kubernetes Engine (GKE) הוא שירות ה-Kubernetes המנוהל של GCP. חשוב לזכור: **גוגל היא זו שיצרה את Kubernetes** (מבוסס על מערכת פנימית בשם Borg), ולכן GKE נחשב לרוב לבשל ומשולב ביותר בין שירותי ה-Managed Kubernetes המובילים בשוק (לצד EKS ב-AWS ו-AKS ב-Azure).

GKE מנהל עבורכם את שכבת ה-Control Plane (API Server, etcd, Scheduler, Controller Manager) — אתם מתמקדים רק בהגדרת ה-Workloads וה-Nodes (במצב Standard) או אפילו לא בזה (במצב Autopilot).

### עקרונות מפתח

- **Control Plane מנוהל לחלוטין** — גוגל אחראית על עדכוני גרסה, Patching, זמינות גבוהה וגיבוי של ה-etcd.
- **Node Pools** — קבוצות של Nodes עם אותה תצורה (Machine Type, Disk, Labels) — מאפשר להריץ Workloads שונים על חומרה שונה באותו Cluster.
- **Workload Identity** — מנגנון המחליף Service Account Keys סטטיים בקישור מאובטח בין Kubernetes Service Account ל-GCP Service Account.
- **Release Channels** — Rapid/Regular/Stable — קובעים באיזה קצב GKE מעדכן את גרסת ה-Cluster אוטומטית.

## Autopilot לעומת Standard

| היבט | GKE Standard | GKE Autopilot |
|---|---|---|
| **ניהול Nodes** | אתם מנהלים (Node Pools, Sizing, Scaling) | גוגל מנהלת לחלוטין |
| **מודל תמחור** | לפי VM (Node) שרץ | לפי Pod (CPU/Memory/Storage בפועל שהוקצה) |
| **גמישות תצורה** | מלאה - גישה ל-Node OS, DaemonSets, Privileged Pods | מוגבלת - אבטחה ו-Best Practices אכופים |
| **Autoscaling** | ידני להגדיר (Cluster Autoscaler + HPA) | אוטומטי לחלוטין, כולל Node Provisioning |
| **מתאים ל-** | עומסים מורכבים, Custom Networking, GPU מיוחד | רוב האפליקציות, פחות תפעול, Best Practices מובנה |

## ארכיטקטורה

```
                     GKE Cluster: "espresso-prod-cluster"
   +--------------------------------------------------------------+
   |  Control Plane (מנוהל ע"י גוגל - Google-managed VPC)          |
   |  API Server | etcd | Scheduler | Controller Manager            |
   +--------------------------------------------------------------+
                                |
                         kubectl / gcloud
                                |
   +--------------------------------------------------------------+
   |  Node Pool: "default-pool"       Node Pool: "gpu-pool"          |
   |  +-----------+  +-----------+    +-----------+                 |
   |  |  Node 1   |  |  Node 2   |    |  Node w/GPU|                 |
   |  | Pod | Pod |  | Pod | Pod |    | Pod (ML)   |                 |
   |  +-----------+  +-----------+    +-----------+                 |
   +--------------------------------------------------------------+
```

| רכיב | תיאור |
|---|---|
| **Cluster** | היחידה הראשית - Control Plane + Node Pools |
| **Node Pool** | קבוצת Nodes בעלי תצורה זהה בתוך Cluster |
| **Workload Identity** | מיפוי בין K8s ServiceAccount ל-GCP ServiceAccount, ללא מפתחות |
| **GKE Ingress / Gateway API** | אינטגרציה מובנית עם Cloud Load Balancing |
| **Binary Authorization** | אכיפת חתימת אימג'ים לפני פריסה (Supply Chain Security) |

## יצירה וניהול Cluster דרך gcloud

### יצירת Cluster - Standard

```bash
gcloud container clusters create espresso-prod-cluster \
  --zone=europe-west3-a \
  --num-nodes=3 \
  --machine-type=e2-standard-4 \
  --enable-autoscaling --min-nodes=2 --max-nodes=6 \
  --enable-ip-alias \
  --workload-pool=espresso-prod-2026.svc.id.goog \
  --release-channel=regular
```

### יצירת Cluster - Autopilot

```bash
gcloud container clusters create-auto espresso-autopilot-cluster \
  --region=europe-west3
```

### חיבור ל-Cluster וניהול בסיסי

```bash
# קבלת credentials עדכניים ל-kubeconfig
gcloud container clusters get-credentials espresso-prod-cluster \
  --zone=europe-west3-a

# בדיקת Nodes
kubectl get nodes

# רשימת Node Pools
gcloud container node-pools list --cluster=espresso-prod-cluster --zone=europe-west3-a

# הוספת Node Pool נוסף (למשל עם GPU)
gcloud container node-pools create gpu-pool \
  --cluster=espresso-prod-cluster \
  --zone=europe-west3-a \
  --machine-type=n1-standard-4 \
  --accelerator=type=nvidia-tesla-t4,count=1 \
  --num-nodes=1

# שדרוג גרסת Control Plane
gcloud container clusters upgrade espresso-prod-cluster \
  --zone=europe-west3-a --master
```

### פריסת Deployment ו-Service בסיסי

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web-app
  template:
    metadata:
      labels:
        app: web-app
    spec:
      serviceAccountName: web-ksa
      containers:
        - name: web-app
          image: gcr.io/espresso-prod-2026/web-app:v1.2
          ports:
            - containerPort: 8080
          resources:
            requests:
              cpu: "250m"
              memory: "256Mi"
            limits:
              cpu: "500m"
              memory: "512Mi"
---
apiVersion: v1
kind: Service
metadata:
  name: web-app-service
spec:
  type: LoadBalancer
  selector:
    app: web-app
  ports:
    - port: 80
      targetPort: 8080
```

```bash
kubectl apply -f deployment.yaml
kubectl get pods -w
kubectl get svc web-app-service
```

### הגדרת Workload Identity

```bash
# יצירת GCP Service Account
gcloud iam service-accounts create web-gsa

# קישור בין K8s ServiceAccount ל-GCP ServiceAccount
gcloud iam service-accounts add-iam-policy-binding \
  web-gsa@espresso-prod-2026.iam.gserviceaccount.com \
  --role="roles/iam.workloadIdentityUser" \
  --member="serviceAccount:espresso-prod-2026.svc.id.goog[default/web-ksa]"

kubectl annotate serviceaccount web-ksa \
  --namespace default \
  iam.gke.io/gcp-service-account=web-gsa@espresso-prod-2026.iam.gserviceaccount.com
```

## טיפים וטריקים

1. **התחילו עם Autopilot כברירת מחדל** אלא אם יש צורך אמיתי ב-DaemonSets, Privileged Pods, או Node-level customization — פחות תחזוקה ותקורה תפעולית.
2. **תמיד הפעילו Workload Identity** — לעולם אל תשתמשו במפתחות JSON סטטיים בתוך Pods לגישה ל-GCP APIs.
3. **השתמשו ב-`kubectl get events --sort-by='.lastTimestamp'`** לדיבוג מהיר של בעיות Scheduling או CrashLoopBackOff.
4. **הגדירו Resource Requests/Limits תמיד** — GKE Autopilot דורש זאת, ו-Standard בלעדיהם עלול לגרום ל-Node Overcommit.
5. **בדקו Release Channel** — Regular מומלץ לרוב הסביבות (איזון בין יציבות לעדכניות); Stable לעומסים קריטיים שדורשים מינימום שינויים.

## שאלות נפוצות לתרגול עצמי

- מה ההבדל המרכזי בין GKE Autopilot ל-GKE Standard מבחינת תפעול ותמחור?
- מהו Workload Identity ולמה הוא עדיף על שימוש במפתחות Service Account בתוך Pods?
- מה תפקידו של Node Pool, ומתי כדאי ליצור יותר מאחד ב-Cluster?
- מהם Release Channels וכיצד הם משפיעים על אסטרטגיית עדכון הגרסאות?

## קישורים חיצוניים

**תיעוד רשמי:**
- GKE Documentation: https://cloud.google.com/kubernetes-engine/docs
- Autopilot Overview: https://cloud.google.com/kubernetes-engine/docs/concepts/autopilot-overview
- Workload Identity: https://cloud.google.com/kubernetes-engine/docs/how-to/workload-identity

**סרטוני YouTube מומלצים:**
- Google Cloud Tech - GKE Fundamentals: https://www.youtube.com/c/googlecloudtech
- freeCodeCamp - Kubernetes on GCP: https://www.youtube.com/watch?v=fZOz13joN0k
- TechWorld with Nana - GKE Explained: https://www.youtube.com/c/TechWorldwithNana

---
⬅️ המדריך הבא: [07-serverless-functions-run.md](/gcp/07-serverless-functions-run/) — Cloud Functions ו-Cloud Run (Serverless)
