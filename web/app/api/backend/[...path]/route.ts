import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { getBackendUrl } from "@/lib/constants/api";

const BACKEND_URL = getBackendUrl();

/**
 * API proxy that forwards requests to the backend with cookies
 * This ensures cookies are properly forwarded across different ports
 */
async function proxyRequest(request: NextRequest, path: string) {
  const cookieStore = await cookies();
  
  // Build the backend URL
  const url = new URL(path, BACKEND_URL);
  
  // Forward query parameters
  request.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.set(key, value);
  });

  // Build headers, including cookies
  const headers: Record<string, string> = {
    "Content-Type": request.headers.get("Content-Type") || "application/json",
  };

  // Forward all relevant cookies to backend
  const cookiesToForward = ["wos-session", "oauth_state"];
  const cookieValues: string[] = [];
  
  for (const cookieName of cookiesToForward) {
    const cookie = cookieStore.get(cookieName);
    if (cookie?.value) {
      cookieValues.push(`${cookieName}=${cookie.value}`);
    }
  }
  
  if (cookieValues.length > 0) {
    headers["Cookie"] = cookieValues.join("; ");
  }

  // Forward X-Organization-ID if present
  const orgId = request.headers.get("X-Organization-ID");
  if (orgId) {
    headers["X-Organization-ID"] = orgId;
  }

  // Get request body for non-GET requests
  let body: string | undefined;
  if (request.method !== "GET" && request.method !== "HEAD") {
    try {
      body = await request.text();
    } catch {
      // No body
    }
  }

  // Make the request to backend
  const response = await fetch(url.toString(), {
    method: request.method,
    headers,
    body,
  });

  // Forward the response
  const responseData = await response.text();
  
  // Build response headers - forward Set-Cookie from backend
  const responseHeaders = new Headers({
    "Content-Type": response.headers.get("Content-Type") || "application/json",
  });
  
  // Forward all Set-Cookie headers from backend to browser
  const setCookieHeaders = response.headers.getSetCookie();
  for (const setCookie of setCookieHeaders) {
    responseHeaders.append("Set-Cookie", setCookie);
  }
  
  return new NextResponse(responseData, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, "/" + path.join("/"));
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, "/" + path.join("/"));
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, "/" + path.join("/"));
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, "/" + path.join("/"));
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, "/" + path.join("/"));
}

