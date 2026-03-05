import Link from "next/link";
import { Home, PackageSearch } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="rounded-2xl bg-primary/10 border border-primary/20 p-6">
              <PackageSearch className="h-16 w-16 text-primary" />
            </div>
            <span className="absolute -top-3 -right-3 text-2xl">💀</span>
          </div>
        </div>

        {/* Error code */}
        <p className="font-mono text-xs font-medium tracking-widest text-primary uppercase mb-2">
          Error 404
        </p>

        {/* Heading */}
        <h1 className="font-display text-4xl font-bold text-foreground mb-3">
          Page not found
        </h1>

        {/* Flavour text */}
        <p className="text-muted-foreground text-sm leading-relaxed mb-8">
          Looks like this page got corrupted somewhere between the overworld and
          the end. Contact support if you believe this is a mistake.
        </p>

        {/* Actions */}
        <div className="flex gap-3 justify-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Home className="h-4 w-4" />
            Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
