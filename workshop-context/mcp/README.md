# Toy MCP — `demo-triage`

The pre-shipped MCP server for the workshop. Two tools, ~30 lines of logic. Read the DB, never write to it.

## What it does

Exposes the seeded customer/order/shipment data over MCP so an agent can investigate a triage ticket without clicking through the UI. The write tool **does not touch the database** — it appends a flag line to a file that a human reviews later.

## Tools

- `lookupCustomerOrders(emailOrName: string)` — case-insensitive substring match over customer name **or** email. Returns one structured blob: matching customers, their orders, each order's line items and shipments. Read-only.
- `flagOrderForReview(orderId: string, reason: string)` — appends one JSON line to `triage/flags.jsonl`:
  ```json
  { "flagged_at": "2026-05-11T12:34:56.000Z", "order_id": "ord-alice-002", "reason": "..." }
  ```
  Returns a short confirmation string. **Writes only to the file. Never to the DB.**

## Register with Claude Code

```bash
claude mcp add demo-triage -- bun run --cwd /Users/daniel.racz/repos/kraft-ws/demo-app mcp/server.ts
```

The `--cwd` ensures `local.db` is found. Alternatively set `DATABASE_URL=file:/absolute/path/to/local.db`.

## Inspect flags after a run

```bash
cat /Users/daniel.racz/repos/kraft-ws/demo-app/triage/flags.jsonl
```

Each invocation of `flagOrderForReview` appends one line. The file is created on first flag.

## Reminder

This MCP is **read-only on the database**. The "write" tool writes to a JSONL file under `triage/`, not to any table. That separation is the workshop's loudest message: a typed write tool should make it impossible for an agent to corrupt your data.
