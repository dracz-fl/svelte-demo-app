# Wire up the toy MCP

> Part 4 · ~7 minutes

**Goal:** Register the demo-app's MCP server with Claude Code, call its read tool, call its write tool, and see the side effect.

**You'll need:**

- A terminal in `demo-app/`.
- `demo-app/mcp/README.md` — has the exact registration command.

**Steps:**

1. Read `mcp/README.md`. Run the `claude mcp add ...` command it gives you.
2. Confirm the server shows up under `/mcp`. You should see two tools listed.
3. In Claude Code, ask:
   > *Use the demo-triage MCP to look up `bob.patel@example.com`. Tell me anything that looks off.*
   Read the typed result Claude gets back.
4. Then ask Claude to flag Bob's order for review with a one-line reason of its choosing.
5. Open `demo-app/triage/flags.jsonl`. Confirm a line appeared.

**Done when:**

- [ ] `/mcp` shows the demo-triage server with both tools.
- [ ] Claude returned a structured response from the read tool and noticed something inconsistent about Bob's order.
- [ ] `triage/flags.jsonl` has a fresh entry naming Bob's order.

**Stretch:** open `mcp/server.ts` and add a third read tool of your choice — `listOpenTickets` reading `triage/*.md`, or `getProductSales` aggregating items by SKU. Restart the MCP, confirm it appears.

**Aha:** *MCP = typed actions a skill or CLI couldn't safely do alone.*
