# Research guide — filling the five pyramid levels

Work top-down. Every fact that goes in the deck should be **public, attributable, and ideally dated and quantified**. The pyramid's persuasive power comes from the customer's own words and numbers — never pad a level with generic industry claims.

## Search sequence

Run these searches (adapt names/years to the account and current date):

1. `<Account> investor day strategic plan <year>` — vision, CEO/Chair commitments, financial targets
2. `<Account> AI strategy <year>` — the AI/technology programme, named executives, value targets
3. `<Account> <known AI partnership or platform>` — partnership details, rollout numbers
4. `<Account> annual report technology transformation` — programme names, platform names
5. `<Account> AI developers engineering` — execution proof points (developer counts, code metrics, copilot usage)
6. `<Account> UK` or relevant regional entity — local angle (acquisitions, integrations, regional programmes)

Prefer primary sources (the account's own newsroom, investor relations PDFs, exec bylines) over aggregators. Fetch full articles when snippets are thin.

## What each level needs

| Level | Contents | Quality bar |
|---|---|---|
| 1. Vision | The self-description in the account's own words ("AI-native bank") — quote fragments under 15 words | Verbatim-adjacent, attributable to Chair/CEO or official comms |
| 2. Strategic plan | Board-level commitments: customer/revenue/profit targets, efficiency ratios, named transformation programmes | Numbers with dates and the event where they were announced |
| 3. AI/tech programme | The AI value target, programme pillars, named owners (CDO/CTO/CAIO), partnerships, platform names | Named executives and quantified targets |
| 4. Execution today | Proof-point stats: adoption counts, AI-written code %, copilot coverage, automation wins | Exactly 6 stats for the grid; each dated; big-number-first phrasing |
| 5. The gap | Where the product fills the capability gap the four levels above create | Argued FROM their numbers, not from our feature list |

## Level 5 argument patterns (Stack Internal)

The default product is Stack Internal. The four standard rows, adapted per account:

1. **Ground the agents** — agentic AI is only as good as retrieved knowledge; curated, current, human-validated, with provenance.
2. **Close the loop** — high AI-written-code % or rapid change means knowledge decays; capture-validate-reuse loop via MCP write-back (vs read-only connectors).
3. **Model-agnostic / ecosystem fit** — if the account has a named model-vendor partnership (OpenAI, Microsoft, etc.), position as the knowledge layer underneath every model, never as competing with the partnership.
4. **Governance** — attribution, SME validation, Content Health as auditable answers to "why did the agent say that?", tied to any Responsible AI policy or regulatory pressure the account has stated.

If selling a different product, keep the same argument shape: each row must connect a stated account fact (from levels 2–4) to a capability, in one sentence of their-problem followed by one sentence of our-mechanism.

## Standing caveats

- **Verify names before outreach.** Exec names and reporting lines come from public reporting and drift. Put this caveat in the entry slide's speaker notes every time.
- **Positioning line** — one sentence, second person, tying their biggest public number to trust in knowledge. Formula: "You've committed <their number> to <their programme>. We make sure the knowledge it runs on is worth trusting."
- **Discovery questions** — three, each anchored to a specific stat from level 4, phrased so the stat does the selling.
- Never include anything from private conversations, CRM data, or internal deal knowledge in this deck — it should be shareable as-is in an internal enablement channel.

---

## Objection research — what to pull per account

Run these additional searches alongside the main sequence:

- `<Account> vendor strategy AI consolidation` — confirms whether they have a named strategic partnership (OpenAI, Microsoft, Google) that creates the consolidation objection
- `<Account> data residency information security AI` — surfaces any stated data governance position or regulatory constraint
- `<Account> developer platform tools engineering productivity` — reveals incumbent tooling (SharePoint, Confluence, internal wikis, RAG pipelines) and the build-vs-buy risk
- `<Account> responsible AI ethics policy` — finds the governance language you anchor the security counter to
- `<Account> change management employee AI training adoption` — surfaces adoption language (mandatory training, rollout timescales) that makes the change-fatigue objection and its counter concrete

## Objection counter formula

Every counter has two parts:

1. **Anchor** — one sentence quoting (or closely paraphrasing) something the account has publicly committed to. This is the `counter_anchor` field and renders in bold. It disarms the objection by showing you listened.
2. **Mechanism** — one to two sentences explaining how Stack Internal resolves the tension the objection expresses. Reference their language (their programme name, their platform name, their number), not ours.

Bad counter (generic): *"Stack Internal is enterprise-grade and integrates with your existing tools."*
Good counter (anchored): *"You've said your architecture is deliberately modular and vendor-neutral. [mechanism referencing their specific partner and our position underneath it]."*

The objection archetype list is a starting point, not a ceiling. If research surfaces a specific blocker (e.g. the account recently had a public data breach, or has a group procurement freeze) add a bespoke objection row for it.
