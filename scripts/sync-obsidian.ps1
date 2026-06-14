param(
  [ValidateSet('Both', 'RepoToVault', 'VaultToRepo')]
  [string]$Direction = 'Both',
  [string]$VaultPath = 'C:\Obsidian_Ou_Vault',
  [switch]$DryRun
)

$ErrorActionPreference = 'Stop'
$RepoPath = Split-Path -Parent $PSScriptRoot
$VaultAiOffice = Join-Path $VaultPath 'AI Office'
$ExportPath = Join-Path $RepoPath 'data\obsidian_knowledge.json'
$ManifestPath = Join-Path $RepoPath 'data\obsidian_sync_manifest.json'
$Utf8NoBom = New-Object System.Text.UTF8Encoding($false)

if (-not (Test-Path -LiteralPath $VaultAiOffice)) {
  throw "AI Office vault not found: $VaultAiOffice"
}

function Copy-PublicFile {
  param([string]$Source, [string]$Destination)
  if (-not (Test-Path -LiteralPath $Source)) { return }
  if ($DryRun) {
    Write-Output "DRY RUN copy: $Source -> $Destination"
    return
  }
  $destinationDirectory = Split-Path -Parent $Destination
  New-Item -ItemType Directory -Force -Path $destinationDirectory | Out-Null
  Copy-Item -LiteralPath $Source -Destination $Destination -Force
}

function Sync-RepoToVault {
  $mappings = @(
    @{ Source = 'prompts'; Destination = 'Prompts'; Filter = '*.md' },
    @{ Source = 'docs'; Destination = 'Reference'; Filter = '*.md' },
    @{ Source = 'data'; Destination = 'Source Data'; Filter = '*.json' },
    @{ Source = 'data'; Destination = 'Source Data'; Filter = '*.md' },
    @{ Source = 'data'; Destination = 'Source Data'; Filter = '*.csv' }
  )

  foreach ($mapping in $mappings) {
    $sourceDirectory = Join-Path $RepoPath $mapping.Source
    $destinationDirectory = Join-Path $VaultAiOffice $mapping.Destination
    Get-ChildItem -LiteralPath $sourceDirectory -File -Filter $mapping.Filter | Where-Object {
      $_.Name -notin @('obsidian_knowledge.json', 'obsidian_sync_manifest.json')
    } | ForEach-Object {
      Copy-PublicFile $_.FullName (Join-Path $destinationDirectory $_.Name)
    }
  }
}

function Remove-Frontmatter {
  param([string]$Content)
  return [regex]::Replace($Content, '^---\s*\r?\n.*?\r?\n---\s*\r?\n', '', 'Singleline')
}

function Convert-Wikilinks {
  param([string]$Content)
  return [regex]::Replace($Content, '\[\[([^\]|]+)(?:\|([^\]]+))?\]\]', {
    param($match)
    if ($match.Groups[2].Success) { return $match.Groups[2].Value }
    return [IO.Path]::GetFileName($match.Groups[1].Value)
  })
}

function Get-Summary {
  param([string]$Content)
  $plain = Remove-Frontmatter $Content
  $plain = Convert-Wikilinks $plain
  $plain = [regex]::Replace($plain, '```.*?```', ' ', 'Singleline')
  $plain = [regex]::Replace($plain, '[#>*_`|\[\]()-]', ' ')
  $plain = [regex]::Replace($plain, '\s+', ' ').Trim()
  if ($plain.Length -gt 240) { return $plain.Substring(0, 237) + '...' }
  return $plain
}

function Sync-VaultToRepo {
  $allowedFolders = @('Agents', 'Knowledge', 'Operations', 'Prompts', 'Reference')
  $excludedNames = @('Task Board.md', 'Today Dashboard.md', 'Decision Log.md', 'Output Index.md')
  $notes = foreach ($folder in $allowedFolders) {
    $folderPath = Join-Path $VaultAiOffice $folder
    if (-not (Test-Path -LiteralPath $folderPath)) { continue }
    Get-ChildItem -LiteralPath $folderPath -Recurse -File -Filter '*.md' | Where-Object {
      $_.Name -notin $excludedNames
    } | ForEach-Object {
      $content = [IO.File]::ReadAllText($_.FullName)
      $relativePath = $_.FullName.Substring($VaultPath.Length + 1).Replace('\', '/')
      $titleMatch = [regex]::Match($content, '(?m)^#\s+(.+)$')
      $tagsMatch = [regex]::Match($content, '(?m)^tags:\s*\[([^\]]*)\]')
      $tags = if ($tagsMatch.Success) {
        @($tagsMatch.Groups[1].Value.Split(',') | ForEach-Object { $_.Trim() } | Where-Object { $_ })
      } else { @() }
      [ordered]@{
        id = $relativePath.ToLowerInvariant().Replace(' ', '-').Replace('/', '--').Replace('.md', '')
        title = if ($titleMatch.Success) { $titleMatch.Groups[1].Value.Trim() } else { $_.BaseName }
        section = $folder
        summary = Get-Summary $content
        tags = $tags
        vault_path = $relativePath
        source = 'Obsidian_Ou_Vault'
        modified_utc = $_.LastWriteTimeUtc.ToString('o')
      }
    }
  }

  $payload = [ordered]@{
    version = 'obsidian_sync_v1'
    generated_utc = [DateTime]::UtcNow.ToString('o')
    privacy = 'Public-safe notes only. Inbox, daily notes, tasks, decisions, outputs, attachments, archive, and private data are excluded.'
    count = @($notes).Count
    notes = @($notes | Sort-Object section, title)
  }

  $json = $payload | ConvertTo-Json -Depth 8
  if ($DryRun) {
    Write-Output "DRY RUN export $($payload.count) notes -> $ExportPath"
  } else {
    [IO.File]::WriteAllText($ExportPath, $json, $Utf8NoBom)
  }
}

if ($Direction -in @('Both', 'RepoToVault')) { Sync-RepoToVault }
if ($Direction -in @('Both', 'VaultToRepo')) { Sync-VaultToRepo }

$manifest = [ordered]@{
  version = 'obsidian_sync_v1'
  synced_utc = [DateTime]::UtcNow.ToString('o')
  direction = $Direction
  vault_path = $VaultPath
  repo_path = $RepoPath
  dry_run = [bool]$DryRun
}

if (-not $DryRun) {
  [IO.File]::WriteAllText($ManifestPath, ($manifest | ConvertTo-Json -Depth 4), $Utf8NoBom)
}

Write-Output "Obsidian sync completed: $Direction"
