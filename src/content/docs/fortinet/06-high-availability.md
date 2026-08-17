---
title: "High Availability (HA) ב-FortiGate"
category: Fortinet
part: 6/10
---

## למה צריך HA?

בסביבת Production, נפילת הפיירוול = נפילת כל הרשת הארגונית (או לפחות ניתוקה מהאינטרנט). **FortiGate Clustering Protocol (FGCP)** מאפשר להגדיר שני (או יותר) מכשירי FortiGate כזוג HA, כך שאם אחד נופל — השני ממשיך לעבוד ללא הפרעה (או עם הפרעה מינימלית).

## מצבי HA עיקריים

1. **Active-Passive (A-P)** — הנפוץ ביותר. מכשיר אחד (Primary/Master) מעבד את כל התעבורה, השני (Secondary/Slave) בהמתנה, מסתנכרן עם ה-Primary כל הזמן, ומשתלט מיידית (Failover) אם ה-Primary נופל
2. **Active-Active (A-A)** — שני המכשירים מעבדים תעבורה בו-זמנית (load balancing בין החברים), פחות נפוץ ומתאים בעיקר לתרחישי ביצועים גבוהים עם הרבה עומס UTM

## דרישות מוקדמות

- שני מכשירי FortiGate **מאותו דגם** (Model) עם **אותה גרסת FortiOS** בדיוק
- כבל ייעודי בין ה-2 מכשירים לסנכרון (HA Heartbeat) — בד"כ ממשק/כבל נפרד
- אותו מספר ממשקי רשת מחוברים באותה טופולוגיה בשני המכשירים

## דוגמת קונפיגורציה — Active-Passive HA

**מכשיר A (יהפוך ל-Primary):**

```bash
config system ha
    set group-id 10
    set group-name "HA-Cluster-01"
    set mode a-p
    set password "HA_Sync_Password123"
    set hbdev "port10" 50
    set override enable
    set priority 200
end
```

**מכשיר B (יהפוך ל-Secondary):**

```bash
config system ha
    set group-id 10
    set group-name "HA-Cluster-01"
    set mode a-p
    set password "HA_Sync_Password123"
    set hbdev "port10" 50
    set override enable
    set priority 100
end
```

**הסבר על שדות מרכזיים:**
- `group-id` — מזהה ייחודי לקלאסטר (חייב להיות זהה בשני הצדדים; חשוב במיוחד כשיש כמה זוגות HA באותה רשת, כי זה גם קובע MAC וירטואלי)
- `password` — סיסמת סנכרון (חייבת להיות זהה)
- `hbdev` — הממשק (או כמה ממשקים) המשמש ל-Heartbeat, עם Priority
- `priority` — קובע מי יהיה Primary (הגבוה יותר מנצח)
- `override` — קובע האם ה-Priority "כופה" מי Primary גם אחרי Failback

## איך FGCP עובד בפועל

1. שני המכשירים "רואים" זה את זה דרך ה-Heartbeat Interface ובודקים תקינות (Health Check)
2. הקונפיגורציה (Policies, Objects, VPN וכו') מסתנכרנת אוטומטית מה-Primary לכל ה-Secondary
2. Session-ים פעילים (חיבורי TCP/UDP קיימים) מסתנכרנים גם הם, כך שב-Failover רוב הסשנים לא מתנתקים (Session Failover)
4. אם ה-Primary נופל (או מפסיק להגיב ל-Heartbeat) — ה-Secondary עולה תוך שניות ל-Primary החדש

## מה קורה בזמן Failover?

- ה-MAC Address הוירטואלי של הקלאסטר "עובר" למכשיר החדש (Virtual MAC), כך שהמתגים/Router-ים הסמוכים לא צריכים לעדכן ARP באופן ידני
- זמן ה-Failover טיפוסי הוא **שניות בודדות**

## בדיקת סטטוס HA

```bash
# הצגת סטטוס הקלאסטר
get system ha status

# פירוט חברים בקלאסטר
diagnose sys ha status

# בדיקת סנכרון קונפיגורציה
diagnose sys ha checksum cluster
```

## Best Practices

- להשתמש ב-**Direct Cable** (לא דרך switch) לחיבור ה-Heartbeat כשאפשר, ולהגדיר שני ממשקי Heartbeat למניעת Split-Brain
- להימנע מעבודה על שני המכשירים בו-זמנית — תמיד לעבוד על ה-Primary; השינויים יסתנכרנו אוטומטית
- לפני שדרוג קושחה בקלאסטר, יש נוהל מיוחד (Upgrade the Secondary first) המתועד היטב ב-Cookbook, כדי למנוע Downtime
- לנטר Alert-ים על "HA out of sync" — סימן לבעיה בסנכרון שדורשת התייחסות מיידית

## קישורים חיצוניים

- 📘 תיעוד רשמי — HA (FGCP): https://docs.fortinet.com/document/fortigate/latest/administration-guide/954945/high-availability
- 📘 FortiGate Cookbook — HA examples: https://cookbook.fortinet.com/
- 🎥 YouTube חיפוש מומלץ: `FortiGate HA active passive configuration tutorial`
- 🎥 YouTube חיפוש מומלץ: `FortiGate HA failover test`

## טיפים וטריקים לראיונות ולעבודה בפועל

- שאלה נפוצה בראיונות: "מה קורה אם שני המכשירים חושבים ששניהם Primary?" — זהו מצב **Split-Brain**, שנמנע ע"י Heartbeat תקין ומספר נתיבי סנכרון
- לזכור: HA לא מגן על תקלות אפליקטיביות/לוגיות (למשל Policy שגוי) — שני המכשירים יסבלו מאותה בעיה כי הקונפיגורציה מסונכרנת!
- `diagnose sys ha status` הוא הכלי הראשון לבדיקה כשמשהו לא תקין בקלאסטר
