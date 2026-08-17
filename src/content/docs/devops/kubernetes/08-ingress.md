---
title: "Ingress ו-Ingress Controllers"
category: DevOps/Kubernetes
part: 8/10
---

## תוכן עניינים
1. [מהו Ingress ולמה הוא נחוץ](#מהו-ingress)
2. [Ingress Controller - הרכיב שבלעדיו שום דבר לא עובד](#ingress-controller)
3. [דוגמת YAML בסיסית](#דוגמה-בסיסית)
4. [ניתוב מבוסס Path ו-Host](#ניתוב]
5. [TLS/HTTPS ב-Ingress](#tls)
6. [Annotations נפוצים (NGINX Ingress)](#annotations)
7. [Ingress מול Gateway API](#gateway-api)
8. [פקודות kubectl שימושיות](#פקודות)
9. [טיפים וטריקים](#טיפים)
10. [שאלות ראיון עבודה](#שאלות)
11. [קישורים חיצוניים](#קישורים)

---

## מהו Ingress ולמה הוא נחוץ {#מהו-ingress}

נניח שיש לכם 10 מיקרו-שירותים שונים, וכל אחד רוצה להיות נגיש מהאינטרנט. הפתרון הפשוט - Service מסוג LoadBalancer לכל שירות - יקר (כל LB בענן עולה כסף בנפרד) ולא נוח לניהול.

**Ingress** הוא אובייקט ברמת **L7 (HTTP/HTTPS)** שמאפשר לנתב תעבורה **חיצונית** לכמה Services שונים דרך **כתובת IP ציבורית אחת בלבד**, על בסיס:

- **Host** - למשל `api.example.com` מול `app.example.com`
- **Path** - למשל `/api` מול `/admin`
- כולל תמיכה מובנית ב-**TLS termination** (הצפנת HTTPS)

```
                        ┌─────────────────┐
Internet ──HTTPS──────▶│  Ingress          │
                        │  (כתובת אחת)      │
                        └────────┬─────────┘
                    host/path routing
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
     Service A      Service B      Service C
    (api.ex.com)   (app.ex.com)  (admin.ex.com/*)
```

---

## Ingress Controller - הרכיב שבלעדיו שום דבר לא עובד {#ingress-controller}

**הטעות הכי נפוצה של מתחילים:** יצירת אובייקט Ingress לא עושה כלום בפני עצמה! Kubernetes **לא כולל** Ingress Controller מובנה - צריך להתקין אחד בנפרד. ה-Controller הוא זה שקורא את אובייקטי ה-Ingress ומתרגם אותם לחוקי routing בפועל (בדרך כלל דרך Load Balancer בענן + reverse proxy).

הפופולריים ביותר:
- **NGINX Ingress Controller** - הכי נפוץ, קוד פתוח
- **Traefik** - קל למדי, פופולרי בסביבות פיתוח
- **AWS Load Balancer Controller** - ל-EKS, יוצר ALB בפועל
- **Cloud-native controllers** (GKE Ingress, Azure Application Gateway Ingress Controller)

```bash
# התקנת NGINX Ingress Controller דרך Helm
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx --create-namespace
```

---

## דוגמת YAML בסיסית {#דוגמה-בסיסית}

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: basic-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  ingressClassName: nginx
  rules:
    - host: myapp.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: webapp-svc
                port:
                  number: 80
```

```bash
kubectl apply -f basic-ingress.yaml
kubectl get ingress
kubectl describe ingress basic-ingress
```

---

## ניתוב מבוסס Path ו-Host {#ניתוב}

### ניתוב לפי Path (אותו דומיין, כמה שירותים)

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: path-based-ingress
spec:
  ingressClassName: nginx
  rules:
    - host: example.com
      http:
        paths:
          - path: /api
            pathType: Prefix
            backend:
              service:
                name: api-svc
                port:
                  number: 80
          - path: /admin
            pathType: Prefix
            backend:
              service:
                name: admin-svc
                port:
                  number: 80
          - path: /
            pathType: Prefix
            backend:
              service:
                name: frontend-svc
                port:
                  number: 80
```

### ניתוב לפי Host (Virtual Hosting - כמה דומיינים על אותה תשתית)

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: host-based-ingress
spec:
  ingressClassName: nginx
  rules:
    - host: api.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: api-svc
                port:
                  number: 80
    - host: app.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: frontend-svc
                port:
                  number: 80
```

**סוגי pathType:**
- `Exact` - התאמה מדויקת בלבד
- `Prefix` - התאמה לכל נתיב שמתחיל בקידומת זו
- `ImplementationSpecific` - תלוי ב-Controller הספציפי

---

## TLS/HTTPS ב-Ingress {#tls}

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: tls-ingress
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  ingressClassName: nginx
  tls:
    - hosts:
        - myapp.example.com
      secretName: myapp-tls-secret   # Secret מסוג kubernetes.io/tls
  rules:
    - host: myapp.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: webapp-svc
                port:
                  number: 80
```

**עם cert-manager**, הפקת ותחזוקת תעודות SSL אוטומטית מ-Let's Encrypt נעשית לגמרי אוטומטית - אין צורך לחדש ידנית.

---

## Annotations נפוצים (NGINX Ingress) {#annotations}

```yaml
metadata:
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /$1
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/proxy-body-size: "50m"
    nginx.ingress.kubernetes.io/rate-limit: "100"
    nginx.ingress.kubernetes.io/cors-allow-origin: "https://example.com"
    nginx.ingress.kubernetes.io/affinity: "cookie"     # sticky sessions
```

---

## Ingress מול Gateway API {#gateway-api}

חשוב לדעת לראיון: Kubernetes מפתח כיום תקן חדש בשם **Gateway API** שנועד להחליף בהדרגה את Ingress, ופותר כמה מגבלות ידועות שלו:

| | Ingress (הישן) | Gateway API (החדש) |
|---|---|---|
| הפרדת תפקידים | מוגבל - הכל בקובץ אחד | מפריד Infra (GatewayClass/Gateway) מ-Routes |
| תמיכה בפרוטוקולים | HTTP/HTTPS בעיקר | HTTP, gRPC, TCP, UDP, TLS |
| התנהגות בין ספקים | תלויה מאוד ב-annotations | סטנדרטית יותר, פחות "וונדור לוק-אין" |
| בגרות | יציב, נפוץ מאוד עדיין | הולך וגדל, כבר GA |

---

## פקודות kubectl שימושיות {#פקודות}

```bash
# הצגת כל האינגרסים
kubectl get ingress
kubectl get ingress -A

# הצגת ה-IngressClasses הזמינים
kubectl get ingressclass

# בדיקת סטטוס וכתובת ה-LoadBalancer של ה-Controller
kubectl get svc -n ingress-nginx

# בדיקת routing עם curl (עם header Host ידני, כשאין DNS אמיתי)
curl -H "Host: myapp.example.com" http://<INGRESS-IP>/

# לוגים של ה-Ingress Controller לדיבאג
kubectl logs -n ingress-nginx -l app.kubernetes.io/component=controller -f
```

---

## טיפים וטריקים {#טיפים}

1. **תמיד תוודאו שמותקן Ingress Controller** לפני שאתם מתפלאים ש-"Ingress לא עובד" - זו הבעיה הכי נפוצה של מתחילים.
2. **`ingressClassName` הוא חובה** בגרסאות חדשות אם יש כמה controllers מותקנים בקלאסטר (למשל NGINX + Traefik יחד).
3. **local testing עם /etc/hosts** - כדי לבדוק host-based routing מקומית בלי DNS אמיתי, הוסיפו שורה כמו `127.0.0.1 myapp.local` לקובץ hosts.
4. **cert-manager הוא כמעט חובה** לפרודקשן - הפקה ידנית וניהול תעודות SSL הוא כאב ראש מיותר.
5. **rewrite-target דורש regex תואם ב-path** - טעות נפוצה היא לשכוח group capture ב-`path` כשמשתמשים ב-`$1` ב-rewrite-target.
6. **Rate Limiting ו-CORS** - שני annotations שכמעט תמיד רלוונטיים ל-API ציבורי, ולעיתים קרובות נשכחים.

---

## שאלות ראיון עבודה {#שאלות}

**ש: מה ההבדל בין Service מסוג LoadBalancer ל-Ingress?**
ת: Service מסוג LoadBalancer עובד ברמת L4 (TCP/UDP) ודורש Load Balancer נפרד (ויקר) לכל שירות. Ingress עובד ברמת L7 (HTTP/HTTPS) ומאפשר לנתב תעבורה לכמה Services שונים דרך כתובת IP/Load Balancer אחת, בהתבסס על host ו-path.

**ש: למה יצירת אובייקט Ingress לבד לא מספיקה?**
ת: כי Ingress הוא רק "הצהרה" על כללי הניתוב הרצויים - צריך Ingress Controller (כמו NGINX Ingress Controller) שרץ בפועל בקלאסטר ומיישם את הכללים האלו, אחרת שום תעבורה לא תנותב בפועל.

**ש: איך עובד TLS termination ב-Ingress?**
ת: ה-Ingress מפנה ל-Secret מסוג `kubernetes.io/tls` שמכיל תעודה ומפתח פרטי. ה-Ingress Controller מפענח (terminates) את החיבור המוצפן ברמתו, ולרוב שולח תעבורה לא מוצפנת (HTTP רגיל) הלאה ל-Pods בתוך הקלאסטר.

**ש: מה תפקידו של cert-manager?**
ת: כלי (operator) שמנפיק ומחדש אוטומטית תעודות TLS - למשל מ-Let's Encrypt - ומכניס אותן ל-Secret המתאים, כך שלא צריך תהליך ידני לניהול תעודות SSL.

**ש: מה ההבדל בין ניתוב מבוסס Path לניתוב מבוסס Host ב-Ingress?**
ת: ניתוב מבוסס Path מנתב תעבורה מאותו דומיין לשירותים שונים לפי הנתיב (למשל `/api` מול `/admin`). ניתוב מבוסס Host מנתב לפי כותרת ה-Host עצמה, כלומר תומך בכמה דומיינים שונים (`api.example.com` מול `app.example.com`) על אותו Ingress.

**ש: מהו Gateway API ולמה הוא נוצר?**
ת: תקן חדש יותר ב-Kubernetes שנועד להחליף בהדרגה את Ingress. הוא מפריד תפקידים בבירור יותר (תשתית מול routing), תומך ביותר פרוטוקולים (לא רק HTTP), ופחות תלוי ב-annotations ספציפיים לספק, מה שמפחית vendor lock-in.

---

## קישורים חיצוניים {#קישורים}

### תיעוד רשמי
- Ingress: https://kubernetes.io/docs/concepts/services-networking/ingress/
- Ingress Controllers: https://kubernetes.io/docs/concepts/services-networking/ingress-controllers/
- NGINX Ingress Controller: https://kubernetes.github.io/ingress-nginx/
- Gateway API: https://gateway-api.sigs.k8s.io/
- cert-manager: https://cert-manager.io/docs/

### סרטוני YouTube
- TechWorld with Nana - Ingress Explained: https://www.youtube.com/c/techworldwithnana
- פלייליסט קורס מלא: https://www.youtube.com/playlist?list=PLy7NrYWoggjziYQIDorlXjTvvwweTYoNC

---

**הקודם:** [מדריך 7 - RBAC ואבטחה](/devops/kubernetes/07-rbac-security/) | **הבא:** [מדריך 9 - Monitoring & Logging](/devops/kubernetes/09-monitoring-logging/)
