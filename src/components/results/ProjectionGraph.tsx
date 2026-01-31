'use client';

import { motion } from 'framer-motion';

interface ProjectionGraphProps {
  /** Current stress score (0-60 display scale) */
  currentScore: number;
  /** Target stress score after program (0-60 display scale) */
  targetScore: number;
  /** Target date */
  targetDate: Date;
}

/**
 * SVG projection graph showing stress reduction over time
 */
export function ProjectionGraph({ currentScore, targetScore, targetDate }: ProjectionGraphProps) {
  // Graph dimensions
  const width = 320;
  const height = 200;
  const padding = { top: 20, right: 20, bottom: 40, left: 40 };

  // Calculate graph area
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  // Y-axis: 0-60 stress scale
  const maxY = 60;
  const yScale = (value: number) => padding.top + graphHeight - (value / maxY) * graphHeight;

  // X-axis: 3 months
  const months = getMonthLabels(new Date(), targetDate);
  const xScale = (index: number) => padding.left + (index / (months.length - 1)) * graphWidth;

  // Calculate curve control points for smooth decay
  const startX = xScale(0);
  const startY = yScale(currentScore);
  const endX = xScale(months.length - 1);
  const endY = yScale(targetScore);

  // Cubic Bezier curve for smooth, natural decay with pronounced curve
  const controlPoint1X = startX + graphWidth * 0.3;
  const controlPoint1Y = startY - (startY - endY) * 0.1; // Slight dip at start
  const controlPoint2X = startX + graphWidth * 0.7;
  const controlPoint2Y = endY - (startY - endY) * 0.1; // Smooth approach to end

  const curvePath = `M ${startX} ${startY} C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${endX} ${endY}`;

  // Area under curve
  const areaPath = `${curvePath} L ${endX} ${yScale(0)} L ${startX} ${yScale(0)} Z`;

  return (
    <div className="w-full mx-auto bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        {/* Grid lines */}
        {[0, 20, 40, 60].map((value) => (
          <g key={value}>
            <line
              x1={padding.left}
              y1={yScale(value)}
              x2={width - padding.right}
              y2={yScale(value)}
              stroke="#e5e7eb"
              strokeDasharray="4"
            />
            <text
              x={padding.left - 8}
              y={yScale(value)}
              textAnchor="end"
              dominantBaseline="middle"
              className="text-xs fill-gray-400"
            >
              {value}
            </text>
          </g>
        ))}

        {/* Area fill */}
        <motion.path
          d={areaPath}
          fill="url(#gradient)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        />

        {/* Gradient definition */}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F9A201" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#F9A201" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Curve line */}
        <motion.path
          d={curvePath}
          fill="none"
          stroke="#F9A201"
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.3, duration: 1, ease: 'easeOut' }}
        />

        {/* Start point - "Dnes" */}
        <motion.g
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
        >
          <circle cx={startX} cy={startY} r="8" fill="#F9A201" />
          <circle cx={startX} cy={startY} r="4" fill="white" />
          <text
            x={startX}
            y={startY - 15}
            textAnchor="middle"
            className="text-xs font-medium fill-gray-700"
          >
            Dnes
          </text>
        </motion.g>

        {/* End point - "Tvuj cil" */}
        <motion.g
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2 }}
        >
          <circle cx={endX} cy={endY} r="8" fill="#10b981" />
          <circle cx={endX} cy={endY} r="4" fill="white" />
          <text
            x={endX}
            y={endY - 15}
            textAnchor="middle"
            className="text-xs font-medium fill-gray-700"
          >
            Tvuj cil
          </text>
        </motion.g>

        {/* X-axis labels */}
        {months.map((month, index) => (
          <text
            key={month}
            x={xScale(index)}
            y={height - padding.bottom + 20}
            textAnchor="middle"
            className="text-xs fill-gray-500"
          >
            {month}
          </text>
        ))}

        {/* Y-axis label */}
        <text
          x={padding.left - 30}
          y={height / 2}
          textAnchor="middle"
          transform={`rotate(-90, ${padding.left - 30}, ${height / 2})`}
          className="text-xs fill-gray-500"
        >
          Uroven stresu
        </text>
      </svg>
    </div>
  );
}

/**
 * Get month labels for X-axis (current month + next 2)
 */
function getMonthLabels(startDate: Date, endDate: Date): string[] {
  const czechMonths = [
    'LED', 'UNO', 'BRE', 'DUB', 'KVE', 'CER',
    'CVC', 'SRP', 'ZAR', 'RIJ', 'LIS', 'PRO'
  ];

  const months: string[] = [];
  const current = new Date(startDate);

  // Add months from start to end (approximately 3 months)
  for (let i = 0; i < 3; i++) {
    const monthLabel = czechMonths[current.getMonth()] || 'N/A';
    months.push(monthLabel);
    current.setMonth(current.getMonth() + 1);
  }

  return months;
}
