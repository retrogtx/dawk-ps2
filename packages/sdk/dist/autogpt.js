/**
 * AutoGPT adapter for Lexic.
 *
 * Usage:
 *   import { LexicAutoGPT } from "lexic-sdk/autogpt";
 *
 *   const adapter = new LexicAutoGPT({
 *     apiKey: "lx_xxxxx",
 *     plugin: "structural-engineering-v1",
 *   });
 *
 *   // Register as an AutoGPT command
 *   const command = adapter.asCommand();
 */
import { Lexic, LexicAPIError } from "./index";
/**
 * Wraps Lexic as an AutoGPT-compatible command.
 * AutoGPT uses a command interface with name, description, parameters, and execute.
 */
export class LexicAutoGPT {
    constructor(config) {
        this.client = new Lexic({
            apiKey: config.apiKey,
            baseUrl: config.baseUrl,
        });
        this.plugin = config.plugin;
        this.queryOptions = config.queryOptions;
        this.commandName =
            config.commandName || `consult_${config.plugin.replace(/-/g, "_")}`;
        this.commandDescription =
            config.commandDescription ||
                `Consult the "${config.plugin}" subject matter expert. Returns a cited, decision-tree-backed answer.`;
    }
    /** Convert to AutoGPT command format. */
    asCommand() {
        return {
            name: this.commandName,
            description: this.commandDescription,
            parameters: {
                query: {
                    type: "string",
                    description: "The domain-specific question to ask the expert",
                    required: true,
                },
            },
            execute: async (args) => {
                return this.execute(args.query);
            },
        };
    }
    /** Execute a query directly. Returns human-readable formatted text. */
    async execute(query) {
        try {
            const result = await this.client.query({
                plugin: this.plugin,
                query,
                options: this.queryOptions,
            });
            return formatResultForAutoGPT(result);
        }
        catch (err) {
            if (err instanceof LexicAPIError) {
                return `Lexic Error (${err.status}): ${err.message}`;
            }
            return `Lexic Error: ${err.message}`;
        }
    }
    /** Switch which plugin this adapter queries (hot-swap). */
    setPlugin(pluginSlug) {
        this.plugin = pluginSlug;
    }
}
/**
 * Wraps Lexic multi-expert collaboration as an AutoGPT command.
 * Runs adversarial deliberation and returns the consensus in
 * human-readable text with per-expert breakdowns.
 */
export class LexicCollaborationAutoGPT {
    constructor(config) {
        this.client = new Lexic({
            apiKey: config.apiKey,
            baseUrl: config.baseUrl,
        });
        this.experts = config.experts;
        this.mode = config.mode || "debate";
        this.maxRounds = config.maxRounds || 3;
        this.onEvent = config.onEvent;
        this.commandName =
            config.commandName || "consult_expert_panel";
        this.commandDescription =
            config.commandDescription ||
                `Consult a panel of ${config.experts.length} domain experts (${config.experts.join(", ")}). They debate and synthesize a consensus answer.`;
    }
    asCommand() {
        return {
            name: this.commandName,
            description: this.commandDescription,
            parameters: {
                query: {
                    type: "string",
                    description: "The cross-domain question to put before the expert panel",
                    required: true,
                },
            },
            execute: async (args) => {
                return this.execute(args.query);
            },
        };
    }
    async execute(query) {
        try {
            const result = await this.client.collaborateStreamToResult({
                experts: this.experts,
                query,
                mode: this.mode,
                maxRounds: this.maxRounds,
            }, this.onEvent);
            return formatCollaborationForAutoGPT(result);
        }
        catch (err) {
            if (err instanceof LexicAPIError) {
                return `Lexic Collaboration Error (${err.status}): ${err.message}`;
            }
            return `Lexic Collaboration Error: ${err.message}`;
        }
    }
    setExperts(expertSlugs) {
        this.experts = expertSlugs;
    }
    setMode(mode) {
        this.mode = mode;
    }
}
function formatCollaborationForAutoGPT(result) {
    const { consensus, rounds } = result;
    const lines = [
        `Expert Panel Consensus (confidence: ${consensus.confidence}, agreement: ${Math.round(consensus.agreementLevel * 100)}%):`,
        consensus.answer,
    ];
    const contributions = consensus.expertContributions ?? [];
    if (contributions.length > 0) {
        lines.push("", "Expert Contributions:");
        for (const contrib of contributions) {
            lines.push(`  [${contrib.expert}] (${contrib.domain}):`);
            for (const point of contrib.keyPoints) {
                lines.push(`    • ${point}`);
            }
        }
    }
    const conflicts = consensus.conflicts ?? [];
    if (conflicts.length > 0) {
        lines.push("", "Conflicts:");
        for (const conflict of conflicts) {
            const status = conflict.resolved ? "RESOLVED" : "UNRESOLVED";
            lines.push(`  ${status}: ${conflict.topic}`);
            for (const pos of conflict.positions) {
                lines.push(`    - ${pos.expert}: ${pos.stance}`);
            }
            if (conflict.resolution) {
                lines.push(`    Resolution: ${conflict.resolution}`);
            }
        }
    }
    const citations = consensus.citations ?? [];
    if (citations.length > 0) {
        lines.push("", "Combined Citations:");
        for (let i = 0; i < citations.length; i++) {
            const c = citations[i];
            lines.push(`  [${i + 1}] ${c.document}: ${c.excerpt.slice(0, 100)}...`);
        }
    }
    lines.push("", `Deliberation: ${rounds.length} round(s), ${result.latencyMs}ms`);
    return lines.join("\n");
}
// ─── Single-Expert Formatting ────────────────────────────────────────
function formatResultForAutoGPT(result) {
    const lines = [
        `Expert Answer (confidence: ${result.confidence}):`,
        result.answer,
    ];
    const citations = result.citations ?? [];
    if (citations.length > 0) {
        lines.push("", "Citations:");
        for (let i = 0; i < citations.length; i++) {
            const c = citations[i];
            let ref = `  [${i + 1}] ${c.document}`;
            if (c.page != null)
                ref += `, p.${c.page}`;
            if (c.section)
                ref += ` — ${c.section}`;
            lines.push(ref);
        }
    }
    const decisionPath = result.decisionPath ?? [];
    if (decisionPath.length > 0) {
        lines.push("", "Decision Path:");
        for (const step of decisionPath) {
            let entry = `  Step ${step.step}: ${step.label}`;
            if (step.value)
                entry += ` → ${step.value}`;
            if (step.result)
                entry += ` (${step.result})`;
            lines.push(entry);
        }
    }
    return lines.join("\n");
}
//# sourceMappingURL=autogpt.js.map