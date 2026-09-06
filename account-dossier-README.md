# account-dossier

**Skill type:** SE intelligence  
**Output:** Self-contained HTML file  
**Audience:** Internal only — never share with the account

Builds a Strategic Account Dossier: a deep, sourced intelligence document covering stakeholder org charts, career trajectories, strategic plans, technical architecture, commercial signals, a value hypothesis, and account-specific objection handling. This is the SE's working intelligence layer — distinct from the [value pyramid](value-pyramid-README.md), which is a presentable external artefact.

---

## When to use it

Invoke this skill whenever you need to:

- Research an account before a strategic meeting ("prep me for the Barclays call")
- Build a full intelligence picture on a prospect or existing customer ("run the dossier for X")
- Understand who to contact at an account and why
- Surface an account's AI strategy and map your product against their specific situation
- Prepare a renewal plan using the MEDDICC lens (existing customers only)

Trigger phrases: "run the [Account] job", "do the dossier for X", "build me the full picture on X", "build account intel on X".

---

## Output

A single `.html` file saved to `/mnt/user-data/outputs/[account]-dossier.html`. Drop it in the account folder in shared Google Drive.

The HTML has four collapsible layers, each with a RAG health badge calculated from how recently the layer was researched:

| Badge | Meaning |
|---|---|
| 🟢 Green | Researched within 30 days |
| 🟡 Amber | 31–90 days old |
| 🔴 Red | Older than 90 days, incomplete, or a leadership change detected within 90 days |

---

## What's in the dossier

### Layer 1 — Stakeholder map

Up to 6 stakeholders, each with:

- Current title and reporting line (verified, dated within 12 months)
- Public voice: conference appearances, panels, exec bylines
- Co-marketing commitments (Microsoft, OpenAI, etc.)
- Career trajectory and cross-company history
- Recent LinkedIn activity
- Relationship matrix: shared employment history between stakeholders (verifiable connections only — no inference)
- SE-fillable manual fields: coverage status, champion health, relationship quality

Champion health uses the Rivera trait framework:
- 🟢 Green: confirmed from discovery
- 🟡 Amber: inferred, needs verification
- 🔴 Red: unknown or a known weakness

### Layer 2 — Strategic intelligence

Prose (not bullets) covering:
- Vision and CEO commitments from investor days and annual reports
- Financial targets and transformation programme names
- Their own language and framing from earnings calls and exec interviews
- Trigger events: acquisitions, mergers, restructuring

### Layer 3 — Technical architecture

- Named platforms and tools: Copilot, GitHub Copilot, cloud providers, ERP
- Active job postings that reveal team names and stack
- Engineering blog signals
- Where the product fits in their stack

### Layer 4 — Commercial signals

**Existing customers:** Full MEDDICC renewal lens (scored 1–5 with RAG colour and evidence note):

| Element | What to assess |
|---|---|
| Metrics | Quantified productivity story; usage data vs. licence count |
| Economic buyer | Who controls renewal budget? Same person, or has it moved? |
| Decision criteria | What does the customer need to see to renew, expand, or downsell? |
| Decision process | TPSP review? Procurement involved? Timeline back from renewal date |
| Identify pain | Is the original pain still live, or partially solved by a competitor? |
| Champion | Rivera traits: access to power / reason to move / willing to sell internally |
| Competition | Microsoft native feature risk / build-vs-buy / incumbent vendor |

**Prospects:** MEDDICC section is suppressed entirely.

### Value hypothesis

Three testable hypotheses — not conclusions:

- **Why anything** — the problem the account faces, grounded in their own stated facts, with a discovery test and an alternative explanation.
- **Why this product** — the architecture gap and the specific wedge (MCP write-back / closed loop / provenance), with a confirm/challenge note.
- **Why now** — for prospects: the external trigger event and what confirms urgency; for existing customers: the renewal/expansion window and the internal signal to watch.

### Objection handling

Up to 6 objections, each anchored to an account-specific public fact (never generic). Each includes:

- **Anchor** — one sentence from the account's own public statements, rendered in bold
- **Mechanism** — how the product resolves the tension, in the account's language (their programme name, their number)
- **Likely raiser** — economic buyer / technical evaluator / champion / procurement
- **When it surfaces** — discovery / demo / commercial / procurement stage

### Trigger log

Dated events newest-first. Drives RAG health recalculation and flags leadership changes.

---

## Workflow

### Before starting — two questions

1. **Prospect or existing customer?** Determines whether MEDDICC scoring runs and how "why now" is framed.
2. **Any internal context to fold in?** Champion health, usage data, deal notes, evaluation status — things public research can't surface.

Then proceed immediately.

### Research — 19-search sequence

The skill follows a fixed search sequence across four layers. Every claim requires a source and a date. Paywalled or inaccessible sources are noted as gaps, not inferred from snippets.

**Layer 1 — Stakeholders (searches 1–6):**
1. Confirm current title and reporting line
2. Public voice: interviews, panels, conference speaker slots
3. Co-marketing commitments (Microsoft, OpenAI)
4. Career trajectory
5. LinkedIn activity
6. Shared employment history between stakeholders

**Layer 2 — Strategic intelligence (searches 7–11):**
7. Investor day: vision, CEO commitments, financial targets
8. Annual report: named programmes, platforms, spend
9. CEO/Chair interview on AI and digital strategy
10. Earnings call transcript
11. News: acquisitions, mergers, restructuring

**Layer 3 — Technical architecture (searches 12–16):**
12. Microsoft Copilot / GitHub Copilot deployment
13. Developer tools and engineering productivity platforms
14. Active job ads (reveal team names and stack)
15. Engineering blog
16. Cloud, ERP, and platform stack

**Layer 4 — Commercial and objection research (searches 17–19 + extras):**
17. Vendor strategy and AI consolidation
18. Data residency, information security, responsible AI policy
19. Change management and employee AI adoption
- Build vs. buy posture
- Third-party supplier / vendor risk management
- Cost efficiency and budget discipline

Prefer primary sources: the account's own newsroom, investor relations PDFs, SEC filings, exec bylines. Mark aggregator sources (TheOrg, PitchBook) as "lead — verify independently."

### Build

```bash
node scripts/build_dossier.js <config.json> <output.html>
```

The config is based on `assets/example-config.json` (a complete worked example using Barclays). All content is replaced per the research above.

### QA

Before delivering, verify:
- RAG badges render correctly per layer
- All source links are real URLs (not constructed)
- No placeholder text remaining
- Stakeholder fields with missing data show "— verify", not blank
- MEDDICC section is present for existing customers, absent for prospects
- Value hypothesis is clearly marked as hypothesis, not conclusion

### Re-running on an existing account

When the skill re-runs on an account with an existing dossier, it reads the previous HTML, extracts `last_researched` timestamps and SE-entered manual fields, carries them forward, and surfaces new research as "🆕 New since last refresh [date]" at the top.

---

## Judgment calls

**Facts over inference.** If the relationship matrix shows two people worked at the same firm for the same period, say that. Don't add "they likely know each other well." The SE adds qualitative context from their own conversations.

**Prospect vs. existing.** The branching question changes more than MEDDICC — the "why now" in the value hypothesis is also different. The config has both variants; the script suppresses the irrelevant one.

**RAG health is honest.** If a layer couldn't be adequately researched, the badge goes red with a note explaining what's missing — not green because the section exists. An honest gap is more useful than a padded section.

**Sensitivity.** The dossier must contain only public information in the research layers. The SE's manually entered fields — champion health, coverage status, MEDDICC scores, deal notes — are the only place private deal context lives.

**Verify exec names before outreach.** Org structures at this level shift quarterly. This warning appears in the Layer 1 speaker notes every time.

---

## Files in the skill

| File | Purpose |
|---|---|
| `SKILL.md` | Skill definition — loaded by Claude Code |
| `references/research-guide.md` | 19-search sequence, quality bars per layer, value hypothesis templates, MEDDICC scoring guide, RAG health logic |
| `assets/example-config.json` | Complete worked example (Barclays) — copy and replace content |
| `scripts/build_dossier.js` | Node.js script that renders the config to a self-contained HTML file |
