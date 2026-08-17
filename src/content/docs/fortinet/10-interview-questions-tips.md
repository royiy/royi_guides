---
title: "שאלות ראיון עבודה, טיפים וטריקים ל-Fortinet/FortiGate"
category: Fortinet
part: 10/10
---

## שאלות ראיון — יסודות

**ש: מה ההבדל בין Firewall רגיל ל-NGFW?**
ת: פיירוול קלאסי בודק Layer 3/4 בלבד (IP, Port, פרוטוקול). NGFW כמו FortiGate מוסיף בדיקה ברמת Layer 7: זיהוי אפליקציות (Application Control), חתימות התקפה (IPS), בדיקת קבצים (AV), וסינון תוכן (Web Filtering) — כל זה תחת מדיניות אבטחה אחת.

**ש: הסבירו את סדר העיבוד (flow) של חבילה שנכנסת ל-FortiGate.**
ת: בקצרה: קליטת החבילה → בדיקת Routing (מציאת יציאה) → בדיקת Policy תואם (מלמעלה למטה) → אם Accept: NAT (אם מוגדר) → Security Profiles (IPS/AV/Web Filter/App Control) → יציאה מהממשק המתאים.

**ש: מה זה Implicit Deny?**
ת: כלל בלתי-נראה בסוף כל רשימת Policies שחוסם כל תעבורה שלא הותאמה לאף כלל מפורש. Best Practice הוא להוסיף כלל Deny מפורש עם Logging כדי שהחסימות יופיעו בלוגים.

## שאלות ראיון — VPN

**ש: מה ההבדל בין Policy-Based ל-Route-Based VPN?**
ת: ב-Route-Based (VTI — היום הנפוץ יותר) התעלה מיוצגת כממשק רשת וירטואלי, כך שניתן להשתמש ב-Routing רגיל (כולל דינמי) כדי לשלוט בתעבורה דרכה. ב-Policy-Based (ישן יותר), אין ממשק וירטואלי — ה-VPN מוגדר ישירות בתוך ה-Policy עצמו.

**ש: מה קורה אם ה-Phase 1 Proposals לא תואמים בין שני הצדדים?**
ת: תעלת ה-IKE לא תעלה כלל — אין הסכמה על שיטת ההצפנה/Hash הראשונית, אז אי אפשר אפילו להתחיל את תהליך האימות. יש לוודא זהות מדויקת של אלגוריתמים (Encryption, Hash, DH Group) בשני הצדדים.

## שאלות ראיון — HA

**ש: מה זה Split-Brain במצב HA, ואיך מונעים אותו?**
ת: מצב שבו שני החברים בקלאסטר "חושבים" ששניהם Primary בו-זמנית (בד"כ בגלל אובדן Heartbeat) — עלול לגרום לבעיות רשת חמורות. נמנע ע"י שימוש בכמה נתיבי Heartbeat (רדונדנטיות) ובדיקות תקינות תדירות.

**ש: מה קורה לסשנים (sessions) פעילים בזמן Failover?**
ת: ב-FGCP, session-ים מסתנכרנים בין החברים באופן שוטף (Session Synchronization), כך שרוב הסשנים ה-TCP ממשיכים לרוץ ללא הפרעה משמעותית אחרי Failover.

## שאלות ראיון — כלליות/תרחישיות

**ש: יש לכם משתמש שמתלונן שהוא לא מצליח לגלוש לאתר ספציפי. איך תתחילו לחקור?**
ת: תשובה טובה: 1) לבדוק אם זה כללי (כל האתרים) או ספציפי (אתר אחד) — אם ספציפי, כנראה Web Filter/App Control. 2) `diagnose sniffer` לוודא שהתעבורה בכלל מגיעה ל-FortiGate. 3) `Policy Lookup`/`debug flow` כדי לראות באיזה Policy זה נתפס ומה קורה שם. 4) בדיקת לוג Traffic ו-Web Filter Log לחיפוש Block מפורש.

**ש: מה ההבדל בין FortiManager ל-FortiAnalyzer?**
ת: FortiManager מנהל **קונפיגורציה** (Provisioning), FortiAnalyzer אוסף ומנתח **לוגים**.

**ש: מה זה Security Fabric?**
ת: הארכיטקטורה של Fortinet שמחברת בין כל מוצרי האבטחה שלה (FortiGate, FortiSwitch, FortiAP, FortiClient, FortiAnalyzer ועוד) לכדי מערכת אחת המשתפת מודיעין איומים ומאפשרת תגובה אוטומטית מתואמת (Automation Stitches) — למשל בידוד אוטומטי של מכשיר נגוע שזוהה ע"י FortiClient.

**ש: מה זה SD-WAN וב-FortiGate איך זה עובד?**
ת: יכולת לשלב מספר קווי אינטרנט/WAN ולנתב תעבורה ביניהם בצורה חכמה על סמך מדדי ביצועים (Latency/Jitter/Packet Loss) בזמן אמת, ולא רק על סמך Static Routing. מוגדר דרך `config system sdwan` עם Health Check Servers שבודקים את איכות כל קו באופן שוטף.

## תרגילי הכנה מעשיים (Hands-on)

1. הקימו FortiGate-VM על VMware Workstation/ESXi בחינם (Evaluation License) ותרגלו: הגדרת ממשקים, Policy בסיסי, NAT
2. הקימו שני FortiGate-VM ותרגלו IPsec Site-to-Site VPN ביניהם
3. תרגלו `diagnose sniffer` ו-`diagnose debug flow` על תרחיש מבוים ("אתר לא נטען")
4. הקימו HA Lab עם שני מכשירים והדגימו לעצמכם Failover ידני (`execute ha failover`)

## מסלול הסמכה (NSE - Network Security Expert)

Fortinet מציעה תוכנית הסמכות בשם **NSE (Network Security Expert)** בסולם 1 עד 8:
- **NSE 1-3** — הסמכות מודעות בסיסיות (Awareness), חינמיות לגמרי
- **NSE 4** — FortiGate Security + Infrastructure — ההסמכה המבוקשת ביותר לתפקידי Network/Security Engineer, כוללת בחינה
- **NSE 5-7** — התמחויות מתקדמות (FortiManager/Analyzer, Enterprise Firewall, Security Architect)
- **NSE 8** — הרמה הגבוהה ביותר, מיועדת למומחים בכירים

רוב המודעות דרושים "NSE 4" כדרישת סף/יתרון למשרות Network Security Engineer.

## טיפים כלליים להצלחה בראיון

- דעו להסביר תהליכים "בסדר הנכון" (Flow) — מראיינים אוהבים לבדוק שאתם מבינים **למה** דבר קורה, לא רק "מה הפקודה"
- הכירו את ההבדל בין GUI ל-CLI, והראו שאתם יודעים לעבוד גם ב-CLI (זה מראה הבנה עמוקה יותר)
- אם אין לכם ניסיון בפועל — ציינו שהקמתם Lab עצמאי (VM/GNS3) ותארו מה תרגלתם, זה נחשב לניסיון לגיטימי בעיני מראיינים רבים
- הכירו לפחות באופן כללי מוצרים מתחרים (Palo Alto, Check Point, Cisco Firepower) — שאלות השוואה נפוצות מאוד

## קישורים חיצוניים

- 🎓 Fortinet NSE Training (בחינם, כולל NSE 1-3): https://training.fortinet.com/
- 📘 FortiGate Cookbook: https://cookbook.fortinet.com/
- 📘 Fortinet Knowledge Base: https://kb.fortinet.com/
- 🎥 YouTube חיפוש מומלץ: `FortiGate interview questions and answers`
- 🎥 YouTube חיפוש מומלץ: `Fortinet NSE4 exam preparation`
- 🎥 YouTube חיפוש מומלץ: `FortiGate lab setup GNS3 EVE-NG`

## טיפ אחרון

מעסיקים מעריכים מאוד מועמדים שיודעים **לחקור בעיה בעצמם** (עם `sniffer`, `debug flow`, `Policy Lookup`) ולא רק מכירים הגדרות תיאורטית. אם יש לכם זמן לפני ראיון — עדיף לתרגל תרחיש Troubleshooting אמיתי ב-Lab מאשר לשנן עוד שאלות תיאורטיות.
