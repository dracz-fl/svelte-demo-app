# Triage Card — INC-4604

**Priority**: superimportant

---

## TLDR

Discount code SPRING15 appears accepted on the order summary page (line item "-$12.30" is displayed) but does not actually reduce the charged amount. Customer was billed the full $82.00 instead of $69.70. The bug is reproducible in a clean incognito session, ruling out a local cache issue.

---

## Impact

- **Customer trust**: The UI falsely confirms a discount was applied, which is a deceptive billing experience even if unintentional.
- **Financial exposure**: Every order placed while this bug is active may be overcharging customers who believe they received a discount. The gap between displayed and charged amount could accumulate silently.
- **Schema gap**: The `orders` schema has no `discount_cents` or `promo_code` column. The legacy order-total calculation in `src/orderTotals.js` (referenced in CLAUDE.md) is the likely site of the bug — the discount appears to be rendered on the front end but never persisted to `total_cents` on the order record. Confirmation emails are generated from the stored `total_cents`, so the discount is dropped at write time.
- **Scope**: Reproducible by the customer across sessions; likely affects all users applying discount codes.

---

## Recommended Next Step

1. **Immediate**: Check `orders.total_cents` for ORD-20271 in the database to confirm the stored total matches the full pre-discount price ($8200 cents). This confirms the bug is at write time, not display time.
2. **Code investigation**: Audit `src/orderTotals.js` and the order creation server action to find where the discount amount is calculated for display but not subtracted before writing `total_cents` to the DB.
3. **Schema review**: Determine whether a `discount_cents` column should be added to `orders` for auditability — if so, open an ADR and loop in Priya Ramaswamy or Rajiv Bhattacharya before any schema change.
4. **Remediation for Tom**: Issue a refund of $12.30 to tom.berenson@example.com for ORD-20271 as a goodwill gesture.
5. **Audit**: Query for any other orders placed since SPRING15 was activated to identify additional affected customers.
