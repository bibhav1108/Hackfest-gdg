import React, { useState } from 'react';
import { EXPIRY_HORIZON_POINTS, DISPENSING_VELOCITY_POINTS } from '../../data/initialData';
import { Calendar, ChevronDown, Activity, AlertOctagon } from 'lucide-react';

export const AnalyticsExpiryCharts: React.FC = () => {
  const [selectedRange, setSelectedRange] = useState('Next 12 Months');
  const [hoveredExpiry, setHoveredExpiry] = useState<number | null>(null);
  const [hoveredVelocity, setHoveredVelocity] = useState<number | null>(null);

  // Generate smooth SVG paths for the Expiry curve
  const svgWidth = 460;
  const svgHeight = 90;
  const paddingX = 25;
  const paddingY = 15;

  const maxExpiry = 100;
  const expiryPoints = EXPIRY_HORIZON_POINTS.map((pt, idx) => {
    const x = paddingX + (idx / (EXPIRY_HORIZON_POINTS.length - 1)) * (svgWidth - paddingX * 2);
    const y = svgHeight - paddingY - (pt.count / maxExpiry) * (svgHeight - paddingY * 2);
    return { x, y, ...pt };
  });

  const expiryPathD = expiryPoints.reduce((acc, curr, idx, arr) => {
    if (idx === 0) return `M ${curr.x} ${curr.y}`;
    const prev = arr[idx - 1];
    const cpX = (prev.x + curr.x) / 2;
    return `${acc} C ${cpX} ${prev.y}, ${cpX} ${curr.y}, ${curr.x} ${curr.y}`;
  }, '');

  const expiryAreaD = `${expiryPathD} L ${expiryPoints[expiryPoints.length - 1].x} ${svgHeight - paddingY} L ${expiryPoints[0].x} ${svgHeight - paddingY} Z`;

  // Velocity wave points
  const velocityPoints = DISPENSING_VELOCITY_POINTS.map((pt, idx) => {
    const x = paddingX + (idx / (DISPENSING_VELOCITY_POINTS.length - 1)) * (svgWidth - paddingX * 2);
    const y = svgHeight - paddingY - (pt.value / 100) * (svgHeight - paddingY * 2);
    return { x, y, ...pt };
  });

  const velocityPathD = velocityPoints.reduce((acc, curr, idx, arr) => {
    if (idx === 0) return `M ${curr.x} ${curr.y}`;
    const prev = arr[idx - 1];
    const cpX = (prev.x + curr.x) / 2;
    return `${acc} C ${cpX} ${prev.y}, ${cpX} ${curr.y}, ${curr.x} ${curr.y}`;
  }, '');

  const velocityAreaD = `${velocityPathD} L ${velocityPoints[velocityPoints.length - 1].x} ${svgHeight - paddingY} L ${velocityPoints[0].x} ${svgHeight - paddingY} Z`;

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-[#183149] bg-gradient-to-b from-[#112334] to-[#0d1c2b] p-4 sm:p-5 shadow-sm">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-2 border-b border-[#183149]">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-slate-200 text-sm tracking-wide uppercase">
            Expiry Horizon & Velocity
          </h3>
          <span className="flex h-2 w-2 rounded-full bg-teal-400"></span>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0d1a27] border border-[#183149] text-[11px] text-slate-300">
          <Calendar className="w-3 h-3 text-teal-400" />
          <span>{selectedRange}</span>
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </div>
      </div>

      {/* Chart 1: Expiry Timeline Curve */}
      <div className="mt-3 relative">
        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
          <span className="font-medium text-slate-300 flex items-center gap-1">
            <AlertOctagon className="w-3.5 h-3.5 text-teal-400" />
            Batch Expiration Forecast
          </span>
          {hoveredExpiry !== null ? (
            <span className="font-mono-numbers text-teal-300 font-semibold">
              {EXPIRY_HORIZON_POINTS[hoveredExpiry].month}: {EXPIRY_HORIZON_POINTS[hoveredExpiry].count} items ({EXPIRY_HORIZON_POINTS[hoveredExpiry].risk} Risk)
            </span>
          ) : (
            <span className="text-[10px] text-slate-400">Hover points for batch risk</span>
          )}
        </div>

        <div className="w-full h-24 overflow-hidden">
          <svg className="w-full h-full" viewBox={`0 0 ${svgWidth} ${svgHeight}`} preserveAspectRatio="none">
            <defs>
              <linearGradient id="expiryGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#0f766e" stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {/* Subtle horizontal grid lines */}
            <line x1={paddingX} y1={paddingY} x2={svgWidth - paddingX} y2={paddingY} stroke="#1b3650" strokeDasharray="3 3" />
            <line x1={paddingX} y1={svgHeight / 2} x2={svgWidth - paddingX} y2={svgHeight / 2} stroke="#1b3650" strokeDasharray="3 3" />
            <line x1={paddingX} y1={svgHeight - paddingY} x2={svgWidth - paddingX} y2={svgHeight - paddingY} stroke="#1b3650" />

            {/* Shaded Area */}
            <path d={expiryAreaD} fill="url(#expiryGrad)" />

            {/* Line Curve */}
            <path d={expiryPathD} fill="none" stroke="#2dd4bf" strokeWidth="2.5" />

            {/* Interactive Markers */}
            {expiryPoints.map((pt, idx) => (
              <circle
                key={idx}
                cx={pt.x}
                cy={pt.y}
                r={hoveredExpiry === idx ? 5 : 2.5}
                fill={hoveredExpiry === idx ? '#5eead4' : '#14b8a6'}
                stroke="#0d1f30"
                strokeWidth="1.5"
                onMouseEnter={() => setHoveredExpiry(idx)}
                onMouseLeave={() => setHoveredExpiry(null)}
                className="cursor-pointer transition-all duration-150"
              />
            ))}
          </svg>
        </div>

        {/* Month labels */}
        <div className="flex justify-between text-[9px] text-slate-400 font-mono-numbers px-2">
          {EXPIRY_HORIZON_POINTS.map((pt, i) => (
            <span key={i} className={i % 2 === 0 ? 'inline' : 'hidden sm:inline'}>
              {pt.month}
            </span>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="my-3 border-t border-[#183149]" />

      {/* Chart 2: Dispensing Velocity with Axis Lines */}
      <div className="relative">
        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
          <span className="font-medium text-slate-300 flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-sky-400" />
            Hourly Dispensing Velocity (24h)
          </span>
          {hoveredVelocity !== null ? (
            <span className="font-mono-numbers text-sky-300 font-semibold">
              {DISPENSING_VELOCITY_POINTS[hoveredVelocity].time}: {DISPENSING_VELOCITY_POINTS[hoveredVelocity].value}% load
            </span>
          ) : (
            <span className="text-[10px] text-slate-400">Peak at 18:00 (Evening Rush)</span>
          )}
        </div>

        <div className="flex gap-2 items-center">
          {/* Y Axis scale from screenshot: 100, 75, 50, 25, 0 */}
          <div className="flex flex-col justify-between h-20 text-[9px] font-mono-numbers text-slate-400 select-none py-1">
            <span>100</span>
            <span>75</span>
            <span>50</span>
            <span>25</span>
            <span>00</span>
          </div>

          <div className="flex-1 h-20 overflow-hidden">
            <svg className="w-full h-full" viewBox={`0 0 ${svgWidth} ${svgHeight}`} preserveAspectRatio="none">
              <defs>
                <linearGradient id="velocityGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1={paddingX} y1={paddingY} x2={svgWidth - paddingX} y2={paddingY} stroke="#1b3650" />
              <line x1={paddingX} y1={svgHeight * 0.35} x2={svgWidth - paddingX} y2={svgHeight * 0.35} stroke="#152c42" strokeDasharray="2 2" />
              <line x1={paddingX} y1={svgHeight * 0.65} x2={svgWidth - paddingX} y2={svgHeight * 0.65} stroke="#152c42" strokeDasharray="2 2" />
              <line x1={paddingX} y1={svgHeight - paddingY} x2={svgWidth - paddingX} y2={svgHeight - paddingY} stroke="#1b3650" />

              {/* Shaded Area */}
              <path d={velocityAreaD} fill="url(#velocityGrad)" />

              {/* Velocity Line */}
              <path d={velocityPathD} fill="none" stroke="#38bdf8" strokeWidth="2" />

              {/* Data points */}
              {velocityPoints.map((pt, idx) => (
                <circle
                  key={idx}
                  cx={pt.x}
                  cy={pt.y}
                  r={hoveredVelocity === idx ? 4.5 : 2}
                  fill={hoveredVelocity === idx ? '#7dd3fc' : '#0284c7'}
                  stroke="#0c1825"
                  strokeWidth="1.5"
                  onMouseEnter={() => setHoveredVelocity(idx)}
                  onMouseLeave={() => setHoveredVelocity(null)}
                  className="cursor-pointer transition-all duration-150"
                />
              ))}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
