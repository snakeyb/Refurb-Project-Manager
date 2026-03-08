import { z } from "zod";

export const lineItemSchema = z.object({
  id: z.string(),
  description: z.string(),
  quantity: z.number().min(0, "Quantity must be 0 or more"),
  unitCost: z.number().min(0, "Unit cost must be 0 or more"),
  vatRate: z.number().min(0).max(100, "VAT rate must be between 0 and 100"),
  lineTotal: z.number(),
  vatAmount: z.number(),
  lineTotalIncVat: z.number(),
});

export type RefurbLineItem = z.infer<typeof lineItemSchema>;

export const insertRefurbProjectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().nullable().optional(),
  status: z.string().default("Draft"),
  associatedEntityType: z.string().nullable().optional(),
  associatedEntityId: z.string().nullable().optional(),
  associatedEntityName: z.string().nullable().optional(),
  lineItems: z.array(lineItemSchema).default([]),
  subtotal: z.string().default("0"),
  vatTotal: z.string().default("0"),
  grandTotal: z.string().default("0"),
  currency: z.string().default("GBP"),
  notes: z.string().nullable().optional(),
});

export type InsertRefurbProject = z.infer<typeof insertRefurbProjectSchema>;

export interface RefurbProject extends InsertRefurbProject {
  id: string;
  createdAt: string;
  updatedAt: string;
}
