---
title: "GraphQL - מבוא והשוואה ל-REST"
category: API
part: 6/10
---

## מה זה GraphQL?

GraphQL הוא שפת שאילתות (Query Language) ל-APIs, שפותחה ב-Facebook ב-2012 ופורסמה כ-Open Source ב-2015. בניגוד ל-REST שבו יש מספר endpoints קבועים, ב-GraphQL יש **endpoint יחיד** (בד"כ `/graphql`), וה**לקוח** מגדיר בדיוק אילו שדות הוא רוצה לקבל.

## הבעיה ש-GraphQL פותר

### Over-fetching (יותר מדי נתונים)
ב-REST, `GET /users/42` עשוי להחזיר עשרות שדות, גם אם אתם צריכים רק את השם:
```json
{ "id": 42, "name": "דנה", "email": "...", "address": {...}, "preferences": {...}, "...": "..." }
```

### Under-fetching (פחות מדי נתונים - צריך כמה קריאות)
אם אתם צריכים גם את שם המשתמש **וגם** את ההזמנות האחרונות שלו, ב-REST לרוב תצטרכו 2 קריאות נפרדות:
```
GET /users/42
GET /users/42/orders
```

## איך GraphQL פותר את זה

**שאילתה יחידה, בדיוק מה שצריך:**
```graphql
query {
  user(id: 42) {
    name
    orders(limit: 5) {
      id
      total
      status
    }
  }
}
```

**התשובה מתאימה בדיוק לשאילתה:**
```json
{
  "data": {
    "user": {
      "name": "דנה כהן",
      "orders": [
        { "id": 501, "total": 150, "status": "shipped" },
        { "id": 498, "total": 75, "status": "delivered" }
      ]
    }
  }
}
```

## שלושת סוגי הפעולות ב-GraphQL

### 1. Query - קריאת נתונים
```graphql
query GetUser($userId: ID!) {
  user(id: $userId) {
    name
    email
  }
}
```

### 2. Mutation - שינוי נתונים (כמו POST/PUT/DELETE ב-REST)
```graphql
mutation CreateUser($name: String!, $email: String!) {
  createUser(name: $name, email: $email) {
    id
    name
    email
  }
}
```

### 3. Subscription - עדכונים בזמן אמת (real-time, דרך WebSockets)
```graphql
subscription OnNewOrder {
  orderCreated {
    id
    total
    customer { name }
  }
}
```

## Schema ו-Types

ב-GraphQL, ה-API מוגדר ע"י **Schema** חזק-טיפוסים (strongly-typed):

```graphql
type User {
  id: ID!
  name: String!
  email: String!
  orders: [Order!]!
}

type Order {
  id: ID!
  total: Float!
  status: OrderStatus!
}

enum OrderStatus {
  PENDING
  SHIPPED
  DELIVERED
}

type Query {
  user(id: ID!): User
  users(limit: Int): [User!]!
}

type Mutation {
  createUser(name: String!, email: String!): User!
}
```

`!` מסמן שדה חובה (Non-Null). ה-Schema הזה הוא גם התיעוד וגם ה-Contract - כלים כמו GraphiQL / Apollo Studio יכולים לקרוא אותו ולייצר תיעוד אינטראקטיבי אוטומטית.

## דוגמת שרת GraphQL בסיסי (Node.js + Apollo Server)

```javascript
const { ApolloServer, gql } = require("apollo-server");

const typeDefs = gql`
  type User {
    id: ID!
    name: String!
  }
  type Query {
    users: [User!]!
  }
`;

const users = [
  { id: "1", name: "דנה כהן" },
  { id: "2", name: "יוסי לוי" }
];

const resolvers = {
  Query: {
    users: () => users
  }
};

const server = new ApolloServer({ typeDefs, resolvers });
server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
```

## דוגמת קריאה מהלקוח (JavaScript, fetch)

```javascript
const query = `
  query {
    users {
      id
      name
    }
  }
`;

const response = await fetch("https://api.example.com/graphql", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ query })
});

const { data } = await response.json();
console.log(data.users);
```

## GraphQL לעומת REST - טבלת השוואה מפורטת

| היבט | REST | GraphQL |
|---|---|---|
| מספר Endpoints | רבים (אחד לכל משאב) | אחד בלבד |
| שליטה בנתונים מוחזרים | לא - השרת קובע | כן - הלקוח קובע בדיוק |
| Over/Under-fetching | בעיה נפוצה | נפתר |
| קוד סטטוס HTTP | משמעותי (200/404/500...) | כמעט תמיד 200, שגיאות בתוך ה-body |
| Caching | קל (HTTP caching רגיל) | מורכב יותר (צריך פתרונות ייעודיים) |
| קובץ Schema | לא חובה (אבל מומלץ - OpenAPI) | חובה, מובנה בשפה |
| עקומת למידה | קלה יותר | תלולה יותר |
| File Upload | טבעי (multipart/form-data) | דורש תוספים/spec נפרד |
| מתאים ל- | רוב המקרים, APIs ציבוריים | אפליקציות עם דרישות דאטה משתנות ומורכבות (mobile, dashboards) |

## מתי לבחור GraphQL ומתי REST?

**GraphQL עדיף כאשר:**
- יש הרבה מסכים/views שונים שצריכים תת-קבוצות שונות של אותם נתונים (למשל אפליקציית מובייל מול web)
- יש בעיית over/under-fetching אמיתית
- הצוות מוכן להשקיע בלמידה ותשתית (caching, monitoring)

**REST עדיף כאשר:**
- ה-API פשוט יחסית, CRUD סטנדרטי
- חשוב caching פשוט ברמת HTTP (CDN, browser cache)
- הצוות/הקהילה כבר מכירים REST טוב, ורוצים למזער עקומת למידה
- צריך תמיכה טובה ב-file upload

> בפועל, הרבה חברות (Facebook, GitHub, Shopify) מציעות **גם REST וגם GraphQL** במקביל.

## טיפים וטריקים

- 💡 השתמשו ב-**DataLoader** (או פתרון דומה) כדי לפתור את בעיית ה-N+1 queries הנפוצה ב-resolvers.
- 💡 הגבילו **עומק שאילתות** (query depth) ומורכבות (complexity) כדי למנוע שאילתות "עוינות" שמעמיסות על השרת.
- 💡 השתמשו ב-**Persisted Queries** בייצור - שולחים רק hash של השאילתה, לא את הטקסט המלא, לביצועים ואבטחה.
- ⚠️ GraphQL לא "פותר קסם" caching - זה דורש תשתית נוספת (Apollo Client cache, normalized caching) בהשוואה ל-HTTP caching הפשוט של REST.

## שאלות נפוצות בראיונות עבודה

**1. מה ההבדל המרכזי בין REST ל-GraphQL?**
ב-REST, השרת קובע איזה נתונים חוזרים מכל endpoint. ב-GraphQL, הלקוח קובע בדיוק אילו שדות הוא רוצה, דרך שאילתה יחידה ל-endpoint אחד.

**2. מהי בעיית N+1 ב-GraphQL, ואיך פותרים אותה?**
כשresolver לכל פריט ברשימה שולח query נפרד ל-DB (למשל להביא את ה"author" של כל פוסט בנפרד) - N פוסטים = N+1 שאילתות. פותרים עם DataLoader שמאגד (batches) בקשות דומות לשאילתה אחת.

**3. איך מטפלים בשגיאות ב-GraphQL, בהשוואה ל-REST?**
ב-REST משתמשים ב-HTTP status codes. ב-GraphQL, התשובה כמעט תמיד `200 OK`, והשגיאות מופיעות במערך `errors` בתוך גוף התשובה, לצד `data`.

**4. מה זה Mutation ב-GraphQL?**
פעולה שמשנה מצב (state) בשרת - מקביל ל-POST/PUT/PATCH/DELETE ב-REST.

**5. האם GraphQL "טוב יותר" מ-REST?**
לא באופן מוחלט - זו בחירת ארכיטקטורה תלוית-הקשר. GraphQL פותר בעיות ספציפיות (over/under-fetching, multiple clients עם צרכים שונים) במחיר מורכבות נוספת.

## קישורים חיצוניים ומקורות למידה

- [GraphQL - Official Documentation](https://graphql.org/learn/)
- [Apollo GraphQL - Tutorials](https://www.apollographql.com/tutorials/)
- [How to GraphQL - The Fullstack Tutorial](https://www.howtographql.com/)
- [GitHub GraphQL API Docs](https://docs.github.com/en/graphql)

### סרטוני יוטיוב מומלצים
- [GraphQL Crash Course](https://www.youtube.com/results?search_query=graphql+crash+course)
- [GraphQL vs REST API](https://www.youtube.com/results?search_query=graphql+vs+rest+api+explained)

---
**במדריך הבא:** אבטחת API - API Security Best Practices.
