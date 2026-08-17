---
title: "תיעוד API - OpenAPI ו-Swagger"
category: API
part: 8/10
---

## למה תיעוד טוב קריטי?

API בלי תיעוד ברור הוא כמעט חסר תועלת עבור מפתחים אחרים (או אפילו עבורכם בעוד חצי שנה). תיעוד טוב חוסך זמן תמיכה, מפחית טעויות שילוב, ומשפר את חוויית המפתח (Developer Experience / DX).

## מה זה OpenAPI (לשעבר Swagger)?

**OpenAPI Specification (OAS)** הוא תקן פורמלי לתיאור REST APIs בקובץ YAML או JSON, שמתאר:
- אילו endpoints קיימים
- אילו methods, פרמטרים, ו-headers כל endpoint מקבל
- מבנה הבקשות והתשובות (עם JSON Schema)
- שיטות אימות

**Swagger** היה השם המקורי של הפרויקט (לפני שנתרם ל-Linux Foundation ב-2015 ושונה שמו ל-OpenAPI). כיום "Swagger" מתייחס בעיקר לכלים (Swagger UI, Swagger Editor) שעובדים עם התקן OpenAPI.

## דוגמת קובץ OpenAPI (YAML) בסיסי

```yaml
openapi: 3.0.3
info:
  title: Royi Guides API
  description: API לניהול מדריכים ותוכן
  version: 1.0.0
servers:
  - url: https://api.royiguides.com/v1

paths:
  /users:
    get:
      summary: קבלת רשימת משתמשים
      parameters:
        - name: limit
          in: query
          schema:
            type: integer
            default: 20
      responses:
        '200':
          description: רשימת משתמשים
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/User'
    post:
      summary: יצירת משתמש חדש
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/NewUser'
      responses:
        '201':
          description: המשתמש נוצר בהצלחה
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
        '400':
          description: בקשה לא תקינה

  /users/{id}:
    get:
      summary: קבלת משתמש לפי ID
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
      responses:
        '200':
          description: פרטי המשתמש
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
        '404':
          description: המשתמש לא נמצא

components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: integer
          example: 42
        name:
          type: string
          example: "דנה כהן"
        email:
          type: string
          format: email
          example: "dana@example.com"
      required: [id, name, email]

    NewUser:
      type: object
      properties:
        name:
          type: string
        email:
          type: string
          format: email
      required: [name, email]

  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

security:
  - bearerAuth: []
```

## כלים מרכזיים בעולם OpenAPI

| כלי | שימוש |
|---|---|
| **Swagger Editor** | עריכת קובץ OpenAPI עם תצוגה מקדימה חיה (online: editor.swagger.io) |
| **Swagger UI** | מייצר תיעוד אינטראקטיבי מהקובץ - אפשר "לנסות" בקשות ישירות מהדפדפן |
| **Redoc** | חלופה יפה יותר ל-Swagger UI, ממוקדת בקריאות |
| **Postman** | ייבוא/ייצוא של קובצי OpenAPI, בניית collections |
| **openapi-generator** | יצירת קוד קליינט/שרת אוטומטית משפות שונות מתוך ה-spec |

## דוגמה: הפעלת Swagger UI ב-Express.js

```javascript
const express = require("express");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");

const swaggerDocument = YAML.load("./openapi.yaml");

const app = express();
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(3000, () => {
  console.log("תיעוד זמין ב: http://localhost:3000/docs");
});
```

## Design-First לעומת Code-First

- **Design-First** - כותבים את קובץ ה-OpenAPI קודם, ורק אז מממשים את הקוד (לעיתים אפילו מייצרים "שלד" קוד אוטומטית מהקובץ)
- **Code-First** - כותבים את הקוד עם annotations/decorators (למשל `@swagger` comments), וכלי אוטומטי מייצר את קובץ ה-OpenAPI מהקוד

```javascript
// דוגמה ל-Code-First עם JSDoc comments (swagger-jsdoc)
/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: קבלת משתמש לפי ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: פרטי המשתמש
 */
app.get("/users/:id", getUserHandler);
```

**Design-First עדיף** בדרך כלל בצוותים גדולים או כשה-API הוא ה"מוצר" עצמו, כי הוא מאפשר לתכנן ולקבל פידבק לפני כתיבת קוד. **Code-First** נוח יותר לפרויקטים קטנים או צוות יחיד שרוצה למהר.

## תיעוד טוב כולל גם...

- **Getting Started Guide** - איך מקבלים API Key, בקשה ראשונה מלאה עם דוגמה
- **דוגמאות קוד** במספר שפות (curl, JavaScript, Python, וכו')
- **Changelog** - היסטוריית שינויים לפי גרסה
- **Error Reference** - רשימת כל קודי השגיאה האפשריים ומשמעותם
- **Rate Limits** - כמה בקשות מותרות ואיך יודעים כמה נשאר
- **SDKs רשמיים** (אם רלוונטי) - חוסך למפתחים כתיבת קוד boilerplate

## טיפים וטריקים

- 💡 השתמשו ב-`example` בכל שדה בקובץ ה-OpenAPI - זה הופך את Swagger UI לשימושי הרבה יותר (אפשר "לנסות עכשיו" עם דאטה הגיוני).
- 💡 שמרו את קובץ ה-OpenAPI תחת **Git**, ועדכנו אותו כחלק מ-Pull Request כשמשנים API - כך התיעוד לעולם לא "מתיישן".
- 💡 שקלו הרצת בדיקה אוטומטית ב-CI שמוודאת שהתשובות בפועל תואמות לסכמת ה-OpenAPI (contract testing).
- 💡 הוסיפו endpoint ל-`/health` או `/status` ותעדו אותו - שימושי מאוד ל-monitoring ול-debugging בשטח.
- ⚠️ תיעוד "יפה אבל שקרי" (לא מעודכן) גרוע יותר מאי-תיעוד - זה מטעה מפתחים ומוריד אמון.

## שאלות נפוצות בראיונות עבודה

**1. מה ההבדל בין Swagger ל-OpenAPI?**
OpenAPI הוא שם התקן (הספציפיקציה). Swagger היה השם המקורי, וכיום מתייחס בעיקר לכלים (Swagger UI/Editor) שתומכים בתקן OpenAPI.

**2. מה ההבדל בין גישת Design-First ל-Code-First לתיעוד API?**
Design-First - כותבים את ה-spec קודם, מקבלים פידבק, ואז מממשים קוד. Code-First - כותבים קוד עם annotations, וכלי מייצר את ה-spec מהקוד. Design-First עדיף לתכנון API רחב-היקף ולעבודת צוות.

**3. איך אפשר לוודא שתיעוד ה-API תמיד מעודכן?**
לשמור את קובץ ה-OpenAPI ב-Git כחלק מהקוד, לחייב עדכון שלו ב-Pull Requests, ואפילו להריץ contract tests אוטומטיים ב-CI שמשווים בין ה-spec לבין ההתנהגות בפועל.

**4. מה זה JSON Schema, ואיך הוא קשור ל-OpenAPI?**
JSON Schema הוא תקן לתיאור מבנה נתוני JSON (סוגי שדות, שדות חובה וכו'). OpenAPI משתמש ב-JSON Schema (בגרסה מותאמת) כדי לתאר את מבני הבקשות והתשובות שלו.

## קישורים חיצוניים ומקורות למידה

- [OpenAPI Specification - Official Site](https://www.openapis.org/)
- [Swagger.io - Getting Started](https://swagger.io/docs/specification/about/)
- [Swagger Editor (Online)](https://editor.swagger.io/)
- [Redoc - Alternative Documentation Renderer](https://github.com/Redocly/redoc)
- [Stripe API Docs](https://stripe.com/docs/api) - דוגמה מצוינת לתיעוד ברמה עולמית

### סרטוני יוטיוב מומלצים
- [OpenAPI / Swagger Crash Course](https://www.youtube.com/results?search_query=openapi+swagger+crash+course)
- [How to Document a REST API](https://www.youtube.com/results?search_query=how+to+document+a+rest+api)

---
**במדריך הבא:** בדיקות API - Testing, Rate Limiting ו-Caching.
