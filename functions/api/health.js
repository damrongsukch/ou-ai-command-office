export async function onRequestGet(context) {
  const dbReady = Boolean(context.env.PRIVATE_DB);

  return Response.json({
    ok: true,
    app: "ou-ai-command-office",
    mode: context.env.APP_MODE || "unknown",
    commandApiReady: true,
    telegramWebhookReady: Boolean(context.env.TELEGRAM_BOT_TOKEN),
    openAiReady: Boolean(context.env.OPENAI_API_KEY),
    privateDbBound: dbReady,
    privateDbMode: dbReady ? "enabled" : "optional_not_configured",
  });
}
