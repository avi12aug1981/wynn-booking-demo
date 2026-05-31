"use client";

import { useEffect } from "react";
import { markSearchResultsStale } from "@/app/constants/search-storage";

export default function MarkSearchStale() {
  useEffect(() => {
    markSearchResultsStale();
  }, []);

  return null;
}
