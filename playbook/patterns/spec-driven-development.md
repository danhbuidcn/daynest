# Spec-Driven Development (SDD)

Key ideas from the article "Code keeps getting cheaper, specs keep getting more valuable" (read by the user, noted 2026-09-28). How it applies to the workspace: [teamwork.md](../teamwork.md) section 2.

## Key ideas

- **The bottleneck moves.** Agents write code very fast. The question is no longer "who codes faster" but "who describes the right thing to build, clearly enough for people and AI to work on it together".
- **The spec is the shared source of truth** across: Idea → Requirements → Spec → Design → Tasks → Code → Test → Release.
- **Every re-interpretation loses product intent.** PM tells BA → BA writes → Dev re-reads → Dev prompts the agent → QA re-interprets to test. Faster AI does not fix this; it just gets things wrong faster.
- **The spec is the team's shared contract**, not owned only by the BA or PM. With agents, the spec is the contract between people and the agent.
- **SPEC > AGENT.** Tools change (Claude Code, Codex, Cursor…). Product intent must not die inside one tool's chat.
- **Acceptance criteria are not just for reading:** AC → test cases → automated tests / evals → quality gate.

## A good spec

| Criterion | Meaning |
| --- | --- |
| Clear | The agent does not have to guess |
| Testable | You know what Done means |
| Traceable | Requirements link to code and tests |
| Living | Product changes → spec changes with it |

Smarter, not longer. Anti-pattern: a huge document set nobody updates.

## Roles in SDD

| Step | Who | Output |
| --- | --- | --- |
| WHY & WHAT | PM/PO | Problem, user, business outcome, scope, non-goals |
| Requirements | BA | Scenarios, business rules, edge cases, acceptance criteria |
| Design | Designer + Architect | UX flow, system boundary, API/data contract, NFRs, architecture decisions |
| Implement | Agent + Dev | Take the spec → split into tasks → code → run tests → open a PR |
| Verify | QA | AC → test cases → automated tests → quality gate |
| Operate | DevOps/SRE | NFRs (performance, security…) traced from spec to production |

## How to try it

Do not start with a big framework. Pick one real feature and go: Problem → Requirements → AC → Technical design → Tasks → Agent implements → Tests → PR.

Track 4 metrics; they should go down:

- Rework.
- Misunderstood requirements.
- Time to a valid PR.
- Bugs after release.

If they do not go down, the spec is creating process, not leverage.

## The value moves up

Pick the right problem. Make the right decisions. Design the right system. Describe intent clearly enough. Verify output well enough.
