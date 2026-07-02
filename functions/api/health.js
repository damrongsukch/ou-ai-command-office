export async function onRequestGet(context) {
  const dbReady = Boolean(context.env.PRIVATE_DB);
  const telegramTokenReady = Boolean(context.env.TELEGRAM_BOT_TOKEN);
  const telegramChatLockReady = Boolean(context.env.TELEGRAM_ALLOWED_CHAT_ID);
  const telegramSecretReady = Boolean(context.env.TELEGRAM_WEBHOOK_SECRET);

  return Response.json({
    ok: true,
    app: "ou-ai-command-office",
    mode: context.env.APP_MODE || "unknown",
    commandApiReady: true,
    telegramWebhookReady: telegramTokenReady && telegramChatLockReady && telegramSecretReady,
    telegramTokenReady,
    telegramChatLockReady,
    telegramSecretReady,
    openRouterReady: Boolean(context.env.OPENROUTER_API_KEY),
    openAiReady: Boolean(context.env.OPENAI_API_KEY),
    workersAiReady: Boolean(context.env.AI),
    privateDbBound: dbReady,
    privateDbMode: dbReady ? "enabled" : "optional_not_configured",
  });
}
