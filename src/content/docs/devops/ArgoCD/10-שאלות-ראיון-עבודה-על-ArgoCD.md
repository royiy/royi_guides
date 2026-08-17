# מדריך 10: שאלות ראיון עבודה על ArgoCD (עם תשובות מלאות)

## שאלות בסיסיות (Junior/Mid)

### 1. מה זה ArgoCD ובאיזו בעיה הוא פותר?

**תשובה**: ArgoCD הוא כלי GitOps מבוסס Kubernetes, שמסנכרן באופן רציף בין המצב המוגדר ב-Git (Desired State) לבין המצב בפועל ב-Cluster (Live State). הוא פותר את הבעיה של Deploy ידני/לא עקבי, וחוסר Audit Trail ברור לגבי מה שונה, מתי ועל ידי מי.

### 2. מה ההבדל בין GitOps (Pull-based) ל-CI/CD מסורתי (Push-based)?

**תשובה**: ב-Push-based, כלי ה-CI (Jenkins, GitLab CI) מריץ `kubectl apply` ישירות מול ה-Cluster, מה שמצריך לתת לו הרשאות Cluster. ב-Pull-based (GitOps), סוכן שרץ *בתוך* ה-Cluster (ArgoCD) מושך את השינויים מ-Git, כך שאין צורך לחשוף Credentials של ה-Cluster לכלי חיצוני, ויש מנגנון מובנה לזיהוי Drift.

### 3. מה ההבדל בין Sync Status ל-Health Status?

**תשובה**: 
- **Sync Status** אומר האם המצב ב-Cluster זהה למה שכתוב ב-Git (`Synced` / `OutOfSync`).
- **Health Status** אומר האם המשאבים בפועל "בריאים" ופועלים (`Healthy`, `Progressing`, `Degraded`, `Missing`, `Suspended`).

Application יכול להיות `Synced` אבל `Degraded` – למשל אם ה-YAML תקין ותואם ל-Git, אבל ה-Pod בפועל קורס.

### 4. מה זה `selfHeal` ומתי כדאי/לא כדאי להשתמש בו?

**תשובה**: `selfHeal: true` גורם ל-ArgoCD לתקן אוטומטית כל סטייה (Drift) מה-Git – אם מישהו עשה שינוי ידני ב-Cluster, ArgoCD יחזיר את המצב לזה שכתוב ב-Git. זה מצוין לשמירה על עקביות, אבל מסוכן אם לא מתלווה אליו Alerting טוב – כי מפתח שעושה `kubectl edit` חירום בזמן תקלה עלול לגלות שהתיקון "נעלם" תוך דקות.

### 5. מה ההבדל בין `prune` ל-`selfHeal`?

**תשובה**: `prune` מוחק משאבים שהוסרו מה-Git (אבל עדיין קיימים ב-Cluster). `selfHeal` מתקן שינויים שנעשו ידנית למשאבים שעדיין מוגדרים ב-Git. שניהם חלק מ-`syncPolicy.automated`, אך מטפלים בתרחישים שונים.

## שאלות ברמת Mid-Senior

### 6. הסבירו את הארכיטקטורה של ArgoCD ותפקיד כל רכיב.

**תשובה**: (ראו מדריך 3 לפירוט מלא)
- `argocd-server` – API Gateway ו-UI.
- `argocd-repo-server` – מרנדר מניפסטים מ-Git (Helm/Kustomize/Raw YAML).
- `argocd-application-controller` – משווה Desired מול Live, מבצע Sync.
- `argocd-dex-server` – אימות SSO/OIDC.
- `argocd-redis` – Cache פנימי.

### 7. מה זה Sync Wave, ומתי הייתם משתמשים בו?

**תשובה**: Sync Wave (`argocd.argoproj.io/sync-wave`) קובע סדר פריסה של משאבים בתוך אותו Application. שימושי כשיש תלות בין רכיבים – למשל CRD שצריך לעלות לפני CR שמשתמש בו, או Migration Job שצריך לרוץ לפני עליית ה-Backend. מספרים נמוכים רצים קודם.

### 8. מה ההבדל בין `PreSync`, `Sync`, `PostSync` ו-`SyncFail` Hooks?

**תשובה**: אלו Annotations על Jobs שמריצים לוגיקה בשלבים שונים של תהליך הסנכרון: `PreSync` לפני שהשלב הרגיל מתחיל (למשל DB Migration), `PostSync` אחרי שהכל Healthy (למשל Smoke Test), ו-`SyncFail` אם ה-Sync נכשל (למשל שליחת התראה).

### 9. איך Ic הייתם פותרים מצב שבו Application תמיד מציג `OutOfSync` למרות שהמניפסטים נראים זהים?

**תשובה**: לרוב זו תופעה של שדות שמוזרקים דינמית ל-Cluster (Defaults מ-Admission Webhooks, HPA ששולט על `replicas`, Timestamps אוטומטיים). הפתרון: להגדיר `ignoreDifferences` ב-Application spec עם `jsonPointers` או `jqPathExpressions` שמכוונים בדיוק לשדות הבעייתיים.

### 10. מה זה ApplicationSet, ובאיזה תרחיש הוא עדיף על App of Apps?

**תשובה**: ApplicationSet יוצר Applications באופן דינמי מתוך Generator (List, Cluster, Git Directories/Files, Matrix ועוד) + Template. הוא עדיף כשצריך ליצור עשרות/מאות Applications דומים (למשל Application לכל Cluster או לכל תיקיית שירות), כי הוא מונע שכפול YAML ידני. App of Apps מתאים יותר לתרחישים סטטיים וקטנים יותר של "Bootstrap" ראשוני.

### 11. איך Ic מנהלים Multi-tenancy (ריבוי צוותים) ב-ArgoCD?

**תשובה**: באמצעות `AppProject` – שמגדיר לכל צוות אילו Repos מותר למשוך מהם (`sourceRepos`), לאילו Cluster+Namespace מותר לפרוס (`destinations`), אילו סוגי משאבים מותר ליצור (`clusterResourceWhitelist`), ו-Roles עם RBAC ספציפי לפרויקט. משלימים זאת עם RBAC גלובלי (`argocd-rbac-cm`) שממפה קבוצות SSO לתפקידים.

### 12. איך מתמודדים עם Secrets בגישת GitOps, כשלא רוצים לשמור אותם גלויים ב-Git?

**תשובה**: כמה גישות מקובלות:
- **Sealed Secrets** – מצפינים את ה-Secret עם מפתח ציבורי לפני ה-Commit; רק ה-Controller ב-Cluster יכול לפענח.
- **External Secrets Operator** – שולף Secrets בזמן ריצה ממקור חיצוני (Vault, AWS Secrets Manager).
- **SOPS** – מצפין קבצים שלמים, עם אינטגרציה דרך Plugin.
לעולם לא שומרים Secret כ-Plain Text ב-Git.

## שאלות מתקדמות (Senior/Staff)

### 13. איך הייתם מתכננים ArgoCD ל-Scale גדול (מאות Applications, עשרות Clusters)?

**תשובה**: כמה כיוונים:
- **Sharding** של ה-`application-controller` בין כמה Instances, לפי Cluster.
- הגדלת Replicas ל-`repo-server` (בדרך כלל ה-Bottleneck).
- שימוש ב-ApplicationSet עם Cluster Generator במקום ניהול ידני.
- שקילת ארכיטקטורת Hub-and-Spoke מול ArgoCD-per-Cluster, בהתאם לדרישות Resilience.
- Monitoring צמוד עם Prometheus Metrics ש-ArgoCD חושף (`argocd_app_sync_total`, `argocd_app_reconcile_count` וכו').

### 14. מה ההבדל בין Rollback ב-ArgoCD ל-Git Revert, ולמה עדיף האחרון?

**תשובה**: `argocd app rollback` משנה את המצב ב-Cluster חזרה לגרסה קודמת, אבל **לא משנה את Git**. אם `automated sync` פעיל, ArgoCD "יתקן" את זה בחזרה לגרסה העדכנית ב-Git ברגע שירוץ Reconciliation הבא – מה שיבטל את ה-Rollback. הדרך הנכונה ב-GitOps אמיתי היא לבצע `git revert` על ה-Commit הבעייתי, כך ש-Git עצמו (מקור האמת) משקף את המצב הרצוי.

### 15. איך Ic הייתם מיישמים Blue-Green או Canary Deployment עם ArgoCD?

**תשובה**: ArgoCD עצמו לא מבצע Progressive Delivery מובנה – לשם כך יש לשלב עם **Argo Rollouts**, פרויקט אחות שמחליף `Deployment` רגיל ב-CRD בשם `Rollout`, ותומך ב-Canary/Blue-Green analysis (כולל אינטגרציה עם Prometheus/Datadog לבדיקת מדדים לפני שממשיכים את ה-Rollout).

### 16. איך מטפלים בתלויות בין CRDs לבין Custom Resources באותו Application?

**תשובה**: משתמשים ב-Sync Waves – ה-CRD מקבל Wave נמוך יותר (למשל `0`), וה-CR שמשתמש בו מקבל Wave גבוה יותר (למשל `1`). ArgoCD ממתין שה-Wave הקודם יגיע ל-Healthy לפני שהוא ממשיך לבא אחריו. חשוב גם לוודא ש-`Validate=false` מוגדר אם ה-CRD חדש ועדיין לא "ידוע" ל-Kubernetes API בזמן ה-Apply הראשוני.

### 17. מה קורה בפועל כשאתם לוחצים "Sync" ב-UI? תארו את השרשרת המלאה.

**תשובה**: 
1. הבקשה מגיעה ל-`argocd-server` (API).
2. ה-`application-controller` מקבל את הבקשה ליזום Operation.
3. ה-`repo-server` משוכפל/מרענן את ה-Git Repo, ומרנדר את המניפסטים (Helm/Kustomize/Raw).
4. ה-`application-controller` משווה בין המניפסטים המרונדרים ל-Live State (מ-Cache/Kubernetes API).
5. מתבצע `kubectl apply` (בפועל – שימוש ב-Kubernetes API ישירות) על כל משאב, לפי סדר ה-Sync Waves.
6. Hooks (`PreSync`/`PostSync`) רצים בזמנים המתאימים.
7. ה-Health Checks בודקים את מצב הבריאות של כל משאב.
8. הסטטוס מתעדכן ל-`Synced` / `Healthy` (או שגיאה מתאימה).

### 18. איך Ic הייתם מדבגים מצב שבו ה-`repo-server` נכשל לרנדר Helm Chart מסוים?

**תשובה**: 
```bash
kubectl logs -n argocd deploy/argocd-repo-server --tail=200
```
בודקים אם השגיאה היא Syntax (`helm template` נכשל לוקאלית), גישה ל-Chart Repository (Timeout/Auth), או גרסת Helm לא תואמת (למשל שימוש בפיצ'רים חדשים מ-Helm 3.14+ בזמן ש-ArgoCD מותקן עם גרסה ישנה יותר). מומלץ תמיד לשחזר את ה-Render מקומית עם `helm template` לפני שחוקרים בתוך ה-Cluster.

### 19. מה ההבדל בין Namespace-scoped Install ל-Cluster-scoped Install?

**תשובה**: Cluster-scoped נותן ל-ArgoCD גישה לפרוס לכל Namespace/Cluster שהוא מכיר. Namespace-scoped מגביל instance ArgoCD בודד ל-Namespace יחיד – שימושי בארגונים שרוצים ArgoCD נפרד לכל צוות/Tenant מטעמי בידוד ואבטחה, אבל דורש התקנת מספר Instances.

### 20. איך Ic הייתם מטמיעים ArgoCD כחלק מפייפליין CI/CD מלא (יחד עם GitHub Actions/Jenkins)?

**תשובה**: תרשים זרימה טיפוסי:
1. מפתח עושה Push ל-Repo של הקוד.
2. CI (GitHub Actions) בונה Image, מריץ טסטים, ודוחף ל-Registry.
3. CI מעדכן (בעצמו, או דרך Image Updater) את ה-Tag ב-Repo ה-GitOps (למשל דרך `yq`/`kustomize edit set image` + Commit + PR).
4. PR עובר Review (אופציונלי) וממוזג ל-`main`.
5. ArgoCD מזהה את השינוי ב-Git תוך שניות (Webhook או Poll), ומבצע Sync (אוטומטי או ידני) ל-Cluster.
6. Notifications שולחות עדכון ל-Slack על הצלחה/כישלון.

חשוב להדגיש בראיון: ה-CI **אף פעם לא נוגע ישירות ב-Cluster** – כל התקשורת עם ה-Cluster עוברת רק דרך ArgoCD, וזה בדיוק הרעיון המרכזי של GitOps.

## טיפ אחרון להצלחה בראיון

מראיינים אוהבים לשאול "ספר לי על מקרה אמיתי שבו טיפלת בבעיה עם ArgoCD" – הכינו מראש דוגמה קונקרטית (למשל: פתרון Drift Detection, אופטימיזציה של Sync Performance, או מעבר מ-App of Apps ל-ApplicationSet), עם מספרים ותוצאות מדידות אם אפשר.

## קישורים חיצוניים

- 📖 [Argo CD Documentation (מלא)](https://argo-cd.readthedocs.io/en/stable/)
- 📖 [Argo Rollouts – Progressive Delivery](https://argo-rollouts.readthedocs.io/)
- 💻 [Argo CD – GitHub Repository](https://github.com/argoproj/argo-cd)
- 🎥 [חיפוש יוטיוב: "ArgoCD interview questions and answers"](https://www.youtube.com/results?search_query=argocd+interview+questions+and+answers)
- 🎥 [חיפוש יוטיוב: "Kubernetes GitOps interview questions"](https://www.youtube.com/results?search_query=kubernetes+gitops+interview+questions)

---

בהצלחה בראיון! 🚀 זו הייתה הסדרה המלאה בת 10 המדריכים על ArgoCD.
