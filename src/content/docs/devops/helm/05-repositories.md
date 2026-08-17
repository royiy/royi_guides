---
title: "Helm Repositories — ניהול והפצת Charts"
category: DevOps/Helm
part: 5/10
---

## מהו Repository ב-Helm?

Repository (מאגר) הוא פשוט שרת HTTP שמארח קובץ `index.yaml` יחד עם קבצי `.tgz` ארוזים של Charts. זה יכול להיות:

- שרת HTTP סטטי רגיל (למשל GitHub Pages)
- **OCI Registry** (מאז Helm 3.8 — התקן החדש והמומלץ!)
- שירותים ייעודיים כמו ChartMuseum, Harbor, JFrog Artifactory

## ניהול Repositories

```bash
# הוספת repo
helm repo add bitnami https://charts.bitnami.com/bitnami

# רשימת repos מוגדרים
helm repo list

# עדכון האינדקס המקומי של כל ה-repos
helm repo update

# הסרת repo
helm repo remove bitnami

# חיפוש chart ספציפי בתוך ה-repos שהוספתם
helm search repo postgresql

# חיפוש רחב בכל Artifact Hub
helm search hub redis --max-col-width=50
```

## Artifact Hub — המרכז המרכזי לחיפוש Charts

מאז ש-Helm Hub נסגר, **[Artifact Hub](https://artifacthub.io/)** הוא המקום המרכזי לחפש Charts ציבוריים מכל היצרנים - Bitnami, Prometheus Community, Grafana, Elastic ורבים נוספים.

```bash
# דוגמה: חיפוש redis
helm search hub redis
```

## יצירת Repository משלכם

### אפשרות 1: GitHub Pages (הכי פשוט וזול - חינמי!)

```bash
# 1. אורזים את ה-charts
helm package ./my-chart

# 2. יוצרים/מעדכנים אינדקס
helm repo index . --url https://myusername.github.io/my-helm-repo

# 3. דוחפים ל-branch של GitHub Pages
git add .
git commit -m "Add new chart version"
git push origin gh-pages
```

מבנה תיקייה טיפוסי:
```
my-helm-repo/
├── index.yaml
├── my-chart-1.0.0.tgz
├── my-chart-1.1.0.tgz
└── another-chart-0.5.0.tgz
```

### אפשרות 2: ChartMuseum (שרת ייעודי בקוד פתוח)

```bash
# הרצה עם Docker
docker run -d -p 8080:8080 \
  -e STORAGE=local \
  -e STORAGE_LOCAL_ROOTDIR=/charts \
  -v $(pwd)/charts:/charts \
  ghcr.io/helm/chartmuseum:latest

# הוספת ה-chart repo
helm repo add my-museum http://localhost:8080

# העלאת chart (עם plugin ייעודי)
helm plugin install https://github.com/chartmuseum/helm-push
helm cm-push ./my-chart my-museum
```

### אפשרות 3: OCI Registry (התקן החדש - מומלץ!)

מאז Helm 3.8, תמיכה מלאה ב-OCI היא ברירת מחדל (ללא צורך ב-feature flag). זה מאפשר לאחסן Charts באותו רישום כמו images של Docker!

```bash
# התחברות ל-registry (למשל Docker Hub, ECR, ACR, GCR)
helm registry login registry-1.docker.io -u myusername

# אריזה ודחיפה (push)
helm package ./my-chart
helm push my-chart-1.0.0.tgz oci://registry-1.docker.io/myusername

# התקנה ישירות מ-OCI registry
helm install my-release oci://registry-1.docker.io/myusername/my-chart --version 1.0.0

# עבור AWS ECR:
aws ecr get-login-password | helm registry login --username AWS --password-stdin 123456789.dkr.ecr.us-east-1.amazonaws.com
helm push my-chart-1.0.0.tgz oci://123456789.dkr.ecr.us-east-1.amazonaws.com
```

> **טיפ לראיון:** OCI (`oci://`) הוא כיום ה-**דרך המומלצת** לאחסון Charts כי היא מאחדת את ניהול ה-images ו-charts תחת אותה תשתית (Container Registry), ומאפשרת שימוש ב-RBAC וסריקות אבטחה של אותו הרישום.

## עבודה עם Repositories פרטיים (Private)

```bash
# הוספת repo פרטי עם אימות
helm repo add my-private-repo https://charts.mycompany.com \
  --username myuser \
  --password mypass

# עם TLS certificates
helm repo add secure-repo https://charts.mycompany.com \
  --cert-file cert.pem \
  --key-file key.pem \
  --ca-file ca.pem
```

## גרסאות (SemVer) וניהול תלויות

Helm עוקב אחר **Semantic Versioning** (SemVer 2). חשוב להבין את המשמעות:

```
MAJOR.MINOR.PATCH
  1  .  2  .  3
```

- **MAJOR** — שינויים לא-תואמים לאחור (breaking changes)
- **MINOR** — הוספת פיצ'רים תוך שמירה על תאימות לאחור
- **PATCH** — תיקוני באגים בלבד

בתוך `Chart.yaml`, כשמגדירים תלות אפשר להגביל טווח גרסאות:

```yaml
dependencies:
  - name: redis
    version: "~17.3.0"   # מקבל 17.3.x בלבד
    repository: "https://charts.bitnami.com/bitnami"
  - name: postgresql
    version: "^12.0.0"   # מקבל 12.x.x (כל mino/patch תואם)
    repository: "https://charts.bitnami.com/bitnami"
```

## CI/CD ל-Repository עם GitHub Actions

דוגמה לאוטומציה שמעדכנת את ה-index אוטומטית כשמעלים chart חדש:

```yaml
# .github/workflows/release.yml
name: Release Charts
on:
  push:
    branches: [main]
jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - name: Configure Git
        run: |
          git config user.name "$GITHUB_ACTOR"
          git config user.email "$GITHUB_ACTOR@users.noreply.github.com"
      - name: Run chart-releaser
        uses: helm/chart-releaser-action@v1
        env:
          CR_TOKEN: "${{ secrets.GITHUB_TOKEN }}"
```

זה משתמש בכלי הרשמי [chart-releaser](https://github.com/helm/chart-releaser) שאוטומטית יוצר GitHub Releases ומעדכן את `index.yaml` בענף `gh-pages`.

## מקורות ולמידה נוספת

### דוקומנטציה רשמית
- 📘 [The Chart Repository Guide](https://helm.sh/docs/topics/chart_repository/)
- 📘 [Using OCI Registries with Helm](https://helm.sh/docs/topics/registries/)
- 📘 [Artifact Hub](https://artifacthub.io/)
- 📘 [Chart Releaser Action - GitHub](https://github.com/helm/chart-releaser-action)
- 📘 [ChartMuseum Official Docs](https://chartmuseum.com/)

### סרטוני יוטיוב מומלצים
- 🎥 [Helm Chart Repository Tutorial - חיפוש ביוטיוב](https://www.youtube.com/results?search_query=helm+chart+repository+tutorial)
- 🎥 [Helm OCI Registry Explained - חיפוש ביוטיוב](https://www.youtube.com/results?search_query=helm+oci+registry+explained)
- 🎥 [Publishing Helm Charts to GitHub Pages - חיפוש ביוטיוב](https://www.youtube.com/results?search_query=publishing+helm+charts+github+pages)

## שאלות לחזרה עצמית

1. מה ההבדל בין repository מבוסס HTTP ל-OCI registry?
2. מדוע Artifact Hub החליף את Helm Hub?
3. מה המשמעות של `~17.3.0` לעומת `^12.0.0` בהגדרת גרסת תלות?
4. אילו שלושה קבצים נדרשים כדי ליצור repository מבוסס GitHub Pages?

---
**המדריך הקודם:** [מדריך 4 - Templates ו-Values](./04-templates-values.md)
**המשך למדריך הבא:** [מדריך 6 - Hooks](./06-hooks.md)
