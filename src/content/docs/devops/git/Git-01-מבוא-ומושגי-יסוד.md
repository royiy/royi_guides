---
title: "Git מבוא ומושגי יסוד"
category: DevOps/Git
part: 1/10
---

## מה זה Git?

Git הוא **מערכת בקרת גרסאות מבוזרת (Distributed Version Control System)** שנוצרה על ידי לינוס טורבאלדס (יוצר הלינוקס) ב-2005. בניגוד למערכות מרכזיות ישנות (כמו SVN), בGit לכל מפתח יש עותק מלא של כל היסטוריית הפרויקט על המחשב המקומי שלו – אין תלות בשרת מרכזי כדי לעבוד (למעט שיתוף עם אחרים).

## Git מול GitHub – הבדל קריטי

- **Git** – הכלי/הפרוטוקול עצמו לניהול גרסאות, רץ מקומית.
- **GitHub** (וגם GitLab, Bitbucket) – שירות ענן שמארח repositories של Git ומוסיף עליו כלים כמו Pull Requests, Issues, CI/CD.

## שלושת האזורים ב-Git (The Three Trees)

```
Working Directory  --git add-->  Staging Area (Index)  --git commit-->  Repository (.git)
   (הקבצים שלך)         (מה שייכנס לcommit הבא)              (היסטוריית commits)
```

| אזור | תיאור |
|---|---|
| Working Directory | הקבצים בפועל בתיקייה שלך, כפי שאתה עורך אותם |
| Staging Area (Index) | "אזור המתנה" – שינויים שסימנת (`git add`) שייכנסו ל-commit הבא |
| Repository | ההיסטוריה השמורה בפועל בתוך `.git`, אחרי `commit` |

## פקודות יסוד

```bash
# הגדרת זהות (פעם אחת בלבד)
git config --global user.name "שם משתמש"
git config --global user.email "email@example.com"

# יצירת repository חדש
git init

# שכפול repository קיים
git clone https://github.com/user/repo.git

# בדיקת מצב הקבצים
git status

# הוספת קבצים ל-staging
git add file.txt        # קובץ ספציפי
git add .                # כל הקבצים ששונו

# יצירת commit
git commit -m "הודעת commit ברורה"

# צפייה בהיסטוריה
git log
git log --oneline --graph --all

# העלאה לרימוט
git push origin main

# משיכת שינויים מהרימוט
git pull origin main
```

## מהו Commit בפועל?

Commit הוא "תמונת מצב" (snapshot) של כל הפרויקט ברגע נתון, לא רק "diff". לכל commit יש:
- **Hash ייחודי** (SHA-1, למשל `a1b2c3d4...`)
- **הודעה (message)** שמתארת את השינוי
- **מחבר (author) ותאריך**
- **הפניה ל-commit ההורה** (parent) – כך נוצרת שרשרת = ההיסטוריה

```bash
git log --oneline
# a1b2c3d (HEAD -> main) Fix login bug
# e5f6g7h Add user authentication
# i8j9k0l Initial commit
```

## `.gitignore` – קבצים שלא רוצים לעקוב אחריהם

```gitignore
node_modules/
.env
*.log
dist/
.DS_Store
__pycache__/
```

## Remote – חיבור ל-Repository מרוחק

```bash
git remote add origin https://github.com/user/repo.git
git remote -v                    # הצגת remotes מוגדרים
git remote show origin           # פרטים מפורטים
```

## טיפים וטריקים

1. **Commit קטן ותכוף** – עדיף הרבה commits קטנים וממוקדים מ-commit ענק אחד; קל יותר לעקוב, לסקור ולבצע rollback.
2. **הודעות commit ברורות** – פורמט מומלץ: שורה ראשונה קצרה (עד 50 תווים) בזמן ציווי ("Add", לא "Added"), ואז שורה ריקה ותיאור מפורט אם צריך.
3. **`git add -p`** – מאפשר לבחור באופן חלקי (interactive) אילו שינויים בתוך קובץ להכניס ל-staging – שימושי כשעשית כמה שינויים לא קשורים באותו קובץ.
4. **`git status` לפני כל פעולה** – הרגל שמונע טעויות רבות.
5. **אל תעקוב אחרי קבצים גדולים/בינאריים** – השתמש ב-Git LFS (Large File Storage) לקבצים כאלה.

## שאלות ראיון עבודה נפוצות

**ש: מה ההבדל בין Git ל-GitHub?**
ת: Git הוא כלי בקרת גרסאות מבוזר שרץ מקומית ומנהל היסטוריה. GitHub הוא שירות ענן שמארח repositories של Git ומוסיף שכבת שיתוף פעולה (PRs, Issues, CI/CD) מעליו.

**ש: הסבר את שלושת האזורים ב-Git (Working Directory, Staging, Repository).**
ת: Working Directory הם הקבצים בפועל שאתה עורך. Staging Area הוא אזור ביניים שבו מסמנים אילו שינויים ייכנסו ל-commit הבא (`git add`). Repository הוא ההיסטוריה השמורה בפועל אחרי `git commit`, בתוך תיקיית `.git`.

**ש: מה זה Commit Hash ולמה הוא חשוב?**
ת: מזהה ייחודי (SHA-1, 40 תווים הקסדצימליים) שמחושב מתוכן ה-commit, ההורה שלו, המחבר והזמן. הוא מבטיח שלכל שינוי יש זיהוי חד-משמעי ובלתי ניתן לזיוף – ליבת מודל האבטחה וה-Integrity של Git.

**ש: מה ההבדל בין Distributed Version Control (כמו Git) ל-Centralized (כמו SVN)?**
ת: במערכת מרכזית יש שרת יחיד עם ההיסטוריה המלאה, וללא חיבור אליו לא ניתן לעבוד. במערכת מבוזרת כמו Git, לכל מפתח יש עותק מלא של כל ההיסטוריה מקומית – ניתן לעבוד, לעשות commit ולראות היסטוריה גם ללא אינטרנט.

**ש: מה זה `.gitignore` ולמה חשוב להגדיר אותו נכון?**
ת: קובץ שמגדיר דפוסי קבצים/תיקיות ש-Git לא יעקוב אחריהם (כמו `node_modules`, קבצי סביבה עם סודות, קבצי build). חשוב כדי למנוע commit בטעות של קבצים גדולים, סודות רגישים, או artifacts שנוצרים אוטומטית.

## קישורים חיצוניים

**YouTube:**
- [Git & GitHub Tutorial for Beginners (2026)](https://www.youtube.com/watch?v=h2a3Kw-I_Ec)
- [Learn Git – Full Course for Beginners](https://www.youtube.com/watch?v=zTjRZNkhiEU)
- [Git & GitHub Crash Course for Beginners](https://www.youtube.com/watch?v=mAFoROnOfHs)

**דוקומנטציה:**
- [Git Official Documentation](https://git-scm.com/doc)
- [Pro Git Book (חינמי, מלא)](https://git-scm.com/book/en/v2)
- [GitHub Docs – Git Basics](https://docs.github.com/en/get-started/using-git)
