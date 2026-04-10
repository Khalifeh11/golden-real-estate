import Navbar from "@/components/Navbar";
import { SkeletonAgentCard } from "@/components/skeletons";

export default function AgentsLoading() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero skeleton */}
        <header className="py-24 md:py-32 px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="h-14 w-80 bg-surface-container-high rounded-lg animate-pulse mx-auto mb-6" />
            <div className="h-5 w-96 max-w-full bg-surface-container rounded-lg animate-pulse mx-auto" />
          </div>
        </header>

        {/* Agent Grid skeleton */}
        <section className="bg-surface-container-low py-20 px-6">
          <div className="max-w-[1280px] mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonAgentCard key={i} />
              ))}
            </div>
          </div>
        </section>

        {/* CTA skeleton */}
        <section className="py-24 px-6">
          <div className="max-w-[1280px] mx-auto text-center">
            <div className="h-8 w-72 bg-surface-container-high rounded-lg animate-pulse mx-auto mb-8" />
            <div className="h-14 w-40 bg-surface-container rounded-xl animate-pulse mx-auto" />
          </div>
        </section>
      </main>
    </>
  );
}
