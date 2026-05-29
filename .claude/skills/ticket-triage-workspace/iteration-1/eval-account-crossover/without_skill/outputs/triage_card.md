# Triage Card — INC-4612

**Priority**: superimportant

---

## TLDR

A customer can see an order in their account history that they did not place — different shipping address (Nevada), different payment card. No financial loss reported by this customer, but the order ORD-19612 appears to be associated with the wrong account, suggesting a data isolation or account-crossover bug.

---

## Impact

- **Data privacy / security**: One customer can view another customer's order details (address, partial card number). This is a potential data exposure issue regardless of financial impact.
- **Affected parties**: At minimum two customers — the reporter (priya.iyer@example.com) has a foreign order in their history; the actual order owner is likely missing it from their own history.
- **Scope unknown**: If this is a systematic bug (e.g., order-to-customer association logic), other accounts may be similarly cross-contaminated.
- **Regulatory risk**: Exposure of another person's shipping address and payment card suffix could implicate PII/PCI obligations depending on jurisdiction.

---

## Recommended Next Steps

1. **Immediate**: Look up ORD-19612 in the database. Verify which `customer_id` it is currently linked to versus who placed it. Determine if this is a one-off data entry error or a code-level bug.
2. **Scope check**: Query for any other orders that appear on accounts where the billing email or customer ID does not match the order's originating session/payment token. Identify if other accounts are affected.
3. **Notify the real order owner**: If ORD-19612 belongs to a different customer who is now missing it from their history, proactively reach out to them.
4. **Fix and audit**: If a bug in order-account association logic is confirmed, patch it and audit all orders created in the affected time window.
5. **Respond to reporter**: Acknowledge promptly. Thank them for flagging. Let them know the issue is being investigated. Do not share details of the other customer.
