---
title: "ביטול שינויים - Reset, Revert, Restore"
category: DevOps/Git
part: 3/10
---

## ארבע פקודות "ביטול" ומתי להשתמש בכל אחת

| פקודה | מה עושה | בטוח על היסטוריה משותפת? |
|---|---|---|
| `git restore` | משחזר קבצים במקום העבודה/staging | כן |
| `git checkout -- <file>` | (ישן יותר) משחזר קובץ למצב האחרון שנשמר | כן |
| `git reset` | מזיז את מצביע ה-branch אחורה, "מוחק" commits | **לא** אם כבר נדחף |
| `git revert` | יוצר commit חדש שמבטל commit קודם | **כן** – בטוח תמיד |

## `git restore` – ביטול שינויים בקבצים (Git חדש, 2.23+)

```bash
# ביטול שינויים לא-מוסטגים בקובץ (חזרה לגרסה האחרונה שנשמרה)
git restore file.txt

# הוצאת קובץ מה-staging (בלי לבטל את השינוי עצמו)
git restore --staged file.txt
```

## `git reset` – שלוש רמות

```bash
git reset --soft HEAD~1    # מבטל commit, משאיר שינויים ב-staging
git reset --mixed HEAD~1   # מבטל commit + staging, משאיר שינויים ב-working dir (ברירת מחדל)
git reset --hard HEAD~1    # מבטל commit + staging + working dir - השינויים אובדים לצמיתות!
```

```
מצב לפני: A---B---C (HEAD -> main)

git reset --soft HEAD~1:
מצב אחרי: A---B (HEAD -> main), שינויי C נשארים ב-staging

git reset --hard HEAD~1:
מצב אחרי: A---B (HEAD -> main), שינויי C נעלמו לחלוטין
```

⚠️ **אזהרה קריטית**: `git reset --hard` מוחק שינויים ללא אפשרות שחזור פשוטה (מלבד reflog, ראה בהמשך). ולעולם אל תעשה `reset` על commits שכבר נדחפו (`push`) ושותפים כבר משכו – זה כותב מחדש היסטוריה משותפת.

## `git revert` – הדרך הבטוחה לבטל commit שכבר שותף

```bash
git revert a1b2c3d
```

זה יוצר **commit חדש** שמבטל בדיוק את השינויים של ה-commit המקורי, מבלי למחוק אותו מההיסטוריה:

```
לפני:   A---B---C (commit בעייתי)
אחרי:   A---B---C---D (D מבטל את C)
```

זו הדרך הבטוחה לבטל שינוי ב-`main`/`production` – ההיסטוריה נשארת שלמה, וכולם רואים בדיוק מה קרה ולמה.

## `git commit --amend` – תיקון ה-commit האחרון

```bash
# שינוי הודעת ה-commit האחרון
git commit --amend -m "הודעה מתוקנת"

# הוספת קבצים ששכחת ל-commit האחרון (בלי ליצור commit נפרד)
git add forgotten-file.txt
git commit --amend --no-edit
```

⚠️ גם `amend` משנה hash – אל תשתמש עליו ל-commits שכבר נדחפו ושותפים.

## `git reflog` – רשת ההצלה

Git שומר "יומן" של כל תזוזה של `HEAD`, גם אחרי `reset --hard` – זו רשת ההצלה שמצילה כמעט מכל טעות:

```bash
git reflog
# a1b2c3d HEAD@{0}: reset: moving to HEAD~1
# e5f6g7h HEAD@{1}: commit: Add feature X

# שחזור למצב שהיה לפני ה-reset:
git reset --hard HEAD@{1}
```

## הוצאת קובץ יחיד מ-commit ישן

```bash
git checkout a1b2c3d -- path/to/file.txt
git commit -m "Restore file from old version"
```

## מחיקת קבצים לא-עקובים (Untracked Files)

```bash
git clean -n     # תצוגה מקדימה (dry-run) - מה יימחק
git clean -f      # מחיקה בפועל של קבצים לא-עקובים
git clean -fd     # כולל תיקיות
```

## טיפים וטריקים

1. **`revert` בפרודקשן, `reset` רק מקומית** – כלל אצבע פשוט שמונע כאב ראש.
2. **תמיד `git reflog` לפני פאניקה** – כמעט תמיד ניתן לשחזר משהו ש"אבד", כל עוד לא עברו שבועות (Git מנקה reflog ישן אחרי כ-90 יום כברירת מחדל).
3. **`git stash` לפני `reset --hard`** – אם יש ספק, שמור קודם את השינויים ב-stash ליתר ביטחון.
4. **`git diff --staged`** – בדוק בדיוק מה יכנס ל-commit הבא, לפני שאתה מריץ commit.
5. **הימנע מ-`git push --force` ל-branches משותפים** – אם חייבים, השתמש ב-`git push --force-with-lease` שבודק שאף אחד אחר לא דחף בינתיים, ומונע מחיקת עבודה של מישהו אחר בטעות.

## שאלות ראיון עבודה נפוצות

**ש: מה ההבדל בין `git reset` ל-`git revert`?**
ת: `reset` מזיז את מצביע ה-branch אחורה ו"מוחק" commits מההיסטוריה (מסוכן על היסטוריה משותפת). `revert` יוצר commit חדש שמבטל את השינויים של commit קודם, בלי למחוק כלום מההיסטוריה – בטוח לשימוש תמיד, גם על branches ציבוריים.

**ש: הסבר את ההבדל בין `--soft`, `--mixed`, ו-`--hard` ב-`git reset`.**
ת: `--soft` מזיז רק את מצביע ה-commit, השינויים נשארים ב-staging. `--mixed` (ברירת מחדל) גם מוציא מה-staging אך משאיר בworking directory. `--hard` מוחק את השינויים לחלוטין מכל שלושת האזורים.

**ש: מה זה `git reflog` ולמה הוא שימושי?**
ת: יומן פנימי שרושם כל תזוזה של HEAD (commits, resets, checkouts) גם אם commits "אבדו" מההיסטוריה הרגילה. מאפשר לשחזר כמעט כל מצב קודם, גם אחרי `reset --hard` בטעות.

**ש: מתי תשתמש ב-`git commit --amend` ומה הסיכון שלו?**
ת: כדי לתקן הודעה או להוסיף קובץ שנשכח ל-commit האחרון בלבד. הסיכון: זה משנה את ה-hash של ה-commit, אז אסור להשתמש בו על commit שכבר נדחף ושותפים אחרים כבר משכו.

**ש: מה ההבדל בין `git push --force` ל-`git push --force-with-lease`?**
ת: `--force` דורס את ההיסטוריה ברימוט ללא תנאי, גם אם מישהו אחר דחף שינויים חדשים בינתיים – מסוכן מאוד. `--force-with-lease` בודק קודם שהמצב ברימוט זהה למה שאתה מצפה, ומסרב לדחוף אם מישהו אחר כבר שינה משהו – בטוח יותר משמעותית.

**ש: איך תשחזר קובץ שנמחק בטעות ולא נשמר עדיין (uncommitted)?**
ת: אם הקובץ עדיין tracked ורק נמחק מה-working directory: `git restore <file>`. אם היה untracked ונמחק ידנית מה-filesystem, אין דרך לשחזר דרך Git – רק אם היה גיבוי חיצוני.

## קישורים חיצוניים

**YouTube:**
- [Git Reset, Revert, Checkout Explained](https://www.youtube.com/results?search_query=git+reset+revert+checkout+explained)
- [Git Reflog Tutorial - The Undo Button](https://www.youtube.com/results?search_query=git+reflog+tutorial)
- [Git & GitHub Tutorial for Beginners (2026)](https://www.youtube.com/watch?v=h2a3Kw-I_Ec)

**דוקומנטציה:**
- [Git Docs – Reset Demystified](https://git-scm.com/docs/git-reset)
- [Git Docs – git revert](https://git-scm.com/docs/git-revert)
- [Atlassian – Undoing Changes](https://www.atlassian.com/git/tutorials/undoing-changes)
- [Git Docs – Reflog](https://git-scm.com/docs/git-reflog)
