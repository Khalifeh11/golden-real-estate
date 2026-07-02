import Image from "next/image";
import Link from "next/link";
import type { Agent } from "@/types";
import { agentFullName, formatWhatsAppUrl } from "@/lib/utils";
import AgentInitials from "@/components/AgentInitials";

interface AgentCardProps {
  agent: Agent;
}

export default function AgentCard({ agent }: AgentCardProps) {
  const fullName = agentFullName(agent.firstName, agent.lastName);

  const header = (
    <div className="flex items-start gap-4 mb-6">
      {agent.photoUrl ? (
        <Image
          src={agent.photoUrl}
          alt={fullName}
          width={80}
          height={80}
          className="w-20 h-20 rounded-full object-cover"
        />
      ) : (
        <AgentInitials firstName={agent.firstName} lastName={agent.lastName} />
      )}
      <div>
        <h3 className="font-display font-bold text-xl transition-colors group-hover:text-primary">
          {fullName}
        </h3>
        <p className="text-primary-container text-sm uppercase tracking-wide">
          Property Advisor
        </p>
        {(agent.phone || agent.email) && (
          <div className="relative z-10 flex items-center gap-2 mt-3">
            {agent.phone && (
              <>
                <a
                  href={formatWhatsAppUrl(agent.phone)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`WhatsApp ${fullName}`}
                  title="WhatsApp"
                  className="flex items-center justify-center w-11 h-11 rounded-full bg-[#25D366] text-white hover:brightness-110 transition-all"
                >
                  <span
                    className="material-symbols-outlined text-xl"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    chat
                  </span>
                </a>
                <a
                  href={`tel:${agent.phone}`}
                  aria-label={`Call ${fullName}`}
                  title="Call"
                  className="flex items-center justify-center w-11 h-11 rounded-full bg-surface-container-high text-on-surface hover:bg-surface-container-highest transition-all border border-outline-variant/30"
                >
                  <span
                    className="material-symbols-outlined text-xl"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    call
                  </span>
                </a>
              </>
            )}
            {agent.email && (
              <a
                href={`mailto:${agent.email}`}
                aria-label={`Email ${fullName}`}
                title="Email"
                className="flex items-center justify-center w-11 h-11 rounded-full bg-surface-container-high text-on-surface hover:bg-surface-container-highest transition-all border border-outline-variant/30"
              >
                <span
                  className="material-symbols-outlined text-xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  mail
                </span>
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="group relative bg-surface-container-lowest p-8 rounded-xl shadow-xl shadow-black/5 border border-outline-variant/10 flex flex-col transition-shadow hover:shadow-2xl">
      {/* Stretched link: covers the whole card so clicking anywhere (except the
          contact icons / View Listings button) opens the agent's listings. It's
          aria-hidden + tabIndex=-1 so it's a mouse convenience only — the visible
          "View Listings" button below owns keyboard focus and the a11y label. */}
      <Link
        href={`/agents/${agent._id}`}
        aria-hidden
        tabIndex={-1}
        className="absolute inset-0 z-0 rounded-xl"
      />

      {header}

      {agent.bio && (
        <p className="text-on-surface-variant text-sm leading-relaxed">
          {agent.bio}
        </p>
      )}

      <div className="relative z-10 mt-auto pt-8">
        <Link
          href={`/agents/${agent._id}`}
          className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-lg font-bold hover:brightness-110 transition-all"
        >
          View Listings
          <span className="material-symbols-outlined text-xl">arrow_forward</span>
        </Link>
      </div>
    </div>
  );
}
