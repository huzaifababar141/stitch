'use client';

interface Segment {
  label: string;
  value: number;
  color: string;
}

/**
 * Dependency-free SVG donut with a legend. Segments are drawn as stroked
 * circle arcs via stroke-dasharray, rotated to start at 12 o'clock.
 */
export function DonutChart({
  data,
  size = 176,
  thickness = 26,
}: {
  data: Segment[];
  size?: number;
  thickness?: number;
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const r = (size - thickness) / 2;
  const c = size / 2;
  const circ = 2 * Math.PI * r;

  let offset = 0;
  const segments =
    total > 0
      ? data
          .filter((d) => d.value > 0)
          .map((d) => {
            const dash = (d.value / total) * circ;
            const seg = {
              ...d,
              dash,
              dashGap: circ - dash,
              dashOffset: -offset,
            };
            offset += dash;
            return seg;
          })
      : [];

  return (
    <div className="flex flex-wrap items-center gap-6">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={c}
            cy={c}
            r={r}
            fill="none"
            stroke="#f1f1f3"
            strokeWidth={thickness}
          />
          {segments.map((s, i) => (
            <circle
              key={i}
              cx={c}
              cy={c}
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth={thickness}
              strokeDasharray={`${s.dash} ${s.dashGap}`}
              strokeDashoffset={s.dashOffset}
              strokeLinecap="butt"
              transform={`rotate(-90 ${c} ${c})`}
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold text-gray-900">{total}</span>
          <span className="text-xs text-gray-400">Total</span>
        </div>
      </div>

      <ul className="flex-1 space-y-1.5">
        {data.map((d, i) => (
          <li key={i} className="flex items-center gap-2 text-sm">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-sm"
              style={{ backgroundColor: d.color }}
            />
            <span className="flex-1 text-gray-600">{d.label}</span>
            <span className="font-medium text-gray-900">{d.value}</span>
            <span className="w-12 text-right text-xs text-gray-400">
              {total > 0 ? `${Math.round((d.value / total) * 100)}%` : '0%'}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
