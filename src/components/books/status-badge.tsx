import { cn } from "@/lib/utils";
import { STATUS_LABELS, type ReadingStatus } from "@/lib/constants";

const statusStyles: Record<string, string> = {
  "to-read": "status-to-read",
  reading: "status-reading",
  finished: "status-finished",
};

export function StatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const label = STATUS_LABELS[status as ReadingStatus] ?? status;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        statusStyles[status] ?? "bg-muted text-muted-foreground",
        className
      )}
    >
      {label}
    </span>
  );
}
