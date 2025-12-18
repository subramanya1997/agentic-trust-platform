import { TrendingUp, TrendingDown } from "@/lib/icons";
import { cn } from "@/lib/utils";

export type TrendType = "positive" | "negative" | "neutral";

interface TrendIndicatorProps {
  value: string;
  type: TrendType;
  showIcon?: boolean;
  className?: string;
}

export function TrendIndicator({ value, type, showIcon = true, className }: TrendIndicatorProps) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {showIcon && type === "positive" && <TrendingUp className="h-3 w-3 text-green-500" />}
      {showIcon && type === "negative" && <TrendingDown className="h-3 w-3 text-red-500" />}
      <span
        className={cn(
          "text-xs font-medium",
          type === "positive" && "text-green-500",
          type === "negative" && "text-red-500",
          type === "neutral" && "text-muted-foreground"
        )}
      >
        {value}
      </span>
    </div>
  );
}
