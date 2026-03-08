// ─── Database Row Types ───────────────────────────────────────────────────────

export interface Profile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Modpack {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  minecraft_version: string;
  mod_loader: ModLoader;
  mod_loader_version: string;
  logo_url: string | null;
  version: string;
  created_at: string;
  updated_at: string;
}

export interface ModpackMod {
  id: string;
  modpack_id: string;
  project_id: number;
  file_id: number;
  name: string;
  summary: string | null;
  logo_url: string | null;
  authors: string[];
  download_count: number | null;
  added_at: string;
}

// ─── Enums ────────────────────────────────────────────────────────────────────

export type ModLoader = "forge" | "fabric" | "quilt" | "neoforge";

export const MOD_LOADERS: { value: ModLoader; label: string }[] = [
  { value: "forge", label: "Forge" },
  { value: "fabric", label: "Fabric" },
  { value: "quilt", label: "Quilt" },
  { value: "neoforge", label: "NeoForge" },
];

// ─── Versions API ─────────────────────────────────────────────────────────────

export interface LoaderVersion {
  version: string;
  isLatest: boolean;
  isRecommended: boolean;
}

export interface VersionsApiResponse {
  minecraft: string[];
  forge: Record<string, LoaderVersion[]>;
  fabric: LoaderVersion[];
  quilt: LoaderVersion[];
  neoforge: Record<string, LoaderVersion[]>;
}

// ─── Modpack with extras ──────────────────────────────────────────────────────

export interface ModpackWithModCount extends Modpack {
  mod_count: number;
}

// ─── Form Types ───────────────────────────────────────────────────────────────

export interface CreateModpackInput {
  name: string;
  description: string;
  minecraft_version: string;
  mod_loader: ModLoader;
  mod_loader_version: string;
}

export interface UpdateModpackInput extends Partial<CreateModpackInput> {
  logo_url?: string | null;
  version?: string;
}

// ─── CurseForge API Types (Phase 2) ──────────────────────────────────────────

export interface CurseForgeMod {
  id: number;
  name: string;
  summary: string;
  slug: string;
  downloadCount: number;
  dateModified: string;
  logo: {
    url: string;
    thumbnailUrl: string;
  } | null;
  authors: { name: string }[];
  categories: { name: string; iconUrl: string }[];
  latestFiles: CurseForgeFile[];
  latestFilesIndexes: CurseForgeFileIndex[];
}

export interface CurseForgeFile {
  id: number;
  displayName: string;
  fileName: string;
  fileDate: string;
  downloadCount: number;
  gameVersions: string[];
  dependencies: { modId: number; relationType: number }[];
}

export interface CurseForgeFileIndex {
  gameVersion: string;
  fileId: number;
  filename: string;
  releaseType: number;
  modLoader: number;
}

// ─── Export Types (Phase 4) ───────────────────────────────────────────────────

export interface CurseForgeManifest {
  minecraft: {
    version: string;
    modLoaders: { id: string; primary: boolean }[];
  };
  manifestType: "minecraftModpack";
  manifestVersion: 1;
  name: string;
  version: string;
  author: string;
  files: { projectID: number; fileID: number; required: boolean }[];
  overrides: "overrides";
}
