---
title: "יסודות Routing וטבלאות ניתוב"
category: Networking
part: 3/10
---

## מה זה Routing?

Routing (ניתוב) הוא התהליך שבו **Router** מחליט לאן להעביר חבילת מידע (Packet) כדי שתגיע ליעדה, כאשר היעד נמצא ברשת שונה מזו שממנה נשלחה החבילה. Routing מתבצע ב-**Layer 3** של מודל ה-OSI, ומתבסס על כתובות ה-IP של המקור והיעד.

בניגוד ל-Switch שמעביר מידע בתוך אותה רשת מקומית (LAN) על בסיס כתובות MAC, Router מקשר בין רשתות שונות (למשל בין הרשת המקומית שלכם לאינטרנט, או בין שני Datacenter-ים) ומקבל החלטות ניתוב על סמך **Routing Table** - טבלה המתעדכנת באופן סטטי או דינמי.

### עקרונות מפתח

- **Default Gateway** — כתובת ה-IP של ה-Router שאליו נשלחת כל תעבורה שיעדה אינו ברשת המקומית.
- **Next Hop** — כתובת ה-Router הבא בדרך אל היעד הסופי.
- **Metric** — ערך מספרי המייצג את ה"עלות" של מסלול מסוים; מסלול עם Metric נמוך יותר מועדף.
- **Administrative Distance (AD)** — ערך המדרג את מהימנות מקור המידע (Static, OSPF, BGP וכו') כאשר יש כמה מקורות למידע לאותו יעד.

## כיצד עובדת טבלת הניתוב (Routing Table)

כאשר Router (או מחשב) מקבל חבילה, הוא בודק את כתובת היעד מול טבלת הניתוב שלו ומחפש את ההתאמה **הספציפית ביותר (Longest Prefix Match)**:

```
+-------------------+
|   Routing Table    |
+-------------------+---------------+-----------+--------+
| Destination        | Next Hop      | Interface | Metric|
+---------------------+---------------+-----------+-------+
| 192.168.1.0/24      | Connected     | eth0      | 0     |
| 10.0.0.0/8           | 192.168.1.254 | eth0      | 1     |
| 172.16.0.0/16        | 192.168.1.1   | eth0      | 2     |
| 0.0.0.0/0 (Default)  | 192.168.1.254 | eth0      | 10    |
+---------------------+---------------+-----------+-------+
```

**Longest Prefix Match:** אם חבילה מיועדת ל-`10.5.5.5` וקיימים שני רשומות `10.0.0.0/8` ו-`10.5.0.0/16`, ה-Router יבחר תמיד ב-`10.5.0.0/16` כי היא ההתאמה הספציפית יותר (Prefix ארוך יותר).

## Static Routing לעומת Dynamic Routing

| היבט | Static Routing | Dynamic Routing |
|---|---|---|
| הגדרה | ידנית על ידי מנהל הרשת | אוטומטית, דרך פרוטוקול ניתוב |
| התאמה לשינויים | לא מתעדכן אוטומטית בכשל קו | מתעדכן אוטומטית (Convergence) |
| עומס על המעבד | נמוך מאוד | גבוה יותר (חישובים, עדכונים) |
| התאמה לגודל רשת | טוב לרשתות קטנות/יציבות | הכרחי לרשתות גדולות/משתנות |
| דוגמאות | `ip route add ...` | OSPF, BGP, EIGRP, RIP |

### דוגמת Static Route

```bash
# לינוקס - הוספת Static Route ידני
sudo ip route add 172.16.0.0/16 via 192.168.1.1 dev eth0

# הצגת טבלת הניתוב
ip route show

# Windows
route add 172.16.0.0 mask 255.255.0.0 192.168.1.1
route print
```

פלט לדוגמה מ-`ip route show` בלינוקס:

```
default via 192.168.1.254 dev eth0 proto static
10.0.0.0/8 via 192.168.1.254 dev eth0
172.16.0.0/16 via 192.168.1.1 dev eth0
192.168.1.0/24 dev eth0 proto kernel scope link src 192.168.1.10
```

## Administrative Distance - סדר עדיפויות בין מקורות מידע

כאשר Router לומד על אותו יעד ממספר מקורות (למשל גם Static וגם OSPF), הוא בוחר לפי **Administrative Distance** הנמוך ביותר:

| מקור המידע | Administrative Distance (ברירת מחדל, Cisco) |
|---|---|
| Directly Connected | 0 |
| Static Route | 1 |
| eBGP | 20 |
| OSPF | 110 |
| RIP | 120 |
| iBGP | 200 |

## פרוטוקולי Routing דינמיים - מבוא

### OSPF (Open Shortest Path First)

פרוטוקול **Link-State** נפוץ מאוד ברשתות ארגוניות פנימיות (Interior Gateway Protocol). כל Router בונה מפה מלאה (Topology Database) של הרשת ומחשב את המסלול הקצר ביותר באמצעות אלגוריתם Dijkstra. תומך ב-**Areas** לחלוקה היררכית ולצמצום עומס עדכונים.

מאפייני מפתח:
- מתכנס (Converges) במהירות יחסית לאחר שינוי טופולוגי.
- שולח עדכונים (LSA - Link State Advertisements) רק כאשר יש שינוי, לא בפרקי זמן קבועים.
- ה-Metric מבוסס על **Cost** (בדרך כלל תלוי ברוחב הפס של הקישור).

### BGP (Border Gateway Protocol)

פרוטוקול **Path-Vector**, ה"פרוטוקול של האינטרנט" בפועל - משמש לניתוב **בין** ארגונים/Autonomous Systems (Exterior Gateway Protocol), כמו בין ספקיות אינטרנט שונות. BGP הוא הפרוטוקול שמחזיק את כל האינטרנט הגלובלי מחובר.

מאפייני מפתח:
- כל רשת מזוהה במספר **AS (Autonomous System Number)** ייחודי.
- מקבל החלטות ניתוב מבוססות מדיניות (Policy-based) ולא רק על מסלול הקצר ביותר - למשל שיקולי עלות, הסכמי Peering.
- משמש גם בענן (למשל AWS Direct Connect, Azure ExpressRoute משתמשים ב-BGP).

### השוואה מהירה

| | OSPF | BGP |
|---|---|---|
| שימוש | פנים-ארגוני (IGP) | בין ארגונים (EGP) |
| סוג אלגוריתם | Link-State | Path-Vector |
| קנה מידה | רשת ארגונית/Datacenter | האינטרנט הגלובלי |
| בחירת מסלול | מסלול קצר ביותר (Cost) | מדיניות (Policy) |

## פקודות אבחון שימושיות

```bash
# הצגת טבלת הניתוב המלאה
ip route show table all      # לינוקס
netstat -rn                  # לינוקס/macOS
route print                  # Windows

# מעקב מסלול בפועל (Layer 3 hop-by-hop)
traceroute -n 8.8.8.8         # לינוקס
tracert 8.8.8.8               # Windows

# בדיקת קיום מסלול ספציפי (לינוקס - עם ip route get)
ip route get 8.8.8.8
```

פלט לדוגמה מ-`ip route get`:

```
8.8.8.8 via 192.168.1.254 dev eth0 src 192.168.1.10 uid 1000
```

## טיפים וטריקים

1. **Longest Prefix Match תמיד מנצח** — גם אם יש Default Route (`0.0.0.0/0`), אם קיימת רשומה ספציפית יותר היא תבחר תמיד.
2. **בדקו Administrative Distance כשיש מספר מקורות מידע** — זו שאלה קלאסית בראיונות: "יש לך גם Static Route וגם OSPF לאותו יעד - איזה ינצח?" (תשובה: Static, כי AD=1 נמוך יותר מ-OSPF שהוא 110).
3. **Static Routing מתאים ל-Backup/Default routes**, ו-Dynamic מתאים לרשתות גדולות ומשתנות - שילוב נפוץ הוא Dynamic כברירת מחדל עם Static כ-Fallback.
4. **בענן, "Route Table" הוא מושג מרכזי** — ב-AWS VPC לדוגמה, כל Subnet משויך ל-Route Table שמגדיר את הניתוב שלו (כולל מסלול ל-Internet Gateway, NAT Gateway, VPC Peering).

## שאלות נפוצות לתרגול עצמי

- מה ההבדל בין Static Routing ל-Dynamic Routing, ומתי הייתם בוחרים בכל אחד מהם?
- מה זה Administrative Distance ולמה הוא חשוב כשיש כמה מקורות מידע לניתוב?
- הסבירו את עקרון ה-Longest Prefix Match עם דוגמה מספרית.
- מה ההבדל העקרוני בין OSPF ל-BGP, ומתי משתמשים בכל אחד?
- מה זה Default Gateway ולמה כל מכשיר ברשת חייב אחד?

## קישורים חיצוניים

**תיעוד רשמי:**
- Cisco Networking Academy - Routing Concepts: https://www.netacad.com/courses/networking
- IETF RFC 2328 - OSPF Version 2: https://datatracker.ietf.org/doc/html/rfc2328
- IETF RFC 4271 - Border Gateway Protocol 4 (BGP-4): https://datatracker.ietf.org/doc/html/rfc4271

**סרטוני YouTube מומלצים:**
- NetworkChuck - Routing Explained: https://www.youtube.com/watch?v=Yjkq6z14Zq4
- PowerCert Animated Videos - How Routing Works: https://www.youtube.com/watch?v=DYNfmSy1oNU
- Practical Networking - OSPF Explained: https://www.youtube.com/watch?v=1v0T8lWQizA

---
⬅️ המדריך הבא: [04-dns.md](/networking/04-dns/) — DNS, ארכיטקטורה וסוגי רשומות
