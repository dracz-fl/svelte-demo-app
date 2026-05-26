<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/state';

	let { children } = $props();

	const links = [
		{ href: '/', label: 'Dashboard' },
		{ href: '/customers', label: 'Customers' },
		{ href: '/reports', label: 'Reports' }
	];

	function isActive(href: string) {
		if (href === '/') return page.url.pathname === '/';
		return page.url.pathname.startsWith(href);
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<header class="navbar">
	<div class="inner">
		<span class="brand">demo-app</span>
		<nav>
			{#each links as l (l.href)}
				<a href={l.href} class:active={isActive(l.href)}>{l.label}</a>
			{/each}
		</nav>
	</div>
</header>

{@render children()}

<style>
	.navbar {
		background: #222;
		color: #eee;
		border-bottom: 2px solid #000;
		font-family: Verdana, Geneva, sans-serif;
		font-size: 13px;
	}

	.inner {
		max-width: 900px;
		margin: 0 auto;
		padding: 0.5rem 1rem;
		display: flex;
		align-items: center;
		gap: 1.5rem;
	}

	.brand {
		font-weight: bold;
		letter-spacing: 0.5px;
	}

	nav {
		display: flex;
		gap: 1rem;
	}

	nav a {
		color: #ccc;
		text-decoration: none;
		padding: 0.15rem 0.4rem;
		border: 1px solid transparent;
	}

	nav a:hover {
		color: #fff;
		border-color: #555;
	}

	nav a.active {
		color: #fff;
		background: #444;
		border-color: #666;
	}
</style>
