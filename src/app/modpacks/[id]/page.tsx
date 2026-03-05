import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ModpackDetail } from "./ModpackDetail";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("modpacks")
    .select("name")
    .eq("id", id)
    .single();

  return { title: data?.name ?? "Modpack" };
}

export default async function ModpackPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: modpack } = await supabase
    .from("modpacks")
    .select("*")
    .eq("id", id)
    .eq("user_id", user!.id)
    .single();

  if (!modpack) notFound();

  return <ModpackDetail modpack={modpack} />;
}
