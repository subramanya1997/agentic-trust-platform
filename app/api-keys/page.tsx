"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import { DataTable, TableRow, TableCell } from "@/components/data-table";
import {
  Copy,
  Eye,
  EyeOff,
  Check,
  Plus,
  Shield,
  Trash2,
} from "@/lib/icons";

const apiKeys = [
  { id: "1", name: "Production API Key", prefix: "nx_prod_", created: "Oct 15, 2024", lastUsed: "2 hours ago" },
  { id: "2", name: "Development API Key", prefix: "nx_dev_", created: "Nov 1, 2024", lastUsed: "1 day ago" },
  { id: "3", name: "CI/CD Pipeline", prefix: "nx_ci_", created: "Nov 20, 2024", lastUsed: "5 mins ago" },
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
          <Button size="sm" className="bg-amber-600 hover:bg-amber-500 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Create Key
          </Button>
        }
      />
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-6">
        <div className="space-y-6 min-w-0">

          <Card className="bg-card border">
            <CardContent className="p-0">
              <DataTable
                headers={[
                  { label: 'Name', align: 'left' },
                  { label: 'Key', align: 'left' },
                  { label: 'Created', align: 'left' },
                  { label: 'Last Used', align: 'left' },
                  { label: 'Actions', align: 'right' },
                ]}
              >
                {apiKeys.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm font-medium text-foreground">{key.name}</span>
                    </TableCell>
                    <TableCell className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <code className="text-sm text-muted-foreground font-mono">
                          {showKey === key.id ? `${key.prefix}xxxxxxxxxxxx` : `${key.prefix}••••••••••••`}
                        </code>
                        <button
                          onClick={() => setShowKey(showKey === key.id ? null : key.id)}
                          className="text-foreground0 hover:text-muted-foreground"
                        >
                          {showKey === key.id ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
                      <span className="text-sm text-muted-foreground">{key.created}</span>
                    </TableCell>
                    <TableCell className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm text-muted-foreground">{key.lastUsed}</span>
                    </TableCell>
                    <TableCell className="px-4 py-3 whitespace-nowrap text-right">
                      <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-950">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </DataTable>
            </CardContent>
          </Card>

          <Card className="bg-blue-500/10 border-blue-500/20">
            <CardContent className="p-4 flex items-start gap-3">
              <Shield className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Keep your API keys secure</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Never share your API keys in public repositories or client-side code. Rotate keys regularly.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
