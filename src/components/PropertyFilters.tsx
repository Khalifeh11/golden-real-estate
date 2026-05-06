"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useState, useEffect, useTransition } from "react";
import * as Slider from "@radix-ui/react-slider";
import { MdFilterList } from "react-icons/md";
import { CATEGORIES, PROPERTY_GROUPS, PROPERTY_TYPES, ALL_PROPERTY_TYPES, PRIMARY_COUNTRIES, OTHER_COUNTRY_VALUE, getSliderConfig } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { FilterOptions, PropertyGroup } from "@/types";

function formatPriceLabel(value: number, max: number): string {
  if (value >= max) {
    if (max >= 1_000_000) return `$${(max / 1_000_000).toFixed(0)}M+`;
    if (max >= 1_000) return `$${(max / 1_000).toFixed(0)}K+`;
    return `$${max}+`;
  }
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value}`;
}

interface PropertyFiltersProps {
  filterOptions: FilterOptions;
}

export default function PropertyFilters({ filterOptions }: PropertyFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Local state for debounced text inputs
  const [keyword, setKeyword] = useState(searchParams.get("q") ?? "");
  const [refNumber, setRefNumber] = useState(searchParams.get("ref") ?? "");
  const [moreOpen, setMoreOpen] = useState(() => {
    return !!(
      searchParams.get("ref") ||
      searchParams.get("district") ||
      searchParams.get("minArea") ||
      searchParams.get("maxArea") ||
      searchParams.get("bedrooms") ||
      searchParams.get("bathrooms")
    );
  });

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      // Reset to page 1 when filters change
      params.delete("page");
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [router, pathname, searchParams]
  );

  // Debounce keyword search
  useEffect(() => {
    const timer = setTimeout(() => {
      const current = searchParams.get("q") ?? "";
      if (keyword !== current) {
        updateParams({ q: keyword || null });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [keyword, searchParams, updateParams]);

  // Debounce ref search
  useEffect(() => {
    const timer = setTimeout(() => {
      const current = searchParams.get("ref") ?? "";
      if (refNumber !== current) {
        updateParams({ ref: refNumber || null });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [refNumber, searchParams, updateParams]);

  const activeCategory = searchParams.get("category");
  const activePropertyGroup = searchParams.get("propertyGroup") as PropertyGroup | null;
  const activePropertyType = searchParams.get("propertyType") ?? "";
  const activeBedrooms = searchParams.get("bedrooms") ?? "";
  const activeBathrooms = searchParams.get("bathrooms") ?? "";
  const activeCountry = searchParams.get("country") ?? "";
  const activeCity = searchParams.get("city") ?? "";
  const activeDistrict = searchParams.get("district") ?? "";
  const propertyTypeOptions = activePropertyGroup
    ? PROPERTY_TYPES[activePropertyGroup]
    : ALL_PROPERTY_TYPES;

  // Slider config adapts to selected category (rent vs sale)
  const { price: priceConfig, area: areaConfig } = getSliderConfig(activeCategory);

  // Price range — URL is source of truth; local override only exists while dragging
  const rawMinPrice = searchParams.get("minPrice");
  const urlMinPrice = rawMinPrice !== null ? Math.min(Number(rawMinPrice), priceConfig.max) : priceConfig.min;
  const rawMaxPrice = searchParams.get("maxPrice");
  const urlMaxPrice = rawMaxPrice !== null ? Math.min(Number(rawMaxPrice), priceConfig.max) : priceConfig.max;
  const [dragPriceRange, setDragPriceRange] = useState<[number, number] | null>(null);
  const priceRange = dragPriceRange ?? [urlMinPrice, urlMaxPrice];

  // Area range — same pattern
  const rawMinArea = searchParams.get("minArea");
  const urlMinArea = rawMinArea !== null ? Math.min(Number(rawMinArea), areaConfig.max) : areaConfig.min;
  const rawMaxArea = searchParams.get("maxArea");
  const urlMaxArea = rawMaxArea !== null ? Math.min(Number(rawMaxArea), areaConfig.max) : areaConfig.max;
  const [dragAreaRange, setDragAreaRange] = useState<[number, number] | null>(null);
  const areaRange = dragAreaRange ?? [urlMinArea, urlMaxArea];

  // Count active "more filters" to show badge
  const moreFilterCount = [
    !!searchParams.get("ref"),
    !!activeDistrict,
    rawMinArea !== null || rawMaxArea !== null,
    !!activeBedrooms,
    !!activeBathrooms,
  ].filter(Boolean).length;

  return (
    <aside
      className={cn(
        "w-full lg:w-[280px] shrink-0 lg:top-20 space-y-6 bg-surface-container-low p-6 rounded-xl",
        isPending && "opacity-70 pointer-events-none"
      )}
    >
      {/* Header */}
      <div>
        <h3 className="font-display text-lg font-bold text-secondary mb-4 flex items-center gap-2">
          <MdFilterList className="text-primary w-4 h-4" />
          Search Filters
        </h3>

        {/* Keyword Search */}
        <div className="relative">
          <input
            className="w-full bg-surface border-none rounded-lg py-3 px-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline-variant"
            placeholder="Keyword search..."
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="block text-xs font-bold text-outline uppercase tracking-widest mb-3">
          Category
        </label>
        <div className="grid grid-cols-2 gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() =>
                updateParams({
                  category: activeCategory === cat.value ? null : cat.value,
                  minPrice: null,
                  maxPrice: null,
                  minArea: null,
                  maxArea: null,
                })
              }
              className={cn(
                "py-2 px-3 text-xs font-semibold rounded-lg border-none transition-colors",
                activeCategory === cat.value
                  ? "bg-primary-container text-on-primary-container shadow-sm"
                  : "bg-surface text-secondary hover:bg-surface-variant"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Property Group */}
      <div>
        <label className="block text-xs font-bold text-outline uppercase tracking-widest mb-3">
          Property Group
        </label>
        <div className="grid grid-cols-2 gap-2">
          {PROPERTY_GROUPS.map((group, index) => (
            <button
              key={group.value}
              onClick={() =>
                updateParams({
                  propertyGroup: activePropertyGroup === group.value ? null : group.value,
                  propertyType: null,
                })
              }
              className={cn(
                "py-2 px-2 text-xs font-semibold rounded-lg border-none transition-colors cursor-pointer",
                activePropertyGroup === group.value
                  ? "bg-primary-container text-on-primary-container shadow-sm"
                  : "bg-surface text-secondary hover:bg-surface-variant",
                index === PROPERTY_GROUPS.length - 1 && PROPERTY_GROUPS.length % 2 !== 0 && "col-span-2"
              )}
            >
              {group.label}
            </button>
          ))}
        </div>
      </div>

      {/* Property Type */}
      <div>
        <label className="block text-xs font-bold text-outline uppercase tracking-widest mb-1.5">
          Property Type
        </label>
        <select
          className="w-full bg-surface border-none rounded-lg py-2.5 px-4 text-sm text-secondary focus:ring-2 focus:ring-primary/20 cursor-pointer"
          value={activePropertyType}
          onChange={(e) => updateParams({ propertyType: e.target.value || null })}
        >
          <option value="">All Types</option>
          {propertyTypeOptions.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      {/* Location: Country + City */}
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-outline uppercase tracking-widest mb-1.5">
            Country
          </label>
          <select
            className="w-full bg-surface border-none rounded-lg py-2.5 px-4 text-sm text-secondary focus:ring-2 focus:ring-primary/20 cursor-pointer"
            value={activeCountry}
            onChange={(e) => updateParams({ country: e.target.value || null, city: null, district: null })}
          >
            <option value="">All Countries</option>
            {PRIMARY_COUNTRIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
            <option value={OTHER_COUNTRY_VALUE}>Other</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-outline uppercase tracking-widest mb-1.5">
            City
          </label>
          <select
            className="w-full bg-surface border-none rounded-lg py-2.5 px-4 text-sm text-secondary focus:ring-2 focus:ring-primary/20 cursor-pointer"
            value={activeCity}
            onChange={(e) => updateParams({ city: e.target.value || null, district: null })}
          >
            <option value="">All Cities</option>
            {filterOptions.cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Price Range Slider */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs font-bold text-outline uppercase tracking-widest">
            Price Range
          </label>
        </div>
        <Slider.Root
          className="relative flex items-center select-none touch-none w-full h-4"
          value={priceRange}
          min={priceConfig.min}
          max={priceConfig.max}
          step={priceConfig.step}
          onValueChange={(value) => setDragPriceRange(value as [number, number])}
          onValueCommit={(value) => {
            setDragPriceRange(null);
            updateParams({
              minPrice: value[0] > priceConfig.min ? String(value[0]) : null,
              maxPrice: value[1] < priceConfig.max ? String(value[1]) : null,
            });
          }}
        >
          <Slider.Track className="bg-outline-variant relative grow rounded-full h-1.5">
            <Slider.Range className="absolute bg-primary rounded-full h-full" />
          </Slider.Track>
          <Slider.Thumb className="block w-4 h-4 bg-white border-2 border-primary rounded-full shadow-sm focus:outline-none" />
          <Slider.Thumb className="block w-4 h-4 bg-white border-2 border-primary rounded-full shadow-sm focus:outline-none" />
        </Slider.Root>
        <div className="flex justify-between mt-3 text-[10px] font-bold text-secondary uppercase">
          <span>{formatPriceLabel(priceRange[0], priceConfig.max)}</span>
          <span>{formatPriceLabel(priceRange[1], priceConfig.max)}</span>
        </div>
      </div>

      {/* ─── More Filters (collapsible) ─── */}
      <div>
        <button
          type="button"
          onClick={() => setMoreOpen((o) => !o)}
          className="w-full flex items-center justify-between py-2.5 px-4 bg-surface rounded-lg text-sm font-semibold text-secondary hover:bg-surface-variant transition-colors"
        >
          <span className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-base">tune</span>
            More Filters
            {moreFilterCount > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold bg-primary text-on-primary rounded-full">
                {moreFilterCount}
              </span>
            )}
          </span>
          <span
            className={cn(
              "material-symbols-outlined text-base transition-transform duration-200",
              moreOpen && "rotate-180"
            )}
          >
            expand_more
          </span>
        </button>

        {moreOpen && (
          <div className="mt-4 space-y-6">
            {/* Reference Number */}
            <div>
              <label className="block text-xs font-bold text-outline uppercase tracking-widest mb-1.5">
                Reference Number
              </label>
              <input
                className="w-full bg-surface border-none rounded-lg py-3 px-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline-variant"
                placeholder="e.g. GL-12345"
                type="text"
                value={refNumber}
                onChange={(e) => setRefNumber(e.target.value)}
              />
            </div>

            {/* District */}
            <div>
              <label className="block text-xs font-bold text-outline uppercase tracking-widest mb-1.5">
                District
              </label>
              <select
                className="w-full bg-surface border-none rounded-lg py-2.5 px-4 text-sm text-secondary focus:ring-2 focus:ring-primary/20 cursor-pointer"
                value={activeDistrict}
                onChange={(e) => updateParams({ district: e.target.value || null })}
              >
                <option value="">All Districts</option>
                {filterOptions.districts.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Area Range Slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-outline uppercase tracking-widest">
                  Space (sqm)
                </label>
              </div>
              <Slider.Root
                className="relative flex items-center select-none touch-none w-full h-4"
                value={areaRange}
                min={areaConfig.min}
                max={areaConfig.max}
                step={areaConfig.step}
                onValueChange={(value) => setDragAreaRange(value as [number, number])}
                onValueCommit={(value) => {
                  setDragAreaRange(null);
                  updateParams({
                    minArea: value[0] > areaConfig.min ? String(value[0]) : null,
                    maxArea: value[1] < areaConfig.max ? String(value[1]) : null,
                  });
                }}
              >
                <Slider.Track className="bg-outline-variant relative grow rounded-full h-1.5">
                  <Slider.Range className="absolute bg-primary rounded-full h-full" />
                </Slider.Track>
                <Slider.Thumb className="block w-4 h-4 bg-white border-2 border-primary rounded-full shadow-sm focus:outline-none" />
                <Slider.Thumb className="block w-4 h-4 bg-white border-2 border-primary rounded-full shadow-sm focus:outline-none" />
              </Slider.Root>
              <div className="flex justify-between mt-3 text-[10px] font-bold text-secondary uppercase">
                <span>{areaRange[0]} sqm</span>
                <span>{areaRange[1] >= areaConfig.max ? `${areaConfig.max.toLocaleString()}+` : `${areaRange[1].toLocaleString()} sqm`}</span>
              </div>
            </div>

            {/* Bedrooms & Bathrooms */}
            {activePropertyGroup !== "LAND" && (
              <div>
                <label className="block text-xs font-bold text-outline uppercase tracking-widest mb-3">
                  Rooms
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-outline uppercase tracking-widest mb-1">
                      Bedrooms
                    </label>
                    <select
                      className="w-full bg-surface border-none rounded-lg py-2.5 px-3 text-sm text-secondary focus:ring-2 focus:ring-primary/20 cursor-pointer"
                      value={activeBedrooms}
                      onChange={(e) => updateParams({ bedrooms: e.target.value || null })}
                    >
                      <option value="">Any</option>
                      <option value="1">1+</option>
                      <option value="2">2+</option>
                      <option value="3">3+</option>
                      <option value="4">4+</option>
                      <option value="5">5+</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-outline uppercase tracking-widest mb-1">
                      Bathrooms
                    </label>
                    <select
                      className="w-full bg-surface border-none rounded-lg py-2.5 px-3 text-sm text-secondary focus:ring-2 focus:ring-primary/20 cursor-pointer"
                      value={activeBathrooms}
                      onChange={(e) => updateParams({ bathrooms: e.target.value || null })}
                    >
                      <option value="">Any</option>
                      <option value="1">1+</option>
                      <option value="2">2+</option>
                      <option value="3">3+</option>
                      <option value="4">4+</option>
                      <option value="5">5+</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </aside>
  );
}
