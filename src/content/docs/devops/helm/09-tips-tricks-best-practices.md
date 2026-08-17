# מדריך 9: טיפים, טריקים ו-Best Practices ל-Helm

## 1. תמיד השתמשו ב-`helm lint` וב-`helm template` לפני commit

```bash
helm lint ./my-chart
helm template ./my-chart --debug
```

זה תופס שגיאות תחביר, indentation שגוי, ומשתנים חסרים **לפני** שהם מגיעים לקלאסטר.

## 2. השתמשו ב-`helm-diff` Plugin לפני כל `upgrade` ב-production

```bash
helm plugin install https://github.com/databus23/helm-diff
helm diff upgrade my-release ./my-chart -f values-prod.yaml
```

זה מציג בדיוק אילו שדות ישתנו — ללא זה, אתם "עיוורים" לגבי מה ה-upgrade הולך לעשות בפועל.

## 3. תמיד תייגו (label) לפי מוסכמות Kubernetes הסטנדרטיות

```yaml
labels:
  app.kubernetes.io/name: {{ .Chart.Name }}
  app.kubernetes.io/instance: {{ .Release.Name }}
  app.kubernetes.io/version: {{ .Chart.AppVersion }}
  app.kubernetes.io/managed-by: {{ .Release.Service }}
  helm.sh/chart: {{ printf "%s-%s" .Chart.Name .Chart.Version }}
```

מוסכמה זו מאפשרת כלים אחרים (Prometheus, Grafana, Lens, ArgoCD) לזהות משאבים המנוהלים על ידי Helm.

## 4. השתמשו ב-`required` כדי למנוע התקנות שבורות בשקט

```yaml
image:
  repository: {{ required "יש לספק image.repository!" .Values.image.repository }}
```

זה טוב הרבה יותר מלגלות ב-production ש-Pod נוצר עם `image: :latest` ריק.

## 5. שימוש ב-`--set-string` כדי למנוע המרות טיפוס לא רצויות

```bash
# בעייתי - "1.20" עלול להתפרש כמספר עשרוני!
helm install my-release ./chart --set image.tag=1.20

# בטוח יותר
helm install my-release ./chart --set-string image.tag=1.20
```

## 6. הימנעו מ-`--force` כברירת מחדל

`--force` מוחק ויוצר מחדש משאבים — זה יכול לגרום ל-**downtime** במשאבים כמו Services עם IP קבוע. השתמשו רק כשבאמת נדרש (immutable fields).

## 7. השתמשו ב-`NOTES.txt` כדי לתת הנחיות ברורות למשתמש

```
{{/* templates/NOTES.txt */}}
תודה שהתקנת את {{ .Chart.Name }}!

כדי לגשת לאפליקציה:
{{- if .Values.ingress.enabled }}
  https://{{ (index .Values.ingress.hosts 0).host }}
{{- else }}
  הריצו: kubectl port-forward svc/{{ .Release.Name }} 8080:{{ .Values.service.port }}
{{- end }}

לבדיקת סטטוס:
  helm status {{ .Release.Name }}
```

## 8. Secrets — לעולם אל תשמרו סודות בתוך Git ב-values.yaml רגיל

השתמשו באחת מהאפשרויות:

```bash
# helm-secrets עם SOPS (מוצפן ב-Git!)
helm plugin install https://github.com/jkroepke/helm-secrets
helm secrets install my-release ./chart -f secrets.yaml

# או External Secrets Operator / Sealed Secrets / Vault
```

## 9. הימנעו מלוגיקה מורכבת מדי ב-Templates

אם template מתחיל להיראות כמו קוד תוכנה מלא (לולאות מקוננות, if-else עמוקים), זה סימן ש-**Chart מורכב מדי**. שקלו:
- לפצל ל-subcharts
- להשתמש ב-Library Chart לקוד משותף
- לחשוב מחדש על מבנה ה-values

## 10. `values.schema.json` — ולידציה טיפוסית של Values

```json
{
  "$schema": "https://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["image", "replicaCount"],
  "properties": {
    "replicaCount": {
      "type": "integer",
      "minimum": 1
    },
    "image": {
      "type": "object",
      "required": ["repository", "tag"],
      "properties": {
        "repository": { "type": "string" },
        "tag": { "type": "string" }
      }
    }
  }
}
```

שימו קובץ זה בשם `values.schema.json` בשורש ה-Chart — Helm יאמת אוטומטית את ה-values מולו לפני install/upgrade ויכשיל את הפעולה עם שגיאה ברורה אם הסכימה לא עומדת בדרישות.

## 11. השתמשו ב-`--set-file` להכנסת קובץ שלם כערך

```bash
helm install my-release ./chart --set-file config.nginxConf=./nginx.conf
```

שימושי מאוד עבור configs ארוכים כמו קבצי nginx.conf, קבצי JSON, private keys וכו'.

## 12. ChartMuseum / OCI — שמרו על אחסון Charts מרוכז לצוות

זה מונע מצב שבו כל מפתח מחזיק גרסה מקומית שונה של Chart. תמיד בדקו ש-CI/CD דוחף Charts ל-Registry מרכזי.

## 13. `helm get manifest` כדי לראות בדיוק מה רץ בקלאסטר

```bash
helm get manifest my-release | less
```

זה מציג את המניפסטים המדויקים כפי שהם קיימים בפועל, בשונה מ-`helm template` שרק מדמה רינדור מקומי (בלי ערכים דינמיים מהקלאסטר עצמו).

## 14. שימו לב ל-`Chart.yaml` בגרסאות Helm — `apiVersion: v2` הוא חובה ב-Helm 3

```yaml
apiVersion: v2   # לא v1! v1 היה עבור Helm 2 בלבד
```

## 15. ניהול סביבות מרובות עם values overlays

```
my-chart/
├── values.yaml           # ברירת מחדל/dev
├── values-staging.yaml   # override עבור staging
└── values-production.yaml # override עבור production
```

```bash
helm upgrade --install my-app ./my-chart -f values.yaml -f values-production.yaml
```

## 16. תיוג (Tagging) גרסאות Chart בעקביות עם CI/CD

בדרך כלל `Chart.yaml version` מתעדכן אוטומטית ב-pipeline לפי Git tag:

```bash
# בתוך CI
CHART_VERSION=$(git describe --tags --abbrev=0)
sed -i "s/^version:.*/version: ${CHART_VERSION#v}/" Chart.yaml
helm package .
```

## 17. שימוש ב-`kubectl explain` יחד עם Helm

כשלא בטוחים לגבי שדה מסוים במניפסט Kubernetes:

```bash
kubectl explain deployment.spec.template.spec.containers.resources
```

## 18. GitOps: Helm + ArgoCD / FluxCD

בסביבות production מודרניות, Helm charts מנוהלים דרך **ArgoCD** או **FluxCD** בגישת GitOps — במקום להריץ `helm install/upgrade` ידנית, מגדירים `Application` (ArgoCD) שמפנה ל-repository עם ה-chart, וה-cluster state מתעדכן אוטומטית בהתאם ל-Git.

```yaml
# ArgoCD Application שמצביע לתוך Helm chart
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: my-app
spec:
  source:
    repoURL: https://github.com/mycompany/helm-charts
    path: my-app
    targetRevision: main
    helm:
      valueFiles:
        - values-production.yaml
  destination:
    server: https://kubernetes.default.svc
    namespace: production
```

## 19. בדיקות אבטחה על Charts

```bash
# סריקה עם checkov
checkov -f my-chart --framework helm

# סריקה עם kubesec (על מניפסטים מרונדרים)
helm template ./my-chart | kubesec scan -
```

## 20. תיעוד עצמי - README.md בכל Chart

Charts איכותיים תמיד כוללים `README.md` עם טבלת ערכים (parameters table), כמו זו שנוצרת אוטומטית עם [helm-docs](https://github.com/norwoodj/helm-docs):

```bash
helm-docs --chart-search-root=./charts
```

## מקורות ולמידה נוספת

### דוקומנטציה רשמית
- 📘 [Helm Best Practices Guide](https://helm.sh/docs/chart_best_practices/)
- 📘 [Schema Files (values.schema.json)](https://helm.sh/docs/topics/charts/#schema-files)
- 📘 [Chart Development Tips and Tricks](https://helm.sh/docs/howto/charts_tips_and_tricks/)
- 📘 [ArgoCD + Helm Integration](https://argo-cd.readthedocs.io/en/stable/user-guide/helm/)

### כלים שימושיים (GitHub)
- 🔧 [helm-diff](https://github.com/databus23/helm-diff)
- 🔧 [helm-secrets](https://github.com/jkroepke/helm-secrets)
- 🔧 [helm-docs](https://github.com/norwoodj/helm-docs)
- 🔧 [chart-testing (ct)](https://github.com/helm/chart-testing)

### סרטוני יוטיוב מומלצים
- 🎥 [Helm Best Practices - חיפוש ביוטיוב](https://www.youtube.com/results?search_query=helm+best+practices+kubernetes)
- 🎥 [Helm + ArgoCD GitOps - חיפוש ביוטיוב](https://www.youtube.com/results?search_query=helm+argocd+gitops+tutorial)
- 🎥 [Common Helm Mistakes to Avoid - חיפוש ביוטיוב](https://www.youtube.com/results?search_query=common+helm+mistakes+to+avoid)

## שאלות לחזרה עצמית

1. למה חשוב להשתמש ב-`helm diff` לפני `upgrade` בסביבת production?
2. מה תפקידו של `values.schema.json`?
3. איך GitOps (עם ArgoCD) משנה את הדרך שבה מריצים פקודות Helm?
4. מה ההבדל בין `--set` רגיל ל-`--set-string`?

---
**המדריך הקודם:** [מדריך 8 - ניהול Releases](./08-release-management.md)
**המשך למדריך הבא:** [מדריך 10 - שאלות ראיון עבודה](./10-sheelot-reayon.md)
