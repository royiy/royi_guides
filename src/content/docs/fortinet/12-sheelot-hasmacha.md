---
title: "שאלות קשות ברמת הסמכה (NSE 4)"
category: Fortinet
part: 12/10
---

מבחן אינטראקטיבי ברמת קושי גבוהה, בסגנון שאלות הסמכת **Fortinet NSE 4 – FortiGate Security** - בניגוד למבחן החזרה הכללי בפרק הקודם, כאן כל שאלה בודקת נקודה עדינה ומטעה שדורשת הבנה אמיתית של מנגנוני הפנים של FortiGate (NAT, HA, VDOMs, VPN, Security Profiles ועוד), לא רק שינון. בחרו תשובה ותקבלו מיד משוב עם הסבר מפורט.

<div id="quiz-score" class="quiz-score">ענית נכון על 0 מתוך 10</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>1. מהי הנקודה הקריטית בהפעלת <code>central-nat</code> ב-FortiGate ביחס ל-NAT המוגדר בתוך Policy בודד?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. שתי השיטות פועלות תמיד במקביל ומתחרות זו בזו על אותה חבילה, וזוכה זו שהוגדרה מאוחר יותר</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. כאשר <code>central-nat</code> מופעל, לא ניתן יותר להגדיר <code>set nat enable</code>/<code>poolname</code> בתוך ה-Policy עצמו - כל תרגומי המקור (SNAT) מבוצעים אך ורק דרך טבלת <code>central-snat-map</code> נפרדת, שנבדקת ברצף משלה מלמעלה למטה ומפרידה לחלוטין את לוגיקת ה-NAT מלוגיקת האבטחה</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. Central NAT מבטל את הצורך בהגדרת Security Policy כלשהו לתעבורה יוצאת</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. Central NAT נועד אך ורק ל-Destination NAT (VIP), ואינו יכול לבצע כלל Source NAT</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> ברגע שמפעילים <code>config system settings / set central-nat enable</code>, אפשרות ה-NAT נעלמת מתוך ה-Policy עצמו - היא עוברת לגמרי לטבלת <code>firewall central-snat-map</code> ייעודית, שנבדקת בנפרד ובסדר משלה. זה בדיוק ההפך מ-NAT "מקומי" בתוך Policy בודד, שבו כל כלל נושא את הגדרת ה-NAT שלו. Central NAT משמש בעיקר ל-Source NAT מרוכז בסביבות עם הרבה חוקים; VIP (DNAT) ממשיך להתקיים כאובייקט נפרד ב-<code>dstaddr</code> של ה-Policy.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>2. מהו ההבדל המהותי בין מצב HA מסוג Active-Passive למצב Active-Active ב-FGCP, ומה תפקיד ה-Heartbeat בין חברי הקלאסטר?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. ב-Active-Active שני המכשירים תמיד מכפילים את התפוקה הכוללת פי שניים באופן ליניארי, וה-Heartbeat משמש רק להעברת קבצי גיבוי</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. ב-Active-Passive רק חבר אחד (Primary) מעבד בפועל את כל התעבורה בעוד השני ממתין וסונכרן איתו; ב-Active-Active מספר חברים מעבדים תעבורה בו-זמנית תחת תיאום ה-Primary, בעיקר לפיזור עומס UTM כבד. ה-Heartbeat הוא ערוץ הסנכרון ובדיקת התקינות בין החברים, שדרכו גם מזוהה נפילת חבר ומופעל Failover</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. אין שום הבדל מעשי בין שני המצבים - ההבחנה קיימת רק בשם התצורה</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. ה-Heartbeat אחראי אך ורק על עדכון קושחה בין החברים, ואינו קשור לזיהוי נפילת חבר</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> Active-Passive הוא המצב הנפוץ - חבר אחד בלבד מעבד תעבורה, השני עומד לרשותו ומקבל את כל הסנכרון (קונפיגורציה + session-ים). Active-Active מפזר עיבוד תעבורה בין כמה חברים בו-זמנית ומתאים לעומסי UTM גבוהים, אך פחות נפוץ ומורכב יותר לתחזוקה. בשני המצבים, ה-Heartbeat הוא הערוץ שדרכו החברים בודקים זה את תקינות זה ומזהים אובדן קשר - זהו הבסיס גם לזיהוי מצב Split-Brain כשה-Heartbeat נופל.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>3. מהי המטרה העיקרית של VDOMs (Virtual Domains) ב-FortiGate, ומהי אחת המגבלות הידועות של ה-Root VDOM?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. VDOMs נועדו להאיץ ביצועים על ידי חלוקת עומס בין ליבות CPU, ואין להם השפעה לוגית על הפרדת קונפיגורציה</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. VDOMs מאפשרים לחלק מכשיר FortiGate פיזי אחד למספר "פיירוולים וירטואליים" עצמאיים מבחינה לוגית (כל אחד עם Policies, Routing וטבלת Interfaces משלו) - שימושי למולטי-טננסי (למשל ספקי שירות) או לבידוד בין מחלקות; ה-Root VDOM הוא זה שדרכו מנוהלות הגדרות גלובליות של המכשיר עצמו (כמו HA), ולא ניתן למחוק אותו</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. VDOMs זהים לחלוטין להתקנת כמה מכשירי FortiGate פיזיים נפרדים, ואין ביניהם שום שיתוף משאבי חומרה</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. תפקידו היחיד של Root VDOM הוא לשמש כמאגר לוגים בלבד עבור שאר ה-VDOMs</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> VDOMs מפצלים מכשיר FortiGate פיזי אחד למספר הקשרים לוגיים נפרדים - כל VDOM מחזיק Policies, Routing Table, ואפילו Interfaces וירטואליים משלו, כאילו מדובר בפיירוול נפרד לגמרי, בעוד שהם עדיין חולקים את אותה חומרה פיזית. זה שימושי מאוד לספקי שירות (MSSP) שרוצים לתת ללקוחות שונים "פיירוול" נפרד על אותו מכשיר, או לארגון גדול שרוצה בידוד מלא בין מחלקות. ה-Root VDOM הוא ייחודי - דרכו מנוהלות הגדרות ברמת המכשיר כולו (כמו HA, ומעבר בין VDOMs), ולכן לא ניתן למחוק אותו.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>4. מהו ההבדל העקרוני בשימוש בין SSL VPN ל-IPsec VPN ב-FortiGate?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. SSL VPN תומך אך ורק בהתקנים ניידים, ו-IPsec VPN תומך אך ורק בשרתים</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. SSL VPN מיועד בעיקר לגישת משתמשים בודדים מרחוק (Remote Access) לרשת הארגונית דרך דפדפן או FortiClient, בעוד IPsec VPN נפוץ בעיקר לחיבור Site-to-Site קבוע בין שתי רשתות/Gateways - עם זאת, שני הפרוטוקולים תומכים גם בתרחישים חורגים (למשל IPsec Dialup לגישת משתמשים)</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. אין כל הבדל שימושי בין השניים - הבחירה תלויה אך ורק בהעדפה אסתטית של הממשק</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. IPsec VPN דורש תמיד דפדפן אינטרנט לחיבור, בעוד SSL VPN דורש חומרה ייעודית בכל צד</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> ההבדל השימושי המקובל: SSL VPN (Web Mode/Tunnel Mode דרך FortiClient) פונה בעיקר לתרחיש של עובד בודד שמתחבר מרחוק לרשת הארגונית, כי הוא נגיש בקלות דרך דפדפן/לקוח קליל בלי דרישות תצורה מורכבות בצד המשתמש. IPsec VPN, לעומת זאת, נפוץ בעיקר לחיבור Site-to-Site קבוע בין שני משרדים או בין Gateway לספק ענן - חיבור "קבוע" בין שני Gateways ולא בין משתמש בודד לרשת. חשוב לזכור ששתי הטכנולוגיות גמישות ותומכות גם בתרחישים ההפוכים (IPsec Dialup לגישת משתמשים בודדים), אך השימוש ה"קלאסי" הוא כמתואר.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>5. חבילת מידע לא הותאמה לאף כלל בטבלת ה-Security Policy. מה קורה בפועל, ומה ההשלכה המעשית מבחינת רישום ללוגים?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. החבילה מותרת אוטומטית לעבור, כי ברירת המחדל של FortiGate היא Allow ולא Deny</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. החבילה נחסמת על ידי ה-Implicit Deny שקיים תמיד בסוף טבלת המדיניות, אך ברירת המחדל שלו לרוב לא רושמת אירוע ללוג אלא אם מפעילים זאת ספציפית - ולכן מומלץ להוסיף כלל Deny מפורש עם <code>logtraffic all</code> בסוף הרשימה, לצורך ניתוח תקריות וביקורת</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. FortiGate דורש הגדרה ידנית של Implicit Deny, ואם לא הוגדר במפורש - החבילה תיחסם רק לאחר timeout ארוך</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. ה-Implicit Deny חל רק על תעבורת IPv6, ואילו IPv4 עובר תמיד לבדיקה נוספת מול FortiGuard</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> ל-FortiGate יש תמיד כלל "בלתי נראה" בסוף טבלת המדיניות שחוסם כל תעבורה שלא הותאמה לאף כלל מפורש - ה-Implicit Deny. הבעיה המעשית היא שברירת המחדל שלו לרוב אינה רושמת את החבילות הנחסמות ללוג, מה שמקשה על אבחון "למה החיבור נחסם?". לכן ה-Best Practice המקובל הוא להוסיף כלל Deny מפורש (עם <code>set logtraffic all</code>) כשורה האחרונה בטבלה - כך כל תעבורה שלא הותאמה בפועל כן מתועדת.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>6. מה ההבדל בין חסימה מבוססת Signature ב-IPS לבין Application Control ב-FortiGate?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. שני המנועים זהים לחלוטין ומשתמשים באותו מסד חתימות בדיוק</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. חתימת IPS מזהה תבניות תקיפה/ניצול פרצה ספציפיות (Exploit Patterns) בתוך התעבורה, בעוד Application Control מזהה את זהות האפליקציה עצמה (למשל TeamViewer, BitTorrent, Facebook) - גם כשהיא "מתחזה" לפורט סטנדרטי כמו 443 - ומאפשר לחסום/להתיר לפי קטגוריה או אפליקציה, ללא קשר לניסיון תקיפה כלשהו</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. Application Control פועל רק על תעבורת UDP, בעוד IPS פועל רק על TCP</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. Application Control הוא רכיב חינמי ללא צורך ברישיון FortiGuard, בשונה מ-IPS</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> חתימות IPS נועדו לזהות ניסיונות ניצול חולשות אבטחה ידועות (Exploits) בתוך תעבורת הרשת. Application Control, לעומת זאת, לא מחפש התקפה - הוא מזהה מהי האפליקציה שיוצרת את התעבורה בפועל (Deep Packet Inspection ברמת האפליקציה), גם אם היא רצה על פורט "תמים" כמו 443. כך אפשר לחסום למשל TeamViewer או BitTorrent גם כשהם עוטפים את עצמם ב-HTTPS רגיל - משהו שחוק Firewall מבוסס פורט בלבד לא היה תופס.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>7. מה ההבדל בין Full SSL Inspection (Deep Inspection) לבין Certificate Inspection ב-FortiGate, וההשלכה על אמון תעודות בצד הלקוח?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. שני המצבים מבצעים בדיוק אותה פעולה, וההבדל הוא רק בשם התצורה ב-CLI</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. Full/Deep Inspection "פותח" את ההצפנה בפועל, בודק את התוכן (IPS/AV/Web Filter) ומצפין מחדש עם תעודת CA של FortiGate - מה שדורש התקנת אותה תעודת CA בתחנות הקצה, אחרת יופיעו אזהרות תעודה לא מהימנה בדפדפן; Certificate Inspection בודק רק את פרטי תעודת ה-SSL עצמה (כגון שם הדומיין) בלי לפענח את התוכן, ולכן אינו דורש התקנת CA בצד הלקוח - אך גם אינו מאפשר בדיקת תוכן בתוך התעבורה המוצפנת</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. Certificate Inspection דורש תמיד התקנת CA בצד הלקוח, בעוד Full SSL Inspection אינו דורש זאת כלל</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. Full SSL Inspection פועל רק על תעבורת FTP, ואינו רלוונטי כלל ל-HTTPS</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> נקודה קריטית שנבדקת ב-NSE 4: Deep Inspection הוא "Man-in-the-Middle" מבוקר - FortiGate מפענח את ה-HTTPS, בודק את התוכן, ומצפין מחדש עם תעודת <code>Fortinet_CA_SSL</code> משלו, ולכן חייבים להטמיע את אותה תעודת CA כמהימנה במכשירי הקצה כדי למנוע אזהרות דפדפן. Certificate Inspection הוא קל בהרבה - בודק רק את שדה ה-SNI/שם הדומיין בתעודה (בלי לפענח בפועל), ולכן לא נדרשת שום תעודה בצד הלקוח, אבל גם אין אפשרות לבדוק תוכן בתוך התעבורה המוצפנת (IPS/AV לא יכולים "לראות" את מה שבפנים).</div>
</div>

<div class="quiz-card" data-answer="ג">
  <p class="quiz-question"><strong>8. מה ההבדל העיקרי בין FortiManager ל-FortiAnalyzer בארכיטקטורת Security Fabric?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. שני המוצרים מספקים בדיוק אותה פונקציונליות, ומשמשים כגיבוי זה לזה בלבד</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. FortiManager אוסף לוגים ומייצר דוחות אבטחה, ואילו FortiAnalyzer דוחף קונפיגורציה למכשירי FortiGate</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. FortiManager מנהל ניהול מדיניות מרוכז (Policy Package, Provisioning) עבור מספר FortiGate-ים בבת אחת, ואילו FortiAnalyzer אחראי על ריכוז לוגים, ניתוח אירועים (FortiView) והפקת דוחות</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. FortiManager מיועד רק ל-VDOMs, ו-FortiAnalyzer מיועד רק ל-HA</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> FortiManager = ניהול מדיניות מרוכז - Policy Package אחד שנדחף לכמה FortiGate-ים בו-זמנית, מחולק ל-ADOM-ים לפי לקוח/אזור. FortiAnalyzer = ריכוז לוגים ואנליטיקה - אוסף Traffic/Event Logs ממכשירי FortiGate רבים, מאפשר חקירת אירועים דרך FortiView, ומייצר דוחות תקופתיים. שני המוצרים משלימים זה את זה אך פותרים בעיות שונות לגמרי: הפצת קונפיגורציה מול ריכוז וניתוח לוגים.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>9. מהי המטרה של <code>diagnose sniffer packet</code> ב-FortiGate, וכיצד קובעים כמה פרטים תוצג לכל חבילה שנלכדת?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. הפקודה מיועדת רק לגיבוי קונפיגורציה, ואין לה קשר ללכידת תעבורה</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. הפקודה מאפשרת ללכוד תעבורה בזמן אמת ישירות ב-CLI (בסגנון <code>tcpdump</code>) על ממשק ספציפי או על כל הממשקים (<code>any</code>), עם פילטר בסגנון BPF; רמת הפירוט של הפלט נקבעת על ידי פרמטר Verbosity (למשל 1 עבור כותרות מינימליות בלבד ועד 4 שכולל גם חלק מתוכן החבילה)</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. הפקודה תמיד מציגה את כל תוכן החבילה במלואו, ואין דרך לשלוט ברמת הפירוט</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. הפקודה עובדת רק כשהמכשיר במצב Transparent, ואינה זמינה במצב NAT/Route</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> <code>diagnose sniffer packet &lt;interface&gt; '&lt;filter&gt;' &lt;verbosity&gt; [count]</code> הוא כלי אבחון עוצמתי שמאפשר ללכוד תעבורה ישירות ב-CLI בלי כלים חיצוניים - למשל <code>diagnose sniffer packet any 'host 192.168.10.50 and port 443' 4</code>. פרמטר ה-Verbosity קובע כמה מידע מוצג לכל חבילה: רמות נמוכות (1) מציגות רק כותרות בסיסיות, ואילו רמות גבוהות יותר (עד 4) מציגות גם חלק מתוכן החבילה בפועל - חשוב לזכור לעצור את הלכידה עם <code>Ctrl+C</code> או להגביל מספר חבילות, כדי לא להעמיס על ה-CPU.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>10. למה מומלץ ולעיתים חובה לעבור בין גרסאות FortiOS בהדרגה (לפי Upgrade Path רשמי), ולא לדלג ישירות בין גרסאות Major רחוקות?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. אין שום מגבלה בפועל - Fortinet תומכת בקפיצה ישירה בין כל שתי גרסאות, וההמלצה היא רק אסתטית</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. כל שדרוג Major כולל לעיתים סקריפטים פנימיים למיגרציית קונפיגורציה ושינויי סכימה שרצים בצורה עוקבת מגרסה לגרסה הבאה בלבד; דילוג על גרסאות ביניים עלול לגרום לאובדן/שיבוש קונפיגורציה, כשל בעליה (Boot Loop) או התנהגות בלתי צפויה - ולכן יש לעקוב אחר ה-Upgrade Path הרשמי של Fortinet ולעבור גרסה-גרסה</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. דילוג בין גרסאות אסור אך ורק במכשירים וירטואליים (VM), ואילו בחומרה פיזית אין כל מגבלה</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. שדרוג בין גרסאות Major לא דורש בדיקה כלשהי, כי FortiOS שומר תמיד גיבוי אוטומטי מלא לפני כל שדרוג ומשחזר את עצמו במקרה כשל</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> בכל מעבר בין גרסת Major אחת לבאה, FortiOS מריץ תהליכי מיגרציה פנימיים להתאמת מבנה הקונפיגורציה (Schema) לגרסה החדשה. תהליכים אלה מתוכננים לרוץ ברצף - מגרסה לגרסה הבאה אחריה בלבד - ולא "מדלגים" קדימה. לכן דילוג ישיר, למשל מגרסה 6.4 ישירות ל-7.4 בלי לעבור דרך 7.0 ו-7.2, עלול לגרום לשיבוש בקונפיגורציה, כשל בעלייה של המכשיר, ולעיתים אף לצורך בשחזור מגיבוי. Fortinet מפרסמת כלי ותיעוד רשמי בשם Upgrade Path Tool שמורה בדיוק דרך אילו גרסאות ביניים חובה לעבור.</div>
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
