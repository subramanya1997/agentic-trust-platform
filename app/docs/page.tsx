"use client";

import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  FileText, 
  Video, 
  Code2, 
  Sparkles,
  ArrowRight,
  Bell,
  BookOpen
} from "lucide-react";

const upcomingFeatures = [
  {
    icon: FileText,
    title: "Getting Started Guides",
    description: "Step-by-step tutorials to build your first agent",
  },
  {
    icon: Code2,
    title: "API Reference",
    description: "Complete SDK documentation with examples",
  },
  {
    icon: Video,
    title: "Video Tutorials",
    description: "Learn through hands-on video walkthroughs",
  },
  {
    icon: BookOpen,
    title: "Best Practices",
    description: "Architecture patterns and optimization tips",
  },
];

export default function DocsPage() {
  return (
    <>
      <Header subtitle="Documentation — Coming Soon" />
      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-6 py-20">
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/[0.02] rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/[0.02] rounded-full blur-3xl" />
          </div>

          {/* Content */}
          <div className="relative z-10 max-w-2xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-medium mb-5">
              <Sparkles className="w-3 h-3" />
              Coming Soon
            </div>

            <p className="text-sm text-muted-foreground mb-10 max-w-md mx-auto leading-relaxed">
              Comprehensive guides, API references, and tutorials to help you build powerful AI agents with Agentic Trust.
            </p>

            {/* Feature grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
              {upcomingFeatures.map((feature) => (
                <div
                  key={feature.title}
                  className="group p-4 rounded-lg bg-card/40 border border/60 hover:border transition-all text-left"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-md bg-accent/50 group-hover:bg-amber-500/10 transition-colors">
                      <feature.icon className="w-4 h-4 text-foreground0 group-hover:text-amber-500 transition-colors" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-0.5">{feature.title}</h3>
                      <p className="text-xs text-foreground0">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button 
                size="sm"
                className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-stone-950 font-medium px-4 text-xs"
              >
                <Bell className="w-3 h-3 mr-1.5" />
                Get Notified
              </Button>
              <Button 
                size="sm"
                variant="outline" 
                className="border text-muted-foreground hover:bg-accent hover:text-foreground text-xs"
                asChild
              >
                <Link href="/">
                  Back to Dashboard
                  <ArrowRight className="w-3 h-3 ml-1.5" />
                </Link>
              </Button>
            </div>

            {/* Timeline */}
            <div className="mt-12 pt-6">
              <p className="text-xs text-foreground0">
                Expected launch: <span className="text-amber-500 font-medium">Q1 2026</span>
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

