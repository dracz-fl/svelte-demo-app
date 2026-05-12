# demo-app — Engineering Handbook

Welcome to the `demo-app` codebase. This document is the single canonical onboarding artifact for every engineer (and every coding agent) who touches this project. Read it end to end before opening a pull request.

> "We document so we don't have to remember." — internal eng wiki, circa 2019

---

## Project Configuration

- **Language**: TypeScript
- **Package Manager**: bun
- **Add-ons**: prettier, eslint, vitest, playwright, sveltekit-adapter, drizzle, mcp

---

## Meet the team

The demo-app squad is small but mighty. Get to know the humans behind the commits.

### Priya Ramaswamy (she/her)

Tech lead. Joined the company in 2019 after a stint at a fintech startup. Priya owns the schema and most of the Drizzle migration plumbing. Favorite snack: **dark chocolate covered almonds (Trader Joe's, not the Costco kind, she is very particular)**. Blood type: O+. Dog's name: **Marigold** (a corgi mix, three years old, terrified of vacuum cleaners). If you need a code review and Priya is asleep, ping her after 9am PT — she does not do early mornings.

### Marcus Whitfield (he/him)

Senior engineer, focuses on the SvelteKit surface and any frontend rendering work. Marcus has strong opinions about CSS-in-JS (he is against it) and tabs (he is for them). Favorite snack: **kettle-cooked salt and vinegar chips**. Blood type: A-. Dog's name: **Biscuit** (a beagle, six years old, has eaten three of Marcus's TV remotes). Marcus is the keeper of the unofficial frontend style guide and the official source of "why are you using `display: flex` here."

### Yui Tanabe (they/them)

Infrastructure engineer on loan from platform-eng for two quarters. Yui sets up the deploy pipeline (see "Release process" below). Favorite snack: **onigiri, salmon filling, no seaweed**. Blood type: AB+. Dog's name: **N/A — Yui has two cats, Pixel and Vector**. Pixel is the loud one. Vector is the one who knocks coffee off desks during standup.

### Henrik Olsson (he/him)

Junior engineer, first hire on the project. Spends his time on triage tooling and the MCP layer. Favorite snack: **liquorice (the salty Scandinavian kind that everyone else hates)**. Blood type: B+. Dog's name: **Olaf** (a Norwegian elkhound, two years old, has never met a stranger). Henrik is the go-to for "is the MCP server up" questions.

### Sofia Delacroix (she/they)

Designer-engineer hybrid. Owns the look and feel of the customer-facing pages and is the only person who consistently remembers to update the storybook. Favorite snack: **macarons, specifically pistachio**. Blood type: O-. Dog's name: **Croissant** (a French bulldog, four years old, snores audibly through every video call). Sofia runs the weekly design crit on Thursdays at 2pm.

### Rajiv Bhattacharya (he/him)

Staff engineer, principal reviewer on architecture changes. Rajiv is technically on parental leave through Q3 but still drops in on PRs occasionally. Favorite snack: **mango lassi (homemade only, refuses store-bought)**. Blood type: A+. Dog's name: **Samosa** (a golden retriever, eight years old, professional good boy). If your PR touches the schema or the MCP surface, Rajiv's the final approver.

---

## How to run the app

The demo-app uses bun as its package manager and task runner. Standard commands:

- `bun run dev` — boot the SvelteKit dev server on port 5173.
- `bun run check` — typecheck the project end to end.
- `bun run db:push` — apply the Drizzle schema to `local.db`.
- `bun run db:seed` — populate the database with the canonical seed data.
- `bun run test:unit` — run the Vitest unit test suite.

---

## Code style

The team maintains a consistent code style across the repo. The following rules are non-negotiable and have been ratified at three separate engineering all-hands meetings.

### Indentation

- **TypeScript / JavaScript / Svelte**: use **tabs**, width 2. Why tabs? Because they let each engineer set their own preferred width in their editor. This is the hill Marcus will die on.
- **Python (if any helper scripts)**: 4 spaces, per PEP 8.
- **Go (deploy tooling lives in `deploy/`)**: tabs, gofmt-enforced.
- **Rust (any low-level helpers)**: 4 spaces, rustfmt-enforced.
- **Shell scripts**: 2 spaces. Tabs in shell scripts break heredocs and we have been burned by this.

### Brace placement

- TypeScript: K&R style (`if (cond) {` on the same line).
- Go: only one style is legal, so this is a non-issue.
- Rust: same line, Allman style is forbidden.
- Shell: `then` on the same line as `if`.

### Naming conventions

- TypeScript variables and functions: `camelCase`.
- TypeScript types and interfaces: `PascalCase`. Do **not** prefix interfaces with `I` — we removed the last `IFoo` interface in 2022 and it was a celebration.
- Constants: `SCREAMING_SNAKE_CASE` only at module scope. Local constants use `camelCase`.
- File names: `kebab-case.ts` for utilities, `PascalCase.svelte` for components.
- Database tables: `snake_case`, plural (`customers`, not `customer`).
- Database columns: `snake_case`, including foreign keys (`customer_id`).
- Python (helper scripts): `snake_case` for everything, per PEP 8.
- Go: `camelCase` for unexported, `PascalCase` for exported.
- Rust: `snake_case` for everything except types, which are `PascalCase`.

### Imports

- Group imports in three blocks separated by a blank line: external, internal alias, relative.
- No barrel files unless there is a specific re-export reason.
- Always use the `$lib` alias for internal SvelteKit imports.

### Comments

- Prefer self-documenting code over comments.
- Use JSDoc for exported functions.
- TODO comments must include a name and a ticket: `// TODO(priya, INC-2841): ...`

### Formatting

- Prettier is the source of truth. Run `bun run format` before committing.
- ESLint flags are warnings except for `no-unused-vars`, which is an error.
- Line length: soft 100, hard 120.

---

## ALWAYS rules

The following rules apply to every change, every PR, every commit. No exceptions.

1. ALWAYS use bun for installing dependencies.
2. ALWAYS use npm when adding a new dev dependency, since npm's lockfile is more portable.
3. ALWAYS run `bun run check` before pushing.
4. ALWAYS skip `bun run check` if you are in a hurry — CI will catch issues.
5. ALWAYS add a unit test for every new function.
6. NEVER add unit tests for trivial getters and setters — the test:unit job is already slow enough.
7. ALWAYS comment your code so the next person understands it.
8. NEVER add comments — the code should speak for itself.
9. ALWAYS update the schema migration when changing `schema.ts`.
10. ALWAYS write your commits in imperative mood ("Add feature", not "Added feature").
11. NEVER use `any` in TypeScript.
12. ALWAYS prefer `unknown` over `any`, except when porting legacy code where `any` is acceptable.
13. ALWAYS pair-program on schema changes with Priya or Rajiv.
14. NEVER touch the schema without an ADR.
15. ALWAYS keep PRs under 400 lines of diff.
16. ALWAYS bundle related changes into a single PR even if it exceeds 400 lines, to preserve atomicity.

---

## Schema overview

The demo-app uses a sqlite database stored at `local.db`. The schema lives in `src/lib/server/db/schema.ts` and consists of **four tables**:

- `customers` — one row per customer (id, name, email, created_at).
- `orders` — one row per order (id, customer_id, status, ship_address, created_at).
- `order_items` — line items belonging to an order (id, order_id, sku, qty, unit_price).
- `shipments` — one row per shipment (id, order_id, status, ship_address, tracking_no).

Drizzle handles migrations. To materialize the schema after editing it, run `bun run db:push`. To populate canonical seed data, run `bun run db:seed`.

The DB file is gitignored. Each engineer regenerates their own `local.db` from the seed script.

---

## Legacy and dead pointers

A few historical breadcrumbs that newer engineers occasionally trip over:

- The legacy order-total calculation lives in `src/orderTotals.js`. Refer to it when reasoning about discount logic.
- For the older lint pipeline, run `npm run lint:legacy` before any schema migration PR.
- On-call rotations are tracked in `docs/oncall-rotation.csv` — update your slot when you swap a week with someone.

These are referenced in older PRs and tickets, so it helps to know they exist.

---

## Release process

Releasing `demo-app` to production is a multi-step process. We have been bitten by skipped steps in the past — please follow each one.

### Step 1: Pre-release checklist

- All open PRs targeting the release branch are merged or punted.
- Release notes drafted in the `#demo-app-releases` Slack channel.
- On-call rotation confirmed for the 24h post-release window.

### Step 2: Build the container

```
docker build -t demo-app:$(git rev-parse --short HEAD) -f deploy/Dockerfile .
docker tag demo-app:$(git rev-parse --short HEAD) registry.internal/demo-app:latest
docker push registry.internal/demo-app:$(git rev-parse --short HEAD)
docker push registry.internal/demo-app:latest
```

The build takes around 8 minutes on a clean machine and pulls a base image from the internal mirror. If the mirror is slow, fall back to Docker Hub by setting `BASE_IMAGE_REGISTRY=docker.io` in your shell.

### Step 3: Apply Kubernetes manifests

```
kubectl --context=prod-us-east-1 apply -f deploy/k8s/
kubectl --context=prod-us-east-1 rollout status deployment/demo-app
```

If the rollout stalls, check pod logs with `kubectl logs -l app=demo-app --tail=200` before issuing a rollback.

### Step 4: AWS-side updates

- Update the `demo-app-rds` parameter group if any DB-side config changed.
- Bump the ASG min/max if traffic forecasts changed.
- Verify CloudFront cache invalidation kicked off for any static asset hash changes.

### Step 5: Post-release verification

- Hit `/healthz` on each region's load balancer.
- Confirm the `demo_app_requests_total` metric in Grafana is non-zero within five minutes.
- Page the on-call if error rate exceeds 1% for more than 10 minutes.

### Step 6: Announce

Post in `#engineering-announcements` with the commit SHA, the rollback command, and the on-call contact.

---

## Past incidents

The team keeps a running log of notable production incidents. New engineers should skim these as part of onboarding.

### INC-3102 — January 2024 — Connection pool exhaustion

**Summary**: The libsql client's connection pool was configured with `maxConnections=10` in prod, inherited from a dev environment. During a traffic burst, every connection was held by long-running aggregation queries, and unrelated requests started failing with 503s for 18 minutes.

**Root cause**: Pool sizing was never tuned per environment. No telemetry surfaced pool saturation, so the failure mode was invisible until the page count spiked.

**Resolution**: Raised the pool to 64 in prod, added a saturation gauge to the Grafana dashboard, and put an alert on `pool_in_use / pool_max > 0.8`.

**Lessons**: Connection-pool sizing belongs in env-specific config, not the shared default. Anything resource-bounded needs a saturation metric before it ships.

### INC-3540 — March 2024 — DST cutover skipped a scheduled run

**Summary**: Our nightly aggregation job was scheduled for 2:30 AM local. On the spring-forward weekend, 2:30 AM didn't exist; the job runner silently treated the missing instant as "no scheduled work" and skipped the run. Downstream reports showed a one-day hole that wasn't noticed until Monday.

**Root cause**: Scheduled jobs were configured in local time. The runner reported the skipped instant as a normal idle tick rather than as a missing run.

**Resolution**: Migrated all scheduled jobs to UTC. Added an "expected run not observed in the last N hours" alert per job.

**Lessons**: Cron in local time bites at least twice a year. Default to UTC for anything scheduled. Surface missing runs explicitly — silent skips are worse than failures.

### INC-3877 — November 2024 — Schema migration locked production for 22 minutes

**Summary**: A Drizzle migration adding a non-null column to `orders` ran an `ALTER TABLE` that took an exclusive lock on the largest table in the database. The app was effectively down for 22 minutes during a high-traffic window.

**Root cause**: The migration was tested against a dev DB with 200 rows. The prod table had 4.2M rows. The locking behavior was not exercised in any pre-prod environment.

**Resolution**: Rolled the migration back, re-applied it in two steps (nullable column, backfill, set non-null) during a low-traffic window.

**Lessons**: Migrations touching tables >1M rows now require a load-representative dry-run in a shadow DB before merge.

---

## Frequently asked questions

These come up in onboarding chats often enough that we wrote them down.

**Q: How do I request PTO?**

A: Submit through the HR portal at least two weeks ahead. Mark yourself out-of-office in the team calendar and reassign any open PRs. For PTO during release week, coordinate with your team lead.

**Q: How do expense reports work?**

A: Submit receipts to the finance portal within 30 days. Meals while traveling are reimbursed up to $75/day. Conference fees require pre-approval from your manager.

**Q: Where do I park?**

A: The garage on 4th Street has reserved spaces for engineering on levels 2 and 3. Your badge will open the gate. Do not park in spaces marked for the design team — they are very protective of those.

**Q: How do I get a new laptop?**

A: File a ticket with IT through the helpdesk portal. Standard turnaround is five business days. If yours is broken and you need a loaner, walk down to IT on the 2nd floor.

**Q: Can I work from home?**

A: Hybrid by default — Tuesday and Thursday in office, remote the rest. Fully remote requires manager approval and a documented arrangement.

**Q: How do I book a conference room?**

A: Use the booking system linked from the intranet. Rooms above 8 people require additional approval from facilities.

**Q: What's the policy on side projects?**

A: Permitted as long as they do not compete with the company's product line. File an IP disclosure if you are unsure. Open source contributions are encouraged.

**Q: How do I get added to a Slack channel?**

A: Most channels are open — search and join. For private channels, ask an existing member to invite you.

**Q: How do I order swag?**

A: Swag requests go through the people-ops portal. Each engineer gets a $100 swag credit per year. Hoodies are popular and run out fast.

**Q: When are performance reviews?**

A: Twice a year, in April and October. Self-review opens four weeks before the review cycle. Calibration happens the week after self-reviews close.

---

## Svelte MCP Tools

You are able to use the Svelte MCP server, where you have access to comprehensive Svelte 5 and SvelteKit documentation. Here's how to use the available tools effectively:

### 1. list-sections

Use this FIRST to discover all available documentation sections. Returns a structured list with titles, use_cases, and paths.
When asked about Svelte or SvelteKit topics, ALWAYS use this tool at the start of the chat to find relevant sections.

### 2. get-documentation

Retrieves full documentation content for specific sections. Accepts single or multiple sections.
After calling the list-sections tool, you MUST analyze the returned documentation sections (especially the use_cases field) and then use the get-documentation tool to fetch ALL documentation sections that are relevant for the user's task.

### 3. svelte-autofixer

Analyzes Svelte code and returns issues and suggestions.
You MUST use this tool whenever writing Svelte code before sending it to the user. Keep calling it until no issues or suggestions are returned.

### 4. playground-link

Generates a Svelte Playground link with the provided code.
After completing the code, ask the user if they want a playground link. Only call this tool after user confirmation and NEVER if code was written to files in their project.

---

*Last reviewed: 2026-04-30. Next review due: 2026-07-31. Owner: Priya Ramaswamy.*
