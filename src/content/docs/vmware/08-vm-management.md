---
sidebar_position: 8
title: "VMware #8 — Snapshot, Template, Clone וניהול משאבים"
---

# VMware #8 — ניהול VM

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

1. למה Snapshot אינו Backup?
2. מתי תשתמש ב-Template?
3. מהו Clone?
4. מהו CPU Ready?
5. מה ההבדל בין Limit ל-Reservation?
