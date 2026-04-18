# Disk Health Monitoring Script
# Run this periodically to check for disk issues

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DISK HEALTH MONITOR" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Physical Disks
Write-Host "[Physical Disks Status]" -ForegroundColor Yellow
Get-PhysicalDisk | Select-Object DeviceID, FriendlyName, HealthStatus, OperationalStatus, Size | Format-Table -AutoSize
Write-Host ""

# Check Volumes
Write-Host "[Volume Status]" -ForegroundColor Yellow
Get-Volume | Select-Object DriveLetter, FileSystemLabel, HealthStatus, @{Name="Size(GB)";Expression={[math]::Round($_.Size/1GB,2)}}, @{Name="Free(GB)";Expression={[math]::Round($_.SizeRemaining/1GB,2)}} | Format-Table -AutoSize
Write-Host ""

# Check for disk errors in Event Log
Write-Host "[Recent Disk Errors (Last 24 hours)]" -ForegroundColor Yellow
$yesterday = (Get-Date).AddDays(-1)
$diskErrors = Get-EventLog -LogName System -Source "disk" -After $yesterday -EntryType Error -ErrorAction SilentlyContinue

if ($diskErrors) {
    Write-Host "WARNING: Disk errors detected!" -ForegroundColor Red
    $diskErrors | Select-Object TimeGenerated, Message | Format-List
} else {
    Write-Host "No disk errors in last 24 hours ✓" -ForegroundColor Green
}
Write-Host ""

# Check SMART Status
Write-Host "SMART Status" -ForegroundColor Yellow
$smartData = Get-PhysicalDisk | Get-StorageReliabilityCounter -ErrorAction SilentlyContinue

if ($smartData) {
    $smartData | Select-Object DeviceId, Temperature, Wear, ReadErrorsTotal, WriteErrorsTotal | Format-Table -AutoSize
} else {
    Write-Host "SMART data not available on this system" -ForegroundColor Yellow
}
Write-Host ""

# Check for bad blocks
Write-Host "[Checking for Bad Blocks...]" -ForegroundColor Yellow
$badBlocks = Get-EventLog -LogName System -Source "disk" -Newest 100 -ErrorAction SilentlyContinue | Where-Object {$_.Message -like "*bad block*"}

if ($badBlocks) {
    Write-Host "WARNING: Bad blocks detected!" -ForegroundColor Red
    Write-Host "Count: $($badBlocks.Count) bad block events in recent history" -ForegroundColor Red
    $badBlocks | Select-Object TimeGenerated, Message -First 5 | Format-List
} else {
    Write-Host "No bad blocks detected ✓" -ForegroundColor Green
}
Write-Host ""

# Recommendations
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "RECOMMENDATIONS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$hasIssues = $false

# Check C: drive space
$cDrive = Get-Volume -DriveLetter C
$cFreePercent = ($cDrive.SizeRemaining / $cDrive.Size) * 100

if ($cFreePercent -lt 10) {
    Write-Host "⚠ C: drive has less than 10% free space. Clean up disk!" -ForegroundColor Red
    $hasIssues = $true
} elseif ($cFreePercent -lt 20) {
    Write-Host "⚠ C: drive has less than 20% free space. Consider cleanup." -ForegroundColor Yellow
    $hasIssues = $true
}

# Check for unhealthy disks
$unhealthyDisks = Get-PhysicalDisk | Where-Object {$_.HealthStatus -ne "Healthy"}
if ($unhealthyDisks) {
    Write-Host "⚠ Unhealthy disk(s) detected! Consider backup and replacement!" -ForegroundColor Red
    $hasIssues = $true
}

# Check for bad blocks
if ($badBlocks) {
    Write-Host "⚠ Bad blocks detected. Run CHKDSK to mark them." -ForegroundColor Red
    Write-Host "  Command: chkdsk /F /R (as Administrator)" -ForegroundColor White
    $hasIssues = $true
}

if (-not $hasIssues) {
    Write-Host "✓ All disks appear healthy!" -ForegroundColor Green
    Write-Host "✓ No immediate action required." -ForegroundColor Green
}

Write-Host ""
Write-Host "Run this script regularly to monitor disk health." -ForegroundColor Cyan
Write-Host "For detailed SMART monitoring, consider installing CrystalDiskInfo." -ForegroundColor Cyan
