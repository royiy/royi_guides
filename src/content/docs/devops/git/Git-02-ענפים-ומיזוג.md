---
title: "Git ענפים ומיזוג"
category: DevOps/Git
part: 2/10
---

## מה זה Branch בפועל?

Branch הוא בעצם **מצביע (pointer) קל משקל** לcommit מסוים. כשיוצרים commit חדש בענף, המצביע פשוט זז קדימה. זה מה שהופך יצירת branch ב-Git למהירה כל כך (בניגוד למערכות ישנות שהעתיקו קבצים בפועל).

```
main:    A---B---C
              \
feature:       D---E
```

## פקודות בסיסיות

```bash
# יצירת branch חדש
git branch feature/login

# מעבר ל-branch
git checkout feature/login
# או, גישה מודרנית יותר:
git switch feature/login

# יצירה ומעבר בפקודה אחת
git checkout -b feature/login
git switch -c feature/login

# רשימת כל הענפים
git branch          # מקומיים
git branch -r       # מרוחקים (remote)
git branch -a       # הכל

# מחיקת branch
git branch -d feature/login     # בטוח - רק אם מוזג
git branch -D feature/login     # כפוי - גם אם לא מוזג

# דחיפת branch חדש לרימוט
git push -u origin feature/login
```

## מיזוג (Merge)

```bash
git switch main
git merge feature/login
```

### Fast-Forward Merge

כאשר ל-`main` לא היו commits חדשים מאז שיצרת את ה-branch, Git פשוט מזיז את מצביע ה-`main` קדימה – אין צורך ב-merge commit:

```
לפני:  main: A---B
             feature: A---B---C---D

אחרי:  main: A---B---C---D  (מצביע זז, ללא merge commit)
```

### 3-Way Merge (עם Merge Commit)

כאשר יש היסטוריה שהתפצלה (divergent history), Git יוצר **merge commit** חדש עם שני הורים:

```
לפני:
main:     A---B-------E
               \
feature:        C---D

אחרי:
main:     A---B-------E---F  (F = merge commit, הורים: E ו-D)
               \           /
feature:        C---------D
```

```bash
git log --oneline --graph --all
```

## פתרון קונפליקטים (Merge Conflicts)

כשאותו חלק בקובץ שונה בשני הענפים, Git לא יכול להחליט אוטומטית ומסמן קונפליקט:

```
<<<<<<< HEAD
const greeting = "שלום עולם";
=======
const greeting = "Hello World";
>>>>>>> feature/login
```

**שלבי פתרון:**
```bash
# 1. פתח את הקובץ וערוך ידנית, הסר את הסימונים
# 2. סמן שהקונפליקט נפתר
git add resolved-file.js
# 3. השלם את ה-merge
git commit
```

## Rebase – חלופה ל-Merge

Rebase לוקח את השינויים שלך ו"משתיל" אותם מחדש על גבי בסיס עדכני, במקום ליצור merge commit:

```bash
git switch feature/login
git rebase main
```

```
לפני:
main:     A---B---E
               \
feature:        C---D

אחרי rebase:
main:     A---B---E
                    \
feature:             C'---D'   (commits חדשים לגמרי, עם hash שונה!)
```

⚠️ **כלל ברזל**: **לעולם אל תעשה rebase על branch ציבורי ששותפים אחרים כבר משכו (`pull`)** – כי rebase כותב מחדש היסטוריה (משנה hashes), מה שיוצר בלגן קשה לשותפים.

## Interactive Rebase – עריכת היסטוריה

```bash
git rebase -i HEAD~3
```

```
pick a1b2c3d Add login form
squash e5f6g7h Fix typo in login form
reword i8j9k0l Add validation
```

פקודות נפוצות: `pick` (השאר כמו שהוא), `squash`/`s` (מזג עם הקודם), `reword`/`r` (שנה הודעה), `drop`/`d` (מחק commit), `edit`/`e` (עצור לעריכה).

## טיפים וטריקים

1. **Squash לפני מיזוג ל-main** – הפוך סדרת commits "מבולגנים" (WIP, fix typo וכו') ל-commit לוגי אחד נקי לפני מיזוג ל-branch הראשי.
2. **Rebase לפני Merge Request** – `git rebase main` על ה-feature branch שלך לפני פתיחת PR שומר היסטוריה ליניארית ונקייה.
3. **`git merge --no-ff`** – כופה יצירת merge commit גם כשfast-forward אפשרי, כדי לשמור עדות ברורה שהיה branch נפרד (שימושי ב-Git Flow).
4. **שם branch ברור** – קונבנציה נפוצה: `feature/xyz`, `bugfix/xyz`, `hotfix/xyz`.
5. **מחק branches אחרי מיזוג** – שומר את הרפוזיטורי נקי; `git branch -d` מקומית ו-`git push origin --delete branch-name` ברימוט.

## שאלות ראיון עבודה נפוצות

**ש: מה ההבדל בין Merge ל-Rebase, ומתי תשתמש בכל אחד?**
ת: Merge שומר את ההיסטוריה המקורית ויוצר merge commit חדש עם שני הורים – בטוח לשימוש על branches משותפים. Rebase כותב מחדש את ההיסטוריה על ידי יצירת commits חדשים על בסיס עדכני – יוצר היסטוריה ליניארית ונקייה, אך אסור להשתמש בו על branches ציבוריים ששותפים כבר משכו, כי הוא משנה hashes.

**ש: מה זה Fast-Forward Merge?**
ת: מצב שבו אין היסטוריה מפוצלת בין הענפים – Git פשוט מזיז את מצביע ה-branch קדימה בלי ליצור merge commit, כי ה-branch המקורי הוא פשוט "המשך ישיר" של הענף שאליו ממזגים.

**ש: איך פותרים Merge Conflict?**
ת: Git מסמן בקובץ את שני הגרסאות המתנגשות עם `<<<<<<<`, `=======`, `>>>>>>>`. עורכים ידנית את הקובץ לגרסה הרצויה, מסירים את הסימונים, עושים `git add` על הקובץ הפתור, ואז `git commit` (ב-merge) או `git rebase --continue` (ב-rebase).

**ש: מה זה Interactive Rebase ומתי משתמשים בו?**
ת: `git rebase -i` מאפשר לערוך היסטוריית commits – למחוק, למזג (squash), לשנות הודעות, או לשנות סדר – לפני שיתוף ה-branch עם אחרים. שימושי לניקוי היסטוריה "מבולגנת" של WIP commits לפני פתיחת Pull Request.

**ש: מה הסיכון בעשיית rebase על branch שכבר שותף (pushed) לצוות?**
ת: Rebase יוצר commits חדשים עם hashes שונים, מה שהופך את ה-commits הישנים ל"יתומים". אם מישהו אחר כבר משך את ה-branch המקורי, ה-rebase יוצר קונפליקט היסטוריה קשה לפתרון עבורו, ועלול לגרום לאובדן/כפילות שינויים.

**ש: מה ההבדל בין `git branch -d` ל-`git branch -D`?**
ת: `-d` מוחק branch רק אם הוא כבר מוזג במלואו לענף הנוכחי (בטוח). `-D` (קיצור של `--delete --force`) מוחק אותו בכל מקרה, גם אם יש שינויים לא-מוזגים – עלול לגרום לאובדן קוד.

## קישורים חיצוניים

**YouTube:**
- [Git Branching and Merging Explained](https://www.youtube.com/results?search_query=git+branching+and+merging+explained)
- [Git Rebase vs Merge Explained](https://www.youtube.com/results?search_query=git+rebase+vs+merge+explained)
- [Git & GitHub Full Course for Beginners](https://www.youtube.com/watch?v=kYofz4QDX-Y)

**דוקומנטציה:**
- [Git Docs – Branching and Merging](https://git-scm.com/book/en/v2/Git-Branching-Basic-Branching-and-Merging)
- [Git Docs – Rebasing](https://git-scm.com/book/en/v2/Git-Branching-Rebasing)
- [Atlassian – Merging vs Rebasing](https://www.atlassian.com/git/tutorials/merging-vs-rebasing)
