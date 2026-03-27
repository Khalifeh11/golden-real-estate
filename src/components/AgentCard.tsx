import Image from "next/image";
import type { Agent } from "@/types";
import { agentFullName } from "@/lib/utils";

interface AgentCardProps {
  agent: Agent;
}

function AgentInitials({ agent }: { agent: Agent }) {
  const initials = `${agent.firstName.charAt(0)}${agent.lastName.charAt(0)}`;
  return (
    <div className="w-20 h-20 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center text-2xl font-display font-bold">
      {initials}
    </div>
  );
}

function formatWhatsAppUrl(phone: string) {
  const digits = phone.replace(/[^\d+]/g, "");
  return `https://wa.me/${digits.replace("+", "")}`;
}

export default function AgentCard({ agent }: AgentCardProps) {
  return (
    <div className="bg-surface-container-lowest p-8 rounded-xl shadow-xl shadow-black/5 border border-outline-variant/10">
      <div className="flex items-center gap-4 mb-6">
        {agent.photoUrl ? (
          <Image
            src={agent.photoUrl}
            alt={agentFullName(agent.firstName, agent.lastName)}
            width={80}
            height={80}
            className="w-20 h-20 rounded-full object-cover"
          />
        ) : (
          <AgentInitials agent={agent} />
        )}
        <div>
          <h3 className="font-display font-bold text-xl">
            {agentFullName(agent.firstName, agent.lastName)}
          </h3>
          <p className="text-primary-container text-sm uppercase tracking-wide">
            Property Advisor
          </p>
        </div>
      </div>

      {agent.bio && (
        <p className="text-on-surface-variant text-sm mb-8 leading-relaxed">
          {agent.bio}
        </p>
      )}

      <div className="grid grid-cols-1 gap-3">
        {agent.phone && (
          <>
            <a
              href={formatWhatsAppUrl(agent.phone)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-[#25D366] text-white py-3 rounded-lg font-bold hover:brightness-110 transition-all"
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
              className="flex items-center justify-center gap-2 bg-secondary text-white py-3 rounded-lg font-bold hover:brightness-110 transition-all"
            >
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                call
              </span>
              Call Agent
            </a>
          </>
        )}
      </div>
    </div>
  );
}
