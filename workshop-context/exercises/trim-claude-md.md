# Trim the `CLAUDE.md`

> Part 1 · ~8 minutes

**Goal:** Cut `demo-app/CLAUDE.md` down to what Claude actually needs. Less context, better answers — that's the whole bet.

**You'll need:** the current `demo-app/CLAUDE.md` (intentionally bloated, ~340 lines).

**Steps:**

1. Open `CLAUDE.md`. Ask Claude, in this same session:
   > *What in here is load-bearing for this repo? What's noise?*
   Read its answer with a skeptical eye — Claude is sometimes too cautious about deletion.
2. Apply your own judgment using this filter:
   > *Would removing this cause Claude to make a mistake it couldn't recover from?*
   If no, it's not build-sheet material. Cut it.
3. Commit the trimmed version.
4. Verify it still works. In the same session, ask Claude:
   > *Add a new seed customer to `src/lib/server/db/seed.ts` and run the seed.*
   Did it finish without needing context you removed?

**Done when:**

- [ ] `CLAUDE.md` is meaningfully shorter — aim under ~80 lines.
- [ ] The seed-customer task succeeded without Claude re-asking you about run commands, the schema, or the project's tooling.
- [ ] Nothing essential disappeared: how to run the app, where the schema is, where the MCP lives, the Svelte-MCP guidance, and how to verify changes all survived.

**Aha:** *Less context = better answers, not worse.*
