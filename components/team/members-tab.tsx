"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, ChevronLeft, ChevronRight, CheckCircle, Circle } from "lucide-react";

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
        <table className="min-w-full divide-y divide-stone-800">
          <thead>
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Member
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Last Active
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-800">
            {paginatedMembers.map((member) => (
              <tr key={member.id} className="hover:bg-accent/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-sm font-medium">
                      {member.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{member.name}</p>
                      <p className="text-xs text-foreground0">{member.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Select 
                    defaultValue={member.role}
                    onValueChange={(value) => onRoleChange?.(member.id, value)}
                  >
                    <SelectTrigger className="w-[120px] border bg-accent text-foreground" size="sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border bg-card">
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
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge
                    variant={member.status === "active" ? "success" : "outline"}
                  >
                    {member.status === "active" && (
                      <CheckCircle className="h-3 w-3 mr-1" />
                    )}
                    {member.status === "inactive" && (
                      <Circle className="h-3 w-3 mr-1" />
                    )}
                    {member.status}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-muted-foreground">{member.lastActive}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-400 hover:text-red-300 hover:bg-red-950"
                    onClick={() => onRemove?.(member.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4">
            <p className="text-sm text-muted-foreground">
              Showing {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, members.length)} of {members.length}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="border text-muted-foreground disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="border text-muted-foreground disabled:opacity-50"
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
