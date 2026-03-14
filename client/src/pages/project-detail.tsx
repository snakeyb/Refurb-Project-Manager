import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Edit, Trash2, Copy, FileText, Building2, Clock, Tag, StickyNote, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EspoHeader } from "@/components/espo-header";
import { EspoPanel } from "@/components/espo-panel";
import { LineItemTable } from "@/components/line-item-table";
import { StatusBadge } from "@/components/status-badge";
import { DuplicateDialog } from "@/components/duplicate-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { RefurbProject, RefurbLineItem } from "@shared/schema";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [duplicateOpen, setDuplicateOpen] = useState(false);

  const { data: project, isLoading, error } = useQuery<RefurbProject>({
    queryKey: ["/api/refurb-projects", id],
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/refurb-projects/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/refurb-projects"] });
      toast({ title: "Project deleted", description: "The refurb project has been deleted." });
      navigate("/");
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete the project.", variant: "destructive" });
    },
  });

  if (isLoading) {
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

  if (error || !project) {
    return (
      <div className="min-h-screen bg-background">
        <EspoHeader breadcrumbs={[{ label: "Refurb Projects", href: "/" }, { label: "Not Found" }]} />
        <div className="p-5">
          <div className="border rounded-md p-12 bg-card text-center">
            <p className="text-muted-foreground mb-4">This refurb project could not be found.</p>
            <Button variant="outline" size="sm" onClick={() => navigate("/")} data-testid="button-back-to-list">
              <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
              Back to Projects
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const lineItems: RefurbLineItem[] = Array.isArray(project.lineItems)
    ? project.lineItems as RefurbLineItem[]
    : typeof project.lineItems === "string"
      ? JSON.parse(project.lineItems)
      : [];

  return (
    <div className="min-h-screen bg-background" data-testid="page-project-detail">
      <EspoHeader
        breadcrumbs={[
          { label: "Refurb Projects", href: "/" },
          { label: project.name },
        ]}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => navigate("/")} data-testid="button-back">
              <ArrowLeft className="h-3.5 w-3.5 sm:mr-1.5" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate(`/projects/${id}/edit`)} data-testid="button-edit">
              <Edit className="h-3.5 w-3.5 sm:mr-1.5" />
              <span className="hidden sm:inline">Edit</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => setDuplicateOpen(true)} data-testid="button-duplicate">
              <Copy className="h-3.5 w-3.5 sm:mr-1.5" />
              <span className="hidden sm:inline">Duplicate</span>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" data-testid="button-delete">
                  <Trash2 className="h-3.5 w-3.5 sm:mr-1.5" />
                  <span className="hidden sm:inline">Delete</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Refurb Project</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{project.name}"? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deleteMutation.mutate()}
                    className="bg-destructive text-destructive-foreground"
                    data-testid="button-confirm-delete"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        }
      />

      <div className="p-3 sm:p-5 space-y-4 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <EspoPanel title="Overview" icon={<FileText className="h-3.5 w-3.5 text-muted-foreground" />}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                <DetailField label="Project Name" value={project.name} testId="text-detail-name" />
                <DetailField label="Status">
                  <StatusBadge status={project.status} />
                </DetailField>
                <DetailField label="Currency" value={project.currency} />
                <DetailField label="Grand Total">
                  <span className="text-lg font-semibold text-primary tabular-nums" data-testid="text-detail-grand-total">
                    {formatCurrency(project.grandTotal, project.currency)}
                  </span>
                </DetailField>
                {project.description && (
                  <div className="sm:col-span-2">
                    <DetailField label="Description" value={project.description} testId="text-detail-description" />
                  </div>
                )}
              </div>
            </EspoPanel>

            <EspoPanel title="Line Items" icon={<Tag className="h-3.5 w-3.5 text-muted-foreground" />}>
              <LineItemTable items={lineItems} onChange={() => {}} readOnly currency={project.currency} />
            </EspoPanel>
          </div>

          <div className="space-y-4">
            {project.associatedEntityName && (
              <EspoPanel title="Associated Entity" icon={<Building2 className="h-3.5 w-3.5 text-muted-foreground" />}>
                <div className="space-y-3">
                  <DetailField label="Type" value={project.associatedEntityType || "-"} />
                  <DetailField label="Name" value={project.associatedEntityName} testId="text-detail-entity-name" />
                  {project.associatedEntityId && (
                    <DetailField label="Entity ID" value={project.associatedEntityId} />
                  )}
                  <p className="text-xs text-muted-foreground mt-2 border-t pt-2">
                    In your PropertyPipeline CRM, this would link directly to the {project.associatedEntityType?.toLowerCase()} record.
                  </p>
                </div>
              </EspoPanel>
            )}

            {project.notes && (
              <EspoPanel title="Notes" icon={<StickyNote className="h-3.5 w-3.5 text-muted-foreground" />}>
                <p className="text-sm text-foreground whitespace-pre-wrap" data-testid="text-detail-notes">{project.notes}</p>
              </EspoPanel>
            )}

            <EspoPanel title="Activity" icon={<Clock className="h-3.5 w-3.5 text-muted-foreground" />}>
              <div className="space-y-3">
                <DetailField label="Created" value={formatDateTime(project.createdAt)} />
                <DetailField label="Last Modified" value={formatDateTime(project.updatedAt)} />
              </div>
            </EspoPanel>
          </div>
        </div>
      </div>

      <DuplicateDialog
        project={project}
        open={duplicateOpen}
        onOpenChange={setDuplicateOpen}
      />
    </div>
  );
}

function DetailField({ label, value, testId, children }: { label: string; value?: string; testId?: string; children?: React.ReactNode }) {
  return (
    <div>
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
      <div className="mt-0.5">
        {children || <span className="text-sm" data-testid={testId}>{value || "-"}</span>}
      </div>
    </div>
  );
}
