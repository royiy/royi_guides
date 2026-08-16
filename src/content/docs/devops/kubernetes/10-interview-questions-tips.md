# מדריך 10: שאלות ראיון עבודה מקיפות, טיפים וטריקים, ופתרון תקלות (Troubleshooting)

זהו מדריך הסיכום - ריכוז של שאלות ראיון נפוצות ברמות שונות (Junior עד Senior/DevOps), יחד עם workflow שיטתי לפתרון תקלות (troubleshooting) שכל מהנדס Kubernetes חייב להכיר.

## תוכן עניינים
1. [שאלות יסוד (Junior)](#שאלות-יסוד)
2. [שאלות ביניים (Mid-Level)](#שאלות-ביניים)
3. [שאלות מתקדמות (Senior / DevOps)](#שאלות-מתקדמות)
4. [שאלות תרחיש (Scenario-Based)](#שאלות-תרחיש)
5. [Workflow שיטתי לפתרון תקלות](#workflow-troubleshooting)
6. [מצבי כשל נפוצים ופתרונם](#מצבי-כשל]
7. [פקודות דיבאג חיוניות - Cheat Sheet](#cheat-sheet)
8. [טיפים כלליים להצלחה בראיון](#טיפים-לראיון)
9. [קישורים חיצוניים](#קישורים)

---

## שאלות יסוד (Junior) {#שאלות-יסוד}

**1. מה זה Kubernetes במשפט אחד?**
מערכת קוד-פתוח לתזמור (orchestration) אוטומטי של אפליקציות בקונטיינרים - הרצה, סקיילינג, ריפוי עצמי ועדכונים.

**2. מה ההבדל בין Docker ל-Kubernetes?**
Docker הוא כלי ליצירה והרצה של קונטיינרים בודדים על מכונה אחת. Kubernetes הוא שכבה שמעליו - מנהל אוסף גדול של קונטיינרים (לרוב על הרבה מכונות), כולל scaling, self-healing, networking ו-load balancing.

**3. מה זה Pod?**
יחידת הפריסה הקטנה ביותר ב-Kubernetes - "עטיפה" סביב קונטיינר אחד או יותר שחולקים רשת ואחסון.

**4. מה ההבדל בין Deployment ל-Pod?**
Pod הוא היחידה הבסיסית; Deployment הוא controller שמנהל אוסף Pods, כולל rolling updates, rollback וסקיילינג.

**5. מה זה Service, ולמה צריך אותו אם ל-Pod כבר יש IP?**
כי כתובת IP של Pod משתנה בכל פעם שהוא נוצר מחדש. Service מספק כתובת יציבה ו-load balancing אוטומטי לקבוצת Pods.

**6. מה ההבדל בין Namespace שונים?**
Namespace הוא מנגנון בידוד לוגי בתוך קלאסטר - מאפשר להפריד סביבות (dev/staging/prod) או צוותים, כולל הגבלת שמות (שם משאב חייב להיות ייחודי בתוך namespace, לא בהכרח בין namespaces).

**7. מה זה kubectl?**
כלי שורת הפקודה (CLI) הרשמי לתקשורת עם ה-API Server של Kubernetes - יצירה, עדכון, מחיקה וצפייה במשאבים.

**8. מה ההבדל בין `kubectl apply` ל-`kubectl create`?**
`create` יוצר משאב חדש ונכשל אם הוא כבר קיים. `apply` הוא declarative - יוצר אם לא קיים, ומעדכן אם קיים (בהתבסס על ההבדל מהמצב האחרון שהוחל).

---

## שאלות ביניים (Mid-Level) {#שאלות-ביניים}

**1. מה ההבדל בין ConfigMap ל-Secret?**
שניהם מנגנון לשמירת קונפיגורציה חיצונית לקוד, אבל Secret מיועד למידע רגיש ומוצג ב-Base64 (לא מוצפן כברירת מחדל!) בעוד ConfigMap מוצג כטקסט גלוי.

**2. הסבירו את ה-Rolling Update Strategy.**
Deployment מעדכן Pods בהדרגה לפי `maxSurge` (כמה Pods נוספים מותר ליצור מעבר לכמות הרצויה) ו-`maxUnavailable` (כמה מותר שיהיו לא זמינים) - כדי לשמור על זמינות במהלך העדכון.

**3. מה ההבדל בין livenessProbe ל-readinessProbe?**
liveness קובע האם להפעיל מחדש קונטיינר; readiness קובע האם לשלוח אליו תעבורה מה-Service, בלי להרוג אותו.

**4. מה זה StatefulSet, ומתי בוחרים בו על פני Deployment?**
כשצריך זהות רשת יציבה, סדר עלייה/כיבוי, ואחסון ייחודי ונשמר לכל instance - כמו במסדי נתונים מבוזרים.

**5. מה ההבדל בין requests ל-limits?**
requests הם ההבטחה המינימלית שה-Scheduler משתמש בה לשיבוץ; limits הם התקרה שאם חורגים ממנה - CPU נחנק (throttle) ו-Memory גורם ל-OOMKill.

**6. מה זה NetworkPolicy?**
אובייקט שמגביל תעבורת רשת בין Pods, שכברירת מחדל פתוחה לגמרי - דורש CNI תומך (Calico, Cilium וכו').

**7. מה תפקידו של Ingress Controller?**
הרכיב שבפועל מיישם את חוקי ה-Ingress שהוגדרו - בלעדיו אובייקט Ingress הוא רק הצהרה בלי אכיפה.

**8. איך עובד Horizontal Pod Autoscaler (HPA)?**
בודק metrics (CPU/Memory או custom metrics) בהשוואה ליעד (target), ומגדיל/מקטין את מספר ה-replicas ב-Deployment בהתאם.

**9. מה ההבדל בין ClusterIP, NodePort ו-LoadBalancer?**
ClusterIP - נגיש בקלאסטר בלבד. NodePort - חושף פורט קבוע על כל Node. LoadBalancer - מבקש Load Balancer אמיתי מספק ענן.

**10. מה זה Init Container?**
קונטיינר שרץ **לפני** הקונטיינרים הראשיים ב-Pod, ומסתיים לפני שהם עולים - שימושי להכנת סביבה, המתנה לתלות חיצונית, או migration.

```yaml
spec:
  initContainers:
    - name: wait-for-db
      image: busybox
      command: ['sh', '-c', 'until nc -z db-svc 5432; do sleep 2; done']
  containers:
    - name: app
      image: myapp:1.0
```

---

## שאלות מתקדמות (Senior / DevOps) {#שאלות-מתקדמות}

**1. הסבירו את ה-Reconciliation Loop ואיך controllers עובדים בפועל.**
כל controller מריץ לולאה אינסופית: קורא מה-API Server את המצב הרצוי (spec) והמצב בפועל (status), משווה, ואם יש פער - מבצע פעולות לצמצם אותו. זהו הדפוס הבסיסי מאחורי ReplicaSet, Deployment, וכל CRD מותאם אישית (Operator).

**2. מה ההבדל בין Taints/Tolerations ל-Node Affinity?**
Taints מוחלים על Node ו"דוחים" Pods שאין להם toleration תואם - מנגנון "דחייה" (repel). Node Affinity מוגדר ברמת Pod ו"מושך" אותו לכיוון Nodes מסוימים - מנגנון "משיכה" (attract). הם משלימים זה את זה: taints מגנים על nodes ייעודיים (למשל GPU), affinity מבקש להעדיף אותם.

```yaml
# Toleration ב-Pod שמאפשר לו לרוץ על Node עם taint
tolerations:
  - key: "gpu-only"
    operator: "Equal"
    value: "true"
    effect: "NoSchedule"
```

**3. הסבירו PodDisruptionBudget (PDB) ולמה הוא חשוב.**
מגדיר כמה Pods מותר שיהיו לא זמינים במקביל במהלך פעולות **וולונטריות** (voluntary disruptions) - כמו node drain לצורך תחזוקה. לא מגן מפני קריסות פתאומיות (involuntary).

```yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: myapp-pdb
spec:
  minAvailable: 2
  selector:
    matchLabels:
      app: myapp
```

**4. מה זה CRD (Custom Resource Definition) ו-Operator?**
CRD מרחיב את ה-API של Kubernetes בטיפוסי משאבים חדשים ומותאמים אישית (למשל `PostgresCluster`). Operator הוא controller מותאם אישית שמנהל את מחזור החיים של אותו CRD - "אוטומציה של ידע תפעולי אנושי" בקוד.

**5. מה ההבדל בין Rolling Update ל-Blue-Green ל-Canary Deployment?**
Rolling Update מעדכן בהדרגה (native ל-Deployment). Blue-Green מריץ שתי סביבות מלאות ומקבילות ומחליף תעבורה בבת אחת (דורש שני Deployments + שינוי Service selector). Canary מנתב אחוז קטן מהתעבורה לגרסה חדשה בהדרגה, ומגדיל בהתאם לתוצאות - דורש כלים כמו Argo Rollouts או Service Mesh.

**6. איך מתמודדים עם multi-tenancy בקלאסטר Kubernetes יחיד?**
שילוב של: Namespaces להפרדה לוגית, ResourceQuota ו-LimitRange להגבלת משאבים לכל צוות, RBAC לבידוד הרשאות, NetworkPolicy לבידוד תעבורה, ולעיתים גם node pools נפרדים או Kubernetes multi-cluster לבידוד פיזי מלא יותר.

**7. מה זה etcd ולמה אבטחת/גיבוי שלו קריטיים?**
מסד הנתונים המבוזר ששומר את **כל** מצב הקלאסטר. אובדן etcd = אובדן היכולת לנהל את הקלאסטר. תמיד לוודא גיבויים סדירים, quorum תקין (מספר אי-זוגי של instances), ו-encryption at rest.

**8. איך Kubernetes מבצע Scheduling בפועל - מה משפיע על ההחלטה?**
kube-scheduler עובר שני שלבים: **Filtering** (איזה Nodes בכלל יכולים לארח את ה-Pod - לפי resources, taints, affinity) ו-**Scoring** (דירוג ה-Nodes המתאימים לפי קריטריונים כמו spread, resource balance) - ובוחר את הציון הגבוה ביותר.

**9. מה ההבדל בין Rolling Restart ל-Rolling Update?**
Rolling Update מתרחש כשמשנים את ה-spec (למשל image חדש). Rolling Restart (`kubectl rollout restart`) מפעיל מחדש את כל ה-Pods בלי לשנות שום דבר ב-spec - שימושי למשל אחרי עדכון Secret/ConfigMap שלא מתעדכן אוטומטית.

**10. הסבירו graceful shutdown ב-Kubernetes.**
כשPod נמחק, Kubernetes שולח SIGTERM, מסיר את ה-Pod מה-Endpoints (מפסיק לשלוח תעבורה חדשה), וממתין `terminationGracePeriodSeconds` (ברירת מחדל 30 שניות) לפני שליחת SIGKILL. חשוב שהאפליקציה תטפל ב-SIGTERM כדי לסיים בקשות פתוחות בצורה מסודרת.

---

## שאלות תרחיש (Scenario-Based) {#שאלות-תרחיש}

**תרחיש: "Pod נמצא במצב CrashLoopBackOff - איך תגשו לזה?"**
תשובה מובנית: 
1. `kubectl describe pod` - לבדוק events ו-exit code אחרון
2. `kubectl logs <pod> --previous` - לוגים מהריצה שקרסה (הכי חשוב!)
3. לבדוק אם זו בעיית קונפיגורציה (ConfigMap/Secret חסר), health check שנכשל מוקדם מדי, או crash אמיתי בקוד
4. לבדוק resources - אולי OOMKilled (`kubectl describe pod` יראה `Reason: OOMKilled`)

**תרחיש: "משתמשים מדווחים שהאתר איטי - איך תחקרו?"**
תשובה מובנית:
1. בדיקת `kubectl top pods` - האם יש Pod שצורך משאבים חריגים
2. בדיקת HPA - האם הוא בכלל scale-אאוט בזמן
3. בדיקת readinessProbe - אולי Pods "לא מוכנים" מקבלים תעבורה בטעות, או Pods תקינים מוסרים בטעות
4. Prometheus/Grafana - latency, error rate, saturation
5. בדיקת network policies - אולי חסימה לא מכוונת

**תרחיש: "Deployment חדש נתקע ולא מתקדם - מה בודקים?"**
תשובה מובנית:
1. `kubectl rollout status deployment/<name>` - יראה אם תקוע
2. `kubectl get pods` - האם Pods חדשים בכלל נוצרים
3. `kubectl describe pod <new-pod>` - image pull errors? resource quota חסום?
4. אם ה-readinessProbe של הגרסה החדשה נכשלת - ה-rollout "תקוע" בכוונה כדי לא להזיק לזמינות

**תרחיש: "איך הייתם מתכננים מעבר מ-Docker Compose לקוברנטיס לחברה?"**
נקודות מפתח לתשובה: הערכת workloads (stateless מול stateful), בחירת ניהול (managed - EKS/GKE/AKS מול self-hosted), אסטרטגיית CI/CD (Helm/GitOps עם ArgoCD/Flux), תכנון ניטור ולוגים מהיום הראשון, אסטרטגיית migration הדרגתית (strangler pattern) ולא "big bang".

---

## Workflow שיטתי לפתרון תקלות {#workflow-troubleshooting}

זהו סדר הפעולות המומלץ לכל תקלה ב-Kubernetes - כדאי לדעת אותו בעל פה לראיון:

```
1. kubectl get pods            → מה הסטטוס? (Running/Pending/CrashLoopBackOff/ImagePullBackOff...)
2. kubectl describe pod <pod>  → Events בתחתית התוצאה - כמעט תמיד שם התשובה
3. kubectl logs <pod>          → לוגים מהריצה הנוכחית
4. kubectl logs <pod> --previous → לוגים מהריצה שקרסה (אם רלוונטי)
5. kubectl get events --sort-by='.lastTimestamp' → תמונה רחבה יותר של הקלאסטר
6. kubectl exec -it <pod> -- sh → כניסה לתוך הקונטיינר לבדיקה ידנית (אם הוא רץ)
```

---

## מצבי כשל נפוצים ופתרונם {#מצבי-כשל}

| מצב | סיבה סבירה | פתרון |
|---|---|---|
| `Pending` | אין Node עם משאבים מספיקים, או PVC לא bound | `describe pod` לראות events; בדקו resources/PVC |
| `ImagePullBackOff` | שם image שגוי, tag לא קיים, או חסר imagePullSecret | ודאו את שם ה-image ואת ה-registry credentials |
| `CrashLoopBackOff` | האפליקציה קורסת מיד אחרי עלייה | `logs --previous`, בדקו health checks מוקדמים מדי |
| `OOMKilled` | חריגה מ-memory limit | הגדילו limits או תקנו memory leak באפליקציה |
| `Pod תקוע ב-Terminating` | finalizer תקוע, או process לא מגיב ל-SIGTERM | `kubectl delete pod --grace-period=0 --force` (זהירות!) |
| `Service לא מנתב תעבורה` | selector לא תואם ל-labels, או Pods לא Ready | `kubectl get endpoints <svc>` - ריק = בעיית selector/readiness |
| `0/3 nodes are available` (ב-scheduling) | taints, resource requests גבוהים מדי, affinity לא מתקיים | `describe pod` יפרט בדיוק למה כל Node נדחה |

---

## פקודות דיבאג חיוניות - Cheat Sheet {#cheat-sheet}

```bash
# מצב כללי
kubectl get pods -o wide
kubectl get all -n <namespace>

# חקירת Pod
kubectl describe pod <pod>
kubectl logs <pod> -f --tail=100
kubectl logs <pod> --previous
kubectl exec -it <pod> -- sh

# חקירת Node
kubectl describe node <node>
kubectl top node

# חקירת Service/Networking
kubectl get endpoints <svc>
kubectl run debug --rm -it --image=busybox -- sh

# Pod זמני עם כלי דיבאג רשת (netshoot)
kubectl run netshoot --rm -it --image=nicolaka/netshoot -- sh

# debug של Pod קיים בלי לשנות אותו (Ephemeral Containers, Kubernetes 1.25+)
kubectl debug -it <pod> --image=busybox --target=<container-name>

# בדיקת הרשאות
kubectl auth can-i <verb> <resource> --as=<user> -n <namespace>

# ניקוי Pods תקועים
kubectl delete pod <pod> --grace-period=0 --force

# הצגת resource quota ב-namespace
kubectl describe resourcequota -n <namespace>
```

---

## טיפים כלליים להצלחה בראיון {#טיפים-לראיון}

1. **תמיד תסבירו "למה", לא רק "מה"** - למשל לא רק "משתמשים ב-Deployment", אלא "משתמשים ב-Deployment כי הוא מוסיף rolling updates ו-rollback מעל ReplicaSet".
2. **תנו דוגמת YAML קצרה** כשמתאים - זה מראה ניסיון מעשי אמיתי, לא רק תיאוריה.
3. **הכירו את ה-troubleshooting workflow בעל פה** - זו אחת השאלות הכי נפוצות בראיונות Senior/DevOps, כי היא בודקת ניסיון מעשי אמיתי ולא רק שינון.
4. **אל תפחדו להגיד "לא הייתי בטוח, אבל הייתי בודק ב-`kubectl describe`..."** - זה עדיף על ניחוש שגוי, ומראה גישה נכונה לפתרון בעיות.
5. **הכינו סיפור STAR אחד לפחות** על תקלה אמיתית שפתרתם ב-Kubernetes (Situation, Task, Action, Result) - שאלות behavioral נפוצות מאוד בראיונות DevOps.
6. **תרגלו על קלאסטר אמיתי** (Minikube/kind) - אין תחליף לניסיון ידיים-על-מקלדת בזמן הכנה לראיון.
7. **הכירו את ההבדל בין "מה שאתם יודעים" ל"מה שהייתם מחפשים"** - בתפקידי Senior, לרוב חשוב יותר להראות יכולת חקירה שיטתית מאשר לדעת הכל בעל פה.

---

## קישורים חיצוניים {#קישורים}

### תיעוד רשמי
- Debug Running Pods: https://kubernetes.io/docs/tasks/debug/debug-application/debug-running-pod/
- Troubleshoot Applications: https://kubernetes.io/docs/tasks/debug/debug-application/
- kubectl Cheat Sheet: https://kubernetes.io/docs/reference/kubectl/cheatsheet/
- Kubernetes Certifications (CKA/CKAD/CKS): https://www.cncf.io/training/certification/

### סרטוני YouTube
- TechWorld with Nana - Kubernetes Interview Questions & Troubleshooting: https://www.youtube.com/c/techworldwithnana
- freeCodeCamp - Kubernetes Full Course: https://www.youtube.com/watch?v=d6WC5n9G_sM
- פלייליסט קורס מלא (TechWorld with Nana): https://www.youtube.com/playlist?list=PLy7NrYWoggjziYQIDorlXjTvvwweTYoNC

---

**הקודם:** [מדריך 9 - Monitoring & Logging](./09-monitoring-logging.md) | **חזרה להתחלה:** [מדריך 1 - מבוא וארכיטקטורה](./01-mavo-vearchitectura.md)

---

## סיכום כל 10 המדריכים

1. [מבוא וארכיטקטורה](./01-mavo-vearchitectura.md)
2. [Pods, Deployments, ReplicaSets](./02-pods-deployments-replicasets.md)
3. [Services ו-Networking](./03-services-networking.md)
4. [ConfigMaps ו-Secrets](./04-configmaps-secrets.md)
5. [אחסון ו-Volumes](./05-storage-volumes.md)
6. [Helm](./06-helm.md)
7. [RBAC ואבטחה](./07-rbac-security.md)
8. [Ingress](./08-ingress.md)
9. [Monitoring & Logging](./09-monitoring-logging.md)
10. [שאלות ראיון עבודה, טיפים ופתרון תקלות](./10-interview-questions-tips.md)
