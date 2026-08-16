---
title: Dockerfile ובניית Images
category: DevOps/Docker
part: 4/10
---

# Dockerfile ובניית Images

## מה זה Dockerfile?

קובץ טקסט עם רשימת הוראות (instructions) שמתארות איך לבנות Docker Image - החל מ-image בסיס, דרך התקנת תלויות, ועד העתקת הקוד והגדרת פקודת ההרצה.

## ההוראות (Instructions) המרכזיות

### FROM - image בסיס

```dockerfile
FROM node:20-alpine
```

חייבת להיות ההוראה הראשונה (מלבד `ARG` לפני זה). בוחרים image בסיס שכולל את סביבת הריצה שצריך (Node, Python, Java וכו').

### WORKDIR - תיקיית עבודה

```dockerfile
WORKDIR /app
```

קובע את תיקיית העבודה לכל ההוראות הבאות (כמו `cd`). אם התיקייה לא קיימת, Docker יוצר אותה אוטומטית.

### COPY / ADD - העתקת קבצים

```dockerfile
COPY package.json package-lock.json ./
COPY . .

# ADD תומך גם בפתיחת ארכיונים ו-URLs, אבל בד"כ עדיף COPY (יותר צפוי וברור)
ADD https://example.com/file.tar.gz /tmp/
```

**כלל אצבע:** תמיד השתמשו ב-`COPY` אלא אם ממש צריכים את היכולות המיוחדות של `ADD`.

### RUN - הרצת פקודות בזמן הבנייה

```dockerfile
RUN apt-get update && apt-get install -y curl
RUN npm install
```

כל `RUN` יוצר שכבה (layer) חדשה ב-image.

### ENV - משתני סביבה

```dockerfile
ENV NODE_ENV=production
ENV PORT=3000
```

### EXPOSE - תיעוד פורטים

```dockerfile
EXPOSE 3000
```

**חשוב:** זה רק **תיעוד** - לא בפועל פותח פורט. עדיין צריך `-p` ב-`docker run` כדי למפות את הפורט בפועל.

### CMD - פקודת ברירת מחדל

```dockerfile
CMD ["node", "server.js"]
```

מגדיר מה קורה כשמריצים את הקונטיינר בלי לציין פקודה. אפשר לדרוס אותו: `docker run myimage other-command`.

### ENTRYPOINT - נקודת כניסה קבועה

```dockerfile
ENTRYPOINT ["node"]
CMD ["server.js"]
```

בשילוב עם CMD: ENTRYPOINT הוא הפקודה הקבועה, ו-CMD הם הפרמטרים שאפשר לדרוס. כך `docker run myimage app.js` ירוץ בפועל `node app.js`.

### USER - משתמש להרצה

```dockerfile
USER node
```

חשוב מאוד לאבטחה - מונע הרצת הקונטיינר כ-root. נרחיב בחלק הבא על ניהול הרשאות.

### ARG - משתני בנייה (build-time בלבד)

```dockerfile
ARG APP_VERSION=1.0
RUN echo "Building version $APP_VERSION"
```

שונה מ-`ENV` בכך שהוא זמין רק בזמן ה-`build`, לא בזמן ריצת הקונטיינר (אלא אם מעבירים אותו ל-ENV).

### VOLUME - נקודת mount

```dockerfile
VOLUME /data
```

### HEALTHCHECK - בדיקת בריאות

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1
```

## דוגמה מלאה - אפליקציית Node.js

```dockerfile
# שלב 1: image בסיס קליל
FROM node:20-alpine

# יצירת תיקיית עבודה
WORKDIR /app

# העתקת קבצי package בלבד קודם (לניצול Layer Caching!)
COPY package*.json ./

# התקנת תלויות
RUN npm ci --only=production

# העתקת שאר הקוד
COPY . .

# משתמש לא-root
USER node

# תיעוד פורט
EXPOSE 3000

# בדיקת בריאות
HEALTHCHECK --interval=30s CMD wget -qO- http://localhost:3000/health || exit 1

# פקודת הרצה
CMD ["node", "server.js"]
```

בנייה והרצה:
```bash
docker build -t myapp:1.0 .
docker run -d -p 3000:3000 myapp:1.0
```

## Multi-stage Builds - טכניקה קריטית לפרודקשן

הרעיון: להשתמש בכמה שלבי "בנייה" נפרדים, כשרק התוצר הסופי עובר ל-image הסופי. כך ה-image הסופי לא כולל כלי build, קוד מקור, ותלויות פיתוח - רק מה שצריך להרצה.

### דוגמה - אפליקציית Go

```dockerfile
# שלב 1: בנייה
FROM golang:1.22 AS builder
WORKDIR /src
COPY . .
RUN CGO_ENABLED=0 go build -o /app

# שלב 2: הרצה - image מינימלי
FROM alpine:3.19
COPY --from=builder /app /app
ENTRYPOINT ["/app"]
```

תוצאה: image סופי בגודל מגה-בייטים בודדים במקום ג'יגה-בייטים (image ה-Go המלא לבדו הוא מעל 800MB).

### דוגמה - React app עם Nginx

```dockerfile
# שלב 1: בנייה
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# שלב 2: הגשה עם Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Layer Caching - איך לבנות Dockerfile יעיל

Docker בונה image שכבה-שכבה, וכל שכבה נשמרת ב-cache. אם שכבה לא השתנתה (וה-checksum שלה זהה), Docker משתמש ב-cache במקום לבנות מחדש.

**כלל זהב:** סדרו את ההוראות מהפחות-משתנות ליותר-משתנות.

```dockerfile
# ❌ לא יעיל - כל שינוי קוד גורם להתקנה מחדש של כל התלויות
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm install
CMD ["node", "server.js"]
```

```dockerfile
# ✅ יעיל - התלויות מותקנות רק כשה-package.json משתנה
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["node", "server.js"]
```

## .dockerignore

כמו `.gitignore`, מונע העתקת קבצים מיותרים (וחוסך זמן בנייה ומגדיל אבטחה):

```
node_modules
.git
.env
*.log
Dockerfile
README.md
.dockerignore
dist
coverage
```

## פקודות build שימושיות

```bash
# בנייה עם tag
docker build -t myapp:1.0 .

# בנייה עם Dockerfile בשם/מיקום שונה
docker build -f Dockerfile.prod -t myapp:prod .

# בנייה עם build args
docker build --build-arg APP_VERSION=2.0 -t myapp:2.0 .

# בנייה בלי cache (התחלה נקייה)
docker build --no-cache -t myapp:1.0 .

# בנייה של שלב ספציפי ב-multi-stage
docker build --target build -t myapp:build-stage .
```

## קישורים חיצוניים

**וידאו:**
- [Dockerfile Tutorial - Full Guide](https://www.youtube.com/watch?v=eV6jpZR_lJk)
- [Multi-Stage Docker Builds Explained](https://www.youtube.com/watch?v=Yw1CKz5oQg8)

**דוקומנטציה רשמית:**
- [Dockerfile Reference](https://docs.docker.com/reference/dockerfile/)
- [Building Best Practices](https://docs.docker.com/build/building/best-practices/)
- [Multi-stage builds](https://docs.docker.com/build/building/multi-stage/)

## טיפים וטריקים

- תמיד השתמשו ב-image בסיס `-alpine` או `-slim` כשאפשר - חוסך משמעותית בגודל.
- אל תשתמשו ב-`latest` ל-FROM בפרודקשן - קבעו גרסה ספציפית למניעת הפתעות.
- שלבו פקודות `RUN` עם `&&` כדי לצמצם מספר שכבות: `RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*`
- תמיד נקו cache של package managers באותה שכבה שבה התקנתם (לא בשכבה נפרדת - אחרת התמונה עדיין תכיל את זה בהיסטוריית ה-layers).
- השתמשו ב-`docker build --progress=plain` לדיבוג בעיות build.

## שאלות ראיון נפוצות בנושא

1. **מה ההבדל בין CMD ל-ENTRYPOINT?**
   CMD ניתן לדריסה מלאה בזמן `docker run`; ENTRYPOINT הוא קבוע (אלא אם דורסים עם `--entrypoint`) ומקבל פרמטרים מ-CMD או משורת הפקודה.

2. **מה זה Multi-stage build ולמה זה חשוב?**
   טכניקה שמשתמשת בכמה שלבי FROM ב-Dockerfile אחד, כשרק התוצר מהשלב האחרון נשמר ב-image הסופי - מקטין דרסטית את גודל ה-image ומסיר כלי build ותלויות פיתוח מיותרות.

3. **למה חשוב סדר ההוראות ב-Dockerfile?**
   בגלל Layer Caching - Docker בונה מחדש רק את השכבות שהשתנו, לכן כדאי לשים דברים שמשתנים לעיתים רחוקות (כמו התקנת תלויות) לפני דברים שמשתנים תדיר (כמו קוד).

4. **מה ההבדל בין ARG ל-ENV?**
   ARG זמין רק בזמן build; ENV זמין גם בזמן build וגם נשאר בקונטיינר הרץ.

5. **מה עושה .dockerignore?**
   מונע מקבצים/תיקיות מסוימות (כמו node_modules, .git) להיכנס להקשר הבנייה (build context), מה שמאיץ בנייה ומונע דליפת סודות.

---

**בחלק הקודם:** [פקודות בסיסיות](./03-פקודות-בסיסיות.md) | **בחלק הבא:** [ניהול הרשאות ואבטחה](./05-ניהול-הרשאות-ואבטחה.md)
