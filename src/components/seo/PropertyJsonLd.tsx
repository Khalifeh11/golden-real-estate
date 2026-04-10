import JsonLd from "./JsonLd";
import type { Property } from "@/types";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://goldenlandrealestate.net";

export default function PropertyJsonLd({ property }: { property: Property }) {
  const sortedImages = [...(property.images ?? [])].sort(
    (a, b) => a.order - b.order,
  );
  const primaryImage = sortedImages[0]?.url;

  const address: Record<string, unknown> = {
    "@type": "PostalAddress",
    ...(property.district && { addressLocality: property.district }),
    ...(property.city && { addressRegion: property.city }),
    ...(property.country && { addressCountry: property.country }),
  };

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "RealEstateListing",
        name: property.title,
        ...(property.description && {
          description: property.description.replace(/<[^>]*>/g, ""),
        }),
        url: `${siteUrl}/properties/${property.slug}`,
        ...(primaryImage && { image: primaryImage }),
        ...(property.price != null && {
          price: property.price,
          priceCurrency: property.currency ?? "USD",
        }),
        address,
        ...(property.bedrooms != null && {
          numberOfRooms: property.bedrooms,
        }),
      }}
    />
  );
}
