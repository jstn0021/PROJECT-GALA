// app/api/avatar/route.js
import { NextResponse } from "next/server";
import { uploadObject, publicUrl } from "@/lib/supabaseStorage"; // Adjust path if needed
import { getSession } from "@/lib/session";

export async function POST(request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

    // Convert file to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const ALLOWED = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
    };
    const fileExtension = ALLOWED[file.type];
    if (!fileExtension) {
      return NextResponse.json(
        { error: "JPG, PNG, o WebP lang." },
        { status: 400 },
      );
    }

    const fileName = `avatars/${session.uid}-${Date.now()}.${fileExtension}`;

    // 1. Upload the buffer to Supabase Storage
    await uploadObject(fileName, buffer, file.type);

    // 2. Retrieve the public URL
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
