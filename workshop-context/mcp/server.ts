/**
 * Toy MCP server for the demo-app workshop.
 *
 * Two tools:
 *   - lookupCustomerOrders(emailOrName) — read-only DB query
 *   - flagOrderForReview(orderId, reason) — appends a JSONL line; NEVER touches the DB
 *
 * Stdio transport. Launch from the demo-app/ directory (or set DATABASE_URL).
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { mkdir, appendFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import * as schema from '../../src/lib/server/db/schema.ts';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dbUrl = process.env.DATABASE_URL ?? `file:${resolve(projectRoot, 'local.db')}`;
const client = createClient({ url: dbUrl });
const db = drizzle(client, { schema });

const FLAGS_PATH = resolve(projectRoot, 'triage/flags.jsonl');

export async function lookupCustomerOrders(emailOrName: string) {
	const needle = emailOrName.toLowerCase();
	const all = await db.query.customers.findMany({
		with: { orders: { with: { items: true, shipments: true } } }
	});
	const customers = all.filter(
		(c) => c.name.toLowerCase().includes(needle) || c.email.toLowerCase().includes(needle)
	);
	return { customers };
}

export async function flagOrderForReview(orderId: string, reason: string) {
	await mkdir(dirname(FLAGS_PATH), { recursive: true });
	const line = JSON.stringify({ flagged_at: new Date().toISOString(), order_id: orderId, reason });
	await appendFile(FLAGS_PATH, line + '\n', 'utf8');
	return `Flagged ${orderId} for review.`;
}

const server = new McpServer({ name: 'demo-triage', version: '0.1.0' });

server.registerTool(
	'lookupCustomerOrders',
	{
		description:
			'Look up customers by substring of name or email (case-insensitive). Returns each match with their orders, line items, and shipments.',
		inputSchema: { emailOrName: z.string().describe('Substring to search (case-insensitive).') }
	},
	async ({ emailOrName }) => {
		const result = await lookupCustomerOrders(emailOrName);
		return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
	}
);

server.registerTool(
	'flagOrderForReview',
	{
		description:
			'Flag an order for human review by appending a JSON line to triage/flags.jsonl. Never modifies the database.',
		inputSchema: {
			orderId: z.string().describe('The order id to flag (e.g. "ord-alice-002").'),
			reason: z.string().describe('Short human-readable reason for the flag.')
		}
	},
	async ({ orderId, reason }) => {
		const msg = await flagOrderForReview(orderId, reason);
		return { content: [{ type: 'text', text: msg }] };
	}
);

if (import.meta.main) {
	const transport = new StdioServerTransport();
	await server.connect(transport);
}
