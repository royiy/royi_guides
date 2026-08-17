---
title: "משתנים, פרמטרים ו-Environment ב-Bash"
category: Bash
part: 2/10
---

## הגדרת משתנים

ב-Bash **אסור** רווח סביב סימן ה-`=`:

```bash
name="Dan"       # תקין
name = "Dan"     # שגיאה! bash ינסה להריץ "name" כפקודה
```

## שימוש במשתנים

```bash
name="Dan"
echo "שלום $name"
echo "שלום ${name}!"     # סוגריים מסולסלים - מומלץ כדי להימנע מדו-משמעות
echo "שלום ${name}kovsky" # למשל כאן הסוגריים הכרחיים
```

## משתנים גלובליים מול לוקאליים

```bash
x=10

my_func() {
  local x=20    # local - תקף רק בתוך הפונקציה
  echo "בתוך הפונקציה: $x"
}

my_func
echo "מחוץ לפונקציה: $x"   # עדיין 10
```

## Environment Variables (משתני סביבה)

```bash
export MY_VAR="value"    # הופך משתנה למשתנה סביבה, נגיש לתהליכי-בן
echo $HOME                # תיקיית הבית של המשתמש
echo $PATH                 # רשימת תיקיות לחיפוש פקודות
echo $USER                 # שם המשתמש הנוכחי
echo $PWD                  # התיקייה הנוכחית
echo $SHELL                # ה-shell הנוכחי
env                        # הצגת כל משתני הסביבה
unset MY_VAR               # מחיקת משתנה
```

## Read-only ו-Constants

```bash
readonly PI=3.14159
PI=4   # שגיאה: PI: readonly variable
```

## Command Substitution - הצבת תוצאת פקודה

```bash
today=$(date +%Y-%m-%d)
echo "התאריך: $today"

files=`ls`          # תחביר ישן - לא מומלץ
files=$(ls)          # תחביר מודרני - מומלץ

count=$(find . -name "*.txt" | wc -l)
echo "נמצאו $count קבצי txt"
```

## חשבון אריתמטי (Arithmetic)

```bash
a=5
b=3

echo $((a + b))       # 8
echo $((a * b))       # 15
echo $((a ** 2))      # 25 (חזקה)
echo $((a % b))       # 2 (שארית)

((a++))                # הגדלה ב-1
((a += 10))             # הוספה

result=$((a + b))
let "result = a + b"    # דרך אלטרנטיבית

# עבור שברים יש להשתמש ב-bc
echo "scale=2; 10/3" | bc
```

## פרמטרים מיוחדים

```bash
$0     # שם הסקריפט
$1 $2  # ארגומנטים ראשון, שני וכו'
$#     # מספר הארגומנטים שהתקבלו
$@     # כל הארגומנטים כרשימה נפרדת
$*     # כל הארגומנטים כמחרוזת אחת
$$     # PID של התהליך הנוכחי
$?     # קוד החזרה של הפקודה האחרונה
$!     # PID של תהליך הרקע האחרון
```

דוגמה:

```bash
#!/bin/bash
echo "שם הסקריפט: $0"
echo "ארגומנט ראשון: $1"
echo "כמות ארגומנטים: $#"
echo "כל הארגומנטים: $@"

for arg in "$@"; do
  echo "טיפול בארגומנט: $arg"
done
```

## Default values ו-Parameter Expansion

```bash
echo ${name:-"ברירת מחדל"}     # אם name ריק/לא מוגדר, מציג ברירת מחדל
echo ${name:="default"}         # כנ"ל, ובנוסף שומר את הערך במשתנה
echo ${name:?"שגיאה: name לא הוגדר"}  # יוצא עם שגיאה אם ריק

unset var
echo ${var:-fallback}   # fallback

# חיתוך מחרוזות
str="Hello World"
echo ${#str}             # אורך המחרוזת: 11
echo ${str:0:5}           # תת-מחרוזת מאינדקס 0, אורך 5: "Hello"
echo ${str:6}              # מאינדקס 6 עד הסוף: "World"
```

## משתני מערך (הקדמה - הרחבה במדריך 6)

```bash
arr=(apple banana cherry)
echo ${arr[0]}       # apple
echo ${arr[@]}        # כל האיברים
echo ${#arr[@]}        # כמות איברים
```

## טיפים וטריקים

1. תמיד עטפו משתנים במרכאות כפולות: `"$var"` ולא `$var` - כדי למנוע Word Splitting בעייתי כשיש רווחים בערך.
2. השתמשו ב-`${var:-default}` במקום בדיקות `if` ארוכות לערכי ברירת מחדל.
3. `declare -i num=5` - מגדיר משתנה כמספר שלם (integer), כך שכל השמה אליו תתפרש כביטוי אריתמטי.
4. `declare -x VAR=val` - שקול ל-export.
5. משתני `$RANDOM`, `$SECONDS`, `$LINENO` הם משתנים מובנים שימושיים לדיבוג ולסקריפטים אקראיים.

## שאלות ראיון עבודה נפוצות

**ש: מה ההבדל בין `$@` ל-`$*`?**
ת: כששניהם בתוך מרכאות - `"$@"` שומר כל ארגומנט כרכיב נפרד ברשימה (חשוב ללולאות עם רווחים בערכים), בעוד `"$*"` מאחד את כולם למחרוזת אחת מופרדת ברווח (או ב-IFS).

**ש: למה חשוב לעטוף משתנים במרכאות?**
ת: כדי למנוע Word Splitting ו-Globbing לא רצויים. למשל `rm $file` עם `file="my file.txt"` ינסה למחוק שני קבצים בשם "my" ו-"file.txt" בנפרד, בעוד `rm "$file"` יטפל בזה נכון כקובץ אחד.

**ש: מה ההבדל בין `local` ל-`declare` בתוך פונקציה?**
ת: `local` תמיד מגביל את היקף המשתנה לפונקציה הנוכחית. `declare` בתוך פונקציה גם הוא לוקאלי כברירת מחדל, אבל הוא מאפשר בנוסף להגדיר תכונות (integer, array, readonly וכו').

**ש: איך מגדירים משתנה קבוע (constant) ב-Bash?**
ת: `readonly NAME=value` - לאחר מכן כל ניסיון שינוי יגרום לשגיאה.

**ש: מה זה Command Substitution ואיך משתמשים בו?**
ת: מנגנון שמאפשר להריץ פקודה ולהשתמש בפלט שלה כערך. תחביר מודרני: `$(command)`, תחביר ישן: `` `command` ``.

## תרגילים לתרגול עצמי

1. כתבו סקריפט שמקבל שם וגיל כארגומנטים ומדפיס משפט מלא.
2. כתבו סקריפט שמחשב את סכום שני מספרים שהתקבלו כארגומנטים.
3. כתבו סקריפט שמשתמש ב-`${var:-default}` כדי לתת ערך ברירת מחדל לתיקיית גיבוי.

## קישורים נוספים

**דוקומנטציה:**
- [Bash Reference Manual - Shell Parameters](https://www.gnu.org/software/bash/manual/bash.html#Shell-Parameters)
- [Bash Reference Manual - Shell Parameter Expansion](https://www.gnu.org/software/bash/manual/bash.html#Shell-Parameter-Expansion)

**סרטוני יוטיוב:**
- [Bash Scripting Full Course 3 Hours](https://www.youtube.com/watch?v=e7BufAVwDiM)
- [The Complete Bash Scripting Course - Dave Eddy](https://www.youtube.com/watch?v=Sx9zG7wa4FA)

---
[<< מדריך קודם: מבוא](/bash/01-mavo-yesodot/) | [המדריך הבא: תנאים >>](/bash/03-tnaim/)
