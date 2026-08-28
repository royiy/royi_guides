---
title: "משחק לימודי: אתגר ArgoCD"
category: DevOps/ArgoCD
part: 12/10
description: "משחק אינטראקטיבי ללימוד ArgoCD - חמישה מצבי משחק עם טיימר, לבבות, ניקוד ורצפים: קרב מהיר, ניחוש התנהגות Sync, השלמת YAML/פקודות, התאמת מושגים וסידור תהליך GitOps."
---

חמישה מצבי משחק שבודקים היבטים שונים של ArgoCD ו-GitOps - לא עוד חידון רב-ברירה, אלא משחק עם **טיימר**, **שלושה לבבות**, **מכפיל רצף** ו**שיא אישי** שנשמר בדפדפן. בסוף כל סבב תקבלו דירוג, ורשימת חזרה של בדיוק מה שפספסתם.


<div class="tg" id="tg" dir="rtl">
  <div class="tg-screen is-active" data-screen="menu">
    <div class="tg-hero">
      <div class="tg-hero-badge">ArgoCD</div>
      <div class="tg-hero-title">אתגר ArgoCD</div>
      <div class="tg-hero-sub">בחרו מצב משחק. יש לכם 3 לבבות - תשובה שגויה, טעות בהתאמה או נגמר הזמן עולים לב אחד.</div>
    </div>
    <div class="tg-modes" id="tg-modes"></div>
    <div class="tg-hero-foot">💡 טיפ: במצבי השאלות אפשר לענות עם המקשים <kbd>1</kbd>–<kbd>4</kbd> ולהתקדם עם <kbd>Enter</kbd>.</div>
  </div>
  <div class="tg-screen" data-screen="play">
    <div class="tg-hud">
      <button class="tg-quit" type="button" id="tg-quit">← יציאה</button>
      <div class="tg-mode-title" id="tg-mode-name"></div>
      <div class="tg-hud-stats">
        <span class="tg-lives" id="tg-lives"></span>
        <span class="tg-chip">ניקוד <b id="tg-score">0</b></span>
        <span class="tg-chip">רצף <b id="tg-streak">0</b></span>
      </div>
    </div>
    <div class="tg-progress"><i class="tg-progress-bar" id="tg-progress"></i></div>
    <div class="tg-timer-wrap" id="tg-timer-wrap"><i class="tg-timer-bar" id="tg-timer"></i></div>
    <div class="tg-stage" id="tg-stage"></div>
    <div class="tg-foot">
      <div class="tg-feedback" id="tg-feedback" aria-live="polite"></div>
      <button class="tg-btn tg-btn--primary tg-next" type="button" id="tg-next" hidden>הבא ←</button>
    </div>
  </div>
  <div class="tg-screen" data-screen="result">
    <div id="tg-result"></div>
    <div class="tg-result-actions">
      <button class="tg-btn tg-btn--primary" type="button" id="tg-again">שחק שוב</button>
      <button class="tg-btn" type="button" id="tg-menu">חזרה לתפריט</button>
    </div>
  </div>
</div>

<link rel="stylesheet" href="/styles/topic-game.css">

<script>
(function () {
  'use strict';

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /* ============================================================
     מצב 1 - קרב מהיר: שאלות ידע קצרות. o = אפשרויות, a = אינדקס נכון
     ============================================================ */
  var RAPID = [
    {
      q: 'מהו העיקרון המרכזי של GitOps ביחס למקור האמת של המערכת?',
      o: ['Git הוא ה-Single Source of Truth למצב הרצוי של המערכת', 'ה-Cluster עצמו הוא מקור האמת ו-Git רק גיבוי', 'כל שינוי חייב לעבור קודם kubectl apply ידני', 'CI/CD הוא מקור האמת ולא Git'],
      a: 0,
      w: 'בגישת GitOps כל שינוי במצב הרצוי מתחיל כ-Commit ל-Git; ArgoCD רק "קורא" משם ומיישר את ה-Cluster בהתאם - Git הוא התיעוד היחיד שאפשר לסמוך עליו.'
    },
    {
      q: 'מה ההבדל המרכזי בין גישת Push-based CI/CD רגילה לבין GitOps (Pull-based)?',
      o: ['ב-Push-based כלי ה-CI/CD מריץ kubectl apply עם הרשאות ל-Cluster; ב-Pull-based ArgoCD יושב בתוך ה-Cluster ומושך שינויים בעצמו', 'אין הבדל מעשי בין השתיים', 'Pull-based דורש הרשאות Cluster רחבות יותר ל-CI/CD', 'Push-based תמיד מזהה Drift אוטומטית'],
      a: 0,
      w: 'ב-Pull-based אין צורך לתת לכלי חיצוני (Jenkins/GitLab CI) הרשאות ישירות ל-Cluster - ArgoCD, שרץ בפנים, אחראי על המשיכה וההשוואה בעצמו.'
    },
    {
      q: 'מהי "תיקון עצמי" (Self-Healing) ב-GitOps?',
      o: ['זיהוי סטייה (Drift) בין המצב בפועל למצב ב-Git, והחזרת ה-Cluster אוטומטית למה שמוגדר ב-Git', 'תיקון אוטומטי של שגיאות תחביר ב-YAML', 'שחזור אוטומטי של Pods שקרסו, בלי קשר ל-Git', 'עדכון גרסת Kubernetes אוטומטית'],
      a: 0,
      w: 'אם מישהו ביצע שינוי ידני (למשל kubectl edit) שלא דרך Git, Self-Healing גורם ל-ArgoCD להחזיר את המשאב למצב שמוגדר ב-Repo - זה חלק מ-selfHeal ב-syncPolicy.'
    },
    {
      q: 'איזה CRD (Custom Resource) מייצג אפליקציה בודדת ב-ArgoCD ומקשר בין מקור Git ליעד ב-Cluster?',
      o: ['<code>Application</code>', '<code>Deployment</code>', '<code>AppProject</code>', '<code>SyncPolicy</code>'],
      a: 0,
      w: '<code>Application</code> הוא ה-CRD המרכזי - הוא מגדיר <code>source</code> (מאיפה למשוך), <code>destination</code> (לאן לפרוס) ו-<code>syncPolicy</code> (איך לסנכרן). <code>AppProject</code> מגדיר גבולות הרשאה מסביב לקבוצת Applications.'
    },
    {
      q: 'מה משמעות סטטוס <code>OutOfSync</code> באפליקציית ArgoCD?',
      o: ['יש הבדל בין המצב המוגדר ב-Git (Desired State) לבין המצב בפועל ב-Cluster (Live State)', 'האפליקציה נמחקה מה-Cluster', 'ה-Repo לא נגיש כרגע', 'ה-Health Check נכשל'],
      a: 0,
      w: '<code>OutOfSync</code> הוא אך ורק על התאמת תוכן (מה יש ב-Git מול מה שרץ בפועל) - זה נפרד לגמרי מ-Health Status, שבודק אם המשאבים בריאים ורצים כראוי.'
    },
    {
      q: 'מה ההבדל בין Sync Status ל-Health Status של Application?',
      o: ['Sync Status בודק התאמה בין Git ל-Cluster; Health Status בודק אם המשאבים בפועל תקינים ורצים', 'הם שני שמות לאותה בדיקה בדיוק', 'Health Status בודק רק את בריאות ה-Repo', 'Sync Status רץ פעם ביום בלבד'],
      a: 0,
      w: 'אפליקציה יכולה להיות <code>Synced</code> אך <code>Degraded</code> בו-זמנית - למשל אם ה-YAML תקין וזהה ל-Git, אבל ה-Pod נופל בלולאת קריסות (CrashLoopBackOff).'
    },
    {
      q: 'מה עושה <code>prune: true</code> תחת <code>syncPolicy.automated</code>?',
      o: ['מוחק אוטומטית משאבים שהוסרו מה-Repo אך עדיין קיימים ב-Cluster', 'מוחק את כל ה-Namespace לפני כל Sync', 'מונע יצירת משאבים חדשים', 'מוחק את ה-Application עצמו לאחר Sync מוצלח'],
      a: 0,
      w: 'בלי <code>prune</code>, אם מוחקים קובץ מניפסט מה-Repo, המשאב המתאים יישאר "יתום" ב-Cluster. <code>prune: true</code> דואג שגם מחיקות ב-Git ישתקפו ב-Cluster.'
    },
    {
      q: 'מה עושה <code>selfHeal: true</code> תחת <code>syncPolicy.automated</code>?',
      o: ['מזהה שינוי ידני (Drift) ב-Cluster ומתקן אותו אוטומטית בחזרה למצב שב-Git', 'מתקן שגיאות YAML לא תקינות', 'מפעיל מחדש Pods שקרסו', 'שולח התראה בלבד בלי לתקן'],
      a: 0,
      w: 'ללא <code>selfHeal</code>, ArgoCD יסמן את המשאב כ-OutOfSync אבל לא יתקן אותו לבד - יידרש Sync ידני. עם <code>selfHeal: true</code> התיקון קורה אוטומטית ברגע שמזוהה סטייה.'
    },
    {
      q: 'מהו תפקידו של Sync Hook מסוג <code>PreSync</code>?',
      o: ['הרצת פעולה (בדרך כלל Kubernetes Job) לפני שמתחיל ה-Sync בפועל - שימושי ל-DB Migrations', 'הרצת פעולה אחרי שכל המשאבים Healthy', 'הרצת פעולה רק אם ה-Sync נכשל', 'בדיקת הרשאות RBAC לפני Sync'],
      a: 0,
      w: '<code>PreSync</code> רץ לפני יישום שאר המשאבים - שימוש קלאסי הוא הרצת Job שמבצע Migration למסד נתונים לפני שהגרסה החדשה של האפליקציה עולה.'
    },
    {
      q: 'מתי רץ Hook מסוג <code>PostSync</code>?',
      o: ['אחרי שכל המשאבים הגיעו למצב Healthy', 'לפני תחילת ה-Sync', 'רק אם ה-Sync נכשל', 'במקביל ליישום כל המשאבים'],
      a: 0,
      w: '<code>PostSync</code> שימושי לבדיקות Smoke Test או התראות הצלחה - הוא מבטיח שהכל כבר עלה ותקין לפני שמריצים אותו.'
    },
    {
      q: 'מה תפקיד ה-annotation <code>argocd.argoproj.io/sync-wave</code>?',
      o: ['קובע סדר פריסה בין קבוצות משאבים - מספרים נמוכים רצים קודם', 'קובע כמה פעמים לנסות Sync מחדש', 'מסמן משאב כ-Hook', 'קובע את זמן ה-Timeout של ה-Sync'],
      a: 0,
      w: 'לדוגמה, אם ל-Database יש <code>sync-wave: "0"</code> ול-Backend יש <code>sync-wave: "1"</code>, ArgoCD ימתין שה-Database יגיע ל-Healthy לפני שיתחיל לפרוס את ה-Backend.'
    },
    {
      q: 'מה תפקיד ה-CRD מסוג <code>AppProject</code>?',
      o: ['להגדיר גבולות הרשאה - אילו Repos, Clusters ו-Namespaces מותר לקבוצת Applications לגעת בהם', 'להחליף לגמרי את אובייקט ה-Application', 'לנהל את גרסת ArgoCD המותקנת', 'להגדיר Health Checks בלבד'],
      a: 0,
      w: '<code>AppProject</code> מגדיר <code>sourceRepos</code>, <code>destinations</code> ו-<code>roles</code> - כלי מרכזי ל-Multi-tenancy, כדי שצוות אחד לא יוכל לפרוס ל-Namespace של צוות אחר.'
    },
    {
      q: 'מה עושה שדה <code>clusterResourceWhitelist</code> ב-AppProject?',
      o: ['קובע אילו סוגי משאבים ברמת Cluster (לא Namespace) מותר ל-Applications בפרויקט זה ליצור', 'קובע אילו Clusters מותר לרשום ב-ArgoCD', 'חוסם גישה לכל ה-Namespaces', 'מגדיר את רשימת המשתמשים המורשים'],
      a: 0,
      w: 'ברירת המחדל היא לא לאפשר משאבי Cluster כלל (כמו CustomResourceDefinition או ClusterRole) - צריך לפרט אותם במפורש ב-whitelist כדי לאפשר יצירתם.'
    },
    {
      q: 'מה תחביר שורת Policy מבוסס-Casbin ב-<code>argocd-rbac-cm</code>?',
      o: ['<code>p, &lt;subject&gt;, &lt;resource&gt;, &lt;action&gt;, &lt;object&gt;, &lt;effect&gt;</code>', '<code>rule: subject action effect</code>', '<code>allow(subject, action)</code>', '<code>grant subject to resource</code>'],
      a: 0,
      w: 'לדוגמה <code>p, role:ci-bot, applications, sync, */*, allow</code> אומר: לתפקיד ci-bot מותר לבצע sync על applications בכל Project ובכל Application.'
    },
    {
      q: 'איזו בעיה פותר <code>ApplicationSet</code>?',
      o: ['יצירה דינמית של הרבה Applications מתוך Template + Generator, במקום לתחזק עשרות/מאות קבצי YAML ידנית', 'החלפת Git כמקור אמת ב-Database', 'ביצוע Health Checks מותאמים בלבד', 'ניהול הרשאות RBAC בלבד'],
      a: 0,
      w: 'כשיש עשרות מיקרו-שירותים וכמה סביבות לכל אחד, כתיבת Application ידני לכל צירוף לא סקיילית - ApplicationSet מייצר אותם אוטומטית לפי Generator (List, Cluster, Git ועוד).'
    },
    {
      q: 'מה עושה Cluster Generator ב-ApplicationSet?',
      o: ['יוצר Application אוטומטית לכל Cluster רשום שתואם ל-Selector (למשל לפי Label)', 'יוצר Cluster Kubernetes חדש', 'מוחק Clusters לא פעילים', 'מייבא רשימת קבצים סטטית מ-Git'],
      a: 0,
      w: 'שימושי לפריסת אותה אפליקציה (למשל Monitoring Agent) לכל Cluster שרשום ב-ArgoCD ותואם לתנאי ה-Selector - למשל <code>env: production</code>.'
    }
  ];

  /* ============================================================
     מצב 2 - ניחוש התנהגות Sync: קטע מניפסט Application + מה קורה בסנכרון
     ============================================================ */
  var SYNC_GUESS = [
    {
      code: 'apiVersion: argoproj.io/v1alpha1\nkind: Application\nmetadata:\n  name: billing-service\nspec:\n  syncPolicy:\n    automated:\n      prune: true\n      selfHeal: true',
      q: 'מישהו מריץ <code>kubectl delete deployment</code> ידנית על משאב שנוצר על ידי ה-Application הזו. מה יקרה בסנכרון הבא?',
      o: ['ArgoCD יזהה Drift ויצור מחדש את המשאב לפי מה שמוגדר ב-Git', 'המשאב יישאר מחוק לצמיתות', 'ArgoCD ימחק גם את שאר המשאבים', 'ה-Application תעבור למצב Deleted'],
      a: 0,
      w: 'עם <code>selfHeal: true</code>, כל סטייה בין Live State ל-Desired State (כולל מחיקה ידנית) מתוקנת אוטומטית - ArgoCD ייצור מחדש את המשאב החסר.'
    },
    {
      code: 'apiVersion: argoproj.io/v1alpha1\nkind: Application\nspec:\n  syncPolicy:\n    automated:\n      prune: true\n      selfHeal: false',
      q: 'מישהו משנה ידנית את מספר ה-replicas ב-Deployment שנוצר על ידי Application זו. מה יקרה?',
      o: ['ה-Application תסומן כ-OutOfSync, אבל השינוי לא יתוקן אוטומטית עד Sync ידני', 'ArgoCD יתקן את זה אוטומטית תוך שניות', 'הפעולה תיחסם ב-Cluster', 'ArgoCD ימחק את ה-Deployment'],
      a: 0,
      w: '<code>selfHeal: false</code> אומר שגם אם יש Automated Sync, סטיות (Drift) לא יתוקנו אוטומטית - רק Sync חדש שמופעל ב-Git (או ידנית) יחזיר את המצב.'
    },
    {
      code: 'apiVersion: argoproj.io/v1alpha1\nkind: Application\nmetadata:\n  name: guestbook\n  finalizers:\n    - resources-finalizer.argocd.argoproj.io',
      q: 'מוחקים את אובייקט ה-Application הזה עם <code>kubectl delete application guestbook</code>. מה יקרה בזכות ה-finalizer?',
      o: ['ArgoCD ימחק בנוסף (Cascade) את כל המשאבים שהוא יצר ב-Cluster', 'המשאבים ב-Cluster יישארו "יתומים"', 'המחיקה תיכשל תמיד', 'רק ה-Namespace יימחק'],
      a: 0,
      w: 'בלי ה-finalizer <code>resources-finalizer.argocd.argoproj.io</code>, מחיקת ה-Application הייתה מוחקת רק את אובייקט ה-Application עצמו, ומשאירה את כל המשאבים שהוא ניהל "יתומים" ב-Cluster.'
    },
    {
      code: 'apiVersion: argoproj.io/v1alpha1\nkind: Application\nspec:\n  source:\n    repoURL: https://github.com/mycompany/app.git\n    path: k8s/prod',
      q: 'שדה <code>targetRevision</code> לא הוגדר כלל ב-source. מה תהיה ההתנהגות?',
      o: ['ArgoCD ישתמש כברירת מחדל ב-<code>HEAD</code> של הענף הראשי', 'ה-Sync ייכשל עם שגיאת ולידציה', 'ArgoCD יבחר את ה-Commit הישן ביותר', 'ArgoCD ידרוש הזנה ידנית בכל Sync'],
      a: 0,
      w: 'ברירת המחדל היא <code>HEAD</code>, אבל זה עלול להוביל לחוסר עקביות בין סביבות - מומלץ לנעול <code>targetRevision</code> לענף, תג או commit ספציפי.'
    },
    {
      code: 'apiVersion: argoproj.io/v1alpha1\nkind: Application\nspec:\n  destination:\n    server: https://kubernetes.default.svc\n    namespace: new-team\n  syncPolicy:\n    automated: {}',
      q: 'ה-Namespace <code>new-team</code> עדיין לא קיים ב-Cluster, ואין <code>CreateNamespace=true</code> ב-<code>syncOptions</code>. מה יקרה בסנכרון?',
      o: ['ה-Sync ייכשל כי ה-Namespace לא קיים', 'ArgoCD ייצור את ה-Namespace אוטומטית תמיד', 'המשאבים ייפרסו ל-namespace default', 'ArgoCD יתעלם משדה ה-namespace'],
      a: 0,
      w: 'בברירת מחדל ArgoCD לא יוצר Namespaces - צריך להוסיף מפורשות <code>CreateNamespace=true</code> תחת <code>syncOptions</code> כדי שהוא ייווצר אוטומטית לפני יישום שאר המשאבים.'
    },
    {
      code: 'apiVersion: batch/v1\nkind: Job\nmetadata:\n  name: db-migrate\n  annotations:\n    argocd.argoproj.io/hook: PreSync\n    argocd.argoproj.io/hook-delete-policy: BeforeHookCreation',
      q: 'מריצים Sync שני פעמים ברציפות על Application עם ה-Job הזה. מה תפקיד <code>hook-delete-policy: BeforeHookCreation</code>?',
      o: ['מוחק את ה-Job הקודם לפני יצירת חדש, כדי למנוע התנגשות שמות', 'מוחק את ה-Job רק אם הוא נכשל', 'מונע הרצה חוזרת של ה-Job לחלוטין', 'שומר את כל ההיסטוריה של ה-Jobs'],
      a: 0,
      w: 'בלי מדיניות מחיקה, Sync שני ינסה ליצור Job עם אותו שם וייכשל בהתנגשות. <code>BeforeHookCreation</code> מנקה את ה-Job הישן לפני שמריצים גרסה חדשה.'
    },
    {
      code: 'apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: postgres\n  annotations:\n    argocd.argoproj.io/sync-wave: "0"\n---\napiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: backend\n  annotations:\n    argocd.argoproj.io/sync-wave: "1"',
      q: 'בסנכרון האפליקציה, באיזה סדר יתפרסו שני ה-Deployments?',
      o: ['<code>postgres</code> יסתנכרן ראשון, ורק אחרי שהוא Healthy יתחיל <code>backend</code>', 'שניהם יסתנכרנו במקביל תמיד', '<code>backend</code> תמיד ראשון בגלל סדר א"ב', 'הסדר אקראי בכל Sync'],
      a: 0,
      w: 'מספר Wave נמוך יותר רץ קודם. ArgoCD ממתין שכל המשאבים ב-Wave הנוכחי יגיעו ל-Healthy לפני שהוא ממשיך ל-Wave הבא - כך postgres עולה לפני שה-backend מנסה להתחבר אליו.'
    },
    {
      code: 'apiVersion: argoproj.io/v1alpha1\nkind: Application\nspec:\n  source:\n    repoURL: https://kubernetes.github.io/ingress-nginx\n    chart: ingress-nginx\n    targetRevision: 4.11.2',
      q: 'שימו לב ש-<code>repoURL</code> כאן מצביע לכתובת HTTP רגילה ולא ל-Git repo. איך ArgoCD מפרש את המקור?',
      o: ['כ-Helm Chart Repository - הודות לשדה <code>chart</code> שמופיע לצידו', 'כשגיאת קונפיגורציה שתמנע Sync', 'כ-Kustomize overlay', 'כ-Plain YAML מ-URL בודד'],
      a: 0,
      w: 'כש-<code>source</code> כולל שדה <code>chart</code>, ArgoCD מבין שמדובר ב-Helm Repository (לא Git) ומושך משם את הגרסה שצוינה ב-<code>targetRevision</code> (4.11.2).'
    },
    {
      code: 'apiVersion: argoproj.io/v1alpha1\nkind: AppProject\nmetadata:\n  name: team-billing\nspec:\n  destinations:\n    - server: https://kubernetes.default.svc\n      namespace: billing-dev\n    - server: https://kubernetes.default.svc\n      namespace: billing-staging',
      q: 'מנסים ליצור Application בפרויקט <code>team-billing</code> שמצביעה ל-<code>namespace: billing-prod</code>. מה יקרה?',
      o: ['היצירה/הסנכרון ייחסמו, כי <code>billing-prod</code> לא מופיע ברשימת ה-<code>destinations</code> המורשית', 'זה יעבוד כרגיל, destinations הוא רק תיעוד', 'ArgoCD יוסיף אוטומטית את ה-namespace לרשימה', 'רק ה-Health Check ייכשל'],
      a: 0,
      w: '<code>destinations</code> הוא גבול הרשאה אמיתי, לא הצעה - כל Application בפרויקט הזה שמנסה לפרוס ל-Namespace שלא ברשימה תיחסם על ידי ArgoCD.'
    },
    {
      code: 'policy.csv: |\n  p, role:ci-bot, applications, sync, */*, allow\n  p, role:ci-bot, applications, get, */*, allow',
      q: 'למשתמש עם תפקיד <code>role:ci-bot</code> יש רק את שתי השורות האלה ב-<code>argocd-rbac-cm</code>. האם הוא יכול למחוק Application?',
      o: ['לא - יש לו הרשאה רק ל-<code>sync</code> ו-<code>get</code>, ולא ל-<code>delete</code>', 'כן, כי role:ci-bot הוא בהכרח admin', 'כן, כי sync כולל גם delete', 'לא ניתן לדעת בלי לבדוק ב-UI'],
      a: 0,
      w: 'ה-RBAC מבוסס Casbin עובד על עקרון Least Privilege - רק פעולות שהוגדרו במפורש מותרות. בלי שורת <code>p, role:ci-bot, applications, delete, */*, allow</code> - הפעולה תיחסם.'
    },
    {
      code: 'apiVersion: argoproj.io/v1alpha1\nkind: AppProject\nspec:\n  syncWindows:\n    - kind: deny\n      schedule: \'0 18 * * 5\'\n      duration: 60h\n      manualSync: false',
      q: 'מה קורה אם מישהו מנסה Sync (גם ידני) בשבת בצהריים, בהינתן ה-Sync Window הזה?',
      o: ['הסנכרון ייחסם - חלון מסוג deny עם manualSync:false אוסר גם Sync ידני בטווח הזמן הזה', 'רק Automated Sync ייחסם, ידני יעבוד', 'החלון חל רק על Applications חדשות', 'זה רק אזהרה ב-UI ולא חסימה אמיתית'],
      a: 0,
      w: 'חלון מ-<code>deny</code> שמתחיל יום שישי 18:00 ונמשך 60 שעות מכסה גם שבת בצהריים. <code>manualSync: false</code> אומר שגם Sync ידני נחסם בטווח הזה, לא רק Automated.'
    },
    {
      code: 'generators:\n  - list:\n      elements:\n        - env: dev\n        - env: staging\n        - env: prod\ntemplate:\n  metadata:\n    name: \'guestbook-{{env}}\'',
      q: 'כמה אובייקטי Application ייווצרו מה-ApplicationSet הזה, ואיך ייקראו?',
      o: ['שלושה: <code>guestbook-dev</code>, <code>guestbook-staging</code>, <code>guestbook-prod</code>', 'אחד בשם <code>guestbook-{{env}}</code> בדיוק כמו שכתוב', 'שלושה בשם זהה שיתנגשו', 'אפס, כי חסר repoURL בדוגמה'],
      a: 0,
      w: 'List Generator יוצר Application אחד לכל איבר ברשימה, כשה-Template מציב את הערכים (כאן <code>{{env}}</code>) בפועל - כך מתקבל שם ייחודי לכל סביבה.'
    },
    {
      code: 'apiVersion: v1\nkind: ConfigMap\nmetadata:\n  name: argocd-cm\ndata:\n  resource.customizations.health.mycompany.io_DatabaseCluster: |\n    hs = {}\n    if obj.status.phase == "Running" then\n      hs.status = "Healthy"\n    end\n    return hs',
      q: 'למה בכלל צריך את ה-Health Check המותאם הזה בקוד Lua?',
      o: ['כי ArgoCD לא יודע מובנה איך לבדוק בריאות של CRD מותאם אישית כמו <code>DatabaseCluster</code>', 'כדי להחליף את הבדיקה המובנית של Deployment', 'כדי לשפר ביצועים של Sync רגיל', 'כי זה חובה לכל Application ב-ArgoCD'],
      a: 0,
      w: 'עבור סוגי משאבים מוכרים (Deployment, StatefulSet וכו\') יש ל-ArgoCD Health Checks מובנים. עבור CRDs חיצוניים (כמו Operator של מסד נתונים) צריך להגדיר בעצמנו איך לפרש את <code>status</code> שלהם.'
    }
  ];

  /* ============================================================
     מצב 3 - השלמת YAML/פקודה: מניפסט Application או פקודת argocd עם חלק חסר
     ============================================================ */
  var CMD_COMPLETE = [
    {
      code: '$ argocd app ___ guestbook',
      q: 'מה משלים את הפקודה כדי להפעיל סנכרון (Sync) ידני על Application בשם guestbook?',
      o: ['<code>sync</code>', '<code>get</code>', '<code>create</code>', '<code>diff</code>'],
      a: 0,
      w: '<code>argocd app sync guestbook</code> מפעיל את תהליך הסנכרון - משווה בין Git ל-Cluster ומיישם את ההפרשים.'
    },
    {
      code: '$ argocd app create guestbook \\\n  --repo https://github.com/argoproj/argocd-example-apps.git \\\n  --___ guestbook \\\n  --dest-server https://kubernetes.default.svc \\\n  --dest-namespace default',
      q: 'מה משלים את הפקודה כדי לציין את הנתיב בתוך ה-Repo שבו נמצאים המניפסטים?',
      o: ['<code>path</code>', '<code>branch</code>', '<code>source</code>', '<code>folder</code>'],
      a: 0,
      w: '<code>--path guestbook</code> מציין שהמניפסטים נמצאים בתיקיית <code>guestbook</code> בתוך ה-Repo שצוין ב-<code>--repo</code>.'
    },
    {
      code: 'spec:\n  syncPolicy:\n    automated:\n      ___: true\n      selfHeal: true',
      q: 'מה משלים את השדה כדי שמשאבים שהוסרו מ-Git יימחקו אוטומטית גם מה-Cluster?',
      o: ['<code>prune</code>', '<code>delete</code>', '<code>cleanup</code>', '<code>remove</code>'],
      a: 0,
      w: '<code>prune: true</code> גורם ל-ArgoCD למחוק ב-Cluster משאבים שכבר לא מופיעים במניפסטים ב-Git.'
    },
    {
      code: 'apiVersion: argoproj.io/v1alpha1\nkind: ___\nmetadata:\n  name: guestbook\nspec:\n  project: default',
      q: 'מה משלים את השדה <code>kind</code> עבור אובייקט שמייצג אפליקציה בודדת ב-ArgoCD?',
      o: ['<code>Application</code>', '<code>AppProject</code>', '<code>Deployment</code>', '<code>ApplicationSet</code>'],
      a: 0,
      w: '<code>kind: Application</code> הוא ה-CRD שמייצג חיבור בין מקור Git ליעד ב-Cluster. <code>AppProject</code> משמש לניהול הרשאות מסביב לקבוצת Applications.'
    },
    {
      code: 'metadata:\n  name: guestbook\n  finalizers:\n    - ___',
      q: 'מה משלים את שם ה-finalizer שגורם למחיקת Application למחוק גם (Cascade) את כל המשאבים שהיא יצרה?',
      o: ['<code>resources-finalizer.argocd.argoproj.io</code>', '<code>cascade-delete.k8s.io</code>', '<code>argocd.argoproj.io/cleanup</code>', '<code>finalizers.argoproj.io/cascade</code>'],
      a: 0,
      w: 'בלי ה-finalizer הזה, מחיקת אובייקט ה-Application תשאיר את המשאבים שהוא ניהל "יתומים" ב-Cluster.'
    },
    {
      code: 'metadata:\n  annotations:\n    argocd.argoproj.io/hook: ___',
      q: 'מה משלים את ה-annotation כדי שה-Job הזה ירוץ לפני שמתחיל שלב ה-Sync בפועל (למשל Database Migration)?',
      o: ['<code>PreSync</code>', '<code>PostSync</code>', '<code>SyncFail</code>', '<code>BeforeSync</code>'],
      a: 0,
      w: '<code>PreSync</code> מריץ את ה-Job לפני שנוגעים בשאר המשאבים - שימוש נפוץ הוא Migration למסד נתונים לפני עליית הגרסה החדשה.'
    },
    {
      code: '$ argocd app ___ guestbook 0',
      q: 'מה משלים את הפקודה כדי לחזור (Rollback) לגרסת Sync מספר 0 מתוך ההיסטוריה?',
      o: ['<code>rollback</code>', '<code>history</code>', '<code>revert</code>', '<code>undo</code>'],
      a: 0,
      w: '<code>argocd app rollback guestbook 0</code> מחזיר את ה-Cluster למצב שהיה ב-Sync מספר 0. שימו לב: אם Automated Sync פעיל, ArgoCD יחזור לגרסה העדכנית ב-Git בפעם הבאה - ה-Rollback ה"נכון" ב-GitOps הוא Git Revert.'
    },
    {
      code: '$ argocd cluster ___ my-remote-context --name production-eu',
      q: 'מה משלים את הפקודה כדי לרשום Cluster חדש תחת ArgoCD?',
      o: ['<code>add</code>', '<code>register</code>', '<code>connect</code>', '<code>create</code>'],
      a: 0,
      w: '<code>argocd cluster add</code> רושם Context מקומי מה-kubeconfig כ-Cluster מנוהל תחת ArgoCD, כדי שאפשר יהיה לפרוס אליו Applications.'
    },
    {
      code: 'spec:\n  ___:\n    - https://github.com/mycompany/billing-service.git\n    - https://github.com/mycompany/billing-shared-charts.git',
      q: 'מה משלים את השדה ב-AppProject שמגדיר מאילו Git Repos מותר למשוך קוד?',
      o: ['<code>sourceRepos</code>', '<code>allowedRepos</code>', '<code>gitSources</code>', '<code>repositories</code>'],
      a: 0,
      w: '<code>sourceRepos</code> ב-AppProject מגביל את כל ה-Applications בפרויקט הזה למשוך אך ורק מהרשימה שצוינה - זה חלק מגבולות ה-Multi-tenancy.'
    },
    {
      code: '$ argocd account generate-___ --account ci-bot',
      q: 'מה משלים את הפקודה ליצירת מפתח גישה עבור משתמש מקומי (למשל לשימוש ב-Pipeline)?',
      o: ['<code>token</code>', '<code>key</code>', '<code>secret</code>', '<code>password</code>'],
      a: 0,
      w: '<code>argocd account generate-token --account ci-bot</code> יוצר API Token למשתמש מקומי, שמאפשר הרצת פקודות כמו <code>app sync</code> מתוך CI/CD בלי Username/Password.'
    },
    {
      code: 'syncPolicy:\n  syncOptions:\n    - ___=true',
      q: 'מה משלים את syncOptions כדי שה-Namespace ייווצר אוטומטית אם הוא עדיין לא קיים?',
      o: ['<code>CreateNamespace</code>', '<code>AutoCreateNS</code>', '<code>EnsureNamespace</code>', '<code>NamespaceCreate</code>'],
      a: 0,
      w: '<code>CreateNamespace=true</code> חוסך יצירה ידנית מראש - זו טעות נפוצה מאוד של מתחילים לשכוח אותה, מה שגורם ל-Sync להיכשל.'
    },
    {
      code: 'apiVersion: argoproj.io/v1alpha1\nkind: ApplicationSet\nspec:\n  generators:\n    - ___:\n        elements:\n          - env: dev\n          - env: prod',
      q: 'מה משלים את סוג ה-Generator כשרוצים רשימה סטטית וקבועה של ערכים?',
      o: ['<code>list</code>', '<code>git</code>', '<code>clusters</code>', '<code>matrix</code>'],
      a: 0,
      w: 'List Generator הוא הפשוט ביותר - מגדירים רשימת <code>elements</code> קבועה, וה-Template נוצר פעם אחת לכל איבר ברשימה.'
    },
    {
      code: 'policy.csv: |\n  p, role:admin, applications, ___, */*, allow',
      q: 'מה משלים את שדה ה-Action בפוליסת RBAC כדי לתת הרשאה לכל הפעולות האפשריות על applications?',
      o: ['<code>*</code>', '<code>all</code>', '<code>full</code>', '<code>admin</code>'],
      a: 0,
      w: 'תו הכללה (Wildcard) <code>*</code> בשדה ה-Action אומר "כל פעולה אפשרית" (get, sync, delete וכו\') - בשילוב עם <code>*/*</code> באובייקט, זו הרשאת admin מלאה.'
    }
  ];

  /* ============================================================
     מצב 4 - התאמת מושגים: סבבים של זוגות מושג/שדה + תיאור
     ============================================================ */
  var MATCH_ROUNDS = [
    {
      title: 'מושגי יסוד ב-GitOps וב-ArgoCD',
      pairs: [
        { l: '<code>Application</code>', r: 'CRD שמקשר בין מקור ב-Git ליעד פריסה ב-Cluster' },
        { l: 'Desired State', r: 'המצב המוגדר בקוד ב-Git - מה שאמור להיות' },
        { l: 'Live State', r: 'המצב בפועל כרגע ב-Cluster' },
        { l: '<code>OutOfSync</code>', r: 'סטטוס שמציין הבדל בין המצב ב-Git למצב ב-Cluster' },
        { l: 'Drift', r: 'סטייה שנוצרה כתוצאה משינוי ידני שלא דרך Git' }
      ]
    },
    {
      title: 'Sync Policies ו-Hooks',
      pairs: [
        { l: '<code>prune</code>', r: 'מוחק אוטומטית משאבים שהוסרו מה-Repo' },
        { l: '<code>selfHeal</code>', r: 'מתקן אוטומטית סטיות (Drift) בין Live ל-Desired' },
        { l: '<code>PreSync</code>', r: 'Hook שרץ לפני תחילת שלב ה-Sync בפועל' },
        { l: '<code>PostSync</code>', r: 'Hook שרץ אחרי שכל המשאבים הגיעו ל-Healthy' },
        { l: 'sync-wave', r: 'annotation שקובע סדר פריסה בין קבוצות משאבים' }
      ]
    },
    {
      title: 'Projects, RBAC ואבטחה',
      pairs: [
        { l: '<code>AppProject</code>', r: 'CRD שמגדיר גבולות הרשאה - Repos, Destinations ו-Roles מותרים' },
        { l: '<code>sourceRepos</code>', r: 'שדה ב-AppProject שמגביל מאילו Git Repos מותר למשוך' },
        { l: '<code>destinations</code>', r: 'שדה ב-AppProject שמגביל לאילו Cluster+Namespace מותר לפרוס' },
        { l: '<code>argocd-rbac-cm</code>', r: 'ConfigMap שמגדיר מדיניות RBAC גלובלית לכל ה-instance' },
        { l: '<code>policy.csv</code>', r: 'שורות בתחביר Casbin: subject, resource, action, object, effect' }
      ]
    },
    {
      title: 'ApplicationSets ו-Multi-Cluster',
      pairs: [
        { l: 'List Generator', r: 'יוצר Application לכל איבר ברשימה סטטית שהוגדרה מראש' },
        { l: 'Cluster Generator', r: 'יוצר Application לכל Cluster רשום שתואם ל-Selector' },
        { l: 'Git Generator (Directories)', r: 'יוצר Application לכל תיקייה תואמת ב-Repo, אוטומטית' },
        { l: 'Matrix Generator', r: 'משלב שני Generators יחד ליצירת מכפלה קרטזית של Applications' },
        { l: 'RollingSync', r: 'אסטרטגיה שמגלגלת שינוי בהדרגה בין קבוצות Clusters ולא לכולם בבת אחת' }
      ]
    }
  ];

  /* ============================================================
     מצב 5 - סידור תהליך GitOps: סבבים של שלבים שצריך לסדר בסדר הנכון
     ============================================================ */
  var ORDER_ROUNDS = [
    {
      title: 'הקמת GitOps flow מלא - מ-Repo ועד Sync ל-Cluster',
      steps: [
        'כתיבת מניפסטים (YAML / Helm / Kustomize) ושמירתם ב-Git Repo',
        'הגדרת AppProject עם הרשאות Repo ו-Destination מתאימות',
        'יצירת אובייקט Application שמצביע ל-Repo ולנתיב הרצוי',
        'ArgoCD משווה בין Desired State ל-Live State ומסמן OutOfSync',
        'ביצוע Sync (ידני או אוטומטי) שמיישם את המשאבים ב-Cluster',
        'בדיקת Health Status ווידוא שהאפליקציה הגיעה למצב Healthy'
      ]
    },
    {
      title: 'טיפול בשינוי ידני (Drift) עם selfHeal מופעל',
      steps: [
        'מישהו מריץ kubectl edit ומשנה משאב ישירות ב-Cluster',
        'ArgoCD מזהה הבדל בין Live State ל-Git ומסמן את ה-Application כ-OutOfSync',
        'מכיוון ש-selfHeal מופעל, ArgoCD מבצע Sync אוטומטי לתיקון הסטייה',
        'המשאב חוזר להיות תואם למה שמוגדר ב-Git',
        'סטטוס ה-Application חוזר ל-Synced'
      ]
    },
    {
      title: 'Sync עם PreSync Hook ל-Database Migration',
      steps: [
        'Commit חדש נדחף ל-Git עם שינוי בגרסת האפליקציה',
        'ArgoCD מזהה שהמצב הפך ל-OutOfSync',
        'תהליך ה-Sync מתחיל, ומריץ קודם את ה-Job המסומן PreSync',
        'ArgoCD ממתין שה-Job יסתיים בהצלחה (HookSucceeded) לפני שממשיך',
        'שאר המשאבים מסתנכרנים לפי סדר ה-sync-wave שהוגדר',
        'Job מסוג PostSync רץ לבדיקת Smoke Test אחרי שהכל Healthy'
      ]
    },
    {
      title: 'פריסה למספר Clusters עם ApplicationSet',
      steps: [
        'רישום כל ה-Clusters הרלוונטיים ב-ArgoCD עם argocd cluster add',
        'הוספת Labels ל-Clusters (למשל env=production)',
        'הגדרת ApplicationSet עם Cluster Generator שמסנן לפי Label',
        'ArgoCD יוצר אוטומטית Application נפרד לכל Cluster תואם',
        'כל Application מסתנכרנת באופן עצמאי אל היעד שלה'
      ]
    }
  ];

  /* ============================================================
     הגדרת מצבי המשחק
     ============================================================ */
  var MODES = [
    { key: 'rapid', icon: '⚡', name: 'קרב מהיר', desc: 'שאלות ידע כלליות על GitOps ו-ArgoCD - כמה תספיקו לפני שהזמן נגמר?', type: 'quiz', data: RAPID, sample: 8, time: 20000 },
    { key: 'sync', icon: '🔄', name: 'ניחוש התנהגות Sync', desc: 'קטע ממניפסט Application - מה בדיוק יקרה בסנכרון?', type: 'quiz', data: SYNC_GUESS, sample: 8, time: 28000, showCode: true },
    { key: 'cmd', icon: '🧩', name: 'השלמת YAML/פקודה', desc: 'מניפסט Application או פקודת argocd עם חלק חסר - בחרו מה משלים אותו נכון', type: 'quiz', data: CMD_COMPLETE, sample: 8, time: 28000, showCode: true },
    { key: 'match', icon: '🔗', name: 'התאמת מושגים', desc: 'התאימו כל מושג/שדה ב-ArgoCD לתיאור הנכון שלו', type: 'match', data: MATCH_ROUNDS, sample: 2 },
    { key: 'order', icon: '📋', name: 'סידור תהליך GitOps', desc: 'סדרו את שלבי התהליך לפי הסדר הנכון', type: 'order', data: ORDER_ROUNDS, sample: 2 }
  ];

  window.TG_CONFIG = { gameId: "argocd", modes: MODES };
})();
</script>

<script src="/scripts/topic-game.js"></script>
