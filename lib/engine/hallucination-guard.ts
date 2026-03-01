import type { CitationResult } from "./citation";

/**
 * Hallucination guard — never replaces the answer. Instead it downgrades
 * confidence and strips phantom citations so the trust panel reflects reality.
 */
export function applyHallucinationGuard(
  result: CitationResult,
  retrievedSourceCount?: number,
): CitationResult {
  const {
    cleanedAnswer,
    citations,
    phantomCount,
    realRefCount,
  } = result;

  const hadSources = retrievedSourceCount !== undefined
    ? retrievedSourceCount > 0
    : false;

  // No KB sources → nothing to hallucinate about; pass through as-is.
  if (!hadSources) {
    return result;
  }

  // Sources existed but LLM cited none, or phantoms outnumber real refs →
  // downgrade confidence and drop bogus citations, but keep the answer.
  if (citations.length === 0 || (phantomCount > 0 && phantomCount > realRefCount)) {
    return {
      ...result,
      citations: citations.filter((c) => c.sourceRank != null && !result.unresolvedRefs.includes(c.sourceRank)),
      confidence: "low",
    };
  }

  return result;
}
