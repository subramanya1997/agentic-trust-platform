"use client";

import { DataTable, TableRow, TableCell } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export interface Role {
  id: string;
  name: string;
  description: string;
  color: string;
  memberCount: number;
  isDefault?: boolean;
  isSystem?: boolean;
}

interface RolesTabProps {
  roles: Role[];
}

export function RolesTab({ roles }: RolesTabProps) {
  return (
    <Card className="bg-card border">
        <CardContent className="p-0">
          <DataTable
            headers={[
              { label: "Role", align: "left" },
              { label: "Description", align: "left" },
              { label: "Members", align: "center" },
              { label: "Type", align: "center" },
            ]}
          >
            {roles.map((role) => (
              <TableRow key={role.id}>
                <TableCell className="px-4 py-3 whitespace-nowrap">
                  <span className="text-foreground text-sm font-medium">{role.name}</span>
                </TableCell>
                <TableCell className="px-4 py-3">
                  <span className="text-muted-foreground text-sm">{role.description}</span>
                </TableCell>
                <TableCell className="px-4 py-3 whitespace-nowrap text-center">
                  <Badge variant="outline" className="bg-accent text-muted-foreground">
                    {role.memberCount} {role.memberCount === 1 ? "member" : "members"}
                  </Badge>
                </TableCell>
                <TableCell className="px-4 py-3 whitespace-nowrap text-center">
                  <Badge 
                    variant="outline" 
                    className={
                      role.isSystem 
                        ? "border-amber-500/30 bg-amber-500/10 text-amber-400" 
                        : role.isDefault 
                          ? "border-blue-500/30 bg-blue-500/10 text-blue-400"
                          : "border-slate-500/30 bg-slate-500/10 text-slate-400"
                    }
                  >
                    {role.isSystem ? "System" : role.isDefault ? "Default" : "Custom"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </DataTable>
        </CardContent>
      </Card>
  );
}

export function RolesTabSkeleton() {
  return (
    <Card className="bg-card border">
        <CardContent className="p-0">
          <DataTable
            headers={[
              { label: "Role", align: "left" },
              { label: "Description", align: "left" },
              { label: "Members", align: "center" },
              { label: "Type", align: "center" },
            ]}
          >
            {[1, 2, 3].map((i) => (
              <TableRow key={i}>
                <TableCell className="px-4 py-3 whitespace-nowrap">
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell className="px-4 py-3">
                  <Skeleton className="h-4 w-56" />
                </TableCell>
                <TableCell className="px-4 py-3 whitespace-nowrap text-center">
                  <Skeleton className="h-6 w-20 mx-auto rounded-full" />
                </TableCell>
                <TableCell className="px-4 py-3 whitespace-nowrap text-center">
                  <Skeleton className="h-6 w-16 mx-auto rounded-full" />
                </TableCell>
              </TableRow>
            ))}
          </DataTable>
        </CardContent>
      </Card>
  );
}
