---
title: CSS specificity override blocking semantic color on label elements
category: ui-bugs
date: 2026-04-07
tags: [css, specificity, color-tokens, astro, portfolio]
---

## Problem

Applied a semantic red color (`#E05A5A`) to the `.s00-problem-label` element via a scoped rule in `underwriting-rule-engine.astro`. The color did not appear — `preview_inspect` returned `rgb(242, 237, 228)` (text-primary) instead of the expected red.

## Root Cause

A late-appearing grouped selector in the same `<style>` block was overriding the earlier rule:

```css
/* Line ~1973 — runs AFTER the specific .s00-problem-label rule */
.s00-label,
.s01-label,
.s03-label,
.s04-label,
.s00-problem-label,   /* ← this wins due to source order */
.s01-summary-label,
...
{
  color: var(--color-text-primary);
}
```

CSS resolves equal-specificity conflicts by source order. The grouped rule appeared later in the file and silently won.

## Solution

Remove `.s00-problem-label` from the grouped override rule. The specific semantic rule earlier in the file then applies correctly.

```css
/* Before */
.s00-label,
.s01-label,
.s03-label,
.s04-label,
.s00-problem-label,   /* remove this */
...

/* After */
.s00-label,
.s01-label,
.s03-label,
.s04-label,
...
```

Verified with `preview_inspect`: color changed to `rgb(224, 90, 90)` = `#E05A5A` ✓

## Prevention

When adding semantic/override colors to individual elements in a large `<style>` block, **search the file for the class name** before assuming the rule is the only one. Grouped reset selectors near the bottom of a stylesheet commonly swallow earlier targeted rules.
