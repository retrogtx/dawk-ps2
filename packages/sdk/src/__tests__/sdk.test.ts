/**
 * SDK unit tests — validates type normalization, response formatting,
 * and adapter output for all three entry points (core, langchain, autogpt).
 *
 * Run: npx tsx packages/sdk/src/__tests__/sdk.test.ts
 */

import { Lexic, LexicAPIError } from "../index";
import type { QueryResult, Citation, DecisionStep, StreamEvent } from "../types";

let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string) {
  if (condition) {
    passed++;
    console.log(`  PASS  ${label}`);
  } else {
    failed++;
    console.error(`  FAIL  ${label}`);
  }
}

// ── Helpers to test internal normalization via the public API ─────────

function makeMockServer(response: unknown, status = 200) {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (_url: string | URL | Request, _init?: RequestInit) => {
    return {
      ok: status >= 200 && status < 300,
      status,
      json: async () => response,
      body: null,
    } as Response;
  };
  return () => { globalThis.fetch = originalFetch; };
}

// ── Test: Constructor validation ─────────────────────────────────────

console.log("\n--- Constructor ---");

try {
  new Lexic({ apiKey: "" });
  assert(false, "should throw on empty apiKey");
} catch (e) {
  assert((e as Error).message.includes("apiKey is required"), "throws on empty apiKey");
}

{
  const client = new Lexic({ apiKey: "lx_test", defaultPlugin: "my-plugin" });
  assert(client.getActivePlugin() === "my-plugin", "defaultPlugin sets activePlugin");
}

{
  const client = new Lexic({ apiKey: "lx_test" });
  assert(client.getActivePlugin() === null, "activePlugin starts null when no default");
  client.setActivePlugin("new-plugin");
  assert(client.getActivePlugin() === "new-plugin", "setActivePlugin updates plugin");
}

// ── Test: query() — no plugin specified ──────────────────────────────

console.log("\n--- query() validation ---");

{
  const client = new Lexic({ apiKey: "lx_test" });
  try {
    await client.query({ query: "test" });
    assert(false, "should throw when no plugin set");
  } catch (e) {
    assert((e as Error).message.includes("no plugin specified"), "throws when no plugin");
  }
}

// ── Test: query() — normalizes a well-formed response ────────────────

console.log("\n--- query() response normalization ---");

{
  const fullResponse = {
    answer: "The answer is 42 [Source 1].",
    citations: [
      { id: "src_1", document: "Guide.pdf", page: 10, section: "Ch. 1", excerpt: "The answer..." },
    ],
    decisionPath: [
      { step: 1, node: "q1", label: "Check type", value: "beam" },
    ],
    confidence: "high",
    pluginVersion: "1.0.0",
  };

  const restore = makeMockServer(fullResponse);
  const client = new Lexic({ apiKey: "lx_test" });
  const result = await client.query({ plugin: "test-plugin", query: "test" });

  assert(result.answer === "The answer is 42 [Source 1].", "answer preserved");
  assert(result.citations.length === 1, "one citation");
  assert(result.citations[0].id === "src_1", "citation id");
  assert(result.citations[0].document === "Guide.pdf", "citation document");
  assert(result.citations[0].page === 10, "citation page");
  assert(result.citations[0].section === "Ch. 1", "citation section");
  assert(result.citations[0].excerpt === "The answer...", "citation excerpt");
  assert(result.decisionPath.length === 1, "one decision step");
  assert(result.decisionPath[0].step === 1, "step number");
  assert(result.decisionPath[0].node === "q1", "step node");
  assert(result.decisionPath[0].label === "Check type", "step label");
  assert(result.decisionPath[0].value === "beam", "step value");
  assert(result.confidence === "high", "confidence high");
  assert(result.pluginVersion === "1.0.0", "pluginVersion");
  restore();
}

// ── Test: query() — normalizes a malformed / partial response ────────

console.log("\n--- query() handles malformed responses ---");

{
  const restore = makeMockServer({ answer: "Partial answer" });
  const client = new Lexic({ apiKey: "lx_test" });
  const result = await client.query({ plugin: "test-plugin", query: "test" });

  assert(result.answer === "Partial answer", "answer from partial response");
  assert(Array.isArray(result.citations) && result.citations.length === 0, "citations default to []");
  assert(Array.isArray(result.decisionPath) && result.decisionPath.length === 0, "decisionPath default to []");
  assert(result.confidence === "low", "confidence defaults to low");
  assert(result.pluginVersion === "unknown", "pluginVersion defaults to unknown");
  restore();
}

{
  const restore = makeMockServer({});
  const client = new Lexic({ apiKey: "lx_test" });
  const result = await client.query({ plugin: "test-plugin", query: "test" });

  assert(result.answer === "", "empty object → answer is empty string");
  assert(result.confidence === "low", "empty object → confidence is low");
  restore();
}

{
  const restore = makeMockServer({
    answer: 12345,
    citations: "not-an-array",
    decisionPath: null,
    confidence: "invalid",
    pluginVersion: 99,
  });
  const client = new Lexic({ apiKey: "lx_test" });
  const result = await client.query({ plugin: "test-plugin", query: "test" });

  assert(result.answer === "", "non-string answer → empty string");
  assert(result.citations.length === 0, "non-array citations → []");
  assert(result.decisionPath.length === 0, "null decisionPath → []");
  assert(result.confidence === "low", "invalid confidence → low");
  assert(result.pluginVersion === "unknown", "non-string pluginVersion → unknown");
  restore();
}

// ── Test: query() — passes context and options through ───────────────

console.log("\n--- query() passes context and options ---");

{
  let capturedBody: Record<string, unknown> | null = null;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (_url: string | URL | Request, init?: RequestInit) => {
    capturedBody = JSON.parse(init?.body as string);
    return { ok: true, status: 200, json: async () => ({ answer: "ok" }) } as Response;
  };

  const client = new Lexic({ apiKey: "lx_test" });
  await client.query({
    plugin: "test-plugin",
    query: "test",
    context: [{ role: "user", content: "prior question" }],
    options: { citationMode: "inline", maxSources: 3, includeDecisionPath: true },
  });

  const body = capturedBody!;
  assert(body.plugin === "test-plugin", "body has plugin");
  assert(body.query === "test", "body has query");
  assert(Array.isArray(body.context) && (body.context as unknown[]).length === 1, "body has context");
  assert((body.options as Record<string, unknown>)?.citationMode === "inline", "body has options.citationMode");
  assert((body.options as Record<string, unknown>)?.maxSources === 3, "body has options.maxSources");

  globalThis.fetch = originalFetch;
}

// ── Test: query() — omits context/options when not provided ──────────

{
  let capturedBody: Record<string, unknown> | null = null;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (_url: string | URL | Request, init?: RequestInit) => {
    capturedBody = JSON.parse(init?.body as string);
    return { ok: true, status: 200, json: async () => ({ answer: "ok" }) } as Response;
  };

  const client = new Lexic({ apiKey: "lx_test" });
  await client.query({ plugin: "test-plugin", query: "test" });

  assert(!("context" in (capturedBody || {})), "body omits context when not provided");
  assert(!("options" in (capturedBody || {})), "body omits options when not provided");

  globalThis.fetch = originalFetch;
}

// ── Test: query() — error handling ───────────────────────────────────

console.log("\n--- query() error handling ---");

{
  const restore = makeMockServer({ error: "Invalid API key" }, 401);
  const client = new Lexic({ apiKey: "lx_bad" });
  try {
    await client.query({ plugin: "test-plugin", query: "test" });
    assert(false, "should throw on 401");
  } catch (e) {
    assert(e instanceof LexicAPIError, "throws LexicAPIError");
    assert((e as LexicAPIError).status === 401, "status is 401");
    assert((e as LexicAPIError).message === "Invalid API key", "error message from body");
  }
  restore();
}

// ── Test: LangChain adapter formatting ───────────────────────────────

console.log("\n--- LangChain adapter ---");

{
  const { LexicTool } = await import("../langchain");

  const fullResponse = {
    answer: "Use M25 grade concrete [Source 1].",
    citations: [
      { id: "src_1", document: "IS 456.pdf", page: 47, section: "Table 16", excerpt: "Nominal cover..." },
    ],
    decisionPath: [
      { step: 1, node: "grade", label: "Concrete grade?", value: "M25" },
    ],
    confidence: "high",
    pluginVersion: "1.0.0",
  };

  const restore = makeMockServer(fullResponse);
  const tool = new LexicTool({ apiKey: "lx_test", plugin: "test-plugin" });
  const output = await tool.call("What grade concrete?");
  const parsed = JSON.parse(output);

  assert(parsed.answer === "Use M25 grade concrete [Source 1].", "langchain: answer preserved");
  assert(parsed.confidence === "high", "langchain: confidence included");
  assert(parsed.citations.length === 1, "langchain: one citation");
  assert(parsed.citations[0].id === "src_1", "langchain: citation id included");
  assert(parsed.citations[0].document === "IS 456.pdf", "langchain: document included");
  assert(parsed.citations[0].page === 47, "langchain: page included");
  assert(parsed.citations[0].section === "Table 16", "langchain: section included");
  assert(parsed.citations[0].excerpt === "Nominal cover...", "langchain: excerpt included");
  assert(parsed.decisionPath.length === 1, "langchain: decisionPath included");
  restore();
}

{
  const { LexicTool } = await import("../langchain");

  const minResponse = { answer: "Minimal answer" };
  const restore = makeMockServer(minResponse);
  const tool = new LexicTool({ apiKey: "lx_test", plugin: "test-plugin" });
  const output = await tool.call("test");
  const parsed = JSON.parse(output);

  assert(parsed.answer === "Minimal answer", "langchain: handles minimal response");
  assert(Array.isArray(parsed.citations) && parsed.citations.length === 0, "langchain: empty citations");
  assert(!parsed.decisionPath, "langchain: omits empty decisionPath");
  restore();
}

// ── Test: AutoGPT adapter formatting ─────────────────────────────────

console.log("\n--- AutoGPT adapter ---");

{
  const { LexicAutoGPT } = await import("../autogpt");

  const fullResponse = {
    answer: "Use 45mm cover [Source 1].",
    citations: [
      { id: "src_1", document: "IS 456.pdf", page: 47, section: "Table 16", excerpt: "Cover..." },
    ],
    decisionPath: [
      { step: 1, node: "exp", label: "Exposure?", value: "severe" },
      { step: 2, node: "act", label: "Cover lookup", result: "45mm" },
    ],
    confidence: "high",
    pluginVersion: "1.0.0",
  };

  const restore = makeMockServer(fullResponse);
  const adapter = new LexicAutoGPT({ apiKey: "lx_test", plugin: "test-plugin" });
  const output = await adapter.execute("What cover?");

  assert(output.includes("Expert Answer (confidence: high):"), "autogpt: header line");
  assert(output.includes("Use 45mm cover [Source 1]."), "autogpt: answer body");
  assert(output.includes("[1] IS 456.pdf, p.47 — Table 16"), "autogpt: citation with page + section");
  assert(output.includes("Step 1: Exposure? → severe"), "autogpt: decision step with value");
  assert(output.includes("Step 2: Cover lookup (45mm)"), "autogpt: decision step with result");
  restore();
}

{
  const { LexicAutoGPT } = await import("../autogpt");

  const minResponse = { answer: "No citations here" };
  const restore = makeMockServer(minResponse);
  const adapter = new LexicAutoGPT({ apiKey: "lx_test", plugin: "test-plugin" });
  const output = await adapter.execute("test");

  assert(output.includes("No citations here"), "autogpt: handles no citations");
  assert(!output.includes("Citations:"), "autogpt: omits Citations header when empty");
  assert(!output.includes("Decision Path:"), "autogpt: omits Decision Path when empty");
  restore();
}

// ── Test: AutoGPT asCommand() ────────────────────────────────────────

{
  const { LexicAutoGPT } = await import("../autogpt");

  const adapter = new LexicAutoGPT({ apiKey: "lx_test", plugin: "my-plugin-v1" });
  const cmd = adapter.asCommand();

  assert(cmd.name === "consult_my_plugin_v1", "asCommand: default name from slug");
  assert(cmd.description.includes("my-plugin-v1"), "asCommand: description includes plugin");
  assert(cmd.parameters.query?.required === true, "asCommand: query param required");
}

// ── Test: LexicAPIError ──────────────────────────────────────────────

console.log("\n--- LexicAPIError ---");

{
  const err = new LexicAPIError("test error", 500);
  assert(err instanceof Error, "LexicAPIError extends Error");
  assert(err.name === "LexicAPIError", "name is LexicAPIError");
  assert(err.message === "test error", "message preserved");
  assert(err.status === 500, "status preserved");
}

// ── Test: Type shapes compile correctly ──────────────────────────────

console.log("\n--- Type shape checks ---");

{
  const _config: import("../types").LexicConfig = {
    apiKey: "lx_test",
    baseUrl: "http://localhost:3000",
    defaultPlugin: "my-plugin",
    timeout: 5000,
  };

  const _opts: import("../types").QueryOptions = {
    plugin: "test",
    query: "test",
    context: [{ role: "user", content: "hello" }, { role: "assistant", content: "hi" }],
    options: { citationMode: "inline", maxSources: 5, includeDecisionPath: true },
  };

  const _result: QueryResult = {
    answer: "test",
    citations: [{ id: "1", document: "doc", excerpt: "text" }],
    decisionPath: [{ step: 1, node: "n", label: "l" }],
    confidence: "high",
    pluginVersion: "1.0.0",
  };

  const _statusEvent: StreamEvent = { type: "status", status: "searching_kb", message: "msg" };
  const _deltaEvent: StreamEvent = { type: "delta", text: "token" };
  const _doneEvent: StreamEvent = {
    type: "done",
    answer: "final answer",
    citations: [],
    decisionPath: [],
    confidence: "high",
    pluginVersion: "1.0.0",
  };
  const _errorEvent: StreamEvent = { type: "error", error: "oops" };

  assert(true, "all type shapes compile correctly");
}

// ── Summary ──────────────────────────────────────────────────────────

console.log(`\n${"=".repeat(50)}`);
console.log(`  ${passed} passed, ${failed} failed`);
console.log(`${"=".repeat(50)}\n`);

if (failed > 0) process.exit(1);
