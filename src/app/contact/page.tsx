import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import InquiryForm from "@/components/InquiryForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | Golden Land Real Estate",
  description:
    "Get in touch with Golden Land Real Estate for a private consultation or to explore our exclusive portfolio of Mediterranean properties in Lebanon, Cyprus, and Greece.",
};

const CONTACT_DETAILS = [
  {
    icon: "phone_iphone",
    label: "Inquiries",
    value: "+961 1 234 567",
    href: "tel:+9611234567",
  },
  {
    icon: "mail",
    label: "Email",
    value: "info@goldenlandre.com",
    href: "mailto:info@goldenlandre.com",
  },
  {
    icon: "schedule",
    label: "Office Hours",
    value: "Mon — Fri: 09:00 - 18:00",
  },
];

const OFFICES = [
  { name: "Beirut Office", address: "Mar Mikhael, Heritage District, LBP" },
  { name: "Limassol HQ", address: "Beach Road, Marina Tower 4, CYP" },
  { name: "Athens Atelier", address: "Kolonaki Square, Elite Suites, GRC" },
];

export default function ContactPage() {
  return (
    <>
      <div className="flex flex-col h-screen">
        <Navbar />
        {/* Hero */}
        <section className="relative flex-1 min-h-0 w-full flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuD1qiaCkMR-xH1qK0UzNk5kJmBu5s06I-mBjgvDm2XQf9NcRM0KcGDkg4XHes6t11EAqivqnsPwVaDd9b1XyxGLO2wiaTdKXKAZPGKmKh3UACIpaUmiccrfHPgAk5SNXPHAo7jjQf5tjxHBhmD7a2RgTcRN-m0QLzjvy29tRXsKhF0tuCHd_pdiHmWlcw-glMDdbk4dJySo3liCcSMzIWVd1Ue_0UcjxhY9QBdXD0RgNcQ9tbfs6ennFmO_vpb7Op6f0lbM96U7yuMi"
              alt="Amalfi coast with blue Mediterranean sea and pastel houses on cliffs"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-[rgba(44,62,74,0.7)]" />
          </div>
          <div className="relative z-10 text-center max-w-4xl px-6">
            <h1 className="text-white font-display font-extrabold text-5xl md:text-7xl tracking-tight mb-6">
              Get in Touch
            </h1>
            <p className="text-white/90 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              We&rsquo;d love to hear from you. Reach out for a private
              consultation or to explore our exclusive portfolio of
              Mediterranean estates.
            </p>
          </div>
        </section>
      </div>

      <main>
        {/* Form + Contact Info */}
        <section className="py-24 md:py-32 bg-surface">
          <div className="max-w-[1280px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16">
            {/* Form */}
            <div className="lg:col-span-7">
              <InquiryForm
                heading="Send Us a Message"
                subject="General Inquiry"
                submitLabel="Send Inquiry"
              />
            </div>

            {/* Contact Details */}
            <div className="lg:col-span-5 flex flex-col justify-between">
              <div>
                <h2 className="font-display text-3xl font-bold mb-8 text-secondary">
                  Contact Details
                </h2>

                <div className="space-y-6 mb-16">
                  {CONTACT_DETAILS.map((item) => (
                    <div key={item.icon} className="flex items-start gap-4">
                      <span className="material-symbols-outlined text-primary-container text-3xl">
                        {item.icon}
                      </span>
                      <div>
                        <p className="text-[0.65rem] uppercase tracking-widest text-outline mb-1">
                          {item.label}
                        </p>
                        {item.href ? (
                          <a
                            href={item.href}
                            className="text-xl font-semibold text-secondary hover:text-primary transition-colors"
                          >
                            {item.value}
                          </a>
                        ) : (
                          <p className="text-xl font-semibold text-secondary">
                            {item.value}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {OFFICES.map((office) => (
                    <div
                      key={office.name}
                      className="bg-surface-container rounded-xl p-6 flex gap-4 items-center"
                    >
                      <div className="bg-surface-container-highest p-3 rounded-lg text-primary">
                        <span className="material-symbols-outlined">
                          location_on
                        </span>
                      </div>
                      <div>
                        <h4 className="font-bold text-secondary">
                          {office.name}
                        </h4>
                        <p className="text-sm text-outline">
                          {office.address}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="py-24 md:py-32 bg-surface">
          <div className="max-w-[1280px] mx-auto px-6">
            <div className="bg-secondary rounded-xl p-12 md:p-20 text-center flex flex-col items-center shadow-2xl shadow-secondary/20">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
                Prefer a direct conversation?
              </h2>
              <p className="text-secondary-container/80 text-lg mb-10 max-w-xl">
                Schedule a private call with one of our advisors to discuss your
                specific investment criteria.
              </p>
              <a
                href="https://wa.me/+96170123456"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-3 bg-primary-container text-on-primary-container px-12 py-5 rounded-lg font-display font-bold uppercase text-sm tracking-widest hover:bg-white hover:text-secondary transition-all"
              >
                Book a Consultation
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </a>
            </div>
          </div>
        </section>
      </main>

      <WhatsAppButton />
      <Footer />
    </>
  );
}
