---
title: "מבוא ל-Fortinet ו-FortiGate"
category: Fortinet
part: 1/10
---

## מה זה Fortinet?

Fortinet היא חברת אבטחת מידע אמריקאית, מהגדולות והמוכרות בעולם בתחום ה-Network Security. החברה מייצרת מגוון רחב של מוצרי אבטחה, כשהדגל שלה הוא **FortiGate** — פיירוול מסוג Next-Generation Firewall (NGFW).

הגישה הייחודית של Fortinet נקראת **Security Fabric** — מערך מוצרים שמדברים ביניהם (פיירוול, ניהול מרכזי, אבטחת קצה, אבטחת ענן ועוד) ויוצרים שכבת הגנה אחודה על כל הרשת הארגונית.

## מה זה FortiGate?

FortiGate הוא הפיירוול המרכזי של Fortinet. הוא לא "רק" פיירוול קלאסי (חסימת פורטים/IP) אלא NGFW מלא הכולל:

- **Firewall / Stateful Inspection** — בקרת תעבורה בין רשתות/אזורים (zones)
- **IPS (Intrusion Prevention System)** — זיהוי וחסימת התקפות ברמת החתימה
- **Antivirus / Antimalware** — סריקת קבצים העוברים ברשת
- **Web Filtering** — חסימת/בקרת גישה לאתרים לפי קטגוריות
- **Application Control** — זיהוי ובקרה של אפליקציות (לא רק פורטים)
- **VPN** — IPsec ו-SSL VPN מובנים
- **SD-WAN** — ניהול קווי אינטרנט/MPLS מרובים בצורה חכמה
- **User Authentication** — שילוב עם AD, LDAP, RADIUS, FSSO

כל זה רץ על שבב ייעודי של Fortinet שנקרא **SPU (Security Processing Unit)**, שמאיץ פעולות הצפנה/פענוח ובדיקת תוכן ברמת החומרה — זה מה שנותן ל-FortiGate ביצועים גבוהים גם כשמפעילים הרבה מנועי בדיקה בו-זמנית (בניגוד לפתרונות תוכנה טהורים).

## מערכת ההפעלה: FortiOS

כל מכשירי FortiGate (חומרה או וירטואלי) רצים על מערכת הפעלה בשם **FortiOS**. חשוב להכיר:

- גרסאות נפוצות היום: 7.0, 7.2, 7.4, 7.6
- ניתן לנהל את המכשיר דרך **GUI** (ממשק ווב גרפי) או **CLI** (שורת פקודה, מבוססת פקודות דמויות Cisco אך עם תחביר משלה)
- כל שינוי דרך ה-GUI בפועל "מתורגם" לפקודות CLI מאחורי הקלעים

## דוגמת פקודות CLI בסיסיות

```bash
# כניסה למצב גלובלי וצפייה בגרסת המערכת
get system status

# הצגת רשימת ממשקים (interfaces)
get system interface physical

# הצגת מדיניות אבטחה קיימת
show firewall policy

# עריכת שם המכשיר (hostname)
config system global
    set hostname "FGT-HQ-01"
end
```

## משפחות מוצרים עיקריות של Fortinet

| מוצר | תפקיד |
|---|---|
| FortiGate | פיירוול NGFW |
| FortiManager | ניהול מרכזי למספר FortiGate |
| FortiAnalyzer | לוגים, דוחות, אנליטיקה |
| FortiSwitch | סוויצ'ים מנוהלים דרך FortiGate |
| FortiAP | נקודות גישה אלחוטיות (WiFi) |
| FortiClient | תוכנת אבטחת קצה + VPN client |
| FortiSIEM | ניהול אירועי אבטחה (SIEM) |
| FortiWeb | Web Application Firewall (WAF) |
| FortiMail | אבטחת דואר אלקטרוני |

## איפה משתמשים ב-FortiGate בפועל?

- **Edge Firewall** — הפיירוול הראשי בכניסה לרשת הארגונית מול האינטרנט
- **Internal Segmentation Firewall (ISFW)** — הפרדה בין מחלקות/VLAN-ים פנימיים
- **Data Center Firewall** — הגנה על שרתים ואפליקציות
- **Branch Office / SD-WAN** — חיבור סניפים למטה בצורה מאובטחת וחכמה
- **Cloud** — FortiGate-VM ב-AWS, Azure, GCP, VMware

## למה כדאי ללמוד Fortinet?

Fortinet היא אחת מ-4 החברות המובילות בעולם בתחום ה-Network Security (יחד עם Palo Alto, Cisco, Check Point), עם נתח שוק גדול במיוחד בתחום ה-Mid-Market ו-SMB, אבל גם בארגונים גדולים ו-Service Providers. הידע ב-FortiGate מבוקש מאוד בישראל ובעולם עבור תפקידי Network Security Engineer, NOC/SOC, ו-System Administrator.

## קישורים חיצוניים

- 📘 תיעוד רשמי (FortiOS Administration Guide): https://docs.fortinet.com/product/fortigate/
- 📘 FortiGate Cookbook (מדריכי Step-by-Step רשמיים): https://cookbook.fortinet.com/
- 🎥 YouTube — Fortinet Official Channel: https://www.youtube.com/@Fortinet
- 🎥 YouTube חיפוש מומלץ: `FortiGate for beginners tutorial`
- 🎓 Fortinet NSE Training (הכשרות והסמכות רשמיות, כולל קורסים חינמיים): https://training.fortinet.com/

## טיפ למתחילים

התחילו עם **FortiGate VM Evaluation** (גרסת הדגמה חינמית להרצה על VMware Workstation/ESXi או GNS3/EVE-NG) כדי לתרגל ללא צורך בחומרה פיזית. אפשר גם להירשם ל-Fortinet Developer Network (FNDN) לגישה לתיעוד מורחב ולעיתים לכלים נוספים.

---
*המשך במדריך הבא: התקנה והגדרה ראשונית של FortiGate*
