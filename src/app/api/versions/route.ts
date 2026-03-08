import { NextResponse } from "next/server";
import type { VersionsApiResponse, LoaderVersion } from "@/types";

// ── Fallback data (shown on cold-start fetch failure) ─────────────────────────
const FALLBACK: VersionsApiResponse = {
  minecraft: [
    "1.21.4", "1.21.1", "1.21", "1.20.6", "1.20.4", "1.20.1",
    "1.19.4", "1.19.2", "1.18.2", "1.16.5", "1.12.2",
  ],
  forge: {
    "1.21.4": [{ version: "54.1.0", isLatest: true, isRecommended: false }],
    "1.21.1": [{ version: "52.0.7", isLatest: true, isRecommended: true }],
    "1.20.6": [{ version: "50.1.0", isLatest: true, isRecommended: false }],
    "1.20.4": [{ version: "49.1.0", isLatest: true, isRecommended: false }],
    "1.20.1": [
      { version: "47.3.7", isLatest: true, isRecommended: false },
      { version: "47.2.0", isLatest: false, isRecommended: true },
    ],
    "1.19.4": [{ version: "45.3.0", isLatest: true, isRecommended: true }],
    "1.19.2": [{ version: "43.4.0", isLatest: true, isRecommended: true }],
    "1.18.2": [{ version: "40.3.0", isLatest: true, isRecommended: true }],
    "1.16.5": [{ version: "36.2.39", isLatest: true, isRecommended: true }],
    "1.12.2": [{ version: "14.23.5.2860", isLatest: true, isRecommended: true }],
  },
  fabric: [
    { version: "0.16.10", isLatest: true, isRecommended: true },
    { version: "0.16.9", isLatest: false, isRecommended: false },
  ],
  quilt: [
    { version: "0.27.1", isLatest: true, isRecommended: true },
    { version: "0.27.0", isLatest: false, isRecommended: false },
  ],
  neoforge: {
    "1.21.4": [{ version: "21.4.81", isLatest: true, isRecommended: true }],
    "1.21.1": [{ version: "21.1.80", isLatest: true, isRecommended: true }],
    "1.21":   [{ version: "21.0.167", isLatest: true, isRecommended: true }],
    "1.20.6": [{ version: "20.6.119", isLatest: true, isRecommended: true }],
    "1.20.4": [{ version: "20.4.237", isLatest: true, isRecommended: true }],
    "1.20.2": [{ version: "20.2.86",  isLatest: true, isRecommended: true }],
  },
};

// ── Fetchers ──────────────────────────────────────────────────────────────────

async function fetchMinecraft(): Promise<string[]> {
  const res = await fetch(
    "https://launchermeta.mojang.com/mc/game/version_manifest.json",
    { next: { revalidate: 3600 } }
  );
  if (!res.ok) throw new Error("mc fetch failed");
  const data = await res.json() as { versions: { id: string; type: string }[] };
  return data.versions.filter((v) => v.type === "release").slice(0, 15).map((v) => v.id);
}

async function fetchForge(): Promise<Record<string, LoaderVersion[]>> {
  const res = await fetch(
    "https://files.minecraftforge.net/net/minecraftforge/forge/promotions_slim.json",
    { next: { revalidate: 3600 } }
  );
  if (!res.ok) throw new Error("forge fetch failed");
  const data = await res.json() as { promos: Record<string, string> };

  const result: Record<string, LoaderVersion[]> = {};
  for (const [key, version] of Object.entries(data.promos)) {
    const match = key.match(/^(.+)-(recommended|latest)$/);
    if (!match) continue;
    const [, mcVersion, tag] = match;
    if (!result[mcVersion]) result[mcVersion] = [];
    const existing = result[mcVersion].find((v) => v.version === version);
    if (existing) {
      if (tag === "recommended") existing.isRecommended = true;
      if (tag === "latest") existing.isLatest = true;
    } else {
      result[mcVersion].push({
        version,
        isLatest: tag === "latest",
        isRecommended: tag === "recommended",
      });
    }
  }
  // Sort: recommended first, then latest
  for (const mcVersion of Object.keys(result)) {
    result[mcVersion].sort((a, b) => {
      if (a.isRecommended !== b.isRecommended) return a.isRecommended ? -1 : 1;
      if (a.isLatest !== b.isLatest) return a.isLatest ? -1 : 1;
      return 0;
    });
  }
  return result;
}

async function fetchFabric(): Promise<LoaderVersion[]> {
  const res = await fetch(
    "https://meta.fabricmc.net/v2/versions/loader",
    { next: { revalidate: 3600 } }
  );
  if (!res.ok) throw new Error("fabric fetch failed");
  const data = await res.json() as { version: string; stable: boolean }[];
  return data.slice(0, 10).map((v, i) => ({
    version: v.version,
    isLatest: i === 0,
    isRecommended: v.stable && i === 0,
  }));
}

async function fetchQuilt(): Promise<LoaderVersion[]> {
  const res = await fetch(
    "https://meta.quiltmc.org/v3/versions/loader",
    { next: { revalidate: 3600 } }
  );
  if (!res.ok) throw new Error("quilt fetch failed");
  const data = await res.json() as { version: string }[];
  return data.slice(0, 10).map((v, i) => ({
    version: v.version,
    isLatest: i === 0,
    isRecommended: i === 0,
  }));
}

function nfVersionToMcVersion(v: string): string | null {
  // NeoForge format: "21.4.81" → MC "1.21.4", "21.0.167" → MC "1.21"
  const parts = v.split(".");
  if (parts.length < 3) return null;
  const [major, minor] = parts;
  if (!/^\d+$/.test(major) || !/^\d+$/.test(minor)) return null;
  return minor === "0" ? `1.${major}` : `1.${major}.${minor}`;
}

async function fetchNeoForge(): Promise<Record<string, LoaderVersion[]>> {
  const res = await fetch(
    "https://maven.neoforged.net/releases/net/neoforged/neoforge/maven-metadata.xml",
    { next: { revalidate: 3600 } }
  );
  if (!res.ok) throw new Error("neoforge fetch failed");
  const xml = await res.text();

  const grouped: Record<string, string[]> = {};
  for (const [, version] of xml.matchAll(/<version>([^<]+)<\/version>/g)) {
    if (version.includes("-")) continue; // skip pre-release (beta, rc, etc.)
    const mcVersion = nfVersionToMcVersion(version);
    if (!mcVersion) continue;
    if (!grouped[mcVersion]) grouped[mcVersion] = [];
    grouped[mcVersion].push(version);
  }

  const out: Record<string, LoaderVersion[]> = {};
  for (const [mcVersion, versions] of Object.entries(grouped)) {
    // XML lists versions ascending; take latest 10, reverse to descending
    const top10 = versions.slice(-10).reverse();
    out[mcVersion] = top10.map((v, i) => ({
      version: v,
      isLatest: i === 0,
      isRecommended: i === 0,
    }));
  }
  return out;
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function GET() {
  const [minecraft, forge, fabric, quilt, neoforge] = await Promise.allSettled([
    fetchMinecraft(),
    fetchForge(),
    fetchFabric(),
    fetchQuilt(),
    fetchNeoForge(),
  ]);

  const response: VersionsApiResponse = {
    minecraft: minecraft.status === "fulfilled" ? minecraft.value : FALLBACK.minecraft,
    forge:     forge.status     === "fulfilled" ? forge.value     : FALLBACK.forge,
    fabric:    fabric.status    === "fulfilled" ? fabric.value    : FALLBACK.fabric,
    quilt:     quilt.status     === "fulfilled" ? quilt.value     : FALLBACK.quilt,
    neoforge:  neoforge.status  === "fulfilled" ? neoforge.value  : FALLBACK.neoforge,
  };

  return NextResponse.json(response, {
    headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
  });
}
