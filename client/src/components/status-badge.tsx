const statusConfig: Record<string, { className: string }> = {
  Draft:        { className: "text-muted-foreground" },
  Approved:     { className: "text-green-700 dark:text-green-400" },
  "In Progress":{ className: "text-primary" },
  Completed:    { className: "text-green-700 dark:text-green-400" },
  Cancelled:    { className: "text-destructive" },
};

export function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || statusConfig.Draft;
  return (
    <span
      className={`text-sm font-medium ${config.className}`}
      data-testid={`badge-status-${status.toLowerCase().replace(/\s+/g, "-")}`}
    >
      {status}
    </span>
  );
}
