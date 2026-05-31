export const SEARCH_NEEDS_REFRESH_KEY = "wynn-search-needs-refresh";

export function markSearchResultsStale() {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(SEARCH_NEEDS_REFRESH_KEY, "1");
  }
}

export function consumeSearchResultsStaleFlag() {
  if (typeof window === "undefined") {
    return false;
  }

  const shouldRefresh = sessionStorage.getItem(SEARCH_NEEDS_REFRESH_KEY) === "1";

  if (shouldRefresh) {
    sessionStorage.removeItem(SEARCH_NEEDS_REFRESH_KEY);
  }

  return shouldRefresh;
}
