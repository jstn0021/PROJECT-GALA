// app/api/avatar/route.js
import { NextResponse } from "next/server";
import { uploadObject, publicUrl } from "@/lib/supabaseStorage"; // I-adjust ang path kung saan nakalagay ang storage helper mo

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json(
        { error: "Walang file na na-upload." },
        { status: 400 },
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Dapat ay image file lamang." },
        { status: 400 },
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Dapat mas maliit sa 5 MB ang image." },
        { status: 400 },
      );
    }

    // Convert file to Buffer para sa uploadObject helper mo
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Dynamic filename para sa bucket
    const fileExtension = file.type.split("/")[1] || "jpeg";
    const fileName = `avatars/avatar-${Date.now()}.${fileExtension}`;

    // Upload gamit ang custom function mo
    await uploadObject(fileName, buffer, file.type);

    // Kunin ang permanent public URL
    const url = publicUrl(fileName);

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Avatar Upload Error:", error);
    return NextResponse.json(
      { error: error.message || "Nagka-error sa pag-upload ng image." },
      { status: 500 },
    );
  }
}
