import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const PROTECTED = [
  /*"/dashboard",
  "/my-plans",
  "/bucket-list",
  "/journal",
  "/newplan",
  "/explore",
  "/profile",
  "/activity",
  "/admin",
  "/profile"*/
];

const isUnder = (pathname, base) =>
  pathname === base || pathname.startsWith(base + "/");

export async function proxy(req) {
  const { pathname } = req.nextUrl;
  if (!PROTECTED.some((p) => isUnder(pathname, p))) return NextResponse.next();

  try {
    const token = req.cookies.get("gala_session")?.value;
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET),
    );

    // /admin: superadmin lang. (Muling sine-check sa server/DB ang tunay na role.)
    if (isUnder(pathname, "/admin") && payload.role !== "superadmin") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  } catch {
    const login = new URL("/login", req.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }
}

export const config = { matcher: ["/((?!_next|api|.*\\..*).*)"] };
