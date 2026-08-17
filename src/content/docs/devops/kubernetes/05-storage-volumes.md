---
title: "אחסון (Storage) ו-Volumes ב-Kubernetes"
category: DevOps/Kubernetes
part: 5/10
---

## תוכן עניינים
1. [הבעיה: קונטיינרים הם ephemeral](#הבעיה)
2. [Volume בסיסי - emptyDir ו-hostPath](#volume-בסיסי)
3. [PersistentVolume (PV) ו-PersistentVolumeClaim (PVC)](#pv-pvc)
4. [StorageClass ו-Dynamic Provisioning](#storageclass)
5. [StatefulSet - Pods עם זהות ואחסון קבועים](#statefulset)
6. [Access Modes](#access-modes)
7. [פקודות kubectl שימושיות](#פקודות)
8. [טיפים וטריקים](#טיפים)
9. [שאלות ראיון עבודה](#שאלות)
10. [קישורים חיצוניים](#קישורים)

---

## הבעיה: קונטיינרים הם ephemeral {#הבעיה}

קונטיינר במהותו הוא **ephemeral** (חולף) - כשהוא נהרס (או מופעל מחדש), **כל נתון שנכתב בתוך מערכת הקבצים שלו נעלם**. זו בעיה קריטית לכל אפליקציה שצריכה לשמור מידע - מסדי נתונים, קבצים שהועלו על ידי משתמשים, לוגים ארוכי טווח וכו'.

Kubernetes פותר זאת עם מודל **Volumes** - מנגנון להצמדת אחסון (בין אם זמני או קבוע) ל-Pod.

---

## Volume בסיסי - emptyDir ו-hostPath {#volume-בסיסי}

### emptyDir
נוצר ריק בזמן יצירת ה-Pod, וקיים כל עוד ה-Pod קיים (**נמחק** אם ה-Pod נהרס!). שימושי לשיתוף קבצים בין קונטיינרים באותו Pod, או ל-cache זמני.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: cache-pod
spec:
  containers:
    - name: app
      image: myapp:1.0
      volumeMounts:
        - name: cache-volume
          mountPath: /cache
  volumes:
    - name: cache-volume
      emptyDir:
        sizeLimit: 500Mi
```

### hostPath
מצמיד תיקייה **מה-Node עצמו** ל-Pod. שימושי בעיקר לכלי DaemonSet שצריכים גישה לרמת מערכת ההפעלה (כמו log collectors), אך **מסוכן ולא מומלץ** לאפליקציות רגילות - כי המידע קשור לNode ספציפי, ויש בו סיכוני אבטחה.

```yaml
volumes:
  - name: host-logs
    hostPath:
      path: /var/log
      type: Directory
```

---

## PersistentVolume (PV) ו-PersistentVolumeClaim (PVC) {#pv-pvc}

זהו המודל האמיתי לאחסון קבוע ב-Kubernetes, שמפריד בין **מנהל התשתית** (שמספק אחסון) לבין **המפתח** (שרק "תובע" נפח אחסון בלי לדעת פרטים טכניים).

```
┌────────────────┐        ┌───────────────────┐        ┌──────────────────┐
│  Pod            │───────▶│ PersistentVolume-  │───────▶│ PersistentVolume  │
│  volumeMounts   │  claim │ Claim (PVC)        │  bind  │ (PV) - האחסון     │
│                 │        │ "אני צריך 10Gi"    │        │ הפיזי/ענני בפועל  │
└────────────────┘        └───────────────────┘        └──────────────────┘
```

### PersistentVolume (PV)
משאב אחסון בפועל בקלאסטר - יכול להיות דיסק בענן (AWS EBS, GCP PD, Azure Disk), NFS, או local disk.

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: pv-manual
spec:
  capacity:
    storage: 10Gi
  accessModes:
    - ReadWriteOnce
  persistentVolumeReclaimPolicy: Retain
  storageClassName: manual
  hostPath:
    path: /mnt/data
```

### PersistentVolumeClaim (PVC)
"בקשת אחסון" שמפתח יוצר - Kubernetes ימצא PV מתאים ויקשר (bind) ביניהם.

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: my-app-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 5Gi
  storageClassName: manual
```

### שימוש ב-PVC בתוך Pod
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: db-pod
spec:
  containers:
    - name: postgres
      image: postgres:16-alpine
      volumeMounts:
        - name: db-storage
          mountPath: /var/lib/postgresql/data
  volumes:
    - name: db-storage
      persistentVolumeClaim:
        claimName: my-app-pvc
```

---

## StorageClass ו-Dynamic Provisioning {#storageclass}

ביצירת PV ידנית (כמו למעלה) צריך שמנהל התשתית ייצור מראש כל דיסק. בפועל, כמעט תמיד עובדים עם **Dynamic Provisioning** - PVC "מזמין" אוטומטית PV חדש בענן, בלי שאף אחד ייצור אותו ידנית.

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: fast-ssd
provisioner: ebs.csi.aws.com   # לדוגמה, ל-AWS EBS
parameters:
  type: gp3
reclaimPolicy: Delete
volumeBindingMode: WaitForFirstConsumer
```

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: dynamic-pvc
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: fast-ssd   # ← מפעיל Dynamic Provisioning אוטומטית
  resources:
    requests:
      storage: 20Gi
```

**חשוב:** רוב ספקי הענן מספקים StorageClass ברירת מחדל, כך שברוב המקרים לא צריך אפילו להגדיר אחת בעצמכם.

---

## StatefulSet - Pods עם זהות ואחסון קבועים {#statefulset}

Deployment רגיל מתאים לאפליקציות **stateless** - כל ה-Pods זהים וניתנים להחלפה. אבל למסדי נתונים מבוזרים (Cassandra, Elasticsearch, Kafka, MongoDB replica sets) צריך:

- **שמות יציבים** - `pod-0`, `pod-1`, `pod-2` (לא שמות אקראיים)
- **סדר עלייה/כיבוי** - pod-0 עולה קודם, pod-2 יורד קודם
- **אחסון ייחודי לכל Pod** - שנשמר גם אחרי restart

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres-cluster
spec:
  serviceName: postgres-headless
  replicas: 3
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
        - name: postgres
          image: postgres:16-alpine
          volumeMounts:
            - name: data
              mountPath: /var/lib/postgresql/data
  volumeClaimTemplates:     # ← כל Pod מקבל PVC נפרד ואישי משלו!
    - metadata:
        name: data
      spec:
        accessModes:
          - ReadWriteOnce
        storageClassName: fast-ssd
        resources:
          requests:
            storage: 50Gi
```

זה יוצר Pods בשם `postgres-cluster-0`, `postgres-cluster-1`, `postgres-cluster-2`, וכל אחד עם PVC נפרד (`data-postgres-cluster-0` וכו').

---

## Access Modes {#access-modes}

| Mode | קיצור | משמעות |
|---|---|---|
| ReadWriteOnce | RWO | Node יחיד יכול לעשות mount לקריאה וכתיבה |
| ReadOnlyMany | ROX | כמה Nodes יכולים לעשות mount לקריאה בלבד |
| ReadWriteMany | RWX | כמה Nodes יכולים לעשות mount לקריאה וכתיבה (למשל NFS) |
| ReadWriteOncePod | RWOP | רק Pod יחיד (לא רק Node יחיד) יכול לעשות mount - Kubernetes 1.22+ |

שימו לב: לא כל סוגי האחסון תומכים בכל ה-modes - למשל AWS EBS תומך רק ב-RWO, בעוד NFS או EFS תומכים ב-RWX.

---

## פקודות kubectl שימושיות {#פקודות}

```bash
# הצגת PVs ו-PVCs
kubectl get pv
kubectl get pvc

# מידע מפורט - כולל למה PVC "תקוע" ב-Pending
kubectl describe pvc my-app-pvc

# הצגת StorageClasses זמינים
kubectl get storageclass

# מחיקת PVC (זהירות - תלוי ב-reclaimPolicy, עלול למחוק את הדאטה!)
kubectl delete pvc my-app-pvc

# הצגת StatefulSets
kubectl get statefulsets
kubectl rollout status statefulset/postgres-cluster
```

---

## טיפים וטריקים {#טיפים}

1. **PVC ב-Pending?** בדקו קודם אם יש StorageClass מתאים, ואם `volumeBindingMode: WaitForFirstConsumer` - במקרה כזה ה-PVC יישאר Pending עד שיהיה Pod שצריך אותו בפועל, וזה תקין.
2. **reclaimPolicy: Retain** מומלץ לדאטה קריטי - כך אם מוחקים את ה-PVC בטעות, הדיסק בפועל (וה-PV) לא נמחקים, רק "משתחררים" למצב Released.
3. **StatefulSet + Headless Service תמיד ביחד** - שדה `serviceName` ב-StatefulSet חייב להצביע ל-Headless Service (clusterIP: None), כדי לתת DNS יציב לכל Pod (`pod-0.svc-name`).
4. **גיבויים!** - PV/PVC הם לא "backup" - תמיד להגדיר גיבוי אמיתי (snapshot בענן, כלים כמו Velero) בנפרד.
5. **בדקו accessModes לפי provider** - EBS לא תומך ב-RWX; אם צריך שכמה Pods יכתבו לאותו נפח, תצטרכו EFS/NFS/CephFS.

---

## שאלות ראיון עבודה {#שאלות}

**ש: מה ההבדל בין emptyDir ל-PersistentVolume?**
ת: emptyDir הוא אחסון זמני שקיים רק כל עוד ה-Pod קיים, ונמחק לצמיתות כשה-Pod נהרס. PersistentVolume הוא אחסון בעל מחזור חיים עצמאי מה-Pod - הוא נשאר קיים גם אחרי שה-Pod שהשתמש בו נמחק.

**ש: מה תפקידו של PVC, ולמה לא פשוט להשתמש ב-PV ישירות?**
ת: PVC מפריד בין המפתח (שרק מבקש "כמה אחסון ובאיזה access mode") לבין מנהל התשתית (שמספק את ה-PV בפועל, עם כל הפרטים הטכניים כמו סוג הדיסק, אזור וכו'). זו הפרדת אחריות (separation of concerns) שמאפשרת ניידות טובה יותר בין סביבות.

**ש: מה זה Dynamic Provisioning ואיך הוא עובד?**
ת: במקום שמנהל מערכת ייצור PVs מראש ידנית, StorageClass מגדיר "provisioner" (למשל AWS EBS CSI driver) שיוצר אוטומטית PV חדש בכל פעם שנוצר PVC המפנה אליו.

**ש: למה משתמשים ב-StatefulSet במקום Deployment עבור מסד נתונים?**
ת: StatefulSet מספק לכל Pod זהות רשת יציבה (`pod-0`, `pod-1`...), סדר עלייה/כיבוי צפוי, ו-PVC נפרד וקבוע לכל Pod (דרך volumeClaimTemplates) - כל אלו קריטיים למערכות stateful מבוזרות שבהן לכל node תפקיד וזהות שונים.

**ש: מה ההבדל בין reclaimPolicy: Retain ל-Delete?**
ת: Delete מוחק אוטומטית את משאב האחסון בפועל (למשל את דיסק ה-EBS) כשה-PVC נמחק. Retain משאיר את הדאטה הפיזי גם אחרי מחיקת ה-PVC, ומעביר את ה-PV למצב "Released" - נדרשת התערבות ידנית כדי לשחזר או לנקות אותו.

**ש: מה ההבדל בין ReadWriteOnce ל-ReadWriteMany?**
ת: ReadWriteOnce מאפשר mount לקריאה/כתיבה מ-Node יחיד בלבד, בעוד ReadWriteMany מאפשר mount מקביל מכמה Nodes - לא כל סוגי האחסון תומכים ב-RWX (לדוגמה AWS EBS לא תומך, אבל EFS כן).

---

## קישורים חיצוניים {#קישורים}

### תיעוד רשמי
- Volumes: https://kubernetes.io/docs/concepts/storage/volumes/
- Persistent Volumes: https://kubernetes.io/docs/concepts/storage/persistent-volumes/
- StorageClasses: https://kubernetes.io/docs/concepts/storage/storage-classes/
- StatefulSets: https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/

### סרטוני YouTube
- TechWorld with Nana - Kubernetes Volumes & StatefulSets: https://www.youtube.com/c/techworldwithnana
- פלייליסט קורס מלא: https://www.youtube.com/playlist?list=PLy7NrYWoggjziYQIDorlXjTvvwweTYoNC

---

**הקודם:** [מדריך 4 - ConfigMaps ו-Secrets](/devops/kubernetes/04-configmaps-secrets/) | **הבא:** [מדריך 6 - Helm](/devops/kubernetes/06-helm/)
