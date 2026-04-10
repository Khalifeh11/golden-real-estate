import SkeletonPulse from "./SkeletonPulse";
import SkeletonText from "./SkeletonText";

export default function SkeletonAgentCard() {
  return (
    <div className="bg-surface-container-lowest p-8 rounded-xl shadow-xl shadow-black/5 border border-outline-variant/10">
      {/* Header: avatar + name */}
      <div className="flex items-center gap-4 mb-6">
        <SkeletonPulse className="w-20 h-20 rounded-full shrink-0" />
        <div className="flex-1 space-y-2">
          <SkeletonPulse className="h-5 w-36" />
          <SkeletonPulse className="h-3 w-24" />
        </div>
      </div>

      {/* Bio lines */}
      <SkeletonText lines={3} className="mb-8" />

      {/* Action buttons */}
      <div className="grid grid-cols-1 gap-3">
        <SkeletonPulse className="h-12 w-full rounded-lg" />
        <SkeletonPulse className="h-12 w-full rounded-lg" />
      </div>
    </div>
  );
}
