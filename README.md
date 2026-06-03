# Ou AI Command Office

Static MVP v1 dashboard for Ou Personal Agent Office.

Live preview:

- GitHub Pages: https://damrongsukch.github.io/ou-ai-command-office/

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
- No OpenAI API integration
- No calendar/email integration
- No real stock price API
- No automatic email sending
- No real Google Drive sync
- No real multi-agent backend

## Folder Structure

- `index.html` - main command-office dashboard
- `styles.css` - simple fallback/static dashboard styles
- `app.js` - simple fallback/static dashboard interactions
- `assets/` - public-safe visual assets
- `data/agents.json` - agent definitions and output formats
- `data/tasks.json` - public-safe mock task queue
- `data/workflows.json` - command routing, operating model, Drive rules
- `data/recent_outputs.json` - public-safe mock output history
- `data/google_drive_structure.md` - recommended private Drive folder structure
- `data/ou_profile.md` - public-safe mock Ou profile
- `data/portfolio_plan.json` - mock portfolio rules only
- `data/customer_crm.csv` - mock customer data only
- `prompts/` - reusable agent prompt templates
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

Open `index.html` in a browser, or use the GitHub Pages URL after Pages is enabled.

For the public dashboard, use mock data only. For real work, copy the prompt template into ChatGPT, attach the real source files there if needed, then save final outputs manually to Google Drive.
