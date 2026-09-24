---
title: "שאלות ראיון עבודה על ArgoCD (עם תשובות מלאות)"
description: "20 שאלות ראיון עבודה על ArgoCD ברמות Junior עד Staff, עם תשובות מפורטות על ארכיטקטורה, Sync, RBAC, ApplicationSets, Rollback ו-Scale."
category: DevOps/ArgoCD
part: 10/10
---

## שאלות בסיסיות (Junior/Mid)

<details class="qa">
<summary>1. מה זה ArgoCD ובאיזו בעיה הוא פותר?</summary>

: ArgoCD הוא כלי GitOps מבוסס Kubernetes, שמסנכרן באופן רציף בין המצב המוגדר ב-Git (Desired State) לבין המצב בפועל ב-Cluster (Live State). הוא פותר את הבעיה של Deploy ידני/לא עקבי, וחוסר Audit Trail ברור לגבי מה שונה, מתי ועל ידי מי.

</details>

<details class="qa">
<summary>2. מה ההבדל בין GitOps (Pull-based) ל-CI/CD מסורתי (Push-based)?</summary>

: ב-Push-based, כלי ה-CI (Jenkins, GitLab CI) מריץ `kubectl apply` ישירות מול ה-Cluster, מה שמצריך לתת לו הרשאות Cluster. ב-Pull-based (GitOps), סוכן שרץ *בתוך* ה-Cluster (ArgoCD) מושך את השינויים מ-Git, כך שאין צורך לחשוף Credentials של ה-Cluster לכלי חיצוני, ויש מנגנון מובנה לזיהוי Drift.

</details>

<details class="qa">
<summary>3. מה ההבדל בין Sync Status ל-Health Status?</summary>

:
- **Sync Status** אומר האם המצב ב-Cluster זהה למה שכתוב ב-Git (`Synced` / `OutOfSync`).
- **Health Status** אומר האם המשאבים בפועל "בריאים" ופועלים (`Healthy`, `Progressing`, `Degraded`, `Missing`, `Suspended`).

Application יכול להיות `Synced` אבל `Degraded` – למשל אם ה-YAML תקין ותואם ל-Git, אבל ה-Pod בפועל קורס.

</details>

<details class="qa">
<summary>4. מה זה <code>selfHeal</code> ומתי כדאי/לא כדאי להשתמש בו?</summary>

: `selfHeal: true` גורם ל-ArgoCD לתקן אוטומטית כל סטייה (Drift) מה-Git – אם מישהו עשה שינוי ידני ב-Cluster, ArgoCD יחזיר את המצב לזה שכתוב ב-Git. זה מצוין לשמירה על עקביות, אבל מסוכן אם לא מתלווה אליו Alerting טוב – כי מפתח שעושה `kubectl edit` חירום בזמן תקלה עלול לגלות שהתיקון "נעלם" תוך דקות.

</details>

<details class="qa">
<summary>5. מה ההבדל בין <code>prune</code> ל-<code>selfHeal</code>?</summary>

: `prune` מוחק משאבים שהוסרו מה-Git (אבל עדיין קיימים ב-Cluster). `selfHeal` מתקן שינויים שנעשו ידנית למשאבים שעדיין מוגדרים ב-Git. שניהם חלק מ-`syncPolicy.automated`, אך מטפלים בתרחישים שונים.

</details>

## שאלות ברמת Mid-Senior

<details class="qa">
<summary>6. הסבירו את הארכיטקטורה של ArgoCD ותפקיד כל רכיב.</summary>

: (ראו מדריך 3 לפירוט מלא)
- `argocd-server` – API Gateway ו-UI.
- `argocd-repo-server` – מרנדר מניפסטים מ-Git (Helm/Kustomize/Raw YAML).
- `argocd-application-controller` – משווה Desired מול Live, מבצע Sync.
- `argocd-dex-server` – אימות SSO/OIDC.
- `argocd-redis` – Cache פנימי.

</details>

<details class="qa">
<summary>7. מה זה Sync Wave, ומתי הייתם משתמשים בו?</summary>

: Sync Wave (`argocd.argoproj.io/sync-wave`) קובע סדר פריסה של משאבים בתוך אותו Application. שימושי כשיש תלות בין רכיבים – למשל CRD שצריך לעלות לפני CR שמשתמש בו, או Migration Job שצריך לרוץ לפני עליית ה-Backend. מספרים נמוכים רצים קודם.

</details>

<details class="qa">
<summary>8. מה ההבדל בין <code>PreSync</code>, <code>Sync</code>, <code>PostSync</code> ו-<code>SyncFail</code> Hooks?</summary>

: אלו Annotations על Jobs שמריצים לוגיקה בשלבים שונים של תהליך הסנכרון: `PreSync` לפני שהשלב הרגיל מתחיל (למשל DB Migration), `PostSync` אחרי שהכל Healthy (למשל Smoke Test), ו-`SyncFail` אם ה-Sync נכשל (למשל שליחת התראה).

</details>

<details class="qa">
<summary>9. איך הייתם פותרים מצב שבו Application תמיד מציג <code>OutOfSync</code> למרות שהמניפסטים נראים זהים?</summary>

: לרוב זו תופעה של שדות שמוזרקים דינמית ל-Cluster (Defaults מ-Admission Webhooks, HPA ששולט על `replicas`, Timestamps אוטומטיים). הפתרון: להגדיר `ignoreDifferences` ב-Application spec עם `jsonPointers` או `jqPathExpressions` שמכוונים בדיוק לשדות הבעייתיים.

</details>

<details class="qa">
<summary>10. מה זה ApplicationSet, ובאיזה תרחיש הוא עדיף על App of Apps?</summary>

: ApplicationSet יוצר Applications באופן דינמי מתוך Generator (List, Cluster, Git Directories/Files, Matrix ועוד) + Template. הוא עדיף כשצריך ליצור עשרות/מאות Applications דומים (למשל Application לכל Cluster או לכל תיקיית שירות), כי הוא מונע שכפול YAML ידני. App of Apps מתאים יותר לתרחישים סטטיים וקטנים יותר של "Bootstrap" ראשוני.

</details>

<details class="qa">
<summary>11. איך מנהלים Multi-tenancy (ריבוי צוותים) ב-ArgoCD?</summary>

: באמצעות `AppProject` – שמגדיר לכל צוות אילו Repos מותר למשוך מהם (`sourceRepos`), לאילו Cluster+Namespace מותר לפרוס (`destinations`), אילו סוגי משאבים מותר ליצור (`clusterResourceWhitelist`), ו-Roles עם RBAC ספציפי לפרויקט. משלימים זאת עם RBAC גלובלי (`argocd-rbac-cm`) שממפה קבוצות SSO לתפקידים.

</details>

<details class="qa">
<summary>12. איך מתמודדים עם Secrets בגישת GitOps, כשלא רוצים לשמור אותם גלויים ב-Git?</summary>

: כמה גישות מקובלות:
- **Sealed Secrets** – מצפינים את ה-Secret עם מפתח ציבורי לפני ה-Commit; רק ה-Controller ב-Cluster יכול לפענח.
- **External Secrets Operator** – שולף Secrets בזמן ריצה ממקור חיצוני (Vault, AWS Secrets Manager).
- **SOPS** – מצפין קבצים שלמים, עם אינטגרציה דרך Plugin.
לעולם לא שומרים Secret כ-Plain Text ב-Git.

</details>

## שאלות מתקדמות (Senior/Staff)

<details class="qa">
<summary>13. איך הייתם מתכננים ArgoCD ל-Scale גדול (מאות Applications, עשרות Clusters)?</summary>

: כמה כיוונים:
- **Sharding** של ה-`application-controller` בין כמה Instances, לפי Cluster.
- הגדלת Replicas ל-`repo-server` (בדרך כלל ה-Bottleneck).
- שימוש ב-ApplicationSet עם Cluster Generator במקום ניהול ידני.
- שקילת ארכיטקטורת Hub-and-Spoke מול ArgoCD-per-Cluster, בהתאם לדרישות Resilience.
- Monitoring צמוד עם Prometheus Metrics ש-ArgoCD חושף (`argocd_app_sync_total`, `argocd_app_reconcile_count` וכו').

</details>

<details class="qa">
<summary>14. מה ההבדל בין Rollback ב-ArgoCD ל-Git Revert, ולמה עדיף האחרון?</summary>

: `argocd app rollback` משנה את המצב ב-Cluster חזרה לגרסה קודמת, אבל **לא משנה את Git**. אם `automated sync` פעיל, ArgoCD "יתקן" את זה בחזרה לגרסה העדכנית ב-Git ברגע שירוץ Reconciliation הבא – מה שיבטל את ה-Rollback. הדרך הנכונה ב-GitOps אמיתי היא לבצע `git revert` על ה-Commit הבעייתי, כך ש-Git עצמו (מקור האמת) משקף את המצב הרצוי.

</details>

<details class="qa">
<summary>15. איך הייתם מיישמים Blue-Green או Canary Deployment עם ArgoCD?</summary>

: ArgoCD עצמו לא מבצע Progressive Delivery מובנה – לשם כך יש לשלב עם **Argo Rollouts**, פרויקט אחות שמחליף `Deployment` רגיל ב-CRD בשם `Rollout`, ותומך ב-Canary/Blue-Green analysis (כולל אינטגרציה עם Prometheus/Datadog לבדיקת מדדים לפני שממשיכים את ה-Rollout).

</details>

<details class="qa">
<summary>16. איך מטפלים בתלויות בין CRDs לבין Custom Resources באותו Application?</summary>

: משתמשים ב-Sync Waves – ה-CRD מקבל Wave נמוך יותר (למשל `0`), וה-CR שמשתמש בו מקבל Wave גבוה יותר (למשל `1`). ArgoCD ממתין שה-Wave הקודם יגיע ל-Healthy לפני שהוא ממשיך לבא אחריו. חשוב גם לוודא ש-`Validate=false` מוגדר אם ה-CRD חדש ועדיין לא "ידוע" ל-Kubernetes API בזמן ה-Apply הראשוני.

</details>

<details class="qa">
<summary>17. מה קורה בפועל כשאתם לוחצים "Sync" ב-UI? תארו את השרשרת המלאה.</summary>

:
1. הבקשה מגיעה ל-`argocd-server` (API).
2. ה-`application-controller` מקבל את הבקשה ליזום Operation.
3. ה-`repo-server` משוכפל/מרענן את ה-Git Repo, ומרנדר את המניפסטים (Helm/Kustomize/Raw).
4. ה-`application-controller` משווה בין המניפסטים המרונדרים ל-Live State (מ-Cache/Kubernetes API).
5. מתבצע `kubectl apply` (בפועל – שימוש ב-Kubernetes API ישירות) על כל משאב, לפי סדר ה-Sync Waves.
6. Hooks (`PreSync`/`PostSync`) רצים בזמנים המתאימים.
7. ה-Health Checks בודקים את מצב הבריאות של כל משאב.
8. הסטטוס מתעדכן ל-`Synced` / `Healthy` (או שגיאה מתאימה).

</details>

<details class="qa">
<summary>18. איך הייתם מדבגים מצב שבו ה-<code>repo-server</code> נכשל לרנדר Helm Chart מסוים?</summary>

:
```bash
kubectl logs -n argocd deploy/argocd-repo-server --tail=200
```
בודקים אם השגיאה היא Syntax (`helm template` נכשל לוקאלית), גישה ל-Chart Repository (Timeout/Auth), או גרסת Helm לא תואמת (למשל שימוש בפיצ'רים חדשים מ-Helm 3.14+ בזמן ש-ArgoCD מותקן עם גרסה ישנה יותר). מומלץ תמיד לשחזר את ה-Render מקומית עם `helm template` לפני שחוקרים בתוך ה-Cluster.

</details>

<details class="qa">
<summary>19. מה ההבדל בין Namespace-scoped Install ל-Cluster-scoped Install?</summary>

: Cluster-scoped נותן ל-ArgoCD גישה לפרוס לכל Namespace/Cluster שהוא מכיר. Namespace-scoped מגביל instance ArgoCD בודד ל-Namespace יחיד – שימושי בארגונים שרוצים ArgoCD נפרד לכל צוות/Tenant מטעמי בידוד ואבטחה, אבל דורש התקנת מספר Instances.

</details>

<details class="qa">
<summary>20. איך הייתם מטמיעים ArgoCD כחלק מפייפליין CI/CD מלא (יחד עם GitHub Actions/Jenkins)?</summary>

: תרשים זרימה טיפוסי:
1. מפתח עושה Push ל-Repo של הקוד.
2. CI (GitHub Actions) בונה Image, מריץ טסטים, ודוחף ל-Registry.
3. CI מעדכן (בעצמו, או דרך Image Updater) את ה-Tag ב-Repo ה-GitOps (למשל דרך `yq`/`kustomize edit set image` + Commit + PR).
4. PR עובר Review (אופציונלי) וממוזג ל-`main`.
5. ArgoCD מזהה את השינוי ב-Git תוך שניות (Webhook או Poll), ומבצע Sync (אוטומטי או ידני) ל-Cluster.
6. Notifications שולחות עדכון ל-Slack על הצלחה/כישלון.

חשוב להדגיש בראיון: ה-CI **אף פעם לא נוגע ישירות ב-Cluster** – כל התקשורת עם ה-Cluster עוברת רק דרך ArgoCD, וזה בדיוק הרעיון המרכזי של GitOps.

</details>

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
