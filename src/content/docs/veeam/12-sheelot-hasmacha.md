---
title: "שאלות קשות ברמת הסמכה (VMCE)"
category: Veeam
part: 12/10
---

מבחן אינטראקטיבי ברמת קושי גבוהה, בסגנון שאלות הסמכת <strong>Veeam Certified Engineer (VMCE)</strong> - בניגוד למבחן החזרה הכללי בפרק הקודם, כאן כל שאלה בודקת נקודה עדינה ומטעה שדורשת הבנה אמיתית של מנגנוני הפנים של Veeam Backup &amp; Replication (שרשראות גיבוי, SOBR, Instant Recovery, Failback, Immutability ועוד), לא רק שינון. בחרו תשובה ותקבלו מיד משוב עם הסבר מפורט.

<div id="quiz-score" class="quiz-score">ענית נכון על 0 מתוך 10</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>1. מהו ההבדל המרכזי בין שרשרת גיבוי <code>Forward Incremental</code> לשרשרת <code>Reverse Incremental</code>, ומה ההשפעה על עומס ה-I/O ברפוזיטורי בכל ריצה?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. Forward Incremental "מגלגל" בכל ריצה את קובץ ה-Full קדימה, ואילו Reverse Incremental שומר כל ריצה כקובץ VIB עצמאי ונפרד</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. Forward Incremental שומר Full ראשוני ולאחריו קובצי VIB עוקבים שמכילים רק את ההבדלים - עומס I/O נמוך יחסית בכל ריצה. Reverse Incremental בכל ריצה ממזג את הבלוקים החדשים לתוך קובץ ה-VBK עצמו ויוצר קובץ Rollback עם המידע הישן, כך שה-VBK תמיד מכיל את הגיבוי העדכני ביותר - אך המיזוג דורש קריאה וכתיבה של כמות דאטה גדולה משמעותית בכל ריצה, ולכן מייצר עומס I/O גבוה יותר על הרפוזיטורי</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. אין שום הבדל בעומס ה-I/O בין שתי השיטות</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. Reverse Incremental אינו נתמך יותר בגרסאות עדכניות של Veeam Backup &amp; Replication</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> ב-Forward Incremental יש Full ראשוני וקבצי VIB עוקבים שכל אחד מהם מכיל רק את מה שהשתנה - כתיבה קטנה יחסית בכל ריצה, אך שרשרת השחזור מתארכת ודורשת Synthetic/Active Full מדי פעם. ב-Reverse Incremental כל ריצה ממזגת את השינויים החדשים לתוך ה-VBK הקיים ו"מגלגלת אחורה" את הנתונים הישנים לקובץ Rollback נפרד - כך שה-Full תמיד עדכני ומאפשר שחזור מיידי, אך המיזוג דורש הרבה יותר קריאה/כתיבה בכל ריצה, ולכן עומס I/O גבוה יותר על הרפוזיטורי.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>2. מהי תכלית מדיניות <code>GFS</code> (Grandfather-Father-Son) ב-<code>Backup Copy Job</code>, ובמה היא שונה מה-Retention הרגיל (Short-Term) של אותו Job?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. GFS מחליפה לחלוטין את ה-Retention הרגיל, כך שכל הנקודות היומיות נמחקות ברגע שמופעל GFS</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. GFS מגדירה שמירה ארוכת-טווח נפרדת - נקודות Full שמסומנות כ-Weekly/Monthly/Yearly ונשמרות באופן עצמאי מרשימת נקודות ה-Short-Term הרגילות; כך גם כשגיבויי ה-Short-Term מתגלגלים ונמחקים לפי מדיניות ה-Retention השוטפת, נקודות ה-GFS נשארות לפי לוח הזמנים הארוך-טווח שהוגדר להן</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. GFS משפיע אך ורק על גיבויי מכונות פיזיות ולא רלוונטי ל-VMs</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. GFS מחייב הקמת רפוזיטורי נפרד לחלוטין, שאינו יכול לשמש גם את גיבויי ה-Short-Term</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> ב-Backup Copy Job אפשר להגדיר Short-Term Retention (מספר נקודות שחזור רגילות) לצד מדיניות GFS נפרדת - נקודות Full ייעודיות שמסומנות כשבועיות/חודשיות/שנתיות ונשמרות לפי לוח זמנים משלהן, ללא תלות בגלגול ה-Retention הרגיל. כך אפשר לשמור עותק שבועי/חודשי/שנתי ארוך-טווח לצרכי ארכיון/Compliance, בלי לשמור את כל הנקודות היומיות לתקופה ארוכה שכזו.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>3. ב-<code>Scale-Out Backup Repository</code> (SOBR), מתי בפועל "עולה" גיבוי מה-<code>Performance Tier</code> ל-<code>Capacity Tier</code>?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. באופן אוטומטי בלבד, ולא ניתן להגדיר לכך שום מדיניות</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. לפי מדיניות Offload שמוגדרת מראש (למשל "העבר נקודות שחזור/GFS שגילן מעל N ימים") - ברגע שנקודת שחזור חוצה את סף הגיל שהוגדר, ה-SOBR מעביר (Move) או משכפל (Copy) אותה אל ה-Capacity Tier (אחסון אובייקטים כגון S3/Azure Blob), בעוד ה-Performance Tier ממשיך לשמש לגיבויים "טריים" הדורשים ביצועים מהירים</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. Capacity Tier תמיד מחזיק עותק מלא וזהה של כל מה שנמצא ב-Performance Tier במקביל, ולא מדובר בהעברה כלל</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. ההעברה מתבצעת אך ורק כאשר ה-Performance Tier מתמלא לגמרי ל-100% מקיבולתו</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> ה-Offload ל-Capacity Tier ב-SOBR פועל לפי מדיניות מוגדרת מראש (Operational Window / גיל נקודות שחזור, כולל טיפול נפרד בנקודות GFS), ולא באופן שרירותי או רק כשהאחסון מתמלא. ניתן לבחור מצב Move (הזזה בלבד) או Copy (שכפול לשני המקומות), כדי לאזן בין עלות אחסון זולה ל-Capacity Tier לבין ביצועים מהירים ב-Performance Tier לגיבויים העדכניים.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>4. כיצד עובד <code>Instant VM Recovery</code>, ומה קורה בפועל בשלב הביניים לפני שה-VM חוזר לרוץ מאחסון פרודקשן קבוע?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. Veeam מעתיק תחילה את כל קובץ ה-VBK במלואו לדאטהסטור הפרודקשן, ורק לאחר שההעתקה מסתיימת ה-VM עולה לעבודה</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. Veeam "מפרסם" את ה-VM ישירות מתוך קובץ הגיבוי דרך datastore זמני (vPower NFS), כך שה-VM עולה תוך דקות בלי לחכות לשחזור מלא; לאחר מכן, ברקע, ניתן לבצע Migration/Storage vMotion כדי להעביר אותו סופית לאחסון הפרודקשן הקבוע - ריצה ישירה מתוך קובץ הגיבוי איטית יחסית מבחינת ביצועי I/O, ולכן זהו פתרון גישור זמני ולא קבוע</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. Instant VM Recovery נתמך אך ורק בשחזור אל תוך סביבת Azure</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. לאחר Instant VM Recovery אין אפשרות להעביר את ה-VM חזרה לאחסון פרודקשן - הוא חייב להישאר קבוע על הרפוזיטורי</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> Instant VM Recovery מפרסם את ה-VM ישירות מתוך קובץ הגיבוי, כך שהוא עולה לעבודה תוך דקות במקום להמתין לשחזור מלא של כל הדיסקים. מכיוון שה-I/O רץ מול קובץ הגיבוי ברפוזיטורי (ולא אחסון פרודקשן מהיר), הביצועים נמוכים יחסית, ולכן זהו פתרון זמני להמשכיות עסקית - שלב ה-Migration ברקע (Quick Migration/Storage vMotion) הוא זה שמעביר את ה-VM בחזרה לאחסון פרודקשן קבוע בלי השבתה נוספת.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>5. למה נדרש <code>Application-Aware Processing</code> בגיבוי שרתי Active Directory או SQL Server, ואיזה מנגנון עומד מאחוריו?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. הוא רק מוסיף תגית מטא-דאטה לקובץ הגיבוי, ולמעשה לא נוגע בתהליך היצירה של ה-snapshot עצמו</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. הוא משתמש ב-<code>VSS</code> (Volume Shadow Copy Service) כדי להקפיא לרגע את מצב האפליקציה/מסד הנתונים ולוודא snapshot עקבי מבחינה טרנזקציונית (Transactionally Consistent); ולאחר יצירת ה-snapshot יכול גם לבצע חיתוך (truncation) של לוגים - למשל SQL transaction logs - כדי לאפשר בהמשך שחזור ברמת אובייקט/טרנזקציה</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. הוא רלוונטי אך ורק למכונות מבוססות Linux</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. הפעלתו מבטלת את הצורך ב-Changed Block Tracking בריצות הבאות של אותו job</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> בלי Application-Aware Processing, snapshot רגיל עלול לתפוס את מסד הנתונים/AD במצב לא עקבי (Crash-Consistent בלבד) - טרנזקציות באמצע, קבצי לוג לא מסונכרנים עם קבצי הדאטה. VSS מתאם עם ה-Writers הרלוונטיים בתוך ה-Guest OS כדי להקפיא את המצב לרגע ולהבטיח עקביות טרנזקציונית מלאה (Application-Consistent), ומאפשר גם חיתוך לוגים לאחר גיבוי מוצלח - קריטי לשחזור נכון של SQL/Exchange/Active Directory.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>6. מה מאפשר <code>Veeam Explorer</code> (למשל עבור Exchange), בהשוואה לביצוע Full VM Restore רגיל?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. הוא מאפשר לשחזר רק את כל שרת ה-Exchange כמכלול, ולא תומך בשום רזולוציה גרנולרית יותר</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. הוא מאפשר גישה ישירה לתוכן ה-Mailbox Database בתוך קובץ הגיבוי ושחזור פריטים בודדים - תיבת מייל, הודעה בודדת, תיקייה או יומן - עד לרמת פריט אחד, ישירות לתיבה המקורית, לתיבה אחרת, או ליצוא כקובץ PST - בלי לבצע Full VM Restore ובלי להריץ VM זמני של כל שרת ה-Exchange</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. השימוש בו אפשרי רק כאשר Application-Aware Processing היה מבוטל בזמן הגיבוי</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. הוא דורש רישיון Veeam ONE נפרד ואינו כלול ברישוי VBR</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> ה-Explorers הגרנולריים (Exchange, Active Directory, SQL, Oracle וכו') קוראים ישירות מתוך קובץ הגיבוי ומציגים למשתמש את מבנה האובייקטים הפנימי, כך שאפשר לשחזר פריט בודד (תיבת מייל, משתמש ב-AD, טבלה ב-SQL) בלי לשחזר את כל ה-VM ובלי להפעיל VM זמני - חוסך זמן שחזור משמעותי ומקטין את ההשפעה על הסביבה. השימוש בהם מבוסס על כך שהגיבוי בוצע עם Application-Aware Processing מופעל, לא מבוטל.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>7. בתהליך <code>Failback</code> לאחר <code>Failover</code> ל-Replica, מה קורה לשינויים שנוצרו בזמן שהעומס רץ בפועל על שרת היעד?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. כל השינויים שנעשו על ה-Replica בזמן ה-Failover אובדים תמיד, וה-Failback פשוט מחזיר את המצב כפי שהיה לפני ה-Failover</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. Veeam מזהה את ההבדלים (delta) שנוצרו על ה-Replica בזמן שרץ כ-production, ובתהליך ה-Failback מבצע סנכרון של אותם שינויים בלבד בחזרה אל שרת המקור (או שרת חלופי) - כך שהנתונים שנוצרו במהלך תקופת ה-Failover לא הולכים לאיבוד; בסיום יש שלב <code>Commit Failback</code> נפרד שמוודא שהמעבר הצליח לפני שממשיכים לעבוד מהמקור באופן קבוע</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. השינויים מועברים אך ורק באופן ידני ע"י מנהל המערכת, ללא כל תמיכה אוטומטית מצד Veeam</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. Failback מתבצע אוטומטית ומיידית ברגע ש-Failover מתחיל, ללא אפשרות לבדוק את תקינות שרת המקור לפני החזרה</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> Failback לא "שוכח" את מה שקרה בזמן ה-Failover - Veeam מסנכרן את השינויים שנצברו על ה-Replica בחזרה אל שרת המקור (או יעד חלופי אם המקור נהרס). לאחר הסנכרון יש שלב Commit Failback ייעודי, שבו מאשרים שהעבודה חוזרת רשמית למקור ורק אז ה-Replica חוזר להיות יעד DR פסיבי - כך נמנע מצב של אובדן נתונים או Split-Brain בין שני הצדדים.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>8. מדוע Immutability (בין אם ב-<code>Hardened Repository</code> מבוסס Linux ובין אם ב-Capacity Tier מבוסס אובייקטים) מגן מפני תקיפת כופרה גם כאשר לתוקף יש הרשאות Administrator מלאות במערכת הגיבוי?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. כי הגישה לרפוזיטורי חסומה תמיד מבחוץ ברמת חומת אש (Firewall) בלבד, ואין לכך שום קשר לאחסון עצמו</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. כי דגל ה-Immutability נאכף ברמת מערכת הקבצים/האחסון עצמו (למשל תכונת Immutable של XFS בלינוקס, או Object Lock בענן) לפרק זמן מוגדר מראש - ואף חשבון, כולל root או Administrator במערכת הגיבוי, אינו יכול למחוק או לשנות את הקובץ לפני שפג תוקף אותו פרק זמן, גם אם התוקף השיג שליטה מלאה על שרת ה-VBR</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. כי הקבצים מוצפנים אוטומטית ולכן אף אחד, כולל Veeam עצמו, לא יכול לקרוא אותם</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. כי Immutability מוחקת אוטומטית את כל הגיבויים הישנים בכל פעם שנוצר גיבוי חדש</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> הכוח של Immutability הוא שההגנה לא תלויה בהרשאות ברמת האפליקציה (VBR) אלא נאכפת עמוק יותר, ברמת מערכת הקבצים או שכבת האחסון עצמה. גם תוקף שהצליח להשיג הרשאות Administrator מלאות במערכת הגיבוי, או אפילו הרשאות root על שרת הלינוקס, לא יכול לעקוף את הנעילה לפני שחלף פרק הזמן שהוגדר - זו ההגנה המרכזית מפני כופרה שמנסה למחוק גם את הגיבויים ולא רק את הסביבה החיה.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>9. מדוע <code>SureBackup Job</code> מריץ את ה-VMs המשוחזרים בתוך <code>Virtual Lab</code> מבודד, ומה תפקידה של רשת ה-Masquerading (Proxy Appliance) שם?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. הבידוד נועד אך ורק לחסוך בעלויות רישוי Veeam</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. הבידוד מאפשר להפעיל VMs שהם עותקים מהגיבוי (עם אותם IP/שם מכונה כמו בפרודקשן) בלי להתנגש עם הרשת החיה; רשת ה-Masquerading, באמצעות Proxy Appliance, "מדמה" עבור ה-VM המבודד גישה למשאבי פרודקשן (למשל DNS/Domain Controller) בלי ליצור בפועל חיבור ישיר לרשת האמיתית - כך אפליקציות תלויות (כמו אתר שתלוי במסד נתונים) יכולות לעבור בדיקות Heartbeat/Ping/Application מבלי לסכן את סביבת הפרודקשן</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. תפקידה היחיד הוא לבצע דחיסה נוספת של קובצי הגיבוי לפני הבדיקה</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. הבידוד קיים כדי למנוע הרצה של יותר מ-job אחד בו-זמנית על אותו שרת</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> אם היינו מפעילים VM משוחזר עם אותה כתובת IP ואותו שם מכונה כמו המקור ישירות ברשת הפרודקשן, היינו מקבלים התנגשות (conflict). ה-Virtual Lab מבודד את הרשת, ורשת ה-Masquerading/Proxy Appliance מאפשרת ל-VM המבודד "לדבר" בעקיפין עם שירותים קריטיים בפרודקשן (כמו DNS) לצורך בדיקות תלות, בלי ליצור בפועל חיבור ישיר מסוכן - כך SureBackup יכול לבדוק Application Group שלם (למשל DC ואז שרת אפליקציה שתלוי בו) בביטחון מלא.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>10. מהי אחת המגבלות הטכניות המרכזיות של <code>Synthetic Full Backup</code>, שחשוב להכיר לקראת מבחן VMCE?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. Synthetic Full מבטל לחלוטין את הצורך בגיבוי Full ראשוני (Active Full) - אפשר להתחיל שרשרת גיבוי חדשה ישירות מ-Synthetic Full</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. התהליך מתבצע כולו בצד הרפוזיטורי (לא בצד המקור), ודורש שהרפוזיטורי יקרא, ימזג ויכתוב מחדש את בלוקי הדאטה מה-Full ומה-Incrementals הקיימים ליצירת קובץ VBK חדש - לכן דורש משאבי I/O ומקום אחסון פנוי משמעותיים על הרפוזיטורי (טכנולוגיות כמו Per-VM Backup Chains ו-Fast Clone/block cloning יכולות לצמצם את העלות), אך לעומת זאת אינו יוצר כלל עומס נוסף על סביבת הפרודקשן או על ה-VM המקורי</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. Synthetic Full אינו נתמך על רפוזיטורי מבוסס Windows, אלא רק על רפוזיטורי מבוסס Linux</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. Synthetic Full דורש חיבור רציף ל-vCenter לאורך כל תהליך היצירה שלו</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> Synthetic Full בונה קובץ Full חדש מתוך קבצי גיבוי קיימים ברפוזיטורי, ולכן חייב שכבר תהיה שרשרת קיימת (Full + Incrementals) - אי אפשר להתחיל איתו שרשרת גיבוי חדשה. יתרונו הגדול הוא שהוא לא נוגע כלל בסביבת המקור (אין קריאה נוספת מה-VM), אך המחיר הוא עומס I/O ומקום אחסון משמעותיים על הרפוזיטורי עצמו - תכונות כמו Per-VM Chains ו-Fast Clone (על ReFS/XFS) עוזרות לצמצם את העלות הזו.</div>
</div>

<button type="button" id="quiz-reset-all" class="quiz-reset-all">אפס את כל המבחן</button>

<style>
.quiz-score {
  font-weight: 600;
  font-size: 1.05em;
  padding: 0.6rem 1rem;
  margin-bottom: 1.5rem;
  border-radius: 8px;
  background: var(--sl-color-gray-6);
  border: 1px solid var(--sl-color-hairline);
  position: sticky;
  top: 0.5rem;
  z-index: 1;
}

.quiz-card {
  border: 1px solid var(--sl-color-hairline);
  border-radius: 10px;
  padding: 1rem 1.25rem;
  margin: 1.25rem 0;
  background: var(--sl-color-bg-nav);
}

.quiz-question {
  margin-top: 0;
  margin-bottom: 0.75rem;
}

.quiz-options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.quiz-option {
  display: block;
  width: 100%;
  text-align: right;
  padding: 0.55rem 0.8rem;
  border-radius: 8px;
  border: 1px solid var(--sl-color-hairline);
  background: var(--sl-color-bg);
  color: var(--sl-color-text);
  cursor: pointer;
  font: inherit;
  line-height: 1.5;
  transition: background-color 0.15s ease, border-color 0.15s ease;
}

.quiz-option:hover:not(:disabled) {
  border-color: var(--sl-color-accent);
  background: var(--sl-color-gray-6);
}

.quiz-option:disabled {
  cursor: default;
}

.quiz-option--correct {
  border-color: var(--sl-color-green);
  background: color-mix(in srgb, var(--sl-color-green) 18%, var(--sl-color-bg));
  color: var(--sl-color-text);
}

.quiz-option--incorrect {
  border-color: var(--sl-color-red);
  background: color-mix(in srgb, var(--sl-color-red) 18%, var(--sl-color-bg));
  color: var(--sl-color-text);
}

.quiz-result {
  margin-top: 0.6rem;
  font-weight: 600;
  min-height: 1.2em;
}

.quiz-result--correct {
  color: var(--sl-color-green-high, var(--sl-color-green));
}

.quiz-result--incorrect {
  color: var(--sl-color-red-high, var(--sl-color-red));
}

.quiz-explain {
  display: none;
  margin-top: 0.6rem;
  padding: 0.7rem 0.9rem;
  border-radius: 8px;
  background: var(--sl-color-gray-6);
  font-size: 0.92em;
}

.quiz-card--answered .quiz-explain {
  display: block;
}

.quiz-reset-all {
  margin-top: 0.5rem;
  padding: 0.5rem 1.2rem;
  border-radius: 8px;
  border: 1px solid var(--sl-color-hairline);
  background: var(--sl-color-bg-nav);
  color: var(--sl-color-text);
  cursor: pointer;
  font: inherit;
}

.quiz-reset-all:hover {
  border-color: var(--sl-color-accent);
}
</style>

<script>
(function () {
  function initQuiz() {
    var cards = document.querySelectorAll('.quiz-card');
    var scoreEl = document.getElementById('quiz-score');
    var resetAllBtn = document.getElementById('quiz-reset-all');

    function updateScore() {
      if (!scoreEl) return;
      var correctCount = document.querySelectorAll('.quiz-card--answered[data-was-correct="true"]').length;
      scoreEl.textContent = 'ענית נכון על ' + correctCount + ' מתוך ' + cards.length;
    }

    function answerCard(card, chosenBtn) {
      var correct = card.getAttribute('data-answer');
      var chosen = chosenBtn.getAttribute('data-choice');
      var isCorrect = chosen === correct;

      card.classList.add('quiz-card--answered');
      card.setAttribute('data-was-correct', isCorrect ? 'true' : 'false');

      var options = card.querySelectorAll('.quiz-option');
      options.forEach(function (opt) {
        opt.disabled = true;
        if (opt.getAttribute('data-choice') === correct) {
          opt.classList.add('quiz-option--correct');
        } else if (opt === chosenBtn) {
          opt.classList.add('quiz-option--incorrect');
        }
      });

      var result = card.querySelector('.quiz-result');
      if (result) {
        result.textContent = isCorrect ? '✅ נכון!' : '❌ לא נכון - התשובה הנכונה מסומנת בירוק.';
        result.classList.remove('quiz-result--correct', 'quiz-result--incorrect');
        result.classList.add(isCorrect ? 'quiz-result--correct' : 'quiz-result--incorrect');
      }

      updateScore();
    }

    function resetCard(card) {
      card.classList.remove('quiz-card--answered');
      card.removeAttribute('data-was-correct');
      var options = card.querySelectorAll('.quiz-option');
      options.forEach(function (opt) {
        opt.disabled = false;
        opt.classList.remove('quiz-option--correct', 'quiz-option--incorrect');
      });
      var result = card.querySelector('.quiz-result');
      if (result) {
        result.textContent = '';
        result.classList.remove('quiz-result--correct', 'quiz-result--incorrect');
      }
    }

    cards.forEach(function (card) {
      card.querySelectorAll('.quiz-option').forEach(function (btn) {
        btn.addEventListener('click', function () {
          if (card.classList.contains('quiz-card--answered')) return;
          answerCard(card, btn);
        });
      });
    });

    if (resetAllBtn) {
      resetAllBtn.addEventListener('click', function () {
        cards.forEach(resetCard);
        updateScore();
      });
    }

    updateScore();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initQuiz);
  } else {
    initQuiz();
  }
})();
</script>
