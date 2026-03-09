import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { SettingsClient } from "./SettingsClient";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <SettingsClient
      username={profile?.username ?? ""}
      email={user.email ?? ""}
    />
  );
}
