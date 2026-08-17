---
title: ניהול שרתים, Docker Swarm ופרודקשן
category: DevOps/Docker
part: 9/10
---

## מ-Compose לניהול Cluster אמיתי

`docker compose` מצוין למארח (host) יחיד, אבל בפרודקשן אמיתי לרוב צריך:
- ריצה על **כמה שרתים** (high availability)
- **Self-healing** - הפעלה מחדש אוטומטית של קונטיינרים שנפלו, גם על שרת אחר
- **Rolling updates** - עדכון גרסה בלי downtime
- **Load balancing** אוטומטי בין מופעים

לשם כך יש שני כלים עיקריים: **Docker Swarm** (מובנה, פשוט יותר) ו-**Kubernetes** (הסטנדרט התעשייתי, מורכב ועוצמתי יותר).

## Docker Swarm - אורקסטרציה מובנית

Swarm מגיע מובנה בכל התקנת Docker - לא צריך להתקין כלום נוסף.

### הקמת Swarm

```bash
# בשרת הראשי (Manager)
docker swarm init --advertise-addr <MANAGER-IP>
```

הפקודה מחזירה טוקן הצטרפות עבור Workers:
```bash
docker swarm join --token SWMTKN-1-xxxx <MANAGER-IP>:2377
```

מריצים את הפקודה הזו בכל שרת נוסף שרוצים לצרף כ-Worker.

### בדיקת מצב ה-Cluster

```bash
docker node ls
```

```
ID              HOSTNAME     STATUS    AVAILABILITY   MANAGER STATUS
xxxxx *         manager-1    Ready     Active         Leader
yyyyy           worker-1     Ready     Active
zzzzz           worker-2     Ready     Active
```

### Manager מול Worker

- **Manager** - מנהל את מצב ה-cluster, מקבל פקודות, מחליט איפה להריץ services. אפשר גם שירותים "רגילים" עליו.
- **Worker** - רק מריץ containers לפי הוראות ה-Manager.

**מומלץ לפרודקשן:** לפחות 3 managers (למספר אי-זוגי, בגלל אלגוריתם Raft consensus) כדי לשרוד נפילה של manager אחד.

### פריסת שירות (Service)

```bash
docker service create \
  --name web \
  --replicas 3 \
  --publish 80:80 \
  nginx
```

זה יוצר 3 מופעים (replicas) של nginx, מפוזרים אוטומטית בין השרתים ב-cluster, עם load balancing מובנה.

### ניהול Services

```bash
# רשימת services
docker service ls

# פרטי משימות (tasks) של service
docker service ps web

# שינוי מספר replicas
docker service scale web=5

# עדכון image (rolling update)
docker service update --image nginx:1.25 web

# עדכון עם שליטה על הקצב
docker service update \
  --image nginx:1.25 \
  --update-parallelism 1 \
  --update-delay 30s \
  web

# rollback אם משהו השתבש
docker service rollback web

# מחיקת service
docker service rm web
```

### Docker Stack - פריסת Compose ל-Swarm

אפשר להשתמש באותו syntax של `docker-compose.yml` (עם הרחבות) כדי לפרוס ל-Swarm:

```yaml
services:
  web:
    image: myapp:1.0
    ports:
      - "80:80"
    deploy:
      replicas: 3
      update_config:
        parallelism: 1
        delay: 10s
      restart_policy:
        condition: on-failure
      resources:
        limits:
          cpus: "0.5"
          memory: 256M
    networks:
      - app-net

networks:
  app-net:
    driver: overlay

volumes:
  app-data:
```

```bash
docker stack deploy -c docker-compose.yml myapp
docker stack services myapp
docker stack ps myapp
docker stack rm myapp
```

### Docker Secrets ב-Swarm

דרך מאובטחת לניהול סודות ב-cluster (מוצפן ב-Raft log, לא נשמר בדיסק בטקסט גלוי):

```bash
echo "my-secret-password" | docker secret create db_password -

docker service create \
  --name db \
  --secret db_password \
  postgres:16
```

הסוד יהיה זמין בתוך הקונטיינר בנתיב `/run/secrets/db_password`.

## Health Checks בפרודקשן

```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost/health || exit 1
```

- `--start-period` - זמן חסד בתחילת ריצה (לא נספר ככישלון בזמן warm-up)
- אם בדיקת הבריאות נכשלת מספיק פעמים, Swarm יחליף את הקונטיינר אוטומטית.

## מוניטורינג וניהול לוגים בסביבת שרתים

### פתרונות נפוצים למוניטורינג:
- **cAdvisor + Prometheus + Grafana** - מוניטורינג משאבים (CPU, זיכרון, רשת) לכל קונטיינר
- **Portainer** - ממשק גרפי לניהול Docker/Swarm

```bash
docker run -d -p 9000:9000 \
  --name portainer \
  --restart always \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v portainer_data:/data \
  portainer/portainer-ce:latest
```

### ריכוז לוגים (Centralized Logging)

בברירת מחדל, לוגים נשארים לוקאלית בכל שרת. בפרודקשן רוצים log driver שמעביר אותם למקום מרכזי:

```json
{
  "log-driver": "syslog",
  "log-opts": {
    "syslog-address": "udp://logs.example.com:514"
  }
}
```

או שילוב עם Fluentd, Loki, או ELK Stack (Elasticsearch, Logstash, Kibana).

## אסטרטגיית עדכון בלי Downtime (Blue-Green / Rolling)

**Rolling Update (מובנה ב-Swarm):**
```bash
docker service update \
  --image myapp:v2 \
  --update-parallelism 1 \
  --update-delay 15s \
  --update-failure-action rollback \
  myapp
```
מעדכן קונטיינר אחד בכל פעם, ממתין, ומבצע rollback אוטומטי אם יש כשל.

**Blue-Green (עם Load Balancer חיצוני, למשל Nginx/Traefik):**
1. מריצים גרסה חדשה ("Green") לצד הישנה ("Blue") - שתיהן חיות במקביל.
2. בודקים שה-Green תקינה.
3. מעבירים את ה-Load Balancer להצביע על Green.
4. מסירים את Blue רק אחרי שהכל תקין.

## Reverse Proxy ל-Production - Traefik / Nginx

שימוש נפוץ מאוד: reverse proxy אחד שמנתב תעבורה לקונטיינרים שונים לפי דומיין, ומטפל אוטומטית ב-SSL (Let's Encrypt):

```yaml
services:
  traefik:
    image: traefik:v3.0
    command:
      - "--providers.docker=true"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.le.acme.httpchallenge=true"
      - "--certificatesresolvers.le.acme.email=admin@example.com"
      - "--certificatesresolvers.le.acme.storage=/letsencrypt/acme.json"
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - letsencrypt:/letsencrypt

  app:
    image: myapp:1.0
    labels:
      - "traefik.http.routers.app.rule=Host(`app.example.com`)"
      - "traefik.http.routers.app.tls.certresolver=le"

volumes:
  letsencrypt:
```

## Checklist לפריסת פרודקשן

- [ ] `restart: unless-stopped` או `always` לכל שירות קריטי
- [ ] Health checks מוגדרים לכל שירות
- [ ] Resource limits (`cpus`, `memory`) כדי למנוע שירות אחד "לבלוע" את כל השרת
- [ ] גיבויים אוטומטיים ל-Volumes של דאטהבייסים
- [ ] Log rotation מוגדר (`max-size`, `max-file`)
- [ ] Reverse proxy + SSL/TLS
- [ ] מוניטורינג פעיל (Prometheus/Grafana או שווה ערך)
- [ ] תוכנית rollback ברורה
- [ ] אין שימוש ב-`latest` tag ב-images

## קישורים חיצוניים

**וידאו:**
- [Docker Swarm Tutorial](https://www.youtube.com/watch?v=x843GyFRIIY)
- [Docker Swarm vs Kubernetes](https://www.youtube.com/watch?v=wPjyN2vBjLU)
- [Traefik with Docker Tutorial](https://www.youtube.com/watch?v=liV3ejH59o4)

**דוקומנטציה רשמית:**
- [Swarm Mode Overview](https://docs.docker.com/engine/swarm/)
- [Deploy a Stack to Swarm](https://docs.docker.com/engine/swarm/stack-deploy/)
- [Docker Secrets](https://docs.docker.com/engine/swarm/secrets/)
- [Rolling Updates](https://docs.docker.com/engine/swarm/swarm-tutorial/rolling-update/)

## טיפים וטריקים

- Swarm מצוין ל-clusters קטנים-בינוניים; אם ה-cluster גדול ומורכב (ecosystem עשיר, autoscaling מתקדם), שווה לשקול מעבר ל-Kubernetes.
- תמיד השתמשו במספר אי-זוגי של managers (1, 3, 5) - אלגוריתם ה-consensus (Raft) דורש רוב (majority) כדי לתפקד.
- `docker service logs <service>` נותן לוגים מרוכזים מכל ה-replicas של service, גם אם הם על שרתים שונים.
- לפני rolling update בפרודקשן, תמיד בדקו שה-image עובד עם `docker run` פשוט קודם - Swarm לא "בודק" שה-image תקין מראש.

## שאלות ראיון נפוצות בנושא

1. **מה ההבדל בין Docker Compose ל-Docker Swarm?**
   Compose מנהל אפליקציות multi-container על מארח יחיד; Swarm הוא orchestrator אמיתי לניהול cluster רב-מארחי עם self-healing, scaling, ו-rolling updates.

2. **למה כדאי מספר אי-זוגי של Manager nodes ב-Swarm?**
   כי Swarm משתמש באלגוריתם Raft consensus שדורש רוב (majority) כדי לקבל החלטות; מספר אי-זוגי (1, 3, 5) מונע מצב "תיקו" ומאפשר לסבול נפילה של עד (n-1)/2 managers מבלי לאבד quorum.

3. **מה ההבדל בין Docker Swarm ל-Kubernetes?**
   Swarm מובנה ב-Docker, פשוט יותר להקמה ותפעול, אבל בעל אקוסיסטם מצומצם יותר. Kubernetes מורכב יותר להקמה אבל עוצמתי, גמיש, ובעל תמיכה תעשייתית רחבה - הוא הסטנדרט המקובל היום לרוב סביבות הפרודקשן בקנה מידה גדול.

4. **איך Rolling Update עובד ולמה זה חשוב?**
   מעדכן קונטיינרים אחד (או כמה) בכל פעם במקום את כולם בבת אחת, כך שהשירות ממשיך לענות לבקשות תוך כדי העדכון - אין downtime. אם משהו נכשל, אפשר rollback אוטומטי.

5. **איך מנהלים סודות (secrets) ב-Swarm בצורה מאובטחת?**
   באמצעות `docker secret create` - הסוד מוצפן ונשמר ב-Raft log של ה-cluster, ומועבר לקונטיינרים דרך mount זמני ב-`/run/secrets/`, לא כמשתנה סביבה גלוי.

---

**בחלק הקודם:** [Docker Compose](/devops/docker/08-docker-compose/) | **בחלק הבא:** [שאלות ראיון עבודה, טיפים וטריקים מרוכזים](/devops/docker/10-שאלות-ראיון-וטיפים/)
