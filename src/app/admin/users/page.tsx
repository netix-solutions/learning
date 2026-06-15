import { redirect } from "next/navigation";
import { getAdminUsers, isAdminAuthed } from "@/lib/admin";
import { AdminShell } from "@/components/AdminShell";
import { AdminUsersList } from "@/components/admin/AdminUsersList";

export const metadata = { title: "Users · SummerSharp Admin" };
export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  if (!(await isAdminAuthed())) redirect("/admin/login");

  const users = await getAdminUsers();
  const parents = users.filter((u) => u.role === "parent");
  const students = users.filter((u) => u.role === "student");

  return (
    <AdminShell active="users">
      <h1 className="font-display text-3xl font-bold text-slate-800">Users</h1>
      <p className="mt-1 text-slate-500">
        {users.length} total · {parents.length} parents · {students.length} students
      </p>

      <AdminUsersList parents={parents} students={students} />
    </AdminShell>
  );
}
