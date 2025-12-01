"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import {
  Copy,
  Eye,
  EyeOff,
  Check,
  Plus,
  Shield,
  Trash2,
} from "lucide-react";

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
        actionButton={
          <Button size="sm" className="bg-amber-600 hover:bg-amber-500 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Create Key
          </Button>
        }
      />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-stone-50">API Keys</h1>
            <p className="mt-1 text-sm text-stone-400">Manage API keys for programmatic access</p>
          </div>

          <Card className="bg-stone-900 border-stone-800">
            <CardContent className="p-0">
              <table className="min-w-full divide-y divide-stone-800">
                <thead>
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-stone-400 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-stone-400 uppercase tracking-wider">
                      Key
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-stone-400 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-stone-400 uppercase tracking-wider">
                      Last Used
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-stone-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800">
                  {apiKeys.map((key) => (
                    <tr key={key.id} className="hover:bg-stone-800/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-stone-100">{key.name}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <code className="text-sm text-stone-400 font-mono">
                            {showKey === key.id ? `${key.prefix}xxxxxxxxxxxx` : `${key.prefix}••••••••••••`}
                          </code>
                          <button
                            onClick={() => setShowKey(showKey === key.id ? null : key.id)}
                            className="text-stone-500 hover:text-stone-300"
                          >
                            {showKey === key.id ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => copyToClipboard(key.id)}
                            className="text-stone-500 hover:text-stone-300"
                          >
                            {copied === key.id ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-stone-400">{key.created}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-stone-400">{key.lastUsed}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-950">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <Card className="bg-amber-950/30 border-amber-800/50">
            <CardContent className="p-4 flex items-start gap-3">
              <Shield className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-200">Keep your API keys secure</p>
                <p className="text-xs text-amber-300/70 mt-1">
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
