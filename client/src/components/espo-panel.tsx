interface EspoPanelProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  actions?: React.ReactNode;
}

export function EspoPanel({ title, children, actions }: EspoPanelProps) {
  return (
    <div className="border border-border rounded-sm bg-white shadow-xs" data-testid={`panel-${title.toLowerCase().replace(/\s+/g, "-")}`}>
      <div className="flex items-center justify-between px-4 py-2 border-b border-border">
        <span className="text-xs font-semibold text-muted-foreground">
          {title}
        </span>
        {actions && (
          <div className="flex items-center gap-1">
            {actions}
          </div>
        )}
      </div>
      <div className="p-4" data-testid={`panel-content-${title.toLowerCase().replace(/\s+/g, "-")}`}>
        {children}
      </div>
    </div>
  );
}
