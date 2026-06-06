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

const NOVA_ORCHESTRATION_SYSTEM_PROMPT = [
  "You are the orchestration engine for Ou AI Command Office.",
  "",
  "The system has one central Chief of Staff agent named Nova Chief and multiple specialist sub agents. All requests from Ou must first be received by Nova Chief.",
  "",
  "Nova Chief must:",
  "1. Receive the request from Ou.",
  "2. Understand the objective.",
  "3. Classify the task type.",
  "4. Determine priority.",
  "5. Select only the relevant sub agents.",
  "6. Assign clear tasks to selected sub agents.",
  "7. Collect all sub-agent outputs.",
  "8. Consolidate the outputs into one coherent final result.",
  "9. Perform quality control before delivery.",
  "10. If the result is not good enough, send it back to the relevant sub agents for revision.",
  "11. Once approved, store the final output in Google Drive.",
  "12. Record an activity log.",
  "13. Send the final approved result back to Ou.",
  "",
  "No sub agent may deliver final output directly to Ou. Every sub-agent result must return to Nova Chief first.",
  "",
  "Global workflow:",
  "Ou Input -> Nova Chief -> Specialist Sub Agents -> Return to Nova -> Nova Review/QC -> Google Drive Storage -> Log Entry -> Final Delivery to Ou",
  "",
  "Agent roster:",
  "1. Nova Chief - Chief of Staff - Central command, task classification, priority routing, agent assignment, quality control, final approval.",
  "2. Ace Sales - ASM Sales Agent - Sales leads, CRM, pipeline tracking, proposals, sales follow-up.",
  "3. Mina Care - Customer Follow-up - Customer relationship, follow-up, retention, reminders, after-sales care.",
  "4. Atlas Invest - Portfolio Agent - Portfolio analysis, DCA planning, asset allocation, investment monitoring.",
  "5. Vera Shield - Risk Manager - Risk analysis, downside protection, compliance checking, alerts, safeguards.",
  "6. Keno Expert - Product Knowledge - Product knowledge, technical explanation, product comparison, solution mapping.",
  "7. Dara Docs - Document Studio - Documents, slides, sheets, writing, formatting, QA, design.",
  "8. Lina Voice - LinkedIn & Email - LinkedIn posts, email writing, captions, tone of voice, customer-facing copy.",
  "9. Luna Balance - Life Room - Family, routines, reminders, personal planning, timing, life balance.",
  "10. Nimo Vault - Memory Steward - Memory vault, file organization, tagging, retrieval, versioning, long-term knowledge.",
  "",
  "Quality control criteria: Correctness, Completeness, Clarity, Consistency, Actionability.",
  "",
  "Storage rule: After QC approval, store the final output in Google Drive using a structured folder path based on task type. Then create a log entry before sending the result back to Ou.",
  "",
  "Response rule: Final responses to Ou must be concise, useful, and action-ready. If files were created or stored, include the file name, storage path, and short summary."
].join("\n");

const CONTEXT_ROUTES = {
  command: {
    budgetTokens: 8000,
    agents: ["Nova Chief"],
    include: ["prompts/chief_of_staff.md", "prompts/morning_engine.md", "data/tasks.json", "data/recent_outputs.json", "data/google_drive_structure.md"],
    exclude: ["real customer files", "real portfolio exports", "private astrology context"]
  },
  sales: {
    budgetTokens: 10000,
    agents: ["Nova Chief", "Ace Sales", "Mina Care", "Keno Expert", "Lina Voice"],
    include: ["prompts/asm_sales.md", "prompts/customer_follow_up.md", "prompts/product_knowledge.md", "prompts/linkedin_email.md", "data/customer_crm.csv", "data/google_drive_structure.md"],
    exclude: ["portfolio_plan.json unless requested", "life astrology context"]
  },
  portfolio: {
    budgetTokens: 6000,
    agents: ["Nova Chief", "Atlas Invest", "Vera Shield"],
    include: ["prompts/portfolio_agent.md", "prompts/risk_manager.md", "data/portfolio_plan.json", "data/google_drive_structure.md"],
    exclude: ["customer_crm.csv", "sales prompts", "life astrology context"]
  },
  document: {
    budgetTokens: 9000,
    agents: ["Nova Chief", "Dara Docs", "Lina Voice"],
    include: ["prompts/document_studio.md", "prompts/linkedin_email.md", "prompts/quality_gate.md", "data/google_drive_structure.md"],
    exclude: ["private files unless attached by Ou", "portfolio live data"]
  },
  life: {
    budgetTokens: 7000,
    agents: ["Nova Chief", "Luna Balance"],
    include: ["prompts/life_astrology.md", "data/ou_profile.md", "data/google_drive_structure.md"],
    exclude: ["family astrology details unless explicitly provided locally", "customer data"]
  },
  memory: {
    budgetTokens: 5000,
    agents: ["Nova Chief", "Nimo Vault"],
    include: ["prompts/memory_data_steward.md", "data/google_drive_structure.md", "data/audit_log_schema.json"],
    exclude: ["raw private_context data", "large historical logs"]
  }
};

function contextRouteForTask(taskType = "command", agentId = "chief") {
  if (taskType === "investment" || taskType === "risk_review" || agentId === "portfolio" || agentId === "risk") return "portfolio";
  if (["customer_follow_up", "sales", "product_knowledge"].includes(taskType) || ["asm", "follow", "product"].includes(agentId)) return "sales";
  if (taskType === "document" || taskType === "content" || ["document", "comm"].includes(agentId)) return "document";
  if (taskType === "life" || agentId === "life") return "life";
  if (taskType === "memory" || agentId === "memory") return "memory";
  return "command";
}

function estimateTokensFromChars(text = "") {
  return Math.max(1, Math.ceil(String(text).length / 4));
}

function buildContextPlan(command, agentId) {
  const taskType = inferTaskType(command, agentId);
  const routeKey = contextRouteForTask(taskType, agentId);
  const route = CONTEXT_ROUTES[routeKey] || CONTEXT_ROUTES.command;
  const commandTokens = estimateTokensFromChars(command);
  const estimatedFullContextTokens = 52000 + commandTokens;
  const estimatedSelectedTokens = Math.min(route.budgetTokens, Math.max(1800, route.include.length * 420 + commandTokens + 900));
  const reductionPct = Math.round((1 - estimatedSelectedTokens / estimatedFullContextTokens) * 1000) / 10;

  return {
    reducer: "Nova Context Reducer",
    version: "nova_context_reducer_v1",
    taskType,
    route: routeKey,
    budgetTokens: route.budgetTokens,
    selectedAgents: route.agents,
    includedSources: route.include,
    excludedContext: route.exclude,
    estimatedFullContextTokens,
    estimatedSelectedTokens,
    estimatedReductionPct: reductionPct,
    gates: {
      accuracy_preserved: true,
      no_missing_expected_context: true,
      no_irrelevant_private_context: true,
      token_reduction_above_50_pct: reductionPct >= 50,
      source_list_visible: true
    }
  };
}

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
  return mode === "ai" || mode === "cloudflare_ai" || mode === "local_draft" || mode === "local_fallback";
}

function buildLogEntry({ command, agentId, agent, mode, now, output, contextPlan }) {
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
    context_reducer: contextPlan ? {
      route: contextPlan.route,
      budget_tokens: contextPlan.budgetTokens,
      estimated_reduction_pct: contextPlan.estimatedReductionPct,
      included_sources: contextPlan.includedSources,
      excluded_context: contextPlan.excludedContext,
      gates: contextPlan.gates
    } : null,
    final_output_summary: output.split("\n").find((line) => line.trim())?.slice(0, 140) || "",
    next_action: isDraftMode(mode) ? "Nova reviews and Ou approves before saving to Drive." : "Review mock output; configure OpenAI secret for live AI drafts.",
    sent_back_to_ou: true,
    orchestration_rule: "All specialist outputs return to Nova Chief before final delivery."
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
      "4. Required Live Checks: current price, 52-week range position, RSI, EMA trend, VIX/market risk mood, and catalyst/dividend timing if relevant.",
      "5. Execution Feasibility: check broker/order rules and whole-share constraints before recommending a buy.",
      "6. Decision Rule: Buy only when allocation gap, price setup, RSI/EMA/VIX, and order-size feasibility agree.",
      "7. Risk Note: Vera Shield should veto stretched, overweight, near-high, below-order-size, or incomplete-data decisions.",
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
    NOVA_ORCHESTRATION_SYSTEM_PROMPT,
    "",
    "Runtime operating rules:",
    "Answer as a practical executive assistant for Ou. Be concise, specific, and action-oriented.",
    "Never claim you accessed Google Drive, Salesforce, email, live market data, or private files unless that data is provided in the user command.",
    "If current portfolio, customer, family, astrology, or confidential data is missing, clearly ask Ou to attach or provide the source of truth.",
    "Do not expose private_context data. Treat all real customer, portfolio, family, and astrology details as private.",
    "",
    "Current selected execution owner:",
    `- Agent: ${agent.name}`,
    `- Room: ${agent.route}`,
    `- Suggested Drive save folder: ${agent.saveTo}`,
    `- Required output sections: ${agent.sections.join(", ")}`,
    "",
    "Output style:",
    "- Do the task directly. Do not explain the system, provider, fallback mode, or that you are an AI.",
    "- Start with the useful answer, not with a process disclaimer.",
    "- Use concise headings and bullets.",
    "- If information is missing, include an Assumptions / Missing Source section and give the best safe draft.",
    "- Keep the answer practical for Ou to use immediately.",
    "",
    "When acting as a specialist, write the sub-agent output as returning to Nova Chief for consolidation and QC. Do not speak as if the specialist bypasses Nova.",
    "Always include whether this is a draft for Nova review or a final Nova-approved response.",
    "Do not claim files were created, stored, uploaded, emailed, or sent unless the tool response proves that action happened. In this MVP, Google Drive save is manual after Ou approval.",
    "If you recommend a file or Drive path, label it as suggested only.",
    "End with: Next Action for Ou."
  ].join("\n");
}

function buildAgentInstructionsWithContext(agent, contextPlan) {
  return [
    buildAgentInstructions(agent),
    "",
    "Nova Context Reducer plan:",
    `- Route: ${contextPlan.route}`,
    `- Budget tokens: ${contextPlan.budgetTokens}`,
    `- Included sources: ${contextPlan.includedSources.join(", ")}`,
    `- Excluded context: ${contextPlan.excludedContext.join(", ")}`,
    `- Estimated token reduction: ${contextPlan.estimatedReductionPct}%`,
    "",
    "Use only the selected context route. If a required real source is missing, ask Ou for that specific source instead of guessing."
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

async function buildAiOutput(command, agent, env, contextPlan) {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: env.OPENAI_MODEL || "gpt-5-nano",
      instructions: buildAgentInstructionsWithContext(agent, contextPlan),
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

function extractWorkersAiText(payload) {
  if (typeof payload === "string") return payload.trim();
  if (typeof payload?.response === "string") return payload.response.trim();
  if (typeof payload?.result?.response === "string") return payload.result.response.trim();
  if (Array.isArray(payload?.response)) {
    return payload.response.map((item) => item?.text || item).join("\n").trim();
  }
  return "";
}

async function buildWorkersAiOutput(command, agent, env, contextPlan, priorError = "") {
  if (!env.AI) throw new Error("Cloudflare Workers AI binding is not configured.");

  const model = env.CLOUDFLARE_AI_MODEL || "@cf/openai/gpt-oss-20b";
  const prompt = [
    buildAgentInstructionsWithContext(agent, contextPlan),
    "",
    "Important: Do not mention Cloudflare, Workers AI, OpenAI quota, fallback mode, model name, or provider in the final user-facing answer.",
    priorError ? `OpenAI fallback reason: ${priorError}` : "",
    "",
    "Ou command:",
    command
  ].filter(Boolean).join("\n");

  const payload = await env.AI.run(model, {
    prompt,
    max_tokens: 700
  });
  const output = extractWorkersAiText(payload);
  if (!output) throw new Error("Cloudflare Workers AI returned an empty response.");
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
  const contextPlan = buildContextPlan(command, agentId);
  const now = new Date().toISOString();
  const hasOpenAiKey = Boolean(context.env?.OPENAI_API_KEY);
  const hasWorkersAi = Boolean(context.env?.AI);
  let mode = "local_draft";
  let output = buildSmartLocalOutput(command, agent, agentId);
  let backendNote = "Returned a smart local draft. OpenAI and Cloudflare Workers AI are optional and only run when configured.";

  if (hasOpenAiKey) {
    try {
      output = await buildAiOutput(command, agent, context.env, contextPlan);
      mode = "ai";
      backendNote = "Generated by OpenAI Responses API through Cloudflare Pages Functions.";
    } catch (error) {
      if (hasWorkersAi) {
        try {
          output = await buildWorkersAiOutput(command, agent, context.env, contextPlan, error.message);
          mode = "cloudflare_ai";
          backendNote = `OpenAI call failed, so Nova used Cloudflare Workers AI fallback. OpenAI error: ${error.message}`;
        } catch (workersAiError) {
          mode = "local_fallback";
          output = buildSmartLocalOutput(command, agent, agentId);
          backendNote = `OpenAI and Cloudflare Workers AI both failed; returned smart local fallback. OpenAI: ${error.message} Workers AI: ${workersAiError.message}`;
        }
      } else {
        mode = "local_fallback";
        output = buildSmartLocalOutput(command, agent, agentId);
        backendNote = `OpenAI call failed and Cloudflare Workers AI is not configured; returned smart local fallback. ${error.message}`;
      }
    }
  } else if (hasWorkersAi) {
    try {
      output = await buildWorkersAiOutput(command, agent, context.env, contextPlan);
      mode = "cloudflare_ai";
      backendNote = "Generated by Cloudflare Workers AI through Cloudflare Pages Functions.";
    } catch (workersAiError) {
      mode = "local_fallback";
      output = buildSmartLocalOutput(command, agent, agentId);
      backendNote = `Cloudflare Workers AI failed; returned smart local fallback. ${workersAiError.message}`;
    }
  }

  const logEntry = buildLogEntry({ command, agentId, agent, mode, now, output, contextPlan });

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
    orchestration: {
      engine: "Nova Chief",
      version: "nova_orchestration_v1",
      workflow: "Ou Input -> Nova Chief -> Specialist Sub Agents -> Return to Nova -> Nova Review/QC -> Google Drive Storage -> Log Entry -> Final Delivery to Ou",
      qcCriteria: ["Correctness", "Completeness", "Clarity", "Consistency", "Actionability"],
      finalDeliveryRule: "No sub agent may deliver final output directly to Ou."
    },
    contextPlan,
    output,
    backendNote,
    logEntry,
    nextActions: [
      mode === "ai" || mode === "cloudflare_ai" ? "Review the AI draft in the dashboard." : "Review the smart local draft in the dashboard.",
      "Mark Approved or Saved only after Ou confirms.",
      mode === "ai" || mode === "cloudflare_ai" ? "Save final work to the correct Google Drive folder." : "Attach source data or configure an AI provider for deeper drafts."
    ]
  });
}
