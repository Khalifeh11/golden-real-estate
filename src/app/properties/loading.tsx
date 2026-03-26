import Navbar from "@/components/Navbar";

export default function PropertiesLoading() {
  return (
    <>
      <Navbar />
      <main className="pt-12 pb-24 max-w-[1280px] mx-auto px-6">
        {/* Header skeleton */}
        <div className="mb-12">
          <div className="h-12 w-64 bg-surface-container-high rounded-lg animate-pulse mb-2" />
          <div className="h-5 w-96 bg-surface-container rounded-lg animate-pulse" />
        </div>

        <div className="flex flex-col lg:flex-row gap-10 items-start">
          {/* Sidebar skeleton */}
          <aside className="w-full lg:w-[280px] bg-surface-container-low p-6 rounded-xl space-y-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 w-20 bg-surface-container-high rounded animate-pulse" />
                <div className="h-10 w-full bg-surface-container rounded-lg animate-pulse" />
              </div>
            ))}
          </aside>

          {/* Grid skeleton */}
          <div className="flex-1">
            <div className="h-14 bg-surface-container-low rounded-xl mb-8 animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl overflow-hidden">
                  <div className="aspect-[4/3] bg-surface-container-high animate-pulse" />
                  <div className="p-6 space-y-3">
                    <div className="h-3 w-16 bg-surface-container rounded animate-pulse" />
                    <div className="h-5 w-3/4 bg-surface-container-high rounded animate-pulse" />
                    <div className="h-4 w-1/2 bg-surface-container rounded animate-pulse" />
                    <div className="h-8 w-2/3 bg-surface-container-high rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
