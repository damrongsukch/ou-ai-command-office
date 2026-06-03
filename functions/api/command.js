const AGENT_RULES = {
  chief: {
    name: "Chief of Staff",
    route: "Command Room",
    saveTo: "00_Command_Center/Daily Brief/",
    sections: ["Daily Summary", "Top 3 Priorities", "Waiting Items", "Risk Watch", "Recommended Actions"]
  },
  asm: {
    name: "ASM Sales Agent",
    route: "Sales Room",
    saveTo: "02_Sales_ProXES/Visit Briefs/",
    sections: ["Customer Snapshot", "Objective", "Opportunity", "Product Fit", "Next Action"]
  },
  follow: {
    name: "Customer Follow-up",
    route: "Sales Room",
    saveTo: "02_Sales_ProXES/Follow-up Emails/",
    sections: ["Customer Context", "Open Items", "Email Draft", "Salesforce Update", "Follow-up Date"]
  },
  portfolio: {
    name: "Portfolio Agent",
    route: "Portfolio Room",
    saveTo: "04_Investment/DCA Logs/",
    sections: ["Portfolio Truth Source", "Allocation Gap", "Timing Lens", "Buy / Wait / Hold Cash", "Risk Note"]
  },
  document: {
    name: "Document Studio",
    route: "Document Studio",
    saveTo: "05_Documents_Studio/",
    sections: ["Requirement Summary", "Layout Plan", "Draft Output", "Quality Check", "Revision Notes"]
  },
  life: {
    name: "Life & Balance",
    route: "Life Room",
    saveTo: "06_Life_Astrology/Daily Reading/",
    sections: ["Overall Energy", "Work", "Family", "Money", "Timing", "Practical Action"]
  },
  memory: {
    name: "Memory Steward",
    route: "Data Vault",
    saveTo: "99_Archive/",
    sections: ["Public vs Private", "Correct Folder", "File Name", "Do-not-commit Check", "Next Storage Action"]
  }
};

function inferAgent(command = "", requestedAgent = "") {
  const value = `${requestedAgent} ${command}`.toLowerCase();
  if (value.includes("portfolio") || value.includes("dca") || value.includes("allocation")) return "portfolio";
  if (value.includes("follow") || value.includes("email") || value.includes("salesforce")) return "follow";
  if (value.includes("weekly") || value.includes("visit") || value.includes("proposal")) return "asm";
  if (value.includes("document") || value.includes("pdf") || value.includes("excel") || value.includes("review")) return "document";
  if (value.includes("life") || value.includes("family") || value.includes("astrology")) return "life";
  if (value.includes("drive") || value.includes("memory") || value.includes("private")) return "memory";
  return "chief";
}

function buildMockOutput(command, agent) {
  return [
    `Mock backend response from ${agent.name}.`,
    "",
    "Status: backend mock only. No OpenAI API call yet.",
    "What happened:",
    "- Command was received by /api/command.",
    `- Work was routed to ${agent.route}.`,
    `- Suggested Drive folder is ${agent.saveTo}.`,
    "- Ou still gives final approval before real use.",
    "",
    "Draft output structure:",
    ...agent.sections.map((section, index) => `${index + 1}. ${section}: draft placeholder for "${command.slice(0, 90)}"`),
    "",
    "Next backend phase:",
    "- Add OpenAI API server-side.",
    "- Add approval endpoint.",
    "- Add Google Drive save after approval."
  ].join("\n");
}

export async function onRequestPost(context) {
  let body;
  try {
    body = await context.request.json();
  } catch {
    return Response.json({ ok: false, error: "Expected JSON body." }, { status: 400 });
  }

  const command = typeof body.command === "string" ? body.command.trim() : "";
  if (!command) {
    return Response.json({ ok: false, error: "Command is required." }, { status: 400 });
  }

  const agentId = inferAgent(command, body.agent);
  const agent = AGENT_RULES[agentId];
  const now = new Date().toISOString();

  return Response.json({
    ok: true,
    mode: "mock",
    receivedAt: now,
    command,
    route: {
      agentId,
      agentName: agent.name,
      room: agent.route,
      saveTo: agent.saveTo
    },
    output: buildMockOutput(command, agent),
    nextActions: [
      "Review the mock output in the dashboard.",
      "Mark Approved or Saved only after Ou confirms.",
      "Do not use this as a real AI answer until OpenAI backend is enabled."
    ]
  });
}
