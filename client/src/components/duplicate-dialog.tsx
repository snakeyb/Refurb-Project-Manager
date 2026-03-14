import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Copy, Search, Building2, MapPin, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { RefurbProject } from "@shared/schema";
import { useLocation } from "wouter";

interface EntityResult {
  id: string;
  name: string;
  type: "Lead" | "Opportunity";
}

interface Props {
  project: RefurbProject;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DuplicateDialog({ project, open, onOpenChange }: Props) {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const [newName, setNewName] = useState(`Copy of ${project.name}`);
  const [entityTab, setEntityTab] = useState<"Lead" | "Opportunity">("Lead");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedEntity, setSelectedEntity] = useState<EntityResult | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (open) {
      setNewName(`Copy of ${project.name}`);
      setSearch("");
      setDebouncedSearch("");
      setSelectedEntity(null);
      setEntityTab("Lead");
    }
  }, [open, project.name]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(search), 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [search]);

  const { data: results, isFetching } = useQuery<EntityResult[]>({
    queryKey: ["/api/search-entities", entityTab, debouncedSearch],
    queryFn: async () => {
      const params = new URLSearchParams({ type: entityTab, q: debouncedSearch });
      const res = await apiRequest("GET", `/api/search-entities?${params}`);
      return res.json();
    },
    enabled: open,
    staleTime: 30_000,
  });

  const duplicateMutation = useMutation({
    mutationFn: async () => {
      const { id: _, createdAt, updatedAt, subtotal, vatTotal, grandTotal, ...rest } = project;
      const body = {
        ...rest,
        name: newName.trim() || `Copy of ${project.name}`,
        status: "Draft",
        associatedEntityType: selectedEntity?.type ?? project.associatedEntityType,
        associatedEntityId: selectedEntity?.id ?? project.associatedEntityId,
        associatedEntityName: selectedEntity?.name ?? project.associatedEntityName,
      };
      const res = await apiRequest("POST", "/api/refurb-projects", body);
      return res.json();
    },
    onSuccess: (data: RefurbProject) => {
      queryClient.invalidateQueries({ queryKey: ["/api/refurb-projects"] });
      toast({ title: "Project duplicated", description: `"${data.name}" has been created.` });
      onOpenChange(false);
      navigate(`/projects/${data.id}`);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to duplicate the project.", variant: "destructive" });
    },
  });

  const entityLabel = entityTab === "Opportunity" ? "Property" : "Lead";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="dialog-duplicate">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Copy className="h-4 w-4" />
            Duplicate Project
          </DialogTitle>
          <DialogDescription>
            Create a copy of this project and assign it to a Lead or Property.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              New Project Name
            </label>
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="mt-1"
              data-testid="input-duplicate-name"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Associate With
            </label>
            <Tabs
              value={entityTab}
              onValueChange={(v) => {
                setEntityTab(v as "Lead" | "Opportunity");
                setSelectedEntity(null);
                setSearch("");
                setDebouncedSearch("");
              }}
              className="mt-1"
            >
              <TabsList className="w-full">
                <TabsTrigger value="Lead" className="flex-1" data-testid="tab-lead">Lead</TabsTrigger>
                <TabsTrigger value="Opportunity" className="flex-1" data-testid="tab-property">Property</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="relative mt-2">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search ${entityLabel}s...`}
                className="pl-8 h-9"
                data-testid="input-entity-search"
              />
              {isFetching && (
                <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 animate-spin text-muted-foreground" />
              )}
            </div>

            <div className="mt-1 border rounded-md max-h-44 overflow-y-auto bg-card" data-testid="entity-results">
              {selectedEntity === null && !search && (
                <div className="px-3 py-2 text-xs text-muted-foreground italic">
                  Keep current association, or search to select a different {entityLabel.toLowerCase()}.
                </div>
              )}
              {results && results.length === 0 && (search || debouncedSearch) && (
                <div className="px-3 py-2 text-xs text-muted-foreground">No {entityLabel}s found.</div>
              )}
              {results?.map((entity) => (
                <button
                  key={entity.id}
                  type="button"
                  onClick={() => setSelectedEntity(selectedEntity?.id === entity.id ? null : entity)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-muted/50 transition-colors border-b last:border-b-0"
                  data-testid={`entity-result-${entity.id}`}
                >
                  {entity.type === "Opportunity" ? (
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                  ) : (
                    <Building2 className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                  )}
                  <span className="flex-1 truncate">{entity.name}</span>
                  {selectedEntity?.id === entity.id && (
                    <Check className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>

            {selectedEntity ? (
              <p className="text-xs text-primary mt-1 flex items-center gap-1">
                <Check className="h-3 w-3" />
                Will associate with: <strong>{selectedEntity.name}</strong>
              </p>
            ) : (
              <p className="text-xs text-muted-foreground mt-1">
                Keeping current association: {project.associatedEntityName || "none"}
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} data-testid="button-cancel-duplicate">
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => duplicateMutation.mutate()}
            disabled={duplicateMutation.isPending || !newName.trim()}
            data-testid="button-confirm-duplicate"
          >
            {duplicateMutation.isPending ? (
              <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Duplicating...</>
            ) : (
              <><Copy className="h-3.5 w-3.5 mr-1.5" />Duplicate</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
