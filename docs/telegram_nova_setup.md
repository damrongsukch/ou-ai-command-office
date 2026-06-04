# Telegram Command Inbox Setup

Telegram can be used as a fast mobile command inbox for Nova Chief.

Flow:

Ou Telegram Message -> Telegram Bot -> Cloudflare Pages Function -> Nova `/api/command` -> Telegram Reply -> Dashboard Audit Log

## Security Rules

- Never commit `TELEGRAM_BOT_TOKEN` to GitHub.
- Store `TELEGRAM_BOT_TOKEN` only as a Cloudflare Pages secret.
- Set `TELEGRAM_ALLOWED_CHAT_ID` so only Ou's chat can run commands.
- Use `TELEGRAM_WEBHOOK_SECRET` so Telegram webhook calls can be verified.
- If a token was pasted into chat or shared by mistake, revoke it in BotFather and generate a new one.

## Cloudflare Secrets

Set these in Cloudflare Pages project settings:

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_ALLOWED_CHAT_ID`
- `TELEGRAM_WEBHOOK_SECRET`

Optional:

- `OPENAI_API_KEY`
- `OPENAI_MODEL`

## Endpoint

Webhook endpoint:

`https://ou-ai-command-office-ceo.pages.dev/api/telegram/webhook`

## First Use

1. Add the Telegram bot.
2. Send `/start`.
3. Send `/whoami`.
4. Copy the returned chat id.
5. Add that value to Cloudflare Pages as `TELEGRAM_ALLOWED_CHAT_ID`.
6. Set the webhook with the token and secret.

## Set Webhook

Use Telegram's `setWebhook` method with:

- `url`: `https://ou-ai-command-office-ceo.pages.dev/api/telegram/webhook`
- `secret_token`: the same value stored in `TELEGRAM_WEBHOOK_SECRET`
- `allowed_updates`: `["message", "edited_message"]`

Do not put the real token into repo files.

## Example Commands

```text
Nova Chief, prepare Morning Engine today.
```

```text
/nova route a customer follow-up to Mina Care and Ace Sales
```

```text
Atlas Invest, prepare DCA decision using allocation truth first.
```

## Current MVP Limits

- Text messages only.
- No file/audio/photo handling yet.
- Google Drive save is still manual.
- Production AI requires `OPENAI_API_KEY` to be configured in Cloudflare.
