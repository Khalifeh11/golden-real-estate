import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getAgentById, getPropertiesByAgentId } from "@/lib/properties";
import { agentFullName, formatWhatsAppUrl } from "@/lib/utils";
import PropertyCard from "@/components/PropertyCard";
import Pagination from "@/components/Pagination";
import AgentInitials from "@/components/AgentInitials";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import AgentJsonLd from "@/components/seo/AgentJsonLd";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import { OG_DEFAULTS } from "@/lib/seo";

// Render on every request so admin changes (e.g. deleting an agent) appear immediately.
export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const agent = await getAgentById(id);

  if (!agent) {
    return { title: "Agent Not Found | Golden Land Real Estate" };
  }

  const fullName = agentFullName(agent.firstName, agent.lastName);
  const title = `${fullName} — Property Advisor | Golden Land Real Estate`;
  const description = agent.bio?.trim()
    ? agent.bio.slice(0, 160)
    : `${fullName} is a property advisor at Golden Land Real Estate.`;

  return {
    title,
    description,
    openGraph: {
      ...OG_DEFAULTS,
      title,
      description,
      type: "profile",
      ...(agent.photoUrl && {
        images: [{ url: agent.photoUrl, alt: fullName }],
      }),
    },
  };
}

export default async function AgentProfilePage({ params, searchParams }: Props) {
  const { id } = await params;
  const { page: pageParam } = await searchParams;
  const agent = await getAgentById(id);
  if (!agent) notFound();

  const requestedPage = Number.parseInt(pageParam ?? "1", 10);
  const {
    properties,
    total,
    page: currentPage,
    totalPages,
  } = await getPropertiesByAgentId(agent._id, requestedPage);
  const fullName = agentFullName(agent.firstName, agent.lastName);

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://goldenlandrealestate.net";

  return (
    <>
      <AgentJsonLd agent={agent} />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: siteUrl },
          { name: "Our Advisors", url: `${siteUrl}/agents` },
          { name: fullName, url: `${siteUrl}/agents/${agent._id}` },
        ]}
      />
      <Navbar />
      <main>
        {/* Agent Profile Header */}
        <header className="py-24 md:py-32 px-6">
          <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
            {agent.photoUrl ? (
              <Image
                src={agent.photoUrl}
                alt={fullName}
                width={128}
                height={128}
                className="w-32 h-32 rounded-full object-cover mb-6"
              />
            ) : (
              <div className="mb-6">
                <AgentInitials
                  firstName={agent.firstName}
                  lastName={agent.lastName}
                  size="lg"
                />
              </div>
            )}

            <h1 className="font-display text-5xl md:text-[3.5rem] font-extrabold tracking-tight leading-tight mb-2">
              {fullName}
            </h1>
            <p className="text-primary-container text-sm uppercase tracking-widest font-bold mb-6">
              Property Advisor
            </p>

            {agent.bio && (
              <p className="text-xl text-on-surface-variant leading-relaxed max-w-2xl mb-8">
                {agent.bio}
              </p>
            )}

            {/* Contact info */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
              {agent.email && (
                <a
                  href={`mailto:${agent.email}`}
                  className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  <span
                    className="material-symbols-outlined text-lg"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    mail
                  </span>
                  <span className="text-sm">{agent.email}</span>
                </a>
              )}
              {agent.phone && (
                <a
                  href={`tel:${agent.phone}`}
                  className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  <span
                    className="material-symbols-outlined text-lg"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    call
                  </span>
                  <span className="text-sm">{agent.phone}</span>
                </a>
              )}
            </div>

            {/* Action buttons */}
            {agent.phone && (
              <div className="flex flex-wrap gap-4 justify-center">
                <a
                  href={formatWhatsAppUrl(agent.phone)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-[#25D366] text-white px-8 py-3 rounded-lg font-bold hover:brightness-110 transition-all"
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    chat
                  </span>
                  WhatsApp
                </a>
                <a
                  href={`tel:${agent.phone}`}
                  className="flex items-center justify-center gap-2 bg-secondary text-white px-8 py-3 rounded-lg font-bold hover:brightness-110 transition-all"
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    call
                  </span>
                  Call Agent
                </a>
              </div>
            )}
          </div>
        </header>

        {/* Agent Listings */}
        <section className="bg-surface-container-low py-20 px-6">
          <div className="max-w-[1280px] mx-auto">
            <h2 className="font-display text-3xl font-extrabold mb-12">
              {total > 0
                ? `Listings by ${agent.firstName} (${total})`
                : `No Active Listings`}
            </h2>
            {total > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {properties.map((property) => (
                    <PropertyCard key={property.slug} property={property} />
                  ))}
                </div>
                <Pagination currentPage={currentPage} totalPages={totalPages} />
              </>
            ) : (
              <p className="text-on-surface-variant text-lg">
                {agent.firstName} currently has no active property listings.
                Check back soon for new additions.
              </p>
            )}
          </div>
        </section>
      </main>
      <WhatsAppButton />
      <Footer />
    </>
  );
}
