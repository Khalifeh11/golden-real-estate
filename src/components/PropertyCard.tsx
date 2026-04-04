import Image from "next/image";
import Link from "next/link";
import { formatPrice, categoryLabel } from "@/lib/utils";
import type { PropertyCardData } from "@/types";

interface PropertyCardProps {
  property: PropertyCardData;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  return (
    <Link href={`/properties/${property.slug}`} className="group">
      <div className="relative overflow-hidden rounded-xl mb-6 aspect-[4/3]">
        <Image
          src={property.image}
          alt={property.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {property.category && (
          <div className="absolute top-4 left-4">
            <span
              className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase shadow-sm ${
                property.category === "FOR_RENT"
                  ? "bg-secondary-container text-on-secondary-container"
                  : "bg-primary-container text-on-primary-container"
              }`}
            >
              {categoryLabel(property.category)}
            </span>
          </div>
        )}
      </div>
      <div className="space-y-3">
        <div className="flex justify-between items-start">
          <h3 className="font-display text-2xl font-bold text-on-surface">
            {property.title}
          </h3>
          {property.price != null ? (
            <p className="text-secondary font-bold text-xl">
              {formatPrice(property.price, property.currency, property.category)}
            </p>
          ) : (
            <p className="text-on-surface text-xs">Price on Request</p>
          )}
        </div>
        <div className="flex items-center gap-6 text-on-secondary-container text-sm">
          {property.areaSqm != null && (
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-lg">
                square_foot
              </span>
              {property.areaSqm} sqm
            </span>
          )}
          {property.bedrooms != null && (
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-lg">bed</span>
              {property.bedrooms}
            </span>
          )}
          {property.bathrooms != null && (
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-lg">
                bathtub
              </span>
              {property.bathrooms}
            </span>
          )}
        </div>
        {property.referenceNumber && (
          <p className="text-outline text-xs tracking-wider">
            REF: #{property.referenceNumber}
          </p>
        )}
      </div>
    </Link>
  );
}
