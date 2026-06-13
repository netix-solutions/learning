"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { childEmail, childPassword } from "@/lib/auth";

export type FormState = { error: string | null };

/** Parent creates an account (email + password). */
export async function signUpParent(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!name) return { error: "Please enter your name." };
  if (!email) return { error: "Please enter your email." };
  if (password.length < 8)
    return { error: "Password must be at least 8 characters." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { role: "parent", display_name: name } },
  });

  if (error) return { error: error.message };
  redirect("/parent");
}

/** Parent signs in. */
export async function signInParent(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password)
    return { error: "Please enter your email and password." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { error: "Hmm, that email or password didn't work." };
  redirect("/parent");
}

/** Kid signs in with username + PIN. */
export async function signInChild(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const username = String(formData.get("username") ?? "").trim();
  const pin = String(formData.get("pin") ?? "").trim();

  if (!username || !pin)
    return { error: "Type your username and your secret PIN!" };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: childEmail(username),
    password: childPassword(pin),
  });

  if (error)
    return { error: "Oops! Check your username and PIN and try again." };
  redirect("/home");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
