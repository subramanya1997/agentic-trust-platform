"use client";

import { useState } from "react";
import { DataTable, TableRow, TableCell } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, ChevronLeft, ChevronRight, CheckCircle, Circle } from "@/lib/icons";

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive";
  avatar: string;
  lastActive: string;
  joinedAt: string;
}

interface MembersTabProps {
  members: TeamMember[];
  roles: { id: string; name: string }[];
  onRoleChange?: (memberId: string, newRole: string) => void;
  onRemove?: (memberId: string) => void;
}

const ITEMS_PER_PAGE = 25;

export function MembersTab({ members, roles, onRoleChange, onRemove }: MembersTabProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(members.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedMembers = members.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <Card className="bg-card border">
      <CardContent className="p-0">
        <DataTable
          headers={[
            { label: "Member", align: "left" },
            { label: "Role", align: "left" },
            { label: "Status", align: "left" },
            { label: "Last Active", align: "left" },
            { label: "Actions", align: "right" },
          ]}
        >
          {paginatedMembers.map((member) => (
            <TableRow key={member.id}>
              <TableCell className="px-4 py-3 whitespace-nowrap">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-sm font-medium text-white">
                    {member.avatar}
                  </div>
                  <div>
                    <p className="text-foreground text-sm font-medium">{member.name}</p>
                    <p className="text-foreground0 text-xs">{member.email}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="px-4 py-3 whitespace-nowrap">
                <Select
                  defaultValue={member.role}
                  onValueChange={(value) => onRoleChange?.(member.id, value)}
                >
                  <SelectTrigger className="bg-accent text-foreground w-[120px] border" size="sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border">
                    {roles.map((role) => (
                      <SelectItem
                        key={role.id}
                        value={role.name}
                        className="text-muted-foreground focus:bg-accent focus:text-foreground"
                      >
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell className="px-4 py-3 whitespace-nowrap">
                <Badge
                  variant="outline"
                  className={
                    member.status === "active"
                      ? "border-green-500 bg-green-500/10 text-green-600 dark:text-green-400"
                      : ""
                  }
                >
                  {member.status === "active" && <CheckCircle className="mr-1 h-3 w-3" />}
                  {member.status === "inactive" && <Circle className="mr-1 h-3 w-3" />}
                  {member.status}
                </Badge>
              </TableCell>
              <TableCell className="px-4 py-3 whitespace-nowrap">
                <span className="text-muted-foreground text-sm">{member.lastActive}</span>
              </TableCell>
              <TableCell className="px-4 py-3 text-right whitespace-nowrap">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-400 hover:bg-red-950 hover:text-red-300"
                  onClick={() => onRemove?.(member.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </DataTable>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4">
            <p className="text-muted-foreground text-sm">
              Showing {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, members.length)} of{" "}
              {members.length}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="text-muted-foreground border disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-muted-foreground text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="text-muted-foreground border disabled:opacity-50"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
