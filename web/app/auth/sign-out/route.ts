import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getAppUrl, getBackendUrl } from "@/lib/constants/api";

/**
 * Sign out handler - clears session cookie and redirects to sign-in
 */
export async function GET() {
  const cookieStore = await cookies();

  // Call backend logout endpoint to invalidate session
  try {
    const apiUrl = getBackendUrl();
    const sessionCookie = cookieStore.get("wos-session")?.value;

    if (sessionCookie) {
      await fetch(`${apiUrl}/auth/logout`, {
        method: "POST",
        headers: {
          Cookie: `wos-session=${sessionCookie}`,
        },
      });
    }
  } catch (err) {
    console.error("Backend logout error:", err);
    // Continue with local logout even if backend fails
  }

  // Clear the session cookie
  cookieStore.delete("wos-session");

  // Redirect to sign-in page
  return NextResponse.redirect(new URL("/auth/sign-in", getAppUrl()));
}

export async function POST() {
  return GET();
}

