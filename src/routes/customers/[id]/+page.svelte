<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	function formatMoney(cents: number, currency: string) {
		const v = (cents / 100).toFixed(2);
		return `${v} ${currency}`;
	}
</script>

<svelte:head>
	<title>{data.customer.name} &mdash; Customer</title>
</svelte:head>

<main>
	<nav class="crumbs">
		<a href="/">Dashboard</a> &raquo;
		<a href="/customers">Customers</a> &raquo;
		<span>{data.customer.name}</span>
	</nav>

	<h1>{data.customer.name}</h1>

	<section class="card">
		<dl>
			<dt>ID</dt>
			<dd class="mono">{data.customer.id}</dd>
			<dt>Email</dt>
			<dd>{data.customer.email}</dd>
			<dt>Created</dt>
			<dd>{data.customer.createdAt}</dd>
		</dl>
	</section>

	<h2>Orders <span class="count">({data.orders.length})</span></h2>

	{#if data.orders.length === 0}
		<p class="empty">This customer has no orders.</p>
	{:else}
		<table>
			<thead>
				<tr>
					<th>Order ID</th>
					<th>Placed</th>
					<th>Status</th>
					<th>Total</th>
					<th></th>
				</tr>
			</thead>
			<tbody>
				{#each data.orders as o (o.id)}
					<tr>
						<td class="mono">{o.id}</td>
						<td>{o.placedAt}</td>
						<td><span class="status status-{o.status}">{o.status}</span></td>
						<td>{formatMoney(o.totalCents, o.currency)}</td>
						<td><a href="/orders/{o.id}">open</a></td>
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
		margin-bottom: 0.75rem;
	}

	h2 {
		font-size: 14px;
		margin-top: 1.5rem;
		margin-bottom: 0.5rem;
	}

	.count {
		color: #666;
		font-weight: normal;
	}

	.card {
		background: #f4f4f4;
		border: 1px solid #aaa;
		padding: 0.5rem 0.75rem;
	}

	dl {
		margin: 0;
		display: grid;
		grid-template-columns: max-content 1fr;
		gap: 0.25rem 0.75rem;
	}

	dt {
		font-weight: bold;
		color: #555;
	}

	dd {
		margin: 0;
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

	.mono {
		font-family: 'Courier New', monospace;
		font-size: 12px;
	}

	.status {
		display: inline-block;
		padding: 1px 6px;
		border: 1px solid #888;
		background: #fff;
		font-size: 11px;
		text-transform: uppercase;
	}

	.status-delivered {
		background: #d6f5d6;
		border-color: #2a7a2a;
	}

	.status-shipped,
	.status-paid {
		background: #d6e8f5;
		border-color: #2a5a7a;
	}

	.status-pending {
		background: #fff4cc;
		border-color: #aa7a00;
	}

	.status-cancelled,
	.status-refunded {
		background: #f5d6d6;
		border-color: #7a2a2a;
	}

	.empty {
		color: #666;
		font-style: italic;
	}

	a {
		color: #00457c;
	}
</style>
