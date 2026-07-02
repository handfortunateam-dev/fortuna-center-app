import { ChartTooltipProps } from "./types";

export const COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
];

/**
 * Consistent card class matching StatCard dark-mode appearance.
 * `!bg-transparent` overrides HeroUI Card's internal dark background so the
 * card shows the page background through backdrop-blur, identical to StatCard.
 */
export const CARD_CLASS =
  "!bg-transparent border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 shadow-sm dark:shadow-none hover:shadow-xl transition-all duration-500 backdrop-blur-xl group relative";

export function CustomTooltip({ active, payload, label }: ChartTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-divider p-3 rounded-xl shadow-xl">
        <p className="text-xs font-semibold text-default-500 uppercase tracking-wider mb-1">
          {label}
        </p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color || entry.fill }}
            />
            <p className="text-sm font-bold text-default-900">
              {entry.name}: {entry.value}
            </p>
          </div>
        ))}
      </div>
    );
  }
  return null;
}
