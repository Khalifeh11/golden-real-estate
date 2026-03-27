interface StatsCardProps {
  label: string;
  value: number | string;
  sub?: string;
  highlight?: boolean;
}

export default function StatsCard({ label, value, sub, highlight }: StatsCardProps) {
  return (
    <div className={`rounded-lg border p-5 ${highlight ? "border-amber-300 bg-amber-50" : "border-gray-200 bg-white"}`}>
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${highlight ? "text-amber-700" : "text-gray-900"}`}>
        {value}
      </p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}
