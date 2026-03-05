import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const CURSEFORGE_BASE = "https://api.curseforge.com/v1";
const MINECRAFT_GAME_ID = 432;

/**
 * Server-side proxy for CurseForge API.
 * The API key is NEVER exposed to the client.
 *
 * Usage: GET /api/curseforge?path=/mods/search&gameId=432&searchFilter=jei
 */
export async function GET(request: NextRequest) {
  // Require authenticated session
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.CURSEFORGE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "CurseForge API key not configured" },
      { status: 500 }
    );
  }

  // Extract the CurseForge path and forward all other query params
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path");
  if (!path) {
    return NextResponse.json(
      { error: "Missing required 'path' parameter" },
      { status: 400 }
    );
  }

  // Build the upstream URL
  const upstreamParams = new URLSearchParams(searchParams);
  upstreamParams.delete("path");

  // Always scope to Minecraft
  if (!upstreamParams.has("gameId")) {
    upstreamParams.set("gameId", String(MINECRAFT_GAME_ID));
  }

  const upstreamUrl = `${CURSEFORGE_BASE}${path}?${upstreamParams.toString()}`;

  try {
    const response = await fetch(upstreamUrl, {
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`CurseForge API error ${response.status}:`, errorText);
      return NextResponse.json(
        { error: `CurseForge API returned ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("CurseForge proxy error:", err);
    return NextResponse.json(
      { error: "Failed to reach CurseForge API" },
      { status: 502 }
    );
  }
}
