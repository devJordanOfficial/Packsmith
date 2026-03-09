"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getInitials, cn } from "@/lib/utils";
import { LogOut, ChevronDown } from "lucide-react";

interface NavbarProps {
  username: string;
  avatarUrl: string | null;
}

export function Navbar({ username, avatarUrl }: NavbarProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <Image
            src="/icon0.svg"
            alt="Packsmith logo"
            width={28}
            height={28}
            className="h-7 w-7"
          />
          <span className="font-display text-lg font-bold tracking-tight text-foreground">
            Packsmith
          </span>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            href="/dashboard"
            className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground rounded-md hover:bg-accent transition-colors"
          >
            Dashboard
          </Link>
        </nav>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className={cn(
              "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm",
              "hover:bg-accent transition-colors",
              menuOpen && "bg-accent"
            )}
          >
            {/* Avatar */}
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary border border-primary/20 overflow-hidden">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt={username}
                  className="h-full w-full object-cover"
                />
              ) : (
                getInitials(username)
              )}
            </div>
            <span className="hidden md:block text-foreground font-medium max-w-[120px] truncate">
              {username}
            </span>
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 text-muted-foreground transition-transform duration-150",
                menuOpen && "rotate-180"
              )}
            />
          </button>

          {/* Dropdown */}
          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 top-full mt-1.5 z-50 w-48 rounded-lg border border-border bg-card shadow-xl shadow-black/30 py-1 animate-fade-in">
                <div className="px-3 py-2 border-b border-border mb-1">
                  <p className="text-xs text-muted-foreground">Signed in as</p>
                  <p className="text-sm font-medium text-foreground truncate">
                    {username}
                  </p>
                </div>
                <button
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-50"
                >
                  <LogOut className="h-4 w-4" />
                  {signingOut ? "Signing out…" : "Sign out"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
