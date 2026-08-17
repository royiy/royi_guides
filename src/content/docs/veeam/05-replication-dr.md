---
title: "Replication, Failover ו-Disaster Recovery (DR)"
category: Veeam
part: 5/10
---

## מהי Replication ב-Veeam?

Replication היא תהליך שבו Veeam יוצר ומעדכן באופן שוטף עותק **חי** (Replica) של VM בסביבת יעד (Host/Cluster אחר, לעיתים באתר גיאוגרפי נפרד). בניגוד לגיבוי (שהוא קובץ ארכיוני), ה-Replica הוא VM כבוי אך "מוכן להפעלה" תוך דקות במקרה כשל.

## מדדי RPO ו-RTO

- **RPO (Recovery Point Objective)** - כמה נתונים מותר לאבד (למשל 15 דקות אחרונות)
- **RTO (Recovery Time Objective)** - כמה זמן מותר שייקח לשחזר את השירות (למשל 10 דקות)

Replication מספקת RTO נמוך משמעותית מגיבוי רגיל, כי אין צורך "לבנות" VM מחדש מקובץ גיבוי - הוא כבר קיים ומוכן.

## יצירת Replication Job - שלב אחר שלב

```
Home → Replication Job → Virtual Machine → VMware vSphere

1. שם: "DR-Replication-ProdServers"
2. הוסיפו VMs למקור
3. בחרו Destination: Host/Cluster/Resource Pool ביעד (למשל DR-Site-Cluster)
4. בחרו Datastore ליעד
5. הגדירו Network Mapping - כיצד רשתות המקור ימופו לרשתות היעד
6. הגדירו Re-IP Rules אם כתובות ה-IP שונות בין האתרים
7. קבעו Restore Points to keep (למשל 7)
8. תזמון: כל שעה / כל 4 שעות בהתאם ל-RPO
```

## Network Mapping ו-Re-IP - דוגמה

```
מקור: VLAN10-Production (10.10.10.0/24)
יעד:  VLAN20-DR (10.20.20.0/24)

Re-IP Rule:
  Source IP: 10.10.10.50 → Target IP: 10.20.20.50
  Default Gateway: 10.20.20.1
  DNS: 10.20.20.10
```

## Failover - מעבר לחירום

כאשר האתר הראשי נופל, מבצעים **Failover**:

```
Replicas → בחרו VM → Failover Now
```

Veeam מפעיל את ה-Replica העדכני ביותר (או נקודת שחזור נבחרת) ומפנה אליו את התעבורה. זהו מצב זמני - עדיין לא "קבוע".

## Failback - חזרה לאתר המקורי

לאחר תיקון האתר הראשי:

```
Replicas → בחרו VM במצב Failover → Failback to production
→ בחרו: Failback to the original VM / Failback to a new location
```

Veeam מסנכרן רק את **השינויים** שנוצרו בזמן ה-Failover בחזרה למקור - חוסך זמן משמעותי.

## Planned Failover מול Failover רגיל

- **Failover** - תגובה למקרה כשל בלתי צפוי (Unplanned) - עלול לגרום לאובדן נתונים קטן מאז נקודת ה-Replica האחרונה.
- **Planned Failover** - מעבר מתוזמן ומבוקר (למשל תחזוקה מתוכננת) - Veeam מבצע סנכרון אחרון לפני המעבר כדי להבטיח **אפס אובדן נתונים**.

## Failover Plan - אוטומציה לסדר ההפעלה

עבור מספר VMs תלויים (למשל Domain Controller → Database → Application Server), ניתן להגדיר **Failover Plan** שמפעיל אותם בסדר הנכון עם השהיות (delays) בין שלב לשלב:

```
Failover Plans → Add Failover Plan
1. Domain-Controller (Delay: 0 min)
2. SQL-Server (Delay: 2 min אחרי DC)
3. App-Server (Delay: 1 min אחרי SQL)
```

## CDP - Continuous Data Protection

עבור עומסים קריטיים ביותר, Veeam מציעה **CDP** - רפליקציה כמעט-רציפה ברמת ה-I/O (RPO של שניות בודדות) באמצעות VMware vSphere APIs for I/O filtering, ללא תלות ב-Snapshots מסורתיים.

## דוגמה: תרחיש DR מלא בענן (Veeam + Azure/AWS)

```
1. הגדירו Cloud Connect Replication מול ספק שירות (Service Provider) או Hyperscaler
2. הגדירו רשת Extended/VPN בין On-Prem ל-Cloud
3. צרו Replication Job עם יעד ה-Cloud Host
4. בדקו Failover באמצעות VM Isolated Network כדי לא לפגוע בייצור
```

## בדיקת Failover בטוחה (ללא סיכון לייצור)

```
Failover → Test Failover → בחרו VM
→ הפעל בסביבת רשת מבודדת (Isolated Network) שVeeam יוצר אוטומטית
```

זהו כלי קריטי - יש לתרגל Failover באופן קבוע (רבעוני לפחות) כדי לוודא שהתהליך אכן עובד בפועל ולא רק "בתיאוריה".

## טיפים מעשיים

1. **תרגלו Failover באופן שוטף** - DR שלא נבדק הוא DR שלא באמת עובד.
2. **תעדו Runbook מפורט** לכל תרחיש Failover, כולל אנשי קשר וסדר פעולות.
3. **שלבו Replication עם Backup** - Replication אינה תחליף לגיבוי (אין לה היסטוריה ארוכה מספיק כברירת מחדל).
4. **בדקו רוחב פס רשת** בין האתרים - Replication תדיר דורש קישוריות יציבה.

## קישורים חיצוניים

### תיעוד רשמי
- מדריך Replication מלא: https://helpcenter.veeam.com/docs/vbr/userguide/replica_intro.html
- מדריך Failover ו-Failback: https://helpcenter.veeam.com/docs/vbr/userguide/failover_intro.html
- מדריך CDP: https://helpcenter.veeam.com/docs/vbr/userguide/cdp_intro.html

### YouTube
- יצירת Replication Job - וידאו: https://www.youtube.com/watch?v=vPduVHLMRvc
- Veeam Replication Essentials (הדרכה מקיפה): https://www.youtube.com/watch?v=V7VZBzUoXw8

---

**חזרה למדריך הקודם:** [04 - Backup Copy וכלל 3-2-1](/veeam/04-backup-copy-3-2-1/)
**המשך למדריך הבא:** [06 - VEEAM עם VMware ו-Hyper-V](/veeam/06-vmware-hyperv/)
