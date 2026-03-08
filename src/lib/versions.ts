import type { VersionsApiResponse, LoaderVersion, ModLoader } from "@/types";

export const NEOFORGE_MIN_MC = "1.20.2";

function parseMcVersion(v: string): [number, number, number] {
  const parts = v.split(".").map(Number);
  return [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0];
}

export function mcVersionAtLeast(version: string, min: string): boolean {
  const [av, bv, cv] = parseMcVersion(version);
  const [am, bm, cm] = parseMcVersion(min);
  if (av !== am) return av > am;
  if (bv !== bm) return bv > bm;
  return cv >= cm;
}

export function getLoaderVersions(
  loader: ModLoader,
  mcVersion: string,
  data: VersionsApiResponse
): LoaderVersion[] {
  switch (loader) {
    case "forge":    return data.forge[mcVersion] ?? [];
    case "fabric":   return data.fabric;
    case "quilt":    return data.quilt;
    case "neoforge": return data.neoforge[mcVersion] ?? [];
  }
}

export function loaderSupportsMcVersion(
  loader: ModLoader,
  mcVersion: string,
  data: VersionsApiResponse
): boolean {
  if (loader === "neoforge" && !mcVersionAtLeast(mcVersion, NEOFORGE_MIN_MC)) return false;
  if (loader === "fabric" || loader === "quilt") return true;
  return getLoaderVersions(loader, mcVersion, data).length > 0;
}

export function getSupportedMcVersions(
  loader: ModLoader,
  mcVersions: string[],
  data: VersionsApiResponse
): string[] {
  return mcVersions.filter((v) => loaderSupportsMcVersion(loader, v, data));
}

export function getDefaultLoaderVersion(
  loader: ModLoader,
  mcVersion: string,
  data: VersionsApiResponse
): string {
  const versions = getLoaderVersions(loader, mcVersion, data);
  const recommended = versions.find((v) => v.isRecommended);
  const latest = versions.find((v) => v.isLatest);
  return (recommended ?? latest ?? versions[0])?.version ?? "";
}

export function getLoaderVersionLabel(lv: LoaderVersion): string {
  const tags: string[] = [];
  if (lv.isRecommended) tags.push("recommended");
  if (lv.isLatest) tags.push("latest");
  return tags.length > 0 ? `${lv.version} (${tags.join(", ")})` : lv.version;
}

export function getLoaderUnavailableReason(
  loader: ModLoader,
  mcVersion: string,
  data: VersionsApiResponse
): string | null {
  if (loader === "neoforge" && !mcVersionAtLeast(mcVersion, NEOFORGE_MIN_MC)) {
    return `NeoForge only supports Minecraft ${NEOFORGE_MIN_MC}+`;
  }
  if (loader === "forge" && getLoaderVersions(loader, mcVersion, data).length === 0) {
    return `No Forge versions available for MC ${mcVersion}`;
  }
  if (loader === "neoforge" && getLoaderVersions(loader, mcVersion, data).length === 0) {
    return `No NeoForge versions available for MC ${mcVersion}`;
  }
  return null;
}
