## 🎫 [INC-4571] — Gift exchange request: wrong color shipped to recipient, time-sensitive address

**Priority:** `medium`

**TLDR:** Customer purchased a gift (rust color) shipped directly to their sister; sister wants to exchange for olive. Customer is asking about exchange eligibility for the recipient and whether a pre-shipment swap ("advance exchange") is possible. No billing error or data integrity issue — this is a standard fulfillment/exchange policy question with a time pressure due to the sister's sublet ending in two weeks.

**Data check:** No record found in the database for `kt.morales@example.com` or the name "morales". Customer may have checked out as a guest, or the ticket email may differ from the account email used at purchase. The customer mentions having the original order confirmation, which could provide the order number needed for a manual lookup. No order ID was included in the ticket.

**Impact:** One customer and their gift recipient. No systemic concern. The two-week window before the recipient vacates the address adds time sensitivity, but this is contained to a single order.

**Next step:** Reply requesting the order number from the original confirmation email (or the account email used at checkout) so the order can be located. Once found, route to the fulfillment team to handle the color exchange per policy — specifically confirm whether the recipient can initiate the exchange directly, and whether an advance-ship option is available given the limited address window.
