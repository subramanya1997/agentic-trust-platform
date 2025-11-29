import { Card } from "@/components/ui/card";
import { Header } from "@/components/layout/header";

export default function SettingsPage() {
  return (
    <>
      <Header actionButton={null} />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-stone-50">Settings</h1>
            <p className="mt-1 text-sm text-stone-400">
              Manage your organization and preferences
            </p>
          </div>
          <Card className="p-12 text-center">
            <p className="text-stone-400">Settings page coming soon...</p>
          </Card>
        </div>
      </main>
    </>
  );
}
