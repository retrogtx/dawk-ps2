/**
 * LangChain adapter for Lexic.
 *
 * Usage:
 *   import { LexicTool } from "@lexic/sdk/langchain";
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
        this.name = config.name || `lexic_${config.plugin.replace(/-/g, "_")}`;
        this.description =
            config.description ||
                `Query the "${config.plugin}" plugin for expert, cited answers on domain-specific questions.`;
    }
    /** LangChain Tool interface — called by the agent with a string input. */
    async call(input) {
        return this._call(input);
    }
    /** LangChain StructuredTool._call implementation. */
    async _call(input) {
        try {
            const result = await this.client.query({
                plugin: this.plugin,
                query: input,
            });
            return JSON.stringify({
                answer: result.answer,
                citations: result.citations.map((c) => ({
                    document: c.document,
                    section: c.section,
                    excerpt: c.excerpt,
                })),
                confidence: result.confidence,
                decisionPath: result.decisionPath,
            });
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
//# sourceMappingURL=langchain.js.map