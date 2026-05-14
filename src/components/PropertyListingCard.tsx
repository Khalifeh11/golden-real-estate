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
  const location = [property.district, property.city, property.country].filter(Boolean).join(", ");

  const hasStats = property.areaSqm != null || property.bedrooms != null ||
    property.bathrooms != null || property.parkings != null;

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


        <div className="mb-6">
          {formattedPrice ? (
            <div className="text-2xl font-bold text-primary tracking-tight">
              {formattedPrice}
              {!isSale && (
                <span className="text-sm font-normal text-outline"> /month</span>
              )}
            </div>
          ) : (
            <p className="text-on-surface text-xs ">Price on Request</p>
          )}
        </div>

    
      </div>
    </Link>
  );
}
