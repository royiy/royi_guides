---
title: git status - מה הפקודה עושה ומתי להשתמש בה
description: מדריך מלא על פקודת git status - מה היא מציגה, מתי כדאי להריץ אותה, ואיך לקרוא את הפלט שלה
---

## מה זה בעצם `git status`?

`git status` היא פקודת "בדיקת מצב" - היא לא משנה שום דבר בפרויקט, רק מציגה לך תמונה עדכנית של מה קורה בעבודה שלך ברגע הנתון.

## מתי כדאי להריץ אותה?

- **לפני `git add`** - כדי לראות אילו קבצים בכלל השתנו
- **אחרי `git add`, לפני `git commit`** - כדי לוודא שסימנת בדיוק את מה שרצית
- **כשמשהו לא ברור** - אם אתה לא בטוח מה המצב

## דוגמאות

**קובץ שהשתנה, לא סומן עדיין:**

```
Changes not staged for commit:
        modified:   astro.config.mjs
```

**אחרי `git add`:**

```
Changes to be committed:
        modified:   astro.config.mjs
```

**הכל שמור, אבל לא הועלה:**

```
nothing to commit, working tree clean
Your branch is ahead of 'origin/main' by 1 commit.
```

## סיכום מהיר

| מה מופיע בפלט | המשמעות |
|---|---|
| `modified: <file>` (not staged) | שינית קובץ, עדיין לא ב-`add` |
| `modified: <file>` (to be committed) | מוכן ל-`commit` |
| `nothing to commit, working tree clean` | אין שינוי לא שמור |
| `ahead of 'origin/main'` | יש commits שלא הועלו - צריך `push` |
