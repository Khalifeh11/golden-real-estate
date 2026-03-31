"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

export default function Pagination({ currentPage, totalPages }: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(page));
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: true });
  };

  // Build page numbers with ellipsis
  const getPageNumbers = (): (number | "...")[] => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    pages.push(1);
    if (currentPage > 3) pages.push("...");

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);

    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);

    return pages;
  };

  return (
    <div className="mt-16 flex justify-center items-center gap-2">
      {/* Previous */}
      <button
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage <= 1}
        className={cn(
          "w-10 h-10 flex items-center justify-center rounded-lg transition-colors",
          currentPage <= 1
            ? "bg-surface-container-low text-outline-variant cursor-not-allowed"
            : "bg-surface-container-low text-outline hover:text-secondary"
        )}
      >
        <span className="material-symbols-outlined">chevron_left</span>
      </button>

      {/* Page numbers */}
      {getPageNumbers().map((page, i) =>
        page === "..." ? (
          <span key={`ellipsis-${i}`} className="px-2 text-outline-variant">
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => goToPage(page)}
            className={cn(
              "w-10 h-10 flex items-center justify-center rounded-lg transition-all",
              page === currentPage
                ? "bg-primary text-white font-bold"
                : "bg-surface hover:bg-surface-container-low text-secondary font-semibold"
            )}
          >
            {page}
          </button>
        )
      )}

      {/* Next */}
      <button
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className={cn(
          "w-10 h-10 flex items-center justify-center rounded-lg transition-colors",
          currentPage >= totalPages
            ? "bg-surface-container-low text-outline-variant cursor-not-allowed"
            : "bg-surface-container-low text-outline hover:text-secondary"
        )}
      >
        <span className="material-symbols-outlined">chevron_right</span>
      </button>
    </div>
  );
}
