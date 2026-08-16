---
title: "מבוא ל-Kubernetes וארכיטקטורה"
category: DevOps/Kubernetes
part: 1/10
---

## תוכן עניינים
1. [מה זה Kubernetes ולמה צריך אותו](#מה-זה-kubernetes)
2. [ארכיטקטורת Kubernetes](#ארכיטקטורה)
3. [רכיבי Control Plane](#control-plane)
4. [רכיבי Worker Node](#worker-node)
5. [התקנה מקומית עם Minikube / kind](#התקנה-מקומית)
6. [פקודות kubectl בסיסיות](#פקודות-בסיסיות)
7. [דוגמת YAML ראשונה](#דוגמת-yaml)
8. [טיפים וטריקים](#טיפים-וטריקים)
9. [שאלות ראיון עבודה](#שאלות-ראיון-עבודה)
10. [קישורים חיצוניים](#קישורים)

---

## מה זה Kubernetes ולמה צריך אותו {#מה-זה-kubernetes}

Kubernetes (מקוצר **K8s** - האות K, 8 אותיות, והאות s) הוא מערכת קוד-פתוח (open source) לניהול, תזמור (orchestration) והרצה של אפליקציות בקונטיינרים (containers) בקנה מידה גדול. המערכת פותחה במקור בגוגל, על בסיס ניסיון של שנים עם מערכת פנימית בשם Borg, ומאז 2014 היא מתוחזקת על ידי קרן ה-CNCF (Cloud Native Computing Foundation).

### הבעיה שקוברנטיס פותרת

כאשר יש לכם אפליקציה אחת שרצה בקונטיינר Docker בודד, קל לנהל אותה ידנית. אבל כשיש עשרות או מאות מיקרו-שירותים (microservices), שצריכים:

- **לעלות אוטומטית** אם קרסו (self-healing)
- **להתאזן בעומס** (load balancing) בין כמה עותקים
- **לגדול ולהתכווץ** בהתאם לעומס (auto-scaling)
- **להתעדכן** בלי downtime (rolling updates)
- **לתקשר** אחד עם השני בצורה מסודרת (service discovery)
- **לנהל סודות והגדרות** בצורה מאובטחת

...אז אי אפשר לעשות זאת ידנית, ופה נכנס Kubernetes לתמונה. הוא מספק שכבת הפשטה (abstraction layer) מעל שרתים פיזיים/וירטואליים, ומאפשר לכם "להצהיר" (declare) איך האפליקציה אמורה להיראות - וקוברנטיס דואג שהמצב בפועל (actual state) יתאים למצב הרצוי (desired state) כל הזמן.

### עקרון ה-Declarative Configuration

זהו אחד העקרונות המרכזיים ביותר בקוברנטיס: במקום לתת פקודות שלב-אחר-שלב (imperative), אתם כותבים קובץ YAML שמתאר את המצב הרצוי, ושולחים אותו ל-API של קוברנטיס. קוברנטיס משתמש ב"לולאת פיוס" (Reconciliation Loop) שמריצה כל הזמן בקרים (Controllers) שבודקים: "האם המצב בפועל תואם למה שהוגדר? אם לא - לתקן".

---

## ארכיטקטורת Kubernetes {#ארכיטקטורה}

קלאסטר (Cluster) של Kubernetes בנוי משני סוגי מכונות עיקריים:

```
┌───────────────────────────────────────────────────────────┐
│                        CONTROL PLANE                        │
│  ┌───────────┐ ┌─────────────┐ ┌──────────┐ ┌────────────┐ │
│  │ API Server│ │  Scheduler  │ │ Controller│ │    etcd    │ │
│  │           │ │             │ │  Manager  │ │(מסד נתונים)│ │
│  └───────────┘ └─────────────┘ └──────────┘ └────────────┘ │
└───────────────────────────────────────────────────────────┘
                            │
          ┌─────────────────┼─────────────────┐
          ▼                 ▼                 ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│   WORKER NODE 1   │ │   WORKER NODE 2   │ │   WORKER NODE 3   │
│ ┌───────┐┌───────┐│ │ ┌───────┐┌───────┐│ │ ┌───────┐┌───────┐│
│ │kubelet││ kube-  ││ │ │kubelet││ kube-  ││ │ │kubelet││ kube-  ││
│ │       ││ proxy  ││ │ │       ││ proxy  ││ │ │       ││ proxy  ││
│ └───────┘└───────┘│ │ └───────┘└───────┘│ │ └───────┘└───────┘│
│    [ Pods... ]     │ │    [ Pods... ]     │ │    [ Pods... ]     │
└──────────────────┘ └──────────────────┘ └──────────────────┘
```

## רכיבי Control Plane {#control-plane}

ה-Control Plane (מישור הבקרה) הוא "המוח" של הקלאסטר. הוא מקבל החלטות גלובליות (איפה להריץ Pods, מתי להפעיל בקרים חדשים) ומזהה ומגיב לאירועים בקלאסטר.

### 1. kube-apiserver
השער הראשי לקלאסטר. כל בקשה - בין אם מ-`kubectl`, מ-Dashboard, או מבקר פנימי - עוברת דרך ה-API Server. הוא חושף REST API ומאמת (authenticate) ומרשה (authorize) כל בקשה.

### 2. etcd
מסד נתונים מסוג key-value מבוזר, שבו נשמר **כל** המצב של הקלאסטר - כל ה-Pods, Services, Secrets וכו'. זהו "מקור האמת היחיד" (single source of truth). גיבוי של etcd = גיבוי של כל הקלאסטר.

### 3. kube-scheduler
אחראי להחליט על איזה Node כל Pod חדש (שעדיין לא שובץ) ירוץ. ההחלטה מתבססת על דרישות משאבים (CPU/Memory), affinity/anti-affinity rules, taints/tolerations ועוד.

### 4. kube-controller-manager
מריץ תהליכי בקרה (controllers) שונים שמריצים את "לולאת הפיוס": Node Controller, Replication Controller, Endpoints Controller, Job Controller ועוד.

### 5. cloud-controller-manager
מקשר בין הקלאסטר לבין ה-API הספציפי של ספק הענן (AWS, GCP, Azure) - למשל יצירת Load Balancer בענן כשיוצרים Service מסוג LoadBalancer.

## רכיבי Worker Node {#worker-node}

כל Worker Node הוא מכונה (וירטואלית או פיזית) שמריצה בפועל את הקונטיינרים שלכם.

### 1. kubelet
"הסוכן" שרץ על כל Node. הוא מדבר עם ה-API Server, מקבל הוראות (PodSpecs) ומוודא שהקונטיינרים שמתוארים בהם אכן רצים ובריאים. הוא **לא** מנהל קונטיינרים שלא נוצרו על ידי Kubernetes.

### 2. kube-proxy
אחראי על חוקי הרשת ב-Node שמאפשרים תקשורת רשת אל ה-Pods, בין אם מתוך הקלאסטר או מחוצה לו. הוא מיישם את מושג ה-Service באמצעות iptables או IPVS.

### 3. Container Runtime
התוכנה שמריצה בפועל את הקונטיינרים - כיום הכי נפוץ הוא **containerd**, ויש גם **CRI-O**. שימו לב: Docker Engine עצמו הוסר כ-runtime ישיר ב-Kubernetes 1.24 (dockershim הוסר), אך תמונות (images) בפורמט Docker עדיין נתמכות במלואן.

---

## התקנה מקומית עם Minikube / kind {#התקנה-מקומית}

לצורך לימוד ופיתוח, לא צריך קלאסטר אמיתי בענן. שתי האופציות הפופולריות ביותר:

### Minikube
```bash
# התקנה (macOS עם brew)
brew install minikube

# הפעלת קלאסטר מקומי
minikube start --driver=docker

# בדיקת סטטוס
minikube status

# פתיחת Dashboard גרפי
minikube dashboard

# עצירת הקלאסטר
minikube stop
```

### kind (Kubernetes IN Docker)
```bash
# התקנה
brew install kind

# יצירת קלאסטר
kind create cluster --name my-cluster

# מחיקת קלאסטר
kind delete cluster --name my-cluster
```

### התקנת kubectl
```bash
# macOS
brew install kubectl

# בדיקת גרסה וחיבור לקלאסטר
kubectl version --client
kubectl cluster-info
```

---

## פקודות kubectl בסיסיות {#פקודות-בסיסיות}

```bash
# הצגת כל ה-Nodes בקלאסטר
kubectl get nodes

# הצגת כל ה-Pods בכל ה-Namespaces
kubectl get pods --all-namespaces

# מידע מפורט על Node ספציפי
kubectl describe node <node-name>

# הצגת רכיבי Control Plane (ב-Namespace kube-system)
kubectl get pods -n kube-system

# מידע כללי על הקלאסטר
kubectl cluster-info

# צפייה בלוגים חיים של רכיב מסוים
kubectl logs -n kube-system <pod-name> -f

# הצגת כל ה-API Resources הזמינים
kubectl api-resources

# הצגת ה-context הנוכחי וה-namespace
kubectl config current-context
kubectl config get-contexts
```

---

## דוגמת YAML ראשונה {#דוגמת-yaml}

כל אובייקט ב-Kubernetes מתואר ב-YAML עם ארבעה שדות עיקריים: `apiVersion`, `kind`, `metadata`, `spec`.

```yaml
# namespace.yaml - יצירת Namespace לוגי לבידוד סביבות
apiVersion: v1
kind: Namespace
metadata:
  name: dev-environment
  labels:
    env: development
```

```bash
# החלת (apply) הקובץ על הקלאסטר
kubectl apply -f namespace.yaml

# בדיקה שנוצר
kubectl get namespaces

# מחיקה
kubectl delete -f namespace.yaml
```

---

## טיפים וטריקים {#טיפים-וטריקים}

1. **השתמשו ב-aliasing**: הוסיפו ל-`.bashrc`/`.zshrc` שורה `alias k=kubectl` כדי לחסוך הקלדה.
2. **auto-completion**: הפעילו השלמה אוטומטית עם `source <(kubectl completion zsh)` (או bash).
3. **צפייה חיה בשינויים**: `kubectl get pods -w` (watch) מציג שינויים בזמן אמת בלי לרוץ בלולאה.
4. **פלט JSON לסקריפטים**: `kubectl get pods -o json | jq '.items[].metadata.name'` שימושי מאוד לאוטומציה.
5. **הבנת ה-desired vs actual state**: כשמשהו "תקוע", תמיד תשאלו קודם "מה המצב הרצוי?" ואז "מה המצב בפועל?" - הפער ביניהם הוא המפתח לדיבאג.
6. **etcd הוא קריטי**: בקלאסטר production, תמיד תוודאו שיש גיבויים סדירים ל-etcd - זהו נקודת הכשל היחידה (single point of failure) האמיתית.

---

## שאלות ראיון עבודה {#שאלות-ראיון-עבודה}

**ש: מה ההבדל בין Control Plane ל-Worker Node?**
ת: ה-Control Plane מקבל החלטות גלובליות על הקלאסטר (תזמון, בקרה, שמירת מצב), בעוד Worker Nodes הם המכונות שבפועל מריצות את הקונטיינרים (Pods) של האפליקציות.

**ש: מה תפקידו של etcd, ומה קורה אם הוא קורס?**
ת: etcd הוא מסד הנתונים המבוזר ששומר את כל מצב הקלאסטר. אם הוא קורס לחלוטין ואין גיבוי - הקלאסטר "שוכח" את כל ההגדרות שלו (אם כי ה-Pods שכבר רצים ימשיכו לרוץ עד להפעלה מחדש, אך לא ניתן יהיה לנהל אותם).

**ש: מה ההבדל בין kubelet ל-kube-proxy?**
ת: kubelet אחראי על הרצת קונטיינרים בפועל ב-Node ובדיקת תקינותם (health checks), בעוד kube-proxy אחראי על ניתוב תעבורת רשת בין Services ל-Pods.

**ש: מהו ה-Reconciliation Loop?**
ת: זהו הדפוס הבסיסי שעליו מבוססים כל הבקרים (Controllers) בקוברנטיס - לולאה אינסופית שמשווה כל הזמן בין ה-desired state (מה שהוגדר ב-YAML) לבין ה-actual state (מה שקורה בפועל), ומתקנת פערים.

**ש: מה קרה ל-Docker כ-Container Runtime בגרסאות חדשות?**
ת: החל מ-Kubernetes 1.24 הוסר תמיכה ישירה ב-dockershim, וה-runtime ברירת המחדל הוא containerd (או CRI-O). זה לא משפיע על היכולת להריץ תמונות Docker - רק על ה-runtime ברמת ה-Node.

**ש: מה ההבדל בין Minikube ל-kind?**
ת: Minikube מריץ VM (או קונטיינר) יחיד שמדמה קלאסטר שלם; kind מריץ כל Node של הקלאסטר כקונטיינר Docker נפרד, מה שמקל על סימולציה של קלאסטרים multi-node.

---

## קישורים חיצוניים {#קישורים}

### תיעוד רשמי
- מבוא ל-Kubernetes: https://kubernetes.io/docs/concepts/overview/
- רכיבי הקלאסטר: https://kubernetes.io/docs/concepts/overview/components/
- kubectl Cheat Sheet: https://kubernetes.io/docs/reference/kubectl/cheatsheet/
- Minikube: https://minikube.sigs.k8s.io/docs/start/
- kind: https://kind.sigs.k8s.io/docs/user/quick-start/

### סרטוני YouTube
- TechWorld with Nana - Kubernetes Crash Course: https://www.youtube.com/c/techworldwithnana
- קורס מלא (פלייליסט): https://www.youtube.com/playlist?list=PLy7NrYWoggjziYQIDorlXjTvvwweTYoNC
- freeCodeCamp - Kubernetes Course for Beginners: https://www.youtube.com/watch?v=d6WC5n9G_sM

---

**המשך למדריך הבא:** [מדריך 2 - Pods, Deployments ו-ReplicaSets](./02-pods-deployments-replicasets.md)
