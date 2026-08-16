---
sidebar_position: 8
title: "מדריך 8 — ניהול VM: Snapshot, Clone, Template ומשאבים"
---

# ניהול מכונות וירטואליות

## 1. Snapshot

Snapshot שומר נקודת מצב של VM.

חשוב:

> Snapshot אינו תחליף ל-Backup.

## 2. Template

```text
Windows Server
      │
      ▼
   Template
      │
 ┌────┼────┐
 ▼    ▼    ▼
VM01 VM02 VM03
```

Template שימושי ליצירת VMs בצורה עקבית.

## 3. Clone

Clone יוצר עותק של VM בהתאם ליכולות ולתצורה הזמינות בגרסת vSphere.

## 4. CPU

דוגמה:

```text
VM01
vCPU = 4
```

יותר vCPU לא תמיד אומר יותר ביצועים.

## 5. Memory

דוגמה:

```text
VM01
RAM = 8 GB
```

נלמד:

- Shares
- Reservations
- Limits
- Ballooning
- Compression
- Swap

## 6. CPU Ready

CPU Ready הוא מדד חשוב בבדיקת ביצועים.

אם VM מחכה לקבל CPU למרות שיש לה עומס עבודה, CPU Ready יכול להיות חלק מהבעיה.

## 7. תרגיל

צרו Template של Windows Server והפיקו ממנו:

```text
DC01
APP01
WEB01
```

לאחר מכן בדקו את משאבי כל VM.

## 8. קישורים

- [VMware Hands-on Labs](https://labs.hol.vmware.com/HOL/catalog/)
- [YouTube — VMware Templates and Snapshots](https://www.youtube.com/results?search_query=VMware+templates+snapshots+cloning+tutorial)
