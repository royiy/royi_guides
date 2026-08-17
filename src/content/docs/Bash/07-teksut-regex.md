---
title: "מניפולציה על מחרוזות ו-Regex ב-Bash"
category: Bash
part: 7/10
---

## אורך מחרוזת

```bash
str="Hello World"
echo ${#str}     # 11
```

## חיתוך תת-מחרוזת (Substring)

```bash
str="Hello World"
echo ${str:0:5}    # Hello (מאינדקס 0, 5 תווים)
echo ${str:6}        # World (מאינדקס 6 ועד הסוף)
echo ${str: -5}       # World (5 תווים מהסוף - שימו לב לרווח לפני המינוס!)
```

## החלפת טקסט (Substitution)

```bash
str="foo bar foo baz"
echo ${str/foo/qux}     # qux bar foo baz  (החלפת המופע הראשון בלבד)
echo ${str//foo/qux}     # qux bar qux baz  (החלפת כל המופעים)

echo ${str/#foo/START}    # החלפה רק אם המחרוזת מתחילה ב-foo
echo ${str/%baz/END}       # החלפה רק אם המחרוזת מסתיימת ב-baz
```

## הסרת prefix / suffix

```bash
file="archive.tar.gz"
echo ${file%.gz}        # archive.tar   (הסרת הסיומת הקצרה ביותר מהסוף)
echo ${file%%.*}          # archive        (הסרת הכל מהנקודה הראשונה)
echo ${file#*.}            # tar.gz         (הסרת prefix הקצר ביותר עד הנקודה)
echo ${file##*.}            # gz             (הסרת prefix הארוך ביותר - שולף סיומת)
```

טבלת עזר: `#` = מהתחלה (prefix), `%` = מהסוף (suffix). כפול (`##`/`%%`) = greedy (הכי ארוך).

## שינוי אותיות (case conversion)

```bash
str="Hello World"
echo ${str^^}     # HELLO WORLD   (הכל לאות גדולה)
echo ${str,,}     # hello world   (הכל לאות קטנה)
echo ${str^}       # Hello World  (אות ראשונה גדולה)
echo ${str,}       # hello World  (אות ראשונה קטנה)
```

## פיצול מחרוזת (Split) עם IFS

```bash
str="a,b,c,d"
IFS=',' read -ra parts <<< "$str"
for part in "${parts[@]}"; do
  echo "$part"
done
```

## חיבור מחרוזות (Concatenation)

```bash
first="Hello"
second="World"
combined="$first $second"
combined2="${first}, ${second}!"
echo $combined2   # Hello, World!
```

## בדיקת הכלה (contains substring)

```bash
str="Hello World"
if [[ $str == *"World"* ]]; then
  echo "מכיל את המילה World"
fi

if [[ $str =~ World ]]; then
  echo "מוצא גם עם regex"
fi
```

## Regex עם =~

```bash
email="user@example.com"
if [[ $email =~ ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]]; then
  echo "אימייל תקין"
fi

# שליפת קבוצות לכידה (capture groups) עם BASH_REMATCH
str="version 3.14.2"
if [[ $str =~ ([0-9]+)\.([0-9]+)\.([0-9]+) ]]; then
  echo "Major: ${BASH_REMATCH[1]}"
  echo "Minor: ${BASH_REMATCH[2]}"
  echo "Patch: ${BASH_REMATCH[3]}"
fi
```

## שימוש בכלים חיצוניים: grep, sed, awk

```bash
# grep - חיפוש בטקסט
echo "hello world" | grep -o "wor.d"       # regex ל-stdout
grep -E "^[0-9]+$" file.txt                 # extended regex

# sed - החלפה בטקסט (stream editor)
echo "hello world" | sed 's/world/bash/'    # hello bash
sed -i 's/foo/bar/g' file.txt                 # החלפה בקובץ עצמו (in-place)

# awk - עיבוד עמודות
echo "a b c" | awk '{print $2}'               # b
awk -F',' '{print $1}' data.csv                # עמודה ראשונה מקובץ CSV
```

## printf לעיצוב מתקדם

```bash
printf "שם: %s, גיל: %d\n" "דן" 30
printf "%-10s|%5d\n" "item" 42        # יישור שמאלה/ימינה עם רוחב קבוע
printf "%.2f\n" 3.14159                 # 3.14 - עיגול לשתי ספרות
```

## Trim רווחים (אין builtin, אבל יש טריקים)

```bash
str="   hello   "
trimmed="${str#"${str%%[![:space:]]*}"}"    # הסרת רווחים מובילים
trimmed="${trimmed%"${trimmed##*[![:space:]]}"}"  # הסרת רווחים סוגרים
echo "[$trimmed]"     # [hello]

# או פשוט עם xargs
trimmed=$(echo "$str" | xargs)
```

## טיפים וטריקים

1. `${var//search/replace}` הוא כלי חזק מאוד שחוסך שימוש חיצוני ב-`sed` למקרים פשוטים - וגם מהיר יותר (ללא fork לתהליך חדש).
2. `=~` תומך ב-Extended Regular Expressions (ERE), לא ב-PCRE - אין lookahead/lookbehind.
3. `BASH_REMATCH` הוא מערך שמתמלא אוטומטית אחרי שימוש מוצלח ב-`=~`, כאשר `[0]` הוא כל ההתאמה, ו-`[1..n]` הן קבוצות הלכידה.
4. עבור regex מורכב יותר (PCRE) עדיף להשתמש ב-`grep -P`.
5. `printf` עדיף על `echo` לעיצוב מדויק, כי `echo` מתנהג שונה בין מערכות שונות (flags כמו `-e`).

## שאלות ראיון עבודה נפוצות

**ש: מה ההבדל בין `${str/x/y}` ל-`${str//x/y}`?**
ת: הראשון מחליף רק את המופע הראשון של x ב-y, בעוד השני (עם `//` כפול) מחליף את **כל** המופעים במחרוזת.

**ש: מה ההבדל בין `%` ל-`%%` (ובין `#` ל-`##`) ב-parameter expansion?**
ת: הסימן היחיד (`%`/`#`) מסיר את ההתאמה **הקצרה ביותר**, בעוד הסימן הכפול (`%%`/`##`) מסיר את ההתאמה **הארוכה ביותר** (greedy). `#`/`##` פועלים מתחילת המחרוזת (prefix), `%`/`%%` מהסוף (suffix).

**ש: מהו BASH_REMATCH?**
ת: מערך מובנה שמתמלא אוטומטית אחרי שימוש מוצלח באופרטור `=~` בתוך `[[ ]]`. `BASH_REMATCH[0]` מכיל את כל ההתאמה, ואינדקסים גבוהים יותר מכילים את קבוצות הלכידה (capture groups) של הביטוי הרגולרי.

**ש: מתי כדאי להשתמש ב-`sed`/`awk` במקום ב-parameter expansion המובנה?**
ת: כשצריך לעבד קבצים שלמים, לוגיקה מבוססת שורות/עמודות, או ביטויים רגולריים מורכבים יותר ממה ש-Bash תומך בו באופן native. עבור מחרוזת בודדת בזיכרון, parameter expansion מהיר יותר כי הוא לא מריץ תהליך חיצוני.

**ש: איך בודקים אם מחרוזת מכילה תת-מחרוזת מסוימת?**
ת: `[[ "$str" == *"substring"* ]]` (glob matching) או `[[ "$str" =~ "substring" ]]` (regex matching).

## תרגילים לתרגול עצמי

1. כתבו סקריפט שמקבל נתיב קובץ ומחלץ ממנו רק את הסיומת (extension).
2. כתבו סקריפט שבודק אם כתובת אימייל שהוזנה תקינה באמצעות regex.
3. כתבו סקריפט שהופך מחרוזת ל-Title Case (כל מילה מתחילה באות גדולה).

## קישורים נוספים

**דוקומנטציה:**
- [Bash Reference Manual - Shell Parameter Expansion](https://www.gnu.org/software/bash/manual/bash.html#Shell-Parameter-Expansion)
- [GNU sed Manual](https://www.gnu.org/software/sed/manual/sed.html)
- [GNU awk User's Guide](https://www.gnu.org/software/gawk/manual/gawk.html)

**סרטוני יוטיוב:**
- [Bash Script with Practical Examples - Amigoscode](https://www.classcentral.com/course/youtube-bash-script-with-practical-examples-full-course-92914)
- [The Complete Bash Scripting Course - Dave Eddy](https://www.youtube.com/watch?v=Sx9zG7wa4FA)

---
[<< מדריך קודם: מערכים](/bash/06-mearachim/) | [המדריך הבא: קבצים ו-I/O >>](/bash/08-kvatzim-io/)
