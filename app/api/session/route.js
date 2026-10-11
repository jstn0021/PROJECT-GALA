import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSession();
    return NextResponse.json({
      isLoggedIn: Boolean(session),
      user: session
        ? {
          id: session.uid,
          name: session.name,
          email: session.email,
        }
        : null,
    });
  } catch (err) {
    return NextResponse.json({ isLoggedIn: false, user: null });
  }
}
