---
sidebar_position: 9
title: "מדריך 9: Bash Scripting"
---

# מדריך 9: Bash Scripting

## מבוא
כתיבת סקריפטים ב-Bash היא כלי חיוני לאוטומציה של משימות ניהול מערכת. מדריך זה מכסה מבנה בסיסי, משתנים, לולאות, תנאים ופונקציות.

---

## 1. מבנה בסיסי של סקריפט

```bash
#!/bin/bash
# השורה הראשונה (shebang) מגדירה איזה interpreter ירוץ

echo "Hello, World!"
```

הפיכה להרצה:
```bash
chmod +x script.sh
./script.sh

# או הרצה ישירה עם bash בלי הרשאת הרצה
bash script.sh
```

---

## 2. משתנים

```bash
#!/bin/bash

name="John"
age=30

echo "Name: $name, Age: $age"

# משתני סביבה
echo "Home directory: $HOME"
echo "Current user: $USER"

# קליטת קלט מהמשתמש
read -p "Enter your name: " user_name
echo "Hello, $user_name"

# משתנים בלתי ניתנים לשינוי
readonly PI=3.14159

# ארגומנטים שהועברו לסקריפט
echo "First argument: $1"
echo "Number of arguments: $#"
echo "All arguments: $@"
echo "Script name: $0"
```

---

## 3. תנאים (if/else)

```bash
#!/bin/bash

number=10

if [ $number -gt 5 ]; then
    echo "Number is greater than 5"
elif [ $number -eq 5 ]; then
    echo "Number equals 5"
else
    echo "Number is less than 5"
fi

# בדיקות קבצים
if [ -f "/etc/passwd" ]; then
    echo "File exists"
fi

if [ -d "/var/log" ]; then
    echo "Directory exists"
fi

# בדיקת מחרוזות
if [ "$name" == "John" ]; then
    echo "Name matches"
fi

# תנאי משולב
if [ $age -gt 18 ] && [ $age -lt 65 ]; then
    echo "Working age"
fi
```

### טבלת אופרטורים נפוצים
| אופרטור | משמעות |
|---|---|
| `-eq` `-ne` | שווה / לא שווה (מספרים) |
| `-gt` `-lt` | גדול מ / קטן מ |
| `-ge` `-le` | גדול-שווה / קטן-שווה |
| `-f` | קובץ קיים |
| `-d` | תיקייה קיימת |
| `-z` | מחרוזת ריקה |
| `-n` | מחרוזת לא ריקה |
| `==` `!=` | שווה / לא שווה (מחרוזות) |

---

## 4. לולאות

```bash
#!/bin/bash

# for loop - טווח מספרים
for i in {1..5}; do
    echo "Number: $i"
done

# for loop - רשימת ערכים
for fruit in apple banana orange; do
    echo "Fruit: $fruit"
done

# for loop - קבצים בתיקייה
for file in /var/log/*.log; do
    echo "Processing: $file"
done

# while loop
counter=1
while [ $counter -le 5 ]; do
    echo "Counter: $counter"
    ((counter++))
done

# until loop - רץ עד שהתנאי מתקיים
count=0
until [ $count -ge 5 ]; do
    echo "Count: $count"
    ((count++))
done

# קריאת קובץ שורה אחרי שורה
while IFS= read -r line; do
    echo "Line: $line"
done < file.txt
```

---

## 5. פונקציות

```bash
#!/bin/bash

# הגדרת פונקציה
greet() {
    local name=$1
    echo "Hello, $name!"
}

# קריאה לפונקציה
greet "World"

# פונקציה עם ערך חוזר
add_numbers() {
    local sum=$(($1 + $2))
    echo $sum
}

result=$(add_numbers 5 3)
echo "Sum: $result"

# פונקציה עם בדיקת קוד יציאה
check_status() {
    if [ $? -eq 0 ]; then
        echo "Success"
    else
        echo "Failed"
    fi
}
```

---

## 6. דוגמת סקריפט מלא - Backup Script

```bash
#!/bin/bash
#
# Backup Script - מגבה תיקייה ומוחק גיבויים ישנים מ-30 יום

set -euo pipefail  # עצירה מיידית בכל שגיאה - practice מומלץ!

SOURCE_DIR="/var/www/html"
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$DATE.tar.gz"
RETENTION_DAYS=30

# בדיקה שתיקיית הגיבוי קיימת
if [ ! -d "$BACKUP_DIR" ]; then
    mkdir -p "$BACKUP_DIR"
    echo "Created backup directory: $BACKUP_DIR"
fi

# ביצוע הגיבוי
echo "Starting backup of $SOURCE_DIR..."
tar -czf "$BACKUP_FILE" "$SOURCE_DIR"

if [ $? -eq 0 ]; then
    echo "Backup successful: $BACKUP_FILE"
else
    echo "Backup failed!" >&2
    exit 1
fi

# מחיקת גיבויים ישנים
echo "Cleaning backups older than $RETENTION_DAYS days..."
find "$BACKUP_DIR" -name "backup_*.tar.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup process completed successfully."
```

---

## 7. Debugging וBest Practices

```bash
# הרצה עם debug mode - מציג כל שורה שמורצת
bash -x script.sh

# הפעלת debug בתוך הסקריפט עצמו
set -x   # הפעלה
set +x   # כיבוי

# עצירה בכל שגיאה - הרגל טוב מאוד!
set -e

# עצירה גם על משתנים לא מוגדרים
set -u

# עצירה אם פקודה בתוך pipe נכשלת
set -o pipefail

# שילוב מומלץ בתחילת כל סקריפט:
set -euo pipefail
```

---

## טיפים וטריקים 🔥

1. **תמיד** התחילו סקריפט עם `set -euo pipefail` - זה חוסך המון כאבי ראש בגילוי שגיאות שקטות.
2. השתמשו במרכאות כפולות סביב משתנים: `"$var"` ולא `$var` - מונע בעיות עם רווחים ו-word splitting.
3. השתמשו ב-`local` בתוך פונקציות כדי למנוע דליפת משתנים ל-scope הגלובלי.
4. `shellcheck` הוא כלי חובה - סורק סקריפטים ומוצא באגים נפוצים לפני שהם קורים.
5. תעדו כל סקריפט עם הערות (`#`) בראש הקובץ המסבירות מה הוא עושה, ומה הפרמטרים הצפויים.

---

## שאלות ראיון עבודה נפוצות

1. **מה עושה `set -euo pipefail`?**
   `-e` עוצר את הסקריפט בכל שגיאה, `-u` עוצר בשימוש במשתנה לא מוגדר, `-o pipefail` גורם ל-pipe להיכשל אם כל אחת מהפקודות בתוכו נכשלת (ולא רק האחרונה).

2. **מה ההבדל בין `$@` ל-`$*`?**
   שניהם מייצגים את כל הארגומנטים, אך `"$@"` שומר כל ארגומנט כמחרוזת נפרדת (חשוב כשיש רווחים בארגומנטים), בעוד `"$*"` מאחד את כולם למחרוזת אחת.

3. **איך תבדקו אם קובץ קיים בסקריפט?**
   ```bash
   if [ -f "/path/to/file" ]; then echo "exists"; fi
   ```

4. **מה ההבדל בין `local` למשתנה רגיל בתוך פונקציה?**
   `local` מגביל את תחום החיים (scope) של המשתנה לפונקציה בלבד; ללא `local` המשתנה יהיה גלובלי ועלול לדרוס משתנים אחרים בסקריפט.

5. **איך מריצים דיבוג על סקריפט Bash?**
   `bash -x script.sh` או הוספת `set -x` בתוך הסקריפט - מדפיס כל פקודה לפני הרצתה.

6. **מה ההבדל בין `$(command)` ל-` `command` ` (backticks)?**
   שניהם command substitution, אך `$()` ניתן לקינון (nesting) בקלות ונחשב לתחביר המודרני והמומלץ.

---

## קישורים חיצוניים

### תיעוד רשמי
- [GNU Bash Reference Manual](https://www.gnu.org/software/bash/manual/bash.html)
- [Advanced Bash-Scripting Guide (TLDP)](https://tldp.org/LDP/abs/html/)
- [ShellCheck - כלי לבדיקת סקריפטים](https://www.shellcheck.net/)

### סרטוני יוטיוב מומלצים
- [Bash Scripting Full Course - freeCodeCamp](https://www.youtube.com/results?search_query=bash+scripting+full+course+freecodecamp)
- [Bash Scripting for Beginners](https://www.youtube.com/results?search_query=bash+scripting+for+beginners)
- [10 Bash Script Examples](https://www.youtube.com/results?search_query=10+bash+script+examples)

---

**חזרה למדריך הקודם:** [08 - ניהול שרתים](./08-ניהול-שרתים.md)
**המשך למדריך הבא:** [10 - שאלות ראיון וטיפים](./10-שאלות-ראיון-וטיפים.md)
