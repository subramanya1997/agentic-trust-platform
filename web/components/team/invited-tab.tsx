"use client";

import { useState } from "react";
import { DataTable, TableRow, TableCell } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { X, RefreshCw, Mail, Clock, ChevronLeft, ChevronRight, XCircle, CheckCircle } from "@/lib/icons";

export interface Invitation {
  id: string;
  email: string;
  role: string;
  invitedBy: string;
  invitedAt: string;
  expiresAt: string;
  status: "pending" | "accepted" | "expired" | "revoked";
}

interface InvitedTabProps {
  invitations: Invitation[];
  roles: { id: string; name: string }[];
  onResend?: (invitationId: string) => void;
  onRevoke?: (invitationId: string) => void;
}

// Helper to get role display name from slug
const getRoleDisplayName = (roleSlug: string, roles: { id: string; name: string }[]) => {
  const role = roles.find(r => r.id?.toLowerCase() === roleSlug?.toLowerCase());
  return role?.name || roleSlug;
};

const ITEMS_PER_PAGE = 25;

export function InvitedTab({ invitations, roles, onResend, onRevoke }: InvitedTabProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(invitations.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedInvitations = invitations.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <Card className="bg-card border">
      <CardContent className="p-0">
        {invitations.length === 0 ? (
          <div className="p-8 text-center">
            <Mail className="mx-auto mb-3 h-12 w-12 text-stone-600" />
            <p className="text-muted-foreground">No pending invitations</p>
            <p className="text-foreground0 mt-1 text-sm">Invite team members to collaborate</p>
          </div>
        ) : (
            <>
              <DataTable
                headers={[
                  { label: "Email", align: "left" },
                  { label: "Role", align: "left" },
                  { label: "Status", align: "left" },
                  { label: "Expires", align: "left" },
                  { label: "Actions", align: "right" },
                ]}
              >
                {paginatedInvitations.map((invitation) => (
                  <TableRow key={invitation.id}>
                    <TableCell className="px-4 py-3 whitespace-nowrap">
                      <span className="text-foreground text-sm">{invitation.email}</span>
                    </TableCell>
                    <TableCell className="px-4 py-3 whitespace-nowrap">
                      <Badge variant="outline" className="bg-accent text-muted-foreground border">
                        {getRoleDisplayName(invitation.role, roles)}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 whitespace-nowrap">
                      <Badge
                        variant="outline"
                        className={
                          invitation.status === "pending"
                            ? "border-yellow-500 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
                            : invitation.status === "accepted"
                              ? "border-green-500 bg-green-500/10 text-green-600 dark:text-green-400"
                              : "border-red-500 bg-red-500/10 text-red-600 dark:text-red-400"
                        }
                      >
                        {invitation.status === "pending" && <Clock className="mr-1 h-3 w-3" />}
                        {invitation.status === "accepted" && <CheckCircle className="mr-1 h-3 w-3" />}
                        {(invitation.status === "revoked" || invitation.status === "expired") && <XCircle className="mr-1 h-3 w-3" />}
                        {invitation.status.charAt(0).toUpperCase() + invitation.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 whitespace-nowrap">
                      <span className="text-muted-foreground text-sm">{invitation.expiresAt}</span>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right whitespace-nowrap">
                      {invitation.status === "pending" ? (
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-foreground"
                            onClick={() => onResend?.(invitation.id)}
                            title="Resend invitation"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:bg-red-950 hover:text-red-300"
                            onClick={() => onRevoke?.(invitation.id)}
                            title="Revoke invitation"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <span className="text-foreground0 text-xs">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </DataTable>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4">
                  <p className="text-muted-foreground text-sm">
                    Showing {startIndex + 1}-
                    {Math.min(startIndex + ITEMS_PER_PAGE, invitations.length)} of{" "}
                    {invitations.length}
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
            </>
          )}
      </CardContent>
    </Card>
  );
}

export function InvitedTabSkeleton() {
  return (
    <Card className="bg-card border">
      <CardContent className="p-0">
        <DataTable
            headers={[
              { label: "Email", align: "left" },
              { label: "Role", align: "left" },
              { label: "Status", align: "left" },
              { label: "Expires", align: "left" },
              { label: "Actions", align: "right" },
            ]}
          >
            {[1, 2, 3].map((i) => (
              <TableRow key={i}>
                <TableCell className="px-4 py-3 whitespace-nowrap">
                  <Skeleton className="h-4 w-48" />
                </TableCell>
                <TableCell className="px-4 py-3 whitespace-nowrap">
                  <Skeleton className="h-6 w-16 rounded-full" />
                </TableCell>
                <TableCell className="px-4 py-3 whitespace-nowrap">
                  <Skeleton className="h-6 w-20 rounded-full" />
                </TableCell>
                <TableCell className="px-4 py-3 whitespace-nowrap">
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell className="px-4 py-3 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-2">
                    <Skeleton className="h-9 w-9" />
                    <Skeleton className="h-9 w-9" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </DataTable>
      </CardContent>
    </Card>
  );
}
