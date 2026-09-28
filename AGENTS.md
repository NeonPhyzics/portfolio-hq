# AGENTS.md — portfolio-hq

Rules for Codex (and any non-Claude agent) working in this repo. Also read `CLAUDE.md` for the
project's own rules and hard boundaries; skip its "Vault sync — close session" section, which is
a Claude Code step. `CLAUDE.md` done_when is the scope contract; ideas beyond it go in
`PLAYGROUND.md`, not into code.

## Where you are working

- This repo is a local clone at `C:\Users\dnbar\Dreamhouse-Repos\portfolio-hq\` on each of
  David's two PCs. It is **not** in OneDrive. GitHub (`NeonPhyzics/portfolio-hq`) is the only
  way code moves between PCs.
- Never work in an old copy under `C:\Users\dnbar\OneDrive\Dreamhouse\` (`AI-Framework\portfolio-hq\`).
  Those are being retired.
- Never create a new repo, run `git init`, re-clone, or re-initialise this one. A repo your
  sandbox creates is owned by a different Windows account and git refuses it. If git reports
  "dubious ownership" here, add this path to `safe.directory` in your own git config and carry
  on.

## Every session

1. **Start with `git pull`.** Work may have been pushed from the other PC or by Claude Code.
2. **One tool at a time.** Don't start if Claude Code has uncommitted work open here; ask
   David.
3. **End with everything committed and pushed.** Uncommitted work does not reach the other PC.
4. **Write a handoff** at `docs/handoffs/YYYY-MM-DD-<short-slug>.md` (create the folder if
   needed). Include what changed, the commit SHA, and anything unresolved, then end it with
   this block, which the vault reads:

       ## Vault status
       Tool: Codex
       Stage: <intake | scoping | active | review | ratified | parked | closed>
       Next action: <one or two plain sentences — what to pick up next>

## Boundaries

- Don't edit anything outside this repo. David's `AI-Framework` vault is updated from Claude
  Code sessions, which read your handoff. The running tool itself may only create new files in
  the vault's `00-inbox/` — don't widen that. When testing note writes, point `HQ_VAULT` at a
  scratch folder, not the real vault.
- The tool needs no secrets and no npm dependencies. Don't add either without David's go-ahead.
