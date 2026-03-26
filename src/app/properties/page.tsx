import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import PropertyListingCard from "@/components/PropertyListingCard";
import PropertyFilters from "@/components/PropertyFilters";
import Pagination from "@/components/Pagination";
import SortDropdown from "@/components/SortDropdown";
import { searchProperties, getFilterOptions } from "@/lib/properties";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Properties | Golden Land Real Estate",
  description:
    "Browse curated coastal residences and architectural masterpieces across Lebanon, Cyprus, and Greece.",
};

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const rawParams = await searchParams;

  const params = rawParams as Record<string, string | string[] | undefined>;
  const [result, filterOptions] = await Promise.all([
    searchProperties(params),
    getFilterOptions({
      country: typeof params.country === "string" ? params.country : undefined,
      city: typeof params.city === "string" ? params.city : undefined,
    }),
  ]);

  return (
    <>
      <Navbar />
      <main className="pt-12 pb-24 max-w-[1280px] w-full mx-auto px-6">
        {/* Header */}
        <div className="mb-12">
          <h1 className="font-display text-5xl font-extrabold text-secondary tracking-tight mb-2">
            Properties
          </h1>
          <p className="text-outline font-medium">
            Curated coastal residences and architectural masterpieces.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-10 items-start w-full">
          {/* Sidebar */}
          <Suspense>
            <PropertyFilters filterOptions={filterOptions} />
          </Suspense>

          {/* Main content */}
          <div className="flex-1 min-w-0 w-full">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 bg-surface-container-low p-4 rounded-xl">
              <div className="text-sm font-medium text-outline">
                Showing{" "}
                <span className="text-secondary font-bold">
                  {result.total.toLocaleString()}
                </span>{" "}
                properties
              </div>
              <Suspense>
                <SortDropdown />
              </Suspense>
            </div>

            {/* Property Grid */}
            {result.data.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {result.data.map((property) => (
                  <PropertyListingCard
                    key={property.slug}
                    property={property}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-24">
                <span className="material-symbols-outlined text-6xl text-outline-variant mb-4 block">
                  search_off
                </span>
                <h3 className="font-display text-2xl font-bold text-secondary mb-2">
                  No properties found
                </h3>
                <p className="text-outline">
                  Try adjusting your filters or search terms.
                </p>
              </div>
            )}

            {/* Pagination */}
            <Suspense>
              <Pagination
                currentPage={result.page}
                totalPages={result.totalPages}
              />
            </Suspense>
          </div>
        </div>
      </main>
      <WhatsAppButton />
      <Footer />
    </>
  );
}
