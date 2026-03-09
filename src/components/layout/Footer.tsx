import Image from "next/image";
import Link from "next/link";
import { Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-border bg-background/80 mt-auto">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-6 max-w-7xl sm:flex-row">
        {/* Brand */}
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <Image
            src="/icon0.svg"
            alt="Packsmith logo"
            width={20}
            height={20}
            className="h-5 w-5"
          />
          <span className="font-display text-sm font-semibold text-foreground">
            Packsmith
          </span>
        </Link>

        {/* Center: copyright + license */}
        <p className="text-xs text-muted-foreground text-center">
          &copy; {new Date().getFullYear()} Packsmith &mdash; Licensed under{" "}
          <a
            href="https://www.gnu.org/licenses/agpl-3.0.html"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-foreground transition-colors"
          >
            AGPL-3.0
          </a>
        </p>

        {/* GitHub link */}
        <a
          href="https://github.com/devJordanOfficial/Packsmith"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <Github className="h-4 w-4" />
          Source on GitHub
        </a>
      </div>
    </footer>
  );
}
