# מדריך 7: Kubernetes ו-Continuous Deployment

## תפקיד Kubernetes ב-CI/CD

Kubernetes (K8s) הוא פלטפורמת אורכסטרציה לקונטיינרים, שמנהלת את שלב ה-**CD** – פריסה, סקיילינג, וניהול חיי אפליקציות בפרודקשן. ה-pipeline בונה image ודוחף אותו לרג'יסטרי; Kubernetes אחראי להריץ אותו בפועל.

## אובייקטים בסיסיים רלוונטיים ל-Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
        - name: myapp
          image: ghcr.io/myorg/myapp:a1b2c3d
          ports:
            - containerPort: 3000
          readinessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 5
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 15
          resources:
            requests:
              cpu: "100m"
              memory: "128Mi"
            limits:
              cpu: "500m"
              memory: "512Mi"
```

## אסטרטגיות Deployment

### 1. Rolling Update (ברירת מחדל)
מחליף Pods בהדרגה, אחד-אחד, תוך שמירה על זמינות. מוגדר דרך `maxSurge`/`maxUnavailable` כפי שלמעלה.

### 2. Blue-Green Deployment
שתי סביבות זהות ("Blue" הישנה, "Green" החדשה). מעבירים תעבורה בבת אחת מ-Blue ל-Green ברגע שה-Green מאומת. Rollback מיידי – פשוט מחזירים את התעבורה ל-Blue.

### 3. Canary Deployment
שולחים אחוז קטן מהתעבורה (5%-10%) לגרסה החדשה, בודקים מטריקות, ואם הכל תקין – מגדילים בהדרגה ל-100%.

```yaml
# דוגמת Canary עם Argo Rollouts
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: myapp
spec:
  strategy:
    canary:
      steps:
        - setWeight: 10
        - pause: { duration: 5m }
        - setWeight: 50
        - pause: { duration: 5m }
        - setWeight: 100
```

## GitOps – ArgoCD

GitOps הוא מודל שבו מצב ה-cluster הרצוי מוגדר כ-Git repository, וכלי כמו **ArgoCD** או **Flux** מסנכרנים אוטומטית את ה-cluster בפועל למה שכתוב ב-Git.

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: myapp
spec:
  project: default
  source:
    repoURL: https://github.com/myorg/myapp-manifests
    targetRevision: main
    path: k8s/production
  destination:
    server: https://kubernetes.default.svc
    namespace: production
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
```

**זרימת עבודה טיפוסית:**
```
1. Push קוד -> CI בונה Docker image ודוחף לרג'יסטרי
2. CI מעדכן את קובץ ה-manifest ב-repo נפרד (myapp-manifests) עם ה-tag החדש
3. ArgoCD מזהה שינוי ב-Git, ומסנכרן אוטומטית את ה-cluster
```

## עדכון Deployment מ-Pipeline (גישה קלאסית ללא GitOps)

```yaml
# GitHub Actions step
- name: Deploy to Kubernetes
  run: |
    kubectl set image deployment/myapp \
      myapp=ghcr.io/myorg/myapp:${{ github.sha }} \
      -n production
    kubectl rollout status deployment/myapp -n production --timeout=120s
```

## Helm – ניהול Manifests כ-Package

```yaml
# values.yaml
image:
  repository: ghcr.io/myorg/myapp
  tag: a1b2c3d
replicaCount: 3
```

```bash
helm upgrade --install myapp ./helm-chart \
  --set image.tag=$GITHUB_SHA \
  --namespace production
```

## טיפים וטריקים

1. **Readiness/Liveness Probes** – חיוני כדי ש-Kubernetes ידע מתי Pod מוכן לקבל תעבורה ומתי הוא "תקוע" וצריך restart.
2. **Rollback מהיר** – `kubectl rollout undo deployment/myapp` מחזיר לגרסה הקודמת מיידית.
3. **maxUnavailable: 0** – מבטיח Zero-Downtime deployment, אך דורש `maxSurge` גדול מ-0.
4. **GitOps עדיף על `kubectl` ישיר מ-CI** – שומר Single Source of Truth ב-Git, מאפשר audit trail, ומפריד הרשאות (CI לא צריך גישת כתיבה ל-cluster).
5. **Namespace לכל סביבה** – `staging`, `production` כ-namespaces נפרדים עם RBAC נפרד.
6. **Resource Requests/Limits** – תמיד הגדר, אחרת Pod אחד "רעב" עלול להרעיב את כל ה-node.

## שאלות ראיון עבודה נפוצות

**ש: מה ההבדל בין Blue-Green ל-Canary Deployment?**
ת: Blue-Green מעביר 100% מהתעבורה בבת אחת בין שתי סביבות זהות – rollback מיידי אך דורש כפול משאבים. Canary מעביר אחוז הולך וגדל מהתעבורה בהדרגה תוך ניטור מטריקות – מסוכן פחות אך איטי יותר ומורכב יותר למימוש.

**ש: מה זה GitOps ומה היתרון שלו על פני `kubectl` ישיר מ-CI?**
ת: GitOps הופך את Git למקור אמת יחיד למצב ה-cluster; כלי כמו ArgoCD מסנכרן באופן רציף. זה נותן audit trail מלא, אפשרות rollback על ידי `git revert`, והפרדת הרשאות (ה-CI לא צריך גישת כתיבה ישירה לcluster).

**ש: מה תפקידם של Readiness ו-Liveness Probes בהקשר של deployment?**
ת: Readiness Probe קובע מתי Pod מוכן לקבל תעבורה (חשוב במהלך rolling update כדי לא לשלוח תעבורה ל-pod שעדיין לא התאתחל). Liveness Probe קובע אם Pod "תקוע" וצריך להיות מופעל מחדש.

**ש: איך מבצעים Zero-Downtime Deployment ב-Kubernetes?**
ת: שילוב של RollingUpdate strategy עם `maxUnavailable: 0`, Readiness Probes נכונים, ו-graceful shutdown באפליקציה (טיפול ב-SIGTERM) כדי לסיים בקשות פתוחות לפני שה-Pod נסגר.

**ש: מה ההבדל בין Helm ל-kubectl apply רגיל?**
ת: Helm הוא package manager ל-Kubernetes שמאפשר תבניות (templates) עם ערכים פרמטריים (`values.yaml`), ניהול גרסאות (releases), ו-rollback קל. `kubectl apply` פשוט מחיל manifest סטטי ללא ניהול מצב/היסטוריה מובנה.

**ש: איך מבוצע rollback מהיר בפרודקשן?**
ת: ב-Kubernetes וניל: `kubectl rollout undo deployment/<name>`. בגישת GitOps: `git revert` על הקומיט שהכניס את השינוי, ו-ArgoCD/Flux יסנכרנו אוטומטית את המצב הקודם.

## קישורים חיצוניים

**YouTube:**
- [Kubernetes Course – TechWorld with Nana](https://teracourses.com/en/course/kubernetes-course2)
- [ArgoCD Tutorial for Beginners](https://www.youtube.com/results?search_query=argocd+tutorial+for+beginners)
- [Canary vs Blue-Green Deployment Explained](https://www.youtube.com/results?search_query=canary+vs+blue+green+deployment+explained)

**דוקומנטציה:**
- [Kubernetes Deployments Docs](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)
- [ArgoCD Documentation](https://argo-cd.readthedocs.io/)
- [Helm Documentation](https://helm.sh/docs/)
- [Argo Rollouts (Canary/Blue-Green)](https://argoproj.github.io/argo-rollouts/)
