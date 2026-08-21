---
title: "מדריך 12: שאלות קשות ברמת הסמכה (AZ-800/AZ-801)"
description: "מבחן אמריקאי אינטראקטיבי ברמת הסמכה Microsoft Certified: Windows Server Hybrid Administrator Associate."
---

מבחן אינטראקטיבי ברמת קושי גבוהה, בסגנון שאלות הסמכת **Microsoft Certified: Windows Server Hybrid Administrator Associate (AZ-800/AZ-801)** - בניגוד למבחן החזרה הכללי בפרק הקודם, כאן כל שאלה בודקת נקודה עדינה ומטעה שדורשת הבנה אמיתית של מנגנוני הפנים של Windows Server (FSMO, Clustering, Storage Spaces, Hybrid Identity ועוד), לא רק שינון. בחרו תשובה ותקבלו מיד משוב עם הסבר מפורט.

<div id="quiz-score" class="quiz-score">ענית נכון על 0 מתוך 10</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>1. שרת ה-<code>PDC Emulator</code> בדומיין קורס ולא זמין למשך כמה שעות, ואף DC אחר עדיין לא תפס את התפקיד. מה קורה בפועל בדומיין באותו זמן?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. כל תהליכי האימות (Authentication) בדומיין נעצרים לחלוטין עד שהתפקיד יועבר</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. משתמשים ממשיכים להתחבר דרך בקרי דומיין אחרים כרגיל, אך נפגעים סנכרון השעון בדומיין (שמבוסס היררכית על ה-PDC Emulator), עדכון דחוף של שינויי סיסמה בין DCs, ועיבוד נעילות חשבון - עד שהתפקיד ייתפס (Seize) ידנית לבקר אחר</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. Active Directory מוחק אוטומטית את כל האובייקטים בפורest אם ה-PDC Emulator לא זמין מעל שעה</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. שאר בקרי הדומיין הופכים אוטומטית ל-Read-Only עד לתיקון התקלה</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> תפקידי FSMO (וביניהם ה-PDC Emulator) הם Operations Masters - כלומר תפקיד יחיד ולא מבוזר, אבל אובדנו הזמני <strong>לא</strong> עוצר את פעולת הדומיין. שאר בקרי הדומיין ממשיכים לאמת משתמשים ללא בעיה. מה שכן נפגע: היררכיית סנכרון השעון בדומיין (שמושרשת ב-PDC Emulator), עדכון מיידי (Urgent Replication) של שינויי סיסמה כדי שמשתמש שהחליף סיסמה יוכל להתחבר מיד מכל בקר, ועיבוד ריכוזי של נעילות חשבון. אם השרת לא צפוי לחזור, יש להעביר את התפקיד בכוח (<code>Seize</code>) לבקר אחר.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>2. מה ההבדל המהותי בין <code>Secondary Zone</code> ל-<code>Stub Zone</code> ב-DNS מבחינת הרשומות שהן מחזיקות בפועל?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. אין הבדל אמיתי - שני הסוגים מחזיקים תמיד עותק מלא וזהה של כל רשומות ה-Zone</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. <code>Secondary Zone</code> מחזיקה עותק מלא לקריאה בלבד של כל רשומות המשאבים, המתקבל ומתעדכן דרך <code>Zone Transfer</code> מה-Primary; <code>Stub Zone</code> מחזיקה רק את רשומות ה-NS, ה-SOA ורשומות ה-Glue (A) של שרתי השם המוסמכים ל-Zone - לא את שאר הרשומות</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. <code>Stub Zone</code> ניתנת לעריכה ישירה בעוד <code>Secondary Zone</code> היא לקריאה בלבד</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. <code>Secondary Zone</code> קיימת רק ב-Zones המשולבות ב-AD (AD-Integrated) בעוד <code>Stub Zone</code> קיימת רק ב-Zones רגילות</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> שתי הזונות הן קריאה-בלבד ומתעדכנות דרך <code>Zone Transfer</code> (AXFR מלא או IXFR תוספתי) מה-Primary, אבל בהיקף שונה לגמרי: <code>Secondary Zone</code> מיועדת לשרידות/עומס ומחזיקה עותק מלא של כל הרשומות. <code>Stub Zone</code>, לעומת זאת, מחזיקה רק "כתובת ליצירת קשר" - NS, SOA ו-Glue Records - כדי שהשרת ידע להפנות שאילתות ישירות לשרתים המוסמכים לאותה זונה, בלי לשכפל את כל תוכן הזונה עצמה. זה שימושי במיוחד לשמירה על מסלולי הפניה עדכניים בין דומיינים/פורests בלי עומס רפליקציה מיותר.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>3. ארגון רוצה להגדיר <code>DHCP Failover</code> בין שרת במשרד הראשי לשרת בסניף שחזור אסונות (DR) מרוחק, כך שהשרת בסניף ה-DR לא יעניק כתובות כלל כל עוד השרת הראשי פעיל. איזו תצורה מתאימה, ומהו הפרמטר שקובע כמה זמן השרת השני ימתין לפני שהוא תופס את מלוא טווח הכתובות?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. <code>Load Balance</code>; הפרמטר הרלוונטי הוא <code>Load Balance Percentage</code></button>
    <button class="quiz-option" type="button" data-choice="ב">ב. <code>Hot Standby</code>; הפרמטר הוא <code>Maximum Client Lead Time (MCLT)</code> - קובע כמה זמן השרת ה-Standby צריך להמתין לאחר שנקבע שהשותף נפל, לפני שהוא מניח שליטה מלאה על כל טווח הכתובות</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. <code>Hot Standby</code>; הפרמטר הוא זמן קבוע של 5 דקות שאינו ניתן לשינוי</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. <code>Load Balance</code>; אין שום פרמטר רלוונטי כי החלוקה תמיד קבועה ל-50/50</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> <code>Hot Standby</code> מתאים בדיוק לתרחיש של אתר ראשי פעיל ואתר DR שממתין בצל, בניגוד ל-<code>Load Balance</code> שמתאים לשני שרתים באותו אתר שמשרתים לקוחות במקביל. הפרמטר הקריטי הוא <code>Maximum Client Lead Time (MCLT)</code>, ברירת המחדל שעה אחת - הוא קובע כמה זמן על השרת ה-Standby להמתין אחרי שהוא מזהה שהשותף לא זמין, לפני שהוא מרשה לעצמו להקצות כל כתובת בטווח (ולא רק כתובות שהוא בטוח שלא נמסרו כבר ע"י השותף שנפל).</div>
</div>

<div class="quiz-card" data-answer="ג">
  <p class="quiz-question"><strong>4. מדוע <code>Parity</code> ב-Storage Spaces נחשב למתאים פחות לעומסי עבודה עם הרבה כתיבות אקראיות (כמו מסדי נתונים טרנזקציוניים), בהשוואה ל-<code>Mirror</code>?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. <code>Parity</code> לא מספק כל הגנה מפני כשל דיסק פיזי, בדיוק כמו <code>Simple</code></button>
    <button class="quiz-option" type="button" data-choice="ב">ב. <code>Parity</code> דורש מינימום 7 דיסקים פיזיים ולכן כמעט אף פעם לא ישים</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. כל כתיבה ב-<code>Parity</code> מחייבת חישוב וכתיבה של נתוני זוגיות (Parity) על פני מספר דיסקים, מה שפוגע משמעותית בביצועי כתיבה אקראית בהשוואה ל-<code>Mirror</code> שכותב את הנתונים ישירות לשני עותקים במקביל</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. אין הבדל ביצועים משמעותי בין <code>Parity</code> ל-<code>Mirror</code> בשום תרחיש</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> <code>Parity</code> (בדומה ל-RAID5/6) חוסך שטח אחסון יחסית ל-<code>Mirror</code>, אך המחיר הוא ביצועי כתיבה אקראית נמוכים בהרבה - כל כתיבה מצריכה חישוב ועדכון נתוני זוגיות על פני כמה דיסקים. לכן <code>Parity</code> מומלץ בעיקר לעומסי ארכיון/קריאה עתירה וכתיבה סדרתית (כמו גיבויים או מדיה), בעוד <code>Mirror</code> (2-Way או 3-Way) מתאים לעומסים טרנזקציוניים עם כתיבות אקראיות תכופות, במחיר של פחות יעילות אחסון.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>5. מה ההבדל המרכזי מבחינת סיכון לאובדן נתונים, בין <code>Planned Failover</code> ל-<code>Unplanned Failover</code> ב-Hyper-V Replica?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. אין הבדל - שני סוגי ה-Failover תמיד ללא אובדן נתונים כלל</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. <code>Planned Failover</code> דורש כיבוי מסודר של ה-VM המקורי ומבצע שכפול אחרון לפני המעבר - ולכן ללא אובדן נתונים; <code>Unplanned Failover</code> מתבצע כשה-Primary כבר לא זמין כלל, ומשתמש בעותק האחרון שהצליח להגיע - ולכן עלול לגרום לאובדן נתונים בהתאם לתדירות השכפול שהוגדרה (למשל כל 5 דקות)</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. <code>Unplanned Failover</code> תמיד מהיר ובטוח יותר, ולכן מומלץ להשתמש בו גם לתחזוקה מתוכננת</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. <code>Planned Failover</code> אפשרי רק כששני האתרים כבר מנותקים לחלוטין זה מזה</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> <code>Planned Failover</code> מיועד לתחזוקה יזומה: מכבים את ה-VM המקורי בצורה מסודרת, המערכת משכפלת את השינוי האחרון, ורק אז מעבירה את תפקיד ה-Primary לאתר השני - ללא אובדן נתונים, וניתן להפוך (Reverse) בקלות. <code>Unplanned Failover</code> משמש כשה-Primary קרס בפועל ואי אפשר לכבות אותו מסודר, ולכן מסתמכים על העותק האחרון שהגיע דרך השכפול האסינכרוני - כל שינוי שבוצע אחרי נקודת השכפול האחרונה עלול ללכת לאיבוד.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>6. לאשכול Failover Clustering פרוס בשני אתרים גיאוגרפיים (Stretched Cluster) ללא אחסון משותף בין האתרים, וללא אתר שלישי פיזי להצבת <code>File Share Witness</code>. איזה סוג Witness מומלץ, ומדוע?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. <code>Disk Witness</code> משותף בין שני האתרים - תמיד הפתרון המועדף</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. <code>Cloud Witness</code> - משתמש בחשבון Azure Storage כזרוע הצבעה ניטרלית וזולה, ופותר את הצורך באתר שלישי פיזי בלי לדרוש עוד Datacenter</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. <code>File Share Witness</code> חייב להיות ממוקם דווקא באחד משני האתרים הקיימים</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. אין צורך ב-Witness כלשהו כשיש בדיוק שני אתרים באשכול</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> <code>Quorum</code> קובע כמה "קולות" נדרשים כדי לשמור את האשכול פעיל ולמנוע מצב Split-Brain. ב-Stretched Cluster בלי אחסון משותף, <code>Disk Witness</code> לא ישים כי הוא דורש דיסק המשותף לכל הצמתים. <code>File Share Witness</code> אפשרי, אך דורש אתר שלישי ניטרלי כדי לא להעדיף אחד מהאתרים במקרה של ניתוק ביניהם. <code>Cloud Witness</code>, שהוצג ב-Windows Server 2016, פותר בדיוק את הבעיה הזו - הוא משתמש בחשבון Azure Storage כ"קול" חיצוני ניטרלי, ללא צורך בתשתית שלישית פיזית נוספת.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>7. מדיניות האבטחה של הארגון אוסרת אחסון כל גיבוי (hash) של סיסמאות המשתמשים מחוץ לרשת הארגונית, אך הארגון לא רוצה לתחזק תשתית <code>Federation (AD FS)</code> מלאה ומורכבת. איזו שיטת אימות ב-<code>Azure AD Connect</code> מתאימה?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. <code>Password Hash Sync (PHS)</code> - הפתרון הפשוט ביותר ותמיד עונה על הדרישה</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. <code>Pass-through Authentication (PTA)</code> - האימות מתבצע בזמן אמת ישירות מול ה-AD המקומי דרך Agent, בלי לסנכרן שום hash של סיסמה לענן, ובלי לדרוש תשתית Federation מלאה</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. <code>Federation (AD FS)</code> - הפתרון היחיד שעונה על הדרישה, למרות המורכבות</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. אין דרך להימנע מסנכרון סיסמאות לענן ב-Azure AD Connect בכל תצורה</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> <code>Password Hash Sync</code> סותר את הדרישה כי הוא בדיוק כן שולח hash של הסיסמה (עוד hash, לא בטקסט גלוי, אך עדיין נתון סיסמה) ל-Azure AD. <code>Federation (AD FS)</code> אמנם לא שולח כלום, אבל דורש תשתית שרתי AD FS ו-Web Application Proxy מורכבת לתחזוקה. <code>Pass-through Authentication</code> הוא בדיוק האמצע: סוכן קל (Agent) מותקן על שרת מקומי מעביר את בקשת האימות ישירות ל-AD המקומי לבדיקה, ושום hash של סיסמה לא נשמר או מסונכרן לענן כלל.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>8. למשתמש יש הרשאת NTFS של <code>Full Control</code> על תיקייה ב-<code>D:\Data</code>, אך הרשאת Share על אותה תיקייה (<code>\\SRV1\Data</code>) מוגבלת ל-<code>Read</code> בלבד. המשתמש מתחבר ב-RDP ישירות לשרת ופותח את הנתיב המקומי <code>D:\Data</code> (ולא דרך ה-Share). מה תהיה ההרשאה בפועל?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. <code>Read</code> בלבד, כי הרשאת ה-Share חלה תמיד ללא קשר לאופן הגישה</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. <code>Full Control</code> - הרשאות Share נאכפות רק כשהגישה מתבצעת דרך נתיב הרשת (UNC/SMB); כשניגשים ישירות לנתיב המקומי בדיסק (גם בתוך RDP session על אותו שרת) הן לא רלוונטיות כלל, וההרשאה היחידה שקובעת היא NTFS</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. המערכת תחסום גישה לחלוטין בגלל הסתירה בין ההרשאות</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. ההרשאות תמיד מתמזגות לפי הליברלית מביניהן, גם בגישה מקומית וגם מרחוק</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> זו נקודה שרבים מפספסים: הרשאות Share הן מנגנון שחל אך ורק על ה"שער" של הגישה מרחוק דרך פרוטוקול SMB (נתיב UNC). ברגע שהגישה היא לנתיב המקומי בדיסק עצמו - בין אם יושבים פיזית על השרת ובין אם ב-RDP session שרץ על אותו שרת ופותח את <code>D:\Data</code> ישירות - הרשאת ה-Share כלל לא נבדקת, וההרשאה היחידה שקובעת היא NTFS. רק כשהגישה עוברת דרך <code>\\SRV1\Data</code> נבדקות שתי ההרשאות יחד, וה"מגביל ביותר" מנצח.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>9. מנהל מערכת מניח בטעות ש-<code>Windows Server Backup</code> תומך בשלושה סוגי גיבוי קלאסיים: Full, Incremental ו-Differential, בדיוק כמו בתוכנות גיבוי ותיקות. מהי הטעות בהנחה הזו?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. אין טעות - <code>Windows Server Backup</code> תומך במלואם בשלושת סוגי הגיבוי</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. <code>Windows Server Backup</code> תומך בפועל רק ב-Full (הגיבוי הראשון) וב-Incremental מבוסס-בלוקים (Block-Level) לגיבויים מתוזמנים הבאים תוך שימוש ב-VSS - אין בו אפשרות מובנית לגיבוי Differential קלאסי</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. <code>Windows Server Backup</code> תומך רק בגיבוי Full בלבד, ומריץ אותו מחדש מ-0 בכל פעם</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. <code>Windows Server Backup</code> תומך רק ב-Differential בלבד, ואין בו אפשרות ל-Full כלל</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> גיבוי מתוזמן ראשון ב-<code>Windows Server Backup</code> הוא תמיד Full (VSS Full Backup), וכל גיבוי מתוזמן אחריו הוא Incremental מבוסס-בלוקים שהשתנו מאז הריצה הקודמת. בניגוד לכלים ותיקים, אין ב-<code>Windows Server Backup</code> אפשרות מובנית לגיבוי Differential (המצטבר תמיד מול הגיבוי המלא האחרון). חשוב גם להכיר את <code>Bare Metal Recovery</code>: כדי לשחזר שרת שלם על חומרה חדשה יש לכלול בגיבוי את System State, Critical Volumes (כרך האתחול, כרך המערכת, ו-Boot volume) ולבצע את השחזור מתוך Windows RE או מדיית התקנה.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>10. מדוע ה-Replication בין <code>RODC (Read-Only Domain Controller)</code> לשאר בקרי הדומיין בפורest הוא Unidirectional (חד-כיווני) בלבד - כלומר אף DC כתיב אחר לעולם לא "מושך" שינויים מה-RODC?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. זו מגבלת רוחב פס בלבד, וניתן לשנות זאת בהגדרות הרפליקציה</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. כדי למנוע מצב שבו נתונים פגומים או זדוניים שהוזרקו ל-RODC (למשל בעקבות פריצה פיזית בסניף מרוחק) יופצו הלאה לשאר בקרי הדומיין הכתיבים בפורest - שינויים זורמים רק מ-DC כתיב אל ה-RODC, לעולם לא בכיוון ההפוך</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. RODC כלל לא תומך בפרוטוקול הרפליקציה של Active Directory</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. זו מגבלה זמנית בלבד שתוסר בעדכון גרסה עתידי</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> ה-RODC נועד בדיוק לתרחיש של סניף מרוחק עם אבטחה פיזית חלשה: הוא מחזיק עותק לקריאה-בלבד של מסד הנתונים, בדרך כלל בלי סיסמאות משתמשים בפועל (למעט אלו שהוגדרו במפורש ב-Password Replication Policy), ולא יכול להחזיק תפקידי FSMO. כדי להבטיח ששום שינוי - זדוני או תקין - שנעשה ישירות מול ה-RODC לא יזהם את שאר הפורest, הרפליקציה מוגדרת חד-כיוונית בלבד: מ-DC כתיב אל ה-RODC. כך גם אם ה-RODC נפרץ פיזית בסניף, הנזק נשאר מבודד ולא מתפשט לשאר בקרי הדומיין.</div>
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
