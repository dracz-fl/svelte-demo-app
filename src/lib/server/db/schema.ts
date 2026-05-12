import { integer, sqliteTable, text, index } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

const uuid = () => crypto.randomUUID();

export const customers = sqliteTable('customers', {
	id: text('id').primaryKey().$defaultFn(uuid),
	email: text('email').notNull().unique(),
	name: text('name').notNull(),
	createdAt: text('created_at').notNull()
});

export const orders = sqliteTable(
	'orders',
	{
		id: text('id').primaryKey().$defaultFn(uuid),
		customerId: text('customer_id')
			.notNull()
			.references(() => customers.id),
		placedAt: text('placed_at').notNull(),
		status: text('status', {
			enum: ['pending', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded']
		}).notNull(),
		shipAddress: text('ship_address').notNull(),
		totalCents: integer('total_cents').notNull(),
		currency: text('currency').notNull().default('USD')
	},
	(t) => [index('orders_customer_idx').on(t.customerId)]
);

export const orderItems = sqliteTable(
	'order_items',
	{
		id: text('id').primaryKey().$defaultFn(uuid),
		orderId: text('order_id')
			.notNull()
			.references(() => orders.id),
		sku: text('sku').notNull(),
		productName: text('product_name').notNull(),
		qty: integer('qty').notNull(),
		unitPriceCents: integer('unit_price_cents').notNull()
	},
	(t) => [index('order_items_order_idx').on(t.orderId)]
);

export const shipments = sqliteTable(
	'shipments',
	{
		id: text('id').primaryKey().$defaultFn(uuid),
		orderId: text('order_id')
			.notNull()
			.references(() => orders.id),
		carrier: text('carrier', { enum: ['ups', 'fedex', 'usps', 'dhl'] }).notNull(),
		tracking: text('tracking').notNull(),
		status: text('status', {
			enum: ['label_created', 'in_transit', 'out_for_delivery', 'delivered', 'returned', 'lost']
		}).notNull(),
		shippedAt: text('shipped_at'),
		deliveredAt: text('delivered_at'),
		shipAddress: text('ship_address').notNull()
	},
	(t) => [index('shipments_order_idx').on(t.orderId)]
);

export const customersRelations = relations(customers, ({ many }) => ({
	orders: many(orders)
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
	customer: one(customers, { fields: [orders.customerId], references: [customers.id] }),
	items: many(orderItems),
	shipments: many(shipments)
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
	order: one(orders, { fields: [orderItems.orderId], references: [orders.id] })
}));

export const shipmentsRelations = relations(shipments, ({ one }) => ({
	order: one(orders, { fields: [shipments.orderId], references: [orders.id] })
}));
