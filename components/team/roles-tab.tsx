"use client";

import { useState } from "react";
import { DataTable, TableRow, TableCell } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Edit2, Trash2 } from "@/lib/icons";

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
                <label className="text-muted-foreground mb-2 block text-sm font-medium">
                  Role Name
                </label>
                <input
                  type="text"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  placeholder="e.g., Developer"
                  className="bg-accent text-foreground w-full rounded-lg border px-4 py-2 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-muted-foreground mb-2 block text-sm font-medium">
                  Description
                </label>
                <input
                  type="text"
                  value={newRoleDescription}
                  onChange={(e) => setNewRoleDescription(e.target.value)}
                  placeholder="What can this role do?"
                  className="bg-accent text-foreground w-full rounded-lg border px-4 py-2 text-sm focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  className="bg-amber-600 text-white hover:bg-amber-500"
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
          <DataTable
            headers={[
              { label: "Role", align: "left" },
              { label: "Description", align: "left" },
              { label: "Members", align: "left" },
              { label: "Type", align: "left" },
              { label: "Actions", align: "right" },
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
                <TableCell className="px-4 py-3 whitespace-nowrap">
                  <span className="text-muted-foreground text-sm">{role.memberCount}</span>
                </TableCell>
                <TableCell className="px-4 py-3 whitespace-nowrap">
                  <span className="text-foreground0 text-sm">
                    {role.isSystem ? "System" : role.isDefault ? "Default" : "Custom"}
                  </span>
                </TableCell>
                <TableCell className="px-4 py-3 text-right whitespace-nowrap">
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
                        className="text-red-400 hover:bg-red-950 hover:text-red-300"
                        onClick={() => onDeleteRole?.(role.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </DataTable>
        </CardContent>
      </Card>
    </div>
  );
}
