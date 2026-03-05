import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/Navbar";

export default async function ModpacksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, avatar_url")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        username={profile?.username ?? user.email ?? "User"}
        avatarUrl={profile?.avatar_url ?? null}
      />
      <main className="container mx-auto px-4 py-8 max-w-7xl">{children}</main>
    </div>
  );
}
