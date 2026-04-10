import JsonLd from "./JsonLd";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://goldenlandrealestate.net";

export default function OrganizationJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "RealEstateAgent",
        name: "Golden Land Real Estate",
        url: siteUrl,
        description:
          "Discover premium properties across Lebanon, Cyprus, and Greece. Golden Land Real Estate — your trusted partner in finding the perfect home.",
        areaServed: ["Lebanon", "Cyprus", "Greece"],
      }}
    />
  );
}
