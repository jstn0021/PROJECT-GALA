import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import db from "../../../db/models/index.js";

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

    return NextResponse.json({ email: user.email, fullName: user.fullName });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error_message: "Server error" },
      { status: 500 },
    );
  }
}
