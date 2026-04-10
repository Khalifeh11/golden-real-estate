import Navbar from "@/components/Navbar";
import { SkeletonPulse, SkeletonText, SkeletonImage, SkeletonCard } from "@/components/skeletons";

export default function PropertyDetailLoading() {
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16 max-w-7xl mx-auto px-4 md:px-8">
        {/* Gallery placeholder */}
        <SkeletonImage className="aspect-[16/9] w-full mb-12 rounded-xl" />

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Left Column */}
          <div className="lg:w-2/3">
            {/* Header */}
            <div className="mb-8">
              {/* Category badge + ref */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <SkeletonPulse className="h-6 w-20 rounded" />
                <SkeletonPulse className="h-4 w-24" />
              </div>

              {/* Title */}
              <SkeletonPulse className="h-12 w-3/4 mb-2" />

              {/* Location */}
              <SkeletonPulse className="h-4 w-48 mb-6" />

              {/* Price */}
              <SkeletonPulse className="h-8 w-40" />
            </div>

            {/* Spec Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-surface-container-low rounded-xl mb-12">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center text-center p-2 gap-2">
                  <SkeletonPulse className="h-6 w-6 rounded" />
                  <SkeletonPulse className="h-3 w-10" />
                  <SkeletonPulse className="h-5 w-16" />
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="mb-12">
              <SkeletonPulse className="h-7 w-36 mb-6" />
              <SkeletonText lines={6} />
            </div>

            {/* Amenities */}
            <div className="mb-12 pt-12 border-t border-outline-variant/20">
              <SkeletonPulse className="h-7 w-52 mb-8" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <SkeletonPulse className="h-6 w-6 rounded shrink-0" />
                    <SkeletonPulse className="h-4 w-32" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <aside className="lg:w-1/3">
            <div className="sticky top-28 space-y-8">
              {/* Agent card skeleton */}
              <div className="bg-surface-container-lowest p-8 rounded-xl shadow-xl shadow-black/5 border border-outline-variant/10">
                <div className="flex items-center gap-4 mb-6">
                  <SkeletonPulse className="w-20 h-20 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2">
                    <SkeletonPulse className="h-5 w-36" />
                    <SkeletonPulse className="h-3 w-24" />
                  </div>
                </div>
                <SkeletonText lines={2} className="mb-8" />
                <div className="grid grid-cols-1 gap-3">
                  <SkeletonPulse className="h-12 w-full rounded-lg" />
                  <SkeletonPulse className="h-12 w-full rounded-lg" />
                </div>
              </div>

              {/* Inquiry form skeleton */}
              <div className="bg-surface-container-lowest p-8 rounded-xl shadow-xl shadow-black/5 border border-outline-variant/10">
                <SkeletonPulse className="h-6 w-32 mb-6" />
                <div className="space-y-4">
                  <SkeletonPulse className="h-10 w-full rounded-lg" />
                  <SkeletonPulse className="h-10 w-full rounded-lg" />
                  <SkeletonPulse className="h-10 w-full rounded-lg" />
                  <SkeletonPulse className="h-24 w-full rounded-lg" />
                  <SkeletonPulse className="h-12 w-full rounded-lg" />
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Similar Properties skeleton */}
        <div className="mt-24 pt-24 border-t border-outline-variant/20">
          <SkeletonPulse className="h-8 w-72 mb-12" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
