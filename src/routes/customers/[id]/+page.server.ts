import { db } from '$lib/server/db';
import { customers } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const customer = await db.query.customers.findFirst({
		where: eq(customers.id, params.id),
		with: {
			orders: true
		}
	});

	if (!customer) {
		error(404, `Customer ${params.id} not found`);
	}

	const orders = [...customer.orders].sort((a, b) => b.placedAt.localeCompare(a.placedAt));

	return { customer, orders };
};
