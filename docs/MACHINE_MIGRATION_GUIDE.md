# Ou AI Command Office - Machine Migration Guide

Last reviewed: 2026-07-02

This document is the restore and handoff guide for moving Ou AI Command Office to another Windows computer. It intentionally contains no API keys, bot tokens, chat IDs, customer data, family data, or other private values.

## 1. Current System

- Repository: `https://github.com/damrongsukch/ou-ai-command-office`
- Main branch: `main`
- Production: `https://ou-ai-command-office-ceo.pages.dev/`
- Cloudflare Pages project: `ou-ai-command-office`
- GitHub Pages fallback: `https://damrongsukch.github.io/ou-ai-command-office/`
- Local Obsidian vault default: `C:\Obsidian_Ou_Vault`
- Private business files: Google Drive vault, not GitHub

The Cloudflare deployment is the real application because it can run Pages Functions. GitHub Pages is a static fallback and cannot run `/api/command`.

## 2. Architecture

```text
Browser / Telegram
        |
        v
Cloudflare Pages + Pages Functions
        |
        +-- Nova routing and QC
        +-- OpenRouter / OpenAI / Workers AI
        +-- Portfolio Monitor Google Sheet snapshot
        +-- Optional Telegram webhook
        |
        v
Manual approval -> Google Drive private vault
```

Local Obsidian sync exports only approved public-safe notes to `data/obsidian_knowledge.json`. Real private data must not be committed or displayed by the public dashboard.

## 3. What GitHub Contains

- UI: `index.html`, `team.html`, `knowledge.html`, `tasks.html`, `workflow.html`, `ui-polish.css`
- Backend: `functions/api/`
- Agent definitions and mock/public-safe data: `data/`
- Agent prompts: `prompts/`
- Operating documentation: `docs/`
- Public visual assets: `assets/`
- Obsidian sync tools: `scripts/sync-obsidian.ps1`, `sync-obsidian.cmd`
- Optional D1 schema: `migrations/0001_private_context.sql`

## 4. What Is Not in GitHub

- `.dev.vars` and all real API keys
- `.wrangler/`, `dist/`, `node_modules/`
- `private_context/`
- Real customer, portfolio export, family, astrology, and confidential files
- Google Drive authentication or private Drive file contents
- Cloudflare account login session

These must be transferred separately and securely. Never send them through GitHub or place them in this guide.

## 5. New Computer Prerequisites

Install:

1. Git for Windows
2. Node.js LTS (includes `npm` and `npx`)
3. A code editor or Codex desktop
4. Google Drive for Desktop if local Drive access is needed
5. Obsidian if the knowledge vault is used

Verify:

```powershell
git --version
node --version
npx.cmd wrangler --version
```

## 6. Clone and Restore

```powershell
cd "$env:USERPROFILE\OneDrive\Desktop\Projects"
git clone https://github.com/damrongsukch/ou-ai-command-office.git
cd ou-ai-command-office
git switch main
git pull origin main
```

Create local secrets from the safe template:

```powershell
Copy-Item .dev.vars.example .dev.vars
```

Open `.dev.vars` and insert the real values from the password manager or secure backup. Do not copy `.dev.vars` into Git.

## 7. Required Secret Names

Cloudflare production currently uses these encrypted secret names:

- `OPENAI_API_KEY`
- `OPENROUTER_API_KEY`
- `OPENROUTER_MODEL`
- `TELEGRAM_ALLOWED_CHAT_ID`
- `TELEGRAM_BOT_TOKEN`

Recommended but not yet confirmed in production:

- `TELEGRAM_WEBHOOK_SECRET`

Optional configuration:

- `OPENAI_MODEL`
- `APP_MODE`

List secret names without revealing values:

```powershell
npx.cmd wrangler pages secret list --project-name ou-ai-command-office
```

Add or rotate one secret:

```powershell
npx.cmd wrangler pages secret put SECRET_NAME --project-name ou-ai-command-office
```

## 8. Cloudflare Login and Local Run

Login on the new computer:

```powershell
npx.cmd wrangler login
```

Run the full app locally, including Pages Functions:

```powershell
npx.cmd wrangler pages dev . --port 8789
```

Open:

`http://127.0.0.1:8789/`

Opening `index.html` directly only tests the static UI; it does not fully test Nova backend behavior.

## 9. Validation Checklist

Run the automated check:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\project-health-check.ps1
```

Then test manually:

1. Dashboard loads and office image appears.
2. Team, Knowledge, Tasks, and Workflow routes open.
3. Ask Nova: `เช็คพอร์ตวันนี้`.
4. Confirm Agent is Atlas Invest.
5. Confirm Source is `Live Google Sheet / My Portfolio Monitor 2026`.
6. Confirm output contains KPI, holdings, target gap, signal, and RSI.
7. Test Telegram with `/start`, `/whoami`, and one Nova command.
8. Confirm private data is not visible in the public dashboard.

Health endpoint:

`https://ou-ai-command-office-ceo.pages.dev/api/health`

## 10. Deploy

Only deploy reviewed changes:

```powershell
git status --short
git add <reviewed-files>
git commit -m "Describe the change"
git push origin main
npx.cmd wrangler pages deploy . --project-name ou-ai-command-office --branch main
```

After deployment, open the production URL with a cache-busting query, for example:

`https://ou-ai-command-office-ceo.pages.dev/?v=<git-short-sha>`

## 11. Obsidian Restore

The sync script expects:

`C:\Obsidian_Ou_Vault\AI Office`

If the vault is stored elsewhere, pass `-VaultPath` explicitly:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\sync-obsidian.ps1 -Direction Both -VaultPath "D:\MyVault"
```

Always dry-run first:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\sync-obsidian.ps1 -Direction Both -DryRun
```

Only approved public-safe folders are exported. Review `data/obsidian_knowledge.json` before commit/deploy.

## 12. Google Drive Restore

Google Drive remains the private data vault. Reconnect Google Drive for Desktop or use the Drive web interface. Confirm these top-level folders still exist:

- `00_Command_Center`
- `02_Sales_ProXES`
- `04_Investment`
- `05_Documents_Studio`
- `06_Life_Astrology`
- `99_Archive`

The dashboard currently suggests Drive paths but does not perform authenticated automatic Drive writes. Save approved outputs manually until OAuth/Drive API integration is implemented.

## 13. Telegram Restore

Follow `docs/telegram_nova_setup.md`. The bot token and allowed chat ID must remain Cloudflare secrets. Set a new `TELEGRAM_WEBHOOK_SECRET`, then reset the Telegram webhook with the same secret token.

Do not paste the bot token into source files, screenshots, issue comments, or migration documents.

## 14. Known Limitations at Review Date

- `PRIVATE_DB` is optional and not currently bound; private D1 context is disabled.
- Google Drive save is still manual.
- Telegram production is missing a confirmed `TELEGRAM_WEBHOOK_SECRET`.
- GitHub Pages is static fallback only.
- Portfolio allocation comes from the configured Google Sheet; live market timing remains a separate check.
- The repository includes several large historical/reference images; they are valid but make the clone larger.
- The project has no package test runner; validation uses syntax, JSON, route, API, and browser checks.

## 15. Secure Backup Checklist

Keep these outside GitHub:

- Password-manager entries for OpenAI, OpenRouter, Telegram, GitHub, and Cloudflare
- Google Drive vault access
- Obsidian vault backup
- A secure copy of `.dev.vars` only if a password manager is not available
- Cloudflare account recovery codes

Before retiring the old computer:

1. Confirm all code is pushed to `main`.
2. Confirm Google Drive sync is complete.
3. Confirm Obsidian vault backup is complete.
4. Confirm secret values are recoverable from a secure store.
5. Run `scripts/project-health-check.ps1` on the new computer.
6. Test production and Telegram before deleting anything from the old computer.
