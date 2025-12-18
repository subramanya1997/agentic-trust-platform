"use client";

import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { FileText, Video, Code2, Sparkles, ArrowRight, Bell, BookOpen } from "@/lib/icons";

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
      <main className="flex-1 overflow-x-hidden overflow-y-auto">
        <div className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-6 py-20">
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-amber-500/[0.02] blur-3xl" />
            <div className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-orange-500/[0.02] blur-3xl" />
          </div>

          {/* Content */}
          <div className="relative z-10 mx-auto max-w-2xl text-center">
            {/* Badge */}
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-500">
              <Sparkles className="h-3 w-3" />
              Coming Soon
            </div>

            <p className="text-muted-foreground mx-auto mb-10 max-w-md text-sm leading-relaxed">
              Comprehensive guides, API references, and tutorials to help you build powerful AI
              agents with Agentic Trust.
            </p>

            {/* Feature grid */}
            <div className="mb-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {upcomingFeatures.map((feature) => (
                <div
                  key={feature.title}
                  className="group bg-card/40 border/60 rounded-lg border p-4 text-left transition-all hover:border"
                >
                  <div className="flex items-start gap-3">
                    <div className="bg-accent/50 rounded-md p-2 transition-colors group-hover:bg-amber-500/10">
                      <feature.icon className="text-foreground0 h-4 w-4 transition-colors group-hover:text-amber-500" />
                    </div>
                    <div>
                      <h3 className="text-muted-foreground mb-0.5 text-sm font-medium">
                        {feature.title}
                      </h3>
                      <p className="text-foreground0 text-xs">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                size="sm"
                className="bg-gradient-to-r from-amber-500 to-orange-600 px-4 text-xs font-medium text-stone-950 hover:from-amber-600 hover:to-orange-700"
              >
                <Bell className="mr-1.5 h-3 w-3" />
                Get Notified
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-muted-foreground hover:bg-accent hover:text-foreground border text-xs"
                asChild
              >
                <Link href="/">
                  Back to Dashboard
                  <ArrowRight className="ml-1.5 h-3 w-3" />
                </Link>
              </Button>
            </div>

            {/* Timeline */}
            <div className="mt-12 pt-6">
              <p className="text-foreground0 text-xs">
                Expected launch: <span className="font-medium text-amber-500">Q1 2026</span>
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
