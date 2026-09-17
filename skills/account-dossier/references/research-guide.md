# Research Guide — Strategic Account Dossier

Work top-down through the four layers. Every fact must be public, attributable, and dated. When a source conflicts with another, note the conflict — don't silently pick one.

## Layer 1 — Stakeholder research (per person)

Run searches 1–5 per target stakeholder, starting with the most senior confirmed name:

1. `[Name] [Account] role title 2025 2026` — confirm current title and reporting line
2. `[Name] [Account] interview panel conference speaker` — public voice and stated agenda
3. `[Name] [Account] case study vendor Microsoft OpenAI` — co-marketing commitments
4. `[Name] [previous employer] [Account]` — career trajectory and cross-company history
5. `[Name] LinkedIn` — recent posts, reposts, shared content

For shared employment history between stakeholders:
6. `[Person A] [Person B] [shared employer]` — surfacing verifiable connections only

## Layer 2 — Strategic intelligence

7. `[Account] investor day strategic plan 2025 2026` — vision, CEO commitments, financial targets
8. `[Account] annual report technology AI 2025` — named programmes, platforms, spend
9. `[Account] CEO OR Chair interview AI digital 2026` — their own language and framing
10. `[Account] earnings call transcript 2026` — what analysts pushed on, what management said
11. `[Account] news acquisition merger restructuring 2026` — trigger events

## Layer 3 — Technical architecture

12. `[Account] Microsoft Copilot OR GitHub Copilot deployment 2025 2026`
13. `[Account] developer tools engineering productivity platform`
14. `[Account] site:linkedin.com/jobs [tech role]` — active job ads reveal team names and tech stack
15. `[Account] engineering blog OR tech blog`
16. `[Account] cloud AWS Azure SAP ERP platform`

## Layer 4 — Objection and commercial research

17. `[Account] vendor strategy AI consolidation` — named partnerships that drive consolidation objection
18. `[Account] data residency information security responsible AI policy` — governance language
19. `[Account] change management employee AI training adoption` — adoption posture

Prefer primary sources: the account's own newsroom, investor relations PDFs, SEC filings, exec bylines. Fetch full articles when snippets are thin. Mark anything from an aggregator (TheOrg, PitchBook) as "lead — verify independently."

---

## Quality bar per layer

| Layer | Good enough | Not good enough |
|---|---|---|
| 1. Stakeholders | Named exec, confirmed title, current role dated within 12 months | Aggregator-only, undated, or >18 months old |
| 2. Strategic | CEO/Chair quote, board-level number with date and source event | Press release summary without a primary link |
| 3. Technical | Named platform/tool, dated announcement or job ad | "uses AI" without specifics |
| 4. Commercial | Named partnership, stated governance policy, dated rollout | Inference from org size or sector norms |

---

## Value hypothesis construction

Write each why as a hypothesis, not a conclusion:

**Why anything** — "We believe [Account] faces [problem] because [their stated fact]. This is confirmed if [discovery test]; challenged if [alternative explanation]."

**Why Stack Internal** — "We believe Stack Internal fits because [their architecture fact creates gap]. The wedge is [MCP write-back / closed loop / provenance]. This is confirmed if [discovery test]; challenged if [they have X alternative]."

**Why now** — For **existing customers**: "The window is [renewal date / new stakeholder / contract event]. This is confirmed if [internal signal]; challenged if [no urgency signal exists]." For **prospects**: "The trigger is [named event / leadership change / AI programme milestone]. This is confirmed if [they acknowledge urgency]; challenged if [programme is on hold]."

---

## Objection research additions

Beyond the 19 core searches, add:

- `[Account] build vs buy platform engineering internal tools` — surfaces build instinct
- `[Account] third party supplier TPSP vendor risk management` — banking-specific procurement friction
- `[Account] cost efficiency programme budget 2026` — cost discipline context for the commercial objection

## Objection counter formula (same as value pyramid)

**Anchor** — one sentence from their own public statements, renders in bold. Shows you listened.
**Mechanism** — one to two sentences explaining how Stack Internal resolves the tension. Use their language: their programme name, their platform, their number.
**Likely raiser** — which stakeholder archetype raises this (economic buyer / technical evaluator / champion / procurement).
**When it surfaces** — discovery / demo / commercial / procurement stage.

Bad counter: "Stack Internal is enterprise-grade and integrates with your existing tools."
Good counter: "You've positioned Copilot as the UI for Barclays AI — [mechanism explaining Stack Internal as the knowledge layer underneath it, not competing with it]."

---

## MEDDICC renewal lens (existing customers only)

Skip entirely for prospects.

For existing customers, score each element 1–5 with a RAG colour and a one-line evidence note:

| Element | What to assess for a renewal |
|---|---|
| Metrics | Do we have a quantified productivity story? Internal usage data vs. licence count. |
| Economic buyer | Who controls the renewal budget? Same person who bought, or has it moved? |
| Decision criteria | What does the customer need to see to renew/expand vs. downsell? |
| Decision process | TPSP review required? Procurement involved? Timeline back from renewal date. |
| Identify pain | Is the original pain still live, or has it been partially solved by a competitor? |
| Champion | Rivera trait assessment: access to power / reason to move / willing to sell internally. |
| Competition | Microsoft native feature risk / build-vs-buy / incumbent vendor. |

Champion health — structured traffic light per Rivera trait:
- 🟢 Green: confirmed from discovery
- 🟡 Amber: inferred, needs verification
- 🔴 Red: unknown or known weakness

---

## RAG health calculation

Each layer has a `last_researched` date in the config. The HTML renderer calculates:
- 🟢 Green: researched within 30 days
- 🟡 Amber: 31–90 days
- 🔴 Red: older than 90 days, or layer is thin/incomplete

Leadership change rule: if the trigger log contains a leadership change event dated within 90 days, Layer 1 badge is forced to 🔴 with the note "leadership change detected — stakeholder map may need review."

Refresh behaviour: when the skill re-runs on an existing account, it reads the previous HTML file, extracts `last_researched` timestamps and SE-entered manual fields, carries them forward, and surfaces new research as "🆕 New since last refresh [date]" at the top of the dossier.
