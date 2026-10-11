import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import db from "../../../db/models/index.js";

export const dynamic = "force-dynamic";
const NO_STORE = { "Cache-Control": "no-store" };
const STYLES = ["Weekend", "Solo", "Family", "Adventure"];

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ role: null }, { headers: NO_STORE });
  }

  // Kung pumalya ang profile lookup (hal. kulang pa ang mga column sa database),
  // mananatili pa rin ang role mula sa session, kaya hindi mawawala ang Admin tab.
  let user = null;
  try {
    user = await db.User.findByPk(session.uid);
  } catch (err) {
    console.error("/api/me profile lookup failed:", err.message);
  }

  return NextResponse.json(
    {
      role: session.role ?? null,
      email: user?.email ?? session.email ?? "",
      name: user?.fullName ?? session.name ?? "",
      avatarUrl: user?.avatarUrl ?? null,
      birthday: user?.birthday ?? "",
      travelStyle: user?.travelStyle ?? "",
      reminders: user?.reminders ?? true,
    },
    { headers: NO_STORE },
  );
}

export async function PATCH(req) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await db.User.findByPk(session.uid);
  if (!user) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();

  // Whitelist lang: hindi mababago dito ang email, role, o password
  if ("name" in body) {
    const n = String(body.name ?? "")
      .trim()
      .slice(0, 80);
    if (n) user.fullName = n;
  }
  if ("avatarUrl" in body) {
    const u = body.avatarUrl;
    if (
      u !== null &&
      !(typeof u === "string" && u.startsWith("https://") && u.length < 500)
    ) {
      return NextResponse.json(
        { error: "Invalid avatar URL" },
        { status: 400 },
      );
    }
    user.avatarUrl = u;
  }
  if ("birthday" in body) {
    const b = body.birthday;
    if (b && !/^\d{4}-\d{2}-\d{2}$/.test(b)) {
      return NextResponse.json({ error: "Invalid birthday" }, { status: 400 });
    }
    user.birthday = b || null;
  }
  if ("travelStyle" in body) {
    const s = body.travelStyle;
    if (s && !STYLES.includes(s)) {
      return NextResponse.json({ error: "Invalid style" }, { status: 400 });
    }
    user.travelStyle = s || null;
  }
  if ("reminders" in body) user.reminders = !!body.reminders;

  await user.save();
  return NextResponse.json({ ok: true });
}

// Soft delete: ginagamit ang existing `disabled` flag (hinaharang na ito ng /api/login).
export async function DELETE() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await db.User.findByPk(session.uid);
  if (user) {
    user.disabled = true;
    await user.save();
  }
  return NextResponse.json({ ok: true });
}
