"use client";

import { IconBrandGithub, IconBrandGoogle } from "@tabler/icons-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState<"google" | "github" | null>(null);
  const error = searchParams.get("error");

  const handleOAuthLogin = async (provider: "GoogleOAuth" | "GitHubOAuth") => {
    setIsLoading(provider === "GoogleOAuth" ? "google" : "github");

    try {
      // Use proxy path for client-side requests
      const callbackUrl = `${window.location.origin}/auth/callback`;

      const response = await fetch(
        `/api/backend/auth/login-url?redirect_uri=${encodeURIComponent(callbackUrl)}&provider=${provider}`,
      );

      if (!response.ok) {
        throw new Error("Failed to get authorization URL");
      }

      const data = await response.json();
      window.location.href = data.authorization_url;
    } catch (err) {
      console.error("OAuth error:", err);
      setIsLoading(null);
      router.push("/auth/sign-in?error=oauth_failed");
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side - Branding */}
      <div className="hidden flex-1 flex-col justify-between bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 p-12 lg:flex">
        <div className="flex items-center gap-3">
          <Image
            src="/logo/dark.svg"
            alt="Agentic Trust"
            width={180}
            height={40}
            className="h-10 w-auto"
          />
        </div>

        <div className="max-w-lg">
          <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight text-white">
            Build, Deploy, and Govern AI Agents at Scale
          </h1>
          <p className="text-lg leading-relaxed text-zinc-400">
            Enterprise-grade infrastructure for autonomous AI agents with built-in security,
            observability, and compliance.
          </p>
        </div>

        <div className="text-sm text-zinc-500">
          <p>&copy; {new Date().getFullYear()} Agentic Trust. All rights reserved.</p>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex flex-1 items-center justify-center bg-zinc-950 p-8">
        <div className="w-full max-w-sm space-y-8">
          {/* Mobile logo */}
          <div className="flex items-center justify-center lg:hidden">
            <Image
              src="/logo/dark.svg"
              alt="Agentic Trust"
              width={180}
              height={40}
              className="h-10 w-auto"
            />
          </div>

          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-white">Welcome back</h2>
            <p className="text-zinc-400">Sign in to your account to continue</p>
          </div>

          {error && (
            <div className="rounded-lg bg-red-500/10 p-3 text-center text-sm text-red-400">
              {error === "oauth_failed"
                ? "Authentication failed. Please try again."
                : error === "no_code"
                  ? "No authorization code received."
                  : error === "auth_failed"
                    ? "Authentication failed. Please try again."
                    : "An error occurred. Please try again."}
            </div>
          )}

          <div className="space-y-3">
            <Button
              variant="outline"
              size="lg"
              className="w-full gap-3 border-zinc-700 bg-zinc-900 text-white hover:bg-zinc-800 hover:text-white"
              onClick={() => handleOAuthLogin("GoogleOAuth")}
              disabled={isLoading !== null}
            >
              {isLoading === "google" ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <IconBrandGoogle className="h-5 w-5" />
              )}
              Continue with Google
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="w-full gap-3 border-zinc-700 bg-zinc-900 text-white hover:bg-zinc-800 hover:text-white"
              onClick={() => handleOAuthLogin("GitHubOAuth")}
              disabled={isLoading !== null}
            >
              {isLoading === "github" ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <IconBrandGithub className="h-5 w-5" />
              )}
              Continue with GitHub
            </Button>
          </div>

          <p className="text-center text-xs text-zinc-500">
            By continuing, you agree to our{" "}
            <a href="/terms" className="text-orange-500 hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy" className="text-orange-500 hover:underline">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
