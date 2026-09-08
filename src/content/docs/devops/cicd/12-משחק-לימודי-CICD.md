---
title: "משחק לימודי: אתגר CI/CD"
category: DevOps/CI-CD
part: 12/10
description: "משחק אינטראקטיבי ללימוד CI/CD - חמישה מצבי משחק עם טיימר, לבבות, ניקוד ורצפים: קרב מהיר, ניחוש פלט פייפליין, השלמת YAML, התאמת מושגים וסידור תהליך."
---

חמישה מצבי משחק שבודקים היבטים שונים של CI/CD - לא עוד חידון רב-ברירה, אלא משחק עם **טיימר**, **שלושה לבבות**, **מכפיל רצף** ו**שיא אישי** שנשמר בדפדפן. בסוף כל סבב תקבלו דירוג, ורשימת חזרה של בדיוק מה שפספסתם.


<div class="tg" id="tg" dir="rtl">
  <div class="tg-screen is-active" data-screen="menu">
    <div class="tg-hero">
      <div class="tg-hero-badge">CI/CD</div>
      <div class="tg-hero-title">אתגר CI/CD</div>
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
      q: 'מהי המטרה המרכזית של Continuous Integration (CI)?',
      o: ['לשלב קוד לענף משותף לעיתים קרובות, ולהריץ אוטומטית build ובדיקות על כל שילוב', 'לפרוס אוטומטית כל שינוי לפרודקשן', 'להחליף לגמרי code review אנושי', 'לנהל את תשתית הענן בלבד'],
      a: 0,
      w: 'CI מתמקד באיתור מוקדם של בעיות אינטגרציה - כל push לענף המשותף מפעיל build ובדיקות אוטומטיות, כדי לא לחכות "לרגע האינטגרציה הגדול" בסוף הפרויקט.'
    },
    {
      q: 'מה ההבדל בין Continuous Delivery ל-Continuous Deployment?',
      o: ['ב-Delivery כל שינוי שעובר CI מוכן לפריסה אך דורש אישור ידני לפרודקשן; ב-Deployment הפריסה לפרודקשן אוטומטית לחלוטין', 'אין הבדל מעשי בין השניים', 'Deployment דורש אישור ידני ו-Delivery אוטומטי לגמרי', 'Delivery מתייחס רק לבדיקות, Deployment רק ל-build'],
      a: 0,
      w: 'שני המושגים בונים על אותו pipeline; ההבדל היחיד הוא אם הצעד האחרון - הפריסה לפרודקשן - דורש לחיצת כפתור אנושית (Delivery) או קורה אוטומטית (Deployment).'
    },
    {
      q: 'מה מטרת שלב ה-Build בפייפליין CI/CD?',
      o: ['לקמפל/לארוז את הקוד למוצר הניתן להרצה, ולוודא שהוא בכלל מתקמפל', 'להריץ בדיקות אבטחה בלבד', 'לפרוס ישירות לפרודקשן', 'למחוק ענפים ישנים ב-Git'],
      a: 0,
      w: 'Build הוא בדרך כלל השלב הראשון אחרי Checkout - אם הקוד לא מתקמפל/נבנה בכלל, אין טעם להמשיך לשלבי הבדיקה והפריסה.'
    },
    {
      q: 'מהו Artifact בהקשר של CI/CD?',
      o: ['תוצר בנוי (למשל קובץ JAR, Docker image, תיקיית dist/) שנשמר ומועבר בין שלבי הפייפליין', 'קובץ לוג של הרצת הבדיקות בלבד', 'שם הענף שממנו רץ הפייפליין', 'משתנה סביבה סודי'],
      a: 0,
      w: 'Artifact הוא התוצר המוחשי של שלב ה-Build - הוא נשמר (למשל ב-registry או כ-artifact store) כדי ששלבי ה-Test וה-Deploy הבאים ישתמשו באותו תוצר בדיוק, בלי לבנות מחדש.'
    },
    {
      q: 'מהי אסטרטגיית Blue-Green Deployment?',
      o: ['הרצת שתי סביבות זהות (ישנה וחדשה) במקביל, והחלפת התעבורה בבת אחת מהישנה לחדשה', 'פריסה הדרגתית לאחוז קטן ממשתמשים בלבד', 'מחיקת הסביבה הישנה לפני שבונים את החדשה', 'הרצת בדיקות בלבד ללא כל פריסה'],
      a: 0,
      w: 'ב-Blue-Green שתי הסביבות (Blue = הישנה, Green = החדשה) קיימות בו-זמנית. אחרי בדיקות על Green, מעבירים את כל התעבורה אליה במכה אחת - ואם משהו משתבש, אפשר לחזור ל-Blue מיידית.'
    },
    {
      q: 'מהי אסטרטגיית Canary Deployment?',
      o: ['פריסת הגרסה החדשה לפלח קטן ממשתמשים/שרתים תחילה, וניטור לפני הרחבה מלאה', 'פריסה לכל המשתמשים בבת אחת ללא ניטור', 'ביטול אוטומטי של הגרסה הקודמת מיד', 'הרצת הפייפליין רק על ענפי feature'],
      a: 0,
      w: 'השם מגיע מ"כנרית במכרה הפחם" - חושפים קבוצה קטנה לגרסה החדשה, בודקים מדדים כמו שיעור שגיאות ו-latency, ורק אז מרחיבים בהדרגה לכלל המשתמשים.'
    },
    {
      q: 'מה עושה Rollback בהקשר של פריסה (Deployment)?',
      o: ['חוזר לגרסה יציבה קודמת כשהגרסה החדשה גורמת לתקלה בפרודקשן', 'מוחק את כל ה-artifacts מהמאגר לצמיתות', 'מריץ מחדש את כל בדיקות היחידה', 'יוצר ענף Git חדש לתיקון הבאג'],
      a: 0,
      w: 'Rollback הוא רשת הביטחון של פריסה רציפה - אם ניטור מזהה בעיה חמורה מיד אחרי deploy, חוזרים לגרסה שהייתה יציבה קודם לכן, לרוב אוטומטית או בלחיצת כפתור.'
    },
    {
      q: 'מהו Quality Gate בפייפליין CI/CD?',
      o: ['תנאי סף (למשל אחוז code coverage מינימלי, אפס פגיעויות קריטיות) שחייב להתקיים כדי שהפייפליין ימשיך', 'שם קוד לשרת ה-CI הראשי', 'תיקיית ה-artifacts הרשמית של הפרויקט', 'משתנה סביבה שמכיל את גרסת הקוד'],
      a: 0,
      w: 'Quality Gate עוצר את הפייפליין אוטומטית אם הקוד לא עומד בסטנדרט מוגדר מראש - כך מונעים מגרסה באיכות נמוכה או לא בטוחה להמשיך לשלבי הפריסה.'
    },
    {
      q: 'מהי גישת Trunk-Based Development בהקשר של CI/CD?',
      o: ['מיזוג תכוף לענף main/trunk עם ענפים קצרי-חיים, לרוב יחד עם Feature Flags', 'שמירת כל פיצ׳ר בענף release נפרד למשך חודשים', 'עבודה בלי Git בכלל', 'הרצת הפייפליין רק פעם בשבוע'],
      a: 0,
      w: 'ענפים ארוכי-חיים יוצרים "big bang merges" כואבים. Trunk-Based Development שואף למיזוגים קטנים ותכופים ל-main, מה שמתאים בדיוק לרוח ה-Continuous Integration.'
    },
    {
      q: 'מהו Feature Flag, ומה תפקידו בפריסה רציפה?',
      o: ['מתג בקוד שמאפשר להסתיר/להפעיל פיצ׳ר בפרודקשן בלי לפרוס מחדש, ומנתק בין Deploy ל-Release', 'שם הקובץ שמגדיר את הפייפליין', 'תג גרסה שנוצר עם git tag', 'משתנה סביבה שמכיל את כתובת השרת'],
      a: 0,
      w: 'Feature Flag מאפשר לפרוס קוד לא-גמור לפרודקשן כשהוא כבוי (מאחורי flag), ולהפעיל אותו למשתמשים בהמשך בלי deploy נוסף - זה מה שמאפשר Trunk-Based Development בטוח.'
    },
    {
      q: 'מהו העיקרון "Build Once, Deploy Many" בפייפליינים?',
      o: ['בונים artifact אחד בלבד ומעבירים בדיוק אותו דרך כל הסביבות (dev/staging/prod)', 'בונים מחדש בכל סביבה כדי לוודא עקביות', 'פורסים רק פעם אחת בכל גרסה, בלי חזרות', 'משתמשים ב-Docker image אחד משותף לכל הפרויקטים בחברה'],
      a: 0,
      w: 'בנייה חוזרת בכל סביבה מסכנת עקביות (גרסאות תלויות שונות, זמני קימפול שונים). בונים artifact אחד ומקדמים אותו (promote) דרך הסביבות בלי לבנות מחדש.'
    },
    {
      q: 'מהי Immutable Infrastructure?',
      o: ['גישה שבה במקום לעדכן שרתים קיימים, בונים ומחליפים אותם מחדש בכל שינוי', 'תשתית שאסור לגעת בה לעולם מכל סיבה', 'שרת שאין לו הרשאות כתיבה למשתמשים', 'תצורת רשת קבועה שלא ניתן לשנות אחרי היצירה'],
      a: 0,
      w: 'במקום SSH לשרת קיים ולעדכן אותו ידנית (מה שיוצר "snowflake servers"), בונים image/container חדש עם השינוי ומחליפים את הישן - זה עקבי, ניתן לשחזור וקל ל-Rollback.'
    },
    {
      q: 'מה תפקידו של Runner/Agent בפייפליין CI/CD?',
      o: ['המכונה (פיזית, VM או container) שמריצה בפועל את שלבי הפייפליין', 'שרת ה-Git שמארח את המאגר', 'כלי לניהול משתני סביבה וסודות', 'שם קוד לענף הראשי של הפרויקט'],
      a: 0,
      w: 'שרת ה-CI (Jenkins/GitHub/GitLab) מתזמן את העבודה, אבל ה-Runner/Agent הוא זה שבפועל מריץ את הפקודות - build, test, deploy - ויכול לרוץ על תשתית משלכם (self-hosted) או מנוהלת.'
    },
    {
      q: 'מהי המשמעות של "Shift-Left" בהקשר של DevSecOps?',
      o: ['הזזת בדיקות אבטחה ואיכות מוקדם ככל האפשר בתהליך הפיתוח, ולא רק בסוף לפני פרודקשן', 'הזזת הרצת הפייפליין לשעות הלילה בלבד', 'העברת האחריות לאבטחה לצוות התפעול בלבד', 'הרצת בדיקות רק אחרי הפריסה לפרודקשן'],
      a: 0,
      w: '"שמאלה" מתייחס לציר הזמן של התהליך (משמאל לימין: קוד → build → test → deploy). ככל שבודקים אבטחה ואיכות מוקדם יותר, זול וקל יותר לתקן - במקום לגלות פגיעות אחרי שהיא כבר בפרודקשן.'
    },
    {
      q: 'מה ההבדל בין Stage ל-Job בפייפליין (למשל ב-GitLab CI)?',
      o: ['Stage הוא שלב לוגי (build/test/deploy); כל ה-Jobs באותו Stage יכולים לרוץ במקביל', 'Job הוא שלב לוגי ו-Stage הוא פקודה בודדת בתוכו', 'אין הבדל, אלו מונחים זהים לחלוטין', 'Stage תמיד רץ רק אחרי שכל ה-Jobs בכל הפרויקטים הסתיימו'],
      a: 0,
      w: 'Stages מגדירים את הסדר (build לפני test לפני deploy). בתוך כל Stage אפשר להריץ כמה Jobs במקביל - למשל בדיקות יחידה ובדיקות linting יחד באותו שלב test.'
    },
    {
      q: 'למה חשוב לשמור Secrets (כמו API keys) במנגנון ייעודי ולא ישירות בקובץ ה-YAML של הפייפליין?',
      o: ['כי קובץ ה-YAML נשמר בהיסטוריית Git בטקסט גלוי, וחשוף לכל מי שיש לו גישה לקוד', 'כי YAML לא תומך טכנית במחרוזות ארוכות', 'כי זה מאט משמעותית את הרצת הפייפליין', 'זה לא באמת משנה, זו רק מוסכמה סגנונית'],
      a: 0,
      w: 'כל מה שנכתב בקובץ פייפליין נכנס להיסטוריית Git לצמיתות. מנגנוני Secrets (GitHub Secrets, GitLab CI/CD Variables, Vault וכו׳) מצפינים ומזריקים את הערך רק בזמן ריצה, בלי לחשוף אותו בקוד.'
    }
  ];

  /* ============================================================
     מצב 2 - ניחוש פייפליין: קטע YAML/Jenkinsfile + מה בדיוק יקרה
     ============================================================ */
  var PIPELINE_GUESS = [
    {
      code: 'on:\n  push:\n    branches: [main]',
      q: 'אילו אירועים יפעילו את ה-workflow הזה?',
      o: ['רק push ישירות לענף main', 'כל push לכל ענף בפרויקט', 'רק Pull Request שנפתח מול main', 'push וגם pull_request לענף main'],
      a: 0,
      w: 'ה-trigger מוגדר תחת <code>push</code> עם רשימת branches מסוננת - רק push שמגיע ישירות לענף main (למשל אחרי merge) יפעיל את ה-workflow. אירועי pull_request דורשים trigger נפרד.'
    },
    {
      code: 'jobs:\n  build:\n    runs-on: ubuntu-latest\n    steps: [...]\n  deploy:\n    needs: build\n    runs-on: ubuntu-latest\n    steps: [...]',
      q: 'מה מבטיח המפתח <code>needs: build</code> ב-job בשם deploy?',
      o: ['job ה-deploy יתחיל לרוץ רק אחרי ש-job ה-build הסתיים בהצלחה', 'שני ה-jobs ירוצו תמיד במקביל לגמרי', 'build ירוץ רק אחרי שסיים deploy', '<code>needs</code> מוחק את ה-job build לפני ריצה'],
      a: 0,
      w: 'ללא <code>needs</code>, כל ה-jobs ב-GitHub Actions רצים במקביל כברירת מחדל. <code>needs: build</code> יוצר תלות מפורשת - deploy ימתין ל-build, ולא ירוץ בכלל אם build נכשל.'
    },
    {
      code: 'strategy:\n  matrix:\n    node-version: [16, 18, 20]',
      q: 'כמה פעמים ירוץ ה-job המכיל את הבלוק הזה, ואיך?',
      o: ['שלוש פעמים במקביל - פעם אחת לכל גרסת Node שברשימה', 'פעם אחת בלבד, עם הגרסה האחרונה ברשימה', 'שלוש פעמים ברצף, אחת אחרי השנייה', 'רק אם כל שלוש הגרסאות מותקנות מראש על ה-runner'],
      a: 0,
      w: '<code>matrix</code> יוצר הרצות מקבילות (עד למגבלת concurrency) - job נפרד לכל ערך ברשימה. כך בודקים תאימות לכמה גרסאות בבת אחת, בלי לשכפל את ה-YAML ידנית.'
    },
    {
      code: 'deploy-job:\n  stage: deploy\n  script:\n    - ./deploy.sh\n  only:\n    - main',
      q: 'מתי ירוץ deploy-job הזה (סינטקס GitLab CI)?',
      o: ['רק כאשר הפייפליין רץ עבור הענף main', 'בכל ענף, בכל commit שנדחף', 'רק כאשר נוצר tag גרסה', 'הוא לעולם לא ירוץ אוטומטית, רק ידנית'],
      a: 0,
      w: '<code>only: [main]</code> מגביל את הריצה של ה-job הזה בלבד לענף main - jobs אחרים בפייפליין (כמו test) יכולים לרוץ על כל ענף ללא ההגבלה הזו.'
    },
    {
      code: 'build-job:\n  stage: build\n  script:\n    - npm run build\n  artifacts:\n    paths:\n      - dist/\n    expire_in: 1 week',
      q: 'מה קורה לתוצרי ה-build שנשמרו כ-artifacts כעבור שבוע?',
      o: ['GitLab מוחק אותם אוטומטית לאחר תום הזמן שהוגדר ב-expire_in', 'הם נשמרים לצמיתות ללא הגבלה', 'הם נדחפים אוטומטית חזרה למאגר ה-Git', 'הפייפליין ייכשל ברגע שהזמן חולף'],
      a: 0,
      w: '<code>expire_in</code> קובע כמה זמן GitLab שומר את ה-artifacts לפני ניקוי אוטומטי - שימושי כדי לא להציף את שטח האחסון עם build outputs ישנים שאף אחד כבר לא צריך.'
    },
    {
      code: "pipeline {\n  agent any\n  stages { stage('Test') { steps { sh 'npm test' } } }\n  post {\n    failure {\n      mail to: 'team@example.com', subject: 'Build failed'\n    }\n  }\n}",
      q: 'מתי תישלח הודעת המייל שמוגדרת בבלוק ה-post?',
      o: ['רק אם stage כלשהו בפייפליין נכשל', 'בכל הרצה, בין אם הצליחה או נכשלה', 'רק אם הפייפליין הצליח במלואו', 'המייל נשלח מיד לפני שהפייפליין בכלל מתחיל'],
      a: 0,
      w: 'בלוק <code>post { failure { ... } }</code> ב-Jenkinsfile מוגדר לרוץ אך ורק כשהפייפליין (או stage שבו הוא מוגדר) מסתיים בכשל - זו הדרך הנפוצה להתריע לצוות על build שבור.'
    },
    {
      code: "- name: Deploy\n  run: ./deploy.sh\n  env:\n    API_KEY: \\${{ secrets.API_KEY }}",
      q: 'מהיכן מגיע הערך של API_KEY בזמן ריצת ה-step?',
      o: ['ממאגר ה-Secrets המוצפן שהוגדר בהגדרות ה-repository/organization', 'הוא כתוב בגלוי בתוך קובץ ה-YAML עצמו', 'הוא נוצר אוטומטית מחדש בכל הרצה', 'הוא נלקח מקובץ .env שנדחף יחד עם הקוד ל-Git'],
      a: 0,
      w: 'התחביר <code>secrets.API_KEY</code> שולף ערך ממאגר ה-Secrets המוצפן של GitHub - הערך עצמו אף פעם לא מופיע בקוד המקור, רק מוזרק כמשתנה סביבה בזמן ריצה.'
    },
    {
      code: "- uses: actions/cache@v4\n  with:\n    path: ~/.npm\n    key: npm-\\${{ hashFiles('package-lock.json') }}",
      q: 'מה המטרה המרכזית של הצעד הזה בפייפליין?',
      o: ['לשמור ולשחזר תלויות npm בין הרצות שונות, כדי לחסוך זמן התקנה', 'למחוק את תיקיית ה-cache בכל הרצה מחדש', 'להריץ את בדיקות היחידה של הפרויקט', 'לפרוס את האפליקציה ישירות לפרודקשן'],
      a: 0,
      w: '<code>actions/cache</code> שומר תיקיות (כמו <code>~/.npm</code>) בין הרצות לפי מפתח מבוסס תוכן קובץ הנעילה - אם package-lock.json לא השתנה, ההתקנה הבאה תהיה מהירה משמעותית.'
    },
    {
      code: 'deploy-prod:\n  stage: deploy\n  script:\n    - ./deploy.sh prod\n  when: manual\n  only:\n    - main',
      q: 'איך deploy-prod מתנהג בזכות <code>when: manual</code>?',
      o: ['הפייפליין ממתין ללחיצה ידנית של אדם על כפתור ב-GitLab לפני שהשלב הזה רץ', 'השלב רץ אוטומטית מיד אחרי כל שלב אחר בפייפליין', 'השלב רץ באופן קבוע פעם ביום בלבד', 'השלב מדלג את עצמו תמיד ולעולם לא רץ'],
      a: 0,
      w: '<code>when: manual</code> הופך את ה-job לכזה שממתין להפעלה ידנית בממשק ה-GitLab - זו הדרך המקובלת לממש Continuous Delivery (מוכן לפריסה, אך דורש אישור אדם) במקום Deployment אוטומטי מלא.'
    },
    {
      code: "stage('Build Image') {\n  steps {\n    sh 'docker build -t myapp:\\${env.BUILD_NUMBER} .'\n  }\n}",
      q: 'מה ייחודי בתיוג (tag) של ה-Docker image שנוצר בשלב הזה?',
      o: ['כל build מקבל תג ייחודי לפי מספר ה-build של Jenkins, כך שאפשר להבחין בין גרסאות', 'התג תמיד יהיה latest בלי קשר למספר ה-build', 'ה-image לא מקבל שום תג ונשאר ללא שם', 'התג נקבע לפי שם המשתמש שהריץ את הפייפליין ידנית'],
      a: 0,
      w: '<code>env.BUILD_NUMBER</code> הוא משתנה מובנה ב-Jenkins שעולה ב-1 בכל הרצה. שימוש בו בתיוג ה-image מבטיח שלכל build יש זהות ייחודית ומעקב ברור, בניגוד לתיוג קבוע כמו latest.'
    },
    {
      code: 'on:\n  pull_request:\n    types: [opened, synchronize]',
      q: 'מתי בדיוק יופעל ה-workflow הזה?',
      o: ['כשנפתח Pull Request חדש, וגם בכל push נוסף לענף המקור של אותו PR', 'רק ברגע שה-PR נסגר ללא מיזוג', 'רק ברגע שה-PR ממוזג לענף היעד', 'בכל push לכל ענף בפרויקט, גם ללא כל PR'],
      a: 0,
      w: '<code>types: [opened, synchronize]</code> מגביל את ה-trigger לשני אירועים ספציפיים: פתיחת PR חדש (opened) ועדכון קוד קיים ב-PR פתוח (synchronize) - כך רצות בדיקות בכל שינוי לפני מיזוג.'
    },
    {
      code: 'flaky-test:\n  stage: test\n  script:\n    - npm run test:e2e\n  retry: 2',
      q: 'מה עושה בדיוק <code>retry: 2</code> כאן?',
      o: ['אם ה-job נכשל, GitLab ינסה להריץ אותו שוב עד 2 פעמים נוספות לפני שיסומן ככשל סופי', 'ה-job ירוץ תמיד 2 פעמים בכל מקרה, גם אם הצליח בפעם הראשונה', 'ה-job ימתין 2 דקות לפני שמתחיל בכלל', 'ה-job יבוטל אוטומטית אחרי 2 שניות ריצה'],
      a: 0,
      w: '<code>retry</code> שימושי בעיקר עבור בדיקות "מרצדות" (flaky) כמו E2E שתלויות בתזמון - במקום לסמן כשל אמיתי מיד, GitLab מנסה שוב לפני שקובע שה-job נכשל סופית.'
    },
    {
      code: 'jobs:\n  test:\n    runs-on: ubuntu-latest\n    timeout-minutes: 10',
      q: 'מה קורה אם ה-job בשם test רץ יותר מ-10 דקות?',
      o: ['GitHub Actions מבטל את ה-job אוטומטית ומסמן אותו ככשל', 'הפייפליין ממשיך לרוץ בלי שום הגבלת זמן', 'ה-job מתחיל את עצמו מחדש אוטומטית מהתחלה', 'נשלחת רק אזהרה, בלי לבטל בפועל את ה-job'],
      a: 0,
      w: '<code>timeout-minutes</code> מגן מפני jobs תקועים (למשל תהליך שנתקע בלי סוף) שיכולים לצרוך זמן runner ללא הגבלה - אחרי חריגה מהזמן, GitHub Actions מבטל ומסמן כשל.'
    }
  ];

  /* ============================================================
     מצב 3 - השלמת פייפליין: YAML/Jenkinsfile עם חלק חסר להשלמה
     ============================================================ */
  var PIPELINE_COMPLETE = [
    {
      code: 'on:\n  ___:\n    branches: [main]',
      q: 'מה משלים את המפתח כדי שה-workflow יופעל בכל push לענף main?',
      o: ['<code>push</code>', '<code>pull_request</code>', '<code>schedule</code>', '<code>workflow_dispatch</code>'],
      a: 0,
      w: '<code>push</code> הוא אחד מאירועי ה-trigger הבסיסיים ביותר ב-GitHub Actions - הוא מופעל בכל push לענפים המוגדרים תחתיו.'
    },
    {
      code: 'jobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - run: npm ___',
      q: 'איזו פקודת npm מריצה את בדיקות הפרויקט?',
      o: ['<code>test</code>', '<code>ci</code>', '<code>build</code>', '<code>install</code>'],
      a: 0,
      w: '<code>npm test</code> מריצה את הסקריפט המוגדר תחת <code>"test"</code> בקובץ package.json - זו המוסכמה הסטנדרטית להרצת בדיקות בפרויקטי Node.js.'
    },
    {
      code: 'jobs:\n  deploy:\n    ___: test\n    runs-on: ubuntu-latest',
      q: 'מה משלים את המפתח כדי ש-deploy ירוץ רק אחרי שה-job בשם test הסתיים בהצלחה?',
      o: ['<code>needs</code>', '<code>depends</code>', '<code>after</code>', '<code>requires</code>'],
      a: 0,
      w: '<code>needs</code> יוצר תלות מפורשת בין jobs ב-GitHub Actions - בלעדיו כל ה-jobs רצים במקביל כברירת מחדל, ללא סדר מובטח.'
    },
    {
      code: '___:\n  - build\n  - test\n  - deploy',
      q: 'מהו המפתח שמגדיר את סדר השלבים הלוגי בפייפליין GitLab CI?',
      o: ['<code>stages</code>', '<code>jobs</code>', '<code>steps</code>', '<code>order</code>'],
      a: 0,
      w: '<code>stages</code> קובע ברמת הקובץ הראשי את סדר ריצת השלבים - כל ה-jobs שמשויכים לאותו שלב ירוצו במקביל, והשלבים עצמם רצים בזה אחר זה.'
    },
    {
      code: 'test-job:\n  ___: test\n  script:\n    - npm test',
      q: 'איזה מפתח משייך את test-job לשלב test שהוגדר ב-stages למעלה?',
      o: ['<code>stage</code>', '<code>phase</code>', '<code>group</code>', '<code>step</code>'],
      a: 0,
      w: '<code>stage</code> (ביחיד) הוא המפתח בתוך הגדרת job שקושר אותו לאחד השמות שהופיעו ברשימת <code>stages</code> (ברבים) בראש הקובץ.'
    },
    {
      code: 'deploy-job:\n  stage: deploy\n  script:\n    - ./deploy.sh\n  only:\n    - ___',
      q: 'מה משלים את הרשימה כדי ש-deploy-job ירוץ רק כאשר מדובר בענף main?',
      o: ['<code>main</code>', '<code>all</code>', '<code>*</code>', '<code>HEAD</code>'],
      a: 0,
      w: 'תחת <code>only</code> מציינים במפורש את שמות הענפים (או תגיות) שעבורם ה-job ירוץ - כתיבת <code>main</code> מגבילה את הפריסה לענף הזה בלבד.'
    },
    {
      code: 'pipeline {\n  ___ any\n  stages { ... }\n}',
      q: 'מה משלים את הבלוק כדי שהפייפליין ירוץ על כל agent זמין ב-Jenkins?',
      o: ['<code>agent</code>', '<code>node</code>', '<code>runner</code>', '<code>executor</code>'],
      a: 0,
      w: '<code>agent any</code> הוא בלוק חובה ב-Declarative Pipeline שאומר ל-Jenkins להריץ על כל agent זמין, בלי דרישה לתווית (label) ספציפית.'
    },
    {
      code: "stage('Build') {\n  steps {\n    ___ 'mvn clean package'\n  }\n}",
      q: 'מה משלים את הפקודה כדי להריץ פקודת shell (Linux) ב-Jenkinsfile?',
      o: ['<code>sh</code>', '<code>bat</code>', '<code>run</code>', '<code>exec</code>'],
      a: 0,
      w: '<code>sh</code> מריץ פקודת shell על agent מבוסס Unix/Linux. המקבילה עבור Windows agents היא <code>bat</code>.'
    },
    {
      code: 'env:\n  API_KEY: \\${{ ___.API_KEY }}',
      q: 'מהיכן שולפים ב-GitHub Actions ערך סודי שהוגדר בהגדרות ה-repository?',
      o: ['<code>secrets</code>', '<code>env</code>', '<code>vars</code>', '<code>inputs</code>'],
      a: 0,
      w: '<code>secrets.API_KEY</code> שולף ערך ממאגר ה-Secrets המוצפן של GitHub - ההבדל מ-<code>vars</code> הוא ש-secrets מוסתרים גם בלוגים של הריצה.'
    },
    {
      code: '- name: Build and push\n  uses: docker/build-push-action@v5\n  with:\n    push: ___\n    tags: myapp:latest',
      q: 'מה משלים את הערך כדי שהפעולה גם תדחוף (push) את ה-image ל-registry ולא רק תבנה אותו?',
      o: ['<code>true</code>', '<code>false</code>', '<code>"yes-build"</code>', '<code>null</code>'],
      a: 0,
      w: 'הפרמטר <code>push</code> ב-docker/build-push-action הוא boolean - <code>true</code> אומר לפעולה גם לדחוף את ה-image שנבנה ל-registry המוגדר, ולא רק לבנות אותו מקומית.'
    },
    {
      code: 'jobs:\n  test:\n    runs-on: ubuntu-latest\n    ___:\n      matrix:\n        node-version: [18, 20]',
      q: 'מה משלים את המפתח שמגדיר הרצת ה-job מספר פעמים עם ערכים שונים?',
      o: ['<code>strategy</code>', '<code>matrix-config</code>', '<code>parallel</code>', '<code>loop</code>'],
      a: 0,
      w: '<code>strategy</code> הוא המפתח החיצוני שמכיל בתוכו את <code>matrix</code> - יחד הם יוצרים הרצה מקבילה של ה-job לכל שילוב ערכים ברשימה.'
    },
    {
      code: '- uses: actions/upload-___@v4\n  with:\n    name: build-output\n    path: dist/',
      q: 'מה משלים את שם ה-Action ששומר תוצרי build כ-artifact להורדה או לשימוש בהמשך הפייפליין?',
      o: ['<code>artifact</code>', '<code>cache</code>', '<code>release</code>', '<code>checkout</code>'],
      a: 0,
      w: '<code>actions/upload-artifact</code> שומר קבצים או תיקיות מה-job הנוכחי, כדי שיהיו זמינים להורדה מה-run summary או לשימוש ב-job אחר עם <code>download-artifact</code>.'
    },
    {
      code: 'build-image:\n  stage: build\n  image: docker:24\n  ___:\n    - docker:24-dind\n  script:\n    - docker build -t myapp .',
      q: 'מה משלים את המפתח שמריץ שירות Docker-in-Docker הנחוץ כדי לבנות images בתוך job ב-GitLab CI?',
      o: ['<code>services</code>', '<code>includes</code>', '<code>extends</code>', '<code>needs</code>'],
      a: 0,
      w: '<code>services</code> מריץ container נלווה (כאן <code>docker:24-dind</code>) לצד ה-job הראשי - נדרש כדי שהפקודה <code>docker build</code> תוכל לתקשר עם דמון Docker בזמן ריצה בתוך container.'
    }
  ];

  /* ============================================================
     מצב 4 - התאמת מושגים: סבבים של זוגות מונח/כלי + תיאור
     ============================================================ */
  var MATCH_ROUNDS = [
    {
      title: 'מושגי ליבה ב-CI/CD',
      pairs: [
        { l: 'Pipeline', r: 'תהליך אוטומטי שלם המורכב משלבים (Stages) שרצים על כל שינוי בקוד' },
        { l: 'Stage', r: 'שלב לוגי בפייפליין, למשל build/test/deploy' },
        { l: 'Job', r: 'יחידת עבודה בודדת שרצה בתוך Stage מסוים' },
        { l: 'Artifact', r: 'תוצר בנוי שנשמר ומועבר בין שלבים או להורדה' },
        { l: 'Runner / Agent', r: 'המכונה שמריצה בפועל את שלבי הפייפליין' }
      ]
    },
    {
      title: 'GitHub Actions',
      pairs: [
        { l: 'Workflow', r: 'קובץ YAML תחת .github/workflows שמגדיר תהליך אוטומטי שלם' },
        { l: 'Event', r: 'טריגר שמפעיל workflow, כמו push או pull_request' },
        { l: 'Action', r: 'יחידת קוד לשימוש חוזר, למשל actions/checkout@v4' },
        { l: 'Secrets', r: 'ערכים רגישים מוצפנים המוגדרים בהגדרות ה-repository' },
        { l: 'Matrix Strategy', r: 'הרצת אותו job מספר פעמים עם שילובי פרמטרים שונים' }
      ]
    },
    {
      title: 'אסטרטגיות פריסה (Deployment)',
      pairs: [
        { l: 'Blue-Green', r: 'שתי סביבות זהות, החלפת תעבורה מיידית מהישנה לחדשה' },
        { l: 'Canary', r: 'פריסה הדרגתית לפלח קטן ממשתמשים לפני הרחבה מלאה' },
        { l: 'Rolling Update', r: 'החלפת instances בהדרגה אחד-אחד, ללא נפילה מלאה של השירות' },
        { l: 'Recreate', r: 'עצירת כל הגרסה הישנה לפני הפעלת החדשה, כרוך ב-downtime' },
        { l: 'Feature Flag', r: 'מתג המפריד בין Deploy ל-Release ומאפשר להסתיר פיצ׳ר בפרודקשן' }
      ]
    },
    {
      title: 'DevSecOps ואבטחת פייפליין',
      pairs: [
        { l: 'SAST', r: 'סריקת קוד המקור לפגיעויות בלי להריץ את התוכנה בפועל' },
        { l: 'DAST', r: 'בדיקת אבטחה על אפליקציה רצה, מדמה תקיפה מבחוץ' },
        { l: 'SCA', r: 'סריקת תלויות/ספריות open-source לאיתור פגיעויות ידועות' },
        { l: 'Secret Scanning', r: 'איתור מפתחות/סיסמאות שהוזלגו בטעות לתוך הקוד המאוחסן' },
        { l: 'Shift-Left', r: 'הזזת בדיקות אבטחה ואיכות מוקדם ככל האפשר בתהליך הפיתוח' }
      ]
    }
  ];

  /* ============================================================
     מצב 5 - סידור תהליך: סבבים של שלבים לסידור בסדר הנכון
     ============================================================ */
  var ORDER_ROUNDS = [
    {
      title: 'מסע קוד מלא: מ-commit ועד Production',
      steps: [
        'מפתח מבצע commit ו-push לענף feature',
        'ה-push מפעיל טריגר שמריץ את הפייפליין אוטומטית',
        'שלבי Build ו-Unit Tests רצים על הקוד החדש',
        'נפתח Pull Request, עובר code review וכל בדיקות ה-CI',
        'מיזוג ה-PR ל-main מפעיל פייפליין נוסף שבונה ופורס ל-Staging',
        'לאחר אישור/בדיקה נוספת, הפריסה מגיעה ל-Production'
      ]
    },
    {
      title: 'GitHub Actions: מ-Trigger ועד Deploy',
      steps: [
        'push לענף main מפעיל את ה-workflow',
        'ה-job test רץ עם actions/checkout ו-npm ci',
        'הרצת npm test - אם נכשל, הפייפליין עוצר כאן',
        'ה-job build-and-push (עם needs: test) בונה Docker image',
        'ה-image נדחף ל-container registry (למשל GHCR)',
        'ה-job deploy מושך את ה-image החדש ופורס לסביבת היעד'
      ]
    },
    {
      title: 'פריסת Canary שלב אחר שלב',
      steps: [
        'בניית ה-image/artifact החדש ומעבר מלא בשלבי ה-CI',
        'פריסת הגרסה החדשה למספר קטן של instances/משתמשים בלבד',
        'ניטור מדדים - שיעור שגיאות, latency - על הפלח הקטן',
        'אם המדדים תקינים, הרחבה הדרגתית לאחוזים גדולים יותר ממשתמשים',
        'הרחבה מלאה ל-100% מהתעבורה לגרסה החדשה'
      ]
    },
    {
      title: 'טיפול בכשל בפרודקשן ו-Rollback',
      steps: [
        'Deploy אוטומטי לפרודקשן לאחר מעבר כל בדיקות ה-CI',
        'מערכת הניטור/Alerting מזהה עלייה חריגה בשיעור השגיאות',
        'צוות התפעול מאשר שהתקלה קשורה לגרסה החדשה שנפרסה',
        'הרצת Rollback לגרסה היציבה שהייתה בפרודקשן לפני כן',
        'אימות שהמערכת חזרה למצב תקין דרך הניטור',
        'פתיחת retrospective/postmortem לניתוח הסיבה השורשית'
      ]
    }
  ];

  /* ============================================================
     הגדרת מצבי המשחק
     ============================================================ */
  var MODES = [
    { key: 'rapid', icon: '⚡', name: 'קרב מהיר', desc: 'שאלות ידע כלליות על עקרונות ומושגי CI/CD - כמה תספיקו לפני שהזמן נגמר?', type: 'quiz', data: RAPID, sample: 10, time: 20000 },
    { key: 'guess', icon: '🔍', name: 'ניחוש פייפליין', desc: 'קטע YAML או Jenkinsfile של פייפליין - מה בדיוק יקרה כשהוא ירוץ?', type: 'quiz', data: PIPELINE_GUESS, sample: 8, time: 28000, showCode: true },
    { key: 'complete', icon: '🧩', name: 'השלמת פייפליין', desc: 'קטע YAML או Jenkinsfile עם חלק חסר - בחרו מה משלים אותו נכון', type: 'quiz', data: PIPELINE_COMPLETE, sample: 8, time: 28000, showCode: true },
    { key: 'match', icon: '🔗', name: 'התאמת מושגים', desc: 'התאימו כל מושג/כלי CI/CD לתיאור הנכון שלו', type: 'match', data: MATCH_ROUNDS, sample: 2 },
    { key: 'order', icon: '📋', name: 'סידור תהליך', desc: 'סדרו את שלבי התהליך לפי הסדר הנכון', type: 'order', data: ORDER_ROUNDS, sample: 2 }
  ];

  window.TG_CONFIG = { gameId: "cicd", modes: MODES };
})();
</script>

<script src="/scripts/topic-game.js"></script>
