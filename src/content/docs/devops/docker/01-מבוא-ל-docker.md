---
title: מבוא ל-Docker - מה זה ולמה צריך את זה
category: DevOps/Docker
part: 1/10
---

## מה זה Docker?

Docker היא פלטפורמה ל**קונטיינריזציה** (Containerization) - טכנולוגיה שמאפשרת לארוז אפליקציה יחד עם כל התלויות שלה (ספריות, קבצי הגדרה, סביבת ריצה) ליחידה אחת עצמאית שנקראת **Container** (קונטיינר).

הרעיון המרכזי: "It works on my machine" הופך ל"זה עובד בכל מקום", כי הקונטיינר מכיל את כל מה שהאפליקציה צריכה כדי לרוץ.

## הבעיה ש-Docker פותר

לפני Docker, כשמפתח כתב אפליקציה במחשב שלו והיא עבדה מצוין, לרוב היא "נשברה" כשהיא עברה לשרת הפרודקשן, בגלל:

- גרסאות שונות של שפות תכנות (Python 3.8 מול 3.11)
- ספריות מערכת שחסרות או בגרסה אחרת
- הבדלי הגדרות בין מערכות הפעלה
- תלות ב"קונפיגורציה מקומית" שלא תועדה

Docker פותר את זה על ידי אריזת **כל הסביבה** יחד עם הקוד.

## קונטיינרים מול מכונות וירטואליות (VM)

זו אחת השאלות הכי נפוצות בתחילת הדרך, וגם שאלת ראיון קלאסית.

| מאפיין | Virtual Machine | Docker Container |
|---|---|---|
| וירטואליזציה של | חומרה (Hardware) | מערכת ההפעלה (OS) |
| מערכת הפעלה | כל VM מריץ OS מלא משלו | כל הקונטיינרים חולקים את ה-Kernel של המארח |
| גודל | ג'יגה-בייטים | לרוב מגה-בייטים |
| זמן עלייה (Boot) | דקות | שניות (או פחות) |
| ביצועים | overhead גבוה יותר | overhead נמוך, קרוב לביצועי המארח |
| בידוד (Isolation) | בידוד מלא ברמת החומרה | בידוד ברמת התהליך (process) |
| כלי נפוץ | VMware, VirtualBox, Hyper-V | Docker, Podman, containerd |

**באנלוגיה:** VM זה כמו בית נפרד לגמרי עם תשתית משלו (חשמל, מים). קונטיינר זה כמו דירה בבניין משותף - יש תשתית משותפת (ה-Kernel), אבל לכל דירה יש דלת נעולה משלה (namespace ו-cgroups).

## איך Docker עובד מבפנית (ברמה גבוהה)

Docker משתמש בשתי טכנולוגיות ליבה של לינוקס:

1. **Namespaces** - מבודדים את מה שהתהליך "רואה": מערכת קבצים, רשת, PIDs (מזהי תהליכים), משתמשים וכו'. כל קונטיינר "חושב" שהוא לבד במערכת.
2. **Control Groups (cgroups)** - מגבילים ומנהלים כמה משאבים (CPU, זיכרון, דיסק) כל קונטיינר יכול לצרוך.

Docker בעצם "עוטף" את שתי הטכנולוגיות האלה בממשק נוח לשימוש.

## מונחי יסוד שחשוב להכיר

- **Image** - "תבנית" קריאה בלבד (read-only) שמכילה את האפליקציה, התלויות, וההגדרות. חושבים על זה כמו על "מתכון" (Blueprint) לקונטיינר.
- **Container** - מופע רץ (running instance) של Image. אפשר להריץ כמה קונטיינרים מאותו Image.
- **Dockerfile** - קובץ טקסט עם הוראות איך לבנות Image.
- **Docker Engine** - השירות (daemon) שרץ ברקע ומנהל את הקונטיינרים, ה-Images, הרשתות והנפחים (volumes).
- **Docker Hub** - מאגר ציבורי (Registry) של Images מוכנים לשימוש (כמו GitHub אבל ל-Images).
- **Registry** - שרת ששומר ומפיץ Images (Docker Hub הוא Registry ציבורי, אבל אפשר גם Registry פרטי).

## ארכיטקטורת Docker

```
┌─────────────────────────────────────────────┐
│                 Docker Client                │
│         (docker run, docker build...)        │
└───────────────────┬───────────────────────────┘
                     │ REST API
┌───────────────────▼───────────────────────────┐
│               Docker Daemon (dockerd)         │
│  - בונה Images                                │
│  - מריץ Containers                            │
│  - מנהל Networks ו-Volumes                    │
└──────┬───────────────────────┬────────────────┘
       │                       │
┌──────▼──────┐        ┌───────▼────────┐
│   Images    │        │   Registry      │
│  (מקומיים)  │◄──────►│  (Docker Hub)   │
└─────────────┘        └────────────────┘
```

הלקוח (Client) שולח פקודות לדימון (Daemon) דרך REST API, והדימון הוא זה שבפועל מבצע את העבודה - בונה Images, מריץ קונטיינרים, מתקשר עם ה-Registry להורדת/העלאת Images.

## דוגמה ראשונה - "Hello World"

```bash
docker run hello-world
```

מה קורה כאן בפועל:
1. Docker בודק אם ה-Image `hello-world` קיים מקומית.
2. אם לא - הוא מוריד (pull) אותו מ-Docker Hub.
3. Docker יוצר קונטיינר חדש מה-Image.
4. הקונטיינר רץ, מדפיס הודעה, ומסתיים.

דוגמה שימושית יותר - הרצת שרת Nginx:

```bash
docker run -d -p 8080:80 --name my-nginx nginx
```

- `-d` = מריץ ברקע (detached mode)
- `-p 8080:80` = ממפה פורט 8080 במחשב שלכם לפורט 80 בקונטיינר
- `--name my-nginx` = נותן שם לקונטיינר
- `nginx` = שם ה-Image

עכשיו אפשר לגשת ל-`http://localhost:8080` ולראות את דף הבית של Nginx.

## למה כדאי ללמוד Docker כיום?

- **תעשייתי סטנדרטי** - כמעט כל חברת טכנולוגיה משתמשת ב-Docker בצורה כלשהי.
- **בסיס ל-Kubernetes** - כדי להבין Kubernetes (K8s) חובה להבין קונטיינרים קודם.
- **CI/CD** - כל pipeline מודרני (GitHub Actions, GitLab CI, Jenkins) משתמש בקונטיינרים לבנייה ובדיקות.
- **Microservices** - הארכיטקטורה המודרנית מבוססת על שירותים קטנים ועצמאיים, וקונטיינרים הם הדרך הטבעית להריץ אותם.
- **דרישת סף בראיונות עבודה** - כמעט כל משרת DevOps, Backend או SRE דורשת ידע ב-Docker.

## קישורים חיצוניים

**וידאו:**
- [Docker Tutorial for Beginners - freeCodeCamp](https://www.youtube.com/watch?v=fqMOX6JJhGo)
- [Docker in 100 Seconds - Fireship](https://www.youtube.com/watch?v=Gjnup-PuquQ)
- [What is Docker (Official)](https://www.youtube.com/watch?v=SnSH8Ht3MIc)

**דוקומנטציה רשמית:**
- [Docker Overview](https://docs.docker.com/get-started/overview/)
- [What is a Container?](https://www.docker.com/resources/what-container/)
- [Docker Architecture](https://docs.docker.com/get-started/docker-overview/)

## טיפים וטריקים

- אל תבלבלו בין **Image** ל-**Container** - זו אחת הטעויות הכי נפוצות למתחילים. Image = תבנית, Container = מופע רץ.
- אפשר להריץ כמה קונטיינרים מאותו Image במקביל, בלי שהם ישפיעו אחד על השני.
- Docker Desktop (ל-Windows/Mac) כולל בתוכו את ה-Engine, ה-CLI, וממשק גרפי - נוח מאוד למתחילים.

## שאלות ראיון נפוצות בנושא

1. **מה ההבדל בין Container ל-Virtual Machine?**
   תשובה קצרה: VM מוירטואליזציה ברמת החומרה וכולל OS משלו; Container חולק את ה-Kernel של המארח ומבודד ברמת התהליך, ולכן קליל וטעון מהר יותר.

2. **מה ההבדל בין Image ל-Container?**
   Image הוא תבנית read-only; Container הוא מופע רץ (writable layer מעל ה-Image) של אותו Image.

3. **מה זה Docker Engine?**
   השירות (daemon) שאחראי על בניית Images, הרצת קונטיינרים, וניהול networking ו-storage.

4. **למה קונטיינרים "קלים" יותר מ-VMs?**
   כי הם לא צריכים להריץ OS מלא - הם משתמשים ב-Kernel המשותף של המארח דרך namespaces ו-cgroups.

5. **מה זה Docker Hub?**
   Registry ציבורי לאחסון והפצה של Docker Images.

---

**בחלק הבא:** [התקנה והגדרה ראשונית של Docker](/devops/docker/02-התקנה-והגדרה/)
