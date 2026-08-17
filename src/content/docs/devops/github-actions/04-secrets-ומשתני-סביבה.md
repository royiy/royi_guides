---
title: "ניהול Secrets ומשתני סביבה (Variables)"
category: DevOps/GitHub Actions
part: 4/10
---

## Secrets מול Variables - מה ההבדל

| | Secrets | Variables |
|---|---|---|
| **מטרה** | ערכים רגישים - סיסמאות, API keys, טוקנים | ערכים לא רגישים - שמות סביבה, URLs, דגלי feature |
| **הצפנה** | מוצפנים תמיד, לא נראים בלוגים (מוחלפים ב-`***`) | לא מוצפנים, נשמרים כטקסט רגיל |
| **גישה בקוד** | `${{ secrets.NAME }}` | `${{ vars.NAME }}` |
| **חשיפה מ-fork** | לא זמינים ב-PR שמגיע מ-fork (למעט GITHUB_TOKEN) | זמינים גם מ-fork |

הכלל הבסיסי: **כל דבר שאתם לא רוצים שמישהו יראה בלוג או בקוד המקור - זה secret. כל דבר אחר שהוא קונפיגורציה - זה variable.**

## שלוש רמות: Repository, Environment, Organization

Secrets ו-Variables ניתן להגדיר בשלוש רמות, מהצרה לרחבה:

1. **Repository level** - זמין רק לריפו הספציפי.
2. **Environment level** - זמין רק כש-job מריץ עם `environment:` מוגדר, ויכול לדרוש אישורים ידניים.
3. **Organization level** - זמין לכל הריפוזיטוריז בארגון (או לרשימה מוגדרת), נוח לניהול ריכוזי.

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production   # מפעיל את ה-secrets/variables ברמת ה-Environment "production"
    steps:
      - name: פריסה עם טוקן ייעודי לסביבה
        run: ./deploy.sh
        env:
          DEPLOY_TOKEN: ${{ secrets.DEPLOY_TOKEN }}
```

הגדרה בממשק: Settings → Secrets and variables → Actions, ושם ניתן לבחור Repository secrets, Environment secrets, או (ברמת הארגון) Organization secrets.

## יצירה ושימוש ב-Secrets

לאחר יצירת secret בשם `DOCKER_PASSWORD` בממשק GitHub:

```yaml
jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: התחברות ל-Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ vars.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: בניה ודחיפה
        run: |
          docker build -t myapp:${{ github.sha }} .
          docker push myapp:${{ github.sha }}
```

**חשוב לזכור:** GitHub מסתיר אוטומטית ערכי secrets בלוגים (מציג `***`), אבל זה עובד רק אם הערך מועבר כמות שהוא. אם למשל תעשו `base64` ל-secret ותדפיסו את התוצאה, ה-masking לא יזהה זאת - ולכן אין לבצע מניפולציות על secrets ולהדפיס תוצאות.

### מעבר secrets ל-reusable workflow

```yaml
jobs:
  call-deploy:
    uses: ./.github/workflows/deploy-reusable.yml
    secrets: inherit    # מעביר את כל ה-secrets של הקורא
    # או באופן סלקטיבי:
    # secrets:
    #   DEPLOY_TOKEN: ${{ secrets.DEPLOY_TOKEN }}
```

## יצירה ושימוש ב-Variables

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: הדפסת קונפיגורציה
        run: |
          echo "סביבת היעד: ${{ vars.TARGET_ENV }}"
          echo "כתובת ה-API: ${{ vars.API_BASE_URL }}"
```

Variables שימושיים כאשר רוצים לשתף קונפיגורציה בין כמה workflows בלי לחשוף אותה כ-secret, ובנוסף הם קריאים בממשק (בניגוד ל-secrets שהערך שלהם לא מוצג לאחר השמירה).

## GITHUB_TOKEN - הסוד המובנה

בכל ריצת workflow, GitHub יוצר אוטומטית טוקן זמני בשם `GITHUB_TOKEN`, שנגיש דרך `${{ secrets.GITHUB_TOKEN }}` או (בקריאות API בתוך actions) דרך `github.token`.

```yaml
permissions:
  contents: read
  pull-requests: write
  issues: write

jobs:
  label-pr:
    runs-on: ubuntu-latest
    steps:
      - name: הוספת תווית ל-PR
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.addLabels({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.issue.number,
              labels: ['automated']
            })
```

### עקרון הרשאה מינימלית (least privilege)

כברירת מחדל ל-`GITHUB_TOKEN` יש הרשאות רחבות למדי (תלוי בהגדרות הארגון). מומלץ **תמיד** להצמיד את ה-`permissions` בראש הקובץ לפי הצורך המדויק:

```yaml
permissions:
  contents: read   # הרשאת מינימום - קריאה בלבד
```

וברמת job ספציפי שכן צריך הרשאה נוספת:

```yaml
jobs:
  comment-on-pr:
    permissions:
      pull-requests: write
      contents: read
    runs-on: ubuntu-latest
    steps:
      - run: echo "מגיב על PR..."
```

## OpenID Connect (OIDC) - אימות ללא סודות

במקום לשמור מפתחות AWS/Azure/GCP קבועים כ-secrets (שעלולים לדלוף), ניתן להשתמש ב-OIDC כדי לקבל טוקן זמני בזמן ריצה:

```yaml
permissions:
  id-token: write   # נדרש עבור OIDC
  contents: read

jobs:
  deploy-to-aws:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: אימות מול AWS דרך OIDC
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::123456789012:role/github-actions-deploy
          aws-region: eu-central-1

      - name: פריסה ל-S3
        run: aws s3 sync ./dist s3://my-bucket
```

היתרון המרכזי: אין מפתחות קבועים בכלל בסודות הריפו - הטוקן שנוצר תקף לריצה בודדת בלבד, מה שמצמצם משמעותית את משטח ההתקפה.

## Environments ואישורים ידניים

Environment הוא שכבת קונפיגורציה נוספת שמאפשרת:

- Secrets/Variables ייעודיים לסביבה (staging, production וכו')
- דרישת אישור ידני (required reviewers) לפני שה-job רץ
- הגבלת אילו ענפים מותר לפרוס מהם (deployment branch policies)
- זמן המתנה (wait timer) לפני ביצוע

```yaml
jobs:
  deploy-production:
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://myapp.com
    steps:
      - run: ./deploy.sh
```

## טיפים וטריקים

1. **לעולם אל תדפיסו secret ללוג** - גם אם זה נראה "מוסתר", יש להימנע מכל `echo` שעלול לחשוף חלקים ממנו.

2. **שימוש ב-`environment` לצורך "gate" ידני** - מצוין לפריסות לפרודקשן שדורשות אישור אנושי לפני ביצוע.

3. **סיבוב (rotation) קבוע ל-secrets** - החליפו מפתחות API וטוקנים תקופתית, במיוחד אם עובד עזב את הצוות.

4. **שימוש ב-OIDC כברירת מחדל לענן** - עדיף תמיד OIDC על פני מפתחות קבועים כשעובדים מול AWS, Azure או GCP.

5. **אל תשמרו secrets בקובץ `.env` שנדחף לריפו** - זו טעות נפוצה שחושפת אותם בהיסטוריית ה-git לצמיתות.

6. **בדקו אילו secrets זמינים לפני PR מ-fork** - secrets רגילים (למעט GITHUB_TOKEN מוגבל) לא זמינים אוטומטית ב-PR מ-fork חיצוני, מטעמי אבטחה.

## שאלות ראיון עבודה

**1. מה ההבדל בין Secret ל-Variable ב-GitHub Actions?**
Secret הוא ערך מוצפן שמוסתר בלוגים ומיועד לנתונים רגישים; Variable הוא ערך רגיל, לא מוצפן, המיועד לקונפיגורציה לא-רגישה.

**2. מהן שלוש הרמות שבהן ניתן להגדיר Secrets?**
Repository, Environment, ו-Organization.

**3. מה זה GITHUB_TOKEN וממתי הוא נוצר?**
טוקן זמני שנוצר אוטומטית על ידי GitHub בתחילת כל ריצת workflow, ומאפשר אינטראקציה עם ה-API של הריפו לפי ההרשאות שהוגדרו.

**4. למה חשוב להגדיר `permissions` מפורש בראש קובץ ה-workflow?**
כדי לממש את עקרון ההרשאה המינימלית - להגביל את מה שה-GITHUB_TOKEN יכול לעשות, ובכך לצמצם נזק פוטנציאלי אם ה-workflow מנוצל לרעה.

**5. מה זה OIDC וכיצד הוא משפר אבטחה מול ספקי ענן?**
פרוטוקול שמאפשר קבלת טוקן זמני וממוקד-הרשאות בזמן ריצה, במקום החזקת מפתחות סטטיים כ-secrets - מצמצם סיכון דליפה של אישורי גישה קבועים.

**6. האם secrets רגילים זמינים ב-Pull Request שמגיע מ-fork?**
לא, מטעמי אבטחה - למעט GITHUB_TOKEN עם הרשאות מוגבלות (בדרך כלל read-only).

**7. איך מעבירים secrets ל-reusable workflow?**
באמצעות `secrets: inherit` (כל הסודות של הקורא) או פירוט ידני של סודות ספציפיים תחת `secrets:` בקריאה ל-workflow.

**8. מה קורה אם מנסים לגשת ל-secret שלא קיים?**
הביטוי מוחזר כמחרוזת ריקה, ללא שגיאה - מה שיכול לגרום לבאגים שקטים אם לא בודקים זאת.

**9. מה זה Environment ב-GitHub Actions, ואיך הוא קשור ל-approval gates?**
שכבת קונפיגורציה שניתן לצרף ל-job (`environment:`), שמאפשרת secrets/variables ייעודיים, וכן דרישת אישור ידני ("required reviewers") לפני ריצת ה-job.

**10. איך מונעים חשיפת secret דרך מניפולציה (למשל קידוד base64)?**
על ידי הימנעות מוחלטת מהדפסת נגזרות של secrets ללוגים - מנגנון ה-masking האוטומטי של GitHub מזהה רק את הערך המדויק, לא גרסאות מקודדות שלו.

## קישורים חיצוניים

### תיעוד רשמי (GitHub Docs)
- [Using secrets in GitHub Actions](https://docs.github.com/actions/security-guides/using-secrets-in-github-actions)
- [Security for GitHub Actions](https://docs.github.com/en/actions/how-tos/security-for-github-actions)
- [Reuse workflows - כולל secrets: inherit](https://docs.github.com/en/actions/how-tos/reuse-automations/reuse-workflows)

### סרטוני יוטיוב מומלצים
- [GitHub Actions Tutorial | From Zero to Hero in 90 minutes](https://www.youtube.com/watch?v=TLB5MY9BBa4) - כולל פרק ייעודי על Secrets ו-Environments
- [Complete GitHub Actions Course - From BEGINNER to PRO](https://www.youtube.com/watch?v=Xwpi0ITkL3U)

---

**במדריך הבא (מדריך 5):** נסקור את עולם ה-Actions המוכנים מה-Marketplace - איך למצוא, לבחור ולהשתמש ב-Actions פופולריים בבטחה.
