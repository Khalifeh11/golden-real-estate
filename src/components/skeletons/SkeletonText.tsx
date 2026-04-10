import SkeletonPulse from "./SkeletonPulse";

const WIDTH_CYCLE = ["w-full", "w-3/4", "w-3/5"];

export default function SkeletonText({
  lines = 1,
  className = "",
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonPulse
          key={i}
          className={`h-4 ${WIDTH_CYCLE[i % WIDTH_CYCLE.length]}`}
        />
      ))}
    </div>
  );
}
