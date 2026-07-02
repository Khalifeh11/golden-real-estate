import { cn } from "@/lib/utils";

interface AgentInitialsProps {
  firstName: string;
  lastName: string;
  /** "md" = card avatar (80px), "lg" = profile header (128px). */
  size?: "md" | "lg";
}

export default function AgentInitials({ firstName, lastName, size = "md" }: AgentInitialsProps) {
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`;
  return (
    <div
      className={cn(
        "rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-display font-bold",
        size === "lg" ? "w-32 h-32 text-4xl" : "w-20 h-20 text-2xl",
      )}
    >
      {initials}
    </div>
  );
}
