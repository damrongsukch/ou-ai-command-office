import { onRequestPost as handleCommandRequest } from "../command.js";

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
    return { ok: false, description: "Missing TELEGRAM_BOT_TOKEN" };
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
    await sendTelegramMessage(context.env, chatId, "Nova Chief is online. Send /whoami first, then set TELEGRAM_ALLOWED_CHAT_ID in Cloudflare before using commands.");
    return Response.json({ ok: true });
  }

  if (text === "/whoami") {
    await sendTelegramMessage(context.env, chatId, `Your Telegram chat id is: ${chatId}`);
    return Response.json({ ok: true, chatId });
  }

  if (!isAllowedChat(chatId, context.env)) {
    await sendTelegramMessage(context.env, chatId, "This Nova Chief bot is locked. Ask Ou to add this chat id to TELEGRAM_ALLOWED_CHAT_ID.");
    return Response.json({ ok: true, locked: true });
  }

  if (!text) {
    await sendTelegramMessage(context.env, chatId, "Please send a text command. File/audio handling will be added later.");
    return Response.json({ ok: true, ignored: "No text command." });
  }

  const command = text.startsWith("/nova") ? text.replace(/^\/nova\s*/i, "").trim() : text;
  if (!command) {
    await sendTelegramMessage(context.env, chatId, "Send /nova followed by your command, or send the command directly.");
    return Response.json({ ok: true });
  }

  const result = await runNovaCommand(command, context.env);
  await sendTelegramMessage(context.env, chatId, formatCommandResult(result));

  return Response.json({
    ok: true,
    mode: result.mode,
    route: result.route,
    logEntry: result.logEntry
  });
}
