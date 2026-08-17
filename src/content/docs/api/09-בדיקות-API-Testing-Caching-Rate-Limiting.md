---
title: "בדיקות API - Testing, Caching ו-Rate Limiting"
category: API
part: 9/10
---

## סוגי בדיקות ל-API

| סוג בדיקה | מטרה | דוגמה |
|---|---|---|
| **Unit Tests** | בדיקת פונקציה/מודול בודד, ללא תלויות חיצוניות | בדיקת פונקציית וולידציה |
| **Integration Tests** | בדיקת מספר רכיבים יחד (למשל endpoint + DB) | בדיקה ש-POST /users שומר בפועל ב-DB |
| **Contract Tests** | וידוא שה-API תואם לחוזה המוסכם (OpenAPI spec) | השוואת תשובה בפועל מול schema |
| **End-to-End (E2E)** | בדיקת תהליך מלא מנקודת מבט המשתמש | הרשמה → login → ביצוע פעולה |
| **Load/Performance Tests** | בדיקת התנהגות תחת עומס | כמה בקשות בשנייה ה-API מסוגל לטפל בהן |
| **Security Tests** | חיפוש פרצות אבטחה | בדיקת BOLA, SQL Injection וכו' |

## בדיקות עם Postman

Postman הוא הכלי הפופולרי ביותר לבדיקה ידנית ואוטומטית של APIs.

**דוגמת בדיקה (Test Script) ב-Postman:**
```javascript
// בלשונית "Tests" של הבקשה ב-Postman
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has user id", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property("id");
    pm.expect(jsonData.id).to.be.a("number");
});

pm.test("Response time is less than 500ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(500);
});
```

ניתן לארגן בקשות ל-**Collections**, ולהריץ אותן אוטומטית עם **Newman** (CLI runner של Postman) בתוך CI/CD pipeline.

```bash
newman run my-api-collection.json --environment prod.json
```

## בדיקות אוטומטיות עם Jest + Supertest (Node.js)

```javascript
const request = require("supertest");
const app = require("../app");

describe("Users API", () => {
  test("GET /users/:id מחזיר משתמש קיים", async () => {
    const response = await request(app)
      .get("/v1/users/42")
      .set("Authorization", "Bearer valid-token");

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("name");
    expect(response.body.id).toBe(42);
  });

  test("GET /users/:id מחזיר 404 עבור משתמש לא קיים", async () => {
    const response = await request(app)
      .get("/v1/users/99999")
      .set("Authorization", "Bearer valid-token");

    expect(response.status).toBe(404);
  });

  test("POST /users עם נתונים לא תקינים מחזיר 400", async () => {
    const response = await request(app)
      .post("/v1/users")
      .send({ name: "" });   // אימייל חסר

    expect(response.status).toBe(400);
  });
});
```

## בדיקות ב-Python עם pytest + requests

```python
import pytest
import requests

BASE_URL = "https://api.example.com/v1"

def test_get_user_success():
    response = requests.get(f"{BASE_URL}/users/42",
                             headers={"Authorization": "Bearer valid-token"})
    assert response.status_code == 200
    data = response.json()
    assert "name" in data
    assert data["id"] == 42

def test_get_user_not_found():
    response = requests.get(f"{BASE_URL}/users/99999",
                             headers={"Authorization": "Bearer valid-token"})
    assert response.status_code == 404
```

## Load Testing עם k6

```javascript
import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 50,           // 50 משתמשים וירטואליים במקביל
  duration: "30s"
};

export default function () {
  const res = http.get("https://api.example.com/v1/products");
  check(res, {
    "status is 200": (r) => r.status === 200,
    "response time < 300ms": (r) => r.timings.duration < 300
  });
  sleep(1);
}
```

```bash
k6 run load-test.js
```

## Caching - למה ואיך

Caching מפחית עומס על השרת ומשפר זמני תגובה, ע"י שמירת תשובות ושימוש חוזר בהן במקום לחשב/לשלוף אותן מחדש.

### Cache-Control Header
```
Cache-Control: public, max-age=3600      # אפשר לשמור במטמון עד שעה
Cache-Control: private, no-cache          # רק ללקוח הספציפי, חייב revalidation
Cache-Control: no-store                   # אסור לשמור בכלל (נתונים רגישים)
```

### ETag ו-Conditional Requests

`ETag` הוא "טביעת אצבע" של המשאב - הלקוח יכול לשלוח אותה בבקשה הבאה, והשרת יכול לענות "לא השתנה כלום" בלי לשלוח את כל הגוף שוב:

```
# בקשה ראשונה
GET /users/42
→ 200 OK
  ETag: "a1b2c3d4"
  {full user data}

# בקשה שנייה (יותר מאוחר)
GET /users/42
If-None-Match: "a1b2c3d4"
→ 304 Not Modified   (בלי גוף תשובה - חוסך bandwidth!)
```

### Caching ברמות שונות
- **Client-side (דפדפן)** - cache מקומי לפי Cache-Control
- **CDN (Content Delivery Network)** - Cloudflare, Fastly - caching קרוב גיאוגרפית למשתמש
- **Server-side (Redis/Memcached)** - caching תוצאות שאילתות יקרות ב-DB

**דוגמת caching עם Redis (Node.js):**
```javascript
const redis = require("redis");
const client = redis.createClient();

async function getProduct(id) {
  const cacheKey = `product:${id}`;
  const cached = await client.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const product = await db.products.findById(id);
  await client.setEx(cacheKey, 3600, JSON.stringify(product)); // TTL של שעה
  return product;
}
```

## Rate Limiting - אלגוריתמים נפוצים

| אלגוריתם | תיאור | יתרון עיקרי |
|---|---|---|
| **Fixed Window** | סופרים בקשות בחלון זמן קבוע (למשל כל דקה מתאפסת) | פשוט למימוש |
| **Sliding Window** | חלון "נע" רציף, מדויק יותר | מונע "פרצי" בקשות בגבולות החלון |
| **Token Bucket** | "דלי" עם טוקנים שמתמלא בקצב קבוע, כל בקשה צורכת טוקן | מאפשר burst מבוקר |
| **Leaky Bucket** | בקשות "זולגות" בקצב קבוע, עודף נדחה או מתעכב | מייצב קצב יציא לחלוטין |

## טיפים וטריקים

- 💡 כתבו בדיקות ל-**Happy Path** (הצלחה) **וגם** ל-**Edge Cases** (שגיאות, קלט ריק, ערכי קיצון).
- 💡 שלבו בדיקות API ב-**CI/CD pipeline** - כל push/PR צריך להריץ אוטומטית את חבילת הבדיקות.
- 💡 השתמשו ב-**Test Environment** נפרד עם נתוני test מבודדים, אף פעם לא בסביבת Production אמיתית.
- 💡 שלבו `ETag` ו-`Cache-Control` יחד לביצועים מיטביים - Cache-Control למניעת בקשה בכלל, ETag לחיסכון bandwidth כשכן צריך לבדוק.
- ⚠️ זהירות עם caching של נתונים אישיים/רגישים - השתמשו ב-`private` ולא `public`, ולעיתים `no-store`.

## שאלות נפוצות בראיונות עבודה

**1. מה ההבדל בין Unit Test ל-Integration Test עבור API?**
Unit Test בודק רכיב בודד (פונקציה) ללא תלויות אמיתיות (DB מדומה/mock). Integration Test בודק את הרכיבים יחד, כולל תקשורת אמיתית (או קרובה לאמיתית) עם DB/שירותים חיצוניים.

**2. מה זה ETag ואיך הוא עוזר לביצועים?**
טביעת אצבע של גרסת המשאב. הלקוח שולח אותה ב-`If-None-Match` בבקשות עוקבות; אם המשאב לא השתנה, השרת מחזיר `304 Not Modified` בלי לשלוח את הגוף שוב, וחוסך bandwidth.

**3. הסבירו את ההבדל בין Token Bucket ל-Fixed Window ב-Rate Limiting.**
Fixed Window סופר בקשות בחלון קבוע ומתאפס בבת אחת (עלול לאפשר "פרץ" כפול בגבול בין חלונות). Token Bucket מאפשר צבירת "טוקנים" עד תקרה, ומאפשר גמישות ל-burst קצר תוך שמירה על ממוצע קצב לאורך זמן.

**4. איך הייתם בודקים ש-API עומד בעומס גבוה?**
Load Testing עם כלים כמו k6, JMeter או Locust - מדמים משתמשים וירטואליים מרובים, ובודקים throughput, latency, ואחוז שגיאות תחת עומס גובר.

**5. מהם Contract Tests ולמה הם חשובים?**
בדיקות שמוודאות שהתשובה בפועל מה-API תואמת ל-schema המתועד (OpenAPI). חשובות כדי לוודא שה-API לא "סוטה" מהתיעוד/החוזה מול הלקוחות, במיוחד בארכיטקטורת מיקרו-שירותים.

## קישורים חיצוניים ומקורות למידה

- [Postman Learning Center](https://learning.postman.com/)
- [k6 Documentation](https://k6.io/docs/)
- [MDN - HTTP Caching](https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching)
- [Supertest (GitHub)](https://github.com/ladjs/supertest)
- [Jest Documentation](https://jestjs.io/docs/getting-started)

### סרטוני יוטיוב מומלצים
- [Postman API Testing Tutorial](https://www.youtube.com/results?search_query=postman+api+testing+tutorial)
- [k6 Load Testing Tutorial](https://www.youtube.com/results?search_query=k6+load+testing+tutorial)
- [HTTP Caching Explained](https://www.youtube.com/results?search_query=http+caching+explained)

---
**במדריך הבא (והאחרון בסדרה):** שאלות ראיון עבודה מקיפות על APIs - וטיפים כלליים.
