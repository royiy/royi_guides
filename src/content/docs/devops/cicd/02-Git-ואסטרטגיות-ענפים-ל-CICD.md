---
title: "Git ואסטרטגיות ענפים כבסיס ל-CI/CD"
category: DevOps/CI-CD
part: 2/10
---

## למה Git הוא הבסיס של כל CI/CD?

כל pipeline מתחיל באירוע Git – push, pull request, tag, merge. הבנה טובה של אסטרטגיית הענפים (branching strategy) קריטית כדי לעצב pipeline יעיל ובטוח.

## אסטרטגיות ענפים נפוצות

### 1. GitHub Flow (הפשוטה ביותר)
- ענף `main` תמיד ניתן לפריסה (deployable).
- כל פיצ'ר/תיקון נעשה ב-branch נפרד (`feature/xyz`).
- Pull Request -> Code Review -> CI עובר -> Merge ל-`main` -> פריסה אוטומטית.

```
main ──●──────●──────●──────●
        \    /  \    /
         feature-1  feature-2
```

### 2. Git Flow (מורכב יותר, לרוב לפרויקטים עם releases מתוזמנים)
- ענפים: `main`, `develop`, `feature/*`, `release/*`, `hotfix/*`.
- מתאים לתוכנה עם גרסאות (versioned releases) ולא לשירותי web שמפורסים ברצף.

### 3. Trunk-Based Development
- כולם עובדים ישירות (או עם branches קצרי חיים של שעות) על `main`/`trunk`.
- Feature Flags משמשים כדי להסתיר פיצ'רים לא גמורים בפרודקשן.
- זהו הבסיס למודל של **Continuous Deployment** אמיתי בחברות כמו Google ו-Facebook.

## איך אסטרטגיית הענפים משפיעה על ה-Pipeline

```yaml
# דוגמה: הפעלת שלבים שונים בהתאם לענף
on:
  push:
    branches:
      - main          # -> deploy to production
      - 'release/**'  # -> deploy to staging
  pull_request:
    branches: [main]  # -> רק build + test, ללא deploy
```

## Trigger Types נפוצים

| Trigger | מתי מופעל |
|---|---|
| `push` | כל push לענף מסוים |
| `pull_request` | פתיחה/עדכון של PR |
| `tag` | יצירת git tag (למשל `v1.2.0`) – מפעיל לרוב release pipeline |
| `schedule` (cron) | הרצה מתוזמנת (nightly builds) |
| `workflow_dispatch` / `manual` | הפעלה ידנית על ידי משתמש |

## דוגמה מלאה – Tag-based Release

```yaml
name: Release
on:
  push:
    tags:
      - 'v*.*.*'

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build artifact
        run: ./build.sh
      - name: Create GitHub Release
        uses: softprops/action-gh-release@v2
        with:
          files: dist/*.tar.gz
```

## טיפים וטריקים

1. **Semantic Versioning (SemVer)** – השתמש בתגיות `MAJOR.MINOR.PATCH` (למשל `v2.3.1`) כדי לתקשר את סוג השינוי.
2. **Conventional Commits** – פורמט commit אחיד (`feat:`, `fix:`, `chore:`) מאפשר יצירת CHANGELOG אוטומטי וגם קביעה אוטומטית של גרסת ה-SemVer הבאה.
3. **Protected Branches** – חסום push ישיר ל-`main`; חייב PR + לפחות אישור אחד + CI ירוק.
4. **Squash Merge** – שמור היסטוריית git נקייה על ידי squash של commits בזמן מיזוג PR.
5. **Feature Flags** – במקום ענפי feature ארוכי חיים, מזג מוקדם ל-`main` מאחורי flag כבוי.

## שאלות ראיון עבודה נפוצות

**ש: מה ההבדל בין Git Flow ל-Trunk-Based Development, ומתי תבחר בכל אחד?**
ת: Git Flow מתאים למוצרים עם מחזורי release מתוכננים וגרסאות מרובות בו-זמנית (למשל תוכנת desktop). Trunk-Based מתאים לשירותי web/SaaS עם פריסה תכופה, ודורש משמעת גבוהה + feature flags.

**ש: מה זה Feature Flag וכיצד הוא קשור ל-CI/CD?**
ת: מנגנון שמאפשר להדליק/לכבות פיצ'ר בזמן ריצה בלי לפרוס קוד חדש. זה מאפשר למזג קוד לא גמור ל-`main` בבטחה ולנתק בין "Deploy" ל-"Release".

**ש: איך היית מגדיר Pipeline שרץ אחרת ב-PR לעומת merge ל-main?**
ת: על ידי הגדרת triggers שונים (`pull_request` מול `push` ל-`main`) עם jobs שונים – ב-PR רק build+test, ב-merge ל-main גם deploy.

**ש: מה הבעיה עם ענפי feature ארוכי חיים מבחינת CI/CD?**
ת: הם מצטברים ל"merge hell" – ככל שענף רחוק יותר מ-main, כך גדל הסיכוי לקונפליקטים ולכשלי אינטגרציה. זה מנוגד לעיקרון של אינטגרציה תכופה.

**ש: איך תבטיח שאף אחד לא יעקוף את ה-CI ויעשה push ישיר ל-production branch?**
ת: Branch protection rules ב-Git host (חסימת push ישיר, דרישת PR + status checks ירוקים + code owners review).

## קישורים חיצוניים

**YouTube:**
- [Git Branching Strategies Explained](https://www.youtube.com/results?search_query=git+branching+strategies+explained)
- [TechWorld with Nana – Git & GitHub](https://www.youtube.com/c/TechWorldwithNana)

**דוקומנטציה:**
- [GitHub Flow Docs](https://docs.github.com/en/get-started/using-github/github-flow)
- [Atlassian – Git Branching Strategies](https://www.atlassian.com/git/tutorials/comparing-workflows)
- [Trunk Based Development](https://trunkbaseddevelopment.com/)
- [Conventional Commits](https://www.conventionalcommits.org/)
