import React from 'react';

interface IdleChartProps {
  // counts[h] = how many GPUs are free during hour h (0-23)
  counts: number[];
  nowHour?: number;
  decorative?: boolean;
}

const W = 480;
const BASE = 160;
const TOP = 34;

// Load curve of idle capacity over the day, in the style of an electricity-grid chart.
const IdleChart: React.FC<IdleChartProps> = ({ counts, nowHour, decorative }) => {
  const max = Math.max(1, ...counts);
  const step = W / 24;

  return (
    <svg
      className="chart"
      viewBox="0 0 480 190"
      role={decorative ? undefined : 'img'}
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : 'Number of GPUs that are free in each hour of the day'}
    >
      <line className="grid" x1="0" x2={W} y1={TOP} y2={TOP} />
      <line className="grid" x1="0" x2={W} y1={(TOP + BASE) / 2} y2={(TOP + BASE) / 2} />
      <line className="grid" x1="0" x2={W} y1={BASE} y2={BASE} />

      {counts.map((c, h) => {
        const height = c === 0 ? 3 : Math.max(6, (c / max) * (BASE - TOP));
        const isNow = h === nowHour;
        return (
          <rect
            key={h}
            className={`bar${c === 0 ? ' zero' : ''}${isNow ? ' now' : ''}`}
            style={{ ['--i' as string]: h }}
            x={h * step + 2.5}
            width={step - 5}
            y={BASE - height}
            height={height}
            rx={2}
          />
        );
      })}

      {!decorative && (
        <>
          <text x="0" y="22">{max} free at peak</text>
          {[0, 6, 12, 18].map((h) => (
            <text key={h} x={h * step + 2} y="180">{String(h).padStart(2, '0')}:00</text>
          ))}
          <text x={W} y="180" textAnchor="end">24:00</text>
          {nowHour !== undefined && (
            <text
              className="nowlabel"
              x={nowHour * step + step / 2}
              y={BASE - (counts[nowHour] === 0 ? 3 : Math.max(6, (counts[nowHour] / max) * (BASE - TOP))) - 6}
              textAnchor="middle"
            >
              Now
            </text>
          )}
        </>
      )}
    </svg>
  );
};

export default IdleChart;
