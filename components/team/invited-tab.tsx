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
import { X, RefreshCw, Mail, Clock, ChevronLeft, ChevronRight, XCircle } from "lucide-react";

export interface Invitation {
  id: string;
  email: string;
  role: string;
  invitedBy: string;
  invitedAt: string;
  expiresAt: string;
  status: "pending" | "expired";
}

interface InvitedTabProps {
  invitations: Invitation[];
  roles: { id: string; name: string }[];
  onResend?: (invitationId: string) => void;
  onRevoke?: (invitationId: string) => void;
  onInvite?: (email: string, role: string) => void;
}

const ITEMS_PER_PAGE = 25;

export function InvitedTab({ invitations, roles, onResend, onRevoke, onInvite }: InvitedTabProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("Editor");

  const totalPages = Math.ceil(invitations.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedInvitations = invitations.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleInvite = () => {
    if (newEmail && onInvite) {
      onInvite(newEmail, newRole);
      setNewEmail("");
      setNewRole("Editor");
      setShowInviteForm(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Invite Form */}
      {showInviteForm && (
        <Card className="bg-card border">
          <CardContent className="p-4">
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-muted-foreground mb-2">Email Address</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  className="w-full rounded-lg border border bg-accent px-4 py-2 text-sm text-foreground focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
              <div className="w-[140px]">
                <label className="block text-sm font-medium text-muted-foreground mb-2">Role</label>
                <Select value={newRole} onValueChange={setNewRole}>
                  <SelectTrigger className="border bg-accent text-foreground">
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
              </div>
              <Button 
                className="bg-amber-600 hover:bg-amber-500 text-white"
                onClick={handleInvite}
              >
                Send Invite
              </Button>
              <Button 
                variant="ghost" 
                className="text-muted-foreground"
                onClick={() => setShowInviteForm(false)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invitations Table */}
      <Card className="bg-card border">
        <CardContent className="p-0">
          {invitations.length === 0 ? (
            <div className="p-8 text-center">
              <Mail className="h-12 w-12 text-stone-600 mx-auto mb-3" />
              <p className="text-muted-foreground">No pending invitations</p>
              <p className="text-sm text-foreground0 mt-1">Invite team members to collaborate</p>
            </div>
          ) : (
            <>
              <table className="min-w-full divide-y divide-stone-800">
                <thead>
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Invited By
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800">
                  {paginatedInvitations.map((invitation) => (
                    <tr key={invitation.id} className="hover:bg-accent/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-foreground">{invitation.email}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant="outline" className="bg-accent text-muted-foreground border">
                          {invitation.role}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-muted-foreground">{invitation.invitedBy}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              invitation.status === "pending"
                                ? "warning"
                                : invitation.status === "expired"
                                ? "error"
                                : "outline"
                            }
                          >
                            {invitation.status === "pending" && (
                              <Clock className="h-3 w-3 mr-1" />
                            )}
                            {invitation.status === "expired" && (
                              <XCircle className="h-3 w-3 mr-1" />
                            )}
                            {invitation.status}
                          </Badge>
                          <span className="text-xs text-foreground0 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Expires {invitation.expiresAt}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-muted-foreground hover:text-foreground"
                            onClick={() => onResend?.(invitation.id)}
                          >
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Resend
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-400 hover:text-red-300 hover:bg-red-950"
                            onClick={() => onRevoke?.(invitation.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, invitations.length)} of {invitations.length}
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
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
