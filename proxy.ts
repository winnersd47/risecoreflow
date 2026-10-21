import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "risecoreflow-dev-secret-32chars!!"
);

// Pages that require auth
const PROTECTED = ["/projects", "/profile", "/notifications", "/admin"];
// Pages only for guests
const GUEST_ONLY = ["/login", "/register"];
// Growth Suite routes — require Pro plan
const PRO_ROUTES = ["growth", "experiments", "campaigns", "competitors", "icps"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("rcf_token")?.value;

  // 1. Auth check
  const payload = token ? await decodeJWT(token) : null;
  const isAuthenticated = !!payload;

  if (PROTECTED.some(p => pathname.startsWith(p)) && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (GUEST_ONLY.some(p => pathname.startsWith(p)) && isAuthenticated) {
    return NextResponse.redirect(new URL("/projects", request.url));
  }

  // 2. Pro plan check for Growth Suite pages
  // Pattern: /projects/[id]/(growth|experiments|campaigns|competitors|icps)
  const proRouteMatch = pathname.match(
    /^\/projects\/[^/]+\/(growth|experiments|campaigns|competitors|icps)(\/|$)/
  );
  if (proRouteMatch) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const plan = payload?.plan as string ?? "free";
    const isPro = plan === "pro" || plan === "agency";

    if (!isPro) {
      // Extract project ID to redirect to the right upgrade page
      const projectId = pathname.split("/")[2];
      return NextResponse.redirect(
        new URL(`/projects/${projectId}/upgrade`, request.url)
      );
    }
  }

  return NextResponse.next();
}

async function decodeJWT(token: string): Promise<{ userId: string; plan: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { userId: string; plan: string };
  } catch {
    return null;
  }
}

export const config = {
  matcher: [
    "/projects/:path*",
    "/profile/:path*",
    "/notifications/:path*",
    "/admin/:path*",
    "/login",
    "/register",
  ],
};
