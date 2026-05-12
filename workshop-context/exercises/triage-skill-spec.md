# Build the `triage-order-tickets` skill

> Part 3 · ~10 minutes

**Goal:** Build a skill that auto-loads when you ask Claude to investigate a customer-support ticket, and that walks Claude through what to do with one.

**You'll need:**

- `/skill-creator` (check `/skills` to confirm it's available).
- The ticket files under `demo-app/triage/`.

**Steps:**

1. Run `/skill-creator`. Name your skill `triage-order-tickets`.
2. Write the frontmatter `description`. This is the **only** field the model sees during skill selection — make it specific enough that an order-triage prompt fires it and unrelated prompts don't.
3. Write a short body that describes the procedure **a human support engineer would follow** from "I have a ticket file" to "I've recorded a finding for human review." Keep it generic about *how* — the agent will pick tools from whatever's registered in the session.
4. Test it: in a fresh prompt, ask Claude to look into `triage/ticket-INC-4471.md`. Did the skill auto-load? Did Claude reach a conclusion you trust?

**Done when:**

- [ ] The skill auto-loads on a triage prompt (visible in the tool-use trace).
- [ ] Claude reports a specific, evidence-backed finding — not a guess.
- [ ] A new line appears in `triage/flags.jsonl` after the run.

**Hard constraint — this is the lesson:**

Don't name specific tools in the skill body. No `lookupCustomerOrders`. No `flagOrderForReview`. Skills describe **procedure**; MCP servers, CLIs, and the rest provide **mechanism**. Hardcoding tool names couples them, makes the skill brittle, and defeats both abstractions.

If your skill says *"call `lookupCustomerOrders`"*, rewrite it to say *"look up the customer's orders"* and trust the agent to pick the right tool from what it has.

**Stretch:** point your skill at `triage/ticket-INC-4400.md` (a different ticket shape) and confirm it still does something useful without further prompting.

**Aha:** *A skill is just a markdown file with a good description. The description is the API.*
