---
title: "מערכים (Arrays) ב-Bash"
category: Bash
part: 6/10
---

## מערך אינדקסי (Indexed Array)

```bash
fruits=("apple" "banana" "cherry")

# הוספה אחר-אחת
colors[0]="red"
colors[1]="green"
colors[2]="blue"

echo ${fruits[0]}       # apple
echo ${fruits[-1]}       # cherry (איבר אחרון)
echo ${fruits[@]}         # כל האיברים
echo ${#fruits[@]}         # 3 - כמות האיברים
```

## הוספה, מחיקה ושינוי

```bash
fruits+=("orange")           # הוספת איבר בסוף
fruits[1]="blueberry"         # שינוי איבר קיים
unset fruits[0]                # מחיקת איבר (משאיר "חור" באינדקסים)
fruits=("${fruits[@]}")        # "דחיסת" המערך מחדש אחרי מחיקה
```

## מעבר על מערך

```bash
for fruit in "${fruits[@]}"; do
  echo "$fruit"
done

# עם אינדקסים
for i in "${!fruits[@]}"; do
  echo "$i => ${fruits[$i]}"
done
```

## חיתוך מערך (slicing)

```bash
arr=(a b c d e f)
echo ${arr[@]:1:3}     # b c d  (מאינדקס 1, 3 איברים)
echo ${arr[@]:2}        # c d e f (מאינדקס 2 עד הסוף)
```

## מערך אסוציאטיבי (Associative Array / Dictionary)

```bash
declare -A person
person[name]="Dan"
person[age]=30
person[city]="Tel Aviv"

echo ${person[name]}          # Dan
echo ${!person[@]}              # כל המפתחות: name age city
echo ${person[@]}                # כל הערכים: Dan 30 "Tel Aviv"

for key in "${!person[@]}"; do
  echo "$key: ${person[$key]}"
done
```

## אתחול מערך אסוציאטיבי בבת אחת

```bash
declare -A colors=( [red]="#FF0000" [green]="#00FF00" [blue]="#0000FF" )

for color in "${!colors[@]}"; do
  echo "$color = ${colors[$color]}"
done
```

## בדיקה אם מפתח קיים במערך אסוציאטיבי

```bash
declare -A config
config[env]="production"

if [[ -v config[env] ]]; then
  echo "המפתח env קיים"
fi

if [[ -n "${config[missing_key]}" ]]; then
  echo "יש ערך"
else
  echo "אין ערך או שהמפתח לא קיים"
fi
```

## המרת מערך למחרוזת ולהיפך

```bash
arr=("a" "b" "c")
str=$(IFS=,; echo "${arr[*]}")     # "a,b,c"
echo "$str"

IFS=',' read -ra new_arr <<< "$str"
echo "${new_arr[@]}"                 # a b c
```

## מיון מערך

```bash
arr=(banana apple cherry)
sorted=($(printf '%s\n' "${arr[@]}" | sort))
echo "${sorted[@]}"     # apple banana cherry

# מיון מספרי
nums=(5 2 8 1 9)
sorted_nums=($(printf '%s\n' "${nums[@]}" | sort -n))
echo "${sorted_nums[@]}"
```

## מערך מתוצאת פקודה

```bash
mapfile -t lines < file.txt      # דרך יעילה למלא מערך משורות קובץ
# או
readarray -t lines < file.txt     # אותו דבר (alias)

echo "כמות שורות: ${#lines[@]}"
```

## דוגמה מעשית: קיבוץ ולוגיקה עם מערך אסוציאטיבי

```bash
#!/bin/bash
declare -A word_count

text="the quick brown fox the lazy dog the fox"
for word in $text; do
  ((word_count[$word]++))
done

for word in "${!word_count[@]}"; do
  echo "$word: ${word_count[$word]}"
done
```

## טיפים וטריקים

1. תמיד עטפו `"${arr[@]}"` במרכאות כדי לשמר איברים עם רווחים כרכיבים נפרדים.
2. `${arr[@]}` לעומת `${arr[*]}` מתנהגים כמו `$@` לעומת `$*` - `[@]` שומר איברים נפרדים, `[*]` מאחד למחרוזת אחת.
3. מערכים אסוציאטיביים דורשים `declare -A` מראש - בלי זה Bash יתייחס למפתחות כאינדקסים מספריים.
4. `mapfile`/`readarray` מהירים ובטוחים יותר מלולאת `while read` למילוי מערך משורות קובץ.
5. אין תמיכה אמיתית ב"מערך רב-ממדי" ב-Bash - ניתן לדמות עם מערכים אסוציאטיביים ומפתחות מורכבים כמו `matrix[1,2]`.

## שאלות ראיון עבודה נפוצות

**ש: מה ההבדל בין `${arr[@]}` ל-`${arr[*]}`?**
ת: כשמצוטטים, `"${arr[@]}"` מרחיב לכל איבר כמילה נפרדת (שומר על boundaries), בעוד `"${arr[*]}"` מאחד את כל האיברים למחרוזת אחת מופרדת בתו הראשון של IFS.

**ש: איך יוצרים מערך אסוציאטיבי ב-Bash?**
ת: עם `declare -A name`, ולאחר מכן `name[key]=value`. חשוב לציין שזה נתמך רק מגרסה Bash 4 ואילך.

**ש: איך בודקים אם מפתח מסוים קיים במערך אסוציאטיבי (בניגוד לבדיקה אם יש לו ערך)?**
ת: `[[ -v arr[key] ]]` בודק אם המפתח מוגדר, בעוד בדיקת `-n "${arr[key]}"` בודקת אם יש לו ערך לא-ריק (מפתח קיים עם ערך ריק ייכשל בבדיקה השנייה אך יעבור בראשונה).

**ש: מה ההבדל בין `mapfile` ל-`while read` בקריאת קובץ למערך?**
ת: `mapfile`/`readarray` הן פקודות builtin שמהירות יותר וממלאות מערך שלם בפקודה אחת, בעוד `while read` היא לולאה שקוראת שורה-שורה ודורשת יותר קוד לבניית מערך.

**ש: איך מוחקים איבר ממערך ב-Bash?**
ת: `unset arr[index]` - אך שימו לב שהפעולה משאירה "חור" באינדקסים (המערך לא נדחס אוטומטית).

## תרגילים לתרגול עצמי

1. כתבו סקריפט שיוצר מערך של 5 מספרים וממיין אותו בסדר יורד.
2. כתבו סקריפט עם מערך אסוציאטיבי ששומר מלאי מוצרים (שם -> כמות) ומדפיס אותו.
3. כתבו סקריפט שסופר כמה פעמים מופיעה כל מילה בקובץ טקסט, באמצעות מערך אסוציאטיבי.

## קישורים נוספים

**דוקומנטציה:**
- [Bash Reference Manual - Arrays](https://www.gnu.org/software/bash/manual/bash.html#Arrays)

**סרטוני יוטיוב:**
- [Bash Scripting for Beginners - LearnLinuxTV](https://www.youtube.com/watch?v=2733cRPudvI)
- [Shell Scripting Full Course - Basics to Advanced](https://www.youtube.com/watch?v=fAgz66M4aNc)

---
[<< מדריך קודם: פונקציות](/bash/05-funktziot/) | [המדריך הבא: מחרוזות ו-Regex >>](/bash/07-teksut-regex/)
