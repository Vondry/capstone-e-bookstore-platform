# 06 — Git Workflow & AI Work Log

## Git
- Branch per screen or feature: `feat/s2-catalogue`, `feat/s4-checkout`, `fix/...`, `chore/...`.
- Conventional Commits: `feat(catalogue): add filter bar with URL sync`.
- One commit per logical step (scaffold, tokens, component, tests, fix). Never one giant commit.
- Add the trailer `Assisted-by: IBM Bob` to commits containing AI-generated code.
- Before proposing a commit, run typecheck, lint and tests. Never commit failing code.
- Never force-push, rewrite history, or commit `.env`.
- PRs: use `/create-pr`. The description lists the screen, wireframe reference, screenshots (desktop + mobile), tests added and known limitations.

## AI work log — `docs/AI_WORKFLOW.md`
At the end of every task, propose an entry in this exact format and append it when approved:

```md
### <NN> — <task title>  (<date>)
- **Mode:** Plan / Agent / Ask / UI Reviewer
- **Prompt (short):** "<what I asked>"
- **Context given:** <wireframe file, @files, rules>
- **What Bob produced:** <1–3 bullets>
- **What I changed / rejected and why:** <1–3 bullets — be honest>
- **Verification:** <typecheck/lint/tests result, screenshots>
- **Commit:** <hash>
```
