# BSOD Fix Script - DATA_IN_PAGE_ERROR (0x0000007a)
# This script must be run as Administrator

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "BSOD Fix Script - DATA_IN_PAGE_ERROR" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "ERROR: This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "Please right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host "Running as Administrator ✓" -ForegroundColor Green
Write-Host ""

# Function to run command with status
function Run-RepairCommand {
    param($Name, $Command)
    Write-Host "[$Name] Starting..." -ForegroundColor Yellow
    $result = Invoke-Expression $Command
    Write-Host "[$Name] Completed ✓" -ForegroundColor Green
    Write-Host ""
    return $result
}

# 1. Create System Restore Point
Write-Host "[1/5] Creating System Restore Point..." -ForegroundColor Cyan
try {
    Enable-ComputerRestore -Drive "C:\"
    Checkpoint-Computer -Description "Before BSOD Fix" -RestorePointType "MODIFY_SETTINGS"
    Write-Host "System Restore Point created ✓" -ForegroundColor Green
} catch {
    Write-Host "Warning: Could not create restore point. Continuing..." -ForegroundColor Yellow
}
Write-Host ""

# 2. Run DISM to repair Windows image
Write-Host "[2/5] Running DISM - This may take 10-15 minutes..." -ForegroundColor Cyan
Write-Host "Checking component health..." -ForegroundColor Yellow
DISM /Online /Cleanup-Image /CheckHealth
Write-Host ""
Write-Host "Scanning for corruption..." -ForegroundColor Yellow
DISM /Online /Cleanup-Image /ScanHealth
Write-Host ""
Write-Host "Repairing Windows image..." -ForegroundColor Yellow
DISM /Online /Cleanup-Image /RestoreHealth
Write-Host "DISM completed ✓" -ForegroundColor Green
Write-Host ""

# 3. Run System File Checker
Write-Host "[3/5] Running System File Checker (SFC)..." -ForegroundColor Cyan
Write-Host "This may take 15-20 minutes..." -ForegroundColor Yellow
sfc /scannow
Write-Host "SFC completed ✓" -ForegroundColor Green
Write-Host ""

# 4. Check disk for bad sectors
Write-Host "[4/5] Scheduling Disk Checks..." -ForegroundColor Cyan
Write-Host "Scheduling CHKDSK for C: drive (will run on next reboot)..." -ForegroundColor Yellow
echo Y | chkdsk C: /F /R /X

Write-Host ""
Write-Host "Checking D: drive immediately..." -ForegroundColor Yellow
chkdsk D: /F /R
Write-Host "Disk checks scheduled/completed ✓" -ForegroundColor Green
Write-Host ""

# 5. Update Storage Drivers
Write-Host "[5/5] Checking for driver updates..." -ForegroundColor Cyan
Get-WmiObject Win32_PnPSignedDriver | Where-Object {$_.DeviceClass -eq "DiskDrive" -or $_.DeviceClass -eq "SCSIAdapter"} | Select-Object DeviceName, DriverVersion, DriverDate
Write-Host ""

# Final Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "REPAIR SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✓ System Restore Point created (if supported)" -ForegroundColor Green
Write-Host "✓ DISM repair completed" -ForegroundColor Green
Write-Host "✓ System File Checker completed" -ForegroundColor Green
Write-Host "✓ Disk checks scheduled" -ForegroundColor Green
Write-Host "✓ Driver information gathered" -ForegroundColor Green
Write-Host ""
Write-Host "NEXT STEPS:" -ForegroundColor Yellow
Write-Host "1. RESTART your computer to run the C: drive disk check" -ForegroundColor White
Write-Host "2. The disk check may take 30-60 minutes" -ForegroundColor White
Write-Host "3. After restart, monitor for any further BSOD errors" -ForegroundColor White
Write-Host "4. Consider backing up important data regularly" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to view detailed log locations..."
pause

Write-Host ""
Write-Host "Log locations:" -ForegroundColor Cyan
Write-Host "- DISM log: C:\Windows\Logs\DISM\dism.log" -ForegroundColor White
Write-Host "- SFC log: C:\Windows\Logs\CBS\CBS.log" -ForegroundColor White
Write-Host "- CHKDSK results: Event Viewer > Windows Logs > Application (Source: Chkdsk)" -ForegroundColor White
Write-Host ""
Write-Host "Would you like to restart now? (Y/N)" -ForegroundColor Yellow
$restart = Read-Host
if ($restart -eq "Y" -or $restart -eq "y") {
    Write-Host "Restarting in 10 seconds..." -ForegroundColor Yellow
    shutdown /r /t 10
} else {
    Write-Host "Please restart manually when ready." -ForegroundColor Yellow
}
