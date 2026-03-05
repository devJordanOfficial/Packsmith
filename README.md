# Packsmith

Build, manage, and share Minecraft modpacks. Browse CurseForge mods, assemble your pack, and export a CurseForge-compatible `.zip` in seconds.

## Stack

- **Framework** — Next.js 15 (App Router)
- **Auth + Database** — Supabase
- **Styling** — Tailwind CSS + shadcn/ui
- **Hosting** — Cloudflare Pages

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run `supabase/schema.sql` in your Supabase SQL editor
3. Copy your project URL and anon key

### 3. Set up environment variables

```bash
cp .env.local.example .env.local
```

Fill in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
CURSEFORGE_API_KEY=your-curseforge-api-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Install shadcn/ui components

```bash
npx shadcn@latest init
# Then add components as needed:
npx shadcn@latest add button input label select dialog toast
```

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
src/
├── app/
│   ├── auth/          # Login, signup, callback
│   ├── dashboard/     # Modpack list
│   ├── modpacks/      # Modpack editor (Phase 1+)
│   └── api/
│       └── curseforge/  # Server-side API proxy
├── components/
│   ├── auth/          # LoginForm, SignupForm
│   ├── layout/        # Navbar
│   ├── dashboard/     # ModpackGrid, ModpackCard (Phase 1)
│   └── shared/        # Reusable UI components
├── hooks/             # useSupabase, etc.
├── lib/
│   ├── supabase/      # Browser + server clients
│   └── utils.ts
├── styles/
│   └── globals.css
└── types/
    ├── index.ts       # App-level types
    └── database.ts    # Supabase-generated types
```

---

## Deployment (Cloudflare Pages)

```bash
npm run pages:build
npm run pages:deploy
```

Set the same environment variables in your Cloudflare Pages project settings.

---

## CurseForge API

The CurseForge API key is **never exposed client-side**. All requests are proxied through `/api/curseforge`.

Client usage:
```ts
const res = await fetch('/api/curseforge?path=/mods/search&searchFilter=jei');
const data = await res.json();
```
