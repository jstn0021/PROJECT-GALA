import { redirect } from "next/navigation";
import { Background } from "app/components/AuthCard";
import Navbar from "app/components/Navbar";
import { getAdmin } from "lib/adminAuth";
import AdminTabs from "./AdminTabs";
import User from "db/models/user";
import AdminClient from "./AdminClient";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const admin = await getAdmin();
  if (!admin) redirect("/dashboard");

  const rows = await User.findAll({
    attributes: ["id", "fullName", "email", "role", "disabled", "createdAt"],
    order: [["createdAt", "DESC"]],
  });
  const users = rows.map((u) => ({
    id: u.id,
    fullName: u.fullName,
    email: u.email,
    role: u.role,
    disabled: u.disabled,
    createdAt: u.createdAt.toISOString(),
  }));

  return (
    <Background>
      <div className="flex min-h-screen w-full flex-col gap-5 px-4 py-4 text-white md:px-8 md:py-6 xl:px-12">
        <Navbar />
        <main>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">Admin</h1>
          <AdminTabs active="users" />
          <p className="mt-4 text-white/70">
            Manage accounts. {users.length} total.
          </p>
          <AdminClient users={users} currentId={admin.id} />
        </main>
      </div>
    </Background>
  );
}
