import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | Golden Land Real Estate",
  description:
    "Golden Land Real Estate — a trusted Mediterranean property company since 2012. Discover our heritage, values, and the markets we serve.",
  openGraph: {
    title: "About Us | Golden Land Real Estate",
    description:
      "Golden Land Real Estate — a trusted Mediterranean property company since 2012. Discover our heritage, values, and the markets we serve.",
    url: "/about",
  },
};

const VALUES = [
  {
    icon: "workspace_premium",
    title: "Uncompromising Excellence",
    description:
      "We hold ourselves to an architectural standard of perfection in every listing and interaction.",
  },
  {
    icon: "handshake",
    title: "Trust & Transparency",
    description:
      "Integrity is the bedrock of our relationships, ensuring clarity from first inquiry to final key.",
  },
  {
    icon: "public",
    title: "Global Perspective",
    description:
      "Combining local expertise with an international network to bridge the world's finest markets.",
  },
  {
    icon: "concierge",
    title: "Bespoke Service",
    description:
      "Every client's journey is tailored, reflecting their unique goals and circumstances.",
  },
];

const MARKETS = [
  {
    name: "Lebanon",
    description:
      "Our largest market, with thousands of properties across Matn, Keserwan, Beirut, and dozens of other regions — from apartments and land to villas and commercial spaces.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC6QB9aivyBiLgS0I97gyRCcBVfFRw2tqJkWPzJoS0Y92NtXFH2uY8On3e8hgkN1623yb1CkU0NeqYd8oJ5UGfZiCF4ZN1RnieR0Dyl3rJgXPe_7fBjusQCFj6F50VAqc_FRN4E14oTtFWsYixtUeWftUYSM0JixENl3kYczU77VsPGLnHdM7hF2kdfq02EoMI78Bc37EILrVsRpm2HAcODZYNY-cQ-5PZC-w0qEGw3rXF8I2rw0P2A_DnmLtd5AKk9reGeoffDUEt6",
  },
  {
    name: "Cyprus",
    description:
      "A growing portfolio of residential and investment properties across the island, from coastal apartments to inland developments.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBMDEa-3x9LPhbql7tlI_O2WJffkSZlxCeg6uIOOX6QUhSdJD2T6uRahOFEQerOxO2Y3xz8aiyA_z3spiGoHGHrFMqpLhVKN2o9Bky7vaaUugiU3M7cnR-KlX7uhMg4BAQxn_sv-KBtuy5_J97aJmAYHS_DSz4JmGNEswiYHz9t3jxxkhJWhR3ylhMrl4R86dWmnzrN3N4OVtbI4V08nv60TFs20OY48dLDfu53ptTN5-s5oooCC9i_7yNxbNnBUDSXjZkW9Y_vF2k0",
  },
  {
    name: "Greece",
    description:
      "A diverse selection of properties centered on Athens and the surrounding regions, with opportunities across the mainland and islands.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCtE_ChBwtnwnXt3TydzlP0J6oeKTt_ev6j1CzR2UrysDFG30yVO7505Hlywyj5wAZWdBzRKHF_SZ0nxoIlZ9_jboGZPGDh21J_8eq_65VvsE1zky5T0agw2bKXeCTQhjFigerH7yTDcnXM37YQy2m0VfCBIa0GfbLbk1lvXevGhKJxit_goUyiviiErouHUxSq5_HjOloh84JfKOOEtgAb67Oe8z58EHcMa1-goAfotc8eduHIUIqeWj2810NNHTkcUFWYZ4ds4E9h",
  },
];

const STATS = [
  { value: "14+", label: "Years of Expertise" },
  { value: "500+", label: "Properties Sold" },
  { value: "3", label: "Primary Markets" },
  { value: "200+", label: "Global Clients" },
];

export default function AboutPage() {
  return (
    <>
      <div className="flex flex-col h-screen">
        <Navbar />
        {/* Hero */}
        <section className="relative flex-1 min-h-0 w-full flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAzKCoJq69WbnkMddm-xlkWesM9pEVOS5zABs6jppGngu0T07aSylWlVSxMvl9ab8xGLpOx9p-czAI9uAOzj7nZx_9XixwSMEZ0Yo6ywoVyGXBL7HURprD5yOT--h_7Nm_40zA73scjTkWJG3aSxBU9B-Dz82bgXT7M-6ftavrOlLvCOT9t73mZeI6A83rqVctfYMA4z7wg98RCii1ASeDN7MJx2Yb-WmXJoqJPMMQG0rYdYHmbTP2UCbx-kvls8r1zSMxZmcLeR-On"
              alt="Mediterranean coastline with turquoise water"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-[rgba(44,62,74,0.7)]" />
          </div>
          <div className="relative z-10 text-center max-w-4xl px-6">
            <h1 className="text-white font-display font-extrabold text-5xl md:text-7xl tracking-tight mb-6">
              Our Story
            </h1>
            <p className="text-white/90 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              A trusted Mediterranean property company since 2012.
            </p>
          </div>
        </section>
      </div>

      <main>
        {/* Who We Are */}
        <section className="py-24 md:py-32 bg-surface">
          <div className="max-w-[1280px] mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="absolute -top-6 -left-6 w-3/4 h-3/4 bg-primary-container/20 rounded-xl -z-10" />
              <div className="aspect-[4/5] rounded-xl overflow-hidden shadow-2xl relative">
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCL-z9mJ2jshS2cKEKRKkQhHUHFcz44SA0QAdZg3VYWCqgdUvdv75HAyMKtX1bcBN5J6D5_1-Bcf-WjJ-EfPzpOq4SblUhjIUJev0PflxO0J5TTbdSmILPpiBlLVvasUr5_o7ofVWtaSXB1u2YBb_3i-x1OWqHLB4ue4fGVGSjwU0J72MSO2bZXhfooaxUMyZWCsI6lLYa9C3z2Xu5mRtFZJ76yDa0N2lHTu3QQvyDw_J7qRgm1u64eeCIRa_cN7b0GHiEp0iSp5XJG"
                  alt="Luxury modern interior with floor-to-ceiling windows"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </div>
            <div className="space-y-8">
              <div>
                <span className="text-primary font-bold tracking-[0.2em] text-xs uppercase mb-3 block">
                  Our Heritage
                </span>
                <h2 className="font-display text-3xl md:text-5xl font-bold text-secondary tracking-tight">
                  A Legacy of Mediterranean Expertise
                </h2>
              </div>
              <div className="space-y-6 text-on-surface-variant text-lg leading-relaxed">
                <p>
                  Founded in 2012, Golden Land Real Estate began with a clear
                  mission: to make property search across the Mediterranean
                  straightforward, transparent, and rewarding. Over the past
                  decade, we have grown into one of the region&apos;s most
                  comprehensive property platforms, serving buyers, renters,
                  and investors alike.
                </p>
                <p>
                  Our philosophy is rooted in deep local knowledge and honest
                  guidance. We know these markets — the neighborhoods, the
                  pricing, the opportunities — and we put that expertise to
                  work for every client, whether they are searching for a
                  family apartment or a commercial investment.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Guiding Principles */}
        <section className="min-h-screen flex items-center bg-surface-container-low py-24 md:py-32">
          <div className="max-w-[1280px] mx-auto px-6">
            <div className="text-center mb-16">
              <span className="text-primary font-bold tracking-[0.2em] text-xs uppercase mb-3 block">
                What Drives Us
              </span>
              <h2 className="font-display text-3xl md:text-5xl font-bold text-secondary tracking-tight">
                Our Guiding Principles
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {VALUES.map((value) => (
                <div
                  key={value.title}
                  className="bg-surface p-8 rounded-xl space-y-4 hover:-translate-y-1 transition-transform duration-300"
                >
                  <span className="material-symbols-outlined text-primary text-4xl">
                    {value.icon}
                  </span>
                  <h3 className="font-display text-xl font-bold text-secondary">
                    {value.title}
                  </h3>
                  <p className="text-on-surface-variant text-sm leading-relaxed">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Markets We Serve */}
        <section className="py-24 md:py-32 bg-surface">
          <div className="max-w-[1280px] mx-auto px-6">
            <div className="mb-16">
              <span className="text-primary font-bold tracking-[0.2em] text-xs uppercase mb-3 block">
                Our Reach
              </span>
              <h2 className="font-display text-3xl md:text-5xl font-bold text-secondary tracking-tight">
                Three Primary Markets, One Standard of Service
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {MARKETS.map((market) => (
                <Link
                  key={market.name}
                  href={`/properties?country=${market.name}`}
                  className="group"
                >
                  <div className="overflow-hidden rounded-xl mb-6">
                    <div className="relative aspect-[4/3]">
                      <Image
                        src={market.image}
                        alt={market.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </div>
                  </div>
                  <h3 className="font-display text-2xl font-bold text-secondary mb-3">
                    {market.name}
                  </h3>
                  <p className="text-on-surface-variant text-sm leading-relaxed">
                    {market.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-20 bg-secondary">
          <div className="max-w-[1280px] mx-auto px-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 text-center">
              {STATS.map((stat) => (
                <div key={stat.label} className="space-y-2">
                  <div className="text-primary-container font-display text-4xl md:text-5xl font-extrabold">
                    {stat.value}
                  </div>
                  <div className="text-white/80 text-xs tracking-widest uppercase">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Meet the Team CTA */}
        <section className="py-24 md:py-32 bg-surface-container-low">
          <div className="max-w-[1280px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 order-2 lg:order-1">
              <div>
                <span className="text-primary font-bold tracking-[0.2em] text-xs uppercase mb-3 block">
                  Our Advisors
                </span>
                <h2 className="font-display text-3xl md:text-5xl font-bold text-secondary tracking-tight">
                  Meet the Experts Behind Your Journey
                </h2>
              </div>
              <p className="text-on-surface-variant text-lg leading-relaxed">
                Our multilingual team of property advisors brings together
                decades of experience in local markets, legal requirements,
                and financial planning to guide you through every step of the
                process.
              </p>
              <Link
                href="/agents"
                className="inline-flex items-center gap-2 bg-primary-container text-on-primary-container px-8 py-4 rounded-lg font-display font-bold text-sm tracking-widest uppercase hover:bg-primary hover:text-on-primary transition-colors group"
              >
                Meet Our Advisors
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </Link>
            </div>
            <div className="order-1 lg:order-2">
              <div className="relative aspect-[16/9] rounded-xl overflow-hidden shadow-xl">
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCnWuYWeEG_a4Qhj9UcliPhD2ZTfxm9P8Wf_Bx7g6XNcuxRUHq_sh20pqq5EUy10bOLtw0NgEUlivKBdOFGW8P-ZqZRUOwODnCR3CroUO_nCDjr3OUYEN0ewbbxJFyZgvDl6hlXaoqnV0VvosVlZDGe523NJHH5DMxjFGyWrjzkh4CrU5_bt1xWRr90wKpQJwm9e3kxhBz_nWuyas0Q6Z1I_wnAh8HZ76QyoRTUmZbzkOJevfgmiJWx9Dj0_--BZO0FBe1OWWW6gA5i"
                  alt="Golden Land Real Estate advisory team"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="py-24 md:py-40 bg-surface text-center">
          <div className="max-w-3xl mx-auto px-6 space-y-8">
            <div>
              <span className="text-primary font-bold tracking-[0.2em] text-xs uppercase mb-3 block">
                Get in Touch
              </span>
              <h2 className="font-display text-4xl md:text-6xl font-bold text-secondary tracking-tight">
                Begin Your Property Journey
              </h2>
            </div>
            <p className="text-on-surface-variant text-lg md:text-xl leading-relaxed">
              Connect with us today for a consultation, or browse our full
              portfolio of properties across the Mediterranean.
            </p>
            <div className="pt-6">
              <Link
                href="/contact"
                className="inline-flex items-center gap-3 bg-primary-container text-on-primary-container px-10 py-5 rounded-lg font-display font-bold text-sm tracking-widest uppercase hover:bg-primary hover:text-on-primary transition-colors group"
              >
                Contact Us
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                  east
                </span>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <WhatsAppButton />
      <Footer />
    </>
  );
}
