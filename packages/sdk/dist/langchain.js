/**
 * LangChain adapter for Lexic.
 *
 * Usage:
 *   import { LexicTool } from "lexic-sdk/langchain";
 *
 *   const tool = new LexicTool({
 *     apiKey: "lx_xxxxx",
 *     plugin: "structural-engineering-v1",
 *     name: "structural_expert",
 *     description: "Consult a structural engineering expert",
 *   });
 *
 *   // Add to any LangChain agent's tool list
 *   const agent = createOpenAIToolsAgent({ llm, tools: [tool], prompt });
 */
import { Lexic, LexicAPIError } from "./index";
/**
 * A LangChain-compatible tool that wraps the Lexic query API.
 * Implements the minimal Tool interface so it works with any LangChain agent
 * without requiring langchain as a dependency.
 */
export class LexicTool {
    constructor(config) {
        this.client = new Lexic({
            apiKey: config.apiKey,
            baseUrl: config.baseUrl,
        });
        this.plugin = config.plugin;
        this.queryOptions = config.queryOptions;
        this.name = config.name || `lexic_${config.plugin.replace(/-/g, "_")}`;
        this.description =
            config.description ||
                `Query the "${config.plugin}" plugin for expert, cited answers on domain-specific questions.`;
    }
    /** LangChain Tool interface — called by the agent with a string input. */
    async call(input) {
        return this._call(input);
    }
    /**
     * LangChain StructuredTool._call implementation.
     * Returns a JSON string that includes the full answer with inline citations,
     * source metadata, confidence level, and the decision reasoning path.
     */
    async _call(input) {
        try {
            const result = await this.client.query({
                plugin: this.plugin,
                query: input,
                options: this.queryOptions,
            });
            return formatResultForAgent(result);
        }
        catch (err) {
            if (err instanceof LexicAPIError) {
                return JSON.stringify({ error: err.message, status: err.status });
            }
            return JSON.stringify({ error: err.message });
        }
    }
    /** Switch which plugin this tool queries (hot-swap). */
    setPlugin(pluginSlug) {
        this.plugin = pluginSlug;
    }
}
/**
 * A LangChain-compatible tool for multi-expert collaboration rooms.
 * Sends a query to multiple SME plugins, runs adversarial deliberation,
 * and returns the synthesized consensus with per-expert contributions.
 */
export class LexicCollaborationTool {
    constructor(config) {
        this.client = new Lexic({
            apiKey: config.apiKey,
            baseUrl: config.baseUrl,
        });
        this.experts = config.experts;
        this.mode = config.mode || "debate";
        this.maxRounds = config.maxRounds || 3;
        this.onEvent = config.onEvent;
        this.name = config.name || "lexic_collaboration";
        this.description =
            config.description ||
                `Consult a panel of ${config.experts.length} domain experts who debate and synthesize a consensus answer. Experts: ${config.experts.join(", ")}`;
    }
    async call(input) {
        return this._call(input);
    }
    async _call(input) {
        try {
            const result = await this.client.collaborateStreamToResult({
                experts: this.experts,
                query: input,
                mode: this.mode,
                maxRounds: this.maxRounds,
            }, this.onEvent);
            return formatCollaborationForAgent(result);
        }
        catch (err) {
            if (err instanceof LexicAPIError) {
                return JSON.stringify({ error: err.message, status: err.status });
            }
            return JSON.stringify({ error: err.message });
        }
    }
    setExperts(expertSlugs) {
        this.experts = expertSlugs;
    }
    setMode(mode) {
        this.mode = mode;
    }
}
function formatCollaborationForAgent(result) {
    const { consensus, rounds } = result;
    const conflicts = (consensus.conflicts ?? []).map((c) => ({
        topic: c.topic,
        resolved: c.resolved,
        resolution: c.resolution,
        positions: c.positions,
    }));
    const contributions = (consensus.expertContributions ?? []).map((e) => ({
        expert: e.expert,
        domain: e.domain,
        keyPoints: e.keyPoints,
    }));
    const output = {
        consensus: consensus.answer,
        confidence: consensus.confidence,
        agreementLevel: consensus.agreementLevel,
        citations: (consensus.citations ?? []).map((c) => ({
            id: c.id,
            document: c.document,
            excerpt: c.excerpt,
        })),
        roundCount: rounds.length,
        expertContributions: contributions,
    };
    if (conflicts.length > 0) {
        output.conflicts = conflicts;
    }
    return JSON.stringify(output);
}
// ─── Single-Expert Formatting ────────────────────────────────────────
function formatResultForAgent(result) {
    const citations = (result.citations ?? []).map((c) => ({
        id: c.id,
        document: c.document,
        ...(c.page != null && { page: c.page }),
        ...(c.section && { section: c.section }),
        excerpt: c.excerpt,
    }));
    const output = {
        answer: result.answer,
        confidence: result.confidence,
        citations,
    };
    if (result.decisionPath?.length) {
        output.decisionPath = result.decisionPath;
    }
    return JSON.stringify(output);
}
//# sourceMappingURL=langchain.js.map