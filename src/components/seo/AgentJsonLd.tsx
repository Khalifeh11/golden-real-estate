import JsonLd from "./JsonLd";
import type { Agent } from "@/types";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://goldenlandrealestate.net";

export default function AgentJsonLd({ agent }: { agent: Agent }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Person",
        name: `${agent.firstName} ${agent.lastName}`,
        jobTitle: "Real Estate Agent",
        url: `${siteUrl}/agents/${agent._id}`,
        ...(agent.email && { email: agent.email }),
        ...(agent.phone && { telephone: agent.phone }),
        ...(agent.photoUrl && { image: agent.photoUrl }),
        worksFor: {
          "@type": "RealEstateAgent",
          name: "Golden Land Real Estate",
          url: siteUrl,
        },
      }}
    />
  );
}
