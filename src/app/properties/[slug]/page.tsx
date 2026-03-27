import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPropertyBySlug, getAgentById, getSimilarProperties } from "@/lib/properties";
import { formatPrice, formatArea, categoryLabel, featureIcon } from "@/lib/utils";
import PropertyGallery from "@/components/PropertyGallery";
import AgentCard from "@/components/AgentCard";
import InquiryForm from "@/components/InquiryForm";
import PropertyCard from "@/components/PropertyCard";
import Navbar from "@/components/Navbar";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);

  if (!property) {
    return { title: "Property Not Found | Golden Land Real Estate" };
  }

  const title = `${property.title} | Golden Land Real Estate`;
  const description = property.description
    ? property.description.slice(0, 160)
    : `${property.title} — ${categoryLabel(property.category ?? "FOR_SALE")} in ${[property.district, property.city, property.country].filter(Boolean).join(", ")}`;

  const primaryImage = [...(property.images ?? [])].sort(
    (a, b) => a.order - b.order,
  )[0];

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      ...(primaryImage && {
        images: [{ url: primaryImage.url, alt: primaryImage.altText }],
      }),
    },
  };
}

export default async function PropertyDetailPage({ params }: Props) {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);
  if (!property) notFound();

  const [agent, similarProperties] = await Promise.all([
    property.agentId ? getAgentById(property.agentId) : null,
    getSimilarProperties(property),
  ]);

  const sortedImages = [...(property.images ?? [])].sort(
    (a, b) => a.order - b.order,
  );
  const features = property.features ?? [];

  const location = [property.district, property.city, property.country]
    .filter(Boolean)
    .join(", ");

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16 max-w-7xl mx-auto px-4 md:px-8">
      {/* Photo Gallery */}
      <PropertyGallery images={sortedImages} title={property.title} />

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Left Column */}
        <div className="lg:w-2/3">
          {/* Header */}
          <header className="mb-8">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              {property.category && (
                <span className="bg-primary-container text-on-primary-container px-3 py-1 rounded text-[0.75rem] font-bold tracking-widest uppercase">
                  {categoryLabel(property.category)}
                </span>
              )}
              {property.referenceNumber && (
                <span className="text-secondary font-medium text-sm">
                  REF #{property.referenceNumber}
                </span>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-extrabold text-on-surface tracking-tight mb-2">
              {property.title}
            </h1>
            {location && (
              <div className="flex items-center gap-1 text-secondary mb-6">
                <span className="material-symbols-outlined text-sm">
                  location_on
                </span>
                <span className="text-sm">{location}</span>
              </div>
            )}
            <div className="text-3xl font-display font-bold text-primary-container">
              {property.price != null
                ? formatPrice(property.price, property.currency, property.category)
                : "Price on Request"}
            </div>
          </header>

          {/* Spec Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-surface-container-low rounded-xl mb-12 border border-outline-variant/10">
            {property.areaSqm != null && (
              <div className="flex flex-col items-center text-center p-2">
                <span
                  className="material-symbols-outlined text-secondary mb-2"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  square_foot
                </span>
                <span className="text-xs uppercase text-outline tracking-wider">
                  Area
                </span>
                <span className="font-display font-bold text-lg">
                  {formatArea(property.areaSqm)}
                </span>
              </div>
            )}
            {property.bedrooms != null && (
              <div className="flex flex-col items-center text-center p-2">
                <span
                  className="material-symbols-outlined text-secondary mb-2"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  bed
                </span>
                <span className="text-xs uppercase text-outline tracking-wider">
                  Beds
                </span>
                <span className="font-display font-bold text-lg">
                  {property.bedrooms} {property.bedrooms === 1 ? "Bedroom" : "Bedrooms"}
                </span>
              </div>
            )}
            {property.bathrooms != null && (
              <div className="flex flex-col items-center text-center p-2">
                <span
                  className="material-symbols-outlined text-secondary mb-2"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  bathtub
                </span>
                <span className="text-xs uppercase text-outline tracking-wider">
                  Baths
                </span>
                <span className="font-display font-bold text-lg">
                  {property.bathrooms} {property.bathrooms === 1 ? "Bathroom" : "Bathrooms"}
                </span>
              </div>
            )}
            {property.parkings != null && (
              <div className="flex flex-col items-center text-center p-2">
                <span
                  className="material-symbols-outlined text-secondary mb-2"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  local_parking
                </span>
                <span className="text-xs uppercase text-outline tracking-wider">
                  Parking
                </span>
                <span className="font-display font-bold text-lg">
                  {property.parkings} {property.parkings === 1 ? "Slot" : "Slots"}
                </span>
              </div>
            )}
          </div>

          {/* Description */}
          {property.description && (
            <section className="mb-12">
              <h2 className="text-2xl font-display font-bold text-secondary mb-6">
                Description
              </h2>
              <div className="text-on-surface-variant leading-relaxed text-lg space-y-4">
                {property.description.split("\n").filter(Boolean).map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </section>
          )}

          {/* Amenities */}
          {features.length > 0 && (
            <section className="mb-12 pt-12 border-t border-outline-variant/20">
              <h2 className="text-2xl font-display font-bold text-secondary mb-8">
                What this place offers
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                {features.map((feature) => (
                  <div key={feature} className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-2xl text-secondary">
                      {featureIcon(feature)}
                    </span>
                    <span className="text-on-surface">{feature}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Column — Sidebar */}
        <aside className="lg:w-1/3">
          <div className="sticky top-28 space-y-8">
            {agent && <AgentCard agent={agent} />}
            <InquiryForm
              propertySlug={property.slug}
              propertyTitle={property.title}
            />
          </div>
        </aside>
      </div>

      {/* Similar Properties */}
      {similarProperties.length > 0 && (
        <section className="mt-24 pt-24 border-t border-outline-variant/20">
          <h2 className="text-3xl font-display font-extrabold mb-12">
            Similar Exclusive Listings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {similarProperties.map((p) => (
              <PropertyCard key={p.slug} property={p} />
            ))}
          </div>
        </section>
      )}
    </main>
    </>
  );
}
