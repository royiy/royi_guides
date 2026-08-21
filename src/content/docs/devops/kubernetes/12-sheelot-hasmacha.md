---
title: "שאלות קשות ברמת הסמכה (CKA)"
category: DevOps/Kubernetes
part: 12/10
---

מבחן אינטראקטיבי ברמת קושי גבוהה, בסגנון שאלות הסמכת **Certified Kubernetes Administrator (CKA)** - בניגוד למבחן החזרה הכללי בפרק הקודם, כאן כל שאלה בודקת נקודה עדינה ומטעה שדורשת הבנה אמיתית של מנגנוני הפנים של Kubernetes (etcd, RBAC, Static Pods, Scheduler ועוד), לא רק שינון. בחרו תשובה ותקבלו מיד משוב עם הסבר מפורט.

<div id="quiz-score" class="quiz-score">ענית נכון על 0 מתוך 10</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>1. מה <code>etcdctl snapshot restore</code> עושה בפועל, ומה נדרש כדי שהשחזור אכן ייכנס לתוקף בקלאסטר?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. הוא משחזר ישירות את המידע לתוך מסד הנתונים הרץ של etcd, בלי צורך בשום אתחול נוסף</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. הוא יוצר data directory חדש ונפרד מתוך קובץ ה-snapshot; כדי שהשחזור ייכנס לתוקף יש להצביע את הגדרת etcd (<code>--data-dir</code>) אל התיקייה החדשה ולהפעיל מחדש את השירות/ה-Static Pod של etcd - הפעולה לא "מזריקה" נתונים לקלאסטר הרץ</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. הוא מוחק אוטומטית את כל ה-Pods הרצים בקלאסטר ומאתחל אותם מחדש מהסנפשוט</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. הוא פועל רק כשה-API Server למעלה ומריץ, ואי אפשר לבצע אותו כשה-Control Plane למטה</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> <code>snapshot restore</code> לא נוגע בקלאסטר החי כלל - הוא רק בונה data directory חדש מקובץ הסנפשוט, בנתיב שאתם מציינים. כדי שהשחזור ייכנס לתוקף צריך לעדכן את ה-manifest הסטטי של etcd (בדרך כלל <code>/etc/kubernetes/manifests/etcd.yaml</code>) כך שיצביע ל-data directory החדש, ואז ה-kubelet יפעיל מחדש את ה-Static Pod של etcd עם הנתונים המשוחזרים. בלי הגיבוי הזה, קריסה מוחלטת של etcd שקולה לאובדן כל מצב הקלאסטר - כל ה-Deployments, Secrets, ConfigMaps וההיסטוריה נעלמים.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>2. ניתן לקשר <code>RoleBinding</code> ל-<code>ClusterRole</code> (לא רק ל-<code>Role</code>). מה קורה בפועל כשעושים זאת?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. הפעולה אסורה לחלוטין - <code>RoleBinding</code> יכול להצביע רק על <code>Role</code>, לעולם לא על <code>ClusterRole</code></button>
    <button class="quiz-option" type="button" data-choice="ב">ב. ה-<code>ClusterRole</code> "יורד בדרגה" - ה-<code>RoleBinding</code> מעניק את ההרשאות המוגדרות בו, אך רק בתוך ה-namespace שבו הוגדר ה-<code>RoleBinding</code> עצמו, ולא בכל הקלאסטר</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. הקישור מעניק אוטומטית את ההרשאות בכל ה-namespaces בקלאסטר, בדיוק כמו <code>ClusterRoleBinding</code></button>
    <button class="quiz-option" type="button" data-choice="ד">ד. ה-apply ייכשל בשגיאת validation כי הטיפוסים אינם תואמים</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> זה טריק נפוץ ב-CKA - שילוב <code>RoleBinding</code> עם <code>ClusterRole</code> קיים הוא דפוס מקובל (למשל שימוש חוזר ב-<code>ClusterRole</code> גנרי כמו <code>view</code>/<code>edit</code>) בלי ליצור <code>Role</code> זהה בכל namespace. אבל ה-scope של ההרשאה בפועל נקבע לפי סוג ה-Binding ולא לפי סוג ה-Role: <code>RoleBinding</code> תמיד מגביל את התוקף ל-namespace שבו הוא עצמו מוגדר, גם אם ה-<code>ClusterRole</code> שהוא מפנה אליו הוגדר ברמת הקלאסטר.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>3. היכן מוגדרים Static Pods, ולמה לא ניתן לנהל אותם ישירות דרך ה-API Server (למשל למחוק אותם עם <code>kubectl delete pod</code>)?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. הם מוגדרים ישירות בתוך etcd, ולכן מחיקה דרך ה-API Server לא משפיעה על etcd</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. הם מוגדרים כקבצי manifest בתיקייה מקומית על ה-node עצמו (ברירת מחדל <code>/etc/kubernetes/manifests</code>), וה-kubelet המקומי יוצר ומנהל אותם ישירות בלי לעבור דרך ה-Scheduler; ה-API Server רק "רואה" mirror pod לצורך תצוגה, ומחיקתו לא מוחקת את ה-manifest המקורי - ה-kubelet ייצור אותו מחדש מיד</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. הם מוגדרים בתוך ConfigMap ולכן דורשים הרשאת RBAC מיוחדת כדי למחוק</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. אפשר בהחלט למחוק Static Pods דרך ה-API Server בדיוק כמו כל Pod רגיל, ואין שום הבדל בהתנהגות</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> Static Pods הם המנגנון שבו רכיבי ה-Control Plane עצמם (kube-apiserver, kube-scheduler, kube-controller-manager, etcd) מנוהלים כשמתקינים עם kubeadm. ה-kubelet סורק תיקייה מקומית על ה-node ומריץ כל manifest שהוא מוצא בה, ללא תלות ב-API Server. ה-mirror pod שנראה דרך <code>kubectl get pods</code> הוא רק שיקוף לתצוגה - עריכה או מחיקה שלו דרך ה-API לא משנה את ה-manifest המקורי, ולכן ה-kubelet פשוט יוצר את ה-mirror pod מחדש. כדי לשנות Static Pod באמת צריך לערוך או להסיר את קובץ ה-YAML בנתיב עצמו על ה-node.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>4. מה ההבדל המהותי בין <code>Taints &amp; Tolerations</code> ל-<code>Node Affinity</code> מבחינת כיוון ההשפעה על שיבוץ Pods?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. שני המנגנונים זהים לחלוטין מבחינה פונקציונלית, ההבדל הוא רק בתחביר ה-YAML</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. <code>Taint</code> מוגדר על ה-Node ו"דוחה" Pods שאין להם <code>Toleration</code> מתאים (מונע שיבוץ, לא מבטיח אף שיבוץ); <code>Node Affinity</code> מוגדר על ה-Pod ו"מושך" אותו אל nodes מסוימים לפי label - אך לא מונע שיבוץ של Pods אחרים (ללא affinity) לאותו node</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. <code>Taint</code> מבטיח שה-Pod ישובץ תמיד על node ספציפי, בעוד ש-<code>Node Affinity</code> רק ממליץ ולא מחייב</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. <code>Node Affinity</code> חוסם Pods מלהגיע ל-node מסוים, ואילו <code>Taint</code> מושך Pods אליו</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> זו נקודת בלבול קלאסית במבחן - הכיוון הפוך בין שני המנגנונים. <code>Taint</code> על node הוא מנגנון "דחייה": כל Pod שאין לו <code>Toleration</code> תואם פשוט לא ישובץ שם. <code>Node Affinity</code> על ה-Pod הוא מנגנון "משיכה": הוא קובע ל-Pod עצמו לאיזה nodes הוא רשאי/מעדיף להגיע, אבל לא משפיע על Pods אחרים שלא הוגדר להם affinity - הם עדיין יכולים להגיע לאותו node בלי שום קשר. כדי לבודד node לחלוטין עבור workload ספציפי, לרוב משלבים את שני המנגנונים יחד (Taint שדוחה את כולם + Toleration+Affinity ל-Pods הרצויים).</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>5. מהי התנהגות ברירת המחדל של תעבורת רשת בין Pods ב-Kubernetes לפני שמגדירים <code>NetworkPolicy</code> כלשהו, ומה בפועל נדרש כדי לאכוף בידוד?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. ברירת המחדל חוסמת את כל התעבורה בין Pods, וצריך <code>NetworkPolicy</code> כדי לפתוח גישה</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. ברירת המחדל היא "הכל פתוח" - כל Pod יכול לתקשר עם כל Pod אחר בקלאסטר ללא הגבלה; כדי לאכוף בידוד יש ליצור <code>NetworkPolicy</code> שבוחר את ה-Pods הרלוונטיים (באמצעות <code>podSelector</code>), ובנוסף חובה שה-CNI Plugin בקלאסטר יתמוך ב-NetworkPolicy (למשל Calico) - אחרת ההגדרה תישמר ב-API אך לא תיאכף בפועל</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. <code>kube-proxy</code> אוכף <code>NetworkPolicy</code> אוטומטית בכל קלאסטר, ללא תלות ב-CNI שנבחר</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. ברירת המחדל חוסמת תעבורה נכנסת (Ingress) בלבד, אך מתירה תמיד את כל התעבורה היוצאת (Egress)</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> נקודה שנבחנת הרבה - עד שלא מוגדר שום <code>NetworkPolicy</code> שבוחר Pod מסוים, כל התעבורה אליו וממנו פתוחה לחלוטין. ברגע שנוצר <code>NetworkPolicy</code> ראשון שבוחר Pod מסוים, ההתנהגות הופכת ל-"deny by default" עבור אותו כיוון (Ingress/Egress) שהוגדר בו, וכל מה שלא הותר במפורש נחסם. חשוב לזכור גם ש-<code>NetworkPolicy</code> הוא רק אובייקט API - האכיפה בפועל תלויה לגמרי בכך שה-CNI Plugin המותקן תומך בו; לא כל CNI (למשל Flannel הבסיסי) תומך.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>6. מה ההבדל בין מדיניות Reclaim מסוג <code>Retain</code> ל-<code>Delete</code> על <code>PersistentVolume</code>, לאחר שמוחקים את ה-<code>PersistentVolumeClaim</code> המשויך?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. בשתי המדיניות ה-PV והאחסון הפיזי שמאחוריו נמחקים אוטומטית באופן מיידי</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. עם <code>Retain</code>, ה-PV נשאר קיים במצב <code>Released</code> והנתונים על גבי האחסון הפיזי נשמרים - נדרשת פעולה ידנית של מנהל המערכת כדי לפנות ולהשתמש בו מחדש; עם <code>Delete</code>, ה-PV והאחסון הפיזי הנתמך (למשל disk בענן) נמחקים אוטומטית עם מחיקת ה-PVC</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. <code>Retain</code> מוחק את הנתונים אך משאיר את אובייקט ה-PV עצמו; <code>Delete</code> משאיר את הנתונים אך מוחק את אובייקט ה-PV</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. שתי המדיניות מתנהגות זהה בגרסאות מודרניות, ורק <code>Recycle</code> (המיושן) מוחק בפועל את הנתונים</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> <code>Retain</code> הוא המנגנון הבטוח יותר לנתונים קריטיים - הוא לא מוחק כלום אוטומטית, אלא רק מסמן את ה-PV כ-<code>Released</code> ומחכה לפעולה ידנית (ניקוי והגדרה מחדש) לפני שאפשר להשתמש בו שוב. <code>Delete</code> נוח יותר לניהול אוטומטי אך מסוכן יותר - מחיקת PVC גוררת מחיקה מיידית של האחסון הפיזי מתחתיו. <code>Recycle</code> הוא מדיניות ישנה ומיושנת שכבר לא מומלצת לשימוש.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>7. למה נדרש <code>StatefulSet</code> במקום <code>Deployment</code> רגיל עבור אפליקציות עם דרישת זהות רשת יציבה, כמו מסדי נתונים מבוזרים?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. <code>StatefulSet</code> תמיד מהיר יותר ב-startup בהשוואה ל-<code>Deployment</code></button>
    <button class="quiz-option" type="button" data-choice="ב">ב. <code>StatefulSet</code> מעניק לכל Pod זהות רשת יציבה וניתנת לחיזוי (שם קבוע בתבנית <code>&lt;name&gt;-0</code>, <code>&lt;name&gt;-1</code>...) יחד עם PVC ייעודי ויציב לכל instance, ומבטיח סדר יצירה/מחיקה עקבי - לעומת <code>Deployment</code>, שבו Pods מקבלים שמות אקראיים ואין קשר קבוע לאורך זמן בין Pod מסוים ל-Volume שלו</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. <code>Deployment</code> לא תומך כלל ב-<code>PersistentVolumeClaim</code>, ולכן חובה להשתמש ב-<code>StatefulSet</code> לכל Volume</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. <code>StatefulSet</code> הוא היחיד מבין השניים שתומך ב-Rolling Update</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> אפליקציות מבוזרות עם state (Cassandra, Zookeeper, מסדי נתונים בקונפיגורציית cluster) צריכות שכל instance ישמור על אותה זהות (שם/hostname) ואותו Volume גם אחרי restart, כדי לשמור על תפקידו בתוך ה-cluster הפנימי (למשל "אני node מספר 2"). <code>Deployment</code> לא מבטיח את זה - Pods הם בני-חלוף לחלוטין, ללא הבטחת שיוך קבוע ל-Volume מסוים. <code>StatefulSet</code> נבנה במיוחד לפתור את זה, יחד עם <code>volumeClaimTemplates</code> שיוצר PVC ייעודי ועקבי לכל replica.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>8. מהו הסדר הנכון והמחייב בשדרוג קלאסטר קיים באמצעות <code>kubeadm</code>?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. אפשר לשדרג את ה-worker nodes בכל שלב, לפני או אחרי ה-control plane, ללא כל השפעה על יציבות הקלאסטר</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. יש לשדרג תחילה את חבילת kubeadm ולהריץ <code>kubeadm upgrade plan</code> ולאחריו <code>kubeadm upgrade apply</code> על ה-control plane node הראשי, אחר כך control plane nodes נוספים אם קיימים, ורק לבסוף את ה-worker nodes אחד אחרי השני (drain, שדרוג kubelet/kubeadm, uncordon) - סדר הפוך עלול ליצור אי-תאימות גרסאות בין הרכיבים</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. יש לשדרג את כל ה-nodes (control plane וגם workers) בו-זמנית תמיד, אחרת השדרוג ייכשל לגמרי</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. <code>kubeadm</code> משדרג את כל הקלאסטר בפקודה גלובלית אחת, ואין צורך לגעת בכל node בנפרד</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> מדיניות התאימות של Kubernetes מחייבת שגרסת ה-control plane תהיה תמיד גבוהה או שווה לגרסת ה-kubelet על ה-workers, ולא להיפך. לכן חובה לשדרג קודם את ה-control plane (עם <code>upgrade plan</code> לבדיקה ואז <code>upgrade apply</code>), ורק אחר כך לעבור בין ה-worker nodes אחד בכל פעם, כשכל אחד עובר <code>drain</code> לפני השדרוג ו-<code>uncordon</code> אחריו כדי לשמור על זמינות ה-workloads.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>9. איך ה-Scheduler משתמש בשדה <code>requests</code>, ומה ההבדל בהתנהגות כשקונטיינר חורג מ-<code>limits</code> של CPU לעומת חריגה מ-<code>limits</code> של Memory?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. ה-Scheduler מתעלם לחלוטין מ-<code>requests</code>, ומשבץ Pods לפי <code>limits</code> בלבד</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. ה-Scheduler משבץ Pod רק על node שיש בו משאבים פנויים (Allocatable) בכמות שגדולה או שווה לסכום ה-<code>requests</code> של כל הקונטיינרים ב-Pod; בזמן ריצה, חריגה מ-limit של CPU גורמת ל-Throttling (הקצאת המעבד מוגבלת, אך התהליך ממשיך לרוץ), בעוד שחריגה מ-limit של Memory גורמת ל-OOMKill (הקונטיינר נהרג ומופעל מחדש) - כי בניגוד ל-CPU, אי אפשר "לצנן" צריכת זיכרון</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. חריגה מ-limit של Memory גם היא גורמת ל-Throttling בלבד, בדיוק כמו CPU</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. <code>requests</code> ו-<code>limits</code> הם שני שמות לאותו שדה עצמו, ואין ביניהם שום הבדל התנהגותי</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> נקודה קריטית שנבחנת הרבה - <code>requests</code> הוא מה שה-Scheduler מסתכל עליו כדי להחליט על איזה node יש מקום ל-Pod; <code>limits</code> הוא תקרה שנאכפת רק בזמן ריצה על ידי ה-kubelet/runtime. ההבדל בין המשאבים חשוב: CPU הוא משאב "דחיס" (compressible) - חריגה ממנה פשוט מגבילה את קצב העיבוד (Throttling) בלי להרוג את התהליך. Memory הוא משאב "לא דחיס" - אי אפשר "לעצור" תהליך מלהשתמש בזיכרון שהוקצה כבר, ולכן ה-kernel פשוט הורג את הקונטיינר (OOMKilled) כשהוא חורג מהמגבלה.</div>
</div>

<div class="quiz-card" data-answer="ב">
  <p class="quiz-question"><strong>10. יצרתם אובייקט <code>Ingress</code> בקלאסטר, אך אין שום Ingress Controller מותקן. מה קורה בפועל?</strong></p>
  <div class="quiz-options">
    <button class="quiz-option" type="button" data-choice="א">א. Kubernetes מפעיל אוטומטית Ingress Controller מובנה כברירת מחדל, כך שהתעבורה מנותבת כרגיל</button>
    <button class="quiz-option" type="button" data-choice="ב">ב. אובייקט ה-<code>Ingress</code> נשמר ב-etcd כהצהרת כוונות (declaration) בלבד, אך אין שום דבר שקורא אותו ומיישם בפועל את כללי הניתוב - תעבורה חיצונית לא תגיע ליעד עד שיותקן Ingress Controller (למשל NGINX Ingress Controller, Traefik) שמיישם את הכללים בפועל</button>
    <button class="quiz-option" type="button" data-choice="ג">ג. פעולת ה-apply של אובייקט ה-<code>Ingress</code> תיכשל עם שגיאה, כי אי אפשר ליצור אותו בלי controller קיים מראש</button>
    <button class="quiz-option" type="button" data-choice="ד">ד. <code>kube-proxy</code> הוא זה שמיישם את כללי ה-<code>Ingress</code> ישירות מתוך ה-kube-proxy עצמו, ללא צורך ברכיב נוסף</button>
  </div>
  <div class="quiz-result" aria-live="polite"></div>
  <div class="quiz-explain"><strong>הסבר:</strong> טעות נפוצה מאוד - אובייקט ה-<code>Ingress</code> הוא רק Spec דקלרטיבי שמתאר כללי ניתוב רצויים (hosts, paths, backend services). בפני עצמו הוא לא עושה כלום - הוא חייב Ingress Controller (רכיב נפרד שרץ כ-Pods בקלאסטר, כמו NGINX Ingress Controller) שסורק אובייקטי <code>Ingress</code> ומיישם אותם בפועל, בדרך כלל דרך Load Balancer/Reverse Proxy אמיתי. בלי Controller מותקן, אפשר ליצור כמה אובייקטי <code>Ingress</code> שרוצים - הם פשוט "יישבו" ב-API בלי שום השפעה על תעבורת רשת אמיתית.</div>
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
