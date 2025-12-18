import { cn } from "@/lib/utils";
import { formatCompact } from "@/lib/utils/format";

interface UsageBarProps {
  current: number;
  max: number;
  label?: string;
  showLabel?: boolean;
  className?: string;
}

export function UsageBar({ current, max, label, showLabel = true, className }: UsageBarProps) {
  const percent = (current / max) * 100;

  return (
    <div className={className}>
      {showLabel && (
        <span className="text-muted-foreground/60 mb-1 block text-right text-[10px]">
          {label || `${formatCompact(current)} / ${formatCompact(max)}`}
        </span>
      )}
      <div className="bg-secondary h-1.5 w-full overflow-hidden rounded-full">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            percent >= 90 ? "bg-green-500" : percent >= 70 ? "bg-amber-500" : "bg-red-500"
          )}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
    </div>
  );
}
