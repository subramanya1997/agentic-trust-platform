"use client";

import { useState, Fragment } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Check, X, ChevronDown, ChevronRight } from "lucide-react";

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

  return (
    <Card className="bg-card border">
      <CardContent className="p-0">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-1/3">
                Permission
              </th>
              {roles.map((role) => (
                <th key={role.id} className="px-4 py-4 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {role.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(permissionsByCategory).map(([category, perms]) => {
              const isExpanded = expandedCategories.includes(category);
              
              return (
                <Fragment key={category}>
                  {/* Category Header */}
                  <tr 
                    className="bg-accent/30 cursor-pointer hover:bg-accent/50"
                    onClick={() => toggleCategory(category)}
                  >
                    <td colSpan={roles.length + 1} className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-foreground0" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-foreground0" />
                        )}
                        <span className="text-sm font-medium text-muted-foreground">{category}</span>
                        <span className="text-xs text-foreground0">({perms.length})</span>
                      </div>
                    </td>
                  </tr>
                  
                  {/* Permission Rows */}
                  {isExpanded && perms.map((permission) => (
                    <tr
                      key={permission.id}
                      className="border-b border/50 hover:bg-accent/30"
                    >
                      <td className="px-6 py-3 pl-12">
                        <div>
                          <span className="text-sm text-muted-foreground">{permission.name}</span>
                          <p className="text-xs text-foreground0 mt-0.5">{permission.description}</p>
                        </div>
                      </td>
                      {roles.map((role) => {
                        const hasPerm = hasPermission(role.id, permission.id);
                        return (
                          <td key={role.id} className="px-4 py-3 text-center">
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
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
