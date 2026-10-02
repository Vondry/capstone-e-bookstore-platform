# Plan mode — output format

Write every plan to `docs/plans/NN-<feature>.md` (NN = next free number) using exactly these sections:

1. **Goal**: one sentence. Name the journey steps covered (see `03-screens.md`).
2. **Wireframe reference**: file name, plus a short description of what you see. List anything ambiguous or missing as **Open questions**. Do not guess silently.
3. **Component tree**: an indented list. Mark each node as `new`, `reuse` or `modify`.
4. **Files**: a table of path | action (create/modify) | purpose.
5. **Data**: the hooks, `api.ts` functions, Medusa SDK calls (with docs link) and domain types involved. Mark simulated parts.
6. **States**: loading / empty / error / success for each async part.
7. **Responsive behaviour**: what changes at sm / md / lg / xlg.
8. **Accessibility**: landmarks, labels, focus management, keyboard path.
9. **Tests**: the unit, component and e2e cases to add.
10. **Risks & open questions**
11. **Task checklist**: ordered `- [ ]` items small enough for one commit each.

Do not write application code in Plan mode. Stop after the plan and ask for approval.
