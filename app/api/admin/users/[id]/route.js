import { NextResponse } from "next/server";
import { getAdmin } from "lib/adminAuth";
import User from "db/models/user";

const fail = (message, status) =>
  NextResponse.json({ error_message: message }, { status });

// Hindi puwedeng galawin ang sarili o ibang superadmin.
async function loadTarget(admin, params) {
  const { id } = await params;
  const target = await User.findByPk(id);
  if (!target) return { error: fail("User not found", 404) };
  if (String(target.id) === String(admin.id) || target.role === "superadmin") {
    return { error: fail("You can't change this account", 400) };
  }
  return { target };
}

// Disable / enable: body { disabled: true | false }
export async function PATCH(req, { params }) {
  const admin = await getAdmin();
  if (!admin) return fail("Forbidden", 403);

  const { disabled } = await req.json().catch(() => ({}));
  if (typeof disabled !== "boolean") return fail("Invalid request", 400);

  const { target, error } = await loadTarget(admin, params);
  if (error) return error;

  await target.update({ disabled });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req, { params }) {
  const admin = await getAdmin();
  if (!admin) return fail("Forbidden", 403);

  const { target, error } = await loadTarget(admin, params);
  if (error) return error;

  await target.destroy();
  return NextResponse.json({ ok: true });
}
