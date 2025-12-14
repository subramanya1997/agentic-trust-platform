"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

// ============================================================================
// Simple DataTable Wrapper Component
// ============================================================================

interface DataTableHeader {
  label: string | React.ReactNode;
  align?: "left" | "center" | "right";
  className?: string;
}

interface DataTableProps {
  headers: DataTableHeader[];
  children: React.ReactNode;
  className?: string;
}

export function DataTable({ headers, children, className }: DataTableProps) {
  return (
    <div className={cn("overflow-hidden rounded-lg", className)}>
      <Table className="rounded-none">
        <TableHeader className="bg-card">
          <TableRow className="hover:bg-transparent">
            {headers.map((header, index) => (
              <TableHead
                key={index}
                className={cn(
                  "bg-card px-4 py-2.5 text-xs font-medium tracking-wider text-white uppercase",
                  header.align === "center" && "text-center",
                  header.align === "right" && "text-right",
                  header.align === "left" && "text-left",
                  !header.align && "text-left",
                  header.className
                )}
              >
                {header.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody className="!bg-card [&_tr]:!bg-card [&_tr:hover]:!bg-muted [&_tr]:transition-colors">
          {children}
        </TableBody>
      </Table>
    </div>
  );
}

// Re-export TableRow and TableCell for use with DataTable
export { TableRow, TableCell };
