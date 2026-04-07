# SPEC-content.md — Content Specification — v1
_Output of Chat 0B. Updated in Chat 1A._
_Load this file before any copy or UI work in Claude Code._
_Do not change values here without a Chat session decision._

---

## Hero

### Structure
Three text elements, top to bottom:

| Element | Content |
|---------|---------|
| Eyebrow | `PRODUCT DESIGNER` |
| Headline | Clear, considered interfaces for complex products. |
| Subline | I bring rigour to ambiguous briefs and stay in it until the thing actually ships. |

### Typography reminders (from SPEC-design.md)
- Eyebrow: DM Mono 10px, uppercase, `color.accent`
- Headline: Syne 800, 52–64px, `color.text.primary`, breaks after "interfaces"
- Subline: DM Mono 11px, `color.text.secondary`

### Layout
- Left-aligned
- No centering anywhere in the hero

---

## Navigation

```
Left:    IGOR BIELOV
Right:   WORK   CV ↗
```

- Font: DM Mono, nav size (10–11px), `color.text.muted`
- `CV ↗` opens in new tab
- No About page in v1 — deferred to v2
- No hamburger, no dropdown

---

## Case Study List

### Row structure
```
[index]   [DOMAIN · FORMAT · STAGE]                    [↗]
          [Case Title — Syne]
          [One-line description — DM Mono, muted]
——————————————————————————————————————————————————————————
```

- No pill tags — metadata line carries context, case carries proof
- Divider: `1px solid color.border.default`
- Arrow `↗` links to case page; suppressed on Coming Soon row
- Index: `color.text.faint`, DM Mono

### Case 01 — Underwriting Rule Engine
```
[01]   FINTECH · B2B SAAS · 0→1                          [↗]
       Underwriting Rule Engine
       No-code platform for risk managers to build
       and manage business rules without engineering.
```

**NDA handling** (from SPEC-design.md):
- Case stays in the list — never hidden
- Image area on case page: dark surface with `NDA` pill (border only, no fill)
- Title, metadata, description: fully visible
- No NDA label in the list row — it's implied, not announced

### Case 02 — Coming Soon
```
[02]   COMING SOON
```
- Single row, index + label only
- `color.text.muted` for the label
- No link, no hover state, no arrow

---

## Hover interaction (metric reveal)
_From SPEC-design.md — included here for copy reference_

On hover, one outcome metric appears below the description:

| Case | Metric copy |
|------|-------------|
| Underwriting Rule Engine | TBD — decide in Chat 2B |

Format: `↳ [Outcome] · [Metric] · [Timeframe]`
Example: `↳ Reduced underwriting errors · 40% · 6 weeks`

---

## Footer

### Structure
```
Got a product problem worth solving?

[igor@bielov.com]    [LinkedIn ↗]    [CV ↗]
```

- Prompt line: Inter 800, `color.text.primary`
- Links: DM Mono, `color.text.muted`, opens in new tab
- No copyright, no "built with" note
- No button

---

## Decisions log

| Decision | Chosen | Rejected | Reason |
|----------|--------|----------|--------|
| Hero headline | "Clear, considered interfaces for complex products." | "I turn complex problems into products that ship", others | Designer's voice, not salesperson's; "clear + considered" implies process and restraint |
| Subline | "I bring rigour to ambiguous briefs and stay in it until the thing actually ships." | Longer 3-sentence version | Too long, too self-focused; one sentence that makes a falsifiable claim |
| Hero layout | Left-aligned | Centered | Editorial direction; list rows are left-anchored, hero matches |
| Eyebrow | `PRODUCT DESIGNER` | `SENIOR PRODUCT DESIGNER`, none | Context without argument — seniority comes from the work |
| Nav structure | IGOR BIELOV · WORK CV ↗ | Name + position, initials, no nav | Position redundant with hero eyebrow; name anchors the site to a person |
| About page | Deferred to v2 | Include in v1 | Cases speak first; About only earns its place when cases don't cover something |
| Pill tags | Removed | Discipline tags, context tags, mixed | Redundant with metadata line; card level should signal scope, not task list |
| Metadata line | DOMAIN · FORMAT · STAGE | Tags only, description only | Two-second scan: what space, what kind of product |
| NDA in metadata | Removed | FINTECH · B2B SAAS · 0→1 · NDA | NDA is table stakes for senior designers; not a differentiator |
| Footer | Contact prompt + 3 links | Button, copyright, "built with" | Minimal; consistent with nav pattern; no decorative elements |
| Display font | Inter 800 | Syne | Syne unacceptable at display scale; Inter is precise and neutral |
