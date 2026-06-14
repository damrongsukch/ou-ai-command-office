param(
  [string]$VaultPath = 'C:\Obsidian_Ou_Vault',
  [int]$IntervalSeconds = 15
)

$ErrorActionPreference = 'Stop'
$RepoPath = Split-Path -Parent $PSScriptRoot
$SyncScript = Join-Path $PSScriptRoot 'sync-obsidian.ps1'
$VaultAiOffice = Join-Path $VaultPath 'AI Office'
$StatePath = Join-Path $env:TEMP 'ou-ai-office-obsidian-sync.state'
$LogPath = Join-Path $env:TEMP 'ou-ai-office-obsidian-sync.log'
$WatchedRepoFolders = @('prompts', 'docs', 'data')
$WatchedVaultFolders = @('Agents', 'Knowledge', 'Operations', 'Prompts', 'Reference')

function Get-LatestWriteTicks {
  $files = @()
  foreach ($folder in $WatchedRepoFolders) {
    $path = Join-Path $RepoPath $folder
    if (Test-Path -LiteralPath $path) {
      $files += Get-ChildItem -LiteralPath $path -Recurse -File | Where-Object {
        $_.Name -notin @('obsidian_knowledge.json', 'obsidian_sync_manifest.json')
      }
    }
  }
  foreach ($folder in $WatchedVaultFolders) {
    $path = Join-Path $VaultAiOffice $folder
    if (Test-Path -LiteralPath $path) {
      $files += Get-ChildItem -LiteralPath $path -Recurse -File -Filter '*.md'
    }
  }
  if (-not $files) { return 0 }
  return ($files | Measure-Object -Property LastWriteTimeUtc -Maximum).Maximum.Ticks
}

$lastTicks = Get-LatestWriteTicks
[IO.File]::WriteAllText($StatePath, [string]$lastTicks)
Add-Content -LiteralPath $LogPath -Value "$(Get-Date -Format o) watcher started"

while ($true) {
  Start-Sleep -Seconds $IntervalSeconds
  $currentTicks = Get-LatestWriteTicks
  if ($currentTicks -le $lastTicks) { continue }
  try {
    & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $SyncScript -Direction Both | Out-Null
    $lastTicks = Get-LatestWriteTicks
    [IO.File]::WriteAllText($StatePath, [string]$lastTicks)
    Add-Content -LiteralPath $LogPath -Value "$(Get-Date -Format o) sync completed"
  } catch {
    Add-Content -LiteralPath $LogPath -Value "$(Get-Date -Format o) sync failed: $($_.Exception.Message)"
  }
}
