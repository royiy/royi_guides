---
title: "משחק לימודי: אתגר Kubernetes"
category: DevOps/Kubernetes
part: 13/10
description: "משחק אינטראקטיבי ללימוד Kubernetes - חמישה מצבי משחק עם טיימר, לבבות, ניקוד ורצפים: קרב מהיר, ניתוח מניפסט YAML, השלמת manifests ופקודות kubectl, התאמת מושגים וסידור workflow."
---

חמישה מצבי משחק שבודקים היבטים שונים של Kubernetes - לא עוד חידון רב-ברירה, אלא משחק עם **טיימר**, **שלושה לבבות**, **מכפיל רצף** ו**שיא אישי** שנשמר בדפדפן. בסוף כל סבב תקבלו דירוג, ורשימת חזרה של בדיוק מה שפספסתם.


<div class="tg" id="tg" dir="rtl">
  <div class="tg-screen is-active" data-screen="menu">
    <div class="tg-hero">
      <div class="tg-hero-badge">Kubernetes</div>
      <div class="tg-hero-title">אתגר Kubernetes</div>
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
      q: 'מהו Pod ב-Kubernetes?',
      o: ['יחידת הפריסה הקטנה ביותר - "עטיפה" שיכולה להכיל קונטיינר אחד או יותר, שחולקים רשת ואחסון', 'קונטיינר Docker בודד, זהה לחלוטין למונח container', 'שרת פיזי או וירטואלי שרץ עליו הקלאסטר', 'קובץ קונפיגורציה שמגדיר משתני סביבה'],
      a: 0,
      w: 'Pod אינו קונטיינר עצמו - הוא עוטף קונטיינר אחד או יותר שחולקים אותה כתובת IP, אותו namespace רשת ואפשר גם Volumes משותפים. ברוב המקרים יש קונטיינר יחיד בכל Pod, אך דפוס Sidecar נפוץ מאוד.'
    },
    {
      q: 'למה כמעט אף פעם לא יוצרים Pods ישירות בפרודקשן?',
      o: ['Pod "עצמאי" שקורס לא קם מחדש - אין אף controller שאחראי עליו', 'קוברנטיס אוסר טכנית יצירת Pod ללא Deployment', 'Pod בודד לא יכול לקבל כתובת IP', 'Pod בודד לא יכול להריץ יותר מקונטיינר אחד'],
      a: 0,
      w: 'Pod שנוצר ישירות (bare Pod) הוא "יתום" - אם הוא קורס או ה-Node נופל, אף אחד לא ידאג להקים אותו מחדש. לכן משתמשים ב-controller כמו Deployment שמנטר ומחזיק את מספר העותקים הרצוי.'
    },
    {
      q: 'מה התפקיד המרכזי של ReplicaSet?',
      o: ['לוודא שתמיד רץ מספר קבוע ומוגדר מראש של עותקי Pod תואמי Label Selector', 'לנתב תעבורת רשת בין Pods', 'לשמור סודות והגדרות עבור Pods', 'לתזמן Pods על Nodes ספציפיים'],
      a: 0,
      w: 'ReplicaSet משווה כל הזמן בין מספר ה-Pods התואמים ל-selector שלו לבין השדה <code>replicas</code> הרצוי - אם חסר Pod הוא יוצר חדש, ואם יש עודף הוא מוחק.'
    },
    {
      q: 'מה Deployment מוסיף מעבר למה ש-ReplicaSet כבר נותן?',
      o: ['ניהול עדכונים מדורגים (rolling update) ויכולת rollback להיסטוריית גרסאות', 'הקצאת כתובות IP קבועות ל-Pods', 'הצפנת תעבורה בין Pods', 'תזמון Pods לפי עומס CPU בזמן אמת'],
      a: 0,
      w: 'Deployment הוא שכבה מעל ReplicaSet: בכל עדכון הוא יוצר ReplicaSet חדש ומעביר תעבורה בהדרגה מהישן לחדש, ושומר את ה-ReplicaSets הקודמים כדי לאפשר <code>kubectl rollout undo</code>.'
    },
    {
      q: 'מה ההבדל בין livenessProbe ל-readinessProbe?',
      o: ['livenessProbe קובע אם להפעיל מחדש את הקונטיינר; readinessProbe קובע אם הוא מוכן לקבל תעבורה מ-Service', 'הן זהות לחלוטין ועושות את אותה בדיקה', 'readinessProbe מפעילה מחדש קונטיינרים, livenessProbe רק בודקת', 'livenessProbe רצה פעם אחת בלבד, readinessProbe רצה כל הזמן'],
      a: 0,
      w: 'כישלון ב-livenessProbe גורם ל-kubelet להרוג ולהפעיל מחדש את הקונטיינר. כישלון ב-readinessProbe רק מסיר את ה-Pod זמנית מרשימת ה-Endpoints של ה-Service, בלי להרוג אותו.'
    },
    {
      q: 'מה המטרה של startupProbe?',
      o: ['לתת לאפליקציות עם זמן עלייה ארוך זמן התארגנות, לפני שה-liveness/readiness probes מתחילים לפעול', 'להחליף לחלוטין את livenessProbe', 'לבדוק את מהירות הרשת של הקלאסטר', 'לוודא שה-image הורד בהצלחה מה-registry'],
      a: 0,
      w: 'כל עוד startupProbe לא הצליח, שאר ה-probes מושהים - כך אפליקציה איטית לעלות לא נהרגת בטעות על ידי livenessProbe עוד לפני שהספיקה לעלות במלואה.'
    },
    {
      q: 'מה ההבדל בין resources.requests לבין resources.limits?',
      o: ['requests הוא מה שמובטח ל-Pod לצורך שיבוץ; limits הוא התקרה המקסימלית שאסור לחצות', 'requests הוא התקרה המקסימלית; limits הוא המינימום המובטח', 'אין הבדל מעשי בין השניים', 'requests רלוונטי רק ל-CPU, limits רק ל-memory'],
      a: 0,
      w: 'ה-scheduler משתמש ב-requests כדי לבחור Node עם מספיק משאבים פנויים. limits הוא תקרה שנאכפת בזמן ריצה - חריגה מ-limit של memory גורמת ל-OOMKilled, וחריגה מ-limit של CPU גורמת ל-throttling.'
    },
    {
      q: 'מהו Service מסוג ClusterIP?',
      o: ['ברירת המחדל - מספק כתובת יציבה שנגישה רק מתוך הקלאסטר', 'Service שנגיש מהאינטרנט הציבורי ללא הגדרה נוספת', 'Service שממפה שם DNS חיצוני', 'סוג Service שקיים רק ב-namespace kube-system'],
      a: 0,
      w: 'ClusterIP הוא ברירת המחדל של כל Service - הוא מקבל כתובת IP וירטואלית פנימית, ומשמש בעיקר לתקשורת פנימית בין מיקרו-שירותים בתוך הקלאסטר.'
    },
    {
      q: 'איך Service מסוג NodePort חושף אפליקציה כלפי חוץ?',
      o: ['פותח פורט קבוע (בטווח 30000-32767 כברירת מחדל) על כל Node, ומנתב ממנו פנימה ל-Service', 'יוצר Load Balancer בענן אוטומטית', 'ממפה ישירות שם DNS חיצוני לתוך הקלאסטר', 'משנה את כתובת ה-IP הפנימית של ה-Pods לכתובת ציבורית'],
      a: 0,
      w: 'עם NodePort אפשר לגשת לאפליקציה דרך כתובת ה-IP של כל Node בקלאסטר ובפורט שנפתח - שימושי לפיתוח ובדיקות, אך פחות מתאים לפרודקשן בהשוואה ל-LoadBalancer או Ingress.'
    },
    {
      q: 'מה עושה Service מסוג LoadBalancer בסביבת ענן ציבורי?',
      o: ['מבקש מספק הענן ליצור Load Balancer חיצוני שמפנה תעבורה לתוך הקלאסטר', 'רק מוסיף label לענף Service קיים', 'עובד רק בסביבות on-premise', 'מחליף את הצורך ב-Ingress Controller לחלוטין בכל מקרה'],
      a: 0,
      w: 'כשיוצרים Service מסוג LoadBalancer בענן נתמך (AWS, GCP, Azure ועוד), ה-cloud controller manager מקצה בפועל Load Balancer חיצוני עם כתובת IP ציבורית, שמפנה תעבורה ל-NodePort הפנימי.'
    },
    {
      q: 'מה מייחד Headless Service (עם <code>clusterIP: None</code>)?',
      o: ['במקום כתובת IP וירטואלית יחידה עם load balancing, שאילתת DNS מחזירה ישירות את כתובות כל ה-Pods התואמים', 'הוא לא יכול להשתמש ב-Label Selector כלל', 'הוא זמין רק ל-Pods עם קונטיינר יחיד', 'הוא מבטל את הצורך ב-labels על ה-Pods'],
      a: 0,
      w: 'Headless Service שימושי בעיקר עם StatefulSet - כל Pod מקבל רשומת DNS ייחודית משלו, כך שאפליקציה (כמו מסד נתונים מבוזר) יכולה לפנות לעותק ספציפי ישירות ולא רק ל-"מישהו מהקבוצה".'
    },
    {
      q: 'מה שומר ConfigMap?',
      o: ['נתוני קונפיגורציה לא-רגישים כזוגות מפתח-ערך, שאפשר להזריק כמשתני סביבה או כקבצים', 'סיסמאות ומפתחות API מוצפנים', 'רשימת ה-Pods הרצים בקלאסטר', 'הגדרות RBAC של משתמשים'],
      a: 0,
      w: 'ConfigMap מפריד קונפיגורציה (כמו כתובת שרת, רמת לוגים, דגלי feature) מקוד האפליקציה ומה-image, כך שאפשר לשנות התנהגות בלי לבנות image חדש.'
    },
    {
      q: 'מה ההבדל העיקרי בין Secret ל-ConfigMap?',
      o: ['Secret מיועד לנתונים רגישים ונשמר מקודד ב-Base64, ולעיתים מוצפן ב-etcd; ConfigMap מיועד לנתונים גלויים', 'Secret ו-ConfigMap הם למעשה אותו אובייקט עם שם שונה', 'ConfigMap מוצפן, Secret נשמר כטקסט גלוי', 'Secret זמין רק ל-Pods עם הרשאות root'],
      a: 0,
      w: 'שני האובייקטים דומים במבנה, אבל Secret מיועד לסיסמאות, טוקנים ומפתחות - חשוב לזכור ש-Base64 הוא קידוד ולא הצפנה, ולכן כדאי גם להגביל גישה עם RBAC ולשקול הצפנה נוספת ב-etcd.'
    },
    {
      q: 'מה מבטא הזוג PersistentVolume (PV) ו-PersistentVolumeClaim (PVC)?',
      o: ['PV הוא משאב האחסון בפועל ברמת הקלאסטר; PVC היא בקשת אחסון של אפליקציה, שמתחברת ל-PV מתאים', 'PV ו-PVC הם שני שמות לאותו אובייקט', 'PVC היא זו שמגדירה את סוג הדיסק הפיזי בענן', 'PV נוצר תמיד רק בתוך Pod ספציפי'],
      a: 0,
      w: 'PV הוא "ההצעה" (משאב אחסון שהוקצה, לרוב על ידי מנהל מערכת או StorageClass), ו-PVC הוא "הבקשה" של אפליקציה לאחסון בגודל ו-accessMode מסוימים. קוברנטיס מתאים ביניהם (binding).'
    },
    {
      q: 'מה תפקיד StorageClass?',
      o: ['מגדיר איך ליצור PersistentVolume חדש אוטומטית (dynamic provisioning) בהתאם לבקשת PVC', 'מגדיר את מדיניות ה-RBAC לגישה לאחסון', 'קובע את מספר ה-replicas של Deployment', 'משמש רק לניהול Secrets'],
      a: 0,
      w: 'בלי StorageClass היה צריך ליצור PV ידנית מראש עבור כל בקשה. עם StorageClass, ברגע שנוצרת PVC, ה-provisioner יוצר PV חדש ומתאים באופן דינמי - זה המנגנון הנפוץ ברוב הקלאסטרים בענן.'
    },
    {
      q: 'מה ההבדל בין Role ל-ClusterRole ב-RBAC?',
      o: ['Role מוגבל ל-namespace יחיד; ClusterRole תקף לכל הקלאסטר (או למשאבים שאינם מוגבלי namespace, כמו Nodes)', 'Role ו-ClusterRole הם כינויים לאותו אובייקט', 'ClusterRole תמיד מעניק הרשאות root מלאות', 'Role חל על כל הקלאסטר, ClusterRole על namespace יחיד'],
      a: 0,
      w: 'שניהם מגדירים אילו verbs מותרים על אילו resources, אבל Role מוגדר בתוך namespace ספציפי, בעוד ClusterRole אינו מוגבל - הוא יכול לשמש גם משאבים שאין להם namespace כלל, כמו Nodes או PersistentVolumes.'
    },
    {
      q: 'מהו ServiceAccount ולמה משתמשים בו?',
      o: ['זהות שמשמשת תהליכים בתוך Pod כדי לאמת מול ה-API server, במקום זהות משתמש אנושי', 'חשבון אימייל שמקושר לקלאסטר', 'רשימת כל המשתמשים האנושיים שיש להם גישה לקלאסטר', 'אובייקט שמגדיר מכסות משאבים ל-namespace'],
      a: 0,
      w: 'לכל Pod יש ServiceAccount (ברירת המחדל אם לא מוגדר אחרת), וה-token שלו הוא מה שמאפשר לתהליך בתוך הקונטיינר לבצע קריאות ל-kube-apiserver - למשל כשאפליקציה צריכה לקרוא Pods אחרים או ConfigMaps.'
    },
    {
      q: 'מה תפקיד Ingress?',
      o: ['משמש כשכבת ניתוב HTTP/HTTPS (Layer 7) - נקודת כניסה יחידה שמנתבת לפי host/path לכמה Services שונים', 'מחליף לחלוטין את הצורך ב-Service', 'מספק הצפנת TLS אוטומטית בלי שום קונפיגורציה', 'מנהל את ה-DNS הפנימי של הקלאסטר'],
      a: 0,
      w: 'Ingress עצמו הוא רק "חוקי ניתוב" - הוא דורש Ingress Controller (כמו nginx-ingress או Traefik) שבפועל מיישם אותם. כך אפשר לחשוף כמה שירותים דרך IP ציבורי אחד, לפי host או path.'
    }
  ];

  /* ============================================================
     מצב 2 - ניתוח מניפסט: קטע YAML + מה קורה בפועל / מה השגיאה
     ============================================================ */
  var MANIFEST_ANALYSIS = [
    {
      code: 'apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: web\nspec:\n  replicas: 3\n  selector:\n    matchLabels:\n      app: web\n  template:\n    metadata:\n      labels:\n        app: webapp\n    spec:\n      containers:\n        - name: web\n          image: nginx:1.27',
      q: 'מריצים <code>kubectl apply -f</code> על המניפסט הזה. מה קורה?',
      o: ['הפעולה נכשלת בשגיאת validation - ה-selector (<code>app: web</code>) לא תואם ל-labels בתבנית (<code>app: webapp</code>)', 'ה-Deployment נוצר בהצלחה עם 3 Pods תקינים', 'נוצר Deployment תקין אך בלי אף Pod', 'קוברנטיס מתקן אוטומטית את ה-label בתבנית כדי שיתאים ל-selector'],
      a: 0,
      w: 'ב-Deployment (וב-ReplicaSet) שדה <code>spec.selector.matchLabels</code> חייב להיות תת-קבוצה של ה-labels שב-<code>template.metadata.labels</code> - אחרת ה-API server דוחה את הבקשה כבר בשלב ה-validation, לפני שנוצר אפילו Pod אחד.'
    },
    {
      code: 'resources:\n  requests:\n    cpu: "500m"\n    memory: "256Mi"\n  limits:\n    cpu: "250m"\n    memory: "128Mi"',
      q: 'מה קורה כשמנסים ליצור Pod עם הגדרת resources כזו?',
      o: ['היצירה נכשלת - <code>requests</code> חייב להיות קטן או שווה ל-<code>limits</code>, לא גדול ממנו', 'ה-Pod נוצר, אך רץ תמיד לפי מגבלת ה-requests ומתעלם מה-limits', 'קוברנטיס מגדיל אוטומטית את ה-limits כך שיתאימו ל-requests', 'אין בעיה - requests ו-limits בלתי תלויים זה בזה'],
      a: 0,
      w: 'ה-<code>requests</code> הוא הבטחה מינימלית שה-scheduler משתמש בה לשיבוץ, וה-<code>limits</code> הוא התקרה המקסימלית. requests גדול מ-limits הוא קונפיגורציה בלתי אפשרית מבחינה לוגית, ולכן Kubernetes דוחה אותה כבר ב-validation.'
    },
    {
      code: 'apiVersion: v1\nkind: Service\nmetadata:\n  name: api-svc\nspec:\n  selector:\n    app: api\n  ports:\n    - port: 80\n      targetPort: 8080\n# labels בפועל על ה-Pods:\n#   app: backend-api',
      q: 'ל-Pods בקלאסטר יש <code>app: backend-api</code>, אך ה-Service מחפש <code>app: api</code>. מה יקרה?',
      o: ['ה-Service ייווצר בהצלחה, אבל בלי Endpoints - כל בקשה אליו תיכשל בשגיאת חיבור', 'kubectl apply ייכשל כי אין Pods תואמים', 'ה-Service ימצא את ה-Pods אוטומטית לפי שם ה-Deployment', 'קוברנטיס יתקן את ה-label של ה-Pods כדי שיתאימו'],
      a: 0,
      w: 'Service נוצר תמיד בהצלחה בפני עצמו - החיבור בינו לבין Pods נעשה דינמית לפי התאמת labels, שמתעדכנת ברשימת Endpoints/EndpointSlices. אם אין Pod תואם, ה-Service פשוט "ריק" - זו טעות נפוצה מאוד לאבחון.'
    },
    {
      code: 'spec:\n  containers:\n    - name: app\n      image: myapp:1.0\n    - name: app\n      image: sidecar:1.0',
      q: 'לשני קונטיינרים באותו Pod יש אותו שם (<code>app</code>). מה קורה בהרצת <code>kubectl apply</code>?',
      o: ['הבקשה נדחית בשגיאת validation - שמות קונטיינרים בתוך אותו Pod חייבים להיות ייחודיים', 'הקונטיינר השני "דורס" בשקט את הראשון', 'שני הקונטיינרים רצים תחת אותו שם ומחליפים ביניהם תפקידים', 'קוברנטיס משנה אוטומטית את השם השני ל-app-2'],
      a: 0,
      w: 'שם הקונטיינר הוא המזהה שדרכו <code>kubectl logs</code>/<code>exec</code> פונים לקונטיינר ספציפי בתוך Pod - שני קונטיינרים באותו שם יוצרים דו-משמעות שה-API server לא מאפשר בכלל.'
    },
    {
      code: 'envFrom:\n  - configMapRef:\n      name: app-config\n      optional: false',
      q: 'ה-ConfigMap בשם <code>app-config</code> לא קיים ב-namespace. מה יקרה ל-Pod?',
      o: ['ה-Pod ייווצר אך יישאר תקוע במצב <code>CreateContainerConfigError</code> עד שה-ConfigMap ייווצר', 'ה-Pod ירוץ בלי משתני הסביבה, בלי שום שגיאה', 'ה-scheduler יסרב לשבץ את ה-Pod לשום Node', 'קוברנטיס יוצר אוטומטית ConfigMap ריק עם אותו שם'],
      a: 0,
      w: 'כש-<code>optional</code> הוא <code>false</code> (ברירת המחדל), קוברנטיס דורש שה-ConfigMap יהיה קיים לפני שהקונטיינר יכול להתחיל. אם הוא חסר, ה-Pod נשאר תקוע ב-<code>CreateContainerConfigError</code> - נראה מיד ב-<code>kubectl describe pod</code>.'
    },
    {
      code: 'apiVersion: v1\nkind: PersistentVolumeClaim\nmetadata:\n  name: data-pvc\nspec:\n  accessModes:\n    - ReadWriteOnce\n  storageClassName: fast-ssd\n  resources:\n    requests:\n      storage: 500Gi',
      q: 'בקלאסטר אין StorageClass בשם <code>fast-ssd</code> ואין PV קיים שמתאים. מה יקרה ל-PVC?',
      o: ['ה-PVC ייווצר אך יישאר במצב <code>Pending</code> לצמיתות, עד שיימצא/ייווצר StorageClass או PV תואם', 'kubectl apply ייכשל מיידית עם שגיאה', 'קוברנטיס ייצור StorageClass חדש אוטומטית', 'ה-PVC יתחבר לכל PV פנוי, בלי קשר ל-storageClassName'],
      a: 0,
      w: 'PVC הוא "בקשה" - הוא נשאר ב-<code>Pending</code> עד שנמצא (או נוצר דינמית) PersistentVolume שתואם ל-accessModes, ל-storageClassName ולגודל המבוקש. כל Pod שמנסה להשתמש ב-PVC כזה יישאר תקוע גם הוא.'
    },
    {
      code: 'strategy:\n  type: RollingUpdate\n  rollingUpdate:\n    maxUnavailable: 0\n    maxSurge: 0',
      q: 'מה קורה כשמנסים לעדכן Deployment עם אסטרטגיית עדכון כזו?',
      o: ['העדכון נתקע - קוברנטיס לא יכול להוריד Pod ישן (maxUnavailable=0) וגם לא להוסיף Pod חדש זמנית (maxSurge=0)', 'העדכון מתבצע מיידית על כל ה-Pods בו-זמנית', 'קוברנטיס מתעלם מהערכים ומשתמש בברירת המחדל', 'ה-Deployment נמחק ונוצר מחדש מאפס'],
      a: 0,
      w: 'שני הערכים לא יכולים להיות 0 בו-זמנית - צריך "מרווח תמרון" כלשהו כדי להחליף Pods: או לאפשר זמנית פחות Pods זמינים (maxUnavailable), או יותר Pods מהרצוי (maxSurge). אפס בשניהם חוסם כל התקדמות.'
    },
    {
      code: 'apiVersion: v1\nkind: Secret\nmetadata:\n  name: db-secret\ntype: Opaque\ndata:\n  password: "SuperSecret123"',
      q: 'מה יקרה כשמריצים <code>kubectl apply</code> על Secret עם ערך טקסט רגיל בשדה <code>data</code>?',
      o: ['הבקשה תיכשל בשגיאה - ערכים תחת <code>data</code> חייבים להיות מקודדים ב-Base64, לא טקסט חופשי', 'קוברנטיס מקודד את הערך אוטומטית ל-Base64', 'ה-Secret נוצר בהצלחה, אך הערך נשמר כטקסט גלוי', 'קוברנטיס מעביר את הערך אוטומטית לשדה stringData'],
      a: 0,
      w: 'שדה <code>data</code> ב-Secret מצפה למחרוזות מקודדות Base64 בלבד. כדי להזין ערך טקסט רגיל בלי לקודד ידנית, יש להשתמש בשדה <code>stringData</code> - קוברנטיס יקודד אותו אוטומטית בזמן השמירה.'
    },
    {
      code: 'apiVersion: networking.k8s.io/v1\nkind: NetworkPolicy\nmetadata:\n  name: default-deny\nspec:\n  podSelector: {}\n  policyTypes:\n    - Ingress',
      q: 'מה המשמעות של NetworkPolicy כזו על כלל ה-Pods ב-namespace?',
      o: ['כל תעבורת Ingress נכנסת לכל ה-Pods נחסמת כברירת מחדל, כי לא הוגדרו כללי ingress מתירים', 'ה-NetworkPolicy לא משפיעה על כלום כי podSelector ריק', 'רק תעבורה יוצאת (egress) נחסמת', 'החסימה חלה רק על Pods עם label מפורש בשם default-deny'],
      a: 0,
      w: '<code>podSelector: {}</code> תופס את כל ה-Pods ב-namespace. כשמוגדר <code>policyTypes: [Ingress]</code> בלי אף כלל ingress תחתיו, ברירת המחדל היא חסימה - דפוס סטנדרטי ליצירת "חסימת ברירת מחדל" ואז פתיחת חריגים ב-NetworkPolicy נוספות.'
    },
    {
      code: 'apiVersion: networking.k8s.io/v1\nkind: Ingress\nmetadata:\n  name: app-ing\nspec:\n  rules:\n    - host: app.example.com\n      http:\n        paths:\n          - path: /\n            pathType: Prefix\n            backend:\n              service:\n                name: app-svc\n                port:\n                  number: 80',
      q: 'בקלאסטר מותקנים כמה Ingress Controllers, ואף אחד לא מוגדר כברירת מחדל. מה עלול לקרות ל-Ingress הזה, שחסר בו <code>ingressClassName</code>?',
      o: ['שום Controller לא בהכרח "יאמץ" אותו, ולכן החוק לא ייאכף בפועל למרות שהאובייקט קיים', 'כל ה-Controllers יאמצו אותו במקביל', 'kubectl apply ייכשל מיידית', 'קוברנטיס בוחר אוטומטית controller רנדומלי'],
      a: 0,
      w: 'בלי <code>spec.ingressClassName</code> (ובלי IngressClass מסומן כ-default בקלאסטר), אין דרך חד-משמעית לדעת איזה Ingress Controller אמור לטפל בחוק - האובייקט קיים ב-etcd, אך שום Controller לא בהכרח יפעל לפיו.'
    },
    {
      code: 'env:\n  - name: LOG_LEVEL\n    valueFrom:\n      configMapKeyRef:\n        name: app-config\n        key: log_level',
      q: 'ה-ConfigMap <code>app-config</code> קיים, אבל אין בו מפתח בשם <code>log_level</code>. מה קורה ל-Pod?',
      o: ['הקונטיינר לא עולה - ה-Pod נתקע ב-<code>CreateContainerConfigError</code> עד שהמפתח יתווסף', 'משתנה הסביבה מקבל מחרוזת ריקה, וה-Pod רץ כרגיל', 'קוברנטיס מדלג על משתנה הסביבה בשקט', 'ה-Pod עולה אך הקונטיינר קורס לאחר 30 שניות'],
      a: 0,
      w: 'בדומה לחוסר ConfigMap שלם, גם מפתח חסר בתוך ConfigMap קיים (בלי <code>optional: true</code>) מונע מהקונטיינר להתחיל בכלל - קוברנטיס לא יכול לפתור את משתנה הסביבה, אז הוא לא מריץ את הקונטיינר.'
    },
    {
      code: 'spec:\n  containers:\n    - name: web\n      image: nginx\n      ports:\n        - containerPort: 80\n          hostPort: 8080',
      q: 'ל-Deployment הזה 3 replicas, וה-scheduler מנסה לשבץ שני Pods על אותו Node. מה קורה?',
      o: ['רק Pod אחד על כל Node יכול להשתמש בפועל ב-<code>hostPort: 8080</code> - Pod נוסף על אותו Node ייתקע ב-Pending בגלל התנגשות פורט', 'שני ה-Pods חולקים את הפורט בלי בעיה', 'קוברנטיס מקצה אוטומטית hostPort אחר לכל Pod', 'ה-Node נחסם מקבלת Pods נוספים לגמרי'],
      a: 0,
      w: '<code>hostPort</code> קושר פורט על ה-Node עצמו, שהוא משאב ייחודי - שני Pods על אותו Node לא יכולים להחזיק אותו פורט בו-זמנית. זו הסיבה ש-hostPort נחשב אנטי-פטרן ברוב המקרים, ובמקום זה משתמשים ב-Service.'
    }
  ];

  /* ============================================================
     מצב 3 - השלמת manifest/פקודה: YAML או kubectl עם חלק חסר
     ============================================================ */
  var CMD_COMPLETE = [
    {
      code: '$ kubectl ___ pods -n dev',
      q: 'מה משלים את הפקודה כדי להציג רשימת Pods ב-namespace dev?',
      o: ['<code>get</code>', '<code>list</code>', '<code>show</code>', '<code>describe</code>'],
      a: 0,
      w: '<code>kubectl get pods -n dev</code> מציגה רשימה תמציתית של Pods. לפרטים מלאים על Pod בודד (Events, תנאים, IP) משתמשים ב-<code>kubectl describe pod</code>.'
    },
    {
      code: '$ kubectl scale deployment web --___=5',
      q: 'מה משלים את הפקודה כדי לשנות את מספר ה-replicas ל-5?',
      o: ['<code>replicas</code>', '<code>count</code>', '<code>size</code>', '<code>pods</code>'],
      a: 0,
      w: '<code>kubectl scale deployment web --replicas=5</code> משנה מיידית את שדה ה-replicas ב-spec של ה-Deployment, וה-controller דואג ליישר את מספר ה-Pods בפועל.'
    },
    {
      code: '$ kubectl logs mypod -___',
      q: 'מה משלים את הפקודה כדי לצפות בלוגים בזמן אמת (כמו tail -f)?',
      o: ['<code>f</code> (<code>--follow</code>)', '<code>w</code>', '<code>tail</code>', '<code>stream</code>'],
      a: 0,
      w: '<code>kubectl logs -f</code> משאיר את הפקודה פתוחה ומזרימה שורות לוג חדשות ברגע שהן נכתבות - שימושי למעקב חי אחרי קונטיינר.'
    },
    {
      code: '$ kubectl exec -it mypod -- ___',
      q: 'מה משלים את הפקודה כדי לפתוח shell אינטראקטיבי בתוך הקונטיינר?',
      o: ['<code>/bin/sh</code> (או <code>/bin/bash</code>)', '<code>--shell</code>', '<code>ssh</code>', '<code>connect</code>'],
      a: 0,
      w: 'אחרי <code>--</code> מציינים את הפקודה שתרוץ בתוך הקונטיינר. <code>-it</code> (interactive + tty) הוא מה שהופך את זה לסשן טרמינל אינטראקטיבי, במקום הרצת פקודה חד-פעמית.'
    },
    {
      code: 'apiVersion: apps/v1\nkind: ___\nmetadata:\n  name: web\nspec:\n  replicas: 3',
      q: 'איזה kind משלים מניפסט שמנהל Pods עם rolling updates ורול-בק?',
      o: ['<code>Deployment</code>', '<code>Pod</code>', '<code>ReplicaSet</code>', '<code>Namespace</code>'],
      a: 0,
      w: '<code>Deployment</code> הוא שכבת ההפשטה שמנהלת ReplicaSets בשבילכם, ומספקת עדכונים מדורגים (rolling update) ואת <code>kubectl rollout undo</code> לביטול.'
    },
    {
      code: 'apiVersion: v1\nkind: Service\nmetadata:\n  name: web-svc\nspec:\n  type: ___\n  ports:\n    - port: 80\n      nodePort: 30080',
      q: 'איזה type משלים Service שנגיש גם מחוץ לקלאסטר, דרך IP של כל Node בפורט קבוע?',
      o: ['<code>NodePort</code>', '<code>ClusterIP</code>', '<code>ExternalName</code>', '<code>Internal</code>'],
      a: 0,
      w: '<code>NodePort</code> פותח פורט קבוע (בטווח 30000-32767 כברירת מחדל) על כל Node בקלאסטר, ומנתב ממנו פנימה ל-Service - שימושי לפיתוח ובדיקות, ופחות לפרודקשן.'
    },
    {
      code: 'apiVersion: v1\nkind: PersistentVolumeClaim\nmetadata:\n  name: data-pvc\nspec:\n  accessModes:\n    - ___\n  resources:\n    requests:\n      storage: 5Gi',
      q: 'איזה accessMode משלים בקשה לנפח שמצורף (mount) ל-Pod אחד בלבד, לקריאה וכתיבה?',
      o: ['<code>ReadWriteOnce</code>', '<code>ReadOnlyMany</code>', '<code>ReadWriteMany</code>', '<code>WriteOnce</code>'],
      a: 0,
      w: '<code>ReadWriteOnce</code> (RWO) הוא הנפוץ ביותר - מאפשר mount לקריאה/כתיבה מ-Node בודד בו-זמנית. <code>ReadWriteMany</code> (RWX) מאפשר גישה ממספר Nodes בו-זמנית, אך נתמך רק בסוגי אחסון מסוימים.'
    },
    {
      code: 'rules:\n  - apiGroups: [""]\n    resources: ["pods"]\n    verbs: ["get", "list", "___"]',
      q: 'איזה verb משלים הרשאה לקבל עדכונים בזמן אמת על שינויים ב-Pods (כמו <code>kubectl get -w</code>)?',
      o: ['<code>watch</code>', '<code>stream</code>', '<code>follow</code>', '<code>subscribe</code>'],
      a: 0,
      w: '<code>watch</code> הוא ה-verb שמאפשר לפתוח חיבור מתמשך שמקבל אירועי שינוי בזמן אמת - זה מה ש-<code>kubectl get pods -w</code> וגם controllers רבים משתמשים בו מאחורי הקלעים.'
    },
    {
      code: '$ kubectl rollout ___ deployment/web',
      q: 'מה משלים את הפקודה כדי לבטל את העדכון האחרון ולחזור לגרסה הקודמת?',
      o: ['<code>undo</code>', '<code>revert</code>', '<code>rollback</code>', '<code>cancel</code>'],
      a: 0,
      w: '<code>kubectl rollout undo deployment/web</code> מחזיר את ה-Deployment לגרסה הקודמת ששמורה בהיסטוריית ה-ReplicaSets. אפשר גם לציין <code>--to-revision=N</code> לחזרה לגרסה ספציפית.'
    },
    {
      code: '$ kubectl apply -f deployment.yaml --___=client',
      q: 'מה משלים את הפקודה כדי לבדוק שהמניפסט תקין, בלי ליצור בפועל שום דבר בקלאסטר?',
      o: ['<code>dry-run</code>', '<code>validate-only</code>', '<code>test</code>', '<code>check</code>'],
      a: 0,
      w: '<code>--dry-run=client</code> מריץ ולידציה מקומית בלבד, בלי לפנות ל-API server. <code>--dry-run=server</code> שולח את הבקשה בפועל ל-API server לבדיקה מלאה, אך בלי לשמור את השינוי.'
    },
    {
      code: 'apiVersion: networking.k8s.io/v1\nkind: Ingress\nmetadata:\n  name: app-ing\nspec:\n  rules:\n    - host: app.example.com\n      http:\n        paths:\n          - path: /\n            pathType: ___',
      q: 'איזה pathType משלים כלל שמתאים לכל נתיב שמתחיל בקידומת שהוגדרה (כמו /, /api, /api/users)?',
      o: ['<code>Prefix</code>', '<code>Exact</code>', '<code>ImplementationSpecific</code>', '<code>Wildcard</code>'],
      a: 0,
      w: '<code>Prefix</code> מתאים לכל נתיב שמתחיל בקידומת שהוגדרה (בדוגמה - כל נתיב). <code>Exact</code> דורש התאמה מדויקת ומלאה של הנתיב, בלי שום גמישות.'
    },
    {
      code: '$ kubectl config set-context --current --___=dev',
      q: 'מה משלים את הפקודה כדי לשנות את ה-namespace הדיפולטיבי בהקשר (context) הנוכחי ל-dev?',
      o: ['<code>namespace</code>', '<code>ns</code>', '<code>default-ns</code>', '<code>cluster</code>'],
      a: 0,
      w: 'אחרי הפעולה הזו, פקודות kubectl שלא מציינות <code>-n</code> במפורש יפעלו אוטומטית מול namespace dev - נוח מאוד כשעובדים הרבה בתוך namespace אחד.'
    },
    {
      code: 'containers:\n  - name: app\n    image: myapp:2.0\n    livenessProbe:\n      httpGet:\n        path: /healthz\n        port: 8080\n      ___Seconds: 15',
      q: 'איזו מילה משלימה שדה שקובע כמה שניות להמתין אחרי עליית הקונטיינר, לפני הבדיקה הראשונה?',
      o: ['<code>initialDelay</code>', '<code>startDelay</code>', '<code>warmup</code>', '<code>preCheck</code>'],
      a: 0,
      w: '<code>initialDelaySeconds</code> נותן לאפליקציה זמן התארגנות (טעינת קונפיגורציה, חיבור ל-DB) לפני שה-probe הראשון בודק אותה - הגדרה קצרה מדי גורמת ל-restart מיותר של קונטיינר שעדיין באתחול.'
    }
  ];

  /* ============================================================
     מצב 4 - התאמת מושגים: סבבים של זוגות משאב/מושג + תיאור
     ============================================================ */
  var MATCH_ROUNDS = [
    {
      title: 'אובייקטי ליבה',
      pairs: [
        { l: '<code>Pod</code>', r: 'יחידת הפריסה הקטנה ביותר - עטיפה לקונטיינר אחד או יותר שחולקים רשת ואחסון' },
        { l: '<code>ReplicaSet</code>', r: 'מוודא שתמיד רץ מספר קבוע של עותקי Pod תואמי label' },
        { l: '<code>Deployment</code>', r: 'מנהל ReplicaSets ומספק עדכונים מדורגים ורול-בק' },
        { l: '<code>Namespace</code>', r: 'תיחום לוגי שמפריד משאבים בתוך אותו קלאסטר' },
        { l: 'Label Selector', r: 'מנגנון שמקשר בין אובייקטים (למשל Service ל-Pods) לפי תגיות מפתח-ערך' }
      ]
    },
    {
      title: 'סוגי Services',
      pairs: [
        { l: '<code>ClusterIP</code>', r: 'ברירת המחדל - נגיש רק בתוך הקלאסטר' },
        { l: '<code>NodePort</code>', r: 'פותח פורט קבוע על כל Node ומנתב ממנו ל-Service' },
        { l: '<code>LoadBalancer</code>', r: 'מבקש Load Balancer חיצוני מספק הענן ומפנה אליו תעבורה' },
        { l: '<code>ExternalName</code>', r: 'ממפה את ה-Service לשם DNS חיצוני, בלי selector או Pods בכלל' },
        { l: 'Headless Service', r: 'מחזיר ישירות את כתובות ה-IP של כל Pod, בלי load balancing מרכזי' }
      ]
    },
    {
      title: 'אחסון והגדרות',
      pairs: [
        { l: '<code>ConfigMap</code>', r: 'שומר נתוני קונפיגורציה לא-רגישים כזוגות מפתח-ערך' },
        { l: '<code>Secret</code>', r: 'שומר מידע רגיש כמו סיסמאות וטוקנים, בקידוד Base64' },
        { l: '<code>PersistentVolume</code>', r: 'משאב אחסון פיזי/ענני ברמת הקלאסטר, בניהול מנהל המערכת' },
        { l: '<code>PersistentVolumeClaim</code>', r: 'בקשת אחסון של אפליקציה, שמתחברת ל-PersistentVolume מתאים' },
        { l: '<code>StorageClass</code>', r: 'מגדיר איך ליצור PersistentVolume חדש אוטומטית לפי בקשת PVC' }
      ]
    },
    {
      title: 'RBAC ואבטחה',
      pairs: [
        { l: '<code>Role</code>', r: 'מגדיר אילו פעולות מותרות על אילו משאבים, בתוך namespace יחיד' },
        { l: '<code>ClusterRole</code>', r: 'כמו Role, אך תקף לכל הקלאסטר ולא מוגבל ל-namespace אחד' },
        { l: '<code>RoleBinding</code>', r: 'מקשר Role (או ClusterRole) למשתמש/ServiceAccount בתוך namespace מסוים' },
        { l: '<code>ClusterRoleBinding</code>', r: 'מקשר ClusterRole למשתמש/ServiceAccount ברמת הקלאסטר כולו' },
        { l: '<code>ServiceAccount</code>', r: 'זהות שמשמשת תהליכים בתוך Pod לצורך אימות מול ה-API server' }
      ]
    },
    {
      title: 'בקרים נוספים (Controllers)',
      pairs: [
        { l: '<code>DaemonSet</code>', r: 'מוודא שעותק אחד של Pod רץ על כל Node (או תת-קבוצה) בקלאסטר' },
        { l: '<code>StatefulSet</code>', r: 'מנהל Pods עם זהות יציבה, אחסון ייעודי וסדר הפעלה - מתאים למסדי נתונים' },
        { l: '<code>Job</code>', r: 'מריץ Pod עד להשלמה מוצלחת של משימה חד-פעמית, ולא באופן רציף' },
        { l: '<code>CronJob</code>', r: 'מריץ Job לפי לוח זמנים חוזר, בתחביר דמוי cron' },
        { l: '<code>HorizontalPodAutoscaler</code>', r: 'משנה אוטומטית את מספר ה-replicas לפי מדדים כמו CPU או Memory' }
      ]
    }
  ];

  /* ============================================================
     מצב 5 - סידור Workflow: סבבים של שלבים שצריך לסדר בסדר הנכון
     ============================================================ */
  var ORDER_ROUNDS = [
    {
      title: 'פריסת אפליקציה מלאה - מ-Deployment ועד Ingress',
      steps: [
        'כתיבת קובץ Deployment עם image, מספר replicas ו-labels לאפליקציה',
        'הרצת kubectl apply -f deployment.yaml ליצירת ה-Pods בפועל',
        'יצירת Service מסוג ClusterIP עם selector שמתאים ל-labels של ה-Pods',
        'יצירת Ingress שמגדיר host ו-path ומפנה אותם אל ה-Service',
        'הגדרת DNS (או קובץ hosts) כך שהדומיין יפנה לכתובת ה-Ingress Controller',
        'בדיקה בדפדפן או עם curl שהתעבורה אכן מגיעה עד ה-Pods'
      ]
    },
    {
      title: 'עדכון Deployment בשיטת Rolling Update',
      steps: [
        'עדכון שדה ה-image בקובץ ה-Deployment לגרסה החדשה',
        'הרצת kubectl apply -f deployment.yaml (או kubectl set image) להחלת השינוי',
        'קוברנטיס יוצר ReplicaSet חדש ומעלה בו Pod אחד עם הגרסה החדשה',
        'בדיקת readinessProbe על ה-Pod החדש לפני שהוא מתחיל לקבל תעבורה אמיתית',
        'הורדה הדרגתית של Pod ישן אחד, תוך שמירה על מגבלת maxUnavailable',
        'סיום התהליך כשה-ReplicaSet הישן מגיע ל-0 replicas וכולם רצים בגרסה החדשה'
      ]
    },
    {
      title: 'אבחון Pod שנתקע ב-CrashLoopBackOff',
      steps: [
        'הרצת kubectl get pods לזיהוי ה-Pod שנמצא במצב לא תקין',
        'הרצת kubectl describe pod לבדיקת Events, Exit Code וסיבת הקריסה',
        'הרצת kubectl logs עם --previous לצפייה בלוג מהריצה שקרסה',
        'זיהוי הבעיה בקוד או בקונפיגורציה, ותיקון המניפסט בהתאם',
        'הרצת kubectl apply מחדש עם התיקון',
        'מעקב עם kubectl get pods -w עד שה-Pod מגיע למצב Running יציב'
      ]
    },
    {
      title: 'חיבור Pod לאחסון קבוע דרך PVC',
      steps: [
        'הגדרה או שימוש ב-StorageClass קיים שמתאר את סוג האחסון הרצוי',
        'יצירת PersistentVolumeClaim עם accessMode וגודל אחסון מבוקש',
        'הקלאסטר יוצר (dynamic provisioning) PersistentVolume תואם ומקשר אותו ל-PVC',
        'הוספת ה-PVC כ-volume בתוך spec של ה-Pod או ה-Deployment',
        'הרצת ה-Pod - הקונטיינר מצרף (mount) את הנפח לנתיב שהוגדר בתוכו'
      ]
    },
    {
      title: 'הענקת הרשאות RBAC לאפליקציה',
      steps: [
        'יצירת ServiceAccount ייעודי לאפליקציה, במקום שימוש ב-default',
        'כתיבת Role שמגדיר אילו verbs מותרים על אילו resources בתוך ה-namespace',
        'יצירת RoleBinding שמקשר את ה-Role ל-ServiceAccount שנוצר',
        'הגדרת serviceAccountName בתוך spec של ה-Pod או ה-Deployment',
        'בדיקה עם kubectl auth can-i שההרשאות אכן פעילות בפועל'
      ]
    }
  ];

  /* ============================================================
     הגדרת מצבי המשחק
     ============================================================ */
  var MODES = [
    { key: 'rapid', icon: '⚡', name: 'קרב מהיר', desc: 'שאלות ידע כלליות על Kubernetes - כמה תספיקו לפני שהזמן נגמר?', type: 'quiz', data: RAPID, sample: 10, time: 20000 },
    { key: 'manifest', icon: '🔍', name: 'ניתוח מניפסט', desc: 'קטע YAML אמיתי - מה קורה בפועל כשמפעילים אותו, ואיפה הבאג?', type: 'quiz', data: MANIFEST_ANALYSIS, sample: 8, time: 28000, showCode: true },
    { key: 'cmd', icon: '🧩', name: 'השלמת manifest ופקודות', desc: 'YAML או פקודת kubectl עם חלק חסר - בחרו מה משלים אותה נכון', type: 'quiz', data: CMD_COMPLETE, sample: 8, time: 28000, showCode: true },
    { key: 'match', icon: '🔗', name: 'התאמת מושגים', desc: 'התאימו כל משאב/מושג Kubernetes לתיאור הנכון שלו', type: 'match', data: MATCH_ROUNDS, sample: 3 },
    { key: 'order', icon: '📋', name: 'סידור Workflow', desc: 'סדרו את שלבי התהליך לפי הסדר הנכון', type: 'order', data: ORDER_ROUNDS, sample: 3 }
  ];

  window.TG_CONFIG = { gameId: "k8s", modes: MODES };
})();
</script>

<script src="/scripts/topic-game.js"></script>
