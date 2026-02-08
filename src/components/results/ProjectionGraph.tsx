'use client';

import { motion } from 'framer-motion';

interface ProjectionGraphProps {
  currentScore: number;
  targetScore: number;
  targetDate: Date;
}

// Data point colors matching the stress gradient
const POINT_COLORS = ['#e60000', '#ee9363', '#f9ea7c', '#c8f29d'];

/**
 * Get 4 month labels starting from current month (3-letter uppercase)
 */
function getMonthLabels(): string[] {
  const months = [
    'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
    'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
  ];
  const now = new Date();
  return Array.from({ length: 4 }, (_, i) => {
    const m = (now.getMonth() + i) % 12;
    return months[m];
  });
}

/**
 * SVG projection graph — Figma Slide 7
 * 351×226 container, 4 data points, curved line with gradient fill
 */
export function ProjectionGraph({ currentScore, targetScore }: ProjectionGraphProps) {
  const months = getMonthLabels();

  // SVG viewBox dimensions
  const svgW = 351;
  const svgH = 212;

  // Graph plot area
  const plotLeft = 32;
  const plotRight = svgW - 42;
  const plotTop = 40;
  const plotBottom = svgH - 40;
  const plotW = plotRight - plotLeft;
  const plotH = plotBottom - plotTop;

  // Y-axis: 10 to 50
  const yMin = 10;
  const yMax = 50;
  const yLabels = [50, 40, 30, 20, 10];
  const toY = (val: number) => {
    const clamped = Math.max(yMin, Math.min(yMax, val));
    return plotTop + ((yMax - clamped) / (yMax - yMin)) * plotH;
  };

  // X positions for 4 data points (evenly distributed)
  const xPositions = Array.from({ length: 4 }, (_, i) =>
    plotLeft + (i / 3) * plotW
  );

  // Interpolate 4 scores along a curve: current → target
  const scores = [
    currentScore,
    currentScore - (currentScore - targetScore) * 0.35,
    currentScore - (currentScore - targetScore) * 0.7,
    targetScore,
  ];

  // Data points as [x, y]
  const points = scores.map((s, i) => ({
    x: xPositions[i],
    y: toY(s),
    color: POINT_COLORS[i],
    score: Math.round(s),
  }));

  // Build smooth Catmull-Rom spline converted to cubic bezier segments
  // This ensures C1 tangent continuity at every point (no kinks)
  const p = points;
  const catmullRomToBezier = () => {
    const segments: string[] = [`M ${p[0].x} ${p[0].y}`];
    for (let i = 0; i < p.length - 1; i++) {
      const p0 = p[Math.max(i - 1, 0)];
      const p1 = p[i];
      const p2 = p[i + 1];
      const p3 = p[Math.min(i + 2, p.length - 1)];
      // Catmull-Rom to cubic bezier control points
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      segments.push(`C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`);
    }
    return segments.join(' ');
  };
  const curvePath = catmullRomToBezier();

  // Area fill path (close to bottom)
  const areaPath = `${curvePath} L ${p[3].x} ${plotBottom} L ${p[0].x} ${plotBottom} Z`;

  return (
    <div className="w-full max-w-[351px] mx-auto">
      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        className="w-full h-auto"
        style={{ fontFamily: 'Figtree, sans-serif' }}
      >
        <defs>
          {/* Gradient fill under curve: red top → green bottom-right */}
          <linearGradient id="areaGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#e60000" stopOpacity="0.25" />
            <stop offset="40%" stopColor="#ee9363" stopOpacity="0.18" />
            <stop offset="70%" stopColor="#f9ea7c" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#c8f29d" stopOpacity="0.06" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines + Y-axis labels */}
        {yLabels.map((val) => {
          const y = toY(val);
          return (
            <g key={val}>
              <line
                x1={plotLeft}
                y1={y}
                x2={plotRight}
                y2={y}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
              <text
                x={plotLeft - 6}
                y={y}
                textAnchor="end"
                dominantBaseline="middle"
                fill="#919191"
                fontSize="10"
              >
                {val}
              </text>
            </g>
          );
        })}

        {/* Area fill under curve */}
        <motion.path
          d={areaPath}
          fill="url(#areaGrad)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        />

        {/* Curve line */}
        <motion.path
          d={curvePath}
          fill="none"
          stroke="#bbb"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.2, duration: 0.8, ease: 'easeOut' }}
        />

        {/* X-axis labels */}
        {months.map((label, i) => (
          <text
            key={label}
            x={xPositions[i]}
            y={plotBottom + 18}
            textAnchor="middle"
            fill="#919191"
            fontSize="10"
          >
            {label}
          </text>
        ))}

        {/* Legend badge "Dnes" — above first point */}
        <motion.g
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <rect
            x={p[0].x - 24}
            y={p[0].y - 44}
            width={48}
            height={26}
            rx={6}
            fill="#ffd2d2"
          />
          <text
            x={p[0].x}
            y={p[0].y - 27}
            textAnchor="middle"
            fill="#292424"
            fontSize="14"
          >
            Dnes
          </text>
          {/* Arrow pointing down */}
          <polygon
            points={`${p[0].x - 6},${p[0].y - 18} ${p[0].x + 6},${p[0].y - 18} ${p[0].x},${p[0].y - 12}`}
            fill="#ffd2d2"
          />
        </motion.g>

        {/* Legend badge "Tvůj cíl" — above last point */}
        <motion.g
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <rect
            x={p[3].x - 30}
            y={p[3].y - 44}
            width={60}
            height={26}
            rx={6}
            fill="#e6eeeb"
          />
          <text
            x={p[3].x}
            y={p[3].y - 27}
            textAnchor="middle"
            fill="#292424"
            fontSize="14"
          >
            Tvůj cíl
          </text>
          {/* Arrow pointing down */}
          <polygon
            points={`${p[3].x - 6},${p[3].y - 18} ${p[3].x + 6},${p[3].y - 18} ${p[3].x},${p[3].y - 12}`}
            fill="#e6eeeb"
          />
        </motion.g>

        {/* Data point circles — 13px diameter, white fill, colored stroke */}
        {points.map((pt, i) => (
          <motion.circle
            key={i}
            cx={pt.x}
            cy={pt.y}
            r={6.5}
            fill="white"
            stroke={pt.color}
            strokeWidth={2.5}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 + i * 0.15 }}
          />
        ))}
      </svg>
    </div>
  );
}
