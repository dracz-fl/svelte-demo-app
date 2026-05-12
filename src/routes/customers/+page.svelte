<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Customers</title>
</svelte:head>

<main>
	<nav class="crumbs">
		<a href="/">Dashboard</a> &raquo; <span>Customers</span>
	</nav>

	<h1>All customers</h1>

	<p class="hint">Full customer list ({data.customers.length}).</p>

	<table>
		<thead>
			<tr>
				<th>ID</th>
				<th>Name</th>
				<th>Email</th>
				<th>Created</th>
				<th></th>
			</tr>
		</thead>
		<tbody>
			{#each data.customers as c (c.id)}
				<tr>
					<td class="mono">{c.id}</td>
					<td>{c.name}</td>
					<td>{c.email}</td>
					<td>{c.createdAt}</td>
					<td><a href="/customers/{c.id}">open</a></td>
				</tr>
			{/each}
		</tbody>
	</table>
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

	.hint {
		color: #666;
		margin: 0 0 0.75rem;
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

	a {
		color: #00457c;
	}
</style>
