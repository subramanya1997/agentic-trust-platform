"use client";

import Link from "next/link";
import { Clock, XCircle, ChevronRight } from "@/lib/icons";
import { Button } from "@/components/ui/button";

interface ActionItemsBannerProps {
  pendingApprovals: number;
  recentFailures: number;
}

export function ActionItemsBanner({
  pendingApprovals,
  recentFailures,
}: ActionItemsBannerProps) {
  // Don't render if no action items
  if (pendingApprovals === 0 && recentFailures === 0) {
    return null;
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Pending Approvals */}
      {pendingApprovals > 0 && (
        <div className="flex-1 flex items-center justify-between gap-4 rounded-lg border border-amber-800/50 bg-amber-950/30 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-900/50">
              <Clock className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-amber-200">
                {pendingApprovals} Pending Approval{pendingApprovals !== 1 ? "s" : ""}
              </p>
              <p className="text-xs text-amber-400/70">
                Executions waiting for your review
              </p>
            </div>
          </div>
          <Link href="/activity?status=waiting_approval">
            <Button
              size="sm"
              variant="ghost"
              className="text-amber-400 hover:text-amber-300 hover:bg-amber-900/30"
            >
              Review
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
      )}

      {/* Recent Failures */}
      {recentFailures > 0 && (
        <div className="flex-1 flex items-center justify-between gap-4 rounded-lg border border-red-800/50 bg-red-950/30 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-900/50">
              <XCircle className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-red-200">
                {recentFailures} Failed Execution{recentFailures !== 1 ? "s" : ""}
              </p>
              <p className="text-xs text-red-400/70">
                In the last 24 hours
              </p>
            </div>
          </div>
          <Link href="/activity?status=failed">
            <Button
              size="sm"
              variant="ghost"
              className="text-red-400 hover:text-red-300 hover:bg-red-900/30"
            >
              View Issues
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

