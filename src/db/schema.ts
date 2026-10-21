import { pgEnum, pgTable, serial, text, timestamp, integer, index } from "drizzle-orm/pg-core";
import { STATUSES } from "../lib/status";

export { STATUSES, type Status } from "../lib/status";

export const statusEnum = pgEnum("status", STATUSES);

export const shipments = pgTable("shipments", {
  id: serial("id").primaryKey(),
  trackingCode: text("tracking_code").notNull().unique(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email"),
  productName: text("product_name").notNull(),
  origin: text("origin"),
  destination: text("destination"),
  currentStatus: statusEnum("current_status").notNull().default("ORDER_PLACED"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const statusEvents = pgTable(
  "status_events",
  {
    id: serial("id").primaryKey(),
    shipmentId: integer("shipment_id")
      .notNull()
      .references(() => shipments.id, { onDelete: "cascade" }),
    status: statusEnum("status").notNull(),
    location: text("location"),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("status_events_shipment_idx").on(t.shipmentId)],
);

export type Shipment = typeof shipments.$inferSelect;
export type StatusEvent = typeof statusEvents.$inferSelect;
