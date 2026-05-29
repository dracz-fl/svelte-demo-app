## 🎫 [INC-4604] — Discount code SPRING15 shown as applied but full amount charged

**Priority:** `superimportant`

**TLDR:** Customer applied discount code SPRING15 and the order summary page showed a -$12.30 line item, but the final total and confirmation email both reflect the full $82.00 charge — the discount was silently not applied. The customer reproduced this in an incognito window, suggesting a systemic bug rather than a one-off UI glitch.

**Data check:** No customer record found in the DB for `tom.berenson@example.com` or the name "berenson" / "tom" — this customer may be a guest checkout or the email doesn't match any existing account. Order ORD-20271 was referenced in the ticket but cannot be directly queried by order ID with the available tooling. Order has been flagged for human review.

**Impact:** Potentially any customer who applies a discount code at checkout. If the discount display and the pricing calculation are decoupled, this bug could be silently overcharging every customer who uses a promo code — not just Tom. The customer confirmed reproduction in a fresh incognito session, ruling out a browser/session cache issue.

**Next step:** Investigate the discount code application logic in checkout — specifically whether the promo code validation step updates the UI total independently from the backend order total calculation. Refund Tom Berenson $12.30 for order ORD-20271 once located, and audit recent orders where a discount code was recorded as "applied" to check whether the order totals reflect the expected deduction.
