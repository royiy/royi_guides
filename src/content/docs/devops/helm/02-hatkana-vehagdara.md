---
title: "התקנה והגדרה ראשונית של Helm"
category: DevOps/Helm
part: 2/10
---

## דרישות מוקדמות

לפני שמתקינים Helm, חשוב לוודא:

1. יש לכם קלאסטר Kubernetes פעיל (Minikube, kind, GKE, EKS, AKS, OpenShift וכו')
2. `kubectl` מותקן ומוגדר כראוי (`kubectl config current-context`)
3. הרשאות מתאימות ב-RBAC של הקלאסטר

## התקנה לפי מערכת הפעלה

### macOS (עם Homebrew)

```bash
brew install helm
```

### Linux (סקריפט התקנה רשמי)

```bash
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
```

או דרך מנהל חבילות:

```bash
# Debian/Ubuntu
curl https://baltocdn.com/helm/signing.asc | gpg --dearmor | sudo tee /usr/share/keyrings/helm.gpg > /dev/null
sudo apt-get install apt-transport-https --yes
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/helm.gpg] https://baltocdn.com/helm/stable/debian/ all main" | sudo tee /etc/apt/sources.list.d/helm-stable-debian.list
sudo apt-get update
sudo apt-get install helm
```

### Windows (עם Chocolatey או Scoop)

```powershell
choco install kubernetes-helm
# או
scoop install helm
```

### התקנה עם Docker (ללא התקנה מקומית)

```bash
docker run -it --rm -v ~/.kube:/root/.kube alpine/helm version
```

## וידוא התקנה תקינה

```bash
helm version
```

פלט לדוגמה:

```
version.BuildInfo{Version:"v3.15.2", GitCommit:"...", GitTreeState:"clean", GoVersion:"go1.22.4"}
```

> **טיפ:** תמיד ודאו שיש לכם **Helm 3** ולא Helm 2 — כמעט כל הפרויקטים החדשים היום עובדים אך ורק עם Helm 3.

## הגדרת Repositories ראשוניים

Helm לא מגיע "מוכן" עם repositories מוגדרים מראש (זה שונה מ-Helm 2 שהגיע עם `stable` repo כברירת מחדל). צריך להוסיף repos ידנית:

```bash
# Bitnami - מכיל עשרות charts איכותיים לאפליקציות פופולריות
helm repo add bitnami https://charts.bitnami.com/bitnami

# Ingress-nginx
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx

# Prometheus community
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts

# עדכון רשימת ה-charts הזמינים בכל ה-repos
helm repo update

# צפייה ברשימת ה-repos המוגדרים
helm repo list
```

## חיפוש Charts

```bash
# חיפוש בכל ה-repos שהוספתם
helm search repo nginx

# חיפוש ב-Artifact Hub (המרכז המרכזי לכל ה-charts הציבוריים)
helm search hub wordpress
```

## מבנה תיקיית ההגדרות של Helm

Helm שומר קבצי הגדרה, cache ו-plugins במיקומים הבאים (Linux):

```
~/.config/helm/          # קבצי קונפיגורציה (repositories.yaml וכו')
~/.cache/helm/           # cache של charts שהורדו
~/.local/share/helm/     # plugins מותקנים
```

ניתן לבדוק את הנתיבים המדויקים במערכת שלכם עם:

```bash
helm env
```

## Autocompletion (השלמה אוטומטית)

מומלץ מאוד להגדיר autocompletion כדי לחסוך זמן:

```bash
# Bash
echo 'source <(helm completion bash)' >> ~/.bashrc

# Zsh
echo 'source <(helm completion zsh)' >> ~/.zshrc
```

## התקנת Plugins שימושיים

Helm תומך במערכת plugins להרחבת פונקציונליות:

```bash
# helm-diff - מציג diff לפני upgrade (חובה כמעט לכל צוות!)
helm plugin install https://github.com/databus23/helm-diff

# helm-secrets - ניהול secrets מוצפנים עם sops
helm plugin install https://github.com/jkroepke/helm-secrets

# רשימת plugins מותקנים
helm plugin list
```

## הגדרת RBAC נכונה (חשוב לסביבות production)

ב-Helm 3, ה-CLI פועל תחת ההרשאות של המשתמש המחובר דרך kubeconfig. חשוב להגדיר `ServiceAccount` עם `Role`/`ClusterRole` מתאימים אם מריצים Helm מתוך CI/CD:

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: helm-deployer
  namespace: my-namespace
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: helm-deployer-binding
  namespace: my-namespace
subjects:
- kind: ServiceAccount
  name: helm-deployer
  namespace: my-namespace
roleRef:
  kind: ClusterRole
  name: edit
  apiGroup: rbac.authorization.k8s.io
```

## בעיות נפוצות בהתקנה ופתרונות

| בעיה | פתרון |
|---|---|
| `Error: Kubernetes cluster unreachable` | בדקו `kubectl cluster-info` ואת ה-`KUBECONFIG` |
| `helm: command not found` | ודאו שהתקנתם נכון ושהנתיב ב-`PATH` |
| `Error: found in Chart.yaml, but missing in charts/ directory` | הריצו `helm dependency update` |
| הרשאות חסרות (`forbidden`) | בדקו RBAC — Role/ClusterRoleBinding מתאימים |

## מקורות ולמידה נוספת

### דוקומנטציה רשמית
- 📘 [Installing Helm - Official Docs](https://helm.sh/docs/intro/install/)
- 📘 [Helm Environment Variables](https://helm.sh/docs/helm/helm/)
- 📘 [Artifact Hub - מרכז החיפוש ל-Charts](https://artifacthub.io/)
- 📘 [Helm Plugins Guide](https://helm.sh/docs/topics/plugins/)

### סרטוני יוטיוב מומלצים
- 🎥 [How to Install Helm - חיפוש ביוטיוב](https://www.youtube.com/results?search_query=how+to+install+helm+kubernetes)
- 🎥 [Helm Plugins Explained - חיפוש ביוטיוב](https://www.youtube.com/results?search_query=helm+plugins+diff+secrets+tutorial)

## תרגיל מעשי

נסו להתקין קלאסטר מקומי עם `kind` או `minikube`, להוסיף repository של Bitnami, ולהתקין Chart של `nginx`. בדקו עם `kubectl get pods` שה-Pods עלו בהצלחה.

---
**המדריך הקודם:** [מדריך 1 - מבוא ל-Helm](./01-mavo-le-helm.md)
**המשך למדריך הבא:** [מדריך 3 - מבנה Chart](./03-mivne-chart.md)
