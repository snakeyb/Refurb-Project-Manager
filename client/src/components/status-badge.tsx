import { Badge } from "@/components/ui/badge";

const statusConfig: Record<string, { className: string }> = {
  Draft: { className: "bg-muted text-muted-foreground" },
  Approved: { className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
  "In Progress": { className: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300" },
  Completed: { className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" },
  Cancelled: { className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" },
};

export function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || statusConfig.Draft;
  return (
    <Badge variant="secondary" className={config.className} data-testid={`badge-status-${status.toLowerCase().replace(/\s+/g, "-")}`}>
      {status}
    </Badge>
  );
}
