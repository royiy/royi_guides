---
title: "שאלות ראיון עבודה על Veeam (עם תשובות)"
category: Veeam
part: 9/10
---

מדריך זה מרכז שאלות ראיון נפוצות לתפקידי SysAdmin, Backup Engineer ו-Infrastructure Engineer, מדורגות לפי רמת קושי.

## רמה בסיסית (Junior)

**ש: מה ההבדל בין Backup Job ל-Replication Job?**
ת: Backup Job יוצר קבצי גיבוי (VBK/VIB) לצורך שמירה ושחזור עתידי. Replication Job יוצר VM חי (Replica) שניתן להפעיל מיידית במקרה כשל, עם RTO נמוך משמעותית.

**ש: מהם VBK, VIB ו-VRB?**
ת: VBK = קובץ גיבוי מלא (Full). VIB = קובץ אינקרementלי קדימה (Forward Incremental). VRB = קובץ אינקרementלי הפוך (Reverse Incremental) שנוצר בשיטת Reverse Incremental Backup.

**ש: מהו Backup Proxy ומה תפקידו?**
ת: רכיב שמבצע את העברת הנתונים בפועל בין המקור ליעד - קורא בלוקים, מבצע דחיסה ודה-דופליקציה, ומקל את העומס משרת הגיבוי המרכזי.

**ש: מה ההבדל בין Forward Incremental ל-Reverse Incremental?**
ת: ב-Forward Incremental, ה-Full נשאר קבוע וכל האינקרементלים נוספים אליו לאורך זמן (עם Merge של הישן ביותר). ב-Reverse Incremental, ה-VBK תמיד מייצג את המצב העדכני ביותר, וקבצי VRB "מזיזים אחורה" בזמן.

**ש: מהו Restore Point?**
ת: נקודת זמן ספציפית שממנה ניתן לשחזר VM או קובץ - כל ריצת Job מוצלחת יוצרת Restore Point חדש.

## רמה בינונית (Mid-Level)

**ש: מהו SOBR (Scale-Out Backup Repository) ומה היתרון שלו?**
ת: SOBR מאחד מספר repositories לאחסון יחיד לוגי, עם אפשרות ל-Performance Tier (מהיר, מקומי) ו-Capacity Tier (זול, בענן) עם Offload אוטומטי. מאפשר Scale קל, ניצול טוב יותר של אחסון, וגמישות ב-Immutability.

**ש: הסבירו את כלל 3-2-1-1-0.**
ת: 3 עותקי נתונים, על 2 סוגי מדיה, עם עותק אחד Off-site, עותק אחד Offline/Immutable, ו-0 שגיאות לאחר אימות שחזוריות.

**ש: מה זה Application-Aware Processing ומתי משתמשים בו?**
ת: מנגנון (מבוסס VSS) שמבטיח גיבוי consistent ברמת האפליקציה (למשל SQL, Exchange, AD) - לא רק image-level, אלא גם טיפול נכון ב-Transaction Logs ו-quiescing של שירותים לפני ה-snapshot.

**ש: מה ההבדל בין CBT ל-RCT?**
ת: CBT (Changed Block Tracking) הוא מנגנון VMware לזיהוי בלוקים שהשתנו. RCT (Resilient Change Tracking) הוא המקבילה ב-Hyper-V. שניהם מאפשרים גיבוי אינקרementלי מהיר ללא סריקה מלאה.

**ש: מה זה Instant VM Recovery וכיצד הוא עובד טכנית?**
ת: יכולת להפעיל VM ישירות מקובץ הגיבוי דרך NFS/protocol וירטואלי, ללא צורך להעתיק אותו קודם ל-datastore. מספק RTO של דקות. לאחר מכן ניתן להעביר את ה-VM למיקום קבוע באמצעות Storage vMotion.

**ש: מהו Transport Mode, ומה ההבדלים בין השלושה העיקריים?**
ת: Direct Storage Access (הכי מהיר, קריאה ישירה מהאחסון), Hot-Add (הפרוקסי הוא VM שמצמיד את הדיסקים אליו), NBD (דרך רשת ניהול ESXi, הכי איטי אך תמיד עובד).

**ש: מה זה Immutability ולמה זה קריטי כיום?**
ת: תכונה שמונעת מחיקה או שינוי של קבצי גיבוי לתקופה מוגדרת, גם מחשבון עם הרשאות אדמין מלאות. קריטי להגנה מפני תקיפות כופרה (Ransomware) שמנסות למחוק גיבויים לפני הצפנת הסביבה.

## רמה מתקדמת (Senior)

**ש: תארו תרחיש שבו Job נכשל עם CBT corruption - כיצד תאבחנו ותפתרו?**
ת: אזהה זאת דרך הודעת "Reset CBT" בלוג ה-Job. זה מנגנון הגנה, לא תקלה קריטית - Veeam יבצע Full read חד-פעמי ואז יחזור לקצב רגיל. אם זה קורה חוזר ונשנה, אבדוק snapshots תקועים או בעיות storage-level שגורמות ל-CBT API להחזיר נתונים לא עקביים.

**ש: כיצד הייתם מתכננים אסטרטגיית Backup עבור סביבה עם 500 VMs ודרישת RPO של 4 שעות?**
ת: הייתי מחלק ל-Jobs לפי Tier/עדיפות עסקית, פורס מספר Proxies למקביליות, משתמש ב-SOBR עם Performance ו-Capacity Tiers, ומגדיר Backup Copy Jobs עם Immutability. ל-RPO של 4 שעות אשקול גם CDP לעומסים הקריטיים ביותר.

**ש: מה ההבדל בין Failover, Planned Failover ו-Failback?**
ת: Failover הוא תגובה לכשל בלתי צפוי (עלול לאבד נתונים מהרגע האחרון של הסנכרון). Planned Failover הוא מעבר מבוקר עם סנכרון אחרון לפני המעבר (אפס אובדן נתונים). Failback הוא החזרת העומס לאתר המקורי, תוך סנכרון רק ההפרשים.

**ש: כיצד תבנו אסטרטגיית הגנה מפני כופרה (Ransomware) עם Veeam?**
ת: אשלב Immutable Backups (S3 Object Lock/Hardened Linux Repository), הפרדת רשת בין Backup Server לסביבת הייצור, MFA לגישה לקונסולה, 4-eyes authorization למחיקת גיבויים, סריקת Malware על נקודות שחזור לפני שחזור (Threat Center/SecureRestore), וכמובן כלל 3-2-1-1-0 מלא.

**ש: מהו Hardened Repository וכיצד הוא שונה מ-Repository רגיל?**
ת: Repository מבוסס Linux עם הגדרות אבטחה מחוזקות - immutability ברמת מערכת הקבצים (XFS עם Immutable flag), SSH מושבת לאחר ההגדרה הראשונית, ו-append-only writes - מונע גישה אפילו מ-root לשנות קבצים קיימים בטווח ה-Immutability.

**ש: הסבירו את ההבדל בין Backup ל-Archive Tier ב-SOBR, ומתי כדאי להשתמש בכל אחד.**
ת: Performance Tier משמש לגיבויים "חמים" (restore points אחרונים, גישה מהירה). Capacity Tier (בדרך כלל Object Storage) משמש לעלות נמוכה יותר לטווח בינוני. Archive Tier (Glacier/Archive-class storage) משמש לשמירה ארוכת טווח וזולה במיוחד, עם זמני שחזור ארוכים יותר (compliance/legal hold).

**ש: כיצד הייתם מתמודדים עם Backup Window שחורג מהזמן המוקצב?**
ת: הייתי בודק אם ניתן להוסיף Proxies למקביליות, לעבור ל-Incremental Forever עם Synthetic Full (במקום Active Full), לבדוק Bottlenecks (Source/Proxy/Network/Target) דרך Job Statistics, ולשקול פיצול Jobs לחלונות זמן שונים.

## שאלות תרחיש (Scenario-Based)

**ש: לקוח מדווח שקובץ קריטי נמחק בטעות לפני שעתיים. מה תעשו?**
ת: אשתמש ב-File Level Restore (או Guest File Restore) מנקודת השחזור האחרונה שלפני המחיקה, ואבחר Restore to original location או Copy to a different location לפי הצורך, מבלי להשפיע על שאר קבצי ה-VM.

**ש: כל ה-Backup Jobs נכשלים בו-זמנית עם שגיאת "connection timeout" ל-Repository. מה סדר הבדיקות שלכם?**
ת: 1) בדיקת חיבור רשת בסיסי (ping/telnet לפורט) 2) בדיקת שירותי Veeam Data Mover על ה-Repository 3) בדיקת שטח פנוי ומצב הדיסק 4) בדיקת Firewall/Antivirus חוסם 5) בדיקת לוגים מקומיים בשרת ה-Repository.

## טיפים לראיון עבודה

1. **תרגלו על סביבת Lab** (Community Edition חינמית) - מעסיקים אוהבים שמישהו התנסה בפועל, לא רק קרא.
2. **הכירו מונחים באנגלית** - רוב הראיונות והתיעוד באנגלית גם בישראל.
3. **הכינו דוגמה אישית** - "ספר לי על תקלה שפתרת" - הכינו סיפור אמיתי או מתורגל מה-Lab.
4. **הבינו את ה"למה" לא רק את ה"איך"** - מראיינים בכירים בודקים הבנת principles (RPO/RTO, 3-2-1) ולא רק לחיצות בממשק.

## קישורים חיצוניים

### תיעוד רשמי
- Veeam Certified Engineer (VMCE) - תוכנית הסמכה רשמית: https://www.veeam.com/certification-training-veeam-certified-engineer.html
- Veeam Help Center: https://helpcenter.veeam.com/

### YouTube
- קורס מלא להכנה מעשית: https://www.youtube.com/playlist?list=PLeqch-0_f39EbG5MsJfuX9DMDuQYdea-1
- ערוץ Veeam הרשמי: https://www.youtube.com/channel/UC5YkxcYCG5b-fCcvHniW_ag

---

**חזרה למדריך הקודם:** [08 - פתרון בעיות נפוצות](/veeam/08-troubleshooting/)
**המשך למדריך הבא:** [10 - טיפים, טריקים ופרקטיקות מומלצות](/veeam/10-tips-tricks/)
