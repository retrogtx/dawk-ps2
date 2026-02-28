import type { LexicConfig, QueryOptions, QueryResult, StreamEvent, CollaborateOptions, CollaborationResult, CollaborationStreamEvent } from "./types";
export type { LexicConfig, QueryOptions, QueryRequestOptions, QueryResult, Citation, DecisionStep, LexicError, StreamEvent, CollaborateOptions, CollaborationResult, CollaborationStreamEvent, CollaborationMode, ExpertResponse, CollaborationRound, ConsensusResult, ConflictEntry, } from "./types";
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
     */
    query(options: QueryOptions): Promise<QueryResult>;
    /**
     * Stream a query response. Yields events as they arrive:
     *   - status  → pipeline progress (searching KB, web search, generating)
     *   - delta   → text token
     *   - done    → final answer, citations, confidence, decision path
     *   - error   → something went wrong
     *
     * Usage:
     * ```ts
     * for await (const event of lexic.queryStream({ query: "..." })) {
     *   if (event.type === "delta") process.stdout.write(event.text);
     *   if (event.type === "done") console.log(event.answer, event.citations);
     * }
     * ```
     */
    queryStream(options: QueryOptions): AsyncGenerator<StreamEvent>;
    /**
     * Convenience wrapper: streams a query and resolves with the full QueryResult
     * once complete. Useful when you want streaming progress events but still
     * want a single resolved result at the end.
     */
    queryStreamToResult(options: QueryOptions, onEvent?: (event: StreamEvent) => void): Promise<QueryResult>;
    /**
     * Run a multi-expert collaboration session. Multiple SME plugins
     * debate/review the query and produce a synthesized consensus.
     */
    collaborate(options: CollaborateOptions): Promise<CollaborationResult>;
    /**
     * Convenience wrapper: streams a collaboration and resolves with the
     * final CollaborationResult. Fires `onEvent` for every SSE event so
     * callers can render token-by-token progress (expert_thinking,
     * expert_response, round_complete, etc.).
     *
     * Usage:
     * ```ts
     * const result = await lexic.collaborateStreamToResult(
     *   { experts: ["eng", "safety"], query: "..." },
     *   (event) => {
     *     if (event.type === "expert_response") console.log(event.expertName, event.answer);
     *     if (event.type === "round_complete") console.log("Round done");
     *   },
     * );
     * console.log(result.consensus.answer);
     * ```
     */
    collaborateStreamToResult(options: CollaborateOptions, onEvent?: (event: CollaborationStreamEvent) => void): Promise<CollaborationResult>;
    /**
     * Stream a collaboration session. Yields events as experts respond:
     *   - experts_resolved → which experts joined
     *   - round_start      → deliberation round beginning
     *   - expert_thinking   → an expert is generating
     *   - expert_response   → an expert's full response
     *   - round_complete    → round finished
     *   - done              → final consensus + all rounds
     *   - error             → something went wrong
     */
    collaborateStream(options: CollaborateOptions): AsyncGenerator<CollaborationStreamEvent>;
}
export declare class LexicAPIError extends Error {
    status: number;
    constructor(message: string, status: number);
}
//# sourceMappingURL=index.d.ts.map