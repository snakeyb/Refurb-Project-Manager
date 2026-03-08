import { Building2, ChevronRight, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { getEspoContext, buildEspoEntityUrl, hasEspoEntityContext } from "@/lib/espo-context";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface EspoHeaderProps {
  breadcrumbs: BreadcrumbItem[];
  actions?: React.ReactNode;
}

export function EspoHeader({ breadcrumbs, actions }: EspoHeaderProps) {
  const espoCtx = getEspoContext();
  const backToCrmUrl = hasEspoEntityContext() && espoCtx.espoUrl && espoCtx.entityType && espoCtx.entityId
    ? buildEspoEntityUrl(espoCtx.espoUrl, espoCtx.entityType, espoCtx.entityId)
    : null;
  const showBackToCrm = !!backToCrmUrl;

  return (
    <div className="border-b bg-background" data-testid="header-breadcrumb">
      <div className="flex items-center justify-between gap-2 sm:gap-4 px-3 sm:px-5 py-2.5 sm:py-3">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 overflow-hidden">
          <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          {breadcrumbs.map((item, index) => (
            <div key={index} className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              {index > 0 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />}
              {item.href ? (
                <Link
                  href={item.href}
                  className="text-sm text-primary truncate hidden sm:inline"
                  data-testid={`link-breadcrumb-${index}`}
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-sm font-medium text-foreground truncate" data-testid={`text-breadcrumb-${index}`}>
                  {item.label}
                </span>
              )}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 flex-wrap justify-end" data-testid="header-actions">
          {showBackToCrm && (
            <a
              href={backToCrmUrl!}
              target="_self"
              data-testid="link-back-to-crm"
            >
              <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                <ExternalLink className="h-3.5 w-3.5 mr-1 sm:mr-1.5" />
                <span className="hidden sm:inline">Back to CRM</span>
                <span className="sm:hidden">CRM</span>
              </Button>
            </a>
          )}
          {actions}
        </div>
      </div>
    </div>
  );
}
