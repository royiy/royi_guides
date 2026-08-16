---
title: "אבטחה, חתימה דיגיטאלית ו-Best Practices"
category: DevOps/Git
part: 10/10
---

## חתימת Commits ו-Tags עם GPG/SSH

חתימה דיגיטלית מוכיחה שcommit/tag נוצר באמת על ידך, ולא זויף בשמך (מישהו יכול להגדיר `user.name`/`user.email` לכל דבר, אבל לא לזייף חתימה קריפטוגרפית).

```bash
# יצירת מפתח GPG (אם אין)
gpg --full-generate-key

# הגדרת Git להשתמש במפתח
git config --global user.signingkey <KEY_ID>
git config --global commit.gpgsign true

# חתימת commit בודד (אם לא הגדרת אוטומטי)
git commit -S -m "Signed commit"

# חתימת tag
git tag -s v1.0.0 -m "Signed release"

# אימות חתימה
git log --show-signature
git verify-commit <hash>
```

### חתימה עם SSH Key (חלופה מודרנית וקלה יותר מ-GPG)

```bash
git config --global gpg.format ssh
git config --global user.signingkey ~/.ssh/id_ed25519.pub
git config --global commit.gpgsign true
```

ב-GitHub, commits חתומים מוצגים עם תג **"Verified"** ירוק – שכבת אמון נוספת בסקירת קוד.

## מניעת דליפת Secrets

### Secret Scanning אוטומטי

```bash
# gitleaks - סריקת repository שלם להיסטוריה
gitleaks detect --source . --verbose

# סריקה רק על שינויים לפני commit (כ-pre-commit hook)
gitleaks protect --staged
```

### מה לעשות אם סוד כבר דלף להיסטוריה

1. **החלף (rotate) את הסוד מיידית** – זה הצעד הכי חשוב, גם אם תנקה את ההיסטוריה. ברגע שסוד נדחף, יש להתייחס אליו כ"נחשף" גם אם תמחק אותו מההיסטוריה מיד אחר כך.
2. נקה את ההיסטוריה עם `git filter-repo` או BFG Repo-Cleaner.
3. `push --force` מתואם עם כל הצוות.

```bash
# BFG Repo-Cleaner - מהיר יותר מ-filter-repo למקרים פשוטים
bfg --delete-files secret-config.json
bfg --replace-text passwords.txt
```

## SSH מול HTTPS ל-Remote

```bash
# HTTPS - דורש טוקן/סיסמה בכל push (או credential caching)
git remote set-url origin https://github.com/user/repo.git

# SSH - דורש הגדרת מפתח פעם אחת, לרוב נוח יותר לשימוש יומיומי
git remote set-url origin git@github.com:user/repo.git
```

```bash
# יצירת מפתח SSH חדש
ssh-keygen -t ed25519 -C "email@example.com"
# הוספת המפתח הציבורי ל-GitHub/GitLab דרך ה-UI
cat ~/.ssh/id_ed25519.pub
```

## Personal Access Tokens (PAT) – במקום סיסמה

GitHub (וכלים דומים) לא מקבלים יותר סיסמה רגילה ל-Git operations דרך HTTPS – יש ליצור Token ייעודי עם הרשאות מוגבלות (scopes):

```bash
git remote set-url origin https://<TOKEN>@github.com/user/repo.git
```

⚠️ עדיף להשתמש ב-Credential Manager (`git config --global credential.helper store/cache`) במקום להטמיע את הטוקן ישירות ב-URL, כדי שלא יישמר בהיסטוריית shell.

## Two-Factor Authentication (2FA) ו-CI/CD

כשמריצים Git operations מתוך pipeline (CI/CD), משתמשים ב-**Deploy Keys** (מפתח SSH ייעודי לrepository בודד, read-only או read-write) או ב-Machine User / Bot Account עם PAT מוגבל scope – לעולם לא בחשבון האישי של מפתח.

## `.gitattributes` – שליטה נוספת על התנהגות Git

```gitattributes
# נורמליזציה של line endings (חשוב בצוותים עם Windows+Mac/Linux)
* text=auto eol=lf

# קבצים בינאריים - אל תנסה diff/merge טקסטואלי
*.png binary
*.jpg binary

# שימוש ב-Git LFS
*.psd filter=lfs diff=lfs merge=lfs -text
```

## Git LFS – קבצים גדולים

```bash
git lfs install
git lfs track "*.psd"
git add .gitattributes
git add design.psd
git commit -m "Add design file via LFS"
```

Git LFS שומר רק "pointer" קטן ב-history הרגילה של Git, בעוד התוכן בפועל נשמר בשרת LFS נפרד – מונע נפיחות אדירה של ה-repository עם קבצים בינאריים גדולים (תמונות, וידאו, קבצי עיצוב).

## Best Practices מסכמים

1. **לעולם לא לשמור secrets בקוד** – השתמש ב-`.env` + `.gitignore`, או Secret Manager ייעודי.
2. **חתום commits חשובים** – במיוחד tags של releases רשמיים.
3. **Rotate secrets מיד אם דלפו** – מחיקה מהיסטוריה לבדה לא מספיקה.
4. **Deploy Keys/Machine Users ל-CI**, לא חשבונות אישיים.
5. **`.gitattributes` לנורמליזציית line endings** – מונע "diff שקרי" ענק כשמפתח Windows שומר קובץ ששונה רק ב-line endings.
6. **Git LFS לקבצים בינאריים גדולים** – שומר את ה-repository קל ומהיר.
7. **Branch Protection + Required Signed Commits** – ניתן לאכוף ב-GitHub/GitLab שרק commits חתומים יתקבלו ל-branch מסוים.

## שאלות ראיון עבודה נפוצות

**ש: למה חשוב לחתום commits עם GPG/SSH, ומה זה בעצם מוכיח?**
ת: חתימה דיגיטלית מוכיחה שהcommit נוצר על ידי מי שמחזיק את המפתח הפרטי המתאים, ולא רק שדה `user.name`/`email` שכל אחד יכול להגדיר לכל דבר. זה מוסיף שכבת אמון ואי-הכחשה (non-repudiation), חשוב במיוחד לreleases רשמיים.

**ש: אם סוד (API key) נדחף בטעות ל-Git, מספיק למחוק אותו מההיסטוריה?**
ת: לא מספיק. ברגע שסוד נדחף לrepository (במיוחד אם ציבורי, או אפילו פרטי עם גישה רחבה), יש להתייחס אליו כנחשף – יש **לרוטט (rotate) את הסוד מיידית**. מחיקה מההיסטוריה חשובה כניקיון נוסף, אבל לא פתרון עצמאי מספיק כי הסוד כבר עשוי היה להיחשף/להישמר ב-caches שונים.

**ש: מה ההבדל בין SSH ל-HTTPS כשיטות אימות מול Git remote?**
ת: SSH משתמש בזוג מפתחות (פרטי/ציבורי) שמוגדר פעם אחת ומאפשר push/pull ללא הזנת credentials חוזרת. HTTPS דורש Personal Access Token (לא סיסמה רגילה יותר) בכל אימות, אלא אם משתמשים ב-credential helper לשמירתו.

**ש: מה זה Deploy Key ולמה עדיף להשתמש בו ב-CI/CD במקום בחשבון אישי?**
ת: מפתח SSH ייעודי המשויך לrepository בודד (לא לחשבון משתמש), עם הרשאות מוגבלות (לרוב read-only, לפעמים read-write). עדיף על שימוש בחשבון אישי כי הוא ניתן לביטול נקודתי, לא חושף גישה לכל שאר ה-repositories של המפתח, ועוקב אחר עקרון ה-Least Privilege.

**ש: מה זה Git LFS ואיזו בעיה הוא פותר?**
ת: Large File Storage – מנגנון שמחליף קבצים בינאריים גדולים (תמונות, וידאו) ב"pointer" טקסטואלי קטן בהיסטוריית Git הרגילה, בעוד התוכן האמיתי נשמר בשרת LFS נפרד. פותר את בעיית הנפיחות העצומה של ה-`.git` repository כשעובדים עם קבצים בינאריים גדולים לאורך זמן.

**ש: מה ה"Verified" badge שרואים ב-GitHub ליד commits מסוימים?**
ת: סימון שמראה ש-GitHub אימת בהצלחה את החתימה הדיגיטלית (GPG או SSH) של הcommit מול מפתח ציבורי שהמשתמש רשם בפרופיל שלו – מוכיח שהcommit אכן נוצר על ידי בעל המפתח, לא רק "טוען" להיות מישהו דרך שם/אימייל.

## קישורים חיצוניים

**YouTube:**
- [Signing Git Commits with GPG](https://www.youtube.com/results?search_query=signing+git+commits+with+gpg+tutorial)
- [Git Security Best Practices](https://www.youtube.com/results?search_query=git+security+best+practices)
- [Git LFS Tutorial](https://www.youtube.com/results?search_query=git+lfs+tutorial)

**דוקומנטציה:**
- [GitHub Docs – Signing Commits](https://docs.github.com/en/authentication/managing-commit-signature-verification/signing-commits)
- [Git LFS Official Site](https://git-lfs.com/)
- [GitHub Docs – Managing Deploy Keys](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/managing-deploy-keys)
- [Gitleaks (Secret Scanning)](https://github.com/gitleaks/gitleaks)
- [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/)
