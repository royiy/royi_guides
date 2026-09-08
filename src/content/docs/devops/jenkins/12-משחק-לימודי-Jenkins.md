---
title: "משחק לימודי: אתגר Jenkins"
category: DevOps/Jenkins
part: 12/10
description: "משחק אינטראקטיבי ללימוד Jenkins - חמישה מצבי משחק עם טיימר, לבבות, ניקוד ורצפים: קרב מהיר, ניחוש מה קורה בהרצת Jenkinsfile, השלמת Jenkinsfile, התאמת מושגים וסידור workflow."
---

חמישה מצבי משחק שבודקים היבטים שונים של Jenkins - Declarative מול Scripted, Jenkinsfile, ניהול Plugins, Credentials, Webhooks וארכיטקטורת Controller/Agent. לא עוד חידון רב-ברירה, אלא משחק עם **טיימר**, **שלושה לבבות**, **מכפיל רצף** ו**שיא אישי** שנשמר בדפדפן. בסוף כל סבב תקבלו דירוג, ורשימת חזרה של בדיוק מה שפספסתם.


<div class="tg" id="tg" dir="rtl">
  <div class="tg-screen is-active" data-screen="menu">
    <div class="tg-hero">
      <div class="tg-hero-badge">Jenkins</div>
      <div class="tg-hero-title">אתגר Jenkins</div>
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
      q: 'מה ההבדל המרכזי בין Declarative Pipeline ל-Scripted Pipeline?',
      o: ['Declarative הוא syntax מובנה עם structure קבוע שנבדק לפני ריצה (validation), ו-Scripted הוא Groovy מלא בתוך <code>node {}</code> שנבדק תוך כדי ריצה', 'Scripted רץ רק על Windows ו-Declarative רק על Linux', 'Declarative לא תומך כלל בהגדרת stages', 'אין הבדל מעשי, אלו שני שמות לאותו syntax'],
      a: 0,
      w: '<code>pipeline { agent {} stages {} }</code> הוא ה-structure הקבוע של Declarative, קריא יותר ונבדק לפני שהוא רץ בפועל. Scripted, בתוך <code>node {}</code>, הוא Groovy מלא - גמיש יותר אך דורש ידע תכנותי ונבדק רק תוך כדי ריצה.'
    },
    {
      q: 'מהו Jenkinsfile?',
      o: ['קובץ טקסט שמגדיר את ה-Pipeline כקוד, נשמר יחד עם קוד הפרויקט ב-Git', 'קובץ הלוגים הראשי של שרת Jenkins', 'קובץ קונפיגורציה של plugins בלבד', 'קובץ שמכיל רק את רשימת ה-Credentials'],
      a: 0,
      w: 'שמירת ה-Pipeline כ-Jenkinsfile בתוך ה-repository מאפשרת גרסאות, code review, ו-single source of truth לתהליך ה-CI/CD - עקרון "Pipeline as Code".'
    },
    {
      q: 'מה תפקיד <code>agent</code> ב-Declarative Pipeline?',
      o: ['מגדיר איפה ה-pipeline (או stage ספציפי) ירוץ - למשל <code>any</code>, <code>label</code> או <code>docker</code>', 'מגדיר מי המשתמש שיצר את ה-job', 'קובע את תדירות ההרצה האוטומטית', 'מגדיר את סוג ה-Credential שישמש לפריסה'],
      a: 0,
      w: 'אפשרויות נפוצות: <code>agent any</code> (כל agent זמין), <code>agent { label \'linux\' }</code>, או <code>agent { docker { image \'node:20\' } }</code> - לכל stage אפשר גם agent משלו.'
    },
    {
      q: 'מה ההבדל בין <code>stage</code> ל-<code>step</code>?',
      o: ['<code>stage</code> הוא שלב לוגי שמוצג בממשק (למשל "Build"), ו-<code>step</code> הוא פעולה בודדת בתוכו (למשל <code>sh</code> או <code>echo</code>)', 'הם שני שמות זהים לאותו מבנה', '<code>step</code> תמיד רץ לפני <code>stage</code>', '<code>stage</code> קיים רק ב-Scripted Pipeline'],
      a: 0,
      w: '<code>stages</code> מכיל רשימת <code>stage</code>ים שמוצגים ויזואלית בממשק (Blue Ocean, Stage View). כל <code>stage</code> מכיל בלוק <code>steps</code> עם הפעולות בפועל.'
    },
    {
      q: 'מה קורה כשמגדירים <code>agent none</code> ברמת ה-pipeline הראשית?',
      o: ['לא מוקצה agent גלובלי - כל stage חייב להגדיר <code>agent</code> משלו כדי לרוץ', 'ה-pipeline לא ירוץ בכלל וייכשל מיד', 'כל ה-stages ירוצו על ה-Controller עצמו', 'זהה לחלוטין ל-<code>agent any</code>'],
      a: 0,
      w: 'שימושי כשרוצים agents שונים לכל stage (למשל image שונה לבניית frontend ו-backend) - <code>agent none</code> מונע הקצאת agent מיותרת ברמה הגלובלית.'
    },
    {
      q: 'מה תפקיד בלוק <code>post</code> ב-Pipeline?',
      o: ['מריץ פעולות אחרי סיום ה-pipeline/stage, לפי conditions כמו <code>always</code>, <code>success</code>, <code>failure</code>', 'מגדיר את סדר הרצת ה-stages', 'שולח את הקוד ל-repository מרוחק', 'מתקין plugins נדרשים לפני הריצה'],
      a: 0,
      w: 'ה-conditions הנפוצים: <code>always</code> (תמיד), <code>success</code>, <code>failure</code>, <code>unstable</code>, <code>changed</code> (כשהתוצאה שונה מהריצה הקודמת), <code>aborted</code>, <code>cleanup</code>.'
    },
    {
      q: 'איך מריצים כמה stages במקביל ב-Declarative Pipeline?',
      o: ['בעזרת בלוק <code>parallel {}</code> שמכיל כמה <code>stage</code>ים פנימיים', 'בעזרת <code>options { parallel: true }</code>', 'זה קורה אוטומטית לכל ה-stages תמיד', 'רק דרך plugin חיצוני, אין תמיכה מובנית'],
      a: 0,
      w: 'ב-Declarative משתמשים בבלוק <code>parallel { stage(\'A\'){...} stage(\'B\'){...} }</code> בתוך stage. ב-Scripted עושים זאת עם פונקציית <code>parallel()</code> שמקבלת map של closures.'
    },
    {
      q: 'מהי תיקיית <code>JENKINS_HOME</code>?',
      o: ['התיקייה שמכילה את כל נתוני Jenkins - jobs, builds, plugins, config.xml ו-credentials מוצפנים', 'תיקיית לוגים זמנית שאפשר למחוק בלי בעיה', 'תיקיית ההתקנה של Java בלבד', 'תיקייה שמכילה רק agents מחוברים'],
      a: 0,
      w: 'גיבוי שוטף של <code>JENKINS_HOME</code> קריטי - היא מכילה הכול, כולל credentials מוצפנים. מעבר בין שרתים אפשר לרוב פשוט על ידי העתקת התיקייה כולה.'
    },
    {
      q: 'איזה כלי CLI משמש להתקנת plugins מראש בתוך Docker image מותאם אישית של Jenkins?',
      o: ['<code>jenkins-plugin-cli</code>', '<code>jenkins-cli.jar install</code> בלבד', '<code>npm install jenkins</code>', '<code>apt install jenkins-plugins</code>'],
      a: 0,
      w: '<code>jenkins-plugin-cli --plugins git:latest docker-workflow:latest ...</code> מריצים בתוך <code>Dockerfile</code> כדי לבנות image עם plugins קבועים מראש - טוב יותר מהתקנה ידנית ב-production.'
    },
    {
      q: 'מה עושה <code>withCredentials</code> בתוך Pipeline?',
      o: ['מזריק credentials כמשתני סביבה זמניים לתוך ה-step, ומסתיר את הערכים בלוגים', 'יוצר credential חדש ושומר אותו לצמיתות', 'מוחק credentials שלא נמצאים בשימוש', 'מציג את כל ה-credentials השמורים בממשק'],
      a: 0,
      w: 'לדוגמה <code>withCredentials([usernamePassword(credentialsId: \'aws-creds\', usernameVariable: \'AWS_ACCESS_KEY_ID\', passwordVariable: \'AWS_SECRET_ACCESS_KEY\')])</code> - הערכים זמינים רק בתוך הבלוק, ו-Jenkins ממסך (masking) אותם אוטומטית אם הם מודפסים ללוג.'
    },
    {
      q: 'מה קורה כשמגדירים Webhook ב-GitHub לכתובת <code>/github-webhook/</code> ב-Jenkins?',
      o: ['בכל push לרפו, GitHub שולח אירוע ל-Jenkins שמפעיל build אוטומטית, בלי polling', 'Jenkins בודק את ה-repo כל דקה בעצמו', 'ה-Webhook רק שולח התראת מייל, בלי להריץ build', 'צריך ללחוץ ידנית על "Build Now" בכל מקרה'],
      a: 0,
      w: 'זו הדרך המומלצת להפעלה אוטומטית - יעילה יותר מ-Poll SCM כי היא מגיבה מיידית לאירוע במקום לבדוק שינויים בפולינג תקופתי.'
    },
    {
      q: 'מהו ה-Controller (לשעבר Master) בארכיטקטורת Jenkins?',
      o: ['"המוח" של Jenkins - אחראי על UI, scheduling וניהול תצורה, ולא אמור להריץ builds כבדים', 'מכונה שרק מריצה builds ואין לה ממשק', 'רכיב שמנהל רק Credentials', 'plugin אופציונלי שאפשר להתקין או לא'],
      a: 0,
      w: 'בסביבות production כמעט אף פעם לא מריצים builds ישירות על ה-Controller - זה פוגע בביצועים, בבידוד ובסקיילביליות. לשם כך משתמשים ב-Agents.'
    },
    {
      q: 'מהו Executor ב-Jenkins?',
      o: ['"חריץ" (slot) על agent שיכול להריץ build אחד בו-זמנית', 'שם נרדף ל-Controller', 'סוג של Credential', 'plugin שמריץ טסטים בלבד'],
      a: 0,
      w: 'agent עם 4 executors יכול להריץ עד 4 builds במקביל. אם כל ה-executors תפוסים, builds נוספים נכנסים לתור וממתינים.'
    },
    {
      q: 'מהו Label בהקשר של Agents?',
      o: ['תגית שמשייכת agent ליכולות מסוימות, כמו <code>linux</code>, <code>docker</code> או <code>gpu</code>', 'שם ה-branch שממנו נמשך הקוד', 'מזהה ייחודי של כל build', 'קטגוריה של Credential'],
      a: 0,
      w: 'משתמשים ב-<code>agent { label \'docker-capable\' }</code> כדי לוודא שה-stage ירוץ רק על agent עם היכולת המתאימה - שימושי כשיש agents מגוונים (Windows/Linux/GPU).'
    },
    {
      q: 'מה עושה <code>@Library(\'my-shared-lib\') _</code> בשורה הראשונה של Jenkinsfile?',
      o: ['טוען Shared Library משותפת שהוגדרה מראש ב-Manage Jenkins, ומאפשר שימוש בפונקציות שלה', 'מייבא plugin חדש ומתקין אותו', 'יוצר branch חדש בשם my-shared-lib', 'מגדיר credential בשם my-shared-lib'],
      a: 0,
      w: 'Shared Libraries פותרות כפילות קוד בין פרויקטים - קוד Groovy משותף (למשל תחת <code>vars/</code>) נטען לתוך כל Jenkinsfile שמצהיר עליו עם <code>@Library</code>.'
    },
    {
      q: 'מה עושה <code>when { branch \'main\' }</code> בתוך stage?',
      o: ['מריץ את ה-stage רק כשה-pipeline רץ על branch main, ומדלג עליו בענפים אחרים', 'עוצר את כל ה-pipeline אם לא נמצאים על main', 'יוצר branch חדש בשם main', 'ממזג אוטומטית את הענף הנוכחי ל-main'],
      a: 0,
      w: 'בלוק <code>when</code> נפוץ מאוד ל-stages כמו deploy שרוצים להריץ רק בתנאים מסוימים - לפי branch, environment variable, או תוצאה של expression.'
    },
    {
      q: 'מה ההבדל בין step ה-<code>git</code> לבין <code>checkout scm</code>?',
      o: ['<code>git</code> מושך repo ספציפי לפי פרמטרים מפורשים; <code>checkout scm</code> מושך לפי הגדרת ה-SCM של ה-job עצמו, שימושי ב-Multibranch Pipeline', 'הן פקודות זהות לגמרי', '<code>checkout scm</code> עובד רק עם SVN', '<code>git</code> תומך רק ב-HTTPS ולא ב-SSH'],
      a: 0,
      w: '<code>checkout scm</code> נוח כש-Pipeline מוגדר כ-"Pipeline script from SCM" או ב-Multibranch, כי הוא אוטומטית מושך את אותו branch/commit שהפעיל את ה-build.'
    },
    {
      q: 'מה עושה <code>options { timeout(time: 30, unit: \'MINUTES\') }</code>?',
      o: ['עוצר ומכשיל את ה-pipeline אם הוא רץ יותר מ-30 דקות, כדי למנוע builds תקועים לנצח', 'ממתין 30 דקות לפני שה-pipeline מתחיל בכלל', 'מגביל את מספר ה-stages ל-30', 'מוחק builds ישנים אחרי 30 יום'],
      a: 0,
      w: 'הגנה חשובה מפני builds שנתקעים (למשל בגלל <code>input</code> ללא מענה, או תהליך שקפא) ותופסים executor לנצח.'
    }
  ];

  /* ============================================================
     מצב 2 - ניחוש הרצה: קטע Jenkinsfile + מה קורה כשמריצים אותו
     ============================================================ */
  var RUN_GUESS = [
    {
      code: 'pipeline {\n    agent any\n    stages {\n        stage(\'Build\') {\n            steps { sh \'exit 1\' }\n        }\n        stage(\'Deploy\') {\n            steps { echo \'Deploying...\' }\n        }\n    }\n}',
      q: 'ה-stage \'Build\' נכשל (exit code 1). מה יקרה ל-\'Deploy\'?',
      o: ['ה-pipeline יעצור ויסומן כ-FAILURE; \'Deploy\' לא ירוץ כלל, כברירת מחדל', '\'Deploy\' ירוץ בכל מקרה, כי כל stage עצמאי', 'Jenkins יתעלם משגיאת exit 1 וימשיך כרגיל', 'ה-pipeline יחזור אוטומטית על \'Build\' עד שיצליח'],
      a: 0,
      w: 'ברירת המחדל ב-Declarative Pipeline: כישלון ב-stage עוצר את שרשרת ה-stages הבאים. כדי להריץ פעולות בכל מקרה (הצלחה או כישלון) צריך בלוק <code>post</code>.'
    },
    {
      code: 'post {\n    always {\n        cleanWs()\n    }\n    failure {\n        mail to: \'team@example.com\', subject: \'Build Failed\'\n    }\n}',
      q: 'ה-build הסתיים בהצלחה (SUCCESS). אילו בלוקים ב-post ירוצו?',
      o: ['רק <code>always</code> (כלומר <code>cleanWs()</code>) - <code>failure</code> לא ירוץ כי לא הייתה כשלון', 'שני הבלוקים ירוצו תמיד', 'רק <code>failure</code>, כי הוא מוגדר אחרון', 'אף בלוק לא ירוץ אם ה-build הצליח'],
      a: 0,
      w: '<code>always</code> רץ ללא תלות בתוצאה. שאר ה-conditions (<code>success</code>, <code>failure</code>, <code>unstable</code>...) רצים רק כשהתוצאה תואמת בדיוק.'
    },
    {
      code: 'pipeline {\n    agent any\n    options {\n        disableConcurrentBuilds()\n    }\n    stages { stage(\'Build\') { steps { sh \'./build.sh\' } } }\n}',
      q: 'build חדש הופעל בזמן שה-build הקודם על אותו job עדיין רץ. מה יקרה?',
      o: ['ה-build החדש ייכנס לתור וימתין עד שהקודם יסתיים - לא ירוץ במקביל', 'שני ה-builds ירוצו יחד על אותו agent', 'ה-build הישן יבוטל אוטומטית לטובת החדש', 'Jenkins יזרוק שגיאה ולא יאפשר להריץ build שני בכלל'],
      a: 0,
      w: '<code>disableConcurrentBuilds()</code> מונע ריצה מקבילה של אותו job - שימושי כשיש חשש ל-race condition (למשל deploy לאותה סביבה).'
    },
    {
      code: 'stage(\'Deploy\') {\n    when { branch \'main\' }\n    steps { sh \'./deploy.sh\' }\n}',
      q: 'ה-pipeline רץ על branch feature/login. מה יקרה ל-stage \'Deploy\'?',
      o: ['ה-stage ידולג (Skipped) כי תנאי ה-when לא מתקיים - שאר ה-pipeline ימשיך רגיל', 'כל ה-pipeline ייכשל מיד', 'ה-stage ירוץ בכל זאת, אבל בלי לבצע deploy בפועל', 'Jenkins יעביר את ה-build אוטומטית ל-branch main'],
      a: 0,
      w: 'stage עם <code>when</code> שלא מתקיים פשוט מדולג ומסומן ככזה ב-UI (בדרך כלל באפור) - זו לא כשלון, ההרצה ממשיכה לשאר ה-stages.'
    },
    {
      code: 'pipeline {\n    agent {\n        docker { image \'node:20-alpine\' }\n    }\n    stages {\n        stage(\'Test\') { steps { sh \'npm test\' } }\n    }\n}',
      q: 'מה קורה מיד כשה-pipeline הזה מתחיל לרוץ, עוד לפני שה-steps ב-\'Test\' מתבצעים?',
      o: ['Jenkins מריץ container חדש מ-image <code>node:20-alpine</code>, וכל ה-steps ירוצו בתוכו', 'Jenkins מתקין Node.js ישירות על ה-Controller', 'ה-pipeline נכשל כי לא הוגדר agent any', 'ה-image מורד רק בסוף הריצה, לצורך ארכוב'],
      a: 0,
      w: '<code>agent { docker {...} }</code> גורם ל-Jenkins להריץ (ואם צריך למשוך) container מה-image שצוין, ולהריץ בתוכו את כל ה-steps של ה-stage או ה-pipeline כולו.'
    },
    {
      code: 'stage(\'Approval\') {\n    steps {\n        input message: \'לאשר deploy לפרודקשן?\', ok: \'כן, המשך\'\n    }\n}',
      q: 'ה-pipeline מגיע ל-stage הזה בלי options timeout מוגדר. מה קורה?',
      o: ['ה-pipeline נעצר וממתין לאישור אנושי דרך ה-UI, ועלול להמתין ללא הגבלת זמן ולתפוס executor', 'ה-stage מדלג אוטומטית תוך 10 שניות', 'ה-build נכשל מיד כי אין אישור אוטומטי', 'Jenkins שולח אימייל ומאשר לבד לאחר שעה'],
      a: 0,
      w: 'ה-step <code>input</code> עוצר את הריצה עד לאישור/דחייה ידניים. בלי <code>timeout</code>, זה יכול לתפוס executor למשך זמן בלתי מוגבל - לכן מומלץ לעטוף ב-<code>timeout</code>.'
    },
    {
      code: 'environment {\n    VERSION = "1.0.${BUILD_NUMBER}"\n}',
      q: 'זהו ה-build ה-42 של ה-job. מה יהיה ערכו של VERSION?',
      o: ['"1.0.42"', '"1.0.${BUILD_NUMBER}" כמחרוזת מילולית', '"1.0.0" תמיד', 'שגיאת syntax כי אי אפשר לשלב משתנים במחרוזת'],
      a: 0,
      w: '<code>BUILD_NUMBER</code> הוא משתנה סביבה מובנה שמתעדכן אוטומטית בכל build. מחרוזות Groovy עם גרשיים כפולים תומכות ב-interpolation עם <code>${...}</code>.'
    },
    {
      code: 'try {\n    sh \'mvn clean compile\'\n} catch (Exception e) {\n    currentBuild.result = \'FAILURE\'\n    throw e\n}',
      q: '(Scripted Pipeline) mvn נכשל ב-compile. מה קורה בבלוק הזה?',
      o: ['ה-catch תופס את השגיאה, מסמן את ה-build כ-FAILURE במפורש, ואז זורק אותה מחדש כדי לעצור את הריצה', 'השגיאה נבלעת בשקט וה-pipeline ממשיך כרגיל', 'ה-build מסומן SUCCESS כי try/catch "תפס" את השגיאה', 'Jenkins מתעלם מ-currentBuild.result לגמרי'],
      a: 0,
      w: '<code>currentBuild.result = \'FAILURE\'</code> מסמן במפורש את התוצאה, ו-<code>throw e</code> זורק את החריגה שוב כדי שה-node/stage בפועל יעצור - בלי ה-throw, הריצה הייתה ממשיכה בניגוד לכוונה.'
    },
    {
      code: 'parallel(\n    "Unit Tests": { sh \'mvn test\' },\n    "Integration Tests": { sh \'mvn verify -P integration\' }\n)',
      q: '"Integration Tests" נכשל בזמן ש-"Unit Tests" עדיין רץ. מה קורה כברירת מחדל?',
      o: ['Jenkins עוצר את הענפים המקבילים האחרים ומסמן את כל ה-stage כנכשל', 'Jenkins ממתין ל-"Unit Tests" שיסיים ומתעלם מהכישלון', 'רק "Integration Tests" מסומן נכשל, "Unit Tests" ימשיך וה-stage יעבור', 'ה-pipeline כולו נעצר בלי לסמן שום תוצאה'],
      a: 0,
      w: 'ברירת המחדל של <code>parallel</code> היא failFast מרומז - כישלון בענף אחד מפיל את כל ה-stage המקבילי. אפשר לשנות התנהגות זו עם <code>failFast: false</code>.'
    },
    {
      code: 'withCredentials([\n    usernamePassword(credentialsId: \'aws-creds\', usernameVariable: \'AWS_ACCESS_KEY_ID\', passwordVariable: \'AWS_SECRET_ACCESS_KEY\')\n]) {\n    sh \'echo $AWS_SECRET_ACCESS_KEY\'\n}',
      q: 'בטעות מדפיסים את הערך הסודי ללוג בתוך הבלוק. מה יקרה בפועל בלוג ה-build?',
      o: ['Jenkins יזהה את הערך ויחליף אותו אוטומטית ב-**** בלוג (credential masking)', 'הערך המלא יופיע גלוי בלוג לכל מי שרואה את ה-build', 'ה-build ייכשל מיד ברגע שמנסים להדפיס credential', 'Jenkins ימחק את כל הלוג של ה-stage'],
      a: 0,
      w: 'זו הגנה מובנית: כל ערך שמוזרק דרך <code>withCredentials</code> ומופיע בפלט מוחלף אוטומטית במיסוך - אך זו לא תחליף לזהירות, כי לא כל מקרה קצה נתפס (למשל ערך שעבר קידוד).'
    },
    {
      code: 'matrix {\n    axes {\n        axis { name \'PLATFORM\'; values \'linux\', \'windows\', \'mac\' }\n        axis { name \'NODE_VERSION\'; values \'18\', \'20\' }\n    }\n    stages { stage(\'Test\') { steps { echo "..." } } }\n}',
      q: 'כמה קומבינציות (cells) ירוצו בפועל כשמריצים את ה-matrix הזה?',
      o: ['6 - מכפלה של כל הערכים בכל axis (3 מערכות הפעלה × 2 גרסאות Node)', '5 - סכום הערכים בשני ה-axes', '2 - רק axis אחד רץ בכל פעם', '1 - matrix מריץ רק קומבינציה אחת כברירת מחדל'],
      a: 0,
      w: '<code>matrix</code> יוצר קומבינציה (cell) לכל צירוף אפשרי בין ה-axes שהוגדרו - כאן 3 × 2 = 6 ריצות של stage \'Test\', כל אחת עם ערכי <code>PLATFORM</code> ו-<code>NODE_VERSION</code> משלה.'
    },
    {
      code: 'stage(\'Checkout\') {\n    steps {\n        checkout scm\n        version = sh(script: \'git rev-parse --short HEAD\', returnStdout: true).trim()\n    }\n}',
      q: 'מה החשיבות של ה-<code>.trim()</code> בסוף השורה השנייה?',
      o: ['פלט <code>sh</code> עם <code>returnStdout: true</code> כולל תו ירידת שורה בסוף; <code>.trim()</code> מסיר אותו כדי ש-version יכיל רק את ה-SHA הנקי', 'הוא ממיר את הערך למספר', 'הוא מוחק רווחים מתוך ה-SHA עצמו', 'בלעדיו הפקודה תזרוק שגיאת syntax'],
      a: 0,
      w: 'בלי <code>trim()</code>, המשתנה <code>version</code> היה מכיל תו <code>\\n</code> נוסף בסוף - מה שעלול לגרום לבאגים מוזרים בהמשך, למשל בבניית שם tag או נתיב קובץ שמשתמש בערך הזה.'
    }
  ];

  /* ============================================================
     מצב 3 - השלמת Jenkinsfile: קטע קוד עם חלק חסר (___)
     ============================================================ */
  var JENKINSFILE_COMPLETE = [
    {
      code: 'pipeline {\n    ___ any\n    stages {\n        stage(\'Build\') { steps { sh \'make\' } }\n    }\n}',
      q: 'מה משלים את השורה כדי להריץ את ה-pipeline על כל agent זמין?',
      o: ['<code>agent</code>', '<code>node</code>', '<code>run</code>', '<code>host</code>'],
      a: 0,
      w: '<code>agent any</code> הוא ה-directive הבסיסי ב-Declarative Pipeline שאומר ל-Jenkins להקצות כל agent פנוי כדי להריץ את ה-pipeline.'
    },
    {
      code: 'pipeline {\n    agent any\n    stages {\n        stage(\'Build\') {\n            ___ {\n                sh \'make\'\n            }\n        }\n    }\n}',
      q: 'מה משלים את הבלוק שמכיל את הפעולות בפועל בתוך stage?',
      o: ['<code>steps</code>', '<code>actions</code>', '<code>tasks</code>', '<code>run</code>'],
      a: 0,
      w: 'כל <code>stage</code> ב-Declarative Pipeline חייב בלוק <code>steps</code> שמכיל את הפקודות בפועל - כמו <code>sh</code>, <code>echo</code> או steps מותאמים.'
    },
    {
      code: 'pipeline {\n    agent any\n    environment {\n        APP_ENV = ___\n    }\n    stages {\n        stage(\'Build\') { steps { sh \'make\' } }\n    }\n}',
      q: 'מה משלים את השורה כדי להגדיר את הערך \'production\' למשתנה הסביבה APP_ENV?',
      o: ['<code>\'production\'</code>', '<code>production</code> בלי מרכאות', '<code>env(\'production\')</code>', '<code>set(\'production\')</code>'],
      a: 0,
      w: 'בבלוק <code>environment</code> מגדירים <code>KEY = \'value\'</code> - הערך חייב להיות מחרוזת Groovy תקינה, לכן חובה במרכאות.'
    },
    {
      code: 'stage(\'Deploy\') {\n    ___ {\n        branch \'main\'\n    }\n    steps { sh \'./deploy.sh\' }\n}',
      q: 'מה משלים את הבלוק שמגביל את ה-stage לרוץ רק על branch מסוים?',
      o: ['<code>when</code>', '<code>if</code>', '<code>condition</code>', '<code>only</code>'],
      a: 0,
      w: 'בלוק <code>when</code> מגדיר תנאים להרצת stage - כאן <code>branch \'main\'</code> אומר שה-stage ירוץ רק כשמריצים על branch בשם main.'
    },
    {
      code: 'pipeline {\n    agent any\n    options {\n        ___(time: 30, unit: \'MINUTES\')\n    }\n    stages {\n        stage(\'Build\') { steps { sh \'make\' } }\n    }\n}',
      q: 'מה משלים את השורה כדי להגביל את זמן הריצה הכולל של ה-pipeline ל-30 דקות?',
      o: ['<code>timeout</code>', '<code>limit</code>', '<code>maxTime</code>', '<code>duration</code>'],
      a: 0,
      w: '<code>options { timeout(time: 30, unit: \'MINUTES\') }</code> מכשיל את ה-pipeline אוטומטית אם הוא חורג מהזמן שהוגדר - מונע builds תקועים לנצח.'
    },
    {
      code: 'post {\n    ___ {\n        junit \'**/target/surefire-reports/*.xml\'\n    }\n}',
      q: 'מה משלים כדי שהבלוק ירוץ תמיד, בין אם ה-build הצליח או נכשל?',
      o: ['<code>always</code>', '<code>success</code>', '<code>finally</code>', '<code>done</code>'],
      a: 0,
      w: '<code>always</code> הוא ה-condition היחיד ב-<code>post</code> שרץ ללא תלות בתוצאת ה-build - שימושי לפרסום דוחות טסטים או ניקוי workspace עם <code>cleanWs()</code>.'
    },
    {
      code: 'stage(\'Parallel Tests\') {\n    ___ {\n        stage(\'Unit\') { steps { sh \'npm run test:unit\' } }\n        stage(\'Lint\') { steps { sh \'npm run lint\' } }\n    }\n}',
      q: 'מה משלים את הבלוק שמריץ את שני ה-stages הפנימיים במקביל?',
      o: ['<code>parallel</code>', '<code>concurrent</code>', '<code>together</code>', '<code>multi</code>'],
      a: 0,
      w: '<code>parallel {}</code> בתוך stage ב-Declarative מריץ את כל ה-stages המקוננים בו זמנית - כל אחד עם workspace ולוג משלו.'
    },
    {
      code: 'pipeline {\n    agent {\n        ___ {\n            image \'node:20-alpine\'\n        }\n    }\n    stages {\n        stage(\'Build\') { steps { sh \'npm ci\' } }\n    }\n}',
      q: 'מה משלים כדי להריץ את כל ה-pipeline בתוך container מבוסס Docker image?',
      o: ['<code>docker</code>', '<code>container</code>', '<code>image</code>', '<code>kubernetes</code>'],
      a: 0,
      w: '<code>agent { docker { image \'node:20-alpine\' } }</code> דורש את Docker Pipeline Plugin, ומריץ את כל steps ה-pipeline בתוך container מה-image שצוין.'
    },
    {
      code: 'withCredentials([\n    ___(credentialsId: \'slack-webhook\', variable: \'SLACK_URL\')\n]) {\n    sh \'curl -X POST $SLACK_URL -d "build done"\'\n}',
      q: 'מה משלים כדי לחשוף credential מסוג "Secret text" כמשתנה סביבה יחיד?',
      o: ['<code>string</code>', '<code>secretText</code>', '<code>text</code>', '<code>token</code>'],
      a: 0,
      w: 'ב-<code>withCredentials</code>, <code>string(credentialsId: ..., variable: ...)</code> הוא הבינדינג הנכון ל-credential מסוג Secret text - לעומת <code>usernamePassword</code> או <code>file</code> לסוגים אחרים.'
    },
    {
      code: 'stage(\'Checkout\') {\n    steps {\n        git branch: \'main\',\n            ___: \'github-ssh-key\',\n            url: \'git@github.com:myorg/repo.git\'\n    }\n}',
      q: 'מה משלים כדי לציין את ה-credential שישמש להתחברות ל-repository?',
      o: ['<code>credentialsId</code>', '<code>credential</code>', '<code>auth</code>', '<code>keyId</code>'],
      a: 0,
      w: 'הפרמטר <code>credentialsId</code> ב-step <code>git</code> מפנה למזהה ה-credential שנשמר מראש ב-Manage Jenkins → Credentials, ומאפשר גישה מאובטחת ל-repository פרטי.'
    },
    {
      code: 'pipeline {\n    agent any\n    tools {\n        ___ \'Maven-3.9\'\n    }\n    stages {\n        stage(\'Build\') { steps { sh \'mvn clean package\' } }\n    }\n}',
      q: 'מה משלים כדי להגדיר כלי Maven מותקן מראש בשם "Maven-3.9"?',
      o: ['<code>maven</code>', '<code>mvn</code>', '<code>tool</code>', '<code>build</code>'],
      a: 0,
      w: 'בלוק <code>tools</code> מאפשר להשתמש בכלים (Maven, JDK, Gradle...) שהוגדרו מראש ב-Manage Jenkins → Tools, לפי שמם - כאן <code>maven \'Maven-3.9\'</code>.'
    },
    {
      code: '___(\'my-shared-lib\') _\n\npipeline {\n    agent any\n    stages {\n        stage(\'Build\') { steps { buildApp(language: \'node\') } }\n    }\n}',
      q: 'מה משלים את השורה הראשונה כדי לטעון Shared Library גלובלית לתוך ה-pipeline?',
      o: ['<code>@Library</code>', '<code>@Import</code>', '<code>@Use</code>', '<code>@Load</code>'],
      a: 0,
      w: '<code>@Library(\'my-shared-lib\') _</code> טוען ספרייה משותפת שהוגדרה תחת Manage Jenkins → Global Pipeline Libraries, ומאפשר לקרוא לפונקציות שלה (כמו <code>buildApp</code> מתוך <code>vars/</code>) ישירות בקוד.'
    },
    {
      code: 'stage(\'Build\') {\n    agent {\n        label ___\n    }\n    steps { sh \'make\' }\n}',
      q: 'מה משלים כדי להריץ את ה-stage רק על agent שמסומן בתגית \'docker-capable\'?',
      o: ['<code>\'docker-capable\'</code>', '<code>docker-capable</code> בלי מרכאות', '<code>=docker-capable</code>', '<code>tag(\'docker-capable\')</code>'],
      a: 0,
      w: '<code>agent { label \'docker-capable\' }</code> מכוון את ה-stage לרוץ רק על agents שסומנו עם הלייבל הזה בהגדרות ה-Node - שימושי כשיש agents עם יכולות שונות.'
    }
  ];

  /* ============================================================
     מצב 4 - התאמת מושגים: סבבים של זוגות מונח/פקודה + תיאור
     ============================================================ */
  var MATCH_ROUNDS = [
    {
      title: 'מונחי יסוד בארכיטקטורת Jenkins',
      pairs: [
        { l: 'Controller (לשעבר Master)', r: 'המוח של Jenkins: UI, scheduling וניהול תצורה' },
        { l: 'Agent (לשעבר Slave/Node)', r: 'מכונה שמריצה את ה-builds בפועל' },
        { l: 'Executor', r: '"חריץ" (slot) על agent שיכול להריץ build אחד בו-זמנית' },
        { l: 'Label', r: 'תגית שמשייכת agent ליכולות מסוימות, כמו linux או docker' },
        { l: '<code>JENKINS_HOME</code>', r: 'תיקייה שמכילה jobs, builds, plugins, config ו-credentials מוצפנים' }
      ]
    },
    {
      title: 'Directives עיקריים ב-Declarative Pipeline',
      pairs: [
        { l: '<code>agent</code>', r: 'קובע איפה ה-pipeline או stage ספציפי ירוץ' },
        { l: '<code>stages</code>', r: 'מכיל את רצף השלבים הלוגיים של ה-pipeline' },
        { l: '<code>environment</code>', r: 'מגדיר משתני סביבה זמינים ל-pipeline או ל-stage' },
        { l: '<code>options</code>', r: 'קובע הגדרות התנהגות כמו timeout ו-buildDiscarder' },
        { l: '<code>post</code>', r: 'מריץ פעולות לפי תוצאת הריצה - always, success, failure' }
      ]
    },
    {
      title: 'סוגי Credentials ושימושם',
      pairs: [
        { l: 'Username with password', r: 'התחברות ל-Docker Registry או Nexus עם שם משתמש וסיסמה' },
        { l: 'SSH Username with private key', r: 'התחברות מאובטחת ל-Git דרך מפתח SSH פרטי' },
        { l: 'Secret text', r: 'שמירת API token או webhook secret כערך יחיד' },
        { l: 'Secret file', r: 'קבצי kubeconfig או certificates שלמים' },
        { l: '<code>withCredentials</code>', r: 'מזריק credentials כמשתני סביבה זמניים לתוך step' }
      ]
    },
    {
      title: 'כלים ואינטגרציות נפוצות',
      pairs: [
        { l: 'Webhook', r: 'מפעיל build אוטומטית ברגע push ל-repository, בלי polling' },
        { l: 'Shared Library', r: 'קוד Groovy משותף שנטען לכמה Jenkinsfiles, מונע כפילויות' },
        { l: 'Blue Ocean', r: 'ממשק ויזואלי מודרני להצגת pipelines ותוצאותיהם' },
        { l: 'Docker Pipeline Plugin', r: 'מאפשר להריץ stages בתוך container עם <code>agent { docker {} }</code>' },
        { l: '<code>jenkins-plugin-cli</code>', r: 'כלי CLI להתקנת plugins מראש בתוך Docker image מותאם' }
      ]
    }
  ];

  /* ============================================================
     מצב 5 - סידור Workflow: סבבים של שלבים שצריך לסדר בסדר הנכון
     ============================================================ */
  var ORDER_ROUNDS = [
    {
      title: 'בניית Pipeline מלא - מ-checkout ועד deploy',
      steps: [
        'stage(\'Checkout\') עם <code>checkout scm</code> למשיכת הקוד מ-Git',
        'stage(\'Install Dependencies\') להתקנת תלויות, למשל <code>npm ci</code>',
        'stage(\'Test\') להרצת בדיקות ופרסום תוצאות עם <code>junit</code>',
        'stage(\'Build\') לבניית ה-artifact הסופי',
        'stage(\'Deploy\') עם <code>when { branch \'main\' }</code> לפריסה מותנית'
      ]
    },
    {
      title: 'הגדרת Webhook מ-GitHub עד הרצת build אוטומטית',
      steps: [
        'יצירת Credential מתאים (SSH key או Personal Access Token) ב-Manage Jenkins → Credentials',
        'הגדרת Job/Pipeline עם Source Code Management שמצביע ל-repository',
        'הגדרת Webhook ב-GitHub: Settings → Webhooks, עם Payload URL לכתובת <code>/github-webhook/</code>',
        'ביצוע push לרפו - GitHub שולח את האירוע ל-Jenkins',
        'Jenkins מזהה את ה-webhook ומפעיל build חדש אוטומטית'
      ]
    },
    {
      title: 'הוספת Shared Library לפרויקטים בארגון',
      steps: [
        'יצירת repository נפרד עם מבנה תיקיות <code>vars/</code>, <code>src/</code>, <code>resources/</code>',
        'כתיבת פונקציה גלובלית, למשל <code>vars/buildApp.groovy</code>',
        'הגדרת ה-library תחת Manage Jenkins → System → Global Pipeline Libraries',
        'הוספת <code>@Library(\'my-shared-lib\') _</code> בראש ה-Jenkinsfile בכל פרויקט',
        'קריאה לפונקציה המשותפת, למשל <code>buildApp(language: \'node\')</code>, בתוך ה-pipeline'
      ]
    },
    {
      title: 'חיבור Agent חדש דרך SSH והכנתו לעבודה',
      steps: [
        'הכנת מכונת ה-agent - יצירת משתמש jenkins ותיקיית עבודה ייעודית',
        'הגדרת מפתח SSH והוספת המפתח הפרטי כ-Credential ב-Jenkins',
        'יצירת Node חדש: Manage Jenkins → Nodes → New Node',
        'הגדרת Remote root directory, Labels, ובחירת Launch method "Launch agents via SSH"',
        'Jenkins מתחבר ל-agent, מריץ את agent.jar ומסמן אותו כ-Online',
        'הגדרת stage או pipeline עם <code>agent { label \'...\' }</code> כדי לנצל את ה-agent החדש'
      ]
    }
  ];

  /* ============================================================
     הגדרת מצבי המשחק
     ============================================================ */
  var MODES = [
    { key: 'rapid', icon: '⚡', name: 'קרב מהיר', desc: 'שאלות ידע כלליות על Jenkins - כמה תספיקו לפני שהזמן נגמר?', type: 'quiz', data: RAPID, sample: 8, time: 20000 },
    { key: 'run', icon: '🚦', name: 'ניחוש הרצה', desc: 'קטע מ-Jenkinsfile - מה בדיוק יקרה כשמריצים אותו?', type: 'quiz', data: RUN_GUESS, sample: 8, time: 28000, showCode: true },
    { key: 'complete', icon: '🧩', name: 'השלמת Jenkinsfile', desc: 'קטע Jenkinsfile עם חלק חסר - בחרו מה משלים אותו נכון', type: 'quiz', data: JENKINSFILE_COMPLETE, sample: 8, time: 28000, showCode: true },
    { key: 'match', icon: '🔗', name: 'התאמת מושגים', desc: 'התאימו כל מונח/פקודה של Jenkins לתיאור הנכון שלו', type: 'match', data: MATCH_ROUNDS, sample: 2 },
    { key: 'order', icon: '📋', name: 'סידור Workflow', desc: 'סדרו את שלבי התהליך לפי הסדר הנכון', type: 'order', data: ORDER_ROUNDS, sample: 2 }
  ];

  window.TG_CONFIG = { gameId: "jenkins", modes: MODES };
})();
</script>

<script src="/scripts/topic-game.js"></script>

