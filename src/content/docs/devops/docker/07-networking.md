---
title: Docker Networking
category: DevOps/Docker
part: 7/10
---

## סוגי רשתות ב-Docker

Docker מגיע עם כמה **network drivers** מובנים:

```bash
docker network ls
```

תוצאה טיפוסית:
```
NETWORK ID     NAME      DRIVER    SCOPE
xxxxxxxxxxxx   bridge    bridge    local
xxxxxxxxxxxx   host      host      local
xxxxxxxxxxxx   none      null      local
```

### 1. Bridge (ברירת מחדל)

רשת וירטואלית פרטית במארח. כל קונטיינר מקבל IP פנימי, ו-Docker מנהל NAT כדי לתרגם תעבורה מבחוץ.

```bash
docker run -d --name web nginx
# רץ אוטומטית על רשת ה-bridge הדיפולטית
```

### 2. Host

הקונטיינר משתמש ישירות ב-network stack של המארח - ללא בידוד רשתי, ללא NAT, ביצועים מקסימליים.

```bash
docker run -d --network host nginx
```

**שימו לב:** במצב host, אין למפות פורטים עם `-p` - הקונטיינר פשוט משתמש בפורטים של המארח ישירות. לא זמין ב-Docker Desktop על Windows/Mac (רק Linux).

### 3. None

ללא רשת כלל - בידוד מלא.

```bash
docker run -d --network none myapp
```

### 4. Overlay

רשת מרובת-מארחים (multi-host) - מאפשרת לקונטיינרים על שרתים שונים לתקשר כאילו הם על אותה רשת. משמש בעיקר עם Docker Swarm ו-Kubernetes.

### 5. Macvlan

נותן לקונטיינר כתובת MAC משלו, כך שהוא נראה כמכשיר פיזי נפרד ברשת הפיזית - שימושי כשצריך קונטיינרים שנראים כהתקנים עצמאיים.

## User-defined Bridge Networks - למה עדיף מה-default

הרשת default bridge **לא** תומכת ב-DNS resolution אוטומטי בין קונטיינרים (חייבים `--link` הישן). רשת מותאמת (user-defined) כן תומכת - קונטיינרים יכולים למצוא אחד את השני **לפי שם**.

```bash
# יצירת רשת מותאמת
docker network create my-app-network

# הרצת קונטיינרים על אותה רשת
docker run -d --name backend --network my-app-network myapp-backend
docker run -d --name database --network my-app-network postgres

# עכשיו backend יכול לגשת ל-database פשוט לפי השם:
# postgresql://database:5432/mydb
```

בתוך קונטיינר `backend`, אפשר לבדוק:
```bash
docker exec backend ping database
# עובד! DNS resolution אוטומטי לפי שם הקונטיינר
```

## פקודות ניהול רשת

```bash
# יצירת רשת
docker network create --driver bridge my-network

# יצירת רשת עם subnet מותאם
docker network create --subnet=172.20.0.0/16 my-network

# מידע מפורט (כולל אילו קונטיינרים מחוברים)
docker network inspect my-network

# חיבור קונטיינר רץ לרשת נוספת
docker network connect my-network existing-container

# ניתוק קונטיינר מרשת
docker network disconnect my-network existing-container

# מחיקת רשת
docker network rm my-network

# ניקוי רשתות שלא בשימוש
docker network prune
```

## מיפוי פורטים (Port Mapping) לעומק

```bash
# פורט מארח -> פורט קונטיינר
docker run -d -p 8080:80 nginx

# האזנה רק על interface ספציפי (למשל localhost בלבד, לא כל הרשת)
docker run -d -p 127.0.0.1:8080:80 nginx

# מיפוי טווח פורטים
docker run -d -p 8000-8010:8000-8010 myapp

# UDP
docker run -d -p 53:53/udp mydns

# מיפוי אקראי (Docker בוחר פורט פנוי)
docker run -d -p 80 nginx
docker port <container>   # לבדוק איזה פורט נבחר
```

## דוגמה מלאה - אפליקציית 3 שכבות

```bash
# רשת ייעודית
docker network create app-net

# דאטהבייס
docker run -d --name db --network app-net \
  -e POSTGRES_PASSWORD=secret \
  -v db-data:/var/lib/postgresql/data \
  postgres:16

# Backend - מתחבר ל-db לפי שם
docker run -d --name api --network app-net \
  -e DATABASE_URL=postgresql://postgres:secret@db:5432/postgres \
  -p 3000:3000 \
  my-backend-image

# Frontend - מתחבר ל-api (יכול להיות גם דרך localhost:3000 מהדפדפן)
docker run -d --name web --network app-net \
  -p 80:80 \
  my-frontend-image
```

תרשים:
```
Internet
   │
   ▼
┌──────────────┐  port 80         ┌──────────────┐
│   Frontend   │◄─────────────────┤   (browser)  │
│  (web)       │                  └──────────────┘
└──────┬───────┘
       │  app-net (internal DNS)
       ▼
┌──────────────┐  port 3000
│   Backend    │◄──────── exposed to host too
│  (api)       │
└──────┬───────┘
       │  app-net
       ▼
┌──────────────┐
│  Database    │  (not exposed externally - only reachable via app-net)
│  (db)        │
└──────────────┘
```

**עיקרון אבטחה חשוב:** לדאטהבייס אין צורך ב-`-p` (חשיפה למארח) בכלל - הוא נגיש רק דרך הרשת הפנימית `app-net`. ככל שחושפים פחות פורטים החוצה, כך משטח התקיפה קטן יותר.

## בידוד רשתי בין שירותים

אפשר ליצור כמה רשתות ולחבר קונטיינרים באופן סלקטיבי - כך למשל frontend לא יכול לדבר ישירות עם database:

```bash
docker network create frontend-net
docker network create backend-net

docker run -d --name db --network backend-net postgres
docker run -d --name api --network backend-net my-api
docker network connect frontend-net api   # api מחובר לשתי הרשתות
docker run -d --name web --network frontend-net my-web

# web לא יכול לגשת ל-db ישירות - רק דרך api
```

## דיבוג בעיות רשת

```bash
# בדיקת IP של קונטיינר
docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' mycontainer

# בדיקת DNS מתוך קונטיינר
docker exec mycontainer nslookup other-container
docker exec mycontainer ping other-container

# רשימת קונטיינרים על רשת ספציפית
docker network inspect my-network --format '{{range .Containers}}{{.Name}} {{end}}'

# בדיקת פורטים פתוחים בתוך קונטיינר
docker exec mycontainer netstat -tulpn
```

## קישורים חיצוניים

**וידאו:**
- [Docker Networking Explained](https://www.youtube.com/watch?v=bKFMS5C4CG0)
- [Docker Networking Deep Dive - NDC](https://www.youtube.com/watch?v=P5CWy4o171E)

**דוקומנטציה רשמית:**
- [Docker Networking Overview](https://docs.docker.com/engine/network/)
- [Network Drivers](https://docs.docker.com/engine/network/drivers/)
- [Bridge network driver](https://docs.docker.com/engine/network/drivers/bridge/)

## טיפים וטריקים

- **תמיד** השתמשו ברשת מותאמת אישית (`docker network create`), לא ברשת ה-default bridge - כדי לקבל DNS resolution לפי שם.
- אל תחשפו פורטים (`-p`) לשירותים פנימיים שלא צריכים גישה חיצונית (כמו דאטהבייס) - חברו אותם רק לרשת הפנימית.
- `docker network inspect` הוא כלי הדיבוג הראשון שכדאי לבדוק כשקונטיינרים לא "מדברים" אחד עם השני.
- כדי לחקות תקשורת בין קונטיינרים כמו בפרודקשן, השתמשו בשם השירות/קונטיינר, לא ב-`localhost` (שמצביע על הקונטיינר עצמו בלבד).

## שאלות ראיון נפוצות בנושא

1. **מה ההבדל בין הרשת ה-default bridge לרשת user-defined bridge?**
   ברשת default bridge אין DNS resolution אוטומטי לפי שם קונטיינר (נדרש `--link` מיושן); ברשת user-defined, קונטיינרים יכולים לגשת אחד לשני לפי השם באופן אוטומטי.

2. **מתי משתמשים ב-`--network host`?**
   כשצריך ביצועי רשת מקסימליים ללא overhead של NAT, ומוכנים לוותר על בידוד רשתי. זמין רק ב-Linux.

3. **איך שני קונטיינרים על אותו host יכולים לתקשר?**
   על ידי חיבור לאותה Docker network (רצוי user-defined bridge) ושימוש בשם הקונטיינר כ-hostname.

4. **מה זה Overlay network ולמה צריך אותה?**
   רשת שמאפשרת תקשורת בין קונטיינרים על **מארחים (hosts) שונים** - קריטית לסביבות multi-host כמו Docker Swarm או Kubernetes.

5. **למה כדאי להימנע מחשיפת פורטים למאגר נתונים בפרודקשן?**
   כדי לצמצם משטח תקיפה - אם הדאטהבייס נגיש רק דרך הרשת הפנימית של Docker, תוקף חיצוני לא יכול לגשת אליו ישירות גם אם יש לו את כתובת ה-IP של השרת.

---

**בחלק הקודם:** [Volumes וניהול אחסון](/devops/docker/06-volumes-ואחסון/) | **בחלק הבא:** [Docker Compose - ניהול שירותים מרובים](/devops/docker/08-docker-compose/)
