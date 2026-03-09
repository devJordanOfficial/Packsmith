"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export async function deleteAccount() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  // Delete modpacks (modpack_mods cascade via FK)
  await supabase.from("modpacks").delete().eq("user_id", user.id);
  // Delete profile
  await supabase.from("profiles").delete().eq("id", user.id);

  // Delete the auth user — requires service role key
  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { error } = await adminClient.auth.admin.deleteUser(user.id);
  if (error) throw new Error(error.message);

  redirect("/auth/login");
}
