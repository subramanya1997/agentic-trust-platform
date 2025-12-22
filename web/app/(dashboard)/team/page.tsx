"use client";

import { useEffect, useState } from "react";

import { Header } from "@/components/layout/header";
import { InvitedTab, InvitedTabSkeleton } from "@/components/team/invited-tab";
import { InviteMemberDialog } from "@/components/team/invite-member-dialog";
import { MembersTab, MembersTabSkeleton } from "@/components/team/members-tab";
import { PermissionsTab, PermissionsTabSkeleton, Permission, RolePermission } from "@/components/team/permissions-tab";
import { RolesTab, RolesTabSkeleton } from "@/components/team/roles-tab";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { useOrganization } from "@/lib/context";
import { Users, Mail, Shield, Lock, Plus, RotateCcw } from "@/lib/icons";

type TabType = "members" | "invited" | "roles" | "permissions";

const tabs = [
  { id: "members" as const, label: "Members", icon: Users },
  { id: "invited" as const, label: "Invited", icon: Mail },
  { id: "roles" as const, label: "Roles", icon: Shield },
  { id: "permissions" as const, label: "Permissions", icon: Lock },
];

// Role colors for display
const ROLE_COLORS: Record<string, string> = {
  admin: "bg-amber-950 text-amber-400 border-amber-800",
  member: "bg-blue-950 text-blue-400 border-blue-800",
  viewer: "bg-slate-800 text-slate-400 border-slate-700",
};

export default function TeamPage() {
  const [activeTab, setActiveTab] = useState<TabType>("members");
  const { currentOrg, loading: orgLoading } = useOrganization();
  const [members, setMembers] = useState<any[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [showInviteDialog, setShowInviteDialog] = useState(false);

  useEffect(() => {
    if (!currentOrg || orgLoading) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [membersData, invitationsData, rolesData, permissionsData, myRoleData] = await Promise.all([
          api.team.listMembers(),
          api.team.listInvitations(),
          api.permissions.listRoles(),
          api.permissions.getOrganizationRolesWithPermissions(),
          api.permissions.getMyRole(),
        ]);

        setMembers(membersData || []);
        setInvitations(invitationsData || []);
        setRoles(rolesData || []);
        setCurrentUserRole(myRoleData?.role || null);
        
        // Set permissions data from WorkOS
        if (permissionsData) {
          setPermissions(permissionsData.permissions || []);
          setRolePermissions(permissionsData.rolePermissions || []);
          
          // If we got roles with permissions, use those instead
          if (permissionsData.roles && permissionsData.roles.length > 0) {
            setRoles(permissionsData.roles.map(r => ({
              slug: r.slug,
              name: r.name,
              description: r.description,
            })));
          }
        }
      } catch (error) {
        console.error("Failed to fetch team data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentOrg, orgLoading]);

  const handleInviteMember = async (email: string, role: string) => {
    try {
      await api.team.inviteMember(email, role);
      // Refresh invitations
      const invitationsData = await api.team.listInvitations();
      setInvitations(invitationsData || []);
    } catch (error) {
      console.error("Failed to invite member:", error);
      throw error; // Re-throw so the dialog can handle it
    }
  };

  const handleUpdateRole = async (membershipId: string, role: string) => {
    try {
      await api.team.updateMemberRole(membershipId, role);
      // Refresh members
      const membersData = await api.team.listMembers();
      setMembers(membersData || []);
    } catch (error) {
      console.error("Failed to update role:", error);
    }
  };

  const handleRemoveMember = async (membershipId: string) => {
    try {
      await api.team.removeMember(membershipId);
      // Refresh members
      const membersData = await api.team.listMembers();
      setMembers(membersData || []);
    } catch (error) {
      console.error("Failed to remove member:", error);
    }
  };

  const handleRevokeInvitation = async (invitationId: string) => {
    try {
      await api.team.revokeInvitation(invitationId);
      // Refresh invitations
      const invitationsData = await api.team.listInvitations();
      setInvitations(invitationsData || []);
    } catch (error) {
      console.error("Failed to revoke invitation:", error);
    }
  };

  const handleResendInvitation = async (invitationId: string) => {
    try {
      await api.team.resendInvitation(invitationId);
      // Optionally show a success message
      console.log("Invitation resent successfully");
    } catch (error) {
      console.error("Failed to resend invitation:", error);
    }
  };

  const rolesForSelect = roles.map((r) => ({ 
    id: r.slug?.toLowerCase() || r.slug, 
    name: r.name,
    color: ROLE_COLORS[r.slug?.toLowerCase()] || "bg-slate-800 text-slate-400 border-slate-700",
  }));

  // Helper function to format relative time
  const formatRelativeTime = (dateString: string | null) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Transform members to match component props
  const transformedMembers = members.map((m) => ({
    id: m.id,
    name: m.name || m.email.split("@")[0],
    email: m.email,
    role: m.role?.toLowerCase() || "member", // Role slug (lowercase)
    roleDisplayName: m.role_display_name || m.role, // Display name from backend
    status: m.status,
    avatar: m.avatar_url || null,
    lastActive: formatRelativeTime(m.last_active),
    joinedAt: m.joined_at ? new Date(m.joined_at).toLocaleDateString() : "Unknown",
  }));

  // Transform invitations
  const transformedInvitations = invitations.map((inv) => ({
    id: inv.id,
    email: inv.email,
    role: inv.role || "member",
    invitedBy: inv.invited_by || "Unknown",
    invitedAt: new Date(inv.created_at).toLocaleDateString(),
    expiresAt: new Date(inv.expires_at).toLocaleDateString(),
    status: inv.state as "pending" | "accepted" | "expired" | "revoked",
  }));

  // Transform roles for display
  const transformedRoles = roles.map((r) => ({
    id: r.slug,
    name: r.name,
    description: r.description || `${r.name} role`,
    color: ROLE_COLORS[r.slug?.toLowerCase()] || "bg-slate-800 text-slate-400 border-slate-700",
    // Count members matching this role (case-insensitive, checking both slug and name)
    memberCount: members.filter((m) => {
      const memberRole = m.role?.toLowerCase();
      return memberRole === r.slug?.toLowerCase() || memberRole === r.name?.toLowerCase();
    }).length,
    isSystem: r.slug?.toLowerCase() === "admin",
    isDefault: r.slug?.toLowerCase() === "member",
  }));

  const getActionButton = () => {
    const isAdmin = currentUserRole?.toLowerCase() === "admin";
    const canInvite = isAdmin || currentUserRole?.toLowerCase() === "member";

    switch (activeTab) {
      case "members":
      case "invited":
        return canInvite ? (
          <Button 
            size="sm" 
            className="bg-amber-600 text-white hover:bg-amber-500"
            onClick={() => setShowInviteDialog(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Invite Member
          </Button>
        ) : null;
      case "roles":
        return null; // WorkOS manages roles
      case "permissions":
        return (
          <Button size="sm" variant="outline" className="border text-muted-foreground">
            <RotateCcw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        );
      default:
        return null;
    }
  };

  if (orgLoading || loading) {
    return (
      <>
        <Header subtitle="Manage team members, roles, and permissions" />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          <div className="min-w-0 space-y-6">
            {/* Tab Navigation Skeleton */}
            <div className="flex items-center justify-between">
              <div className="bg-card/50 flex items-center gap-1 rounded-lg border p-1">
                {tabs.map((tab) => (
                  <div
                    key={tab.id}
                    className="flex items-center gap-1.5 rounded-md px-3 py-1.5"
                  >
                    <Skeleton className="h-3.5 w-3.5" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                ))}
              </div>
              <Skeleton className="h-9 w-32" />
            </div>

            {/* Tab Content Skeleton */}
            <div>
              {activeTab === "members" && <MembersTabSkeleton />}
              {activeTab === "invited" && <InvitedTabSkeleton />}
              {activeTab === "roles" && <RolesTabSkeleton />}
              {activeTab === "permissions" && <PermissionsTabSkeleton />}
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header subtitle="Manage team members, roles, and permissions" />
      <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
        <div className="min-w-0 space-y-6">
          {/* Tab Navigation */}
          <div className="flex items-center justify-between">
            <div className="bg-card/50 flex items-center gap-1 rounded-lg border p-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:text-muted-foreground"
                  }`}
                >
                  <tab.icon className="h-3.5 w-3.5" />
                  {tab.label}
                  {tab.id === "invited" && (() => {
                    const pendingCount = transformedInvitations.filter(inv => inv.status === "pending").length;
                    return pendingCount > 0 ? (
                      <span className="ml-1 rounded bg-amber-600 px-1.5 py-0.5 text-[10px] text-white">
                        {pendingCount}
                      </span>
                    ) : null;
                  })()}
                </button>
              ))}
            </div>
            {getActionButton()}
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === "members" && (
              <MembersTab 
                members={transformedMembers} 
                roles={rolesForSelect}
                currentUserRole={currentUserRole}
                onRoleChange={handleUpdateRole}
                onRemove={handleRemoveMember}
              />
            )}
            {activeTab === "invited" && (
              <InvitedTab 
                invitations={transformedInvitations} 
                roles={rolesForSelect}
                onResend={handleResendInvitation}
                onRevoke={handleRevokeInvitation}
              />
            )}
            {activeTab === "roles" && <RolesTab roles={transformedRoles} />}
            {activeTab === "permissions" && (
              <PermissionsTab
                permissions={permissions}
                roles={transformedRoles.map((r) => ({
                  id: r.id,
                  name: r.name,
                  color: r.color,
                }))}
                rolePermissions={rolePermissions}
              />
            )}
          </div>
        </div>
      </main>

      {/* Invite Member Dialog */}
      <InviteMemberDialog
        open={showInviteDialog}
        onOpenChange={setShowInviteDialog}
        roles={rolesForSelect}
        onInvite={handleInviteMember}
      />
    </>
  );
}
