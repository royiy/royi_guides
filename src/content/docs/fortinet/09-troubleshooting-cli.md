---
title: "Troubleshooting וכלי אבחון ב-FortiGate"
category: Fortinet
part: 9/10
---

## גישת עבודה כללית לפתרון תקלות

1. **הגדר את הבעיה במדויק** — מי (source), מה (destination/service), ומתי
2. **בדוק Connectivity בסיסי** — L1/L2 (כבל, ARP), ואז L3 (ping, routing)
3. **בדוק Policy Match** — האם התעבורה בכלל אמורה להיות מותרת?
4. **בדוק NAT** — האם התרגום נכון?
5. **בדוק Security Profiles** — האם IPS/AV/Web Filter חוסמים משהו שלא מתכוונים?
6. **בדוק לוגים** — Traffic Log ו-Event Log

## כלי האבחון החשוב ביותר: `diagnose sniffer`

מאפשר "ללכוד" תעבורה ישירות ב-CLI (כמו tcpdump), בלי צורך בכלים חיצוניים:

```bash
diagnose sniffer packet any 'host 192.168.10.50 and port 443' 4
```

**הסבר הפרמטרים:**
- `any` — כל הממשקים (אפשר גם ממשק ספציפי כמו `port1`)
- הביטוי בגרשיים — פילטר בסגנון tcpdump (host, port, proto...)
- `4` — רמת הפירוט (Verbosity): 1=מינימלי, 4=כולל תוכן חבילה חלקי

**דוגמה נוספת — מעקב אחר תעבורת ICMP בלבד:**

```bash
diagnose sniffer packet port1 'icmp' 3 20
```
(הפרמטר האחרון `20` מגביל ל-20 חבילות ואז עוצר אוטומטית)

## בדיקת Session Table

```bash
# הצגת session-ים פעילים
diagnose sys session list

# סינון session-ים לפי IP מסוים
diagnose sys session filter dst 192.168.10.50
diagnose sys session list

# ניקוי כל ה-session-ים (זהירות! מנתק חיבורים פעילים)
diagnose sys session clear
```

כל שורת session מציגה גם `policy_id` — כך ניתן לדעת בדיוק דרך איזה Policy עברה תעבורה מסוימת.

## בדיקת Routing

```bash
# טבלת ניתוב מלאה
get router info routing-table all

# בדיקת מסלול ספציפי ליעד
get router info routing-table details 8.8.8.8
```

## בדיקת מצב Interfaces

```bash
get system interface physical
diagnose hardware deviceinfo nic port1
```

## דיבוג בזמן אמת (Debug Flow) — לבעיות Policy/NAT מורכבות

זהו אחד הכלים החזקים ביותר לפתרון בעיות "למה החיבור הזה לא עובד":

```bash
diagnose debug flow filter addr 192.168.10.50
diagnose debug flow filter port 443
diagnose debug flow show console enable
diagnose debug flow trace start 20
diagnose debug enable
```

לאחר הרצת הפקודות, יוזמים חיבור מהמכשיר עם ה-IP המסונן, ורואים בזמן אמת בדיוק איך ה-Packet "זורם" דרך FortiGate — כולל באיזה Policy הוא נתפס, אם NAT הוחל, ואם UTM חסם משהו.

**לסיום debug flow:**

```bash
diagnose debug disable
diagnose debug flow trace stop
```

## בעיות נפוצות ופתרונן

### "אין אינטרנט" ברשת פנימית

1. `get router info routing-table all` — יש Default Route?
2. `diagnose sniffer packet port1 'icmp'` — יוצא ICMP בכלל דרך ה-WAN?
3. בדיקת ה-Policy — `set nat enable` הוגדר?
4. DNS — `config system dns` מוגדר נכון?

### תעלת VPN "עולה ונופלת" (Flapping)

- לבדוק אי-התאמת Proposals (`diagnose vpn ike gateway list`)
- לבדוק אם יש NAT-T (NAT Traversal) נדרש אם אחד הצדדים מאחורי NAT
- לבדוק Dead Peer Detection (DPD) settings

### ביצועים איטיים (High CPU/Memory)

```bash
get system performance status
diagnose sys top
```

לבדוק אם UTM Proxy-based גורם לעומס, ואם יש תהליך ספציפי (למשל `ipsengine`, `scanunitd`) שצורך משאבים חריגים.

### בעיית HA Out of Sync

```bash
diagnose sys ha status
diagnose sys ha checksum cluster
```

## מבנה Support Report (חשוב לפתיחת קייס תמיכה)

כשפותחים קייס תמיכה ל-Fortinet TAC, כדאי לצרף:

```bash
execute backup config flash
diagnose debug report
```

הפקודה `diagnose debug report` אוספת אוטומטית סט מקיף של פלטי אבחון (Logs, Config, System Info) בקובץ אחד — חוסך הרבה זמן.

## קישורים חיצוניים

- 📘 תיעוד רשמי — Troubleshooting: https://docs.fortinet.com/document/fortigate/latest/administration-guide/954945/troubleshooting
- 📘 Fortinet Knowledge Base: https://kb.fortinet.com/
- 🎥 YouTube חיפוש מומלץ: `FortiGate diagnose sniffer packet tutorial`
- 🎥 YouTube חיפוש מומלץ: `FortiGate debug flow troubleshooting`

## טיפים וטריקים

- `diagnose sniffer packet` הוא כמעט תמיד הצעד הראשון הנכון — הוא מראה מה **בפועל** מגיע/יוצא מהמכשיר, ללא "השערות"
- זכרו לעצור תמיד `debug flow`/`sniffer` עם `diagnose debug disable` אחרי שסיימתם — אחרת זה ממשיך לצרוך CPU ברקע
- כלי מומלץ נוסף: `execute traceroute` ו-`execute ping-options` (למשל שינוי source interface לבדיקת Ping)
- ל-Ctrl+C יש חשיבות — עוצר Debug/Sniffer שרץ ב-CLI בזמן אמת
