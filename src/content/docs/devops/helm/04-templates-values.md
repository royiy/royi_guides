---
title: "מנוע ה-Templates ו-Values ב-Helm"
category: DevOps/Helm
part: 4/10
---

## מנוע התבניות של Helm

Helm משתמש במנוע ה-**templating של שפת Go** (Go templates), עם תוספות מ-**Sprig** (ספריית פונקציות עזר פופולרית) ופונקציות ייחודיות ל-Helm.

התחביר הבסיסי משתמש בסוגריים כפולים מסולסלים: `{{ }}`

```yaml
name: {{ .Release.Name }}
replicas: {{ .Values.replicaCount }}
```

## אובייקטים מובנים (Built-in Objects)

| אובייקט | תיאור | דוגמה |
|---|---|---|
| `.Release` | מידע על ה-release הנוכחי | `.Release.Name`, `.Release.Namespace`, `.Release.IsUpgrade`, `.Release.IsInstall` |
| `.Values` | הערכים מ-`values.yaml` (או שסופקו ב-CLI) | `.Values.image.tag` |
| `.Chart` | תוכן `Chart.yaml` | `.Chart.Name`, `.Chart.Version` |
| `.Files` | גישה לקבצים נוספים ב-Chart | `.Files.Get "config.txt"` |
| `.Capabilities` | מידע על יכולות הקלאסטר | `.Capabilities.KubeVersion` |
| `.Template` | מידע על הקובץ הנוכחי | `.Template.Name` |

### דוגמה מקיפה:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ .Release.Name }}-{{ .Chart.Name }}
  labels:
    helm.sh/chart: {{ .Chart.Name }}-{{ .Chart.Version }}
    app.kubernetes.io/managed-by: {{ .Release.Service }}
    app.kubernetes.io/version: {{ .Chart.AppVersion }}
```

## פקודות שליטה (Control Structures)

### תנאים — `if / else`

```yaml
{{- if .Values.ingress.enabled }}
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: {{ .Release.Name }}-ingress
spec:
  rules:
    - host: {{ .Values.ingress.host }}
{{- else }}
# Ingress מבוטל - לא נוצר משאב
{{- end }}
```

### לולאות — `range`

```yaml
env:
{{- range .Values.extraEnvVars }}
  - name: {{ .name }}
    value: {{ .value | quote }}
{{- end }}
```

עם `values.yaml`:
```yaml
extraEnvVars:
  - name: LOG_LEVEL
    value: debug
  - name: ENVIRONMENT
    value: production
```

### לולאה על Map

```yaml
labels:
{{- range $key, $value := .Values.customLabels }}
  {{ $key }}: {{ $value | quote }}
{{- end }}
```

## שליטה ברווחים (Whitespace Control)

זהו נושא שמבלבל מתחילים רבים! ה-`-` בתוך `{{- }}` או `{{ -}}` מסיר רווחים לבנים/שורות ריקות:

```yaml
# בלי שליטה ברווחים - ייצור שורות ריקות מיותרות
{{ if .Values.enabled }}
value: true
{{ end }}

# עם שליטה ברווחים - נקי יותר
{{- if .Values.enabled }}
value: true
{{- end }}
```

- `{{-` מסיר רווחים לבנים **לפני** התג
- `-}}` מסיר רווחים לבנים **אחרי** התג

## פונקציות שימושיות (Pipelines)

Helm תומך ב"pipelines" בסגנון Unix — מעבירים ערך דרך שרשרת פונקציות:

```yaml
name: {{ .Values.name | upper | quote }}
image: {{ .Values.image.repository }}:{{ .Values.image.tag | default "latest" }}
```

### פונקציות נפוצות מ-Sprig:

| פונקציה | תיאור | דוגמה |
|---|---|---|
| `default` | ערך ברירת מחדל אם ריק | `{{ .Values.port \| default 8080 }}` |
| `quote` | הוספת מרכאות | `{{ .Values.name \| quote }}` |
| `upper` / `lower` | אותיות גדולות/קטנות | `{{ .Values.env \| upper }}` |
| `indent` / `nindent` | הזחה של טקסט | `{{ .Values.config \| nindent 4 }}` |
| `trunc` | קיצור מחרוזת | `{{ .Release.Name \| trunc 63 }}` |
| `b64enc` | קידוד Base64 | `{{ .Values.password \| b64enc }}` |
| `toYaml` | המרה ל-YAML | `{{ toYaml .Values.resources \| nindent 12 }}` |
| `required` | שדה חובה (שגיאה אם חסר) | `{{ required "חובה image.tag" .Values.image.tag }}` |

### דוגמת toYaml נפוצה מאוד (חשוב לזכור לראיונות!):

```yaml
resources:
  {{- toYaml .Values.resources | nindent 12 }}
```

זו הדרך הסטנדרטית להעביר בלוקים שלמים של YAML (למשל `resources`, `affinity`, `tolerations`) בלי לפרק אותם שדה-שדה.

## Named Templates ו-`_helpers.tpl`

כדי למנוע שכפול קוד, יוצרים "פונקציות" משותפות בקובץ `_helpers.tpl` (הקידומת `_` אומרת ל-Helm לא לרנדר אותו כמשאב עצמאי):

```yaml
{{/* _helpers.tpl */}}
{{- define "my-app.fullname" -}}
{{- .Release.Name }}-{{ .Chart.Name -}}
{{- end -}}

{{- define "my-app.labels" -}}
helm.sh/chart: {{ .Chart.Name }}-{{ .Chart.Version }}
app.kubernetes.io/name: {{ .Chart.Name }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}
```

שימוש בתבנית אחרת:

```yaml
metadata:
  name: {{ include "my-app.fullname" . }}
  labels:
    {{- include "my-app.labels" . | nindent 4 }}
```

> **הבדל חשוב:** `template` לעומת `include` — `include` מאפשר "לצנרר" (pipe) את הפלט לפונקציות נוספות כמו `nindent`, בעוד ש-`template` לא. **תמיד** מומלץ להשתמש ב-`include` ולא ב-`template`.

## וריאבלים מקומיים

```yaml
{{- $fullName := include "my-app.fullname" . -}}
{{- $port := .Values.service.port -}}
apiVersion: v1
kind: Service
metadata:
  name: {{ $fullName }}
spec:
  ports:
    - port: {{ $port }}
```

## Named Values מותנים - דוגמת HPA מלאה

```yaml
{{- if .Values.autoscaling.enabled }}
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: {{ include "my-app.fullname" . }}
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: {{ include "my-app.fullname" . }}
  minReplicas: {{ .Values.autoscaling.minReplicas }}
  maxReplicas: {{ .Values.autoscaling.maxReplicas }}
  metrics:
    {{- if .Values.autoscaling.targetCPUUtilizationPercentage }}
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: {{ .Values.autoscaling.targetCPUUtilizationPercentage }}
    {{- end }}
{{- end }}
```

## דיבאג של Templates

```bash
# רינדור בלי התקנה - הכי שימושי לפיתוח!
helm template my-release ./my-app

# עם ערכים ספציפיים
helm template my-release ./my-app --set replicaCount=5

# עם קובץ values נוסף
helm template my-release ./my-app -f values-prod.yaml

# debug מלא כולל שגיאות מפורטות
helm install my-release ./my-app --dry-run --debug
```

## מקורות ולמידה נוספת

### דוקומנטציה רשמית
- 📘 [Chart Template Guide - Getting Started](https://helm.sh/docs/chart_template_guide/getting_started/)
- 📘 [Built-in Objects](https://helm.sh/docs/chart_template_guide/builtin_objects/)
- 📘 [Template Functions and Pipelines](https://helm.sh/docs/chart_template_guide/functions_and_pipelines/)
- 📘 [Sprig Function Documentation](https://masterminds.github.io/sprig/)
- 📘 [Named Templates](https://helm.sh/docs/chart_template_guide/named_templates/)

### סרטוני יוטיוב מומלצים
- 🎥 [Helm Templates Deep Dive - חיפוש ביוטיוב](https://www.youtube.com/results?search_query=helm+templates+deep+dive+tutorial)
- 🎥 [Go Templates for Helm Explained - חיפוש ביוטיוב](https://www.youtube.com/results?search_query=go+templates+helm+explained)

## שאלות לחזרה עצמית

1. מה ההבדל בין `include` ל-`template`?
2. מה עושה הסימן `-` בתוך `{{- }}`?
3. איך מעבירים בלוק YAML שלם (כמו `resources`) בלי לפרק אותו לשדות בודדים?
4. איך אפשר לחייב ערך מסוים בלי ברירת מחדל, כך שההתקנה תיכשל אם הוא לא סופק?

---
**המדריך הקודם:** [מדריך 3 - מבנה Chart](/devops/helm/03-mivne-chart/)
**המשך למדריך הבא:** [מדריך 5 - Repositories](/devops/helm/05-repositories/)
