# PRD: SME-Plug — Hot-Swappable Subject Matter Expert Plugin

## 1. Vision

**One-liner:** A plug-and-play platform where anyone can create, share, and inject domain-expert "brains" into any AI agent — turning a generalist chatbot into a verified specialist in seconds.

**Why this matters for real people:** Today, if a small manufacturer asks ChatGPT about ASME pressure vessel codes, or a clinic admin asks an AI about HIPAA billing edge-cases, the AI confidently guesses. SME-Plug kills hallucination by hot-swapping in a verified expert module — complete with decision trees, source-of-truth citations, and domain reasoning — so the answer is auditable, correct, and useful.

---

## 2. Target Users & Day-to-Day Value

### Primary Users

| Persona | Pain Today | SME-Plug Value |
|---|---|---|
| **Domain Expert / Consultant** | Knowledge trapped in their head or PDFs; can't scale themselves | Create an SME plugin once → it works 24/7 inside any AI agent, earns royalties |
| **AI Agent Builder / Developer** | Agents hallucinate on specialized tasks; building domain logic from scratch is expensive | Install a verified SME plugin in 3 lines of code; swap domains without retraining |
| **End Business User** (factory manager, clinic admin, compliance officer) | Needs expert-grade answers but can't afford a consultant for every question | Ask their AI agent domain questions and get cited, decision-tree-backed answers |

### Day-to-Day Use Cases

1. **Structural Engineering Firm** — Agent reviews uploaded drawings → SME plugin enforces IS 456 / ACI 318 checks → flags non-compliant beam sizes with citations.
2. **Healthcare Clinic** — Front-desk AI handles insurance queries → SME plugin injects CPT/ICD coding decision trees → answers with CMS source links.
3. **E-commerce Seller** — AI agent handles customer returns → SME plugin for "Consumer Protection Act" ensures legally correct responses.
4. **Legal Freelancer** — Contract review agent → SME plugin for Indian Contract Act → highlights risky clauses with section references.
5. **Agri-tech Startup** — Farmer chatbot → SME plugin for crop disease diagnosis → follows ICAR decision tree → cites published advisories.

---

## 3. Product Features (MVP — Hackathon Scope)

### 3.1 SME Plugin Builder (Web App)

- **Knowledge Base Upload**: Upload PDFs, markdown, URLs, or structured JSON as the domain's "Source of Truth"
- **Decision Tree Editor**: Visual node-based editor to create domain reasoning flows (if → then → else chains)
- **System Prompt Composer**: Auto-generates the expert persona prompt ("Think like a Structural Engineer") with injected constraints
- **Citation Rules**: Define mandatory citation patterns — every claim must link back to an uploaded source
- **Test Sandbox**: Chat with your plugin in-browser before publishing to verify behavior
- **Publish & Version**: One-click publish with semantic versioning; consumers pin to a version

### 3.2 Plugin Marketplace / Registry

- **Browse & Search**: Filter plugins by domain, rating, framework compatibility
- **Install via API key or SDK**: `sme.install("structural-engineering-v2")` — 1 line
- **Ratings & Reviews**: Users rate plugin accuracy
- **Usage Analytics Dashboard**: Plugin creators see install count, query volume, accuracy feedback

### 3.3 Universal Agent Integration Layer

- **Framework Adapters**: Pre-built adapters for LangChain, AutoGPT, CrewAI, OpenAI Assistants API, Vercel AI SDK
- **REST API**: For any custom agent — POST the user query + plugin ID → get expert-augmented response
- **Hot-Swap at Runtime**: Switch the active SME plugin mid-conversation without restart
- **Multi-Plugin Stacking**: Combine plugins (e.g., "Structural Engineering" + "Indian Building Codes") with conflict resolution

### 3.4 Citation & Audit Engine

- **Inline Citations**: Every response chunk tagged with `[Source: document_name, page X, section Y]`
- **Confidence Scoring**: Each answer gets a confidence level (High / Medium / Low) based on source coverage
- **Audit Log**: Full trace of which decision tree nodes fired, which sources were retrieved, what reasoning path was taken
- **Hallucination Guard**: If no source supports a claim, the system says "I don't have verified information on this" instead of guessing

---

## 4. Feature Prioritization (Hackathon)

### Must Have (Demo Day)
- [ ] Knowledge base upload (PDF + markdown)
- [ ] Decision tree creator (simplified — JSON + basic visual)
- [ ] Plugin packaging and versioning
- [ ] REST API for agent integration
- [ ] LangChain adapter (primary demo framework)
- [ ] Citation engine with inline source references
- [ ] Hallucination guard (refuse when no source matches)
- [ ] Test sandbox in web UI
- [ ] 1 fully built demo plugin (e.g., Structural Engineering)

### Should Have
- [ ] Plugin marketplace with search
- [ ] AutoGPT + CrewAI adapters
- [ ] Usage analytics dashboard
- [ ] Multi-plugin stacking

### Nice to Have
- [ ] Visual drag-and-drop decision tree editor
- [ ] Plugin ratings and reviews
- [ ] Royalty/monetization system for creators
- [ ] Confidence scoring display

---

## 5. User Flows

### Flow 1: Expert Creates a Plugin
```
Sign Up → "Create New Plugin" → Name it ("Structural Engineering - IS 456")
→ Upload knowledge base (PDFs of IS 456, SP 16, ACI 318)
→ Define decision tree (load_type → beam_or_slab → check_depth → cite_table)
→ Set citation rules (mandatory, per-claim)
→ Test in sandbox → Publish v1.0 → Get API key + install snippet
```

### Flow 2: Developer Installs a Plugin
```
Browse marketplace → Find "Structural Engineering" plugin → Copy install code
→ Add to their LangChain agent: `agent.use(SMEPlug("structural-eng-v1"))`
→ Agent now answers structural queries with citations → Hot-swap to "HVAC" plugin if needed
```

### Flow 3: End User Gets Expert Answers
```
Opens their company's AI assistant → Asks "What's the minimum cover for a beam
exposed to weather per IS 456?"
→ Agent (with SME plugin) retrieves from knowledge base → Follows decision tree
→ Returns: "45mm nominal cover (IS 456:2000, Table 16, Clause 26.4.2)"
→ User clicks citation → sees the actual source text
```

---

## 6. Success Metrics

| Metric | Target |
|---|---|
| Plugin creation time | < 15 minutes for a basic domain |
| Integration time for developer | < 5 minutes (install + first query) |
| Citation coverage | > 90% of claims have source links |
| Hallucination rate (with plugin) | < 5% vs ~30% baseline |
| Demo day | 1 live plugin, 2 framework adapters, end-to-end flow |

---

## 7. Competitive Positioning

| Existing Approach | Limitation | SME-Plug Advantage |
|---|---|---|
| RAG (Retrieval Augmented Generation) | Retrieves text but no structured reasoning | We add decision trees + citation enforcement on top of retrieval |
| Fine-tuning | Expensive, not hot-swappable, no citations | We're runtime-injectable, version-controlled, source-linked |
| Custom GPTs (OpenAI) | Locked to OpenAI, no structured reasoning, weak citations | Framework-agnostic, decision tree logic, mandatory citations |
| LangChain Tools | Low-level, no marketplace, no domain packaging | We package the full expert: knowledge + reasoning + citations |

---

## 8. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Plugin quality varies | Rating system + mandatory test sandbox before publish |
| Citation accuracy (wrong source linked) | Chunk-level source tracking with similarity threshold |
| Decision tree complexity overwhelms creators | Start with JSON templates; visual editor is v2 |
| Framework adapter maintenance | Adapter interface is thin; community can contribute |
| Latency from citation + decision tree overhead | Async retrieval, edge caching of knowledge base embeddings |