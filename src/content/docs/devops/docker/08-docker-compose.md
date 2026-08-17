---
title: Docker Compose - ניהול שירותים מרובים
category: DevOps/Docker
part: 8/10
---

## למה צריך Docker Compose?

הרצת אפליקציה אמיתית לרוב דורשת כמה שירותים (backend, database, cache, frontend) שרצים יחד, על אותה רשת, עם תלויות ביניהם. במקום להריץ עשרות פקודות `docker run` ארוכות, Docker Compose מאפשר להגדיר את כל הסטאק בקובץ YAML אחד ולהרים אותו בפקודה אחת.

## התקנה ובדיקה

Docker Compose (גרסה 2, כ-plugin) מגיע מובנה עם Docker Desktop ורוב התקנות Docker Engine החדשות:

```bash
docker compose version
```

**הערה:** התחביר הישן `docker-compose` (עם מקף, כלי נפרד) עדיין קיים בהרבה מדריכים ישנים, אבל התחביר המודרני הוא `docker compose` (עם רווח, כ-subcommand מובנה).

## מבנה קובץ docker-compose.yml

```yaml
services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:secret@db:5432/mydb
    depends_on:
      - db
    networks:
      - app-network
    restart: unless-stopped

  db:
    image: postgres:16
    environment:
      - POSTGRES_PASSWORD=secret
      - POSTGRES_DB=mydb
    volumes:
      - db-data:/var/lib/postgresql/data
    networks:
      - app-network
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    networks:
      - app-network
    restart: unless-stopped

networks:
  app-network:
    driver: bridge

volumes:
  db-data:
```

## פקודות מרכזיות

```bash
# הרמת כל השירותים ברקע
docker compose up -d

# הרמה עם בנייה מחדש של images
docker compose up -d --build

# עצירת כל השירותים
docker compose stop

# עצירה ומחיקת קונטיינרים ורשתות (לא volumes)
docker compose down

# עצירה ומחיקה כולל volumes
docker compose down -v

# צפייה בלוגים של כל השירותים
docker compose logs -f

# לוגים של שירות ספציפי
docker compose logs -f web

# רשימת שירותים רצים
docker compose ps

# הרצת פקודה בשירות ספציפי
docker compose exec web bash

# הרצת שירות חד-פעמית (לא כחלק מ-up)
docker compose run --rm web npm test

# בנייה מחדש בלבד (בלי להריץ)
docker compose build

# הפעלה מחדש של שירות ספציפי
docker compose restart web

# scale - הרצת כמה מופעים של שירות
docker compose up -d --scale web=3
```

## Environment Variables ו-.env

Docker Compose טוען אוטומטית קובץ `.env` מאותה תיקייה:

```bash
# .env
POSTGRES_PASSWORD=secret123
APP_PORT=3000
NODE_ENV=production
```

```yaml
services:
  web:
    image: myapp
    ports:
      - "${APP_PORT}:3000"
    environment:
      - NODE_ENV=${NODE_ENV}
  db:
    image: postgres:16
    environment:
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
```

**חשוב:** תמיד הוסיפו `.env` ל-`.gitignore` אם הוא מכיל סודות!

## depends_on מתקדם - המתנה לבריאות שירות

`depends_on` בסיסי רק ממתין שהקונטיינר **יעלה**, לא שהוא **מוכן לקבל תעבורה** (למשל דאטהבייס שעדיין בתהליך אתחול). הפתרון - שילוב עם `healthcheck`:

```yaml
services:
  db:
    image: postgres:16
    environment:
      - POSTGRES_PASSWORD=secret
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  web:
    build: .
    depends_on:
      db:
        condition: service_healthy
```

עכשיו `web` ימתין עד ש-`db` יעבור את בדיקת הבריאות בפועל, לא רק שהקונטיינר "רץ".

## Override Files - סביבות שונות (dev/prod)

Docker Compose תומך במיזוג קבצים - שימושי מאוד להפרדת קונפיגורציה בין סביבות:

**docker-compose.yml** (בסיס - זהה לכל הסביבות):
```yaml
services:
  web:
    build: .
    networks:
      - app-network
```

**docker-compose.override.yml** (נטען אוטומטית, לרוב לפיתוח):
```yaml
services:
  web:
    volumes:
      - .:/app          # bind mount לפיתוח - שינויי קוד חיים
    environment:
      - NODE_ENV=development
    ports:
      - "3000:3000"
```

**docker-compose.prod.yml** (נטען מפורשות):
```yaml
services:
  web:
    environment:
      - NODE_ENV=production
    restart: always
    deploy:
      resources:
        limits:
          memory: 512M
```

הרצה:
```bash
# dev - טוען override.yml אוטומטית
docker compose up -d

# prod - טוען קבצים באופן מפורש
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## דוגמה מלאה - סטאק MEAN/MERN לדוגמה

```yaml
services:
  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - app-net

  backend:
    build: ./backend
    environment:
      - MONGO_URL=mongodb://mongo:27017/mydb
      - REDIS_URL=redis://cache:6379
    depends_on:
      mongo:
        condition: service_healthy
      cache:
        condition: service_started
    networks:
      - app-net
    deploy:
      resources:
        limits:
          cpus: "1.0"
          memory: 512M

  mongo:
    image: mongo:7
    volumes:
      - mongo-data:/data/db
    healthcheck:
      test: echo 'db.runCommand("ping").ok' | mongosh localhost:27017/test --quiet
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - app-net

  cache:
    image: redis:7-alpine
    networks:
      - app-net

networks:
  app-net:
    driver: bridge

volumes:
  mongo-data:
```

## אימות תחביר

```bash
# בדיקת תקינות ה-YAML בלי להריץ בפועל
docker compose config

# בדיקה עם קבצים משולבים
docker compose -f docker-compose.yml -f docker-compose.prod.yml config
```

## קישורים חיצוניים

**וידאו:**
- [Docker Compose Tutorial](https://www.youtube.com/watch?v=SXwC9fSwct8)
- [Docker Compose Crash Course](https://www.youtube.com/watch?v=DM65_JyGxCo)

**דוקומנטציה רשמית:**
- [Docker Compose Overview](https://docs.docker.com/compose/)
- [Compose File Reference](https://docs.docker.com/reference/compose-file/)
- [Compose Environment Variables](https://docs.docker.com/compose/how-tos/environment-variables/)

## טיפים וטריקים

- `docker compose up` (בלי `-d`) שימושי לפיתוח - רואים את כל הלוגים בזמן אמת בטרמינל.
- תמיד השתמשו ב-`depends_on` עם `condition: service_healthy` לשירותים שדורשים "מוכנות אמיתית" (דאטהבייסים במיוחד).
- `docker compose down -v` מוחק גם volumes - היזהרו בפרודקשן!
- אפשר לתת שם לפרויקט (מונע התנגשויות אם יש כמה תיקיות): `docker compose -p myproject up -d`
- `docker compose config` הוא הכלי הראשון לדיבוג - הוא מראה איך YAML "מתפרש" בפועל אחרי מיזוג משתנים וקבצים.

## שאלות ראיון נפוצות בנושא

1. **מה ההבדל בין Docker Compose ל-Docker Swarm/Kubernetes?**
   Compose מיועד בעיקר לניהול אפליקציות multi-container על **מארח יחיד** (פיתוח, טסטים, deployment פשוט); Swarm ו-Kubernetes הם אורקסטרטורים ל-**מספר מארחים** עם יכולות כמו scaling אוטומטי, self-healing, ו-rolling updates.

2. **מה עושה depends_on, ומה המגבלה שלו בברירת מחדל?**
   קובע סדר עלייה של קונטיינרים, אבל בברירת מחדל רק מוודא שהקונטיינר **התחיל לרוץ**, לא שהשירות בפועל **מוכן**. פתרון: `condition: service_healthy` בשילוב עם healthcheck.

3. **איך מנהלים סודות (secrets) בסביבות שונות עם Compose?**
   באמצעות קובצי `.env` נפרדים לכל סביבה (שלא נכנסים ל-Git), או Docker Secrets/מנהלי סודות חיצוניים (Vault, AWS Secrets Manager) בסביבות פרודקשן רגישות יותר.

4. **מה קורה אם מריצים `docker compose up` פעמיים ברציפות?**
   Compose חכם - אם כלום לא השתנה, הוא לא יוצר קונטיינרים חדשים אלא משאיר את הקיימים. אם יש שינוי בקונפיגורציה, הוא יוצר/מעדכן רק את מה שנדרש.

5. **מה זה override file ולמה זה שימושי?**
   קובץ נוסף (`docker-compose.override.yml`) שנטען אוטומטית ומתמזג עם הקובץ הראשי, מאפשר להפריד קונפיגורציה משותפת מקונפיגורציה ספציפית לסביבה (dev/prod) בלי לשכפל את כל הקובץ.

---

**בחלק הקודם:** [Docker Networking](/devops/docker/07-networking/) | **בחלק הבא:** [ניהול שרתים ו-Docker Swarm](/devops/docker/09-ניהול-שרתים-ו-swarm/)
