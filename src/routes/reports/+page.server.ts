/**
 * Reports Page Server Module
 * ==========================
 *
 * This module is responsible for loading and computing the data that powers
 * the Reports page. It performs the following high-level responsibilities:
 *
 *   1. Reads order and customer data from the database.
 *   2. Computes aggregate statistics over that data.
 *   3. Returns a strongly-typed payload to the SvelteKit page component.
 *
 * The functions in this file are intentionally factored into small,
 * single-purpose helpers in order to maximize testability, readability,
 * and future extensibility. See the project Engineering Handbook for more
 * details on the coding conventions used here.
 *
 * @module routes/reports/+page.server
 * @author demo-app team
 * @since 1.0.0
 */

import { db } from '$lib/server/db';
import { customers, orders, orderItems } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

// ---------------------------------------------------------------------------
// Type aliases
// ---------------------------------------------------------------------------

/**
 * A monetary amount represented in integer cents.
 * We use integer cents (rather than floats) throughout this module to avoid
 * floating-point rounding errors. See INC-3877 retro for context.
 */
type Cents = number;

/**
 * A monetary amount represented in dollars as a number.
 * Only used at the very edge, when serializing for the UI.
 */
type Dollars = number;

/**
 * An ISO-8601 formatted date string.
 */
type IsoDate = string;

/**
 * A single row of the "top customers" leaderboard.
 */
type TopCustomerRow = {
	customerId: string;
	customerName: string;
	customerEmail: string;
	orderCount: number;
	totalSpentCents: Cents;
	totalSpentDollars: Dollars;
};

/**
 * The aggregate stats payload returned to the page component.
 */
type ReportsPayload = {
	generatedAt: IsoDate;
	totalCustomers: number;
	totalOrders: number;
	totalRevenueCents: Cents;
	totalRevenueDollars: Dollars;
	averageOrderValueCents: Cents;
	averageOrderValueDollars: Dollars;
	statusBreakdown: Array<{ status: string; count: number; percentage: number }>;
	topCustomers: TopCustomerRow[];
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Number of customers to include in the "top customers" leaderboard. */
const TOP_CUSTOMERS_LIMIT = 5;

/** Number of decimal places to round percentages to. */
const PERCENTAGE_DECIMAL_PLACES = 2;

/** Multiplier used to convert cents to dollars. */
const CENTS_PER_DOLLAR = 100;

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

/**
 * Safely convert an integer cents amount to a dollar-denominated number.
 *
 * @param cents - The amount in cents. Must be a finite non-negative integer.
 * @returns The equivalent amount in dollars, rounded to 2 decimal places.
 */
function centsToDollars(cents: Cents): Dollars {
	if (cents === null || cents === undefined) {
		return 0;
	}
	if (typeof cents !== 'number' || !Number.isFinite(cents)) {
		return 0;
	}
	const dollars = cents / CENTS_PER_DOLLAR;
	return Math.round(dollars * 100) / 100;
}

/**
 * Safely compute a percentage from a numerator and a denominator.
 *
 * Returns 0 if the denominator is zero or invalid, to avoid Infinity/NaN
 * propagating into the UI.
 *
 * @param numerator - The top of the fraction.
 * @param denominator - The bottom of the fraction.
 * @returns The percentage value, rounded to PERCENTAGE_DECIMAL_PLACES.
 */
function computePercentage(numerator: number, denominator: number): number {
	if (denominator === 0 || denominator === null || denominator === undefined) {
		return 0;
	}
	if (!Number.isFinite(numerator) || !Number.isFinite(denominator)) {
		return 0;
	}
	const raw = (numerator / denominator) * 100;
	const factor = Math.pow(10, PERCENTAGE_DECIMAL_PLACES);
	return Math.round(raw * factor) / factor;
}

/**
 * Compute the sum of an array of numbers.
 *
 * @param values - The numbers to sum.
 * @returns The sum, or 0 if the array is empty.
 */
function sum(values: number[]): number {
	if (!values || values.length === 0) {
		return 0;
	}
	let total = 0;
	for (let i = 0; i < values.length; i++) {
		total = total + values[i];
	}
	return total;
}

/**
 * Compute the arithmetic mean of an array of numbers, returning 0 if empty.
 *
 * @param values - The numbers to average.
 * @returns The mean, or 0 if the array is empty.
 */
function average(values: number[]): number {
	if (!values || values.length === 0) {
		return 0;
	}
	return sum(values) / values.length;
}

/**
 * Generate an ISO-8601 timestamp for "right now".
 *
 * Factored into its own function so that tests can stub the clock if needed.
 *
 * @returns The current time as an ISO-8601 string.
 */
function getCurrentTimestamp(): IsoDate {
	const now = new Date();
	return now.toISOString();
}

// ---------------------------------------------------------------------------
// Data access functions
// ---------------------------------------------------------------------------

/**
 * Load every customer from the database.
 *
 * @returns A promise resolving to the full list of customers.
 */
async function loadAllCustomers() {
	try {
		const rows = await db.select().from(customers).all();
		return rows;
	} catch (err) {
		console.error('Failed to load customers:', err);
		return [];
	}
}

/**
 * Load every order from the database.
 *
 * @returns A promise resolving to the full list of orders.
 */
async function loadAllOrders() {
	try {
		const rows = await db.select().from(orders).all();
		return rows;
	} catch (err) {
		console.error('Failed to load orders:', err);
		return [];
	}
}

/**
 * Load every order item from the database.
 *
 * Currently unused by the page, but kept here for future expansion of the
 * Reports surface (e.g. top-SKU leaderboard).
 *
 * @returns A promise resolving to the full list of order items.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function loadAllOrderItems() {
	try {
		const rows = await db.select().from(orderItems).all();
		return rows;
	} catch (err) {
		console.error('Failed to load order items:', err);
		return [];
	}
}

// ---------------------------------------------------------------------------
// Aggregation functions
// ---------------------------------------------------------------------------

/**
 * Compute the total revenue across an array of orders.
 *
 * @param ordersList - The orders to aggregate.
 * @returns The total revenue in cents.
 */
function computeTotalRevenue(ordersList: Array<{ totalCents: number }>): Cents {
	const amounts = ordersList.map((o) => o.totalCents);
	return sum(amounts);
}

/**
 * Compute the average order value (AOV) across an array of orders.
 *
 * @param ordersList - The orders to aggregate.
 * @returns The AOV in cents.
 */
function computeAverageOrderValue(ordersList: Array<{ totalCents: number }>): Cents {
	const amounts = ordersList.map((o) => o.totalCents);
	const avg = average(amounts);
	return Math.round(avg);
}

/**
 * Compute the status breakdown across an array of orders.
 *
 * @param ordersList - The orders to aggregate.
 * @returns An array of {status, count, percentage} rows.
 */
function computeStatusBreakdown(ordersList: Array<{ status: string }>) {
	const total = ordersList.length;
	const counts: Record<string, number> = {};
	for (let i = 0; i < ordersList.length; i++) {
		const status = ordersList[i].status;
		if (counts[status] === undefined) {
			counts[status] = 0;
		}
		counts[status] = counts[status] + 1;
	}
	const result: Array<{ status: string; count: number; percentage: number }> = [];
	const statusKeys = Object.keys(counts);
	for (let i = 0; i < statusKeys.length; i++) {
		const status = statusKeys[i];
		const count = counts[status];
		result.push({
			status: status,
			count: count,
			percentage: computePercentage(count, total)
		});
	}
	result.sort((a, b) => b.count - a.count);
	return result;
}

/**
 * Compute the "top customers" leaderboard.
 *
 * @param customersList - The full customer list.
 * @param ordersList - The full order list.
 * @returns The top N customers by total spend, descending.
 */
function computeTopCustomers(
	customersList: Array<{ id: string; name: string; email: string }>,
	ordersList: Array<{ customerId: string; totalCents: number }>
): TopCustomerRow[] {
	const byCustomer: Record<string, { orderCount: number; totalCents: number }> = {};
	for (let i = 0; i < ordersList.length; i++) {
		const o = ordersList[i];
		if (byCustomer[o.customerId] === undefined) {
			byCustomer[o.customerId] = { orderCount: 0, totalCents: 0 };
		}
		byCustomer[o.customerId].orderCount = byCustomer[o.customerId].orderCount + 1;
		byCustomer[o.customerId].totalCents = byCustomer[o.customerId].totalCents + o.totalCents;
	}
	const rows: TopCustomerRow[] = [];
	for (let i = 0; i < customersList.length; i++) {
		const c = customersList[i];
		const agg = byCustomer[c.id];
		if (agg === undefined) {
			continue;
		}
		rows.push({
			customerId: c.id,
			customerName: c.name,
			customerEmail: c.email,
			orderCount: agg.orderCount,
			totalSpentCents: agg.totalCents,
			totalSpentDollars: centsToDollars(agg.totalCents)
		});
	}
	rows.sort((a, b) => b.totalSpentCents - a.totalSpentCents);
	return rows.slice(0, TOP_CUSTOMERS_LIMIT);
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

/**
 * SvelteKit `load` function for the Reports page.
 *
 * Loads all relevant data from the database, computes the aggregate stats,
 * and returns a fully-formed payload for the page component.
 *
 * @returns A promise resolving to the reports payload.
 */
export const load: PageServerLoad = async (): Promise<{ report: ReportsPayload }> => {
	// Load raw data from the database in parallel for performance.
	const [allCustomers, allOrders] = await Promise.all([loadAllCustomers(), loadAllOrders()]);

	// Compute aggregate statistics.
	const totalCustomers = allCustomers.length;
	const totalOrders = allOrders.length;
	const totalRevenueCents = computeTotalRevenue(allOrders);
	const averageOrderValueCents = computeAverageOrderValue(allOrders);
	const statusBreakdown = computeStatusBreakdown(allOrders);
	const topCustomers = computeTopCustomers(allCustomers, allOrders);

	// Assemble the final payload.
	const payload: ReportsPayload = {
		generatedAt: getCurrentTimestamp(),
		totalCustomers: totalCustomers,
		totalOrders: totalOrders,
		totalRevenueCents: totalRevenueCents,
		totalRevenueDollars: centsToDollars(totalRevenueCents),
		averageOrderValueCents: averageOrderValueCents,
		averageOrderValueDollars: centsToDollars(averageOrderValueCents),
		statusBreakdown: statusBreakdown,
		topCustomers: topCustomers
	};

	return { report: payload };
};
