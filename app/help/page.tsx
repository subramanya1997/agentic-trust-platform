"use client";

import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import {
  MessageCircle,
  Headphones,
  Users,
  Sparkles,
  ArrowRight,
  Bell,
  Mail,
  Github,
  MessageSquare,
} from "@/lib/icons";

const supportChannels = [
  {
    icon: MessageCircle,
    title: "Live Chat Support",
    description: "Real-time assistance from our support team",
    eta: "24/7 availability",
  },
  {
    icon: Headphones,
    title: "Priority Support",
    description: "Dedicated support for enterprise customers",
    eta: "< 1hr response",
  },
  {
    icon: Users,
    title: "Community Forum",
    description: "Connect with other Agentic Trust developers",
    eta: "Active community",
  },
  {
    icon: MessageSquare,
    title: "AI Assistant",
    description: "Get instant answers powered by AI",
    eta: "Instant response",
  },
];

const contactOptions = [
  { icon: Mail, label: "support@agentictrust.com", href: "mailto:support@agentictrust.com" },
  { icon: Github, label: "GitHub Discussions", href: "#" },
];

export default function HelpPage() {
  return (
    <>
      <Header subtitle="Help Center — Coming Soon" />
      <main className="flex-1 overflow-x-hidden overflow-y-auto">
        <div className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-6 py-20">
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/3 right-1/3 h-[500px] w-[500px] rounded-full bg-amber-500/[0.02] blur-3xl" />
            <div className="absolute bottom-1/3 left-1/3 h-[400px] w-[400px] rounded-full bg-orange-500/[0.02] blur-3xl" />
          </div>

          {/* Content */}
          <div className="relative z-10 mx-auto max-w-2xl text-center">
            {/* Badge */}
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-500">
              <Sparkles className="h-3 w-3" />
              Coming Soon
            </div>

            <p className="text-muted-foreground mx-auto mb-10 max-w-md text-sm leading-relaxed">
              We&apos;re building a comprehensive help center to ensure you get the support you
              need, when you need it.
            </p>

            {/* Support channels grid */}
            <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {supportChannels.map((channel) => (
                <div
                  key={channel.title}
                  className="group bg-card/40 border/60 relative overflow-hidden rounded-lg border p-4 text-left transition-all hover:border"
                >
                  <div className="absolute top-0 right-0 rounded-bl-md bg-amber-500/5 px-2 py-0.5 text-[10px] font-medium text-amber-500/60">
                    {channel.eta}
                  </div>
                  <div className="mt-1 flex items-start gap-3">
                    <div className="bg-accent/50 rounded-md p-2 transition-all group-hover:bg-amber-500/10">
                      <channel.icon className="text-foreground0 h-4 w-4 transition-colors group-hover:text-amber-500" />
                    </div>
                    <div>
                      <h3 className="text-muted-foreground mb-0.5 text-sm font-medium">
                        {channel.title}
                      </h3>
                      <p className="text-foreground0 text-xs">{channel.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Contact options */}
            <div className="bg-card/30 border/50 mb-8 flex flex-wrap items-center justify-center gap-4 rounded-lg border px-6 py-4">
              <span className="text-foreground0 text-xs">In the meantime, reach us at:</span>
              {contactOptions.map((option) => (
                <a
                  key={option.label}
                  href={option.href}
                  className="text-muted-foreground inline-flex items-center gap-1.5 text-xs transition-colors hover:text-amber-500"
                >
                  <option.icon className="h-3 w-3" />
                  {option.label}
                </a>
              ))}
            </div>

            {/* CTA */}
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                size="sm"
                className="bg-gradient-to-r from-amber-500 to-orange-600 px-4 text-xs font-medium text-stone-950 hover:from-amber-600 hover:to-orange-700"
              >
                <Bell className="mr-1.5 h-3 w-3" />
                Notify Me When Ready
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
