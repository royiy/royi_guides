# מדריך 3: Services ו-Networking ב-Kubernetes

## תוכן עניינים
1. [מודל הרשת של Kubernetes](#מודל-רשת)
2. [מהו Service ולמה צריך אותו](#מהו-service)
3. [סוגי Services: ClusterIP, NodePort, LoadBalancer, ExternalName](#סוגי-services)
4. [Endpoints ו-EndpointSlices](#endpoints)
5. [DNS פנימי בקלאסטר](#dns)
6. [Headless Services](#headless)
7. [NetworkPolicy](#networkpolicy)
8. [פקודות kubectl שימושיות](#פקודות)
9. [טיפים וטריקים](#טיפים)
10. [שאלות ראיון עבודה](#שאלות)
11. [קישורים חיצוניים](#קישורים)

---

## מודל הרשת של Kubernetes {#מודל-רשת}

Kubernetes מגדיר מודל רשת פשוט אך עוצמתי, המבוסס על עקרונות בסיסיים:

1. כל **Pod** מקבל **כתובת IP ייחודית משלו** בתוך הקלאסטר.
2. כל ה-Pods יכולים לתקשר אחד עם השני **ישירות**, בלי NAT, בין אם הם על אותו Node או לא.
3. Nodes יכולים לתקשר עם כל ה-Pods (וההפך) בלי NAT.

הבעיה: כתובות IP של Pods הן **דינמיות** - כל פעם ש-Pod מת ונוצר מחדש (למשל בעדכון Deployment), הוא מקבל IP חדש. אז איך אפליקציה אחת "יודעת" איך להגיע לאפליקציה אחרת בצורה יציבה? כאן נכנס **Service**.

---

## מהו Service ולמה צריך אותו {#מהו-service}

**Service** הוא אובייקט קוברנטיס שמספק **כתובת רשת יציבה ושם DNS קבוע** לקבוצת Pods, ומבצע load balancing אוטומטי ביניהם. ה-Service "יודע" אילו Pods לכלול באמצעות **Label Selector**.

```
        ┌─────────────────┐
Client →│  Service (VIP)   │
        │  my-app-svc      │
        └────────┬─────────┘
                  │ load balancing
       ┌──────────┼──────────┐
       ▼          ▼          ▼
   Pod (app=x) Pod (app=x) Pod (app=x)
```

---

## סוגי Services: ClusterIP, NodePort, LoadBalancer, ExternalName {#סוגי-services}

### 1. ClusterIP (ברירת מחדל)
נגיש **רק בתוך הקלאסטר**. שימושי לתקשורת פנימית בין מיקרו-שירותים.

```yaml
apiVersion: v1
kind: Service
metadata:
  name: backend-svc
spec:
  type: ClusterIP
  selector:
    app: backend
  ports:
    - protocol: TCP
      port: 80          # הפורט של ה-Service עצמו
      targetPort: 8080  # הפורט שבו הקונטיינר מאזין בפועל
```

### 2. NodePort
פותח פורט קבוע (בטווח 30000-32767 כברירת מחדל) על **כל** Node בקלאסטר, כך שאפשר לגשת לשירות דרך `<NodeIP>:<NodePort>`.

```yaml
apiVersion: v1
kind: Service
metadata:
  name: frontend-svc
spec:
  type: NodePort
  selector:
    app: frontend
  ports:
    - port: 80
      targetPort: 8080
      nodePort: 30080   # אופציונלי - אם לא מוגדר, נבחר אוטומטית
```

### 3. LoadBalancer
מבקש מהספק ענן (AWS, GCP, Azure) לספק Load Balancer חיצוני אמיתי, עם IP ציבורי. זהו הפתרון הנפוץ ביותר לחשיפת שירותים החוצה בענן.

```yaml
apiVersion: v1
kind: Service
metadata:
  name: public-api-svc
spec:
  type: LoadBalancer
  selector:
    app: api
  ports:
    - port: 443
      targetPort: 8443
```

### 4. ExternalName
לא עושה load balancing בכלל - פשוט ממפה שם DNS פנימי לשם DNS חיצוני (למשל מסד נתונים מנוהל מחוץ לקלאסטר).

```yaml
apiVersion: v1
kind: Service
metadata:
  name: external-db
spec:
  type: ExternalName
  externalName: mydb.example-rds.amazonaws.com
```

**טבלת השוואה מהירה:**

| סוג | נגישות | שימוש טיפוסי |
|---|---|---|
| ClusterIP | פנימי בלבד | תקשורת בין מיקרו-שירותים |
| NodePort | חיצוני דרך IP של Node | פיתוח/בדיקות, on-prem |
| LoadBalancer | חיצוני עם IP ציבורי | פרודקשן בענן |
| ExternalName | מיפוי DNS בלבד | חיבור למשאבים חיצוניים |

---

## Endpoints ו-EndpointSlices {#endpoints}

כאשר Service נוצר, Kubernetes יוצר אוטומטית אובייקט `Endpoints` (או `EndpointSlice` בגרסאות חדשות) שמכיל את רשימת ה-IPs בפועל של ה-Pods התואמים ל-selector. ה-kube-proxy קורא מידע זה כדי לתחזק את חוקי ניתוב הרשת.

```bash
kubectl get endpoints backend-svc
kubectl get endpointslices -l kubernetes.io/service-name=backend-svc
```

---

## DNS פנימי בקלאסטר {#dns}

Kubernetes מריץ שירות DNS פנימי (בדרך כלל **CoreDNS**) שמאפשר לכל Pod לפנות ל-Service לפי שם, במקום לפי IP. הפורמט המלא של שם:

```
<service-name>.<namespace>.svc.cluster.local
```

לדוגמה, Pod ב-namespace `frontend` שרוצה לגשת ל-Service `backend-svc` שנמצא ב-namespace `backend`:

```bash
curl http://backend-svc.backend.svc.cluster.local
```

אם שני ה-Pods נמצאים באותו namespace, מספיק פשוט:
```bash
curl http://backend-svc
```

---

## Headless Services {#headless}

כאשר לא רוצים load balancing אוטומטי, אלא לקבל ישירות את כל כתובות ה-IP של ה-Pods (למשל למסד נתונים מבוזר כמו Cassandra שבו הלקוח צריך לדעת על כל node), משתמשים ב-`clusterIP: None`:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: cassandra-headless
spec:
  clusterIP: None
  selector:
    app: cassandra
  ports:
    - port: 9042
```

שאילתת DNS ל-Headless Service מחזירה את **כל** כתובות ה-Pod ישירות, במקום IP וירטואלי יחיד.

---

## NetworkPolicy {#networkpolicy}

כברירת מחדל, **כל Pod יכול לתקשר עם כל Pod אחר** בקלאסטר (all-allow). NetworkPolicy מאפשר להגביל תעבורה - חובה שיהיה CNI plugin שתומך בכך (כמו Calico, Cilium; **לא** תומך ה-CNI הבסיסי של flannel).

```yaml
# מגביל תעבורה נכנסת ל-backend רק מ-Pods עם label app=frontend
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: backend-allow-frontend
spec:
  podSelector:
    matchLabels:
      app: backend
  policyTypes:
    - Ingress
  ingress:
    - from:
        - podSelector:
            matchLabels:
              app: frontend
      ports:
        - protocol: TCP
          port: 8080
```

```bash
kubectl apply -f networkpolicy.yaml
kubectl get networkpolicy
kubectl describe networkpolicy backend-allow-frontend
```

---

## פקודות kubectl שימושיות {#פקודות}

```bash
# הצגת כל ה-Services
kubectl get services
kubectl get svc -o wide

# יצירת Service מהירה מ-CLI עבור Deployment קיים
kubectl expose deployment nginx-deployment --port=80 --target-port=8080 --type=ClusterIP

# בדיקת קישוריות מתוך הקלאסטר (Pod זמני)
kubectl run tmp-shell --rm -it --image=busybox -- sh
# ואז בתוך ה-Pod: wget -O- http://backend-svc

# port-forward לבדיקה מקומית בלי לחשוף לחוץ
kubectl port-forward svc/backend-svc 8080:80

# בדיקת ה-DNS מתוך Pod
kubectl exec -it <pod-name> -- nslookup backend-svc
```

---

## טיפים וטריקים {#טיפים}

1. **`kubectl port-forward`** הוא הכלי הכי מהיר לבדיקה מקומית של שירות בלי לחשוף אותו לעולם - שימושי מאוד בפיתוח.
2. **תמיד תבדקו את ה-selector** - הבעיה הכי נפוצה של "Service לא עובד" היא selector שלא תואם בדיוק ל-labels של ה-Pods (רגיש לאותיות קטנות/גדולות).
3. **NodePort לא מומלץ לפרודקשן** - עדיף LoadBalancer או Ingress עם Service מסוג ClusterIP מאחוריו.
4. **targetPort יכול להיות שם** - במקום מספר, אפשר לתת שם לפורט בקונטיינר (`ports: - name: http`) ולהפנות אליו מה-Service, כך שקל יותר לשנות פורטים בעתיד בלי לגעת ב-Service.
5. **NetworkPolicy דורש CNI תומך** - אם יצרתם NetworkPolicy אבל שום דבר לא נחסם, כנראה ה-CNI plugin שלכם (למשל flannel הבסיסי) לא תומך באכיפה.
6. **externalTrafficPolicy: Local** ב-Service מסוג LoadBalancer/NodePort שומר על ה-source IP האמיתי של הלקוח, אבל עלול לגרום לחוסר איזון עומסים בין Nodes.

---

## שאלות ראיון עבודה {#שאלות}

**ש: מה ההבדל בין ClusterIP, NodePort ו-LoadBalancer?**
ת: ClusterIP נגיש רק בתוך הקלאסטר. NodePort פותח פורט קבוע על כל Node ומאפשר גישה חיצונית דרך IP של Node. LoadBalancer מבקש Load Balancer אמיתי מספק הענן עם IP ציבורי ייעודי - למעשה, NodePort ו-LoadBalancer בונים על גבי ClusterIP.

**ש: איך Service "יודע" לאילו Pods לנתב תעבורה?**
ת: באמצעות Label Selector - ה-Service מחפש Pods עם labels תואמים, ו-Kubernetes מתעדכן דינמית ברשימת ה-Endpoints (או EndpointSlices) בכל פעם שנוסף/מוסר Pod תואם.

**ש: מהו Headless Service ומתי משתמשים בו?**
ת: Service עם `clusterIP: None` שלא מבצע load balancing - במקום להחזיר IP וירטואלי יחיד, שאילתת DNS מחזירה את כל כתובות ה-Pods ישירות. שימושי לאפליקציות stateful שצריכות לדעת ולתקשר עם כל instance בנפרד, כמו מסדי נתונים מבוזרים.

**ש: איך פועל ה-DNS הפנימי של Kubernetes?**
ת: CoreDNS רץ כ-Deployment בתוך הקלאסטר ומספק רזולוציית שמות בפורמט `<service>.<namespace>.svc.cluster.local`, כך שאפליקציות יכולות לתקשר לפי שם במקום IP.

**ש: מה קורה כברירת מחדל בנוגע לתקשורת בין Pods, ואיך מגבילים אותה?**
ת: כברירת מחדל כל Pod יכול לתקשר עם כל Pod אחר בקלאסטר. מגבילים באמצעות NetworkPolicy, בתנאי שה-CNI plugin תומך באכיפת מדיניות (כמו Calico או Cilium).

**ש: מה ההבדל בין Service ל-Ingress?**
ת: Service מטפל בעיקר ב-L4 (TCP/UDP) load balancing בתוך הקלאסטר או ברמת Node/LB בודד. Ingress הוא אובייקט L7 (HTTP/HTTPS) שמאפשר ניתוב מבוסס host/path למספר Services מאחורי כתובת אחת, כולל TLS termination.

---

## קישורים חיצוניים {#קישורים}

### תיעוד רשמי
- Services: https://kubernetes.io/docs/concepts/services-networking/service/
- DNS for Services and Pods: https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/
- Network Policies: https://kubernetes.io/docs/concepts/services-networking/network-policies/
- Cluster Networking: https://kubernetes.io/docs/concepts/cluster-administration/networking/

### סרטוני YouTube
- TechWorld with Nana - Kubernetes Services Explained: https://www.youtube.com/c/techworldwithnana
- פלייליסט קורס מלא: https://www.youtube.com/playlist?list=PLy7NrYWoggjziYQIDorlXjTvvwweTYoNC

---

**הקודם:** [מדריך 2 - Pods, Deployments](./02-pods-deployments-replicasets.md) | **הבא:** [מדריך 4 - ConfigMaps ו-Secrets](./04-configmaps-secrets.md)
