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
};

export default async function AgentsPage() {
  const agents = await getAgents();

  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <header className="py-24 md:py-32 px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="font-display text-5xl md:text-[3.5rem] font-extrabold tracking-tight leading-tight mb-6">
              Meet Our Advisors
            </h1>
            <p className="text-xl text-on-surface-variant leading-relaxed max-w-2xl mx-auto">
              Dedicated professionals guiding you to your perfect property with
              local expertise and editorial precision.
            </p>
          </div>
        </header>

        {/* Agent Grid */}
        <section className="bg-surface-container-low py-20 px-6">
          <div className="max-w-[1280px] mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {agents.map((agent) => (
                <AgentCard key={agent._id} agent={agent} />
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
