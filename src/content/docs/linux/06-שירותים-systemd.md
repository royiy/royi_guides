# מדריך 6: ניהול שירותים עם systemd

## מבוא
`systemd` הוא מערכת ה-init ומנהל השירותים בכל הפצות הלינוקס המודרניות (Ubuntu, CentOS/RHEL, Debian, Fedora). הוא אחראי על הפעלת שירותים בעת אתחול, ניהול תלויות ביניהם, וניטור מצבם.

---

## 1. פקודות בסיסיות עם systemctl

```bash
# הפעלת שירות
sudo systemctl start nginx

# עצירת שירות
sudo systemctl stop nginx

# הפעלה מחדש
sudo systemctl restart nginx

# רענון קונפיגורציה בלי לעצור את השירות (אם נתמך)
sudo systemctl reload nginx

# בדיקת סטטוס שירות
systemctl status nginx

# הפעלה אוטומטית באתחול המערכת
sudo systemctl enable nginx

# ביטול הפעלה אוטומטית
sudo systemctl disable nginx

# הפעלה + enable בפעולה אחת
sudo systemctl enable --now nginx
```

---

## 2. בדיקת סטטוס ומידע

```bash
# רשימת כל השירותים הפעילים
systemctl list-units --type=service

# רשימת שירותים שנכשלו
systemctl --failed

# בדיקה האם שירות מופעל אוטומטית באתחול
systemctl is-enabled nginx

# בדיקה האם שירות פעיל כרגע
systemctl is-active nginx

# צפייה בכל התלויות של שירות
systemctl list-dependencies nginx
```

---

## 3. לוגים עם journalctl

```bash
# צפייה בלוגים של שירות ספציפי
journalctl -u nginx

# מעקב חי אחרי לוגים (כמו tail -f)
journalctl -u nginx -f

# לוגים מה-boot הנוכחי בלבד
journalctl -b

# לוגים מ-24 השעות האחרונות
journalctl --since "24 hours ago"

# לוגים בטווח זמן מדויק
journalctl --since "2026-01-01" --until "2026-01-02"

# הגבלת מספר שורות (כמו tail)
journalctl -u nginx -n 50

# רק שגיאות (priority: err ומעלה)
journalctl -p err

# ניקוי לוגים ישנים (שמירת 2 שבועות אחרונים בלבד)
sudo journalctl --vacuum-time=2weeks
```

---

## 4. יצירת שירות systemd משלכם

יצירת קובץ unit חדש ב-`/etc/systemd/system/myapp.service`:

```ini
[Unit]
Description=My Custom Application
After=network.target

[Service]
Type=simple
User=myuser
WorkingDirectory=/opt/myapp
ExecStart=/usr/bin/python3 /opt/myapp/app.py
Restart=on-failure
RestartSec=5
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

לאחר יצירת הקובץ:
```bash
# טעינה מחדש של הגדרות systemd
sudo systemctl daemon-reload

# הפעלה
sudo systemctl start myapp

# הפעלה אוטומטית באתחול
sudo systemctl enable myapp

# בדיקת סטטוס
systemctl status myapp
```

### הסבר שדות מרכזיים
| שדה | תיאור |
|---|---|
| `Type` | `simple` (ברירת מחדל), `forking`, `oneshot`, `notify` |
| `After` | מגדיר סדר טעינה - השירות יופעל אחרי היעד המצוין |
| `Restart` | `on-failure`, `always`, `no` - מדיניות אתחול אוטומטי |
| `WantedBy` | קובע לאיזה target (רמת ריצה) השירות משתייך |

---

## 5. ניהול Targets (מקבילי runlevels ב-SysV)

```bash
# בדיקת ה-target הנוכחי
systemctl get-default

# שינוי ל-multi-user (ללא GUI)
sudo systemctl set-default multi-user.target

# שינוי ל-graphical (עם GUI)
sudo systemctl set-default graphical.target

# מעבר זמני בין targets בלי restart
sudo systemctl isolate multi-user.target
```

---

## 6. Timers - חלופה מודרנית ל-cron

יצירת `myjob.timer`:
```ini
[Unit]
Description=Run myjob every day at 3am

[Timer]
OnCalendar=*-*-* 03:00:00
Persistent=true

[Install]
WantedBy=timers.target
```

ו-`myjob.service`:
```ini
[Unit]
Description=My Backup Job

[Service]
Type=oneshot
ExecStart=/opt/scripts/backup.sh
```

```bash
sudo systemctl enable --now myjob.timer
systemctl list-timers   # הצגת כל ה-timers הפעילים
```

---

## 7. Cron - הגישה הקלאסית לתזמון

```bash
# עריכת crontab למשתמש הנוכחי
crontab -e

# רשימת המשימות המתוזמנות
crontab -l

# פורמט: דקה שעה יום-בחודש חודש יום-בשבוע פקודה
# דוגמה: הרצה כל יום ב-3:00 בבוקר
0 3 * * * /opt/scripts/backup.sh

# הרצה כל 5 דקות
*/5 * * * * /opt/scripts/healthcheck.sh

# הרצה כל יום ראשון ב-00:00
0 0 * * 0 /opt/scripts/weekly_report.sh
```

---

## טיפים וטריקים 🔥

1. תמיד הריצו `sudo systemctl daemon-reload` אחרי עריכת קובץ `.service`.
2. השתמשו ב-`journalctl -xe` לדיבוג מהיר של שירות שנכשל - מציג הקשר מורחב.
3. `systemctl status` מציג את שורות הלוג האחרונות ישירות - לרוב לא צריך `journalctl` נפרד לבדיקה מהירה.
4. Timers עדיפים על cron למשימות מודרניות - הם תומכים ב-logging מובנה, תלויות ו-`Persistent=true` (הרצה מפוצה אם המערכת הייתה כבויה).
5. בדקו `systemctl --failed` באופן שגרתי כדי לזהות שירותים שקרסו.

---

## שאלות ראיון עבודה נפוצות

1. **מה ההבדל בין `systemctl restart` ל-`systemctl reload`?**
   `restart` עוצר ומפעיל מחדש את כל התהליך (הפרעה זמנית לשירות). `reload` שולח סיגנל לשירות לטעון קונפיגורציה מחדש בלי לעצור אותו (זמין רק אם השירות תומך בכך).

2. **מה עושה `systemctl enable` בפועל?**
   יוצר קישור סימבולי מהיעד (target) המתאים אל קובץ ה-service, כך שהשירות יופעל אוטומטית בעת האתחול הבא.

3. **איך תבדקו למה שירות נכשל בהפעלה?**
   `systemctl status servicename` לסיכום מהיר, ו-`journalctl -u servicename -xe` לפרטים מלאים.

4. **מה ההבדל בין systemd timers ל-cron?**
   Timers משתלבים עם systemd (logging דרך journalctl, תלויות בין שירותים, `Persistent=true`), בעוד cron הוא כלי עצמאי ופשוט יותר, נפוץ יותר עדיין בסביבות ישנות/פשוטות.

5. **מהו PID 1 בהקשר systemd?**
   systemd עצמו הוא PID 1 - התהליך הראשון שמופעל ע"י הקרנל ואחראי לאתחל את כל שאר השירותים.

---

## קישורים חיצוניים

### תיעוד רשמי
- [systemd Official Documentation](https://www.freedesktop.org/wiki/Software/systemd/)
- [systemctl man page](https://man7.org/linux/man-pages/man1/systemctl.1.html)
- [journalctl man page](https://man7.org/linux/man-pages/man1/journalctl.1.html)
- [Crontab.guru - כלי לבניית ביטויי cron](https://crontab.guru/)

### סרטוני יוטיוב מומלצים
- [systemd Explained - NetworkChuck](https://www.youtube.com/results?search_query=systemd+explained+networkchuck)
- [Creating a systemd Service](https://www.youtube.com/results?search_query=creating+a+systemd+service+tutorial)
- [Cron Jobs Tutorial](https://www.youtube.com/results?search_query=cron+jobs+tutorial+linux)

---

**חזרה למדריך הקודם:** [05 - ניהול תהליכים](./05-ניהול-תהליכים.md)
**המשך למדריך הבא:** [07 - Networking](./07-networking.md)
