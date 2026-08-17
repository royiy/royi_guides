---
title: "Veeam עם VMware vSphere ו-Microsoft Hyper-V"
category: Veeam
part: 6/10
---

## חיבור Veeam ל-vCenter Server

```
Backup Infrastructure → Managed Servers → Add Server → VMware vSphere → vCenter Server
→ הזינו FQDN/IP, פורט (ברירת מחדל 443), ופרטי חשבון עם הרשאות מתאימות
```

### הרשאות מינימליות נדרשות ב-vCenter
מומלץ ליצור **Role** ייעודי ב-vCenter עם ההרשאות הבאות (במקום להשתמש ב-Administrator@vsphere.local):
- Datastore: Allocate space, Browse datastore, Low level file operations
- Virtual Machine: Snapshot management (הכל)
- Host: Configuration (Storage partition configuration) - עבור Hot-Add
- Global: Manage custom attributes, Licenses

## Transport Modes ב-VMware - הבנה מעמיקה

| מצב | הסבר | מתי להשתמש |
|---|---|---|
| **Direct Storage Access** | ה-Proxy קורא ישירות מה-SAN/NFS ללא מעבר דרך ESXi Host | ביצועים הכי טובים, דורש גישה ישירה לאחסון |
| **Virtual Appliance (Hot-Add)** | ה-Proxy עצמו הוא VM, והדיסקים "מוצמדים" אליו זמנית | טוב כשאין גישה ישירה לאחסון מהפרוקסי הפיזי |
| **Network (NBD)** | תעבורה דרך רשת הניהול של ESXi | הכי איטי, אך הכי פשוט ותמיד עובד כ-fallback |

## CBT - Changed Block Tracking

VMware CBT הוא מנגנון שמאפשר ל-Veeam לזהות אילו בלוקים בדיסק השתנו מאז הגיבוי הקודם, ללא צורך לסרוק את כל הדיסק - זה הבסיס לגיבויים אינקרementליים מהירים.

```
טיפ: אם ה-CBT "נשבר" (corrupted), Veeam יזהה זאת אוטומטית ויבצע "Reset CBT" 
      שגורם לסריקה מלאה חד-פעמית - זה נורמלי ולא סימן לתקלה.
```

## חיבור Veeam ל-Hyper-V

```
Backup Infrastructure → Managed Servers → Add Server → Microsoft Hyper-V
→ בחרו: Standalone Server / SCVMM (System Center Virtual Machine Manager)
```

לניהול קלאסטרים גדולים מומלץ לחבר את Veeam ל-**SCVMM** ולא ל-hosts בודדים - מאפשר Live Migration awareness ו-Cluster Shared Volumes (CSV) מודעות.

## הבדלים מרכזיים בין VMware ל-Hyper-V ב-Veeam

| נושא | VMware vSphere | Hyper-V |
|---|---|---|
| מנגנון שינויים | CBT (Changed Block Tracking) | RCT (Resilient Change Tracking) |
| Application-Aware | VSS דרך VMware Tools | VSS ישיר (Guest Integration) |
| Off-host Proxy | נתמך במלואו | תלוי גרסת Windows Server |
| ניהול מרכזי | vCenter | SCVMM (מומלץ) |

## דוגמה: גיבוי קלאסטר Hyper-V עם CSV

```
1. חברו את כל ה-Hyper-V Hosts בקלאסטר (או את ה-SCVMM)
2. Veeam יזהה אוטומטית שיוך VMs ל-Cluster Shared Volumes
3. במהלך Live Migration של VM בין Hosts, Job שרץ ימשיך ללא הפרעה (Veeam עוקב אחרי המיקום)
```

## Application-Aware Processing - דוגמה ל-SQL Server

```
Backup Job → Guest Processing → Enable application-aware processing
→ בחרו VM עם SQL → Applications → הגדירו:
   - Transaction logs: Truncate / Backup logs periodically / Do not truncate
   - Log backup schedule: כל 15 דקות (עבור RPO נמוך)
```

זה מאפשר שחזור Point-in-Time מדויק של מסד הנתונים, לא רק שחזור לרגע הגיבוי המלא.

## Instant VM Recovery - שחזור מיידי

```
Backup → בחרו נקודת שחזור → Instant VM Recovery
→ Veeam "מרכיב" את ה-VM ישירות מקובץ הגיבוי (ללא צורך להעתיק אותו קודם)
→ ה-VM עולה תוך דקות ורץ ישירות מה-Repository, עם אופציה ל-Storage vMotion אחר כך למיקום קבוע
```

זהו אחד הכלים החזקים ביותר להתמודדות עם תקלות - RTO של דקות בודדות.

## טעויות נפוצות בסביבות היברידיות

1. **ערבוב Proxy אחד לשני הפלטפורמות** ללא בדיקת תאימות - מומלץ Proxies נפרדים ל-VMware ול-Hyper-V.
2. **התעלמות מ-RCT corruption ב-Hyper-V** - כמו CBT, גם RCT יכול "להישבר" ולדרוש Full מחדש.
3. **אי-עדכון VMware Tools / Integration Services** - גורם לכשל ב-Application-Aware Processing.

## קישורים חיצוניים

### תיעוד רשמי
- מדריך VMware vSphere המלא: https://helpcenter.veeam.com/docs/backup/vsphere/overview.html
- מדריך Hyper-V המלא: https://helpcenter.veeam.com/docs/backup/hyperv/overview.html
- מדריך Transport Modes: https://helpcenter.veeam.com/docs/vbr/userguide/transport_modes.html

### YouTube
- סקירת קונסולת Veeam ל-VMware: https://www.youtube.com/watch?v=V7VZBzUoXw8
- קורס מקיף הכולל VMware ו-Hyper-V: https://www.youtube.com/playlist?list=PLeqch-0_f39EbG5MsJfuX9DMDuQYdea-1

---

**חזרה למדריך הקודם:** [05 - Replication ו-DR](/veeam/05-replication-dr/)
**המשך למדריך הבא:** [07 - Veeam ONE, ניטור ודוחות](/veeam/07-monitoring-veeam-one/)
