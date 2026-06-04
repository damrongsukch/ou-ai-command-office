import { onRequestPost as handleCommandRequest } from "../command.js";

export async function onRequestGet() {
  return Response.json({
    ok: true,
    service: "Nova Telegram webhook",
    endpoint: "/api/telegram/webhook",
    commands: ["/start", "/whoami", "/nova <command>"],
    setup_required: ["set Telegram webhook", "set TELEGRAM_ALLOWED_CHAT_ID", "set TELEGRAM_WEBHOOK_SECRET"]
  });
}

function getMessage(update) {
  return update?.message || update?.edited_message || null;
}

function getText(message) {
  return typeof message?.text === "string" ? message.text.trim() : "";
}

function isAllowedChat(chatId, env) {
  const allowed = String(env.TELEGRAM_ALLOWED_CHAT_ID || "").trim();
  return Boolean(allowed) && String(chatId) === allowed;
}

function formatCommandResult(result) {
  const log = result.logEntry || {};
  const output = String(result.output || "").slice(0, 2400);
  return [
    `Nova Chief - ${result.mode}`,
    "",
    `Owner: ${result.route?.agentName || "Nova Chief"}`,
    `Room: ${result.route?.room || "Command Room"}`,
    `Save to: ${result.route?.saveTo || log.google_drive_path || "00_Command_Center/Daily Brief/"}`,
    `Priority: ${log.priority || "pending"}`,
    `Assigned: ${(log.assigned_agents || []).join(", ") || "Nova Chief"}`,
    `Log file: ${log.suggested_log_file || "pending"}`,
    "",
    output,
    "",
    "Next: Review in Dashboard, approve, then save final output to Drive."
  ].join("\n");
}

async function sendTelegramMessage(env, chatId, text) {
  if (!env.TELEGRAM_BOT_TOKEN) {
    return {
      ok: false,
      directReply: {
        method: "sendMessage",
        chat_id: chatId,
        text: text.slice(0, 3900),
        disable_web_page_preview: true
      },
      description: "Missing TELEGRAM_BOT_TOKEN; use webhook direct reply."
    };
  }

  const response = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: text.slice(0, 3900),
      disable_web_page_preview: true
    })
  });

  return response.json().catch(() => ({ ok: false, description: `Telegram returned ${response.status}` }));
}

function telegramDirectReply(chatId, text) {
  return Response.json({
    method: "sendMessage",
    chat_id: chatId,
    text: text.slice(0, 3900),
    disable_web_page_preview: true
  });
}

async function replyToTelegram(env, chatId, text) {
  const result = await sendTelegramMessage(env, chatId, text);
  if (result.directReply) return telegramDirectReply(chatId, text);
  return Response.json({ ok: true, telegram: result.ok === true });
}

async function runNovaCommand(command, env) {
  const request = new Request("https://ou-ai-command-office.local/api/command", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      command,
      agent: "Nova Chief"
    })
  });

  const response = await handleCommandRequest({ request, env });
  return response.json();
}

export async function onRequestPost(context) {
  let update;
  try {
    update = await context.request.json();
  } catch {
    return Response.json({ ok: false, error: "Expected Telegram update JSON." }, { status: 400 });
  }

  const secret = context.env.TELEGRAM_WEBHOOK_SECRET;
  if (secret) {
    const receivedSecret = context.request.headers.get("X-Telegram-Bot-Api-Secret-Token");
    if (receivedSecret !== secret) {
      return Response.json({ ok: false, error: "Unauthorized webhook." }, { status: 401 });
    }
  }

  const message = getMessage(update);
  const chatId = message?.chat?.id;
  const text = getText(message);

  if (!chatId) {
    return Response.json({ ok: true, ignored: "No chat id." });
  }

  if (text === "/start") {
    return replyToTelegram(context.env, chatId, "Nova Chief is online. Send /whoami first, then set TELEGRAM_ALLOWED_CHAT_ID in Cloudflare before using commands.");
  }

  if (text === "/whoami") {
    return replyToTelegram(context.env, chatId, `Your Telegram chat id is: ${chatId}`);
  }

  if (!isAllowedChat(chatId, context.env)) {
    return replyToTelegram(context.env, chatId, "This Nova Chief bot is locked. Ask Ou to add this chat id to TELEGRAM_ALLOWED_CHAT_ID.");
  }

  if (!text) {
    return replyToTelegram(context.env, chatId, "Please send a text command. File/audio handling will be added later.");
  }

  const command = text.startsWith("/nova") ? text.replace(/^\/nova\s*/i, "").trim() : text;
  if (!command) {
    return replyToTelegram(context.env, chatId, "Send /nova followed by your command, or send the command directly.");
  }

  const result = await runNovaCommand(command, context.env);
  return replyToTelegram(context.env, chatId, formatCommandResult(result));
}
