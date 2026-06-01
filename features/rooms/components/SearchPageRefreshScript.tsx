"use client";

import { useEffect } from "react";
import { SEARCH_NEEDS_REFRESH_KEY } from "@/app/constants/search-storage";

type SearchPageRefreshScriptProps = {
  hasSearch: boolean;
};

function isSearchResultsPage() {
  return (
    window.location.pathname === "/" &&
    window.location.search.includes("checkInDate=")
  );
}

function clearStaleFlag() {
  try {
    sessionStorage.removeItem(SEARCH_NEEDS_REFRESH_KEY);
  } catch {
    /* ignore */
  }
}

function hasStaleFlag() {
  try {
    return sessionStorage.getItem(SEARCH_NEEDS_REFRESH_KEY) === "1";
  } catch {
    return false;
  }
}

function reloadSearchResults() {
  clearStaleFlag();
  window.location.reload();
}

function shouldReloadNow() {
  if (!isSearchResultsPage()) {
    return false;
  }

  if (hasStaleFlag()) {
    return true;
  }

  const navigationEntry = performance.getEntriesByType(
    "navigation"
  )[0] as PerformanceNavigationTiming | undefined;

  return navigationEntry?.type === "back_forward";
}

export default function SearchPageRefreshScript({
  hasSearch,
}: SearchPageRefreshScriptProps) {
  useEffect(() => {
    if (!hasSearch) {
      return;
    }

    if (shouldReloadNow()) {
      reloadSearchResults();
      return;
    }

    function handlePageShow(event: PageTransitionEvent) {
      if (!isSearchResultsPage()) {
        return;
      }

      if (event.persisted || hasStaleFlag()) {
        reloadSearchResults();
      }
    }

    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, [hasSearch]);

  return null;
}
