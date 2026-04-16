import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import AgentCard from "@/components/AgentCard";
import { getAgents } from "@/lib/properties";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Meet Our Advisors | Golden Land Real Estate",
  description:
    "Dedicated professionals guiding you to your perfect property with local expertise and editorial precision.",
  openGraph: {
    title: "Meet Our Advisors | Golden Land Real Estate",
    description:
      "Dedicated professionals guiding you to your perfect property with local expertise and editorial precision.",
    url: "/agents",
  },
};

export default async function AgentsPage() {
  const agents = await getAgents();

  return (
    <>
      <div className="flex flex-col h-screen">
        <Navbar />
        {/* Hero */}
        <section className="relative flex-1 min-h-0 w-full flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src="/agents1.jpg"
              alt="Golden Land Real Estate team of advisors"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-[rgba(44,62,74,0.7)]" />
          </div>
          <div className="relative z-10 text-center max-w-4xl px-6">
            <h1 className="text-white font-display font-extrabold text-5xl md:text-7xl tracking-tight mb-6">
              Meet Our Advisors
            </h1>
            <p className="text-white/90 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              Dedicated professionals guiding you to your perfect property with
              local expertise and editorial precision.
            </p>
          </div>
        </section>
      </div>

      <main>

        {/* Agent Grid */}
        <section className="bg-surface-container-low py-20 px-6">
          <div className="max-w-[1280px] mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {agents.map((agent) => (
                <AgentCard key={agent._id} agent={agent} linkToProfile />
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-6">
          <div className="max-w-[1280px] mx-auto text-center">
            <h2 className="font-display text-3xl font-bold mb-8">
              Can&apos;t find the right advisor?
            </h2>
            <Link
              href="/contact"
              className="inline-block bg-gradient-to-br from-primary to-primary-container text-white px-10 py-4 rounded-xl font-display font-bold text-lg shadow-lg hover:brightness-110 transition-all active:scale-95"
            >
              Contact Us
            </Link>
          </div>
        </section>
      </main>
      <WhatsAppButton />
      <Footer />
    </>
  );
}
