---
sidebar_position: 10
title: "מדריך 10 — VMware מתקדם: Performance, PowerCLI ו-Best Practices"
---

# VMware מתקדם

## מטרת המדריך

לעבור מניהול בסיסי לניהול מקצועי של סביבת vSphere.

## 1. Performance

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

## 2. CPU Ready

VM יכולה להציג CPU Usage נמוך ועדיין להיות איטית.

לכן בודקים גם CPU Ready.

```text
VM
 │
 ├── CPU Usage
 └── CPU Ready
```

## 3. PowerCLI

חיבור ל-vCenter:

```powershell
Connect-VIServer vcenter01.lab.local
```

Hosts:

```powershell
Get-VMHost
```

VMs:

```powershell
Get-VM
```

Datastores:

```powershell
Get-Datastore
```

הפעלת VM:

```powershell
Start-VM "VM01"
```

Snapshots:

```powershell
Get-Snapshot -VM "VM01"
```

## 4. דוח VMs

```powershell
Get-VM |
Select-Object Name, PowerState, NumCpu, MemoryGB
```

## 5. CSV

```powershell
Get-VM |
Select-Object Name, PowerState, NumCpu, MemoryGB |
Export-Csv .m-report.csv -NoTypeInformation -Encoding UTF8
```

## 6. פרויקט PowerCLI

בנו Script שמוציא:

```text
VM Name
Power State
CPU
RAM
Host
Datastore
IP
VMware Tools
Snapshots
```

ומייצא CSV.

## 7. Best Practices

בכל סביבה יש לבחון:

- Naming
- DNS
- NTP
- Monitoring
- Backup
- Security
- Least Privilege
- Capacity Planning
- Patch Management
- Documentation
- Disaster Recovery

## 8. פרויקט מסכם

בנו סביבת:

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
             │         │         │
             └──── Shared Storage ────┘
                       │
                 ┌─────┼─────┐
                 │     │     │
                HA    DRS  vMotion
```

## 9. שאלות ראיון

1. מה ההבדל בין ESXi ל-vCenter?
2. מה ההבדל בין HA ל-DRS?
3. מהו vMotion?
4. למה Snapshot אינו Backup?
5. מהו CPU Ready?
6. מהו Datastore?
7. מה ההבדל בין vSS ל-vDS?
8. מהו Admission Control?
9. איך תחקור VM איטית?
10. איך תחקור vMotion שנכשל?

## 10. קישורים

- [VMware Hands-on Labs](https://labs.hol.vmware.com/HOL/catalog/)
- [YouTube — VMware PowerCLI](https://www.youtube.com/results?search_query=VMware+PowerCLI+tutorial)
- [YouTube — VMware Performance](https://www.youtube.com/results?search_query=VMware+vSphere+performance+troubleshooting)
