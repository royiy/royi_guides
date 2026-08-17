---
title: "אימות והרשאה - Authentication ו-Authorization"
category: API
part: 3/10
---

## ההבדל בין Authentication ל-Authorization

- **Authentication (אימות / AuthN)** - "מי אתה?" - תהליך אימות זהות המשתמש/הלקוח.
- **Authorization (הרשאה / AuthZ)** - "מה מותר לך לעשות?" - תהליך בדיקה מה למשתמש המזוהה מותר לגשת/לבצע.

זו אחת השאלות הכי נפוצות בראיונות - **תמיד** תדעו להסביר את ההבדל בביטחון.

## שיטות אימות נפוצות ל-API

### 1. API Keys

מפתח סטטי שהלקוח שולח בכל בקשה, בדרך כלל ב-Header.

```bash
curl https://api.example.com/v1/data \
  -H "X-API-Key: sk_live_51H8x9J2eZvKYlo2C"
```

**יתרונות:** פשוט מאוד למימוש ולשימוש.
**חסרונות:** אין תפוגה (expiration) מובנית, קשה לשלוט בהרשאות עדינות, אם דלף - חייבים לבטל ידנית.
מתאים בעיקר ל-**Server-to-Server** communication (לא לחשיפה בצד לקוח/דפדפן).

### 2. Basic Authentication

שם משתמש וסיסמה מקודדים ב-Base64 (לא מוצפן! חייב HTTPS).

```bash
curl https://api.example.com/v1/data \
  -u "username:password"
```

```
Authorization: Basic dXNlcm5hbWU6cGFzc3dvcmQ=
```

**חיסרון עיקרי:** הסיסמה נשלחת (מקודדת אבל לא מוצפנת) בכל בקשה. נחשב ישן ולא מומלץ למערכות מודרניות.

### 3. Bearer Tokens (כללי)

טוקן שהלקוח מקבל אחרי אימות ראשוני, ושולח בכל בקשה עוקבת:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. JWT (JSON Web Token)

הפורמט הנפוץ ביותר כיום ל-Bearer Tokens. JWT מורכב מ-3 חלקים מופרדים בנקודות: `Header.Payload.Signature`

```
eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6ItXTUteQ0LxV.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

**דוגמה למבנה Payload (מפוענח):**
```json
{
  "sub": "user_42",
  "name": "דנה כהן",
  "role": "admin",
  "iat": 1735689600,
  "exp": 1735693200
}
```

**נקודות חשובות ל-JWT:**
- ה-Payload **לא מוצפן**, רק מקודד (Base64) - אל תשימו בו מידע רגיש כמו סיסמאות!
- ה-**Signature** הוא מה שמבטיח שהטוקן לא זויף (ע"י המפתח הסודי של השרת)
- `exp` (expiration) קובע מתי הטוקן פג תוקף - חשוב לשמור זמן תפוגה קצר יחסית
- JWTs הם **Stateless** - השרת לא צריך לשמור אותם ב-DB, רק לוודא את החתימה

**דוגמה - יצירת JWT ב-Node.js:**
```javascript
const jwt = require("jsonwebtoken");

const token = jwt.sign(
  { sub: "user_42", role: "admin" },
  process.env.JWT_SECRET,
  { expiresIn: "1h" }
);

// אימות טוקן
try {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  console.log(decoded);
} catch (err) {
  console.log("טוקן לא תקין או פג תוקף");
}
```

### 5. OAuth 2.0

תקן פתוח לאצילת הרשאות (delegated authorization) - מאפשר לאפליקציה לגשת למשאבים בשם המשתמש, בלי שהיא תראה את הסיסמה שלו (למשל: "התחבר עם Google").

**המושגים המרכזיים ב-OAuth 2.0:**
- **Resource Owner** - המשתמש עצמו
- **Client** - האפליקציה שרוצה גישה
- **Authorization Server** - השרת שמנפיק טוקנים (למשל שרתי Google/Facebook)
- **Resource Server** - ה-API שמחזיק את הנתונים המבוקשים

**זרימת Authorization Code (הנפוצה ביותר, לאפליקציות server-side):**

```
1. המשתמש לוחץ "התחבר עם Google" באפליקציה שלכם
2. האפליקציה מפנה את המשתמש לדף ההתחברות של Google
3. המשתמש מתחבר ומאשר הרשאות
4. Google מפנה חזרה לאפליקציה עם "authorization code"
5. האפליקציה (בצד השרת) שולחת את הקוד ל-Google בתמורה ל-access token
6. האפליקציה משתמשת ב-access token כדי לגשת ל-API של Google בשם המשתמש
```

```bash
# שלב 5 - החלפת ה-code בטוקן
curl -X POST https://oauth2.googleapis.com/token \
  -d "code=AUTH_CODE_HERE" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "redirect_uri=https://yourapp.com/callback" \
  -d "grant_type=authorization_code"
```

**סוגי Grant נוספים ב-OAuth 2.0:**
- `client_credentials` - לתקשורת server-to-server (אין משתמש מעורב)
- `refresh_token` - לחידוש access token פג-תוקף בלי לבקש מהמשתמש להתחבר שוב
- ~~`implicit`~~ - היה בשימוש ל-SPA, כיום **מיושן ולא מומלץ** מסיבות אבטחה (החליף אותו PKCE)
- `PKCE` (Proof Key for Code Exchange) - תוספת אבטחה ל-Authorization Code flow, מומלץ היום גם ל-SPA וגם ל-mobile

### 6. Session-based Authentication (Cookies)

שיטה מסורתית - השרת יוצר session ומחזיק אותו בזיכרון/DB, ושולח ללקוח cookie עם session ID.

```
Set-Cookie: session_id=abc123; HttpOnly; Secure; SameSite=Strict
```

**הבדל מרכזי מ-JWT:** Session היא **Stateful** (השרת חייב לזכור אותה), בעוד JWT היא **Stateless**. Session נפוצה יותר באפליקציות web מסורתיות; JWT נפוץ יותר ב-APIs ומיקרו-שירותים.

## טבלת השוואה מהירה

| שיטה | Stateless? | מתאים ל- | רמת אבטחה |
|---|---|---|---|
| API Key | כן | Server-to-Server | בינונית |
| Basic Auth | כן | פנימי/Legacy | נמוכה (חייב HTTPS) |
| JWT | כן | APIs מודרניים, מיקרו-שירותים | גבוהה (עם מימוש נכון) |
| OAuth 2.0 | תלוי | Third-party access, "Login with X" | גבוהה |
| Session/Cookie | לא | אפליקציות web מסורתיות | גבוהה (עם HttpOnly+Secure) |

## טיפים וטריקים

- 💡 **לעולם** אל תשמרו טוקנים או API Keys ב-source control (git) - השתמשו ב-environment variables או secret managers (AWS Secrets Manager, HashiCorp Vault וכו').
- 💡 קבעו זמן תפוגה קצר ל-Access Tokens (דקות עד שעות) והשתמשו ב-Refresh Tokens לחידוש.
- 💡 ב-JWT, שמרו על ה-Secret Key חזק (לפחות 256 ביט) ותחליפו אותו מדי פעם (key rotation).
- 💡 השתמשו תמיד ב-HTTPS - בלעדיו, כל שיטת אימות חשופה ל-Man-in-the-Middle attacks.
- ⚠️ אל תשימו מידע רגיש (סיסמאות, מספרי כרטיס אשראי) ב-JWT payload - הוא רק מקודד, לא מוצפן, וכל אחד יכול לפענח אותו.
- ⚠️ הימנעו מ-Implicit Grant ב-OAuth 2.0 - השתמשו ב-Authorization Code + PKCE.

## שאלות נפוצות בראיונות עבודה

**1. מה ההבדל בין Authentication ל-Authorization?** (ראו הסבר בתחילת המדריך)

**2. מה ההבדל בין JWT ל-Session-based Auth?**
JWT הוא Stateless - כל המידע נמצא בטוקן עצמו והשרת רק מוודא חתימה. Session היא Stateful - השרת שומר את המידע (בזיכרון/DB/Redis) ומזהה את המשתמש דרך ID.

**3. איך JWT מבטיח שהטוקן לא זויף?**
דרך ה-Signature - חתימה קריפטוגרפית שנוצרת מה-Header וה-Payload יחד עם מפתח סודי (HMAC) או זוג מפתחות (RSA/ECDSA). כל שינוי בתוכן הטוקן יגרום לחתימה לא להתאים.

**4. מה קורה אם access token דלף?**
תוקף מוגבל בזמן (אם הגדרתם exp קצר) מגביל את הנזק. בנוסף אפשר לשמור רשימת "Revoked tokens" (blacklist) בצד השרת, אם כי זה שובר קצת את עקרון ה-Statelessness.

**5. מה זה Refresh Token ולמה משתמשים בו?**
טוקן ארוך טווח (יכול לחיות ימים/שבועות) שמשמש רק כדי לקבל Access Token חדש, בלי לחייב את המשתמש להתחבר שוב. Refresh Tokens נשמרים בצד השרת ואפשר לבטל אותם.

**6. הסבירו את זרימת OAuth 2.0 Authorization Code בקצרה.**
(ראו התרשים למעלה - חשוב לדעת את 5-6 השלבים בסדר הנכון)

**7. מה זה RBAC ו-ABAC?**
- **RBAC** (Role-Based Access Control) - הרשאות מוגדרות לפי תפקיד (admin, editor, viewer)
- **ABAC** (Attribute-Based Access Control) - הרשאות מוגדרות לפי תכונות (attributes) של המשתמש, המשאב וההקשר (למשל: "רק בין 9:00-17:00", "רק אם המחלקה תואמת")

## קישורים חיצוניים ומקורות למידה

- [OAuth 2.0 Simplified (oauth.com)](https://www.oauth.com/)
- [jwt.io - Debugger ומידע על JWT](https://jwt.io/introduction)
- [Auth0 - What is OAuth 2.0?](https://auth0.com/intro-to-iam/what-is-oauth-2)
- [MDN - HTTP Authentication](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication)
- [RFC 6749 - The OAuth 2.0 Authorization Framework](https://www.rfc-editor.org/rfc/rfc6749)

### סרטוני יוטיוב מומלצים
- [OAuth 2.0 and OpenID Connect Explained](https://www.youtube.com/results?search_query=oauth+2.0+explained+simply)
- [JWT Authentication Tutorial](https://www.youtube.com/results?search_query=jwt+authentication+tutorial)
- [API Keys vs JWT vs OAuth](https://www.youtube.com/results?search_query=api+keys+vs+jwt+vs+oauth+explained)

---
**במדריך הבא:** עקרונות לתכנון API טוב - REST API Design Best Practices.
