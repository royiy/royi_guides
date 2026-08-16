---
title: "Stash, Cherry-Pick ו-Tags"
category: DevOps/Git
part: 4/10
---

## Git Stash – שמירת שינויים זמנית

כשעובדים על משהו אבל צריך לעבור branch מהר (למשל לתקן bug דחוף), ולא רוצים לעשות commit לא-גמור:

```bash
# שמירת כל השינויים הלא-שמורים
git stash

# עם הודעה מזהה
git stash push -m "עבודה על טופס login"

# רשימת כל ה-stashes
git stash list
# stash@{0}: On feature/login: עבודה על טופס login
# stash@{1}: On main: WIP on main

# החזרת ה-stash האחרון ומחיקתו מהרשימה
git stash pop

# החזרת stash ספציפי, בלי למחוק מהרשימה
git stash apply stash@{1}

# מחיקת stash ספציפי
git stash drop stash@{0}

# מחיקת כל ה-stashes
git stash clear

# כולל קבצים untracked
git stash -u
```

### תרחיש טיפוסי

```bash
# עובד על feature, יש שינויים לא שמורים
git stash push -m "half-done feature"

# עובר ל-main לתקן bug דחוף
git switch main
git switch -c hotfix/critical-bug
# ... מתקן, commit, push ...

# חוזר לעבודה על ה-feature
git switch feature/login
git stash pop
```

## Cherry-Pick – העתקת commit ספציפי מ-branch אחר

```bash
git cherry-pick a1b2c3d
```

לוקח commit בודד (עם ה-diff שלו) ומחיל אותו על ה-branch הנוכחי, כ-commit חדש (עם hash חדש).

```
לפני:
main:     A---B
               \
feature:        C---D---E

git switch main
git cherry-pick D

אחרי:
main:     A---B---D'
               \
feature:        C---D---E
```

**מתי שימושי?**
- תיקון קריטי (hotfix) שנעשה ב-branch פיתוח, שצריך להעביר מיידית ל-`main`/production בלי למזג את כל שאר ה-branch.
- העברת commit ספציפי בין repositories/branches לא קשורים.

```bash
# cherry-pick של כמה commits ברצף
git cherry-pick a1b2c3d..e5f6g7h

# cherry-pick בלי commit אוטומטי (לבדיקה לפני)
git cherry-pick -n a1b2c3d
```

## Tags – סימון גרסאות

Tags מסמנים נקודה ספציפית בהיסטוריה (בדרך כלל release), ובניגוד ל-branch, הם **לא זזים** – מצביעים תמיד לאותו commit.

```bash
# Lightweight tag (רק שם, בלי metadata)
git tag v1.0.0

# Annotated tag (מומלץ - כולל הודעה, מחבר, תאריך)
git tag -a v1.0.0 -m "Release version 1.0.0"

# תיוג commit ספציפי (לא רק HEAD)
git tag -a v1.0.0 a1b2c3d -m "Release 1.0.0"

# רשימת תגיות
git tag

# דחיפת tag ספציפי
git push origin v1.0.0

# דחיפת כל התגיות
git push origin --tags

# מחיקת tag
git tag -d v1.0.0
git push origin --delete v1.0.0
```

### שימוש נפוץ ב-CI/CD

```yaml
on:
  push:
    tags: ['v*.*.*']
```

טאגים בסגנון SemVer (`v1.2.3`) הם הדרך הנפוצה ביותר להפעיל pipelines של release.

## Git Bisect – מציאת ה-commit שהכניס באג

```bash
git bisect start
git bisect bad                  # ה-commit הנוכחי מקולקל
git bisect good v1.0.0          # הגרסה הזו הייתה תקינה

# Git עובר לcommit באמצע - בודקים אם הבאג קיים
git bisect good     # אם תקין
git bisect bad       # אם מקולקל

# חוזרים על התהליך עד ש-Git מזהה את הcommit המדויק שהכניס את הבאג
git bisect reset     # יציאה מתהליך ה-bisect
```

זהו חיפוש בינארי (binary search) על ההיסטוריה – יעיל מאוד למציאת regression בפרויקטים עם היסטוריה ארוכה.

## טיפים וטריקים

1. **`git stash` עם הודעה תמיד** – `git stash push -m "..."` – אחרת קשה לזכור מה כל stash מכיל אחרי כמה שבועות.
2. **Cherry-pick זהיר** – אם ה-commit תלוי בשינויים אחרים מה-branch המקורי, ה-cherry-pick עלול ליצור קונפליקטים או קוד לא-שלם.
3. **Annotated Tags לreleases** – תמיד `-a` ולא lightweight tag, כדי לשמור metadata (מי תייג, מתי, למה).
4. **`git bisect run`** – ניתן להעביר סקריפט אוטומטי (`git bisect run npm test`) שרץ אוטומטית על כל commit ומחליט good/bad – חוסך המון זמן ידני.
5. **Stash לפני `git pull` עם שינויים לא-מוסטגים** – מונע קונפליקטים מיותרים; אפשר גם `git pull --autostash`.

## שאלות ראיון עבודה נפוצות

**ש: מה ההבדל בין `git stash` ל-`git commit`?**
ת: Stash שומר שינויים זמנית **מחוץ להיסטוריית ה-commits**, כדי לעבור branch או לעבוד על משהו אחר בלי ליצור commit לא-גמור. Commit הוא שמירה קבועה בהיסטוריה. Stash הוא זמני ומיועד להעברה מהירה בין הקשרים עבודה.

**ש: מתי תשתמש ב-`cherry-pick` במקום `merge`?**
ת: כשרוצים להעביר commit ספציפי אחד (או כמה) מ-branch אחד לאחר, בלי להביא את כל שאר ההיסטוריה של ה-branch המקורי. שימושי במיוחד ל-hotfixes דחופים שצריך להעביר ל-production מבלי למזג branch פיתוח שלם שעדיין לא מוכן.

**ש: מה ההבדל בין Lightweight Tag ל-Annotated Tag?**
ת: Lightweight tag הוא רק שם המצביע לcommit, ללא metadata נוסף. Annotated tag (`-a`) הוא אובייקט מלא בGit עם מחבר, תאריך, הודעה, וניתן אף לחתום עליו דיגיטלית (`-s`) – מומלץ ל-releases רשמיים.

**ש: איך `git bisect` עוזר למצוא באג?**
ת: הוא מבצע חיפוש בינארי על היסטוריית ה-commits בין נקודה ידועה כתקינה לנקודה ידועה כמקולקלת, ומבקש ממך (או מסקריפט אוטומטי) לבדוק בכל שלב האם הcommit הנוכחי תקין – כך מגיעים ל-commit המדויק שהכניס את הבאג ב-log(n) בדיקות במקום O(n).

**ש: מה קורה אם יש קונפליקט בזמן `cherry-pick`?**
ת: בדיוק כמו ב-merge – Git עוצר, מסמן את הקונפליקט בקובץ, ומחכה שתפתור ידנית, תעשה `git add` על הקובץ הפתור, ואז `git cherry-pick --continue`. אפשר גם `git cherry-pick --abort` לביטול מלא.

**ש: מה ההבדל בין Branch ל-Tag מבחינה טכנית?**
ת: שניהם בעצם pointers לcommit. ההבדל: Branch הוא **נייד** – מתעדכן אוטומטית לכל commit חדש שנוצר עליו. Tag הוא **קבוע** – מצביע לתמיד לאותו commit ספציפי, ולא נועד לזוז.

## קישורים חיצוניים

**YouTube:**
- [Git Stash Explained](https://www.youtube.com/results?search_query=git+stash+explained+tutorial)
- [Git Cherry-Pick Tutorial](https://www.youtube.com/results?search_query=git+cherry+pick+tutorial)
- [Git Bisect - Finding Bugs Fast](https://www.youtube.com/results?search_query=git+bisect+tutorial)

**דוקומנטציה:**
- [Git Docs – git stash](https://git-scm.com/docs/git-stash)
- [Git Docs – git cherry-pick](https://git-scm.com/docs/git-cherry-pick)
- [Git Docs – git tag](https://git-scm.com/docs/git-tag)
- [Git Docs – git bisect](https://git-scm.com/docs/git-bisect)
