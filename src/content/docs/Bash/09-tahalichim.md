---
title: "ניהול תהליכים, Jobs ו-Signals ב-Bash"
category: Bash
part: 9/10
---

## הרצת תהליך ברקע

```bash
long_running_command &     # הרצה ברקע
echo "PID של התהליך: $!"    # $! מחזיק את ה-PID של תהליך הרקע האחרון

sleep 100 &
jobs                        # רשימת ה-jobs הפעילים ב-shell הנוכחי
jobs -l                      # עם PIDs
```

## foreground / background / suspend

```bash
long_command             # רץ ב-foreground
# Ctrl+Z                   # השהיה (suspend) של התהליך

bg                        # המשך ריצה ברקע
fg                         # החזרה ל-foreground
fg %1                       # החזרת job מספר 1 ל-foreground
```

## ps - הצגת תהליכים

```bash
ps aux                      # כל התהליכים במערכת
ps aux | grep nginx           # חיפוש תהליך ספציפי
ps -ef --forest                # תצוגת עץ תהליכים (parent/child)
top                              # תצוגה דינמית של תהליכים ומשאבים
htop                               # גרסה משופרת (אם מותקן)
```

## שליחת אותות (Signals) לתהליכים

```bash
kill PID                 # שליחת SIGTERM (בקשה מנומסת לסיום)
kill -9 PID                # SIGKILL (סיום כפוי, לא ניתן לתפוס/להתעלם)
kill -SIGTERM PID           # אותו דבר, בשם מלא
kill -l                      # רשימת כל האותות הזמינים

killall process_name         # הרג כל התהליכים בשם נתון
pkill -f "pattern"             # הרג לפי pattern בשורת הפקודה
```

## אותות נפוצים

```
SIGHUP  (1)  - נשלח כשחיבור/טרמינל נסגר; לעתים גורם לתהליך "לטעון מחדש"
SIGINT  (2)  - נשלח ע"י Ctrl+C
SIGKILL (9)  - סיום כפוי, לא ניתן לחסום/לתפוס
SIGTERM (15) - בקשת סיום "מנומסת" - ברירת המחדל של kill
SIGSTOP (19) - השהיה כפויה
SIGCONT (18) - המשך ריצה אחרי השהיה
```

## trap - תפיסת אותות בתוך סקריפט

```bash
#!/bin/bash
cleanup() {
  echo "מנקה משאבים לפני יציאה..."
  rm -f /tmp/mylockfile
  exit
}

trap cleanup SIGINT SIGTERM EXIT

echo "רץ... לחץ Ctrl+C לעצירה"
while true; do
  sleep 1
done
```

`trap` שימושי במיוחד עם `EXIT` - קוד שמתבצע תמיד בסיום הסקריפט, בין אם הצליח, נכשל, או הופסק.

## wait - המתנה לסיום תהליכי רקע

```bash
process1 &
pid1=$!
process2 &
pid2=$!

wait $pid1
echo "process1 סיים"
wait $pid2
echo "process2 סיים"

# או פשוט להמתין לכולם
wait
echo "כל תהליכי הרקע סיימו"
```

## הרצה מקבילית של מספר תהליכים

```bash
#!/bin/bash
for url in "${urls[@]}"; do
  curl -s "$url" -o "$(basename "$url")" &
done
wait   # המתנה לכל ה-downloads שיסתיימו
echo "כל ההורדות הסתיימו"
```

## nohup - הרצת תהליך שישרוד ניתוק טרמינל

```bash
nohup long_script.sh &      # ימשיך לרוץ גם אם ה-terminal נסגר
nohup long_script.sh > output.log 2>&1 &
disown                       # מסיר את התהליך מרשימת ה-jobs של ה-shell
```

## בדיקה אם תהליך רץ

```bash
if pgrep -x "nginx" > /dev/null; then
  echo "nginx רץ"
else
  echo "nginx לא רץ"
fi

if ps -p $pid > /dev/null; then
  echo "התהליך עם PID $pid עדיין רץ"
fi
```

## עדיפות תהליכים (nice/renice)

```bash
nice -n 10 long_command      # הרצה בעדיפות נמוכה יותר (0=רגיל, 19=הכי נמוך)
renice 10 -p PID                # שינוי עדיפות לתהליך שכבר רץ
```

## דוגמה מעשית: lock file למניעת ריצה כפולה

```bash
#!/bin/bash
LOCKFILE="/tmp/myscript.lock"

if [ -e "$LOCKFILE" ]; then
  echo "הסקריפט כבר רץ! (lock file קיים)"
  exit 1
fi

trap 'rm -f "$LOCKFILE"' EXIT
touch "$LOCKFILE"

echo "מבצע עבודה..."
sleep 10
echo "הושלם"
```

## טיפים וטריקים

1. השתמשו ב-`trap ... EXIT` תמיד בסקריפטים שיוצרים קבצים זמניים/locks, כדי להבטיח ניקוי גם במקרה של כישלון או Ctrl+C.
2. `kill -9` הוא מוצא אחרון - הוא לא מאפשר לתהליך לנקות משאבים או לשמור state לפני המוות.
3. `wait` בלי ארגומנטים ממתין לכל תהליכי הרקע של ה-shell הנוכחי - שימושי מאוד להרצה מקבילית.
4. `disown` מנתק job מרשימת ה-jobs של ה-shell כדי שסגירת הטרמינל לא תשלח לו SIGHUP.
5. `pgrep`/`pkill` נוחים יותר מ-`ps | grep` כי הם לא "תופסים את עצמם" בתוצאות החיפוש.

## שאלות ראיון עבודה נפוצות

**ש: מה ההבדל בין SIGTERM ל-SIGKILL?**
ת: SIGTERM (15) הוא בקשה "מנומסת" לסיום - התהליך יכול לתפוס אותו (trap) ולבצע ניקוי לפני היציאה. SIGKILL (9) הוא סיום כפוי ברמת מערכת ההפעלה, לא ניתן לתפוס, לחסום או להתעלם ממנו - התהליך מומת מיידית.

**ש: מה עושה `trap` וכיצד הוא שימושי?**
ת: `trap` מאפשר להגדיר קוד שירוץ כאשר הסקריפט מקבל אות (signal) מסוים, כמו SIGINT (Ctrl+C) או EXIT (בסיום הסקריפט בכל דרך). שימושי לניקוי משאבים, מחיקת קבצים זמניים, או שחרור locks.

**ש: מה ההבדל בין `$!` ל-`$$`?**
ת: `$!` מכיל את ה-PID של תהליך הרקע (background) האחרון שהופעל. `$$` מכיל את ה-PID של ה-shell/תהליך הנוכחי עצמו.

**ש: מה עושה הפקודה `wait`?**
ת: משהה את ריצת ה-shell עד שתהליך רקע מסוים (אם ניתן PID) - או כל תהליכי הרקע (ללא ארגומנטים) - מסיימים לרוץ. שימושי מאוד לסנכרון עבודה מקבילית.

**ש: מה ההבדל בין `kill PID` לבין `kill -9 PID`?**
ת: `kill PID` (ללא flag) שולח SIGTERM כברירת מחדל - בקשה מנומסת שהתהליך יכול לתפוס ולנקות אחריו. `kill -9 PID` שולח SIGKILL שהורג את התהליך מיידית וללא אפשרות טיפול.

## תרגילים לתרגול עצמי

1. כתבו סקריפט שמריץ 3 פקודות ברקע במקביל וממתין שכולן יסתיימו לפני שהוא מדפיס "הכל הושלם".
2. כתבו סקריפט המשתמש ב-lock file כדי למנוע הרצה כפולה של עצמו.
3. כתבו סקריפט שתופס SIGINT (Ctrl+C) ומדפיס הודעת פרידה לפני היציאה, במקום להיסגר בפתאומיות.

## קישורים נוספים

**דוקומנטציה:**
- [Bash Reference Manual - Job Control](https://www.gnu.org/software/bash/manual/bash.html#Job-Control)
- [Bash Reference Manual - Signals](https://www.gnu.org/software/bash/manual/bash.html#Signals)

**סרטוני יוטיוב:**
- [Linux Shell Scripting Full Course](https://www.youtube.com/watch?v=jddTCwWA0rw)
- [Bash Shell Scripting, 2nd Edition - Sander van Vugt](https://www.oreilly.com/videos/-/9780137689064)

---
[<< מדריך קודם: קבצים ו-I/O](/bash/08-kvatzim-io/) | [המדריך הבא: דיבוג ו-Best Practices >>](/bash/10-debug-best-practices/)
