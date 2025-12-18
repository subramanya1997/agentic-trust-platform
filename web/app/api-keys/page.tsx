"use client";

import { useState } from "react";
import { DataTable, TableRow, TableCell } from "@/components/data-table";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, Eye, EyeOff, Check, Plus, Shield, Trash2 } from "@/lib/icons";

const apiKeys = [
  {
    id: "1",
    name: "Production API Key",
    prefix: "nx_prod_",
    created: "Oct 15, 2024",
    lastUsed: "2 hours ago",
  },
  {
    id: "2",
    name: "Development API Key",
    prefix: "nx_dev_",
    created: "Nov 1, 2024",
    lastUsed: "1 day ago",
  },
  {
    id: "3",
    name: "CI/CD Pipeline",
    prefix: "nx_ci_",
    created: "Nov 20, 2024",
    lastUsed: "5 mins ago",
  },
];

export default function ApiKeysPage() {
  const [showKey, setShowKey] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (keyId: string) => {
    setCopied(keyId);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <>
      <Header
        subtitle="Manage API keys for programmatic access"
        actionButton={
          <Button size="sm" className="bg-amber-600 text-white hover:bg-amber-500">
            <Plus className="mr-2 h-4 w-4" />
            Create Key
          </Button>
        }
      />
      <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
        <div className="min-w-0 space-y-6">
          <Card className="bg-card border">
            <CardContent className="p-0">
              <DataTable
                headers={[
                  { label: "Name", align: "left" },
                  { label: "Key", align: "left" },
                  { label: "Created", align: "left" },
                  { label: "Last Used", align: "left" },
                  { label: "Actions", align: "right" },
                ]}
              >
                {apiKeys.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell className="px-4 py-3 whitespace-nowrap">
                      <span className="text-foreground text-sm font-medium">{key.name}</span>
                    </TableCell>
                    <TableCell className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <code className="text-muted-foreground font-mono text-sm">
                          {showKey === key.id
                            ? `${key.prefix}xxxxxxxxxxxx`
                            : `${key.prefix}••••••••••••`}
                        </code>
                        <button
                          onClick={() => setShowKey(showKey === key.id ? null : key.id)}
                          className="text-foreground0 hover:text-muted-foreground"
                        >
                          {showKey === key.id ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => copyToClipboard(key.id)}
                          className="text-foreground0 hover:text-muted-foreground"
                        >
                          {copied === key.id ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 whitespace-nowrap">
                      <span className="text-muted-foreground text-sm">{key.created}</span>
                    </TableCell>
                    <TableCell className="px-4 py-3 whitespace-nowrap">
                      <span className="text-muted-foreground text-sm">{key.lastUsed}</span>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right whitespace-nowrap">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:bg-red-950 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </DataTable>
            </CardContent>
          </Card>

          <Card className="border-blue-500/20 bg-blue-500/10">
            <CardContent className="flex items-start gap-3 p-4">
              <Shield className="mt-0.5 h-5 w-5 shrink-0 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  Keep your API keys secure
                </p>
                <p className="text-muted-foreground mt-1 text-xs">
                  Never share your API keys in public repositories or client-side code. Rotate keys
                  regularly.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
