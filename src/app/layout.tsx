import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: {
    default: "Packsmith",
    template: "%s | Packsmith",
  },
  description:
    "Build, manage, and share Minecraft modpacks. Browse CurseForge mods, assemble your pack, and export in seconds.",
  keywords: ["minecraft", "modpack", "curseforge", "forge", "fabric", "mods"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
