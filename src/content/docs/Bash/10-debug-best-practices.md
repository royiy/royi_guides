---
title: "דיבוג, Best Practices וטריקים מתקדמים ב-Bash"
category: Bash
part: 10/10
---

## מצבי דיבוג מובנים

```bash
#!/bin/bash
set -x    # מדפיס כל פקודה לפני הרצתה (trace mode) - הכי שימושי לדיבוג
set +x    # כיבוי trace mode

set -v    # מדפיס כל שורת קלט כפי שהיא נקראת (כולל הערות)
set -n    # בודק תחביר בלבד, בלי להריץ בפועל (syntax check)

bash -x script.sh    # הרצת סקריפט שלם עם trace mode
```

## "Strict Mode" - הגנות מומלצות לכל סקריפט

```bash
#!/bin/bash
set -euo pipefail
IFS=$'\n\t'

# -e : עצירה מיידית בכל שגיאה
# -u : שגיאה בשימוש במשתנה לא מוגדר
# -o pipefail : כישלון בכל שלב ב-pipe נחשב לכישלון כולל (לא רק האחרון)
# IFS מוגבל ל-newline וטאב, למניעת התנהגות מוזרה עם רווחים
```

⚠️ שימו לב: `set -e` לא תמיד עוצר במקומות שאתם מצפים (למשל בתוך `if` conditions, או בפקודה שבצד שמאל של `&&`). חשוב להבין את המגבלות שלו ולא לסמוך עליו עיוורת.

## ShellCheck - כלי סטטי לבדיקת סקריפטים

```bash
shellcheck script.sh
```

ShellCheck מזהה עשרות בעיות נפוצות: quoting חסר, שימוש שגוי במשתנים, פקודות מיושנות, בעיות portability, ועוד. **חובה** לכל סקריפט production. אפשר גם להריץ [אונליין](https://www.shellcheck.net/).

## בדיקת תחביר בלבד

```bash
bash -n script.sh    # בודק תחביר בלי להריץ
```

## דיבוג עם משתנים מובנים

```bash
echo "שורה נוכחית: $LINENO"
echo "שם הפונקציה: ${FUNCNAME[0]}"
echo "PID: $$"

# הדפסת stack trace בפונקציית שגיאה
error_trace() {
  local i=0
  while caller $i; do
    ((i++))
  done
}
```

## PS4 - התאמת פורמט ה-trace

```bash
export PS4='+ ${BASH_SOURCE}:${LINENO}: '
set -x
# עכשיו כל שורת trace תציג את הקובץ ומספר השורה - מעולה לדיבוג סקריפטים גדולים
```

## Error Handling מובנה

```bash
#!/bin/bash
set -euo pipefail

handle_error() {
  local exit_code=$?
  local line_no=$1
  echo "שגיאה בשורה $line_no, exit code: $exit_code" >&2
  exit $exit_code
}

trap 'handle_error $LINENO' ERR

risky_command   # אם ייכשל, handle_error יופעל אוטומטית
```

## בדיקת ארגומנטים ופרסור flags עם getopts

```bash
#!/bin/bash
usage() {
  echo "שימוש: $0 -n name -a age [-v]"
  exit 1
}

verbose=false
while getopts "n:a:vh" opt; do
  case $opt in
    n) name=$OPTARG ;;
    a) age=$OPTARG ;;
    v) verbose=true ;;
    h) usage ;;
    *) usage ;;
  esac
done

echo "שם: $name, גיל: $age, verbose: $verbose"
```

## ארגון קוד: מבנה סקריפט מומלץ

```bash
#!/bin/bash
#
# תיאור: סקריפט לגיבוי אוטומטי
# שימוש: ./backup.sh <source> <destination>

set -euo pipefail

# --- קבועים והגדרות ---
readonly LOG_FILE="/var/log/backup.log"

# --- פונקציות עזר ---
log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

validate_args() {
  if [ $# -ne 2 ]; then
    echo "שגיאה: נדרשים 2 ארגומנטים" >&2
    exit 1
  fi
}

# --- לוגיקה ראשית ---
main() {
  validate_args "$@"
  local source=$1
  local dest=$2

  log "מתחיל גיבוי מ-$source ל-$dest"
  # ... לוגיקת הגיבוי
  log "גיבוי הסתיים בהצלחה"
}

main "$@"
```

## ביצועים: builtin לעומת external commands

```bash
# איטי - יוצר תהליך חדש בכל קריאה
for i in $(seq 1 1000); do
  result=$(expr $i + 1)
done

# מהיר - כל החישוב נשאר בתוך ה-shell
for ((i=1; i<=1000; i++)); do
  result=$((i + 1))
done
```

## הימנעות מ-antipatterns נפוצים

```bash
# רע: פרסור פלט של ls
for f in $(ls); do ...   # ישבר עם רווחים בשמות קבצים

# טוב:
for f in *; do ...

# רע: שימוש ב-cat מיותר (UUOC - Useless Use of Cat)
cat file.txt | grep "pattern"

# טוב:
grep "pattern" file.txt

# רע: בדיקת exit code עם if [ $? -eq 0 ]
command
if [ $? -eq 0 ]; then ...

# טוב:
if command; then ...
```

## טיפים וטריקים

1. הריצו `shellcheck` על כל סקריפט לפני שהוא הולך ל-production - זה חוסך שעות דיבוג.
2. `set -euo pipefail` הוא ה-baseline לכל סקריפט רציני, אבל תבינו את מגבלותיו (במיוחד עם `set -e`).
3. `trap 'handle_error $LINENO' ERR` נותן לכם error handling מרכזי במקום לבדוק `$?` אחרי כל פקודה.
4. תעדו כל סקריפט עם comment header שמסביר מטרה, שימוש, ותלויות.
5. השתמשו ב-`getopts` לפרסור flags במקום לבדוק `$1`, `$2` ידנית - זה קריא יותר ומתרחב יותר בקלות.
6. כתבו פונקציות קטנות עם שם ברור (`validate_input`, `send_notification`) במקום סקריפט ליניארי ארוך - קל יותר לתחזק ולבדוק.

## שאלות ראיון עבודה נפוצות

**ש: מה עושה `set -euo pipefail` ולמה זה חשוב?**
ת: `-e` עוצר את הסקריפט מיד עם כישלון פקודה, `-u` הופך שימוש במשתנה לא מוגדר לשגיאה, `-o pipefail` גורם ל-pipe שלם להיכשל אם כל שלב בו נכשל (לא רק הפקודה האחרונה). יחד הם "strict mode" שמונע המשך ריצה שקטה עם באגים.

**ש: איך מדבגים סקריפט Bash?**
ת: הכלים העיקריים: `bash -x script.sh` (trace mode - מציג כל פקודה לפני הרצתה), `bash -n script.sh` (בדיקת תחביר בלבד), `set -x`/`set +x` בתוך הסקריפט לדיבוג ממוקד, ו-`shellcheck` לניתוח סטטי לפני ההרצה.

**ש: מה זה ShellCheck ולמה כדאי להשתמש בו?**
ת: כלי ניתוח סטטי (linter) לסקריפטי shell שמזהה בעיות נפוצות - quoting חסר, שימוש שגוי במשתנים, בעיות תאימות בין shells, ועוד - לפני שהסקריפט אפילו רץ. שימוש בו מונע המון באגים נפוצים ומשפר את איכות הקוד.

**ש: מהי UUOC (Useless Use of Cat) ומדוע רצוי להימנע ממנה?**
ת: שימוש מיותר ב-`cat` כדי "להזין" תוכן לפקודה שיכולה לקרוא ישירות מקובץ, למשל `cat file | grep x` במקום `grep x file`. זה יוצר תהליך נוסף מיותר ופוגע קלות בביצועים, בפרט בסקריפטים שרצים בלולאות.

**ש: מה ההבדל בין `trap ... ERR` ל-`trap ... EXIT`?**
ת: `ERR` מופעל כל פעם שפקודה נכשלת (exit code שונה מ-0), בעוד `EXIT` מופעל תמיד כשה-script מסתיים - בין אם בהצלחה, כישלון, או אפילו כתוצאה מ-`kill`/Ctrl+C. משתמשים לרוב ב-`EXIT` לניקוי משאבים תמיד, וב-`ERR` ללוגיקת error handling ספציפית.

**ש: למה `getopts` עדיף על בדיקה ידנית של `$1`, `$2`?**
ת: `getopts` מספק תחביר סטנדרטי ומוכר לפרסור flags (למשל `-n value -v`), תומך בקלות בסדר ארגומנטים שונה ובפלגים בוליאניים, ומטפל אוטומטית בשגיאות פרסור בסיסיות - מה שהופך את הקוד לקריא ותחזוקתי יותר מהשוואות ידניות מרובות.

## תרגילים לתרגול עצמי

1. קחו סקריפט קיים (שלכם או מהמדריכים הקודמים) והריצו עליו `shellcheck` - תקנו את כל האזהרות.
2. כתבו סקריפט עם `trap ... ERR` שמדפיס הודעת שגיאה מפורטת (כולל מספר שורה) בכל כישלון.
3. כתבו סקריפט שמקבל flags עם `getopts` (למשל `-f file -o output -v`) ומטפל בכל אחד מהם.

## קישורים נוספים

**דוקומנטציה:**
- [Bash Reference Manual - The Set Builtin](https://www.gnu.org/software/bash/manual/bash.html#The-Set-Builtin)
- [Bash Reference Manual - Bourne Shell Builtins (getopts)](https://www.gnu.org/software/bash/manual/bash.html#Bourne-Shell-Builtins)
- [ShellCheck - Online Linter](https://www.shellcheck.net/)
- [Google Shell Style Guide](https://google.github.io/styleguide/shellguide.html)

**סרטוני יוטיוב:**
- [Bash Shell Scripting, 2nd Edition - Sander van Vugt](https://www.oreilly.com/videos/-/9780137689064)
- [Shell Scripting Full Course - Basics to Advanced](https://www.youtube.com/watch?v=fAgz66M4aNc)

---
[<< מדריך קודם: ניהול תהליכים](/bash/09-tahalichim/) | [חזרה למדריך 1 >>](/bash/01-mavo-yesodot/)
