"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil, Trash2, Package } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { MOD_LOADERS, type Modpack, type ModLoader } from "@/types";
import { useVersions } from "@/hooks/useVersions";
import { VersionSelectors } from "@/components/modpacks/VersionSelectors";

interface Props {
  modpack: Modpack;
}

export function ModpackDetail({ modpack }: Props) {
  const router = useRouter();
  const { data: versions, loading: versionsLoading } = useVersions();

  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Edit form state — pre-populated from existing modpack
  const [name, setName] = useState(modpack.name);
  const [description, setDescription] = useState(modpack.description ?? "");
  const [minecraftVersion, setMinecraftVersion] = useState(modpack.minecraft_version);
  const [modLoader, setModLoader] = useState<ModLoader>(modpack.mod_loader);
  const [modLoaderVersion, setModLoaderVersion] = useState(modpack.mod_loader_version);
  const [version, setVersion] = useState(modpack.version);

  function cancelEdit() {
    setName(modpack.name);
    setDescription(modpack.description ?? "");
    setMinecraftVersion(modpack.minecraft_version);
    setModLoader(modpack.mod_loader);
    setModLoaderVersion(modpack.mod_loader_version);
    setVersion(modpack.version);
    setError(null);
    setEditing(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaveLoading(true);

    const supabase = createClient();
    const { error } = await supabase
      .from("modpacks")
      .update({
        name: name.trim(),
        description: description.trim() || null,
        minecraft_version: minecraftVersion,
        mod_loader: modLoader,
        mod_loader_version: modLoaderVersion.trim(),
        version: version.trim(),
      })
      .eq("id", modpack.id);

    if (error) {
      setError(error.message);
      setSaveLoading(false);
      return;
    }

    setEditing(false);
    setSaveLoading(false);
    router.refresh();
  }

  async function handleDelete() {
    setDeleteLoading(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("modpacks")
      .delete()
      .eq("id", modpack.id);

    if (error) {
      setError(error.message);
      setDeleteLoading(false);
      setConfirmDelete(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  const inputClass = cn(
    "w-full rounded-md border border-input bg-background px-3 py-2",
    "text-sm text-foreground placeholder:text-muted-foreground",
    "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
    "transition-colors duration-150"
  );

  const loaderLabel = MOD_LOADERS.find((l) => l.value === modpack.mod_loader)?.label ?? modpack.mod_loader;

  return (
    <div className="space-y-8">
      {/* Back */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to dashboard
      </Link>

      {/* Header card */}
      <div className="rounded-xl border border-border bg-card p-6">
        {editing ? (
          <form onSubmit={handleSave} className="space-y-5">
            <h2 className="font-display text-lg font-semibold text-foreground mb-1">
              Edit Modpack
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Name */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-sm font-medium text-foreground">
                  Pack Name <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClass}
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-sm font-medium text-foreground">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={cn(inputClass, "resize-none")}
                />
              </div>

              {/* MC Version + Mod Loader + Loader Version */}
              <div className="sm:col-span-2">
                <VersionSelectors
                  minecraftVersion={minecraftVersion}
                  modLoader={modLoader}
                  modLoaderVersion={modLoaderVersion}
                  onMinecraftVersionChange={setMinecraftVersion}
                  onModLoaderChange={setModLoader}
                  onModLoaderVersionChange={setModLoaderVersion}
                  versions={versions}
                  versionsLoading={versionsLoading}
                />
              </div>

              {/* Pack Version */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-sm font-medium text-foreground">
                  Pack Version <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            {error && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saveLoading}
                className={cn(
                  "rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground",
                  "hover:bg-primary/90 transition-colors disabled:pointer-events-none disabled:opacity-50"
                )}
              >
                {saveLoading ? "Saving…" : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="font-display text-3xl font-bold text-foreground truncate">
                {modpack.name}
              </h1>
              {modpack.description && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {modpack.description}
                </p>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-md bg-muted border border-border px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  MC {modpack.minecraft_version}
                </span>
                <span className="rounded-md bg-primary/10 border border-primary/20 px-2 py-0.5 text-xs font-medium text-primary capitalize">
                  {loaderLabel} {modpack.mod_loader_version}
                </span>
                <span className="rounded-md bg-muted border border-border px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  v{modpack.version}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setEditing(true)}
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </button>

              {confirmDelete ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Sure?</span>
                  <button
                    onClick={handleDelete}
                    disabled={deleteLoading}
                    className="rounded-md bg-destructive px-3 py-2 text-sm font-semibold text-destructive-foreground hover:bg-destructive/90 transition-colors disabled:opacity-50"
                  >
                    {deleteLoading ? "Deleting…" : "Yes, delete"}
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="rounded-md border border-border bg-background px-3 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="inline-flex items-center gap-1.5 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/20 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mods section */}
      <div>
        <h2 className="font-display text-xl font-semibold text-foreground mb-4">
          Mods
        </h2>
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 py-16 text-center">
          <div className="mb-4 rounded-full bg-muted p-4">
            <Package className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-display text-base font-semibold text-foreground">
            No mods yet
          </h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-xs">
            Mod browsing is coming soon. You&apos;ll be able to search CurseForge and add mods directly to this pack.
          </p>
        </div>
      </div>

      {/* Global error (e.g. delete failed) */}
      {error && !editing && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}
    </div>
  );
}
