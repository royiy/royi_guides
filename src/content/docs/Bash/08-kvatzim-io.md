---
title: "קבצים, הפניות (Redirection) ו-Pipes ב-Bash"
category: Bash
part: 8/10
---

## שלושת ה-File Descriptors הבסיסיים

```
0 = stdin  (קלט סטנדרטי)
1 = stdout (פלט סטנדרטי)
2 = stderr (פלט שגיאות)
```

## הפניות בסיסיות

```bash
echo "hello" > output.txt      # כתיבה לקובץ (מוחק תוכן קיים)
echo "world" >> output.txt      # הוספה לסוף הקובץ (append)
command < input.txt              # קריאת קלט מקובץ

command 2> errors.txt             # שגיאות בלבד לקובץ
command 1> out.txt 2> err.txt      # הפרדה בין stdout ל-stderr
command > all.txt 2>&1              # שניהם לאותו קובץ (סדר חשוב!)
command &> all.txt                   # קיצור מודרני לאותו דבר

command 2>/dev/null                   # השתקת שגיאות בלבד
command > /dev/null 2>&1                # השתקת הכל
```

⚠️ שימו לב לסדר: `command > all.txt 2>&1` עובד (stdout מופנה קודם לקובץ, ואז stderr "מצטרף" אליו). `command 2>&1 > all.txt` **לא** יעבוד כמצופה - stderr יישאר במסך.

## Pipes - חיבור פקודות

```bash
ls -la | grep ".txt"
cat access.log | grep "ERROR" | wc -l
ps aux | sort -k3 -nr | head -5    # 5 תהליכים עם הכי הרבה CPU
```

## Here Document (heredoc)

```bash
cat << EOF > config.txt
name=MyApp
version=1.0
env=production
EOF

# עם משתנים
name="Dan"
cat << EOF
שלום $name, ברוך הבא!
EOF

# ללא הרחבת משתנים (single quotes סביב ה-delimiter)
cat << 'EOF'
$name לא יורחב כאן
EOF
```

## Here String

```bash
grep "pattern" <<< "$my_variable"
wc -w <<< "count these words please"
```

## קריאת קובץ שורה-שורה

```bash
while IFS= read -r line; do
  echo "עיבוד: $line"
done < file.txt

# עם מספור שורות
line_num=0
while IFS= read -r line; do
  ((line_num++))
  echo "$line_num: $line"
done < file.txt
```

## תהליך רקורסיבי דו-כיווני: Process Substitution

```bash
diff <(sort file1.txt) <(sort file2.txt)

while read -r line; do
  echo "$line"
done < <(grep "ERROR" logfile.txt)
```

`<(...)` יוצר "קובץ וירטואלי" מפלט הפקודה - שימושי כשצריך "קובץ" לפקודה שמצפה לנתיב, אבל יש לך רק פלט של פקודה אחרת.

## tee - כתיבה למסך וגם לקובץ בו-זמנית

```bash
ls -la | tee output.txt              # מציג במסך וגם שומר לקובץ
ls -la | tee -a output.txt            # מציג ומוסיף (append) לקובץ
command | tee file1.txt file2.txt      # כתיבה למספר קבצים
```

## xargs - העברת פלט כארגומנטים

```bash
find . -name "*.tmp" | xargs rm         # מחיקת כל קבצי tmp שנמצאו
echo "file1 file2 file3" | xargs touch    # יצירת מספר קבצים
find . -name "*.log" | xargs -I {} mv {} /archive/    # placeholder {}
```

## עבודה עם קבצים - פעולות נפוצות

```bash
# יצירת קובץ ריק / עדכון timestamp
touch newfile.txt

# בדיקת גודל קובץ
stat -c%s file.txt          # Linux
wc -c < file.txt              # חוצה פלטפורמות

# ספירת שורות/מילים/תווים
wc -l file.txt    # שורות
wc -w file.txt     # מילים
wc -c file.txt      # bytes

# חיפוש קבצים
find /path -name "*.sh" -type f
find . -mtime -7                # שונו ב-7 הימים האחרונים
find . -size +100M               # גדולים מ-100MB
```

## עבודה עם File Descriptors מותאמים אישית

```bash
exec 3> custom_log.txt      # פתיחת FD 3 לכתיבה
echo "log line" >&3          # כתיבה דרכו
exec 3>&-                     # סגירת ה-FD

exec 4< data.txt              # פתיחת FD 4 לקריאה
read -u 4 line                 # קריאה ממנו
exec 4<&-
```

## דוגמה מעשית: סקריפט גיבוי עם לוג

```bash
#!/bin/bash
LOG_FILE="/var/log/backup.log"
SOURCE="/home/user/data"
DEST="/backup/data_$(date +%Y%m%d).tar.gz"

{
  echo "התחלת גיבוי: $(date)"
  tar -czf "$DEST" "$SOURCE" && echo "גיבוי הצליח: $DEST" || echo "גיבוי נכשל!"
  echo "סיום: $(date)"
} >> "$LOG_FILE" 2>&1
```

## טיפים וטריקים

1. `2>&1` חייב לבוא **אחרי** `> file` כדי להפנות גם stderr לאותו קובץ - סדר ההפניות משנה משמעותית.
2. `tee` שימושי מאוד לדיבוג - רואים פלט בזמן אמת וגם שומרים ללוג.
3. `<(...)` ו-`>(...)` (process substitution) הם כלים חזקים למי שרגיל לחשוב ב-pipes אבל צריך "קובץ".
4. תמיד סגרו file descriptors מותאמים אישית עם `exec N<&-` כדי לא לדלוף (leak) handles.
5. `xargs -P N` מריץ עד N תהליכים במקביל - שימושי לביצועים.

## שאלות ראיון עבודה נפוצות

**ש: מה ההבדל בין `>` ל-`>>`?**
ת: `>` מוחק את תוכן הקובץ הקיים וכותב מחדש (overwrite). `>>` מוסיף לסוף הקובץ הקיים (append) בלי למחוק תוכן קיים.

**ש: למה `command 2>&1 > file.txt` לא מפנה stderr לקובץ, אבל `command > file.txt 2>&1` כן?**
ת: הפניות מתבצעות משמאל לימין. ב-`2>&1 > file.txt`: קודם stderr מופנה למקום שאליו stdout מצביע כרגע (המסך), ואז stdout מופנה לקובץ - כך ש-stderr נשאר על המסך. ב-`> file.txt 2>&1`: קודם stdout מופנה לקובץ, ואז stderr "מצביע" לאותו מקום כמו stdout (הקובץ) - כך ששניהם מגיעים לקובץ.

**ש: מה זה Process Substitution ומתי משתמשים בו?**
ת: תחביר `<(command)` שיוצר "קובץ זמני וירטואלי" (בפועל FIFO/pipe) המכיל את פלט הפקודה, כדי לאפשר לפקודות שמצפות לנתיב קובץ (כמו `diff`) לעבוד עם פלט של פקודה אחרת בלי ליצור קובץ זמני אמיתי.

**ש: מה ההבדל בין heredoc (`<<`) ל-here string (`<<<`)?**
ת: heredoc מאפשר להזין טקסט מרובה-שורות כקלט, עד שמגיעים ל-delimiter מוגדר. here string מזין מחרוזת בודדת (למשל תוכן משתנה) כקלט לפקודה, בשורה אחת.

**ש: מה עושה `tee` ולמה הוא שימושי?**
ת: `tee` קורא מ-stdin, ומעביר אותו גם ל-stdout וגם לקובץ (או מספר קבצים) בו-זמנית. שימושי כשרוצים לראות פלט על המסך בזמן אמת אבל גם לשמור אותו לקובץ ללא שימוש ב-`>` ואיבוד תצוגת המסך.

## תרגילים לתרגול עצמי

1. כתבו סקריפט שמריץ פקודה, שומר את הפלט לקובץ ואת השגיאות לקובץ נפרד.
2. כתבו סקריפט שמשווה בין תוצאות ממוינות של שתי פקודות שונות באמצעות process substitution.
3. כתבו סקריפט שקורא קובץ CSV שורה-שורה ומדפיס רק שורות שעומדות בתנאי מסוים.

## קישורים נוספים

**דוקומנטציה:**
- [Bash Reference Manual - Redirections](https://www.gnu.org/software/bash/manual/bash.html#Redirections)
- [Bash Reference Manual - Process Substitution](https://www.gnu.org/software/bash/manual/bash.html#Process-Substitution)

**סרטוני יוטיוב:**
- [Bash Script with Practical Examples - Amigoscode](https://www.classcentral.com/course/youtube-bash-script-with-practical-examples-full-course-92914)
- [Bash Shell Scripting Tutorial - Full Course](https://www.youtube.com/watch?v=rMpa-VgJ_UQ)

---
[<< מדריך קודם: מחרוזות ו-Regex](/bash/07-teksut-regex/) | [המדריך הבא: ניהול תהליכים >>](/bash/09-tahalichim/)
