type SearchPageRefreshScriptProps = {
  hasSearch: boolean;
};

export default function SearchPageRefreshScript({
  hasSearch,
}: SearchPageRefreshScriptProps) {
  if (!hasSearch) {
    return null;
  }

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
(function () {
  var STALE_KEY = "wynn-search-needs-refresh";

  function isSearchResultsPage() {
    return (
      window.location.pathname === "/" &&
      window.location.search.indexOf("checkInDate=") !== -1
    );
  }

  function clearStaleFlag() {
    try {
      sessionStorage.removeItem(STALE_KEY);
    } catch (error) {
      /* ignore */
    }
  }

  function hasStaleFlag() {
    try {
      return sessionStorage.getItem(STALE_KEY) === "1";
    } catch (error) {
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

    var navigationEntry = performance.getEntriesByType("navigation")[0];

    return Boolean(navigationEntry && navigationEntry.type === "back_forward");
  }

  if (shouldReloadNow()) {
    reloadSearchResults();
    return;
  }

  window.addEventListener("pageshow", function (event) {
    if (!isSearchResultsPage()) {
      return;
    }

    if (event.persisted || hasStaleFlag()) {
      reloadSearchResults();
    }
  });
})();
`,
      }}
    />
  );
}
