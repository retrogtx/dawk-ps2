import type { LexicConfig, QueryOptions, QueryResult } from "./types";
export type { LexicConfig, QueryOptions, QueryResult, Citation, DecisionStep, LexicError } from "./types";
export declare class Lexic {
    private apiKey;
    private baseUrl;
    private activePlugin;
    private timeout;
    constructor(config: LexicConfig);
    /**
     * Set the active plugin for subsequent queries.
     * Hot-swap: just call this to switch domains mid-conversation.
     */
    setActivePlugin(pluginSlug: string): void;
    /** Returns the currently active plugin slug, or null. */
    getActivePlugin(): string | null;
    /**
     * Query an expert plugin. Returns a cited, decision-tree-backed answer.
     *
     * @param options.plugin - Plugin slug (overrides activePlugin for this call)
     * @param options.query  - The question to ask the expert
     */
    query(options: QueryOptions): Promise<QueryResult>;
}
export declare class LexicAPIError extends Error {
    status: number;
    constructor(message: string, status: number);
}
//# sourceMappingURL=index.d.ts.map