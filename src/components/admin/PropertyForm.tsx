"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import type { PropertyCreateData } from "@/lib/validators";
import type { Agent, PropertyImage } from "@/types";
import {
  CATEGORIES,
  STATUSES,
  PROPERTY_GROUPS,
  PROPERTY_TYPES,
  COUNTRIES,
  CURRENCIES,
} from "@/lib/constants";
import type { PropertyGroup } from "@/types";
import PropertyImageUpload from "./PropertyImageUpload";

interface PropertyFormProps {
  defaultValues?: Partial<PropertyCreateData> & { images?: PropertyImage[] };
  propertyId?: string;
}

export default function PropertyForm({ defaultValues, propertyId }: PropertyFormProps) {
  const router = useRouter();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [images, setImages] = useState<PropertyImage[]>(defaultValues?.images ?? []);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PropertyCreateData>({
    defaultValues: {
      currency: "USD",
      status: "ACTIVE",
      isFeatured: false,
      features: [],
      ...defaultValues,
    },
  });

  const propertyGroup = watch("propertyGroup") as PropertyGroup | undefined;
  const isResidential = propertyGroup === "RESIDENTIAL";

  useEffect(() => {
    fetch("/api/agents")
      .then((r) => r.json())
      .then(setAgents)
      .catch(() => {});
  }, []);

  function cleanFormData(data: PropertyCreateData): PropertyCreateData {
    const cleaned = { ...data };
    const numberFields = ["price", "areaSqm", "bedrooms", "bathrooms", "parkings", "yearBuilt"] as const;
    for (const field of numberFields) {
      if (typeof cleaned[field] === "number" && Number.isNaN(cleaned[field])) {
        cleaned[field] = undefined;
      }
    }
    if (!cleaned.agentId) {
      cleaned.agentId = undefined;
    }
    return cleaned;
  }

  async function onSubmit(raw: PropertyCreateData) {
    const data = cleanFormData(raw);
    setSaving(true);
    setError("");

    const url = propertyId ? `/api/properties/${propertyId}` : "/api/properties";
    const method = propertyId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, images }),
    });

    if (!res.ok) {
      const json = await res.json();
      setError(json.error?.formErrors?.[0] ?? "Failed to save property.");
      setSaving(false);
      return;
    }

    router.push("/admin/properties");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-3xl">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Basic Info */}
      <section className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Basic Information</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
          <input
            {...register("title", { required: "Title is required" })}
            className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            {...register("description")}
            rows={4}
            className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 resize-y"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <select
              {...register("category", { required: "Category is required" })}
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              <option value="">Select...</option>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
            {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              {...register("status")}
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Property Group *</label>
            <select
              {...register("propertyGroup", { required: "Property group is required" })}
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              <option value="">Select...</option>
              {PROPERTY_GROUPS.map((g) => (
                <option key={g.value} value={g.value}>{g.label}</option>
              ))}
            </select>
            {errors.propertyGroup && <p className="text-red-500 text-xs mt-1">{errors.propertyGroup.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Property Type *</label>
            <select
              {...register("propertyType", { required: "Property type is required" })}
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
              disabled={!propertyGroup}
            >
              <option value="">Select...</option>
              {propertyGroup &&
                PROPERTY_TYPES[propertyGroup]?.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
            </select>
            {errors.propertyType && <p className="text-red-500 text-xs mt-1">{errors.propertyType.message}</p>}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Pricing</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
            <input
              type="number"
              min={0}
              {...register("price", { valueAsNumber: true })}
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
            <select
              {...register("currency")}
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Location</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
            <select
              {...register("country", { required: "Country is required" })}
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              <option value="">Select...</option>
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
            <input
              {...register("city", { required: "City is required" })}
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
            {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
            <input
              {...register("district")}
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
          </div>
        </div>
      </section>

      {/* Details */}
      <section className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Details</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Area (sqm)</label>
            <input
              type="number"
              min={0}
              {...register("areaSqm", { valueAsNumber: true })}
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
          </div>
          {isResidential && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                <input
                  type="number"
                  min={0}
                  {...register("bedrooms", { valueAsNumber: true })}
                  className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
                <input
                  type="number"
                  min={0}
                  {...register("bathrooms", { valueAsNumber: true })}
                  className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
              </div>
            </>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Parkings</label>
            <input
              type="number"
              min={0}
              {...register("parkings", { valueAsNumber: true })}
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year Built</label>
            <input
              type="number"
              min={1800}
              {...register("yearBuilt", { valueAsNumber: true })}
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">View</label>
            <input
              {...register("view")}
              placeholder="Sea, Mountain..."
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
          </div>
        </div>
      </section>

      {/* Images */}
      <PropertyImageUpload images={images} onChange={setImages} />

      {/* Agent + Options */}
      <section className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Assignment</h2>
        <div className="grid grid-cols-2 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Agent</label>
            <select
              {...register("agentId")}
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              <option value="">Unassigned</option>
              {agents.map((a) => (
                <option key={a._id} value={a._id}>
                  {a.firstName} {a.lastName}
                </option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-2 cursor-pointer pb-2">
            <input
              type="checkbox"
              {...register("isFeatured")}
              className="w-4 h-4"
            />
            <span className="text-sm text-gray-700">Mark as featured</span>
          </label>
        </div>
      </section>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="bg-gray-900 text-white px-6 py-2 rounded text-sm hover:bg-gray-700 disabled:opacity-50 transition-colors"
        >
          {saving ? "Saving..." : propertyId ? "Update Property" : "Create Property"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm text-gray-500 hover:underline"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
