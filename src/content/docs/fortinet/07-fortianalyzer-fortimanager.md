---
title: "FortiAnalyzer ו-FortiManager — ניהול מרכזי ולוגים"
category: Fortinet
part: 7/10
---

## למה צריך ניהול מרכזי?

בארגון עם יותר ממכשיר FortiGate אחד (סניפים, Data Centers, HA clusters שונים), ניהול כל מכשיר בנפרד הופך מהר מאוד לבלתי אפשרי. Fortinet מציעה שני מוצרים משלימים:

- **FortiManager** — ניהול קונפיגורציה מרכזי (Provisioning, Policy Push, Firmware Management)
- **FortiAnalyzer** — איסוף לוגים מרכזי, דוחות, אנליטיקה, וזיהוי אירועי אבטחה

לעיתים הם מותקנים כמוצר משולב באותה חומרה/VM, אך תפקידית זה שני "מוחות" שונים.

## FortiManager — ניהול קונפיגורציה מרכזי

### מושגי מפתח:

- **ADOM (Administrative Domain)** — "מיכל" לוגי שמפריד בין קבוצות מכשירים (למשל לפי לקוח, אזור, או סוג רשת) — שימושי מאוד ב-MSSP או ארגונים גדולים
- **Device Manager** — רישום וניהול המכשירים המחוברים (Add Device)
- **Policy Package** — "חבילת מדיניות" שמוגדרת פעם אחת ונדחפת (Install) למספר FortiGate-ים בבת אחת
- **Global Policy** — כללים גלובליים שחלים על כל ה-ADOM-ים, ומאפשרים למשל לאכוף כלל אבטחה זהה בכל סניפי הארגון

### תהליך טיפוסי לניהול מספר סניפים

1. חיבור כל FortiGate ל-FortiManager (דרך FGFM protocol, פורט 541)
2. יצירת Policy Package אחד המכיל כללים משותפים (למשל: חסימת מדינות מסוכנות, כללי VPN סטנדרטיים)
3. Install ה-Package למספר מכשירים בו-זמנית
4. שינויים עתידיים נעשים **פעם אחת** ב-FortiManager ונדחפים לכולם — במקום להיכנס ל-20 מכשירים בנפרד

### רישום FortiGate ל-FortiManager (בצד ה-FortiGate)

```bash
config system central-management
    set type fortimanager
    set fmg "10.0.0.5"
    set include-default-servers disable
end
```

## FortiAnalyzer — לוגים ואנליטיקה

### מה FortiAnalyzer עושה?

- אוסף לוגים מכל ה-FortiGate-ים (Traffic logs, Event logs, Security logs — IPS/AV/Web Filter)
- מאפשר **דוחות** מובנים (למשל: Top Applications, Top Bandwidth Users, Threat Summary)
- כולל FortiView — ממשק חקירה ויזואלי (Drill-down) לתעבורה ואירועים
- תומך ב-**Event Handlers** — יצירת התראות אוטומטיות (למשל: 5 ניסיונות כניסה כושלים תוך דקה → Alert)

### הגדרת שליחת לוגים מ-FortiGate ל-FortiAnalyzer

```bash
config log fortianalyzer setting
    set status enable
    set server "10.0.0.6"
    set upload-option realtime
end

config log fortianalyzer filter
    set severity information
end
```

### דוגמת שאילתת לוגים (Log View) שימושית

חיפוש כל ניסיונות ה-Deny מכתובת מקור מסוימת בשבוע האחרון — ניתן לבצע דרך ה-GUI של FortiAnalyzer עם פילטרים כמו:

```
srcip=203.0.113.99 and action=deny
```

## FortiGate Cloud — אלטרנטיבת SaaS

עבור ארגונים קטנים-בינוניים שלא רוצים להקים FortiManager/FortiAnalyzer בעצמם, Fortinet מציעה **FortiGate Cloud** — שירות ענן מנוהל שנותן פונקציונליות דומה (לוגים, דוחות, ניהול קונפיגורציה בסיסי) ללא צורך בתשתית משלכם.

## למה זה חשוב לתפקידי SOC/NOC

מי שעובד ב-SOC (Security Operations Center) עם FortiAnalyzer צריך לדעת:

- לנתח **FortiView Threat Map** לזיהוי תקיפות בזמן אמת
- להגדיר Event Handlers/Alerts שמתריעים אוטומטית ל-SIEM חיצוני (Splunk, QRadar, FortiSIEM) דרך Syslog/CEF
- לחקור אירוע ספציפי (Incident Response) על ידי Drill-down מ-Summary View ועד ל-Raw Logs

## קישורים חיצוניים

- 📘 תיעוד רשמי FortiManager: https://docs.fortinet.com/product/fortimanager/
- 📘 תיעוד רשמי FortiAnalyzer: https://docs.fortinet.com/product/fortianalyzer/
- 🎥 YouTube חיפוש מומלץ: `FortiManager centralized management tutorial`
- 🎥 YouTube חיפוש מומלץ: `FortiAnalyzer FortiView logs reporting`

## טיפים וטריקים

- שאלת ראיון נפוצה: "מה ההבדל בין FortiManager ל-FortiAnalyzer?" — תשובה קצרה: **FortiManager = קונפיגורציה, FortiAnalyzer = לוגים ואנליטיקה**
- כשלוגים "לא מגיעים" ל-FortiAnalyzer — הצעד הראשון הוא לבדוק קישוריות רשת (פורט 514 UDP/TCP או Reliable Logging ב-TCP), ולאחר מכן `diagnose test application oftpd` ב-FortiGate-ים
- ADOM לא מוגדר נכון הוא סיבה נפוצה מאוד לבלבול ב-FortiManager ("איפה המכשיר שלי?") — לוודא תמיד שעובדים ב-ADOM הנכון
- כדאי להכיר את מנגנון ה-Revision History ב-FortiManager — מאפשר "לחזור אחורה" בקונפיגורציה במקרה של טעות
