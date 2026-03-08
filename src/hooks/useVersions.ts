"use client";

import { useState, useEffect } from "react";
import type { VersionsApiResponse } from "@/types";

// Module-level cache — persists across component re-renders within the same session
let _cache: VersionsApiResponse | null = null;
let _promise: Promise<VersionsApiResponse> | null = null;

export function useVersions() {
  const [data, setData] = useState<VersionsApiResponse | null>(_cache);
  const [loading, setLoading] = useState(_cache === null);

  useEffect(() => {
    if (_cache) {
      setData(_cache);
      setLoading(false);
      return;
    }
    if (!_promise) {
      _promise = fetch("/api/versions").then((r) => r.json());
    }
    _promise
      .then((d: VersionsApiResponse) => {
        _cache = d;
        setData(d);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  return { data, loading };
}
