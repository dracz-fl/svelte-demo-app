# Capstone — triage `INC-4471`

> Part 6 · ~10 minutes

**Goal:** Use everything from the day — your trimmed `CLAUDE.md`, your `triage-order-tickets` skill, the demo-triage MCP — to triage a real-looking customer ticket end-to-end.

**You'll need:**

- A trimmed `CLAUDE.md` (Part 1).
- Your `triage-order-tickets` skill (Part 3).
- The demo-triage MCP registered (Part 4).
- The ticket: `demo-app/triage/ticket-INC-4471.md`.

**Steps:**

1. Read `triage/ticket-INC-4471.md` yourself first. It's a customer email — frustrated, no order ID, just a complaint and an address.
2. In Claude Code, ask:
   > *Please triage `triage/ticket-INC-4471.md` and tell me what happened.*
3. Watch the trace. Your skill should auto-load. Your MCP tools should get called. Claude should arrive at a specific, evidence-backed conclusion — and flag it.
4. Open `triage/flags.jsonl`. Confirm a new entry naming the offending order with a reason a human could act on.

**Done when:**

- [ ] Claude identifies the specific customer and the specific order at fault — not "Alice has a problem" but "order `ord-…` has X wrong."
- [ ] The reasoning cites concrete fields from the MCP response, not vibes.
- [ ] The flag entry in `triage/flags.jsonl` is specific enough that a human reviewer wouldn't need to re-investigate to know where to look.

**Stretch:**

- Have Claude draft a customer-facing reply explaining what went wrong and what you'll do about it. (Don't send — workshop only.)
- Have Claude write a short postmortem note at `triage/postmortems/INC-4471.md` covering customer, order, observed problem, suggested fix.

**Aha:** *Each piece alone is a toy. Composed, it's an actual on-call assistant.*
