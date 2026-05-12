import { db } from '$lib/server/db';
import { customers } from '$lib/server/db/schema';
import { or, like } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const q = url.searchParams.get('q')?.trim() ?? '';

	const rows = q
		? await db
				.select()
				.from(customers)
				.where(or(like(customers.name, `%${q}%`), like(customers.email, `%${q}%`)))
				.all()
		: await db.select().from(customers).all();

	return { q, customers: rows };
};
