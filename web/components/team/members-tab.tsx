"use client";

import { useState } from "react";
import Image from "next/image";

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
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2, ChevronLeft, ChevronRight, CheckCircle, Circle, User } from "@/lib/icons";

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  roleDisplayName?: string;
  status: "active" | "inactive";
  avatar: string | null;
  lastActive: string;
  joinedAt: string;
}

interface MembersTabProps {
  members: TeamMember[];
  roles: { id: string; name: string; color?: string }[];
  currentUserRole?: string | null;
  onRoleChange?: (memberId: string, newRole: string) => void;
  onRemove?: (memberId: string) => void;
}

const ITEMS_PER_PAGE = 25;

export function MembersTab({ members, roles, currentUserRole, onRoleChange, onRemove }: MembersTabProps) {
  // Helper function to check if role changes are allowed
  const canChangeRole = (memberRole: string) => {
    // Only admins can change roles
    if (currentUserRole?.toLowerCase() !== 'admin') {
      return false;
    }
    // Admins cannot change other admin roles
    if (memberRole?.toLowerCase() === 'admin') {
      return false;
    }
    return true;
  };
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
                  {member.avatar && member.avatar.startsWith("http") ? (
                    <div className="relative h-9 w-9 rounded-full overflow-hidden bg-muted">
                      <Image
                        src={member.avatar}
                        alt={member.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-white text-xs font-semibold">
                      {member.name?.substring(0, 2).toUpperCase() || member.email?.substring(0, 2).toUpperCase() || <User className="h-5 w-5" />}
                    </div>
                  )}
                  <div>
                    <p className="text-foreground text-sm font-medium">{member.name}</p>
                    <p className="text-foreground0 text-xs">{member.email}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="px-4 py-3 whitespace-nowrap">
                {canChangeRole(member.role) ? (
                  <Select
                    defaultValue={member.role?.toLowerCase()}
                    onValueChange={(value) => onRoleChange?.(member.id, value)}
                  >
                    <SelectTrigger 
                      className="w-[120px] border bg-accent text-foreground" 
                      size="sm"
                    >
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border">
                      {roles.map((role) => (
                        <SelectItem
                          key={role.id}
                          value={role.id}
                          className="text-muted-foreground focus:bg-accent focus:text-foreground"
                        >
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge variant="outline" className="bg-accent text-muted-foreground border">
                    {member.roleDisplayName || roles.find(r => r.id === member.role?.toLowerCase())?.name || member.role}
                  </Badge>
                )}
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
                  className="text-red-400 hover:bg-red-950 hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => onRemove?.(member.id)}
                  disabled={!canChangeRole(member.role)}
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

export function MembersTabSkeleton() {
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
          {[1, 2, 3, 4, 5].map((i) => (
            <TableRow key={i}>
              <TableCell className="px-4 py-3 whitespace-nowrap">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                </div>
              </TableCell>
              <TableCell className="px-4 py-3 whitespace-nowrap">
                <Skeleton className="h-9 w-[120px]" />
              </TableCell>
              <TableCell className="px-4 py-3 whitespace-nowrap">
                <Skeleton className="h-6 w-20 rounded-full" />
              </TableCell>
              <TableCell className="px-4 py-3 whitespace-nowrap">
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell className="px-4 py-3 text-right whitespace-nowrap">
                <Skeleton className="h-9 w-9 ml-auto" />
              </TableCell>
            </TableRow>
          ))}
        </DataTable>
      </CardContent>
    </Card>
  );
}
