---
title: "Threat Prevention - IPS, Anti-Bot, Anti-Virus, Threat Emulation"
description: "Blades למניעת איומים - IPS, Anti-Bot ו-Anti-Virus מול ThreatCloud, Sandboxing ב-Threat Emulation וניקוי קבצים ב-Threat Extraction."
category: Check Point
part: 6/10
---

## סקירת ה-Blades

Threat Prevention ב-Check Point הוא מטריה של כמה Blades שעובדים יחד להגנה מפני איומים מתקדמים:

| Blade | תפקיד |
|---|---|
| **IPS** (Intrusion Prevention System) | זיהוי וחסימת ניצול פרצות (Exploits) בזמן אמת, מבוסס חתימות (Signatures) |
| **Anti-Bot** | זיהוי מכשירים נגועים שמנסים לתקשר עם שרתי Command & Control |
| **Anti-Virus** | סריקת קבצים וזיהוי תוכנות זדוניות ידועות |
| **Threat Emulation** | הרצת קבצים חשודים ב-Sandbox מבודד לזיהוי התנהגות זדונית לא ידועה (Zero-Day) |
| **Threat Extraction** | ניקוי (CDR - Content Disarm & Reconstruction) של קבצים - הסרת אלמנטים פעילים (מאקרו, סקריפטים) מקבצים לפני שהם מגיעים למשתמש |

## Threat Prevention Policy - מבנה נפרד מ-Firewall Policy

בשונה ממדיניות Firewall, ל-Threat Prevention יש **Policy נפרד** משלו ב-SmartConsole (טאב "Threat Prevention"), עם Rule Base משלו שמגדיר:

- **Protected Scope** - על איזו תעבורה/רשתות חלה ההגנה.
- **Profile** - פרופיל הגנה (Optimized, Strict, Custom) שקובע רמת אגרסיביות.

## IPS - עומק

IPS פועל לפי **חתימות (Signatures)** של פרצות ידועות, המתעדכנות באופן שוטף מ-Check Point (דרך שירות Update). כל חתימה מוגדרת עם:

- **Severity** (חומרה) - Low/Medium/High/Critical.
- **Confidence Level** - עד כמה בטוח הזיהוי (למניעת False Positives).
- **Performance Impact** - כמה החתימה "כבדה" על ביצועי הגייטווי.
- **Action** - Detect (רק Log) או Prevent (חסימה בפועל).

```bash
# בדיקת גרסת חתימות IPS מותקנת
fw ctl get int ips_state
```

## Anti-Bot ו-Anti-Virus

שני ה-Blades הללו עובדים על בסיס **ThreatCloud** - מאגר Reputation גלובלי בענן של Check Point, שבו מיליוני Sensors ברחבי העולם משתפים מידע על איומים בזמן אמת. הגייטווי בודק URL/Hash/IP מול ThreatCloud כדי לקבוע אם הם זדוניים.

- **Anti-Bot** מזהה תבניות תקשורת אופייניות ל-Botnet (למשל תדירות פנייה קבועה לשרת חיצוני, DNS לדומיינים חשודים).
- **Anti-Virus** בודק קבצים עוברים מול Signatures ו-Reputation.

## Threat Emulation (Sandboxing)

כשקובץ חשוד (למשל צרופת מייל) לא מזוהה ע"י Signatures קיימות, ניתן לשלוח אותו ל-**Sandbox** להרצה מבוקרת בסביבה מבודדת (מקומית - Threat Emulation Appliance, או בענן - Check Point ThreatCloud Emulation). הסביבה מדמה מערכת הפעלה אמיתית (Windows, וכו') ובודקת אם הקובץ מבצע פעולות זדוניות (יצירת קבצים, שינויי Registry, תקשורת חשודה).

זמן אמולציה טיפוסי הוא כמה עשרות שניות עד כמה דקות, ולכן ישנה אפשרות ל-**Hold** (עצירת הקובץ עד תום הבדיקה) או **Background** (מעבירים את הקובץ ובודקים ברקע, עם התראה אם מתגלה בעיה בדיעבד).

## Threat Extraction (CDR)

בשונה מ-Emulation שמנסה "לתפוס" תוכנה זדונית, Threat Extraction פשוט **מנקה** את הקובץ - מסיר מאקרואים, אובייקטים משובצים, קישורים פעילים - ומעביר גרסה "נקייה" מיידית למשתמש, בעוד המקור עובר בדיקה ברקע וזמין להורדה במידת הצורך.

## דוגמה: הגדרת Threat Prevention Policy בסיסית

```
1. Threat Prevention Tab -> Policy
2. Rule 1: Protected Scope: Internal_Net -> Profile: "Optimized" -> Action: Prevent
3. Blades מופעלים: IPS, Anti-Bot, Anti-Virus
4. Threat Emulation: מוגדר על תעבורת מייל (SMTP) וגלישה (HTTP/HTTPS)
```

## דוגמה: בדיקת Logs לאירוע חשוד

```bash
# חיפוש לוגים של Anti-Bot בגייטווי (בסיסי, בפועל עובדים דרך SmartConsole/SmartEvent)
fw log -n | grep "Anti Bot"
```

ב-Production מומלץ תמיד לנתח דרך **SmartEvent** (ראו מדריך 7) ולא ידנית מה-CLI.

## טיפים וטריקים

- **Profile "Optimized"** הוא ברירת המחדל המומלצת לרוב הארגונים - איזון בין הגנה לביצועים. פרופיל "Strict" מומלץ רק לסביבות עם רגישות גבוהה במיוחד (למשל DMZ חשוף).
- זכרו לעדכן **IPS Update** באופן שוטף (Automatic Updates) - חתימות ישנות = הגנה חלקית.
- אם יש בעיית ביצועים לאחר הפעלת IPS, אפשר לזהות חתימות "כבדות" (High Performance Impact) ולשקול השבתה סלקטיבית שלהן במקום כיבוי כל ה-Blade.
- Threat Emulation יכול להעלות Latency בתעבורת מייל/קבצים - חשוב לתאם ציפיות עם המשתמשים, ולשקול Background Mode אם Hold לא מתאים לעסק.
- False Positives הם חלק בלתי נמנע מ-IPS/Anti-Bot - יש תהליך רשמי של **Exception** לחתימה ספציפית במקום כיבוי כללי.

## שאלות נפוצות לראיון עבודה בנושא זה

<details class="qa">
<summary>1. מה ההבדל בין IPS ל-Anti-Bot מבחינת סוג האיום שהם מזהים?</summary>

IPS מתמקד ב**ניסיון החדירה** — ניצול פגיעויות וחתימות תקיפה בתעבורה הנכנסת. Anti-Bot מתמקד ב**תוצאה**: מכונה שכבר נדבקה ומנסה לתקשר עם שרת שליטה (C&C). במילים אחרות, IPS מנסה למנוע את ההדבקה ו-Anti-Bot מזהה שהיא כבר קרתה ועוצר את הנזק.

</details>

<details class="qa">
<summary>2. הסבירו את ההבדל בין Threat Emulation ל-Threat Extraction.</summary>

Threat Emulation הוא Sandbox — הקובץ מורץ בסביבה מבודדת כדי לזהות התנהגות זדונית, מה שלוקח זמן אך מזהה איומי Zero-Day. Threat Extraction מנקה את הקובץ מיידית (מסיר מאקרו, סקריפטים ואובייקטים פעילים) ומוסר למשתמש גרסה בטוחה תוך שניות. בפועל משלבים: המשתמש מקבל קובץ מנוקה מיד, ובמקביל רצה אמולציה על המקור.

</details>

<details class="qa">
<summary>3. מה זה ThreatCloud ואיך הוא משפר את זמן התגובה לאיומים?</summary>

מאגר המודיעין הענני של Check Point, שמאגד טלמטריה ממיליוני חיישנים ברחבי העולם. כשאיום מזוהה אצל לקוח אחד, החתימה או האינדיקטור מופצים לכלל הגייטוויים תוך זמן קצר — כך שזמן התגובה יורד מימים לדקות, בלי להמתין לעדכון גרסה.

</details>

<details class="qa">
<summary>4. מה ההבדל בין מצב Detect ל-Prevent בחתימת IPS?</summary>

ב-Detect התעבורה עוברת ונרשם לוג בלבד — מצב שמתאים לשלב ההטמעה, כדי למפות False Positives בלי לפגוע בשירות. ב-Prevent התעבורה נחסמת בפועל. הנוהג המקובל: להתחיל ב-Detect, לנתח את הלוגים לאורך תקופה, ורק אז לעבור ל-Prevent.

</details>

<details class="qa">
<summary>5. איך הייתם מטפלים ב-False Positive של חתימת IPS שחוסמת אפליקציה לגיטימית?</summary>

קודם מאמתים בלוג שזו אכן החתימה שחוסמת (Blade=IPS, שם ה-Protection). אחר כך בודקים אם החתימה רלוונטית בכלל לסביבה, ואם כן — יוצרים Exception ממוקד לאותו מקור/יעד/שירות בלבד, במקום לכבות את החתימה גלובלית. מתעדים את החריג, קובעים תאריך בדיקה חוזרת, ובמקביל מוודאים מול היצרן אם יש עדכון שמתקן את הזיהוי.

</details>

<details class="qa">
<summary>6. מה ההבדל בין Hold ל-Background ב-Threat Emulation, ומתי תבחרו בכל אחד?</summary>

ב-Hold הקובץ מעוכב עד שהאמולציה מסתיימת — מאובטח יותר אך גורם להמתנה למשתמש. ב-Background הקובץ מועבר מיד והאמולציה רצה במקביל, כך שאם יתגלה כזדוני תהיה התרעה אך הוא כבר הגיע ליעד. בסביבה רגישה בוחרים Hold (רצוי בשילוב Threat Extraction כדי למנוע את ההמתנה), ובסביבה שרגישה לחוויית משתמש — Background.

</details>

## קישורים חיצוניים

- Threat Prevention Admin Guide (רשמי): https://sc1.checkpoint.com/documents/
- מאמרי SK על IPS, Anti-Bot, Threat Emulation: https://support.checkpoint.com/
- ThreatCloud - מידע נוסף על הענן הגלובלי: https://www.checkpoint.com/
- CheckMates - דיוני Threat Prevention: https://community.checkpoint.com/
- הדרכה בנושא Threat Prevention ביוטיוב: https://www.youtube.com/watch?v=RUyYR1jbmUI
- חיפוש נוסף ביוטיוב: https://www.youtube.com/results?search_query=Check+Point+Threat+Prevention+IPS+Sandbox+tutorial
