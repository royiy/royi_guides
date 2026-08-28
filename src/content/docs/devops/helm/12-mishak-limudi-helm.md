---
title: "משחק לימודי: אתגר Helm"
category: DevOps/Helm
part: 12/10
description: "משחק אינטראקטיבי ללימוד Helm - חמישה מצבי משחק עם טיימר, לבבות, ניקוד ורצפים: קרב מהיר, ניחוש רינדור, השלמת פקודה, התאמת מושגים וסידור תהליכים."
---

חמישה מצבי משחק שבודקים היבטים שונים של Helm - מבנה Chart, templates ו-values.yaml, repositories, hooks, dependencies וניהול releases - לא עוד חידון רב-ברירה, אלא משחק עם **טיימר**, **שלושה לבבות**, **מכפיל רצף** ו**שיא אישי** שנשמר בדפדפן. בסוף כל סבב תקבלו דירוג, ורשימת חזרה של בדיוק מה שפספסתם.


<div class="tg" id="tg" dir="rtl">
  <div class="tg-screen is-active" data-screen="menu">
    <div class="tg-hero">
      <div class="tg-hero-badge">Helm</div>
      <div class="tg-hero-title">אתגר Helm</div>
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
      q: 'מהו Chart ב-Helm?',
      o: ['חבילה של templates וקובץ הגדרות שמתארת אפליקציית Kubernetes - היחידה הבסיסית ב-Helm', 'שם ה-namespace שאליו מתקינים אפליקציה', 'קובץ לוג של helm install', 'שרת ה-API הפנימי של Kubernetes'],
      a: 0,
      w: 'Chart הוא היחידה הבסיסית ב-Helm - חבילה שמכילה templates, values.yaml ומטא-דאטה, בדומה ל-package ב-npm או .deb ב-Ubuntu.'
    },
    {
      q: 'מהו Release ב-Helm?',
      o: ['מופע (instance) מותקן בפועל של Chart בקלאסטר - אפשר להתקין אותו Chart כמה פעמים עם שמות שונים', 'שם קובץ ה-YAML הראשי של ה-Chart', 'גרסת ה-CLI של Helm המותקנת', 'תיקיית ה-templates בתוך ה-Chart'],
      a: 0,
      w: 'Release הוא ה"מופע החי" של Chart שהותקן בקלאסטר. את אותו Chart אפשר להתקין כמה פעמים תחת שמות release שונים, למשל בכמה namespaces.'
    },
    {
      q: 'מהו Repository ב-Helm?',
      o: ['שרת (HTTP או OCI) שמארח index.yaml וקבצי .tgz ארוזים של Charts שניתן להוריד ולהתקין', 'ה-namespace שבו רצה האפליקציה', 'קובץ שמתעד את היסטוריית ה-revisions', 'שם חלופי לענף ב-Git'],
      a: 0,
      w: 'Repository הוא מיקום שממנו אפשר להוריד Charts ציבוריים או פרטיים - שרת HTTP סטטי, OCI registry, או שירותים ייעודיים כמו ChartMuseum ו-Harbor.'
    },
    {
      q: 'מה השינוי המרכזי בין Helm 2 ל-Helm 3?',
      o: ['הסרת Tiller - רכיב שרת שרץ בתוך הקלאסטר עם הרשאות רחבות; Helm 3 הוא CLI בלבד שפועל עם הרשאות המשתמש', 'מעבר משפת Go לשפת Python', 'ביטול האפשרות להתקין Charts מ-repository מרוחק', 'חובת תשלום עבור שימוש ב-CLI'],
      a: 0,
      w: 'Tiller ב-Helm 2 קיבל לעיתים הרשאות cluster-admin רחבות - בעיית אבטחה משמעותית. Helm 3 הסיר אותו לחלוטין ופועל ישירות מול Kubernetes API עם RBAC רגיל.'
    },
    {
      q: 'מה ההבדל בין version ל-appVersion בקובץ Chart.yaml?',
      o: ['version הוא גרסת ה-Chart עצמו (מבנה/templates), appVersion היא גרסת האפליקציה שהוא פורס', 'הם שני שמות לאותו שדה', 'version מיועד ל-CLI ו-appVersion למסד הנתונים בלבד', 'appVersion חובה ו-version אופציונלי'],
      a: 0,
      w: 'version מתעדכן כשמשנים את ה-Chart עצמו לפי SemVer, בעוד appVersion מציין את גרסת התוכנה בפועל שהוא פורס (למשל גרסת nginx) - הם עצמאיים זה מזה לגמרי.'
    },
    {
      q: 'מה תפקידו של values.yaml?',
      o: ['להחזיק את ערכי ברירת המחדל הניתנים להתאמה אישית עבור ה-templates של ה-Chart', 'לתעד את היסטוריית ה-revisions של release', 'להגדיר את סוג ה-repository', 'לשמור לוגים של helm install'],
      a: 0,
      w: 'values.yaml הוא קובץ הפרמטרים - הוא מזין את התבניות בתיקיית templates/ עם ערכים כמו מספר replicas או image tag, וניתן לדרוס אותו עם -f או --set.'
    },
    {
      q: 'מה נמצא בתיקיית templates/ בתוך Chart?',
      o: ['קבצי YAML עם תחביר templating (Go templates) שמייצרים את מניפסטי Kubernetes הסופיים', 'קבצי תיעוד בלבד', 'קבצי הגדרות CI/CD', 'תיקיית ה-repository המרוחק'],
      a: 0,
      w: 'templates/ מכילה את קבצי ה-YAML עם {{ }} שהמנוע של Helm מרנדר, לפי הערכים מ-values.yaml, למניפסטים אמיתיים שנשלחים ל-Kubernetes API.'
    },
    {
      q: 'מה עושה הפקודה <code>helm create my-app</code>?',
      o: ['יוצרת שלד (scaffold) בסיסי של Chart חדש עם Chart.yaml, values.yaml ותבניות לדוגמה', 'מתקינה release חדש בשם my-app', 'מורידה Chart קיים מ-repository', 'בונה image של Docker'],
      a: 0,
      w: '<code>helm create</code> היא הדרך הקלה ביותר להתחיל Chart חדש - היא יוצרת מבנה תיקיות מלא עם דוגמאות ל-deployment, service, ingress ועוד.'
    },
    {
      q: 'מה עושה הפקודה <code>helm lint ./my-app</code>?',
      o: ['בודקת שגיאות תחביר ובעיות נפוצות ב-Chart, מומלץ להריץ לפני כל commit', 'מתקינה את ה-Chart בקלאסטר', 'מוחקת release קיים', 'מציגה את היסטוריית ה-revisions'],
      a: 0,
      w: '<code>helm lint</code> בודקת תקינות מבנה ה-Chart (YAML תקין, שדות חובה וכו׳) בלי לגעת בקלאסטר בכלל - שכבת בטיחות בסיסית לפני commit או pipeline.'
    },
    {
      q: 'מה מטרתם של Hooks ב-Helm?',
      o: ['להריץ משאבי Kubernetes (בדרך כלל Job) בנקודת זמן מוגדרת במחזור חיי ה-release, כמו לפני/אחרי install או upgrade', 'להחליף את values.yaml', 'להגדיר repositories חדשים', 'לנהל הרשאות RBAC'],
      a: 0,
      w: 'Hooks שימושיים למשל להרצת migrations לפני upgrade, גיבוי לפני מחיקה, או smoke tests אחרי install - כל אלו אינם חלק מה-release ה"רגיל".'
    },
    {
      q: 'מתי מופעל hook מסוג pre-install?',
      o: ['לפני יצירת המשאבים בקלאסטר, אחרי שה-templates כבר רונדרו', 'אחרי שכל המשאבים כבר הותקנו', 'רק כשמריצים helm test', 'רק בזמן helm uninstall'],
      a: 0,
      w: 'pre-install רץ אחרי שהתבניות רונדרו אך לפני שהמשאבים ה"רגילים" נוצרים בפועל בקלאסטר - שלב טוב להכנות מוקדמות כמו migrations.'
    },
    {
      q: 'איך מגדירים תלות (dependency) של Chart אחר?',
      o: ['בבלוק dependencies בתוך Chart.yaml עם name, version ו-repository (ואופציונלית condition/alias/tags)', 'בקובץ נפרד בשם dependencies.json', 'ע"י יצירת symlink בתיקיית templates/', 'אי אפשר להגדיר תלויות ב-Helm 3'],
      a: 0,
      w: 'ב-Helm 3 dependencies מוגדרות ישירות בתוך Chart.yaml (בעבר requirements.yaml נפרד ב-Helm 2), עם שדות כמו version, repository, condition ו-alias.'
    },
    {
      q: 'מה עושה <code>helm dependency update ./my-app</code>?',
      o: ['מוריד את התלויות המוגדרות ל-charts/ כקבצי .tgz, ויוצר או מעדכן את Chart.lock', 'משדרג release קיים', 'מוחק תלויות ישנות מהקלאסטר', 'מריץ helm lint על כל התלויות'],
      a: 0,
      w: 'הפקודה מורידה בפועל את קבצי ה-.tgz של כל תלות לתיקיית charts/, ויוצרת Chart.lock שנועל את הגרסאות המדויקות - דומה ל-package-lock.json.'
    },
    {
      q: 'מהו Library Chart?',
      o: ['Chart מסוג type: library שאין לו templates שיוצרים משאבים בעצמו - הוא רק אוסף helpers לשימוש חוזר על ידי charts אחרים', 'Chart שמכיל רק תיעוד ולא קוד כלל', 'Chart שאסור להתקין יותר מפעם אחת', 'Chart שרץ רק בסביבת פיתוח'],
      a: 0,
      w: 'Library Chart (type: library ב-Chart.yaml) לא יוצר release עצמאי - הוא משמש כתלות של charts אחרים שמשתמשים בפונקציות שלו דרך include.'
    },
    {
      q: 'מהו סדר העדיפויות (מהנמוך לגבוה) בין מקורות ערכים שונים ב-Helm?',
      o: ['values.yaml בתוך ה-Chart, values של subchart, קבצי -f (האחרון מנצח), ואז --set עם העדיפות הגבוהה ביותר', '--set הוא תמיד המקור עם העדיפות הנמוכה ביותר', 'values.yaml תמיד מנצח את כל השאר', 'אין סדר עדיפויות - Helm מסרב להתקין אם יש יותר ממקור אחד'],
      a: 0,
      w: '--set הוא בעל העדיפות הגבוהה ביותר מבין מקורות ה-values, ולכן שימושי ל-overrides נקודתיים; values.yaml שבתוך ה-Chart הוא ברירת המחדל הבסיסית ביותר.'
    },
    {
      q: 'מה קורה בפועל כשמריצים <code>helm rollback my-release 2</code>?',
      o: ['נוצר revision חדש בהיסטוריה שמכיל את התוכן של revision 2 - ה-revisions שביניהם לא נמחקים', 'ה-revisions 3 ומעלה נמחקים לצמיתות מההיסטוריה', 'ה-release חוזר בדיוק ל-revision 2 בלי ליצור רשומה חדשה בהיסטוריה', 'הפקודה נכשלת אם revision 2 היה upgrade שנכשל'],
      a: 0,
      w: 'rollback לא מוחק היסטוריה - הוא יוצר revision חדש (למשל revision 4) שמכיל את תוכן revision 2, כך שההיסטוריה המלאה נשארת שקופה ומתועדת.'
    },
    {
      q: 'מהו OCI Registry בהקשר של Helm?',
      o: ['תקן חדש (מאז Helm 3.8) לאחסון Charts באותו רישום כמו images של Docker, למשל עם helm push ו-oci://', 'שרת ייעודי שרץ רק בתוך הקלאסטר', 'שם נרדף ל-Artifact Hub', 'פורמט קובץ חלופי ל-values.yaml'],
      a: 0,
      w: 'OCI מאפשר לאחסן Charts באותה תשתית כמו container images - מאחד ניהול, מאפשר RBAC וסריקות אבטחה של אותו רישום, ונחשב היום הדרך המומלצת.'
    },
    {
      q: 'מהי מטרת המפתח global ב-values.yaml?',
      o: ['להעביר ערכים משותפים מלמעלה למטה - גם ל-Chart הראשי וגם לכל ה-subcharts שלו', 'להגדיר משתני סביבה של מערכת ההפעלה', 'להחליף את Chart.yaml', 'לקבוע את שם ה-namespace באופן קבוע'],
      a: 0,
      w: 'global מוגדר פעם אחת ב-values.yaml של ה-Chart הראשי ומועבר אוטומטית לכל ה-subcharts - שימושי לערכים כמו imageRegistry או storageClass המשותפים לכולם.'
    }
  ];

  /* ============================================================
     מצב 2 - ניחוש רינדור: קטע template/values.yaml + מה יהיה הפלט או ההתנהגות
     ============================================================ */
  var RENDER_GUESS = [
    {
      code: 'values.yaml (קטע):\nreplicaCount: 3\n\ntemplates/deployment.yaml (קטע):\nspec:\n  replicas: {{ .Values.replicaCount }}',
      q: 'מה יהיה הערך של replicas במניפסט שיירונדר בפועל?',
      o: ['<code>3</code>', '<code>{{ .Values.replicaCount }}</code> כמחרוזת גולמית', '<code>1</code> (ברירת מחדל של Kubernetes)', 'שגיאת רינדור כי אין ערך'],
      a: 0,
      w: 'מנוע ה-templates מחליף את <code>{{ .Values.replicaCount }}</code> בערך שנקרא בפועל מ-values.yaml - כאן <code>3</code>.'
    },
    {
      code: 'values.yaml:\nimage:\n  repository: nginx\n  tag: ""\n\ntemplates/deployment.yaml:\nimage: "{{ .Values.image.repository }}:{{ .Values.image.tag | default "latest" }}"',
      q: 'tag הוא מחרוזת ריקה ב-values.yaml. מה יהיה ה-image הסופי במניפסט?',
      o: ['<code>nginx:latest</code>', '<code>nginx:</code> עם נקודתיים וריק', 'שגיאת רינדור', '<code>nginx:null</code>'],
      a: 0,
      w: 'הפונקציה <code>default</code> מפעילה את ערך ברירת המחדל בכל מקרה שהערך "ריק" (falsy) - כולל מחרוזת ריקה - ולכן <code>latest</code> נכנס במקום.'
    },
    {
      code: 'templates/ingress.yaml:\n{{- if .Values.ingress.enabled }}\nkind: Ingress\n{{- else }}\n# ingress disabled\n{{- end }}\n\nvalues.yaml:\ningress:\n  enabled: false',
      q: 'לפי הערכים הנתונים, האם משאב Ingress ייכלל במניפסטים המרונדרים?',
      o: ['לא - יתבצע ענף ה-else ולא ייווצר משאב Ingress כלל', 'כן, תמיד נוצר Ingress ללא תלות בערך', 'כן, אבל עם שדות ריקים', 'הרינדור ייכשל כי enabled=false אסור'],
      a: 0,
      w: 'התנאי <code>{{- if .Values.ingress.enabled }}</code> בודק את הערך הבוליאני; מכיוון שהוא false, מתבצע ה-else - כלומר שום Ingress לא נוצר.'
    },
    {
      code: '_helpers.tpl:\n{{- define "app.fullname" -}}\n{{ .Release.Name }}-{{ .Chart.Name }}\n{{- end -}}\n\ndeployment.yaml:\nmetadata:\n  name: {{ include "app.fullname" . }}',
      q: 'אם Release.Name הוא "demo" ו-Chart.Name הוא "web", מה יהיה metadata.name?',
      o: ['<code>demo-web</code>', '<code>web-demo</code>', '<code>app.fullname</code>', 'שגיאה כי include לא מוגדר'],
      a: 0,
      w: '<code>include</code> קורא לפונקציה בשם "app.fullname" שהוגדרה ב-_helpers.tpl ומחזירה <code>{{ .Release.Name }}-{{ .Chart.Name }}</code> - כאן <code>demo-web</code>.'
    },
    {
      code: 'values.yaml:\nextraEnvVars:\n  - name: LOG_LEVEL\n    value: debug\n\ntemplates:\nenv:\n{{- range .Values.extraEnvVars }}\n  - name: {{ .name }}\n    value: {{ .value | quote }}\n{{- end }}',
      q: 'מה יהיה הפלט המרונדר עבור בלוק ה-env?',
      o: ['<code>env:</code> עם איבר יחיד <code>name: LOG_LEVEL</code> ו-<code>value: "debug"</code> מוקף במרכאות', 'לולאה ריקה, כי range לא תומך ברשימות', 'שגיאת syntax', '<code>env: LOG_LEVEL=debug</code> בשורה אחת'],
      a: 0,
      w: '<code>range</code> עובר על כל איבר ברשימה extraEnvVars, ובכל איטרציה .name ו-.value מתייחסים לאיבר הנוכחי; <code>quote</code> מוסיף מרכאות סביב הערך.'
    },
    {
      code: 'templates/deployment.yaml:\nresources:\n  {{- toYaml .Values.resources | nindent 12 }}\n\nvalues.yaml:\nresources:\n  limits:\n    cpu: 200m\n    memory: 256Mi',
      q: 'מה עושה השילוב toYaml + nindent 12 כאן?',
      o: ['ממיר את כל בלוק resources ל-YAML טקסטואלי ומזיח אותו ב-12 רווחים, בלי לפרק כל שדה בנפרד', 'מוחק את בלוק resources אם הוא ריק', 'ממיר את resources למחרוזת JSON', 'מגביל את ה-CPU ל-12 יחידות'],
      a: 0,
      w: 'זו הדרך הסטנדרטית להעביר בלוקים שלמים (resources, affinity, tolerations) בלי לכתוב כל שדה ידנית - toYaml הופך את המבנה לטקסט YAML, ו-nindent מוסיף ירידת שורה והזחה עקבית.'
    },
    {
      code: 'templates/secret.yaml:\ndata:\n  password: {{ .Values.dbPassword | b64enc }}',
      q: 'מה עושה הפונקציה b64enc על הערך של dbPassword?',
      o: ['מקודדת את המחרוזת ל-Base64, כנדרש בשדות data של Secret ב-Kubernetes', 'מצפינה את הסיסמה בהצפנה חד-כיוונית', 'מוחקת רווחים מהמחרוזת', 'הופכת את הטקסט לאותיות גדולות'],
      a: 0,
      w: 'שדות data ב-Secret של Kubernetes דורשים ערכים מקודדי Base64 (לא מוצפנים!) - b64enc היא פונקציית Sprig שמבצעת בדיוק את זה.'
    },
    {
      code: 'templates/config.yaml:\nimage: {{ required "יש לספק image.tag" .Values.image.tag }}\n\nvalues.yaml:\nimage:\n  tag: ""',
      q: 'image.tag הוא מחרוזת ריקה. מה יקרה כשמריצים helm install?',
      o: ['ההתקנה תיכשל עם שגיאה שמציגה את ההודעה "יש לספק image.tag"', 'ה-image ירונדר כמחרוזת ריקה בלי שגיאה', 'Helm ישתמש אוטומטית ב-appVersion במקום', 'ההתקנה תצליח אבל ה-Pod יהיה ב-CrashLoopBackOff'],
      a: 0,
      w: 'הפונקציה required עוצרת את הרינדור עם שגיאה ברורה אם הערך שהועבר אליה ריק או לא קיים - שימושי לכפות שדות חובה בלי לתת ל-Chart להתקין במצב שגוי.'
    },
    {
      code: 'Chart.yaml:\ndependencies:\n  - name: postgresql\n    condition: postgresql.enabled\n\nvalues.yaml:\npostgresql:\n  enabled: false',
      q: 'לפי הערכים האלה, האם ה-subchart postgresql יותקן כחלק מה-release?',
      o: ['לא - condition שמצביע על ערך false מבטל את פריסת ה-subchart', 'כן, condition לא משפיע על subcharts שכבר הורדו', 'כן, אבל בלי ה-templates שלו', 'שגיאה כי condition חייב להיות true'],
      a: 0,
      w: 'שדה condition ב-dependencies מצביע על ערך בוליאני ב-values.yaml; כאשר הוא false, Helm מדלג לחלוטין על ה-templates של אותו subchart.'
    },
    {
      code: 'Chart.yaml:\ndependencies:\n  - name: redis\n    alias: cache\n\nvalues.yaml (של ה-chart הראשי):\ncache:\n  enabled: true\n  architecture: standalone',
      q: 'הוגדר alias בשם "cache" עבור התלות redis. איזה מפתח ב-values.yaml מזין את ה-subchart?',
      o: ['<code>cache</code> - alias דורס את השם המקורי redis לצורך ה-values', '<code>redis</code> - alias משפיע רק על שם ה-release, לא על values', 'שני המפתחות עובדים במקביל', 'אף אחד - alias חוסם קריאת values מההורה'],
      a: 0,
      w: 'כש-alias מוגדר, השם החלופי הוא זה שמשמש כמפתח עליון ב-values.yaml של ההורה להעברת ערכים ל-subchart - כאן cache ולא redis.'
    },
    {
      code: 'templates/job-a.yaml:\nannotations:\n  "helm.sh/hook": pre-install\n  "helm.sh/hook-weight": "-10"\n\ntemplates/job-b.yaml:\nannotations:\n  "helm.sh/hook": pre-install\n  "helm.sh/hook-weight": "0"',
      q: 'לשני ה-Jobs יש hook מסוג pre-install עם weight שונה. באיזה סדר הם ירוצו?',
      o: ['job-a עם weight -10 ירוץ ראשון, ואז job-b עם weight 0', 'job-b ירוץ תמיד ראשון כי weight 0 גבוה מ--10', 'שניהם רצים בו-זמנית תמיד', 'הסדר אקראי בכל הרצה'],
      a: 0,
      w: 'hook-weight קובע סדר הרצה בין hooks באותו שלב - ערכים נמוכים יותר, כולל שליליים, רצים קודם, ולכן -10 מקדים את 0.'
    },
    {
      code: '$ helm install my-release ./chart -f values.yaml -f values-prod.yaml --set image.tag=2.0.1\n\n# בכל שלושת המקורות מוגדר image.tag בערך שונה',
      q: 'איזה ערך של image.tag ינצח בפועל?',
      o: ['<code>2.0.1</code> - הערך שהגיע מ---set, בעל העדיפות הגבוהה ביותר', 'הערך מ-values.yaml הבסיסי, כי הוא הראשון שנטען', 'הערך מ-values-prod.yaml, כי -f תמיד מנצח --set', 'Helm יסרב להתקין בגלל התנגשות ערכים'],
      a: 0,
      w: '--set הוא תמיד בעל העדיפות הגבוהה ביותר מבין כל מקורות ה-values, ולכן image.tag=2.0.1 ידרוס כל מה שהוגדר בקבצי -f.'
    },
    {
      code: 'values.yaml:\nglobal:\n  storageClass: fast-ssd\n\npostgresql:\n  enabled: true\n\n# בתוך template של subchart postgresql:\nstorageClassName: {{ .Values.global.storageClass }}',
      q: 'האם ה-subchart postgresql יכול לגשת ל-.Values.global.storageClass שהוגדר ב-values.yaml של ה-Chart הראשי?',
      o: ['כן - global מועבר אוטומטית מלמעלה למטה לכל ה-subcharts', 'לא - כל subchart רואה רק את ה-values.yaml הפרטי שלו', 'רק אם מוסיפים --set ידני בזמן ההתקנה', 'רק ב-Helm 2, לא ב-Helm 3'],
      a: 0,
      w: 'המפתח global מיוחד ומועבר אוטומטית מה-Chart הראשי לכל ה-subcharts שלו (כיוון אחד: מלמעלה למטה) - כך אפשר לשתף ערכים כמו storageClass בלי לשכפל אותם בכל subchart.'
    }
  ];

  /* ============================================================
     מצב 3 - השלמת פקודה/template: פקודת helm CLI או תג template עם חלק חסר
     ============================================================ */
  var CMD_COMPLETE = [
    {
      code: '$ helm ___ my-app',
      q: 'מה משלים את הפקודה כדי ליצור שלד (scaffold) בסיסי של Chart חדש בשם my-app?',
      o: ['<code>create</code>', '<code>init</code>', '<code>new</code>', '<code>scaffold</code>'],
      a: 0,
      w: '<code>helm create my-app</code> יוצרת תיקייה עם Chart.yaml, values.yaml ותיקיית templates עם דוגמאות מוכנות.'
    },
    {
      code: '$ helm install my-release ./my-chart --___',
      q: 'מה משלים את הפקודה כדי שכל כישלון בהתקנה יגרום ל-rollback אוטומטי?',
      o: ['<code>atomic</code>', '<code>force</code>', '<code>wait</code>', '<code>debug</code>'],
      a: 0,
      w: '<code>--atomic</code> גורם ל-Helm לבטל אוטומטית את ההתקנה כולה אם משהו נכשל באמצע, במקום להשאיר משאבים חלקיים בקלאסטר.'
    },
    {
      code: '$ helm upgrade --___ my-release ./my-chart -f values.yaml',
      q: 'איזה דגל גורם ל-helm upgrade להתקין את ה-release אם הוא לא קיים, ולשדרג אם כן?',
      o: ['<code>install</code>', '<code>create</code>', '<code>force</code>', '<code>upsert</code>'],
      a: 0,
      w: '<code>helm upgrade --install</code> הוא פתרון idempotent פופולרי מאוד ב-CI/CD - אין צורך להבחין אם זו התקנה ראשונה או שדרוג.'
    },
    {
      code: '$ helm ___ my-release 2',
      q: 'מה משלים את הפקודה כדי להחזיר release ל-revision מספר 2 בהיסטוריה?',
      o: ['<code>rollback</code>', '<code>revert</code>', '<code>downgrade</code>', '<code>reset</code>'],
      a: 0,
      w: '<code>helm rollback my-release 2</code> יוצר revision חדש שמכיל את התוכן של revision 2 - זו הדרך הרשמית לחזור אחורה.'
    },
    {
      code: '$ helm ___ ./my-chart',
      q: 'מה משלים את הפקודה כדי לבדוק שגיאות תחביר ובעיות נפוצות ב-Chart, בלי לגעת בקלאסטר?',
      o: ['<code>lint</code>', '<code>check</code>', '<code>validate</code>', '<code>test</code>'],
      a: 0,
      w: '<code>helm lint</code> רץ מקומית ובודק את מבנה ה-Chart - שלב מומלץ לפני כל commit או pipeline של CI.'
    },
    {
      code: '$ helm ___ my-release ./my-chart',
      q: 'מה משלים את הפקודה כדי לראות את המניפסטים המרונדרים בלי להתקין אותם בפועל?',
      o: ['<code>template</code>', '<code>render</code>', '<code>preview</code>', '<code>dry-run</code>'],
      a: 0,
      w: '<code>helm template</code> מריץ את מנוע ה-templates ומדפיס את הפלט הסופי - הכלי הכי שימושי לפיתוח ודיבאג של templates.'
    },
    {
      code: '$ helm ___ ./my-chart\n# פלט: my-chart-1.0.0.tgz',
      q: 'מה משלים את הפקודה כדי לארוז את ה-Chart לקובץ .tgz להפצה?',
      o: ['<code>package</code>', '<code>build</code>', '<code>archive</code>', '<code>zip</code>'],
      a: 0,
      w: '<code>helm package</code> אורז את תיקיית ה-Chart (כולל values.yaml, templates ו-Chart.yaml) לקובץ .tgz יחיד לפי שם וגרסה מ-Chart.yaml.'
    },
    {
      code: '$ helm dependency ___ ./my-app',
      q: 'מה משלים את הפקודה כדי להוריד בפועל את התלויות המוגדרות ל-charts/ וליצור Chart.lock?',
      o: ['<code>update</code>', '<code>install</code>', '<code>fetch</code>', '<code>sync</code>'],
      a: 0,
      w: '<code>helm dependency update</code> מוריד את כל קבצי ה-.tgz של התלויות המוגדרות ב-Chart.yaml לתיקיית charts/, ויוצר או מעדכן את Chart.lock.'
    },
    {
      code: '$ helm repo ___ bitnami https://charts.bitnami.com/bitnami',
      q: 'מה משלים את הפקודה כדי לרשום repository חדש בשם bitnami?',
      o: ['<code>add</code>', '<code>register</code>', '<code>connect</code>', '<code>set</code>'],
      a: 0,
      w: '<code>helm repo add &lt;name&gt; &lt;url&gt;</code> מוסיף repository לרשימה המקומית; יש להריץ אחר כך helm repo update כדי לרענן את האינדקס.'
    },
    {
      code: '$ helm ___ my-release --keep-history',
      q: 'מה משלים את הפקודה כדי למחוק release אך לשמור את היסטוריית ה-revisions שלו?',
      o: ['<code>uninstall</code>', '<code>delete</code>', '<code>remove</code>', '<code>purge</code>'],
      a: 0,
      w: '<code>helm uninstall my-release --keep-history</code> מוחקת את המשאבים בקלאסטר אך שומרת את מטא-דאטת ה-release, כך שאפשר עדיין לראות revisions ישנים.'
    },
    {
      code: '$ helm get ___ my-release',
      q: 'מה משלים את הפקודה כדי לראות את המניפסט המלא (כל אובייקטי ה-Kubernetes) שהותקן בפועל עבור release זה?',
      o: ['<code>manifest</code>', '<code>values</code>', '<code>notes</code>', '<code>hooks</code>'],
      a: 0,
      w: '<code>helm get manifest my-release</code> מציגה את כל אובייקטי ה-Kubernetes שנוצרו על ידי ה-release - שימושי מאוד לדיבאג.'
    },
    {
      code: 'templates/hpa.yaml:\n{{- ___ .Values.autoscaling.enabled }}\nkind: HorizontalPodAutoscaler\n...\n{{- end }}',
      q: 'מה משלים את התג כדי לרנדר את משאב ה-HPA רק כאשר autoscaling.enabled הוא true?',
      o: ['<code>if</code>', '<code>range</code>', '<code>with</code>', '<code>define</code>'],
      a: 0,
      w: '<code>{{- if .Values.autoscaling.enabled }} ... {{- end }}</code> הוא תנאי סטנדרטי - המשאב כולו מרונדר רק כשהערך הבוליאני אמת.'
    },
    {
      code: 'metadata:\n  name: {{ ___ "app.fullname" . }}',
      q: 'מה משלים את הקריאה כדי להשתמש בפונקציית helper בשם app.fullname, עם אפשרות לצנרר (pipe) את הפלט שלה הלאה, למשל ל-nindent?',
      o: ['<code>include</code>', '<code>template</code>', '<code>call</code>', '<code>func</code>'],
      a: 0,
      w: '<code>include</code> מחזיר את הפלט כמחרוזת שניתן להמשיך ולצנרר לפונקציות נוספות כמו nindent - בניגוד ל-template שלא מאפשר pipe, ולכן include מומלץ תמיד.'
    },
    {
      code: '$ helm ___ my-release -n team-a',
      q: 'מה משלים את הפקודה כדי לראות את הסטטוס הנוכחי (למשל deployed או failed) של release ספציפי ב-namespace team-a?',
      o: ['<code>status</code>', '<code>info</code>', '<code>describe</code>', '<code>get</code>'],
      a: 0,
      w: '<code>helm status my-release -n team-a</code> מציגה את מצב ה-release הנוכחי כולל revision, namespace וזמן פריסה אחרון.'
    }
  ];

  /* ============================================================
     מצב 4 - התאמת מושגים: סבבים של זוגות מושג/פקודה + תיאור
     ============================================================ */
  var MATCH_ROUNDS = [
    {
      title: 'קבצי Chart בסיסיים',
      pairs: [
        { l: '<code>Chart.yaml</code>', r: 'מטא-דאטה על ה-Chart - שם, גרסה, תלויות ותיאור' },
        { l: '<code>values.yaml</code>', r: 'ערכי ברירת המחדל הניתנים להתאמה אישית של ה-Chart' },
        { l: '<code>templates/</code>', r: 'תבניות YAML שמייצרות את מניפסטי ה-Kubernetes הסופיים' },
        { l: '<code>charts/</code>', r: 'תיקיית התלויות (subcharts) שהורדו בפועל' },
        { l: '<code>.helmignore</code>', r: 'קבצים שיש להתעלם מהם באריזת ה-Chart' }
      ]
    },
    {
      title: 'אובייקטים מובנים בתבניות',
      pairs: [
        { l: '<code>.Release</code>', r: 'מידע על ה-release הנוכחי, כמו Name ו-Namespace' },
        { l: '<code>.Values</code>', r: 'הערכים מ-values.yaml או שסופקו דרך CLI' },
        { l: '<code>.Chart</code>', r: 'תוכן קובץ Chart.yaml, כמו Name ו-Version' },
        { l: '<code>.Files</code>', r: 'גישה לקבצים נוספים שנמצאים בתוך ה-Chart' },
        { l: '<code>.Capabilities</code>', r: 'מידע על יכולות והגרסה של הקלאסטר' }
      ]
    },
    {
      title: 'פקודות ניהול Release',
      pairs: [
        { l: '<code>helm install</code>', r: 'התקנת release חדש מ-Chart' },
        { l: '<code>helm upgrade</code>', r: 'שדרוג release קיים לגרסה חדשה' },
        { l: '<code>helm rollback</code>', r: 'חזרה ל-revision קודם בהיסטוריה' },
        { l: '<code>helm uninstall</code>', r: 'מחיקת release מהקלאסטר' },
        { l: '<code>helm history</code>', r: 'הצגת כל ה-revisions של release' }
      ]
    },
    {
      title: 'Hooks ומחזור חיים',
      pairs: [
        { l: '<code>pre-install</code>', r: 'hook שרץ לפני יצירת המשאבים הראשונית' },
        { l: '<code>post-upgrade</code>', r: 'hook שרץ אחרי שדרוג מוצלח' },
        { l: '<code>helm.sh/hook-weight</code>', r: 'אנוטציה שקובעת סדר הרצה בין hooks באותו שלב' },
        { l: '<code>helm.sh/hook-delete-policy</code>', r: 'אנוטציה שקובעת מתי למחוק את משאב ה-hook' },
        { l: '<code>helm test</code>', r: 'פקודה שמריצה משאבים מסוג hook מסוג test' }
      ]
    }
  ];

  /* ============================================================
     מצב 5 - סידור תהליכים: סבבים של שלבים שצריך לסדר בסדר הנכון
     ============================================================ */
  var ORDER_ROUNDS = [
    {
      title: 'יצירת Chart חדש מאפס ועד helm install',
      steps: [
        'הרצת helm create my-app ליצירת שלד ה-Chart',
        'עריכת values.yaml עם ערכי ברירת המחדל הרצויים',
        'התאמת templates/deployment.yaml ושאר הקבצים לצרכי האפליקציה',
        'הרצת helm lint לבדיקת שגיאות תחביר',
        'הרצת helm template לצפייה במניפסטים המרונדרים לפני התקנה',
        'הרצת helm install להתקנה בפועל בקלאסטר'
      ]
    },
    {
      title: 'שדרוג בטוח לסביבת production',
      steps: [
        'הרצת helm diff upgrade לבדיקת השינויים הצפויים מול המצב הנוכחי',
        'הרצת helm upgrade עם dry-run ו-debug לבדיקה יבשה',
        'הרצת helm upgrade עם atomic, wait וtimeout לביצוע השדרוג בפועל',
        'הרצת helm status לוידוא שה-release במצב deployed',
        'הרצת kubectl rollout status לוידוא שכל ה-Pods מוכנים'
      ]
    },
    {
      title: 'פרסום Chart ל-repository מבוסס GitHub Pages',
      steps: [
        'הרצת helm package לאריזת ה-Chart לקובץ tgz',
        'הרצת helm repo index עם כתובת ה-URL ליצירת או עדכון index.yaml',
        'הרצת git add וgit commit לשמירת השינויים',
        'הרצת git push לענף gh-pages לדחיפת ה-repository המעודכן',
        'הרצת helm repo add מצד הצרכן להוספת ה-repository החדש',
        'הרצת helm repo update ואז helm install להתקנה בפועל של ה-Chart'
      ]
    },
    {
      title: 'הוספת תלות (subchart) לאפליקציה קיימת',
      steps: [
        'הוספת בלוק dependencies עם name, version, repository ו-condition בתוך Chart.yaml',
        'הגדרת ערכי ברירת מחדל לתלות תחת מפתח בשם ה-Chart שלה ב-values.yaml',
        'הרצת helm dependency update להורדת קובץ ה-tgz לתיקיית charts/ וליצירת Chart.lock',
        'הרצת helm dependency list לוידוא שהתלות נטענה כראוי',
        'הרצת helm install עם הפעלת התלות דרך set או values, להתקנת האפליקציה יחד עם ה-subchart'
      ]
    }
  ];

  /* ============================================================
     הגדרת מצבי המשחק
     ============================================================ */
  var MODES = [
    { key: 'rapid', icon: '⚡', name: 'קרב מהיר', desc: 'שאלות ידע כלליות על Helm - כמה תספיקו לפני שהזמן נגמר?', type: 'quiz', data: RAPID, sample: 8, time: 20000 },
    { key: 'render', icon: '🔍', name: 'ניחוש רינדור', desc: 'קטע template או values.yaml - מה בדיוק יהיה הפלט או ההתנהגות?', type: 'quiz', data: RENDER_GUESS, sample: 8, time: 28000, showCode: true },
    { key: 'cmd', icon: '🧩', name: 'השלמת פקודה', desc: 'פקודת helm CLI או תג template עם חלק חסר - בחרו מה משלים אותו נכון', type: 'quiz', data: CMD_COMPLETE, sample: 8, time: 28000, showCode: true },
    { key: 'match', icon: '🔗', name: 'התאמת מושגים', desc: 'התאימו כל מושג/פקודת Helm לתיאור הנכון שלו', type: 'match', data: MATCH_ROUNDS, sample: 2 },
    { key: 'order', icon: '📋', name: 'סידור תהליכים', desc: 'סדרו את שלבי התהליך לפי הסדר הנכון', type: 'order', data: ORDER_ROUNDS, sample: 2 }
  ];

  window.TG_CONFIG = { gameId: "helm", modes: MODES };
})();
</script>

<script src="/scripts/topic-game.js"></script>
