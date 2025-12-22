import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { getBackendUrl } from "@/lib/constants/api";
import { SESSION_COOKIE_CONFIG } from "@/lib/auth/session";

/**
 * OAuth callback handler
 * Receives the authorization code from WorkOS and exchanges it via the backend
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  // Handle OAuth errors
  if (error) {
    console.error("OAuth error:", error, errorDescription);
    return NextResponse.redirect(
      new URL(`/auth/sign-in?error=${encodeURIComponent(error)}`, request.url),
    );
  }

  // Validate code is present
  if (!code) {
    console.error("No authorization code received");
    return NextResponse.redirect(new URL("/auth/sign-in?error=no_code", request.url));
  }

  try {
    const apiUrl = getBackendUrl();
    const cookieStore = await cookies();

    // Build callback URL with both code and state
    const callbackUrl = new URL("/auth/callback", apiUrl);
    callbackUrl.searchParams.set("code", code);
    if (state) {
      callbackUrl.searchParams.set("state", state);
    }

    // Get oauth_state cookie to forward to backend
    const oauthStateCookie = cookieStore.get("oauth_state");
    
    // Build headers including oauth_state cookie
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    
    if (oauthStateCookie?.value) {
      headers["Cookie"] = `oauth_state=${oauthStateCookie.value}`;
    }

    // Exchange code for session via backend
    const response = await fetch(callbackUrl.toString(), {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Backend auth callback failed:", response.status, errorData);
      return NextResponse.redirect(new URL("/auth/sign-in?error=auth_failed", request.url));
    }

    // Get all Set-Cookie headers from backend response
    const setCookieHeaders = response.headers.getSetCookie();

    // Create redirect response
    const redirectResponse = NextResponse.redirect(new URL("/", request.url));

    // Forward all cookies from backend to browser
    if (setCookieHeaders.length > 0) {
      const cookieStore = await cookies();
      
      for (const setCookieHeader of setCookieHeaders) {
        // Parse and set each cookie - handle = characters in cookie value (common in base64)
        const cookieParts = setCookieHeader.split(";")[0];
        const firstEquals = cookieParts.indexOf("=");

        if (firstEquals !== -1) {
          const cookieName = cookieParts.substring(0, firstEquals).trim();
          const cookieValue = cookieParts.substring(firstEquals + 1).trim();

          if (cookieName && cookieValue) {
            // Use appropriate config based on cookie type
            if (cookieName === "wos-session") {
              cookieStore.set(cookieName, cookieValue, SESSION_COOKIE_CONFIG);
            } else {
              // For other cookies like oauth_state (which should be deleted), 
              // let the backend handle the cookie attributes
              cookieStore.set(cookieName, cookieValue);
            }
          }
        }
      }
    }

    return redirectResponse;
  } catch (err) {
    console.error("Auth callback error:", err);
    return NextResponse.redirect(new URL("/auth/sign-in?error=server_error", request.url));
  }
}

