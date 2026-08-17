---
title: "Load Balancing - שיטות, L4/L7 ו-Health Checks"
category: Networking
part: 8/10
---

## מה זה Load Balancing?

Load Balancer (מאזן עומסים) הוא מכשיר או שירות המפזר תעבורת רשת נכנסת בין מספר שרתים (Backend Servers), במקום שכל התעבורה תגיע לשרת יחיד. מטרותיו העיקריות: **זמינות גבוהה (High Availability)** - אם שרת אחד נופל, התעבורה מנותבת אוטומטית לשרתים התקינים; **ביצועים** - פיזור עומס מונע מצב שבו שרת אחד עמוס בעוד אחרים פנויים; ו**סקיילביליות** - הוספת שרתים נוספים לפי הצורך (Horizontal Scaling).

Load Balancer יכול לפעול ב-**Layer 4** (בדיקת IP/Port בלבד, ללא הבנת תוכן) או ב-**Layer 7** (הבנת תוכן הבקשה - HTTP Headers, URL, Cookies), כאשר כל רמה מתאימה לצרכים שונים.

### עקרונות מפתח

- **Backend Pool (Server Pool/Target Group)** — קבוצת השרתים שביניהם מתפזרת התעבורה.
- **Health Check** — בדיקה תקופתית של תקינות כל שרת בפול, להוצאת שרתים כושלים מהרוטציה אוטומטית.
- **Session Persistence (Sticky Sessions)** — הבטחה שבקשות מאותו לקוח יגיעו תמיד לאותו שרת (חשוב לאפליקציות Stateful).
- **VIP (Virtual IP)** — כתובת IP וירטואלית יחידה שהלקוחות פונים אליה, מאחוריה מוסתר כל ה-Backend Pool.

## L4 Load Balancing לעומת L7 Load Balancing

```
L4 Load Balancer (Transport Layer):

  Client ---> VIP:443 ---> [בודק רק IP+Port] ---> Backend Server (בחירה לפי אלגוריתם)
              (לא רואה HTTP Headers, URL, Cookies - מהיר מאוד)


L7 Load Balancer (Application Layer):

  Client ---> VIP:443 ---> [בודק URL/Header/Cookie] ---> החלטת ניתוב חכמה:
                                                            /api/*    --> API Servers
                                                            /images/* --> CDN/Static Servers
                                                            /admin/*  --> Admin Servers
```

| היבט | L4 Load Balancer | L7 Load Balancer |
|---|---|---|
| שכבת OSI | Transport (4) | Application (7) |
| מהירות | מהיר יותר (פחות עיבוד) | איטי יותר יחסית (מפענח תוכן) |
| חכמה בניתוב | לפי IP/Port בלבד | לפי URL, Headers, Cookies, Content Type |
| SSL Termination | לרוב לא (מעביר SSL כמו שהוא - Pass-through) | כן - יכול לפענח ולבדוק תוכן ה-HTTPS |
| דוגמאות | AWS Network Load Balancer (NLB), HAProxy (TCP mode) | AWS Application Load Balancer (ALB), NGINX, HAProxy (HTTP mode) |
| שימוש טיפוסי | Gaming servers, Database, high-throughput TCP | Web Applications, Microservices, API Gateway |

## שיטות חלוקת עומס (Load Balancing Algorithms)

| שיטה | תיאור | מתי מתאים |
|---|---|---|
| **Round Robin** | כל בקשה עוברת לשרת הבא ברשימה, במחזוריות | שרתים זהים בעוצמת חישוב |
| **Weighted Round Robin** | כמו Round Robin, אך עם משקל שונה לכל שרת | שרתים עם עוצמות חומרה שונות |
| **Least Connections** | הבקשה עוברת לשרת עם הכי מעט חיבורים פעילים כרגע | חיבורים ארוכי טווח (WebSocket, Streaming) |
| **Least Response Time** | משלב מספר חיבורים פעילים וזמן תגובה ממוצע | אפליקציות רגישות לביצועים |
| **IP Hash** | חישוב Hash על IP הלקוח, קובע לאיזה שרת תמיד לפנות | Session Persistence בסיסי ללא Cookies |
| **Random** | בחירה אקראית של שרת מהפול | פשוט, יעיל בממוצע לעומסים אחידים |

### דוגמת Round Robin בפועל

```
בקשה 1 --> Server A
בקשה 2 --> Server B
בקשה 3 --> Server C
בקשה 4 --> Server A   (חזרה להתחלה)
בקשה 5 --> Server B
```

### דוגמת Least Connections בפועל

```
מצב נוכחי:  Server A: 15 חיבורים פעילים
            Server B: 8 חיבורים פעילים
            Server C: 22 חיבורים פעילים

בקשה חדשה --> Server B (הכי פחות עמוס כרגע)
```

## Health Checks - שמירה על זמינות

Health Check הוא מנגנון שבו ה-Load Balancer שולח בקשות תקופתיות (בד"כ כל כמה שניות) לכל שרת בפול, כדי לוודא שהוא תקין ומגיב. שרת שנכשל במספר בדיקות רצופות (Unhealthy Threshold) מוצא אוטומטית מהרוטציה, עד שיחזור להשיב תקין.

```
Load Balancer                          Backend Servers
     |                                       |
     |--- GET /health ---------------------->| Server A: 200 OK   --> Healthy
     |--- GET /health ---------------------->| Server B: 200 OK   --> Healthy
     |--- GET /health ---------------------->| Server C: Timeout  --> Unhealthy!
     |                                       |
     v
   Server C מוצא זמנית מהפול, כל התעבורה
   מנותבת רק ל-A ו-B עד שC יחזור להיות תקין
```

דוגמת הגדרת Health Check ב-NGINX (upstream) עם `nginx_upstream_check_module`, ובאופן כללי ברוב ה-Load Balancers:

```nginx
upstream backend_pool {
    server 10.0.1.10:8080 weight=3;
    server 10.0.1.11:8080 weight=1;
    server 10.0.1.12:8080 backup;
}

server {
    listen 443 ssl;
    location / {
        proxy_pass http://backend_pool;
    }
}
```

פרמטרים טיפוסיים ב-Health Check (למשל ב-AWS ALB Target Group):

| פרמטר | ערך לדוגמה | תיאור |
|---|---|---|
| Path | `/health` | הנתיב שנבדק |
| Interval | 30 שניות | תדירות הבדיקה |
| Timeout | 5 שניות | כמה זמן לחכות לתגובה |
| Healthy Threshold | 2 | כמה בדיקות מוצלחות רצופות עד שהשרת מוגדר תקין |
| Unhealthy Threshold | 3 | כמה כשלונות רצופים עד שהשרת מוצא מהרוטציה |

## SSL Termination

Load Balancer ברמת L7 יכול לבצע **SSL/TLS Termination** - לפענח את תעבורת ה-HTTPS מהלקוח, ולתקשר עם השרתים הפנימיים ב-HTTP רגיל (או ב-HTTPS נפרד). זה מקל על ניהול תעודות SSL (מרוכז במקום אחד) ומפחית עומס חישובי הצפנה מהשרתים.

```
Client <--HTTPS (encrypted)--> Load Balancer <--HTTP (plain)--> Backend Servers
                                    |
                             (מחזיק את תעודת ה-SSL)
```

## פקודות ובדיקות שימושיות

```bash
# בדיקת זמינות שרת בודד
curl -I https://backend-server/health

# בדיקת מספר תגובות ה-DNS Round Robin (אם רלוונטי)
dig +short myapp.example.com

# בדיקת status של upstream ב-HAProxy
echo "show stat" | socat stdio /var/run/haproxy.sock

# בדיקת NGINX status (אם מוגדר stub_status)
curl http://localhost/nginx_status
```

## טיפים וטריקים

1. **בחרו L4 לביצועים מקסימליים, L7 לחכמה בניתוב** — L4 מתאים כאשר צריך throughput מקסימלי, L7 כאשר צריך ניתוב לפי תוכן (Path-based/Host-based routing).
2. **תמיד הגדירו Health Check אמיתי, לא רק TCP Ping** — בדיקת endpoint ייעודי (`/health`) שבודק גם את מצב האפליקציה (חיבור ל-DB וכו') עדיפה על בדיקת חיבור TCP גרידא.
3. **היזהרו מ-Sticky Sessions בסקיילביליות** — Session Persistence מקל על אפליקציות Stateful, אך פוגע בחלוקת עומס אחידה; העדיפו אפליקציות Stateless עם Session Storage חיצוני (Redis) כשאפשר.
4. **תכננו Capacity ל-N+1 לפחות** — ודאו שהפול יכול לספוג עומס גם כאשר שרת אחד (או יותר) נופל, לא רק בתפוסה מלאה.
5. **בענן, השתמשו ב-Managed Load Balancer** — AWS ALB/NLB, Azure Load Balancer, GCP Cloud Load Balancing מספקים High Availability מובנה ופחות תחזוקה מ-Load Balancer עצמאי.

## שאלות נפוצות לתרגול עצמי

- מה ההבדל בין Load Balancer מסוג L4 ל-L7?
- מה ההבדל בין Round Robin ל-Least Connections, ומתי כל אחד עדיף?
- מה זה Health Check, ואיזה פרמטרים חשוב להגדיר בו?
- מהו SSL Termination ולמה הוא שימושי?
- מה הסיכון בשימוש ב-Sticky Sessions מבחינת חלוקת עומס?

## קישורים חיצוניים

**תיעוד רשמי:**
- Cloudflare Learning Center - What Is Load Balancing: https://www.cloudflare.com/learning/performance/what-is-load-balancing/
- AWS Elastic Load Balancing Documentation: https://docs.aws.amazon.com/elasticloadbalancing/
- NGINX Load Balancing Documentation: https://nginx.org/en/docs/http/load_balancing.html

**סרטוני YouTube מומלצים:**
- NetworkChuck - Load Balancers Explained: https://www.youtube.com/watch?v=UEqfxaYUCzY
- PowerCert Animated Videos - Load Balancer Explained: https://www.youtube.com/watch?v=sCR3AAgtqQE
- Practical Networking - L4 vs L7 Load Balancing: https://www.youtube.com/watch?v=xFDp0dTydag

---
⬅️ המדריך הבא: [09-vpn-encryption-basics.md](/networking/09-vpn-encryption-basics/) — VPN, IPSec, TLS/SSL והצפנה בסיסית
