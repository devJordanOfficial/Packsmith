# Packsmith — Dev Notes

Internal development reference for the Packsmith project.

## What is Packsmith?

A web app for building and managing Minecraft modpacks from anywhere. Browse mods directly from CurseForge, assemble them into named packs, configure metadata, and export a CurseForge-compatible `.zip` ready to import into any CurseForge launcher. Everything syncs to your account so you can pick up where you left off on any device.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router, fullstack monorepo) |
| Auth + Database | Supabase (Postgres + built-in auth) |
| Styling | Tailwind CSS + shadcn/ui |
| Hosting | Cloudflare Pages (via OpenNext adapter) |
| API Proxy | Next.js Route Handlers (protects CurseForge API key) |
| Export | jszip (CurseForge-compatible .zip generation) |

---

## Phases

### Phase 1 — Modpack CRUD ✅ In Progress
- [x] Project scaffold (Next.js + Supabase + Tailwind + shadcn/ui)
- [x] Supabase schema: users, modpacks, modpack_mods tables
- [x] Auth: sign up, log in, log out (Supabase Auth)
- [ ] Create a new modpack (name, description, Minecraft version, mod loader + version, logo upload)
- [ ] Edit modpack metadata
- [ ] Delete a modpack
- [ ] Dashboard: list all modpacks for the logged-in user

### Phase 2 — CurseForge Mod Browsing & Adding
- [ ] CurseForge API key setup and secure server-side proxy
- [ ] Browse/search mods from CurseForge (search, filter by category, sort)
- [ ] Mod detail view (description, authors, download count, last updated)
- [ ] Add a mod to a modpack
- [ ] Remove a mod from a modpack
- [ ] View all mods in a modpack
- [ ] Handle mod version selection (pin to specific file/version)
- [ ] Support for resource packs, shader packs, and other content types

### Phase 3 — Cross-Device Sync
- [ ] All modpack data stored in Supabase and tied to user account
- [ ] Real-time or on-load sync across devices
- [ ] Protected routes (redirect to login if unauthenticated)
- [ ] User profile/settings page

### Phase 4 — CurseForge Export
- [ ] Generate `manifest.json` (CurseForge format)
- [ ] Bundle `overrides/` folder
- [ ] Zip and download as `.zip`
- [ ] Validate export against CurseForge manifest schema before download

---

## Local Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Set up Supabase
1. Create a project at [supabase.com](https://supabase.com)
2. Run `supabase/schema.sql` in the SQL editor
3. Grab your project URL and API keys from **Project Settings → API**

### 3. Environment variables
```bash
cp .env.local.example .env.local
```

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project Settings → General → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Project Settings → API → Publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | Project Settings → API → Secret key |
| `CURSEFORGE_API_KEY` | CurseForge API portal (Phase 2) |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` for dev |

### 4. Install shadcn/ui components
```bash
npx shadcn@latest init
npx shadcn@latest add button input label select dialog toast
```

### 5. Run dev server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
src/
├── app/
│   ├── auth/              # Login, signup, callback
│   ├── dashboard/         # Modpack list
│   ├── modpacks/          # Modpack editor
│   └── api/
│       └── curseforge/    # Server-side API proxy (key never exposed client-side)
├── components/
│   ├── auth/              # LoginForm, SignupForm
│   ├── layout/            # Navbar
│   ├── dashboard/         # ModpackGrid, ModpackCard
│   ├── modpack/           # ModpackEditor, ModList, ModListItem, etc.
│   └── shared/            # Reusable UI (EmptyState, ConfirmDialog, etc.)
├── hooks/                 # useSupabase, etc.
├── lib/
│   ├── supabase/          # Browser + server clients
│   └── utils.ts
├── styles/
│   └── globals.css
└── types/
    ├── index.ts           # App-level types
    └── database.ts        # Supabase row types
```

---

## Deployment (Cloudflare Pages)

> ⚠️ `@cloudflare/next-on-pages` has been removed as it is deprecated. Will set up [OpenNext](https://opennext.js.org/cloudflare) adapter before first production deploy.

Set all `.env.local` variables in your Cloudflare Pages project environment settings.

---

## Notes

- CurseForge API key is never client-side — always proxied through `/api/curseforge`
- Mod files are not bundled in exports, only `projectID` and `fileID` — the launcher re-downloads on import
- Supabase free tier limits: 500MB DB, 1GB file storage — sufficient for early production