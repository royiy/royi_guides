---
title: "לולאות (for, while, until) ב-Bash"
category: Bash
part: 4/10
---

## לולאת for - על רשימת ערכים

```bash
for fruit in apple banana cherry; do
  echo "פרי: $fruit"
done
```

## לולאת for - על טווח מספרים

```bash
for i in {1..10}; do
  echo "מספר: $i"
done

# עם קפיצה (step)
for i in {0..20..5}; do
  echo "$i"       # 0 5 10 15 20
done

# תחביר C-style
for ((i=0; i<10; i++)); do
  echo "אינדקס: $i"
done
```

## לולאת for - על קבצים (globbing)

```bash
for file in *.txt; do
  echo "מעבד: $file"
done

for file in /var/log/*.log; do
  [ -f "$file" ] || continue
  echo "לוג: $file"
done
```

## לולאת for - על תוצאת פקודה

```bash
for user in $(cut -d: -f1 /etc/passwd); do
  echo "משתמש: $user"
done

# עדיף להשתמש ב-while read כדי להתמודד נכון עם רווחים ושורות
```

## לולאת while

```bash
count=1
while [ $count -le 5 ]; do
  echo "ספירה: $count"
  ((count++))
done
```

## while עם קריאת קובץ (הדרך הנכונה)

```bash
while IFS= read -r line; do
  echo "שורה: $line"
done < input.txt
```

⚠️ `IFS=` מונע חיתוך רווחים מובילים/סוגרים, ו-`-r` מונע פרשנות של backslash.

## לולאת until - הפוכה ל-while

```bash
count=1
until [ $count -gt 5 ]; do
  echo "עד: $count"
  ((count++))
done
```

## break ו-continue

```bash
for i in {1..10}; do
  if [ $i -eq 5 ]; then
    continue   # דילוג על האיטרציה הנוכחית
  fi
  if [ $i -eq 8 ]; then
    break      # יציאה מהלולאה
  fi
  echo $i
done
```

## break/continue עם רמות מקוננות

```bash
for i in {1..3}; do
  for j in {1..3}; do
    if [ $j -eq 2 ]; then
      break 2   # יוצא משתי הלולאות בבת אחת
    fi
    echo "$i-$j"
  done
done
```

## לולאה אינסופית

```bash
while true; do
  echo "רץ..."
  sleep 1
  # תנאי יציאה כלשהו
  read -t 0.1 -n 1 key && [ "$key" = "q" ] && break
done
```

## לולאה על מערך

```bash
arr=("dog" "cat" "fish")
for animal in "${arr[@]}"; do
  echo "חיה: $animal"
done

# עם אינדקסים
for i in "${!arr[@]}"; do
  echo "$i: ${arr[$i]}"
done
```

## לולאה עם select (תפריט אינטראקטיבי)

```bash
options=("Start" "Stop" "Exit")
select opt in "${options[@]}"; do
  case $opt in
    "Start") echo "מתחיל..."; ;;
    "Stop") echo "עוצר..."; ;;
    "Exit") break; ;;
    *) echo "בחירה לא תקינה";;
  esac
done
```

## דוגמה מעשית: עיבוד קבצים בתיקייה

```bash
#!/bin/bash
for file in /path/to/dir/*; do
  if [ -f "$file" ]; then
    size=$(stat -c%s "$file")
    echo "$(basename "$file"): $size bytes"
  fi
done
```

## טיפים וטריקים

1. השתמשו ב-`while IFS= read -r line` ולא ב-`for line in $(cat file)` כדי לטפל נכון בשורות עם רווחים ותווים מיוחדים.
2. `{1..N}` הוא brace expansion שקורה בזמן parse - לא תעבוד עם משתנה (`{1..$n}`), במקרה כזה השתמשו ב-`seq` או בלולאת C-style: `for ((i=1;i<=n;i++))`.
3. תמיד עטפו `"${arr[@]}"` במרכאות בלולאת מערך כדי לשמר איברים עם רווחים.
4. `break N` ו-`continue N` מאפשרים לצאת/לדלג ברמות מקוננות.
5. הריצו לולאות ארוכות ברקע עם `&` ושמרו PID-ים לניהול מקבילי (ראו מדריך 9).

## שאלות ראיון עבודה נפוצות

**ש: מה הבעיה ב-`for line in $(cat file.txt)`?**
ת: הפקודה מבצעת word splitting לפי IFS (בדרך כלל רווח/טאב/newline), כך שכל מילה (לא שורה!) הופכת לאיטרציה נפרדת, וגם עוברת glob expansion. הדרך הנכונה היא `while IFS= read -r line; do ... done < file.txt`.

**ש: מה ההבדל בין `break` ל-`continue`?**
ת: `break` יוצא לגמרי מהלולאה. `continue` מדלג על שאר הקוד באיטרציה הנוכחית וממשיך לאיטרציה הבאה.

**ש: איך יוצאים משתי לולאות מקוננות בבת אחת?**
ת: `break 2` (או `continue 2` כדי לדלג לרמה החיצונית).

**ש: מה ההבדל בין `while` ל-`until`?**
ת: `while` ממשיך לרוץ כל עוד התנאי אמת. `until` ממשיך לרוץ כל עוד התנאי שקר (כלומר רץ עד שהתנאי הופך לאמת).

**ש: איך אפשר ליצור לולאה אינסופית ב-Bash?**
ת: `while true; do ... done` או `while :; do ... done` (`:` היא פקודה מובנית שתמיד מחזירה 0).

## תרגילים לתרגול עצמי

1. כתבו סקריפט שסופר מ-1 עד 100 ומדפיס רק מספרים המתחלקים ב-3.
2. כתבו סקריפט שקורא קובץ שורה-שורה וסופר כמה שורות מכילות את המילה "error".
3. כתבו סקריפט עם לולאה מקוננת שמדפיס לוח כפל (1-10).

## קישורים נוספים

**דוקומנטציה:**
- [Bash Reference Manual - Looping Constructs](https://www.gnu.org/software/bash/manual/bash.html#Looping-Constructs)

**סרטוני יוטיוב:**
- [Bash Scripting Full Course 3 Hours](https://www.youtube.com/watch?v=e7BufAVwDiM)
- [Linux Shell Scripting Full Course](https://www.youtube.com/watch?v=jddTCwWA0rw)

---
[<< מדריך קודם: תנאים](/bash/03-tnaim/) | [המדריך הבא: פונקציות >>](/bash/05-funktziot/)
