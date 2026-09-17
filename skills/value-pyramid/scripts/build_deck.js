#!/usr/bin/env node
/**
 * build_deck.js — renders an Account Value Pyramid deck from a JSON config.
 *
 * Usage: node build_deck.js <config.json> <output.pptx>
 *
 * The 7-slide structure and design system are fixed by this script so every
 * pyramid deck looks like part of the same family. Only content and the
 * accent colours change per account. See assets/example-config.json for a
 * complete, working config.
 *
 * Requires: pptxgenjs, react, react-dom, sharp, react-icons (all preinstalled
 * in the Claude environment).
 */

const fs = require("fs");
const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const fi = require("react-icons/fi");

const [, , configPath, outPath] = process.argv;
if (!configPath || !outPath) {
  console.error("Usage: node build_deck.js <config.json> <output.pptx>");
  process.exit(1);
}
const cfg = JSON.parse(fs.readFileSync(configPath, "utf8"));

// ---- fixed design system ----
const CHARCOAL = "2B303A";
const INK = "23272F";
const PAPER = "FFFFFF";
const MUTED = "6B7280";
const SOFT = "F5F5F6";
const LIGHTLINE = "E5E7EB";
const DARKBODY = "C9CDD6";
const HFONT = "Cambria";
const BFONT = "Calibri";

// per-account accents (hex, no '#')
const ACCENT = cfg.colors.accent;           // brand colour, used on light bg + as fills
const ACCENT_DARK = cfg.colors.accentDark || ACCENT;   // darker variant for small text on light bg
const ACCENT_LIGHT = cfg.colors.accentLight || ACCENT; // lighter variant for text on dark bg

async function iconPng(name, colorHex, px = 256) {
  const IconComp = fi[name];
  if (!IconComp) throw new Error(`Unknown react-icons/fi icon: ${name}`);
  const svg = ReactDOMServer.renderToStaticMarkup(
    React.createElement(IconComp, { color: "#" + colorHex, size: px })
  );
  const buf = await sharp(Buffer.from(svg)).resize(px, px).png().toBuffer();
  return "image/png;base64," + buf.toString("base64");
}

function circleIcon(s, pres, data, x, y, opts = {}) {
  const d = opts.d || 0.6;
  const fill = opts.fill || PAPER;
  const line = opts.noLine ? { type: "none" } : { color: LIGHTLINE, width: 1 };
  s.addShape(pres.ShapeType.ellipse, { x, y, w: d, h: d, fill: { color: fill }, line });
  const pad = d * 0.22;
  s.addImage({ data, x: x + pad, y: y + pad, w: d - 2 * pad, h: d - 2 * pad });
}

(async () => {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE"; // 13.33 x 7.5

  // ---------------- Slide 1: Title (dark) ----------------
  {
    const t = cfg.title_slide;
    const s = pres.addSlide();
    s.background = { color: CHARCOAL };
    s.addShape(pres.ShapeType.ellipse, { x: 10.4, y: -1.7, w: 4.6, h: 4.6, fill: { color: ACCENT, transparency: 86 }, line: { type: "none" } });
    s.addShape(pres.ShapeType.ellipse, { x: -1.4, y: 5.3, w: 3.8, h: 3.8, fill: { color: ACCENT, transparency: 90 }, line: { type: "none" } });
    s.addText("ACCOUNT VALUE PYRAMID", { x: 0.9, y: 1.95, w: 8, h: 0.4, fontFace: BFONT, fontSize: 14, color: ACCENT_LIGHT, charSpacing: 3, bold: true, isTextBox: true, margin: 0 });
    s.addText(t.title, { x: 0.9, y: 2.4, w: 11.6, h: 1.1, fontFace: HFONT, fontSize: 44, color: PAPER, bold: true, isTextBox: true, margin: 0 });
    s.addText(t.subtitle, { x: 0.9, y: 3.65, w: 10.6, h: 1.0, fontFace: BFONT, fontSize: 18, color: DARKBODY, isTextBox: true, margin: 0, lineSpacingMultiple: 1.2 });
    s.addText(t.footer, { x: 0.9, y: 6.5, w: 11.6, h: 0.4, fontFace: BFONT, fontSize: 12, color: "9AA0AC", isTextBox: true, margin: 0 });
    if (t.notes) s.addNotes(t.notes);
  }

  // ---------------- Slide 2: Pyramid ----------------
  {
    const p = cfg.pyramid_slide;
    const s = pres.addSlide();
    s.background = { color: PAPER };
    s.addText(p.heading || "The pyramid at a glance", { x: 0.9, y: 0.5, w: 11.5, h: 0.7, fontFace: HFONT, fontSize: 34, color: INK, bold: true, isTextBox: true, margin: 0 });

    const widths = [4.6, 6.4, 8.2, 10.0, 11.8];
    const barH = 1.0, gap = 0.14;
    let y = 1.45;
    p.levels.forEach((L, i) => {
      const w = widths[i];
      const x = (13.33 - w) / 2;
      const isTop = i === 0;
      const isBase = i === p.levels.length - 1;
      const fillColor = isBase ? ACCENT : (isTop ? CHARCOAL : SOFT);
      s.addShape(pres.ShapeType.roundRect, { x, y, w, h: barH, rectRadius: 0.06, fill: { color: fillColor }, line: { type: "none" } });
      s.addText(L.label, { x: x + 0.3, y: y + 0.12, w: w - 0.6, h: 0.32, fontFace: BFONT, fontSize: 11.5, bold: true, charSpacing: 2, color: isBase ? PAPER : (isTop ? ACCENT_LIGHT : ACCENT_DARK), align: "center", isTextBox: true, margin: 0 });
      s.addText(L.text, { x: x + 0.3, y: y + 0.44, w: w - 0.6, h: 0.5, fontFace: BFONT, fontSize: 12.5, color: isBase ? PAPER : (isTop ? DARKBODY : INK), align: "center", isTextBox: true, margin: 0 });
      y += barH + gap;
    });

    if (p.caption) s.addText(p.caption, { x: 0.9, y: 7.0, w: 11.5, h: 0.4, fontFace: BFONT, fontSize: 14, italic: true, color: MUTED, align: "center", isTextBox: true, margin: 0 });
    if (p.notes) s.addNotes(p.notes);
  }

  // ---------------- Slide 3: Vision & strategy (two cards) ----------------
  {
    const v = cfg.vision_slide;
    const s = pres.addSlide();
    s.background = { color: PAPER };
    s.addText(v.heading, { x: 0.9, y: 0.5, w: 11.5, h: 0.7, fontFace: HFONT, fontSize: 32, color: INK, bold: true, isTextBox: true, margin: 0 });
    s.addText(v.subheading, { x: 0.9, y: 1.25, w: 11.5, h: 0.4, fontFace: BFONT, fontSize: 15, italic: true, color: MUTED, isTextBox: true, margin: 0 });

    const cards = [v.left_card, v.right_card];
    for (let i = 0; i < 2; i++) {
      const c = cards[i];
      const x = i === 0 ? 0.9 : 6.85;
      const dark = i === 0;
      s.addShape(pres.ShapeType.roundRect, { x, y: 1.9, w: 5.55, h: 4.7, rectRadius: 0.09, fill: { color: dark ? CHARCOAL : SOFT }, line: { type: "none" } });
      const ic = await iconPng(c.icon, dark ? "FFFFFF" : ACCENT);
      circleIcon(s, pres, ic, x + 0.4, 2.3, { d: 0.62, fill: dark ? ACCENT : PAPER, noLine: dark });
      s.addText(c.title, { x: x + 1.2, y: 2.35, w: 4.1, h: 0.5, fontFace: HFONT, fontSize: 21, color: dark ? PAPER : INK, bold: true, isTextBox: true, margin: 0 });
      const items = c.bullets.map((b, j) => ({ text: b, options: { bullet: true, breakLine: j < c.bullets.length - 1 } }));
      s.addText(items, { x: x + 0.45, y: 3.15, w: 4.75, h: 3.2, fontFace: BFONT, fontSize: 14, color: dark ? "D6D9E0" : INK, isTextBox: true, margin: 0, paraSpaceAfter: 12, lineSpacingMultiple: 1.12 });
    }
    if (v.notes) s.addNotes(v.notes);
  }

  // ---------------- Slide 4: Programme (banner + 3 pillars) ----------------
  {
    const g = cfg.programme_slide;
    const s = pres.addSlide();
    s.background = { color: PAPER };
    s.addText(g.heading, { x: 0.9, y: 0.5, w: 11.5, h: 0.7, fontFace: HFONT, fontSize: 32, color: INK, bold: true, isTextBox: true, margin: 0 });
    s.addText(g.subheading, { x: 0.9, y: 1.25, w: 11.5, h: 0.4, fontFace: BFONT, fontSize: 15, italic: true, color: MUTED, isTextBox: true, margin: 0 });

    s.addShape(pres.ShapeType.roundRect, { x: 0.9, y: 1.85, w: 11.5, h: 1.35, rectRadius: 0.08, fill: { color: CHARCOAL }, line: { type: "none" } });
    s.addText(g.banner.big, { x: 1.3, y: 2.05, w: 2.6, h: 0.95, fontFace: HFONT, fontSize: 46, color: ACCENT_LIGHT, bold: true, isTextBox: true, margin: 0 });
    s.addText(g.banner.text, { x: 4.1, y: 2.05, w: 8.0, h: 0.95, fontFace: BFONT, fontSize: 15, color: "D6D9E0", isTextBox: true, margin: 0, lineSpacingMultiple: 1.15 });

    for (let i = 0; i < g.pillars.length; i++) {
      const p = g.pillars[i];
      const x = 0.9 + i * 3.98;
      s.addShape(pres.ShapeType.roundRect, { x, y: 3.5, w: 3.66, h: 3.1, rectRadius: 0.08, fill: { color: SOFT }, line: { type: "none" } });
      const ic = await iconPng(p.icon, ACCENT);
      circleIcon(s, pres, ic, x + 0.3, 3.8, { d: 0.58 });
      s.addText(p.title, { x: x + 1.0, y: 3.85, w: 2.6, h: 0.85, fontFace: BFONT, fontSize: 16, bold: true, color: INK, isTextBox: true, margin: 0 });
      s.addText(p.desc, { x: x + 0.3, y: 4.75, w: 3.06, h: 1.7, fontFace: BFONT, fontSize: 12.5, color: MUTED, isTextBox: true, margin: 0, lineSpacingMultiple: 1.12 });
    }
    if (g.footnote) s.addText(g.footnote, { x: 0.9, y: 6.85, w: 11.5, h: 0.45, fontFace: BFONT, fontSize: 14, italic: true, color: ACCENT_DARK, isTextBox: true, margin: 0 });
    if (g.notes) s.addNotes(g.notes);
  }

  // ---------------- Slide 5: Execution stats (2x3 grid) ----------------
  {
    const e = cfg.execution_slide;
    const s = pres.addSlide();
    s.background = { color: PAPER };
    s.addText(e.heading, { x: 0.9, y: 0.5, w: 11.5, h: 0.7, fontFace: HFONT, fontSize: 32, color: INK, bold: true, isTextBox: true, margin: 0 });

    const cw = 3.66, ch = 1.9, gx = 0.32, gy = 0.32;
    e.stats.slice(0, 6).forEach((st, i) => {
      const x = 0.9 + (i % 3) * (cw + gx);
      const y = 1.55 + Math.floor(i / 3) * (ch + gy);
      s.addShape(pres.ShapeType.roundRect, { x, y, w: cw, h: ch, rectRadius: 0.08, fill: { color: SOFT }, line: { type: "none" } });
      s.addText(st.n, { x: x + 0.3, y: y + 0.2, w: cw - 0.6, h: 0.65, fontFace: HFONT, fontSize: 32, color: ACCENT, bold: true, isTextBox: true, margin: 0 });
      s.addText(st.d, { x: x + 0.3, y: y + 0.9, w: cw - 0.6, h: 0.85, fontFace: BFONT, fontSize: 12.5, color: MUTED, isTextBox: true, margin: 0, lineSpacingMultiple: 1.1 });
    });

    if (e.takeaway_plain || e.takeaway_bold) {
      s.addText([
        { text: e.takeaway_plain || "", options: { color: INK } },
        { text: e.takeaway_bold || "", options: { bold: true, color: INK } },
      ], { x: 0.9, y: 6.15, w: 11.5, h: 0.9, fontFace: BFONT, fontSize: 15, isTextBox: true, margin: 0, lineSpacingMultiple: 1.15 });
    }
    if (e.notes) s.addNotes(e.notes);
  }

  // ---------------- Slide 6: The gap (dark, numbered rows) ----------------
  {
    const gp = cfg.gap_slide;
    const s = pres.addSlide();
    s.background = { color: CHARCOAL };
    s.addText(gp.heading, { x: 0.9, y: 0.5, w: 11.5, h: 0.7, fontFace: HFONT, fontSize: 32, color: PAPER, bold: true, isTextBox: true, margin: 0 });
    s.addText(gp.subheading, { x: 0.9, y: 1.25, w: 11.5, h: 0.4, fontFace: BFONT, fontSize: 15, italic: true, color: "9AA0AC", isTextBox: true, margin: 0 });

    gp.rows.slice(0, 4).forEach((r, i) => {
      const y = 1.85 + i * 1.28;
      s.addShape(pres.ShapeType.ellipse, { x: 0.95, y: y + 0.04, w: 0.5, h: 0.5, fill: { color: ACCENT }, line: { type: "none" } });
      s.addText(String(i + 1), { x: 0.95, y: y + 0.06, w: 0.5, h: 0.45, fontFace: BFONT, fontSize: 16, bold: true, color: PAPER, align: "center", isTextBox: true, margin: 0 });
      s.addText(r.title, { x: 1.7, y: y - 0.02, w: 10.6, h: 0.42, fontFace: BFONT, fontSize: 16.5, bold: true, color: PAPER, isTextBox: true, margin: 0 });
      s.addText(r.desc, { x: 1.7, y: y + 0.4, w: 10.6, h: 0.8, fontFace: BFONT, fontSize: 12.5, color: DARKBODY, isTextBox: true, margin: 0, lineSpacingMultiple: 1.1 });
    });

    if (gp.positioning_line) {
      s.addText([
        { text: "Positioning line: ", options: { bold: true, color: ACCENT_LIGHT } },
        { text: gp.positioning_line, options: { italic: true, color: PAPER } },
      ], { x: 0.9, y: 7.0, w: 11.5, h: 0.4, fontFace: BFONT, fontSize: 14, isTextBox: true, margin: 0 });
    }
    if (gp.notes) s.addNotes(gp.notes);
  }

  // ---------------- Slide 7: Entry points (2x2 cards) ----------------
  {
    const en = cfg.entry_slide;
    const s = pres.addSlide();
    s.background = { color: PAPER };
    s.addText(en.heading || "Entry points and next moves", { x: 0.9, y: 0.5, w: 11.5, h: 0.7, fontFace: HFONT, fontSize: 32, color: INK, bold: true, isTextBox: true, margin: 0 });

    const cw = 5.6, ch = 2.5, gx = 0.35, gy = 0.32;
    for (let i = 0; i < Math.min(en.cards.length, 4); i++) {
      const c = en.cards[i];
      const x = 0.9 + (i % 2) * (cw + gx);
      const y = 1.5 + Math.floor(i / 2) * (ch + gy);
      s.addShape(pres.ShapeType.roundRect, { x, y, w: cw, h: ch, rectRadius: 0.09, fill: { color: SOFT }, line: { type: "none" } });
      const ic = await iconPng(c.icon, ACCENT);
      circleIcon(s, pres, ic, x + 0.32, y + 0.28, { d: 0.56 });
      s.addText(c.title, { x: x + 1.05, y: y + 0.32, w: cw - 1.4, h: 0.5, fontFace: BFONT, fontSize: 17, bold: true, color: INK, isTextBox: true, margin: 0 });
      s.addText(c.desc, { x: x + 0.32, y: y + 0.95, w: cw - 0.64, h: 1.45, fontFace: BFONT, fontSize: 12, color: MUTED, isTextBox: true, margin: 0, lineSpacingMultiple: 1.1 });
    }
    if (en.footer) s.addText(en.footer, { x: 0.9, y: 6.85, w: 11.5, h: 0.45, fontFace: BFONT, fontSize: 14, italic: true, color: MUTED, isTextBox: true, margin: 0 });
    if (en.notes) s.addNotes(en.notes);
  }

  // ---------------- Slide 8: Objection handling (dark, two-col rows) ----------------
  // Optional — only rendered when cfg.objections_slide is present
  if (cfg.objections_slide) {
    const ob = cfg.objections_slide;
    const s = pres.addSlide();
    s.background = { color: CHARCOAL };

    // header
    s.addText(ob.heading || "Likely objections — and how to handle them", {
      x: 0.9, y: 0.32, w: 11.5, h: 0.6, fontFace: HFONT, fontSize: 28, color: PAPER, bold: true, isTextBox: true, margin: 0,
    });
    s.addText(ob.subheading || "INTERNAL — not for sharing with the account", {
      x: 0.9, y: 0.94, w: 11.5, h: 0.32, fontFace: BFONT, fontSize: 12, bold: true, charSpacing: 2,
      color: ACCENT_LIGHT, isTextBox: true, margin: 0,
    });

    // column headers
    s.addShape(pres.ShapeType.rect, { x: 0.9, y: 1.38, w: 5.6, h: 0.3, fill: { color: ACCENT }, line: { type: "none" } });
    s.addShape(pres.ShapeType.rect, { x: 6.85, y: 1.38, w: 5.58, h: 0.3, fill: { color: "3D4350" }, line: { type: "none" } });
    s.addText("WHAT THEY'LL SAY", { x: 0.9, y: 1.38, w: 5.6, h: 0.3, fontFace: BFONT, fontSize: 11, bold: true, charSpacing: 2, color: PAPER, align: "center", valign: "middle", isTextBox: true, margin: 0 });
    s.addText("HOW YOU HANDLE IT", { x: 6.85, y: 1.38, w: 5.58, h: 0.3, fontFace: BFONT, fontSize: 11, bold: true, charSpacing: 2, color: PAPER, align: "center", valign: "middle", isTextBox: true, margin: 0 });

    // rows — up to 5 objections, evenly spaced
    const objections = ob.objections.slice(0, 5);
    const rowH = (7.5 - 1.75) / objections.length;

    objections.forEach((obj, i) => {
      const y = 1.72 + i * rowH;
      const isEven = i % 2 === 0;

      // row background
      s.addShape(pres.ShapeType.rect, { x: 0.9, y, w: 5.6, h: rowH - 0.06, fill: { color: isEven ? "373D4A" : "30353F" }, line: { type: "none" } });
      s.addShape(pres.ShapeType.rect, { x: 6.85, y, w: 5.58, h: rowH - 0.06, fill: { color: isEven ? "2F3440" : "292D38" }, line: { type: "none" } });

      // archetype label (small, accent coloured)
      s.addText(obj.archetype.toUpperCase(), {
        x: 1.05, y: y + 0.1, w: 5.2, h: 0.25,
        fontFace: BFONT, fontSize: 9.5, bold: true, charSpacing: 1.5, color: ACCENT_LIGHT,
        isTextBox: true, margin: 0,
      });

      // objection text
      s.addText(obj.objection, {
        x: 1.05, y: y + 0.34, w: 5.2, h: rowH - 0.52,
        fontFace: BFONT, fontSize: 12.5, color: "D6D9E0",
        isTextBox: true, margin: 0, lineSpacingMultiple: 1.1,
      });

      // counter — anchor phrase bolded, rest normal
      const counterParts = obj.counter_anchor
        ? [
            { text: obj.counter_anchor + " ", options: { bold: true, color: PAPER } },
            { text: obj.counter, options: { color: "D6D9E0" } },
          ]
        : [{ text: obj.counter, options: { color: "D6D9E0" } }];

      s.addText(counterParts, {
        x: 7.0, y: y + 0.1, w: 5.2, h: rowH - 0.18,
        fontFace: BFONT, fontSize: 12.5,
        isTextBox: true, margin: 0, lineSpacingMultiple: 1.1,
      });
    });

    if (ob.notes) s.addNotes(ob.notes);
  }

  await pres.writeFile({ fileName: outPath });
  console.log("Deck written to " + outPath);
})().catch((e) => { console.error(e); process.exit(1); });
