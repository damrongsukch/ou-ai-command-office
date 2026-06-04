# Ou AI Command Office

Static MVP v1 dashboard plus Cloudflare backend mock/AI-ready routing for Ou Personal Agent Office.

Live preview:

- Primary Cloudflare dashboard: https://ou-ai-command-office-ceo.pages.dev/
- GitHub Pages fallback: https://damrongsukch.github.io/ou-ai-command-office/

## Purpose

This project turns the Master Blueprint into a first usable AI office dashboard with rooms, agents, prompt templates, mock tasks, workflow rules, and public-safe data.

The MVP v1 goal is simple:

- GitHub stores system structure, code, dashboard, prompts, schemas, and mock data.
- Google Drive stores real files, real customer data, documents, portfolio exports, private context, and final outputs.
- ChatGPT is the daily command/work interface.
- Codex builds and fixes the GitHub dashboard.

## MVP v1 Scope

- Static dashboard only
- HTML, CSS, JavaScript only
- Local JSON / Markdown mock data
- Five main rooms: Command, Sales, Portfolio, Document Studio, Life
- Agent cards, task queue, recent outputs, prompt templates, and workflow rules
- Mobile responsive command-office UI
- No real private, customer, financial, family, astrology, or confidential data

## Out of Scope for v1

- No login system
- No database server
- No browser-side OpenAI API calls; AI calls run server-side only through Cloudflare Pages Functions when `OPENAI_API_KEY` is configured
- No calendar/email integration
- No real stock price API
- No automatic email sending
- No real Google Drive sync
- No real multi-agent backend

## Folder Structure

- `index.html` - main command-office dashboard
- `team.html` - agent team photo-card guide with roles, skills, and pipelines, served as `/team` on Cloudflare Pages
- `styles.css` - simple fallback/static dashboard styles
- `app.js` - simple fallback/static dashboard interactions
- `assets/` - public-safe visual assets
- `data/agents.json` - agent definitions and output formats
- `data/tasks.json` - public-safe mock task queue
- `data/workflows.json` - command routing, operating model, Drive rules
- `data/audit_log_schema.json` - Nova activity log metadata schema
- `data/recent_outputs.json` - public-safe mock output history
- `data/google_drive_structure.md` - recommended private Drive folder structure
- `data/ou_profile.md` - public-safe mock Ou profile
- `data/portfolio_plan.json` - mock portfolio rules only
- `data/customer_crm.csv` - mock customer data only
- `prompts/` - reusable agent prompt templates
- `prompts/nova_orchestration_system.md` - core Nova Chief orchestration system prompt
- `docs/nova_orchestration_sop.md` - SOP for Nova Chief, sub agents, QC, Drive storage, and audit logging
- `docs/telegram_nova_setup.md` - Telegram command inbox setup for Nova Chief
- `outputs/` - placeholder for generated public-safe examples
- `private_context.example/` - placeholder templates only
- `private_context/` - local only, ignored by git

## Privacy Rule

Do not commit real private data.

The dashboard must not display real `private_context` data. Use only mock data or private-safe summaries unless Ou explicitly opens real files locally.

If a file contains real customer, financial, family, astrology, portfolio, or confidential business information, store it in Google Drive only.

## Google Drive Operating Model

Recommended root folder:

`Ou AI Command Office - Private Data Vault`

Use Google Drive for:

- Real ProXES files
- Real meeting notes
- Real customer data
- Proposal / quotation / report files
- Portfolio exports
- Family and astrology context
- Final generated PDF / Word / Excel / PowerPoint outputs

MVP v1 uses manual save/upload to Drive. Do not auto-sync private Drive content into GitHub Pages.

## Google Drive Integration Roadmap

## Telegram Command Inbox

Telegram can send mobile commands to Nova through:

`/api/telegram/webhook`

Required Cloudflare secrets:

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_ALLOWED_CHAT_ID`
- `TELEGRAM_WEBHOOK_SECRET`

Security rule: do not commit bot tokens or real Telegram chat IDs unless they are intentionally public-safe examples. See `docs/telegram_nova_setup.md`.

Level 1 - Manual vault, current MVP:

- Agent output is drafted in ChatGPT or the dashboard prompt panel.
- Ou reviews and approves the output.
- Ou saves the final file as `.md`, `.docx`, `.pdf`, `.xlsx`, or `.pptx`.
- Ou uploads/moves it into the correct Google Drive folder.
- GitHub keeps only mock data and public-safe templates.

Level 2 - Google Apps Script helper:

- Create a private Google Sheet or Apps Script inside the Drive vault.
- Add simple buttons or forms for saving task logs, meeting summaries, and output links.
- Dashboard can keep a public-safe link checklist, but real file contents stay in Drive.

Level 3 - Drive API backend:

- Add OAuth login and a backend such as Cloudflare Workers, Apps Script Web App, or another private server.
- Store Drive file IDs, folder IDs, and output metadata.
- Read/write real Drive files only after Ou signs in.
- Never expose real private Drive data through public GitHub Pages.

## How to Command Agents

Default command flow:

`Ou command -> Chief of Staff -> Specialist Agent -> Quality Gate -> Ou approval -> Save output`

Best command formula:

`[Agent] + [work needed] + [supporting context] + [desired output format] + [deadline or next action]`

Example:

```text
Chief of Staff,
prepare today's Morning Engine for Ou.
Use ProXES follow-ups, pending documents, portfolio check, and life reminders.
Output Top 3 priorities, task list, risk, and finish-before-6 PM plan.
```

## Start

Open `index.html` in a browser, use the Cloudflare Pages URL for AI backend testing, or use the GitHub Pages URL for static fallback mode.

For the public dashboard, use mock data only. For real work, provide the required source truth in the command or attach it in a private workflow, then save final approved outputs manually to Google Drive.

## Cloudflare Backend

`functions/api/command.js` is the first backend step.

Cloudflare Pages deployment:

- Production dashboard: https://ou-ai-command-office-ceo.pages.dev/
- Command endpoint: https://ou-ai-command-office-ceo.pages.dev/api/command

- It receives dashboard commands through `POST /api/command`.
- It routes the command to the right agent room.
- It calls the OpenAI Responses API server-side when `OPENAI_API_KEY` is configured.
- It falls back to public-safe mock output if OpenAI is not configured or the API call fails.
- It does not read or write Google Drive.
- It does not store private data.
- It must never expose `private_context` data in the UI.

GitHub Pages cannot run this backend function, so the dashboard falls back to local/manual mode there. Cloudflare Pages or `wrangler pages dev` can run the `/api/command` endpoint.

Next backend phases:

1. Add approval status endpoint.
2. Add private task/output database.
3. Add Google Drive save after Ou approval.
4. Add optional calendar/email connectors after privacy rules are settled.
