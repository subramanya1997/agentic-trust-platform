"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import { MembersTab, TeamMember } from "@/components/team/members-tab";
import { InvitedTab, Invitation } from "@/components/team/invited-tab";
import { RolesTab, Role } from "@/components/team/roles-tab";
import { PermissionsTab, Permission, RolePermission } from "@/components/team/permissions-tab";
import { Users, Mail, Shield, Lock, Plus, RotateCcw } from "lucide-react";

type TabType = "members" | "invited" | "roles" | "permissions";

const tabs = [
  { id: "members" as const, label: "Members", icon: Users },
  { id: "invited" as const, label: "Invited", icon: Mail },
  { id: "roles" as const, label: "Roles", icon: Shield },
  { id: "permissions" as const, label: "Permissions", icon: Lock },
];

// Mock data
const mockMembers: TeamMember[] = [
  { id: "1", name: "Sara Klein", email: "sara@company.com", role: "Admin", status: "active", avatar: "SK", lastActive: "Just now", joinedAt: "Oct 15, 2024" },
  { id: "2", name: "Taylor Chen", email: "taylor@company.com", role: "Editor", status: "active", avatar: "TC", lastActive: "2 hours ago", joinedAt: "Nov 1, 2024" },
  { id: "3", name: "Maya Rodriguez", email: "maya@company.com", role: "Editor", status: "active", avatar: "MR", lastActive: "1 day ago", joinedAt: "Nov 10, 2024" },
  { id: "4", name: "Alex Park", email: "alex@company.com", role: "Viewer", status: "active", avatar: "AP", lastActive: "3 days ago", joinedAt: "Nov 20, 2024" },
];

const mockInvitations: Invitation[] = [
  { id: "1", email: "john@company.com", role: "Editor", invitedBy: "Sara Klein", invitedAt: "2 days ago", expiresAt: "in 5 days", status: "pending" },
  { id: "2", email: "lisa@company.com", role: "Viewer", invitedBy: "Taylor Chen", invitedAt: "1 week ago", expiresAt: "in 1 day", status: "pending" },
];

const mockRoles: Role[] = [
  { id: "admin", name: "Admin", description: "Full access to all features and settings", color: "bg-amber-950 text-amber-400 border-amber-800", memberCount: 1, isSystem: true },
  { id: "editor", name: "Editor", description: "Can create and edit agents and integrations", color: "bg-blue-950 text-blue-400 border-blue-800", memberCount: 2, isDefault: true },
  { id: "viewer", name: "Viewer", description: "Read-only access to view agents and analytics", color: "bg-stone-800 text-stone-400 border-stone-700", memberCount: 1 },
  { id: "developer", name: "Developer", description: "Can create agents and manage API keys", color: "bg-purple-950 text-purple-400 border-purple-800", memberCount: 0 },
];

const mockPermissions: Permission[] = [
  // Agents
  { id: "agents.view", name: "View agents", description: "View agent list and details", category: "Agents" },
  { id: "agents.create", name: "Create agents", description: "Create new agents", category: "Agents" },
  { id: "agents.edit", name: "Edit agents", description: "Modify existing agents", category: "Agents" },
  { id: "agents.delete", name: "Delete agents", description: "Remove agents permanently", category: "Agents" },
  { id: "agents.run", name: "Run agents", description: "Execute agent runs", category: "Agents" },
  // Integrations
  { id: "integrations.view", name: "View integrations", description: "View connected integrations", category: "Integrations" },
  { id: "integrations.add", name: "Add integrations", description: "Connect new integrations", category: "Integrations" },
  { id: "integrations.configure", name: "Configure integrations", description: "Modify integration settings", category: "Integrations" },
  { id: "integrations.remove", name: "Remove integrations", description: "Disconnect integrations", category: "Integrations" },
  // Analytics
  { id: "analytics.view", name: "View analytics", description: "Access analytics dashboard", category: "Analytics" },
  { id: "analytics.export", name: "Export data", description: "Download analytics reports", category: "Analytics" },
  // Team
  { id: "team.view", name: "View team", description: "View team members", category: "Team" },
  { id: "team.invite", name: "Invite members", description: "Send team invitations", category: "Team" },
  { id: "team.manage", name: "Manage roles", description: "Change member roles", category: "Team" },
  { id: "team.remove", name: "Remove members", description: "Remove team members", category: "Team" },
  // API Keys
  { id: "apikeys.view", name: "View API keys", description: "View API key list", category: "API Keys" },
  { id: "apikeys.create", name: "Create API keys", description: "Generate new API keys", category: "API Keys" },
  { id: "apikeys.revoke", name: "Revoke API keys", description: "Revoke existing keys", category: "API Keys" },
  // Settings
  { id: "settings.view", name: "View settings", description: "View organization settings", category: "Settings" },
  { id: "settings.edit", name: "Edit settings", description: "Modify organization settings", category: "Settings" },
  { id: "settings.billing", name: "Manage billing", description: "Access billing and payments", category: "Settings" },
];

const mockRolePermissions: RolePermission[] = [
  { 
    roleId: "admin", 
    roleName: "Admin", 
    permissions: mockPermissions.map(p => p.id) // Admin has all permissions
  },
  { 
    roleId: "editor", 
    roleName: "Editor", 
    permissions: [
      "agents.view", "agents.create", "agents.edit", "agents.run",
      "integrations.view", "integrations.add", "integrations.configure",
      "analytics.view", "analytics.export",
      "team.view",
      "apikeys.view",
      "settings.view"
    ]
  },
  { 
    roleId: "viewer", 
    roleName: "Viewer", 
    permissions: [
      "agents.view",
      "integrations.view",
      "analytics.view",
      "team.view",
      "settings.view"
    ]
  },
  { 
    roleId: "developer", 
    roleName: "Developer", 
    permissions: [
      "agents.view", "agents.create", "agents.edit", "agents.run",
      "integrations.view",
      "analytics.view",
      "team.view",
      "apikeys.view", "apikeys.create"
    ]
  },
];

export default function TeamPage() {
  const [activeTab, setActiveTab] = useState<TabType>("members");

  const rolesForSelect = mockRoles.map(r => ({ id: r.id, name: r.name }));
  const rolesForPermissions = mockRoles.map(r => ({ id: r.id, name: r.name, color: r.color }));

  // Determine action button based on active tab
  const getActionButton = () => {
    switch (activeTab) {
      case "members":
      case "invited":
        return (
          <Button size="sm" className="bg-amber-600 hover:bg-amber-500 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Invite Member
          </Button>
        );
      case "roles":
        return (
          <Button size="sm" className="bg-amber-600 hover:bg-amber-500 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add Role
          </Button>
        );
      case "permissions":
        return (
          <Button size="sm" variant="outline" className="border-stone-700 text-stone-300">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Header actionButton={null} />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-stone-50">Team</h1>
            <p className="mt-1 text-sm text-stone-400">Manage team members, roles, and permissions</p>
          </div>

          {/* Tab Navigation - Analytics style */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 bg-stone-900 p-1 rounded-lg border border-stone-800">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-stone-800 text-stone-100"
                      : "text-stone-400 hover:text-stone-200"
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                  {tab.id === "invited" && mockInvitations.length > 0 && (
                    <span className="ml-1 text-xs bg-amber-600 text-white px-1.5 py-0.5 rounded">
                      {mockInvitations.length}
                    </span>
                  )}
                </button>
              ))}
            </div>
            {getActionButton()}
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === "members" && (
              <MembersTab 
                members={mockMembers} 
                roles={rolesForSelect}
              />
            )}
            {activeTab === "invited" && (
              <InvitedTab 
                invitations={mockInvitations} 
                roles={rolesForSelect}
              />
            )}
            {activeTab === "roles" && (
              <RolesTab roles={mockRoles} />
            )}
            {activeTab === "permissions" && (
              <PermissionsTab 
                permissions={mockPermissions}
                roles={rolesForPermissions}
                rolePermissions={mockRolePermissions}
              />
            )}
          </div>
        </div>
      </main>
    </>
  );
}
