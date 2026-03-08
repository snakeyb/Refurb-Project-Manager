import { Building2, ChevronRight } from "lucide-react";
import { Link } from "wouter";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface EspoHeaderProps {
  breadcrumbs: BreadcrumbItem[];
  actions?: React.ReactNode;
}

export function EspoHeader({ breadcrumbs, actions }: EspoHeaderProps) {
  return (
    <div className="border-b bg-card" data-testid="header-breadcrumb">
      <div className="flex items-center justify-between gap-4 px-5 py-3">
        <div className="flex items-center gap-2 min-w-0">
          <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          {breadcrumbs.map((item, index) => (
            <div key={index} className="flex items-center gap-2 min-w-0">
              {index > 0 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />}
              {item.href ? (
                <Link
                  href={item.href}
                  className="text-sm text-primary truncate"
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
        {actions && (
          <div className="flex items-center gap-2 flex-shrink-0 flex-wrap" data-testid="header-actions">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
