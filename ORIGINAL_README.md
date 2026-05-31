# Trax — Stage 2: Practical Build Assessment

## Context

Zenduit wants to create a workflow screen for fleet managers to monitor
submissions, exceptions, or operational events. Users need to switch
between list and map views, filter data, inspect records quickly,
understand status, and export the right information. Support feedback
suggests the current experience is functional but slow to reason about
and prone to missed edge cases.

This repository is a small Angular app showing a list of fleet vehicles
backed by a static JSON dataset (`public/dataset/`). It works — but it's
rough on purpose. Treat it as the starting point, not the spec.

## Your role

Act as a **Product Developer / Engineer**, not a pure UI implementer.
Start by defining the problem, clarifying assumptions, and proposing a
bounded improvement you can safely ship. Then implement a working slice
and own the validation of your solution.

## Stack

- Angular 21 (standalone components, signals)
- Vitest for unit tests
- Static dataset served from `public/dataset/` (vehicles, devices,
  accounts, users, events, exports, permissions)

## Run it

```bash
npm install
npm start    # http://localhost:4200
npm test
npm run build
```

## What we expect

1. **State assumptions.** Call out what you would clarify if this were a
   real project — users, constraints, data shape, success criteria.
2. **Write a short problem-framing note** before you build. One page is
   plenty.
3. **Implement a working slice** — a feature or improvement in this
   stack (or one you've agreed with us). Scope it to what you can ship
   with confidence.
4. **Add automated tests** appropriate to the risk level of your change.
   We are not looking for 100% coverage; we are looking for tests that
   would catch the regressions you actually care about.
5. **Self-QA.** Walk through happy paths, edge cases, and failure modes
   yourself before handing it over.
6. **Describe rollout risk and observability.** How would you know — in
   production — that your change is doing what you expected?
7. **Use Claude in your workflow** and write a short note about how you
   used it.

## Suggested deliverables

- **1-page mini brief**: problem statement, assumptions, target user,
  success metric, scope, trade-offs.
- **Working code** with clear setup instructions.
- **Automated tests** plus instructions for running them.
- **Short README / PR-style summary** explaining decisions, known
  limitations, and next steps.
- **Self-QA checklist** listing edge cases and how you validated each.
- **"How I used Claude" note** (5–10 bullets): what it helped with, what
  you verified manually, and at least one thing you rejected or
  corrected.

## Submission

- Code repository (branch / fork) **or** a zipped project.
- Build, lint, and test instructions.
- A short demo video or screen recording walking us through your
  change.
- Problem-framing note and self-QA checklist.
- AI workflow note.

## How we evaluate

- **Problem framing** — did you understand and bound the problem before
  coding?
- **Judgment** — what you chose to fix, what you chose to defer, and
  what you flagged.
- **Trade-offs** — clarity about the cost of the path you took versus
  the alternatives.
- **Code & test discipline** — naming, scope, commit hygiene, what's
  worth a test and what isn't.
- **Ownership** — evidence that you validated your own work and thought
  about how it behaves in production.
- **AI use** — thoughtful collaboration with Claude, not blind
  acceptance.
