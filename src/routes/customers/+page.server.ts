import { db } from '$lib/server/db';
import { customers } from '$lib/server/db/schema';
import { asc } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const rows = await db.select().from(customers).orderBy(asc(customers.name)).all();
	return { customers: rows };
};
