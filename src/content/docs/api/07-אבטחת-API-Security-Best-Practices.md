---
title: "אבטחת API - API Security Best Practices"
category: API
part: 7/10
---

## OWASP API Security Top 10 (2023)

ה-OWASP (Open Worldwide Application Security Project) מפרסם רשימה מעודכנת של הסיכונים הנפוצים ביותר ב-APIs. חשוב מאוד להכיר אותה - שאלות ראיון רבות מבוססות עליה:

1. **Broken Object Level Authorization (BOLA)** - משתמש יכול לגשת לנתונים של משתמש אחר (למשל `GET /orders/123` בלי לבדוק שההזמנה שייכת למשתמש המחובר)
2. **Broken Authentication** - מנגנוני אימות חלשים (סיסמאות חלשות, טוקנים שלא פגי תוקף, brute-force לא מוגבל)
3. **Broken Object Property Level Authorization** - חשיפת/עדכון שדות שלא היו אמורים להיות נגישים (למשל משתמש יכול לעדכן `role: "admin"` דרך PATCH)
4. **Unrestricted Resource Consumption** - חוסר Rate Limiting, מאפשר DoS או עלויות תפעוליות מוגזמות
5. **Broken Function Level Authorization** - endpoint של admin נגיש למשתמשים רגילים
6. **Unrestricted Access to Sensitive Business Flows** - ניצול לרעה של תהליכים עסקיים (למשל בוט שקונה את כל המלאי)
7. **Server Side Request Forgery (SSRF)** - השרת נשלח לבצע בקשה למקום לא מכוון (למשל URL זדוני שהמשתמש סיפק)
8. **Security Misconfiguration** - הגדרות ברירת מחדל לא בטוחות, CORS פתוח מדי, headers חסרים
9. **Improper Inventory Management** - endpoints/גרסאות ישנות שנשכחו ועדיין חשופות (Shadow/Zombie APIs)
10. **Unsafe Consumption of APIs** - אמון עיוור בנתונים המגיעים מ-APIs חיצוניים בלי וולידציה

## דוגמת BOLA (הפגיעות הכי נפוצה)

```javascript
// ❌ קוד לא בטוח - כל אחד עם טוקן תקין יכול לראות הזמנה של כל אחד אחר
app.get("/orders/:id", authenticate, async (req, res) => {
  const order = await Order.findById(req.params.id);
  res.json(order);
});

// ✅ קוד בטוח - בודקים שההזמנה שייכת למשתמש המחובר
app.get("/orders/:id", authenticate, async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order || order.userId !== req.user.id) {
    return res.status(404).json({ error: "Order not found" });
  }
  res.json(order);
});
```

## Rate Limiting

הגבלת מספר הבקשות שלקוח מסוים יכול לשלוח בפרק זמן נתון, כדי למנוע abuse ו-DoS.

```javascript
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 דקות
  max: 100,                    // מקסימום 100 בקשות לכל IP בחלון הזמן
  message: { error: "יותר מדי בקשות, נסו שוב מאוחר יותר" },
  standardHeaders: true,
  legacyHeaders: false
});

app.use("/v1/", limiter);
```

תשובת השרת כשחורגים מהמכסה:
```
HTTP/1.1 429 Too Many Requests
Retry-After: 300
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1735693200
```

## Input Validation (וולידציית קלט)

**לעולם אל תסמכו על נתונים שמגיעים מהלקוח** - תמיד תוודאו אותם בצד השרת (גם אם יש וולידציה בצד הלקוח).

```javascript
const { z } = require("zod");

const createUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  age: z.number().int().positive().max(120).optional()
});

app.post("/users", (req, res) => {
  const result = createUserSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error.issues });
  }
  // ...ממשיכים עם result.data המאומת
});
```

## HTTPS ו-TLS

- **חובה** להשתמש ב-HTTPS בכל API בייצור - בלי זה, כל נתון (כולל טוקנים וסיסמאות) עובר בגלוי.
- כדאי להפעיל **HSTS** (HTTP Strict Transport Security) כדי לכפות HTTPS גם אם המשתמש מנסה HTTP.

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

## CORS (Cross-Origin Resource Sharing)

מנגנון שמאפשר לשרת לשלוט אילו domains רשאים לקרוא ל-API שלו מדפדפן.

```javascript
const cors = require("cors");

app.use(cors({
  origin: ["https://app.example.com"],   // ✅ רשימה מוגדרת, לא "*"
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
```

⚠️ הגדרת `origin: "*"` יחד עם `credentials: true` היא שילוב מסוכן ולרוב אף חסום ע"י דפדפנים - הימנעו מ-wildcard פתוח כשה-API עובד עם cookies/session.

## הגנה מפני SQL Injection ו-NoSQL Injection

```javascript
// ❌ פגיע ל-SQL Injection
const query = `SELECT * FROM users WHERE email = '${email}'`;

// ✅ בטוח - Parameterized Query
const query = "SELECT * FROM users WHERE email = ?";
db.query(query, [email]);
```

השתמשו תמיד ב-ORM (Sequelize, Prisma, TypeORM) או ב-parameterized queries, ולעולם לא בבניית שאילתות ע"י שרשור מחרוזות (string concatenation).

## Secrets Management

- אל תשמרו API Keys/Secrets בקוד או ב-Git.
- השתמשו ב-Environment Variables (`.env` + `.gitignore`) לפיתוח, ובשירותי ניהול סודות ל-Production: AWS Secrets Manager, HashiCorp Vault, Azure Key Vault, GCP Secret Manager.

```bash
# .env (לא נכנס ל-git!)
DATABASE_URL=postgres://user:pass@localhost/db
JWT_SECRET=super-secret-key-change-me
```

```
# .gitignore
.env
```

## Security Headers מומלצים

```javascript
const helmet = require("helmet");
app.use(helmet());
```

חבילת `helmet` ל-Express מוסיפה אוטומטית headers חשובים:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Content-Security-Policy`
- ועוד

## טיפים וטריקים

- 💡 השתמשו בעקרון **Least Privilege** - כל טוקן/מפתח מקבל רק את ההרשאות המינימליות הנדרשות.
- 💡 בצעו **Log** לכל בקשה רגישה (login, שינוי הרשאות, מחיקת נתונים) - חשוב ל-audit trail.
- 💡 סרקו תלויות (dependencies) באופן קבוע לפגיעויות ידועות (`npm audit`, Snyk, Dependabot).
- 💡 השתמשו ב-**API Gateway** (Kong, AWS API Gateway, Apigee) שיכול לרכז Rate Limiting, אימות, ולוגים במקום מרכזי.
- ⚠️ אל תחזירו הודעות שגיאה מפורטות מדי בייצור (למשל stack trace מלא) - זה מקל על תוקפים.

## שאלות נפוצות בראיונות עבודה

**1. מה זה BOLA (Broken Object Level Authorization) ואיך מונעים אותו?**
פגיעות שבה משתמש מזוהה יכול לגשת לנתונים ששייכים למשתמש אחר, כי השרת לא בודק בעלות על המשאב, רק אימות. פתרון: לבדוק תמיד שה-ownership של המשאב תואם למשתמש המחובר, בכל endpoint שמקבל ID.

**2. מה ההבדל בין Rate Limiting ל-Throttling?**
Rate Limiting חוסם בקשות שחורגות ממכסה (מחזיר 429). Throttling מאט את קצב הטיפול בבקשות במקום לחסום לגמרי. לעיתים המונחים משמשים לסירוגין בתעשייה.

**3. איך הייתם מגנים על API מפני Brute Force על לוגין?**
Rate Limiting ספציפי ל-endpoint של login, נעילת חשבון זמנית אחרי X ניסיונות כושלים, CAPTCHA, ומעקב אחר ניסיונות חשודים (IP anomalies).

**4. למה חשוב Input Validation גם אם יש כבר וולידציה בצד הלקוח (Frontend)?**
כי אפשר לעקוף וולידציית frontend בקלות (curl, Postman, DevTools). וולידציה בצד השרת היא קו ההגנה האמיתי.

**5. מה זה CORS ולמה הוא קיים?**
מנגנון דפדפן שמונע מדף web אחד לשלוח בקשות (עם credentials) לדומיין אחר בלי אישור מפורש מהשרת היעד - מגן מפני Cross-Site Request Forgery ומתקפות דומות.

## קישורים חיצוניים ומקורות למידה

- [OWASP API Security Top 10](https://owasp.org/API-Security/editions/2023/en/0x11-t10/)
- [MDN - CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Helmet.js Documentation](https://helmetjs.github.io/)
- [Auth0 - API Security Best Practices](https://auth0.com/blog/api-security-best-practices/)

### סרטוני יוטיוב מומלצים
- [OWASP API Security Top 10 Explained](https://www.youtube.com/results?search_query=owasp+api+security+top+10+explained)
- [API Security Best Practices](https://www.youtube.com/results?search_query=api+security+best+practices+tutorial)

---
**במדריך הבא:** תיעוד API עם OpenAPI ו-Swagger.
