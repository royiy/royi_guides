---
title: "מבוא ל-CI/CD – מושגי יסוד"
description: "מושגי היסוד של CI/CD: ההבדל בין Continuous Delivery ל-Continuous Deployment, שלבי pipeline טיפוסי, ותרשים זרימה מלא מ-push ועד פרודקשן על AWS ו-Kubernetes."
category: DevOps/CI-CD
part: 1/10
---

## מה זה CI/CD?

**CI (Continuous Integration – אינטגרציה רציפה)** הוא תהליך שבו מפתחים משלבים (merge) קוד לענף משותף (בדרך כלל `main`) לעיתים קרובות – כמה פעמים ביום. בכל שילוב כזה, מריצים אוטומטית:
- בנייה (Build) של הקוד
- בדיקות יחידה (Unit Tests)
- בדיקות סטטיות (Linting, Static Analysis)

המטרה: לתפוס באגים ובעיות אינטגרציה מוקדם ככל האפשר, ולא לחכות "לרגע האינטגרציה הגדול" בסוף הפרויקט.

**CD** יכול להתפרש בשתי דרכים:
- **Continuous Delivery (מסירה רציפה)** – כל שינוי שעובר את שלב ה-CI מוכן לפריסה, אך הפריסה בפועל לסביבת הפרודקשן דורשת אישור ידני (Manual Approval).
- **Continuous Deployment (פריסה רציפה)** – כל שינוי שעובר את כל שלבי הבדיקה נפרס אוטומטית לפרודקשן, ללא התערבות אדם.

## למה זה חשוב?

1. **מהירות** – שחרור פיצ'רים ותיקוני באגים תוך דקות במקום שבועות.
2. **איכות** – בדיקות אוטומטיות רצות על כל שינוי, כך שבאגים נתפסים מיד.
3. **צמצום סיכון** – שינויים קטנים ותכופים קלים יותר לניפוי (debug) משחרור ענק חד-פעמי.
4. **שקיפות** – כל הצוות רואה את מצב הבנייה (build status) בזמן אמת.

## אנטומיה של Pipeline טיפוסי

```
קוד -> Push ל-Git -> Trigger -> Build -> Test -> Package -> Deploy to Staging -> בדיקות נוספות -> Deploy to Production
```

### שלבים נפוצים (Stages)

| שלב | תיאור | דוגמה לכלים |
|---|---|---|
| Checkout | משיכת הקוד מה-Repository | Git |
| Build | קומפילציה/בנייה של האפליקציה | Maven, Gradle, npm, webpack |
| Unit Test | בדיקות יחידה | JUnit, Jest, PyTest |
| Static Analysis | סריקת קוד לאיכות ואבטחה | SonarQube, ESLint |
| Package | יצירת ארטיפקט (jar, docker image) | Docker, npm pack |
| Deploy to Staging | פריסה לסביבת בדיקות | Kubernetes, Ansible |
| Integration/E2E Tests | בדיקות מקצה לקצה | Selenium, Cypress, Playwright |
| Deploy to Production | פריסה לסביבת ייצור | ArgoCD, Spinnaker, Helm |

## תרשים זרימה מלא: מ-Push ועד לפרודקשן (דוגמה מבוססת AWS + Kubernetes)

מעבר לאנטומיה הגנרית שלמעלה, כך נראית זרימה מלאה של פרויקט אמיתי שרץ על Docker, Kubernetes ו-AWS:

<div class="cicdflow">

<div class="cicdflow-row">
  <div class="cicdflow-box is-green">
    <div class="cicdflow-box-header">1. מפתח</div>
    <div class="cicdflow-box-body">המפתח כותב קוד ומבצע (commit) שינויים למאגר המקומי.</div>
  </div>
  <div class="cicdflow-arrow-h">&#8592;</div>
  <div class="cicdflow-icon-col">
    <div class="cicdflow-icon-circle is-green">
      <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="4.5" width="18" height="12" rx="1.2"></rect>
        <line x1="2" y1="19.5" x2="22" y2="19.5"></line>
        <polyline points="9 9 7 11 9 13"></polyline>
        <polyline points="15 9 17 11 15 13"></polyline>
      </svg>
    </div>
    <div class="cicdflow-icon-label">מפתח</div>
  </div>
  <div class="cicdflow-arrow-h">&#8592;</div>
  <div class="cicdflow-box is-green">
    <div class="cicdflow-box-header">מה זה עושה?</div>
    <div class="cicdflow-box-body">המפתח כותב קוד בסביבת הפיתוח (IDE) ומבצע commit לשינויים במאגר ה-Git.</div>
  </div>
</div>
<div class="cicdflow-arrow-v">&#8595;</div>

<div class="cicdflow-row">
  <div class="cicdflow-box is-blue">
    <div class="cicdflow-box-header">2. GitHub</div>
    <div class="cicdflow-box-body">הקוד נדחף (push) למאגר ה-GitHub, לצורך ניהול גרסאות ושיתוף פעולה.</div>
  </div>
  <div class="cicdflow-arrow-h">&#8592;</div>
  <div class="cicdflow-icon-col">
    <div class="cicdflow-icon-circle is-blue">
      <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="6" cy="6" r="2.3"></circle>
        <circle cx="6" cy="18" r="2.3"></circle>
        <circle cx="18" cy="9.5" r="2.3"></circle>
        <path d="M6 8.3 V15.7"></path>
        <path d="M8.1 6 Q18 6 18 7.2"></path>
      </svg>
    </div>
    <div class="cicdflow-icon-label">GitHub</div>
  </div>
  <div class="cicdflow-arrow-h">&#8592;</div>
  <div class="cicdflow-box is-blue">
    <div class="cicdflow-box-header">מה זה עושה?</div>
    <div class="cicdflow-box-body">GitHub שומר את הקוד ומנהל גרסאות, ענפים (branches) ובקשות משיכה (pull requests).</div>
  </div>
</div>
<div class="cicdflow-arrow-v">&#8595;</div>

<div class="cicdflow-row">
  <div class="cicdflow-box is-purple">
    <div class="cicdflow-box-header">3. GitHub Actions</div>
    <div class="cicdflow-box-body">צינור ה-CI מופעל אוטומטית בכל push או pull request.</div>
  </div>
  <div class="cicdflow-arrow-h">&#8592;</div>
  <div class="cicdflow-icon-col">
    <div class="cicdflow-icon-circle is-purple">
      <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="3.2"></circle>
        <circle cx="12" cy="12" r="7.6"></circle>
        <line x1="12" y1="2.6" x2="12" y2="4.9"></line>
        <line x1="12" y1="19.1" x2="12" y2="21.4"></line>
        <line x1="2.6" y1="12" x2="4.9" y2="12"></line>
        <line x1="19.1" y1="12" x2="21.4" y2="12"></line>
        <line x1="5.4" y1="5.4" x2="7" y2="7"></line>
        <line x1="17" y1="17" x2="18.6" y2="18.6"></line>
        <line x1="18.6" y1="5.4" x2="17" y2="7"></line>
        <line x1="7" y1="17" x2="5.4" y2="18.6"></line>
      </svg>
    </div>
    <div class="cicdflow-icon-label">GitHub Actions / Jenkins</div>
  </div>
  <div class="cicdflow-arrow-h">&#8592;</div>
  <div class="cicdflow-box is-purple">
    <div class="cicdflow-box-header">מה זה עושה?</div>
    <div class="cicdflow-box-body">מפעיל אוטומטית את הצינור לבנייה, בדיקה ואימות של הקוד.</div>
  </div>
</div>
<div class="cicdflow-arrow-v">&#8595;</div>

<div class="cicdflow-row">
  <div class="cicdflow-box is-green">
    <div class="cicdflow-box-header">4. אימות קוד</div>
    <div class="cicdflow-box-body">מספר שערי איכות ובדיקות שונות רצים במקביל.</div>
  </div>
  <div class="cicdflow-arrow-h">&#8592;</div>
  <div class="cicdflow-icon-col">
    <div class="cicdflow-icon-circle is-green">
      <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 3 L19 6 V11 C19 16 16 19.3 12 21 C8 19.3 5 16 5 11 V6 Z"></path>
        <polyline points="8.5 12 10.8 14.3 15.3 9.5"></polyline>
      </svg>
    </div>
    <div class="cicdflow-icon-label">Unit Test &middot; SonarQube &middot; Trivy</div>
  </div>
  <div class="cicdflow-arrow-h">&#8592;</div>
  <div class="cicdflow-box is-green">
    <div class="cicdflow-box-header">מה זה עושה?</div>
    <div class="cicdflow-box-body">בדיקות היחידה מוודאות תקינות, SonarQube בודק איכות קוד, ו-Trivy סורק פרצות אבטחה.</div>
  </div>
</div>
<div class="cicdflow-arrow-v">&#8595;</div>

<div class="cicdflow-row">
  <div class="cicdflow-box is-blue">
    <div class="cicdflow-box-header">5. בניית Docker</div>
    <div class="cicdflow-box-body">נבנית תמונת Docker לאפליקציה באמצעות Dockerfile.</div>
  </div>
  <div class="cicdflow-arrow-h">&#8592;</div>
  <div class="cicdflow-icon-col">
    <div class="cicdflow-icon-circle is-blue">
      <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 3 L20 7.5 V16.5 L12 21 L4 16.5 V7.5 Z"></path>
        <path d="M4 7.5 L12 12 L20 7.5"></path>
        <line x1="12" y1="12" x2="12" y2="21"></line>
      </svg>
    </div>
    <div class="cicdflow-icon-label">Docker Build</div>
  </div>
  <div class="cicdflow-arrow-h">&#8592;</div>
  <div class="cicdflow-box is-blue">
    <div class="cicdflow-box-header">מה זה עושה?</div>
    <div class="cicdflow-box-body">יוצר תמונת Docker לאפליקציה על בסיס הוראות ה-Dockerfile.</div>
  </div>
</div>
<div class="cicdflow-arrow-v">&#8595;</div>

<div class="cicdflow-row">
  <div class="cicdflow-box is-purple">
    <div class="cicdflow-box-header">6. Amazon ECR</div>
    <div class="cicdflow-box-body">תמונת ה-Docker נדחפת ל-Amazon ECR לצורך אחסון מאובטח.</div>
  </div>
  <div class="cicdflow-arrow-h">&#8592;</div>
  <div class="cicdflow-icon-col">
    <div class="cicdflow-icon-circle is-purple">
      <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M6.5 17h11a3.5 3.5 0 0 0 0-7 5.5 5.5 0 0 0-10.6-1.7A4 4 0 0 0 6.5 17Z"></path>
      </svg>
    </div>
    <div class="cicdflow-icon-label">Amazon ECR</div>
  </div>
  <div class="cicdflow-arrow-h">&#8592;</div>
  <div class="cicdflow-box is-purple">
    <div class="cicdflow-box-header">מה זה עושה?</div>
    <div class="cicdflow-box-body">שומר את תמונת ה-Docker בצורה מאובטחת במאגר הפרטי של Amazon ECR.</div>
  </div>
</div>
<div class="cicdflow-arrow-v">&#8595;</div>

<div class="cicdflow-row">
  <div class="cicdflow-box is-green">
    <div class="cicdflow-box-header">7. Terraform + Ansible</div>
    <div class="cicdflow-box-body">Terraform מקצה את התשתית, ו-Ansible מגדיר את השרתים.</div>
  </div>
  <div class="cicdflow-arrow-h">&#8592;</div>
  <div class="cicdflow-icon-col">
    <div class="cicdflow-icon-circle is-green">
      <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="12,3.2 20.5,8 12,12.8 3.5,8"></polygon>
        <polyline points="3.5 13.2 12 18 20.5 13.2"></polyline>
      </svg>
    </div>
    <div class="cicdflow-icon-label">Terraform + Ansible</div>
  </div>
  <div class="cicdflow-arrow-h">&#8592;</div>
  <div class="cicdflow-box is-green">
    <div class="cicdflow-box-header">מה זה עושה?</div>
    <div class="cicdflow-box-body">Terraform מקצה תשתית בענן, ו-Ansible מתקין ומגדיר את השרתים. <strong>לתשומת לב:</strong> בפועל שלב זה רץ בתדירות נמוכה בהרבה משלבי ה-CI של האפליקציה עצמה, ולרוב מנוהל בפייפליין IaC נפרד – לא בכל push.</div>
  </div>
</div>
<div class="cicdflow-arrow-v">&#8595;</div>

<div class="cicdflow-row">
  <div class="cicdflow-box is-blue">
    <div class="cicdflow-box-header">8. Amazon EKS</div>
    <div class="cicdflow-box-body">אשכול Kubernetes מוכן, עם צמתי עבודה, רשת וכל הרכיבים המרכזיים.</div>
  </div>
  <div class="cicdflow-arrow-h">&#8592;</div>
  <div class="cicdflow-icon-col">
    <div class="cicdflow-icon-circle is-blue">
      <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="12,3 19,7 19,15 12,19 5,15 5,7"></polygon>
        <circle cx="12" cy="11" r="1.5" fill="currentColor" stroke="none"></circle>
        <line x1="12" y1="3" x2="12" y2="9.6"></line>
        <line x1="19" y1="7" x2="13.4" y2="10.3"></line>
        <line x1="19" y1="15" x2="13.4" y2="11.9"></line>
        <line x1="12" y1="19" x2="12" y2="12.4"></line>
        <line x1="5" y1="15" x2="10.6" y2="11.9"></line>
        <line x1="5" y1="7" x2="10.6" y2="10.3"></line>
      </svg>
    </div>
    <div class="cicdflow-icon-label">Amazon EKS</div>
  </div>
  <div class="cicdflow-arrow-h">&#8592;</div>
  <div class="cicdflow-box is-blue">
    <div class="cicdflow-box-header">מה זה עושה?</div>
    <div class="cicdflow-box-body">שירות Kubernetes מנוהל להרצת אפליקציות בקונטיינרים בקנה מידה גדול.</div>
  </div>
</div>
<div class="cicdflow-arrow-v">&#8595;</div>

<div class="cicdflow-row">
  <div class="cicdflow-box is-purple">
    <div class="cicdflow-box-header">9. Helm / Argo CD</div>
    <div class="cicdflow-box-body">האפליקציה נפרסת ל-Kubernetes באמצעות Helm charts או Argo CD.</div>
  </div>
  <div class="cicdflow-arrow-h">&#8592;</div>
  <div class="cicdflow-icon-col">
    <div class="cicdflow-icon-circle is-purple">
      <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 3 L15 13 L9 13 Z"></path>
        <circle cx="12" cy="8.6" r="1.3" fill="currentColor" stroke="none"></circle>
        <path d="M9 13 L6.6 16 L9 15.3"></path>
        <path d="M15 13 L17.4 16 L15 15.3"></path>
        <path d="M10 13 L9.4 19.2 L12 17.1 L14.6 19.2 L14 13"></path>
      </svg>
    </div>
    <div class="cicdflow-icon-label">Helm / Argo CD</div>
  </div>
  <div class="cicdflow-arrow-h">&#8592;</div>
  <div class="cicdflow-box is-purple">
    <div class="cicdflow-box-header">מה זה עושה?</div>
    <div class="cicdflow-box-body">פורס את האפליקציה באמצעות Helm charts, או בשיטת GitOps עם Argo CD.</div>
  </div>
</div>
<div class="cicdflow-arrow-v">&#8595;</div>

<div class="cicdflow-row">
  <div class="cicdflow-box is-green">
    <div class="cicdflow-box-header">10. משתמשים</div>
    <div class="cicdflow-box-body">המשתמשים ניגשים לאפליקציה דרך Load Balancer בצורה מאובטחת.</div>
  </div>
  <div class="cicdflow-arrow-h">&#8592;</div>
  <div class="cicdflow-icon-col">
    <div class="cicdflow-icon-circle is-green">
      <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="8.7" cy="8" r="2.7"></circle>
        <circle cx="16.2" cy="9.2" r="2.1"></circle>
        <path d="M3.3 19c0-3 2.3-5.2 5.4-5.2s5.4 2.2 5.4 5.2"></path>
        <path d="M13.6 19c0-2.3 1.5-4.1 3.6-4.5"></path>
      </svg>
    </div>
    <div class="cicdflow-icon-label">משתמשים</div>
  </div>
  <div class="cicdflow-arrow-h">&#8592;</div>
  <div class="cicdflow-box is-green">
    <div class="cicdflow-box-header">מה זה עושה?</div>
    <div class="cicdflow-box-body">משתמשים ניגשים לאפליקציה דרך כתובת מאובטחת (URL), דרך ה-Load Balancer.</div>
  </div>
</div>
<div class="cicdflow-arrow-v">&#8595;</div>

<div class="cicdflow-row">
  <div class="cicdflow-box is-blue">
    <div class="cicdflow-box-header">11. Observability</div>
    <div class="cicdflow-box-body">מדדים, לוגים ועקבות (traces) נאספים מהאפליקציה ומהתשתית.</div>
  </div>
  <div class="cicdflow-arrow-h">&#8592;</div>
  <div class="cicdflow-icon-col">
    <div class="cicdflow-icon-circle is-blue">
      <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="4.2" width="18" height="13" rx="1.2"></rect>
        <polyline points="6 13 9.4 9 12.4 11.5 17.2 6.3"></polyline>
        <line x1="8" y1="20.2" x2="16" y2="20.2"></line>
        <line x1="12" y1="17.2" x2="12" y2="20.2"></line>
      </svg>
    </div>
    <div class="cicdflow-icon-label">Prometheus / Grafana</div>
  </div>
  <div class="cicdflow-arrow-h">&#8592;</div>
  <div class="cicdflow-box is-blue">
    <div class="cicdflow-box-header">מה זה עושה?</div>
    <div class="cicdflow-box-body">Prometheus אוסף מדדים (metrics) ו-Grafana מציג לוחות בקרה והתראות עליהם. <strong>לתשומת לב:</strong> לאיסוף לוגים ועקבות (traces) נדרשים כלים נוספים (כגון Loki/ELK ו-Jaeger/Tempo) – הם לא נאספים על-ידי Prometheus/Grafana לבדם "מהקופסה".</div>
  </div>
</div>

</div>

> 💡 זוהי דוגמה קונקרטית אחת (Stack מבוסס AWS + Kubernetes) ליישום העקרונות הגנריים שתוארו למעלה. הכלים הספציפיים (Jenkins מול GitHub Actions, ECR מול Docker Hub, EKS מול אשכול K8s עצמאי) משתנים בין ארגונים, אך שלבי הזרימה נשארים דומים.

<style>
.cicdflow { display: flex; flex-direction: column; margin: 1.5rem 0; }
.cicdflow-row { display: flex; align-items: stretch; gap: 10px; }
.cicdflow-box {
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  border: 2px solid var(--theme, var(--sl-color-hairline));
  border-radius: 12px;
  overflow: hidden;
}
.cicdflow-box-header {
  background: var(--theme, var(--sl-color-gray-5));
  color: #fff;
  font-weight: 700;
  font-size: 14px;
  padding: 8px 14px;
}
.cicdflow-box-body {
  background: var(--theme-bg, var(--sl-color-gray-6));
  color: var(--sl-color-text);
  padding: 12px 14px;
  font-size: 13.5px;
  line-height: 1.65;
  flex: 1;
}
.cicdflow-icon-col {
  flex: 0 0 160px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border: 2px solid var(--sl-color-hairline);
  border-radius: 12px;
  padding: 14px 8px;
  background: var(--sl-color-gray-7, var(--sl-color-gray-6));
}
.cicdflow-icon-circle {
  width: 58px;
  height: 58px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--theme, var(--sl-color-hairline));
  background: var(--theme-bg, var(--sl-color-gray-6));
  color: var(--theme, var(--sl-color-text));
  flex-shrink: 0;
}
.cicdflow-icon-label {
  font-weight: 700;
  font-size: 13.5px;
  text-align: center;
  color: var(--sl-color-text);
}
.cicdflow-arrow-h {
  flex: 0 0 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--sl-color-gray-3);
  font-size: 17px;
  direction: ltr;
}
.cicdflow-arrow-v {
  display: flex;
  justify-content: center;
  padding: 5px 0;
  color: var(--sl-color-gray-3);
  font-size: 17px;
}
.is-green { --theme: var(--sl-color-green); --theme-bg: var(--sl-color-green-low); }
.is-blue { --theme: var(--sl-color-blue); --theme-bg: var(--sl-color-blue-low); }
.is-purple { --theme: var(--sl-color-purple); --theme-bg: var(--sl-color-purple-low); }
@media (max-width: 700px) {
  .cicdflow-row { flex-direction: column; gap: 6px; }
  .cicdflow-icon-col { flex: none; width: 100%; }
  .cicdflow-arrow-h { display: none; }
}
</style>

## דוגמה מינימלית – GitHub Actions

```yaml
name: CI Pipeline
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
      - run: npm test
```

## עקרונות מפתח (Best Practices)

- **Fail Fast** – הרץ קודם את הבדיקות המהירות (lint, unit tests) לפני בדיקות איטיות (E2E).
- **Idempotency** – ה-pipeline צריך לתת תוצאה זהה בכל הרצה עם אותו קלט.
- **Pipeline as Code** – הגדרת ה-pipeline צריכה לשבת בקוד (YAML) בתוך ה-repo, לא בהגדרות UI ידניות.
- **Artifact Once, Deploy Everywhere** – בנה ארטיפקט (למשל Docker image) פעם אחת, והשתמש בו בכל הסביבות (dev/staging/prod) כדי להבטיח עקביות.
- **Secrets Management** – לעולם לא לשמור סודות (API keys, passwords) בקוד; להשתמש ב-Secret Managers (Vault, AWS Secrets Manager, GitHub Secrets).

## טיפים וטריקים

1. **Cache תלויות** – שמירת cache של `node_modules`/`.m2`/`pip` מקצרת זמני build משמעותית.
2. **Parallel Jobs** – הרץ בדיקות שונות (unit, lint, security scan) במקביל ולא בסדרה.
3. **Matrix Builds** – בדוק את הקוד על מספר גרסאות (Node 18/20, Python 3.10/3.11) במקביל.
4. **Branch Protection Rules** – אל תאפשר מיזוג ל-`main` בלי שה-CI עבר בהצלחה.
5. **Notifications** – חבר Slack/Teams ל-pipeline כדי לקבל התראות על כשלים מיידית.

## שאלות ראיון עבודה נפוצות

<details class="qa">
<summary>מה ההבדל בין Continuous Delivery ל-Continuous Deployment?</summary>

ב-Delivery יש אישור ידני לפני הפריסה לפרודקשן, ואילו ב-Deployment הפריסה אוטומטית לחלוטין ללא מגע יד אדם, בתנאי שכל הבדיקות עברו.

</details>

<details class="qa">
<summary>מהו "Pipeline as Code" ולמה זה חשוב?</summary>

הגדרת שלבי ה-CI/CD כקובץ קוד (למשל `Jenkinsfile` או `.github/workflows/*.yml`) שנשמר יחד עם הקוד ב-Git. זה מאפשר גרסאות, code review על השינויים בפייפליין עצמו, ושחזור קל.

</details>

<details class="qa">
<summary>מהם היתרונות של CI/CD מבחינת עסקית?</summary>

זמן שחרור (time-to-market) מהיר יותר, פחות באגים בפרודקשן, יכולת rollback מהירה, ושיפור שיתוף הפעולה בין Dev ל-Ops.

</details>

<details class="qa">
<summary>מה זה "Shift Left" בהקשר של CI/CD?</summary>

הזזת בדיקות (איכות, אבטחה) לשלב מוקדם ככל האפשר בתהליך הפיתוח, כדי לתפוס בעיות מוקדם וזול יותר.

</details>

<details class="qa">
<summary>תאר תרחיש שבו pipeline נכשל – איך היית מנפה (debug) אותו?</summary>

בדיקת ה-logs של השלב שנכשל, שחזור מקומי (local reproduction) של הפקודה שנכשלה, בדיקת גרסאות תלויות, ווידוא שאין הבדל סביבתי (env vars, secrets) בין המקומי ל-CI.

</details>

## קישורים חיצוניים

**YouTube:**
- [CI/CD Full Course – Simplilearn](https://www.youtube.com/watch?v=h9K1NnqwUvE)
- [ערוץ TechWorld with Nana – DevOps & CI/CD](https://www.youtube.com/c/TechWorldwithNana)
- [CI/CD Tutorials Playlist](https://www.youtube.com/playlist?list=PLy7NrYWoggjzSIlwxeBbcgfAdYoxCIrM2)

**דוקומנטציה:**
- [Atlassian – CI/CD Explained](https://www.atlassian.com/continuous-delivery/continuous-integration)
- [Red Hat – What is CI/CD?](https://www.redhat.com/en/topics/devops/what-is-ci-cd)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
