"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useState, useEffect, useTransition } from "react";
import * as Slider from "@radix-ui/react-slider";
import { CATEGORIES, getSliderConfig } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { FilterOptions } from "@/types";

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
  const activeCountry = searchParams.get("country") ?? "";
  const activeCity = searchParams.get("city") ?? "";
  const activeDistrict = searchParams.get("district") ?? "";

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

  return (
    <aside
      className={cn(
        "w-full lg:w-[280px] shrink-0 lg:sticky lg:top-20 space-y-8 bg-surface-container-low p-6 rounded-xl",
        isPending && "opacity-70 pointer-events-none"
      )}
    >
      {/* Header */}
      <div>
        <h3 className="font-display text-lg font-bold text-secondary mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-sm">filter_list</span>
          Search Filters
        </h3>

        {/* Search & Ref */}
        <div className="space-y-4">
          <div className="relative">
            <input
              className="w-full bg-surface border-none rounded-lg py-3 px-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline-variant"
              placeholder="Keyword search..."
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
          <div className="relative">
            <input
              className="w-full bg-surface border-none rounded-lg py-3 px-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline-variant"
              placeholder="Reference Number"
              type="text"
              value={refNumber}
              onChange={(e) => setRefNumber(e.target.value)}
            />
          </div>
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

      {/* Location Selects */}
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
            {filterOptions.countries.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
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
      </div>

      {/* Price Range Slider */}
      <div className="space-y-6">
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
      </div>

      {/* Features */}
      {filterOptions.features.length > 0 && (
        <div>
          <label className="block text-xs font-bold text-outline uppercase tracking-widest mb-4">
            Features
          </label>
          <div className="space-y-3">
            {filterOptions.features.map((feature) => (
              <label key={feature} className="flex items-center gap-3 cursor-pointer group">
                <input
                  className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary/20"
                  type="checkbox"
                  checked={searchParams.getAll("features").includes(feature)}
                  onChange={(e) => {
                    const params = new URLSearchParams(searchParams.toString());
                    const current = params.getAll("features");
                    params.delete("features");
                    if (e.target.checked) {
                      [...current, feature].forEach((f) => params.append("features", f));
                    } else {
                      current.filter((f) => f !== feature).forEach((f) => params.append("features", f));
                    }
                    params.delete("page");
                    startTransition(() => {
                      router.push(`${pathname}?${params.toString()}`, { scroll: false });
                    });
                  }}
                />
                <span className="text-sm text-secondary group-hover:text-primary transition-colors">
                  {feature}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
