import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

interface EspoPanelProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  actions?: React.ReactNode;
}

export function EspoPanel({ title, icon, children, defaultOpen = true, actions }: EspoPanelProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border rounded-md bg-card" data-testid={`panel-${title.toLowerCase().replace(/\s+/g, "-")}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 px-4 py-2.5 text-left border-b bg-white dark:bg-card rounded-t-md hover-elevate active-elevate-2"
        data-testid={`button-toggle-${title.toLowerCase().replace(/\s+/g, "-")}`}
      >
        <div className="flex items-center gap-2">
          {isOpen ? (
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          )}
          {icon}
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</span>
        </div>
        {actions && (
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            {actions}
          </div>
        )}
      </button>
      {isOpen && (
        <div className="p-4" data-testid={`panel-content-${title.toLowerCase().replace(/\s+/g, "-")}`}>
          {children}
        </div>
      )}
    </div>
  );
}
