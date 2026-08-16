---
title: Docker Volumes וניהול אחסון
category: DevOps/Docker
part: 6/10
---

# Docker Volumes וניהול אחסון

## הבעיה: קונטיינרים הם Ephemeral (בני חלוף)

כברירת מחדל, כל נתון שנכתב בתוך קונטיינר נמחק כשהקונטיינר נמחק. זו התנהגות רצויה לרוב, אבל בעייתית לדאטהבייסים, קבצי לוג, ותוכן שצריך להישאר קבוע.

## שלוש דרכים לאחסון קבוע

### 1. Volumes (מומלץ ברוב המקרים)

מנוהלים לחלוטין על ידי Docker, נשמרים ב-`/var/lib/docker/volumes/`.

```bash
# יצירת volume
docker volume create my-data

# רשימת volumes
docker volume ls

# מידע מפורט
docker volume inspect my-data

# מחיקה
docker volume rm my-data

# מחיקת כל ה-volumes שלא בשימוש
docker volume prune
```

שימוש בזמן הרצה:
```bash
docker run -d --name mydb -v my-data:/var/lib/mysql mysql:8

# תחביר חדש יותר, מפורש יותר (mount)
docker run -d --name mydb --mount source=my-data,target=/var/lib/mysql mysql:8
```

### 2. Bind Mounts

ממפים תיקייה/קובץ **ספציפיים במארח** ישירות לתוך הקונטיינר. שימושי מאוד לפיתוח (כדי לראות שינויי קוד בזמן אמת).

```bash
# Linux/Mac
docker run -d -v /home/user/myapp:/app myapp

# Windows (PowerShell)
docker run -d -v ${PWD}:/app myapp

# תחביר mount מפורש
docker run -d --mount type=bind,source=/home/user/myapp,target=/app myapp
```

**bind mount לקריאה בלבד:**
```bash
docker run -d -v /home/user/config:/app/config:ro myapp
```

### 3. tmpfs Mounts

נתונים שנשמרים בזיכרון בלבד (RAM), לא נכתבים לדיסק כלל - נעלמים כשהקונטיינר עוצר. שימושי לנתונים רגישים זמניים (כמו secrets).

```bash
docker run -d --tmpfs /app/temp-cache myapp
```

## טבלת השוואה

| מאפיין | Volume | Bind Mount | tmpfs |
|---|---|---|---|
| מנוהל ע"י | Docker | המשתמש (נתיב מוחלט במארח) | Docker (בזיכרון) |
| מיקום | `/var/lib/docker/volumes` | כל מקום במארח | RAM בלבד |
| נשרד אחרי restart | כן | כן | לא |
| שיתוף בין קונטיינרים | קל | קל | לא רלוונטי |
| ביצועים ב-Linux | טוב | טוב | הכי מהיר (RAM) |
| נגיש ישירות מהמארח | כן, דרך docker CLI | כן, ישירות | לא |
| מומלץ לפרודקשן | כן | בעיקר לפיתוח/קונפיגורציה | דאטה רגיש/זמני |

## דוגמה מעשית - PostgreSQL עם נתונים קבועים

```bash
docker volume create pg-data

docker run -d \
  --name postgres-db \
  -e POSTGRES_PASSWORD=mysecretpassword \
  -v pg-data:/var/lib/postgresql/data \
  -p 5432:5432 \
  postgres:16
```

עכשיו, גם אם נמחק את הקונטיינר ונריץ חדש עם אותו volume, הנתונים יישארו:
```bash
docker rm -f postgres-db

docker run -d \
  --name postgres-db-new \
  -e POSTGRES_PASSWORD=mysecretpassword \
  -v pg-data:/var/lib/postgresql/data \
  -p 5432:5432 \
  postgres:16
# הנתונים הישנים עדיין שם!
```

## גיבוי ושחזור Volumes

### גיבוי (Backup)

```bash
docker run --rm \
  -v pg-data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/pg-data-backup.tar.gz -C /data .
```

הסבר: מריצים קונטיינר זמני (`--rm`) של alpine, ממפים אליו גם את ה-volume שרוצים לגבות וגם תיקייה מקומית לגיבוי, ומריצים `tar` כדי לדחוס.

### שחזור (Restore)

```bash
docker volume create pg-data-restored

docker run --rm \
  -v pg-data-restored:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/pg-data-backup.tar.gz -C /data
```

## שיתוף Volume בין כמה קונטיינרים

```bash
docker volume create shared-data

docker run -d --name writer -v shared-data:/data alpine sh -c "while true; do date >> /data/log.txt; sleep 5; done"
docker run -d --name reader -v shared-data:/data:ro alpine tail -f /data/log.txt
```

## Volume Drivers - אחסון מתקדם (NFS, Cloud)

Docker תומך ב-drivers חיצוניים לאחסון מבוזר, למשל NFS:

```bash
docker volume create --driver local \
  --opt type=nfs \
  --opt o=addr=192.168.1.100,rw \
  --opt device=:/path/to/dir \
  nfs-volume
```

שימושי בסביבות multi-host כדי שכמה שרתים יוכלו לגשת לאותו אחסון.

## בעיות הרשאות נפוצות עם Volumes

בעיה קלאסית: הקונטיינר רץ כמשתמש עם UID מסוים, אבל תיקיית ה-bind mount במארח שייכת למשתמש אחר, וגורם ל-"Permission Denied".

פתרון - התאמת UID:
```bash
# הרצה עם אותו UID כמו המשתמש הנוכחי במארח
docker run -v $(pwd):/app -u $(id -u):$(id -g) myapp
```

או תיקון בעלות מראש:
```bash
sudo chown -R 1000:1000 /path/to/mounted/folder
```

## קישורים חיצוניים

**וידאו:**
- [Docker Volumes Explained](https://www.youtube.com/watch?v=p2PH_YM8ODs)
- [Docker Bind Mounts vs Volumes](https://www.youtube.com/watch?v=9Eb-JGkfWJs)

**דוקומנטציה רשמית:**
- [Manage data in Docker](https://docs.docker.com/engine/storage/)
- [Volumes](https://docs.docker.com/engine/storage/volumes/)
- [Bind mounts](https://docs.docker.com/engine/storage/bind-mounts/)
- [tmpfs mounts](https://docs.docker.com/engine/storage/tmpfs/)

## טיפים וטריקים

- לפרודקשן, כמעט תמיד עדיפים Named Volumes על פני Bind Mounts - הם ניתנים לניהול על ידי Docker, פורטבילים יותר, וללא תלות במבנה תיקיות ספציפי במארח.
- לפיתוח מקומי, Bind Mounts הם הבחירה הנכונה - כדי לראות שינויי קוד מיידית בלי rebuild.
- תמיד השתמשו ב-`:ro` (read-only) כשקונטיינר צריך רק לקרוא נתונים, לא לכתוב.
- `docker system df -v` מראה בדיוק כמה מקום כל volume תופס.
- volume שנוצר אוטומטית (אנונימי, בלי שם) קשה לזהות מאוחר יותר - העדיפו תמיד לתת שם מפורש.

## שאלות ראיון נפוצות בנושא

1. **מה ההבדל בין Volume ל-Bind Mount?**
   Volume מנוהל לגמרי על ידי Docker ונשמר במיקום שהוא שולט בו; Bind Mount ממפה נתיב ספציפי וקיים במארח, בשליטת המשתמש.

2. **למה volumes מומלצים על bind mounts בפרודקשן?**
   כי הם עצמאיים ממבנה מערכת הקבצים של המארח, קלים יותר לגיבוי/מיגרציה, ותומכים ב-drivers מתקדמים (NFS, cloud storage).

3. **מה קורה לנתונים בקונטיינר אם לא הגדרתם volume ומחקתם את הקונטיינר?**
   הם נמחקים לצמיתות - קונטיינרים הם ephemeral (בני חלוף) כברירת מחדל.

4. **איך מגבים volume?**
   בעזרת קונטיינר זמני שממפה גם את ה-volume וגם תיקיית גיבוי מקומית, ומריץ פקודת ארכוב כמו tar.

5. **מה זה tmpfs mount ומתי משתמשים בו?**
   Mount שמאחסן נתונים בזיכרון RAM בלבד, ללא כתיבה לדיסק - שימושי לנתונים רגישים זמניים (כמו secrets בזמן ריצה) או קבצי cache שלא צריכים להישרד restart.

---

**בחלק הקודם:** [ניהול הרשאות ואבטחה](./05-ניהול-הרשאות-ואבטחה.md) | **בחלק הבא:** [Docker Networking](./07-networking.md)
