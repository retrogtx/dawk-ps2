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
import type { QueryRequestOptions, CollaborationMode, CollaborationStreamEvent } from "./types";
export interface LexicToolConfig {
    apiKey: string;
    plugin: string;
    baseUrl?: string;
    name?: string;
    description?: string;
    /** Default query options applied to every call through this tool. */
    queryOptions?: QueryRequestOptions;
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
    private queryOptions?;
    constructor(config: LexicToolConfig);
    /** LangChain Tool interface — called by the agent with a string input. */
    call(input: string): Promise<string>;
    /**
     * LangChain StructuredTool._call implementation.
     * Returns a JSON string that includes the full answer with inline citations,
     * source metadata, confidence level, and the decision reasoning path.
     */
    _call(input: string): Promise<string>;
    /** Switch which plugin this tool queries (hot-swap). */
    setPlugin(pluginSlug: string): void;
}
/**
 * Format a QueryResult into a JSON string suitable for LLM agent consumption.
 * Includes full citation metadata (document, page, section, excerpt) so the
 * agent can reference sources accurately.
 */
export interface LexicCollaborationToolConfig {
    apiKey: string;
    experts: string[];
    baseUrl?: string;
    name?: string;
    description?: string;
    mode?: CollaborationMode;
    maxRounds?: number;
    onEvent?: (event: CollaborationStreamEvent) => void;
}
/**
 * A LangChain-compatible tool for multi-expert collaboration rooms.
 * Sends a query to multiple SME plugins, runs adversarial deliberation,
 * and returns the synthesized consensus with per-expert contributions.
 */
export declare class LexicCollaborationTool {
    name: string;
    description: string;
    private client;
    private experts;
    private mode;
    private maxRounds;
    private onEvent?;
    constructor(config: LexicCollaborationToolConfig);
    call(input: string): Promise<string>;
    _call(input: string): Promise<string>;
    setExperts(expertSlugs: string[]): void;
    setMode(mode: CollaborationMode): void;
}
//# sourceMappingURL=langchain.d.ts.map