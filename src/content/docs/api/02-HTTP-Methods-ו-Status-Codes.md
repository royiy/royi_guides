---
title: "HTTP Methods ו-Status Codes"
category: API
part: 2/10
---

## מבנה בקשת HTTP

כל בקשת HTTP מורכבת מ-4 חלקים עיקריים:

```
POST /v1/users HTTP/1.1          <- שורת הבקשה: Method + Path + Version
Host: api.example.com            <- Headers
Content-Type: application/json
Authorization: Bearer TOKEN123

{                                 <- Body (גוף הבקשה)
  "name": "דנה כהן",
  "email": "dana@example.com"
}
```

ותשובת HTTP:

```
HTTP/1.1 201 Created              <- שורת סטטוס
Content-Type: application/json
Location: /v1/users/101

{
  "id": 101,
  "name": "דנה כהן",
  "email": "dana@example.com"
}
```

## HTTP Methods המרכזיים

| Method | מטרה | Idempotent? | Safe? | יש Body בבקשה? |
|---|---|---|---|---|
| GET | קבלת משאב | כן | כן | לא (בדרך כלל) |
| POST | יצירת משאב חדש | לא | לא | כן |
| PUT | עדכון מלא / החלפת משאב | כן | לא | כן |
| PATCH | עדכון חלקי של משאב | לא (תלוי מימוש) | לא | כן |
| DELETE | מחיקת משאב | כן | לא | לרוב לא |
| HEAD | כמו GET אבל בלי body בתשובה | כן | כן | לא |
| OPTIONS | בדיקת אילו methods נתמכים (חשוב ל-CORS) | כן | כן | לא |

**Safe** = לא משנה מצב בשרת (read-only). **Idempotent** = הרצה חוזרת נותנת אותה תוצאה.

### דוגמת PUT מול PATCH

נניח משתמש עם המבנה:
```json
{ "id": 42, "name": "דנה", "email": "dana@example.com", "age": 30 }
```

**PUT** (עדכון מלא - חייבים לשלוח את כל השדות, אחרת הם עלולים להימחק):
```bash
curl -X PUT https://api.example.com/v1/users/42 \
  -H "Content-Type: application/json" \
  -d '{"name": "דנה לוי", "email": "dana@example.com", "age": 31}'
```

**PATCH** (עדכון חלקי - רק מה שרוצים לשנות):
```bash
curl -X PATCH https://api.example.com/v1/users/42 \
  -H "Content-Type: application/json" \
  -d '{"age": 31}'
```

## קטגוריות קודי סטטוס (Status Codes)

| טווח | קטגוריה | משמעות |
|---|---|---|
| 1xx | Informational | הבקשה התקבלה, ממשיכים בתהליך |
| 2xx | Success | הבקשה הצליחה |
| 3xx | Redirection | צריך פעולה נוספת (הפניה) |
| 4xx | Client Error | שגיאה בצד הלקוח |
| 5xx | Server Error | שגיאה בצד השרת |

### קודי הסטטוס החשובים ביותר לזכור

**הצלחה (2xx)**
- `200 OK` - הצלחה כללית (GET, PUT, PATCH מוצלחים)
- `201 Created` - משאב חדש נוצר בהצלחה (בעקבות POST)
- `204 No Content` - הצלחה, אבל אין תוכן להחזיר (למשל אחרי DELETE)

**שגיאות לקוח (4xx)**
- `400 Bad Request` - הבקשה פגומה מבחינה תחבירית (JSON לא תקין, שדה חסר)
- `401 Unauthorized` - חסר אימות (או אימות שגוי) - "מי אתה?"
- `403 Forbidden` - מזוהה, אבל אין הרשאה - "אני יודע מי אתה, אבל אתה לא רשאי"
- `404 Not Found` - המשאב לא נמצא
- `405 Method Not Allowed` - ה-method לא נתמך על הנתיב הזה
- `409 Conflict` - קונפליקט (למשל ניסיון ליצור משתמש עם אימייל שכבר קיים)
- `422 Unprocessable Entity` - הבקשה תקינה תחבירית אבל לא עומדת בכללי הוולידציה
- `429 Too Many Requests` - חרגתם מ-Rate Limit

**שגיאות שרת (5xx)**
- `500 Internal Server Error` - שגיאה כללית בשרת
- `502 Bad Gateway` - שרת ביניים (proxy/gateway) קיבל תשובה לא תקינה מהשרת
- `503 Service Unavailable` - השרת עמוס או בתחזוקה
- `504 Gateway Timeout` - שרת ביניים לא קיבל תשובה בזמן

> **טיפ קריטי לראיונות:** ההבדל בין 401 ל-403 הוא שאלה קלאסית. 401 = "אני לא יודע מי אתה" (בעיית אימות/Authentication). 403 = "אני יודע מי אתה, אבל אתה לא מורשה" (בעיית הרשאה/Authorization).

## דוגמת טיפול בשגיאות ב-JavaScript

```javascript
async function createUser(userData) {
  const response = await fetch("https://api.example.com/v1/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData)
  });

  switch (response.status) {
    case 201:
      return await response.json();
    case 400:
      throw new Error("נתונים לא תקינים בבקשה");
    case 409:
      throw new Error("משתמש עם האימייל הזה כבר קיים");
    case 429:
      throw new Error("יותר מדי בקשות, נסו שוב מאוחר יותר");
    default:
      throw new Error(`שגיאה לא צפויה: ${response.status}`);
  }
}
```

## Headers חשובים שכדאי להכיר

| Header | שימוש |
|---|---|
| `Content-Type` | מציין את פורמט הגוף (`application/json`, `multipart/form-data` וכו') |
| `Accept` | מציין איזה פורמט הלקוח מעדיף לקבל בתשובה |
| `Authorization` | פרטי אימות (`Bearer TOKEN`, `Basic base64...`) |
| `Cache-Control` | הנחיות מטמון (`no-cache`, `max-age=3600`) |
| `ETag` | מזהה גרסה של המשאב, לשימוש ב-caching ו-conditional requests |
| `Retry-After` | כמה זמן לחכות לפני ניסיון חוזר (בתשובות 429 או 503) |

## טיפים וטריקים

- 💡 אל תשתמשו ב-`200 OK` לכל דבר - זה הופך debugging לסיוט. תמיד תחזירו את הסטטוס הכי מדויק.
- 💡 החזירו `201 Created` עם Header בשם `Location` שמצביע על ה-URI של המשאב החדש.
- 💡 בטיפול בשגיאות, תחזירו גוף תשובה עקבי (למשל `{"error": "...", "code": "..."}`), לא רק סטטוס קוד ריק.
- 💡 השתמשו ב-`429` יחד עם Header `Retry-After` כדי לעזור ללקוחות לדעת מתי לנסות שוב.
- ⚠️ טעות נפוצה: להחזיר `200 OK` יחד עם `{"success": false}` בגוף - זה מבלבל ומנוגד לעקרונות HTTP.

## שאלות נפוצות בראיונות עבודה

**1. מה ההבדל בין 401 ל-403?** (ראו הסבר למעלה)

**2. איזה status code מחזירים אחרי DELETE מוצלח?**
בדרך כלל `204 No Content` (אם אין גוף להחזיר) או `200 OK` (אם מחזירים מידע על המשאב שנמחק).

**3. מה ההבדל בין 500 ל-503?**
500 = שגיאה כללית לא צפויה בקוד השרת. 503 = השרת יודע שהוא לא זמין כרגע (עומס, תחזוקה) ומתקשר את זה במפורש.

**4. האם POST הוא idempotent?**
לא, כי כל קריאה יוצרת משאב חדש. אם שולחים את אותה בקשת POST פעמיים, יווצרו שני משאבים שונים (בהנחה שאין מנגנון ייחודי כמו idempotency key).

**5. מהו idempotency key, ולמה משתמשים בו עם POST?**
מזהה ייחודי שהלקוח שולח בבקשת POST, כדי שהשרת יוכל לזהות בקשות כפולות (בגלל retry ברשת) ולא ליצור משאב כפול. נפוץ מאוד ב-APIs של תשלומים (Stripe למשל).

**6. מה קורה אם קוראים ל-endpoint עם method לא נתמך?**
מחזירים `405 Method Not Allowed`, ולעיתים מוסיפים Header `Allow` שמפרט אילו methods כן נתמכים.

## קישורים חיצוניים ומקורות למידה

- [MDN - HTTP request methods](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods)
- [MDN - HTTP response status codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)
- [httpstatuses.com](https://httpstatuses.com/) - רשימה מלאה עם הסברים
- [RFC 9110 - HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110.html) - התקן הרשמי (למתקדמים)

### סרטוני יוטיוב מומלצים
- [HTTP Status Codes Explained](https://www.youtube.com/results?search_query=http+status+codes+explained)
- [HTTP Methods GET POST PUT PATCH DELETE Explained](https://www.youtube.com/results?search_query=http+methods+get+post+put+patch+delete+explained)

---
**במדריך הבא:** אימות והרשאה - API Keys, OAuth 2.0, ו-JWT.
