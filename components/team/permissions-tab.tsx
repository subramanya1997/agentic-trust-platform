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
    <Card className="bg-stone-900 border-stone-800">
      <CardContent className="p-0">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-stone-800">
              <th className="px-6 py-4 text-left text-xs font-medium text-stone-400 uppercase tracking-wider w-1/3">
                Permission
              </th>
              {roles.map((role) => (
                <th key={role.id} className="px-4 py-4 text-center text-xs font-medium text-stone-400 uppercase tracking-wider">
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
                    className="bg-stone-800/30 cursor-pointer hover:bg-stone-800/50"
                    onClick={() => toggleCategory(category)}
                  >
                    <td colSpan={roles.length + 1} className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-stone-500" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-stone-500" />
                        )}
                        <span className="text-sm font-medium text-stone-300">{category}</span>
                        <span className="text-xs text-stone-500">({perms.length})</span>
                      </div>
                    </td>
                  </tr>
                  
                  {/* Permission Rows */}
                  {isExpanded && perms.map((permission) => (
                    <tr
                      key={permission.id}
                      className="border-b border-stone-800/50 hover:bg-stone-800/30"
                    >
                      <td className="px-6 py-3 pl-12">
                        <div>
                          <span className="text-sm text-stone-300">{permission.name}</span>
                          <p className="text-xs text-stone-500 mt-0.5">{permission.description}</p>
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
                                  : "bg-stone-800 text-stone-600 hover:bg-stone-700 hover:text-stone-400"
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
