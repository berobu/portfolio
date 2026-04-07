# SPEC-case-ure-v3.md — Underwriting Rule Engine Case Study
_Final content spec. Built around the actual page layout seen in the live build._
_Output of Chat 2C. Ready for CC 2B once Figma fix is confirmed._

---

## Layout

Two-column sticky layout. Left panel is fixed — always visible. Right column scrolls.

Left panel: project identity + labeled info blocks (DOMAIN, STAGE, ROLE, SCOPE, THE PROBLEM, THE USER)
Right column: numbered sections, each with a before/after visual pair, a summary sentence, and a "+ FULL REASONING" expandable

The summary sentence is what a fast scanner reads. The full reasoning is what a careful reviewer reads. Both must be strong — the summary is not a teaser, it's a complete argument compressed to one sentence.

---

## LEFT PANEL

### Title block
```
Underwriting Rule Engine
```
```
No-code platform for risk managers to build
and manage loan approval logic without engineering.
```

### Metadata blocks
```
DOMAIN
Fintech · B2B SaaS

STAGE
0→1

ROLE
Solo Designer

SCOPE
Full system — canvas, objects, design system
```

### THE PROBLEM
```
Risk managers define the logic that approves,
rejects, or flags loan applications. A wrong
rule that reaches production isn't a UX problem
— it's a compliance event. The product needed
to give them control without requiring
engineering to make a change.
```

### THE USER
```
Finance and compliance professionals.
Think in conditions and outcomes. Need
certainty before they act. Cannot afford
mistakes in production.
```

**Notes:**
- THE PROBLEM and THE USER are separate blocks — the layout supports it and they serve different purposes: problem is about the product, user is about the person
- No NDA label anywhere
- "American Fintech" only appears if referenced in copy — not needed in the left panel

---

## HERO

**Visual:** Canvas with DT node — light (`535-47597`)
- No label, no caption
- Dark/Light toggle top-right of frame
- Full-bleed within content column

**Why this screen:** Shows two object types simultaneously — Calculation and Decision Table — connected in a real flow. Communicates system complexity before the reviewer reads a word.

---

## 00 · WHAT WASN'T WORKING

**Visual:** Slide 2 — three diagnostic cards (`576-22852`)

**Summary (always visible):**
```
PROBLEM
The product was built 0→1 under real constraints.
After shipping, I audited what we'd built. Three
structural problems worth fixing.
```

**No expandable for the diagnostic cards** — the three cards are the visual argument. Copy below the cards closes the section:

> The first problem drove the Canvas redesign. The second drove the Decision Table redesign. The third — a visual language strictly dictated by the client — is what the full rebuild addressed.

**Full reasoning (expandable) — the third problem:**

The original UI was built on an MUI base with explicit client requirements: the visual direction was windows-like — heavy icons, colored action bars, dense component styling. For a precision tool used by finance professionals making high-stakes decisions, that visual language creates the wrong cognitive context. It signals a generic enterprise dashboard, not a system built for focused, careful work.

The redesign used Linear as the reference point. Linear is a complex system used by people who need to move fast and trust what they're looking at. Its visual language — minimal chrome, clear hierarchy, nothing competing with the content — is what makes it feel like a precision tool rather than a form-filling interface. That's the direction the redesign follows: strip everything that isn't earning its visual weight, and let the structure of the information do the work.

The result is a dramatic visual shift from the original. That shift wasn't arbitrary — it was a deliberate correction of a UI language that was working against the user.

---

## 01 · CANVAS

**Visual:** Slide 4 — before/after sidebar (`577-22852`)
Labels: BEFORE (original, 2022, logo blurred — NDA) / AFTER (redesigned)

**Summary (always visible):**
```
PROBLEM
Navigation without hierarchy. Flow management and
system utilities shared one sidebar — no separation
between active work and platform tools. A risk manager's
core question on entry: "am I in production or draft?"
The original gave no clear answer.

SOLUTION
Two-zone sidebar — flow states at top, platform tools
anchored at the bottom. The safety check answered
before the risk manager touches a node.
```

**Full reasoning (expandable):**

The original sidebar mixed two fundamentally different types of information in one undifferentiated list.

Flow states — which flow is live, which is a draft, which is currently active — answer the question a risk manager asks before touching anything: *am I editing the live system or a draft?* This is not a navigational question. It's a safety check. Getting it wrong has compliance consequences.

Platform tools — Data Dictionary, Changes History, Reports — are reference utilities. They answer a different question, asked at different moments, consulted occasionally rather than constantly.

In the original, both sat in the same column with the same visual weight. No hierarchy, no separation. Every time a risk manager opened the canvas, they had to scan the entire sidebar to find their orientation. For a user whose primary anxiety before editing is draft vs. production status, that's the wrong cognitive environment.

**The proposed fix — and why it got blocked**

The most direct solution was to move platform utilities into the header. Global tools that affect the whole platform belong in global navigation, not in a workspace-specific sidebar. I prepared several examples showing this separation: header for platform-wide utilities, sidebar for workspace context.

The client refused. Their reasoning: the other products in the portfolio used the header for notifications — Follow-ups, Comments, Alerts, system-wide communication features. They wanted header treatment to be consistent across all eight products.

The consistency rationale applied to products that actually used the header for communication features. Underwriting had none of those planned. But the client held the position, and we couldn't reach agreement.

**The redesign**

Rather than leaving the sidebar as-is or fighting a blocked path, the redesign introduces two explicit zones within the sidebar itself.

Flow states sit at the top — Production Flow clearly labeled, Draft Flows below it, the active flow tree nested underneath. The risk manager's first question is answered at the top of the panel before they look at anything else.

Platform tools are anchored to the bottom under a distinct PLATFORM label. This follows an established pattern in complex SaaS tools: Figma, Linear, and VS Code all separate primary working context from secondary utilities this way. The pattern exists because these are genuinely different modes of use — active work versus occasional reference — and visual separation reduces the cognitive load of distinguishing them.

Bottom placement keeps platform tools accessible without surfacing them as competing priorities. A risk manager working in a flow doesn't need Data Dictionary in their visual field. When they do need it, it's there — labeled, findable, at the bottom of the same panel.

**The outcome**

A risk manager opening the canvas sees their flow states immediately. The question "am I editing the live system?" is answered at a glance, before they touch a node.

---

## 02 · DECISION TABLE

**Visual:** Slide 5 — before/after DT (`577-22864`)
Labels: BEFORE (original, 2022, logo blurred — NDA) / AFTER (redesigned)

**Summary (always visible):**
```
PROBLEM
No way to validate a rule before it was live.
The original asked the risk manager to hold
correctness in their head. A wrong rule that reaches
production is a compliance risk, not a UX inconvenience.

SOLUTION
Test Node, Rule Summary, Health Status — three changes
that move the cognitive load off the user and into
the interface.
```

**Full reasoning (expandable):**

The original Decision Table had no validation step.

You configured your conditions — CreditScore ≥ 700, LoanAmount ≤ 50,000 — assigned your outcomes, and hit Save Node. The rule was committed to the flow. If the logic was wrong, you found out when it mattered: in production, on a real loan application.

For a risk manager, this isn't a missing feature. It's a missing trust mechanism. The entire value of the system depends on rules being correct before they reach production. A Save button with no validation step asks the user to carry the correctness check in their head. In a domain where a misconfigured rule can mean incorrectly approved or rejected applications — and regulatory exposure — that cognitive load belongs in the interface, not on the user.

A second problem: the original gave no plain-language summary of what a rule actually said. You read conditions from table cells and mentally assembled what the combined logic would do. There was no reflection, no translation. A risk manager finishing a complex rule had to reconstruct its meaning from raw cell values to verify they'd built what they intended.

Both problems came from the same place: a system that trusted the user to hold everything in their head rather than reflecting it back.

**Three changes, all addressing the same need: confidence before action**

**Test Node** — added as a co-primary action alongside Save Node. Before committing a rule to the flow, a risk manager can run it against test inputs and see the match result. The validation step that was missing is now the step before save. This came from direct experience: even building flows myself, I found it genuinely difficult to know whether a complex rule was correct without some form of simulation.

**Rule Summary** — a continuously-updated plain-language translation of the configured rule, visible in the sidebar: "If CreditScore ≥ 700 and LoanAmount ≤ 50,000 → Approved. Otherwise → Rejected." The interface reflects the rule back in the language the risk manager already thinks in — conditions and outcomes — rather than asking them to assemble it from cells. Rule Summary was the natural companion to Test Node: if you can validate a rule, you should also be able to read it in plain language without reconstructing it from raw values. Grouping it with Health Status in the sidebar came from the redesign audit — both surface the state of the system, one semantically and one structurally.

**Health Status** — object-level system state surfaced passively in the sidebar: whether the node is functioning, has conflicts, or is in draft. No navigation required to check it. The information is present without requiring the user to go looking.

Together, these changes move the cognitive load off the user. A risk manager shouldn't have to hold the rule, its implications, and the system state simultaneously. The interface should carry that weight.

---

## 03 · HOW IT WAS BUILT

**Visual:** Tool chain — dark, no background (`554-722606`)

**Summary (always visible):**
```
PROBLEM
Token architecture, component library, full flows
in light and dark — a process that normally takes weeks.
Built solo, in days, using Claude, Claude Code, and Figma MCP.

RESULT
The manual labor was replaced. The judgment wasn't.
```

**Full reasoning (expandable):**

This redesign wasn't a client brief. It was a deliberate experiment: take a complex system I'd shipped, apply the critical distance that only comes after launch, and use AI tooling to compress a process that would normally take weeks into days.

The workflow was divided by what each tool does best. Claude handled planning, audit, and spec work — the analytical layer where structured thinking matters more than execution speed. Claude Code and Codex handled component generation and execution. Figma MCP kept design and implementation in sync throughout, eliminating the round-trips that normally fragment this kind of work.

Working this way created something genuinely hard to maintain in pure execution mode: critical distance. When the model handles the mechanical work, there's room to step back and audit decisions rather than just make them.

**Three things I'd do differently**

**[Reflection visual — Slide 7 (`578-22875`)]**

**Plan the system before building it.** I underinvested in design system structure upfront. The result was over 116 tokens that became unusable — more time spent fixing than building. The right ratio is closer to 80% planning, 20% execution. This applies to AI-assisted work more than traditional work: the model executes fast, which means structural mistakes compound fast.

**Match the model to the task.** I used Opus for tasks Sonnet handles equally well, which burned through the weekly token budget in three days. Choosing which model to use for which task is an operational decision that directly affects output. Treating it as a footnote is how you run out of credits midway through a complex system.

**Structure the workflow before starting.** I had the right tools — Claude, Claude Code, Figma MCP — but used them without a defined sequence on the first run. The knowledge is now structured. I know how to sequence the work before it begins, not reconstruct the workflow while it's in progress.

---

## 04 · WHAT'S NEXT

**Visual:** Slide 8 — What's next (`583-748084`)

**Summary (always visible):**
```
The system isn't finished. Storybook in progress,
additional objects planned, and an interactive
demo of the full system coming soon.
```

**No expandable needed — the visual carries this section.**

*(The three cards from Slide 8 — Storybook, Additional Objects, Demo — are self-explanatory. No long copy needed. The section closes the case by signaling this is ongoing work, not a finished artifact.)*

---

## VISUAL ASSIGNMENT SUMMARY

| Section | Visual | Figma Node | Status |
|---------|--------|------------|--------|
| Hero | Canvas with DT node — light | `535-47597` | Ready |
| 00 · What Wasn't Working | Slide 2 — three problems | `576-22852` | Ready |
| 01 · Canvas | Slide 4 — before/after | `577-22852` | Ready |
| 02 · Decision Table | Slide 5 — before/after | `577-22864` | Fix Rule Summary placeholder first |
| 03 · How It Was Built | Tool chain dark (no bg) + Slide 7 | `554-722606` + `578-22875` | Ready |
| 04 · What's Next | Slide 8 | `583-748084` | Ready |

---

## OUTSTANDING FIGMA FIX — BLOCKER FOR SECTION 02

**Decision Table — Rule Summary shows "No rule configured yet"**

The redesigned DT screenshot shows a placeholder in the Rule Summary sidebar section. This is the primary argument of Section 02. It must show a populated rule before the screenshot is exported.

Required state: `"If CreditScore ≥ 700 and LoanAmount ≤ 50,000 → Approved. Otherwise → Rejected."`

**Igor fixes this in Figma before CC 2B begins.**

---

## COPY PATTERN — HOW EACH SECTION IS STRUCTURED

Every section follows the same rhythm:

```
[Section label]
[Before/After visual pair]
[Summary — 2–4 sentences, always visible]
[+ FULL REASONING toggle]
  → Problem stated precisely
  → Why it matters for this specific user
  → What was tried / what was blocked (if applicable)
  → What the redesign does and why
  → Outcome stated in terms of what the user can now do
```

The summary is not a teaser. It is a complete, self-contained argument. A reviewer who only reads summaries should still understand every decision.

The full reasoning is for reviewers who want to pressure-test the thinking.

---

## WHAT WAS CUT AND WHY

| Cut | Reason |
|-----|--------|
| Standalone Context section | Absorbed into left panel description and THE PROBLEM block |
| Standalone Brief section | The strategic bet ("multiple object types") is setup — left panel handles it |
| Standalone Understanding the User section | User context lives in THE USER left panel block and in section copy where each decision connects back to user behavior |
| Core Design Challenge section | No visual showing multiple object types simultaneously. Without proof it's an assertion. Coherence is implicit in the consistent sidebar anatomy visible across Canvas and DT screenshots. |
| Open Questions | Strong seniority signal but no visual anchor. Deferred to v2. |

---

## DECISIONS LOG

| Decision | Chosen | Rejected | Reason |
|----------|--------|----------|--------|
| THE PROBLEM + THE USER | Separate left panel blocks | Merged single block | Layout supports it; they serve different purposes |
| Summary + expandable pattern | Yes — both layers of copy | Long copy only | Fast scanners and careful readers both served |
| Canvas argument | Full pushback story including client refusal | Softened version | The story is the argument — removing it makes the decision look like an assumption |
| "Argument was weak" phrasing | Replaced with "The consistency rationale didn't apply" | Keep as-is | Clinical framing, not dismissive — same substance, lower risk signal |
| Rule Summary authorship | "Rule Summary was the natural companion to Test Node" — Igor's insight, AI helped connect it to Health Status | "AI identified Rule Summary and Health Status as related" | Accurate to what happened; doesn't undercut authorship |
| Section 01 closer | "The redesign addresses the first two directly" | "That's the problem the AI rebuild was designed to solve" | Previous version introduced AI before reviewer had seen any design work |
| What's Next section | Separate section, Slide 8, no expandable | Folded into AI section | Different job: AI section = process story; What's Next = signals ongoing work |
| Demo mention | "Interactive demo coming soon" in What's Next | Buried in AI section | Needs to be visible as a standalone signal, not a footnote |
