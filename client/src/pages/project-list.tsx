import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Plus, Search, Building2, ExternalLink, Hammer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/status-badge";
import { EspoHeader } from "@/components/espo-header";
import type { RefurbProject } from "@shared/schema";
import { formatCurrency, formatDate } from "@/lib/format";
import { useState } from "react";

export default function ProjectList() {
  const [search, setSearch] = useState("");

  const { data: projects, isLoading, error } = useQuery<RefurbProject[]>({
    queryKey: ["/api/refurb-projects"],
  });

  const filtered = projects?.filter((p) =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.associatedEntityName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background" data-testid="page-project-list">
      <EspoHeader
        breadcrumbs={[{ label: "Refurb Projects" }]}
        actions={
          <Link href="/projects/new">
            <Button size="sm" data-testid="button-create-project">
              <Plus className="h-3.5 w-3.5 sm:mr-1.5" />
              <span className="hidden sm:inline">Create Refurb Project</span>
              <span className="sm:hidden">New</span>
            </Button>
          </Link>
        }
      />

      <div className="p-3 sm:p-5">
        <div className="mb-4 flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[240px] max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9"
              data-testid="input-search"
            />
          </div>
          <span className="text-xs text-muted-foreground" data-testid="text-project-count">
            {filtered?.length ?? 0} project{(filtered?.length ?? 0) !== 1 ? "s" : ""}
          </span>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border rounded-md p-4 bg-card">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-5 w-20 ml-auto" />
                </div>
                <div className="mt-2 flex gap-3">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="border rounded-md p-8 bg-card text-center" data-testid="error-state">
            <p className="text-muted-foreground">Failed to load refurb projects. Please try again.</p>
          </div>
        ) : filtered && filtered.length > 0 ? (
          <>
            <div className="hidden sm:block border rounded-md bg-card" data-testid="project-list-table">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-white dark:bg-card">
                    <th className="text-left py-2.5 px-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Project Name</th>
                    <th className="text-left py-2.5 px-4 font-medium text-muted-foreground text-xs uppercase tracking-wider hidden md:table-cell">Associated Entity</th>
                    <th className="text-left py-2.5 px-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Status</th>
                    <th className="text-right py-2.5 px-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">Total</th>
                    <th className="text-right py-2.5 px-4 font-medium text-muted-foreground text-xs uppercase tracking-wider hidden lg:table-cell">Created</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((project) => (
                    <tr
                      key={project.id}
                      className="border-b last:border-b-0 hover-elevate active-elevate-2 cursor-pointer"
                      data-testid={`row-project-${project.id}`}
                    >
                      <td className="py-3 px-4">
                        <Link href={`/projects/${project.id}`} className="block">
                          <div className="flex items-center gap-2">
                            <Hammer className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                            <span className="text-sm font-medium text-primary" data-testid={`text-project-name-${project.id}`}>
                              {project.name}
                            </span>
                          </div>
                        </Link>
                      </td>
                      <td className="py-3 px-4 hidden md:table-cell">
                        <Link href={`/projects/${project.id}`} className="block">
                          {project.associatedEntityName ? (
                            <div className="flex items-center gap-1.5">
                              <Building2 className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                              <span className="text-sm text-muted-foreground truncate max-w-[250px]">
                                {project.associatedEntityName}
                              </span>
                              <span className="text-xs text-muted-foreground/60">
                                ({project.associatedEntityType})
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground/50">-</span>
                          )}
                        </Link>
                      </td>
                      <td className="py-3 px-4">
                        <Link href={`/projects/${project.id}`} className="block">
                          <StatusBadge status={project.status} />
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link href={`/projects/${project.id}`} className="block">
                          <span className="text-sm font-semibold tabular-nums" data-testid={`text-project-total-${project.id}`}>
                            {formatCurrency(project.grandTotal, project.currency)}
                          </span>
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-right hidden lg:table-cell">
                        <Link href={`/projects/${project.id}`} className="block">
                          <span className="text-xs text-muted-foreground">{formatDate(project.createdAt)}</span>
                        </Link>
                      </td>
                      <td className="py-3 px-2">
                        <Link href={`/projects/${project.id}`}>
                          <Button size="icon" variant="ghost" className="h-7 w-7" data-testid={`button-view-${project.id}`}>
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="sm:hidden space-y-2" data-testid="project-list-cards">
              {filtered.map((project) => (
                <Link key={project.id} href={`/projects/${project.id}`}>
                  <div
                    className="border rounded-md bg-card p-3 active:bg-muted/30 transition-colors"
                    data-testid={`card-project-${project.id}`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <Hammer className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                        <span className="text-sm font-medium text-primary truncate" data-testid={`text-project-name-${project.id}`}>
                          {project.name}
                        </span>
                      </div>
                      <StatusBadge status={project.status} />
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      {project.associatedEntityName ? (
                        <span className="text-xs text-muted-foreground truncate">
                          {project.associatedEntityName}
                        </span>
                      ) : (
                        <span />
                      )}
                      <span className="text-sm font-semibold tabular-nums flex-shrink-0" data-testid={`text-project-total-${project.id}`}>
                        {formatCurrency(project.grandTotal, project.currency)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        ) : (
          <div className="border rounded-md p-12 bg-card text-center" data-testid="empty-state">
            <Hammer className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <h3 className="text-sm font-medium text-foreground mb-1">No refurb projects found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {search ? "Try adjusting your search criteria." : "Get started by creating your first refurbishment project."}
            </p>
            {!search && (
              <Link href="/projects/new">
                <Button size="sm" data-testid="button-create-first">
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  Create Refurb Project
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
