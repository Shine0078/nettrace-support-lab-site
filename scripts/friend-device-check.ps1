<#
.SYNOPSIS
    Runs a consent-based, read-only NetTrace capability check on a Windows device.

.DESCRIPTION
    This script collects only high-level tool availability and localhost health.
    It does not collect usernames, hostnames, MAC addresses, private IP addresses,
    DNS servers, gateways, credentials, browser data, files, or raw logs. It does
    not contact a public destination or change system configuration.

.PARAMETER AcceptTerms
    Confirms that the device owner reviewed the script and consents to the checks.

.PARAMETER OutputPath
    Optional path for the sanitized JSON file. The path is not stored in the JSON.

.EXIT CODES
    0 = required checks passed
    1 = one or more required checks failed
    2 = consent declined or output could not be written
#>

[CmdletBinding()]
param(
    [switch]$AcceptTerms,
    [string]$OutputPath
)

$ErrorActionPreference = 'Stop'

if (-not $AcceptTerms) {
    Write-Host 'NetTrace Device Check — consent required' -ForegroundColor Cyan
    Write-Host 'This performs read-only local checks and writes sanitized JSON.'
    Write-Host 'It does not upload data, scan the internet, or change settings.'
    $answer = Read-Host 'Type YES to continue'
    if ($answer -cne 'YES') {
        Write-Output 'Consent was not granted. No checks were run.'
        exit 2
    }
}

$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
if ([string]::IsNullOrWhiteSpace($OutputPath)) {
    $OutputPath = Join-Path (Get-Location) "nettrace-device-results-$timestamp.json"
}

function New-Result {
    param(
        [string]$Id,
        [string]$Name,
        [string]$Category,
        [ValidateSet('PASS', 'FAIL', 'OBSERVED', 'WARN')][string]$Status,
        [string]$Detail,
        [bool]$Required = $true
    )
    [pscustomobject]@{
        id       = $Id
        name     = $Name
        category = $Category
        status   = $Status
        detail   = $Detail
        required = $Required
    }
}

function Get-CommandVersion {
    param([string]$Name, [string[]]$Arguments)
    $command = Get-Command $Name -ErrorAction SilentlyContinue
    if (-not $command) { return $null }
    try {
        $value = (& $command.Source @Arguments 2>&1 | Select-Object -First 1).ToString().Trim()
        if ($LASTEXITCODE -ne 0 -and $null -ne $LASTEXITCODE) { return $null }
        return $value
    }
    catch { return $null }
}

$checks = [System.Collections.Generic.List[object]]::new()
$environment = [System.Collections.Generic.List[object]]::new()

try {
    $os = Get-CimInstance Win32_OperatingSystem
    $environment.Add([pscustomobject]@{
        name   = 'Windows'
        value  = "$($os.Caption) • build $($os.BuildNumber) • $($os.OSArchitecture)"
        status = 'OBSERVED'
    })
    $checks.Add((New-Result -Id 'windows-query' -Name 'Windows information query' -Category 'Environment' -Status 'PASS' -Detail 'Operating-system version and architecture were read successfully.'))
}
catch {
    $checks.Add((New-Result -Id 'windows-query' -Name 'Windows information query' -Category 'Environment' -Status 'FAIL' -Detail 'Windows version could not be queried.'))
}

$environment.Add([pscustomobject]@{
    name   = 'PowerShell'
    value  = $PSVersionTable.PSVersion.ToString()
    status = 'PASS'
})
$checks.Add((New-Result -Id 'powershell' -Name 'PowerShell available' -Category 'Tools' -Status 'PASS' -Detail "PowerShell $($PSVersionTable.PSVersion) is running."))

$gitVersion = Get-CommandVersion -Name 'git' -Arguments @('--version')
$checks.Add((New-Result -Id 'git' -Name 'Git available' -Category 'Tools' -Status $(if ($gitVersion) { 'PASS' } else { 'FAIL' }) -Detail $(if ($gitVersion) { $gitVersion } else { 'Git was not found on PATH.' })))
if ($gitVersion) { $environment.Add([pscustomobject]@{ name = 'Git'; value = $gitVersion; status = 'PASS' }) }

$codeVersion = Get-CommandVersion -Name 'code' -Arguments @('--version')
$checks.Add((New-Result -Id 'vscode' -Name 'VS Code available' -Category 'Tools' -Status $(if ($codeVersion) { 'PASS' } else { 'WARN' }) -Detail $(if ($codeVersion) { "VS Code $codeVersion" } else { 'VS Code was not found on PATH.' }) -Required $false))

$pythonVersion = Get-CommandVersion -Name 'py' -Arguments @('-3', '--version')
if (-not $pythonVersion) { $pythonVersion = Get-CommandVersion -Name 'python' -Arguments @('--version') }
$checks.Add((New-Result -Id 'python' -Name 'Python available' -Category 'Tools' -Status $(if ($pythonVersion) { 'PASS' } else { 'FAIL' }) -Detail $(if ($pythonVersion) { $pythonVersion } else { 'Python 3 was not found.' })))
if ($pythonVersion) { $environment.Add([pscustomobject]@{ name = 'Python'; value = $pythonVersion; status = 'PASS' }) }

$wslCommand = Get-Command wsl -ErrorAction SilentlyContinue
if ($wslCommand) {
    & $wslCommand.Source --status *> $null
    $wslReady = $LASTEXITCODE -eq 0
    $ubuntuInstalled = $false
    if ($wslReady) {
        $distributionNames = @(& $wslCommand.Source -l -q 2>$null)
        $ubuntuInstalled = $distributionNames -contains 'Ubuntu'
    }
    $checks.Add((New-Result -Id 'wsl' -Name 'WSL2 available' -Category 'Linux' -Status $(if ($wslReady) { 'PASS' } else { 'FAIL' }) -Detail $(if ($wslReady) { 'WSL responded successfully; distribution names were not stored.' } else { 'WSL did not respond successfully.' })))
    $checks.Add((New-Result -Id 'ubuntu' -Name 'Ubuntu distribution available' -Category 'Linux' -Status $(if ($ubuntuInstalled) { 'PASS' } else { 'WARN' }) -Detail $(if ($ubuntuInstalled) { 'Ubuntu is registered in WSL.' } else { 'Ubuntu was not detected.' }) -Required $false))
}
else {
    $checks.Add((New-Result -Id 'wsl' -Name 'WSL2 available' -Category 'Linux' -Status 'FAIL' -Detail 'The WSL command was not found.'))
    $checks.Add((New-Result -Id 'ubuntu' -Name 'Ubuntu distribution available' -Category 'Linux' -Status 'WARN' -Detail 'Ubuntu could not be checked without WSL.' -Required $false))
}

try {
    $loopback = Test-Connection -TargetName '127.0.0.1' -Count 2 -Quiet
    $checks.Add((New-Result -Id 'loopback' -Name 'IPv4 loopback' -Category 'Networking' -Status $(if ($loopback) { 'PASS' } else { 'FAIL' }) -Detail $(if ($loopback) { '127.0.0.1 replied locally.' } else { '127.0.0.1 did not reply.' })))
}
catch {
    $checks.Add((New-Result -Id 'loopback' -Name 'IPv4 loopback' -Category 'Networking' -Status 'FAIL' -Detail 'The loopback check raised an error.'))
}

try {
    $upCount = @(Get-NetAdapter -ErrorAction Stop | Where-Object Status -eq 'Up').Count
    $checks.Add((New-Result -Id 'adapter-count' -Name 'Active adapter query' -Category 'Networking' -Status 'PASS' -Detail "$upCount active adapter(s) detected; names and addresses were not stored."))
}
catch {
    $checks.Add((New-Result -Id 'adapter-count' -Name 'Active adapter query' -Category 'Networking' -Status 'WARN' -Detail 'Adapter count was unavailable; no network configuration was changed.' -Required $false))
}

try {
    $listenerCount = @(Get-NetTCPConnection -State Listen -ErrorAction Stop).Count
    $checks.Add((New-Result -Id 'listener-count' -Name 'Listening socket query' -Category 'Services' -Status 'PASS' -Detail "$listenerCount TCP listener(s) detected; ports, addresses, and process IDs were not stored."))
}
catch {
    $checks.Add((New-Result -Id 'listener-count' -Name 'Listening socket query' -Category 'Services' -Status 'WARN' -Detail 'Listening socket count was unavailable.' -Required $false))
}

$identity = [Security.Principal.WindowsIdentity]::GetCurrent()
$principal = [Security.Principal.WindowsPrincipal]::new($identity)
$isAdministrator = $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
$checks.Add((New-Result -Id 'least-privilege' -Name 'Least-privilege execution' -Category 'Security' -Status $(if ($isAdministrator) { 'WARN' } else { 'PASS' }) -Detail $(if ($isAdministrator) { 'The checker is running elevated; elevation is not required.' } else { 'The checker is running without administrator privileges.' }) -Required $false))

$requiredFailures = @($checks | Where-Object { $_.required -and $_.status -eq 'FAIL' }).Count
$overall = if ($requiredFailures -eq 0) { 'PASS' } else { 'FAIL' }
$payload = [ordered]@{
    schemaVersion = 'nettrace-device-check-v1'
    generatedAt   = (Get-Date).ToString('o')
    consent       = $true
    scope         = 'Read-only Windows capability and localhost checks; no upload or public network test'
    overallStatus = $overall
    summary       = [ordered]@{
        passed   = @($checks | Where-Object status -eq 'PASS').Count
        warnings = @($checks | Where-Object status -eq 'WARN').Count
        failed   = @($checks | Where-Object status -eq 'FAIL').Count
    }
    environment   = $environment
    checks        = $checks
    privacy       = [ordered]@{
        uploaded                   = $false
        publicNetworkContacted     = $false
        settingsChanged            = $false
        usernameStored             = $false
        hostnameStored             = $false
        networkAddressesStored     = $false
        credentialsOrFilesCollected = $false
    }
}

try {
    $resolvedOutput = [System.IO.Path]::GetFullPath($OutputPath)
    $parent = Split-Path -Parent $resolvedOutput
    if ($parent) { New-Item -ItemType Directory -Path $parent -Force | Out-Null }
    $payload | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $resolvedOutput -Encoding UTF8
    Write-Output "Sanitized results: $resolvedOutput"
    Write-Output "Overall status: $overall"
}
catch {
    Write-Error "Unable to write the sanitized results file: $($_.Exception.Message)"
    exit 2
}

if ($overall -eq 'PASS') { exit 0 }
exit 1
