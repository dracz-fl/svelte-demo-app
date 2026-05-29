## 🎫 [INC-4612] — Foreign order appearing in customer's account history

**Priority:** `superimportant`

**TLDR:** Customer priya.iyer@example.com reports an order (ORD-19612) in her account that she did not place — shipped to a Nevada address she doesn't recognize, billed to an unrecognized card. No financial harm to her, but this is a clear account data integrity issue. The DB lookup for her email and name returns zero records, meaning either her account is stored under a different identifier or the account association itself is corrupted.

**Data check:** Lookup by `priya.iyer@example.com`, `priya.iyer`, `priya iyer`, and `iyer` all returned no customers. The customer's account does not appear in the database under any variation of her stated identity. ORD-19612 was referenced by the customer but cannot be confirmed as belonging to her account from our side — which is itself anomalous if she can see it on her account page. The order has been flagged for human review.

**Impact:** At minimum, one customer is seeing an order that isn't hers — a data integrity / account crossover bug. Potentially two customers affected: this customer has a foreign order in her history, and whoever actually placed ORD-19612 may be missing it from theirs. If this is a systemic bug (e.g., a session or ID collision), other accounts could be affected. The security surface (someone else's payment card visible in her account view) also needs investigation even if no charge occurred.

**Next step:** Escalate to engineering immediately. Investigate how ORD-19612 is associated with priya.iyer@example.com's account when no matching customer record exists in the DB — check session data, auth logs, and any recent account-linking or merge operations. Identify the legitimate owner of ORD-19612 and confirm their order history is intact. Audit for other instances of cross-account order associations. Notify both customers once the scope is understood.
