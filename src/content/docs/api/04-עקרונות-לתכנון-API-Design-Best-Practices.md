---
title: "עקרונות לתכנון API - Design Best Practices"
category: API
part: 4/10
---

## למה תכנון טוב חשוב כל כך?

API הוא **חוזה** בין הצוות שלכם לצוותים אחרים (או לקוחות חיצוניים). ברגע ש-API יוצא לשימוש, קשה מאוד לשנות אותו בלי לשבור אפליקציות קיימות. לכן השקעה בתכנון מראש חוסכת המון כאב ראש בהמשך.

## עקרון: Design-First

במקום לכתוב קוד ואז לתעד, מומלץ לתכנן את ה-API (למשל עם OpenAPI/Swagger) **לפני** כתיבת קוד המימוש. זה מאפשר:
- לקבל פידבק מצוותים אחרים לפני שהושקע זמן בפיתוח
- ליצור Mock Server ולתת ל-Frontend להתחיל לעבוד במקביל
- לזהות בעיות עיצוב מוקדם

## מוסכמות שמות (Naming Conventions)

```
✅ GET /users                      # רבים, שם עצם
✅ GET /users/42/orders             # קינון הגיוני
✅ GET /orders?status=pending       # סינון עם query params
❌ GET /getUsers
❌ GET /user-list
❌ POST /users/create
```

- שמות משאבים תמיד **ברבים** ובאותיות קטנות: `/users`, `/products`
- מפרידים מילים ב-**kebab-case**: `/order-items` ולא `/orderItems` או `/order_items`
- שדות בגוף ה-JSON לרוב ב-**camelCase** (בעולם JS) או **snake_case** (בעולם Python/Ruby) - העיקר עקביות

## Filtering, Sorting, Pagination

```
GET /products?category=electronics&min_price=100&max_price=500   # סינון
GET /products?sort=-price,name                                    # מיון (- = יורד)
GET /products?page=2&per_page=20                                  # Pagination בסגנון page
GET /products?limit=20&offset=40                                  # Pagination בסגנון offset
GET /products?cursor=eyJpZCI6MTAwfQ==&limit=20                    # Cursor-based pagination
```

**Cursor-based pagination** עדיף על page/offset ב-datasets גדולים ומשתנים (מונע דילוג/כפילות כשנתונים נוספים באמצע).

**דוגמת תשובה עם Pagination metadata:**
```json
{
  "data": [ { "id": 1, "name": "..." }, { "id": 2, "name": "..." } ],
  "pagination": {
    "total": 254,
    "page": 2,
    "per_page": 20,
    "total_pages": 13
  },
  "links": {
    "next": "/products?page=3&per_page=20",
    "prev": "/products?page=1&per_page=20"
  }
}
```

## מבנה תשובת שגיאה עקבי

כדאי להגדיר פורמט אחיד לכל השגיאות ב-API:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "השדה 'email' חייב להיות כתובת אימייל תקינה",
    "details": [
      { "field": "email", "issue": "invalid_format" }
    ],
    "request_id": "req_8f3k2m1"
  }
}
```

`request_id` שימושי מאוד ל-debugging ותמיכה - מאפשר לחפש את הבקשה בלוגים.

## Nested Resources - עד כמה עמוק?

```
✅ GET /users/42/orders            # רמה אחת - סביר
⚠️ GET /users/42/orders/7/items    # שתי רמות - עדיין סביר
❌ GET /users/42/orders/7/items/3/reviews/comments   # יותר מדי - קשה לתחזוקה
```

כלל אצבע: מעבר לרמה אחת-שתיים של קינון, שקלו לחשוף את המשאב "העמוק" כ-endpoint עצמאי עם filter:
```
GET /items/3/reviews?order_id=7
```

## HATEOAS - מתי משתמשים בזה בפועל?

בתיאוריה, כל תשובה אמורה להכיל קישורים ("מה אפשר לעשות הלאה"):
```json
{
  "id": 42,
  "status": "pending",
  "_links": {
    "self": { "href": "/orders/42" },
    "cancel": { "href": "/orders/42/cancel", "method": "POST" },
    "customer": { "href": "/users/17" }
  }
}
```
בפועל, רוב ה-APIs בתעשייה **לא** מיישמים HATEOAS במלואו כי זה מוסיף מורכבות. חשוב לדעת שזה קיים (שאלת ראיון אפשרית) אבל לא חובה ביישום.

## Richardson Maturity Model (מודל הבשלות של Richardson)

מודל שמדרג "כמה RESTful" API הוא, בארבע רמות:
- **Level 0** - שימוש ב-HTTP רק כ"תעלה" - endpoint יחיד, method יחיד (בד"כ POST), הכל ב-body (RPC-style)
- **Level 1** - יש כמה resources/URIs שונים, אבל עדיין לא משתמשים נכון ב-HTTP methods
- **Level 2** - שימוש נכון ב-HTTP Methods ו-Status Codes (רוב ה-APIs "ה-RESTful" בתעשייה נמצאים כאן)
- **Level 3** - הוספת HATEOAS (המלא ביותר, אך נדיר בפועל)

## Versioning - סקירה קצרה

```
GET /v1/users              # ב-URL (הכי נפוץ ופשוט)
GET /users
Header: Accept: application/vnd.myapi.v1+json   # ב-Header (יותר "טהור" REST)
```
(נרחיב במדריך נפרד)

## Idempotency Keys ל-POST

כדי למנוע יצירת משאבים כפולים בגלל retry ברשת:
```bash
curl -X POST https://api.example.com/v1/payments \
  -H "Idempotency-Key: 8f3k2m1-unique-request-id" \
  -d '{"amount": 100, "currency": "ILS"}'
```
השרת שומר את התוצאה של הבקשה הראשונה לפי המפתח, ואם מגיעה בקשה נוספת עם אותו מפתח - מחזיר את אותה תוצאה בלי ליצור תשלום כפול.

## טיפים וטריקים

- 💡 השתמשו תמיד ב-`data` wrapper בתשובות (`{"data": [...]}`) - זה מאפשר להוסיף מטא-דאטה (pagination, links) מבלי לשבור מבנה קיים.
- 💡 תמכו ב-**partial responses** ל-endpoints גדולים: `GET /users/42?fields=name,email`
- 💡 הגבילו את גודל ה-response עם pagination בברירת מחדל (למשל 20 פריטים), גם אם הלקוח לא ביקש.
- 💡 השתמשו ב-**PATCH** בפורמט [JSON Merge Patch](https://www.rfc-editor.org/rfc/rfc7396) לעדכונים חלקיים פשוטים.
- ⚠️ הימנעו מלחשוף פרטי implementation פנימיים (שמות טבלאות DB, stack traces) בתשובות שגיאה - זה גם unhelpful וגם risk אבטחתי.

## שאלות נפוצות בראיונות עבודה

**1. איך הייתם מעצבים endpoint לחיפוש מוצרים עם סינון, מיון ו-pagination?**
תשובה טובה: `GET /products?category=x&min_price=100&sort=-price&page=1&per_page=20`, עם תשובה שכוללת `data` ו-`pagination` metadata.

**2. מה זה Richardson Maturity Model?** (ראו הסבר למעלה)

**3. איך הייתם מטפלים ביצירת משאב שדורש כמה שדות חובה חסרים?**
מחזירים `400` או `422` עם גוף תשובה שמפרט בדיוק אילו שדות חסרים/שגויים, כדי שהלקוח יוכל לתקן.

**4. מה ההבדל בין page-based ל-cursor-based pagination, ומתי להעדיף כל אחד?**
Page-based פשוט אך בעייתי עם נתונים שמשתנים תדיר (יכול לדלג/לכפול פריטים). Cursor-based יציב יותר לנתונים דינמיים, אך פחות אינטואיטיבי למשתמש (אי אפשר "לקפוץ לעמוד 5").

**5. מה זה idempotency key ולמה משתמשים בו עם POST?** (ראו הסבר למעלה)

## קישורים חיצוניים ומקורות למידה

- [Microsoft REST API Guidelines (GitHub)](https://github.com/microsoft/api-guidelines)
- [Google API Design Guide](https://cloud.google.com/apis/design)
- [Stripe API Reference](https://stripe.com/docs/api) - דוגמה מצוינת ל-API מתועד ומעוצב היטב
- [Richardson Maturity Model - Martin Fowler](https://martinfowler.com/articles/richardsonMaturityModel.html)
- [JSON:API Specification](https://jsonapi.org/) - תקן מוסכם למבנה תשובות

### סרטוני יוטיוב מומלצים
- [REST API Design Best Practices](https://www.youtube.com/results?search_query=rest+api+design+best+practices)
- [API Design Tips from a Principal Engineer](https://www.youtube.com/results?search_query=api+design+tips+principal+engineer)

---
**במדריך הבא:** Versioning ו-Backward Compatibility.
