import { db } from '$lib/server/db';
import { orders } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const order = await db.query.orders.findFirst({
		where: eq(orders.id, params.id),
		with: {
			customer: true,
			items: true,
			shipments: true
		}
	});

	if (!order) {
		error(404, `Order ${params.id} not found`);
	}

	// Latest shipment by shippedAt (nulls last), falling back to id for determinism.
	const shipments = [...order.shipments].sort((a, b) => {
		const aT = a.shippedAt ?? '';
		const bT = b.shippedAt ?? '';
		if (aT === bT) return a.id.localeCompare(b.id);
		return bT.localeCompare(aT);
	});
	const latestShipment = shipments[0] ?? null;

	return { order, latestShipment, allShipments: shipments };
};
