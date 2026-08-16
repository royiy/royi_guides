---
title: "Git Hooks ואוטומציה"
category: DevOps/Git
part: 8/10
---

## מה זה Git Hook?

סקריפט שרץ אוטומטית בתגובה לאירוע מסוים ב-Git (לפני commit, אחרי commit, לפני push וכו'). נשמרים בתיקיית `.git/hooks/` (לוקאלית בלבד, לא נשלחת עם `git push` כברירת מחדל).

## Hooks נפוצים

| Hook | מתי רץ | שימוש טיפוסי |
|---|---|---|
| `pre-commit` | לפני יצירת commit | Lint, פורמט קוד, בדיקת סודות |
| `commit-msg` | אחרי כתיבת הודעה, לפני commit סופי | אכיפת פורמט הודעות (Conventional Commits) |
| `pre-push` | לפני push לרימוט | הרצת בדיקות לפני שליחה |
| `post-checkout` | אחרי מעבר branch | התקנת תלויות אוטומטית אם package.json השתנה |
| `post-merge` | אחרי merge | עדכון תלויות אוטומטי |

## דוגמת `pre-commit` Hook פשוט (Bash)

```bash
#!/bin/sh
# .git/hooks/pre-commit

echo "Running lint before commit..."
npm run lint

if [ $? -ne 0 ]; then
  echo "❌ Lint failed. Commit aborted."
  exit 1
fi

echo "✅ Lint passed."
exit 0
```

```bash
chmod +x .git/hooks/pre-commit
```

## הבעיה: Hooks לא משותפים דרך Git

מכיוון ש-`.git/hooks/` לא נכנס ל-repository (לא נעקב ע"י Git), כל מפתח צריך להתקין ידנית. לכן נעשה שימוש בכלים ייעודיים לניהול hooks בצורה משותפת ואוטומטית.

## Husky – ניהול Git Hooks ב-JavaScript/Node

```bash
npm install --save-dev husky
npx husky init
```

```bash
# .husky/pre-commit
npx lint-staged
```

```json
// package.json
{
  "lint-staged": {
    "*.js": ["eslint --fix", "prettier --write"],
    "*.md": ["prettier --write"]
  }
}
```

**היתרון**: Husky שומר את ה-hooks בתוך `.husky/` שכן נכנס ל-Git, כך שכל מי שעושה `npm install` מקבל אותם אוטומטית.

## Commitlint – אכיפת פורמט הודעות Commit

```bash
npm install --save-dev @commitlint/cli @commitlint/config-conventional
```

```javascript
// commitlint.config.js
module.exports = { extends: ['@commitlint/config-conventional'] };
```

```bash
# .husky/commit-msg
npx --no -- commitlint --edit $1
```

זה אוכף פורמט כמו `feat: add login page` או `fix: resolve null pointer` (Conventional Commits), מה שמאפשר יצירת CHANGELOG ו-Semantic Versioning אוטומטיים.

## Pre-commit Framework (Python, אבל שפה-אגנוסטי)

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.5.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
  - repo: https://github.com/psf/black
    rev: 24.1.0
    hooks:
      - id: black
```

```bash
pip install pre-commit
pre-commit install
```

## Server-Side Hooks (בשרת Git, לא בלקוח)

בניגוד ל-client-side hooks (שכל מפתח יכול לעקוף עם `--no-verify`), **server-side hooks** רצים בשרת עצמו ואי אפשר לעקוף אותם:

| Hook | מתי |
|---|---|
| `pre-receive` | לפני קבלת push, יכול לדחות אותו לגמרי |
| `update` | לכל branch שמתעדכן בנפרד |
| `post-receive` | אחרי push הושלם - טריגר ל-CI/CD, notifications |

GitHub/GitLab מציעים אלטרנטיבה מודרנית ונוחה יותר: **Webhooks** ו-**Branch Protection Rules** ברמת השרת, שמשיגות אפקט דומה בלי לנהל שרת Git עצמאי.

## דילוג על Hooks (במקרי חירום)

```bash
git commit --no-verify -m "emergency fix"
git push --no-verify
```

⚠️ שימוש זהיר בלבד – hooks קיימים מסיבה, ודילוג עליהם באופן קבוע מבטל את התועלת שלהם.

## טיפים וטריקים

1. **Husky + lint-staged** – הקומבינציה הסטנדרטית בעולם ה-JavaScript/TypeScript, מריצה lint/format רק על קבצים ששונו (מהיר בהרבה מסריקת כל הפרויקט).
2. **Client-side hooks הם קו הגנה ראשון, לא היחיד** – תמיד יש גם CI שרץ את אותן בדיקות בשרת, כי hooks מקומיים ניתנים לעקיפה.
3. **Commit Message Linting** – אכיפת Conventional Commits מאפשרת אוטומציה מלאה של CHANGELOG וגרסאות (semantic-release).
4. **בדיקת סודות ב-pre-commit** – שילוב `gitleaks` או `detect-secrets` כ-pre-commit hook תופס API keys/passwords **לפני** שהם בכלל מגיעים להיסטוריית Git.
5. **hooks מהירים בלבד ב-pre-commit** – בדיקות איטיות (E2E, integration) שייכות ל-CI, לא ל-pre-commit שרץ בכל commit מקומי.

## שאלות ראיון עבודה נפוצות

**ש: מה ההבדל בין Client-Side Hooks ל-Server-Side Hooks?**
ת: Client-side hooks (כמו `pre-commit`, `pre-push`) רצים על המחשב של המפתח וניתנים לעקיפה בקלות (`--no-verify`). Server-side hooks (כמו `pre-receive`) רצים על שרת ה-Git עצמו ולא ניתן לעקוף אותם – אכיפה אמיתית וחזקה יותר, אך דורשת ניהול שרת.

**ש: למה Git Hooks לא "נשלחים" אוטומטית עם `git clone`?**
ת: כי `.git/hooks/` נמצא בתוך תיקיית המטא-דאטה של Git עצמה, ולא חלק מהworking tree שנעקב ע"י Git. לכן כלים כמו Husky פותרים את זה על ידי שמירת ה-hooks בתיקייה נעקבת (`.husky/`) והתקנתם אוטומטית דרך script ב-`package.json` שרץ ב-`npm install`.

**ש: מהו Conventional Commits ואיך Git Hooks עוזרים לאכוף אותו?**
ת: תקן לכתיבת הודעות commit בפורמט מובנה (`feat:`, `fix:`, `chore:`) שמאפשר יצירה אוטומטית של CHANGELOG וקביעת גרסת SemVer הבאה. `commit-msg` hook (בעזרת commitlint) בודק שההודעה עומדת בפורמט, ודוחה את הcommit אם לא.

**ש: מה ההבדל בין `pre-commit` ל-`pre-push` hooks, ומתי תשתמש בכל אחד?**
ת: `pre-commit` רץ על כל commit בודד – מיועד לבדיקות מהירות מאוד (lint, format) כדי לא להאט את זרימת העבודה. `pre-push` רץ רק לפני שליחה לרימוט – מקום טוב יותר לבדיקות איטיות יותר (unit tests מלאים), כי push קורה בתדירות נמוכה יותר מ-commit.

**ש: איך אפשר להשתמש ב-Git Hook כדי למנוע דליפת secrets לrepository?**
ת: שילוב כלי כמו `gitleaks` או `detect-secrets` כ-`pre-commit` hook שסורק את השינויים המוסטגים לדפוסים של API keys/tokens/passwords, ודוחה את ה-commit אם נמצא משהו חשוד – לפני שהסוד בכלל נכנס להיסטוריית Git.

**ש: מהם החסרונות של הסתמכות בלעדית על client-side hooks לאכיפת סטנדרטים?**
ת: הם ניתנים לעקיפה בקלות (`git commit --no-verify`) על ידי כל מפתח, וגם לא כל מפתח מתקין אותם נכון. לכן תמיד צריך גם שכבת אכיפה בשרת – CI checks חובה ו-branch protection rules – כרשת ביטחון אמיתית.

## קישורים חיצוניים

**YouTube:**
- [Git Hooks Tutorial](https://www.youtube.com/results?search_query=git+hooks+tutorial+explained)
- [Husky + lint-staged Setup Tutorial](https://www.youtube.com/results?search_query=husky+lint-staged+setup+tutorial)

**דוקומנטציה:**
- [Pro Git Book – Git Hooks](https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks)
- [Husky Documentation](https://typicode.github.io/husky/)
- [Commitlint Documentation](https://commitlint.js.org/)
- [pre-commit Framework Docs](https://pre-commit.com/)
