import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

const dbUrl = process.env.DATABASE_URL ?? 'file:local.db';
const client = createClient({ url: dbUrl });
const db = drizzle(client, { schema });

const ALICE_OLD_ADDRESS = '123 Maple Ave, Springfield IL 62701';
const ALICE_NEW_ADDRESS = '456 Oak St, Boston MA 02108';

async function main() {
	await db.delete(schema.shipments);
	await db.delete(schema.orderItems);
	await db.delete(schema.orders);
	await db.delete(schema.customers);

	await db.insert(schema.customers).values([
		{
			id: 'cust-alice',
			email: 'alice.chen@example.com',
			name: 'Alice Chen',
			createdAt: '2024-08-01T10:00:00Z'
		},
		{
			id: 'cust-bob',
			email: 'bob.patel@example.com',
			name: 'Robert Patel',
			createdAt: '2025-11-12T10:00:00Z'
		},
		{
			id: 'cust-carol',
			email: 'carol.s@example.com',
			name: 'Carol Sullivan',
			createdAt: '2025-06-04T10:00:00Z'
		},
		{
			id: 'cust-david',
			email: 'david.kim@example.com',
			name: 'David Kim',
			createdAt: '2025-09-20T10:00:00Z'
		},
		{
			id: 'cust-emma',
			email: 'emma.rod@example.com',
			name: 'Emma Rodriguez',
			createdAt: '2025-03-15T10:00:00Z'
		},
		{
			id: 'cust-frank',
			email: 'frank.tanaka@example.com',
			name: 'Frank Tanaka',
			createdAt: '2025-12-01T10:00:00Z'
		},
		{
			id: 'cust-grace',
			email: 'grace.liu@example.com',
			name: 'Grace Liu',
			createdAt: '2026-02-19T10:00:00Z'
		},
		{
			id: 'cust-henry',
			email: 'henry.b@example.com',
			name: 'Henry Brown',
			createdAt: '2025-07-22T10:00:00Z'
		}
	]);

	// === Alice's old order — delivered normally to her old address ===
	await db.insert(schema.orders).values({
		id: 'ord-alice-001',
		customerId: 'cust-alice',
		placedAt: '2024-09-12T14:00:00Z',
		status: 'delivered',
		shipAddress: ALICE_OLD_ADDRESS,
		totalCents: 4998,
		currency: 'USD'
	});
	await db.insert(schema.orderItems).values([
		{
			orderId: 'ord-alice-001',
			sku: 'CABLE-USBC-2M',
			productName: 'USB-C Cable 2m',
			qty: 2,
			unitPriceCents: 999
		},
		{
			orderId: 'ord-alice-001',
			sku: 'MOUSE-WL',
			productName: 'Wireless Mouse',
			qty: 2,
			unitPriceCents: 1500
		}
	]);
	await db.insert(schema.shipments).values({
		orderId: 'ord-alice-001',
		carrier: 'ups',
		tracking: '1Z999AA10123456784',
		status: 'delivered',
		shippedAt: '2024-09-13T18:00:00Z',
		deliveredAt: '2024-09-16T14:30:00Z',
		shipAddress: ALICE_OLD_ADDRESS
	});

	// === Alice's recent order — CAPSTONE BUG (INC-4471) ===
	// order.ship_address is her current address, but the shipment carries
	// the stale address from her prior order to 123 Maple.
	await db.insert(schema.orders).values({
		id: 'ord-alice-002',
		customerId: 'cust-alice',
		placedAt: '2026-05-05T11:30:00Z',
		status: 'delivered',
		shipAddress: ALICE_NEW_ADDRESS,
		totalCents: 3499,
		currency: 'USD'
	});
	await db.insert(schema.orderItems).values({
		orderId: 'ord-alice-002',
		sku: 'HUB-7PORT',
		productName: '7-port USB Hub',
		qty: 1,
		unitPriceCents: 3499
	});
	await db.insert(schema.shipments).values({
		orderId: 'ord-alice-002',
		carrier: 'fedex',
		tracking: '746893671203',
		status: 'delivered',
		shippedAt: '2026-05-06T15:00:00Z',
		deliveredAt: '2026-05-08T12:00:00Z',
		shipAddress: ALICE_OLD_ADDRESS // <-- the planted bug
	});

	// === Bob — cancelled but shipped (PART 4 ANOMALY, INC-4400) ===
	await db.insert(schema.orders).values({
		id: 'ord-bob-001',
		customerId: 'cust-bob',
		placedAt: '2026-05-02T09:15:00Z',
		status: 'cancelled',
		shipAddress: '78 River Rd, Austin TX 78701',
		totalCents: 1999,
		currency: 'USD'
	});
	await db.insert(schema.orderItems).values({
		orderId: 'ord-bob-001',
		sku: 'WIDGET-BLU-S',
		productName: 'Widget (Blue, Small)',
		qty: 1,
		unitPriceCents: 1999
	});
	await db.insert(schema.shipments).values({
		orderId: 'ord-bob-001',
		carrier: 'usps',
		tracking: '9400110200881234567890',
		status: 'in_transit',
		shippedAt: '2026-05-04T08:00:00Z',
		deliveredAt: null,
		shipAddress: '78 River Rd, Austin TX 78701'
	});

	// === Carol — two normal delivered orders ===
	await db.insert(schema.orders).values({
		id: 'ord-carol-001',
		customerId: 'cust-carol',
		placedAt: '2025-12-10T13:45:00Z',
		status: 'delivered',
		shipAddress: '910 Pine St, Seattle WA 98101',
		totalCents: 5498,
		currency: 'USD'
	});
	await db.insert(schema.orderItems).values([
		{
			orderId: 'ord-carol-001',
			sku: 'STAND-ALU',
			productName: 'Aluminum Stand',
			qty: 1,
			unitPriceCents: 2999
		},
		{
			orderId: 'ord-carol-001',
			sku: 'CABLE-USBC-2M',
			productName: 'USB-C Cable 2m',
			qty: 2,
			unitPriceCents: 999
		},
		{
			orderId: 'ord-carol-001',
			sku: 'WIDGET-RED-L',
			productName: 'Widget (Red, Large)',
			qty: 1,
			unitPriceCents: 501
		}
	]);
	await db.insert(schema.shipments).values({
		orderId: 'ord-carol-001',
		carrier: 'fedex',
		tracking: '746812345678',
		status: 'delivered',
		shippedAt: '2025-12-11T11:00:00Z',
		deliveredAt: '2025-12-13T10:00:00Z',
		shipAddress: '910 Pine St, Seattle WA 98101'
	});

	await db.insert(schema.orders).values({
		id: 'ord-carol-002',
		customerId: 'cust-carol',
		placedAt: '2026-04-22T16:00:00Z',
		status: 'delivered',
		shipAddress: '910 Pine St, Seattle WA 98101',
		totalCents: 1499,
		currency: 'USD'
	});
	await db.insert(schema.orderItems).values({
		orderId: 'ord-carol-002',
		sku: 'MOUSE-WL',
		productName: 'Wireless Mouse',
		qty: 1,
		unitPriceCents: 1499
	});
	await db.insert(schema.shipments).values({
		orderId: 'ord-carol-002',
		carrier: 'ups',
		tracking: '1Z999BB10123456111',
		status: 'delivered',
		shippedAt: '2026-04-23T09:00:00Z',
		deliveredAt: '2026-04-25T14:00:00Z',
		shipAddress: '910 Pine St, Seattle WA 98101'
	});

	// === David — single delivered order ===
	await db.insert(schema.orders).values({
		id: 'ord-david-001',
		customerId: 'cust-david',
		placedAt: '2026-03-15T08:20:00Z',
		status: 'delivered',
		shipAddress: '22 Birch Ln, Denver CO 80202',
		totalCents: 2499,
		currency: 'USD'
	});
	await db.insert(schema.orderItems).values({
		orderId: 'ord-david-001',
		sku: 'CHARGER-65W',
		productName: '65W Fast Charger',
		qty: 1,
		unitPriceCents: 2499
	});
	await db.insert(schema.shipments).values({
		orderId: 'ord-david-001',
		carrier: 'usps',
		tracking: '9400110200881234555555',
		status: 'delivered',
		shippedAt: '2026-03-16T10:00:00Z',
		deliveredAt: '2026-03-18T15:30:00Z',
		shipAddress: '22 Birch Ln, Denver CO 80202'
	});

	// === Emma — three orders, varied normal states ===
	await db.insert(schema.orders).values({
		id: 'ord-emma-001',
		customerId: 'cust-emma',
		placedAt: '2025-10-01T11:00:00Z',
		status: 'delivered',
		shipAddress: '5 Cedar Way, Miami FL 33101',
		totalCents: 3998,
		currency: 'USD'
	});
	await db.insert(schema.orderItems).values([
		{
			orderId: 'ord-emma-001',
			sku: 'WIDGET-BLU-S',
			productName: 'Widget (Blue, Small)',
			qty: 2,
			unitPriceCents: 1999
		}
	]);
	await db.insert(schema.shipments).values({
		orderId: 'ord-emma-001',
		carrier: 'ups',
		tracking: '1Z999CC10123456999',
		status: 'delivered',
		shippedAt: '2025-10-02T10:00:00Z',
		deliveredAt: '2025-10-04T13:00:00Z',
		shipAddress: '5 Cedar Way, Miami FL 33101'
	});

	await db.insert(schema.orders).values({
		id: 'ord-emma-002',
		customerId: 'cust-emma',
		placedAt: '2026-01-20T15:30:00Z',
		status: 'delivered',
		shipAddress: '5 Cedar Way, Miami FL 33101',
		totalCents: 999,
		currency: 'USD'
	});
	await db.insert(schema.orderItems).values({
		orderId: 'ord-emma-002',
		sku: 'CABLE-USBC-2M',
		productName: 'USB-C Cable 2m',
		qty: 1,
		unitPriceCents: 999
	});
	await db.insert(schema.shipments).values({
		orderId: 'ord-emma-002',
		carrier: 'fedex',
		tracking: '746899988877',
		status: 'delivered',
		shippedAt: '2026-01-21T10:00:00Z',
		deliveredAt: '2026-01-23T12:00:00Z',
		shipAddress: '5 Cedar Way, Miami FL 33101'
	});

	await db.insert(schema.orders).values({
		id: 'ord-emma-003',
		customerId: 'cust-emma',
		placedAt: '2026-05-08T09:00:00Z',
		status: 'shipped',
		shipAddress: '5 Cedar Way, Miami FL 33101',
		totalCents: 3499,
		currency: 'USD'
	});
	await db.insert(schema.orderItems).values({
		orderId: 'ord-emma-003',
		sku: 'HUB-7PORT',
		productName: '7-port USB Hub',
		qty: 1,
		unitPriceCents: 3499
	});
	await db.insert(schema.shipments).values({
		orderId: 'ord-emma-003',
		carrier: 'ups',
		tracking: '1Z999DD10123457000',
		status: 'in_transit',
		shippedAt: '2026-05-09T11:00:00Z',
		deliveredAt: null,
		shipAddress: '5 Cedar Way, Miami FL 33101'
	});

	// === Frank — single in-transit order ===
	await db.insert(schema.orders).values({
		id: 'ord-frank-001',
		customerId: 'cust-frank',
		placedAt: '2026-05-06T17:00:00Z',
		status: 'shipped',
		shipAddress: '14 Elm St, Portland OR 97201',
		totalCents: 4498,
		currency: 'USD'
	});
	await db.insert(schema.orderItems).values([
		{
			orderId: 'ord-frank-001',
			sku: 'STAND-ALU',
			productName: 'Aluminum Stand',
			qty: 1,
			unitPriceCents: 2999
		},
		{
			orderId: 'ord-frank-001',
			sku: 'MOUSE-WL',
			productName: 'Wireless Mouse',
			qty: 1,
			unitPriceCents: 1499
		}
	]);
	await db.insert(schema.shipments).values({
		orderId: 'ord-frank-001',
		carrier: 'fedex',
		tracking: '746811112222',
		status: 'in_transit',
		shippedAt: '2026-05-07T13:00:00Z',
		deliveredAt: null,
		shipAddress: '14 Elm St, Portland OR 97201'
	});

	// === Grace — pending order, no shipment yet ===
	await db.insert(schema.orders).values({
		id: 'ord-grace-001',
		customerId: 'cust-grace',
		placedAt: '2026-05-10T19:45:00Z',
		status: 'pending',
		shipAddress: '901 Spruce Ave, Chicago IL 60601',
		totalCents: 1999,
		currency: 'USD'
	});
	await db.insert(schema.orderItems).values({
		orderId: 'ord-grace-001',
		sku: 'WIDGET-BLU-S',
		productName: 'Widget (Blue, Small)',
		qty: 1,
		unitPriceCents: 1999
	});

	// === Henry — single delivered order ===
	await db.insert(schema.orders).values({
		id: 'ord-henry-001',
		customerId: 'cust-henry',
		placedAt: '2026-04-12T10:30:00Z',
		status: 'delivered',
		shipAddress: '300 Walnut Pl, Nashville TN 37201',
		totalCents: 1998,
		currency: 'USD'
	});
	await db.insert(schema.orderItems).values({
		orderId: 'ord-henry-001',
		sku: 'CABLE-USBC-2M',
		productName: 'USB-C Cable 2m',
		qty: 2,
		unitPriceCents: 999
	});
	await db.insert(schema.shipments).values({
		orderId: 'ord-henry-001',
		carrier: 'usps',
		tracking: '9400110200881234999999',
		status: 'delivered',
		shippedAt: '2026-04-13T10:00:00Z',
		deliveredAt: '2026-04-15T11:00:00Z',
		shipAddress: '300 Walnut Pl, Nashville TN 37201'
	});

	console.log('Seed complete: 8 customers, 12 orders, 11 shipments.');
}

main()
	.then(() => process.exit(0))
	.catch((err) => {
		console.error(err);
		process.exit(1);
	});
