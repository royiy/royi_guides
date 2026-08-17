# מדריך 7: ArgoCD ApplicationSets ו-Multi-Cluster

## הבעיה: כשיש הרבה Applications

תארו לעצמכם ארגון עם 50 מיקרו-שירותים, וכל אחד צריך Application נפרד לכל סביבה (dev/staging/prod) – זה 150 קבצי YAML שצריך לתחזק ידנית. `ApplicationSet` פותר את זה על ידי **יצירה דינמית** של Applications מתוך תבנית (Template) + מקור נתונים (Generator).

## מבנה כללי

```yaml
apiVersion: argoproj.io/v1alpha1
kind: ApplicationSet
metadata:
  name: my-appset
  namespace: argocd
spec:
  generators:
    - <סוג ה-Generator>
  template:
    metadata:
      name: '{{...}}'
    spec:
      # אותם שדות כמו ב-Application רגיל
```

## סוג 1: List Generator – רשימה סטטית

הכי פשוט – שימושי כשיש רשימה קבועה של סביבות/Clusters:

```yaml
apiVersion: argoproj.io/v1alpha1
kind: ApplicationSet
metadata:
  name: guestbook-envs
  namespace: argocd
spec:
  generators:
    - list:
        elements:
          - env: dev
            replicas: "1"
          - env: staging
            replicas: "2"
          - env: prod
            replicas: "5"
  template:
    metadata:
      name: 'guestbook-{{env}}'
    spec:
      project: default
      source:
        repoURL: https://github.com/mycompany/guestbook.git
        targetRevision: HEAD
        path: 'overlays/{{env}}'
        helm:
          parameters:
            - name: replicaCount
              value: '{{replicas}}'
      destination:
        server: https://kubernetes.default.svc
        namespace: 'guestbook-{{env}}'
      syncPolicy:
        automated:
          prune: true
          selfHeal: true
        syncOptions:
          - CreateNamespace=true
```

זה ייצור אוטומטית 3 Applications: `guestbook-dev`, `guestbook-staging`, `guestbook-prod`.

## סוג 2: Cluster Generator – פריסה לכל ה-Clusters הרשומים

שימושי כשרוצים לפרוס אותה אפליקציה (למשל Monitoring Agent) לכל Cluster שרשום ב-ArgoCD:

```yaml
apiVersion: argoproj.io/v1alpha1
kind: ApplicationSet
metadata:
  name: monitoring-agent
  namespace: argocd
spec:
  generators:
    - clusters:
        selector:
          matchLabels:
            env: production
  template:
    metadata:
      name: 'monitoring-agent-{{name}}'
    spec:
      project: default
      source:
        repoURL: https://github.com/mycompany/monitoring-agent.git
        targetRevision: HEAD
        path: charts/monitoring-agent
      destination:
        server: '{{server}}'
        namespace: monitoring
      syncPolicy:
        automated:
          prune: true
          selfHeal: true
        syncOptions:
          - CreateNamespace=true
```

רישום Cluster חדש ל-ArgoCD (עם Label):

```bash
argocd cluster add my-eks-context --label env=production --name eks-prod
```

## סוג 3: Git Generator (Directories) – פריסה לפי תיקיות ב-Repo

שימושי כשמבנה ה-Repo כבר משקף את הסביבות/השירותים:

```
apps/
  service-a/
  service-b/
  service-c/
```

```yaml
apiVersion: argoproj.io/v1alpha1
kind: ApplicationSet
metadata:
  name: apps-from-git
  namespace: argocd
spec:
  generators:
    - git:
        repoURL: https://github.com/mycompany/gitops-repo.git
        revision: HEAD
        directories:
          - path: apps/*
  template:
    metadata:
      name: '{{path.basename}}'
    spec:
      project: default
      source:
        repoURL: https://github.com/mycompany/gitops-repo.git
        targetRevision: HEAD
        path: '{{path}}'
      destination:
        server: https://kubernetes.default.svc
        namespace: '{{path.basename}}'
      syncPolicy:
        automated:
          prune: true
          selfHeal: true
```

כל תיקייה חדשה שתתווסף תחת `apps/` תיצור אוטומטית Application חדש – ללא צורך במגע יד אדם!

## סוג 4: Git Generator (Files) – קריאת קובץ config.json מכל תיקייה

```yaml
generators:
  - git:
      repoURL: https://github.com/mycompany/gitops-repo.git
      revision: HEAD
      files:
        - path: "apps/**/config.json"
```

לדוגמה `apps/service-a/config.json`:

```json
{
  "name": "service-a",
  "namespace": "team-a",
  "replicas": 3
}
```

וב-Template אפשר להשתמש ב-`{{name}}`, `{{namespace}}`, `{{replicas}}`.

## סוג 5: Matrix Generator – שילוב בין שני Generators

לדוגמה: לכל Cluster **וגם** לכל סביבה (מכפלה קרטזית):

```yaml
generators:
  - matrix:
      generators:
        - clusters: {}
        - list:
            elements:
              - env: blue
              - env: green
```

זה ייצור Application לכל צירוף Cluster+Environment.

## Multi-Cluster: רישום Cluster חיצוני

ArgoCD יכול לנהל פריסות למספר Clusters מתוך instance מרכזי אחד (Hub-and-Spoke):

```bash
# רשימת ה-Contexts הזמינים ב-kubeconfig המקומי
kubectl config get-contexts

# הוספת Cluster ל-ArgoCD
argocd cluster add my-remote-cluster-context --name production-eu
```

בדיקת הרשימה:

```bash
argocd cluster list
```

## אסטרטגיות Multi-Cluster נפוצות

1. **Hub-and-Spoke** – ArgoCD instance אחד (ה-Hub) שולט על כל שאר ה-Clusters (ה-Spokes). פשוט לניהול, אבל נקודת כשל אחת (SPOF) ועומס.
2. **ArgoCD בכל Cluster** – כל Cluster מריץ ArgoCD משלו, שקורא מ-Repo Git משותף. יותר Resilient אבל יותר מורכב לניטור מרכזי.
3. **ArgoCD ApplicationSet + Cluster Generator** – שילוב שמאפשר Hub מרכזי שמנהל דינמית עשרות Clusters בלי לכתוב YAML ידני לכל אחד.

## Progressive Rollout עם ApplicationSet (Canary בין Clusters)

אפשר להשתמש ב-`strategy` כדי לגלגל שינוי בהדרגה בין Clusters, ולא לכולם בבת אחת:

```yaml
spec:
  strategy:
    type: RollingSync
    rollingSync:
      steps:
        - matchExpressions:
            - key: env
              operator: In
              values: ["canary"]
        - matchExpressions:
            - key: env
              operator: In
              values: ["production"]
```

## טיפ: Naming Collisions

כשמשתמשים ב-Template דינמי, ודאו ששם ה-Application (`metadata.name`) ייחודי (למשל שילוב של `{{path.basename}}-{{env}}`), אחרת יווצרו התנגשויות בין Applications.

## קישורים חיצוניים

- 📖 [ApplicationSet – Documentation](https://argo-cd.readthedocs.io/en/stable/operator-manual/applicationset/)
- 📖 [ApplicationSet Generators](https://argo-cd.readthedocs.io/en/stable/operator-manual/applicationset/Generators/)
- 💻 [ApplicationSet – GitHub](https://github.com/argoproj/applicationset)
- 🎥 [חיפוש יוטיוב: "ArgoCD ApplicationSet tutorial multi cluster"](https://www.youtube.com/results?search_query=argocd+applicationset+tutorial+multi+cluster)
- 🎥 [חיפוש יוטיוב: "ArgoCD hub and spoke architecture"](https://www.youtube.com/results?search_query=argocd+hub+and+spoke+architecture)

## מה הלאה?

במדריך הבא נצלול לאינטגרציה עם Helm ו-Kustomize – היתרונות, החסרונות, ומתי להשתמש בכל אחד.
