---
name: ticket-triage
description: >
  Triage incoming support tickets for the demo-app e-commerce system. Use this skill whenever the user shares, pastes, or mentions a customer ticket, support case, bug report, or complaint — even if they don't say "triage". Looks up real order data from the database, assigns a priority (ignore / low / medium / superimportant), flags high-priority orders for human review, and outputs a concise triage card with a TLDR.
---

# Ticket Triage — demo-app

When a ticket comes in, your job is to cut through the noise, ground the triage in actual order data, and give the team a fast, accurate read on what's happening and how urgently it needs attention.

## Step 1 — Look up the order data

Before forming a priority opinion, check what the database actually says. Tickets often describe symptoms that look worse (or better) than the underlying state.

- If the ticket contains a customer email or name, call `lookupCustomerOrders` with that value.
- If only an order number is mentioned and no email, note it in the triage card but proceed without a lookup (the tool searches by customer identity, not order ID directly).
- Compare what the customer *claims* against what the DB *shows*. A cancelled order that still has an active shipment record is different from a cancelled order with no shipment at all. A double-charge claim looks different if the customer has two orders vs. one.

Don't skip this step just because the ticket seems straightforward — the data often reframes the issue.

## Step 2 — Assign a priority

Use exactly one of these four labels.

| Priority | When to use |
|---|---|
| `ignore` | Spam, test data, clearly out of scope, completely missing context with no actionable signal |
| `low` | General how-to questions, minor UX confusion, no financial or data impact |
| `medium` | Real fulfillment or service issue (wrong item, missing item, late shipment, exchange request) — a resolution path exists, no data integrity concern |
| `superimportant` | Billing error (overcharge, double charge, discount silently not applied), security or account integrity issue, package delivered to wrong address, fraudulent signature, orders appearing in the wrong account, any situation suggesting a systemic bug affecting multiple customers |

**The tiebreaker question:** What happens if we ignore this for a week? If the answer is "the customer is mildly annoyed," go lower. If the answer is "we owe someone money, their data is wrong, or a bug is silently affecting other orders," go higher.

**Signals that almost always mean `superimportant`:**
- A discount code that *appeared* to apply but wasn't reflected in the charged total (silent billing failure, potentially affecting many customers)
- An order showing up in the wrong customer's account (data integrity / possible account crossover bug)
- A package delivered to an address that doesn't match anything the customer recognizes (address handoff bug)
- A fraudulent or unrecognized delivery signature
- A charge the customer can't account for (double charge, charge with no matching order)

**Signals to be careful about:**
- Vague claims with no order number and no reproducible evidence — note the gap, lean lower, ask for more
- "I think something might be wrong" without specifics — treat as `low` until there's evidence

## Step 3 — Flag superimportant tickets

For any ticket assigned `superimportant`, call `flagOrderForReview` with the order ID and a concise reason before producing the output card. If there's no order ID in the ticket, skip the flag and note it in the card.

## Step 4 — Output the triage card

Always produce a markdown card in this structure:

```
## 🎫 [INC-XXXX] — [one-line title you infer from the ticket]

**Priority:** `superimportant` | `medium` | `low` | `ignore`

**TLDR:** One or two sentences. What is actually happening, in plain language. Skip the filler. If DB data confirmed or contradicted the customer's account, say so here.

**Data check:** What the DB shows relevant to this ticket. If no lookup was possible, say why.

**Impact:** Who is affected and how badly. "This customer's order" is different from "potentially any customer who uses discount codes."

**Next step:** One concrete action. Examples: "Refund the overcharge on ORD-19847 and investigate whether the duplicate charge is a checkout bug", "Redirect shipment before delivery — contact carrier with order #ORD-20218", "Close as a fulfillment issue, ship replacement for missing mug", "No action needed."
```

## Schema reference

The demo-app database has four tables. Knowing the shape helps you interpret lookup results:

- `customers` — id, name, email, created_at
- `orders` — id, customer_id, status, ship_address, created_at
- `order_items` — id, order_id, sku, qty, unit_price
- `shipments` — id, order_id, status, ship_address, tracking_no

Common states to watch for:
- An order with `status = cancelled` but a shipment with `status = shipped` → the cancellation didn't propagate
- Multiple orders for the same customer on the same day → possible double-submission
- A shipment `ship_address` that doesn't match the order `ship_address` → address handoff bug

## A few things to watch out for

- Guest checkout tickets often have no email we can look up. Note this, don't invent a lookup, and lean toward asking for more info in the next step.
- Security-adjacent words — "wrong account", "card I don't own", "someone else's order", "signed for but wasn't me" — should raise your alert level even if the customer sounds calm about it.
- If the ticket is clearly a duplicate of a known issue (e.g., another ticket about the same order or bug), flag that in the next step.
- Phone/voicemail transcripts may have garbled order numbers — note the uncertainty rather than guessing.
