---
name: account-dossier
description: Build a Strategic Account Dossier — a deep, sourced intelligence document covering stakeholder org chart, career trajectories, public voice, strategic intelligence, technical architecture, commercial signals, value hypothesis, and objection handling. Use this whenever the user asks to research an account, build a dossier, create account intelligence, prep for a strategic meeting, or says things like "run the Barclays job", "do the dossier for X", or "build me the full picture on X". Also use when the user wants to understand who to contact at an account, what their AI strategy is, or how to position Stack Internal against their specific situation. This skill is the SE's working intelligence layer — distinct from the value pyramid (which is a presentable external artefact). Use it proactively whenever an account is being discussed in depth.
---

# Strategic Account Dossier

Produces a self-contained, shareable HTML dossier. Output goes to `/mnt/user-data/outputs/[account]-dossier.html`. Drop it in the relevant account folder in shared Google Drive.

**INTERNAL ONLY — not for sharing with the account.**

## Workflow

### Step 0 — Ask two questions before starting

Ask the user:
1. **Is this a prospect or an existing customer?** (determines whether MEDDICC scoring runs)
2. **Any internal context to fold in?** (Victoria's evaluation status, known champion health, usage data, deal notes — things public research can't surface)

Then proceed immediately without waiting for further prompts.

### Step 1 — Research

Read `references/research-guide.md` in full before starting any searches. Follow the 19-search sequence. Facts only — every claim needs a source and a date. If a source is paywalled or inaccessible, note it as a gap rather than inferring from the snippet.

Summarise findings in chat by layer as you go — don't front-load everything into one dump. The user should see the intelligence emerging.

### Step 2 — Fill the config

Copy `assets/example-config.json` (Barclays — a complete worked example) and replace all content. The config drives the HTML renderer. Key structural rules:
- Layer 1: up to 6 stakeholders, each with all fields populated where researchable; manual fields (coverage status, champion health, relationship quality) left as prompts for the SE to fill
- Layer 2: strategic intelligence in prose, not bullets — this is the deep version of the pyramid
- Layer 3: technical architecture — where does the product fit in their stack
- Layer 4: commercial signals — existing customer gets MEDDICC renewal lens; prospect skips MEDDICC
- Value hypothesis: three whys, each stated as a testable hypothesis with a confirm/challenge note
- Objections: up to 6, all anchored to account-specific public facts, not generic claims
- Trigger log: dated events newest-first; RAG status auto-calculated from `last_researched` dates

### Step 3 — Build

```bash
node scripts/build_dossier.js <config.json> <output.html>
```

### Step 4 — QA

Open the HTML output and check:
- RAG badges rendering correctly per layer
- All source links are real URLs (not constructed)
- No placeholder text remaining
- Stakeholder fields with missing data show "— verify" not blank
- MEDDICC section present for existing customers, absent for prospects
- Value hypothesis clearly marked as hypothesis, not conclusion

### Step 5 — Deliver

Copy to outputs, present the file. In chat: one paragraph summarising the highest-value findings (the thing that changes the account plan), plus any gaps the SE needs to fill from internal sources.

---

## Slide 8 equivalents in the dossier

The dossier has no slides — it has collapsible sections. The objection handling section mirrors the value pyramid's slide 8 but goes deeper: each objection includes the account-specific anchor, the mechanism, and a note on which stakeholder is most likely to raise it and when in the sales cycle it typically surfaces.

## Judgment calls

**Facts over inference.** If the relationship matrix shows two people worked at the same firm for the same period, say that. Don't add "they likely know each other well." The SE adds qualitative context from their own conversations.

**Prospect vs. existing.** The branching question changes more than MEDDICC — the "why now" in the value hypothesis is also different (external trigger for prospects; renewal/expansion timeline for existing customers). The config has both variants; the script suppresses the irrelevant one.

**RAG health is honest.** If a layer couldn't be adequately researched, the badge goes red with a note explaining what's missing — not green because the section exists. An honest gap is more useful than a padded section.

**Sensitivity.** The dossier must contain only public information in the research layers. The SE's manually entered fields (champion health, coverage status, MEDDICC scores, deal notes) are the only place private deal context lives.

**Verify exec names before outreach.** Say this in the Layer 1 speaker notes every time. Org structures at this level shift quarterly.
