import { NextResponse } from "next/server";
import crypto from "crypto";
import db from "../../../db/models/index.js";
import { sendResetEmail } from "../../../lib/mailer.js";

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

      const baseUrl = process.env.APP_URL || "http://localhost:3000";
      const resetUrl = `${baseUrl}/reset-password?token=${token}`;

      try {
        await sendResetEmail(user.email, user.fullName, resetUrl);
      } catch (mailErr) {
        // Hindi ipinapakita sa user para hindi mahulaan kung may account ang email
        console.error("Failed to send reset email:", mailErr);
      }
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
