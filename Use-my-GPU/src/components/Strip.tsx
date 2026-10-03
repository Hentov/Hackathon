import React from 'react';

interface StripProps {
  from: string;
  to: string;
  labels?: boolean;
}

const toMin = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

// A 24-hour bar. The filled part is the time of day the GPU is free.
const Strip: React.FC<StripProps> = ({ from, to, labels }) => {
  const start = (toMin(from) / 1440) * 100;
  const end = ((to === '23:59' ? 1440 : toMin(to)) / 1440) * 100;
  const width = Math.max(0, end - start);

  return (
    <div>
      <div className="strip" role="img" aria-label={`Free every day from ${from} to ${to}`}>
        <span style={{ left: `${start}%`, width: `${width}%` }} />
      </div>
      {labels && (
        <div className="strip-axis" aria-hidden="true">
          <span>00</span><span>06</span><span>12</span><span>18</span><span>24</span>
        </div>
      )}
    </div>
  );
};

export default Strip;
