"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { MOD_LOADERS, type ModLoader, type VersionsApiResponse } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getLoaderVersions,
  getSupportedMcVersions,
  getDefaultLoaderVersion,
  getLoaderVersionTag,
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

  // Include the current value in the select even if it's not in the live API list
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
        {versionsLoading ? (
          <select disabled className={cn(inputClass, "opacity-50")}>
            <option>{minecraftVersion || "Loading…"}</option>
          </select>
        ) : (
          <Select required value={minecraftVersion} onValueChange={handleMcVersionChange}>
            <SelectTrigger
              className={cn(
                inputClass,
                "flex items-center justify-between [&>span]:line-clamp-1"
              )}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {mcVersionOptions.map((v) => (
                <SelectItem key={v} value={v}>
                  {v}
                  {v === versions?.minecraft[0] && (
                    <span className="text-muted-foreground"> (latest)</span>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
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

            const btn = (
              <button
                key={value}
                type="button"
                disabled={isUnavailable || versionsLoading}
                onClick={() => handleLoaderChange(value as ModLoader)}
                className={cn(
                  "w-full rounded-md border px-3 py-2 text-sm font-medium transition-colors",
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

            // Disabled buttons don't fire hover events, so we wrap in a span to show the tooltip
            return isUnavailable ? (
              <span key={value} title={reason} className="cursor-not-allowed">
                {btn}
              </span>
            ) : (
              <span key={value}>{btn}</span>
            );
          })}
        </div>
        {loaderWarning && (
          <p className="text-xs text-muted-foreground">{loaderWarning}</p>
        )}
      </div>

      {/* Loader Version — Radix Select for styled gray tags */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">
          Loader Version <span className="text-destructive">*</span>
        </label>
        {versionsLoading ? (
          <select disabled className={cn(inputClass, "opacity-50")}>
            <option>Loading…</option>
          </select>
        ) : effectiveVersionOptions.length > 0 ? (
          <Select
            required
            value={modLoaderVersion}
            onValueChange={onModLoaderVersionChange}
          >
            <SelectTrigger
              className={cn(
                inputClass,
                "flex items-center justify-between [&>span]:line-clamp-1"
              )}
            >
              <SelectValue placeholder="Select a version…" />
            </SelectTrigger>
            <SelectContent>
              {effectiveVersionOptions.map((lv) => {
                const tag = getLoaderVersionTag(lv);
                return (
                  <SelectItem key={lv.version} value={lv.version}>
                    {lv.version}
                    {tag && (
                      <span className="text-muted-foreground"> ({tag})</span>
                    )}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
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
