---
title: "Versioning ו-Backward Compatibility"
category: API
part: 5/10
---

## למה צריך Versioning בכלל?

ברגע ש-API בשימוש בייצור, שינויים "שוברים" (Breaking Changes) עלולים להפיל אפליקציות של לקוחות שלא עדכנו את הקוד שלהם. Versioning מאפשר להריץ כמה גרסאות של ה-API במקביל, ולתת ללקוחות זמן לעבור לגרסה החדשה בקצב שלהם.

## מה נחשב Breaking Change?

| שינוי | Breaking? |
|---|---|
| הוספת שדה חדש (אופציונלי) לתשובה | ❌ לא |
| הוספת endpoint חדש | ❌ לא |
| הוספת query parameter אופציונלי | ❌ לא |
| הסרת שדה מהתשובה | ✅ כן |
| שינוי שם שדה | ✅ כן |
| שינוי סוג נתונים של שדה (string→number) | ✅ כן |
| הפיכת שדה אופציונלי לחובה | ✅ כן |
| שינוי משמעות/behavior של endpoint קיים | ✅ כן |

## שיטות Versioning נפוצות

### 1. Versioning ב-URL (הנפוץ ביותר)
```
GET https://api.example.com/v1/users
GET https://api.example.com/v2/users
```
**יתרונות:** פשוט, ברור, קל לבדוק בדפדפן, קל לתעד.
**חסרונות:** "לא טהור" מבחינת REST - ה-URI אמור לזהות משאב, לא גרסת API.

### 2. Versioning ב-Header
```
GET /users HTTP/1.1
Accept: application/vnd.myapi.v2+json
```
או header מותאם אישית:
```
GET /users HTTP/1.1
API-Version: 2
```
**יתרונות:** ה-URI נשאר "נקי" ועקבי. **חסרונות:** פחות נוח לבדיקה ידנית, פחות גלוי למפתחים.

### 3. Versioning ב-Query Parameter
```
GET /users?version=2
```
פחות נפוץ, לרוב לא מומלץ כשיטה עיקרית (query params יותר מתאימים לפילטרים).

### 4. ללא Versioning מפורש - "Evolve, Don't Version"
גישה חלופית: לא לגרסן בכלל, אלא לתכנן API כך שרק מוסיפים (additive changes) ולעולם לא שוברים. דורש משמעת גבוהה בתכנון.

> **המלצה מעשית:** לרוב הפרויקטים, **Versioning ב-URL** (`/v1/`, `/v2/`) הוא הבחירה הפרקטית ביותר - קל להבין, לתעד ולתחזק.

## אסטרטגיית Deprecation (הוצאה משימוש)

כשגרסה ישנה יוצאת משימוש, חשוב לתקשר את זה בבירור:

```
HTTP/1.1 200 OK
Deprecation: true
Sunset: Sat, 31 Dec 2026 23:59:59 GMT
Link: <https://api.example.com/docs/migration-v1-to-v2>; rel="deprecation"
```

- `Deprecation` Header - מודיע שה-endpoint מיושן
- `Sunset` Header (RFC 8594) - התאריך שבו הגרסה תפסיק לעבוד לגמרי
- מומלץ לשלוח גם **מייל/הודעה** ללקוחות רשומים (לא להסתמך רק על headers)

## דוגמת מעבר הדרגתי (Gradual Migration)

```
שלב 1: משיקים v2 במקביל ל-v1 (שתיהן פעילות)
שלב 2: מסמנים v1 כ-Deprecated, שולחים הודעות ללקוחות
שלב 3: תקופת מעבר (בד"כ 6-12 חודשים)
שלב 4: מנטרים כמה תעבורה עדיין מגיעה ל-v1
שלב 5: כשהתעבורה נמוכה מספיק (או שהתאריך המובטח הגיע) - מכבים את v1
```

## Semantic Versioning (SemVer) - רקע

אף על פי ש-APIs לרוב לא משתמשים ב-SemVer מלא (`MAJOR.MINOR.PATCH`) כמו ספריות קוד, הרעיון דומה:
- **MAJOR** (v1→v2) - Breaking changes
- **MINOR** - פיצ'רים חדשים, backward compatible
- **PATCH** - תיקוני באגים, backward compatible

ב-REST APIs, לרוב חושפים כלפי חוץ רק את מספר ה-MAJOR (`/v1/`, `/v2/`), ומנהלים MINOR/PATCH "מאחורי הקלעים".

## דוגמת קוד - ניתוב לפי גרסה ב-Express.js

```javascript
const express = require("express");
const app = express();

const v1Router = require("./routes/v1/users");
const v2Router = require("./routes/v2/users");

app.use("/v1/users", v1Router);
app.use("/v2/users", v2Router);

// Middleware שמוסיף Deprecation header לכל תשובה מ-v1
app.use("/v1", (req, res, next) => {
  res.set("Deprecation", "true");
  res.set("Sunset", "Sat, 31 Dec 2026 23:59:59 GMT");
  next();
});

app.listen(3000);
```

## טיפים וטריקים

- 💡 תכננו Versioning **מהיום הראשון**, גם אם אתם משיקים רק v1 - קל מאוד לשכוח ואז "לתקוע" את כל הלקוחות בגרסה אחת לנצח.
- 💡 שדות חדשים בתשובה תמיד יהיו **אופציונליים** ועם ברירת מחדל הגיונית - כך לקוחות ישנים לא ישברו.
- 💡 שקלו **Feature Flags** לשינויים גדולים, במקום לחכות ל-major version חדשה לכל שינוי.
- 💡 תעדו כל שינוי ב-**Changelog** נגיש (למשל `CHANGELOG.md` או עמוד ייעודי בדוקומנטציה).
- ⚠️ אל תמחקו endpoint ישן בלי הודעה מוקדמת - זה "שובר אמון" עם צרכני ה-API.

## שאלות נפוצות בראיונות עבודה

**1. אילו שיטות Versioning אתם מכירים, ומה תבחרו ולמה?**
URL, Header, Query Param. לרוב עונים: URL Versioning כי הוא הכי פשוט ונפוץ בתעשייה, למרות שהוא "פחות טהור" מבחינת REST.

**2. מה נחשב Breaking Change?** (ראו טבלה למעלה - חשוב לתת דוגמאות קונקרטיות)

**3. איך הייתם מנהלים deprecation של endpoint ישן?**
שילוב של Headers (`Deprecation`, `Sunset`), תיעוד מפורש, הודעה מראש ללקוחות, וניטור שימוש לפני כיבוי סופי.

**4. האם אפשר לתכנן API כך שלא צריך Versioning בכלל?**
תיאורטית כן ("Evolve, Don't Version") - ע"י הוספה בלבד, שדות אופציונליים, ותמיכה ב-backward compatibility מובנית. בפועל, כמעט כל API גדול בסופו של דבר צריך Major Version בשלב כלשהו.

## קישורים חיצוניים ומקורות למידה

- [Stripe API Versioning](https://stripe.com/docs/api/versioning) - דוגמה מצוינת מהתעשייה
- [RFC 8594 - The Sunset HTTP Header Field](https://www.rfc-editor.org/rfc/rfc8594)
- [Semantic Versioning (semver.org)](https://semver.org/)
- [Microsoft API Guidelines - Versioning](https://github.com/microsoft/api-guidelines/blob/vNext/azure/Guidelines.md#12-versioning)

### סרטוני יוטיוב מומלצים
- [API Versioning Strategies Explained](https://www.youtube.com/results?search_query=api+versioning+strategies+explained)
- [How Stripe Designs Their API](https://www.youtube.com/results?search_query=how+stripe+designs+their+api)

---
**במדריך הבא:** GraphQL - מבוא והשוואה ל-REST.
