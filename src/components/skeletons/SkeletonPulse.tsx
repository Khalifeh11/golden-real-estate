export default function SkeletonPulse({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-surface-container-high rounded ${className}`} />
  );
}
