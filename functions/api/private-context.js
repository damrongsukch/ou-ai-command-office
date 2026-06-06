function getAccessEmail(request) {
  return request.headers.get("Cf-Access-Authenticated-User-Email");
}

function unauthorized() {
  return Response.json(
    { ok: false, error: "Cloudflare Access login is required." },
    { status: 401 }
  );
}

function missingPrivateDb() {
  return Response.json(
    {
      ok: false,
      error: "PRIVATE_DB is not configured.",
      phase: "backend_optional_d1",
      nextAction: "Create the D1 database and add the PRIVATE_DB binding before using private context storage.",
    },
    { status: 503 }
  );
}

export async function onRequestGet(context) {
  const email = getAccessEmail(context.request);
  if (!email) return unauthorized();
  if (!context.env.PRIVATE_DB) return missingPrivateDb();

  const rows = await context.env.PRIVATE_DB.prepare(
    "select key, value, updated_at from private_context order by updated_at desc limit 50"
  ).all();

  return Response.json({
    ok: true,
    user: email,
    items: rows.results || [],
  });
}

export async function onRequestPost(context) {
  const email = getAccessEmail(context.request);
  if (!email) return unauthorized();
  if (!context.env.PRIVATE_DB) return missingPrivateDb();

  const body = await context.request.json();
  if (!body.key || typeof body.value !== "string") {
    return Response.json(
      { ok: false, error: "Expected JSON body with key and string value." },
      { status: 400 }
    );
  }

  await context.env.PRIVATE_DB.prepare(
    "insert into private_context (key, value, updated_by) values (?, ?, ?) " +
      "on conflict(key) do update set value = excluded.value, updated_by = excluded.updated_by, updated_at = datetime('now')"
  )
    .bind(body.key, body.value, email)
    .run();

  return Response.json({ ok: true, key: body.key, updatedBy: email });
}
