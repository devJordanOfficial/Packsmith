"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { MOD_LOADERS, type ModLoader, type VersionsApiResponse } from "@/types";
import {
  getLoaderVersions,
  getSupportedMcVersions,
  getDefaultLoaderVersion,
  getLoaderVersionLabel,
  getLoaderUnavailableReason,
  loaderSupportsMcVersion,
} from "@/lib/versions";

interface Props {
  minecraftVersion: string;
  modLoader: ModLoader;
  modLoaderVersion: string;
  onMinecraftVersionChange: (v: string) => void;
  onModLoaderChange: (l: ModLoader) => void;
  onModLoaderVersionChange: (v: string) => void;
  versions: VersionsApiResponse | null;
  versionsLoading: boolean;
}

export function VersionSelectors({
  minecraftVersion,
  modLoader,
  modLoaderVersion,
  onMinecraftVersionChange,
  onModLoaderChange,
  onModLoaderVersionChange,
  versions,
  versionsLoading,
}: Props) {
  const inputClass = cn(
    "w-full rounded-md border border-input bg-background px-3 py-2",
    "text-sm text-foreground placeholder:text-muted-foreground",
    "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
    "transition-colors duration-150"
  );

  // MC versions filtered to those that support the current loader
  const mcVersionOptions = useMemo(() => {
    if (!versions) return minecraftVersion ? [minecraftVersion] : [];
    const supported = getSupportedMcVersions(modLoader, versions.minecraft, versions);
    // Always include the currently selected version in case it's an existing value
    if (minecraftVersion && !supported.includes(minecraftVersion)) {
      return [minecraftVersion, ...supported];
    }
    return supported;
  }, [versions, modLoader, minecraftVersion]);

  // Loader versions for the current loader + MC version combination
  const loaderVersionOptions = useMemo(() => {
    if (!versions) return [];
    return getLoaderVersions(modLoader, minecraftVersion, versions);
  }, [versions, modLoader, minecraftVersion]);

  // Include the current value in the select even if it's not in the live list
  const effectiveVersionOptions = useMemo(() => {
    if (!modLoaderVersion || loaderVersionOptions.some((v) => v.version === modLoaderVersion)) {
      return loaderVersionOptions;
    }
    return [{ version: modLoaderVersion, isLatest: false, isRecommended: false }, ...loaderVersionOptions];
  }, [loaderVersionOptions, modLoaderVersion]);

  // Warning shown below the loader buttons if the current selection is incompatible
  const loaderWarning = useMemo(() => {
    if (!versions) return null;
    return getLoaderUnavailableReason(modLoader, minecraftVersion, versions);
  }, [versions, modLoader, minecraftVersion]);

  function handleMcVersionChange(newMcVersion: string) {
    onMinecraftVersionChange(newMcVersion);
    if (!versions) return;
    if (loaderSupportsMcVersion(modLoader, newMcVersion, versions)) {
      const def = getDefaultLoaderVersion(modLoader, newMcVersion, versions);
      if (def) onModLoaderVersionChange(def);
    } else {
      onModLoaderVersionChange("");
    }
  }

  function handleLoaderChange(newLoader: ModLoader) {
    if (!versions) {
      onModLoaderChange(newLoader);
      return;
    }
    const supportedMc = getSupportedMcVersions(newLoader, versions.minecraft, versions);
    const newMcVersion = supportedMc.includes(minecraftVersion)
      ? minecraftVersion
      : (supportedMc[0] ?? minecraftVersion);

    if (newMcVersion !== minecraftVersion) onMinecraftVersionChange(newMcVersion);
    onModLoaderChange(newLoader);

    const def = getDefaultLoaderVersion(newLoader, newMcVersion, versions);
    if (def) onModLoaderVersionChange(def);
  }

  return (
    <div className="space-y-4">
      {/* Minecraft Version */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">
          Minecraft Version <span className="text-destructive">*</span>
        </label>
        <select
          required
          disabled={versionsLoading}
          value={minecraftVersion}
          onChange={(e) => handleMcVersionChange(e.target.value)}
          className={cn(inputClass, versionsLoading && "opacity-50")}
        >
          {versionsLoading ? (
            <option value={minecraftVersion}>{minecraftVersion || "Loading…"}</option>
          ) : (
            mcVersionOptions.map((v) => (
              <option key={v} value={v}>
                {v === versions?.minecraft[0] ? `${v} (latest)` : v}
              </option>
            ))
          )}
        </select>
      </div>

      {/* Mod Loader — button group */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">
          Mod Loader <span className="text-destructive">*</span>
        </label>
        <div className="grid grid-cols-4 gap-2">
          {MOD_LOADERS.map(({ value, label }) => {
            const isSelected = modLoader === value;
            const reason = versions
              ? getLoaderUnavailableReason(value as ModLoader, minecraftVersion, versions)
              : null;
            const isUnavailable = !!reason;
            return (
              <button
                key={value}
                type="button"
                disabled={isUnavailable || versionsLoading}
                title={reason ?? undefined}
                onClick={() => handleLoaderChange(value as ModLoader)}
                className={cn(
                  "rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground"
                    : isUnavailable
                    ? "cursor-not-allowed border-border bg-background text-muted-foreground opacity-40"
                    : "border-border bg-background text-foreground hover:bg-accent"
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
        {loaderWarning && (
          <p className="text-xs text-muted-foreground">{loaderWarning}</p>
        )}
      </div>

      {/* Loader Version */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">
          Loader Version <span className="text-destructive">*</span>
        </label>
        {versionsLoading ? (
          <select disabled className={cn(inputClass, "opacity-50")}>
            <option>Loading…</option>
          </select>
        ) : effectiveVersionOptions.length > 0 ? (
          <select
            required
            value={modLoaderVersion}
            onChange={(e) => onModLoaderVersionChange(e.target.value)}
            className={inputClass}
          >
            {!modLoaderVersion && (
              <option value="" disabled>
                Select a version…
              </option>
            )}
            {effectiveVersionOptions.map((lv) => (
              <option key={lv.version} value={lv.version}>
                {getLoaderVersionLabel(lv)}
              </option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            required
            value={modLoaderVersion}
            onChange={(e) => onModLoaderVersionChange(e.target.value)}
            placeholder="Enter version manually…"
            className={inputClass}
          />
        )}
      </div>
    </div>
  );
}
