---
title: "מבוא ל-OpenShift וארכיטקטורה"
category: DevOps/OpenShift
part: 1/10
---

# מדריך 1: מבוא ל-OpenShift וארכיטקטורה

## מה זה OpenShift?

OpenShift Container Platform (OCP) הוא פלטפורמת קונטיינרים ארגונית (Enterprise Kubernetes Distribution) שפותחה על ידי Red Hat. בבסיסה נמצא **Kubernetes**, אך OpenShift מוסיף עליו שכבות משמעותיות: קונסולת ניהול גרפית (Web Console), מנגנוני אבטחה מחמירים יותר (SCC), מערכת build מובנית (S2I), Operators, רישות מובנה (Routes), ועוד כלים שהופכים אותו למוצר "batteries included" מוכן לסביבות production ארגוניות.

חשוב להבין: **כל דבר שעובד ב-Kubernetes וניל, עובד גם ב-OpenShift** (עם `kubectl` אפשר גם לעבוד מול קלאסטר OpenShift), אבל OpenShift מוסיף שכבת ניהול, אבטחה ו-DevOps שחוסכת המון עבודה ידנית.

גרסת הקוד הפתוח החינמית של OpenShift נקראת **OKD** (Origin Community Distribution) - זו למעשה ה-upstream project.

## למה חברות בוחרות ב-OpenShift ולא ב-Kubernetes וניל?

| היבט | Kubernetes וניל | OpenShift |
|---|---|---|
| התקנה | ידנית, מורכבת (kubeadm, kops וכו') | Installer מובנה, IPI/UPI, תמיכה רשמית |
| אבטחה | Pod Security Standards בסיסי | SCC (Security Context Constraints) - מחמיר יותר, ברירת מחדל בטוחה |
| Build מקוד למאגר תמונות | צריך להקים pipeline בעצמך | S2I (Source-to-Image) מובנה |
| ניתוב תעבורה חיצונית | Ingress בלבד | Route + Ingress, HAProxy מובנה |
| ניהול תוספים | Helm / manual manifests | Operator Lifecycle Manager (OLM), OperatorHub |
| קונסולה גרפית | Dashboard חיצוני (לא סטנדרטי) | Web Console מובנה ועשיר |
| תמיכה ארגונית | תלוי בספק | תמיכה ישירה מ-Red Hat, SLA |
| רישוי | חינם | מסחרי (יש גם OKD חינמי) |

## מבנה הארכיטקטורה

### שכבת התשתית (Infrastructure Layer)
- **RHCOS** (Red Hat Enterprise Linux CoreOS) - מערכת ההפעלה המומלצת לצמתי הקלאסטר, immutable ומנוהלת דרך Machine Config Operator.
- ניתן להריץ גם על RHEL רגיל בתצורות מסוימות (UPI).

### שכבת הבקרה (Control Plane)
מורכבת משלושה (לפחות) צמתי Master, שכל אחד מריץ:
- **kube-apiserver** - נקודת הכניסה היחידה לכל בקשות ה-API.
- **etcd** - מסד נתונים key-value מבוזר ששומר את כל מצב הקלאסטר.
- **kube-controller-manager** ו-**kube-scheduler** - כמו ב-Kubernetes רגיל.
- **openshift-apiserver** - שכבת API נוספת הספציפית ל-OpenShift (Routes, Builds, ImageStreams וכו').
- **Operators** רבים שמנהלים את מרכיבי הקלאסטר עצמו (Cluster Version Operator - CVO).

### שכבת ה-Compute (Worker Nodes)
צמתי Worker מריצים את ה-Pods בפועל:
- **kubelet** - הסוכן שמנהל קונטיינרים בצומת.
- **CRI-O** - runtime הקונטיינרים הרשמי של OpenShift (לא Docker!).
- **SDN/OVN-Kubernetes** - שכבת הרשת בין הפודים.

### דיאגרמת ארכיטקטורה כללית

```
                    ┌─────────────────────────────┐
                    │        Load Balancer        │
                    └──────────────┬───────────────┘
                                   │
      ┌────────────────────────────┼────────────────────────────┐
      │                           │                            │
┌─────▼─────┐              ┌──────▼─────┐               ┌──────▼─────┐
│  Master 1  │              │  Master 2  │               │  Master 3  │
│ etcd+API   │◄────────────►│ etcd+API   │◄─────────────►│ etcd+API   │
│ Scheduler  │              │ Scheduler  │               │ Scheduler  │
└─────┬──────┘              └──────┬─────┘               └──────┬─────┘
      │                            │                            │
      └────────────────────────────┼────────────────────────────┘
                                   │
      ┌────────────────────────────┼────────────────────────────┐
      │                           │                            │
┌─────▼─────┐              ┌──────▼─────┐               ┌──────▼─────┐
│ Worker 1   │              │ Worker 2   │               │ Worker 3   │
│ kubelet    │              │ kubelet    │               │ kubelet    │
│ CRI-O      │              │ CRI-O      │               │ CRI-O      │
│ Pods...    │              │ Pods...    │               │ Pods...    │
└────────────┘              └────────────┘               └────────────┘
```

## מושגי יסוד שחייבים להכיר

- **Project** - בעצם Namespace של Kubernetes, אבל עם שכבת RBAC ומטא-דאטה נוספת של OpenShift.
- **Pod** - יחידת הריצה הבסיסית ביותר, מכיל קונטיינר אחד או יותר.
- **Deployment / DeploymentConfig** - מנגנון שמנהל את מחזור החיים של הפודים (על DeploymentConfig - ה-legacy resource הייחודי ל-OpenShift - נרחיב במדריך 3).
- **Service** - abstraction שמספק כתובת רשת יציבה לקבוצת פודים.
- **Route** - המקבילה הייחודית ל-OpenShift ל-Ingress, מאפשרת חשיפת שירות פנימי לאינטרנט.
- **BuildConfig / ImageStream** - מנגנוני בנייה ומעקב אחר תמונות (Docker/OCI images).
- **Operator** - "אדמיניסטרטור אוטומטי" בקוד, מרחיב את Kubernetes API ומנהל אפליקציות מורכבות.

## דוגמה מעשית: ראיית הקלאסטר מנקודת מבט המשתמש

```bash
# התחברות לקלאסטר
oc login https://api.mycluster.example.com:6443 -u developer -p mypassword

# יצירת פרויקט (namespace) חדש
oc new-project demo-app

# בדיקת כל המשאבים בפרויקט הנוכחי
oc get all

# צפייה במידע כללי על הקלאסטר
oc cluster-info

# צפייה בכל הצמתים (nodes) בקלאסטר
oc get nodes -o wide

# בדיקת גרסת OpenShift
oc version
```

## היכן להריץ OpenShift ללימוד ותרגול (בחינם)

1. **CodeReady Containers (CRC)** / **OpenShift Local** - קלאסטר single-node שרץ על המחשב האישי שלכם (VM). מומלץ ביותר להתחלה.
2. **Developer Sandbox for Red Hat OpenShift** - סביבת ענן חינמית לתקופה מוגבלת, ללא צורך בהתקנה: https://developers.redhat.com/developer-sandbox
3. **Minishift** (legacy, גרסה ישנה יותר, מבוססת OpenShift 3).

### התקנת OpenShift Local (CRC) בקצרה

```bash
# הורדה מהאתר הרשמי, ואז:
crc setup
crc start --cpus 4 --memory 16384
crc console   # פותח את הקונסולה בדפדפן
eval $(crc oc-env)
oc login -u developer https://api.crc.testing:6443
```

## קישורים חיצוניים

### תיעוד רשמי
- תיעוד OpenShift Container Platform (הגרסה העדכנית): https://docs.redhat.com/en/documentation/openshift_container_platform/4.22
- דף המוצר הרשמי של Red Hat OpenShift: https://www.redhat.com/en/technologies/cloud-computing/openshift
- Red Hat Developer - התחלת עבודה עם OpenShift: https://developers.redhat.com/products/openshift/getting-started
- Developer Sandbox חינמי: https://developers.redhat.com/developer-sandbox
- מאגר הקוד הפתוח של התיעוד (GitHub): https://github.com/openshift/openshift-docs

### סרטוני יוטיוב מומלצים
- Red Hat OpenShift for Beginners - הסבר יסודות: https://www.youtube.com/watch?v=Z_lTLUZxOBk
- OpenShift: Beginner to Advanced Complete Course: https://www.youtube.com/watch?v=zVkw-qLp_H4
- Introduction to Red Hat OpenShift Container Platform: https://www.youtube.com/watch?v=dAWPuqZwlOA
- פלייליסט מלא של Red Hat OpenShift: https://www.youtube.com/playlist?list=PLaR6Rq6Z4IqeGIzsnWX1ifTLwJaYBQSUs
- פלייליסט OpenShift Tutorial: https://www.youtube.com/playlist?list=PLnFCwVWiQz4lrK7s1S409fsfm59qdFVOX

## טיפ מקצועי (Pro Tip)

כאשר אתם ניגשים ל-OpenShift לראשונה, זכרו את חוק האצבע החשוב ביותר: **תמיד תעדיפו `oc` על פני `kubectl`** בזמן עבודה מול OpenShift, כי `oc` מודע למשאבים הייחודיים (Route, BuildConfig, Project, DeploymentConfig) ומספק פקודות עזר רבות (`oc new-app`, `oc rsh`, `oc logs -f`, `oc debug`) שלא קיימות ב-`kubectl` הרגיל.

---
**במדריך הבא:** התקנה, הגדרת oc CLI, ניהול פרויקטים ומשתמשים.
