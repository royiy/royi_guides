---
title: "שאלות קשות ברמת הסמכה (CCNA / Network+)"
category: Networking
part: 12/10
---

מבחן אינטראקטיבי ברמת קושי גבוהה, בסגנון שאלות הסמכה אמיתיות המשלבות **Cisco CCNA** ו-**CompTIA Network+** - בניגוד למבחן החזרה הכללי בפרק הקודם, כאן כל שאלה בודקת נקודה עדינה ומטעה שדורשת הבנה אמיתית של המנגנון הפנימי (VLSM, STP, ניתוב, אבטחת VLAN ועוד), לא רק שינון הגדרות. בחרו תשובה ותקבלו מיד משוב עם הסבר מפורט.

<div id="quiz-score" class="quiz-score">ענית נכון על 0 מתוך 10</div>

<div class="quiz-card" data-answer="א">
  <p class="quiz-question"><strong>1. מתכננים VLSM (Variable Length Subnet Masking) עבור הרשת <code>192.168.1.0/24</code>, ונדרשות 4 תת-רשתות מהגדולה לקטנה: 100 מארחים, 50 מארחים, 25 מארחים, ו-2 מארחים (קישור WAN בין ראוטרים). איזה Subnet Mask מינימלי מתאים לתת-הרשת הגדולה ביותר (100 מארחים), ומדוע נהוג להקצות אותה לפני התת-רשתות הקטנות יותר?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. <code>/25</code> (<code>255.255.255.128</code>, 126 מארחים שמישים) - ויש להקצות אותה ראשונה כדי למנוע חפיפה בין בלוקים וביזבוז מקום בהמשך התכנון</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. <code>/26</code> (<code>255.255.255.192</code>, 62 מארחים שמישים) - מספיק בדיוק לצורך 100 מארחים</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. יש להשתמש ב-<code>/24</code> כולה בלי לחלק אותה, כי VLSM אינו תומך בתת-רשתות בגדלים שונים מאותה רשת</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. <code>/25</code>, אך סדר ההקצאה בין תת-הרשתות אינו משנה כלל ב-VLSM</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> כדי לתמוך ב-100 מארחים נדרש <code>2^n - 2 &gt;= 100</code>, כלומר <code>n=7</code> סיביות מארח - מסכה <code>/25</code> נותנת 128 כתובות (126 שמישות). מסכת <code>/26</code> נותנת רק 62 כתובות שמישות - לא מספיק. בשיטת VLSM, בגלל שגודל הבלוקים משתנה מתת-רשת לתת-רשת, נהוג להקצות מהגדולה לקטנה כדי שכל בלוק "יתיישר" נכון בזיכרון הכתובות ולא ייווצרו חפיפות או קיטוע (Fragmentation) מיותר בטווח הכתובות שנותר.</div>
</div>

<div class="quiz-card" data-answer="ג">
  <p class="quiz-question"><strong>2. ברשת Switching עם קישורים מיותרים (Redundant Links) בין Switch-ים, מדוע נדרש Spanning Tree Protocol (STP), ומה קורה בפועל לפורטים שאינם Root Port ואינם Designated Port בטופולוגיה הסופית?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. STP נדרש כדי להאיץ את מהירות ההעברה בין Switch-ים, והפורטים העודפים מנותקים פיזית לצמיתות</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. STP רלוונטי רק ברשת עם Router יחיד, והפורטים העודפים ממשיכים להעביר תעבורה כרגיל בכל מקרה</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. STP נדרש כדי למנוע לולאות ב-Layer 2 (Broadcast Storms וריבוי עותקי Frame בשל היעדר TTL ברמת ה-Frame); פורטים שאינם Root Port או Designated Port עוברים למצב Blocking - חסומים לוגית להעברת תעבורה רגילה, אך נשארים מחוברים פיזית כגיבוי למקרה של כשל בקישור הפעיל</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. STP נדרש כדי להצפין תעבורה בין Switch-ים, ופורטים עודפים מוגדרים אוטומטית כ-Trunk</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> ללא STP, קישורים כפולים בין Switch-ים יוצרים לולאה אינסופית של Frames (ל-Ethernet Frame אין TTL כמו ל-IP), מה שגורם ל-Broadcast Storm ולחוסר יציבות בטבלת ה-MAC. STP פותר זאת בכך שהוא בוחר Root Bridge (לפי ה-Bridge ID הנמוך ביותר), מקצה לכל Switch שאינו Root פורט אחד שהוא Root Port (המסלול הזול ביותר אל ה-Root), ולכל Segment פורט אחד שהוא Designated Port (מעביר תעבורה עבור אותו Segment). כל שאר הפורטים עוברים למצב Blocking - חסומים מבחינה לוגית, אך נשארים כגיבוי שיופעל אוטומטית אם הקישור הפעיל נופל.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>3. מהו ההבדל העקרוני בין OSPF ל-BGP מבחינת סוג הפרוטוקול והיקף השימוש הטיפוסי שלו?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. OSPF הוא פרוטוקול Path-Vector בין-ארגוני; BGP הוא פרוטוקול Link-State פנים-ארגוני</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. OSPF הוא פרוטוקול Link-State (IGP - Interior Gateway Protocol) המשמש לניתוב בתוך ארגון בודד (Autonomous System), ומחשב מסלול לפי עלות הקישור (Cost); BGP הוא פרוטוקול Path-Vector (EGP - Exterior Gateway Protocol) המשמש בעיקר לניתוב בין ארגונים/ספקי אינטרנט (ISP) שונים, ומקבל החלטות ניתוב לפי תכונות מסלול (כגון אורך ה-AS-Path) ולא רק לפי מדד מספרי פשוט</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. שני הפרוטוקולים משמשים אך ורק לניתוב פנים-ארגוני, ואין ביניהם הבדל מהותי בעקרון הפעולה</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. OSPF משמש לחיבור בין ספקי אינטרנט (ISP) ברחבי האינטרנט, ואילו BGP משמש רק ברשתות פנים-ארגוניות קטנות</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> OSPF הוא פרוטוקול Link-State פנים-ארגוני (IGP) - כל ראוטר בונה מפה מלאה של הטופולוגיה ומחשב את המסלול הזול ביותר באמצעות אלגוריתם Dijkstra, לפי עלות (Cost) המבוססת בדרך כלל על רוחב הפס. BGP, לעומת זאת, הוא פרוטוקול Path-Vector שהוא "שפת הניתוב של האינטרנט" - הוא משמש לחיבור בין Autonomous Systems שונים (ארגונים, ספקי אינטרנט), ומקבל החלטות לא לפי עלות טכנית פשוטה אלא לפי תכונות מדיניות (Policy) כמו אורך שרשרת ה-AS-Path, מה שמאפשר שליטה עסקית/מדינית בניתוב ולא רק אופטימיזציה טכנית.</div>
</div>

<div class="quiz-card" data-answer="ד">
  <p class="quiz-question"><strong>4. מה ההבדל בין Static NAT, Dynamic NAT ו-PAT (Port Address Translation)?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. Static NAT ממפה כתובת פרטית לכתובת ציבורית ממאגר לפי דרישה; Dynamic NAT מבצע מיפוי קבוע 1-ל-1</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. PAT מבצע מיפוי קבוע 1-ל-1 בין כתובת פרטית לציבורית; Static NAT משתף כתובת ציבורית יחידה בין מספר מכשירים</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. Dynamic NAT ו-PAT זהים לחלוטין מבחינת עקרון הפעולה, וההבדל היחיד מ-Static NAT הוא צורת ההגדרה הידנית</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. Static NAT מבצע מיפוי קבוע ואישי 1-ל-1 בין כתובת פרטית לציבורית (מתאים לשרת פנימי שצריך כתובת ציבורית עקבית וקבועה); Dynamic NAT ממפה גם הוא 1-ל-1, אך מתוך מאגר (Pool) של כתובות ציבוריות זמינות, לפי הפנוי בזמן הדרישה וללא קביעות; PAT (הידוע גם כ-NAT Overload) משתף כתובת ציבורית יחידה בין מספר מכשירים פנימיים בו-זמנית, תוך הבחנה ביניהם לפי מספרי פורט ייחודיים</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> שלוש השיטות פותרות בעיות שונות: Static NAT נועד למקרה שבו צד חיצוני צריך לפנות תמיד לאותה כתובת ציבורית קבועה (למשל שרת Web פנימי). Dynamic NAT עדיין שומר על יחס 1-ל-1 בין כתובת פרטית לציבורית, אך הכתובת הציבורית מוקצית באופן זמני מתוך מאגר, ולכן מוגבל למספר החיבורים הזמניים כמספר הכתובות במאגר. PAT הוא הנפוץ ביותר בפועל (כמעט כל רשת ביתית) כי הוא מאפשר לכתובת ציבורית בודדת לשרת אלפי מכשירים בו-זמנית, תוך שמירת הבחנה ביניהם בטבלת NAT לפי צירוף כתובת+פורט.</div>
</div>

<div class="quiz-card" data-answer="א">
  <p class="quiz-question"><strong>5. מדוע נחשב Native VLAN Mismatch (הגדרת Native VLAN שונה בשני קצוות אותו קישור Trunk) לבעיית אבטחה וניתוב פוטנציאלית?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. תג 802.1Q מסמן את מזהה ה-VLAN על כל תעבורה שעוברת ב-Trunk, פרט לתעבורת ה-Native VLAN שעוברת ללא תיוג (Untagged); אם שני קצוות ה-Trunk מוגדרים עם Native VLAN שונה, Frames עלולים להתפרש ולהגיע ל-VLAN הלא נכון - וזהו הבסיס להתקפת VLAN Hopping מבוססת Double-Tagging</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. Native VLAN הוא ה-VLAN היחיד שמותר להעביר בכלל דרך Trunk, וכל שאר ה-VLANs נחסמים אוטומטית ללא קשר להגדרות</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. אין לכך שום השפעה מעשית - Native VLAN הוא רק שם תצוגה ב-CLI ואינו משפיע על אופן התיוג של ה-Frames</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. אי-התאמה ב-Native VLAN גורמת תמיד לניתוק מיידי ומוחלט של קישור ה-Trunk בין ה-Switch-ים</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> ברירת המחדל בתקן 802.1Q היא שתעבורת ה-Native VLAN עוברת ב-Trunk בלי תג VLAN כלל, כדי לשמור תאימות לציוד ישן. אם צד אחד של ה-Trunk מוגדר עם Native VLAN אחד והצד השני עם Native VLAN אחר, כל Switch יפרש את התעבורה הלא-מתויגת כשייכת ל-Native VLAN <em>שלו</em> - כך ש-Frame יכול "לדלוף" בין VLANs. תוקף יכול לנצל זאת בהתקפת Double-Tagging: לצרף שני תגי VLAN, כך שה-Switch הראשון מקלף רק את התג החיצוני (של ה-Native VLAN) והתג הפנימי חושף את ה-Frame ל-VLAN יעד שלא אמור להיות נגיש. לכן נוהג מומלץ הוא להתאים Native VLAN בין שני צדי כל Trunk ולא להשתמש ב-VLAN 1 (ברירת המחדל) כ-Native VLAN.</div>
</div>

<div class="quiz-card" data-answer="ג">
  <p class="quiz-question"><strong>6. מהו עקרון הפעולה של DSCP Marking במנגנוני QoS, ומדוע נהוג לתעדף תעבורת VoIP (קול) על פני הורדת קבצים גדולה?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. DSCP הוא פרוטוקול הצפנה שמצפין אך ורק תעבורת קול, ואין לו קשר לתעדוף תעבורה כלל</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. DSCP קובע את כתובת ה-IP המדויקת של כל חבילה, כדי לזהות אילו משתמשים משתמשים ב-VoIP ברשת</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. DSCP הוא שדה בן 6 סיביות בכותרת ה-IP (בתוך ה-ToS Byte) שמסמן רמת עדיפות לכל חבילה (למשל <code>EF</code> - Expedited Forwarding לתעבורת קול); התקני הרשת (Routers/Switches) משתמשים בסימון כדי להחליט על סדר עדיפויות בתורי ההמתנה (Queuing) - תעבורת קול היא תעבורת זמן-אמת רגישה מאוד ל-Latency ול-Jitter, בעוד הורדת קבצים סובלנית הרבה יותר לעיכובים ולכן מקבלת עדיפות נמוכה יותר</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. DSCP פועל אך ורק ב-Layer 2 ומזהה תעבורה לפי כתובת MAC בלבד, ללא קשר לכותרת ה-IP</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> DSCP (Differentiated Services Code Point) הוא סימון ברמת שכבת ה-IP שמאפשר לכל התקן במסלול לזהות את חשיבות החבילה בלי לפתוח את תוכן ה-Payload. תעבורת VoIP מסומנת בדרך כלל ב-<code>EF</code> (עדיפות גבוהה) כי שיחת קול נשברת ומאבדת שימושיות אם יש עיכוב (Latency) גדול או תנודתיות בעיכוב (Jitter) - האוזן האנושית רגישה לכך מיידית. הורדת קובץ, לעומת זאת, יכולה "לחכות" עוד כמה מילישניות/שניות מבלי שהמשתמש ירגיש בכך, ולכן מסומנת בעדיפות נמוכה יותר (למשל <code>Best Effort</code>) ומקבלת עדיפות תור נמוכה יותר בזמן עומס.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>7. עבור הרשת <code>172.16.50.32/28</code>, מהי כתובת ה-Broadcast של תת-הרשת, ומהו מספר המארחים הזמינים לשימוש בפועל?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. Broadcast: <code>172.16.50.63</code>, מספר מארחים זמינים: 16</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. Broadcast: <code>172.16.50.47</code>, מספר מארחים זמינים: 14</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. Broadcast: <code>172.16.50.47</code>, מספר מארחים זמינים: 16</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. Broadcast: <code>172.16.50.255</code>, מספר מארחים זמינים: 254</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> מסכת <code>/28</code> משאירה 4 סיביות למארח, כלומר כל בלוק תת-רשת מכיל <code>2^4 = 16</code> כתובות. הבלוק שמתחיל ב-<code>172.16.50.32</code> נמתח עד <code>172.16.50.47</code> (32+16-1) - זו כתובת ה-Broadcast. מתוך 16 הכתובות בבלוק, הראשונה (<code>.32</code>) היא כתובת הרשת עצמה והאחרונה (<code>.47</code>) היא ה-Broadcast, כך שנותרות <code>16 - 2 = 14</code> כתובות שמישות למארחים (מ-<code>.33</code> עד <code>.46</code>).</div>
</div>

<div class="quiz-card" data-answer="ד">
  <p class="quiz-question"><strong>8. מה סדר העיבוד של רשימת גישה (ACL) על ראוטר, ומה קורה בפועל לחבילה שאינה תואמת אף שורה מפורשת שהוגדרה ברשימה?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. השורות נבדקות מהאחרונה לראשונה, וחבילה שלא תואמת אף שורה עוברת אוטומטית לפי כלל Permit Any מרומז</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. כל השורות ב-ACL נבדקות במקביל, והחבילה מקבלת את התוצאה המחמירה ביותר מבין כל השורות שבדקו אותה</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. השורות נבדקות מלמעלה למטה, אך אם לא נמצאה התאמה בסבב הראשון, החבילה נבדקת שוב מההתחלה בלולאה עד שנמצאת התאמה כלשהי</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. השורות נבדקות מלמעלה למטה בדיוק לפי הסדר שבו הוגדרו, ועיבוד החבילה נעצר בהתאמה הראשונה שנמצאה (שאר השורות לא נבדקות כלל); אם לא נמצאה שום התאמה מפורשת עד סוף הרשימה, ברירת המחדל היא Implicit Deny - חסימת כל תעבורה שלא הותרה במפורש</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> זו אחת הטעויות הנפוצות ביותר במבחני הסמכה - ACL תמיד נבדק מלמעלה למטה, וברגע שנמצאה התאמה ראשונה (Permit או Deny) העיבוד נעצר שם ולא ממשיך הלאה, גם אם שורה מאוחרת יותר "הייתה" מתאימה יותר. משמעות הדבר היא שסדר השורות קריטי - שורה כללית מדי שמופיעה ראשונה עלולה "לבלוע" תעבורה שהתכוונתם לחסום בשורה ספציפית יותר בהמשך. כמו כן, בסוף כל ACL קיים כלל בלתי-נראה של Implicit Deny All - כל תעבורה שלא הותרה במפורש נחסמת אוטומטית.</div>
</div>

<div class="quiz-card" data-answer="א">
  <p class="quiz-question"><strong>9. מהו ההבדל העיקרי בין תדרי 2.4GHz ל-5GHz ברשתות אלחוטיות, ומה השיפור המרכזי שמביא WPA3 לעומת WPA2 מבחינת אבטחה?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. 2.4GHz מספק טווח ארוך יותר וחדירה טובה יותר דרך קירות ומכשולים, אך עם פחות ערוצים שאינם חופפים ורוחב פס נמוך יותר (רגיש יותר להפרעות ממכשירים אחרים); 5GHz מספק רוחב פס ומהירויות גבוהות יותר, אך עם טווח קצר יותר וחדירה פחות טובה. WPA3 מחליף את מנגנון ה-Handshake הפגיע של WPA2 (4-Way Handshake, פגיע להתקפות Dictionary לא-מקוונות) במנגנון SAE (Simultaneous Authentication of Equals), שמספק הגנה טובה משמעותית גם כשנבחרה סיסמה חלשה יחסית</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. 2.4GHz מהיר יותר מ-5GHz בכל תרחיש אפשרי, ו-WPA3 זהה לחלוטין ל-WPA2 מבחינת פרוטוקול האימות והצפנה</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. 5GHz מספק טווח ארוך משמעותית יותר מ-2.4GHz בזכות תדר גבוה יותר, ומבחינת אבטחה WPA2 נחשב חזק יותר מ-WPA3</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. אין הבדל מעשי בין 2.4GHz ל-5GHz מלבד המספר בשם, וההבדל בין WPA2 ל-WPA3 הוא רק שיווקי בלבד</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> תדר נמוך יותר (2.4GHz) עובר מרחקים ארוכים יותר וחודר מכשולים פיזיים טוב יותר, אך יש בו פחות ערוצים שאינם חופפים (בפועל 3 בלבד ברוב האזורים) ולכן הוא צפוף וסובל מהפרעות ממכשירים רבים אחרים (Bluetooth, מיקרוגל וכו'). תדר גבוה יותר (5GHz) מציע ערוצים רבים יותר ורוחב פס גבוה יותר למהירויות טובות יותר, אך לרוב מגיע לטווח קצר יותר. בצד האבטחה, WPA2 מסתמך על 4-Way Handshake שחושף מספיק מידע כדי לאפשר התקפת Dictionary לא-מקוונת (Offline) על הסיסמה שנלכדה; WPA3 מחליף זאת ב-SAE (המבוסס על Dragonfly Handshake), שמונע התקפות Offline ומספק Forward Secrecy - גם אם הסיסמה נחשפת בעתיד, תעבורה קודמת שהוצפנה נשארת מוגנת.</div>
</div>

<div class="quiz-card" data-answer="ג">
  <p class="quiz-question"><strong>10. מה תפקידם של HSRP (פרוטוקול קנייני של Cisco) ו-VRRP (תקן פתוח מקביל), וכיצד הם מספקים זמינות גבוהה (High Availability) עבור ה-Default Gateway ברשת מקומית?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. הם פרוטוקולי ניתוב דינמי (בדומה ל-OSPF) שמטרתם למצוא את המסלול הקצר ביותר בין רשתות מרוחקות</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. הם פרוטוקולים להצפנת תעבורה בין ה-Router לבין מחשבי הקצה ברשת המקומית</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. הם פרוטוקולי Redundancy שמאפשרים למספר ראוטרים לשתף כתובת IP (ולעיתים גם כתובת MAC) וירטואלית משותפת - ראוטר אחד בלבד (Active ב-HSRP, Master ב-VRRP) מעביר בפועל את התעבורה בכל רגע נתון; אם הוא נופל, ראוטר אחר (Standby/Backup) תופס את מקומו באופן שקוף, מבלי שמחשבי הקצה יצטרכו לשנות את הגדרת ה-Default Gateway שלהם</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. הם מנגנוני Load Balancing שמפצלים תעבורה שווה בשווה בין כל הראוטרים בו-זמנית, ללא מושג של ראוטר "פעיל" יחיד</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> מחשבי קצה מוגדרים עם כתובת Default Gateway בודדת וסטטית - אם הראוטר האמיתי מאחוריה נופל, כל התעבורה החוצה מהרשת המקומית נעצרת. HSRP ו-VRRP פותרים זאת בכך שכמה ראוטרים "מתחזים" יחד לכתובת IP וירטואלית משותפת אחת (ולעיתים גם MAC וירטואלי) שמוגדרת כ-Default Gateway אצל מחשבי הקצה. בכל רגע רק ראוטר אחד (Active/Master, שנבחר לרוב לפי עדיפות - Priority) מעביר בפועל את התעבורה; אם הוא נופל, ראוטר Standby/Backup מזהה זאת ותופס את הכתובת הווירטואלית תוך שניות, בלי שמחשבי הקצה ידעו שהתרחש כשל כלשהו. ההבדל המעשי המרכזי: HSRP הוא פרוטוקול קנייני של Cisco בלבד, בעוד VRRP הוא תקן פתוח (IETF) הנתמך על ידי ספקים מרובים.</div>
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
