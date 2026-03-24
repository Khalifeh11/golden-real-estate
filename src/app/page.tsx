import Image from "next/image";
import Link from "next/link";
import { CATEGORIES, COUNTRIES } from "@/lib/constants";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

// Placeholder featured properties — will be replaced with DB query
const FEATURED_PROPERTIES = [
  {
    slug: "ocean-view-estate",
    title: "Ocean View Estate",
    price: 4_250_000,
    currency: "USD",
    category: "FOR_SALE" as const,
    areaSqm: 450,
    bedrooms: 5,
    bathrooms: 4,
    referenceNumber: "225520",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBqRRdkdKRwFcCN88n12vM1uLE1HSc5MAxTTCk6UYOuFXqRyViBx_dQaX_nExVpSV13dbSB5-AQuI-xF8Buoy8Yqhvaw85vGyCk2cwtgrvkpVyLuYy2Stjg8A-5xGCh6SQFNWOHpwtT8DT-IPPDs7w7nfcUgiQ619Fzx6Fc0nY3mBIzEaxyAUYAGcbqbRfZtj4M4dPIC5iQk6_KU4irye8W55sFxSMiAZH1ngRYrVv0oZRGxZmchgveTCIbEA4p8CqL9eg56cqGtMpq",
  },
  {
    slug: "the-azure-penthouse",
    title: "The Azure Penthouse",
    price: 12_000,
    currency: "USD",
    category: "FOR_RENT" as const,
    areaSqm: 280,
    bedrooms: 3,
    bathrooms: 3,
    referenceNumber: "225521",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC2F4bZXayDrYNdLgkUExO_zr8IP6DvJ25eDM750a3hY36kH1jG60D5lTD7vNbumv1JlNNt-b3HS8jMFlbjY3tFEWhKmOTjISbtNQm9iR_3L_Wco3-jRmLDPx4l0u2qKcAn3zW8Dw7wh0jR27v5pLjva4XtAl5-wwyfv_7-_knReii0TClqc2q_XCOxGTpJyY1kxsGAqg9ZiMuJ49koW6FyQpWCZIDli45cpwurt8t80uDw9Jz7LMHqKrmTbeDKZA67cx1JqzrqyfFs",
  },
  {
    slug: "cedar-hill-retreat",
    title: "Cedar Hill Retreat",
    price: 1_890_000,
    currency: "USD",
    category: "FOR_SALE" as const,
    areaSqm: 320,
    bedrooms: 4,
    bathrooms: 3,
    referenceNumber: "225522",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC_rQ_5-UWOxSE9-DewglLMSCfh_DVVxrG4K6UgFkn2ZCTgO2q1K8u9NiPByvWK0wnPHp5ko6p3MDKzSohijuU5lJMKB6lQXMf7ZDP5GRgabsS-86r8_-l07re4U6N0vlcwYumW-wpRvQB9aCRLao1q2Bb21EDPJOFEAWlRZsVXNqUdvu_WSPl-49Elk7Y39r5fAeljXZYwPrl-IpN_9-BDLhpVE_yB1TWaRb3gaHndwEj8BBscxJpr2ykgSt8hgP5kWG6978vfdg4C",
  },
  {
    slug: "emerald-forest-lodge",
    title: "Emerald Forest Lodge",
    price: 2_100_000,
    currency: "USD",
    category: "FOR_SALE" as const,
    areaSqm: 190,
    bedrooms: 2,
    bathrooms: 2,
    referenceNumber: "225523",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAftt3_sTDQOBFAN-JZb_GWPtKKoww84Y9yJgmcliduhiEohnyNySFAGk00rOghGDy1hB6suDATXk_V2x52GYpMRF0Qe42_SCfqi3KFpk2ZXM9BQQJMwYgvdL7eS3ytP0tprZvqhCCkzSqXIhxuStX6Hf_Pp_cAc7FbTXMteShlIUlXUCznFrwTWURqPVyoClGC7JH9nM6kCcbPfFkP8gDpTCsJFhinU6BtYFYjbZH4f5xnSMO07pGRTpuSDXPnAsG2rzlcEfkCpJLR",
  },
  {
    slug: "the-legacy-manor",
    title: "The Legacy Manor",
    price: 5_750_000,
    currency: "USD",
    category: "FOR_SALE" as const,
    areaSqm: 850,
    bedrooms: 7,
    bathrooms: 6,
    referenceNumber: "225524",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBirYw-KcN7vxTbrd7uwjYMWOipKZ8MyAgpuXeBmDq0Y17FhHBnhPdKI14yFhGWFva5itIl0khRIQdbKE8CbZuWGSkqPe3U4qqewpsC-oR0X9W5WlrxMtHlVb7HcCXMSMQTGWsi7qa9VAAWAgZ8pDcWDBAhWb2JtQuGcv81BDjnTlppyjcgg-JqrXgJaRa90WTm7IKjwv-zOnIU19qRdLBLZw1TGre6lP56jlLrbEzxGU4JRwBfZYbSkLB0sukdU94-_cEuSZwYVktz",
  },
  {
    slug: "crystal-horizon",
    title: "Crystal Horizon",
    price: 3_400_000,
    currency: "USD",
    category: "FOR_SALE" as const,
    areaSqm: 410,
    bedrooms: 4,
    bathrooms: 4,
    referenceNumber: "225525",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA_u7257JlmMUFGeTGMWY8pF429MskPB_k2NhqgVVG6sdmwBr0LN1K0cpEP-9ylnaIuX14u8M1RVjaVC196Y4_I8sywl6o2daOBtc8elOwW3ZCgTfqjkTVaPp_gSTLD9exqwrO1HIOq6-aHA7oGzwZruRvpWHXACqBKFGAdhDtb6XOxtB7gjx2uNNKoFc6fcKjMenofxQQxUOBNkGWg1xTFH1SnNNaZQPqipxQ0-93meLR_Po51QT9NtkDQ-oc3QpeAcUBBJu0KXMa3",
  },
];

function formatPrice(price: number, currency: string, category: string) {
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
  return category === "FOR_RENT" ? `${formatted} / mo` : formatted;
}

function categoryLabel(category: string) {
  return CATEGORIES.find((c) => c.value === category)?.label ?? category;
}

export default function Home() {
  return (
    <>
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
        <section>
          <div className="flex justify-between items-end mb-16">
            <div>
              <span className="text-primary font-bold tracking-[0.2em] text-xs uppercase mb-3 block">
                Curated Selection
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
                View All Collections
                <span className="material-symbols-outlined text-sm">
                  arrow_forward
                </span>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {FEATURED_PROPERTIES.map((property) => (
              <Link
                key={property.slug}
                href={`/properties/${property.slug}`}
                className="group"
              >
                <div className="relative overflow-hidden rounded-xl mb-6 aspect-[4/3]">
                  <Image
                    src={property.image}
                    alt={property.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute top-4 left-4">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase shadow-sm ${
                        property.category === "FOR_RENT"
                          ? "bg-secondary-container text-on-secondary-container"
                          : "bg-primary-container text-on-primary-container"
                      }`}
                    >
                      {categoryLabel(property.category)}
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <h3 className="font-display text-2xl font-bold text-on-surface">
                      {property.title}
                    </h3>
                    <p className="text-secondary font-bold text-xl">
                      {formatPrice(
                        property.price,
                        property.currency,
                        property.category
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-6 text-on-secondary-container text-sm">
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-lg">
                        square_foot
                      </span>
                      {property.areaSqm} sqm
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-lg">
                        bed
                      </span>
                      {property.bedrooms}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-lg">
                        bathtub
                      </span>
                      {property.bathrooms}
                    </span>
                  </div>
                  <p className="text-outline text-xs tracking-wider">
                    REF: #{property.referenceNumber}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* Mobile "view all" link */}
          <div className="mt-10 text-center md:hidden">
            <Link
              href="/properties"
              className="text-secondary hover:text-primary transition-colors font-semibold"
            >
              View All Collections &rarr;
            </Link>
          </div>
        </section>

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
                Refined Coastal Luxury
              </h2>
            </div>
            <p className="text-secondary text-lg leading-relaxed opacity-90">
              At Golden Land Real Estate, we believe a home is more than just a
              structure — it is a masterpiece of architectural mastery and a
              sanctuary for the soul. Specializing in high-end coastal
              properties, we curate a portfolio that defines the horizon of
              modern living.
            </p>
            <p className="text-secondary text-lg leading-relaxed opacity-90">
              Our commitment to excellence ensures that every transaction is
              handled with the same precision and artistry as the properties we
              represent. Experience a refined concierge service tailored to the
              most discerning global clients.
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
