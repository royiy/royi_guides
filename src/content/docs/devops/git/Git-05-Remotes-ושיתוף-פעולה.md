---
title: "Remotes, Pull Requests ושיתוף פעולה"
category: DevOps/Git
part: 5/10
---

## מה זה Remote?

Remote הוא הפניה (URL) ל-repository אחר – בדרך כלל בשרת (GitHub/GitLab/Bitbucket) – שדרכו משתפים קוד עם אחרים. ה-remote שנוצר אוטומטית ב-`git clone` נקרא כברירת מחדל `origin`.

```bash
git remote -v
# origin  https://github.com/user/repo.git (fetch)
# origin  https://github.com/user/repo.git (push)

git remote add upstream https://github.com/original-owner/repo.git
```

**שימוש נפוץ ב-`upstream`**: כשעושים Fork לפרויקט open-source – `origin` מצביע לפורק שלך, `upstream` מצביע לפרויקט המקורי, כדי למשוך עדכונים ממנו.

## Fetch מול Pull

```bash
git fetch origin     # מוריד שינויים מהרימוט, בלי לשלב אותם ב-branch המקומי
git pull origin main  # שקול ל: git fetch + git merge (או rebase)
```

`git fetch` בטוח יותר – מאפשר לבדוק מה השתנה (`git log origin/main`) לפני שמשלבים אותו אצלך.

```bash
git pull --rebase origin main   # rebase במקום merge - היסטוריה ליניארית יותר
```

## זרימת עבודה עם Pull Request / Merge Request

```
1. Fork/Clone הרפוזיטורי
2. git switch -c feature/new-thing
3. עבודה + commits
4. git push -u origin feature/new-thing
5. פתיחת Pull Request ב-GitHub/GitLab
6. Code Review + דיון + תיקונים
7. CI רץ אוטומטית (build, test, lint)
8. אישור (Approve) + Merge
9. מחיקת ה-branch
```

## Fork Workflow (נפוץ ב-Open Source)

```bash
# 1. Fork דרך ה-UI של GitHub
# 2. Clone את הפורק שלך
git clone https://github.com/YOUR-USERNAME/repo.git
cd repo

# 3. הוסף upstream לפרויקט המקורי
git remote add upstream https://github.com/ORIGINAL-OWNER/repo.git

# 4. סנכרון עם המקור לפני עבודה
git fetch upstream
git switch main
git merge upstream/main

# 5. יצירת feature branch ועבודה כרגיל
git switch -c feature/my-contribution
```

## Code Review – טיפים לכתיבת PR טוב

- **PR ממוקד וקטן** – קל יותר לסקור PR של 100 שורות מ-PR של 2000 שורות.
- **תיאור ברור** – מה השתנה, למה, ואיך לבדוק.
- **קישור ל-Issue** – `Closes #42` סוגר issue אוטומטית ב-GitHub עם המיזוג.
- **Self-Review לפני שליחה** – עבור על ה-diff בעצמך לפני שאתה מבקש מאחרים.

## `git diff` – השוואות שימושיות

```bash
git diff                        # שינויים לא-מוסטגים
git diff --staged               # שינויים ב-staging
git diff main feature/login     # השוואה בין שני branches
git diff HEAD~3 HEAD            # השוואה בין 3 commits אחרונים
git diff --stat                 # רק סיכום קבצים ששונו, בלי תוכן
```

## `git blame` – מי כתב שורה מסוימת ומתי

```bash
git blame file.js
git blame -L 10,20 file.js   # רק שורות 10-20
```

שימושי להבנת ההקשר ההיסטורי של קוד – למה שורה מסוימת נכתבה כך, ומי לשאול.

## Submodules – ניהול repositories מקוננים

```bash
git submodule add https://github.com/user/library.git libs/library
git submodule update --init --recursive
```

מאפשר להכניס repository שלם כתלות בתוך repository אחר, תוך שמירה על היסטוריה נפרדת – שימושי לספריות משותפות, אך מוסיף מורכבות (רבים מעדיפים חלופות כמו package managers).

## טיפים וטריקים

1. **`fetch` לפני `pull` כשלא בטוחים** – בדוק מה השתנה לפני שאתה משלב.
2. **Branch protection + Required Reviews** – חסום merge ישיר ל-`main` בלי לפחות אישור אחד ו-CI ירוק.
3. **Draft Pull Requests** – פתח PR כ-"Draft" כשעדיין עובד עליו, כדי לקבל פידבק מוקדם בלי לסמן שהוא מוכן למיזוג.
4. **CODEOWNERS file** – מגדיר אוטומטית מי צריך לסקור אילו קבצים/תיקיות ב-PR.
5. **Rebase לפני PR, לא Merge מ-main ל-feature** – שומר היסטוריה נקייה יותר מ"merge commits" מיותרים.

## שאלות ראיון עבודה נפוצות

**ש: מה ההבדל בין `git fetch` ל-`git pull`?**
ת: `fetch` מוריד שינויים מהרימוט לענפי מעקב מקומיים (`origin/main`) בלי לגעת ב-branch שאתה עליו – בטוח לבדיקה. `pull` הוא בעצם `fetch` ואז `merge` (או `rebase`) אוטומטי לתוך ה-branch הנוכחי שלך.

**ש: הסבר את זרימת עבודת ה-Fork Workflow הנפוצה בפרויקטי Open Source.**
ת: המתורגם Fork את הרפוזיטורי המקורי לחשבון שלו, מוסיף remote בשם `upstream` שמצביע למקור, עובד על feature branches בפורק שלו, ופותח Pull Request מהפורק בחזרה לפרויקט המקורי. זה מאפשר תרומה גם למי שאין לו הרשאות כתיבה ישירות לרפוזיטורי המקורי.

**ש: מה זה Branch Protection Rule ולמה חשוב להגדיר אותו?**
ת: הגדרה ב-GitHub/GitLab שחוסמת פעולות מסוימות על branch מסוים (כמו `main`) – למשל push ישיר, מיזוג ללא code review, או מיזוג כשה-CI נכשל. חשוב לשמירה על איכות ויציבות הענף הראשי.

**ש: מה ההבדל בין `origin` ל-`upstream`?**
ת: אלה רק שמות מוסכמים (convention), לא מונחים מיוחדים ב-Git עצמו. `origin` הוא בדרך כלל הrepository שממנו עשית clone (הפורק שלך). `upstream` הוא הרפוזיטורי המקורי שממנו אתה מושך עדכונים כשעובדים בשיטת Fork.

**ש: מה זה Git Submodule ומה החסרונות שלו?**
ת: מנגנון להטמעת repository אחד בתוך אחר, תוך שמירה על היסטוריות נפרדות. חסרונות: מורכבות בשימוש (`git submodule update --init` שכיח לשכוח), קושי לעקוב אחרי commit ה-submodule המדויק, וחוויית פיתוח פחות אינטואיטיבית מפתרונות חלופיים כמו package managers.

**ש: איך `git blame` יכול לעזור בדיבוג (debugging)?**
ת: הוא מראה מי כתב כל שורה בקובץ ובאיזה commit – מאפשר להבין את ההקשר ההיסטורי של קוד בעייתי, למצוא את ה-commit שהכניס שינוי מסוים, ולדעת את מי לשאול לגבי כוונת הקוד.

## קישורים חיצוניים

**YouTube:**
- [Git Remotes Explained](https://www.youtube.com/results?search_query=git+remotes+explained)
- [How to Fork a Repository and Make a Pull Request](https://www.youtube.com/results?search_query=how+to+fork+repository+pull+request+github)
- [Complete Git and GitHub Tutorial](https://www.youtube.com/watch?v=apGV9Kg7ics)

**דוקומנטציה:**
- [GitHub Docs – About Forks](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/about-forks)
- [GitHub Docs – About Pull Requests](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests)
- [Git Docs – git remote](https://git-scm.com/docs/git-remote)
- [GitHub Docs – About Code Owners](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)
