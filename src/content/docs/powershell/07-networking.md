---
sidebar_position: 7
title: "מדריך 07 — PowerShell לרשתות, DNS, HTTP, TCP ו-Troubleshooting"
---

<!-- מדריך PowerShell בעברית | נבנה ללמידה, תרגול והכנה לראיונות -->

## 1. למה PowerShell חשוב לרשת?
System Administrator צריך לא רק "Ping". צריך לדעת להפריד בין:
DNS → TCP → TLS → HTTP → Authentication → Application.

## 2. Ping
```powershell
Test-Connection server01 -Count 4
Test-Connection server01 -Count 1 -Quiet
```

## 3. TCP
```powershell
Test-NetConnection server01 -Port 443
Test-NetConnection server01 -Port 3389
Test-NetConnection server01 -Port 5985
```

## 4. DNS
```powershell
Resolve-DnsName example.com
Resolve-DnsName server01.example.local
Resolve-DnsName -Type MX example.com
Resolve-DnsName -Type TXT example.com
```

## 5. Route
```powershell
Test-NetConnection 8.8.8.8 -TraceRoute
```

## 6. IP Configuration
```powershell
Get-NetIPConfiguration
Get-NetIPAddress
Get-NetRoute
Get-DnsClientServerAddress
```

## 7. Interfaces
```powershell
Get-NetAdapter
Get-NetAdapterStatistics
```

## 8. ARP / Neighbor
```powershell
Get-NetNeighbor
```

## 9. Firewall
```powershell
Get-NetFirewallProfile
Get-NetFirewallRule -Enabled True
```

בדיקת Rule:
```powershell
Get-NetFirewallRule -DisplayName "*Remote Desktop*"
```

## 10. HTTP
```powershell
Invoke-WebRequest https://example.com
```

REST:
```powershell
Invoke-RestMethod "https://api.example.com/health"
```

## 11. curl
ב-Windows מודרני אפשר להשתמש ב-`curl.exe` כדי להימנע מבלבול עם alias היסטורי:

```powershell
curl.exe -I https://example.com
```

Timing:
```powershell
curl.exe -o NUL -s -w "DNS=%{time_namelookup}`nConnect=%{time_connect}`nTTFB=%{time_starttransfer}`nTotal=%{time_total}`n" https://example.com
```

## 12. TLS
```powershell
Test-NetConnection example.com -Port 443
```

אבל TCP פתוח אינו אומר שה-HTTPS תקין. צריך לבדוק גם TLS, Certificate ו-HTTP response.

## 13. Ports נפוצים
- 53 DNS
- 80 HTTP
- 443 HTTPS
- 88 Kerberos
- 389 LDAP
- 636 LDAPS
- 445 SMB
- 3389 RDP
- 5985 WinRM HTTP
- 5986 WinRM HTTPS

## 14. Troubleshooting סדרתי
אם משתמש אומר "האפליקציה איטית":

1. DNS:
```powershell
Resolve-DnsName app.example.local
```
2. TCP:
```powershell
Test-NetConnection app.example.local -Port 443
```
3. HTTP:
```powershell
curl.exe -v https://app.example.local/
```
4. Timing:
```powershell
curl.exe -o NUL -s -w "TTFB=%{time_starttransfer} Total=%{time_total}`n" https://app.example.local/
```
5. Server logs
6. IIS
7. Database
8. Application dependencies

## 15. IIS
```powershell
Get-Website
Get-WebAppPoolState
```

למודול IIS:
```powershell
Import-Module WebAdministration
Get-Website
Get-WebBinding
```

## שאלות ראיון
### Ping עובד אבל RDP לא. מה תבדוק?
Port 3389, Firewall, RDP service, listener, routing, ACL, NLA ו-logs.

### DNS עובד אבל HTTPS לא?
בדוק TCP 443, Certificate/TLS, SNI, reverse proxy/load balancer ו-HTTP response.

### TCP פתוח אבל האפליקציה איטית?
זה לא מוכיח שהרשת היא הבעיה. צריך למדוד TTFB, server processing, DB, application logs ו-client rendering.

## תרגיל
בנה `Test-WebEndpoint` שמחזיר:
- DNS time
- TCP connection
- HTTP status
- TTFB
- Total time
- Certificate expiry אם אפשר
- Error message במקרה כשל


## מקורות מומלצים

### Microsoft Learn
- https://learn.microsoft.com/en-us/powershell/
- https://learn.microsoft.com/en-us/powershell/scripting/discover-powershell
- https://learn.microsoft.com/en-us/powershell/scripting/learn/ps101/00-introduction
- https://learn.microsoft.com/en-us/powershell/scripting/samples/sample-scripts-for-administration
- https://learn.microsoft.com/en-us/powershell/gallery/
- https://learn.microsoft.com/en-us/powershell/module/

### YouTube
- PowerShell / Microsoft: https://www.youtube.com/@Microsoft
- Microsoft Mechanics: https://www.youtube.com/@MicrosoftMechanics
- Search: PowerShell tutorials: https://www.youtube.com/results?search_query=PowerShell+tutorial
- Search: PowerShell for administrators: https://www.youtube.com/results?search_query=PowerShell+for+system+administrators
- Search: PowerShell interview questions: https://www.youtube.com/results?search_query=PowerShell+interview+questions



# הרחבה — Networking Troubleshooting מהיום-יום

## תרחיש — משתמש אומר "האפליקציה איטית"

לא אומרים "זה הרשת".

### DNS

```powershell
Resolve-DnsName app.domain.local
```

### TCP

```powershell
Test-NetConnection app.domain.local -Port 443
```

### HTTP

```powershell
curl.exe -v https://app.domain.local/
```

### Timing

```powershell
curl.exe -o NUL -s -w "DNS=%{time_namelookup}`nConnect=%{time_connect}`nTTFB=%{time_starttransfer}`nTotal=%{time_total}`n" https://app.domain.local/
```

עכשיו אתה יודע איפה הזמן.

## תרחיש — DNS נכון אבל Application עדיין איטית

יכול להיות:

```text
Client
 ↓
Network
 ↓
Load Balancer
 ↓
IIS
 ↓
Application
 ↓
SQL
```

אם TTFB גבוה, אתה צריך לבדוק Server/Application/DB.

## תרחיש — Port פתוח

```powershell
Test-NetConnection SQL01 -Port 1433
```

תוצאה True אומרת שיש TCP connectivity.

היא לא אומרת:
- שה-SQL Query מהיר.
- שה-Login עובד.
- שה-DB healthy.
- שהאפליקציה תקינה.

## תרחיש — RDP לא עובד

```powershell
Test-NetConnection SRV01 -Port 3389
```

אם נכשל:
- Firewall
- Routing
- ACL
- RDP service
- Listener
- NLA
- Network path

## תרחיש — WinRM לא עובד

```powershell
Test-NetConnection SRV01 -Port 5985
Test-WSMan SRV01
```

## תרגיל

כתוב `Test-ApplicationEndpoint.ps1` שמקבל:

```powershell
-Url
-Port
```

ומחזיר:

```text
DNS
TCP
HTTP
StatusCode
TTFB
Total
Error
```

זה Script מצוין לתיק עבודות ולראיון.