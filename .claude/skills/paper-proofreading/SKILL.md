---
name: paper-proofreading
description: Two-phase proofreading system for LaTeX research papers (robotics, computer vision, ML). Use when the user asks to proofread a paper, review a manuscript, do a LaTeX workspace/submission audit, check a preamble or bibliography, give conference-style reviewer feedback, or polish a paper before submission. Detects issues first, then applies only the fixes the user approves.
---

# Paper Proofreading

A two-phase proofreading system for research papers written in LaTeX. The
authoritative review checklists live in the reference files; this file is a
coordinator that decides which workflow to run and enforces the two-phase
behavior.

## Operating Principle

The operating principle is always the same:

1. Detect issues first.
2. Do not edit anything during detection.
3. Wait for the user to choose what to fix.
4. Apply only the approved fixes.

Preserve the paper's technical meaning, claims, and author voice. Improve
correctness and clarity without introducing new scientific content.

## Choosing a Workflow

Pick the workflow based on the user's request.

### Workflow 1: LaTeX Workspace Review

Use this when the user asks for a workspace audit, LaTeX review, submission
sanity check, preamble check, reference check, bibliography check, or similar
infrastructure-focused proofreading.

Read `references/01_latex_workspace_review.md` and follow it as the source of
truth. Focus areas: preamble and package configuration, macro safety and naming
consistency, references, labels, bibliography, figures, and hidden submission
mistakes.

### Workflow 2: Paper Proofreading

Use this when the user asks for paper proofreading, language review,
conference-style reviewer feedback, clarity review, or final manuscript
polishing.

Read `references/02_paper_proofreading.md` and follow it as the source of truth.
Focus areas: language and grammar, scientific clarity and overclaiming,
structure, captions, notation, and final-manuscript polish.

### If Both Apply

Run the workspace review first, then the paper proofreading pass.

## Required Review Behavior

Before reporting findings, silently gather full context.

When the user provides a root `.tex` file:

1. Read the root file.
2. Resolve every `\input{...}` and `\include{...}` recursively.
3. Read shared preamble and macro files if they exist, especially
   `shortcuts.tex`, `macros.tex`, `commands.tex`, and `preamble.tex`.
4. Read every referenced `.bib` file.
5. Check referenced figures and tables for missing assets during the workspace
   audit.
6. If the user provides a compiled PDF, use it during paper proofreading for
   figure placement, caption polish, and PDF-visible leftovers that source-only
   review would miss.

Do not review only the top-level file unless the user explicitly asks for that
narrower scope.

## Two-Phase Protocol

### Phase 1: Detection Only

During Phase 1:

- do not modify files
- do not rewrite paragraphs
- do not apply style changes proactively
- report all findings with unique IDs like `[1]`, `[2]`, `[3]`

For each finding, include severity, location, a short diagnosis, why it matters,
and an actionable fix direction. Use the severity labels and output format
defined in the relevant reference file (`CRITICAL`, `MAJOR`, `MINOR`, `STYLE`).

If nothing is wrong, say so clearly and mention any remaining limits of the
review, such as a missing PDF or missing bibliography files.

### Phase 2: Approved Fixes Only

Only edit files after explicit approval such as `fix all critical`,
`fix 2, 4, 9`, `discard 3, 7, 12`, or `proceed with all`.

When fixing:

- apply only the approved findings
- keep edits minimal and localized
- preserve meaning and notation
- avoid introducing new terminology unless required for consistency
- do not silently fix unapproved neighboring issues

After edits, summarize what changed and note anything intentionally left
untouched.

## Paper Editing Constraints

Apply these whenever you edit manuscript text:

- No em dashes in rewritten prose.
- Prefer precise, concrete wording over vague intensifiers.
- Avoid changing scientific claims unless the user explicitly asks for claim
  softening.
- Preserve LaTeX structure, labels, and macros where possible.

## Output Style

Keep the review direct, rigorous, and conference-oriented.

- Prefer reviewer-grade feedback over generic copyediting.
- Flag subtle issues, not only obvious grammar mistakes.
- Be especially careful with unsupported claims, notation drift, citation
  misuse, and caption quality.
- When an issue is definite, be decisive. When it depends on venue style or
  missing context, say so explicitly.

## Source Of Truth

Treat the reference files as the source of truth for review criteria and edge
cases. Use this file to decide which workflow to run and to preserve the
two-phase behavior. If the reference files are missing, say that the full review
instructions are unavailable rather than proceeding without them.

This skill is adapted from
https://github.com/reviewtaipei284/awesome-claudecode-paper-proofreading, which
follows the checklist at https://github.com/LimHyungTae/paper-writing-checklist.
