import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation, useSearch } from "wouter";
import { Save, X, FileText, Tag, Building2, StickyNote, LayoutTemplate, Hammer, Search, Loader2, Check, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EspoHeader } from "@/components/espo-header";
import { EspoPanel } from "@/components/espo-panel";
import { LineItemTable } from "@/components/line-item-table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { RefurbProject, RefurbLineItem } from "@shared/schema";
import { calculateLineItem, calculateTotals } from "@/lib/calculations";
import { useState, useEffect, useMemo, useRef } from "react";
import { getEspoContext } from "@/lib/espo-context";

const STATUSES = ["Draft", "Approved", "In Progress", "Completed", "Cancelled"];

interface EntityResult {
  id: string;
  name: string;
  type: "Lead" | "Opportunity";
}

type RecordTab = "Lead" | "Opportunity";

export default function ProjectForm() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const searchStr = useSearch();
  const { toast } = useToast();
  const isEdit = !!id;

  const isTemplateDefault = !isEdit && new URLSearchParams(searchStr).get("template") === "1";

  const espoCtx = useMemo(() => getEspoContext(), []);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Draft");
  const [currency, setCurrency] = useState("GBP");
  const [isTemplate, setIsTemplate] = useState(isTemplateDefault);

  const [associatedEntityType, setAssociatedEntityType] = useState<string>(
    (espoCtx.entityType === "Lead" || espoCtx.entityType === "Opportunity") ? espoCtx.entityType : ""
  );
  const [associatedEntityId, setAssociatedEntityId] = useState(espoCtx.entityId || "");
  const [associatedEntityName, setAssociatedEntityName] = useState(espoCtx.entityName || "");

  const [recordTab, setRecordTab] = useState<RecordTab>(
    espoCtx.entityType === "Opportunity" ? "Opportunity" : "Lead"
  );
  const [recordSearch, setRecordSearch] = useState("");
  const [recordDebouncedSearch, setRecordDebouncedSearch] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      setIsTemplate(project.isTemplate ?? false);
      const entType = project.associatedEntityType || "";
      setAssociatedEntityType(entType);
      setAssociatedEntityId(project.associatedEntityId || "");
      setAssociatedEntityName(project.associatedEntityName || "");
      if (entType === "Opportunity") setRecordTab("Opportunity");
      else if (entType === "Lead") setRecordTab("Lead");
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

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setRecordDebouncedSearch(recordSearch), 600);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [recordSearch]);

  const { data: recordResults, isFetching: recordFetching, isError: recordError } = useQuery<EntityResult[]>({
    queryKey: ["/api/search-entities", recordTab, recordDebouncedSearch],
    queryFn: async () => {
      const params = new URLSearchParams({ type: recordTab, q: recordDebouncedSearch });
      const res = await apiRequest("GET", `/api/search-entities?${params}`);
      return res.json();
    },
    enabled: !isTemplate && recordDebouncedSearch.length > 0,
    staleTime: 60_000,
    retry: false,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const totals = calculateTotals(lineItems);
      const data = {
        name,
        description: description || null,
        status,
        currency,
        isTemplate,
        associatedEntityType: isTemplate ? null : (associatedEntityType || null),
        associatedEntityId: isTemplate ? null : (associatedEntityId || null),
        associatedEntityName: isTemplate ? null : (associatedEntityName || null),
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
        title: isEdit ? (isTemplate ? "Template updated" : "Project updated") : (isTemplate ? "Template created" : "Project created"),
        description: `"${name}" has been ${isEdit ? "updated" : "created"} successfully.`,
      });
      navigate(`/projects/${data.id}`);
    },
    onError: () => {
      toast({
        title: "Error",
        description: `Failed to ${isEdit ? "update" : "create"} the ${isTemplate ? "template" : "project"}.`,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({ title: "Validation Error", description: "Name is required.", variant: "destructive" });
      return;
    }
    saveMutation.mutate();
  };

  const handleTabChange = (tab: RecordTab) => {
    setRecordTab(tab);
    if (associatedEntityType !== tab) {
      setAssociatedEntityType("");
      setAssociatedEntityId("");
      setAssociatedEntityName("");
    }
    setRecordSearch("");
    setRecordDebouncedSearch("");
  };

  const handleSelectRecord = (r: EntityResult) => {
    if (associatedEntityId === r.id) {
      setAssociatedEntityType("");
      setAssociatedEntityId("");
      setAssociatedEntityName("");
    } else {
      setAssociatedEntityType(r.type);
      setAssociatedEntityId(r.id);
      setAssociatedEntityName(r.name);
    }
  };

  const clearRecord = () => {
    setAssociatedEntityType("");
    setAssociatedEntityId("");
    setAssociatedEntityName("");
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

  const recordTabLabel = recordTab === "Opportunity" ? "Property" : "Lead";
  const recordTabLabelPlural = recordTab === "Opportunity" ? "Properties" : "Leads";

  return (
    <div className="min-h-screen bg-background" data-testid="page-project-form">
      <EspoHeader
        breadcrumbs={[
          { label: "Refurb Projects", href: "/" },
          ...(isEdit ? [{ label: project?.name || "", href: `/projects/${id}` }] : []),
          { label: isEdit ? "Edit" : (isTemplate ? "Create Template" : "Create") },
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

      <form onSubmit={handleSubmit} className="p-3 sm:p-5 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <EspoPanel title={isTemplate ? "Template Details" : "Project Details"} icon={<FileText className="h-3.5 w-3.5 text-muted-foreground" />}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-muted-foreground">Type</label>
                  <div className="flex mt-1 rounded-md border border-input overflow-hidden w-fit">
                    <button
                      type="button"
                      onClick={() => setIsTemplate(false)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors ${
                        !isTemplate ? "bg-primary text-primary-foreground" : "bg-white text-muted-foreground hover:bg-muted/50"
                      }`}
                      data-testid="button-type-project"
                    >
                      <Hammer className="h-3.5 w-3.5" />
                      Project
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsTemplate(true)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors border-l border-input ${
                        isTemplate ? "bg-primary text-primary-foreground" : "bg-white text-muted-foreground hover:bg-muted/50"
                      }`}
                      data-testid="button-type-template"
                    >
                      <LayoutTemplate className="h-3.5 w-3.5" />
                      Template
                    </button>
                  </div>
                  {isTemplate && (
                    <p className="text-xs text-muted-foreground mt-1.5">
                      Templates can be duplicated to create projects. They cannot be associated with a Lead or Property.
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-muted-foreground">
                    {isTemplate ? "Template Name" : "Project Name"} <span className="text-destructive">*</span>
                  </label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={isTemplate ? "e.g. Full Bathroom Refurbishment" : "e.g. 14 Victoria Road - Full Refurbishment"}
                    className="mt-1"
                    required
                    data-testid="input-project-name"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Status</label>
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
                  <label className="text-xs font-medium text-muted-foreground">Currency</label>
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
                  <label className="text-xs font-medium text-muted-foreground">Description</label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={isTemplate ? "Brief description of what this template covers..." : "Brief description of the refurbishment project..."}
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
            {!isTemplate && (
              <EspoPanel title="Associated Record" icon={<Building2 className="h-3.5 w-3.5 text-muted-foreground" />}>
                <div className="space-y-2">
                  <Tabs value={recordTab} onValueChange={(v) => handleTabChange(v as RecordTab)}>
                    <TabsList className="w-full">
                      <TabsTrigger value="Lead" className="flex-1" data-testid="tab-record-lead">Lead</TabsTrigger>
                      <TabsTrigger value="Opportunity" className="flex-1" data-testid="tab-record-property">Property</TabsTrigger>
                    </TabsList>
                  </Tabs>

                  {associatedEntityId && associatedEntityName && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-primary/5 border border-primary/20 rounded-md">
                      <Check className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                      <span className="text-sm text-primary flex-1 truncate font-medium" data-testid="text-selected-record">
                        {associatedEntityName}
                      </span>
                      <button
                        type="button"
                        onClick={clearRecord}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        data-testid="button-clear-record"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}

                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      value={recordSearch}
                      onChange={(e) => setRecordSearch(e.target.value)}
                      placeholder={`Search ${recordTabLabelPlural}...`}
                      className="pl-8 h-9"
                      data-testid="input-record-search"
                    />
                    {recordFetching && (
                      <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 animate-spin text-muted-foreground" />
                    )}
                  </div>

                  <div className="border rounded-md max-h-56 overflow-y-auto bg-card" data-testid="record-results">
                    {recordError && (
                      <div className="px-3 py-2 text-xs text-destructive">
                        Could not load {recordTabLabelPlural} — check your CRM connection.
                      </div>
                    )}
                    {!recordError && recordResults && recordResults.length === 0 && (
                      <div className="px-3 py-2 text-xs text-muted-foreground">
                        No {recordTabLabelPlural.toLowerCase()} matched your search.
                      </div>
                    )}
                    {!recordError && !recordResults && !recordFetching && (
                      <div className="px-3 py-2 text-xs text-muted-foreground italic">
                        Start typing to search {recordTabLabelPlural.toLowerCase()}...
                      </div>
                    )}
                    {recordResults?.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => handleSelectRecord(r)}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-muted/50 transition-colors border-b last:border-b-0 ${
                          associatedEntityId === r.id ? "bg-primary/5" : ""
                        }`}
                        data-testid={`record-result-${r.id}`}
                      >
                        {recordTab === "Opportunity" ? (
                          <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                        ) : (
                          <Building2 className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                        )}
                        <span className="flex-1 truncate">{r.name}</span>
                        {associatedEntityId === r.id && (
                          <Check className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {associatedEntityId
                      ? `Linked to ${recordTabLabel}: ${associatedEntityName}`
                      : `Select a ${recordTabLabel} to associate with this project.`}
                  </p>
                </div>
              </EspoPanel>
            )}

            <EspoPanel title="Notes" icon={<StickyNote className="h-3.5 w-3.5 text-muted-foreground" />}>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={isTemplate ? "Additional notes about this template..." : "Additional notes about this project..."}
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
            {saveMutation.isPending
              ? "Saving..."
              : isEdit
                ? "Save Changes"
                : isTemplate ? "Create Template" : "Create Project"}
          </Button>
        </div>
      </form>
    </div>
  );
}
