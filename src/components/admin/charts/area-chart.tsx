'use client';

import { useState } from 'react';
import { formatCurrency, formatCurrencyShort } from '@/lib/admin/format';

interface Point {
  date: string;
  revenue: number;
}

function niceCeil(v: number): number {
  if (v <= 0) return 1;
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / p;
  const m = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return m * p;
}

/**
 * Responsive SVG area chart for revenue-over-time. Hover is handled with
 * invisible vertical bands inside the viewBox, so it stays accurate at any
 * rendered width without pixel math.
 */
export function AreaChart({ data }: { data: Point[] }) {
  const [hover, setHover] = useState<number | null>(null);

  const W = 720;
  const H = 260;
  const pad = { l: 56, r: 16, t: 16, b: 28 };
  const iw = W - pad.l - pad.r;
  const ih = H - pad.t - pad.b;
  const n = data.length;

  if (n === 0) {
    return (
      <div className="flex h-[260px] items-center justify-center text-sm text-gray-400">
        No data
      </div>
    );
  }

  const max = Math.max(1, ...data.map((d) => d.revenue));
  const niceMax = niceCeil(max);
  const x = (i: number) => pad.l + (n <= 1 ? iw / 2 : (i / (n - 1)) * iw);
  const y = (v: number) => pad.t + ih - (v / niceMax) * ih;

  const line = data
    .map(
      (d, i) =>
        `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(d.revenue).toFixed(1)}`
    )
    .join(' ');
  const area = `${line} L ${x(n - 1).toFixed(1)} ${(pad.t + ih).toFixed(1)} L ${x(0).toFixed(1)} ${(pad.t + ih).toFixed(1)} Z`;
  const gridVals = [0, 0.25, 0.5, 0.75, 1].map((f) => f * niceMax);

  const bandW = iw / n;
  const labelEvery = Math.ceil(n / 7);

  const active = hover != null ? data[hover] : null;
  const tipX =
    hover != null
      ? Math.min(Math.max(x(hover), pad.l + 62), W - pad.r - 62)
      : 0;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      style={{ height: 'auto' }}
      role="img"
      aria-label="Revenue over time"
    >
      <defs>
        <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7E153A" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#7E153A" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* gridlines + y labels */}
      {gridVals.map((v, i) => (
        <g key={i}>
          <line
            x1={pad.l}
            y1={y(v)}
            x2={W - pad.r}
            y2={y(v)}
            stroke="#f1f1f3"
            strokeWidth={1}
          />
          <text
            x={pad.l - 8}
            y={y(v) + 3}
            textAnchor="end"
            fontSize={10}
            fill="#9ca3af"
          >
            {formatCurrencyShort(v)}
          </text>
        </g>
      ))}

      <path d={area} fill="url(#areaFill)" />
      <path
        d={line}
        fill="none"
        stroke="#7E153A"
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* x labels */}
      {data.map((d, i) =>
        i % labelEvery === 0 || i === n - 1 ? (
          <text
            key={i}
            x={x(i)}
            y={H - 8}
            textAnchor="middle"
            fontSize={10}
            fill="#9ca3af"
          >
            {new Date(d.date).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
            })}
          </text>
        ) : null
      )}

      {/* hover guide + tooltip */}
      {active && hover != null && (
        <g>
          <line
            x1={x(hover)}
            y1={pad.t}
            x2={x(hover)}
            y2={pad.t + ih}
            stroke="#7E153A"
            strokeWidth={1}
            strokeDasharray="3 3"
            opacity={0.5}
          />
          <circle
            cx={x(hover)}
            cy={y(active.revenue)}
            r={4}
            fill="#7E153A"
            stroke="#fff"
            strokeWidth={2}
          />
          <g transform={`translate(${tipX - 62}, ${pad.t + 4})`}>
            <rect
              width={124}
              height={40}
              rx={8}
              fill="#111827"
              opacity={0.92}
            />
            <text
              x={62}
              y={16}
              textAnchor="middle"
              fontSize={10}
              fill="#d1d5db"
            >
              {new Date(active.date).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </text>
            <text
              x={62}
              y={31}
              textAnchor="middle"
              fontSize={12}
              fontWeight={600}
              fill="#fff"
            >
              {formatCurrency(active.revenue)}
            </text>
          </g>
        </g>
      )}

      {/* invisible hover bands */}
      {data.map((_, i) => (
        <rect
          key={i}
          x={x(i) - bandW / 2}
          y={pad.t}
          width={bandW}
          height={ih}
          fill="transparent"
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(null)}
        />
      ))}
    </svg>
  );
}
