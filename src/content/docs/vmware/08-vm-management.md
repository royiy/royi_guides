---
sidebar_position: 8
title: "VMware #8 — Snapshot, Template, Clone וניהול משאבים"
description: "ניהול מחזור חיי VM: Snapshots וניקוים, בניית Templates ו-Clones, והקצאת משאבי CPU/Memory כולל Shares, Reservation, Limit ו-CPU Ready."
---

> **הערת גרסאות:** VMware נמצאת כיום תחת Broadcom, ולכן שמות המוצרים והמעבדות משתנים עם הזמן. המדריכים מתמקדים בעקרונות vSphere/ESXi/vCenter שהם הבסיס, ובמקומות רלוונטיים מציינים גם את VCF.

## 1. Snapshot

Snapshot שומר נקודת מצב של VM ומאפשר לחזור לנקודה קודמת בהתאם לשימוש ולניהול נכון.

**Snapshot אינו Backup.**

ל-VM עם Snapshot לאורך זמן עלולות להיות השלכות על ביצועים, Storage וניהול.

## 2. Template

```text
Windows Server
      ↓
   Template
      ↓
 ┌────┼────┐
 ▼    ▼    ▼
DC01 APP01 WEB01
```

Template מאפשר יצירה עקבית של VMs.

## 3. Clone

Clone יוצר עותק של VM. יש להקפיד על Identity של Guest OS, במיוחד במערכות Windows, ולבצע Customization מתאים.

## 4. CPU

```text
VM01
vCPU = 4
```

יותר vCPU לא בהכרח משפר ביצועים.

## 5. Memory

```text
VM01
RAM = 8 GB
```

נושאים חשובים:

- Shares
- Reservation
- Limit
- Ballooning
- Compression
- Swap

## 6. CPU Ready

CPU Ready מציין זמן שבו VM הייתה מוכנה להריץ עבודה אך המתינה למשאב CPU.

לכן:

```text
CPU Usage = 20%
```

לא מוכיח שאין בעיית CPU.

## 7. Snapshot Cleanup

לפני מחיקה:

1. בדוק אם Snapshot דרוש.
2. בדוק גודל.
3. בדוק Free Space.
4. בדוק שאין Backup/Operation תלוי בו.
5. בצע פעולה דרך vSphere ולא במחיקה ידנית של קבצים.

## 8. תרגיל Template

1. התקן Windows Server.
2. בצע Updates.
3. התקן VMware Tools.
4. הכן את ה-Guest לפי שיטת הארגון.
5. צור Template.
6. צור ממנו APP01 ו-WEB01.
7. בדוק Hostname ו-Network identity.

## 9. תרגיל Resources

השווה:

```text
VM01 → 2 vCPU / 4 GB
VM02 → 8 vCPU / 16 GB
```

בדוק Performance ואל תגדיל משאבים אוטומטית בלי מדידה.

## 10. YouTube

[VMware Templates / Clones / Snapshots](https://www.youtube.com/results?search_query=VMware+templates+clones+snapshots)

## שאלות ראיון

<details class="qa">
<summary>1. למה Snapshot אינו Backup?</summary>

כי הוא שרשרת קבצי דלתא שתלויה בדיסק המקורי ויושבת על אותו Datastore — תקלה באחסון מוחקת את שניהם. הוא גם פוגע בביצועים ככל שהוא מזדקן. Snapshot נועד לחלון זמן קצר (לפני עדכון, למשל), וגיבוי אמיתי הוא עותק נפרד במיקום נפרד.

</details>

<details class="qa">
<summary>2. מתי תשתמש ב-Template?</summary>

כשרוצים לייצר מכונות חדשות מתקן אחיד — מערכת הפעלה מעודכנת, סוכני ניטור, הגדרות אבטחה. Template הוא "תבנית לקריאה בלבד" שלא ניתן להדליק בטעות, ומשלבים אותו עם Customization Specification כדי לתת לכל מכונה חדשה שם, SID וכתובת IP משלה.

</details>

<details class="qa">
<summary>3. מהו Clone?</summary>

עותק מלא ועצמאי של מכונה קיימת, חד-פעמי — בניגוד ל-Template שנועד לשכפול חוזר. אפשר לשכפל מכונה כבויה או פעילה (Hot Clone). חשוב לבצע Guest Customization לפני החזרת ה-clone לרשת, כדי למנוע התנגשות שמות, SID וכתובות IP.

</details>

<details class="qa">
<summary>4. מהו CPU Ready?</summary>

הזמן שבו ה-VM הייתה מוכנה לרוץ אבל המתינה ל-CPU פיזי פנוי. זה המדד המרכזי לצוואר בקבוק חישובי: אחוז גבוה (מעבר לכ-5% ל-vCPU) מעיד על יותר מדי vCPUs או על Host עמוס — ולעיתים דווקא הקטנת מספר ה-vCPUs תשפר את הביצועים.

</details>

<details class="qa">
<summary>5. מה ההבדל בין Limit ל-Reservation?</summary>

Reservation היא **מינימום מובטח** של משאב שה-VM תמיד תקבל (ונתפס עבורה גם אם אינה משתמשת בו). Limit היא **תקרה** שמעבר לה היא לא תקבל, גם אם יש משאבים פנויים. Limit שנשכח מוגדר הוא סיבה נפוצה למכונה "איטית בלי סיבה"; Shares, לעומתם, קובעים יחס חלוקה רק בזמן תחרות.

</details>

