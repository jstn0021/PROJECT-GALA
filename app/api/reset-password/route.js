import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { Op } from "sequelize";
import db from "../../../db/models/index.js";

export async function POST(req) {
  try {
    const { token, password } = await req.json();
    if (!token || !password || password.length < 8) {
      return NextResponse.json(
        { error_message: "Invalid input" },
        { status: 400 },
      );
    }

    const hashed = crypto.createHash("sha256").update(token).digest("hex");
    const user = await db.User.findOne({
      where: { resetToken: hashed, resetTokenExpires: { [Op.gt]: new Date() } },
    });
    if (!user) {
      return NextResponse.json(
        { error_message: "Link is invalid or expired" },
        { status: 400 },
      );
    }

    user.passwordHash = await bcrypt.hash(password, 10);
    user.resetToken = null;
    user.resetTokenExpires = null;
    await user.save();

    return NextResponse.json({ message: "Password updated" });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error_message: "Server error" },
      { status: 500 },
    );
  }
}
