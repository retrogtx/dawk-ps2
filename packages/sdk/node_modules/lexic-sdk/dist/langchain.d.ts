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
export interface LexicToolConfig {
    apiKey: string;
    plugin: string;
    baseUrl?: string;
    name?: string;
    description?: string;
}
/**
 * A LangChain-compatible tool that wraps the Lexic query API.
 * Implements the minimal Tool interface so it works with any LangChain agent
 * without requiring langchain as a dependency.
 */
export declare class LexicTool {
    name: string;
    description: string;
    private client;
    private plugin;
    constructor(config: LexicToolConfig);
    /** LangChain Tool interface — called by the agent with a string input. */
    call(input: string): Promise<string>;
    /** LangChain StructuredTool._call implementation. */
    _call(input: string): Promise<string>;
    /** Switch which plugin this tool queries (hot-swap). */
    setPlugin(pluginSlug: string): void;
}
//# sourceMappingURL=langchain.d.ts.map