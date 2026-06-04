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

function isDraftMode(mode = "") {
  return mode === "ai" || mode === "local_draft" || mode === "local_fallback";
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
    status: isDraftMode(mode) ? "draft_ready" : "mock_ready",
    qc_status: "pending_review",
    google_drive_path: agent.saveTo,
    suggested_output_file: `${date}_${slug(agent.name)}_${slug(taskType)}.md`,
    suggested_log_file: `${date}_COMMAND_LOG_${slug(taskType)}.json`,
    final_output_summary: output.split("\n").find((line) => line.trim())?.slice(0, 140) || "",
    next_action: isDraftMode(mode) ? "Nova reviews and Ou approves before saving to Drive." : "Review mock output; configure OpenAI secret for live AI drafts.",
    sent_back_to_ou: true
  };
}

function hasAny(value = "", terms = []) {
  return terms.some((term) => value.includes(term));
}

function buildSmartLocalOutput(command, agent, agentId) {
  const value = command.toLowerCase();
  const taskType = inferTaskType(command, agentId);
  const priority = inferPriority(command);
  const assignedAgents = inferAssignedAgents(command, agentId);
  const assigned = assignedAgents.length ? assignedAgents.join(", ") : agent.name;

  if (command.trim().length < 8 || hasAny(value, ["hi", "hello", "test"]) && command.trim().length < 16) {
    return [
      "Nova Chief - Smart Local Draft",
      "",
      "I received your message, but it is too short to turn into a real task.",
      "",
      "Please send one clear command, for example:",
      "- Nova Chief, prepare Morning Engine today.",
      "- Ace Sales, prepare visit brief for [customer].",
      "- Mina Care, draft follow-up email for [customer].",
      "- Atlas Invest, prepare today's DCA decision using portfolio truth first.",
      "",
      "Next Action for Ou: send the task plus any source data or customer/portfolio context."
    ].join("\n");
  }

  const header = [
    `${agent.name} - Smart Local Draft`,
    "",
    `Room: ${agent.route}`,
    `Priority: ${priority}`,
    `Assigned agents: ${assigned}`,
    `Suggested Drive folder: ${agent.saveTo}`,
    "",
    `Request Summary: ${command}`
  ];

  if (hasAny(value, ["morning engine", "daily brief", "today", "วันนี้"])) {
    return [
      ...header,
      "",
      "Morning Engine Draft:",
      "1. Today Schedule: list fixed appointments, customer visits, calls, and personal constraints.",
      "2. Top 3 Priorities: choose only the three items that move sales, portfolio, or life balance forward today.",
      "3. Must-Win Follow-up: identify customer follow-ups that should not slip today.",
      "4. Push / Waiting Items: separate what Ou controls from what is waiting for others.",
      "5. Salesforce Actions: prepare visit note, opportunity update, next step, and follow-up date.",
      "6. Customer Risks / Blockers: flag missing information, delayed replies, pricing gaps, and proposal blockers.",
      "7. Critical Questions: prepare up to five questions Ou should answer before noon.",
      "8. Time-Blocked Plan: morning focus, afternoon customer work, evening review.",
      "9. Finish-Before-6 PM Plan: define the minimum useful finish line for today.",
      "",
      "Nova QC:",
      "- This is a local draft. It does not read calendar, Drive, Salesforce, or live data yet.",
      "- Attach today's schedule/customer notes for a sharper final brief.",
      "",
      "Next Action for Ou: send today's appointments and top pending customers, then Nova will turn this into a ready-to-use daily plan."
    ].join("\n");
  }

  if (taskType === "customer_follow_up") {
    return [
      ...header,
      "",
      "Customer Follow-up Workflow:",
      "1. Customer Context: confirm customer name, last discussion, decision maker, and open issue.",
      "2. Open Items: list what Ou owes, what customer owes, and what is waiting.",
      "3. Recommended Next Action: decide call, email, visit, proposal, or Salesforce update.",
      "4. Follow-up Email Draft: prepare a polite, concise email with clear next step.",
      "5. Salesforce Update: draft stage, next activity, due date, and note.",
      "",
      "Email Draft Skeleton:",
      "Subject: Follow-up on [topic / project]",
      "Dear [Name],",
      "Thank you for your time. I would like to follow up on [topic]. The next step from our side is [action]. Could you please confirm [question]?",
      "Best regards,",
      "Ou",
      "",
      "Nova QC: customer name, meeting note, and real deadline are missing unless included in the command.",
      "Next Action for Ou: send the customer name and latest meeting note."
    ].join("\n");
  }

  if (taskType === "investment" || agentId === "portfolio") {
    return [
      ...header,
      "",
      "Portfolio / DCA Workflow:",
      "1. Portfolio Truth Source: use portfolio_plan.json, dashboard export, or latest sheet as allocation truth first.",
      "2. Allocation Gap: compare current weight vs target weight before naming any buy.",
      "3. Timing Lens: check live market/chart separately after allocation truth is known.",
      "4. Decision Rule: Buy only when allocation gap, price setup, RSI/EMA/VIX, and order-size feasibility agree.",
      "5. Risk Note: Vera Shield should veto stretched, overweight, or incomplete-data decisions.",
      "",
      "Current Decision: WAIT FOR SOURCE TRUTH.",
      "Reason: this command did not include current holdings/allocation or live timing data.",
      "",
      "Next Action for Ou: attach portfolio_plan.json, dashboard screenshot/export, or today allocation table."
    ].join("\n");
  }

  if (taskType === "sales" || agentId === "asm") {
    return [
      ...header,
      "",
      "Sales Workflow Draft:",
      "1. Customer Snapshot: customer, industry, application, location, current status.",
      "2. Objective: define visit/proposal/follow-up goal.",
      "3. Opportunity: size, urgency, pain point, and decision path.",
      "4. Product Fit: involve Keno Expert if product or technical matching is needed.",
      "5. Next Action: prepare visit brief, email, proposal input, or weekly report section.",
      "",
      "Nova QC: customer context is required before this becomes customer-ready.",
      "Next Action for Ou: send customer name, project/application, and latest discussion."
    ].join("\n");
  }

  if (taskType === "document" || taskType === "content") {
    return [
      ...header,
      "",
      "Document / Content Workflow:",
      "1. Requirement Summary: identify output type, audience, language, size, and deadline.",
      "2. Structure Plan: outline sections, tables, visuals, and approval points.",
      "3. Draft: create text/layout/content first.",
      "4. Quality Check: verify spelling, spacing, tone, print readiness, and privacy.",
      "5. Revision Notes: list what Ou should confirm before final use.",
      "",
      "Nova QC: no real file is attached in this command, so this is a preparation workflow only.",
      "Next Action for Ou: attach the source file, image, PDF, Excel, or text to transform."
    ].join("\n");
  }

  if (taskType === "life") {
    return [
      ...header,
      "",
      "Life & Astrology Workflow:",
      "1. Overall Energy: summarize the planning lens for the day/week.",
      "2. Work & Career: connect advice to ProXES workload and decision timing.",
      "3. Money & Investment: use astrology only as mood/risk awareness, not as portfolio truth.",
      "4. Family & Relationship: define practical reminder or support action.",
      "5. Timing / Color / Element Support: provide if Ou asks for daily/weekly astrology.",
      "6. Confidence Note: astrology is a planning lens, not a replacement for real-world facts or Ou's final decision.",
      "",
      "Next Action for Ou: specify daily reading, weekly reading, timing, family plan, or reminder."
    ].join("\n");
  }

  if (taskType === "memory") {
    return [
      ...header,
      "",
      "Memory / Drive Storage Workflow:",
      "1. Classify Data: public-safe, private, customer, portfolio, family, astrology, or archive.",
      "2. Correct Folder: choose GitHub for code/mock/templates, Google Drive for real/private outputs.",
      "3. File Name: use date + room + clear task slug.",
      "4. Do-not-commit Check: never move private_context, real customer data, or real portfolio export into GitHub.",
      "5. Retrieval Note: add a short summary so Nova can find it later.",
      "",
      "Next Action for Ou: tell Nova what file/output should be stored and whether it is private."
    ].join("\n");
  }

  return [
    ...header,
    "",
    "Command Routing Draft:",
    "1. Nova Chief received the command.",
    `2. Task Type: ${taskType}`,
    `3. Main Owner: ${agent.name}`,
    `4. Sub Agents: ${assigned}`,
    "5. QC Gate: check correctness, completeness, clarity, privacy, and next action.",
    "6. Delivery: return final draft to Ou before saving or external use.",
    "",
    "Next Action for Ou: add source context, deadline, and desired output format so Nova can produce a useful final answer."
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
  let mode = "local_draft";
  let output = buildSmartLocalOutput(command, agent, agentId);
  let backendNote = "Returned a smart local draft. OpenAI is optional and only runs when the Cloudflare secret is configured and the API call succeeds.";

  if (hasOpenAiKey) {
    try {
      output = await buildAiOutput(command, agent, context.env);
      mode = "ai";
      backendNote = "Generated by OpenAI Responses API through Cloudflare Pages Functions.";
    } catch (error) {
      mode = "local_fallback";
      output = buildSmartLocalOutput(command, agent, agentId);
      backendNote = `OpenAI call failed; returned smart local fallback. ${error.message}`;
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
      mode === "ai" ? "Review the AI draft in the dashboard." : "Review the smart local draft in the dashboard.",
      "Mark Approved or Saved only after Ou confirms.",
      mode === "ai" ? "Save final work to the correct Google Drive folder." : "Attach source data or configure OPENAI_API_KEY for deeper AI-generated drafts."
    ]
  });
}
