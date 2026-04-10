export default function SkeletonImage({ className = "aspect-[4/3]" }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-surface-container-high rounded-xl ${className}`} />
  );
}
