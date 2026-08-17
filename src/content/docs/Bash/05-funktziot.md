---
title: "פונקציות ב-Bash"
category: Bash
part: 5/10
---

## הגדרת פונקציה

```bash
# תחביר 1
greet() {
  echo "שלום, $1!"
}

# תחביר 2 (עם המילה function - פחות נפוץ אך תקין)
function greet2 {
  echo "שלום, $1!"
}

greet "דן"     # שלום, דן!
```

## ארגומנטים לפונקציה

```bash
my_func() {
  echo "ארגומנט 1: $1"
  echo "ארגומנט 2: $2"
  echo "כמות ארגומנטים: $#"
  echo "כל הארגומנטים: $@"
}

my_func "hello" "world"
```

⚠️ שימו לב: `$0` בתוך פונקציה **לא** משתנה לשם הפונקציה - הוא עדיין שם הסקריפט. לשם הפונקציה יש להשתמש ב-`$FUNCNAME`.

## ערך חזרה (return) לעומת exit code

פונקציות ב-Bash לא מחזירות ערכים כמו בשפות אחרות - `return` קובע רק exit code (0-255):

```bash
is_even() {
  if (( $1 % 2 == 0 )); then
    return 0   # הצלחה = "true"
  else
    return 1   # כישלון = "false"
  fi
}

if is_even 4; then
  echo "זוגי"
fi
```

## החזרת "ערך" אמיתי - דרך echo + command substitution

```bash
add() {
  local result=$(( $1 + $2 ))
  echo $result       # "מחזירים" ע"י הדפסה לפלט הסטנדרטי
}

sum=$(add 5 3)
echo "הסכום הוא: $sum"
```

## שימוש ב-local למניעת זיהום namespace

```bash
counter=100

increment() {
  local counter=0    # ללא local, זה היה משנה את המשתנה הגלובלי!
  ((counter++))
  echo "בתוך הפונקציה: $counter"
}

increment
echo "מחוץ לפונקציה: $counter"   # עדיין 100
```

## פונקציות רקורסיביות

```bash
factorial() {
  local n=$1
  if (( n <= 1 )); then
    echo 1
  else
    local prev=$(factorial $((n - 1)))
    echo $((n * prev))
  fi
}

echo "5! = $(factorial 5)"    # 120
```

## פונקציה עם מספר משתנה של ארגומנטים

```bash
sum_all() {
  local total=0
  for num in "$@"; do
    total=$((total + num))
  done
  echo $total
}

echo $(sum_all 1 2 3 4 5)   # 15
```

## פונקציות כ-callback / higher order

```bash
run_with_logging() {
  local func_name=$1
  echo "מריץ $func_name..."
  $func_name
  echo "$func_name הסתיים"
}

say_hi() {
  echo "היי!"
}

run_with_logging say_hi
```

## ייצוא פונקציות לתת-תהליכים

```bash
my_func() {
  echo "פונקציה מיוצאת"
}
export -f my_func

bash -c 'my_func'   # ניתן להריץ אותה גם בתת-shell חדש
```

## מערכים כארגומנטים לפונקציה

```bash
print_array() {
  local arr=("$@")
  for item in "${arr[@]}"; do
    echo "- $item"
  done
}

my_array=("a" "b" "c")
print_array "${my_array[@]}"
```

## דוגמה מעשית: פונקציית לוגים

```bash
log() {
  local level=$1
  shift
  local message="$@"
  local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
  echo "[$timestamp] [$level] $message"
}

log "INFO" "השירות עלה בהצלחה"
log "ERROR" "לא ניתן להתחבר למסד הנתונים"
```

## טיפים וטריקים

1. תמיד השתמשו ב-`local` למשתנים בתוך פונקציות, אלא אם כוונתכם שהם ישפיעו על ה-scope הגלובלי.
2. `return` יכול להחזיר רק מספרים 0-255 - לערכי טקסט או מספרים גדולים יש להשתמש ב-`echo` + command substitution, או במשתנה גלובלי.
3. `shift` שימושי כדי "לצרוך" ארגומנטים אחד-אחד בתוך פונקציה (למשל כשארגומנט ראשון הוא flag וכל השאר הם הודעה).
4. `declare -F` מציג את כל שמות הפונקציות המוגדרות בסביבה הנוכחית.
5. אפשר להגדיר "ברירת מחדל" לפרמטרים חסרים: `local name=${1:-"Guest"}`.

## שאלות ראיון עבודה נפוצות

**ש: איך פונקציה ב-Bash "מחזירה ערך"?**
ת: ל-Bash אין מנגנון return value אמיתי לטיפוסים כלליים - `return` מגביל ל-exit code בין 0-255. כדי להחזיר טקסט או מספר כלשהו, משתמשים ב-`echo` בתוך הפונקציה ותופסים אותו עם command substitution: `result=$(my_func)`.

**ש: מה עושה `local` ולמה חשוב להשתמש בו?**
ת: `local` מגביל את היקף (scope) המשתנה לפונקציה בלבד, כדי למנוע שינוי בטעות של משתנים גלובליים באותו שם - חשוב במיוחד בסקריפטים גדולים או בפונקציות רקורסיביות.

**ש: מה עושה `shift` בתוך פונקציה?**
ת: מזיז את כל הפרמטרים הפוזיציוניים (`$1`, `$2`...) שמאלה באחד, כך ש-`$2` הופך ל-`$1` וכו'. שימושי לעיבוד ארגומנטים אחד-אחד בלולאה.

**ש: מה ההבדל בין `$0` בתוך פונקציה לבין `$FUNCNAME`?**
ת: `$0` תמיד מציג את שם הסקריפט המקורי, ולא משתנה בתוך פונקציה. `$FUNCNAME` (מערך) מכיל את שם הפונקציה הנוכחית וקריאת ההיררכיה שלה.

**ש: איך מריצים פונקציה בתוך תת-shell (subshell) חדש?**
ת: יש לייצא אותה תחילה עם `export -f function_name`, ואז ניתן לקרוא לה למשל דרך `bash -c 'function_name'`.

## תרגילים לתרגול עצמי

1. כתבו פונקציה המקבלת שני מספרים ומחזירה (מדפיסה) את המקסימום ביניהם.
2. כתבו פונקציה רקורסיבית לחישוב סדרת פיבונאצ'י.
3. כתבו פונקציית לוגים שמקבלת רמת חומרה והודעה, ומדפיסה אותם עם timestamp בפורמט אחיד.

## קישורים נוספים

**דוקומנטציה:**
- [Bash Reference Manual - Shell Functions](https://www.gnu.org/software/bash/manual/bash.html#Shell-Functions)

**סרטוני יוטיוב:**
- [The Complete Bash Scripting Course - Dave Eddy](https://www.youtube.com/watch?v=Sx9zG7wa4FA)
- [Bash Scripting for Beginners - LearnLinuxTV](https://www.youtube.com/watch?v=2733cRPudvI)

---
[<< מדריך קודם: לולאות](/bash/04-lulaot/) | [המדריך הבא: מערכים >>](/bash/06-mearachim/)
