---
title: "מבוא ל-Helm — מנהל החבילות של Kubernetes"
category: DevOps/Helm
part: 1/10
---

## מה זה Helm?

Helm הוא **מנהל החבילות (Package Manager)** הרשמי של Kubernetes. בדיוק כמו ש-`apt` מנהל חבילות ב-Ubuntu, או `npm` מנהל חבילות ב-Node.js — כך Helm מנהל את הפריסה (deployment) של אפליקציות ב-Kubernetes.

Helm נוצר במקור על ידי Deis (נרכשה על ידי Microsoft), ובשנת 2018 הפך לפרויקט רשמי של **CNCF** (Cloud Native Computing Foundation) — אותו ארגון שמנהל את Kubernetes עצמו.

## למה בכלל צריך Helm?

כשעובדים עם Kubernetes "נטו" (vanilla), כדי לפרוס אפליקציה פשוטה צריך בדרך כלל כמה קבצי YAML:

```yaml
# deployment.yaml
# service.yaml
# configmap.yaml
# secret.yaml
# ingress.yaml
# hpa.yaml
```

עבור כל סביבה (dev, staging, production) צריך גרסאות מעט שונות של אותם קבצים — למשל מספר replicas שונה, משאבי CPU/Memory שונים, דומיינים שונים ב-Ingress וכו'. בלי כלי ניהול, זה הופך למהר מאוד לבלגן של קבצי YAML כפולים עם שינויים קטנים.

### הבעיות ש-Helm פותר:

1. **שכפול קוד (Duplication)** — במקום להעתיק-להדביק YAML לכל סביבה, יוצרים תבנית (template) אחת עם משתנים.
2. **ניהול גרסאות (Versioning)** — כל פריסה (release) מקבלת מספר גרסה, וניתן לבצע `rollback` בקלות לגרסה קודמת.
3. **שיתוף חבילות** — ניתן להוריד "חבילות" מוכנות (Charts) לאפליקציות פופולריות כמו PostgreSQL, Redis, Nginx, Prometheus וכו', ולהתקין אותן בפקודה אחת.
4. **ניהול תלויות (Dependencies)** — אפליקציה שדורשת גם בסיס נתונים וגם cache, יכולה להצהיר על כך כתלות (dependency) בתוך ה-Chart שלה.
5. **Atomic operations** — התקנה, שדרוג ומחיקה מנוהלים כפעולה אחת שניתן להחזיר אחורה (rollback) אם משהו נכשל.

## מושגי יסוד ב-Helm

| מושג | הסבר |
|---|---|
| **Chart** | חבילה של קבצי Kubernetes (templates) יחד עם קובץ הגדרות. זו ה"יחידה" הבסיסית ב-Helm — דומה ל-package ב-npm או ל-.deb ב-Ubuntu |
| **Release** | מופע (instance) מותקן של Chart בקלאסטר. אפשר להתקין את אותו Chart כמה פעמים עם שמות release שונים |
| **Repository** | מקום (בדרך כלל HTTP server) שבו מאוחסנים Charts שניתן להוריד ולהתקין |
| **Values** | קובץ (`values.yaml`) המכיל את הפרמטרים הניתנים להתאמה אישית של ה-Chart |
| **Templates** | קבצי YAML עם תחביר templating (מבוסס על שפת Go templates) שמייצרים את מניפסטי ה-Kubernetes הסופיים |

## ארכיטקטורה: Helm 2 מול Helm 3

זה נושא חשוב מאוד גם להבנה טכנית וגם לראיונות עבודה:

### Helm 2 (ישן, לא נתמך יותר מ-2020)
- השתמש ברכיב שרת בשם **Tiller** שרץ *בתוך* הקלאסטר.
- Tiller קיבל הרשאות רחבות (לעיתים `cluster-admin`), מה שיצר **בעיית אבטחה משמעותית**.
- כל מי שהיה לו גישה ל-Tiller יכול היה תיאורטית לנהל את כל הקלאסטר.

### Helm 3 (הגרסה הנוכחית, מאז 2019)
- **הוסר Tiller לחלוטין** — Helm הוא כעת רק CLI client, ללא רכיב שרת בקלאסטר.
- Helm 3 משתמש ב-**Kubernetes API** ישירות, עם ההרשאות של המשתמש שמריץ אותו (RBAC רגיל).
- מידע על releases נשמר כ-**Secrets** בתוך ה-namespace הרלוונטי (בעבר ב-ConfigMaps ב-`kube-system`).
- נוספה תמיכה ב-**Library Charts** (charts שהם רק ספריות שיתוף קוד, בלי release משלהם).
- שופר ניהול ה-**Dependencies** (הוחלף `requirements.yaml` ב-`Chart.yaml` עצמו).
- נוסף `helm.sh/v2beta1` -> Release information stored as Secrets by default (מוצפן).

> **טיפ לראיון עבודה:** שאלה נפוצה מאוד היא "מה השינוי המרכזי בין Helm 2 ל-Helm 3?" — התשובה המרכזית שמצפים לשמוע היא **הסרת Tiller ובעיית האבטחה שנפתרה**.

## דוגמה מהירה: התקנת Chart ראשון

```bash
# הוספת repository רשמי
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update

# התקנת nginx עם שם release "my-nginx"
helm install my-nginx bitnami/nginx

# בדיקת סטטוס
helm status my-nginx

# צפייה בכל ה-releases המותקנים
helm list
```

הפקודה `helm install` תיצור בפועל את כל אובייקטי ה-Kubernetes (Deployment, Service וכו') בהתאם למה שמוגדר ב-Chart, עם הערכים המוגדרים ב-`values.yaml` (או אלו שסיפקתם ידנית).

## תרשים זרימה: איך Helm עובד

```
┌─────────────┐      ┌──────────────┐      ┌────────────────────┐
│   Chart      │      │   Values     │      │  Kubernetes API    │
│ (Templates)  │  +   │   (YAML)     │  =>  │  Server             │
└─────────────┘      └──────────────┘      └────────────────────┘
       │                                              │
       │            helm template engine              │
       └──────────────────►│◄─────────────────────────┘
                            ▼
                  מניפסטים סופיים (rendered YAML)
                            ▼
                 נשלחים ל-kube-apiserver ליישום
```

## מקורות ולמידה נוספת

### דוקומנטציה רשמית
- 📘 [Helm.sh - Documentation Home](https://helm.sh/docs/)
- 📘 [Helm - What is Helm?](https://helm.sh/docs/intro/using_helm/)
- 📘 [CNCF Helm Project Page](https://www.cncf.io/projects/helm/)
- 📘 [Helm GitHub Repository](https://github.com/helm/helm)

### סרטוני יוטיוב מומלצים (חיפושים מובילים)
- 🎥 [Helm Tutorial for Beginners - חיפוש ביוטיוב](https://www.youtube.com/results?search_query=Helm+Kubernetes+Tutorial+for+Beginners)
- 🎥 [What is Helm and Why We Need It - חיפוש ביוטיוב](https://www.youtube.com/results?search_query=What+is+Helm+Kubernetes+package+manager)
- 🎥 [TechWorld with Nana - Helm Crash Course - חיפוש ביוטיוב](https://www.youtube.com/results?search_query=TechWorld+with+Nana+Helm)

## שאלות לחזרה עצמית

1. מה ההבדל בין Chart ל-Release?
2. מדוע Helm 3 נחשב בטוח יותר מ-Helm 2?
3. איפה Helm 3 שומר את המידע על releases מותקנים?
4. מה תפקידו של קובץ `values.yaml`?

---
**המשך למדריך הבא:** [מדריך 2 - התקנה והגדרה ראשונית](/devops/helm/02-hatkana-vehagdara/)
