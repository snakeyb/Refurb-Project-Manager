import { Plus, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { RefurbLineItem } from "@shared/schema";
import { calculateLineItem, calculateTotals } from "@/lib/calculations";
import { formatCurrency } from "@/lib/format";

interface LineItemTableProps {
  items: RefurbLineItem[];
  onChange: (items: RefurbLineItem[]) => void;
  readOnly?: boolean;
  currency?: string;
}

const VAT_RATES = [
  { value: "0", label: "0% (Exempt)" },
  { value: "5", label: "5% (Reduced)" },
  { value: "20", label: "20% (Standard)" },
];

export function LineItemTable({ items, onChange, readOnly = false, currency = "GBP" }: LineItemTableProps) {
  const totals = calculateTotals(items);

  const addItem = () => {
    const newItem = calculateLineItem({
      id: crypto.randomUUID(),
      description: "",
      quantity: 1,
      unitCost: 0,
      vatRate: 20,
    });
    onChange([...items, newItem]);
  };

  const updateItem = (index: number, field: keyof RefurbLineItem, value: string | number) => {
    const updated = items.map((item, i) => {
      if (i !== index) return item;
      const partial = { ...item, [field]: value };
      return calculateLineItem(partial);
    });
    onChange(updated);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  if (readOnly) {
    return (
      <div data-testid="line-items-readonly">
        <div className="hidden md:block border rounded-md">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-white dark:bg-card">
                <th className="text-left py-2.5 px-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">#</th>
                <th className="text-left py-2.5 px-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Description</th>
                <th className="text-right py-2.5 px-3 font-medium text-muted-foreground text-xs uppercase tracking-wider w-20">Qty</th>
                <th className="text-right py-2.5 px-3 font-medium text-muted-foreground text-xs uppercase tracking-wider w-28">Unit Cost</th>
                <th className="text-right py-2.5 px-3 font-medium text-muted-foreground text-xs uppercase tracking-wider w-20">VAT %</th>
                <th className="text-right py-2.5 px-3 font-medium text-muted-foreground text-xs uppercase tracking-wider w-28">Net</th>
                <th className="text-right py-2.5 px-3 font-medium text-muted-foreground text-xs uppercase tracking-wider w-28">VAT</th>
                <th className="text-right py-2.5 px-3 font-medium text-muted-foreground text-xs uppercase tracking-wider w-28">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id} className="border-b last:border-b-0" data-testid={`row-line-item-${index}`}>
                  <td className="py-2.5 px-3 text-muted-foreground">{index + 1}</td>
                  <td className="py-2.5 px-3">{item.description}</td>
                  <td className="py-2.5 px-3 text-right tabular-nums">{item.quantity}</td>
                  <td className="py-2.5 px-3 text-right tabular-nums">{formatCurrency(item.unitCost, currency)}</td>
                  <td className="py-2.5 px-3 text-right tabular-nums">{item.vatRate}%</td>
                  <td className="py-2.5 px-3 text-right tabular-nums">{formatCurrency(item.lineTotal, currency)}</td>
                  <td className="py-2.5 px-3 text-right tabular-nums">{formatCurrency(item.vatAmount, currency)}</td>
                  <td className="py-2.5 px-3 text-right tabular-nums font-medium">{formatCurrency(item.lineTotalIncVat, currency)}</td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-muted-foreground">
                    No line items
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="md:hidden space-y-3">
          {items.map((item, index) => (
            <div key={item.id} className="border rounded-md bg-white dark:bg-card p-3" data-testid={`card-line-item-${index}`}>
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs text-muted-foreground font-medium">#{index + 1}</span>
                <span className="text-sm font-semibold tabular-nums">{formatCurrency(item.lineTotalIncVat, currency)}</span>
              </div>
              <p className="text-sm font-medium mb-2">{item.description || "—"}</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Qty:</span>
                  <span className="tabular-nums">{item.quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span>Unit Cost:</span>
                  <span className="tabular-nums">{formatCurrency(item.unitCost, currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Net:</span>
                  <span className="tabular-nums">{formatCurrency(item.lineTotal, currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span>VAT ({item.vatRate}%):</span>
                  <span className="tabular-nums">{formatCurrency(item.vatAmount, currency)}</span>
                </div>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="border rounded-md p-6 text-center text-muted-foreground text-sm">
              No line items
            </div>
          )}
        </div>

        <TotalsSummary subtotal={totals.subtotal} vatTotal={totals.vatTotal} grandTotal={totals.grandTotal} currency={currency} />
      </div>
    );
  }

  return (
    <div data-testid="line-items-editable">
      <div className="hidden md:block border rounded-md">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-white dark:bg-card">
              <th className="w-8"></th>
              <th className="text-left py-2.5 px-2 font-medium text-muted-foreground text-xs uppercase tracking-wider">Description</th>
              <th className="text-right py-2.5 px-2 font-medium text-muted-foreground text-xs uppercase tracking-wider w-20">Qty</th>
              <th className="text-right py-2.5 px-2 font-medium text-muted-foreground text-xs uppercase tracking-wider w-28">Unit Cost</th>
              <th className="text-center py-2.5 px-2 font-medium text-muted-foreground text-xs uppercase tracking-wider w-32">VAT Rate</th>
              <th className="text-right py-2.5 px-2 font-medium text-muted-foreground text-xs uppercase tracking-wider w-24">Net</th>
              <th className="text-right py-2.5 px-2 font-medium text-muted-foreground text-xs uppercase tracking-wider w-24">VAT</th>
              <th className="text-right py-2.5 px-2 font-medium text-muted-foreground text-xs uppercase tracking-wider w-28">Total</th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item.id} className="border-b last:border-b-0 group" data-testid={`row-line-item-edit-${index}`}>
                <td className="py-1.5 px-1 text-center">
                  <GripVertical className="h-3.5 w-3.5 text-muted-foreground/40 mx-auto" />
                </td>
                <td className="py-1.5 px-1">
                  <Input
                    value={item.description}
                    onChange={(e) => updateItem(index, "description", e.target.value)}
                    placeholder="Enter description..."
                    className="h-8 text-sm border-0 bg-transparent focus-visible:ring-1 focus-visible:ring-primary"
                    data-testid={`input-description-${index}`}
                  />
                </td>
                <td className="py-1.5 px-1">
                  <Input
                    type="number"
                    value={item.quantity || ""}
                    onChange={(e) => updateItem(index, "quantity", parseFloat(e.target.value) || 0)}
                    className="h-8 text-sm text-right border-0 bg-transparent focus-visible:ring-1 focus-visible:ring-primary tabular-nums"
                    min="0"
                    step="1"
                    data-testid={`input-quantity-${index}`}
                  />
                </td>
                <td className="py-1.5 px-1">
                  <Input
                    type="number"
                    value={item.unitCost || ""}
                    onChange={(e) => updateItem(index, "unitCost", parseFloat(e.target.value) || 0)}
                    className="h-8 text-sm text-right border-0 bg-transparent focus-visible:ring-1 focus-visible:ring-primary tabular-nums"
                    min="0"
                    step="0.01"
                    data-testid={`input-unit-cost-${index}`}
                  />
                </td>
                <td className="py-1.5 px-1">
                  <Select
                    value={String(item.vatRate)}
                    onValueChange={(v) => updateItem(index, "vatRate", parseFloat(v))}
                  >
                    <SelectTrigger className="h-8 text-sm border-0 bg-transparent" data-testid={`select-vat-rate-${index}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {VAT_RATES.map((rate) => (
                        <SelectItem key={rate.value} value={rate.value}>{rate.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="py-1.5 px-2 text-right tabular-nums text-muted-foreground">
                  {formatCurrency(item.lineTotal, currency)}
                </td>
                <td className="py-1.5 px-2 text-right tabular-nums text-muted-foreground">
                  {formatCurrency(item.vatAmount, currency)}
                </td>
                <td className="py-1.5 px-2 text-right tabular-nums font-medium">
                  {formatCurrency(item.lineTotalIncVat, currency)}
                </td>
                <td className="py-1.5 px-1 text-center">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => removeItem(index)}
                    className="h-7 w-7 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                    data-testid={`button-remove-item-${index}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-3">
        {items.map((item, index) => (
          <div key={item.id} className="border rounded-md bg-white dark:bg-card p-3" data-testid={`card-line-item-edit-${index}`}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-muted-foreground font-medium">Item #{index + 1}</span>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => removeItem(index)}
                className="h-7 w-7 text-muted-foreground"
                data-testid={`button-remove-item-mobile-${index}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
            <div className="space-y-2">
              <div>
                <label className="text-xs text-muted-foreground">Description</label>
                <Input
                  value={item.description}
                  onChange={(e) => updateItem(index, "description", e.target.value)}
                  placeholder="Enter description..."
                  className="mt-0.5 h-9"
                  data-testid={`input-description-mobile-${index}`}
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground">Qty</label>
                  <Input
                    type="number"
                    value={item.quantity || ""}
                    onChange={(e) => updateItem(index, "quantity", parseFloat(e.target.value) || 0)}
                    className="mt-0.5 h-9 tabular-nums"
                    min="0"
                    step="1"
                    data-testid={`input-quantity-mobile-${index}`}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Unit Cost</label>
                  <Input
                    type="number"
                    value={item.unitCost || ""}
                    onChange={(e) => updateItem(index, "unitCost", parseFloat(e.target.value) || 0)}
                    className="mt-0.5 h-9 tabular-nums"
                    min="0"
                    step="0.01"
                    data-testid={`input-unit-cost-mobile-${index}`}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">VAT Rate</label>
                  <Select
                    value={String(item.vatRate)}
                    onValueChange={(v) => updateItem(index, "vatRate", parseFloat(v))}
                  >
                    <SelectTrigger className="mt-0.5 h-9 text-sm" data-testid={`select-vat-rate-mobile-${index}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {VAT_RATES.map((rate) => (
                        <SelectItem key={rate.value} value={rate.value}>{rate.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-between items-center pt-1 border-t text-xs">
                <div className="flex gap-3 text-muted-foreground">
                  <span>Net: <span className="tabular-nums">{formatCurrency(item.lineTotal, currency)}</span></span>
                  <span>VAT: <span className="tabular-nums">{formatCurrency(item.vatAmount, currency)}</span></span>
                </div>
                <span className="font-semibold tabular-nums text-sm">{formatCurrency(item.lineTotalIncVat, currency)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-start justify-between gap-4">
        <Button variant="outline" size="sm" onClick={addItem} data-testid="button-add-line-item">
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          Add Line Item
        </Button>
        <TotalsSummary subtotal={totals.subtotal} vatTotal={totals.vatTotal} grandTotal={totals.grandTotal} currency={currency} />
      </div>
    </div>
  );
}

function TotalsSummary({ subtotal, vatTotal, grandTotal, currency }: { subtotal: number; vatTotal: number; grandTotal: number; currency: string }) {
  return (
    <div className="w-full sm:w-64 sm:ml-auto mt-3" data-testid="totals-summary">
      <div className="border rounded-md bg-white dark:bg-card p-3 space-y-1.5">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal (Net)</span>
          <span className="tabular-nums" data-testid="text-subtotal">{formatCurrency(subtotal, currency)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">VAT</span>
          <span className="tabular-nums" data-testid="text-vat-total">{formatCurrency(vatTotal, currency)}</span>
        </div>
        <div className="border-t pt-1.5 flex justify-between text-sm font-semibold">
          <span>Grand Total</span>
          <span className="tabular-nums text-primary" data-testid="text-grand-total">{formatCurrency(grandTotal, currency)}</span>
        </div>
      </div>
    </div>
  );
}
