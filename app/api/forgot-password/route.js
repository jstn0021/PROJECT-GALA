import { NextResponse } from "next/server";
import crypto from "crypto";
import db from "../../../db/models/index.js";

export async function POST(req) {
  try {
    const { email } = await req.json();
    const user = await db.User.findOne({
      where: { email: (email || "").trim().toLowerCase() },
    });

    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      user.resetToken = crypto.createHash("sha256").update(token).digest("hex");
      user.resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      await user.save();

      console.log(
        `\nPASSWORD RESET LINK:\nhttp://localhost:3000/reset-password?token=${token}\n`,
      );
    }

    return NextResponse.json({
      message: "If that email exists, a reset link has been sent.",
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error_message: "Server error" },
      { status: 500 },
    );
  }
}
