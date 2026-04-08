"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { SORT_OPTIONS } from "@/lib/constants";

export default function SortDropdown() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasQuery = !!searchParams.get("q");
  const explicitSort = searchParams.get("sort");

  // When a text query is active and no explicit sort is set, default to relevance
  const currentSort = explicitSort ?? (hasQuery ? "relevance" : "newest");

  // Only show "Most Relevant" when there's an active text query
  const options = hasQuery
    ? SORT_OPTIONS
    : SORT_OPTIONS.filter((opt) => opt.value !== "relevance");

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    const value = e.target.value;
    // Clear sort param when selecting the default for current state
    if (value === "newest" && !hasQuery) {
      params.delete("sort");
    } else if (value === "relevance" && hasQuery) {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <select
      value={currentSort}
      onChange={handleChange}
      className="bg-surface border-none rounded-lg py-2 px-4 text-sm font-semibold text-secondary focus:ring-0 cursor-pointer"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
