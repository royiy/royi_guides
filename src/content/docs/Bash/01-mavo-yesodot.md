---
title: "מבוא ל-Bash ויסודות השורת פקודה"
category: Bash
part: 1/10
---

## מה זה Bash?

Bash (Bourne Again SHell) הוא מעטפת (Shell) ושפת תסריטים (Scripting Language) הרצה על מערכות Unix/Linux ו-macOS, והיא ברירת המחדל ברוב ההפצות. היא משמשת גם כדי להריץ פקודות באופן אינטראקטיבי, וגם ככלי לכתיבת סקריפטים לאוטומציה של משימות.

## Shebang - שורת הפתיחה

כל סקריפט Bash אמור להתחיל בשורה שמגדירה איזה interpreter יריץ אותו:

```bash
#!/bin/bash
echo "שלום עולם"
```

- `#!/bin/bash` - שימוש בנתיב מוחלט ל-bash
- `#!/usr/bin/env bash` - חיפוש bash לפי ה-PATH (מומלץ יותר לניידות בין מערכות)

## הרצת סקריפט

```bash
chmod +x script.sh   # מתן הרשאת הרצה
./script.sh          # הרצה מהתיקייה הנוכחית
bash script.sh        # הרצה מפורשת עם bash
source script.sh      # הרצה באותו ה-shell הנוכחי (משפיע על משתני סביבה)
```

## פקודות בסיסיות חיוניות

```bash
pwd                  # הצגת הנתיב הנוכחי
ls -la                # רשימת קבצים כולל נסתרים ופרטים
cd /path/to/dir       # מעבר בין תיקיות
mkdir -p a/b/c        # יצירת עץ תיקיות
rm -rf dir/           # מחיקה רקורסיבית וכפויה (זהירות!)
cp -r src/ dst/       # העתקה רקורסיבית
mv old.txt new.txt    # שינוי שם / הזזה
cat file.txt          # הצגת תוכן קובץ
man bash              # מדריך למשתמש
```

## תחביר בסיסי - הערות ופקודות מרובות

```bash
# זו הערה
echo "פקודה ראשונה"; echo "פקודה שנייה"   # הפרדה עם נקודה-פסיק

# פקודות ארוכות אפשר לפצל עם \
echo "זו פקודה ארוכה " \
     "שממשיכה בשורה הבאה"
```

## exit code וקוד חזרה

לכל פקודה יש קוד חזרה (0 = הצלחה, כל ערך אחר = כישלון):

```bash
ls /tmp
echo $?      # מדפיס את קוד החזרה של הפקודה האחרונה

grep "root" /etc/passwd
if [ $? -eq 0 ]; then
  echo "נמצא"
fi
```

## אופרטורים לוגיים בין פקודות

```bash
cmd1 && cmd2   # cmd2 ירוץ רק אם cmd1 הצליחה
cmd1 || cmd2   # cmd2 ירוץ רק אם cmd1 נכשלה
cmd1 ; cmd2    # שתי הפקודות ירוצו בכל מקרה, ברצף
```

דוגמה מעשית:

```bash
mkdir -p backup && cp important.txt backup/ && echo "גיבוי הצליח"
```

## היסטוריית פקודות וקיצורים שימושיים

```bash
history               # הצגת היסטוריית פקודות
!!                     # הרצת הפקודה האחרונה שוב
!123                   # הרצת פקודה מספר 123 בהיסטוריה
Ctrl+R                 # חיפוש הפוך בהיסטוריה
Ctrl+L                 # ניקוי המסך
Ctrl+C                 # עצירת פקודה רצה
Ctrl+D                 # יציאה מה-shell / EOF
!$                     # הארגומנט האחרון של הפקודה הקודמת
```

## טיפים וטריקים

1. **`set -euo pipefail`** - כדאי להוסיף בתחילת כל סקריפט production כדי שהסקריפט ייעצר בשגיאה, ישתמש רק במשתנים מוגדרים, ויתפוס שגיאות גם ב-pipe.
2. **`shellcheck script.sh`** - כלי לבדיקת סקריפטים שמזהה שגיאות נפוצות לפני ההרצה.
3. **Tab completion** - לחיצה כפולה על Tab משלימה שמות קבצים ופקודות אוטומטית.
4. **`type command`** - בודק אם פקודה היא alias, פונקציה, builtin או קובץ בינארי.
5. **`command -v bash`** - מציג את הנתיב המלא לפקודה.
6. אל תשתמשו ב-`#!/bin/sh` כשאתם משתמשים בתכונות ספציפיות ל-Bash (כמו arrays) - זה עלול לגרום לשגיאות במערכות שבהן `/bin/sh` הוא dash ולא bash.

## שאלות ראיון עבודה נפוצות

**ש: מה ההבדל בין Bash ל-sh?**
ת: sh הוא ה-POSIX shell המקורי (Bourne Shell), בעוד Bash הוא הרחבה שלו עם תכונות נוספות (arrays, string manipulation מתקדם, [[ ]], וכו'). לא כל סקריפט bash תקין כ-sh.

**ש: מה ההבדל בין `./script.sh` לבין `source script.sh`?**
ת: `./script.sh` מריץ את הסקריפט בתת-תהליך (subshell) נפרד - שינויי משתנים לא ישפיעו על ה-shell הנוכחי. `source script.sh` (או `. script.sh`) מריץ אותו באותו תהליך shell, כך ששינויים במשתנים או ב-cd יישארו בתוקף גם אחרי שהסקריפט מסתיים.

**ש: מהו exit code, ומה משמעות הערך 0?**
ת: exit code הוא מספר בין 0 ל-255 שכל פקודה מחזירה בסיום ריצתה. 0 מציין הצלחה, כל ערך אחר מציין כישלון או קוד שגיאה ספציפי.

**ש: מה עושה `set -e`?**
ת: גורם לסקריפט לעצור מיד ברגע שפקודה כלשהי נכשלת (מחזירה קוד חזרה שונה מ-0), במקום להמשיך לרוץ כאילו כלום לא קרה.

**ש: איך בודקים אם קובץ קיים בסקריפט?**
ת: `if [ -f "/path/to/file" ]; then echo "exists"; fi`

## תרגילים לתרגול עצמי

1. כתבו סקריפט שמדפיס את התאריך הנוכחי ואת שם המשתמש המחובר.
2. כתבו סקריפט שבודק אם תיקייה מסוימת קיימת, ואם לא - יוצר אותה.
3. כתבו פקודה אחת (one-liner) שמעתיקה קובץ ומדפיסה הודעת הצלחה רק אם ההעתקה הצליחה.

## קישורים נוספים

**דוקומנטציה:**
- [GNU Bash Reference Manual](https://www.gnu.org/software/bash/manual/bash.html) - התיעוד הרשמי המלא
- [Bash Manual Page (man bash)](https://man7.org/linux/man-pages/man1/bash.1.html)
- [Advanced Bash-Scripting Guide (TLDP)](https://tldp.org/LDP/abs/html/)

**סרטוני יוטיוב:**
- [Bash Shell Scripting Tutorial - Full Course](https://www.youtube.com/watch?v=rMpa-VgJ_UQ)
- [The Complete Bash Scripting Course - Dave Eddy](https://www.youtube.com/watch?v=Sx9zG7wa4FA)
- [Bash Scripting for Beginners - LearnLinuxTV](https://www.youtube.com/watch?v=2733cRPudvI)

---
[המדריך הבא: משתנים >>](/bash/02-mishtanim/)
