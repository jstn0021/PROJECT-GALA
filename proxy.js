import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const PROTECTED = [
  "/dashboard",
  "/my-plans",
  "/bucket-list",
  "/journal",
  "/newplan",
  "/explore",
  "/profile",
  "/activity",
];

export async function proxy(req) {
  const { pathname } = req.nextUrl;
  const needsAuth = PROTECTED.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );
  if (!needsAuth) return NextResponse.next();

  try {
    const token = req.cookies.get("gala_session")?.value;
    await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = { matcher: ["/((?!_next|api|.*\\..*).*)"] };
