import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { PropertyListingCardData } from "@/types";

interface PropertyListingCardProps {
  property: PropertyListingCardData;
}

export default function PropertyListingCard({ property }: PropertyListingCardProps) {
  const isSale = property.category === "FOR_SALE";
  const categoryLabel = isSale ? "For Sale" : "For Rent";

  // Format price matching Stitch: "USD 2,450,000" or "USD 2,500 /mo"
  const formattedPrice = property.price != null
    ? `${property.currency} ${property.price.toLocaleString("en-US")}`
    : null;

  // Location string: "District, City" or just "City"
  const location = [property.district, property.city].filter(Boolean).join(", ");

  return (
    <Link href={`/properties/${property.slug}`} className="group flex flex-col bg-white rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-secondary/5 border border-transparent hover:border-outline-variant/10">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
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
              className={cn(
                "text-[10px] font-bold uppercase tracking-widest py-1.5 px-3 rounded-full shadow-sm",
                isSale
                  ? "bg-primary-container text-on-primary-container"
                  : "bg-secondary-container text-on-secondary-container"
              )}
            >
              {categoryLabel}
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-6 flex-1 flex flex-col">
        {property.referenceNumber && (
          <div className="text-[10px] font-bold text-outline-variant mb-1 uppercase tracking-tighter">
            #{property.referenceNumber}
          </div>
        )}

        <h3 className="font-display text-lg font-bold text-secondary mb-1 leading-snug group-hover:text-primary transition-colors">
          {property.title}
        </h3>

        {location && (
          <p className="text-sm text-outline flex items-center gap-1 mb-4">
            <span className="material-symbols-outlined text-sm">location_on</span>
            {location}
          </p>
        )}

        {formattedPrice && (
          <div className="mb-6">
            <div className="text-2xl font-bold text-primary tracking-tight">
              {formattedPrice}
              {!isSale && (
                <span className="text-sm font-normal text-outline"> /mo</span>
              )}
            </div>
          </div>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-y-3 mb-6 border-t border-surface-container-low pt-4">
          {property.areaSqm != null && (
            <div className="flex items-center gap-2 text-outline">
              <span className="material-symbols-outlined text-sm">square_foot</span>
              <span className="text-xs font-semibold">{property.areaSqm} sqm</span>
            </div>
          )}
          {property.bedrooms != null && (
            <div className="flex items-center gap-2 text-outline">
              <span className="material-symbols-outlined text-sm">bed</span>
              <span className="text-xs font-semibold">{property.bedrooms} Beds</span>
            </div>
          )}
          {property.bathrooms != null && (
            <div className="flex items-center gap-2 text-outline">
              <span className="material-symbols-outlined text-sm">bathtub</span>
              <span className="text-xs font-semibold">{property.bathrooms} Baths</span>
            </div>
          )}
          {property.parkings != null && (
            <div className="flex items-center gap-2 text-outline">
              <span className="material-symbols-outlined text-sm">directions_car</span>
              <span className="text-xs font-semibold">{property.parkings} Parking</span>
            </div>
          )}
        </div>

        {/* Feature tags */}
        {property.features.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-auto">
            {property.features.map((feature) => (
              <span
                key={feature}
                className="bg-surface-container-low text-secondary text-[10px] font-bold px-2 py-1 rounded"
              >
                {feature}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
