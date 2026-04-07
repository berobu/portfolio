# SPEC-design.md — Visual Design Specification — v1
_Output of Chat 0A. Updated in Chat 1A._
_Load this file before any UI work in Claude Code._
_Do not change values here without a Chat session decision._

---

## Direction

**Raw Editorial** — bold, dark, precise. Communicates strategic thinking through structure and restraint, not decoration. Visual language earns its boldness from composition, not contrast alone.

Mood: confident, unglamorous, built for real work.
Not: playful, motion-forward, developer-tool aesthetic.

---

## Colors

All values live in `tailwind.config.ts`. No hardcoded hex anywhere in components.

| Token | Hex | Usage |
|-------|-----|-------|
| `color.bg.base` | `#0C0B09` | Page background — warm near-black, not terminal black |
| `color.bg.surface` | `#111009` | Card / row surface |
| `color.bg.subtle` | `#161510` | Image placeholders, hover states |
| `color.border.default` | `#1C1B18` | Dividers, card borders |
| `color.border.muted` | `#2A2820` | Tag borders, secondary borders |
| `color.border.hover` | `#2E2C26` | Card hover border |
| `color.text.primary` | `#F2EDE4` | Headlines, primary text — warm white |
| `color.text.secondary` | `#5C5850` | Descriptions, body copy |
| `color.text.muted` | `#3D3A34` | Labels, metadata, nav links |
| `color.text.faint` | `#2E2C26` | Index numbers, ghost elements |
| `color.accent` | `#D4FF3E` | Acid yellow — use sparingly: eyebrow labels, hover arrows, one highlight tag per card |

### Accent usage rules
- Maximum one accent element per visual section
- Never use accent on body text
- Accent on hover states only (arrows, row highlights) — not static decorative elements
- NDA label: border only, no accent fill

---

## Typography

### Fonts
| Font | Role | Source |
|------|------|--------|
| **Inter** | Display / Headlines | Google Fonts |
| **DM Mono** | Labels, metadata, tags, nav, index numbers | Google Fonts |

No Syne. No third font. No system fonts. No Geist, no Space Grotesk.

### Scale

| Name | Font | Size | Weight | Letter-spacing | Usage |
|------|------|------|--------|----------------|-------|
| `display` | Inter | 52–64px | 800 | -0.03em | Hero headline only |
| `case-title` | Inter | 32–40px | 700 | -0.02em | Case study titles in list |
| `section-label` | DM Mono | 10px | 400 | 0.14em | Section headers (uppercase) |
| `body` | DM Mono | 11px | 400 | 0.04em | Case study descriptions |
| `meta` | DM Mono | 10px | 400 | 0.10em | Role, industry, index numbers |
| `tag` | DM Mono | 9px | 400 | 0.06em | Pill tags (uppercase) |
| `nav` | DM Mono | 10–11px | 400 | 0.10em | Navigation links |

### Rules
- DM Mono stays in its lane: labels, metadata, tags, nav only. Never headlines.
- Inter for display and case titles only. Never body copy.
- Line-height: 0.92–1.0 for display, 1.6–1.7 for body/meta.
- Sentence case everywhere. No ALL CAPS except section labels and tags.

---

## Layout

### Grid
- Max content width: `1200px`, centered
- Horizontal padding: `40px` desktop, `20px` mobile
- No columns for the main list — full width rows with internal structure

### Case study list
Each row contains:
```
[index]   [role / industry / type]                    [↗ arrow]
          [Case Title — large Syne]
          [Description — DM Mono, muted]
          [tag] [tag] [tag]
——————————————————————————————————————————————————————————————
```
- Divider line between rows: `1px solid #1C1B18`
- Row padding: `32px 0`
- Index number: far left, `color.text.faint`, DM Mono

### Spacing system
Base unit: `4px`
Common values: `4 8 12 16 20 24 32 40 48 64 80px`

---

## Interactions

Three interactions only. Nothing else until v2.

### 1. Hero headline — draw on load
- Syne display headline animates in on page load
- One time, not looping
- Stroke/outline text fills in — or staggered word reveal
- Duration: ~600ms, ease-out
- Implementation: CSS animation or lightweight JS, no GSAP for v1

### 2. Case study row — hover metric reveal
- On hover: row background shifts to `color.bg.subtle`
- One outcome metric appears inline below the description
- Example: `↳ Reduced underwriting errors · 40% · 6 weeks`
- Accent arrow `→` turns `color.accent`
- Transition: `150ms ease`

### 3. Case study sections — scroll fade-in
- On `/case/[slug]` pages only
- Each section fades in as it enters viewport
- `opacity: 0 → 1`, `translateY: 12px → 0`
- Duration: `400ms`, staggered `100ms` between elements
- Use Intersection Observer, no scroll libraries

### What we are NOT building in v1
- Floating elements
- Physics-based animations
- Cursor effects
- Parallax
- Page transitions
- Hover image previews

---

## NDA handling

- Case stays in the list — never hidden
- Image area: dark surface with `NDA` pill label (border only, no fill)
- Title, tags, description: fully visible
- Description copy template: *"[What the product does]. Visuals under NDA — process and decisions available on request."*
- No blurred screenshots, no redacted images

---

## What this spec does NOT cover

- Hero headline copy → Chat 0B
- Case study card order → Chat 1B
- Case study page structure → Chat 2A
- Animation implementation details → CC sessions

---

## Decisions log

| Decision | Chosen | Rejected | Reason |
|----------|--------|----------|--------|
| Visual direction | Raw Editorial (D) | Linear/Vercel clone (A), Editorial Gravity (B), Systematic Precision (C) | Most differentiated; acid energy without dev-tool read |
| Background | `#0C0B09` warm near-black | `#0A0A0A` pure black | Pure black reads as terminal/developer |
| Display font | Inter 800 | Syne, Bebas Neue, Plus Jakarta, Space Grotesk | Syne unacceptable at display scale; Inter is precise and neutral |
| Label font | DM Mono | Geist Mono, IBM Plex Mono | Slightly warmer than Geist, better at small sizes |
| Case layout | List rows | Card grid | Works without screenshots; scannable; more editorial |
| Hover interaction | Metric reveal | Floating elements, image preview | Communicates thinking, not decoration |
| Case title size | 32–40px (medium editorial) | 48–56px (large), 24–28px (tight) | Shows 2–3 cases above fold; enough weight |
| Animations | 3 purposeful only | Full motion layer | Ship v1 fast; add graphic layer in v2 |
| Hero layout | Left-aligned | Centered | Editorial direction; list rows are left-anchored, hero matches |
| Hero eyebrow | `PRODUCT DESIGNER` | `SENIOR PRODUCT DESIGNER`, none | Context without argument — seniority comes from the work |
| Hero animation | Staggered word reveal | Stroke fill | Lower risk, still purposeful, easier to tune |
