import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, numeric, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const lineItemSchema = z.object({
  id: z.string(),
  description: z.string().min(1, "Description is required"),
  quantity: z.number().min(0, "Quantity must be 0 or more"),
  unitCost: z.number().min(0, "Unit cost must be 0 or more"),
  vatRate: z.number().min(0).max(100, "VAT rate must be between 0 and 100"),
  lineTotal: z.number(),
  vatAmount: z.number(),
  lineTotalIncVat: z.number(),
});

export type RefurbLineItem = z.infer<typeof lineItemSchema>;

export const refurbProjects = pgTable("refurb_projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").notNull().default("Draft"),
  associatedEntityType: text("associated_entity_type"),
  associatedEntityId: text("associated_entity_id"),
  associatedEntityName: text("associated_entity_name"),
  lineItems: jsonb("line_items").notNull().default(sql`'[]'::jsonb`),
  subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull().default("0"),
  vatTotal: numeric("vat_total", { precision: 12, scale: 2 }).notNull().default("0"),
  grandTotal: numeric("grand_total", { precision: 12, scale: 2 }).notNull().default("0"),
  currency: text("currency").notNull().default("GBP"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertRefurbProjectSchema = createInsertSchema(refurbProjects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertRefurbProject = z.infer<typeof insertRefurbProjectSchema>;
export type RefurbProject = typeof refurbProjects.$inferSelect;

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
