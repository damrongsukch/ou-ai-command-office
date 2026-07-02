param(
  [switch]$SkipProduction
)

$ErrorActionPreference = 'Stop'
$RepoPath = Split-Path -Parent $PSScriptRoot
Set-Location $RepoPath
$failures = [System.Collections.Generic.List[string]]::new()

function Check($Label, [scriptblock]$Action) {
  try {
    & $Action
    Write-Host "[PASS] $Label" -ForegroundColor Green
  } catch {
    $failures.Add("$Label - $($_.Exception.Message)")
    Write-Host "[FAIL] $Label - $($_.Exception.Message)" -ForegroundColor Red
  }
}

Check 'Required project files' {
  @('index.html', 'team.html', 'knowledge.html', 'tasks.html', 'workflow.html', 'wrangler.toml', 'README.md') | ForEach-Object {
    if (-not (Test-Path -LiteralPath $_)) { throw "Missing $_" }
  }
}

Check 'JSON files parse' {
  Get-ChildItem -Recurse -File -Filter '*.json' | Where-Object {
    $_.FullName -notmatch '\\.git\\|\\.wrangler\\|\\dist\\'
  } | ForEach-Object {
    Get-Content $_.FullName -Raw | ConvertFrom-Json | Out-Null
  }
}

Check 'JavaScript syntax' {
  @(
    'app.js',
    'functions/api/command.js',
    'functions/api/approve.js',
    'functions/api/health.js',
    'functions/api/private-context.js',
    'functions/api/telegram/webhook.js'
  ) | ForEach-Object {
    & node --check $_
    if ($LASTEXITCODE -ne 0) { throw "Syntax check failed: $_" }
  }
}

Check 'Private files ignored by Git' {
  @('.dev.vars', '.wrangler/check.tmp', 'dist/check.tmp', 'private_context/check.tmp') | ForEach-Object {
    & git check-ignore $_ | Out-Null
    if ($LASTEXITCODE -ne 0) { throw "Not ignored: $_" }
  }
}

Check 'No tracked secret files' {
  $tracked = @(& git ls-files .dev.vars .env secrets.json private_context)
  if ($tracked.Count -gt 0) { throw "Tracked private files: $($tracked -join ', ')" }
}

if (-not $SkipProduction) {
  Check 'Production routes' {
    @('', 'team', 'knowledge', 'tasks', 'workflow', 'api/health') | ForEach-Object {
      $url = "https://ou-ai-command-office-ceo.pages.dev/$_"
      $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 30
      if ($response.StatusCode -ne 200) { throw "$url returned $($response.StatusCode)" }
    }
  }
}

if ($failures.Count -gt 0) {
  Write-Host "`nProject health check failed ($($failures.Count))." -ForegroundColor Red
  $failures | ForEach-Object { Write-Host "- $_" }
  exit 1
}

Write-Host "`nProject health check passed." -ForegroundColor Green
