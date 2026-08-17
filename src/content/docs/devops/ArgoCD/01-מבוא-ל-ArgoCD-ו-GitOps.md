# מדריך 1: מבוא ל-ArgoCD ו-GitOps

## מה זה בכלל GitOps?

GitOps היא גישת עבודה (methodology) לניהול תשתיות ואפליקציות, שבה **Git הוא מקור האמת היחיד (Single Source of Truth)** לגבי המצב הרצוי של המערכת. כל שינוי בתשתית או באפליקציה נעשה קודם כל כ-Commit ל-Git, ולא ידנית על הסביבה (Cluster).

עקרונות היסוד של GitOps:

1. **הצהרתי (Declarative)** – אתה מתאר "מה אני רוצה שיהיה" (למשל: 3 replicas, image גרסה X), ולא "איך להגיע לזה".
2. **גרסתי ומאובטח ב-Git** – כל שינוי עובר Pull Request, Code Review, ויש היסטוריה מלאה (Audit Trail).
3. **נמשך אוטומטית (Pulled automatically)** – סוכן (Agent) שרץ בתוך ה-Cluster (כמו ArgoCD) בודק כל הזמן אם המצב בפועל (Live State) תואם למצב הרצוי ב-Git (Desired State), ומתקן פערים.
4. **תיקון עצמי (Self-Healing)** – אם מישהו עשה שינוי ידני ב-Cluster (למשל `kubectl edit`), הכלי יזהה סטייה (Drift) ויחזיר את המצב לזה שמוגדר ב-Git.

## למה GitOps ולא Push-based CI/CD רגיל?

בגישה המסורתית (Push-based), כלי ה-CI/CD (כמו Jenkins, GitLab CI) "דוחף" (Push) שינויים ל-Cluster בעזרת `kubectl apply` בסוף ה-Pipeline. הבעיה:

- ה-CI/CD צריך הרשאות (Credentials) ישירות ל-Cluster – סיכון אבטחתי גדול.
- אין מנגנון אוטומטי שמזהה Drift (שינוי ידני שנעשה מחוץ ל-Pipeline).
- קשה לדעת מה המצב "האמיתי" של הסביבה בכל רגע נתון.

ב-GitOps (Pull-based) זה הפוך: **ArgoCD יושב בתוך ה-Cluster ו"מושך" (Pull) שינויים מ-Git**, כך שאין צורך לתת לכלי החיצוני הרשאות Cluster, וה-Cluster אחראי על עצמו.

## מה זה ArgoCD?

[Argo CD](https://argo-cd.readthedocs.io/en/stable/) הוא כלי open-source תחת פרויקט [Argoproj](https://argoproj.github.io/cd/), שמיישם GitOps עבור Kubernetes. הוא:

- מתחבר ל-Repository ב-Git (GitHub, GitLab, Bitbucket וכו').
- קורא ממנו מניפסטים של Kubernetes (YAML גולמי, Helm Charts, Kustomize, Jsonnet ועוד).
- משווה בין המצב שמוגדר ב-Git לבין המצב בפועל ב-Cluster.
- מציג את ההפרשים (Diff) בממשק גרפי נוח.
- מבצע Sync (סנכרון) – אוטומטי או ידני – כדי להביא את ה-Cluster למצב הרצוי.

## מושגי יסוד שחשוב להכיר

| מושג | הסבר |
|---|---|
| **Application** | אובייקט Kubernetes מותאם (CRD) שמייצג אפליקציה ב-ArgoCD – מקשר בין מקור Git ליעד ב-Cluster |
| **Desired State** | המצב המוגדר בקוד ב-Git (מה שאמור להיות) |
| **Live State** | המצב בפועל כרגע ב-Cluster |
| **Sync** | פעולת הסנכרון שמיישרת בין Live ל-Desired |
| **OutOfSync** | מצב שבו יש הבדל בין Git ל-Cluster |
| **Drift** | סטייה שנוצרה כתוצאה משינוי ידני שלא דרך Git |
| **Health Status** | מצב הבריאות של המשאבים (Healthy, Degraded, Progressing וכו') |
| **Project** | קבוצת הרשאות וגבולות (Namespace, Repo, Cluster) סביב אוסף Applications |

## ArgoCD מול כלים דומים

- **Flux CD** – מתחרה ישיר, גם הוא GitOps operator, אבל בלי UI מובנה חזק כמו ArgoCD (יש תוספת בשם Flux UI / Weave GitOps).
- **Jenkins X** – פתרון CI/CD מלא שכולל רכיבי GitOps, אבל כבד ומורכב יותר.
- **Spinnaker** – כלי Deployment חזק אבל לא Git-native באותה מידה.

ArgoCD בדרך כלל מנצח בזכות ה-UI האינטואיטיבי, קלות ההתקנה, ותמיכה רחבה ב-Helm/Kustomize/Jsonnet מהקופסה.

## דוגמה מהירה למבנה Repo בגישת GitOps

```
my-gitops-repo/
├── apps/
│   ├── frontend/
│   │   ├── base/
│   │   │   ├── deployment.yaml
│   │   │   ├── service.yaml
│   │   │   └── kustomization.yaml
│   │   └── overlays/
│   │       ├── dev/
│   │       └── prod/
│   └── backend/
│       └── ...
└── argocd-apps/
    ├── frontend-app.yaml   # ה-Application object של ArgoCD
    └── backend-app.yaml
```

ArgoCD "יצפה" בתיקייה `argocd-apps/` (או ב-`apps/`), ויסנכרן כל שינוי שנעשה שם אל ה-Cluster.

## דוגמה ל-Application ראשוני (טעימה למדריך הבא)

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: guestbook
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/argoproj/argocd-example-apps.git
    targetRevision: HEAD
    path: guestbook
  destination:
    server: https://kubernetes.default.svc
    namespace: guestbook
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
```

הסבר על השדות המרכזיים:

- `source` – מאיפה למשוך את המניפסטים (Repo, Branch/Tag/Commit, נתיב).
- `destination` – לאיזה Cluster ו-Namespace לפרוס.
- `syncPolicy.automated` – האם לסנכרן אוטומטית, ולבצע `prune` (מחיקת משאבים שהוסרו מ-Git) ו-`selfHeal` (תיקון Drift אוטומטי).

## טיפ למתחילים

אל תתחילו ישר עם `automated sync` בסביבת Production. מומלץ להתחיל עם Sync ידני (Manual), להתרגל להבין את ה-Diff שה-UI מציג, ורק אחרי שיש ביטחון בתהליך – לעבור ל-Automated Sync עם `selfHeal`.

## קישורים חיצוניים

- 📖 תיעוד רשמי – [Argo CD Documentation](https://argo-cd.readthedocs.io/en/stable/)
- 📖 [Argo CD – Declarative GitOps CD for Kubernetes (אתר הבית)](https://argoproj.github.io/cd/)
- 💻 [ArgoCD ב-GitHub](https://github.com/argoproj/argo-cd)
- 🎥 [חיפוש סרטוני יוטיוב: "ArgoCD tutorial for beginners"](https://www.youtube.com/results?search_query=argocd+tutorial+for+beginners)
- 🎥 [חיפוש סרטוני יוטיוב: "What is GitOps"](https://www.youtube.com/results?search_query=what+is+gitops+explained)

## מה הלאה?

במדריך הבא נתקין את ArgoCD בפועל על Cluster (Minikube / Kind / EKS), ונגדיר גישה ל-UI ול-CLI.
