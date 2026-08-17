---
title: "ניהול מדיניות אבטחה (Security Policies) ב-FortiGate"
category: Fortinet
part: 3/10
---

## מהי Security Policy?

ה-Policy (או Firewall Policy) היא ליבת העבודה של כל פיירוול. כל חבילת מידע שעוברת דרך FortiGate נבדקת מול טבלת המדיניות **מלמעלה למטה**, וברגע שנמצאת התאמה ראשונה — היא מיושמת (ואין המשך בדיקה של השורות הבאות). לכן **סדר השורות קריטי**.

## מבנה בסיסי של Policy

כל Policy מורכב מ"התאמה" (Match) ו"פעולה" (Action):

**התאמה (Match Criteria):**
- Incoming Interface (srcintf)
- Outgoing Interface (dstintf)
- Source Address (srcaddr)
- Destination Address (dstaddr)
- Service (פרוטוקול/פורט)
- Schedule (מתי זה בתוקף)
- User/Group (אופציונלי — אימות משתמשים)

**פעולה (Action):**
- Accept / Deny
- NAT (אם Accept)
- Security Profiles (IPS, AV, Web Filter וכו')
- Logging

## דוגמת בניית Policy מבוקרת (במקום "allow all")

נניח שאנחנו רוצים לאפשר רק גלישה מאובטחת (HTTP/HTTPS) מרשת ה-LAN לאינטרנט, עם בדיקת IPS ו-Antivirus:

```bash
# שלב 1: יצירת אובייקט כתובת לרשת ה-LAN
config firewall address
    edit "LAN_SUBNET"
        set subnet 192.168.10.0 255.255.255.0
    next
end

# שלב 2: יצירת קבוצת שירותים (Web only)
config firewall service group
    edit "WEB_SERVICES"
        set member "HTTP" "HTTPS" "DNS"
    next
end

# שלב 3: ה-Policy עצמו
config firewall policy
    edit 10
        set name "LAN-Web-Access"
        set srcintf "port2"
        set dstintf "port1"
        set srcaddr "LAN_SUBNET"
        set dstaddr "all"
        set action accept
        set schedule "always"
        set service "WEB_SERVICES"
        set nat enable
        set utm-status enable
        set ips-sensor "default"
        set av-profile "default"
        set webfilter-profile "default"
        set logtraffic all
    next
end

# שלב 4: Policy חוסם (Explicit Deny) לכל השאר, עם לוגים
config firewall policy
    edit 11
        set name "Deny-All-Log"
        set srcintf "port2"
        set dstintf "port1"
        set srcaddr "all"
        set dstaddr "all"
        set action deny
        set schedule "always"
        set service "ALL"
        set logtraffic all
    next
end
```

💡 בפועל, ל-FortiGate יש תמיד "Implicit Deny" בסוף הרשימה שחוסם כל מה שלא הותאם — אבל כלל Deny מפורש עם Logging מומלץ, כי הוא **כן** נרשם בלוגים (ה-Implicit Deny ברירת המחדל לפעמים לא נרשם אלא אם מפעילים זאת ספציפית).

## Address Objects — שימוש ב"שמות" במקום IP-ים

Best Practice הוא לעולם לא לכתוב IP חופשי בתוך Policy, אלא ליצור **Address Object**:

```bash
config firewall address
    edit "SRV_WebApp01"
        set subnet 10.0.5.20 255.255.255.255
    next
    edit "Range_Guests"
        set type iprange
        set start-ip 192.168.50.10
        set end-ip 192.168.50.100
    next
end
```

יתרונות: קריאות, ניתן להחליף IP במקום אחד ולעדכן את כל ה-Policies שמשתמשים בו, ותמיכה ב-FQDN (למשל אובייקט שמייצג `*.office.com`).

## Policy מבוסס משתמשים (User-based Policy)

ניתן לדרוש אימות משתמש (מ-AD/LDAP) לפני מתן גישה:

```bash
config firewall policy
    edit 20
        set name "HR-Group-Access"
        set srcintf "port2"
        set dstintf "port3"
        set srcaddr "all"
        set dstaddr "HR_Server"
        set action accept
        set schedule "always"
        set service "HTTPS"
        set groups "HR_Group"
        set nat disable
    next
end
```

## Policy Lookup — כלי אבחון שימושי

ב-GUI תחת `Policy & Objects > Firewall Policy` יש כפתור **Policy Lookup** שמאפשר לבדוק אילו כללים יתאימו לחבילה נתונה (source IP, destination, port) — כלי מצוין לפתרון בעיות ("למה החיבור הזה נחסם?").

## סידור Policies (Policy Ordering)

חוק הזהב: **ספציפי למעלה, כללי למטה**. אם יש כלל רחב (`all/all`) בראש הרשימה — הוא "יבלע" את כל התעבורה ולא יגיע לכללים הספציפיים מתחתיו.

## קישורים חיצוניים

- 📘 תיעוד רשמי — Firewall Policies: https://docs.fortinet.com/document/fortigate/latest/administration-guide/952434/firewall-policies
- 📘 FortiGate Cookbook — Policy examples: https://cookbook.fortinet.com/
- 🎥 YouTube חיפוש מומלץ: `FortiGate firewall policy tutorial`
- 🎥 YouTube חיפוש מומלץ: `FortiGate policy order best practices`

## טיפים וטריקים

- תמיד לסיים רשימת Policies בכלל Deny מפורש עם Log מופעל — קל יותר לניתוח תקריות
- להימנע מ-`srcaddr all` / `dstaddr all` בסביבת Production — זו "חור אבטחה" נפוץ
- שימוש בפקודת `diagnose sys session list` ב-CLI מראה session-ים חיים ועוזר להבין דרך איזה Policy עברה תעבורה מסוימת (שדה `policy_id`)
- כדאי לתת שמות (`set name`) ברורים לכל Policy — זה חוסך זמן עצום בפתרון תקלות ובביקורות אבטחה
