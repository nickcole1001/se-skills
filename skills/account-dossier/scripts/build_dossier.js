#!/usr/bin/env node
/**
 * build_dossier.js — renders a Strategic Account Dossier as a self-contained HTML file.
 *
 * Usage: node build_dossier.js <config.json> <output.html>
 *
 * The HTML file is fully self-contained (no external dependencies) and opens in
 * any browser. Drop it into the account's Google Drive folder for team sharing.
 *
 * See assets/example-config.json (Barclays) for a complete worked example.
 */

const fs = require("fs");
const path = require("path");

const [, , configPath, outPath] = process.argv;
if (!configPath || !outPath) {
  console.error("Usage: node build_dossier.js <config.json> <output.html>");
  process.exit(1);
}

const cfg = JSON.parse(fs.readFileSync(configPath, "utf8"));

// ---- RAG calculation ----
function ragStatus(dateStr) {
  if (!dateStr) return { color: "red", label: "Not researched", days: null };
  const days = Math.floor((Date.now() - new Date(dateStr)) / 86400000);
  if (days <= 30) return { color: "green", label: `${days}d ago`, days };
  if (days <= 90) return { color: "amber", label: `${days}d ago`, days };
  return { color: "red", label: `${days}d ago — refresh needed`, days };
}

function ragBadge(dateStr, forceRed) {
  const s = forceRed ? { color: "red", label: "Leadership change detected — review stakeholder map" } : ragStatus(dateStr);
  const colors = { green: "#16a34a", amber: "#d97706", red: "#dc2626" };
  const bgs = { green: "#f0fdf4", amber: "#fffbeb", red: "#fef2f2" };
  return `<span class="rag-badge" style="background:${bgs[s.color]};color:${colors[s.color]}">`
    + `<span class="rag-dot" style="background:${colors[s.color]}"></span>${s.label}</span>`;
}

// ---- Trigger log: detect leadership changes ----
function hasLeadershipChange(triggers) {
  if (!triggers) return false;
  return triggers.some(t => /leadership|cio|cto|cdo|appointed|promoted|new.*head|head.*new/i.test(t.event));
}

// ---- New-since-refresh banner ----
function newSinceBanner(cfg) {
  if (!cfg.meta?.last_refresh || !cfg.meta?.new_since_refresh?.length) return "";
  return `<div class="new-since-banner">
    <strong>🆕 New since last refresh (${cfg.meta.last_refresh})</strong>
    <ul>${cfg.meta.new_since_refresh.map(n => `<li>${esc(n)}</li>`).join("")}</ul>
  </div>`;
}

function esc(s) {
  return String(s || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

function src(url, label) {
  if (!url) return esc(label || "");
  return `<a href="${esc(url)}" target="_blank" rel="noopener">${esc(label || url)}</a>`;
}

function trafficLight(status) {
  const map = { green: "🟢", amber: "🟡", red: "🔴", unknown: "⚪" };
  return map[status] || "⚪";
}

// ---- Section builder helpers ----
function section(id, title, ragDate, forceRed, collapsedByDefault, body) {
  const badge = ragBadge(ragDate, forceRed);
  const open = collapsedByDefault ? "" : " open";
  return `
<details class="section"${open} id="${id}">
  <summary class="section-summary">
    <span class="section-title">${esc(title)}</span>
    ${badge}
  </summary>
  <div class="section-body">${body}</div>
</details>`;
}

// ---- Layer 1: Stakeholders ----
function buildLayer1(cfg) {
  const stk = cfg.layer1_stakeholders || {};
  const leadershipChange = hasLeadershipChange(cfg.layer4_commercial?.trigger_log);
  let html = `<p class="layer-intro">${esc(stk.intro || "")}</p>`;

  (stk.stakeholders || []).forEach(p => {
    html += `<div class="stakeholder-card">
      <div class="stakeholder-header">
        <div>
          <span class="stakeholder-name">${esc(p.name)}</span>
          <span class="stakeholder-title">${esc(p.title)}</span>
        </div>
        <div class="stakeholder-meta">
          <span class="coverage-badge coverage-${(p.coverage_status || "unknown").toLowerCase().replace(/\s/g,"-")}">${esc(p.coverage_status || "Not yet reached")}</span>
          ${p.buying_role ? `<span class="role-tag">${esc(p.buying_role)}</span>` : ""}
        </div>
      </div>
      <div class="stakeholder-body">
        <div class="field-grid">
          ${field("Role in AI programme", p.role_in_ai_programme)}
          ${field("Why they care", p.why_they_care)}
          ${field("Career — previous employers", p.career_previous)}
          ${field("Career — current org movement", p.career_current_org)}
          ${field("Career velocity", p.career_velocity)}
        </div>
        ${publicVoice(p)}
        ${championHealth(p)}
        ${p.relationship_notes ? `<div class="manual-field"><span class="manual-label">⚠ Relationship notes (SE to verify)</span><p>${esc(p.relationship_notes)}</p></div>` : ""}
      </div>
    </div>`;
  });

  if (stk.relationship_matrix?.length) {
    html += `<h3 class="sub-heading">Relationship matrix — verified connections only</h3>
    <table class="data-table"><thead><tr><th>Person A</th><th>Person B</th><th>Verified connection</th><th>Quality (SE to fill)</th></tr></thead><tbody>`;
    stk.relationship_matrix.forEach(r => {
      html += `<tr><td>${esc(r.person_a)}</td><td>${esc(r.person_b)}</td><td>${esc(r.connection)}</td><td class="manual-cell">${esc(r.quality || "— verify")}</td></tr>`;
    });
    html += `</tbody></table>`;
  }

  return section("layer1", "Layer 1 — Stakeholder Org Chart & Access Map", stk.last_researched, leadershipChange, false, html);
}

function field(label, value) {
  if (!value) return `<div class="field"><div class="field-label">${esc(label)}</div><div class="field-value field-empty">— verify</div></div>`;
  return `<div class="field"><div class="field-label">${esc(label)}</div><div class="field-value">${esc(value)}</div></div>`;
}

function publicVoice(p) {
  const items = p.public_voice || [];
  if (!items.length) return "";
  return `<div class="public-voice">
    <div class="pv-label">Public voice &amp; profile</div>
    <ul class="pv-list">${items.map(v =>
      `<li><span class="pv-type">${esc(v.type)}</span> ${esc(v.description)} ${v.url ? `<a href="${esc(v.url)}" target="_blank" rel="noopener">→ source</a>` : ""} ${v.date ? `<span class="pv-date">${esc(v.date)}</span>` : ""}</li>`
    ).join("")}</ul>
  </div>`;
}

function championHealth(p) {
  if (!p.champion_health) return "";
  const ch = p.champion_health;
  return `<div class="champion-health">
    <div class="ch-label">Champion health (Rivera traits)</div>
    <div class="ch-grid">
      <div class="ch-trait"><span class="ch-icon">${trafficLight(ch.access_to_power?.status)}</span><span class="ch-name">Access to power</span><span class="ch-note">${esc(ch.access_to_power?.note || "— SE to assess")}</span></div>
      <div class="ch-trait"><span class="ch-icon">${trafficLight(ch.reason_to_move?.status)}</span><span class="ch-name">Reason to move</span><span class="ch-note">${esc(ch.reason_to_move?.note || "— SE to assess")}</span></div>
      <div class="ch-trait"><span class="ch-icon">${trafficLight(ch.willing_to_sell_internally?.status)}</span><span class="ch-name">Willing to sell internally</span><span class="ch-note">${esc(ch.willing_to_sell_internally?.note || "— SE to assess")}</span></div>
    </div>
  </div>`;
}

// ---- Layer 2: Strategic intelligence ----
function buildLayer2(cfg) {
  const si = cfg.layer2_strategic || {};
  let html = "";
  (si.sections || []).forEach(s => {
    html += `<div class="intel-block">
      <h3 class="intel-heading">${esc(s.heading)}</h3>
      <p class="intel-body">${esc(s.body)}</p>
      ${s.source_label && s.source_url ? `<div class="source-line">Source: ${src(s.source_url, s.source_label)}</div>` : ""}
    </div>`;
  });
  return section("layer2", "Layer 2 — Strategic Intelligence", si.last_researched, false, true, html);
}

// ---- Layer 3: Technical architecture ----
function buildLayer3(cfg) {
  const ta = cfg.layer3_technical || {};
  let html = "";
  (ta.sections || []).forEach(s => {
    html += `<div class="intel-block">
      <h3 class="intel-heading">${esc(s.heading)}</h3>
      <p class="intel-body">${esc(s.body)}</p>
      ${s.source_label && s.source_url ? `<div class="source-line">Source: ${src(s.source_url, s.source_label)}</div>` : ""}
    </div>`;
  });
  if (ta.wedge) {
    html += `<div class="wedge-box"><div class="wedge-label">The technical wedge</div><p>${esc(ta.wedge)}</p></div>`;
  }
  return section("layer3", "Layer 3 — Technical Architecture", ta.last_researched, false, true, html);
}

// ---- Layer 4: Commercial signals ----
function buildLayer4(cfg) {
  const co = cfg.layer4_commercial || {};
  const isExisting = cfg.meta?.account_type === "existing";
  let html = "";

  // Trigger log
  if (co.trigger_log?.length) {
    html += `<h3 class="sub-heading">Trigger event log</h3>
    <div class="trigger-log">`;
    co.trigger_log.forEach(t => {
      const isNew = cfg.meta?.last_refresh && t.date > cfg.meta.last_refresh;
      html += `<div class="trigger-item${isNew ? " trigger-new" : ""}">
        <span class="trigger-date">${esc(t.date)}</span>
        <span class="trigger-category">${esc(t.category)}</span>
        <span class="trigger-event">${esc(t.event)}</span>
        ${t.source_url ? `<a class="trigger-source" href="${esc(t.source_url)}" target="_blank" rel="noopener">→</a>` : ""}
        ${isNew ? `<span class="new-tag">NEW</span>` : ""}
      </div>`;
    });
    html += `</div>`;
  }

  // MEDDICC — existing customers only
  if (isExisting && co.meddicc) {
    html += buildMeddicc(co.meddicc);
  } else if (!isExisting) {
    html += `<div class="prospect-note">MEDDICC scoring not shown — this is a prospect account. Add qualification notes from discovery below.</div>`;
    if (co.qualification_notes) {
      html += `<div class="manual-field"><span class="manual-label">Qualification notes (SE)</span><p>${esc(co.qualification_notes)}</p></div>`;
    }
  }

  // Renewal/expansion timeline
  if (co.renewal_date || co.expansion_target) {
    html += `<div class="timeline-box">`;
    if (co.renewal_date) html += `<div class="timeline-item"><span class="timeline-label">Renewal date</span><span class="timeline-value">${esc(co.renewal_date)}</span></div>`;
    if (co.expansion_target) html += `<div class="timeline-item"><span class="timeline-label">Expansion target</span><span class="timeline-value">${esc(co.expansion_target)}</span></div>`;
    html += `</div>`;
  }

  return section("layer4", "Layer 4 — Commercial Signals & Trigger Events", co.last_researched, false, true, html);
}

function buildMeddicc(m) {
  const elements = [
    { key: "metrics", label: "Metrics" },
    { key: "economic_buyer", label: "Economic buyer" },
    { key: "decision_criteria", label: "Decision criteria" },
    { key: "decision_process", label: "Decision process" },
    { key: "identify_pain", label: "Identify pain" },
    { key: "champion", label: "Champion" },
    { key: "competition", label: "Competition" },
  ];
  let html = `<h3 class="sub-heading">MEDDICC — renewal diagnostic</h3><div class="meddicc-grid">`;
  elements.forEach(el => {
    const data = m[el.key] || {};
    const score = data.score || 0;
    const rag = score >= 4 ? "green" : score >= 2 ? "amber" : "red";
    const ragColors = { green: "#16a34a", amber: "#d97706", red: "#dc2626" };
    const ragBgs = { green: "#f0fdf4", amber: "#fffbeb", red: "#fef2f2" };
    html += `<div class="meddicc-card" style="border-left:3px solid ${ragColors[rag]}">
      <div class="meddicc-header">
        <span class="meddicc-label">${esc(el.label)}</span>
        <span class="meddicc-score" style="background:${ragBgs[rag]};color:${ragColors[rag]}">${score}/5</span>
      </div>
      <p class="meddicc-note">${esc(data.note || "— SE to assess")}</p>
    </div>`;
  });
  html += `</div>`;
  return html;
}

// ---- Value hypothesis ----
function buildValueHypothesis(cfg) {
  const vh = cfg.value_hypothesis || {};
  let html = `<p class="layer-intro">${esc(vh.intro || "A testable commercial argument — stated before deep discovery. Use it to build your discovery agenda.")}</p>`;

  ["why_anything", "why_stack_internal", "why_now"].forEach(key => {
    const labels = { why_anything: "Why anything", why_stack_internal: "Why Stack Internal", why_now: "Why now" };
    const d = vh[key] || {};
    html += `<div class="hypothesis-block">
      <div class="hyp-label">${labels[key]}</div>
      <p class="hyp-statement">${esc(d.statement || "— to be filled")}</p>
      ${d.confirmed_if ? `<div class="hyp-test hyp-confirm">✓ Confirmed if: ${esc(d.confirmed_if)}</div>` : ""}
      ${d.challenged_if ? `<div class="hyp-test hyp-challenge">✗ Challenged if: ${esc(d.challenged_if)}</div>` : ""}
    </div>`;
  });

  if (vh.positioning_line) {
    html += `<div class="positioning-line">"${esc(vh.positioning_line)}"</div>`;
  }

  return section("value-hypothesis", "Value Hypothesis", null, false, false, html);
}

// ---- Objections ----
function buildObjections(cfg) {
  const ob = cfg.objections || {};
  let html = `<p class="layer-intro">${esc(ob.intro || "Account-specific objection handling. Each counter is anchored to a fact the account has publicly stated.")}</p>
  <div class="objection-cols">
    <div class="objection-col-header">WHAT THEY'LL SAY</div>
    <div class="objection-col-header">HOW YOU HANDLE IT</div>
  </div>`;

  (ob.objections || []).forEach(o => {
    html += `<div class="objection-row">
      <div class="objection-left">
        <div class="obj-archetype">${esc(o.archetype)}</div>
        <p class="obj-text">${esc(o.objection)}</p>
        <div class="obj-meta">
          ${o.likely_raiser ? `<span class="obj-tag">Raised by: ${esc(o.likely_raiser)}</span>` : ""}
          ${o.when ? `<span class="obj-tag">Stage: ${esc(o.when)}</span>` : ""}
        </div>
      </div>
      <div class="objection-right">
        ${o.counter_anchor ? `<p class="obj-anchor">${esc(o.counter_anchor)}</p>` : ""}
        <p class="obj-counter">${esc(o.counter)}</p>
      </div>
    </div>`;
  });

  if (ob.notes) {
    html += `<div class="ob-notes"><strong>Speaker notes:</strong> ${esc(ob.notes)}</div>`;
  }

  return section("objections", "Objection Handling", null, false, false, html);
}

// ---- Gaps ----
function buildGaps(cfg) {
  const gaps = cfg.gaps || [];
  if (!gaps.length) return "";
  let html = `<ul class="gap-list">`;
  gaps.forEach(g => {
    html += `<li class="gap-item"><span class="gap-icon">⚠</span><span class="gap-text">${esc(g)}</span></li>`;
  });
  html += `</ul>`;
  return section("gaps", "Gaps — What Still Needs Internal Verification", null, false, true, html);
}

// ---- Source register ----
function buildSources(cfg) {
  const sources = cfg.sources || [];
  if (!sources.length) return "";
  let html = `<div class="source-register">`;
  sources.forEach(s => {
    html += `<div class="source-entry">
      <span class="source-type">${esc(s.type)}</span>
      <span class="source-desc">${s.url ? src(s.url, s.label) : esc(s.label)}</span>
      ${s.date ? `<span class="source-date">${esc(s.date)}</span>` : ""}
    </div>`;
  });
  html += `</div>`;
  return section("sources", "Source Register", null, false, true, html);
}

// ---- Full HTML assembly ----
function buildHTML(cfg) {
  const meta = cfg.meta || {};
  const isExisting = meta.account_type === "existing";
  const leadershipChange = hasLeadershipChange(cfg.layer4_commercial?.trigger_log);
  const generatedDate = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const refreshDue = meta.last_researched
    ? new Date(new Date(meta.last_researched).getTime() + 30 * 86400000).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : "—";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(meta.account_name)} — Strategic Account Dossier</title>
<style>
:root {
  --ink: #1a1f2e; --muted: #5a6478; --paper: #fff; --soft: #f4f6f9;
  --border: #e2e6ed; --accent: #2563eb; --accent-light: #eff4ff;
  --green: #16a34a; --green-bg: #f0fdf4; --amber: #d97706; --amber-bg: #fffbeb;
  --red: #dc2626; --red-bg: #fef2f2; --charcoal: #2b303a;
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Georgia', serif; font-size: 15px; line-height: 1.7; color: var(--ink); background: var(--paper); max-width: 960px; margin: 0 auto; padding: 32px 24px 80px; }
a { color: var(--accent); }

/* Header */
.doc-header { border-bottom: 2px solid var(--ink); padding-bottom: 20px; margin-bottom: 12px; }
.doc-eyebrow { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 11px; font-weight: 700; letter-spacing: .12em; color: var(--accent); text-transform: uppercase; margin-bottom: 8px; }
.doc-title { font-size: 38px; font-weight: 700; line-height: 1.15; margin-bottom: 10px; }
.doc-subtitle { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 15px; color: var(--muted); margin-bottom: 12px; }
.doc-meta-row { display: flex; gap: 20px; flex-wrap: wrap; font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 12.5px; color: var(--muted); }
.internal-badge { background: var(--red-bg); color: var(--red); font-weight: 700; padding: 2px 10px; border-radius: 4px; letter-spacing: .05em; }
.account-type-badge { background: var(--accent-light); color: var(--accent); font-weight: 700; padding: 2px 10px; border-radius: 4px; }

/* New since refresh */
.new-since-banner { background: #fef9c3; border: 1px solid #fde047; border-radius: 6px; padding: 12px 16px; margin: 16px 0; font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 13px; }
.new-since-banner ul { margin-top: 8px; padding-left: 18px; }

/* RAG badge */
.rag-badge { display: inline-flex; align-items: center; gap: 6px; padding: 3px 10px; border-radius: 12px; font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 11.5px; font-weight: 600; }
.rag-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }

/* Sections */
details.section { margin: 16px 0; border: 1px solid var(--border); border-radius: 8px; overflow: hidden; }
summary.section-summary { display: flex; align-items: center; justify-content: space-between; padding: 14px 18px; background: var(--soft); cursor: pointer; user-select: none; list-style: none; gap: 12px; }
summary.section-summary::-webkit-details-marker { display: none; }
.section-title { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 15.5px; font-weight: 700; color: var(--ink); }
.section-body { padding: 20px; }
.layer-intro { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 13.5px; color: var(--muted); margin-bottom: 18px; font-style: italic; }
.sub-heading { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 13px; font-weight: 700; color: var(--ink); text-transform: uppercase; letter-spacing: .08em; margin: 22px 0 10px; }

/* Stakeholder cards */
.stakeholder-card { border: 1px solid var(--border); border-radius: 8px; margin-bottom: 16px; overflow: hidden; }
.stakeholder-header { display: flex; justify-content: space-between; align-items: flex-start; padding: 14px 16px; background: var(--charcoal); gap: 12px; }
.stakeholder-name { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 17px; font-weight: 700; color: #fff; display: block; }
.stakeholder-title { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 12.5px; color: #9aa0ac; display: block; margin-top: 2px; }
.stakeholder-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex-shrink: 0; }
.stakeholder-body { padding: 16px; }
.coverage-badge { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 4px; white-space: nowrap; }
.coverage-contacted { background: var(--green-bg); color: var(--green); }
.coverage-not-yet-reached { background: var(--red-bg); color: var(--red); }
.coverage-meeting-held { background: #eff4ff; color: #2563eb; }
.coverage-unknown { background: var(--soft); color: var(--muted); }
.role-tag { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 11px; color: var(--muted); background: #e8edf5; padding: 2px 8px; border-radius: 4px; }

/* Field grid */
.field-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px; }
.field { background: var(--soft); border-radius: 6px; padding: 10px 12px; }
.field-label { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: var(--muted); margin-bottom: 4px; }
.field-value { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 13px; color: var(--ink); line-height: 1.5; }
.field-empty { color: var(--muted); font-style: italic; }

/* Public voice */
.public-voice { margin: 12px 0; }
.pv-label { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: var(--muted); margin-bottom: 6px; }
.pv-list { list-style: none; padding: 0; }
.pv-list li { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 13px; padding: 6px 0; border-bottom: 1px solid var(--border); display: flex; gap: 8px; flex-wrap: wrap; align-items: baseline; }
.pv-type { background: var(--accent-light); color: var(--accent); font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 3px; text-transform: uppercase; letter-spacing: .05em; flex-shrink: 0; }
.pv-date { color: var(--muted); font-size: 11px; }

/* Champion health */
.champion-health { background: var(--soft); border-radius: 6px; padding: 12px 14px; margin: 12px 0; }
.ch-label { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: var(--muted); margin-bottom: 10px; }
.ch-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.ch-trait { display: flex; flex-direction: column; gap: 3px; }
.ch-icon { font-size: 18px; }
.ch-name { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 11px; font-weight: 700; color: var(--ink); }
.ch-note { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 11.5px; color: var(--muted); }

/* Manual field */
.manual-field { border: 1px dashed var(--amber); border-radius: 6px; padding: 10px 14px; margin: 10px 0; background: var(--amber-bg); }
.manual-label { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: var(--amber); display: block; margin-bottom: 4px; }
.manual-cell { color: var(--amber); font-style: italic; }

/* Data table */
.data-table { width: 100%; border-collapse: collapse; font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 13px; margin: 12px 0; }
.data-table th { text-align: left; padding: 8px 10px; background: var(--charcoal); color: #fff; font-size: 11px; letter-spacing: .06em; text-transform: uppercase; }
.data-table td { padding: 8px 10px; border-bottom: 1px solid var(--border); vertical-align: top; }
.data-table tr:nth-child(even) td { background: var(--soft); }

/* Intel blocks */
.intel-block { margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid var(--border); }
.intel-block:last-child { border-bottom: none; }
.intel-heading { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 15px; font-weight: 700; color: var(--ink); margin-bottom: 8px; }
.intel-body { font-size: 14px; line-height: 1.65; }
.source-line { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 11.5px; color: var(--muted); margin-top: 6px; }

/* Technical wedge */
.wedge-box { background: var(--charcoal); color: #d6d9e0; border-radius: 8px; padding: 16px 20px; margin: 16px 0; font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 14px; line-height: 1.6; }
.wedge-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .1em; color: #9aa0ac; margin-bottom: 8px; }

/* Trigger log */
.trigger-log { border: 1px solid var(--border); border-radius: 6px; overflow: hidden; margin-bottom: 20px; }
.trigger-item { display: flex; align-items: baseline; gap: 10px; padding: 8px 12px; border-bottom: 1px solid var(--border); font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 13px; flex-wrap: wrap; }
.trigger-item:last-child { border-bottom: none; }
.trigger-new { background: #fef9c3; }
.trigger-date { color: var(--muted); font-size: 11px; flex-shrink: 0; width: 85px; }
.trigger-category { background: var(--accent-light); color: var(--accent); font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 3px; text-transform: uppercase; flex-shrink: 0; }
.trigger-event { flex: 1; }
.trigger-source { color: var(--accent); font-size: 11px; }
.new-tag { background: #fde047; color: #713f12; font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 3px; }

/* Commercial */
.prospect-note { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 13px; color: var(--muted); font-style: italic; padding: 10px 14px; background: var(--soft); border-radius: 6px; margin-bottom: 16px; }
.timeline-box { display: flex; gap: 24px; background: var(--soft); border-radius: 6px; padding: 12px 16px; margin-top: 16px; }
.timeline-label { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: var(--muted); display: block; }
.timeline-value { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 17px; font-weight: 700; color: var(--ink); }

/* MEDDICC */
.meddicc-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 12px 0; }
.meddicc-card { background: var(--soft); border-radius: 6px; padding: 10px 12px; }
.meddicc-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
.meddicc-label { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 12px; font-weight: 700; color: var(--ink); }
.meddicc-score { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 11px; font-weight: 700; padding: 1px 7px; border-radius: 4px; }
.meddicc-note { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 12.5px; color: var(--muted); }

/* Value hypothesis */
.hypothesis-block { border: 1px solid var(--border); border-radius: 8px; padding: 16px; margin-bottom: 12px; }
.hyp-label { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .1em; color: var(--accent); margin-bottom: 8px; }
.hyp-statement { font-size: 14.5px; line-height: 1.6; margin-bottom: 10px; }
.hyp-test { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 12.5px; padding: 5px 10px; border-radius: 4px; margin-top: 4px; }
.hyp-confirm { background: var(--green-bg); color: var(--green); }
.hyp-challenge { background: var(--red-bg); color: var(--red); }
.positioning-line { border-left: 3px solid var(--accent); background: var(--accent-light); padding: 12px 16px; border-radius: 0 6px 6px 0; font-size: 15px; font-style: italic; margin-top: 16px; color: var(--ink); }

/* Objections */
.objection-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 2px; margin-bottom: 2px; }
.objection-col-header { background: var(--charcoal); color: #fff; font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 11px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; padding: 8px 14px; }
.objection-row { display: grid; grid-template-columns: 1fr 1fr; border-bottom: 1px solid var(--border); }
.objection-left { padding: 14px; background: var(--soft); }
.objection-right { padding: 14px; }
.obj-archetype { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .1em; color: var(--red); margin-bottom: 6px; }
.obj-text { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 13px; color: var(--ink); margin-bottom: 8px; }
.obj-meta { display: flex; gap: 6px; flex-wrap: wrap; }
.obj-tag { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 10.5px; background: #e8edf5; color: var(--muted); padding: 2px 7px; border-radius: 3px; }
.obj-anchor { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 13px; font-weight: 700; color: var(--ink); margin-bottom: 6px; }
.obj-counter { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 13px; color: var(--muted); }
.ob-notes { background: var(--soft); border-radius: 6px; padding: 12px 14px; margin-top: 14px; font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 13px; color: var(--muted); }

/* Gaps */
.gap-list { list-style: none; padding: 0; }
.gap-item { display: flex; gap: 10px; padding: 10px 0; border-bottom: 1px solid var(--border); font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 13.5px; align-items: flex-start; }
.gap-icon { flex-shrink: 0; font-size: 16px; }
.gap-text { flex: 1; color: var(--ink); }

/* Sources */
.source-register { display: flex; flex-direction: column; gap: 8px; }
.source-entry { display: flex; gap: 10px; align-items: baseline; flex-wrap: wrap; font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 13px; padding: 6px 0; border-bottom: 1px solid var(--border); }
.source-type { background: var(--soft); color: var(--muted); font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 3px; text-transform: uppercase; letter-spacing: .05em; flex-shrink: 0; }
.source-desc { flex: 1; }
.source-date { color: var(--muted); font-size: 11px; }

/* Footer */
footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid var(--border); font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 12px; color: var(--muted); }
</style>
</head>
<body>

<div class="doc-header">
  <div class="doc-eyebrow">Strategic Account Dossier &mdash; Internal Only</div>
  <h1 class="doc-title">${esc(meta.account_name)}</h1>
  <p class="doc-subtitle">${esc(meta.subtitle || "")}</p>
  <div class="doc-meta-row">
    <span class="internal-badge">INTERNAL — not for sharing with the account</span>
    <span class="account-type-badge">${isExisting ? "Existing customer" : "Prospect"}</span>
    <span>Generated: ${generatedDate}</span>
    <span>Refresh due: ${refreshDue}</span>
    ${meta.renewal_date ? `<span>Renewal: ${esc(meta.renewal_date)}</span>` : ""}
    <span>SE: ${esc(meta.se_name || "")}</span>
  </div>
</div>

${newSinceBanner(cfg)}

${buildLayer1(cfg)}
${buildLayer2(cfg)}
${buildLayer3(cfg)}
${buildLayer4(cfg)}
${buildValueHypothesis(cfg)}
${buildObjections(cfg)}
${buildGaps(cfg)}
${buildSources(cfg)}

<footer>
  ${esc(meta.account_name)} Strategic Account Dossier &middot; ${esc(meta.se_name || "")} &middot; Stack Overflow / Stack Internal &middot; ${generatedDate}
</footer>

</body>
</html>`;
}

// ---- Main ----
const html = buildHTML(cfg);
fs.writeFileSync(outPath, html, "utf8");
console.log(`Dossier written to ${outPath}`);
