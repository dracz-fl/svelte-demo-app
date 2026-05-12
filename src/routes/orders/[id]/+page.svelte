<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const order = $derived(data.order);
	const latest = $derived(data.latestShipment);

	function formatMoney(cents: number, currency: string) {
		return `${(cents / 100).toFixed(2)} ${currency}`;
	}

	const itemsTotalCents = $derived(
		order.items.reduce((sum, i) => sum + i.qty * i.unitPriceCents, 0)
	);
</script>

<svelte:head>
	<title>Order {order.id}</title>
</svelte:head>

<main>
	<nav class="crumbs">
		<a href="/">Dashboard</a> &raquo;
		<a href="/customers">Customers</a> &raquo;
		<a href="/customers/{order.customer.id}">{order.customer.name}</a> &raquo;
		<span class="mono">{order.id}</span>
	</nav>

	<h1>Order <span class="mono">{order.id}</span></h1>

	<section class="card">
		<dl>
			<dt>Order ID</dt>
			<dd class="mono">{order.id}</dd>
			<dt>Placed</dt>
			<dd>{order.placedAt}</dd>
			<dt>Status</dt>
			<dd><span class="status status-{order.status}">{order.status}</span></dd>
			<dt>Customer</dt>
			<dd><a href="/customers/{order.customer.id}">{order.customer.name}</a></dd>
			<dt>Total</dt>
			<dd>{formatMoney(order.totalCents, order.currency)}</dd>
		</dl>
	</section>

	<h2>Shipping</h2>

	<section class="addresses">
		<div class="addr addr-order">
			<div class="addr-label">Order ship-to address</div>
			<pre>{order.shipAddress}</pre>
		</div>
		<div class="addr addr-shipment">
			<div class="addr-label">Carrier shipped to</div>
			{#if latest}
				<pre>{latest.shipAddress}</pre>
			{:else}
				<pre class="placeholder">(no shipment)</pre>
			{/if}
		</div>
	</section>

	{#if latest}
		<section class="card">
			<dl>
				<dt>Carrier</dt>
				<dd>{latest.carrier.toUpperCase()}</dd>
				<dt>Tracking</dt>
				<dd class="mono">{latest.tracking}</dd>
				<dt>Status</dt>
				<dd><span class="status status-ship-{latest.status}">{latest.status}</span></dd>
				<dt>Shipped</dt>
				<dd>{latest.shippedAt ?? '—'}</dd>
				<dt>Delivered</dt>
				<dd>{latest.deliveredAt ?? '—'}</dd>
			</dl>
			{#if data.allShipments.length > 1}
				<p class="hint">Showing latest of {data.allShipments.length} shipments.</p>
			{/if}
		</section>
	{:else}
		<p class="empty">No shipment yet.</p>
	{/if}

	<h2>Line items</h2>

	{#if order.items.length === 0}
		<p class="empty">No line items on this order.</p>
	{:else}
		<table>
			<thead>
				<tr>
					<th>SKU</th>
					<th>Product</th>
					<th class="num">Qty</th>
					<th class="num">Unit price</th>
					<th class="num">Line total</th>
				</tr>
			</thead>
			<tbody>
				{#each order.items as it (it.id)}
					<tr>
						<td class="mono">{it.sku}</td>
						<td>{it.productName}</td>
						<td class="num">{it.qty}</td>
						<td class="num">{formatMoney(it.unitPriceCents, order.currency)}</td>
						<td class="num">{formatMoney(it.qty * it.unitPriceCents, order.currency)}</td>
					</tr>
				{/each}
			</tbody>
			<tfoot>
				<tr>
					<td colspan="4" class="num"><strong>Items subtotal</strong></td>
					<td class="num">{formatMoney(itemsTotalCents, order.currency)}</td>
				</tr>
			</tfoot>
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

	.addresses {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.75rem;
	}

	.addr {
		border: 2px solid;
		padding: 0.5rem 0.75rem;
	}

	.addr-label {
		font-weight: bold;
		font-size: 12px;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		margin-bottom: 0.25rem;
	}

	.addr-order {
		background: #e8f0ff;
		border-color: #4a6da7;
	}

	.addr-order .addr-label {
		color: #2a4d7a;
	}

	.addr-shipment {
		background: #fff5e0;
		border-color: #b08030;
	}

	.addr-shipment .addr-label {
		color: #6b4a00;
	}

	pre {
		margin: 0;
		font-family: 'Courier New', monospace;
		font-size: 12px;
		white-space: pre-wrap;
		color: #222;
	}

	.placeholder {
		color: #777;
		font-style: italic;
	}

	table {
		border-collapse: collapse;
		width: 100%;
	}

	thead,
	tfoot {
		background: #ddd;
	}

	th,
	td {
		border: 1px solid #aaa;
		padding: 0.3rem 0.5rem;
		text-align: left;
		vertical-align: top;
	}

	.num {
		text-align: right;
		font-variant-numeric: tabular-nums;
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

	.status-delivered,
	.status-ship-delivered {
		background: #d6f5d6;
		border-color: #2a7a2a;
	}

	.status-shipped,
	.status-paid,
	.status-ship-in_transit,
	.status-ship-out_for_delivery,
	.status-ship-label_created {
		background: #d6e8f5;
		border-color: #2a5a7a;
	}

	.status-pending {
		background: #fff4cc;
		border-color: #aa7a00;
	}

	.status-cancelled,
	.status-refunded,
	.status-ship-returned,
	.status-ship-lost {
		background: #f5d6d6;
		border-color: #7a2a2a;
	}

	.empty {
		color: #666;
		font-style: italic;
	}

	.hint {
		color: #555;
		font-size: 12px;
		margin: 0.25rem 0 0;
	}

	a {
		color: #00457c;
	}
</style>
