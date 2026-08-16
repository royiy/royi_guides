---
title: "פתרון בעיות ופקודות מתקדמות"
category: DevOps/Git
part: 9/10
---

## תרחיש 1: "עשיתי commit לענף הלא נכון"

```bash
# הבעיה: commit נעשה על main במקום feature branch
git log --oneline -1     # מוצא את ה-hash של הcommit האחרון

# פתרון: צור branch חדש מהמצב הנוכחי, ואז אפס את main אחורה
git branch feature/correct-branch
git reset --hard HEAD~1   # מחזיר את main למצב הקודם

git switch feature/correct-branch   # ה-commit נמצא כאן עכשיו
```

## תרחיש 2: "עשיתי push בטעות ל-branch הלא נכון"

```bash
# אם אף אחד עוד לא משך:
git revert <bad-commit-hash>
git push

# אם צריך "למחוק" לגמרי (רק אם בטוח שאף אחד לא משך):
git reset --hard HEAD~1
git push --force-with-lease
```

## תרחיש 3: קונפליקט בזמן Merge/Rebase שלא מבינים

```bash
git status
# מציג בדיוק אילו קבצים בקונפליקט

# צפייה בשלושת הגרסאות (base, ours, theirs)
git diff

# ביטול הכל וחזרה למצב לפני
git merge --abort
git rebase --abort

# בחירה גורפת בגרסה שלנו/שלהם עבור כל הקונפליקטים
git checkout --ours file.txt      # שמור את הגרסה שלנו
git checkout --theirs file.txt    # שמור את הגרסה שלהם
git add file.txt
```

## תרחיש 4: "הענף שלי מפגר הרבה אחרי main"

```bash
# אופציה 1: Merge (בטוח, יוצר merge commit)
git switch feature/mine
git merge main

# אופציה 2: Rebase (היסטוריה נקייה, אך רק אם ה-branch לא משותף)
git switch feature/mine
git rebase main
# פתרון קונפליקטים אם יש, לכל commit בנפרד
git rebase --continue
```

## תרחיש 5: "מחקתי branch בטעות"

```bash
# מוצאים את ה-commit האחרון שהיה בו דרך reflog
git reflog | grep "checkout: moving from feature/deleted"

# יוצרים branch חדש מאותו hash
git branch feature/recovered a1b2c3d
```

## תרחיש 6: "יש לי קובץ ענק בהיסטוריה שמנפח את הrepository"

```bash
# מציאת הקבצים הכבדים ביותר בהיסטוריה
git rev-list --objects --all | \
  git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' | \
  sort -k3 -n -r | head -10

# הסרה מההיסטוריה (כלי מודרני, מהיר)
# git-filter-repo (מומלץ על ידי Git עצמו, מחליף את filter-branch הישן)
git filter-repo --path path/to/huge-file.zip --invert-paths
```

⚠️ פעולה זו כותבת מחדש היסטוריה לגמרי – דורשת תיאום עם כל הצוות ו-`push --force`.

## תרחיש 7: "רוצה לראות מה שונה בין שני commits, קובץ ספציפי"

```bash
git diff commit1 commit2 -- path/to/file.js
git log -p -- path/to/file.js    # כל השינויים ההיסטוריים לקובץ הזה
```

## תרחיש 8: "צריך למצוא באיזה commit נמחקה שורת קוד מסוימת"

```bash
git log -S "someFunctionName" --oneline    # חיפוש לפי שינוי בתוכן (Pickaxe)
git log -G "regex pattern" --oneline        # חיפוש לפי regex
```

## `git worktree` – עבודה על כמה branches במקביל, בלי stash

```bash
git worktree add ../myproject-hotfix hotfix/critical-bug
cd ../myproject-hotfix
# עובדים כאן על branch נפרד, לגמרי במקביל לתיקייה המקורית
```

שימושי כשצריך לעבוד על שני branches בו-זמנית (למשל hotfix דחוף באמצע feature ארוך), בלי לעשות stash/switch מתמיד.

## `git log` – חיפושים מתקדמים

```bash
git log --author="שם"                       # commits של מחבר ספציפי
git log --since="2 weeks ago"                # לפי טווח זמן
git log --grep="bug fix"                     # חיפוש בהודעות commit
git log --follow -- file.js                  # עקוב אחרי קובץ גם דרך rename
git shortlog -sn                             # סטטיסטיקת commits לפי מחבר
```

## טיפים וטריקים

1. **`git status` הוא חבר שלך** – תמיד תריץ אותו לפני ואחרי כל פעולה לא ברורה.
2. **כשלא בטוחים – אל תעשה `--force`** – עצור, בדוק עם `git log`/`git diff`, ורק אז החלט.
3. **`--dry-run`** – פקודות רבות (`git clean`, `git push`) תומכות ב-flag שמראה מה יקרה בלי לבצע בפועל.
4. **גיבוי מהיר לפני ניסוי מסוכן** – `git branch backup-before-experiment` לוקח שנייה ונותן שקט נפשי.
5. **`git worktree` במקום stash כפול** – כשצריך לעבוד על כמה דברים במקביל ממש, worktree עדיף על stash מתמשך.

## שאלות ראיון עבודה נפוצות

**ש: איך תשחזר branch שנמחק בטעות?**
ת: דרך `git reflog`, שמאתר את ה-commit האחרון שהיה על אותו branch לפני המחיקה, ואז `git branch <name> <hash>` יוצר מחדש את ה-branch מאותה נקודה.

**ש: מה ההבדל בין `git checkout --ours` ל-`--theirs` בזמן פתרון קונפליקט?**
ת: `--ours` שומר את הגרסה מהbranch שאתה נמצא עליו (בdרך כלל ה-target של המיזוג). `--theirs` שומר את הגרסה מה-branch שממזגים אליו. שימושי כשרוצים לפתור קונפליקט בבחירה גורפת של צד אחד, בלי merge ידני שורה-שורה.

**ש: איך מחפשים באיזה commit הוצג/הוסר קטע קוד מסוים בהיסטוריה?**
ת: `git log -S "text"` (Pickaxe) מחפש commits שבהם מספר המופעים של המחרוזת השתנה. `git log -G "regex"` מחפש לפי regex בdiff עצמו. שימושי מאוד למציאת מתי בדיוק פונקציה נוספה/הוסרה.

**ש: איך מסירים קובץ גדול/רגיש מכל היסטוריית ה-Git, לא רק מה-commit הנוכחי?**
ת: באמצעות `git filter-repo` (הכלי המומלץ כיום, מחליף את `filter-branch` הישן והאיטי) שכותב מחדש את כל ההיסטוריה בלי הקובץ, ולאחר מכן דורש `push --force` מתואם עם כל הצוות, כי כל ה-hashes משתנים.

**ש: מה זה `git worktree` ומתי הוא שימושי יותר מ-`git stash`?**
ת: `worktree` מאפשר לפתוח כמה תיקיות עבודה במקביל מאותו repository, כל אחת על branch אחר, בלי לעשות switch/stash. שימושי כשצריך לעבוד ממש בו-זמנית על שני דברים (למשל hotfix דחוף תוך כדי feature ארוך שלא רוצים "להקפיא").

**ש: מה תעשה אם `git push` נכשל עם השגיאה "rejected - non-fast-forward"?**
ת: זה אומר שהרימוט מכיל commits שאין לך מקומית. הפתרון הנכון הוא `git pull` (או `git fetch` + `merge`/`rebase`) כדי לשלב את השינויים החדשים קודם, ורק אז `push`. **אין** להשתמש ב-`push --force` כפתרון ברירת מחדל, כי זה עלול למחוק עבודה של אחרים.

## קישורים חיצוניים

**YouTube:**
- [Git Troubleshooting - Common Problems and Fixes](https://www.youtube.com/results?search_query=git+troubleshooting+common+problems+and+fixes)
- [Git Worktree Explained](https://www.youtube.com/results?search_query=git+worktree+explained)
- [Advanced Git Tips and Tricks](https://www.youtube.com/results?search_query=advanced+git+tips+and+tricks)

**דוקומנטציה:**
- [Git Docs – git worktree](https://git-scm.com/docs/git-worktree)
- [git-filter-repo (GitHub)](https://github.com/newren/git-filter-repo)
- [Git Docs – git log (Pickaxe search)](https://git-scm.com/docs/git-log)
- [Oh Shit, Git!?! – מדריך תרחישי חירום נפוצים](https://ohshitgit.com/)
