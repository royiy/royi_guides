---
sidebar_position: 7
title: "מדריך 7: Networking בלינוקס"
---

## מבוא
הבנת רשתות היא חלק בלתי נפרד מניהול שרתי לינוקס. מדריך זה מכסה את כלי הרשת החיוניים, מ-ping בסיסי ועד ניתוח תעבורה מתקדם.

---

## 1. בדיקת חיבוריות בסיסית

```bash
# בדיקת חיבור לשרת מרוחק
ping google.com

# מספר ניסיונות מוגבל
ping -c 4 google.com

# מעקב אחרי הנתיב (route) לשרת
traceroute google.com
# חלופה מודרנית:
tracepath google.com

# בדיקת DNS resolution
nslookup google.com
dig google.com

# בדיקת פרטי DNS מפורטים
dig google.com +short
dig google.com MX     # רשומות mail
```

---

## 2. הגדרות רשת - כתובות IP וממשקים

```bash
# הצגת ממשקי רשת וכתובות IP (הכלי המודרני)
ip addr show
ip a

# הצגה מקוצרת של ממשק ספציפי
ip addr show eth0

# הצגת טבלת ניתוב (routing table)
ip route show

# הוספת כתובת IP סטטית זמנית
sudo ip addr add 192.168.1.100/24 dev eth0

# הפעלה/כיבוי ממשק
sudo ip link set eth0 up
sudo ip link set eth0 down

# הכלי הישן (deprecated אך עדיין נפוץ בסקריפטים ישנים)
ifconfig
```

### קונפיגורציית רשת קבועה
- **Ubuntu/Debian מודרני**: `/etc/netplan/*.yaml`
- **RHEL/CentOS**: `/etc/sysconfig/network-scripts/ifcfg-eth0`
- **Debian ישן**: `/etc/network/interfaces`

דוגמת netplan:
```yaml
network:
  version: 2
  ethernets:
    eth0:
      addresses: [192.168.1.100/24]
      gateway4: 192.168.1.1
      nameservers:
        addresses: [8.8.8.8, 1.1.1.1]
```

---

## 3. פורטים וחיבורים פעילים

```bash
# הצגת כל הפורטים הפתוחים (הכלי המודרני)
sudo ss -tulpn

# t=tcp, u=udp, l=listening, p=process, n=numeric

# הכלי הישן - netstat
sudo netstat -tulpn

# בדיקת מי מאזין על פורט ספציפי
sudo ss -tulpn | grep :443
sudo lsof -i :443

# הצגת כל החיבורים הפעילים (established)
ss -t state established
```

---

## 4. Firewall - ניהול חומת אש

### UFW (Ubuntu/Debian - ידידותי למשתמש)
```bash
# הפעלה
sudo ufw enable

# בדיקת סטטוס
sudo ufw status verbose

# פתיחת פורט
sudo ufw allow 22/tcp
sudo ufw allow ssh
sudo ufw allow 443/tcp

# פתיחה ל-IP ספציפי בלבד
sudo ufw allow from 192.168.1.50 to any port 22

# חסימת פורט
sudo ufw deny 8080

# מחיקת חוק
sudo ufw delete allow 8080
```

### firewalld (RHEL/CentOS/Fedora)
```bash
# בדיקת סטטוס
sudo firewall-cmd --state

# פתיחת פורט (זמני - עד restart)
sudo firewall-cmd --add-port=443/tcp

# פתיחת פורט קבועה
sudo firewall-cmd --permanent --add-port=443/tcp
sudo firewall-cmd --reload

# רשימת כללים פעילים
sudo firewall-cmd --list-all
```

### iptables (השכבה הנמוכה, בסיס לכל השאר)
```bash
# הצגת כללים קיימים
sudo iptables -L -v -n

# פתיחת פורט
sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT

# שמירת כללים (Debian/Ubuntu)
sudo iptables-save > /etc/iptables/rules.v4
```

---

## 5. SSH - Secure Shell

```bash
# חיבור לשרת מרוחק
ssh user@192.168.1.10

# חיבור עם פורט ספציפי
ssh -p 2222 user@remotehost

# חיבור עם מפתח ספציפי
ssh -i ~/.ssh/mykey.pem user@remotehost

# יצירת זוג מפתחות SSH
ssh-keygen -t ed25519 -C "myemail@example.com"

# העתקת מפתח ציבורי לשרת (מאפשר התחברות ללא סיסמה)
ssh-copy-id user@remotehost

# הרצת פקודה מרוחקת בלי להתחבר לסשן מלא
ssh user@remotehost "df -h"

# יצירת מנהרת SSH (Port Forwarding)
ssh -L 8080:localhost:80 user@remotehost   # Local forwarding
ssh -R 9090:localhost:3000 user@remotehost # Remote forwarding
```

### הקשחת SSH - `/etc/ssh/sshd_config`
```
PermitRootLogin no
PasswordAuthentication no
Port 2222
AllowUsers john jane
```
לאחר שינויים: `sudo systemctl restart sshd`

---

## 6. כלי דיבוג וניתוח רשת

```bash
# ניתוח תעבורת רשת בזמן אמת (דורש התקנה)
sudo tcpdump -i eth0

# ניטור תעבורה על פורט ספציפי
sudo tcpdump -i eth0 port 80

# שמירת תעבורה לניתוח מאוחר יותר ב-Wireshark
sudo tcpdump -i eth0 -w capture.pcap

# בדיקת bandwidth בין שני שרתים
iperf3 -s          # בצד השרת
iperf3 -c server_ip # בצד הקליינט

# הורדת קובץ מהאינטרנט
curl -O https://example.com/file.zip
wget https://example.com/file.zip

# בדיקת headers של HTTP response
curl -I https://example.com

# שליחת בקשת POST עם curl
curl -X POST -d '{"key":"value"}' -H "Content-Type: application/json" https://api.example.com
```

---

## טיפים וטריקים 🔥

1. השתמשו ב-`ss` במקום `netstat` - הוא מהיר יותר ומתוחזק באופן פעיל.
2. תמיד בדקו `ufw status` או `firewall-cmd --list-all` לפני ואחרי כל שינוי כדי לוודא שהכללים נכנסו לתוקף.
3. בסביבת production, השביתו כניסת root ב-SSH (`PermitRootLogin no`) והשתמשו במפתחות בלבד (`PasswordAuthentication no`).
4. `tcpdump` הוא כלי חזק אך יכול ליצור פלט עצום - השתמשו תמיד בפילטרים (`port`, `host`, `src`, `dst`).
5. שנו את פורט ה-SSH מ-22 לפורט אחר בסביבת production כדי להפחית סריקות בוטים אוטומטיות (security through obscurity - לא תחליף לאבטחה אמיתית, אך מפחית רעש).

---

## שאלות ראיון עבודה נפוצות

1. **מה ההבדל בין TCP ל-UDP?**
   TCP הוא protocol מבוסס-חיבור (connection-oriented) עם אישורי קבלה (ACK) ואמינות; UDP הוא ללא חיבור (connectionless), מהיר יותר אך לא מבטיח הגעה או סדר של הפאקטות.

2. **איך תבדקו אילו פורטים פתוחים בשרת?**
   `sudo ss -tulpn` או `sudo netstat -tulpn`

3. **מה עושה `ssh -L 8080:localhost:80 user@host`?**
   יוצר מנהרת SSH (local port forwarding) - כל תעבורה לפורט 8080 המקומי תועבר דרך השרת המרוחק לפורט 80 שלו.

4. **מה ההבדל בין firewall ל-iptables?**
   `iptables` הוא הכלי הבסיסי המנהל את כללי ה-netfilter בקרנל. `ufw` ו-`firewalld` הם ממשקים ידידותיים יותר שמנהלים את `iptables` (או `nftables`) מאחורי הקלעים.

5. **מה זה DNS ואיך אתם מדבגים בעיית resolution?**
   DNS ממיר שמות דומיין לכתובות IP. לדיבוג: `dig domain.com`, `nslookup domain.com`, בדיקת `/etc/resolv.conf`, ובדיקת `/etc/hosts` לרשומות מקומיות שעלולות לעקוף DNS.

6. **מה קורה כשמריצים `ping` ולא מקבלים תשובה - איך תבדקו את הבעיה שלב אחר שלב?**
   בדיקת קישוריות פיזית/ממשק (`ip a`), בדיקת ניתוב (`ip route`), בדיקת firewall חוסם ICMP, בדיקת DNS אם מדובר בשם דומיין, ובדיקה עם `traceroute` לאיתור הנקודה שבה התעבורה נעצרת.

---

## קישורים חיצוניים

### תיעוד רשמי
- [iproute2 (ip command) documentation](https://wiki.linuxfoundation.org/networking/iproute2)
- [UFW Documentation - Ubuntu](https://help.ubuntu.com/community/UFW)
- [OpenSSH Documentation](https://www.openssh.com/manual.html)
- [tcpdump man page](https://www.tcpdump.org/manpages/tcpdump.1.html)

### סרטוני יוטיוב מומלצים
- [Linux Networking Commands Explained - NetworkChuck](https://www.youtube.com/results?search_query=linux+networking+commands+explained+networkchuck)
- [SSH Tutorial for Beginners](https://www.youtube.com/results?search_query=ssh+tutorial+for+beginners)
- [tcpdump Tutorial](https://www.youtube.com/results?search_query=tcpdump+tutorial+linux)
- [iptables Explained](https://www.youtube.com/results?search_query=iptables+explained+tutorial)

---

**חזרה למדריך הקודם:** [06 - שירותים ו-systemd](/linux/06-שירותים-systemd/)
**המשך למדריך הבא:** [08 - ניהול שרתים](/linux/08-ניהול-שרתים/)
