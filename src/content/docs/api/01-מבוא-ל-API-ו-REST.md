---
title: "מבוא ל-API ו-REST"
category: API
part: 1/10
---

## מה זה API?

API (Application Programming Interface) הוא ממשק שמאפשר לתוכנות שונות "לדבר" ביניהן. במקום שתוכנה אחת תדע איך בדיוק בנויה תוכנה אחרת מבפנים, ה-API מגדיר חוזה ברור: אילו בקשות אפשר לשלוח, אילו נתונים צריך לספק, ומה יחזור בתשובה.

דוגמה מהחיים: כשאתם פותחים אפליקציית מזג אוויר בטלפון, האפליקציה לא "יודעת" בעצמה מה מזג האוויר. היא שולחת בקשת API לשרת של ספק נתוני מזג אוויר, מקבלת תשובה (בדרך כלל בפורמט JSON), ומציגה אותה יפה על המסך.

### סוגי API נפוצים
- **Web APIs** – מבוססי HTTP, הנפוצים ביותר כיום (REST, GraphQL, gRPC, SOAP)
- **Library/Framework APIs** – ממשקים בתוך שפת תכנות (למשל פונקציות ב-Python)
- **Operating System APIs** – ממשקים לתקשורת עם מערכת ההפעלה

במדריך הזה, ובכל המדריכים בסדרה, נתמקד ב-**Web APIs**, ובעיקר ב-**REST**.

## מה זה REST?

REST (Representational State Transfer) הוא לא פרוטוקול וגם לא תקן פורמלי — זו **סגנון ארכיטקטוני** (architectural style) שהוגדר על ידי רוי פילדינג (Roy Fielding) בעבודת הדוקטורט שלו ב-2000. API שעומד בעקרונות של REST נקרא "RESTful API".

### עקרונות היסוד של REST

1. **Client-Server** – הפרדה ברורה בין הלקוח (Client) לשרת (Server). הלקוח לא צריך לדעת איך השרת מיושם, והשרת לא צריך לדעת איך הלקוח בנוי.
2. **Statelessness (חוסר מצב)** – כל בקשה מהלקוח לשרת חייבת להכיל את כל המידע הדרוש להבנתה. השרת לא שומר "זיכרון" בין בקשה לבקשה (לדוגמה, session state בזיכרון). כל בקשה עצמאית.
3. **Cacheability (יכולת שמירה במטמון)** – תשובות מהשרת צריכות להגדיר האם ניתן לשמור אותן במטמון (cache) או לא, כדי לשפר ביצועים.
4. **Uniform Interface (ממשק אחיד)** – זהו העיקרון המרכזי ביותר, וכולל כמה תתי-עקרונות:
   - זיהוי משאבים (Resources) דרך URI
   - מניפולציה על משאבים דרך ייצוגים (representations) - למשל JSON
   - הודעות "self-descriptive" (הבקשה/תשובה מכילה מספיק מידע כדי להבין אותה)
   - HATEOAS (Hypermedia as the Engine of Application State) - קישורים בתוך התשובה שמנחים את הלקוח לפעולות הבאות האפשריות
5. **Layered System (מערכת שכבתית)** – הלקוח לא בהכרח יודע אם הוא מחובר ישירות לשרת או דרך שכבות ביניים (load balancer, proxy, gateway וכו')
6. **Code on Demand (אופציונלי)** – השרת יכול (לא חובה) לשלוח קוד הניתן להרצה ללקוח (כמו JavaScript)

> **טיפ:** בפועל, רוב ה-APIs שנקראים "RESTful" בתעשייה לא מיישמים את כל העקרונות (במיוחד HATEOAS נדיר מאוד). זה נקרא לפעמים "REST-ish" או "Pragmatic REST". חשוב להבין את זה כדי לא "להיתפס" בשאלת ראיון שמצפה שתדעו את ההבדל.

## Resources ו-URIs

ב-REST, כל "דבר" הוא **משאב (Resource)** - משתמש, הזמנה, מוצר וכו'. לכל משאב יש כתובת ייחודית (URI).

### דוגמאות טובות לעיצוב URI

```
GET    /users              # קבלת רשימת כל המשתמשים
GET    /users/42           # קבלת משתמש ספציפי עם ID=42
POST   /users              # יצירת משתמש חדש
PUT    /users/42           # עדכון מלא של משתמש 42
PATCH  /users/42           # עדכון חלקי של משתמש 42
DELETE /users/42           # מחיקת משתמש 42

GET    /users/42/orders    # כל ההזמנות של משתמש 42 (משאב מקונן)
```

### כללי אצבע לעיצוב URI טוב
- השתמשו ב**שמות עצם ברבים** (`/users` ולא `/user` או `/getUsers`)
- **אל תכניסו פעלים ל-URI** - הפעולה נקבעת ע"י ה-HTTP Method, לא ע"י שם הנתיב
- שמרו על **עקביות** (אם החלטתם על kebab-case, שמרו עליו בכל מקום)
- הימנעו מקינון עמוק מדי (`/users/42/orders/7/items/3/reviews` זה כבר יותר מדי)

## דוגמת קריאה מלאה עם cURL

```bash
curl -X GET "https://api.example.com/v1/users/42" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

תשובה לדוגמה (JSON):

```json
{
  "id": 42,
  "name": "ישראל ישראלי",
  "email": "israel@example.com",
  "created_at": "2026-01-15T10:30:00Z"
}
```

## דוגמת קריאה עם JavaScript (fetch)

```javascript
async function getUser(userId) {
  const response = await fetch(`https://api.example.com/v1/users/${userId}`, {
    method: "GET",
    headers: {
      "Accept": "application/json",
      "Authorization": "Bearer YOUR_TOKEN_HERE"
    }
  });

  if (!response.ok) {
    throw new Error(`שגיאה: ${response.status}`);
  }

  const data = await response.json();
  console.log(data);
  return data;
}

getUser(42);
```

## דוגמת קריאה עם Python (requests)

```python
import requests

url = "https://api.example.com/v1/users/42"
headers = {
    "Accept": "application/json",
    "Authorization": "Bearer YOUR_TOKEN_HERE"
}

response = requests.get(url, headers=headers)
response.raise_for_status()

data = response.json()
print(data)
```

## REST לעומת גישות אחרות (טבלת השוואה מהירה)

| מאפיין | REST | GraphQL | gRPC | SOAP |
|---|---|---|---|---|
| פורמט נתונים | לרוב JSON | JSON | Protobuf (בינארי) | XML |
| גמישות שאילתה | נמוכה-בינונית | גבוהה (הלקוח בוחר שדות) | נמוכה | נמוכה |
| ביצועים | טובים | טובים | מצוינים | פחות טובים |
| קלות לימוד | קלה | בינונית | בינונית-קשה | קשה |
| שימוש נפוץ | Web APIs ציבוריים | אפליקציות עם דרישות דאטה מורכבות | מיקרו-שירותים פנימיים | מערכות Enterprise ישנות |

(נרחיב על GraphQL במדריך נפרד בהמשך הסדרה)

## שאלות נפוצות בראיונות עבודה

**1. מה ההבדל בין API ל-REST API?**
API הוא מושג כללי לכל ממשק בין תוכנות. REST API הוא סוג ספציפי של Web API שמיישם (בדרך כלל חלקית) את העקרונות הארכיטקטוניים של REST, ומבוסס על HTTP.

**2. מהם עקרונות ה-REST המרכזיים?**
Client-Server, Statelessness, Cacheability, Uniform Interface, Layered System, ו-Code on Demand (אופציונלי). מומלץ לדעת להסביר כל אחד בכמה מילים, לא רק לשנן שמות.

**3. למה REST הוא Stateless, ומה היתרון בכך?**
כי כל בקשה מכילה את כל המידע הדרוש לביצועה, בלי תלות בבקשות קודמות. זה מאפשר **scalability** קל יותר - כל שרת יכול לטפל בכל בקשה בלי צורך "לזכור" את הלקוח, מה שמקל על load balancing.

**4. מה זה Idempotency (אידמפוטנטיות) ולמה זה חשוב ב-REST?**
פעולה אידמפוטנטית היא פעולה שאם מבצעים אותה כמה פעמים ברצף, התוצאה זהה לביצוע פעם אחת. GET, PUT ו-DELETE הן אידמפוטנטיות; POST לרוב לא. זה חשוב כי במקרה של timeout או retry ברשת, אתם רוצים לדעת אם בטוח לשלוח את הבקשה שוב.

**5. מה ההבדל בין PUT ל-PATCH?**
PUT מחליף את כל המשאב (עדכון מלא), PATCH מעדכן רק חלק ממנו (עדכון חלקי). נרחיב על כך במדריך הבא על HTTP Methods.

**6. האם API חייב להיות RESTful כדי להיחשב "טוב"?**
לא. יש מקרים שבהם GraphQL, gRPC או אפילו WebSockets מתאימים יותר, תלוי בצרכי המערכת (למשל: אם הלקוח צריך שליטה גמישה בשדות שמוחזרים - GraphQL עדיף; אם צריך תקשורת בזמן אמת דו-כיוונית - WebSockets).

## טיפים וטריקים

- 💡 **תמיד תתחילו מגרסה ב-URL** (`/v1/users`) גם אם עוד אין תוכנית לגרסה 2 - זה חוסך הרבה כאב ראש בעתיד (נרחיב במדריך על Versioning).
- 💡 השתמשו בכלי כמו **Postman** או **Insomnia** כדי לבדוק endpoints לפני שכותבים קוד קליינט.
- 💡 קראו תמיד את קוד הסטטוס (Status Code) של התשובה, לא רק את ה-body - הרבה מפתחים מתחילים מתעלמים מזה.
- 💡 כשאתם מעצבים API חדש, כתבו קודם את ה-**documentation** (למשל ב-OpenAPI) ורק אז את הקוד - זה עוזר לחשוב על העיצוב לפני המימוש ("Design-First" approach).
- ⚠️ הימנעו מ-URIs כמו `/getUserById` - זה "RPC-style" ולא REST-style.

## קישורים חיצוניים ומקורות למידה

### תיעוד רשמי ומאמרים
- [Roy Fielding's Dissertation - Chapter 5 (REST)](https://ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm) - המקור המקורי להגדרת REST
- [MDN Web Docs - An overview of HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview)
- [REST API Tutorial](https://restfulapi.net/)
- [Microsoft - RESTful web API design](https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-design)

### סרטוני יוטיוב מומלצים
- [REST API Crash Course - Introduction](https://www.youtube.com/results?search_query=REST+API+crash+course) (חפשו את הגרסה העדכנית ביותר של Traversy Media או freeCodeCamp)
- [What is an API? (In English, Please!)](https://www.youtube.com/results?search_query=what+is+an+api+explained+simply)
- [REST API Concepts and Examples](https://www.youtube.com/results?search_query=REST+API+concepts+and+examples+WebConcepts)

> **הערה:** קישורי היוטיוב לעיל הם קישורי חיפוש, מכיוון שסרטונים ספציפיים וכתובותיהם משתנים ומוסרים עם הזמן. מומלץ לחפש בעצמכם לפי המונחים ולבחור את הסרטון העדכני עם הכי הרבה צפיות/דירוג טוב.

---
**במדריך הבא:** נצלול לעומק אל HTTP Methods, Status Codes, ומבנה בקשה/תשובה מלא.
