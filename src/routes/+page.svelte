<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Support Dashboard</title>
</svelte:head>

<main>
	<h1>Support Dashboard</h1>

	<div class="banner">
		Internal support tooling for the workshop. Open a customer to triage their orders.
	</div>

	<nav class="topnav">
		<a href="/">Dashboard</a>
		<a href="/customers">All customers</a>
	</nav>

	<form method="get" class="search">
		<label for="q">Search customers (name or email)</label>
		<input id="q" name="q" type="text" value={data.q} placeholder="e.g. alice or @example.com" />
		<button type="submit">Search</button>
		{#if data.q}
			<a href="/" class="clear">clear</a>
		{/if}
	</form>

	<section>
		<h2>
			{data.q ? `Results for "${data.q}"` : 'All customers'}
			<span class="count">({data.customers.length})</span>
		</h2>

		{#if data.customers.length === 0}
			<p class="empty">No customers match that search.</p>
		{:else}
			<table>
				<thead>
					<tr>
						<th>ID</th>
						<th>Name</th>
						<th>Email</th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					{#each data.customers as c (c.id)}
						<tr>
							<td class="mono">{c.id}</td>
							<td>{c.name}</td>
							<td>{c.email}</td>
							<td><a href="/customers/{c.id}">open</a></td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</section>
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

	.banner {
		background: #ffffd0;
		border: 1px solid #c8c800;
		padding: 0.5rem 0.75rem;
		margin-bottom: 1rem;
	}

	.topnav {
		margin-bottom: 1rem;
	}

	.topnav a {
		margin-right: 1rem;
	}

	.search {
		background: #eee;
		border: 1px solid #aaa;
		padding: 0.5rem 0.75rem;
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		align-items: center;
	}

	.search label {
		font-weight: bold;
	}

	.search input {
		flex: 1;
		min-width: 200px;
		padding: 0.25rem 0.4rem;
		border: 1px solid #888;
		font-family: inherit;
		font-size: inherit;
	}

	.search button {
		padding: 0.25rem 0.75rem;
		border: 1px solid #666;
		background: #ddd;
		cursor: pointer;
		font-family: inherit;
		font-size: inherit;
	}

	.clear {
		font-size: 12px;
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

	.empty {
		color: #666;
		font-style: italic;
	}

	a {
		color: #00457c;
	}
</style>
