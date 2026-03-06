import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Plus } from "lucide-react";

export const metadata: Metadata = {
  title: "Dashboard",
};

type ModpackRow = {
  id: string;
  name: string;
  description: string | null;
  minecraft_version: string;
  mod_loader: string;
  mod_loader_version: string;
  logo_url: string | null;
  version: string;
  updated_at: string;
  modpack_mods: { count: number }[];
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch modpacks with mod count
  const { data: modpacks, error } = (await supabase
    .from("modpacks")
    .select(
      `
      id,
      name,
      description,
      minecraft_version,
      mod_loader,
      mod_loader_version,
      logo_url,
      version,
      updated_at,
      modpack_mods(count)
    `
    )
    .eq("user_id", user!.id)
    .order("updated_at", { ascending: false })) as {
    data: ModpackRow[] | null;
    error: { message: string } | null;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            My Modpacks
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {modpacks?.length
              ? `${modpacks.length} pack${modpacks.length !== 1 ? "s" : ""}`
              : "No modpacks yet — create your first one"}
          </p>
        </div>

        <Link
          href="/modpacks/new"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Modpack
        </Link>
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">
            Failed to load modpacks. Please refresh the page.
          </p>
        </div>
      )}

      {/* Empty state */}
      {!error && (!modpacks || modpacks.length === 0) && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 py-20 text-center">
          <div className="mb-4 rounded-full bg-primary/10 p-4">
            <Plus className="h-8 w-8 text-primary" />
          </div>
          <h2 className="font-display text-lg font-semibold text-foreground">
            No modpacks yet
          </h2>
          <p className="mt-1 text-sm text-muted-foreground max-w-xs">
            Create your first modpack to start assembling mods and exporting
            for the CurseForge launcher.
          </p>
          <Link
            href="/modpacks/new"
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create Modpack
          </Link>
        </div>
      )}

      {/* Modpack grid */}
      {modpacks && modpacks.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {modpacks.map((pack) => {
            const modCount =
              (pack.modpack_mods as unknown as { count: number }[])?.[0]
                ?.count ?? 0;
            return (
              <Link
                key={pack.id}
                href={`/modpacks/${pack.id}`}
                className="group rounded-xl border border-border bg-card p-5 hover:border-primary/50 hover:bg-accent/50 transition-all duration-200 hover:shadow-lg hover:shadow-primary/5"
              >
                {/* Logo */}
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-muted border border-border overflow-hidden">
                  {pack.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={pack.logo_url}
                      alt={pack.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="font-display text-xl font-bold text-muted-foreground">
                      {pack.name[0].toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Info */}
                <h3 className="font-display font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                  {pack.name}
                </h3>
                {pack.description && (
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                    {pack.description}
                  </p>
                )}

                {/* Tags */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground border border-border">
                    MC {pack.minecraft_version}
                  </span>
                  <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary border border-primary/20 capitalize">
                    {pack.mod_loader}
                  </span>
                </div>

                {/* Footer */}
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{modCount} mod{modCount !== 1 ? "s" : ""}</span>
                  <span>v{pack.version}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
