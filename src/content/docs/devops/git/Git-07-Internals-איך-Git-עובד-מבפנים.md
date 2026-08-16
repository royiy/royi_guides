---
title: "Git Internals - איך Git עובד מבפנים"
category: DevOps/Git
part: 7/10
---

## תיקיית `.git`

כל repository מכיל תיקיית `.git` נסתרת עם כל הנתונים:

```bash
.git/
├── HEAD           # מצביע ל-branch הנוכחי
├── config         # הגדרות מקומיות לrepository
├── objects/       # כל האובייקטים (commits, trees, blobs) - "מסד הנתונים"
├── refs/
│   ├── heads/     # מצביעי branches מקומיים
│   └── tags/      # מצביעי tags
├── index          # ה-staging area
└── logs/          # reflog
```

## ארבעה סוגי אובייקטים ב-Git

Git הוא בבסיסו **content-addressable filesystem** – מסד נתונים מבוסס key-value, שבו המפתח הוא hash (SHA-1) של התוכן:

| סוג אובייקט | תוכן |
|---|---|
| **Blob** | תוכן קובץ בודד (רק הבייטים, ללא שם קובץ) |
| **Tree** | "תיקייה" – רשימה של blobs/trees עם שמות והרשאות |
| **Commit** | מצביע ל-tree + הורה (parent) + מטא-דאטה (מחבר, הודעה) |
| **Tag** | (annotated) מצביע לcommit + metadata נוסף |

```
Commit
 ├── tree: 4a5e...  (מייצג את שורש הפרויקט)
 ├── parent: e5f6...
 ├── author: ...
 └── message: "Add login feature"

Tree (4a5e...)
 ├── blob 8f3d... "index.js"
 ├── blob 2b1c... "package.json"
 └── tree 9d7e... "src/"  (תת-תיקייה)
```

## חישוב Hash – למה זה SHA-1?

```bash
echo "hello world" | git hash-object --stdin
# 3b18e512dba79e4c8300dd08aeb37f8e728b8dad
```

ה-hash מחושב מתוכן האובייקט עצמו. משמעות: **תוכן זהה = hash זהה**. אם שני קבצים בפרויקט זהים לחלוטין, Git שומר רק blob אחד לשניהם – זו הסיבה ש-Git יעיל כל כך במקום.

## גישה ישירה לאובייקטים (למטרות לימוד)

```bash
# צפייה בתוכן אובייקט לפי hash
git cat-file -p a1b2c3d

# בדיקת סוג האובייקט
git cat-file -t a1b2c3d

# הצגת ה-tree של commit
git cat-file -p HEAD^{tree}
```

## מה זה HEAD בפועל?

`HEAD` הוא מצביע סמלי – בדרך כלל מצביע ל-branch הנוכחי, שבתורו מצביע ל-commit האחרון:

```
HEAD -> refs/heads/main -> a1b2c3d (commit)
```

```bash
cat .git/HEAD
# ref: refs/heads/main
```

### Detached HEAD

כאשר עושים `checkout` ישירות לcommit (לא ל-branch), `HEAD` מצביע ישירות לcommit, לא דרך branch:

```bash
git checkout a1b2c3d
# You are in 'detached HEAD' state...
```

```
במצב רגיל:     HEAD -> main -> a1b2c3d
ב-Detached HEAD: HEAD -> a1b2c3d   (ישירות!)
```

⚠️ **סכנה**: אם תעשה commits חדשים במצב detached HEAD ואז תעבור ל-branch אחר בלי ליצור branch חדש, ה-commits האלו עלולים "ללכת לאיבוד" (עד שינוקו ב-garbage collection).

**פתרון**: אם אתה ב-detached HEAD ורוצה לשמור על עבודה:
```bash
git switch -c new-branch-name
```

## Garbage Collection – ניקוי אובייקטים "יתומים"

```bash
git gc                # ניקוי ואופטימיזציה של .git
git gc --aggressive    # ניקוי אגרסיבי יותר, איטי יותר
git prune              # מחיקת אובייקטים לא-מקושרים בלבד
```

Git שומר commits "יתומים" (unreachable) למשך זמן מה (ברירת מחדל ~30-90 יום) לפני שהוא מוחק אותם לצמיתות – זו הסיבה ש-`reflog` יכול להציל אותך גם אחרי `reset --hard`.

## Packfiles – דחיסת אחסון

כשיש הרבה loose objects, Git דוחס אותם ל-**packfile** יחיד – שומר רק deltas (הפרשים) בין אובייקטים דומים, במקום להעתיק כל גרסה במלואה. זו הסיבה ש-`.git` נשאר קטן יחסית גם בפרויקט עם היסטוריה ענקית.

## טיפים וטריקים

1. **הבנת אובייקטים = הבנת Git עצמו** – ברגע שמבינים ש-commit הוא בעצם "מצביע לtree + הורה", כל הפקודות (reset, rebase, merge) הופכות אינטואיטיביות במקום "קסם".
2. **`git cat-file -p`** – כלי מצוין ללמידה, אפשר "לחקור" כל commit/tree/blob בפועל.
3. **הימנע מ-Detached HEAD בטעות** – אם עוברים ל-tag או commit ישן ל"הצצה", זכרו לצאת עם `git switch <branch>` בסיום, ולא לעשות שם commits.
4. **`git count-objects -v`** – בדיקת גודל ומספר אובייקטים ב-repository, שימושי לניטור repos גדולים.

## שאלות ראיון עבודה נפוצות

**ש: מהם ארבעת סוגי האובייקטים הבסיסיים ב-Git?**
ת: Blob (תוכן קובץ), Tree (מבנה תיקייה – רשימת blobs/trees), Commit (מצביע ל-tree + הורה + metadata), ו-Tag (annotated tag – מצביע לcommit עם metadata נוסף).

**ש: מה זה Detached HEAD state ולמה הוא מסוכן?**
ת: מצב שבו `HEAD` מצביע ישירות לcommit במקום דרך branch. מסוכן כי אם עושים commits חדשים במצב הזה ואז עוברים ל-branch אחר, ה-commits עלולים "ללכת לאיבוד" – הם לא מקושרים לאף branch, ורק reflog (לזמן מוגבל) יכול לשחזר אותם.

**ש: איך Git משיג יעילות אחסון כל כך גבוהה, גם בפרויקטים עם היסטוריה ענקית?**
ת: דרך שילוב של content-addressable storage (תוכן זהה = hash זהה = אחסון פעם אחת בלבד), ו-packfiles שדוחסים אובייקטים דומים באמצעות deltas (הפרשים) במקום העתקות מלאות.

**ש: מה ההבדל בין Blob ל-Tree ב-Git?**
ת: Blob מכיל רק את התוכן הגולמי של קובץ (בייטים), ללא שם או metadata. Tree הוא כמו "תיקייה" – מבנה שממפה שמות קבצים והרשאות ל-blobs (או trees מקוננים לתת-תיקיות).

**ש: מה קורה בפועל כשעושים `git commit`?**
ת: Git יוצר אובייקט tree חדש שמייצג את מצב ה-staging area, ואז אובייקט commit חדש שמצביע לאותו tree ולcommit ההורה (הcommit הנוכחי לפני השינוי), ולבסוף מזיז את מצביע ה-branch הנוכחי (למשל `main`) לcommit החדש.

**ש: איך `git gc` ו-reflog קשורים זה לזה?**
ת: `reflog` שומר תיעוד של תזוזות HEAD, כולל לcommits ש"אבדו" (unreachable). `git gc` (garbage collection) הוא מה שבסופו של דבר מוחק לצמיתות אובייקטים unreachable, אבל רק אחרי פרק זמן ברירת מחדל (בדרך כלל 30-90 יום) – זו הסיבה שיש חלון זמן לשחזר "טעויות" באמצעות reflog לפני שהן נמחקות באמת.

## קישורים חיצוניים

**YouTube:**
- [Git Internals - How Git Really Works](https://www.youtube.com/results?search_query=git+internals+how+git+really+works)
- [Understanding Git Objects (Blob, Tree, Commit)](https://www.youtube.com/results?search_query=git+objects+blob+tree+commit+explained)

**דוקומנטציה:**
- [Pro Git Book – Git Internals](https://git-scm.com/book/en/v2/Git-Internals-Plumbing-and-Porcelain)
- [Pro Git Book – Git Objects](https://git-scm.com/book/en/v2/Git-Internals-Git-Objects)
- [Git Docs – git gc](https://git-scm.com/docs/git-gc)
