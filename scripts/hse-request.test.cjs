const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

const source = fs.readFileSync(path.join(__dirname, "../src/lib/requestHseDocuments.ts"), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const loaded = { exports: {} };
new Function("require", "module", "exports", compiled)(() => ({ supabase: {} }), loaded, loaded.exports);
const requestHseDocuments = loaded.exports.default;

function client({ user = { id: "client-1", email: "client@example.com", email_confirmed_at: "2026-01-01", user_metadata: { first_name: "Test", last_name: "Client", company: "Test Company" } }, authError = null, request = { id: "request-1", reference: "RFQ-0123" }, error = null } = {}) {
  const writes = [];
  return {
    writes,
    auth: { getUser: async () => ({ data: { user }, error: authError }) },
    from: (table) => ({ insert: (row) => {
      writes.push({ table, row });
      return { select: () => ({ single: async () => ({ data: request, error }) }) };
    } }),
  };
}

test("a signed-in request is saved in the existing admin pipeline and returns the actual reference", async () => {
  const backend = client();
  const result = await requestHseDocuments(backend);
  assert.deepEqual(result, { requiresSignIn: false, reference: "RFQ-0123" });
  assert.equal(backend.writes.length, 1);
  const { table, row } = backend.writes[0];
  assert.equal(table, "service_requests");
  assert.equal(row.user_id, "client-1");
  assert.equal(row.requester_name, "Test Client");
  assert.equal(row.company_name, "Test Company");
  assert.equal(row.category, "HSE Documentation");
  assert.match(row.requirements, /HSE, quality, product and supplier documentation/);
  assert.ok(row.location);
  assert.equal(row.urgency, "Medium");
});

test("signed-out visitors are sent to sign in without creating a request", async () => {
  const backend = client({ user: null, authError: { name: "AuthSessionMissingError", message: "Auth session missing!" } });
  assert.deepEqual(await requestHseDocuments(backend), { requiresSignIn: true });
  assert.equal(backend.writes.length, 0);
});

test("unverified accounts cannot submit a request", async () => {
  const backend = client({ user: { id: "client-1", user_metadata: {}, email_confirmed_at: null } });
  assert.deepEqual(await requestHseDocuments(backend), { requiresSignIn: true });
  assert.equal(backend.writes.length, 0);
});

test("authentication connection failures show an error without writing a request", async () => {
  const backend = client({ authError: { name: "AuthRetryableFetchError", message: "Connection interrupted" } });
  await assert.rejects(requestHseDocuments(backend), /Connection interrupted/);
  assert.equal(backend.writes.length, 0);
});

test("a rejected database write cannot produce a success confirmation", async () => {
  const backend = client({ request: null, error: { message: "Could not save request" } });
  await assert.rejects(requestHseDocuments(backend), /Could not save request/);
});

test("missing confirmation does not invent a reference or report success", async () => {
  const backend = client({ request: null });
  await assert.rejects(requestHseDocuments(backend), /Could not confirm your request/);
});

test("account email identifies the requester when name metadata is unavailable", async () => {
  const backend = client({ user: { id: "client-1", email: "client@example.com", email_confirmed_at: "2026-01-01", user_metadata: {} } });
  await requestHseDocuments(backend);
  assert.equal(backend.writes[0].row.requester_name, "client@example.com");
  assert.equal(backend.writes[0].row.company_name, null);
});
