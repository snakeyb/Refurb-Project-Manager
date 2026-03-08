import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Save, X, FileText, Tag, Building2, StickyNote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { EspoHeader } from "@/components/espo-header";
import { EspoPanel } from "@/components/espo-panel";
import { LineItemTable } from "@/components/line-item-table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { RefurbProject, RefurbLineItem } from "@shared/schema";
import { calculateLineItem, calculateTotals } from "@/lib/calculations";
import { useState, useEffect, useMemo } from "react";
import { getEspoContext } from "@/lib/espo-context";

const STATUSES = ["Draft", "Approved", "In Progress", "Completed", "Cancelled"];
const ENTITY_TYPES = ["Property", "Lead", "Contact", "Account"];

export default function ProjectForm() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const isEdit = !!id;

  const espoCtx = useMemo(() => getEspoContext(), []);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Draft");
  const [currency, setCurrency] = useState("GBP");
  const [associatedEntityType, setAssociatedEntityType] = useState(espoCtx.entityType || "");
  const [associatedEntityId, setAssociatedEntityId] = useState(espoCtx.entityId || "");
  const [associatedEntityName, setAssociatedEntityName] = useState(espoCtx.entityName || "");
  const [notes, setNotes] = useState("");
  const [lineItems, setLineItems] = useState<RefurbLineItem[]>([
    calculateLineItem({ id: crypto.randomUUID(), description: "", quantity: 1, unitCost: 0, vatRate: 20 }),
  ]);

  const { data: project, isLoading } = useQuery<RefurbProject>({
    queryKey: ["/api/refurb-projects", id],
    enabled: isEdit,
  });

  useEffect(() => {
    if (!isEdit && espoCtx.entityName) {
      setName(`${espoCtx.entityName} - Refurbishment`);
    }
  }, [isEdit, espoCtx.entityName]);

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description || "");
      setStatus(project.status);
      setCurrency(project.currency);
      setAssociatedEntityType(project.associatedEntityType || "");
      setAssociatedEntityId(project.associatedEntityId || "");
      setAssociatedEntityName(project.associatedEntityName || "");
      setNotes(project.notes || "");
      const items = Array.isArray(project.lineItems)
        ? project.lineItems as RefurbLineItem[]
        : typeof project.lineItems === "string"
          ? JSON.parse(project.lineItems)
          : [];
      setLineItems(items.length > 0 ? items : [
        calculateLineItem({ id: crypto.randomUUID(), description: "", quantity: 1, unitCost: 0, vatRate: 20 }),
      ]);
    }
  }, [project]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const totals = calculateTotals(lineItems);
      const data = {
        name,
        description: description || null,
        status,
        currency,
        associatedEntityType: associatedEntityType || null,
        associatedEntityId: associatedEntityId || null,
        associatedEntityName: associatedEntityName || null,
        notes: notes || null,
        lineItems,
        subtotal: String(totals.subtotal),
        vatTotal: String(totals.vatTotal),
        grandTotal: String(totals.grandTotal),
      };

      if (isEdit) {
        const res = await apiRequest("PATCH", `/api/refurb-projects/${id}`, data);
        return res.json();
      } else {
        const res = await apiRequest("POST", "/api/refurb-projects", data);
        return res.json();
      }
    },
    onSuccess: (data: RefurbProject) => {
      queryClient.invalidateQueries({ queryKey: ["/api/refurb-projects"] });
      toast({
        title: isEdit ? "Project updated" : "Project created",
        description: `"${name}" has been ${isEdit ? "updated" : "created"} successfully.`,
      });
      navigate(`/projects/${data.id}`);
    },
    onError: () => {
      toast({
        title: "Error",
        description: `Failed to ${isEdit ? "update" : "create"} the project.`,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({ title: "Validation Error", description: "Project name is required.", variant: "destructive" });
      return;
    }
    saveMutation.mutate();
  };

  if (isEdit && isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <EspoHeader breadcrumbs={[{ label: "Refurb Projects", href: "/" }, { label: "Loading..." }]} />
        <div className="p-5 space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="page-project-form">
      <EspoHeader
        breadcrumbs={[
          { label: "Refurb Projects", href: "/" },
          ...(isEdit ? [{ label: project?.name || "", href: `/projects/${id}` }] : []),
          { label: isEdit ? "Edit" : "Create" },
        ]}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => navigate(isEdit ? `/projects/${id}` : "/")} data-testid="button-cancel">
              <X className="h-3.5 w-3.5 mr-1.5" />
              Cancel
            </Button>
            <Button size="sm" onClick={handleSubmit} disabled={saveMutation.isPending} data-testid="button-save">
              <Save className="h-3.5 w-3.5 mr-1.5" />
              {saveMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </>
        }
      />

      <form onSubmit={handleSubmit} className="p-3 sm:p-5 space-y-4 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <EspoPanel title="Project Details" icon={<FileText className="h-3.5 w-3.5 text-muted-foreground" />}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Project Name <span className="text-destructive">*</span>
                  </label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. 14 Victoria Road - Full Refurbishment"
                    className="mt-1"
                    required
                    data-testid="input-project-name"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="mt-1" data-testid="select-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Currency</label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger className="mt-1" data-testid="select-currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GBP">GBP (British Pound)</SelectItem>
                      <SelectItem value="EUR">EUR (Euro)</SelectItem>
                      <SelectItem value="USD">USD (US Dollar)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Description</label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of the refurbishment project..."
                    className="mt-1 resize-none"
                    rows={3}
                    data-testid="input-description"
                  />
                </div>
              </div>
            </EspoPanel>

            <EspoPanel title="Line Items" icon={<Tag className="h-3.5 w-3.5 text-muted-foreground" />}>
              <LineItemTable items={lineItems} onChange={setLineItems} currency={currency} />
            </EspoPanel>
          </div>

          <div className="space-y-4">
            <EspoPanel title="Associated Entity" icon={<Building2 className="h-3.5 w-3.5 text-muted-foreground" />}>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Entity Type</label>
                  <Select value={associatedEntityType} onValueChange={setAssociatedEntityType}>
                    <SelectTrigger className="mt-1" data-testid="select-entity-type">
                      <SelectValue placeholder="Select type..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {ENTITY_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {associatedEntityType && associatedEntityType !== "none" && (
                  <>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {associatedEntityType} Name
                      </label>
                      <Input
                        value={associatedEntityName}
                        onChange={(e) => setAssociatedEntityName(e.target.value)}
                        placeholder={`e.g. 14 Victoria Road, Manchester`}
                        className="mt-1"
                        data-testid="input-entity-name"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        EspoCRM Entity ID
                      </label>
                      <Input
                        value={associatedEntityId}
                        onChange={(e) => setAssociatedEntityId(e.target.value)}
                        placeholder="Optional - EspoCRM record ID"
                        className="mt-1"
                        data-testid="input-entity-id"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        When integrated with your CRM, this links directly to the entity record.
                      </p>
                    </div>
                  </>
                )}
              </div>
            </EspoPanel>

            <EspoPanel title="Notes" icon={<StickyNote className="h-3.5 w-3.5 text-muted-foreground" />}>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes about this project..."
                className="resize-none"
                rows={4}
                data-testid="input-notes"
              />
            </EspoPanel>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t">
          <Button type="button" variant="outline" onClick={() => navigate(isEdit ? `/projects/${id}` : "/")} data-testid="button-cancel-bottom">
            Cancel
          </Button>
          <Button type="submit" disabled={saveMutation.isPending} data-testid="button-save-bottom">
            <Save className="h-3.5 w-3.5 mr-1.5" />
            {saveMutation.isPending ? "Saving..." : isEdit ? "Save Changes" : "Create Project"}
          </Button>
        </div>
      </form>
    </div>
  );
}
