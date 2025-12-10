"use client";

import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  MessageCircle, 
  Headphones, 
  Users,
  Sparkles,
  ArrowRight,
  Bell,
  Mail,
  Github,
  MessageSquare
} from "lucide-react";

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
      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-6 py-20">
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/3 right-1/3 w-[500px] h-[500px] bg-amber-500/[0.02] rounded-full blur-3xl" />
            <div className="absolute bottom-1/3 left-1/3 w-[400px] h-[400px] bg-orange-500/[0.02] rounded-full blur-3xl" />
          </div>

          {/* Content */}
          <div className="relative z-10 max-w-2xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-medium mb-5">
              <Sparkles className="w-3 h-3" />
              Coming Soon
            </div>

            <p className="text-sm text-muted-foreground mb-10 max-w-md mx-auto leading-relaxed">
              We&apos;re building a comprehensive help center to ensure you get the support you need, when you need it.
            </p>

            {/* Support channels grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {supportChannels.map((channel) => (
                <div
                  key={channel.title}
                  className="group relative p-4 rounded-lg bg-card/40 border border/60 hover:border transition-all text-left overflow-hidden"
                >
                  <div className="absolute top-0 right-0 px-2 py-0.5 text-[10px] font-medium text-amber-500/60 bg-amber-500/5 rounded-bl-md">
                    {channel.eta}
                  </div>
                  <div className="flex items-start gap-3 mt-1">
                    <div className="p-2 rounded-md bg-accent/50 group-hover:bg-amber-500/10 transition-all">
                      <channel.icon className="w-4 h-4 text-foreground0 group-hover:text-amber-500 transition-colors" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-0.5">{channel.title}</h3>
                      <p className="text-xs text-foreground0">{channel.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Contact options */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-8 py-4 px-6 rounded-lg bg-card/30 border border/50">
              <span className="text-xs text-foreground0">In the meantime, reach us at:</span>
              {contactOptions.map((option) => (
                <a
                  key={option.label}
                  href={option.href}
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-amber-500 transition-colors"
                >
                  <option.icon className="w-3 h-3" />
                  {option.label}
                </a>
              ))}
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button 
                size="sm"
                className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-stone-950 font-medium px-4 text-xs"
              >
                <Bell className="w-3 h-3 mr-1.5" />
                Notify Me When Ready
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

