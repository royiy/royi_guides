# מדריך 10: שאלות ראיון עבודה ב-OpenShift + טיפים וטריקים כלליים

## חלק א': שאלות ראיון עבודה - יסודות (Junior/Mid)

### 1. מה ההבדל בין OpenShift ל-Kubernetes?
**תשובה:** OpenShift בנוי על גבי Kubernetes ומוסיף עליו: קונסולת ניהול גרפית, מנגנון SCC לאבטחה מחמירה יותר, מערכת Build מובנית (S2I, BuildConfig), Route לחשיפה חיצונית (בנוסף ל-Ingress), OLM לניהול Operators, ותמיכה ארגונית מלאה מ-Red Hat. כל מה שרץ ב-Kubernetes רגיל יכול לרוץ גם ב-OpenShift.

### 2. מה זה Pod ולמה לא עובדים איתו ישירות בפרודקשן?
**תשובה:** Pod הוא היחידה הקטנה ביותר להרצת קונטיינר/ים. הבעיה: Pod עצמאי לא מתאושש אוטומטית אם הוא קורס. לכן תמיד עובדים דרך Deployment/StatefulSet/DaemonSet שמנהלים ReplicaSet שדואג ליצור Pod מחדש במקרה כשל.

### 3. מה ההבדל בין Deployment ל-DeploymentConfig?
**תשובה:** Deployment הוא native ל-Kubernetes ומנוהל דרך ReplicaSet, DeploymentConfig הוא ייחודי ל-OpenShift, legacy, מנוהל דרך ReplicationController, ותומך ב-triggers אוטומטיים מ-ImageStream ו-lifecycle hooks. Red Hat ממליצה כיום להשתמש ב-Deployment הרגיל בפרויקטים חדשים.

### 4. מה זה Route וכיצד הוא שונה מ-Service?
**תשובה:** Service מספק כתובת יציבה **בתוך** הקלאסטר (internal load balancing). Route חושף שירות פנימי החוצה לאינטרנט, דרך ה-HAProxy Router, ותמיד "יושב" מעל Service קיים - הוא לא יכול לחשוף פוד ישירות.

### 5. מה זה SCC (Security Context Constraints)?
**תשובה:** מנגנון אבטחה ייחודי ל-OpenShift שקובע אילו הרשאות אבטחה מותרות לפוד - כמו האם מותר לרוץ כ-root, אילו Linux capabilities מותרות, אילו volume types מותרים. ברירת המחדל `restricted-v2` אוסרת ריצה כ-root ומחייבת UID רנדומלי.

### 6. מהם הסוגים השונים של Service?
**תשובה:** `ClusterIP` (פנימי בלבד, ברירת מחדל), `NodePort` (פורט קבוע על כל node), `LoadBalancer` (דורש תמיכת ספק ענן), ו-`Headless` (בלי ClusterIP, שימושי ל-StatefulSets לקבלת DNS ישיר לכל פוד).

### 7. מה ההבדל בין readinessProbe ל-livenessProbe?
**תשובה:** `readinessProbe` קובע האם הפוד מוכן לקבל תעבורה (אם נכשל - מוסר מה-Service אבל לא נהרג). `livenessProbe` קובע האם הפוד "חי" בכלל (אם נכשל - הפוד מקבל restart). בלבול ביניהם עלול לגרום ל-restart loops מיותרים כשבעצם הבעיה זמנית (למשל התחברות איטית ל-DB).

### 8. מה זה ImageStream ומה היתרון שלו?
**תשובה:** abstraction ייחודי ל-OpenShift שעוקב אחר תגיות תמונות ומאפשר triggers אוטומטיים - כאשר תמונה חדשה נכנסת ל-ImageStream, כל Deployment/DC שמצביע עליה יכול להתעדכן אוטומטית, בלי webhook חיצוני.

### 9. מה זה S2I (Source-to-Image)?
**תשובה:** מנגנון שלוקח קוד מקור מ-Git ו-builder image (כמו Node.js/Python/Java) ובונה תמונת container מוכנה - בלי צורך לכתוב Dockerfile ידנית. מריץ תהליך assemble+run מוגדר מראש.

## חלק ב': שאלות ברמה בינונית-מתקדמת

### 10. הסבירו את שלושת סוגי ה-TLS Termination ב-Route.
**תשובה:**
- **edge** - ה-TLS מסתיים ב-Router, מהראוטר לפוד זה HTTP רגיל (הכי נפוץ).
- **passthrough** - ה-TLS עובר "בשלמותו" עד הפוד, האפליקציה עצמה מנהלת אותו.
- **reencrypt** - ה-TLS מסתיים ב-Router, ואז נפתח מחדש חיבור TLS חדש פנימה לפוד (compliance מחמיר).

### 11. איך עובד RollingUpdate ומה משמעות maxUnavailable / maxSurge?
**תשובה:** RollingUpdate מחליף פודים ישנים בחדשים בהדרגה. `maxUnavailable` קובע כמה פודים מקסימום יכולים להיות לא זמינים בו-זמנית במהלך העדכון. `maxSurge` קובע כמה פודים נוספים מעל ה-replicas המקורי אפשר ליצור זמנית. לדוגמה `maxUnavailable: 0, maxSurge: 1` = zero-downtime מוחלט, אבל דורש קיבולת נוספת זמנית.

### 12. מה ההבדל בין PV ל-PVC?
**תשובה:** `PersistentVolume` (PV) הוא "חתיכת" אחסון פיזי/וירטואלי בפועל בקלאסטר. `PersistentVolumeClaim` (PVC) הוא "בקשה" של המשתמש לקבל אחסון - כמו הזמנת חדר במלון. StorageClass מגדיר איך PV נוצר אוטומטית (dynamic provisioning) כשמגיע PVC חדש.

### 13. מה ההבדל בין accessModes RWO, RWX, ROX?
**תשובה:** `ReadWriteOnce` (RWO) - node אחד יכול לכתוב. `ReadWriteMany` (RWX) - כמה nodes יכולים לכתוב במקביל (לא כל backend תומך). `ReadOnlyMany` (ROX) - כמה nodes, קריאה בלבד. `ReadWriteOncePod` (RWOP) - פוד יחיד בלבד, הכי מחמיר.

### 14. מה קורה כשפוד נכשל ב-OOMKilled ואיך מתקנים?
**תשובה:** הקונטיינר חרג ממגבלת הזיכרון שהוגדרה ב-`resources.limits.memory` והמערכת הרגה אותו כדי להגן על ה-node. פתרון: `oc describe pod` יראה `Reason: OOMKilled` תחת Last State, ואז יש להגדיל את ה-limit או לחקור memory leak באפליקציה.

### 15. הסבירו את ההבדל בין Role ל-ClusterRole, ובין RoleBinding ל-ClusterRoleBinding.
**תשובה:** `Role` תקף לnamespace ספציפי בלבד. `ClusterRole` תקף לכל הקלאסטר (או ניתן לקשור ל-namespace ספציפי גם כן, לצורך reuse). `RoleBinding` מקשר הרשאות בתוך namespace יחיד. `ClusterRoleBinding` מקשר הרשאות בכל הקלאסטר.

### 16. מה זה Operator ו-CRD?
**תשובה:** CRD (Custom Resource Definition) מלמד את Kubernetes API "type" חדש. Operator הוא בקר (controller) שמריץ reconciliation loop מתמיד כדי לוודא שהמצב בפועל תואם את המצב הרצוי, מרחיב יכולות ניהול אוטומטי (backup, upgrade, self-healing) מעבר למה ש-Deployment/StatefulSet רגילים מספקים.

### 17. מה ההבדל בין Helm ל-Operator?
**תשובה:** Helm מתמקד בפריסה חד-פעמית ("templating + install") ואינו כולל לוגיקה תפעולית מתמשכת. Operator כולל לוגיקה עסקית מתמשכת (reconciliation loop) - מתאים לניהול אפליקציות stateful מורכבות שדורשות התערבות אוטומטית לאורך זמן.

### 18. איך מגדילים אוטומטית מספר פודים לפי עומס (Autoscaling)?
**תשובה:** באמצעות **HPA** (Horizontal Pod Autoscaler) שמגדיל/מקטין מספר replicas לפי מטריקות (CPU, memory, custom metrics). ל-VPA (Vertical) שמתאים אוטומטית את ה-resources requests/limits. ל-Cluster Autoscaler שמוסיף/מוריד nodes שלמים מהקלאסטר לפי דרישת קיבולת.

### 19. מה זה NetworkPolicy ולמה חשוב להגדיר אותה?
**תשובה:** כברירת מחדל כל הפודים בקלאסטר יכולים לתקשר חופשי ביניהם. NetworkPolicy מגביל תעבורה נכנסת/יוצאת ברמת namespace/pod, מיישם עקרון Zero Trust - חשוב מאוד ב-production, במיוחד בסביבות multi-tenant.

### 20. תארו את זרימת ה-CI/CD המובנית ב-OpenShift (מ-git push ועד production).
**תשובה:** Git push → Webhook מפעיל BuildConfig → S2I/Docker/Pipeline strategy בונה תמונה → נשמרת ב-ImageStream (internal registry) → trigger אוטומטי מעדכן את ה-Deployment → rolling update מבצע פריסה הדרגתית → Route מפנה תעבורה לפודים החדשים.

## חלק ג': שאלות תרחיש (Scenario-based) - לתפקידי DevOps/SRE

### 21. אפליקציה חדשה לא נגישה למרות שהפודים Running - איך תאבחנו?
1. `oc get endpoints <svc-name>` - האם ה-Service מוצא פודים בכלל? (בעיית selector נפוצה)
2. `oc get route` - האם ה-Route קיים ומצביע ל-Service הנכון?
3. `oc rsh` לפוד אחר ו-`curl` פנימית לבדוק אם השירות עונה כלל
4. בדיקת NetworkPolicy שאולי חוסמת

### 22. Deployment תקוע ב-rolling update, פודים חדשים לא עולים - מה בודקים?
```bash
oc rollout status deployment/my-app
oc get rs -l app=my-app   # יש ReplicaSet ישן וחדש - מה קורה עם החדש?
oc describe pod <new-pod>  # למה הוא לא Ready? Probe נכשל? Resources?
```

### 23. איך הייתם מבצעים Blue-Green Deployment ב-OpenShift?
תשובה: יצירת שני Deployments נפרדים (`app-blue`, `app-green`) עם Service/Route שמצביע רק על אחד מהם. כשגרסה חדשה מוכנה, משנים את ה-selector של ה-Service (או weight ב-Route עם `alternateBackends`) כדי להעביר תעבורה בהדרגה, ומאפשרים rollback מיידי על ידי חזרה לגרסה הקודמת.

### 24. הקלאסטר במצוקת משאבים - כיצד תזהו איזה namespace "אוכל" הכי הרבה?
```bash
oc adm top pods -A --sort-by=memory
oc describe resourcequota -A
```

### 25. איך מבטיחים zero-downtime בזמן שדרוג node (drain)?
תשובה: שילוב של PodDisruptionBudget (מגביל כמה פודים יכולים להיות לא זמינים בו-זמנית) יחד עם replicas מרובים ו-anti-affinity rules כדי לפזר פודים על nodes שונים, כך ש-drain של node בודד לא מוריד את כל השירות.

## חלק ד': טיפים וטריקים כלליים לעבודה יומיומית

1. **`oc get all -l app=my-app`** - הדרך המהירה ביותר לראות את כל המשאבים השייכים לאפליקציה ספציפית, במקום לחפש ידנית.
2. **`oc explain <resource>.spec --recursive`** - מציג את כל השדות האפשריים ברזולוציה מלאה, מעולה כשלא בטוחים באיזה שדה להשתמש.
3. **`oc get pods -o custom-columns`** - התאמה אישית של פלט לטבלה קריאה יותר:
   ```bash
   oc get pods -o custom-columns=NAME:.metadata.name,STATUS:.status.phase,NODE:.spec.nodeName
   ```
4. **תמיד עבדו declarative (`oc apply -f`), לא imperative (`oc create`)** בסביבות production - כך יש לכם היסטוריה מלאה ב-Git (GitOps).
5. **בדקו `oc get co` (ClusterOperators) לפני שאתם מאבחנים בעיה באפליקציה בודדת** - לפעמים הבעיה היא ברמת הקלאסטר כולו.
6. **`oc adm must-gather`** - תמיד להריץ לפני פתיחת קריאת תמיכה ל-Red Hat.
7. **הגדירו תמיד resources.requests/limits** - זה משפיע גם על scheduling וגם על QoS class (Guaranteed/Burstable/BestEffort) שקובע מי "מקבל אקזקוט" ראשון בזמן לחץ.
8. **הימנעו מ-`:latest` tag ב-production** - תמיד השתמשו בתגית ספציפית (semantic version או SHA) כדי להבטיח reproducibility.
9. **`oc get events --field-selector type=Warning -A`** - סינון מהיר לכל האזהרות בכל הקלאסטר, מעולה ל-triage מהיר.
10. **למדו GitOps (Argo CD / OpenShift GitOps)** - כמעט כל תפקיד OpenShift ארגוני מודרני דורש שליטה בגישה הזו, במקום `oc apply` ידני.

## חלק ה': טעויות נפוצות שכדאי להימנע מהן

| טעות | למה זה בעיה | הפתרון |
|---|---|---|
| להשתמש ב-DeploymentConfig בפרויקט חדש | Deprecated, בלי roadmap | להשתמש ב-Deployment הרגיל |
| להעניק `cluster-admin` "כדי שיעבוד" | סיכון אבטחה חמור | לחפש את ה-Role המדויק הנדרש |
| להריץ קונטיינר כ-root ולבקש `anyuid` | פותח פרצת אבטחה | לתקן את ה-Dockerfile עם USER לא-root |
| לא להגדיר resources.limits | סיכון ל-noisy neighbor / OOM לא צפוי | תמיד להגדיר requests+limits |
| להשתמש ב-emptyDir לנתונים חשובים | הנתונים נמחקים עם הפוד | להשתמש ב-PVC |
| לבלבל בין readiness ל-liveness probe | restart loops מיותרים | להבין את המשמעות של כל אחד |
| לא להגדיר PodDisruptionBudget | downtime לא מתוכנן בזמן תחזוקה | להגדיר PDB לכל שירות קריטי |

## קישורים חיצוניים

### תיעוד רשמי
- Red Hat OpenShift essentials (ריכוז משאבים למועמדים): https://docs.redhat.com/en/essentials/openshift
- תיעוד OpenShift Container Platform המלא: https://docs.redhat.com/en/documentation/openshift_container_platform/4.22
- Red Hat Learning Paths ל-OpenShift: https://developers.redhat.com/learn/openshift

### סרטוני יוטיוב מומלצים להכנה לראיון
- Red Hat OpenShift Administration Complete Video Course (EX280 - הכנה למבחן הסמכה, מעולה גם לראיון): https://www.oreilly.com/library/view/red-hat-openshift/9780137441938/
- OpenShift: Beginner to Advanced Complete Course: https://www.youtube.com/watch?v=zVkw-qLp_H4
- Part 1: Red Hat OpenShift for Absolute Beginners: https://www.youtube.com/watch?v=Z_lTLUZxOBk
- Red Hat OpenShift Installation Step by Step Guide (SNO, EX280/DO280): https://www.youtube.com/watch?v=K30USMxTAa0

## המלצה לתרגול לפני ראיון

1. הקימו קלאסטר **OpenShift Local (CRC)** במחשב שלכם או השתמשו ב-**Developer Sandbox** החינמי.
2. תרגלו את כל 20 השאלות למעלה בפועל - לא רק לקרוא, אלא באמת להריץ פקודות ולראות את הפלט.
3. נסו לשבור דברים בכוונה (סילוף selector, מגבלת memory נמוכה מדי) ולתרגל אבחון עם `oc describe`/`oc logs`/`oc get events`.
4. אם אתם מכוונים לתפקיד DevOps/SRE בכיר - למדו גם GitOps (Argo CD) ו-Tekton Pipelines, אלו נושאים "חמים" מאוד בראיונות 2025-2026.

---
**בהצלחה בראיון! 🎯**
