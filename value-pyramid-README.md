# value-pyramid

**Skill type:** SE account strategy  
**Output:** Research summary in chat + branded 7-slide .pptx deck  
**Audience:** Shareable internally; safe to take into meetings

Builds an Account Value Pyramid — a researched, top-down account strategy deck that cascades from a target company's public vision through its strategic plan, AI/technology programme, and execution proof points, down to the capability gap your product fills. Every argument is built from the customer's own words and numbers.

---

## When to use it

Invoke this skill whenever you need to:

- Build a deck for a strategic account meeting grounded in the account's own public commitments
- Map an account's AI initiatives top-down ("do a value pyramid for HSBC")
- Position your product against a prospect's stated AI strategy
- Produce a shareable account strategy document for internal enablement

Trigger phrases: "value pyramid for X", "do the same pyramid for another company", "build me an account strategy deck for X", "map X's AI programme and show where we fit".

---

## Output

Two things:

1. **Research summary in chat** — cited findings per pyramid level, before any deck is built. Lets you validate the intelligence before committing it to slides.
2. **A branded .pptx deck** saved to the outputs directory — 7 slides (with an optional 8th for objections).

---

## The pyramid method

The deck argument flows top-down:

```
Level 1: Their vision (their own words)
Level 2: Their strategic plan (board-level commitments, numbers, programme names)
Level 3: Their AI/tech programme (named owners, partnerships, platforms)
Level 4: Execution today (6 proof-point stats)
Level 5: THE GAP → [your product]
```

The persuasive power comes from building the argument from the customer's public commitments — not from your feature list. By the time the gap slide lands, the customer has effectively stated the problem themselves.

---

## Deck structure

| Slide | Contents |
|---|---|
| 1 | Title / entry slide |
| 2 | The 5-level pyramid (visual) |
| 3 | Vision and strategic plan detail |
| 4 | AI/tech programme detail |
| 5 | Execution proof points — exactly 6 stats, big-number-first phrasing, each dated |
| 6 | The gap — exactly 4 rows plus a positioning line |
| 7 | Next moves — who to reach, regional/timing angle, 3 discovery questions, next steps |
| 8 | Objections (optional) — include by adding `objections_slide` to the config |

Every slide has speaker notes (`notes` field in the config): what to say, not what's on the slide.

---

## What each level needs

| Level | Contents | Quality bar |
|---|---|---|
| 1. Vision | Their self-description in their own words ("AI-native bank") — quote fragments under 15 words | Verbatim-adjacent, attributable to Chair/CEO or official comms |
| 2. Strategic plan | Board-level commitments: customer/revenue/profit targets, efficiency ratios, named transformation programmes | Numbers with dates and the event where they were announced |
| 3. AI/tech programme | AI value target, programme pillars, named owners (CDO/CTO/CAIO), partnerships, platform names | Named executives and quantified targets |
| 4. Execution today | Proof-point stats: adoption counts, AI-written code %, copilot coverage, automation wins | Exactly 6 stats, each dated, big-number-first phrasing |
| 5. The gap | Where the product fills the capability gap the four levels above create | Argued from their numbers, not your feature list |

---

## Gap slide argument patterns (Stack Internal)

Four standard rows, adapted per account. Each row connects a stated account fact to a capability:

1. **Ground the agents** — agentic AI is only as good as retrieved knowledge; curated, current, human-validated, with provenance.
2. **Close the loop** — high AI-written-code % or rapid change means knowledge decays; capture-validate-reuse loop via MCP write-back (vs. read-only connectors).
3. **Model-agnostic / ecosystem fit** — if the account has a named model-vendor partnership (OpenAI, Microsoft, etc.), position as the knowledge layer underneath every model — never competing with the partnership.
4. **Governance** — attribution, SME validation, Content Health as auditable answers to "why did the agent say that?", tied to any Responsible AI policy or regulatory pressure the account has stated.

For a different product: keep the same argument shape. Each row must be one sentence of their-problem followed by one sentence of our-mechanism.

---

## Objection handling (slide 8)

Optional. Each objection counter has two parts:

**Anchor** — one sentence quoting or closely paraphrasing something the account has publicly committed to. Renders in bold. Disarms the objection by showing you listened.

**Mechanism** — one to two sentences explaining how the product resolves the tension. Use their language: their programme name, their platform, their number.

Example:
- **Bad (generic):** "Stack Internal is enterprise-grade and integrates with your existing tools."
- **Good (anchored):** "You've said your architecture is deliberately modular and vendor-neutral. [mechanism referencing their specific partner and our position underneath it]."

Add bespoke objections for anything research surfaces (a recent public data breach, a group procurement freeze) — the archetype list is a starting point, not a ceiling.

---

## Positioning line

One sentence, second-person, tying their biggest public number to trust in knowledge.

Formula: "You've committed [their number] to [their programme]. We make sure the knowledge it runs on is worth trusting."

---

## Discovery questions

Three questions on slide 7, each anchored to a specific stat from level 4, phrased so the stat does the selling.

---

## Workflow

### 1. Research

Read `references/research-guide.md` before starting any searches. Run the full search sequence:

1. `<Account> investor day strategic plan <year>` — vision, CEO/Chair commitments, financial targets
2. `<Account> AI strategy <year>` — the AI/technology programme, named executives, value targets
3. `<Account> <known AI partnership or platform>` — partnership details, rollout numbers
4. `<Account> annual report technology transformation` — programme names, platform names
5. `<Account> AI developers engineering` — execution proof points (developer counts, code metrics, copilot usage)
6. `<Account> UK` (or relevant regional entity) — local angle: acquisitions, integrations, regional programmes

Objection research (additional searches alongside the main sequence):
- `<Account> vendor strategy AI consolidation` — named strategic partnership that creates the consolidation objection
- `<Account> data residency information security AI` — stated governance position or regulatory constraint
- `<Account> developer platform tools engineering productivity` — incumbent tooling and build-vs-buy risk
- `<Account> responsible AI ethics policy` — governance language to anchor the security counter
- `<Account> change management employee AI training adoption` — adoption language for the change-fatigue objection

Prefer primary sources: the account's own newsroom, investor relations PDFs, exec bylines. Fetch full articles when snippets are thin.

Summarise findings in chat with citations before building anything.

### 2. Fill the config

Copy `assets/example-config.json` (a complete worked example: Santander) and replace all content. Key structural rules:

- Slide 2 pyramid: exactly 5 levels, top = vision, base = "THE GAP → [product]"
- Slide 5: exactly 6 stats
- Slide 6: exactly 4 gap rows plus a positioning line
- Slide 7: 4 cards — who to reach, a regional/timing angle, 3 discovery questions, next moves
- Speaker notes on every slide

### 3. Set the brand accent

`colors.accent` is the account's primary brand colour (hex, no `#`). Also provide:
- `accentDark` — readable small text on white
- `accentLight` — readable text on charcoal (`2B303A`)

If the brand colour is dark, `accentLight` must be substantially lightened. If light, `accentDark` must be darkened. Contrast is non-negotiable.

### 4. Build

```bash
node scripts/build_deck.js <config.json> <output.pptx>
```

Icons are react-icons Feather names (e.g. `FiUsers`). The script fails loudly on unknown icon names. Slide 8 (objections) only renders if `objections_slide` is present in the config.

### 5. QA

Validate the file and render every slide to images (validate.py, soffice → pdftoppm per the pptx skill's QA section). Check especially for:
- Text overflow in the 6-stat grid and the 4-row gap slide
- Low-contrast accent text on white or charcoal backgrounds

Fix in the config, rebuild, re-render changed slides only.

### 6. Deliver

Copy to the outputs directory and present the file. In chat: one-line-per-slide summary plus any caveats (verify exec names). Do not restate the deck content.

---

## Judgment calls

**Partnerships are assets, not threats.** If the account has a named AI vendor partnership, the gap slide positions the product underneath it — never against it.

**Facts over adjectives.** If a level can't be filled with dated, quantified, attributable material, say so in chat and thin that level rather than padding it with industry generalities.

**Shareability.** The deck must contain only public information — no CRM data, private conversations, or internal deal knowledge — so it can be circulated without review.

**Verify exec names before outreach.** Org structures drift. This caveat goes in the entry slide's speaker notes every time.

---

## Files in the skill

| File | Purpose |
|---|---|
| `SKILL.md` | Skill definition — loaded by Claude Code |
| `references/research-guide.md` | Search sequence, quality bars per level, gap argument patterns, objection counter formula |
| `assets/example-config.json` | Complete worked example (Santander) — copy and replace content |
| `scripts/build_deck.js` | Node.js script that renders the config to a branded .pptx file |
