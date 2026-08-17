---
title: "תנאים (if, case) ב-Bash"
category: Bash
part: 3/10
---

## מבנה if בסיסי

```bash
#!/bin/bash
num=10

if [ $num -gt 5 ]; then
  echo "המספר גדול מ-5"
elif [ $num -eq 5 ]; then
  echo "המספר שווה ל-5"
else
  echo "המספר קטן מ-5"
fi
```

## `[ ]` מול `[[ ]]`

```bash
# [ ] - POSIX test, ישן ותואם sh
if [ "$str" = "hello" ]; then echo "match"; fi

# [[ ]] - bash extension, מודרני ומומלץ
if [[ "$str" == "hello" ]]; then echo "match"; fi

# [[ ]] תומך ב-pattern matching ולא דורש escaping ל->/<
if [[ "$file" == *.txt ]]; then echo "קובץ טקסט"; fi

# [[ ]] תומך גם ב-&& ו-|| ישירות בפנים
if [[ $num -gt 5 && $num -lt 20 ]]; then echo "בטווח"; fi
```

## אופרטורים להשוואת מספרים

```bash
-eq   # שווה (equal)
-ne   # שונה (not equal)
-gt   # גדול מ (greater than)
-lt   # קטן מ (less than)
-ge   # גדול או שווה
-le   # קטן או שווה
```

## אופרטורים להשוואת מחרוזות

```bash
=   או  ==   # שווה
!=            # לא שווה
-z "$str"     # true אם המחרוזת ריקה
-n "$str"     # true אם המחרוזת לא ריקה
<   >          # השוואה לקסיקוגרפית (בתוך [[ ]] בלבד, ללא escape)
```

## בדיקות קבצים ותיקיות

```bash
-e file    # קיים
-f file    # קובץ רגיל
-d file    # תיקייה
-L file    # קישור סימבולי
-r file    # ניתן לקריאה
-w file    # ניתן לכתיבה
-x file    # ניתן להרצה
-s file    # קיים וגודלו גדול מ-0

if [ -f "config.txt" ]; then
  echo "קובץ הקונפיגורציה קיים"
fi

if [ -d "/var/log" ]; then
  echo "תיקיית הלוגים קיימת"
fi
```

## תנאי מורכב עם AND / OR

```bash
if [ "$age" -ge 18 ] && [ "$has_id" = "yes" ]; then
  echo "כניסה מותרת"
fi

if [[ $day == "Saturday" || $day == "Sunday" ]]; then
  echo "סוף שבוע"
fi

# תחביר POSIX ישן יותר (עם [ ] בודד):
if [ "$age" -ge 18 -a "$has_id" = "yes" ]; then
  echo "כניסה מותרת (סגנון ישן)"
fi
```

## Ternary-like עם &&/||

ב-Bash אין אופרטור טרנרי אמיתי, אבל אפשר לדמות:

```bash
[ -f "$file" ] && echo "קיים" || echo "לא קיים"
```

⚠️ שימו לב: אם החלק הראשון (`echo "קיים"`) ייכשל, גם ה-else ירוץ. לכן ל-logic קריטי עדיפים if/else מלאים.

## case - מקבילה ל-switch

```bash
#!/bin/bash
read -p "בחר אפשרות (start/stop/restart): " action

case $action in
  start)
    echo "מתחיל שירות..."
    ;;
  stop)
    echo "עוצר שירות..."
    ;;
  restart)
    echo "מפעיל מחדש..."
    ;;
  *)
    echo "אפשרות לא מוכרת"
    ;;
esac
```

case עם patterns מרובים ו-wildcards:

```bash
case $filename in
  *.jpg|*.png|*.gif)
    echo "קובץ תמונה"
    ;;
  *.mp4|*.avi)
    echo "קובץ וידאו"
    ;;
  *)
    echo "סוג לא ידוע"
    ;;
esac
```

## בדיקת קיום משתנה מוגדר

```bash
if [ -z "${MY_VAR+x}" ]; then
  echo "המשתנה לא הוגדר בכלל"
else
  echo "המשתנה הוגדר (גם אם ריק)"
fi
```

## תנאים אריתמטיים עם (( ))

```bash
num=15
if (( num > 10 && num < 20 )); then
  echo "בטווח 10-20"
fi

if (( num % 2 == 0 )); then
  echo "זוגי"
else
  echo "אי-זוגי"
fi
```

## טיפים וטריקים

1. השתמשו תמיד ב-`[[ ]]` על פני `[ ]` בסקריפטים חדשים - הוא בטוח יותר ותומך ביותר תכונות.
2. עטפו משתנים במרכאות בתוך `[ ]`: `[ "$var" = "x" ]`, כדי למנוע קריסה כשהמשתנה ריק.
3. ל-composite conditions מומלץ `(( ))` בהשוואות מספריות ו-`[[ ]]` בהשוואות מחרוזות.
4. `case` יעיל יותר מ-`if/elif` ארוך כשיש הרבה אפשרויות בדידות.
5. אפשר לשלב regex בתוך `[[ ]]` עם `=~`: `if [[ "$str" =~ ^[0-9]+$ ]]; then echo "מספר בלבד"; fi`

## שאלות ראיון עבודה נפוצות

**ש: מה ההבדל המרכזי בין `[ ]` ל-`[[ ]]`?**
ת: `[ ]` הוא פקודה חיצונית (או builtin POSIX) שדורשת word-splitting וquoting זהיר, ואינה תומכת ב-`&&`/`||` פנימיים או ב-pattern matching. `[[ ]]` הוא keyword מובנה של Bash, בטוח יותר מול משתנים ריקים, תומך ב-`==` עם wildcards ו-`=~` עם regex.

**ש: איך בודקים אם קובץ קיים בסקריפט Bash?**
ת: `if [ -f "/path/to/file" ]; then ... fi` לקובץ רגיל, או `[ -e ... ]` לכל סוג ישות (כולל תיקייה).

**ש: מה עושה `-z` ומה עושה `-n`?**
ת: `-z` בודק שהמחרוזת ריקה (length zero), `-n` בודק שהמחרוזת לא ריקה.

**ש: מדוע כדאי לעטוף משתנים במרכאות בתוך תנאים?**
ת: כדי למנוע שגיאת תחביר כאשר המשתנה ריק או מכיל רווחים - למשל `[ $var = "x" ]` ייכשל אם `$var` ריק, בעוד `[ "$var" = "x" ]` יעבוד תקין.

**ש: מה ההבדל בין `=` ל-`==` בתוך `[[ ]]`?**
ת: בפועל הם זהים בהשוואת מחרוזות בתוך `[[ ]]`, אך `==` נתמך בנוסף לביצוע pattern matching (למשל `[[ $x == a* ]]`), בעוד ש-`=` הוא הצורה ה-POSIX-ית התקנית.

## תרגילים לתרגול עצמי

1. כתבו סקריפט שבודק אם מספר שהוזן הוא זוגי או אי-זוגי.
2. כתבו סקריפט שמקבל שם קובץ ובודק אם הוא קיים, האם הוא תיקייה, והאם ניתן לכתיבה.
3. כתבו תפריט אינטראקטיבי עם `case` שמציע 3 פעולות ומבצע לוגיקה שונה לכל אחת.

## קישורים נוספים

**דוקומנטציה:**
- [Bash Reference Manual - Conditional Constructs](https://www.gnu.org/software/bash/manual/bash.html#Conditional-Constructs)
- [Bash Reference Manual - Bash Conditional Expressions](https://www.gnu.org/software/bash/manual/bash.html#Bash-Conditional-Expressions)

**סרטוני יוטיוב:**
- [Bash Scripting Full Course 3 Hours](https://www.youtube.com/watch?v=e7BufAVwDiM)
- [Shell Scripting Full Course - Basics to Advanced](https://www.youtube.com/watch?v=fAgz66M4aNc)

---
[<< מדריך קודם: משתנים](/bash/02-mishtanim/) | [המדריך הבא: לולאות >>](/bash/04-lulaot/)
