import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    in_progress: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    completed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
  };

  const labels: Record<string, string> = {
    pending: "Pending",
    in_progress: "In Progress",
    completed: "Completed",
    cancelled: "Cancelled",
  };

  return (
    <span className={cn(
      "px-3 py-1 rounded-full text-xs font-semibold border flex items-center w-fit",
      styles[status] || styles.pending
    )}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-2 animate-pulse-slow" />
      {labels[status] || status}
    </span>
  );
}
