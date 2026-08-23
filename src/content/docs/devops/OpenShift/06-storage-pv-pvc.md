# מדריך 6: אחסון - PV, PVC, StorageClass ו-CSI

## למה בכלל צריך ניהול אחסון מיוחד?

Pods הם **אפמריים (ephemeral)** - כאשר פוד נהרס, כל הנתונים שהוא כתב לדיסק המקומי שלו נמחקים לצמיתות. עבור אפליקציות stateless (רוב שרתי ה-web) זו לא בעיה, אבל עבור מסדי נתונים, קבצי לוג ארוכי טווח, ואחסון קבצים - חייבים **אחסון קבוע (persistent storage)**.

## המושגים הבסיסיים

- **PersistentVolume (PV)** - "חתיכת" אחסון פיזי/וירטואלי בקלאסטר. נוצר בד"כ על ידי אדמין או אוטומטית דרך provisioning דינמי.
- **PersistentVolumeClaim (PVC)** - "בקשה" של המשתמש/אפליקציה לקבל אחסון בגודל ותכונות מסוימות. ה-PVC "נקשר" (bind) ל-PV מתאים.
- **StorageClass** - "תבנית" שמגדירה איזה סוג אחסון (SSD, HDD, NFS, cloud disk) ואיך הוא נוצר אוטומטית (dynamic provisioning).
- **CSI (Container Storage Interface)** - הפרוטוקול הסטנדרטי שדרכו ספקי אחסון (AWS EBS, Ceph, NetApp וכו') מתחברים ל-Kubernetes/OpenShift.

## דיאגרמת זרימה

```
   Developer
       │  יוצר PVC (בקשה)
       ▼
┌───────────────┐        ┌──────────────────┐
│      PVC          │───────►│   StorageClass       │
│ (5Gi, RWO)         │        │  (dynamic provisioner) │
└───────┬───────┘        └─────────┬────────┘
        │                          │ יוצר אוטומטית
        │ נקשר (bind)                ▼
        │                  ┌───────────────┐
        └─────────────────►│      PV            │
                           │ (דיסק פיזי אמיתי)      │
                           └───────────────┘
```

## בדיקת StorageClasses זמינים

```bash
oc get storageclass
oc get sc
oc describe storageclass gp3-csi   # דוגמה ל-AWS
```

### דוגמה ל-StorageClass (AWS EBS CSI)

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: fast-ssd
provisioner: ebs.csi.aws.com
parameters:
  type: gp3
  iops: "5000"
reclaimPolicy: Delete
allowVolumeExpansion: true
volumeBindingMode: WaitForFirstConsumer
```

## יצירת PVC

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: my-app-data
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: fast-ssd
  resources:
    requests:
      storage: 10Gi
```

```bash
oc apply -f pvc.yaml
oc get pvc
oc describe pvc my-app-data
```

### Access Modes - הבדל קריטי

| Mode | קיצור | תיאור | מתאים ל |
|---|---|---|---|
| ReadWriteOnce | RWO | node אחד יכול לכתוב | רוב מסדי הנתונים (Postgres, MySQL) |
| ReadWriteMany | RWX | מספר nodes יכולים לכתוב במקביל | שיתוף קבצים, NFS, אחסון תמונות משותף |
| ReadOnlyMany | ROX | מספר nodes, קריאה בלבד | תוכן סטטי משותף |
| ReadWriteOncePod | RWOP | פוד יחיד בלבד (הכי מחמיר) | הבטחת בלעדיות מוחלטת |

**חשוב:** לא כל StorageClass תומך ב-RWX! זה תלוי ב-backend (NFS, Ceph, Azure Files תומכים; AWS EBS/GCP PD רגילים - לא).

## חיבור PVC לפוד/Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-stateful-app
spec:
  replicas: 1
  selector:
    matchLabels:
      app: my-stateful-app
  template:
    metadata:
      labels:
        app: my-stateful-app
    spec:
      containers:
        - name: app
          image: quay.io/example/my-app:latest
          volumeMounts:
            - name: data-volume
              mountPath: /var/lib/app/data
      volumes:
        - name: data-volume
          persistentVolumeClaim:
            claimName: my-app-data
```

## הרחבת (Resize) PVC בלי downtime

```bash
# תנאי: ה-StorageClass חייב allowVolumeExpansion: true
oc patch pvc my-app-data -p '{"spec":{"resources":{"requests":{"storage":"20Gi"}}}}'

# מעקב אחר ההרחבה
oc get pvc my-app-data -o jsonpath='{.status.conditions}'
```

## דוגמה: StatefulSet עם volumeClaimTemplates (PVC אוטומטי לכל replica)

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres-cluster
spec:
  serviceName: postgres
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
          image: registry.redhat.io/rhel9/postgresql-15
          volumeMounts:
            - name: pgdata
              mountPath: /var/lib/pgsql/data
  volumeClaimTemplates:
    - metadata:
        name: pgdata
      spec:
        accessModes: ["ReadWriteOnce"]
        storageClassName: fast-ssd
        resources:
          requests:
            storage: 50Gi
```

זה יוצר אוטומטית 3 PVC נפרדים: `pgdata-postgres-cluster-0`, `pgdata-postgres-cluster-1`, `pgdata-postgres-cluster-2`.

## ODF - OpenShift Data Foundation

עבור אחסון מתקדם בקלאסטר (block, file, object storage) - Red Hat מציעה Operator ייעודי בשם **OpenShift Data Foundation** (מבוסס Ceph), שמספק:
- Block storage (RWO) לדאטהבייסים.
- File storage (RWX) לשיתוף קבצים.
- Object storage תואם S3.

```bash
oc get csv -n openshift-storage | grep odf
```

## אבחון בעיות אחסון נפוצות

```bash
# PVC תקוע ב-Pending?
oc describe pvc my-app-data
# בדקו: האם StorageClass קיים? האם יש capacity פנוי?

# בדיקת PV הזמינים
oc get pv

# בדיקת reclaim policy (מה קורה כשמוחקים PVC)
oc get pv <pv-name> -o jsonpath='{.spec.persistentVolumeReclaimPolicy}'
```

| Reclaim Policy | התנהגות |
|---|---|
| `Delete` | מוחק את הדיסק הפיזי כשה-PVC נמחק (ברירת מחדל ב-dynamic provisioning) |
| `Retain` | שומר את הדיסק גם אחרי מחיקת PVC (דורש ניקוי ידני) |

## קישורים חיצוניים

### תיעוד רשמי
- Understanding persistent storage - OpenShift Documentation: https://docs.redhat.com/en/documentation/openshift_container_platform/4.22
- OpenShift Data Foundation - Red Hat Documentation: https://docs.redhat.com/en/documentation/openshift_container_platform/4.22

### סרטוני יוטיוב מומלצים
- OpenShift for the Absolute Beginners (כולל Storage): https://www.udemy.com/course/learn-openshift/
- OpenShift: Beginner to Advanced Complete Course: https://www.youtube.com/watch?v=zVkw-qLp_H4

## טיפים וטריקים

1. **`volumeBindingMode: WaitForFirstConsumer`** מונע מהמערכת ליצור PV ב-zone שגוי (חשוב מאוד בענן multi-AZ) - ה-PV נוצר רק כשהפוד מתוזמן, ואז ה-scheduler יודע איפה למקם אותו.
2. אף פעם אל תשתמשו ב-`emptyDir` לנתונים חשובים - זה אחסון זמני שנמחק עם הפוד!
3. בדקו תמיד `accessModes` תואם ל-backend - ניסיון ליצור PVC עם RWX על StorageClass שלא תומך בכך יגרום ל-Pending לנצח.
4. השתמשו ב-**snapshot** (VolumeSnapshot resource, אם ה-CSI driver תומך) לגיבויים מהירים בלי downtime.
5. `oc get pvc -A` (all namespaces) - שימושי כשמחפשים PVCs "יתומים" שתופסים משאבים מיותרים בקלאסטר.

---
**במדריך הבא:** אבטחה - RBAC, SCC, ServiceAccounts ו-Secrets.
