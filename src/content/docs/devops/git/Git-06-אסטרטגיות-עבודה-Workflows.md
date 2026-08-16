---
title: "אסטרטגיות עבודה - Git Workflows"
category: DevOps/Git
part: 6/10
---

## למה צריך אסטרטגיה מוגדרת?

ללא כללים ברורים על איך משתמשים ב-branches, צוות גדול ייתקל ב-merge hell, קונפליקטים תכופים, ובלבול לגבי מה בדיוק רץ בפרודקשן. אסטרטגיית branching היא הסכם צוותי על "איך אנחנו עובדים עם Git".

## 1. Centralized Workflow

הפשוט ביותר – כולם עובדים ישירות על `main`, בלי branches. מתאים רק לצוותים זעירים מאוד או פרויקטים פשוטים.

```bash
git pull
# ... עבודה ...
git add . && git commit -m "..."
git pull --rebase   # וידוא שאין קונפליקט לפני push
git push
```

## 2. Feature Branch Workflow

כל פיצ'ר מפותח ב-branch נפרד, ומוזג ל-`main` דרך Pull Request. זה הבסיס לרוב האסטרטגיות המודרניות.

```
main ──●────●────●────●
        \  /  \  /
     feature-1  feature-2
```

## 3. Git Flow

מודל מובנה עם ענפים ייעודיים, טוב לפרויקטים עם מחזורי release מתוזמנים (לא deployment רציף):

| Branch | תפקיד |
|---|---|
| `main` | קוד production בלבד, כל commit = release |
| `develop` | ענף אינטגרציה, "next release" |
| `feature/*` | פיצ'רים חדשים, נשלפים מ-`develop` וחוזרים אליו |
| `release/*` | הכנת release (bug fixes אחרונים, לא פיצ'רים חדשים) |
| `hotfix/*` | תיקון דחוף ל-production, נשלף מ-`main` |

```bash
# feature
git switch develop
git switch -c feature/payment-integration
# ... עבודה ...
git switch develop
git merge --no-ff feature/payment-integration

# release
git switch -c release/1.2.0 develop
# ... bug fixes אחרונים ...
git switch main
git merge --no-ff release/1.2.0
git tag -a v1.2.0

git switch develop
git merge --no-ff release/1.2.0

# hotfix
git switch -c hotfix/1.2.1 main
# ... תיקון ...
git switch main
git merge --no-ff hotfix/1.2.1
git tag -a v1.2.1
git switch develop
git merge --no-ff hotfix/1.2.1
```

**חסרונות Git Flow**: מורכב, לא מתאים לCI/CD עם deployment תכוף (כמה פעמים ביום), overhead ניהולי גבוה.

## 4. GitHub Flow (פשוט, מתאים ל-CI/CD)

- ענף `main` תמיד ניתן לפריסה.
- כל שינוי ב-feature branch קצר חיים.
- Pull Request -> CI -> Review -> Merge -> Deploy מיידי.

```
main ──●──────●──────●──────●   (כל merge = deploy)
        \    /  \    /
         feature-1  feature-2
```

זהו המודל הפופולרי ביותר כיום עבור שירותי web ו-SaaS עם CI/CD מלא.

## 5. Trunk-Based Development

הגישה ה"קיצונית" ביותר – מפתחים דוחפים ישירות (או branches קצרי חיים של שעות בודדות) ל-`trunk`/`main`. מסתמכים על **Feature Flags** כדי להסתיר פיצ'רים לא-גמורים.

```javascript
if (featureFlags.isEnabled('new-checkout-flow')) {
  return <NewCheckout />;
} else {
  return <OldCheckout />;
}
```

זהו הבסיס למודלים של Continuous Deployment אמיתי (כמו בגוגל, פייסבוק), אך דורש תרבות הנדסית חזקה: בדיקות אוטומטיות מקיפות, code review מהיר, ומשמעת גבוהה.

## טבלת השוואה

| Workflow | מורכבות | מתאים ל-CI/CD תכוף? | מתאים ל-releases מתוזמנים? |
|---|---|---|---|
| Centralized | נמוכה | לא | לא |
| Feature Branch | בינונית | כן | כן |
| Git Flow | גבוהה | לא | כן, מצוין |
| GitHub Flow | נמוכה-בינונית | כן, מצוין | לא |
| Trunk-Based | בינונית (אך דורש משמעת) | כן, הטוב ביותר | לא |

## טיפים וטריקים

1. **בחר לפי קצב הפריסה, לא לפי "מה כולם עושים"** – אם אתם פורסים כמה פעמים ביום, Git Flow יעיק עליכם מיותר.
2. **Feature Flags הם לא רק לTrunk-Based** – שימושיים בכל אסטרטגיה כדי להפריד Deploy מ-Release.
3. **קצר את חיי ה-branches** – ככל שbranch חי יותר זמן, כך גדל הסיכוי לקונפליקטים ענקיים.
4. **תעד את האסטרטגיה בקובץ CONTRIBUTING.md** – כדי שכל חבר צוות/תורם חדש ידע בדיוק איך לעבוד.
5. **התאם branch protection rules לאסטרטגיה** – ל-GitHub Flow: הגן על `main`. ל-Git Flow: הגן גם על `develop` וגם על `main`.

## שאלות ראיון עבודה נפוצות

**ש: מה ההבדל בין Git Flow ל-GitHub Flow, ומתי תבחר בכל אחד?**
ת: Git Flow משתמש בענפים ייעודיים מרובים (`develop`, `release/*`, `hotfix/*`) ומתאים לפרויקטים עם releases מתוזמנים וגרסאות מרובות (כמו תוכנת desktop/mobile). GitHub Flow פשוט הרבה יותר – רק `main` ו-feature branches קצרי חיים – ומתאים לשירותי web/SaaS עם deployment תכוף.

**ש: מה זה Trunk-Based Development ומה הדרישות התרבותיות שלו?**
ת: מודל שבו מפתחים עובדים ישירות (או branches קצרי חיים של שעות) על ה-`main`/`trunk`, תוך שימוש נרחב ב-Feature Flags להסתרת פיצ'רים לא-גמורים. דורש בדיקות אוטומטיות חזקות מאוד, code review מהיר, ומשמעת צוותית גבוהה – כי אין "בידוד" ארוך-טווח בין שינויים.

**ש: למה Git Flow לא מתאים לצוותים עם CI/CD ו-deployment תכוף?**
ת: Git Flow דורש שלבים ידניים רבים (release branches, מיזוגים כפולים ל-main ול-develop) שמאטים את קצב השחרור. הוא נבנה עבור מודל של releases מתוזמנים, לא deployment רציף כמה פעמים ביום.

**ש: מה זה Feature Flag וכיצד הוא קשור לבחירת אסטרטגיית Branching?**
ת: מנגנון שמאפשר להדליק/לכבות פיצ'ר בזמן ריצה, ללא deploy נוסף. הוא מפריד את המושג "Deploy" (הקוד הגיע לפרודקשן) מ-"Release" (המשתמשים רואים את הפיצ'ר) – זה מה שמאפשר למזג קוד לא-גמור מוקדם ל-main בבטחה, ובכך מאפשר אסטרטגיות כמו Trunk-Based.

**ש: מהם הסיכונים של branches ארוכי חיים?**
ת: ככל שbranch רחוק יותר מ-`main`, כך גדל הסיכוי לקונפליקטי מיזוג מסובכים, לכפילות עבודה בין מפתחים שונים, ולבאגי אינטגרציה שמתגלים רק בסוף – מנוגד לעיקרון הבסיסי של Continuous Integration.

**ש: אילו branch protection rules היית מגדיר בפרויקט שעובד לפי GitHub Flow?**
ת: חסימת push ישיר ל-`main`, דרישת לפחות אישור review אחד, דרישה ש-status checks (CI) יעברו לפני מיזוג, ואולי גם Required linear history למניעת merge commits מיותרים.

## קישורים חיצוניים

**YouTube:**
- [Git Workflows Explained (Git Flow vs GitHub Flow vs Trunk-Based)](https://www.youtube.com/results?search_query=git+flow+vs+github+flow+vs+trunk+based+development)
- [Trunk Based Development Explained](https://www.youtube.com/results?search_query=trunk+based+development+explained)

**דוקומנטציה:**
- [Atlassian – Comparing Git Workflows](https://www.atlassian.com/git/tutorials/comparing-workflows)
- [GitHub Flow Official Guide](https://docs.github.com/en/get-started/using-github/github-flow)
- [Trunk Based Development](https://trunkbaseddevelopment.com/)
- [nvie – A Successful Git Branching Model (Git Flow המקורי)](https://nvie.com/posts/a-successful-git-branching-model/)
