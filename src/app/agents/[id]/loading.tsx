import Navbar from "@/components/Navbar";
import { SkeletonPulse, SkeletonText, SkeletonCard } from "@/components/skeletons";

export default function AgentProfileLoading() {
  return (
    <>
      <Navbar />
      <main>
        {/* Agent Profile Header skeleton */}
        <header className="py-24 md:py-32 px-6">
          <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
            {/* Avatar */}
            <SkeletonPulse className="w-32 h-32 rounded-full mb-6" />

            {/* Name */}
            <SkeletonPulse className="h-12 w-64 mb-2" />

            {/* Subtitle */}
            <SkeletonPulse className="h-4 w-32 mb-6" />

            {/* Bio lines */}
            <div className="w-full max-w-2xl mb-8">
              <SkeletonText lines={3} />
            </div>

            {/* Contact info */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
              <SkeletonPulse className="h-4 w-40" />
              <SkeletonPulse className="h-4 w-32" />
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-4 justify-center">
              <SkeletonPulse className="h-12 w-36 rounded-lg" />
              <SkeletonPulse className="h-12 w-36 rounded-lg" />
            </div>
          </div>
        </header>

        {/* Agent Listings skeleton */}
        <section className="bg-surface-container-low py-20 px-6">
          <div className="max-w-[1280px] mx-auto">
            <SkeletonPulse className="h-8 w-56 mb-12" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
