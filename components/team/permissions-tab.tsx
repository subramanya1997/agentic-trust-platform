"use client";

import { useState, Fragment } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable, TableRow, TableCell } from "@/components/data-table";
import { Check, X, ChevronDown, ChevronRight } from "@/lib/icons";

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

export interface RolePermission {
  roleId: string;
  roleName: string;
  permissions: string[]; // permission IDs
}

interface PermissionsTabProps {
  permissions: Permission[];
  roles: { id: string; name: string; color: string }[];
  rolePermissions: RolePermission[];
  onTogglePermission?: (roleId: string, permissionId: string) => void;
}

export function PermissionsTab({ permissions, roles, rolePermissions, onTogglePermission }: PermissionsTabProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["Agents", "Integrations"]);

  // Group permissions by category
  const permissionsByCategory = permissions.reduce((acc, perm) => {
    if (!acc[perm.category]) {
      acc[perm.category] = [];
    }
    acc[perm.category].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const hasPermission = (roleId: string, permissionId: string) => {
    const rolePerm = rolePermissions.find((rp) => rp.roleId === roleId);
    return rolePerm?.permissions.includes(permissionId) ?? false;
  };

  const headers = [
    { label: 'Permission', align: 'left' as const, className: 'w-1/3' },
    ...roles.map((role) => ({ label: role.name, align: 'center' as const })),
  ];

  return (
    <Card className="bg-card border">
      <CardContent className="p-0">
        <DataTable headers={headers}>
            {Object.entries(permissionsByCategory).map(([category, perms]) => {
              const isExpanded = expandedCategories.includes(category);
              
              return (
                <Fragment key={category}>
                  {/* Category Header */}
                  <TableRow 
                    className="cursor-pointer"
                    onClick={() => toggleCategory(category)}
                  >
                    <TableCell colSpan={roles.length + 1} className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-foreground0" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-foreground0" />
                        )}
                        <span className="text-sm font-medium text-muted-foreground">{category}</span>
                        <span className="text-xs text-foreground0">({perms.length})</span>
                      </div>
                    </TableCell>
                  </TableRow>
                  
                  {/* Permission Rows */}
                  {isExpanded && perms.map((permission) => (
                    <TableRow
                      key={permission.id}
                    >
                      <TableCell className="px-4 py-3 pl-12">
                        <div>
                          <span className="text-sm text-muted-foreground">{permission.name}</span>
                          <p className="text-xs text-foreground0 mt-0.5">{permission.description}</p>
                        </div>
                      </TableCell>
                      {roles.map((role) => {
                        const hasPerm = hasPermission(role.id, permission.id);
                        return (
                          <TableCell key={role.id} className="px-4 py-3 text-center">
                            <button
                              onClick={() => onTogglePermission?.(role.id, permission.id)}
                              className={`h-8 w-8 rounded-lg flex items-center justify-center mx-auto transition-colors ${
                                hasPerm
                                  ? "bg-green-950 text-green-400 hover:bg-green-900"
                                  : "bg-accent text-stone-600 hover:bg-muted hover:text-muted-foreground"
                              }`}
                            >
                              {hasPerm ? (
                                <Check className="h-4 w-4" />
                              ) : (
                                <X className="h-4 w-4" />
                              )}
                            </button>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </Fragment>
              );
            })}
        </DataTable>
      </CardContent>
    </Card>
  );
}
