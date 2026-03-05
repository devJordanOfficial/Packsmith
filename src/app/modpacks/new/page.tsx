"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { MOD_LOADERS, MINECRAFT_VERSIONS, type ModLoader } from "@/types";

export default function NewModpackPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [minecraftVersion, setMinecraftVersion] = useState(MINECRAFT_VERSIONS[0]);
  const [modLoader, setModLoader] = useState<ModLoader>("forge");
  const [modLoaderVersion, setModLoaderVersion] = useState("");
  const [version, setVersion] = useState("1.0.0");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth/login");
      return;
    }

    const { data, error } = await supabase
      .from("modpacks")
      .insert({
        user_id: user.id,
        name: name.trim(),
        description: description.trim() || null,
        minecraft_version: minecraftVersion,
        mod_loader: modLoader,
        mod_loader_version: modLoaderVersion.trim(),
        version: version.trim(),
      })
      .select("id")
      .single();

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push(`/modpacks/${data.id}`);
  }

  const inputClass = cn(
    "w-full rounded-md border border-input bg-background px-3 py-2",
    "text-sm text-foreground placeholder:text-muted-foreground",
    "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
    "transition-colors duration-150"
  );

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to dashboard
        </Link>
        <h1 className="font-display text-3xl font-bold text-foreground">
          New Modpack
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Set up the basics — you can always edit these later.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-border bg-card p-6 space-y-5"
      >
        {/* Name */}
        <div className="space-y-1.5">
          <label htmlFor="name" className="text-sm font-medium text-foreground">
            Pack Name <span className="text-destructive">*</span>
          </label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My Awesome Pack"
            className={inputClass}
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label htmlFor="description" className="text-sm font-medium text-foreground">
            Description
          </label>
          <textarea
            id="description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="A brief description of your modpack…"
            className={cn(inputClass, "resize-none")}
          />
        </div>

        {/* Minecraft Version */}
        <div className="space-y-1.5">
          <label htmlFor="mc-version" className="text-sm font-medium text-foreground">
            Minecraft Version <span className="text-destructive">*</span>
          </label>
          <select
            id="mc-version"
            required
            value={minecraftVersion}
            onChange={(e) => setMinecraftVersion(e.target.value)}
            className={inputClass}
          >
            {MINECRAFT_VERSIONS.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>

        {/* Mod Loader */}
        <div className="space-y-1.5">
          <label htmlFor="mod-loader" className="text-sm font-medium text-foreground">
            Mod Loader <span className="text-destructive">*</span>
          </label>
          <select
            id="mod-loader"
            required
            value={modLoader}
            onChange={(e) => setModLoader(e.target.value as ModLoader)}
            className={inputClass}
          >
            {MOD_LOADERS.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </div>

        {/* Mod Loader Version */}
        <div className="space-y-1.5">
          <label htmlFor="loader-version" className="text-sm font-medium text-foreground">
            Mod Loader Version <span className="text-destructive">*</span>
          </label>
          <input
            id="loader-version"
            type="text"
            required
            value={modLoaderVersion}
            onChange={(e) => setModLoaderVersion(e.target.value)}
            placeholder="e.g. 47.3.0"
            className={inputClass}
          />
          <p className="text-xs text-muted-foreground">
            The version of {MOD_LOADERS.find((l) => l.value === modLoader)?.label} for MC {minecraftVersion}.
          </p>
        </div>

        {/* Pack Version */}
        <div className="space-y-1.5">
          <label htmlFor="version" className="text-sm font-medium text-foreground">
            Pack Version <span className="text-destructive">*</span>
          </label>
          <input
            id="version"
            type="text"
            required
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            placeholder="1.0.0"
            className={inputClass}
          />
        </div>

        {error && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <div className="flex gap-3 pt-1">
          <button
            type="submit"
            disabled={loading}
            className={cn(
              "flex-1 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground",
              "hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background",
              "transition-all duration-150 disabled:pointer-events-none disabled:opacity-50"
            )}
          >
            {loading ? "Creating…" : "Create Modpack"}
          </button>
          <Link
            href="/dashboard"
            className={cn(
              "rounded-md border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground",
              "hover:bg-accent transition-colors"
            )}
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
