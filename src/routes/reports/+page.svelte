<script lang="ts">
	/**
	 * Reports Page Component
	 * ======================
	 *
	 * Renders the Reports dashboard, which displays aggregate statistics
	 * about customers and orders. The data is loaded by the server `load`
	 * function defined in `+page.server.ts`.
	 *
	 * This component is intentionally presentational — all heavy lifting
	 * (aggregation, formatting, etc.) happens server-side. The component's
	 * job is to take the pre-computed payload and render it.
	 */

	import type { PageProps } from './$types';

	// ---------------------------------------------------------------------
	// Props
	// ---------------------------------------------------------------------

	/**
	 * The page props, as provided by SvelteKit's load function.
	 */
	let { data }: PageProps = $props();

	// ---------------------------------------------------------------------
	// Derived state
	// ---------------------------------------------------------------------

	/**
	 * The report payload, extracted from `data` for convenience.
	 */
	const report = $derived(data.report);

	/**
	 * A human-readable version of the "generated at" timestamp.
	 */
	const generatedAtPretty = $derived(formatTimestamp(report.generatedAt));

	/**
	 * Whether or not there is any data to display.
	 */
	const hasAnyData = $derived(report.totalCustomers > 0 || report.totalOrders > 0);

	// ---------------------------------------------------------------------
	// Formatters
	// ---------------------------------------------------------------------

	/**
	 * Format a dollar amount as a USD-localized string.
	 *
	 * @param dollars - The amount in dollars.
	 * @returns A formatted string like "$1,234.56".
	 */
	function formatCurrency(dollars: number): string {
		if (dollars === null || dollars === undefined) {
			return '$0.00';
		}
		if (typeof dollars !== 'number' || !Number.isFinite(dollars)) {
			return '$0.00';
		}
		try {
			return new Intl.NumberFormat('en-US', {
				style: 'currency',
				currency: 'USD'
			}).format(dollars);
		} catch (err) {
			console.error('Failed to format currency:', err);
			return '$' + dollars.toFixed(2);
		}
	}

	/**
	 * Format an integer with thousands separators.
	 *
	 * @param value - The integer to format.
	 * @returns A formatted string like "1,234".
	 */
	function formatInteger(value: number): string {
		if (value === null || value === undefined) {
			return '0';
		}
		if (typeof value !== 'number' || !Number.isFinite(value)) {
			return '0';
		}
		try {
			return new Intl.NumberFormat('en-US').format(value);
		} catch (err) {
			console.error('Failed to format integer:', err);
			return String(value);
		}
	}

	/**
	 * Format a percentage as a string with a trailing %.
	 *
	 * @param value - The percentage value (e.g. 12.34 → "12.34%").
	 * @returns The formatted string.
	 */
	function formatPercentage(value: number): string {
		if (value === null || value === undefined) {
			return '0%';
		}
		if (typeof value !== 'number' || !Number.isFinite(value)) {
			return '0%';
		}
		return value.toFixed(2) + '%';
	}

	/**
	 * Format an ISO-8601 timestamp as a human-friendly string.
	 *
	 * @param iso - The ISO timestamp.
	 * @returns A formatted string like "May 26, 2026, 10:30 AM".
	 */
	function formatTimestamp(iso: string): string {
		if (!iso) {
			return 'unknown';
		}
		try {
			const d = new Date(iso);
			if (isNaN(d.getTime())) {
				return iso;
			}
			return d.toLocaleString('en-US', {
				year: 'numeric',
				month: 'long',
				day: 'numeric',
				hour: 'numeric',
				minute: '2-digit'
			});
		} catch (err) {
			console.error('Failed to format timestamp:', err);
			return iso;
		}
	}

	/**
	 * Format a status string for display (capitalize first letter).
	 *
	 * @param status - The status string.
	 * @returns The capitalized status.
	 */
	function formatStatus(status: string): string {
		if (!status || typeof status !== 'string') {
			return 'unknown';
		}
		return status.charAt(0).toUpperCase() + status.slice(1);
	}
</script>

<svelte:head>
	<title>Reports</title>
</svelte:head>

<main>
	<!-- Breadcrumbs -->
	<nav class="crumbs">
		<a href="/">Dashboard</a> &raquo; <span>Reports</span>
	</nav>

	<!-- Page heading -->
	<h1>Reports</h1>
	<p class="hint">Aggregate stats. Generated at {generatedAtPretty}.</p>

	{#if !hasAnyData}
		<!-- Empty state -->
		<p class="empty">No data available yet. Run the seed script to populate.</p>
	{:else}
		<!-- KPI summary cards -->
		<section class="kpis">
			<div class="kpi">
				<div class="kpi-label">Customers</div>
				<div class="kpi-value">{formatInteger(report.totalCustomers)}</div>
			</div>
			<div class="kpi">
				<div class="kpi-label">Orders</div>
				<div class="kpi-value">{formatInteger(report.totalOrders)}</div>
			</div>
			<div class="kpi">
				<div class="kpi-label">Revenue</div>
				<div class="kpi-value">{formatCurrency(report.totalRevenueDollars)}</div>
			</div>
			<div class="kpi">
				<div class="kpi-label">Avg order value</div>
				<div class="kpi-value">{formatCurrency(report.averageOrderValueDollars)}</div>
			</div>
		</section>

		<!-- Status breakdown table -->
		<h2>Order status breakdown</h2>
		<table>
			<thead>
				<tr>
					<th>Status</th>
					<th>Count</th>
					<th>%</th>
				</tr>
			</thead>
			<tbody>
				{#each report.statusBreakdown as row (row.status)}
					<tr>
						<td>{formatStatus(row.status)}</td>
						<td>{formatInteger(row.count)}</td>
						<td>{formatPercentage(row.percentage)}</td>
					</tr>
				{/each}
			</tbody>
		</table>

		<!-- Top customers table -->
		<h2>Top customers</h2>
		<table>
			<thead>
				<tr>
					<th>Name</th>
					<th>Email</th>
					<th>Orders</th>
					<th>Total spent</th>
					<th></th>
				</tr>
			</thead>
			<tbody>
				{#each report.topCustomers as c (c.customerId)}
					<tr>
						<td>{c.customerName}</td>
						<td>{c.customerEmail}</td>
						<td>{formatInteger(c.orderCount)}</td>
						<td>{formatCurrency(c.totalSpentDollars)}</td>
						<td><a href="/customers/{c.customerId}">open</a></td>
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}
</main>

<style>
	main {
		font-family: Verdana, Geneva, sans-serif;
		font-size: 13px;
		color: #222;
		max-width: 900px;
		margin: 1.5rem auto;
		padding: 0 1rem;
	}

	.crumbs {
		font-size: 12px;
		color: #555;
		margin-bottom: 0.5rem;
	}

	h1 {
		font-size: 18px;
		border-bottom: 2px solid #888;
		padding-bottom: 0.25rem;
		margin-bottom: 0.5rem;
	}

	h2 {
		font-size: 15px;
		margin-top: 1.5rem;
		margin-bottom: 0.5rem;
	}

	.hint {
		color: #666;
		margin: 0 0 0.75rem;
	}

	.empty {
		color: #888;
		font-style: italic;
	}

	.kpis {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 0.75rem;
		margin-bottom: 1rem;
	}

	.kpi {
		border: 1px solid #aaa;
		background: #f4f4f4;
		padding: 0.5rem 0.75rem;
	}

	.kpi-label {
		font-size: 11px;
		color: #666;
		text-transform: uppercase;
	}

	.kpi-value {
		font-size: 18px;
		font-weight: bold;
		margin-top: 0.25rem;
	}

	table {
		border-collapse: collapse;
		width: 100%;
	}

	thead {
		background: #ddd;
	}

	th,
	td {
		border: 1px solid #aaa;
		padding: 0.3rem 0.5rem;
		text-align: left;
		vertical-align: top;
	}

	tbody tr:nth-child(even) {
		background: #f4f4f4;
	}

	a {
		color: #00457c;
	}
</style>
