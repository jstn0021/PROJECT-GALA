import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import db from "../../../db/models/index.js";

export async function POST(req) {
  try {
    const { fullName, email, password } = await req.json();
    const cleanEmail = (email || "").trim().toLowerCase();

    if (!fullName?.trim() || !cleanEmail || !password || password.length < 8) {
      return NextResponse.json(
        { error_message: "Invalid input" },
        { status: 400 },
      );
    }

    const exists = await db.User.findOne({ where: { email: cleanEmail } });
    if (exists) {
      return NextResponse.json(
        { error_message: "Email already in use" },
        { status: 409 },
      );
    }

    await db.User.create({
      fullName: fullName.trim(),
      email: cleanEmail,
      passwordHash: await bcrypt.hash(password, 10),
    });

    return NextResponse.json({ message: "Account created" }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error_message: "Server error" },
      { status: 500 },
    );
  }
}
