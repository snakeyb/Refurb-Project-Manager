import type { RefurbLineItem } from "@shared/schema";

export function calculateLineItem(item: Partial<RefurbLineItem>): RefurbLineItem {
  const quantity = item.quantity || 0;
  const unitCost = item.unitCost || 0;
  const vatRate = item.vatRate ?? 20;
  const lineTotal = quantity * unitCost;
  const vatAmount = lineTotal * (vatRate / 100);
  const lineTotalIncVat = lineTotal + vatAmount;

  return {
    id: item.id || crypto.randomUUID(),
    description: item.description || "",
    quantity,
    unitCost,
    vatRate,
    lineTotal: Math.round(lineTotal * 100) / 100,
    vatAmount: Math.round(vatAmount * 100) / 100,
    lineTotalIncVat: Math.round(lineTotalIncVat * 100) / 100,
  };
}

export function calculateTotals(items: RefurbLineItem[]): {
  subtotal: number;
  vatTotal: number;
  grandTotal: number;
} {
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const vatTotal = items.reduce((sum, item) => sum + item.vatAmount, 0);
  const grandTotal = subtotal + vatTotal;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    vatTotal: Math.round(vatTotal * 100) / 100,
    grandTotal: Math.round(grandTotal * 100) / 100,
  };
}
