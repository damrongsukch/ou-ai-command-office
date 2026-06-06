function json(data, init = {}) {
  return Response.json(data, {
    ...init,
    headers: {
      "Cache-Control": "no-store",
      ...(init.headers || {}),
    },
  });
}

function slug(text = "") {
  return String(text)
    .replace(/&/g, "and")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 56) || "nova-command";
}

export async function onRequestPost(context) {
  let body;
  try {
    body = await context.request.json();
  } catch {
    return json({ ok: false, error: "Expected JSON body." }, { status: 400 });
  }

  const title = String(body.title || body.command || "Nova command").trim();
  const route = body.route || {};
  const now = new Date().toISOString();
  const date = now.slice(0, 10);
  const status = body.status === "saved" ? "saved_to_drive_pending_manual_confirmation" : "approved_pending_drive_save";
  const saveTo = String(route.saveTo || body.saveTo || "00_Command_Center/Daily Brief/");
  const outputFile = `${date}_${slug(route.agentName || "Nova-Chief")}_${slug(title)}.md`;
  const logFile = `${date}_COMMAND_LOG_${slug(title)}.json`;

  return json({
    ok: true,
    mode: "manual_approval_v1",
    approvedAt: now,
    status,
    owner: "Nova Chief",
    saveTo,
    suggestedOutputFile: outputFile,
    suggestedLogFile: logFile,
    driveAutomation: false,
    message: "Approval captured for the MVP flow. Save to Google Drive is still manual until Drive OAuth/API is connected.",
    nextActions: [
      "Copy or export the final output.",
      `Save it to Google Drive folder: ${saveTo}`,
      `Use suggested file name: ${outputFile}`,
      `Store the log metadata as: ${logFile}`,
    ],
  });
}
