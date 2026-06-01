"use client";

import { useEffect } from "react";
import { SEARCH_NEEDS_REFRESH_KEY } from "@/app/constants/search-storage";

type SearchPageRefreshScriptProps = {
  hasSearch: boolean;
};

export default function SearchPageRefreshScript({
  hasSearch,
}: SearchPageRefreshScriptProps) {
  useEffect(() => {
    if (!hasSearch) {
      return;
    }

    try {
      sessionStorage.removeItem(SEARCH_NEEDS_REFRESH_KEY);
    } catch {
      // Session storage may be unavailable in restricted browser modes.
    }
  }, [hasSearch]);

  return null;
}