"use client";

import { useMemo } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Returns a stable Supabase browser client.
 * Use this in client components instead of calling createClient() directly.
 */
export function useSupabase() {
  // createClient creates a new instance each time, so memoize it
  return useMemo(() => createClient(), []);
}
