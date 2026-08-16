---
title: "DevSecOps, ניטור ו-Best Practices ב-CI/CD"
category: DevOps/CI-CD
part: 10/10
---

## מה זה DevSecOps?

גישה שמשלבת אבטחה (Security) כחלק אינטגרלי מתהליך ה-DevOps, ולא כשלב נפרד בסוף. העיקרון המרכזי: **"Shift Left"** – הזזת בדיקות האבטחה מוקדם ככל האפשר בתהליך, כדי לתפוס בעיות כשהן עדיין זולות לתקן.

## שכבות האבטחה ב-Pipeline

```
קוד -> SAST -> Dependency Scan -> Secret Scan -> Build -> Container Scan -> DAST -> Deploy -> Runtime Security
```

| שכבה | מה בודקת | כלים |
|---|---|---|
| SAST (Static) | פגיעויות בקוד המקור עצמו | SonarQube, Semgrep, CodeQL |
| SCA (Dependency Scan) | פגיעויות בספריות צד שלישי | Snyk, Dependabot, OWASP Dependency-Check |
| Secret Scanning | מפתחות/סיסמאות שנכתבו בטעות בקוד | Gitleaks, TruffleHog, GitHub Secret Scanning |
| Container Scan | פגיעויות ב-Docker image | Trivy, Grype |
| DAST (Dynamic) | תקיפת האפליקציה הרצה (כמו האקר) | OWASP ZAP |
| IaC Scan | תצורות תשתית לא בטוחות | tfsec, Checkov |

## דוגמה: Pipeline עם שכבות אבטחה

```yaml
name: Secure CI/CD Pipeline
on: [push, pull_request]

jobs:
  secret-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - name: Gitleaks Scan
        uses: gitleaks/gitleaks-action@v2

  sast:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: CodeQL Analysis
        uses: github/codeql-action/init@v3
        with:
          languages: javascript
      - uses: github/codeql-action/analyze@v3

  dependency-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Snyk Scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

  build-and-scan-container:
    needs: [secret-scan, sast, dependency-scan]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: docker build -t myapp:${{ github.sha }} .
      - name: Trivy Container Scan
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: 'myapp:${{ github.sha }}'
          exit-code: '1'
          severity: 'CRITICAL,HIGH'
```

## ניטור לאחר Deployment (Observability)

CI/CD לא נגמר ב-deploy – חובה לדעת מה קורה בפועל בפרודקשן:

- **Metrics** – Prometheus + Grafana לניטור ביצועים, שימוש משאבים, error rates.
- **Logs** – ELK Stack (Elasticsearch, Logstash, Kibana) או Loki לריכוז לוגים.
- **Traces** – Jaeger / OpenTelemetry למעקב אחר בקשות בין microservices.
- **Alerting** – Alertmanager / PagerDuty להתראה כשמטריקה חורגת מסף.

```yaml
# דוגמה: הפעלת Smoke Test אוטומטי מיד אחרי deploy, עם Rollback אוטומטי בכשלון
- name: Deploy
  run: kubectl apply -f k8s/production/

- name: Smoke Test
  run: |
    sleep 15
    curl -f https://myapp.com/health || exit 1

- name: Rollback on Failure
  if: failure()
  run: kubectl rollout undo deployment/myapp -n production
```

## DORA Metrics – מדדי ביצועים ל-DevOps

Google's DevOps Research and Assessment (DORA) הגדירו 4 מדדי מפתח למדידת בשלות DevOps/CI/CD בארגון:

| מדד | מה מודד | ביצועים גבוהים (Elite) |
|---|---|---|
| Deployment Frequency | כמה פעמים פורסים לפרודקשן | כמה פעמים ביום |
| Lead Time for Changes | זמן מ-commit ועד production | פחות משעה |
| Change Failure Rate | אחוז deployments שגורמים לתקלה | 0-15% |
| Time to Restore Service (MTTR) | כמה זמן לוקח לתקן תקלה | פחות משעה |

## Best Practices מסכמים

1. **Everything as Code** – פייפליין, תשתית, וקונפיגורציה – הכל בGit, לא ב-UI ידני.
2. **Immutable Artifacts** – בנה פעם אחת, קדם (promote) את אותו artifact דרך כל הסביבות.
3. **Fail Fast, Fail Loud** – בדיקות מהירות וזולות רצות ראשונות; כשל מדווח מיד וברור.
4. **Least Privilege** – ל-pipeline יש רק את ההרשאות המינימליות הנדרשות לכל שלב.
5. **Observability מובנה** – health checks, metrics, logs, ו-alerts הם חלק מהגדרת "Done", לא תוספת מאוחרת.
6. **Automated Rollback** – Pipeline שיודע לזהות כשל ולבצע rollback אוטומטי, לא רק להתריע.
7. **Blameless Postmortems** – כשל ב-pipeline/production הוא הזדמנות ללמידה, לא לחיפוש אשמים.
8. **Small, Frequent Changes** – שינויים קטנים קלים יותר לבדוק, לסקור, ולשחזר (rollback) מאשר releases ענקיים.

## שאלות ראיון עבודה נפוצות

**ש: מה זה DevSecOps ומה ההבדל שלו מ-DevOps רגיל?**
ת: DevSecOps משלב בדיקות ופרקטיקות אבטחה כחלק אינטגרלי ואוטומטי מכל שלב בפייפליין (Shift Left), במקום להשאיר אבטחה כבדיקה ידנית בסוף התהליך לפני release.

**ש: הסבר את ארבעת מדדי ה-DORA וכיצד הם מודדים הצלחת CI/CD.**
ת: Deployment Frequency (תדירות פריסה), Lead Time for Changes (זמן מקוד לפרודקשן), Change Failure Rate (אחוז פריסות שגורמות לתקלה), ו-MTTR (זמן שחזור מתקלה). ביחד הם מודדים גם מהירות וגם יציבות – לא מספיק לפרוס מהר, צריך גם לפרוס בבטחה.

**ש: מה ההבדל בין SAST ל-DAST?**
ת: SAST (Static Application Security Testing) בודק את קוד המקור ללא הרצה, מוקדם בפייפליין. DAST (Dynamic Application Security Testing) תוקף את האפליקציה כשהיא רצה בפועל (בסביבת staging), ומדמה תרחישי תקיפה אמיתיים.

**ש: איך היית מתכנן Automated Rollback Strategy?**
ת: הוספת smoke tests/health checks מיד אחרי deploy; אם הם נכשלים, ה-pipeline מריץ אוטומטית `kubectl rollout undo` (או GitOps revert). בנוסף, ניטור מטריקות (error rate, latency) עם alerting שיכול לטריגר rollback אוטומטי גם דקות אחרי deploy מוצלח לכאורה.

**ש: מה זה "Change Failure Rate" ולמה זה חשוב יותר מסתם "כמה פעמים פרסנו"?**
ת: זה אחוז ה-deployments שגורמים לתקלה או דורשים תיקון חירום. חשוב כי תדירות פריסה גבוהה בלי יציבות היא לא הישג – המטרה היא לפרוס מהר **וגם** בבטחה; שני המדדים יחד נותנים תמונה מלאה.

**ש: איך אתה מונע דליפת secrets לקוד ב-pipeline?**
ת: שילוב Secret Scanning (Gitleaks/TruffleHog) שרץ אוטומטית על כל commit/PR, שימוש ב-Secret Managers ייעודיים (Vault, AWS Secrets Manager) במקום env vars גלויים, ו-pre-commit hooks שתופסים סודות לפני שהם בכלל מגיעים ל-git.

## קישורים חיצוניים

**YouTube:**
- [DevSecOps Explained](https://www.youtube.com/results?search_query=devsecops+explained+pipeline)
- [DORA Metrics Explained](https://www.youtube.com/results?search_query=dora+metrics+explained)
- [DevOps Interview Questions – Edureka](https://www.youtube.com/watch?v=cM8mLJhGrAQ)
- [Prometheus & Grafana Monitoring Tutorial – TechWorld with Nana](https://www.youtube.com/c/TechWorldwithNana)

**דוקומנטציה:**
- [OWASP DevSecOps Guideline](https://owasp.org/www-project-devsecops-guideline/)
- [DORA – DevOps Research and Assessment](https://dora.dev/)
- [Trivy Docs](https://trivy.dev/)
- [Prometheus Documentation](https://prometheus.io/docs/introduction/overview/)
- [OpenTelemetry Docs](https://opentelemetry.io/docs/)
