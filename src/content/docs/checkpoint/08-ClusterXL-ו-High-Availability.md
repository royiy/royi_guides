---
title: "ClusterXL ו-High Availability"
description: "Clustering ב-Check Point - HA מול Load Sharing, State Synchronization, הקמת Cluster ופקודות ניהול Failover."
category: Check Point
part: 8/10
---

## למה צריך Clustering?

בסביבת ייצור, Gateway בודד הוא **Single Point of Failure** - אם הוא נופל, כל הרשת מנותקת מהאינטרנט/פנימית. **ClusterXL** היא טכנולוגיית ה-Clustering הילידית (Native) של Check Point שמאפשרת להפעיל שני Gateways (או יותר) כיחידה אחת עם **Redundancy** ו/או **Load Sharing**.

## מצבי עבודה של ClusterXL

### 1. High Availability (HA) Mode
בכל רגע נתון **חבר אחד פעיל (Active)** והשני **Standby** (בהמתנה). אם ה-Active נופל, ה-Standby הופך ל-Active תוך שניות בודדות (Failover).

- **New Mode HA** - המצב המומלץ כיום, עם מנגנון Sync משופר.

### 2. Load Sharing Mode
שני החברים **פעילים בו-זמנית**, מחלקים ביניהם את העומס:

- **Multicast Mode** - חלוקת תעבורה מבוססת Multicast MAC.
- **Unicast Mode** - מתאים יותר לסביבות עם מגבלות Switch מסוימות.

לרוב, ארגונים בוחרים ב-**HA Mode** לפשטות ואמינות, ורק כשיש צורך אמיתי בביצועים גבוהים במיוחד עוברים ל-Load Sharing (או, בגרסאות מתקדמות יותר, פותרים את הביצועים עם **VSX** או **Maestro**).

## State Synchronization

כדי ש-Failover יהיה **שקוף** למשתמש (Session לא מתנתק), חייב להתבצע **Sync** בין החברים - כל חיבור פתוח (State Table) מסונכרן בזמן אמת בין ה-Members דרך ממשק ייעודי (**Sync Interface**), בד"כ רשת נפרדת ומהירה (Dedicated VLAN).

```bash
# בדיקת סטטוס Sync בין חברי הקלאסטר
cphaprob syncstat
```

## הגדרת ClusterXL - שלבים עיקריים

1. **חומרה/רשת זהה** - שני החברים חייבים להיות עם אותה כמות ממשקים, אותה גרסת Gaia, ורצוי אותה חומרה.
2. **הגדרת ממשק Sync ייעודי** - חייב להיות רשת נפרדת (VLAN/Subnet) המחברת בין החברים, ורצוי חיבור ישיר (Direct Cable / Dedicated Switch).
3. יצירת אובייקט **Cluster** ב-SmartConsole (במקום Gateway בודד), הוספת שני החברים כ-Cluster Members.
4. הגדרת **Virtual IP (VIP)** לכל ממשק (External, Internal) - זהו ה-IP שהרשת "רואה", לא ה-IP הפיזי של כל חבר.
5. הגדרת Topology, VPN Domain (אם רלוונטי) - זהים לשני החברים.

```
Cluster Object: FW-Cluster
  Member 1: FW-A (192.168.1.2)
  Member 2: FW-B (192.168.1.3)
  Virtual IP (Internal): 192.168.1.1
  Sync Network: 10.10.10.0/30 (Dedicated)
```

## פקודות ניהול וניטור Cluster חיוניות

```bash
# הצגת מצב הקלאסטר וה-Member הפעיל
cphaprob state

# הצגת רשימת בעיות/Interfaces שמנוטרים
cphaprob list

# ביצוע Failover ידני (למשל לצורך תחזוקה)
clusterXL_admin down
clusterXL_admin up

# בדיקת סנכרון State Table
cphaprob syncstat
```

## Failover - איך זה עובד בפועל

כל חבר בקלאסטר "שומר עין" על מצבו של החבר השני דרך **CCP (Cluster Control Protocol)** - Heartbeat תדיר. אם ה-Active מפסיק לשלוח Heartbeat (לדוגמה נפל, איבד חיבור רשת), ה-Standby מזהה זאת (בד"כ תוך פחות משנייה עד כמה שניות, תלוי בהגדרות) ומבצע Failover אוטומטי.

גורמים שיכולים לגרום ל-Failover:
- נפילת ממשק רשת (Link Down).
- שירות קריטי (Critical Device) שנכשל - למשל תהליך fwd קרס.
- ניתוק Sync שנמשך יותר מדי זמן.
- CPU/Memory קריטיים (בתלות בהגדרות מתקדמות).

## דוגמה מעשית: תרחיש תחזוקה מתוכננת

לפני עדכון תוכנה על Member פעיל, מומלץ לבצע Failover **מבוקר** ולא לתת לכשל "לקרות" בטבעיות:

```bash
# על ה-Member הפעיל שרוצים לעדכן:
clusterXL_admin down
# עכשיו החבר השני הופך ל-Active, אפשר לעדכן בבטחה את הראשון
# לאחר סיום העדכון:
clusterXL_admin up
```

## טיפים וטריקים

- **לעולם אל תשכחו** - ה-Sync Interface חייב להיות ברשת נפרדת לחלוטין (לא לשתף VLAN עם תעבורת Production) - אחרת עלולות להיווצר בעיות ביצועים וייצוב.
- Cluster לא מגן מפני תקלות תצורה (Misconfiguration) - אם שני החברים לא זהים ב-Rule Base/הגדרות, ה-Failover יגרום לבעיה במקום לפתור אותה.
- לפני עדכון גרסה, תמיד לעדכן **Standby קודם**, לוודא שהוא עולה תקין, ורק אז לבצע Failover ולעדכן את השני.
- שימוש ב-`cphaprob -a if` נותן פירוט מלא על מצב כל ממשק בקלאסטר - טוב לאבחון בעיות Interface ספציפיות.
- כשמעבירים מ-HA ל-Load Sharing (או להיפך), יש לתכנן חלון תחזוקה - זהו שינוי משמעותי שדורש בד"כ הפסקת שירות קצרה.

## שאלות נפוצות לראיון עבודה בנושא זה

<details class="qa">
<summary>1. מה ההבדל בין High Availability Mode ל-Load Sharing Mode ב-ClusterXL?</summary>

ב-High Availability חבר אחד פעיל (Active) והשני ממתין (Standby) ומקבל סנכרון — פשוט, צפוי, וכל התעבורה עוברת דרך חבר אחד. ב-Load Sharing כל החברים מעבדים תעבורה בו-זמנית (Multicast או Unicast), מה שמגדיל תפוקה אך מורכב יותר לאבחון ותלוי בתמיכת המתגים ובהתנהגות פרוטוקולים א-סימטריים.

</details>

<details class="qa">
<summary>2. מה תפקיד ה-Sync Interface ולמה הוא חייב להיות נפרד?</summary>

דרכו עוברת טבלת החיבורים והמצב בין חברי הקלאסטר, כך שב-Failover החיבורים הקיימים ממשיכים לחיות. הוא חייב להיות ייעודי (ורצוי מחובר ישירות או ברשת נפרדת) כי הוא רגיש להשהיה ולאובדן — עומס על רשת משותפת עלול לגרום לסנכרון חלקי, ובמקרה הגרוע לשני חברים שמכריזים על עצמם כ-Active.

</details>

<details class="qa">
<summary>3. מה קורה בפועל בתהליך Failover, ומה יכול לגרום לו?</summary>

החבר הפעיל מפסיק להכריז על עצמו תקין (CCP), החבר השני עובר ל-Active, משתלט על ה-Virtual IP ושולח Gratuitous ARP כדי שהמתגים יפנו אליו — והחיבורים ממשיכים בזכות הסנכרון. גורמים אפשריים: נפילת ממשק או קו, כשל חומרה, תקלה ב-CCP, כישלון של תהליך קריטי (`cphaprob list`), עומס חריג או פעולה יזומה (`clusterXL_admin down`).

</details>

<details class="qa">
<summary>4. איך הייתם מבצעים תחזוקה (עדכון תוכנה) על קלאסטר מבלי לגרום להשבתה?</summary>

עובדים חבר-אחר-חבר: מורידים את חבר ה-Standby (`clusterXL_admin down`), מעדכנים אותו, מוודאים תקינות (`cphaprob stat`, בדיקת ממשקים ורישיונות), מחזירים אותו (`clusterXL_admin up`), מבצעים Failover מבוקר אליו, ורק אז מעדכנים את החבר השני. חשוב לוודא תאימות גרסאות בין החברים במהלך התהליך ולעבוד בחלון תחזוקה מוגדר.

</details>

<details class="qa">
<summary>5. מה זה CCP (Cluster Control Protocol)?</summary>

הפרוטוקול הפנימי שבו חברי הקלאסטר מחליפים ביניהם heartbeats ומידע מצב — כך כל חבר יודע אם האחרים חיים ומי אמור להיות Active. הוא עובר ברשת ה-Sync (ולעיתים גם בממשקים אחרים), ויכול לעבוד ב-Multicast או ב-Broadcast; בעיות במתג שחוסם את התעבורה הזו הן סיבה קלאסית ל-split-brain.

</details>

<details class="qa">
<summary>6. איזו פקודה תשתמשו כדי לבדוק את מצב הקלאסטר וחבריו?</summary>

`cphaprob stat` (או `cphaprob state`) להצגת מצב החברים — מי Active ומי Standby. בנוסף: `cphaprob -a if` למצב הממשקים המנוטרים, `cphaprob list` לתהליכים קריטיים שעלולים לגרום ל-Failover, ו-`cphaprob syncstat` לסטטיסטיקות הסנכרון.

</details>

<details class="qa">
<summary>7. מה ההבדל בין ClusterXL רגיל לפתרון כמו VSX או Maestro (ברמה גבוהה)?</summary>

ClusterXL מספק זמינות בין שני גייטוויים פיזיים. VSX הוא וירטואליזציה של גייטוויים — הרצת עשרות Virtual Systems עצמאיים על אותה חומרה, כל אחד עם מדיניות וטבלאות משלו. Maestro הוא Hyperscale: איחוד של הרבה גייטוויים ל"מכונה" לוגית אחת עם חלוקת עומסים דינמית והרחבה אופקית לפי הצורך.

</details>

## קישורים חיצוניים

- ClusterXL Admin Guide (רשמי): https://sc1.checkpoint.com/documents/
- מאמרי SK על High Availability ו-Troubleshooting Cluster: https://support.checkpoint.com/
- CheckMates - דיוני ClusterXL: https://community.checkpoint.com/
- הדרכת ClusterXL ביוטיוב: https://www.youtube.com/playlist?list=PL4Jm1LJEII4b-aoZQ5SltYgzRMPkRPn1u
- חיפוש נוסף ביוטיוב: https://www.youtube.com/results?search_query=Check+Point+ClusterXL+High+Availability+tutorial
