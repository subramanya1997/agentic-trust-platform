"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";

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
  onAddRole?: () => void;
  onEditRole?: (roleId: string) => void;
  onDeleteRole?: (roleId: string) => void;
}

export function RolesTab({ roles, onAddRole, onEditRole, onDeleteRole }: RolesTabProps) {
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDescription, setNewRoleDescription] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddRole = () => {
    if (newRoleName) {
      onAddRole?.();
      setNewRoleName("");
      setNewRoleDescription("");
      setShowAddForm(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Add Role Form */}
      {showAddForm && (
        <Card className="bg-card border">
          <CardContent className="p-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Role Name</label>
                <input
                  type="text"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  placeholder="e.g., Developer"
                  className="w-full rounded-lg border border bg-accent px-4 py-2 text-sm text-foreground focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Description</label>
                <input
                  type="text"
                  value={newRoleDescription}
                  onChange={(e) => setNewRoleDescription(e.target.value)}
                  placeholder="What can this role do?"
                  className="w-full rounded-lg border border bg-accent px-4 py-2 text-sm text-foreground focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  className="bg-amber-600 hover:bg-amber-500 text-white"
                  onClick={handleAddRole}
                >
                  Create Role
                </Button>
                <Button 
                  variant="ghost" 
                  className="text-muted-foreground"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Roles Table */}
      <Card className="bg-card border">
        <CardContent className="p-0">
          <table className="min-w-full divide-y divide-stone-800">
            <thead>
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Members
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800">
              {roles.map((role) => (
                <tr key={role.id} className="hover:bg-accent/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-foreground">{role.name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-muted-foreground">{role.description}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-muted-foreground">{role.memberCount}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-foreground0">
                      {role.isSystem ? "System" : role.isDefault ? "Default" : "Custom"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    {!role.isSystem && (
                      <div className="flex items-center justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-foreground0 hover:text-muted-foreground"
                          onClick={() => onEditRole?.(role.id)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-red-400 hover:text-red-300 hover:bg-red-950"
                          onClick={() => onDeleteRole?.(role.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
