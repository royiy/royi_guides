---
sidebar_position: 6
title: "מדריך 6 — Clusters, vMotion ו-DRS"
---

# Clusters, vMotion ו-DRS

## מטרת המדריך

להבין כיצד מספר Hosts עובדים כיחידה אחת.

## 1. Cluster

```text
Cluster
├── ESXi01
├── ESXi02
└── ESXi03
```

## 2. vMotion

vMotion מאפשר להעביר VM מ-Host אחד לאחר ללא כיבוי, כאשר התנאים הנדרשים מתקיימים.

```text
ESXi01                  ESXi02
  │                       │
  │       vMotion         │
  ├──────────────────────►│
  │                       │
 VM01                    VM01
```

## 3. דרישות vMotion

יש לבדוק:

- Networking
- VMkernel vMotion
- CPU compatibility
- Storage
- Licensing/feature availability
- EVC במקרה הצורך

## 4. Storage vMotion

ניתן להעביר את הדיסקים של VM בין Datastores בלי להעביר בהכרח את ה-Compute Host.

```text
VM01
 │
 ├── Datastore01
 │
 └── Storage vMotion
          ↓
     Datastore02
```

## 5. DRS

DRS עוזר לנהל עומסי CPU ו-Memory בתוך Cluster.

```text
Cluster
├── ESXi01 → 20%
├── ESXi02 → 90%
└── ESXi03 → 30%
```

DRS עשוי להמליץ או לבצע פעולות בהתאם להגדרות הסביבה והגרסה.

## 6. EVC

EVC מסייע לאפשר תאימות CPU בין Hosts בעלי דורות CPU שונים, בכפוף לתמיכה ולמגבלות הגרסה.

## 7. תרגיל

1. צרו שני Hosts.
2. צרו Cluster.
3. חברו Datastore משותף.
4. הפעילו vMotion.
5. העבירו VM בין Hosts.
6. בדקו Events ו-Tasks.

## 8. קישורים

- [VMware Hands-on Labs](https://labs.hol.vmware.com/HOL/catalog/)
- [YouTube — VMware vMotion](https://www.youtube.com/results?search_query=VMware+vMotion+DRS+tutorial)
