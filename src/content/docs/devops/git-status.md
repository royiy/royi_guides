---
title: git status - מה הפקודה עושה ומתי להשתמש בה
description: מדריך מלא על פקודת git status - מה היא מציגה, מתי כדאי להריץ אותה, ואיך לקרוא את הפלט שלה
---

## מה זה בעצם `git status`?

`git status` היא פקודת "בדיקת מצב" - היא לא משנה שום דבר בפרויקט, רק מציגה לך תמונה עדכנית של מה קורה בעבודה שלך ברגע הנתון:

- אילו קבצים שינית מאז ה-commit האחרון
- אילו קבצים חדשים ש-Git עוד לא מכיר
- מה כבר סומן ב-`git add` ומוכן ל-commit, ומה עדיין לא
- על איזה ענף (branch) אתה נמצא, והאם הוא מסונכרן עם GitHub

זו הפקודה הכי "בטוחה" ב-Git - אין שום סיכון להריץ אותה, כי היא רק מציגה מידע ולא נוגעת בקבצים.

## מתי כדאי להריץ אותה?

- **לפני `git add`** - כדי לראות אילו קבצים בכלל השתנו
- **אחרי `git add`, לפני `git commit`** - כדי לוודא שסימנת בדיוק את מה שרצית, ולא שכחת קובץ או סימנת קובץ מיותר
- **כשמשהו לא ברור** - אם אתה לא זוכר אם כבר עשית commit, אם יש שינויים שלא שמרת, או אם אתה "מסונכרן" עם GitHub

כלל אצבע טוב למתחילים: להריץ `git status` כמעט בכל שלב שבו אתה לא בטוח מה המצב, לפני שאתה מריץ פקודה שמשנה משהו.

## איך משתמשים בה

פשוט, בתוך תיקיית הפרויקט:

```
git status
```

## דוגמה 1: אחרי עריכת קובץ קיים

נניח ערכת את `astro.config.mjs`. הרצת `git status` תציג:

```
On branch main
Your branch is up to date with 'origin/main'.

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
        modified:   astro.config.mjs

no changes added to commit (use "git add" and/or "git commit -a")
```

**איך קוראים את זה:**

- `modified: astro.config.mjs` - הקובץ הזה השתנה מאז ה-commit האחרון
- `Changes not staged for commit` - השינוי עדיין **לא** סומן ב-`git add`, כלומר `git commit` לא יכלול אותו כרגע
- ההודעה מרמזת בדיוק מה לעשות: `use "git add <file>..."` כדי לסמן את הקובץ לשמירה

## דוגמה 2: אחרי `git add`

אחרי שהרצת `git add .`, הרצת `git status` שוב תציג תמונה שונה:

```
On branch main
Your branch is up to date with 'origin/main'.

Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
        modified:   astro.config.mjs
        new file:   src/content/docs/devops/git-basics.md
```

**ההבדל המרכזי**: הכותרת השתנתה מ-`Changes not staged` ל-`Changes to be committed` - כלומר עכשיו הקבצים האלה **כן** ייכללו ב-`git commit` הבא.

שים לב גם ל-`new file` - כך Git מבדיל בין קובץ שכבר היה קיים ורק השתנה (`modified`), לבין קובץ חדש לגמרי שנוסף (`new file`).

## דוגמה 3: אחרי commit, לפני push

```
On branch main
Your branch is ahead of 'origin/main' by 1 commit.
  (use "git push" to publish your local commits)

nothing to commit, working tree clean
```

- **`nothing to commit, working tree clean`** - אין שום שינוי לא שמור, כל מה שיש לך מקומית כבר נשמר ב-commit
- **`ahead of 'origin/main' by 1 commit`** - אבל ה-commit הזה עדיין **לא** הועלה ל-GitHub. זה בדיוק המצב שבו צריך להריץ `git push`

## סיכום מהיר

| מה מופיע בפלט | המשמעות |
|---|---|
| `modified: <file>` (תחת "not staged") | שינית קובץ קיים, עדיין לא סימנת ל-`add` |
| `modified: <file>` (תחת "to be committed") | סימנת עם `add`, מוכן ל-`commit` |
| `new file: <file>` | קובץ חדש שנוסף וסומן ל-`add` |
| `nothing to commit, working tree clean` | אין שום שינוי שלא נשמר |
| `ahead of 'origin/main' by N commits` | יש commits מקומיים שעדיין לא הועלו - צריך `push` |

`git status` היא הפקודה שהכי כדאי להרגיל את עצמך להריץ באופן קבוע - היא זו שמונעת הפתעות ומבלבלת הכי פחות מכל הפקודות ב-Git.
