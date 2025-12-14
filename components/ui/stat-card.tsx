import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { TrendIndicator, TrendType } from "@/components/ui/trend-indicator";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: TrendType;
  footer?: ReactNode;
  children?: ReactNode;
}

export function StatCard({
  title,
  value,
  change,
  changeType = "neutral",
  footer,
  children,
}: StatCardProps) {
  return (
    <Card className="relative overflow-hidden">
      {children}
      <div className="relative z-10 px-4">
        <p className="text-muted-foreground text-xs font-medium">{title}</p>
        <p className="text-foreground mt-0.5 text-xl font-bold">{value}</p>
        {change && (
          <div className="mt-1.5">
            <TrendIndicator value={change} type={changeType} />
          </div>
        )}
        {footer}
      </div>
    </Card>
  );
}
