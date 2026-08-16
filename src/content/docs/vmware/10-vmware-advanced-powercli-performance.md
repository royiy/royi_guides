---
sidebar_position: 10
title: "VMware #10 — Advanced: PowerCLI, Performance ו-Best Practices"
---

# VMware #10 — Advanced VMware

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

1. מהו CPU Ready?
2. איך תבדיל בין CPU bottleneck ל-Storage bottleneck?
3. מה ההבדל בין HA, DRS ו-vMotion?
4. איך תתכנן שני Hosts עם Redundancy?
5. מה תבדוק לפני vMotion?
6. איך תזהה Snapshot בעייתי?
7. איך תבנה PowerCLI report?
8. למה DNS/NTP חשובים?
9. איך תתכנן Management Network?
10. איך תבנה תהליך Troubleshooting?

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
