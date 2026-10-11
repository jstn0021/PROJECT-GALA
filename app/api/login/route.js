import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import db from "../../../db/models/index.js";
import { createSession } from "../../../lib/session.js";

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    const user = await db.User.findOne({
      where: { email: (email || "").trim().toLowerCase() },
    });

    const ok =
      user && (await bcrypt.compare(password || "", user.passwordHash));
    if (!ok) {
      return NextResponse.json(
        { error_message: "Invalid email or password" },
        { status: 401 },
      );
    }

    if (user.disabled) {
      return NextResponse.json(
        { error_message: "Your account has been disabled." },
        { status: 403 },
      );
    }
    await createSession(user);
    return NextResponse.json({ email: user.email, fullName: user.fullName });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error_message: "Server error" },
      { status: 500 },
    );
  }
}
