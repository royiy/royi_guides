# מדריך 2: התקנת ArgoCD – שלב אחר שלב

## דרישות מקדימות

- Cluster של Kubernetes פעיל (Minikube, Kind, EKS, GKE, AKS או כל Cluster אחר).
- `kubectl` מותקן ומוגדר מול ה-Cluster.
- הרשאות Cluster-Admin (כדי ליצור CRDs ו-Namespace).

בדיקה שה-Cluster זמין:

```bash
kubectl cluster-info
kubectl get nodes
```

## שלב 1: יצירת Namespace

```bash
kubectl create namespace argocd
```

## שלב 2: התקנה בסיסית (Non-HA) – מתאים ל-Dev/Test

```bash
kubectl apply -n argocd --server-side --force-conflicts \
  -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

שימו לב לדגלים `--server-side --force-conflicts` – הם נדרשים כיום כי חלק מה-CRDs של ArgoCD חורגים מהגודל המקסימלי שנתמך ב-Apply הרגיל (Client-Side).

## שלב 3: התקנה בגישת HA (Production)

עבור סביבות Production מומלץ להתקין את גרסת ה-High Availability, שכוללת מספר Replicas לרכיבים הקריטיים:

```bash
kubectl apply -n argocd --server-side --force-conflicts \
  -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/ha/install.yaml
```

## שלב 4: התקנה באמצעות Helm

חלק גדול מהארגונים מעדיפים להתקין את ArgoCD עצמו... דרך ArgoCD (או Helm רגיל בהתחלה):

```bash
helm repo add argo https://argoproj.github.io/argo-helm
helm repo update

helm install argocd argo/argo-cd \
  --namespace argocd \
  --create-namespace \
  --version 7.7.0
```

יתרון ה-Helm Chart: קל להתאים Values (למשל להפעיל Ingress, SSO, Resource Limits) דרך קובץ `values.yaml` במקום לערוך את ה-Manifest הגולמי.

דוגמת `values.yaml` מקוצרת:

```yaml
server:
  ingress:
    enabled: true
    hosts:
      - argocd.mycompany.com
  extraArgs:
    - --insecure   # רק בזמן פיתוח, ה-Ingress/Load Balancer יעשה TLS termination

configs:
  params:
    server.insecure: true
```

## שלב 5: בדיקת ההתקנה

```bash
kubectl get pods -n argocd
```

אמורים לראות Pods כמו:

```
argocd-application-controller-0
argocd-dex-server-...
argocd-redis-...
argocd-repo-server-...
argocd-server-...
```

## שלב 6: גישה ל-UI

### אופציה א' – Port Forward (הכי מהיר לפיתוח מקומי)

```bash
kubectl port-forward svc/argocd-server -n argocd 8080:443
```

כעת גשו ל-`https://localhost:8080`.

### אופציה ב' – LoadBalancer / Ingress (Production)

```bash
kubectl patch svc argocd-server -n argocd -p '{"spec": {"type": "LoadBalancer"}}'
```

או להגדיר Ingress Controller (nginx/traefik) עם TLS אמיתי (Let's Encrypt דרך cert-manager למשל).

## שלב 7: קבלת סיסמת Admin ראשונית

בגרסאות עדכניות, הסיסמה הראשונית מאוחסנת ב-Secret בשם `argocd-initial-admin-secret`:

```bash
kubectl -n argocd get secret argocd-initial-admin-secret \
  -o jsonpath="{.data.password}" | base64 -d
```

שם המשתמש הדיפולטיבי הוא `admin`.

⚠️ **חשוב**: מיד לאחר ההתחברות הראשונה, מומלץ מאוד למחוק את ה-Secret ולהחליף סיסמה, או לחבר SSO (ראו מדריך 5 על RBAC).

## שלב 8: התקנת ArgoCD CLI

### Linux

```bash
curl -sSL -o argocd-linux-amd64 \
  https://github.com/argoproj/argo-cd/releases/latest/download/argocd-linux-amd64
sudo install -m 555 argocd-linux-amd64 /usr/local/bin/argocd
rm argocd-linux-amd64
```

### macOS (Homebrew)

```bash
brew install argocd
```

### Windows (Chocolatey / Scoop)

```powershell
choco install argocd-cli
# או
scoop install argocd
```

## שלב 9: התחברות דרך ה-CLI

```bash
argocd login localhost:8080 --username admin --password <הסיסמה שקיבלתם> --insecure
```

הדגל `--insecure` נדרש כי בברירת מחדל יש Self-Signed Certificate.

## שלב 10: שינוי סיסמה

```bash
argocd account update-password
```

## התקנה בקלאסטר מקומי (Minikube / Kind) – טיפ

אם עובדים על Minikube:

```bash
minikube start --cpus=4 --memory=8192
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
minikube service argocd-server -n argocd --url
```

אם עובדים על Kind, זכרו שלרוב תצטרכו `kubectl port-forward` כי אין LoadBalancer מובנה (אלא אם הגדרתם MetalLB).

## בעיות נפוצות בהתקנה (Troubleshooting)

| בעיה | פתרון אפשרי |
|---|---|
| Pods תקועים ב-`Pending` | בדקו משאבי Cluster (`kubectl describe pod`) – ייתכן חוסר CPU/Memory |
| `x509: certificate signed by unknown authority` ב-CLI | השתמשו ב-`--insecure` או ייבאו את התעודה |
| לא מצליחים לגשת ל-UI אחרי Port Forward | ודאו שהשתמשתם ב-`https://` ולא `http://` |
| Secret `argocd-initial-admin-secret` לא קיים | ייתכן שכבר שוניתה סיסמה בעבר – ה-Secret נמחק אוטומטית אחרי שינוי ראשון |

## קישורים חיצוניים

- 📖 [Getting Started – Argo CD Docs](https://argo-cd.readthedocs.io/en/stable/getting_started/)
- 📖 [Argo Helm Charts – GitHub](https://github.com/argoproj/argo-helm)
- 💻 [דף ה-Releases הרשמי (להורדת CLI)](https://github.com/argoproj/argo-cd/releases)
- 🎥 [חיפוש יוטיוב: "Install ArgoCD on Kubernetes step by step"](https://www.youtube.com/results?search_query=install+argocd+on+kubernetes+step+by+step)
- 🎥 [חיפוש יוטיוב: "ArgoCD Helm install production"](https://www.youtube.com/results?search_query=argocd+helm+install+production)

## מה הלאה?

במדריך הבא נצלול לארכיטקטורה הפנימית של ArgoCD – מה כל Pod עושה, ואיך הרכיבים מדברים ביניהם.
