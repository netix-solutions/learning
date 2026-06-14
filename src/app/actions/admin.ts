"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  ADMIN_COOKIE,
  createAdminToken,
  isAdminAuthed,
  verifyAdminCredentials,
} from "@/lib/admin";

export type AdminFormState = { error: string | null };

/** Admin signs in with the configured email + password. */
export async function adminSignIn(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!email || !password)
    return { error: "Enter your email and password." };

  if (!verifyAdminCredentials(email, password))
    return { error: "Invalid credentials." };

  const store = await cookies();
  store.set(ADMIN_COOKIE, createAdminToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12, // 12h, matches the token TTL
  });

  redirect("/admin");
}

export async function adminSignOut() {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
  redirect("/admin/login");
}

/** Permanently delete a user. Cascades to profile, attempts, badges, links. */
export async function adminDeleteUser(
  userId: string,
): Promise<{ error: string | null }> {
  if (!(await isAdminAuthed())) return { error: "Not authorized." };
  if (!userId) return { error: "Missing user." };

  const db = createAdminClient();
  const { error } = await db.auth.admin.deleteUser(userId);
  if (error) return { error: "Could not delete that user." };

  revalidatePath("/admin/users");
  revalidatePath("/admin");
  return { error: null };
}
