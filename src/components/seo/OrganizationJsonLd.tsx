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
        telephone: "+961-4-719775",
        address: {
          "@type": "PostalAddress",
          streetAddress:
            "Abou Jaoudeh Bldg. 7th floor, Inner main road",
          addressLocality: "Jal El Dib",
          addressCountry: "LB",
        },
        openingHoursSpecification: [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
            ],
            opens: "10:00",
            closes: "18:00",
          },
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: "Saturday",
            opens: "10:00",
            closes: "13:00",
          },
        ],
        areaServed: ["Lebanon", "Cyprus", "Greece"],
      }}
    />
  );
}
