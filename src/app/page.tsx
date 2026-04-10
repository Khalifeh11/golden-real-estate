import Image from "next/image";
import Link from "next/link";
import { CATEGORIES, COUNTRIES } from "@/lib/constants";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import PropertyCard from "@/components/PropertyCard";
import { getFeaturedProperties } from "@/lib/properties";
import OrganizationJsonLd from "@/components/seo/OrganizationJsonLd";
import WebSiteJsonLd from "@/components/seo/WebSiteJsonLd";

export default async function Home() {
  const featuredProperties = await getFeaturedProperties();
  return (
    <>
      <OrganizationJsonLd />
      <WebSiteJsonLd />
      <div className="flex flex-col h-screen">
      <Navbar />

      {/* Hero Banner */}
      <section className="relative flex-1 min-h-0 w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuA5kpj27fJfrPYkvEUA4y7Ao4AAw-Pp0IuogltVTgr2V7xQC8jwMIqCIKqYuxmtfh3xYSGVd0b19zfoC4Caz8s1GYetOgjpg3p0bnA4hc6fRKNKSNO2WDhynPjzLetmRGTxB7gDkBLkFV9OHrfvOWteeRmbYSDGKTlFBAE2WPcE2bTcV_UJ7VvOVEC5fu8HjNEBu4ffEx3DPN8BsdRffQXNGJ5yLkhCIWPCeJFMAoijs2014Vj7PkT8j7Lax56mlKaRzrndegqyePv1"
            alt="Luxury coastal villa with infinity pool at sunset"
            fill
            className="object-cover"
            preload
          />
          <div className="absolute inset-0 bg-[rgba(44,62,74,0.7)]" />
        </div>

        <div className="relative z-10 w-full max-w-5xl px-6 text-center">
          <h1 className="font-display text-5xl md:text-7xl font-extrabold text-white mb-12 tracking-tight">
            Find Your Perfect Property
          </h1>

          {/* Search bar */}
          <div className="bg-surface/90 backdrop-blur-xl p-2 rounded-xl shadow-2xl max-w-4xl mx-auto">
            <form
              action="/properties"
              className="flex flex-col md:flex-row gap-2"
            >
              <div className="flex-1">
                <input
                  name="q"
                  type="text"
                  placeholder="Enter keywords..."
                  className="w-full bg-transparent border-none focus:ring-0 py-4 px-6 text-on-surface placeholder:text-outline font-medium"
                />
              </div>
              <div className="w-full md:w-48 border-l border-outline-variant/30">
                <select
                  name="category"
                  className="w-full bg-transparent border-none focus:ring-0 py-4 px-4 text-on-surface font-medium"
                >
                  <option value="">Buy / Rent</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-full md:w-48 border-l border-outline-variant/30">
                <select
                  name="country"
                  className="w-full bg-transparent border-none focus:ring-0 py-4 px-4 text-on-surface font-medium"
                >
                  <option value="">Country</option>
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="bg-primary-container text-on-primary-container hover:bg-primary hover:text-on-primary transition-all px-10 py-4 rounded-lg font-bold uppercase tracking-widest text-sm"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      </section>
      </div>

      <main className="max-w-[1280px] mx-auto px-6 space-y-32 my-32">
        {/* Featured Properties */}
        {featuredProperties.length > 0 && (
        <section>
          <div className="flex justify-between items-end mb-16">
            <div>
              <span className="text-primary font-bold tracking-[0.2em] text-xs uppercase mb-3 block">
                Featured
              </span>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-secondary">
                Featured Properties
              </h2>
            </div>
            <div className="hidden md:block">
              <Link
                href="/properties"
                className="text-secondary hover:text-primary transition-colors flex items-center gap-2 font-semibold"
              >
                View All Properties
                <span className="material-symbols-outlined text-sm">
                  arrow_forward
                </span>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {featuredProperties.map((property) => (
              <PropertyCard key={property.slug} property={property} />
            ))}
          </div>

          {/* Mobile "view all" link */}
          <div className="mt-10 text-center md:hidden">
            <Link
              href="/properties"
              className="text-secondary hover:text-primary transition-colors font-semibold"
            >
              View All Properties &rarr;
            </Link>
          </div>
        </section>
        )}

        {/* About / Heritage Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="relative">
            <div className="aspect-[4/5] rounded-xl overflow-hidden shadow-2xl z-10 relative">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCdz5nKiDqWB6Pf1vEe_FQj_xrZZtViePhEHIKQaIf5ZSIBmSVjpWWD533kfHM4c5WC9t8DXXBEPAgSdGmQev-zrqDD_fBYjf3rV6MJfaaDcSWOHaCo_vvty_3VukRRNwKWuBBQbNUhdO9L565r_SdgCQF9l3Osv17XsCAweQvRoS24y8jqaabvsQDlo6tZsdNpq69BBMuBhpYgDiNsCjdaIm5R3wn2-KRm1jMqaDFgXoljkSDztaxp0nxjwXXdYiOXSTh1-loeS3vF"
                alt="High-end interior design with marble and gold accents"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            <div className="absolute -bottom-10 -right-10 w-2/3 aspect-square bg-secondary-container rounded-xl -z-0 hidden md:block" />
            <div className="absolute -top-10 -left-10 w-1/2 aspect-video bg-primary-container/20 rounded-xl -z-0 hidden md:block" />
          </div>

          <div className="space-y-8">
            <div>
              <span className="text-primary font-bold tracking-[0.2em] text-xs uppercase mb-3 block">
                Our Heritage
              </span>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-secondary leading-tight">
                Mediterranean Real Estate, Redefined
              </h2>
            </div>
            <p className="text-secondary text-lg leading-relaxed opacity-90">
              Since 2010, Golden Land Real Estate has stood out through its
              personalized approach — taking the time to fully understand
              each client&apos;s needs and match them with the right
              opportunities. We combine local expertise with transparency
              to make every step of buying or selling smooth, clear, and
              stress-free.
            </p>
            <p className="text-secondary text-lg leading-relaxed opacity-90">
              We serve a diverse clientele — local buyers, members of the
              Lebanese diaspora, international investors, and expats — with
              a comprehensive portfolio spanning Lebanon, Cyprus, and Greece.
              Our aim is not just to close deals but to build lasting
              relationships based on trust and results.
            </p>
            <div className="pt-6">
              <Link
                href="/about"
                className="inline-block border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all px-8 py-3 rounded-lg font-bold uppercase tracking-widest text-sm"
              >
                Discover Our Story
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
