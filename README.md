# SE Skills

Agent skills for Sales Engineers, packaged as a [plugin marketplace](https://code.claude.com/docs/en/plugin-marketplaces) that works with both **Claude Code** and **Codex**. Each skill follows the open [agentskills.io](https://agentskills.io/home) format: a `skills/<name>/SKILL.md` file plus bundled `scripts/`, `references/`, and `assets/`.

## Skills

| Skill | Description |
|---|---|
| [account-dossier](account-dossier-README.md) | Deep internal intelligence dossier on a target account — stakeholder map, strategic intel, technical architecture, commercial signals, and objection handling |
| [value-pyramid](value-pyramid-README.md) | Researched, top-down account strategy deck built from the customer's own public commitments, cascading to the gap your product fills |

## Installation

### Claude Code

Add this repo as a plugin marketplace, then install the skills you want:

```
/plugin marketplace add nickcole1001/se-skills
/plugin install account-dossier@se-skills
/plugin install value-pyramid@se-skills
```

Alternatively, download an individual `.skill` file from this repo and install it directly.

### Codex

Codex discovers skills by scanning `.agents/skills` from the repository root. Clone this repo and open it with Codex — the skills under [`skills/`](skills/) are exposed at `.agents/skills` via a symlink, so no extra setup is needed.

To make a skill available outside this repo (user scope), copy or symlink its folder into `$HOME/.agents/skills/`:

```
ln -s "$(pwd)/skills/account-dossier" "$HOME/.agents/skills/account-dossier"
```

### Any other agentskills.io-compatible client

Each folder under [`skills/`](skills/) is a standalone, spec-compliant skill directory — point any compatible agent at `skills/account-dossier` or `skills/value-pyramid` directly.

## Relationship between the two skills

These skills are complementary, not interchangeable:

- **account-dossier** is the SE's working intelligence layer — an internal-only HTML document that goes deep on people, strategy, architecture, and commercial risk. It is never shared with the account.
- **value-pyramid** is a presentable external artefact — a branded .pptx deck built from the same research, shaped into a top-down sales argument. It is designed to circulate internally and be taken into meetings.

Run the dossier first to gather and validate the intelligence. Use the value pyramid when you need a shareable, structured output for a meeting or an internal enablement channel.
