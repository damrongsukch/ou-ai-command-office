const AGENT_RULES = {
  chief: {
    name: "Nova Chief",
    route: "Command Room",
    saveTo: "00_Command_Center/Daily Brief/",
    sections: ["Request Summary", "Task Type", "Priority", "Assigned Agents", "QC Result", "Final Response to Ou"]
  },
  asm: {
    name: "Ace Sales",
    route: "Sales Room",
    saveTo: "02_Sales_ProXES/Visit Briefs/",
    sections: ["Customer Snapshot", "Objective", "Opportunity", "Product Fit", "Next Action"]
  },
  follow: {
    name: "Mina Care",
    route: "Sales Room",
    saveTo: "02_Sales_ProXES/Follow-up Emails/",
    sections: ["Customer Context", "Open Items", "Email Draft", "Salesforce Update", "Follow-up Date"]
  },
  portfolio: {
    name: "Atlas Invest",
    route: "Portfolio Room",
    saveTo: "04_Investment/DCA Logs/",
    sections: ["Portfolio Truth Source", "Allocation Gap", "Timing Lens", "Buy / Wait / Hold Cash", "Risk Note"]
  },
  risk: {
    name: "Vera Shield",
    route: "Portfolio Room",
    saveTo: "04_Investment/Risk Notes/",
    sections: ["Risk Level", "Watchouts", "Avoid / Delay", "Mitigation", "Decision Owner"]
  },
  product: {
    name: "Keno Expert",
    route: "Sales Room",
    saveTo: "02_Sales_ProXES/Proposals/",
    sections: ["Product Fit", "Technical Notes", "Objection Handling", "Questions to Ask", "Proposal Inputs"]
  },
  document: {
    name: "Dara Docs",
    route: "Document Studio",
    saveTo: "05_Documents_Studio/",
    sections: ["Requirement Summary", "Layout Plan", "Draft Output", "Quality Check", "Revision Notes"]
  },
  comm: {
    name: "Lina Voice",
    route: "Document Studio",
    saveTo: "05_Documents_Studio/Templates/",
    sections: ["Purpose", "Audience", "Draft", "Tone Notes", "Risk / Approval Check", "Final Version"]
  },
  life: {
    name: "Luna Balance",
    route: "Life Room",
    saveTo: "06_Life_Astrology/Daily Reading/",
    sections: ["Overall Energy", "Work", "Family", "Money", "Timing", "Practical Action"]
  },
  memory: {
    name: "Nimo Vault",
    route: "Data Vault",
    saveTo: "99_Archive/",
    sections: ["Public vs Private", "Correct Folder", "File Name", "Do-not-commit Check", "Next Storage Action"]
  }
};

function inferAgent(command = "", requestedAgent = "") {
  const value = `${requestedAgent} ${command}`.toLowerCase();
  if (value.includes("nova") || value.includes("chief")) return "chief";
  if (value.includes("risk") || value.includes("vera") || value.includes("shield") || value.includes("downside")) return "risk";
  if (value.includes("product") || value.includes("technical") || value.includes("keno") || value.includes("solution")) return "product";
  if (value.includes("portfolio") || value.includes("dca") || value.includes("allocation") || value.includes("atlas")) return "portfolio";
  if (value.includes("follow") || value.includes("mina") || value.includes("salesforce")) return "follow";
  if (value.includes("linkedin") || value.includes("caption") || value.includes("lina") || value.includes("tone")) return "comm";
  if (value.includes("email") && !value.includes("follow")) return "comm";
  if (value.includes("weekly") || value.includes("visit") || value.includes("proposal") || value.includes("sales") || value.includes("ace")) return "asm";
  if (value.includes("document") || value.includes("dara") || value.includes("pdf") || value.includes("excel") || value.includes("review")) return "document";
  if (value.includes("life") || value.includes("luna") || value.includes("family") || value.includes("astrology")) return "life";
  if (value.includes("drive") || value.includes("memory") || value.includes("nimo") || value.includes("private") || value.includes("vault")) return "memory";
  return "chief";
}

function inferTaskType(command = "", agentId = "chief") {
  const value = command.toLowerCase();
  if (value.includes("dca") || value.includes("portfolio") || value.includes("allocation")) return "investment";
  if (value.includes("risk") || value.includes("downside") || agentId === "risk") return "risk_review";
  if (value.includes("follow") || value.includes("salesforce")) return "customer_follow_up";
  if (value.includes("sales") || value.includes("visit") || value.includes("proposal") || value.includes("weekly")) return "sales";
  if (value.includes("product") || value.includes("technical")) return "product_knowledge";
  if (value.includes("document") || value.includes("pdf") || value.includes("excel") || value.includes("ppt")) return "document";
  if (value.includes("linkedin") || value.includes("email") || value.includes("caption")) return "content";
  if (value.includes("life") || value.includes("family") || value.includes("astrology")) return "life";
  if (value.includes("drive") || value.includes("memory") || value.includes("vault")) return "memory";
  return agentId === "chief" ? "command" : AGENT_RULES[agentId].route.toLowerCase().replace(/\s+/g, "_");
}

function inferPriority(command = "") {
  const value = command.toLowerCase();
  if (value.includes("urgent") || value.includes("asap") || value.includes("today") || value.includes("critical")) return "urgent";
  if (value.includes("high") || value.includes("client") || value.includes("customer") || value.includes("proposal")) return "high";
  if (value.includes("weekly") || value.includes("review") || value.includes("plan")) return "medium";
  return "low";
}

function inferAssignedAgents(command = "", routedAgentId = "chief") {
  const value = command.toLowerCase();
  const selected = new Set();

  if (value.includes("sales") || value.includes("visit") || value.includes("proposal") || value.includes("weekly")) selected.add("asm");
  if (value.includes("follow") || value.includes("customer") || value.includes("salesforce")) selected.add("follow");
  if (value.includes("product") || value.includes("technical") || value.includes("solution")) selected.add("product");
  if (value.includes("portfolio") || value.includes("dca") || value.includes("allocation")) selected.add("portfolio");
  if (value.includes("risk") || value.includes("downside") || value.includes("shield")) selected.add("risk");
  if (value.includes("document") || value.includes("pdf") || value.includes("excel") || value.includes("ppt")) selected.add("document");
  if (value.includes("linkedin") || value.includes("email") || value.includes("caption") || value.includes("tone")) selected.add("comm");
  if (value.includes("life") || value.includes("family") || value.includes("astrology")) selected.add("life");
  if (value.includes("drive") || value.includes("memory") || value.includes("vault") || value.includes("log")) selected.add("memory");

  if (routedAgentId !== "chief") selected.add(routedAgentId);
  if (!selected.size) selected.add(routedAgentId);

  return Array.from(selected)
    .filter((id) => id !== "chief")
    .map((id) => AGENT_RULES[id]?.name)
    .filter(Boolean);
}

function slug(text = "") {
  return text
    .replace(/&/g, "and")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "command";
}

function buildLogEntry({ command, agentId, agent, mode, now, output }) {
  const date = now.slice(0, 10);
  const taskType = inferTaskType(command, agentId);
  const assignedAgents = inferAssignedAgents(command, agentId);
  const logTitle = command.slice(0, 72);

  return {
    date,
    request_from: "Ou",
    received_by: "Nova Chief",
    task_title: logTitle,
    task_type: taskType,
    priority: inferPriority(command),
    assigned_agents: assignedAgents,
    status: mode === "ai" ? "draft_ready" : "mock_ready",
    qc_status: "pending_review",
    google_drive_path: agent.saveTo,
    suggested_output_file: `${date}_${slug(agent.name)}_${slug(taskType)}.md`,
    suggested_log_file: `${date}_COMMAND_LOG_${slug(taskType)}.json`,
    final_output_summary: output.split("\n").find((line) => line.trim())?.slice(0, 140) || "",
    next_action: mode === "ai" ? "Nova reviews and Ou approves before saving to Drive." : "Review mock output; configure OpenAI secret for live AI drafts.",
    sent_back_to_ou: true
  };
}

function buildMockOutput(command, agent) {
  return [
    `Mock backend response from ${agent.name}.`,
    "",
    "Status: safe mock fallback. OpenAI runs only when the Cloudflare secret is configured and the API call succeeds.",
    "What happened:",
    "- Command was received by /api/command.",
    "- Nova Chief remains the final review/QC owner.",
    `- Work was routed to ${agent.route}.`,
    `- Suggested Drive folder is ${agent.saveTo}.`,
    "- Ou still gives final approval before real use.",
    "",
    "Draft output structure:",
    ...agent.sections.map((section, index) => `${index + 1}. ${section}: draft placeholder for "${command.slice(0, 90)}"`),
    "",
    "Next backend phase:",
    "- Add approval endpoint.",
    "- Add Google Drive save after approval."
  ].join("\n");
}

function buildAgentInstructions(agent) {
  return [
    "You are one agent inside Ou AI Command Office.",
    "Nova Chief is the single command center. All specialist outputs return to Nova for consolidation and QC before Ou receives the final result.",
    "Answer as a practical executive assistant for Ou. Be concise, specific, and action-oriented.",
    "Never claim you accessed Google Drive, Salesforce, email, live market data, or private files unless that data is provided in the user command.",
    "If current portfolio, customer, family, astrology, or confidential data is missing, clearly ask Ou to attach or provide the source of truth.",
    "Do not expose private_context data. Treat all real customer, portfolio, family, and astrology details as private.",
    `Agent: ${agent.name}`,
    `Room: ${agent.route}`,
    `Suggested Drive save folder: ${agent.saveTo}`,
    `Required output sections: ${agent.sections.join(", ")}`,
    "Always include whether this is a draft for Nova review or a final Nova-approved response.",
    "End with: Next Action for Ou."
  ].join("\n");
}

function extractResponseText(payload) {
  if (typeof payload?.output_text === "string" && payload.output_text.trim()) {
    return payload.output_text.trim();
  }

  const parts = [];
  for (const item of payload?.output || []) {
    for (const content of item?.content || []) {
      if (content?.type === "output_text" && typeof content.text === "string") {
        parts.push(content.text);
      }
    }
  }

  return parts.join("\n").trim();
}

async function buildAiOutput(command, agent, env) {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: env.OPENAI_MODEL || "gpt-4o-mini",
      instructions: buildAgentInstructions(agent),
      input: command,
      max_output_tokens: 900
    })
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}));
    const message = errorPayload?.error?.message || `OpenAI returned ${response.status}`;
    throw new Error(message);
  }

  const payload = await response.json();
  const output = extractResponseText(payload);
  if (!output) throw new Error("OpenAI returned an empty response.");
  return output;
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
  const hasOpenAiKey = Boolean(context.env?.OPENAI_API_KEY);
  let mode = "mock";
  let output = buildMockOutput(command, agent);
  let backendNote = "OpenAI key is not configured yet; returned mock output.";

  if (hasOpenAiKey) {
    try {
      output = await buildAiOutput(command, agent, context.env);
      mode = "ai";
      backendNote = "Generated by OpenAI Responses API through Cloudflare Pages Functions.";
    } catch (error) {
      mode = "mock_fallback";
      backendNote = `OpenAI call failed; returned mock output. ${error.message}`;
    }
  }

  const logEntry = buildLogEntry({ command, agentId, agent, mode, now, output });

  return Response.json({
    ok: true,
    mode,
    receivedAt: now,
    command,
    route: {
      agentId,
      agentName: agent.name,
      room: agent.route,
      saveTo: agent.saveTo
    },
    output,
    backendNote,
    logEntry,
    nextActions: [
      mode === "ai" ? "Review the AI draft in the dashboard." : "Review the mock output in the dashboard.",
      "Mark Approved or Saved only after Ou confirms.",
      mode === "ai" ? "Save final work to the correct Google Drive folder." : "Configure OPENAI_API_KEY in Cloudflare to enable real AI answers."
    ]
  });
}
