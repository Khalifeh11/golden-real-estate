import SkeletonImage from "./SkeletonImage";
import SkeletonPulse from "./SkeletonPulse";

export default function SkeletonCard() {
  return (
    <div>
      {/* Image placeholder */}
      <div className="rounded-xl overflow-hidden mb-6">
        <SkeletonImage />
      </div>

      {/* Text content matching PropertyCard layout */}
      <div className="space-y-3">
        {/* Title + price row */}
        <div className="flex justify-between items-start">
          <SkeletonPulse className="h-6 w-3/4" />
          <SkeletonPulse className="h-6 w-20" />
        </div>

        {/* Specs row: area, beds, baths */}
        <div className="flex items-center gap-6">
          <SkeletonPulse className="h-4 w-16" />
          <SkeletonPulse className="h-4 w-10" />
          <SkeletonPulse className="h-4 w-10" />
        </div>

        {/* Reference number */}
        <SkeletonPulse className="h-3 w-24" />
      </div>
    </div>
  );
}
