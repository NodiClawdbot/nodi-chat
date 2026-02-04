import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function parseAllowedEmails(raw: string | undefined): Set<string> {
  return new Set(
    (raw ?? "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
  );
}

export default withAuth(
  function middleware(req: NextRequest) {
    const pathname = req.nextUrl.pathname;

    // Public paths
    if (pathname === "/") return NextResponse.next();
    if (pathname.startsWith("/api/auth")) return NextResponse.next();
    if (pathname.startsWith("/_next")) return NextResponse.next();
    if (pathname.startsWith("/favicon.ico")) return NextResponse.next();

    const tokenEmail = (req as unknown as { nextauth?: { token?: { email?: string } } }).nextauth?.token?.email;
    if (!tokenEmail) {
      return NextResponse.redirect(new URL("/api/auth/signin", req.url));
    }

    const allowed = parseAllowedEmails(process.env.ALLOWED_EMAILS);
    if (allowed.size > 0 && !allowed.has(tokenEmail.toLowerCase())) {
      return NextResponse.json({ error: "not allowed" }, { status: 403 });
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => Boolean(token),
    },
  }
);

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
