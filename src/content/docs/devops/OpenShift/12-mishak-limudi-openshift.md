---
title: "משחק לימודי: אתגר OpenShift"
category: DevOps/OpenShift
part: 12/10
description: "משחק אינטראקטיבי ללימוד OpenShift - חמישה מצבי משחק עם טיימר, לבבות, ניקוד ורצפים: קרב מהיר, ניחוש מה קורה בפקודת oc/מניפסט, השלמת פקודות ומניפסטים, התאמת מושגים וסידור תהליכי עבודה."
---

חמישה מצבי משחק שבודקים היבטים שונים של OpenShift - ארכיטקטורה, oc CLI מול kubectl, Routes/Services, בנייה עם S2I, אחסון, RBAC/SCC ו-Operators/OLM. לא עוד חידון רב-ברירה, אלא משחק עם **טיימר**, **שלושה לבבות**, **מכפיל רצף** ו**שיא אישי** שנשמר בדפדפן. בסוף כל סבב תקבלו דירוג, ורשימת חזרה של בדיוק מה שפספסתם.


<div class="tg" id="tg" dir="rtl">
  <div class="tg-screen is-active" data-screen="menu">
    <div class="tg-hero">
      <div class="tg-hero-badge">OpenShift</div>
      <div class="tg-hero-title">אתגר OpenShift</div>
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
      q: 'מה ההבדל המרכזי בין OpenShift ל-Kubernetes "וניל"?',
      o: ['OpenShift בנוי על גבי Kubernetes ומוסיף שכבות ניהול, אבטחה (SCC) ובנייה (S2I) מובנות, קונסולה גרפית ותמיכה ארגונית', 'OpenShift ו-Kubernetes הם מוצרים נפרדים לגמרי בלי שום קשר ביניהם', 'OpenShift מחליף לגמרי את kube-apiserver ברכיב קנייני משלו', 'אין שום הבדל - זה אותו מוצר תחת שם אחר'],
      a: 0,
      w: 'OpenShift מבוסס על Kubernetes בליבתו, אך מוסיף עליו רכיבים כמו SCC, S2I, Routes, Web Console ו-OLM שהופכים אותו למוצר "batteries included" ארגוני.'
    },
    {
      q: 'מהי OKD?',
      o: ['גרסת הקוד הפתוח החינמית של OpenShift - ה-upstream project', 'מערכת ההפעלה שרצה על ה-nodes בקלאסטר', 'כלי CLI חלופי ל-oc', 'שירות ניטור מובנה בקונסולה'],
      a: 0,
      w: 'OKD (Origin Community Distribution) הוא הפרויקט הפתוח שממנו נגזר OpenShift Container Platform המסחרי.'
    },
    {
      q: 'מה ההבדל בין <code>oc</code> ל-<code>kubectl</code>?',
      o: ['<code>oc</code> מודע למשאבים הייחודיים ל-OpenShift (Route, BuildConfig, DeploymentConfig, Project) ומוסיף פקודות עזר כמו <code>oc new-app</code>/<code>oc rsh</code>/<code>oc debug</code>', '<code>kubectl</code> לא עובד בכלל מול קלאסטר OpenShift', '<code>oc</code> הוא רק כינוי (alias) של <code>kubectl</code> בלי שום הבדל בפועל', '<code>kubectl</code> תומך ב-Route וב-BuildConfig באותה מידה בדיוק כמו <code>oc</code>'],
      a: 0,
      w: '<code>kubectl</code> עובד היטב מול OpenShift לכל מה שמשותף ל-Kubernetes, אבל לא מכיר את ה-CRD-ים והפקודות הייחודיות ל-OpenShift - לכן <code>oc</code> הוא הבחירה המומלצת בעבודה יומיומית.'
    },
    {
      q: 'מהו ה-runtime הרשמי של קונטיינרים ב-OpenShift?',
      o: ['CRI-O', 'Docker Engine', 'containerd עצמאי מבית Red Hat', 'rkt'],
      a: 0,
      w: 'OpenShift משתמש ב-CRI-O כברירת מחדל, לא ב-Docker - זה חלק משכבת ה-Compute שרצה על ה-worker nodes.'
    },
    {
      q: 'מהו Route, ומה ייחודי בו לעומת Ingress הסטנדרטי?',
      o: ['משאב ייחודי ל-OpenShift לחשיפת שירות פנימי החוצה, מנוהל על ידי HAProxy Router, ותומך ב-edge/passthrough/reencrypt TLS ופיצול תעבורה (canary)', 'Route ו-Ingress הם בדיוק אותו API עם שם שונה', 'Route קיים רק ב-Kubernetes וניל ולא ב-OpenShift', 'Route מחליף לגמרי את ה-Service ולא צריך אותו יותר'],
      a: 0,
      w: 'Route הוא ה-resource הוותיק והעשיר יותר של OpenShift לחשיפה חיצונית; מאז OpenShift 4 יש תמיכה גם ב-Ingress הסטנדרטי, שממופה מאחורי הקלעים ל-Route.'
    },
    {
      q: 'מה חייב להתקיים תמיד לפני שאפשר ליצור Route תקין?',
      o: ['Service קיים שה-Route "יושב" מעליו', 'Deployment עם לפחות 5 רפליקות', 'StorageClass מוגדר בקלאסטר', 'ClusterRoleBinding ייעודי'],
      a: 0,
      w: 'Route לעולם לא חושף Pod ישירות - הוא תמיד מפנה לשירות פנימי (Service) קיים, ומוסיף לו נגישות חיצונית.'
    },
    {
      q: 'מהו S2I (Source-to-Image)?',
      o: ['מנגנון שלוקח קוד מקור מ-Git ו-builder image (כמו Node.js/Python) ובונה תמונת container מוכנה, בלי לכתוב Dockerfile', 'כלי לסריקת פגיעויות אבטחה בתמונות container', 'פרוטוקול תקשורת פנימי בין worker nodes', 'שם חלופי ל-Helm בתוך OpenShift'],
      a: 0,
      w: 'S2I מריץ תהליך assemble+run מוגדר מראש בתוך builder image - זו הדרך הפשוטה ביותר לבנות תמונה מקוד Git ישירות בתוך הקלאסטר.'
    },
    {
      q: 'מהו ImageStream?',
      o: ['abstraction ייחודי ל-OpenShift שעוקב אחרי תגיות של תמונה ומאפשר triggers אוטומטיים כשתמונה חדשה נכנסת', 'קובץ קונפיגורציה לרשת הפודים', 'משאב שמחליף לגמרי את ה-Service', 'כלי אגרגציית לוגים מובנה'],
      a: 0,
      w: 'ImageStream מכונה לפעמים "Git for Images" - כל משאב שמצביע על ImageStreamTag יכול לקבל trigger אוטומטי כשתמונה חדשה מגיעה, בלי webhook חיצוני.'
    },
    {
      q: 'מהו SCC (Security Context Constraints)?',
      o: ['מנגנון אבטחה ייחודי ל-OpenShift שקובע אילו הרשאות מותרות לפוד (ריצה כ-root, capabilities, סוגי volumes) - אין מקבילה מדויקת ב-Kubernetes וניל', 'משאב שמגדיר קווטות CPU וזיכרון בלבד', 'רכיב שמנהל אך ורק הצפנת TLS ל-Routes', 'כינוי נוסף ל-NetworkPolicy'],
      a: 0,
      w: 'SCC מקביל בגישתו ל-Pod Security Admission של Kubernetes, אך מחמיר וגמיש יותר, וקיים רק ב-OpenShift.'
    },
    {
      q: 'מהו ה-SCC המשמש כברירת מחדל לכל משתמש רגיל ב-OpenShift?',
      o: ['<code>restricted-v2</code> - חוסם ריצה כ-root ומחייב UID רנדומלי', '<code>privileged</code> - מעניק הרשאות מלאות כולל גישה לרכיבי host', '<code>anyuid</code> - מאפשר כל UID כברירת מחדל', '<code>hostnetwork</code> - גישה ישירה לרשת ה-host כברירת מחדל'],
      a: 0,
      w: '<code>restricted-v2</code> הוא ה-SCC הבטוח שמוענק כברירת מחדל; SCC-ים כמו <code>anyuid</code> ו-<code>privileged</code> דורשים הענקה מפורשת ונחשבים חריגה מהמדיניות הבטוחה.'
    },
    {
      q: 'מהו Operator בעולם Kubernetes/OpenShift?',
      o: ['דפוס תכנון שמרחיב את ה-API כדי לנהל אפליקציה מורכבת אוטומטית (reconciliation loop) - התקנה, שדרוגים, גיבויים ותיקון תקלות', 'כלי CLI חלופי ל-<code>oc</code>', 'רכיב רשת שמנתב תעבורה בין worker nodes', 'משתמש שמקבל הרשאות cluster-admin קבועות'],
      a: 0,
      w: 'Operator עוקב כל הזמן אחרי מצב היעד הרצוי ופועל להתאים את המצב בפועל אליו - כאילו יש לאפליקציה "מנהל מערכת אנושי" אוטומטי.'
    },
    {
      q: 'מהו CRD (Custom Resource Definition)?',
      o: ['הגדרה שמלמדת את ה-Kubernetes API "type" חדש, שעליו מבוסס Operator', 'קובץ הרשאות RBAC', 'תבנית ליצירת StorageClass', 'פרוטוקול שמגדיר את התנהגות ה-Ingress'],
      a: 0,
      w: 'בלי CRD אין Operator - זו ההגדרה שמאפשרת ל-API server להכיר משאב מותאם אישית כמו <code>PostgresCluster</code>.'
    },
    {
      q: 'מה תפקיד OLM (Operator Lifecycle Manager)?',
      o: ['מנהל את מחזור החיים של ה-Operators עצמם - התקנה, שדרוג, תלויות והרשאות, דרך OperatorHub', 'מריץ builds מבוססי S2I', 'מנהל את ה-PersistentVolumes בקלאסטר', 'אחראי על ניתוב Routes'],
      a: 0,
      w: 'OLM הוא זה שדואג ש-Operator יותקן, יעודכן ויקבל את ההרשאות הנכונות - נגיש דרך OperatorHub בקונסולה או ב-CLI.'
    },
    {
      q: 'מה ההבדל בין PersistentVolume (PV) ל-PersistentVolumeClaim (PVC)?',
      o: ['PV הוא חתיכת אחסון בפועל בקלאסטר, ו-PVC היא בקשה של אפליקציה לאחסון שנקשרת (bind) ל-PV מתאים', 'הם שני שמות שונים לאותו משאב בדיוק', 'PVC תמיד נוצר לפני PV ולעולם לא ההפך', 'PV ייחודי לסביבות ענן ו-PVC ייחודי לסביבות on-prem'],
      a: 0,
      w: 'PV נוצר על ידי אדמין או דרך provisioning דינמי מ-StorageClass; PVC היא "בקשת" המשתמש שנקשרת לאחד ה-PV-ים הזמינים.'
    },
    {
      q: 'מה ההבדל בין <code>readinessProbe</code> ל-<code>livenessProbe</code>?',
      o: ['<code>readinessProbe</code> קובעת אם הפוד מוכן לקבל תעבורה (כישלון = הסרה מה-Service), <code>livenessProbe</code> קובעת אם הפוד "חי" בכלל (כישלון = restart)', 'שתי הבדיקות זהות לחלוטין', '<code>readinessProbe</code> גורמת תמיד ל-restart, <code>livenessProbe</code> רק מסירה מה-Service', 'הן רלוונטיות רק ל-DeploymentConfig ולא ל-Deployment'],
      a: 0,
      w: 'בלבול בין השתיים עלול לגרום ל-restart loops מיותרים כשהבעיה בעצם זמנית, למשל התחברות איטית למסד נתונים.'
    },
    {
      q: 'מהי DeploymentConfig, ומה ההמלצה הנוכחית של Red Hat?',
      o: ['משאב legacy ייחודי ל-OpenShift המבוסס על ReplicationController; Red Hat ממליצה כיום להשתמש ב-Deployment הרגיל בפרויקטים חדשים', 'DeploymentConfig הוא המשאב היחיד שקיים ב-OpenShift לניהול פודים', 'DeploymentConfig הוסר לגמרי ואינו קיים יותר בקלאסטרים', 'DeploymentConfig הוא חלק סטנדרטי מ-Kubernetes וניל'],
      a: 0,
      w: 'Deployment הוא native ל-Kubernetes ומנוהל דרך ReplicaSet; DeploymentConfig תומך ב-triggers מ-ImageStream ו-lifecycle hooks, אך נחשב legacy כיום.'
    },
    {
      q: 'מה תפקיד HorizontalPodAutoscaler (HPA)?',
      o: ['מגדיל/מקטין אוטומטית את מספר הרפליקות של Deployment לפי מדדים כמו CPU/זיכרון, בין <code>minReplicas</code> ל-<code>maxReplicas</code>', 'יוצר PersistentVolumes אוטומטית', 'מנהל את הרשאות ה-RBAC בקלאסטר', 'קובע את ה-SCC המותר לכל פוד'],
      a: 0,
      w: 'HPA צופה במדדים בזמן אמת (בדרך כלל דרך Prometheus/Metrics Server) ומתאים את מספר הרפליקות בתוך הגבולות שהוגדרו.'
    },
    {
      q: 'מה עושה <code>oc new-project my-app</code>?',
      o: ['יוצרת namespace/project חדש בשם <code>my-app</code> ומעבירה אליו אוטומטית', 'רק מציגה רשימה של פרויקטים קיימים', 'מוחקת פרויקט קיים בשם <code>my-app</code>', 'יוצרת Operator חדש בשם <code>my-app</code>'],
      a: 0,
      w: 'ב-OpenShift, Project הוא Namespace עם שכבת ניהול נוספת (כמו quotas והרשאות ברירת מחדל) - <code>new-project</code> יוצר ומעביר אליו בפעולה אחת.'
    }
  ];

  /* ============================================================
     מצב 2 - ניחוש מה קורה: פקודת oc / מניפסט + מה בדיוק קורה בפועל
     ============================================================ */
  var OC_GUESS = [
    {
      code: '$ oc new-app nodejs:18~https://github.com/example/my-node-app.git --name=my-node-app',
      q: 'מה בדיוק קורה כתוצאה מהפקודה הזו?',
      o: ['נוצרים בבת אחת ImageStream, BuildConfig מבוסס S2I, ו-Deployment/Service עבור האפליקציה - בלי צורך בכתיבת Dockerfile', 'רק מורדת תמונה מוכנה מ-Docker Hub בלי שום build', 'נוצר Pod בודד בלבד, בלי Service', 'מריצה סריקת אבטחה על הקוד ב-Git ולא יוצרת שום משאב'],
      a: 0,
      w: 'תחביר <code>builder~git-url</code> מזהה ש-OpenShift צריך להריץ S2I build, ו-<code>new-app</code> יוצר בבת אחת את כל שרשרת המשאבים: ImageStream, BuildConfig, Deployment ו-Service.'
    },
    {
      code: 'Error creating: pods "my-pod" is forbidden: unable to validate against\nany security context constraint: [provider "restricted-v2": .spec.containers[0].\nsecurityContext.runAsUser: Invalid value: 0: must be in the ranged allocation]',
      q: 'מה גורם לשגיאה הזו, ומה הפתרון הנכון?',
      o: ['הפוד מנסה לרוץ עם UID 0 (root), וה-SCC <code>restricted-v2</code> חוסם זאת - הפתרון הנכון הוא לתקן את ה-Dockerfile לרוץ עם USER לא-root, לא להעניק <code>anyuid</code>', 'חסרות הרשאות RBAC ל-ServiceAccount', 'אין מספיק זיכרון פנוי בקלאסטר', 'ה-Namespace שאליו מנסים לפרוס לא קיים'],
      a: 0,
      w: 'זו השגיאה הכי נפוצה למי שבא מ-Docker רגיל. הפתרון הנכון הוא לתקן את התמונה עצמה (USER לא-root), ולא להעניק <code>anyuid</code> שהוא security anti-pattern.'
    },
    {
      code: 'apiVersion: route.openshift.io/v1\nkind: Route\nmetadata:\n  name: my-app-secure-route\nspec:\n  host: my-app.apps.mycluster.example.com\n  to:\n    kind: Service\n    name: my-app-svc\n  tls:\n    termination: edge\n    insecureEdgeTerminationPolicy: Redirect',
      q: 'מגיעה בקשה ב-HTTP רגיל (לא HTTPS) ל-Route הזה. מה קורה?',
      o: ['הראוטר מפנה (redirect) אותה אוטומטית ל-HTTPS', 'הבקשה נחסמת עם שגיאה ולא מגיעה לשום מקום', 'הבקשה מגיעה כמו שהיא לפוד, בלי הצפנה בכלל', 'הראוטר מתעלם מהבקשה בלי לשלוח תגובה'],
      a: 0,
      w: '<code>insecureEdgeTerminationPolicy: Redirect</code> גורם ל-HAProxy Router להפנות כל בקשת HTTP אוטומטית ל-HTTPS, בשילוב עם <code>termination: edge</code>.'
    },
    {
      code: 'apiVersion: route.openshift.io/v1\nkind: Route\nmetadata:\n  name: canary-route\nspec:\n  host: my-app.apps.mycluster.example.com\n  to:\n    kind: Service\n    name: my-app-v1\n    weight: 90\n  alternateBackends:\n    - kind: Service\n      name: my-app-v2\n      weight: 10',
      q: 'בערך כמה אחוז מהתעבורה יגיעו ל-<code>my-app-v2</code>?',
      o: ['כ-10%', 'כ-90%', 'כ-50%', '100% - כל התעבורה עוברת לגרסה החדשה'],
      a: 0,
      w: 'המשקלים (<code>weight</code>) קובעים חלוקה יחסית - כאן 90 מול 10 מתורגם לכ-90% ל-v1 וכ-10% ל-v2, בדיוק טכניקת canary deployment.'
    },
    {
      code: 'apiVersion: autoscaling/v2\nkind: HorizontalPodAutoscaler\nmetadata:\n  name: my-app-hpa\nspec:\n  minReplicas: 2\n  maxReplicas: 10\n  metrics:\n    - type: Resource\n      resource:\n        name: cpu\n        target:\n          type: Utilization\n          averageUtilization: 70',
      q: 'העומס על האפליקציה עולה משמעותית מעל היעד שהוגדר (70% CPU). מה יקרה?',
      o: ['ה-HPA יגדיל בהדרגה את מספר הרפליקות של ה-Deployment, עד למקסימום 10', 'ה-HPA ימחק את ה-Deployment ויתחיל אותו מחדש', 'מספר הרפליקות יישאר קבוע - HPA רק מנטר בלי לפעול בפועל', 'הפוד היחיד יקבל אוטומטית יותר CPU, בלי רפליקות נוספות'],
      a: 0,
      w: 'HPA משווה את השימוש בפועל ליעד שהוגדר, ומתאים את מספר הרפליקות בתוך הגבולות <code>minReplicas</code>-<code>maxReplicas</code> - כאן בין 2 ל-10.'
    },
    {
      code: '$ oc get pvc\nNAME          STATUS    VOLUME   CAPACITY   ACCESS MODES   STORAGECLASS   AGE\nmy-app-data   Pending                                                     47s',
      q: 'ה-PVC נמצא במצב <code>Pending</code> כבר כמעט דקה. מה קרוב לוודאי הגורם?',
      o: ['אין StorageClass מתאים (או PV קיים) שיכול לספק את הבקשה - ה-PVC ממתין ל-provisioning', 'ה-PVC נמצא תמיד במצב Pending כברירת מחדל ואין בעיה', 'יש בעיית הרשאות RBAC', 'הפוד שמשתמש ב-PVC עדיין לא רץ - זו הסיבה היחידה האפשרית'],
      a: 0,
      w: 'PVC נשאר Pending כשאין PV קיים שמתאים לדרישות, ואין StorageClass עם dynamic provisioner שיכול ליצור אחד אוטומטית.'
    },
    {
      code: '$ oc get pods\nNAME                     READY   STATUS             RESTARTS   AGE\nmy-app-7c9f8d6b5-xk2pl   0/1     CrashLoopBackOff   6          8m',
      q: 'מה אומר סטטוס <code>CrashLoopBackOff</code> עם RESTARTS גדל?',
      o: ['הקונטיינר קורס שוב ושוב, ו-Kubernetes ממתין זמן גובר (backoff) בין ניסיונות הפעלה מחדש', 'הפוד ממתין לתמונה שעדיין לא הורדה מה-registry', 'הפוד רץ תקין אבל רק ה-Readiness Probe נכשלת', 'הפוד הוסר מה-Service אך ממשיך לרוץ כרגיל'],
      a: 0,
      w: 'זה סימן קלאסי לתהליך שנכשל מיד עם עלייתו (למשל שגיאת קונפיגורציה או חיבור ל-DB) - כדאי לבדוק <code>oc logs</code> ו-<code>oc describe pod</code> כדי לאתר את הסיבה.'
    },
    {
      code: '$ oc rollout undo deployment/my-web-app --to-revision=2',
      q: 'מה עושה הפקודה הזו בפועל?',
      o: ['מחזירה את ה-Deployment בדיוק לגרסה (revision) 2 מההיסטוריה', 'מוחקת את כל ה-revisions הקודמים לצמיתות', 'עוצרת את ה-rollout הנוכחי בלי לשנות דבר', 'יוצרת revision חדש עם אותה תמונה שרצה כרגע'],
      a: 0,
      w: '<code>rollout undo --to-revision</code> מחזיר את ה-Deployment לגרסה ספציפית שמופיעה ב-<code>oc rollout history</code>, ולא רק לגרסה הקודמת האחרונה.'
    },
    {
      code: 'apiVersion: build.openshift.io/v1\nkind: BuildConfig\nmetadata:\n  name: my-node-app\nspec:\n  triggers:\n    - type: ImageChange\n    - type: ConfigChange',
      q: 'תמונת ה-builder image (base) שה-BuildConfig מסתמך עליה מתעדכנת ב-ImageStream. מה קורה בזכות ה-trigger מסוג <code>ImageChange</code>?',
      o: ['מופעל אוטומטית build חדש של BuildConfig, בלי צורך ב-webhook חיצוני', 'שום דבר לא קורה עד הרצה ידנית של <code>oc start-build</code>', 'הפוד הקיים נמחק מיידית בלי build חדש', 'ה-Route מתעדכן ישירות בלי לעבור build כלל'],
      a: 0,
      w: 'זה בדיוק היתרון של ImageStream - כל שינוי בתמונה שה-BuildConfig מצביע עליה מפעיל build חדש אוטומטית, ללא הגדרת webhook נפרד.'
    },
    {
      code: '$ oc adm policy add-role-to-user edit jdoe -n my-app',
      q: 'מה התפקיד <code>edit</code> מאפשר למשתמש jdoe בתוך ה-namespace my-app?',
      o: ['ליצור, לערוך ולמחוק את רוב המשאבים ב-namespace, אך לא לנהל הרשאות RBAC', 'שליטה מלאה בקלאסטר כולו, כולל ניהול הרשאות', 'קריאה בלבד, בלי אפשרות לשנות משאבים', 'גישה מלאה לכל ה-namespaces בקלאסטר'],
      a: 0,
      w: 'התפקיד <code>edit</code> נותן הרשאות עבודה יומיומיות (יצירה/עריכה/מחיקה) בתוך namespace יחיד, אך לא כולל שינוי RoleBindings - זה תפקידו של <code>admin</code>.'
    },
    {
      code: '$ oc get pod my-pod -o yaml | grep openshift.io/scc\n    openshift.io/scc: anyuid',
      q: 'לפוד הזה משויך SCC בשם <code>anyuid</code>. מה זה אומר בפועל?',
      o: ['הפוד קיבל הרשאה מפורשת לרוץ עם כל UID כולל root - חריגה מברירת המחדל הבטוחה יותר (<code>restricted-v2</code>)', 'זהו ה-SCC המחמיר ביותר שקיים בקלאסטר', 'הפוד לא יכול לרוץ בכלל עם SCC כזה', 'זה אומר שהפוד רץ עם הרשאות cluster-admin'],
      a: 0,
      w: '<code>anyuid</code> חייב הענקה מפורשת דרך <code>oc adm policy add-scc-to-user/add-scc-to-group</code>, ומשמעותו שהפוד יכול לרוץ עם UID קבוע כולל 0 (root).'
    },
    {
      code: 'apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: my-web-app\nspec:\n  replicas: 3\n  strategy:\n    type: RollingUpdate\n    rollingUpdate:\n      maxUnavailable: 1\n      maxSurge: 1',
      q: 'תוך כדי rolling update, מה טווח מספר הפודים הרצים בו-זמנית (ישנים+חדשים יחד)?',
      o: ['בין 2 ל-4 פודים בו-זמנית (3 מינוס maxUnavailable, עד 3 פלוס maxSurge)', 'תמיד בדיוק 3 פודים לאורך כל העדכון', 'אפס פודים בזמן העדכון - downtime מלא', 'תמיד 6 פודים - הכפלה מיידית של הכמות'],
      a: 0,
      w: '<code>maxUnavailable: 1</code> אומר שלכל היותר פוד אחד יכול להיות לא זמין, ו-<code>maxSurge: 1</code> מאפשר עד פוד נוסף אחד מעבר ל-replicas המקורי - כך שיש תמיד שירות רציף.'
    },
    {
      code: '$ oc get csv -n openshift-operators\nNAME                          DISPLAY               VERSION   PHASE\npostgresql-operator.v5.3.0    PostgreSQL Operator    5.3.0     Succeeded',
      q: 'מה מציין <code>PHASE: Succeeded</code> בפלט של <code>oc get csv</code>?',
      o: ['ה-Operator הותקן בהצלחה במלואו ומוכן לשימוש בקלאסטר', 'ה-build האחרון של אפליקציה הסתיים בהצלחה', 'הפוד עבר בהצלחה את ה-Readiness Probe', 'ה-Route של האפליקציה נוצר בהצלחה'],
      a: 0,
      w: '<code>ClusterServiceVersion (CSV)</code> הוא "המניפסט" של גרסת Operator מותקנת - <code>Succeeded</code> מציין שההתקנה דרך OLM הסתיימה בהצלחה.'
    },
    {
      code: '$ oc expose service my-app-svc\n$ oc get route my-app-svc\nNAME         HOST/PORT                                                  SERVICES\nmy-app-svc   my-app-svc-my-project.apps.mycluster.example.com          my-app-svc',
      q: 'מה עשתה בפועל הפקודה <code>oc expose service</code>?',
      o: ['יצרה אוטומטית Route חדש שמצביע על ה-Service הקיים, עם hostname שנוצר לפי דפוס ברירת מחדל', 'יצרה Service חדש במקום הקיים', 'מחקה את ה-Service ה-my-app-svc', 'שינתה את מספר הרפליקות ב-Deployment'],
      a: 0,
      w: 'זו הדרך המהירה ביותר ליצור Route ללא כתיבת YAML - OpenShift בונה hostname אוטומטי בדפוס <code>&lt;service&gt;-&lt;project&gt;.&lt;domain&gt;</code>.'
    }
  ];

  /* ============================================================
     מצב 3 - השלמת פקודה/מניפסט: חלק חסר, לבחור מה משלים אותו נכון
     ============================================================ */
  var CMD_COMPLETE = [
    {
      code: '$ oc new-app nodejs:18~https://github.com/example/my-node-app.git ___=my-node-app',
      q: 'מה משלים את הפקודה כדי לתת שם מפורש למשאבים שייווצרו?',
      o: ['<code>--name</code>', '<code>--tag</code>', '<code>--label</code>', '<code>--title</code>'],
      a: 0,
      w: '<code>--name</code> קובע את השם שישמש עבור ה-ImageStream, BuildConfig, Deployment ו-Service שנוצרים על ידי <code>new-app</code>.'
    },
    {
      code: '$ oc ___ svc/my-node-app',
      q: 'מה משלים את הפקודה כדי לחשוף את השירות החוצה ולקבל Route אוטומטי?',
      o: ['<code>expose</code>', '<code>new-app</code>', '<code>describe</code>', '<code>create</code>'],
      a: 0,
      w: '<code>oc expose svc/&lt;name&gt;</code> יוצר Route חדש שמצביע על ה-Service הקיים, עם hostname שנוצר אוטומטית.'
    },
    {
      code: '$ oc ___ my-app-docker --follow',
      q: 'מה משלים את הפקודה כדי להריץ build ידני על BuildConfig קיים ולעקוב אחרי הלוג?',
      o: ['<code>start-build</code>', '<code>new-build</code>', '<code>run-build</code>', '<code>trigger-build</code>'],
      a: 0,
      w: '<code>oc start-build &lt;bc-name&gt; --follow</code> מפעיל build חדש ומזרים את הלוג ישירות לטרמינל, בדיוק כמו <code>oc logs -f bc/&lt;name&gt;</code>.'
    },
    {
      code: 'apiVersion: route.openshift.io/v1\nkind: ___\nmetadata:\n  name: my-app-route\nspec:\n  host: my-app.apps.mycluster.example.com\n  to:\n    kind: Service\n    name: my-app-svc',
      q: 'מה משלים את שדה ה-<code>kind</code> במניפסט הזה, שמנתב תעבורה חיצונית אל Service קיים?',
      o: ['<code>Route</code>', '<code>Ingress</code>', '<code>Service</code>', '<code>Endpoint</code>'],
      a: 0,
      w: 'ה-<code>apiVersion: route.openshift.io/v1</code> מלמד שמדובר במשאב Route - הייחודי ל-OpenShift לחשיפה חיצונית דרך HAProxy Router.'
    },
    {
      code: 'apiVersion: v1\nkind: Service\nmetadata:\n  name: my-app-nodeport\nspec:\n  type: ___\n  ports:\n    - port: 80\n      targetPort: 8080\n      nodePort: 30080',
      q: 'מה משלים את שדה <code>type</code> כדי לחשוף את השירות דרך פורט קבוע על כל node?',
      o: ['<code>NodePort</code>', '<code>ClusterIP</code>', '<code>LoadBalancer</code>', '<code>ExternalName</code>'],
      a: 0,
      w: '<code>NodePort</code> חושף את השירות בטווח פורטים 30000-32767 על כל node בקלאסטר - שדה <code>nodePort</code> קובע את הפורט הספציפי.'
    },
    {
      code: 'apiVersion: route.openshift.io/v1\nkind: Route\nmetadata:\n  name: my-app-secure-route\nspec:\n  tls:\n    termination: ___\n    insecureEdgeTerminationPolicy: Redirect',
      q: 'איזה סוג termination הכי נפוץ - מסתיים ב-Router, ומהראוטר לפוד זה HTTP רגיל?',
      o: ['<code>edge</code>', '<code>passthrough</code>', '<code>reencrypt</code>', '<code>none</code>'],
      a: 0,
      w: '<code>edge</code> הוא הפשוט והנפוץ ביותר לניהול - ה-TLS מסתיים ב-Router עצמו. <code>passthrough</code> מעביר TLS עד הפוד, ו-<code>reencrypt</code> פותח TLS מחדש פנימית לאחר סיום ב-Router.'
    },
    {
      code: '$ oc rollout ___ deployment/my-web-app --to-revision=2',
      q: 'מה משלים את הפקודה כדי לחזור בדיוק לגרסה קודמת ספציפית מההיסטוריה?',
      o: ['<code>undo</code>', '<code>history</code>', '<code>pause</code>', '<code>status</code>'],
      a: 0,
      w: '<code>oc rollout undo deployment/&lt;name&gt; --to-revision=&lt;n&gt;</code> מחזיר את ה-Deployment לגרסה מספרית ספציפית שאפשר לראות ב-<code>oc rollout history</code>.'
    },
    {
      code: '$ oc adm policy add-role-to-user ___ jdoe -n my-app',
      q: 'איזה תפקיד מובנה נותן ל-jdoe יצירה/עריכה/מחיקה של רוב המשאבים, אך לא ניהול RBAC?',
      o: ['<code>edit</code>', '<code>view</code>', '<code>admin</code>', '<code>cluster-admin</code>'],
      a: 0,
      w: '<code>view</code> נותן קריאה בלבד, <code>admin</code> מוסיף גם ניהול הרשאות בתוך ה-namespace, ו-<code>cluster-admin</code> נותן שליטה על הקלאסטר כולו - <code>edit</code> הוא בדיוק באמצע.'
    },
    {
      code: '$ oc adm policy add-scc-to-user ___ -z my-app-sa -n my-app',
      q: 'אפליקציה חייבת (מסיבה טכנית) לרוץ כ-root - איזה SCC נדרש להעניק ל-ServiceAccount שלה, בזהירות?',
      o: ['<code>anyuid</code>', '<code>restricted-v2</code>', '<code>nonroot-v2</code>', '<code>view</code>'],
      a: 0,
      w: '<code>anyuid</code> מאפשר ריצה עם כל UID כולל 0 (root), אך זו הענקה שצריך לשקול בזהירות - עדיף תמיד לתקן את התמונה במקום.'
    },
    {
      code: 'apiVersion: autoscaling/v2\nkind: ___\nmetadata:\n  name: my-app-hpa\nspec:\n  minReplicas: 2\n  maxReplicas: 10',
      q: 'מה משלים את שדה <code>kind</code> עבור המשאב שמבצע הרחבה/צמצום אוטומטי של מספר הרפליקות?',
      o: ['<code>HorizontalPodAutoscaler</code>', '<code>Deployment</code>', '<code>ReplicaSet</code>', '<code>PodDisruptionBudget</code>'],
      a: 0,
      w: 'HorizontalPodAutoscaler (HPA) הוא המשאב שמנטר מדדים כמו CPU ומתאים את מספר הרפליקות בין <code>minReplicas</code> ל-<code>maxReplicas</code>.'
    },
    {
      code: '$ oc create secret ___ db-credentials \\\n  --from-literal=username=admin \\\n  --from-literal=password=SuperSecretPass123!',
      q: 'מה משלים את הפקודה כדי ליצור Secret כללי מ-key/value ישירים?',
      o: ['<code>generic</code>', '<code>docker-registry</code>', '<code>tls</code>', '<code>opaque</code>'],
      a: 0,
      w: '<code>oc create secret generic</code> מיועד לזוגות מפתח/ערך כלליים; <code>docker-registry</code> ו-<code>tls</code> הם סוגי Secret ייעודיים לתעודות ולגישה ל-registry.'
    },
    {
      code: 'apiVersion: v1\nkind: PersistentVolumeClaim\nmetadata:\n  name: my-app-data\nspec:\n  accessModes:\n    - ___\n  resources:\n    requests:\n      storage: 10Gi',
      q: 'מה משלים את <code>accessModes</code> כדי לאפשר עריכה מ-node בודד בלבד (הנפוץ ביותר)?',
      o: ['<code>ReadWriteOnce</code>', '<code>ReadOnlyMany</code>', '<code>ReadWriteMany</code>', '<code>ExternalName</code>'],
      a: 0,
      w: '<code>ReadWriteOnce (RWO)</code> מאפשר קריאה/כתיבה מ-node אחד בלבד בו-זמנית - המצב הנפוץ עבור דיסקים כמו AWS EBS.'
    },
    {
      code: '$ oc get ___ -n openshift-operators\nNAME                          DISPLAY               VERSION   PHASE\npostgresql-operator.v5.3.0    PostgreSQL Operator    5.3.0     Succeeded',
      q: 'איזה משאב בודקים כדי לוודא שהתקנת Operator דרך OLM הסתיימה בהצלחה?',
      o: ['<code>csv</code> (ClusterServiceVersion)', '<code>pods</code> בלבד', '<code>routes</code>', '<code>pvc</code>'],
      a: 0,
      w: 'ה-ClusterServiceVersion הוא "המניפסט" של גרסת Operator ספציפית - שדה <code>PHASE: Succeeded</code> מאשר שההתקנה הושלמה.'
    },
    {
      code: 'apiVersion: operators.coreos.com/v1alpha1\nkind: Subscription\nmetadata:\n  name: postgresql-operator\n  namespace: openshift-operators\nspec:\n  channel: stable\n  installPlanApproval: ___',
      q: 'איזה ערך גורם ל-InstallPlan להתאשר אוטומטית, בלי אישור ידני?',
      o: ['<code>Automatic</code>', '<code>Manual</code>', '<code>Approved</code>', '<code>Confirmed</code>'],
      a: 0,
      w: '<code>Automatic</code> מאשר עדכוני Operator אוטומטית; <code>Manual</code> דורש אישור מפורש של כל InstallPlan - שימושי בסביבות שרוצים שליטה מלאה על עדכונים.'
    }
  ];

  /* ============================================================
     מצב 4 - התאמת מושגים: סבבים של זוגות פקודה/מושג + תיאור
     ============================================================ */
  var MATCH_ROUNDS = [
    {
      title: 'משאבי ליבה',
      pairs: [
        { l: '<code>Pod</code>', r: 'היחידה הקטנה ביותר להרצת קונטיינר/ים בקלאסטר' },
        { l: '<code>Deployment</code>', r: 'מנהל ReplicaSet ופודים stateless - הסטנדרט המומלץ כיום' },
        { l: '<code>DeploymentConfig</code>', r: 'משאב legacy ייחודי ל-OpenShift, מבוסס ReplicationController' },
        { l: '<code>Service</code>', r: 'כתובת יציבה בתוך הקלאסטר שמצביעה תמיד על פודים חיים ובריאים' },
        { l: '<code>Project</code>', r: 'namespace עם שכבת ניהול נוספת ייחודית ל-OpenShift' }
      ]
    },
    {
      title: 'רשת וחשיפה',
      pairs: [
        { l: '<code>ClusterIP</code>', r: 'סוג Service ברירת המחדל - נגיש רק בתוך הקלאסטר' },
        { l: '<code>Route</code>', r: 'משאב ייחודי ל-OpenShift לחשיפת שירות פנימי החוצה, דרך HAProxy Router' },
        { l: '<code>Ingress</code>', r: 'התקן הרשת הסטנדרטי של Kubernetes, נתמך גם ב-OpenShift 4 ומתורגם ל-Route' },
        { l: 'Edge termination', r: 'TLS מסתיים ב-Router, מהראוטר לפוד זה HTTP רגיל' },
        { l: '<code>alternateBackends</code>', r: 'שדה ב-Route שמאפשר פיצול תעבורה בין גרסאות (canary/blue-green)' }
      ]
    },
    {
      title: 'בנייה ותמונות',
      pairs: [
        { l: 'S2I', r: 'בונה תמונת container מקוד ב-Git + builder image, בלי Dockerfile' },
        { l: '<code>ImageStream</code>', r: 'עוקב אחרי תגיות תמונה ומאפשר triggers אוטומטיים כשתמונה מתעדכנת' },
        { l: '<code>BuildConfig</code>', r: 'מגדיר את מקור הקוד, אסטרטגיית הבנייה ותמונת היעד' },
        { l: '<code>oc new-app</code>', r: 'פקודת עזר שיוצרת ImageStream + BuildConfig + Deployment + Service בבת אחת' },
        { l: '<code>oc start-build</code>', r: 'מפעילה build ידני על BuildConfig קיים' }
      ]
    },
    {
      title: 'אחסון',
      pairs: [
        { l: 'PersistentVolume (PV)', r: 'חתיכת אחסון פיזי/וירטואלי בפועל בקלאסטר' },
        { l: 'PersistentVolumeClaim (PVC)', r: 'בקשה של אפליקציה לאחסון בגודל ותכונות מסוימות' },
        { l: 'StorageClass', r: 'תבנית שמגדירה סוג אחסון ואיך הוא נוצר אוטומטית (dynamic provisioning)' },
        { l: 'CSI', r: 'הפרוטוקול הסטנדרטי שדרכו ספקי אחסון מתחברים לקלאסטר' },
        { l: '<code>ReadWriteOnce</code>', r: 'accessMode שמאפשר עריכת הכרך מ-node בודד בלבד' }
      ]
    },
    {
      title: 'אבטחה ותפעול',
      pairs: [
        { l: 'SCC', r: 'מנגנון ייחודי ל-OpenShift שקובע אילו הרשאות אבטחה מותרות לפוד' },
        { l: 'RoleBinding', r: 'מקשר Role/ClusterRole למשתמש או ServiceAccount בתוך namespace ספציפי' },
        { l: 'ServiceAccount', r: '"המשתמש" שתחתיו רץ פוד מול ה-API - ברירת מחדל: default' },
        { l: 'Operator', r: 'דפוס תכנון שמנהל אפליקציה מורכבת אוטומטית לפי reconciliation loop' },
        { l: 'OLM', r: 'מנהל את מחזור החיים של ה-Operators עצמם - התקנה, שדרוג ותלויות' }
      ]
    }
  ];

  /* ============================================================
     מצב 5 - סידור תהליך: סבבים של שלבים שצריך לסדר בסדר הנכון
     ============================================================ */
  var ORDER_ROUNDS = [
    {
      title: 'בנייה ופריסת אפליקציה מקוד Git עם S2I',
      steps: [
        'יצירת פרויקט חדש עם oc new-project',
        'הרצת oc new-app עם קישור ל-Git repository ו-builder image מתאים',
        'מעקב אחרי לוג ה-build עם oc logs -f bc/<name>',
        'בדיקה שה-Pod עלה בהצלחה עם oc get pods',
        'חשיפת השירות החוצה עם oc expose svc/<name>',
        'אימות גישה לאפליקציה דרך ה-Route שנוצר'
      ]
    },
    {
      title: 'פתרון שגיאת SCC כשפוד מנסה לרוץ כ-root',
      steps: [
        'ניסיון להריץ Pod עם תמונה שברירת המחדל שלה היא USER root',
        'קבלת שגיאת יצירה שמצביעה על restricted-v2 ו-runAsUser',
        'איתור הסיבה עם oc describe pod / oc get events',
        'עדכון ה-Dockerfile להריץ עם USER לא-root (UID קבוע)',
        'בנייה מחדש של התמונה ופריסה מחדש של ה-Deployment'
      ]
    },
    {
      title: 'מתן הרשאת עריכה (edit) למשתמש חדש בתוך namespace',
      steps: [
        'זיהוי שם המשתמש (או יצירת ServiceAccount ייעודי)',
        'הרצת oc adm policy add-role-to-user edit על המשתמש בתוך ה-namespace',
        'אימות ההרשאה עם oc auth can-i create deployments -n <ns>',
        'בדיקה בפועל שהמשתמש מצליח ליצור או לערוך משאב',
        'תיעוד השינוי ב-YAML declarative שנשמר ב-Git, לא רק כפקודת CLI חד-פעמית'
      ]
    },
    {
      title: 'התקנת Operator דרך OLM והפעלתו',
      steps: [
        'איתור ה-Operator הרצוי ב-OperatorHub',
        'יצירת Subscription שמצביעה על ה-CatalogSource וה-channel הרצוי',
        'אישור InstallPlan (כאשר installPlanApproval הוא Manual)',
        'המתנה ל-PHASE: Succeeded ב-ClusterServiceVersion (CSV)',
        'יצירת custom resource (CR) שה-Operator אמור לנהל',
        'מעקב אחרי הלוגים/סטטוס כדי לוודא שה-Operator יצר בפועל את התשתית'
      ]
    }
  ];

  /* ============================================================
     הגדרת מצבי המשחק
     ============================================================ */
  var MODES = [
    { key: 'rapid', icon: '⚡', name: 'קרב מהיר', desc: 'שאלות ידע כלליות על OpenShift - כמה תספיקו לפני שהזמן נגמר?', type: 'quiz', data: RAPID, sample: 8, time: 20000 },
    { key: 'guess', icon: '🔎', name: 'ניחוש מה קורה', desc: 'פקודת oc או מניפסט - מה בדיוק קורה בפועל בקלאסטר?', type: 'quiz', data: OC_GUESS, sample: 8, time: 28000, showCode: true },
    { key: 'cmd', icon: '🧩', name: 'השלמת פקודה/מניפסט', desc: 'פקודת oc או שדה במניפסט עם חלק חסר - בחרו מה משלים אותו נכון', type: 'quiz', data: CMD_COMPLETE, sample: 8, time: 28000, showCode: true },
    { key: 'match', icon: '🔗', name: 'התאמת מושגים', desc: 'התאימו כל משאב/מושג OpenShift לתיאור הנכון שלו', type: 'match', data: MATCH_ROUNDS, sample: 2 },
    { key: 'order', icon: '📋', name: 'סידור תהליך', desc: 'סדרו את שלבי התהליך לפי הסדר הנכון', type: 'order', data: ORDER_ROUNDS, sample: 2 }
  ];

  window.TG_CONFIG = { gameId: "openshift", modes: MODES };
})();
</script>

<script src="/scripts/topic-game.js"></script>
