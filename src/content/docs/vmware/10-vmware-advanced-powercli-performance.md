---
sidebar_position: 10
title: "VMware #10 — Advanced: PowerCLI, Performance ו-Best Practices"
description: "אוטומציה עם PowerCLI ליצירת דוחות VM, ניתוח מדדי ביצועים מתקדמים ועקרונות Best Practices לתכנון סביבת Production."
---

> **הערת גרסאות:** VMware נמצאת כיום תחת Broadcom, ולכן שמות המוצרים והמעבדות משתנים עם הזמן. המדריכים מתמקדים בעקרונות vSphere/ESXi/vCenter שהם הבסיס, ובמקומות רלוונטיים מציינים גם את VCF.

## מטרת המדריך

לעבור מניהול ידני לאוטומציה, Performance Analysis ותכנון סביבת Production.

## 1. PowerCLI

PowerCLI הוא כלי מרכזי לאוטומציה של VMware.

### התחברות

```powershell
Connect-VIServer vcenter01.lab.local
```

### Hosts

```powershell
Get-VMHost
```

### VMs

```powershell
Get-VM
```

### Datastores

```powershell
Get-Datastore
```

### הפעלת VM

```powershell
Start-VM "VM01"
```

### Snapshots

```powershell
Get-Snapshot -VM "VM01"
```

## 2. דוח VM

```powershell
Get-VM |
Select-Object Name, PowerState, NumCpu, MemoryGB
```

## 3. CSV

```powershell
Get-VM |
Select-Object Name, PowerState, NumCpu, MemoryGB |
Export-Csv .\vm-report.csv -NoTypeInformation -Encoding UTF8
```

## 4. VMware Tools

דוגמה לדוח:

```powershell
Get-VM |
Select Name,
       PowerState,
       @{N="ToolsStatus";E={$_.ExtensionData.Guest.ToolsStatus}}
```

## 5. Performance

מדדים חשובים:

- CPU Usage
- CPU Ready
- CPU Co-Stop
- Memory Usage
- Ballooning
- Compression
- Swap
- Disk Latency
- IOPS
- Throughput
- Network Drops

## 6. esxtop

```bash
esxtop
```

התרגל לעבור בין תצוגות CPU, Memory, Disk ו-Network.

VMware Hands-on Labs כוללת מעבדה עדכנית ל-PowerCLI עם Snapshots, Reports, vCenter, ESXi ו-VMware Tools. 

[PowerCLI Hands-on Lab](https://labs.hol.vmware.com/HOL/catalog/)

## 7. Performance Lab

יש גם מעבדה רשמית שמתרגלת esxtop וניתוח CPU, Memory, Storage ו-Network. 

[VMware Hands-on Labs](https://labs.hol.vmware.com/HOL/catalog/)

## 8. Best Practices

### Naming

```text
vcenter01
esxi01
esxi02
dc01
sql01
app01
```

### DNS

כל Host ו-Service קריטי צריך Naming עקבי ו-DNS תקין.

### NTP

זמן נכון חשוב במיוחד בסביבות שבהן קיימים שירותי Authentication, Certificates ו-Logs.

### Security

- Least Privilege
- MFA היכן שנתמך ומתאים
- ניהול הרשאות
- הפרדת Management Network
- עדכונים
- ניטור

### Backup

תכנן:

```text
Production
   ↓
Backup
   ↓
Offsite / Immutable
   ↓
Restore Test
```

## 9. פרויקט מסכם

בנה:

```text
                    vCenter
                       │
                  Production
                       │
                   Cluster01
             ┌─────────┼─────────┐
             │         │         │
          ESXi01     ESXi02    ESXi03
             │         │         │
            VMs       VMs       VMs
             └──── Shared Storage ────┘
                       │
                 ┌─────┼─────┐
                 │     │     │
                HA    DRS  vMotion
```

לאחר מכן:

1. צור Template.
2. צור 3 VMs.
3. הגדר VLANs.
4. חבר Storage.
5. הפעל HA.
6. הפעל DRS.
7. בצע vMotion.
8. צור Snapshot ובצע Cleanup.
9. הרץ PowerCLI Report.
10. בצע תרגיל תקלה.
11. נתח Performance.
12. תעד את הסביבה.

## 10. שאלות ראיון מתקדמות

<details class="qa">
<summary>1. מהו CPU Ready?</summary>

הזמן שבו vCPU הייתה מוכנה לרוץ והמתינה למעבד פיזי פנוי (`%RDY` ב-esxtop). זהו המדד הראשון שבודקים בתלונת "VM איטית": לרוב הפתרון הוא דווקא **להקטין** את מספר ה-vCPUs או להוריד עומס מה-Host, ולא להוסיף משאבים.

</details>

<details class="qa">
<summary>2. איך תבדיל בין CPU bottleneck ל-Storage bottleneck?</summary>

ב-esxtop: `%RDY` ו-`%CSTP` גבוהים מצביעים על תחרות CPU, בעוד GAVG/DAVG גבוהים (עשרות מילישניות) מצביעים על אחסון. גם בתוך מערכת ההפעלה אפשר להבחין: ב-CPU bottleneck העומס גבוה אך ה-I/O wait נמוך, ובבעיית אחסון התהליכים ממתינים ל-I/O בזמן שהמעבד פנוי.

</details>

<details class="qa">
<summary>3. מה ההבדל בין HA, DRS ו-vMotion?</summary>

vMotion הוא **הכלי** להעברה חיה של VM בין Hosts. DRS משתמש בו כדי **לאזן עומסים** באופן שוטף. HA מטפל ב**כשל**: הוא לא מעביר חי אלא מפעיל מחדש מכונות על Host אחר אחרי שה-Host שלהן נפל.

</details>

<details class="qa">
<summary>4. איך תתכנן שני Hosts עם Redundancy?</summary>

מוודאים שכל Host יכול לשאת את העומס של שניהם (N+1), אחסון משותף נגיש לשניהם, לפחות שני NICs לכל תפקיד רשת מול שני מתגים, ספקי כוח כפולים, וקלאסטר עם HA ו-Admission Control מוגדר כראוי. מוסיפים כללי Anti-Affinity למכונות שמגבות זו את זו, ו-DNS/NTP יציבים מחוץ לתלות באותם Hosts.

</details>

<details class="qa">
<summary>5. מה תבדוק לפני vMotion?</summary>

קישוריות רשת ה-vMotion בין ה-Hosts, אחסון משותף נגיש, תאימות CPU (EVC), משאבים פנויים ב-Host היעד, ניתוק התקנים מקומיים מהמכונה (ISO, USB, passthrough), וכללי DRS/Affinity שעלולים לחסום. כדאי גם לוודא שאין snapshot ענק או פעולה אחרת שרצה על המכונה.

</details>

<details class="qa">
<summary>6. איך תזהה Snapshot בעייתי?</summary>

מחפשים snapshots ישנים או גדולים — ב-PowerCLI `Get-VM | Get-Snapshot | Where-Object Created -lt (Get-Date).AddDays(-7)` — ובודקים את גודל קבצי ה-delta מול ה-Datastore. סימנים נוספים: מכונה שהאטה בהדרגה, Datastore שמתמלא, ו-snapshot "יתום" שמופיע בקבצים אך לא ב-Snapshot Manager (מזוהה עם Consolidate).

</details>

<details class="qa">
<summary>7. איך תבנה PowerCLI report?</summary>

מתחברים עם `Connect-VIServer`, אוספים את הנתונים ובונים אובייקט אחיד לייצוא:

```powershell
Get-VM | Select-Object Name, PowerState, NumCpu, MemoryGB,
    @{N="Host";E={$_.VMHost.Name}}, @{N="Datastore";E={($_ | Get-Datastore).Name -join ","}} |
  Export-Csv .\vm-inventory.csv -NoTypeInformation -Encoding UTF8
```

מתזמנים את הריצה, ומקפידים לא להריץ `Format-Table` לפני הייצוא.

</details>

<details class="qa">
<summary>8. למה DNS/NTP חשובים?</summary>

רוב הרכיבים בסביבת vSphere מזהים זה את זה בשם ולא ב-IP — vCenter, Hosts, vSAN ותעודות TLS. DNS שגוי מייצר Hosts במצב Not Responding ובעיות הצטרפות. NTP קריטי כי הפרשי שעון שוברים אימות (Kerberos/SSO), פוסלים תעודות ומקשים על קורלציה בין לוגים בזמן אירוע.

</details>

<details class="qa">
<summary>9. איך תתכנן Management Network?</summary>

VMkernel ייעודי לניהול, ב-VLAN נפרד, עם שני uplinks לשני מתגים שונים (teaming/failover), כתובות סטטיות, DNS ו-NTP תקינים, וגישה מוגבלת מרשת ניהול בלבד. מפרידים אותה מ-vMotion ומתעבורת אחסון, כדי שפרץ תעבורה לא ינתק את הניהול ויגרור תגובות HA מיותרות.

</details>

<details class="qa">
<summary>10. איך תבנה תהליך Troubleshooting?</summary>

אוספים עובדות לפני שמשערים: מה השתנה ומתי, מי מושפע (VM בודדת / Host / כל הקלאסטר), ומה אומרים ה-Events והלוגים. אחר כך מפרידים שכבות — Guest, CPU, זיכרון, אחסון, רשת — ומודדים כל אחת (esxtop, vmkping, מדדי latency). משנים **שינוי אחד בכל פעם**, מתעדים, מאמתים שהבעיה נפתרה, ולבסוף כותבים סיכום ופעולה מונעת.

</details>

## 11. המשך מתקדם

אחרי 10 המדריכים אפשר להמשיך ל:

- vSAN
- NSX
- VCF
- VCF Operations
- Automation
- APIs
- PowerCLI מתקדם
- Disaster Recovery
- Site Recovery
- Security
- Capacity Planning

## קישורים

[VMware Hands-on Labs](https://labs.hol.vmware.com/HOL/catalog/)

[PowerCLI Labs](https://labs.hol.vmware.com/HOL/catalog?search=automation)

[YouTube — VMware PowerCLI](https://www.youtube.com/results?search_query=VMware+PowerCLI+tutorial)

[YouTube — VMware Performance](https://www.youtube.com/results?search_query=VMware+vSphere+performance+esxtop)
