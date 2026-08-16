# מדריך 4: ConfigMaps ו-Secrets

## תוכן עניינים
1. [למה להפריד הגדרות מהקוד](#למה-להפריד)
2. [ConfigMap - יצירה ושימוש](#configmap)
3. [שימוש ב-ConfigMap כמשתני סביבה](#env-vars)
4. [שימוש ב-ConfigMap כ-Volume](#configmap-volume)
5. [Secret - יצירה ושימוש](#secret)
6. [סוגי Secrets](#סוגי-secrets)
7. [הצפנת Secrets ב-etcd](#הצפנה)
8. [כלים חיצוניים לניהול Secrets](#כלים-חיצוניים)
9. [פקודות kubectl שימושיות](#פקודות)
10. [טיפים וטריקים](#טיפים)
11. [שאלות ראיון עבודה](#שאלות)
12. [קישורים חיצוניים](#קישורים)

---

## למה להפריד הגדרות מהקוד {#למה-להפריד}

עיקרון בסיסי בפיתוח אפליקציות ענן (מבוסס על [The Twelve-Factor App](https://12factor.net/config)) הוא **הפרדה בין קוד להגדרות (config)**. אותה תמונת קונטיינר (image) צריכה לרוץ בסביבת dev, staging ו-production בלי לבנות אותה מחדש - וההבדלים בין הסביבות (כתובות DB, feature flags, סודות) צריכים להגיע מבחוץ.

ב-Kubernetes יש שני אובייקטים לכך:
- **ConfigMap** - להגדרות **לא רגישות** (URLs, שמות feature flags, קבצי קונפיגורציה)
- **Secret** - למידע **רגיש** (סיסמאות, טוקנים, מפתחות API, תעודות TLS)

---

## ConfigMap - יצירה ושימוש {#configmap}

### יצירה מ-YAML
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  DATABASE_HOST: "postgres-svc"
  DATABASE_PORT: "5432"
  LOG_LEVEL: "info"
  FEATURE_NEW_UI: "true"
```

### יצירה ישירה מ-CLI
```bash
# ממשתנים בודדים
kubectl create configmap app-config \
  --from-literal=DATABASE_HOST=postgres-svc \
  --from-literal=LOG_LEVEL=info

# מקובץ שלם (למשל nginx.conf)
kubectl create configmap nginx-config --from-file=nginx.conf

# מתיקייה שלמה (כל קובץ הופך למפתח)
kubectl create configmap app-configs --from-file=./config-dir/
```

---

## שימוש ב-ConfigMap כמשתני סביבה {#env-vars}

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
        - name: backend
          image: myapp/backend:1.0
          # אופציה א׳: משתנה יחיד
          env:
            - name: DATABASE_HOST
              valueFrom:
                configMapKeyRef:
                  name: app-config
                  key: DATABASE_HOST
          # אופציה ב׳: כל המפתחות ב-ConfigMap הופכים אוטומטית למשתני סביבה
          envFrom:
            - configMapRef:
                name: app-config
```

---

## שימוש ב-ConfigMap כ-Volume {#configmap-volume}

שימושי כשצריך להעביר קובץ קונפיגורציה שלם (למשל `nginx.conf` או `application.yaml`):

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx-custom-config
spec:
  containers:
    - name: nginx
      image: nginx:1.27-alpine
      volumeMounts:
        - name: config-volume
          mountPath: /etc/nginx/conf.d
  volumes:
    - name: config-volume
      configMap:
        name: nginx-config
```

**יתרון חשוב:** כאשר ה-ConfigMap מתעדכן, הקבצים ב-Volume **מתעדכנים אוטומטית** (אחרי כמה שניות, לא מיידי) - אבל האפליקציה חייבת לתמוך ב-hot-reload כדי שהשינוי ייכנס לתוקף בלי restart.

---

## Secret - יצירה ושימוש {#secret}

Secret דומה ל-ConfigMap במבנה, אך הערכים נשמרים מקודדים ב-Base64 (**שימו לב: זה קידוד, לא הצפנה!**).

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: db-credentials
type: Opaque
data:
  username: YWRtaW4=          # echo -n 'admin' | base64
  password: UyVwZXJTZWNyZXQh   # echo -n 'S%perSecret!' | base64
```

### דרך מומלצת יותר - `stringData` (בלי קידוד ידני)
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: db-credentials
type: Opaque
stringData:
  username: admin
  password: S%perSecret!
```

### יצירה מ-CLI
```bash
kubectl create secret generic db-credentials \
  --from-literal=username=admin \
  --from-literal=password='S%perSecret!'
```

### שימוש כמשתני סביבה
```yaml
env:
  - name: DB_PASSWORD
    valueFrom:
      secretKeyRef:
        name: db-credentials
        key: password
```

### שימוש כ-Volume (מומלץ יותר ל-secrets רבים)
```yaml
volumes:
  - name: secret-volume
    secret:
      secretName: db-credentials
      defaultMode: 0400   # הרשאות קריאה בלבד
```

---

## סוגי Secrets {#סוגי-secrets}

| סוג (`type`) | שימוש |
|---|---|
| `Opaque` | ברירת מחדל, מידע כללי מוצפן |
| `kubernetes.io/dockerconfigjson` | credentials לרישום קונטיינרים פרטי (image pull secret) |
| `kubernetes.io/tls` | תעודת TLS + מפתח פרטי |
| `kubernetes.io/service-account-token` | טוקן לזיהוי ServiceAccount |
| `kubernetes.io/basic-auth` | שם משתמש וסיסמה |
| `kubernetes.io/ssh-auth` | מפתח SSH פרטי |

### דוגמה: Image Pull Secret לרישום פרטי
```bash
kubectl create secret docker-registry regcred \
  --docker-server=myregistry.example.com \
  --docker-username=myuser \
  --docker-password=mypassword \
  --docker-email=me@example.com
```

```yaml
spec:
  imagePullSecrets:
    - name: regcred
  containers:
    - name: app
      image: myregistry.example.com/myapp:1.0
```

---

## הצפנת Secrets ב-etcd {#הצפנה}

**חשוב לדעת לצורך ראיון עבודה:** כברירת מחדל, Kubernetes **לא מצפין** Secrets ב-etcd - הם נשמרים שם רק ב-Base64 (שזה בעצם טקסט גלוי, לא הצפנה אמיתית!). כדי לאבטח בפועל צריך:

1. להפעיל **Encryption at Rest** ב-etcd (`EncryptionConfiguration`)
2. להגביל גישה עם **RBAC**
3. לשקול פתרון חיצוני לניהול סודות (ראו למטה)

---

## כלים חיצוניים לניהול Secrets {#כלים-חיצוניים}

בסביבות production רבות לא משתמשים ב-Secret המובנה בלבד, אלא בפתרונות ייעודיים:

- **HashiCorp Vault** - ניהול סודות מרכזי עם רוטציה אוטומטית
- **External Secrets Operator** - מסנכרן סודות מ-AWS Secrets Manager / GCP Secret Manager / Vault לתוך Kubernetes Secrets
- **Sealed Secrets** (Bitnami) - מאפשר לשמור Secrets מוצפנים ב-Git בבטחה

---

## פקודות kubectl שימושיות {#פקודות}

```bash
# הצגת כל ה-ConfigMaps וה-Secrets
kubectl get configmaps
kubectl get secrets

# צפייה בתוכן (Secret מוצג מקודד ב-base64)
kubectl get secret db-credentials -o yaml

# פענוח ערך מ-Secret
kubectl get secret db-credentials -o jsonpath='{.data.password}' | base64 -d

# עריכה חיה
kubectl edit configmap app-config

# מחיקה
kubectl delete secret db-credentials
```

---

## טיפים וטריקים {#טיפים}

1. **לעולם אל תשמרו Secret לא מוצפן ב-Git!** אם צריך GitOps, השתמשו ב-Sealed Secrets או ב-External Secrets Operator.
2. **`stringData` עדיף על `data`** ביצירה ידנית - נמנעים מטעויות קידוד base64 ידניות.
3. **immutable ConfigMaps/Secrets** - הוסיפו `immutable: true` לביצועים טובים יותר ולמניעת שינויים לא מכוונים (Kubernetes 1.21+); כדי לשנות תצטרכו ליצור אובייקט חדש.
4. **restart אוטומטי בעדכון config** - Deployment לא עושה rolling restart אוטומטי כשה-ConfigMap שהוא צורך משתנה. פתרון נפוץ: כלי כמו **Reloader** (stakater/Reloader) שמזהה שינוי ומפעיל rollout restart.
5. **בדקו הרשאות קריאה** - כשמעבירים Secret כ-Volume, כדאי להגדיר `defaultMode: 0400` כדי להגביל הרשאות קריאה.

---

## שאלות ראיון עבודה {#שאלות}

**ש: מה ההבדל בין ConfigMap ל-Secret?**
ת: מבחינה טכנית הם דומים מאוד במבנה, אבל Secret מיועד למידע רגיש ומוצג מקודד ב-Base64 (לא מוצפן כברירת מחדל!), בעוד ConfigMap מיועד למידע לא רגיש ומוצג כטקסט גלוי.

**ש: האם Secret ב-Kubernetes מוצפן?**
ת: לא כברירת מחדל - הוא רק מקודד ב-Base64, שזו לא הצפנה (אפשר לפענח בקלות). כדי להצפין באמת ב-etcd צריך להגדיר Encryption at Rest, ולרוב מומלץ להשתמש בפתרון חיצוני כמו Vault.

**ש: מה קורה כשמעדכנים ConfigMap שכבר מחובר ל-Pod רץ?**
ת: אם הוא מחובר כ-Volume, הקובץ יתעדכן אוטומטית תוך זמן קצר (תלוי ב-kubelet sync period), אבל האפליקציה צריכה לתמוך ב-hot reload. אם הוא מחובר כמשתנה סביבה - לא יתעדכן כלל, כי משתני סביבה נקבעים רק בזמן יצירת הקונטיינר, וצריך restart.

**ש: מה ההבדל בין `data` ל-`stringData` ב-Secret?**
ת: `data` מצפה לערכים מקודדים כבר ב-Base64. `stringData` מאפשר להכניס ערך רגיל בטקסט, ו-Kubernetes מקודד אותו אוטומטית - נוח יותר ופחות טעויות.

**ש: איך מתמודדים עם Secrets ב-GitOps בלי לחשוף אותם בגלוי ב-Git?**
ת: משתמשים בכלים כמו Sealed Secrets (מצפין את ה-Secret כך שרק ה-controller בקלאסטר יכול לפענח אותו) או External Secrets Operator שמושך סודות בזמן ריצה ממקור חיצוני מאובטח כמו Vault או AWS Secrets Manager, במקום לשמור אותם בגלוי בריפו.

**ש: מהו imagePullSecret ומתי צריך אותו?**
ת: Secret מסוג `kubernetes.io/dockerconfigjson` שמכיל credentials לרישום קונטיינרים פרטי, כדי ש-kubelet יוכל למשוך (pull) images שאינם ציבוריים.

---

## קישורים חיצוניים {#קישורים}

### תיעוד רשמי
- ConfigMaps: https://kubernetes.io/docs/concepts/configuration/configmap/
- Secrets: https://kubernetes.io/docs/concepts/configuration/secret/
- Encrypting Secret Data at Rest: https://kubernetes.io/docs/tasks/administer-cluster/encrypt-data/
- Twelve-Factor App - Config: https://12factor.net/config

### סרטוני YouTube
- TechWorld with Nana - ConfigMap & Secret: https://www.youtube.com/c/techworldwithnana
- פלייליסט קורס מלא: https://www.youtube.com/playlist?list=PLy7NrYWoggjziYQIDorlXjTvvwweTYoNC

---

**הקודם:** [מדריך 3 - Services](./03-services-networking.md) | **הבא:** [מדריך 5 - אחסון ו-Volumes](./05-storage-volumes.md)
